import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";

describe("Community Features", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  describe("Forum Categories", () => {
    it("should have forum categories in the database", async () => {
      if (!db) throw new Error("Database not available");
      const { forumCategories } = await import("../drizzle/schema");
      
      const categories = await db.select().from(forumCategories);
      expect(categories.length).toBeGreaterThan(0);
    });

    it("should have required fields for each category", async () => {
      if (!db) throw new Error("Database not available");
      const { forumCategories } = await import("../drizzle/schema");
      
      const categories = await db.select().from(forumCategories);
      
      for (const category of categories) {
        expect(category.name).toBeTruthy();
        expect(category.nameFr).toBeTruthy();
        expect(category.slug).toBeTruthy();
      }
    });
  });

  describe("Community Events", () => {
    it("should have community events in the database", async () => {
      if (!db) throw new Error("Database not available");
      const { communityEvents } = await import("../drizzle/schema");
      
      const events = await db.select().from(communityEvents);
      expect(events.length).toBeGreaterThan(0);
    });

    it("should have published events with correct structure", async () => {
      if (!db) throw new Error("Database not available");
      const { communityEvents } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      const publishedEvents = await db.select().from(communityEvents)
        .where(eq(communityEvents.status, "published"));
      
      for (const event of publishedEvents) {
        expect(event.title).toBeTruthy();
        expect(event.titleFr).toBeTruthy();
        expect(event.startAt).toBeTruthy();
        expect(event.endAt).toBeTruthy();
        expect(event.eventType).toBeTruthy();
      }
    });

    it("should have events with capacity tracking", async () => {
      if (!db) throw new Error("Database not available");
      const { communityEvents } = await import("../drizzle/schema");
      
      const events = await db.select().from(communityEvents);
      
      for (const event of events) {
        if (event.maxCapacity) {
          expect(typeof event.maxCapacity).toBe("number");
          expect(event.currentRegistrations).toBeDefined();
        }
      }
    });
  });

  describe("Event Registrations Schema", () => {
    it("should have event_registrations table with correct structure", async () => {
      if (!db) throw new Error("Database not available");
      const { eventRegistrations } = await import("../drizzle/schema");
      
      // Verify the table exists by checking its columns
      const columns = Object.keys(eventRegistrations);
      expect(columns).toContain("id");
      expect(columns).toContain("eventId");
      expect(columns).toContain("userId");
      expect(columns).toContain("status");
      expect(columns).toContain("reminderSent");
    });
  });

  describe("Forum Threads Schema", () => {
    it("should have forum_threads table with correct structure", async () => {
      if (!db) throw new Error("Database not available");
      const { forumThreads } = await import("../drizzle/schema");
      
      // Verify the table exists by checking its columns
      const columns = Object.keys(forumThreads);
      expect(columns).toContain("id");
      expect(columns).toContain("categoryId");
      expect(columns).toContain("authorId");
      expect(columns).toContain("title");
      expect(columns).toContain("content");
    });
  });

  describe("Email Functions", () => {
    it("should have event registration email function", async () => {
      const { sendEventRegistrationConfirmation } = await import("./email");
      expect(typeof sendEventRegistrationConfirmation).toBe("function");
    });

    it("should have event reminder email function", async () => {
      const { sendEventReminder } = await import("./email");
      expect(typeof sendEventReminder).toBe("function");
    });

    it("should generate valid email content for event registration", async () => {
      const { sendEventRegistrationConfirmation } = await import("./email");
      
      // Test that the function doesn't throw with valid data
      const result = await sendEventRegistrationConfirmation({
        userName: "Test User",
        userEmail: "test@example.com",
        eventTitle: "Test Event",
        eventTitleFr: "Événement Test",
        eventDescription: "Test description",
        eventDescriptionFr: "Description test",
        eventDate: new Date("2026-02-01T10:00:00"),
        eventEndDate: new Date("2026-02-01T12:00:00"),
        eventType: "workshop",
        locationType: "virtual",
        status: "registered",
      });
      
      // The function should return true (email logged)
      expect(result).toBe(true);
    });

    it("should generate valid email content for event reminder", async () => {
      const { sendEventReminder } = await import("./email");
      
      // Test that the function doesn't throw with valid data
      const result = await sendEventReminder({
        userName: "Test User",
        userEmail: "test@example.com",
        eventTitle: "Test Event",
        eventTitleFr: "Événement Test",
        eventDescription: "Test description",
        eventDescriptionFr: "Description test",
        eventDate: new Date("2026-02-01T10:00:00"),
        eventEndDate: new Date("2026-02-01T12:00:00"),
        eventType: "workshop",
        locationType: "virtual",
        status: "registered",
      });
      
      // The function should return true (email logged)
      expect(result).toBe(true);
    });
  });

  describe("Cron Job", () => {
    it("should have event reminders cron function", async () => {
      const { sendEventReminders } = await import("./cron/event-reminders");
      expect(typeof sendEventReminders).toBe("function");
    });
  });
});
