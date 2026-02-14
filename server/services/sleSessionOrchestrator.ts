/**
 * SLE Session Orchestrator
 * Manages the conversation flow for SLE AI Companion sessions.
 * Selects scenarios, injects context into the AI coach, and handles scoring.
 *
 * Updated 2025-2026: The SLE oral exam is a single continuous progressive
 * interview with 3 phases (not 4 separate parts). No listening component.
 */

import {
  selectScenario,
  selectQuestions,
  getAnswerGuide,
  buildCoachContext,
  getExamComponent,
  type Scenario,
  type Question,
  type ExamPhase,
} from "./sleDatasetService";
import {
  computeSessionScore,
  detectCommonErrors,
  generateCriterionFeedback,
  type SessionScore,
  type DetectedError,
} from "./sleScoringService";

// ─── Types ───────────────────────────────────────────────────

export type SessionMode = "practice" | "exam_simulation";

export interface SessionConfig {
  language: "FR" | "EN";
  targetLevel: "A" | "B" | "C";
  mode: SessionMode;
  phases: ExamPhase[]; // Which phases to practice (e.g., ["1", "2"] or all 3)
}

export interface SessionState {
  config: SessionConfig;
  currentPhaseIndex: number;
  currentScenario: Scenario | null;
  currentQuestions: Question[];
  questionIndex: number;
  usedScenarioIds: string[];
  usedQuestionIds: string[];
  turnCount: number;
  errors: DetectedError[];
  startedAt: number;
}

export interface TurnResult {
  coachResponse: string;
  nextQuestion: string | null;
  errorsDetected: DetectedError[];
  phaseComplete: boolean;
  sessionComplete: boolean;
  feedback?: string;
}

// ─── Session Management ──────────────────────────────────────

/**
 * Initialize a new practice session with the given configuration.
 * Returns the initial state and the system prompt context to inject.
 *
 * The SLE oral exam (2025-2026) is a single continuous progressive interview:
 *   Phase 1 — Warm-up / Factual questions (Level A)
 *   Phase 2 — Explanatory block / Narrative (Level B)
 *   Phase 3 — Opinion, analysis, hypotheticals (Level C)
 */
export function initializeSession(config: SessionConfig): {
  state: SessionState;
  systemPromptContext: string;
  openingScenario: Scenario | null;
  openingQuestions: Question[];
} {
  const state: SessionState = {
    config,
    currentPhaseIndex: 0,
    currentScenario: null,
    currentQuestions: [],
    questionIndex: 0,
    usedScenarioIds: [],
    usedQuestionIds: [],
    turnCount: 0,
    errors: [],
    startedAt: Date.now(),
  };

  // Load first phase
  const firstPhase = config.phases[0];
  const result = loadPhaseContent(state, firstPhase);

  // Build the system prompt context
  const systemPromptContext = buildCoachContext(
    config.language,
    config.targetLevel,
    firstPhase
  );

  return {
    state: result.state,
    systemPromptContext,
    openingScenario: result.state.currentScenario,
    openingQuestions: result.state.currentQuestions,
  };
}

/**
 * Load content for a specific exam phase.
 */
function loadPhaseContent(
  state: SessionState,
  phase: ExamPhase
): { state: SessionState } {
  const { language } = state.config;

  // Select a scenario for this phase
  const scenario = selectScenario(language, phase, state.usedScenarioIds);
  if (scenario) {
    state.usedScenarioIds.push(scenario.id);
  }

  // Select questions for this phase
  const questions = selectQuestions(language, phase, 5, state.usedQuestionIds);
  state.usedQuestionIds.push(...questions.map((q) => q.id));

  state.currentScenario = scenario;
  state.currentQuestions = questions;
  state.questionIndex = 0;

  return { state };
}

/**
 * Process a learner's turn and return the next action.
 */
export function processTurn(
  state: SessionState,
  userMessage: string
): { state: SessionState; result: TurnResult } {
  state.turnCount++;

  // Detect errors in user message
  const errors = detectCommonErrors(
    userMessage,
    state.config.language,
    3 // max 3 errors per turn to avoid overwhelming
  );
  state.errors.push(...errors);

  // Determine if current phase is complete
  const questionsRemaining =
    state.questionIndex < state.currentQuestions.length - 1;
  const hasFollowups =
    state.currentScenario?.followups &&
    state.turnCount <= (state.currentScenario.followups.length + 1);

  let phaseComplete = false;
  let sessionComplete = false;
  let nextQuestion: string | null = null;
  let feedback: string | undefined;

  if (questionsRemaining) {
    // Move to next question
    state.questionIndex++;
    nextQuestion = state.currentQuestions[state.questionIndex].question_text;
  } else if (hasFollowups && state.currentScenario) {
    // Use scenario followups
    const followupIndex = state.turnCount - state.currentQuestions.length - 1;
    if (followupIndex < state.currentScenario.followups.length) {
      nextQuestion = state.currentScenario.followups[followupIndex];
    } else {
      phaseComplete = true;
    }
  } else {
    phaseComplete = true;
  }

  // If phase is complete, try to advance to next phase
  if (phaseComplete) {
    if (state.currentPhaseIndex < state.config.phases.length - 1) {
      state.currentPhaseIndex++;
      const nextPhase = state.config.phases[state.currentPhaseIndex];
      loadPhaseContent(state, nextPhase);
      nextQuestion = state.currentQuestions[0]?.question_text ?? null;
      phaseComplete = false; // Reset — we're starting a new phase
      state.turnCount = 0;
    } else {
      sessionComplete = true;
    }
  }

  // Generate feedback based on mode
  if (state.config.mode === "practice" && errors.length > 0) {
    // In practice mode, give instant feedback on errors
    feedback = errors
      .map((e) => `⚠ ${e.pattern} → ${e.correction}\n${e.feedback}`)
      .join("\n\n");
  }
  // In exam_simulation mode, no feedback until end

  const result: TurnResult = {
    coachResponse: "", // Will be filled by the AI coach
    nextQuestion,
    errorsDetected: errors,
    phaseComplete,
    sessionComplete,
    feedback,
  };

  return { state, result };
}

/**
 * Generate the end-of-session report.
 * In practice mode, this is shown after each phase.
 * In exam_simulation mode, this is shown only at the end.
 */
export function generateSessionReport(
  state: SessionState,
  criterionScores: Record<string, number>
): SessionScore {
  return computeSessionScore(
    0, // sessionId will be set by the caller
    state.config.language,
    criterionScores,
    state.errors
  );
}

/**
 * Get the current scenario's answer guide for coach reference.
 */
export function getCurrentAnswerGuide(state: SessionState) {
  if (!state.currentScenario) return null;
  return getAnswerGuide(state.currentScenario.id);
}

/**
 * Get the current exam component info.
 */
export function getCurrentExamComponent(state: SessionState) {
  const currentPhase = state.config.phases[state.currentPhaseIndex];
  return getExamComponent(state.config.language, currentPhase);
}

/**
 * Build the context injection for the current turn.
 * This is appended to the AI coach's system prompt to provide
 * scenario-specific guidance.
 */
export function buildTurnContext(state: SessionState): string {
  const sections: string[] = [];
  const currentPhase = state.config.phases[state.currentPhaseIndex];

  // Exam component context
  const examComp = getCurrentExamComponent(state);
  if (examComp) {
    sections.push(`[Current Phase: ${examComp.name} (Phase ${currentPhase} — Target: Level ${examComp.level_target})]`);
    if (examComp.key_structures) {
      sections.push(`[Key Structures to Elicit: ${examComp.key_structures.join("; ")}]`);
    }
  }

  // Scenario context
  if (state.currentScenario) {
    sections.push(`[Scenario: ${state.currentScenario.context}]`);
    sections.push(`[Instructions: ${state.currentScenario.instructions}]`);
  }

  // Answer guide for coach reference
  const guide = getCurrentAnswerGuide(state);
  if (guide) {
    sections.push(
      `[Answer Guide - For your reference only, do NOT read to learner:]`,
      `Expected elements: ${guide.expected_elements.join("; ")}`,
      `Recommended structures: ${guide.recommended_structures.join("; ")}`,
      `Common pitfalls: ${guide.common_pitfalls.join("; ")}`
    );
  }

  // Current question
  if (state.currentQuestions[state.questionIndex]) {
    sections.push(
      `[Current Question: ${state.currentQuestions[state.questionIndex].question_text}]`
    );
  }

  // Mode-specific instructions
  if (state.config.mode === "exam_simulation") {
    sections.push(
      `[MODE: EXAM SIMULATION - Do NOT provide feedback or corrections during the session. Only evaluate at the end. Behave exactly like a PSC assessor conducting the real interview.]`
    );
  } else {
    sections.push(
      `[MODE: PRACTICE - Provide gentle corrections and encouragement after each response. Help the learner improve progressively.]`
    );
  }

  return sections.join("\n");
}
