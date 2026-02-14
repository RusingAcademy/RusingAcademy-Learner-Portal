/**
 * Notification Service
 * 
 * Handles email-style notifications for:
 * - Coaching session reminders (24h and 1h before)
 * - HR Manager invitation emails
 * - Session confirmation/cancellation notices
 * 
 * Uses the built-in notifyOwner for admin alerts,
 * and stores user-facing notifications in the DB.
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, lte, gte, sql, desc } from "drizzle-orm";
import { coachingSessions } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

/* ───────────────────── NOTIFICATION LOG TABLE ───────────────────── */
// We define the table inline here since it's notification-specific
export const notificationLog = mysqlTable("notification_log", {
  id: int("id").autoincrement().primaryKey(),
  recipientType: mysqlEnum("recipientType", ["participant", "coach", "hr_manager", "admin"]).notNull(),
  recipientId: int("recipientId"),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  notificationType: mysqlEnum("notificationType", [
    "session_reminder_24h",
    "session_reminder_1h",
    "session_confirmed",
    "session_cancelled",
    "invitation_sent",
    "invitation_accepted",
    "compliance_due",
    "general",
  ]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: int("relatedEntityId"),
  isRead: boolean("isRead").default(false).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Notifications] DB connection failed:", error);
      _db = null;
    }
  }
  return _db;
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION CREATION
   ═══════════════════════════════════════════════════════════ */

export interface NotificationInput {
  recipientType: "participant" | "coach" | "hr_manager" | "admin";
  recipientId?: number;
  recipientEmail?: string;
  notificationType: string;
  title: string;
  content: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export async function createNotification(input: NotificationInput) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Cannot create notification — no DB connection");
    return null;
  }
  try {
    const [result] = await db.insert(notificationLog).values(input as any);
    return { id: result.insertId };
  } catch (error) {
    console.warn("[Notifications] Failed to create notification:", error);
    return null;
  }
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificationLog)
    .where(eq(notificationLog.recipientId, userId))
    .orderBy(desc(notificationLog.sentAt))
    .limit(limit);
}

export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(notificationLog)
    .set({ isRead: true, readAt: new Date() } as any)
    .where(and(eq(notificationLog.id, notificationId), eq(notificationLog.recipientId, userId)));
  return { success: true };
}

export async function getUnreadCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [row] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(notificationLog)
    .where(and(eq(notificationLog.recipientId, userId), eq(notificationLog.isRead, false)));
  return row?.count ?? 0;
}

/* ═══════════════════════════════════════════════════════════
   COACHING SESSION REMINDERS
   ═══════════════════════════════════════════════════════════ */

/**
 * Check for upcoming coaching sessions and create reminder notifications.
 * Call this periodically (e.g., every 30 minutes via a scheduled job).
 */
export async function processSessionReminders() {
  const db = await getDb();
  if (!db) return { processed: 0 };

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in1h = new Date(now.getTime() + 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  let processed = 0;

  try {
    // 24-hour reminders: sessions between 24h and 25h from now
    const sessions24h = await db.select().from(coachingSessions)
      .where(and(
        gte(coachingSessions.scheduledAt, in24h),
        lte(coachingSessions.scheduledAt, in25h),
        eq(coachingSessions.status, "confirmed"),
      ));

    for (const session of sessions24h) {
      const scheduledDate = new Date(session.scheduledAt!);
      const formattedDate = scheduledDate.toLocaleDateString("en-CA", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", timeZone: "America/Toronto",
      });

      // Notify participant
      if (session.participantId) {
        await createNotification({
          recipientType: "participant",
          recipientId: session.participantId,
          notificationType: "session_reminder_24h",
          title: `Reminder: ${session.title} — Tomorrow`,
          content: `Your coaching session "${session.title}" is scheduled for ${formattedDate}. Please ensure you're prepared and have your materials ready.`,
          relatedEntityType: "coaching_session",
          relatedEntityId: session.id,
        });
        processed++;
      }

      // Notify coach
      if (session.coachId) {
        await createNotification({
          recipientType: "coach",
          recipientId: session.coachId,
          notificationType: "session_reminder_24h",
          title: `Upcoming Session: ${session.title} — Tomorrow`,
          content: `You have a coaching session "${session.title}" scheduled for ${formattedDate}. Please review the participant's progress before the session.`,
          relatedEntityType: "coaching_session",
          relatedEntityId: session.id,
        });
        processed++;
      }
    }

    // 1-hour reminders: sessions between 1h and 2h from now
    const sessions1h = await db.select().from(coachingSessions)
      .where(and(
        gte(coachingSessions.scheduledAt, in1h),
        lte(coachingSessions.scheduledAt, in2h),
        eq(coachingSessions.status, "confirmed"),
      ));

    for (const session of sessions1h) {
      if (session.participantId) {
        await createNotification({
          recipientType: "participant",
          recipientId: session.participantId,
          notificationType: "session_reminder_1h",
          title: `Starting Soon: ${session.title}`,
          content: `Your coaching session "${session.title}" starts in about 1 hour.${session.meetingUrl ? ` Join here: ${session.meetingUrl}` : ""}`,
          relatedEntityType: "coaching_session",
          relatedEntityId: session.id,
        });
        processed++;
      }

      if (session.coachId) {
        await createNotification({
          recipientType: "coach",
          recipientId: session.coachId,
          notificationType: "session_reminder_1h",
          title: `Starting Soon: ${session.title}`,
          content: `Your coaching session "${session.title}" starts in about 1 hour.${session.meetingUrl ? ` Meeting link: ${session.meetingUrl}` : ""}`,
          relatedEntityType: "coaching_session",
          relatedEntityId: session.id,
        });
        processed++;
      }
    }

    // Notify owner about reminder batch
    if (processed > 0) {
      await notifyOwner({
        title: `Session Reminders Sent: ${processed}`,
        content: `Processed ${sessions24h.length} sessions for 24h reminders and ${sessions1h.length} sessions for 1h reminders. Total notifications: ${processed}.`,
      });
    }
  } catch (error) {
    console.warn("[Notifications] Error processing session reminders:", error);
  }

  return { processed };
}

/* ═══════════════════════════════════════════════════════════
   INVITATION NOTIFICATIONS
   ═══════════════════════════════════════════════════════════ */

export async function sendInvitationNotification(data: {
  email: string;
  invitedName?: string;
  organizationName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
  message?: string;
}) {
  // Create a notification record
  await createNotification({
    recipientType: "hr_manager",
    recipientEmail: data.email,
    notificationType: "invitation_sent",
    title: `Invitation to join ${data.organizationName} on RusingÂcademy`,
    content: `${data.inviterName} has invited ${data.invitedName || "you"} to join ${data.organizationName} as a ${data.role.replace(/_/g, " ")}. Accept your invitation at: ${data.inviteUrl}${data.message ? `\n\nMessage: ${data.message}` : ""}`,
  });

  // Also notify the platform owner
  await notifyOwner({
    title: `New HR Manager Invitation: ${data.email}`,
    content: `${data.inviterName} invited ${data.invitedName || data.email} to join "${data.organizationName}" as ${data.role.replace(/_/g, " ")}.\n\nInvitation link: ${data.inviteUrl}`,
  });

  return { sent: true };
}

/* ═══════════════════════════════════════════════════════════
   SESSION STATUS NOTIFICATIONS
   ═══════════════════════════════════════════════════════════ */

export async function notifySessionConfirmed(sessionId: number, sessionTitle: string, participantId?: number, coachId?: number) {
  if (participantId) {
    await createNotification({
      recipientType: "participant",
      recipientId: participantId,
      notificationType: "session_confirmed",
      title: `Session Confirmed: ${sessionTitle}`,
      content: `Your coaching session "${sessionTitle}" has been confirmed. You will receive a reminder before the session starts.`,
      relatedEntityType: "coaching_session",
      relatedEntityId: sessionId,
    });
  }
  if (coachId) {
    await createNotification({
      recipientType: "coach",
      recipientId: coachId,
      notificationType: "session_confirmed",
      title: `Session Confirmed: ${sessionTitle}`,
      content: `The coaching session "${sessionTitle}" has been confirmed.`,
      relatedEntityType: "coaching_session",
      relatedEntityId: sessionId,
    });
  }
}

export async function notifySessionCancelled(sessionId: number, sessionTitle: string, reason: string, participantId?: number, coachId?: number) {
  if (participantId) {
    await createNotification({
      recipientType: "participant",
      recipientId: participantId,
      notificationType: "session_cancelled",
      title: `Session Cancelled: ${sessionTitle}`,
      content: `Your coaching session "${sessionTitle}" has been cancelled.${reason ? ` Reason: ${reason}` : ""} Please contact your training coordinator to reschedule.`,
      relatedEntityType: "coaching_session",
      relatedEntityId: sessionId,
    });
  }
  if (coachId) {
    await createNotification({
      recipientType: "coach",
      recipientId: coachId,
      notificationType: "session_cancelled",
      title: `Session Cancelled: ${sessionTitle}`,
      content: `The coaching session "${sessionTitle}" has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      relatedEntityType: "coaching_session",
      relatedEntityId: sessionId,
    });
  }
}
