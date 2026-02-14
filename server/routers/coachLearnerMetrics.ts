/**
 * Coach Learner Metrics Router
 * Provides coaches with detailed performance metrics for their learners:
 * - XP progression over time
 * - Completion rates per course/module
 * - SLE scores and level progression
 * - At-risk learner detection (low engagement)
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { sql, eq, and, desc } from "drizzle-orm";

// Helper to verify coach access
async function getCoachProfileId(userId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const [profile] = await db.execute(
    sql`SELECT id FROM coach_profiles WHERE userId = ${userId} AND status = 'approved'`
  );
  const rows = profile as unknown as any[];
  return rows?.[0]?.id || null;
}

export const coachLearnerMetricsRouter = router({
  /** Get detailed metrics for all learners assigned to this coach */
  getLearnersWithMetrics: protectedProcedure.query(async ({ ctx }) => {
    const coachId = await getCoachProfileId(ctx.user.id);
    if (!coachId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Coach profile not found" });
    }

    const db = await getDb();
    if (!db) return [];

    // Get all learners with their XP, streak, and session data
    const [learners] = await db.execute(sql`
      SELECT DISTINCT
        lp.id as learnerId,
        lp.userId,
        u.name,
        u.email,
        lp.currentLevel,
        COALESCE(lx.totalXp, 0) as totalXp,
        COALESCE(lx.currentStreak, 0) as currentStreak,
        COALESCE(lx.level, 1) as xpLevel,
        lx.lastActivityDate,
        (SELECT COUNT(*) FROM sessions s WHERE s.learnerId = lp.id AND s.coachId = ${coachId}) as totalSessions,
        (SELECT COUNT(*) FROM sessions s WHERE s.learnerId = lp.id AND s.coachId = ${coachId} AND s.status = 'completed') as completedSessions,
        (SELECT MAX(s.scheduledAt) FROM sessions s WHERE s.learnerId = lp.id AND s.coachId = ${coachId}) as lastSessionDate,
        (SELECT AVG(sr.rating) FROM session_reviews sr 
         JOIN sessions s ON sr.sessionId = s.id 
         WHERE s.learnerId = lp.id AND s.coachId = ${coachId}) as avgSessionRating
      FROM sessions s
      INNER JOIN learner_profiles lp ON s.learnerId = lp.id
      INNER JOIN users u ON lp.userId = u.id
      LEFT JOIN learner_xp lx ON lx.userId = lp.userId
      WHERE s.coachId = ${coachId}
      GROUP BY lp.id, lp.userId, u.name, u.email, lp.currentLevel, lx.totalXp, lx.currentStreak, lx.level, lx.lastActivityDate
    `);

    return (learners as unknown as any[]).map((l) => ({
      learnerId: l.learnerId,
      userId: l.userId,
      name: l.name,
      email: l.email,
      currentLevel: l.currentLevel,
      totalXp: Number(l.totalXp) || 0,
      currentStreak: Number(l.currentStreak) || 0,
      xpLevel: Number(l.xpLevel) || 1,
      lastActivityDate: l.lastActivityDate,
      totalSessions: Number(l.totalSessions) || 0,
      completedSessions: Number(l.completedSessions) || 0,
      lastSessionDate: l.lastSessionDate,
      avgSessionRating: l.avgSessionRating ? Number(l.avgSessionRating).toFixed(1) : null,
      // At-risk: no activity in 7+ days and streak broken
      isAtRisk: l.lastActivityDate
        ? new Date(l.lastActivityDate).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000
        : true,
    }));
  }),

  /** Get XP progression timeline for a specific learner */
  getLearnerXpTimeline: protectedProcedure
    .input(z.object({ learnerId: z.number(), days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const coachId = await getCoachProfileId(ctx.user.id);
      if (!coachId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Coach profile not found" });
      }

      const db = await getDb();
      if (!db) return [];

      // Verify this learner belongs to this coach
      const [check] = await db.execute(sql`
        SELECT 1 FROM sessions WHERE coachId = ${coachId} AND learnerId = ${input.learnerId} LIMIT 1
      `);
      if (!(check as unknown as any[])?.[0]) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Learner not assigned to you" });
      }

      // Get XP transactions grouped by day
      const [timeline] = await db.execute(sql`
        SELECT 
          DATE(createdAt) as date,
          SUM(xpAmount) as dailyXp,
          COUNT(*) as activities,
          GROUP_CONCAT(DISTINCT transactionType) as types
        FROM xp_transactions
        WHERE userId = (SELECT userId FROM learner_profiles WHERE id = ${input.learnerId})
          AND createdAt >= DATE_SUB(NOW(), INTERVAL ${input.days} DAY)
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `);

      return (timeline as unknown as any[]).map((t) => ({
        date: t.date,
        dailyXp: Number(t.dailyXp) || 0,
        activities: Number(t.activities) || 0,
        types: t.types ? t.types.split(",") : [],
      }));
    }),

  /** Get SLE score progression for a specific learner */
  getLearnerSleProgress: protectedProcedure
    .input(z.object({ learnerId: z.number() }))
    .query(async ({ ctx, input }) => {
      const coachId = await getCoachProfileId(ctx.user.id);
      if (!coachId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Coach profile not found" });
      }

      const db = await getDb();
      if (!db) return { sessions: [], averageScore: 0, levelDistribution: {} };

      // Get SLE companion sessions for this learner
      const [sessions] = await db.execute(sql`
        SELECT 
          scs.id,
          scs.targetLevel,
          scs.skillType,
          scs.averageScore,
          scs.messagesCount,
          scs.status,
          scs.createdAt
        FROM sle_companion_sessions scs
        WHERE scs.userId = (SELECT userId FROM learner_profiles WHERE id = ${input.learnerId})
        ORDER BY scs.createdAt DESC
        LIMIT 50
      `);

      const sessionsList = (sessions as unknown as any[]).map((s) => ({
        id: s.id,
        targetLevel: s.targetLevel,
        skillType: s.skillType,
        averageScore: Number(s.averageScore) || 0,
        messagesCount: Number(s.messagesCount) || 0,
        status: s.status,
        createdAt: s.createdAt,
      }));

      // Calculate averages and distribution
      const totalScore = sessionsList.reduce((sum, s) => sum + s.averageScore, 0);
      const averageScore = sessionsList.length > 0 ? totalScore / sessionsList.length : 0;

      const levelDistribution: Record<string, number> = {};
      sessionsList.forEach((s) => {
        levelDistribution[s.targetLevel] = (levelDistribution[s.targetLevel] || 0) + 1;
      });

      return { sessions: sessionsList, averageScore: Math.round(averageScore), levelDistribution };
    }),

  /** Get at-risk learners (no activity in 7+ days, broken streak, low scores) */
  getAtRiskLearners: protectedProcedure.query(async ({ ctx }) => {
    const coachId = await getCoachProfileId(ctx.user.id);
    if (!coachId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Coach profile not found" });
    }

    const db = await getDb();
    if (!db) return [];

    const [atRisk] = await db.execute(sql`
      SELECT DISTINCT
        lp.id as learnerId,
        u.name,
        u.email,
        lp.currentLevel,
        COALESCE(lx.totalXp, 0) as totalXp,
        COALESCE(lx.currentStreak, 0) as currentStreak,
        lx.lastActivityDate,
        DATEDIFF(NOW(), COALESCE(lx.lastActivityDate, lp.createdAt)) as daysSinceActivity,
        (SELECT COUNT(*) FROM sessions s2 WHERE s2.learnerId = lp.id AND s2.coachId = ${coachId} AND s2.status = 'completed') as completedSessions
      FROM sessions s
      INNER JOIN learner_profiles lp ON s.learnerId = lp.id
      INNER JOIN users u ON lp.userId = u.id
      LEFT JOIN learner_xp lx ON lx.userId = lp.userId
      WHERE s.coachId = ${coachId}
        AND (
          lx.lastActivityDate IS NULL 
          OR lx.lastActivityDate < DATE_SUB(NOW(), INTERVAL 7 DAY)
          OR lx.currentStreak = 0
        )
      GROUP BY lp.id, u.name, u.email, lp.currentLevel, lx.totalXp, lx.currentStreak, lx.lastActivityDate, lp.createdAt
      ORDER BY daysSinceActivity DESC
    `);

    return (atRisk as unknown as any[]).map((l) => ({
      learnerId: l.learnerId,
      name: l.name,
      email: l.email,
      currentLevel: l.currentLevel,
      totalXp: Number(l.totalXp) || 0,
      currentStreak: Number(l.currentStreak) || 0,
      daysSinceActivity: Number(l.daysSinceActivity) || 0,
      completedSessions: Number(l.completedSessions) || 0,
      riskLevel: Number(l.daysSinceActivity) > 14 ? "high" : Number(l.daysSinceActivity) > 7 ? "medium" : "low",
    }));
  }),

  /** Get aggregate performance summary for coach's learner cohort */
  getCohortSummary: protectedProcedure.query(async ({ ctx }) => {
    const coachId = await getCoachProfileId(ctx.user.id);
    if (!coachId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Coach profile not found" });
    }

    const db = await getDb();
    if (!db) return {
      totalLearners: 0, activeLearners: 0, atRiskLearners: 0,
      avgXp: 0, avgStreak: 0, totalSessionsCompleted: 0,
      avgCompletionRate: 0,
    };

    const [summary] = await db.execute(sql`
      SELECT
        COUNT(DISTINCT lp.id) as totalLearners,
        COUNT(DISTINCT CASE WHEN lx.lastActivityDate >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN lp.id END) as activeLearners,
        COUNT(DISTINCT CASE WHEN lx.lastActivityDate < DATE_SUB(NOW(), INTERVAL 7 DAY) OR lx.lastActivityDate IS NULL THEN lp.id END) as atRiskLearners,
        COALESCE(AVG(lx.totalXp), 0) as avgXp,
        COALESCE(AVG(lx.currentStreak), 0) as avgStreak,
        (SELECT COUNT(*) FROM sessions s2 WHERE s2.coachId = ${coachId} AND s2.status = 'completed') as totalSessionsCompleted
      FROM sessions s
      INNER JOIN learner_profiles lp ON s.learnerId = lp.id
      LEFT JOIN learner_xp lx ON lx.userId = lp.userId
      WHERE s.coachId = ${coachId}
    `);

    const row = (summary as unknown as any[])?.[0] || {};
    return {
      totalLearners: Number(row.totalLearners) || 0,
      activeLearners: Number(row.activeLearners) || 0,
      atRiskLearners: Number(row.atRiskLearners) || 0,
      avgXp: Math.round(Number(row.avgXp) || 0),
      avgStreak: Math.round(Number(row.avgStreak) || 0),
      totalSessionsCompleted: Number(row.totalSessionsCompleted) || 0,
      avgCompletionRate: Number(row.totalLearners) > 0
        ? Math.round((Number(row.activeLearners) / Number(row.totalLearners)) * 100)
        : 0,
    };
  }),
});
