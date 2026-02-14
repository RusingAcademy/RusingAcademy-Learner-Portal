import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

// Mock Stripe subscriptions module
vi.mock("../stripe/subscriptions", () => ({
  getOrCreateCustomer: vi.fn().mockResolvedValue("cus_test123"),
  getOrCreatePrice: vi.fn().mockResolvedValue("price_test123"),
  createSubscriptionCheckout: vi.fn().mockResolvedValue({
    sessionId: "cs_test123",
    url: "https://checkout.stripe.com/test",
  }),
  createCustomerPortal: vi.fn().mockResolvedValue("https://billing.stripe.com/test"),
  getSubscription: vi.fn().mockResolvedValue(null),
  cancelSubscription: vi.fn().mockResolvedValue({}),
  resumeSubscription: vi.fn().mockResolvedValue({}),
  updateSubscriptionPlan: vi.fn().mockResolvedValue({}),
  getCustomerSubscriptions: vi.fn().mockResolvedValue([]),
  getUpcomingInvoice: vi.fn().mockResolvedValue(null),
  getInvoiceHistory: vi.fn().mockResolvedValue([]),
  SUBSCRIPTION_PLANS: {
    premium_membership: {
      name: "Premium Membership",
      description: "Full access",
      monthlyPrice: 2999,
      annualPrice: 29900,
      features: ["Feature 1"],
    },
    prof_steven_ai: {
      name: "Prof Steven AI Premium",
      description: "AI access",
      monthlyPrice: 1999,
      annualPrice: 19900,
      features: ["Feature 1"],
    },
    bundle: {
      name: "Complete Bundle",
      description: "Everything",
      monthlyPrice: 3999,
      annualPrice: 39900,
      features: ["Feature 1"],
    },
  },
}));

describe("Subscriptions Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockDb.limit.mockReset();
    mockDb.limit.mockResolvedValue([]);
  });

  describe("getPlans", () => {
    it("should return default subscription plans when none in database", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({} as any);

      const plans = await caller.getPlans();

      expect(plans).toBeDefined();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBe(3);
    });

    it("should include all three plan types", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({} as any);

      const plans = await caller.getPlans();
      const slugs = plans.map((p: any) => p.slug);

      expect(slugs).toContain("premium_membership");
      expect(slugs).toContain("prof_steven_ai");
      expect(slugs).toContain("bundle");
    });
  });

  describe("getMySubscriptions", () => {
    it("should require authentication", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({ user: null } as any);

      await expect(caller.getMySubscriptions()).rejects.toThrow();
    });

    it("should return empty array for user with no subscriptions", async () => {
      // Mock the orderBy chain to return empty array
      mockDb.orderBy.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
      } as any);

      const subscriptions = await caller.getMySubscriptions();

      expect(subscriptions).toBeDefined();
      expect(Array.isArray(subscriptions)).toBe(true);
    });
  });

  describe("getActiveSubscription", () => {
    it("should require authentication", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({ user: null } as any);

      await expect(caller.getActiveSubscription()).rejects.toThrow();
    });

    it("should return null for user with no active subscription", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
      } as any);

      const subscription = await caller.getActiveSubscription();

      expect(subscription).toBeNull();
    });
  });

  describe("checkAccess", () => {
    it("should require authentication", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({ user: null } as any);

      await expect(caller.checkAccess({ feature: "courses" })).rejects.toThrow();
    });

    it("should return hasAccess false for user without subscription", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
      } as any);

      const access = await caller.checkAccess({ feature: "courses" });

      expect(access).toBeDefined();
      expect(access.hasAccess).toBe(false);
      expect(access.subscriptions).toEqual([]);
    });

    it("should return hasAccess true for user with premium subscription checking courses", async () => {
      // Mock active subscription - note: the query doesn't use limit, so we need to mock the where chain
      mockDb.where.mockResolvedValueOnce([
        {
          id: 1,
          userId: 1,
          planName: "Premium Membership",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
      } as any);

      const access = await caller.checkAccess({ feature: "courses" });

      expect(access.hasAccess).toBe(true);
    });

    it("should return hasAccess true for user with bundle subscription checking all features", async () => {
      // Mock active bundle subscription - note: the query doesn't use limit
      mockDb.where.mockResolvedValueOnce([
        {
          id: 1,
          userId: 1,
          planName: "Complete Bundle",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
      } as any);

      const access = await caller.checkAccess({ feature: "all" });

      expect(access.hasAccess).toBe(true);
    });
  });

  describe("createCheckout", () => {
    it("should require authentication", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({ user: null } as any);

      await expect(
        caller.createCheckout({
          planType: "premium_membership",
          interval: "month",
        })
      ).rejects.toThrow();
    });

    it("should require email for checkout", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: null, name: "Test" },
        req: { headers: { origin: "https://test.com" } },
      } as any);

      await expect(
        caller.createCheckout({
          planType: "premium_membership",
          interval: "month",
        })
      ).rejects.toThrow("Email is required");
    });

    it("should create checkout session with valid input", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
        req: { headers: { origin: "https://test.com" } },
      } as any);

      const result = await caller.createCheckout({
        planType: "premium_membership",
        interval: "month",
      });

      expect(result.sessionId).toBe("cs_test123");
      expect(result.url).toBe("https://checkout.stripe.com/test");
    });
  });

  describe("getPortalUrl", () => {
    it("should require authentication", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({ user: null } as any);

      await expect(caller.getPortalUrl()).rejects.toThrow();
    });

    it("should throw error if no subscription exists", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
        req: { headers: { origin: "https://test.com" } },
      } as any);

      await expect(caller.getPortalUrl()).rejects.toThrow("No subscription found");
    });

    it("should return portal URL when subscription exists", async () => {
      mockDb.limit.mockResolvedValueOnce([
        {
          id: 1,
          userId: 1,
          stripeCustomerId: "cus_test123",
        },
      ]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
        req: { headers: { origin: "https://test.com" } },
      } as any);

      const result = await caller.getPortalUrl();

      expect(result.url).toBe("https://billing.stripe.com/test");
    });
  });

  describe("cancel", () => {
    it("should require authentication", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({ user: null } as any);

      await expect(caller.cancel({ subscriptionId: 1 })).rejects.toThrow();
    });

    it("should throw error if subscription not found", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
      } as any);

      await expect(caller.cancel({ subscriptionId: 99999 })).rejects.toThrow(
        "Subscription not found"
      );
    });
  });

  describe("resume", () => {
    it("should require authentication", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({ user: null } as any);

      await expect(caller.resume({ subscriptionId: 1 })).rejects.toThrow();
    });

    it("should throw error if subscription not found", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
      } as any);

      await expect(caller.resume({ subscriptionId: 99999 })).rejects.toThrow(
        "Subscription not found"
      );
    });
  });

  describe("getInvoices", () => {
    it("should require authentication", async () => {
      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({ user: null } as any);

      await expect(caller.getInvoices()).rejects.toThrow();
    });

    it("should return empty array if no subscription exists", async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const { subscriptionsRouter } = await import("./subscriptions");
      const caller = subscriptionsRouter.createCaller({
        user: { id: 1, email: "test@test.com", name: "Test" },
      } as any);

      const invoices = await caller.getInvoices();

      expect(invoices).toEqual([]);
    });
  });
});
