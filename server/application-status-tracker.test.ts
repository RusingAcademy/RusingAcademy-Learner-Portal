import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, coachApplications } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Application Status Tracker", () => {
  let testUserId: number;
  let testApplicationId: number;
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test user
    const result = await db
      .insert(users)
      .values({
        openId: `test-user-${Date.now()}`,
        name: "Test Coach",
        email: `test-${Date.now()}@example.com`,
        role: "user",
      });

    // Get the inserted user ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.openId, `test-user-${Date.now()}`))
      .limit(1);

    testUserId = user?.id || 1;
  });

  afterAll(async () => {
    if (!db) return;
    // Clean up test data - delete applications first due to foreign key constraints
    try {
      const { learnerProfiles, coachProfiles } = await import("../drizzle/schema");
      // Delete related records first
      await db.delete(learnerProfiles).where(eq(learnerProfiles.userId, testUserId)).catch(() => {});
      await db.delete(coachProfiles).where(eq(coachProfiles.userId, testUserId)).catch(() => {});
      await db.delete(coachApplications).where(eq(coachApplications.userId, testUserId)).catch(() => {});
      // Then delete user
      await db.delete(users).where(eq(users.id, testUserId)).catch(() => {});
    } catch (e) {
      // Silently ignore cleanup errors
    }
  });

  it("should create a coach application with submitted status", async () => {
    await db
      .insert(coachApplications)
      .values({
        userId: testUserId,
        fullName: "Test Coach",
        email: "test@example.com",
        firstName: "Test",
        lastName: "Coach",
        nativeLanguage: "English",
        teachingLanguage: "French",
        status: "submitted",
      });

    const [application] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.userId, testUserId))
      .limit(1);

    testApplicationId = application.id;

    expect(application).toBeDefined();
    expect(application.userId).toBe(testUserId);
    expect(application.status).toBe("submitted");
    expect(application.fullName).toBe("Test Coach");
  });

  it("should retrieve application status by user ID", async () => {
    const [application] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.userId, testUserId));

    expect(application).toBeDefined();
    expect(application.status).toBe("submitted");
    expect(application.createdAt).toBeDefined();
  });

  it("should update application status to under_review", async () => {
    await db
      .update(coachApplications)
      .set({
        status: "under_review",
        updatedAt: new Date(),
      })
      .where(eq(coachApplications.id, testApplicationId));

    const [updated] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.id, testApplicationId));

    expect(updated.status).toBe("under_review");
  });

  it("should update application status to approved with review notes", async () => {
    const now = new Date();
    await db
      .update(coachApplications)
      .set({
        status: "approved",
        reviewedAt: now,
        reviewNotes: "Excellent qualifications",
        updatedAt: now,
      })
      .where(eq(coachApplications.id, testApplicationId));

    const [updated] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.id, testApplicationId));

    expect(updated.status).toBe("approved");
    expect(updated.reviewNotes).toBe("Excellent qualifications");
    expect(updated.reviewedAt).toBeDefined();
  });

  it("should retrieve application timeline for user", async () => {
    const applications = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.userId, testUserId));

    expect(applications).toBeDefined();
    expect(applications.length).toBeGreaterThan(0);
    expect(applications[0].status).toBe("approved");
  });

  it("should handle rejected applications with reason", async () => {
    // Create another test application
    await db
      .insert(coachApplications)
      .values({
        userId: testUserId,
        fullName: "Another Coach",
        email: "another@example.com",
        firstName: "Another",
        lastName: "Coach",
        nativeLanguage: "French",
        teachingLanguage: "English",
        status: "submitted",
      });

    const [rejectedApp] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.email, "another@example.com"))
      .limit(1);

    const rejectionReason = "Insufficient teaching experience";
    await db
      .update(coachApplications)
      .set({
        status: "rejected",
        reviewedAt: new Date(),
        reviewNotes: rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(coachApplications.id, rejectedApp.id));

    const [rejected] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.id, rejectedApp.id));

    expect(rejected.status).toBe("rejected");
    expect(rejected.reviewNotes).toBe(rejectionReason);

    // Clean up
    try {
      await db
        .delete(coachApplications)
        .where(eq(coachApplications.id, rejectedApp.id));
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  it("should track application status transitions", async () => {
    // Create a fresh application to track transitions
    await db
      .insert(coachApplications)
      .values({
        userId: testUserId,
        fullName: "Transition Test",
        email: "transition@example.com",
        firstName: "Transition",
        lastName: "Test",
        nativeLanguage: "English",
        teachingLanguage: "French",
        status: "submitted",
      });

    const [app] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.email, "transition@example.com"))
      .limit(1);

    const submittedAt = app.createdAt;

    // Simulate status transitions
    const statuses = ["submitted", "under_review", "approved"];
    for (const status of statuses) {
      await db
        .update(coachApplications)
        .set({
          status: status as any,
          updatedAt: new Date(),
        })
        .where(eq(coachApplications.id, app.id));
    }

    const [final] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.id, app.id));

    expect(final).toBeDefined();
    expect(final?.status).toBe("approved");
    expect(final?.updatedAt?.getTime()).toBeGreaterThanOrEqual(
      submittedAt.getTime()
    );

    // Clean up
    try {
      await db.delete(coachApplications).where(eq(coachApplications.id, app.id));
    } catch (e) {
      // Ignore cleanup errors
    }
  });
});
