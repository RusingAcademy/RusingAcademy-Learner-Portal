/**
 * CRM Activity Report Service
 * 
 * Generates weekly/monthly reports on CRM activity including:
 * - New leads and conversions
 * - Pipeline movements
 * - Email engagement metrics
 * - Meeting statistics
 */

import { getDb } from "./db";
import {
  ecosystemLeads,
  ecosystemLeadActivities,
  sequenceEmailLogs,
  crmMeetings,
  crmActivityReports,
} from "../drizzle/schema";
import { eq, gte, lte, and, sql, count } from "drizzle-orm";
import { sendEmail } from "./email";

export interface CrmActivityReportData {
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
  totalDealValue: number;
  avgDealSize: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  meetingsScheduled: number;
  meetingsCompleted: number;
  pipelineMovements: { from: string; to: string; count: number }[];
}

export interface ReportPeriod {
  start: Date;
  end: Date;
  type: "weekly" | "monthly" | "quarterly";
}

/**
 * Generate CRM activity report for a given period
 */
export async function generateActivityReport(period: ReportPeriod): Promise<CrmActivityReportData> {
  const db = await getDb();
  if (!db) {
    return getEmptyReport();
  }

  // Get new leads in period
  const newLeadsResult = await db
    .select({ count: count() })
    .from(ecosystemLeads)
    .where(
      and(
        gte(ecosystemLeads.createdAt, period.start),
        lte(ecosystemLeads.createdAt, period.end)
      )
    );
  const newLeads = newLeadsResult[0]?.count || 0;

  // Get converted leads in period
  const convertedLeadsResult = await db
    .select({ count: count() })
    .from(ecosystemLeads)
    .where(
      and(
        sql`${ecosystemLeads.status} = 'won'`,
        gte(ecosystemLeads.convertedAt, period.start),
        lte(ecosystemLeads.convertedAt, period.end)
      )
    );
  const convertedLeads = convertedLeadsResult[0]?.count || 0;

  // Get lost leads in period
  const lostLeadsResult = await db
    .select({ count: count() })
    .from(ecosystemLeads)
    .where(
      and(
        sql`${ecosystemLeads.status} = 'lost'`,
        gte(ecosystemLeads.updatedAt, period.start),
        lte(ecosystemLeads.updatedAt, period.end)
      )
    );
  const lostLeads = lostLeadsResult[0]?.count || 0;

  // Get deal values for converted leads (using budget field as proxy)
  const dealValuesResult = await db
    .select({ budget: ecosystemLeads.budget })
    .from(ecosystemLeads)
    .where(
      and(
        sql`${ecosystemLeads.status} = 'won'`,
        gte(ecosystemLeads.convertedAt, period.start),
        lte(ecosystemLeads.convertedAt, period.end)
      )
    );
  
  // Parse budget strings to numbers (e.g., "$5000" -> 5000)
  const totalDealValue = dealValuesResult.reduce((sum, r) => {
    if (!r.budget) return sum;
    const numericValue = parseInt(r.budget.replace(/[^0-9]/g, ""), 10);
    return sum + (isNaN(numericValue) ? 0 : numericValue);
  }, 0);
  const avgDealSize = convertedLeads > 0 ? totalDealValue / convertedLeads : 0;

  // Get email metrics
  const emailsSentResult = await db
    .select({ count: count() })
    .from(sequenceEmailLogs)
    .where(
      and(
        gte(sequenceEmailLogs.sentAt, period.start),
        lte(sequenceEmailLogs.sentAt, period.end)
      )
    );
  const emailsSent = emailsSentResult[0]?.count || 0;

  const emailsOpenedResult = await db
    .select({ count: count() })
    .from(sequenceEmailLogs)
    .where(
      and(
        eq(sequenceEmailLogs.opened, true),
        gte(sequenceEmailLogs.openedAt, period.start),
        lte(sequenceEmailLogs.openedAt, period.end)
      )
    );
  const emailsOpened = emailsOpenedResult[0]?.count || 0;

  const emailsClickedResult = await db
    .select({ count: count() })
    .from(sequenceEmailLogs)
    .where(
      and(
        eq(sequenceEmailLogs.clicked, true),
        gte(sequenceEmailLogs.clickedAt, period.start),
        lte(sequenceEmailLogs.clickedAt, period.end)
      )
    );
  const emailsClicked = emailsClickedResult[0]?.count || 0;

  // Get meeting metrics
  const meetingsScheduledResult = await db
    .select({ count: count() })
    .from(crmMeetings)
    .where(
      and(
        gte(crmMeetings.createdAt, period.start),
        lte(crmMeetings.createdAt, period.end)
      )
    );
  const meetingsScheduled = meetingsScheduledResult[0]?.count || 0;

  const meetingsCompletedResult = await db
    .select({ count: count() })
    .from(crmMeetings)
    .where(
      and(
        eq(crmMeetings.status, "completed"),
        gte(crmMeetings.meetingDate, period.start),
        lte(crmMeetings.meetingDate, period.end)
      )
    );
  const meetingsCompleted = meetingsCompletedResult[0]?.count || 0;

  // Get pipeline movements
  const pipelineMovements = await getPipelineMovements(period);

  return {
    newLeads,
    convertedLeads,
    lostLeads,
    totalDealValue,
    avgDealSize,
    emailsSent,
    emailsOpened,
    emailsClicked,
    meetingsScheduled,
    meetingsCompleted,
    pipelineMovements,
  };
}

/**
 * Get pipeline movements for a period
 */
async function getPipelineMovements(period: ReportPeriod): Promise<{ from: string; to: string; count: number }[]> {
  const db = await getDb();
  if (!db) return [];

  // Get status change activities
  const activities = await db
    .select()
    .from(ecosystemLeadActivities)
    .where(
      and(
        eq(ecosystemLeadActivities.activityType, "status_changed"),
        gte(ecosystemLeadActivities.createdAt, period.start),
        lte(ecosystemLeadActivities.createdAt, period.end)
      )
    );

  // Aggregate movements
  const movementCounts: Record<string, number> = {};
  
  for (const activity of activities) {
    try {
      const metadata = typeof activity.metadata === "string" 
        ? JSON.parse(activity.metadata) 
        : activity.metadata;
      
      if (metadata?.newStatus) {
        const key = `unknown->${metadata.newStatus}`;
        movementCounts[key] = (movementCounts[key] || 0) + 1;
      }
    } catch {
      // Skip invalid metadata
    }
  }

  return Object.entries(movementCounts).map(([key, count]) => {
    const [from, to] = key.split("->");
    return { from, to, count };
  });
}

/**
 * Save report to database
 */
export async function saveActivityReport(
  period: ReportPeriod,
  data: CrmActivityReportData
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(crmActivityReports).values({
    reportType: period.type,
    periodStart: period.start,
    periodEnd: period.end,
    data,
  });

  return result[0].insertId;
}

/**
 * Get weekly report period (last 7 days)
 */
export function getWeeklyPeriod(): ReportPeriod {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  return { start, end, type: "weekly" };
}

/**
 * Get monthly report period
 */
export function getMonthlyPeriod(): ReportPeriod {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);
  start.setHours(0, 0, 0, 0);

  return { start, end, type: "monthly" };
}

/**
 * Generate and send weekly CRM report email
 */
export async function sendWeeklyCrmReport(recipientEmail: string): Promise<boolean> {
  const period = getWeeklyPeriod();
  const data = await generateActivityReport(period);
  
  // Save to database
  await saveActivityReport(period, data);

  // Format email
  const openRate = data.emailsSent > 0 ? ((data.emailsOpened / data.emailsSent) * 100).toFixed(1) : "0";
  const clickRate = data.emailsOpened > 0 ? ((data.emailsClicked / data.emailsOpened) * 100).toFixed(1) : "0";
  const conversionRate = data.newLeads > 0 ? ((data.convertedLeads / data.newLeads) * 100).toFixed(1) : "0";

  const emailBody = `
    <h2>Weekly CRM Activity Report</h2>
    <p>Period: ${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()}</p>
    
    <h3>📊 Lead Summary</h3>
    <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">New Leads</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${data.newLeads}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Converted</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: green;">${data.convertedLeads}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Lost</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: red;">${data.lostLeads}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Conversion Rate</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${conversionRate}%</td>
      </tr>
    </table>
    
    <h3>💰 Revenue</h3>
    <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Total Deal Value</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">$${data.totalDealValue.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Average Deal Size</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">$${data.avgDealSize.toLocaleString()}</td>
      </tr>
    </table>
    
    <h3>📧 Email Engagement</h3>
    <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Emails Sent</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${data.emailsSent}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Open Rate</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${openRate}%</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Click Rate</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${clickRate}%</td>
      </tr>
    </table>
    
    <h3>📅 Meetings</h3>
    <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Scheduled</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${data.meetingsScheduled}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Completed</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${data.meetingsCompleted}</td>
      </tr>
    </table>
    
    <p style="margin-top: 20px; color: #666; font-size: 12px;">
      This report was automatically generated by Lingueefy CRM.
    </p>
  `;

  try {
    await sendEmail({
      to: recipientEmail,
      subject: `Weekly CRM Report - ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}`,
      html: emailBody,
    });
    return true;
  } catch (error) {
    console.error("[CRM Report] Failed to send email:", error);
    return false;
  }
}

/**
 * Get empty report structure
 */
function getEmptyReport(): CrmActivityReportData {
  return {
    newLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    totalDealValue: 0,
    avgDealSize: 0,
    emailsSent: 0,
    emailsOpened: 0,
    emailsClicked: 0,
    meetingsScheduled: 0,
    meetingsCompleted: 0,
    pipelineMovements: [],
  };
}
