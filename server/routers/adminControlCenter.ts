import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { sql, eq, desc, asc, and, gte, lte, count } from "drizzle-orm";
import { logRevision } from "./visualEditorAdvanced";
import {
  users,
  courseEnrollments,
  coachingPlanPurchases,
  courses,
  practiceLogs,
} from "../../drizzle/schema";

// ============================================================================
// Admin-only middleware
// ============================================================================
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ============================================================================
// SETTINGS ROUTER — Full platform configuration CRUD
// ============================================================================
export const settingsRouter = router({
  getAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {};
    const rows = await db.execute(
      sql`SELECT \`key\`, \`value\` FROM platform_settings`
    );
    const result: Record<string, string> = {};
    const data = (rows as any)[0] || rows;
    if (Array.isArray(data)) {
      for (const row of data) {
        result[row.key] = row.value;
      }
    }
    return result;
  }),

  get: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const [rows] = await db.execute(
      sql`SELECT \`value\` FROM platform_settings WHERE \`key\` = ${input.key} LIMIT 1`
    );
      const data = Array.isArray(rows) ? rows : [rows];
      return data.length > 0 ? (data[0] as any)?.value ?? null : null;
    }),

  set: adminProcedure
    .input(z.object({ key: z.string(), value: z.any(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const val = typeof input.value === "string" ? input.value : JSON.stringify(input.value);
      await db.execute(
        sql`INSERT INTO platform_settings (\`key\`, \`value\`, description, updatedBy) 
            VALUES (${input.key}, ${val}, ${input.description ?? null}, ${ctx.user.id})
            ON DUPLICATE KEY UPDATE \`value\` = ${val}, updatedBy = ${ctx.user.id}`
      );
      // Log activity
      await db.execute(
        sql`INSERT INTO admin_activity_log (userId, action, entityType, entityTitle) 
            VALUES (${ctx.user.id}, 'update_setting', 'setting', ${input.key})`
      );
      return { success: true };
    }),

  setBulk: adminProcedure
    .input(z.object({ settings: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      for (const [key, value] of Object.entries(input.settings)) {
        const val = typeof value === "string" ? value : JSON.stringify(value);
        await db.execute(
          sql`INSERT INTO platform_settings (\`key\`, \`value\`, updatedBy) 
              VALUES (${key}, ${val}, ${ctx.user.id})
              ON DUPLICATE KEY UPDATE \`value\` = ${val}, updatedBy = ${ctx.user.id}`
        );
      }
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.execute(sql`DELETE FROM platform_settings WHERE \`key\` = ${input.key}`);
      return { success: true };
    }),
});

// ============================================================================
// CMS ROUTER — Pages & Sections CRUD + Navigation
// ============================================================================
export const cmsRouter = router({
  // --- Pages ---
  listPages: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(sql`SELECT * FROM cms_pages ORDER BY updatedAt DESC`);
    return Array.isArray(rows) ? rows : [];
  }),

  getPage: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [rows] = await db.execute(sql`SELECT * FROM cms_pages WHERE id = ${input.id}`);
      const pages = Array.isArray(rows) ? rows : [];
      if (pages.length === 0) return null;
      const [sectionRows] = await db.execute(
        sql`SELECT * FROM cms_page_sections WHERE pageId = ${input.id} ORDER BY sortOrder ASC`
      );
      return { ...(pages[0] as any), sections: Array.isArray(sectionRows) ? sectionRows : [] };
    }),

  createPage: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      pageType: z.enum(["landing", "sales", "about", "custom"]).default("landing"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(
        sql`INSERT INTO cms_pages (title, slug, description, pageType, createdBy) 
            VALUES (${input.title}, ${input.slug}, ${input.description ?? null}, ${input.pageType}, ${ctx.user.id})`
      );
      const [result] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
      const id = Array.isArray(result) ? (result[0] as any)?.id : null;
      await db.execute(
        sql`INSERT INTO admin_activity_log (userId, action, entityType, entityId, entityTitle) 
            VALUES (${ctx.user.id}, 'create_page', 'cms_page', ${id}, ${input.title})`
      );
      return { id, success: true };
    }),

  updatePage: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      showHeader: z.boolean().optional(),
      showFooter: z.boolean().optional(),
      customCss: z.string().optional(),
      ogImage: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const sets: string[] = [];
      const vals: any[] = [];
      if (input.title !== undefined) { sets.push("title = ?"); vals.push(input.title); }
      if (input.slug !== undefined) { sets.push("slug = ?"); vals.push(input.slug); }
      if (input.description !== undefined) { sets.push("description = ?"); vals.push(input.description); }
      if (input.status !== undefined) {
        sets.push("status = ?"); vals.push(input.status);
        if (input.status === "published") sets.push("publishedAt = NOW()");
      }
      if (input.metaTitle !== undefined) { sets.push("metaTitle = ?"); vals.push(input.metaTitle); }
      if (input.metaDescription !== undefined) { sets.push("metaDescription = ?"); vals.push(input.metaDescription); }
      if (input.showHeader !== undefined) { sets.push("showHeader = ?"); vals.push(input.showHeader); }
      if (input.showFooter !== undefined) { sets.push("showFooter = ?"); vals.push(input.showFooter); }
      if (input.customCss !== undefined) { sets.push("customCss = ?"); vals.push(input.customCss); }
      if (input.ogImage !== undefined) { sets.push("ogImage = ?"); vals.push(input.ogImage); }
      if (sets.length === 0) return { success: true };
      // Use raw SQL for dynamic updates
      const setClause = sets.join(", ");
      await db.execute(sql.raw(`UPDATE cms_pages SET ${setClause} WHERE id = ${input.id}`));
      return { success: true };
    }),

  deletePage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(sql`DELETE FROM cms_page_sections WHERE pageId = ${input.id}`);
      await db.execute(sql`DELETE FROM cms_pages WHERE id = ${input.id}`);
      await db.execute(
        sql`INSERT INTO admin_activity_log (userId, action, entityType, entityId) 
            VALUES (${ctx.user.id}, 'delete_page', 'cms_page', ${input.id})`
      );
      return { success: true };
    }),

  // --- Sections ---
  addSection: adminProcedure
    .input(z.object({
      pageId: z.number(),
      sectionType: z.string(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      content: z.any().optional(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      paddingTop: z.number().optional(),
      paddingBottom: z.number().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const contentStr = input.content ? JSON.stringify(input.content) : null;
      await db.execute(
        sql`INSERT INTO cms_page_sections (pageId, sectionType, title, subtitle, content, backgroundColor, textColor, paddingTop, paddingBottom, sortOrder) 
            VALUES (${input.pageId}, ${input.sectionType}, ${input.title ?? null}, ${input.subtitle ?? null}, ${contentStr}, ${input.backgroundColor ?? null}, ${input.textColor ?? null}, ${input.paddingTop ?? 48}, ${input.paddingBottom ?? 48}, ${input.sortOrder})`
      );
      return { success: true };
    }),

  updateSection: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      content: z.any().optional(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      paddingTop: z.number().optional(),
      paddingBottom: z.number().optional(),
      sortOrder: z.number().optional(),
      isVisible: z.boolean().optional(),
      animation: z.string().optional(),
      animationDelay: z.number().optional(),
      animationDuration: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Get current section state for revision logging
      const [prevRows] = await db.execute(sql`SELECT * FROM cms_page_sections WHERE id = ${input.id} LIMIT 1`);
      const prevSection = (prevRows as any[])[0];

      if (input.title !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET title = ${input.title} WHERE id = ${input.id}`);
      if (input.subtitle !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET subtitle = ${input.subtitle} WHERE id = ${input.id}`);
      if (input.content !== undefined) {
        const c = JSON.stringify(input.content);
        await db.execute(sql`UPDATE cms_page_sections SET content = ${c} WHERE id = ${input.id}`);
      }
      if (input.backgroundColor !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET backgroundColor = ${input.backgroundColor} WHERE id = ${input.id}`);
      if (input.textColor !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET textColor = ${input.textColor} WHERE id = ${input.id}`);
      if (input.paddingTop !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET paddingTop = ${input.paddingTop} WHERE id = ${input.id}`);
      if (input.paddingBottom !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET paddingBottom = ${input.paddingBottom} WHERE id = ${input.id}`);
      if (input.sortOrder !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET sortOrder = ${input.sortOrder} WHERE id = ${input.id}`);
      if (input.isVisible !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET isVisible = ${input.isVisible} WHERE id = ${input.id}`);
      if (input.animation !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET animation = ${input.animation} WHERE id = ${input.id}`);
      if (input.animationDelay !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET animationDelay = ${input.animationDelay} WHERE id = ${input.id}`);
      if (input.animationDuration !== undefined)
        await db.execute(sql`UPDATE cms_page_sections SET animationDuration = ${input.animationDuration} WHERE id = ${input.id}`);

      // Log revision (non-blocking, best-effort)
      if (prevSection) {
        const changedFields = Object.keys(input).filter(k => k !== 'id' && input[k as keyof typeof input] !== undefined);
        try {
          await logRevision({
            sectionId: input.id,
            pageId: prevSection.pageId,
            userId: ctx.user.id,
            userName: ctx.user.name || ctx.user.email || "Admin",
            action: "update",
            fieldChanged: changedFields.join(", "),
            previousData: {
              title: prevSection.title,
              subtitle: prevSection.subtitle,
              content: prevSection.content,
              backgroundColor: prevSection.backgroundColor,
              textColor: prevSection.textColor,
              paddingTop: prevSection.paddingTop,
              paddingBottom: prevSection.paddingBottom,
            },
            newData: Object.fromEntries(changedFields.map(k => [k, input[k as keyof typeof input]])),
          });
        } catch (e) {
          console.error("[CMS] Failed to log revision:", e);
        }
      }

      return { success: true };
    }),
  duplicateSection: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [rows] = await db.execute(sql`SELECT * FROM cms_page_sections WHERE id = ${input.id} LIMIT 1`);
      const sections = Array.isArray(rows) ? rows : [];
      if (sections.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      const s = sections[0] as any;
      const contentStr = s.content ? (typeof s.content === 'string' ? s.content : JSON.stringify(s.content)) : null;
      await db.execute(
        sql`INSERT INTO cms_page_sections (pageId, sectionType, title, subtitle, content, backgroundColor, textColor, paddingTop, paddingBottom, sortOrder, isVisible)
            VALUES (${s.pageId}, ${s.sectionType}, ${(s.title || '') + ' (Copy)'}, ${s.subtitle}, ${contentStr}, ${s.backgroundColor}, ${s.textColor}, ${s.paddingTop ?? 48}, ${s.paddingBottom ?? 48}, ${(s.sortOrder || 0) + 1}, ${s.isVisible ?? 1})`
      );
      return { success: true };
    }),

  deleteSection: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(sql`DELETE FROM cms_page_sections WHERE id = ${input.id}`);
      return { success: true };
    }),

  reorderSections: adminProcedure
    .input(z.object({ pageId: z.number(), sectionIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      for (let i = 0; i < input.sectionIds.length; i++) {
        await db.execute(
          sql`UPDATE cms_page_sections SET sortOrder = ${i} WHERE id = ${input.sectionIds[i]} AND pageId = ${input.pageId}`
        );
      }
      return { success: true };
    }),

  // --- Navigation ---
  listMenus: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(sql`SELECT * FROM navigation_menus ORDER BY id ASC`);
    return Array.isArray(rows) ? rows : [];
  }),

  getMenuItems: adminProcedure
    .input(z.object({ menuId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const [rows] = await db.execute(
        sql`SELECT * FROM navigation_menu_items WHERE menuId = ${input.menuId} ORDER BY sortOrder ASC`
      );
      return Array.isArray(rows) ? rows : [];
    }),

  createMenu: adminProcedure
    .input(z.object({ name: z.string(), location: z.string().default("header") }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(sql`INSERT INTO navigation_menus (name, location) VALUES (${input.name}, ${input.location})`);
      return { success: true };
    }),

  addMenuItem: adminProcedure
    .input(z.object({
      menuId: z.number(),
      label: z.string(),
      url: z.string(),
      target: z.string().default("_self"),
      icon: z.string().optional(),
      parentId: z.number().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(
        sql`INSERT INTO navigation_menu_items (menuId, label, url, target, icon, parentId, sortOrder) 
            VALUES (${input.menuId}, ${input.label}, ${input.url}, ${input.target}, ${input.icon ?? null}, ${input.parentId ?? null}, ${input.sortOrder})`
      );
      return { success: true };
    }),

  deleteMenuItem: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(sql`DELETE FROM navigation_menu_items WHERE id = ${input.id}`);
      return { success: true };
    }),

  // --- CMS Versioning ---
  saveVersion: adminProcedure
    .input(z.object({
      pageId: z.number(),
      note: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Get current page data
      const [pageRows] = await db.execute(sql`SELECT * FROM cms_pages WHERE id = ${input.pageId}`);
      const pages = Array.isArray(pageRows) ? pageRows : [];
      if (pages.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      const page = pages[0] as any;
      // Get current sections
      const [sectionRows] = await db.execute(
        sql`SELECT * FROM cms_page_sections WHERE pageId = ${input.pageId} ORDER BY sortOrder ASC`
      );
      const sections = Array.isArray(sectionRows) ? sectionRows : [];
      // Get next version number
      const [versionRows] = await db.execute(
        sql`SELECT COALESCE(MAX(versionNumber), 0) as maxVer FROM cms_page_versions WHERE pageId = ${input.pageId}`
      );
      const maxVer = Array.isArray(versionRows) ? Number((versionRows[0] as any)?.maxVer ?? 0) : 0;
      const nextVersion = maxVer + 1;
      // Save snapshot
      await db.execute(
        sql`INSERT INTO cms_page_versions (pageId, versionNumber, title, slug, description, pageType, sectionsSnapshot, createdBy, note)
            VALUES (${input.pageId}, ${nextVersion}, ${page.title}, ${page.slug}, ${page.description ?? null}, ${page.pageType ?? 'landing'}, ${JSON.stringify(sections)}, ${ctx.user.id}, ${input.note ?? null})`
      );
      await db.execute(
        sql`INSERT INTO admin_activity_log (userId, action, entityType, entityId, entityTitle)
            VALUES (${ctx.user.id}, 'save_version', 'cms_page', ${input.pageId}, ${`v${nextVersion}: ${page.title}`})`
      );
      return { versionNumber: nextVersion, success: true };
    }),

  listVersions: adminProcedure
    .input(z.object({ pageId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const [rows] = await db.execute(
        sql`SELECT id, pageId, versionNumber, title, slug, note, createdBy, createdAt FROM cms_page_versions WHERE pageId = ${input.pageId} ORDER BY versionNumber DESC`
      );
      return Array.isArray(rows) ? rows : [];
    }),

  getVersion: adminProcedure
    .input(z.object({ versionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [rows] = await db.execute(
        sql`SELECT * FROM cms_page_versions WHERE id = ${input.versionId}`
      );
      const versions = Array.isArray(rows) ? rows : [];
      if (versions.length === 0) return null;
      const v = versions[0] as any;
      return {
        ...v,
        sections: typeof v.sectionsSnapshot === 'string' ? JSON.parse(v.sectionsSnapshot) : (v.sectionsSnapshot ?? []),
      };
    }),

  restoreVersion: adminProcedure
    .input(z.object({ versionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Get the version
      const [vRows] = await db.execute(sql`SELECT * FROM cms_page_versions WHERE id = ${input.versionId}`);
      const versions = Array.isArray(vRows) ? vRows : [];
      if (versions.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
      const version = versions[0] as any;
      const sections = typeof version.sectionsSnapshot === 'string' ? JSON.parse(version.sectionsSnapshot) : (version.sectionsSnapshot ?? []);
      // Update page metadata
      await db.execute(
        sql`UPDATE cms_pages SET title = ${version.title}, slug = ${version.slug}, description = ${version.description ?? null}, updatedAt = NOW() WHERE id = ${version.pageId}`
      );
      // Replace sections: delete current, insert from snapshot
      await db.execute(sql`DELETE FROM cms_page_sections WHERE pageId = ${version.pageId}`);
      for (const section of sections) {
        const contentStr = section.content ? (typeof section.content === 'string' ? section.content : JSON.stringify(section.content)) : null;
        await db.execute(
          sql`INSERT INTO cms_page_sections (pageId, sectionType, title, subtitle, content, backgroundColor, textColor, sortOrder, isVisible)
              VALUES (${version.pageId}, ${section.sectionType}, ${section.title ?? null}, ${section.subtitle ?? null}, ${contentStr}, ${section.backgroundColor ?? null}, ${section.textColor ?? null}, ${section.sortOrder ?? 0}, ${section.isVisible ?? true})`
        );
      }
      await db.execute(
        sql`INSERT INTO admin_activity_log (userId, action, entityType, entityId, entityTitle)
            VALUES (${ctx.user.id}, 'restore_version', 'cms_page', ${version.pageId}, ${`Restored to v${version.versionNumber}`})`
      );
      return { success: true, restoredVersion: version.versionNumber };
    }),
  // --- Publish / Unpublish ---
  publishPage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(sql`UPDATE cms_pages SET status = 'published', publishedAt = NOW(), updatedAt = NOW() WHERE id = ${input.id}`);
      await db.execute(
        sql`INSERT INTO admin_activity_log (userId, action, entityType, entityId, entityTitle) VALUES (${ctx.user.id}, 'publish_page', 'cms_page', ${input.id}, 'Published page')`
      );
      return { success: true };
    }),
  unpublishPage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(sql`UPDATE cms_pages SET status = 'draft', publishedAt = NULL, updatedAt = NOW() WHERE id = ${input.id}`);
      await db.execute(
        sql`INSERT INTO admin_activity_log (userId, action, entityType, entityId, entityTitle) VALUES (${ctx.user.id}, 'unpublish_page', 'cms_page', ${input.id}, 'Unpublished page')`
      );
      return { success: true };
    }),
  // --- Public page rendering (no auth required) ---
  getPublicPage: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [rows] = await db.execute(
        sql`SELECT * FROM cms_pages WHERE slug = ${input.slug} AND status = 'published'`
      );
      const pages = Array.isArray(rows) ? rows : [];
      if (pages.length === 0) return null;
      const page = pages[0] as any;
      const [sectionRows] = await db.execute(
        sql`SELECT * FROM cms_page_sections WHERE pageId = ${page.id} AND isVisible = 1 ORDER BY sortOrder ASC`
      );
      const sections = (Array.isArray(sectionRows) ? sectionRows : []).map((s: any) => ({
        ...s,
        content: typeof s.content === 'string' ? JSON.parse(s.content) : (s.content ?? {}),
      }));
      return { ...page, sections };
    }),
  // --- Global styling ---
  getGlobalStyles: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const [rows] = await db.execute(
      sql`SELECT \`value\` FROM platform_settings WHERE \`key\` = 'cms_global_styles' LIMIT 1`
    );
    const data = Array.isArray(rows) ? rows : [];
    if (data.length === 0) return null;
    try { return JSON.parse((data[0] as any).value); } catch { return null; }
  }),
  setGlobalStyles: adminProcedure
    .input(z.object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      fontFamily: z.string().optional(),
      headingFont: z.string().optional(),
      fontSize: z.string().optional(),
      borderRadius: z.string().optional(),
      spacing: z.string().optional(),
      maxWidth: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const val = JSON.stringify(input);
      await db.execute(
        sql`INSERT INTO platform_settings (\`key\`, \`value\`, updatedBy) VALUES ('cms_global_styles', ${val}, ${ctx.user.id}) ON DUPLICATE KEY UPDATE \`value\` = ${val}, updatedBy = ${ctx.user.id}`
      );
      return { success: true };
    }),
  // --- Public navigation (no auth required) ---
  getPublicNavigation: publicProcedure
    .input(z.object({ location: z.enum(["header", "footer", "sidebar"]).default("header") }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { menus: [] };
      const [menuRows] = await db.execute(
        sql`SELECT * FROM navigation_menus WHERE location = ${input.location} AND isActive = 1 ORDER BY id ASC`
      );
      const menus = Array.isArray(menuRows) ? menuRows : [];
      if (menus.length === 0) return { menus: [] };
      const result = [];
      for (const menu of menus as any[]) {
        const [itemRows] = await db.execute(
          sql`SELECT * FROM navigation_menu_items WHERE menuId = ${menu.id} AND isVisible = 1 ORDER BY sortOrder ASC`
        );
        const items = Array.isArray(itemRows) ? itemRows : [];
        const topLevel = (items as any[]).filter(i => !i.parentId);
        const children = (items as any[]).filter(i => i.parentId);
        const tree = topLevel.map(item => ({
          ...item,
          children: children.filter(c => c.parentId === item.id),
        }));
        result.push({ ...menu, items: tree });
      }
      return { menus: result };
    }),
  // --- Update menu item (admin) ---
  updateMenuItem: adminProcedure
    .input(z.object({
      id: z.number(),
      label: z.string().optional(),
      url: z.string().optional(),
      target: z.string().optional(),
      icon: z.string().optional(),
      sortOrder: z.number().optional(),
      isVisible: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.label !== undefined)
        await db.execute(sql`UPDATE navigation_menu_items SET label = ${input.label} WHERE id = ${input.id}`);
      if (input.url !== undefined)
        await db.execute(sql`UPDATE navigation_menu_items SET url = ${input.url} WHERE id = ${input.id}`);
      if (input.target !== undefined)
        await db.execute(sql`UPDATE navigation_menu_items SET target = ${input.target} WHERE id = ${input.id}`);
      if (input.icon !== undefined)
        await db.execute(sql`UPDATE navigation_menu_items SET icon = ${input.icon} WHERE id = ${input.id}`);
      if (input.sortOrder !== undefined)
        await db.execute(sql`UPDATE navigation_menu_items SET sortOrder = ${input.sortOrder} WHERE id = ${input.id}`);
      if (input.isVisible !== undefined)
        await db.execute(sql`UPDATE navigation_menu_items SET isVisible = ${input.isVisible ? 1 : 0} WHERE id = ${input.id}`);
      return { success: true };
    }),
  // --- Toggle menu active state ---
  toggleMenu: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(
        sql`UPDATE navigation_menus SET isActive = ${input.isActive ? 1 : 0} WHERE id = ${input.id}`
      );
      return { success: true };
    }),
  // --- Delete menu ---
  deleteMenu: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(sql`DELETE FROM navigation_menu_items WHERE menuId = ${input.id}`);
      await db.execute(sql`DELETE FROM navigation_menus WHERE id = ${input.id}`);
      return { success: true };
    }),
});

// ============================================================================
// AI ANALYTICS ROUTER — Lingueefy Companion monitoring
// ============================================================================
export const aiAnalyticsRouter = router({
  getOverview: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalAiSessions: 0, totalCompanionSessions: 0, totalMessages: 0, totalPracticeLogs: 0, avgSessionDuration: 0, avgScore: 0 };
    
    const [aiRows] = await db.execute(sql`SELECT COUNT(*) as cnt FROM ai_sessions`);
    const totalAiSessions = Array.isArray(aiRows) ? Number((aiRows[0] as any)?.cnt ?? 0) : 0;

    const [practiceRows] = await db.execute(sql`SELECT COUNT(*) as cnt FROM practice_logs`);
    const totalPracticeLogs = Array.isArray(practiceRows) ? Number((practiceRows[0] as any)?.cnt ?? 0) : 0;

    const [durationRows] = await db.execute(sql`SELECT COALESCE(AVG(durationSeconds), 0) as avg FROM ai_sessions`);
    const avgSessionDuration = Array.isArray(durationRows) ? Number((durationRows[0] as any)?.avg ?? 0) : 0;

    const [scoreRows] = await db.execute(sql`SELECT COALESCE(AVG(score), 0) as avg FROM practice_logs WHERE score IS NOT NULL`);
    const avgScore = Array.isArray(scoreRows) ? Number((scoreRows[0] as any)?.avg ?? 0) : 0;

    return {
      totalAiSessions,
      totalCompanionSessions: totalAiSessions,
      totalMessages: totalAiSessions * 5, // estimate
      totalPracticeLogs,
      avgSessionDuration: Math.round(avgSessionDuration),
      avgScore: Math.round(avgScore),
    };
  }),

  getTopUsers: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const [rows] = await db.execute(
        sql`SELECT p.userId, u.name, u.email, COUNT(*) as sessionCount, 
            COALESCE(AVG(p.score), 0) as avgScore, SUM(p.durationSeconds) as totalDuration
            FROM practice_logs p 
            LEFT JOIN users u ON p.userId = u.id 
            GROUP BY p.userId, u.name, u.email 
            ORDER BY sessionCount DESC 
            LIMIT ${input.limit}`
      );
      return Array.isArray(rows) ? rows : [];
    }),

  getByLevel: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT targetLevel, COUNT(*) as count, COALESCE(AVG(score), 0) as avgScore 
          FROM practice_logs WHERE targetLevel IS NOT NULL 
          GROUP BY targetLevel ORDER BY count DESC`
    );
    return Array.isArray(rows) ? rows : [];
  }),

  getByType: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT practiceType, COUNT(*) as count, COALESCE(AVG(score), 0) as avgScore 
          FROM practice_logs WHERE practiceType IS NOT NULL 
          GROUP BY practiceType ORDER BY count DESC`
    );
    return Array.isArray(rows) ? rows : [];
  }),

  getDailyTrend: adminProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const [rows] = await db.execute(
        sql`SELECT DATE(createdAt) as date, COUNT(*) as sessions, COALESCE(AVG(score), 0) as avgScore 
            FROM practice_logs 
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${input.days} DAY) 
            GROUP BY DATE(createdAt) ORDER BY date ASC`
      );
      return Array.isArray(rows) ? rows : [];
    }),

  // User drill-down: sessions, progression, errors for a specific user
  getUserDrilldown: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { user: null, sessions: [], progression: [], recentErrors: [] };

      // User info
      const [userRows] = await db.execute(
        sql`SELECT id, name, email, createdAt FROM users WHERE id = ${input.userId} LIMIT 1`
      );
      const user = Array.isArray(userRows) && userRows.length > 0 ? userRows[0] : null;

      // Recent practice sessions
      const [sessionRows] = await db.execute(
        sql`SELECT id, practiceType, targetLevel, score, durationSeconds, feedback, createdAt 
            FROM practice_logs WHERE userId = ${input.userId} 
            ORDER BY createdAt DESC LIMIT 50`
      );
      const sessions = Array.isArray(sessionRows) ? sessionRows : [];

      // Weekly progression (avg score per week)
      const [progressionRows] = await db.execute(
        sql`SELECT YEARWEEK(createdAt) as week, COALESCE(AVG(score), 0) as avgScore, COUNT(*) as sessionCount 
            FROM practice_logs WHERE userId = ${input.userId} 
            GROUP BY YEARWEEK(createdAt) ORDER BY week ASC LIMIT 12`
      );
      const progression = Array.isArray(progressionRows) ? progressionRows : [];

      // Recent errors/low scores
      const [errorRows] = await db.execute(
        sql`SELECT id, practiceType, targetLevel, score, feedback, createdAt 
            FROM practice_logs WHERE userId = ${input.userId} AND score IS NOT NULL AND score < 60 
            ORDER BY createdAt DESC LIMIT 20`
      );
      const recentErrors = Array.isArray(errorRows) ? errorRows : [];

      return { user, sessions, progression, recentErrors };
    }),

  // List all users with AI usage for drill-down selection
  listAIUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT p.userId, u.name, u.email, COUNT(*) as totalSessions, 
          COALESCE(AVG(p.score), 0) as avgScore, MAX(p.createdAt) as lastActive 
          FROM practice_logs p LEFT JOIN users u ON p.userId = u.id 
          GROUP BY p.userId, u.name, u.email ORDER BY totalSessions DESC`
    );
    return Array.isArray(rows) ? rows : [];
  }),
});

// ============================================================================
// SALES ANALYTICS ROUTER — Revenue, LTV, Churn, Funnel
// ============================================================================
// ============================================================================
// AI RULES ROUTER — Configurable A/B/C levels, simulation types
// ============================================================================
export const aiRulesRouter = router({
  getRules: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT \`key\`, \`value\` FROM platform_settings WHERE \`key\` LIKE 'ai_rule_%' ORDER BY \`key\``
    );
    return Array.isArray(rows) ? rows : [];
  }),

  setRule: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      await db.execute(
        sql`INSERT INTO platform_settings (\`key\`, \`value\`, updatedAt) 
            VALUES (${input.key}, ${input.value}, NOW()) 
            ON DUPLICATE KEY UPDATE \`value\` = ${input.value}, updatedAt = NOW()`
      );
      return true;
    }),

  deleteRule: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      await db.execute(
        sql`DELETE FROM platform_settings WHERE \`key\` = ${input.key}`
      );
      return true;
    }),
});

export const salesAnalyticsRouter = router({
  getConversionFunnel: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { stages: [
      { name: "Visitors", count: 0, rate: 100 },
      { name: "Leads", count: 0, rate: 0 },
      { name: "Trials", count: 0, rate: 0 },
      { name: "Customers", count: 0, rate: 0 },
      { name: "Repeat", count: 0, rate: 0 },
    ]};

    const [totalUsers] = await db.execute(sql`SELECT COUNT(*) as cnt FROM users`);
    const totalUsersCount = Array.isArray(totalUsers) ? Number((totalUsers[0] as any)?.cnt ?? 0) : 0;

    const [leadsCount] = await db.execute(sql`SELECT COUNT(*) as cnt FROM ecosystem_leads`);
    const leads = Array.isArray(leadsCount) ? Number((leadsCount[0] as any)?.cnt ?? 0) : 0;

    const [enrolledCount] = await db.execute(sql`SELECT COUNT(DISTINCT userId) as cnt FROM course_enrollments`);
    const enrolled = Array.isArray(enrolledCount) ? Number((enrolledCount[0] as any)?.cnt ?? 0) : 0;

    const [paidCount] = await db.execute(sql`SELECT COUNT(DISTINCT userId) as cnt FROM course_enrollments WHERE amountPaid > 0`);
    const paid = Array.isArray(paidCount) ? Number((paidCount[0] as any)?.cnt ?? 0) : 0;

    const stages = [
      { name: "Visitors", count: totalUsersCount, rate: 100 },
      { name: "Leads", count: leads, rate: totalUsersCount > 0 ? Math.round((leads / totalUsersCount) * 100) : 0 },
      { name: "Enrolled", count: enrolled, rate: totalUsersCount > 0 ? Math.round((enrolled / totalUsersCount) * 100) : 0 },
      { name: "Paid", count: paid, rate: totalUsersCount > 0 ? Math.round((paid / totalUsersCount) * 100) : 0 },
      { name: "Repeat", count: 0, rate: 0 },
    ];
    return { stages };
  }),

  getStudentLTV: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { averageLTV: 0, totalRevenue: 0, totalCustomers: 0 };

    const [enrollmentRevenue] = await db.execute(
      sql`SELECT COALESCE(SUM(amountPaid), 0) as total, COUNT(DISTINCT userId) as customers FROM course_enrollments`
    );
    const total = Array.isArray(enrollmentRevenue) ? Number((enrollmentRevenue[0] as any)?.total ?? 0) : 0;
    const customers = Array.isArray(enrollmentRevenue) ? Number((enrollmentRevenue[0] as any)?.customers ?? 0) : 0;

    const [coachingRevenue] = await db.execute(
      sql`SELECT COALESCE(SUM(CAST(amountPaid AS DECIMAL(10,2))), 0) as total FROM coaching_plan_purchases`
    );
    const coachingTotal = Array.isArray(coachingRevenue) ? Number((coachingRevenue[0] as any)?.total ?? 0) : 0;

    const totalRevenue = total + coachingTotal;
    const averageLTV = customers > 0 ? Math.round(totalRevenue / customers) : 0;

    return { averageLTV, totalRevenue, totalCustomers: customers };
  }),

  getChurn: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { churnRate: 0, activeStudents: 0, inactiveStudents: 0 };

    const [activeRows] = await db.execute(
      sql`SELECT COUNT(DISTINCT userId) as cnt FROM course_enrollments WHERE status = 'active'`
    );
    const active = Array.isArray(activeRows) ? Number((activeRows[0] as any)?.cnt ?? 0) : 0;

    const [totalRows] = await db.execute(
      sql`SELECT COUNT(DISTINCT userId) as cnt FROM course_enrollments`
    );
    const total = Array.isArray(totalRows) ? Number((totalRows[0] as any)?.cnt ?? 0) : 0;

    const inactive = total - active;
    const churnRate = total > 0 ? Math.round((inactive / total) * 100) : 0;

    return { churnRate, activeStudents: active, inactiveStudents: inactive };
  }),

  getMonthlyRevenue: adminProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const [rows] = await db.execute(
        sql`SELECT DATE_FORMAT(enrolledAt, '%Y-%m') as month, 
            SUM(amountPaid) as revenue, COUNT(*) as transactions 
            FROM course_enrollments 
            WHERE enrolledAt >= DATE_SUB(NOW(), INTERVAL ${input.months} MONTH) 
            GROUP BY DATE_FORMAT(enrolledAt, '%Y-%m') 
            ORDER BY month ASC`
      );
      return Array.isArray(rows) ? rows : [];
    }),

  getExportData: adminProcedure
    .input(z.object({
      type: z.enum(["enrollments", "coaching", "all"]),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const dateFilter = input.dateFrom && input.dateTo
        ? sql` AND enrolledAt BETWEEN ${input.dateFrom} AND ${input.dateTo}`
        : sql``;
      if (input.type === "enrollments" || input.type === "all") {
        const [rows] = await db.execute(
          sql`SELECT ce.id, u.name as userName, u.email as userEmail, 
              c.title as courseTitle, c.category as productCategory, ce.status, 
              ce.amountPaid, ce.enrolledAt,
              CASE WHEN ce.enrolledAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'new' 
                   WHEN ce.enrolledAt >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 'recent' 
                   ELSE 'established' END as cohort
              FROM course_enrollments ce 
              LEFT JOIN users u ON ce.userId = u.id 
              LEFT JOIN courses c ON ce.courseId = c.id 
              WHERE 1=1 ${dateFilter}
              ORDER BY ce.enrolledAt DESC LIMIT 2000`
        );
        return Array.isArray(rows) ? rows : [];
      }
      const [rows] = await db.execute(
        sql`SELECT cp.id, u.name as userName, u.email as userEmail, 
            cp.planName, cp.status, cp.amountPaid, cp.purchasedAt,
            CASE WHEN cp.purchasedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'new' 
                 WHEN cp.purchasedAt >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 'recent' 
                 ELSE 'established' END as cohort
            FROM coaching_plan_purchases cp 
            LEFT JOIN users u ON cp.userId = u.id 
            ORDER BY cp.purchasedAt DESC LIMIT 2000`
      );
      return Array.isArray(rows) ? rows : [];
    }),

  getRevenueByProduct: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT c.title as product, c.category, COUNT(*) as sales, 
          COALESCE(SUM(ce.amountPaid), 0) as revenue 
          FROM course_enrollments ce 
          LEFT JOIN courses c ON ce.courseId = c.id 
          GROUP BY c.title, c.category ORDER BY revenue DESC`
    );
    return Array.isArray(rows) ? rows : [];
  }),

  getRevenueByCohort: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT 
          CASE WHEN enrolledAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Last 30 days' 
               WHEN enrolledAt >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 'Last 90 days' 
               WHEN enrolledAt >= DATE_SUB(NOW(), INTERVAL 180 DAY) THEN 'Last 6 months' 
               ELSE 'Older' END as cohort,
          COUNT(*) as enrollments, COALESCE(SUM(amountPaid), 0) as revenue 
          FROM course_enrollments GROUP BY cohort ORDER BY revenue DESC`
    );
    return Array.isArray(rows) ? rows : [];
  }),
});

// ============================================================================
// ACTIVITY LOG ROUTER — Who changed what, when
// ============================================================================
export const activityLogRouter = router({
  getRecent: adminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const [rows] = await db.execute(
        sql`SELECT a.*, u.name as userName, u.email as userEmail 
            FROM admin_activity_log a 
            LEFT JOIN users u ON a.userId = u.id 
            ORDER BY a.createdAt DESC LIMIT ${input.limit}`
      );
      return Array.isArray(rows) ? rows : [];
    }),
});


// ============================================================================
// MEDIA LIBRARY ROUTER — S3 upload, browse, tag, reuse across CMS/Courses
// ============================================================================
export const mediaLibraryRouter = router({
  list: adminProcedure
    .input(z.object({
      folder: z.string().optional(),
      mimeType: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      let where = sql`1=1`;
      if (input.folder) where = sql`${where} AND folder = ${input.folder}`;
      if (input.mimeType) where = sql`${where} AND mimeType LIKE ${input.mimeType + '%'}`;
      if (input.search) where = sql`${where} AND (fileName LIKE ${`%${input.search}%`} OR altText LIKE ${`%${input.search}%`} OR tags LIKE ${`%${input.search}%`})`;
      const [countRows] = await db.execute(sql`SELECT COUNT(*) as total FROM media_library WHERE ${where}`);
      const total = Array.isArray(countRows) && countRows[0] ? Number((countRows[0] as any).total) : 0;
      const [rows] = await db.execute(
        sql`SELECT * FROM media_library WHERE ${where} ORDER BY createdAt DESC LIMIT ${input.limit} OFFSET ${input.offset}`
      );
      return { items: Array.isArray(rows) ? rows : [], total };
    }),

  create: adminProcedure
    .input(z.object({
      fileName: z.string(),
      fileKey: z.string(),
      url: z.string(),
      mimeType: z.string().default("image/jpeg"),
      fileSize: z.number().default(0),
      altText: z.string().default(""),
      tags: z.string().default(""),
      folder: z.string().default("general"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.execute(
        sql`INSERT INTO media_library (fileName, fileKey, url, mimeType, fileSize, altText, tags, folder, uploadedBy) 
            VALUES (${input.fileName}, ${input.fileKey}, ${input.url}, ${input.mimeType}, ${input.fileSize}, ${input.altText}, ${input.tags}, ${input.folder}, ${ctx.user.id})`
      );
      return { id: (result as any).insertId, ...input };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      altText: z.string().optional(),
      tags: z.string().optional(),
      folder: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      const sets: string[] = [];
      if (input.altText !== undefined) sets.push(`altText = '${input.altText}'`);
      if (input.tags !== undefined) sets.push(`tags = '${input.tags}'`);
      if (input.folder !== undefined) sets.push(`folder = '${input.folder}'`);
      if (sets.length === 0) return false;
      await db.execute(sql`UPDATE media_library SET ${sql.raw(sets.join(', '))} WHERE id = ${input.id}`);
      return true;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      await db.execute(sql`DELETE FROM media_library WHERE id = ${input.id}`);
      return true;
    }),

  getFolders: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT folder, COUNT(*) as count FROM media_library GROUP BY folder ORDER BY folder`
    );
    return Array.isArray(rows) ? rows : [];
  }),
});

// ============================================================================
// RBAC PERMISSIONS ROUTER — Granular per-module + per-action permissions
// ============================================================================
export const rbacRouter = router({
  getPermissions: adminProcedure
    .input(z.object({ role: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const where = input.role ? sql`role = ${input.role}` : sql`1=1`;
      const [rows] = await db.execute(
        sql`SELECT * FROM role_permissions WHERE ${where} ORDER BY role, module, action`
      );
      return Array.isArray(rows) ? rows : [];
    }),

  setPermission: adminProcedure
    .input(z.object({
      role: z.string(),
      module: z.string(),
      action: z.string(),
      allowed: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      await db.execute(
        sql`INSERT INTO role_permissions (role, module, action, allowed) 
            VALUES (${input.role}, ${input.module}, ${input.action}, ${input.allowed}) 
            ON DUPLICATE KEY UPDATE allowed = ${input.allowed}`
      );
      return true;
    }),

  deletePermission: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      await db.execute(sql`DELETE FROM role_permissions WHERE id = ${input.id}`);
      return true;
    }),

  bulkSetPermissions: adminProcedure
    .input(z.object({
      role: z.string(),
      permissions: z.array(z.object({
        module: z.string(),
        action: z.string(),
        allowed: z.boolean(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      for (const perm of input.permissions) {
        await db.execute(
          sql`INSERT INTO role_permissions (role, module, action, allowed) 
              VALUES (${input.role}, ${perm.module}, ${perm.action}, ${perm.allowed}) 
              ON DUPLICATE KEY UPDATE allowed = ${perm.allowed}`
        );
      }
      return true;
    }),

  getRoles: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT DISTINCT role FROM role_permissions ORDER BY role`
    );
    return Array.isArray(rows) ? rows : [];
  }),
});

// ============================================================================
// EMAIL TEMPLATE ROUTER — Visual editor, dynamic variables, preview
// ============================================================================
export const emailTemplateRouter = router({
  list: adminProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let where = sql`1=1`;
      if (input.category) where = sql`${where} AND category = ${input.category}`;
      if (input.search) where = sql`${where} AND (name LIKE ${`%${input.search}%`} OR subject LIKE ${`%${input.search}%`})`;
      const [rows] = await db.execute(
        sql`SELECT * FROM email_templates WHERE ${where} ORDER BY updatedAt DESC`
      );
      return Array.isArray(rows) ? rows : [];
    }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [rows] = await db.execute(
        sql`SELECT * FROM email_templates WHERE id = ${input.id} LIMIT 1`
      );
      return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string(),
      subject: z.string().default(""),
      bodyHtml: z.string().default(""),
      bodyText: z.string().default(""),
      category: z.string().default("general"),
      variables: z.string().default("[]"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [result] = await db.execute(
        sql`INSERT INTO email_templates (name, subject, bodyHtml, bodyText, category, variables, createdBy) 
            VALUES (${input.name}, ${input.subject}, ${input.bodyHtml}, ${input.bodyText}, ${input.category}, ${input.variables}, ${ctx.user.id})`
      );
      return { id: (result as any).insertId, ...input };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      subject: z.string().optional(),
      bodyHtml: z.string().optional(),
      bodyText: z.string().optional(),
      category: z.string().optional(),
      variables: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      const { id, ...fields } = input;
      const sets: string[] = [];
      for (const [key, val] of Object.entries(fields)) {
        if (val !== undefined) {
          if (typeof val === "boolean") {
            sets.push(`${key} = ${val ? 1 : 0}`);
          } else {
            sets.push(`${key} = '${String(val).replace(/'/g, "''")}'`);
          }
        }
      }
      if (sets.length === 0) return false;
      await db.execute(sql`UPDATE email_templates SET ${sql.raw(sets.join(', '))} WHERE id = ${id}`);
      return true;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return false;
      await db.execute(sql`DELETE FROM email_templates WHERE id = ${input.id}`);
      return true;
    }),

  duplicate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [rows] = await db.execute(
        sql`SELECT * FROM email_templates WHERE id = ${input.id} LIMIT 1`
      );
      if (!Array.isArray(rows) || rows.length === 0) return null;
      const original = rows[0] as any;
      const [result] = await db.execute(
        sql`INSERT INTO email_templates (name, subject, bodyHtml, bodyText, category, variables, createdBy) 
            VALUES (${original.name + ' (Copy)'}, ${original.subject}, ${original.bodyHtml}, ${original.bodyText}, ${original.category}, ${original.variables}, ${ctx.user.id})`
      );
      return { id: (result as any).insertId };
    }),

  getCategories: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const [rows] = await db.execute(
      sql`SELECT DISTINCT category FROM email_templates ORDER BY category`
    );
    return Array.isArray(rows) ? rows : [];
  }),
});


// ============================================================================
// NOTIFICATIONS ROUTER — Admin & Coach push notifications
// ============================================================================
export const notificationsRouter = router({
  getAll: adminProcedure.input(z.object({
    unreadOnly: z.boolean().optional(),
    limit: z.number().optional(),
  }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb();
    const conditions: string[] = ["1=1"];
    if (input?.unreadOnly) conditions.push("isRead = FALSE");
    const limit = input?.limit || 50;
    const [rows] = await db.execute(sql.raw(
      `SELECT * FROM admin_notifications WHERE ${conditions.join(" AND ")} ORDER BY createdAt DESC LIMIT ${limit}`
    ));
    return Array.isArray(rows) ? rows : [];
  }),

  getUnreadCount: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT COUNT(*) as count FROM admin_notifications WHERE isRead = FALSE
    `);
    return (rows as any)[0]?.count || 0;
  }),

  markRead: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.execute(sql`
      UPDATE admin_notifications SET isRead = TRUE, readAt = NOW() WHERE id = ${input.id}
    `);
    return true;
  }),

  markAllRead: adminProcedure.mutation(async () => {
    const db = await getDb();
    await db.execute(sql`UPDATE admin_notifications SET isRead = TRUE, readAt = NOW() WHERE isRead = FALSE`);
    return true;
  }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.execute(sql`DELETE FROM admin_notifications WHERE id = ${input.id}`);
    return true;
  }),

  create: adminProcedure.input(z.object({
    title: z.string(),
    message: z.string(),
    type: z.string().optional(),
    targetRole: z.string().optional(),
    link: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    await db.execute(sql`
      INSERT INTO admin_notifications (title, message, type, targetRole, link)
      VALUES (${input.title}, ${input.message}, ${input.type || "info"}, ${input.targetRole || "admin"}, ${input.link || null})
    `);
    return true;
  }),
});

// ============================================================================
// IMPORT/EXPORT ROUTER — CSV contacts, bulk courses/pages backup
// ============================================================================
export const importExportRouter = router({
  exportContacts: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT u.id, u.name, u.email, u.role, u.createdAt,
        CASE WHEN cp.id IS NOT NULL THEN 'coach' ELSE 'learner' END as profileType
      FROM users u
      LEFT JOIN coach_profiles cp ON cp.userId = u.id
      ORDER BY u.createdAt DESC
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  exportCourses: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT c.id, c.title, c.slug, c.description, c.category, c.level,
        c.price, c.originalPrice, c.status, c.totalEnrollments, c.createdAt,
        COUNT(DISTINCT cm.id) as moduleCount,
        COUNT(DISTINCT cl.id) as lessonCount
      FROM courses c
      LEFT JOIN course_modules cm ON cm.courseId = c.id
      LEFT JOIN lessons cl ON cl.moduleId = cm.id
      GROUP BY c.id
      ORDER BY c.createdAt DESC
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  exportPages: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT id, title, slug, status, pageType, createdAt, updatedAt
      FROM cms_pages ORDER BY createdAt DESC
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  exportAnalyticsEvents: adminProcedure.input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional()).query(async ({ input }) => {
    const db = await getDb();
    let dateFilter = "";
    if (input?.startDate && input?.endDate) {
      dateFilter = `AND createdAt BETWEEN '${input.startDate}' AND '${input.endDate}'`;
    }
    const [rows] = await db.execute(sql.raw(
      `SELECT id, eventType, source, userId, productName, productType, amount, currency, createdAt
       FROM analytics_events WHERE 1=1 ${dateFilter} ORDER BY createdAt DESC LIMIT 10000`
    ));
    return Array.isArray(rows) ? rows : [];
  }),

  exportEnrollments: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT ce.id, u.name as studentName, u.email as studentEmail,
        c.title as courseName, ce.status, ce.progress, ce.enrolledAt, ce.completedAt
      FROM course_enrollments ce
      JOIN users u ON u.id = ce.userId
      JOIN courses c ON c.id = ce.courseId
      ORDER BY ce.enrolledAt DESC
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  importContacts: adminProcedure.input(z.object({
    contacts: z.array(z.object({
      name: z.string(),
      email: z.string(),
      role: z.string().optional(),
    })),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    let imported = 0;
    let skipped = 0;
    for (const contact of input.contacts) {
      try {
        const [existing] = await db.execute(sql`SELECT id FROM users WHERE email = ${contact.email}`);
        if (Array.isArray(existing) && existing.length > 0) {
          skipped++;
          continue;
        }
        await db.execute(sql`
          INSERT INTO users (name, email, role, openId) VALUES (${contact.name}, ${contact.email}, ${contact.role || "user"}, ${`imported_${Date.now()}_${Math.random().toString(36).slice(2)}`})
        `);
        imported++;
      } catch {
        skipped++;
      }
    }
    return { imported, skipped, total: input.contacts.length };
  }),
});

// ============================================================================
// PREVIEW MODE ROUTER — View as student/coach/admin/public
// ============================================================================
export const previewModeRouter = router({
  getPreviewData: adminProcedure.input(z.object({
    viewAs: z.enum(["student", "coach", "admin", "public"]),
    targetUserId: z.number().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    
    if (input.viewAs === "public") {
      // Return public-facing data only
      const [courses] = await db.execute(sql`
        SELECT id, title, slug, description, category, level, price, originalPrice, totalEnrollments
        FROM courses WHERE status = 'published' ORDER BY totalEnrollments DESC LIMIT 20
      `);
      const [coaches] = await db.execute(sql`
        SELECT cp.id, u.name, cp.slug, cp.specializations, cp.averageRating, cp.totalSessions
        FROM coach_profiles cp JOIN users u ON u.id = cp.userId
        WHERE cp.status = 'approved' ORDER BY cp.averageRating DESC LIMIT 10
      `);
      return { viewAs: "public", courses, coaches, pages: [], enrollments: [] };
    }

    if (input.viewAs === "student") {
      if (!input.targetUserId) {
        // Return generic student view with published courses
        const [courses] = await db.execute(sql`
          SELECT id, title, slug, description, category, level, price, totalEnrollments
          FROM courses WHERE status = 'published' ORDER BY totalEnrollments DESC LIMIT 20
        `);
        return { viewAs: "student", user: null, enrollments: [], courses, coaches: [] };
      }
      const [enrollments] = await db.execute(sql`
        SELECT ce.*, c.title as courseName FROM course_enrollments ce
        JOIN courses c ON c.id = ce.courseId
        WHERE ce.userId = ${input.targetUserId}
      `);
      const [user] = await db.execute(sql`SELECT id, name, email FROM users WHERE id = ${input.targetUserId}`);
      return { viewAs: "student", user: Array.isArray(user) ? user[0] : null, enrollments, courses: [], coaches: [] };
    }

    if (input.viewAs === "coach" && input.targetUserId) {
      const [profile] = await db.execute(sql`
        SELECT cp.*, u.name, u.email FROM coach_profiles cp
        JOIN users u ON u.id = cp.userId WHERE cp.userId = ${input.targetUserId}
      `);
      const [sessions] = await db.execute(sql`
        SELECT COUNT(*) as total FROM coaching_sessions WHERE coachId = ${input.targetUserId}
      `);
      return { viewAs: "coach", profile: Array.isArray(profile) ? profile[0] : null, sessions, courses: [], enrollments: [] };
    }

    // Admin view - return everything
    const [totalUsers] = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const [totalCourses] = await db.execute(sql`SELECT COUNT(*) as count FROM courses`);
    const [totalEnrollments] = await db.execute(sql`SELECT COUNT(*) as count FROM course_enrollments`);
    return {
      viewAs: "admin",
      stats: {
        users: (totalUsers as any)[0]?.count || 0,
        courses: (totalCourses as any)[0]?.count || 0,
        enrollments: (totalEnrollments as any)[0]?.count || 0,
      },
      courses: [], coaches: [], enrollments: [],
    };
  }),

  getStudentsList: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT u.id, u.name, u.email, COUNT(ce.id) as enrollmentCount
      FROM users u
      LEFT JOIN course_enrollments ce ON ce.userId = u.id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY u.name
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  getCoachesList: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT u.id, u.name, u.email, cp.specializations, cp.averageRating
      FROM users u
      JOIN coach_profiles cp ON cp.userId = u.id
      ORDER BY u.name
    `);
    return Array.isArray(rows) ? rows : [];
  }),
});

// ============================================================================
// GLOBAL SEARCH ROUTER — Search across all admin entities
// ============================================================================
export const globalSearchRouter = router({
  search: adminProcedure.input(z.object({
    query: z.string().min(1),
    limit: z.number().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    const q = `%${input.query}%`;
    const limit = input.limit || 20;
    
    // Search users
    const [userRows] = await db.execute(sql`
      SELECT id, name, email, role, 'user' as entityType FROM users
      WHERE name LIKE ${q} OR email LIKE ${q}
      LIMIT ${limit}
    `);

    // Search courses
    const [courseRows] = await db.execute(sql`
      SELECT id, title as name, slug as email, status as role, 'course' as entityType FROM courses
      WHERE title LIKE ${q} OR description LIKE ${q} OR slug LIKE ${q}
      LIMIT ${limit}
    `);

    // Search CMS pages
    const [pageRows] = await db.execute(sql`
      SELECT id, title as name, slug as email, status as role, 'page' as entityType FROM cms_pages
      WHERE title LIKE ${q} OR slug LIKE ${q}
      LIMIT ${limit}
    `);

    // Search email templates
    const [templateRows] = await db.execute(sql`
      SELECT id, name, subject as email, category as role, 'email_template' as entityType FROM email_templates
      WHERE name LIKE ${q} OR subject LIKE ${q}
      LIMIT ${limit}
    `);

    // Search notifications
    const [notifRows] = await db.execute(sql`
      SELECT id, title as name, message as email, type as role, 'notification' as entityType FROM admin_notifications
      WHERE title LIKE ${q} OR message LIKE ${q}
      LIMIT ${limit}
    `);

    const results = [
      ...(Array.isArray(userRows) ? userRows : []),
      ...(Array.isArray(courseRows) ? courseRows : []),
      ...(Array.isArray(pageRows) ? pageRows : []),
      ...(Array.isArray(templateRows) ? templateRows : []),
      ...(Array.isArray(notifRows) ? notifRows : []),
    ];

    return results.slice(0, limit);
  }),

  quickActions: adminProcedure.query(async () => {
    return [
      { id: "create-course", label: "Create New Course", icon: "BookOpen", link: "/admin/courses/new" },
      { id: "create-page", label: "Create New Page", icon: "FileText", link: "/admin/pages" },
      { id: "invite-coach", label: "Invite Coach", icon: "UserPlus", link: "/admin/coaches" },
      { id: "create-funnel", label: "Create Funnel", icon: "Target", link: "/admin/funnels" },
      { id: "create-automation", label: "Create Automation", icon: "Zap", link: "/admin/automations" },
      { id: "create-email", label: "Create Email Template", icon: "Mail", link: "/admin/email-templates" },
      { id: "view-analytics", label: "View Sales Analytics", icon: "BarChart3", link: "/admin/sales-analytics" },
      { id: "export-data", label: "Export Data", icon: "Download", link: "/admin/import-export" },
      { id: "manage-settings", label: "Platform Settings", icon: "Settings", link: "/admin/settings" },
      { id: "view-notifications", label: "View Notifications", icon: "Bell", link: "/admin/notifications" },
    ];
  }),
});

// ============================================================================
// AI PREDICTIVE ANALYTICS ROUTER — Success prediction + recommendations
// ============================================================================
export const aiPredictiveRouter = router({
  getStudentPredictions: adminProcedure.query(async () => {
    const db = await getDb();
    // Get students with their engagement metrics
    const [rows] = await db.execute(sql`
      SELECT u.id, u.name, u.email,
        COUNT(DISTINCT ce.id) as enrolledCourses,
        AVG(ce.progress) as avgProgress,
        MAX(ce.enrolledAt) as lastEnrollment,
        (SELECT COUNT(*) FROM practice_logs pl WHERE pl.userId = u.id) as practiceCount,
        (SELECT MAX(pl.createdAt) FROM practice_logs pl WHERE pl.userId = u.id) as lastPractice
      FROM users u
      LEFT JOIN course_enrollments ce ON ce.userId = u.id
      WHERE u.role = 'user'
      GROUP BY u.id
      HAVING enrolledCourses > 0
      ORDER BY avgProgress DESC
    `);
    
    // Calculate risk scores and predictions
    const students = Array.isArray(rows) ? rows.map((s: any) => {
      const progress = parseFloat(s.avgProgress) || 0;
      const practiceCount = parseInt(s.practiceCount) || 0;
      const daysSinceLastPractice = s.lastPractice 
        ? Math.floor((Date.now() - new Date(s.lastPractice).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      // Risk score: 0 = no risk, 100 = high risk of churn
      let riskScore = 0;
      if (daysSinceLastPractice > 30) riskScore += 40;
      else if (daysSinceLastPractice > 14) riskScore += 20;
      else if (daysSinceLastPractice > 7) riskScore += 10;
      
      if (progress < 25) riskScore += 30;
      else if (progress < 50) riskScore += 15;
      
      if (practiceCount < 3) riskScore += 20;
      else if (practiceCount < 10) riskScore += 10;
      
      riskScore = Math.min(100, riskScore);
      
      // Success prediction: inverse of risk
      const successProbability = Math.max(0, 100 - riskScore);
      
      // Recommendation
      let recommendation = "";
      if (riskScore >= 70) recommendation = "Urgent: Schedule 1-on-1 coaching session. Student at high risk of dropping out.";
      else if (riskScore >= 50) recommendation = "Send personalized encouragement email. Suggest specific practice exercises.";
      else if (riskScore >= 30) recommendation = "Monitor progress. Consider offering bonus content or challenge.";
      else recommendation = "On track. Continue current engagement strategy.";
      
      return {
        ...s,
        riskScore,
        successProbability,
        recommendation,
        riskLevel: riskScore >= 70 ? "critical" : riskScore >= 50 ? "high" : riskScore >= 30 ? "medium" : "low",
        daysSinceLastPractice,
      };
    }) : [];
    
    return students;
  }),

  getCohortAnalysis: adminProcedure.query(async () => {
    const db = await getDb();
    // Monthly cohort analysis
    const [rows] = await db.execute(sql`
      SELECT 
        DATE_FORMAT(ce.enrolledAt, '%Y-%m') as cohort,
        COUNT(DISTINCT ce.userId) as students,
        AVG(ce.progress) as avgProgress,
        SUM(CASE WHEN ce.status = 'completed' THEN 1 ELSE 0 END) as completions,
        SUM(CASE WHEN ce.progress = 0 THEN 1 ELSE 0 END) as neverStarted
      FROM course_enrollments ce
      GROUP BY DATE_FORMAT(ce.enrolledAt, '%Y-%m')
      ORDER BY cohort DESC
      LIMIT 12
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  getEngagementTrends: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT 
        DATE(pl.createdAt) as date,
        COUNT(*) as sessions,
        COUNT(DISTINCT pl.userId) as uniqueUsers,
        AVG(pl.durationSeconds / 60) as avgDuration
      FROM practice_logs pl
      WHERE pl.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(pl.createdAt)
      ORDER BY date DESC
    `);
    return Array.isArray(rows) ? rows : [];
  }),

  getRecommendationsSummary: adminProcedure.query(async () => {
    const db = await getDb();
    const [atRisk] = await db.execute(sql`
      SELECT COUNT(DISTINCT u.id) as count FROM users u
      LEFT JOIN course_enrollments ce ON ce.userId = u.id
      LEFT JOIN practice_logs pl ON pl.userId = u.id
      WHERE u.role = 'user'
      AND (pl.createdAt IS NULL OR pl.createdAt < DATE_SUB(NOW(), INTERVAL 14 DAY))
      AND ce.id IS NOT NULL
    `);
    
    const [highPerformers] = await db.execute(sql`
      SELECT COUNT(DISTINCT u.id) as count FROM users u
      JOIN course_enrollments ce ON ce.userId = u.id
      WHERE u.role = 'user' AND ce.progress >= 80
    `);
    
    const [needsAttention] = await db.execute(sql`
      SELECT COUNT(DISTINCT u.id) as count FROM users u
      JOIN course_enrollments ce ON ce.userId = u.id
      WHERE u.role = 'user' AND ce.progress > 0 AND ce.progress < 30
    `);
    
    return {
      atRiskCount: (atRisk as any)[0]?.count || 0,
      highPerformersCount: (highPerformers as any)[0]?.count || 0,
      needsAttentionCount: (needsAttention as any)[0]?.count || 0,
      recommendations: [
        { priority: "high", action: "Re-engage inactive students", description: "Send targeted emails to students who haven't practiced in 14+ days" },
        { priority: "high", action: "Celebrate high performers", description: "Send certificates or badges to students with 80%+ progress" },
        { priority: "medium", action: "Boost struggling students", description: "Offer 1-on-1 coaching to students below 30% progress" },
        { priority: "low", action: "Content gap analysis", description: "Review courses with lowest completion rates for content improvements" },
      ],
    };
  }),
});
