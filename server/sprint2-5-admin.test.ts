import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@rusingacademy.com",
    name: "Admin User",
    role: "admin",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    setCookie: () => {},
    clearCookie: () => {},
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    setCookie: () => {},
    clearCookie: () => {},
  };
}

const caller = (ctx: TrpcContext) => appRouter.createCaller(ctx);

describe("Sprint 2: Coach Hub Admin Procedures", () => {
  it("admin can fetch coach applications", async () => {
    const result = await caller(createAdminContext()).admin.coachApplications({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can fetch coach profiles", async () => {
    const result = await caller(createAdminContext()).admin.coachProfiles({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can fetch coach lifecycle stats", async () => {
    const result = await caller(createAdminContext()).admin.coachLifecycleStats();
    expect(result).toHaveProperty("pending");
    expect(result).toHaveProperty("active");
    expect(result).toHaveProperty("suspended");
    expect(result).toHaveProperty("total");
  });

  it("admin can fetch commission tiers", async () => {
    const result = await caller(createAdminContext()).admin.commissionTiers();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can fetch coach payouts", async () => {
    const result = await caller(createAdminContext()).admin.coachPayouts({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can fetch commission analytics", async () => {
    const result = await caller(createAdminContext()).admin.commissionAnalytics();
    expect(result).toHaveProperty("totalPaid");
    expect(result).toHaveProperty("pendingPayout");
    expect(result).toHaveProperty("activeCoaches");
    expect(result).toHaveProperty("activeTiers");
  });

  it("non-admin cannot access coach applications", async () => {
    await expect(
      caller(createUserContext()).admin.coachApplications({})
    ).rejects.toThrow();
  });
});

describe("Sprint 3-4: Executive Summary / Analytics Procedures", () => {
  it("admin can fetch executive KPIs", async () => {
    const result = await caller(createAdminContext()).admin.executiveKPIs();
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("activeUsers");
    expect(result).toHaveProperty("totalEnrollments");
    expect(result).toHaveProperty("completedLessons");
    expect(result).toHaveProperty("activeCoaches");
    expect(result).toHaveProperty("contentItems");
    expect(result).toHaveProperty("retentionRate");
  });

  it("admin can fetch platform health", async () => {
    const result = await caller(createAdminContext()).admin.platformHealth();
    expect(result).toHaveProperty("dailyActivity");
    expect(result).toHaveProperty("weeklyActivity");
    expect(result).toHaveProperty("healthScore");
    expect(result).toHaveProperty("status");
    expect(["healthy", "moderate", "low"]).toContain(result.status);
  });

  it("admin can fetch revenue trend", async () => {
    const result = await caller(createAdminContext()).admin.revenueTrend();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("label");
      expect(result[0]).toHaveProperty("revenue");
    }
  });

  it("admin can fetch top performers", async () => {
    const result = await caller(createAdminContext()).admin.topPerformers();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can fetch recent activity", async () => {
    const result = await caller(createAdminContext()).admin.recentActivity();
    expect(Array.isArray(result)).toBe(true);
  });

  it("non-admin cannot access executive KPIs", async () => {
    await expect(
      caller(createUserContext()).admin.executiveKPIs()
    ).rejects.toThrow();
  });
});

describe("Sprint 5: Content Pipeline Procedures", () => {
  it("admin can fetch content pipeline stats", async () => {
    const result = await caller(createAdminContext()).admin.contentPipelineStats();
    expect(result).toHaveProperty("draft");
    expect(result).toHaveProperty("review");
    expect(result).toHaveProperty("approved");
    expect(result).toHaveProperty("published");
    expect(result).toHaveProperty("archived");
    expect(result).toHaveProperty("total");
  });

  it("admin can fetch content pipeline items", async () => {
    const result = await caller(createAdminContext()).admin.contentPipelineItems({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can fetch content calendar", async () => {
    const result = await caller(createAdminContext()).admin.contentCalendar({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can fetch content quality scores", async () => {
    const result = await caller(createAdminContext()).admin.contentQualityScores();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can fetch content templates", async () => {
    const result = await caller(createAdminContext()).admin.contentTemplates();
    expect(Array.isArray(result)).toBe(true);
  });

  it("non-admin cannot access content pipeline stats", async () => {
    await expect(
      caller(createUserContext()).admin.contentPipelineStats()
    ).rejects.toThrow();
  });

  it("non-admin cannot create content items", async () => {
    await expect(
      caller(createUserContext()).admin.createContentItem({
        title: "Test",
        contentType: "lesson",
      })
    ).rejects.toThrow();
  });
});
