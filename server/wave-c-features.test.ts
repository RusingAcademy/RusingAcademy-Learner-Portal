import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ═══════════════════════════════════════════════════════════════
// 1. DRIP CONTENT ROUTER — Progressive Content Unlocking
// ═══════════════════════════════════════════════════════════════
describe("Drip Content Router — Backend", () => {
  const routerSrc = readFile("server/routers/premiumFeatures.ts");

  describe("Router Registration", () => {
    it("dripContentRouter is exported from premiumFeatures.ts", () => {
      expect(routerSrc).toContain("export const dripContentRouter");
    });
    it("dripContentRouter is registered in the appRouter", () => {
      const routersSrc = readFile("server/routers.ts");
      expect(routersSrc).toContain("dripContent: dripContentRouter");
    });
    it("dripContentRouter is imported in routers.ts", () => {
      const routersSrc = readFile("server/routers.ts");
      expect(routersSrc).toContain("dripContentRouter");
    });
  });

  describe("getSchedule procedure", () => {
    it("has a getSchedule procedure that queries drip_content table", () => {
      expect(routerSrc).toMatch(/getSchedule:\s*protectedProcedure/);
    });
    it("joins lessons with modules and drip_content", () => {
      expect(routerSrc).toContain("LEFT JOIN drip_content dc ON dc.lessonId = l.id");
    });
    it("accepts courseId as input", () => {
      expect(routerSrc).toContain("courseId: z.number()");
    });
    it("orders by module and lesson orderIndex", () => {
      expect(routerSrc).toContain("ORDER BY m.orderIndex, l.orderIndex");
    });
  });

  describe("setSchedule procedure", () => {
    it("has a setSchedule mutation", () => {
      expect(routerSrc).toMatch(/setSchedule:\s*protectedProcedure/);
    });
    it("accepts lessonId and unlockType", () => {
      expect(routerSrc).toContain("lessonId: z.number()");
      expect(routerSrc).toContain('unlockType: z.enum(["immediate", "date", "days_after_enrollment", "after_previous"])');
    });
    it("uses INSERT ON DUPLICATE KEY UPDATE for upsert", () => {
      expect(routerSrc).toContain("INSERT INTO drip_content");
      expect(routerSrc).toContain("ON DUPLICATE KEY UPDATE");
    });
  });

  describe("setBulkSchedule procedure", () => {
    it("has a setBulkSchedule mutation", () => {
      expect(routerSrc).toMatch(/setBulkSchedule:\s*protectedProcedure/);
    });
    it("accepts courseId and cadence", () => {
      expect(routerSrc).toContain('cadence: z.enum(["daily", "every_3_days", "weekly", "biweekly", "monthly"])');
    });
    it("maps cadence to day intervals", () => {
      expect(routerSrc).toContain("daily: 1");
      expect(routerSrc).toContain("weekly: 7");
      expect(routerSrc).toContain("monthly: 30");
    });
    it("returns count of updated lessons", () => {
      expect(routerSrc).toContain("lessonsUpdated: lessons.length");
    });
  });

  describe("checkAccess procedure", () => {
    it("has a checkAccess query", () => {
      expect(routerSrc).toMatch(/checkAccess:\s*protectedProcedure/);
    });
    it("checks enrollment date for days_after_enrollment type", () => {
      expect(routerSrc).toContain("days_after_enrollment");
      expect(routerSrc).toContain("enrolledAt");
    });
    it("returns unlocked status", () => {
      expect(routerSrc).toContain("unlocked: true");
      expect(routerSrc).toContain("unlocked: false");
    });
  });
});

describe("Drip Content — Frontend Page", () => {
  it("DripContent.tsx exists in admin pages", () => {
    expect(fileExists("client/src/pages/admin/DripContent.tsx")).toBe(true);
  });
  it("exports default component", () => {
    const src = readFile("client/src/pages/admin/DripContent.tsx");
    expect(src).toContain("export default function DripContent");
  });
  it("uses trpc.dripContent hooks", () => {
    const src = readFile("client/src/pages/admin/DripContent.tsx");
    expect(src).toContain("trpc.dripContent.getSchedule.useQuery");
    expect(src).toContain("trpc.dripContent.setBulkSchedule.useMutation");
    expect(src).toContain("trpc.dripContent.setSchedule.useMutation");
  });
  it("has cadence selector with all options", () => {
    const src = readFile("client/src/pages/admin/DripContent.tsx");
    expect(src).toContain("daily");
    expect(src).toContain("weekly");
    expect(src).toContain("biweekly");
    expect(src).toContain("monthly");
  });
  it("displays lock/unlock icons", () => {
    const src = readFile("client/src/pages/admin/DripContent.tsx");
    expect(src).toContain("Lock");
    expect(src).toContain("Unlock");
  });
  it("is exported from admin index", () => {
    const indexSrc = readFile("client/src/pages/admin/index.ts");
    expect(indexSrc).toContain('export { default as DripContent } from "./DripContent"');
  });
  it("is registered in AdminControlCenter sectionMap", () => {
    const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
    expect(accSrc).toContain('"drip-content": DripContent');
  });
  it("has a route in App.tsx", () => {
    const appSrc = readFile("client/src/App.tsx");
    expect(appSrc).toContain('/admin/drip-content');
  });
  it("has sidebar navigation entry", () => {
    const layoutSrc = readFile("client/src/components/AdminLayout.tsx");
    expect(layoutSrc).toContain("drip-content");
    expect(layoutSrc).toContain("Drip Content");
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. A/B CONTENT TESTING ROUTER
// ═══════════════════════════════════════════════════════════════
describe("A/B Testing Router — Backend", () => {
  const routerSrc = readFile("server/routers/premiumFeatures.ts");

  describe("Router Registration", () => {
    it("abTestingRouter is exported from premiumFeatures.ts", () => {
      expect(routerSrc).toContain("export const abTestingRouter");
    });
    it("abTestingRouter is registered in the appRouter", () => {
      const routersSrc = readFile("server/routers.ts");
      expect(routersSrc).toContain("abTesting: abTestingRouter");
    });
  });

  describe("list procedure", () => {
    it("has a list procedure that queries ab_tests table", () => {
      expect(routerSrc).toContain("SELECT * FROM ab_tests ORDER BY createdAt DESC");
    });
  });

  describe("create procedure", () => {
    it("has a create mutation", () => {
      expect(routerSrc).toMatch(/create:\s*protectedProcedure/);
    });
    it("accepts name, lessonIdA, lessonIdB, trafficSplit, metric", () => {
      expect(routerSrc).toContain("name: z.string().min(1)");
      expect(routerSrc).toContain("lessonIdA: z.number()");
      expect(routerSrc).toContain("lessonIdB: z.number()");
      expect(routerSrc).toContain("trafficSplit: z.number()");
    });
    it("supports 4 metric types", () => {
      expect(routerSrc).toContain('metric: z.enum(["completion_rate", "engagement_time", "quiz_score", "satisfaction"])');
    });
    it("initializes results JSON with variant A and B", () => {
      expect(routerSrc).toContain("variantA:");
      expect(routerSrc).toContain("variantB:");
    });
    it("stores createdBy from context user", () => {
      expect(routerSrc).toContain("ctx.user.id");
    });
  });

  describe("updateStatus procedure", () => {
    it("has an updateStatus mutation", () => {
      expect(routerSrc).toMatch(/updateStatus:\s*protectedProcedure/);
    });
    it("supports draft, running, paused, completed statuses", () => {
      expect(routerSrc).toContain('status: z.enum(["draft", "running", "paused", "completed"])');
    });
  });

  describe("getStats procedure", () => {
    it("has a getStats query", () => {
      expect(routerSrc).toMatch(/getStats:\s*protectedProcedure/);
    });
    it("returns total, active, completed counts", () => {
      expect(routerSrc).toContain("total: Number(total)");
      expect(routerSrc).toContain("active: Number(active)");
    });
  });

  describe("getResults procedure", () => {
    it("has a getResults query", () => {
      expect(routerSrc).toMatch(/getResults:\s*protectedProcedure/);
    });
    it("parses JSON results", () => {
      expect(routerSrc).toContain("JSON.parse(test.results)");
    });
  });
});

describe("A/B Testing — Frontend Page", () => {
  it("ABTesting.tsx exists in admin pages", () => {
    expect(fileExists("client/src/pages/admin/ABTesting.tsx")).toBe(true);
  });
  it("exports default component", () => {
    const src = readFile("client/src/pages/admin/ABTesting.tsx");
    expect(src).toContain("export default function ABTesting");
  });
  it("uses trpc.abTesting hooks", () => {
    const src = readFile("client/src/pages/admin/ABTesting.tsx");
    expect(src).toContain("trpc.abTesting.getStats.useQuery");
    expect(src).toContain("trpc.abTesting.list.useQuery");
    expect(src).toContain("trpc.abTesting.create.useMutation");
    expect(src).toContain("trpc.abTesting.updateStatus.useMutation");
  });
  it("has create test dialog", () => {
    const src = readFile("client/src/pages/admin/ABTesting.tsx");
    expect(src).toContain("Create A/B Test");
    expect(src).toContain("Dialog");
  });
  it("displays stats cards for total, running, completed", () => {
    const src = readFile("client/src/pages/admin/ABTesting.tsx");
    expect(src).toContain("Total Tests");
    expect(src).toContain("Running");
    expect(src).toContain("Completed");
  });
  it("has start and pause buttons", () => {
    const src = readFile("client/src/pages/admin/ABTesting.tsx");
    expect(src).toContain("Start");
    expect(src).toContain("Pause");
  });
  it("is registered in AdminControlCenter sectionMap", () => {
    const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
    expect(accSrc).toContain('"ab-testing": ABTesting');
  });
  it("has a route in App.tsx", () => {
    const appSrc = readFile("client/src/App.tsx");
    expect(appSrc).toContain('/admin/ab-testing');
  });
  it("has sidebar navigation entry", () => {
    const layoutSrc = readFile("client/src/components/AdminLayout.tsx");
    expect(layoutSrc).toContain("ab-testing");
    expect(layoutSrc).toContain("A/B Testing");
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. AFFILIATE PROGRAM ROUTER
// ═══════════════════════════════════════════════════════════════
describe("Affiliate Program Router — Backend", () => {
  const routerSrc = readFile("server/routers/premiumFeatures.ts");

  describe("Router Registration", () => {
    it("affiliateRouter is exported from premiumFeatures.ts", () => {
      expect(routerSrc).toContain("export const affiliateRouter");
    });
    it("affiliateRouter is registered in the appRouter", () => {
      const routersSrc = readFile("server/routers.ts");
      expect(routersSrc).toContain("affiliate: affiliateRouter");
    });
  });

  describe("getDashboard procedure", () => {
    it("has a getDashboard query", () => {
      expect(routerSrc).toMatch(/getDashboard:\s*protectedProcedure/);
    });
    it("queries referral_invitations for stats", () => {
      expect(routerSrc).toContain("FROM referral_invitations");
    });
    it("queries affiliate_earnings for earnings", () => {
      expect(routerSrc).toContain("FROM affiliate_earnings");
    });
    it("generates referral link", () => {
      expect(routerSrc).toContain("referralLink");
    });
    it("returns 4 commission tiers (Bronze, Silver, Gold, Platinum)", () => {
      expect(routerSrc).toContain("Bronze");
      expect(routerSrc).toContain("Silver");
      expect(routerSrc).toContain("Gold");
      expect(routerSrc).toContain("Platinum");
    });
    it("calculates conversion rate", () => {
      expect(routerSrc).toContain("conversionRate");
    });
  });

  describe("getReferrals procedure", () => {
    it("has a getReferrals query", () => {
      expect(routerSrc).toMatch(/getReferrals:\s*protectedProcedure/);
    });
    it("joins with user table for referred name and email", () => {
      expect(routerSrc).toContain("u.name as referredName");
      expect(routerSrc).toContain("u.email as referredEmail");
    });
    it("limits results to 50", () => {
      expect(routerSrc).toContain("LIMIT 50");
    });
  });

  describe("requestPayout procedure", () => {
    it("has a requestPayout mutation", () => {
      expect(routerSrc).toMatch(/requestPayout:\s*protectedProcedure/);
    });
    it("enforces minimum $50 payout", () => {
      expect(routerSrc).toContain("z.number().min(50)");
    });
    it("inserts into affiliate_payouts table", () => {
      expect(routerSrc).toContain("INSERT INTO affiliate_payouts");
    });
    it("returns success message", () => {
      expect(routerSrc).toContain("Payout request submitted");
    });
  });
});

describe("Affiliate Program — Frontend Page", () => {
  it("AffiliateDashboard.tsx exists", () => {
    expect(fileExists("client/src/pages/AffiliateDashboard.tsx")).toBe(true);
  });
  it("exports default component", () => {
    const src = readFile("client/src/pages/AffiliateDashboard.tsx");
    expect(src).toContain("export default function AffiliateDashboard");
  });
  it("uses trpc.affiliate hooks", () => {
    const src = readFile("client/src/pages/AffiliateDashboard.tsx");
    expect(src).toContain("trpc.affiliate.getDashboard.useQuery");
    expect(src).toContain("trpc.affiliate.getReferrals.useQuery");
    expect(src).toContain("trpc.affiliate.requestPayout.useMutation");
  });
  it("shows referral link with copy button", () => {
    const src = readFile("client/src/pages/AffiliateDashboard.tsx");
    expect(src).toContain("referralLink");
    expect(src).toContain("Copy");
    expect(src).toContain("navigator.clipboard");
  });
  it("displays 4 stats cards", () => {
    const src = readFile("client/src/pages/AffiliateDashboard.tsx");
    expect(src).toContain("Total Referrals");
    expect(src).toContain("Conversions");
    expect(src).toContain("Total Earnings");
    expect(src).toContain("Pending Payout");
  });
  it("shows commission tiers", () => {
    const src = readFile("client/src/pages/AffiliateDashboard.tsx");
    expect(src).toContain("Commission Tiers");
  });
  it("has payout request form with $50 minimum", () => {
    const src = readFile("client/src/pages/AffiliateDashboard.tsx");
    expect(src).toContain("Request Payout");
    expect(src).toContain("50");
  });
  it("shows login prompt for unauthenticated users", () => {
    const src = readFile("client/src/pages/AffiliateDashboard.tsx");
    expect(src).toContain("isAuthenticated");
    expect(src).toContain("getLoginUrl");
  });
  it("has a route in App.tsx", () => {
    const appSrc = readFile("client/src/App.tsx");
    expect(appSrc).toContain('/affiliate');
    expect(appSrc).toContain("AffiliateDashboard");
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. ORG BILLING ROUTER — Seat-Based Billing
// ═══════════════════════════════════════════════════════════════
describe("Org Billing Router — Backend", () => {
  const routerSrc = readFile("server/routers/premiumFeatures.ts");

  describe("Router Registration", () => {
    it("orgBillingRouter is exported from premiumFeatures.ts", () => {
      expect(routerSrc).toContain("export const orgBillingRouter");
    });
    it("orgBillingRouter is registered in the appRouter", () => {
      const routersSrc = readFile("server/routers.ts");
      expect(routersSrc).toContain("orgBilling: orgBillingRouter");
    });
  });

  describe("getBillingOverview procedure", () => {
    it("has a getBillingOverview query", () => {
      expect(routerSrc).toMatch(/getBillingOverview:\s*protectedProcedure/);
    });
    it("queries organizations table", () => {
      expect(routerSrc).toContain("SELECT * FROM organizations WHERE id =");
    });
    it("calculates seat pricing by plan tier", () => {
      expect(routerSrc).toContain("enterprise");
      expect(routerSrc).toContain("professional");
      expect(routerSrc).toContain("49.99");
      expect(routerSrc).toContain("29.99");
      expect(routerSrc).toContain("14.99");
    });
    it("calculates monthly and annual totals", () => {
      expect(routerSrc).toContain("monthlyTotal");
      expect(routerSrc).toContain("annualTotal");
    });
    it("applies 15% annual discount", () => {
      expect(routerSrc).toContain("0.85");
    });
  });

  describe("updateSeats procedure", () => {
    it("has an updateSeats mutation", () => {
      expect(routerSrc).toMatch(/updateSeats:\s*protectedProcedure/);
    });
    it("validates seat count between 1 and 1000", () => {
      expect(routerSrc).toContain("z.number().min(1).max(1000)");
    });
    it("updates organizations table", () => {
      expect(routerSrc).toContain("UPDATE organizations SET seats =");
    });
  });

  describe("getInvoices procedure", () => {
    it("has a getInvoices query", () => {
      expect(routerSrc).toMatch(/getInvoices:\s*protectedProcedure/);
    });
    it("generates invoices with proper ID format", () => {
      expect(routerSrc).toContain("INV-");
    });
    it("returns invoice with period, seats, amount, status", () => {
      expect(routerSrc).toContain("period:");
      expect(routerSrc).toContain("seats,");
      expect(routerSrc).toContain("amount,");
      expect(routerSrc).toContain("status:");
    });
  });

  describe("createOrgCheckout procedure", () => {
    it("has a createOrgCheckout mutation", () => {
      expect(routerSrc).toMatch(/createOrgCheckout:\s*protectedProcedure/);
    });
    it("accepts plan, seats, and billingCycle", () => {
      expect(routerSrc).toContain('plan: z.enum(["starter", "professional", "enterprise"])');
      expect(routerSrc).toContain('billingCycle: z.enum(["monthly", "annual"])');
    });
    it("creates Stripe checkout session", () => {
      expect(routerSrc).toContain("stripe.checkout.sessions.create");
    });
    it("includes org metadata in checkout", () => {
      expect(routerSrc).toContain("orgId: input.orgId.toString()");
      expect(routerSrc).toContain("plan: input.plan");
    });
    it("supports both subscription and one-time payment modes", () => {
      expect(routerSrc).toContain('"payment"');
      expect(routerSrc).toContain('"subscription"');
    });
  });

  describe("getPricingTiers procedure", () => {
    it("has a getPricingTiers public query", () => {
      expect(routerSrc).toContain("getPricingTiers: publicProcedure");
    });
    it("returns 3 pricing tiers", () => {
      expect(routerSrc).toContain("starter");
      expect(routerSrc).toContain("professional");
      expect(routerSrc).toContain("enterprise");
    });
    it("includes features list for each tier", () => {
      expect(routerSrc).toContain("features:");
    });
  });
});

describe("Org Billing — Frontend Page", () => {
  it("OrgBillingDashboard.tsx exists in admin pages", () => {
    expect(fileExists("client/src/pages/admin/OrgBillingDashboard.tsx")).toBe(true);
  });
  it("exports default component", () => {
    const src = readFile("client/src/pages/admin/OrgBillingDashboard.tsx");
    expect(src).toContain("export default function OrgBillingDashboard");
  });
  it("uses trpc.orgBilling hooks", () => {
    const src = readFile("client/src/pages/admin/OrgBillingDashboard.tsx");
    expect(src).toContain("trpc.orgBilling.getBillingOverview.useQuery");
    expect(src).toContain("trpc.orgBilling.getInvoices.useQuery");
    expect(src).toContain("trpc.orgBilling.getPricingTiers.useQuery");
    expect(src).toContain("trpc.orgBilling.updateSeats.useMutation");
    expect(src).toContain("trpc.orgBilling.createOrgCheckout.useMutation");
  });
  it("displays billing overview cards", () => {
    const src = readFile("client/src/pages/admin/OrgBillingDashboard.tsx");
    expect(src).toContain("Current Plan");
    expect(src).toContain("Active Seats");
    expect(src).toContain("Monthly Total");
  });
  it("has seat management form", () => {
    const src = readFile("client/src/pages/admin/OrgBillingDashboard.tsx");
    expect(src).toContain("Manage Seats");
    expect(src).toContain("Update Seats");
  });
  it("shows pricing plans with features", () => {
    const src = readFile("client/src/pages/admin/OrgBillingDashboard.tsx");
    expect(src).toContain("Pricing Plans");
  });
  it("has billing cycle selector (monthly/annual)", () => {
    const src = readFile("client/src/pages/admin/OrgBillingDashboard.tsx");
    expect(src).toContain("Monthly");
    expect(src).toContain("Annual");
  });
  it("shows invoice history", () => {
    const src = readFile("client/src/pages/admin/OrgBillingDashboard.tsx");
    expect(src).toContain("Invoice History");
  });
  it("is registered in AdminControlCenter sectionMap", () => {
    const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
    expect(accSrc).toContain('"org-billing": OrgBillingDashboard');
  });
  it("has a route in App.tsx", () => {
    const appSrc = readFile("client/src/App.tsx");
    expect(appSrc).toContain('/admin/org-billing');
  });
  it("has sidebar navigation entry", () => {
    const layoutSrc = readFile("client/src/components/AdminLayout.tsx");
    expect(layoutSrc).toContain("org-billing");
    expect(layoutSrc).toContain("Org Billing");
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. CROSS-CUTTING INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════
describe("Cross-Cutting Integration", () => {
  it("all 4 new routers are imported in routers.ts", () => {
    const routersSrc = readFile("server/routers.ts");
    expect(routersSrc).toContain("orgBillingRouter");
    expect(routersSrc).toContain("dripContentRouter");
    expect(routersSrc).toContain("abTestingRouter");
    expect(routersSrc).toContain("affiliateRouter");
  });

  it("all 4 routers are registered in the appRouter", () => {
    const routersSrc = readFile("server/routers.ts");
    expect(routersSrc).toContain("orgBilling: orgBillingRouter");
    expect(routersSrc).toContain("dripContent: dripContentRouter");
    expect(routersSrc).toContain("abTesting: abTestingRouter");
    expect(routersSrc).toContain("affiliate: affiliateRouter");
  });

  it("all 3 admin pages are exported from admin index", () => {
    const indexSrc = readFile("client/src/pages/admin/index.ts");
    expect(indexSrc).toContain("DripContent");
    expect(indexSrc).toContain("ABTesting");
    expect(indexSrc).toContain("OrgBillingDashboard");
  });

  it("all 3 admin pages are in AdminControlCenter sectionMap", () => {
    const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
    expect(accSrc).toContain("DripContent");
    expect(accSrc).toContain("ABTesting");
    expect(accSrc).toContain("OrgBillingDashboard");
  });

  it("all 4 routes exist in App.tsx", () => {
    const appSrc = readFile("client/src/App.tsx");
    expect(appSrc).toContain("/admin/drip-content");
    expect(appSrc).toContain("/admin/ab-testing");
    expect(appSrc).toContain("/admin/org-billing");
    expect(appSrc).toContain("/affiliate");
  });

  it("all 3 admin sidebar nav items exist", () => {
    const layoutSrc = readFile("client/src/components/AdminLayout.tsx");
    expect(layoutSrc).toContain("drip-content");
    expect(layoutSrc).toContain("ab-testing");
    expect(layoutSrc).toContain("org-billing");
  });

  it("new pages use sonner toast (not shadcn use-toast)", () => {
    const files = [
      "client/src/pages/admin/DripContent.tsx",
      "client/src/pages/admin/ABTesting.tsx",
      "client/src/pages/admin/OrgBillingDashboard.tsx",
      "client/src/pages/AffiliateDashboard.tsx",
    ];
    for (const file of files) {
      const src = readFile(file);
      expect(src).toContain('from "sonner"');
      expect(src).not.toContain("@/hooks/use-toast");
    }
  });

  it("all new frontend pages use trpc for data fetching (no fetch/axios)", () => {
    const files = [
      "client/src/pages/admin/DripContent.tsx",
      "client/src/pages/admin/ABTesting.tsx",
      "client/src/pages/admin/OrgBillingDashboard.tsx",
      "client/src/pages/AffiliateDashboard.tsx",
    ];
    for (const file of files) {
      const src = readFile(file);
      expect(src).toContain("trpc.");
      expect(src).not.toContain("axios");
      expect(src).not.toMatch(/\bfetch\(/);
    }
  });

  it("all backend procedures use protectedProcedure (except getPricingTiers)", () => {
    const routerSrc = readFile("server/routers/premiumFeatures.ts");
    // Count protectedProcedure usage in the 4 routers
    const orgBillingSection = routerSrc.slice(routerSrc.indexOf("export const orgBillingRouter"));
    expect(orgBillingSection).toContain("protectedProcedure");
  });
});
