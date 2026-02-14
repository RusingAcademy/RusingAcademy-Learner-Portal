/**
 * Stripe Webhook Handler for Lingueefy
 * 
 * Processes Stripe events for payments, refunds, and Connect account updates.
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import {
  createPayoutLedgerEntry,
  getCoachByUserId,
  updateCoachProfile,
  getUserById,
} from "../db";
import { sendSessionConfirmationEmails } from "../email";
import { sendCoursePurchaseConfirmationEmail, sendCoachingPlanPurchaseConfirmationEmail } from "../email-purchase-confirmations";
import { generateMeetingDetails } from "../video";
import { logAnalyticsEvent, createAdminNotification } from "../analytics-events";
import { claimWebhookEvent, markEventProcessed, markEventFailed } from "../webhookIdempotency";
import { structuredLog } from "../structuredLogger";

// Stripe will be initialized lazily to avoid startup errors when key is not set
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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] No signature found");
    return res.status(400).send("No signature");
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return res.status(400).send("Webhook signature verification failed");
  }

  // Handle test events for webhook verification
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  structuredLog("info", "webhook", "Event received", { eventType: event.type, eventId: event.id });

  // Idempotency check: skip if already processed
  const canProcess = await claimWebhookEvent(event.id, event.type);
  if (!canProcess) {
    structuredLog("info", "webhook", "Duplicate event skipped", { eventId: event.id });
    return res.json({ received: true, duplicate: true });
  }

  try {
    // Log all webhook events to analytics
    await logAnalyticsEvent({
      eventType: event.type.replace(/\./g, "_") as any,
      source: "stripe_webhook",
      stripeEventId: event.id,
      metadata: { rawType: event.type },
    });

    switch (event.type) {
      // Payment completed - record in ledger
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        // Track conversion funnel event
        await logAnalyticsEvent({
          eventType: "checkout_completed",
          source: "stripe",
          userId: parseInt(session.metadata?.user_id || "0") || undefined,
          sessionId: session.id,
          productName: session.metadata?.product_name || "Unknown",
          productType: session.metadata?.product_type || "unknown",
          amount: session.amount_total || 0,
          currency: session.currency || "cad",
          stripeEventId: event.id,
          metadata: { customerEmail: session.customer_email },
        });
        // Notify admin
        await createAdminNotification({
          targetRole: "admin",
          title: "New Payment Received",
          message: `Payment of $${((session.amount_total || 0) / 100).toFixed(2)} ${(session.currency || "CAD").toUpperCase()} for ${session.metadata?.product_name || "product"}`,
          type: "payment",
          link: "/admin/sales-analytics",
        });
        break;
      }
      // Payment intent succeeded
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}`);
        await logAnalyticsEvent({
          eventType: "payment_succeeded",
          source: "stripe",
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          stripeEventId: event.id,
          metadata: { paymentIntentId: paymentIntent.id },
        });
        break;
      }
      // Refund processed
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        await logAnalyticsEvent({
          eventType: "refund_processed",
          source: "stripe",
          amount: charge.amount_refunded || 0,
          currency: charge.currency,
          stripeEventId: event.id,
          metadata: { chargeId: charge.id },
        });
        await createAdminNotification({
          targetRole: "admin",
          title: "Refund Processed",
          message: `Refund of $${((charge.amount_refunded || 0) / 100).toFixed(2)} ${(charge.currency || "CAD").toUpperCase()} processed`,
          type: "warning",
          link: "/admin/sales-analytics",
        });
        break;
      }

      // Connect account updated
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      // Payout completed to coach
      case "payout.paid": {
        const payout = event.data.object as Stripe.Payout;
        console.log(`[Stripe Webhook] Payout completed: ${payout.id}`);
        break;
      }

      // Subscription created
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        await logAnalyticsEvent({
          eventType: "subscription_created",
          source: "stripe",
          stripeEventId: event.id,
          metadata: { subscriptionId: subscription.id, status: subscription.status },
        });
        await createAdminNotification({
          targetRole: "admin",
          title: "New Subscription",
          message: `New subscription created (${subscription.id})`,
          type: "success",
          link: "/admin/sales-analytics",
        });
        break;
      }

      // Subscription updated
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // Subscription deleted/canceled
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        // Track churn event
        await logAnalyticsEvent({
          eventType: "churn",
          source: "stripe",
          stripeEventId: event.id,
          metadata: { subscriptionId: subscription.id, reason: (subscription as any).cancellation_details?.reason || "unknown" },
        });
        await createAdminNotification({
          targetRole: "admin",
          title: "Subscription Canceled",
          message: `A subscription has been canceled (${subscription.id})`,
          type: "warning",
          link: "/admin/sales-analytics",
        });
        break;
      }

      // Invoice payment succeeded (subscription renewal)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          await handleInvoicePaymentSucceeded(invoice);
        }
        await logAnalyticsEvent({
          eventType: "invoice_paid",
          source: "stripe",
          amount: invoice.amount_paid || 0,
          currency: invoice.currency || "cad",
          stripeEventId: event.id,
          metadata: { invoiceId: invoice.id, subscriptionId: (invoice as any).subscription },
        });
        break;
      }
      // Invoice payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          await handleInvoicePaymentFailed(invoice);
        }
        await logAnalyticsEvent({
          eventType: "invoice_failed",
          source: "stripe",
          amount: invoice.amount_due || 0,
          stripeEventId: event.id,
          metadata: { invoiceId: invoice.id },
        });
        await createAdminNotification({
          targetRole: "admin",
          title: "Invoice Payment Failed",
          message: `Invoice payment of $${((invoice.amount_due || 0) / 100).toFixed(2)} failed`,
          type: "error",
          link: "/admin/sales-analytics",
        });
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Mark event as successfully processed
    await markEventProcessed(event.id);
    structuredLog("info", "webhook", "Event processed successfully", { eventType: event.type, eventId: event.id });
    res.json({ received: true });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    await markEventFailed(event.id, errMsg);
    structuredLog("error", "webhook", `Error processing ${event.type}`, { eventId: event.id, error: errMsg });
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const productType = metadata.product_type || "coaching_session";

  // Route to appropriate handler based on product type
  if (productType === "path_series" || productType === "course") {
    await handleCoursePurchase(session);
    return;
  }
  
  if (productType === "coaching_plan") {
    await handleCoachingPlanPurchase(session);
    return;
  }

  // Original coaching session handling
  const coachId = parseInt(metadata.coach_id || "0");
  const learnerId = parseInt(metadata.learner_id || "0");
  const sessionId = parseInt(metadata.session_id || "0") || null;
  const sessionType = metadata.session_type || "single";

  if (!coachId || !learnerId) {
    console.error("[Stripe Webhook] Missing coach_id or learner_id in metadata");
    return;
  }

  const amountTotal = session.amount_total || 0;
  
  // Get application fee from payment intent
  let platformFee = 0;
  let commissionBps = 0;
  
  if (session.payment_intent) {
    const paymentIntent = await getStripe().paymentIntents.retrieve(
      session.payment_intent as string
    );
    platformFee = (paymentIntent.application_fee_amount || 0);
    // Calculate commission rate from fee
    if (amountTotal > 0) {
      commissionBps = Math.round((platformFee / amountTotal) * 10000);
    }
  }

  const netAmount = amountTotal - platformFee;

  // Record session payment in ledger
  await createPayoutLedgerEntry({
    sessionId: sessionId,
    coachId,
    learnerId,
    transactionType: "session_payment",
    grossAmount: amountTotal,
    platformFee,
    netAmount,
    commissionBps,
    isTrialSession: sessionType === "trial",
    stripePaymentIntentId: session.payment_intent as string,
    status: "completed",
    processedAt: new Date(),
  });

  console.log(`[Stripe Webhook] Recorded payment: $${(amountTotal / 100).toFixed(2)} for coach ${coachId}`);

  // Generate meeting URL for the session
  const meetingDetails = generateMeetingDetails(
    sessionId || Date.now(),
    metadata.coach_name || "Coach",
    metadata.learner_name || "Learner"
  );
  
  console.log(`[Stripe Webhook] Generated meeting URL: ${meetingDetails.url}`);

  // Send confirmation emails
  try {
    // Get coach and learner details for emails
    const coachUser = await getUserById(parseInt(metadata.coach_user_id || "0"));
    const learnerUser = await getUserById(parseInt(metadata.learner_user_id || "0"));
    
    if (coachUser && learnerUser) {
      const sessionDate = metadata.session_date ? new Date(metadata.session_date) : new Date();
      const sessionTime = metadata.session_time || "9:00 AM";
      const duration = parseInt(metadata.duration || "60");
      
      await sendSessionConfirmationEmails({
        learnerName: learnerUser.name || "Learner",
        learnerEmail: learnerUser.email || "",
        coachName: coachUser.name || "Coach",
        coachEmail: coachUser.email || "",
        sessionDate,
        sessionTime,
        sessionType: sessionType as "trial" | "single" | "package",
        duration,
        price: amountTotal,
        meetingUrl: meetingDetails.url,
        meetingInstructions: meetingDetails.joinInstructions,
      });
      
      console.log(`[Stripe Webhook] Sent confirmation emails to ${learnerUser.email} and ${coachUser.email}`);
    }
  } catch (emailError) {
    console.error("[Stripe Webhook] Failed to send confirmation emails:", emailError);
    // Don't fail the webhook if email fails
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const refunds = charge.refunds?.data || [];
  
  for (const refund of refunds) {
    const metadata = charge.metadata || {};
    const coachId = parseInt(metadata.coach_id || "0");
    const learnerId = parseInt(metadata.learner_id || "0");

    if (!coachId || !learnerId) continue;

    // Record refund in ledger
    await createPayoutLedgerEntry({
      coachId,
      learnerId,
      transactionType: "refund",
      grossAmount: -(refund.amount || 0),
      platformFee: 0, // Platform fee is reversed separately
      netAmount: -(refund.amount || 0),
      commissionBps: 0,
      stripeRefundId: refund.id,
      status: "completed",
      processedAt: new Date(),
    });

    console.log(`[Stripe Webhook] Recorded refund: $${((refund.amount || 0) / 100).toFixed(2)}`);
  }
}

// ============================================================================
// SUBSCRIPTION WEBHOOK HANDLERS
// ============================================================================

import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id || "";
  const metadata = subscription.metadata || {};
  const userId = parseInt(metadata.user_id || "0");

  if (!userId) {
    console.error("[Stripe Webhook] No user_id in subscription metadata");
    return;
  }

  // Determine plan type from metadata or price
  const planType = metadata.plan_type || "premium_membership";
  const interval = metadata.interval || "month";
  const planName = planType === "bundle" 
    ? "Complete Bundle" 
    : planType === "sle_ai_companion" 
      ? "Prof Steven AI Premium" 
      : "Premium Membership";

  // Insert subscription record
  await db.insert(schema.subscriptions).values({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    planType: interval === "year" ? "annual" : "monthly",
    planName,
    status: subscription.status as any,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    trialStart: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000) : null,
    trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
  });

  console.log(`[Stripe Webhook] Created subscription for user ${userId}: ${planName}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  // Update subscription record
  await db
    .update(schema.subscriptions)
    .set({
      status: subscription.status as any,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    })
    .where(eq(schema.subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Updated subscription ${subscription.id}: status=${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  // Mark subscription as canceled
  await db
    .update(schema.subscriptions)
    .set({
      status: "canceled",
      canceledAt: new Date(),
    })
    .where(eq(schema.subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Canceled subscription ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  
  console.log(`[Stripe Webhook] Invoice payment succeeded for subscription ${subscriptionId}`);
  
  // Could send a receipt email here
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  const subscriptionId = (invoice as any).subscription as string;
  
  // Update subscription status to past_due
  await db
    .update(schema.subscriptions)
    .set({ status: "past_due" })
    .where(eq(schema.subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`[Stripe Webhook] Invoice payment failed for subscription ${subscriptionId}`);
  
  // Could send a payment failed email here
}

async function handleAccountUpdated(account: Stripe.Account) {
  const coachIdStr = account.metadata?.coach_id;
  if (!coachIdStr) return;

  const coachId = parseInt(coachIdStr);
  
  // Update coach profile with onboarding status
  const isOnboarded = account.details_submitted && account.charges_enabled;
  
  // Note: We'd need to look up the coach profile by Stripe account ID
  // For now, log the status update
  console.log(`[Stripe Webhook] Account ${account.id} updated: onboarded=${isOnboarded}`);
}


// ============================================================================
// PATH SERIES PURCHASE HANDLER
// ============================================================================

import { pathEnrollments, learningPaths, courseEnrollments, courses, coachingPlanPurchases, pathCourses, lessons } from "../../drizzle/schema";
import { sql, and, count } from "drizzle-orm";

async function handleCoursePurchase(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available for path series purchase");
    return;
  }

  const metadata = session.metadata || {};
  const userId = parseInt(metadata.user_id || "0");
  const pathId = parseInt(metadata.path_id || "0");
  const pathSlug = metadata.path_slug || "";
  const pathTitle = metadata.path_title || "";
  const userEmail = metadata.user_email || metadata.customer_email || "";
  const userName = metadata.user_name || metadata.customer_name || "";
  const productType = metadata.product_type || "course";

  if (!userId) {
    console.error("[Stripe Webhook] Missing user_id in course purchase metadata");
    return;
  }

  console.log(`[Stripe Webhook] Processing ${productType} purchase: ${pathTitle || 'course'} for user ${userId}`);

  // ── PATH SERIES PURCHASE ──
  if (productType === "path_series" && pathId) {
    // 1. Check if already enrolled in path
    const [existingPathEnrollment] = await db
      .select()
      .from(pathEnrollments)
      .where(
        and(
          eq(pathEnrollments.pathId, pathId),
          eq(pathEnrollments.userId, userId)
        )
      )
      .limit(1);

    if (existingPathEnrollment) {
      console.log(`[Stripe Webhook] User ${userId} already enrolled in path ${pathId}, skipping`);
      return;
    }

    // 2. Create path enrollment
    await db.insert(pathEnrollments).values({
      pathId,
      userId,
      status: "active",
      paymentStatus: "paid",
      stripePaymentIntentId: (session.payment_intent as string) || null,
      amountPaid: String((session.amount_total || 0) / 100),
      startedAt: new Date(),
    });
    console.log(`[Stripe Webhook] Created path enrollment for user ${userId} in path ${pathId}`);

    // 3. Get all courses in this path and create course enrollments
    const pathCoursesResult = await db
      .select({ courseId: pathCourses.courseId })
      .from(pathCourses)
      .where(eq(pathCourses.pathId, pathId));

    for (const pc of pathCoursesResult) {
      // Check if already enrolled in this course
      const [existingCourseEnrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.courseId, pc.courseId),
            eq(courseEnrollments.userId, userId)
          )
        )
        .limit(1);

      if (!existingCourseEnrollment) {
        // Count total lessons for this course
        const [lessonCount] = await db
          .select({ total: count() })
          .from(lessons)
          .where(eq(lessons.courseId, pc.courseId));

        await db.insert(courseEnrollments).values({
          courseId: pc.courseId,
          userId,
          progressPercent: 0,
          lessonsCompleted: 0,
          totalLessons: lessonCount?.total || 0,
        });
        console.log(`[Stripe Webhook] Created course enrollment for user ${userId} in course ${pc.courseId}`);
      }
    }

    console.log(`[Stripe Webhook] Successfully enrolled user ${userId} in path ${pathId} (${pathTitle}) with ${pathCoursesResult.length} courses`);
  } else {
    // ── INDIVIDUAL COURSE PURCHASE ──
    const courseDbId = parseInt(metadata.course_db_id || metadata.path_id || "0");
    const courseTitle = metadata.course_title || metadata.path_title || "";

    if (!courseDbId) {
      console.error("[Stripe Webhook] Missing course_db_id in course purchase metadata");
      return;
    }

    const [existingEnrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.courseId, courseDbId),
          eq(courseEnrollments.userId, userId)
        )
      )
      .limit(1);

    if (existingEnrollment) {
      console.log(`[Stripe Webhook] User ${userId} already enrolled in course ${courseDbId}, skipping`);
      return;
    }

    // Count total lessons
    const [lessonCount] = await db
      .select({ total: count() })
      .from(lessons)
      .where(eq(lessons.courseId, courseDbId));

    await db.insert(courseEnrollments).values({
      courseId: courseDbId,
      userId,
      progressPercent: 0,
      lessonsCompleted: 0,
      totalLessons: lessonCount?.total || 0,
    });

    console.log(`[Stripe Webhook] Successfully enrolled user ${userId} in course ${courseDbId} (${courseTitle})`);
  }

  console.log(`[Stripe Webhook] Payment amount: $${((session.amount_total || 0) / 100).toFixed(2)} CAD`);

  // Send confirmation email to user
  try {
    await sendCoursePurchaseConfirmationEmail({
      userEmail,
      userName,
      courseTitle: pathTitle || metadata.course_title || "",
      courseSlug: pathSlug || metadata.course_slug || "",
      amountPaid: session.amount_total || 0,
      language: (metadata.language as "en" | "fr") || "en",
    });
    console.log(`[Stripe Webhook] Sent course purchase confirmation email to ${userEmail}`);
  } catch (emailError) {
    console.error("[Stripe Webhook] Failed to send course confirmation email:", emailError);
    // Don't fail the webhook if email fails
  }
}


// ============================================================================
// COACHING PLAN PURCHASE HANDLER
// ============================================================================

async function handleCoachingPlanPurchase(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available for coaching plan purchase");
    return;
  }

  const metadata = session.metadata || {};
  const userId = parseInt(metadata.user_id || "0");
  const planId = metadata.plan_id || "";
  const sessions = parseInt(metadata.sessions || "0");
  const validityDays = parseInt(metadata.validity_days || "90");
  const userEmail = metadata.customer_email || "";
  const userName = metadata.customer_name || "";

  if (!userId || !planId) {
    console.error("[Stripe Webhook] Missing user_id or plan_id in coaching plan metadata");
    return;
  }

  console.log(`[Stripe Webhook] Processing coaching plan purchase: ${planId} for user ${userId}`);

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + validityDays);

  // Create coaching plan purchase record
  await db.insert(coachingPlanPurchases).values({
    userId,
    planId,
    planName: planId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    totalSessions: sessions,
    remainingSessions: sessions,
    validityDays,
    expiresAt,
    amountPaid: String((session.amount_total || 0) / 100),
    stripePaymentIntentId: session.payment_intent as string || null,
    status: "active",
  });

  console.log(`[Stripe Webhook] Successfully created coaching plan for user ${userId}: ${planId}`);
  console.log(`[Stripe Webhook] Sessions: ${sessions}, Valid for: ${validityDays} days`);
  console.log(`[Stripe Webhook] Payment amount: $${((session.amount_total || 0) / 100).toFixed(2)} CAD`);

  // Send confirmation email to user
  try {
    await sendCoachingPlanPurchaseConfirmationEmail({
      userEmail,
      userName,
      planName: planId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      planId,
      totalSessions: sessions,
      validityDays,
      expiresAt,
      amountPaid: session.amount_total || 0,
      language: (metadata.language as "en" | "fr") || "en",
    });
    console.log(`[Stripe Webhook] Sent coaching plan confirmation email to ${userEmail}`);
  } catch (emailError) {
    console.error("[Stripe Webhook] Failed to send coaching plan confirmation email:", emailError);
    // Don't fail the webhook if email fails
  }
}
