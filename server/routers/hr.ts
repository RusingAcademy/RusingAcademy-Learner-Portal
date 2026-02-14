import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql, gte, lte, inArray } from "drizzle-orm";
import { 
  organizations, 
  organizationMembers,
  users,
  learnerProfiles,
  courseEnrollments,
  courses,
  sessions
} from "../../drizzle/schema";

// Helper to verify HR access to organization
async function verifyHRAccess(userId: number, organizationId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  
  // Check if user is a member of the organization with admin/manager role
  const [membership] = await db.select()
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationId, organizationId),
      inArray(organizationMembers.role, ["admin", "manager"])
    ))
    .limit(1);
  
  if (!membership) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You don't have HR access to this organization" 
    });
  }
  
  return membership;
}

export const hrRouter = router({
  // ============================================================================
  // ORGANIZATION
  // ============================================================================
  getOrganization: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const [org] = await db.select()
        .from(organizations)
        .where(eq(organizations.id, input.organizationId))
        .limit(1);
      
      return org;
    }),

  updateOrganization: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().optional(),
      domain: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.update(organizations)
        .set({
          name: input.name,
          domain: input.domain,
        })
        .where(eq(organizations.id, input.organizationId));
      
      return { success: true };
    }),

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================
  getDashboardStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Get total learners in org
      const [learnerCount] = await db.select({ count: sql<number>`count(*)` })
        .from(organizationMembers)
        .where(and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.role, "learner")
        ));
      
      // Get active this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const [activeCount] = await db.select({ count: sql<number>`count(DISTINCT ${organizationMembers.userId})` })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.userId, users.id))
        .where(and(
          eq(organizationMembers.organizationId, input.organizationId),
          gte(users.lastSignedIn, weekAgo)
        ));
      
      // Get completions
      const [completions] = await db.select({ count: sql<number>`count(*)` })
        .from(courseEnrollments)
        .innerJoin(organizationMembers, eq(courseEnrollments.userId, organizationMembers.userId))
        .where(and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(courseEnrollments.status, "completed")
        ));
      
      // Get avg progress
      const [avgProgress] = await db.select({ avg: sql<number>`AVG(${courseEnrollments.progressPercent})` })
        .from(courseEnrollments)
        .innerJoin(organizationMembers, eq(courseEnrollments.userId, organizationMembers.userId))
        .where(eq(organizationMembers.organizationId, input.organizationId));
      
      // Generate alerts
      const alerts = [];
      
      // Check for inactive learners
      const [inactiveCount] = await db.select({ count: sql<number>`count(*)` })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.userId, users.id))
        .where(and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.role, "learner"),
          lte(users.lastSignedIn, weekAgo)
        ));
      
      if ((inactiveCount?.count || 0) > 0) {
        alerts.push({ 
          type: "warning", 
          message: `${inactiveCount.count} learners haven't been active in the past week` 
        });
      }
      
      return {
        totalLearners: learnerCount?.count || 0,
        activeThisWeek: activeCount?.count || 0,
        completions: completions?.count || 0,
        avgProgress: Math.round(avgProgress?.avg || 0),
        alerts,
      };
    }),

  getOnboardingChecklist: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Check learners invited
      const [learnerCount] = await db.select({ count: sql<number>`count(*)` })
        .from(organizationMembers)
        .where(and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.role, "learner")
        ));
      
      // Check cohorts created
      const [cohortCount] = await db.execute(sql`
        SELECT COUNT(*) as count FROM cohorts WHERE organizationId = ${input.organizationId}
      `);
      
      // Check assignments created
      const [assignmentCount] = await db.execute(sql`
        SELECT COUNT(*) as count FROM course_assignments WHERE organizationId = ${input.organizationId}
      `);
      
      const learnersInvited = (learnerCount?.count || 0) > 0;
      const cohortCreated = ((cohortCount as any)[0]?.count || 0) > 0;
      const pathAssigned = ((assignmentCount as any)[0]?.count || 0) > 0;
      const reportExported = false; // Would need to track this separately
      
      let incomplete = 0;
      if (!learnersInvited) incomplete++;
      if (!cohortCreated) incomplete++;
      if (!pathAssigned) incomplete++;
      if (!reportExported) incomplete++;
      
      return {
        learnersInvited,
        cohortCreated,
        pathAssigned,
        reportExported,
        incomplete,
      };
    }),

  // ============================================================================
  // LEARNERS
  // ============================================================================
  getLearners: protectedProcedure
    .input(z.object({ 
      organizationId: z.number(),
      cohortId: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Get all learners in org
      const learners = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        lastActiveAt: users.lastSignedIn,
        memberStatus: organizationMembers.status,
      })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.userId, users.id))
        .where(and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.role, "learner")
        ))
        .orderBy(desc(users.lastSignedIn));
      
      // Get progress for each learner
      const learnersWithProgress = await Promise.all(learners.map(async (learner) => {
        const [progressResult] = await db.select({ 
          avg: sql<number>`AVG(${courseEnrollments.progressPercent})` 
        })
          .from(courseEnrollments)
          .where(eq(courseEnrollments.userId, learner.id));
        
        // Get learner profile for level
        const [profile] = await db.select()
          .from(learnerProfiles)
          .where(eq(learnerProfiles.userId, learner.id))
          .limit(1);
        
        // Get cohort membership
        const [cohortMember] = await db.execute(sql`
          SELECT c.name as cohortName, cm.cohortId 
          FROM cohort_members cm 
          JOIN cohorts c ON cm.cohortId = c.id 
          WHERE cm.userId = ${learner.id} 
          LIMIT 1
        `);
        
        return {
          ...learner,
          progress: Math.round(progressResult?.avg || 0),
          currentLevel: profile?.currentLevel ? JSON.stringify(profile.currentLevel) : null,
          cohortName: (cohortMember as any)[0]?.cohortName || null,
          cohortId: (cohortMember as any)[0]?.cohortId || null,
          status: learner.memberStatus,
        };
      }));
      
      return learnersWithProgress;
    }),

  inviteLearner: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      email: z.string().email(),
      name: z.string(),
      cohortId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Check if user already exists
      let [existingUser] = await db.select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      
      let userId: number;
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user with invited status
        const openId = `invited_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(users).values({
          openId,
          name: input.name,
          email: input.email,
          role: "learner",
        });
        
        const [newUser] = await db.select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        userId = newUser.id;
      }
      
      // Add to organization
      await db.insert(organizationMembers).values({
        organizationId: input.organizationId,
        userId,
        role: "learner",
        status: "invited",
        invitedAt: new Date(),
      }).onDuplicateKeyUpdate({
        set: { status: "invited", invitedAt: new Date() }
      });
      
      // Add to cohort if specified
      if (input.cohortId) {
        await db.execute(sql`
          INSERT INTO cohort_members (cohortId, userId, addedBy, status)
          VALUES (${input.cohortId}, ${userId}, ${ctx.user.id}, 'active')
          ON DUPLICATE KEY UPDATE status = 'active'
        `);
      }
      
      // Log action
      await db.execute(sql`
        INSERT INTO hr_audit_log (organizationId, userId, action, targetType, targetId, details)
        VALUES (${input.organizationId}, ${ctx.user.id}, 'learner_invited', 'user', ${userId}, ${JSON.stringify({ email: input.email, name: input.name })})
      `);
      
      // TODO: Send invitation email
      
      return { success: true, userId };
    }),

  // ============================================================================
  // COHORTS
  // ============================================================================
  getCohorts: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const [cohorts] = await db.execute(sql`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM cohort_members WHERE cohortId = c.id) as memberCount
        FROM cohorts c
        WHERE c.organizationId = ${input.organizationId}
        ORDER BY c.createdAt DESC
      `);
      
      return cohorts as unknown as any[];
    }),

  createCohort: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      department: z.string().optional(),
      targetLevel: z.string().optional(),
      targetDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.execute(sql`
        INSERT INTO cohorts (organizationId, name, department, targetLevel, targetDate, createdBy, status)
        VALUES (${input.organizationId}, ${input.name}, ${input.department || null}, ${input.targetLevel ? JSON.stringify({ target: input.targetLevel }) : null}, ${input.targetDate || null}, ${ctx.user.id}, 'active')
      `);
      
      // Log action
      await db.execute(sql`
        INSERT INTO hr_audit_log (organizationId, userId, action, targetType, details)
        VALUES (${input.organizationId}, ${ctx.user.id}, 'cohort_created', 'cohort', ${JSON.stringify({ name: input.name })})
      `);
      
      return { success: true };
    }),

  updateCohort: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      cohortId: z.number(),
      name: z.string().optional(),
      department: z.string().optional(),
      targetLevel: z.string().optional(),
      status: z.enum(["active", "inactive", "completed", "archived"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const updates: string[] = [];
      if (input.name) updates.push(`name = '${input.name}'`);
      if (input.department) updates.push(`department = '${input.department}'`);
      if (input.status) updates.push(`status = '${input.status}'`);
      
      if (updates.length > 0) {
        await db.execute(sql.raw(`
          UPDATE cohorts SET ${updates.join(", ")} 
          WHERE id = ${input.cohortId} AND organizationId = ${input.organizationId}
        `));
      }
      
      return { success: true };
    }),

  addCohortMember: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      cohortId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.execute(sql`
        INSERT INTO cohort_members (cohortId, userId, addedBy, status)
        VALUES (${input.cohortId}, ${input.userId}, ${ctx.user.id}, 'active')
        ON DUPLICATE KEY UPDATE status = 'active', addedBy = ${ctx.user.id}
      `);
      
      // Update cohort member count
      await db.execute(sql`
        UPDATE cohorts SET memberCount = (SELECT COUNT(*) FROM cohort_members WHERE cohortId = ${input.cohortId})
        WHERE id = ${input.cohortId}
      `);
      
      return { success: true };
    }),

  removeCohortMember: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      cohortId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.execute(sql`
        DELETE FROM cohort_members WHERE cohortId = ${input.cohortId} AND userId = ${input.userId}
      `);
      
      // Update cohort member count
      await db.execute(sql`
        UPDATE cohorts SET memberCount = (SELECT COUNT(*) FROM cohort_members WHERE cohortId = ${input.cohortId})
        WHERE id = ${input.cohortId}
      `);
      
      return { success: true };
    }),

  // ============================================================================
  // ASSIGNMENTS
  // ============================================================================
  getAssignments: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const [assignments] = await db.execute(sql`
        SELECT 
          ca.*,
          c.title as courseName,
          ch.name as cohortName,
          u.name as userName
        FROM course_assignments ca
        LEFT JOIN courses c ON ca.courseId = c.id
        LEFT JOIN cohorts ch ON ca.cohortId = ch.id
        LEFT JOIN users u ON ca.userId = u.id
        WHERE ca.organizationId = ${input.organizationId}
        ORDER BY ca.assignedAt DESC
      `);
      
      return assignments as unknown as any[];
    }),

  createAssignment: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      cohortId: z.number().optional(),
      userId: z.number().optional(),
      courseId: z.number(),
      assignmentType: z.enum(["required", "optional", "recommended"]).default("required"),
      startDate: z.date().optional(),
      dueDate: z.date().optional(),
      targetLevel: z.enum(["BBB", "CBC", "CCC"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.execute(sql`
        INSERT INTO course_assignments (
          organizationId, cohortId, userId, courseId, 
          assignmentType, startDate, dueDate, targetLevel, 
          notes, assignedBy, status
        )
        VALUES (
          ${input.organizationId}, ${input.cohortId || null}, ${input.userId || null}, ${input.courseId},
          ${input.assignmentType}, ${input.startDate || null}, ${input.dueDate || null}, ${input.targetLevel || null},
          ${input.notes || null}, ${ctx.user.id}, 'active'
        )
      `);
      
      // If assigned to cohort, create enrollments for all cohort members
      if (input.cohortId) {
        await db.execute(sql`
          INSERT INTO course_enrollments (userId, courseId, status, progressPercent)
          SELECT cm.userId, ${input.courseId}, 'active', 0
          FROM cohort_members cm
          WHERE cm.cohortId = ${input.cohortId}
          ON DUPLICATE KEY UPDATE status = 'active'
        `);
      }
      
      // Log action
      await db.execute(sql`
        INSERT INTO hr_audit_log (organizationId, userId, action, targetType, details)
        VALUES (${input.organizationId}, ${ctx.user.id}, 'course_assigned', 'assignment', ${JSON.stringify({ courseId: input.courseId, cohortId: input.cohortId })})
      `);
      
      return { success: true };
    }),

  // ============================================================================
  // REPORTS
  // ============================================================================
  getProgressReport: protectedProcedure
    .input(z.object({ 
      organizationId: z.number(),
      cohortId: z.number().optional(),
      period: z.number().optional(), // days
    }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Get progress by cohort
      const [cohortProgress] = await db.execute(sql`
        SELECT 
          c.id,
          c.name,
          c.memberCount,
          COALESCE(AVG(ce.progressPercent), 0) as avgProgress,
          COUNT(CASE WHEN ce.status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(ce.id), 0) as completionRate
        FROM cohorts c
        LEFT JOIN cohort_members cm ON c.id = cm.cohortId
        LEFT JOIN course_enrollments ce ON cm.userId = ce.userId
        WHERE c.organizationId = ${input.organizationId}
        GROUP BY c.id
        ORDER BY c.name
      `);
      
      // Get individual completions
      const [completions] = await db.execute(sql`
        SELECT 
          u.name as learnerName,
          c.title as courseName,
          ce.progressPercent as progress,
          ce.completedAt
        FROM course_enrollments ce
        JOIN users u ON ce.userId = u.id
        JOIN courses c ON ce.courseId = c.id
        JOIN organization_members om ON u.id = om.userId
        WHERE om.organizationId = ${input.organizationId}
        ORDER BY ce.completedAt DESC
        LIMIT 50
      `);
      
      return {
        cohortProgress: cohortProgress as unknown as any[],
        completions: completions as unknown as any[],
      };
    }),

  exportReport: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      format: z.enum(["csv", "xlsx"]),
      cohortId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Get all learner data
      const [data] = await db.execute(sql`
        SELECT 
          u.name as "Learner Name",
          u.email as "Email",
          c.name as "Cohort",
          co.title as "Course",
          ce.progressPercent as "Progress",
          ce.status as "Status",
          ce.completedAt as "Completed At"
        FROM organization_members om
        JOIN users u ON om.userId = u.id
        LEFT JOIN cohort_members cm ON u.id = cm.userId
        LEFT JOIN cohorts c ON cm.cohortId = c.id
        LEFT JOIN course_enrollments ce ON u.id = ce.userId
        LEFT JOIN courses co ON ce.courseId = co.id
        WHERE om.organizationId = ${input.organizationId}
        ORDER BY u.name, co.title
      `);
      
      // Log export
      await db.execute(sql`
        INSERT INTO hr_audit_log (organizationId, userId, action, details)
        VALUES (${input.organizationId}, ${ctx.user.id}, 'report_exported', ${JSON.stringify({ format: input.format })})
      `);
      
      // In a real implementation, we'd generate the file and return a download URL
      // For now, return the data that can be converted client-side
      return {
        data: data as unknown as any[],
        downloadUrl: `/api/exports/report-${input.organizationId}-${Date.now()}.${input.format}`,
      };
    }),

  // ============================================================================
  // ASSESSMENTS
  // ============================================================================
  getAssessments: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // This would query quiz/assessment results
      // For now, return placeholder data
      return [];
    }),

  // ============================================================================
  // ANALYTICS
  // ============================================================================
  getAnalytics: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      await verifyHRAccess(ctx.user.id, input.organizationId);
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      // Active this week
      const [activeThisWeek] = await db.select({ count: sql<number>`count(DISTINCT ${organizationMembers.userId})` })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.userId, users.id))
        .where(and(
          eq(organizationMembers.organizationId, input.organizationId),
          gte(users.lastSignedIn, weekAgo)
        ));
      
      // Completions this month
      const [completionsThisMonth] = await db.select({ count: sql<number>`count(*)` })
        .from(courseEnrollments)
        .innerJoin(organizationMembers, eq(courseEnrollments.userId, organizationMembers.userId))
        .where(and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(courseEnrollments.status, "completed"),
          gte(courseEnrollments.completedAt, monthAgo)
        ));
      
      // Top modules (courses with most completions)
      const [topModules] = await db.execute(sql`
        SELECT 
          c.title as name,
          COUNT(ce.id) as completions
        FROM courses c
        JOIN course_enrollments ce ON c.id = ce.courseId
        JOIN organization_members om ON ce.userId = om.userId
        WHERE om.organizationId = ${input.organizationId}
          AND ce.status = 'completed'
        GROUP BY c.id
        ORDER BY completions DESC
        LIMIT 5
      `);
      
      return {
        activeThisWeek: activeThisWeek?.count || 0,
        activeChange: 0, // Would calculate week-over-week change
        completionsThisMonth: completionsThisMonth?.count || 0,
        avgTimeToComplete: null, // Would calculate from enrollment data
        topModules: topModules as unknown as any[],
      };
    }),

  // ============================================================================
  // GET USER'S ORGANIZATION (for routing)
  // ============================================================================
  getMyOrganization: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    
    // Find organization where user is admin/manager
    const [membership] = await db.select({
      organizationId: organizationMembers.organizationId,
      role: organizationMembers.role,
      orgName: organizations.name,
    })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(and(
        eq(organizationMembers.userId, ctx.user.id),
        inArray(organizationMembers.role, ["admin", "manager"])
      ))
      .limit(1);
    
    return membership || null;
  }),
});
