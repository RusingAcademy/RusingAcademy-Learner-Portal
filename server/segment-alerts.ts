import { getDb } from "./db";
import { crmLeadSegments, crmSegmentAlerts, crmSegmentAlertLogs, ecosystemLeads } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendEmail } from "./email";

interface FilterCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
  value: string | number | string[];
}

interface Segment {
  id: number;
  name: string;
  filters: FilterCondition[];
  filterLogic: "and" | "or";
}

// Check if a lead matches segment filters
function matchesFilter(lead: Record<string, any>, filter: FilterCondition): boolean {
  const leadValue = lead[filter.field];
  const filterValue = filter.value;

  switch (filter.operator) {
    case "equals":
      return String(leadValue).toLowerCase() === String(filterValue).toLowerCase();
    case "not_equals":
      return String(leadValue).toLowerCase() !== String(filterValue).toLowerCase();
    case "greater_than":
      return Number(leadValue) > Number(filterValue);
    case "less_than":
      return Number(leadValue) < Number(filterValue);
    case "contains":
      return String(leadValue).toLowerCase().includes(String(filterValue).toLowerCase());
    case "in":
      if (Array.isArray(filterValue)) {
        return filterValue.map(v => String(v).toLowerCase()).includes(String(leadValue).toLowerCase());
      }
      return false;
    default:
      return false;
  }
}

function leadMatchesSegment(lead: Record<string, any>, segment: Segment): boolean {
  const validFilters = segment.filters.filter(f => f.field && f.operator && f.value !== undefined);
  if (validFilters.length === 0) return false;

  if (segment.filterLogic === "and") {
    return validFilters.every((filter) => matchesFilter(lead, filter));
  } else {
    return validFilters.some((filter) => matchesFilter(lead, filter));
  }
}

// Get leads that match a segment
export async function getLeadsInSegment(segmentId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const [segment] = await db.select().from(crmLeadSegments).where(eq(crmLeadSegments.id, segmentId));
  if (!segment) return [];

  const leads = await db.select().from(ecosystemLeads);
  
  return leads
    .filter(lead => leadMatchesSegment(lead, segment as Segment))
    .map(lead => lead.id);
}

// Check for segment changes and trigger alerts
export async function checkSegmentAlerts(leadId: number, previousData?: Record<string, any>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get the lead
  const [lead] = await db.select().from(ecosystemLeads).where(eq(ecosystemLeads.id, leadId));
  if (!lead) return;

  // Get all active segments with alerts
  const segments = await db.select().from(crmLeadSegments).where(eq(crmLeadSegments.isActive, true));
  
  for (const segment of segments) {
    const alerts = await db.select()
      .from(crmSegmentAlerts)
      .where(and(
        eq(crmSegmentAlerts.segmentId, segment.id),
        eq(crmSegmentAlerts.isActive, true)
      ));

    if (alerts.length === 0) continue;

    const nowInSegment = leadMatchesSegment(lead, segment as Segment);
    const wasInSegment = previousData ? leadMatchesSegment(previousData, segment as Segment) : false;

    for (const alert of alerts) {
      // Check for lead_entered alert
      if (alert.alertType === "lead_entered" && nowInSegment && !wasInSegment) {
        await triggerAlert(alert, segment, lead, "entered");
      }

      // Check for lead_exited alert
      if (alert.alertType === "lead_exited" && !nowInSegment && wasInSegment) {
        await triggerAlert(alert, segment, lead, "exited");
      }

      // Check for threshold_reached alert
      if (alert.alertType === "threshold_reached" && alert.thresholdValue) {
        const leadsInSegment = await getLeadsInSegment(segment.id);
        if (leadsInSegment.length >= alert.thresholdValue) {
          await triggerAlert(alert, segment, lead, "threshold");
        }
      }
    }
  }
}

// Trigger an alert
async function triggerAlert(
  alert: typeof crmSegmentAlerts.$inferSelect,
  segment: typeof crmLeadSegments.$inferSelect,
  lead: typeof ecosystemLeads.$inferSelect,
  eventType: "entered" | "exited" | "threshold"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const message = generateAlertMessage(segment.name, lead, eventType);

  // Log the alert
  await db.insert(crmSegmentAlertLogs).values({
    alertId: alert.id,
    segmentId: segment.id,
    leadId: lead.id,
    eventType,
    message,
    notificationSent: false,
  });

  // Update alert stats
  await db.update(crmSegmentAlerts)
    .set({
      lastTriggeredAt: new Date(),
      triggerCount: sql`${crmSegmentAlerts.triggerCount} + 1`,
    })
    .where(eq(crmSegmentAlerts.id, alert.id));

  // Send notifications
  if (alert.notifyEmail) {
    await sendAlertEmail(alert, segment, lead, eventType, message);
  }

  if (alert.notifyWebhook && alert.webhookUrl) {
    await sendAlertWebhook(alert.webhookUrl, segment, lead, eventType, message);
  }

  // Mark notification as sent
  await db.update(crmSegmentAlertLogs)
    .set({ notificationSent: true })
    .where(and(
      eq(crmSegmentAlertLogs.alertId, alert.id),
      eq(crmSegmentAlertLogs.leadId, lead.id),
      eq(crmSegmentAlertLogs.eventType, eventType)
    ));
}

function generateAlertMessage(
  segmentName: string,
  lead: typeof ecosystemLeads.$inferSelect,
  eventType: "entered" | "exited" | "threshold"
): string {
  const leadName = `${lead.firstName} ${lead.lastName}`;
  
  switch (eventType) {
    case "entered":
      return `Lead "${leadName}" (${lead.email}) has entered segment "${segmentName}"`;
    case "exited":
      return `Lead "${leadName}" (${lead.email}) has exited segment "${segmentName}"`;
    case "threshold":
      return `Segment "${segmentName}" has reached its threshold. Lead: "${leadName}" (${lead.email})`;
    default:
      return `Segment alert triggered for "${segmentName}"`;
  }
}

async function sendAlertEmail(
  alert: typeof crmSegmentAlerts.$inferSelect,
  segment: typeof crmLeadSegments.$inferSelect,
  lead: typeof ecosystemLeads.$inferSelect,
  eventType: "entered" | "exited" | "threshold",
  message: string
): Promise<void> {
  const recipients = alert.recipients === "owner" 
    ? [process.env.OWNER_EMAIL || "admin@rusingacademy.ca"]
    : alert.recipients?.split(",").map(e => e.trim()) || [];

  const eventLabels = {
    entered: "Lead Entered Segment",
    exited: "Lead Exited Segment",
    threshold: "Segment Threshold Reached",
  };

  const subject = `[CRM Alert] ${eventLabels[eventType]}: ${segment.name}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #009688;">CRM Segment Alert</h2>
      <p style="font-size: 16px; color: #333;">${message}</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #666;">Lead Details</h3>
        <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Company:</strong> ${lead.company || "N/A"}</p>
        <p><strong>Status:</strong> ${lead.status}</p>
        <p><strong>Score:</strong> ${lead.leadScore || 0}</p>
      </div>
      
      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #2e7d32;">Segment: ${segment.name}</h3>
        <p>${segment.description || "No description"}</p>
      </div>
      
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This is an automated alert from your CRM system.
      </p>
    </div>
  `;

  for (const email of recipients) {
    try {
      await sendEmail({
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error(`Failed to send alert email to ${email}:`, error);
    }
  }
}

async function sendAlertWebhook(
  webhookUrl: string,
  segment: typeof crmLeadSegments.$inferSelect,
  lead: typeof ecosystemLeads.$inferSelect,
  eventType: "entered" | "exited" | "threshold",
  message: string
): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: `segment.${eventType}`,
        segment: {
          id: segment.id,
          name: segment.name,
        },
        lead: {
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          company: lead.company,
          status: lead.status,
          leadScore: lead.leadScore,
        },
        message,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error(`Failed to send webhook to ${webhookUrl}:`, error);
  }
}

// Get segment statistics for dashboard
export async function getSegmentStats(): Promise<Array<{
  segmentId: number;
  segmentName: string;
  leadCount: number;
  alertCount: number;
  lastAlert: Date | null;
}>> {
  const db = await getDb();
  if (!db) return [];

  const segments = await db.select().from(crmLeadSegments).where(eq(crmLeadSegments.isActive, true));
  
  const stats = await Promise.all(segments.map(async (segment) => {
    const leadIds = await getLeadsInSegment(segment.id);
    
    const alerts = await db.select()
      .from(crmSegmentAlerts)
      .where(eq(crmSegmentAlerts.segmentId, segment.id));
    
    const lastAlert = alerts.reduce((latest, alert) => {
      if (!alert.lastTriggeredAt) return latest;
      if (!latest) return alert.lastTriggeredAt;
      return alert.lastTriggeredAt > latest ? alert.lastTriggeredAt : latest;
    }, null as Date | null);

    return {
      segmentId: segment.id,
      segmentName: segment.name,
      leadCount: leadIds.length,
      alertCount: alerts.reduce((sum, a) => sum + (a.triggerCount || 0), 0),
      lastAlert,
    };
  }));

  return stats;
}
