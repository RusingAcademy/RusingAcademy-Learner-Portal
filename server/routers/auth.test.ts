import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock argon2
vi.mock("argon2", () => ({
  hash: vi.fn().mockResolvedValue("$argon2id$v=19$m=65536,t=3,p=4$hashedpassword"),
  verify: vi.fn().mockImplementation((hash, password) => {
    return Promise.resolve(password === "correctpassword");
  }),
  argon2id: 2,
}));

// Mock crypto
vi.mock("crypto", () => ({
  randomBytes: vi.fn().mockReturnValue({
    toString: () => "mockedtoken123456789012345678901234567890123456789012345678901234",
  }),
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: () => "hashedtoken123",
  }),
}));

// Mock database
const mockInsertChain = {
  values: vi.fn().mockReturnThis(),
  $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
};

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnValue(mockInsertChain),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

describe("Auth Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Reset mock implementations
    mockDb.limit.mockReset();
    mockDb.limit.mockResolvedValue([]);
    mockInsertChain.values.mockReturnThis();
    mockInsertChain.$returningId.mockResolvedValue([{ id: 1 }]);
  });

  describe("signup", () => {
    it("should create a new user with valid input", async () => {
      const input = {
        email: "test@example.com",
        password: "securepassword123",
        name: "Test User",
        role: "learner" as const,
      };

      // Mock no existing user
      mockDb.limit.mockResolvedValueOnce([]);
      // Mock user creation - use the insert chain mock
      mockInsertChain.$returningId.mockResolvedValueOnce([{ id: 1 }]);

      // Import after mocks are set up
      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      const result = await caller.signup(input);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test User");
      expect(result.sessionToken).toBeDefined();
    });

    it("should reject signup if email already exists", async () => {
      const input = {
        email: "existing@example.com",
        password: "securepassword123",
        name: "Test User",
        role: "learner" as const,
      };

      // Mock existing user found
      mockDb.limit.mockResolvedValueOnce([{ id: 1, email: "existing@example.com" }]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      await expect(caller.signup(input)).rejects.toThrow("An account with this email already exists");
    });

    it("should reject password shorter than 8 characters", async () => {
      const input = {
        email: "test@example.com",
        password: "short",
        name: "Test User",
        role: "learner" as const,
      };

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      await expect(caller.signup(input)).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should authenticate user with correct credentials", async () => {
      const input = {
        email: "test@example.com",
        password: "correctpassword",
      };

      // Mock user found with password hash
      mockDb.limit.mockResolvedValueOnce([{
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: "learner",
        passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$hashedpassword",
        emailVerified: true,
      }]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      const result = await caller.login(input);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe("test@example.com");
      expect(result.sessionToken).toBeDefined();
    });

    it("should reject login with incorrect password", async () => {
      const input = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      // Mock user found
      mockDb.limit.mockResolvedValueOnce([{
        id: 1,
        email: "test@example.com",
        passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$hashedpassword",
      }]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      await expect(caller.login(input)).rejects.toThrow("Invalid email or password");
    });

    it("should reject login for non-existent user", async () => {
      const input = {
        email: "nonexistent@example.com",
        password: "anypassword",
      };

      // Mock no user found
      mockDb.limit.mockResolvedValueOnce([]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      await expect(caller.login(input)).rejects.toThrow("Invalid email or password");
    });
  });

  describe("requestPasswordReset", () => {
    it("should return success even for non-existent email (prevent enumeration)", async () => {
      const input = {
        email: "nonexistent@example.com",
      };

      // Mock no user found
      mockDb.limit.mockResolvedValueOnce([]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      const result = await caller.requestPasswordReset(input);

      expect(result.success).toBe(true);
      expect(result.message).toContain("If an account exists");
    });

    it("should generate reset token for existing user", async () => {
      const input = {
        email: "test@example.com",
      };

      // Mock user found
      mockDb.limit.mockResolvedValueOnce([{ id: 1, email: "test@example.com" }]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      const result = await caller.requestPasswordReset(input);

      expect(result.success).toBe(true);
      expect(result.resetToken).toBeDefined();
    });
  });

  describe("resetPassword", () => {
    it("should reset password with valid token", async () => {
      const input = {
        token: "validtoken",
        newPassword: "newpassword123",
      };

      // Mock valid reset token found
      mockDb.limit.mockResolvedValueOnce([{
        id: 1,
        userId: 1,
        tokenHash: "hashedtoken123",
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      }]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      const result = await caller.resetPassword(input);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Password reset successfully");
    });

    it("should reject invalid or expired token", async () => {
      const input = {
        token: "invalidtoken",
        newPassword: "newpassword123",
      };

      // Mock no valid token found
      mockDb.limit.mockResolvedValueOnce([]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      await expect(caller.resetPassword(input)).rejects.toThrow("Invalid or expired reset token");
    });
  });

  describe("validateSession", () => {
    it("should validate active session", async () => {
      const input = {
        sessionToken: "validsessiontoken",
      };

      // Mock valid session found
      mockDb.limit.mockResolvedValueOnce([{
        id: 1,
        userId: 1,
        tokenHash: "hashedtoken123",
        expiresAt: new Date(Date.now() + 86400000),
      }]);
      // Mock user found
      mockDb.limit.mockResolvedValueOnce([{
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: "learner",
        emailVerified: true,
        avatarUrl: null,
      }]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      const result = await caller.validateSession(input);

      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe("test@example.com");
    });

    it("should invalidate expired session", async () => {
      const input = {
        sessionToken: "expiredsessiontoken",
      };

      // Mock no valid session found (expired)
      mockDb.limit.mockResolvedValueOnce([]);

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      const result = await caller.validateSession(input);

      expect(result.valid).toBe(false);
      expect(result.user).toBeNull();
    });
  });

  describe("logout", () => {
    it("should invalidate session on logout", async () => {
      const input = {
        sessionToken: "sessiontoken",
      };

      const { authRouter } = await import("./auth");
      const caller = authRouter.createCaller({} as any);

      const result = await caller.logout(input);

      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
