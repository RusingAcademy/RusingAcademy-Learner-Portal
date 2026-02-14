/**
 * Automated Lead Scoring System
 * 
 * Calculates lead scores based on multiple factors:
 * - Lead type (government, enterprise, organization, individual)
 * - Budget range
 * - Timeline urgency
 * - Company information completeness
 * - Source platform
 * - Engagement signals
 */

// Types
interface LeadData {
  leadType: "individual" | "organization" | "government" | "enterprise";
  source: "lingueefy" | "rusingacademy" | "barholex" | "ecosystem_hub" | "external";
  formType?: string;
  company?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  budget?: string | null;
  timeline?: string | null;
  message?: string | null;
  interests?: string[] | null;
}

interface ScoringBreakdown {
  leadTypeScore: number;
  budgetScore: number;
  timelineScore: number;
  completenessScore: number;
  sourceScore: number;
  engagementScore: number;
  totalScore: number;
  factors: string[];
}

// Scoring weights (total = 100)
const WEIGHTS = {
  leadType: 25,      // Max 25 points
  budget: 20,        // Max 20 points
  timeline: 15,      // Max 15 points
  completeness: 15,  // Max 15 points
  source: 10,        // Max 10 points
  engagement: 15,    // Max 15 points
};

// Lead type scores (percentage of max weight)
const LEAD_TYPE_SCORES: Record<string, number> = {
  government: 1.0,    // Government contracts are highest value
  enterprise: 0.9,    // Enterprise clients are high value
  organization: 0.7,  // Organizations (NGOs, schools) are medium-high
  individual: 0.4,    // Individuals are lower value but still important
};

// Budget range scores (percentage of max weight)
const BUDGET_SCORES: Record<string, number> = {
  "$100,000+": 1.0,
  "$50,000-$100,000": 0.9,
  "$25,000-$50,000": 0.8,
  "$15,000-$25,000": 0.7,
  "$10,000-$15,000": 0.6,
  "$5,000-$10,000": 0.5,
  "$2,500-$5,000": 0.4,
  "$1,000-$2,500": 0.3,
  "Under $1,000": 0.2,
  "Not specified": 0.1,
};

// Timeline urgency scores (percentage of max weight)
const TIMELINE_SCORES: Record<string, number> = {
  "Immediate": 1.0,
  "This month": 0.95,
  "Q1 2026": 0.9,
  "Q2 2026": 0.8,
  "Q3 2026": 0.6,
  "Q4 2026": 0.5,
  "2027": 0.3,
  "Not specified": 0.2,
  "Just exploring": 0.1,
};

// Source platform scores (percentage of max weight)
const SOURCE_SCORES: Record<string, number> = {
  rusingacademy: 1.0,    // B2B focus, highest intent
  barholex: 0.9,         // Project-based, high intent
  lingueefy: 0.7,        // Mixed B2C/B2B
  ecosystem_hub: 0.8,    // Shows ecosystem awareness
  external: 0.5,         // Unknown source
};

/**
 * Parse budget string to get score
 */
function parseBudgetScore(budget: string | null | undefined): number {
  if (!budget) return BUDGET_SCORES["Not specified"];
  
  // Check for exact matches first
  if (BUDGET_SCORES[budget]) return BUDGET_SCORES[budget];
  
  // Parse numeric values
  const numericMatch = budget.match(/\$?([\d,]+)/);
  if (numericMatch) {
    const amount = parseInt(numericMatch[1].replace(/,/g, ""));
    if (amount >= 100000) return 1.0;
    if (amount >= 50000) return 0.9;
    if (amount >= 25000) return 0.8;
    if (amount >= 15000) return 0.7;
    if (amount >= 10000) return 0.6;
    if (amount >= 5000) return 0.5;
    if (amount >= 2500) return 0.4;
    if (amount >= 1000) return 0.3;
    return 0.2;
  }
  
  return BUDGET_SCORES["Not specified"];
}

/**
 * Parse timeline string to get score
 */
function parseTimelineScore(timeline: string | null | undefined): number {
  if (!timeline) return TIMELINE_SCORES["Not specified"];
  
  const lower = timeline.toLowerCase();
  
  // Check for urgency keywords
  if (lower.includes("immediate") || lower.includes("asap") || lower.includes("urgent")) {
    return TIMELINE_SCORES["Immediate"];
  }
  if (lower.includes("this month") || lower.includes("ce mois")) {
    return TIMELINE_SCORES["This month"];
  }
  if (lower.includes("q1") || lower.includes("january") || lower.includes("february") || lower.includes("march")) {
    return TIMELINE_SCORES["Q1 2026"];
  }
  if (lower.includes("q2") || lower.includes("april") || lower.includes("may") || lower.includes("june")) {
    return TIMELINE_SCORES["Q2 2026"];
  }
  if (lower.includes("q3") || lower.includes("july") || lower.includes("august") || lower.includes("september")) {
    return TIMELINE_SCORES["Q3 2026"];
  }
  if (lower.includes("q4") || lower.includes("october") || lower.includes("november") || lower.includes("december")) {
    return TIMELINE_SCORES["Q4 2026"];
  }
  if (lower.includes("2027") || lower.includes("next year")) {
    return TIMELINE_SCORES["2027"];
  }
  if (lower.includes("exploring") || lower.includes("research") || lower.includes("just looking")) {
    return TIMELINE_SCORES["Just exploring"];
  }
  
  return TIMELINE_SCORES["Not specified"];
}

/**
 * Calculate completeness score based on profile information
 */
function calculateCompletenessScore(lead: LeadData): number {
  let score = 0;
  const maxFields = 6;
  
  if (lead.company) score++;
  if (lead.jobTitle) score++;
  if (lead.phone) score++;
  if (lead.budget) score++;
  if (lead.timeline) score++;
  if (lead.message && lead.message.length > 50) score++;
  
  return score / maxFields;
}

/**
 * Calculate engagement score based on interaction signals
 */
function calculateEngagementScore(lead: LeadData): number {
  let score = 0.3; // Base score for submitting a form
  
  // Longer messages indicate higher engagement
  if (lead.message) {
    if (lead.message.length > 200) score += 0.3;
    else if (lead.message.length > 100) score += 0.2;
    else if (lead.message.length > 50) score += 0.1;
  }
  
  // Multiple interests indicate higher engagement
  if (lead.interests && lead.interests.length > 0) {
    score += Math.min(lead.interests.length * 0.1, 0.3);
  }
  
  // Specific form types indicate intent
  if (lead.formType === "proposal" || lead.formType === "quote") {
    score += 0.2;
  } else if (lead.formType === "demo" || lead.formType === "consultation") {
    score += 0.15;
  }
  
  return Math.min(score, 1.0);
}

/**
 * Calculate total lead score with breakdown
 */
export function calculateLeadScore(lead: LeadData): ScoringBreakdown {
  const factors: string[] = [];
  
  // Lead type score
  const leadTypeMultiplier = LEAD_TYPE_SCORES[lead.leadType] || 0.4;
  const leadTypeScore = Math.round(WEIGHTS.leadType * leadTypeMultiplier);
  if (leadTypeMultiplier >= 0.9) {
    factors.push(lead.leadType === "government" ? "Government client" : "Enterprise client");
  }
  
  // Budget score
  const budgetMultiplier = parseBudgetScore(lead.budget);
  const budgetScore = Math.round(WEIGHTS.budget * budgetMultiplier);
  if (budgetMultiplier >= 0.8) {
    factors.push("High budget");
  }
  
  // Timeline score
  const timelineMultiplier = parseTimelineScore(lead.timeline);
  const timelineScore = Math.round(WEIGHTS.timeline * timelineMultiplier);
  if (timelineMultiplier >= 0.9) {
    factors.push("Urgent timeline");
  }
  
  // Completeness score
  const completenessMultiplier = calculateCompletenessScore(lead);
  const completenessScore = Math.round(WEIGHTS.completeness * completenessMultiplier);
  if (completenessMultiplier >= 0.8) {
    factors.push("Complete profile");
  }
  
  // Source score
  const sourceMultiplier = SOURCE_SCORES[lead.source] || 0.5;
  const sourceScore = Math.round(WEIGHTS.source * sourceMultiplier);
  if (sourceMultiplier >= 0.9) {
    factors.push(`High-intent source (${lead.source})`);
  }
  
  // Engagement score
  const engagementMultiplier = calculateEngagementScore(lead);
  const engagementScore = Math.round(WEIGHTS.engagement * engagementMultiplier);
  if (engagementMultiplier >= 0.7) {
    factors.push("High engagement");
  }
  
  // Calculate total
  const totalScore = leadTypeScore + budgetScore + timelineScore + completenessScore + sourceScore + engagementScore;
  
  return {
    leadTypeScore,
    budgetScore,
    timelineScore,
    completenessScore,
    sourceScore,
    engagementScore,
    totalScore: Math.min(totalScore, 100),
    factors,
  };
}

/**
 * Get lead priority label based on score
 */
export function getLeadPriority(score: number): "hot" | "warm" | "cold" {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

/**
 * Get recommended action based on lead score and data
 */
export function getRecommendedAction(lead: LeadData, score: number): string {
  const priority = getLeadPriority(score);
  
  if (priority === "hot") {
    if (lead.leadType === "government" || lead.leadType === "enterprise") {
      return "Schedule discovery call within 24 hours";
    }
    return "Contact within 24 hours with personalized proposal";
  }
  
  if (priority === "warm") {
    if (lead.budget && parseBudgetScore(lead.budget) >= 0.7) {
      return "Send detailed information package and follow up in 48 hours";
    }
    return "Add to nurture sequence and follow up in 3-5 days";
  }
  
  return "Add to newsletter and long-term nurture sequence";
}

/**
 * Recalculate score when lead data is updated
 */
export function recalculateScore(
  currentScore: number,
  updates: Partial<LeadData>,
  currentData: LeadData
): number {
  const updatedData = { ...currentData, ...updates };
  const { totalScore } = calculateLeadScore(updatedData);
  return totalScore;
}

/**
 * Batch score multiple leads
 */
export function batchCalculateScores(leads: LeadData[]): Map<number, ScoringBreakdown> {
  const results = new Map<number, ScoringBreakdown>();
  
  leads.forEach((lead, index) => {
    results.set(index, calculateLeadScore(lead));
  });
  
  return results;
}

// ============================================================================
// DATABASE INTEGRATION - Auto-recalculation
// ============================================================================

import { getDb } from "./db";
import { ecosystemLeads, ecosystemLeadActivities, sequenceEmailLogs, leadSequenceEnrollments, crmMeetings } from "../drizzle/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

/**
 * Calculate engagement bonus from email activity
 */
async function calculateEmailEngagementBonus(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, leadId: number): Promise<number> {
  let bonus = 0;
  
  // Get enrollments for this lead
  const enrollments = await db
    .select({ id: leadSequenceEnrollments.id })
    .from(leadSequenceEnrollments)
    .where(eq(leadSequenceEnrollments.leadId, leadId));
  
  if (enrollments.length === 0) return 0;
  
  const enrollmentIds = enrollments.map(e => e.id);
  
  // Count opened emails (max +10 bonus)
  for (const enrollmentId of enrollmentIds) {
    const openedEmails = await db
      .select({ count: count() })
      .from(sequenceEmailLogs)
      .where(
        and(
          eq(sequenceEmailLogs.enrollmentId, enrollmentId),
          eq(sequenceEmailLogs.opened, true)
        )
      );
    
    bonus += Math.min((openedEmails[0]?.count || 0) * 3, 10);
  }
  
  // Count clicked emails (max +15 bonus)
  for (const enrollmentId of enrollmentIds) {
    const clickedEmails = await db
      .select({ count: count() })
      .from(sequenceEmailLogs)
      .where(
        and(
          eq(sequenceEmailLogs.enrollmentId, enrollmentId),
          eq(sequenceEmailLogs.clicked, true)
        )
      );
    
    bonus += Math.min((clickedEmails[0]?.count || 0) * 5, 15);
  }
  
  return Math.min(bonus, 25);
}

/**
 * Calculate meeting activity bonus
 */
async function calculateMeetingBonus(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, leadId: number): Promise<number> {
  let bonus = 0;
  
  const meetings = await db
    .select({
      status: crmMeetings.status,
      outcome: crmMeetings.outcome,
    })
    .from(crmMeetings)
    .where(eq(crmMeetings.leadId, leadId));
  
  // Scheduled meetings (+5 each, max 10)
  const scheduledCount = meetings.filter(m => m.status === "scheduled" || m.status === "completed").length;
  bonus += Math.min(scheduledCount * 5, 10);
  
  // Completed meetings (+8 each, max 16)
  const completedCount = meetings.filter(m => m.status === "completed").length;
  bonus += Math.min(completedCount * 8, 16);
  
  // Qualified outcome (+10 one-time)
  const hasQualified = meetings.some(m => 
    m.outcome?.toLowerCase().includes("qualified") || 
    m.outcome?.toLowerCase().includes("converted")
  );
  if (hasQualified) bonus += 10;
  
  return Math.min(bonus, 25);
}

/**
 * Calculate recency bonus based on last activity
 */
function calculateRecencyBonus(lastContactedAt: Date | null, createdAt: Date): number {
  const referenceDate = lastContactedAt || createdAt;
  const daysSince = (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince <= 3) return 10;
  if (daysSince <= 7) return 8;
  if (daysSince <= 14) return 5;
  if (daysSince <= 30) return 3;
  
  return 0;
}

/**
 * Update lead score in database with all factors
 */
export async function updateLeadScoreInDb(leadId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Get lead data
  const [lead] = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, leadId))
    .limit(1);
  
  if (!lead) return null;
  
  // Calculate base score from lead data
  const leadData: LeadData = {
    leadType: (lead.leadType as LeadData["leadType"]) || "individual",
    source: (lead.source as LeadData["source"]) || "external",
    formType: lead.formType || undefined,
    company: lead.company,
    jobTitle: lead.jobTitle,
    phone: lead.phone,
    budget: lead.budget,
    timeline: lead.timeline,
    message: lead.message,
    interests: lead.interests as string[] | null,
  };
  
  const baseBreakdown = calculateLeadScore(leadData);
  let totalScore = baseBreakdown.totalScore;
  
  // Add engagement bonuses
  const emailBonus = await calculateEmailEngagementBonus(db, leadId);
  const meetingBonus = await calculateMeetingBonus(db, leadId);
  const recencyBonus = calculateRecencyBonus(lead.lastContactedAt, lead.createdAt);
  
  totalScore = Math.min(totalScore + emailBonus + meetingBonus + recencyBonus, 100);
  
  // Update in database
  await db
    .update(ecosystemLeads)
    .set({ leadScore: totalScore })
    .where(eq(ecosystemLeads.id, leadId));
  
  console.log(`[Lead Scoring] Updated lead ${leadId}: base=${baseBreakdown.totalScore}, email=${emailBonus}, meeting=${meetingBonus}, recency=${recencyBonus}, total=${totalScore}`);
  
  return totalScore;
}

/**
 * Recalculate scores for all leads in database
 */
export async function recalculateAllLeadScores(): Promise<{
  updated: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) return { updated: 0, errors: 0 };
  
  const leads = await db
    .select({ id: ecosystemLeads.id })
    .from(ecosystemLeads);
  
  let updated = 0;
  let errors = 0;
  
  for (const lead of leads) {
    try {
      await updateLeadScoreInDb(lead.id);
      updated++;
    } catch (error) {
      console.error(`[Lead Scoring] Error updating lead ${lead.id}:`, error);
      errors++;
    }
  }
  
  console.log(`[Lead Scoring] Recalculated ${updated} leads, ${errors} errors`);
  
  return { updated, errors };
}

/**
 * Get detailed score breakdown for a lead
 */
export async function getLeadScoreBreakdown(leadId: number): Promise<{
  base: ScoringBreakdown;
  emailBonus: number;
  meetingBonus: number;
  recencyBonus: number;
  totalScore: number;
} | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [lead] = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, leadId))
    .limit(1);
  
  if (!lead) return null;
  
  const leadData: LeadData = {
    leadType: (lead.leadType as LeadData["leadType"]) || "individual",
    source: (lead.source as LeadData["source"]) || "external",
    formType: lead.formType || undefined,
    company: lead.company,
    jobTitle: lead.jobTitle,
    phone: lead.phone,
    budget: lead.budget,
    timeline: lead.timeline,
    message: lead.message,
    interests: lead.interests as string[] | null,
  };
  
  const base = calculateLeadScore(leadData);
  const emailBonus = await calculateEmailEngagementBonus(db, leadId);
  const meetingBonus = await calculateMeetingBonus(db, leadId);
  const recencyBonus = calculateRecencyBonus(lead.lastContactedAt, lead.createdAt);
  
  return {
    base,
    emailBonus,
    meetingBonus,
    recencyBonus,
    totalScore: Math.min(base.totalScore + emailBonus + meetingBonus + recencyBonus, 100),
  };
}
