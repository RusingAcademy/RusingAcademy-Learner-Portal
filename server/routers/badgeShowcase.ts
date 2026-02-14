/**
 * Badge Showcase Router — Learner-facing badge progress & display
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getBadgeProgressForUser } from "../services/badgeAwardService";
import { BADGE_DEFINITIONS, ALL_BADGES, BADGE_CATEGORIES, CATEGORY_META, TIER_META, getBadgesByCategory } from "../data/badgeDefinitions";
import { getDb } from "../db";
import { learnerBadges } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const badgeShowcaseRouter = router({
  /**
   * Get all badges with progress for the current user.
   * Returns earned badges with dates and locked badges with progress bars.
   */
  getMyBadgeProgress: protectedProcedure.query(async ({ ctx }) => {
    const progress = await getBadgeProgressForUser(ctx.user.id);

    // Group by category
    const byCategory = Object.entries(BADGE_CATEGORIES).map(([key, value]) => {
      const categoryBadges = progress.filter((p) => p.badge.category === value);
      const earned = categoryBadges.filter((p) => p.earned).length;
      const total = categoryBadges.length;
      const meta = CATEGORY_META[value];

      return {
        category: value,
        label: meta.label,
        labelFr: meta.labelFr,
        icon: meta.icon,
        color: meta.color,
        earned,
        total,
        progressPercent: total > 0 ? Math.round((earned / total) * 100) : 0,
        badges: categoryBadges.map((p) => ({
          id: p.badge.id,
          name: p.badge.name,
          nameFr: p.badge.nameFr,
          description: p.badge.description,
          descriptionFr: p.badge.descriptionFr,
          category: p.badge.category,
          tier: p.badge.tier,
          xpReward: p.badge.xpReward,
          iconKey: p.badge.iconKey,
          gradientFrom: p.badge.gradientFrom,
          gradientTo: p.badge.gradientTo,
          earned: p.earned,
          earnedAt: p.earnedAt?.toISOString() || null,
          currentValue: p.currentValue,
          targetValue: p.targetValue,
          progressPercent: p.progressPercent,
        })),
      };
    });

    // Summary stats
    const totalEarned = progress.filter((p) => p.earned).length;
    const totalBadges = progress.length;
    const recentBadges = progress
      .filter((p) => p.earned && p.earnedAt)
      .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.badge.id,
        name: p.badge.name,
        nameFr: p.badge.nameFr,
        tier: p.badge.tier,
        iconKey: p.badge.iconKey,
        gradientFrom: p.badge.gradientFrom,
        gradientTo: p.badge.gradientTo,
        earnedAt: p.earnedAt?.toISOString() || null,
      }));

    // Next badges to earn (closest to completion)
    const nextToEarn = progress
      .filter((p) => !p.earned && p.progressPercent > 0)
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .slice(0, 3)
      .map((p) => ({
        id: p.badge.id,
        name: p.badge.name,
        nameFr: p.badge.nameFr,
        tier: p.badge.tier,
        iconKey: p.badge.iconKey,
        gradientFrom: p.badge.gradientFrom,
        gradientTo: p.badge.gradientTo,
        currentValue: p.currentValue,
        targetValue: p.targetValue,
        progressPercent: p.progressPercent,
      }));

    return {
      summary: {
        totalEarned,
        totalBadges,
        progressPercent: totalBadges > 0 ? Math.round((totalEarned / totalBadges) * 100) : 0,
      },
      recentBadges,
      nextToEarn,
      categories: byCategory,
      tierMeta: TIER_META,
    };
  }),

  /**
   * Mark badges as seen (clear "new" indicator)
   */
  markBadgesSeen: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    await db
      .update(learnerBadges)
      .set({ isNew: false })
      .where(and(eq(learnerBadges.userId, ctx.user.id), eq(learnerBadges.isNew, true)));

    return { success: true };
  }),

  /**
   * Get newly earned badges (for toast notifications)
   */
  getNewBadges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const newBadges = await db
      .select()
      .from(learnerBadges)
      .where(and(eq(learnerBadges.userId, ctx.user.id), eq(learnerBadges.isNew, true)))
      .orderBy(desc(learnerBadges.awardedAt));

    // Enrich with definition data
    return newBadges.map((b) => {
      const def = ALL_BADGES.find((d) => d.id === b.badgeType);
      return {
        id: b.id,
        badgeType: b.badgeType,
        title: b.title,
        titleFr: b.titleFr,
        description: b.description,
        descriptionFr: b.descriptionFr,
        tier: def?.tier || "bronze",
        iconKey: def?.iconKey || "award",
        gradientFrom: def?.gradientFrom || "#0F3D3E",
        gradientTo: def?.gradientTo || "#145A5B",
        xpReward: def?.xpReward || 0,
        awardedAt: b.awardedAt?.toISOString() || null,
      };
    });
  }),

  /**
   * Get badge definitions (for admin or public display)
   */
  getAllDefinitions: protectedProcedure.query(async () => {
    return {
      badges: ALL_BADGES.map((b) => ({
        id: b.id,
        name: b.name,
        nameFr: b.nameFr,
        description: b.description,
        descriptionFr: b.descriptionFr,
        category: b.category,
        tier: b.tier,
        xpReward: b.xpReward,
        iconKey: b.iconKey,
        gradientFrom: b.gradientFrom,
        gradientTo: b.gradientTo,
      })),
      categories: CATEGORY_META,
      tiers: TIER_META,
    };
  }),
});
