import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

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
// Schema types for structured data
// ============================================================================
const schemaTypeEnum = z.enum(["Article", "Course", "Organization", "WebPage", "FAQPage", "Service"]);
const twitterCardEnum = z.enum(["summary", "summary_large_image"]);

// ============================================================================
// SEO Editor Router
// ============================================================================
export const seoEditorRouter = router({
  // Get SEO data for a page
  getSeo: adminProcedure
    .input(z.object({ pageId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [page] = await db.execute(
        sql`SELECT id, title, slug, meta_title, meta_description, og_image, canonical_url,
                   schema_type, og_title, og_description, twitter_card, no_index, structured_data
            FROM cms_pages WHERE id = ${input.pageId}`
      );
      if (!page) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      }
      const row = page as any;
      return {
        pageId: row.id,
        pageTitle: row.title,
        pageSlug: row.slug,
        metaTitle: row.meta_title || "",
        metaDescription: row.meta_description || "",
        ogImage: row.og_image || "",
        canonicalUrl: row.canonical_url || "",
        schemaType: row.schema_type || "WebPage",
        ogTitle: row.og_title || "",
        ogDescription: row.og_description || "",
        twitterCard: row.twitter_card || "summary_large_image",
        noIndex: row.no_index ? true : false,
        structuredData: row.structured_data ? (typeof row.structured_data === "string" ? JSON.parse(row.structured_data) : row.structured_data) : null,
      };
    }),

  // Update SEO data for a page
  updateSeo: adminProcedure
    .input(
      z.object({
        pageId: z.number(),
        metaTitle: z.string().max(120).optional(),
        metaDescription: z.string().max(320).optional(),
        ogImage: z.string().max(500).optional(),
        canonicalUrl: z.string().max(500).optional(),
        schemaType: schemaTypeEnum.optional(),
        ogTitle: z.string().max(120).optional(),
        ogDescription: z.string().max(320).optional(),
        twitterCard: twitterCardEnum.optional(),
        noIndex: z.boolean().optional(),
        structuredData: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      await db.execute(
        sql`UPDATE cms_pages SET 
          meta_title = ${input.metaTitle ?? null},
          meta_description = ${input.metaDescription ?? null},
          og_image = ${input.ogImage ?? null},
          canonical_url = ${input.canonicalUrl ?? null},
          schema_type = ${input.schemaType ?? "WebPage"},
          og_title = ${input.ogTitle ?? null},
          og_description = ${input.ogDescription ?? null},
          twitter_card = ${input.twitterCard ?? "summary_large_image"},
          no_index = ${input.noIndex ? 1 : 0},
          structured_data = ${input.structuredData ? JSON.stringify(input.structuredData) : null},
          updated_at = NOW()
        WHERE id = ${input.pageId}`
      );

      return { success: true };
    }),

  // Generate structured data based on schema type and page content
  generateStructuredData: adminProcedure
    .input(
      z.object({
        pageId: z.number(),
        schemaType: schemaTypeEnum,
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [page] = await db.execute(
        sql`SELECT id, title, slug, meta_title, meta_description, og_image, status
            FROM cms_pages WHERE id = ${input.pageId}`
      );
      if (!page) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      }
      const row = page as any;

      // Get sections for content
      const sections = await db.execute(
        sql`SELECT section_type, title, subtitle, content FROM cms_page_sections 
            WHERE page_id = ${input.pageId} AND is_visible = 1 ORDER BY sort_order ASC`
      );

      const baseUrl = "https://www.rusingacademy.ca";
      const pageUrl = `${baseUrl}/${row.slug}`;

      let structuredData: any;

      switch (input.schemaType) {
        case "Course":
          structuredData = {
            "@context": "https://schema.org",
            "@type": "Course",
            name: row.meta_title || row.title,
            description: row.meta_description || "",
            url: pageUrl,
            provider: {
              "@type": "Organization",
              name: "RusingÂcademy",
              url: baseUrl,
            },
            inLanguage: ["en", "fr"],
            availableLanguage: [
              { "@type": "Language", name: "English", alternateName: "en" },
              { "@type": "Language", name: "French", alternateName: "fr" },
            ],
          };
          break;

        case "Organization":
          structuredData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "RusingÂcademy",
            alternateName: "Rusinga International Consulting Ltd.",
            url: baseUrl,
            logo: row.og_image || "",
            description: row.meta_description || "Bilingual Excellence for Canadian Public Servants",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              availableLanguage: ["English", "French"],
            },
          };
          break;

        case "FAQPage": {
          const faqSections = (sections as any[]).filter(
            (s: any) => s.section_type === "faq"
          );
          const faqItems: any[] = [];
          for (const faq of faqSections) {
            try {
              const content = typeof faq.content === "string" ? JSON.parse(faq.content) : faq.content;
              if (Array.isArray(content)) {
                for (const item of content) {
                  if (item.question && item.answer) {
                    faqItems.push({
                      "@type": "Question",
                      name: item.question,
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: item.answer,
                      },
                    });
                  }
                }
              }
            } catch {}
          }
          structuredData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems,
          };
          break;
        }

        case "Service":
          structuredData = {
            "@context": "https://schema.org",
            "@type": "Service",
            name: row.meta_title || row.title,
            description: row.meta_description || "",
            url: pageUrl,
            provider: {
              "@type": "Organization",
              name: "RusingÂcademy",
              url: baseUrl,
            },
            areaServed: {
              "@type": "Country",
              name: "Canada",
            },
            availableLanguage: ["English", "French"],
          };
          break;

        case "Article":
          structuredData = {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: row.meta_title || row.title,
            description: row.meta_description || "",
            url: pageUrl,
            image: row.og_image || "",
            author: {
              "@type": "Organization",
              name: "RusingÂcademy",
            },
            publisher: {
              "@type": "Organization",
              name: "RusingÂcademy",
              url: baseUrl,
            },
            inLanguage: "en",
          };
          break;

        default: // WebPage
          structuredData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: row.meta_title || row.title,
            description: row.meta_description || "",
            url: pageUrl,
            inLanguage: ["en", "fr"],
            isPartOf: {
              "@type": "WebSite",
              name: "RusingÂcademy",
              url: baseUrl,
            },
          };
      }

      // Save the generated structured data
      await db.execute(
        sql`UPDATE cms_pages SET structured_data = ${JSON.stringify(structuredData)}, schema_type = ${input.schemaType}, updated_at = NOW() WHERE id = ${input.pageId}`
      );

      return { structuredData };
    }),

  // Get SEO data for public rendering (no auth required)
  getPublicSeo: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [page] = await db.execute(
        sql`SELECT meta_title, meta_description, og_image, canonical_url, schema_type,
                   og_title, og_description, twitter_card, no_index, structured_data, title, slug
            FROM cms_pages WHERE slug = ${input.slug} AND status = 'published'`
      );
      if (!page) return null;
      const row = page as any;
      return {
        metaTitle: row.meta_title || row.title,
        metaDescription: row.meta_description || "",
        ogImage: row.og_image || "",
        canonicalUrl: row.canonical_url || "",
        ogTitle: row.og_title || row.meta_title || row.title,
        ogDescription: row.og_description || row.meta_description || "",
        twitterCard: row.twitter_card || "summary_large_image",
        noIndex: row.no_index ? true : false,
        structuredData: row.structured_data
          ? typeof row.structured_data === "string"
            ? JSON.parse(row.structured_data)
            : row.structured_data
          : null,
      };
    }),
});
