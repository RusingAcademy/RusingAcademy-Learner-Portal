/**
 * Stripe Course Purchase Service
 * Handles course and coaching plan purchases via Stripe Checkout
 */

import Stripe from "stripe";
import { PATH_SERIES_COURSES, COACHING_PLANS, getCourseById, getCoachingPlanById } from "../stripe/products";

// Lazy Stripe initialization
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

interface CreateCourseCheckoutParams {
  courseId: string;
  userId: number;
  userEmail: string;
  userName?: string;
  successUrl: string;
  cancelUrl: string;
  locale?: 'en' | 'fr';
}

interface CreateCoachingPlanCheckoutParams {
  planId: string;
  userId: number;
  userEmail: string;
  userName?: string;
  successUrl: string;
  cancelUrl: string;
  locale?: 'en' | 'fr';
}

/**
 * Create a Stripe Checkout session for course purchase
 */
export async function createCourseCheckoutSession(params: CreateCourseCheckoutParams): Promise<{ url: string; sessionId: string }> {
  const { courseId, userId, userEmail, userName, successUrl, cancelUrl, locale = 'en' } = params;
  
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }

  const isEn = locale === 'en';
  
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    locale: locale === 'fr' ? 'fr-CA' : 'en',
    line_items: [
      {
        price_data: {
          currency: course.currency.toLowerCase(),
          product_data: {
            name: isEn ? course.name : course.nameFr,
            description: isEn ? course.description : course.descriptionFr,
            metadata: {
              course_id: course.id,
              course_slug: course.slug,
              level: course.metadata.level,
            },
          },
          unit_amount: course.priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName || '',
      product_type: 'course',
      course_id: course.id,
      course_slug: course.slug,
      course_db_id: course.metadata.courseId.toString(),
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Create a Stripe Checkout session for coaching plan purchase
 */
export async function createCoachingPlanCheckoutSession(params: CreateCoachingPlanCheckoutParams): Promise<{ url: string; sessionId: string }> {
  const { planId, userId, userEmail, userName, successUrl, cancelUrl, locale = 'en' } = params;
  
  const plan = getCoachingPlanById(planId);
  if (!plan) {
    throw new Error(`Coaching plan not found: ${planId}`);
  }

  const isEn = locale === 'en';
  
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    locale: locale === 'fr' ? 'fr-CA' : 'en',
    line_items: [
      {
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: {
            name: isEn ? plan.name : plan.nameFr,
            description: isEn ? plan.description : plan.descriptionFr,
            metadata: {
              plan_id: plan.id,
              sessions: plan.sessions.toString(),
              validity_days: plan.validityDays.toString(),
            },
          },
          unit_amount: plan.priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName || '',
      product_type: 'coaching_plan',
      plan_id: plan.id,
      sessions: plan.sessions.toString(),
      validity_days: plan.validityDays.toString(),
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
}

/**
 * Verify webhook signature and construct event
 */
export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Get all available courses for display
 */
export function getAllCourses() {
  return PATH_SERIES_COURSES;
}

/**
 * Get all available coaching plans for display
 */
export function getAllCoachingPlans() {
  return COACHING_PLANS;
}

export default {
  createCourseCheckoutSession,
  createCoachingPlanCheckoutSession,
  getCheckoutSession,
  constructWebhookEvent,
  getAllCourses,
  getAllCoachingPlans,
};
