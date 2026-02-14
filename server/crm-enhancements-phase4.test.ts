import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
        innerJoin: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        $returningId: vi.fn(() => Promise.resolve([{ id: 1 }])),
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

describe("Cron Setup Documentation", () => {
  it("should have cron setup documentation file", () => {
    const docPath = path.join(process.cwd(), "docs/cron-setup.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("should document outcome reminders endpoint", () => {
    const docPath = path.join(process.cwd(), "docs/cron-setup.md");
    const content = fs.readFileSync(docPath, "utf-8");
    
    expect(content).toContain("/api/cron/outcome-reminders");
    expect(content).toContain("Daily at 9 AM");
    expect(content).toContain("CRON_SECRET");
  });

  it("should include multiple deployment options", () => {
    const docPath = path.join(process.cwd(), "docs/cron-setup.md");
    const content = fs.readFileSync(docPath, "utf-8");
    
    expect(content).toContain("Vercel Cron");
    expect(content).toContain("External Cron Service");
    expect(content).toContain("Railway Cron");
    expect(content).toContain("GitHub Actions");
  });
});

describe("Email Tracking Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have email tracking imported in followup-sequences", () => {
    const filePath = path.join(process.cwd(), "server/followup-sequences-endpoints.ts");
    const content = fs.readFileSync(filePath, "utf-8");
    
    expect(content).toContain("import { addEmailTracking }");
    expect(content).toContain("from \"./email-tracking\"");
  });

  it("should use addEmailTracking in sequence email sending", () => {
    const filePath = path.join(process.cwd(), "server/followup-sequences-endpoints.ts");
    const content = fs.readFileSync(filePath, "utf-8");
    
    // The implementation uses addEmailTracking with additional options parameter
    expect(content).toContain("addEmailTracking(wrappedBody, emailLogId, baseUrl,");
  });

  it("should get email log ID before sending", () => {
    const filePath = path.join(process.cwd(), "server/followup-sequences-endpoints.ts");
    const content = fs.readFileSync(filePath, "utf-8");
    
    expect(content).toContain("$returningId()");
    expect(content).toContain("emailLogId");
  });

  it("should update log with sent timestamp after sending", () => {
    const filePath = path.join(process.cwd(), "server/followup-sequences-endpoints.ts");
    const content = fs.readFileSync(filePath, "utf-8");
    
    expect(content).toContain("sentAt: new Date()");
  });
});

describe("CRM Dashboard Widget", () => {
  it("should have CRM dashboard widget component", () => {
    const componentPath = path.join(process.cwd(), "client/src/components/CRMDashboardWidget.tsx");
    expect(fs.existsSync(componentPath)).toBe(true);
  });

  it("should include sequence analytics data", () => {
    const componentPath = path.join(process.cwd(), "client/src/components/CRMDashboardWidget.tsx");
    const content = fs.readFileSync(componentPath, "utf-8");
    
    expect(content).toContain("getOverallSequenceAnalytics");
    expect(content).toContain("averageOpenRate");
    expect(content).toContain("averageClickRate");
  });

  it("should include outcome stats data", () => {
    const componentPath = path.join(process.cwd(), "client/src/components/CRMDashboardWidget.tsx");
    const content = fs.readFileSync(componentPath, "utf-8");
    
    expect(content).toContain("getOutcomeStats");
    expect(content).toContain("conversionRate");
    expect(content).toContain("qualifiedLeads");
  });

  it("should include pending meetings alert", () => {
    const componentPath = path.join(process.cwd(), "client/src/components/CRMDashboardWidget.tsx");
    const content = fs.readFileSync(componentPath, "utf-8");
    
    expect(content).toContain("getPendingOutcomeMeetings");
    expect(content).toContain("pendingMeetings.length");
    expect(content).toContain("needsAttention");
  });

  it("should have navigation to CRM tab", () => {
    const componentPath = path.join(process.cwd(), "client/src/components/CRMDashboardWidget.tsx");
    const content = fs.readFileSync(componentPath, "utf-8");
    
    expect(content).toContain("onNavigateToCRM");
    expect(content).toContain("viewDetails");
  });

  it("should be imported in AdminDashboard", () => {
    const dashboardPath = path.join(process.cwd(), "client/src/pages/AdminDashboard.tsx");
    const content = fs.readFileSync(dashboardPath, "utf-8");
    
    expect(content).toContain("import CRMDashboardWidget");
    expect(content).toContain("<CRMDashboardWidget");
  });

  it("should be rendered in overview tab", () => {
    const dashboardPath = path.join(process.cwd(), "client/src/pages/AdminDashboard.tsx");
    const content = fs.readFileSync(dashboardPath, "utf-8");
    
    expect(content).toContain("CRMDashboardWidget onNavigateToCRM");
    expect(content).toContain('setActiveTab("crm")');
  });
});

describe("Bilingual Support", () => {
  it("should have English and French labels in CRM widget", () => {
    const componentPath = path.join(process.cwd(), "client/src/components/CRMDashboardWidget.tsx");
    const content = fs.readFileSync(componentPath, "utf-8");
    
    expect(content).toContain("en: {");
    expect(content).toContain("fr: {");
    expect(content).toContain("CRM Overview");
    expect(content).toContain("Aperçu CRM");
  });
});
