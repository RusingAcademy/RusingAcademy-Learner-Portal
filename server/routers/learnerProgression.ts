/**
 * Learner Progression Router
 * Exposes XP multipliers, milestones, recommendations, and activity feed
 * Builds on top of the existing gamification router
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  calculateXpMultiplier,
  calculateEnhancedXp,
  checkNewMilestones,
  getMilestoneProgress,
  getNextMilestone,
  getPersonalizedRecommendations,
  getActivityFeed,
  MILESTONES,
} from "../services/xpEngine";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

async function db() {
  const d = await getDb();
  if (!d) throw new Error("Database not available");
  return d;
}

export const learnerProgressionRouter = router({
  /**
   * Get the user's current XP multiplier breakdown
   */
  getMultiplier: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const d = await db();
      const [rows] = await d.execute(sql`
        SELECT currentStreak, currentLevel, totalXp FROM learner_xp WHERE userId = ${userId} LIMIT 1
      `);
      const xpData = (rows as unknown as any[])[0];

      if (!xpData) {
        return {
          totalMultiplier: 1.0,
          streakMultiplier: 1.0,
          levelMultiplier: 1.0,
          streakLabel: "No Bonus",
          currentStreak: 0,
          currentLevel: 1,
        };
      }

      const multiplier = calculateXpMultiplier(xpData.currentStreak, xpData.currentLevel);
      return {
        ...multiplier,
        currentStreak: xpData.currentStreak,
        currentLevel: xpData.currentLevel,
      };
    } catch (error) {
      console.error("[LearnerProgression] getMultiplier error:", error);
      return {
        totalMultiplier: 1.0,
        streakMultiplier: 1.0,
        levelMultiplier: 1.0,
        streakLabel: "No Bonus",
        currentStreak: 0,
        currentLevel: 1,
      };
    }
  }),

  /**
   * Calculate enhanced XP for a given base amount (preview)
   */
  previewXp: protectedProcedure
    .input(z.object({ baseXp: z.number().min(1).max(1000) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      try {
        const d = await db();
        const [rows] = await d.execute(sql`
          SELECT currentStreak, currentLevel FROM learner_xp WHERE userId = ${userId} LIMIT 1
        `);
        const xpData = (rows as unknown as any[])[0];

        if (!xpData) {
          return calculateEnhancedXp(input.baseXp, 0, 1);
        }

        return calculateEnhancedXp(input.baseXp, xpData.currentStreak, xpData.currentLevel);
      } catch (error) {
        console.error("[LearnerProgression] previewXp error:", error);
        return calculateEnhancedXp(input.baseXp, 0, 1);
      }
    }),

  /**
   * Get milestone progress for the current user
   */
  getMilestoneProgress: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const d = await db();
      const [rows] = await d.execute(sql`
        SELECT totalXp, milestonesReached FROM learner_xp WHERE userId = ${userId} LIMIT 1
      `);
      const xpData = (rows as unknown as any[])[0];

      if (!xpData) {
        return {
          ...getMilestoneProgress(0),
          allMilestones: MILESTONES,
          reachedMilestones: [],
        };
      }

      const totalXp = xpData.totalXp || 0;
      const reached = xpData.milestonesReached || [];

      return {
        ...getMilestoneProgress(totalXp),
        allMilestones: MILESTONES,
        reachedMilestones: MILESTONES.filter(m => reached.includes(m.id) || totalXp >= m.xpThreshold),
      };
    } catch (error) {
      console.error("[LearnerProgression] getMilestoneProgress error:", error);
      return {
        ...getMilestoneProgress(0),
        allMilestones: MILESTONES,
        reachedMilestones: [],
      };
    }
  }),

  /**
   * Get all milestones with their status for the current user
   */
  getAllMilestones: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const d = await db();
      const [rows] = await d.execute(sql`
        SELECT totalXp, milestonesReached FROM learner_xp WHERE userId = ${userId} LIMIT 1
      `);
      const xpData = (rows as unknown as any[])[0];
      const totalXp = xpData?.totalXp || 0;

      return MILESTONES.map(m => ({
        ...m,
        reached: totalXp >= m.xpThreshold,
        progressPercent: Math.min(100, Math.round((totalXp / m.xpThreshold) * 100)),
      }));
    } catch (error) {
      console.error("[LearnerProgression] getAllMilestones error:", error);
      return MILESTONES.map(m => ({ ...m, reached: false, progressPercent: 0 }));
    }
  }),

  /**
   * Get personalized recommendations for the current user
   */
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return getPersonalizedRecommendations(ctx.user.id);
  }),

  /**
   * Get the activity feed for the current user
   */
  getActivityFeed: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      return getActivityFeed(ctx.user.id, input?.limit || 20);
    }),

  /**
   * Get a comprehensive progression summary (for dashboard hero section)
   */
  getProgressionSummary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const d = await db();
      const [rows] = await d.execute(sql`
        SELECT totalXp, weeklyXp, monthlyXp, currentStreak, longestStreak,
               currentLevel, levelTitle, milestonesReached, lastActivityDate,
               streakFreezeAvailable, streakFreezeCount
        FROM learner_xp WHERE userId = ${userId} LIMIT 1
      `);
      const xpData = (rows as unknown as any[])[0];

      if (!xpData) {
        return {
          totalXp: 0,
          weeklyXp: 0,
          monthlyXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          currentLevel: 1,
          levelTitle: "Beginner",
          multiplier: calculateXpMultiplier(0, 1),
          milestoneProgress: getMilestoneProgress(0),
          streakFreezeAvailable: true,
          streakFreezeCount: 2,
          lastActivityDate: null,
          recentActivityCount: 0,
        };
      }

      // Count recent activities (last 7 days)
      const [activityCount] = await d.execute(sql`
        SELECT COUNT(*) as cnt FROM xp_transactions 
        WHERE userId = ${userId} AND createdAt > DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);

      return {
        totalXp: xpData.totalXp,
        weeklyXp: xpData.weeklyXp,
        monthlyXp: xpData.monthlyXp,
        currentStreak: xpData.currentStreak,
        longestStreak: xpData.longestStreak,
        currentLevel: xpData.currentLevel,
        levelTitle: xpData.levelTitle,
        multiplier: calculateXpMultiplier(xpData.currentStreak, xpData.currentLevel),
        milestoneProgress: getMilestoneProgress(xpData.totalXp),
        streakFreezeAvailable: xpData.streakFreezeAvailable,
        streakFreezeCount: xpData.streakFreezeCount,
        lastActivityDate: xpData.lastActivityDate,
        recentActivityCount: (activityCount as unknown as any[])[0]?.cnt || 0,
      };
    } catch (error) {
      console.error("[LearnerProgression] getProgressionSummary error:", error);
      return {
        totalXp: 0,
        weeklyXp: 0,
        monthlyXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        currentLevel: 1,
        levelTitle: "Beginner",
        multiplier: calculateXpMultiplier(0, 1),
        milestoneProgress: getMilestoneProgress(0),
        streakFreezeAvailable: true,
        streakFreezeCount: 2,
        lastActivityDate: null,
        recentActivityCount: 0,
      };
    }
  }),
});
