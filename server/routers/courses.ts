import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  courses, 
  courseModules, 
  lessons, 
  quizzes, 
  quizQuestions,
  courseEnrollments,
  lessonProgress,
  quizAttempts,
  courseReviews,
  certificates,
  courseBundles,
  bundleCourses,
} from "../../drizzle/schema";
import { eq, and, desc, asc, like, sql, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const coursesRouter = router({
  // ============================================================================
  // GET ALL COURSES (Public) - Enhanced version
  // ============================================================================
  getAll: publicProcedure
    .input(
      z.object({
        category: z.enum(["oral_expression", "written_expression", "reading_comprehension", "general_french", "all"]).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced", "all"]).optional(),
        targetLevel: z.enum(["A", "B", "C", "all"]).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const filters = input || { limit: 20, offset: 0 };
      const conditions = [eq(courses.status, "published")];

      if (filters.category && filters.category !== "all") {
        conditions.push(eq(courses.category, filters.category as any));
      }

      if (filters.difficulty && filters.difficulty !== "all") {
        conditions.push(eq(courses.level, filters.difficulty as any));
      }

      if (filters.targetLevel && filters.targetLevel !== "all") {
        // targetLevel maps to level field in schema
        conditions.push(eq(courses.level, filters.targetLevel as any));
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            like(courses.title, searchTerm),
            like(courses.description, searchTerm),
            like(courses.shortDescription, searchTerm)
          )!
        );
      }

      const result = await db
        .select()
        .from(courses)
        .where(and(...conditions))
        .orderBy(desc(courses.totalEnrollments))
        .limit(filters.limit ?? 20)
        .offset(filters.offset ?? 0);

      return result;
    }),

  // ============================================================================
  // GET FEATURED COURSES (Public)
  // ============================================================================
  getFeatured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.status, "published"))
      .orderBy(desc(courses.totalEnrollments))
      .limit(4);

    return result;
  }),

  // List all published courses with optional filters (legacy)
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      level: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const filters = input || { category: undefined, level: undefined, search: undefined, limit: 20, offset: 0 };
      const conditions = [eq(courses.status, "published")];
      
      if (filters.category) {
        conditions.push(eq(courses.category, filters.category as any));
      }
      
      if (filters.level) {
        conditions.push(eq(courses.level, filters.level as any));
      }
      
      if (filters.search) {
        conditions.push(
          or(
            like(courses.title, `%${filters.search}%`),
            like(courses.shortDescription, `%${filters.search}%`)
          )!
        );
      }
      
      const result = await db.select()
        .from(courses)
        .where(and(...conditions))
        .orderBy(desc(courses.totalEnrollments))
        .limit(filters.limit || 20)
        .offset(filters.offset || 0);
      
      return result;
    }),

  // Get single course by slug with full details
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.slug, input.slug))
        .limit(1);
      
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      
      // Get modules with lessons
      const modules = await db.select()
        .from(courseModules)
        .where(eq(courseModules.courseId, course.id))
        .orderBy(asc(courseModules.sortOrder));
      
      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const moduleLessons = await db.select()
            .from(lessons)
            .where(eq(lessons.moduleId, module.id))
            .orderBy(asc(lessons.sortOrder));
          
          return {
            ...module,
            lessons: moduleLessons,
          };
        })
      );
      
      // Get reviews
      const reviews = await db.select()
        .from(courseReviews)
        .where(and(
          eq(courseReviews.courseId, course.id),
          eq(courseReviews.isVisible, true)
        ))
        .orderBy(desc(courseReviews.createdAt))
        .limit(10);
      
      return {
        ...course,
        modules: modulesWithLessons,
        reviews,
      };
    }),

  // Get user's enrollment status for a course
  getEnrollment: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [enrollment] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.courseId, input.courseId)
        ))
        .limit(1);
      
      return enrollment || null;
    }),

  // Enroll in a course (free courses only - paid courses go through Stripe)
  enrollFree: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.id, input.courseId))
        .limit(1);
      
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      
      if ((course.price || 0) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This course requires payment",
        });
      }
      
      // Check if already enrolled
      const [existing] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.courseId, input.courseId)
        ))
        .limit(1);
      
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already enrolled in this course",
        });
      }
      
      // Create enrollment
      await db.insert(courseEnrollments).values({
        userId: ctx.user.id,
        courseId: input.courseId,
        totalLessons: course.totalLessons,
        status: "active",
      });
      
      // Update course enrollment count
      await db.update(courses)
        .set({ totalEnrollments: sql`${courses.totalEnrollments} + 1` })
        .where(eq(courses.id, input.courseId));
      
      return { success: true };
    }),

  // Get lesson content (checks enrollment)
  getLesson: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [lesson] = await db.select()
        .from(lessons)
        .where(eq(lessons.id, (input as any).lessonId))
        .limit(1);
      
      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      
      // Check if preview or enrolled — auto-enroll for free courses
      if (!lesson.isPreview) {
        let enrollment;
        try {
          const enrollmentRows = await db.select({ id: courseEnrollments.id, status: courseEnrollments.status })
            .from(courseEnrollments)
            .where(and(
              eq(courseEnrollments.userId, ctx.user.id),
              eq(courseEnrollments.courseId, lesson.courseId),
              eq(courseEnrollments.status, "active")
            ))
            .limit(1);
          enrollment = enrollmentRows[0];
        } catch (err: any) {
          console.error(`[getLesson] Enrollment query failed:`, err.message);
          // If the enrollment query fails (schema mismatch), try auto-enrolling anyway
        }
        
        if (!enrollment) {
          // Auto-enroll: free courses for everyone, all courses for admin/owner
          const [course] = await db.select({ id: courses.id, price: courses.price, totalLessons: courses.totalLessons, totalEnrollments: courses.totalEnrollments })
            .from(courses)
            .where(eq(courses.id, lesson.courseId))
            .limit(1);
          
          const isFree = course && (course.price === null || course.price === undefined || Number(course.price) === 0);
          const isAdmin = ctx.user.role === 'admin';
          
          if (course && (isFree || isAdmin)) {
            try {
              await db.insert(courseEnrollments).values({
                userId: ctx.user.id,
                courseId: lesson.courseId,
                totalLessons: course.totalLessons || 0,
                status: "active",
              });
              // Increment enrollment count
              await db.update(courses)
                .set({ totalEnrollments: sql`${courses.totalEnrollments} + 1` })
                .where(eq(courses.id, lesson.courseId));
            } catch (enrollErr: any) {
              // If already enrolled (duplicate), continue silently
              if (!enrollErr.message?.includes('Duplicate')) {
                throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "You must be enrolled to access this lesson",
                });
              }
            }
          } else {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You must be enrolled to access this lesson",
            });
          }
        }
      }
      
      // Get progress
      const [progress] = await db.select()
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.lessonId, (input as any).lessonId)
        ))
        .limit(1);
      
      return {
        lesson,
        progress: progress || null,
      };
    }),

  // Update lesson progress
  updateProgress: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      progressPercent: z.number().min(0).max(100),
      videoWatchedSeconds: z.number().optional(),
      completed: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [lesson] = await db.select()
        .from(lessons)
        .where(eq(lessons.id, (input as any).lessonId))
        .limit(1);
      
      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      
      // Get enrollment
      const [enrollment] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.courseId, lesson.courseId)
        ))
        .limit(1);
      
      if (!enrollment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not enrolled in this course",
        });
      }
      
      // Update or create progress
      const [existing] = await db.select()
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.lessonId, (input as any).lessonId)
        ))
        .limit(1);
      
      const now = new Date();
      
      if (existing) {
        await db.update(lessonProgress)
          .set({
            progressPercent: input.progressPercent,
            timeSpentSeconds: input.videoWatchedSeconds || existing.timeSpentSeconds,
            status: input.completed ? "completed" : input.progressPercent > 0 ? "in_progress" : "not_started",
            completedAt: input.completed ? now : existing.completedAt,
            lastAccessedAt: now,
          })
          .where(eq(lessonProgress.id, existing.id));
      } else {
        await db.insert(lessonProgress).values({
          userId: ctx.user.id,
          lessonId: (input as any).lessonId,
          courseId: enrollment.courseId,
          progressPercent: input.progressPercent,
          timeSpentSeconds: input.videoWatchedSeconds || 0,
          status: input.completed ? "completed" : input.progressPercent > 0 ? "in_progress" : "not_started",
          completedAt: input.completed ? now : null,
          lastAccessedAt: now,
        });
      }
      
      // Update enrollment progress if completed
      if (input.completed) {
        const completedCount = await db.select({ count: sql<number>`count(*)` })
          .from(lessonProgress)
          .where(and(
            eq(lessonProgress.courseId, enrollment.courseId),
            eq(lessonProgress.status, "completed")
          ));
        
        const totalLessons = enrollment.totalLessons || 1;
        const newProgress = Math.round((completedCount[0].count / totalLessons) * 100);
        
        await db.update(courseEnrollments)
          .set({
            lessonsCompleted: completedCount[0].count,
            progressPercent: newProgress,
            lastAccessedAt: now,
            completedAt: newProgress >= 100 ? now : null,
            status: newProgress >= 100 ? "completed" : "active",
          })
          .where(eq(courseEnrollments.id, enrollment.id));
      }
      
      return { success: true };
    }),

  // Get quiz for a lesson
  getQuiz: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [quiz] = await db.select()
        .from(quizzes)
        .where(eq(quizzes.lessonId, (input as any).lessonId))
        .limit(1);
      
      if (!quiz) {
        return null;
      }
      
      const questions = await db.select()
        .from(quizQuestions)
        .where(eq(quizQuestions.lessonId, (input as any).lessonId))
        .orderBy(asc(quizQuestions.orderIndex));
      
      // Don't send correct answers to client
      const sanitizedQuestions = questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        points: q.points,
      }));
      
      return {
        ...quiz,
        questions: sanitizedQuestions,
      };
    }),

  // Submit quiz attempt
  submitQuiz: protectedProcedure
    .input(z.object({
      quizId: z.number(),
      answers: z.array(z.object({
        questionId: z.number(),
        answer: z.union([z.string(), z.array(z.string())]),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [quiz] = await db.select()
        .from(quizzes)
        .where(eq(quizzes.id, input.quizId))
        .limit(1);
      
      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }
      
      // Get questions with correct answers
      const questions = await db.select()
        .from(quizQuestions)
        .where(eq(quizQuestions.lessonId, (input as any).lessonId));
      
      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;
      
      for (const question of questions) {
        totalPoints += question.points || 0;
        const userAnswer = input.answers.find(a => a.questionId === question.id);
        
        if (userAnswer && question.correctAnswer) {
          const correctAnswer = question.correctAnswer as string;
          const isCorrect = userAnswer.answer === correctAnswer;
          
          if (isCorrect) {
            earnedPoints += question.points || 0;
          }
        }
      }
      
      const scorePercent = Math.round((earnedPoints / totalPoints) * 100);
      const passed = scorePercent >= (quiz.passingScore || 70);
      
      // Save attempt
      await db.insert(quizAttempts).values({
        userId: ctx.user.id,
        quizId: quiz.id,
        answers: input.answers,
        score: scorePercent,
        pointsEarned: earnedPoints,
        totalPoints: totalPoints,
        passed,
        completedAt: new Date(),
      });
      
      return {
        score: earnedPoints,
        maxScore: totalPoints,
        scorePercent,
        passed,
      };
    }),

  // Get user's enrolled courses
  myEnrollments: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const enrollments = await db.select()
        .from(courseEnrollments)
        .where(eq(courseEnrollments.userId, ctx.user.id))
        .orderBy(desc(courseEnrollments.lastAccessedAt));
      
      // Get course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const [course] = await db.select()
            .from(courses)
            .where(eq(courses.id, enrollment.courseId))
            .limit(1);
          
          return {
            ...enrollment,
            course,
          };
        })
      );
      
      return enrollmentsWithCourses;
    }),

  // Submit course review
  submitReview: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      rating: z.number().min(1).max(5),
      title: z.string().min(5).max(100),
      content: z.string().min(20).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Check if enrolled and completed at least 50%
      const [enrollment] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.courseId, input.courseId)
        ))
        .limit(1);
      
      if (!enrollment || (enrollment.progressPercent || 0) < 50) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must complete at least 50% of the course to leave a review",
        });
      }
      
      // Check for existing review
      const [existing] = await db.select()
        .from(courseReviews)
        .where(and(
          eq(courseReviews.userId, ctx.user.id),
          eq(courseReviews.courseId, input.courseId)
        ))
        .limit(1);
      
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this course",
        });
      }
      
      await db.insert(courseReviews).values({
        userId: ctx.user.id,
        courseId: input.courseId,
        rating: input.rating,
        title: input.title,
        comment: input.content,
      });
      
      // Update course average rating
      const ratings = await db.select({ avg: sql<number>`avg(rating)` })
        .from(courseReviews)
        .where(eq(courseReviews.courseId, input.courseId));
      
      await db.update(courses)
        .set({ 
          averageRating: String(ratings[0].avg || 0),
          totalReviews: sql`${courses.totalReviews} + 1`,
        })
        .where(eq(courses.id, input.courseId));
      
      return { success: true };
    }),

  // Get course bundles
  bundles: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const bundles = await db.select()
        .from(courseBundles)
        .where(eq(courseBundles.status, "published"))
        .orderBy(desc(courseBundles.createdAt));
      
      // Get courses for each bundle
      const bundlesWithCourses = await Promise.all(
        bundles.map(async (bundle) => {
          const bundleCourseLinks = await db.select()
            .from(bundleCourses)
            .where(eq(bundleCourses.bundleId, bundle.id));
          
          const bundleCourseList = await Promise.all(
            bundleCourseLinks.map(async (link) => {
              const [course] = await db.select()
                .from(courses)
                .where(eq(courses.id, link.courseId))
                .limit(1);
              return course;
            })
          );
          
          return {
            ...bundle,
            courses: bundleCourseList.filter(Boolean),
          };
        })
      );
      
      return bundlesWithCourses;
    }),
  
  // Get modules for a course (for admin content management)
  getModules: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const modules = await db.select().from(courseModules)
        .where(eq(courseModules.courseId, input.courseId))
        .orderBy(asc(courseModules.sortOrder));
      
      return modules;
    }),
});
