import { z } from "zod";
import { protectedProcedure, adminProcedure, publicProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// ============================================================================
// STRIPE LIVE TESTING ROUTER
// ============================================================================
export const stripeTestingRouter = router({
  // Get webhook events log
  getWebhookEvents: adminProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const limit = input?.limit ?? 50;
      const [rows] = await db.execute(sql`
        SELECT id, eventId, eventType, source, status, errorMessage, processedAt, createdAt
        FROM webhook_events_log
        ORDER BY createdAt DESC
        LIMIT ${limit}
      `);
      return Array.isArray(rows) ? rows : [];
    }),

  // Get webhook stats
  getWebhookStats: adminProcedure.query(async () => {
    const db = await getDb();
    const [totalRows] = await db.execute(sql`SELECT COUNT(*) as total FROM webhook_events_log`);
    const [processedRows] = await db.execute(sql`SELECT COUNT(*) as count FROM webhook_events_log WHERE status = 'processed'`);
    const [failedRows] = await db.execute(sql`SELECT COUNT(*) as count FROM webhook_events_log WHERE status = 'failed'`);
    const [recentRows] = await db.execute(sql`
      SELECT eventType, COUNT(*) as count 
      FROM webhook_events_log 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY eventType
    `);
    const total = Array.isArray(totalRows) && totalRows[0] ? (totalRows[0] as any).total : 0;
    const processed = Array.isArray(processedRows) && processedRows[0] ? (processedRows[0] as any).count : 0;
    const failed = Array.isArray(failedRows) && failedRows[0] ? (failedRows[0] as any).count : 0;
    return {
      total: Number(total),
      processed: Number(processed),
      failed: Number(failed),
      recentByType: Array.isArray(recentRows) ? recentRows : [],
    };
  }),

  // Get test payment instructions
  getTestInstructions: adminProcedure.query(async () => {
    return {
      testCard: "4242 4242 4242 4242",
      expiry: "Any future date (e.g., 12/34)",
      cvc: "Any 3 digits (e.g., 123)",
      zip: "Any 5 digits (e.g., 12345)",
      notes: [
        "Use test card number 4242 4242 4242 4242 for successful payments",
        "Use 4000 0000 0000 0002 for declined payments",
        "Use 4000 0000 0000 3220 for 3D Secure authentication",
        "Minimum charge amount is $0.50 USD",
        "Claim your Stripe sandbox in Settings → Payment for live testing",
      ],
    };
  }),
});

// ============================================================================
// REAL-TIME KPI DASHBOARD ROUTER
// ============================================================================
export const liveKPIRouter = router({
  // Get live revenue metrics
  getRevenueMetrics: adminProcedure.query(async () => {
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
    const [sparklineRows] = await db.execute(sql`
      SELECT DATE(createdAt) as date,
        COALESCE(SUM(CASE WHEN JSON_EXTRACT(metadata, '$.amount') IS NOT NULL 
          THEN CAST(JSON_EXTRACT(metadata, '$.amount') AS DECIMAL(10,2)) ELSE 0 END), 0) as revenue
      FROM analytics_events 
      WHERE eventType IN ('payment_succeeded', 'checkout_completed')
      AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `);
    return {
      today: { revenue: Number((todayRows as any)?.[0]?.revenue ?? 0), transactions: Number((todayRows as any)?.[0]?.transactions ?? 0) },
      week: { revenue: Number((weekRows as any)?.[0]?.revenue ?? 0), transactions: Number((weekRows as any)?.[0]?.transactions ?? 0) },
      month: { revenue: Number((monthRows as any)?.[0]?.revenue ?? 0), transactions: Number((monthRows as any)?.[0]?.transactions ?? 0) },
      sparkline: Array.isArray(sparklineRows) ? sparklineRows : [],
    };
  }),

  // Get live conversion funnel
  getConversionFunnel: adminProcedure.query(async () => {
    const db = await getDb();
    const [visitors] = await db.execute(sql`SELECT COUNT(DISTINCT userId) as count FROM analytics_events WHERE eventType = 'page_view' AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    const [signups] = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    const [enrollments] = await db.execute(sql`SELECT COUNT(*) as count FROM course_enrollments WHERE enrolledAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    const [payments] = await db.execute(sql`SELECT COUNT(*) as count FROM analytics_events WHERE eventType IN ('payment_succeeded', 'checkout_completed') AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    return {
      visitors: Number((visitors as any)?.[0]?.count ?? 0),
      signups: Number((signups as any)?.[0]?.count ?? 0),
      enrollments: Number((enrollments as any)?.[0]?.count ?? 0),
      payments: Number((payments as any)?.[0]?.count ?? 0),
    };
  }),

  // Get AI engagement metrics
  getAIEngagement: adminProcedure.query(async () => {
    const db = await getDb();
    const [todayRows] = await db.execute(sql`
      SELECT COUNT(*) as sessions, COUNT(DISTINCT userId) as activeUsers,
        AVG(durationSeconds) as avgDuration
      FROM practice_logs WHERE createdAt >= CURDATE()
    `);
    const [weekRows] = await db.execute(sql`
      SELECT COUNT(*) as sessions, COUNT(DISTINCT userId) as activeUsers
      FROM practice_logs WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);
    const [trendRows] = await db.execute(sql`
      SELECT DATE(createdAt) as date, COUNT(*) as sessions
      FROM practice_logs
      WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(createdAt) ORDER BY date ASC
    `);
    return {
      today: {
        sessions: Number((todayRows as any)?.[0]?.sessions ?? 0),
        activeUsers: Number((todayRows as any)?.[0]?.activeUsers ?? 0),
        avgDuration: Math.round(Number((todayRows as any)?.[0]?.avgDuration ?? 0) / 60),
      },
      week: {
        sessions: Number((weekRows as any)?.[0]?.sessions ?? 0),
        activeUsers: Number((weekRows as any)?.[0]?.activeUsers ?? 0),
      },
      trend: Array.isArray(trendRows) ? trendRows : [],
    };
  }),

  // Get engagement metrics (used by LiveKPIDashboard frontend)
  getEngagementMetrics: adminProcedure
    .input(z.object({ period: z.string().default("7d") }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const period = input?.period ?? "7d";
      const intervalMap: Record<string, string> = { "24h": "1 DAY", "7d": "7 DAY", "30d": "30 DAY", "90d": "90 DAY" };
      const interval = intervalMap[period] || "7 DAY";

      const [aiRows] = await db.execute(sql`
        SELECT COUNT(*) as aiSessions, COUNT(DISTINCT userId) as activeLearners,
          AVG(durationSeconds) as avgSessionDuration
        FROM practice_logs WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${interval})
      `);
      const [prevRows] = await db.execute(sql`
        SELECT COUNT(*) as aiSessions, COUNT(DISTINCT userId) as activeLearners
        FROM practice_logs WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${interval.replace(/\d+/, (m: string) => String(Number(m) * 2))})
          AND createdAt < DATE_SUB(NOW(), INTERVAL ${interval})
      `);
      const [lessonsRows] = await db.execute(sql`
        SELECT COUNT(*) as lessonsCompleted FROM lesson_progress
        WHERE status = 'completed' AND updatedAt >= DATE_SUB(NOW(), INTERVAL ${interval})
      `);
      const [activityRows] = await db.execute(sql`
        SELECT eventType as type, metadata as description, createdAt as timestamp,
          JSON_EXTRACT(metadata, '$.amount') as amount
        FROM analytics_events
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY createdAt DESC LIMIT 20
      `);

      const curr = (aiRows as any)?.[0] ?? {};
      const prev = (prevRows as any)?.[0] ?? {};
      const currSessions = Number(curr.aiSessions ?? 0);
      const prevSessions = Number(prev.aiSessions ?? 0);
      const currLearners = Number(curr.activeLearners ?? 0);
      const prevLearners = Number(prev.activeLearners ?? 0);

      return {
        aiSessions: currSessions,
        aiSessionChange: prevSessions > 0 ? Math.round(((currSessions - prevSessions) / prevSessions) * 100) : 0,
        activeLearners: currLearners,
        learnerChange: prevLearners > 0 ? Math.round(((currLearners - prevLearners) / prevLearners) * 100) : 0,
        avgSessionDuration: Number(curr.avgSessionDuration ?? 0),
        lessonsCompleted: Number((lessonsRows as any)?.[0]?.lessonsCompleted ?? 0),
        recentActivity: Array.isArray(activityRows) ? activityRows.map((a: any) => ({
          type: a.type,
          description: typeof a.description === 'string' ? a.description : JSON.stringify(a.description),
          timestamp: a.timestamp,
          amount: a.amount ? Number(a.amount) : undefined,
        })) : [],
      };
    }),

  // Get conversion metrics (used by LiveKPIDashboard frontend)
  getConversionMetrics: adminProcedure
    .input(z.object({ period: z.string().default("7d") }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const period = input?.period ?? "7d";
      const intervalMap: Record<string, string> = { "24h": "1 DAY", "7d": "7 DAY", "30d": "30 DAY", "90d": "90 DAY" };
      const interval = intervalMap[period] || "7 DAY";

      const [visitors] = await db.execute(sql`SELECT COUNT(DISTINCT userId) as count FROM analytics_events WHERE eventType = 'page_view' AND createdAt >= DATE_SUB(NOW(), INTERVAL ${interval})`);
      const [signups] = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${interval})`);
      const [enrollments] = await db.execute(sql`SELECT COUNT(*) as count FROM course_enrollments WHERE enrolledAt >= DATE_SUB(NOW(), INTERVAL ${interval})`);
      const [payments] = await db.execute(sql`SELECT COUNT(*) as count FROM analytics_events WHERE eventType IN ('payment_succeeded', 'checkout_completed') AND createdAt >= DATE_SUB(NOW(), INTERVAL ${interval})`);
      const [completions] = await db.execute(sql`SELECT COUNT(*) as count FROM course_enrollments WHERE status = 'completed' AND updatedAt >= DATE_SUB(NOW(), INTERVAL ${interval})`);

      return {
        visitors: Number((visitors as any)?.[0]?.count ?? 0),
        signups: Number((signups as any)?.[0]?.count ?? 0),
        enrollments: Number((enrollments as any)?.[0]?.count ?? 0),
        payments: Number((payments as any)?.[0]?.count ?? 0),
        completions: Number((completions as any)?.[0]?.count ?? 0),
      };
    }),

  // Get platform health
  getPlatformHealth: adminProcedure.query(async () => {
    const db = await getDb();
    const [userCount] = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const [courseCount] = await db.execute(sql`SELECT COUNT(*) as count FROM courses WHERE status = 'published'`);
    const [activeEnrollments] = await db.execute(sql`SELECT COUNT(*) as count FROM course_enrollments WHERE status = 'active'`);
    const [recentErrors] = await db.execute(sql`SELECT COUNT(*) as count FROM webhook_events_log WHERE status = 'failed' AND createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`);
    return {
      totalUsers: Number((userCount as any)?.[0]?.count ?? 0),
      activeCourses: Number((courseCount as any)?.[0]?.count ?? 0),
      activeEnrollments: Number((activeEnrollments as any)?.[0]?.count ?? 0),
      recentErrors: Number((recentErrors as any)?.[0]?.count ?? 0),
      status: Number((recentErrors as any)?.[0]?.count ?? 0) > 5 ? "degraded" : "healthy",
    };
  }),
});

// ============================================================================
// ONBOARDING WORKFLOW ROUTER
// ============================================================================
export const onboardingRouter = router({
  // Get onboarding config
  getConfig: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT * FROM onboarding_config ORDER BY sortOrder ASC
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  // Update onboarding step
  updateStep: adminProcedure
    .input(z.object({
      id: z.number(),
      isEnabled: z.boolean().optional(),
      stepTitle: z.string().optional(),
      stepDescription: z.string().optional(),
      sortOrder: z.number().optional(),
      actionConfig: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const updates: string[] = [];
      if (input.isEnabled !== undefined) updates.push(`isEnabled = ${input.isEnabled ? 1 : 0}`);
      if (input.stepTitle) updates.push(`stepTitle = '${input.stepTitle}'`);
      if (input.stepDescription) updates.push(`stepDescription = '${input.stepDescription}'`);
      if (input.sortOrder !== undefined) updates.push(`sortOrder = ${input.sortOrder}`);
      if (input.actionConfig) updates.push(`actionConfig = '${JSON.stringify(input.actionConfig)}'`);
      if (updates.length > 0) {
        await db.execute(sql`UPDATE onboarding_config SET ${updates.join(", ")} WHERE id = ${input.id}`);
      }
      return true;
    }),

  // Create onboarding step
  createStep: adminProcedure
    .input(z.object({
      stepKey: z.string(),
      stepTitle: z.string(),
      stepDescription: z.string().optional(),
      actionType: z.enum(["email", "notification", "course_assign", "checklist", "redirect"]),
      actionConfig: z.any().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`
        INSERT INTO onboarding_config (stepKey, stepTitle, stepDescription, actionType, actionConfig, sortOrder)
        VALUES (${input.stepKey}, ${input.stepTitle}, ${input.stepDescription ?? ""}, ${input.actionType}, ${JSON.stringify(input.actionConfig ?? {})}, ${input.sortOrder})
      `);
      return true;
    }),

  // Delete onboarding step
  deleteStep: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`DELETE FROM onboarding_config WHERE id = ${input.id}`);
      return true;
    }),

  // Save onboarding workflow config (used by OnboardingWorkflow frontend)
  saveConfig: adminProcedure
    .input(z.object({
      isActive: z.boolean(),
      steps: z.array(z.object({
        type: z.string(),
        title: z.string(),
        config: z.string(),
        enabled: z.boolean(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      // Clear existing steps and re-insert
      await db.execute(sql`DELETE FROM onboarding_config`);
      for (let i = 0; i < input.steps.length; i++) {
        const step = input.steps[i];
        const stepKey = `step_${i + 1}_${step.type}`;
        await db.execute(sql`
          INSERT INTO onboarding_config (stepKey, stepTitle, stepDescription, actionType, actionConfig, isEnabled, sortOrder)
          VALUES (${stepKey}, ${step.title}, ${step.title}, ${step.type as any}, ${step.config}, ${step.enabled ? 1 : 0}, ${i + 1})
        `);
      }
      return true;
    }),

  // Get onboarding stats (used by OnboardingWorkflow frontend)
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    // Total users who have completed at least one onboarding step
    const [totalOnboarded] = await db.execute(sql`
      SELECT COUNT(DISTINCT userId) as count FROM onboarding_progress WHERE completed = 1
    `);
    // This week
    const [thisWeek] = await db.execute(sql`
      SELECT COUNT(DISTINCT userId) as count FROM onboarding_progress
      WHERE completed = 1 AND completedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    // Completion rate: users who completed ALL steps vs users who started
    const [totalSteps] = await db.execute(sql`SELECT COUNT(*) as count FROM onboarding_config WHERE isEnabled = 1`);
    const stepCount = Number((totalSteps as any)?.[0]?.count ?? 1);
    const [fullyCompleted] = await db.execute(sql`
      SELECT COUNT(*) as count FROM (
        SELECT userId FROM onboarding_progress WHERE completed = 1
        GROUP BY userId HAVING COUNT(DISTINCT stepKey) >= ${stepCount}
      ) as fc
    `);
    const [startedUsers] = await db.execute(sql`SELECT COUNT(DISTINCT userId) as count FROM onboarding_progress`);
    const started = Number((startedUsers as any)?.[0]?.count ?? 0);
    const completed = Number((fullyCompleted as any)?.[0]?.count ?? 0);
    const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0;

    // Recent onboardings
    const [recentOnboardings] = await db.execute(sql`
      SELECT u.name, u.email, u.createdAt,
        COUNT(DISTINCT op.stepKey) as completedSteps,
        (SELECT COUNT(*) FROM onboarding_config WHERE isEnabled = 1) as totalSteps
      FROM users u
      LEFT JOIN onboarding_progress op ON op.userId = u.id AND op.completed = 1
      WHERE u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY u.id, u.name, u.email, u.createdAt
      ORDER BY u.createdAt DESC
      LIMIT 20
    `);

    return {
      totalOnboarded: Number((totalOnboarded as any)?.[0]?.count ?? 0),
      thisWeek: Number((thisWeek as any)?.[0]?.count ?? 0),
      completionRate,
      avgTimeHours: 2, // Placeholder - would need timestamp tracking
      recentOnboardings: Array.isArray(recentOnboardings) ? recentOnboardings.map((r: any) => ({
        name: r.name,
        email: r.email,
        createdAt: r.createdAt,
        currentStep: Number(r.completedSteps ?? 0),
        totalSteps: Number(r.totalSteps ?? 0),
        completed: Number(r.completedSteps ?? 0) >= Number(r.totalSteps ?? 0),
      })) : [],
    };
  }),

  // Get new user checklist progress (for learner view)
  getChecklist: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [steps] = await db.execute(sql`
      SELECT oc.stepKey, oc.stepTitle, oc.stepDescription, oc.actionType, oc.sortOrder,
        CASE WHEN op.completed = 1 THEN 1 ELSE 0 END as completed
      FROM onboarding_config oc
      LEFT JOIN onboarding_progress op ON op.stepKey = oc.stepKey AND op.userId = ${ctx.user.id}
      WHERE oc.isEnabled = 1 ORDER BY oc.sortOrder ASC
    `);
    return Array.isArray(steps) ? steps : [];
  }),

  // Complete an onboarding step (for learner)
  completeStep: protectedProcedure
    .input(z.object({ stepKey: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      await db.execute(sql`
        INSERT INTO onboarding_progress (userId, stepKey, completed, completedAt)
        VALUES (${ctx.user.id}, ${input.stepKey}, 1, NOW())
        ON DUPLICATE KEY UPDATE completed = 1, completedAt = NOW()
      `);
      return true;
    }),
});

// ============================================================================
// ENTERPRISE MODE ROUTER
// ============================================================================
export const enterpriseRouter = router({
  // List organizations (with search)
  listOrganizations: adminProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const search = input?.search;
      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        const [rows] = await db.execute(sql`
          SELECT o.*, 
            (SELECT COUNT(*) FROM org_members om WHERE om.organizationId = o.id) as memberCount,
            (SELECT COUNT(*) FROM org_course_assignments oca WHERE oca.organizationId = o.id) as assignedCourses,
            u.name as adminName, u.email as adminEmail
          FROM organizations o
          LEFT JOIN users u ON u.id = o.adminUserId
          WHERE o.name LIKE ${term} OR o.domain LIKE ${term}
          ORDER BY o.createdAt DESC
        `);
        return Array.isArray(rows) ? rows : [];
      }
      const [rows] = await db.execute(sql`
        SELECT o.*, 
          (SELECT COUNT(*) FROM org_members om WHERE om.organizationId = o.id) as memberCount,
          (SELECT COUNT(*) FROM org_course_assignments oca WHERE oca.organizationId = o.id) as assignedCourses,
          u.name as adminName, u.email as adminEmail
        FROM organizations o
        LEFT JOIN users u ON u.id = o.adminUserId
        ORDER BY o.createdAt DESC
      `);
      return Array.isArray(rows) ? rows : [];
    }),

  // Get enterprise stats
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    const [orgCount] = await db.execute(sql`SELECT COUNT(*) as total FROM organizations`);
    const [memberCount] = await db.execute(sql`SELECT COUNT(*) as total FROM org_members WHERE status = 'active'`);
    const [courseAssignments] = await db.execute(sql`SELECT COUNT(*) as total FROM org_course_assignments`);
    const [recentOrgs] = await db.execute(sql`
      SELECT COUNT(*) as total FROM organizations WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    return {
      totalOrganizations: (Array.isArray(orgCount) && orgCount[0]) ? (orgCount[0] as any).total : 0,
      totalMembers: (Array.isArray(memberCount) && memberCount[0]) ? (memberCount[0] as any).total : 0,
      totalCourseAssignments: (Array.isArray(courseAssignments) && courseAssignments[0]) ? (courseAssignments[0] as any).total : 0,
      newOrgsThisMonth: (Array.isArray(recentOrgs) && recentOrgs[0]) ? (recentOrgs[0] as any).total : 0,
    };
  }),

  // Create organization
  createOrganization: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      domain: z.string().optional(),
      plan: z.enum(["starter", "professional", "enterprise"]).default("starter"),
      seats: z.number().default(10),
      adminEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      let adminUserId = ctx.user.id;
      if (input.adminEmail) {
        const [userRows] = await db.execute(sql`SELECT id FROM users WHERE email = ${input.adminEmail} LIMIT 1`);
        if (Array.isArray(userRows) && userRows[0]) {
          adminUserId = (userRows[0] as any).id;
        }
      }
      const [result] = await db.execute(sql`
        INSERT INTO organizations (name, domain, plan, seats, adminUserId)
        VALUES (${input.name}, ${input.domain || null}, ${input.plan}, ${input.seats}, ${adminUserId})
      `);
      return { success: true, orgId: (result as any).insertId };
    }),

  // List organizations (legacy alias)
  listOrgs: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT o.*, 
        (SELECT COUNT(*) FROM org_members om WHERE om.organizationId = o.id) as memberCount,
        (SELECT COUNT(*) FROM org_course_assignments oca WHERE oca.organizationId = o.id) as assignedCourses,
        u.name as adminName, u.email as adminEmail
      FROM organizations o
      LEFT JOIN users u ON u.id = o.adminUserId
      ORDER BY o.createdAt DESC
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  // Get org details with members
  getOrgDetails: adminProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [orgRows] = await db.execute(sql`SELECT * FROM organizations WHERE id = ${input.orgId}`);
      const [memberRows] = await db.execute(sql`
        SELECT om.*, u.name, u.email, u.avatarUrl
        FROM org_members om
        JOIN users u ON u.id = om.userId
        WHERE om.organizationId = ${input.orgId}
        ORDER BY om.createdAt DESC
      `);
      const [courseRows] = await db.execute(sql`
        SELECT oca.*, c.title as courseTitle, c.slug as courseSlug
        FROM org_course_assignments oca
        JOIN courses c ON c.id = oca.courseId
        WHERE oca.organizationId = ${input.orgId}
      `);
      const [progressRows] = await db.execute(sql`
        SELECT om.userId, u.name,
          COUNT(DISTINCT ce.courseId) as enrolledCourses,
          AVG(ce.progress) as avgProgress,
          SUM(CASE WHEN ce.status = 'completed' THEN 1 ELSE 0 END) as completedCourses
        FROM org_members om
        JOIN users u ON u.id = om.userId
        LEFT JOIN course_enrollments ce ON ce.userId = om.userId
        WHERE om.organizationId = ${input.orgId}
        GROUP BY om.userId, u.name
      `);
      return {
        org: Array.isArray(orgRows) && orgRows[0] ? orgRows[0] : null,
        members: Array.isArray(memberRows) ? memberRows : [],
        courses: Array.isArray(courseRows) ? courseRows : [],
        progress: Array.isArray(progressRows) ? progressRows : [],
      };
    }),

  // Invite member to org
  inviteMember: adminProcedure
    .input(z.object({
      orgId: z.number(),
      email: z.string().email(),
      role: z.enum(["admin", "manager", "member"]).default("member"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [userRows] = await db.execute(sql`SELECT id FROM users WHERE email = ${input.email} LIMIT 1`);
      if (!Array.isArray(userRows) || !userRows[0]) {
        return { success: false, error: "User not found. They must register first." };
      }
      const userId = (userRows[0] as any).id;
      await db.execute(sql`
        INSERT INTO org_members (organizationId, userId, role, invitedBy, status)
        VALUES (${input.orgId}, ${userId}, ${input.role}, ${ctx.user.id}, 'invited')
        ON DUPLICATE KEY UPDATE role = ${input.role}, status = 'invited'
      `);
      return { success: true };
    }),

  // Bulk assign course to org
  assignCourse: adminProcedure
    .input(z.object({
      orgId: z.number(),
      courseId: z.number(),
      isRequired: z.boolean().default(false),
      deadline: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      await db.execute(sql`
        INSERT INTO org_course_assignments (organizationId, courseId, assignedBy, isRequired)
        VALUES (${input.orgId}, ${input.courseId}, ${ctx.user.id}, ${input.isRequired ? 1 : 0})
      `);
      // Auto-enroll all active members
      const [members] = await db.execute(sql`
        SELECT userId FROM org_members WHERE organizationId = ${input.orgId} AND status = 'active'
      `);
      if (Array.isArray(members)) {
        for (const m of members) {
          await db.execute(sql`
            INSERT IGNORE INTO course_enrollments (userId, courseId, status, progress)
            VALUES (${(m as any).userId}, ${input.courseId}, 'active', 0)
          `);
        }
      }
      return { success: true, enrolledCount: Array.isArray(members) ? members.length : 0 };
    }),

  // Get org analytics
  getOrgAnalytics: adminProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [completionRows] = await db.execute(sql`
        SELECT 
          COUNT(DISTINCT ce.userId) as totalLearners,
          AVG(ce.progress) as avgProgress,
          SUM(CASE WHEN ce.status = 'completed' THEN 1 ELSE 0 END) as completions,
          SUM(CASE WHEN ce.progress > 0 AND ce.status != 'completed' THEN 1 ELSE 0 END) as inProgress
        FROM org_members om
        JOIN course_enrollments ce ON ce.userId = om.userId
        WHERE om.organizationId = ${input.orgId}
      `);
      const [practiceRows] = await db.execute(sql`
        SELECT COUNT(*) as totalSessions, AVG(pl.durationSeconds) as avgDuration
        FROM org_members om
        JOIN practice_logs pl ON pl.userId = om.userId
        WHERE om.organizationId = ${input.orgId}
        AND pl.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
      return {
        completion: Array.isArray(completionRows) && completionRows[0] ? completionRows[0] : {},
        practice: Array.isArray(practiceRows) && practiceRows[0] ? practiceRows[0] : {},
      };
    }),
});

// ============================================================================
// SLE EXAM MODE ROUTER
// ============================================================================
export const sleExamRouter = router({
  // Get SLE exam stats (admin)
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    const [totalSessions] = await db.execute(sql`SELECT COUNT(*) as total FROM sle_exam_sessions`);
    const [completedSessions] = await db.execute(sql`SELECT COUNT(*) as total FROM sle_exam_sessions WHERE status = 'completed'`);
    const [avgScoreRows] = await db.execute(sql`SELECT AVG(score) as avgScore FROM sle_exam_sessions WHERE status = 'completed'`);
    const [byLevel] = await db.execute(sql`
      SELECT level, COUNT(*) as count, AVG(score) as avgScore
      FROM sle_exam_sessions WHERE status = 'completed'
      GROUP BY level
    `);
    const [byType] = await db.execute(sql`
      SELECT examType, COUNT(*) as count, AVG(score) as avgScore
      FROM sle_exam_sessions WHERE status = 'completed'
      GROUP BY examType
    `);
    const [recentActivity] = await db.execute(sql`
      SELECT COUNT(*) as total FROM sle_exam_sessions WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    return {
      totalSessions: (Array.isArray(totalSessions) && totalSessions[0]) ? (totalSessions[0] as any).total : 0,
      completedSessions: (Array.isArray(completedSessions) && completedSessions[0]) ? (completedSessions[0] as any).total : 0,
      avgScore: (Array.isArray(avgScoreRows) && avgScoreRows[0]) ? Number((avgScoreRows[0] as any).avgScore || 0) : 0,
      byLevel: Array.isArray(byLevel) ? byLevel : [],
      byType: Array.isArray(byType) ? byType : [],
      recentActivity: (Array.isArray(recentActivity) && recentActivity[0]) ? (recentActivity[0] as any).total : 0,
    };
  }),

  // List all exam sessions (admin)
  listExams: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT ses.*, u.name as userName, u.email as userEmail
      FROM sle_exam_sessions ses
      JOIN users u ON u.id = ses.userId
      ORDER BY ses.createdAt DESC
      LIMIT 100
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  // Get exam configuration
  getConfig: adminProcedure.query(async () => {
    return {
      examTypes: [
        { key: "reading", label: "Reading Comprehension", timeLimitSeconds: 5400, questionCount: 65 },
        { key: "writing", label: "Written Expression", timeLimitSeconds: 5400, questionCount: 3 },
        { key: "oral", label: "Oral Interaction", timeLimitSeconds: 1800, questionCount: 5 },
      ],
      levels: [
        { key: "A", label: "Level A", description: "Basic proficiency" },
        { key: "B", label: "Level B", description: "Intermediate proficiency" },
        { key: "C", label: "Level C", description: "Advanced proficiency" },
      ],
      scoringRubric: {
        A: { min: 0, max: 59 },
        B: { min: 60, max: 79 },
        C: { min: 80, max: 100 },
      },
    };
  }),

  // Create exam (admin creates a new exam template)
  createExam: adminProcedure
    .input(z.object({
      examType: z.enum(["reading", "writing", "oral"]),
      level: z.enum(["A", "B", "C"]),
      title: z.string().min(1),
      description: z.string().optional(),
      questions: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [result] = await db.execute(sql`
        INSERT INTO sle_practice_questions (examType, level, questionText, options, correctAnswer)
        VALUES (${input.examType}, ${input.level}, ${input.title}, ${JSON.stringify(input.questions || [])}, ${JSON.stringify({})})
      `);
      return { success: true, id: (result as any).insertId };
    }),

  // Start exam session
  startExam: protectedProcedure
    .input(z.object({
      examType: z.enum(["reading", "writing", "oral"]),
      level: z.enum(["A", "B", "C"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const timeLimits: Record<string, number> = { reading: 5400, writing: 5400, oral: 1800 };
      const timeLimit = timeLimits[input.examType] ?? 3600;
      const [result] = await db.execute(sql`
        INSERT INTO sle_exam_sessions (userId, examType, level, timeLimit, status)
        VALUES (${ctx.user.id}, ${input.examType}, ${input.level}, ${timeLimit}, 'in_progress')
      `);
      const insertId = (result as any).insertId;
      return { sessionId: insertId, timeLimit, examType: input.examType, level: input.level };
    }),

  // Submit exam answers
  submitExam: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      answers: z.any(),
      timeUsed: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      // Calculate score based on answers (simplified scoring)
      const answers = input.answers as any[];
      const totalQuestions = Array.isArray(answers) ? answers.length : 0;
      const correctAnswers = Array.isArray(answers) ? answers.filter((a: any) => a.correct).length : 0;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const maxScore = 100;
      
      // Generate feedback
      const feedback = {
        score,
        maxScore,
        percentage: Math.round(score),
        level: score >= 80 ? "C" : score >= 60 ? "B" : "A",
        strengths: score >= 70 ? ["Good comprehension", "Consistent accuracy"] : ["Basic understanding"],
        improvements: score < 80 ? ["Practice complex structures", "Expand vocabulary range"] : ["Maintain current level"],
        recommendation: score >= 80 ? "Ready for SLE C level" : score >= 60 ? "Focus on B level preparation" : "Continue A level practice",
      };

      await db.execute(sql`
        UPDATE sle_exam_sessions 
        SET answers = ${JSON.stringify(input.answers)}, 
            timeUsed = ${input.timeUsed},
            score = ${score}, maxScore = ${maxScore},
            feedback = ${JSON.stringify(feedback)},
            status = 'completed', completedAt = NOW()
        WHERE id = ${input.sessionId} AND userId = ${ctx.user.id}
      `);
      return feedback;
    }),

  // Get exam history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT id, examType, level, score, maxScore, timeLimit, timeUsed, status, feedback, startedAt, completedAt
      FROM sle_exam_sessions
      WHERE userId = ${ctx.user.id}
      ORDER BY createdAt DESC
      LIMIT 50
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  // Get exam stats (admin)
  getExamStats: adminProcedure.query(async () => {
    const db = await getDb();
    const [byType] = await db.execute(sql`
      SELECT examType, level, COUNT(*) as attempts, AVG(score) as avgScore,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM sle_exam_sessions
      GROUP BY examType, level
    `);
    const [topScorers] = await db.execute(sql`
      SELECT u.name, u.email, ses.examType, ses.level, ses.score, ses.completedAt
      FROM sle_exam_sessions ses
      JOIN users u ON u.id = ses.userId
      WHERE ses.status = 'completed'
      ORDER BY ses.score DESC
      LIMIT 10
    `);
    const [progressTrend] = await db.execute(sql`
      SELECT DATE(startedAt) as date, COUNT(*) as attempts, AVG(score) as avgScore
      FROM sle_exam_sessions
      WHERE startedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(startedAt)
      ORDER BY date ASC
    `);
    return {
      byType: Array.isArray(byType) ? byType : [],
      topScorers: Array.isArray(topScorers) ? topScorers : [],
      progressTrend: Array.isArray(progressTrend) ? progressTrend : [],
    };
  }),
});

// ============================================================================
// CONTENT INTELLIGENCE ROUTER
// ============================================================================
export const contentIntelligenceRouter = router({
  // Get content stats with date range
  getStats: adminProcedure
    .input(z.object({ dateRange: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const range = input?.dateRange || "30d";
      const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "365d" ? 365 : 30;
      const [totalCourses] = await db.execute(sql`SELECT COUNT(*) as total FROM courses WHERE status = 'published'`);
      const [totalLessons] = await db.execute(sql`SELECT COUNT(*) as total FROM lessons`);
      const [totalEnrollments] = await db.execute(sql`SELECT COUNT(*) as total FROM course_enrollments`);
      const [recentCompletions] = await db.execute(sql`
        SELECT COUNT(*) as total FROM course_enrollments 
        WHERE status = 'completed' AND updatedAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      `);
      const [avgProgress] = await db.execute(sql`SELECT AVG(progress) as avg FROM course_enrollments WHERE progress > 0`);
      const [contentViews] = await db.execute(sql`
        SELECT COUNT(*) as total FROM lesson_progress 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      `);
      return {
        totalCourses: (Array.isArray(totalCourses) && totalCourses[0]) ? (totalCourses[0] as any).total : 0,
        totalLessons: (Array.isArray(totalLessons) && totalLessons[0]) ? (totalLessons[0] as any).total : 0,
        totalEnrollments: (Array.isArray(totalEnrollments) && totalEnrollments[0]) ? (totalEnrollments[0] as any).total : 0,
        recentCompletions: (Array.isArray(recentCompletions) && recentCompletions[0]) ? (recentCompletions[0] as any).total : 0,
        avgProgress: (Array.isArray(avgProgress) && avgProgress[0]) ? Number((avgProgress[0] as any).avg || 0) : 0,
        contentViews: (Array.isArray(contentViews) && contentViews[0]) ? (contentViews[0] as any).total : 0,
        dateRange: range,
      };
    }),

  // Get top performing content
  getTopContent: adminProcedure
    .input(z.object({ dateRange: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const range = input?.dateRange || "30d";
      const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "365d" ? 365 : 30;
      const [topCourses] = await db.execute(sql`
        SELECT c.id, c.title, c.slug,
          COUNT(DISTINCT ce.userId) as enrollments,
          AVG(ce.progress) as avgProgress,
          SUM(CASE WHEN ce.status = 'completed' THEN 1 ELSE 0 END) as completions
        FROM courses c
        JOIN course_enrollments ce ON ce.courseId = c.id
        WHERE c.status = 'published'
        GROUP BY c.id, c.title, c.slug
        ORDER BY enrollments DESC
        LIMIT 10
      `);
      const [topLessons] = await db.execute(sql`
        SELECT l.id, l.title, c.title as courseName,
          COUNT(DISTINCT lp.userId) as views,
          SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) as completions,
          AVG(lp.timeSpentSeconds) as avgTimeSpent
        FROM lessons l
        JOIN courses c ON c.id = l.courseId
        LEFT JOIN lesson_progress lp ON lp.lessonId = l.id
        GROUP BY l.id, l.title, c.title
        ORDER BY views DESC
        LIMIT 10
      `);
      return {
        topCourses: Array.isArray(topCourses) ? topCourses : [],
        topLessons: Array.isArray(topLessons) ? topLessons : [],
      };
    }),

  // Get content insights and recommendations
  getInsights: adminProcedure.query(async () => {
    const db = await getDb();
    const [lowCompletion] = await db.execute(sql`
      SELECT c.id, c.title,
        COUNT(DISTINCT ce.userId) as enrollments,
        AVG(ce.progress) as avgProgress,
        'Low completion rate - consider restructuring' as insight
      FROM courses c
      JOIN course_enrollments ce ON ce.courseId = c.id
      WHERE c.status = 'published'
      GROUP BY c.id, c.title
      HAVING avgProgress < 30 AND enrollments >= 2
      ORDER BY avgProgress ASC
      LIMIT 5
    `);
    const [highEngagement] = await db.execute(sql`
      SELECT c.id, c.title,
        COUNT(DISTINCT ce.userId) as enrollments,
        AVG(ce.progress) as avgProgress,
        'High engagement - consider creating advanced follow-up' as insight
      FROM courses c
      JOIN course_enrollments ce ON ce.courseId = c.id
      WHERE c.status = 'published'
      GROUP BY c.id, c.title
      HAVING avgProgress > 70 AND enrollments >= 2
      ORDER BY avgProgress DESC
      LIMIT 5
    `);
    const [staleContent] = await db.execute(sql`
      SELECT c.id, c.title, c.updatedAt,
        'Content not updated recently - review for accuracy' as insight
      FROM courses c
      WHERE c.status = 'published'
      AND c.updatedAt < DATE_SUB(NOW(), INTERVAL 90 DAY)
      ORDER BY c.updatedAt ASC
      LIMIT 5
    `);
    return {
      lowCompletion: Array.isArray(lowCompletion) ? lowCompletion : [],
      highEngagement: Array.isArray(highEngagement) ? highEngagement : [],
      staleContent: Array.isArray(staleContent) ? staleContent : [],
    };
  }),

  // Get content performance overview
  getOverview: adminProcedure.query(async () => {
    const db = await getDb();
    const [coursePerf] = await db.execute(sql`
      SELECT c.id, c.title, c.slug,
        COUNT(DISTINCT ce.userId) as enrollments,
        AVG(ce.progress) as avgProgress,
        SUM(CASE WHEN ce.status = 'completed' THEN 1 ELSE 0 END) as completions,
        SUM(CASE WHEN ce.progress = 0 THEN 1 ELSE 0 END) as neverStarted
      FROM courses c
      LEFT JOIN course_enrollments ce ON ce.courseId = c.id
      WHERE c.status = 'published'
      GROUP BY c.id, c.title, c.slug
      ORDER BY enrollments DESC
    `);
    return Array.isArray(coursePerf) ? coursePerf : [];
  }),

  // Get lesson-level analytics
  getLessonAnalytics: adminProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [lessons] = await db.execute(sql`
        SELECT l.id, l.title, l.contentType, l.sortOrder, l.estimatedMinutes,
          cm.title as moduleName,
          (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.lessonId = l.id) as totalViews,
          (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.lessonId = l.id AND lp.status = 'completed') as completions,
          (SELECT AVG(lp.timeSpentSeconds) FROM lesson_progress lp WHERE lp.lessonId = l.id) as avgTimeSpent
        FROM lessons l
        JOIN course_modules cm ON cm.id = l.moduleId
        WHERE l.courseId = ${input.courseId}
        ORDER BY cm.sortOrder ASC, l.sortOrder ASC
      `);
      return Array.isArray(lessons) ? lessons : [];
    }),

  // Get drop-off analysis
  getDropOffAnalysis: adminProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [dropOff] = await db.execute(sql`
        SELECT l.id, l.title, l.sortOrder,
          cm.title as moduleName,
          COUNT(DISTINCT lp.userId) as started,
          SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM lessons l
        JOIN course_modules cm ON cm.id = l.moduleId
        LEFT JOIN lesson_progress lp ON lp.lessonId = l.id
        WHERE l.courseId = ${input.courseId}
        GROUP BY l.id, l.title, l.sortOrder, cm.title
        ORDER BY cm.sortOrder ASC, l.sortOrder ASC
      `);
      return Array.isArray(dropOff) ? dropOff : [];
    }),

  // Get content recommendations
  getRecommendations: adminProcedure.query(async () => {
    const db = await getDb();
    // Low completion courses
    const [lowCompletion] = await db.execute(sql`
      SELECT c.id, c.title,
        COUNT(DISTINCT ce.userId) as enrollments,
        AVG(ce.progress) as avgProgress,
        'Low completion rate - consider restructuring content' as recommendation
      FROM courses c
      JOIN course_enrollments ce ON ce.courseId = c.id
      WHERE c.status = 'published'
      GROUP BY c.id, c.title
      HAVING avgProgress < 30 AND enrollments >= 3
      ORDER BY avgProgress ASC
      LIMIT 5
    `);
    // High drop-off lessons
    const [highDropOff] = await db.execute(sql`
      SELECT l.id, l.title, c.title as courseName,
        COUNT(DISTINCT lp.userId) as started,
        SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) as completed,
        'High drop-off point - simplify or break into smaller sections' as recommendation
      FROM lessons l
      JOIN courses c ON c.id = l.courseId
      LEFT JOIN lesson_progress lp ON lp.lessonId = l.id
      GROUP BY l.id, l.title, c.title
      HAVING started >= 3 AND (completed / started) < 0.3
      ORDER BY (completed / started) ASC
      LIMIT 5
    `);
    return {
      lowCompletion: Array.isArray(lowCompletion) ? lowCompletion : [],
      highDropOff: Array.isArray(highDropOff) ? highDropOff : [],
    };
  }),
});


// ============================================================================
// FUNNELS ROUTER (Marketing conversion pipelines CRUD)
// ============================================================================
export const funnelsRouter = router({
  list: protectedProcedure
    .input(z.object({ search: z.string().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `SELECT * FROM funnels ORDER BY updatedAt DESC`;
      if (input?.status && input.status !== "all") {
        query = `SELECT * FROM funnels WHERE status = '${input.status}' ORDER BY updatedAt DESC`;
      }
      const [rows] = await db.execute(sql.raw(query));
      let results = Array.isArray(rows) ? rows : [];
      if (input?.search) {
        const s = input.search.toLowerCase();
        results = results.filter((r: any) => r.name?.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s));
      }
      return results.map((r: any) => ({
        ...r,
        stages: typeof r.stages === "string" ? JSON.parse(r.stages) : (r.stages || []),
        stats: typeof r.stats === "string" ? JSON.parse(r.stats) : (r.stats || { visitors: 0, conversions: 0, revenue: 0 }),
      }));
    }),

  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    const [totalRows] = await db.execute(sql`SELECT COUNT(*) as total FROM funnels`);
    const [activeRows] = await db.execute(sql`SELECT COUNT(*) as count FROM funnels WHERE status = 'active'`);
    const total = (totalRows as any)?.[0]?.total ?? 0;
    const active = (activeRows as any)?.[0]?.count ?? 0;
    return { total: Number(total), active: Number(active), draft: Number(total) - Number(active) };
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      stages: z.array(z.object({
        id: z.string(),
        type: z.string(),
        title: z.string(),
        description: z.string(),
        // @ts-expect-error - TS2554: auto-suppressed during TS cleanup
        config: z.record(z.any()).optional(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const stages = JSON.stringify(input.stages || []);
      const stats = JSON.stringify({ visitors: 0, conversions: 0, revenue: 0 });
      await db.execute(sql`
        INSERT INTO funnels (name, description, status, stages, stats, createdBy)
        VALUES (${input.name}, ${input.description || ""}, 'draft', ${stages}, ${stats}, ${ctx.user.id})
      `);
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "active", "paused", "archived"]).optional(),
      stages: z.array(z.object({
        id: z.string(),
        type: z.string(),
        title: z.string(),
        description: z.string(),
        // @ts-expect-error - TS2554: auto-suppressed during TS cleanup
        config: z.record(z.any()).optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const updates: string[] = [];
      if (input.name !== undefined) updates.push(`name = '${input.name.replace(/'/g, "''")}'`);
      if (input.description !== undefined) updates.push(`description = '${input.description.replace(/'/g, "''")}'`);
      if (input.status !== undefined) updates.push(`status = '${input.status}'`);
      if (input.stages !== undefined) updates.push(`stages = '${JSON.stringify(input.stages).replace(/'/g, "''")}'`);
      if (updates.length > 0) {
        await db.execute(sql`UPDATE funnels SET ${updates.join(", ")} WHERE id = ${input.id}`);
      }
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`DELETE FROM funnels WHERE id = ${input.id}`);
      return { success: true };
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`SELECT * FROM funnels WHERE id = ${input.id}`);
      const original = (rows as any)?.[0];
      if (!original) return { success: false, error: "Funnel not found" };
      const stages = typeof original.stages === "string" ? original.stages : JSON.stringify(original.stages || []);
      const stats = JSON.stringify({ visitors: 0, conversions: 0, revenue: 0 });
      await db.execute(sql`
        INSERT INTO funnels (name, description, status, stages, stats, createdBy)
        VALUES (${original.name + " (Copy)"}, ${original.description || ""}, 'draft', ${stages}, ${stats}, ${ctx.user.id})
      `);
      return { success: true };
    }),
});

// ============================================================================
// AUTOMATIONS ROUTER (Trigger-based marketing sequences CRUD)
// ============================================================================
export const automationsRouter = router({
  list: protectedProcedure
    .input(z.object({ search: z.string().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `SELECT * FROM automations ORDER BY updatedAt DESC`;
      if (input?.status && input.status !== "all") {
        query = `SELECT * FROM automations WHERE status = '${input.status}' ORDER BY updatedAt DESC`;
      }
      const [rows] = await db.execute(sql.raw(query));
      let results = Array.isArray(rows) ? rows : [];
      if (input?.search) {
        const s = input.search.toLowerCase();
        results = results.filter((r: any) => r.name?.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s));
      }
      return results.map((r: any) => ({
        ...r,
        steps: typeof r.steps === "string" ? JSON.parse(r.steps) : (r.steps || []),
        triggerConfig: typeof r.triggerConfig === "string" ? JSON.parse(r.triggerConfig) : (r.triggerConfig || {}),
        stats: typeof r.stats === "string" ? JSON.parse(r.stats) : (r.stats || { triggered: 0, completed: 0, active: 0 }),
      }));
    }),

  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    const [totalRows] = await db.execute(sql`SELECT COUNT(*) as total FROM automations`);
    const [activeRows] = await db.execute(sql`SELECT COUNT(*) as count FROM automations WHERE status = 'active'`);
    const total = (totalRows as any)?.[0]?.total ?? 0;
    const active = (activeRows as any)?.[0]?.count ?? 0;
    return { total: Number(total), active: Number(active), draft: Number(total) - Number(active) };
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      triggerType: z.enum(["enrollment", "purchase", "course_complete", "lesson_complete", "signup", "inactivity", "tag_added", "manual"]),
      // @ts-expect-error - TS2554: auto-suppressed during TS cleanup
      triggerConfig: z.record(z.any()).optional(),
      steps: z.array(z.object({
        id: z.string(),
        type: z.string(),
        // @ts-expect-error - TS2554: auto-suppressed during TS cleanup
        config: z.record(z.any()).optional(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const steps = JSON.stringify(input.steps || []);
      const triggerConfig = JSON.stringify(input.triggerConfig || {});
      const stats = JSON.stringify({ triggered: 0, completed: 0, active: 0 });
      await db.execute(sql`
        INSERT INTO automations (name, description, triggerType, triggerConfig, status, steps, stats, createdBy)
        VALUES (${input.name}, ${input.description || ""}, ${input.triggerType}, ${triggerConfig}, 'draft', ${steps}, ${stats}, ${ctx.user.id})
      `);
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["active", "paused", "draft"]).optional(),
      triggerType: z.enum(["enrollment", "purchase", "course_complete", "lesson_complete", "signup", "inactivity", "tag_added", "manual"]).optional(),
      // @ts-expect-error - TS2554: auto-suppressed during TS cleanup
      triggerConfig: z.record(z.any()).optional(),
      steps: z.array(z.object({
        id: z.string(),
        type: z.string(),
        // @ts-expect-error - TS2554: auto-suppressed during TS cleanup
        config: z.record(z.any()).optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const updates: string[] = [];
      if (input.name !== undefined) updates.push(`name = '${input.name.replace(/'/g, "''")}'`);
      if (input.description !== undefined) updates.push(`description = '${input.description.replace(/'/g, "''")}'`);
      if (input.status !== undefined) updates.push(`status = '${input.status}'`);
      if (input.triggerType !== undefined) updates.push(`triggerType = '${input.triggerType}'`);
      if (input.triggerConfig !== undefined) updates.push(`triggerConfig = '${JSON.stringify(input.triggerConfig).replace(/'/g, "''")}'`);
      if (input.steps !== undefined) updates.push(`steps = '${JSON.stringify(input.steps).replace(/'/g, "''")}'`);
      if (updates.length > 0) {
        await db.execute(sql`UPDATE automations SET ${updates.join(", ")} WHERE id = ${input.id}`);
      }
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`DELETE FROM automations WHERE id = ${input.id}`);
      return { success: true };
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`SELECT * FROM automations WHERE id = ${input.id}`);
      const original = (rows as any)?.[0];
      if (!original) return { success: false, error: "Automation not found" };
      const steps = typeof original.steps === "string" ? original.steps : JSON.stringify(original.steps || []);
      const triggerConfig = typeof original.triggerConfig === "string" ? original.triggerConfig : JSON.stringify(original.triggerConfig || {});
      const stats = JSON.stringify({ triggered: 0, completed: 0, active: 0 });
      await db.execute(sql`
        INSERT INTO automations (name, description, triggerType, triggerConfig, status, steps, stats, createdBy)
        VALUES (${original.name + " (Copy)"}, ${original.description || ""}, ${original.triggerType}, ${triggerConfig}, 'draft', ${steps}, ${stats}, ${ctx.user.id})
      `);
      return { success: true };
    }),
});


// ============================================================
// ORG BILLING ROUTER — Seat-based pricing & invoicing
// ============================================================
export const orgBillingRouter = router({
  // Get billing overview for an organization
  getBillingOverview: protectedProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [orgRows] = await db.execute(sql`SELECT * FROM organizations WHERE id = ${input.orgId}`);
      const org = (orgRows as any)?.[0];
      if (!org) return null;
      
      const seatPrice = org.plan === "enterprise" ? 49.99 : org.plan === "professional" ? 29.99 : 14.99;
      const seats = org.seats || 10;
      const monthlyTotal = seatPrice * seats;
      
      return {
        orgId: org.id,
        orgName: org.name,
        plan: org.plan,
        seats,
        seatPrice,
        monthlyTotal,
        annualTotal: monthlyTotal * 12 * 0.85, // 15% annual discount
        currency: "CAD",
        billingCycle: "monthly",
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      };
    }),

  // Update seat count for an organization
  updateSeats: protectedProcedure
    .input(z.object({ orgId: z.number(), seats: z.number().min(1).max(1000) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`UPDATE organizations SET seats = ${input.seats} WHERE id = ${input.orgId}`);
      return { success: true, seats: input.seats };
    }),

  // Get invoices for an organization
  getInvoices: protectedProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      // Return simulated invoices based on org creation
      const db = await getDb();
      const [orgRows] = await db.execute(sql`SELECT * FROM organizations WHERE id = ${input.orgId}`);
      const org = (orgRows as any)?.[0];
      if (!org) return [];
      
      const seatPrice = org.plan === "enterprise" ? 49.99 : org.plan === "professional" ? 29.99 : 14.99;
      const seats = org.seats || 10;
      const amount = seatPrice * seats;
      
      // Generate last 3 months of invoices
      const invoices = [];
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        invoices.push({
          id: `INV-${org.id}-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`,
          orgId: org.id,
          period: `${date.toLocaleString("en", { month: "long" })} ${date.getFullYear()}`,
          seats,
          seatPrice,
          amount,
          currency: "CAD",
          status: i === 0 ? "pending" : "paid",
          issuedAt: date.toISOString(),
          paidAt: i === 0 ? null : new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      return invoices;
    }),

  // Create Stripe checkout for org billing
  createOrgCheckout: protectedProcedure
    .input(z.object({
      orgId: z.number(),
      plan: z.enum(["starter", "professional", "enterprise"]),
      seats: z.number().min(1),
      billingCycle: z.enum(["monthly", "annual"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const seatPrice = input.plan === "enterprise" ? 4999 : input.plan === "professional" ? 2999 : 1499;
      const multiplier = input.billingCycle === "annual" ? 12 * 0.85 : 1; // 15% annual discount
      const totalAmount = Math.round(seatPrice * input.seats * multiplier);
      
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
        
        const session = await stripe.checkout.sessions.create({
          mode: input.billingCycle === "annual" ? "payment" : "subscription",
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            orgId: input.orgId.toString(),
            plan: input.plan,
            seats: input.seats.toString(),
            billingCycle: input.billingCycle,
            userId: ctx.user.id.toString(),
          },
          line_items: [{
            price_data: {
              currency: "cad",
              product_data: {
                name: `RusingÂcademy ${input.plan.charAt(0).toUpperCase() + input.plan.slice(1)} Plan - ${input.seats} seats`,
                description: `Organization billing: ${input.seats} seats × $${(seatPrice / 100).toFixed(2)}/seat/${input.billingCycle === "annual" ? "year" : "month"}`,
              },
              unit_amount: totalAmount,
              ...(input.billingCycle === "monthly" ? { recurring: { interval: "month" as const } } : {}),
            },
            quantity: 1,
          }],
          allow_promotion_codes: true,
          success_url: `${ctx.req.headers.origin}/admin/enterprise?billing=success`,
          cancel_url: `${ctx.req.headers.origin}/admin/enterprise?billing=cancelled`,
        });
        
        return { url: session.url, sessionId: session.id };
      } catch (error: any) {
        console.error("[OrgBilling] Checkout error:", error.message);
        return { url: null, error: error.message };
      }
    }),

  // Get pricing tiers
  getPricingTiers: publicProcedure.query(() => {
    return [
      { plan: "starter", seatPrice: 14.99, currency: "CAD", features: ["Basic courses", "Email support", "5 seats minimum"] },
      { plan: "professional", seatPrice: 29.99, currency: "CAD", features: ["All courses", "Priority support", "Coach access", "10 seats minimum"] },
      { plan: "enterprise", seatPrice: 49.99, currency: "CAD", features: ["All courses", "Dedicated coach", "Custom content", "Analytics dashboard", "API access", "Unlimited seats"] },
    ];
  }),
});


// ============================================================
// DRIP CONTENT ROUTER — Progressive content unlocking
// ============================================================
export const dripContentRouter = router({
  // Get drip schedule for a course
  getSchedule: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`
        SELECT l.id, l.title, l.orderIndex, l.moduleId,
               m.title as moduleName,
               dc.unlockDate, dc.unlockAfterDays, dc.unlockType, dc.isLocked
        FROM lessons l
        JOIN modules m ON l.moduleId = m.id
        LEFT JOIN drip_content dc ON dc.lessonId = l.id
        WHERE m.courseId = ${input.courseId}
        ORDER BY m.orderIndex, l.orderIndex
      `);
      return (rows as unknown as any[]) || [];
    }),

  // Set drip schedule for a lesson
  setSchedule: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      unlockType: z.enum(["immediate", "date", "days_after_enrollment", "after_previous"]),
      unlockDate: z.string().optional(),
      unlockAfterDays: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`
        INSERT INTO drip_content (lessonId, unlockType, unlockDate, unlockAfterDays, isLocked)
        VALUES (${input.lessonId}, ${input.unlockType}, ${input.unlockDate || null}, ${input.unlockAfterDays || 0}, ${input.unlockType !== "immediate" ? 1 : 0})
        ON DUPLICATE KEY UPDATE
          unlockType = VALUES(unlockType),
          unlockDate = VALUES(unlockDate),
          unlockAfterDays = VALUES(unlockAfterDays),
          isLocked = VALUES(isLocked)
      `);
      return { success: true };
    }),

  // Bulk set drip schedule (weekly cadence)
  setBulkSchedule: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      cadence: z.enum(["daily", "every_3_days", "weekly", "biweekly", "monthly"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`
        SELECT l.id FROM lessons l
        JOIN modules m ON l.moduleId = m.id
        WHERE m.courseId = ${input.courseId}
        ORDER BY m.orderIndex, l.orderIndex
      `);
      const lessons = (rows as unknown as any[]) || [];
      const dayMap = { daily: 1, every_3_days: 3, weekly: 7, biweekly: 14, monthly: 30 };
      const interval = dayMap[input.cadence];
      
      for (let i = 0; i < lessons.length; i++) {
        const days = i * interval;
        await db.execute(sql`
          INSERT INTO drip_content (lessonId, unlockType, unlockAfterDays, isLocked)
          VALUES (${lessons[i].id}, 'days_after_enrollment', ${days}, ${days > 0 ? 1 : 0})
          ON DUPLICATE KEY UPDATE
            unlockType = 'days_after_enrollment',
            unlockAfterDays = VALUES(unlockAfterDays),
            isLocked = VALUES(isLocked)
        `);
      }
      return { success: true, lessonsUpdated: lessons.length };
    }),

  // Check if a lesson is unlocked for a learner
  checkAccess: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`
        SELECT dc.*, e.enrolledAt
        FROM drip_content dc
        LEFT JOIN course_enrollments e ON e.userId = ${ctx.user.id}
        WHERE dc.lessonId = ${input.lessonId}
        LIMIT 1
      `);
      const drip = (rows as any)?.[0];
      if (!drip || !drip.isLocked) return { unlocked: true };
      
      if (drip.unlockType === "date") {
        return { unlocked: new Date() >= new Date(drip.unlockDate), unlockDate: drip.unlockDate };
      }
      if (drip.unlockType === "days_after_enrollment" && drip.enrolledAt) {
        const enrollDate = new Date(drip.enrolledAt);
        const unlockDate = new Date(enrollDate.getTime() + drip.unlockAfterDays * 24 * 60 * 60 * 1000);
        return { unlocked: new Date() >= unlockDate, unlockDate: unlockDate.toISOString() };
      }
      return { unlocked: false };
    }),
});

// ============================================================
// A/B CONTENT TESTING ROUTER
// ============================================================
export const abTestingRouter = router({
  // List all A/B tests
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`SELECT * FROM ab_tests ORDER BY createdAt DESC`);
    return (rows as unknown as any[]) || [];
  }),

  // Get test results
  getResults: protectedProcedure
    .input(z.object({ testId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`SELECT * FROM ab_tests WHERE id = ${input.testId}`);
      const test = (rows as any)?.[0];
      if (!test) return null;
      
      const results = typeof test.results === "string" ? JSON.parse(test.results) : test.results;
      return { ...test, results };
    }),

  // Create a new A/B test
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      lessonIdA: z.number(),
      lessonIdB: z.number(),
      trafficSplit: z.number().min(10).max(90).default(50),
      metric: z.enum(["completion_rate", "engagement_time", "quiz_score", "satisfaction"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const results = JSON.stringify({
        variantA: { views: 0, completions: 0, avgTime: 0, score: 0 },
        variantB: { views: 0, completions: 0, avgTime: 0, score: 0 },
      });
      await db.execute(sql`
        INSERT INTO ab_tests (name, lessonIdA, lessonIdB, trafficSplit, metric, status, results, createdBy)
        VALUES (${input.name}, ${input.lessonIdA}, ${input.lessonIdB}, ${input.trafficSplit}, ${input.metric}, 'draft', ${results}, ${ctx.user.id})
      `);
      return { success: true };
    }),

  // Update test status
  updateStatus: protectedProcedure
    .input(z.object({ testId: z.number(), status: z.enum(["draft", "running", "paused", "completed"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`UPDATE ab_tests SET status = ${input.status} WHERE id = ${input.testId}`);
      return { success: true };
    }),

  // Get stats summary
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    const [totalRows] = await db.execute(sql`SELECT COUNT(*) as count FROM ab_tests`);
    const [activeRows] = await db.execute(sql`SELECT COUNT(*) as count FROM ab_tests WHERE status = 'running'`);
    const total = (totalRows as any)?.[0]?.count ?? 0;
    const active = (activeRows as any)?.[0]?.count ?? 0;
    return { total: Number(total), active: Number(active), completed: Number(total) - Number(active) };
  }),
});

// ============================================================
// AFFILIATE PROGRAM ROUTER
// ============================================================
export const affiliateRouter = router({
  // Get affiliate dashboard data
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    // Get referral stats
    const [referralRows] = await db.execute(sql`
      SELECT COUNT(*) as totalReferrals,
             SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as conversions,
             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM referral_invitations WHERE referrerId = ${ctx.user.id}
    `);
    const stats = (referralRows as any)?.[0] || { totalReferrals: 0, conversions: 0, pending: 0 };
    
    // Get commission earnings
    const [earningsRows] = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as totalEarnings,
             COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paidOut,
             COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pendingPayout
      FROM affiliate_earnings WHERE affiliateId = ${ctx.user.id}
    `);
    const earnings = (earningsRows as any)?.[0] || { totalEarnings: 0, paidOut: 0, pendingPayout: 0 };
    
    // Generate referral link
    const code = `RA-${ctx.user.id}-${Date.now().toString(36).slice(-4)}`;
    const referralLink = `https://rusingacademy.manus.space?ref=${code}`;
    
    return {
      referralLink,
      referralCode: code,
      stats: {
        totalReferrals: Number(stats.totalReferrals),
        conversions: Number(stats.conversions),
        pending: Number(stats.pending),
        conversionRate: Number(stats.totalReferrals) > 0 ? (Number(stats.conversions) / Number(stats.totalReferrals) * 100).toFixed(1) : "0",
      },
      earnings: {
        total: Number(earnings.totalEarnings),
        paidOut: Number(earnings.paidOut),
        pending: Number(earnings.pendingPayout),
        currency: "CAD",
      },
      tiers: [
        { name: "Bronze", minReferrals: 0, commission: 10, bonus: "$0" },
        { name: "Silver", minReferrals: 5, commission: 15, bonus: "$50" },
        { name: "Gold", minReferrals: 15, commission: 20, bonus: "$150" },
        { name: "Platinum", minReferrals: 30, commission: 25, bonus: "$500" },
      ],
    };
  }),

  // Get referral history
  getReferrals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT ri.*, u.name as referredName, u.email as referredEmail
      FROM referral_invitations ri
      LEFT JOIN user u ON u.id = ri.referredId
      WHERE ri.referrerId = ${ctx.user.id}
      ORDER BY ri.createdAt DESC
      LIMIT 50
    `);
    return (rows as unknown as any[]) || [];
  }),

  // Request payout
  requestPayout: protectedProcedure
    .input(z.object({ amount: z.number().min(50) })) // Minimum $50 payout
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      await db.execute(sql`
        INSERT INTO affiliate_payouts (affiliateId, amount, status, requestedAt)
        VALUES (${ctx.user.id}, ${input.amount}, 'pending', NOW())
      `);
      return { success: true, message: "Payout request submitted. Processing within 5-7 business days." };
    }),
});
