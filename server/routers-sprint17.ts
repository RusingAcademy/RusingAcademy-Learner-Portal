/**
 * Sprint 17-20 tRPC Routers — Notes, Flashcards, Study Sessions, Vocabulary
 */
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as s17db from "./db-sprint17";

export const notesRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(200).optional() }).optional())
    .query(async ({ ctx, input }) => s17db.getUserNotes(ctx.user.id, input?.limit ?? 50)),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      content: z.string().min(1),
      tags: z.array(z.string()).optional(),
      programId: z.string().optional(),
      pathId: z.string().optional(),
      lessonId: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => s17db.createNote({ userId: ctx.user.id, ...input })),

  update: protectedProcedure
    .input(z.object({
      noteId: z.number(),
      title: z.string().min(1).max(256).optional(),
      content: z.string().min(1).optional(),
      tags: z.array(z.string()).optional(),
      isPinned: z.boolean().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { noteId, ...data } = input;
      return s17db.updateNote(noteId, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ ctx, input }) => s17db.deleteNote(input.noteId, ctx.user.id)),
});

export const flashcardsRouter = router({
  // Decks
  listDecks: protectedProcedure.query(async ({ ctx }) => s17db.getUserDecks(ctx.user.id)),

  createDeck: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(256),
      description: z.string().optional(),
      programId: z.string().optional(),
      pathId: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => s17db.createDeck({ userId: ctx.user.id, ...input })),

  updateDeck: protectedProcedure
    .input(z.object({
      deckId: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { deckId, ...data } = input;
      return s17db.updateDeck(deckId, ctx.user.id, data);
    }),

  deleteDeck: protectedProcedure
    .input(z.object({ deckId: z.number() }))
    .mutation(async ({ ctx, input }) => s17db.deleteDeck(input.deckId, ctx.user.id)),

  // Cards
  listCards: protectedProcedure
    .input(z.object({ deckId: z.number() }))
    .query(async ({ ctx, input }) => s17db.getDeckCards(input.deckId, ctx.user.id)),

  createCard: protectedProcedure
    .input(z.object({
      deckId: z.number(),
      front: z.string().min(1),
      back: z.string().min(1),
      hint: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => s17db.createCard({ userId: ctx.user.id, ...input })),

  updateCard: protectedProcedure
    .input(z.object({
      cardId: z.number(),
      front: z.string().optional(),
      back: z.string().optional(),
      hint: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { cardId, ...data } = input;
      return s17db.updateCard(cardId, ctx.user.id, data);
    }),

  deleteCard: protectedProcedure
    .input(z.object({ cardId: z.number(), deckId: z.number() }))
    .mutation(async ({ ctx, input }) => s17db.deleteCard(input.cardId, ctx.user.id, input.deckId)),

  // Review (SM-2)
  getDueCards: protectedProcedure
    .input(z.object({ deckId: z.number().optional(), limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => s17db.getDueCards(ctx.user.id, input?.deckId, input?.limit ?? 20)),

  reviewCard: protectedProcedure
    .input(z.object({ cardId: z.number(), quality: z.number().min(0).max(5) }))
    .mutation(async ({ ctx, input }) => s17db.reviewCard(input.cardId, ctx.user.id, input.quality)),

  getStats: protectedProcedure.query(async ({ ctx }) => s17db.getFlashcardStats(ctx.user.id)),
});

export const studyPlannerRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(200).optional() }).optional())
    .query(async ({ ctx, input }) => s17db.getUserStudySessions(ctx.user.id, input?.limit ?? 50)),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      description: z.string().optional(),
      sessionType: z.enum(["lesson", "quiz", "sle_practice", "flashcard_review", "tutoring", "custom"]).optional(),
      scheduledDate: z.string(),
      scheduledTime: z.string().optional(),
      durationMinutes: z.number().min(5).max(480).optional(),
      programId: z.string().optional(),
      pathId: z.string().optional(),
      lessonId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => s17db.createStudySession({ userId: ctx.user.id, ...input })),

  update: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      scheduledDate: z.string().optional(),
      scheduledTime: z.string().optional(),
      durationMinutes: z.number().optional(),
      isCompleted: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId, ...data } = input;
      return s17db.updateStudySession(sessionId, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => s17db.deleteStudySession(input.sessionId, ctx.user.id)),

  upcoming: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(30).optional() }).optional())
    .query(async ({ ctx, input }) => s17db.getUpcomingSessions(ctx.user.id, input?.days ?? 7)),
});

export const vocabularyRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(500).optional() }).optional())
    .query(async ({ ctx, input }) => s17db.getUserVocabulary(ctx.user.id, input?.limit ?? 100)),

  add: protectedProcedure
    .input(z.object({
      word: z.string().min(1).max(256),
      translation: z.string().min(1).max(256),
      definition: z.string().optional(),
      exampleSentence: z.string().optional(),
      pronunciation: z.string().optional(),
      partOfSpeech: z.string().optional(),
      programId: z.string().optional(),
      pathId: z.string().optional(),
      lessonId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => s17db.addVocabularyItem({ userId: ctx.user.id, ...input })),

  review: protectedProcedure
    .input(z.object({ itemId: z.number(), correct: z.boolean() }))
    .mutation(async ({ ctx, input }) => s17db.updateVocabularyMastery(input.itemId, ctx.user.id, input.correct)),

  delete: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ ctx, input }) => s17db.deleteVocabularyItem(input.itemId, ctx.user.id)),

  stats: protectedProcedure.query(async ({ ctx }) => s17db.getVocabularyStats(ctx.user.id)),
});
