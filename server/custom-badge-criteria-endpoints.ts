/**
 * Customizable badge criteria system
 */

import { TRPCError } from "@trpc/server";
import { getDb } from "./db";

/**
 * Create custom badge criteria
 */
export async function createCustomBadgeCriteria(
  badgeId: number,
  criteriaType: string,
  minValue?: number,
  maxValue?: number,
  targetValue?: number,
  customFormula?: string,
  createdBy?: number
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { customBadgeCriteria } = await import("../drizzle/schema");

  const [criteria] = await db
    .insert(customBadgeCriteria)
    .values({
      badgeId,
      criteriaType: criteriaType as any,
      minValue: minValue ? minValue.toString() : null,
      maxValue: maxValue ? maxValue.toString() : null,
      targetValue: targetValue ? targetValue.toString() : null,
      customFormula,
      createdBy,
    })
    .$returningId();

  return criteria;
}

/**
 * Get badge criteria
 */
export async function getBadgeCriteria(badgeId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { customBadgeCriteria } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const criteria = await db
    .select()
    .from(customBadgeCriteria)
    .where(eq(customBadgeCriteria.badgeId, badgeId));

  return criteria;
}

/**
 * Update badge criteria
 */
export async function updateBadgeCriteria(
  criteriaId: number,
  updates: {
    minValue?: number;
    maxValue?: number;
    targetValue?: number;
    customFormula?: string;
    isActive?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { customBadgeCriteria } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const updateData: any = {};
  if (updates.minValue !== undefined) updateData.minValue = updates.minValue.toString();
  if (updates.maxValue !== undefined) updateData.maxValue = updates.maxValue.toString();
  if (updates.targetValue !== undefined) updateData.targetValue = updates.targetValue.toString();
  if (updates.customFormula !== undefined) updateData.customFormula = updates.customFormula;
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

  await db.update(customBadgeCriteria).set(updateData).where(eq(customBadgeCriteria.id, criteriaId));

  return { success: true };
}

/**
 * Create badge criteria template
 */
export async function createBadgeCriteriaTemplate(
  name: string,
  templateType: "performance_focused" | "consistency_focused" | "quality_focused" | "balanced" | "custom",
  criteriaConfig: Record<string, any>,
  description?: string,
  isPublic: boolean = false,
  createdBy?: number
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { badgeCriteriaTemplates } = await import("../drizzle/schema");

  const [template] = await db
    .insert(badgeCriteriaTemplates)
    .values({
      name,
      templateType,
      criteriaConfig: JSON.stringify(criteriaConfig),
      description,
      isPublic,
      createdBy,
    })
    .$returningId();

  return template;
}

/**
 * Get badge criteria templates
 */
export async function getBadgeCriteriaTemplates(includePublic: boolean = true, createdBy?: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { badgeCriteriaTemplates } = await import("../drizzle/schema");
  const { eq, or, and } = await import("drizzle-orm");

  let query;
  if (includePublic && createdBy) {
    query = db
      .select()
      .from(badgeCriteriaTemplates)
      .where(
        or(
          eq(badgeCriteriaTemplates.createdBy, createdBy),
          eq(badgeCriteriaTemplates.isPublic, true)
        )
      );
  } else if (createdBy) {
    query = db
      .select()
      .from(badgeCriteriaTemplates)
      .where(eq(badgeCriteriaTemplates.createdBy, createdBy));
  } else {
    query = db
      .select()
      .from(badgeCriteriaTemplates)
      .where(eq(badgeCriteriaTemplates.isPublic, true));
  }

  return await query;
}

/**
 * Apply template to badge
 */
export async function applyTemplateToBadge(badgeId: number, templateId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { badgeCriteriaTemplates, customBadgeCriteria } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Get template
  const [template] = await db
    .select()
    .from(badgeCriteriaTemplates)
    .where(eq(badgeCriteriaTemplates.id, templateId));

  if (!template) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
  }

  // Parse criteria config
  const config = typeof template.criteriaConfig === "string" 
    ? JSON.parse(template.criteriaConfig) 
    : template.criteriaConfig;

  // Delete existing criteria for this badge
  // Use raw delete since drizzle-orm delete is not directly available
  // Instead, we'll mark existing criteria as inactive
  await db
    .update(customBadgeCriteria)
    .set({ isActive: false })
    .where(eq(customBadgeCriteria.badgeId, badgeId));

  // Create new criteria from template
  const createdCriteria = [];
  for (const criteriaItem of config.criteria || []) {
    const [criteria] = await db
      .insert(customBadgeCriteria)
      .values({
        badgeId,
        criteriaType: criteriaItem.type,
        minValue: criteriaItem.minValue ? criteriaItem.minValue.toString() : null,
        maxValue: criteriaItem.maxValue ? criteriaItem.maxValue.toString() : null,
        targetValue: criteriaItem.targetValue ? criteriaItem.targetValue.toString() : null,
        customFormula: criteriaItem.customFormula,
      })
      .$returningId();

    createdCriteria.push(criteria);
  }

  return { success: true, criteriaCount: createdCriteria.length };
}

/**
 * Get default templates
 */
export async function getDefaultTemplates() {
  const defaultTemplates = [
    {
      name: "Performance Focused",
      templateType: "performance_focused",
      description: "Emphasizes speed and volume over approval rate",
      criteria: [
        { type: "average_review_time", maxValue: 2, weight: 0.5 },
        { type: "total_reviewed", targetValue: 100, weight: 0.5 },
      ],
    },
    {
      name: "Consistency Focused",
      templateType: "consistency_focused",
      description: "Rewards steady, reliable performance over time",
      criteria: [
        { type: "consistency_score", targetValue: 80, weight: 0.6 },
        { type: "approval_rate", minValue: 40, maxValue: 60, weight: 0.4 },
      ],
    },
    {
      name: "Quality Focused",
      templateType: "quality_focused",
      description: "Prioritizes approval rate and quality metrics",
      criteria: [
        { type: "approval_rate", minValue: 70, weight: 0.6 },
        { type: "quality_score", targetValue: 90, weight: 0.4 },
      ],
    },
    {
      name: "Balanced",
      templateType: "balanced",
      description: "Balanced approach across all performance dimensions",
      criteria: [
        { type: "average_review_time", maxValue: 3, weight: 0.33 },
        { type: "approval_rate", minValue: 40, maxValue: 60, weight: 0.33 },
        { type: "total_reviewed", targetValue: 50, weight: 0.34 },
      ],
    },
  ];

  return defaultTemplates;
}

/**
 * Calculate achievement eligibility based on custom criteria
 */
export async function calculateAchievementEligibility(
  adminId: number,
  badgeId: number,
  adminMetrics: {
    averageReviewTimeHours: number;
    approvalRate: number;
    totalReviewed: number;
    consistencyScore?: number;
    qualityScore?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { customBadgeCriteria } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  // Get criteria for this badge
  const criteria = await db
    .select()
    .from(customBadgeCriteria)
    .where(and(eq(customBadgeCriteria.badgeId, badgeId), eq(customBadgeCriteria.isActive, true)));

  if (criteria.length === 0) {
    return { eligible: false, reason: "No active criteria found" };
  }

  // Check each criterion
  for (const criterion of criteria) {
    let metricValue = 0;

    switch (criterion.criteriaType) {
      case "average_review_time":
        metricValue = adminMetrics.averageReviewTimeHours;
        break;
      case "approval_rate":
        metricValue = adminMetrics.approvalRate;
        break;
      case "total_reviewed":
        metricValue = adminMetrics.totalReviewed;
        break;
      case "consistency_score":
        metricValue = adminMetrics.consistencyScore || 0;
        break;
      case "quality_score":
        metricValue = adminMetrics.qualityScore || 0;
        break;
      default:
        continue;
    }

    // Check min/max bounds
    if (criterion.minValue && metricValue < parseFloat(criterion.minValue)) {
      return { eligible: false, reason: `${criterion.criteriaType} below minimum` };
    }

    if (criterion.maxValue && metricValue > parseFloat(criterion.maxValue)) {
      return { eligible: false, reason: `${criterion.criteriaType} above maximum` };
    }

    // Check target value
    if (criterion.targetValue && metricValue < parseFloat(criterion.targetValue)) {
      return { eligible: false, reason: `${criterion.criteriaType} below target` };
    }
  }

  return { eligible: true, reason: "All criteria met" };
}

/**
 * Update badge criteria template
 */
export async function updateBadgeCriteriaTemplate(
  templateId: number,
  updates: {
    name?: string;
    description?: string;
    criteriaConfig?: Record<string, any>;
    isPublic?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { badgeCriteriaTemplates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.description) updateData.description = updates.description;
  if (updates.criteriaConfig) updateData.criteriaConfig = JSON.stringify(updates.criteriaConfig);
  if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

  await db.update(badgeCriteriaTemplates).set(updateData).where(eq(badgeCriteriaTemplates.id, templateId));

  return { success: true };
}
