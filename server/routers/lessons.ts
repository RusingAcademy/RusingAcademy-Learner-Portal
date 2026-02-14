/**
 * Lessons Router
 * 
 * Handles lesson retrieval and progress tracking for Path Series learners
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { 
  lessons, 
  courseModules, 
  courses, 
  lessonProgress,
  quizQuestions
} from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export const lessonsRouter = router({
  // Get all lessons for a module
  getByModule: publicProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db
        .select({
          id: lessons.id,
          moduleId: lessons.moduleId,
          courseId: lessons.courseId,
          title: lessons.title,
          description: lessons.description,
          contentType: lessons.contentType,
          estimatedMinutes: lessons.estimatedMinutes,
          sortOrder: lessons.sortOrder,
          isPreview: lessons.isPreview,
          isMandatory: lessons.isMandatory,
        })
        .from(lessons)
        .where(eq(lessons.moduleId, input.moduleId))
        .orderBy(asc(lessons.sortOrder));
      
      return result;
    }),

  // Get single lesson with full content
  getById: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [lesson] = await db
        .select({
          id: lessons.id,
          moduleId: lessons.moduleId,
          courseId: lessons.courseId,
          title: lessons.title,
          description: lessons.description,
          contentType: lessons.contentType,
          videoUrl: lessons.videoUrl,
          textContent: lessons.textContent,
          estimatedMinutes: lessons.estimatedMinutes,
          sortOrder: lessons.sortOrder,
          isPreview: lessons.isPreview,
          isMandatory: lessons.isMandatory,
          moduleTitle: courseModules.title,
          courseTitle: courses.title,
        })
        .from(lessons)
        .leftJoin(courseModules, eq(courseModules.id, lessons.moduleId))
        .leftJoin(courses, eq(courses.id, lessons.courseId))
        .where(eq(lessons.id, input.lessonId));
      
      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      
      // Get previous lesson
      const [prevLesson] = await db
        .select({ id: lessons.id, title: lessons.title })
        .from(lessons)
        .where(and(
          eq(lessons.moduleId, lesson.moduleId),
          sql`${lessons.sortOrder} < ${lesson.sortOrder}`
        ))
        .orderBy(desc(lessons.sortOrder))
        .limit(1);
      
      // Get next lesson
      const [nextLesson] = await db
        .select({ id: lessons.id, title: lessons.title })
        .from(lessons)
        .where(and(
          eq(lessons.moduleId, lesson.moduleId),
          sql`${lessons.sortOrder} > ${lesson.sortOrder}`
        ))
        .orderBy(asc(lessons.sortOrder))
        .limit(1);
      
      // If no next lesson in module, check next module
      let nextModuleFirstLesson = null;
      if (!nextLesson) {
        const [currentModule] = await db
          .select({ sortOrder: courseModules.sortOrder })
          .from(courseModules)
          .where(eq(courseModules.id, lesson.moduleId));
        
        if (currentModule) {
          const [nextModuleLesson] = await db
            .select({
              id: lessons.id,
              title: lessons.title,
              moduleTitle: courseModules.title,
            })
            .from(lessons)
            .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
            .where(and(
              eq(lessons.courseId, lesson.courseId),
              sql`${courseModules.sortOrder} > ${currentModule.sortOrder}`
            ))
            .orderBy(asc(courseModules.sortOrder), asc(lessons.sortOrder))
            .limit(1);
          
          nextModuleFirstLesson = nextModuleLesson;
        }
      }
      
      return {
        ...lesson,
        prevLesson,
        nextLesson: nextLesson || nextModuleFirstLesson,
      };
    }),

  // Get lesson with user's progress
  getWithProgress: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [lesson] = await db
        .select({
          id: lessons.id,
          moduleId: lessons.moduleId,
          courseId: lessons.courseId,
          title: lessons.title,
          description: lessons.description,
          contentType: lessons.contentType,
          videoUrl: lessons.videoUrl,
          textContent: lessons.textContent,
          estimatedMinutes: lessons.estimatedMinutes,
          sortOrder: lessons.sortOrder,
          isPreview: lessons.isPreview,
          isMandatory: lessons.isMandatory,
          moduleTitle: courseModules.title,
          courseTitle: courses.title,
          progressStatus: lessonProgress.status,
          progressPercent: lessonProgress.progressPercent,
          timeSpentSeconds: lessonProgress.timeSpentSeconds,
          userCompletedAt: lessonProgress.completedAt,
        })
        .from(lessons)
        .leftJoin(courseModules, eq(courseModules.id, lessons.moduleId))
        .leftJoin(courses, eq(courses.id, lessons.courseId))
        .leftJoin(lessonProgress, and(
          eq(lessonProgress.lessonId, lessons.id),
          eq(lessonProgress.userId, ctx.user.id)
        ))
        .where(eq(lessons.id, input.lessonId));
      
      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      
      // Get navigation
      const [prevLesson] = await db
        .select({ id: lessons.id, title: lessons.title })
        .from(lessons)
        .where(and(
          eq(lessons.moduleId, lesson.moduleId),
          sql`${lessons.sortOrder} < ${lesson.sortOrder}`
        ))
        .orderBy(desc(lessons.sortOrder))
        .limit(1);
      
      const [nextLesson] = await db
        .select({ id: lessons.id, title: lessons.title })
        .from(lessons)
        .where(and(
          eq(lessons.moduleId, lesson.moduleId),
          sql`${lessons.sortOrder} > ${lesson.sortOrder}`
        ))
        .orderBy(asc(lessons.sortOrder))
        .limit(1);
      
      return {
        ...lesson,
        prevLesson,
        nextLesson,
      };
    }),

  // Mark lesson as started
  startLesson: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get lesson info
      const [lesson] = await db
        .select({ id: lessons.id, moduleId: lessons.moduleId, courseId: lessons.courseId })
        .from(lessons)
        .where(eq(lessons.id, input.lessonId));
      
      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      
      // Upsert progress record
      await db.insert(lessonProgress).values({
        lessonId: input.lessonId,
        userId: ctx.user.id,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        status: "in_progress",
      }).onDuplicateKeyUpdate({
        set: {
          lastAccessedAt: new Date(),
        }
      });
      
      return { success: true };
    }),

  // Mark lesson as completed
  markComplete: protectedProcedure
    .input(z.object({ 
      lessonId: z.number(),
      timeSpentSeconds: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get lesson info
      const [lesson] = await db
        .select({ id: lessons.id, moduleId: lessons.moduleId, courseId: lessons.courseId })
        .from(lessons)
        .where(eq(lessons.id, input.lessonId));
      
      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      
      // Upsert progress record as completed
      await db.insert(lessonProgress).values({
        lessonId: input.lessonId,
        userId: ctx.user.id,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        status: "completed",
        progressPercent: 100,
        timeSpentSeconds: input.timeSpentSeconds || 0,
        completedAt: new Date(),
      }).onDuplicateKeyUpdate({
        set: {
          status: "completed",
          progressPercent: 100,
          completedAt: new Date(),
        }
      });
      
      return { success: true };
    }),

  // Update progress (for partial completion like video progress)
  updateProgress: protectedProcedure
    .input(z.object({ 
      lessonId: z.number(),
      progressPercent: z.number().min(0).max(100),
      timeSpentSeconds: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [lesson] = await db
        .select({ id: lessons.id, moduleId: lessons.moduleId, courseId: lessons.courseId })
        .from(lessons)
        .where(eq(lessons.id, input.lessonId));
      
      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      
      const status = input.progressPercent >= 100 ? "completed" : "in_progress";
      
      await db.insert(lessonProgress).values({
        lessonId: input.lessonId,
        userId: ctx.user.id,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        status,
        progressPercent: input.progressPercent,
        timeSpentSeconds: input.timeSpentSeconds || 0,
        completedAt: input.progressPercent >= 100 ? new Date() : null,
      }).onDuplicateKeyUpdate({
        set: {
          status,
          progressPercent: input.progressPercent,
          completedAt: input.progressPercent >= 100 ? new Date() : undefined,
        }
      });
      
      return { success: true };
    }),

  // Get module progress for a user
  getModuleProgress: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get total lessons in module
      const allLessons = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.moduleId, input.moduleId));
      
      const total = allLessons.length;
      
      // Get completed lessons
      const completedLessons = await db
        .select({ id: lessonProgress.id })
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.moduleId, input.moduleId),
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.status, "completed")
        ));
      
      const completed = completedLessons.length;
      
      // Get individual lesson progress
      const lessonStatuses = await db
        .select({
          id: lessons.id,
          title: lessons.title,
          sortOrder: lessons.sortOrder,
          status: lessonProgress.status,
          progressPercent: lessonProgress.progressPercent,
        })
        .from(lessons)
        .leftJoin(lessonProgress, and(
          eq(lessonProgress.lessonId, lessons.id),
          eq(lessonProgress.userId, ctx.user.id)
        ))
        .where(eq(lessons.moduleId, input.moduleId))
        .orderBy(asc(lessons.sortOrder));
      
      return {
        moduleId: input.moduleId,
        totalLessons: total,
        completedLessons: completed,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        lessons: lessonStatuses.map(l => ({
          ...l,
          status: l.status || "not_started",
          progressPercent: l.progressPercent || 0,
        })),
      };
    }),

  // Get course progress for a user
  getCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get all modules with their lessons
      const modules = await db
        .select({
          id: courseModules.id,
          title: courseModules.title,
          sortOrder: courseModules.sortOrder,
        })
        .from(courseModules)
        .where(eq(courseModules.courseId, input.courseId))
        .orderBy(asc(courseModules.sortOrder));
      
      // Get lesson counts and progress for each module
      const modulesWithProgress = await Promise.all(modules.map(async (module) => {
        const moduleLessons = await db
          .select({ id: lessons.id })
          .from(lessons)
          .where(eq(lessons.moduleId, module.id));
        
        const completedLessons = await db
          .select({ id: lessonProgress.id })
          .from(lessonProgress)
          .where(and(
            eq(lessonProgress.moduleId, module.id),
            eq(lessonProgress.userId, ctx.user.id),
            eq(lessonProgress.status, "completed")
          ));
        
        const total = moduleLessons.length;
        const completed = completedLessons.length;
        
        return {
          ...module,
          totalLessons: total,
          completedLessons: completed,
          progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }));
      
      // Calculate totals
      const totalLessons = modulesWithProgress.reduce((sum, m) => sum + m.totalLessons, 0);
      const completedLessons = modulesWithProgress.reduce((sum, m) => sum + m.completedLessons, 0);
      
      // Get all completed lesson IDs for accurate per-lesson tracking in sidebar
      const completedLessonRows = await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.courseId, input.courseId),
          eq(lessonProgress.status, "completed")
        ));
      const completedLessonIds = completedLessonRows.map(r => r.lessonId);
      
      // Get all in-progress lesson IDs
      const inProgressLessonRows = await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.courseId, input.courseId),
          eq(lessonProgress.status, "in_progress")
        ));
      const inProgressLessonIds = inProgressLessonRows.map(r => r.lessonId);
      
      // Get last accessed lesson
      const [lastAccessed] = await db
        .select({
          id: lessons.id,
          title: lessons.title,
          moduleId: lessons.moduleId,
          moduleTitle: courseModules.title,
        })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.courseId, input.courseId)
        ))
        .orderBy(desc(lessonProgress.lastAccessedAt))
        .limit(1);
      
      // Get next lesson to continue
      const [nextLesson] = await db
        .select({
          id: lessons.id,
          title: lessons.title,
          moduleId: lessons.moduleId,
          moduleTitle: courseModules.title,
        })
        .from(lessons)
        .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
        .leftJoin(lessonProgress, and(
          eq(lessonProgress.lessonId, lessons.id),
          eq(lessonProgress.userId, ctx.user.id)
        ))
        .where(and(
          eq(lessons.courseId, input.courseId),
          sql`(${lessonProgress.status} IS NULL OR ${lessonProgress.status} != 'completed')`
        ))
        .orderBy(asc(courseModules.sortOrder), asc(lessons.sortOrder))
        .limit(1);
      
      return {
        courseId: input.courseId,
        totalLessons,
        completedLessons,
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        modules: modulesWithProgress,
        completedLessonIds,
        inProgressLessonIds,
        lastAccessedLesson: lastAccessed,
        nextLesson,
      };
    }),

  // Get quiz questions for a lesson
  getQuizQuestions: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const questions = await db
        .select({
          id: quizQuestions.id,
          questionText: quizQuestions.questionText,
          questionTextFr: quizQuestions.questionTextFr,
          questionType: quizQuestions.questionType,
          options: quizQuestions.options,
          correctAnswer: quizQuestions.correctAnswer,
          explanation: quizQuestions.explanation,
          explanationFr: quizQuestions.explanationFr,
          points: quizQuestions.points,
          difficulty: quizQuestions.difficulty,
          orderIndex: quizQuestions.orderIndex,
        })
        .from(quizQuestions)
        .where(and(
          eq(quizQuestions.lessonId, input.lessonId),
          eq(quizQuestions.isActive, true)
        ))
        .orderBy(asc(quizQuestions.orderIndex));
      
      return questions;
    }),

  // Get all courses with progress for dashboard
  getMyCoursesProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get Path Series courses (1-6)
      const pathCourses = await db
        .select({
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
          level: courses.level,
          thumbnailUrl: courses.thumbnailUrl,
        })
        .from(courses)
        .where(sql`${courses.id} IN (1,2,3,4,5,6)`);
      
      // Get progress for each course
      const coursesWithProgress = await Promise.all(pathCourses.map(async (course) => {
        const courseLessons = await db
          .select({ id: lessons.id })
          .from(lessons)
          .where(eq(lessons.courseId, course.id));
        
        const completedLessons = await db
          .select({ id: lessonProgress.id })
          .from(lessonProgress)
          .where(and(
            eq(lessonProgress.courseId, course.id),
            eq(lessonProgress.userId, ctx.user.id),
            eq(lessonProgress.status, "completed")
          ));
        
        const [lastAccess] = await db
          .select({ lastAccessedAt: lessonProgress.lastAccessedAt })
          .from(lessonProgress)
          .where(and(
            eq(lessonProgress.courseId, course.id),
            eq(lessonProgress.userId, ctx.user.id)
          ))
          .orderBy(desc(lessonProgress.lastAccessedAt))
          .limit(1);
        
        const total = courseLessons.length;
        const completed = completedLessons.length;
        
        return {
          ...course,
          totalLessons: total,
          completedLessons: completed,
          progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
          lastAccessedAt: lastAccess?.lastAccessedAt,
        };
      }));
      
      // Filter to only courses with some progress
      return coursesWithProgress.filter(c => c.completedLessons > 0 || c.lastAccessedAt);
    }),
});
