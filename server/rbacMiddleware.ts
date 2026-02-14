/**
 * RBAC Policy Engine & Generalized Audit Logger
 * 
 * Centralizes permission checks and audit logging for all admin mutations.
 * 
 * RBAC: Checks role_permissions table for (role, module, action) tuples.
 * Audit: Logs every admin mutation with who/what/when + diff of changes.
 */
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { structuredLog } from "./structuredLogger";

// ============================================================================
// RBAC PERMISSION CHECK
// ============================================================================

export interface PermissionCheck {
  module: string;   // e.g., "courses", "coaching", "payments", "users", "settings"
  action: string;   // e.g., "view", "create", "edit", "delete", "export"
}

/**
 * Check if a user's role has permission for a specific module+action.
 * Returns true if allowed, false if denied.
 * 
 * Falls back to true for "admin" role (superadmin) if no explicit permission exists.
 * Falls back to false for other roles if no explicit permission exists.
 */
export async function hasPermission(
  userRole: string,
  check: PermissionCheck
): Promise<boolean> {
  // Superadmin bypass: owner/admin always has access
  if (userRole === "admin") return true;

  const db = await getDb();
  if (!db) {
    structuredLog("warn", "rbac", "Database unavailable for permission check, denying access");
    return false;
  }

  try {
    const [rows] = await db.execute(sql`
      SELECT allowed FROM role_permissions 
      WHERE role = ${userRole} AND module = ${check.module} AND action = ${check.action}
      LIMIT 1
    `);

    const row = Array.isArray(rows) && rows[0] ? rows[0] as any : null;
    
    if (!row) {
      // No explicit permission found — deny by default for non-admin
      return false;
    }

    return Boolean(row.allowed);
  } catch (error) {
    structuredLog("error", "rbac", "Permission check failed", {
      role: userRole,
      module: check.module,
      action: check.action,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Create a tRPC middleware that checks RBAC permissions.
 * Usage: protectedProcedure.use(requirePermission({ module: "courses", action: "edit" }))
 */
export function requirePermission(check: PermissionCheck) {
  return async ({ ctx, next }: { ctx: any; next: () => Promise<any> }) => {
    const userRole = ctx.user?.role || "user";
    const allowed = await hasPermission(userRole, check);

    if (!allowed) {
      structuredLog("warn", "rbac", "Permission denied", {
        userId: ctx.user?.id,
        role: userRole,
        module: check.module,
        action: check.action,
      });
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have permission to ${check.action} in ${check.module}`,
      });
    }

    return next();
  };
}

// ============================================================================
// GENERALIZED AUDIT LOG
// ============================================================================

export interface AuditLogEntry {
  userId: number;
  action: string;        // e.g., "course.create", "user.delete", "settings.update"
  targetType?: string;   // e.g., "course", "user", "settings"
  targetId?: number;     // ID of the affected resource
  details?: Record<string, any>; // JSON with context, diff, etc.
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an admin action to the audit_log table.
 * Includes who did what, when, and optionally a diff of changes.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const db = await getDb();
  if (!db) {
    structuredLog("warn", "audit", "Database unavailable, audit log skipped", { action: entry.action });
    return;
  }

  try {
    await db.execute(sql`
      INSERT INTO audit_log (userId, action, targetType, targetId, details, ipAddress, userAgent)
      VALUES (
        ${entry.userId},
        ${entry.action},
        ${entry.targetType || null},
        ${entry.targetId || null},
        ${entry.details ? JSON.stringify(entry.details) : null},
        ${entry.ipAddress || null},
        ${entry.userAgent || null}
      )
    `);

    structuredLog("info", "audit", `Action logged: ${entry.action}`, {
      userId: entry.userId,
      targetType: entry.targetType,
      targetId: entry.targetId,
    });
  } catch (error) {
    structuredLog("error", "audit", "Failed to log audit event", {
      action: entry.action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Compute a diff between two objects for audit logging.
 * Returns only the fields that changed, with before/after values.
 */
export function computeDiff(
  before: Record<string, any>,
  after: Record<string, any>
): Record<string, { before: any; after: any }> | null {
  const diff: Record<string, { before: any; after: any }> = {};

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const beforeVal = before[key];
    const afterVal = after[key];

    // Skip internal/system fields
    if (key === "updatedAt" || key === "createdAt") continue;

    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      diff[key] = { before: beforeVal, after: afterVal };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Helper to create an audited mutation wrapper.
 * Automatically logs the mutation with user context.
 */
export function createAuditedMutation(
  actionName: string,
  targetType: string
) {
  return async (
    ctx: { user: { id: number; role?: string } },
    targetId: number | undefined,
    details: Record<string, any>,
    fn: () => Promise<any>
  ) => {
    const result = await fn();

    await logAuditEvent({
      userId: ctx.user.id,
      action: actionName,
      targetType,
      targetId,
      details: {
        ...details,
        performedBy: ctx.user.id,
        role: ctx.user.role || "unknown",
      },
    });

    return result;
  };
}

// ============================================================================
// AUDIT LOG QUERY HELPERS
// ============================================================================

export interface AuditLogQuery {
  userId?: number;
  action?: string;
  targetType?: string;
  targetId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Query audit log entries with filters.
 */
export async function queryAuditLog(query: AuditLogQuery): Promise<{
  entries: any[];
  total: number;
}> {
  const db = await getDb();
  if (!db) return { entries: [], total: 0 };

  try {
    const conditions: string[] = ["1=1"];
    if (query.userId) conditions.push(`a.userId = ${query.userId}`);
    if (query.action) conditions.push(`a.action LIKE '%${query.action}%'`);
    if (query.targetType) conditions.push(`a.targetType = '${query.targetType}'`);
    if (query.targetId) conditions.push(`a.targetId = ${query.targetId}`);
    if (query.startDate) conditions.push(`a.createdAt >= '${query.startDate}'`);
    if (query.endDate) conditions.push(`a.createdAt <= '${query.endDate}'`);

    const whereClause = conditions.join(" AND ");
    const limit = query.limit || 50;
    const offset = query.offset || 0;

    const [countRows] = await db.execute(
      sql.raw(`SELECT COUNT(*) as total FROM audit_log a WHERE ${whereClause}`)
    );
    const total = Number((Array.isArray(countRows) && countRows[0] as any)?.total || 0);

    const [rows] = await db.execute(
      sql.raw(`
        SELECT a.*, u.name as userName, u.email as userEmail 
        FROM audit_log a 
        LEFT JOIN users u ON a.userId = u.id 
        WHERE ${whereClause} 
        ORDER BY a.createdAt DESC 
        LIMIT ${limit} OFFSET ${offset}
      `)
    );

    return {
      entries: Array.isArray(rows) ? rows : [],
      total,
    };
  } catch (error) {
    structuredLog("error", "audit", "Failed to query audit log", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { entries: [], total: 0 };
  }
}
