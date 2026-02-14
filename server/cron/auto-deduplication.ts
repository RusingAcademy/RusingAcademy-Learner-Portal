import { runAutoDeduplication, getDeduplicationStats } from "../auto-deduplication";

interface CronResult {
  success: boolean;
  message: string;
  stats?: {
    groupsFound: number;
    leadsMerged: number;
    errors: string[];
  };
}

/**
 * Cron job handler for automatic lead deduplication
 * Runs weekly to find and merge duplicate leads
 */
export async function handleAutoDeduplicationCron(): Promise<CronResult> {
  try {
    console.log("[Auto-Deduplication] Starting automatic deduplication...");

    // Get stats before running
    const statsBefore = await getDeduplicationStats();
    console.log(`[Auto-Deduplication] Found ${statsBefore.duplicateGroups} duplicate groups`);

    if (statsBefore.duplicateGroups === 0) {
      return {
        success: true,
        message: "No duplicates found",
        stats: {
          groupsFound: 0,
          leadsMerged: 0,
          errors: [],
        },
      };
    }

    // Run deduplication with default config
    const result = await runAutoDeduplication({
      matchBy: "email",
      autoMerge: true,
      keepStrategy: "highest_score",
      dryRun: false,
    });

    console.log(`[Auto-Deduplication] Completed: ${result.leadsMerged} leads merged`);

    if (result.errors.length > 0) {
      console.warn(`[Auto-Deduplication] Errors: ${result.errors.join(", ")}`);
    }

    return {
      success: result.errors.length === 0,
      message: `Merged ${result.leadsMerged} duplicate leads from ${result.groupsFound} groups`,
      stats: result,
    };
  } catch (error) {
    console.error("[Auto-Deduplication] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
