/**
 * Admin performance metrics and leaderboards
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";

/**
 * Calculate and update performance metrics for an admin
 */
export async function updateAdminPerformanceMetrics(adminId: number, periodStart: Date, periodEnd: Date) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications, adminPerformanceMetrics, users } = await import("../drizzle/schema");
  const { eq, and, gte, lte } = await import("drizzle-orm");

  // Get all applications reviewed by this admin in the period
  const reviewedApps = await db
    .select()
    .from(coachApplications)
    .where(
      and(
        eq(coachApplications.reviewedBy, adminId),
        gte(coachApplications.reviewedAt, periodStart),
        lte(coachApplications.reviewedAt, periodEnd)
      )
    );

  if (reviewedApps.length === 0) {
    return { success: true, message: "No applications reviewed in this period" };
  }

  const totalReviewed = reviewedApps.length;
  const totalApproved = reviewedApps.filter((app) => app.status === "approved").length;
  const totalRejected = reviewedApps.filter((app) => app.status === "rejected").length;

  // Calculate average review time
  const reviewTimes = reviewedApps
    .filter((app) => app.reviewedAt && app.createdAt)
    .map((app) => {
      const reviewTime = new Date(app.reviewedAt!).getTime() - new Date(app.createdAt).getTime();
      return reviewTime / (1000 * 60 * 60); // Convert to hours
    });

  const averageReviewTimeHours =
    reviewTimes.length > 0 ? Math.round((reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length) * 100) / 100 : 0;

  const approvalRate = totalReviewed > 0 ? Math.round((totalApproved / totalReviewed) * 100) : 0;
  const rejectionRate = totalReviewed > 0 ? Math.round((totalRejected / totalReviewed) * 100) : 0;

  // Check if metrics already exist for this period
  const existingMetrics = await db
    .select()
    .from(adminPerformanceMetrics)
    .where(
      and(
        eq(adminPerformanceMetrics.adminId, adminId),
        gte(adminPerformanceMetrics.periodStart, periodStart),
        lte(adminPerformanceMetrics.periodEnd, periodEnd)
      )
    );

  if (existingMetrics.length > 0) {
    // Update existing metrics
    await db
      .update(adminPerformanceMetrics)
      .set({
        totalReviewed,
        totalApproved,
        totalRejected,
        averageReviewTimeHours: averageReviewTimeHours.toString(),
        approvalRate,
        rejectionRate,
      })
      .where(eq(adminPerformanceMetrics.id, existingMetrics[0].id));
  } else {
    // Create new metrics
    await db.insert(adminPerformanceMetrics).values({
      adminId,
      totalReviewed,
      totalApproved,
      totalRejected,
      averageReviewTimeHours: averageReviewTimeHours.toString(),
      approvalRate,
      rejectionRate,
      periodStart,
      periodEnd,
    });
  }

  return { success: true };
}

/**
 * Get admin leaderboard
 */
export async function getAdminLeaderboard(metric: "speed" | "approvalRate" | "totalReviewed" = "totalReviewed") {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminPerformanceMetrics, users } = await import("../drizzle/schema");
  const { eq, and, gte, lte } = await import("drizzle-orm");

  // Get current month metrics
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const metrics = await db
    .select({
      adminId: adminPerformanceMetrics.adminId,
      totalReviewed: adminPerformanceMetrics.totalReviewed,
      totalApproved: adminPerformanceMetrics.totalApproved,
      totalRejected: adminPerformanceMetrics.totalRejected,
      averageReviewTimeHours: adminPerformanceMetrics.averageReviewTimeHours,
      approvalRate: adminPerformanceMetrics.approvalRate,
      rejectionRate: adminPerformanceMetrics.rejectionRate,
    })
    .from(adminPerformanceMetrics)
    .where(
      and(
        gte(adminPerformanceMetrics.periodStart as any, monthStart),
        lte(adminPerformanceMetrics.periodEnd as any, monthEnd)
      )
    );

  // Get admin names
  const adminIdSet = new Set(metrics.map((m) => m.adminId));
  const adminIds = Array.from(adminIdSet);
  const adminUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, "admin"));

  const adminMap = new Map(adminUsers.map((u) => [u.id, u.name]));

  // Sort by selected metric
  let sortedMetrics = metrics;
  if (metric === "speed") {
    sortedMetrics = metrics.sort((a, b) => {
      const aTime = parseFloat(a.averageReviewTimeHours || "0");
      const bTime = parseFloat(b.averageReviewTimeHours || "0");
      return aTime - bTime;
    });
  } else if (metric === "approvalRate") {
    sortedMetrics = metrics.sort((a, b) => (b.approvalRate || 0) - (a.approvalRate || 0));
  } else {
    sortedMetrics = metrics.sort((a, b) => (b.totalReviewed || 0) - (a.totalReviewed || 0));
  }

  return sortedMetrics.map((m, index) => ({
    rank: index + 1,
    adminId: m.adminId,
    adminName: adminMap.get(m.adminId) || "Unknown",
    totalReviewed: m.totalReviewed || 0,
    totalApproved: m.totalApproved || 0,
    totalRejected: m.totalRejected || 0,
    averageReviewTimeHours: parseFloat(m.averageReviewTimeHours || "0"),
    approvalRate: m.approvalRate || 0,
    rejectionRate: m.rejectionRate || 0,
  }));
}

/**
 * Get individual admin performance details
 */
export async function getAdminPerformanceDetails(adminId: number, monthsBack: number = 3) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminPerformanceMetrics } = await import("../drizzle/schema");
  const { eq, and, gte } = await import("drizzle-orm");

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  const metrics = await db
    .select()
    .from(adminPerformanceMetrics)
    .where(and(eq(adminPerformanceMetrics.adminId, adminId), gte(adminPerformanceMetrics.periodStart, startDate)))
    .orderBy(adminPerformanceMetrics.periodStart);

  // Calculate trends
  const totalReviewedTrend = metrics.map((m) => m.totalReviewed || 0);
  const approvalRateTrend = metrics.map((m) => m.approvalRate || 0);
  const speedTrend = metrics.map((m) => parseFloat(m.averageReviewTimeHours || "0"));

  // Calculate averages
  const avgTotalReviewed = totalReviewedTrend.length > 0 ? Math.round(totalReviewedTrend.reduce((a, b) => a + b, 0) / totalReviewedTrend.length) : 0;
  const avgApprovalRate = approvalRateTrend.length > 0 ? Math.round(approvalRateTrend.reduce((a, b) => a + b, 0) / approvalRateTrend.length) : 0;
  const avgSpeed = speedTrend.length > 0 ? Math.round((speedTrend.reduce((a, b) => a + b, 0) / speedTrend.length) * 100) / 100 : 0;

  return {
    adminId,
    monthsData: metrics.map((m) => ({
      month: new Date(m.periodStart).toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      totalReviewed: m.totalReviewed || 0,
      totalApproved: m.totalApproved || 0,
      totalRejected: m.totalRejected || 0,
      averageReviewTimeHours: parseFloat(m.averageReviewTimeHours || "0"),
      approvalRate: m.approvalRate || 0,
      rejectionRate: m.rejectionRate || 0,
    })),
    averages: {
      totalReviewed: avgTotalReviewed,
      approvalRate: avgApprovalRate,
      averageReviewTimeHours: avgSpeed,
    },
    trends: {
      totalReviewedTrend,
      approvalRateTrend,
      speedTrend,
    },
  };
}

/**
 * Get performance comparison between admins
 */
export async function getPerformanceComparison(adminIds: number[]) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminPerformanceMetrics, users } = await import("../drizzle/schema");
  const { inArray, eq, and, gte, lte } = await import("drizzle-orm");

  // Get current month metrics
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const metrics = await db
    .select()
    .from(adminPerformanceMetrics)
    .where(
      and(
        inArray(adminPerformanceMetrics.adminId, adminIds),
        gte(adminPerformanceMetrics.periodStart, monthStart),
        lte(adminPerformanceMetrics.periodEnd, monthEnd)
      )
    );

  // Get admin names
  const adminUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(inArray(users.id, adminIds));

  const adminMap = new Map(adminUsers.map((u) => [u.id, u.name]));

  return metrics.map((m) => ({
    adminId: m.adminId,
    adminName: adminMap.get(m.adminId) || "Unknown",
    totalReviewed: m.totalReviewed || 0,
    totalApproved: m.totalApproved || 0,
    totalRejected: m.totalRejected || 0,
    averageReviewTimeHours: parseFloat(m.averageReviewTimeHours || "0"),
    approvalRate: m.approvalRate || 0,
    rejectionRate: m.rejectionRate || 0,
  }));
}


