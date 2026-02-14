import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendWebhook,
  broadcastCrmEvent,
  CRM_EVENTS,
  getWebhookConfigsFromEnv,
  type WebhookConfig,
} from "./crm-webhooks";

// Mock fetch
global.fetch = vi.fn();

describe("CRM Webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CRM_EVENTS", () => {
    it("should have all required event types", () => {
      expect(CRM_EVENTS.LEAD_CREATED).toBe("lead.created");
      expect(CRM_EVENTS.LEAD_CONVERTED).toBe("lead.converted");
      expect(CRM_EVENTS.LEAD_LOST).toBe("lead.lost");
      expect(CRM_EVENTS.LEAD_STAGE_CHANGED).toBe("lead.stage_changed");
      expect(CRM_EVENTS.LEAD_SCORE_HIGH).toBe("lead.score_high");
      expect(CRM_EVENTS.MEETING_SCHEDULED).toBe("meeting.scheduled");
      expect(CRM_EVENTS.MEETING_COMPLETED).toBe("meeting.completed");
      expect(CRM_EVENTS.DEAL_WON).toBe("deal.won");
      expect(CRM_EVENTS.DEAL_LOST).toBe("deal.lost");
    });
  });

  describe("sendWebhook", () => {
    it("should skip events not in subscription list", async () => {
      const config: WebhookConfig = {
        url: "https://hooks.slack.com/test",
        name: "Test Slack",
        type: "slack",
        events: ["lead.created"], // Only subscribed to lead.created
      };

      const result = await sendWebhook(config, CRM_EVENTS.DEAL_WON, { test: true });
      
      expect(result.success).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should send webhook for subscribed events", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("ok"),
      });

      const config: WebhookConfig = {
        url: "https://hooks.slack.com/test",
        name: "Test Slack",
        type: "slack",
        events: ["lead.created"],
      };

      const result = await sendWebhook(config, CRM_EVENTS.LEAD_CREATED, {
        name: "John Doe",
        email: "john@example.com",
      });
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://hooks.slack.com/test",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should send webhook for wildcard subscriptions", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("ok"),
      });

      const config: WebhookConfig = {
        url: "https://hooks.slack.com/test",
        name: "Test Slack",
        type: "slack",
        events: ["*"], // Wildcard - all events
      };

      const result = await sendWebhook(config, CRM_EVENTS.DEAL_WON, { test: true });
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalled();
    });

    it("should handle webhook failures gracefully", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const config: WebhookConfig = {
        url: "https://hooks.slack.com/test",
        name: "Test Slack",
        type: "slack",
        events: ["*"],
      };

      const result = await sendWebhook(config, CRM_EVENTS.LEAD_CREATED, { test: true });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain("500");
    });

    it("should handle network errors", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      const config: WebhookConfig = {
        url: "https://hooks.slack.com/test",
        name: "Test Slack",
        type: "slack",
        events: ["*"],
      };

      const result = await sendWebhook(config, CRM_EVENTS.LEAD_CREATED, { test: true });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("should add secret header for custom webhooks", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("ok"),
      });

      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        name: "Custom Webhook",
        type: "custom",
        secret: "my-secret-key",
        events: ["*"],
      };

      await sendWebhook(config, CRM_EVENTS.LEAD_CREATED, { test: true });
      
      expect(fetch).toHaveBeenCalledWith(
        "https://example.com/webhook",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Secret": "my-secret-key",
          },
        })
      );
    });
  });

  describe("broadcastCrmEvent", () => {
    it("should send to multiple webhooks", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("ok"),
      });

      const webhooks: WebhookConfig[] = [
        { url: "https://slack.com/1", name: "Slack 1", type: "slack", events: ["*"] },
        { url: "https://discord.com/1", name: "Discord 1", type: "discord", events: ["*"] },
      ];

      const result = await broadcastCrmEvent(CRM_EVENTS.LEAD_CREATED, { test: true }, webhooks);
      
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should count failures correctly", async () => {
      (fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("ok") })
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("Error") });

      const webhooks: WebhookConfig[] = [
        { url: "https://slack.com/1", name: "Slack 1", type: "slack", events: ["*"] },
        { url: "https://discord.com/1", name: "Discord 1", type: "discord", events: ["*"] },
      ];

      const result = await broadcastCrmEvent(CRM_EVENTS.LEAD_CREATED, { test: true }, webhooks);
      
      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe("getWebhookConfigsFromEnv", () => {
    it("should return empty array when no env vars set", () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.CRM_SLACK_WEBHOOK_URL;
      delete process.env.CRM_DISCORD_WEBHOOK_URL;
      delete process.env.CRM_CUSTOM_WEBHOOK_URL;

      const configs = getWebhookConfigsFromEnv();
      
      expect(configs).toEqual([]);
      
      process.env = originalEnv;
    });

    it("should parse Slack webhook from env", () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        CRM_SLACK_WEBHOOK_URL: "https://hooks.slack.com/test",
      };

      const configs = getWebhookConfigsFromEnv();
      
      expect(configs.length).toBe(1);
      expect(configs[0].type).toBe("slack");
      expect(configs[0].url).toBe("https://hooks.slack.com/test");
      expect(configs[0].events).toEqual(["*"]);
      
      process.env = originalEnv;
    });
  });
});

describe("Lead Tags", () => {
  it("should validate tag color format", () => {
    const validColors = ["#ff0000", "#00ff00", "#0000ff", "#6366f1"];
    const invalidColors = ["red", "rgb(255,0,0)", "#fff", "6366f1"];

    const colorRegex = /^#[0-9A-Fa-f]{6}$/;

    validColors.forEach((color) => {
      expect(colorRegex.test(color)).toBe(true);
    });

    invalidColors.forEach((color) => {
      expect(colorRegex.test(color)).toBe(false);
    });
  });

  it("should have preset colors in valid format", () => {
    const PRESET_COLORS = [
      "#ef4444", "#f97316", "#f59e0b", "#84cc16",
      "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
      "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
    ];

    const colorRegex = /^#[0-9A-Fa-f]{6}$/;

    PRESET_COLORS.forEach((color) => {
      expect(colorRegex.test(color)).toBe(true);
    });
  });
});

describe("Pipeline Filters", () => {
  it("should correctly filter by value ranges", () => {
    const leads = [
      { id: 1, dealValue: 2000 },
      { id: 2, dealValue: 10000 },
      { id: 3, dealValue: 50000 },
      { id: 4, dealValue: 150000 },
    ];

    // Under 5k
    const under5k = leads.filter((l) => l.dealValue < 5000);
    expect(under5k.length).toBe(1);
    expect(under5k[0].id).toBe(1);

    // 5k-25k
    const from5kTo25k = leads.filter((l) => l.dealValue >= 5000 && l.dealValue < 25000);
    expect(from5kTo25k.length).toBe(1);
    expect(from5kTo25k[0].id).toBe(2);

    // 25k-100k
    const from25kTo100k = leads.filter((l) => l.dealValue >= 25000 && l.dealValue < 100000);
    expect(from25kTo100k.length).toBe(1);
    expect(from25kTo100k[0].id).toBe(3);

    // Over 100k
    const over100k = leads.filter((l) => l.dealValue >= 100000);
    expect(over100k.length).toBe(1);
    expect(over100k[0].id).toBe(4);
  });

  it("should correctly filter by score ranges", () => {
    const leads = [
      { id: 1, leadScore: 30 },
      { id: 2, leadScore: 60 },
      { id: 3, leadScore: 90 },
    ];

    // Cold (< 50)
    const cold = leads.filter((l) => l.leadScore < 50);
    expect(cold.length).toBe(1);
    expect(cold[0].id).toBe(1);

    // Warm (50-79)
    const warm = leads.filter((l) => l.leadScore >= 50 && l.leadScore < 80);
    expect(warm.length).toBe(1);
    expect(warm[0].id).toBe(2);

    // Hot (>= 80)
    const hot = leads.filter((l) => l.leadScore >= 80);
    expect(hot.length).toBe(1);
    expect(hot[0].id).toBe(3);
  });

  it("should correctly filter by date ranges", () => {
    const now = new Date();
    const leads = [
      { id: 1, createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }, // 3 days ago
      { id: 2, createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) }, // 15 days ago
      { id: 3, createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) }, // 60 days ago
      { id: 4, createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000) }, // 120 days ago
    ];

    const getDaysDiff = (date: Date) => Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    // Last 7 days
    const last7days = leads.filter((l) => getDaysDiff(l.createdAt) <= 7);
    expect(last7days.length).toBe(1);

    // Last 30 days
    const last30days = leads.filter((l) => getDaysDiff(l.createdAt) <= 30);
    expect(last30days.length).toBe(2);

    // Last 90 days
    const last90days = leads.filter((l) => getDaysDiff(l.createdAt) <= 90);
    expect(last90days.length).toBe(3);

    // Older than 90 days
    const older = leads.filter((l) => getDaysDiff(l.createdAt) > 90);
    expect(older.length).toBe(1);
  });
});
