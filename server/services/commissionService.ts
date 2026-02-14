/**
 * Commission Service - Progressive Rate System
 * 
 * Integrates with AdminCommission.tsx progressive rates:
 * - Trial Sessions: 0% commission
 * - New Coach (0-10h): 26% commission
 * - Regular (10-30h): 22% commission
 * - Experienced (30-60h): 19% commission
 * - Senior (60-100h): 17% commission
 * - Expert (100h+): 15% commission
 * - SLE Verified: 15% commission (override)
 * 
 * @module server/services/commissionService
 */

import Stripe from 'stripe';

// Lazy Stripe initialization to avoid startup errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2025-12-15.clover' as const,
    });
  }
  return stripeInstance;
}

// Commission tiers based on AdminCommission.tsx
export const COMMISSION_TIERS = {
  TRIAL: { minHours: 0, maxHours: 0, rate: 0, label: 'Session d\'essai' },
  NEW_COACH: { minHours: 0, maxHours: 10, rate: 26, label: 'Nouveau Coach' },
  REGULAR: { minHours: 10, maxHours: 30, rate: 22, label: 'Coach Régulier' },
  EXPERIENCED: { minHours: 30, maxHours: 60, rate: 19, label: 'Coach Expérimenté' },
  SENIOR: { minHours: 60, maxHours: 100, rate: 17, label: 'Coach Senior' },
  EXPERT: { minHours: 100, maxHours: Infinity, rate: 15, label: 'Coach Expert' },
  SLE_VERIFIED: { minHours: 0, maxHours: Infinity, rate: 15, label: 'Certifié SLE' },
} as const;

export type CommissionTier = keyof typeof COMMISSION_TIERS;

/**
 * Get commission tier based on coach's total hours
 */
export function getCommissionTier(
  totalHours: number,
  isSLEVerified: boolean = false,
  isTrialSession: boolean = false
): { tier: CommissionTier; rate: number; label: string } {
  if (isTrialSession) {
    return { tier: 'TRIAL', rate: 0, label: COMMISSION_TIERS.TRIAL.label };
  }
  if (isSLEVerified) {
    return { tier: 'SLE_VERIFIED', rate: 15, label: COMMISSION_TIERS.SLE_VERIFIED.label };
  }
  if (totalHours >= 100) {
    return { tier: 'EXPERT', rate: 15, label: COMMISSION_TIERS.EXPERT.label };
  } else if (totalHours >= 60) {
    return { tier: 'SENIOR', rate: 17, label: COMMISSION_TIERS.SENIOR.label };
  } else if (totalHours >= 30) {
    return { tier: 'EXPERIENCED', rate: 19, label: COMMISSION_TIERS.EXPERIENCED.label };
  } else if (totalHours >= 10) {
    return { tier: 'REGULAR', rate: 22, label: COMMISSION_TIERS.REGULAR.label };
  } else {
    return { tier: 'NEW_COACH', rate: 26, label: COMMISSION_TIERS.NEW_COACH.label };
  }
}

/**
 * Calculate payment split for a coaching session
 */
export function calculatePaymentSplit(
  sessionPriceCents: number,
  totalHours: number,
  isSLEVerified: boolean = false,
  isTrialSession: boolean = false
): {
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  coachPayout: number;
  tier: string;
} {
  const { rate, label } = getCommissionTier(totalHours, isSLEVerified, isTrialSession);
  const commissionAmount = Math.round((sessionPriceCents * rate) / 100);
  const coachPayout = sessionPriceCents - commissionAmount;
  return {
    totalAmount: sessionPriceCents,
    commissionRate: rate,
    commissionAmount,
    coachPayout,
    tier: label,
  };
}

/**
 * Create a Stripe PaymentIntent with application fee for commission
 */
export async function createSessionPayment(params: {
  coachStripeAccountId: string;
  sessionPriceCents: number;
  coachTotalHours: number;
  isSLEVerified: boolean;
  isTrialSession: boolean;
  learnerId: string;
  coachId: string;
  sessionId: string;
  metadata?: Record<string, string>;
}): Promise<{
  paymentIntent: Stripe.PaymentIntent;
  paymentSplit: ReturnType<typeof calculatePaymentSplit>;
}> {
  const {
    coachStripeAccountId,
    sessionPriceCents,
    coachTotalHours,
    isSLEVerified,
    isTrialSession,
    learnerId,
    coachId,
    sessionId,
    metadata = {},
  } = params;

  const paymentSplit = calculatePaymentSplit(
    sessionPriceCents,
    coachTotalHours,
    isSLEVerified,
    isTrialSession
  );

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: sessionPriceCents,
    currency: 'cad',
    application_fee_amount: paymentSplit.commissionAmount,
    transfer_data: {
      destination: coachStripeAccountId,
    },
    metadata: {
      learnerId,
      coachId,
      sessionId,
      commissionRate: paymentSplit.commissionRate.toString(),
      commissionTier: paymentSplit.tier,
      coachPayout: paymentSplit.coachPayout.toString(),
      ...metadata,
    },
  });

  return { paymentIntent, paymentSplit };
}

export default {
  COMMISSION_TIERS,
  getCommissionTier,
  calculatePaymentSplit,
  createSessionPayment,
};
