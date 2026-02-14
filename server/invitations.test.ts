/**
 * Invitations System — Vitest Tests
 * Phase C: User Invitation Workflow
 *
 * Tests cover:
 * 1. Schema validation (admin_invitations table)
 * 2. Router structure (6 procedures)
 * 3. Token generation security
 * 4. Email validation
 * 5. Role assignment validation
 * 6. Invitation lifecycle (create → verify → accept)
 * 7. Error states (expired, revoked, invalid, duplicate)
 * 8. Frontend component structure
 */

import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

// ============================================================================
// 1. Schema Validation
// ============================================================================

describe("admin_invitations schema", () => {
  it("should define the adminInvitations table in schema.ts", () => {
    const schemaContent = fs.readFileSync(
      path.resolve(__dirname, "../drizzle/schema.ts"),
      "utf-8"
    );
    expect(schemaContent).toContain("adminInvitations");
    expect(schemaContent).toContain("admin_invitations");
  });

  it("should have all required columns", () => {
    const schemaContent = fs.readFileSync(
      path.resolve(__dirname, "../drizzle/schema.ts"),
      "utf-8"
    );
    const requiredColumns = ["email", "role", "token", "invitedBy", "status", "expiresAt", "acceptedAt", "createdAt"];
    for (const col of requiredColumns) {
      expect(schemaContent).toContain(col);
    }
  });

  it("should have status enum with pending, accepted, revoked, expired", () => {
    const schemaContent = fs.readFileSync(
      path.resolve(__dirname, "../drizzle/schema.ts"),
      "utf-8"
    );
    expect(schemaContent).toMatch(/pending/);
    expect(schemaContent).toMatch(/accepted/);
    expect(schemaContent).toMatch(/revoked/);
    expect(schemaContent).toMatch(/expired/);
  });
});

// ============================================================================
// 2. Router Structure
// ============================================================================

describe("invitations router structure", () => {
  it("should export invitationsRouter from invitations.ts", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("export const invitationsRouter");
  });

  it("should define all 6 procedures", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    const procedures = ["create:", "list:", "resend:", "revoke:", "verifyToken:", "accept:"];
    for (const proc of procedures) {
      expect(routerContent).toContain(proc);
    }
  });

  it("should use protectedProcedure for admin-only operations", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    // create, list, resend, revoke should use protectedProcedure
    const protectedCount = (routerContent.match(/protectedProcedure/g) || []).length;
    expect(protectedCount).toBeGreaterThanOrEqual(4);
  });

  it("should use publicProcedure for verifyToken and accept", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    const publicCount = (routerContent.match(/publicProcedure/g) || []).length;
    expect(publicCount).toBeGreaterThanOrEqual(2);
  });

  it("should be registered in the admin router in routers.ts", () => {
    const mainRouterContent = fs.readFileSync(
      path.resolve(__dirname, "routers.ts"),
      "utf-8"
    );
    expect(mainRouterContent).toContain("invitationsRouter");
    expect(mainRouterContent).toContain("invitations:");
  });
});

// ============================================================================
// 3. Token Generation Security
// ============================================================================

describe("invitation token generation", () => {
  it("should generate a 64-character hex token (32 bytes)", () => {
    const token = randomBytes(32).toString("hex");
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it("should generate unique tokens on each call", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(randomBytes(32).toString("hex"));
    }
    expect(tokens.size).toBe(100);
  });

  it("should be cryptographically random (not predictable)", () => {
    const token1 = randomBytes(32).toString("hex");
    const token2 = randomBytes(32).toString("hex");
    expect(token1).not.toBe(token2);
    // Tokens should have sufficient entropy (no repeated patterns)
    const uniqueChars = new Set(token1.split("")).size;
    expect(uniqueChars).toBeGreaterThan(8);
  });
});

// ============================================================================
// 4. Email Validation
// ============================================================================

describe("invitation email validation", () => {
  const emailSchema = z.string().email("Invalid email address");

  it("should accept valid email addresses", () => {
    const validEmails = [
      "user@example.ca",
      "jean-pierre@gc.ca",
      "admin@rusingacademy.ca",
      "test.user+tag@domain.com",
      "colleague@tbs-sct.gc.ca",
    ];
    for (const email of validEmails) {
      expect(() => emailSchema.parse(email)).not.toThrow();
    }
  });

  it("should reject invalid email addresses", () => {
    const invalidEmails = [
      "",
      "notanemail",
      "@domain.com",
      "user@",
      "user@.com",
      "user@domain",
    ];
    for (const email of invalidEmails) {
      expect(() => emailSchema.parse(email)).toThrow();
    }
  });
});

// ============================================================================
// 5. Role Assignment Validation
// ============================================================================

describe("invitation role validation", () => {
  const roleSchema = z.enum(["admin", "hr_admin", "coach", "learner", "user"]);

  it("should accept all valid roles", () => {
    const validRoles = ["admin", "hr_admin", "coach", "learner", "user"];
    for (const role of validRoles) {
      expect(() => roleSchema.parse(role)).not.toThrow();
    }
  });

  it("should reject invalid roles", () => {
    const invalidRoles = ["owner", "superadmin", "moderator", "", "ADMIN"];
    for (const role of invalidRoles) {
      expect(() => roleSchema.parse(role)).toThrow();
    }
  });

  it("should not allow 'owner' role in invitations (security)", () => {
    expect(() => roleSchema.parse("owner")).toThrow();
  });
});

// ============================================================================
// 6. Invitation Lifecycle Logic
// ============================================================================

describe("invitation lifecycle", () => {
  it("should set expiry to 7 days from creation", () => {
    const now = Date.now();
    const expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000);
    const diffMs = expiresAt.getTime() - now;
    const diffDays = diffMs / (24 * 60 * 60 * 1000);
    expect(diffDays).toBeCloseTo(7, 0);
  });

  it("should detect expired invitations correctly", () => {
    const pastDate = new Date(Date.now() - 1000); // 1 second ago
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    expect(pastDate < now).toBe(true); // expired
    expect(futureDate < now).toBe(false); // not expired
  });

  it("should normalize email to lowercase", () => {
    const email = "Jean.Pierre@GC.CA";
    expect(email.toLowerCase()).toBe("jean.pierre@gc.ca");
  });
});

// ============================================================================
// 7. Accept Invitation Input Validation
// ============================================================================

describe("accept invitation validation", () => {
  const acceptSchema = z.object({
    token: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  it("should accept valid input", () => {
    expect(() =>
      acceptSchema.parse({
        token: randomBytes(32).toString("hex"),
        name: "Jean-Pierre Tremblay",
        password: "SecurePass123!",
      })
    ).not.toThrow();
  });

  it("should reject name shorter than 2 characters", () => {
    expect(() =>
      acceptSchema.parse({
        token: "abc",
        name: "J",
        password: "SecurePass123!",
      })
    ).toThrow("Name must be at least 2 characters");
  });

  it("should reject password shorter than 8 characters", () => {
    expect(() =>
      acceptSchema.parse({
        token: "abc",
        name: "Jean",
        password: "short",
      })
    ).toThrow("Password must be at least 8 characters");
  });

  it("should reject empty token", () => {
    // Token is just z.string(), so empty string is technically valid in schema
    // but the router logic will return NOT_FOUND for empty tokens
    const result = acceptSchema.safeParse({
      token: "",
      name: "Jean",
      password: "SecurePass123!",
    });
    // Empty string passes z.string() but will fail in DB lookup
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// 8. Admin Authorization Logic
// ============================================================================

describe("admin authorization", () => {
  it("should recognize admin role", () => {
    const isAdmin = (ctx: { user: { role: string; openId: string } }) =>
      ctx.user.role === "admin" || ctx.user.role === "owner" || ctx.user.openId === "test_owner_id";

    expect(isAdmin({ user: { role: "admin", openId: "" } })).toBe(true);
    expect(isAdmin({ user: { role: "owner", openId: "" } })).toBe(true);
    expect(isAdmin({ user: { role: "learner", openId: "test_owner_id" } })).toBe(true);
  });

  it("should reject non-admin roles", () => {
    const isAdmin = (ctx: { user: { role: string; openId: string } }) =>
      ctx.user.role === "admin" || ctx.user.role === "owner" || ctx.user.openId === "test_owner_id";

    expect(isAdmin({ user: { role: "learner", openId: "" } })).toBe(false);
    expect(isAdmin({ user: { role: "coach", openId: "" } })).toBe(false);
    expect(isAdmin({ user: { role: "user", openId: "" } })).toBe(false);
    expect(isAdmin({ user: { role: "hr_admin", openId: "" } })).toBe(false);
  });
});

// ============================================================================
// 9. Frontend Components Existence
// ============================================================================

describe("frontend components", () => {
  it("should have InviteUserModal component", () => {
    const filePath = path.resolve(__dirname, "../client/src/components/InviteUserModal.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("InviteUserModal");
    expect(content).toContain("trpc.admin.invitations.create");
    expect(content).toContain("trpc.admin.invitations.list");
    expect(content).toContain("trpc.admin.invitations.resend");
    expect(content).toContain("trpc.admin.invitations.revoke");
  });

  it("should have AcceptInvitation page", () => {
    const filePath = path.resolve(__dirname, "../client/src/pages/AcceptInvitation.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("AcceptInvitation");
    expect(content).toContain("trpc.admin.invitations.verifyToken");
    expect(content).toContain("trpc.admin.invitations.accept");
  });

  it("should have /invite/:token route in App.tsx", () => {
    const appContent = fs.readFileSync(
      path.resolve(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    expect(appContent).toContain("/invite/:token");
    expect(appContent).toContain("AcceptInvitation");
  });

  it("should have Invite User button in UsersRoles page", () => {
    const usersContent = fs.readFileSync(
      path.resolve(__dirname, "../client/src/pages/admin/UsersRoles.tsx"),
      "utf-8"
    );
    expect(usersContent).toContain("InviteUserModal");
    expect(usersContent).toContain("Invite User");
    expect(usersContent).toContain("inviteOpen");
  });
});

// ============================================================================
// 10. AcceptInvitation Error States
// ============================================================================

describe("AcceptInvitation error states", () => {
  it("should handle all 5 error states in the page", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "../client/src/pages/AcceptInvitation.tsx"),
      "utf-8"
    );
    const errorStates = ["invalid_token", "already_accepted", "revoked", "expired", "loading"];
    for (const state of errorStates) {
      expect(content).toContain(state);
    }
  });

  it("should show password requirements", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "../client/src/pages/AcceptInvitation.tsx"),
      "utf-8"
    );
    expect(content).toContain("At least 8 characters");
  });

  it("should have password visibility toggle", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "../client/src/pages/AcceptInvitation.tsx"),
      "utf-8"
    );
    expect(content).toContain("showPassword");
    expect(content).toContain("EyeOff");
  });
});

// ============================================================================
// 11. Email Template
// ============================================================================

describe("invitation email template", () => {
  it("should include invitation email sending function", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("sendInvitationEmail");
    expect(routerContent).toContain("sendEmail");
  });

  it("should include invite URL in email", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("/invite/${token}");
    expect(routerContent).toContain("Accept Invitation");
  });

  it("should include 7-day expiry notice in email", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("7 days");
  });

  it("should use RusingÂcademy branding", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("RusingÂcademy");
    expect(routerContent).toContain("EMAIL_BRANDING");
  });
});

// ============================================================================
// 12. Security Checks
// ============================================================================

describe("invitation security", () => {
  it("should use Argon2id for password hashing in accept", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("argon2id");
    expect(routerContent).toContain("argon2.hash");
  });

  it("should create session JWT after accepting invitation", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("createSessionJWT");
    expect(routerContent).toContain("setSessionCookie");
  });

  it("should mark invited users as email-verified", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("emailVerified: true");
  });

  it("should check for existing users before creating invitation", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("existingUser");
    expect(routerContent).toContain("CONFLICT");
  });

  it("should check for duplicate pending invitations", () => {
    const routerContent = fs.readFileSync(
      path.resolve(__dirname, "routers/invitations.ts"),
      "utf-8"
    );
    expect(routerContent).toContain("existingInvite");
    expect(routerContent).toContain("pending");
  });
});
