/**
 * Session Reminder Service
 * Handles automatic session reminders via email and in-app notifications
 */

import { getDb } from "./db";
import { sessions, users, coachProfiles, learnerProfiles, inAppNotifications, emailLogs } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { sendEmail } from "./email";

// Types
interface SessionWithDetails {
  id: number;
  scheduledAt: Date;
  duration: number;
  sessionType: string;
  focusArea: string;
  status: string;
  coachId: number;
  learnerId: number;
  coachName: string | null;
  coachEmail: string | null;
  learnerName: string | null;
  learnerEmail: string | null;
  learnerLanguage: string;
}

interface ReminderResult {
  sessionId: number;
  type: "24h" | "1h";
  success: boolean;
  error?: string;
}

/**
 * Get upcoming sessions that need reminders
 */
export async function getSessionsNeedingReminders(
  hoursAhead: number
): Promise<SessionWithDetails[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const targetTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  
  // Window: hoursAhead - 30min to hoursAhead + 30min
  const windowStart = new Date(targetTime.getTime() - 30 * 60 * 1000);
  const windowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000);

  const result = await db
    .select({
      id: sessions.id,
      scheduledAt: sessions.scheduledAt,
      duration: sessions.duration,
      sessionType: sessions.sessionType,
      focusArea: sessions.focusArea,
      status: sessions.status,
      coachId: sessions.coachId,
      learnerId: sessions.learnerId,
      coachName: sql<string | null>`coach_user.name`,
      coachEmail: sql<string | null>`coach_user.email`,
      learnerName: sql<string | null>`learner_user.name`,
      learnerEmail: sql<string | null>`learner_user.email`,
      learnerLanguage: sql<string>`COALESCE(learner_user.preferredLanguage, 'en')`,
    })
    .from(sessions)
    .innerJoin(coachProfiles, eq(sessions.coachId, coachProfiles.id))
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .innerJoin(learnerProfiles, eq(sessions.learnerId, learnerProfiles.id))
    .innerJoin(
      sql`users AS learner_user`,
      sql`learner_profiles.userId = learner_user.id`
    )
    .innerJoin(
      sql`users AS coach_user`,
      sql`coach_profiles.userId = coach_user.id`
    )
    .where(
      and(
        eq(sessions.status, "confirmed"),
        gte(sessions.scheduledAt, windowStart),
        lte(sessions.scheduledAt, windowEnd)
      )
    );

  return result as SessionWithDetails[];
}

/**
 * Check if reminder was already sent
 */
async function wasReminderSent(
  sessionId: number,
  reminderType: "reminder_24h" | "reminder_1h"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // Assume sent if no db to prevent spam
  
  const existing = await db
    .select({ id: emailLogs.id })
    .from(emailLogs)
    .where(
      and(
        eq(emailLogs.type, reminderType),
        sql`JSON_EXTRACT(metadata, '$.sessionId') = ${sessionId}`
      )
    )
    .limit(1);

  return existing.length > 0;
}

/**
 * Send session reminder email
 */
async function sendReminderEmail(
  session: SessionWithDetails,
  reminderType: "24h" | "1h"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const isEn = session.learnerLanguage === "en";
  const scheduledDate = new Date(session.scheduledAt);
  
  const formattedDate = scheduledDate.toLocaleDateString(
    isEn ? "en-US" : "fr-FR",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );
  
  const formattedTime = scheduledDate.toLocaleTimeString(
    isEn ? "en-US" : "fr-FR",
    { hour: "2-digit", minute: "2-digit" }
  );

  const subject =
    reminderType === "24h"
      ? isEn
        ? `Reminder: Your session tomorrow with ${session.coachName}`
        : `Rappel: Votre session demain avec ${session.coachName}`
      : isEn
      ? `Starting soon: Your session in 1 hour with ${session.coachName}`
      : `Bientôt: Votre session dans 1 heure avec ${session.coachName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E9B8A;">
        ${
          reminderType === "24h"
            ? isEn
              ? "Session Tomorrow"
              : "Session Demain"
            : isEn
            ? "Session Starting Soon"
            : "Session Imminente"
        }
      </h2>
      
      <p>
        ${
          isEn
            ? `Hi ${session.learnerName || "there"},`
            : `Bonjour ${session.learnerName || ""},`
        }
      </p>
      
      <p>
        ${
          reminderType === "24h"
            ? isEn
              ? "This is a friendly reminder about your upcoming coaching session:"
              : "Ceci est un rappel amical concernant votre prochaine session de coaching :"
            : isEn
            ? "Your coaching session is starting in about 1 hour:"
            : "Votre session de coaching commence dans environ 1 heure :"
        }
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;">
          <strong>${isEn ? "Coach:" : "Coach :"}</strong> ${session.coachName}
        </p>
        <p style="margin: 0 0 10px 0;">
          <strong>${isEn ? "Date:" : "Date :"}</strong> ${formattedDate}
        </p>
        <p style="margin: 0 0 10px 0;">
          <strong>${isEn ? "Time:" : "Heure :"}</strong> ${formattedTime}
        </p>
        <p style="margin: 0;">
          <strong>${isEn ? "Duration:" : "Durée :"}</strong> ${session.duration} ${
    isEn ? "minutes" : "minutes"
  }
        </p>
      </div>
      
      <p>
        ${
          isEn
            ? "Make sure you're in a quiet place with a stable internet connection."
            : "Assurez-vous d'être dans un endroit calme avec une connexion internet stable."
        }
      </p>
      
      <a href="${process.env.VITE_APP_URL || "https://rusingacademy.com"}/my-sessions" 
         style="display: inline-block; background: #1E9B8A; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; margin-top: 16px;">
        ${isEn ? "View Session Details" : "Voir les Détails"}
      </a>
      
      <p style="color: #666; font-size: 14px; margin-top: 24px;">
        ${
          isEn
            ? "Best regards,<br>The RusingAcademy Team"
            : "Cordialement,<br>L'équipe RusingAcademy"
        }
      </p>
    </div>
  `;

  try {
    if (session.learnerEmail) {
      await sendEmail({
        to: session.learnerEmail,
        subject,
        html,
      });

      // Log the email
    // @ts-ignore - overload resolution
      await db.insert(emailLogs).values({
        userId: session.learnerId,
        type: reminderType === "24h" ? "reminder_24h" : "reminder_1h",
        to: session.learnerEmail,
        subject,
        status: "sent",
        metadata: { sessionId: session.id },
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to send ${reminderType} reminder email:`, error);
    return false;
  }
}

/**
 * Create in-app notification for session reminder
 */
async function createInAppReminder(
  session: SessionWithDetails,
  reminderType: "24h" | "1h"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const isEn = session.learnerLanguage === "en";
  const scheduledDate = new Date(session.scheduledAt);
  
  const formattedTime = scheduledDate.toLocaleTimeString(
    isEn ? "en-US" : "fr-FR",
    { hour: "2-digit", minute: "2-digit" }
  );

  try {
    // Get learner user ID
    const learnerProfile = await db
      .select({ userId: learnerProfiles.userId })
      .from(learnerProfiles)
      .where(eq(learnerProfiles.id, session.learnerId))
      .limit(1);

    if (learnerProfile.length === 0) return false;
    // @ts-ignore - overload resolution

    await db.insert(inAppNotifications).values({
      userId: learnerProfile[0].userId,
      type: "session",
      title:
        reminderType === "24h"
          ? "Session Tomorrow"
          : "Session in 1 Hour",
      titleFr:
        reminderType === "24h"
          ? "Session Demain"
          : "Session dans 1 Heure",
      message: `Your session with ${session.coachName} is ${
        reminderType === "24h" ? "tomorrow" : "starting soon"
      } at ${formattedTime}.`,
      messageFr: `Votre session avec ${session.coachName} ${
        reminderType === "24h" ? "est demain" : "commence bientôt"
      } à ${formattedTime}.`,
      link: "/my-sessions",
      isRead: false,
    });

    return true;
  } catch (error) {
    console.error(`Failed to create in-app reminder:`, error);
    return false;
  }
}

/**
 * Process all session reminders
 */
export async function processSessionReminders(): Promise<{
  processed: number;
  results: ReminderResult[];
}> {
  const results: ReminderResult[] = [];

  // Process 24-hour reminders
  const sessions24h = await getSessionsNeedingReminders(24);
  for (const session of sessions24h) {
    const alreadySent = await wasReminderSent(session.id, "reminder_24h");
    if (!alreadySent) {
      const emailSent = await sendReminderEmail(session, "24h");
      const inAppCreated = await createInAppReminder(session, "24h");
      
      results.push({
        sessionId: session.id,
        type: "24h",
        success: emailSent || inAppCreated,
        error: !emailSent && !inAppCreated ? "Both email and in-app failed" : undefined,
      });
    }
  }

  // Process 1-hour reminders
  const sessions1h = await getSessionsNeedingReminders(1);
  for (const session of sessions1h) {
    const alreadySent = await wasReminderSent(session.id, "reminder_1h");
    if (!alreadySent) {
      const emailSent = await sendReminderEmail(session, "1h");
      const inAppCreated = await createInAppReminder(session, "1h");
      
      results.push({
        sessionId: session.id,
        type: "1h",
        success: emailSent || inAppCreated,
        error: !emailSent && !inAppCreated ? "Both email and in-app failed" : undefined,
      });
    }
  }

  return {
    processed: results.length,
    results,
  };
}

/**
 * Start the reminder scheduler (runs every 15 minutes)
 */
let reminderInterval: NodeJS.Timeout | null = null;

export function startReminderScheduler(): void {
  if (reminderInterval) {
    console.log("[Reminders] Scheduler already running");
    return;
  }

  console.log("[Reminders] Starting session reminder scheduler");
  
  // Run immediately on start
  processSessionReminders()
    .then((result) => {
      console.log(`[Reminders] Initial run: processed ${result.processed} reminders`);
    })
    .catch((error) => {
      console.error("[Reminders] Initial run failed:", error);
    });

  // Run every 15 minutes
  reminderInterval = setInterval(async () => {
    try {
      const result = await processSessionReminders();
      if (result.processed > 0) {
        console.log(`[Reminders] Processed ${result.processed} reminders`);
      }
    } catch (error) {
      console.error("[Reminders] Scheduler error:", error);
    }
  }, 15 * 60 * 1000); // 15 minutes
}

export function stopReminderScheduler(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    console.log("[Reminders] Scheduler stopped");
  }
}

export default {
  processSessionReminders,
  startReminderScheduler,
  stopReminderScheduler,
};
