/**
 * Subscription Router for Lingueefy
 * 
 * Handles recurring billing for premium memberships and Prof Steven AI access.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  getOrCreateCustomer,
  getOrCreatePrice,
  createSubscriptionCheckout,
  createCustomerPortal,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  updateSubscriptionPlan,
  getCustomerSubscriptions,
  getUpcomingInvoice,
  getInvoiceHistory,
  SUBSCRIPTION_PLANS,
  type PlanType,
  type BillingInterval,
} from "../stripe/subscriptions";

export const subscriptionsRouter = router({
  // ============================================================================
  // GET AVAILABLE PLANS
  // ============================================================================
  getPlans: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Get plans from database or return default plans
    const dbPlans = await db
      .select()
      .from(schema.subscriptionPlans)
      .where(eq(schema.subscriptionPlans.isActive, true))
      .orderBy(schema.subscriptionPlans.sortOrder);

    if (dbPlans.length > 0) {
      return dbPlans;
    }

    // Return default plans if none in database
    return Object.entries(SUBSCRIPTION_PLANS).map(([slug, plan], index) => ({
      id: index + 1,
      slug,
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.monthlyPrice,
      priceAnnual: plan.annualPrice,
      features: plan.features,
      isPopular: slug === "bundle",
      sortOrder: index,
      isActive: true,
    }));
  }),

  // ============================================================================
  // CREATE CHECKOUT SESSION
  // ============================================================================
  createCheckout: protectedProcedure
    .input(
      z.object({
        planType: z.enum(["premium_membership", "prof_steven_ai", "bundle"]),
        interval: z.enum(["month", "year"]),
        trialDays: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const user = ctx.user;
      if (!user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is required for subscription",
        });
      }

      // Get or create Stripe customer
      const customerId = await getOrCreateCustomer({
        userId: user.id,
        email: user.email,
        name: user.name || "User",
        existingCustomerId: null, // Could store this in users table
      });

      // Get or create price
      const priceId = await getOrCreatePrice({
        planType: input.planType as PlanType,
        interval: input.interval as BillingInterval,
      });

      // Create checkout session
      const origin = ctx.req.headers.origin || "https://rusingacademy.ca";
      const { sessionId, url } = await createSubscriptionCheckout({
        customerId,
        priceId,
        userId: user.id,
        planType: input.planType as PlanType,
        interval: input.interval as BillingInterval,
        origin,
        trialDays: input.trialDays,
      });

      return { sessionId, url };
    }),

  // ============================================================================
  // GET CUSTOMER PORTAL URL
  // ============================================================================
  getPortalUrl: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Get user's subscription to find customer ID
    const [subscription] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, ctx.user.id))
      .limit(1);

    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No subscription found",
      });
    }

    const origin = ctx.req.headers.origin || "https://rusingacademy.ca";
    const portalUrl = await createCustomerPortal({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${origin}/settings`,
    });

    return { url: portalUrl };
  }),

  // ============================================================================
  // GET USER'S SUBSCRIPTIONS
  // ============================================================================
  getMySubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const subscriptions = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, ctx.user.id))
      .orderBy(desc(schema.subscriptions.createdAt));

    return subscriptions;
  }),

  // ============================================================================
  // GET ACTIVE SUBSCRIPTION
  // ============================================================================
  getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const [subscription] = await db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.userId, ctx.user.id),
          eq(schema.subscriptions.status, "active")
        )
      )
      .limit(1);

    return subscription || null;
  }),

  // ============================================================================
  // CHECK PREMIUM ACCESS
  // ============================================================================
  checkAccess: protectedProcedure
    .input(
      z.object({
        feature: z.enum(["courses", "ai", "coaching", "all"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get active subscriptions
      const subscriptionsResult = await db
        .select()
        .from(schema.subscriptions)
        .where(
          and(
            eq(schema.subscriptions.userId, ctx.user.id),
            eq(schema.subscriptions.status, "active")
          )
        );
      
      // Ensure subscriptions is an array
      const subscriptions = Array.isArray(subscriptionsResult) ? subscriptionsResult : [];

      // Check if user has access to the requested feature
      const hasAccess = subscriptions.some((sub) => {
        const planName = sub.planName.toLowerCase();
        
        switch (input.feature) {
          case "courses":
            return planName.includes("premium") || planName.includes("bundle");
          case "ai":
            return planName.includes("steven") || planName.includes("bundle");
          case "coaching":
            return planName.includes("bundle");
          case "all":
            return planName.includes("bundle");
          default:
            return false;
        }
      });

      return {
        hasAccess,
        subscriptions: subscriptions.map((s) => ({
          planName: s.planName,
          status: s.status,
          currentPeriodEnd: s.currentPeriodEnd,
        })),
      };
    }),

  // ============================================================================
  // CANCEL SUBSCRIPTION
  // ============================================================================
  cancel: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number(),
        immediately: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get subscription
      const [subscription] = await db
        .select()
        .from(schema.subscriptions)
        .where(
          and(
            eq(schema.subscriptions.id, input.subscriptionId),
            eq(schema.subscriptions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      // Cancel in Stripe
      await cancelSubscription({
        subscriptionId: subscription.stripeSubscriptionId,
        cancelAtPeriodEnd: !input.immediately,
      });

      // Update database
      await db
        .update(schema.subscriptions)
        .set({
          status: input.immediately ? "canceled" : "active",
          cancelAtPeriodEnd: !input.immediately,
          canceledAt: input.immediately ? new Date() : null,
        })
        .where(eq(schema.subscriptions.id, input.subscriptionId));

      return { success: true };
    }),

  // ============================================================================
  // RESUME SUBSCRIPTION
  // ============================================================================
  resume: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get subscription
      const [subscription] = await db
        .select()
        .from(schema.subscriptions)
        .where(
          and(
            eq(schema.subscriptions.id, input.subscriptionId),
            eq(schema.subscriptions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (!subscription.cancelAtPeriodEnd) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subscription is not scheduled for cancellation",
        });
      }

      // Resume in Stripe
      await resumeSubscription(subscription.stripeSubscriptionId);

      // Update database
      await db
        .update(schema.subscriptions)
        .set({
          cancelAtPeriodEnd: false,
          canceledAt: null,
        })
        .where(eq(schema.subscriptions.id, input.subscriptionId));

      return { success: true };
    }),

  // ============================================================================
  // GET INVOICE HISTORY
  // ============================================================================
  getInvoices: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Get user's subscription to find customer ID
    const [subscription] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, ctx.user.id))
      .limit(1);

    if (!subscription) {
      return [];
    }

    const invoices = await getInvoiceHistory({
      customerId: subscription.stripeCustomerId,
      limit: 20,
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount: invoice.amount_due,
      currency: invoice.currency,
      created: new Date(invoice.created * 1000),
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    }));
  }),
});

export type SubscriptionsRouter = typeof subscriptionsRouter;
