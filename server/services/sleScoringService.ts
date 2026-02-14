/**
 * SLE Scoring Service v2
 * Implements the grading logic for the SLE AI Companion.
 * Uses the dataset's rubrics and grading rules to compute scores.
 *
 * v2 FIX: Added normalization layer to handle legacy camelCase keys
 * and ensure all criterion scores use canonical snake_case keys
 * matching grading_logic.jsonl criteria_weights.
 *
 * CANONICAL CRITERIA (7):
 *   grammar, vocabulary, fluency, pronunciation, comprehension, interaction, logical_connectors
 */

import {
  computeCompositeScore,
  getRubrics,
  getFeedbackTemplates,
  getCommonErrors,
  type Rubric,
  type FeedbackTemplate,
  type CommonError,
} from "./sleDatasetService";

import { CANONICAL_CRITERIA_KEYS, type CanonicalCriterionKey } from "./sleScoringRubric";

// ─── Types ───────────────────────────────────────────────────

export interface CriterionScore {
  criterion: CanonicalCriterionKey;
  score: number; // 0-100
  level: string; // A, B, C, X
  feedback: string;
}

export interface SessionScore {
  sessionId: number;
  overallScore: number;
  level: string;
  criterionScores: CriterionScore[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  errorsDetected: DetectedError[];
}

export interface DetectedError {
  errorId: string;
  pattern: string;
  correction: string;
  feedback: string;
  category: string;
}

// ─── Normalization ──────────────────────────────────────────

/**
 * Map of legacy camelCase keys → canonical snake_case keys.
 * This handles backward compatibility with v1 scoring responses
 * that used different naming conventions.
 */
const LEGACY_KEY_MAP: Record<string, CanonicalCriterionKey> = {
  // v1 sleScoringRubric.ts (4-criteria model)
  grammaticalAccuracy: "grammar",
  vocabularyRegister: "vocabulary",
  coherenceOrganization: "logical_connectors",
  taskCompletion: "comprehension",

  // v1 sleConversationService.ts Zod schema (7-criteria model)
  languageFunctions: "fluency",
  lexicalRichness: "vocabulary",
  grammaticalComplexity: "grammar",
  coherenceCohesion: "logical_connectors",
  nuancePrecision: "comprehension",
  logicalConnectors: "logical_connectors",

  // Already canonical (no-op)
  grammar: "grammar",
  vocabulary: "vocabulary",
  fluency: "fluency",
  pronunciation: "pronunciation",
  comprehension: "comprehension",
  interaction: "interaction",
  logical_connectors: "logical_connectors",
};

/**
 * Normalize criterion scores from any naming convention to canonical keys.
 * Handles camelCase, snake_case, and legacy key names.
 * Returns a Record with all 7 canonical keys (missing ones default to 0).
 */
export function normalizeCriterionScores(
  raw: Record<string, number>
): Record<CanonicalCriterionKey, number> {
  const normalized: Record<string, number> = {};

  for (const [key, score] of Object.entries(raw)) {
    const canonical = LEGACY_KEY_MAP[key];
    if (canonical) {
      // If the same canonical key is mapped multiple times, take the max
      normalized[canonical] = Math.max(normalized[canonical] ?? 0, score);
    } else {
      console.warn(`[SLE Scoring] Unknown criterion key: "${key}" — skipping`);
    }
  }

  // Ensure all 7 canonical keys are present (default to 0)
  const result: Record<string, number> = {};
  for (const key of CANONICAL_CRITERIA_KEYS) {
    result[key] = Math.max(0, Math.min(100, Math.round(normalized[key] ?? 0)));
  }

  return result as Record<CanonicalCriterionKey, number>;
}

// ─── Score Computation ───────────────────────────────────────

/**
 * Determine the level for a single criterion score.
 * Thresholds match grading_logic.jsonl: A(36-54), B(55-74), C(75-100)
 */
function scoreToCriterionLevel(score: number): string {
  if (score >= 75) return "C";
  if (score >= 55) return "B";
  if (score >= 36) return "A";
  return "X";
}

/**
 * Compute the full session score from individual criterion scores.
 *
 * v2 FIX: Now normalizes criterion keys before computing composite.
 * Accepts both legacy camelCase and canonical snake_case keys.
 */
export function computeSessionScore(
  sessionId: number,
  language: "FR" | "EN",
  criterionScores: Record<string, number>,
  detectedErrors: DetectedError[] = []
): SessionScore {
  // NORMALIZE: Convert any legacy keys to canonical
  const normalizedScores = normalizeCriterionScores(criterionScores);

  // Compute composite using canonical keys
  const { overallScore, level } = computeCompositeScore(normalizedScores);

  // Build per-criterion detail
  const criterionDetails: CriterionScore[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  for (const [criterion, score] of Object.entries(normalizedScores)) {
    const critLevel = scoreToCriterionLevel(score);

    // Get rubric descriptor — use the OVERALL level for context, not critLevel
    const rubrics = getRubrics(language, (critLevel === "X" ? "A" : critLevel) as "A" | "B" | "C");
    const rubric = rubrics.find((r) => r.criterion === criterion);

    criterionDetails.push({
      criterion: criterion as CanonicalCriterionKey,
      score,
      level: critLevel,
      feedback: rubric?.descriptor ?? "",
    });

    if (score >= 75) {
      strengths.push(criterion);
    } else if (score < 55) {
      weaknesses.push(criterion);
    }
  }

  // Generate recommendations based on weaknesses
  for (const weakness of weaknesses) {
    const templates = getFeedbackTemplates(language, "drill_suggestion", weakness);
    if (templates.length > 0) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      recommendations.push(template.template_text);
    }
  }

  // If no specific recommendations, add a general one
  if (recommendations.length === 0 && level !== "C") {
    const generalTemplates = getFeedbackTemplates(language, "encouragement");
    if (generalTemplates.length > 0) {
      const template = generalTemplates[Math.floor(Math.random() * generalTemplates.length)];
      recommendations.push(template.template_text);
    }
  }

  return {
    sessionId,
    overallScore,
    level,
    criterionScores: criterionDetails,
    strengths,
    weaknesses,
    recommendations,
    errorsDetected: detectedErrors,
  };
}

/**
 * Check user text against common errors database.
 * Returns matching errors found in the text.
 */
export function detectCommonErrors(
  userText: string,
  language: "FR" | "EN",
  maxErrors: number = 5
): DetectedError[] {
  const allErrors = getCommonErrors(language);
  const detected: DetectedError[] = [];
  const lowerText = userText.toLowerCase();

  for (const error of allErrors) {
    if (detected.length >= maxErrors) break;

    // Simple pattern matching — check if the error pattern appears in user text
    const patternLower = error.pattern.toLowerCase();
    if (lowerText.includes(patternLower)) {
      detected.push({
        errorId: error.id,
        pattern: error.pattern,
        correction: error.correction,
        feedback: error.feedback_text,
        category: error.category,
      });
    }
  }

  return detected;
}

/**
 * Generate a feedback message for a specific criterion and score.
 */
export function generateCriterionFeedback(
  language: "FR" | "EN",
  criterion: string,
  score: number,
  type: "instant_correction" | "end_of_turn" | "session_summary" = "end_of_turn"
): string {
  const level = scoreToCriterionLevel(score);
  const templates = getFeedbackTemplates(language, type, criterion);

  if (templates.length === 0) {
    // Fallback to general templates
    const generalTemplates = getFeedbackTemplates(language, type, "general");
    if (generalTemplates.length > 0) {
      return generalTemplates[Math.floor(Math.random() * generalTemplates.length)].template_text;
    }
    return "";
  }

  // Pick a template matching the level context
  const levelMatched = templates.filter(
    (t) => t.level_context === level || t.level_context === "all"
  );
  const pool = levelMatched.length > 0 ? levelMatched : templates;
  return pool[Math.floor(Math.random() * pool.length)].template_text;
}

/**
 * Compute rolling average score across multiple sessions.
 * Used for sustained performance tracking.
 */
export function computeRollingAverage(
  sessionScores: number[],
  windowSize: number = 5
): number {
  if (sessionScores.length === 0) return 0;
  const window = sessionScores.slice(-windowSize);
  return Math.round(window.reduce((a, b) => a + b, 0) / window.length);
}

/**
 * Determine if a learner has sustained a level across recent sessions.
 * Returns true if 70%+ of the last N sessions are at or above the given level.
 */
export function hasSustainedLevel(
  recentScores: number[],
  targetLevel: "A" | "B" | "C",
  windowSize: number = 5,
  threshold: number = 0.7
): boolean {
  const thresholds: Record<string, number> = { A: 36, B: 55, C: 75 };
  const minScore = thresholds[targetLevel] ?? 0;

  const window = recentScores.slice(-windowSize);
  if (window.length === 0) return false;

  const atLevel = window.filter((s) => s >= minScore).length;
  return atLevel / window.length >= threshold;
}
