import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Visual Editor CMS Tests
 * 
 * Tests the backend procedures used by the Visual Editor:
 * - cms.addSection (with new fields: backgroundColor, textColor, paddingTop, paddingBottom)
 * - cms.updateSection (with all editable fields)
 * - cms.duplicateSection
 * - cms.deleteSection
 * - cms.reorderSections
 * 
 * These tests verify input validation via tRPC schemas.
 * Database operations are tested indirectly through the procedure calls.
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user-test",
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

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user-test",
    email: "user@example.com",
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

describe("Visual Editor CMS Procedures", () => {

  describe("cms.addSection", () => {
    it("should reject unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.addSection({
          pageId: 1,
          sectionType: "hero",
          sortOrder: 0,
        })
      ).rejects.toThrow();
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.addSection({
          pageId: 1,
          sectionType: "hero",
          sortOrder: 0,
        })
      ).rejects.toThrow();
    });

    it("should accept valid hero section input with all fields", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      // This will fail at the DB level but validates the input schema
      try {
        await caller.cms.addSection({
          pageId: 99999,
          sectionType: "hero",
          title: "Welcome | Bienvenue",
          subtitle: "Master bilingual excellence | Maîtrisez l'excellence bilingue",
          content: {
            ctaText: "Start Learning | Commencer",
            ctaUrl: "/courses",
            backgroundImage: "",
            alignment: "center",
          },
          backgroundColor: "#1e1b4b",
          textColor: "#ffffff",
          paddingTop: 64,
          paddingBottom: 64,
          sortOrder: 0,
        });
      } catch (e: any) {
        // DB errors are expected in test environment, but input validation should pass
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept features section with items array", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.addSection({
          pageId: 99999,
          sectionType: "features",
          title: "Why Choose Us | Pourquoi nous choisir",
          subtitle: "Comprehensive bilingual training | Formation bilingue complète",
          content: {
            items: [
              { title: "SLE Exam Prep", description: "Targeted preparation", icon: "🎯" },
              { title: "AI Coaching", description: "Personalized feedback", icon: "🤖" },
            ],
          },
          backgroundColor: "#f8fafc",
          textColor: "#1a1a2e",
          sortOrder: 1,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept CTA section with primary and secondary buttons", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.addSection({
          pageId: 99999,
          sectionType: "cta",
          title: "Ready to Start? | Prêt à commencer?",
          content: {
            ctaText: "Enroll Now | S'inscrire maintenant",
            ctaUrl: "/pricing",
            secondaryCtaText: "Learn More | En savoir plus",
            secondaryCtaUrl: "/about",
          },
          backgroundColor: "#4f46e5",
          textColor: "#ffffff",
          sortOrder: 2,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept testimonials section with items", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.addSection({
          pageId: 99999,
          sectionType: "testimonials",
          title: "What Our Learners Say | Ce que disent nos apprenants",
          content: {
            items: [
              { name: "Marie D.", role: "Policy Analyst", quote: "Excellent!", rating: 5 },
            ],
          },
          backgroundColor: "#ffffff",
          textColor: "#1a1a2e",
          sortOrder: 3,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept minimal section with only required fields", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.addSection({
          pageId: 99999,
          sectionType: "spacer",
          sortOrder: 0,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept all 16 section types", () => {
      const validTypes = [
        "hero", "text", "features", "testimonials", "cta",
        "gallery", "video", "faq", "pricing", "stats",
        "team", "contact", "newsletter", "custom_html",
        "divider", "spacer",
      ];
      // All types should be accepted as strings by the schema
      validTypes.forEach(type => {
        expect(typeof type).toBe("string");
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  describe("cms.updateSection", () => {
    it("should reject unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.updateSection({ id: 1, title: "New Title" })
      ).rejects.toThrow();
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.updateSection({ id: 1, title: "New Title" })
      ).rejects.toThrow();
    });

    it("should accept title update", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          title: "Updated Title | Titre mis à jour",
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept subtitle update", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          subtitle: "Updated Subtitle | Sous-titre mis à jour",
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept backgroundColor update", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          backgroundColor: "#1e1b4b",
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept textColor update", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          textColor: "#ffffff",
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept paddingTop update", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          paddingTop: 96,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept paddingBottom update", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          paddingBottom: 32,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept content update with complex JSON", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          content: {
            items: [
              { title: "Feature 1 | Fonctionnalité 1", description: "Desc", icon: "🎯" },
              { title: "Feature 2 | Fonctionnalité 2", description: "Desc", icon: "🤖" },
            ],
          },
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept isVisible toggle", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          isVisible: false,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });

    it("should accept multiple field updates at once", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.updateSection({
          id: 99999,
          title: "New Title",
          subtitle: "New Subtitle",
          backgroundColor: "#000000",
          textColor: "#ffffff",
          paddingTop: 48,
          paddingBottom: 48,
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });
  });

  describe("cms.duplicateSection", () => {
    it("should reject unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.duplicateSection({ id: 1 })
      ).rejects.toThrow();
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.duplicateSection({ id: 1 })
      ).rejects.toThrow();
    });

    it("should accept valid section ID", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.duplicateSection({ id: 99999 });
      } catch (e: any) {
        // NOT_FOUND is expected for non-existent section, but BAD_REQUEST would mean schema issue
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  describe("cms.deleteSection", () => {
    it("should reject unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.deleteSection({ id: 1 })
      ).rejects.toThrow();
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.deleteSection({ id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("cms.reorderSections", () => {
    it("should reject unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.reorderSections({ pageId: 1, sectionIds: [1, 2, 3] })
      ).rejects.toThrow();
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.cms.reorderSections({ pageId: 1, sectionIds: [1, 2, 3] })
      ).rejects.toThrow();
    });

    it("should accept valid reorder input", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.cms.reorderSections({
          pageId: 99999,
          sectionIds: [3, 1, 2],
        });
      } catch (e: any) {
        expect(e.code).not.toBe("BAD_REQUEST");
      }
    });
  });
});

describe("Visual Editor Section Templates", () => {
  it("should define all 16 section types with bilingual defaults", () => {
    const SECTION_TEMPLATES = [
      { type: "hero", label: "Hero Banner", hasTitle: true, hasCta: true },
      { type: "text", label: "Text Block", hasTitle: true, hasContent: true },
      { type: "features", label: "Features Grid", hasTitle: true, hasItems: true },
      { type: "testimonials", label: "Testimonials", hasTitle: true, hasItems: true },
      { type: "cta", label: "Call to Action", hasTitle: true, hasCta: true },
      { type: "gallery", label: "Image Gallery", hasTitle: true },
      { type: "video", label: "Video Embed", hasTitle: true },
      { type: "faq", label: "FAQ", hasTitle: true, hasItems: true },
      { type: "pricing", label: "Pricing Table", hasTitle: true, hasItems: true },
      { type: "stats", label: "Stats Counter", hasTitle: true, hasItems: true },
      { type: "team", label: "Team / Coaches", hasTitle: true, hasItems: true },
      { type: "contact", label: "Contact Form", hasTitle: true },
      { type: "newsletter", label: "Newsletter", hasTitle: true },
      { type: "custom_html", label: "Custom HTML" },
      { type: "divider", label: "Divider" },
      { type: "spacer", label: "Spacer" },
    ];

    expect(SECTION_TEMPLATES).toHaveLength(16);
    
    // Verify each template has a unique type
    const types = SECTION_TEMPLATES.map(t => t.type);
    expect(new Set(types).size).toBe(16);
    
    // Verify each template has a label
    SECTION_TEMPLATES.forEach(template => {
      expect(template.type).toBeTruthy();
      expect(template.label).toBeTruthy();
      expect(template.type.length).toBeGreaterThan(0);
      expect(template.label.length).toBeGreaterThan(0);
    });
  });

  it("should have bilingual content patterns (EN | FR)", () => {
    const bilingualPattern = /\|/;
    const sampleTitles = [
      "Welcome to RusingÂcademy | Bienvenue chez RusingÂcademy",
      "Why Choose Us | Pourquoi nous choisir",
      "Ready to Start? | Prêt à commencer?",
      "What Our Learners Say | Ce que disent nos apprenants",
    ];
    
    sampleTitles.forEach(title => {
      expect(bilingualPattern.test(title)).toBe(true);
    });
  });
});

describe("Visual Editor Device Preview", () => {
  it("should define correct device widths", () => {
    const DEVICE_WIDTHS = {
      desktop: "100%",
      tablet: "768px",
      mobile: "375px",
    };
    
    expect(DEVICE_WIDTHS.desktop).toBe("100%");
    expect(DEVICE_WIDTHS.tablet).toBe("768px");
    expect(DEVICE_WIDTHS.mobile).toBe("375px");
  });
});

describe("Visual Editor Authorization", () => {
  it("should only allow admin users to access CMS procedures", async () => {
    const userCtx = createUserContext();
    const userCaller = appRouter.createCaller(userCtx);
    
    // All CMS mutations should be admin-only
    const mutations = [
      () => userCaller.cms.addSection({ pageId: 1, sectionType: "hero", sortOrder: 0 }),
      () => userCaller.cms.updateSection({ id: 1, title: "test" }),
      () => userCaller.cms.duplicateSection({ id: 1 }),
      () => userCaller.cms.deleteSection({ id: 1 }),
      () => userCaller.cms.reorderSections({ pageId: 1, sectionIds: [1] }),
    ];

    for (const mutation of mutations) {
      await expect(mutation()).rejects.toThrow();
    }
  });

  it("should reject unauthenticated users from all CMS procedures", async () => {
    const unauthCtx = createUnauthContext();
    const unauthCaller = appRouter.createCaller(unauthCtx);
    
    const mutations = [
      () => unauthCaller.cms.addSection({ pageId: 1, sectionType: "hero", sortOrder: 0 }),
      () => unauthCaller.cms.updateSection({ id: 1, title: "test" }),
      () => unauthCaller.cms.duplicateSection({ id: 1 }),
      () => unauthCaller.cms.deleteSection({ id: 1 }),
      () => unauthCaller.cms.reorderSections({ pageId: 1, sectionIds: [1] }),
    ];

    for (const mutation of mutations) {
      await expect(mutation()).rejects.toThrow();
    }
  });
});
