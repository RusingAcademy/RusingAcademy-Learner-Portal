/**
 * Vitest tests for Méga-Sprints 11-13
 * Sprint 11: Ecosystem Hub Landing Page
 * Sprint 12: Floating AI Companion + Notifications
 * Sprint 13: Admin Dashboard + Analytics + Content Management
 */
import { describe, it, expect } from "vitest";

/* ─────────────── Sprint 11: Ecosystem Hub Landing Page ─────────────── */
describe("Sprint 11: Ecosystem Hub Landing Page", () => {
  it("Home.tsx exports a valid component", async () => {
    const mod = await import("../client/src/pages/Home");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

/* ─────────────── Sprint 12: Floating AI Companion ─────────────── */
describe("Sprint 12: Floating AI Companion + Notifications", () => {
  it("FloatingAICompanion module file exists", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("client/src/components/FloatingAICompanion.tsx");
    expect(exists).toBe(true);
    const content = fs.readFileSync("client/src/components/FloatingAICompanion.tsx", "utf-8");
    expect(content).toContain("export default");
    expect(content).toContain("FloatingAICompanion");
  });

  it("Notifications page exists and exports default", async () => {
    const mod = await import("../client/src/pages/Notifications");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

/* ─────────────── Sprint 13: Admin Dashboard ─────────────── */
describe("Sprint 13: Admin Dashboard", () => {
  it("AdminDashboard page exists and exports default", async () => {
    const mod = await import("../client/src/pages/AdminDashboard");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("Admin DB helpers exist", async () => {
    const db = await import("./db");
    expect(typeof db.getAllUsers).toBe("function");
    expect(typeof db.updateUserRole).toBe("function");
    expect(typeof db.getAnalyticsOverview).toBe("function");
    expect(typeof db.getRecentSignups).toBe("function");
    expect(typeof db.getActivityTimeline).toBe("function");
    expect(typeof db.updateChallenge).toBe("function");
    expect(typeof db.createAnnouncement).toBe("function");
  });

  it("Admin router procedures are defined in appRouter", async () => {
    const { appRouter } = await import("./routers");
    // Check that admin sub-router exists
    expect(appRouter).toBeDefined();
    const procedures = appRouter._def.procedures;
    expect(procedures).toBeDefined();
    // Check specific admin procedures exist
    expect(procedures["admin.overview"]).toBeDefined();
    expect(procedures["admin.users"]).toBeDefined();
    expect(procedures["admin.updateUserRole"]).toBeDefined();
    expect(procedures["admin.recentSignups"]).toBeDefined();
    expect(procedures["admin.activityTimeline"]).toBeDefined();
    expect(procedures["admin.challenges"]).toBeDefined();
    expect(procedures["admin.createChallenge"]).toBeDefined();
    expect(procedures["admin.updateChallenge"]).toBeDefined();
    expect(procedures["admin.sendAnnouncement"]).toBeDefined();
  });

  it("AI router procedures are defined", async () => {
    const { appRouter } = await import("./routers");
    const procedures = appRouter._def.procedures;
    expect(procedures["ai.chat"]).toBeDefined();
    expect(procedures["ai.getRecommendations"]).toBeDefined();
  });
});

/* ─────────────── i18n System ─────────────── */
describe("i18n Translation System", () => {
  it("English translations have all required sections", async () => {
    const { en } = await import("../client/src/i18n/en");
    expect(en).toBeDefined();
    expect(en.common).toBeDefined();
    expect(en.dashboard).toBeDefined();
  });

  it("French translations have all required sections", async () => {
    const { fr } = await import("../client/src/i18n/fr");
    expect(fr).toBeDefined();
    expect(fr.common).toBeDefined();
    expect(fr.dashboard).toBeDefined();
  });

  it("EN and FR have the same top-level keys", async () => {
    const { en } = await import("../client/src/i18n/en");
    const { fr } = await import("../client/src/i18n/fr");
    const enKeys = Object.keys(en).sort();
    const frKeys = Object.keys(fr).sort();
    expect(enKeys).toEqual(frKeys);
  });
});

/* ─────────────── Accessibility ─────────────── */
describe("Accessibility & WCAG Compliance", () => {
  it("DashboardLayout has skip-to-content link", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/DashboardLayout.tsx", "utf-8");
    expect(content).toContain("skip-to-content");
    expect(content).toContain("aria-label");
  });

  it("Sidebar has ARIA navigation roles", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/Sidebar.tsx", "utf-8");
    expect(content).toContain("role=\"navigation\"");
  });
});

/* ─────────────── SLE Practice ─────────────── */
describe("SLE Practice System", () => {
  it("SLEPractice page exists", async () => {
    const mod = await import("../client/src/pages/SLEPractice");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

/* ─────────────── Route Coverage ─────────────── */
describe("Route Coverage", () => {
  it("App.tsx contains all required routes", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/App.tsx", "utf-8");
    const requiredRoutes = [
      "/dashboard", "/programs", "/learning-materials",
      "/tutoring-sessions", "/authorizations", "/progress",
      "/results", "/reports", "/calendar", "/notifications",
      "/community-forum", "/leaderboard", "/challenges",
      "/sle-practice", "/ai-assistant", "/admin",
      "/help", "/profile", "/settings",
    ];
    for (const route of requiredRoutes) {
      expect(content).toContain(route);
    }
  });
});
