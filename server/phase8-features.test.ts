import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Phase 8 Features", () => {
  describe("Progress Report Email Preferences", () => {
    it("should have weeklyReportEnabled field in learner_profiles schema", () => {
      const schemaPath = path.join(__dirname, "../drizzle/schema.ts");
      const content = fs.readFileSync(schemaPath, "utf-8");
      expect(content).toContain("weeklyReportEnabled");
    });

    it("should have weeklyReportDay field in learner_profiles schema", () => {
      const schemaPath = path.join(__dirname, "../drizzle/schema.ts");
      const content = fs.readFileSync(schemaPath, "utf-8");
      expect(content).toContain("weeklyReportDay");
    });

    it("should have updateReportPreferences mutation in routers", () => {
      const routersPath = path.join(__dirname, "routers.ts");
      const content = fs.readFileSync(routersPath, "utf-8");
      expect(content).toContain("updateReportPreferences");
    });

    it("should have getReportPreferences query in routers", () => {
      const routersPath = path.join(__dirname, "routers.ts");
      const content = fs.readFileSync(routersPath, "utf-8");
      expect(content).toContain("getReportPreferences");
    });

    it("should have ReportPreferencesCard component", () => {
      const componentPath = path.join(
        __dirname,
        "../client/src/components/ReportPreferencesCard.tsx"
      );
      expect(fs.existsSync(componentPath)).toBe(true);
      const content = fs.readFileSync(componentPath, "utf-8");
      expect(content).toContain("weeklyReportEnabled");
      expect(content).toContain("weeklyReportDay");
    });
  });

  describe("Automated Weekly Report Cron Job", () => {
    it("should have cron endpoint in server index", () => {
      const indexPath = path.join(__dirname, "_core/index.ts");
      const content = fs.readFileSync(indexPath, "utf-8");
      expect(content).toContain("/api/cron/weekly-reports");
    });

    it("should have weekly-reports cron module", () => {
      const cronPath = path.join(__dirname, "cron/weekly-reports.ts");
      expect(fs.existsSync(cronPath)).toBe(true);
      const content = fs.readFileSync(cronPath, "utf-8");
      expect(content).toContain("executeWeeklyReportsCron");
      expect(content).toContain("forceExecuteAllReports");
    });

    it("should have sendSundayProgressReports function", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("sendSundayProgressReports");
    });

    it("should have sendMondayProgressReports function", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("sendMondayProgressReports");
    });

    it("should respect weeklyReportEnabled preference", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("weeklyReportEnabled === false");
    });

    it("should filter by weeklyReportDay preference", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("weeklyReportDay !== targetDay");
    });
  });

  describe("Block Incomplete Coach Profiles", () => {
    it("should have profileComplete field in coach_profiles schema", () => {
      const schemaPath = path.join(__dirname, "../drizzle/schema.ts");
      const content = fs.readFileSync(schemaPath, "utf-8");
      expect(content).toContain("profileComplete");
    });

    it("should filter by profileComplete in getApprovedCoaches", () => {
      const dbPath = path.join(__dirname, "db.ts");
      const content = fs.readFileSync(dbPath, "utf-8");
      expect(content).toContain("eq(coachProfiles.profileComplete, true)");
    });

    it("should have recalculateProfileComplete function", () => {
      const dbPath = path.join(__dirname, "db.ts");
      const content = fs.readFileSync(dbPath, "utf-8");
      expect(content).toContain("recalculateProfileComplete");
    });

    it("should have getProfileCompletionStatus function", () => {
      const dbPath = path.join(__dirname, "db.ts");
      const content = fs.readFileSync(dbPath, "utf-8");
      expect(content).toContain("getProfileCompletionStatus");
    });

    it("should show profile hidden warning in CoachOnboardingChecklist", () => {
      const componentPath = path.join(
        __dirname,
        "../client/src/components/CoachOnboardingChecklist.tsx"
      );
      const content = fs.readFileSync(componentPath, "utf-8");
      expect(content).toContain("Profile Hidden");
      expect(content).toContain("Profil masqué");
    });

    it("should recalculate profile completeness on updateCoachProfile", () => {
      const dbPath = path.join(__dirname, "db.ts");
      const content = fs.readFileSync(dbPath, "utf-8");
      expect(content).toContain("await recalculateProfileComplete(id)");
    });
  });
});
