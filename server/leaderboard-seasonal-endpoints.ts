/**
 * Leaderboard seasonal reset and archive system
 */

import { TRPCError } from "@trpc/server";
import { getDb } from "./db";

/**
 * Archive current leaderboard and create seasonal snapshot
 */
export async function archiveLeaderboard(
  season: string,
  seasonType: "monthly" | "quarterly" | "yearly",
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminPerformanceMetrics, leaderboardArchives, users } = await import("../drizzle/schema");
  const { desc, gte, lte, eq } = await import("drizzle-orm");

  // Get top 10 admins for this period
  const topAdmins = await db
    .select({
      adminId: adminPerformanceMetrics.adminId,
      adminName: users.name,
      totalReviewed: adminPerformanceMetrics.totalReviewed,
      approvalRate: adminPerformanceMetrics.approvalRate,
      averageReviewTimeHours: adminPerformanceMetrics.averageReviewTimeHours,
    })
    .from(adminPerformanceMetrics)
    .innerJoin(users, eq(adminPerformanceMetrics.adminId, users.id))
    .where(
      and(
        gte(adminPerformanceMetrics.periodStart as any, startDate),
        lte(adminPerformanceMetrics.periodEnd as any, endDate)
      )
    )
    .orderBy(desc(adminPerformanceMetrics.totalReviewed))
    .limit(10);

  // Add ranks
  const rankedAdmins = topAdmins.map((admin, index) => ({
    ...admin,
    rank: index + 1,
  } as any));

  // Create archive
  const [archive] = await db
    .insert(leaderboardArchives)
    .values({
      season,
      seasonType,
      startDate,
      endDate,
      leaderboardSnapshot: JSON.stringify(rankedAdmins),
      isActive: true,
    })
    .$returningId();

  return { success: true, archiveId: archive, adminCount: rankedAdmins.length };
}

/**
 * Get leaderboard history for a specific admin
 */
export async function getAdminLeaderboardHistory(adminId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { leaderboardArchives } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");

  const archives = await db
    .select()
    .from(leaderboardArchives)
    .orderBy(desc(leaderboardArchives.createdAt))
    .limit(12);

  // Extract admin's position from each archive
  const history = archives
    .map((archive) => {
      const snapshot = Array.isArray(archive.leaderboardSnapshot)
        ? archive.leaderboardSnapshot
        : JSON.parse(archive.leaderboardSnapshot as any);

      const adminEntry = snapshot.find((entry: any) => entry.adminId === adminId);
      return {
        season: archive.season,
        seasonType: archive.seasonType,
        rank: adminEntry?.rank || null,
        totalReviewed: adminEntry?.totalReviewed || 0,
        approvalRate: adminEntry?.approvalRate || 0,
        archivedAt: archive.createdAt,
      };
    })
    .filter((entry) => entry.rank !== null);

  return history;
}

/**
 * Get seasonal leaderboard comparison
 */
export async function getSeasonalComparison(adminId: number, seasonCount: number = 3) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { leaderboardArchives } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");

  const recentArchives = await db
    .select()
    .from(leaderboardArchives)
    .orderBy(desc(leaderboardArchives.createdAt))
    .limit(seasonCount);

  const comparison = {
    adminId,
    seasons: [] as any[],
    trend: "stable" as "improving" | "declining" | "stable",
    averageRank: 0,
  };

  const ranks: number[] = [];

  for (const archive of recentArchives) {
    const snapshot = Array.isArray(archive.leaderboardSnapshot)
      ? archive.leaderboardSnapshot
      : JSON.parse(archive.leaderboardSnapshot as any);

    const adminEntry = snapshot.find((entry: any) => entry.adminId === adminId);

    if (adminEntry) {
      comparison.seasons.push({
        season: archive.season,
        rank: adminEntry.rank,
        totalReviewed: adminEntry.totalReviewed,
        approvalRate: adminEntry.approvalRate,
      });
      ranks.push(adminEntry.rank);
    }
  }

  // Calculate trend
  if (ranks.length >= 2) {
    const firstRank = ranks[ranks.length - 1];
    const lastRank = ranks[0];
    if (lastRank < firstRank) {
      comparison.trend = "improving";
    } else if (lastRank > firstRank) {
      comparison.trend = "declining";
    }
  }

  comparison.averageRank = Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length);

  return comparison;
}

/**
 * Get all leaderboard archives
 */
export async function getAllLeaderboardArchives(limit: number = 12) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { leaderboardArchives } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");

  const archives = await db
    .select()
    .from(leaderboardArchives)
    .orderBy(desc(leaderboardArchives.createdAt))
    .limit(limit);

  return archives.map((archive) => ({
    id: archive.id,
    season: archive.season,
    seasonType: archive.seasonType,
    startDate: archive.startDate,
    endDate: archive.endDate,
    leaderboardSnapshot: Array.isArray(archive.leaderboardSnapshot)
      ? archive.leaderboardSnapshot
      : JSON.parse(archive.leaderboardSnapshot as any),
    createdAt: archive.createdAt,
  }));
}

/**
 * Reset leaderboard for new season
 */
export async function resetLeaderboardForNewSeason(newSeason: string, seasonType: "monthly" | "quarterly" | "yearly") {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { leaderboardArchives } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Deactivate previous active season
  const { eq: eqOp } = await import("drizzle-orm");
  const previousActive = await db
    .select()
    .from(leaderboardArchives)
    .where(eqOp(leaderboardArchives.isActive, true))
    .limit(1);
  const [previousActiveRecord] = previousActive;

  if (previousActiveRecord) {
    await db
      .update(leaderboardArchives)
      .set({ isActive: false })
      .where(eq(leaderboardArchives.id, previousActiveRecord.id));
  }

  // Create new season entry
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const seasonEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [newArchive] = await db
    .insert(leaderboardArchives)
    .values({
      season: newSeason,
      seasonType,
      startDate: seasonStart,
      endDate: seasonEnd,
      leaderboardSnapshot: JSON.stringify([]),
      isActive: true,
    })
    .$returningId();

  return { success: true, newSeasonId: newArchive };
}

/**
 * Get current active season
 */
export async function getActiveSeason() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { leaderboardArchives } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const activeSeasons = await db
    .select()
    .from(leaderboardArchives)
    .where(eq(leaderboardArchives.isActive, true))
    .limit(1);
  const [activeSeason] = activeSeasons;

  if (!activeSeason) {
    throw new TRPCError({ code: "NOT_FOUND", message: "No active season found" });
  }

  return {
    id: activeSeason.id,
    season: activeSeason.season,
    seasonType: activeSeason.seasonType,
    startDate: activeSeason.startDate,
    endDate: activeSeason.endDate,
    leaderboardSnapshot: Array.isArray(activeSeason.leaderboardSnapshot)
      ? activeSeason.leaderboardSnapshot
      : JSON.parse(activeSeason.leaderboardSnapshot as any),
  };
}

// Helper function
function and(...conditions: any[]) {
  return conditions.filter(Boolean)[0];
}
