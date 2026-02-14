/**
 * Admin Notification Service
 * 
 * Automated alert system for admin-critical events:
 * - Webhook failures
 * - Low AI scores
 * - New coach signups
 * - System health degradation
 * 
 * Uses the built-in notifyOwner + in-app notifications table.
 */
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

// ============================================================================
// TYPES
// ============================================================================

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertCategory = "webhook" | "ai_pipeline" | "coach_signup" | "system_health" | "payment" | "security";

export interface AdminAlert {
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// NOTIFICATION DISPATCH
// ============================================================================

/**
 * Send an admin alert via both in-app notifications and owner notification.
 * Deduplicates alerts within a cooldown window to avoid spam.
 */
export async function sendAdminAlert(alert: AdminAlert): Promise<boolean> {
  try {
    const db = await getDb();

    // Dedup: check if same category+title was sent in last 30 minutes
    const cooldownMinutes = alert.severity === "critical" ? 5 : 30;
    const [recentAlerts] = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM notifications
      WHERE type = 'system'
      AND title = ${alert.title}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${cooldownMinutes} MINUTE)
    `);
    const recentCount = Number((recentAlerts as any)?.[0]?.cnt ?? 0);
    if (recentCount > 0) {
      console.log(`[AdminNotif] Dedup: "${alert.title}" already sent within ${cooldownMinutes}min, skipping`);
      return false;
    }

    // Insert in-app notification for all admin users
    const [admins] = await db.execute(sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 20
    `);
    const adminIds = Array.isArray(admins) ? admins.map((a: any) => a.id) : [];

    const severityIcon = alert.severity === "critical" ? "🔴" : alert.severity === "warning" ? "🟡" : "🔵";
    const fullTitle = `${severityIcon} ${alert.title}`;

    for (const adminId of adminIds) {
      await db.execute(sql`
        INSERT INTO notifications (userId, type, title, message, metadata, isRead, createdAt)
        VALUES (${adminId}, 'system', ${fullTitle}, ${alert.message}, ${JSON.stringify(alert.metadata || {})}, false, NOW())
      `);
    }

    // Also notify project owner via Manus notification service
    if (alert.severity === "critical" || alert.severity === "warning") {
      await notifyOwner({
        title: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        content: `${alert.message}\n\nCategory: ${alert.category}\nSeverity: ${alert.severity}`,
      });
    }

    console.log(`[AdminNotif] Alert sent: [${alert.severity}] ${alert.title} → ${adminIds.length} admins`);
    return true;
  } catch (err) {
    console.error("[AdminNotif] Failed to send alert:", err);
    return false;
  }
}

// ============================================================================
// TRIGGER: WEBHOOK FAILURE
// ============================================================================

/**
 * Called when a Stripe webhook fails processing.
 * Triggers an alert if failure rate exceeds threshold.
 */
export async function checkWebhookHealth(): Promise<void> {
  try {
    const db = await getDb();
    const [stats] = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM webhook_events_log
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);
    const total = Number((stats as any)?.[0]?.total ?? 0);
    const failed = Number((stats as any)?.[0]?.failed ?? 0);

    if (total === 0) return;

    const failureRate = failed / total;

    if (failureRate > 0.2) {
      await sendAdminAlert({
        category: "webhook",
        severity: "critical",
        title: "Stripe Webhook Failure Rate Critical",
        message: `${failed} of ${total} webhooks failed in the last hour (${(failureRate * 100).toFixed(1)}% failure rate). Immediate investigation required.`,
        metadata: { total, failed, failureRate, window: "1h" },
      });
    } else if (failed > 0) {
      await sendAdminAlert({
        category: "webhook",
        severity: "warning",
        title: "Stripe Webhook Failures Detected",
        message: `${failed} webhook(s) failed in the last hour. Check the webhook events log for details.`,
        metadata: { total, failed, failureRate, window: "1h" },
      });
    }
  } catch (err) {
    console.error("[AdminNotif] checkWebhookHealth error:", err);
  }
}

// ============================================================================
// TRIGGER: LOW AI SCORES
// ============================================================================

/**
 * Check for abnormally low AI scoring patterns.
 * Triggers alert if average score drops below threshold.
 */
export async function checkAIScoreHealth(): Promise<void> {
  try {
    const db = await getDb();
    const [scores] = await db.execute(sql`
      SELECT AVG(averageScore) as avgScore, COUNT(*) as sessionCount
      FROM sle_companion_sessions
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      AND averageScore IS NOT NULL
    `);
    const avgScore = Number((scores as any)?.[0]?.avgScore ?? 0);
    const sessionCount = Number((scores as any)?.[0]?.sessionCount ?? 0);

    if (sessionCount < 3) return; // Not enough data

    if (avgScore < 20) {
      await sendAdminAlert({
        category: "ai_pipeline",
        severity: "critical",
        title: "AI Scoring Anomaly: Extremely Low Scores",
        message: `Average SLE companion score is ${avgScore.toFixed(1)}/100 across ${sessionCount} sessions in the last 24h. This may indicate a scoring pipeline malfunction.`,
        metadata: { avgScore, sessionCount, window: "24h" },
      });
    } else if (avgScore < 40) {
      await sendAdminAlert({
        category: "ai_pipeline",
        severity: "warning",
        title: "AI Scoring Below Expected Range",
        message: `Average SLE companion score is ${avgScore.toFixed(1)}/100 across ${sessionCount} sessions in the last 24h. Review scoring rubric calibration.`,
        metadata: { avgScore, sessionCount, window: "24h" },
      });
    }
  } catch (err) {
    console.error("[AdminNotif] checkAIScoreHealth error:", err);
  }
}

// ============================================================================
// TRIGGER: NEW COACH SIGNUP
// ============================================================================

/**
 * Check for new coach applications and notify admins.
 */
export async function checkNewCoachSignups(): Promise<void> {
  try {
    const db = await getDb();
    const [newCoaches] = await db.execute(sql`
      SELECT cp.id, u.name, u.email, cp.createdAt
      FROM coach_profiles cp
      JOIN users u ON cp.userId = u.id
      WHERE cp.status = 'pending'
      AND cp.createdAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY cp.createdAt DESC
    `);

    const coaches = Array.isArray(newCoaches) ? newCoaches : [];
    if (coaches.length === 0) return;

    const coachNames = coaches.map((c: any) => c.name || c.email).join(", ");
    await sendAdminAlert({
      category: "coach_signup",
      severity: "info",
      title: `${coaches.length} New Coach Application${coaches.length > 1 ? "s" : ""}`,
      message: `New coach application(s) pending review: ${coachNames}. Go to Coaches Management to approve or reject.`,
      metadata: { count: coaches.length, coaches: coaches.map((c: any) => ({ id: c.id, name: c.name })) },
    });
  } catch (err) {
    console.error("[AdminNotif] checkNewCoachSignups error:", err);
  }
}

// ============================================================================
// TRIGGER: AI PIPELINE FAILURES
// ============================================================================

/**
 * Check AI pipeline failure rate from ai_pipeline_metrics.
 */
export async function checkAIPipelineHealth(): Promise<void> {
  try {
    const db = await getDb();
    const [metrics] = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failures
      FROM ai_pipeline_metrics
      WHERE recordedAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);
    const total = Number((metrics as any)?.[0]?.total ?? 0);
    const failures = Number((metrics as any)?.[0]?.failures ?? 0);

    if (total < 5) return; // Not enough data

    const failureRate = failures / total;

    if (failureRate > 0.3) {
      await sendAdminAlert({
        category: "ai_pipeline",
        severity: "critical",
        title: "AI Pipeline Failure Rate Critical",
        message: `${failures} of ${total} AI pipeline steps failed in the last hour (${(failureRate * 100).toFixed(1)}%). Check ASR, LLM, and TTS services.`,
        metadata: { total, failures, failureRate, window: "1h" },
      });
    } else if (failureRate > 0.1) {
      await sendAdminAlert({
        category: "ai_pipeline",
        severity: "warning",
        title: "AI Pipeline Elevated Failure Rate",
        message: `${failures} AI pipeline failures in the last hour (${(failureRate * 100).toFixed(1)}% rate). Monitor closely.`,
        metadata: { total, failures, failureRate, window: "1h" },
      });
    }
  } catch (err) {
    console.error("[AdminNotif] checkAIPipelineHealth error:", err);
  }
}

// ============================================================================
// SCHEDULED HEALTH CHECK (run periodically)
// ============================================================================

/**
 * Run all health checks. Call this from a cron job or scheduler.
 */
export async function runAllHealthChecks(): Promise<{ checked: string[]; alerts: number }> {
  console.log("[AdminNotif] Running all health checks...");
  const checks = [
    { name: "webhookHealth", fn: checkWebhookHealth },
    { name: "aiScoreHealth", fn: checkAIScoreHealth },
    { name: "newCoachSignups", fn: checkNewCoachSignups },
    { name: "aiPipelineHealth", fn: checkAIPipelineHealth },
  ];

  const checked: string[] = [];
  let alertCount = 0;

  for (const check of checks) {
    try {
      await check.fn();
      checked.push(check.name);
    } catch (err) {
      console.error(`[AdminNotif] Health check "${check.name}" failed:`, err);
    }
  }

  console.log(`[AdminNotif] Health checks complete: ${checked.length}/${checks.length} ran`);
  return { checked, alerts: alertCount };
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

/**
 * Get notification preferences for an admin user.
 */
export async function getAdminNotificationPrefs(userId: number): Promise<Record<AlertCategory, boolean>> {
  const db = await getDb();
  const [rows] = await db.execute(sql`
    SELECT settingKey, settingValue FROM platform_settings
    WHERE settingKey LIKE CONCAT('notif_pref_', ${userId}, '_%')
  `);
  
  const defaults: Record<AlertCategory, boolean> = {
    webhook: true,
    ai_pipeline: true,
    coach_signup: true,
    system_health: true,
    payment: true,
    security: true,
  };

  if (!Array.isArray(rows)) return defaults;

  for (const row of rows as any[]) {
    const key = row.settingKey.replace(`notif_pref_${userId}_`, "") as AlertCategory;
    if (key in defaults) {
      defaults[key] = row.settingValue === "true";
    }
  }

  return defaults;
}

/**
 * Update notification preference for an admin user.
 */
export async function setAdminNotificationPref(
  userId: number,
  category: AlertCategory,
  enabled: boolean
): Promise<void> {
  const db = await getDb();
  const key = `notif_pref_${userId}_${category}`;
  await db.execute(sql`
    INSERT INTO platform_settings (settingKey, settingValue, updatedAt)
    VALUES (${key}, ${enabled ? "true" : "false"}, NOW())
    ON DUPLICATE KEY UPDATE settingValue = ${enabled ? "true" : "false"}, updatedAt = NOW()
  `);
}
