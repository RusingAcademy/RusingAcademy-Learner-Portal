/**
 * routers-cms.ts — tRPC router for the CMS (Course Content Management System)
 * All procedures are admin-only (protectedProcedure + role check)
 */
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as cmsDb from "./db-cms";
import { storagePut } from "./storage";

/** Middleware: require admin role */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/* ═══════════════════════ PROGRAMS ═══════════════════════ */
const programsRouter = router({
  list: adminProcedure.query(() => cmsDb.listPrograms()),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getProgram(input.id)),

  getTree: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getProgramTree(input.id)),

  create: adminProcedure
    .input(z.object({
      slug: z.string().min(1).max(32),
      title: z.string().min(1).max(256),
      titleFr: z.string().min(1).max(256),
      description: z.string().optional(),
      descriptionFr: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      coverUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
      status: z.enum(["draft", "review", "published"]).optional(),
    }))
    .mutation(({ input, ctx }) => cmsDb.createProgram({ ...input, createdBy: ctx.user.id })),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      slug: z.string().min(1).max(32).optional(),
      title: z.string().min(1).max(256).optional(),
      titleFr: z.string().min(1).max(256).optional(),
      description: z.string().optional(),
      descriptionFr: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      coverUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
      status: z.enum(["draft", "review", "published"]).optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return cmsDb.updateProgram(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => cmsDb.deleteProgram(input.id)),
});

/* ═══════════════════════ PATHS ═══════════════════════ */
const pathsRouter = router({
  list: adminProcedure
    .input(z.object({ programId: z.number().optional() }).optional())
    .query(({ input }) => cmsDb.listPaths(input?.programId)),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getPath(input.id)),

  create: adminProcedure
    .input(z.object({
      programId: z.number(),
      slug: z.string().min(1).max(64),
      number: z.string().min(1).max(8),
      title: z.string().min(1).max(256),
      titleFr: z.string().min(1).max(256),
      subtitle: z.string().optional(),
      subtitleFr: z.string().optional(),
      cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C1+"]),
      color: z.string().optional(),
      coverUrl: z.string().optional(),
      badgeUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
      status: z.enum(["draft", "review", "published"]).optional(),
    }))
    .mutation(({ input, ctx }) => cmsDb.createPath({ ...input, createdBy: ctx.user.id })),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      programId: z.number().optional(),
      slug: z.string().min(1).max(64).optional(),
      number: z.string().min(1).max(8).optional(),
      title: z.string().min(1).max(256).optional(),
      titleFr: z.string().min(1).max(256).optional(),
      subtitle: z.string().optional(),
      subtitleFr: z.string().optional(),
      cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C1+"]).optional(),
      color: z.string().optional(),
      coverUrl: z.string().optional(),
      badgeUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
      status: z.enum(["draft", "review", "published"]).optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return cmsDb.updatePath(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => cmsDb.deletePath(input.id)),
});

/* ═══════════════════════ MODULES ═══════════════════════ */
const modulesRouter = router({
  list: adminProcedure
    .input(z.object({ pathId: z.number() }))
    .query(({ input }) => cmsDb.listModules(input.pathId)),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getModule(input.id)),

  create: adminProcedure
    .input(z.object({
      pathId: z.number(),
      title: z.string().min(1).max(256),
      titleFr: z.string().min(1).max(256),
      description: z.string().optional(),
      descriptionFr: z.string().optional(),
      badgeUrl: z.string().optional(),
      quizPassingScore: z.number().min(0).max(100).optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
      status: z.enum(["draft", "review", "published"]).optional(),
    }))
    .mutation(({ input }) => cmsDb.createModule(input)),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      pathId: z.number().optional(),
      title: z.string().min(1).max(256).optional(),
      titleFr: z.string().min(1).max(256).optional(),
      description: z.string().optional(),
      descriptionFr: z.string().optional(),
      badgeUrl: z.string().optional(),
      quizPassingScore: z.number().min(0).max(100).optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
      status: z.enum(["draft", "review", "published"]).optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return cmsDb.updateModule(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => cmsDb.deleteModule(input.id)),
});

/* ═══════════════════════ LESSONS ═══════════════════════ */
const lessonsRouter = router({
  list: adminProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(({ input }) => cmsDb.listLessons(input.moduleId)),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getLesson(input.id)),

  getFull: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getFullLesson(input.id)),

  create: adminProcedure
    .input(z.object({
      moduleId: z.number(),
      lessonNumber: z.string().min(1).max(16),
      title: z.string().min(1).max(256),
      titleFr: z.string().min(1).max(256),
      duration: z.string().optional(),
      xpReward: z.number().optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
      status: z.enum(["draft", "review", "published"]).optional(),
    }))
    .mutation(({ input }) => cmsDb.createLesson(input)),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      moduleId: z.number().optional(),
      lessonNumber: z.string().min(1).max(16).optional(),
      title: z.string().min(1).max(256).optional(),
      titleFr: z.string().min(1).max(256).optional(),
      duration: z.string().optional(),
      xpReward: z.number().optional(),
      sortOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
      status: z.enum(["draft", "review", "published"]).optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return cmsDb.updateLesson(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => cmsDb.deleteLesson(input.id)),
});

/* ═══════════════════════ LESSON SLOTS ═══════════════════════ */
const slotsRouter = router({
  list: adminProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(({ input }) => cmsDb.listLessonSlots(input.lessonId)),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getLessonSlot(input.id)),

  create: adminProcedure
    .input(z.object({
      lessonId: z.number(),
      slotType: z.enum(["hook", "video", "strategy", "written", "oral", "quiz", "coaching"]),
      title: z.string().min(1).max(256),
      titleFr: z.string().optional(),
      content: z.string().min(1),
      contentFr: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(({ input }) => cmsDb.createLessonSlot(input)),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      lessonId: z.number().optional(),
      slotType: z.enum(["hook", "video", "strategy", "written", "oral", "quiz", "coaching"]).optional(),
      title: z.string().min(1).max(256).optional(),
      titleFr: z.string().optional(),
      content: z.string().min(1).optional(),
      contentFr: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return cmsDb.updateLessonSlot(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => cmsDb.deleteLessonSlot(input.id)),
});

/* ═══════════════════════ QUIZZES ═══════════════════════ */
const quizzesRouter = router({
  list: adminProcedure
    .input(z.object({ lessonId: z.number().optional(), moduleId: z.number().optional() }).optional())
    .query(({ input }) => cmsDb.listQuizzes(input ?? undefined)),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getQuiz(input.id)),

  create: adminProcedure
    .input(z.object({
      lessonId: z.number().optional(),
      moduleId: z.number().optional(),
      title: z.string().min(1).max(256),
      titleFr: z.string().optional(),
      quizType: z.enum(["formative", "summative", "final_exam", "placement"]).optional(),
      passingScore: z.number().min(0).max(100).optional(),
      timeLimitMinutes: z.number().optional(),
      isPublished: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(({ input }) => cmsDb.createQuiz(input)),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      lessonId: z.number().optional(),
      moduleId: z.number().optional(),
      title: z.string().min(1).max(256).optional(),
      titleFr: z.string().optional(),
      quizType: z.enum(["formative", "summative", "final_exam", "placement"]).optional(),
      passingScore: z.number().min(0).max(100).optional(),
      timeLimitMinutes: z.number().optional(),
      isPublished: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return cmsDb.updateQuiz(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => cmsDb.deleteQuiz(input.id)),
});

/* ═══════════════════════ QUIZ QUESTIONS ═══════════════════════ */
const questionsRouter = router({
  list: adminProcedure
    .input(z.object({ quizId: z.number() }))
    .query(({ input }) => cmsDb.listQuizQuestions(input.quizId)),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => cmsDb.getQuizQuestion(input.id)),

  create: adminProcedure
    .input(z.object({
      quizId: z.number(),
      questionType: z.enum(["multiple_choice", "fill_in_blank", "true_false", "matching", "ordering"]).optional(),
      question: z.string().min(1),
      questionFr: z.string().optional(),
      options: z.array(z.string()).optional(),
      optionsFr: z.array(z.string()).optional(),
      correctAnswer: z.string().min(1),
      correctAnswerFr: z.string().optional(),
      feedback: z.string().optional(),
      feedbackFr: z.string().optional(),
      points: z.number().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(({ input }) => cmsDb.createQuizQuestion(input)),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      quizId: z.number().optional(),
      questionType: z.enum(["multiple_choice", "fill_in_blank", "true_false", "matching", "ordering"]).optional(),
      question: z.string().min(1).optional(),
      questionFr: z.string().optional(),
      options: z.array(z.string()).optional(),
      optionsFr: z.array(z.string()).optional(),
      correctAnswer: z.string().min(1).optional(),
      correctAnswerFr: z.string().optional(),
      feedback: z.string().optional(),
      feedbackFr: z.string().optional(),
      points: z.number().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return cmsDb.updateQuizQuestion(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => cmsDb.deleteQuizQuestion(input.id)),
});

/* ═══════════════════════ MEDIA ═══════════════════════ */
const mediaRouter = router({
  list: adminProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(({ input }) => cmsDb.listMediaAssets(input?.category)),

  upload: adminProcedure
    .input(z.object({
      filename: z.string(),
      base64Data: z.string(),
      mimeType: z.string(),
      altText: z.string().optional(),
      altTextFr: z.string().optional(),
      category: z.enum(["cover", "badge", "lesson_image", "audio", "video", "document", "other"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.base64Data, "base64");
      const ext = input.filename.split(".").pop() || "bin";
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `cms-media/${ctx.user.id}/${Date.now()}-${randomSuffix}.${ext}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      const asset = await cmsDb.createMediaAsset({
        filename: input.filename,
        fileUrl: url,
        fileKey,
        mimeType: input.mimeType,
        fileSizeBytes: buffer.length,
        altText: input.altText,
        altTextFr: input.altTextFr,
        category: input.category ?? "other",
        uploadedBy: ctx.user.id,
      });
      return { ...asset, url };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => cmsDb.deleteMediaAsset(input.id)),
});

/* ═══════════════════════ WORKFLOW ═══════════════════════ */
const workflowRouter = router({
  /** Update status of any CMS entity */
  updateStatus: adminProcedure
    .input(z.object({
      entityType: z.enum(["program", "path", "module", "lesson"]),
      id: z.number(),
      status: z.enum(["draft", "review", "published"]),
    }))
    .mutation(async ({ input }) => {
      const { entityType, id, status } = input;
      switch (entityType) {
        case "program": return cmsDb.updateProgram(id, { status });
        case "path": return cmsDb.updatePath(id, { status });
        case "module": return cmsDb.updateModule(id, { status });
        case "lesson": return cmsDb.updateLesson(id, { status });
      }
    }),

  /** Bulk update status for multiple entities */
  bulkUpdateStatus: adminProcedure
    .input(z.object({
      entityType: z.enum(["program", "path", "module", "lesson"]),
      ids: z.array(z.number()).min(1),
      status: z.enum(["draft", "review", "published"]),
    }))
    .mutation(async ({ input }) => {
      const { entityType, ids, status } = input;
      const results = [];
      for (const id of ids) {
        switch (entityType) {
          case "program": results.push(await cmsDb.updateProgram(id, { status })); break;
          case "path": results.push(await cmsDb.updatePath(id, { status })); break;
          case "module": results.push(await cmsDb.updateModule(id, { status })); break;
          case "lesson": results.push(await cmsDb.updateLesson(id, { status })); break;
        }
      }
      return { updated: results.length };
    }),
});

/* ═══════════════════════ STATS ═══════════════════════ */
const statsRouter = router({
  overview: adminProcedure.query(() => cmsDb.getCmsStats()),
});

/* ═══════════════════════ PUBLIC (Learner-facing) ═══════════════════════ */
const publicCmsRouter = router({
  /** List all published programs */
  listPrograms: publicProcedure.query(() => cmsDb.listPublishedPrograms()),

  /** Get a published program with full tree (paths → modules → lessons) */
  getProgram: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => cmsDb.getPublishedProgramBySlug(input.slug)),

  /** Get program stats */
  getProgramStats: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => cmsDb.getPublishedProgramStats(input.slug)),

  /** Get a published path with modules and lessons */
  getPath: publicProcedure
    .input(z.object({ programSlug: z.string(), pathSlug: z.string() }))
    .query(({ input }) => cmsDb.getPublishedPath(input.programSlug, input.pathSlug)),

  /** Get a full lesson with slots and quiz */
  getLesson: publicProcedure
    .input(z.object({ programSlug: z.string(), lessonNumber: z.string() }))
    .query(({ input }) => cmsDb.getPublishedLesson(input.programSlug, input.lessonNumber)),
});

/* ═══════════════════════ COMBINED CMS ROUTER ═══════════════════════ */
export const cmsRouter = router({
  programs: programsRouter,
  paths: pathsRouter,
  modules: modulesRouter,
  lessons: lessonsRouter,
  slots: slotsRouter,
  quizzes: quizzesRouter,
  questions: questionsRouter,
  media: mediaRouter,
  workflow: workflowRouter,
  stats: statsRouter,
  public: publicCmsRouter,
});
