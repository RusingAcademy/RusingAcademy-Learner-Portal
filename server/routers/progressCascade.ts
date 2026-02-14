/**
 * Progress Cascade Router
 * 
 * Phase 3 — Returns the full progress hierarchy for a learner:
 * Course → Modules → Lessons → Slots (activities)
 * 
 * Each level includes:
 * - completedCount / totalCount
 * - progressPercent (0-100)
 * - status: "not_started" | "in_progress" | "completed"
 * - Individual item completion status
 */
import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq, and, asc, sql, inArray } from "drizzle-orm";
import {
  courses,
  courseModules,
  lessons,
  activities,
  activityProgress,
  lessonProgress,
  courseEnrollments,
} from "../../drizzle/schema";

// ─── Types ───
interface SlotCascade {
  slotIndex: number;
  activityId: number | null;
  type: string;
  title: string;
  titleFr: string | null;
  status: "empty" | "not_started" | "in_progress" | "completed";
  estimatedMinutes: number | null;
}

interface LessonCascade {
  lessonId: number;
  title: string;
  titleFr: string | null;
  sortOrder: number;
  totalSlots: number;
  completedSlots: number;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed";
  slots: SlotCascade[];
}

interface ModuleCascade {
  moduleId: number;
  title: string;
  titleFr: string | null;
  sortOrder: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed";
  lessons: LessonCascade[];
}

export interface CourseCascade {
  courseId: number;
  title: string;
  titleFr: string | null;
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalSlots: number;
  completedSlots: number;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed";
  enrolledAt: Date | null;
  lastAccessedAt: Date | null;
  modules: ModuleCascade[];
}

// ─── Slot labels for the 7-slot template ───
const SLOT_LABELS: Record<number, { type: string; label: string; labelFr: string }> = {
  1: { type: "introduction", label: "Introduction", labelFr: "Introduction" },
  2: { type: "video", label: "Video", labelFr: "Vidéo" },
  3: { type: "grammar", label: "Grammar", labelFr: "Grammaire" },
  4: { type: "written_practice", label: "Written Practice", labelFr: "Pratique écrite" },
  5: { type: "oral_practice", label: "Oral Practice", labelFr: "Pratique orale" },
  6: { type: "quiz", label: "Quiz", labelFr: "Quiz" },
  7: { type: "coaching_tip", label: "Coaching Tip", labelFr: "Conseil coaching" },
};

export const progressCascadeRouter = router({
  /**
   * Get the full progress cascade for a course
   * Returns: Course → Modules → Lessons → Slots with completion status
   */
  getCourseCascade: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }): Promise<CourseCascade> => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // 1. Get course info
      const [course] = await db
        .select({
          id: courses.id,
          title: courses.title,
          titleFr: courses.titleFr,
        })
        .from(courses)
        .where(eq(courses.id, input.courseId));

      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }

      // 2. Get enrollment info
      const [enrollment] = await db
        .select({
          enrolledAt: courseEnrollments.enrolledAt,
          lastAccessedAt: courseEnrollments.lastAccessedAt,
        })
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.courseId, input.courseId),
          eq(courseEnrollments.userId, ctx.user.id)
        ))
        .limit(1);

      // 3. Get all modules
      const moduleRows = await db
        .select({
          id: courseModules.id,
          title: courseModules.title,
          titleFr: courseModules.titleFr,
          sortOrder: courseModules.sortOrder,
        })
        .from(courseModules)
        .where(eq(courseModules.courseId, input.courseId))
        .orderBy(asc(courseModules.sortOrder));

      // 4. Get all lessons for this course
      const moduleIds = moduleRows.map(m => m.id);
      let lessonRows: any[] = [];
      if (moduleIds.length > 0) {
        lessonRows = await db
          .select({
            id: lessons.id,
            title: lessons.title,
            titleFr: lessons.titleFr,
            moduleId: lessons.moduleId,
            sortOrder: lessons.sortOrder,
          })
          .from(lessons)
          .where(inArray(lessons.moduleId, moduleIds))
          .orderBy(asc(lessons.sortOrder));
      }

      // 5. Get all activities for this course
      const activityRows = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          title: activities.title,
          titleFr: activities.titleFr,
          estimatedMinutes: activities.estimatedMinutes,
          status: activities.status,
        })
        .from(activities)
        .where(eq(activities.courseId, input.courseId))
        .orderBy(asc(activities.slotIndex));

      // 6. Get all activity progress for this user + course
      const progressRows = await db
        .select({
          activityId: activityProgress.activityId,
          lessonId: activityProgress.lessonId,
          status: activityProgress.status,
        })
        .from(activityProgress)
        .where(and(
          eq(activityProgress.courseId, input.courseId),
          eq(activityProgress.userId, ctx.user.id)
        ));

      // 7. Get lesson-level progress
      const lessonProgressRows = await db
        .select({
          lessonId: lessonProgress.lessonId,
          status: lessonProgress.status,
          progressPercent: lessonProgress.progressPercent,
        })
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.courseId, input.courseId),
          eq(lessonProgress.userId, ctx.user.id)
        ));

      // ─── Build lookup maps ───
      const progressByActivity = new Map<number, string>();
      progressRows.forEach(p => progressByActivity.set(p.activityId, p.status));

      const activitiesByLesson = new Map<number, typeof activityRows>();
      activityRows.forEach(a => {
        if (!a.lessonId) return;
        const list = activitiesByLesson.get(a.lessonId) || [];
        list.push(a);
        activitiesByLesson.set(a.lessonId, list);
      });

      const lessonProgressMap = new Map<number, { status: string; percent: number }>();
      lessonProgressRows.forEach(lp => {
        lessonProgressMap.set(lp.lessonId, { status: lp.status, percent: lp.progressPercent || 0 });
      });

      const lessonsByModule = new Map<number, typeof lessonRows>();
      lessonRows.forEach(l => {
        const list = lessonsByModule.get(l.moduleId) || [];
        list.push(l);
        lessonsByModule.set(l.moduleId, list);
      });

      // ─── Build cascade ───
      let totalSlotsAll = 0;
      let completedSlotsAll = 0;
      let totalLessonsAll = 0;
      let completedLessonsAll = 0;

      const moduleCascades: ModuleCascade[] = moduleRows.map(mod => {
        const modLessons = lessonsByModule.get(mod.id) || [];
        let modCompletedLessons = 0;

        const lessonCascades: LessonCascade[] = modLessons.map(les => {
          const lesActivities = activitiesByLesson.get(les.id) || [];

          // Build 7-slot grid + extras
          const slots: SlotCascade[] = [];
          for (let i = 1; i <= 7; i++) {
            const act = lesActivities.find(a => a.slotIndex === i);
            const slotLabel = SLOT_LABELS[i];
            if (act) {
              const actStatus = progressByActivity.get(act.id);
              slots.push({
                slotIndex: i,
                activityId: act.id,
                type: act.slotType || slotLabel?.type || "unknown",
                title: act.title,
                titleFr: act.titleFr,
                status: actStatus === "completed" ? "completed" : actStatus === "in_progress" ? "in_progress" : "not_started",
                estimatedMinutes: act.estimatedMinutes,
              });
            } else {
              slots.push({
                slotIndex: i,
                activityId: null,
                type: slotLabel?.type || "unknown",
                title: slotLabel?.label || `Slot ${i}`,
                titleFr: slotLabel?.labelFr || null,
                status: "empty",
                estimatedMinutes: null,
              });
            }
          }

          // Add extras (slotIndex > 7)
          lesActivities
            .filter(a => a.slotIndex && a.slotIndex > 7)
            .forEach(act => {
              const actStatus = progressByActivity.get(act.id);
              slots.push({
                slotIndex: act.slotIndex!,
                activityId: act.id,
                type: act.slotType || "extra",
                title: act.title,
                titleFr: act.titleFr,
                status: actStatus === "completed" ? "completed" : actStatus === "in_progress" ? "in_progress" : "not_started",
                estimatedMinutes: act.estimatedMinutes,
              });
            });

          const filledSlots = slots.filter(s => s.status !== "empty");
          const completedSlots = filledSlots.filter(s => s.status === "completed");
          const lessonPercent = filledSlots.length > 0 
            ? Math.round((completedSlots.length / filledSlots.length) * 100) 
            : 0;
          const lessonStatus: "not_started" | "in_progress" | "completed" = 
            completedSlots.length === 0 ? "not_started" :
            completedSlots.length >= filledSlots.length ? "completed" : "in_progress";

          totalSlotsAll += filledSlots.length;
          completedSlotsAll += completedSlots.length;

          if (lessonStatus === "completed") modCompletedLessons++;

          return {
            lessonId: les.id,
            title: les.title,
            titleFr: les.titleFr,
            sortOrder: les.sortOrder,
            totalSlots: filledSlots.length,
            completedSlots: completedSlots.length,
            progressPercent: lessonPercent,
            status: lessonStatus,
            slots,
          };
        });

        totalLessonsAll += modLessons.length;
        completedLessonsAll += modCompletedLessons;

        const modPercent = modLessons.length > 0 
          ? Math.round((modCompletedLessons / modLessons.length) * 100) 
          : 0;
        const modStatus: "not_started" | "in_progress" | "completed" = 
          modCompletedLessons === 0 ? "not_started" :
          modCompletedLessons >= modLessons.length ? "completed" : "in_progress";

        return {
          moduleId: mod.id,
          title: mod.title,
          titleFr: mod.titleFr,
          sortOrder: mod.sortOrder,
          totalLessons: modLessons.length,
          completedLessons: modCompletedLessons,
          progressPercent: modPercent,
          status: modStatus,
          lessons: lessonCascades,
        };
      });

      const completedModules = moduleCascades.filter(m => m.status === "completed").length;
      const coursePercent = totalLessonsAll > 0 
        ? Math.round((completedLessonsAll / totalLessonsAll) * 100) 
        : 0;
      const courseStatus: "not_started" | "in_progress" | "completed" = 
        completedLessonsAll === 0 ? "not_started" :
        completedLessonsAll >= totalLessonsAll ? "completed" : "in_progress";

      return {
        courseId: course.id,
        title: course.title,
        titleFr: course.titleFr,
        totalModules: moduleRows.length,
        completedModules,
        totalLessons: totalLessonsAll,
        completedLessons: completedLessonsAll,
        totalSlots: totalSlotsAll,
        completedSlots: completedSlotsAll,
        progressPercent: coursePercent,
        status: courseStatus,
        enrolledAt: enrollment?.enrolledAt || null,
        lastAccessedAt: enrollment?.lastAccessedAt || null,
        modules: moduleCascades,
      };
    }),

  /**
   * Get a summary of progress across all enrolled courses
   * Lightweight endpoint for dashboard/overview
   */
  getMyCoursesSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const enrollments = await db
        .select({
          courseId: courseEnrollments.courseId,
          courseTitle: courses.title,
          courseTitleFr: courses.titleFr,
          courseThumbnail: courses.thumbnailUrl,
          progressPercent: courseEnrollments.progressPercent,
          lessonsCompleted: courseEnrollments.lessonsCompleted,
          totalLessons: courseEnrollments.totalLessons,
          status: courseEnrollments.status,
          enrolledAt: courseEnrollments.enrolledAt,
          lastAccessedAt: courseEnrollments.lastAccessedAt,
        })
        .from(courseEnrollments)
        .innerJoin(courses, eq(courses.id, courseEnrollments.courseId))
        .where(eq(courseEnrollments.userId, ctx.user.id))
        .orderBy(asc(courseEnrollments.enrolledAt));

      return enrollments.map(e => ({
        courseId: e.courseId,
        title: e.courseTitle,
        titleFr: e.courseTitleFr,
        thumbnailUrl: e.courseThumbnail,
        progressPercent: e.progressPercent || 0,
        lessonsCompleted: e.lessonsCompleted || 0,
        totalLessons: e.totalLessons || 0,
        status: e.status === "completed" ? "completed" as const : 
               (e.progressPercent || 0) > 0 ? "in_progress" as const : "not_started" as const,
        enrolledAt: e.enrolledAt,
        lastAccessedAt: e.lastAccessedAt,
      }));
    }),
});
