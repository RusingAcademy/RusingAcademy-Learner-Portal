import { getDb } from "./db";
import { ecosystemLeads, ecosystemLeadActivities, crmLeadHistory, crmLeadTagAssignments } from "../drizzle/schema";
import { eq, sql, and, desc } from "drizzle-orm";

interface DuplicateGroup {
  email: string;
  leads: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
    leadScore: number | null;
    budget: string | number | null;
    createdAt: Date;
  }[];
}

interface DeduplicationResult {
  groupsFound: number;
  leadsMerged: number;
  errors: string[];
}

interface DeduplicationConfig {
  matchBy: "email" | "name_and_company" | "both";
  autoMerge: boolean;
  keepStrategy: "highest_score" | "most_recent" | "oldest" | "highest_value";
  dryRun: boolean;
}

/**
 * Find duplicate leads based on matching criteria
 */
export async function findDuplicateLeads(
  config: Pick<DeduplicationConfig, "matchBy"> = { matchBy: "email" }
): Promise<DuplicateGroup[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const duplicates: DuplicateGroup[] = [];

  if (config.matchBy === "email" || config.matchBy === "both") {
    // Find duplicates by email
    const emailDuplicates = await db
      .select({
        email: ecosystemLeads.email,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(ecosystemLeads)
      .groupBy(ecosystemLeads.email)
      .having(sql`COUNT(*) > 1`);

    for (const dup of emailDuplicates) {
      const leads = await db
        .select({
          id: ecosystemLeads.id,
          firstName: ecosystemLeads.firstName,
          lastName: ecosystemLeads.lastName,
          email: ecosystemLeads.email,
          company: ecosystemLeads.company,
          leadScore: ecosystemLeads.leadScore,
          budget: ecosystemLeads.budget,
          createdAt: ecosystemLeads.createdAt,
        })
        .from(ecosystemLeads)
        .where(eq(ecosystemLeads.email, dup.email))
        .orderBy(desc(ecosystemLeads.leadScore));

      duplicates.push({
        email: dup.email,
        leads,
      });
    }
  }

  return duplicates;
}

/**
 * Select the primary lead based on the keep strategy
 */
export function selectPrimaryLead(
  leads: DuplicateGroup["leads"],
  strategy: DeduplicationConfig["keepStrategy"]
): DuplicateGroup["leads"][0] {
  switch (strategy) {
    case "highest_score":
      return leads.reduce((best, lead) =>
        (lead.leadScore || 0) > (best.leadScore || 0) ? lead : best
      );
    case "most_recent":
      return leads.reduce((best, lead) =>
        new Date(lead.createdAt) > new Date(best.createdAt) ? lead : best
      );
    case "oldest":
      return leads.reduce((best, lead) =>
        new Date(lead.createdAt) < new Date(best.createdAt) ? lead : best
      );
    case "highest_value":
      return leads.reduce((best, lead) =>
        (Number(lead.budget) || 0) > (Number(best.budget) || 0) ? lead : best
      );
    default:
      return leads[0];
  }
}

/**
 * Merge duplicate leads into the primary lead
 */
export async function mergeDuplicateGroup(
  group: DuplicateGroup,
  primaryLeadId: number,
  userId?: number
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const secondaryIds = group.leads
      .filter((l) => l.id !== primaryLeadId)
      .map((l) => l.id);

    if (secondaryIds.length === 0) {
      return { success: true }; // Nothing to merge
    }

    // Merge data from secondary leads (fill in missing fields)
    const primaryLead = group.leads.find((l) => l.id === primaryLeadId);
    if (!primaryLead) {
      return { success: false, error: "Primary lead not found" };
    }

    const updateData: Record<string, any> = {};
    
    // Use highest score
    const highestScore = Math.max(
      ...group.leads.map((l) => Number(l.leadScore) || 0)
    );
    if (highestScore > (Number(primaryLead.leadScore) || 0)) {
      updateData.leadScore = highestScore;
    }

    // Use highest budget
    const highestBudget = Math.max(
      ...group.leads.map((l) => Number(l.budget) || 0)
    );
    if (highestBudget > (Number(primaryLead.budget) || 0)) {
      updateData.budget = highestBudget;
    }

    // Fill in missing company
    if (!primaryLead.company) {
      const leadWithCompany = group.leads.find((l) => l.company);
      if (leadWithCompany) {
        updateData.company = leadWithCompany.company;
      }
    }

    // Update primary lead if needed
    if (Object.keys(updateData).length > 0) {
      await db
        .update(ecosystemLeads)
        .set(updateData)
        .where(eq(ecosystemLeads.id, primaryLeadId));
    }

    // Transfer activities, history, and tags from secondary leads
    for (const secondaryId of secondaryIds) {
      await db
        .update(ecosystemLeadActivities)
        .set({ leadId: primaryLeadId })
        .where(eq(ecosystemLeadActivities.leadId, secondaryId));

      await db
        .update(crmLeadHistory)
        .set({ leadId: primaryLeadId })
        .where(eq(crmLeadHistory.leadId, secondaryId));

      await db
        .update(crmLeadTagAssignments)
        .set({ leadId: primaryLeadId })
        .where(eq(crmLeadTagAssignments.leadId, secondaryId));
    }

    // Log the merge
    await db.insert(crmLeadHistory).values({
      leadId: primaryLeadId,
      userId: userId || null,
      action: "merged",
      metadata: {
        mergedLeadIds: secondaryIds,
        autoMerge: true,
        email: group.email,
      },
    });

    // Delete secondary leads
    for (const secondaryId of secondaryIds) {
      await db.delete(ecosystemLeads).where(eq(ecosystemLeads.id, secondaryId));
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run automatic deduplication process
 */
export async function runAutoDeduplication(
  config: DeduplicationConfig = {
    matchBy: "email",
    autoMerge: true,
    keepStrategy: "highest_score",
    dryRun: false,
  }
): Promise<DeduplicationResult> {
  const result: DeduplicationResult = {
    groupsFound: 0,
    leadsMerged: 0,
    errors: [],
  };

  try {
    const duplicates = await findDuplicateLeads({ matchBy: config.matchBy });
    result.groupsFound = duplicates.length;

    if (config.dryRun || !config.autoMerge) {
      // Just return the count without merging
      result.leadsMerged = duplicates.reduce(
        (sum, group) => sum + group.leads.length - 1,
        0
      );
      return result;
    }

    // Process each duplicate group
    for (const group of duplicates) {
      const primaryLead = selectPrimaryLead(group.leads, config.keepStrategy);
      const mergeResult = await mergeDuplicateGroup(group, primaryLead.id);

      if (mergeResult.success) {
        result.leadsMerged += group.leads.length - 1;
      } else if (mergeResult.error) {
        result.errors.push(`Group ${group.email}: ${mergeResult.error}`);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error"
    );
    return result;
  }
}

/**
 * Get deduplication statistics
 */
export async function getDeduplicationStats(): Promise<{
  totalLeads: number;
  duplicateGroups: number;
  potentialDuplicates: number;
  lastRunAt: Date | null;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [totalResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(ecosystemLeads);

  const duplicates = await findDuplicateLeads({ matchBy: "email" });

  return {
    totalLeads: totalResult?.count || 0,
    duplicateGroups: duplicates.length,
    potentialDuplicates: duplicates.reduce(
      (sum, group) => sum + group.leads.length - 1,
      0
    ),
    lastRunAt: null, // Would be stored in a settings table
  };
}
