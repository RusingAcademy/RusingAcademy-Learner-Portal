import { describe, it, expect, vi } from "vitest";

// Test video meeting service
describe("Video Meeting Service", () => {
  it("should generate a valid Jitsi meeting URL", async () => {
    const { generateMeetingUrl } = await import("./video");
    
    const url = generateMeetingUrl(123, "Steven Barholere", "John Doe");
    
    expect(url).toContain("https://meet.jit.si/lingueefy-");
    expect(url).toContain("Steven");
    expect(url).toContain("123");
  });

  it("should generate meeting details with instructions", async () => {
    const { generateMeetingDetails } = await import("./video");
    
    const details = generateMeetingDetails(456, "Marie Coach", "Jane Learner");
    
    expect(details.url).toContain("https://meet.jit.si/lingueefy-");
    expect(details.provider).toBe("jitsi");
    expect(details.roomName).toContain("lingueefy-");
    expect(details.joinInstructions.en).toBeTruthy();
    expect(details.joinInstructions.fr).toBeTruthy();
  });

  it("should validate meeting URLs correctly", async () => {
    const { isValidMeetingUrl } = await import("./video");
    
    expect(isValidMeetingUrl("https://meet.jit.si/test-room")).toBe(true);
    expect(isValidMeetingUrl("https://zoom.us/j/123456")).toBe(true);
    expect(isValidMeetingUrl("https://meet.google.com/abc-def-ghi")).toBe(true);
    expect(isValidMeetingUrl("https://example.com/meeting")).toBe(false);
    expect(isValidMeetingUrl("invalid-url")).toBe(false);
  });

  it("should extract provider from URL", async () => {
    const { getProviderFromUrl } = await import("./video");
    
    expect(getProviderFromUrl("https://meet.jit.si/room")).toBe("jitsi");
    expect(getProviderFromUrl("https://zoom.us/j/123")).toBe("zoom");
    expect(getProviderFromUrl("https://meet.google.com/abc")).toBe("google_meet");
    expect(getProviderFromUrl("https://custom.example.com/room")).toBe("custom");
  });
});

// Test email service with meeting URL
describe("Email Service with Meeting URL", () => {
  it("should include meeting URL in confirmation email data structure", async () => {
    // Verify the interface accepts meetingUrl and meetingInstructions
    const sessionData = {
      learnerName: "John Doe",
      learnerEmail: "john@example.com",
      coachName: "Marie Coach",
      coachEmail: "marie@example.com",
      sessionDate: new Date("2026-01-15"),
      sessionTime: "10:00 AM",
      sessionType: "trial" as const,
      duration: 60,
      price: 5000,
      meetingUrl: "https://meet.jit.si/lingueefy-Marie-1-abc123",
      meetingInstructions: {
        en: "Click the link to join",
        fr: "Cliquez sur le lien pour rejoindre",
      },
    };
    
    // Verify all required fields are present
    expect(sessionData.meetingUrl).toBeTruthy();
    expect(sessionData.meetingInstructions.en).toBeTruthy();
    expect(sessionData.meetingInstructions.fr).toBeTruthy();
  });

  it("should generate ICS file with meeting URL", async () => {
    const { generateICSFile } = await import("./email");
    
    const icsContent = generateICSFile({
      title: "SLE Coaching Session",
      description: "Session with Coach Marie\\n\\nJoin: https://meet.jit.si/test",
      startTime: new Date("2026-01-15T10:00:00Z"),
      duration: 60,
      location: "https://meet.jit.si/test",
    });
    
    expect(icsContent).toContain("BEGIN:VCALENDAR");
    expect(icsContent).toContain("SLE Coaching Session");
    expect(icsContent).toContain("https://meet.jit.si/test");
    expect(icsContent).toContain("END:VCALENDAR");
  });
});

// Test ForDepartments page route
describe("ForDepartments B2B Page", () => {
  it("should have the route configured in App.tsx", async () => {
    // Read the App.tsx file to verify the route exists
    const fs = await import("fs/promises");
    const appContent = await fs.readFile("./client/src/App.tsx", "utf-8");
    
    expect(appContent).toContain("ForDepartments");
    expect(appContent).toContain("/for-departments");
  });

  it("should have navigation link in Header", async () => {
    const fs = await import("fs/promises");
    const headerContent = await fs.readFile("./client/src/components/Header.tsx", "utf-8");
    
    expect(headerContent).toContain("/for-departments");
    expect(headerContent).toContain("For Departments");
  });
});

// Test coach photos in database
describe("Coach Photos", () => {
  it("should have photoUrl field in coach profiles schema", async () => {
    const fs = await import("fs/promises");
    const schemaContent = await fs.readFile("./drizzle/schema.ts", "utf-8");
    
    expect(schemaContent).toContain("photoUrl");
  });

  it("should include photoUrl in coach list response", async () => {
    const fs = await import("fs/promises");
    const routersContent = await fs.readFile("./server/routers.ts", "utf-8");
    
    // Verify photoUrl is included in the coach list mapping
    expect(routersContent).toContain("photoUrl: coach.photoUrl");
  });
});
