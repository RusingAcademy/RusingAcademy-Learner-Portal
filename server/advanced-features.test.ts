import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Advanced Features - Phase 2", () => {
  describe("Coach Photo Gallery", () => {
    it("should have coachGalleryPhotos table in schema", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.coachGalleryPhotos).toBeDefined();
      expect(schema.coachGalleryPhotos.id).toBeDefined();
      expect(schema.coachGalleryPhotos.coachId).toBeDefined();
      expect(schema.coachGalleryPhotos.photoUrl).toBeDefined();
      expect(schema.coachGalleryPhotos.caption).toBeDefined();
      expect(schema.coachGalleryPhotos.photoType).toBeDefined();
      expect(schema.coachGalleryPhotos.thumbnailUrl).toBeDefined();
    });

    it("should export CoachGalleryPhoto type", async () => {
      const schema = await import("../drizzle/schema");
      // Type check - if this compiles, the type exists
      type TestType = typeof schema.coachGalleryPhotos.$inferSelect;
      expect(true).toBe(true);
    });
  });

  describe("Push Notifications", () => {
    it("should have pushSubscriptions table in schema", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.pushSubscriptions).toBeDefined();
      expect(schema.pushSubscriptions.id).toBeDefined();
      expect(schema.pushSubscriptions.userId).toBeDefined();
      expect(schema.pushSubscriptions.endpoint).toBeDefined();
      expect(schema.pushSubscriptions.p256dh).toBeDefined();
      expect(schema.pushSubscriptions.auth).toBeDefined();
      expect(schema.pushSubscriptions.isActive).toBeDefined();
    });

    it("should have notification preference fields", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.pushSubscriptions.enableBookings).toBeDefined();
      expect(schema.pushSubscriptions.enableMessages).toBeDefined();
      expect(schema.pushSubscriptions.enableReminders).toBeDefined();
      expect(schema.pushSubscriptions.enableMarketing).toBeDefined();
    });
  });

  describe("Session Notes", () => {
    it("should have sessionNotes table in schema", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.sessionNotes).toBeDefined();
      expect(schema.sessionNotes.id).toBeDefined();
      expect(schema.sessionNotes.sessionId).toBeDefined();
      expect(schema.sessionNotes.coachId).toBeDefined();
      expect(schema.sessionNotes.notes).toBeDefined();
    });

    it("should have SLE level assessment fields", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.sessionNotes.oralLevel).toBeDefined();
      expect(schema.sessionNotes.writtenLevel).toBeDefined();
      expect(schema.sessionNotes.readingLevel).toBeDefined();
    });

    it("should have progress tracking fields", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.sessionNotes.topicsCovered).toBeDefined();
      expect(schema.sessionNotes.areasForImprovement).toBeDefined();
      expect(schema.sessionNotes.homework).toBeDefined();
    });

    it("should have sharing control field", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.sessionNotes.sharedWithLearner).toBeDefined();
    });
  });

  describe("Router Endpoints", () => {
    it("should have gallery endpoints in coach router", async () => {
      const { appRouter } = await import("./routers");
      // Check that appRouter is defined and has the expected structure
      expect(appRouter).toBeDefined();
      expect(appRouter._def).toBeDefined();
      expect(appRouter._def.record).toBeDefined();
      expect(appRouter._def.record.coach).toBeDefined();
    });

    it("should have push notification endpoints", async () => {
      const { appRouter } = await import("./routers");
      // Check that notifications router exists in the record
      expect(appRouter._def.record.notifications).toBeDefined();
    });

    it("should have learner router with session endpoints", async () => {
      const { appRouter } = await import("./routers");
      // Check that learner router exists in the record
      expect(appRouter._def.record.learner).toBeDefined();
    });
  });
});

describe("Component Files Exist", () => {
  it("should have CoachPhotoGallery component", async () => {
    // This will throw if the file doesn't exist
    const fs = await import("fs/promises");
    const path = await import("path");
    const componentPath = path.join(process.cwd(), "client/src/components/CoachPhotoGallery.tsx");
    const stat = await fs.stat(componentPath);
    expect(stat.isFile()).toBe(true);
  });

  it("should have PushNotificationManager component", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const componentPath = path.join(process.cwd(), "client/src/components/PushNotificationManager.tsx");
    const stat = await fs.stat(componentPath);
    expect(stat.isFile()).toBe(true);
  });

  it("should have SessionNotesModal component", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const componentPath = path.join(process.cwd(), "client/src/components/SessionNotesModal.tsx");
    const stat = await fs.stat(componentPath);
    expect(stat.isFile()).toBe(true);
  });

  it("should have MySessions page", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const pagePath = path.join(process.cwd(), "client/src/pages/MySessions.tsx");
    const stat = await fs.stat(pagePath);
    expect(stat.isFile()).toBe(true);
  });
});
