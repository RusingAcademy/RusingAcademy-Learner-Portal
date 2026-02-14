/**
 * Sequence Performance Analytics
 * 
 * Tracks open rates, click rates, and conversion metrics for follow-up sequences
 */

import { getDb } from "./db";
import { 
  followUpSequences, 
  sequenceSteps, 
  leadSequenceEnrollments, 
  sequenceEmailLogs,
  ecosystemLeads 
} from "../drizzle/schema";
import { eq, and, gte, lte, sql, desc, count } from "drizzle-orm";

// Types
export interface SequenceMetrics {
  sequenceId: number;
  sequenceName: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  pausedEnrollments: number;
  totalEmailsSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  conversions: number;
  conversionRate: number;
  averageTimeToConversion: number | null;
}

export interface StepMetrics {
  stepId: number;
  stepOrder: number;
  subjectEn: string;
  subjectFr: string;
  delayDays: number;
  delayHours: number;
  emailsSent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  dropOffRate: number;
}

export interface SequencePerformanceReport {
  sequence: SequenceMetrics;
  steps: StepMetrics[];
  enrollmentTrend: Array<{ date: string; enrollments: number }>;
  conversionFunnel: Array<{ stage: string; count: number; percentage: number }>;
}

export interface OverallAnalytics {
  totalSequences: number;
  activeSequences: number;
  totalEnrollments: number;
  totalEmailsSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  averageConversionRate: number;
  topPerformingSequence: { id: number; name: string; conversionRate: number } | null;
  bottomPerformingSequence: { id: number; name: string; conversionRate: number } | null;
  recentActivity: Array<{
    date: string;
    emailsSent: number;
    opened: number;
    clicked: number;
  }>;
}

/**
 * Get metrics for a specific sequence
 */
export async function getSequenceMetrics(sequenceId: number): Promise<SequenceMetrics | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Get sequence info
  const [sequence] = await db
    .select()
    .from(followUpSequences)
    .where(eq(followUpSequences.id, sequenceId))
    .limit(1);
  
  if (!sequence) return null;
  
  // Get enrollment counts by status
  const enrollmentStats = await db
    .select({
      status: leadSequenceEnrollments.status,
      count: count(),
    })
    .from(leadSequenceEnrollments)
    .where(eq(leadSequenceEnrollments.sequenceId, sequenceId))
    .groupBy(leadSequenceEnrollments.status);
  
  const statusCounts: Record<string, number> = {};
  enrollmentStats.forEach(stat => {
    statusCounts[stat.status] = Number(stat.count);
  });
  
  const totalEnrollments = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const activeEnrollments = statusCounts["active"] || 0;
  const completedEnrollments = statusCounts["completed"] || 0;
  const pausedEnrollments = statusCounts["paused"] || 0;
  
  // Get email metrics
  const emailStats = await db
    .select({
      totalSent: count(),
      totalOpened: sql<number>`SUM(CASE WHEN ${sequenceEmailLogs.opened} = true THEN 1 ELSE 0 END)`,
      totalClicked: sql<number>`SUM(CASE WHEN ${sequenceEmailLogs.clicked} = true THEN 1 ELSE 0 END)`,
    })
    .from(sequenceEmailLogs)
    .innerJoin(leadSequenceEnrollments, eq(sequenceEmailLogs.enrollmentId, leadSequenceEnrollments.id))
    .where(eq(leadSequenceEnrollments.sequenceId, sequenceId));
  
  const totalEmailsSent = Number(emailStats[0]?.totalSent || 0);
  const totalOpened = Number(emailStats[0]?.totalOpened || 0);
  const totalClicked = Number(emailStats[0]?.totalClicked || 0);
  
  // Calculate rates
  const openRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
  const clickRate = totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0;
  const clickToOpenRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
  
  // Get conversions (leads that became "won" after enrollment)
  const conversions = await db
    .select({ count: count() })
    .from(leadSequenceEnrollments)
    .innerJoin(ecosystemLeads, eq(leadSequenceEnrollments.leadId, ecosystemLeads.id))
    .where(
      and(
        eq(leadSequenceEnrollments.sequenceId, sequenceId),
        eq(ecosystemLeads.status, "won")
      )
    );
  
  const conversionCount = Number(conversions[0]?.count || 0);
  const conversionRate = totalEnrollments > 0 ? (conversionCount / totalEnrollments) * 100 : 0;
  
  return {
    sequenceId,
    sequenceName: sequence.name,
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    pausedEnrollments,
    totalEmailsSent,
    totalOpened,
    totalClicked,
    openRate: Math.round(openRate * 10) / 10,
    clickRate: Math.round(clickRate * 10) / 10,
    clickToOpenRate: Math.round(clickToOpenRate * 10) / 10,
    conversions: conversionCount,
    conversionRate: Math.round(conversionRate * 10) / 10,
    averageTimeToConversion: null, // Would need more complex calculation
  };
}

/**
 * Get metrics for each step in a sequence
 */
export async function getStepMetrics(sequenceId: number): Promise<StepMetrics[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Get all steps for the sequence
  const steps = await db
    .select()
    .from(sequenceSteps)
    .where(eq(sequenceSteps.sequenceId, sequenceId))
    .orderBy(sequenceSteps.stepOrder);
  
  const metrics: StepMetrics[] = [];
  let previousStepSent = 0;
  
  for (const step of steps) {
    // Get email stats for this step
    const stats = await db
      .select({
        emailsSent: count(),
        opened: sql<number>`SUM(CASE WHEN ${sequenceEmailLogs.opened} = true THEN 1 ELSE 0 END)`,
        clicked: sql<number>`SUM(CASE WHEN ${sequenceEmailLogs.clicked} = true THEN 1 ELSE 0 END)`,
      })
      .from(sequenceEmailLogs)
      .where(eq(sequenceEmailLogs.stepId, step.id));
    
    const emailsSent = Number(stats[0]?.emailsSent || 0);
    const opened = Number(stats[0]?.opened || 0);
    const clicked = Number(stats[0]?.clicked || 0);
    
    const openRate = emailsSent > 0 ? (opened / emailsSent) * 100 : 0;
    const clickRate = emailsSent > 0 ? (clicked / emailsSent) * 100 : 0;
    
    // Calculate drop-off rate (compared to previous step)
    const dropOffRate = previousStepSent > 0 
      ? ((previousStepSent - emailsSent) / previousStepSent) * 100 
      : 0;
    
    metrics.push({
      stepId: step.id,
      stepOrder: step.stepOrder,
      subjectEn: step.emailSubjectEn,
      subjectFr: step.emailSubjectFr,
      delayDays: step.delayDays,
      delayHours: step.delayHours,
      emailsSent,
      opened,
      clicked,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
      dropOffRate: Math.round(dropOffRate * 10) / 10,
    });
    
    previousStepSent = emailsSent;
  }
  
  return metrics;
}

/**
 * Get full performance report for a sequence
 */
export async function getSequencePerformanceReport(sequenceId: number): Promise<SequencePerformanceReport | null> {
  const sequenceMetrics = await getSequenceMetrics(sequenceId);
  if (!sequenceMetrics) return null;
  
  const stepMetrics = await getStepMetrics(sequenceId);
  
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Get enrollment trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const enrollmentTrend = await db
    .select({
      date: sql<string>`DATE(${leadSequenceEnrollments.enrolledAt})`,
      enrollments: count(),
    })
    .from(leadSequenceEnrollments)
    .where(
      and(
        eq(leadSequenceEnrollments.sequenceId, sequenceId),
        gte(leadSequenceEnrollments.enrolledAt, thirtyDaysAgo)
      )
    )
    .groupBy(sql`DATE(${leadSequenceEnrollments.enrolledAt})`)
    .orderBy(sql`DATE(${leadSequenceEnrollments.enrolledAt})`);
  
  // Build conversion funnel
  const conversionFunnel = [
    { stage: "Enrolled", count: sequenceMetrics.totalEnrollments, percentage: 100 },
    { 
      stage: "Received Email", 
      count: sequenceMetrics.totalEmailsSent, 
      percentage: sequenceMetrics.totalEnrollments > 0 
        ? Math.round((sequenceMetrics.totalEmailsSent / sequenceMetrics.totalEnrollments) * 100) 
        : 0 
    },
    { 
      stage: "Opened", 
      count: sequenceMetrics.totalOpened, 
      percentage: sequenceMetrics.totalEnrollments > 0 
        ? Math.round((sequenceMetrics.totalOpened / sequenceMetrics.totalEnrollments) * 100) 
        : 0 
    },
    { 
      stage: "Clicked", 
      count: sequenceMetrics.totalClicked, 
      percentage: sequenceMetrics.totalEnrollments > 0 
        ? Math.round((sequenceMetrics.totalClicked / sequenceMetrics.totalEnrollments) * 100) 
        : 0 
    },
    { 
      stage: "Converted", 
      count: sequenceMetrics.conversions, 
      percentage: sequenceMetrics.totalEnrollments > 0 
        ? Math.round((sequenceMetrics.conversions / sequenceMetrics.totalEnrollments) * 100) 
        : 0 
    },
  ];
  
  return {
    sequence: sequenceMetrics,
    steps: stepMetrics,
    enrollmentTrend: enrollmentTrend.map(t => ({
      date: String(t.date),
      enrollments: Number(t.enrollments),
    })),
    conversionFunnel,
  };
}

/**
 * Get overall analytics across all sequences
 */
export async function getOverallSequenceAnalytics(): Promise<OverallAnalytics> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Get all sequences
  const sequences = await db.select().from(followUpSequences);
  const activeSequences = sequences.filter(s => s.isActive).length;
  
  // Get total enrollments
  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(leadSequenceEnrollments);
  
  // Get total email stats
  const [emailStats] = await db
    .select({
      totalSent: count(),
      totalOpened: sql<number>`SUM(CASE WHEN ${sequenceEmailLogs.opened} = true THEN 1 ELSE 0 END)`,
      totalClicked: sql<number>`SUM(CASE WHEN ${sequenceEmailLogs.clicked} = true THEN 1 ELSE 0 END)`,
    })
    .from(sequenceEmailLogs);
  
  const totalEmailsSent = Number(emailStats?.totalSent || 0);
  const totalOpened = Number(emailStats?.totalOpened || 0);
  const totalClicked = Number(emailStats?.totalClicked || 0);
  
  const averageOpenRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
  const averageClickRate = totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0;
  
  // Get conversion metrics per sequence
  const sequenceConversions: Array<{ id: number; name: string; conversionRate: number }> = [];
  
  for (const sequence of sequences) {
    const metrics = await getSequenceMetrics(sequence.id);
    if (metrics) {
      sequenceConversions.push({
        id: sequence.id,
        name: sequence.name,
        conversionRate: metrics.conversionRate,
      });
    }
  }
  
  // Sort by conversion rate
  sequenceConversions.sort((a, b) => b.conversionRate - a.conversionRate);
  
  const topPerforming = sequenceConversions.length > 0 ? sequenceConversions[0] : null;
  const bottomPerforming = sequenceConversions.length > 0 
    ? sequenceConversions[sequenceConversions.length - 1] 
    : null;
  
  // Calculate average conversion rate
  const totalConversionRate = sequenceConversions.reduce((sum, s) => sum + s.conversionRate, 0);
  const averageConversionRate = sequenceConversions.length > 0 
    ? totalConversionRate / sequenceConversions.length 
    : 0;
  
  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentActivity = await db
    .select({
      date: sql<string>`DATE(${sequenceEmailLogs.sentAt})`,
      emailsSent: count(),
      opened: sql<number>`SUM(CASE WHEN ${sequenceEmailLogs.opened} = true THEN 1 ELSE 0 END)`,
      clicked: sql<number>`SUM(CASE WHEN ${sequenceEmailLogs.clicked} = true THEN 1 ELSE 0 END)`,
    })
    .from(sequenceEmailLogs)
    .where(gte(sequenceEmailLogs.sentAt, sevenDaysAgo))
    .groupBy(sql`DATE(${sequenceEmailLogs.sentAt})`)
    .orderBy(sql`DATE(${sequenceEmailLogs.sentAt})`);
  
  return {
    totalSequences: sequences.length,
    activeSequences,
    totalEnrollments: Number(enrollmentCount?.count || 0),
    totalEmailsSent,
    averageOpenRate: Math.round(averageOpenRate * 10) / 10,
    averageClickRate: Math.round(averageClickRate * 10) / 10,
    averageConversionRate: Math.round(averageConversionRate * 10) / 10,
    topPerformingSequence: topPerforming,
    bottomPerformingSequence: bottomPerforming,
    recentActivity: recentActivity.map(a => ({
      date: String(a.date),
      emailsSent: Number(a.emailsSent),
      opened: Number(a.opened),
      clicked: Number(a.clicked),
    })),
  };
}

/**
 * Record email open event
 */
export async function recordEmailOpen(logId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  await db
    .update(sequenceEmailLogs)
    .set({
      opened: true,
      openedAt: new Date(),
    })
    .where(eq(sequenceEmailLogs.id, logId));
}

/**
 * Record email click event
 */
export async function recordEmailClick(logId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  await db
    .update(sequenceEmailLogs)
    .set({
      clicked: true,
      clickedAt: new Date(),
    })
    .where(eq(sequenceEmailLogs.id, logId));
}

/**
 * Get A/B test comparison between sequences
 */
export async function compareSequences(
  sequenceIdA: number,
  sequenceIdB: number
): Promise<{
  sequenceA: SequenceMetrics | null;
  sequenceB: SequenceMetrics | null;
  winner: "A" | "B" | "tie";
  improvement: number;
}> {
  const metricsA = await getSequenceMetrics(sequenceIdA);
  const metricsB = await getSequenceMetrics(sequenceIdB);
  
  let winner: "A" | "B" | "tie" = "tie";
  let improvement = 0;
  
  if (metricsA && metricsB) {
    if (metricsA.conversionRate > metricsB.conversionRate) {
      winner = "A";
      improvement = metricsB.conversionRate > 0 
        ? ((metricsA.conversionRate - metricsB.conversionRate) / metricsB.conversionRate) * 100 
        : 100;
    } else if (metricsB.conversionRate > metricsA.conversionRate) {
      winner = "B";
      improvement = metricsA.conversionRate > 0 
        ? ((metricsB.conversionRate - metricsA.conversionRate) / metricsA.conversionRate) * 100 
        : 100;
    }
  }
  
  return {
    sequenceA: metricsA,
    sequenceB: metricsB,
    winner,
    improvement: Math.round(improvement * 10) / 10,
  };
}
