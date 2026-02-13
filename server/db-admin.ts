/**
 * Sprint 2-5: LRDG-Grade Admin Database Helpers
 * Coach Hub, Commission, Executive Summary, Content Pipeline
 */
import { getDb } from "./db";
import {
  coachProfiles, coachApplications, commissionTiers, coachPayouts,
  contentItems, contentTemplates, contentCalendar,
  users, activityLog, pathEnrollments, lessonProgress,
} from "../drizzle/schema";
import { eq, desc, count, sql, and, gte, lte } from "drizzle-orm";

/* ═══════════════════ SPRINT 2: COACH HUB ═══════════════════ */

export async function getCoachApplications(statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = statusFilter ? [eq(coachApplications.status, statusFilter as any)] : [];
  return db.select().from(coachApplications).where(conditions.length ? conditions[0] : undefined).orderBy(desc(coachApplications.createdAt));
}

export async function updateApplicationStatus(id: number, status: string, reviewedBy: number, notes?: string) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.update(coachApplications).set({
    status: status as any,
    reviewedBy,
    reviewedAt: new Date(),
    reviewNotes: notes,
    updatedAt: new Date(),
  }).where(eq(coachApplications.id, id));
  return { success: true };
}

export async function getCoachProfiles(statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = statusFilter ? [eq(coachProfiles.status, statusFilter as any)] : [];
  return db.select().from(coachProfiles).where(conditions.length ? conditions[0] : undefined).orderBy(desc(coachProfiles.createdAt));
}

export async function suspendCoach(coachId: number, reason: string) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.update(coachProfiles).set({
    status: "suspended",
    suspendedAt: new Date(),
    suspendedReason: reason,
    updatedAt: new Date(),
  }).where(eq(coachProfiles.id, coachId));
  return { success: true };
}

export async function reactivateCoach(coachId: number) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.update(coachProfiles).set({
    status: "active",
    suspendedAt: null,
    suspendedReason: null,
    approvedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(coachProfiles.id, coachId));
  return { success: true };
}

export async function getCoachLifecycleStats() {
  const db = await getDb();
  if (!db) return { pending: 0, active: 0, suspended: 0, inactive: 0, total: 0 };
  const [pending] = await db.select({ count: count() }).from(coachProfiles).where(eq(coachProfiles.status, "pending"));
  const [active] = await db.select({ count: count() }).from(coachProfiles).where(eq(coachProfiles.status, "active"));
  const [suspended] = await db.select({ count: count() }).from(coachProfiles).where(eq(coachProfiles.status, "suspended"));
  const [inactive] = await db.select({ count: count() }).from(coachProfiles).where(eq(coachProfiles.status, "inactive"));
  return {
    pending: pending?.count ?? 0,
    active: active?.count ?? 0,
    suspended: suspended?.count ?? 0,
    inactive: inactive?.count ?? 0,
    total: (pending?.count ?? 0) + (active?.count ?? 0) + (suspended?.count ?? 0) + (inactive?.count ?? 0),
  };
}

/* ═══════════════════ COMMISSION MANAGEMENT ═══════════════════ */

export async function getCommissionTiers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(commissionTiers).orderBy(commissionTiers.minStudents);
}

export async function createCommissionTier(data: { name: string; description?: string; commissionRate: number; minStudents?: number; maxStudents?: number }) {
  const db = await getDb();
  if (!db) return { id: 0, success: false };
  const [result] = await db.insert(commissionTiers).values({ ...data, isActive: true }).$returningId();
  return { id: result.id, success: true };
}

export async function updateCommissionTier(id: number, data: { name?: string; commissionRate?: number; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.update(commissionTiers).set(data).where(eq(commissionTiers.id, id));
  return { success: true };
}

export async function getCoachPayouts(coachId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = coachId ? [eq(coachPayouts.coachId, coachId)] : [];
  return db.select().from(coachPayouts).where(conditions.length ? conditions[0] : undefined).orderBy(desc(coachPayouts.createdAt));
}

export async function getCommissionAnalytics() {
  const db = await getDb();
  if (!db) return { totalPaid: 0, pendingPayout: 0, activeCoaches: 0, activeTiers: 0 };
  const [totalPaid] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(coachPayouts).where(eq(coachPayouts.status, "paid"));
  const [pendingPayout] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(coachPayouts).where(eq(coachPayouts.status, "pending"));
  const [activeCoaches] = await db.select({ count: count() }).from(coachProfiles).where(eq(coachProfiles.status, "active"));
  const [activeTiers] = await db.select({ count: count() }).from(commissionTiers).where(eq(commissionTiers.isActive, true));
  return {
    totalPaid: totalPaid?.total ?? 0,
    pendingPayout: pendingPayout?.total ?? 0,
    activeCoaches: activeCoaches?.count ?? 0,
    activeTiers: activeTiers?.count ?? 0,
  };
}

/* ═══════════════════ SPRINT 4: EXECUTIVE SUMMARY ═══════════════════ */

export async function getExecutiveKPIs() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, activeUsers: 0, totalEnrollments: 0, completedLessons: 0, activeCoaches: 0, contentItems: 0, retentionRate: 0 };
  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [activeUsers] = await db.select({ count: count() }).from(users).where(
    gte(users.lastSignedIn, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  );
  const [totalEnrollments] = await db.select({ count: count() }).from(pathEnrollments);
  const [completedLessons] = await db.select({ count: count() }).from(lessonProgress).where(eq(lessonProgress.isCompleted, true));
  const [activeCoachesCount] = await db.select({ count: count() }).from(coachProfiles).where(eq(coachProfiles.status, "active"));
  const [contentCount] = await db.select({ count: count() }).from(contentItems);
  return {
    totalUsers: totalUsers?.count ?? 0,
    activeUsers: activeUsers?.count ?? 0,
    totalEnrollments: totalEnrollments?.count ?? 0,
    completedLessons: completedLessons?.count ?? 0,
    activeCoaches: activeCoachesCount?.count ?? 0,
    contentItems: contentCount?.count ?? 0,
    retentionRate: totalUsers?.count ? Math.round(((activeUsers?.count ?? 0) / totalUsers.count) * 100) : 0,
  };
}

export async function getPlatformHealth() {
  const db = await getDb();
  if (!db) return { dailyActivity: 0, weeklyActivity: 0, healthScore: 0, status: "low" as const };
  const [recentActivity] = await db.select({ count: count() }).from(activityLog).where(
    gte(activityLog.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
  );
  const [weekActivity] = await db.select({ count: count() }).from(activityLog).where(
    gte(activityLog.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  );
  return {
    dailyActivity: recentActivity?.count ?? 0,
    weeklyActivity: weekActivity?.count ?? 0,
    healthScore: Math.min(100, Math.round(((recentActivity?.count ?? 0) / 10) * 100)),
    status: (recentActivity?.count ?? 0) > 5 ? "healthy" as const : (recentActivity?.count ?? 0) > 0 ? "moderate" as const : "low" as const,
  };
}

export async function getRevenueTrend() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({ month: date.toLocaleString("en", { month: "short" }), year: date.getFullYear() });
  }
  return months.map((m) => ({ label: `${m.month} ${m.year}`, revenue: 0, enrollments: 0 }));
}

export async function getTopPerformers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ userId: activityLog.userId, activityCount: count() })
    .from(activityLog)
    .where(gte(activityLog.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
    .groupBy(activityLog.userId)
    .orderBy(desc(count()))
    .limit(10);
}

export async function getRecentAdminActivity() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: activityLog.id, userId: activityLog.userId, activityType: activityLog.activityType, createdAt: activityLog.createdAt })
    .from(activityLog).orderBy(desc(activityLog.createdAt)).limit(20);
}

/* ═══════════════════ SPRINT 5: CONTENT PIPELINE ═══════════════════ */

export async function getContentPipelineStats() {
  const db = await getDb();
  if (!db) return { draft: 0, review: 0, approved: 0, published: 0, archived: 0, total: 0 };
  const [draft] = await db.select({ count: count() }).from(contentItems).where(eq(contentItems.status, "draft"));
  const [review] = await db.select({ count: count() }).from(contentItems).where(eq(contentItems.status, "review"));
  const [approved] = await db.select({ count: count() }).from(contentItems).where(eq(contentItems.status, "approved"));
  const [published] = await db.select({ count: count() }).from(contentItems).where(eq(contentItems.status, "published"));
  const [archived] = await db.select({ count: count() }).from(contentItems).where(eq(contentItems.status, "archived"));
  return {
    draft: draft?.count ?? 0,
    review: review?.count ?? 0,
    approved: approved?.count ?? 0,
    published: published?.count ?? 0,
    archived: archived?.count ?? 0,
    total: (draft?.count ?? 0) + (review?.count ?? 0) + (approved?.count ?? 0) + (published?.count ?? 0) + (archived?.count ?? 0),
  };
}

export async function getContentPipelineItems(statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = statusFilter ? [eq(contentItems.status, statusFilter as any)] : [];
  return db.select().from(contentItems).where(conditions.length ? conditions[0] : undefined).orderBy(desc(contentItems.updatedAt));
}

export async function updateContentItemStatus(id: number, status: string, reviewerId?: number) {
  const db = await getDb();
  if (!db) return { success: false };
  const updates: any = { status, updatedAt: new Date() };
  if (reviewerId) updates.reviewerId = reviewerId;
  if (status === "published") updates.publishedAt = new Date();
  await db.update(contentItems).set(updates).where(eq(contentItems.id, id));
  return { success: true };
}

export async function getContentCalendarEntries(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (startDate) conditions.push(gte(contentCalendar.scheduledDate, startDate));
  if (endDate) conditions.push(lte(contentCalendar.scheduledDate, endDate));
  return db.select().from(contentCalendar)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contentCalendar.scheduledDate);
}

export async function getContentQualityScores() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: contentItems.id, title: contentItems.title, contentType: contentItems.contentType, qualityScore: contentItems.qualityScore, status: contentItems.status })
    .from(contentItems)
    .where(sql`${contentItems.qualityScore} IS NOT NULL`)
    .orderBy(desc(contentItems.qualityScore))
    .limit(20);
}

export async function getContentTemplatesList() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentTemplates).where(eq(contentTemplates.isDefault, true)).orderBy(desc(contentTemplates.usageCount));
}

export async function createContentItem(data: { title: string; titleFr?: string; contentType: string; authorId: number; body?: string }) {
  const db = await getDb();
  if (!db) return { id: 0, success: false };
  const [result] = await db.insert(contentItems).values({ ...data, contentType: data.contentType as any, status: "draft" }).$returningId();
  return { id: result.id, success: true };
}
