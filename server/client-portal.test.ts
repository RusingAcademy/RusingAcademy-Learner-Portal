/**
 * Client Portal Router — Vitest Tests
 * Tests role-based access control, middleware, and procedure validation.
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/* ─── Helper: create context with specific role ─── */
function createContext(role: string, userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      email: `user${userId}@example.com`,
      name: `Test User ${userId}`,
      loginMethod: "manus",
      role: role as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

/* ═══════════════════════════════════════════════════════════
   ROLE-BASED ACCESS CONTROL TESTS
   ═══════════════════════════════════════════════════════════ */

describe("Client Portal — Role-Based Access Control", () => {
  it("rejects unauthenticated users from accessing clientPortal.dashboard", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.dashboard()).rejects.toThrow();
  });

  it("rejects regular users (role=user) from accessing clientPortal.dashboard", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.dashboard()).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from accessing clientPortal.getParticipants", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getParticipants()).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from accessing clientPortal.getCohorts", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getCohorts()).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from accessing clientPortal.getBillingRecords", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getBillingRecords()).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from accessing clientPortal.getComplianceRecords", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getComplianceRecords()).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from accessing clientPortal.getCoachingSessions", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getCoachingSessions()).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from creating organizations", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createOrganization({ name: "Test Org" })
    ).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from creating participants", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createParticipant({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      })
    ).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from creating cohorts", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createCohort({
        name: "Test Cohort",
        startDate: "2026-03-01",
      })
    ).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from creating compliance records", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createComplianceRecord({
        participantId: 1,
        assessmentType: "sle_reading",
      })
    ).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });

  it("rejects regular users from creating coaching sessions", async () => {
    const ctx = createContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createCoachingSession({ title: "Test Session" })
    ).rejects.toThrow(/hr_manager|admin|FORBIDDEN/i);
  });
});

/* ═══════════════════════════════════════════════════════════
   ADMIN ACCESS TESTS — Admin must specify organizationId
   ═══════════════════════════════════════════════════════════ */

describe("Client Portal — Admin Access Requirements", () => {
  it("admin must specify organizationId for dashboard", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    // Admin without organizationId should throw BAD_REQUEST
    await expect(caller.clientPortal.dashboard()).rejects.toThrow(/organizationId|BAD_REQUEST/i);
  });

  it("admin must specify organizationId for getParticipants", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getParticipants()).rejects.toThrow(/organizationId|BAD_REQUEST/i);
  });

  it("admin must specify organizationId for getCohorts", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getCohorts()).rejects.toThrow(/organizationId|BAD_REQUEST/i);
  });

  it("admin must specify organizationId for getBillingRecords", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getBillingRecords()).rejects.toThrow(/organizationId|BAD_REQUEST/i);
  });

  it("admin must specify organizationId for getComplianceRecords", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.clientPortal.getComplianceRecords()).rejects.toThrow(/organizationId|BAD_REQUEST/i);
  });

  it("admin can list all organizations without specifying orgId", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    // listOrganizations should work for admin without orgId
    const result = await caller.clientPortal.listOrganizations();
    expect(Array.isArray(result)).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════
   INPUT VALIDATION TESTS
   ═══════════════════════════════════════════════════════════ */

describe("Client Portal — Input Validation", () => {
  it("createOrganization requires non-empty name", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createOrganization({ name: "" })
    ).rejects.toThrow();
  });

  it("createParticipant requires valid email", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createParticipant({
        firstName: "John",
        lastName: "Doe",
        email: "not-an-email",
        organizationId: 1,
      })
    ).rejects.toThrow();
  });

  it("createParticipant requires firstName and lastName", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createParticipant({
        firstName: "",
        lastName: "Doe",
        email: "john@example.com",
        organizationId: 1,
      })
    ).rejects.toThrow();
  });

  it("createCohort requires startDate", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      // @ts-expect-error - testing missing required field
      caller.clientPortal.createCohort({ name: "Test" })
    ).rejects.toThrow();
  });

  it("createComplianceRecord requires valid assessmentType enum", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createComplianceRecord({
        participantId: 1,
        // @ts-expect-error - testing invalid enum value
        assessmentType: "invalid_type",
        organizationId: 1,
      })
    ).rejects.toThrow();
  });

  it("createCoachingSession requires non-empty title", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createCoachingSession({
        title: "",
        organizationId: 1,
      })
    ).rejects.toThrow();
  });

  it("updateCoachingSession validates rating range (1-5)", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.updateCoachingSession({
        id: 1,
        rating: 10, // out of range
      })
    ).rejects.toThrow();
  });

  it("updateCoachingSession validates status enum", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.updateCoachingSession({
        id: 1,
        // @ts-expect-error - testing invalid enum
        status: "invalid_status",
      })
    ).rejects.toThrow();
  });

  it("createParticipant validates currentLevel enum", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createParticipant({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        // @ts-expect-error - testing invalid enum
        currentLevel: "D1",
        organizationId: 1,
      })
    ).rejects.toThrow();
  });

  it("createCohort validates cefrLevel enum", async () => {
    const ctx = createContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.clientPortal.createCohort({
        name: "Test",
        startDate: "2026-03-01",
        // @ts-expect-error - testing invalid enum
        cefrLevel: "X9",
        organizationId: 1,
      })
    ).rejects.toThrow();
  });
});

/* ═══════════════════════════════════════════════════════════
   SCHEMA VALIDATION TESTS
   ═══════════════════════════════════════════════════════════ */

describe("Client Portal — Schema Structure", () => {
  it("router has all expected procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    
    // Client Portal procedures should be namespaced under clientPortal
    expect(procedures).toContain("clientPortal.dashboard");
    expect(procedures).toContain("clientPortal.getOrganization");
    expect(procedures).toContain("clientPortal.listOrganizations");
    expect(procedures).toContain("clientPortal.createOrganization");
    expect(procedures).toContain("clientPortal.getParticipants");
    expect(procedures).toContain("clientPortal.getParticipant");
    expect(procedures).toContain("clientPortal.createParticipant");
    expect(procedures).toContain("clientPortal.updateParticipant");
    expect(procedures).toContain("clientPortal.getCohorts");
    expect(procedures).toContain("clientPortal.createCohort");
    expect(procedures).toContain("clientPortal.addParticipantToCohort");
    expect(procedures).toContain("clientPortal.getCohortParticipants");
    expect(procedures).toContain("clientPortal.getBillingRecords");
    expect(procedures).toContain("clientPortal.getBillingStats");
    expect(procedures).toContain("clientPortal.getBudgetAllocations");
    expect(procedures).toContain("clientPortal.getComplianceRecords");
    expect(procedures).toContain("clientPortal.getComplianceStats");
    expect(procedures).toContain("clientPortal.createComplianceRecord");
    expect(procedures).toContain("clientPortal.getCoachingSessions");
    expect(procedures).toContain("clientPortal.createCoachingSession");
    expect(procedures).toContain("clientPortal.updateCoachingSession");
    expect(procedures).toContain("clientPortal.getSessionStats");
    // Invitation procedures
    expect(procedures).toContain("clientPortal.sendInvitation");
    expect(procedures).toContain("clientPortal.getInvitations");
    expect(procedures).toContain("clientPortal.revokeInvitation");
    expect(procedures).toContain("clientPortal.acceptInvitation");
    expect(procedures).toContain("clientPortal.validateInvitation");
  });

  it("clientPortal router has exactly 28 procedures (22 core + 6 invitation)", () => {
    const cpProcedures = Object.keys(appRouter._def.procedures).filter(p => p.startsWith("clientPortal."));
    expect(cpProcedures.length).toBe(28);
  });
});
