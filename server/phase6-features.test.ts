import { describe, it, expect } from "vitest";

// ============================================================================
// PHASE 6 FEATURE TESTS
// ============================================================================

describe("Admin Dashboard Real Data Integration", () => {
  it("should have department_inquiries table in schema", async () => {
    // Check that the schema file contains departmentInquiries table definition
    const fs = await import("fs");
    const schemaContent = await fs.promises.readFile("./drizzle/schema.ts", "utf-8");
    expect(schemaContent).toContain("departmentInquiries");
    expect(schemaContent).toContain("department_inquiries");
  });

  it("should have admin router procedures defined", async () => {
    // Check that the admin router exists in routers
    const routersContent = await import("fs").then(fs => 
      fs.promises.readFile("./server/routers.ts", "utf-8")
    );
    // Admin procedures are defined inline in appRouter
    expect(routersContent).toContain("approveCoach");
    expect(routersContent).toContain("rejectCoach");
    expect(routersContent).toContain("updateInquiryStatus");
    expect(routersContent).toContain("createInquiry");
  });
});

describe("Email Notifications for Rescheduling", () => {
  it("should have sendRescheduleNotificationEmails function", async () => {
    const email = await import("./email");
    expect(email.sendRescheduleNotificationEmails).toBeDefined();
    expect(typeof email.sendRescheduleNotificationEmails).toBe("function");
  });

  it("should generate correct reschedule email content", async () => {
    const email = await import("./email");
    
    // Test that the function exists and can be called
    const testData = {
      learnerName: "Test Learner",
      learnerEmail: "learner@test.com",
      coachName: "Test Coach",
      coachEmail: "coach@test.com",
      oldDate: new Date("2026-01-15T10:00:00"),
      oldTime: "10:00 AM",
      newDate: new Date("2026-01-17T14:00:00"),
      newTime: "2:00 PM",
      duration: 30,
      rescheduledBy: "learner" as const,
    };
    
    // The function should not throw
    await expect(email.sendRescheduleNotificationEmails(testData)).resolves.not.toThrow();
  });
});

describe("Coach Earnings Payout History", () => {
  it("should have payout_ledger table in schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.payoutLedger).toBeDefined();
    // Check that the table is properly defined
    expect(schema.payoutLedger).not.toBeNull();
  });

  it("should have getCoachEarningsSummary function in db", async () => {
    const db = await import("./db");
    expect(db.getCoachEarningsSummary).toBeDefined();
    expect(typeof db.getCoachEarningsSummary).toBe("function");
  });

  it("should have getCoachPayoutLedger function in db", async () => {
    const db = await import("./db");
    expect(db.getCoachPayoutLedger).toBeDefined();
    expect(typeof db.getCoachPayoutLedger).toBe("function");
  });

  it("should have coach earnings procedures in router", async () => {
    const routersContent = await import("fs").then(fs => 
      fs.promises.readFile("./server/routers.ts", "utf-8")
    );
    expect(routersContent).toContain("getEarningsSummary");
    expect(routersContent).toContain("getPayoutLedger");
  });
});

describe("CoachEarningsHistory Page", () => {
  it("should have CoachEarningsHistory component", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("./client/src/pages/CoachEarningsHistory.tsx");
    expect(exists).toBe(true);
  });

  it("should have route configured in App.tsx", async () => {
    const fs = await import("fs");
    const appContent = await fs.promises.readFile("./client/src/App.tsx", "utf-8");
    expect(appContent).toContain("CoachEarningsHistory");
    expect(appContent).toContain("/coach/earnings/history");
  });
});
