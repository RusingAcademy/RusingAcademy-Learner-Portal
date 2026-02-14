/**
 * Resubmission workflow API endpoints
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { sendEmail } from "./email";
import {
  getRejectionWithResubmissionTemplate,
  getResubmissionConfirmationTemplate,
} from "./email-resubmission-templates";

/**
 * Send rejection email with resubmission link
 */
export async function sendRejectionWithResubmissionEmail(
  applicantName: string,
  applicantEmail: string,
  rejectionReason: string,
  resubmissionLink: string,
  language: "en" | "fr"
) {
  try {
    const template = getRejectionWithResubmissionTemplate({
      applicantName,
      applicantEmail,
      rejectionReason,
      resubmissionLink,
      language,
    });

    await sendEmail({
      to: applicantEmail,
      subject: template.subject,
      html: template.html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send rejection email:", error);
    throw error;
  }
}

/**
 * Send resubmission confirmation email
 */
export async function sendResubmissionConfirmationEmail(
  applicantName: string,
  applicantEmail: string,
  language: "en" | "fr"
) {
  try {
    const template = getResubmissionConfirmationTemplate({
      applicantName,
      applicantEmail,
      language,
    });

    await sendEmail({
      to: applicantEmail,
      subject: template.subject,
      html: template.html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send resubmission confirmation email:", error);
    throw error;
  }
}

/**
 * Get resubmission data for a rejected application
 */
export async function getResubmissionData(applicationId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const [application] = await db
    .select()
    .from(coachApplications)
    .where(eq(coachApplications.id, applicationId));

  if (!application) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
  }

  if (application.status !== "rejected") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only rejected applications can be resubmitted",
    });
  }

  return {
    applicationId: application.id,
    previousRejectionReason: application.reviewNotes || application.previousRejectionReason,
    resubmissionCount: application.resubmissionCount || 0,
    canResubmit: (application.resubmissionCount || 0) < 3, // Max 3 resubmissions
  };
}

/**
 * Create a resubmission of an application
 */
export async function createResubmission(
  userId: number,
  parentApplicationId: number,
  updatedData: Record<string, any>
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications, users } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Get the parent application
  const [parentApp] = await db
    .select()
    .from(coachApplications)
    .where(eq(coachApplications.id, parentApplicationId));

  if (!parentApp) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Parent application not found" });
  }

  if (parentApp.userId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Cannot resubmit another user's application" });
  }

  if (parentApp.status !== "rejected") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only rejected applications can be resubmitted",
    });
  }

  const resubmissionCount = (parentApp.resubmissionCount || 0) + 1;
  if (resubmissionCount > 3) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Maximum number of resubmissions (3) has been reached",
    });
  }

  // Create new application record for resubmission
  // Merge parent application data with updates
  const newAppData = {
    ...parentApp,
    ...updatedData,
    status: "submitted",
    isResubmission: true,
    parentApplicationId,
    resubmissionCount: 0,
    previousRejectionReason: parentApp.reviewNotes || parentApp.previousRejectionReason,
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
  };
  
  const result = await db.insert(coachApplications).values(newAppData as any);
  const newApp = result[0];

  // Update parent application with resubmission count
  await db
    .update(coachApplications)
    .set({
      resubmissionCount,
      lastResubmittedAt: new Date(),
    })
    .where(eq(coachApplications.id, parentApplicationId));

  // Send resubmission confirmation email
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (user?.email) {
    await sendResubmissionConfirmationEmail(
      parentApp.fullName,
      parentApp.email,
      user.preferredLanguage || "en"
    );
  }

  return newApp?.insertId || parentApplicationId;
}

/**
 * Get resubmission history for an application
 */
export async function getResubmissionHistory(applicationId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { coachApplications } = await import("../drizzle/schema");
  const { eq, or } = await import("drizzle-orm");

  // Get the original application and all resubmissions
  const applications = await db
    .select()
    .from(coachApplications)
    .where(
      or(
        eq(coachApplications.id, applicationId),
        eq(coachApplications.parentApplicationId, applicationId)
      )
    )
    .orderBy(coachApplications.createdAt);

  return applications.map((app) => ({
    id: app.id,
    status: app.status,
    submittedAt: app.createdAt,
    reviewedAt: app.reviewedAt,
    reviewNotes: app.reviewNotes,
    isResubmission: app.isResubmission,
    resubmissionNumber: app.isResubmission ? (app.resubmissionCount || 0) : 0,
  }));
}
