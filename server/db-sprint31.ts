/**
 * DB Helpers — Sprints 31-40
 * Certificates, Reading Exercises, Listening Exercises, Grammar Drills, Peer Reviews
 */
import { eq, and, desc, sql, asc } from "drizzle-orm";
import { getDb } from "./db";
import {
  certificates, readingExercises, listeningExercises, grammarDrills, peerReviews, notifications,
} from "../drizzle/schema";

/* ─────────────── CERTIFICATES ─────────────── */

export async function createCertificate(data: {
  userId: number; type: "path_completion" | "level_achievement" | "challenge_winner";
  title: string; titleFr?: string; description?: string; descriptionFr?: string;
  pathId?: string; cefrLevel?: "A1" | "A2" | "B1" | "B2" | "C1"; certificateUrl?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(certificates).values(data);
  const rows = await db.select().from(certificates)
    .where(eq(certificates.userId, data.userId))
    .orderBy(desc(certificates.createdAt)).limit(1);
  return rows[0] ?? null;
}

export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates)
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt));
}

export async function getCertificateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
  return rows[0] ?? null;
}

/* ─────────────── READING EXERCISES ─────────────── */

export async function saveReadingResult(data: {
  userId: number; passageTitle: string; cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  wordsPerMinute?: number; score?: number; totalQuestions: number; correctAnswers: number;
  timeSpentSeconds?: number; language?: "en" | "fr";
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(readingExercises).values(data);
  return { success: true };
}

export async function getUserReadingHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(readingExercises)
    .where(eq(readingExercises.userId, userId))
    .orderBy(desc(readingExercises.completedAt)).limit(limit);
}

export async function getUserReadingStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    totalExercises: sql<number>`count(*)`.as("totalExercises"),
    avgScore: sql<number>`ROUND(AVG(${readingExercises.score}))`.as("avgScore"),
    avgWpm: sql<number>`ROUND(AVG(${readingExercises.wordsPerMinute}))`.as("avgWpm"),
    totalTime: sql<number>`SUM(${readingExercises.timeSpentSeconds})`.as("totalTime"),
  }).from(readingExercises).where(eq(readingExercises.userId, userId));
  return rows[0] ?? null;
}

/* ─────────────── LISTENING EXERCISES ─────────────── */

export async function saveListeningResult(data: {
  userId: number; exerciseTitle: string; cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  score?: number; totalQuestions: number; correctAnswers: number;
  timeSpentSeconds?: number; language?: "en" | "fr";
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(listeningExercises).values(data);
  return { success: true };
}

export async function getUserListeningHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listeningExercises)
    .where(eq(listeningExercises.userId, userId))
    .orderBy(desc(listeningExercises.completedAt)).limit(limit);
}

export async function getUserListeningStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    totalExercises: sql<number>`count(*)`.as("totalExercises"),
    avgScore: sql<number>`ROUND(AVG(${listeningExercises.score}))`.as("avgScore"),
    totalTime: sql<number>`SUM(${listeningExercises.timeSpentSeconds})`.as("totalTime"),
  }).from(listeningExercises).where(eq(listeningExercises.userId, userId));
  return rows[0] ?? null;
}

/* ─────────────── GRAMMAR DRILLS ─────────────── */

export async function saveGrammarDrillResult(data: {
  userId: number; topic: string; cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  drillType: "fill_blank" | "conjugation" | "reorder" | "multiple_choice";
  score?: number; totalQuestions: number; correctAnswers: number;
  timeSpentSeconds?: number; language?: "en" | "fr";
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(grammarDrills).values(data);
  return { success: true };
}

export async function getUserGrammarHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(grammarDrills)
    .where(eq(grammarDrills.userId, userId))
    .orderBy(desc(grammarDrills.completedAt)).limit(limit);
}

export async function getUserGrammarStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    totalDrills: sql<number>`count(*)`.as("totalDrills"),
    avgScore: sql<number>`ROUND(AVG(${grammarDrills.score}))`.as("avgScore"),
    totalTime: sql<number>`SUM(${grammarDrills.timeSpentSeconds})`.as("totalTime"),
  }).from(grammarDrills).where(eq(grammarDrills.userId, userId));
  return rows[0] ?? null;
}

export async function getGrammarStatsByTopic(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    topic: grammarDrills.topic,
    count: sql<number>`count(*)`.as("count"),
    avgScore: sql<number>`ROUND(AVG(${grammarDrills.score}))`.as("avgScore"),
  }).from(grammarDrills)
    .where(eq(grammarDrills.userId, userId))
    .groupBy(grammarDrills.topic);
}

/* ─────────────── PEER REVIEWS ─────────────── */

export async function createPeerReview(data: {
  submissionId: number; reviewerId: number; authorId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(peerReviews).values(data);
  const rows = await db.select().from(peerReviews)
    .where(and(eq(peerReviews.submissionId, data.submissionId), eq(peerReviews.reviewerId, data.reviewerId)))
    .orderBy(desc(peerReviews.createdAt)).limit(1);
  return rows[0] ?? null;
}

export async function completePeerReview(reviewId: number, data: {
  grammarScore: number; vocabularyScore: number; coherenceScore: number;
  overallScore: number; feedback: string; strengths?: string; improvements?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.update(peerReviews).set({ ...data, status: "completed", completedAt: new Date() })
    .where(eq(peerReviews.id, reviewId));
  return { reviewId, ...data };
}

export async function getReviewsForSubmission(submissionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(peerReviews)
    .where(eq(peerReviews.submissionId, submissionId))
    .orderBy(desc(peerReviews.createdAt));
}

export async function getPendingReviews(reviewerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(peerReviews)
    .where(and(eq(peerReviews.reviewerId, reviewerId), eq(peerReviews.status, "pending")))
    .orderBy(desc(peerReviews.createdAt));
}

export async function getCompletedReviewsByUser(reviewerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(peerReviews)
    .where(and(eq(peerReviews.reviewerId, reviewerId), eq(peerReviews.status, "completed")))
    .orderBy(desc(peerReviews.completedAt));
}

/* ─────────────── NOTIFICATION HELPERS ─────────────── */

export async function createNotification(data: {
  userId: number; title: string; message: string; type: "info" | "achievement" | "reminder" | "system";
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(notifications).values(data);
  return { success: true };
}
