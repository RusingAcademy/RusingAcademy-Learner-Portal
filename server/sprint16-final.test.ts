import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Sprint 16.3: Dashboard Integration & Advanced Features Tests
 */

describe("Sprint 16.3: Coach Dashboard Integration", () => {
  it("should have StudentProgressWidget imported in CoachDashboard", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/CoachDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("StudentProgressWidget");
  });

  it("should have UpcomingSessionsWidget imported in CoachDashboard", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/CoachDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("UpcomingSessionsWidget");
  });

  it("should render StudentProgressWidget with student data", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/CoachDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("<StudentProgressWidget");
    expect(content).toContain("students={");
  });

  it("should render UpcomingSessionsWidget with session data", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/CoachDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("<UpcomingSessionsWidget");
    expect(content).toContain("sessions={");
  });
});

describe("Sprint 16.3: HR Dashboard Integration", () => {
  it("should have TeamOverviewWidget imported in HRDashboard", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/HRDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("TeamOverviewWidget");
  });

  it("should have TeamComplianceWidget imported in HRDashboard", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/HRDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("TeamComplianceWidget");
  });

  it("should render TeamOverviewWidget with team data", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/HRDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("<TeamOverviewWidget");
    expect(content).toContain("totalEmployees={");
  });

  it("should render TeamComplianceWidget with department data", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/HRDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("<TeamComplianceWidget");
    expect(content).toContain("departments={");
  });
});

describe("Sprint 16.3: SkillGapHeatmap Component", () => {
  it("should have SkillGapHeatmap component file", () => {
    const filePath = path.join(__dirname, "../client/src/components/SkillGapHeatmap.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should export SkillGapHeatmap function", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/components/SkillGapHeatmap.tsx"),
      "utf-8"
    );
    expect(content).toContain("export function SkillGapHeatmap");
  });

  it("should export CompactSkillGapHeatmap function", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/components/SkillGapHeatmap.tsx"),
      "utf-8"
    );
    expect(content).toContain("export function CompactSkillGapHeatmap");
  });

  it("should support all three competency areas", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/components/SkillGapHeatmap.tsx"),
      "utf-8"
    );
    expect(content).toContain("comprehension");
    expect(content).toContain("expression");
    expect(content).toContain("interaction");
  });

  it("should support levels A, B, C", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/components/SkillGapHeatmap.tsx"),
      "utf-8"
    );
    expect(content).toContain('"A"');
    expect(content).toContain('"B"');
    expect(content).toContain('"C"');
  });

  it("should have color coding based on score", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/components/SkillGapHeatmap.tsx"),
      "utf-8"
    );
    expect(content).toContain("getScoreColor");
    expect(content).toContain("bg-emerald");
    expect(content).toContain("bg-amber");
    expect(content).toContain("bg-red");
  });

  it("should be integrated in LearnerDashboard", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/LearnerDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("SkillGapHeatmap");
    expect(content).toContain("<SkillGapHeatmap");
  });
});

describe("Sprint 16.3: Export Service", () => {
  it("should have export service file", () => {
    const filePath = path.join(__dirname, "./export.ts");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should export generateCSV function", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "./export.ts"),
      "utf-8"
    );
    expect(content).toContain("export function generateCSV");
  });

  it("should export generateProgressReportHTML function", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "./export.ts"),
      "utf-8"
    );
    expect(content).toContain("export function generateProgressReportHTML");
  });

  it("should export generateComplianceReportHTML function", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "./export.ts"),
      "utf-8"
    );
    expect(content).toContain("export function generateComplianceReportHTML");
  });

  it("should export generateExcelXML function", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "./export.ts"),
      "utf-8"
    );
    expect(content).toContain("export function generateExcelXML");
  });

  it("should support bilingual exports (en/fr)", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "./export.ts"),
      "utf-8"
    );
    expect(content).toContain('language: "en" | "fr"');
  });

  it("should include Rusinga International Consulting Ltd. branding", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "./export.ts"),
      "utf-8"
    );
    expect(content).toContain("Rusinga International Consulting Ltd.");
  });
});

describe("Sprint 16.3: HR Dashboard Export Functionality", () => {
  it("should have CSV export button", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/HRDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("CSV");
    expect(content).toContain('handleExport("csv")');
  });

  it("should have PDF export button", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/HRDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("PDF");
    expect(content).toContain('handleExport("pdf")');
  });

  it("should have export filters", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/HRDashboard.tsx"),
      "utf-8"
    );
    expect(content).toContain("exportDepartment");
    expect(content).toContain("exportStartDate");
    expect(content).toContain("exportEndDate");
  });
});
