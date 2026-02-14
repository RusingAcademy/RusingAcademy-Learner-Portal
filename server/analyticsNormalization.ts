/**
 * Analytics Event Normalization
 * 
 * Enforces a strict schema for analytics events to ensure
 * consistent data across all sources (Stripe, frontend, AI pipeline, admin).
 * 
 * Every event must have:
 * - A valid eventType from the canonical list
 * - A normalized source
 * - A normalized productType (when applicable)
 * - A normalized cohort (when applicable)
 */

// ============================================================================
// CANONICAL EVENT TYPES
// ============================================================================

export const ANALYTICS_EVENT_TYPES = [
  // Funnel events
  "page_view",
  "opt_in",
  "checkout_started",
  "checkout_completed",
  // Payment events
  "payment_succeeded",
  "payment_failed",
  "refund_processed",
  // Subscription events
  "subscription_created",
  "subscription_renewed",
  "subscription_canceled",
  // Course events
  "course_enrolled",
  "course_started",
  "course_completed",
  "lesson_completed",
  "module_completed",
  // Coaching events
  "coaching_purchased",
  "coaching_session_booked",
  "coaching_session_completed",
  // AI events
  "ai_session_started",
  "ai_session_completed",
  "ai_evaluation_completed",
  "ai_transcription_completed",
  "ai_error",
  // Engagement events
  "login",
  "signup",
  "profile_updated",
  "resource_downloaded",
  // Admin events
  "invoice_paid",
  "invoice_failed",
  "churn",
  // Webhook events (raw Stripe)
  "webhook_received",
] as const;

export type CanonicalEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

// ============================================================================
// NORMALIZED SOURCES
// ============================================================================

export const ANALYTICS_SOURCES = [
  "stripe_webhook",
  "stripe_checkout",
  "frontend",
  "admin_panel",
  "ai_pipeline",
  "cron_job",
  "api",
  "system",
] as const;

export type CanonicalSource = (typeof ANALYTICS_SOURCES)[number];

// ============================================================================
// NORMALIZED PRODUCT TYPES
// ============================================================================

export const PRODUCT_TYPES = [
  "path_series",
  "course",
  "coaching_session",
  "coaching_plan",
  "subscription",
  "bundle",
  "resource",
  "ai_companion",
] as const;

export type CanonicalProductType = (typeof PRODUCT_TYPES)[number];

// ============================================================================
// NORMALIZED COHORTS
// ============================================================================

export const COHORT_TYPES = [
  "federal_employee",
  "provincial_employee",
  "private_sector",
  "student",
  "department_group",
  "enterprise",
  "individual",
  "unknown",
] as const;

export type CanonicalCohort = (typeof COHORT_TYPES)[number];

// ============================================================================
// NORMALIZED EVENT INTERFACE
// ============================================================================

export interface NormalizedAnalyticsEvent {
  eventType: CanonicalEventType;
  source: CanonicalSource;
  userId?: number | null;
  sessionId?: string | null;
  productId?: string | null;
  productName?: string | null;
  productType?: CanonicalProductType | null;
  cohort?: CanonicalCohort | null;
  amount?: number;
  currency?: string;
  stripeEventId?: string | null;
  metadata?: Record<string, any> | null;
}

// ============================================================================
// VALIDATION & NORMALIZATION
// ============================================================================

/**
 * Normalize a source string to a canonical source.
 * Falls back to "system" if unrecognized.
 */
export function normalizeSource(raw: string | undefined): CanonicalSource {
  if (!raw) return "system";
  const lower = raw.toLowerCase().trim();
  
  // Map common variants
  if (lower.includes("stripe") && lower.includes("webhook")) return "stripe_webhook";
  if (lower.includes("stripe")) return "stripe_checkout";
  if (lower.includes("frontend") || lower === "client") return "frontend";
  if (lower.includes("admin")) return "admin_panel";
  if (lower.includes("ai") || lower.includes("companion")) return "ai_pipeline";
  if (lower.includes("cron")) return "cron_job";
  if (lower.includes("api")) return "api";
  
  // Check exact match
  if (ANALYTICS_SOURCES.includes(lower as CanonicalSource)) {
    return lower as CanonicalSource;
  }
  
  return "system";
}

/**
 * Normalize a product type string to a canonical product type.
 */
export function normalizeProductType(raw: string | undefined): CanonicalProductType | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  
  if (lower.includes("path")) return "path_series";
  if (lower === "course") return "course";
  if (lower.includes("coaching") && lower.includes("plan")) return "coaching_plan";
  if (lower.includes("coaching") || lower.includes("session")) return "coaching_session";
  if (lower.includes("subscription") || lower.includes("membership")) return "subscription";
  if (lower.includes("bundle")) return "bundle";
  if (lower.includes("resource")) return "resource";
  if (lower.includes("ai") || lower.includes("companion")) return "ai_companion";
  
  if (PRODUCT_TYPES.includes(lower as CanonicalProductType)) {
    return lower as CanonicalProductType;
  }
  
  return null;
}

/**
 * Normalize an event type string.
 * Maps Stripe raw types to canonical types.
 */
export function normalizeEventType(raw: string): CanonicalEventType {
  const lower = raw.toLowerCase().trim().replace(/\./g, "_");
  
  // Map Stripe webhook event types
  const stripeMapping: Record<string, CanonicalEventType> = {
    "checkout_session_completed": "checkout_completed",
    "payment_intent_succeeded": "payment_succeeded",
    "payment_intent_payment_failed": "payment_failed",
    "charge_refunded": "refund_processed",
    "customer_subscription_created": "subscription_created",
    "customer_subscription_updated": "subscription_renewed",
    "customer_subscription_deleted": "subscription_canceled",
    "invoice_payment_succeeded": "invoice_paid",
    "invoice_payment_failed": "invoice_failed",
  };
  
  if (stripeMapping[lower]) return stripeMapping[lower];
  
  if (ANALYTICS_EVENT_TYPES.includes(lower as CanonicalEventType)) {
    return lower as CanonicalEventType;
  }
  
  // Fallback: treat as webhook_received
  return "webhook_received";
}

/**
 * Validate and normalize a raw analytics event.
 */
export function normalizeEvent(raw: Partial<NormalizedAnalyticsEvent> & { eventType: string }): NormalizedAnalyticsEvent {
  return {
    eventType: normalizeEventType(raw.eventType),
    source: normalizeSource(raw.source),
    userId: raw.userId ?? null,
    sessionId: raw.sessionId ?? null,
    productId: raw.productId ?? null,
    productName: raw.productName ?? null,
    productType: raw.productType ? normalizeProductType(raw.productType) : null,
    cohort: raw.cohort ?? null,
    amount: raw.amount ?? 0,
    currency: (raw.currency || "cad").toLowerCase(),
    stripeEventId: raw.stripeEventId ?? null,
    metadata: raw.metadata ?? null,
  };
}
