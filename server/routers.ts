import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { gamificationProfiles, users } from "../drizzle/schema";
import { desc, eq, sql } from "drizzle-orm";

/* Badge definitions */
const BADGE_DEFS: Record<string, { name: string; description: string; icon: string; color: string; xp: number }> = {
  first_lesson: { name: "First Steps", description: "Complete your first lesson", icon: "school", color: "#008090", xp: 50 },
  five_lessons: { name: "Dedicated Learner", description: "Complete 5 lessons", icon: "auto_stories", color: "#f5a623", xp: 100 },
  ten_lessons: { name: "Knowledge Seeker", description: "Complete 10 lessons", icon: "psychology", color: "#e74c3c", xp: 200 },
  twenty_five_lessons: { name: "Scholar", description: "Complete 25 lessons", icon: "workspace_premium", color: "#9b59b6", xp: 500 },
  first_quiz: { name: "Quiz Taker", description: "Complete your first quiz", icon: "quiz", color: "#3498db", xp: 50 },
  perfect_quiz: { name: "Perfectionist", description: "Score 100% on a quiz", icon: "emoji_events", color: "#f5a623", xp: 150 },
  five_perfect: { name: "Quiz Master", description: "Score 100% on 5 quizzes", icon: "military_tech", color: "#e74c3c", xp: 300 },
  streak_3: { name: "On Fire", description: "3-day learning streak", icon: "local_fire_department", color: "#e67e22", xp: 75 },
  streak_7: { name: "Week Warrior", description: "7-day learning streak", icon: "whatshot", color: "#e74c3c", xp: 200 },
  streak_30: { name: "Monthly Champion", description: "30-day learning streak", icon: "diamond", color: "#f5a623", xp: 1000 },
  path_complete: { name: "Path Pioneer", description: "Complete an entire Path", icon: "flag", color: "#27ae60", xp: 500 },
  first_enrollment: { name: "Adventurer", description: "Enroll in your first Path", icon: "explore", color: "#008090", xp: 25 },
};

async function checkAndAwardBadges(userId: number, profile: NonNullable<Awaited<ReturnType<typeof db.getOrCreateGamificationProfile>>>) {
  const awarded: string[] = [];
  const checks = [
    { id: "first_lesson", condition: profile.lessonsCompleted >= 1 },
    { id: "five_lessons", condition: profile.lessonsCompleted >= 5 },
    { id: "ten_lessons", condition: profile.lessonsCompleted >= 10 },
    { id: "twenty_five_lessons", condition: profile.lessonsCompleted >= 25 },
    { id: "first_quiz", condition: profile.quizzesCompleted >= 1 },
    { id: "perfect_quiz", condition: profile.perfectQuizzes >= 1 },
    { id: "five_perfect", condition: profile.perfectQuizzes >= 5 },
    { id: "streak_3", condition: profile.currentStreak >= 3 },
    { id: "streak_7", condition: profile.currentStreak >= 7 },
    { id: "streak_30", condition: profile.currentStreak >= 30 },
  ];
  for (const check of checks) {
    if (check.condition) {
      const def = BADGE_DEFS[check.id];
      if (!def) continue;
      const result = await db.awardBadge({
        userId, badgeId: check.id, badgeName: def.name,
        badgeDescription: def.description, badgeIcon: def.icon,
        badgeColor: def.color, xpReward: def.xp,
      });
      if (result) {
        awarded.push(check.id);
        await db.addXp(userId, def.xp);
        await db.createNotification({
          userId, title: `Badge Earned: ${def.name}`,
          message: `${def.description} (+${def.xp} XP)`, type: "achievement",
        });
        await db.logActivity({ userId, activityType: "badge_earned", metadata: { badgeId: check.id }, xpEarned: def.xp });
      }
    }
  }
  return awarded;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  gamification: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getOrCreateGamificationProfile(ctx.user.id);
      const badges = await db.getUserBadges(ctx.user.id);
      return { profile, badges };
    }),
    addXp: protectedProcedure
      .input(z.object({ amount: z.number().min(1).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.addXp(ctx.user.id, input.amount);
        await db.updateStreak(ctx.user.id);
        const profile = await db.getOrCreateGamificationProfile(ctx.user.id);
        if (profile) await checkAndAwardBadges(ctx.user.id, profile);
        return result;
      }),
    getLeaderboard: publicProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      return dbInstance
        .select({
          userId: gamificationProfiles.userId, totalXp: gamificationProfiles.totalXp,
          level: gamificationProfiles.level, currentStreak: gamificationProfiles.currentStreak,
          lessonsCompleted: gamificationProfiles.lessonsCompleted, userName: users.name,
        })
        .from(gamificationProfiles)
        .leftJoin(users, eq(users.id, gamificationProfiles.userId))
        .orderBy(desc(gamificationProfiles.totalXp))
        .limit(20);
    }),
  }),

  progress: router({
    getLessonProgress: protectedProcedure
      .input(z.object({ programId: z.string().optional() }))
      .query(async ({ ctx, input }) => db.getLessonProgressForUser(ctx.user.id, input.programId)),
    updateLessonProgress: protectedProcedure
      .input(z.object({
        programId: z.string(), pathId: z.string(), moduleIndex: z.number(),
        lessonId: z.string(), slotsCompleted: z.array(z.number()), isCompleted: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const xpPerSlot = 15;
        const completionBonus = input.isCompleted ? 50 : 0;
        const xpEarned = input.slotsCompleted.length * xpPerSlot + completionBonus;
        const result = await db.upsertLessonProgress({ userId: ctx.user.id, ...input, xpEarned });
        if (xpEarned > 0) await db.addXp(ctx.user.id, xpEarned);
        await db.updateStreak(ctx.user.id);
        if (input.isCompleted) {
          const dbInstance = await db.getDb();
          if (dbInstance) {
            await dbInstance.update(gamificationProfiles)
              .set({ lessonsCompleted: sql`lessonsCompleted + 1` })
              .where(eq(gamificationProfiles.userId, ctx.user.id));
          }
          await db.logActivity({ userId: ctx.user.id, activityType: "lesson_completed", programId: input.programId, pathId: input.pathId, lessonId: input.lessonId, xpEarned });
          const profile = await db.getOrCreateGamificationProfile(ctx.user.id);
          if (profile) await checkAndAwardBadges(ctx.user.id, profile);
        } else {
          await db.logActivity({ userId: ctx.user.id, activityType: "slot_completed", programId: input.programId, pathId: input.pathId, lessonId: input.lessonId, xpEarned });
        }
        return { result, xpEarned };
      }),
    getPathEnrollments: protectedProcedure.query(async ({ ctx }) => db.getPathEnrollments(ctx.user.id)),
    enrollInPath: protectedProcedure
      .input(z.object({ programId: z.string(), pathId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const enrollment = await db.enrollInPath(ctx.user.id, input.programId, input.pathId);
        await db.logActivity({ userId: ctx.user.id, activityType: "path_enrolled", programId: input.programId, pathId: input.pathId, xpEarned: 25 });
        await db.addXp(ctx.user.id, 25);
        const profile = await db.getOrCreateGamificationProfile(ctx.user.id);
        if (profile) await checkAndAwardBadges(ctx.user.id, profile);
        return enrollment;
      }),
  }),

  quiz: router({
    submitAttempt: protectedProcedure
      .input(z.object({
        programId: z.string(), pathId: z.string(), lessonId: z.string().optional(),
        quizType: z.enum(["formative", "summative", "final_exam"]),
        totalQuestions: z.number(), correctAnswers: z.number(), score: z.number(),
        answers: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const isPerfect = input.score === 100;
        const xpEarned = Math.round(input.score * 0.5) + (isPerfect ? 100 : 0);
        const result = await db.saveQuizAttempt({ userId: ctx.user.id, ...input, answers: input.answers as Record<string, string> | undefined, xpEarned, isPerfect });
        await db.addXp(ctx.user.id, xpEarned);
        await db.updateStreak(ctx.user.id);
        const dbInstance = await db.getDb();
        if (dbInstance) {
          const updates: Record<string, unknown> = { quizzesCompleted: sql`quizzesCompleted + 1` };
          if (isPerfect) updates.perfectQuizzes = sql`perfectQuizzes + 1`;
          await dbInstance.update(gamificationProfiles).set(updates).where(eq(gamificationProfiles.userId, ctx.user.id));
        }
        await db.logActivity({ userId: ctx.user.id, activityType: "quiz_completed", programId: input.programId, pathId: input.pathId, lessonId: input.lessonId, metadata: { score: input.score, isPerfect }, xpEarned });
        const profile = await db.getOrCreateGamificationProfile(ctx.user.id);
        if (profile) await checkAndAwardBadges(ctx.user.id, profile);
        return { ...result, xpEarned, isPerfect };
      }),
    getAttempts: protectedProcedure
      .input(z.object({ programId: z.string().optional() }))
      .query(async ({ ctx, input }) => db.getQuizAttemptsForUser(ctx.user.id, input.programId)),
  }),

  activity: router({
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional() }))
      .query(async ({ ctx, input }) => db.getRecentActivity(ctx.user.id, input.limit ?? 20)),
  }),

  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional() }))
      .query(async ({ ctx, input }) => db.getUserNotifications(ctx.user.id, input.limit ?? 50)),
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationRead(input.notificationId, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
