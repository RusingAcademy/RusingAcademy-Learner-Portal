/**
 * Team performance analytics and benchmarking
 */

import { TRPCError } from "@trpc/server";
import { getDb } from "./db";

/**
 * Create or update admin team
 */
export async function createAdminTeam(name: string, description?: string, department?: string, teamLeadId?: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminTeams } = await import("../drizzle/schema");

  const [team] = await db
    .insert(adminTeams)
    .values({
      name,
      description,
      department,
      teamLeadId,
    })
    .$returningId();

  return team;
}

/**
 * Add admin to team
 */
export async function addAdminToTeam(teamId: number, adminId: number, role: "member" | "lead" | "coordinator" = "member") {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminTeamMembers } = await import("../drizzle/schema");

  const [membership] = await db
    .insert(adminTeamMembers)
    .values({
      teamId,
      adminId,
      role,
    })
    .$returningId();

  return membership;
}

/**
 * Get team performance metrics
 */
export async function getTeamPerformanceMetrics(teamId: number, periodStart: Date, periodEnd: Date) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminTeamMembers, adminPerformanceMetrics, adminTeams, users } = await import("../drizzle/schema");
  const { eq, and, gte, lte, inArray } = await import("drizzle-orm");

  // Get team members
  const members = await db
    .select({
      adminId: adminTeamMembers.adminId,
      adminName: users.name,
      role: adminTeamMembers.role,
    })
    .from(adminTeamMembers)
    .innerJoin(users, eq(adminTeamMembers.adminId, users.id))
    .where(eq(adminTeamMembers.teamId, teamId));

  // Get aggregated metrics for team
  const adminIds = members.map((m) => m.adminId);

  if (adminIds.length === 0) {
    return {
      teamId,
      memberCount: 0,
      totalApplicationsReviewed: 0,
      totalApproved: 0,
      totalRejected: 0,
      teamApprovalRate: 0,
      averageReviewTimeHours: 0,
      members: [],
    };
  }

  const metrics = await db
    .select({
      adminId: adminPerformanceMetrics.adminId,
      totalReviewed: adminPerformanceMetrics.totalReviewed,
      totalApproved: adminPerformanceMetrics.totalApproved,
      totalRejected: adminPerformanceMetrics.totalRejected,
      approvalRate: adminPerformanceMetrics.approvalRate,
      averageReviewTimeHours: adminPerformanceMetrics.averageReviewTimeHours,
    })
    .from(adminPerformanceMetrics)
    .where(
      and(
        inArray(adminPerformanceMetrics.adminId, adminIds),
        gte(adminPerformanceMetrics.periodStart as any, periodStart),
        lte(adminPerformanceMetrics.periodEnd as any, periodEnd)
      )
    );

  // Aggregate metrics
  const totalApplicationsReviewed = metrics.reduce((sum, m) => sum + (m.totalReviewed || 0), 0);
  const totalApproved = metrics.reduce((sum, m) => sum + (m.totalApproved || 0), 0);
  const totalRejected = metrics.reduce((sum, m) => sum + (m.totalRejected || 0), 0);
  const avgApprovalRate = Math.round(metrics.reduce((sum, m) => sum + (m.approvalRate || 0), 0) / metrics.length);
  const avgReviewTime = parseFloat(
    (metrics.reduce((sum, m) => sum + parseFloat(m.averageReviewTimeHours || "0"), 0) / metrics.length).toFixed(2)
  );

  return {
    teamId,
    memberCount: members.length,
    totalApplicationsReviewed,
    totalApproved,
    totalRejected,
    teamApprovalRate: avgApprovalRate,
    averageReviewTimeHours: avgReviewTime,
    members: members.map((m) => ({
      ...m,
      memberMetrics: metrics.find((metric) => metric.adminId === m.adminId),
    })),
  };
}

/**
 * Get team benchmarking data
 */
export async function getTeamBenchmarking(periodStart: Date, periodEnd: Date) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminTeams, adminTeamMembers, adminPerformanceMetrics, users } = await import("../drizzle/schema");
  const { eq, and, gte, lte, inArray } = await import("drizzle-orm");

  // Get all teams
  const teams = await db.select().from(adminTeams);

  const benchmarkData = [];

  for (const team of teams) {
    // Get team members
    const members = await db
      .select({ adminId: adminTeamMembers.adminId })
      .from(adminTeamMembers)
      .where(eq(adminTeamMembers.teamId, team.id));

    const adminIds = members.map((m) => m.adminId);

    if (adminIds.length === 0) continue;

    // Get metrics
    const metrics = await db
      .select()
      .from(adminPerformanceMetrics)
      .where(
        and(
          inArray(adminPerformanceMetrics.adminId, adminIds),
          gte(adminPerformanceMetrics.periodStart as any, periodStart),
          lte(adminPerformanceMetrics.periodEnd as any, periodEnd)
        )
      );

    const totalReviewed = metrics.reduce((sum, m) => sum + (m.totalReviewed || 0), 0);
    const totalApproved = metrics.reduce((sum, m) => sum + (m.totalApproved || 0), 0);
    const avgApprovalRate = Math.round(metrics.reduce((sum, m) => sum + (m.approvalRate || 0), 0) / metrics.length);
    const avgReviewTime = parseFloat(
      (metrics.reduce((sum, m) => sum + parseFloat(m.averageReviewTimeHours || "0"), 0) / metrics.length).toFixed(2)
    );

    benchmarkData.push({
      teamId: team.id,
      teamName: team.name,
      department: team.department,
      memberCount: adminIds.length,
      totalApplicationsReviewed: totalReviewed,
      totalApproved,
      approvalRate: avgApprovalRate,
      averageReviewTimeHours: avgReviewTime,
      performanceScore: calculatePerformanceScore(avgApprovalRate, avgReviewTime, totalReviewed),
    });
  }

  // Sort by performance score
  benchmarkData.sort((a, b) => b.performanceScore - a.performanceScore);

  return benchmarkData;
}

/**
 * Calculate performance score (0-100)
 */
function calculatePerformanceScore(approvalRate: number, reviewTimeHours: number, volumeReviewed: number): number {
  // Weighted score: 40% approval rate, 30% speed, 30% volume
  const approvalScore = Math.min(approvalRate, 100);
  const speedScore = Math.max(0, 100 - reviewTimeHours * 5); // Deduct 5 points per hour
  const volumeScore = Math.min((volumeReviewed / 100) * 100, 100); // Normalize to 100 at 100 reviews

  return Math.round(approvalScore * 0.4 + speedScore * 0.3 + volumeScore * 0.3);
}

/**
 * Get team comparison
 */
export async function getTeamComparison(teamIds: number[], periodStart: Date, periodEnd: Date) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminTeams } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const comparisonData = [];

  for (const tid of teamIds) {
    const [team] = await db.select().from(adminTeams).where(eq(adminTeams.id, tid));

    if (!team) continue;

    const metrics = await getTeamPerformanceMetrics(tid, periodStart, periodEnd);

    comparisonData.push({
      teamId: tid,
      teamName: team.name,
      memberCount: metrics.memberCount,
      totalApplicationsReviewed: metrics.totalApplicationsReviewed,
      teamApprovalRate: metrics.teamApprovalRate,
      averageReviewTimeHours: metrics.averageReviewTimeHours,
    });
  }

  return comparisonData;
}

/**
 * Get department-level metrics
 */
export async function getDepartmentMetrics(department: string, periodStart: Date, periodEnd: Date) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminTeams, adminTeamMembers, adminPerformanceMetrics } = await import("../drizzle/schema");
  const { eq, and, gte, lte, inArray } = await import("drizzle-orm");

  // Get all teams in department
  const deptTeams = await db
    .select({ id: adminTeams.id })
    .from(adminTeams)
    .where(eq(adminTeams.department, department));

  const deptTeamIds = deptTeams.map((t) => t.id);

  if (deptTeamIds.length === 0) {
    return {
      department,
      teamCount: 0,
      totalMembers: 0,
      totalApplicationsReviewed: 0,
      departmentApprovalRate: 0,
      averageReviewTimeHours: 0,
    };
  }

  // Get all members in department teams
  const members = await db
    .select({ adminId: adminTeamMembers.adminId })
    .from(adminTeamMembers)
    .where(inArray(adminTeamMembers.teamId, deptTeamIds));

  const adminIds = members.map((m) => m.adminId);

  // Get metrics
  const metrics = await db
    .select()
    .from(adminPerformanceMetrics)
    .where(
      and(
        inArray(adminPerformanceMetrics.adminId, adminIds),
        gte(adminPerformanceMetrics.periodStart as any, periodStart),
        lte(adminPerformanceMetrics.periodEnd as any, periodEnd)
      )
    );

  const totalReviewed = metrics.reduce((sum, m) => sum + (m.totalReviewed || 0), 0);
  const avgApprovalRate = Math.round(metrics.reduce((sum, m) => sum + (m.approvalRate || 0), 0) / metrics.length);
  const avgReviewTime = parseFloat(
    (metrics.reduce((sum, m) => sum + parseFloat(m.averageReviewTimeHours || "0"), 0) / metrics.length).toFixed(2)
  );

  return {
    department,
    teamCount: deptTeamIds.length,
    totalMembers: adminIds.length,
    totalApplicationsReviewed: totalReviewed,
    departmentApprovalRate: avgApprovalRate,
    averageReviewTimeHours: avgReviewTime,
  };
}


