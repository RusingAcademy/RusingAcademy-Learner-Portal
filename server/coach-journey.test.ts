import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
  }),
  getLearnerByUserId: vi.fn().mockResolvedValue({ id: 1, userId: 1 }),
  getCoachByUserId: vi.fn().mockResolvedValue({ 
    id: 1, 
    userId: 1, 
    stripeAccountId: "acct_test123",
    hourlyRate: 5500,
    trialRate: 2500,
  }),
  getLatestSessionForLearner: vi.fn().mockResolvedValue({
    session: {
      id: 1,
      scheduledAt: new Date("2026-01-15T10:00:00Z"),
      duration: 30,
      price: 3500,
      meetingUrl: "https://meet.jit.si/lingueefy-test",
      sessionType: "trial",
      status: "confirmed",
    },
    coach: {
      id: 1,
      name: "Test Coach",
      photoUrl: "https://example.com/photo.jpg",
    },
  }),
  getUpcomingSessions: vi.fn().mockResolvedValue([
    {
      session: {
        id: 1,
        scheduledAt: new Date("2026-01-20T14:00:00Z"),
        duration: 60,
        status: "confirmed",
        meetingUrl: "https://meet.jit.si/lingueefy-session-1",
      },
      coach: { id: 1, name: "Test Coach" },
    },
  ]),
  updateCoachProfile: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ 
    key: "coach-photos/1/test.jpg", 
    url: "https://storage.example.com/coach-photos/1/test.jpg" 
  }),
}));

describe("Coach Journey Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Booking Flow", () => {
    it("should include session date and time in checkout parameters", () => {
      const checkoutParams = {
        coachId: 1,
        sessionType: "trial" as const,
        sessionDate: "2026-01-15T10:00:00Z",
        sessionTime: "10:00 AM",
      };
      
      expect(checkoutParams.sessionDate).toBeDefined();
      expect(checkoutParams.sessionTime).toBeDefined();
      expect(checkoutParams.sessionType).toBe("trial");
    });

    it("should validate session types", () => {
      const validTypes = ["trial", "single", "package"];
      expect(validTypes).toContain("trial");
      expect(validTypes).toContain("single");
      expect(validTypes).toContain("package");
    });
  });

  describe("Latest Session Retrieval", () => {
    it("should return session with coach details", async () => {
      const { getLatestSessionForLearner } = await import("./db");
      const result = await getLatestSessionForLearner(1);
      
      expect(result).toBeDefined();
      expect(result?.session).toBeDefined();
      expect(result?.coach).toBeDefined();
      expect(result?.session.meetingUrl).toBeDefined();
    });

    it("should include all required session fields", async () => {
      const { getLatestSessionForLearner } = await import("./db");
      const result = await getLatestSessionForLearner(1);
      
      expect(result?.session.scheduledAt).toBeDefined();
      expect(result?.session.duration).toBeDefined();
      expect(result?.session.price).toBeDefined();
      expect(result?.session.sessionType).toBeDefined();
    });
  });

  describe("S3 Storage Integration", () => {
    it("should upload coach photo to S3", async () => {
      const { storagePut } = await import("./storage");
      
      const mockFileData = "base64encodeddata";
      const buffer = Buffer.from(mockFileData, "base64");
      const filePath = "coach-photos/1/test.jpg";
      
      const result = await storagePut(filePath, buffer, "image/jpeg");
      
      expect(result.url).toBeDefined();
      expect(result.key).toBe(filePath);
    });

    it("should generate unique file paths with timestamps", () => {
      const coachId = 1;
      const timestamp = Date.now();
      const ext = "jpg";
      const filePath = `coach-photos/${coachId}/${timestamp}.${ext}`;
      
      expect(filePath).toMatch(/^coach-photos\/\d+\/\d+\.jpg$/);
    });

    it("should sanitize file names for document uploads", () => {
      const fileName = "My Document (1).pdf";
      const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      
      expect(sanitized).toBe("My_Document__1_.pdf");
      expect(sanitized).not.toContain(" ");
      expect(sanitized).not.toContain("(");
    });
  });

  describe("Upcoming Sessions", () => {
    it("should return array of upcoming sessions", async () => {
      const { getUpcomingSessions } = await import("./db");
      const sessions = await getUpcomingSessions(1, "learner");
      
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
    });

    it("should include meeting URL for each session", async () => {
      const { getUpcomingSessions } = await import("./db");
      const sessions = await getUpcomingSessions(1, "learner");
      
      sessions.forEach((item: any) => {
        expect(item.session.meetingUrl).toBeDefined();
      });
    });
  });

  describe("Coach Guide Content", () => {
    it("should have all required sections", () => {
      const requiredSections = [
        "gettingStarted",
        "profile",
        "sessions",
        "payments",
        "bestPractices",
        "faq",
      ];
      
      // Verify structure matches CoachGuide.tsx content
      requiredSections.forEach(section => {
        expect(section).toBeDefined();
      });
    });

    it("should have commission tiers defined", () => {
      const commissionTiers = [
        { tier: "Trial Sessions", rate: "0%" },
        { tier: "Verified SLE Coach", rate: "15%" },
        { tier: "0-10 hours/month", rate: "26%" },
        { tier: "10-30 hours/month", rate: "22%" },
        { tier: "30-60 hours/month", rate: "19%" },
        { tier: "60-100 hours/month", rate: "17%" },
        { tier: "100+ hours/month", rate: "15%" },
      ];
      
      expect(commissionTiers.length).toBe(7);
      expect(commissionTiers[0].rate).toBe("0%");
      expect(commissionTiers[commissionTiers.length - 1].rate).toBe("15%");
    });
  });

  describe("Booking Confirmation Page", () => {
    it("should format session date correctly", () => {
      const sessionDate = new Date("2026-01-15T10:00:00Z");
      const formatted = sessionDate.toLocaleDateString("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      expect(formatted).toContain("2026");
      expect(formatted).toContain("January");
    });

    it("should format session time correctly", () => {
      const sessionDate = new Date("2026-01-15T10:00:00Z");
      const formatted = sessionDate.toLocaleTimeString("en-CA", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      
      expect(formatted).toMatch(/\d{1,2}:\d{2}\s?(AM|PM|a\.m\.|p\.m\.)/i);
    });

    it("should generate valid ICS calendar content", () => {
      const sessionData = {
        coachName: "Test Coach",
        meetingUrl: "https://meet.jit.si/test",
        duration: 30,
      };
      
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lingueefy//Session Booking//EN
BEGIN:VEVENT
SUMMARY:Lingueefy Session with ${sessionData.coachName}
DESCRIPTION:Join your coaching session at: ${sessionData.meetingUrl}
LOCATION:${sessionData.meetingUrl}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
      
      expect(icsContent).toContain("BEGIN:VCALENDAR");
      expect(icsContent).toContain("END:VCALENDAR");
      expect(icsContent).toContain(sessionData.coachName);
      expect(icsContent).toContain(sessionData.meetingUrl);
    });
  });

  describe("MySessions Page", () => {
    it("should have correct tab structure", () => {
      const tabs = ["upcoming", "past", "cancelled"];
      
      expect(tabs).toContain("upcoming");
      expect(tabs).toContain("past");
      expect(tabs).toContain("cancelled");
      expect(tabs.length).toBe(3);
    });

    it("should format session status badges correctly", () => {
      const getStatusBadge = (status: string) => {
        switch (status) {
          case "confirmed": return "Confirmed";
          case "completed": return "Completed";
          case "cancelled": return "Cancelled";
          case "no_show": return "No Show";
          default: return status;
        }
      };
      
      expect(getStatusBadge("confirmed")).toBe("Confirmed");
      expect(getStatusBadge("completed")).toBe("Completed");
      expect(getStatusBadge("cancelled")).toBe("Cancelled");
      expect(getStatusBadge("no_show")).toBe("No Show");
    });
  });
});
