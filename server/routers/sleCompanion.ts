/**
 * SLE AI Companion Router
 * Provides endpoints for conversational practice with coach voices
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { sleCompanionSessions, sleCompanionMessages } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import {
  getAvailableCoaches,
  getCoach,
  getConversationPrompts,
  getRandomPrompt,
  getFeedback,
  COACH_VOICES,
  type CoachKey,
} from "../services/sleAICompanionService";
import {
  generateCoachResponse,
  generateInitialGreeting,
  evaluateResponse,
  transcribeUserAudio,
  type ConversationContext,
  type SLELevel,
  type SLESkill,
} from "../services/sleConversationService";
import {
  initializeSession,
  processTurn,
  buildTurnContext,
  type SessionConfig,
} from "../services/sleSessionOrchestrator";
import type { ExamPhase } from "../services/sleDatasetService";
import {
  createDifficultyState,
  updateDifficulty,
  selectAdaptiveScenario,
  getModeConfig,
  formatFeedback,
  withTTSFallback,
  buildAdaptiveSessionSummary,
  identifyWeakAreas,
  type SessionMode as AdaptiveSessionMode,
  type DifficultyState,
  type AdaptiveConfig,
} from "../services/sleAdaptiveRouter";
import { normalizeCriterionScores } from "../services/sleScoringService";
import { createPipelineTimer, buildDebugPayload, isAnomalousScore } from "../services/sleLogging";
import { persistSessionState, loadSessionState, clearSessionState } from "../services/sleSessionStateService";

export const sleCompanionRouter = router({
  // Get all available coaches
  getCoaches: publicProcedure.query(() => {
    return getAvailableCoaches();
  }),

  // Get a specific coach
  getCoach: publicProcedure
    .input(z.object({ coachKey: z.enum(["STEVEN", "SUE_ANNE", "ERIKA", "PRECIOSA"]) }))
    .query(({ input }) => {
      return getCoach(input.coachKey as CoachKey);
    }),

  // Get conversation prompts for a level and skill
  getPrompts: publicProcedure
    .input(
      z.object({
        level: z.enum(["A", "B", "C"]),
        skill: z.enum([
          "oral_expression",
          "oral_comprehension",
          "written_expression",
          "written_comprehension",
        ]),
      })
    )
    .query(({ input }) => {
      return getConversationPrompts(input.level, input.skill);
    }),

  // Get a random prompt for practice
  getRandomPrompt: publicProcedure
    .input(
      z.object({
        level: z.enum(["A", "B", "C"]),
        skill: z.enum([
          "oral_expression",
          "oral_comprehension",
          "written_expression",
          "written_comprehension",
        ]),
      })
    )
    .query(({ input }) => {
      return getRandomPrompt(input.level, input.skill);
    }),

  // Start a new practice session (persisted to database)
  startSession: protectedProcedure
    .input(
      z.object({
        coachKey: z.enum(["STEVEN", "SUE_ANNE", "ERIKA", "PRECIOSA"]),
        level: z.enum(["A", "B", "C"]),
        skill: z.enum([
          "oral_expression",
          "oral_comprehension",
          "written_expression",
          "written_comprehension",
        ]),
        topic: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const coach = getCoach(input.coachKey as CoachKey);
      
      // Generate initial greeting using LLM-powered service
      const greeting = generateInitialGreeting(
        input.coachKey as CoachKey,
        input.level as SLELevel,
        input.skill as SLESkill,
        input.topic
      );

      // Create session in database (userId guaranteed by protectedProcedure)
      const [result] = await db.insert(sleCompanionSessions).values({
        userId: ctx.user.id,
        coachKey: input.coachKey,
        level: input.level,
        skill: input.skill,
        topic: input.topic || null,
        status: "active",
        totalMessages: 1,
      });

      const sessionId = result.insertId;

      // Initialize the session orchestrator with SLE dataset context
      const language: "FR" | "EN" = (input.coachKey === "PRECIOSA") ? "EN" : "FR";
      const phases: ExamPhase[] = input.level === "A" ? ["1"] : input.level === "B" ? ["1", "2"] : ["1", "2", "3"];
      const orchConfig: SessionConfig = {
        language,
        targetLevel: input.level,
        mode: "practice",
        phases,
      };
      const orchResult = initializeSession(orchConfig);

      // Initialize adaptive difficulty tracking
      const difficultyState = createDifficultyState(input.level);

      // Persist session state to database (write-through)
      await persistSessionState(Number(sessionId), orchResult.state, difficultyState, "training");

      // Save the initial greeting as the first message
      await db.insert(sleCompanionMessages).values({
        sessionId: Number(sessionId),
        role: "assistant",
        content: greeting,
      });

      // Get mode config for the client
      const modeConfig = getModeConfig("training");

      return {
        sessionId: Number(sessionId),
        coach,
        level: input.level,
        skill: input.skill,
        topic: input.topic,
        welcomeMessage: greeting,
        voiceId: coach.id,
        modeConfig: {
          showInstantCorrections: modeConfig.showInstantCorrections,
          showTurnFeedback: modeConfig.showTurnFeedback,
          enforceTimer: modeConfig.enforceTimer,
          timerSeconds: modeConfig.timerSeconds,
          maxTurns: modeConfig.maxTurns,
        },
      };
    }),

  // Send a message to the coach and get an LLM-powered response
  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        message: z.string().min(1),
        audioUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get session from database
      const [session] = await db
        .select()
        .from(sleCompanionSessions)
        .where(eq(sleCompanionSessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      // Verify session ownership (protectedProcedure guarantees ctx.user)
      if (session.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this session",
        });
      }

      // Get conversation history
      const previousMessages = await db
        .select()
        .from(sleCompanionMessages)
        .where(eq(sleCompanionMessages.sessionId, input.sessionId))
        .orderBy(sleCompanionMessages.createdAt);

      // Load session state from DB-backed persistence (replaces in-memory Maps)
      const sessionState = await loadSessionState(input.sessionId);

      // Process the turn through the orchestrator (if session has state)
      let turnContext: string | undefined;
      let currentPhase: ExamPhase | undefined;
      const orchState = sessionState.orchestratorState;
      if (orchState) {
        const { state: updatedState, result: turnResult } = processTurn(orchState, input.message);
        turnContext = buildTurnContext(updatedState);
        currentPhase = updatedState.config.phases[updatedState.currentPhaseIndex];
        // Persist updated orchestrator state immediately
        await persistSessionState(input.sessionId, updatedState, null, null);
      }

      // Build conversation context with dataset + orchestrator injection
      const context: ConversationContext = {
        coachKey: session.coachKey as CoachKey,
        level: session.level as SLELevel,
        skill: session.skill as SLESkill,
        topic: session.topic || undefined,
        currentPhase,
        turnContext,
        conversationHistory: previousMessages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      };

      // Save user message
      await db.insert(sleCompanionMessages).values({
        sessionId: input.sessionId,
        role: "user",
        content: input.message,
        audioUrl: input.audioUrl || null,
      });

      // Generate LLM-powered coach response with fallback on failure
      let responseText = "";
      let evaluation = {
        score: 0,
        passed: false,
        feedback: "",
        corrections: [] as string[],
        suggestions: [] as string[],
      };

      // Determine language for fallback messages
      const isEnglishCoach = session.coachKey === "PRECIOSA";

      try {
        const { response } = await generateCoachResponse(input.message, context);
        responseText = response;
      } catch (e) {
        // Fallback: provide a language-appropriate helpful message
        responseText = isEnglishCoach
          ? "Sorry, I had a brief technical issue. Could you repeat that or try rephrasing?"
          : "Désolé, un petit problème technique. Pouvez-vous répéter ou reformuler?";
      }

      // FIRE-AND-FORGET evaluation — runs in background, does NOT block the response
      // This saves 2-3 seconds of latency since we skip the 2nd LLM call before responding
      const sessionMode = sessionState.mode ?? "training";
      evaluateResponse(input.message, context)
        .then(async (evalResult) => {
          try {
            // Normalize criterion scores through the canonical pipeline
            if (evalResult.criteriaScores) {
              evalResult.criteriaScores = normalizeCriterionScores(evalResult.criteriaScores);
            }

            // Check for anomalous scores (pipeline bug detection)
            if (evalResult.criteriaScores) {
              const anomaly = isAnomalousScore(evalResult.score, evalResult.criteriaScores);
              if (anomaly.anomalous) {
                console.warn(`[SLE:ANOMALY] session=${input.sessionId} reason=${anomaly.reason}`);
              }
            }

            // Update adaptive difficulty based on score and persist
            const latestState = await loadSessionState(input.sessionId);
            const currentDifficulty = latestState.difficultyState;
            if (currentDifficulty) {
              const updatedDifficulty = updateDifficulty(currentDifficulty, evalResult.score, sessionMode);
              await persistSessionState(input.sessionId, null, updatedDifficulty, null);
            }

            const evalDb = await getDb();
            if (evalDb) {
              // Update the session with the real evaluation when it completes
              await evalDb
                .update(sleCompanionSessions)
                .set({
                  averageScore: evalResult.score,
                  feedback: evalResult.feedback || null,
                })
                .where(eq(sleCompanionSessions.id, input.sessionId));
            }
          } catch (e) {
            console.error("[SLE] Background eval DB save failed:", e);
          }
        })
        .catch((e) => {
          console.error("[SLE] Background evaluation failed:", e);
        });
      // Don't await — evaluation is empty for the immediate response
      // The real scores will be saved to DB asynchronously

      // Save coach response
      await db.insert(sleCompanionMessages).values({
        sessionId: input.sessionId,
        role: "assistant",
        content: responseText,
        score: evaluation.score,
        corrections: evaluation.corrections,
        suggestions: evaluation.suggestions,
      });

      // Compute rolling average score from all assistant messages
      const allCoachMessages = await db
        .select()
        .from(sleCompanionMessages)
        .where(eq(sleCompanionMessages.sessionId, input.sessionId));
      const allScores = allCoachMessages
        .map((m) => m.score)
        .filter((s): s is number => s !== null && s > 0);
      const rollingAvg = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : evaluation.score;

      // Update session stats (null-safe totalMessages)
      await db
        .update(sleCompanionSessions)
        .set({
          totalMessages: (session.totalMessages ?? 0) + 2,
          averageScore: rollingAvg,
          feedback: evaluation.feedback || null,
        })
        .where(eq(sleCompanionSessions.id, input.sessionId));

      const coach = getCoach(session.coachKey as CoachKey);

      return {
        sessionId: input.sessionId,
        coachResponse: responseText,
        coachVoiceId: coach.id,
        evaluation: {
          score: evaluation.score,
          passed: evaluation.passed,
          feedback: evaluation.feedback,
          corrections: evaluation.corrections,
          suggestions: evaluation.suggestions,
        },
        timestamp: new Date(),
      };
    }),

  // Upload and transcribe audio from user
  uploadAndTranscribeAudio: protectedProcedure
    .input(
      z.object({
        audioBase64: z.string(),
        mimeType: z.string().default("audio/webm"),
        sessionId: z.number(),
        language: z.string().default("fr"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate session exists and verify ownership
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }
      const [session] = await db
        .select()
        .from(sleCompanionSessions)
        .where(eq(sleCompanionSessions.id, input.sessionId))
        .limit(1);
      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }
      // Verify session ownership (protectedProcedure guarantees ctx.user)
      if (session.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this session",
        });
      }

      // Validate audio size (max 10MB)
      const audioBuffer = Buffer.from(input.audioBase64, "base64");
      if (audioBuffer.length > 10 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Audio file too large (max 10MB)",
        });
      }

      // Validate mime type — accept codec suffixes like "audio/webm;codecs=opus"
      const baseMime = input.mimeType.split(";")[0].trim().toLowerCase();
      const allowedMimeTypes = ["audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"];
      if (!allowedMimeTypes.includes(baseMime)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unsupported audio format: ${baseMime}`,
        });
      }

      // Transcribe directly from buffer via OpenAI Whisper — no storage upload needed
      const mimeToExt: Record<string, string> = { "audio/webm": "webm", "audio/wav": "wav", "audio/ogg": "ogg", "audio/mp4": "mp4", "audio/x-m4a": "m4a", "audio/mpeg": "mp3", "audio/mp3": "mp3" };
      const extension = mimeToExt[baseMime] || "mp3";
      const filename = `audio.${extension}`;

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "OpenAI API key not configured",
        });
      }

      // Build FormData with audio buffer directly
      const audioBlob = new Blob([audioBuffer], { type: baseMime });
      const formData = new FormData();
      formData.append("file", audioBlob, filename);
      formData.append("model", "whisper-1");
      formData.append("response_format", "verbose_json");
      if (input.language) {
        formData.append("language", input.language);
      }
      const langName = input.language === "fr" ? "French" : input.language === "en" ? "English" : input.language;
      formData.append("prompt", `Transcription of a Second Language Evaluation oral practice exercise in ${langName}.`);

      const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text().catch(() => "");
        console.error("Whisper STT error:", whisperResponse.status, errorText);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Transcription failed: ${whisperResponse.status} ${errorText.slice(0, 200)}`,
        });
      }

      const whisperData = await whisperResponse.json() as { text: string; language?: string; duration?: number };

      if (!whisperData.text || typeof whisperData.text !== "string") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Whisper returned invalid response",
        });
      }

      return {
        audioUrl: "", // No storage URL — transcribed directly from buffer
        transcription: whisperData.text,
        language: whisperData.language || input.language,
      };
    }),

  // Transcribe audio from URL (legacy)
  transcribeAudio: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string(),
        language: z.string().default("fr"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await transcribeUserAudio(input.audioUrl, input.language);
      
      if ("error" in result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error,
        });
      }

      return result;
    }),

  // End a session
  endSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [session] = await db
        .select()
        .from(sleCompanionSessions)
        .where(eq(sleCompanionSessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      // Verify session ownership (protectedProcedure guarantees ctx.user)
      if (session.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this session",
        });
      }

      // Update session status
      await db
        .update(sleCompanionSessions)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(sleCompanionSessions.id, input.sessionId));

      // Load session state from DB-backed persistence
      const sessionState = await loadSessionState(input.sessionId);
      const difficultyState = sessionState.difficultyState;
      const language: "FR" | "EN" = session.coachKey === "PRECIOSA" ? "EN" : "FR";
      let adaptiveSummary = null;

      if (difficultyState && difficultyState.sessionScores.length > 0) {
        // Build a rough criterion scores from the average session score
        const avgScore = Math.round(
          difficultyState.sessionScores.reduce((a, b) => a + b, 0) / difficultyState.sessionScores.length
        );
        const roughCriterionScores = {
          grammar: avgScore,
          vocabulary: avgScore,
          fluency: avgScore,
          pronunciation: avgScore,
          comprehension: avgScore,
          interaction: avgScore,
          logical_connectors: avgScore,
        };
        adaptiveSummary = buildAdaptiveSessionSummary(
          difficultyState,
          (session.level as "A" | "B" | "C") ?? "B",
          roughCriterionScores,
          language
        );
      }

      // Clean up session state from cache and database
      await clearSessionState(input.sessionId);

      return {
        success: true,
        adaptiveSummary,
      };
    }),

  // Get user's session history
  getSessionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return [];
      }

      const sessions = await db
        .select()
        .from(sleCompanionSessions)
        .where(eq(sleCompanionSessions.userId, ctx.user.id))
        .orderBy(desc(sleCompanionSessions.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return sessions.map((session) => ({
        ...session,
        coach: getCoach(session.coachKey as CoachKey),
      }));
    }),

  // Get messages for a specific session
  getSessionMessages: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [session] = await db
        .select()
        .from(sleCompanionSessions)
        .where(eq(sleCompanionSessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      if (session.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this session",
        });
      }

      const messages = await db
        .select()
        .from(sleCompanionMessages)
        .where(eq(sleCompanionMessages.sessionId, input.sessionId))
        .orderBy(sleCompanionMessages.createdAt);

      return {
        session: {
          ...session,
          coach: getCoach(session.coachKey as CoachKey),
        },
        messages,
      };
    }),

  // Get feedback based on score
  getFeedback: publicProcedure
    .input(z.object({ score: z.number().min(0).max(100) }))
    .query(({ input }) => {
      return getFeedback(input.score);
    }),

  // Get coach voice ID for audio generation
  getCoachVoiceId: publicProcedure
    .input(z.object({ coachKey: z.enum(["STEVEN", "SUE_ANNE", "ERIKA", "PRECIOSA"]) }))
    .query(({ input }) => {
      const coach = COACH_VOICES[input.coachKey as CoachKey];
      return {
        voiceId: coach.id,
        coachName: coach.name,
      };
    }),

  // Generate voice response for coach using MiniMax TTS
  generateVoiceResponse: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(2000),
        coachKey: z.enum(["STEVEN", "SUE_ANNE", "ERIKA", "PRECIOSA"]),
      })
    )
    .mutation(async ({ input }) => {
      const coach = COACH_VOICES[input.coachKey as CoachKey];
      
      return {
        text: input.text,
        voiceId: coach.id,
        coachName: coach.name,
      };
    }),

  // Get session summary with statistics and recommendations
  getSessionSummary: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get session
      const [session] = await db
        .select()
        .from(sleCompanionSessions)
        .where(eq(sleCompanionSessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      if (session.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this session",
        });
      }

      // Get all messages
      const messages = await db
        .select()
        .from(sleCompanionMessages)
        .where(eq(sleCompanionMessages.sessionId, input.sessionId))
        .orderBy(sleCompanionMessages.createdAt);

      // Calculate statistics
      const userMessages = messages.filter((m) => m.role === "user");
      const coachMessages = messages.filter((m) => m.role === "assistant");
      const scores = coachMessages
        .map((m) => m.score)
        .filter((s): s is number => s !== null);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      // Calculate duration
      const startTime = session.createdAt ? new Date(session.createdAt).getTime() : 0;
      const endTime = session.completedAt
        ? new Date(session.completedAt).getTime()
        : Date.now();
      const durationMinutes = Math.round((endTime - startTime) / 60000);

      // Generate recommendations based on performance
      const recommendations: string[] = [];
      if (avgScore < 60) {
        recommendations.push(
          "Pratiquez davantage les structures de phrases de base.",
          "Révisez le vocabulaire professionnel du niveau " + session.level + ".",
          "Écoutez les audios de prononciation dans la bibliothèque audio."
        );
      } else if (avgScore < 80) {
        recommendations.push(
          "Continuez à pratiquer pour améliorer votre fluidité.",
          "Travaillez sur les nuances et expressions idiomatiques.",
          "Essayez des exercices de dictée pour renforcer votre compréhension."
        );
      } else {
        recommendations.push(
          "Excellent travail! Passez au niveau supérieur.",
          "Pratiquez des scénarios plus complexes.",
          "Aidez d'autres apprenants en partageant vos conseils."
        );
      }

      // Skill-specific recommendations
      const skillRecommendations: Record<string, string[]> = {
        oral_expression: [
          "Enregistrez-vous et comparez avec les audios des coaches.",
          "Pratiquez les exercices de répétition.",
        ],
        oral_comprehension: [
          "Écoutez les audios sans regarder la transcription.",
          "Faites des exercices de dictée régulièrement.",
        ],
        written_expression: [
          "Rédigez des courriels professionnels chaque jour.",
          "Utilisez le correcteur pour identifier vos erreurs récurrentes.",
        ],
        written_comprehension: [
          "Lisez des documents officiels en français.",
          "Pratiquez la synthèse de textes.",
        ],
      };

      if (session.skill && skillRecommendations[session.skill]) {
        recommendations.push(...skillRecommendations[session.skill]);
      }

      const coach = getCoach(session.coachKey as CoachKey);

      return {
        session: {
          id: session.id,
          coachId: session.coachKey,
          coachName: coach.name,
          coachImage: coach.avatar,
          level: session.level,
          skill: session.skill,
          topic: session.topic,
          status: session.status,
          createdAt: session.createdAt,
          completedAt: session.completedAt,
        },
        statistics: {
          totalMessages: messages.length,
          userMessages: userMessages.length,
          coachMessages: coachMessages.length,
          averageScore: avgScore,
          highestScore: scores.length > 0 ? Math.max(...scores) : 0,
          lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
          durationMinutes,
        },
        performance: {
          level: avgScore >= 80 ? "excellent" : avgScore >= 60 ? "good" : "needs_improvement",
          progressIndicator: avgScore >= 80 ? "🌟" : avgScore >= 60 ? "📈" : "💪",
          message:
            avgScore >= 80
              ? "Excellent travail! Vous maîtrisez bien ce niveau."
              : avgScore >= 60
              ? "Bon travail! Continuez à pratiquer pour vous améliorer."
              : "Continuez vos efforts! La pratique régulière vous aidera à progresser.",
        },
        recommendations: recommendations.slice(0, 5),
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          score: m.score,
          corrections: m.corrections,
          suggestions: m.suggestions,
          createdAt: m.createdAt,
        })),
      };
    }),
});
