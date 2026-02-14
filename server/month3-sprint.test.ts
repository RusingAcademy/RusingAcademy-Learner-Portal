/**
 * Month 3 Sprint Test Suite
 *
 * Tests for:
 * 1. Stripe Live Testing Flow — stripeTestingRouter procedures
 * 2. Live KPI Dashboard — liveKPIRouter procedures (revenue, engagement, conversion)
 * 3. Onboarding Workflow — onboardingRouter procedures (config, stats, checklist)
 * 4. StripeTesting Frontend — E2E flow visualization, test mode indicator
 * 5. LiveKPIDashboard Frontend — sparklines, system health, AI metrics
 * 6. OnboardingWorkflow Frontend — visual builder, email templates, history
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// ============================================================================
// 1. STRIPE TESTING ROUTER
// ============================================================================

describe("Stripe Testing Router", () => {
  it("should export stripeTestingRouter from premiumFeatures", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.stripeTestingRouter).toBeDefined();
    expect(typeof mod.stripeTestingRouter).toBe("object");
  });

  it("stripeTestingRouter should have getWebhookEvents procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.stripeTestingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getWebhookEvents).toBeDefined();
  });

  it("stripeTestingRouter should have getWebhookStats procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.stripeTestingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getWebhookStats).toBeDefined();
  });

  it("stripeTestingRouter should have getTestInstructions procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.stripeTestingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getTestInstructions).toBeDefined();
  });
});

// ============================================================================
// 2. LIVE KPI DASHBOARD ROUTER
// ============================================================================

describe("Live KPI Router", () => {
  it("should export liveKPIRouter from premiumFeatures", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.liveKPIRouter).toBeDefined();
    expect(typeof mod.liveKPIRouter).toBe("object");
  });

  it("liveKPIRouter should have getRevenueMetrics procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.liveKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getRevenueMetrics).toBeDefined();
  });

  it("liveKPIRouter should have getConversionFunnel procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.liveKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getConversionFunnel).toBeDefined();
  });

  it("liveKPIRouter should have getAIEngagement procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.liveKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getAIEngagement).toBeDefined();
  });

  it("liveKPIRouter should have getEngagementMetrics procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.liveKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getEngagementMetrics).toBeDefined();
  });

  it("liveKPIRouter should have getConversionMetrics procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.liveKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getConversionMetrics).toBeDefined();
  });

  it("liveKPIRouter should have getPlatformHealth procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.liveKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getPlatformHealth).toBeDefined();
  });
});

// ============================================================================
// 3. ONBOARDING WORKFLOW ROUTER
// ============================================================================

describe("Onboarding Router", () => {
  it("should export onboardingRouter from premiumFeatures", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.onboardingRouter).toBeDefined();
    expect(typeof mod.onboardingRouter).toBe("object");
  });

  it("onboardingRouter should have getConfig procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.onboardingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getConfig).toBeDefined();
  });

  it("onboardingRouter should have updateStep procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.onboardingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.updateStep).toBeDefined();
  });

  it("onboardingRouter should have createStep procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.onboardingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.createStep).toBeDefined();
  });

  it("onboardingRouter should have deleteStep procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.onboardingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.deleteStep).toBeDefined();
  });

  it("onboardingRouter should have saveConfig procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.onboardingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.saveConfig).toBeDefined();
  });

  it("onboardingRouter should have getStats procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.onboardingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getStats).toBeDefined();
  });

  it("onboardingRouter should have getChecklist procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.onboardingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getChecklist).toBeDefined();
  });

  it("onboardingRouter should have completeStep procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.onboardingRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.completeStep).toBeDefined();
  });
});

// ============================================================================
// 4. ENTERPRISE ROUTER
// ============================================================================

describe("Enterprise Router", () => {
  it("should export enterpriseRouter from premiumFeatures", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.enterpriseRouter).toBeDefined();
    expect(typeof mod.enterpriseRouter).toBe("object");
  });

  it("enterpriseRouter should have listOrgs procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.enterpriseRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.listOrgs).toBeDefined();
  });

  it("enterpriseRouter should have getOrgDetails procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.enterpriseRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getOrgDetails).toBeDefined();
  });

  it("enterpriseRouter should have inviteMember procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.enterpriseRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.inviteMember).toBeDefined();
  });

  it("enterpriseRouter should have assignCourse procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.enterpriseRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.assignCourse).toBeDefined();
  });

  it("enterpriseRouter should have getOrgAnalytics procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.enterpriseRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getOrgAnalytics).toBeDefined();
  });
});

// ============================================================================
// 5. SLE EXAM ROUTER
// ============================================================================

describe("SLE Exam Router", () => {
  it("should export sleExamRouter from premiumFeatures", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.sleExamRouter).toBeDefined();
    expect(typeof mod.sleExamRouter).toBe("object");
  });

  it("sleExamRouter should have startExam procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.sleExamRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.startExam).toBeDefined();
  });

  it("sleExamRouter should have submitExam procedure", async () => {
    const mod = await import("./routers/premiumFeatures");
    const router = mod.sleExamRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.submitExam).toBeDefined();
  });
});

// ============================================================================
// 6. CONTENT INTELLIGENCE ROUTER
// ============================================================================

describe("Content Intelligence Router", () => {
  it("should export contentIntelligenceRouter from premiumFeatures", async () => {
    const mod = await import("./routers/premiumFeatures");
    expect(mod.contentIntelligenceRouter).toBeDefined();
    expect(typeof mod.contentIntelligenceRouter).toBe("object");
  });
});

// ============================================================================
// 7. STRIPE KPI DATA ROUTER
// ============================================================================

describe("Stripe KPI Data Router", () => {
  it("should export stripeKPIRouter from stripeKPIData", async () => {
    const mod = await import("./routers/stripeKPIData");
    expect(mod.stripeKPIRouter).toBeDefined();
    expect(typeof mod.stripeKPIRouter).toBe("object");
  });

  it("stripeKPIRouter should have getStripeRevenue procedure", async () => {
    const mod = await import("./routers/stripeKPIData");
    const router = mod.stripeKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getStripeRevenue).toBeDefined();
  });

  it("stripeKPIRouter should have getUserAnalytics procedure", async () => {
    const mod = await import("./routers/stripeKPIData");
    const router = mod.stripeKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getUserAnalytics).toBeDefined();
  });

  it("stripeKPIRouter should have getAIMetrics procedure", async () => {
    const mod = await import("./routers/stripeKPIData");
    const router = mod.stripeKPIRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getAIMetrics).toBeDefined();
  });
});

// ============================================================================
// 8. ADMIN STABILITY ROUTER
// ============================================================================

describe("Admin Stability Router", () => {
  it("should export adminStabilityRouter from adminStability", async () => {
    const mod = await import("./routers/adminStability");
    expect(mod.adminStabilityRouter).toBeDefined();
    expect(typeof mod.adminStabilityRouter).toBe("object");
  });

  it("adminStabilityRouter should have getWebhookStats procedure", async () => {
    const mod = await import("./routers/adminStability");
    const router = mod.adminStabilityRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getWebhookStats).toBeDefined();
  });

  it("adminStabilityRouter should have getPipelineHealth procedure", async () => {
    const mod = await import("./routers/adminStability");
    const router = mod.adminStabilityRouter as any;
    const procedures = router._def?.procedures ?? router._def?.record ?? {};
    expect(procedures.getPipelineHealth).toBeDefined();
  });
});

// ============================================================================
// 9. STRIPE TESTING FRONTEND — E2E FLOW & TEST MODE INDICATOR
// ============================================================================

describe("StripeTesting Frontend", () => {
  const filePath = path.resolve(__dirname, "../client/src/pages/admin/StripeTesting.tsx");

  it("StripeTesting.tsx should exist", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should import trpc for data fetching", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('import { trpc }');
  });

  it("should use trpc.stripeTesting.getWebhookStats", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.stripeTesting.getWebhookStats");
  });

  it("should use trpc.stripeTesting.getWebhookEvents", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.stripeTesting.getWebhookEvents");
  });

  it("should use trpc.stripeTesting.getTestInstructions", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.stripeTesting.getTestInstructions");
  });

  it("should have a Test Mode indicator badge", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Test Mode");
  });

  it("should have a Live Mode indicator badge", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Live Mode");
  });

  it("should have an E2E Flow tab", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("E2E Flow");
  });

  it("should have E2E flow steps: Payment, Webhook, Analytics, Notification, Funnel", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Payment");
    expect(content).toContain("Webhook");
    expect(content).toContain("Analytics");
    expect(content).toContain("Notification");
    expect(content).toContain("Funnel Update");
  });

  it("should have FlowStep component for E2E visualization", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("FlowStep");
  });

  it("should have test card numbers for successful, declined, and 3D Secure", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("4242 4242 4242 4242");
    expect(content).toContain("4000 0000 0000 0002");
    expect(content).toContain("4000 0000 0000 3220");
  });

  it("should have a 'Switch to Live' guide section", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Switching to Live Mode");
  });

  it("should have integration checklist with idempotency protection", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Idempotency protection");
  });

  it("should have test mode banner with Settings → Payment guidance", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Settings → Payment");
  });

  it("should have StatusBadge component for webhook event statuses", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("StatusBadge");
    expect(content).toContain("processed");
    expect(content).toContain("failed");
  });

  it("should have copy-to-clipboard functionality", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("copyToClipboard");
    expect(content).toContain("navigator.clipboard");
  });

  it("should have webhook events log with empty state", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("No webhook events yet");
    expect(content).toContain("Make a test payment");
  });
});

// ============================================================================
// 10. LIVE KPI DASHBOARD FRONTEND
// ============================================================================

describe("LiveKPIDashboard Frontend", () => {
  const filePath = path.resolve(__dirname, "../client/src/pages/admin/LiveKPIDashboard.tsx");

  it("LiveKPIDashboard.tsx should exist", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should import trpc for data fetching", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('import { trpc }');
  });

  it("should use trpc.liveKPI.getRevenueMetrics", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.liveKPI.getRevenueMetrics");
  });

  it("should use trpc.liveKPI.getEngagementMetrics", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.liveKPI.getEngagementMetrics");
  });

  it("should use trpc.liveKPI.getConversionMetrics", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.liveKPI.getConversionMetrics");
  });

  it("should use trpc.stripeKPI.getStripeRevenue for real Stripe data", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.stripeKPI.getStripeRevenue");
  });

  it("should use trpc.stripeKPI.getUserAnalytics", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.stripeKPI.getUserAnalytics");
  });

  it("should use trpc.stripeKPI.getAIMetrics", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.stripeKPI.getAIMetrics");
  });

  it("should use trpc.adminStability.getWebhookStats", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.adminStability.getWebhookStats");
  });

  it("should use trpc.adminStability.getPipelineHealth", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.adminStability.getPipelineHealth");
  });

  it("should have System Health section with webhook stats", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("System Health");
    expect(content).toContain("Stripe Webhooks");
  });

  it("should have AI Pipeline Health section with StatusIndicator", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("AI Pipeline Health");
    expect(content).toContain("StatusIndicator");
  });

  it("should have sparkline chart for daily revenue", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("sparkline");
    expect(content).toContain("Daily Revenue");
  });

  it("should have revenue section with today, week, month metrics", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Today Revenue");
    expect(content).toContain("Week Revenue");
    expect(content).toContain("Month Revenue");
  });

  it("should have conversion funnel with progress bars", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Conversion Funnel");
    expect(content).toContain("Visitors → Signups");
    expect(content).toContain("Signups → Enrollments");
    expect(content).toContain("Enrollments → Payments");
  });

  it("should have auto-refresh toggle with interval selector", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("autoRefresh");
    expect(content).toContain("refreshInterval");
    expect(content).toContain("setInterval");
  });

  it("should have period selector (24h, 7d, 30d, 90d)", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('"24h"');
    expect(content).toContain('"7d"');
    expect(content).toContain('"30d"');
    expect(content).toContain('"90d"');
  });

  it("should have MetricCard component for consistent metric display", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("MetricCard");
  });

  it("should have ProgressBar component for conversion funnel", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("ProgressBar");
  });

  it("should have Users & Enrollments section", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Users & Enrollments");
    expect(content).toContain("Total Users");
    expect(content).toContain("Active Enrollments");
  });

  it("should have AI Pipeline Metrics section", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("AI Pipeline Metrics");
    expect(content).toContain("Pipeline Success Rate");
    expect(content).toContain("Avg Latency");
  });

  it("should have Live Activity feed", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Live Activity");
    expect(content).toContain("recentActivity");
  });

  it("should have stage icons mapping for AI pipeline stages", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("STAGE_ICONS");
    expect(content).toContain("transcription");
    expect(content).toContain("evaluation");
    expect(content).toContain("coaching_response");
    expect(content).toContain("tts_synthesis");
  });

  it("should have role distribution display", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("roleDistribution");
    expect(content).toContain("User Role Distribution");
  });
});

// ============================================================================
// 11. ONBOARDING WORKFLOW FRONTEND
// ============================================================================

describe("OnboardingWorkflow Frontend", () => {
  const filePath = path.resolve(__dirname, "../client/src/pages/admin/OnboardingWorkflow.tsx");

  it("OnboardingWorkflow.tsx should exist", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should import trpc for data fetching", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('import { trpc }');
  });

  it("should use trpc.onboarding.getConfig", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.onboarding.getConfig");
  });

  it("should use trpc.onboarding.getStats", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.onboarding.getStats");
  });

  it("should use trpc.onboarding.saveConfig mutation", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("trpc.onboarding.saveConfig.useMutation");
  });

  it("should have workflow steps with default steps defined", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("DEFAULT_STEPS");
    expect(content).toContain("Welcome Email");
    expect(content).toContain("Admin Notification");
    expect(content).toContain("Assign Free Starter Course");
  });

  it("should have step type icons mapping", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("STEP_ICONS");
    expect(content).toContain("email");
    expect(content).toContain("notification");
    expect(content).toContain("course_assign");
    expect(content).toContain("delay");
    expect(content).toContain("tag");
  });

  it("should have step color mapping", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("STEP_COLORS");
  });

  it("should have visual workflow builder with trigger and end nodes", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Trigger: New User Signup");
    expect(content).toContain("Onboarding Complete");
  });

  it("should have add step buttons for all step types", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('addStep("email")');
    expect(content).toContain('addStep("notification")');
    expect(content).toContain('addStep("course_assign")');
    expect(content).toContain('addStep("delay")');
    expect(content).toContain('addStep("tag")');
  });

  it("should have toggle and remove step functionality", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("toggleStep");
    expect(content).toContain("removeStep");
  });

  it("should have inline editing for step titles", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("editingStep");
    expect(content).toContain("setEditingStep");
  });

  it("should have active/paused toggle for workflow", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("isActive");
    expect(content).toContain("setIsActive");
    expect(content).toContain("Active");
    expect(content).toContain("Paused");
  });

  it("should have stats cards: Total Onboarded, This Week, Completion Rate, Avg Time", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Total Onboarded");
    expect(content).toContain("This Week");
    expect(content).toContain("Completion Rate");
    expect(content).toContain("Avg Time to Complete");
  });

  it("should have tabs: Workflow Steps, Email Templates, Onboarding History", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Workflow Steps");
    expect(content).toContain("Email Templates");
    expect(content).toContain("Onboarding History");
  });

  it("should have email templates section with active/draft status", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Onboarding Email Templates");
    expect(content).toContain("Welcome to RusingÂcademy!");
    expect(content).toContain("active");
    expect(content).toContain("draft");
  });

  it("should have recent onboardings history with completion status", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Recent Onboardings");
    expect(content).toContain("recentOnboardings");
    expect(content).toContain("Completed");
  });

  it("should have save workflow button that calls saveConfig mutation", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("saveWorkflow");
    expect(content).toContain("saveMutation.mutate");
    expect(content).toContain("Save Workflow");
  });
});

// ============================================================================
// 12. ROUTER WIRING IN MAIN ROUTERS.TS
// ============================================================================

describe("Router Wiring", () => {
  it("main routers.ts should import stripeTestingRouter", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("stripeTestingRouter");
  });

  it("main routers.ts should import liveKPIRouter", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("liveKPIRouter");
  });

  it("main routers.ts should import onboardingRouter", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("onboardingRouter");
  });

  it("main routers.ts should import enterpriseRouter", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("enterpriseRouter");
  });

  it("main routers.ts should import sleExamRouter", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("sleExamRouter");
  });

  it("main routers.ts should wire stripeTesting to the app router", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("stripeTesting:");
  });

  it("main routers.ts should wire liveKPI to the app router", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("liveKPI:");
  });

  it("main routers.ts should wire onboarding to the app router", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("onboarding:");
  });

  it("main routers.ts should wire stripeKPI to the app router", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("stripeKPI:");
  });

  it("main routers.ts should wire adminStability to the app router", async () => {
    const routersPath = path.resolve(__dirname, "./routers.ts");
    const content = fs.readFileSync(routersPath, "utf-8");
    expect(content).toContain("adminStability:");
  });
});

// ============================================================================
// 13. DATABASE SCHEMA — ONBOARDING TABLES
// ============================================================================

describe("Database Schema — Onboarding Tables", () => {
  const schemaPath = path.resolve(__dirname, "../drizzle/schema.ts");

  it("schema should define onboarding_config table", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("onboarding_config");
  });

  it("schema should define onboarding_progress table", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("onboarding_progress");
  });

  it("onboarding_config should have stepKey column", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("stepKey");
  });

  it("onboarding_config should have stepTitle column", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("stepTitle");
  });

  it("onboarding_config should have actionType column", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("actionType");
  });

  it("onboarding_config should have isEnabled column", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("isEnabled");
  });

  it("onboarding_config should have sortOrder column", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    expect(content).toContain("sortOrder");
  });

  it("onboarding_progress should have userId column", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    // Check that onboarding_progress has userId
    const progressSection = content.slice(content.indexOf("onboarding_progress"));
    expect(progressSection).toContain("userId");
  });

  it("onboarding_progress should have completed column", () => {
    const content = fs.readFileSync(schemaPath, "utf-8");
    const progressSection = content.slice(content.indexOf("onboarding_progress"));
    expect(progressSection).toContain("completed");
  });
});

// ============================================================================
// 14. SERVICE WORKER — PUSH NOTIFICATION SUPPORT
// ============================================================================

describe("Service Worker", () => {
  const swPath = path.resolve(__dirname, "../client/public/sw.js");

  it("sw.js should exist in public directory", () => {
    expect(fs.existsSync(swPath)).toBe(true);
  });

  it("should handle push events", () => {
    const content = fs.readFileSync(swPath, "utf-8");
    expect(content).toContain("push");
  });

  it("should handle notification click events", () => {
    const content = fs.readFileSync(swPath, "utf-8");
    expect(content).toContain("notificationclick");
  });
});

// ============================================================================
// 15. ADMIN ROUTES IN APP.TSX
// ============================================================================

describe("Admin Routes", () => {
  const appPath = path.resolve(__dirname, "../client/src/App.tsx");

  it("App.tsx should exist", () => {
    expect(fs.existsSync(appPath)).toBe(true);
  });

  it("should have route for StripeTesting via AdminControlCenter", () => {
    const accPath = path.resolve(__dirname, "../client/src/pages/AdminControlCenter.tsx");
    const content = fs.readFileSync(accPath, "utf-8");
    expect(content).toContain("StripeTesting");
    expect(content).toContain('"stripe-testing"');
  });

  it("should have route for LiveKPIDashboard via AdminControlCenter", () => {
    const accPath = path.resolve(__dirname, "../client/src/pages/AdminControlCenter.tsx");
    const content = fs.readFileSync(accPath, "utf-8");
    expect(content).toContain("LiveKPIDashboard");
    expect(content).toContain('"live-kpi"');
  });

  it("should have route for OnboardingWorkflow via AdminControlCenter", () => {
    const accPath = path.resolve(__dirname, "../client/src/pages/AdminControlCenter.tsx");
    const content = fs.readFileSync(accPath, "utf-8");
    expect(content).toContain("OnboardingWorkflow");
    expect(content).toContain('onboarding');
  });
});
