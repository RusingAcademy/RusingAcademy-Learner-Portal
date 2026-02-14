import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import * as db from "./db";
import { notesRouter, flashcardsRouter, studyPlannerRouter, vocabularyRouter } from "./routers-sprint17";
import { aiVocabularyRouter, dailyGoalsRouter, discussionsRouter, writingRouter, recommendationsRouter } from "./routers-sprint22";
import { certificateRouter, readingLabRouter, listeningLabRouter, grammarDrillsRouter, peerReviewRouter } from "./routers-sprint31";
import { mockSleRouter, coachRouter, studyGroupRouter, bookmarkRouter, dictationRouter, searchRouter, onboardingRouter, dailyReviewRouter } from "./routers-sprint41";
import * as adminDb from "./db-admin";
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
  challenge_champion: { name: "Challenge Champion", description: "Complete a weekly challenge", icon: "emoji_events", color: "#f59e0b", xp: 250 },
  five_challenges: { name: "Challenge Master", description: "Complete 5 weekly challenges", icon: "military_tech", color: "#8b5cf6", xp: 500 },
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
        // Create celebration event for badge
        await db.createCelebration({ userId, eventType: "badge_earned", metadata: { badgeId: check.id, badgeName: def.name, badgeIcon: def.icon, badgeColor: def.color } });
      }
    }
  }
  return awarded;
}

/** Helper: update active challenge progress after user actions */
async function updateChallengeProgress(userId: number, challengeType: string, increment: number) {
  const activeChallenges = await db.getActiveChallenges();
  for (const challenge of activeChallenges) {
    if (challenge.challengeType === challengeType) {
      const result = await db.upsertChallengeProgress(userId, challenge.id, increment);
      if (result && typeof result === "object" && "isCompleted" in result && result.isCompleted) {
        // Award XP and create celebration
        await db.addXp(userId, challenge.xpReward);
        await db.createCelebration({
          userId,
          eventType: "challenge_completed",
          metadata: { challengeId: challenge.id, title: challenge.title, xpReward: challenge.xpReward },
        });
        await db.createNotification({
          userId,
          title: `Challenge Completed: ${challenge.title}`,
          message: `You earned ${challenge.xpReward} XP! Great work!`,
          type: "achievement",
        });
      }
    }
  }
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
        const oldProfile = await db.getOrCreateGamificationProfile(ctx.user.id);
        const oldLevel = oldProfile?.level ?? 1;
        const result = await db.addXp(ctx.user.id, input.amount);
        await db.updateStreak(ctx.user.id);
        const profile = await db.getOrCreateGamificationProfile(ctx.user.id);
        // Check for level up celebration
        if (profile && profile.level > oldLevel) {
          await db.createCelebration({
            userId: ctx.user.id,
            eventType: "level_up",
            metadata: { oldLevel, newLevel: profile.level },
          });
        }
        if (profile) await checkAndAwardBadges(ctx.user.id, profile);
        // Update earn_xp challenges
        await updateChallengeProgress(ctx.user.id, "earn_xp", input.amount);
        return result;
      }),
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
      .query(async ({ input }) => {
        return db.getLeaderboard(input?.limit ?? 20);
      }),
  }),

  challenges: router({
    getActive: protectedProcedure.query(async ({ ctx }) => {
      await db.initChallengeProgressForUser(ctx.user.id);
      const challenges = await db.getActiveChallenges();
      const progress = await db.getUserChallengeProgress(ctx.user.id);
      return challenges.map(c => {
        const p = progress.find(p => p.progress.challengeId === c.id);
        return {
          ...c,
          currentValue: p?.progress.currentValue ?? 0,
          isCompleted: p?.progress.isCompleted ?? false,
          completedAt: p?.progress.completedAt ?? null,
        };
      });
    }),
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserChallengeProgress(ctx.user.id);
    }),
    // Admin: create a new weekly challenge
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        titleFr: z.string().min(1),
        description: z.string().min(1),
        descriptionFr: z.string().min(1),
        challengeType: z.enum(["complete_lessons", "earn_xp", "perfect_quizzes", "maintain_streak", "complete_slots", "study_time"]),
        targetValue: z.number().min(1),
        xpReward: z.number().min(1).default(200),
        badgeReward: z.string().optional(),
        weekStartDate: z.string(),
        weekEndDate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Admin only");
        return db.createChallenge(input);
      }),
  }),

  celebrations: router({
    getUnseen: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnseenCelebrations(ctx.user.id);
    }),
    markSeen: protectedProcedure
      .input(z.object({ celebrationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markCelebrationSeen(input.celebrationId, ctx.user.id);
        return { success: true };
      }),
    markAllSeen: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllCelebrationsSeen(ctx.user.id);
      return { success: true };
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
          if (profile) {
            await checkAndAwardBadges(ctx.user.id, profile);
            // First lesson celebration
            if (profile.lessonsCompleted === 1) {
              await db.createCelebration({ userId: ctx.user.id, eventType: "first_lesson", metadata: { lessonId: input.lessonId } });
            }
          }
          // Update lesson challenges
          await updateChallengeProgress(ctx.user.id, "complete_lessons", 1);
        } else {
          await db.logActivity({ userId: ctx.user.id, activityType: "slot_completed", programId: input.programId, pathId: input.pathId, lessonId: input.lessonId, xpEarned });
          // Update slot challenges
          await updateChallengeProgress(ctx.user.id, "complete_slots", 1);
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
        // Perfect quiz celebration
        if (isPerfect) {
          await db.createCelebration({ userId: ctx.user.id, eventType: "perfect_quiz", metadata: { score: input.score, lessonId: input.lessonId } });
          await updateChallengeProgress(ctx.user.id, "perfect_quizzes", 1);
        }
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

  ai: router({
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = {
          role: "system" as const,
          content: `You are the RusingÂcademy AI Language Coach — a bilingual (English/French) assistant specialized in helping Canadian public servants prepare for their Second Language Evaluation (SLE). You provide:
- Grammar explanations and corrections in both English and French
- SLE exam tips and strategies for Reading, Writing, and Oral components
- Vocabulary building exercises relevant to the federal public service
- Practice questions at levels A, B, and C
- Encouragement and motivation for language learners

Always be professional, supportive, and pedagogically sound. When the user writes in French, respond in French. When they write in English, respond in English. If they ask you to switch languages, do so naturally.`,
        };
        const msgs = [systemPrompt, ...input.messages.filter(m => m.role !== "system")];
        try {
          const response = await invokeLLM({ messages: msgs });
          const rawContent = response.choices?.[0]?.message?.content;
          const content = typeof rawContent === "string" ? rawContent : "I'm sorry, I couldn't generate a response. Please try again.";
          return { content };
        } catch (err) {
          console.error("AI chat error:", err);
          return { content: "I'm temporarily unavailable. Please try again in a moment." };
        }
      }),

    getRecommendations: protectedProcedure
      .query(async ({ ctx }) => {
        const profile = await db.getOrCreateGamificationProfile(ctx.user.id);
        const recentActivity = await db.getRecentActivity(ctx.user.id, 10);
        const lessonsCompleted = profile?.lessonsCompleted ?? 0;
        const quizzesPassed = profile?.quizzesCompleted ?? 0;
        const streak = profile?.currentStreak ?? 0;

        const recommendations: { title: string; description: string; icon: string; link: string; priority: number }[] = [];

        if (lessonsCompleted === 0) {
          recommendations.push({ title: "Start Your First Lesson", description: "Begin your language learning journey with Path I.", icon: "play_circle", link: "/programs", priority: 1 });
        }
        if (streak === 0) {
          recommendations.push({ title: "Build a Streak", description: "Complete a lesson today to start your daily streak!", icon: "local_fire_department", link: "/programs", priority: 2 });
        }
        if (quizzesPassed < 3) {
          recommendations.push({ title: "Take a Quiz", description: "Test your knowledge and earn XP with a quiz.", icon: "quiz", link: "/programs", priority: 3 });
        }
        if (lessonsCompleted >= 5 && quizzesPassed >= 2) {
          recommendations.push({ title: "Try SLE Practice", description: "You're ready to practice for your SLE exam!", icon: "school", link: "/sle-practice", priority: 2 });
        }
        recommendations.push({ title: "Weekly Challenges", description: "Complete challenges for bonus XP and badges.", icon: "flag", link: "/challenges", priority: 4 });
        recommendations.push({ title: "Check Leaderboard", description: "See how you rank among fellow learners.", icon: "leaderboard", link: "/leaderboard", priority: 5 });

        return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 4);
      }),
  }),

  notes: notesRouter,
  flashcards: flashcardsRouter,
  studyPlanner: studyPlannerRouter,
  vocabulary: vocabularyRouter,
  aiVocabulary: aiVocabularyRouter,
  dailyGoals: dailyGoalsRouter,
  discussions: discussionsRouter,
  writing: writingRouter,
  recommendations: recommendationsRouter,
  certificates: certificateRouter,
  readingLab: readingLabRouter,
  listeningLab: listeningLabRouter,
  grammarDrills: grammarDrillsRouter,
  peerReview: peerReviewRouter,

  // Sprint 41-50
  mockSle: mockSleRouter,
  coach: coachRouter,
  studyGroups: studyGroupRouter,
  bookmarks: bookmarkRouter,
  dictation: dictationRouter,
  search: searchRouter,
  onboarding: onboardingRouter,
  dailyReview: dailyReviewRouter,

  admin: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAnalyticsOverview();
    }),
    users: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(500).optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.getAllUsers(input.limit ?? 200);
      }),
    updateUserRole: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.updateUserRole(input.userId, input.role);
      }),
    recentSignups: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.getRecentSignups(input.limit ?? 10);
      }),
    activityTimeline: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(90).optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.getActivityTimeline(input.days ?? 14);
      }),
    challenges: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAllChallenges();
    }),
    createChallenge: protectedProcedure
      .input(z.object({
        title: z.string(), titleFr: z.string(),
        description: z.string(), descriptionFr: z.string(),
        challengeType: z.enum(["complete_lessons", "earn_xp", "perfect_quizzes", "maintain_streak", "complete_slots", "study_time"]),
        targetValue: z.number(), xpReward: z.number(),
        weekStartDate: z.string(), weekEndDate: z.string(),
        badgeReward: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.createChallenge(input);
      }),
    updateChallenge: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        isActive: z.boolean().optional(),
        targetValue: z.number().optional(),
        xpReward: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { challengeId, ...data } = input;
        return db.updateChallenge(challengeId, data);
      }),
    sendAnnouncement: protectedProcedure
      .input(z.object({
        title: z.string(), message: z.string(),
        targetUserIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.createAnnouncement(input);
      }),

    /* ═══ Sprint 2: Coach Hub & Commission ═══ */
    coachApplications: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.getCoachApplications(input.status);
      }),
    updateApplicationStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.string(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.updateApplicationStatus(input.id, input.status, ctx.user.id, input.notes);
      }),
    coachProfiles: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.getCoachProfiles(input.status);
      }),
    suspendCoach: protectedProcedure
      .input(z.object({ coachId: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.suspendCoach(input.coachId, input.reason);
      }),
    reactivateCoach: protectedProcedure
      .input(z.object({ coachId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.reactivateCoach(input.coachId);
      }),
    coachLifecycleStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getCoachLifecycleStats();
    }),
    commissionTiers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getCommissionTiers();
    }),
    createCommissionTier: protectedProcedure
      .input(z.object({ name: z.string(), description: z.string().optional(), commissionRate: z.number(), minStudents: z.number().optional(), maxStudents: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.createCommissionTier(input);
      }),
    updateCommissionTier: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), commissionRate: z.number().optional(), isActive: z.boolean().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.updateCommissionTier(input.id, input);
      }),
    coachPayouts: protectedProcedure
      .input(z.object({ coachId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.getCoachPayouts(input.coachId);
      }),
    commissionAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getCommissionAnalytics();
    }),

    /* ═══ Sprint 4: Executive Summary ═══ */
    executiveKPIs: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getExecutiveKPIs();
    }),
    platformHealth: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getPlatformHealth();
    }),
    revenueTrend: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getRevenueTrend();
    }),
    topPerformers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getTopPerformers();
    }),
    recentActivity: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getRecentAdminActivity();
    }),

    /* ═══ Sprint 5: Content Pipeline ═══ */
    contentPipelineStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getContentPipelineStats();
    }),
    contentPipelineItems: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.getContentPipelineItems(input.status);
      }),
    updateContentStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.updateContentItemStatus(input.id, input.status, ctx.user.id);
      }),
    contentCalendar: protectedProcedure
      .input(z.object({ startDate: z.string().optional(), endDate: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.getContentCalendarEntries(
          input.startDate ? new Date(input.startDate) : undefined,
          input.endDate ? new Date(input.endDate) : undefined
        );
      }),
    contentQualityScores: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getContentQualityScores();
    }),
    contentTemplates: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return adminDb.getContentTemplatesList();
    }),
    createContentItem: protectedProcedure
      .input(z.object({ title: z.string(), titleFr: z.string().optional(), contentType: z.string(), body: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return adminDb.createContentItem({ ...input, authorId: ctx.user.id });
      }),
  }),
});

export type AppRouter = typeof appRouter;
