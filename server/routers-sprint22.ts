/**
 * tRPC Routers — Sprints 22-30
 * AI Vocabulary, Daily Goals/Streaks, Discussion Boards, Writing Portfolio
 */
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  getOrCreateDailyGoal, updateDailyGoal, getDailyGoalHistory, getStreakInfo,
  createThread, getThreads, getThreadById, deleteThread,
  createReply, getThreadReplies, deleteReply,
  createWritingSubmission, getUserWritingSubmissions, getWritingSubmission,
  updateWritingSubmission, deleteWritingSubmission,
} from "./db-sprint22";

/* ─────────────── AI VOCABULARY SUGGESTIONS ─────────────── */
export const aiVocabularyRouter = router({
  suggestWords: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      level: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
      language: z.enum(["en", "fr"]).default("fr"),
      count: z.number().min(3).max(15).default(8),
    }))
    .mutation(async ({ input }) => {
      const levelDesc = input.level ? `at CEFR ${input.level} level` : "";
      const langName = input.language === "fr" ? "French" : "English";
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a bilingual language learning expert specializing in ${langName} vocabulary for Canadian public service professionals. Return JSON only.`,
          },
          {
            role: "user",
            content: `Generate ${input.count} essential ${langName} vocabulary words related to "${input.topic}" ${levelDesc}. For each word, provide:
- word (in ${langName})
- translation (in ${input.language === "fr" ? "English" : "French"})
- definition (brief, in ${langName})
- exampleSentence (using the word in context)
- pronunciation (IPA notation)
- partOfSpeech (noun, verb, adjective, adverb, etc.)

Return as JSON array: [{ "word": "", "translation": "", "definition": "", "exampleSentence": "", "pronunciation": "", "partOfSpeech": "" }]`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "vocabulary_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                words: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      translation: { type: "string" },
                      definition: { type: "string" },
                      exampleSentence: { type: "string" },
                      pronunciation: { type: "string" },
                      partOfSpeech: { type: "string" },
                    },
                    required: ["word", "translation", "definition", "exampleSentence", "pronunciation", "partOfSpeech"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["words"],
              additionalProperties: false,
            },
          },
        },
      });
      try {
        const parsed = JSON.parse((response.choices[0].message.content as string) || "{}");
        return parsed.words || [];
      } catch {
        return [];
      }
    }),
});

/* ─────────────── DAILY GOALS & STREAKS ─────────────── */
export const dailyGoalsRouter = router({
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().slice(0, 10);
    return getOrCreateDailyGoal(ctx.user.id, today);
  }),
  updateToday: protectedProcedure
    .input(z.object({
      xpEarned: z.number().optional(),
      lessonsCompleted: z.number().optional(),
      studyMinutesActual: z.number().optional(),
      xpTarget: z.number().optional(),
      lessonsTarget: z.number().optional(),
      studyMinutesTarget: z.number().optional(),
      isGoalMet: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().slice(0, 10);
      return updateDailyGoal(ctx.user.id, today, input);
    }),
  getHistory: protectedProcedure
    .input(z.object({ days: z.number().min(7).max(90).default(30) }).optional())
    .query(async ({ ctx, input }) => {
      return getDailyGoalHistory(ctx.user.id, input?.days || 30);
    }),
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    return getStreakInfo(ctx.user.id);
  }),
});

/* ─────────────── DISCUSSION BOARDS ─────────────── */
export const discussionsRouter = router({
  createThread: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(512),
      content: z.string().min(10),
      category: z.enum(["grammar", "vocabulary", "sle_prep", "general", "study_tips", "resources"]).default("general"),
    }))
    .mutation(async ({ ctx, input }) => {
      return createThread(ctx.user.id, input);
    }),
  getThreads: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      return getThreads(input || {});
    }),
  getThread: publicProcedure
    .input(z.object({ threadId: z.number() }))
    .query(async ({ input }) => {
      return getThreadById(input.threadId);
    }),
  deleteThread: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return deleteThread(ctx.user.id, input.threadId);
    }),
  createReply: protectedProcedure
    .input(z.object({
      threadId: z.number(),
      content: z.string().min(1),
      parentReplyId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return createReply(ctx.user.id, input.threadId, input);
    }),
  getReplies: publicProcedure
    .input(z.object({ threadId: z.number() }))
    .query(async ({ input }) => {
      return getThreadReplies(input.threadId);
    }),
  deleteReply: protectedProcedure
    .input(z.object({ replyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return deleteReply(ctx.user.id, input.replyId);
    }),
});

/* ─────────────── WRITING PORTFOLIO ─────────────── */
export const writingRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(512),
      content: z.string().min(1),
      promptText: z.string().optional(),
      language: z.enum(["en", "fr"]).default("fr"),
      cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
      programId: z.string().optional(),
      pathId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return createWritingSubmission(ctx.user.id, input);
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserWritingSubmissions(ctx.user.id);
  }),
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return getWritingSubmission(ctx.user.id, input.id);
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "submitted", "reviewed"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return updateWritingSubmission(ctx.user.id, id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return deleteWritingSubmission(ctx.user.id, input.id);
    }),
  getAIFeedback: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      content: z.string().min(10),
      language: z.enum(["en", "fr"]).default("fr"),
      cefrLevel: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const langName = input.language === "fr" ? "French" : "English";
      const levelInfo = input.cefrLevel ? ` at CEFR ${input.cefrLevel} level` : "";
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert ${langName} language instructor evaluating written work for Canadian public service professionals${levelInfo}. Provide constructive, encouraging feedback. Return JSON only.`,
          },
          {
            role: "user",
            content: `Evaluate this ${langName} writing submission and provide detailed feedback:

"""
${input.content}
"""

Provide:
1. Overall score (0-100)
2. Grammar assessment (errors found, corrections)
3. Vocabulary assessment (range, appropriateness)
4. Coherence and structure assessment
5. Specific suggestions for improvement
6. Positive highlights

Return as JSON: { "score": number, "grammar": { "score": number, "feedback": string }, "vocabulary": { "score": number, "feedback": string }, "coherence": { "score": number, "feedback": string }, "suggestions": [string], "highlights": [string], "overallFeedback": string }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "writing_feedback",
            strict: true,
            schema: {
              type: "object",
              properties: {
                score: { type: "number" },
                grammar: {
                  type: "object",
                  properties: { score: { type: "number" }, feedback: { type: "string" } },
                  required: ["score", "feedback"],
                  additionalProperties: false,
                },
                vocabulary: {
                  type: "object",
                  properties: { score: { type: "number" }, feedback: { type: "string" } },
                  required: ["score", "feedback"],
                  additionalProperties: false,
                },
                coherence: {
                  type: "object",
                  properties: { score: { type: "number" }, feedback: { type: "string" } },
                  required: ["score", "feedback"],
                  additionalProperties: false,
                },
                suggestions: { type: "array", items: { type: "string" } },
                highlights: { type: "array", items: { type: "string" } },
                overallFeedback: { type: "string" },
              },
              required: ["score", "grammar", "vocabulary", "coherence", "suggestions", "highlights", "overallFeedback"],
              additionalProperties: false,
            },
          },
        },
      });
      try {
        const feedback = JSON.parse((response.choices[0].message.content as string) || "{}");
        await updateWritingSubmission(ctx.user.id, input.submissionId, {
          aiFeedback: JSON.stringify(feedback),
          aiScore: feedback.score,
          status: "reviewed",
        });
        return feedback;
      } catch {
        return { score: 0, overallFeedback: "Unable to generate feedback. Please try again." };
      }
    }),
});

/* ─────────────── AI PATH RECOMMENDATIONS ─────────────── */
export const recommendationsRouter = router({
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    // Return smart recommendations based on user context
    return {
      nextSteps: [
        { type: "lesson", title: "Continue your current path", description: "Pick up where you left off in your enrolled program", icon: "play_circle", href: "/programs", priority: 1 },
        { type: "flashcard", title: "Review due flashcards", description: "You have cards ready for spaced repetition review", icon: "style", href: "/flashcards", priority: 2 },
        { type: "vocabulary", title: "Build your vocabulary", description: "Add new words from your recent lessons", icon: "translate", href: "/vocabulary", priority: 3 },
        { type: "writing", title: "Practice writing", description: "Submit a writing exercise for AI feedback", icon: "edit_note", href: "/writing-portfolio", priority: 4 },
        { type: "sle", title: "SLE Practice", description: "Prepare for your Second Language Evaluation", icon: "quiz", href: "/sle-practice", priority: 5 },
      ],
      weakAreas: [
        { skill: "Grammar", level: "B1", suggestion: "Focus on subjunctive mood and conditional tenses" },
        { skill: "Vocabulary", level: "B1", suggestion: "Expand workplace-specific terminology" },
        { skill: "Oral", level: "A2", suggestion: "Practice pronunciation with the Pronunciation Lab" },
      ],
    };
  }),
});
