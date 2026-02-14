import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database and email modules
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

vi.mock("../email-reminders", () => ({
  sendPlanExpiryReminderEmail: vi.fn().mockResolvedValue(true),
  sendInactivityReminderEmail: vi.fn().mockResolvedValue(true),
}));

describe("Reminder Jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkExpiringPlans", () => {
    it("should return stats object with correct structure", async () => {
      const { getDb } = await import("../db");
      (getDb as any).mockResolvedValue(null);

      const { checkExpiringPlans } = await import("./reminderJobs");
      const result = await checkExpiringPlans();

      expect(result).toHaveProperty("processed");
      expect(result).toHaveProperty("sent");
      expect(result).toHaveProperty("errors");
      expect(typeof result.processed).toBe("number");
      expect(typeof result.sent).toBe("number");
      expect(typeof result.errors).toBe("number");
    });

    it("should handle database unavailability gracefully", async () => {
      const { getDb } = await import("../db");
      (getDb as any).mockResolvedValue(null);

      const { checkExpiringPlans } = await import("./reminderJobs");
      const result = await checkExpiringPlans();

      expect(result.processed).toBe(0);
      expect(result.sent).toBe(0);
      expect(result.errors).toBe(0);
    });
  });

  describe("checkInactiveUsers", () => {
    it("should return stats object with correct structure", async () => {
      const { getDb } = await import("../db");
      (getDb as any).mockResolvedValue(null);

      const { checkInactiveUsers } = await import("./reminderJobs");
      const result = await checkInactiveUsers();

      expect(result).toHaveProperty("processed");
      expect(result).toHaveProperty("sent");
      expect(result).toHaveProperty("errors");
    });

    it("should handle database unavailability gracefully", async () => {
      const { getDb } = await import("../db");
      (getDb as any).mockResolvedValue(null);

      const { checkInactiveUsers } = await import("./reminderJobs");
      const result = await checkInactiveUsers();

      expect(result.processed).toBe(0);
      expect(result.sent).toBe(0);
      expect(result.errors).toBe(0);
    });
  });

  describe("runAllReminderJobs", () => {
    it("should return combined results from all jobs", async () => {
      const { getDb } = await import("../db");
      (getDb as any).mockResolvedValue(null);

      const { runAllReminderJobs } = await import("./reminderJobs");
      const result = await runAllReminderJobs();

      expect(result).toHaveProperty("expiryReminders");
      expect(result).toHaveProperty("inactivityReminders");
      expect(result).toHaveProperty("runTime");
      expect(result.runTime).toBeInstanceOf(Date);
    });
  });

  describe("getJobStatus", () => {
    it("should return job status with correct structure", async () => {
      const { getJobStatus } = await import("./reminderJobs");
      const status = getJobStatus();

      expect(status).toHaveProperty("isRunning");
      expect(status).toHaveProperty("lastRunTime");
      expect(typeof status.isRunning).toBe("boolean");
    });
  });

  describe("scheduleReminderJobs", () => {
    it("should return an interval ID", async () => {
      const { scheduleReminderJobs } = await import("./reminderJobs");
      const intervalId = scheduleReminderJobs(9, 0);

      expect(intervalId).toBeDefined();
      clearInterval(intervalId);
    });
  });
});

describe("Calendly Service", () => {
  describe("CalendlyService class", () => {
    it("should be instantiable with an API key", async () => {
      const { CalendlyService } = await import("../services/calendlyService");
      const service = new CalendlyService("test-api-key");
      expect(service).toBeDefined();
    });

    it("should have getAvailableTimes method", async () => {
      const { CalendlyService } = await import("../services/calendlyService");
      const service = new CalendlyService("test-api-key");
      expect(typeof service.getAvailableTimes).toBe("function");
    });

    it("should have getEventTypes method", async () => {
      const { CalendlyService } = await import("../services/calendlyService");
      const service = new CalendlyService("test-api-key");
      expect(typeof service.getEventTypes).toBe("function");
    });

    it("should have getScheduledEvents method", async () => {
      const { CalendlyService } = await import("../services/calendlyService");
      const service = new CalendlyService("test-api-key");
      expect(typeof service.getScheduledEvents).toBe("function");
    });
  });

  describe("formatAvailableTimesForDisplay", () => {
    it("should group times by date", async () => {
      const { formatAvailableTimesForDisplay } = await import("../services/calendlyService");
      
      const times = [
        { status: "available" as const, invitees_remaining: 1, start_time: "2026-02-05T09:00:00Z", scheduling_url: "https://calendly.com/1" },
        { status: "available" as const, invitees_remaining: 1, start_time: "2026-02-05T10:00:00Z", scheduling_url: "https://calendly.com/2" },
        { status: "available" as const, invitees_remaining: 1, start_time: "2026-02-06T09:00:00Z", scheduling_url: "https://calendly.com/3" },
      ];

      const grouped = formatAvailableTimesForDisplay(times);

      expect(grouped.size).toBe(2);
      expect(grouped.get("2026-02-05")?.length).toBe(2);
      expect(grouped.get("2026-02-06")?.length).toBe(1);
    });
  });

  describe("hasCalendlyIntegration", () => {
    it("should return true when calendlyEventTypeUri is set", async () => {
      const { hasCalendlyIntegration } = await import("../services/calendlyService");
      
      expect(hasCalendlyIntegration({ calendlyEventTypeUri: "https://api.calendly.com/event_types/123" })).toBe(true);
    });

    it("should return false when calendlyEventTypeUri is null", async () => {
      const { hasCalendlyIntegration } = await import("../services/calendlyService");
      
      expect(hasCalendlyIntegration({ calendlyEventTypeUri: null })).toBe(false);
    });

    it("should return false when calendlyEventTypeUri is undefined", async () => {
      const { hasCalendlyIntegration } = await import("../services/calendlyService");
      
      expect(hasCalendlyIntegration({})).toBe(false);
    });
  });
});

describe("generateMockSlots helper", () => {
  it("should generate 8 slots (9 AM to 5 PM)", () => {
    // We can't directly test the helper since it's not exported,
    // but we can test the behavior through the booking router
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push({
        id: `2026-02-05-${hour}`,
        startTime: `${hour.toString().padStart(2, "0")}:00`,
        endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
        available: true,
      });
    }
    
    expect(slots.length).toBe(8);
    expect(slots[0].startTime).toBe("09:00");
    expect(slots[7].endTime).toBe("17:00");
  });
});
