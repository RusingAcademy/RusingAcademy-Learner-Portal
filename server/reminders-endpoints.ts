/**
 * Application reminders and SLA tracking endpoints
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { sendEmail } from "./email";

/**
 * Create reminder for a new application
 */
export async function createApplicationReminder(applicationId: number, slaHours: number = 168) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationReminders, coachApplications } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Verify application exists
  const [app] = await db
    .select()
    .from(coachApplications)
    .where(eq(coachApplications.id, applicationId));

  if (!app) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
  }

  const now = new Date();
  const dueAt = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

  const [reminder] = await db
    .insert(applicationReminders)
    .values({
      applicationId,
      slaHours,
      submittedAt: app.createdAt,
      dueAt,
    })
    .$returningId();

  return reminder;
}

/**
 * Get overdue applications
 */
export async function getOverdueApplications() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationReminders, coachApplications, users } = await import("../drizzle/schema");
  const { eq, and, lt, isNull } = await import("drizzle-orm");

  const now = new Date();

  const overdueApps = await db
    .select({
      reminderId: applicationReminders.id,
      applicationId: applicationReminders.applicationId,
      applicantName: coachApplications.fullName,
      applicantEmail: coachApplications.email,
      submittedAt: applicationReminders.submittedAt,
      dueAt: applicationReminders.dueAt,
      hoursOverdue: applicationReminders.slaHours,
      reminderCount: applicationReminders.reminderCount,
    })
    .from(applicationReminders)
    .innerJoin(coachApplications, eq(applicationReminders.applicationId, coachApplications.id))
    .where(
      and(
        lt(applicationReminders.dueAt, now),
        isNull(applicationReminders.completedAt),
        eq(coachApplications.status, "submitted")
      )
    );

  return overdueApps;
}

/**
 * Send reminder email to admins for overdue applications
 */
export async function sendOverdueReminder(
  adminEmail: string,
  applicationId: number,
  applicantName: string,
  hoursOverdue: number,
  language: "en" | "fr" = "en"
) {
  const isEn = language === "en";

  const subject = isEn
    ? `Application Review Overdue: ${applicantName}`
    : `Examen de candidature en retard : ${applicantName}`;

  const html = isEn
    ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin: 16px 0; }
    .alert-text { color: #991b1b; }
    .cta-button { display: inline-block; background: #ef4444; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Application Review Overdue</h1>
    </div>
    <div class="content">
      <p>An application review is overdue and requires your attention.</p>
      
      <div class="alert-box">
        <div class="alert-text">
          <strong>Applicant:</strong> ${applicantName}<br>
          <strong>Overdue by:</strong> ${Math.round(hoursOverdue / 24)} days<br>
          <strong>Application ID:</strong> ${applicationId}
        </div>
      </div>
      
      <p>Please review this application as soon as possible to maintain our SLA commitments.</p>
      
      <a href="#" class="cta-button">Review Application</a>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">© 2026 Lingueefy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
    : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin: 16px 0; }
    .alert-text { color: #991b1b; }
    .cta-button { display: inline-block; background: #ef4444; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Examen de candidature en retard</h1>
    </div>
    <div class="content">
      <p>Un examen de candidature est en retard et nécessite votre attention.</p>
      
      <div class="alert-box">
        <div class="alert-text">
          <strong>Candidat :</strong> ${applicantName}<br>
          <strong>En retard de :</strong> ${Math.round(hoursOverdue / 24)} jours<br>
          <strong>ID de candidature :</strong> ${applicationId}
        </div>
      </div>
      
      <p>Veuillez examiner cette candidature dès que possible pour maintenir nos engagements en matière de SLA.</p>
      
      <a href="#" class="cta-button">Examiner la candidature</a>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">© 2026 Lingueefy. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `;

  try {
    await sendEmail({
      to: adminEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send overdue reminder:", error);
    throw error;
  }
}

/**
 * Update reminder status when application is completed
 */
export async function completeApplicationReminder(applicationId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationReminders } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  await db
    .update(applicationReminders)
    .set({
      completedAt: new Date(),
      isOverdue: false,
    })
    .where(eq(applicationReminders.applicationId, applicationId));

  return { success: true };
}

/**
 * Get SLA statistics
 */
export async function getSLAStatistics() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationReminders, coachApplications } = await import("../drizzle/schema");
  const { eq, and, lt, isNull, gte } = await import("drizzle-orm");

  const now = new Date();

  // Get all reminders
  const allReminders = await db.select().from(applicationReminders);

  // Overdue count
  const overdueCount = allReminders.filter(
    (r) => r.dueAt < now && !r.completedAt && r.isOverdue
  ).length;

  // Due soon (next 24 hours)
  const dueSoonTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dueSoonCount = allReminders.filter(
    (r) => r.dueAt <= dueSoonTime && r.dueAt > now && !r.completedAt
  ).length;

  // On track
  const onTrackCount = allReminders.filter(
    (r) => r.dueAt > dueSoonTime && !r.completedAt
  ).length;

  // Completed
  const completedCount = allReminders.filter((r) => r.completedAt).length;

  // Average review time
  const completedReminders = allReminders.filter((r) => r.completedAt);
  const avgReviewTime =
    completedReminders.length > 0
      ? Math.round(
          completedReminders.reduce((sum, r) => {
            const reviewTime = new Date(r.completedAt!).getTime() - new Date(r.submittedAt).getTime();
            return sum + reviewTime / (1000 * 60 * 60); // Convert to hours
          }, 0) / completedReminders.length
        )
      : 0;

  return {
    total: allReminders.length,
    overdue: overdueCount,
    dueSoon: dueSoonCount,
    onTrack: onTrackCount,
    completed: completedCount,
    averageReviewHours: avgReviewTime,
    slaComplianceRate: allReminders.length > 0 ? Math.round(((allReminders.length - overdueCount) / allReminders.length) * 100) : 100,
  };
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(reminderId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationReminders } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const [reminder] = await db
    .select()
    .from(applicationReminders)
    .where(eq(applicationReminders.id, reminderId));

  if (!reminder) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Reminder not found" });
  }

  await db
    .update(applicationReminders)
    .set({
      reminderSentAt: reminder.reminderSentAt || new Date(),
      reminderCount: (reminder.reminderCount || 0) + 1,
      lastReminderAt: new Date(),
    })
    .where(eq(applicationReminders.id, reminderId));

  return { success: true };
}
