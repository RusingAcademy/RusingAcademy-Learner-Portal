/**
 * AI Pipeline Monitor
 * 
 * Tracks the full AI pipeline: audio capture → ASR (Whisper) → scoring (LLM) → feedback.
 * Records latency, failure rate, and user satisfaction for each stage.
 * 
 * Stores metrics in-memory with periodic flush to database.
 */
import { structuredLog, startTimer } from "../structuredLogger";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export type PipelineStage = "transcription" | "evaluation" | "coaching_response" | "tts_synthesis";

export interface PipelineMetric {
  stage: PipelineStage;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
  userId?: number;
  sessionId?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface PipelineStats {
  stage: PipelineStage;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  failureRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  maxLatencyMs: number;
  lastError?: string;
  lastErrorAt?: number;
}

// ============================================================================
// IN-MEMORY METRICS BUFFER
// ============================================================================

const METRICS_BUFFER: PipelineMetric[] = [];
const MAX_BUFFER_SIZE = 1000;
const FLUSH_INTERVAL_MS = 60_000; // Flush every minute

// ============================================================================
// RECORDING
// ============================================================================

/**
 * Record a pipeline metric.
 */
export function recordPipelineMetric(metric: PipelineMetric): void {
  METRICS_BUFFER.push(metric);

  // Log to structured logger
  if (!metric.success) {
    structuredLog("error", "ai-pipeline", `${metric.stage} failed`, {
      durationMs: metric.durationMs,
      error: metric.errorMessage,
      userId: metric.userId,
      sessionId: metric.sessionId,
    });
  } else {
    structuredLog("info", "ai-pipeline", `${metric.stage} completed`, {
      durationMs: metric.durationMs,
      userId: metric.userId,
    });
  }

  // Trim buffer if too large
  if (METRICS_BUFFER.length > MAX_BUFFER_SIZE) {
    METRICS_BUFFER.splice(0, METRICS_BUFFER.length - MAX_BUFFER_SIZE);
  }
}

/**
 * Create a pipeline stage tracker.
 * Returns start/end functions to measure latency and record success/failure.
 */
export function trackPipelineStage(
  stage: PipelineStage,
  userId?: number,
  sessionId?: string
) {
  const timer = startTimer("ai-pipeline", stage);
  const startTime = Date.now();

  return {
    success: (metadata?: Record<string, any>) => {
      const durationMs = timer(metadata);
      recordPipelineMetric({
        stage,
        durationMs,
        success: true,
        userId,
        sessionId,
        metadata,
        timestamp: startTime,
      });
      return durationMs;
    },
    failure: (error: unknown, metadata?: Record<string, any>) => {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      recordPipelineMetric({
        stage,
        durationMs,
        success: false,
        errorMessage,
        userId,
        sessionId,
        metadata,
        timestamp: startTime,
      });
      return durationMs;
    },
  };
}

// ============================================================================
// STATS COMPUTATION
// ============================================================================

/**
 * Compute stats for a specific pipeline stage from the in-memory buffer.
 * Optionally filter by time window (default: last 1 hour).
 */
export function getStageStats(
  stage: PipelineStage,
  windowMs: number = 3_600_000
): PipelineStats {
  const cutoff = Date.now() - windowMs;
  const stageMetrics = METRICS_BUFFER.filter(
    (m) => m.stage === stage && m.timestamp >= cutoff
  );

  if (stageMetrics.length === 0) {
    return {
      stage,
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      failureRate: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      maxLatencyMs: 0,
    };
  }

  const successMetrics = stageMetrics.filter((m) => m.success);
  const failureMetrics = stageMetrics.filter((m) => !m.success);
  const latencies = stageMetrics.map((m) => m.durationMs).sort((a, b) => a - b);

  const lastFailure = failureMetrics.length > 0
    ? failureMetrics[failureMetrics.length - 1]
    : undefined;

  return {
    stage,
    totalCalls: stageMetrics.length,
    successCount: successMetrics.length,
    failureCount: failureMetrics.length,
    failureRate: failureMetrics.length / stageMetrics.length,
    avgLatencyMs: Math.round(
      latencies.reduce((sum, l) => sum + l, 0) / latencies.length
    ),
    p95LatencyMs: latencies[Math.floor(latencies.length * 0.95)] || 0,
    maxLatencyMs: latencies[latencies.length - 1] || 0,
    lastError: lastFailure?.errorMessage,
    lastErrorAt: lastFailure?.timestamp,
  };
}

/**
 * Get stats for all pipeline stages.
 */
export function getAllPipelineStats(windowMs?: number): PipelineStats[] {
  const stages: PipelineStage[] = [
    "transcription",
    "evaluation",
    "coaching_response",
    "tts_synthesis",
  ];
  return stages.map((stage) => getStageStats(stage, windowMs));
}

/**
 * Get overall pipeline health summary.
 */
export function getPipelineHealth(): {
  status: "healthy" | "degraded" | "critical";
  overallFailureRate: number;
  avgEndToEndLatencyMs: number;
  stageStats: PipelineStats[];
  alerts: string[];
} {
  const stats = getAllPipelineStats();
  const alerts: string[] = [];

  // Check for high failure rates
  for (const s of stats) {
    if (s.totalCalls > 0 && s.failureRate > 0.2) {
      alerts.push(`${s.stage}: High failure rate (${(s.failureRate * 100).toFixed(1)}%)`);
    }
    if (s.p95LatencyMs > 15000) {
      alerts.push(`${s.stage}: High p95 latency (${s.p95LatencyMs}ms)`);
    }
  }

  const totalCalls = stats.reduce((sum, s) => sum + s.totalCalls, 0);
  const totalFailures = stats.reduce((sum, s) => sum + s.failureCount, 0);
  const overallFailureRate = totalCalls > 0 ? totalFailures / totalCalls : 0;

  const avgEndToEndLatencyMs = Math.round(
    stats.reduce((sum, s) => sum + s.avgLatencyMs, 0)
  );

  let status: "healthy" | "degraded" | "critical" = "healthy";
  if (overallFailureRate > 0.3 || alerts.length > 2) {
    status = "critical";
  } else if (overallFailureRate > 0.1 || alerts.length > 0) {
    status = "degraded";
  }

  return {
    status,
    overallFailureRate,
    avgEndToEndLatencyMs,
    stageStats: stats,
    alerts,
  };
}

// ============================================================================
// DATABASE PERSISTENCE (for historical analytics)
// ============================================================================

/**
 * Flush buffered metrics to the ai_pipeline_metrics table.
 * Called periodically or on demand.
 */
export async function flushMetricsToDb(): Promise<number> {
  const db = await getDb();
  if (!db || METRICS_BUFFER.length === 0) return 0;

  const batch = METRICS_BUFFER.splice(0, Math.min(METRICS_BUFFER.length, 100));

  try {
    for (const m of batch) {
      await db.execute(sql`
        INSERT INTO ai_pipeline_metrics (stage, durationMs, success, errorMessage, userId, sessionId, metadata, recordedAt)
        VALUES (
          ${m.stage},
          ${m.durationMs},
          ${m.success ? 1 : 0},
          ${m.errorMessage || null},
          ${m.userId || null},
          ${m.sessionId || null},
          ${m.metadata ? JSON.stringify(m.metadata) : null},
          FROM_UNIXTIME(${m.timestamp / 1000})
        )
      `);
    }
    structuredLog("info", "ai-pipeline", `Flushed ${batch.length} metrics to database`);
    return batch.length;
  } catch (error) {
    // Put metrics back in buffer on failure
    METRICS_BUFFER.unshift(...batch);
    structuredLog("error", "ai-pipeline", "Failed to flush metrics to database", {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

// Start periodic flush
setInterval(() => {
  flushMetricsToDb().catch(() => {});
}, FLUSH_INTERVAL_MS);
