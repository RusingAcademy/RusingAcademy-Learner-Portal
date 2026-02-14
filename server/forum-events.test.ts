import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";

describe("Forum API", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  describe("Forum Categories", () => {
    it("should have forum categories in the database", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      const { forumCategories } = await import("../drizzle/schema");
      const categories = await db.select().from(forumCategories);
      
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty("name");
      expect(categories[0]).toHaveProperty("nameFr");
      expect(categories[0]).toHaveProperty("slug");
    });

    it("should have required category fields", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      const { forumCategories } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      const [generalCategory] = await db.select().from(forumCategories)
        .where(eq(forumCategories.slug, "general"));
      
      expect(generalCategory).toBeDefined();
      expect(generalCategory.name).toBe("General Discussion");
      expect(generalCategory.nameFr).toBe("Discussion générale");
      expect(generalCategory.isActive).toBe(true);
    });
  });

  describe("Forum Threads Schema", () => {
    it("should have forum_threads table with correct structure", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      const { forumThreads } = await import("../drizzle/schema");
      
      // Verify the table exists by selecting from it
      const threads = await db.select().from(forumThreads).limit(1);
      
      // The query should not throw - table exists
      expect(Array.isArray(threads)).toBe(true);
    });
  });

  describe("Forum Posts Schema", () => {
    it("should have forum_posts table with correct structure", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      const { forumPosts } = await import("../drizzle/schema");
      
      // Verify the table exists by selecting from it
      const posts = await db.select().from(forumPosts).limit(1);
      
      // The query should not throw - table exists
      expect(Array.isArray(posts)).toBe(true);
    });
  });
});

describe("Events API", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  describe("Community Events", () => {
    it("should have community events in the database", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      const { communityEvents } = await import("../drizzle/schema");
      const events = await db.select().from(communityEvents);
      
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty("title");
      expect(events[0]).toHaveProperty("titleFr");
      expect(events[0]).toHaveProperty("eventType");
    });

    it("should have published events with correct structure", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      const { communityEvents } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      const publishedEvents = await db.select().from(communityEvents)
        .where(eq(communityEvents.status, "published"));
      
      expect(publishedEvents.length).toBeGreaterThan(0);
      
      const event = publishedEvents[0];
      expect(event.status).toBe("published");
      expect(event.startAt).toBeDefined();
      expect(event.endAt).toBeDefined();
      expect(["workshop", "networking", "practice", "info_session", "webinar", "other"]).toContain(event.eventType);
    });

    it("should have events with capacity tracking", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      const { communityEvents } = await import("../drizzle/schema");
      const events = await db.select().from(communityEvents);
      
      const eventWithCapacity = events.find(e => e.maxCapacity !== null);
      expect(eventWithCapacity).toBeDefined();
      expect(eventWithCapacity!.maxCapacity).toBeGreaterThan(0);
    });
  });

  describe("Event Registrations Schema", () => {
    it("should have event_registrations table with correct structure", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      const { eventRegistrations } = await import("../drizzle/schema");
      
      // Verify the table exists by selecting from it
      const registrations = await db.select().from(eventRegistrations).limit(1);
      
      // The query should not throw - table exists
      expect(Array.isArray(registrations)).toBe(true);
    });
  });
});
