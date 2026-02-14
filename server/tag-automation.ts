/**
 * Tag Automation Service
 * 
 * Automatically assign tags to leads based on configurable rules.
 */

import { getDb } from "./db";
import { ecosystemLeads, crmLeadTags, crmLeadTagAssignments, crmTagAutomationRules } from "../drizzle/schema";
import { eq, and, gt, lt, gte, lte } from "drizzle-orm";

export interface AutomationRule {
  id: number;
  name: string;
  description: string | null;
  tagId: number;
  conditionType: string;
  conditionValue: string;
  isActive: boolean;
  priority: number;
}

export const CONDITION_TYPES = {
  BUDGET_ABOVE: "budget_above",
  BUDGET_BELOW: "budget_below",
  SCORE_ABOVE: "score_above",
  SCORE_BELOW: "score_below",
  SOURCE_EQUALS: "source_equals",
  LEAD_TYPE_EQUALS: "lead_type_equals",
  STATUS_EQUALS: "status_equals",
} as const;

export type ConditionType = typeof CONDITION_TYPES[keyof typeof CONDITION_TYPES];

/**
 * Check if a lead matches a rule's condition
 */
export function checkRuleCondition(
  lead: {
    budget?: string | number | null;
    leadScore?: number | null;
    source?: string | null;
    leadType?: string | null;
    status?: string | null;
  },
  rule: AutomationRule
): boolean {
  const { conditionType, conditionValue } = rule;
  const budgetValue = typeof lead.budget === "string" ? parseFloat(lead.budget) : (lead.budget || 0);

  switch (conditionType) {
    case CONDITION_TYPES.BUDGET_ABOVE:
      return budgetValue > parseFloat(conditionValue);
    
    case CONDITION_TYPES.BUDGET_BELOW:
      return budgetValue < parseFloat(conditionValue);
    
    case CONDITION_TYPES.SCORE_ABOVE:
      return (lead.leadScore || 0) > parseFloat(conditionValue);
    
    case CONDITION_TYPES.SCORE_BELOW:
      return (lead.leadScore || 0) < parseFloat(conditionValue);
    
    case CONDITION_TYPES.SOURCE_EQUALS:
      return (lead.source || "").toLowerCase() === conditionValue.toLowerCase();
    
    case CONDITION_TYPES.LEAD_TYPE_EQUALS:
      return (lead.leadType || "").toLowerCase() === conditionValue.toLowerCase();
    
    case CONDITION_TYPES.STATUS_EQUALS:
      return (lead.status || "").toLowerCase() === conditionValue.toLowerCase();
    
    default:
      return false;
  }
}

/**
 * Apply automation rules to a single lead
 */
export async function applyAutomationRulesToLead(leadId: number): Promise<{
  applied: number;
  tags: string[];
}> {
  const db = await getDb();
  if (!db) return { applied: 0, tags: [] };

  // Get the lead
  const leads = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, leadId))
    .limit(1);

  if (leads.length === 0) return { applied: 0, tags: [] };

  const lead = leads[0];

  // Get active rules ordered by priority
  const rules = await db
    .select()
    .from(crmTagAutomationRules)
    .where(eq(crmTagAutomationRules.isActive, true))
    .orderBy(crmTagAutomationRules.priority);

  // Get existing tag assignments for this lead
  const existingAssignments = await db
    .select({ tagId: crmLeadTagAssignments.tagId })
    .from(crmLeadTagAssignments)
    .where(eq(crmLeadTagAssignments.leadId, leadId));

  const existingTagIds = new Set(existingAssignments.map((a) => a.tagId));

  // Get all tags for name lookup
  const allTags = await db.select().from(crmLeadTags);
  const tagMap = new Map(allTags.map((t) => [t.id, t.name]));

  const appliedTags: string[] = [];

  for (const rule of rules) {
    // Skip if tag already assigned
    if (existingTagIds.has(rule.tagId)) continue;

    // Check if lead matches the rule
    if (checkRuleCondition(lead, rule)) {
      // Assign the tag
      await db.insert(crmLeadTagAssignments).values({
        leadId,
        tagId: rule.tagId,
      });

      existingTagIds.add(rule.tagId);
      const tagName = tagMap.get(rule.tagId);
      if (tagName) appliedTags.push(tagName);
    }
  }

  return { applied: appliedTags.length, tags: appliedTags };
}

/**
 * Apply automation rules to all leads
 */
export async function applyAutomationRulesToAllLeads(): Promise<{
  leadsProcessed: number;
  tagsApplied: number;
}> {
  const db = await getDb();
  if (!db) return { leadsProcessed: 0, tagsApplied: 0 };

  // Get all leads
  const leads = await db.select({ id: ecosystemLeads.id }).from(ecosystemLeads);

  let totalTagsApplied = 0;

  for (const lead of leads) {
    const result = await applyAutomationRulesToLead(lead.id);
    totalTagsApplied += result.applied;
  }

  return {
    leadsProcessed: leads.length,
    tagsApplied: totalTagsApplied,
  };
}

/**
 * Get condition type display label
 */
export function getConditionTypeLabel(type: string, language: "en" | "fr"): string {
  const labels: Record<string, { en: string; fr: string }> = {
    [CONDITION_TYPES.BUDGET_ABOVE]: { en: "Budget above", fr: "Budget supérieur à" },
    [CONDITION_TYPES.BUDGET_BELOW]: { en: "Budget below", fr: "Budget inférieur à" },
    [CONDITION_TYPES.SCORE_ABOVE]: { en: "Score above", fr: "Score supérieur à" },
    [CONDITION_TYPES.SCORE_BELOW]: { en: "Score below", fr: "Score inférieur à" },
    [CONDITION_TYPES.SOURCE_EQUALS]: { en: "Source equals", fr: "Source égale à" },
    [CONDITION_TYPES.LEAD_TYPE_EQUALS]: { en: "Lead type equals", fr: "Type de lead égal à" },
    [CONDITION_TYPES.STATUS_EQUALS]: { en: "Status equals", fr: "Statut égal à" },
  };

  return labels[type]?.[language] || type;
}
