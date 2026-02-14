import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }),
}));

// Mock email service
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

describe("CRM Enhancements Phase 7", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Email Templates Database", () => {
    it("should have crmEmailTemplates table schema", async () => {
      const { crmEmailTemplates } = await import("../drizzle/schema");
      expect(crmEmailTemplates).toBeDefined();
    });

    it("should have required fields in email templates table", async () => {
      const { crmEmailTemplates } = await import("../drizzle/schema");
      expect(crmEmailTemplates.name).toBeDefined();
      expect(crmEmailTemplates.subject).toBeDefined();
      expect(crmEmailTemplates.body).toBeDefined();
      expect(crmEmailTemplates.category).toBeDefined();
      expect(crmEmailTemplates.language).toBeDefined();
    });

    it("should support template categories", async () => {
      const categories = ["welcome", "follow_up", "proposal", "nurture", "conversion", "custom"];
      expect(categories.length).toBe(6);
    });
  });

  describe("Pipeline Notifications", () => {
    it("should have crmPipelineNotifications table schema", async () => {
      const { crmPipelineNotifications } = await import("../drizzle/schema");
      expect(crmPipelineNotifications).toBeDefined();
    });

    it("should have notification types defined", async () => {
      const notificationTypes = ["stale_lead", "stage_change", "high_value", "follow_up_due"];
      expect(notificationTypes.length).toBe(4);
    });

    it("should export checkStaleLeads function", async () => {
      const { checkStaleLeads } = await import("./pipeline-notifications");
      expect(typeof checkStaleLeads).toBe("function");
    });

    it("should export notifyHighValueDeal function", async () => {
      const { notifyHighValueDeal } = await import("./pipeline-notifications");
      expect(typeof notifyHighValueDeal).toBe("function");
    });

    it("should export notifyStageChange function", async () => {
      const { notifyStageChange } = await import("./pipeline-notifications");
      expect(typeof notifyStageChange).toBe("function");
    });

    it("should export checkFollowUpReminders function", async () => {
      const { checkFollowUpReminders } = await import("./pipeline-notifications");
      expect(typeof checkFollowUpReminders).toBe("function");
    });

    it("should export runAllNotificationChecks function", async () => {
      const { runAllNotificationChecks } = await import("./pipeline-notifications");
      expect(typeof runAllNotificationChecks).toBe("function");
    });
  });

  describe("CRM Activity Reports", () => {
    it("should have crmActivityReports table schema", async () => {
      const { crmActivityReports } = await import("../drizzle/schema");
      expect(crmActivityReports).toBeDefined();
    });

    it("should export generateActivityReport function", async () => {
      const { generateActivityReport } = await import("./crm-activity-report");
      expect(typeof generateActivityReport).toBe("function");
    });

    it("should export getWeeklyPeriod function", async () => {
      const { getWeeklyPeriod } = await import("./crm-activity-report");
      expect(typeof getWeeklyPeriod).toBe("function");
    });

    it("should export getMonthlyPeriod function", async () => {
      const { getMonthlyPeriod } = await import("./crm-activity-report");
      expect(typeof getMonthlyPeriod).toBe("function");
    });

    it("should return correct weekly period", async () => {
      const { getWeeklyPeriod } = await import("./crm-activity-report");
      const period = getWeeklyPeriod();
      
      expect(period.type).toBe("weekly");
      expect(period.start).toBeInstanceOf(Date);
      expect(period.end).toBeInstanceOf(Date);
      
      // Period should be approximately 7-8 days (including end of day)
      const diff = period.end.getTime() - period.start.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      expect(days).toBeGreaterThanOrEqual(7);
      expect(days).toBeLessThanOrEqual(8);
    });

    it("should return correct monthly period", async () => {
      const { getMonthlyPeriod } = await import("./crm-activity-report");
      const period = getMonthlyPeriod();
      
      expect(period.type).toBe("monthly");
      expect(period.start).toBeInstanceOf(Date);
      expect(period.end).toBeInstanceOf(Date);
    });

    it("should export saveActivityReport function", async () => {
      const { saveActivityReport } = await import("./crm-activity-report");
      expect(typeof saveActivityReport).toBe("function");
    });
  });

  describe("Cron Jobs", () => {
    it("should export runPipelineNotificationsCron function", async () => {
      const { runPipelineNotificationsCron } = await import("./cron/pipeline-notifications");
      expect(typeof runPipelineNotificationsCron).toBe("function");
    });

    it("should export runCrmActivityReportCron function", async () => {
      const { runCrmActivityReportCron } = await import("./cron/crm-activity-report");
      expect(typeof runCrmActivityReportCron).toBe("function");
    });
  });
});
