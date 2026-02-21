/**
 * db-cms.ts — Database helpers for the CMS (Course Content Management System)
 * CRUD operations for programs, paths, modules, lessons, slots, quizzes, questions, media
 */
import { getDb } from "./db";
import { eq, asc, desc, and, sql } from "drizzle-orm";
import {
  cmsPrograms, cmsPaths, cmsModules, cmsLessons, cmsLessonSlots,
  cmsQuizzes, cmsQuizQuestions, cmsMediaAssets,
  type InsertCmsProgram, type InsertCmsPath, type InsertCmsModule,
  type InsertCmsLesson, type InsertCmsLessonSlot, type InsertCmsQuiz,
  type InsertCmsQuizQuestion, type InsertCmsMediaAsset,
} from "../drizzle/schema";

/* ═══════════════════════ PROGRAMS ═══════════════════════ */

export async function listPrograms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cmsPrograms).orderBy(asc(cmsPrograms.sortOrder));
}

export async function getProgram(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsPrograms).where(eq(cmsPrograms.id, id));
  return row ?? null;
}

export async function getProgramBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsPrograms).where(eq(cmsPrograms.slug, slug));
  return row ?? null;
}

export async function createProgram(data: Omit<InsertCmsProgram, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(cmsPrograms).values(data);
  return { id: result.insertId };
}

export async function updateProgram(id: number, data: Partial<InsertCmsProgram>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cmsPrograms).set(data).where(eq(cmsPrograms.id, id));
  return getProgram(id);
}

export async function deleteProgram(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsPrograms).where(eq(cmsPrograms.id, id));
  return { success: true };
}

/* ═══════════════════════ PATHS ═══════════════════════ */

export async function listPaths(programId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (programId) {
    return db.select().from(cmsPaths).where(eq(cmsPaths.programId, programId)).orderBy(asc(cmsPaths.sortOrder));
  }
  return db.select().from(cmsPaths).orderBy(asc(cmsPaths.sortOrder));
}

export async function getPath(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsPaths).where(eq(cmsPaths.id, id));
  return row ?? null;
}

export async function createPath(data: Omit<InsertCmsPath, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(cmsPaths).values(data);
  return { id: result.insertId };
}

export async function updatePath(id: number, data: Partial<InsertCmsPath>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cmsPaths).set(data).where(eq(cmsPaths.id, id));
  return getPath(id);
}

export async function deletePath(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsPaths).where(eq(cmsPaths.id, id));
  return { success: true };
}

/* ═══════════════════════ MODULES ═══════════════════════ */

export async function listModules(pathId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cmsModules).where(eq(cmsModules.pathId, pathId)).orderBy(asc(cmsModules.sortOrder));
}

export async function getModule(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsModules).where(eq(cmsModules.id, id));
  return row ?? null;
}

export async function createModule(data: Omit<InsertCmsModule, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(cmsModules).values(data);
  return { id: result.insertId };
}

export async function updateModule(id: number, data: Partial<InsertCmsModule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cmsModules).set(data).where(eq(cmsModules.id, id));
  return getModule(id);
}

export async function deleteModule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsModules).where(eq(cmsModules.id, id));
  return { success: true };
}

/* ═══════════════════════ LESSONS ═══════════════════════ */

export async function listLessons(moduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cmsLessons).where(eq(cmsLessons.moduleId, moduleId)).orderBy(asc(cmsLessons.sortOrder));
}

export async function getLesson(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsLessons).where(eq(cmsLessons.id, id));
  return row ?? null;
}

export async function createLesson(data: Omit<InsertCmsLesson, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(cmsLessons).values(data);
  return { id: result.insertId };
}

export async function updateLesson(id: number, data: Partial<InsertCmsLesson>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cmsLessons).set(data).where(eq(cmsLessons.id, id));
  return getLesson(id);
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsLessons).where(eq(cmsLessons.id, id));
  return { success: true };
}

/* ═══════════════════════ LESSON SLOTS ═══════════════════════ */

export async function listLessonSlots(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cmsLessonSlots).where(eq(cmsLessonSlots.lessonId, lessonId)).orderBy(asc(cmsLessonSlots.sortOrder));
}

export async function getLessonSlot(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsLessonSlots).where(eq(cmsLessonSlots.id, id));
  return row ?? null;
}

export async function createLessonSlot(data: Omit<InsertCmsLessonSlot, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(cmsLessonSlots).values(data);
  return { id: result.insertId };
}

export async function updateLessonSlot(id: number, data: Partial<InsertCmsLessonSlot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cmsLessonSlots).set(data).where(eq(cmsLessonSlots.id, id));
  return getLessonSlot(id);
}

export async function deleteLessonSlot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsLessonSlots).where(eq(cmsLessonSlots.id, id));
  return { success: true };
}

/* ═══════════════════════ QUIZZES ═══════════════════════ */

export async function listQuizzes(opts?: { lessonId?: number; moduleId?: number }) {
  const db = await getDb();
  if (!db) return [];
  if (opts?.lessonId) {
    return db.select().from(cmsQuizzes).where(eq(cmsQuizzes.lessonId, opts.lessonId)).orderBy(asc(cmsQuizzes.sortOrder));
  }
  if (opts?.moduleId) {
    return db.select().from(cmsQuizzes).where(eq(cmsQuizzes.moduleId, opts.moduleId)).orderBy(asc(cmsQuizzes.sortOrder));
  }
  return db.select().from(cmsQuizzes).orderBy(desc(cmsQuizzes.createdAt));
}

export async function getQuiz(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsQuizzes).where(eq(cmsQuizzes.id, id));
  return row ?? null;
}

export async function createQuiz(data: Omit<InsertCmsQuiz, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(cmsQuizzes).values(data);
  return { id: result.insertId };
}

export async function updateQuiz(id: number, data: Partial<InsertCmsQuiz>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cmsQuizzes).set(data).where(eq(cmsQuizzes.id, id));
  return getQuiz(id);
}

export async function deleteQuiz(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsQuizzes).where(eq(cmsQuizzes.id, id));
  return { success: true };
}

/* ═══════════════════════ QUIZ QUESTIONS ═══════════════════════ */

export async function listQuizQuestions(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cmsQuizQuestions).where(eq(cmsQuizQuestions.quizId, quizId)).orderBy(asc(cmsQuizQuestions.sortOrder));
}

export async function getQuizQuestion(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsQuizQuestions).where(eq(cmsQuizQuestions.id, id));
  return row ?? null;
}

export async function createQuizQuestion(data: Omit<InsertCmsQuizQuestion, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(cmsQuizQuestions).values(data);
  return { id: result.insertId };
}

export async function updateQuizQuestion(id: number, data: Partial<InsertCmsQuizQuestion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cmsQuizQuestions).set(data).where(eq(cmsQuizQuestions.id, id));
  return getQuizQuestion(id);
}

export async function deleteQuizQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsQuizQuestions).where(eq(cmsQuizQuestions.id, id));
  return { success: true };
}

/* ═══════════════════════ MEDIA ASSETS ═══════════════════════ */

export async function listMediaAssets(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(cmsMediaAssets)
      .where(eq(cmsMediaAssets.category, category as any))
      .orderBy(desc(cmsMediaAssets.createdAt));
  }
  return db.select().from(cmsMediaAssets).orderBy(desc(cmsMediaAssets.createdAt));
}

export async function getMediaAsset(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(cmsMediaAssets).where(eq(cmsMediaAssets.id, id));
  return row ?? null;
}

export async function createMediaAsset(data: Omit<InsertCmsMediaAsset, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(cmsMediaAssets).values(data);
  return { id: result.insertId };
}

export async function deleteMediaAsset(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cmsMediaAssets).where(eq(cmsMediaAssets.id, id));
  return { success: true };
}

/* ═══════════════════════ AGGREGATE STATS ═══════════════════════ */

export async function getCmsStats() {
  const db = await getDb();
  if (!db) return { programs: 0, paths: 0, modules: 0, lessons: 0, slots: 0, quizzes: 0, questions: 0, media: 0 };

  const [programCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsPrograms);
  const [pathCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsPaths);
  const [moduleCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsModules);
  const [lessonCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsLessons);
  const [slotCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsLessonSlots);
  const [quizCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsQuizzes);
  const [questionCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsQuizQuestions);
  const [mediaCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsMediaAssets);

  return {
    programs: Number(programCount?.count ?? 0),
    paths: Number(pathCount?.count ?? 0),
    modules: Number(moduleCount?.count ?? 0),
    lessons: Number(lessonCount?.count ?? 0),
    slots: Number(slotCount?.count ?? 0),
    quizzes: Number(quizCount?.count ?? 0),
    questions: Number(questionCount?.count ?? 0),
    media: Number(mediaCount?.count ?? 0),
  };
}

/* ═══════════════════════ FULL TREE QUERIES ═══════════════════════ */

/** Get a program with all its paths (for the admin tree view) */
export async function getProgramTree(programId: number) {
  const program = await getProgram(programId);
  if (!program) return null;
  const paths = await listPaths(programId);
  const pathsWithModules = await Promise.all(
    paths.map(async (path: any) => {
      const modules = await listModules(path.id);
      const modulesWithLessons = await Promise.all(
        modules.map(async (mod: any) => {
          const lessons = await listLessons(mod.id);
          return { ...mod, lessons };
        })
      );
      return { ...path, modules: modulesWithLessons };
    })
  );
  return { ...program, paths: pathsWithModules };
}

/** Get a full lesson with all slots and quiz */
export async function getFullLesson(lessonId: number) {
  const lesson = await getLesson(lessonId);
  if (!lesson) return null;
  const slots = await listLessonSlots(lessonId);
  const quizzes = await listQuizzes({ lessonId });
  const quizzesWithQuestions = await Promise.all(
    quizzes.map(async (quiz: any) => {
      const questions = await listQuizQuestions(quiz.id);
      return { ...quiz, questions };
    })
  );
  return { ...lesson, slots, quizzes: quizzesWithQuestions };
}


/* ═══════════════════════ PUBLIC QUERIES (Learner-facing) ═══════════════════════ */

/** List published programs for learners */
export async function listPublishedPrograms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cmsPrograms)
    .where(eq(cmsPrograms.isPublished, true))
    .orderBy(asc(cmsPrograms.sortOrder));
}

/** Get a published program by slug (e.g., "esl" or "fsl") with full tree */
export async function getPublishedProgramBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const [program] = await db.select().from(cmsPrograms)
    .where(and(eq(cmsPrograms.slug, slug), eq(cmsPrograms.isPublished, true)));
  if (!program) return null;

  const paths = await db.select().from(cmsPaths)
    .where(and(eq(cmsPaths.programId, program.id), eq(cmsPaths.isPublished, true)))
    .orderBy(asc(cmsPaths.sortOrder));

  const pathsWithModules = await Promise.all(
    paths.map(async (path: any) => {
      const modules = await db.select().from(cmsModules)
        .where(and(eq(cmsModules.pathId, path.id), eq(cmsModules.isPublished, true)))
        .orderBy(asc(cmsModules.sortOrder));

      const modulesWithLessons = await Promise.all(
        modules.map(async (mod: any) => {
          const lessons = await db.select().from(cmsLessons)
            .where(and(eq(cmsLessons.moduleId, mod.id), eq(cmsLessons.isPublished, true)))
            .orderBy(asc(cmsLessons.sortOrder));
          return { ...mod, lessons };
        })
      );
      return { ...path, modules: modulesWithLessons };
    })
  );

  return { ...program, paths: pathsWithModules };
}

/** Get a published path with its modules and lessons */
export async function getPublishedPath(programSlug: string, pathSlug: string) {
  const db = await getDb();
  if (!db) return null;
  const [program] = await db.select().from(cmsPrograms)
    .where(and(eq(cmsPrograms.slug, programSlug), eq(cmsPrograms.isPublished, true)));
  if (!program) return null;

  const [path] = await db.select().from(cmsPaths)
    .where(and(eq(cmsPaths.programId, program.id), eq(cmsPaths.slug, pathSlug), eq(cmsPaths.isPublished, true)));
  if (!path) return null;

  const modules = await db.select().from(cmsModules)
    .where(and(eq(cmsModules.pathId, path.id), eq(cmsModules.isPublished, true)))
    .orderBy(asc(cmsModules.sortOrder));

  const modulesWithLessons = await Promise.all(
    modules.map(async (mod: any) => {
      const lessons = await db.select().from(cmsLessons)
        .where(and(eq(cmsLessons.moduleId, mod.id), eq(cmsLessons.isPublished, true)))
        .orderBy(asc(cmsLessons.sortOrder));
      return { ...mod, lessons };
    })
  );

  return { program, path: { ...path, modules: modulesWithLessons } };
}

/** Get a full lesson with slots and quiz for learner viewing */
export async function getPublishedLesson(programSlug: string, lessonNumber: string) {
  const db = await getDb();
  if (!db) return null;

  // Find the program
  const [program] = await db.select().from(cmsPrograms)
    .where(and(eq(cmsPrograms.slug, programSlug), eq(cmsPrograms.isPublished, true)));
  if (!program) return null;

  // Find the lesson by lessonNumber within this program's modules
  // We need to join through paths → modules → lessons
  const paths = await db.select().from(cmsPaths)
    .where(eq(cmsPaths.programId, program.id));
  const pathIds = paths.map((p: any) => p.id);
  if (pathIds.length === 0) return null;

  const modules = await db.select().from(cmsModules)
    .where(sql`${cmsModules.pathId} IN (${sql.join(pathIds.map(id => sql`${id}`), sql`, `)})`);
  const moduleIds = modules.map((m: any) => m.id);
  if (moduleIds.length === 0) return null;

  const [lesson] = await db.select().from(cmsLessons)
    .where(and(
      eq(cmsLessons.lessonNumber, lessonNumber),
      sql`${cmsLessons.moduleId} IN (${sql.join(moduleIds.map(id => sql`${id}`), sql`, `)})`
    ));
  if (!lesson) return null;

  // Get the module and path for this lesson
  const lessonModule = modules.find((m: any) => m.id === lesson.moduleId);
  const lessonPath = paths.find((p: any) => p.id === lessonModule?.pathId);

  // Get slots
  const slots = await db.select().from(cmsLessonSlots)
    .where(eq(cmsLessonSlots.lessonId, lesson.id))
    .orderBy(asc(cmsLessonSlots.sortOrder));

  // Get quizzes with questions
  const quizzes = await db.select().from(cmsQuizzes)
    .where(eq(cmsQuizzes.lessonId, lesson.id));
  const quizzesWithQuestions = await Promise.all(
    quizzes.map(async (quiz: any) => {
      const questions = await db.select().from(cmsQuizQuestions)
        .where(eq(cmsQuizQuestions.quizId, quiz.id))
        .orderBy(asc(cmsQuizQuestions.sortOrder));
      return { ...quiz, questions };
    })
  );

  return {
    program,
    path: lessonPath,
    module: lessonModule,
    lesson: { ...lesson, slots, quizzes: quizzesWithQuestions },
  };
}

/** Get stats for a published program (counts of paths, modules, lessons, activities) */
export async function getPublishedProgramStats(programSlug: string) {
  const db = await getDb();
  if (!db) return { paths: 0, modules: 0, lessons: 0, activities: 0 };

  const [program] = await db.select().from(cmsPrograms)
    .where(and(eq(cmsPrograms.slug, programSlug), eq(cmsPrograms.isPublished, true)));
  if (!program) return { paths: 0, modules: 0, lessons: 0, activities: 0 };

  const [pathCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsPaths)
    .where(and(eq(cmsPaths.programId, program.id), eq(cmsPaths.isPublished, true)));

  const paths = await db.select({ id: cmsPaths.id }).from(cmsPaths)
    .where(and(eq(cmsPaths.programId, program.id), eq(cmsPaths.isPublished, true)));
  const pathIds = paths.map((p: any) => p.id);

  let moduleCount = 0;
  let lessonCount = 0;
  if (pathIds.length > 0) {
    const [mc] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsModules)
      .where(sql`${cmsModules.pathId} IN (${sql.join(pathIds.map(id => sql`${id}`), sql`, `)}) AND ${cmsModules.isPublished} = true`);
    moduleCount = Number(mc?.count ?? 0);

    const modules = await db.select({ id: cmsModules.id }).from(cmsModules)
      .where(sql`${cmsModules.pathId} IN (${sql.join(pathIds.map(id => sql`${id}`), sql`, `)}) AND ${cmsModules.isPublished} = true`);
    const moduleIds = modules.map((m: any) => m.id);

    if (moduleIds.length > 0) {
      const [lc] = await db.select({ count: sql<number>`COUNT(*)` }).from(cmsLessons)
        .where(sql`${cmsLessons.moduleId} IN (${sql.join(moduleIds.map(id => sql`${id}`), sql`, `)}) AND ${cmsLessons.isPublished} = true`);
      lessonCount = Number(lc?.count ?? 0);
    }
  }

  return {
    paths: Number(pathCount?.count ?? 0),
    modules: moduleCount,
    lessons: lessonCount,
    activities: lessonCount * 7, // 7 slots per lesson
  };
}
