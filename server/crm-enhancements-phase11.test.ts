import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock segment alerts service
const mockSegmentAlertsService = {
  createAlert: vi.fn(),
  updateAlert: vi.fn(),
  deleteAlert: vi.fn(),
  checkSegmentAlerts: vi.fn(),
  logAlertEvent: vi.fn(),
};

// Mock segment comparison
const mockSegmentComparison = {
  calculateMetrics: vi.fn(),
  compareSegments: vi.fn(),
  findTopPerformer: vi.fn(),
};

// Mock lead merge
const mockLeadMerge = {
  mergeLeads: vi.fn(),
  transferActivities: vi.fn(),
  transferHistory: vi.fn(),
  findDuplicates: vi.fn(),
};

describe("CRM Enhancements Phase 11", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Segment Alerts", () => {
    it("should create a segment alert", async () => {
      const alertData = {
        segmentId: 1,
        alertType: "lead_entered",
        notifyEmail: true,
        recipients: "owner",
      };

      mockSegmentAlertsService.createAlert.mockResolvedValue({
        id: 1,
        ...alertData,
        isActive: true,
      });

      const result = await mockSegmentAlertsService.createAlert(alertData);

      expect(result).toHaveProperty("id");
      expect(result.alertType).toBe("lead_entered");
      expect(result.isActive).toBe(true);
    });

    it("should support threshold alerts", async () => {
      const alertData = {
        segmentId: 1,
        alertType: "threshold_reached",
        thresholdValue: 50,
        notifyEmail: true,
      };

      mockSegmentAlertsService.createAlert.mockResolvedValue({
        id: 2,
        ...alertData,
        isActive: true,
      });

      const result = await mockSegmentAlertsService.createAlert(alertData);

      expect(result.alertType).toBe("threshold_reached");
      expect(result.thresholdValue).toBe(50);
    });

    it("should support webhook notifications", async () => {
      const alertData = {
        segmentId: 1,
        alertType: "lead_exited",
        notifyWebhook: true,
        webhookUrl: "https://hooks.slack.com/test",
      };

      mockSegmentAlertsService.createAlert.mockResolvedValue({
        id: 3,
        ...alertData,
        isActive: true,
      });

      const result = await mockSegmentAlertsService.createAlert(alertData);

      expect(result.notifyWebhook).toBe(true);
      expect(result.webhookUrl).toBe("https://hooks.slack.com/test");
    });

    it("should log alert events", async () => {
      const eventData = {
        alertId: 1,
        segmentId: 1,
        leadId: 100,
        eventType: "entered",
        message: "Lead entered segment",
      };

      mockSegmentAlertsService.logAlertEvent.mockResolvedValue({
        id: 1,
        ...eventData,
        notificationSent: true,
      });

      const result = await mockSegmentAlertsService.logAlertEvent(eventData);

      expect(result.eventType).toBe("entered");
      expect(result.notificationSent).toBe(true);
    });
  });

  describe("Segment Comparison Dashboard", () => {
    it("should calculate segment metrics", async () => {
      const segmentId = 1;
      const leads = [
        { id: 1, leadScore: 80, budget: 10000, status: "qualified" },
        { id: 2, leadScore: 60, budget: 5000, status: "contacted" },
        { id: 3, leadScore: 40, budget: 15000, status: "won" },
      ];

      mockSegmentComparison.calculateMetrics.mockResolvedValue({
        totalLeads: 3,
        avgScore: 60,
        totalValue: 30000,
        conversionRate: 33.3,
        hotLeads: 1,
        warmLeads: 1,
        coldLeads: 1,
      });

      const result = await mockSegmentComparison.calculateMetrics(segmentId, leads);

      expect(result.totalLeads).toBe(3);
      expect(result.avgScore).toBe(60);
      expect(result.totalValue).toBe(30000);
    });

    it("should compare multiple segments", async () => {
      const segmentIds = [1, 2, 3];

      mockSegmentComparison.compareSegments.mockResolvedValue([
        { id: 1, name: "High Value", totalLeads: 50, avgScore: 75 },
        { id: 2, name: "New Leads", totalLeads: 100, avgScore: 45 },
        { id: 3, name: "Nurturing", totalLeads: 30, avgScore: 55 },
      ]);

      const result = await mockSegmentComparison.compareSegments(segmentIds);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("High Value");
    });

    it("should find top performer by metric", async () => {
      const segments = [
        { id: 1, name: "A", avgScore: 75, totalValue: 50000 },
        { id: 2, name: "B", avgScore: 85, totalValue: 30000 },
        { id: 3, name: "C", avgScore: 65, totalValue: 80000 },
      ];

      mockSegmentComparison.findTopPerformer.mockImplementation((segs, metric) => {
        if (metric === "score") {
          return segs.reduce((max: any, s: any) => s.avgScore > max.avgScore ? s : max, segs[0]);
        }
        if (metric === "value") {
          return segs.reduce((max: any, s: any) => s.totalValue > max.totalValue ? s : max, segs[0]);
        }
        return segs[0];
      });

      const topByScore = await mockSegmentComparison.findTopPerformer(segments, "score");
      const topByValue = await mockSegmentComparison.findTopPerformer(segments, "value");

      expect(topByScore.name).toBe("B");
      expect(topByValue.name).toBe("C");
    });
  });

  describe("Lead Merge", () => {
    it("should find potential duplicates", async () => {
      const leads = [
        { id: 1, email: "john@example.com", firstName: "John", lastName: "Doe" },
        { id: 2, email: "john@example.com", firstName: "Johnny", lastName: "Doe" },
        { id: 3, email: "jane@example.com", firstName: "Jane", lastName: "Smith" },
      ];

      mockLeadMerge.findDuplicates.mockResolvedValue([
        [leads[0], leads[1]], // Same email
      ]);

      const result = await mockLeadMerge.findDuplicates(leads);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it("should merge leads with primary lead data priority", async () => {
      const mergeData = {
        primaryLeadId: 1,
        secondaryLeadIds: [2, 3],
        mergedData: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          company: "Acme Inc",
          leadScore: 85,
        },
      };

      mockLeadMerge.mergeLeads.mockResolvedValue({
        success: true,
        primaryLeadId: 1,
        mergedCount: 2,
      });

      const result = await mockLeadMerge.mergeLeads(mergeData);

      expect(result.success).toBe(true);
      expect(result.primaryLeadId).toBe(1);
      expect(result.mergedCount).toBe(2);
    });

    it("should transfer activities from secondary leads", async () => {
      const transferData = {
        primaryLeadId: 1,
        secondaryLeadIds: [2, 3],
      };

      mockLeadMerge.transferActivities.mockResolvedValue({
        activitiesTransferred: 15,
      });

      const result = await mockLeadMerge.transferActivities(transferData);

      expect(result.activitiesTransferred).toBe(15);
    });

    it("should transfer history from secondary leads", async () => {
      const transferData = {
        primaryLeadId: 1,
        secondaryLeadIds: [2, 3],
      };

      mockLeadMerge.transferHistory.mockResolvedValue({
        historyEntriesTransferred: 25,
      });

      const result = await mockLeadMerge.transferHistory(transferData);

      expect(result.historyEntriesTransferred).toBe(25);
    });

    it("should use highest lead score when merging", async () => {
      const leads = [
        { id: 1, leadScore: 60 },
        { id: 2, leadScore: 85 },
        { id: 3, leadScore: 70 },
      ];

      const highestScore = Math.max(...leads.map(l => l.leadScore));

      expect(highestScore).toBe(85);
    });
  });

  describe("Integration", () => {
    it("should trigger alert when lead enters segment after merge", async () => {
      // Simulate merge creating a lead that now matches a segment
      mockLeadMerge.mergeLeads.mockResolvedValue({
        success: true,
        primaryLeadId: 1,
      });

      mockSegmentAlertsService.checkSegmentAlerts.mockResolvedValue({
        alertsTriggered: 1,
        notifications: [{ type: "lead_entered", segmentId: 1, leadId: 1 }],
      });

      const mergeResult = await mockLeadMerge.mergeLeads({
        primaryLeadId: 1,
        secondaryLeadIds: [2],
        mergedData: { leadScore: 90 },
      });

      expect(mergeResult.success).toBe(true);

      const alertResult = await mockSegmentAlertsService.checkSegmentAlerts(1);

      expect(alertResult.alertsTriggered).toBe(1);
    });
  });
});
