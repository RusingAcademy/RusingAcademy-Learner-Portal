import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// ============================================================================
// Admin-only middleware (same pattern as adminControlCenter)
// ============================================================================
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ============================================================================
// Helper: Log a section revision
// ============================================================================
async function logRevision(params: {
  sectionId: number;
  pageId: number;
  userId: number;
  userName: string;
  action: "create" | "update" | "delete" | "restore" | "copy" | "move";
  fieldChanged?: string;
  previousData?: any;
  newData?: any;
}) {
  const db = await getDb();
  await db.execute(
    sql`INSERT INTO cms_section_revisions (sectionId, pageId, userId, userName, action, fieldChanged, previousData, newData)
        VALUES (${params.sectionId}, ${params.pageId}, ${params.userId}, ${params.userName}, ${params.action}, 
                ${params.fieldChanged || null}, ${params.previousData ? JSON.stringify(params.previousData) : null}, 
                ${params.newData ? JSON.stringify(params.newData) : null})`
  );
}

// ============================================================================
// CROSS-PAGE SECTION OPERATIONS ROUTER
// ============================================================================
export const crossPageRouter = router({
  // Copy a section from one page to another
  copySection: adminProcedure
    .input(
      z.object({
        sectionId: z.number(),
        targetPageId: z.number(),
        targetSortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get the source section
      const [rows] = await db.execute(
        sql`SELECT * FROM cms_page_sections WHERE id = ${input.sectionId} LIMIT 1`
      );
      const section = (rows as any[])[0];
      if (!section) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });
      }

      // Verify target page exists
      const [pageRows] = await db.execute(
        sql`SELECT id, title FROM cms_pages WHERE id = ${input.targetPageId} LIMIT 1`
      );
      if (!(pageRows as any[])[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Target page not found" });
      }

      // Get the max sortOrder in target page
      const [maxRows] = await db.execute(
        sql`SELECT COALESCE(MAX(sortOrder), -1) as maxSort FROM cms_page_sections WHERE pageId = ${input.targetPageId}`
      );
      const newSortOrder = input.targetSortOrder ?? ((maxRows as any[])[0]?.maxSort ?? -1) + 1;

      // Insert the copied section
      const [result] = await db.execute(
        sql`INSERT INTO cms_page_sections (pageId, sectionType, title, subtitle, content, backgroundColor, textColor, paddingTop, paddingBottom, sortOrder, isVisible)
            VALUES (${input.targetPageId}, ${section.sectionType}, ${section.title}, ${section.subtitle}, ${section.content ? JSON.stringify(section.content) : null}, 
                    ${section.backgroundColor}, ${section.textColor}, ${section.paddingTop}, ${section.paddingBottom}, ${newSortOrder}, ${section.isVisible})`
      );

      const newId = (result as any).insertId;

      // Log revision for the new section
      await logRevision({
        sectionId: newId,
        pageId: input.targetPageId,
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || "Admin",
        action: "copy",
        newData: { copiedFrom: { sectionId: input.sectionId, pageId: section.pageId } },
      });

      return { success: true, newSectionId: newId, targetPageId: input.targetPageId };
    }),

  // Move a section from one page to another
  moveSection: adminProcedure
    .input(
      z.object({
        sectionId: z.number(),
        targetPageId: z.number(),
        targetSortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get the source section
      const [rows] = await db.execute(
        sql`SELECT * FROM cms_page_sections WHERE id = ${input.sectionId} LIMIT 1`
      );
      const section = (rows as any[])[0];
      if (!section) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });
      }

      const sourcePageId = section.pageId;

      // Verify target page exists
      const [pageRows] = await db.execute(
        sql`SELECT id FROM cms_pages WHERE id = ${input.targetPageId} LIMIT 1`
      );
      if (!(pageRows as any[])[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Target page not found" });
      }

      // Get the max sortOrder in target page
      const [maxRows] = await db.execute(
        sql`SELECT COALESCE(MAX(sortOrder), -1) as maxSort FROM cms_page_sections WHERE pageId = ${input.targetPageId}`
      );
      const newSortOrder = input.targetSortOrder ?? ((maxRows as any[])[0]?.maxSort ?? -1) + 1;

      // Move the section to the target page
      await db.execute(
        sql`UPDATE cms_page_sections SET pageId = ${input.targetPageId}, sortOrder = ${newSortOrder} WHERE id = ${input.sectionId}`
      );

      // Log revision
      await logRevision({
        sectionId: input.sectionId,
        pageId: input.targetPageId,
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || "Admin",
        action: "move",
        previousData: { pageId: sourcePageId },
        newData: { pageId: input.targetPageId },
      });

      return { success: true, sourcePageId, targetPageId: input.targetPageId };
    }),

  // List all pages (for the target page selector)
  listPages: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(
      sql`SELECT id, title, slug, status, pageType FROM cms_pages ORDER BY title ASC`
    );
    return rows as any[];
  }),
});

// ============================================================================
// STYLE PRESETS ROUTER
// ============================================================================
export const stylePresetsRouter = router({
  // List all style presets
  list: adminProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(
      sql`SELECT * FROM cms_style_presets ORDER BY isDefault DESC, category ASC, name ASC`
    );
    return (rows as any[]).map((r: any) => ({
      ...r,
      styles: typeof r.styles === "string" ? JSON.parse(r.styles) : r.styles,
    }));
  }),

  // Create a new style preset
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        category: z.string().default("custom"),
        styles: z.object({
          backgroundColor: z.string().optional(),
          textColor: z.string().optional(),
          paddingTop: z.number().optional(),
          paddingBottom: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [result] = await db.execute(
        sql`INSERT INTO cms_style_presets (name, description, styles, category, isDefault, createdBy)
            VALUES (${input.name}, ${input.description || null}, ${JSON.stringify(input.styles)}, ${input.category}, 0, ${ctx.user.id})`
      );
      return { success: true, id: (result as any).insertId };
    }),

  // Update a style preset
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        styles: z
          .object({
            backgroundColor: z.string().optional(),
            textColor: z.string().optional(),
            paddingTop: z.number().optional(),
            paddingBottom: z.number().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (input.name) {
        await db.execute(sql`UPDATE cms_style_presets SET name = ${input.name} WHERE id = ${input.id}`);
      }
      if (input.description !== undefined) {
        await db.execute(sql`UPDATE cms_style_presets SET description = ${input.description} WHERE id = ${input.id}`);
      }
      if (input.category) {
        await db.execute(sql`UPDATE cms_style_presets SET category = ${input.category} WHERE id = ${input.id}`);
      }
      if (input.styles) {
        await db.execute(sql`UPDATE cms_style_presets SET styles = ${JSON.stringify(input.styles)} WHERE id = ${input.id}`);
      }
      return { success: true };
    }),

  // Delete a style preset (only custom ones)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      // Don't allow deleting default presets
      const [rows] = await db.execute(
        sql`SELECT isDefault FROM cms_style_presets WHERE id = ${input.id} LIMIT 1`
      );
      const preset = (rows as any[])[0];
      if (!preset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Preset not found" });
      }
      if (preset.isDefault) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete default presets" });
      }
      await db.execute(sql`DELETE FROM cms_style_presets WHERE id = ${input.id}`);
      return { success: true };
    }),

  // Apply a style preset to a section
  applyToSection: adminProcedure
    .input(
      z.object({
        presetId: z.number(),
        sectionId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get the preset
      const [presetRows] = await db.execute(
        sql`SELECT * FROM cms_style_presets WHERE id = ${input.presetId} LIMIT 1`
      );
      const preset = (presetRows as any[])[0];
      if (!preset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Preset not found" });
      }

      // Get the current section state for revision logging
      const [sectionRows] = await db.execute(
        sql`SELECT * FROM cms_page_sections WHERE id = ${input.sectionId} LIMIT 1`
      );
      const section = (sectionRows as any[])[0];
      if (!section) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });
      }

      const styles = typeof preset.styles === "string" ? JSON.parse(preset.styles) : preset.styles;

      // Apply the styles
      if (styles.backgroundColor) {
        await db.execute(
          sql`UPDATE cms_page_sections SET backgroundColor = ${styles.backgroundColor} WHERE id = ${input.sectionId}`
        );
      }
      if (styles.textColor) {
        await db.execute(
          sql`UPDATE cms_page_sections SET textColor = ${styles.textColor} WHERE id = ${input.sectionId}`
        );
      }
      if (styles.paddingTop !== undefined) {
        await db.execute(
          sql`UPDATE cms_page_sections SET paddingTop = ${styles.paddingTop} WHERE id = ${input.sectionId}`
        );
      }
      if (styles.paddingBottom !== undefined) {
        await db.execute(
          sql`UPDATE cms_page_sections SET paddingBottom = ${styles.paddingBottom} WHERE id = ${input.sectionId}`
        );
      }

      // Log revision
      await logRevision({
        sectionId: input.sectionId,
        pageId: section.pageId,
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || "Admin",
        action: "update",
        fieldChanged: "style_preset",
        previousData: {
          backgroundColor: section.backgroundColor,
          textColor: section.textColor,
          paddingTop: section.paddingTop,
          paddingBottom: section.paddingBottom,
        },
        newData: { presetName: preset.name, ...styles },
      });

      return { success: true, appliedStyles: styles };
    }),

  // Save current section style as a new preset
  saveFromSection: adminProcedure
    .input(
      z.object({
        sectionId: z.number(),
        name: z.string().min(1).max(200),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get the section
      const [rows] = await db.execute(
        sql`SELECT backgroundColor, textColor, paddingTop, paddingBottom FROM cms_page_sections WHERE id = ${input.sectionId} LIMIT 1`
      );
      const section = (rows as any[])[0];
      if (!section) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });
      }

      const styles = {
        backgroundColor: section.backgroundColor || "#ffffff",
        textColor: section.textColor || "#1f2937",
        paddingTop: section.paddingTop ?? 48,
        paddingBottom: section.paddingBottom ?? 48,
      };

      const [result] = await db.execute(
        sql`INSERT INTO cms_style_presets (name, description, styles, category, isDefault, createdBy)
            VALUES (${input.name}, ${input.description || null}, ${JSON.stringify(styles)}, 'custom', 0, ${ctx.user.id})`
      );

      return { success: true, id: (result as any).insertId, styles };
    }),
});

// ============================================================================
// SECTION REVISION HISTORY ROUTER
// ============================================================================
export const revisionHistoryRouter = router({
  // List revisions for a specific section
  listForSection: adminProcedure
    .input(
      z.object({
        sectionId: z.number(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        sql`SELECT * FROM cms_section_revisions WHERE sectionId = ${input.sectionId} ORDER BY createdAt DESC LIMIT ${input.limit}`
      );
      return (rows as any[]).map((r: any) => ({
        ...r,
        previousData: typeof r.previousData === "string" ? JSON.parse(r.previousData) : r.previousData,
        newData: typeof r.newData === "string" ? JSON.parse(r.newData) : r.newData,
      }));
    }),

  // List revisions for an entire page
  listForPage: adminProcedure
    .input(
      z.object({
        pageId: z.number(),
        limit: z.number().min(1).max(200).default(100),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        sql`SELECT r.*, s.sectionType, s.title as sectionTitle 
            FROM cms_section_revisions r 
            LEFT JOIN cms_page_sections s ON r.sectionId = s.id 
            WHERE r.pageId = ${input.pageId} 
            ORDER BY r.createdAt DESC 
            LIMIT ${input.limit}`
      );
      return (rows as any[]).map((r: any) => ({
        ...r,
        previousData: typeof r.previousData === "string" ? JSON.parse(r.previousData) : r.previousData,
        newData: typeof r.newData === "string" ? JSON.parse(r.newData) : r.newData,
      }));
    }),

  // Restore a section to a previous revision state
  restore: adminProcedure
    .input(z.object({ revisionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get the revision
      const [revRows] = await db.execute(
        sql`SELECT * FROM cms_section_revisions WHERE id = ${input.revisionId} LIMIT 1`
      );
      const revision = (revRows as unknown as any[])[0];
      if (!revision) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Revision not found" });
      }

      const previousData =
        typeof revision.previousData === "string"
          ? JSON.parse(revision.previousData)
          : revision.previousData;

      if (!previousData) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No previous data to restore" });
      }

      // Get current section state for logging
      const [sectionRows] = await db.execute(
        sql`SELECT * FROM cms_page_sections WHERE id = ${revision.sectionId} LIMIT 1`
      );
      const currentSection = (sectionRows as unknown as any[])[0];
      if (!currentSection) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Section no longer exists" });
      }

      // Restore the fields from previousData
      if (previousData.title !== undefined) {
        await db.execute(sql`UPDATE cms_page_sections SET title = ${previousData.title} WHERE id = ${revision.sectionId}`);
      }
      if (previousData.subtitle !== undefined) {
        await db.execute(sql`UPDATE cms_page_sections SET subtitle = ${previousData.subtitle} WHERE id = ${revision.sectionId}`);
      }
      if (previousData.content !== undefined) {
        const c = typeof previousData.content === "object" ? JSON.stringify(previousData.content) : previousData.content;
        await db.execute(sql`UPDATE cms_page_sections SET content = ${c} WHERE id = ${revision.sectionId}`);
      }
      if (previousData.backgroundColor !== undefined) {
        await db.execute(sql`UPDATE cms_page_sections SET backgroundColor = ${previousData.backgroundColor} WHERE id = ${revision.sectionId}`);
      }
      if (previousData.textColor !== undefined) {
        await db.execute(sql`UPDATE cms_page_sections SET textColor = ${previousData.textColor} WHERE id = ${revision.sectionId}`);
      }
      if (previousData.paddingTop !== undefined) {
        await db.execute(sql`UPDATE cms_page_sections SET paddingTop = ${previousData.paddingTop} WHERE id = ${revision.sectionId}`);
      }
      if (previousData.paddingBottom !== undefined) {
        await db.execute(sql`UPDATE cms_page_sections SET paddingBottom = ${previousData.paddingBottom} WHERE id = ${revision.sectionId}`);
      }

      // Log the restore action
      await logRevision({
        sectionId: revision.sectionId,
        pageId: revision.pageId,
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || "Admin",
        action: "restore",
        fieldChanged: `restored_from_revision_${input.revisionId}`,
        previousData: {
          title: currentSection.title,
          subtitle: currentSection.subtitle,
          backgroundColor: currentSection.backgroundColor,
          textColor: currentSection.textColor,
          paddingTop: currentSection.paddingTop,
          paddingBottom: currentSection.paddingBottom,
        },
        newData: previousData,
      });

      return { success: true, restoredFrom: input.revisionId };
    }),
});

// ============================================================================
// Export the logRevision helper for use in the existing updateSection procedure
// ============================================================================
export { logRevision };
