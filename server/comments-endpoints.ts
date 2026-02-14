/**
 * Application comments API endpoints
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";

/**
 * Create a new comment on an application
 */
export async function createApplicationComment(
  userId: number,
  applicationId: number,
  content: string,
  isInternal: boolean = false,
  parentCommentId?: number
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationComments, coachApplications, users } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Verify application exists
  const [app] = await db
    .select()
    .from(coachApplications)
    .where(eq(coachApplications.id, applicationId));

  if (!app) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
  }

  // Verify user is admin or applicant
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user || (user.role !== "admin" && app.userId !== userId)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to comment on this application" });
  }

  // Verify parent comment exists if provided
  if (parentCommentId) {
    const [parentComment] = await db
      .select()
      .from(applicationComments)
      .where(eq(applicationComments.id, parentCommentId));

    if (!parentComment) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Parent comment not found" });
    }
  }

  const [comment] = await db
    .insert(applicationComments)
    .values({
      applicationId,
      userId,
      content,
      isInternal,
      parentCommentId: parentCommentId || null,
    })
    .$returningId();

  return comment;
}

/**
 * Get all comments for an application
 */
export async function getApplicationComments(applicationId: number, userId: number, isAdmin: boolean) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationComments, users, coachApplications } = await import("../drizzle/schema");
  const { eq, and, or } = await import("drizzle-orm");

  // Verify user has access to this application
  const [app] = await db
    .select()
    .from(coachApplications)
    .where(eq(coachApplications.id, applicationId));

  if (!app) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
  }

  if (!isAdmin && app.userId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view comments on this application" });
  }

  // Get comments - filter internal comments if not admin
  let comments = await db
    .select({
      id: applicationComments.id,
      applicationId: applicationComments.applicationId,
      userId: applicationComments.userId,
      content: applicationComments.content,
      parentCommentId: applicationComments.parentCommentId,
      isInternal: applicationComments.isInternal,
      createdAt: applicationComments.createdAt,
      updatedAt: applicationComments.updatedAt,
      userName: users.name,
      userRole: users.role,
    })
    .from(applicationComments)
    .innerJoin(users, eq(applicationComments.userId, users.id))
    .where(eq(applicationComments.applicationId, applicationId));

  // Filter internal comments if not admin
  if (!isAdmin) {
    comments = comments.filter((c) => !c.isInternal);
  }

  // Sort by creation date
  comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Build threaded structure
  const threadedComments = buildCommentThreads(comments);

  return threadedComments;
}

/**
 * Update a comment
 */
export async function updateApplicationComment(
  commentId: number,
  userId: number,
  content: string,
  isAdmin: boolean
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationComments } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const [comment] = await db
    .select()
    .from(applicationComments)
    .where(eq(applicationComments.id, commentId));

  if (!comment) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
  }

  // Only comment author or admin can update
  if (comment.userId !== userId && !isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to update this comment" });
  }

  await db
    .update(applicationComments)
    .set({ content, updatedAt: new Date() })
    .where(eq(applicationComments.id, commentId));

  return { success: true };
}

/**
 * Delete a comment
 */
export async function deleteApplicationComment(commentId: number, userId: number, isAdmin: boolean) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationComments } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const [comment] = await db
    .select()
    .from(applicationComments)
    .where(eq(applicationComments.id, commentId));

  if (!comment) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
  }

  // Only comment author or admin can delete
  if (comment.userId !== userId && !isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this comment" });
  }

  await db.delete(applicationComments).where(eq(applicationComments.id, commentId));

  return { success: true };
}

/**
 * Build threaded comment structure
 */
function buildCommentThreads(comments: any[]) {
  const commentMap = new Map();
  const rootComments: any[] = [];

  // Create map of all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Build thread structure
  comments.forEach((comment) => {
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(commentMap.get(comment.id));
      }
    } else {
      rootComments.push(commentMap.get(comment.id));
    }
  });

  return rootComments;
}

/**
 * Get comment count for an application
 */
export async function getApplicationCommentCount(applicationId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { applicationComments } = await import("../drizzle/schema");
  const { eq, count } = await import("drizzle-orm");

  const [result] = await db
    .select({ count: count() })
    .from(applicationComments)
    .where(eq(applicationComments.applicationId, applicationId));

  return result?.count || 0;
}
