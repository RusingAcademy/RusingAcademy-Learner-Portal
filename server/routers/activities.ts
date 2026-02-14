/**
 * Activities Router — 7-Slot LMS Architecture
 * 
 * CRUD operations for the 4th level of the course hierarchy:
 * Course → Module → Lesson → Activity (7 slots per lesson)
 * 
 * Slot Structure:
 * 1. Introduction/Hook (text) — 2 min
 * 2. Video Scenario (video) — 5-9 min
 * 3. Grammar/Strategy Point (text) — 10-15 min
 * 4. Written Practice (interactive/assignment) — 10-12 min
 * 5. Oral Practice + Micro-Phonetics (audio) — 8-10 min
 * 6. Quiz (quiz) — 7-10 min
 * 7. Coaching Tip + Self-Evaluation (text) — 3 min
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc, sql, asc, ne } from "drizzle-orm";
import {
  activities,
  activityProgress,
  lessons,
  courseModules,
  courses,
  quizQuestions,
  lessonProgress,
  courseEnrollments,
  certificates,
  learningPaths,
  pathCourses,
} from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

/** The canonical 7-slot template for every lesson */
export const SLOT_TEMPLATE = [
  { index: 1, type: "introduction" as const, labelEn: "Introduction / Hook", labelFr: "Introduction / Accroche", activityType: "text" as const, defaultMinutes: 2 },
  { index: 2, type: "video_scenario" as const, labelEn: "Video Scenario", labelFr: "Scénario Vidéo", activityType: "video" as const, defaultMinutes: 7 },
  { index: 3, type: "grammar_point" as const, labelEn: "Grammar / Strategy Point", labelFr: "Point de Grammaire / Stratégie", activityType: "text" as const, defaultMinutes: 12 },
  { index: 4, type: "written_practice" as const, labelEn: "Written Practice", labelFr: "Pratique Écrite", activityType: "assignment" as const, defaultMinutes: 11 },
  { index: 5, type: "oral_practice" as const, labelEn: "Oral Practice + Micro-Phonetics", labelFr: "Pratique Orale + Micro-Phonétique", activityType: "audio" as const, defaultMinutes: 9 },
  { index: 6, type: "quiz_slot" as const, labelEn: "Quiz", labelFr: "Quiz", activityType: "quiz" as const, defaultMinutes: 8 },
  { index: 7, type: "coaching_tip" as const, labelEn: "Coaching Tip + Self-Evaluation", labelFr: "Conseil du Coach + Auto-Évaluation", activityType: "text" as const, defaultMinutes: 3 },
] as const;

const SLOT_TYPES = ["introduction", "video_scenario", "grammar_point", "written_practice", "oral_practice", "quiz_slot", "coaching_tip", "extra"] as const;
const ACTIVITY_TYPES = ["video", "text", "audio", "quiz", "assignment", "download", "live_session", "embed", "speaking_exercise", "fill_blank", "matching", "discussion"] as const;

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const createActivitySchema = z.object({
  lessonId: z.number(),
  moduleId: z.number(),
  courseId: z.number(),
  slotIndex: z.number().min(1), // 1-7 mandatory, 8+ extra
  slotType: z.enum(SLOT_TYPES),
  title: z.string().min(1).max(200),
  titleFr: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionFr: z.string().optional(),
  activityType: z.enum(ACTIVITY_TYPES).default("text"),
  content: z.string().optional(),
  contentFr: z.string().optional(),
  contentJson: z.any().optional(),
  contentJsonFr: z.any().optional(),
  videoUrl: z.string().optional(),
  videoProvider: z.enum(["youtube", "vimeo", "bunny", "self_hosted"]).optional(),
  audioUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
  downloadFileName: z.string().optional(),
  embedCode: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  estimatedMinutes: z.number().default(5),
  points: z.number().default(0),
  passingScore: z.number().optional(),
  sortOrder: z.number().default(0),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  isPreview: z.boolean().default(false),
  isMandatory: z.boolean().default(true),
  unlockMode: z.enum(["immediate", "drip", "prerequisite", "manual"]).default("immediate"),
  availableAt: z.string().optional(),
  prerequisiteActivityId: z.number().optional(),
});

const updateActivitySchema = z.object({
  id: z.number(),
  slotIndex: z.number().min(1).optional(), // 1-7 mandatory, 8+ extra
  slotType: z.enum(SLOT_TYPES).optional(),
  title: z.string().min(1).max(200).optional(),
  titleFr: z.string().max(200).optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionFr: z.string().optional().nullable(),
  activityType: z.enum(ACTIVITY_TYPES).optional(),
  content: z.string().optional().nullable(),
  contentFr: z.string().optional().nullable(),
  contentJson: z.any().optional().nullable(),
  contentJsonFr: z.any().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  videoProvider: z.enum(["youtube", "vimeo", "bunny", "self_hosted"]).optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  downloadUrl: z.string().optional().nullable(),
  downloadFileName: z.string().optional().nullable(),
  embedCode: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  estimatedMinutes: z.number().optional(),
  points: z.number().optional(),
  passingScore: z.number().optional().nullable(),
  sortOrder: z.number().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  isPreview: z.boolean().optional(),
  isMandatory: z.boolean().optional(),
  unlockMode: z.enum(["immediate", "drip", "prerequisite", "manual"]).optional(),
  availableAt: z.string().optional().nullable(),
  prerequisiteActivityId: z.number().optional().nullable(),
});

// Admin check helper
function assertAdmin(ctx: any) {
  if (ctx.user.role !== "admin" && ctx.user.role !== "owner" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

// ============================================================================
// ROUTER
// ============================================================================

export const activitiesRouter = router({
  // ========================================================================
  // METADATA — Slot template info
  // ========================================================================

  /** Return the canonical 7-slot template definition */
  getSlotTemplate: publicProcedure.query(() => {
    return SLOT_TEMPLATE;
  }),

  // ========================================================================
  // PUBLIC / LEARNER PROCEDURES
  // ========================================================================

  /** Get all activities for a lesson (public, ordered by slotIndex) */
  getByLesson: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const result = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          moduleId: activities.moduleId,
          courseId: activities.courseId,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          title: activities.title,
          titleFr: activities.titleFr,
          description: activities.description,
          descriptionFr: activities.descriptionFr,
          activityType: activities.activityType,
          estimatedMinutes: activities.estimatedMinutes,
          points: activities.points,
          sortOrder: activities.sortOrder,
          status: activities.status,
          isPreview: activities.isPreview,
          isMandatory: activities.isMandatory,
          thumbnailUrl: activities.thumbnailUrl,
          unlockMode: activities.unlockMode,
        })
        .from(activities)
        .where(
          and(
            eq(activities.lessonId, input.lessonId),
            eq(activities.status, "published")
          )
        )
        .orderBy(asc(activities.slotIndex), asc(activities.sortOrder));

      return result;
    }),

  /** Get all 7 slots for a lesson with full content (for the learner lesson viewer) */
  getLessonSlots: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const result = await db
        .select()
        .from(activities)
        .where(eq(activities.lessonId, input.lessonId))
        .orderBy(asc(activities.slotIndex));

      // Map to slot template with activity data (mandatory slots 1-7)
      const mandatorySlots = SLOT_TEMPLATE.map((slot) => {
        const activity = result.find((a) => a.slotIndex === slot.index);
        return {
          ...slot,
          activity: activity || null,
          hasContent: !!activity,
          isPublished: activity?.status === "published",
        };
      });
      // Extra activities (slotIndex 8+)
      const extraActivities = result
        .filter((a) => a.slotIndex && a.slotIndex > 7)
        .map((a) => ({
          index: a.slotIndex!,
          type: "extra" as const,
          labelEn: a.title,
          labelFr: a.titleFr || a.title,
          activityType: a.activityType as any,
          defaultMinutes: a.estimatedMinutes || 5,
          activity: a,
          hasContent: true,
          isPublished: a.status === "published",
        }));
      return { mandatorySlots, extraActivities };
    }),

  /** Get a single activity with full content (for learners) */
  getById: publicProcedure
    .input(z.object({ activityId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [activity] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, input.activityId));

      if (!activity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      // Get navigation (prev/next within same lesson by slotIndex)
      const [prevActivity] = await db
        .select({ id: activities.id, title: activities.title, titleFr: activities.titleFr, slotIndex: activities.slotIndex, slotType: activities.slotType })
        .from(activities)
        .where(
          and(
            eq(activities.lessonId, activity.lessonId),
            sql`${activities.slotIndex} < ${activity.slotIndex}`,
            eq(activities.status, "published")
          )
        )
        .orderBy(desc(activities.slotIndex))
        .limit(1);

      const [nextActivity] = await db
        .select({ id: activities.id, title: activities.title, titleFr: activities.titleFr, slotIndex: activities.slotIndex, slotType: activities.slotType })
        .from(activities)
        .where(
          and(
            eq(activities.lessonId, activity.lessonId),
            sql`${activities.slotIndex} > ${activity.slotIndex}`,
            eq(activities.status, "published")
          )
        )
        .orderBy(asc(activities.slotIndex))
        .limit(1);

      // If this is a quiz slot, also fetch quiz questions
      let questions: any[] = [];
      if (activity.slotType === "quiz_slot" || activity.activityType === "quiz") {
        questions = await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.lessonId, activity.lessonId))
          .orderBy(asc(quizQuestions.orderIndex));
      }

      return {
        ...activity,
        prevActivity: prevActivity || null,
        nextActivity: nextActivity || null,
        questions,
      };
    }),

  /** Get activity with user progress (for authenticated learners) */
  getWithProgress: protectedProcedure
    .input(z.object({ activityId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [activity] = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          moduleId: activities.moduleId,
          courseId: activities.courseId,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          title: activities.title,
          titleFr: activities.titleFr,
          description: activities.description,
          descriptionFr: activities.descriptionFr,
          activityType: activities.activityType,
          content: activities.content,
          contentFr: activities.contentFr,
          contentJson: activities.contentJson,
          contentJsonFr: activities.contentJsonFr,
          videoUrl: activities.videoUrl,
          videoProvider: activities.videoProvider,
          audioUrl: activities.audioUrl,
          downloadUrl: activities.downloadUrl,
          downloadFileName: activities.downloadFileName,
          embedCode: activities.embedCode,
          thumbnailUrl: activities.thumbnailUrl,
          estimatedMinutes: activities.estimatedMinutes,
          points: activities.points,
          passingScore: activities.passingScore,
          sortOrder: activities.sortOrder,
          status: activities.status,
          isPreview: activities.isPreview,
          isMandatory: activities.isMandatory,
          unlockMode: activities.unlockMode,
          availableAt: activities.availableAt,
          // Progress fields
          progressStatus: activityProgress.status,
          progressScore: activityProgress.score,
          progressAttempts: activityProgress.attempts,
          timeSpentSeconds: activityProgress.timeSpentSeconds,
          completedAt: activityProgress.completedAt,
        })
        .from(activities)
        .leftJoin(
          activityProgress,
          and(
            eq(activityProgress.activityId, activities.id),
            eq(activityProgress.userId, ctx.user.id)
          )
        )
        .where(eq(activities.id, input.activityId));

      if (!activity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      return activity;
    }),

  /** Get all lesson slot progress for a user (for the slot navigation sidebar) */
  getLessonProgress: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const result = await db
        .select({
          activityId: activities.id,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          title: activities.title,
          titleFr: activities.titleFr,
          activityType: activities.activityType,
          estimatedMinutes: activities.estimatedMinutes,
          status: activities.status,
          progressStatus: activityProgress.status,
          progressScore: activityProgress.score,
          completedAt: activityProgress.completedAt,
        })
        .from(activities)
        .leftJoin(
          activityProgress,
          and(
            eq(activityProgress.activityId, activities.id),
            eq(activityProgress.userId, ctx.user.id)
          )
        )
        .where(eq(activities.lessonId, input.lessonId))
        .orderBy(asc(activities.slotIndex));

      const totalSlots = result.length;
      const completedSlots = result.filter((r) => r.progressStatus === "completed").length;

      return {
        slots: result,
        totalSlots,
        completedSlots,
        progressPercent: totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0,
        isComplete: totalSlots > 0 && completedSlots === totalSlots,
      };
    }),

  /** Mark activity as started */
  startActivity: protectedProcedure
    .input(z.object({ activityId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [activity] = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          courseId: activities.courseId,
        })
        .from(activities)
        .where(eq(activities.id, input.activityId));

      if (!activity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      await db
        .insert(activityProgress)
        .values({
          activityId: input.activityId,
          userId: ctx.user.id,
          lessonId: activity.lessonId,
          courseId: activity.courseId,
          status: "in_progress",
          lastAccessedAt: new Date(),
        })
        .onDuplicateKeyUpdate({
          set: {
            lastAccessedAt: new Date(),
          },
        });

      return { success: true };
    }),

  /** Mark activity as completed */
  completeActivity: protectedProcedure
    .input(
      z.object({
        activityId: z.number(),
        score: z.number().optional(),
        timeSpentSeconds: z.number().optional(),
        responseData: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [activity] = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          courseId: activities.courseId,
          passingScore: activities.passingScore,
        })
        .from(activities)
        .where(eq(activities.id, input.activityId));

      if (!activity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      // Determine pass/fail for scored activities
      let status: "completed" | "failed" = "completed";
      if (activity.passingScore && input.score !== undefined) {
        status = input.score >= activity.passingScore ? "completed" : "failed";
      }

      await db
        .insert(activityProgress)
        .values({
          activityId: input.activityId,
          userId: ctx.user.id,
          lessonId: activity.lessonId,
          courseId: activity.courseId,
          status,
          score: input.score,
          timeSpentSeconds: input.timeSpentSeconds || 0,
          responseData: input.responseData,
          completedAt: new Date(),
          lastAccessedAt: new Date(),
          attempts: 1,
        })
        .onDuplicateKeyUpdate({
          set: {
            status,
            score: input.score,
            timeSpentSeconds: sql`${activityProgress.timeSpentSeconds} + ${input.timeSpentSeconds || 0}`,
            responseData: input.responseData,
            completedAt: new Date(),
            lastAccessedAt: new Date(),
            attempts: sql`${activityProgress.attempts} + 1`,
          },
        });

      // ─── Auto-propagate to lesson-level progress ───
      // Count how many activities in this lesson are completed by this user
      if (status === "completed" && activity.lessonId) {
        try {
          const totalActivities = await db
            .select({ count: sql<number>`count(*)` })
            .from(activities)
            .where(and(
              eq(activities.lessonId, activity.lessonId),
              eq(activities.status, "published")
            ));
          const completedActivities = await db
            .select({ count: sql<number>`count(*)` })
            .from(activityProgress)
            .where(and(
              eq(activityProgress.lessonId, activity.lessonId),
              eq(activityProgress.userId, ctx.user.id),
              eq(activityProgress.status, "completed")
            ));

          const total = totalActivities[0]?.count || 7;
          const completed = completedActivities[0]?.count || 0;
          const lessonPercent = Math.min(100, Math.round((completed / total) * 100));
          const lessonStatus = lessonPercent >= 100 ? "completed" : "in_progress";

          // Get lesson info for moduleId
          const [lessonInfo] = await db
            .select({ moduleId: lessons.moduleId, courseId: lessons.courseId })
            .from(lessons)
            .where(eq(lessons.id, activity.lessonId));

          if (lessonInfo) {
            const now = new Date();
            await db.insert(lessonProgress).values({
              lessonId: activity.lessonId,
              userId: ctx.user.id,
              courseId: lessonInfo.courseId,
              moduleId: lessonInfo.moduleId,
              status: lessonStatus,
              progressPercent: lessonPercent,
              timeSpentSeconds: 0,
              completedAt: lessonStatus === "completed" ? now : null,
              lastAccessedAt: now,
            }).onDuplicateKeyUpdate({
              set: {
                status: lessonStatus,
                progressPercent: lessonPercent,
                completedAt: lessonStatus === "completed" ? now : undefined,
                lastAccessedAt: now,
              }
            });

            // ─── Update enrollment progress if lesson is completed ───
            if (lessonStatus === "completed" && activity.courseId) {
              const [enrollment] = await db.select()
                .from(courseEnrollments)
                .where(and(
                  eq(courseEnrollments.userId, ctx.user.id),
                  eq(courseEnrollments.courseId, activity.courseId)
                ))
                .limit(1);

              if (enrollment) {
                const completedLessonCount = await db
                  .select({ count: sql<number>`count(*)` })
                  .from(lessonProgress)
                  .where(and(
                    eq(lessonProgress.courseId, activity.courseId),
                    eq(lessonProgress.userId, ctx.user.id),
                    eq(lessonProgress.status, "completed")
                  ));

                const totalLessons = enrollment.totalLessons || 1;
                const completedCount = completedLessonCount[0]?.count || 0;
                const enrollmentPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

                await db.update(courseEnrollments)
                  .set({
                    lessonsCompleted: completedCount,
                    progressPercent: enrollmentPercent,
                    lastAccessedAt: now,
                    completedAt: enrollmentPercent >= 100 ? now : null,
                    status: enrollmentPercent >= 100 ? "completed" : "active",
                  })
                  .where(eq(courseEnrollments.id, enrollment.id));

                // ─── Auto-generate certificate when course is 100% complete ───
                if (enrollmentPercent >= 100) {
                  try {
                    // Check if certificate already exists
                    const [existingCert] = await db.select({ id: certificates.id })
                      .from(certificates)
                      .where(and(
                        eq(certificates.userId, ctx.user.id),
                        eq(certificates.courseId, activity.courseId)
                      ))
                      .limit(1);

                    if (!existingCert) {
                      // Get course details for certificate
                      const [courseForCert] = await db.select()
                        .from(courses)
                        .where(eq(courses.id, activity.courseId))
                        .limit(1);

                      if (courseForCert) {
                        const certTimestamp = Date.now().toString(36).toUpperCase();
                        const certUserPart = ctx.user.id.toString(36).toUpperCase().padStart(4, "0");
                        const certCoursePart = activity.courseId.toString(36).toUpperCase().padStart(3, "0");
                        const certRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
                        const certificateNumber = `RA-${certTimestamp}-${certUserPart}-${certCoursePart}-${certRandom}`;

                        // Look up path title
                        let pathTitle: string | undefined;
                        try {
                          const pathCourseRows = await db.select()
                            .from(pathCourses)
                            .where(eq(pathCourses.courseId, activity.courseId))
                            .limit(1);
                          if (pathCourseRows.length > 0) {
                            const [path] = await db.select()
                              .from(learningPaths)
                              .where(eq(learningPaths.id, pathCourseRows[0].pathId))
                              .limit(1);
                            if (path) pathTitle = path.title || undefined;
                          }
                        } catch (_) { /* ignore */ }

                        // Generate PDF
                        let pdfUrl: string | null = null;
                        try {
                          const { generateCertificatePdf } = await import("../services/certificatePdfService");
                          pdfUrl = await generateCertificatePdf({
                            recipientName: ctx.user.name || "Learner",
                            courseTitle: courseForCert.title,
                            certificateNumber,
                            issuedAt: now,
                            language: (ctx.user as any).preferredLanguage === "fr" ? "fr" : "en",
                            pathTitle,
                            totalLessons: enrollment.totalLessons || undefined,
                          });
                        } catch (pdfErr) {
                          console.error("[AutoCert] PDF generation failed:", pdfErr);
                        }

                        await db.insert(certificates).values({
                          certificateId: certificateNumber,
                          userId: ctx.user.id,
                          courseId: activity.courseId,
                          enrollmentId: enrollment.id,
                          recipientName: ctx.user.name || "Learner",
                          courseName: courseForCert.title,
                          completionDate: now,
                          verificationUrl: `https://rusingacademy.com/verify/${certificateNumber}`,
                          pdfUrl,
                          metadata: {
                            language: (ctx.user as any).preferredLanguage || "en",
                            completedAt: now.toISOString(),
                            lessonsCompleted: completedCount,
                            totalLessons: enrollment.totalLessons,
                            instructor: "Prof. Steven Rusinga",
                            organization: "RusingAcademy",
                            pathTitle,
                            autoGenerated: true,
                          },
                        });
                        console.log(`[AutoCert] Certificate ${certificateNumber} auto-generated for user ${ctx.user.id}, course ${activity.courseId}`);
                      }
                    }
                  } catch (certErr) {
                    // Don't fail activity completion if certificate generation fails
                    console.error("[AutoCert] Auto-certificate generation error:", certErr);
                  }
                }
              }
            }
          }
        } catch (e) {
          // Don't fail the activity completion if progress propagation fails
          console.error("[completeActivity] Progress propagation error:", e);
        }
      }

      // ─── Auto-check badge triggers after cascade ───────────────────────
      try {
        const { checkAndAwardBadges } = await import("../services/badgeAwardService");
        const badgeResult = await checkAndAwardBadges({
          userId: ctx.user.id,
          userName: ctx.user.name || undefined,
          action: "slot_completed",
          courseId: activity.courseId || undefined,
          lessonId: activity.lessonId || undefined,
          activityId: activity.id,
        });
        if (badgeResult.awarded.length > 0) {
          console.log(`[Badges] Awarded ${badgeResult.awarded.length} badge(s) to user ${ctx.user.id}: ${badgeResult.awarded.map(b => b.id).join(", ")}`);
        }
      } catch (badgeErr) {
        // Non-critical: don't fail activity completion if badge check fails
        console.error("[Badges] Badge check error:", badgeErr);
      }

      return { success: true, status, };
    }),

  // ========================================================================
  // ADMIN PROCEDURES
  // ========================================================================

  /** Get all activities for a lesson (admin - includes drafts, ordered by slotIndex) */
  adminGetByLesson: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const result = await db
        .select()
        .from(activities)
        .where(eq(activities.lessonId, input.lessonId))
        .orderBy(asc(activities.slotIndex), asc(activities.sortOrder));

      return result;
    }),

  /** Get single activity for editing (admin) */
  adminGetById: protectedProcedure
    .input(z.object({ activityId: z.number() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [activity] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, input.activityId));

      if (!activity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      return activity;
    }),

  /** Create a new activity with slot enforcement */
  create: protectedProcedure
    .input(createActivitySchema)
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify lesson exists
      const [lesson] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.id, input.lessonId));

      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }

      // Check if slot is already occupied
      const [existingSlot] = await db
        .select({ id: activities.id })
        .from(activities)
        .where(
          and(
            eq(activities.lessonId, input.lessonId),
            eq(activities.slotIndex, input.slotIndex)
          )
        );

      if (existingSlot) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Slot ${input.slotIndex} is already occupied in this lesson. Use update instead.`,
        });
      }

      // Validate slot type matches slot index for mandatory slots 1-7
      if (input.slotIndex <= 7) {
        const expectedType = SLOT_TEMPLATE.find((s) => s.index === input.slotIndex);
        if (expectedType && input.slotType !== expectedType.type) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Slot ${input.slotIndex} must be of type "${expectedType.type}", got "${input.slotType}"`,
          });
        }
      } else {
        // Extra slots (8+) must use 'extra' slotType
        if (input.slotType !== "extra") {
          // Auto-correct to 'extra' for slots beyond 7
        }
      }

      const result = await db.insert(activities).values({
        ...input,
        sortOrder: input.slotIndex, // sortOrder mirrors slotIndex
        availableAt: input.availableAt ? new Date(input.availableAt) : undefined,
      });

      const insertId = result[0].insertId;

      // Update lesson activity count
      await db
        .update(lessons)
        .set({
          totalActivities: sql`(SELECT COUNT(*) FROM activities WHERE lessonId = ${input.lessonId})`,
        })
        .where(eq(lessons.id, input.lessonId));

      // Update course activity count
      await db
        .update(courses)
        .set({
          totalActivities: sql`(SELECT COUNT(*) FROM activities WHERE courseId = ${input.courseId})`,
        })
        .where(eq(courses.id, input.courseId));

      return { id: insertId, success: true };
    }),

  /** Update an activity (with bilingual support) */
  update: protectedProcedure
    .input(updateActivitySchema)
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { id, ...updateData } = input;

      // Check activity exists
      const [existing] = await db
        .select({ id: activities.id, lessonId: activities.lessonId, slotIndex: activities.slotIndex })
        .from(activities)
        .where(eq(activities.id, id));

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      // If changing slotIndex, validate no conflict
      if (updateData.slotIndex && updateData.slotIndex !== existing.slotIndex) {
        const [conflict] = await db
          .select({ id: activities.id })
          .from(activities)
          .where(
            and(
              eq(activities.lessonId, existing.lessonId),
              eq(activities.slotIndex, updateData.slotIndex),
              sql`${activities.id} != ${id}`
            )
          );

        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Slot ${updateData.slotIndex} is already occupied by another activity`,
          });
        }
      }

      // Build update object, filtering out undefined values
      const cleanData: Record<string, any> = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          if (key === "availableAt" && value) {
            cleanData[key] = new Date(value as string);
          } else {
            cleanData[key] = value;
          }
        }
      }

      if (Object.keys(cleanData).length > 0) {
        await db.update(activities).set(cleanData).where(eq(activities.id, id));
      }

      return { success: true };
    }),

  /** Delete an activity */
  delete: protectedProcedure
    .input(z.object({ activityId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [activity] = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          courseId: activities.courseId,
        })
        .from(activities)
        .where(eq(activities.id, input.activityId));

      if (!activity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      await db.delete(activities).where(eq(activities.id, input.activityId));

      // Update counts
      await db
        .update(lessons)
        .set({
          totalActivities: sql`(SELECT COUNT(*) FROM activities WHERE lessonId = ${activity.lessonId})`,
        })
        .where(eq(lessons.id, activity.lessonId));

      await db
        .update(courses)
        .set({
          totalActivities: sql`(SELECT COUNT(*) FROM activities WHERE courseId = ${activity.courseId})`,
        })
        .where(eq(courses.id, activity.courseId));

      return { success: true };
    }),

  /** Reorder activities within a lesson */
  reorder: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        activityIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      for (let i = 0; i < input.activityIds.length; i++) {
        await db
          .update(activities)
          .set({ sortOrder: i })
          .where(
            and(
              eq(activities.id, input.activityIds[i]),
              eq(activities.lessonId, input.lessonId)
            )
          );
      }

      return { success: true };
    }),

  /** Duplicate an activity */
  duplicate: protectedProcedure
    .input(z.object({ activityId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [original] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, input.activityId));

      if (!original) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      // Get max sort order
      const [maxSort] = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${activities.sortOrder}), 0)` })
        .from(activities)
        .where(eq(activities.lessonId, original.lessonId));

      const { id, createdAt, updatedAt, ...data } = original;

      const result = await db.insert(activities).values({
        ...data,
        title: `${original.title} (Copy)`,
        slotIndex: null, // Duplicates don't inherit slot position
        sortOrder: (maxSort?.maxOrder ?? 0) + 1,
        status: "draft",
      });

      // Update counts
      await db
        .update(lessons)
        .set({
          totalActivities: sql`(SELECT COUNT(*) FROM activities WHERE lessonId = ${original.lessonId})`,
        })
        .where(eq(lessons.id, original.lessonId));

      await db
        .update(courses)
        .set({
          totalActivities: sql`(SELECT COUNT(*) FROM activities WHERE courseId = ${original.courseId})`,
        })
        .where(eq(courses.id, original.courseId));

      return { id: result[0].insertId, success: true };
    }),

  /** Bulk update status (publish/archive multiple activities) */
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        activityIds: z.array(z.number()),
        status: z.enum(["draft", "published", "archived"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      for (const activityId of input.activityIds) {
        await db
          .update(activities)
          .set({ status: input.status })
          .where(eq(activities.id, activityId));
      }

      return { success: true, count: input.activityIds.length };
    }),

  // ========================================================================
  // QUALITY GATE — Validation endpoints
  // ========================================================================

  /** Validate a single lesson's 7-slot completeness */
  validateLesson: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const lessonActivities = await db
        .select({
          id: activities.id,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          title: activities.title,
          titleFr: activities.titleFr,
          activityType: activities.activityType,
          status: activities.status,
          content: activities.content,
          contentFr: activities.contentFr,
          videoUrl: activities.videoUrl,
          audioUrl: activities.audioUrl,
        })
        .from(activities)
        .where(eq(activities.lessonId, input.lessonId))
        .orderBy(asc(activities.slotIndex));

      const issues: Array<{ slot: number; type: string; severity: "error" | "warning"; message: string }> = [];

      // Check each slot
      for (const slot of SLOT_TEMPLATE) {
        const activity = lessonActivities.find((a) => a.slotIndex === slot.index);

        if (!activity) {
          issues.push({ slot: slot.index, type: "missing", severity: "error", message: `Slot ${slot.index} (${slot.labelEn}) is empty` });
          continue;
        }

        // Check slot type matches
        if (activity.slotType !== slot.type) {
          issues.push({ slot: slot.index, type: "wrong_type", severity: "error", message: `Slot ${slot.index} has type "${activity.slotType}" but should be "${slot.type}"` });
        }

        // Check published status
        if (activity.status !== "published") {
          issues.push({ slot: slot.index, type: "not_published", severity: "warning", message: `Slot ${slot.index} (${slot.labelEn}) is not published (status: ${activity.status})` });
        }

        // Check bilingual content
        if (!activity.titleFr) {
          issues.push({ slot: slot.index, type: "missing_fr", severity: "warning", message: `Slot ${slot.index} missing French title` });
        }

        // Check content based on type
        if (slot.type === "video_scenario" && !activity.videoUrl) {
          issues.push({ slot: slot.index, type: "missing_content", severity: "warning", message: `Video slot has no video URL` });
        }
        if (slot.type === "oral_practice" && !activity.audioUrl && !activity.content) {
          issues.push({ slot: slot.index, type: "missing_content", severity: "warning", message: `Oral practice slot has no audio URL or content` });
        }
      }

      // Check for extra activities beyond 7
      const extraActivities = lessonActivities.filter((a) => !a.slotIndex || a.slotIndex < 1 || a.slotIndex > 7);
      if (extraActivities.length > 0) {
        issues.push({ slot: 0, type: "extra_activities", severity: "warning", message: `${extraActivities.length} activities have invalid slot positions` });
      }

      const hasErrors = issues.some((i) => i.severity === "error");
      const hasWarnings = issues.some((i) => i.severity === "warning");

      return {
        lessonId: input.lessonId,
        totalSlots: 7,
        filledSlots: lessonActivities.filter((a) => a.slotIndex && a.slotIndex >= 1 && a.slotIndex <= 7).length,
        publishedSlots: lessonActivities.filter((a) => a.status === "published" && a.slotIndex && a.slotIndex >= 1 && a.slotIndex <= 7).length,
        status: hasErrors ? "FAIL" : hasWarnings ? "WARN" : "PASS",
        issues,
        activities: lessonActivities,
      };
    }),

  /** Validate an entire course (all modules, all lessons) */
  validateCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get all modules for this course
      const mods = await db
        .select({
          id: courseModules.id,
          title: courseModules.title,
          titleFr: courseModules.titleFr,
          sortOrder: courseModules.sortOrder,
          badgeImageUrl: courseModules.badgeImageUrl,
        })
        .from(courseModules)
        .where(eq(courseModules.courseId, input.courseId))
        .orderBy(asc(courseModules.sortOrder));

      // Get all lessons for this course
      const allLessons = await db
        .select({
          id: lessons.id,
          moduleId: lessons.moduleId,
          title: lessons.title,
          titleFr: lessons.titleFr,
          sortOrder: lessons.sortOrder,
        })
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId))
        .orderBy(asc(lessons.sortOrder));

      // Get all activities for this course
      const allActivities = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          title: activities.title,
          titleFr: activities.titleFr,
          status: activities.status,
          activityType: activities.activityType,
        })
        .from(activities)
        .where(eq(activities.courseId, input.courseId))
        .orderBy(asc(activities.slotIndex));

      // Get course info
      const [course] = await db
        .select({
          id: courses.id,
          title: courses.title,
          titleFr: courses.titleFr,
          pathCompletionBadgeUrl: courses.pathCompletionBadgeUrl,
        })
        .from(courses)
        .where(eq(courses.id, input.courseId));

      // Build module reports
      const moduleReports = mods.map((mod) => {
        const modLessons = allLessons.filter((l) => l.moduleId === mod.id);
        const lessonReports = modLessons.map((lesson) => {
          const lessonActs = allActivities.filter((a) => a.lessonId === lesson.id);
          const filledSlots = lessonActs.filter((a) => a.slotIndex && a.slotIndex >= 1 && a.slotIndex <= 7).length;
          const publishedSlots = lessonActs.filter((a) => a.status === "published" && a.slotIndex && a.slotIndex >= 1 && a.slotIndex <= 7).length;
          const hasFrench = lessonActs.filter((a) => a.titleFr).length;

          const issues: string[] = [];
          if (filledSlots < 7) issues.push(`Only ${filledSlots}/7 slots filled`);
          if (publishedSlots < 7) issues.push(`Only ${publishedSlots}/7 slots published`);
          if (hasFrench < filledSlots) issues.push(`${filledSlots - hasFrench} slots missing French`);

          // Check each slot type
          for (const slot of SLOT_TEMPLATE) {
            const act = lessonActs.find((a) => a.slotIndex === slot.index);
            if (act && act.slotType !== slot.type) {
              issues.push(`Slot ${slot.index}: wrong type "${act.slotType}" (expected "${slot.type}")`);
            }
          }

          return {
            lessonId: lesson.id,
            title: lesson.title,
            titleFr: lesson.titleFr,
            filledSlots,
            publishedSlots,
            frenchSlots: hasFrench,
            status: filledSlots === 7 && publishedSlots === 7 ? "PASS" : filledSlots === 7 ? "WARN" : "FAIL",
            issues,
          };
        });

        const modIssues: string[] = [];
        if (!mod.badgeImageUrl) modIssues.push("Missing module badge image");
        if (!mod.titleFr) modIssues.push("Missing French title");
        if (modLessons.length !== 4) modIssues.push(`Expected 4 lessons, found ${modLessons.length}`);

        return {
          moduleId: mod.id,
          title: mod.title,
          titleFr: mod.titleFr,
          hasBadge: !!mod.badgeImageUrl,
          totalLessons: modLessons.length,
          lessons: lessonReports,
          status: lessonReports.every((l) => l.status === "PASS") && modIssues.length === 0 ? "PASS" : lessonReports.some((l) => l.status === "FAIL") ? "FAIL" : "WARN",
          issues: modIssues,
        };
      });

      // Course-level issues
      const courseIssues: string[] = [];
      if (!course?.pathCompletionBadgeUrl) courseIssues.push("Missing path completion badge");
      if (!course?.titleFr) courseIssues.push("Missing French title");
      if (mods.length !== 4) courseIssues.push(`Expected 4 modules, found ${mods.length}`);

      const totalLessons = allLessons.length;
      const totalActivities2 = allActivities.length;
      const expectedActivities = totalLessons * 7;
      const passLessons = moduleReports.flatMap((m) => m.lessons).filter((l) => l.status === "PASS").length;
      const failLessons = moduleReports.flatMap((m) => m.lessons).filter((l) => l.status === "FAIL").length;

      return {
        courseId: input.courseId,
        courseTitle: course?.title || "Unknown",
        courseTitleFr: course?.titleFr,
        hasBadge: !!course?.pathCompletionBadgeUrl,
        totalModules: mods.length,
        totalLessons,
        totalActivities: totalActivities2,
        expectedActivities,
        passLessons,
        failLessons,
        warnLessons: totalLessons - passLessons - failLessons,
        overallStatus: failLessons === 0 && courseIssues.length === 0 ? (passLessons === totalLessons ? "PASS" : "WARN") : "FAIL",
        modules: moduleReports,
        issues: courseIssues,
      };
    }),

  /** Validate all 6 paths at once (Quality Gate Dashboard) */
  validateAllPaths: protectedProcedure
    .query(async ({ ctx }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get all courses
      const allCourses = await db
        .select({
          id: courses.id,
          title: courses.title,
          titleFr: courses.titleFr,
          pathCompletionBadgeUrl: courses.pathCompletionBadgeUrl,
          status: courses.status,
        })
        .from(courses)
        .orderBy(asc(courses.id));

      // Get counts per course
      const summaries = [];
      for (const course of allCourses) {
        const [modCount] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(courseModules)
          .where(eq(courseModules.courseId, course.id));

        const [lessonCount] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(lessons)
          .where(eq(lessons.courseId, course.id));

        const [actCount] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(activities)
          .where(eq(activities.courseId, course.id));

        const [publishedCount] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(activities)
          .where(and(eq(activities.courseId, course.id), eq(activities.status, "published")));

        const [slotted] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(activities)
          .where(and(eq(activities.courseId, course.id), sql`slotIndex IS NOT NULL AND slotIndex BETWEEN 1 AND 7`));

        const expectedActivities = (lessonCount?.count || 0) * 7;
        const actualSlotted = slotted?.count || 0;

        summaries.push({
          courseId: course.id,
          title: course.title,
          titleFr: course.titleFr,
          hasBadge: !!course.pathCompletionBadgeUrl,
          courseStatus: course.status,
          modules: modCount?.count || 0,
          lessons: lessonCount?.count || 0,
          activities: actCount?.count || 0,
          publishedActivities: publishedCount?.count || 0,
          slottedActivities: actualSlotted,
          expectedActivities,
          completeness: expectedActivities > 0 ? Math.round((actualSlotted / expectedActivities) * 100) : 0,
          status: actualSlotted === expectedActivities ? "PASS" : actualSlotted > 0 ? "WARN" : "FAIL",
        });
      }

      const totalPass = summaries.filter((s) => s.status === "PASS").length;
      const totalFail = summaries.filter((s) => s.status === "FAIL").length;

      return {
        totalCourses: allCourses.length,
        totalPass,
        totalFail,
        totalWarn: allCourses.length - totalPass - totalFail,
        overallStatus: totalFail === 0 ? (totalPass === allCourses.length ? "PASS" : "WARN") : "FAIL",
        courses: summaries,
      };
    }),

  // ========================================================================
  // ADMIN TREE VIEW — Aggregated counts for the course builder
  // ========================================================================

  /** Get slot counts per lesson for a module (for the admin tree view) */
  getSlotCountsByModule: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const result = await db
        .select({
          lessonId: activities.lessonId,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          status: activities.status,
          titleFr: activities.titleFr,
        })
        .from(activities)
        .innerJoin(lessons, eq(lessons.id, activities.lessonId))
        .where(eq(lessons.moduleId, input.moduleId))
        .orderBy(asc(activities.lessonId), asc(activities.slotIndex));

      // Group by lesson
      const byLesson: Record<number, { total: number; published: number; hasFrench: number; slots: number[] }> = {};
      for (const row of result) {
        if (!byLesson[row.lessonId]) {
          byLesson[row.lessonId] = { total: 0, published: 0, hasFrench: 0, slots: [] };
        }
        if (row.slotIndex && row.slotIndex >= 1 && row.slotIndex <= 7) {
          byLesson[row.lessonId].total++;
          byLesson[row.lessonId].slots.push(row.slotIndex);
          if (row.status === "published") byLesson[row.lessonId].published++;
          if (row.titleFr) byLesson[row.lessonId].hasFrench++;
        }
      }

      return byLesson;
    }),

  /** Get full course tree with slot counts (for admin course builder overview) */
  getCourseTree: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get course
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));

      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }

      // Get modules
      const mods = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, input.courseId))
        .orderBy(asc(courseModules.sortOrder));

      // Get all lessons for this course
      const allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId))
        .orderBy(asc(lessons.sortOrder));

      // Get all activities for this course
      const allActivities = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          title: activities.title,
          titleFr: activities.titleFr,
          activityType: activities.activityType,
          status: activities.status,
          estimatedMinutes: activities.estimatedMinutes,
        })
        .from(activities)
        .where(eq(activities.courseId, input.courseId))
        .orderBy(asc(activities.slotIndex));

      // Build tree
      const tree = mods.map((mod) => {
        const modLessons = allLessons.filter((l) => l.moduleId === mod.id);
        return {
          ...mod,
          lessons: modLessons.map((lesson) => {
            const lessonActs = allActivities.filter((a) => a.lessonId === lesson.id);
            const filledSlots = lessonActs.filter((a) => a.slotIndex && a.slotIndex >= 1 && a.slotIndex <= 7).length;
            const publishedSlots = lessonActs.filter((a) => a.status === "published" && a.slotIndex).length;
            return {
              ...lesson,
              activities: lessonActs,
              slotCount: filledSlots,
              publishedSlotCount: publishedSlots,
              isComplete: filledSlots === 7,
              isPublished: publishedSlots === 7,
            };
          }),
        };
      });

      return {
        course,
        modules: tree,
      };
    }),

  // ─── PUBLIC: Get activities summary for a course (learner portal) ───
  getActivitiesByCourse: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const allActivities = await db
        .select({
          id: activities.id,
          lessonId: activities.lessonId,
          slotIndex: activities.slotIndex,
          slotType: activities.slotType,
          title: activities.title,
          titleFr: activities.titleFr,
          activityType: activities.activityType,
          status: activities.status,
          estimatedMinutes: activities.estimatedMinutes,
        })
        .from(activities)
        .where(
          and(
            eq(activities.courseId, input.courseId),
            eq(activities.status, "published")
          )
        )
        .orderBy(asc(activities.slotIndex));

      return allActivities;
    }),

  // ─── PROTECTED: Get user's activity-level progress for a course ───
  getUserActivityProgress: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const progressRows = await db
        .select({
          activityId: activityProgress.activityId,
          lessonId: activityProgress.lessonId,
          status: activityProgress.status,
          score: activityProgress.score,
          attempts: activityProgress.attempts,
          timeSpentSeconds: activityProgress.timeSpentSeconds,
          completedAt: activityProgress.completedAt,
        })
        .from(activityProgress)
        .where(
          and(
            eq(activityProgress.userId, ctx.user.id),
            eq(activityProgress.courseId, input.courseId)
          )
        );

      return progressRows;
    }),
});
