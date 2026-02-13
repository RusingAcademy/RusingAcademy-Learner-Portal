import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    preferredLanguage: "en",
    avatarUrl: null,
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  return {
    ctx: {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    },
  };
}

describe("auth.me", () => {
  it("returns the authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.openId).toBe("test-user-1");
    expect(result?.name).toBe("Test User 1");
  });

  it("returns null for unauthenticated user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("gamification router", () => {
  it("getProfile requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.gamification.getProfile()).rejects.toThrow();
  });

  it("getProfile returns profile and badges for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.gamification.getProfile();
    expect(result).toHaveProperty("profile");
    expect(result).toHaveProperty("badges");
    expect(Array.isArray(result.badges)).toBe(true);
  });

  it("addXp requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.gamification.addXp({ amount: 50 })).rejects.toThrow();
  });

  it("addXp adds XP to the user profile", async () => {
    const { ctx } = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.gamification.addXp({ amount: 100 });
    expect(result).toBeDefined();
    if (result) {
      expect(result.xpAdded).toBe(100);
      expect(result.totalXp).toBeGreaterThanOrEqual(100);
    }
  });

  it("addXp rejects invalid amounts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.gamification.addXp({ amount: 0 })).rejects.toThrow();
    await expect(caller.gamification.addXp({ amount: 1001 })).rejects.toThrow();
  });

  it("getLeaderboard is publicly accessible", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.gamification.getLeaderboard();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("progress router", () => {
  it("getLessonProgress requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.progress.getLessonProgress({})).rejects.toThrow();
  });

  it("getLessonProgress returns array for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.progress.getLessonProgress({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("updateLessonProgress saves progress and awards XP", async () => {
    const { ctx } = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.progress.updateLessonProgress({
      programId: "fsl",
      pathId: "fsl-path-i",
      moduleIndex: 0,
      lessonId: "1.1",
      slotsCompleted: [0, 1, 2],
      isCompleted: false,
    });
    expect(result).toHaveProperty("xpEarned");
    expect(result.xpEarned).toBe(45); // 3 slots * 15 XP
  });

  it("updateLessonProgress awards completion bonus", async () => {
    const { ctx } = createAuthContext(4);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.progress.updateLessonProgress({
      programId: "fsl",
      pathId: "fsl-path-i",
      moduleIndex: 0,
      lessonId: "1.2",
      slotsCompleted: [0, 1, 2, 3, 4, 5, 6],
      isCompleted: true,
    });
    expect(result.xpEarned).toBe(155); // 7 slots * 15 + 50 bonus
  });

  it("enrollInPath creates enrollment and awards XP", async () => {
    const { ctx } = createAuthContext(5);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.progress.enrollInPath({
      programId: "fsl",
      pathId: "fsl-path-i",
    });
    expect(result).toBeDefined();
  });

  it("getPathEnrollments returns enrollments", async () => {
    const { ctx } = createAuthContext(5);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.progress.getPathEnrollments();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("quiz router", () => {
  it("submitAttempt saves quiz result and awards XP", async () => {
    const { ctx } = createAuthContext(6);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.quiz.submitAttempt({
      programId: "fsl",
      pathId: "fsl-path-i",
      lessonId: "1.1",
      quizType: "formative",
      totalQuestions: 8,
      correctAnswers: 6,
      score: 75,
    });
    expect(result).toHaveProperty("xpEarned");
    expect(result.isPerfect).toBe(false);
    expect(result.xpEarned).toBe(38); // Math.round(75 * 0.5) = 38
  });

  it("submitAttempt awards perfect bonus for 100% score", async () => {
    const { ctx } = createAuthContext(7);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.quiz.submitAttempt({
      programId: "fsl",
      pathId: "fsl-path-i",
      lessonId: "1.2",
      quizType: "formative",
      totalQuestions: 8,
      correctAnswers: 8,
      score: 100,
    });
    expect(result.isPerfect).toBe(true);
    expect(result.xpEarned).toBe(150); // 50 + 100 perfect bonus
  });

  it("getAttempts returns quiz history", async () => {
    const { ctx } = createAuthContext(6);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.quiz.getAttempts({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe("activity router", () => {
  it("getRecent returns activity log", async () => {
    const { ctx } = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.activity.getRecent({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("notifications router", () => {
  it("list requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.notifications.list({})).rejects.toThrow();
  });

  it("list returns notifications for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});
