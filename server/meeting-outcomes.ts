/**
 * Meeting Outcome Tracking
 * 
 * Post-meeting forms to capture outcomes and automatically update lead scores
 */

import { getDb } from "./db";
import { 
  crmMeetings, 
  ecosystemLeads, 
  ecosystemLeadActivities,
  users 
} from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendEmail } from "./email";

// Types
export interface MeetingOutcome {
  meetingId: number;
  outcome: "qualified" | "not_qualified" | "needs_follow_up" | "converted" | "no_show";
  qualificationScore?: number; // 1-10
  nextSteps?: string;
  dealValue?: number;
  dealProbability?: number; // 0-100
  notes?: string;
  followUpDate?: Date;
  followUpType?: "call" | "email" | "meeting";
}

export interface OutcomeStats {
  totalMeetings: number;
  completedMeetings: number;
  qualifiedLeads: number;
  notQualifiedLeads: number;
  needsFollowUp: number;
  converted: number;
  noShows: number;
  averageQualificationScore: number;
  totalDealValue: number;
  averageDealProbability: number;
  conversionRate: number;
}

// Lead score adjustments based on meeting outcomes
const SCORE_ADJUSTMENTS: Record<string, number> = {
  qualified: 20,
  not_qualified: -15,
  needs_follow_up: 5,
  converted: 30,
  no_show: -25,
};

/**
 * Record meeting outcome and update lead score
 */
export async function recordMeetingOutcome(
  outcome: MeetingOutcome,
  recordedBy: number
): Promise<{ success: boolean; newLeadScore?: number; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Get meeting details
  const [meeting] = await db
    .select({
      meeting: crmMeetings,
      lead: ecosystemLeads,
    })
    .from(crmMeetings)
    .innerJoin(ecosystemLeads, eq(crmMeetings.leadId, ecosystemLeads.id))
    .where(eq(crmMeetings.id, outcome.meetingId))
    .limit(1);
  
  if (!meeting) {
    return { success: false, error: "Meeting not found" };
  }
  
  // Update meeting with outcome
  const outcomeNotes = [
    `Outcome: ${outcome.outcome}`,
    outcome.qualificationScore ? `Qualification Score: ${outcome.qualificationScore}/10` : null,
    outcome.dealValue ? `Deal Value: $${outcome.dealValue.toLocaleString()}` : null,
    outcome.dealProbability ? `Deal Probability: ${outcome.dealProbability}%` : null,
    outcome.nextSteps ? `Next Steps: ${outcome.nextSteps}` : null,
    outcome.notes ? `Notes: ${outcome.notes}` : null,
    outcome.followUpDate ? `Follow-up: ${outcome.followUpDate.toLocaleDateString()} (${outcome.followUpType})` : null,
  ].filter(Boolean).join("\n");
  
  await db
    .update(crmMeetings)
    .set({
      status: outcome.outcome === "no_show" ? "no_show" : "completed",
      outcome: outcomeNotes,
    })
    .where(eq(crmMeetings.id, outcome.meetingId));
  
  // Calculate new lead score
  const currentScore = meeting.lead.leadScore || 50;
  const scoreAdjustment = SCORE_ADJUSTMENTS[outcome.outcome] || 0;
  
  // Add qualification score bonus (if provided)
  const qualificationBonus = outcome.qualificationScore 
    ? Math.round((outcome.qualificationScore - 5) * 2) // -8 to +10 based on 1-10 score
    : 0;
  
  // Add deal value bonus
  const dealValueBonus = outcome.dealValue 
    ? Math.min(Math.round(outcome.dealValue / 5000), 10) // Up to +10 for large deals
    : 0;
  
  const newScore = Math.max(0, Math.min(100, currentScore + scoreAdjustment + qualificationBonus + dealValueBonus));
  
  // Update lead status and score
  let newStatus = meeting.lead.status;
  if (outcome.outcome === "qualified") {
    newStatus = "qualified";
  } else if (outcome.outcome === "converted") {
    newStatus = "won";
  } else if (outcome.outcome === "not_qualified") {
    newStatus = "lost";
  } else if (outcome.outcome === "needs_follow_up") {
    newStatus = "nurturing";
  }
  
  await db
    .update(ecosystemLeads)
    .set({
      leadScore: newScore,
      status: newStatus,
      convertedAt: outcome.outcome === "converted" ? new Date() : meeting.lead.convertedAt,
    })
    .where(eq(ecosystemLeads.id, meeting.lead.id));
  
  // Log activity
  await db.insert(ecosystemLeadActivities).values({
    leadId: meeting.lead.id,
    activityType: "status_changed",
    description: `Meeting outcome recorded: ${outcome.outcome}. Lead score updated from ${currentScore} to ${newScore}.`,
    previousValue: String(currentScore),
    newValue: String(newScore),
    performedBy: recordedBy,
  });
  
  return { success: true, newLeadScore: newScore };
}

/**
 * Get meeting outcome statistics
 */
export async function getOutcomeStats(
  organizerId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<OutcomeStats> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const conditions = [];
  
  if (organizerId) {
    conditions.push(eq(crmMeetings.organizerId, organizerId));
  }
  
  if (startDate) {
    conditions.push(sql`${crmMeetings.meetingDate} >= ${startDate}`);
  }
  
  if (endDate) {
    conditions.push(sql`${crmMeetings.meetingDate} <= ${endDate}`);
  }
  
  // Get all meetings matching criteria
  const meetings = await db
    .select()
    .from(crmMeetings)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  
  const totalMeetings = meetings.length;
  const completedMeetings = meetings.filter(m => m.status === "completed").length;
  const noShows = meetings.filter(m => m.status === "no_show").length;
  
  // Parse outcomes from notes
  let qualifiedLeads = 0;
  let notQualifiedLeads = 0;
  let needsFollowUp = 0;
  let converted = 0;
  let totalQualificationScore = 0;
  let qualificationScoreCount = 0;
  let totalDealValue = 0;
  let totalDealProbability = 0;
  let dealProbabilityCount = 0;
  
  for (const meeting of meetings) {
    if (meeting.outcome) {
      const outcome = meeting.outcome.toLowerCase();
      
      if (outcome.includes("outcome: qualified")) qualifiedLeads++;
      else if (outcome.includes("outcome: not_qualified")) notQualifiedLeads++;
      else if (outcome.includes("outcome: needs_follow_up")) needsFollowUp++;
      else if (outcome.includes("outcome: converted")) converted++;
      
      // Extract qualification score
      const scoreMatch = outcome.match(/qualification score: (\d+)\/10/);
      if (scoreMatch) {
        totalQualificationScore += parseInt(scoreMatch[1]);
        qualificationScoreCount++;
      }
      
      // Extract deal value
      const valueMatch = outcome.match(/deal value: \$([0-9,]+)/);
      if (valueMatch) {
        totalDealValue += parseInt(valueMatch[1].replace(/,/g, ""));
      }
      
      // Extract deal probability
      const probMatch = outcome.match(/deal probability: (\d+)%/);
      if (probMatch) {
        totalDealProbability += parseInt(probMatch[1]);
        dealProbabilityCount++;
      }
    }
  }
  
  return {
    totalMeetings,
    completedMeetings,
    qualifiedLeads,
    notQualifiedLeads,
    needsFollowUp,
    converted,
    noShows,
    averageQualificationScore: qualificationScoreCount > 0 
      ? Math.round((totalQualificationScore / qualificationScoreCount) * 10) / 10 
      : 0,
    totalDealValue,
    averageDealProbability: dealProbabilityCount > 0 
      ? Math.round(totalDealProbability / dealProbabilityCount) 
      : 0,
    conversionRate: completedMeetings > 0 
      ? Math.round((converted / completedMeetings) * 1000) / 10 
      : 0,
  };
}

/**
 * Get meetings pending outcome recording
 */
export async function getPendingOutcomeMeetings(organizerId?: number): Promise<Array<{
  id: number;
  title: string;
  leadName: string;
  leadEmail: string;
  meetingDate: Date;
  durationMinutes: number;
}>> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const now = new Date();
  const conditions = [
    eq(crmMeetings.status, "scheduled"),
    sql`${crmMeetings.meetingDate} < ${now}`,
  ];
  
  if (organizerId) {
    conditions.push(eq(crmMeetings.organizerId, organizerId));
  }
  
  const meetings = await db
    .select({
      id: crmMeetings.id,
      title: crmMeetings.title,
      meetingDate: crmMeetings.meetingDate,
      durationMinutes: crmMeetings.durationMinutes,
      leadFirstName: ecosystemLeads.firstName,
      leadLastName: ecosystemLeads.lastName,
      leadEmail: ecosystemLeads.email,
    })
    .from(crmMeetings)
    .innerJoin(ecosystemLeads, eq(crmMeetings.leadId, ecosystemLeads.id))
    .where(and(...conditions));
  
  return meetings.map(m => ({
    id: m.id,
    title: m.title,
    leadName: `${m.leadFirstName} ${m.leadLastName}`,
    leadEmail: m.leadEmail,
    meetingDate: m.meetingDate,
    durationMinutes: m.durationMinutes,
  }));
}

/**
 * Send outcome reminder email to organizer
 */
export async function sendOutcomeReminderEmail(
  meetingId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const [meeting] = await db
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
  
  if (!meeting || !meeting.organizer.email) return;
  
  const meetingDate = new Date(meeting.meeting.meetingDate);
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
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #f97316; margin: 0;">📋 Meeting Outcome Needed</h1>
  </div>
  
  <p>Hi ${meeting.organizer.name || "there"},</p>
  
  <p>Your meeting with <strong>${meeting.lead.firstName} ${meeting.lead.lastName}</strong> has ended. Please record the outcome to update the lead's status and score.</p>
  
  <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #334155;">${meeting.meeting.title}</h2>
    <p><strong>📅 Date:</strong> ${formattedDate}</p>
    <p><strong>👤 Lead:</strong> ${meeting.lead.firstName} ${meeting.lead.lastName}</p>
    <p><strong>📧 Email:</strong> ${meeting.lead.email}</p>
    <p><strong>🏢 Company:</strong> ${meeting.lead.company || "N/A"}</p>
    <p><strong>📊 Current Score:</strong> ${meeting.lead.leadScore || 50}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://www.rusingacademy.ca/admin/crm?meeting=${meetingId}" 
       style="display: inline-block; background: #009688; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Record Meeting Outcome
    </a>
  </div>
  
  <p style="color: #64748b; font-size: 14px;">
    Recording outcomes helps improve lead scoring accuracy and ensures proper follow-up actions are taken.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
  <p style="font-size: 12px; color: #64748b; text-align: center;">
    © 2026 Rusinga International Consulting Ltd.
  </p>
</body>
</html>
  `;
  
  await sendEmail({
    to: meeting.organizer.email,
    subject: `📋 Record outcome: ${meeting.meeting.title}`,
    html,
  });
}

/**
 * Bulk send outcome reminders for past meetings
 */
export async function sendPendingOutcomeReminders(): Promise<number> {
  const pendingMeetings = await getPendingOutcomeMeetings();
  let sentCount = 0;
  
  for (const meeting of pendingMeetings) {
    try {
      await sendOutcomeReminderEmail(meeting.id);
      sentCount++;
    } catch (error) {
      console.error(`Failed to send reminder for meeting ${meeting.id}:`, error);
    }
  }
  
  return sentCount;
}

/**
 * Get follow-up tasks from meeting outcomes
 */
export async function getFollowUpTasks(
  organizerId?: number,
  daysAhead: number = 7
): Promise<Array<{
  meetingId: number;
  leadId: number;
  leadName: string;
  leadEmail: string;
  followUpDate: Date;
  followUpType: string;
  nextSteps: string;
}>> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  const conditions = [
    eq(crmMeetings.status, "completed"),
    sql`${crmMeetings.outcome} LIKE '%Follow-up:%'`,
  ];
  
  if (organizerId) {
    conditions.push(eq(crmMeetings.organizerId, organizerId));
  }
  
  const meetings = await db
    .select({
      meetingId: crmMeetings.id,
      outcome: crmMeetings.outcome,
      leadId: ecosystemLeads.id,
      leadFirstName: ecosystemLeads.firstName,
      leadLastName: ecosystemLeads.lastName,
      leadEmail: ecosystemLeads.email,
    })
    .from(crmMeetings)
    .innerJoin(ecosystemLeads, eq(crmMeetings.leadId, ecosystemLeads.id))
    .where(and(...conditions));
  
  const tasks: Array<{
    meetingId: number;
    leadId: number;
    leadName: string;
    leadEmail: string;
    followUpDate: Date;
    followUpType: string;
    nextSteps: string;
  }> = [];
  
  for (const meeting of meetings) {
    if (!meeting.outcome) continue;
    
    // Parse follow-up info from outcome
    const followUpMatch = meeting.outcome.match(/Follow-up: ([^\n]+)/);
    const nextStepsMatch = meeting.outcome.match(/Next Steps: ([^\n]+)/);
    
    if (followUpMatch) {
      const [dateStr, typeStr] = followUpMatch[1].split(" (");
      const followUpDate = new Date(dateStr);
      
      // Only include if within the date range
      if (followUpDate >= now && followUpDate <= futureDate) {
        tasks.push({
          meetingId: meeting.meetingId,
          leadId: meeting.leadId,
          leadName: `${meeting.leadFirstName} ${meeting.leadLastName}`,
          leadEmail: meeting.leadEmail,
          followUpDate,
          followUpType: typeStr?.replace(")", "") || "email",
          nextSteps: nextStepsMatch?.[1] || "",
        });
      }
    }
  }
  
  // Sort by follow-up date
  tasks.sort((a, b) => a.followUpDate.getTime() - b.followUpDate.getTime());
  
  return tasks;
}
