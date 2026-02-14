/**
 * Stripe Connect Service
 * Handles coach payment processing via Stripe Connect
 * 
 * Features:
 * - Create connected accounts for coaches
 * - Handle OAuth onboarding flow
 * - Process session payments with automatic splits
 * - Transfer funds to coach accounts
 * - Handle refunds and disputes
 */

import Stripe from "stripe";

// Lazy Stripe initialization to avoid startup errors
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

// Platform commission: 30% of all coach payments go to RusingÂcademy
// This is agreed upon in the Coach Terms & Conditions
const PLATFORM_FEE_PERCENT = 30;

interface CreateConnectedAccountParams {
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
}

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  coachAccountId: string;
  learnerId: string;
  sessionId: string;
  description?: string;
}

export async function createConnectedAccount(params: CreateConnectedAccountParams): Promise<Stripe.Account> {
  const { email, firstName, lastName, country = "CA" } = params;

  const account = await getStripe().accounts.create({
    type: "express",
    country,
    email,
    capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    business_type: "individual",
    individual: { first_name: firstName, last_name: lastName, email },
    business_profile: {
      mcc: "8299",
      name: `${firstName} ${lastName} - Coach RusingÂcademy`,
      product_description: "Language coaching services for Canadian public servants",
    },
    metadata: { platform: "rusingacademy", role: "coach" },
  });

  return account;
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<Stripe.AccountLink> {
  return await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
    collect: "eventually_due",
  });
}

export async function getAccountStatus(accountId: string) {
  const account = await getStripe().accounts.retrieve(accountId);
  return {
    isComplete: account.details_submitted ?? false,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    requirements: account.requirements ?? null,
  };
}

export async function createLoginLink(accountId: string): Promise<string> {
  const loginLink = await getStripe().accounts.createLoginLink(accountId);
  return loginLink.url;
}

export async function createSessionPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
  const { amount, currency = "cad", coachAccountId, learnerId, sessionId, description } = params;
  const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));

  return await getStripe().paymentIntents.create({
    amount,
    currency,
    application_fee_amount: platformFee,
    transfer_data: { destination: coachAccountId },
    description: description || "Coaching session - RusingÂcademy",
    metadata: { platform: "rusingacademy", learnerId, sessionId, coachAccountId, platformFee: platformFee.toString() },
    automatic_payment_methods: { enabled: true },
  });
}

export async function refundSession(paymentIntentId: string, amount?: number, reason?: "duplicate" | "fraudulent" | "requested_by_customer"): Promise<Stripe.Refund> {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason: reason || "requested_by_customer",
    refund_application_fee: true,
    reverse_transfer: true,
  };
  if (amount) refundParams.amount = amount;
  return await getStripe().refunds.create(refundParams);
}

export async function getCoachEarnings(accountId: string) {
  const balance = await getStripe().balance.retrieve({ stripeAccount: accountId });
  const transfers = await getStripe().transfers.list({ destination: accountId, limit: 10 });
  
  return {
    totalEarnings: transfers.data.reduce((sum, t) => sum + t.amount, 0),
    pendingBalance: balance.pending.reduce((sum, b) => sum + (b.currency === "cad" ? b.amount : 0), 0),
    availableBalance: balance.available.reduce((sum, b) => sum + (b.currency === "cad" ? b.amount : 0), 0),
    recentTransfers: transfers.data,
  };
}

export function calculatePriceBreakdown(hourlyRate: number, durationMinutes: number = 60) {
  const sessionPrice = Math.round((hourlyRate / 60) * durationMinutes * 100);
  const platformFee = Math.round(sessionPrice * (PLATFORM_FEE_PERCENT / 100));
  const coachEarnings = sessionPrice - platformFee;

  return {
    sessionPrice,
    platformFee,
    coachEarnings,
    displayPrice: (sessionPrice / 100).toFixed(2),
    displayCoachEarnings: (coachEarnings / 100).toFixed(2),
    displayPlatformFee: (platformFee / 100).toFixed(2),
  };
}

export default {
  createConnectedAccount,
  createAccountLink,
  getAccountStatus,
  createLoginLink,
  createSessionPaymentIntent,
  refundSession,
  getCoachEarnings,
  calculatePriceBreakdown,
};
