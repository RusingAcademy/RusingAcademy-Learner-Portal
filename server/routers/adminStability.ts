/**
 * Admin Stability Router
 * 
 * Exposes backend stability features to the admin panel:
 * - Webhook event stats (idempotency log)
 * - Audit log query
 * - AI pipeline health
 * - RBAC permission management
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getWebhookEventStats } from "../webhookIdempotency";
import { queryAuditLog, logAuditEvent } from "../rbacMiddleware";
import { getPipelineHealth, getAllPipelineStats } from "../services/aiPipelineMonitor";
import { SLE_RUBRICS } from "../services/sleScoringRubric";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Admin-only guard
const adminGuard = ({ ctx, next }: { ctx: any; next: () => Promise<any> }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next();
};

export const adminStabilityRouter = router({
  // ========================================================================
  // WEBHOOK STATS
  // ========================================================================
  
  /**
   * Get webhook event processing stats (idempotency log).
   */
  getWebhookStats: protectedProcedure
    .use(adminGuard)
    .query(async () => {
      return await getWebhookEventStats();
    }),

  // ========================================================================
  // AUDIT LOG
  // ========================================================================

  /**
   * Query the generalized audit log with filters.
   */
  getAuditLog: protectedProcedure
    .use(adminGuard)
    .input(
      z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        targetType: z.string().optional(),
        targetId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      return await queryAuditLog(input || {});
    }),

  // ========================================================================
  // AI PIPELINE HEALTH
  // ========================================================================

  /**
   * Get overall AI pipeline health summary.
   */
  getPipelineHealth: protectedProcedure
    .use(adminGuard)
    .query(async () => {
      return getPipelineHealth();
    }),

  /**
   * Get detailed stats for all pipeline stages.
   */
  getPipelineStats: protectedProcedure
    .use(adminGuard)
    .input(
      z.object({
        windowMs: z.number().min(60000).max(86400000).default(3600000),
      }).optional()
    )
    .query(async ({ input }) => {
      return getAllPipelineStats(input?.windowMs);
    }),

  // ========================================================================
  // SLE SCORING RUBRIC (read-only)
  // ========================================================================

  /**
   * Get the SLE scoring rubric for a specific level.
   */
  getScoringRubric: protectedProcedure
    .use(adminGuard)
    .input(z.object({ level: z.enum(["A", "B", "C"]) }))
    .query(({ input }) => {
      return SLE_RUBRICS[input.level];
    }),

  /**
   * Get all SLE scoring rubrics.
   */
  getAllScoringRubrics: protectedProcedure
    .use(adminGuard)
    .query(() => {
      return SLE_RUBRICS;
    }),

  // ========================================================================
  // USER PERMISSIONS (for frontend RBAC)
  // ========================================================================
  /**
   * Get current user's permissions from the RBAC system.
   * Returns an array of permission names.
   */
  getUserPermissions: protectedProcedure
    .use(adminGuard)
    .query(async ({ ctx }) => {
      const db = await getDb();
      // Get permissions from user_permissions table (direct assignments)
      const [directPerms] = await db.execute(sql`
        SELECT DISTINCT CONCAT(p.module, '.', p.action) as permission
        FROM user_permissions up
        JOIN permissions p ON up.permissionId = p.id
        WHERE up.userId = ${ctx.user.id}
      `);
      // Get permissions from role_permissions table (via user's role)
      const [rolePerms] = await db.execute(sql`
        SELECT DISTINCT CONCAT(p.module, '.', p.action) as permission
        FROM role_permissions rp
        JOIN permissions p ON rp.permissionId = p.id
        JOIN roles r ON rp.roleId = r.id
        JOIN users u ON u.role = r.name
        WHERE u.id = ${ctx.user.id}
      `);
      // Merge and deduplicate
      const allPerms = new Set<string>();
      if (Array.isArray(directPerms)) {
        for (const p of directPerms as any[]) allPerms.add(p.permission);
      }
      if (Array.isArray(rolePerms)) {
        for (const p of rolePerms as any[]) allPerms.add(p.permission);
      }
      return Array.from(allPerms).map(name => ({ permission: name }));
    }),
});
