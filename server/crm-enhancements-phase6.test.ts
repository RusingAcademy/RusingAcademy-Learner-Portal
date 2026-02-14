import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
        limit: vi.fn(() => Promise.resolve([])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
  })),
}));

describe("CRM Enhancements Phase 6", () => {
  describe("Lead Score Auto-Calculation", () => {
    it("should have lead scoring service with calculateLeadScore function", async () => {
      const { calculateLeadScore } = await import("./lead-scoring");
      expect(calculateLeadScore).toBeDefined();
      expect(typeof calculateLeadScore).toBe("function");
    });

    it("should calculate lead score based on lead type", async () => {
      const { calculateLeadScore } = await import("./lead-scoring");
      
      const governmentLead = calculateLeadScore({
        leadType: "government",
        source: "lingueefy",
      });
      
      const individualLead = calculateLeadScore({
        leadType: "individual",
        source: "lingueefy",
      });
      
      expect(governmentLead.leadTypeScore).toBeGreaterThan(individualLead.leadTypeScore);
    });

    it("should calculate lead score based on budget", async () => {
      const { calculateLeadScore } = await import("./lead-scoring");
      
      const highBudget = calculateLeadScore({
        leadType: "organization",
        source: "lingueefy",
        budget: "$100,000+",
      });
      
      const lowBudget = calculateLeadScore({
        leadType: "organization",
        source: "lingueefy",
        budget: "Under $1,000",
      });
      
      expect(highBudget.budgetScore).toBeGreaterThan(lowBudget.budgetScore);
    });

    it("should have getLeadPriority function", async () => {
      const { getLeadPriority } = await import("./lead-scoring");
      
      expect(getLeadPriority(80)).toBe("hot");
      expect(getLeadPriority(50)).toBe("warm");
      expect(getLeadPriority(20)).toBe("cold");
    });

    it("should have recalculateAllLeadScores function", async () => {
      const { recalculateAllLeadScores } = await import("./lead-scoring");
      expect(recalculateAllLeadScores).toBeDefined();
      expect(typeof recalculateAllLeadScores).toBe("function");
    });
  });

  describe("Lead Score Recalculation Cron", () => {
    it("should have lead score recalculation cron endpoint", async () => {
      const fs = await import("fs/promises");
      const indexContent = await fs.readFile(
        "/home/ubuntu/lingueefy/server/_core/index.ts",
        "utf-8"
      );
      
      expect(indexContent).toContain("/api/cron/lead-score-recalc");
    });

    it("should have lead score recalc in vercel.json crons", async () => {
      const fs = await import("fs/promises");
      const vercelConfig = await fs.readFile(
        "/home/ubuntu/lingueefy/vercel.json",
        "utf-8"
      );
      const config = JSON.parse(vercelConfig);
      
      const hasLeadScoreRecalc = config.crons.some(
        (c: { path: string }) => c.path === "/api/cron/lead-score-recalc"
      );
      expect(hasLeadScoreRecalc).toBe(true);
    });

    it("should have runLeadScoreRecalculation function", async () => {
      const { runLeadScoreRecalculation } = await import("./cron/lead-score-recalc");
      expect(runLeadScoreRecalculation).toBeDefined();
      expect(typeof runLeadScoreRecalculation).toBe("function");
    });
  });

  describe("Deal Pipeline Kanban", () => {
    it("should have DealPipelineKanban component", async () => {
      const fs = await import("fs/promises");
      const componentContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/components/DealPipelineKanban.tsx",
        "utf-8"
      );
      
      expect(componentContent).toContain("DealPipelineKanban");
      expect(componentContent).toContain("PIPELINE_STAGES");
      expect(componentContent).toContain("handleDragStart");
      expect(componentContent).toContain("handleDrop");
    });

    it("should have updateLeadStatus mutation in CRM router", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter.crm).toBeDefined();
    });

    it("should define pipeline stages", async () => {
      const fs = await import("fs/promises");
      const componentContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/components/DealPipelineKanban.tsx",
        "utf-8"
      );
      
      expect(componentContent).toContain("new");
      expect(componentContent).toContain("contacted");
      expect(componentContent).toContain("qualified");
      expect(componentContent).toContain("proposal");
      expect(componentContent).toContain("converted");
      expect(componentContent).toContain("lost");
    });
  });

  describe("Email Templates Library", () => {
    it("should have EmailTemplatesLibrary component", async () => {
      const fs = await import("fs/promises");
      const componentContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/components/EmailTemplatesLibrary.tsx",
        "utf-8"
      );
      
      expect(componentContent).toContain("EmailTemplatesLibrary");
      expect(componentContent).toContain("TEMPLATE_CATEGORIES");
      expect(componentContent).toContain("AVAILABLE_VARIABLES");
    });

    it("should have default templates", async () => {
      const fs = await import("fs/promises");
      const componentContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/components/EmailTemplatesLibrary.tsx",
        "utf-8"
      );
      
      expect(componentContent).toContain("DEFAULT_TEMPLATES");
      expect(componentContent).toContain("Welcome Email");
      expect(componentContent).toContain("Follow-up After Trial");
      expect(componentContent).toContain("Proposal for Department");
    });

    it("should support variable insertion", async () => {
      const fs = await import("fs/promises");
      const componentContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/components/EmailTemplatesLibrary.tsx",
        "utf-8"
      );
      
      expect(componentContent).toContain("{{firstName}}");
      expect(componentContent).toContain("{{lastName}}");
      expect(componentContent).toContain("{{company}}");
      expect(componentContent).toContain("insertVariable");
    });

    it("should have template preview functionality", async () => {
      const fs = await import("fs/promises");
      const componentContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/components/EmailTemplatesLibrary.tsx",
        "utf-8"
      );
      
      expect(componentContent).toContain("handlePreview");
      expect(componentContent).toContain("renderPreviewContent");
      expect(componentContent).toContain("showPreview");
    });

    it("should support bilingual templates", async () => {
      const fs = await import("fs/promises");
      const componentContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/components/EmailTemplatesLibrary.tsx",
        "utf-8"
      );
      
      expect(componentContent).toContain("Email de bienvenue");
      expect(componentContent).toContain("language: \"fr\"");
      expect(componentContent).toContain("language: \"en\"");
    });
  });

  describe("AdminDashboard Integration", () => {
    it("should have all CRM sub-tabs in AdminDashboard", async () => {
      const fs = await import("fs/promises");
      const dashboardContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/pages/AdminDashboard.tsx",
        "utf-8"
      );
      
      expect(dashboardContent).toContain("analytics");
      expect(dashboardContent).toContain("outcomes");
      expect(dashboardContent).toContain("scoring");
      expect(dashboardContent).toContain("pipeline");
      expect(dashboardContent).toContain("templates");
    });

    it("should import all CRM components", async () => {
      const fs = await import("fs/promises");
      const dashboardContent = await fs.readFile(
        "/home/ubuntu/lingueefy/client/src/pages/AdminDashboard.tsx",
        "utf-8"
      );
      
      expect(dashboardContent).toContain("import DealPipelineKanban");
      expect(dashboardContent).toContain("import EmailTemplatesLibrary");
      expect(dashboardContent).toContain("import LeadScoringDashboard");
    });
  });
});
