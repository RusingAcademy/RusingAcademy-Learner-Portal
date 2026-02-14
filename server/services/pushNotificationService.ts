/**
 * Push Notification Service
 * Server-side push notification sending with automatic triggers
 * for badges, streaks, sessions, and weekly digests.
 */
import webpush from "web-push";
import { getDb } from "../db";
import { sql, eq, and } from "drizzle-orm";
import { structuredLog } from "../structuredLogger";

// ─── VAPID Configuration ───────────────────────────────────
// Generate VAPID keys if not set (in production, these should be env vars)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@rusingacademy.com";

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return true;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    // Generate keys dynamically for development
    const keys = webpush.generateVAPIDKeys();
    webpush.setVapidDetails(VAPID_SUBJECT, keys.publicKey, keys.privateKey);
    structuredLog("warn", "push", "Using auto-generated VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY for production.", {});
    vapidConfigured = true;
    return true;
  }
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    vapidConfigured = true;
    return true;
  } catch (err) {
    structuredLog("error", "push", "Failed to configure VAPID", { error: String(err) });
    return false;
  }
}

// ─── Types ─────────────────────────────────────────────────
export type PushCategory = "bookings" | "messages" | "reminders" | "marketing";

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
  category: PushCategory;
}

// ─── Core Send Function ────────────────────────────────────
async function getActiveSubscriptions(userId: number, category: PushCategory) {
  const db = await getDb();
  if (!db) return [];

  const categoryColumn = {
    bookings: "enableBookings",
    messages: "enableMessages",
    reminders: "enableReminders",
    marketing: "enableMarketing",
  }[category];

  const results = await db.execute(sql`
    SELECT id, endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE userId = ${userId}
      AND isActive = 1
      AND ${sql.raw(categoryColumn)} = 1
  `);

  return (results as any)[0] || [];
}

export async function sendPushToUser(userId: number, payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!ensureVapidConfigured()) {
    return { sent: 0, failed: 0 };
  }

  const subscriptions = await getActiveSubscriptions(userId, payload.category);
  let sent = 0;
  let failed = 0;

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icons/rusingacademy-icon-192.png",
    badge: payload.badge || "/icons/badge-72.png",
    tag: payload.tag || `ra-${Date.now()}`,
    data: {
      ...payload.data,
      url: payload.url || "/",
    },
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        notificationPayload,
        { TTL: 86400 } // 24 hours
      );
      sent++;
    } catch (err: any) {
      failed++;
      // If subscription is expired/invalid, deactivate it
      if (err.statusCode === 404 || err.statusCode === 410) {
        const db = await getDb();
        if (db) {
          await db.execute(sql`
            UPDATE push_subscriptions SET isActive = 0 WHERE id = ${sub.id}
          `);
          structuredLog("info", "push", "Deactivated expired subscription", { subId: sub.id, userId });
        }
      } else {
        structuredLog("error", "push", "Failed to send push", {
          userId,
          error: err.message,
          statusCode: err.statusCode,
        });
      }
    }
  }

  structuredLog("info", "push", `Push sent to user ${userId}`, { sent, failed, category: payload.category });
  return { sent, failed };
}

// ─── Trigger Functions ─────────────────────────────────────

/** Notify user when they earn a new badge */
export async function notifyBadgeEarned(userId: number, badgeName: string, badgeIcon: string) {
  return sendPushToUser(userId, {
    title: "🏆 New Badge Earned!",
    body: `Congratulations! You earned the "${badgeName}" badge.`,
    icon: badgeIcon || "/icons/badge-default.png",
    tag: `badge-${Date.now()}`,
    category: "reminders",
    url: "/portal/badges",
    data: { type: "badge_earned", badgeName },
  });
}

/** Notify user when their streak is at risk (haven't practiced today) */
export async function notifyStreakAtRisk(userId: number, currentStreak: number) {
  return sendPushToUser(userId, {
    title: "🔥 Streak at Risk!",
    body: `Your ${currentStreak}-day streak is about to end! Complete a quick practice to keep it alive.`,
    tag: "streak-risk",
    category: "reminders",
    url: "/portal/practice",
    data: { type: "streak_at_risk", currentStreak },
  });
}

/** Notify user about an upcoming coaching session */
export async function notifyUpcomingSession(
  userId: number,
  coachName: string,
  sessionTime: string,
  minutesBefore: number
) {
  return sendPushToUser(userId, {
    title: `📅 Session in ${minutesBefore} minutes`,
    body: `Your coaching session with ${coachName} starts soon. Get ready!`,
    tag: `session-reminder-${sessionTime}`,
    category: "bookings",
    url: "/portal/sessions",
    data: { type: "session_reminder", coachName, sessionTime },
  });
}

/** Notify user about a milestone reached */
export async function notifyMilestoneReached(userId: number, milestoneName: string, xpAmount: number) {
  return sendPushToUser(userId, {
    title: "⭐ Milestone Reached!",
    body: `You've reached ${xpAmount.toLocaleString()} XP — ${milestoneName}! Keep going!`,
    tag: `milestone-${xpAmount}`,
    category: "reminders",
    url: "/portal/dashboard",
    data: { type: "milestone_reached", milestoneName, xpAmount },
  });
}

/** Notify user about weekly progress digest */
export async function notifyWeeklyDigest(userId: number, xpThisWeek: number, streakDays: number) {
  return sendPushToUser(userId, {
    title: "📊 Your Weekly Progress",
    body: `This week: ${xpThisWeek} XP earned, ${streakDays}-day streak. Check your full report!`,
    tag: "weekly-digest",
    category: "reminders",
    url: "/portal/dashboard",
    data: { type: "weekly_digest", xpThisWeek, streakDays },
  });
}

/** Notify coach about a new booking request */
export async function notifyCoachNewBooking(coachUserId: number, learnerName: string, sessionDate: string) {
  return sendPushToUser(coachUserId, {
    title: "📋 New Booking Request",
    body: `${learnerName} has requested a session on ${sessionDate}. Review and confirm.`,
    tag: `booking-${Date.now()}`,
    category: "bookings",
    url: "/coach/dashboard",
    data: { type: "new_booking", learnerName, sessionDate },
  });
}

/** Notify user about a new message */
export async function notifyNewMessage(userId: number, senderName: string, preview: string) {
  return sendPushToUser(userId, {
    title: `💬 Message from ${senderName}`,
    body: preview.substring(0, 100) + (preview.length > 100 ? "..." : ""),
    tag: `message-${Date.now()}`,
    category: "messages",
    url: "/portal/messages",
    data: { type: "new_message", senderName },
  });
}

// ─── Streak Check Cron (runs daily at 8 PM) ───────────────
export async function checkStreaksAtRisk(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Find users with active streaks who haven't practiced today
  const atRiskUsers = await db.execute(sql`
    SELECT lx.userId, lx.currentStreak
    FROM learner_xp lx
    WHERE lx.currentStreak > 0
      AND lx.lastActivityDate < CURDATE()
      AND lx.lastActivityDate >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
  `);

  const users = (atRiskUsers as any)[0] || [];
  let notified = 0;

  for (const user of users) {
    const result = await notifyStreakAtRisk(user.userId, user.currentStreak);
    if (result.sent > 0) notified++;
  }

  structuredLog("info", "push-cron", `Streak risk check: ${notified}/${users.length} users notified`, {});
  return notified;
}

// ─── Session Reminder Cron (runs every 15 min) ────────────
export async function checkUpcomingSessions(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Find sessions starting in the next 30 minutes that haven't been reminded
  const upcoming = await db.execute(sql`
    SELECT s.id, s.learnerId, s.coachId, s.scheduledAt,
           u_learner.name as learnerName, u_coach.name as coachName,
           lp.userId as learnerUserId, cp.userId as coachUserId
    FROM sessions s
    JOIN learner_profiles lp ON s.learnerId = lp.id
    JOIN users u_learner ON lp.userId = u_learner.id
    JOIN coach_profiles cp ON s.coachId = cp.id
    JOIN users u_coach ON cp.userId = u_coach.id
    WHERE s.scheduledAt BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 MINUTE)
      AND s.status = 'confirmed'
      AND s.reminderSent IS NULL OR s.reminderSent = 0
  `);

  const sessionsList = (upcoming as any)[0] || [];
  let notified = 0;

  for (const session of sessionsList) {
    const minutesBefore = Math.round(
      (new Date(session.scheduledAt).getTime() - Date.now()) / 60000
    );

    // Notify learner
    await notifyUpcomingSession(
      session.learnerUserId,
      session.coachName,
      session.scheduledAt,
      minutesBefore
    );

    // Notify coach
    await notifyUpcomingSession(
      session.coachUserId,
      session.learnerName,
      session.scheduledAt,
      minutesBefore
    );

    // Mark as reminded (gracefully handle missing column)
    try {
      await db.execute(sql`
        UPDATE sessions SET reminderSent = 1 WHERE id = ${session.id}
      `);
    } catch {
      // Column might not exist yet, skip
    }

    notified++;
  }

  structuredLog("info", "push-cron", `Session reminders: ${notified} sessions notified`, {});
  return notified;
}

/** Get VAPID public key for client-side subscription */
export function getVapidPublicKey(): string {
  ensureVapidConfigured();
  return VAPID_PUBLIC_KEY || "(auto-generated — set VAPID_PUBLIC_KEY for production)";
}
