/**
 * tRPC Routers — Sprints 41-50
 * Mock SLE Exams, Coach Dashboard, Study Groups, Bookmarks, Dictation, Search, Onboarding, Daily Review
 */
import { z } from "zod";
import { router } from "./_core/trpc";
import { protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db41 from "./db-sprint41";
import { invokeLLM } from "./_core/llm";

/* ─────────────── MOCK SLE EXAMS ─────────────── */
export const mockSleRouter = router({
  create: protectedProcedure.input(z.object({
    examType: z.enum(["reading", "writing", "oral"]),
    cefrLevel: z.string().default("B1"),
  })).mutation(async ({ ctx, input }) => {
    const timeLimits: Record<string, number> = { reading: 5400, writing: 5400, oral: 3600 };
    const questionCounts: Record<string, number> = { reading: 20, writing: 3, oral: 15 };
    return db41.createMockExam({
      userId: ctx.user.id,
      examType: input.examType,
      cefrLevel: input.cefrLevel,
      totalQuestions: questionCounts[input.examType],
      timeLimitSeconds: timeLimits[input.examType],
    });
  }),
  complete: protectedProcedure.input(z.object({
    examId: z.number(),
    correctAnswers: z.number(),
    score: z.number(),
    timeUsedSeconds: z.number(),
    answers: z.any(),
  })).mutation(async ({ input }) => {
    await db41.completeMockExam(input.examId, {
      correctAnswers: input.correctAnswers,
      score: input.score,
      timeUsedSeconds: input.timeUsedSeconds,
      answers: input.answers,
    });
    return { success: true };
  }),
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    return db41.getUserMockExams(ctx.user.id);
  }),
  getById: protectedProcedure.input(z.object({ examId: z.number() })).query(async ({ input }) => {
    return db41.getMockExamById(input.examId);
  }),
  generateQuestions: protectedProcedure.input(z.object({
    examType: z.enum(["reading", "writing", "oral"]),
    cefrLevel: z.string().default("B1"),
  })).mutation(async ({ input }) => {
    const prompts: Record<string, string> = {
      reading: `Generate a mock SLE reading comprehension exam at CEFR ${input.cefrLevel} level for Canadian public servants. Include 5 passages with 4 multiple-choice questions each (20 total). Return JSON: { passages: [{ title, text, questions: [{ prompt, options: [A,B,C,D], correctAnswer }] }] }`,
      writing: `Generate 3 SLE writing prompts at CEFR ${input.cefrLevel} level for Canadian public servants. Include a memo, an email, and a report prompt. Return JSON: { prompts: [{ type, scenario, instructions, wordLimit }] }`,
      oral: `Generate 15 SLE oral comprehension questions at CEFR ${input.cefrLevel} level for Canadian public servants. Include audio scenario descriptions with multiple-choice questions. Return JSON: { questions: [{ scenario, prompt, options: [A,B,C,D], correctAnswer }] }`,
    };
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert SLE exam designer for Canada's federal public service. Return only valid JSON." },
          { role: "user", content: prompts[input.examType] },
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices?.[0]?.message?.content as string;
      return JSON.parse(content);
    } catch {
      return null;
    }
  }),
});

/* ─────────────── COACH DASHBOARD ─────────────── */
export const coachRouter = router({
  getStudents: protectedProcedure.query(async ({ ctx }) => {
    return db41.getCoachStudents(ctx.user.id);
  }),
  getMyCoach: protectedProcedure.query(async ({ ctx }) => {
    return db41.getStudentCoach(ctx.user.id);
  }),
  assignStudent: protectedProcedure.input(z.object({
    studentId: z.number(),
    notes: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    return db41.createCoachAssignment({
      coachId: ctx.user.id,
      studentId: input.studentId,
      notes: input.notes,
    });
  }),
  updateAssignment: protectedProcedure.input(z.object({
    id: z.number(),
    status: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    await db41.updateCoachAssignment(input.id, { status: input.status, notes: input.notes });
    return { success: true };
  }),
});

/* ─────────────── STUDY GROUPS ─────────────── */
export const studyGroupRouter = router({
  create: protectedProcedure.input(z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    maxMembers: z.number().min(2).max(50).default(10),
    cefrLevel: z.string().default("B1"),
    isPublic: z.boolean().default(true),
  })).mutation(async ({ ctx, input }) => {
    return db41.createStudyGroup({ ...input, creatorId: ctx.user.id });
  }),
  getPublic: publicProcedure.query(async () => {
    return db41.getPublicStudyGroups();
  }),
  getMine: protectedProcedure.query(async ({ ctx }) => {
    return db41.getUserStudyGroups(ctx.user.id);
  }),
  join: protectedProcedure.input(z.object({ groupId: z.number() })).mutation(async ({ ctx, input }) => {
    await db41.joinStudyGroup(input.groupId, ctx.user.id);
    return { success: true };
  }),
  leave: protectedProcedure.input(z.object({ groupId: z.number() })).mutation(async ({ ctx, input }) => {
    await db41.leaveStudyGroup(input.groupId, ctx.user.id);
    return { success: true };
  }),
  getMembers: protectedProcedure.input(z.object({ groupId: z.number() })).query(async ({ input }) => {
    return db41.getGroupMembers(input.groupId);
  }),
});

/* ─────────────── BOOKMARKS ─────────────── */
export const bookmarkRouter = router({
  add: protectedProcedure.input(z.object({
    itemType: z.enum(["lesson", "note", "vocabulary", "discussion", "flashcard_deck"]),
    itemId: z.number(),
    itemTitle: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    return db41.createBookmark({ userId: ctx.user.id, ...input });
  }),
  remove: protectedProcedure.input(z.object({
    itemType: z.string(),
    itemId: z.number(),
  })).mutation(async ({ ctx, input }) => {
    await db41.removeBookmark(ctx.user.id, input.itemType, input.itemId);
    return { success: true };
  }),
  getAll: protectedProcedure.input(z.object({
    itemType: z.string().optional(),
  }).optional()).query(async ({ ctx, input }) => {
    return db41.getUserBookmarks(ctx.user.id, input?.itemType);
  }),
  isBookmarked: protectedProcedure.input(z.object({
    itemType: z.string(),
    itemId: z.number(),
  })).query(async ({ ctx, input }) => {
    return db41.isBookmarked(ctx.user.id, input.itemType, input.itemId);
  }),
});

/* ─────────────── DICTATION ─────────────── */
export const dictationRouter = router({
  saveResult: protectedProcedure.input(z.object({
    cefrLevel: z.string(),
    totalSentences: z.number(),
    correctSentences: z.number(),
    accuracy: z.number(),
    timeSpentSeconds: z.number(),
  })).mutation(async ({ ctx, input }) => {
    return db41.saveDictationResult({ userId: ctx.user.id, ...input });
  }),
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    return db41.getUserDictationHistory(ctx.user.id);
  }),
  generateSentences: protectedProcedure.input(z.object({
    cefrLevel: z.string().default("B1"),
    count: z.number().min(3).max(15).default(8),
  })).mutation(async ({ input }) => {
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a French language teacher. Generate dictation sentences. Return only valid JSON." },
          { role: "user", content: `Generate ${input.count} French dictation sentences at CEFR ${input.cefrLevel} level. Include varied vocabulary and grammar structures relevant to Canadian public service contexts. Return JSON: { sentences: [{ text: "...", translation: "...", difficulty: "easy|medium|hard" }] }` },
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices?.[0]?.message?.content as string;
      return JSON.parse(content);
    } catch {
      return { sentences: [] };
    }
  }),
});

/* ─────────────── GLOBAL SEARCH ─────────────── */
export const searchRouter = router({
  global: protectedProcedure.input(z.object({
    query: z.string().min(1).max(200),
  })).query(async ({ ctx, input }) => {
    return db41.globalSearch(ctx.user.id, input.query);
  }),
});

/* ─────────────── ONBOARDING ─────────────── */
export const onboardingRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return db41.getOnboardingProfile(ctx.user.id);
  }),
  save: protectedProcedure.input(z.object({
    currentLevel: z.string(),
    targetLevel: z.string(),
    learningGoal: z.string(),
    weeklyHours: z.number().min(1).max(40),
    preferredTime: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return db41.saveOnboardingProfile({ userId: ctx.user.id, ...input });
  }),
});

/* ─────────────── DAILY REVIEW (Spaced Repetition) ─────────────── */
export const dailyReviewRouter = router({
  getDueCards: protectedProcedure.query(async ({ ctx }) => {
    return db41.getDueFlashcards(ctx.user.id);
  }),
});
