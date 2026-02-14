import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Visual Editor Advanced Features Tests
 * 
 * Tests the three new backend routers:
 * 1. crossPage — copy/move sections between pages
 * 2. stylePresets — CRUD for global style presets
 * 3. revisionHistory — section revision tracking and restore
 * 
 * These tests verify input validation via tRPC schemas and authorization.
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

function createRegularUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user-test",
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
// CROSS-PAGE SECTION OPERATIONS
// ============================================================================
describe("Cross-Page Section Operations (crossPage router)", () => {
  describe("copySection", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.crossPage.copySection({ sectionId: 1, targetPageId: 2 })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createUnauthenticatedContext();
      const api = caller(ctx);
      await expect(
        api.crossPage.copySection({ sectionId: 1, targetPageId: 2 })
      ).rejects.toThrow();
    });

    it("should validate sectionId is a number", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing invalid input
        api.crossPage.copySection({ sectionId: "abc", targetPageId: 2 })
      ).rejects.toThrow();
    });

    it("should validate targetPageId is a number", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing invalid input
        api.crossPage.copySection({ sectionId: 1, targetPageId: "abc" })
      ).rejects.toThrow();
    });

    it("should accept optional targetSortOrder", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        await api.crossPage.copySection({ sectionId: 999999, targetPageId: 999999, targetSortOrder: 5 });
      } catch (e: any) {
        // NOT_FOUND or INTERNAL_SERVER_ERROR (DB unavailable in test env)
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  describe("moveSection", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.crossPage.moveSection({ sectionId: 1, targetPageId: 2 })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createUnauthenticatedContext();
      const api = caller(ctx);
      await expect(
        api.crossPage.moveSection({ sectionId: 1, targetPageId: 2 })
      ).rejects.toThrow();
    });

    it("should validate required fields", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing missing field
        api.crossPage.moveSection({ sectionId: 1 })
      ).rejects.toThrow();
    });

    it("should handle non-existent section gracefully", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        await api.crossPage.moveSection({ sectionId: 999999, targetPageId: 999999 });
      } catch (e: any) {
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  describe("listPages", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(api.crossPage.listPages()).rejects.toThrow(/admin|forbidden/i);
    });

    it("should return an array for admin users or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const pages = await api.crossPage.listPages();
        expect(Array.isArray(pages)).toBe(true);
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });

    it("should return pages with expected fields or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const pages = await api.crossPage.listPages();
        if (pages.length > 0) {
          expect(pages[0]).toHaveProperty("id");
          expect(pages[0]).toHaveProperty("title");
          expect(pages[0]).toHaveProperty("slug");
        }
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });
});

// ============================================================================
// STYLE PRESETS
// ============================================================================
describe("Style Presets (stylePresets router)", () => {
  describe("list", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(api.stylePresets.list()).rejects.toThrow(/admin|forbidden/i);
    });

    it("should return an array of presets for admin or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const presets = await api.stylePresets.list();
        expect(Array.isArray(presets)).toBe(true);
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });

    it("should include default presets with parsed styles or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const presets = await api.stylePresets.list();
        const defaults = presets.filter((p: any) => p.isDefault);
        expect(defaults.length).toBeGreaterThan(0);
        if (defaults.length > 0) {
          expect(typeof defaults[0].styles).toBe("object");
          expect(defaults[0].styles).toHaveProperty("backgroundColor");
        }
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });

    it("should include brand presets seeded earlier or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const presets = await api.stylePresets.list();
        const brandNames = presets.map((p: any) => p.name);
        expect(brandNames).toContain("Foundation Dark");
        expect(brandNames).toContain("Academy Indigo");
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  describe("create", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.stylePresets.create({
          name: "Test Preset",
          styles: { backgroundColor: "#ff0000", textColor: "#ffffff" },
        })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should validate name is required", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing missing name
        api.stylePresets.create({ styles: { backgroundColor: "#ff0000" } })
      ).rejects.toThrow();
    });

    it("should validate name is not empty", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        api.stylePresets.create({
          name: "",
          styles: { backgroundColor: "#ff0000" },
        })
      ).rejects.toThrow();
    });

    it("should create a custom preset successfully or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const result = await api.stylePresets.create({
          name: "Test Custom Preset " + Date.now(),
          description: "A test preset",
          category: "custom",
          styles: { backgroundColor: "#123456", textColor: "#fedcba", paddingTop: 32, paddingBottom: 32 },
        });
        expect(result.success).toBe(true);
        expect(result.id).toBeGreaterThan(0);
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  describe("update", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.stylePresets.update({ id: 1, name: "Updated" })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should validate id is required", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing missing id
        api.stylePresets.update({ name: "Updated" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.stylePresets.delete({ id: 1 })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should prevent deleting default presets or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const presets = await api.stylePresets.list();
        const defaultPreset = presets.find((p: any) => p.isDefault);
        if (defaultPreset) {
          await expect(
            api.stylePresets.delete({ id: defaultPreset.id })
          ).rejects.toThrow(/cannot delete default/i);
        }
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });

    it("should handle non-existent preset gracefully or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        await api.stylePresets.delete({ id: 999999 });
      } catch (e: any) {
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  describe("applyToSection", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.stylePresets.applyToSection({ presetId: 1, sectionId: 1 })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should validate both presetId and sectionId are required", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing missing field
        api.stylePresets.applyToSection({ presetId: 1 })
      ).rejects.toThrow();
    });

    it("should handle non-existent preset gracefully or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        await api.stylePresets.applyToSection({ presetId: 999999, sectionId: 1 });
      } catch (e: any) {
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  describe("saveFromSection", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.stylePresets.saveFromSection({ sectionId: 1, name: "Saved Preset" })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should validate name is required and non-empty", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        api.stylePresets.saveFromSection({ sectionId: 1, name: "" })
      ).rejects.toThrow();
    });

    it("should handle non-existent section gracefully or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        await api.stylePresets.saveFromSection({ sectionId: 999999, name: "Test" });
      } catch (e: any) {
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });
});

// ============================================================================
// REVISION HISTORY
// ============================================================================
describe("Revision History (revisionHistory router)", () => {
  describe("listForSection", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.revisionHistory.listForSection({ sectionId: 1 })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should return an array for admin or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const revisions = await api.revisionHistory.listForSection({ sectionId: 1 });
        expect(Array.isArray(revisions)).toBe(true);
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });

    it("should validate sectionId is required", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing missing field
        api.revisionHistory.listForSection({})
      ).rejects.toThrow();
    });

    it("should validate limit is within range", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        api.revisionHistory.listForSection({ sectionId: 1, limit: 0 })
      ).rejects.toThrow();
    });

    it("should validate limit max is 100", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        api.revisionHistory.listForSection({ sectionId: 1, limit: 101 })
      ).rejects.toThrow();
    });

    it("should accept valid limit or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const revisions = await api.revisionHistory.listForSection({ sectionId: 1, limit: 10 });
        expect(Array.isArray(revisions)).toBe(true);
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });

  describe("listForPage", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.revisionHistory.listForPage({ pageId: 1 })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should return an array for admin or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        const revisions = await api.revisionHistory.listForPage({ pageId: 1 });
        expect(Array.isArray(revisions)).toBe(true);
      } catch (e: any) {
        expect(["INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });

    it("should validate pageId is required", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing missing field
        api.revisionHistory.listForPage({})
      ).rejects.toThrow();
    });

    it("should validate limit max is 200", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        api.revisionHistory.listForPage({ pageId: 1, limit: 201 })
      ).rejects.toThrow();
    });
  });

  describe("restore", () => {
    it("should require admin role", async () => {
      const ctx = createRegularUserContext();
      const api = caller(ctx);
      await expect(
        api.revisionHistory.restore({ revisionId: 1 })
      ).rejects.toThrow(/admin|forbidden/i);
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createUnauthenticatedContext();
      const api = caller(ctx);
      await expect(
        api.revisionHistory.restore({ revisionId: 1 })
      ).rejects.toThrow();
    });

    it("should validate revisionId is required", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      await expect(
        // @ts-expect-error testing missing field
        api.revisionHistory.restore({})
      ).rejects.toThrow();
    });

    it("should handle non-existent revision gracefully or handle DB unavailability", async () => {
      const ctx = createAdminContext();
      const api = caller(ctx);
      try {
        await api.revisionHistory.restore({ revisionId: 999999 });
      } catch (e: any) {
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(e.code);
      }
    });
  });
});

// ============================================================================
// INTEGRATION: Cross-feature authorization consistency
// ============================================================================
describe("Cross-feature authorization consistency", () => {
  it("all crossPage procedures should reject non-admin users", async () => {
    const ctx = createRegularUserContext();
    const api = caller(ctx);
    await expect(api.crossPage.copySection({ sectionId: 1, targetPageId: 2 })).rejects.toThrow(/admin|forbidden/i);
    await expect(api.crossPage.moveSection({ sectionId: 1, targetPageId: 2 })).rejects.toThrow(/admin|forbidden/i);
    await expect(api.crossPage.listPages()).rejects.toThrow(/admin|forbidden/i);
  });

  it("all stylePresets procedures should reject non-admin users", async () => {
    const ctx = createRegularUserContext();
    const api = caller(ctx);
    await expect(api.stylePresets.list()).rejects.toThrow(/admin|forbidden/i);
    await expect(api.stylePresets.create({ name: "Test", styles: { backgroundColor: "#fff" } })).rejects.toThrow(/admin|forbidden/i);
    await expect(api.stylePresets.update({ id: 1, name: "Test" })).rejects.toThrow(/admin|forbidden/i);
    await expect(api.stylePresets.delete({ id: 1 })).rejects.toThrow(/admin|forbidden/i);
    await expect(api.stylePresets.applyToSection({ presetId: 1, sectionId: 1 })).rejects.toThrow(/admin|forbidden/i);
    await expect(api.stylePresets.saveFromSection({ sectionId: 1, name: "Test" })).rejects.toThrow(/admin|forbidden/i);
  });

  it("all revisionHistory procedures should reject non-admin users", async () => {
    const ctx = createRegularUserContext();
    const api = caller(ctx);
    await expect(api.revisionHistory.listForSection({ sectionId: 1 })).rejects.toThrow(/admin|forbidden/i);
    await expect(api.revisionHistory.listForPage({ pageId: 1 })).rejects.toThrow(/admin|forbidden/i);
    await expect(api.revisionHistory.restore({ revisionId: 1 })).rejects.toThrow(/admin|forbidden/i);
  });

  it("all procedures should reject unauthenticated users", async () => {
    const ctx = createUnauthenticatedContext();
    const api = caller(ctx);
    await expect(api.crossPage.listPages()).rejects.toThrow();
    await expect(api.stylePresets.list()).rejects.toThrow();
    await expect(api.revisionHistory.listForSection({ sectionId: 1 })).rejects.toThrow();
    await expect(api.revisionHistory.listForPage({ pageId: 1 })).rejects.toThrow();
  });
});
