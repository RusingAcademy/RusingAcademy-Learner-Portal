/**
 * CRM Webhooks Service
 * 
 * Send notifications to external services (Slack, Discord, custom webhooks)
 * when important CRM events occur.
 */

import { getDb } from "./db";
import { ecosystemLeads } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  events: string[];
  name: string;
  type: "slack" | "discord" | "custom";
}

// Event types
export const CRM_EVENTS = {
  LEAD_CREATED: "lead.created",
  LEAD_CONVERTED: "lead.converted",
  LEAD_LOST: "lead.lost",
  LEAD_STAGE_CHANGED: "lead.stage_changed",
  LEAD_SCORE_HIGH: "lead.score_high",
  MEETING_SCHEDULED: "meeting.scheduled",
  MEETING_COMPLETED: "meeting.completed",
  DEAL_WON: "deal.won",
  DEAL_LOST: "deal.lost",
} as const;

export type CrmEvent = typeof CRM_EVENTS[keyof typeof CRM_EVENTS];

/**
 * Format payload for Slack webhook
 */
function formatSlackPayload(event: string, data: Record<string, unknown>): Record<string, unknown> {
  const eventLabels: Record<string, string> = {
    [CRM_EVENTS.LEAD_CREATED]: "🆕 New Lead Created",
    [CRM_EVENTS.LEAD_CONVERTED]: "✅ Lead Converted",
    [CRM_EVENTS.LEAD_LOST]: "❌ Lead Lost",
    [CRM_EVENTS.LEAD_STAGE_CHANGED]: "📊 Lead Stage Changed",
    [CRM_EVENTS.LEAD_SCORE_HIGH]: "🔥 High-Score Lead Alert",
    [CRM_EVENTS.MEETING_SCHEDULED]: "📅 Meeting Scheduled",
    [CRM_EVENTS.MEETING_COMPLETED]: "✔️ Meeting Completed",
    [CRM_EVENTS.DEAL_WON]: "🎉 Deal Won",
    [CRM_EVENTS.DEAL_LOST]: "💔 Deal Lost",
  };

  const title = eventLabels[event] || event;
  
  const fields = Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      title: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: String(value),
      short: String(value).length < 30,
    }));

  return {
    attachments: [
      {
        color: event.includes("won") || event.includes("converted") ? "#22c55e" 
             : event.includes("lost") ? "#ef4444" 
             : event.includes("high") ? "#f59e0b"
             : "#3b82f6",
        title,
        fields,
        footer: "Lingueefy CRM",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
}

/**
 * Format payload for Discord webhook
 */
function formatDiscordPayload(event: string, data: Record<string, unknown>): Record<string, unknown> {
  const eventLabels: Record<string, string> = {
    [CRM_EVENTS.LEAD_CREATED]: "🆕 New Lead Created",
    [CRM_EVENTS.LEAD_CONVERTED]: "✅ Lead Converted",
    [CRM_EVENTS.LEAD_LOST]: "❌ Lead Lost",
    [CRM_EVENTS.LEAD_STAGE_CHANGED]: "📊 Lead Stage Changed",
    [CRM_EVENTS.LEAD_SCORE_HIGH]: "🔥 High-Score Lead Alert",
    [CRM_EVENTS.MEETING_SCHEDULED]: "📅 Meeting Scheduled",
    [CRM_EVENTS.MEETING_COMPLETED]: "✔️ Meeting Completed",
    [CRM_EVENTS.DEAL_WON]: "🎉 Deal Won",
    [CRM_EVENTS.DEAL_LOST]: "💔 Deal Lost",
  };

  const title = eventLabels[event] || event;
  
  const fields = Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined)
    .slice(0, 25) // Discord limit
    .map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: String(value).substring(0, 1024),
      inline: String(value).length < 30,
    }));

  return {
    embeds: [
      {
        title,
        color: event.includes("won") || event.includes("converted") ? 0x22c55e 
             : event.includes("lost") ? 0xef4444 
             : event.includes("high") ? 0xf59e0b
             : 0x3b82f6,
        fields,
        footer: {
          text: "Lingueefy CRM",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Send webhook notification
 */
export async function sendWebhook(
  config: WebhookConfig,
  event: CrmEvent,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  // Check if this webhook is subscribed to this event
  if (!config.events.includes(event) && !config.events.includes("*")) {
    return { success: true }; // Not subscribed, skip silently
  }

  try {
    let payload: Record<string, unknown>;
    
    switch (config.type) {
      case "slack":
        payload = formatSlackPayload(event, data);
        break;
      case "discord":
        payload = formatDiscordPayload(event, data);
        break;
      case "custom":
      default:
        payload = {
          event,
          timestamp: new Date().toISOString(),
          data,
        };
        break;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add secret header for custom webhooks
    if (config.secret && config.type === "custom") {
      headers["X-Webhook-Secret"] = config.secret;
    }

    const response = await fetch(config.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Webhook] Failed to send to ${config.name}:`, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    console.log(`[Webhook] Successfully sent ${event} to ${config.name}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Webhook] Error sending to ${config.name}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Broadcast event to all configured webhooks
 */
export async function broadcastCrmEvent(
  event: CrmEvent,
  data: Record<string, unknown>,
  webhooks: WebhookConfig[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = await Promise.all(
    webhooks.map((webhook) => sendWebhook(webhook, event, data))
  );

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const errors = results.filter((r) => r.error).map((r) => r.error!);

  return { sent, failed, errors };
}

/**
 * Trigger webhook for lead creation
 */
export async function triggerLeadCreatedWebhook(
  leadId: number,
  webhooks: WebhookConfig[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const leads = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, leadId))
    .limit(1);

  if (leads.length === 0) return;

  const lead = leads[0];
  
  await broadcastCrmEvent(CRM_EVENTS.LEAD_CREATED, {
    leadId: lead.id,
    name: `${lead.firstName} ${lead.lastName}`,
    email: lead.email,
    company: lead.company,
    source: lead.source,
    leadType: lead.leadType,
  }, webhooks);
}

/**
 * Trigger webhook for stage change
 */
export async function triggerStageChangeWebhook(
  leadId: number,
  fromStage: string,
  toStage: string,
  webhooks: WebhookConfig[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const leads = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, leadId))
    .limit(1);

  if (leads.length === 0) return;

  const lead = leads[0];
  
  // Determine the specific event
  let event: CrmEvent = CRM_EVENTS.LEAD_STAGE_CHANGED;
  if (toStage === "won" || toStage === "converted") {
    event = CRM_EVENTS.LEAD_CONVERTED;
  } else if (toStage === "lost") {
    event = CRM_EVENTS.LEAD_LOST;
  }
  
  await broadcastCrmEvent(event, {
    leadId: lead.id,
    name: `${lead.firstName} ${lead.lastName}`,
    email: lead.email,
    company: lead.company,
    fromStage,
    toStage,
    leadScore: lead.leadScore,
  }, webhooks);
}

/**
 * Trigger webhook for high score alert
 */
export async function triggerHighScoreWebhook(
  leadId: number,
  score: number,
  webhooks: WebhookConfig[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const leads = await db
    .select()
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, leadId))
    .limit(1);

  if (leads.length === 0) return;

  const lead = leads[0];
  
  await broadcastCrmEvent(CRM_EVENTS.LEAD_SCORE_HIGH, {
    leadId: lead.id,
    name: `${lead.firstName} ${lead.lastName}`,
    email: lead.email,
    company: lead.company,
    score,
    status: lead.status,
  }, webhooks);
}

/**
 * Get default webhook configurations from environment
 */
export function getWebhookConfigsFromEnv(): WebhookConfig[] {
  const configs: WebhookConfig[] = [];

  // Slack webhook
  const slackUrl = process.env.CRM_SLACK_WEBHOOK_URL;
  if (slackUrl) {
    configs.push({
      url: slackUrl,
      name: "Slack",
      type: "slack",
      events: ["*"], // Subscribe to all events
    });
  }

  // Discord webhook
  const discordUrl = process.env.CRM_DISCORD_WEBHOOK_URL;
  if (discordUrl) {
    configs.push({
      url: discordUrl,
      name: "Discord",
      type: "discord",
      events: ["*"],
    });
  }

  // Custom webhook
  const customUrl = process.env.CRM_CUSTOM_WEBHOOK_URL;
  const customSecret = process.env.CRM_CUSTOM_WEBHOOK_SECRET;
  if (customUrl) {
    configs.push({
      url: customUrl,
      secret: customSecret,
      name: "Custom Webhook",
      type: "custom",
      events: ["*"],
    });
  }

  return configs;
}
