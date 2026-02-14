import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { activities, courseModules, courses, lessons } from "../../drizzle/schema";
import { eq, and, sql, count } from "drizzle-orm";

const SLOT_TEMPLATE = [
  { slotIndex: 1, slotType: "introduction", label: "Intro / Hook", activityType: "text" },
  { slotIndex: 2, slotType: "video_scenario", label: "Video Scenario", activityType: "video" },
  { slotIndex: 3, slotType: "grammar_point", label: "Grammar / Strategy", activityType: "text" },
  { slotIndex: 4, slotType: "written_practice", label: "Written Practice", activityType: "assignment" },
  { slotIndex: 5, slotType: "oral_practice", label: "Oral Practice", activityType: "audio" },
  { slotIndex: 6, slotType: "quiz_slot", label: "Quiz", activityType: "quiz" },
  { slotIndex: 7, slotType: "coaching_tip", label: "Coaching Tip", activityType: "text" },
] as const;

export const qualityGateRouter = router({
  validateSlotStructure: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const lessonActivities = await db
        .select({
          id: activities.id,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          activityType: activities.activityType,
          title: activities.title,
          titleFr: activities.titleFr,
          content: activities.content,
          contentFr: activities.contentFr,
          videoUrl: activities.videoUrl,
          audioUrl: activities.audioUrl,
          thumbnailUrl: activities.thumbnailUrl,
          status: activities.status,
        })
        .from(activities)
        .where(eq(activities.lessonId, input.lessonId))
        .orderBy(activities.slotIndex);

      const quizResult = await db.execute(
        sql`SELECT COUNT(*) as cnt FROM quiz_questions WHERE lessonId = ${input.lessonId}`
      );
      const quizQuestionCount = Number((quizResult as any)?.[0]?.cnt || 0);

      const errors: string[] = [];
      const warnings: string[] = [];
      const slotStatus: Array<{
        slotIndex: number;
        label: string;
        expectedType: string;
        actualType: string | null;
        present: boolean;
        hasBilingual: boolean;
        hasContent: boolean;
        status: string;
      }> = [];
      const missingSlots: number[] = [];

      for (const template of SLOT_TEMPLATE) {
        const found = lessonActivities.find(a => a.slotIndex === template.slotIndex);
        if (!found) {
          missingSlots.push(template.slotIndex);
          slotStatus.push({
            slotIndex: template.slotIndex,
            label: template.label,
            expectedType: template.slotType,
            actualType: null,
            present: false,
            hasBilingual: false,
            hasContent: false,
            status: "missing",
          });
          errors.push(`Slot ${template.slotIndex} (${template.label}) is missing`);
        } else {
          const hasBilingual = !!(found.title && found.titleFr);
          const hasContent = !!(
            found.content || found.videoUrl || found.audioUrl ||
            (template.slotType === "quiz_slot" && quizQuestionCount >= 6)
          );
          const typeMatch = found.slotType === template.slotType;
          if (!typeMatch) {
            errors.push(`Slot ${template.slotIndex}: expected type "${template.slotType}", got "${found.slotType}"`);
          }
          if (!hasBilingual) {
            warnings.push(`Slot ${template.slotIndex} (${template.label}): missing bilingual title`);
          }
          if (!hasContent) {
            if (template.slotType === "quiz_slot") {
              errors.push(`Slot ${template.slotIndex} (Quiz): needs >=6 questions, has ${quizQuestionCount}`);
            } else {
              warnings.push(`Slot ${template.slotIndex} (${template.label}): no content yet`);
            }
          }
          slotStatus.push({
            slotIndex: template.slotIndex,
            label: template.label,
            expectedType: template.slotType,
            actualType: found.slotType,
            present: true,
            hasBilingual,
            hasContent,
            status: found.status || "draft",
          });
        }
      }

      const extras = lessonActivities.filter(a => (a.slotIndex || 0) > 7);

      return {
        lessonId: input.lessonId,
        valid: errors.length === 0,
        totalSlots: lessonActivities.length,
        requiredSlots: 7,
        presentRequired: 7 - missingSlots.length,
        missingSlots,
        extras: extras.length,
        quizQuestionCount,
        errors,
        warnings,
        slotStatus,
      };
    }),

  getCourseQualityReport: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));

      if (!course) {
        return { valid: false, errors: ["Course not found"], warnings: [], modules: [] };
      }

      const moduleList = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, input.courseId))
        .orderBy(courseModules.sortOrder);

      const errors: string[] = [];
      const warnings: string[] = [];

      if (moduleList.length !== 4) {
        errors.push(`Expected 4 modules, found ${moduleList.length}`);
      }
      if (!course.thumbnailUrl) warnings.push("Course thumbnail missing");
      if (!course.titleFr) warnings.push("Course French title missing");
      if (!course.descriptionFr) warnings.push("Course French description missing");

      const moduleReports = [];

      for (const mod of moduleList) {
        const moduleLessons = await db
          .select()
          .from(lessons)
          .where(eq(lessons.moduleId, mod.id))
          .orderBy(lessons.sortOrder);

        const moduleErrors: string[] = [];
        const moduleWarnings: string[] = [];

        if (moduleLessons.length !== 4) {
          moduleErrors.push(`Module "${mod.title}": expected 4 lessons, found ${moduleLessons.length}`);
        }
        if (!mod.thumbnailUrl) moduleWarnings.push(`Module "${mod.title}": thumbnail missing`);
        if (!mod.titleFr) moduleWarnings.push(`Module "${mod.title}": French title missing`);

        const lessonReports = [];

        for (const lesson of moduleLessons) {
          const lessonActs = await db
            .select({
              slotIndex: activities.slotIndex,
              slotType: activities.slotType,
              title: activities.title,
              titleFr: activities.titleFr,
            })
            .from(activities)
            .where(eq(activities.lessonId, lesson.id))
            .orderBy(activities.slotIndex);

          const requiredSlots = lessonActs.filter(a => (a.slotIndex || 0) >= 1 && (a.slotIndex || 0) <= 7);
          const missingCount = 7 - requiredSlots.length;

          if (missingCount > 0) {
            moduleErrors.push(`Lesson "${lesson.title}": missing ${missingCount} required slots`);
          }

          lessonReports.push({
            id: lesson.id,
            title: lesson.title,
            titleFr: lesson.titleFr,
            totalSlots: lessonActs.length,
            requiredPresent: requiredSlots.length,
            missingRequired: missingCount,
            hasBilingual: !!(lesson.title && lesson.titleFr),
          });
        }

        errors.push(...moduleErrors);
        warnings.push(...moduleWarnings);

        moduleReports.push({
          id: mod.id,
          title: mod.title,
          titleFr: mod.titleFr,
          totalLessons: moduleLessons.length,
          hasThumbnail: !!mod.thumbnailUrl,
          hasBilingual: !!(mod.title && mod.titleFr),
          errors: moduleErrors,
          warnings: moduleWarnings,
          lessons: lessonReports,
        });
      }

      return {
        courseId: input.courseId,
        courseTitle: course.title,
        valid: errors.length === 0,
        totalModules: moduleList.length,
        totalLessons: moduleReports.reduce((sum, m) => sum + m.totalLessons, 0),
        errors,
        warnings,
        modules: moduleReports,
      };
    }),

  validateBeforePublish: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));

      if (!course) {
        return { canPublish: false, reason: "Course not found", errors: [] };
      }

      const criticalErrors: string[] = [];

      const moduleList = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, input.courseId));

      if (moduleList.length < 4) {
        criticalErrors.push(`Need 4 modules, have ${moduleList.length}`);
      }

      for (const mod of moduleList) {
        const [lessonCount] = await db
          .select({ count: count() })
          .from(lessons)
          .where(eq(lessons.moduleId, mod.id));

        if ((lessonCount?.count || 0) < 4) {
          criticalErrors.push(`Module "${mod.title}": needs 4 lessons, has ${lessonCount?.count || 0}`);
        }
      }

      const allLessons = await db
        .select({ id: lessons.id, title: lessons.title })
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId));

      for (const lesson of allLessons) {
        const [actCount] = await db
          .select({ count: count() })
          .from(activities)
          .where(
            and(
              eq(activities.lessonId, lesson.id),
              sql`${activities.slotIndex} BETWEEN 1 AND 7`
            )
          );

        if ((actCount?.count || 0) < 7) {
          criticalErrors.push(`Lesson "${lesson.title}": needs 7 slots, has ${actCount?.count || 0}`);
        }
      }

      if (!course.titleFr) criticalErrors.push("Course French title missing");

      const canPublish = criticalErrors.length === 0;

      if (canPublish) {
        await db
          .update(courses)
          .set({ status: "published", publishedAt: new Date() })
          .where(eq(courses.id, input.courseId));
      }

      return {
        canPublish,
        reason: canPublish ? "All checks passed" : "Critical errors found",
        errors: criticalErrors,
      };
    }),
});
