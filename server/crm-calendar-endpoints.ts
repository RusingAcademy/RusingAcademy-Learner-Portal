/**
 * CRM Calendar Integration
 * 
 * Meeting scheduling, calendar invites, and confirmation emails
 */

import { getDb } from "./db";
import { crmMeetings, ecosystemLeads, users } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { sendEmail } from "./email";

// Types
interface MeetingInput {
  leadId: number;
  organizerId: number;
  title: string;
  description?: string;
  meetingDate: Date;
  durationMinutes: number;
  meetingType: "video" | "phone" | "in_person";
  meetingLink?: string;
  notes?: string;
}

interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer: { name: string; email: string };
  attendee: { name: string; email: string };
}

/**
 * Create a new meeting
 */
export async function createMeeting(input: MeetingInput): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Create meeting record
  const [meeting] = await db.insert(crmMeetings).values({
    leadId: input.leadId,
    organizerId: input.organizerId,
    title: input.title,
    description: input.description,
    meetingDate: input.meetingDate,
    durationMinutes: input.durationMinutes,
    meetingType: input.meetingType,
    meetingLink: input.meetingLink,
    notes: input.notes,
    status: "scheduled",
  });
  
  const meetingId = meeting.insertId;
  
  // Get lead and organizer info for email
  const [lead] = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, input.leadId))
    .limit(1);
  
  const [organizer] = await db
    .select()
    .from(users)
    .where(eq(users.id, input.organizerId))
    .limit(1);
  
  if (lead && organizer) {
    // Send confirmation emails
    await sendMeetingConfirmation(
      {
        id: meetingId,
        ...input,
      },
      lead,
      organizer
    );
  }
  
  return meetingId;
}

/**
 * Update meeting status
 */
export async function updateMeetingStatus(
  meetingId: number,
  status: "scheduled" | "completed" | "cancelled" | "no_show",
  outcome?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  await db
    .update(crmMeetings)
    .set({
      status,
      outcome,
    })
    .where(eq(crmMeetings.id, meetingId));
}

/**
 * Get meetings for a lead
 */
export async function getLeadMeetings(leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  return db
    .select({
      meeting: crmMeetings,
      organizer: users,
    })
    .from(crmMeetings)
    .innerJoin(users, eq(crmMeetings.organizerId, users.id))
    .where(eq(crmMeetings.leadId, leadId))
    .orderBy(desc(crmMeetings.meetingDate));
}

/**
 * Get upcoming meetings for an organizer
 */
export async function getOrganizerMeetings(
  organizerId: number,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const conditions = [eq(crmMeetings.organizerId, organizerId)];
  
  if (startDate) {
    conditions.push(gte(crmMeetings.meetingDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(crmMeetings.meetingDate, endDate));
  }
  
  return db
    .select({
      meeting: crmMeetings,
      lead: ecosystemLeads,
    })
    .from(crmMeetings)
    .innerJoin(ecosystemLeads, eq(crmMeetings.leadId, ecosystemLeads.id))
    .where(and(...conditions))
    .orderBy(crmMeetings.meetingDate);
}

/**
 * Generate ICS calendar file content
 */
export function generateICSFile(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };
  
  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };
  
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rusinga International//CRM//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `ORGANIZER;CN=${escapeText(event.organizer.name)}:mailto:${event.organizer.email}`,
    `ATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${escapeText(event.attendee.name)}:mailto:${event.attendee.email}`,
  ];
  
  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }
  
  lines.push(
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  );
  
  return lines.join("\r\n");
}

/**
 * Send meeting confirmation email with calendar invite
 */
async function sendMeetingConfirmation(
  meeting: MeetingInput & { id: number },
  lead: typeof ecosystemLeads.$inferSelect,
  organizer: typeof users.$inferSelect
): Promise<void> {
  const language = lead.preferredLanguage || "en";
  const meetingDate = new Date(meeting.meetingDate);
  const endDate = new Date(meetingDate.getTime() + meeting.durationMinutes * 60 * 1000);
  
  // Generate ICS file
  const icsContent = generateICSFile({
    uid: `meeting-${meeting.id}@rusingacademy.ca`,
    title: meeting.title,
    description: meeting.description || "",
    startDate: meetingDate,
    endDate,
    location: meeting.meetingType === "video" ? meeting.meetingLink : undefined,
    organizer: {
      name: organizer.name || "Rusinga International",
      email: organizer.email || "contact@rusingacademy.ca",
    },
    attendee: {
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
    },
  });
  
  // Format date for display
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };
  const formattedDate = meetingDate.toLocaleDateString(
    language === "fr" ? "fr-CA" : "en-CA",
    dateOptions
  );
  
  // Meeting type labels
  const meetingTypeLabels = {
    video: { en: "Video Call", fr: "Appel vidéo" },
    phone: { en: "Phone Call", fr: "Appel téléphonique" },
    in_person: { en: "In-Person Meeting", fr: "Réunion en personne" },
  };
  
  const subject = language === "fr"
    ? `Confirmation de réunion: ${meeting.title}`
    : `Meeting Confirmation: ${meeting.title}`;
  
  const html = language === "fr" ? `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #009688; margin: 0;">Réunion confirmée!</h1>
  </div>
  
  <p>Bonjour ${lead.firstName},</p>
  
  <p>Votre réunion avec ${organizer.name || "notre équipe"} a été confirmée.</p>
  
  <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #334155;">${meeting.title}</h2>
    <p><strong>📅 Date:</strong> ${formattedDate}</p>
    <p><strong>⏱️ Durée:</strong> ${meeting.durationMinutes} minutes</p>
    <p><strong>📍 Type:</strong> ${meetingTypeLabels[meeting.meetingType].fr}</p>
    ${meeting.meetingLink ? `<p><strong>🔗 Lien:</strong> <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></p>` : ""}
    ${meeting.description ? `<p><strong>📝 Description:</strong> ${meeting.description}</p>` : ""}
  </div>
  
  <p>Un fichier de calendrier (.ics) est joint à cet e-mail. Cliquez dessus pour ajouter la réunion à votre calendrier.</p>
  
  <p>Si vous avez besoin de reporter ou d'annuler, veuillez nous contacter dès que possible.</p>
  
  <p>À bientôt!</p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
  <p style="font-size: 12px; color: #64748b; text-align: center;">
    © 2026 Rusinga International Consulting Ltd.
  </p>
</body>
</html>
  ` : `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #009688; margin: 0;">Meeting Confirmed!</h1>
  </div>
  
  <p>Hi ${lead.firstName},</p>
  
  <p>Your meeting with ${organizer.name || "our team"} has been confirmed.</p>
  
  <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #334155;">${meeting.title}</h2>
    <p><strong>📅 Date:</strong> ${formattedDate}</p>
    <p><strong>⏱️ Duration:</strong> ${meeting.durationMinutes} minutes</p>
    <p><strong>📍 Type:</strong> ${meetingTypeLabels[meeting.meetingType].en}</p>
    ${meeting.meetingLink ? `<p><strong>🔗 Link:</strong> <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></p>` : ""}
    ${meeting.description ? `<p><strong>📝 Description:</strong> ${meeting.description}</p>` : ""}
  </div>
  
  <p>A calendar file (.ics) is attached to this email. Click it to add the meeting to your calendar.</p>
  
  <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
  
  <p>See you soon!</p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
  <p style="font-size: 12px; color: #64748b; text-align: center;">
    © 2026 Rusinga International Consulting Ltd.
  </p>
</body>
</html>
  `;
  
  // Send email with ICS attachment
  await sendEmail({
    to: lead.email,
    subject,
    html,
    attachments: [
      {
        filename: "meeting.ics",
        content: icsContent,
        contentType: "text/calendar",
      },
    ],
  });
}

/**
 * Send meeting reminder
 */
export async function sendMeetingReminder(meetingId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const [result] = await db
    .select({
      meeting: crmMeetings,
      lead: ecosystemLeads,
      organizer: users,
    })
    .from(crmMeetings)
    .innerJoin(ecosystemLeads, eq(crmMeetings.leadId, ecosystemLeads.id))
    .innerJoin(users, eq(crmMeetings.organizerId, users.id))
    .where(eq(crmMeetings.id, meetingId))
    .limit(1);
  
  if (!result) return;
  
  const { meeting, lead, organizer } = result;
  const language = lead.preferredLanguage || "en";
  const meetingDate = new Date(meeting.meetingDate);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = meetingDate.toLocaleDateString(
    language === "fr" ? "fr-CA" : "en-CA",
    dateOptions
  );
  
  const subject = language === "fr"
    ? `Rappel: Réunion demain - ${meeting.title}`
    : `Reminder: Meeting Tomorrow - ${meeting.title}`;
  
  const html = language === "fr" ? `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <h1 style="color: #009688;">Rappel de réunion</h1>
  <p>Bonjour ${lead.firstName},</p>
  <p>Ceci est un rappel amical que vous avez une réunion prévue demain:</p>
  <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="margin-top: 0;">${meeting.title}</h2>
    <p><strong>📅</strong> ${formattedDate}</p>
    ${meeting.meetingLink ? `<p><a href="${meeting.meetingLink}" style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Rejoindre la réunion</a></p>` : ""}
  </div>
  <p>À demain!</p>
</body>
</html>
  ` : `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <h1 style="color: #009688;">Meeting Reminder</h1>
  <p>Hi ${lead.firstName},</p>
  <p>This is a friendly reminder that you have a meeting scheduled for tomorrow:</p>
  <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="margin-top: 0;">${meeting.title}</h2>
    <p><strong>📅</strong> ${formattedDate}</p>
    ${meeting.meetingLink ? `<p><a href="${meeting.meetingLink}" style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Join Meeting</a></p>` : ""}
  </div>
  <p>See you tomorrow!</p>
</body>
</html>
  `;
  
  await sendEmail({
    to: lead.email,
    subject,
    html,
  });
}

/**
 * Get meeting statistics
 */
export async function getMeetingStats(
  organizerId?: number,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const conditions = [];
  if (organizerId) {
    conditions.push(eq(crmMeetings.organizerId, organizerId));
  }
  if (startDate) {
    conditions.push(gte(crmMeetings.meetingDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(crmMeetings.meetingDate, endDate));
  }
  
  const meetings = await db
    .select()
    .from(crmMeetings)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  
  const total = meetings.length;
  const scheduled = meetings.filter(m => m.status === "scheduled").length;
  const completed = meetings.filter(m => m.status === "completed").length;
  const cancelled = meetings.filter(m => m.status === "cancelled").length;
  const noShow = meetings.filter(m => m.status === "no_show").length;
  
  return {
    total,
    scheduled,
    completed,
    cancelled,
    noShow,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0,
  };
}
