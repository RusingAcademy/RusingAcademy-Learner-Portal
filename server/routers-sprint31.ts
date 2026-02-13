/**
 * tRPC Routers — Sprints 31-40
 * Certificates, Reading Lab, Listening Lab, Grammar Drills, Peer Reviews, Analytics
 */
import { z } from "zod";
import { router } from "./_core/trpc";
import { protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db31 from "./db-sprint31";

/* ─────────────── CERTIFICATES ─────────────── */
export const certificateRouter = router({
  generate: protectedProcedure
    .input(z.object({
      type: z.enum(["path_completion", "level_achievement", "challenge_winner"]),
      title: z.string().min(1),
      titleFr: z.string().optional(),
      description: z.string().optional(),
      descriptionFr: z.string().optional(),
      pathId: z.string().optional(),
      cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db31.createCertificate({ userId: ctx.user.id, ...input });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return db31.getUserCertificates(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db31.getCertificateById(input.id);
    }),
});

/* ─────────────── READING LAB ─────────────── */
export const readingLabRouter = router({
  saveResult: protectedProcedure
    .input(z.object({
      passageTitle: z.string().min(1),
      cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]),
      wordsPerMinute: z.number().optional(),
      score: z.number().min(0).max(100).optional(),
      totalQuestions: z.number().min(1),
      correctAnswers: z.number().min(0),
      timeSpentSeconds: z.number().optional(),
      language: z.enum(["en", "fr"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db31.saveReadingResult({ userId: ctx.user.id, ...input });
    }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db31.getUserReadingHistory(ctx.user.id, input?.limit);
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return db31.getUserReadingStats(ctx.user.id);
  }),
});

/* ─────────────── LISTENING LAB ─────────────── */
export const listeningLabRouter = router({
  saveResult: protectedProcedure
    .input(z.object({
      exerciseTitle: z.string().min(1),
      cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]),
      score: z.number().min(0).max(100).optional(),
      totalQuestions: z.number().min(1),
      correctAnswers: z.number().min(0),
      timeSpentSeconds: z.number().optional(),
      language: z.enum(["en", "fr"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db31.saveListeningResult({ userId: ctx.user.id, ...input });
    }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db31.getUserListeningHistory(ctx.user.id, input?.limit);
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return db31.getUserListeningStats(ctx.user.id);
  }),
});

/* ─────────────── GRAMMAR DRILLS ─────────────── */
export const grammarDrillsRouter = router({
  saveResult: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]),
      drillType: z.enum(["fill_blank", "conjugation", "reorder", "multiple_choice"]),
      score: z.number().min(0).max(100).optional(),
      totalQuestions: z.number().min(1),
      correctAnswers: z.number().min(0),
      timeSpentSeconds: z.number().optional(),
      language: z.enum(["en", "fr"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db31.saveGrammarDrillResult({ userId: ctx.user.id, ...input });
    }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db31.getUserGrammarHistory(ctx.user.id, input?.limit);
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return db31.getUserGrammarStats(ctx.user.id);
  }),

  statsByTopic: protectedProcedure.query(async ({ ctx }) => {
    return db31.getGrammarStatsByTopic(ctx.user.id);
  }),
});

/* ─────────────── PEER REVIEWS ─────────────── */
export const peerReviewRouter = router({
  create: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      authorId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db31.createPeerReview({ reviewerId: ctx.user.id, ...input });
    }),

  complete: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
      grammarScore: z.number().min(0).max(100),
      vocabularyScore: z.number().min(0).max(100),
      coherenceScore: z.number().min(0).max(100),
      overallScore: z.number().min(0).max(100),
      feedback: z.string().min(1),
      strengths: z.string().optional(),
      improvements: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db31.completePeerReview(input.reviewId, input);
    }),

  forSubmission: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .query(async ({ input }) => {
      return db31.getReviewsForSubmission(input.submissionId);
    }),

  pending: protectedProcedure.query(async ({ ctx }) => {
    return db31.getPendingReviews(ctx.user.id);
  }),

  completed: protectedProcedure.query(async ({ ctx }) => {
    return db31.getCompletedReviewsByUser(ctx.user.id);
  }),
});
