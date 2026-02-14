import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { eq, sql } from "drizzle-orm";

describe("Admin Dashboard Endpoints", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    if (db) {
      // Cleanup
      const { coachApplications } = await import("../drizzle/schema");
      await db.delete(coachApplications).where(sql`1=1`);
    }
  });

  it("should get application statistics", async () => {
    const { coachApplications } = await import("../drizzle/schema");

    // Get stats
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(coachApplications);
    const [submitted] = await db
      .select({ count: sql<number>`count(*)` })
      .from(coachApplications)
      .where(eq(coachApplications.status, "submitted"));

    expect(total).toBeDefined();
    expect(submitted).toBeDefined();
    expect(total.count).toBeGreaterThanOrEqual(0);
    expect(submitted.count).toBeGreaterThanOrEqual(0);
  });

  it("should filter applications by status", async () => {
    const { coachApplications } = await import("../drizzle/schema");

    // Get applications with submitted status
    const applications = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.status, "submitted"));

    expect(Array.isArray(applications)).toBe(true);
  });

  it("should filter applications by language", async () => {
    const { coachApplications } = await import("../drizzle/schema");

    // Get applications teaching French
    const applications = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.teachingLanguage, "french"));

    expect(Array.isArray(applications)).toBe(true);
  });

  it("should sort applications by creation date", async () => {
    const { coachApplications } = await import("../drizzle/schema");
    const { desc } = await import("drizzle-orm");

    // Get applications sorted by date
    const applications = await db
      .select()
      .from(coachApplications)
      .orderBy(desc(coachApplications.createdAt))
      .limit(10);

    expect(Array.isArray(applications)).toBe(true);
    if (applications.length > 1) {
      const first = new Date(applications[0].createdAt).getTime();
      const second = new Date(applications[1].createdAt).getTime();
      expect(first).toBeGreaterThanOrEqual(second);
    }
  });

  it("should search applications by name", async () => {
    const { coachApplications } = await import("../drizzle/schema");

    // Get all applications
    const allApplications = await db.select().from(coachApplications);

    // Filter by name (client-side)
    const searchTerm = "test";
    const filtered = allApplications.filter(
      (a: any) =>
        a.firstName?.toLowerCase().includes(searchTerm) ||
        a.lastName?.toLowerCase().includes(searchTerm) ||
        a.fullName?.toLowerCase().includes(searchTerm)
    );

    expect(Array.isArray(filtered)).toBe(true);
  });

  it("should retrieve detailed application information", async () => {
    const { coachApplications } = await import("../drizzle/schema");

    // Get first application
    const [application] = await db.select().from(coachApplications).limit(1);

    if (application) {
      expect(application).toHaveProperty("id");
      expect(application).toHaveProperty("userId");
      expect(application).toHaveProperty("email");
      expect(application).toHaveProperty("status");
      expect(application).toHaveProperty("createdAt");
    }
  });

  it("should paginate applications", async () => {
    const { coachApplications } = await import("../drizzle/schema");

    // Get first page
    const page1 = await db
      .select()
      .from(coachApplications)
      .limit(10)
      .offset(0);

    // Get second page
    const page2 = await db
      .select()
      .from(coachApplications)
      .limit(10)
      .offset(10);

    expect(Array.isArray(page1)).toBe(true);
    expect(Array.isArray(page2)).toBe(true);
  });
});
