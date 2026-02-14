/**
 * Outcome Reminder Cron Job
 * 
 * Sends automated reminders for meetings that need outcome recording
 */

import { getDb } from "../db";
import { crmMeetings, ecosystemLeads, users } from "../../drizzle/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import { sendEmail } from "../email";

// Types
interface PendingMeeting {
  id: number;
  title: string;
  meetingDate: Date;
  durationMinutes: number;
  leadFirstName: string;
  leadLastName: string;
  leadEmail: string;
  leadCompany: string | null;
  organizerName: string | null;
  organizerEmail: string | null;
}

/**
 * Get all meetings that ended but have no outcome recorded
 */
async function getPendingOutcomeMeetings(): Promise<PendingMeeting[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  
  // Get meetings that:
  // 1. Are still in "scheduled" status (not completed or cancelled)
  // 2. Meeting date + duration has passed (meeting has ended)
  // 3. No outcome recorded yet
  const meetings = await db
    .select({
      id: crmMeetings.id,
      title: crmMeetings.title,
      meetingDate: crmMeetings.meetingDate,
      durationMinutes: crmMeetings.durationMinutes,
      leadFirstName: ecosystemLeads.firstName,
      leadLastName: ecosystemLeads.lastName,
      leadEmail: ecosystemLeads.email,
      leadCompany: ecosystemLeads.company,
      organizerName: users.name,
      organizerEmail: users.email,
    })
    .from(crmMeetings)
    .innerJoin(ecosystemLeads, eq(crmMeetings.leadId, ecosystemLeads.id))
    .innerJoin(users, eq(crmMeetings.organizerId, users.id))
    .where(
      and(
        eq(crmMeetings.status, "scheduled"),
        lt(crmMeetings.meetingDate, now)
      )
    );
  
  return meetings;
}

/**
 * Send outcome reminder email to organizer
 */
async function sendOutcomeReminderEmail(meeting: PendingMeeting): Promise<boolean> {
  if (!meeting.organizerEmail) {
    console.log(`[Outcome Reminder] No email for organizer of meeting ${meeting.id}`);
    return false;
  }
  
  const meetingDate = new Date(meeting.meetingDate);
  const formattedDate = meetingDate.toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; color: #1e293b;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; padding: 12px; background: #fef3c7; border-radius: 50%;">
        <span style="font-size: 32px;">📋</span>
      </div>
      <h1 style="color: #f97316; margin: 16px 0 8px 0; font-size: 24px;">Meeting Outcome Needed</h1>
      <p style="color: #64748b; margin: 0;">Please record the outcome of your recent meeting</p>
    </div>
    
    <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 12px 0; color: #334155; font-size: 18px;">${meeting.title}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 100px;">📅 Date:</td>
          <td style="padding: 8px 0; color: #1e293b;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">👤 Lead:</td>
          <td style="padding: 8px 0; color: #1e293b;">${meeting.leadFirstName} ${meeting.leadLastName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">📧 Email:</td>
          <td style="padding: 8px 0; color: #1e293b;">${meeting.leadEmail}</td>
        </tr>
        ${meeting.leadCompany ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;">🏢 Company:</td>
          <td style="padding: 8px 0; color: #1e293b;">${meeting.leadCompany}</td>
        </tr>
        ` : ""}
      </table>
    </div>
    
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${process.env.VITE_APP_URL || "https://www.rusingacademy.ca"}/admin?tab=crm&meeting=${meeting.id}" 
         style="display: inline-block; background: linear-gradient(135deg, #009688 0%, #00796b 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Record Meeting Outcome
      </a>
    </div>
    
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <p style="margin: 0; color: #065f46; font-size: 14px;">
        <strong>Why record outcomes?</strong><br>
        Recording meeting outcomes helps:
      </p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #065f46; font-size: 14px;">
        <li>Update lead scores automatically</li>
        <li>Track conversion rates</li>
        <li>Schedule follow-up actions</li>
        <li>Improve sales forecasting</li>
      </ul>
    </div>
    
    <div style="text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
      <p style="margin: 0;">This is an automated reminder from your CRM system.</p>
      <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} Rusinga International Consulting Ltd.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  try {
    await sendEmail({
      to: meeting.organizerEmail,
      subject: `📋 Record outcome: ${meeting.title} with ${meeting.leadFirstName} ${meeting.leadLastName}`,
      html,
    });
    
    console.log(`[Outcome Reminder] Sent reminder for meeting ${meeting.id} to ${meeting.organizerEmail}`);
    return true;
  } catch (error) {
    console.error(`[Outcome Reminder] Failed to send reminder for meeting ${meeting.id}:`, error);
    return false;
  }
}

/**
 * Execute the outcome reminder cron job
 */
export async function executeOutcomeRemindersCron(): Promise<{
  processed: number;
  sent: number;
  failed: number;
  meetings: Array<{ id: number; title: string; sent: boolean }>;
}> {
  console.log("[Outcome Reminder Cron] Starting execution...");
  
  const pendingMeetings = await getPendingOutcomeMeetings();
  console.log(`[Outcome Reminder Cron] Found ${pendingMeetings.length} meetings pending outcome`);
  
  let sent = 0;
  let failed = 0;
  const results: Array<{ id: number; title: string; sent: boolean }> = [];
  
  for (const meeting of pendingMeetings) {
    const success = await sendOutcomeReminderEmail(meeting);
    
    if (success) {
      sent++;
    } else {
      failed++;
    }
    
    results.push({
      id: meeting.id,
      title: meeting.title,
      sent: success,
    });
  }
  
  console.log(`[Outcome Reminder Cron] Completed: ${sent} sent, ${failed} failed`);
  
  return {
    processed: pendingMeetings.length,
    sent,
    failed,
    meetings: results,
  };
}

/**
 * Get summary of pending outcomes for dashboard
 */
export async function getOutcomeReminderSummary(): Promise<{
  pendingCount: number;
  oldestPending: Date | null;
  byOrganizer: Array<{ name: string; email: string; count: number }>;
}> {
  const db = await getDb();
  if (!db) return { pendingCount: 0, oldestPending: null, byOrganizer: [] };
  
  const pendingMeetings = await getPendingOutcomeMeetings();
  
  // Group by organizer
  const organizerMap = new Map<string, { name: string; email: string; count: number }>();
  let oldestDate: Date | null = null;
  
  for (const meeting of pendingMeetings) {
    const key = meeting.organizerEmail || "unknown";
    const existing = organizerMap.get(key);
    
    if (existing) {
      existing.count++;
    } else {
      organizerMap.set(key, {
        name: meeting.organizerName || "Unknown",
        email: meeting.organizerEmail || "",
        count: 1,
      });
    }
    
    const meetingDate = new Date(meeting.meetingDate);
    if (!oldestDate || meetingDate < oldestDate) {
      oldestDate = meetingDate;
    }
  }
  
  return {
    pendingCount: pendingMeetings.length,
    oldestPending: oldestDate,
    byOrganizer: Array.from(organizerMap.values()).sort((a, b) => b.count - a.count),
  };
}
