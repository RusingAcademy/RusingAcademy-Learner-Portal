import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * AppDashboard & AppLayout Wrapper Architecture Tests
 *
 * These tests validate the unified dashboard architecture by checking
 * file-level contracts:
 * 1. AppLayoutContext exists and exports the right API
 * 2. All sub-pages import useAppLayout from AppLayoutContext
 * 3. All sub-pages use isInsideAppLayout to conditionally render Header/Footer
 * 4. EcosystemLayout excludes /app routes from global header
 * 5. AppDashboard maps all expected section IDs
 */

const CLIENT_SRC = path.resolve(
  import.meta.dirname,
  "..",
  "client",
  "src"
);

function readFile(relativePath: string): string {
  return fs.readFileSync(path.resolve(CLIENT_SRC, relativePath), "utf-8");
}

// ── 1. AppLayoutContext contract ────────────────────────────────────
describe("AppLayoutContext", () => {
  const source = readFile("contexts/AppLayoutContext.tsx");

  it("exports AppLayoutProvider component", () => {
    expect(source).toContain("export function AppLayoutProvider");
  });

  it("exports useAppLayout hook", () => {
    expect(source).toContain("export function useAppLayout");
  });

  it("provides isInsideAppLayout boolean", () => {
    expect(source).toContain("isInsideAppLayout");
  });

  it("sets isInsideAppLayout to true inside provider", () => {
    expect(source).toContain("isInsideAppLayout: true");
  });

  it("defaults isInsideAppLayout to false outside provider", () => {
    expect(source).toContain("isInsideAppLayout: false");
  });
});

// ── 2. All sub-pages use useAppLayout ──────────────────────────────
// Pages that have Header/Footer and need the conditional wrapper
const SUB_PAGES_WITH_HEADER_FOOTER = [
  "AICoach",
  "ConversationPractice",
  "SLEPractice",
  "LearnerLoyalty",
  "CoachProfileEditor",
  "CoachGuide",
  "LearnerSettings",
  "LearnerProgress",
  "LearnerPayments",
  "LearnerFavorites",
  "MySessions",
  "CoachAvailabilityPage",
  "CoachEarnings",
  "LearnerDashboard",
  "CoachDashboard",
  "HRDashboard",
];

// Pages that don't have their own Header/Footer (no wrapping needed)
// but still import useAppLayout for future-proofing
const SUB_PAGES_WITHOUT_HEADER_FOOTER = [
  "PracticeHistory",
  "BadgesCatalog",
  "VideoSession",
];

const ALL_SUB_PAGES = [...SUB_PAGES_WITH_HEADER_FOOTER, ...SUB_PAGES_WITHOUT_HEADER_FOOTER];

describe("Sub-page useAppLayout integration", () => {
  // All pages should import and use useAppLayout
  for (const page of ALL_SUB_PAGES) {
    describe(page, () => {
      const filePath = `pages/${page}.tsx`;
      let source: string;

      try {
        source = readFile(filePath);
      } catch {
        source = "";
      }

      it("file exists", () => {
        expect(source.length).toBeGreaterThan(0);
      });

      it("imports useAppLayout", () => {
        expect(source).toContain("useAppLayout");
      });

      it("uses isInsideAppLayout flag", () => {
        expect(source).toContain("isInsideAppLayout");
      });
    });
  }

  // Pages with Header/Footer should conditionally hide them
  for (const page of SUB_PAGES_WITH_HEADER_FOOTER) {
    it(`${page} conditionally hides Header or Footer when inside AppLayout`, () => {
      const source = readFile(`pages/${page}.tsx`);
      const hasConditionalHeader =
        source.includes("!isInsideAppLayout && <Header") ||
        source.includes("!isInsideAppLayout && <EcosystemHeaderGold");
      const hasConditionalFooter =
        source.includes("!isInsideAppLayout && <Footer") ||
        source.includes("!isInsideAppLayout && <EcosystemFooter");
      const hasWrapPattern =
        source.includes("if (isInsideAppLayout) return") ||
        source.includes("isInsideAppLayout) return <>");

      expect(
        hasConditionalHeader || hasConditionalFooter || hasWrapPattern
      ).toBe(true);
    });
  }
});

// ── 3. AppDashboard section registry ────────────────────────────────
describe("AppDashboard section registry", () => {
  const source = readFile("pages/AppDashboard.tsx");

  const EXPECTED_SECTIONS = [
    "overview",
    "my-courses",
    "my-progress",
    "my-sessions",
    "my-payments",
    "favorites",
    "settings",
    "ai-practice",
    "conversation",
    "practice-history",
    "simulation",
    "badges",
    "loyalty",
    "my-students",
    "availability",
    "coach-profile",
    "earnings",
    "video-sessions",
    "coach-guide",
    "team",
    "cohorts",
    "budget",
    "compliance",
  ];

  for (const section of EXPECTED_SECTIONS) {
    it(`maps section "${section}"`, () => {
      // The section map should contain this key (quoted or unquoted in JS object)
      const hasQuoted = source.includes(`"${section}"`);
      const hasUnquoted = source.includes(`${section}:`);
      expect(hasQuoted || hasUnquoted).toBe(true);
    });
  }

  it("wraps content in AppLayout", () => {
    expect(source).toContain("<AppLayout>");
    expect(source).toContain("</AppLayout>");
  });

  it("uses Suspense for lazy loading", () => {
    expect(source).toContain("<Suspense");
  });
});

// ── 4. EcosystemLayout excludes /app routes ─────────────────────────
describe("EcosystemLayout path exclusions", () => {
  const source = readFile("components/EcosystemLayout.tsx");

  it("excludes /app from global header rendering", () => {
    // Should have /app in excluded paths
    expect(source).toContain("/app");
  });

  it("excludes /learn from global header rendering", () => {
    expect(source).toContain("/learn");
  });

  it("has an EXCLUDED_PATHS or similar mechanism", () => {
    const hasExcludedPaths =
      source.includes("EXCLUDED_PATHS") ||
      source.includes("excludedPaths") ||
      source.includes("excluded_paths") ||
      source.includes("shouldExclude");
    expect(hasExcludedPaths).toBe(true);
  });
});

// ── 5. AppLayout provides context ──────────────────────────────────
describe("AppLayout provides AppLayoutContext", () => {
  const source = readFile("components/AppLayout.tsx");

  it("imports AppLayoutProvider", () => {
    expect(source).toContain("AppLayoutProvider");
  });

  it("wraps children in AppLayoutProvider", () => {
    expect(source).toContain("<AppLayoutProvider>");
  });
});
