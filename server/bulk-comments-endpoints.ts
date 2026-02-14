/**
 * Bulk comments and template management endpoints
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";

/**
 * Create a comment template
 */
export async function createCommentTemplate(
  createdBy: number,
  name: string,
  content: string,
  category: "feedback" | "approval" | "rejection" | "clarification",
  description?: string,
  isPublic: boolean = false
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentTemplates } = await import("../drizzle/schema");

  const [template] = await db
    .insert(commentTemplates)
    .values({
      createdBy,
      name,
      content,
      category,
      description,
      isPublic,
    })
    .$returningId();

  return template;
}

/**
 * Get all comment templates for an admin
 */
export async function getCommentTemplates(adminId: number, includePublic: boolean = true) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentTemplates } = await import("../drizzle/schema");
  const { eq, or, and } = await import("drizzle-orm");

  let templates;
  if (includePublic) {
    templates = await db
      .select()
      .from(commentTemplates)
      .where(
        or(
          eq(commentTemplates.createdBy, adminId),
          and(eq(commentTemplates.isPublic, true), eq(commentTemplates.isArchived, false))
        )
      )
      .orderBy(commentTemplates.category);
  } else {
    templates = await db
      .select()
      .from(commentTemplates)
      .where(eq(commentTemplates.createdBy, adminId))
      .orderBy(commentTemplates.category);
  }

  return templates;
}

/**
 * Apply bulk comments to multiple applications
 */
export async function applyBulkComments(
  applicationIds: number[],
  templateId: number,
  variables?: Record<string, string>,
  isInternal: boolean = false,
  adminId?: number
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentTemplates, applicationComments, coachApplications } = await import("../drizzle/schema");
  const { eq, inArray } = await import("drizzle-orm");

  // Get template
  const [template] = await db.select().from(commentTemplates).where(eq(commentTemplates.id, templateId));

  if (!template) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
  }

  // Verify all applications exist
  const apps = await db
    .select({ id: coachApplications.id })
    .from(coachApplications)
    .where(inArray(coachApplications.id, applicationIds));

  if (apps.length !== applicationIds.length) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Some applications not found" });
  }

  // Process template variables
  let commentContent = template.content;
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      commentContent = commentContent.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
  }

  // Create comments for each application
  const createdComments = [];
  for (const appId of applicationIds) {
    // Get application details for variable substitution
    const [app] = await db.select().from(coachApplications).where(eq(coachApplications.id, appId));

    if (app) {
      let finalContent = commentContent;
      // Replace application-specific variables
      finalContent = finalContent.replace(/{{applicantName}}/g, app.fullName || "");
      finalContent = finalContent.replace(/{{applicationId}}/g, appId.toString());
      finalContent = finalContent.replace(/{{yearsTeaching}}/g, app.yearsTeaching?.toString() || "");

      const [comment] = await db
        .insert(applicationComments)
        .values({
          applicationId: appId,
          userId: adminId || 0,
          content: finalContent,
          isInternal,
        })
        .$returningId();

      createdComments.push(comment);
    }
  }

  // Update template usage
  await db
    .update(commentTemplates)
    .set({
      usageCount: (template.usageCount || 0) + applicationIds.length,
      lastUsedAt: new Date(),
    })
    .where(eq(commentTemplates.id, templateId));

  return { success: true, commentCount: createdComments.length };
}

/**
 * Update comment template
 */
export async function updateCommentTemplate(
  templateId: number,
  adminId: number,
  updates: {
    name?: string;
    content?: string;
    description?: string;
    category?: "feedback" | "approval" | "rejection" | "clarification";
    isPublic?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentTemplates } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  // Verify ownership
  const [template] = await db
    .select()
    .from(commentTemplates)
    .where(and(eq(commentTemplates.id, templateId), eq(commentTemplates.createdBy, adminId)));

  if (!template) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to update this template" });
  }

  await db.update(commentTemplates).set(updates).where(eq(commentTemplates.id, templateId));

  return { success: true };
}

/**
 * Delete comment template
 */
export async function deleteCommentTemplate(templateId: number, adminId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentTemplates } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  // Verify ownership
  const [template] = await db
    .select()
    .from(commentTemplates)
    .where(and(eq(commentTemplates.id, templateId), eq(commentTemplates.createdBy, adminId)));

  if (!template) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this template" });
  }

  await db.delete(commentTemplates).where(eq(commentTemplates.id, templateId));

  return { success: true };
}

/**
 * Get template suggestions based on category and past usage
 */
export async function getTemplateSuggestions(
  adminId: number,
  category?: "feedback" | "approval" | "rejection" | "clarification"
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentTemplates } = await import("../drizzle/schema");
  const { eq, or, and, desc, isNotNull } = await import("drizzle-orm");

  const templates = await db
    .select()
    .from(commentTemplates)
    .where(
      and(
        or(
          eq(commentTemplates.createdBy, adminId),
          and(eq(commentTemplates.isPublic, true), eq(commentTemplates.isArchived, false))
        ),
        category ? eq(commentTemplates.category, category) : undefined
      )
    )
    .orderBy(desc(commentTemplates.usageCount))
    .limit(10);

  return templates;
}

/**
 * Archive template
 */
export async function archiveCommentTemplate(templateId: number, adminId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentTemplates } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  // Verify ownership
  const [template] = await db
    .select()
    .from(commentTemplates)
    .where(and(eq(commentTemplates.id, templateId), eq(commentTemplates.createdBy, adminId)));

  if (!template) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to archive this template" });
  }

  await db
    .update(commentTemplates)
    .set({ isArchived: true })
    .where(eq(commentTemplates.id, templateId));

  return { success: true };
}
