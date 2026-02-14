import { getDb } from "./db";
import { sessions, coachProfiles, learnerProfiles, users } from "../drizzle/schema";
import { eq, and, gte, lte, isNull } from "drizzle-orm";
import { sendEmail, generateICSFile } from "./email";

// Reminder types
type ReminderType = "24h" | "1h";

interface SessionWithDetails {
  sessionId: number;
  scheduledAt: Date;
  duration: number;
  sessionType: string | null;
  focusArea: string | null;
  coachName: string | null;
  coachEmail: string | null;
  learnerName: string | null;
  learnerEmail: string | null;
  meetingUrl: string | null;
}

/**
 * Get sessions that need reminders sent
 * @param reminderType - "24h" or "1h" reminder
 */
export async function getSessionsNeedingReminders(reminderType: ReminderType): Promise<SessionWithDetails[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  let windowStart: Date;
  let windowEnd: Date;

  if (reminderType === "24h") {
    // Sessions happening in 23-25 hours
    windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  } else {
    // Sessions happening in 55-65 minutes
    windowStart = new Date(now.getTime() + 55 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 65 * 60 * 1000);
  }

  const results = await db
    .select({
      sessionId: sessions.id,
      scheduledAt: sessions.scheduledAt,
      duration: sessions.duration,
      sessionType: sessions.sessionType,
      focusArea: sessions.focusArea,
      meetingUrl: sessions.meetingUrl,
      coachName: users.name,
      coachEmail: users.email,
    })
    .from(sessions)
    .innerJoin(coachProfiles, eq(sessions.coachId, coachProfiles.id))
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .where(
      and(
        eq(sessions.status, "confirmed"),
        gte(sessions.scheduledAt, windowStart),
        lte(sessions.scheduledAt, windowEnd)
      )
    );

  // Get learner details for each session
  const sessionsWithDetails: SessionWithDetails[] = [];
  
  for (const session of results) {
    const learnerResult = await db
      .select({
        learnerName: users.name,
        learnerEmail: users.email,
      })
      .from(sessions)
      .innerJoin(learnerProfiles, eq(sessions.learnerId, learnerProfiles.id))
      .innerJoin(users, eq(learnerProfiles.userId, users.id))
      .where(eq(sessions.id, session.sessionId))
      .limit(1);

    if (learnerResult.length > 0) {
      sessionsWithDetails.push({
        ...session,
        scheduledAt: new Date(session.scheduledAt),
        learnerName: learnerResult[0].learnerName || "Learner",
        learnerEmail: learnerResult[0].learnerEmail || "",
      });
    }
  }

  return sessionsWithDetails;
}

/**
 * Send reminder email to a participant
 */
async function sendReminderEmail(
  session: SessionWithDetails,
  recipientType: "coach" | "learner",
  reminderType: ReminderType
): Promise<boolean> {
  const isCoach = recipientType === "coach";
  const recipientName = isCoach ? session.coachName : session.learnerName;
  const recipientEmail = isCoach ? session.coachEmail : session.learnerEmail;
  const otherPartyName = isCoach ? session.learnerName : session.coachName;

  if (!recipientEmail) {
    console.warn(`No email for ${recipientType} in session ${session.sessionId}`);
    return false;
  }

  const timeUntil = reminderType === "24h" ? "24 hours" : "1 hour";
  const sessionDate = session.scheduledAt.toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const sessionTime = session.scheduledAt.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const focusAreaLabels: Record<string, string> = {
    oral_a: "Oral A",
    oral_b: "Oral B",
    oral_c: "Oral C",
    written: "Written",
    reading: "Reading",
    general: "General Practice",
  };

  const subject = reminderType === "24h"
    ? `Reminder: Your Lingueefy session is tomorrow`
    : `Starting Soon: Your Lingueefy session begins in 1 hour`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">
          ${reminderType === "24h" ? "📅 Session Reminder" : "⏰ Starting Soon!"}
        </h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi ${recipientName?.split(" ")[0] || (isCoach ? "Coach" : "there")},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          ${reminderType === "24h" 
            ? `This is a friendly reminder that you have a coaching session scheduled for <strong>tomorrow</strong>.`
            : `Your coaching session is starting in <strong>1 hour</strong>. Please make sure you're ready!`
          }
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 15px 0; color: #059669;">Session Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Date:</td>
              <td style="padding: 8px 0; font-weight: 500;">${sessionDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Time:</td>
              <td style="padding: 8px 0; font-weight: 500;">${sessionTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Duration:</td>
              <td style="padding: 8px 0; font-weight: 500;">${session.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">${isCoach ? "Learner:" : "Coach:"}</td>
              <td style="padding: 8px 0; font-weight: 500;">${otherPartyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Focus:</td>
              <td style="padding: 8px 0; font-weight: 500;">${focusAreaLabels[session.focusArea || "general"] || "General Practice"}</td>
            </tr>
          </table>
        </div>
        
        ${session.meetingUrl ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${session.meetingUrl}" style="display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">
              Join Video Session
            </a>
          </div>
        ` : `
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Meeting link will be available in your dashboard.
          </p>
        `}
        
        <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>💡 Tip:</strong> ${isCoach 
              ? "Review your learner's profile and goals before the session to provide personalized guidance."
              : "Have your questions ready and find a quiet space for the best learning experience."
            }
          </p>
        </div>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Need to reschedule? Visit your <a href="https://www.rusingacademy.ca/dashboard" style="color: #059669;">dashboard</a> to manage your sessions.
        </p>
        <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
          © ${new Date().getFullYear()} Lingueefy - Canada's GC/SLE Language Platform
        </p>
      </div>
    </body>
    </html>
  `;

  // Generate ICS calendar attachment
  const icsContent = generateICSFile({
    title: `Lingueefy: ${session.sessionType === "trial" ? "Trial" : "Coaching"} Session`,
    description: `${focusAreaLabels[session.focusArea || "general"]} session with ${otherPartyName}`,
    startTime: session.scheduledAt,
    duration: session.duration,
    location: session.meetingUrl || "See Lingueefy dashboard for meeting link",
  });

  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
    attachments: [
      {
        filename: "session-reminder.ics",
        content: icsContent,
        contentType: "text/calendar",
      },
    ],
  });
}

/**
 * Process and send all pending reminders
 * This should be called by a cron job every 5-10 minutes
 */
export async function processReminders(): Promise<{ sent24h: number; sent1h: number; errors: number }> {
  const results = { sent24h: 0, sent1h: 0, errors: 0 };

  try {
    // Process 24-hour reminders
    const sessions24h = await getSessionsNeedingReminders("24h");
    for (const session of sessions24h) {
      try {
        await sendReminderEmail(session, "coach", "24h");
        await sendReminderEmail(session, "learner", "24h");
        results.sent24h++;
      } catch (error) {
        console.error(`Error sending 24h reminder for session ${session.sessionId}:`, error);
        results.errors++;
      }
    }

    // Process 1-hour reminders
    const sessions1h = await getSessionsNeedingReminders("1h");
    for (const session of sessions1h) {
      try {
        await sendReminderEmail(session, "coach", "1h");
        await sendReminderEmail(session, "learner", "1h");
        results.sent1h++;
      } catch (error) {
        console.error(`Error sending 1h reminder for session ${session.sessionId}:`, error);
        results.errors++;
      }
    }

    console.log(`Reminders processed: ${results.sent24h} 24h, ${results.sent1h} 1h, ${results.errors} errors`);
  } catch (error) {
    console.error("Error processing reminders:", error);
  }

  return results;
}

/**
 * Schedule reminder processing (for use with node-cron or similar)
 * Example: Run every 10 minutes
 */
export function startReminderScheduler() {
  // This would typically use node-cron or similar
  // For now, we'll export the function to be called by an external scheduler
  console.log("Reminder scheduler ready. Call processReminders() periodically.");
}
