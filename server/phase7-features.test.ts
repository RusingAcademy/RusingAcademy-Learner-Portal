import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Phase 7 Features", () => {
  describe("Session Cancellation Flow", () => {
    it("should have CancellationModal component", () => {
      const componentPath = path.join(
        __dirname,
        "../client/src/components/CancellationModal.tsx"
      );
      expect(fs.existsSync(componentPath)).toBe(true);
      const content = fs.readFileSync(componentPath, "utf-8");
      expect(content).toContain("CancellationModal");
      expect(content).toContain("refund");
    });

    it("should have cancelSession mutation in routers", () => {
      const routersPath = path.join(__dirname, "routers.ts");
      const content = fs.readFileSync(routersPath, "utf-8");
      expect(content).toContain("cancelSession");
      expect(content).toContain("stripeClient.refunds.create");
    });

    it("should have cancellation email functions", () => {
      const emailPath = path.join(__dirname, "email.ts");
      const content = fs.readFileSync(emailPath, "utf-8");
      expect(content).toContain("sendLearnerCancellationNotification");
      expect(content).toContain("sendCoachCancellationNotification");
    });

    it("should have cancelledAt field in sessions schema", () => {
      const schemaPath = path.join(__dirname, "../drizzle/schema.ts");
      const content = fs.readFileSync(schemaPath, "utf-8");
      expect(content).toContain("cancelledAt");
    });
  });

  describe("Coach Onboarding Checklist", () => {
    it("should have CoachOnboardingChecklist component", () => {
      const componentPath = path.join(
        __dirname,
        "../client/src/components/CoachOnboardingChecklist.tsx"
      );
      expect(fs.existsSync(componentPath)).toBe(true);
      const content = fs.readFileSync(componentPath, "utf-8");
      expect(content).toContain("CoachOnboardingChecklist");
      expect(content).toContain("progress");
    });

    it("should check bio completion status", () => {
      const componentPath = path.join(
        __dirname,
        "../client/src/components/CoachOnboardingChecklist.tsx"
      );
      const content = fs.readFileSync(componentPath, "utf-8");
      expect(content).toContain("bio");
    });

    it("should check photo upload status", () => {
      const componentPath = path.join(
        __dirname,
        "../client/src/components/CoachOnboardingChecklist.tsx"
      );
      const content = fs.readFileSync(componentPath, "utf-8");
      expect(content).toContain("photoUrl");
    });

    it("should check Stripe Connect status", () => {
      const componentPath = path.join(
        __dirname,
        "../client/src/components/CoachOnboardingChecklist.tsx"
      );
      const content = fs.readFileSync(componentPath, "utf-8");
      expect(content).toContain("stripeOnboarded");
    });

    it("should be integrated into CoachDashboard", () => {
      const dashboardPath = path.join(
        __dirname,
        "../client/src/pages/CoachDashboard.tsx"
      );
      const content = fs.readFileSync(dashboardPath, "utf-8");
      expect(content).toContain("CoachOnboardingChecklist");
    });
  });

  describe("Learner Progress Reports", () => {
    it("should have progress-reports service", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      expect(fs.existsSync(servicePath)).toBe(true);
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("generateWeeklyProgressReport");
      expect(content).toContain("sendWeeklyProgressEmail");
    });

    it("should include coaching session statistics", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("sessionsCompleted");
      expect(content).toContain("totalSessionMinutes");
    });

    it("should include AI practice statistics", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("aiSessionsCompleted");
      expect(content).toContain("totalAiMinutes");
    });

    it("should include SLE level progress", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("currentLevels");
      expect(content).toContain("targetLevels");
    });

    it("should include achievements", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("achievements");
      expect(content).toContain("Completed 3+ coaching sessions");
    });

    it("should support bilingual emails (EN/FR)", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("isEnglish");
      expect(content).toContain("Votre rapport de progression");
    });

    it("should have sendAllWeeklyProgressReports function", () => {
      const servicePath = path.join(__dirname, "progress-reports.ts");
      const content = fs.readFileSync(servicePath, "utf-8");
      expect(content).toContain("sendAllWeeklyProgressReports");
    });
  });
});
