/**
 * Pipeline Notifications Service
 * 
 * Monitors leads in the pipeline and generates notifications for:
 * - Stale leads (no activity for X days)
 * - High-value deals entering pipeline
 * - Follow-up reminders
 * - Stage changes
 */

import { getDb } from "./db";
import { ecosystemLeads, crmPipelineNotifications } from "../drizzle/schema";
import { eq, lt, and, isNull, sql } from "drizzle-orm";

export interface NotificationConfig {
  staleDays: number; // Days without activity before marking as stale
  highValueThreshold: number; // Deal value threshold for high-value alerts
  followUpReminderDays: number; // Days before follow-up reminder
}

const DEFAULT_CONFIG: NotificationConfig = {
  staleDays: 7,
  highValueThreshold: 10000,
  followUpReminderDays: 3,
};

/**
 * Check for stale leads and create notifications
 */
export async function checkStaleLeads(config: NotificationConfig = DEFAULT_CONFIG): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - config.staleDays);

  // Find leads with no recent contact
  const staleLeads = await db
    .select()
    .from(ecosystemLeads)
    .where(
      and(
        lt(ecosystemLeads.lastContactedAt, staleDate),
        // Only check active pipeline stages
        sql`${ecosystemLeads.status} NOT IN ('converted', 'lost')`
      )
    );

  let notificationsCreated = 0;

  for (const lead of staleLeads) {
    // Check if we already have a recent stale notification for this lead
    const existingNotifications = await db
      .select()
      .from(crmPipelineNotifications)
      .where(
        and(
          eq(crmPipelineNotifications.leadId, lead.id),
          eq(crmPipelineNotifications.notificationType, "stale_lead"),
          eq(crmPipelineNotifications.isRead, false)
        )
      );

    if (existingNotifications.length === 0) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(lead.lastContactedAt || lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      await db.insert(crmPipelineNotifications).values({
        leadId: lead.id,
        notificationType: "stale_lead",
        message: `${lead.firstName} ${lead.lastName} has had no contact for ${daysSinceContact} days. Consider reaching out.`,
      });

      notificationsCreated++;
    }
  }

  return notificationsCreated;
}

/**
 * Create notification for high-value deal
 */
export async function notifyHighValueDeal(
  leadId: number,
  dealValue: number,
  config: NotificationConfig = DEFAULT_CONFIG
): Promise<boolean> {
  if (dealValue < config.highValueThreshold) return false;

  const db = await getDb();
  if (!db) return false;

  const [lead] = await db.select().from(ecosystemLeads).where(eq(ecosystemLeads.id, leadId));
  if (!lead) return false;

  await db.insert(crmPipelineNotifications).values({
    leadId,
    notificationType: "high_value",
    message: `High-value opportunity: ${lead.firstName} ${lead.lastName} - $${dealValue.toLocaleString()} deal entered the pipeline.`,
  });

  return true;
}

/**
 * Create notification for stage change
 */
export async function notifyStageChange(
  leadId: number,
  fromStage: string,
  toStage: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [lead] = await db.select().from(ecosystemLeads).where(eq(ecosystemLeads.id, leadId));
  if (!lead) return false;

  // Only notify for significant stage changes
  const significantChanges = [
    { from: "new", to: "qualified" },
    { from: "qualified", to: "proposal" },
    { from: "proposal", to: "converted" },
    { from: "any", to: "lost" },
  ];

  const isSignificant = significantChanges.some(
    (change) => (change.from === "any" || change.from === fromStage) && change.to === toStage
  );

  if (!isSignificant) return false;

  const stageLabels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal: "Proposal",
    converted: "Won",
    lost: "Lost",
  };

  await db.insert(crmPipelineNotifications).values({
    leadId,
    notificationType: "stage_change",
    message: `${lead.firstName} ${lead.lastName} moved from ${stageLabels[fromStage] || fromStage} to ${stageLabels[toStage] || toStage}.`,
  });

  return true;
}

/**
 * Check for follow-up reminders based on last contact date
 */
export async function checkFollowUpReminders(config: NotificationConfig = DEFAULT_CONFIG): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Find leads that were contacted but need follow-up (based on followUpReminderDays since last contact)
  const followUpThreshold = new Date();
  followUpThreshold.setDate(followUpThreshold.getDate() - config.followUpReminderDays);

  // Find leads in active stages that need follow-up
  const leadsNeedingFollowUp = await db
    .select()
    .from(ecosystemLeads)
    .where(
      and(
        lt(ecosystemLeads.lastContactedAt, followUpThreshold),
        sql`${ecosystemLeads.status} IN ('contacted', 'qualified', 'proposal')`
      )
    );

  let notificationsCreated = 0;

  for (const lead of leadsNeedingFollowUp) {
    // Check if we already have a recent follow-up notification
    const existingNotifications = await db
      .select()
      .from(crmPipelineNotifications)
      .where(
        and(
          eq(crmPipelineNotifications.leadId, lead.id),
          eq(crmPipelineNotifications.notificationType, "follow_up_due"),
          eq(crmPipelineNotifications.isRead, false)
        )
      );

    if (existingNotifications.length === 0) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(lead.lastContactedAt || lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      await db.insert(crmPipelineNotifications).values({
        leadId: lead.id,
        notificationType: "follow_up_due",
        message: `Follow-up needed for ${lead.firstName} ${lead.lastName} - ${daysSinceContact} days since last contact.`,
      });

      notificationsCreated++;
    }
  }

  return notificationsCreated;
}

/**
 * Run all notification checks
 */
export async function runAllNotificationChecks(config: NotificationConfig = DEFAULT_CONFIG): Promise<{
  staleLeads: number;
  followUpReminders: number;
  total: number;
}> {
  const staleLeads = await checkStaleLeads(config);
  const followUpReminders = await checkFollowUpReminders(config);

  return {
    staleLeads,
    followUpReminders,
    total: staleLeads + followUpReminders,
  };
}

/**
 * Get notification summary for dashboard
 */
export async function getNotificationSummary(): Promise<{
  unreadCount: number;
  byType: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) return { unreadCount: 0, byType: {} };

  const notifications = await db
    .select()
    .from(crmPipelineNotifications)
    .where(eq(crmPipelineNotifications.isRead, false));

  const byType: Record<string, number> = {};
  for (const notification of notifications) {
    byType[notification.notificationType] = (byType[notification.notificationType] || 0) + 1;
  }

  return {
    unreadCount: notifications.length,
    byType,
  };
}
