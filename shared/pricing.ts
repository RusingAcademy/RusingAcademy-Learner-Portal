/**
 * Centralized Pricing Constants for RusingAcademy Ecosystem
 * 
 * This file is the SINGLE SOURCE OF TRUTH for all prices displayed across the ecosystem.
 * All frontend pages MUST import prices from this file to ensure consistency.
 * 
 * Backend Stripe configuration is in: server/stripe/products.ts
 * These values MUST match the backend configuration.
 * 
 * Last updated: January 27, 2026
 */

// ============================================================================
// PATH SERIES™ COURSES (RusingÂcademy)
// Official pricing from https://www.rusing.academy/
// ============================================================================

export const PATH_SERIES_PRICES = {
  PATH_I: {
    id: "path-i-foundations",
    name: "Path I: FSL - Foundations",
    nameFr: "Path I: FLS - Fondations",
    level: "A1",
    priceInCents: 89900,
    originalPriceInCents: 99900,
    priceDisplay: "$899",
    originalPriceDisplay: "$999",
    currency: "CAD",
  },
  PATH_II: {
    id: "path-ii-everyday-fluency",
    name: "Path II: FSL - Everyday Fluency",
    nameFr: "Path II: FLS - Aisance Quotidienne",
    level: "A2",
    priceInCents: 89900,
    originalPriceInCents: 99900,
    priceDisplay: "$899",
    originalPriceDisplay: "$999",
    currency: "CAD",
  },
  PATH_III: {
    id: "path-iii-operational-french",
    name: "Path III: FSL - Operational French",
    nameFr: "Path III: FLS - Français Opérationnel",
    level: "B1",
    priceInCents: 99900,
    originalPriceInCents: 119900,
    priceDisplay: "$999",
    originalPriceDisplay: "$1,199",
    currency: "CAD",
  },
  PATH_IV: {
    id: "path-iv-strategic-expression",
    name: "Path IV: FSL - Strategic Expression",
    nameFr: "Path IV: FLS - Expression Stratégique",
    level: "B2",
    priceInCents: 109900,
    originalPriceInCents: 129900,
    priceDisplay: "$1,099",
    originalPriceDisplay: "$1,299",
    currency: "CAD",
  },
  PATH_V: {
    id: "path-v-professional-mastery",
    name: "Path V: FSL - Professional Mastery",
    nameFr: "Path V: FLS - Maîtrise Professionnelle",
    level: "C1",
    priceInCents: 119900,
    originalPriceInCents: 149900,
    priceDisplay: "$1,199",
    originalPriceDisplay: "$1,499",
    currency: "CAD",
  },
  PATH_VI: {
    id: "path-vi-sle-accelerator",
    name: "Path VI: FSL - SLE Accelerator",
    nameFr: "Path VI: FLS - Accélérateur ELS",
    level: "SLE Prep",
    priceInCents: 129900,
    originalPriceInCents: 159900,
    priceDisplay: "$1,299",
    originalPriceDisplay: "$1,599",
    currency: "CAD",
  },
} as const;

// Array version for iteration
export const PATH_SERIES_PRICES_ARRAY = Object.values(PATH_SERIES_PRICES);

// ============================================================================
// COACHING PLANS (Lingueefy "Plans Maison")
// ============================================================================

export const COACHING_PLAN_PRICES = {
  STARTER: {
    id: "starter-plan",
    name: "Starter Plan",
    nameFr: "Plan Démarrage",
    hours: 10,
    priceInCents: 59700,
    priceDisplay: "$597",
    pricePerHour: "$59.70",
    validityDays: 90,
    currency: "CAD",
  },
  ACCELERATOR: {
    id: "accelerator-plan",
    name: "Accelerator Plan",
    nameFr: "Plan Accélérateur",
    hours: 20,
    priceInCents: 109700,
    priceDisplay: "$1,097",
    pricePerHour: "$54.85",
    validityDays: 120,
    currency: "CAD",
    popular: true,
  },
  IMMERSION: {
    id: "immersion-plan",
    name: "Immersion Plan",
    nameFr: "Plan Immersion",
    hours: 40,
    priceInCents: 199700,
    priceDisplay: "$1,997",
    pricePerHour: "$49.93",
    validityDays: 180,
    currency: "CAD",
  },
} as const;

// Array version for iteration
export const COACHING_PLAN_PRICES_ARRAY = Object.values(COACHING_PLAN_PRICES);

// ============================================================================
// COACH MARKETPLACE RATES
// ============================================================================

export const COACH_RATES = {
  MIN_HOURLY: 25,
  MAX_HOURLY: 100,
  TYPICAL_MIN: 35,
  TYPICAL_MAX: 80,
  AVERAGE: 50,
  TRIAL_DISCOUNT_PERCENT: 50,
  // Display strings
  RANGE_DISPLAY: "$35 - $80",
  FULL_RANGE_DISPLAY: "$25 - $100+",
} as const;

// ============================================================================
// ENTERPRISE / BUSINESS PRICING (Barholex Media)
// ============================================================================

export const ENTERPRISE_PRICES = {
  TEAM_STARTER: {
    id: "team-starter",
    name: "Starter Team",
    size: "5-10 Employees",
    priceInCents: 450000,
    priceDisplay: "$4,500",
    period: "per quarter",
    sessionsPerEmployee: 20,
  },
  TEAM_GROWTH: {
    id: "team-growth",
    name: "Growth Team",
    size: "11-25 Employees",
    priceInCents: 800000,
    priceDisplay: "$8,000",
    period: "per quarter",
    sessionsPerEmployee: 25,
    popular: true,
  },
  TEAM_ENTERPRISE: {
    id: "team-enterprise",
    name: "Enterprise Team",
    size: "26+ Employees",
    priceDisplay: "Custom",
    period: "per quarter",
    sessionsPerEmployee: "Unlimited",
  },
  // Business packages
  BUSINESS_STARTER: {
    id: "business-starter",
    name: "Business Starter",
    priceInCents: 299700,
    priceDisplay: "$2,997",
  },
  BUSINESS_PROFESSIONAL: {
    id: "business-professional",
    name: "Business Professional",
    priceInCents: 799700,
    priceDisplay: "$7,997",
  },
} as const;

// ============================================================================
// COACH EARNINGS (for Become a Coach page)
// ============================================================================

export const COACH_EARNINGS = {
  HOURLY_RATE_EXAMPLE: 70, // $70/hour used in examples
  HOURLY_RATE_RANGE: "$40 - $100+",
  // Monthly earnings examples
  EXAMPLES: [
    { sessions: "20 sessions/month", amount: "$1,000+" },
    { sessions: "40 sessions/month", amount: "$2,000+" },
    { sessions: "60+ sessions/month", amount: "$3,000+" },
  ],
  NOTE_EN: "* Based on $70/hour rate with volume discounts",
  NOTE_FR: "* Basé sur un tarif de 70$/heure avec remises de volume",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format cents to CAD display string
 */
export function formatCAD(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Format cents to CAD display string with decimals
 */
export function formatCADWithDecimals(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Get Path Series course price by ID
 */
export function getPathSeriesPrice(pathId: string) {
  return PATH_SERIES_PRICES_ARRAY.find(p => p.id === pathId);
}

/**
 * Get Coaching Plan price by ID
 */
export function getCoachingPlanPrice(planId: string) {
  return COACHING_PLAN_PRICES_ARRAY.find(p => p.id === planId);
}
