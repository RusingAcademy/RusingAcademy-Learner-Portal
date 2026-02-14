import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { activities, courseModules, courses, lessons } from "../../drizzle/schema";
import { eq, sql, count } from "drizzle-orm";

// Slot labels for display
const SLOT_LABELS: Record<string, string> = {
  introduction: "Intro / Hook",
  video_scenario: "Video Scenario",
  grammar_point: "Grammar / Strategy",
  written_practice: "Written Practice",
  oral_practice: "Oral Practice",
  quiz_slot: "Quiz",
  coaching_tip: "Coaching Tip",
  extra: "Extra",
};

export const adminCourseTreeRouter = router({
  /**
   * Get full hierarchical tree for admin Course Builder
   * Course → Modules → Lessons → Slots with counters, labels, bilingual checks
   */
  getAdminCourseTree: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));

      if (!course) return null;

      const moduleList = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, input.courseId))
        .orderBy(courseModules.sortOrder);

      const allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId))
        .orderBy(lessons.sortOrder);

      const allActivities = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          moduleId: activities.moduleId,
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
          sortOrder: activities.sortOrder,
        })
        .from(activities)
        .where(eq(activities.courseId, input.courseId))
        .orderBy(activities.slotIndex);

      // Get quiz question counts per lesson
      let quizCountMap = new Map<number, number>();
      if (allLessons.length > 0) {
        const lessonIds = allLessons.map(l => l.id);
        const quizCounts = await db.execute(
          sql`SELECT lessonId, COUNT(*) as cnt FROM quiz_questions WHERE lessonId IN (${sql.join(lessonIds.map(id => sql`${id}`), sql`, `)}) GROUP BY lessonId`
        );
        if (Array.isArray(quizCounts)) {
          for (const row of quizCounts as any[]) {
            quizCountMap.set(Number(row.lessonId), Number(row.cnt));
          }
        }
      }

      // Build tree
      const moduleTree = moduleList.map(mod => {
        const modLessons = allLessons.filter(l => l.moduleId === mod.id);
        
        const lessonTree = modLessons.map(lesson => {
          const lessonActs = allActivities.filter(a => a.lessonId === lesson.id);
          const requiredSlots = lessonActs.filter(a => (a.slotIndex || 0) >= 1 && (a.slotIndex || 0) <= 7);
          const extras = lessonActs.filter(a => (a.slotIndex || 0) > 7);
          const quizCount = quizCountMap.get(lesson.id) || 0;

          const slots = lessonActs.map(act => ({
            id: act.id,
            slotIndex: act.slotIndex,
            slotType: act.slotType,
            slotLabel: SLOT_LABELS[act.slotType || ""] || act.slotType || "Unknown",
            activityType: act.activityType,
            title: act.title,
            titleFr: act.titleFr,
            hasBilingual: !!(act.title && act.titleFr),
            hasContent: !!(act.content || act.videoUrl || act.audioUrl),
            thumbnailUrl: act.thumbnailUrl,
            status: act.status,
          }));

          return {
            id: lesson.id,
            title: lesson.title,
            titleFr: lesson.titleFr,
            lessonNumber: lesson.lessonNumber,
            sortOrder: lesson.sortOrder,
            status: lesson.status,
            hasBilingual: !!(lesson.title && lesson.titleFr),
            totalSlots: lessonActs.length,
            requiredPresent: requiredSlots.length,
            requiredTotal: 7,
            extrasCount: extras.length,
            quizQuestionCount: quizCount,
            qualityGateStatus: lesson.qualityGateStatus || "pending",
            slotsIndicator: `${requiredSlots.length}/7 slots`,
            isComplete: requiredSlots.length === 7,
            slots,
          };
        });

        const completeLessons = lessonTree.filter(l => l.isComplete).length;

        return {
          id: mod.id,
          title: mod.title,
          titleFr: mod.titleFr,
          moduleNumber: mod.moduleNumber,
          sortOrder: mod.sortOrder,
          status: mod.status,
          hasBilingual: !!(mod.title && mod.titleFr),
          thumbnailUrl: mod.thumbnailUrl,
          badgeImageUrl: mod.badgeImageUrl,
          totalLessons: modLessons.length,
          completeLessons,
          lessonsIndicator: `${modLessons.length} lessons`,
          progressIndicator: `${completeLessons}/${modLessons.length} complete`,
          lessons: lessonTree,
        };
      });

      const totalLessons = moduleTree.reduce((sum, m) => sum + m.totalLessons, 0);
      const totalCompleteLessons = moduleTree.reduce((sum, m) => sum + m.completeLessons, 0);
      const totalActivities = allActivities.length;

      return {
        id: course.id,
        title: course.title,
        titleFr: course.titleFr,
        slug: course.slug,
        status: course.status,
        pathNumber: course.pathNumber,
        heroImageUrl: course.heroImageUrl,
        thumbnailUrl: course.thumbnailUrl,
        hasBilingual: !!(course.title && course.titleFr),
        totalModules: moduleList.length,
        totalLessons,
        totalCompleteLessons,
        totalActivities,
        structureIndicator: `${moduleList.length} modules · ${totalLessons} lessons · ${totalActivities} activities`,
        modules: moduleTree,
      };
    }),

  /**
   * List all courses for admin overview
   */
  listAdminCourses: protectedProcedure
    .query(async () => {
      const db = await getDb();
      const courseList = await db
        .select({
          id: courses.id,
          title: courses.title,
          titleFr: courses.titleFr,
          slug: courses.slug,
          status: courses.status,
          pathNumber: courses.pathNumber,
          thumbnailUrl: courses.thumbnailUrl,
          heroImageUrl: courses.heroImageUrl,
          totalModules: courses.totalModules,
          totalLessons: courses.totalLessons,
          totalActivities: courses.totalActivities,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
        })
        .from(courses)
        .orderBy(courses.pathNumber);

      const enriched = await Promise.all(
        courseList.map(async (course) => {
          const [modCount] = await db
            .select({ count: count() })
            .from(courseModules)
            .where(eq(courseModules.courseId, course.id));

          const [lessonCount] = await db
            .select({ count: count() })
            .from(lessons)
            .where(eq(lessons.courseId, course.id));

          const [actCount] = await db
            .select({ count: count() })
            .from(activities)
            .where(eq(activities.courseId, course.id));

          return {
            ...course,
            actualModules: modCount?.count || 0,
            actualLessons: lessonCount?.count || 0,
            actualActivities: actCount?.count || 0,
            structureIndicator: `${modCount?.count || 0} modules · ${lessonCount?.count || 0} lessons · ${actCount?.count || 0} activities`,
          };
        })
      );

      return enriched;
    }),
});
