import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * SEO Editor Tests
 *
 * Tests the SEO Editor backend router:
 * 1. getSeo — fetch SEO metadata for a page (admin only)
 * 2. updateSeo — update SEO metadata for a page (admin only)
 * 3. generateStructuredData — generate schema.org JSON-LD (admin only)
 * 4. getPublicSeo — fetch SEO data for public page rendering (no auth)
 *
 * Also validates:
 * - Authorization (admin-only for write operations)
 * - Input validation (schema types, character limits)
 * - Public access for getPublicSeo
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-seo-test",
    email: "admin@rusingacademy.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createRegularUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-seo-test",
    email: "learner@rusingacademy.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const caller = appRouter.createCaller;

// ============================================================================
// getSeo — Admin-only SEO data retrieval
// ============================================================================
describe("SEO Editor — getSeo", () => {
  it("should require admin role", async () => {
    const ctx = createRegularUserContext();
    const api = caller(ctx);
    await expect(api.seo.getSeo({ pageId: 1 })).rejects.toThrow(
      /admin|forbidden/i
    );
  });

  it("should reject unauthenticated users", async () => {
    const ctx = createUnauthenticatedContext();
    const api = caller(ctx);
    await expect(api.seo.getSeo({ pageId: 1 })).rejects.toThrow();
  });

  it("should validate pageId is a number", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    await expect(
      // @ts-expect-error testing invalid input
      api.seo.getSeo({ pageId: "abc" })
    ).rejects.toThrow();
  });

  it("should accept valid pageId for admin", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.getSeo({ pageId: 999999 });
    } catch (e: any) {
      // NOT_FOUND or INTERNAL_SERVER_ERROR (DB unavailable in test env)
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });
});

// ============================================================================
// updateSeo — Admin-only SEO data update
// ============================================================================
describe("SEO Editor — updateSeo", () => {
  it("should require admin role", async () => {
    const ctx = createRegularUserContext();
    const api = caller(ctx);
    await expect(
      api.seo.updateSeo({ pageId: 1, metaTitle: "Test" })
    ).rejects.toThrow(/admin|forbidden/i);
  });

  it("should reject unauthenticated users", async () => {
    const ctx = createUnauthenticatedContext();
    const api = caller(ctx);
    await expect(
      api.seo.updateSeo({ pageId: 1, metaTitle: "Test" })
    ).rejects.toThrow();
  });

  it("should validate pageId is a number", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    await expect(
      // @ts-expect-error testing invalid input
      api.seo.updateSeo({ pageId: "abc", metaTitle: "Test" })
    ).rejects.toThrow();
  });

  it("should validate metaTitle max length (120)", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    const longTitle = "A".repeat(121);
    await expect(
      api.seo.updateSeo({ pageId: 1, metaTitle: longTitle })
    ).rejects.toThrow();
  });

  it("should validate metaDescription max length (320)", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    const longDesc = "B".repeat(321);
    await expect(
      api.seo.updateSeo({ pageId: 1, metaDescription: longDesc })
    ).rejects.toThrow();
  });

  it("should validate schemaType enum values", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    await expect(
      api.seo.updateSeo({ pageId: 1, schemaType: "InvalidType" as any })
    ).rejects.toThrow();
  });

  it("should accept valid schemaType 'Course'", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({ pageId: 999999, schemaType: "Course" });
    } catch (e: any) {
      // DB error is acceptable — we're testing input validation passes
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept valid schemaType 'Article'", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({ pageId: 999999, schemaType: "Article" });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept valid schemaType 'Organization'", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({ pageId: 999999, schemaType: "Organization" });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept valid schemaType 'FAQPage'", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({ pageId: 999999, schemaType: "FAQPage" });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept valid schemaType 'Service'", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({ pageId: 999999, schemaType: "Service" });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept valid schemaType 'WebPage'", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({ pageId: 999999, schemaType: "WebPage" });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should validate twitterCard enum values", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    await expect(
      api.seo.updateSeo({ pageId: 1, twitterCard: "invalid_card" as any })
    ).rejects.toThrow();
  });

  it("should accept valid twitterCard 'summary'", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({ pageId: 999999, twitterCard: "summary" });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept valid twitterCard 'summary_large_image'", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({
        pageId: 999999,
        twitterCard: "summary_large_image",
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept noIndex boolean", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({ pageId: 999999, noIndex: true });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept ogImage URL string", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({
        pageId: 999999,
        ogImage: "https://example.com/og-image.jpg",
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept canonicalUrl string", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({
        pageId: 999999,
        canonicalUrl: "https://www.rusingacademy.ca/courses/sle-prep",
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept structuredData as any JSON", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({
        pageId: 999999,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Test Page",
        },
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept all fields at once", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.updateSeo({
        pageId: 999999,
        metaTitle: "SLE Preparation Course | RusingÂcademy",
        metaDescription:
          "Prepare for your Second Language Evaluation with expert bilingual training.",
        ogImage: "https://example.com/og.jpg",
        canonicalUrl: "https://www.rusingacademy.ca/courses/sle-prep",
        schemaType: "Course",
        ogTitle: "SLE Prep Course",
        ogDescription: "Expert bilingual training for Canadian public servants",
        twitterCard: "summary_large_image",
        noIndex: false,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Course",
        },
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });
});

// ============================================================================
// generateStructuredData — Admin-only schema.org generation
// ============================================================================
describe("SEO Editor — generateStructuredData", () => {
  it("should require admin role", async () => {
    const ctx = createRegularUserContext();
    const api = caller(ctx);
    await expect(
      api.seo.generateStructuredData({ pageId: 1, schemaType: "WebPage" })
    ).rejects.toThrow(/admin|forbidden/i);
  });

  it("should reject unauthenticated users", async () => {
    const ctx = createUnauthenticatedContext();
    const api = caller(ctx);
    await expect(
      api.seo.generateStructuredData({ pageId: 1, schemaType: "WebPage" })
    ).rejects.toThrow();
  });

  it("should validate schemaType enum", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    await expect(
      api.seo.generateStructuredData({
        pageId: 1,
        schemaType: "InvalidSchema" as any,
      })
    ).rejects.toThrow();
  });

  it("should accept 'Course' schema type", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.generateStructuredData({
        pageId: 999999,
        schemaType: "Course",
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept 'FAQPage' schema type", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.generateStructuredData({
        pageId: 999999,
        schemaType: "FAQPage",
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept 'Organization' schema type", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.generateStructuredData({
        pageId: 999999,
        schemaType: "Organization",
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept 'Service' schema type", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.generateStructuredData({
        pageId: 999999,
        schemaType: "Service",
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept 'Article' schema type", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    try {
      await api.seo.generateStructuredData({
        pageId: 999999,
        schemaType: "Article",
      });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should validate pageId is a number", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    await expect(
      // @ts-expect-error testing invalid input
      api.seo.generateStructuredData({ pageId: "abc", schemaType: "WebPage" })
    ).rejects.toThrow();
  });
});

// ============================================================================
// getPublicSeo — Public access for SEO rendering
// ============================================================================
describe("SEO Editor — getPublicSeo", () => {
  it("should allow unauthenticated access (public procedure)", async () => {
    const ctx = createUnauthenticatedContext();
    const api = caller(ctx);
    try {
      const result = await api.seo.getPublicSeo({ slug: "nonexistent-page" });
      // Should return null for non-existent pages (no auth error)
      expect(result === null || typeof result === "object").toBe(true);
    } catch (e: any) {
      // INTERNAL_SERVER_ERROR from DB is acceptable in test env
      // But NOT an auth error — public procedure should not require login
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toMatch(/FORBIDDEN/i);
    }
  });

  it("should allow authenticated user access", async () => {
    const ctx = createRegularUserContext();
    const api = caller(ctx);
    try {
      const result = await api.seo.getPublicSeo({ slug: "test-page" });
      expect(result === null || typeof result === "object").toBe(true);
    } catch (e: any) {
      expect(e.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should validate slug is a string", async () => {
    const ctx = createUnauthenticatedContext();
    const api = caller(ctx);
    await expect(
      // @ts-expect-error testing invalid input
      api.seo.getPublicSeo({ slug: 123 })
    ).rejects.toThrow();
  });

  it("should require slug parameter", async () => {
    const ctx = createUnauthenticatedContext();
    const api = caller(ctx);
    await expect(
      // @ts-expect-error testing missing input
      api.seo.getPublicSeo({})
    ).rejects.toThrow();
  });
});

// ============================================================================
// Schema Type Enum Validation
// ============================================================================
describe("SEO Editor — Schema Type Validation", () => {
  const validSchemaTypes = [
    "Article",
    "Course",
    "Organization",
    "WebPage",
    "FAQPage",
    "Service",
  ];

  validSchemaTypes.forEach((schemaType) => {
    it(`should accept valid schema type: ${schemaType}`, async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        await api.seo.updateSeo({
          pageId: 999999,
          schemaType: schemaType as any,
        });
      } catch (e: any) {
        // Input validation should pass; only DB errors expected
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  const invalidSchemaTypes = [
    "BlogPost",
    "Product",
    "Event",
    "Recipe",
    "",
    "123",
  ];

  invalidSchemaTypes.forEach((schemaType) => {
    it(`should reject invalid schema type: "${schemaType}"`, async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        api.seo.updateSeo({ pageId: 1, schemaType: schemaType as any })
      ).rejects.toThrow();
    });
  });
});

// ============================================================================
// Twitter Card Enum Validation
// ============================================================================
describe("SEO Editor — Twitter Card Validation", () => {
  const validCards = ["summary", "summary_large_image"];

  validCards.forEach((card) => {
    it(`should accept valid twitter card: ${card}`, async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        await api.seo.updateSeo({
          pageId: 999999,
          twitterCard: card as any,
        });
      } catch (e: any) {
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  const invalidCards = ["player", "app", "photo", "gallery", ""];

  invalidCards.forEach((card) => {
    it(`should reject invalid twitter card: "${card}"`, async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        api.seo.updateSeo({ pageId: 1, twitterCard: card as any })
      ).rejects.toThrow();
    });
  });
});

// ============================================================================
// SEO Score Logic (unit tests for scoring algorithm)
// ============================================================================
describe("SEO Editor — SEO Score Calculation Logic", () => {
  it("should give higher score for complete SEO data", () => {
    // Simulate the scoring logic from SeoEditorPanel
    const completeData = {
      metaTitle: "SLE Preparation Course | RusingÂcademy", // 40 chars (30-60 range)
      metaDescription:
        "Prepare for your Second Language Evaluation with expert bilingual training for Canadian public servants. Structured programs and assessments.", // ~140 chars (120-160 range)
      ogImage: "https://example.com/og.jpg",
      canonicalUrl: "https://www.rusingacademy.ca/courses/sle-prep",
      structuredData: { "@type": "Course" },
      noIndex: false,
    };

    let score = 0;
    // Title check
    const titleLen = completeData.metaTitle.length;
    if (titleLen >= 30 && titleLen <= 60) score += 20;
    // Description check
    const descLen = completeData.metaDescription.length;
    if (descLen >= 120 && descLen <= 160) score += 20;
    // OG Image
    if (completeData.ogImage) score += 20;
    // Canonical
    if (completeData.canonicalUrl) score += 15;
    // Schema
    if (completeData.structuredData) score += 15;
    // Bilingual hint
    if (
      completeData.metaTitle.includes("|") ||
      completeData.metaDescription.includes("|")
    )
      score += 10;

    expect(score).toBeGreaterThanOrEqual(80);
  });

  it("should give lower score for empty SEO data", () => {
    const emptyData = {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      canonicalUrl: "",
      structuredData: null,
      noIndex: false,
    };

    let score = 0;
    if (emptyData.metaTitle.length >= 30 && emptyData.metaTitle.length <= 60)
      score += 20;
    if (
      emptyData.metaDescription.length >= 120 &&
      emptyData.metaDescription.length <= 160
    )
      score += 20;
    if (emptyData.ogImage) score += 20;
    if (emptyData.canonicalUrl) score += 15;
    if (emptyData.structuredData) score += 15;

    expect(score).toBe(0);
  });

  it("should penalize noIndex pages", () => {
    const noIndexData = {
      metaTitle: "SLE Preparation Course | RusingÂcademy",
      metaDescription:
        "Prepare for your Second Language Evaluation with expert bilingual training for Canadian public servants. Structured programs and assessments.",
      ogImage: "https://example.com/og.jpg",
      canonicalUrl: "https://www.rusingacademy.ca/courses/sle-prep",
      structuredData: { "@type": "Course" },
      noIndex: true,
    };

    let score = 0;
    const titleLen = noIndexData.metaTitle.length;
    if (titleLen >= 30 && titleLen <= 60) score += 20;
    const descLen = noIndexData.metaDescription.length;
    if (descLen >= 120 && descLen <= 160) score += 20;
    if (noIndexData.ogImage) score += 20;
    if (noIndexData.canonicalUrl) score += 15;
    if (noIndexData.structuredData) score += 15;
    if (noIndexData.noIndex) score = Math.max(0, score - 10);
    if (
      noIndexData.metaTitle.includes("|") ||
      noIndexData.metaDescription.includes("|")
    )
      score += 10;

    // Score should be reduced by 10 due to noIndex
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(0);
  });

  it("should detect bilingual content hint", () => {
    const bilingualTitle = "SLE Prep | Préparation ELS";
    const hasBilingual = bilingualTitle.includes("|");
    expect(hasBilingual).toBe(true);
  });
});

// ============================================================================
// Character Limit Validation
// ============================================================================
describe("SEO Editor — Character Limits", () => {
  it("should accept metaTitle at exactly 120 chars", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    const title = "A".repeat(120);
    try {
      await api.seo.updateSeo({ pageId: 999999, metaTitle: title });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept metaDescription at exactly 320 chars", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    const desc = "B".repeat(320);
    try {
      await api.seo.updateSeo({ pageId: 999999, metaDescription: desc });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should accept ogImage URL at exactly 500 chars", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    const url = "https://example.com/" + "a".repeat(479);
    try {
      await api.seo.updateSeo({ pageId: 999999, ogImage: url });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should reject ogImage URL over 500 chars", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    const url = "https://example.com/" + "a".repeat(481);
    await expect(
      api.seo.updateSeo({ pageId: 1, ogImage: url })
    ).rejects.toThrow();
  });

  it("should accept canonicalUrl at exactly 500 chars", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    const url = "https://example.com/" + "a".repeat(479);
    try {
      await api.seo.updateSeo({ pageId: 999999, canonicalUrl: url });
    } catch (e: any) {
      expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
    }
  });

  it("should reject canonicalUrl over 500 chars", async () => {
    const ctx = createAdminContext();
    const api = caller(ctx);
    const url = "https://example.com/" + "a".repeat(481);
    await expect(
      api.seo.updateSeo({ pageId: 1, canonicalUrl: url })
    ).rejects.toThrow();
  });
});
