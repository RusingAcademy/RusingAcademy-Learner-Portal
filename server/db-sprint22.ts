/**
 * DB Helpers — Sprints 22-30
 * Daily Study Goals, Discussion Threads/Replies, Writing Submissions
 */
import { eq, and, desc, sql, asc } from "drizzle-orm";
import { getDb } from "./db";
import {
  dailyStudyGoals, discussionThreads, discussionReplies, writingSubmissions,
} from "../drizzle/schema";

/* ─────────────── DAILY STUDY GOALS ─────────────── */

export async function getOrCreateDailyGoal(userId: number, date: string) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db
    .select()
    .from(dailyStudyGoals)
    .where(and(eq(dailyStudyGoals.userId, userId), eq(dailyStudyGoals.date, date)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(dailyStudyGoals).values({ userId, date });
  const created = await db
    .select()
    .from(dailyStudyGoals)
    .where(and(eq(dailyStudyGoals.userId, userId), eq(dailyStudyGoals.date, date)))
    .limit(1);
  return created[0] ?? null;
}

export async function updateDailyGoal(userId: number, date: string, data: {
  xpEarned?: number; lessonsCompleted?: number; studyMinutesActual?: number;
  xpTarget?: number; lessonsTarget?: number; studyMinutesTarget?: number;
  isGoalMet?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.update(dailyStudyGoals)
    .set(data)
    .where(and(eq(dailyStudyGoals.userId, userId), eq(dailyStudyGoals.date, date)));
  return getOrCreateDailyGoal(userId, date);
}

export async function getDailyGoalHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailyStudyGoals)
    .where(eq(dailyStudyGoals.userId, userId))
    .orderBy(desc(dailyStudyGoals.date))
    .limit(days);
}

export async function getStreakInfo(userId: number) {
  const db = await getDb();
  if (!db) return { currentStreak: 0, multiplier: 100, recentGoals: [] };
  const goals = await db
    .select()
    .from(dailyStudyGoals)
    .where(eq(dailyStudyGoals.userId, userId))
    .orderBy(desc(dailyStudyGoals.date))
    .limit(60);
  let currentStreak = 0;
  const today = new Date().toISOString().slice(0, 10);
  for (const g of goals) {
    if (g.isGoalMet || g.xpEarned > 0) {
      currentStreak++;
    } else if (g.date !== today) {
      break;
    }
  }
  const multiplier = currentStreak >= 30 ? 200 : currentStreak >= 14 ? 175 : currentStreak >= 7 ? 150 : currentStreak >= 3 ? 125 : 100;
  return { currentStreak, multiplier, recentGoals: goals.slice(0, 30) };
}

/* ─────────────── DISCUSSION THREADS ─────────────── */

export async function createThread(userId: number, data: {
  title: string; content: string; category?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(discussionThreads).values({
    userId,
    title: data.title,
    content: data.content,
    category: (data.category as any) || "general",
  });
  const result = await db
    .select()
    .from(discussionThreads)
    .where(eq(discussionThreads.userId, userId))
    .orderBy(desc(discussionThreads.id))
    .limit(1);
  return result[0] ?? null;
}

export async function getThreads(opts: {
  category?: string; limit?: number; offset?: number;
} = {}) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts.limit || 20;
  const offset = opts.offset || 0;
  if (opts.category && opts.category !== "all") {
    return db.select().from(discussionThreads)
      .where(eq(discussionThreads.category, opts.category as any))
      .orderBy(desc(discussionThreads.isPinned), desc(discussionThreads.createdAt))
      .limit(limit).offset(offset);
  }
  return db.select().from(discussionThreads)
    .orderBy(desc(discussionThreads.isPinned), desc(discussionThreads.createdAt))
    .limit(limit).offset(offset);
}

export async function getThreadById(threadId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(discussionThreads)
    .set({ viewCount: sql`${discussionThreads.viewCount} + 1` })
    .where(eq(discussionThreads.id, threadId));
  const result = await db.select().from(discussionThreads).where(eq(discussionThreads.id, threadId)).limit(1);
  return result[0] ?? null;
}

export async function deleteThread(userId: number, threadId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(discussionReplies).where(eq(discussionReplies.threadId, threadId));
  await db.delete(discussionThreads).where(and(eq(discussionThreads.id, threadId), eq(discussionThreads.userId, userId)));
  return true;
}

/* ─────────────── DISCUSSION REPLIES ─────────────── */

export async function createReply(userId: number, threadId: number, data: {
  content: string; parentReplyId?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(discussionReplies).values({
    threadId,
    userId,
    content: data.content,
    parentReplyId: data.parentReplyId || null,
  });
  await db.update(discussionThreads)
    .set({
      replyCount: sql`${discussionThreads.replyCount} + 1`,
      lastReplyAt: new Date(),
    })
    .where(eq(discussionThreads.id, threadId));
  const result = await db.select().from(discussionReplies)
    .where(eq(discussionReplies.threadId, threadId))
    .orderBy(desc(discussionReplies.id))
    .limit(1);
  return result[0] ?? null;
}

export async function getThreadReplies(threadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discussionReplies)
    .where(eq(discussionReplies.threadId, threadId))
    .orderBy(asc(discussionReplies.createdAt));
}

export async function deleteReply(userId: number, replyId: number) {
  const db = await getDb();
  if (!db) return false;
  const reply = await db.select().from(discussionReplies).where(eq(discussionReplies.id, replyId)).limit(1);
  if (reply.length > 0 && reply[0].userId === userId) {
    await db.delete(discussionReplies).where(eq(discussionReplies.id, replyId));
    await db.update(discussionThreads)
      .set({ replyCount: sql`GREATEST(${discussionThreads.replyCount} - 1, 0)` })
      .where(eq(discussionThreads.id, reply[0].threadId));
    return true;
  }
  return false;
}

/* ─────────────── WRITING SUBMISSIONS ─────────────── */

export async function createWritingSubmission(userId: number, data: {
  title: string; content: string; promptText?: string;
  language?: string; cefrLevel?: string; programId?: string; pathId?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const wordCount = data.content.trim().split(/\s+/).length;
  await db.insert(writingSubmissions).values({
    userId,
    title: data.title,
    content: data.content,
    promptText: data.promptText || null,
    language: (data.language as any) || "fr",
    cefrLevel: (data.cefrLevel as any) || null,
    wordCount,
    programId: data.programId || null,
    pathId: data.pathId || null,
  });
  const result = await db.select().from(writingSubmissions)
    .where(eq(writingSubmissions.userId, userId))
    .orderBy(desc(writingSubmissions.id))
    .limit(1);
  return result[0] ?? null;
}

export async function getUserWritingSubmissions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(writingSubmissions)
    .where(eq(writingSubmissions.userId, userId))
    .orderBy(desc(writingSubmissions.updatedAt));
}

export async function getWritingSubmission(userId: number, submissionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(writingSubmissions)
    .where(and(eq(writingSubmissions.id, submissionId), eq(writingSubmissions.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function updateWritingSubmission(userId: number, submissionId: number, data: {
  title?: string; content?: string; status?: string; aiFeedback?: string; aiScore?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const updateData: any = { ...data };
  if (data.content) {
    updateData.wordCount = data.content.trim().split(/\s+/).length;
  }
  await db.update(writingSubmissions)
    .set(updateData)
    .where(and(eq(writingSubmissions.id, submissionId), eq(writingSubmissions.userId, userId)));
  return getWritingSubmission(userId, submissionId);
}

export async function deleteWritingSubmission(userId: number, submissionId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(writingSubmissions)
    .where(and(eq(writingSubmissions.id, submissionId), eq(writingSubmissions.userId, userId)));
  return true;
}
