/**
 * SLE Adaptive Router Service
 *
 * Provides intelligent scenario selection, progressive difficulty adjustment,
 * and mode-specific behavior for the SLE AI Companion.
 *
 * Key features:
 * 1. Weighted scenario selection (level proximity, topic diversity, freshness)
 * 2. Progressive difficulty within a session (escalate/de-escalate based on performance)
 * 3. Exam Mode vs Training Mode enforcement
 * 4. TTS audio fallback strategy
 *
 * @module server/services/sleAdaptiveRouter
 */

import {
  selectScenario,
  selectQuestions,
  getDataset,
  type Scenario,
  type Question,
  type ExamPhase,
} from "./sleDatasetService";
import { normalizeCriterionScores } from "./sleScoringService";
import { CANONICAL_CRITERIA_KEYS, type CanonicalCriterionKey } from "./sleScoringRubric";

// ─── Types ───────────────────────────────────────────────────

export type SessionMode = "training" | "exam_simulation" | "micro_learning";

export interface AdaptiveConfig {
  language: "FR" | "EN";
  targetLevel: "A" | "B" | "C";
  mode: SessionMode;
  /** Topic domains to focus on (empty = all) */
  topicPreferences: string[];
  /** Scenario IDs already used in recent sessions (for freshness) */
  recentScenarioIds: string[];
}

export interface DifficultyState {
  /** Current effective level (may differ from targetLevel based on performance) */
  effectiveLevel: "A" | "B" | "C";
  /** Number of consecutive strong performances (score >= 70) */
  consecutiveStrong: number;
  /** Number of consecutive weak performances (score < 40) */
  consecutiveWeak: number;
  /** Rolling scores from this session */
  sessionScores: number[];
}

export interface AdaptiveScenarioResult {
  scenario: Scenario | null;
  questions: Question[];
  /** Why this scenario was selected */
  selectionReason: string;
  /** Current difficulty state */
  difficulty: DifficultyState;
}

export interface ModeConfig {
  /** Whether to show instant corrections during the session */
  showInstantCorrections: boolean;
  /** Whether to show per-turn feedback */
  showTurnFeedback: boolean;
  /** Whether to show the final report */
  showFinalReport: boolean;
  /** Maximum turns before auto-ending */
  maxTurns: number;
  /** Whether to use progressive difficulty */
  useProgressiveDifficulty: boolean;
  /** Timer enforcement (exam mode has strict timing) */
  enforceTimer: boolean;
  /** Timer duration in seconds per phase (0 = no limit) */
  timerSeconds: number;
}

// ─── Mode Configuration ──────────────────────────────────────

const MODE_CONFIGS: Record<SessionMode, ModeConfig> = {
  training: {
    showInstantCorrections: true,
    showTurnFeedback: true,
    showFinalReport: true,
    maxTurns: 30,
    useProgressiveDifficulty: true,
    enforceTimer: false,
    timerSeconds: 0,
  },
  exam_simulation: {
    showInstantCorrections: false,
    showTurnFeedback: false,
    showFinalReport: true,
    maxTurns: 20,
    useProgressiveDifficulty: false,
    enforceTimer: true,
    timerSeconds: 600, // 10 minutes per phase
  },
  micro_learning: {
    showInstantCorrections: true,
    showTurnFeedback: true,
    showFinalReport: true,
    maxTurns: 8,
    useProgressiveDifficulty: false,
    enforceTimer: false,
    timerSeconds: 0,
  },
};

/**
 * Get the mode configuration for a given session mode.
 */
export function getModeConfig(mode: SessionMode): ModeConfig {
  return MODE_CONFIGS[mode];
}

// ─── Adaptive Scenario Selection ─────────────────────────────

/**
 * Select the best scenario for the current session context.
 *
 * Selection strategy:
 * 1. Filter by language and effective level
 * 2. Penalize recently used scenarios (freshness)
 * 3. Boost scenarios matching topic preferences
 * 4. Boost scenarios in the B→C transition zone if target is B or C
 * 5. Randomize within the top candidates
 */
export function selectAdaptiveScenario(
  config: AdaptiveConfig,
  difficulty: DifficultyState,
  usedInSession: string[] = []
): AdaptiveScenarioResult {
  const ds = getDataset();
  const effectiveLevel = difficulty.effectiveLevel;

  // Get all scenarios for the language
  const allScenarios = ds.scenarios.filter(
    (s) => s.language === config.language
  );

  if (allScenarios.length === 0) {
    return {
      scenario: null,
      questions: [],
      selectionReason: "No scenarios available for this language",
      difficulty,
    };
  }

  // Score each scenario
  const scored = allScenarios.map((s) => {
    let score = 0;

    // Level match (highest weight)
    if (s.level_target === effectiveLevel) {
      score += 100;
    } else if (
      // Adjacent level bonus (for progressive difficulty)
      (effectiveLevel === "B" && s.level_target === "C") ||
      (effectiveLevel === "C" && s.level_target === "B")
    ) {
      score += 60; // B→C transition zone
    } else if (
      (effectiveLevel === "A" && s.level_target === "B") ||
      (effectiveLevel === "B" && s.level_target === "A")
    ) {
      score += 40;
    }

    // Freshness penalty
    if (usedInSession.includes(s.id)) {
      score -= 200; // Strong penalty for same-session reuse
    } else if (config.recentScenarioIds.includes(s.id)) {
      score -= 50; // Moderate penalty for recently used
    }

    // Topic preference boost
    if (config.topicPreferences.length > 0) {
      if (config.topicPreferences.includes(s.topic_domain)) {
        score += 30;
      }
    }

    // B→C transition zone boost (surpondération spec requirement)
    if (
      (config.targetLevel === "B" || config.targetLevel === "C") &&
      s.level_target === "B" &&
      s.phase === "2"
    ) {
      score += 20; // Boost B-level Phase 2 scenarios (narrative/explanatory)
    }
    if (
      config.targetLevel === "C" &&
      s.level_target === "C" &&
      s.phase === "3"
    ) {
      score += 15; // Boost C-level Phase 3 scenarios (opinion/hypothetical)
    }

    // Add small random factor for variety
    score += Math.random() * 10;

    return { scenario: s, score };
  });

  // Sort by score descending and pick the best
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  // Select questions for the scenario's phase
  const phase = (best.scenario.phase || "1") as ExamPhase;
  const questions = selectQuestions(
    config.language,
    phase,
    5,
    usedInSession
  );

  // Build selection reason
  const reason = buildSelectionReason(best.scenario, effectiveLevel, config);

  return {
    scenario: best.scenario,
    questions,
    selectionReason: reason,
    difficulty,
  };
}

function buildSelectionReason(
  scenario: Scenario,
  effectiveLevel: string,
  config: AdaptiveConfig
): string {
  const parts: string[] = [];
  parts.push(`Level: ${scenario.level_target} (effective: ${effectiveLevel})`);
  parts.push(`Topic: ${scenario.topic_domain}`);
  parts.push(`Phase: ${scenario.phase}`);
  if (config.topicPreferences.includes(scenario.topic_domain)) {
    parts.push("(matches topic preference)");
  }
  return parts.join(" | ");
}

// ─── Progressive Difficulty ──────────────────────────────────

/**
 * Create the initial difficulty state for a new session.
 */
export function createDifficultyState(
  targetLevel: "A" | "B" | "C"
): DifficultyState {
  return {
    effectiveLevel: targetLevel,
    consecutiveStrong: 0,
    consecutiveWeak: 0,
    sessionScores: [],
  };
}

/**
 * Update the difficulty state based on the latest turn score.
 *
 * Escalation rules:
 * - 3 consecutive scores >= 70: escalate one level (A→B, B→C)
 * - 3 consecutive scores < 40: de-escalate one level (C→B, B→A)
 * - Otherwise: maintain current level
 *
 * Never escalates above C or de-escalates below A.
 * Only applies in training mode (exam mode keeps fixed level).
 */
export function updateDifficulty(
  state: DifficultyState,
  turnScore: number,
  mode: SessionMode
): DifficultyState {
  const updated = { ...state };
  updated.sessionScores.push(turnScore);

  // Only adjust in training mode
  if (mode !== "training") {
    return updated;
  }

  // Track consecutive performance
  if (turnScore >= 70) {
    updated.consecutiveStrong++;
    updated.consecutiveWeak = 0;
  } else if (turnScore < 40) {
    updated.consecutiveWeak++;
    updated.consecutiveStrong = 0;
  } else {
    // Middle range — reset both counters
    updated.consecutiveStrong = 0;
    updated.consecutiveWeak = 0;
  }

  // Escalation
  if (updated.consecutiveStrong >= 3) {
    if (updated.effectiveLevel === "A") {
      updated.effectiveLevel = "B";
    } else if (updated.effectiveLevel === "B") {
      updated.effectiveLevel = "C";
    }
    updated.consecutiveStrong = 0; // Reset after escalation
  }

  // De-escalation
  if (updated.consecutiveWeak >= 3) {
    if (updated.effectiveLevel === "C") {
      updated.effectiveLevel = "B";
    } else if (updated.effectiveLevel === "B") {
      updated.effectiveLevel = "A";
    }
    updated.consecutiveWeak = 0; // Reset after de-escalation
  }

  return updated;
}

// ─── TTS Audio Fallback ──────────────────────────────────────

export interface TTSResult {
  success: boolean;
  audioUrl?: string;
  /** Fallback text to display if TTS fails */
  fallbackText?: string;
  /** Whether the client should show a retry button */
  showRetry: boolean;
  /** Error message for logging */
  error?: string;
}

/**
 * Wrap a TTS call with graceful fallback.
 *
 * Strategy:
 * 1. Attempt TTS generation
 * 2. If it fails, return the text with a retry flag
 * 3. Never leave the user in silence
 *
 * @param ttsCall - The async function that generates TTS audio
 * @param text - The text that was being converted to speech
 */
export async function withTTSFallback(
  ttsCall: () => Promise<string | null>,
  text: string
): Promise<TTSResult> {
  try {
    const audioUrl = await ttsCall();
    if (audioUrl) {
      return {
        success: true,
        audioUrl,
        showRetry: false,
      };
    }
    // TTS returned null/empty — fallback
    return {
      success: false,
      fallbackText: text,
      showRetry: true,
      error: "TTS returned empty audio URL",
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[SLE TTS Fallback] TTS failed: ${errorMsg}`);
    return {
      success: false,
      fallbackText: text,
      showRetry: true,
      error: errorMsg,
    };
  }
}

// ─── Feedback Formatting ─────────────────────────────────────

export interface FormattedFeedback {
  /** Whether to show this feedback to the user (based on mode) */
  visible: boolean;
  /** The feedback text */
  text: string;
  /** Detected errors with corrections */
  corrections: Array<{
    error: string;
    correction: string;
    explanation: string;
  }>;
  /** Drill suggestions for weak areas */
  drillSuggestions: string[];
  /** Overall encouragement message */
  encouragement: string;
}

/**
 * Format feedback based on the session mode.
 *
 * - Training mode: full feedback with corrections and drills
 * - Exam mode: no feedback (stored for final report only)
 * - Micro-learning: compact feedback with key correction only
 */
export function formatFeedback(
  mode: SessionMode,
  rawFeedback: string,
  corrections: string[],
  suggestions: string[],
  language: "FR" | "EN"
): FormattedFeedback {
  const modeConfig = getModeConfig(mode);

  if (!modeConfig.showTurnFeedback) {
    // Exam mode — suppress all feedback
    return {
      visible: false,
      text: "",
      corrections: [],
      drillSuggestions: [],
      encouragement: "",
    };
  }

  // Format corrections
  const formattedCorrections = corrections.map((c) => {
    // Try to parse "pattern → correction" format
    const arrowMatch = c.match(/^(.+?)→(.+?)(?:\n([\s\S]+))?$/);
    if (arrowMatch) {
      return {
        error: arrowMatch[1].trim(),
        correction: arrowMatch[2].trim(),
        explanation: arrowMatch[3]?.trim() || "",
      };
    }
    return { error: c, correction: "", explanation: "" };
  });

  // Limit for micro-learning
  const maxCorrections = mode === "micro_learning" ? 1 : 5;
  const maxSuggestions = mode === "micro_learning" ? 1 : 3;

  const encouragement = language === "FR"
    ? "Continue comme ça! Chaque pratique te rapproche de ton objectif."
    : "Keep it up! Every practice session brings you closer to your goal.";

  return {
    visible: true,
    text: rawFeedback,
    corrections: formattedCorrections.slice(0, maxCorrections),
    drillSuggestions: suggestions.slice(0, maxSuggestions),
    encouragement,
  };
}

// ─── Weak Area Analysis ──────────────────────────────────────

/**
 * Analyze criterion scores to identify weak areas for targeted drilling.
 * Returns criteria sorted by weakness (lowest score first).
 */
export function identifyWeakAreas(
  criterionScores: Record<string, number>,
  targetLevel: "A" | "B" | "C"
): Array<{
  criterion: CanonicalCriterionKey;
  score: number;
  gap: number;
  priority: "critical" | "moderate" | "minor";
}> {
  const normalized = normalizeCriterionScores(criterionScores);
  const thresholds: Record<string, number> = { A: 36, B: 55, C: 75 };
  const passThreshold = thresholds[targetLevel] ?? 55;

  const weakAreas = CANONICAL_CRITERIA_KEYS.map((key) => {
    const score = normalized[key];
    const gap = passThreshold - score;
    let priority: "critical" | "moderate" | "minor";
    if (gap > 30) {
      priority = "critical";
    } else if (gap > 10) {
      priority = "moderate";
    } else {
      priority = "minor";
    }
    return { criterion: key, score, gap, priority };
  });

  // Sort by gap descending (weakest first)
  weakAreas.sort((a, b) => b.gap - a.gap);

  // Only return areas that are below the pass threshold
  return weakAreas.filter((w) => w.gap > 0);
}

// ─── Session Summary Builder ─────────────────────────────────

export interface AdaptiveSessionSummary {
  /** Overall session performance */
  overallScore: number;
  /** Level achieved */
  levelAchieved: string;
  /** Whether the target level was met */
  targetMet: boolean;
  /** Performance trend across the session */
  trend: "improving" | "stable" | "declining";
  /** Weak areas identified */
  weakAreas: Array<{ criterion: string; score: number; priority: string }>;
  /** Recommended next steps */
  recommendations: string[];
  /** Difficulty adjustments made during the session */
  difficultyHistory: Array<{ turn: number; level: string }>;
}

/**
 * Build a comprehensive session summary with adaptive insights.
 */
export function buildAdaptiveSessionSummary(
  difficulty: DifficultyState,
  targetLevel: "A" | "B" | "C",
  finalCriterionScores: Record<string, number>,
  language: "FR" | "EN"
): AdaptiveSessionSummary {
  const normalized = normalizeCriterionScores(finalCriterionScores);
  const scores = Object.values(normalized);
  const overallScore = Math.round(
    scores.reduce((a, b) => a + b, 0) / scores.length
  );

  const thresholds: Record<string, number> = { A: 36, B: 55, C: 75 };
  const passThreshold = thresholds[targetLevel] ?? 55;
  const targetMet = overallScore >= passThreshold;

  let levelAchieved = "X";
  if (overallScore >= 75) levelAchieved = "C";
  else if (overallScore >= 55) levelAchieved = "B";
  else if (overallScore >= 36) levelAchieved = "A";

  // Determine trend from session scores
  const sessionScores = difficulty.sessionScores;
  let trend: "improving" | "stable" | "declining" = "stable";
  if (sessionScores.length >= 3) {
    const firstHalf = sessionScores.slice(0, Math.floor(sessionScores.length / 2));
    const secondHalf = sessionScores.slice(Math.floor(sessionScores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (secondAvg - firstAvg > 5) trend = "improving";
    else if (firstAvg - secondAvg > 5) trend = "declining";
  }

  const weakAreas = identifyWeakAreas(finalCriterionScores, targetLevel);

  // Generate recommendations
  const recommendations: string[] = [];
  const isFR = language === "FR";

  if (!targetMet) {
    recommendations.push(
      isFR
        ? `Votre score global (${overallScore}/100) est en dessous du seuil ${targetLevel} (${passThreshold}/100). Continuez la pratique régulière.`
        : `Your overall score (${overallScore}/100) is below the ${targetLevel} threshold (${passThreshold}/100). Continue regular practice.`
    );
  }

  for (const weak of weakAreas.slice(0, 3)) {
    if (weak.priority === "critical") {
      recommendations.push(
        isFR
          ? `Priorité critique: ${weak.criterion} (${weak.score}/100). Faites des exercices ciblés quotidiennement.`
          : `Critical priority: ${weak.criterion} (${weak.score}/100). Do targeted exercises daily.`
      );
    } else if (weak.priority === "moderate") {
      recommendations.push(
        isFR
          ? `À améliorer: ${weak.criterion} (${weak.score}/100). Intégrez des exercices dans votre routine.`
          : `Needs improvement: ${weak.criterion} (${weak.score}/100). Integrate exercises into your routine.`
      );
    }
  }

  if (trend === "improving") {
    recommendations.push(
      isFR
        ? "Tendance positive! Votre performance s'améliore au fil de la session."
        : "Positive trend! Your performance is improving throughout the session."
    );
  } else if (trend === "declining") {
    recommendations.push(
      isFR
        ? "Fatigue détectée. Essayez des sessions plus courtes et fréquentes."
        : "Fatigue detected. Try shorter, more frequent sessions."
    );
  }

  if (targetMet) {
    recommendations.push(
      isFR
        ? `Excellent! Vous atteignez le niveau ${targetLevel}. Envisagez de viser le niveau supérieur.`
        : `Excellent! You're meeting Level ${targetLevel}. Consider aiming for the next level.`
    );
  }

  return {
    overallScore,
    levelAchieved,
    targetMet,
    trend,
    weakAreas: weakAreas.map((w) => ({
      criterion: w.criterion,
      score: w.score,
      priority: w.priority,
    })),
    recommendations,
    difficultyHistory: [], // Populated by the orchestrator
  };
}
