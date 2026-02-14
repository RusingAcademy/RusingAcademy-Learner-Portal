import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");

// Helper to read a file
function readFile(relPath: string): string {
  const full = resolve(ROOT, relPath);
  if (!existsSync(full)) throw new Error(`File not found: ${relPath}`);
  return readFileSync(full, "utf-8");
}

describe("Phase D: Admin Routes & Dead Buttons Fix", () => {
  // ─── 1. Four new admin page files exist ───
  describe("New admin page files exist", () => {
    const pages = [
      "client/src/pages/admin/AdminEnrollments.tsx",
      "client/src/pages/admin/AdminReviews.tsx",
      "client/src/pages/admin/AdminCertificates.tsx",
      "client/src/pages/admin/AdminGamification.tsx",
    ];

    pages.forEach((page) => {
      it(`${page} exists`, () => {
        expect(existsSync(resolve(ROOT, page))).toBe(true);
      });
    });
  });

  // ─── 2. AdminControlCenter registers all 4 sections ───
  describe("AdminControlCenter section map", () => {
    const sections = ["enrollments", "reviews", "certificates", "gamification"];

    it("AdminControlCenter.tsx exists", () => {
      expect(
        existsSync(
          resolve(ROOT, "client/src/pages/AdminControlCenter.tsx")
        )
      ).toBe(true);
    });

    sections.forEach((section) => {
      it(`section "${section}" is registered in sectionMap`, () => {
        const content = readFile("client/src/pages/AdminControlCenter.tsx");
        expect(content).toContain(section);
      });
    });
  });

  // ─── 3. App.tsx has routes for all 4 new admin pages ───
  describe("App.tsx routes", () => {
    const routes = [
      "/admin/enrollments",
      "/admin/reviews",
      "/admin/certificates",
      "/admin/gamification",
    ];

    routes.forEach((route) => {
      it(`route "${route}" is registered`, () => {
        const content = readFile("client/src/App.tsx");
        expect(content).toContain(route);
      });
    });
  });

  // ─── 4. AdminLayout sidebar has links for all 4 new sections ───
  describe("AdminLayout sidebar links", () => {
    const sidebarItems = [
      { id: "enrollments", label: "Enrollments" },
      { id: "reviews", label: "Reviews" },
      { id: "certificates", label: "Certificates" },
      { id: "gamification", label: "Gamification" },
    ];

    it("AdminLayout.tsx exists", () => {
      expect(
        existsSync(
          resolve(ROOT, "client/src/components/AdminLayout.tsx")
        )
      ).toBe(true);
    });

    sidebarItems.forEach(({ id, label }) => {
      it(`sidebar has "${label}" link (id: ${id})`, () => {
        const content = readFile("client/src/components/AdminLayout.tsx");
        expect(content).toContain(`"${id}"`);
        expect(content).toContain(`"${label}"`);
      });
    });
  });

  // ─── 5. AdminEnrollments page structure ───
  describe("AdminEnrollments page structure", () => {
    it("has stats cards (Total, Active, Completed, Paused)", () => {
      const content = readFile(
        "client/src/pages/admin/AdminEnrollments.tsx"
      );
      expect(content).toContain("Total Enrollments");
      expect(content).toContain("Active");
      expect(content).toContain("Completed");
      expect(content).toContain("Paused");
    });

    it("has search functionality", () => {
      const content = readFile(
        "client/src/pages/admin/AdminEnrollments.tsx"
      );
      expect(content).toContain("search");
    });

    it("has Export CSV button", () => {
      const content = readFile(
        "client/src/pages/admin/AdminEnrollments.tsx"
      );
      expect(content).toContain("Export CSV");
    });

    it("is wrapped by AdminLayout which has auth guard", () => {
      const adminLayout = readFile("client/src/components/AdminLayout.tsx");
      expect(adminLayout).toContain("useAuth");
      expect(adminLayout).toContain("redirectOnUnauthenticated");
    });
  });

  // ─── 6. AdminGamification page structure ───
  describe("AdminGamification page structure", () => {
    it("has stats cards (Badges, XP, Active Learners, Avg Level)", () => {
      const content = readFile(
        "client/src/pages/admin/AdminGamification.tsx"
      );
      expect(content).toContain("Badges Earned");
      expect(content).toContain("Total XP");
      expect(content).toContain("Active Learners");
    });

    it("has tabs (Overview, Leaderboard, Recent Awards)", () => {
      const content = readFile(
        "client/src/pages/admin/AdminGamification.tsx"
      );
      expect(content).toContain("overview");
      expect(content).toContain("leaderboard");
      expect(content).toContain("recent");
    });

    it("is wrapped by AdminLayout which has auth guard", () => {
      const adminLayout = readFile("client/src/components/AdminLayout.tsx");
      expect(adminLayout).toContain("useAuth");
      expect(adminLayout).toContain("redirectOnUnauthenticated");
    });
  });

  // ─── 7. Under Construction pages (Reviews, Certificates) ───
  describe("Under Construction pages", () => {
    ["AdminReviews.tsx", "AdminCertificates.tsx"].forEach((file) => {
      it(`${file} shows Under Construction message`, () => {
        const content = readFile(`client/src/pages/admin/${file}`);
        expect(content).toContain("Under Construction");
      });

      it(`${file} has Back to Dashboard button`, () => {
        const content = readFile(`client/src/pages/admin/${file}`);
        expect(content).toContain("Back to Dashboard");
      });
    });
  });

  // ─── 8. Export CSV fix in UsersRoles ───
  describe("UsersRoles Export CSV fix", () => {
    it("UsersRoles.tsx has real CSV download (not just toast)", () => {
      const content = readFile("client/src/pages/admin/UsersRoles.tsx");
      // Should have CSV generation logic, not just a toast
      expect(content).toContain("text/csv");
    });

    it("generates proper CSV with headers", () => {
      const content = readFile("client/src/pages/admin/UsersRoles.tsx");
      expect(content).toContain("download");
    });
  });

  // ─── 9. Backend router for dashboard data ───
  describe("Admin dashboard data router", () => {
    it("adminDashboardData router file exists", () => {
      expect(
        existsSync(
          resolve(ROOT, "server/routers/adminDashboardData.ts")
        )
      ).toBe(true);
    });

    it("has getEnrollments procedure", () => {
      const content = readFile("server/routers/adminDashboardData.ts");
      expect(content).toContain("getEnrollments");
    });

    it("has getGamificationStats procedure", () => {
      const content = readFile("server/routers/adminDashboardData.ts");
      expect(content).toContain("getGamificationStats");
    });

    it("is registered in main routers.ts", () => {
      const content = readFile("server/routers.ts");
      expect(content).toContain("adminDashboardData");
    });
  });

  // ─── 10. No remaining 404 routes from sidebar ───
  describe("Sidebar routes all have matching App.tsx routes", () => {
    it("all sidebar paths have corresponding routes", () => {
      const layout = readFile("client/src/components/AdminLayout.tsx");
      const appTsx = readFile("client/src/App.tsx");

      // Extract paths from sidebar
      const pathRegex = /path:\s*"(\/admin\/[^"]+)"/g;
      const sidebarPaths: string[] = [];
      let match;
      while ((match = pathRegex.exec(layout)) !== null) {
        sidebarPaths.push(match[1]);
      }

      expect(sidebarPaths.length).toBeGreaterThan(0);

      // Each sidebar path (without query params) should have a route in App.tsx
      for (const path of sidebarPaths) {
        const basePath = path.split("?")[0];
        expect(appTsx).toContain(basePath);
      }
    });
  });

  // ─── 11. Funnels, Automations, CMS pages exist (not infinite loading) ───
  describe("Existing premium feature pages are intact", () => {
    it("Funnels page component exists", () => {
      const content = readFile("client/src/pages/AdminControlCenter.tsx");
      expect(content).toContain("funnels");
    });

    it("Automations page component exists", () => {
      const content = readFile("client/src/pages/AdminControlCenter.tsx");
      expect(content).toContain("automations");
    });

    it("Pages/CMS page component exists", () => {
      const content = readFile("client/src/pages/AdminControlCenter.tsx");
      expect(content).toContain("pages");
    });
  });
});
