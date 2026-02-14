import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-owner",
    email: "admin@rusingacademy.com",
    name: "Admin Owner",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "test-student",
    email: "student@example.com",
    name: "Test Student",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

// ─── STRIPE TESTING ROUTER ───
describe("Premium Features - Stripe Testing Router", () => {
  it("stripeTesting.getWebhookEvents returns an array", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.stripeTesting.getWebhookEvents();
    expect(Array.isArray(result)).toBe(true);
  });

  it("stripeTesting.getWebhookStats returns stats object", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.stripeTesting.getWebhookStats();
    expect(result).toBeDefined();
    expect(typeof result.total).toBe("number");
    expect(typeof result.processed).toBe("number");
    expect(typeof result.failed).toBe("number");
    expect(Array.isArray(result.recentByType)).toBe(true);
  });

  it("stripeTesting.getTestInstructions returns test card info", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.stripeTesting.getTestInstructions();
    expect(result).toBeDefined();
    expect(result.testCard).toBe("4242 4242 4242 4242");
    expect(result.expiry).toBeDefined();
    expect(result.cvc).toBeDefined();
    expect(Array.isArray(result.notes)).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });
});

// ─── LIVE KPI DASHBOARD ROUTER ───
describe("Premium Features - Live KPI Dashboard Router", () => {
  it("liveKPI.getRevenueMetrics returns revenue data", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.liveKPI.getRevenueMetrics();
    expect(result).toBeDefined();
    expect(result.today).toBeDefined();
    expect(typeof result.today.revenue).toBe("number");
    expect(typeof result.today.transactions).toBe("number");
    expect(result.week).toBeDefined();
    expect(typeof result.week.revenue).toBe("number");
    expect(result.month).toBeDefined();
    expect(typeof result.month.revenue).toBe("number");
    expect(Array.isArray(result.sparkline)).toBe(true);
  });

  it("liveKPI.getConversionFunnel returns funnel metrics", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.liveKPI.getConversionFunnel();
    expect(result).toBeDefined();
    expect(typeof result.visitors).toBe("number");
    expect(typeof result.signups).toBe("number");
    expect(typeof result.enrollments).toBe("number");
    expect(typeof result.payments).toBe("number");
  });

  it("liveKPI.getAIEngagement returns engagement data", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.liveKPI.getAIEngagement();
    expect(result).toBeDefined();
    expect(result.today).toBeDefined();
    expect(typeof result.today.sessions).toBe("number");
    expect(typeof result.today.activeUsers).toBe("number");
    expect(result.week).toBeDefined();
    expect(Array.isArray(result.trend)).toBe(true);
  });

  it("liveKPI.getPlatformHealth returns health data", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.liveKPI.getPlatformHealth();
    expect(result).toBeDefined();
    expect(typeof result.totalUsers).toBe("number");
    expect(typeof result.activeCourses).toBe("number");
    expect(typeof result.activeEnrollments).toBe("number");
    expect(typeof result.recentErrors).toBe("number");
    expect(["healthy", "degraded"]).toContain(result.status);
  });
});

// ─── ONBOARDING WORKFLOW ROUTER ───
describe("Premium Features - Onboarding Workflow Router", () => {
  it("onboarding.getConfig returns an array", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.onboarding.getConfig();
    expect(Array.isArray(result)).toBe(true);
  });

  it("onboarding.createStep creates a step and returns true", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const ts = Date.now();
    const result = await caller.onboarding.createStep({
      stepKey: `test_step_${ts}`,
      stepTitle: `Test Step ${ts}`,
      stepDescription: "A test onboarding step",
      actionType: "email",
      sortOrder: 99,
    });
    expect(result).toBe(true);
  });

  it("onboarding.getChecklist returns enabled steps for learner", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.onboarding.getChecklist();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── ENTERPRISE MODE ROUTER ───
describe("Premium Features - Enterprise Mode Router", () => {
  it("enterprise.listOrgs returns an array", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.enterprise.listOrgs();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── SLE EXAM MODE ROUTER ───
describe("Premium Features - SLE Exam Mode Router", () => {
  it("sleExam.startExam creates an exam session", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sleExam.startExam({
      examType: "reading",
      level: "B",
    });
    expect(result).toBeDefined();
    expect(result.sessionId).toBeDefined();
    expect(result.examType).toBe("reading");
    expect(result.level).toBe("B");
    expect(typeof result.timeLimit).toBe("number");
    expect(result.timeLimit).toBe(5400); // reading = 5400s
  });

  it("sleExam.submitExam returns feedback", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    // First start an exam
    const session = await caller.sleExam.startExam({
      examType: "writing",
      level: "A",
    });
    // Submit with some answers
    const result = await caller.sleExam.submitExam({
      sessionId: session.sessionId,
      answers: [
        { questionId: 1, answer: "A", correct: true },
        { questionId: 2, answer: "B", correct: false },
        { questionId: 3, answer: "C", correct: true },
      ],
      timeUsed: 1200,
    });
    expect(result).toBeDefined();
    expect(typeof result.score).toBe("number");
    expect(typeof result.maxScore).toBe("number");
    expect(typeof result.percentage).toBe("number");
    expect(result.level).toBeDefined();
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.improvements)).toBe(true);
    expect(typeof result.recommendation).toBe("string");
  });

  it("sleExam.getHistory returns exam history for user", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sleExam.getHistory();
    expect(Array.isArray(result)).toBe(true);
  });

  it("sleExam.getExamStats returns admin stats", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sleExam.getExamStats();
    expect(result).toBeDefined();
    expect(Array.isArray(result.byType)).toBe(true);
    expect(Array.isArray(result.topScorers)).toBe(true);
    expect(Array.isArray(result.progressTrend)).toBe(true);
  });
});

// ─── CONTENT INTELLIGENCE ROUTER ───
describe("Premium Features - Content Intelligence Router", () => {
  it("contentIntelligence.getOverview returns an array", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contentIntelligence.getOverview();
    expect(Array.isArray(result)).toBe(true);
  });

  it("contentIntelligence.getRecommendations returns recommendations", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contentIntelligence.getRecommendations();
    expect(result).toBeDefined();
    expect(Array.isArray(result.lowCompletion)).toBe(true);
    expect(Array.isArray(result.highDropOff)).toBe(true);
  });
});
