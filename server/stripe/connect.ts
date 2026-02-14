/**
 * Stripe Connect Integration for Lingueefy
 * 
 * Handles coach onboarding to Stripe Connect and marketplace payouts.
 */

import Stripe from "stripe";
// Note: appUrl is derived from request origin in checkout session

// Lazy Stripe initialization to avoid startup errors
let stripeInstance: Stripe | null = null;

function getStripeInstance(): Stripe {
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

/**
 * Create a Stripe Connect account for a coach
 */
export async function createConnectAccount(coachData: {
  email: string;
  name: string;
  coachId: number;
}): Promise<{ accountId: string; onboardingUrl: string }> {
  const stripe = getStripeInstance();
  // Create Express account for the coach
  const account = await stripe.accounts.create({
    type: "express",
    country: "CA",
    email: coachData.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    metadata: {
      coach_id: coachData.coachId.toString(),
      platform: "lingueefy",
    },
  });

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.VITE_APP_URL || 'https://www.rusingacademy.ca'}/coach/dashboard?stripe=refresh`,
    return_url: `${process.env.VITE_APP_URL || 'https://www.rusingacademy.ca'}/coach/dashboard?stripe=success`,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

/**
 * Get onboarding link for existing Connect account
 */
export async function getOnboardingLink(accountId: string): Promise<string> {
  const stripe = getStripeInstance();
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.VITE_APP_URL || 'https://www.rusingacademy.ca'}/coach/dashboard?stripe=refresh`,
    return_url: `${process.env.VITE_APP_URL || 'https://www.rusingacademy.ca'}/coach/dashboard?stripe=success`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

/**
 * Check if Connect account is fully onboarded
 */
export async function checkAccountStatus(accountId: string): Promise<{
  isOnboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requiresAction: boolean;
}> {
  const stripe = getStripeInstance();
  const account = await stripe.accounts.retrieve(accountId);

  return {
    isOnboarded: account.details_submitted ?? false,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    requiresAction: (account.requirements?.currently_due?.length ?? 0) > 0,
  };
}

/**
 * Create a login link for coach to access their Stripe Express dashboard
 */
export async function createDashboardLink(accountId: string): Promise<string> {
  const stripe = getStripeInstance();
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

/**
 * Create a checkout session for booking a coach session
 */
export async function createCheckoutSession(params: {
  coachStripeAccountId: string;
  coachId: number;
  coachUserId: number;
  coachName: string;
  learnerId: number;
  learnerUserId: number;
  learnerEmail: string;
  learnerName: string;
  sessionType: "trial" | "single" | "package";
  packageSize?: 5 | 10;
  amountCents: number;
  platformFeeCents: number;
  sessionId?: number;
  sessionDate?: string;
  sessionTime?: string;
  duration?: number;
  origin: string;
}): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripeInstance();
  const {
    coachStripeAccountId,
    coachId,
    coachUserId,
    coachName,
    learnerId,
    learnerUserId,
    learnerEmail,
    learnerName,
    sessionType,
    packageSize,
    amountCents,
    platformFeeCents,
    sessionId,
    sessionDate,
    sessionTime,
    duration,
    origin,
  } = params;

  // Determine line item description
  let description = "Coaching Session";
  if (sessionType === "trial") {
    description = "Trial Session (30 minutes)";
  } else if (sessionType === "package" && packageSize) {
    description = `${packageSize}-Session Package`;
  } else {
    description = "Single Session (60 minutes)";
  }

  // Calculate 13% HST (Ontario)
  const HST_RATE = 0.13;
  const taxAmountCents = Math.round(amountCents * HST_RATE);
  const totalWithTaxCents = amountCents + taxAmountCents;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: learnerEmail,
    client_reference_id: learnerId.toString(),
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: description,
            description: `Lingueefy coaching session with ${coachName}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "HST (Ontario 13%)",
            description: "Harmonized Sales Tax - Ontario, Canada",
          },
          unit_amount: taxAmountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: coachStripeAccountId,
      },
    },
    metadata: {
      platform: "lingueefy",
      coach_id: coachId.toString(),
      coach_user_id: coachUserId.toString(),
      coach_name: coachName,
      learner_id: learnerId.toString(),
      learner_user_id: learnerUserId.toString(),
      learner_name: learnerName,
      session_type: sessionType,
      package_size: packageSize?.toString() || "",
      session_id: sessionId?.toString() || "",
      session_date: sessionDate || "",
      session_time: sessionTime || "",
      duration: duration?.toString() || "60",
    },
    allow_promotion_codes: true,
    success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/booking/cancelled`,
  });

  return {
    sessionId: checkoutSession.id,
    url: checkoutSession.url!,
  };
}

/**
 * Process a refund with proper fee reversal
 */
export async function processRefund(params: {
  paymentIntentId: string;
  amountCents?: number; // If not provided, full refund
  reason?: "requested_by_customer" | "duplicate" | "fraudulent";
  reverseTransfer?: boolean;
  refundApplicationFee?: boolean;
}): Promise<{ refundId: string; status: string }> {
  const stripe = getStripeInstance();
  const {
    paymentIntentId,
    amountCents,
    reason = "requested_by_customer",
    reverseTransfer = true,
    refundApplicationFee = true,
  } = params;

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents,
    reason,
    reverse_transfer: reverseTransfer,
    refund_application_fee: refundApplicationFee,
  });

  return {
    refundId: refund.id,
    status: refund.status ?? "unknown",
  };
}

/**
 * Get Stripe instance for direct API calls
 */
export function getStripe(): Stripe {
  return getStripeInstance();
}
