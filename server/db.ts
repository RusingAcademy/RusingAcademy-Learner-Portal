import { eq, and, desc, sql } from "drizzle-orm";
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
