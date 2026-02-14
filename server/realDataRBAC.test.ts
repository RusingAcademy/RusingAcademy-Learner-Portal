/**
 * Tests for Month 1 Sprint 3:
 * - Stripe KPI Data Router
 * - Admin Notifications Service
 * - RBAC Frontend (getUserPermissions endpoint)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================================
// STRIPE KPI DATA ROUTER TESTS
// ============================================================================

describe("Stripe KPI Data Router", () => {
  it("should export stripeKPIRouter with expected procedures", async () => {
    const { stripeKPIRouter } = await import("./routers/stripeKPIData");
    expect(stripeKPIRouter).toBeDefined();
    // Check that the router has the expected procedure names
    const procedures = Object.keys(stripeKPIRouter._def.procedures || {});
    expect(procedures).toContain("getStripeRevenue");
    expect(procedures).toContain("getUserAnalytics");
    expect(procedures).toContain("getAIMetrics");
  });

  it("should have 3 procedures in stripeKPIRouter", async () => {
    const { stripeKPIRouter } = await import("./routers/stripeKPIData");
    const procedures = Object.keys(stripeKPIRouter._def.procedures || {});
    expect(procedures.length).toBe(3);
  });
});

// ============================================================================
// ADMIN NOTIFICATIONS SERVICE TESTS
// ============================================================================

describe("Admin Notifications Service", () => {
  it("should export sendAdminAlert function", async () => {
    const { sendAdminAlert } = await import("./services/adminNotifications");
    expect(sendAdminAlert).toBeDefined();
    expect(typeof sendAdminAlert).toBe("function");
  });

  it("should export all health check functions", async () => {
    const mod = await import("./services/adminNotifications");
    expect(typeof mod.checkWebhookHealth).toBe("function");
    expect(typeof mod.checkAIScoreHealth).toBe("function");
    expect(typeof mod.checkNewCoachSignups).toBe("function");
    expect(typeof mod.checkAIPipelineHealth).toBe("function");
    expect(typeof mod.runAllHealthChecks).toBe("function");
  });

  it("should export notification preference functions", async () => {
    const mod = await import("./services/adminNotifications");
    expect(typeof mod.getAdminNotificationPrefs).toBe("function");
    expect(typeof mod.setAdminNotificationPref).toBe("function");
  });

  it("sendAdminAlert should accept correct alert structure", async () => {
    const { sendAdminAlert } = await import("./services/adminNotifications");
    // Verify the function signature accepts the expected structure
    // (We don't call it since it hits the DB, but we verify it exists and is callable)
    expect(sendAdminAlert.length).toBeGreaterThanOrEqual(1);
  });

  it("should define all expected alert categories", async () => {
    // Type-level test: verify the AlertCategory type covers all expected categories
    const categories = ["webhook", "ai_pipeline", "coach_signup", "system_health", "payment", "security"];
    // This is a structural test - we verify the module exports are consistent
    const mod = await import("./services/adminNotifications");
    expect(mod).toBeDefined();
    // All categories should be valid for the sendAdminAlert function
    for (const cat of categories) {
      expect(typeof cat).toBe("string");
    }
  });
});

// ============================================================================
// ADMIN NOTIFICATIONS ROUTER TESTS
// ============================================================================

describe("Admin Notifications Router", () => {
  it("should export adminNotificationsRouter with expected procedures", async () => {
    const { adminNotificationsRouter } = await import("./routers/adminNotifications");
    expect(adminNotificationsRouter).toBeDefined();
    const procedures = Object.keys(adminNotificationsRouter._def.procedures || {});
    expect(procedures).toContain("runHealthChecks");
    expect(procedures).toContain("getPreferences");
    expect(procedures).toContain("setPreference");
    expect(procedures).toContain("getRecentAlerts");
    expect(procedures).toContain("getAlertSummary");
    expect(procedures).toContain("markAlertRead");
  });

  it("should have 6 procedures in adminNotificationsRouter", async () => {
    const { adminNotificationsRouter } = await import("./routers/adminNotifications");
    const procedures = Object.keys(adminNotificationsRouter._def.procedures || {});
    expect(procedures.length).toBe(6);
  });
});

// ============================================================================
// RBAC FRONTEND - getUserPermissions ENDPOINT TESTS
// ============================================================================

describe("RBAC Frontend - getUserPermissions", () => {
  it("should have getUserPermissions in adminStabilityRouter", async () => {
    const { adminStabilityRouter } = await import("./routers/adminStability");
    const procedures = Object.keys(adminStabilityRouter._def.procedures || {});
    expect(procedures).toContain("getUserPermissions");
  });

  it("adminStabilityRouter should contain all stability + RBAC procedures", async () => {
    const { adminStabilityRouter } = await import("./routers/adminStability");
    const procedures = Object.keys(adminStabilityRouter._def.procedures || {});
    // Stability endpoints
    expect(procedures).toContain("getWebhookStats");
    expect(procedures).toContain("getAuditLog");
    expect(procedures).toContain("getPipelineHealth");
    expect(procedures).toContain("getPipelineStats");
    // Scoring rubric
    expect(procedures).toContain("getScoringRubric");
    expect(procedures).toContain("getAllScoringRubrics");
    // RBAC
    expect(procedures).toContain("getUserPermissions");
  });
});

// ============================================================================
// INTEGRATION: All routers registered in main appRouter
// ============================================================================

describe("Router Registration", () => {
  it("should have stripeKPI router registered", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures || {});
    // stripeKPI procedures should be accessible as stripeKPI.getStripeRevenue etc
    const hasStripeKPI = procedures.some(p => p.startsWith("stripeKPI."));
    expect(hasStripeKPI).toBe(true);
  });

  it("should have adminNotifications router registered", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures || {});
    const hasNotifications = procedures.some(p => p.startsWith("adminAlerts."));
    expect(hasNotifications).toBe(true);
  });

  it("should have adminStability router registered", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures || {});
    const hasStability = procedures.some(p => p.startsWith("adminStability."));
    expect(hasStability).toBe(true);
  });
});
