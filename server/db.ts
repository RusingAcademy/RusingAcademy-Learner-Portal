import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  gamificationProfiles,
  lessonProgress,
  quizAttempts,
  userBadges,
  pathEnrollments,
  activityLog,
  notifications,
  weeklyChallenges,
  challengeProgress,
  celebrationEvents,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/* ─────────────── GAMIFICATION PROFILE ─────────────── */

export async function getOrCreateGamificationProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(gamificationProfiles).where(eq(gamificationProfiles.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(gamificationProfiles).values({ userId });
  const created = await db.select().from(gamificationProfiles).where(eq(gamificationProfiles.userId, userId)).limit(1);
  return created[0] ?? null;
}

export async function addXp(userId: number, xpAmount: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOrCreateGamificationProfile(userId);
  if (!profile) return null;
  const newXp = profile.totalXp + xpAmount;
  const newLevel = Math.floor(newXp / 500) + 1;
  await db.update(gamificationProfiles)
    .set({ totalXp: newXp, level: newLevel })
    .where(eq(gamificationProfiles.userId, userId));
  return { totalXp: newXp, level: newLevel, xpAdded: xpAmount };
}

export async function updateStreak(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOrCreateGamificationProfile(userId);
  if (!profile) return null;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let newStreak = profile.currentStreak;
  if (profile.lastActivityDate === today) {
    return { currentStreak: newStreak, longestStreak: profile.longestStreak };
  } else if (profile.lastActivityDate === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }
  const longestStreak = Math.max(newStreak, profile.longestStreak);
  await db.update(gamificationProfiles)
    .set({ currentStreak: newStreak, longestStreak, lastActivityDate: today })
    .where(eq(gamificationProfiles.userId, userId));
  return { currentStreak: newStreak, longestStreak };
}

/* ─────────────── LESSON PROGRESS ─────────────── */

export async function getLessonProgressForUser(userId: number, programId?: string) {
  const db = await getDb();
  if (!db) return [];
  if (programId) {
    return db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.programId, programId)));
  }
  return db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
}

export async function upsertLessonProgress(data: {
  userId: number;
  programId: string;
  pathId: string;
  moduleIndex: number;
  lessonId: string;
  slotsCompleted: number[];
  isCompleted: boolean;
  xpEarned: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(lessonProgress)
    .where(and(
      eq(lessonProgress.userId, data.userId),
      eq(lessonProgress.lessonId, data.lessonId),
      eq(lessonProgress.programId, data.programId)
    )).limit(1);
  if (existing.length > 0) {
    await db.update(lessonProgress)
      .set({
        slotsCompleted: data.slotsCompleted,
        isCompleted: data.isCompleted,
        xpEarned: data.xpEarned,
        completedAt: data.isCompleted ? new Date() : undefined,
      })
      .where(eq(lessonProgress.id, existing[0].id));
    return { ...existing[0], ...data };
  }
  await db.insert(lessonProgress).values({
    ...data,
    completedAt: data.isCompleted ? new Date() : undefined,
  });
  return data;
}

/* ─────────────── QUIZ ATTEMPTS ─────────────── */

export async function saveQuizAttempt(data: {
  userId: number;
  programId: string;
  pathId: string;
  lessonId?: string;
  quizType: "formative" | "summative" | "final_exam";
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers?: Record<string, string>;
  xpEarned: number;
  isPerfect: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(quizAttempts)
    .where(and(
      eq(quizAttempts.userId, data.userId),
      eq(quizAttempts.programId, data.programId),
      data.lessonId ? eq(quizAttempts.lessonId, data.lessonId) : sql`1=1`,
      eq(quizAttempts.quizType, data.quizType)
    ));
  const attemptNumber = (countResult[0]?.count ?? 0) + 1;
  await db.insert(quizAttempts).values({ ...data, attemptNumber });
  return { ...data, attemptNumber };
}

export async function getQuizAttemptsForUser(userId: number, programId?: string) {
  const db = await getDb();
  if (!db) return [];
  if (programId) {
    return db.select().from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.programId, programId)))
      .orderBy(desc(quizAttempts.completedAt));
  }
  return db.select().from(quizAttempts)
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.completedAt));
}

/* ─────────────── BADGES ─────────────── */

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userBadges)
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.earnedAt));
}

export async function awardBadge(data: {
  userId: number;
  badgeId: string;
  badgeName: string;
  badgeDescription?: string;
  badgeIcon: string;
  badgeColor: string;
  xpReward: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(userBadges)
    .where(and(eq(userBadges.userId, data.userId), eq(userBadges.badgeId, data.badgeId)))
    .limit(1);
  if (existing.length > 0) return null; // already has badge
  await db.insert(userBadges).values(data);
  return data;
}

/* ─────────────── PATH ENROLLMENTS ─────────────── */

export async function getPathEnrollments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pathEnrollments).where(eq(pathEnrollments.userId, userId));
}

export async function enrollInPath(userId: number, programId: string, pathId: string) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(pathEnrollments)
    .where(and(
      eq(pathEnrollments.userId, userId),
      eq(pathEnrollments.programId, programId),
      eq(pathEnrollments.pathId, pathId)
    )).limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(pathEnrollments).values({ userId, programId, pathId });
  const created = await db.select().from(pathEnrollments)
    .where(and(
      eq(pathEnrollments.userId, userId),
      eq(pathEnrollments.programId, programId),
      eq(pathEnrollments.pathId, pathId)
    )).limit(1);
  return created[0] ?? null;
}

export async function updatePathProgress(userId: number, programId: string, pathId: string, progressPercent: number) {
  const db = await getDb();
  if (!db) return;
  const status = progressPercent >= 100 ? "completed" as const : "in_progress" as const;
  await db.update(pathEnrollments)
    .set({
      progressPercent,
      status,
      completedAt: progressPercent >= 100 ? new Date() : undefined,
    })
    .where(and(
      eq(pathEnrollments.userId, userId),
      eq(pathEnrollments.programId, programId),
      eq(pathEnrollments.pathId, pathId)
    ));
}

/* ─────────────── ACTIVITY LOG ─────────────── */

export async function logActivity(data: {
  userId: number;
  activityType: "lesson_started" | "lesson_completed" | "slot_completed" | "quiz_completed" | "badge_earned" | "streak_milestone" | "path_enrolled" | "path_completed" | "login";
  programId?: string;
  pathId?: string;
  lessonId?: string;
  metadata?: Record<string, unknown>;
  xpEarned?: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLog).values({
    ...data,
    xpEarned: data.xpEarned ?? 0,
  });
}

export async function getRecentActivity(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog)
    .where(eq(activityLog.userId, userId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

/* ─────────────── NOTIFICATIONS ─────────────── */

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function createNotification(data: {
  userId: number;
  title: string;
  message: string;
  type?: "info" | "achievement" | "reminder" | "system";
  link?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({
    ...data,
    type: data.type ?? "info",
  });
}

/* ─────────────── WEEKLY CHALLENGES ─────────────── */

export async function getActiveChallenges() {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().slice(0, 10);
  return db.select().from(weeklyChallenges)
    .where(and(
      eq(weeklyChallenges.isActive, true),
      lte(weeklyChallenges.weekStartDate, today),
      gte(weeklyChallenges.weekEndDate, today)
    ))
    .orderBy(desc(weeklyChallenges.createdAt));
}

export async function getAllChallenges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyChallenges).orderBy(desc(weeklyChallenges.createdAt));
}

export async function createChallenge(data: {
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  challengeType: "complete_lessons" | "earn_xp" | "perfect_quizzes" | "maintain_streak" | "complete_slots" | "study_time";
  targetValue: number;
  xpReward: number;
  badgeReward?: string;
  weekStartDate: string;
  weekEndDate: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(weeklyChallenges).values(data);
  return data;
}

export async function getUserChallengeProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    progress: challengeProgress,
    challenge: weeklyChallenges,
  })
    .from(challengeProgress)
    .innerJoin(weeklyChallenges, eq(weeklyChallenges.id, challengeProgress.challengeId))
    .where(eq(challengeProgress.userId, userId))
    .orderBy(desc(challengeProgress.updatedAt));
}

export async function upsertChallengeProgress(userId: number, challengeId: number, increment: number) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(challengeProgress)
    .where(and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    )).limit(1);

  if (existing.length > 0) {
    const record = existing[0];
    if (record.isCompleted) return record;
    const newValue = record.currentValue + increment;
    // Check if challenge is now completed
    const challenge = await db.select().from(weeklyChallenges)
      .where(eq(weeklyChallenges.id, challengeId)).limit(1);
    const isNowComplete = challenge[0] ? newValue >= challenge[0].targetValue : false;
    await db.update(challengeProgress)
      .set({
        currentValue: newValue,
        isCompleted: isNowComplete,
        completedAt: isNowComplete ? new Date() : undefined,
      })
      .where(eq(challengeProgress.id, record.id));
    return { ...record, currentValue: newValue, isCompleted: isNowComplete };
  }

  // Create new progress entry
  await db.insert(challengeProgress).values({ userId, challengeId, currentValue: increment });
  const created = await db.select().from(challengeProgress)
    .where(and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    )).limit(1);
  return created[0] ?? null;
}

export async function initChallengeProgressForUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  const active = await getActiveChallenges();
  for (const challenge of active) {
    const existing = await db.select().from(challengeProgress)
      .where(and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.challengeId, challenge.id)
      )).limit(1);
    if (existing.length === 0) {
      await db.insert(challengeProgress).values({ userId, challengeId: challenge.id, currentValue: 0 });
    }
  }
}

/* ─────────────── CELEBRATION EVENTS ─────────────── */

export async function createCelebration(data: {
  userId: number;
  eventType: "level_up" | "badge_earned" | "challenge_completed" | "streak_milestone" | "path_completed" | "perfect_quiz" | "first_lesson";
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(celebrationEvents).values(data);
  return data;
}

export async function getUnseenCelebrations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(celebrationEvents)
    .where(and(
      eq(celebrationEvents.userId, userId),
      eq(celebrationEvents.seen, false)
    ))
    .orderBy(desc(celebrationEvents.createdAt))
    .limit(10);
}

export async function markCelebrationSeen(celebrationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(celebrationEvents)
    .set({ seen: true })
    .where(and(
      eq(celebrationEvents.id, celebrationId),
      eq(celebrationEvents.userId, userId)
    ));
}

export async function markAllCelebrationsSeen(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(celebrationEvents)
    .set({ seen: true })
    .where(and(
      eq(celebrationEvents.userId, userId),
      eq(celebrationEvents.seen, false)
    ));
}

/* ─────────────── LEADERBOARD (Enhanced) ─────────────── */

export async function getLeaderboard(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    userId: gamificationProfiles.userId,
    totalXp: gamificationProfiles.totalXp,
    level: gamificationProfiles.level,
    currentStreak: gamificationProfiles.currentStreak,
    longestStreak: gamificationProfiles.longestStreak,
    lessonsCompleted: gamificationProfiles.lessonsCompleted,
    quizzesCompleted: gamificationProfiles.quizzesCompleted,
    perfectQuizzes: gamificationProfiles.perfectQuizzes,
    userName: users.name,
    avatarUrl: users.avatarUrl,
  })
    .from(gamificationProfiles)
    .leftJoin(users, eq(users.id, gamificationProfiles.userId))
    .orderBy(desc(gamificationProfiles.totalXp))
    .limit(limit);
}


/* ─────────────── ADMIN: USER MANAGEMENT ─────────────── */

export async function getAllUsers(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    preferredLanguage: users.preferredLanguage,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.lastSignedIn)).limit(limit);
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return { userId, role };
}

/* ─────────────── ADMIN: ANALYTICS ─────────────── */

export async function getAnalyticsOverview() {
  const db = await getDb();
  if (!db) return null;
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [lessonCount] = await db.select({ count: sql<number>`count(*)` }).from(lessonProgress).where(eq(lessonProgress.isCompleted, true));
  const [quizCount] = await db.select({ count: sql<number>`count(*)` }).from(quizAttempts);
  const [enrollmentCount] = await db.select({ count: sql<number>`count(*)` }).from(pathEnrollments);
  const [activityCount] = await db.select({ count: sql<number>`count(*)` }).from(activityLog);
  const [avgScore] = await db.select({ avg: sql<number>`COALESCE(AVG(score), 0)` }).from(quizAttempts);
  const [perfectCount] = await db.select({ count: sql<number>`count(*)` }).from(quizAttempts).where(eq(quizAttempts.isPerfect, true));

  // Recent signups (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recentSignups] = await db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.createdAt} >= ${sevenDaysAgo}`);

  // Active users (last 7 days)
  const [activeUsers] = await db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.lastSignedIn} >= ${sevenDaysAgo}`);

  return {
    totalUsers: userCount?.count ?? 0,
    totalLessonsCompleted: lessonCount?.count ?? 0,
    totalQuizAttempts: quizCount?.count ?? 0,
    totalEnrollments: enrollmentCount?.count ?? 0,
    totalActivities: activityCount?.count ?? 0,
    averageQuizScore: Math.round(avgScore?.avg ?? 0),
    perfectQuizCount: perfectCount?.count ?? 0,
    recentSignups: recentSignups?.count ?? 0,
    activeUsersLast7Days: activeUsers?.count ?? 0,
  };
}

export async function getRecentSignups(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.createdAt)).limit(limit);
}

export async function getActivityTimeline(days = 14) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db.select({
    date: sql<string>`DATE(${activityLog.createdAt})`.as("date"),
    count: sql<number>`count(*)`.as("count"),
    type: activityLog.activityType,
  })
    .from(activityLog)
    .where(sql`${activityLog.createdAt} >= ${startDate}`)
    .groupBy(sql`DATE(${activityLog.createdAt})`, activityLog.activityType)
    .orderBy(sql`DATE(${activityLog.createdAt})`);
}

/* ─────────────── ADMIN: CHALLENGE MANAGEMENT ─────────────── */

export async function updateChallenge(challengeId: number, data: { isActive?: boolean; targetValue?: number; xpReward?: number }) {
  const db = await getDb();
  if (!db) return null;
  await db.update(weeklyChallenges).set(data).where(eq(weeklyChallenges.id, challengeId));
  return { challengeId, ...data };
}

/* ─────────────── ADMIN: ANNOUNCEMENTS ─────────────── */

export async function createAnnouncement(data: {
  title: string; message: string; targetUserIds?: number[];
}) {
  const db = await getDb();
  if (!db) return null;
  // If targetUserIds specified, create individual notifications
  const userIds = data.targetUserIds;
  if (userIds && userIds.length > 0) {
    for (const userId of userIds) {
      await db.insert(notifications).values({
        userId, title: data.title, message: data.message, type: "system",
      });
    }
    return { sent: userIds.length };
  }
  // Otherwise broadcast to all users
  const allUsers = await db.select({ id: users.id }).from(users);
  for (const u of allUsers) {
    await db.insert(notifications).values({
      userId: u.id, title: data.title, message: data.message, type: "system",
    });
  }
  return { sent: allUsers.length };
}
