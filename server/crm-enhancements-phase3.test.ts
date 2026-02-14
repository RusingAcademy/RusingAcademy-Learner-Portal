import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{
            id: 1,
            opened: false,
            clicked: false,
          }])),
        })),
        innerJoin: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

// Mock email
vi.mock("./email", () => ({
  sendEmail: vi.fn(() => Promise.resolve()),
}));

describe("Email Tracking Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have email tracking functions defined", async () => {
    const tracking = await import("./email-tracking");
    
    expect(tracking.generateTrackingToken).toBeDefined();
    expect(tracking.createTrackingPixelUrl).toBeDefined();
    expect(tracking.createTrackedLinkUrl).toBeDefined();
    expect(tracking.generateTrackingPixelHtml).toBeDefined();
    expect(tracking.addLinkTracking).toBeDefined();
    expect(tracking.addEmailTracking).toBeDefined();
    expect(tracking.decodeTrackingToken).toBeDefined();
    expect(tracking.recordEmailOpen).toBeDefined();
    expect(tracking.recordEmailClick).toBeDefined();
    expect(tracking.getEmailTrackingStats).toBeDefined();
    expect(tracking.getTrackingPixelBuffer).toBeDefined();
  });

  it("should generate tracking token", async () => {
    const { generateTrackingToken } = await import("./email-tracking");
    
    const token = generateTrackingToken(123);
    
    expect(typeof token).toBe("string");
    expect(token.length).toBe(32);
  });

  it("should create tracking pixel URL", async () => {
    const { createTrackingPixelUrl } = await import("./email-tracking");
    
    const url = createTrackingPixelUrl(123, "https://example.com");
    
    expect(url).toContain("/api/track/open/");
    expect(url).toContain("https://example.com");
  });

  it("should create tracked link URL", async () => {
    const { createTrackedLinkUrl } = await import("./email-tracking");
    
    const url = createTrackedLinkUrl(123, "https://target.com/page", "https://example.com");
    
    expect(url).toContain("/api/track/click/");
    expect(url).toContain("https://example.com");
  });

  it("should generate tracking pixel HTML", async () => {
    const { generateTrackingPixelHtml } = await import("./email-tracking");
    
    const html = generateTrackingPixelHtml(123, "https://example.com");
    
    expect(html).toContain("<img");
    expect(html).toContain("width=\"1\"");
    expect(html).toContain("height=\"1\"");
    expect(html).toContain("display:none");
  });

  it("should add link tracking to HTML", async () => {
    const { addLinkTracking } = await import("./email-tracking");
    
    const html = '<a href="https://example.com/page">Click here</a>';
    const tracked = addLinkTracking(html, 123, "https://base.com");
    
    expect(tracked).toContain("/api/track/click/");
    expect(tracked).not.toContain("href=\"https://example.com/page\"");
  });

  it("should skip mailto links in tracking", async () => {
    const { addLinkTracking } = await import("./email-tracking");
    
    const html = '<a href="mailto:test@example.com">Email us</a>';
    const tracked = addLinkTracking(html, 123, "https://base.com");
    
    expect(tracked).toContain("mailto:test@example.com");
    expect(tracked).not.toContain("/api/track/click/");
  });

  it("should decode tracking token", async () => {
    const { decodeTrackingToken } = await import("./email-tracking");
    
    // Create a valid token
    const data = { logId: 123, type: "open" };
    const token = Buffer.from(JSON.stringify(data)).toString("base64url");
    
    const decoded = decodeTrackingToken(token);
    
    expect(decoded).toEqual({ logId: 123, type: "open" });
  });

  it("should return null for invalid token", async () => {
    const { decodeTrackingToken } = await import("./email-tracking");
    
    const decoded = decodeTrackingToken("invalid-token");
    
    expect(decoded).toBeNull();
  });

  it("should return tracking pixel buffer", async () => {
    const { getTrackingPixelBuffer } = await import("./email-tracking");
    
    const buffer = getTrackingPixelBuffer();
    
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });
});

describe("Outcome Reminder Cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have outcome reminder functions defined", async () => {
    const reminders = await import("./cron/outcome-reminders");
    
    expect(reminders.executeOutcomeRemindersCron).toBeDefined();
    expect(reminders.getOutcomeReminderSummary).toBeDefined();
  });

  it("should have correct function signatures", async () => {
    const reminders = await import("./cron/outcome-reminders");
    
    expect(typeof reminders.executeOutcomeRemindersCron).toBe("function");
    expect(typeof reminders.getOutcomeReminderSummary).toBe("function");
  });

  it("should return correct structure from executeOutcomeRemindersCron", async () => {
    const { executeOutcomeRemindersCron } = await import("./cron/outcome-reminders");
    
    const result = await executeOutcomeRemindersCron();
    
    expect(result).toHaveProperty("processed");
    expect(result).toHaveProperty("sent");
    expect(result).toHaveProperty("failed");
    expect(result).toHaveProperty("meetings");
    expect(typeof result.processed).toBe("number");
    expect(typeof result.sent).toBe("number");
    expect(typeof result.failed).toBe("number");
    expect(Array.isArray(result.meetings)).toBe(true);
  });

  it("should return correct structure from getOutcomeReminderSummary", async () => {
    const { getOutcomeReminderSummary } = await import("./cron/outcome-reminders");
    
    const summary = await getOutcomeReminderSummary();
    
    expect(summary).toHaveProperty("pendingCount");
    expect(summary).toHaveProperty("oldestPending");
    expect(summary).toHaveProperty("byOrganizer");
    expect(typeof summary.pendingCount).toBe("number");
    expect(Array.isArray(summary.byOrganizer)).toBe(true);
  });
});

describe("Admin Dashboard CRM Tab", () => {
  it("should have CRM components available", async () => {
    // These are client-side components, just verify they exist
    const fs = await import("fs");
    const path = await import("path");
    
    const sequenceAnalyticsPath = path.join(process.cwd(), "client/src/components/SequenceAnalyticsDashboard.tsx");
    const meetingOutcomesPath = path.join(process.cwd(), "client/src/components/MeetingOutcomesDashboard.tsx");
    
    expect(fs.existsSync(sequenceAnalyticsPath)).toBe(true);
    expect(fs.existsSync(meetingOutcomesPath)).toBe(true);
  });
});
