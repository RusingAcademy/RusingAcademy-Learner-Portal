import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  learningPaths, 
  pathCourses, 
  pathEnrollments, 
  pathReviews,
  courses,
  users,
} from "../../drizzle/schema";
import { eq, and, desc, asc, sql, or, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { PATH_SERIES_COURSES } from "../stripe/products";

// Stripe instance (lazy initialization)
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2025-12-15.clover" as const,
    });
  }
  return stripeInstance;
}

// ============================================================================
// PATHS ROUTER - Learning Paths / Path Series™ Management
// ============================================================================

export const pathsRouter = router({
  // ============================================================================
  // GET ALL PUBLISHED PATHS (Public)
  // ============================================================================
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["draft", "published", "archived", "all"]).optional().default("published"),
        level: z.enum(["A1", "A2", "B1", "B2", "C1", "exam_prep", "all"]).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const filters = input || { status: "published", limit: 20, offset: 0 };
      const conditions = [];

      // Status filter
      if (filters.status && filters.status !== "all") {
        conditions.push(eq(learningPaths.status, filters.status));
      }

      // Level filter
      if (filters.level && filters.level !== "all") {
        conditions.push(eq(learningPaths.level, filters.level));
      }

      // Search filter
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            like(learningPaths.title, searchTerm),
            like(learningPaths.description, searchTerm)
          )!
        );
      }

      const result = await db
        .select()
        .from(learningPaths)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(learningPaths.displayOrder), asc(learningPaths.id))
        .limit(filters.limit ?? 20)
        .offset(filters.offset ?? 0);

      return result;
    }),

  // ============================================================================
  // GET SINGLE PATH BY SLUG (Public)
  // ============================================================================
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [path] = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.slug, input.slug))
        .limit(1);

      if (!path) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Path not found" });
      }

      return path;
    }),

  // ============================================================================
  // GET SINGLE PATH BY ID (Public)
  // ============================================================================
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [path] = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.id, input.id))
        .limit(1);

      if (!path) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Path not found" });
      }

      return path;
    }),

  // ============================================================================
  // CHECK ENROLLMENT STATUS (Protected)
  // ============================================================================
  checkEnrollment: protectedProcedure
    .input(z.object({ pathId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [enrollment] = await db
        .select()
        .from(pathEnrollments)
        .where(
          and(
            eq(pathEnrollments.pathId, input.pathId),
            eq(pathEnrollments.userId, ctx.user.id)
          )
        )
        .limit(1);

      return {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      };
    }),

  // ============================================================================
  // ENROLL IN PATH (Protected)
  // ============================================================================
  enroll: protectedProcedure
    .input(z.object({ pathId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if path exists
      const [path] = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.id, input.pathId))
        .limit(1);

      if (!path) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Path not found" });
      }

      // Check if already enrolled
      const [existingEnrollment] = await db
        .select()
        .from(pathEnrollments)
        .where(
          and(
            eq(pathEnrollments.pathId, input.pathId),
            eq(pathEnrollments.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existingEnrollment) {
        throw new TRPCError({ code: "CONFLICT", message: "Already enrolled in this path" });
      }

      // Create enrollment
      await db.insert(pathEnrollments).values({
        pathId: input.pathId,
        userId: ctx.user.id,
        status: "active",
        progressPercentage: "0",
        currentModuleIndex: 0,
        currentLessonIndex: 0,
        paymentStatus: "pending",
      });

      // Update enrollment count
      await db
        .update(learningPaths)
        .set({ enrollmentCount: sql`${learningPaths.enrollmentCount} + 1` })
        .where(eq(learningPaths.id, input.pathId));

      return { success: true };
    }),

  // ============================================================================
  // GET USER'S ENROLLED PATHS (Protected)
  // ============================================================================
  myEnrollments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const enrollments = await db
      .select({
        enrollment: pathEnrollments,
        path: learningPaths,
      })
      .from(pathEnrollments)
      .innerJoin(learningPaths, eq(pathEnrollments.pathId, learningPaths.id))
      .where(eq(pathEnrollments.userId, ctx.user.id))
      .orderBy(desc(pathEnrollments.enrolledAt));

    return enrollments;
  }),

  // ============================================================================
  // GET FEATURED PATHS (Public)
  // ============================================================================
  featured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(3) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const limit = input?.limit ?? 3;

      const result = await db
        .select()
        .from(learningPaths)
        .where(
          and(
            eq(learningPaths.status, "published"),
            eq(learningPaths.isFeatured, true)
          )
        )
        .orderBy(asc(learningPaths.displayOrder))
        .limit(limit);

      return result;
    }),

  // ============================================================================
  // GET PATH REVIEWS (Public)
  // ============================================================================
  getReviews: publicProcedure
    .input(
      z.object({
        pathId: z.number(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const reviews = await db
        .select({
          review: pathReviews,
          user: {
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(pathReviews)
        .innerJoin(users, eq(pathReviews.userId, users.id))
        .where(eq(pathReviews.pathId, input.pathId))
        .orderBy(desc(pathReviews.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return reviews;
    }),

  // ============================================================================
  // CREATE STRIPE CHECKOUT SESSION (Protected)
  // ============================================================================
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        pathId: z.number(),
        pathSlug: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get the path from database
      const [path] = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.id, input.pathId))
        .limit(1);

      if (!path) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Path not found" });
      }

      // Check if already enrolled
      const [existingEnrollment] = await db
        .select()
        .from(pathEnrollments)
        .where(
          and(
            eq(pathEnrollments.pathId, input.pathId),
            eq(pathEnrollments.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existingEnrollment) {
        throw new TRPCError({ code: "CONFLICT", message: "Already enrolled in this path" });
      }

      // Get product info from products.ts for additional metadata
      const productInfo = PATH_SERIES_COURSES.find(
        (p) => p.slug === input.pathSlug || p.id === input.pathSlug
      );

      // Create Stripe checkout session
      const stripe = getStripe();
      const origin = ctx.req.headers.origin || 'https://ecosystemhub-preview.manus.space';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: path.title,
                description: path.subtitle || path.description?.substring(0, 200) || 'Path Series Course',
                metadata: {
                  path_id: path.id.toString(),
                  path_slug: path.slug,
                  cefr_level: path.cefrLevel || '',
                },
              },
              unit_amount: Math.round(parseFloat(path.price.toString())), // Convert decimal to integer cents for Stripe
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/paths/${path.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/paths/${path.slug}?canceled=true`,
        customer_email: ctx.user.email,
        client_reference_id: ctx.user.id.toString(),
        allow_promotion_codes: true,
        metadata: {
          user_id: ctx.user.id.toString(),
          user_email: ctx.user.email,
          user_name: ctx.user.name || '',
          path_id: path.id.toString(),
          path_slug: path.slug,
          path_title: path.title,
          product_type: 'path_series',
        },
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  // ============================================================================
  // GET COURSES INCLUDED IN PATH (Public)
  // ============================================================================
  getCourses: publicProcedure
    .input(z.object({ pathId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const result = await db
        .select({
          pathCourse: pathCourses,
          course: courses,
        })
        .from(pathCourses)
        .innerJoin(courses, eq(pathCourses.courseId, courses.id))
        .where(eq(pathCourses.pathId, input.pathId))
        .orderBy(asc(pathCourses.orderIndex));

      return result.map((r) => ({
        ...r.course,
        orderIndex: r.pathCourse.orderIndex,
        isRequired: r.pathCourse.isRequired,
      }));
    }),

  // ============================================================================
  // SUBMIT REVIEW (Protected)
  // ============================================================================
  submitReview: protectedProcedure
    .input(
      z.object({
        pathId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(10).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if user is enrolled
      const [enrollment] = await db
        .select()
        .from(pathEnrollments)
        .where(
          and(
            eq(pathEnrollments.pathId, input.pathId),
            eq(pathEnrollments.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!enrollment) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Must be enrolled to review" });
      }

      // Check if already reviewed
      const [existingReview] = await db
        .select()
        .from(pathReviews)
        .where(
          and(
            eq(pathReviews.pathId, input.pathId),
            eq(pathReviews.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existingReview) {
        throw new TRPCError({ code: "CONFLICT", message: "Already reviewed this path" });
      }

      // Create review
      await db.insert(pathReviews).values({
        pathId: input.pathId,
        userId: ctx.user.id,
        rating: input.rating,
        title: input.title,
        content: input.content,
      });

      // Update path stats
      const [stats] = await db
        .select({
          avgRating: sql<number>`AVG(${pathReviews.rating})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(pathReviews)
        .where(eq(pathReviews.pathId, input.pathId));

      await db
        .update(learningPaths)
        .set({
          averageRating: stats.avgRating?.toString() || "0",
          reviewCount: stats.count || 0,
        })
        .where(eq(learningPaths.id, input.pathId));

      return { success: true };
    }),
});
