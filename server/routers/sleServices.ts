/**
 * SLE Services Router
 * 
 * Connects the 4 SLE runtime services to the tRPC router:
 * - sleDatasetService: Loads and queries the SLE training dataset
 * - sleScoringService: Computes scores using PSC rubrics
 * - sleSessionOrchestrator: Manages oral practice session flow
 * - sleWrittenService: Manages written MCQ exam sessions
 * 
 * Updated 2025-2026: SLE oral exam is a continuous progressive interview
 * with 3 phases (not 4 separate parts). No listening component.
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// ─── Dataset Service ────────────────────────────────────────────────────────
import {
  getDataset,
  selectScenario,
  selectQuestions,
  getAnswerGuide,
  getRubrics,
  getCommonErrors,
  getFeedbackTemplates,
  getExamComponent,
  buildCoachContext,
  computeCompositeScore,
  type ExamPhase,
} from "../services/sleDatasetService";

// ─── Scoring Service ────────────────────────────────────────────────────────
import {
  computeSessionScore,
  detectCommonErrors,
  generateCriterionFeedback,
  computeRollingAverage,
  hasSustainedLevel,
} from "../services/sleScoringService";

// ─── Session Orchestrator ───────────────────────────────────────────────────
import {
  initializeSession,
  processTurn,
  generateSessionReport,
  buildTurnContext,
  type SessionConfig,
} from "../services/sleSessionOrchestrator";

// ─── Adaptive Router ───────────────────────────────────────────────────────
import {
  createDifficultyState,
  updateDifficulty,
  selectAdaptiveScenario,
  getModeConfig,
  formatFeedback,
  buildAdaptiveSessionSummary,
  identifyWeakAreas,
  type SessionMode as AdaptiveSessionMode,
  type DifficultyState,
  type AdaptiveConfig,
} from "../services/sleAdaptiveRouter";
import { normalizeCriterionScores } from "../services/sleScoringService";

// ─── Written Exam Service ───────────────────────────────────────────────────
import {
  createExamSession,
  gradeExam,
  getQuestionStats,
  calculateLevel,
  type ExamMode,
  type ExamSession,
  type ExamSubmission,
} from "../services/sleWrittenService";

// ─── In-memory session store (for orchestrator state) ───────────────────────
// In production, this would be stored in Redis or the database.
const orchestratorSessions = new Map<string, ReturnType<typeof initializeSession>["state"]>();
const writtenExamSessions = new Map<string, ExamSession>();
const adaptiveSessions = new Map<string, { config: AdaptiveConfig; difficulty: DifficultyState; usedScenarioIds: string[] }>();

// ─── Router ─────────────────────────────────────────────────────────────────

export const sleServicesRouter = router({
  // ═══════════════════════════════════════════════════════════════════════════
  // DATASET ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Get dataset statistics (record counts per collection) */
  datasetStats: publicProcedure.query(() => {
    const ds = getDataset();
    return {
      examComponents: ds.examComponents.length,
      rubrics: ds.rubrics.length,
      gradingLogic: ds.gradingLogic.length,
      scenarios: ds.scenarios.length,
      questionBank: ds.questionBank.length,
      commonErrors: ds.commonErrors.length,
      feedbackTemplates: ds.feedbackTemplates.length,
      answerGuides: ds.answerGuides.length,
      citations: ds.citations.length,
      total: Object.values(ds).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
        0
      ),
    };
  }),

  /** Get rubrics for a specific language and level */
  getRubrics: publicProcedure
    .input(
      z.object({
        language: z.enum(["FR", "EN"]),
        level: z.enum(["A", "B", "C"]),
      })
    )
    .query(({ input }) => {
      return getRubrics(input.language, input.level);
    }),

  /** Get exam component info for a specific phase */
  getExamComponent: publicProcedure
    .input(
      z.object({
        language: z.enum(["FR", "EN"]),
        phase: z.enum(["1", "2", "3"]),
      })
    )
    .query(({ input }) => {
      return getExamComponent(input.language, input.phase as ExamPhase);
    }),

  /** Get common errors for a language */
  getCommonErrors: publicProcedure
    .input(
      z.object({
        language: z.enum(["FR", "EN"]),
        category: z.string().optional(),
        levelImpact: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return getCommonErrors(input.language, input.category, input.levelImpact);
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SCORING ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Compute session score from criterion scores */
  computeScore: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        language: z.enum(["FR", "EN"]),
        criterionScores: z.record(z.string(), z.number()),
      })
    )
    .mutation(({ input }) => {
      return computeSessionScore(
        input.sessionId,
        input.language,
        input.criterionScores
      );
    }),

  /** Detect common errors in user text */
  detectErrors: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        language: z.enum(["FR", "EN"]),
        maxErrors: z.number().min(1).max(20).optional(),
      })
    )
    .mutation(({ input }) => {
      return detectCommonErrors(
        input.text,
        input.language,
        input.maxErrors ?? 5
      );
    }),

  /** Generate feedback for a criterion */
  getCriterionFeedback: publicProcedure
    .input(
      z.object({
        language: z.enum(["FR", "EN"]),
        criterion: z.string(),
        score: z.number().min(0).max(100),
        type: z
          .enum(["instant_correction", "end_of_turn", "session_summary"])
          .optional(),
      })
    )
    .query(({ input }) => {
      return generateCriterionFeedback(
        input.language,
        input.criterion,
        input.score,
        input.type ?? "end_of_turn"
      );
    }),

  /** Check if learner has sustained a level */
  checkSustainedLevel: protectedProcedure
    .input(
      z.object({
        recentScores: z.array(z.number()),
        targetLevel: z.enum(["A", "B", "C"]),
        windowSize: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const sustained = hasSustainedLevel(
        input.recentScores,
        input.targetLevel,
        input.windowSize ?? 5
      );
      const rollingAvg = computeRollingAverage(
        input.recentScores,
        input.windowSize ?? 5
      );
      return { sustained, rollingAverage: rollingAvg };
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ORAL SESSION ORCHESTRATOR ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Initialize a new oral practice session */
  initOralSession: protectedProcedure
    .input(
      z.object({
        language: z.enum(["FR", "EN"]),
        targetLevel: z.enum(["A", "B", "C"]),
        mode: z.enum(["practice", "exam_simulation"]),
        phases: z.array(z.enum(["1", "2", "3"])).min(1),
      })
    )
    .mutation(({ input }) => {
      const config: SessionConfig = {
        language: input.language,
        targetLevel: input.targetLevel,
        mode: input.mode,
        phases: input.phases as ExamPhase[],
      };

      const result = initializeSession(config);
      const sessionKey = `oral_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      orchestratorSessions.set(sessionKey, result.state);

      return {
        sessionKey,
        systemPromptContext: result.systemPromptContext,
        openingScenario: result.openingScenario
          ? {
              id: result.openingScenario.id,
              context: result.openingScenario.context,
              instructions: result.openingScenario.instructions,
              prompt_text: result.openingScenario.prompt_text,
            }
          : null,
        openingQuestions: result.openingQuestions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          timing_seconds: q.timing_seconds,
        })),
      };
    }),

  /** Process a turn in an oral session */
  processOralTurn: protectedProcedure
    .input(
      z.object({
        sessionKey: z.string(),
        userMessage: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const state = orchestratorSessions.get(input.sessionKey);
      if (!state) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Oral session not found or expired",
        });
      }

      const { state: updatedState, result } = processTurn(
        state,
        input.userMessage
      );
      orchestratorSessions.set(input.sessionKey, updatedState);

      // Build turn context for AI coach
      const turnContext = buildTurnContext(updatedState);

      return {
        ...result,
        turnContext,
        turnCount: updatedState.turnCount,
        currentPhase:
          updatedState.config.phases[updatedState.currentPhaseIndex],
      };
    }),

  /** Get the end-of-session report for an oral session */
  getOralReport: protectedProcedure
    .input(
      z.object({
        sessionKey: z.string(),
        criterionScores: z.record(z.string(), z.number()),
      })
    )
    .mutation(({ input }) => {
      const state = orchestratorSessions.get(input.sessionKey);
      if (!state) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Oral session not found or expired",
        });
      }

      const report = generateSessionReport(state, input.criterionScores);

      // Clean up session
      orchestratorSessions.delete(input.sessionKey);

      return report;
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ADAPTIVE ROUTING ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Initialize an adaptive oral session with progressive difficulty */
  initAdaptiveSession: protectedProcedure
    .input(
      z.object({
        language: z.enum(["FR", "EN"]),
        targetLevel: z.enum(["A", "B", "C"]),
        mode: z.enum(["training", "exam_simulation", "micro_learning"]),
        topicPreferences: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input }) => {
      const sessionKey = `adaptive_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const config: AdaptiveConfig = {
        language: input.language,
        targetLevel: input.targetLevel,
        mode: input.mode as AdaptiveSessionMode,
        topicPreferences: input.topicPreferences ?? [],
        recentScenarioIds: [],
      };

      const difficulty = createDifficultyState(input.targetLevel);
      adaptiveSessions.set(sessionKey, { config, difficulty, usedScenarioIds: [] });

      // Select the first scenario
      const result = selectAdaptiveScenario(config, difficulty, []);
      if (result.scenario) {
        adaptiveSessions.get(sessionKey)!.usedScenarioIds.push(result.scenario.id);
      }

      const modeConfig = getModeConfig(input.mode as AdaptiveSessionMode);

      return {
        sessionKey,
        modeConfig,
        difficulty: {
          effectiveLevel: difficulty.effectiveLevel,
          consecutiveStrong: difficulty.consecutiveStrong,
          consecutiveWeak: difficulty.consecutiveWeak,
        },
        scenario: result.scenario
          ? {
              id: result.scenario.id,
              context: result.scenario.context,
              instructions: result.scenario.instructions,
              prompt_text: result.scenario.prompt_text,
              level_target: result.scenario.level_target,
              topic_domain: result.scenario.topic_domain,
            }
          : null,
        questions: result.questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          timing_seconds: q.timing_seconds,
        })),
        selectionReason: result.selectionReason,
      };
    }),

  /** Get the next adaptive scenario based on performance */
  getNextAdaptiveScenario: protectedProcedure
    .input(
      z.object({
        sessionKey: z.string(),
        lastTurnScore: z.number().min(0).max(100),
      })
    )
    .mutation(({ input }) => {
      const session = adaptiveSessions.get(input.sessionKey);
      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Adaptive session not found or expired",
        });
      }

      // Update difficulty based on last score
      session.difficulty = updateDifficulty(
        session.difficulty,
        input.lastTurnScore,
        session.config.mode
      );

      // Select next scenario
      const result = selectAdaptiveScenario(
        session.config,
        session.difficulty,
        session.usedScenarioIds
      );

      if (result.scenario) {
        session.usedScenarioIds.push(result.scenario.id);
      }

      return {
        difficulty: {
          effectiveLevel: session.difficulty.effectiveLevel,
          consecutiveStrong: session.difficulty.consecutiveStrong,
          consecutiveWeak: session.difficulty.consecutiveWeak,
          sessionScores: session.difficulty.sessionScores,
        },
        scenario: result.scenario
          ? {
              id: result.scenario.id,
              context: result.scenario.context,
              instructions: result.scenario.instructions,
              prompt_text: result.scenario.prompt_text,
              level_target: result.scenario.level_target,
              topic_domain: result.scenario.topic_domain,
            }
          : null,
        questions: result.questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          timing_seconds: q.timing_seconds,
        })),
        selectionReason: result.selectionReason,
      };
    }),

  /** End an adaptive session and get the summary */
  endAdaptiveSession: protectedProcedure
    .input(
      z.object({
        sessionKey: z.string(),
        finalCriterionScores: z.record(z.string(), z.number()).optional(),
      })
    )
    .mutation(({ input }) => {
      const session = adaptiveSessions.get(input.sessionKey);
      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Adaptive session not found or expired",
        });
      }

      // Build the final criterion scores
      const avgScore = session.difficulty.sessionScores.length > 0
        ? Math.round(
            session.difficulty.sessionScores.reduce((a, b) => a + b, 0) /
              session.difficulty.sessionScores.length
          )
        : 0;

      const criterionScores = input.finalCriterionScores ?? {
        grammar: avgScore,
        vocabulary: avgScore,
        fluency: avgScore,
        pronunciation: avgScore,
        comprehension: avgScore,
        interaction: avgScore,
        logical_connectors: avgScore,
      };

      const normalized = normalizeCriterionScores(criterionScores);
      const summary = buildAdaptiveSessionSummary(
        session.difficulty,
        session.config.targetLevel,
        normalized,
        session.config.language
      );

      // Clean up
      adaptiveSessions.delete(input.sessionKey);

      return summary;
    }),

  /** Identify weak areas from criterion scores */
  identifyWeakAreas: protectedProcedure
    .input(
      z.object({
        criterionScores: z.record(z.string(), z.number()),
        targetLevel: z.enum(["A", "B", "C"]),
      })
    )
    .query(({ input }) => {
      return identifyWeakAreas(input.criterionScores, input.targetLevel);
    }),

  /** Format feedback based on session mode */
  formatModeFeedback: protectedProcedure
    .input(
      z.object({
        mode: z.enum(["training", "exam_simulation", "micro_learning"]),
        rawFeedback: z.string(),
        corrections: z.array(z.string()),
        suggestions: z.array(z.string()),
        language: z.enum(["FR", "EN"]),
      })
    )
    .query(({ input }) => {
      return formatFeedback(
        input.mode as AdaptiveSessionMode,
        input.rawFeedback,
        input.corrections,
        input.suggestions,
        input.language
      );
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // WRITTEN EXAM ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Get written exam question statistics */
  writtenStats: publicProcedure.query(() => {
    return getQuestionStats();
  }),

  /** Start a new written exam session */
  startWrittenExam: protectedProcedure
    .input(
      z.object({
        language: z.enum(["fr", "en"]),
        mode: z.enum(["drill_b", "drill_c", "full_mock"]),
      })
    )
    .mutation(({ input }) => {
      const session = createExamSession(
        input.language,
        input.mode as ExamMode
      );

      // Store session for grading
      writtenExamSessions.set(session.sessionId, session);

      // Return questions WITHOUT correct answers (prevent cheating)
      return {
        sessionId: session.sessionId,
        language: session.language,
        mode: session.mode,
        config: session.config,
        startedAt: session.startedAt,
        questions: session.questions.map((q) => ({
          id: q.id,
          language: q.language,
          category: q.category,
          category_name: q.category_name,
          level: q.level,
          type: q.type,
          stem: q.stem,
          options: q.options,
          difficulty: q.difficulty,
          // NOTE: correct_answer, explanation, grammar_rule, common_error are EXCLUDED
        })),
      };
    }),

  /** Submit answers and get graded results */
  submitWrittenExam: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        answers: z.record(z.string(), z.number().nullable()),
        timeSpent: z.number().min(0),
      })
    )
    .mutation(({ input }) => {
      const session = writtenExamSessions.get(input.sessionId);
      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Written exam session not found or expired",
        });
      }

      const submission: ExamSubmission = {
        sessionId: input.sessionId,
        answers: input.answers,
        timeSpent: input.timeSpent,
      };

      const result = gradeExam(session, submission);

      // Clean up session
      writtenExamSessions.delete(input.sessionId);

      return result;
    }),

  /** Load written questions directly (for client-side exam mode) */
  getWrittenQuestions: protectedProcedure
    .input(
      z.object({
        language: z.enum(["fr", "en"]),
        levels: z.array(z.enum(["A", "B", "C"])).min(1),
        count: z.number().min(1).max(100).optional(),
      })
    )
    .query(({ input }) => {
      // Create a temporary session to get shuffled questions
      const mode: ExamMode =
        input.levels.length === 1 && input.levels[0] === "B"
          ? "drill_b"
          : input.levels.length === 1 && input.levels[0] === "C"
          ? "drill_c"
          : "full_mock";

      const session = createExamSession(input.language, mode);
      const count = input.count ?? session.config.questionCount;

      return {
        questions: session.questions.slice(0, count),
        total: session.questions.length,
        language: input.language,
        levels: input.levels,
      };
    }),
});
