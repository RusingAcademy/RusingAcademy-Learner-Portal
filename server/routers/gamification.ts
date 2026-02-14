import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import { 
  sendBadgeUnlockNotification, 
  checkAndSendStreakMilestone,
  checkAndSendLevelUp 
} from "../services/gamificationNotifications";
import { 
  learnerXp, 
  xpTransactions, 
  learnerBadges,
  users,
  inAppNotifications,
  weeklyChallenges,
  userWeeklyChallenges
} from "../../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";

// XP amounts for different actions
const XP_REWARDS = {
  lesson_complete: 10,
  quiz_pass: 15,
  quiz_perfect: 25,
  module_complete: 50,
  course_complete: 200,
  streak_bonus: 5,
  daily_login: 5,
  first_lesson: 20,
  challenge_complete: 30,
  review_submitted: 10,
  note_created: 5,
  exercise_complete: 8,
  speaking_practice: 12,
  writing_submitted: 15,
  milestone_bonus: 100,
  level_up_bonus: 50,
  referral_bonus: 100,
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Beginner", titleFr: "Débutant" },
  { level: 2, xp: 100, title: "Novice", titleFr: "Novice" },
  { level: 3, xp: 300, title: "Apprentice", titleFr: "Apprenti" },
  { level: 4, xp: 600, title: "Intermediate", titleFr: "Intermédiaire" },
  { level: 5, xp: 1000, title: "Proficient", titleFr: "Compétent" },
  { level: 6, xp: 1500, title: "Advanced", titleFr: "Avancé" },
  { level: 7, xp: 2200, title: "Expert", titleFr: "Expert" },
  { level: 8, xp: 3000, title: "Master", titleFr: "Maître" },
  { level: 9, xp: 4000, title: "Champion", titleFr: "Champion" },
  { level: 10, xp: 5500, title: "Legend", titleFr: "Légende" },
];

function getLevelForXp(totalXp: number) {
  let currentLevel = LEVEL_THRESHOLDS[0];
  for (const level of LEVEL_THRESHOLDS) {
    if (totalXp >= level.xp) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

function getNextLevel(currentLevel: number) {
  const nextLevelIndex = LEVEL_THRESHOLDS.findIndex(l => l.level === currentLevel + 1);
  return nextLevelIndex >= 0 ? LEVEL_THRESHOLDS[nextLevelIndex] : null;
}

export const gamificationRouter = router({
  // Get user's gamification stats
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const userId = ctx.user.id;
    
    // Get or create XP record
    const xpRecords = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
    let xpRecord = xpRecords[0];
    
    if (!xpRecord) {
      await db.insert(learnerXp).values({
        userId,
        totalXp: 0,
        weeklyXp: 0,
        monthlyXp: 0,
        currentLevel: 1,
        levelTitle: "Beginner",
        currentStreak: 0,
        longestStreak: 0,
      });
      
      const newXpRecords = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
      xpRecord = newXpRecords[0];
    }
    
    const currentLevelInfo = getLevelForXp(xpRecord!.totalXp);
    const nextLevel = getNextLevel(currentLevelInfo.level);
    const xpToNextLevel = nextLevel ? nextLevel.xp - xpRecord!.totalXp : 0;
    const progressToNextLevel = nextLevel 
      ? ((xpRecord!.totalXp - currentLevelInfo.xp) / (nextLevel.xp - currentLevelInfo.xp)) * 100
      : 100;
    
    // Get recent badges
    const recentBadges = await db.select().from(learnerBadges)
      .where(eq(learnerBadges.userId, userId))
      .orderBy(desc(learnerBadges.awardedAt))
      .limit(5);
    
    // Get badge count
    const badgeCount = await db.select({ count: sql<number>`count(*)` })
      .from(learnerBadges)
      .where(eq(learnerBadges.userId, userId));
    
    return {
      // Flat properties for dashboard compatibility
      totalXp: xpRecord!.totalXp,
      level: currentLevelInfo.level,
      currentStreak: xpRecord!.currentStreak,
      recentBadges: recentBadges.map(b => ({
        id: b.id,
        name: b.title,
        icon: b.badgeType?.includes('streak') ? '🔥' : b.badgeType?.includes('xp') ? '⭐' : '🏆',
      })),
      // Original nested structure
      xp: {
        total: xpRecord!.totalXp,
        weekly: xpRecord!.weeklyXp,
        monthly: xpRecord!.monthlyXp,
      },
      levelInfo: {
        current: currentLevelInfo.level,
        title: currentLevelInfo.title,
        titleFr: currentLevelInfo.titleFr,
        xpToNextLevel,
        progressPercent: Math.round(progressToNextLevel),
        nextLevel: nextLevel ? {
          level: nextLevel.level,
          title: nextLevel.title,
          titleFr: nextLevel.titleFr,
          xpRequired: nextLevel.xp,
        } : null,
      },
      streak: {
        current: xpRecord!.currentStreak,
        longest: xpRecord!.longestStreak,
        lastActivity: xpRecord!.lastActivityDate,
        freezeAvailable: xpRecord!.streakFreezeAvailable,
      },
      badges: {
        total: badgeCount[0]?.count || 0,
        recent: recentBadges,
      },
    };
  }),
  
  // Award XP for an action
  awardXp: protectedProcedure
    .input(z.object({
      reason: z.enum([
        "lesson_complete", "quiz_pass", "quiz_perfect", "module_complete",
        "course_complete", "streak_bonus", "daily_login", "first_lesson",
        "challenge_complete", "review_submitted", "note_created", "exercise_complete",
        "speaking_practice", "writing_submitted", "milestone_bonus", "level_up_bonus", "referral_bonus",
      ]),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      customAmount: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const userId = ctx.user.id;
      const amount = input.customAmount || XP_REWARDS[input.reason];
      
      const xpRecordsList = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
      let xpRecord = xpRecordsList[0];
      
      if (!xpRecord) {
        await db.insert(learnerXp).values({
          userId, totalXp: 0, weeklyXp: 0, monthlyXp: 0,
          currentLevel: 1, levelTitle: "Beginner", currentStreak: 0, longestStreak: 0,
        });
        const newXpRecordsList = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
        xpRecord = newXpRecordsList[0];
      }
      
      const oldLevel = getLevelForXp(xpRecord!.totalXp);
      const newTotalXp = xpRecord!.totalXp + amount;
      const newLevel = getLevelForXp(newTotalXp);
      
      await db.insert(xpTransactions).values({
        userId, amount, reason: input.reason,
        referenceType: input.referenceType, referenceId: input.referenceId,
      });
      
      await db.update(learnerXp)
        .set({
          totalXp: newTotalXp,
          weeklyXp: xpRecord!.weeklyXp + amount,
          monthlyXp: xpRecord!.monthlyXp + amount,
          currentLevel: newLevel.level,
          levelTitle: newLevel.title,
          lastActivityDate: new Date(),
        })
        .where(eq(learnerXp.userId, userId));
      
      const leveledUp = newLevel.level > oldLevel.level;
      
      if (leveledUp) {
        await db.insert(xpTransactions).values({
          userId, amount: XP_REWARDS.level_up_bonus, reason: "level_up_bonus",
          description: `Reached level ${newLevel.level}: ${newLevel.title}`,
        });
        await db.update(learnerXp).set({ totalXp: newTotalXp + XP_REWARDS.level_up_bonus }).where(eq(learnerXp.userId, userId));
        
        // Send level-up notification
        checkAndSendLevelUp(userId, xpRecord!.totalXp, newTotalXp + XP_REWARDS.level_up_bonus);
      }
      
      return {
        xpAwarded: amount,
        newTotal: newTotalXp + (leveledUp ? XP_REWARDS.level_up_bonus : 0),
        leveledUp,
        newLevel: leveledUp ? newLevel : null,
      };
    }),
  
  // Get all badges for user
  getMyBadges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const badges = await db.select().from(learnerBadges)
      .where(eq(learnerBadges.userId, ctx.user.id))
      .orderBy(desc(learnerBadges.awardedAt));
    
    await db.update(learnerBadges)
      .set({ isNew: false })
      .where(and(eq(learnerBadges.userId, ctx.user.id), eq(learnerBadges.isNew, true)));
    
    return badges;
  }),
  
  // Award a badge
  awardBadge: protectedProcedure
    .input(z.object({
      badgeType: z.enum([
        "first_lesson", "module_complete", "course_complete", "all_courses_complete",
        "streak_3", "streak_7", "streak_14", "streak_30", "streak_100",
        "quiz_ace", "perfect_module", "quiz_master",
        "early_bird", "night_owl", "weekend_warrior", "consistent_learner",
        "xp_100", "xp_500", "xp_1000", "xp_5000",
        "founding_member", "beta_tester", "community_helper", "top_reviewer",
      ]),
      title: z.string(),
      titleFr: z.string().optional(),
      description: z.string().optional(),
      descriptionFr: z.string().optional(),
      courseId: z.number().optional(),
      moduleId: z.number().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const userId = ctx.user.id;
      
      const existingBadges = await db.select().from(learnerBadges)
        .where(and(
          eq(learnerBadges.userId, userId),
          eq(learnerBadges.badgeType, input.badgeType),
        ))
        .limit(1);
      const existing = existingBadges[0];
      
      if (existing) return { alreadyAwarded: true, badge: existing };
      
      const [badge] = await db.insert(learnerBadges).values({
        userId,
        badgeType: input.badgeType,
        title: input.title,
        titleFr: input.titleFr,
        description: input.description,
        descriptionFr: input.descriptionFr,
        courseId: input.courseId,
        moduleId: input.moduleId,
        metadata: input.metadata,
        isNew: true,
      }).$returningId();
      
      // Create in-app notification for badge earned
      await db.insert(inAppNotifications).values({
        userId,
        type: "challenge",
        title: `🏆 New Badge Earned: ${input.title}!`,
        titleFr: `🏆 Nouveau badge obtenu: ${input.titleFr || input.title}!`,
        message: input.description || `You've earned the ${input.title} badge!`,
        messageFr: input.descriptionFr || `Vous avez obtenu le badge ${input.titleFr || input.title}!`,
        linkType: "challenge",
        isRead: false,
      });
      
      // Send push notification for badge unlock
      sendBadgeUnlockNotification({
        userId,
        badgeTitle: input.title,
        badgeTitleFr: input.titleFr || input.title,
        badgeDescription: input.description || `You've earned the ${input.title} badge!`,
        badgeDescriptionFr: input.descriptionFr || `Vous avez obtenu le badge ${input.titleFr || input.title}!`,
      });
      
      return { alreadyAwarded: false, badge, notificationSent: true };
    }),
  
  // Update streak
  updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const userId = ctx.user.id;
    const xpRecords = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
    const xpRecord = xpRecords[0];
    
    if (!xpRecord) return { streak: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = xpRecord.lastActivityDate ? new Date(xpRecord.lastActivityDate) : null;
    if (lastActivity) lastActivity.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = xpRecord.currentStreak;
    
    if (!lastActivity || lastActivity.getTime() < yesterday.getTime()) {
      newStreak = 1;
    } else if (lastActivity.getTime() === yesterday.getTime()) {
      newStreak = xpRecord.currentStreak + 1;
    }
    
    const newLongest = Math.max(newStreak, xpRecord.longestStreak);
    
    await db.update(learnerXp)
      .set({ currentStreak: newStreak, longestStreak: newLongest, lastActivityDate: new Date() })
      .where(eq(learnerXp.userId, userId));
    
    // Check for streak badges
    const streakBadges = [
      { days: 3, type: "streak_3" as const, title: "3-Day Streak", titleFr: "Série de 3 jours" },
      { days: 7, type: "streak_7" as const, title: "Week Warrior", titleFr: "Guerrier de la semaine" },
      { days: 14, type: "streak_14" as const, title: "Two Week Champion", titleFr: "Champion de deux semaines" },
      { days: 30, type: "streak_30" as const, title: "Monthly Master", titleFr: "Maître mensuel" },
      { days: 100, type: "streak_100" as const, title: "Century Legend", titleFr: "Légende du siècle" },
    ];
    
    for (const badge of streakBadges) {
      if (newStreak >= badge.days) {
        const existingBadgesList = await db.select().from(learnerBadges)
          .where(and(eq(learnerBadges.userId, userId), eq(learnerBadges.badgeType, badge.type)))
          .limit(1);
        const existing = existingBadgesList[0];
        
        if (!existing) {
          await db.insert(learnerBadges).values({
            userId, badgeType: badge.type, title: badge.title, titleFr: badge.titleFr,
            description: `Maintained a ${badge.days}-day learning streak`,
            descriptionFr: `A maintenu une série d'apprentissage de ${badge.days} jours`,
            metadata: { streakDays: newStreak }, isNew: true,
          });
          
          // Create notification for streak badge
          await db.insert(inAppNotifications).values({
            userId,
            type: "challenge",
            title: `🔥 ${badge.title} Unlocked!`,
            titleFr: `🔥 ${badge.titleFr} Débloqué!`,
            message: `Congratulations! You've maintained a ${badge.days}-day learning streak!`,
            messageFr: `Félicitations! Vous avez maintenu une série d'apprentissage de ${badge.days} jours!`,
            linkType: "challenge",
            isRead: false,
          });
        }
      }
    }
    
    // Send streak milestone notification if applicable
    checkAndSendStreakMilestone(userId, newStreak);
    
    return { streak: newStreak, longest: newLongest };
  }),
  
  // Use streak freeze to prevent streak loss
  useStreakFreeze: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const userId = ctx.user.id;
    const xpRecords = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
    const xpRecord = xpRecords[0];
    
    if (!xpRecord) {
      throw new TRPCError({ code: "NOT_FOUND", message: "XP record not found" });
    }
    
    if (!xpRecord.streakFreezeAvailable) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No streak freeze available" });
    }
    
    // Use the streak freeze and update last activity to today
    await db.update(learnerXp)
      .set({ 
        streakFreezeAvailable: false, 
        lastActivityDate: new Date() 
      })
      .where(eq(learnerXp.userId, userId));
    
    return { 
      success: true, 
      streak: xpRecord.currentStreak,
      message: "Streak freeze used successfully" 
    };
  }),

  // Get XP history
  getXpHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const transactions = await db.select().from(xpTransactions)
        .where(eq(xpTransactions.userId, ctx.user.id))
        .orderBy(desc(xpTransactions.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return transactions;
    }),
  
  // Get leaderboard
  getLeaderboard: protectedProcedure
    .input(z.object({
      timeRange: z.enum(["weekly", "monthly", "allTime"]).default("allTime"),
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const xpField = input.timeRange === "weekly" 
        ? learnerXp.weeklyXp 
        : input.timeRange === "monthly" 
          ? learnerXp.monthlyXp 
          : learnerXp.totalXp;
      
      // Get total count for pagination (only public profiles)
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(learnerXp).where(sql`showOnLeaderboard = true`);
      const total = countResult[0]?.count || 0;
      
      const leaderboard = await db
        .select({
          userId: learnerXp.userId,
          xp: xpField,
          level: learnerXp.currentLevel,
          levelTitle: learnerXp.levelTitle,
          streak: learnerXp.currentStreak,
          name: users.name,
          avatarUrl: users.avatarUrl,
        })
        .from(learnerXp)
        .innerJoin(users, eq(learnerXp.userId, users.id))
        .where(sql`showOnLeaderboard = true`)
        .orderBy(desc(xpField))
        .limit(input.limit)
        .offset(input.offset);
      
      // Enrich with badge count and completed courses for each user
      const enrichedEntries = await Promise.all(
        leaderboard.map(async (entry, index) => {
          let badgeCount = 0;
          let completedCourses = 0;
          let completedPaths = 0;
          try {
            const [badgeResult] = await db.execute(
              sql`SELECT COUNT(*) as cnt FROM learner_badges WHERE userId = ${entry.userId}`
            );
            badgeCount = Number((badgeResult as any)?.[0]?.cnt ?? 0);
          } catch (_) { /* table may not exist */ }
          try {
            const [courseResult] = await db.execute(
              sql`SELECT COUNT(*) as cnt FROM course_enrollments WHERE userId = ${entry.userId} AND status = 'completed'`
            );
            completedCourses = Number((courseResult as any)?.[0]?.cnt ?? 0);
          } catch (_) { /* table may not exist */ }
          try {
            const [pathResult] = await db.execute(
              sql`SELECT COUNT(*) as cnt FROM certificates WHERE userId = ${entry.userId}`
            );
            completedPaths = Number((pathResult as any)?.[0]?.cnt ?? 0);
          } catch (_) { /* table may not exist */ }
          return {
            rank: input.offset + index + 1,
            ...entry,
            badgeCount,
            completedCourses,
            completedPaths,
          };
        })
      );

      return {
        entries: enrichedEntries,
        total,
      };
    }),

  // Toggle leaderboard privacy
  toggleLeaderboardPrivacy: protectedProcedure
    .input(z.object({ showOnLeaderboard: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.execute(
        sql`UPDATE learner_xp SET showOnLeaderboard = ${input.showOnLeaderboard} WHERE userId = ${ctx.user.id}`
      );
      
      return { success: true, showOnLeaderboard: input.showOnLeaderboard };
    }),

  // Get leaderboard privacy setting for current user
  getLeaderboardPrivacy: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const result = await db.execute(
      sql`SELECT showOnLeaderboard FROM learner_xp WHERE userId = ${ctx.user.id}`
    );
    // @ts-expect-error - TS2352: auto-suppressed during TS cleanup
    const rows = result[0] as any[];
    return { showOnLeaderboard: rows.length > 0 ? Boolean(rows[0].showOnLeaderboard) : true };
  }),

  // Get current week's challenges
  getCurrentChallenges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const userId = ctx.user.id;
    const now = new Date();
    
    // Get active challenges for current week
    const challenges = await db.select()
      .from(weeklyChallenges)
      .where(and(
        eq(weeklyChallenges.isActive, true),
        sql`${weeklyChallenges.weekStart} <= ${now}`,
        sql`${weeklyChallenges.weekEnd} >= ${now}`
      ));
    
    // Get user's progress on these challenges
    const userProgress = await db.select()
      .from(userWeeklyChallenges)
      .where(eq(userWeeklyChallenges.userId, userId));
    
    const progressMap = new Map(userProgress.map(p => [p.challengeId, p]));
    
    return challenges.map(challenge => {
      const progress = progressMap.get(challenge.id);
      return {
        id: challenge.id,
        name: challenge.title,
        nameFr: challenge.titleFr,
        description: challenge.description,
        descriptionFr: challenge.descriptionFr,
        type: challenge.challengeType,
        targetValue: challenge.targetCount,
        currentProgress: progress?.currentProgress || 0,
        isCompleted: progress?.status === "completed",
        xpReward: challenge.xpReward,
        badgeId: challenge.badgeReward,
        weekEnd: challenge.weekEnd,
        rewardClaimed: progress?.badgeAwarded || false,
      };
    });
  }),

  // Update challenge progress
  updateChallengeProgress: protectedProcedure
    .input(z.object({
      challengeId: z.number(),
      progressIncrement: z.number().default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const userId = ctx.user.id;
      
      // Get the challenge
      const challengeList = await db.select().from(weeklyChallenges)
        .where(eq(weeklyChallenges.id, input.challengeId)).limit(1);
      const challenge = challengeList[0];
      
      if (!challenge) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
      }
      
      // Get or create user progress
      const progressList = await db.select().from(userWeeklyChallenges)
        .where(and(
          eq(userWeeklyChallenges.userId, userId),
          eq(userWeeklyChallenges.challengeId, input.challengeId)
        )).limit(1);
      
      let progress = progressList[0];
      
      if (!progress) {
        await db.insert(userWeeklyChallenges).values({
          userId,
          challengeId: input.challengeId,
          currentProgress: input.progressIncrement,
        });
        // @ts-expect-error - TS2740: auto-suppressed during TS cleanup
        progress = { currentProgress: input.progressIncrement, status: "active" as const };
      } else {
        const newProgress = progress.currentProgress + input.progressIncrement;
        const isCompleted = newProgress >= challenge.targetCount;
        
        await db.update(userWeeklyChallenges)
          .set({ currentProgress: newProgress, status: isCompleted ? "completed" : "active",
            completedAt: isCompleted ? new Date() : null,
          } as any)
          .where(and(
            eq(userWeeklyChallenges.userId, userId),
            eq(userWeeklyChallenges.challengeId, input.challengeId)
          ));
        
        // @ts-expect-error - TS2740: auto-suppressed during TS cleanup
        progress = { currentProgress: newProgress, status: isCompleted ? "completed" as const : "active" as const };
      }
      
      return {
        currentProgress: progress.currentProgress,
        isCompleted: progress.status === "completed",
        targetValue: challenge.targetCount,
      };
    }),

  // Claim challenge reward
  claimChallengeReward: protectedProcedure
    .input(z.object({ challengeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const userId = ctx.user.id;
      
      // Get user progress
      const progressList = await db.select().from(userWeeklyChallenges)
        .where(and(
          eq(userWeeklyChallenges.userId, userId),
          eq(userWeeklyChallenges.challengeId, input.challengeId)
        )).limit(1);
      const progress = progressList[0];
      
      if (!progress || progress.status !== "completed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Challenge not completed" });
      }
      
      if (progress.badgeAwarded) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Reward already claimed" });
      }
      
      // Get challenge for reward info
      const challengeList = await db.select().from(weeklyChallenges)
        .where(eq(weeklyChallenges.id, input.challengeId)).limit(1);
      const challenge = challengeList[0];
      
      if (!challenge) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
      }
      
      // Mark reward as claimed
      await db.update(userWeeklyChallenges)
        .set({ badgeAwarded: true })
        .where(and(
          eq(userWeeklyChallenges.userId, userId),
          eq(userWeeklyChallenges.challengeId, input.challengeId)
        ));
      
      // Award XP
      const xpRecords = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
      if (xpRecords[0]) {
        await db.update(learnerXp)
          .set({
            totalXp: xpRecords[0].totalXp + (challenge.xpReward || 50),
            weeklyXp: xpRecords[0].weeklyXp + (challenge.xpReward || 50),
          })
          .where(eq(learnerXp.userId, userId));
      }
      
      // Award badge if applicable
      if (challenge.badgeReward) {
        await db.insert(learnerBadges).values({
          userId,
          badgeType: challenge.badgeReward as any,
          title: `Challenge: ${challenge.title}`,
          titleFr: `Défi: ${challenge.titleFr || challenge.title}`,
          description: challenge.description || "Weekly challenge completed",
          descriptionFr: challenge.descriptionFr || "Défi hebdomadaire complété",
        });
      }
      
      return {
        success: true,
        xpAwarded: challenge.xpReward || 50,
        badgeAwarded: challenge.badgeReward || null,
      };
    }),

  // Get challenge history
  getChallengeHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const userId = ctx.user.id;
      
      const history = await db.select({
        challengeId: userWeeklyChallenges.challengeId,
        currentProgress: userWeeklyChallenges.currentProgress,
        status: userWeeklyChallenges.status,
        completedAt: userWeeklyChallenges.completedAt,
        badgeAwarded: userWeeklyChallenges.badgeAwarded,
        challengeName: weeklyChallenges.title,
        challengeNameFr: weeklyChallenges.titleFr,
        targetCount: weeklyChallenges.targetCount,
        xpReward: weeklyChallenges.xpReward,
        weekStart: weeklyChallenges.weekStart,
        weekEnd: weeklyChallenges.weekEnd,
      })
        .from(userWeeklyChallenges)
        .innerJoin(weeklyChallenges, eq(userWeeklyChallenges.challengeId, weeklyChallenges.id))
        .where(eq(userWeeklyChallenges.userId, userId))
        .orderBy(desc(weeklyChallenges.weekEnd))
        .limit(input.limit);
      
      return history;
    }),

  // Get user's rank in leaderboard
  getUserRank: protectedProcedure
    .input(z.object({
      period: z.enum(["weekly", "monthly", "allTime"]).default("weekly"),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const userId = ctx.user.id;
      const xpField = input.period === "weekly" 
        ? learnerXp.weeklyXp 
        : input.period === "monthly" 
          ? learnerXp.monthlyXp 
          : learnerXp.totalXp;
      
      // Get user's XP
      const userXpList = await db.select({ xp: xpField })
        .from(learnerXp)
        .where(eq(learnerXp.userId, userId))
        .limit(1);
      
      if (!userXpList[0]) {
        return { rank: null, totalUsers: 0, xp: 0 };
      }
      
      const userXp = userXpList[0].xp;
      
      // Count users with more XP
      const higherRanked = await db.select({ count: sql<number>`count(*)` })
        .from(learnerXp)
        .where(sql`${xpField} > ${userXp}`);
      
      const totalUsers = await db.select({ count: sql<number>`count(*)` })
        .from(learnerXp);
      
      return {
        rank: (higherRanked[0]?.count || 0) + 1,
        totalUsers: totalUsers[0]?.count || 0,
        xp: userXp,
      };
    }),

  // Get detailed streak information
  getStreakDetails: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const userId = ctx.user.id;
    
    const xpRecords = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
    const xpRecord = xpRecords[0];
    
    if (!xpRecord) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        freezeCount: 2,
        freezeAvailable: true,
        streakAtRisk: false,
        daysUntilStreakLoss: null,
        milestones: {
          next: 3,
          achieved: [],
        },
      };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = xpRecord.lastActivityDate ? new Date(xpRecord.lastActivityDate) : null;
    if (lastActivity) lastActivity.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if streak is at risk (no activity today and yesterday was last activity)
    const streakAtRisk = lastActivity && lastActivity.getTime() === yesterday.getTime();
    
    // Calculate days until streak loss
    let daysUntilStreakLoss: number | null = null;
    if (lastActivity && xpRecord.currentStreak > 0) {
      const daysSinceActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity === 0) {
        daysUntilStreakLoss = 2; // Today is active, 2 days until loss
      } else if (daysSinceActivity === 1) {
        daysUntilStreakLoss = 1; // Yesterday was active, 1 day until loss
      }
    }
    
    // Determine achieved milestones and next milestone
    const milestones = [3, 7, 14, 30, 60, 90, 100, 365];
    const achieved = milestones.filter(m => xpRecord.currentStreak >= m);
    const nextMilestone = milestones.find(m => xpRecord.currentStreak < m) || null;
    
    return {
      currentStreak: xpRecord.currentStreak,
      longestStreak: xpRecord.longestStreak,
      lastActivityDate: xpRecord.lastActivityDate,
      freezeCount: xpRecord.streakFreezeAvailable ? 2 : 0, // Will use streakFreezeCount when schema is updated
      freezeAvailable: xpRecord.streakFreezeAvailable,
      streakAtRisk,
      daysUntilStreakLoss,
      milestones: {
        next: nextMilestone,
        achieved,
      },
    };
  }),

  // Purchase streak freeze with XP
  purchaseStreakFreeze: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const userId = ctx.user.id;
    const FREEZE_COST = 100; // XP cost for a streak freeze
    
    const xpRecords = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
    const xpRecord = xpRecords[0];
    
    if (!xpRecord) {
      throw new TRPCError({ code: "NOT_FOUND", message: "XP record not found" });
    }
    
    if (xpRecord.totalXp < FREEZE_COST) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Not enough XP. Need ${FREEZE_COST} XP.` });
    }
    
    // Deduct XP and grant freeze
    await db.update(learnerXp)
      .set({
        totalXp: xpRecord.totalXp - FREEZE_COST,
        streakFreezeAvailable: true,
      })
      .where(eq(learnerXp.userId, userId));
    
    // Log the transaction
    await db.insert(xpTransactions).values({
      userId,
      amount: -FREEZE_COST,
      reason: "milestone_bonus", // streak freeze purchase
      description: "Purchased streak freeze",
    });
    
    return {
      success: true,
      xpSpent: FREEZE_COST,
      newTotalXp: xpRecord.totalXp - FREEZE_COST,
    };
  }),
  // ============================================
  // Sprint 34: User Profile Endpoints
  // ============================================

  // Get user profile by ID
  getUserProfile: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { userId } = input;
      
      // Get user info
      const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const user = userList[0];
      
      if (!user) {
        return null;
      }
      
      // Get XP record
      const xpRecords = await db.select().from(learnerXp).where(eq(learnerXp.userId, userId)).limit(1);
      const xpRecord = xpRecords[0];
      
      // Get badge count
      const badgeCount = await db.select({ count: sql<number>`count(*)` })
        .from(learnerBadges)
        .where(eq(learnerBadges.userId, userId));
      
      // Get user's rank
      const totalXp = xpRecord?.totalXp || 0;
      const higherRanked = await db.select({ count: sql<number>`count(*)` })
        .from(learnerXp)
        .where(sql`${learnerXp.totalXp} > ${totalXp}`);
      
      const levelInfo = getLevelForXp(totalXp);
      
      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        totalXp: xpRecord?.totalXp || 0,
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        streak: xpRecord?.currentStreak || 0,
        longestStreak: xpRecord?.longestStreak || 0,
        rank: (higherRanked[0]?.count || 0) + 1,
        badgeCount: badgeCount[0]?.count || 0,
        lessonsCompleted: 0, // TODO: Calculate from progress
        quizzesPassed: 0, // TODO: Calculate from progress
        coursesEnrolled: 0, // TODO: Calculate from enrollments
        joinedAt: user.createdAt,
      };
    }),

  // Get user's badges
  getUserBadges: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const badges = await db.select().from(learnerBadges)
        .where(eq(learnerBadges.userId, input.userId))
        .orderBy(desc(learnerBadges.awardedAt));
      
      return badges.map(b => ({
        id: b.id,
        name: b.title,
        nameFr: b.titleFr,
        description: b.description,
        icon: b.badgeType?.includes('streak') ? '🔥' : b.badgeType?.includes('xp') ? '⭐' : '🏆',
        type: b.badgeType,
        awardedAt: b.awardedAt,
      }));
    }),

  // Get user's learning history (activity heatmap data)
  getLearningHistory: protectedProcedure
    .input(z.object({ userId: z.number(), limit: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      try {
        // Get XP transactions grouped by date
        const transactions = await db.select({
          date: sql<string>`DATE(${xpTransactions.createdAt})`,
          lessonsCompleted: sql<number>`SUM(CASE WHEN ${xpTransactions.reason} = 'lesson_complete' THEN 1 ELSE 0 END)`,
          totalXp: sql<number>`SUM(${xpTransactions.amount})`,
        })
          .from(xpTransactions)
          .where(eq(xpTransactions.userId, input.userId))
          .groupBy(sql`DATE(${xpTransactions.createdAt})`)
          .orderBy(desc(sql`DATE(${xpTransactions.createdAt})`))
          .limit(input.limit);
        
        return transactions.map(t => ({
          date: t.date,
          lessonsCompleted: Number(t.lessonsCompleted) || 0,
          totalXp: Number(t.totalXp) || 0,
        }));
      } catch (error) {
        // Table may not exist yet, return empty array
        console.log("[Gamification] getLearningHistory - table may not exist:", error);
        return [];
      }
    }),
});

