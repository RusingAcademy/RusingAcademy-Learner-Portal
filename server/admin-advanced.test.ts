import { describe, it, expect } from "vitest";
import * as schema from "../drizzle/schema";

describe("Admin Advanced Features - Schema & Structure", () => {
  describe("Course Builder with Drag & Drop", () => {
    it("courseModules table has sortOrder field for drag & drop reordering", () => {
      expect(schema.courseModules).toBeDefined();
      const columns = Object.keys(schema.courseModules);
      expect(columns).toContain("sortOrder");
    });

    it("lessons table has sortOrder field for drag & drop reordering", () => {
      expect(schema.lessons).toBeDefined();
      const columns = Object.keys(schema.lessons);
      expect(columns).toContain("sortOrder");
    });

    it("courses table has required fields for Course Builder", () => {
      expect(schema.courses).toBeDefined();
      const columns = Object.keys(schema.courses);
      expect(columns).toContain("title");
      expect(columns).toContain("status");
      expect(columns).toContain("category");
    });

    it("courseModules table has moduleId and courseId for relationships", () => {
      const columns = Object.keys(schema.courseModules);
      expect(columns).toContain("courseId");
      expect(columns).toContain("title");
    });

    it("lessons table has moduleId and contentType for relationships", () => {
      const columns = Object.keys(schema.lessons);
      expect(columns).toContain("moduleId");
      expect(columns).toContain("title");
      expect(columns).toContain("contentType");
    });
  });

  describe("Funnel Builder", () => {
    it("followUpSequences table exists for funnel/automation sequences", () => {
      expect(schema.followUpSequences).toBeDefined();
      const columns = Object.keys(schema.followUpSequences);
      expect(columns).toContain("name");
      expect(columns).toContain("isActive");
    });

    it("ecosystemLeads table exists for funnel contacts tracking", () => {
      expect(schema.ecosystemLeads).toBeDefined();
      const columns = Object.keys(schema.ecosystemLeads);
      expect(columns).toContain("email");
      expect(columns).toContain("firstName");
    });
  });

  describe("Automations", () => {
    it("followUpSequences supports automation trigger types", () => {
      expect(schema.followUpSequences).toBeDefined();
      const columns = Object.keys(schema.followUpSequences);
      expect(columns).toContain("triggerType");
    });

    it("sequenceSteps table exists for automation step definitions", () => {
      expect(schema.sequenceSteps).toBeDefined();
      const columns = Object.keys(schema.sequenceSteps);
      expect(columns).toContain("sequenceId");
      expect(columns).toContain("stepOrder");
      expect(columns).toContain("emailSubjectEn");
    });
  });

  describe("Admin Layout Structure", () => {
    it("admin pages directory contains all required page files", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const adminDir = path.resolve(__dirname, "../client/src/pages/admin");
      
      const requiredFiles = [
        "DashboardOverview.tsx",
        "UsersRoles.tsx",
        "CoachesManagement.tsx",
        "CourseBuilder.tsx",
        "PricingCheckout.tsx",
        "CouponsPage.tsx",
        "CRMPage.tsx",
        "EmailPage.tsx",
        "FunnelBuilder.tsx",
        "Automations.tsx",
        "Analytics.tsx",
        "ActivityLogs.tsx",
        "PreviewStudent.tsx",
        "AdminSettings.tsx",
        "index.ts",
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(adminDir, file);
        expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
      }
    });

    it("AdminLayout component exists", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const layoutPath = path.resolve(__dirname, "../client/src/components/AdminLayout.tsx");
      expect(fs.existsSync(layoutPath)).toBe(true);
    });

    it("AdminControlCenter component exists", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const controlPath = path.resolve(__dirname, "../client/src/pages/AdminControlCenter.tsx");
      expect(fs.existsSync(controlPath)).toBe(true);
    });
  });
});
