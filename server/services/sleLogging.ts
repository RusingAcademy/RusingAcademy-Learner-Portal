/**
 * SLE AI Companion — Structured Logging & Debug Infrastructure
 * 
 * Provides reproducible logging for the scoring pipeline:
 * - Raw LLM scoring output preservation
 * - Zod validation result capture
 * - Prompt versioning and hashing
 * - Pipeline stage timing
 * 
 * @module server/services/sleLogging
 */
import * as crypto from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScoringLogEntry {
  sessionId: string;
  turnSequence: number;
  timestamp: string;
  stage: "stt" | "llm_coach" | "llm_scoring" | "zod_validation" | "tts" | "db_write";
  status: "success" | "failure" | "fallback";
  durationMs: number;
  input?: unknown;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ScoringDebugPayload {
  rawScoringJson: unknown;
  validatorResult: {
    success: boolean;
    errors?: Array<{ path: string; message: string }>;
  };
  ragChunkIds: string[];
  systemPromptHash: string;
  temperature: number;
  maxTokens: number;
  modelId: string;
  promptVersion: string;
}

export interface PipelineMetrics {
  sessionId: string;
  turnSequence: number;
  sttLatencyMs: number;
  llmCoachLatencyMs: number;
  llmScoringLatencyMs: number;
  zodValidationMs: number;
  ttsLatencyMs: number;
  totalLatencyMs: number;
  timestamp: string;
}

// ─── Prompt Versioning ───────────────────────────────────────────────────────

/** Current prompt version — increment on any prompt change */
export const CURRENT_PROMPT_VERSION = "v3.0.0";

/**
 * Compute a SHA-256 hash of the system prompt for reproducibility tracking.
 */
export function hashSystemPrompt(prompt: string): string {
  return crypto.createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

// ─── Structured Logger ───────────────────────────────────────────────────────

const LOG_BUFFER: ScoringLogEntry[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * Log a scoring pipeline event with structured data.
 * Entries are buffered in memory and can be flushed to DB or file.
 */
export function logScoringEvent(entry: ScoringLogEntry): void {
  // Add to buffer
  if (LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
    LOG_BUFFER.shift(); // Drop oldest
  }
  LOG_BUFFER.push(entry);

  // Also emit to console in structured format for server logs
  const level = entry.status === "failure" ? "ERROR" : entry.status === "fallback" ? "WARN" : "INFO";
  const prefix = `[SLE:${level}]`;
  const msg = `${prefix} session=${entry.sessionId} turn=${entry.turnSequence} stage=${entry.stage} status=${entry.status} duration=${entry.durationMs}ms`;
  
  if (entry.status === "failure") {
    console.error(msg, entry.error ? `error=${entry.error}` : "");
  } else {
    console.log(msg);
  }
}

/**
 * Get recent log entries for a session (for debugging).
 */
export function getSessionLogs(sessionId: string): ScoringLogEntry[] {
  return LOG_BUFFER.filter((e) => e.sessionId === sessionId);
}

/**
 * Get all buffered log entries (for batch DB write).
 */
export function flushLogBuffer(): ScoringLogEntry[] {
  const entries = [...LOG_BUFFER];
  LOG_BUFFER.length = 0;
  return entries;
}

// ─── Pipeline Timer ──────────────────────────────────────────────────────────

/**
 * Create a timer for a pipeline stage.
 * Returns start/stop functions and captures duration.
 */
export function createPipelineTimer(
  sessionId: string,
  turnSequence: number,
  stage: ScoringLogEntry["stage"]
) {
  const startTime = Date.now();
  
  return {
    success(output?: unknown, metadata?: Record<string, unknown>) {
      const durationMs = Date.now() - startTime;
      logScoringEvent({
        sessionId,
        turnSequence,
        timestamp: new Date().toISOString(),
        stage,
        status: "success",
        durationMs,
        output,
        metadata,
      });
      return durationMs;
    },
    failure(error: unknown) {
      const durationMs = Date.now() - startTime;
      logScoringEvent({
        sessionId,
        turnSequence,
        timestamp: new Date().toISOString(),
        stage,
        status: "failure",
        durationMs,
        error: error instanceof Error ? error.message : String(error),
      });
      return durationMs;
    },
    fallback(reason: string, output?: unknown) {
      const durationMs = Date.now() - startTime;
      logScoringEvent({
        sessionId,
        turnSequence,
        timestamp: new Date().toISOString(),
        stage,
        status: "fallback",
        durationMs,
        output,
        metadata: { reason },
      });
      return durationMs;
    },
  };
}

// ─── Debug Payload Builder ───────────────────────────────────────────────────

/**
 * Build a complete debug payload for an interaction log entry.
 * This is stored in the sle_interaction_logs table for full reproducibility.
 */
export function buildDebugPayload(params: {
  rawScoringJson: unknown;
  zodResult: { success: boolean; error?: { issues: Array<{ path: (string | number)[]; message: string }> } };
  ragChunkIds?: string[];
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  modelId?: string;
}): ScoringDebugPayload {
  return {
    rawScoringJson: params.rawScoringJson,
    validatorResult: {
      success: params.zodResult.success,
      errors: params.zodResult.error?.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    },
    ragChunkIds: params.ragChunkIds ?? [],
    systemPromptHash: hashSystemPrompt(params.systemPrompt),
    temperature: params.temperature ?? 0.7,
    maxTokens: params.maxTokens ?? 1024,
    modelId: params.modelId ?? "gpt-4.1-mini",
    promptVersion: CURRENT_PROMPT_VERSION,
  };
}

// ─── Scoring Anomaly Detection ───────────────────────────────────────────────

/**
 * Check if a scoring result is anomalous (likely pipeline bug).
 * Returns true if the score pattern suggests a validation failure.
 */
export function isAnomalousScore(
  score: number,
  criterionScores: Record<string, number>
): { anomalous: boolean; reason?: string } {
  // Check for all-zero scores (classic Zod validation failure)
  const allZero = Object.values(criterionScores).every((s) => s === 0);
  if (allZero && score === 0) {
    return { anomalous: true, reason: "All criterion scores are 0 — likely Zod validation failure" };
  }

  // Check for implausible score distribution
  const values = Object.values(criterionScores);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg < 5 && score > 0) {
    return { anomalous: true, reason: `Average criterion score (${avg.toFixed(1)}) is implausibly low` };
  }

  // Check for score outside valid range
  if (score < 0 || score > 100) {
    return { anomalous: true, reason: `Score ${score} is outside valid range [0, 100]` };
  }

  return { anomalous: false };
}
