/**
 * Analytics endpoints for coach application dashboard
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";

/**
 * Get approval rate statistics
 */
export async function getApprovalRateStats(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications } = await import("../drizzle/schema");
  const { eq, sql, and, gte, lte } = await import("drizzle-orm");

  let where: any[] = [];
  if (startDate) {
    where.push(gte(coachApplications.createdAt, startDate));
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    where.push(lte(coachApplications.createdAt, endOfDay));
  }

  const allApps = await db
    .select()
    .from(coachApplications)
    .where(where.length > 0 ? and(...where) : undefined);

  const approved = allApps.filter((app) => app.status === "approved").length;
  const rejected = allApps.filter((app) => app.status === "rejected").length;
  const underReview = allApps.filter((app) => app.status === "under_review").length;
  const submitted = allApps.filter((app) => app.status === "submitted").length;

  const total = allApps.length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return {
    total,
    approved,
    rejected,
    underReview,
    submitted,
    approvalRate,
  };
}

/**
 * Get average review time in hours
 */
export async function getAverageReviewTime() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications } = await import("../drizzle/schema");

  const { isNotNull } = await import("drizzle-orm");
  const reviewedApps = await db
    .select()
    .from(coachApplications)
    .where(isNotNull(coachApplications.reviewedAt));

  if (reviewedApps.length === 0) {
    return { averageHours: 0, totalReviewed: 0 };
  }

  const totalHours = reviewedApps.reduce((sum, app) => {
    if (!app.reviewedAt) return sum;
    const createdTime = new Date(app.createdAt).getTime();
    const reviewedTime = new Date(app.reviewedAt).getTime();
    const hours = (reviewedTime - createdTime) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  const averageHours = Math.round(totalHours / reviewedApps.length);

  return {
    averageHours,
    totalReviewed: reviewedApps.length,
  };
}

/**
 * Get language distribution
 */
export async function getLanguageDistribution() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications } = await import("../drizzle/schema");

  const allApps = await db.select().from(coachApplications);

  const distribution: Record<string, number> = {};

  allApps.forEach((app) => {
    const lang = app.teachingLanguage || "Unknown";
    distribution[lang] = (distribution[lang] || 0) + 1;
  });

  return Object.entries(distribution)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / allApps.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get monthly trends
 */
export async function getMonthlyTrends(monthsBack: number = 12) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications } = await import("../drizzle/schema");

  const allApps = await db.select().from(coachApplications);

  const trends: Record<string, { submitted: number; approved: number; rejected: number }> = {};

  // Initialize last N months
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
    trends[monthKey] = { submitted: 0, approved: 0, rejected: 0 };
  }

  // Count applications by month and status
  allApps.forEach((app) => {
    const monthKey = new Date(app.createdAt).toISOString().slice(0, 7);
    if (trends[monthKey]) {
      if (app.status === "approved") {
        trends[monthKey].approved++;
      } else if (app.status === "rejected") {
        trends[monthKey].rejected++;
      } else {
        trends[monthKey].submitted++;
      }
    }
  });

  return Object.entries(trends).map(([month, data]) => ({
    month,
    ...data,
    total: data.submitted + data.approved + data.rejected,
  }));
}

/**
 * Get applications by experience level
 */
export async function getExperienceDistribution() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications } = await import("../drizzle/schema");

  const allApps = await db.select().from(coachApplications);

  const distribution = {
    beginner: 0, // 0-2 years
    intermediate: 0, // 3-5 years
    experienced: 0, // 6-10 years
    expert: 0, // 10+ years
    unknown: 0,
  };

  allApps.forEach((app) => {
    const years = app.yearsTeaching || 0;
    if (years === 0 || years === null) {
      distribution.unknown++;
    } else if (years <= 2) {
      distribution.beginner++;
    } else if (years <= 5) {
      distribution.intermediate++;
    } else if (years <= 10) {
      distribution.experienced++;
    } else {
      distribution.expert++;
    }
  });

  return {
    beginner: { count: distribution.beginner, label: "0-2 years" },
    intermediate: { count: distribution.intermediate, label: "3-5 years" },
    experienced: { count: distribution.experienced, label: "6-10 years" },
    expert: { count: distribution.expert, label: "10+ years" },
    unknown: { count: distribution.unknown, label: "Not specified" },
  };
}

/**
 * Get comprehensive analytics dashboard data
 */
export async function getAnalyticsDashboardData(startDate?: Date, endDate?: Date) {
  const [approvalStats, reviewTime, languages, trends, experience] = await Promise.all([
    getApprovalRateStats(startDate, endDate),
    getAverageReviewTime(),
    getLanguageDistribution(),
    getMonthlyTrends(12),
    getExperienceDistribution(),
  ]);

  return {
    approvalStats,
    reviewTime,
    languages,
    trends,
    experience,
    generatedAt: new Date(),
  };
}
