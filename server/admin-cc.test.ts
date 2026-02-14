import { describe, it, expect } from "vitest";

/**
 * Admin Control Center - Component and Route Structure Tests
 * These tests verify the admin pages and layout exist and are properly structured
 */

describe("Admin Control Center - File Structure", () => {
  it("should have AdminLayout component", async () => {
    const mod = await import("../client/src/components/AdminLayout");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have AdminControlCenter page", async () => {
    const mod = await import("../client/src/pages/AdminControlCenter");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have DashboardOverview page", async () => {
    const mod = await import("../client/src/pages/admin/DashboardOverview");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have UsersRoles page", async () => {
    const mod = await import("../client/src/pages/admin/UsersRoles");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have CoachesManagement page", async () => {
    const mod = await import("../client/src/pages/admin/CoachesManagement");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have CourseBuilder page", async () => {
    const mod = await import("../client/src/pages/admin/CourseBuilder");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have PricingCheckout page", async () => {
    const mod = await import("../client/src/pages/admin/PricingCheckout");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have Analytics page", async () => {
    const mod = await import("../client/src/pages/admin/Analytics");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have ActivityLogs page", async () => {
    const mod = await import("../client/src/pages/admin/ActivityLogs");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have PreviewStudent page", async () => {
    const mod = await import("../client/src/pages/admin/PreviewStudent");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have AdminSettings page", async () => {
    const mod = await import("../client/src/pages/admin/AdminSettings");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have CouponsPage", async () => {
    const mod = await import("../client/src/pages/admin/CouponsPage");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have CRMPage", async () => {
    const mod = await import("../client/src/pages/admin/CRMPage");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });

  it("should have EmailPage", async () => {
    const mod = await import("../client/src/pages/admin/EmailPage");
    expect(mod).toBeDefined();
    expect(mod.default).toBeDefined();
  });
});

describe("Admin Control Center - Route Configuration", () => {
  it("should have all admin routes defined in App.tsx", async () => {
    const fs = await import("fs");
    const appContent = fs.readFileSync("client/src/App.tsx", "utf-8");
    
    // Verify all admin routes exist
    const requiredRoutes = [
      '/admin"',
      '/admin/overview',
      '/admin/users',
      '/admin/coaches',
      '/admin/coaching',
      '/admin/courses',
      '/admin/pricing',
      '/admin/coupons',
      '/admin/crm',
      '/admin/email',
      '/admin/analytics',
      '/admin/activity',
      '/admin/preview',
      '/admin/settings',
    ];

    for (const route of requiredRoutes) {
      expect(appContent).toContain(route);
    }
  });

  it("should use AdminControlCenter component for admin routes", async () => {
    const fs = await import("fs");
    const appContent = fs.readFileSync("client/src/App.tsx", "utf-8");
    expect(appContent).toContain("AdminControlCenter");
    expect(appContent).toContain('import AdminControlCenter');
  });
});

describe("Admin Control Center - Sidebar Navigation", () => {
  it("should have sidebar with all required sections", async () => {
    const fs = await import("fs");
    const layoutContent = fs.readFileSync("client/src/components/AdminLayout.tsx", "utf-8");
    
    // Check sidebar sections
    expect(layoutContent).toContain("PRODUCTS");
    expect(layoutContent).toContain("SALES");
    expect(layoutContent).toContain("MARKETING");
    expect(layoutContent).toContain("PEOPLE");
    expect(layoutContent).toContain("ANALYTICS");
    
    // Check sidebar items
    expect(layoutContent).toContain("Dashboard");
    expect(layoutContent).toContain("Courses");
    expect(layoutContent).toContain("Coaching");
    expect(layoutContent).toContain("Pricing");
    expect(layoutContent).toContain("Coupons");
    expect(layoutContent).toContain("CRM");
    expect(layoutContent).toContain("Email");
    expect(layoutContent).toContain("Users");
    expect(layoutContent).toContain("Analytics");
    expect(layoutContent).toContain("Activity");
    expect(layoutContent).toContain("Preview");
    expect(layoutContent).toContain("Settings");
  });

  it("should have quick action buttons", async () => {
    const fs = await import("fs");
    const layoutContent = fs.readFileSync("client/src/components/AdminLayout.tsx", "utf-8");
    
    expect(layoutContent).toContain("New Course");
    expect(layoutContent).toContain("Invite");
  });

  it("should have View Site button", async () => {
    const fs = await import("fs");
    const layoutContent = fs.readFileSync("client/src/components/AdminLayout.tsx", "utf-8");
    
    expect(layoutContent).toContain("View Site");
  });
});

describe("Admin Control Center - Database Tables", () => {
  it("should have activity tracking tables in schema", async () => {
    const fs = await import("fs");
    const schemaContent = fs.readFileSync("drizzle/schema.ts", "utf-8");
    // Activity tracking exists via crmActivityReports and activityType enum
    expect(schemaContent).toContain("crmActivityReports");
    expect(schemaContent).toContain("activityType");
  });

  it("should have courses table in schema", async () => {
    const fs = await import("fs");
    const schemaContent = fs.readFileSync("drizzle/schema.ts", "utf-8");
    expect(schemaContent).toContain("courses");
  });

  it("should have modules table in schema", async () => {
    const fs = await import("fs");
    const schemaContent = fs.readFileSync("drizzle/schema.ts", "utf-8");
    expect(schemaContent).toContain("modules");
  });

  it("should have lessons table in schema", async () => {
    const fs = await import("fs");
    const schemaContent = fs.readFileSync("drizzle/schema.ts", "utf-8");
    expect(schemaContent).toContain("lessons");
  });
});
