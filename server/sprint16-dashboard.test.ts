import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Sprint 16.2: World-Class LMS Dashboard Tests
 * Tests for new dashboard components and backend procedures
 */

describe("Sprint 16.2: Dashboard Components", () => {
  describe("Component Files Exist", () => {
    const componentDir = path.join(__dirname, "../client/src/components");
    
    it("should have StudentProgressWidget component", () => {
      const filePath = path.join(componentDir, "StudentProgressWidget.tsx");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should have UpcomingSessionsWidget component", () => {
      const filePath = path.join(componentDir, "UpcomingSessionsWidget.tsx");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should have TeamComplianceWidget component", () => {
      const filePath = path.join(componentDir, "TeamComplianceWidget.tsx");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should have TeamOverviewWidget component", () => {
      const filePath = path.join(componentDir, "TeamOverviewWidget.tsx");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should have WeeklyChallenges component", () => {
      const filePath = path.join(componentDir, "WeeklyChallenges.tsx");
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe("StudentProgressWidget Structure", () => {
    it("should export StudentProgressWidget function", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/StudentProgressWidget.tsx"),
        "utf-8"
      );
      expect(content).toContain("export function StudentProgressWidget");
    });

    it("should support bilingual labels (en/fr)", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/StudentProgressWidget.tsx"),
        "utf-8"
      );
      expect(content).toContain('language?: "en" | "fr"');
      expect(content).toContain("labels[language]");
    });

    it("should display student progress metrics", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/StudentProgressWidget.tsx"),
        "utf-8"
      );
      expect(content).toContain("progressPercent");
      expect(content).toContain("currentLevel");
      expect(content).toContain("targetLevel");
    });
  });

  describe("TeamComplianceWidget Structure", () => {
    it("should export TeamComplianceWidget function", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/TeamComplianceWidget.tsx"),
        "utf-8"
      );
      expect(content).toContain("export function TeamComplianceWidget");
    });

    it("should track compliance by department", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/TeamComplianceWidget.tsx"),
        "utf-8"
      );
      expect(content).toContain("DepartmentCompliance");
      expect(content).toContain("compliant");
      expect(content).toContain("nonCompliant");
    });

    it("should support organization target percentage", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/TeamComplianceWidget.tsx"),
        "utf-8"
      );
      expect(content).toContain("organizationTarget");
    });
  });

  describe("WeeklyChallenges Structure", () => {
    it("should export WeeklyChallenges function", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/WeeklyChallenges.tsx"),
        "utf-8"
      );
      expect(content).toContain("export function WeeklyChallenges");
    });

    it("should use tRPC for data fetching", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/WeeklyChallenges.tsx"),
        "utf-8"
      );
      expect(content).toContain("trpc.gamification");
    });

    it("should support challenge progress tracking", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "../client/src/components/WeeklyChallenges.tsx"),
        "utf-8"
      );
      expect(content).toContain("progress");
      expect(content).toContain("target");
    });
  });
});

describe("Sprint 16.2: Backend Procedures", () => {
  describe("Gamification Router", () => {
    it("should have weekly challenges procedures in gamification router", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "./routers/gamification.ts"),
        "utf-8"
      );
      expect(content).toContain("getCurrentChallenges");
      expect(content).toContain("updateChallengeProgress");
      expect(content).toContain("claimChallengeReward");
    });

    it("should have streak freeze procedure", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "./routers/gamification.ts"),
        "utf-8"
      );
      expect(content).toContain("useStreakFreeze");
    });
  });

  describe("Learner Router", () => {
    it("should have velocity data procedure", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "./routers.ts"),
        "utf-8"
      );
      expect(content).toContain("getVelocityData");
    });

    it("should have certification status procedure", () => {
      const content = fs.readFileSync(
        path.join(__dirname, "./routers.ts"),
        "utf-8"
      );
      expect(content).toContain("getCertificationStatus");
    });
  });
});

describe("Sprint 16.2: Practice Page", () => {
  it("should have Practice page component", () => {
    const filePath = path.join(__dirname, "../client/src/pages/Practice.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should integrate SLESimulationMode", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/Practice.tsx"),
      "utf-8"
    );
    expect(content).toContain("SLESimulationMode");
  });

  it("should support exam type selection", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/Practice.tsx"),
      "utf-8"
    );
    expect(content).toContain("reading");
    expect(content).toContain("writing");
    expect(content).toContain("oral");
  });

  it("should support level selection (A, B, C)", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/Practice.tsx"),
      "utf-8"
    );
    expect(content).toMatch(/level.*[ABC]/i);
  });
});

describe("Sprint 16.2: Database Schema", () => {
  it("should have SLE practice questions table", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../drizzle/schema.ts"),
      "utf-8"
    );
    expect(content).toContain("slePracticeQuestions");
  });

  it("should have weekly challenges table", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../drizzle/schema.ts"),
      "utf-8"
    );
    expect(content).toContain("weeklyChallenges");
  });

  it("should have learner certification fields", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../drizzle/schema.ts"),
      "utf-8"
    );
    expect(content).toContain("certificationDate");
    expect(content).toContain("certificationExpiry");
  });
});

describe("Sprint 16.2: Accessibility", () => {
  it("should have accessibility.css file", () => {
    const filePath = path.join(__dirname, "../client/src/styles/accessibility.css");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should include semantic color utilities", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/styles/accessibility.css"),
      "utf-8"
    );
    expect(content).toContain("badge-success");
    expect(content).toContain("badge-warning");
    expect(content).toContain("badge-danger");
  });

  it("should include focus-visible styles", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/styles/accessibility.css"),
      "utf-8"
    );
    expect(content).toContain("focus-visible");
  });
});
