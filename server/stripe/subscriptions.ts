/**
 * Stripe Subscriptions Integration for Lingueefy
 * 
 * Handles recurring billing for premium memberships and SLE AI Companion access.
 */

import Stripe from "stripe";

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

// Subscription plan types
export type PlanType = "premium_membership" | "sle_ai_companion" | "bundle";
export type BillingInterval = "month" | "year";

// Plan configuration
export const SUBSCRIPTION_PLANS = {
  premium_membership: {
    name: "Premium Membership",
    description: "Full access to all courses, priority booking, and exclusive content",
    monthlyPrice: 2999, // $29.99 CAD
    annualPrice: 29900, // $299.00 CAD (2 months free)
    features: [
      "Unlimited course access",
      "Priority coach booking",
      "Exclusive webinars",
      "Progress tracking dashboard",
      "Certificate downloads",
      "Community forum access",
    ],
  },
  sle_ai_companion: {
    name: "SLE AI Companion Premium",
    description: "Unlimited AI-powered practice sessions ",
    monthlyPrice: 1999, // $19.99 CAD
    annualPrice: 19900, // $199.00 CAD (2 months free)
    features: [
      "Unlimited AI conversations",
      "Voice practice sessions",
      "SLE exam simulations",
      "Personalized feedback",
      "Progress analytics",
      "Pronunciation coaching",
    ],
  },
  bundle: {
    name: "Complete Bundle",
    description: "Premium Membership + SLE AI Companion at a discounted rate",
    monthlyPrice: 3999, // $39.99 CAD
    annualPrice: 39900, // $399.00 CAD
    features: [
      "Everything in Premium Membership",
      "Everything in SLE AI Companion Premium",
      "Priority support",
      "1 free coaching session/month",
    ],
  },
};

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(params: {
  userId: number;
  email: string;
  name: string;
  existingCustomerId?: string | null;
}): Promise<string> {
  const stripe = getStripeInstance();
  const { userId, email, name, existingCustomerId } = params;

  // If customer already exists, return it
  if (existingCustomerId) {
    try {
      await stripe.customers.retrieve(existingCustomerId);
      return existingCustomerId;
    } catch {
      // Customer doesn't exist, create new one
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId.toString(),
      platform: "lingueefy",
    },
  });

  return customer.id;
}

/**
 * Create or get a Stripe Price for a subscription plan
 */
export async function getOrCreatePrice(params: {
  planType: PlanType;
  interval: BillingInterval;
}): Promise<string> {
  const stripe = getStripeInstance();
  const { planType, interval } = params;
  const plan = SUBSCRIPTION_PLANS[planType];
  const amount = interval === "month" ? plan.monthlyPrice : plan.annualPrice;

  // Search for existing price
  const prices = await stripe.prices.search({
    query: `active:'true' AND metadata['plan_type']:'${planType}' AND metadata['interval']:'${interval}'`,
  });

  if (prices.data.length > 0) {
    return prices.data[0].id;
  }

  // Create product if it doesn't exist
  const products = await stripe.products.search({
    query: `active:'true' AND metadata['plan_type']:'${planType}'`,
  });

  let productId: string;
  if (products.data.length > 0) {
    productId = products.data[0].id;
  } else {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        plan_type: planType,
        platform: "lingueefy",
      },
    });
    productId = product.id;
  }

  // Create price
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: "cad",
    recurring: {
      interval,
    },
    metadata: {
      plan_type: planType,
      interval,
      platform: "lingueefy",
    },
  });

  return price.id;
}

/**
 * Create a subscription checkout session
 */
export async function createSubscriptionCheckout(params: {
  customerId: string;
  priceId: string;
  userId: number;
  planType: PlanType;
  interval: BillingInterval;
  origin: string;
  trialDays?: number;
}): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripeInstance();
  const { customerId, priceId, userId, planType, interval, origin, trialDays } = params;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId.toString(),
      plan_type: planType,
      interval,
      platform: "lingueefy",
    },
    allow_promotion_codes: true,
    success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=true`,
  };

  // Add trial if specified
  if (trialDays && trialDays > 0) {
    sessionParams.subscription_data = {
      trial_period_days: trialDays,
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createCustomerPortal(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripeInstance();
  const { customerId, returnUrl } = params;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  const stripe = getStripeInstance();
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(params: {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
}): Promise<Stripe.Subscription> {
  const stripe = getStripeInstance();
  const { subscriptionId, cancelAtPeriodEnd = true } = params;

  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
}

/**
 * Resume a canceled subscription (if cancel_at_period_end was true)
 */
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripeInstance();
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Update subscription to a different plan
 */
export async function updateSubscriptionPlan(params: {
  subscriptionId: string;
  newPriceId: string;
  prorate?: boolean;
}): Promise<Stripe.Subscription> {
  const stripe = getStripeInstance();
  const { subscriptionId, newPriceId, prorate = true } = params;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: prorate ? "create_prorations" : "none",
  });
}

/**
 * Get all subscriptions for a customer
 */
export async function getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const stripe = getStripeInstance();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
  });

  return subscriptions.data;
}

/**
 * Get upcoming invoice for a subscription
 */
export async function getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice | null> {
  const stripe = getStripeInstance();
  try {
    return await stripe.invoices.createPreview({
      customer: customerId,
    });
  } catch {
    return null;
  }
}

/**
 * Get invoice history for a customer
 */
export async function getInvoiceHistory(params: {
  customerId: string;
  limit?: number;
}): Promise<Stripe.Invoice[]> {
  const stripe = getStripeInstance();
  const { customerId, limit = 10 } = params;

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

/**
 * Get Stripe instance for direct API calls
 */
export function getStripe(): Stripe {
  return getStripeInstance();
}
