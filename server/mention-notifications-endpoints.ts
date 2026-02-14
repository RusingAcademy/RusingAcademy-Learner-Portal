/**
 * Comment mentions and notification system
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { sendEmail } from "./email";

/**
 * Parse mentions from comment content
 * Extracts @username patterns and validates users exist
 */
export async function parseMentions(content: string): Promise<{ userId: number; username: string }[]> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { users } = await import("../drizzle/schema");
  const { ilike } = await import("drizzle-orm");

  // Extract @mentions using regex
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
  const matches = Array.from(content.matchAll(mentionRegex));
  const mentionedUsernames = new Set<string>();

  matches.forEach((match) => {
    mentionedUsernames.add(match[1]);
  });

  // Find users matching mentioned usernames
  const mentionedUsers: { userId: number; username: string }[] = [];
  const usernameArray = Array.from(mentionedUsernames);
  for (const username of usernameArray) {
    const [user] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(ilike(users.name, `%${username}%`))
      .limit(1);

    if (user && user.name) {
      mentionedUsers.push({ userId: user.id, username: user.name });
    }
  }

  return mentionedUsers;
}

/**
 * Create mention records and send notifications
 */
export async function createMentionNotifications(
  commentId: number,
  mentionedUserIds: number[],
  applicantName: string,
  applicantEmail: string,
  language: "en" | "fr" = "en"
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentMentions, applicationComments, users } = await import("../drizzle/schema");
  const { eq, inArray } = await import("drizzle-orm");

  // Get comment details
  const [comment] = await db.select().from(applicationComments).where(eq(applicationComments.id, commentId));

  if (!comment) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
  }

  // Get mentioned users
  const mentionedUsers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(inArray(users.id, mentionedUserIds));

  // Create mention records
  const createdMentions = [];
  for (const user of mentionedUsers) {
    const [mention] = await db
      .insert(commentMentions)
      .values({
        commentId,
        mentionedUserId: user.id,
      })
      .$returningId();

    createdMentions.push(mention);

    // Send notification email
    if (user.email) {
      await sendMentionNotificationEmail(
        user.email,
        user.name || "Admin",
        applicantName,
        comment.content,
        language
      );
    }
  }

  // Mark mentions as notified
  if (createdMentions.length > 0) {
    await db
      .update(commentMentions)
      .set({ notificationSent: true, notificationSentAt: new Date() })
      .where(inArray(commentMentions.id, createdMentions as any));
  }

  return { mentionCount: createdMentions.length };
}

/**
 * Send mention notification email
 */
async function sendMentionNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  applicantName: string,
  commentContent: string,
  language: "en" | "fr" = "en"
) {
  const isEn = language === "en";

  const subject = isEn
    ? `You were mentioned in a comment about ${applicantName}'s application`
    : `Vous avez été mentionné dans un commentaire sur la candidature de ${applicantName}`;

  const html = isEn
    ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5a5 0%, #14b8a6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .mention-box { background: white; border-left: 4px solid #0ea5a5; padding: 16px; border-radius: 4px; margin: 16px 0; }
    .comment-text { font-style: italic; color: #6b7280; }
    .cta-button { display: inline-block; background: #0ea5a5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👋 You Were Mentioned</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName},</p>
      
      <p>You were mentioned in a comment about <strong>${applicantName}'s</strong> application.</p>
      
      <div class="mention-box">
        <p class="comment-text">"${commentContent.substring(0, 200)}${commentContent.length > 200 ? "..." : ""}"</p>
      </div>
      
      <p>Please review the full comment and respond if needed.</p>
      
      <a href="#" class="cta-button">View Application</a>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">© 2026 Lingueefy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
    : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5a5 0%, #14b8a6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .mention-box { background: white; border-left: 4px solid #0ea5a5; padding: 16px; border-radius: 4px; margin: 16px 0; }
    .comment-text { font-style: italic; color: #6b7280; }
    .cta-button { display: inline-block; background: #0ea5a5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👋 Vous avez été mentionné</h1>
    </div>
    <div class="content">
      <p>Bonjour ${recipientName},</p>
      
      <p>Vous avez été mentionné dans un commentaire sur la candidature de <strong>${applicantName}</strong>.</p>
      
      <div class="mention-box">
        <p class="comment-text">"${commentContent.substring(0, 200)}${commentContent.length > 200 ? "..." : ""}"</p>
      </div>
      
      <p>Veuillez consulter le commentaire complet et répondre si nécessaire.</p>
      
      <a href="#" class="cta-button">Afficher la candidature</a>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">© 2026 Lingueefy. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `;

  try {
    await sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send mention notification:", error);
  }
}

/**
 * Get all mentions for a user
 */
export async function getUserMentions(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentMentions, applicationComments, coachApplications, users } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  const mentions = await db
    .select({
      mentionId: commentMentions.id,
      commentId: applicationComments.id,
      commentContent: applicationComments.content,
      applicationId: coachApplications.id,
      applicantName: coachApplications.fullName,
      mentionedAt: commentMentions.createdAt,
      mentionedBy: users.name,
    })
    .from(commentMentions)
    .innerJoin(applicationComments, eq(commentMentions.commentId, applicationComments.id))
    .innerJoin(coachApplications, eq(applicationComments.applicationId, coachApplications.id))
    .innerJoin(users, eq(applicationComments.userId, users.id))
    .where(
      and(
        eq(commentMentions.mentionedUserId, userId),
        unreadOnly ? eq(commentMentions.notificationSent, false) : undefined
      )
    );

  return mentions;
}

/**
 * Mark mention as read
 */
export async function markMentionAsRead(mentionId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { commentMentions } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  await db
    .update(commentMentions)
    .set({ notificationSent: true })
    .where(eq(commentMentions.id, mentionId));

  return { success: true };
}

/**
 * Get mention autocomplete suggestions
 */
export async function getMentionSuggestions(queryStr: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { users } = await import("../drizzle/schema");
  const { ilike } = await import("drizzle-orm");

  const suggestions = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(ilike(users.name, `%${queryStr}%`));

  return suggestions.slice(0, 10);


}
