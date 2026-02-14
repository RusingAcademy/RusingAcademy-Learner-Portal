import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getApprovedCoaches: vi.fn().mockResolvedValue([]),
  getCoachBySlug: vi.fn().mockResolvedValue(null),
  getCoachByUserId: vi.fn().mockResolvedValue(null),
  getCoachReviews: vi.fn().mockResolvedValue([]),
  createCoachProfile: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  updateCoachProfile: vi.fn().mockResolvedValue(undefined),
  getLearnerByUserId: vi.fn().mockResolvedValue(null),
  createLearnerProfile: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  updateLearnerProfile: vi.fn().mockResolvedValue(undefined),
  getUpcomingSessions: vi.fn().mockResolvedValue([]),
  createAiSession: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  getLearnerAiSessions: vi.fn().mockResolvedValue([]),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Hello! I am Prof Steven AI." } }],
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Coach Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("coach.list", () => {
    it("returns empty array when no coaches exist", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.coach.list();

      expect(result).toEqual([]);
    });

    it("accepts filter parameters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.coach.list({
        language: "french",
        minPrice: 2000,
        maxPrice: 10000,
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual([]);
    });
  });

  describe("coach.bySlug", () => {
    it("throws NOT_FOUND when coach does not exist", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.coach.bySlug({ slug: "non-existent" })).rejects.toThrow(
        "Coach not found"
      );
    });
  });

  describe("coach.myProfile", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.coach.myProfile()).rejects.toThrow();
    });

    it("returns null for user without coach profile", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.coach.myProfile();

      expect(result).toBeNull();
    });
  });

  describe("coach.submitApplication", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.coach.submitApplication({
          headline: "Test Coach Headline",
          bio: "This is a test bio that is at least 50 characters long for validation purposes.",
          languages: "french",
          specializations: { oralB: true, oralC: true },
          yearsExperience: 5,
          credentials: "TEFL Certified",
          hourlyRate: 5000,
          trialRate: 2500,
        })
      ).rejects.toThrow();
    });

    it("creates coach profile for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.coach.submitApplication({
        headline: "Test Coach Headline",
        bio: "This is a test bio that is at least 50 characters long for validation purposes.",
        languages: "french",
        specializations: { oralB: true, oralC: true },
        yearsExperience: 5,
        credentials: "TEFL Certified",
        hourlyRate: 5000,
        trialRate: 2500,
      });

      expect(result.success).toBe(true);
      expect(result.slug).toBeDefined();
    });
  });
});

describe("Learner Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("learner.myProfile", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.learner.myProfile()).rejects.toThrow();
    });

    it("returns null for user without learner profile", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.learner.myProfile();

      expect(result).toBeNull();
    });
  });

  describe("learner.create", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.learner.create({
          targetLanguage: "french",
          primaryFocus: "oral",
        })
      ).rejects.toThrow();
    });

    it("creates learner profile for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.learner.create({
        department: "Treasury Board",
        position: "Policy Analyst",
        targetLanguage: "french",
        primaryFocus: "oral",
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("AI Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ai.startPractice", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ai.startPractice({
          language: "french",
          targetLevel: "b",
        })
      ).rejects.toThrow();
    });
  });

  describe("ai.startPlacement", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ai.startPlacement({
          language: "french",
        })
      ).rejects.toThrow();
    });
  });

  describe("ai.startSimulation", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ai.startSimulation({
          language: "french",
          targetLevel: "c",
        })
      ).rejects.toThrow();
    });
  });

  describe("ai.history", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.ai.history()).rejects.toThrow();
    });

    it("returns empty array for user without learner profile", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ai.history();

      expect(result).toEqual([]);
    });
  });
});

describe("Auth Router", () => {
  describe("auth.me", () => {
    it("returns null for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });

    it("returns user for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.name).toBe("Test User");
      expect(result?.email).toBe("test@example.com");
    });
  });

  describe("auth.logout", () => {
    it("clears session cookie", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });
});
