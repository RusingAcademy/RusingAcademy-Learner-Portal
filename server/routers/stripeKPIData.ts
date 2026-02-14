/**
 * Stripe KPI Data Router
 * 
 * Fetches real payment data directly from the Stripe API
 * for the Live KPI Dashboard. Falls back gracefully when
 * Stripe is not configured or unavailable.
 */
import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

let stripeInstance: any = null;

async function getStripe() {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "" || key === "sk_test_placeholder") return null;
  try {
    const Stripe = (await import("stripe")).default;
    stripeInstance = new Stripe(key);
    return stripeInstance;
  } catch {
    return null;
  }
}

export const stripeKPIRouter = router({
  /**
   * Get real Stripe revenue data (last 30 days)
   * Falls back to DB analytics_events if Stripe is unavailable
   */
  getStripeRevenue: adminProcedure.query(async () => {
    const stripe = await getStripe();
    
    if (stripe) {
      try {
        const now = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
        const sevenDaysAgo = now - 7 * 24 * 60 * 60;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayTimestamp = Math.floor(todayStart.getTime() / 1000);

        // Fetch recent charges from Stripe
        const charges = await stripe.charges.list({
          created: { gte: thirtyDaysAgo },
          limit: 100,
          expand: ["data.balance_transaction"],
        });

        let todayRevenue = 0, todayTx = 0;
        let weekRevenue = 0, weekTx = 0;
        let monthRevenue = 0, monthTx = 0;
        const dailyRevenue: Record<string, number> = {};

        for (const charge of charges.data) {
          if (charge.status !== "succeeded") continue;
          const amount = charge.amount / 100; // cents to dollars
          const created = charge.created;
          const dateStr = new Date(created * 1000).toISOString().split("T")[0];

          monthRevenue += amount;
          monthTx++;
          dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + amount;

          if (created >= sevenDaysAgo) { weekRevenue += amount; weekTx++; }
          if (created >= todayTimestamp) { todayRevenue += amount; todayTx++; }
        }

        // Build sparkline
        const sparkline = Object.entries(dailyRevenue)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, revenue]) => ({ date, revenue }));

        return {
          source: "stripe" as const,
          today: { revenue: todayRevenue, transactions: todayTx },
          week: { revenue: weekRevenue, transactions: weekTx },
          month: { revenue: monthRevenue, transactions: monthTx },
          sparkline,
        };
      } catch (err) {
        console.error("[StripeKPI] Error fetching Stripe data:", err);
        // Fall through to DB fallback
      }
    }

    // Fallback: use analytics_events from DB
    const db = await getDb();
    const [todayRows] = await db.execute(sql`
      SELECT COALESCE(SUM(CASE WHEN JSON_EXTRACT(metadata, '$.amount') IS NOT NULL 
        THEN CAST(JSON_EXTRACT(metadata, '$.amount') AS DECIMAL(10,2)) ELSE 0 END), 0) as revenue,
        COUNT(*) as transactions
      FROM analytics_events 
      WHERE eventType IN ('payment_succeeded', 'checkout_completed')
      AND createdAt >= CURDATE()
    `);
    const [weekRows] = await db.execute(sql`
      SELECT COALESCE(SUM(CASE WHEN JSON_EXTRACT(metadata, '$.amount') IS NOT NULL 
        THEN CAST(JSON_EXTRACT(metadata, '$.amount') AS DECIMAL(10,2)) ELSE 0 END), 0) as revenue,
        COUNT(*) as transactions
      FROM analytics_events 
      WHERE eventType IN ('payment_succeeded', 'checkout_completed')
      AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);
    const [monthRows] = await db.execute(sql`
      SELECT COALESCE(SUM(CASE WHEN JSON_EXTRACT(metadata, '$.amount') IS NOT NULL 
        THEN CAST(JSON_EXTRACT(metadata, '$.amount') AS DECIMAL(10,2)) ELSE 0 END), 0) as revenue,
        COUNT(*) as transactions
      FROM analytics_events 
      WHERE eventType IN ('payment_succeeded', 'checkout_completed')
      AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    return {
      source: "database" as const,
      today: { revenue: Number((todayRows as any)?.[0]?.revenue ?? 0), transactions: Number((todayRows as any)?.[0]?.transactions ?? 0) },
      week: { revenue: Number((weekRows as any)?.[0]?.revenue ?? 0), transactions: Number((weekRows as any)?.[0]?.transactions ?? 0) },
      month: { revenue: Number((monthRows as any)?.[0]?.revenue ?? 0), transactions: Number((monthRows as any)?.[0]?.transactions ?? 0) },
      sparkline: [],
    };
  }),

  /**
   * Get real user and enrollment analytics from DB
   */
  getUserAnalytics: adminProcedure.query(async () => {
    const db = await getDb();

    // Total users
    const [totalUsers] = await db.execute(sql`SELECT COUNT(*) as cnt FROM users`);
    // New users this week
    const [newUsersWeek] = await db.execute(sql`SELECT COUNT(*) as cnt FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    // New users this month
    const [newUsersMonth] = await db.execute(sql`SELECT COUNT(*) as cnt FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    // Active enrollments
    const [activeEnrollments] = await db.execute(sql`SELECT COUNT(*) as cnt FROM course_enrollments WHERE status = 'active'`);
    // Completion rate
    const [completedEnrollments] = await db.execute(sql`SELECT COUNT(*) as cnt FROM course_enrollments WHERE status = 'completed'`);
    const [totalEnrollments] = await db.execute(sql`SELECT COUNT(*) as cnt FROM course_enrollments`);
    // User role distribution
    const [roleDistribution] = await db.execute(sql`
      SELECT role, COUNT(*) as cnt FROM users GROUP BY role ORDER BY cnt DESC
    `);
    // Daily signups trend (last 14 days)
    const [signupTrend] = await db.execute(sql`
      SELECT DATE(createdAt) as date, COUNT(*) as signups
      FROM users WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(createdAt) ORDER BY date ASC
    `);

    const total = Number((totalEnrollments as any)?.[0]?.cnt ?? 0);
    const completed = Number((completedEnrollments as any)?.[0]?.cnt ?? 0);

    return {
      totalUsers: Number((totalUsers as any)?.[0]?.cnt ?? 0),
      newUsersWeek: Number((newUsersWeek as any)?.[0]?.cnt ?? 0),
      newUsersMonth: Number((newUsersMonth as any)?.[0]?.cnt ?? 0),
      activeEnrollments: Number((activeEnrollments as any)?.[0]?.cnt ?? 0),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      roleDistribution: Array.isArray(roleDistribution) ? roleDistribution : [],
      signupTrend: Array.isArray(signupTrend) ? signupTrend : [],
    };
  }),

  /**
   * Get AI session metrics from ai_pipeline_metrics and practice_logs
   */
  getAIMetrics: adminProcedure.query(async () => {
    const db = await getDb();

    // From ai_pipeline_metrics (our new monitoring table)
    const [pipelineMetrics] = await db.execute(sql`
      SELECT 
        COUNT(*) as totalSteps,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successSteps,
        SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failedSteps,
        AVG(durationMs) as avgLatency,
        MAX(durationMs) as maxLatency
      FROM ai_pipeline_metrics
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // From practice_logs (user-facing AI sessions)
    const [practiceSessions] = await db.execute(sql`
      SELECT COUNT(*) as total, AVG(score) as avgScore,
        COUNT(DISTINCT userId) as uniqueUsers
      FROM practice_logs
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // SLE companion sessions
    const [companionSessions] = await db.execute(sql`
      SELECT COUNT(*) as total, AVG(overallScore) as avgScore
      FROM sle_companion_sessions
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Daily AI usage trend
    const [aiTrend] = await db.execute(sql`
      SELECT DATE(createdAt) as date, COUNT(*) as sessions
      FROM practice_logs
      WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(createdAt) ORDER BY date ASC
    `);

    const totalSteps = Number((pipelineMetrics as any)?.[0]?.totalSteps ?? 0);
    const successSteps = Number((pipelineMetrics as any)?.[0]?.successSteps ?? 0);

    return {
      pipeline: {
        totalSteps,
        successRate: totalSteps > 0 ? Math.round((successSteps / totalSteps) * 100) : 100,
        failedSteps: Number((pipelineMetrics as any)?.[0]?.failedSteps ?? 0),
        avgLatencyMs: Math.round(Number((pipelineMetrics as any)?.[0]?.avgLatency ?? 0)),
        maxLatencyMs: Number((pipelineMetrics as any)?.[0]?.maxLatency ?? 0),
      },
      practice: {
        totalSessions: Number((practiceSessions as any)?.[0]?.total ?? 0),
        avgScore: Math.round(Number((practiceSessions as any)?.[0]?.avgScore ?? 0)),
        uniqueUsers: Number((practiceSessions as any)?.[0]?.uniqueUsers ?? 0),
      },
      companion: {
        totalSessions: Number((companionSessions as any)?.[0]?.total ?? 0),
        avgScore: Math.round(Number((companionSessions as any)?.[0]?.avgScore ?? 0)),
      },
      trend: Array.isArray(aiTrend) ? aiTrend : [],
    };
  }),
});
