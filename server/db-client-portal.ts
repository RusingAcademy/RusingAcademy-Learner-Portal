import { drizzle } from "drizzle-orm/mysql2";
import {
  clientOrganizations,
  organizationManagers,
  participants,
  trainingCohorts,
  cohortParticipants,
  billingRecords,
  budgetAllocations,
  complianceRecords,
  coachingSessions,
} from "../drizzle/schema";
import { eq, and, sql, desc, count } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Client Portal DB connection failed:", error);
      _db = null;
    }
  }
  return _db;
}

/* ═══════════════════════════════════════════════════════════
   ORGANIZATION MANAGERS — resolve which org the user manages
   ═══════════════════════════════════════════════════════════ */

export async function getManagerOrg(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(organizationManagers)
    .where(and(eq(organizationManagers.userId, userId), eq(organizationManagers.isActive, true)))
    .limit(1);
  return row ?? null;
}

/* ═══════════════════════════════════════════════════════════
   ORGANIZATIONS
   ═══════════════════════════════════════════════════════════ */

export async function getOrganization(orgId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(clientOrganizations).where(eq(clientOrganizations.id, orgId)).limit(1);
  return row ?? null;
}

export async function listOrganizations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientOrganizations).orderBy(desc(clientOrganizations.createdAt));
}

export async function createOrganization(data: {
  name: string; nameFr?: string; orgType?: string; sector?: string;
  contactName?: string; contactEmail?: string; contactPhone?: string;
  address?: string; city?: string; province?: string; postalCode?: string;
  contractStartDate?: string; contractEndDate?: string; maxParticipants?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(clientOrganizations).values(data as any);
  return { id: result.insertId };
}

/* ═══════════════════════════════════════════════════════════
   PARTICIPANTS
   ═══════════════════════════════════════════════════════════ */

export async function getParticipants(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participants).where(eq(participants.organizationId, orgId)).orderBy(desc(participants.createdAt));
}

export async function getParticipant(id: number, orgId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(participants)
    .where(and(eq(participants.id, id), eq(participants.organizationId, orgId)))
    .limit(1);
  return row ?? null;
}

export async function createParticipant(data: {
  organizationId: number; firstName: string; lastName: string; email: string;
  employeeId?: string; department?: string; position?: string;
  currentLevel?: string; targetLevel?: string; program?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(participants).values(data as any);
  return { id: result.insertId };
}

export async function updateParticipant(id: number, orgId: number, data: Partial<{
  firstName: string; lastName: string; email: string; employeeId: string;
  department: string; position: string; currentLevel: string; targetLevel: string;
  program: string; status: string;
}>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(participants).set(data as any)
    .where(and(eq(participants.id, id), eq(participants.organizationId, orgId)));
  return { success: true };
}

export async function getParticipantCount(orgId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [row] = await db.select({ count: count() }).from(participants).where(eq(participants.organizationId, orgId));
  return row?.count ?? 0;
}

export async function getParticipantsByStatus(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    status: participants.status,
    count: count(),
  }).from(participants)
    .where(eq(participants.organizationId, orgId))
    .groupBy(participants.status);
}

/* ═══════════════════════════════════════════════════════════
   TRAINING COHORTS
   ═══════════════════════════════════════════════════════════ */

export async function getCohorts(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingCohorts).where(eq(trainingCohorts.organizationId, orgId)).orderBy(desc(trainingCohorts.createdAt));
}

export async function createCohort(data: {
  organizationId: number; name: string; nameFr?: string; program?: string;
  cefrLevel?: string; startDate: string; endDate?: string; schedule?: string;
  maxParticipants?: number; description?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(trainingCohorts).values(data as any);
  return { id: result.insertId };
}

export async function getCohortParticipants(cohortId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cohortParticipants).where(eq(cohortParticipants.cohortId, cohortId));
}

export async function addParticipantToCohort(cohortId: number, participantId: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(cohortParticipants).values({ cohortId, participantId });
  // Update current count
  await db.update(trainingCohorts)
    .set({ currentParticipants: sql`${trainingCohorts.currentParticipants} + 1` })
    .where(eq(trainingCohorts.id, cohortId));
  return { id: result.insertId };
}

export async function getCohortStats(orgId: number) {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, planned: 0, completed: 0 };
  const rows = await db.select({
    status: trainingCohorts.status,
    count: count(),
  }).from(trainingCohorts)
    .where(eq(trainingCohorts.organizationId, orgId))
    .groupBy(trainingCohorts.status);
  const stats = { total: 0, active: 0, planned: 0, completed: 0 };
  for (const r of rows) {
    const c = r.count;
    stats.total += c;
    if (r.status === "active") stats.active = c;
    if (r.status === "planned") stats.planned = c;
    if (r.status === "completed") stats.completed = c;
  }
  return stats;
}

/* ═══════════════════════════════════════════════════════════
   BILLING & BUDGET
   ═══════════════════════════════════════════════════════════ */

export async function getBillingRecords(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(billingRecords).where(eq(billingRecords.organizationId, orgId)).orderBy(desc(billingRecords.createdAt));
}

export async function getBillingStats(orgId: number) {
  const db = await getDb();
  if (!db) return { totalInvoiced: 0, totalPaid: 0, totalOverdue: 0, pendingCount: 0 };
  const rows = await db.select({
    status: billingRecords.status,
    total: sql<number>`SUM(${billingRecords.amount})`,
    count: count(),
  }).from(billingRecords)
    .where(eq(billingRecords.organizationId, orgId))
    .groupBy(billingRecords.status);
  const stats = { totalInvoiced: 0, totalPaid: 0, totalOverdue: 0, pendingCount: 0 };
  for (const r of rows) {
    stats.totalInvoiced += Number(r.total) || 0;
    if (r.status === "paid") stats.totalPaid = Number(r.total) || 0;
    if (r.status === "overdue") stats.totalOverdue = Number(r.total) || 0;
    if (r.status === "sent" || r.status === "draft") stats.pendingCount += r.count;
  }
  return stats;
}

export async function getBudgetAllocations(orgId: number, fiscalYear?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(budgetAllocations.organizationId, orgId)];
  if (fiscalYear) conditions.push(eq(budgetAllocations.fiscalYear, fiscalYear));
  return db.select().from(budgetAllocations).where(and(...conditions));
}

/* ═══════════════════════════════════════════════════════════
   COMPLIANCE
   ═══════════════════════════════════════════════════════════ */

export async function getComplianceRecords(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceRecords).where(eq(complianceRecords.organizationId, orgId)).orderBy(desc(complianceRecords.createdAt));
}

export async function getComplianceStats(orgId: number) {
  const db = await getDb();
  if (!db) return { total: 0, achieved: 0, inProgress: 0, pending: 0, expired: 0 };
  const rows = await db.select({
    status: complianceRecords.status,
    count: count(),
  }).from(complianceRecords)
    .where(eq(complianceRecords.organizationId, orgId))
    .groupBy(complianceRecords.status);
  const stats = { total: 0, achieved: 0, inProgress: 0, pending: 0, expired: 0 };
  for (const r of rows) {
    stats.total += r.count;
    if (r.status === "achieved") stats.achieved = r.count;
    if (r.status === "in_progress") stats.inProgress = r.count;
    if (r.status === "pending") stats.pending = r.count;
    if (r.status === "expired") stats.expired = r.count;
  }
  return stats;
}

export async function createComplianceRecord(data: {
  organizationId: number; participantId: number; assessmentType: string;
  currentResult?: string; targetResult?: string; assessmentDate?: string;
  nextAssessmentDate?: string; status?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(complianceRecords).values(data as any);
  return { id: result.insertId };
}

/* ═══════════════════════════════════════════════════════════
   COACHING SESSIONS
   ═══════════════════════════════════════════════════════════ */

export async function getCoachingSessions(filters: { orgId?: number; userId?: number; coachId?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters.orgId) conditions.push(eq(coachingSessions.organizationId, filters.orgId));
  if (filters.userId) conditions.push(eq(coachingSessions.userId, filters.userId));
  if (filters.coachId) conditions.push(eq(coachingSessions.coachId, filters.coachId));
  return db.select().from(coachingSessions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(coachingSessions.scheduledAt));
}

export async function createCoachingSession(data: {
  title: string; sessionType?: string; durationMinutes?: number;
  participantId?: number; userId?: number; coachId?: number;
  organizationId?: number; cohortId?: number;
  calendlyEventUri?: string; calendlyInviteeUri?: string;
  scheduledAt?: Date; meetingUrl?: string; description?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(coachingSessions).values(data as any);
  return { id: result.insertId };
}

export async function updateCoachingSession(id: number, data: Partial<{
  status: string; coachNotes: string; participantFeedback: string;
  rating: number; cancelReason: string;
}>) {
  const db = await getDb();
  if (!db) return null;
  const updateData: any = { ...data };
  if (data.status === "cancelled") updateData.cancelledAt = new Date();
  if (data.status === "completed") updateData.completedAt = new Date();
  await db.update(coachingSessions).set(updateData).where(eq(coachingSessions.id, id));
  return { success: true };
}

export async function getSessionStats(orgId: number) {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0, scheduled: 0, cancelled: 0 };
  const rows = await db.select({
    status: coachingSessions.status,
    count: count(),
  }).from(coachingSessions)
    .where(eq(coachingSessions.organizationId, orgId))
    .groupBy(coachingSessions.status);
  const stats = { total: 0, completed: 0, scheduled: 0, cancelled: 0 };
  for (const r of rows) {
    stats.total += r.count;
    if (r.status === "completed") stats.completed = r.count;
    if (r.status === "scheduled" || r.status === "confirmed") stats.scheduled += r.count;
    if (r.status === "cancelled") stats.cancelled = r.count;
  }
  return stats;
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD OVERVIEW
   ═══════════════════════════════════════════════════════════ */

export async function getDashboardOverview(orgId: number) {
  const [org, participantCount, participantsByStatus, cohortStats, billingStats, complianceStats, sessionStats] = await Promise.all([
    getOrganization(orgId),
    getParticipantCount(orgId),
    getParticipantsByStatus(orgId),
    getCohortStats(orgId),
    getBillingStats(orgId),
    getComplianceStats(orgId),
    getSessionStats(orgId),
  ]);
  return {
    organization: org,
    participants: { total: participantCount, byStatus: participantsByStatus },
    cohorts: cohortStats,
    billing: billingStats,
    compliance: complianceStats,
    sessions: sessionStats,
  };
}
