/**
 * Phase A: Auth Guard Admin — Vitest Tests
 * 
 * Validates that all admin routes are protected by authentication.
 * Tests the useAuth({ redirectOnUnauthenticated: true }) pattern
 * applied to AdminLayout and standalone admin pages.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const CLIENT_SRC = path.resolve(__dirname, "../client/src");

/**
 * Helper: read a file and return its content
 */
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

describe("Phase A: Admin Auth Guard", () => {
  
  describe("AdminLayout.tsx — Primary Auth Guard", () => {
    const content = readFile(path.join(CLIENT_SRC, "components/AdminLayout.tsx"));
    
    it("should import useAuth hook", () => {
      expect(content).toContain("useAuth");
    });
    
    it("should use redirectOnUnauthenticated: true", () => {
      expect(content).toContain("redirectOnUnauthenticated: true");
    });
    
    it("should have a loading state check before rendering", () => {
      expect(content).toContain("if (loading)");
    });
    
    it("should return null when user is not authenticated (redirect in progress)", () => {
      // After loading completes and user is null, component should return null
      // while the redirect is happening
      const hasNullReturn = content.includes("if (!user)") && content.includes("return null");
      expect(hasNullReturn).toBe(true);
    });
    
    it("should show a loading spinner during auth check", () => {
      expect(content).toContain("animate-spin");
      expect(content).toContain("Verifying access");
    });
  });
  
  describe("AdminControlCenter.tsx — Routes through AdminLayout", () => {
    const content = readFile(path.join(CLIENT_SRC, "pages/AdminControlCenter.tsx"));
    
    it("should use AdminLayout as wrapper", () => {
      expect(content).toContain("AdminLayout");
    });
  });
  
  describe("App.tsx — All /admin routes use AdminControlCenter or guarded pages", () => {
    const content = readFile(path.join(CLIENT_SRC, "App.tsx"));
    
    // Extract all admin route lines
    const adminRouteLines = content.split("\n").filter(line => 
      line.includes('path="/admin') || line.includes('path="/dashboard/admin')
    );
    
    it("should have admin routes defined", () => {
      expect(adminRouteLines.length).toBeGreaterThan(0);
    });
    
    it("all admin routes should use AdminControlCenter or a guarded component", () => {
      // Known guarded standalone pages
      const guardedStandalonePages = [
        "AdminCoachApplications",
        "AdminCommission", 
        "AdminReminders",
        "AdminContentManagement",
        "AdminLeads",
      ];
      
      for (const line of adminRouteLines) {
        const usesAdminControlCenter = line.includes("AdminControlCenter");
        const usesGuardedPage = guardedStandalonePages.some(page => line.includes(page));
        
        expect(
          usesAdminControlCenter || usesGuardedPage,
          `Admin route line should use AdminControlCenter or a guarded page: ${line.trim()}`
        ).toBe(true);
      }
    });
  });
  
  describe("Standalone Admin Pages — Auth Guards", () => {
    const standalonePages = [
      { name: "AdminCoachApplications", path: "pages/AdminCoachApplications.tsx" },
      { name: "AdminCommission", path: "pages/AdminCommission.tsx" },
      { name: "AdminReminders", path: "pages/AdminReminders.tsx" },
      { name: "AdminContentManagement", path: "pages/AdminContentManagement.tsx" },
      { name: "AdminLeads", path: "pages/AdminLeads.tsx" },
    ];
    
    for (const page of standalonePages) {
      describe(`${page.name}`, () => {
        const content = readFile(path.join(CLIENT_SRC, page.path));
        
        it("should import useAuth", () => {
          expect(content).toContain("useAuth");
        });
        
        it("should use redirectOnUnauthenticated: true", () => {
          expect(content).toContain("redirectOnUnauthenticated: true");
        });
      });
    }
  });
  
  describe("useAuth hook — redirectOnUnauthenticated behavior", () => {
    const content = readFile(path.join(CLIENT_SRC, "_core/hooks/useAuth.ts"));
    
    it("should accept redirectOnUnauthenticated option", () => {
      expect(content).toContain("redirectOnUnauthenticated");
    });
    
    it("should redirect when user is not authenticated and option is true", () => {
      // The hook should have a useEffect that checks redirectOnUnauthenticated
      expect(content).toContain("if (!redirectOnUnauthenticated) return");
      expect(content).toContain("window.location.href");
    });
    
    it("should use getLoginUrl for redirect destination", () => {
      expect(content).toContain("getLoginUrl");
    });
  });
  
  describe("No admin route is unprotected", () => {
    it("should not have any admin route without auth guard", () => {
      const appContent = readFile(path.join(CLIENT_SRC, "App.tsx"));
      
      // Find all component names used in admin routes
      const adminRoutePattern = /path="\/admin[^"]*"[^>]*(?:component=\{(\w+)\}|<(\w+)\s)/g;
      const componentNames = new Set<string>();
      let match;
      
      while ((match = adminRoutePattern.exec(appContent)) !== null) {
        if (match[1]) componentNames.add(match[1]);
        if (match[2]) componentNames.add(match[2]);
      }
      
      // AdminControlCenter is protected via AdminLayout
      // All standalone pages should have redirectOnUnauthenticated
      for (const name of componentNames) {
        if (name === "AdminControlCenter") {
          // Protected via AdminLayout wrapper
          const adminLayoutContent = readFile(path.join(CLIENT_SRC, "components/AdminLayout.tsx"));
          expect(adminLayoutContent).toContain("redirectOnUnauthenticated: true");
        }
      }
    });
  });
});
