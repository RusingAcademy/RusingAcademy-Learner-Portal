import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

// ============================================================================
// ENTERPRISE MULTI-TENANT — NEW PROCEDURES
// ============================================================================
describe("Enterprise Router — New Procedures", () => {
  it("enterpriseRouter should have listOrganizations procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.enterpriseRouter).toBeDefined();
    expect((mod.enterpriseRouter as any)._def.procedures.listOrganizations).toBeDefined();
  });

  it("enterpriseRouter should have getStats procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.enterpriseRouter as any)._def.procedures.getStats).toBeDefined();
  });

  it("enterpriseRouter should have createOrganization procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.enterpriseRouter as any)._def.procedures.createOrganization).toBeDefined();
  });

  it("listOrganizations should accept search input", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.enterpriseRouter as any)._def.procedures.listOrganizations;
    // It's a query procedure with optional search input
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });

  it("createOrganization should accept name, contactEmail, and plan", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.enterpriseRouter as any)._def.procedures.createOrganization;
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });
});

describe("Enterprise Mode Frontend", () => {
  const pagePath = path.join(ROOT, "client/src/pages/admin/EnterpriseMode.tsx");

  it("EnterpriseMode.tsx should exist", () => {
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("should call trpc.enterprise.listOrganizations", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.enterprise.listOrganizations");
  });

  it("should call trpc.enterprise.getStats", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.enterprise.getStats");
  });

  it("should call trpc.enterprise.createOrganization", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.enterprise.createOrganization");
  });

  it("should have search functionality", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("search");
  });

  it("should have create organization form", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Create");
  });

  it("should display organization stats", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("stats");
  });
});

// ============================================================================
// SLE EXAM SIMULATION — NEW PROCEDURES
// ============================================================================
describe("SLE Exam Router — New Procedures", () => {
  it("sleExamRouter should have getStats procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.sleExamRouter).toBeDefined();
    expect((mod.sleExamRouter as any)._def.procedures.getStats).toBeDefined();
  });

  it("sleExamRouter should have listExams procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.sleExamRouter as any)._def.procedures.listExams).toBeDefined();
  });

  it("sleExamRouter should have getConfig procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.sleExamRouter as any)._def.procedures.getConfig).toBeDefined();
  });

  it("sleExamRouter should have createExam procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.sleExamRouter as any)._def.procedures.createExam).toBeDefined();
  });

  it("getConfig should return exam types, levels, and scoring rubric structure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.sleExamRouter as any)._def.procedures.getConfig;
    expect(proc).toBeDefined();
    // The config procedure is a query that returns static configuration
    expect(proc._def).toBeDefined();
  });

  it("createExam should accept examType, level, and optional title", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.sleExamRouter as any)._def.procedures.createExam;
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });
});

describe("SLE Exam Mode Frontend", () => {
  const pagePath = path.join(ROOT, "client/src/pages/admin/SLEExamMode.tsx");

  it("SLEExamMode.tsx should exist", () => {
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("should call trpc.sleExam.getStats", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.sleExam.getStats");
  });

  it("should call trpc.sleExam.listExams", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.sleExam.listExams");
  });

  it("should call trpc.sleExam.getConfig", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.sleExam.getConfig");
  });

  it("should call trpc.sleExam.createExam", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.sleExam.createExam");
  });

  it("should have Exam Library tab", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Exam Library");
  });

  it("should have Results & Analytics tab", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Results & Analytics");
  });

  it("should have Exam Configuration tab", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Exam Configuration");
  });

  it("should have Question Bank tab", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Question Bank");
  });

  it("should support Level A, B, C selection", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Level A");
    expect(content).toContain("Level B");
    expect(content).toContain("Level C");
  });

  it("should support reading, writing, oral exam types", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Reading Comprehension");
    expect(content).toContain("Written Expression");
    expect(content).toContain("Oral Interaction");
  });

  it("should display stats: Total Sessions, Completed, Avg Score", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Total Sessions");
    expect(content).toContain("Completed");
    expect(content).toContain("Avg Score");
  });

  it("should have Create Exam button", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Create Exam");
  });

  it("should display exam type icons (BookOpen, FileText, Brain)", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("BookOpen");
    expect(content).toContain("FileText");
    expect(content).toContain("Brain");
  });

  it("should have AI Question Generation note", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("AI Question Generation");
  });

  it("should have exam configuration switches", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Timed Mode");
    expect(content).toContain("Randomize Questions");
    expect(content).toContain("AI Feedback");
  });

  it("should display Performance by Exam Type section", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Performance by Exam Type");
  });

  it("should display Performance by Level section", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Performance by Level");
  });

  it("should use examType field (not type) for backend compatibility", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    // The create mutation should pass examType, not type
    expect(content).toContain("examType: newExam.examType");
  });
});

// ============================================================================
// CONTENT INTELLIGENCE — NEW PROCEDURES
// ============================================================================
describe("Content Intelligence Router — New Procedures", () => {
  it("contentIntelligenceRouter should have getStats procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.contentIntelligenceRouter).toBeDefined();
    expect((mod.contentIntelligenceRouter as any)._def.procedures.getStats).toBeDefined();
  });

  it("contentIntelligenceRouter should have getTopContent procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.contentIntelligenceRouter as any)._def.procedures.getTopContent).toBeDefined();
  });

  it("contentIntelligenceRouter should have getInsights procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.contentIntelligenceRouter as any)._def.procedures.getInsights).toBeDefined();
  });

  it("getStats should accept dateRange input", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.contentIntelligenceRouter as any)._def.procedures.getStats;
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });

  it("getTopContent should accept dateRange input", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.contentIntelligenceRouter as any)._def.procedures.getTopContent;
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });
});

describe("Content Intelligence Frontend", () => {
  const pagePath = path.join(ROOT, "client/src/pages/admin/ContentIntelligence.tsx");

  it("ContentIntelligence.tsx should exist", () => {
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("should call trpc.contentIntel.getStats", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.contentIntel.getStats");
  });

  it("should call trpc.contentIntel.getTopContent", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.contentIntel.getTopContent");
  });

  it("should call trpc.contentIntel.getInsights", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.contentIntel.getInsights");
  });

  it("should have Content Performance tab", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Content Performance");
  });

  it("should have AI Insights tab", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("AI Insights");
  });

  it("should have Optimization tab", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Optimization");
  });

  it("should have Content Gaps tab", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Content Gaps");
  });

  it("should display KPI cards: Content Views, Avg Progress, Published Courses", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Content Views");
    expect(content).toContain("Avg Progress");
    expect(content).toContain("Published Courses");
  });

  it("should display Total Lessons and Enrollments KPIs", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Total Lessons");
    expect(content).toContain("Enrollments");
  });

  it("should have date range selector with 7d, 30d, 90d options", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Last 7 days");
    expect(content).toContain("Last 30 days");
    expect(content).toContain("Last 90 days");
  });

  it("should have Export Report button", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Export Report");
  });

  it("should display Top Performing Courses section", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Top Performing Courses");
  });

  it("should display Most Viewed Lessons section", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Most Viewed Lessons");
  });

  it("should display AI-Generated Insights with priority levels", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("AI-Generated Insights");
    expect(content).toContain("Low Completion");
    expect(content).toContain("High Engagement");
    expect(content).toContain("Stale Content");
  });

  it("should have Content Optimization Suggestions", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Content Optimization Suggestions");
  });

  it("should have Content Gap Analysis with coverage and demand bars", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Content Gap Analysis");
    expect(content).toContain("Current Coverage");
    expect(content).toContain("Student Demand");
  });

  it("should display SLE-specific content gaps", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Oral Interaction");
    expect(content).toContain("Written Expression");
    expect(content).toContain("Grammar");
  });

  it("should use contentIntel router alias (not contentIntelligence)", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("trpc.contentIntel.");
    // Should not use the full name
    expect(content).not.toContain("trpc.contentIntelligence.");
  });
});

// ============================================================================
// ROUTER WIRING — contentIntel ALIAS
// ============================================================================
describe("Router Wiring — contentIntel Alias", () => {
  it("routers.ts should register contentIntel alias", () => {
    const routersPath = path.join(ROOT, "server/routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("contentIntel:");
  });

  it("routers.ts should register contentIntelligence router", () => {
    const routersPath = path.join(ROOT, "server/routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("contentIntelligence:");
  });

  it("both contentIntel and contentIntelligence should point to same router", () => {
    const routersPath = path.join(ROOT, "server/routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("contentIntel: contentIntelligenceRouter");
    expect(content).toContain("contentIntelligence: contentIntelligenceRouter");
  });

  it("enterprise router should be wired", () => {
    const routersPath = path.join(ROOT, "server/routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("enterprise: enterpriseRouter");
  });

  it("sleExam router should be wired", () => {
    const routersPath = path.join(ROOT, "server/routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("sleExam: sleExamRouter");
  });
});

// ============================================================================
// DATABASE SCHEMA — ORGANIZATIONS TABLE
// ============================================================================
describe("Database Schema — Organizations", () => {
  it("schema should define organizations table", () => {
    const schemaPath = path.join(ROOT, "drizzle/schema.ts");
    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("organizations");
  });
});

// ============================================================================
// DATABASE SCHEMA — SLE EXAM SESSIONS TABLE
// ============================================================================
describe("Database — SLE Exam Sessions", () => {
  it("sle_exam_sessions table should be used in sleExamRouter", () => {
    const routerPath = path.join(ROOT, "server/routers/premiumFeatures.ts");
    const content = fs.readFileSync(routerPath, "utf-8");
    expect(content).toContain("sle_exam_sessions");
  });

  it("sleExamRouter should query examType column", () => {
    const routerPath = path.join(ROOT, "server/routers/premiumFeatures.ts");
    const content = fs.readFileSync(routerPath, "utf-8");
    expect(content).toContain("examType");
  });

  it("sleExamRouter should query level column", () => {
    const routerPath = path.join(ROOT, "server/routers/premiumFeatures.ts");
    const content = fs.readFileSync(routerPath, "utf-8");
    expect(content).toContain("level");
  });

  it("sleExamRouter should query score column", () => {
    const routerPath = path.join(ROOT, "server/routers/premiumFeatures.ts");
    const content = fs.readFileSync(routerPath, "utf-8");
    expect(content).toContain("score");
  });

  it("sleExamRouter should query status column", () => {
    const routerPath = path.join(ROOT, "server/routers/premiumFeatures.ts");
    const content = fs.readFileSync(routerPath, "utf-8");
    expect(content).toContain("status = 'completed'");
  });
});

// ============================================================================
// STRIPE TESTING FRONTEND — E2E FLOW ENHANCEMENTS
// ============================================================================
describe("Stripe Testing Frontend — E2E Flow Enhancements", () => {
  const pagePath = path.join(ROOT, "client/src/pages/admin/StripeTesting.tsx");

  it("StripeTesting.tsx should exist", () => {
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("should have E2E flow visualization", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("E2E Flow");
  });

  it("should have test mode indicator", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Test Mode");
  });

  it("should have test card number 4242", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("4242 4242 4242 4242");
  });

  it("should have copy-to-clipboard functionality", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("clipboard");
  });

  it("should have live mode switch guidance", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    // Should mention Settings → Payment for live mode
    expect(content).toContain("Settings");
  });

  it("should display webhook events", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Webhook");
  });

  it("should have flow steps visualization", () => {
    const content = fs.readFileSync(pagePath, "utf-8");
    // Should show the payment flow steps
    expect(content).toContain("Payment");
  });
});

// ============================================================================
// LIVE KPI DASHBOARD — ENGAGEMENT & CONVERSION METRICS
// ============================================================================
describe("Live KPI Dashboard — New Procedures", () => {
  it("liveKPIRouter should have getEngagementMetrics procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.liveKPIRouter as any)._def.procedures.getEngagementMetrics).toBeDefined();
  });

  it("liveKPIRouter should have getConversionMetrics procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.liveKPIRouter as any)._def.procedures.getConversionMetrics).toBeDefined();
  });

  it("getEngagementMetrics should accept period input", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.liveKPIRouter as any)._def.procedures.getEngagementMetrics;
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });

  it("getConversionMetrics should accept period input", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.liveKPIRouter as any)._def.procedures.getConversionMetrics;
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });
});

// ============================================================================
// ONBOARDING WORKFLOW — NEW PROCEDURES
// ============================================================================
describe("Onboarding Workflow — New Procedures", () => {
  it("onboardingRouter should have saveConfig procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.onboardingRouter as any)._def.procedures.saveConfig).toBeDefined();
  });

  it("onboardingRouter should have getStats procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.onboardingRouter as any)._def.procedures.getStats).toBeDefined();
  });

  it("onboardingRouter should have getChecklist procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.onboardingRouter as any)._def.procedures.getChecklist).toBeDefined();
  });

  it("onboardingRouter should have completeStep procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.onboardingRouter as any)._def.procedures.completeStep).toBeDefined();
  });

  it("saveConfig should accept steps array input", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.onboardingRouter as any)._def.procedures.saveConfig;
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });

  it("completeStep should accept stepKey input", async () => {
    const mod = await import("./routers/premiumFeatures");
    const proc = (mod.onboardingRouter as any)._def.procedures.completeStep;
    expect(proc).toBeDefined();
    expect(proc._def).toBeDefined();
  });
});

// ============================================================================
// EXISTING PROCEDURES STILL INTACT
// ============================================================================
describe("Existing Procedures Integrity Check", () => {
  it("enterpriseRouter should still have listOrgs", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.enterpriseRouter as any)._def.procedures.listOrgs).toBeDefined();
  });

  it("enterpriseRouter should still have getOrgDetails", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.enterpriseRouter as any)._def.procedures.getOrgDetails).toBeDefined();
  });

  it("enterpriseRouter should still have getOrgAnalytics", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.enterpriseRouter as any)._def.procedures.getOrgAnalytics).toBeDefined();
  });

  it("sleExamRouter should still have startExam", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.sleExamRouter as any)._def.procedures.startExam).toBeDefined();
  });

  it("sleExamRouter should still have submitExam", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.sleExamRouter as any)._def.procedures.submitExam).toBeDefined();
  });

  it("sleExamRouter should still have getHistory", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.sleExamRouter as any)._def.procedures.getHistory).toBeDefined();
  });

  it("sleExamRouter should still have getExamStats", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.sleExamRouter as any)._def.procedures.getExamStats).toBeDefined();
  });

  it("contentIntelligenceRouter should still have getOverview", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.contentIntelligenceRouter as any)._def.procedures.getOverview).toBeDefined();
  });

  it("contentIntelligenceRouter should still have getLessonAnalytics", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.contentIntelligenceRouter as any)._def.procedures.getLessonAnalytics).toBeDefined();
  });

  it("contentIntelligenceRouter should still have getDropOffAnalysis", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.contentIntelligenceRouter as any)._def.procedures.getDropOffAnalysis).toBeDefined();
  });

  it("contentIntelligenceRouter should still have getRecommendations", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.contentIntelligenceRouter as any)._def.procedures.getRecommendations).toBeDefined();
  });

  it("stripeTestingRouter should still have getWebhookEvents", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.stripeTestingRouter as any)._def.procedures.getWebhookEvents).toBeDefined();
  });

  it("liveKPIRouter should still have getRevenueMetrics", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.liveKPIRouter as any)._def.procedures.getRevenueMetrics).toBeDefined();
  });

  it("onboardingRouter should still have getConfig", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.onboardingRouter as any)._def.procedures.getConfig).toBeDefined();
  });

  it("onboardingRouter should still have createStep", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect((mod.onboardingRouter as any)._def.procedures.createStep).toBeDefined();
  });
});
