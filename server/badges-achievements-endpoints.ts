/**
 * Admin badges and achievement system
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { sendEmail } from "./email";

/**
 * Initialize default badges
 */
export async function initializeDefaultBadges() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminBadges } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const defaultBadges = [
    {
      name: "Speed Demon",
      description: "Reviewed applications with average time under 2 hours",
      icon: "⚡",
      color: "#f59e0b",
      criteria: "speed_demon" as const,
      threshold: 2,
      thresholdUnit: "hours",
      tier: "gold" as const,
    },
    {
      name: "Fair Judge",
      description: "Maintained balanced 40-60% approval/rejection ratio",
      icon: "⚖️",
      color: "#8b5cf6",
      criteria: "fair_judge" as const,
      threshold: 50,
      thresholdUnit: "percentage",
      tier: "silver" as const,
    },
    {
      name: "Volume Champion",
      description: "Reviewed the most applications this month",
      icon: "🏆",
      color: "#fbbf24",
      criteria: "volume_champion" as const,
      threshold: null,
      thresholdUnit: "applications",
      tier: "gold" as const,
    },
    {
      name: "Consistency Master",
      description: "Maintained high performance for 3+ months",
      icon: "📈",
      color: "#10b981",
      criteria: "consistency_master" as const,
      threshold: 3,
      thresholdUnit: "months",
      tier: "platinum" as const,
    },
    {
      name: "Quality Expert",
      description: "Achieved highest approval rate (70%+)",
      icon: "✨",
      color: "#06b6d4",
      criteria: "quality_expert" as const,
      threshold: 70,
      thresholdUnit: "percentage",
      tier: "platinum" as const,
    },
    {
      name: "Milestone: 100",
      description: "Reviewed 100 applications",
      icon: "💯",
      color: "#ec4899",
      criteria: "milestone_100" as const,
      threshold: 100,
      thresholdUnit: "applications",
      tier: "silver" as const,
    },
    {
      name: "Milestone: 500",
      description: "Reviewed 500 applications",
      icon: "🎯",
      color: "#f97316",
      criteria: "milestone_500" as const,
      threshold: 500,
      thresholdUnit: "applications",
      tier: "gold" as const,
    },
    {
      name: "Milestone: 1000",
      description: "Reviewed 1000 applications",
      icon: "👑",
      color: "#fbbf24",
      criteria: "milestone_1000" as const,
      threshold: 1000,
      thresholdUnit: "applications",
      tier: "platinum" as const,
    },
  ];

  for (const badge of defaultBadges) {
    // Check if badge already exists
    const [existing] = await db
      .select()
      .from(adminBadges)
      .where(eq(adminBadges.name, badge.name));

    if (!existing) {
      await db.insert(adminBadges).values(badge);
    }
  }

  return { success: true, badgeCount: defaultBadges.length };
}

/**
 * Check and award achievements for an admin
 */
export async function checkAndAwardAchievements(adminId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminBadges, adminAchievements, adminPerformanceMetrics, users } = await import("../drizzle/schema");
  const { eq, and, gte, desc } = await import("drizzle-orm");

  // Get admin details
  const [admin] = await db.select().from(users).where(eq(users.id, adminId));
  if (!admin) throw new TRPCError({ code: "NOT_FOUND", message: "Admin not found" });

  // Get current month metrics
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [metrics] = await db
    .select()
    .from(adminPerformanceMetrics)
    .where(
      and(
        eq(adminPerformanceMetrics.adminId, adminId),
        gte(adminPerformanceMetrics.periodStart as any, monthStart)
      )
    );

  if (!metrics) {
    return { success: true, achievementsAwarded: 0 };
  }

  const awardedAchievements = [];

  // Check speed demon badge (< 2 hours average)
  if (parseFloat(metrics.averageReviewTimeHours || "0") < 2) {
    const [speedBadge] = await db
      .select()
      .from(adminBadges)
      .where(eq(adminBadges.criteria, "speed_demon"));

    if (speedBadge) {
      const [existing] = await db
        .select()
        .from(adminAchievements)
        .where(and(eq(adminAchievements.adminId, adminId), eq(adminAchievements.badgeId, speedBadge.id)));

      if (!existing) {
        await db.insert(adminAchievements).values({
          adminId,
          badgeId: speedBadge.id,
          value: Math.round(parseFloat(metrics.averageReviewTimeHours || "0") * 100) / 100,
        });
        awardedAchievements.push(speedBadge);
      }
    }
  }

  // Check fair judge badge (40-60% approval rate)
  const approvalRate = metrics.approvalRate || 0;
  if (approvalRate >= 40 && approvalRate <= 60) {
    const [fairBadge] = await db
      .select()
      .from(adminBadges)
      .where(eq(adminBadges.criteria, "fair_judge"));

    if (fairBadge) {
      const [existing] = await db
        .select()
        .from(adminAchievements)
        .where(and(eq(adminAchievements.adminId, adminId), eq(adminAchievements.badgeId, fairBadge.id)));

      if (!existing) {
        await db.insert(adminAchievements).values({
          adminId,
          badgeId: fairBadge.id,
          value: approvalRate,
        });
        awardedAchievements.push(fairBadge);
      }
    }
  }

  // Check milestone badges
  const totalReviewed = metrics.totalReviewed || 0;
  const milestones = [
    { threshold: 100, criteria: "milestone_100" as const },
    { threshold: 500, criteria: "milestone_500" as const },
    { threshold: 1000, criteria: "milestone_1000" as const },
  ];

  for (const milestone of milestones) {
    if (totalReviewed >= milestone.threshold) {
      const [milestoneBadge] = await db
        .select()
        .from(adminBadges)
        .where(eq(adminBadges.criteria, milestone.criteria));

      if (milestoneBadge) {
        const [existing] = await db
          .select()
          .from(adminAchievements)
          .where(and(eq(adminAchievements.adminId, adminId), eq(adminAchievements.badgeId, milestoneBadge.id)));

        if (!existing) {
          await db.insert(adminAchievements).values({
            adminId,
            badgeId: milestoneBadge.id,
            value: totalReviewed,
          });
          awardedAchievements.push(milestoneBadge);
        }
      }
    }
  }

  // Send achievement notification emails
  for (const badge of awardedAchievements) {
    await sendAchievementNotificationEmail(admin.email || "", admin.name || "Admin", badge.name, badge.icon || "");
  }

  return { success: true, achievementsAwarded: awardedAchievements.length };
}

/**
 * Send achievement notification email
 */
async function sendAchievementNotificationEmail(
  adminEmail: string,
  adminName: string,
  badgeName: string,
  badgeIcon: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5a5 0%, #14b8a6 100%); color: white; padding: 40px; border-radius: 8px 8px 0 0; text-align: center; }
    .badge-display { font-size: 80px; margin: 20px 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .achievement-box { background: white; border: 2px solid #0ea5a5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .achievement-name { font-size: 24px; font-weight: bold; color: #0ea5a5; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Achievement Unlocked!</h1>
    </div>
    <div class="content">
      <p>Congratulations ${adminName}!</p>
      
      <div class="achievement-box">
        <div class="badge-display">${badgeIcon}</div>
        <div class="achievement-name">${badgeName}</div>
        <p style="color: #6b7280; margin-top: 10px;">You've earned a new badge for your outstanding performance!</p>
      </div>
      
      <p>Keep up the excellent work. Your contributions are making a difference in the application review process.</p>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">© 2026 Lingueefy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await sendEmail({
      to: adminEmail,
      subject: `🎉 You've Earned the "${badgeName}" Badge!`,
      html,
    });
  } catch (error) {
    console.error("Failed to send achievement notification:", error);
  }
}

/**
 * Get admin achievements
 */
export async function getAdminAchievements(adminId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { adminAchievements, adminBadges } = await import("../drizzle/schema");
  const { eq, desc } = await import("drizzle-orm");

  const achievements = await db
    .select({
      id: adminAchievements.id,
      badgeId: adminAchievements.badgeId,
      badgeName: adminBadges.name,
      badgeIcon: adminBadges.icon,
      badgeColor: adminBadges.color,
      badgeTier: adminBadges.tier,
      achievedAt: adminAchievements.achievedAt,
      value: adminAchievements.value,
    })
    .from(adminAchievements)
    .innerJoin(adminBadges, eq(adminAchievements.badgeId, adminBadges.id))
    .where(eq(adminAchievements.adminId, adminId))
    .orderBy(desc(adminAchievements.achievedAt));

  return achievements;
}

/**
 * Get achievement milestones for an admin
 */
export async function getAdminMilestones(adminId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { achievementMilestones, adminBadges } = await import("../drizzle/schema");
  const { eq, desc } = await import("drizzle-orm");

  const milestones = await db
    .select({
      id: achievementMilestones.id,
      badgeName: adminBadges.name,
      badgeIcon: adminBadges.icon,
      currentValue: achievementMilestones.currentValue,
      targetValue: achievementMilestones.targetValue,
      progressPercentage: achievementMilestones.progressPercentage,
      isCompleted: achievementMilestones.isCompleted,
      completedAt: achievementMilestones.completedAt,
    })
    .from(achievementMilestones)
    .innerJoin(adminBadges, eq(achievementMilestones.badgeId, adminBadges.id))
    .where(eq(achievementMilestones.adminId, adminId))
    .orderBy(desc(achievementMilestones.progressPercentage));

  return milestones;
}

/**
 * Update achievement milestone progress
 */
export async function updateMilestoneProgress(
  adminId: number,
  badgeId: number,
  currentValue: number,
  targetValue: number
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { achievementMilestones } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  const progressPercentage = Math.min(Math.round((currentValue / targetValue) * 100), 100);
  const isCompleted = currentValue >= targetValue;

  const [existing] = await db
    .select()
    .from(achievementMilestones)
    .where(and(eq(achievementMilestones.adminId, adminId), eq(achievementMilestones.badgeId, badgeId)));

  if (existing) {
    await db
      .update(achievementMilestones)
      .set({
        currentValue: currentValue.toString(),
        progressPercentage,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      })
      .where(eq(achievementMilestones.id, existing.id));
  } else {
    await db.insert(achievementMilestones).values({
      adminId,
      badgeId,
      currentValue: currentValue.toString(),
      targetValue,
      progressPercentage,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    });
  }

  return { success: true, progressPercentage };
}
