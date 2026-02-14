import { describe, it, expect } from "vitest";
import * as schema from "../drizzle/schema";

describe("Learner & Coach Features - Phase 3", () => {
  describe("Learner Favorites Schema", () => {
    it("should have learnerFavorites table with required columns", () => {
      expect(schema.learnerFavorites).toBeDefined();
      
      // Check required columns exist
      const columns = Object.keys(schema.learnerFavorites);
      expect(columns).toContain("id");
      expect(columns).toContain("learnerId");
      expect(columns).toContain("coachId");
      expect(columns).toContain("createdAt");
    });
  });

  describe("Coach Badges Schema", () => {
    it("should have coachBadges table with required columns", () => {
      expect(schema.coachBadges).toBeDefined();
      
      // Check required columns exist
      const columns = Object.keys(schema.coachBadges);
      expect(columns).toContain("id");
      expect(columns).toContain("coachId");
      expect(columns).toContain("badgeType");
      expect(columns).toContain("createdAt");
    });
  });

  describe("Coach Gallery Photos Schema", () => {
    it("should have coachGalleryPhotos table with required columns", () => {
      expect(schema.coachGalleryPhotos).toBeDefined();
      
      const columns = Object.keys(schema.coachGalleryPhotos);
      expect(columns).toContain("id");
      expect(columns).toContain("coachId");
      expect(columns).toContain("photoUrl");
      expect(columns).toContain("createdAt");
    });
  });

  describe("Push Subscriptions Schema", () => {
    it("should have pushSubscriptions table with required columns", () => {
      expect(schema.pushSubscriptions).toBeDefined();
      
      const columns = Object.keys(schema.pushSubscriptions);
      expect(columns).toContain("id");
      expect(columns).toContain("userId");
      expect(columns).toContain("endpoint");
      expect(columns).toContain("createdAt");
    });
  });

  describe("Session Notes Schema", () => {
    it("should have sessionNotes table with required columns", () => {
      expect(schema.sessionNotes).toBeDefined();
      
      const columns = Object.keys(schema.sessionNotes);
      expect(columns).toContain("id");
      expect(columns).toContain("sessionId");
      expect(columns).toContain("notes");
      expect(columns).toContain("createdAt");
    });
  });

  describe("App Router Structure", () => {
    it("should have learner router with favorites procedures", async () => {
      const { appRouter } = await import("./routers");
      
      // Check that appRouter has learner sub-router
      const routerDef = appRouter._def;
      expect(routerDef).toBeDefined();
      expect(routerDef.procedures).toBeDefined();
      
      // Check learner procedures exist
      const procedures = Object.keys(routerDef.procedures);
      expect(procedures.some(p => p.startsWith("learner."))).toBe(true);
    });

    it("should have coach router with gallery procedures", async () => {
      const { appRouter } = await import("./routers");
      
      const routerDef = appRouter._def;
      const procedures = Object.keys(routerDef.procedures);
      expect(procedures.some(p => p.startsWith("coach."))).toBe(true);
    });

    it("should have notification router", async () => {
      const { appRouter } = await import("./routers");
      
      const routerDef = appRouter._def;
      const procedures = Object.keys(routerDef.procedures);
      expect(procedures.some(p => p.startsWith("notification."))).toBe(true);
    });
  });
});
