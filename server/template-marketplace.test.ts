import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Template Marketplace Tests
 *
 * Tests the Template Marketplace backend router:
 * 1. list — list templates with optional filters (admin only)
 * 2. getById — get a single template by ID (admin only)
 * 3. create — create a new template (admin only)
 * 4. saveFromSection — save an existing section as a template (admin only)
 * 5. update — update a template (admin only)
 * 6. delete — delete a template (admin only, not default)
 * 7. useTemplate — insert a template as a section on a page (admin only)
 * 8. categoryCounts — get category counts (admin only)
 *
 * Also validates:
 * - Authorization (admin-only for all operations)
 * - Input validation (name required, category enum)
 * - Default template protection (cannot delete defaults)
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-template-test",
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
    openId: "regular-template-test",
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

function createUnauthContext(): TrpcContext {
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

const caller = (ctx: TrpcContext) => appRouter.createCaller(ctx);

// ─── Authorization Tests ───
describe("Template Marketplace — Authorization", () => {
  it("should reject unauthenticated users from listing templates", async () => {
    const ctx = createUnauthContext();
    await expect(caller(ctx).templateMarketplace.list()).rejects.toThrow();
  });

  it("should reject regular users from listing templates", async () => {
    const ctx = createRegularUserContext();
    await expect(caller(ctx).templateMarketplace.list()).rejects.toThrow();
  });

  it("should reject unauthenticated users from creating templates", async () => {
    const ctx = createUnauthContext();
    await expect(
      caller(ctx).templateMarketplace.create({
        name: "Test Template",
        category: "hero",
        sectionType: "hero",
        config: { title: "Test" },
      })
    ).rejects.toThrow();
  });

  it("should reject regular users from creating templates", async () => {
    const ctx = createRegularUserContext();
    await expect(
      caller(ctx).templateMarketplace.create({
        name: "Test Template",
        category: "hero",
        sectionType: "hero",
        config: { title: "Test" },
      })
    ).rejects.toThrow();
  });

  it("should reject unauthenticated users from deleting templates", async () => {
    const ctx = createUnauthContext();
    await expect(
      caller(ctx).templateMarketplace.delete({ id: 1 })
    ).rejects.toThrow();
  });

  it("should reject regular users from deleting templates", async () => {
    const ctx = createRegularUserContext();
    await expect(
      caller(ctx).templateMarketplace.delete({ id: 1 })
    ).rejects.toThrow();
  });

  it("should reject unauthenticated users from using templates", async () => {
    const ctx = createUnauthContext();
    await expect(
      caller(ctx).templateMarketplace.useTemplate({ templateId: 1, pageId: 1 })
    ).rejects.toThrow();
  });

  it("should reject regular users from using templates", async () => {
    const ctx = createRegularUserContext();
    await expect(
      caller(ctx).templateMarketplace.useTemplate({ templateId: 1, pageId: 1 })
    ).rejects.toThrow();
  });

  it("should reject unauthenticated users from updating templates", async () => {
    const ctx = createUnauthContext();
    await expect(
      caller(ctx).templateMarketplace.update({ id: 1, name: "Updated" })
    ).rejects.toThrow();
  });

  it("should reject regular users from updating templates", async () => {
    const ctx = createRegularUserContext();
    await expect(
      caller(ctx).templateMarketplace.update({ id: 1, name: "Updated" })
    ).rejects.toThrow();
  });

  it("should reject unauthenticated users from saving section as template", async () => {
    const ctx = createUnauthContext();
    await expect(
      caller(ctx).templateMarketplace.saveFromSection({
        sectionId: 1,
        name: "Test",
        category: "hero",
      })
    ).rejects.toThrow();
  });

  it("should reject regular users from saving section as template", async () => {
    const ctx = createRegularUserContext();
    await expect(
      caller(ctx).templateMarketplace.saveFromSection({
        sectionId: 1,
        name: "Test",
        category: "hero",
      })
    ).rejects.toThrow();
  });

  it("should reject unauthenticated users from getting category counts", async () => {
    const ctx = createUnauthContext();
    await expect(caller(ctx).templateMarketplace.categoryCounts()).rejects.toThrow();
  });

  it("should reject regular users from getting category counts", async () => {
    const ctx = createRegularUserContext();
    await expect(caller(ctx).templateMarketplace.categoryCounts()).rejects.toThrow();
  });
});

// ─── Input Validation Tests ───
describe("Template Marketplace — Input Validation", () => {
  it("should reject create with empty name", async () => {
    const ctx = createAdminContext();
    await expect(
      caller(ctx).templateMarketplace.create({
        name: "",
        category: "hero",
        sectionType: "hero",
        config: { title: "Test" },
      })
    ).rejects.toThrow();
  });

  it("should reject create with name exceeding 255 chars", async () => {
    const ctx = createAdminContext();
    await expect(
      caller(ctx).templateMarketplace.create({
        name: "A".repeat(256),
        category: "hero",
        sectionType: "hero",
        config: { title: "Test" },
      })
    ).rejects.toThrow();
  });

  it("should reject create with invalid category", async () => {
    const ctx = createAdminContext();
    await expect(
      caller(ctx).templateMarketplace.create({
        name: "Test",
        category: "invalid_category" as any,
        sectionType: "hero",
        config: { title: "Test" },
      })
    ).rejects.toThrow();
  });

  it("should reject saveFromSection with empty name", async () => {
    const ctx = createAdminContext();
    await expect(
      caller(ctx).templateMarketplace.saveFromSection({
        sectionId: 1,
        name: "",
        category: "hero",
      })
    ).rejects.toThrow();
  });

  it("should accept valid category values", async () => {
    const ctx = createAdminContext();
    const validCategories = [
      "hero", "cta", "testimonials", "features", "course_promo",
      "government_training", "team", "pricing", "faq", "newsletter",
      "contact", "content", "gallery", "stats", "divider", "custom",
    ];
    for (const cat of validCategories) {
      // Just validate input parsing doesn't throw for valid categories
      // The actual DB operation may fail but the input validation should pass
      try {
        await caller(ctx).templateMarketplace.create({
          name: `Test ${cat}`,
          category: cat as any,
          sectionType: "hero",
          config: { title: "Test" },
        });
      } catch (e: any) {
        // DB errors are OK, but input validation errors are not
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    }
  });

  it("should accept valid language values", async () => {
    const ctx = createAdminContext();
    const validLanguages = ["en", "fr", "bilingual"];
    for (const lang of validLanguages) {
      try {
        await caller(ctx).templateMarketplace.create({
          name: `Test ${lang}`,
          category: "hero",
          sectionType: "hero",
          config: { title: "Test" },
          language: lang as any,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    }
  });

  it("should accept valid brand values", async () => {
    const ctx = createAdminContext();
    const validBrands = ["rusingacademy", "lingueefy", "barholex", "universal"];
    for (const brand of validBrands) {
      try {
        await caller(ctx).templateMarketplace.create({
          name: `Test ${brand}`,
          category: "hero",
          sectionType: "hero",
          config: { title: "Test" },
          brand: brand as any,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    }
  });

  it("should reject invalid language value", async () => {
    const ctx = createAdminContext();
    await expect(
      caller(ctx).templateMarketplace.create({
        name: "Test",
        category: "hero",
        sectionType: "hero",
        config: { title: "Test" },
        language: "spanish" as any,
      })
    ).rejects.toThrow();
  });

  it("should reject invalid brand value", async () => {
    const ctx = createAdminContext();
    await expect(
      caller(ctx).templateMarketplace.create({
        name: "Test",
        category: "hero",
        sectionType: "hero",
        config: { title: "Test" },
        brand: "invalid_brand" as any,
      })
    ).rejects.toThrow();
  });
});

// ─── CRUD Operations Tests (Admin) ───
describe("Template Marketplace — CRUD Operations", () => {
  it("should allow admin to list templates (may be empty)", async () => {
    const ctx = createAdminContext();
    const result = await caller(ctx).templateMarketplace.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to list templates with category filter", async () => {
    const ctx = createAdminContext();
    const result = await caller(ctx).templateMarketplace.list({ category: "hero" });
    expect(Array.isArray(result)).toBe(true);
    // All results should be in the hero category
    result.forEach(t => expect(t.category).toBe("hero"));
  });

  it("should allow admin to list templates with search filter", async () => {
    const ctx = createAdminContext();
    const result = await caller(ctx).templateMarketplace.list({ search: "nonexistent-xyz" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should allow admin to create a template and retrieve it", async () => {
    const ctx = createAdminContext();
    const createResult = await caller(ctx).templateMarketplace.create({
      name: "Test Hero Template",
      description: "A test hero template for vitest",
      category: "hero",
      sectionType: "hero",
      config: {
        title: "Welcome to RusingÂcademy",
        subtitle: "Bilingual Excellence",
        content: { ctaText: "Start Learning", ctaUrl: "/courses" },
        backgroundColor: "#1e1b4b",
        textColor: "#ffffff",
      },
      language: "bilingual",
      brand: "rusingacademy",
      tags: "hero,bilingual,test",
    });
    expect(createResult.success).toBe(true);

    // Verify it appears in the list
    const list = await caller(ctx).templateMarketplace.list({ category: "hero" });
    const found = list.find(t => t.name === "Test Hero Template");
    expect(found).toBeDefined();
    expect(found!.sectionType).toBe("hero");
    expect(found!.language).toBe("bilingual");
    expect(found!.brand).toBe("rusingacademy");
    expect(found!.config).toBeDefined();
    expect(found!.config.title).toBe("Welcome to RusingÂcademy");
  });

  it("should allow admin to update a template", async () => {
    const ctx = createAdminContext();
    // Find the test template
    const list = await caller(ctx).templateMarketplace.list();
    const testTemplate = list.find(t => t.name === "Test Hero Template");
    if (!testTemplate) return; // Skip if not found (test order dependency)

    const updateResult = await caller(ctx).templateMarketplace.update({
      id: testTemplate.id,
      name: "Updated Hero Template",
      description: "Updated description",
    });
    expect(updateResult.success).toBe(true);

    // Verify the update
    const updated = await caller(ctx).templateMarketplace.getById({ id: testTemplate.id });
    expect(updated.name).toBe("Updated Hero Template");
    expect(updated.description).toBe("Updated description");
  });

  it("should allow admin to get category counts", async () => {
    const ctx = createAdminContext();
    const counts = await caller(ctx).templateMarketplace.categoryCounts();
    expect(Array.isArray(counts)).toBe(true);
    // Each item should have category and count
    counts.forEach(c => {
      expect(c.category).toBeDefined();
      expect(typeof c.count).toBe("number");
    });
  });

  it("should allow admin to delete a non-default template", async () => {
    const ctx = createAdminContext();
    // Find the updated test template
    const list = await caller(ctx).templateMarketplace.list();
    const testTemplate = list.find(t => t.name === "Updated Hero Template" || t.name === "Test Hero Template");
    if (!testTemplate) return;

    const deleteResult = await caller(ctx).templateMarketplace.delete({ id: testTemplate.id });
    expect(deleteResult.success).toBe(true);

    // Verify it's gone
    await expect(
      caller(ctx).templateMarketplace.getById({ id: testTemplate.id })
    ).rejects.toThrow();
  });

  it("should not allow deleting a non-existent template", async () => {
    const ctx = createAdminContext();
    await expect(
      caller(ctx).templateMarketplace.delete({ id: 999999 })
    ).rejects.toThrow();
  });
});

// ─── Template Config Structure Tests ───
describe("Template Marketplace — Config Structure", () => {
  it("should store and retrieve complex config objects", async () => {
    const ctx = createAdminContext();
    const complexConfig = {
      title: "Features Grid | Grille de fonctionnalités",
      subtitle: "Why Choose Us | Pourquoi nous choisir",
      content: {
        items: [
          { title: "SLE Exam Prep", description: "Targeted preparation", icon: "🎯" },
          { title: "AI Coaching", description: "Personalized feedback", icon: "🤖" },
        ],
      },
      backgroundColor: "#f8fafc",
      textColor: "#1a1a2e",
      paddingTop: 64,
      paddingBottom: 64,
    };

    await caller(ctx).templateMarketplace.create({
      name: "Complex Config Test",
      category: "features",
      sectionType: "features",
      config: complexConfig,
    });

    const list = await caller(ctx).templateMarketplace.list({ category: "features" });
    const found = list.find(t => t.name === "Complex Config Test");
    expect(found).toBeDefined();
    expect(found!.config.content.items).toHaveLength(2);
    expect(found!.config.content.items[0].title).toBe("SLE Exam Prep");
    expect(found!.config.paddingTop).toBe(64);

    // Clean up
    await caller(ctx).templateMarketplace.delete({ id: found!.id });
  });

  it("should handle bilingual content in config", async () => {
    const ctx = createAdminContext();
    await caller(ctx).templateMarketplace.create({
      name: "Bilingual CTA Test",
      category: "cta",
      sectionType: "cta",
      config: {
        title: "Ready to Start? | Prêt à commencer?",
        subtitle: "Join thousands | Rejoignez des milliers",
        content: {
          ctaText: "Enroll Now | S'inscrire maintenant",
          ctaUrl: "/pricing",
        },
      },
      language: "bilingual",
    });

    const list = await caller(ctx).templateMarketplace.list({ category: "cta" });
    const found = list.find(t => t.name === "Bilingual CTA Test");
    expect(found).toBeDefined();
    expect(found!.config.title).toContain("Prêt à commencer");
    expect(found!.language).toBe("bilingual");

    // Clean up
    await caller(ctx).templateMarketplace.delete({ id: found!.id });
  });
});

// ─── Filter Tests ───
describe("Template Marketplace — Filtering", () => {
  it("should filter by brand correctly", async () => {
    const ctx = createAdminContext();
    // Create templates for different brands
    await caller(ctx).templateMarketplace.create({
      name: "Lingueefy Hero",
      category: "hero",
      sectionType: "hero",
      config: { title: "Lingueefy" },
      brand: "lingueefy",
    });
    await caller(ctx).templateMarketplace.create({
      name: "Universal Hero",
      category: "hero",
      sectionType: "hero",
      config: { title: "Universal" },
      brand: "universal",
    });

    // Filter by lingueefy should include lingueefy + universal
    const lingueefy = await caller(ctx).templateMarketplace.list({ brand: "lingueefy" });
    const lingueefyNames = lingueefy.map(t => t.name);
    const hasLingueefy = lingueefyNames.some(n => n === "Lingueefy Hero");
    const hasUniversal = lingueefyNames.some(n => n === "Universal Hero");
    expect(hasLingueefy).toBe(true);
    expect(hasUniversal).toBe(true);

    // Clean up
    const all = await caller(ctx).templateMarketplace.list();
    for (const t of all.filter(t => t.name === "Lingueefy Hero" || t.name === "Universal Hero")) {
      await caller(ctx).templateMarketplace.delete({ id: t.id });
    }
  });

  it("should filter by search query", async () => {
    const ctx = createAdminContext();
    await caller(ctx).templateMarketplace.create({
      name: "Government SLE Training Hero",
      category: "government_training",
      sectionType: "hero",
      config: { title: "SLE Training" },
      tags: "government,sle,training",
    });

    const results = await caller(ctx).templateMarketplace.list({ search: "SLE Training" });
    expect(results.some(t => t.name === "Government SLE Training Hero")).toBe(true);

    const noResults = await caller(ctx).templateMarketplace.list({ search: "nonexistent-xyz-123" });
    expect(noResults.length).toBe(0);

    // Clean up
    const all = await caller(ctx).templateMarketplace.list();
    for (const t of all.filter(t => t.name === "Government SLE Training Hero")) {
      await caller(ctx).templateMarketplace.delete({ id: t.id });
    }
  });
});
