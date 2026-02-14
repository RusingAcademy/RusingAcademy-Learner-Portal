/**
 * Admin Notifications Router
 * 
 * Exposes endpoints for:
 * - Running health checks manually
 * - Getting/setting notification preferences
 * - Viewing recent admin alerts
 */
import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import {
  runAllHealthChecks,
  getAdminNotificationPrefs,
  setAdminNotificationPref,
  type AlertCategory,
} from "../services/adminNotifications";

export const adminNotificationsRouter = router({
  /**
   * Manually trigger all health checks
   */
  runHealthChecks: adminProcedure.mutation(async () => {
    const result = await runAllHealthChecks();
    return result;
  }),

  /**
   * Get notification preferences for current admin
   */
  getPreferences: adminProcedure.query(async ({ ctx }) => {
    return await getAdminNotificationPrefs(ctx.user.id);
  }),

  /**
   * Update a notification preference
   */
  setPreference: adminProcedure
    .input(z.object({
      category: z.enum(["webhook", "ai_pipeline", "coach_signup", "system_health", "payment", "security"]),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await setAdminNotificationPref(ctx.user.id, input.category as AlertCategory, input.enabled);
      return { success: true };
    }),

  /**
   * Get recent admin alerts (system notifications)
   */
  getRecentAlerts: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const limit = input?.limit ?? 20;
      const [rows] = await db.execute(sql`
        SELECT id, title, message, metadata, isRead, createdAt
        FROM notifications
        WHERE userId = ${ctx.user.id}
        AND type = 'system'
        ORDER BY createdAt DESC
        LIMIT ${limit}
      `);
      return Array.isArray(rows) ? rows : [];
    }),

  /**
   * Get alert summary (counts by severity)
   */
  getAlertSummary: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN isRead = false THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN title LIKE '%🔴%' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN title LIKE '%🟡%' THEN 1 ELSE 0 END) as warnings,
        SUM(CASE WHEN title LIKE '%🔵%' THEN 1 ELSE 0 END) as info
      FROM notifications
      WHERE userId = ${ctx.user.id}
      AND type = 'system'
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    const row = (rows as any)?.[0] || {};
    return {
      total: Number(row.total ?? 0),
      unread: Number(row.unread ?? 0),
      critical: Number(row.critical ?? 0),
      warnings: Number(row.warnings ?? 0),
      info: Number(row.info ?? 0),
    };
  }),

  /**
   * Mark alert as read
   */
  markAlertRead: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      await db.execute(sql`
        UPDATE notifications SET isRead = true
        WHERE id = ${input.alertId} AND userId = ${ctx.user.id}
      `);
      return { success: true };
    }),
});
