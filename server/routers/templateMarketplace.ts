/**
 * Template Marketplace Router
 * 
 * Manages reusable section templates for the Visual Editor.
 * Categories: Hero, CTA, Testimonials, Features, Course Promo, Government Training, etc.
 * Supports bilingual FR/EN and brand-specific templates (RusingÂcademy, Lingueefy, Barholex).
 */
import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { getDb } from "../db";

const CATEGORIES = [
  "hero", "cta", "testimonials", "features", "course_promo",
  "government_training", "team", "pricing", "faq", "newsletter",
  "contact", "content", "gallery", "stats", "divider", "custom",
] as const;

const LANGUAGES = ["en", "fr", "bilingual"] as const;
const BRANDS = ["rusingacademy", "lingueefy", "barholex", "universal"] as const;

export const templateMarketplaceRouter = router({
  // List all templates with optional filters
  list: adminProcedure
    .input(z.object({
      category: z.enum(CATEGORIES).optional(),
      sectionType: z.string().optional(),
      language: z.enum(LANGUAGES).optional(),
      brand: z.enum(BRANDS).optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Build dynamic query using sql template literals for proper parameterization
      const conditions: ReturnType<typeof sql>[] = [];

      if (input?.category) {
        conditions.push(sql`category = ${input.category}`);
      }
      if (input?.sectionType) {
        conditions.push(sql`sectionType = ${input.sectionType}`);
      }
      if (input?.language) {
        conditions.push(sql`(language = ${input.language} OR language = 'bilingual')`);
      }
      if (input?.brand) {
        conditions.push(sql`(brand = ${input.brand} OR brand = 'universal')`);
      }
      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(sql`(name LIKE ${searchTerm} OR description LIKE ${searchTerm} OR tags LIKE ${searchTerm})`);
      }

      let query;
      if (conditions.length === 0) {
        query = sql`SELECT * FROM cms_section_templates ORDER BY isDefault DESC, usageCount DESC, name ASC`;
      } else {
        // Chain conditions with AND
        let whereClause = conditions[0];
        for (let i = 1; i < conditions.length; i++) {
          whereClause = sql`${whereClause} AND ${conditions[i]}`;
        }
        query = sql`SELECT * FROM cms_section_templates WHERE ${whereClause} ORDER BY isDefault DESC, usageCount DESC, name ASC`;
      }

      const [rows] = await db.execute(query);
      return (rows as any[]).map(r => ({
        ...r,
        config: typeof r.config === "string" ? JSON.parse(r.config) : r.config,
      }));
    }),

  // Get a single template by ID
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [rows] = await db.execute(
        sql`SELECT * FROM cms_section_templates WHERE id = ${input.id} LIMIT 1`
      );
      const template = (rows as any[])[0];
      if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      return {
        ...template,
        config: typeof template.config === "string" ? JSON.parse(template.config) : template.config,
      };
    }),

  // Create a new template
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(CATEGORIES),
      sectionType: z.string(),
      config: z.any(),
      thumbnail: z.string().optional(),
      tags: z.string().optional(),
      language: z.enum(LANGUAGES).default("bilingual"),
      brand: z.enum(BRANDS).default("universal"),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const configStr = JSON.stringify(input.config);
      await db.execute(
        sql`INSERT INTO cms_section_templates (name, description, category, sectionType, config, thumbnail, tags, language, brand, isDefault, createdBy)
            VALUES (${input.name}, ${input.description ?? null}, ${input.category}, ${input.sectionType}, ${configStr}, ${input.thumbnail ?? null}, ${input.tags ?? null}, ${input.language}, ${input.brand}, ${input.isDefault}, ${ctx.user?.name ?? "admin"})`
      );
      return { success: true };
    }),

  // Save an existing section as a template
  saveFromSection: adminProcedure
    .input(z.object({
      sectionId: z.number(),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(CATEGORIES),
      language: z.enum(LANGUAGES).default("bilingual"),
      brand: z.enum(BRANDS).default("universal"),
      tags: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Fetch the section data
      const [rows] = await db.execute(
        sql`SELECT * FROM cms_page_sections WHERE id = ${input.sectionId} LIMIT 1`
      );
      const section = (rows as any[])[0];
      if (!section) throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });

      const config = {
        title: section.title,
        subtitle: section.subtitle,
        content: typeof section.content === "string" ? JSON.parse(section.content) : section.content,
        backgroundColor: section.backgroundColor,
        textColor: section.textColor,
        paddingTop: section.paddingTop,
        paddingBottom: section.paddingBottom,
      };

      await db.execute(
        sql`INSERT INTO cms_section_templates (name, description, category, sectionType, config, tags, language, brand, isDefault, createdBy)
            VALUES (${input.name}, ${input.description ?? null}, ${input.category}, ${section.sectionType}, ${JSON.stringify(config)}, ${input.tags ?? null}, ${input.language}, ${input.brand}, ${false}, ${ctx.user?.name ?? "admin"})`
      );
      return { success: true };
    }),

  // Update a template
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      category: z.enum(CATEGORIES).optional(),
      config: z.any().optional(),
      thumbnail: z.string().optional(),
      tags: z.string().optional(),
      language: z.enum(LANGUAGES).optional(),
      brand: z.enum(BRANDS).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (input.name !== undefined) await db.execute(sql`UPDATE cms_section_templates SET name = ${input.name} WHERE id = ${input.id}`);
      if (input.description !== undefined) await db.execute(sql`UPDATE cms_section_templates SET description = ${input.description} WHERE id = ${input.id}`);
      if (input.category !== undefined) await db.execute(sql`UPDATE cms_section_templates SET category = ${input.category} WHERE id = ${input.id}`);
      if (input.config !== undefined) await db.execute(sql`UPDATE cms_section_templates SET config = ${JSON.stringify(input.config)} WHERE id = ${input.id}`);
      if (input.thumbnail !== undefined) await db.execute(sql`UPDATE cms_section_templates SET thumbnail = ${input.thumbnail} WHERE id = ${input.id}`);
      if (input.tags !== undefined) await db.execute(sql`UPDATE cms_section_templates SET tags = ${input.tags} WHERE id = ${input.id}`);
      if (input.language !== undefined) await db.execute(sql`UPDATE cms_section_templates SET language = ${input.language} WHERE id = ${input.id}`);
      if (input.brand !== undefined) await db.execute(sql`UPDATE cms_section_templates SET brand = ${input.brand} WHERE id = ${input.id}`);

      return { success: true };
    }),

  // Delete a template (only custom ones, not defaults)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [rows] = await db.execute(
        sql`SELECT isDefault FROM cms_section_templates WHERE id = ${input.id} LIMIT 1`
      );
      const template = (rows as any[])[0];
      if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      if (template.isDefault) throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete default templates" });

      await db.execute(sql`DELETE FROM cms_section_templates WHERE id = ${input.id}`);
      return { success: true };
    }),

  // Use a template: insert it as a new section on a page
  useTemplate: adminProcedure
    .input(z.object({
      templateId: z.number(),
      pageId: z.number(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Fetch template
      const [rows] = await db.execute(
        sql`SELECT * FROM cms_section_templates WHERE id = ${input.templateId} LIMIT 1`
      );
      const template = (rows as any[])[0];
      if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });

      const config = typeof template.config === "string" ? JSON.parse(template.config) : template.config;

      // Insert section from template
      const contentStr = config.content ? JSON.stringify(config.content) : null;
      await db.execute(
        sql`INSERT INTO cms_page_sections (pageId, sectionType, title, subtitle, content, backgroundColor, textColor, paddingTop, paddingBottom, sortOrder)
            VALUES (${input.pageId}, ${template.sectionType}, ${config.title ?? null}, ${config.subtitle ?? null}, ${contentStr}, ${config.backgroundColor ?? null}, ${config.textColor ?? null}, ${config.paddingTop ?? 48}, ${config.paddingBottom ?? 48}, ${input.sortOrder})`
      );

      // Increment usage count
      await db.execute(
        sql`UPDATE cms_section_templates SET usageCount = usageCount + 1 WHERE id = ${input.templateId}`
      );

      return { success: true };
    }),

  // Get category counts for the sidebar
  categoryCounts: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [rows] = await db.execute(
        sql`SELECT category, COUNT(*) as count FROM cms_section_templates GROUP BY category ORDER BY category`
      );
      return rows as { category: string; count: number }[];
    }),
});
