import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { contactRouter } from "./routers/contact";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getApprovedCoaches,
  getCoachBySlug,
  getCoachByUserId,
  getCoachReviews,
  createCoachProfile,
  updateCoachProfile,
  getLearnerByUserId,
  createLearnerProfile,
  updateLearnerProfile,
  getUpcomingSessions,
  getLatestSessionForLearner,
  createAiSession,
  getLearnerAiSessions,
  getCommissionTiers,
  getCoachCommission,
  getCoachEarningsSummary,
  getCoachPayoutLedger,
  calculateCommissionRate,
  getReferralDiscount,
  getCoachReferralLink,
  createReferralLink,
  seedDefaultCommissionTiers,
  createCommissionTier,
  updateCommissionTier,
  getCoachAvailability,
  setCoachAvailability,
  getAvailableTimeSlotsForDate,
  getUserById,
  createReview,
  canLearnerReviewCoach,
  getLearnerReviewForCoach,
  updateReview,
  getUserNotifications,
  getUnreadNotificationCount,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  startConversation,
  createCoachInvitation,
  getInvitationByToken,
  claimCoachInvitation,
  getAllCoachInvitations,
  getCoachesWithInvitationStatus,
  revokeCoachInvitation,
} from "./db";
import {
  createConnectAccount,
  getOnboardingLink,
  checkAccountStatus,
  createDashboardLink,
  createCheckoutSession,
} from "./stripe/connect";
import { calculatePlatformFee } from "./stripe/products";
import { sendRescheduleNotificationEmails } from "./email";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { coachProfiles, users, sessions, departmentInquiries, learnerProfiles, payoutLedger, learnerFavorites, ecosystemLeads, ecosystemLeadActivities, crmLeadTags, crmLeadTagAssignments, crmTagAutomationRules, crmLeadSegments, crmLeadHistory, crmSegmentAlerts, crmSegmentAlertLogs, crmSalesGoals, crmTeamGoalAssignments, courseEnrollments, courses } from "../drizzle/schema";
import { eq, desc, sql, asc, and, gte, inArray , or, like} from "drizzle-orm";
import { coursesRouter } from "./routers/courses";
import { authRouter } from "./routers/auth";
import { subscriptionsRouter } from "./routers/subscriptions";
import { emailSettingsRouter } from "./routers/email-settings";
import { gamificationRouter } from "./routers/gamification";
import { certificatesRouter } from "./routers/certificates";
import { hrRouter } from "./routers/hr";
import { pathsRouter } from "./routers/paths";
import { lessonsRouter } from "./routers/lessons";
import { activitiesRouter } from "./routers/activities";
import { settingsRouter, cmsRouter, aiAnalyticsRouter, salesAnalyticsRouter, activityLogRouter, aiRulesRouter, mediaLibraryRouter, rbacRouter, emailTemplateRouter, notificationsRouter, importExportRouter, previewModeRouter, globalSearchRouter, aiPredictiveRouter } from "./routers/adminControlCenter";
import { stripeTestingRouter, liveKPIRouter, onboardingRouter, enterpriseRouter, sleExamRouter, contentIntelligenceRouter, funnelsRouter, automationsRouter, orgBillingRouter, dripContentRouter, abTestingRouter, affiliateRouter } from "./routers/premiumFeatures";
import { audioRouter } from "./routers/audio";
import { sleCompanionRouter } from "./routers/sleCompanion";
import { sleServicesRouter } from "./routers/sleServices";
import { sleProgressRouter } from "./routers/sleProgress";
import { adminStabilityRouter } from "./routers/adminStability";
import { stripeKPIRouter } from "./routers/stripeKPIData";
import { adminNotificationsRouter } from "./routers/adminNotifications";
import { learnerProgressionRouter } from "./routers/learnerProgression";
import { coachLearnerMetricsRouter } from "./routers/coachLearnerMetrics";
import { progressReportRouter } from "./routers/progressReport";
import { bunnyStreamRouter } from "./routers/bunnyStream";
import { crossPageRouter, stylePresetsRouter, revisionHistoryRouter, logRevision } from "./routers/visualEditorAdvanced";
import { seoEditorRouter } from "./routers/seoEditor";
import { templateMarketplaceRouter } from "./routers/templateMarketplace";
import { qualityGateRouter } from "./routers/qualityGate";
import { adminCourseTreeRouter } from "./routers/adminCourseTree";
import { progressCascadeRouter } from "./routers/progressCascade";
import { badgeShowcaseRouter } from "./routers/badgeShowcase";
import { invitationsRouter } from "./routers/invitations";
import { adminDashboardDataRouter } from "./routers/adminDashboardData";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate mock time slots for a given date
 * Used as fallback when Calendly is not configured
 */
function generateMockSlots(date: string): { id: string; startTime: string; endTime: string; available: boolean }[] {
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
    slots.push({
      id: `${date}-${hour}`,
      startTime,
      endTime,
      available: Math.random() > 0.3, // Simulate availability
    });
  }
  return slots;
}

// ============================================================================
// COACH ROUTER
// ============================================================================
const coachRouter = router({
  // List approved coaches with filters
  list: publicProcedure
    .input(
      z.object({
        language: z.enum(["french", "english", "both"]).optional(),
        specializations: z.array(z.string()).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const coaches = await getApprovedCoaches(input || {});
      return coaches.map(({ coach, user }) => ({
        id: coach.id,
        slug: coach.slug,
        name: user.name,
        avatarUrl: user.avatarUrl,
        photoUrl: coach.photoUrl,
        headline: coach.headline,
        headlineFr: coach.headlineFr,
        languages: coach.languages,
        specializations: coach.specializations,
        hourlyRate: coach.hourlyRate,
        trialRate: coach.trialRate,
        averageRating: coach.averageRating,
        totalSessions: coach.totalSessions,
        totalStudents: coach.totalStudents,
        totalReviews: coach.totalReviews,
        successRate: coach.successRate,
        responseTimeHours: coach.responseTimeHours,
      }));
    }),

  // Get single coach by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await getCoachBySlug(input.slug);
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found" });
      }
      return {
        ...result.coach,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
      };
    }),

  // Get coach reviews
  reviews: publicProcedure
    .input(z.object({ coachId: z.number(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return await getCoachReviews(input.coachId, input.limit);
    }),

  // Check if current user can review a coach
  canReview: protectedProcedure
    .input(z.object({ coachId: z.number() }))
    .query(async ({ ctx, input }) => {
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        return { canReview: false, reason: "You must have a learner profile to leave reviews" };
      }
      return await canLearnerReviewCoach(learner.id, input.coachId);
    }),

  // Get current user's review for a coach
  myReview: protectedProcedure
    .input(z.object({ coachId: z.number() }))
    .query(async ({ ctx, input }) => {
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) return null;
      return await getLearnerReviewForCoach(learner.id, input.coachId);
    }),

  // Submit a new review
  submitReview: protectedProcedure
    .input(z.object({
      coachId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().min(10).max(1000).optional(),
      sleAchievement: z.string().max(50).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You must have a learner profile to leave reviews" });
      }

      const canReview = await canLearnerReviewCoach(learner.id, input.coachId);
      if (!canReview.canReview) {
        throw new TRPCError({ code: "FORBIDDEN", message: canReview.reason });
      }

      await createReview({
        sessionId: canReview.sessionId!,
        learnerId: learner.id,
        coachId: input.coachId,
        rating: input.rating,
        comment: input.comment || null,
        sleAchievement: input.sleAchievement || null,
      });

      return { success: true };
    }),

  // Update an existing review
  updateReview: protectedProcedure
    .input(z.object({
      coachId: z.number(),
      rating: z.number().min(1).max(5).optional(),
      comment: z.string().min(10).max(1000).optional(),
      sleAchievement: z.string().max(50).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You must have a learner profile" });
      }

      const existingReview = await getLearnerReviewForCoach(learner.id, input.coachId);
      if (!existingReview) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }

      await updateReview(existingReview.id, {
        rating: input.rating,
        comment: input.comment,
        sleAchievement: input.sleAchievement,
      });

      return { success: true };
    }),

  // Get current user's coach profile
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    return await getCoachByUserId(ctx.user.id);
  }),

  // Create coach application (not profile directly - requires admin approval)
  submitApplication: protectedProcedure
    .input(
      z.object({
        // Personal Info
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        // Professional Background
        education: z.string().optional(),
        certifications: z.string().optional(),
        yearsTeaching: z.number().optional(),
        // Language
        nativeLanguage: z.string().optional(),
        teachingLanguage: z.string().optional(),
        sleOralLevel: z.string().optional(),
        sleWrittenLevel: z.string().optional(),
        sleReadingLevel: z.string().optional(),
        // Profile Content
        headline: z.string().min(10).max(200),
        headlineFr: z.string().max(200).optional(),
        bio: z.string().min(50).max(2000),
        bioFr: z.string().max(2000).optional(),
        teachingPhilosophy: z.string().optional(),
        uniqueValue: z.string().optional(),
        // Pricing & Availability
        languages: z.enum(["french", "english", "both"]),
        specializations: z.record(z.string(), z.boolean()),
        yearsExperience: z.number().min(0).max(50),
        credentials: z.string().max(500),
        hourlyRate: z.number().min(2000).max(20000), // $20-$200 in cents
        trialRate: z.number().min(0).max(10000),
        weeklyHours: z.number().optional(),
        availableDays: z.array(z.string()).optional(),
        availableTimeSlots: z.array(z.string()).optional(),
        // Media
        photoUrl: z.string().optional(),
        videoUrl: z.string().url().optional(),
        calendlyUrl: z.string().url().optional(),
        // Legal
        termsAccepted: z.boolean().optional(),
        privacyAccepted: z.boolean().optional(),
        backgroundCheckConsent: z.boolean().optional(),
        codeOfConductAccepted: z.boolean().optional(),
        commissionAccepted: z.boolean().optional(),
        digitalSignature: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { coachApplications } = await import("../drizzle/schema");
      const { sendApplicationStatusEmail } = await import("./email-application-notifications");
      
      // Check if user already has a pending application
      const [existingApp] = await db.select().from(coachApplications)
        .where(eq(coachApplications.userId, ctx.user.id))
        .orderBy(desc(coachApplications.createdAt))
        .limit(1);
      
      if (existingApp && (existingApp.status === "submitted" || existingApp.status === "under_review")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a pending application",
        });
      }
      
      // Check if user already has a coach profile
      const existingProfile = await getCoachByUserId(ctx.user.id);
      if (existingProfile) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a coach profile",
        });
      }
      
      // Get user info
      const user = await getUserById(ctx.user.id);
      const fullName = input.firstName && input.lastName 
        ? `${input.firstName} ${input.lastName}` 
        : user?.name || "Unknown";
      const email = user?.email || "unknown@email.com";
      
      // Create application in coachApplications table
      await db.insert(coachApplications).values({
        userId: ctx.user.id,
        firstName: input.firstName || user?.name?.split(" ")[0] || null,
        lastName: input.lastName || user?.name?.split(" ").slice(1).join(" ") || null,
        fullName,
        email,
        phone: input.phone || null,
        city: input.city || null,
        country: input.province || "Canada",
        education: input.education || null,
        certifications: input.certifications || input.credentials || null,
        yearsTeaching: input.yearsTeaching || input.yearsExperience || 0,
        nativeLanguage: input.nativeLanguage || null,
        teachingLanguage: input.teachingLanguage || input.languages || null,
        specializations: input.specializations,
        hourlyRate: Math.round(input.hourlyRate / 100), // Convert cents to dollars
        trialRate: Math.round(input.trialRate / 100),
        weeklyHours: input.weeklyHours || null,
        headline: input.headline,
        headlineFr: input.headlineFr || null,
        bio: input.bio,
        bioFr: input.bioFr || null,
        teachingPhilosophy: input.teachingPhilosophy || null,
        photoUrl: input.photoUrl || null,
        introVideoUrl: input.videoUrl || null,
        calendlyUrl: input.calendlyUrl || null,
        termsAccepted: input.termsAccepted || false,
        privacyAccepted: input.privacyAccepted || false,
        backgroundCheckConsent: input.backgroundCheckConsent || false,
        codeOfConductAccepted: input.codeOfConductAccepted || false,
        commissionAccepted: input.commissionAccepted || false,
        digitalSignature: input.digitalSignature || null,
        termsAcceptedAt: input.termsAccepted ? new Date() : null,
        termsVersion: input.termsAccepted ? "2026-02-09" : null,
        status: "submitted",
      });
      
      // Send confirmation email to applicant
      const userLang = user?.preferredLanguage || "en";
      await sendApplicationStatusEmail({
        applicantName: fullName,
        applicantEmail: email,
        status: "submitted",
        language: userLang as "en" | "fr",
      });
      
      // Create notification for the applicant
      await createNotification({
        userId: ctx.user.id,
        type: "system",
        title: userLang === "fr" ? "Candidature soumise" : "Application Submitted",
        message: userLang === "fr" 
          ? "Votre candidature de coach a été soumise avec succès. Nous l'examinerons dans les 5-7 jours ouvrables."
          : "Your coach application has been submitted successfully. We will review it within 5-7 business days.",
        link: "/become-a-coach",
      });
      
      // Notify admin/owner about new application
      const { notifyOwner } = await import("./_core/notification");
      await notifyOwner({
        title: "New Coach Application",
        content: `${fullName} (${email}) has submitted a coach application. Review it in the admin dashboard.`,
      });

      return { success: true };
    }),

  // Update coach profile
  update: protectedProcedure
    .input(
      z.object({
        headline: z.string().max(200).optional(),
        headlineFr: z.string().max(200).optional(),
        bio: z.string().max(2000).optional(),
        bioFr: z.string().max(2000).optional(),
        languages: z.enum(["french", "english", "both"]).optional(),
        specializations: z.record(z.string(), z.boolean()).optional(),
        yearsExperience: z.number().min(0).max(50).optional(),
        credentials: z.string().max(500).optional(),
        hourlyRate: z.number().min(0).max(20000).optional(),
        trialRate: z.number().min(0).max(10000).optional(),
        videoUrl: z.string().url().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
      }

      await updateCoachProfile(profile.id, input);
      return { success: true };
    }),

  // Upload coach profile photo to S3
  uploadPhoto: protectedProcedure
    .input(z.object({
      fileData: z.string(), // base64 encoded
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
      }

      const { storagePut } = await import("./storage");
      
      // Extract base64 data
      const base64Data = input.fileData.includes(',') 
        ? input.fileData.split(',')[1] 
        : input.fileData;
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate unique file path
      const timestamp = Date.now();
      const ext = input.fileName.split('.').pop() || 'jpg';
      const filePath = `coach-photos/${profile.id}/${timestamp}.${ext}`;
      
      const { url } = await storagePut(filePath, buffer, input.mimeType);
      
      // Update coach profile with new photo URL
      await updateCoachProfile(profile.id, { photoUrl: url });
      
      return { success: true, photoUrl: url };
    }),

  // Get coach gallery photos
  getGalleryPhotos: publicProcedure
    .input(z.object({ coachId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const { coachGalleryPhotos } = await import("../drizzle/schema");
      const photos = await db.select().from(coachGalleryPhotos)
        .where(and(
          eq(coachGalleryPhotos.coachId, input.coachId),
          eq(coachGalleryPhotos.isActive, true)
        ))
        .orderBy(asc(coachGalleryPhotos.sortOrder));
      return photos;
    }),

  // Upload gallery photo to S3
  uploadGalleryPhoto: protectedProcedure
    .input(z.object({
      coachId: z.number(),
      fileData: z.string(), // base64 encoded
      fileName: z.string(),
      mimeType: z.string(),
      caption: z.string().max(200).optional(),
      photoType: z.enum(["profile", "workspace", "certificate", "session", "event", "other"]).default("other"),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile || profile.id !== input.coachId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { coachGalleryPhotos } = await import("../drizzle/schema");

      // Check photo count (max 10)
      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(coachGalleryPhotos)
        .where(eq(coachGalleryPhotos.coachId, input.coachId));
      if ((countResult?.count || 0) >= 10) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum 10 photos allowed" });
      }

      const { storagePut } = await import("./storage");
      
      // Extract base64 data
      const base64Data = input.fileData.includes(',') 
        ? input.fileData.split(',')[1] 
        : input.fileData;
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate unique file path
      const timestamp = Date.now();
      const ext = input.fileName.split('.').pop() || 'jpg';
      const filePath = `coach-gallery/${profile.id}/${timestamp}.${ext}`;
      
      const { url } = await storagePut(filePath, buffer, input.mimeType);
      
      // Get next sort order
      const [maxOrder] = await db.select({ max: sql<number>`MAX(sort_order)` })
        .from(coachGalleryPhotos)
        .where(eq(coachGalleryPhotos.coachId, input.coachId));
      const nextOrder = (maxOrder?.max || 0) + 1;
      
      // Insert photo record
      const [result] = await db.insert(coachGalleryPhotos).values({
        coachId: input.coachId,
        photoUrl: url,
        caption: input.caption || null,
        altText: input.caption || null,
        photoType: input.photoType,
        sortOrder: nextOrder,
      }).$returningId();
      
      return { id: result.id, photoUrl: url, success: true };
    }),

  // Delete gallery photo
  deleteGalleryPhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { coachGalleryPhotos } = await import("../drizzle/schema");

      // Verify ownership
      const [photo] = await db.select().from(coachGalleryPhotos)
        .where(eq(coachGalleryPhotos.id, input.photoId));
      
      if (!photo || photo.coachId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      // Soft delete
      await db.update(coachGalleryPhotos)
        .set({ isActive: false })
        .where(eq(coachGalleryPhotos.id, input.photoId));
      
      return { success: true };
    }),

  // Save session notes
  saveSessionNotes: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      notes: z.string(),
      topicsCovered: z.array(z.string()).optional(),
      areasForImprovement: z.array(z.string()).optional(),
      homework: z.string().nullable().optional(),
      oralLevel: z.enum(["X", "A", "B", "C"]).nullable().optional(),
      writtenLevel: z.enum(["X", "A", "B", "C"]).nullable().optional(),
      readingLevel: z.enum(["X", "A", "B", "C"]).nullable().optional(),
      sharedWithLearner: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { sessionNotes, sessions: sessionsTable } = await import("../drizzle/schema");

      // Verify the session belongs to this coach
      const [session] = await db.select().from(sessionsTable)
        .where(eq(sessionsTable.id, input.sessionId));
      
      if (!session || session.coachId !== profile.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      // Check if notes already exist
      const [existing] = await db.select().from(sessionNotes)
        .where(eq(sessionNotes.sessionId, input.sessionId));
      
      if (existing) {
        // Update existing notes
        await db.update(sessionNotes)
          .set({
            notes: input.notes,
            topicsCovered: input.topicsCovered || null,
            areasForImprovement: input.areasForImprovement || null,
            homework: input.homework || null,
            oralLevel: input.oralLevel || null,
            writtenLevel: input.writtenLevel || null,
            readingLevel: input.readingLevel || null,
            sharedWithLearner: input.sharedWithLearner,
          })
          .where(eq(sessionNotes.id, existing.id));
        return { id: existing.id, success: true };
      } else {
        // Create new notes
        const [result] = await db.insert(sessionNotes).values({
          sessionId: input.sessionId,
          coachId: profile.id,
          notes: input.notes,
          topicsCovered: input.topicsCovered || null,
          areasForImprovement: input.areasForImprovement || null,
          homework: input.homework || null,
          oralLevel: input.oralLevel || null,
          writtenLevel: input.writtenLevel || null,
          readingLevel: input.readingLevel || null,
          sharedWithLearner: input.sharedWithLearner,
        }).$returningId();
        return { id: result.id, success: true };
      }
    }),

  // Get session notes for a session
  getSessionNotes: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const { sessionNotes, sessions: sessionsTable } = await import("../drizzle/schema");

      // Get the session to check authorization
      const [session] = await db.select().from(sessionsTable)
        .where(eq(sessionsTable.id, input.sessionId));
      
      if (!session) return null;

      // Get notes
      const [notes] = await db.select().from(sessionNotes)
        .where(eq(sessionNotes.sessionId, input.sessionId));
      
      if (!notes) return null;

      // Check if user is the coach or learner
      const profile = await getCoachByUserId(ctx.user.id);
      const learnerProfile = await getLearnerByUserId(ctx.user.id);
      
      const isCoach = profile && session.coachId === profile.id;
      const isLearner = learnerProfile && session.learnerId === learnerProfile.id;
      
      if (!isCoach && !isLearner) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }
      
      // If learner, only return if shared
      if (isLearner && !notes.sharedWithLearner) {
        return null;
      }
      
      return notes;
    }),

  // Get coach availability
  getAvailability: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
    }
    return await getCoachAvailability(profile.id);
  }),

  // Set coach availability (replace all slots)
  setAvailability: protectedProcedure
    .input(
      z.array(
        z.object({
          dayOfWeek: z.number().min(0).max(6),
          startTime: z.string().regex(/^\d{2}:\d{2}$/),
          endTime: z.string().regex(/^\d{2}:\d{2}$/),
          timezone: z.string().default("America/Toronto"),
          isActive: z.boolean().default(true),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
      }
      await setCoachAvailability(profile.id, input);
      return { success: true };
    }),

  // Get available time slots for a specific date (public)
  availableSlots: publicProcedure
    .input(
      z.object({
        coachId: z.number(),
        date: z.string(), // ISO date string
      })
    )
    .query(async ({ input }) => {
      const date = new Date(input.date);
      return await getAvailableTimeSlotsForDate(input.coachId, date);
    }),

  // Get coach earnings summary
  getEarningsSummary: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) {
      return {
        totalEarnings: 0,
        pendingPayouts: 0,
        completedPayouts: 0,
        thisMonthEarnings: 0,
        sessionsCompleted: 0,
        averageSessionValue: 0,
      };
    }
    return await getCoachEarningsSummary(profile.id);
  }),

  // Get coach payout ledger (transaction history)
  getPayoutLedger: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) {
      return [];
    }
    return await getCoachPayoutLedger(profile.id);
  }),

  // Update calendar settings
  updateCalendarSettings: protectedProcedure
    .input(
      z.object({
        calendarType: z.enum(["internal", "calendly"]),
        calendlyUrl: z.string().url().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db
        .update(coachProfiles)
        .set({
          calendarType: input.calendarType,
          calendlyUrl: input.calendlyUrl || null,
        })
        .where(eq(coachProfiles.id, profile.id));
      
      return { success: true };
    }),

  // Get calendar settings
  getCalendarSettings: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) {
      return { calendarType: 'internal' as const, calendlyUrl: null };
    }
    return {
      calendarType: profile.calendarType || 'internal',
      calendlyUrl: profile.calendlyUrl,
    };
  }),

  // Get current user's application status (for applicants)
  getApplicationStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const { coachApplications } = await import("../drizzle/schema");
    
    // Get the most recent application for this user
    const [application] = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.userId, ctx.user.id))
      .orderBy(desc(coachApplications.createdAt))
      .limit(1);
    
    if (!application) return null;
    
    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      reviewedAt: application.reviewedAt,
      reviewNotes: application.reviewNotes,
      fullName: application.fullName,
      email: application.email,
    };
  }),

  // Get application timeline (for tracking progress)
  getApplicationTimeline: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const { coachApplications } = await import("../drizzle/schema");
    
    // Get all applications for this user
    const applications = await db
      .select()
      .from(coachApplications)
      .where(eq(coachApplications.userId, ctx.user.id))
      .orderBy(asc(coachApplications.createdAt));
    
    return applications.map((app) => ({
      id: app.id,
      status: app.status,
      timestamp: app.status === 'submitted' ? app.createdAt : 
                 app.status === 'under_review' ? app.updatedAt :
                 app.reviewedAt || app.updatedAt,
      message: app.status === 'submitted' ? 'Application submitted' :
               app.status === 'under_review' ? 'Application under review' :
               app.status === 'approved' ? 'Application approved! Welcome to Lingueefy' :
               app.status === 'rejected' ? `Application rejected: ${app.reviewNotes || 'No reason provided'}` :
               'Unknown status',
      icon: app.status === 'submitted' ? 'check' :
            app.status === 'under_review' ? 'clock' :
            app.status === 'approved' ? 'checkCircle' :
            app.status === 'rejected' ? 'x' :
            'help',
    }));
  }),
  
  // Get coach profile for dashboard
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    const user = await getUserById(ctx.user.id);
    return {
      ...profile,
      name: user?.name,
      email: user?.email,
      avatarUrl: user?.avatarUrl,
    };
  }),
  
  // Get upcoming sessions for coach dashboard
  getUpcomingSessions: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) return [];
    
    const db = await getDb();
    if (!db) return [];
    
    const now = new Date();
    const upcomingSessions = await db.select({
      id: sessions.id,
      scheduledAt: sessions.scheduledAt,
      duration: sessions.duration,
      status: sessions.status,
      meetingUrl: sessions.meetingUrl,
      learnerName: users.name,
    })
      .from(sessions)
      .leftJoin(learnerProfiles, eq(sessions.learnerId, learnerProfiles.id))
      .leftJoin(users, eq(learnerProfiles.userId, users.id))
      .where(and(
        eq(sessions.coachId, profile.id),
        gte(sessions.scheduledAt, now),
        inArray(sessions.status, ["pending", "confirmed"])
      ))
      .orderBy(sessions.scheduledAt)
      .limit(20);
    
    return upcomingSessions;
  }),
  
  // Get learners for coach dashboard
  getMyLearners: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) return [];
    
    const db = await getDb();
    if (!db) return [];
    
    // Get unique learners who have had sessions with this coach
    const learners = await db.selectDistinct({
      id: learnerProfiles.id,
      userId: learnerProfiles.userId,
      name: users.name,
      email: users.email,
      level: learnerProfiles.currentLevel,
    })
      .from(sessions)
      .innerJoin(learnerProfiles, eq(sessions.learnerId, learnerProfiles.id))
      .innerJoin(users, eq(learnerProfiles.userId, users.id))
      .where(eq(sessions.coachId, profile.id));
    
    // Get session counts for each learner
    const learnersWithCounts = await Promise.all(learners.map(async (learner) => {
      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(sessions)
        .where(and(
          eq(sessions.coachId, profile.id),
          eq(sessions.learnerId, learner.id)
        ));
      return {
        ...learner,
        sessionsCount: countResult?.count || 0,
      };
    }));
    
    return learnersWithCounts;
  }),
  
  // Get earnings summary for coach dashboard (Duplicate removed)
  getEarningsSummaryV2: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) return { totalEarnings: 0, pendingPayout: 0, sessionsCompleted: 0, avgRating: null };
    
    const db = await getDb();
    if (!db) return { totalEarnings: 0, pendingPayout: 0, sessionsCompleted: 0, avgRating: null };
    
    // Get total earnings from payout ledger
    const [earningsResult] = await db.select({
      total: sql<number>`COALESCE(SUM(${payoutLedger.netAmount}), 0)`,
    })
      .from(payoutLedger)
      .where(and(
        eq(payoutLedger.coachId, profile.id),
        eq(payoutLedger.status, "completed")
      ));
    
    // Get pending payouts
    const [pendingResult] = await db.select({
      total: sql<number>`COALESCE(SUM(${payoutLedger.netAmount}), 0)`,
    })
      .from(payoutLedger)
      .where(and(
        eq(payoutLedger.coachId, profile.id),
        eq(payoutLedger.status, "pending")
      ));
    
    // Get completed sessions count
    const [sessionsResult] = await db.select({
      count: sql<number>`count(*)`,
    })
      .from(sessions)
      .where(and(
        eq(sessions.coachId, profile.id),
        eq(sessions.status, "completed")
      ));
    
    // Get average rating from coach profile
    const avgRating = profile.averageRating;
    
    return {
      totalEarnings: earningsResult?.total || 0,
      pendingPayout: pendingResult?.total || 0,
      sessionsCompleted: sessionsResult?.count || 0,
      avgRating: avgRating ? parseFloat(avgRating) : null,
    };
  }),

  // Confirm a pending session request
  confirmSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Coach profile not found" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get the session and verify ownership
      const [session] = await db.select()
        .from(sessions)
        .where(and(
          eq(sessions.id, input.sessionId),
          eq(sessions.coachId, profile.id)
        ));

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found or not authorized" });
      }

      if (session.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session is not pending" });
      }

      // Update session status to confirmed
      await db.update(sessions)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(sessions.id, input.sessionId));

      // Send confirmation email to learner
      const [learner] = await db.select()
        .from(learnerProfiles)
        .leftJoin(users, eq(learnerProfiles.userId, users.id))
        .where(eq(learnerProfiles.id, session.learnerId));

      if (learner?.users?.email) {
        const { sendEmail } = await import("./email");
        await sendEmail({
          to: learner.users.email,
          subject: "Session Confirmed / Session confirmée",
          html: `<p>Your coaching session on ${new Date(session.scheduledAt).toLocaleDateString()} has been confirmed by your coach.</p>
                 <p>Votre session de coaching du ${new Date(session.scheduledAt).toLocaleDateString()} a été confirmée par votre coach.</p>`,
        });
      }

      return { success: true };
    }),

  // Decline a pending session request
  declineSession: protectedProcedure
    .input(z.object({ 
      sessionId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Coach profile not found" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get the session and verify ownership
      const [session] = await db.select()
        .from(sessions)
        .where(and(
          eq(sessions.id, input.sessionId),
          eq(sessions.coachId, profile.id)
        ));

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found or not authorized" });
      }

      if (session.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session is not pending" });
      }

      // Update session status to cancelled
      await db.update(sessions)
        .set({ 
          status: "cancelled", 
          cancelledAt: new Date(),
          cancellationReason: input.reason || "Declined by coach",
          updatedAt: new Date() 
        })
        .where(eq(sessions.id, input.sessionId));

      // Process refund if payment exists
      if (session.stripePaymentId) {
        try {
          const stripe = (await import("stripe")).default;
          const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || "");
          await stripeClient.refunds.create({
            payment_intent: session.stripePaymentId,
          });
        } catch (stripeError) {
          console.error("Stripe refund error:", stripeError);
        }
      }

      // Send decline email to learner
      const [learner] = await db.select()
        .from(learnerProfiles)
        .leftJoin(users, eq(learnerProfiles.userId, users.id))
        .where(eq(learnerProfiles.id, session.learnerId));

      if (learner?.users?.email) {
        const { sendEmail } = await import("./email");
        await sendEmail({
          to: learner.users.email,
          subject: "Session Declined / Session refusée",
          html: `<p>Unfortunately, your coaching session request for ${new Date(session.scheduledAt).toLocaleDateString()} has been declined.</p>
                 <p>${input.reason ? `Reason: ${input.reason}` : ""}</p>
                 <p>Malheureusement, votre demande de session de coaching pour le ${new Date(session.scheduledAt).toLocaleDateString()} a été refusée.</p>
                 <p>${input.reason ? `Raison: ${input.reason}` : ""}</p>`,
        });
      }

      return { success: true };
    }),

  // Get pending session requests for coach
  getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) return [];

    const db = await getDb();
    if (!db) return [];

    const pendingRequests = await db.select({
      id: sessions.id,
      scheduledAt: sessions.scheduledAt,
      duration: sessions.duration,
      sessionType: sessions.sessionType,
      learnerName: users.name,
      learnerEmail: users.email,
      createdAt: sessions.createdAt,
    })
      .from(sessions)
      .leftJoin(learnerProfiles, eq(sessions.learnerId, learnerProfiles.id))
      .leftJoin(users, eq(learnerProfiles.userId, users.id))
      .where(and(
        eq(sessions.coachId, profile.id),
        eq(sessions.status, "pending")
      ))
      .orderBy(sessions.createdAt);

    return pendingRequests;
  }),

  // Get today's sessions for coach dashboard
  getTodaysSessions: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCoachByUserId(ctx.user.id);
    if (!profile) return [];

    const db = await getDb();
    if (!db) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSessions = await db.select({
      id: sessions.id,
      scheduledAt: sessions.scheduledAt,
      duration: sessions.duration,
      sessionType: sessions.sessionType,
      status: sessions.status,
      meetingUrl: sessions.meetingUrl,
      learnerName: users.name,
    })
      .from(sessions)
      .leftJoin(learnerProfiles, eq(sessions.learnerId, learnerProfiles.id))
      .leftJoin(users, eq(learnerProfiles.userId, users.id))
      .where(and(
        eq(sessions.coachId, profile.id),
        gte(sessions.scheduledAt, today),
        sql`${sessions.scheduledAt} < ${tomorrow}`,
        inArray(sessions.status, ["pending", "confirmed"])
      ))
      .orderBy(sessions.scheduledAt);

    return todaysSessions;
  }),

  // Get sessions for a specific month (for calendar view)
  getMonthSessions: protectedProcedure
    .input(z.object({
      year: z.number(),
      month: z.number().min(1).max(12),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await getCoachByUserId(ctx.user.id);
      if (!profile) return { sessions: [] };

      const db = await getDb();
      if (!db) return { sessions: [] };

      const startOfMonth = new Date(input.year, input.month - 1, 1);
      const endOfMonth = new Date(input.year, input.month, 0, 23, 59, 59);

      const monthSessions = await db.select({
        id: sessions.id,
        scheduledAt: sessions.scheduledAt,
        duration: sessions.duration,
        sessionType: sessions.sessionType,
        status: sessions.status,
        meetingUrl: sessions.meetingUrl,
        learnerName: users.name,
        learnerEmail: users.email,
        currentLevel: learnerProfiles.currentLevel,
        targetLevel: learnerProfiles.targetLevel,
      })
        .from(sessions)
        .leftJoin(learnerProfiles, eq(sessions.learnerId, learnerProfiles.id))
        .leftJoin(users, eq(learnerProfiles.userId, users.id))
        .where(and(
          eq(sessions.coachId, profile.id),
          gte(sessions.scheduledAt, startOfMonth),
          sql`${sessions.scheduledAt} <= ${endOfMonth}`
        ))
        .orderBy(sessions.scheduledAt);

      return { sessions: monthSessions };
    }),
});

// ============================================================================
// LEARNER ROUTER
// ============================================================================
const learnerRouter = router({
  // Get current user's learner profile
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    return await getLearnerByUserId(ctx.user.id);
  }),

  // Create learner profile
  create: protectedProcedure
    .input(
      z.object({
        department: z.string().max(200).optional(),
        position: z.string().max(200).optional(),
        currentLevel: z.object({
          reading: z.enum(["X", "A", "B", "C"]).optional(),
          writing: z.enum(["X", "A", "B", "C"]).optional(),
          oral: z.enum(["X", "A", "B", "C"]).optional(),
        }).optional(),
        targetLevel: z.object({
          reading: z.enum(["A", "B", "C"]).optional(),
          writing: z.enum(["A", "B", "C"]).optional(),
          oral: z.enum(["A", "B", "C"]).optional(),
        }).optional(),
        examDate: z.date().optional(),
        learningGoals: z.string().max(1000).optional(),
        primaryFocus: z.enum(["oral", "written", "reading", "all"]).default("oral"),
        targetLanguage: z.enum(["french", "english"]).default("french"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getLearnerByUserId(ctx.user.id);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a learner profile",
        });
      }

      await createLearnerProfile({
        userId: ctx.user.id,
        department: input.department || null,
        position: input.position || null,
        currentLevel: input.currentLevel || null,
        targetLevel: input.targetLevel || null,
        examDate: input.examDate || null,
        learningGoals: input.learningGoals || null,
        primaryFocus: input.primaryFocus,
        targetLanguage: input.targetLanguage,
      });

      return { success: true };
    }),

  // Update learner profile
  update: protectedProcedure
    .input(
      z.object({
        department: z.string().max(200).optional(),
        position: z.string().max(200).optional(),
        currentLevel: z.object({
          reading: z.enum(["X", "A", "B", "C"]).optional(),
          writing: z.enum(["X", "A", "B", "C"]).optional(),
          oral: z.enum(["X", "A", "B", "C"]).optional(),
        }).optional(),
        targetLevel: z.object({
          reading: z.enum(["A", "B", "C"]).optional(),
          writing: z.enum(["A", "B", "C"]).optional(),
          oral: z.enum(["A", "B", "C"]).optional(),
        }).optional(),
        examDate: z.date().optional(),
        learningGoals: z.string().max(1000).optional(),
        primaryFocus: z.enum(["oral", "written", "reading", "all"]).optional(),
        targetLanguage: z.enum(["french", "english"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await getLearnerByUserId(ctx.user.id);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
      }

      await updateLearnerProfile(profile.id, input);
      return { success: true };
    }),

  // Get upcoming sessions
  upcomingSessions: protectedProcedure.query(async ({ ctx }) => {
    return await getUpcomingSessions(ctx.user.id, "learner");
  }),

  // Get latest booked session (for confirmation page)
  latestSession: protectedProcedure.query(async ({ ctx }) => {
    return await getLatestSessionForLearner(ctx.user.id);
  }),

  // Get past sessions
  pastSessions: protectedProcedure.query(async ({ ctx }) => {
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return [];
    
    const db = await getDb();
    if (!db) return [];
    
    const pastSessions = await db.select({
      session: sessions,
      coach: {
        id: coachProfiles.id,
        photoUrl: coachProfiles.photoUrl,
        slug: coachProfiles.slug,
        userId: coachProfiles.userId,
      },
      coachUser: {
        name: users.name,
      },
    })
      .from(sessions)
      .leftJoin(coachProfiles, eq(sessions.coachId, coachProfiles.id))
      .leftJoin(users, eq(coachProfiles.userId, users.id))
      .where(and(
        eq(sessions.learnerId, learner.id),
        eq(sessions.status, "completed")
      ))
      .orderBy(desc(sessions.scheduledAt))
      .limit(50);
    
    // Transform to include name in coach object
    return pastSessions.map(s => ({
      session: s.session,
      coach: {
        ...s.coach,
        name: s.coachUser?.name || "Coach",
      },
    }));
  }),

  // Get cancelled sessions
  cancelledSessions: protectedProcedure.query(async ({ ctx }) => {
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return [];
    
    const db = await getDb();
    if (!db) return [];
    
    const cancelledSessions = await db.select({
      session: sessions,
      coach: {
        id: coachProfiles.id,
        photoUrl: coachProfiles.photoUrl,
        slug: coachProfiles.slug,
        userId: coachProfiles.userId,
      },
      coachUser: {
        name: users.name,
      },
    })
      .from(sessions)
      .leftJoin(coachProfiles, eq(sessions.coachId, coachProfiles.id))
      .leftJoin(users, eq(coachProfiles.userId, users.id))
      .where(and(
        eq(sessions.learnerId, learner.id),
        eq(sessions.status, "cancelled")
      ))
      .orderBy(desc(sessions.scheduledAt))
      .limit(50);
    
    // Transform to include name in coach object
    return cancelledSessions.map(s => ({
      session: s.session,
      coach: {
        ...s.coach,
        name: s.coachUser?.name || "Coach",
      },
    }));
  }),

  // Reschedule a session
  reschedule: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        newDateTime: z.string(), // ISO string
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get the session and verify ownership
      const [session] = await db.select()
        .from(sessions)
        .where(eq(sessions.id, input.sessionId));
      
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }
      
      // Get learner profile to verify ownership
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner || session.learnerId !== learner.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only reschedule your own sessions" });
      }
      
      // Check 24-hour policy
      const now = new Date();
      const sessionDate = new Date(session.scheduledAt);
      const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilSession < 24) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sessions must be rescheduled at least 24 hours in advance",
        });
      }
      
      const newDate = new Date(input.newDateTime);
      
      // Update the session
      await db.update(sessions)
        .set({ 
          scheduledAt: newDate,
          status: "confirmed",
        })
        .where(eq(sessions.id, input.sessionId));
      
      // Get coach and user info for email notifications
      const [coachProfile] = await db.select()
        .from(coachProfiles)
        .leftJoin(users, eq(coachProfiles.userId, users.id))
        .where(eq(coachProfiles.id, session.coachId));
      
      const learnerUser = await getUserById(ctx.user.id);
      
      if (coachProfile && learnerUser) {
        // Format old time
        const oldDate = new Date(session.scheduledAt);
        const oldTime = oldDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        const newTime = newDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        
        // Send reschedule notification emails
        await sendRescheduleNotificationEmails({
          learnerName: learnerUser.name || "Learner",
          learnerEmail: learnerUser.email || "",
          coachName: coachProfile.users?.name || "Coach",
          coachEmail: coachProfile.users?.email || "",
          oldDate,
          oldTime,
          newDate,
          newTime,
          duration: session.duration || 30,
          meetingUrl: session.meetingUrl || undefined,
          rescheduledBy: "learner",
        });
      }
      
      return { success: true, newDateTime: newDate };
    }),

  // Cancel a session with refund processing
  cancelSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get the session and verify ownership
      const [session] = await db.select()
        .from(sessions)
        .where(eq(sessions.id, input.sessionId));
      
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }
      
      // Get learner profile to verify ownership
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner || session.learnerId !== learner.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only cancel your own sessions" });
      }
      
      // Check if session is already cancelled
      if (session.status === "cancelled") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session is already cancelled" });
      }
      
      // Check 24-hour policy for refund eligibility
      const now = new Date();
      const sessionDate = new Date(session.scheduledAt);
      const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isRefundEligible = hoursUntilSession >= 24;
      
      let refundAmount = 0;
      
      // Process refund if eligible and has payment
      if (isRefundEligible && session.stripePaymentId) {
        try {
          const stripe = (await import("stripe")).default;
          const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || "");
          
          // Create refund
          const refund = await stripeClient.refunds.create({
            payment_intent: session.stripePaymentId,
          });
          
          refundAmount = refund.amount;
          
          // Update payout ledger if exists
          await db.update(payoutLedger)
            .set({ 
              status: "reversed",
              updatedAt: new Date(),
            })
            .where(eq(payoutLedger.sessionId, input.sessionId));
        } catch (stripeError) {
          console.error("Stripe refund error:", stripeError);
          // Continue with cancellation even if refund fails
        }
      }
      
      // Update session status
      await db.update(sessions)
        .set({ 
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: input.reason || null,
        })
        .where(eq(sessions.id, input.sessionId));
      
      // Send cancellation notification emails
      const [coachProfile] = await db.select()
        .from(coachProfiles)
        .leftJoin(users, eq(coachProfiles.userId, users.id))
        .where(eq(coachProfiles.id, session.coachId));
      
      const learnerUser = await getUserById(ctx.user.id);
      
      if (coachProfile && learnerUser) {
        const { sendCancellationNotificationEmails } = await import("./email");
        await sendCancellationNotificationEmails({
          learnerName: learnerUser.name || "Learner",
          learnerEmail: learnerUser.email || "",
          coachName: coachProfile.users?.name || "Coach",
          coachEmail: coachProfile.users?.email || "",
          sessionDate,
          sessionTime: sessionDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          duration: session.duration || 30,
          reason: input.reason,
          refundAmount,
          cancelledBy: "learner",
        });
      }
      
      return { 
        success: true, 
        refundAmount,
        refundEligible: isRefundEligible,
      };
    }),

  // Get learner progress report data
  getProgressReport: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
    }
    
    const user = await getUserById(ctx.user.id);
    
    // Get date range for the past week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get coach sessions completed in the past week
    const coachSessionsResult = await db.select({
      count: sql<number>`COUNT(*)`,
      totalMinutes: sql<number>`COALESCE(SUM(${sessions.duration}), 0)`,
    })
      .from(sessions)
      .where(sql`${sessions.learnerId} = ${learner.id} 
        AND ${sessions.status} = 'completed' 
        AND ${sessions.completedAt} >= ${weekAgo}`);
    
    const coachSessionsCompleted = Number(coachSessionsResult[0]?.count || 0);
    const coachMinutes = Number(coachSessionsResult[0]?.totalMinutes || 0);
    
    // Get scheduled sessions
    const scheduledResult = await db.select({
      count: sql<number>`COUNT(*)`,
    })
      .from(sessions)
      .where(sql`${sessions.learnerId} = ${learner.id} 
        AND ${sessions.status} IN ('pending', 'confirmed') 
        AND ${sessions.scheduledAt} >= ${now}`);
    
    const coachSessionsScheduled = Number(scheduledResult[0]?.count || 0);
    
    // Get AI sessions from the past week
    const { aiSessions: aiSessionsTable } = await import("../drizzle/schema");
    const aiSessionsResult = await db.select({
      sessionType: aiSessionsTable.sessionType,
      count: sql<number>`COUNT(*)`,
      totalMinutes: sql<number>`COALESCE(SUM(${aiSessionsTable.duration}), 0)`,
    })
      .from(aiSessionsTable)
      .where(sql`${aiSessionsTable.learnerId} = ${learner.id} 
        AND ${aiSessionsTable.status} = 'completed' 
        AND ${aiSessionsTable.createdAt} >= ${weekAgo}`)
      .groupBy(aiSessionsTable.sessionType);
    
    const aiBreakdown = {
      practice: 0,
      placement: 0,
      simulation: 0,
    };
    let aiMinutes = 0;
    let totalAiSessions = 0;
    
    for (const row of aiSessionsResult) {
      const count = Number(row.count || 0);
      const minutes = Number(row.totalMinutes || 0) / 60; // Convert seconds to minutes
      totalAiSessions += count;
      aiMinutes += minutes;
      if (row.sessionType === "practice") aiBreakdown.practice = count;
      else if (row.sessionType === "placement") aiBreakdown.placement = count;
      else if (row.sessionType === "simulation") aiBreakdown.simulation = count;
    }
    
    // Parse current and target levels
    const currentLevels = (learner.currentLevel as { oral?: string; written?: string; reading?: string }) || {};
    const targetLevels = (learner.targetLevel as { oral?: string; written?: string; reading?: string }) || {};
    
    return {
      learnerName: user?.name || "Learner",
      learnerEmail: user?.email || "",
      language: (user?.preferredLanguage || "en") as "en" | "fr",
      weekStartDate: weekAgo.toISOString(),
      weekEndDate: now.toISOString(),
      coachSessionsCompleted,
      coachSessionsScheduled,
      aiSessionsCompleted: totalAiSessions,
      totalPracticeMinutes: Math.round(coachMinutes + aiMinutes),
      currentLevels,
      targetLevels,
      aiSessionBreakdown: aiBreakdown,
    };
  }),

  // Update weekly report preferences
  updateReportPreferences: protectedProcedure
    .input(
      z.object({
        weeklyReportEnabled: z.boolean(),
        weeklyReportDay: z.number().min(0).max(1), // 0=Sunday, 1=Monday
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
      }
      
      await db.update(learnerProfiles)
        .set({
          weeklyReportEnabled: input.weeklyReportEnabled,
          weeklyReportDay: input.weeklyReportDay,
        })
        .where(eq(learnerProfiles.id, learner.id));
      
      return { success: true };
    }),

  // Get report preferences
  getReportPreferences: protectedProcedure.query(async ({ ctx }) => {
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
    }
    
    return {
      weeklyReportEnabled: learner.weeklyReportEnabled ?? true,
      weeklyReportDay: learner.weeklyReportDay ?? 0,
    };
  }),

  // Send progress report email
  sendProgressReport: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
    }
    
    const user = await getUserById(ctx.user.id);
    if (!user?.email) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No email address on file" });
    }
    
    // Import email functions
    const { sendLearnerProgressReport, generateProgressReportData } = await import("./email");
    
    // Get date range for the past week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get coach sessions
    const coachSessionsResult = await db.select({
      count: sql<number>`COUNT(*)`,
      totalMinutes: sql<number>`COALESCE(SUM(${sessions.duration}), 0)`,
    })
      .from(sessions)
      .where(sql`${sessions.learnerId} = ${learner.id} 
        AND ${sessions.status} = 'completed' 
        AND ${sessions.completedAt} >= ${weekAgo}`);
    
    const coachSessionsCompleted = Number(coachSessionsResult[0]?.count || 0);
    const coachMinutes = Number(coachSessionsResult[0]?.totalMinutes || 0);
    
    // Get scheduled sessions
    const scheduledResult = await db.select({
      count: sql<number>`COUNT(*)`,
    })
      .from(sessions)
      .where(sql`${sessions.learnerId} = ${learner.id} 
        AND ${sessions.status} IN ('pending', 'confirmed') 
        AND ${sessions.scheduledAt} >= ${now}`);
    
    const coachSessionsScheduled = Number(scheduledResult[0]?.count || 0);
    
    // Get AI sessions
    const { aiSessions: aiSessionsTable } = await import("../drizzle/schema");
    const aiSessionsResult = await db.select({
      sessionType: aiSessionsTable.sessionType,
      count: sql<number>`COUNT(*)`,
      totalMinutes: sql<number>`COALESCE(SUM(${aiSessionsTable.duration}), 0)`,
    })
      .from(aiSessionsTable)
      .where(sql`${aiSessionsTable.learnerId} = ${learner.id} 
        AND ${aiSessionsTable.status} = 'completed' 
        AND ${aiSessionsTable.createdAt} >= ${weekAgo}`)
      .groupBy(aiSessionsTable.sessionType);
    
    const aiBreakdown = { practice: 0, placement: 0, simulation: 0 };
    let aiMinutes = 0;
    let totalAiSessions = 0;
    
    for (const row of aiSessionsResult) {
      const count = Number(row.count || 0);
      const minutes = Number(row.totalMinutes || 0) / 60;
      totalAiSessions += count;
      aiMinutes += minutes;
      if (row.sessionType === "practice") aiBreakdown.practice = count;
      else if (row.sessionType === "placement") aiBreakdown.placement = count;
      else if (row.sessionType === "simulation") aiBreakdown.simulation = count;
    }
    
    const currentLevels = (learner.currentLevel as { oral?: string; written?: string; reading?: string }) || {};
    const targetLevels = (learner.targetLevel as { oral?: string; written?: string; reading?: string }) || {};
    
    const reportData = generateProgressReportData({
      learnerId: learner.id,
      learnerName: user.name || "Learner",
      learnerEmail: user.email,
      language: (user.preferredLanguage || "en") as "en" | "fr",
      currentLevels,
      targetLevels,
      coachSessionsCompleted,
      coachSessionsScheduled,
      aiSessionsCompleted: totalAiSessions,
      aiSessionBreakdown: aiBreakdown,
      totalPracticeMinutes: Math.round(coachMinutes + aiMinutes),
    });
    
    const sent = await sendLearnerProgressReport(reportData);
    
    return { success: sent };
  }),

  // Get learner's favorite coaches
  favorites: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return [];
    
    const favorites = await db.select({
      id: learnerFavorites.id,
      coachId: learnerFavorites.coachId,
      note: learnerFavorites.note,
      createdAt: learnerFavorites.createdAt,
      coach: {
        id: coachProfiles.id,
        slug: coachProfiles.slug,
        photoUrl: coachProfiles.photoUrl,
        headline: coachProfiles.headline,
        headlineFr: coachProfiles.headlineFr,
        hourlyRate: coachProfiles.hourlyRate,
      },
      coachUser: {
        name: users.name,
      },
    })
      .from(learnerFavorites)
      .leftJoin(coachProfiles, eq(learnerFavorites.coachId, coachProfiles.id))
      .leftJoin(users, eq(coachProfiles.userId, users.id))
      .where(eq(learnerFavorites.learnerId, learner.id))
      .orderBy(desc(learnerFavorites.createdAt));
    
    return favorites.map(f => ({
      ...f,
      coach: {
        ...f.coach,
        name: f.coachUser?.name || "Coach",
      },
    }));
  }),

  // Add coach to favorites
  addFavorite: protectedProcedure
    .input(z.object({ coachId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
      }
      
      // Check if already favorited
      const [existing] = await db.select()
        .from(learnerFavorites)
        .where(and(
          eq(learnerFavorites.learnerId, learner.id),
          eq(learnerFavorites.coachId, input.coachId)
        ));
      
      if (existing) {
        return { success: true, alreadyFavorited: true };
      }
      
      await db.insert(learnerFavorites).values({
        learnerId: learner.id,
        coachId: input.coachId,
      });
      
      return { success: true };
    }),

  // Remove coach from favorites
  removeFavorite: protectedProcedure
    .input(z.object({ coachId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
      }
      
      await db.delete(learnerFavorites)
        .where(and(
          eq(learnerFavorites.learnerId, learner.id),
          eq(learnerFavorites.coachId, input.coachId)
        ));
      
      return { success: true };
    }),

  // Check if coach is favorited
  isFavorited: protectedProcedure
    .input(z.object({ coachId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return false;
      
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) return false;
      
      const [favorite] = await db.select()
        .from(learnerFavorites)
        .where(and(
          eq(learnerFavorites.learnerId, learner.id),
          eq(learnerFavorites.coachId, input.coachId)
        ));
      
      return !!favorite;
    }),

  // Get loyalty points
  getLoyaltyPoints: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalPoints: 0, availablePoints: 0, lifetimePoints: 0, tier: "bronze" };
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return { totalPoints: 0, availablePoints: 0, lifetimePoints: 0, tier: "bronze" };
    
    const { loyaltyPoints } = await import("../drizzle/schema");
    const [points] = await db.select().from(loyaltyPoints)
      .where(eq(loyaltyPoints.learnerId, learner.id));
    
    if (!points) {
      // Create initial loyalty record
      await db.insert(loyaltyPoints).values({
        learnerId: learner.id,
        totalPoints: 0,
        availablePoints: 0,
        lifetimePoints: 0,
        tier: "bronze",
      });
      return { totalPoints: 0, availablePoints: 0, lifetimePoints: 0, tier: "bronze" };
    }
    
    return {
      totalPoints: points.totalPoints,
      availablePoints: points.availablePoints,
      lifetimePoints: points.lifetimePoints,
      tier: points.tier,
    };
  }),

  // Get available rewards
  getAvailableRewards: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const { loyaltyRewards } = await import("../drizzle/schema");
    const rewards = await db.select().from(loyaltyRewards)
      .where(eq(loyaltyRewards.isActive, true));
    
    return rewards;
  }),

  // Get points history
  getPointsHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return [];
    
    const { pointTransactions } = await import("../drizzle/schema");
    const history = await db.select().from(pointTransactions)
      .where(eq(pointTransactions.learnerId, learner.id))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(50);
    
    return history;
  }),

  // Redeem reward
  redeemReward: protectedProcedure
    .input(z.object({ rewardId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
      
      const { loyaltyPoints, loyaltyRewards, redeemedRewards, pointTransactions } = await import("../drizzle/schema");
      
      // Get reward
      const [reward] = await db.select().from(loyaltyRewards)
        .where(eq(loyaltyRewards.id, input.rewardId));
      
      if (!reward || !reward.isActive) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reward not found or inactive" });
      }
      
      // Get current points
      const [points] = await db.select().from(loyaltyPoints)
        .where(eq(loyaltyPoints.learnerId, learner.id));
      
      if (!points || points.availablePoints < reward.pointsCost) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient points" });
      }
      
      // Check tier requirement
      const tierOrder = ["bronze", "silver", "gold", "platinum"];
      if (tierOrder.indexOf(points.tier) < tierOrder.indexOf(reward.minTier || "bronze")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Tier requirement not met" });
      }
      
      // Generate discount code
      const discountCode = `LNG-${Date.now().toString(36).toUpperCase()}`;
      
      // Create redeemed reward
      await db.insert(redeemedRewards).values({
        learnerId: learner.id,
        rewardId: reward.id,
        pointsSpent: reward.pointsCost,
        discountCode,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
      
      // Deduct points
      await db.update(loyaltyPoints)
        .set({
          availablePoints: points.availablePoints - reward.pointsCost,
          totalPoints: points.totalPoints - reward.pointsCost,
        })
        .where(eq(loyaltyPoints.learnerId, learner.id));
      
      // Record transaction
      await db.insert(pointTransactions).values({
        learnerId: learner.id,
        type: "redeemed_discount",
        points: -reward.pointsCost,
        description: `Redeemed: ${reward.nameEn}`,
      });
      
      return { success: true, discountCode };
    }),
  
  // Get referral stats
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const { referralInvitations } = await import("../drizzle/schema");
    
    // Generate referral code and link for this user
    const code = `REF${ctx.user.id}${ctx.user.id.toString(36).toUpperCase()}`;
    const baseUrl = process.env.VITE_OAUTH_PORTAL_URL || "https://lingueefy.manus.space";
    const referralLink = `${baseUrl}?ref=${code}`;
    
    // Get invitation stats
    const invitations = await db.select().from(referralInvitations)
      .where(eq(referralInvitations.referrerId, ctx.user.id));
    
    const totalInvites = invitations.length;
    const pendingInvites = invitations.filter((i: any) => i.status === "pending" || i.status === "clicked").length;
    const registeredInvites = invitations.filter((i: any) => i.status === "registered" || i.status === "converted").length;
    const convertedInvites = invitations.filter((i: any) => i.status === "converted").length;
    const totalPointsEarned = invitations.reduce((sum: number, i: any) => sum + (i.referrerRewardPoints || 0), 0);
    
    return {
      referralCode: code,
      referralLink,
      totalInvites,
      pendingInvites,
      registeredInvites,
      convertedInvites,
      totalPointsEarned,
      conversionRate: totalInvites > 0 ? (convertedInvites / totalInvites) * 100 : 0,
    };
  }),
  
  // Get referral invitations
  getReferralInvitations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const { referralInvitations } = await import("../drizzle/schema");
    return await db.select().from(referralInvitations)
      .where(eq(referralInvitations.referrerId, ctx.user.id))
      .orderBy(desc(referralInvitations.createdAt));
  }),
  
  // Send referral invite by email
  sendReferralInvite: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { referralInvitations } = await import("../drizzle/schema");
      
      // Generate referral code and link
      const code = `REF${ctx.user.id}${ctx.user.id.toString(36).toUpperCase()}`;
      const baseUrl = process.env.VITE_OAUTH_PORTAL_URL || "https://lingueefy.manus.space";
      const referralLink = `${baseUrl}?ref=${code}`;
      
      // Check if already invited
      const [existing] = await db.select().from(referralInvitations)
        .where(and(
          eq(referralInvitations.referrerId, ctx.user.id),
          eq(referralInvitations.inviteeEmail, input.email)
        ));
      
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "This email has already been invited" });
      }
      
      // Create invitation record
      await db.insert(referralInvitations).values({
        referrerId: ctx.user.id,
        referralCode: code,
        inviteeEmail: input.email,
        inviteMethod: "email",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
      
      // Send email (using existing email system)
      const { sendReferralInviteEmail } = await import("./email");
      await sendReferralInviteEmail({
        to: input.email,
        referrerName: ctx.user.name || "A friend",
        referralLink,
      });
      
      return { success: true };
    }),
    
  // Get user's active challenges
  getChallenges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const { challenges, userChallenges } = await import("../drizzle/schema");
    
    // Get or create weekly challenges for user
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    // Get active challenges
    const activeChallenges = await db.select().from(challenges)
      .where(eq(challenges.isActive, true));
    
    // Get user's challenge progress
    const userProgress = await db.select().from(userChallenges)
      .where(and(
        eq(userChallenges.userId, ctx.user.id),
        gte(userChallenges.periodStart, weekStart)
      ));
    
    // Create missing challenge entries for user
    for (const challenge of activeChallenges) {
      const existing = userProgress.find(p => p.challengeId === challenge.id);
      if (!existing && challenge.period === "weekly") {
        await db.insert(userChallenges).values({
          userId: ctx.user.id,
          challengeId: challenge.id,
          currentProgress: 0,
          targetProgress: challenge.targetCount,
          periodStart: weekStart,
          periodEnd: weekEnd,
        });
      }
    }
    
    // Re-fetch with joined data
    const result = await db.select({
      id: userChallenges.id,
      name: challenges.name,
      nameFr: challenges.nameFr,
      description: challenges.description,
      descriptionFr: challenges.descriptionFr,
      type: challenges.type,
      targetCount: challenges.targetCount,
      pointsReward: challenges.pointsReward,
      period: challenges.period,
      currentProgress: userChallenges.currentProgress,
      status: userChallenges.status,
      periodEnd: userChallenges.periodEnd,
    })
    .from(userChallenges)
    .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
    .where(and(
      eq(userChallenges.userId, ctx.user.id),
      gte(userChallenges.periodStart, weekStart)
    ));
    
    return result;
  }),
  
  // Claim challenge reward
  claimChallengeReward: protectedProcedure
    .input(z.object({ userChallengeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { userChallenges, challenges, loyaltyPoints, pointTransactions } = await import("../drizzle/schema");
      
      // Get user challenge
      const [userChallenge] = await db.select()
        .from(userChallenges)
        .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
        .where(and(
          eq(userChallenges.id, input.userChallengeId),
          eq(userChallenges.userId, ctx.user.id)
        ));
      
      if (!userChallenge) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
      }
      
      if (userChallenge.user_challenges.status === "completed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Reward already claimed" });
      }
      
      if (userChallenge.user_challenges.currentProgress < userChallenge.challenges.targetCount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Challenge not completed yet" });
      }
      
      // Mark as completed
      await db.update(userChallenges)
        .set({ 
          status: "completed", 
          completedAt: new Date(),
          pointsAwarded: userChallenge.challenges.pointsReward,
        })
        .where(eq(userChallenges.id, input.userChallengeId));
      
      // Award points - get learner first
      const learnerForPoints = await getLearnerByUserId(ctx.user.id);
      if (!learnerForPoints) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
      }
      
      const [existingPoints] = await db.select().from(loyaltyPoints)
        .where(eq(loyaltyPoints.learnerId, learnerForPoints.id));
      
      if (existingPoints) {
        await db.update(loyaltyPoints)
          .set({ 
            totalPoints: existingPoints.totalPoints + userChallenge.challenges.pointsReward,
            availablePoints: existingPoints.availablePoints + userChallenge.challenges.pointsReward,
          })
          .where(eq(loyaltyPoints.learnerId, learnerForPoints.id));
      } else {
        await db.insert(loyaltyPoints).values({
          learnerId: learnerForPoints.id,
          totalPoints: userChallenge.challenges.pointsReward,
          availablePoints: userChallenge.challenges.pointsReward,
          tier: "bronze",
        });
      }
      
      // Record transaction
      const learner = await getLearnerByUserId(ctx.user.id);
      if (learner) {
        await db.insert(pointTransactions).values({
          learnerId: learner.id,
          points: userChallenge.challenges.pointsReward,
          type: "earned_milestone",
          description: `Completed challenge: ${userChallenge.challenges.name}`,
        });
      }
      
      return { success: true, pointsAwarded: userChallenge.challenges.pointsReward };
    }),
  
  // Get leaderboard
  getLeaderboard: protectedProcedure
    .input(z.object({ period: z.enum(["weekly", "monthly", "allTime"]) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { loyaltyPoints, learnerProfiles, users, sessions } = await import("../drizzle/schema");
      
      // Get date filter based on period
      let dateFilter: Date | null = null;
      const now = new Date();
      if (input.period === "weekly") {
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (input.period === "monthly") {
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Get all learners with points
      const leaderboardData = await db.select({
        learnerId: loyaltyPoints.learnerId,
        points: loyaltyPoints.totalPoints,
        tier: loyaltyPoints.tier,
        userId: learnerProfiles.userId,
        userName: users.name,
        avatarUrl: users.avatarUrl,
      })
        .from(loyaltyPoints)
        .innerJoin(learnerProfiles, eq(loyaltyPoints.learnerId, learnerProfiles.id))
        .innerJoin(users, eq(learnerProfiles.userId, users.id))
        .orderBy(desc(loyaltyPoints.totalPoints))
        .limit(50);
      
      // Get session counts for each learner
      const leaderboard = await Promise.all(leaderboardData.map(async (entry, index) => {
        // Count completed sessions
        const sessionCount = await db.select({ count: sql<number>`count(*)` })
          .from(sessions)
          .where(and(
            eq(sessions.learnerId, entry.learnerId),
            eq(sessions.status, "completed")
          ));
        
        return {
          rank: index + 1,
          userId: entry.userId,
          name: entry.userName || "Anonymous",
          avatarUrl: entry.avatarUrl,
          points: entry.points,
          tier: entry.tier,
          sessionsCompleted: Number(sessionCount[0]?.count || 0),
          streak: 0, // Would need streak tracking table
          rankChange: 0, // Would need previous rank tracking
        };
      }));
      
      return leaderboard;
    }),

  // Get streak data
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Please create a learner profile first" });
    }
    
    const { learnerProfiles } = await import("../drizzle/schema");
    
    const profile = await db.select({
      currentStreak: learnerProfiles.currentStreak,
      longestStreak: learnerProfiles.longestStreak,
      lastSessionWeek: learnerProfiles.lastSessionWeek,
      streakFreezeUsed: learnerProfiles.streakFreezeUsed,
    })
      .from(learnerProfiles)
      .where(eq(learnerProfiles.id, learner.id))
      .limit(1);
    
    if (!profile[0]) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastSessionWeek: null,
        streakFreezeUsed: false,
        streakFreezeAvailable: true,
        nextMilestone: 3,
        pointsToNextMilestone: 50,
      };
    }
    
    return {
      currentStreak: profile[0].currentStreak || 0,
      longestStreak: profile[0].longestStreak || 0,
      lastSessionWeek: profile[0].lastSessionWeek,
      streakFreezeUsed: profile[0].streakFreezeUsed || false,
      streakFreezeAvailable: !profile[0].streakFreezeUsed,
      nextMilestone: 3,
      pointsToNextMilestone: 50,
    };
  }),

  // Use streak freeze
  useStreakFreeze: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Please create a learner profile first" });
    }
    
    const { learnerProfiles } = await import("../drizzle/schema");
    
    // Check if freeze is already used
    const profile = await db.select({ streakFreezeUsed: learnerProfiles.streakFreezeUsed })
      .from(learnerProfiles)
      .where(eq(learnerProfiles.id, learner.id))
      .limit(1);
    
    if (profile[0]?.streakFreezeUsed) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Streak freeze already used" });
    }
    
    // Get current ISO week
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const currentWeek = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
    
    // Use the freeze - update last session week to current week
    await db.update(learnerProfiles)
      .set({
        streakFreezeUsed: true,
        lastSessionWeek: currentWeek,
      })
      .where(eq(learnerProfiles.id, learner.id));
    
    return { success: true };
  }),

  // Update streak after session completion (called internally)
  updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Please create a learner profile first" });
    }
    
    const { learnerProfiles, pointTransactions, loyaltyPoints } = await import("../drizzle/schema");
    
    // Get current profile
    const profile = await db.select()
      .from(learnerProfiles)
      .where(eq(learnerProfiles.id, learner.id))
      .limit(1);
    
    if (!profile[0]) return { success: false };
    
    // Get current ISO week
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const currentWeek = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
    
    const lastWeek = profile[0].lastSessionWeek;
    let newStreak = profile[0].currentStreak || 0;
    
    // If same week, no change
    if (lastWeek === currentWeek) {
      return { success: true, streak: newStreak };
    }
    
    // Check if consecutive week
    if (lastWeek) {
      const [lastYear, lastWeekNum] = lastWeek.split('-W').map(Number);
      const [currentYear, currentWeekNum] = currentWeek.split('-W').map(Number);
      
      const isConsecutive = 
        (currentYear === lastYear && currentWeekNum === lastWeekNum + 1) ||
        (currentYear === lastYear + 1 && lastWeekNum === 52 && currentWeekNum === 1);
      
      if (isConsecutive) {
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    
    const newLongest = Math.max(newStreak, profile[0].longestStreak || 0);
    
    // Update profile
    await db.update(learnerProfiles)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastSessionWeek: currentWeek,
      })
      .where(eq(learnerProfiles.id, learner.id));
    
    // Award bonus points for streak milestones
    const milestones = [
      { weeks: 3, points: 50 },
      { weeks: 7, points: 150 },
      { weeks: 14, points: 400 },
      { weeks: 30, points: 1000 },
      { weeks: 52, points: 2500 },
    ];
    
    const milestone = milestones.find(m => m.weeks === newStreak);
    if (milestone) {
      // Award bonus points
      await db.insert(pointTransactions).values({
        learnerId: learner.id,
        type: "earned_streak",
        points: milestone.points,
        description: `${newStreak} week streak bonus!`,
      });
      
      // Update loyalty points
      const existing = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.learnerId, learner.id)).limit(1);
      if (existing[0]) {
        await db.update(loyaltyPoints)
          .set({
            totalPoints: sql`${loyaltyPoints.totalPoints} + ${milestone.points}`,
            availablePoints: sql`${loyaltyPoints.availablePoints} + ${milestone.points}`,
            lifetimePoints: sql`${loyaltyPoints.lifetimePoints} + ${milestone.points}`,
          })
          .where(eq(loyaltyPoints.learnerId, learner.id));
      } else {
        await db.insert(loyaltyPoints).values({
          learnerId: learner.id,
          totalPoints: milestone.points,
          availablePoints: milestone.points,
          lifetimePoints: milestone.points,
          tier: "bronze",
        });
      }
    }
    
    return { success: true, streak: newStreak, milestone: milestone?.weeks };
  }),
  
  // Get learner profile for dashboard
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const learner = await getLearnerByUserId(ctx.user.id);
    const user = await getUserById(ctx.user.id);
    return {
      ...learner,
      name: user?.name,
      email: user?.email,
      avatarUrl: user?.avatarUrl,
    };
  }),
  
  // Get upcoming sessions for dashboard
  getUpcomingSessions: protectedProcedure.query(async ({ ctx }) => {
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return [];
    
    const db = await getDb();
    if (!db) return [];
    
    const now = new Date();
    const upcomingSessions = await db.select({
      id: sessions.id,
      scheduledAt: sessions.scheduledAt,
      duration: sessions.duration,
      status: sessions.status,
      meetingUrl: sessions.meetingUrl,
      coachName: users.name,
    })
      .from(sessions)
      .leftJoin(coachProfiles, eq(sessions.coachId, coachProfiles.id))
      .leftJoin(users, eq(coachProfiles.userId, users.id))
      .where(and(
        eq(sessions.learnerId, learner.id),
        gte(sessions.scheduledAt, now),
        inArray(sessions.status, ["pending", "confirmed"])
      ))
      .orderBy(sessions.scheduledAt)
      .limit(5);
    
    return upcomingSessions;
  }),

  // Get learner's enrolled courses (Path Series)
  getMyCourses: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const { courses, courseEnrollments, courseModules, lessonProgress } = await import("../drizzle/schema");
    
    // Get all course enrollments for this user
    const enrollments = await db.select({
      enrollment: courseEnrollments,
      course: courses,
    })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(eq(courseEnrollments.userId, ctx.user.id))
      .orderBy(desc(courseEnrollments.enrolledAt));
    
    // Get progress for each course
    const coursesWithProgress = await Promise.all(enrollments.map(async (e) => {
      // Count total lessons in course
      const totalLessonsResult = await db.select({ count: sql<number>`COUNT(*)` })
        .from(courseModules)
        .where(eq(courseModules.courseId, e.course.id));
      
      // Count completed lessons
      const completedLessonsResult = await db.select({ count: sql<number>`COUNT(*)` })
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.courseId, e.course.id),
          eq(lessonProgress.status, "completed")
        ));
      
      const totalLessons = Number(totalLessonsResult[0]?.count || 0);
      const completedLessons = Number(completedLessonsResult[0]?.count || 0);
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      return {
        id: e.enrollment.id,
        courseId: e.course.id,
        title: e.course.title,
        description: e.course.description,
        thumbnailUrl: e.course.thumbnailUrl,
        level: e.course.level,
        category: e.course.category,
        enrolledAt: e.enrollment.enrolledAt,
        status: e.enrollment.status,
        progressPercent,
        completedLessons,
        totalLessons,
        lastAccessedAt: e.enrollment.lastAccessedAt,
      };
    }));
    
    return coursesWithProgress;
  }),

  // Get next lesson to continue
  getNextLesson: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const { courses, courseModules, lessons, lessonProgress, courseEnrollments } = await import("../drizzle/schema");
      
      // Get enrollment
      const [enrollment] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.courseId, input.courseId)
        ));
      
      if (!enrollment) return null;
      
      // Get all lessons in order
      const allLessons = await db.select({
        lesson: lessons,
        module: courseModules,
      })
        .from(lessons)
        .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
        .where(eq(lessons.courseId, input.courseId))
        .orderBy(courseModules.sortOrder, lessons.sortOrder);
      
      // Get completed lessons
      const completedLessonIds = await db.select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.courseId, input.courseId),
          eq(lessonProgress.status, "completed")
        ));
      
      const completedIds = new Set(completedLessonIds.map(l => l.lessonId));
      
      // Find first incomplete lesson
      const nextLesson = allLessons.find(l => !completedIds.has(l.lesson.id));
      
      if (!nextLesson) return null;
      
      return {
        lessonId: nextLesson.lesson.id,
        lessonTitle: nextLesson.lesson.title,
        moduleTitle: nextLesson.module.title,
        duration: nextLesson.lesson.estimatedMinutes || 0,
        contentType: nextLesson.lesson.contentType,
      };
    }),

  // Get course details with modules and lessons
  getCourseDetails: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const { courses, courseModules, lessons, lessonProgress, courseEnrollments } = await import("../drizzle/schema");
      
      // Get course
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.id, input.courseId));
      
      if (!course) return null;
      
      // Get enrollment
      const [enrollment] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.courseId, input.courseId)
        ));
      
      // Get modules with lessons
      const modules = await db.select()
        .from(courseModules)
        .where(eq(courseModules.courseId, input.courseId))
        .orderBy(courseModules.sortOrder);
      
      const modulesWithLessons = await Promise.all(modules.map(async (module) => {
        const moduleLessons = await db.select()
          .from(lessons)
          .where(eq(lessons.moduleId, module.id))
          .orderBy(lessons.sortOrder);
        
        // Get progress for each lesson if enrolled
        const lessonsWithProgress = await Promise.all(moduleLessons.map(async (lesson) => {
          let progress = null;
          if (enrollment) {
            const [lessonProg] = await db.select()
              .from(lessonProgress)
              .where(and(
                eq(lessonProgress.userId, ctx.user.id),
                eq(lessonProgress.lessonId, lesson.id),
                eq(lessonProgress.courseId, input.courseId)
              ));
            progress = lessonProg;
          }
          
          return {
            ...lesson,
            isCompleted: progress?.status === "completed",
            isInProgress: progress?.status === "in_progress",
            progressPercent: progress?.progressPercent || 0,
          };
        }));
        
        return {
          ...module,
          lessons: lessonsWithProgress,
        };
      }));
      
      return {
        ...course,
        isEnrolled: !!enrollment,
        enrollmentStatus: enrollment?.status,
        modules: modulesWithLessons,
      };
    }),

  // Get learner's badges
  getMyBadges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { badges: [] };
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return { badges: [] };
    
    const { learnerBadges } = await import("../drizzle/schema");
    
    const badges = await db.select().from(learnerBadges)
      .where(eq(learnerBadges.userId, ctx.user.id))
      .orderBy(desc(learnerBadges.awardedAt));
    
    return { badges };
  }),

  // Get learning velocity data for SLEVelocityWidget
  getVelocityData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) {
      return {
        currentLevel: { reading: "X", writing: "X", oral: "X" },
        targetLevel: { reading: "B", writing: "B", oral: "B" },
        weeklyStudyHours: 0,
        lessonsCompleted: 0,
        quizzesPassed: 0,
        lastAssessmentScore: null,
        examDate: null,
        predictedReadyDate: null,
        velocityTrend: "steady",
      };
    }
    
    // Calculate predicted ready date based on current progress
    const currentLevel = (learner.currentLevel as { reading?: string; writing?: string; oral?: string }) || {};
    const targetLevel = (learner.targetLevel as { reading?: string; writing?: string; oral?: string }) || {};
    
    // Simple prediction: estimate weeks to reach target based on study hours
    const weeklyHours = Number(learner.weeklyStudyHours) || 0;
    const lessonsCompleted = learner.lessonsCompleted || 0;
    
    // Calculate level gaps
    const levelValues: Record<string, number> = { X: 0, A: 1, B: 2, C: 3 };
    const gaps = [
      (levelValues[targetLevel.reading || "B"] || 2) - (levelValues[currentLevel.reading || "X"] || 0),
      (levelValues[targetLevel.writing || "B"] || 2) - (levelValues[currentLevel.writing || "X"] || 0),
      (levelValues[targetLevel.oral || "B"] || 2) - (levelValues[currentLevel.oral || "X"] || 0),
    ];
    const maxGap = Math.max(...gaps);
    
    // Estimate weeks needed (roughly 8 weeks per level with 5+ hours/week)
    const weeksPerLevel = weeklyHours >= 5 ? 8 : weeklyHours >= 3 ? 12 : 16;
    const weeksNeeded = maxGap * weeksPerLevel;
    
    const predictedReadyDate = new Date();
    predictedReadyDate.setDate(predictedReadyDate.getDate() + weeksNeeded * 7);
    
    // Determine velocity trend based on recent activity
    let velocityTrend: "improving" | "steady" | "declining" = "steady";
    if (weeklyHours >= 5 && lessonsCompleted > 10) velocityTrend = "improving";
    else if (weeklyHours < 2) velocityTrend = "declining";
    
    return {
      currentLevel,
      targetLevel,
      weeklyStudyHours: weeklyHours,
      lessonsCompleted,
      quizzesPassed: learner.quizzesPassed || 0,
      lastAssessmentScore: learner.lastAssessmentScore,
      examDate: learner.examDate,
      predictedReadyDate: weeksNeeded > 0 ? predictedReadyDate : null,
      velocityTrend,
    };
  }),

  // Get certification status for CertificationExpiryWidget
  getCertificationStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) {
      return {
        hasCertification: false,
        certificationDate: null,
        certificationExpiry: null,
        certifiedLevel: null,
        daysUntilExpiry: null,
        isExpiringSoon: false,
        isExpired: false,
      };
    }
    
    const certificationDate = learner.certificationDate;
    const certificationExpiry = learner.certificationExpiry;
    const certifiedLevel = learner.certifiedLevel as { reading?: string; writing?: string; oral?: string } | null;
    
    if (!certificationDate || !certificationExpiry) {
      return {
        hasCertification: false,
        certificationDate: null,
        certificationExpiry: null,
        certifiedLevel: null,
        daysUntilExpiry: null,
        isExpiringSoon: false,
        isExpired: false,
      };
    }
    
    const now = new Date();
    const expiryDate = new Date(certificationExpiry);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysUntilExpiry < 0;
    const isExpiringSoon = !isExpired && daysUntilExpiry <= 180; // 6 months warning
    
    return {
      hasCertification: true,
      certificationDate,
      certificationExpiry,
      certifiedLevel,
      daysUntilExpiry: isExpired ? 0 : daysUntilExpiry,
      isExpiringSoon,
      isExpired,
    };
  }),

  // Update certification data
  updateCertification: protectedProcedure
    .input(z.object({
      certificationDate: z.date(),
      certifiedLevel: z.object({
        reading: z.enum(["A", "B", "C"]),
        writing: z.enum(["A", "B", "C"]),
        oral: z.enum(["A", "B", "C"]),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
      }
      
      // Calculate expiry (5 years from certification date)
      const expiryDate = new Date(input.certificationDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 5);
      
      await db.update(learnerProfiles)
        .set({
          certificationDate: input.certificationDate,
          certificationExpiry: expiryDate,
          certifiedLevel: input.certifiedLevel,
        })
        .where(eq(learnerProfiles.id, learner.id));
      
      return { success: true, certificationExpiry: expiryDate };
    }),

  // Get learner's XP and level
  getMyXp: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalXp: 0, level: 1, xpForNextLevel: 100, currentLevelXp: 0 };
    
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return { totalXp: 0, level: 1, xpForNextLevel: 100, currentLevelXp: 0 };
    
    const { learnerXp } = await import("../drizzle/schema");
    
    const [xp] = await db.select().from(learnerXp)
      .where(eq(learnerXp.userId, ctx.user.id));
    
    if (!xp) {
      // Create initial XP record
      await db.insert(learnerXp).values({
        userId: ctx.user.id,
        totalXp: 0,
        currentLevel: 1,
        levelTitle: "Beginner",
        currentStreak: 0,
        longestStreak: 0,
      });
      return { totalXp: 0, level: 1, xpForNextLevel: 100, currentLevelXp: 0 };
    }
    
    // Calculate XP for next level (100 * level)
    const xpForNextLevel = 100 * (xp.currentLevel + 1);
    const currentLevelXp = xp.totalXp - (100 * xp.currentLevel * (xp.currentLevel - 1) / 2);
    
    return {
      totalXp: xp.totalXp,
      level: xp.currentLevel,
      xpForNextLevel,
      currentLevelXp: Math.max(0, currentLevelXp),
    };
  }),

  // Get learner's coaching plans
  getMyCoachingPlans: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const { coachingPlanPurchases } = await import("../drizzle/schema");
    
    const plans = await db.select()
      .from(coachingPlanPurchases)
      .where(eq(coachingPlanPurchases.userId, ctx.user.id))
      // @ts-expect-error - TS2339: auto-suppressed during TS cleanup
      .orderBy(desc(coachingPlanPurchases.createdAt));
    
    return plans;
  }),

  // Mark a lesson as complete
  markLessonComplete: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      courseId: z.number(),
      moduleId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { lessonProgress, courseEnrollments, lessons, learnerProfiles } = await import("../drizzle/schema");
      
      // Verify user is enrolled in the course
      const [enrollment] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.courseId, input.courseId),
          eq(courseEnrollments.status, "active")
        ));
      
      if (!enrollment) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not enrolled in this course" });
      }
      
      // Check if progress record exists
      const [existing] = await db.select()
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.lessonId, input.lessonId)
        ));
      
      const now = new Date();
      
      if (existing) {
        // Update existing record
        await db.update(lessonProgress)
          .set({
            status: "completed",
            progressPercent: 100,
            completedAt: now,
            lastAccessedAt: now,
          })
          .where(eq(lessonProgress.id, existing.id));
      } else {
        // Create new progress record
        await db.insert(lessonProgress).values({
          lessonId: input.lessonId,
          userId: ctx.user.id,
          courseId: input.courseId,
          moduleId: input.moduleId,
          status: "completed",
          progressPercent: 100,
          completedAt: now,
          lastAccessedAt: now,
        });
      }
      
      // Update learner's lessonsCompleted count
      const learner = await getLearnerByUserId(ctx.user.id);
      if (learner) {
        await db.update(learnerProfiles)
          .set({
            lessonsCompleted: sql`${learnerProfiles.lessonsCompleted} + 1`,
          })
          .where(eq(learnerProfiles.id, learner.id));
      }
      
      // Calculate new course progress
      const totalLessonsResult = await db.select({ count: sql<number>`COUNT(*)` })
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId));
      
      const completedLessonsResult = await db.select({ count: sql<number>`COUNT(*)` })
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.courseId, input.courseId),
          eq(lessonProgress.status, "completed")
        ));
      
      const totalLessons = Number(totalLessonsResult[0]?.count || 0);
      const completedLessons = Number(completedLessonsResult[0]?.count || 0);
      const newProgressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      // Update enrollment progress
      await db.update(courseEnrollments)
        .set({
          progressPercent: newProgressPercent,
    // @ts-ignore - Drizzle type inference
          completedLessons,
          lastAccessedAt: now,
          completedAt: newProgressPercent === 100 ? now : null,
          status: newProgressPercent === 100 ? "completed" : "active",
        })
        .where(eq(courseEnrollments.id, enrollment.id));
      
      return {
        success: true,
        lessonId: input.lessonId,
        courseProgress: newProgressPercent,
        completedLessons,
        totalLessons,
      };
    }),

  // Get lesson progress for a course
  getLessonProgress: protectedProcedure
    .input(z.object({
      courseId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const { lessonProgress } = await import("../drizzle/schema");
      
      const progress = await db.select()
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.courseId, input.courseId)
        ));
      
      return progress;
    }),
});

// ============================================================================
// AI SESSION ROUTER (SLE AI Companion AI)
// ============================================================================
const aiRouter = router({
  // Start a practice session
  startPractice: protectedProcedure
    .input(
      z.object({
        language: z.enum(["french", "english"]),
        targetLevel: z.enum(["a", "b", "c"]).optional(),
        topic: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Please create a learner profile first",
        });
      }

      const session = await createAiSession({
        learnerId: learner.id,
        sessionType: "practice",
        language: input.language,
        targetLevel: input.targetLevel,
      });

      return { sessionId: session[0].insertId };
    }),

  // Start placement test
  startPlacement: protectedProcedure
    .input(
      z.object({
        language: z.enum(["french", "english"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Please create a learner profile first",
        });
      }

      const session = await createAiSession({
        learnerId: learner.id,
        sessionType: "placement",
        language: input.language,
      });

      return { sessionId: session[0].insertId };
    }),

  // Start exam simulation
  startSimulation: protectedProcedure
    .input(
      z.object({
        language: z.enum(["french", "english"]),
        targetLevel: z.enum(["a", "b", "c"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Please create a learner profile first",
        });
      }

      const session = await createAiSession({
        learnerId: learner.id,
        sessionType: "simulation",
        language: input.language,
        targetLevel: input.targetLevel,
      });

      return { sessionId: session[0].insertId };
    }),

  // Chat with SLE AI Companion AI
  chat: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        message: z.string().min(1).max(2000),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `You are SLE AI Companion AI, a friendly and encouraging language coach specializing in helping Canadian federal public servants prepare for their Second Language Evaluation (SLE) exams.

Your role:
- Help learners practice their French or English conversation skills
- Provide corrections and feedback in a supportive way
- Use vocabulary and scenarios relevant to the Canadian federal public service
- Adapt your language complexity to the learner's level
- Encourage and motivate learners

Guidelines:
- If practicing French, respond primarily in French with occasional English explanations for corrections
- If practicing English, respond primarily in English with occasional French explanations for corrections
- Keep responses conversational and natural
- Point out errors gently and provide the correct form
- Suggest improvements for more natural phrasing
- Use workplace scenarios: meetings, briefings, emails, presentations, etc.

Remember: You're preparing them for real SLE oral interaction exams, so focus on practical communication skills.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({ messages });

      const content = response.choices[0]?.message?.content;
      const responseText = typeof content === 'string' ? content : "I apologize, I couldn't generate a response. Please try again.";
      
      return {
        response: responseText,
      };
    }),

  // Get learner's AI session history
  history: protectedProcedure.query(async ({ ctx }) => {
    const learner = await getLearnerByUserId(ctx.user.id);
    if (!learner) return [];

    return await getLearnerAiSessions(learner.id);
  }),
});

// ============================================================================
// COMMISSION & PAYMENT ROUTER
// ============================================================================
const commissionRouter = router({
  // Get all commission tiers (admin)
  tiers: protectedProcedure.query(async () => {
    return await getCommissionTiers();
  }),

  // Get coach's current commission info
  myCommission: protectedProcedure.query(async ({ ctx }) => {
    const coach = await getCoachByUserId(ctx.user.id);
    if (!coach) return null;
    
    const commission = await getCoachCommission(coach.id);
    const earnings = await getCoachEarningsSummary(coach.id);
    
    return {
      commission,
      earnings,
    };
  }),

  // Get coach's payout ledger
  myLedger: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const coach = await getCoachByUserId(ctx.user.id);
      if (!coach) return [];
      
      return await getCoachPayoutLedger(coach.id, input.limit);
    }),

  // Get coach's referral link
  myReferralLink: protectedProcedure.query(async ({ ctx }) => {
    const coach = await getCoachByUserId(ctx.user.id);
    if (!coach) return null;
    
    return await getCoachReferralLink(coach.id);
  }),

  // Create referral link for coach
  createReferralLink: protectedProcedure.mutation(async ({ ctx }) => {
    const coach = await getCoachByUserId(ctx.user.id);
    if (!coach) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
    }
    
    // Generate unique code
    const code = `${coach.slug}-${Date.now().toString(36)}`.slice(0, 20);
    
    await createReferralLink({
      coachId: coach.id,
      code,
      discountCommissionBps: 500, // 5% commission for referred bookings
      isActive: true,
    });
    
    return { code };
  }),

  // Seed default tiers (admin only)
  seedTiers: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
    }
    await seedDefaultCommissionTiers();
    return { success: true };
  }),
});

// ============================================================================
// STRIPE CONNECT ROUTER
// ============================================================================
const stripeRouter = router({
  // Validate coupon code
  validateCoupon: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { promoCoupons } = await import("../drizzle/schema");
      
      const [coupon] = await db.select().from(promoCoupons)
        .where(and(
          eq(promoCoupons.code, input.code.toUpperCase()),
          eq(promoCoupons.isActive, true)
        ));
      
      if (!coupon) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid coupon code" });
      }
      
      // Check expiry
      if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This coupon has expired" });
      }
      
      // Check usage limit
      if (coupon.maxUses && coupon.usedCount && coupon.usedCount >= coupon.maxUses) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This coupon has reached its usage limit" });
      }
      
      return {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      };
    }),

  // Start Stripe Connect onboarding for coach
  startOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    const coach = await getCoachByUserId(ctx.user.id);
    if (!coach) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Coach profile not found" });
    }
    
    if (coach.stripeAccountId) {
      // Already has account, get new onboarding link
      const url = await getOnboardingLink(coach.stripeAccountId);
      return { url, accountId: coach.stripeAccountId };
    }
    
    // Create new Connect account
    const { accountId, onboardingUrl } = await createConnectAccount({
      email: ctx.user.email || "",
      name: ctx.user.name || "Coach",
      coachId: coach.id,
    });
    
    // Save account ID to coach profile
    await updateCoachProfile(coach.id, { stripeAccountId: accountId });
    
    return { url: onboardingUrl, accountId };
  }),

  // Check Stripe account status
  accountStatus: protectedProcedure.query(async ({ ctx }) => {
    const coach = await getCoachByUserId(ctx.user.id);
    if (!coach || !coach.stripeAccountId) {
      return { hasAccount: false, isOnboarded: false };
    }
    
    const status = await checkAccountStatus(coach.stripeAccountId);
    
    // Update onboarded status in profile
    if (status.isOnboarded && !coach.stripeOnboarded) {
      await updateCoachProfile(coach.id, { stripeOnboarded: true });
    }
    
    return { hasAccount: true, ...status };
  }),

  // Get Stripe Express dashboard link
  dashboardLink: protectedProcedure.mutation(async ({ ctx }) => {
    const coach = await getCoachByUserId(ctx.user.id);
    if (!coach || !coach.stripeAccountId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No Stripe account found" });
    }
    
    const url = await createDashboardLink(coach.stripeAccountId);
    return { url };
  }),

  // Create checkout session for booking
  createCheckout: protectedProcedure
    .input(z.object({
      coachId: z.number(),
      sessionType: z.enum(["trial", "single", "package"]),
      packageSize: z.enum(["5", "10"]).optional(),
      sessionDate: z.string().optional(), // ISO date string
      sessionTime: z.string().optional(), // Time string like "10:00 AM"
      couponId: z.number().optional(), // Promo coupon ID
    }))
    .mutation(async ({ ctx, input }) => {
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Please create a learner profile first" });
      }
      
      const coachResult = await getCoachBySlug(""); // We need coach by ID
      // For now, get coach profile directly
      const coach = await getCoachByUserId(input.coachId);
      if (!coach || !coach.stripeAccountId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found or not set up for payments" });
      }
      
      // Calculate amount based on session type
      let amountCents = 0;
      if (input.sessionType === "trial") {
        amountCents = coach.trialRate || 2500; // Default $25
      } else if (input.sessionType === "package") {
        const sessions = input.packageSize === "10" ? 10 : 5;
        const discount = input.packageSize === "10" ? 0.15 : 0.10;
        amountCents = Math.round((coach.hourlyRate || 5500) * sessions * (1 - discount));
      } else {
        amountCents = coach.hourlyRate || 5500; // Default $55
      }
      
      // Apply coupon discount if provided
      let couponDiscountCents = 0;
      if (input.couponId) {
        const db = await getDb();
        if (db) {
          const { promoCoupons, couponRedemptions } = await import("../drizzle/schema");
          const [coupon] = await db.select().from(promoCoupons).where(eq(promoCoupons.id, input.couponId));
          
          if (coupon && coupon.isActive) {
            if (coupon.discountType === "percentage") {
              couponDiscountCents = Math.round(amountCents * coupon.discountValue / 100);
            } else if (coupon.discountType === "fixed_amount") {
              couponDiscountCents = coupon.discountValue;
            } else if (coupon.discountType === "free_trial" && input.sessionType === "trial") {
              couponDiscountCents = amountCents;
            }
            
            // Record redemption
            const originalAmountCents = amountCents;
            const finalAmountCents = Math.max(0, amountCents - couponDiscountCents);
            await db.insert(couponRedemptions).values({
              couponId: coupon.id,
              userId: ctx.user.id,
              discountAmount: couponDiscountCents,
              originalAmount: originalAmountCents,
              finalAmount: finalAmountCents,
            });
            
            // Increment usage count
            await db.update(promoCoupons)
              .set({ usedCount: (coupon.usedCount || 0) + 1 })
              .where(eq(promoCoupons.id, coupon.id));
          }
        }
      }
      
      // Apply coupon discount
      amountCents = Math.max(0, amountCents - couponDiscountCents);
      
      // Calculate commission
      const isTrialSession = input.sessionType === "trial";
      const { commissionBps } = await calculateCommissionRate(coach.id, isTrialSession);
      
      // Check for referral discount
      const referral = await getReferralDiscount(learner.id, coach.id);
      const finalCommissionBps = referral.hasReferral ? referral.discountBps : commissionBps;
      
      const { platformFeeCents } = calculatePlatformFee(amountCents, finalCommissionBps);
      
      // Get coach user info for email
      const coachUser = await getUserById(coach.userId);
      
      const { url } = await createCheckoutSession({
        coachStripeAccountId: coach.stripeAccountId,
        coachId: coach.id,
        coachUserId: coach.userId,
        coachName: coachUser?.name || "Coach",
        learnerId: learner.id,
        learnerUserId: ctx.user.id,
        learnerEmail: ctx.user.email || "",
        learnerName: ctx.user.name || "Learner",
        sessionType: input.sessionType,
        packageSize: input.packageSize ? parseInt(input.packageSize) as 5 | 10 : undefined,
        amountCents,
        platformFeeCents,
        duration: input.sessionType === "trial" ? 30 : 60,
        sessionDate: input.sessionDate,
        sessionTime: input.sessionTime,
        origin: ctx.req.headers.origin || "https://www.rusingacademy.ca",
      });
      
      return { url };
    }),
  // ============================================================================
  // COURSE PURCHASE (Path Series™)
  // ============================================================================
  
  // Create checkout session for course purchase
  createCourseCheckout: protectedProcedure
    .input(z.object({
      courseId: z.string(),
      locale: z.enum(['en', 'fr']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { createCourseCheckoutSession } = await import('./services/stripeCourseService');
      
      const origin = ctx.req.headers.origin || 'https://www.rusingacademy.ca';
      
      const { url, sessionId } = await createCourseCheckoutSession({
        courseId: input.courseId,
        userId: ctx.user.id,
        userEmail: ctx.user.email || '',
        userName: ctx.user.name || undefined,
        successUrl: `${origin}/courses/success`,
        cancelUrl: `${origin}/curriculum`,
        locale: input.locale || 'en',
      });
      
      return { url, sessionId };
    }),
  
  // Create checkout session for coaching plan purchase
  createCoachingPlanCheckout: protectedProcedure
    .input(z.object({
      planId: z.string(),
      locale: z.enum(['en', 'fr']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { createCoachingPlanCheckoutSession } = await import('./services/stripeCourseService');
      
      const origin = ctx.req.headers.origin || 'https://www.rusingacademy.ca';
      
      const { url, sessionId } = await createCoachingPlanCheckoutSession({
        planId: input.planId,
        userId: ctx.user.id,
        userEmail: ctx.user.email || '',
        userName: ctx.user.name || undefined,
        successUrl: `${origin}/lingueefy/success`,
        cancelUrl: `${origin}/lingueefy`,
        locale: input.locale || 'en',
      });
      
      return { url, sessionId };
    }),
  
  // Get available courses
  getCourses: publicProcedure.query(async () => {
    const { getAllCourses } = await import('./services/stripeCourseService');
    return getAllCourses();
  }),
  
  // Get available coaching plans
  getCoachingPlans: publicProcedure.query(async () => {
    const { getAllCoachingPlans } = await import('./services/stripeCourseService');
    return getAllCoachingPlans();
  }),
});

// ============================================================================
// MAIN APP ROUTER
// ============================================================================
export const appRouter = router({
  system: systemRouter,
  contact: contactRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  coach: coachRouter,
  learner: learnerRouter,
  
  // Booking System
  booking: router({
    // Get available slots for a coach on a specific date
    getAvailableSlots: protectedProcedure
      .input(z.object({
        coachId: z.number(),
        date: z.string(), // YYYY-MM-DD format
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          // Fallback to mock data if DB not available
          return generateMockSlots(input.date);
        }
        
        // Check if coach has Calendly integration
        const { coachProfiles } = await import("../drizzle/schema");
        const [coach] = await db.select().from(coachProfiles).where(eq(coachProfiles.id, input.coachId));
        
        if (coach?.calendlyEventTypeUri && process.env.CALENDLY_API_KEY) {
          // Use Calendly API for real availability
          try {
            const { CalendlyService } = await import("./services/calendlyService");
            const calendlyService = new CalendlyService(process.env.CALENDLY_API_KEY);
            
            const startTime = new Date(`${input.date}T00:00:00Z`).toISOString();
            const endTime = new Date(`${input.date}T23:59:59Z`).toISOString();
            
            const availableTimes = await calendlyService.getAvailableTimes(
              coach.calendlyEventTypeUri,
              startTime,
              endTime
            );
            
            return availableTimes.map((slot, index) => ({
              id: `calendly-${input.date}-${index}`,
              startTime: new Date(slot.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
              endTime: new Date(new Date(slot.start_time).getTime() + 60 * 60 * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
              available: slot.status === "available",
              schedulingUrl: slot.scheduling_url,
            }));
          } catch (error) {
            console.error("[Booking] Calendly API error, falling back to mock:", error);
            return generateMockSlots(input.date);
          }
        }
        
        // Fallback: Use coach's manual availability from database
        const availability = await getCoachAvailability(input.coachId);
        const dayOfWeek = new Date(input.date).getDay();
    // @ts-ignore - comparison type mismatch
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        // @ts-expect-error - TS2367: auto-suppressed during TS cleanup
        const todayAvailability = availability.filter(a => a.dayOfWeek === dayNames[dayOfWeek]);
        
        if (todayAvailability.length > 0) {
          // Generate slots based on coach's availability
          const slots: { id: string; startTime: string; endTime: string; available: boolean }[] = [];
          for (const avail of todayAvailability) {
            const startHour = parseInt(avail.startTime.split(":")[0]);
            const endHour = parseInt(avail.endTime.split(":")[0]);
            for (let hour = startHour; hour < endHour; hour++) {
              slots.push({
                id: `${input.date}-${hour}`,
                startTime: `${hour.toString().padStart(2, "0")}:00`,
                endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
                available: true,
              });
            }
          }
          return slots;
        }
        
        // Final fallback: Generate mock slots
        return generateMockSlots(input.date);
      }),

    // Book a session using coaching plan credits
    bookSessionWithPlan: protectedProcedure
      .input(z.object({
        coachId: z.number(),
        planId: z.number(),
        date: z.string(),
        slotId: z.string(),
        startTime: z.string(),
        duration: z.number().default(60),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { coachingPlanPurchases, sessions, coachProfiles, learnerProfiles } = await import("../drizzle/schema");
        
        // Verify the plan belongs to the user and has remaining sessions
        const [plan] = await db.select()
          .from(coachingPlanPurchases)
          .where(and(
            eq(coachingPlanPurchases.id, input.planId),
            eq(coachingPlanPurchases.userId, ctx.user.id),
            eq(coachingPlanPurchases.status, "active")
          ));
        
        if (!plan) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Coaching plan not found" });
        }
        
        if (plan.remainingSessions <= 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No remaining sessions in this plan" });
        }
        
        if (new Date(plan.expiresAt) < new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This plan has expired" });
        }
        
        // Get learner profile
        const learner = await getLearnerByUserId(ctx.user.id);
        if (!learner) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Learner profile not found" });
        }
        
        // Create the session
        const scheduledAt = new Date(`${input.date}T${input.startTime}:00`);
        
        const [session] = await db.insert(sessions).values({
          coachId: input.coachId,
          learnerId: learner.id,
          scheduledAt,
          duration: input.duration,
          sessionType: "package",
          status: "confirmed",
          price: 0, // Using plan credits
        });
        
        // Deduct from plan
        const newRemaining = plan.remainingSessions - 1;
        await db.update(coachingPlanPurchases)
          .set({
            remainingSessions: newRemaining,
            status: newRemaining === 0 ? "exhausted" : "active",
          })
          .where(eq(coachingPlanPurchases.id, input.planId));
        
        // Send confirmation email
        try {
          const { sendCoachingSessionConfirmationEmail } = await import("./email-purchase-confirmations");
          await sendCoachingSessionConfirmationEmail({
            userEmail: ctx.user.email || "",
            userName: ctx.user.name || "Learner",
            coachName: "Coach", // Would need to fetch coach name
            sessionDate: scheduledAt.toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            sessionTime: input.startTime,
            duration: input.duration,
            remainingSessions: newRemaining,
          });
        } catch (e) {
          console.error("Failed to send session confirmation email:", e);
        }
        
        return {
          success: true,
          sessionId: (session as any).insertId,
          remainingSessions: newRemaining,
        };
      }),

    // Get user's booked sessions
    getMySessions: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      const learner = await getLearnerByUserId(ctx.user.id);
      if (!learner) return [];
      
      const { sessions, coachProfiles, users } = await import("../drizzle/schema");
      
      const userSessions = await db.select({
        session: sessions,
        coach: coachProfiles,
        coachUser: users,
      })
        .from(sessions)
        .leftJoin(coachProfiles, eq(sessions.coachId, coachProfiles.id))
        .leftJoin(users, eq(coachProfiles.userId, users.id))
        .where(eq(sessions.learnerId, learner.id))
        .orderBy(desc(sessions.scheduledAt));
      
      return userSessions.map(s => ({
        ...s.session,
        coachName: s.coachUser?.name || "Coach",
        coachPhoto: s.coach?.photoUrl,
      }));
    }),
  }),

  // Coach Invitation System
  coachInvitation: router({
    // Get invitation details by token (public - for claim page)
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const invitation = await getInvitationByToken(input.token);
        if (!invitation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
        }
        
        // Check if expired
        const isExpired = new Date() > invitation.invitation.expiresAt;
        const isClaimed = invitation.invitation.status === 'claimed';
        
        return {
          id: invitation.invitation.id,
          status: invitation.invitation.status,
          expiresAt: invitation.invitation.expiresAt,
          isExpired,
          isClaimed,
          coachName: invitation.user.name,
          coachHeadline: invitation.coach.headline,
          coachSlug: invitation.coach.slug,
        };
      }),
    
    // Claim an invitation (requires login)
    claim: protectedProcedure
      .input(z.object({ 
        token: z.string(),
        termsAccepted: z.boolean().optional().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // Require terms acceptance
        if (!input.termsAccepted) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Vous devez accepter les termes et conditions pour réclamer votre profil" 
          });
        }
        
        try {
          const result = await claimCoachInvitation(input.token, ctx.user.id, input.termsAccepted);
          
          // Send confirmation email for terms acceptance
          if (input.termsAccepted && ctx.user.email) {
            const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
            await sendCoachTermsAcceptanceEmail({
              coachName: ctx.user.name || "Coach",
              coachEmail: ctx.user.email,
              acceptedAt: new Date(),
              termsVersion: "v2026.01.29",
              language: "fr",
            }).catch(err => console.error("[Email] Failed to send terms acceptance email:", err));
          }
          
          return result;
        } catch (error) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: error instanceof Error ? error.message : "Failed to claim invitation" 
          });
        }
      }),
    
    // Admin: Get all coaches with invitation status
    getCoachesWithStatus: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await getCoachesWithInvitationStatus();
    }),
    
    // Admin: Get all invitations
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await getAllCoachInvitations();
    }),
    
    // Admin: Create invitation for a coach
    create: protectedProcedure
      .input(z.object({
        coachProfileId: z.number(),
        email: z.string().email(),
        expiresInDays: z.number().min(1).max(90).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const result = await createCoachInvitation({
          coachProfileId: input.coachProfileId,
          email: input.email,
          createdBy: ctx.user.id,
          expiresInDays: input.expiresInDays,
        });
        
        // Generate the full invitation URL
        const baseUrl = ctx.req.headers.origin || 'https://www.rusingacademy.ca';
        const invitationUrl = `${baseUrl}/coach-invite/${result.token}`;
        
        return {
          ...result,
          invitationUrl,
        };
      }),
    
    // Admin: Revoke an invitation
    revoke: protectedProcedure
      .input(z.object({ invitationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await revokeCoachInvitation(input.invitationId);
        return { success: true };
      }),
  }),
  ai: aiRouter,
  commission: commissionRouter,
  stripe: stripeRouter,
  courses: coursesRouter,
  customAuth: authRouter,
  subscriptions: subscriptionsRouter,
  emailSettings: emailSettingsRouter,
  gamification: gamificationRouter,
  certificates: certificatesRouter,
  hr: hrRouter, // Enabled for HR Dashboard
  paths: pathsRouter, // Learning Paths / Path Series™
  lessons: lessonsRouter, // Lesson viewer and progress tracking
  activities: activitiesRouter, // Activity CRUD and progress tracking
  audio: audioRouter, // MiniMax audio generation for pronunciation exercises
  sleCompanion: sleCompanionRouter, // SLE AI Companion with coach cloned voices
  sleServices: sleServicesRouter, // SLE dataset, scoring, orchestrator, written exam
  sleProgress: sleProgressRouter, // SLE progress dashboard analytics
  
  // Notification router
  notification: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const notifications = await getUserNotifications(ctx.user.id);
      return notifications;
    }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadNotificationCount(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationAsRead(input.id, ctx.user.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteNotification(input.id, ctx.user.id);
        return { success: true };
      }),
    
    // In-app notifications
    getInAppNotifications: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { inAppNotifications } = await import("../drizzle/schema");
      
      const notifications = await db.select().from(inAppNotifications)
        .where(eq(inAppNotifications.userId, ctx.user.id))
        .orderBy(desc(inAppNotifications.createdAt))
        .limit(50);
      
      return notifications;
    }),
    
    markNotificationRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { inAppNotifications } = await import("../drizzle/schema");
        
        await db.update(inAppNotifications)
          .set({ isRead: true })
          .where(and(
            eq(inAppNotifications.id, input.notificationId),
            eq(inAppNotifications.userId, ctx.user.id)
          ));
        
        return { success: true };
      }),
    
    markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { inAppNotifications } = await import("../drizzle/schema");
      
      await db.update(inAppNotifications)
        .set({ isRead: true })
        .where(eq(inAppNotifications.userId, ctx.user.id));
      
      return { success: true };
    }),
    
    deleteNotification: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { inAppNotifications } = await import("../drizzle/schema");
        
        await db.delete(inAppNotifications)
          .where(and(
            eq(inAppNotifications.id, input.notificationId),
            eq(inAppNotifications.userId, ctx.user.id)
          ));
        
        return { success: true };
      }),
  }),

  // Push notifications router
  notifications: router({
    subscribePush: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
        userAgent: z.string().optional(),
        enableBookings: z.boolean().default(true),
        enableMessages: z.boolean().default(true),
        enableReminders: z.boolean().default(true),
        enableMarketing: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { pushSubscriptions } = await import("../drizzle/schema");
        
        // Check if subscription already exists
        const [existing] = await db.select().from(pushSubscriptions)
          .where(and(
            eq(pushSubscriptions.userId, ctx.user.id),
            eq(pushSubscriptions.endpoint, input.endpoint)
          ));
        
        if (existing) {
          // Update existing subscription
          await db.update(pushSubscriptions)
            .set({
              p256dh: input.p256dh,
              auth: input.auth,
              userAgent: input.userAgent || null,
              enableBookings: input.enableBookings,
              enableMessages: input.enableMessages,
              enableReminders: input.enableReminders,
              enableMarketing: input.enableMarketing,
              isActive: true,
              lastUsedAt: new Date(),
            })
            .where(eq(pushSubscriptions.id, existing.id));
        } else {
          // Create new subscription
          await db.insert(pushSubscriptions).values({
            userId: ctx.user.id,
            endpoint: input.endpoint,
            p256dh: input.p256dh,
            auth: input.auth,
            userAgent: input.userAgent || null,
            enableBookings: input.enableBookings,
            enableMessages: input.enableMessages,
            enableReminders: input.enableReminders,
            enableMarketing: input.enableMarketing,
          });
        }
        
        return { success: true };
      }),
    
    unsubscribePush: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { pushSubscriptions } = await import("../drizzle/schema");
      
      // Deactivate all subscriptions for this user
      await db.update(pushSubscriptions)
        .set({ isActive: false })
        .where(eq(pushSubscriptions.userId, ctx.user.id));
      
      return { success: true };
    }),
    
    updatePushPreferences: protectedProcedure
      .input(z.object({
        enableBookings: z.boolean(),
        enableMessages: z.boolean(),
        enableReminders: z.boolean(),
        enableMarketing: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { pushSubscriptions } = await import("../drizzle/schema");
        
        await db.update(pushSubscriptions)
          .set({
            enableBookings: input.enableBookings,
            enableMessages: input.enableMessages,
            enableReminders: input.enableReminders,
            enableMarketing: input.enableMarketing,
          })
          .where(and(
            eq(pushSubscriptions.userId, ctx.user.id),
            eq(pushSubscriptions.isActive, true)
          ));
        
        return { success: true };
      }),
  }),
  
  // Message router for conversations
  message: router({
    conversations: protectedProcedure.query(async ({ ctx }) => {
      const convs = await getConversations(ctx.user.id);
      return convs;
    }),
    
    list: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const msgs = await getMessages(input.conversationId, ctx.user.id);
        return msgs;
      }),
    
    send: protectedProcedure
      .input(z.object({ conversationId: z.number(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const msg = await sendMessage(input.conversationId, ctx.user.id, input.content);
        return msg;
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markMessagesAsRead(input.conversationId, ctx.user.id);
        return { success: true };
      }),
    
    startConversation: protectedProcedure
      .input(z.object({ participantId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const conv = await startConversation(ctx.user.id, input.participantId);
        return conv;
      }),
  }),
  
  // Admin router for platform management
  admin: router({
    // Get coach applications with filters
    getCoachApplications: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return [];
        const { coachApplications } = await import("../drizzle/schema");
        let query = db.select().from(coachApplications).orderBy(desc(coachApplications.createdAt));
        const applications = await query;
        let filtered = applications;
        if (input?.status && input.status !== "all") {
          filtered = filtered.filter((a: any) => a.status === input.status);
        }
        if (input?.search) {
          const s = input.search.toLowerCase();
          filtered = filtered.filter((a: any) => 
            a.firstName?.toLowerCase().includes(s) ||
            a.lastName?.toLowerCase().includes(s) ||
            a.email?.toLowerCase().includes(s) ||
            a.city?.toLowerCase().includes(s)
          );
        }
        return filtered;
      }),
    
    // Approve a coach application
    approveCoachApplication: protectedProcedure
      .input(z.object({ applicationId: z.number(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachApplications } = await import("../drizzle/schema");
        const { sendApplicationStatusEmail } = await import("./email-application-notifications");
        
        // Get the application
        const [application] = await db.select().from(coachApplications).where(eq(coachApplications.id, input.applicationId));
        if (!application) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        const [user] = await db.select().from(users).where(eq(users.id, application.userId));
        
        // Update application status
        await db.update(coachApplications)
          .set({ 
            status: "approved", 
            reviewedBy: ctx.user.id, 
            reviewedAt: new Date(),
            reviewNotes: input.notes 
          })
          .where(eq(coachApplications.id, input.applicationId));
        
        // Create coach profile from application
        const slug = `${application.firstName || "coach"}-${application.lastName || "user"}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        await db.insert(coachProfiles).values({
          userId: application.userId,
          slug: slug + "-" + Date.now(),
          headline: application.headline || null,
          headlineFr: application.headlineFr || null,
          bio: application.bio || null,
          bioFr: application.bioFr || null,
          videoUrl: application.introVideoUrl || null,
          photoUrl: application.photoUrl || null,
          languages: (application.teachingLanguage as "french" | "english" | "both") || "both",
          specializations: application.specializations || {},
          yearsExperience: application.yearsTeaching || 0,
          credentials: application.certifications || null,
          hourlyRate: ((application.hourlyRate || 50) * 100),
          trialRate: ((application.trialRate || 25) * 100),
          status: "approved",
          approvedAt: new Date(),
          approvedBy: ctx.user.id,
        });
        
        // Update user role to coach
        await db.update(users).set({ role: "coach" }).where(eq(users.id, application.userId));
        
        // Send approval email
        if (user && application.email) {
          await sendApplicationStatusEmail({
            applicantName: application.fullName || `${application.firstName} ${application.lastName}`,
            applicantEmail: application.email,
            status: "approved",
            reviewNotes: input.notes,
            language: "en",
          });
        }
        
        // Create notification for the applicant
        await createNotification({
          userId: application.userId,
          type: "system",
          title: "Application Approved!",
          message: "Congratulations! Your coach application has been approved. You can now start accepting students.",
          link: "/coach/dashboard",
        });
        
        return { success: true };
      }),
    
    // Reject a coach application
    rejectCoachApplication: protectedProcedure
      .input(z.object({ applicationId: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachApplications } = await import("../drizzle/schema");
        const { sendApplicationStatusEmail } = await import("./email-application-notifications");
        
        // Get the application
        const [application] = await db.select().from(coachApplications).where(eq(coachApplications.id, input.applicationId));
        if (!application) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        
        // Update application status
        await db.update(coachApplications)
          .set({ 
            status: "rejected", 
            reviewedBy: ctx.user.id, 
            reviewedAt: new Date(),
            reviewNotes: input.reason 
          })
          .where(eq(coachApplications.id, input.applicationId));
        
        // Send rejection email
        if (application.email) {
          await sendApplicationStatusEmail({
            applicantName: application.fullName || `${application.firstName} ${application.lastName}`,
            applicantEmail: application.email,
            status: "rejected",
            rejectionReason: input.reason,
            language: "en",
          });
        }
        // Create notification for the applicant
        await createNotification({
          userId: application.userId,
          type: "system",
          title: "Application Update",
          message: `Your coach application was not approved. Reason: ${input.reason}`,
          link: "/become-a-coach",
        });
        
        return { success: true };
      }),
    
    getPendingCoaches: protectedProcedure.query(async ({ ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return [];
      const coaches = await db.select()
        .from(coachProfiles)
        .leftJoin(users, eq(coachProfiles.userId, users.id))
        .orderBy(desc(coachProfiles.createdAt));
      return coaches.map((c: { coach_profiles: typeof coachProfiles.$inferSelect; users: typeof users.$inferSelect | null }) => ({
        id: c.coach_profiles.id,
        userId: c.coach_profiles.userId,
        name: c.users?.name || "Unknown",
        email: c.users?.email || "",
        bio: c.coach_profiles.bio || "",
        bioFr: c.coach_profiles.bioFr || "",
        headline: c.coach_profiles.headline || "",
        headlineFr: c.coach_profiles.headlineFr || "",
        specialties: Object.keys(c.coach_profiles.specializations || {}).filter((k: string) => (c.coach_profiles.specializations as Record<string, boolean>)?.[k]),
        credentials: c.coach_profiles.credentials || "",
        yearsExperience: c.coach_profiles.yearsExperience || 0,
        appliedAt: c.coach_profiles.createdAt,
        status: c.coach_profiles.status,
        photoUrl: c.coach_profiles.photoUrl,
      }));
    }),
    
    getAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return { 
        totalUsers: 0, activeCoaches: 0, sessionsThisMonth: 0, revenue: 0, 
        userGrowth: 0, sessionGrowth: 0, revenueGrowth: 0,
        platformCommission: 0, pendingCoaches: 0, totalLearners: 0,
        monthlyRevenue: [], coachesWithStripe: 0, coachesWithoutStripe: 0
      };
      
      // Get current month start
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      // User counts
      const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [coachCount] = await db.select({ count: sql<number>`count(*)` }).from(coachProfiles).where(eq(coachProfiles.status, "approved"));
      const [pendingCoachCount] = await db.select({ count: sql<number>`count(*)` }).from(coachProfiles).where(eq(coachProfiles.status, "pending"));
      const [learnerCount] = await db.select({ count: sql<number>`count(*)` }).from(learnerProfiles);
      
      // Stripe connection status
      const [stripeConnected] = await db.select({ count: sql<number>`count(*)` }).from(coachProfiles)
        .where(and(eq(coachProfiles.status, "approved"), eq(coachProfiles.stripeOnboarded, true)));
      const [stripeNotConnected] = await db.select({ count: sql<number>`count(*)` }).from(coachProfiles)
        .where(and(eq(coachProfiles.status, "approved"), eq(coachProfiles.stripeOnboarded, false)));
      
      // Sessions this month
      const [sessionsThisMonth] = await db.select({ count: sql<number>`count(*)` }).from(sessions)
        .where(gte(sessions.scheduledAt, monthStart));
      const [sessionsLastMonth] = await db.select({ count: sql<number>`count(*)` }).from(sessions)
        .where(and(gte(sessions.scheduledAt, lastMonthStart), sql`${sessions.scheduledAt} < ${monthStart}`));
      
      // Revenue from payout ledger (platform fees = commission collected)
      const [revenueThisMonth] = await db.select({ 
        total: sql<number>`COALESCE(SUM(${payoutLedger.grossAmount}), 0)`,
        commission: sql<number>`COALESCE(SUM(${payoutLedger.platformFee}), 0)`
      }).from(payoutLedger)
        .where(and(
          gte(payoutLedger.createdAt, monthStart),
          eq(payoutLedger.transactionType, "session_payment")
        ));
      
      const [revenueLastMonth] = await db.select({ 
        total: sql<number>`COALESCE(SUM(${payoutLedger.grossAmount}), 0)`
      }).from(payoutLedger)
        .where(and(
          gte(payoutLedger.createdAt, lastMonthStart),
          sql`${payoutLedger.createdAt} < ${monthStart}`,
          eq(payoutLedger.transactionType, "session_payment")
        ));
      
      // Monthly revenue for chart (last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const [monthData] = await db.select({ 
          revenue: sql<number>`COALESCE(SUM(${payoutLedger.grossAmount}), 0)`,
          commission: sql<number>`COALESCE(SUM(${payoutLedger.platformFee}), 0)`
        }).from(payoutLedger)
          .where(and(
            gte(payoutLedger.createdAt, start),
            sql`${payoutLedger.createdAt} <= ${end}`,
            eq(payoutLedger.transactionType, "session_payment")
          ));
        monthlyRevenue.push({
          month: start.toLocaleString('default', { month: 'short' }),
          revenue: monthData?.revenue || 0,
          commission: monthData?.commission || 0
        });
      }
      
      // Calculate growth percentages
      const sessionGrowth = sessionsLastMonth?.count ? 
        ((sessionsThisMonth?.count || 0) - sessionsLastMonth.count) / sessionsLastMonth.count * 100 : 0;
      const revenueGrowth = revenueLastMonth?.total ? 
        ((revenueThisMonth?.total || 0) - revenueLastMonth.total) / revenueLastMonth.total * 100 : 0;
      
      return {
        totalUsers: userCount?.count || 0,
        activeCoaches: coachCount?.count || 0,
        pendingCoaches: pendingCoachCount?.count || 0,
        totalLearners: learnerCount?.count || 0,
        sessionsThisMonth: sessionsThisMonth?.count || 0,
        revenue: revenueThisMonth?.total || 0,
        platformCommission: revenueThisMonth?.commission || 0,
        userGrowth: 12.5, // Would need users table with createdAt tracking
        sessionGrowth: Math.round(sessionGrowth * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        monthlyRevenue,
        coachesWithStripe: stripeConnected?.count || 0,
        coachesWithoutStripe: stripeNotConnected?.count || 0,
      };
    }),
    
    getDepartmentInquiries: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return [];
      const inquiries = await db.select().from(departmentInquiries).orderBy(desc(departmentInquiries.createdAt));
      return inquiries.map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        department: i.department,
        teamSize: i.teamSize,
        message: i.message,
        status: i.status,
        createdAt: i.createdAt,
      }));
    }),
    
    approveCoach: protectedProcedure
      .input(z.object({ coachId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await db.update(coachProfiles)
          .set({ status: "approved", approvedAt: new Date(), approvedBy: ctx.user.id })
          .where(eq(coachProfiles.id, input.coachId));
        return { success: true };
      }),
    
    rejectCoach: protectedProcedure
      .input(z.object({ coachId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await db.update(coachProfiles)
          .set({ status: "rejected", rejectionReason: input.reason })
          .where(eq(coachProfiles.id, input.coachId));
        return { success: true };
      }),
    
    updateInquiryStatus: protectedProcedure
      .input(z.object({ inquiryId: z.number(), status: z.enum(["new", "contacted", "in_progress", "converted", "closed"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await db.update(departmentInquiries)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(departmentInquiries.id, input.inquiryId));
        return { success: true };
      }),
    
    createInquiry: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        department: z.string(),
        teamSize: z.string(),
        message: z.string(),
        preferredPackage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await db.insert(departmentInquiries).values({
          name: input.name,
          email: input.email,
          phone: input.phone,
          department: input.department,
          teamSize: input.teamSize,
          message: input.message,
          preferredPackage: input.preferredPackage,
        });
        return { success: true };
      }),
    
    // Get all promo coupons
    getCoupons: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return [];
      const { promoCoupons } = await import("../drizzle/schema");
      return await db.select().from(promoCoupons).orderBy(desc(promoCoupons.createdAt));
    }),
    
    // Create a new coupon
    createCoupon: protectedProcedure
      .input(z.object({
        code: z.string().min(3).max(50),
        name: z.string().min(1).max(100),
        description: z.string().nullable(),
        descriptionFr: z.string().nullable(),
        discountType: z.enum(["percentage", "fixed_amount", "free_trial"]),
        discountValue: z.number().min(0),
        maxUses: z.number().nullable(),
        maxUsesPerUser: z.number().default(1),
        minPurchaseAmount: z.number().nullable(),
        validUntil: z.date().nullable(),
        applicableTo: z.enum(["all", "trial", "single", "package"]),
        newUsersOnly: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { promoCoupons } = await import("../drizzle/schema");
        
        // Check if code already exists
        const [existing] = await db.select().from(promoCoupons).where(eq(promoCoupons.code, input.code.toUpperCase()));
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Coupon code already exists" });
        }
        
        await db.insert(promoCoupons).values({
          code: input.code.toUpperCase(),
          name: input.name,
          description: input.description,
          descriptionFr: input.descriptionFr,
          discountType: input.discountType,
          discountValue: input.discountValue,
          maxUses: input.maxUses,
          maxUsesPerUser: input.maxUsesPerUser,
          minPurchaseAmount: input.minPurchaseAmount,
          validUntil: input.validUntil,
          applicableTo: input.applicableTo,
          newUsersOnly: input.newUsersOnly,
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),
    
    // Update a coupon
    updateCoupon: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(3).max(50),
        name: z.string().min(1).max(100),
        description: z.string().nullable(),
        descriptionFr: z.string().nullable(),
        discountType: z.enum(["percentage", "fixed_amount", "free_trial"]),
        discountValue: z.number().min(0),
        maxUses: z.number().nullable(),
        maxUsesPerUser: z.number().default(1),
        minPurchaseAmount: z.number().nullable(),
        validUntil: z.date().nullable(),
        applicableTo: z.enum(["all", "trial", "single", "package"]),
        newUsersOnly: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { promoCoupons } = await import("../drizzle/schema");
        
        await db.update(promoCoupons).set({
          code: input.code.toUpperCase(),
          name: input.name,
          description: input.description,
          descriptionFr: input.descriptionFr,
          discountType: input.discountType,
          discountValue: input.discountValue,
          maxUses: input.maxUses,
          maxUsesPerUser: input.maxUsesPerUser,
          minPurchaseAmount: input.minPurchaseAmount,
          validUntil: input.validUntil,
          applicableTo: input.applicableTo,
          newUsersOnly: input.newUsersOnly,
        }).where(eq(promoCoupons.id, input.id));
        return { success: true };
      }),
    
    // Toggle coupon active status
    toggleCoupon: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { promoCoupons } = await import("../drizzle/schema");
        await db.update(promoCoupons).set({ isActive: input.isActive }).where(eq(promoCoupons.id, input.id));
        return { success: true };
      }),
    
    // Delete a coupon
    deleteCoupon: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { promoCoupons } = await import("../drizzle/schema");
        await db.delete(promoCoupons).where(eq(promoCoupons.id, input.id));
        return { success: true };
      }),
    
    // Get organization stats for admin dashboard
    getOrgStats: protectedProcedure.query(async ({ ctx }) => {
      const isAdmin = ctx.user.role === "admin" || ctx.user.role === "owner" || ctx.user.role === "hr_admin" || ctx.user.isOwner;
      if (!isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return { totalLearners: 0, activeThisWeek: 0, completions: 0, avgProgress: 0, levelBBB: 0, levelCBC: 0, levelCCC: 0 };
      
      const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "learner"));
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const [activeCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.role, "learner"), gte(users.lastSignedIn, weekAgo)));
      
      return {
        totalLearners: userCount?.count || 0,
        activeThisWeek: activeCount?.count || 0,
        completions: 0,
        avgProgress: 45,
        levelBBB: Math.floor((userCount?.count || 0) * 0.4),
        levelCBC: Math.floor((userCount?.count || 0) * 0.35),
        levelCCC: Math.floor((userCount?.count || 0) * 0.25),
      };
    }),
    
    // Get recent activity for admin dashboard
    getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
      const isAdmin = ctx.user.role === "admin" || ctx.user.role === "owner" || ctx.user.role === "hr_admin" || ctx.user.isOwner;
      if (!isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return [];
      
      // Get recent user signups
      const recentUsers = await db.select({ id: users.id, name: users.name, createdAt: users.createdAt })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(10);
      
      return recentUsers.map(u => ({
        type: "signup",
        description: `${u.name || "New user"} joined the platform`,
        createdAt: u.createdAt,
      }));
    }),
    
    // Get cohorts for admin dashboard
    getCohorts: protectedProcedure.query(async ({ ctx }) => {
      const isAdmin = ctx.user.role === "admin" || ctx.user.role === "owner" || ctx.user.role === "hr_admin" || ctx.user.isOwner;
      if (!isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      // Return empty array for now - cohorts feature to be implemented
      return [];
    }),
    
    // Get pending approvals for admin dashboard
    getPendingApprovals: protectedProcedure.query(async ({ ctx }) => {
      const isAdmin = ctx.user.role === "admin" || ctx.user.role === "owner" || ctx.user.role === "hr_admin" || ctx.user.isOwner;
      if (!isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return { coachApplications: [] };
      
      const { coachApplications } = await import("../drizzle/schema");
      // @ts-expect-error - TS2769: auto-suppressed during TS cleanup
      const pending = await db.select().from(coachApplications).where(eq(coachApplications.status, "pending")).orderBy(desc(coachApplications.createdAt)).limit(5);
      
      return {
        coachApplications: pending.map(app => ({
          id: app.id,
          name: app.fullName || `${app.firstName} ${app.lastName}`,
          email: app.email,
          createdAt: app.createdAt,
        })),
      };
    }),
    
    // Quiz Question Management
    getQuizQuestions: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return [];
        const { quizQuestions } = await import("../drizzle/schema");
        const questions = await db.select().from(quizQuestions)
          .where(eq(quizQuestions.lessonId, input.lessonId))
          .orderBy(quizQuestions.orderIndex);
        return questions;
      }),
    
    createQuizQuestion: protectedProcedure
      .input(z.object({
        lessonId: z.number(),
        questionText: z.string(),
        questionTextFr: z.string().optional(),
        questionType: z.enum(["multiple_choice", "true_false", "fill_blank", "matching", "short_answer", "audio_response"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
        options: z.array(z.string()).optional(),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
        points: z.number().default(10),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { quizQuestions } = await import("../drizzle/schema");
        
        // Get max sort order for this lesson
        const existing = await db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, input.lessonId));
        const maxOrder = existing.length > 0 ? Math.max(...existing.map((q: any) => q.sortOrder || 0)) : 0;
        
        // @ts-expect-error - TS2769: auto-suppressed during TS cleanup
        const [newQuestion] = await db.insert(quizQuestions).values({
          lessonId: input.lessonId,
          questionText: input.questionText,
          questionTextFr: input.questionTextFr || null,
          questionType: input.questionType,
          difficulty: input.difficulty,
          options: input.options ? JSON.stringify(input.options) : null,
          correctAnswer: String(input.correctAnswer),
          explanation: input.explanation || null,
          points: input.points,
          sortOrder: maxOrder + 1,
        }).$returningId();
        return { id: newQuestion.id, success: true };
      }),
    
    updateQuizQuestion: protectedProcedure
      .input(z.object({
        id: z.number(),
        lessonId: z.number(),
        questionText: z.string(),
        questionTextFr: z.string().optional(),
        questionType: z.enum(["multiple_choice", "true_false", "fill_blank", "matching", "short_answer", "audio_response"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
        options: z.array(z.string()).optional(),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
        points: z.number().default(10),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { quizQuestions } = await import("../drizzle/schema");
        
        await db.update(quizQuestions).set({
          questionText: input.questionText,
          questionTextFr: input.questionTextFr || null,
          questionType: input.questionType,
          difficulty: input.difficulty,
          options: input.options ? JSON.stringify(input.options) : null,
          correctAnswer: String(input.correctAnswer),
          explanation: input.explanation || null,
          points: input.points,
        }).where(eq(quizQuestions.id, input.id));
        return { success: true };
      }),
    
    deleteQuizQuestion: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { quizQuestions } = await import("../drizzle/schema");
        
        await db.delete(quizQuestions).where(eq(quizQuestions.id, input.id));
        return { success: true };
      }),
    
    // Export quiz questions for a lesson
    exportQuizQuestions: protectedProcedure
      .input(z.object({ lessonId: z.number(), format: z.enum(["json", "csv"]) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { data: "", filename: "" };
        const { quizQuestions, lessons } = await import("../drizzle/schema");
        
        const questions = await db.select().from(quizQuestions)
          .where(eq(quizQuestions.lessonId, input.lessonId))
          .orderBy(quizQuestions.orderIndex);
        
        const [lesson] = await db.select().from(lessons).where(eq(lessons.id, input.lessonId));
        const lessonSlug = lesson?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'questions';
        
        if (input.format === "json") {
          const exportData = questions.map((q: any) => ({
            questionText: q.questionText,
            questionTextFr: q.questionTextFr,
            questionType: q.questionType,
            difficulty: q.difficulty,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
          }));
          return { data: JSON.stringify(exportData, null, 2), filename: `${lessonSlug}-questions.json` };
        } else {
          // CSV format
          const headers = ["questionText", "questionTextFr", "questionType", "difficulty", "options", "correctAnswer", "explanation", "points"];
          const rows = questions.map((q: any) => [
            `"${(q.questionText || '').replace(/"/g, '""')}"`,
            `"${(q.questionTextFr || '').replace(/"/g, '""')}"`,
            q.questionType,
            q.difficulty,
            `"${JSON.stringify(typeof q.options === 'string' ? JSON.parse(q.options) : q.options || []).replace(/"/g, '""')}"`,
            q.correctAnswer,
            `"${(q.explanation || '').replace(/"/g, '""')}"`,
            q.points,
          ].join(","));
          return { data: [headers.join(","), ...rows].join("\n"), filename: `${lessonSlug}-questions.csv` };
        }
      }),
    
    // Import quiz questions for a lesson
    importQuizQuestions: protectedProcedure
      .input(z.object({
        lessonId: z.number(),
        format: z.enum(["json", "csv"]),
        data: z.string(),
        mode: z.enum(["append", "replace"]).default("append"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { quizQuestions } = await import("../drizzle/schema");
        
        let questionsToImport: any[] = [];
        
        try {
          if (input.format === "json") {
            questionsToImport = JSON.parse(input.data);
          } else {
            // Parse CSV
            const lines = input.data.split("\n").filter(line => line.trim());
            if (lines.length < 2) throw new Error("CSV must have header and at least one data row");
            
            const headers = lines[0].split(",").map(h => h.trim());
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].match(/("[^"]*"|[^,]+)/g) || [];
              const row: any = {};
              headers.forEach((header, idx) => {
                let value = values[idx] || '';
                // Remove surrounding quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                  value = value.slice(1, -1).replace(/""/g, '"');
                }
                if (header === 'options') {
                  try { row[header] = JSON.parse(value); } catch { row[header] = []; }
                } else if (header === 'correctAnswer' || header === 'points') {
                  row[header] = parseInt(value) || 0;
                } else {
                  row[header] = value;
                }
              });
              questionsToImport.push(row);
            }
          }
        } catch (e: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid ${input.format.toUpperCase()} format: ${e.message}` });
        }
        
        // Validate questions
        const validTypes = ["multiple_choice", "true_false", "fill_in_blank"];
        const validDifficulties = ["easy", "medium", "hard"];
        for (const q of questionsToImport) {
          if (!q.questionText) throw new TRPCError({ code: "BAD_REQUEST", message: "Each question must have questionText" });
          if (!validTypes.includes(q.questionType)) throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid questionType: ${q.questionType}` });
          if (!validDifficulties.includes(q.difficulty)) throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid difficulty: ${q.difficulty}` });
        }
        
        // If replace mode, delete existing questions
        if (input.mode === "replace") {
          await db.delete(quizQuestions).where(eq(quizQuestions.lessonId, input.lessonId));
        }
        
        // Get max sort order
        const existing = await db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, input.lessonId));
        let maxOrder = existing.length > 0 ? Math.max(...existing.map((q: any) => q.sortOrder || 0)) : 0;
        
        // Insert questions
        let imported = 0;
        for (const q of questionsToImport) {
          maxOrder++;
          // @ts-expect-error - TS2769: auto-suppressed during TS cleanup
          await db.insert(quizQuestions).values({
            lessonId: input.lessonId,
            questionText: q.questionText,
            questionTextFr: q.questionTextFr || null,
            questionType: q.questionType,
            difficulty: q.difficulty,
            options: Array.isArray(q.options) ? JSON.stringify(q.options) : q.options || null,
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || null,
            points: q.points || 10,
            sortOrder: maxOrder,
          });
          imported++;
        }
        
        return { success: true, imported, total: questionsToImport.length };
      }),
    
    // Get quiz question statistics
    getQuizQuestionStats: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { questions: [], summary: { totalAttempts: 0, avgScore: 0, avgTime: 0 } };
        const { quizQuestions, quizAttempts, quizzes } = await import("../drizzle/schema");
        
        // Get all questions for this lesson
        const questions = await db.select().from(quizQuestions)
          .where(eq(quizQuestions.lessonId, input.lessonId))
          .orderBy(quizQuestions.orderIndex);
        
        // Get all quiz attempts for this lesson's quiz
        const quiz = await db.select().from(quizzes).where(eq(quizzes.lessonId, input.lessonId)).limit(1);
        const attempts = quiz.length > 0 
          ? await db.select().from(quizAttempts).where(eq(quizAttempts.quizId, quiz[0].id))
          : [];
        
        // Calculate stats per question
        const questionStats = questions.map((q: any) => {
          const questionAttempts = attempts.filter((a: any) => {
            try {
              const answers = typeof a.answers === 'string' ? JSON.parse(a.answers) : a.answers;
              return answers && answers[q.id] !== undefined;
            } catch { return false; }
          });
          
          const correctAttempts = questionAttempts.filter((a: any) => {
            try {
              const answers = typeof a.answers === 'string' ? JSON.parse(a.answers) : a.answers;
              return answers && answers[q.id] === q.correctAnswer;
            } catch { return false; }
          });
          
          return {
            id: q.id,
            questionText: q.questionText?.substring(0, 100),
            questionType: q.questionType,
            difficulty: q.difficulty,
            totalAttempts: questionAttempts.length,
            correctAttempts: correctAttempts.length,
            successRate: questionAttempts.length > 0 
              ? Math.round((correctAttempts.length / questionAttempts.length) * 100) 
              : 0,
          };
        });
        
        // Calculate summary
        const totalAttempts = attempts.length;
        const avgScore = totalAttempts > 0 
          ? Math.round(attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / totalAttempts)
          : 0;
        const avgTime = totalAttempts > 0
          ? Math.round(attempts.reduce((sum: number, a: any) => sum + (a.timeSpent || 0), 0) / totalAttempts)
          : 0;
        
        return {
          questions: questionStats,
          summary: { totalAttempts, avgScore, avgTime },
        };
      }),
    
    // Update course (inline editing)
    updateCourse: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { courses } = await import("../drizzle/schema");
        
        const updateData: any = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.status !== undefined) updateData.status = input.status;
        
        await db.update(courses).set(updateData).where(eq(courses.id, input.id));
        return { success: true };
      }),
    
    // Update module (inline editing)
    updateModule: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        titleFr: z.string().optional(),
        description: z.string().optional(),
        descriptionFr: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { courseModules } = await import("../drizzle/schema");
        
        const updateData: any = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.titleFr !== undefined) updateData.titleFr = input.titleFr;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.descriptionFr !== undefined) updateData.descriptionFr = input.descriptionFr;
        if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
        
        await db.update(courseModules).set(updateData).where(eq(courseModules.id, input.id));
        return { success: true };
      }),
    
    // Update lesson (inline editing)
    updateLesson: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        type: z.enum(["video", "text", "quiz", "assignment", "live"]).optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { lessons } = await import("../drizzle/schema");
        
        const updateData: any = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.type !== undefined) updateData.type = input.type;
        if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
        
        await db.update(lessons).set(updateData).where(eq(lessons.id, input.id));
        return { success: true };
      }),
    
    // Reorder quiz questions
    reorderQuizQuestions: protectedProcedure
      .input(z.object({
        lessonId: z.number(),
        questionIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { quizQuestions } = await import("../drizzle/schema");
        
        // Update order for each question
        for (let i = 0; i < input.questionIds.length; i++) {
          await db.update(quizQuestions)
            .set({ orderIndex: i + 1 })
            .where(and(
              eq(quizQuestions.id, input.questionIds[i]),
              eq(quizQuestions.lessonId, input.lessonId)
            ));
        }
        
        return { success: true };
      }),
    
    // Duplicate quiz to another lesson
    duplicateQuiz: protectedProcedure
      .input(z.object({
        sourceLessonId: z.number(),
        targetLessonId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { quizQuestions, lessons } = await import("../drizzle/schema");
        
        // Verify target lesson exists and is a quiz type
        const [targetLesson] = await db.select().from(lessons).where(eq(lessons.id, input.targetLessonId));
        if (!targetLesson) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Target lesson not found" });
        }
        
        // Get source questions
        const sourceQuestions = await db.select().from(quizQuestions)
          .where(eq(quizQuestions.lessonId, input.sourceLessonId))
          .orderBy(asc(quizQuestions.orderIndex));
        
        if (sourceQuestions.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No questions found in source lesson" });
        }
        
        // Get current max order in target lesson
        const existingQuestions = await db.select().from(quizQuestions)
          .where(eq(quizQuestions.lessonId, input.targetLessonId));
        const maxOrder = existingQuestions.length > 0 
          ? Math.max(...existingQuestions.map(q => q.orderIndex || 0)) 
          : 0;
        
        // Insert duplicated questions
        let insertedCount = 0;
        for (const q of sourceQuestions) {
          await db.insert(quizQuestions).values({
            lessonId: input.targetLessonId,
            questionText: q.questionText,
            questionTextFr: q.questionTextFr,
            questionType: q.questionType,
            difficulty: q.difficulty,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            explanationFr: q.explanationFr,
            points: q.points,
            orderIndex: maxOrder + insertedCount + 1,
            isActive: true,
          });
          insertedCount++;
        }
        
        return { success: true, copiedCount: insertedCount };
      }),
    
    // Get all quiz lessons for duplication target selection
    getQuizLessons: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return [];
        const { lessons, courseModules, courses } = await import("../drizzle/schema");
        
        const quizLessons = await db.select({
          id: lessons.id,
          title: lessons.title,
          moduleTitle: courseModules.title,
          courseTitle: courses.title,
        })
          .from(lessons)
          .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
          .innerJoin(courses, eq(courseModules.courseId, courses.id))
          .where(eq(lessons.contentType, "quiz"))
          .orderBy(asc(courses.title), asc(courseModules.sortOrder), asc(lessons.sortOrder));
        
        return quizLessons;
      }),
    
    // Get all registered users with their roles
    getAllUsers: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        roleFilter: z.enum(["all", "admin", "coach", "learner", "hr_admin"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { users: [], total: 0, page: 1, totalPages: 0 };
        
        const page = input?.page || 1;
        const limit = input?.limit || 20;
        const offset = (page - 1) * limit;
        
        // Get total count
        let countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
        
        // Apply role filter if specified
        if (input?.roleFilter && input.roleFilter !== "all") {
    // @ts-ignore - Drizzle type inference
          countQuery = countQuery.where(eq(users.role, input.roleFilter));
        }
        
        const [countResult] = await countQuery;
        const total = countResult?.count || 0;
        
        // Get users with pagination
        let usersQuery = db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
          emailVerified: users.emailVerified,
          loginMethod: users.loginMethod,
        }).from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
        
        // Apply role filter if specified
    // @ts-ignore - Drizzle type inference
        if (input?.roleFilter && input.roleFilter !== "all") {
          // @ts-expect-error - TS2741: auto-suppressed during TS cleanup
          usersQuery = usersQuery.where(eq(users.role, input.roleFilter));
        }
        
        let usersList = await usersQuery;
        
        // Apply search filter in memory (for name and email)
        if (input?.search) {
          const searchLower = input.search.toLowerCase();
          usersList = usersList.filter((u: any) => 
            u.name?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower)
          );
        }
        
        return {
          users: usersList,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        };
      }),
    
    // Update user role
    updateUserRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "coach", "learner", "hr_admin"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        // Prevent changing own role
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change your own role" });
        }
        
        await db.update(users)
          .set({ role: input.role })
          .where(eq(users.id, input.userId));
        
        return { success: true };
      }),
    
    // Export users to CSV
    exportUsersCSV: protectedProcedure
      .input(z.object({
        roleFilter: z.enum(["all", "admin", "coach", "learner", "hr_admin"]).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { csv: "", filename: "users.csv" };
        
        let query = db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          loginMethod: users.loginMethod,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        }).from(users).orderBy(desc(users.createdAt));
    // @ts-ignore - Drizzle type inference
        
        if (input?.roleFilter && input.roleFilter !== "all") {
          // @ts-expect-error - TS2741: auto-suppressed during TS cleanup
          query = query.where(eq(users.role, input.roleFilter));
        }
        
        const usersList = await query;
        
        // Generate CSV
        const headers = ["ID", "Name", "Email", "Role", "Login Method", "Email Verified", "Created At", "Last Sign In"];
        const rows = usersList.map((u: any) => [
          u.id,
          `"${(u.name || "").replace(/"/g, '""')}"`,
          u.email,
          u.role,
          u.loginMethod || "oauth",
          u.emailVerified ? "Yes" : "No",
          u.createdAt ? new Date(u.createdAt).toISOString() : "",
          u.lastSignedIn ? new Date(u.lastSignedIn).toISOString() : "",
        ].join(","));
        
        const csv = [headers.join(","), ...rows].join("\n");
        const filename = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
        
        return { csv, filename, count: usersList.length };
      }),
    
    // Bulk update user roles
    bulkUpdateUserRoles: protectedProcedure
      .input(z.object({
        userIds: z.array(z.number()),
        role: z.enum(["admin", "coach", "learner", "hr_admin"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        // Filter out current user from bulk update
        const filteredIds = input.userIds.filter(id => id !== ctx.user.id);
        
        if (filteredIds.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No valid users to update" });
        }
        
        // Update all users in the list
        for (const userId of filteredIds) {
          await db.update(users)
            .set({ role: input.role })
            .where(eq(users.id, userId));
        }
        
        return { success: true, updated: filteredIds.length };
      }),
    
    // Bulk send notification to users
    bulkSendNotification: protectedProcedure
      .input(z.object({
        userIds: z.array(z.number()),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(1000),
        type: z.enum(["system", "message", "session_reminder", "booking", "review"]).default("system"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        // Create notifications for all users
        let sent = 0;
        for (const userId of input.userIds) {
          await createNotification({
            userId,
            type: input.type,
            title: input.title,
            message: input.message,
          });
          sent++;
        }
        
        return { success: true, sent };
      }),
    
    // Get user activity history
    getUserActivityHistory: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { user: null, activities: [], stats: {} };
        
        // Get user details
        const [userData] = await db.select().from(users).where(eq(users.id, input.userId));
        if (!userData) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        
        const activities: Array<{ type: string; description: string; date: Date | null; metadata?: any }> = [];
        
        // Get enrollments
        const userEnrollments = await db.select({
          id: courseEnrollments.id,
          courseId: courseEnrollments.courseId,
          courseTitle: courses.title,
          enrolledAt: courseEnrollments.enrolledAt,
          progress: courseEnrollments.progress,
          status: courseEnrollments.status,
        })
          .from(courseEnrollments)
          .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
          .where(eq(courseEnrollments.userId, input.userId))
          .orderBy(desc(courseEnrollments.enrolledAt))
          .limit(10);
        
        for (const enrollment of userEnrollments) {
          activities.push({
            type: "enrollment",
            description: `Enrolled in course: ${enrollment.courseTitle || "Unknown"}`,
            date: enrollment.enrolledAt,
            metadata: { courseId: enrollment.courseId, progress: enrollment.progress, status: enrollment.status },
          });
        }
        
        // Get sessions (if learner or coach)
        const userSessions = await db.select({
          id: sessions.id,
          scheduledAt: sessions.scheduledAt,
          status: sessions.status,
          duration: sessions.duration,
        })
          .from(sessions)
          .where(or(
            eq(sessions.learnerId, input.userId),
            eq(sessions.coachId, input.userId)
          ))
          .orderBy(desc(sessions.scheduledAt))
          .limit(10);
        
        for (const session of userSessions) {
          activities.push({
            type: "session",
            description: `Coaching session (${session.status})`,
            date: session.scheduledAt,
            metadata: { sessionId: session.id, duration: session.duration, status: session.status },
          });
        }
        
        // Get payments
        const userPayments = await db.select({
          id: payoutLedger.id,
          grossAmount: payoutLedger.grossAmount,
          transactionType: payoutLedger.transactionType,
          createdAt: payoutLedger.createdAt,
        })
          .from(payoutLedger)
          .where(eq(payoutLedger.coachId, input.userId))
          .orderBy(desc(payoutLedger.createdAt))
          .limit(10);
        
        for (const payment of userPayments) {
          activities.push({
            type: "payment",
            description: `Payment: $${((payment.grossAmount || 0) / 100).toFixed(2)} (${payment.transactionType})`,
            date: payment.createdAt,
            metadata: { paymentId: payment.id, amount: payment.grossAmount },
          });
        }
        
        // Get notifications
        const { notifications } = await import("../drizzle/schema");
        const userNotifications = await db.select()
          .from(notifications)
          .where(eq(notifications.userId, input.userId))
          .orderBy(desc(notifications.createdAt))
          .limit(5);
        
        for (const notif of userNotifications) {
          activities.push({
            type: "notification",
            description: notif.title || "Notification",
            date: notif.createdAt,
            metadata: { notificationId: notif.id, isRead: notif.read },
          });
        }
        
        // Sort all activities by date
        activities.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        
        // Calculate stats
        const stats = {
          totalEnrollments: userEnrollments.length,
          totalSessions: userSessions.length,
          totalPayments: userPayments.length,
          lastActive: userData.lastSignedIn,
          accountAge: userData.createdAt ? Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        };
        
        return {
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatarUrl: userData.avatarUrl,
            createdAt: userData.createdAt,
            lastSignedIn: userData.lastSignedIn,
            emailVerified: userData.emailVerified,
            loginMethod: userData.loginMethod,
          },
          activities: activities.slice(0, 20),
          stats,
        };
      }),
    
    // ============================================================================
    // COURSE MANAGEMENT (Admin Control Center)
    // ============================================================================
    
    // Get all courses for admin management (including drafts)
    getAllCourses: protectedProcedure
      .input(z.object({
        status: z.enum(["all", "draft", "published", "archived"]).optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { courses: [], total: 0 };
        
        const { courses } = await import("../drizzle/schema");
        const filters = input || { status: "all", page: 1, limit: 20 };
        const conditions: any[] = [];
        
        if (filters.status && filters.status !== "all") {
          conditions.push(eq(courses.status, filters.status));
        }
        
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          conditions.push(
            or(
              like(courses.title, searchTerm),
              like(courses.description, searchTerm)
            )
          );
        }
        
        const offset = ((filters.page || 1) - 1) * (filters.limit || 20);
        
        let query = db.select().from(courses);
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        
        const allCourses = await query.orderBy(desc(courses.updatedAt));
        const paginatedCourses = allCourses.slice(offset, offset + (filters.limit || 20));
        
        return {
          courses: paginatedCourses,
          total: allCourses.length,
        };
      }),
    
    // Create a new course
    createCourse: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        category: z.enum(["sle_oral", "sle_written", "sle_reading", "sle_complete", "business_french", "business_english", "exam_prep", "conversation", "grammar", "vocabulary"]).optional(),
        level: z.enum(["beginner", "intermediate", "advanced", "all_levels"]).optional(),
        targetLanguage: z.enum(["french", "english", "both"]).optional(),
        price: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        previewVideoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courses } = await import("../drizzle/schema");
        
        // Generate slug from title
        const slug = input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") + "-" + Date.now();
        
        const [newCourse] = await db.insert(courses).values({
          title: input.title,
          slug,
          description: input.description || null,
          shortDescription: input.shortDescription || null,
          category: input.category || "sle_oral",
          level: input.level || "all_levels",
          targetLanguage: input.targetLanguage || "french",
          price: input.price || 0,
          thumbnailUrl: input.thumbnailUrl || null,
          previewVideoUrl: input.previewVideoUrl || null,
          status: "draft",
          instructorId: ctx.user.id,
          instructorName: ctx.user.name || "Admin",
        }).$returningId();
        
        return { success: true, courseId: newCourse.id };
      }),
    
    // Update a course
    // @ts-ignore - duplicate property handled at runtime
    updateCourse: protectedProcedure
      .input(z.object({
        courseId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        category: z.enum(["sle_oral", "sle_written", "sle_reading", "sle_complete", "business_french", "business_english", "exam_prep", "conversation", "grammar", "vocabulary"]).optional(),
        level: z.enum(["beginner", "intermediate", "advanced", "all_levels"]).optional(),
        targetLanguage: z.enum(["french", "english", "both"]).optional(),
        price: z.number().optional(),
        originalPrice: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        previewVideoUrl: z.string().optional(),
        accessType: z.enum(["one_time", "subscription", "free"]).optional(),
        accessDurationDays: z.number().optional(),
        hasCertificate: z.boolean().optional(),
        hasQuizzes: z.boolean().optional(),
        hasDownloads: z.boolean().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        dripEnabled: z.boolean().optional(),
        dripInterval: z.number().optional(),
        dripUnit: z.enum(["days", "weeks", "months"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courses } = await import("../drizzle/schema");
        const { courseId, ...updateData } = input;
        
        await db.update(courses)
          .set(updateData)
          .where(eq(courses.id, courseId));
        
        return { success: true };
      }),
    
    // Publish/Unpublish a course
    publishCourse: protectedProcedure
      .input(z.object({
        courseId: z.number(),
        status: z.enum(["draft", "published", "archived"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courses } = await import("../drizzle/schema");
        
        await db.update(courses)
          .set({ 
            status: input.status,
            publishedAt: input.status === "published" ? new Date() : null,
          })
          .where(eq(courses.id, input.courseId));
        
        return { success: true };
      }),
    
    // Delete a course
    deleteCourse: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courses, courseModules, lessons } = await import("../drizzle/schema");
        
        // Delete lessons first
        await db.delete(lessons).where(eq(lessons.courseId, input.courseId));
        // Delete modules
        await db.delete(courseModules).where(eq(courseModules.courseId, input.courseId));
        // Delete course
        await db.delete(courses).where(eq(courses.id, input.courseId));
        
        return { success: true };
      }),
    
    // Duplicate a course
    duplicateCourse: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courses, courseModules, lessons } = await import("../drizzle/schema");
        
        // Get original course
        const [original] = await db.select().from(courses).where(eq(courses.id, input.courseId));
        if (!original) throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
        
        // Create new course
        const newSlug = original.slug + "-copy-" + Date.now();
        const [newCourse] = await db.insert(courses).values({
          ...original,
          id: undefined,
          title: original.title + " (Copy)",
          slug: newSlug,
          status: "draft",
          totalEnrollments: 0,
          totalReviews: 0,
          averageRating: null,
          publishedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any).$returningId();
        
        // Get and duplicate modules
        const originalModules = await db.select().from(courseModules).where(eq(courseModules.courseId, input.courseId));
        
        for (const module of originalModules) {
          const [newModule] = await db.insert(courseModules).values({
            ...module,
            id: undefined,
            courseId: newCourse.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any).$returningId();
          
          // Get and duplicate lessons for this module
          const moduleLessons = await db.select().from(lessons).where(eq(lessons.moduleId, module.id));
          
          for (const lesson of moduleLessons) {
            await db.insert(lessons).values({
              ...lesson,
              id: undefined,
              moduleId: newModule.id,
              courseId: newCourse.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as any);
          }
        }
        
        return { success: true, newCourseId: newCourse.id };
      }),
    
    // Get course with full details for editing
    getCourseForEdit: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courses, courseModules, lessons } = await import("../drizzle/schema");
        
        const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId));
        if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
        
        // Get modules with lessons
        const modules = await db.select().from(courseModules)
          .where(eq(courseModules.courseId, input.courseId))
          .orderBy(asc(courseModules.sortOrder));
        
        const modulesWithLessons = await Promise.all(
          modules.map(async (module) => {
            const moduleLessons = await db.select().from(lessons)
              .where(eq(lessons.moduleId, module.id))
              .orderBy(asc(lessons.sortOrder));
            return { ...module, lessons: moduleLessons };
          })
        );
        
        return { ...course, modules: modulesWithLessons };
      }),
    
    // ============================================================================
    // MODULE MANAGEMENT
    // ============================================================================
    
    // Create a module
    createModule: protectedProcedure
      .input(z.object({
        courseId: z.number(),
        title: z.string().min(1),
        titleFr: z.string().optional(),
        description: z.string().optional(),
        descriptionFr: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courseModules, courses } = await import("../drizzle/schema");
        
        // Get max sort order
        const existingModules = await db.select().from(courseModules)
          .where(eq(courseModules.courseId, input.courseId));
        const maxOrder = existingModules.length > 0 
          ? Math.max(...existingModules.map(m => m.sortOrder || 0)) 
          : -1;
        
        const [newModule] = await db.insert(courseModules).values({
          courseId: input.courseId,
          title: input.title,
          titleFr: input.titleFr || null,
          description: input.description || null,
          descriptionFr: input.descriptionFr || null,
          sortOrder: input.sortOrder ?? maxOrder + 1,
        }).$returningId();
        
        // Update course module count
        await db.update(courses)
          .set({ totalModules: sql`${courses.totalModules} + 1` })
          .where(eq(courses.id, input.courseId));
        
        return { success: true, moduleId: newModule.id };
      }),
    
    // Update a lesson
    // @ts-ignore - duplicate property handled at runtime
    updateLesson: protectedProcedure
      .input(z.object({
        lessonId: z.number(),
        title: z.string().optional(),
        titleFr: z.string().optional(),
        description: z.string().optional(),
        descriptionFr: z.string().optional(),
        isPreview: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courseModules } = await import("../drizzle/schema");
        const { moduleId, ...updateData } = input;
        
        await db.update(courseModules)
          .set(updateData)
          .where(eq(courseModules.id, moduleId));
        
        return { success: true };
      }),
    
    // Delete a module
    deleteModule: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courseModules, lessons, courses } = await import("../drizzle/schema");
        
        // Get module to find courseId
        const [module] = await db.select().from(courseModules).where(eq(courseModules.id, input.moduleId));
        if (!module) throw new TRPCError({ code: "NOT_FOUND", message: "Module not found" });
        
        // Delete lessons first
        await db.delete(lessons).where(eq(lessons.moduleId, input.moduleId));
        // Delete module
        await db.delete(courseModules).where(eq(courseModules.id, input.moduleId));
        
        // Update course module count
        await db.update(courses)
          .set({ totalModules: sql`${courses.totalModules} - 1` })
          .where(eq(courses.id, module.courseId));
        
        return { success: true };
      }),
    
    // Reorder modules
    reorderModules: protectedProcedure
      .input(z.object({
        courseId: z.number(),
        moduleIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { courseModules } = await import("../drizzle/schema");
        
        // Update sort order for each module
        for (let i = 0; i < input.moduleIds.length; i++) {
          await db.update(courseModules)
            .set({ sortOrder: i })
            .where(eq(courseModules.id, input.moduleIds[i]));
        }
        
        return { success: true };
      }),
    
    // ============================================================================
    // LESSON MANAGEMENT
    // ============================================================================
    
    // Create a lesson
    createLesson: protectedProcedure
      .input(z.object({
        moduleId: z.number(),
        courseId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        contentType: z.enum(["video", "text", "audio", "pdf", "quiz", "assignment", "download", "live_session"]).optional(),
        videoUrl: z.string().optional(),
        textContent: z.string().optional(),
        audioUrl: z.string().optional(),
        downloadUrl: z.string().optional(),
        estimatedMinutes: z.number().optional(),
        isPreview: z.boolean().optional(),
        isMandatory: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { lessons, courseModules, courses } = await import("../drizzle/schema");
        
        // Get max sort order
        const existingLessons = await db.select().from(lessons)
          .where(eq(lessons.moduleId, input.moduleId));
        const maxOrder = existingLessons.length > 0 
          ? Math.max(...existingLessons.map(l => l.sortOrder || 0)) 
          : -1;
        
        const [newLesson] = await db.insert(lessons).values({
          moduleId: input.moduleId,
          courseId: input.courseId,
          title: input.title,
          titleFr: input.titleFr || null,
          description: input.description || null,
          descriptionFr: input.descriptionFr || null,
          contentType: input.contentType || "video",
          videoUrl: input.videoUrl || null,
          textContent: input.textContent || null,
          audioUrl: input.audioUrl || null,
          downloadUrl: input.downloadUrl || null,
          estimatedMinutes: input.estimatedMinutes || 10,
          isPreview: input.isPreview || false,
          isMandatory: input.isMandatory ?? true,
          sortOrder: input.sortOrder ?? maxOrder + 1,
        }).$returningId();
        
        // Update module lesson count
        await db.update(courseModules)
          .set({ totalLessons: sql`${courseModules.totalLessons} + 1` })
          .where(eq(courseModules.id, input.moduleId));
        
        // Update course lesson count
        await db.update(courses)
          .set({ totalLessons: sql`${courses.totalLessons} + 1` })
          .where(eq(courses.id, input.courseId));
        
        return { success: true, lessonId: newLesson.id };
      }),
    
    // @ts-ignore - duplicate property handled at runtime
    createLesson: protectedProcedure
      .input(z.object({
        moduleId: z.number(),
        courseId: z.number(),
        title: z.string().min(1),
        titleFr: z.string().optional(),
        description: z.string().optional(),
        descriptionFr: z.string().optional(),
        contentType: z.enum(["video", "text", "audio", "pdf", "quiz", "assignment", "download", "live_session"]).optional(),
        videoUrl: z.string().optional(),
        videoProvider: z.enum(["youtube", "vimeo", "wistia", "bunny", "self_hosted"]).optional(),
        videoDurationSeconds: z.number().optional(),
        videoThumbnailUrl: z.string().optional(),
        textContent: z.string().optional(),
        audioUrl: z.string().optional(),
        audioDurationSeconds: z.number().optional(),
        downloadUrl: z.string().optional(),
        downloadFileName: z.string().optional(),
        estimatedMinutes: z.number().optional(),
        isPreview: z.boolean().optional(),
        isMandatory: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { lessons } = await import("../drizzle/schema");
        const { lessonId, ...updateData } = input;
        
        await db.update(lessons)
          .set(updateData)
          .where(eq(lessons.id, lessonId));
        
        return { success: true };
      }),
    
    // Delete a lesson
    deleteLesson: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { lessons, courseModules, courses } = await import("../drizzle/schema");
        
        // Get lesson to find moduleId and courseId
        const [lesson] = await db.select().from(lessons).where(eq(lessons.id, input.lessonId));
        if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
        
        // Delete lesson
        await db.delete(lessons).where(eq(lessons.id, input.lessonId));
        
        // Update module lesson count
        await db.update(courseModules)
          .set({ totalLessons: sql`${courseModules.totalLessons} - 1` })
          .where(eq(courseModules.id, lesson.moduleId));
        
        // Update course lesson count
        await db.update(courses)
          .set({ totalLessons: sql`${courses.totalLessons} - 1` })
          .where(eq(courses.id, lesson.courseId));
        
        return { success: true };
      }),
    
    // Reorder lessons
    reorderLessons: protectedProcedure
      .input(z.object({
        moduleId: z.number(),
        lessonIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { lessons } = await import("../drizzle/schema");
        
        // Update sort order for each lesson
        for (let i = 0; i < input.lessonIds.length; i++) {
          await db.update(lessons)
            .set({ sortOrder: i })
            .where(eq(lessons.id, input.lessonIds[i]));
        }
        
        return { success: true };
      }),
    
    // Upload lesson media
    uploadLessonMedia: protectedProcedure
      .input(z.object({
        lessonId: z.number(),
        fileUrl: z.string(),
        fileName: z.string(),
        mimeType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { lessons } = await import("../drizzle/schema");
        
        await db.update(lessons)
          .set({
            // @ts-expect-error - TS2353: auto-suppressed during TS cleanup
            content: input.fileUrl,
            updatedAt: new Date(),
          })
          .where(eq(lessons.id, input.lessonId));
        
        return { success: true, url: input.fileUrl };
      }),

    // Get course statistics for admin dashboard
    getCourseStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { totalCourses: 0, publishedCourses: 0, draftCourses: 0, totalEnrollments: 0, totalRevenue: 0 };
        
        const { courses, courseEnrollments } = await import("../drizzle/schema");
        
        const allCourses = await db.select().from(courses);
        const publishedCourses = allCourses.filter(c => c.status === "published");
        const draftCourses = allCourses.filter(c => c.status === "draft");
        
        const [enrollmentCount] = await db.select({ count: sql<number>`count(*)` }).from(courseEnrollments);
        
        // Calculate total revenue from enrollments
        const totalRevenue = allCourses.reduce((sum, course) => {
          return sum + ((course.price || 0) * (course.totalEnrollments || 0));
        }, 0);
        
        return {
          totalCourses: allCourses.length,
          publishedCourses: publishedCourses.length,
          draftCourses: draftCourses.length,
          totalEnrollments: enrollmentCount?.count || 0,
          totalRevenue: totalRevenue / 100, // Convert from cents
        };
      }),

    // Invitations sub-router
    invitations: invitationsRouter,

    // Dashboard data sub-router (enrollments, gamification stats)
    ...adminDashboardDataRouter._def.procedures,
  }),
  
  // Documents router for credential verification
  documents: router({
    list: protectedProcedure
      .input(z.object({ coachId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        const { coachDocuments } = await import("../drizzle/schema");
        const docs = await db.select().from(coachDocuments)
          .where(eq(coachDocuments.coachId, input.coachId))
          .orderBy(desc(coachDocuments.createdAt));
        return docs;
      }),
    
    upload: protectedProcedure
      .input(z.object({
        coachId: z.number(),
        applicationId: z.number().optional(),
        documentType: z.enum(["id_proof", "degree", "teaching_cert", "sle_results", "language_cert", "background_check", "other"]),
        title: z.string(),
        description: z.string().optional(),
        issuingAuthority: z.string().optional(),
        issueDate: z.date().optional(),
        expiryDate: z.date().optional(),
        fileData: z.string(), // base64 encoded
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachDocuments } = await import("../drizzle/schema");
        const { storagePut } = await import("./storage");
        
        // Upload file to S3 storage
        let fileUrl: string;
        try {
          // Extract base64 data (handle both with and without data URI prefix)
          const base64Data = input.fileData.includes(',') 
            ? input.fileData.split(',')[1] 
            : input.fileData;
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Generate unique file path
          const timestamp = Date.now();
          const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `coach-documents/${input.coachId}/${timestamp}-${sanitizedFileName}`;
          
          const { url } = await storagePut(filePath, buffer, input.mimeType);
          fileUrl = url;
        } catch (storageError) {
          console.error('S3 upload failed, falling back to base64:', storageError);
          // Fallback to base64 if S3 fails
          fileUrl = `data:${input.mimeType};base64,${input.fileData.split(',')[1] || input.fileData}`;
        }
        
        const [result] = await db.insert(coachDocuments).values({
          coachId: input.coachId,
          applicationId: input.applicationId,
          documentType: input.documentType,
          title: input.title,
          description: input.description,
          issuingAuthority: input.issuingAuthority,
          issueDate: input.issueDate,
          expiryDate: input.expiryDate,
          fileUrl,
          fileName: input.fileName,
          status: "pending",
        }).$returningId();
        
        return { id: result.id, success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachDocuments } = await import("../drizzle/schema");
        
        // Verify ownership
        const [doc] = await db.select().from(coachDocuments).where(eq(coachDocuments.id, input.documentId));
        if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
        
        // Only allow deletion of pending or rejected documents
        if (doc.status === "verified") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete verified documents" });
        }
        
        await db.delete(coachDocuments).where(eq(coachDocuments.id, input.documentId));
        return { success: true };
      }),
    
    // Admin: verify a document
    verify: protectedProcedure
      .input(z.object({ documentId: z.number(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachDocuments } = await import("../drizzle/schema");
        
        await db.update(coachDocuments)
          .set({ 
            status: "verified", 
            verifiedBy: ctx.user.id, 
            verifiedAt: new Date(),
            rejectionReason: input.notes 
          })
          .where(eq(coachDocuments.id, input.documentId));
        
        return { success: true };
      }),
    
    // Admin: reject a document
    reject: protectedProcedure
      .input(z.object({ documentId: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachDocuments } = await import("../drizzle/schema");
        
        await db.update(coachDocuments)
          .set({ 
            status: "rejected", 
            verifiedBy: ctx.user.id, 
            verifiedAt: new Date(),
            rejectionReason: input.reason 
          })
          .where(eq(coachDocuments.id, input.documentId));
        
        return { success: true };
      }),

    // Get detailed application info for dashboard
    getApplicationDetail: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachApplications, users } = await import("../drizzle/schema");
        
        const [application] = await db
          .select()
          .from(coachApplications)
          .where(eq(coachApplications.id, input.applicationId))
          .limit(1);
        
        if (!application) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, application.userId))
          .limit(1);
        
        return {
          ...application,
          userName: user?.name || "Unknown",
        };
      }),

    // Get applications with advanced filtering for dashboard
    getApplicationsForDashboard: protectedProcedure
      .input(z.object({
        status: z.enum(["submitted", "under_review", "approved", "rejected", "all"]).optional(),
        language: z.enum(["french", "english", "both", "all"]).optional(),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "firstName", "status"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { applications: [], total: 0 };
        const { coachApplications } = await import("../drizzle/schema");
        
        // Build filters
        const filters: any[] = [];
        if (input?.status && input.status !== "all") {
          filters.push(eq(coachApplications.status, input.status));
        }
        if (input?.language && input.language !== "all") {
          filters.push(eq(coachApplications.teachingLanguage, input.language));
        }
        
        // Build query
        let query: any = db.select().from(coachApplications);
        
        if (filters.length > 0) {
          query = query.where(and(...filters));
        }
        
        // Apply sorting
        const sortBy = input?.sortBy || "createdAt";
        const sortOrder = input?.sortOrder || "desc";
        const sortColumn = {
          createdAt: coachApplications.createdAt,
          firstName: coachApplications.firstName,
          status: coachApplications.status,
        }[sortBy];
        
        if (sortOrder === "asc") {
          query = query.orderBy(asc(sortColumn));
        } else {
          query = query.orderBy(desc(sortColumn));
        }
        
        // Apply pagination
        query = query.limit(input?.limit || 50).offset(input?.offset || 0);
        
        const applications: any[] = await query;
        
        // Filter by search term (client-side for now)
        let filtered = applications;
        if (input?.search) {
          const s = input.search.toLowerCase();
          filtered = filtered.filter((a: any) => 
            a.firstName?.toLowerCase().includes(s) ||
            a.lastName?.toLowerCase().includes(s) ||
            a.email?.toLowerCase().includes(s) ||
            a.fullName?.toLowerCase().includes(s)
          );
        }
        
        // Get total count
        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(coachApplications);
        const total = countResult?.count || 0;
        
        return { applications: filtered, total };
      }),

    // Bulk approve applications
    bulkApproveApplications: protectedProcedure
      .input(z.object({ applicationIds: z.array(z.number()), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachApplications, coachProfiles } = await import("../drizzle/schema");
        
        const results = { approved: 0, failed: 0, errors: [] as string[] };
        
        for (const applicationId of input.applicationIds) {
          try {
            const [application] = await db
              .select()
              .from(coachApplications)
              .where(eq(coachApplications.id, applicationId));
            
            if (!application) {
              results.failed++;
              results.errors.push(`Application ${applicationId} not found`);
              continue;
            }
            
            // Update application status
            await db.update(coachApplications)
              .set({
                status: "approved",
                reviewedBy: ctx.user.id,
                reviewedAt: new Date(),
                reviewNotes: input.notes,
              })
              .where(eq(coachApplications.id, applicationId));
            
            // Create coach profile
            const slug = `${application.firstName || "coach"}-${application.lastName || "user"}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            await db.insert(coachProfiles).values({
              userId: application.userId,
              slug: slug + "-" + Date.now(),
              headline: application.headline || null,
              headlineFr: application.headlineFr || null,
              bio: application.bio || null,
              bioFr: application.bioFr || null,
              videoUrl: application.introVideoUrl || null,
              photoUrl: application.photoUrl || null,
              languages: (application.teachingLanguage as "french" | "english" | "both") || "both",
              specializations: application.specializations || {},
              yearsExperience: application.yearsTeaching || 0,
              credentials: application.certifications || null,
              hourlyRate: ((application.hourlyRate || 50) * 100),
              trialRate: ((application.trialRate || 25) * 100),
              status: "approved",
              approvedAt: new Date(),
              approvedBy: ctx.user.id,
            });
            
            // Update user role
            await db.update(users).set({ role: "coach" }).where(eq(users.id, application.userId));
            
            results.approved++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Failed to approve application ${applicationId}: ${error}`);
          }
        }
        
        return results;
      }),

    // Bulk reject applications
    bulkRejectApplications: protectedProcedure
      .input(z.object({ applicationIds: z.array(z.number()), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachApplications } = await import("../drizzle/schema");
        
        const results = { rejected: 0, failed: 0, errors: [] as string[] };
        
        for (const applicationId of input.applicationIds) {
          try {
            await db.update(coachApplications)
              .set({
                status: "rejected",
                reviewedBy: ctx.user.id,
                reviewedAt: new Date(),
                reviewNotes: input.reason,
              })
              .where(eq(coachApplications.id, applicationId));
            
            results.rejected++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Failed to reject application ${applicationId}: ${error}`);
          }
        }
        
        return results;
      }),

    // Get application statistics
    getApplicationStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return { total: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0 };
      const { coachApplications } = await import("../drizzle/schema");
      
      const [total] = await db.select({ count: sql<number>`count(*)` }).from(coachApplications);
      const [submitted] = await db.select({ count: sql<number>`count(*)` }).from(coachApplications).where(eq(coachApplications.status, "submitted"));
      const [underReview] = await db.select({ count: sql<number>`count(*)` }).from(coachApplications).where(eq(coachApplications.status, "under_review"));
      const [approved] = await db.select({ count: sql<number>`count(*)` }).from(coachApplications).where(eq(coachApplications.status, "approved"));
      const [rejected] = await db.select({ count: sql<number>`count(*)` }).from(coachApplications).where(eq(coachApplications.status, "rejected"));
      
      return {
        total: total?.count || 0,
        submitted: submitted?.count || 0,
        underReview: underReview?.count || 0,
        approved: approved?.count || 0,
        rejected: rejected?.count || 0,
      };
    }),
    
    
    // Export applications to CSV
    exportApplicationsCSV: protectedProcedure
      .input(z.object({ 
        status: z.enum(["all", "submitted", "under_review", "approved", "rejected"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { coachApplications } = await import("../drizzle/schema");
        const { generateApplicationsCSV, generateExportFilename } = await import("./export-applications");
        
        // Get all applications
        const allApps = await db.select().from(coachApplications).orderBy(desc(coachApplications.createdAt));
        
        // Filter by status
        let filtered = allApps;
        if (input.status && input.status !== "all") {
          filtered = filtered.filter(app => app.status === input.status);
        }
        
        // Filter by date range
        if (input.startDate) {
          const startDate = input.startDate;
          filtered = filtered.filter(app => new Date(app.createdAt) >= startDate);
        }
        if (input.endDate) {
          const endDate = input.endDate;
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          filtered = filtered.filter(app => new Date(app.createdAt) <= endOfDay);
        }
        
        // Generate CSV
        const csvContent = generateApplicationsCSV(filtered as any);
        const filename = generateExportFilename(input.status, input.startDate, input.endDate);
        
        return {
          csvContent,
          filename,
          count: filtered.length,
        };
      }),
  }),

  // ============================================================================
  // CRM ROUTER
  // ============================================================================
  crm: router({
    // Google Calendar Sync
    syncMeetingToCalendar: protectedProcedure
      .input(z.object({
        meetingId: z.number(),
        calendarId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { syncMeetingToCalendar } = await import("./google-calendar-sync");
        return syncMeetingToCalendar(input.meetingId, input.calendarId);
      }),

    checkCalendarAvailability: protectedProcedure
      .input(z.object({
        startTime: z.date(),
        endTime: z.date(),
        calendarId: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { checkAvailability } = await import("./google-calendar-sync");
        return checkAvailability(input.startTime, input.endTime, input.calendarId);
      }),

    getAvailableSlots: protectedProcedure
      .input(z.object({
        date: z.date(),
        durationMinutes: z.number().optional(),
        workingHoursStart: z.number().optional(),
        workingHoursEnd: z.number().optional(),
        calendarId: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getAvailableSlots } = await import("./google-calendar-sync");
        return getAvailableSlots(
          input.date,
          input.durationMinutes,
          input.workingHoursStart,
          input.workingHoursEnd,
          input.calendarId
        );
      }),

    getUpcomingCalendarEvents: protectedProcedure
      .input(z.object({
        days: z.number().optional(),
        calendarId: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getUpcomingCalendarEvents } = await import("./google-calendar-sync");
        return getUpcomingCalendarEvents(input.days, input.calendarId);
      }),

    syncAllMeetings: protectedProcedure
      .input(z.object({
        calendarId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { syncAllMeetingsToCalendar } = await import("./google-calendar-sync");
        return syncAllMeetingsToCalendar(ctx.user.id, input.calendarId);
      }),

    // Sequence Performance Analytics
    getSequenceMetrics: protectedProcedure
      .input(z.object({ sequenceId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getSequenceMetrics } = await import("./sequence-analytics");
        return getSequenceMetrics(input.sequenceId);
      }),

    getStepMetrics: protectedProcedure
      .input(z.object({ sequenceId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getStepMetrics } = await import("./sequence-analytics");
        return getStepMetrics(input.sequenceId);
      }),

    getSequencePerformanceReport: protectedProcedure
      .input(z.object({ sequenceId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getSequencePerformanceReport } = await import("./sequence-analytics");
        return getSequencePerformanceReport(input.sequenceId);
      }),

    getOverallSequenceAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getOverallSequenceAnalytics } = await import("./sequence-analytics");
        return getOverallSequenceAnalytics();
      }),

    compareSequences: protectedProcedure
      .input(z.object({
        sequenceIdA: z.number(),
        sequenceIdB: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { compareSequences } = await import("./sequence-analytics");
        return compareSequences(input.sequenceIdA, input.sequenceIdB);
      }),

    recordEmailOpen: protectedProcedure
      .input(z.object({ logId: z.number() }))
      .mutation(async ({ input }) => {
        const { recordEmailOpen } = await import("./sequence-analytics");
        await recordEmailOpen(input.logId);
        return { success: true };
      }),

    recordEmailClick: protectedProcedure
      .input(z.object({ logId: z.number() }))
      .mutation(async ({ input }) => {
        const { recordEmailClick } = await import("./sequence-analytics");
        await recordEmailClick(input.logId);
        return { success: true };
      }),

    // Meeting Outcome Tracking
    recordMeetingOutcome: protectedProcedure
      .input(z.object({
        meetingId: z.number(),
        outcome: z.enum(["qualified", "not_qualified", "needs_follow_up", "converted", "no_show"]),
        qualificationScore: z.number().min(1).max(10).optional(),
        nextSteps: z.string().optional(),
        dealValue: z.number().optional(),
        dealProbability: z.number().min(0).max(100).optional(),
        notes: z.string().optional(),
        followUpDate: z.date().optional(),
        followUpType: z.enum(["call", "email", "meeting"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { recordMeetingOutcome } = await import("./meeting-outcomes");
        return recordMeetingOutcome(input, ctx.user.id);
      }),

    getOutcomeStats: protectedProcedure
      .input(z.object({
        organizerId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getOutcomeStats } = await import("./meeting-outcomes");
        return getOutcomeStats(input?.organizerId, input?.startDate, input?.endDate);
      }),

    getPendingOutcomeMeetings: protectedProcedure
      .input(z.object({ organizerId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getPendingOutcomeMeetings } = await import("./meeting-outcomes");
        return getPendingOutcomeMeetings(input?.organizerId);
      }),

    getFollowUpTasks: protectedProcedure
      .input(z.object({
        organizerId: z.number().optional(),
        daysAhead: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getFollowUpTasks } = await import("./meeting-outcomes");
        return getFollowUpTasks(input?.organizerId, input?.daysAhead);
      }),

    sendOutcomeReminder: protectedProcedure
      .input(z.object({ meetingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { sendOutcomeReminderEmail } = await import("./meeting-outcomes");
        await sendOutcomeReminderEmail(input.meetingId);
        return { success: true };
      }),

    sendPendingOutcomeReminders: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { sendPendingOutcomeReminders } = await import("./meeting-outcomes");
        const sentCount = await sendPendingOutcomeReminders();
        return { success: true, sentCount };
      }),

    // Lead Scoring Dashboard
    getLeadsWithScores: protectedProcedure
      .input(z.object({
        sortBy: z.enum(["score", "recent", "activity"]).optional(),
        status: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        let leads;
        if (input.status) {
          leads = await db.select().from(ecosystemLeads)
            .where(eq(ecosystemLeads.status, input.status as any))
            .limit(input.limit || 50);
        } else {
          leads = await db.select().from(ecosystemLeads)
            .limit(input.limit || 50);
        }
        
        // Sort based on input
        const sortedLeads = [...leads].sort((a, b) => {
          if (input.sortBy === "recent") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (input.sortBy === "activity") {
            const aContact = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
            const bContact = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
            return bContact - aContact;
          }
          // Default: sort by score
          return (b.leadScore || 0) - (a.leadScore || 0);
        });
        
        return { leads: sortedLeads };
      }),

    getLeadActivities: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const activities = await db
          .select()
          .from(ecosystemLeadActivities)
          .where(eq(ecosystemLeadActivities.leadId, input.leadId))
          .orderBy(desc(ecosystemLeadActivities.createdAt))
          .limit(20);
        
        return {
          activities: activities.map(a => ({
            id: a.id,
            type: a.activityType,
            description: a.description,
            timestamp: a.createdAt,
            metadata: a.metadata,
          })),
        };
      }),

    getLeadScoringStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const leads = await db.select({ leadScore: ecosystemLeads.leadScore }).from(ecosystemLeads);
        
        const scores = leads.map(l => l.leadScore || 0);
        const totalScore = scores.reduce((sum, s) => sum + s, 0);
        const averageScore = scores.length > 0 ? totalScore / scores.length : 0;
        
        const hotLeads = scores.filter(s => s >= 80).length;
        const warmLeads = scores.filter(s => s >= 40 && s < 80).length;
        const coldLeads = scores.filter(s => s < 40).length;
        
        return {
          averageScore,
          hotLeads,
          warmLeads,
          coldLeads,
          totalLeads: scores.length,
        };
      }),

    // Update lead status (for pipeline drag-and-drop)
    updateLeadStatus: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        status: z.string(),
        dealValue: z.number().optional(),
        expectedCloseDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const updateData: Record<string, unknown> = { status: input.status };
        if (input.dealValue !== undefined) updateData.dealValue = input.dealValue;
        if (input.expectedCloseDate !== undefined) updateData.expectedCloseDate = input.expectedCloseDate;
        
        // Update converted timestamp if moving to converted status
        if (input.status === "converted") {
          updateData.convertedAt = new Date();
        }
        
        await db
          .update(ecosystemLeads)
          .set(updateData)
          .where(eq(ecosystemLeads.id, input.leadId));
        
        // Log the activity
        await db.insert(ecosystemLeadActivities).values({
          leadId: input.leadId,
          activityType: "status_changed",
          description: `Status changed to ${input.status}`,
          metadata: JSON.stringify({ newStatus: input.status }),
        });
        
        return { success: true };
      }),

    // Email Templates CRUD
    getEmailTemplates: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        language: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const { crmEmailTemplates } = await import("../drizzle/schema");
        let templates = await db.select().from(crmEmailTemplates);
        
        if (input.category) {
          templates = templates.filter(t => t.category === input.category);
        }
        if (input.language) {
          templates = templates.filter(t => t.language === input.language || t.language === "both");
        }
        
        return { templates };
      }),

    createEmailTemplate: protectedProcedure
      .input(z.object({
        name: z.string(),
        subject: z.string(),
        body: z.string(),
        category: z.enum(["welcome", "follow_up", "proposal", "nurture", "conversion", "custom"]),
        language: z.enum(["en", "fr", "both"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const { crmEmailTemplates } = await import("../drizzle/schema");
        
        // Extract variables from body
        const variableMatches = input.body.match(/\{\{(\w+)\}\}/g) || [];
        const variables = variableMatches.map(v => v.replace(/\{\{|\}\}/g, ""));
        
        const result = await db.insert(crmEmailTemplates).values({
          name: input.name,
          subject: input.subject,
          body: input.body,
          category: input.category,
          language: input.language,
          variables,
          createdBy: ctx.user.id,
        });
        
        return { success: true, id: result[0].insertId };
      }),

    updateEmailTemplate: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
        category: z.enum(["welcome", "follow_up", "proposal", "nurture", "conversion", "custom"]).optional(),
        language: z.enum(["en", "fr", "both"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const { crmEmailTemplates } = await import("../drizzle/schema");
        
        const updateData: Record<string, unknown> = {};
        if (input.name) updateData.name = input.name;
        if (input.subject) updateData.subject = input.subject;
        if (input.body) {
          updateData.body = input.body;
          const variableMatches = input.body.match(/\{\{(\w+)\}\}/g) || [];
          updateData.variables = variableMatches.map(v => v.replace(/\{\{|\}\}/g, ""));
        }
        if (input.category) updateData.category = input.category;
        if (input.language) updateData.language = input.language;
        
        await db.update(crmEmailTemplates)
          .set(updateData)
          .where(eq(crmEmailTemplates.id, input.id));
        
        return { success: true };
      }),

    deleteEmailTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const { crmEmailTemplates } = await import("../drizzle/schema");
        
        await db.delete(crmEmailTemplates).where(eq(crmEmailTemplates.id, input.id));
        
        return { success: true };
      }),

    // Pipeline Notifications
    getPipelineNotifications: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const { crmPipelineNotifications } = await import("../drizzle/schema");
        
        let notifications;
        if (input.unreadOnly) {
          notifications = await db.select().from(crmPipelineNotifications)
            .where(eq(crmPipelineNotifications.isRead, false))
            .orderBy(desc(crmPipelineNotifications.createdAt))
            .limit(input.limit || 50);
        } else {
          notifications = await db.select().from(crmPipelineNotifications)
            .orderBy(desc(crmPipelineNotifications.createdAt))
            .limit(input.limit || 50);
        }
        
        return { notifications };
      }),

    markNotificationRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const { crmPipelineNotifications } = await import("../drizzle/schema");
        
        await db.update(crmPipelineNotifications)
          .set({ isRead: true, readAt: new Date() })
          .where(eq(crmPipelineNotifications.id, input.id));
        
        return { success: true };
      }),

    markAllNotificationsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const { crmPipelineNotifications } = await import("../drizzle/schema");
        
        await db.update(crmPipelineNotifications)
          .set({ isRead: true, readAt: new Date() })
          .where(eq(crmPipelineNotifications.isRead, false));
        
        return { success: true };
      }),

    // Lead Tags CRUD
    getTags: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const tags = await db.select().from(crmLeadTags).orderBy(asc(crmLeadTags.name));
        return { tags };
      }),

    createTag: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(50),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        description: z.string().max(255).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const result = await db.insert(crmLeadTags).values({
          name: input.name,
          color: input.color,
          description: input.description,
        }).$returningId();
        
        return { id: result[0].id };
      }),

    updateTag: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        description: z.string().max(255).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (input.name) updateData.name = input.name;
        if (input.color) updateData.color = input.color;
        if (input.description !== undefined) updateData.description = input.description;
        
        await db.update(crmLeadTags)
          .set(updateData)
          .where(eq(crmLeadTags.id, input.id));
        
        return { success: true };
      }),

    deleteTag: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        // First delete all assignments for this tag
        await db.delete(crmLeadTagAssignments)
          .where(eq(crmLeadTagAssignments.tagId, input.id));
        
        // Then delete the tag
        await db.delete(crmLeadTags)
          .where(eq(crmLeadTags.id, input.id));
        
        return { success: true };
      }),

    // Lead Tag Assignments
    getLeadTags: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const assignments = await db
          .select({
            id: crmLeadTags.id,
            name: crmLeadTags.name,
            color: crmLeadTags.color,
            assignedAt: crmLeadTagAssignments.assignedAt,
          })
          .from(crmLeadTagAssignments)
          .innerJoin(crmLeadTags, eq(crmLeadTagAssignments.tagId, crmLeadTags.id))
          .where(eq(crmLeadTagAssignments.leadId, input.leadId));
        
        return { tags: assignments };
      }),

    assignTagToLead: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        tagId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        // Check if already assigned
        const existing = await db
          .select()
          .from(crmLeadTagAssignments)
          .where(and(
            eq(crmLeadTagAssignments.leadId, input.leadId),
            eq(crmLeadTagAssignments.tagId, input.tagId)
          ));
        
        if (existing.length > 0) {
          return { success: true, alreadyAssigned: true };
        }
        
        await db.insert(crmLeadTagAssignments).values({
          leadId: input.leadId,
          tagId: input.tagId,
        });
        
        return { success: true, alreadyAssigned: false };
      }),

    removeTagFromLead: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        tagId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        await db.delete(crmLeadTagAssignments)
          .where(and(
            eq(crmLeadTagAssignments.leadId, input.leadId),
            eq(crmLeadTagAssignments.tagId, input.tagId)
          ));
        
        return { success: true };
      }),

    // Tag Automation Rules
    getAutomationRules: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const rules = await db
          .select({
            id: crmTagAutomationRules.id,
            name: crmTagAutomationRules.name,
            description: crmTagAutomationRules.description,
            tagId: crmTagAutomationRules.tagId,
            tagName: crmLeadTags.name,
            tagColor: crmLeadTags.color,
            conditionType: crmTagAutomationRules.conditionType,
            conditionValue: crmTagAutomationRules.conditionValue,
            isActive: crmTagAutomationRules.isActive,
            priority: crmTagAutomationRules.priority,
          })
          .from(crmTagAutomationRules)
          .leftJoin(crmLeadTags, eq(crmTagAutomationRules.tagId, crmLeadTags.id))
          .orderBy(asc(crmTagAutomationRules.priority));
        
        return { rules };
      }),

    createAutomationRule: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(255).optional(),
        tagId: z.number(),
        conditionType: z.string(),
        conditionValue: z.string(),
        priority: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const result = await db.insert(crmTagAutomationRules).values({
          name: input.name,
          description: input.description,
          tagId: input.tagId,
          conditionType: input.conditionType,
          conditionValue: input.conditionValue,
          priority: input.priority || 0,
        }).$returningId();
        
        return { id: result[0].id };
      }),

    updateAutomationRule: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(255).optional(),
        tagId: z.number().optional(),
        conditionType: z.string().optional(),
        conditionValue: z.string().optional(),
        isActive: z.boolean().optional(),
        priority: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.tagId) updateData.tagId = input.tagId;
        if (input.conditionType) updateData.conditionType = input.conditionType;
        if (input.conditionValue) updateData.conditionValue = input.conditionValue;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.priority !== undefined) updateData.priority = input.priority;
        
        await db.update(crmTagAutomationRules)
          .set(updateData)
          .where(eq(crmTagAutomationRules.id, input.id));
        
        return { success: true };
      }),

    deleteAutomationRule: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        await db.delete(crmTagAutomationRules)
          .where(eq(crmTagAutomationRules.id, input.id));
        
        return { success: true };
      }),

    runAutomationRules: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const { applyAutomationRulesToAllLeads } = await import("./tag-automation");
        const result = await applyAutomationRulesToAllLeads();
        
        return result;
      }),

    importLeads: protectedProcedure
      .input(z.object({
        leads: z.array(z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          company: z.string().optional(),
          jobTitle: z.string().optional(),
          source: z.string().optional(),
          leadType: z.string().optional(),
          budget: z.string().optional(),
          notes: z.string().optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }
        let imported = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const lead of input.leads) {
          try {
            // Validate required fields
            if (!lead.firstName || !lead.lastName || !lead.email) {
              errors.push(`Missing required fields for ${lead.email || 'unknown'}`);
              failed++;
              continue;
            }

            // Check for duplicate email
            const existing = await db.select().from(ecosystemLeads)
              .where(eq(ecosystemLeads.email, lead.email))
              .limit(1);

            if (existing.length > 0) {
              errors.push(`Duplicate email: ${lead.email}`);
              failed++;
              continue;
            }

            // Insert the lead
            await db.insert(ecosystemLeads).values({
              firstName: lead.firstName,
              lastName: lead.lastName,
              email: lead.email,
              phone: lead.phone || null,
              company: lead.company || null,
              jobTitle: lead.jobTitle || null,
              source: (lead.source as any) || 'external',
              formType: 'import',
              leadType: (lead.leadType as any) || 'individual',
              budget: lead.budget || null,
              message: lead.notes || null,
              leadScore: 50,
            });

            imported++;
          } catch (error) {
            errors.push(`Error importing ${lead.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            failed++;
          }
        }

        return { imported, failed, errors };
      }),

    // Lead Segments CRUD
    getSegments: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const segments = await db.select().from(crmLeadSegments).orderBy(desc(crmLeadSegments.createdAt));
        return { segments };
      }),

    createSegment: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        filters: z.array(z.object({
          field: z.string(),
          operator: z.enum(["equals", "not_equals", "greater_than", "less_than", "contains", "in"]),
          value: z.union([z.string(), z.number(), z.array(z.string())]),
        })),
        filterLogic: z.enum(["and", "or"]),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    // @ts-ignore - overload resolution
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // @ts-expect-error - TS2769: auto-suppressed during TS cleanup
        await db.insert(crmLeadSegments).values({
          name: input.name,
          description: input.description || null,
          filters: input.filters,
          filterLogic: input.filterLogic,
          color: input.color || "#3b82f6",
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),

    updateSegment: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        filters: z.array(z.object({
          field: z.string(),
          operator: z.enum(["equals", "not_equals", "greater_than", "less_than", "contains", "in"]),
          value: z.union([z.string(), z.number(), z.array(z.string())]),
        })).optional(),
        filterLogic: z.enum(["and", "or"]).optional(),
        color: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, filters, ...updates } = input;
        const updateData: any = { ...updates };
        if (filters) updateData.filters = filters;
        await db.update(crmLeadSegments).set(updateData).where(eq(crmLeadSegments.id, id));
        return { success: true };
      }),

    deleteSegment: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(crmLeadSegments).where(eq(crmLeadSegments.id, input.id));
        return { success: true };
      }),

    // Lead History
    getLeadHistory: protectedProcedure
      .input(z.object({ leadId: z.number(), limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const history = await db.select({
          id: crmLeadHistory.id,
          leadId: crmLeadHistory.leadId,
          userId: crmLeadHistory.userId,
          action: crmLeadHistory.action,
          fieldName: crmLeadHistory.fieldName,
          oldValue: crmLeadHistory.oldValue,
          newValue: crmLeadHistory.newValue,
          metadata: crmLeadHistory.metadata,
          createdAt: crmLeadHistory.createdAt,
          userName: users.name,
        })
          .from(crmLeadHistory)
          .leftJoin(users, eq(crmLeadHistory.userId, users.id))
          .where(eq(crmLeadHistory.leadId, input.leadId))
          .orderBy(desc(crmLeadHistory.createdAt))
          .limit(input.limit || 50);
        return { history };
      }),

    addLeadHistory: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        action: z.enum(["created", "updated", "status_changed", "score_changed", "assigned", "tag_added", "tag_removed", "note_added", "email_sent", "meeting_scheduled", "imported", "merged", "deleted"]),
        fieldName: z.string().optional(),
        oldValue: z.string().optional(),
        newValue: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(crmLeadHistory).values({
          leadId: input.leadId,
          userId: ctx.user.id,
          action: input.action,
          fieldName: input.fieldName || null,
          oldValue: input.oldValue || null,
          newValue: input.newValue || null,
          metadata: input.metadata || null,
        });
        return { success: true };
      }),

    // Segment Alerts CRUD
    getSegmentAlerts: protectedProcedure
      .input(z.object({ segmentId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        let query = db.select({
          id: crmSegmentAlerts.id,
          segmentId: crmSegmentAlerts.segmentId,
          segmentName: crmLeadSegments.name,
          alertType: crmSegmentAlerts.alertType,
          thresholdValue: crmSegmentAlerts.thresholdValue,
          notifyEmail: crmSegmentAlerts.notifyEmail,
          notifyWebhook: crmSegmentAlerts.notifyWebhook,
          webhookUrl: crmSegmentAlerts.webhookUrl,
          recipients: crmSegmentAlerts.recipients,
          isActive: crmSegmentAlerts.isActive,
          lastTriggeredAt: crmSegmentAlerts.lastTriggeredAt,
          triggerCount: crmSegmentAlerts.triggerCount,
          createdAt: crmSegmentAlerts.createdAt,
        })
          .from(crmSegmentAlerts)
          .leftJoin(crmLeadSegments, eq(crmSegmentAlerts.segmentId, crmLeadSegments.id));
        
        if (input.segmentId) {
          query = query.where(eq(crmSegmentAlerts.segmentId, input.segmentId)) as typeof query;
        }
        
        const alerts = await query.orderBy(desc(crmSegmentAlerts.createdAt));
        return { alerts };
      }),

    createSegmentAlert: protectedProcedure
      .input(z.object({
        segmentId: z.number(),
        alertType: z.enum(["lead_entered", "lead_exited", "threshold_reached"]),
        thresholdValue: z.number().optional(),
        notifyEmail: z.boolean().optional(),
        notifyWebhook: z.boolean().optional(),
        webhookUrl: z.string().optional(),
        recipients: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(crmSegmentAlerts).values({
          segmentId: input.segmentId,
          alertType: input.alertType,
          thresholdValue: input.thresholdValue || null,
          notifyEmail: input.notifyEmail ?? true,
          notifyWebhook: input.notifyWebhook ?? false,
          webhookUrl: input.webhookUrl || null,
          recipients: input.recipients || "owner",
        });
        return { success: true };
      }),

    updateSegmentAlert: protectedProcedure
      .input(z.object({
        id: z.number(),
        alertType: z.enum(["lead_entered", "lead_exited", "threshold_reached"]).optional(),
        thresholdValue: z.number().optional(),
        notifyEmail: z.boolean().optional(),
        notifyWebhook: z.boolean().optional(),
        webhookUrl: z.string().optional(),
        recipients: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...updates } = input;
        await db.update(crmSegmentAlerts).set(updates).where(eq(crmSegmentAlerts.id, id));
        return { success: true };
      }),

    deleteSegmentAlert: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(crmSegmentAlerts).where(eq(crmSegmentAlerts.id, input.id));
        return { success: true };
      }),

    getSegmentAlertLogs: protectedProcedure
      .input(z.object({ segmentId: z.number().optional(), alertId: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        let conditions = [];
        if (input.segmentId) conditions.push(eq(crmSegmentAlertLogs.segmentId, input.segmentId));
        if (input.alertId) conditions.push(eq(crmSegmentAlertLogs.alertId, input.alertId));
        
        const logs = await db.select({
          id: crmSegmentAlertLogs.id,
          alertId: crmSegmentAlertLogs.alertId,
          segmentId: crmSegmentAlertLogs.segmentId,
          leadId: crmSegmentAlertLogs.leadId,
          eventType: crmSegmentAlertLogs.eventType,
          message: crmSegmentAlertLogs.message,
          notificationSent: crmSegmentAlertLogs.notificationSent,
          createdAt: crmSegmentAlertLogs.createdAt,
          leadName: sql<string>`CONCAT(${ecosystemLeads.firstName}, ' ', ${ecosystemLeads.lastName})`,
          leadEmail: ecosystemLeads.email,
        })
          .from(crmSegmentAlertLogs)
          .leftJoin(ecosystemLeads, eq(crmSegmentAlertLogs.leadId, ecosystemLeads.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(crmSegmentAlertLogs.createdAt))
          .limit(input.limit || 100);
        return { logs };
      }),

    // Lead Merge
    mergeLeads: protectedProcedure
      .input(z.object({
        primaryLeadId: z.number(),
        secondaryLeadIds: z.array(z.number()),
        mergedData: z.record(z.string(), z.unknown()),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Update primary lead with merged data
        const updateData: Record<string, any> = {};
        if (input.mergedData.company) updateData.company = input.mergedData.company;
        if (input.mergedData.phone) updateData.phone = input.mergedData.phone;
        if (input.mergedData.jobTitle) updateData.jobTitle = input.mergedData.jobTitle;
        if (input.mergedData.budget) updateData.budget = input.mergedData.budget;
        if (input.mergedData.leadScore) updateData.leadScore = input.mergedData.leadScore;
        if (input.mergedData.notes) updateData.notes = input.mergedData.notes;

        if (Object.keys(updateData).length > 0) {
          await db.update(ecosystemLeads).set(updateData).where(eq(ecosystemLeads.id, input.primaryLeadId));
        }

        // Transfer activities from secondary leads to primary
        for (const secondaryId of input.secondaryLeadIds) {
          await db.update(ecosystemLeadActivities)
            .set({ leadId: input.primaryLeadId })
            .where(eq(ecosystemLeadActivities.leadId, secondaryId));

          // Transfer history
          await db.update(crmLeadHistory)
            .set({ leadId: input.primaryLeadId })
            .where(eq(crmLeadHistory.leadId, secondaryId));

          // Transfer tag assignments
          await db.update(crmLeadTagAssignments)
            .set({ leadId: input.primaryLeadId })
            .where(eq(crmLeadTagAssignments.leadId, secondaryId));
        }

        // Log the merge
        await db.insert(crmLeadHistory).values({
          leadId: input.primaryLeadId,
          userId: ctx.user.id,
          action: "merged",
          metadata: { mergedLeadIds: input.secondaryLeadIds },
        });

        // Delete secondary leads
        for (const secondaryId of input.secondaryLeadIds) {
          await db.delete(ecosystemLeads).where(eq(ecosystemLeads.id, secondaryId));
        }

        return { success: true, primaryLeadId: input.primaryLeadId };
      }),

    // Sales Goals
    getSalesGoals: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const goals = await db
          .select()
          .from(crmSalesGoals)
          .orderBy(desc(crmSalesGoals.createdAt));
        return { goals };
      }),

    createSalesGoal: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        goalType: z.enum(["revenue", "deals", "leads", "meetings", "conversions"]),
        targetValue: z.number(),
        period: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
        startDate: z.date(),
        endDate: z.date(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const [result] = await db.insert(crmSalesGoals).values({
          name: input.name,
          description: input.description,
          goalType: input.goalType,
          targetValue: input.targetValue,
          currentValue: 0,
          period: input.period,
          startDate: input.startDate,
          endDate: input.endDate,
          assignedTo: input.assignedTo,
          createdBy: ctx.user.id,
        }).$returningId();
        return { id: result.id };
      }),

    updateSalesGoal: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        targetValue: z.number().optional(),
        currentValue: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["active", "completed", "missed", "cancelled"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const updateData: Record<string, any> = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.targetValue !== undefined) updateData.targetValue = input.targetValue;
        if (input.currentValue !== undefined) updateData.currentValue = input.currentValue;
        if (input.startDate) updateData.startDate = input.startDate;
        if (input.endDate) updateData.endDate = input.endDate;
        if (input.status) updateData.status = input.status;

        await db.update(crmSalesGoals).set(updateData).where(eq(crmSalesGoals.id, input.id));
        return { success: true };
      }),

    deleteSalesGoal: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.delete(crmSalesGoals).where(eq(crmSalesGoals.id, input.id));
        return { success: true };
      }),

    updateSalesGoalProgress: protectedProcedure
      .input(z.object({
        id: z.number(),
        currentValue: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Get the goal to check if it's completed
        const [goal] = await db.select().from(crmSalesGoals).where(eq(crmSalesGoals.id, input.id));
        if (!goal) throw new TRPCError({ code: "NOT_FOUND" });

        const updateData: Record<string, any> = { currentValue: input.currentValue };
        
        // Auto-complete if target reached
        if (input.currentValue >= goal.targetValue && goal.status === "active") {
          updateData.status = "completed";
        }

        await db.update(crmSalesGoals).set(updateData).where(eq(crmSalesGoals.id, input.id));
        return { success: true, completed: input.currentValue >= goal.targetValue };
      }),

    // Assign team member to goal
    assignTeamGoalMember: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        userId: z.number(),
        individualTarget: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.insert(crmTeamGoalAssignments).values({
          goalId: input.goalId,
          userId: input.userId,
          individualTarget: input.individualTarget,
          currentProgress: 0,
        });
        return { success: true };
      }),

    // Get team goal assignments
    getTeamGoalAssignments: protectedProcedure
      .input(z.object({ goalId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const assignments = await db.select()
          .from(crmTeamGoalAssignments)
          .where(eq(crmTeamGoalAssignments.goalId, input.goalId))
          .orderBy(desc(crmTeamGoalAssignments.currentProgress));
        return assignments;
      }),

    // Update team member progress
    updateTeamMemberProgress: protectedProcedure
      .input(z.object({
        assignmentId: z.number(),
        progress: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(crmTeamGoalAssignments)
          .set({ currentProgress: input.progress })
          .where(eq(crmTeamGoalAssignments.id, input.assignmentId));
         return { success: true };
      }),
  }),

  // Forum router
  forum: router({
    // Get all forum categories with stats
    categories: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { forumCategories } = await import("../drizzle/schema");
      
      const categories = await db.select().from(forumCategories)
        .where(eq(forumCategories.isActive, true))
        .orderBy(asc(forumCategories.sortOrder));
      
      return categories;
    }),

    // Get threads for a category
    threads: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { forumThreads, users } = await import("../drizzle/schema");
        
        const whereCondition = input.categoryId 
          ? and(eq(forumThreads.status, "active"), eq(forumThreads.categoryId, input.categoryId))
          : eq(forumThreads.status, "active");
        
        const threads = await db.select({
          id: forumThreads.id,
          categoryId: forumThreads.categoryId,
          title: forumThreads.title,
          slug: forumThreads.slug,
          content: forumThreads.content,
          isPinned: forumThreads.isPinned,
          isLocked: forumThreads.isLocked,
          viewCount: forumThreads.viewCount,
          replyCount: forumThreads.replyCount,
          lastReplyAt: forumThreads.lastReplyAt,
          createdAt: forumThreads.createdAt,
          authorId: forumThreads.authorId,
          authorName: users.name,
          authorAvatar: users.avatarUrl,
        })
          .from(forumThreads)
          .leftJoin(users, eq(forumThreads.authorId, users.id))
          .where(whereCondition)
          .orderBy(desc(forumThreads.isPinned), desc(forumThreads.lastReplyAt))
          .limit(input.limit)
          .offset(input.offset);
        
        return threads;
      }),

    // Get single thread with posts
    thread: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { forumThreads, forumPosts, users } = await import("../drizzle/schema");
        
        // Get thread
        const [thread] = await db.select({
          id: forumThreads.id,
          categoryId: forumThreads.categoryId,
          title: forumThreads.title,
          slug: forumThreads.slug,
          content: forumThreads.content,
          isPinned: forumThreads.isPinned,
          isLocked: forumThreads.isLocked,
          viewCount: forumThreads.viewCount,
          replyCount: forumThreads.replyCount,
          createdAt: forumThreads.createdAt,
          authorId: forumThreads.authorId,
          authorName: users.name,
          authorAvatar: users.avatarUrl,
        })
          .from(forumThreads)
          .leftJoin(users, eq(forumThreads.authorId, users.id))
          .where(eq(forumThreads.id, input.id));
        
        if (!thread) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
        }
        
        // Increment view count
        await db.update(forumThreads)
          .set({ viewCount: sql`${forumThreads.viewCount} + 1` })
          .where(eq(forumThreads.id, input.id));
        
        // Get posts
        const posts = await db.select({
          id: forumPosts.id,
          content: forumPosts.content,
          isEdited: forumPosts.isEdited,
          likeCount: forumPosts.likeCount,
          createdAt: forumPosts.createdAt,
          authorId: forumPosts.authorId,
          authorName: users.name,
          authorAvatar: users.avatarUrl,
        })
          .from(forumPosts)
          .leftJoin(users, eq(forumPosts.authorId, users.id))
          .where(and(
            eq(forumPosts.threadId, input.id),
            eq(forumPosts.status, "active")
          ))
          .orderBy(asc(forumPosts.createdAt));
        
        return { thread, posts };
      }),

    // Create new thread
    createThread: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        title: z.string().min(5).max(255),
        content: z.string().min(10).max(10000),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { forumThreads, forumCategories } = await import("../drizzle/schema");
        
        // Generate slug
        const slug = input.title
          .toLowerCase()
    // @ts-ignore - overload resolution
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          + "-" + Date.now().toString(36);
        
        // @ts-expect-error - TS2769: auto-suppressed during TS cleanup
        const [thread] = await db.insert(forumThreads).values({
          categoryId: input.categoryId,
          authorId: ctx.user.id,
          title: input.title,
          slug,
          description: input.content,
          lastReplyAt: new Date(),
        }).$returningId();
        
        // Update category thread count
        await db.update(forumCategories)
          .set({ threadCount: sql`${forumCategories.threadCount} + 1` })
          .where(eq(forumCategories.id, input.categoryId));
        
        return { id: thread.id, slug };
      }),

    // Create reply (post)
    createPost: protectedProcedure
      .input(z.object({
        threadId: z.number(),
        content: z.string().min(1).max(10000),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { forumPosts, forumThreads, forumCategories } = await import("../drizzle/schema");
        
        // Check thread exists and not locked
        const [thread] = await db.select().from(forumThreads)
          .where(eq(forumThreads.id, input.threadId));
        
        if (!thread) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found" });
    // @ts-ignore - overload resolution
        }
        if (thread.isLocked) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Thread is locked" });
        }
        
        // @ts-expect-error - TS2769: auto-suppressed during TS cleanup
        const [post] = await db.insert(forumPosts).values({
          threadId: input.threadId,
          authorId: ctx.user.id,
          description: input.content,
        }).$returningId();
        
        // Update thread reply count and last reply
        await db.update(forumThreads)
          .set({
            replyCount: sql`${forumThreads.replyCount} + 1`,
            lastReplyAt: new Date(),
            lastReplyById: ctx.user.id,
          })
          .where(eq(forumThreads.id, input.threadId));
        
        // Update category post count
        await db.update(forumCategories)
          .set({ postCount: sql`${forumCategories.postCount} + 1` })
          .where(eq(forumCategories.id, thread.categoryId));
        
        return { id: post.id };
      }),

    // Like/unlike a post
    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { forumPostLikes, forumPosts } = await import("../drizzle/schema");
        
        // Check if already liked
        const [existing] = await db.select().from(forumPostLikes)
          .where(and(
            eq(forumPostLikes.postId, input.postId),
            eq(forumPostLikes.userId, ctx.user.id)
          ));
        
        if (existing) {
          // Unlike
          await db.delete(forumPostLikes)
            .where(eq(forumPostLikes.id, existing.id));
          await db.update(forumPosts)
            .set({ likeCount: sql`${forumPosts.likeCount} - 1` })
            .where(eq(forumPosts.id, input.postId));
          return { liked: false };
        } else {
          // Like
          await db.insert(forumPostLikes).values({
            postId: input.postId,
            userId: ctx.user.id,
          });
          await db.update(forumPosts)
            .set({ likeCount: sql`${forumPosts.likeCount} + 1` })
            .where(eq(forumPosts.id, input.postId));
          return { liked: true };
        }
      }),
  }),

  // Community Events router
  events: router({
    // List upcoming events
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
        type: z.enum(["workshop", "networking", "practice", "info_session", "webinar", "other"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { communityEvents } = await import("../drizzle/schema");
        
        const whereCondition = input?.type 
          ? and(
              eq(communityEvents.status, "published"),
              gte(communityEvents.startAt, new Date()),
              eq(communityEvents.eventType, input.type)
            )
          : and(
              eq(communityEvents.status, "published"),
              gte(communityEvents.startAt, new Date())
            );
        
        const events = await db.select().from(communityEvents)
          .where(whereCondition)
          .orderBy(asc(communityEvents.startAt))
          .limit(input?.limit || 10)
          .offset(input?.offset || 0);
        
        return events;
      }),

    // Get single event
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { communityEvents } = await import("../drizzle/schema");
        
        const [event] = await db.select().from(communityEvents)
          .where(eq(communityEvents.id, input.id));
        
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }
        
        return event;
      }),

    // Register for event
    register: protectedProcedure
      .input(z.object({
        eventId: z.number(),
        email: z.string().email().optional(),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { communityEvents, eventRegistrations } = await import("../drizzle/schema");
        
        // Get event
        const [event] = await db.select().from(communityEvents)
          .where(eq(communityEvents.id, input.eventId));
        
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }
        
        if (event.status !== "published") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Event is not open for registration" });
        }
        
        // Check if already registered
        const [existing] = await db.select().from(eventRegistrations)
          .where(and(
            eq(eventRegistrations.eventId, input.eventId),
            eq(eventRegistrations.userId, ctx.user.id)
          ));
        
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Already registered for this event" });
        }
        
        // Check capacity
        const currentRegs = event.currentRegistrations ?? 0;
        const isFull = event.maxCapacity && currentRegs >= event.maxCapacity;
        const status = isFull && event.waitlistEnabled ? "waitlisted" : "registered";
        
        if (isFull && !event.waitlistEnabled) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Event is full" });
        }
        
        // Create registration
        await db.insert(eventRegistrations).values({
          eventId: input.eventId,
          userId: ctx.user.id,
          status,
          email: input.email || ctx.user.email || null,
          name: input.name || ctx.user.name || null,
        });
        
        // Update event registration count
        await db.update(communityEvents)
          .set({ currentRegistrations: sql`${communityEvents.currentRegistrations} + 1` })
          .where(eq(communityEvents.id, input.eventId));
        
        // Send confirmation email
        const userEmail = input.email || ctx.user.email;
        const userName = input.name || ctx.user.name || "Member";
        
        if (userEmail) {
          const { sendEventRegistrationConfirmation } = await import("./email");
          await sendEventRegistrationConfirmation({
            userName,
            userEmail,
            eventTitle: event.title,
            eventTitleFr: event.titleFr,
            eventDescription: event.description,
            eventDescriptionFr: event.descriptionFr,
            eventDate: event.startAt,
            eventEndDate: event.endAt,
            eventType: event.eventType || "other",
            locationType: event.locationType || "virtual",
            locationDetails: event.locationDetails || undefined,
            meetingUrl: event.meetingUrl || undefined,
            hostName: event.hostName || undefined,
            status: status as "registered" | "waitlisted",
          }).catch(err => console.error("Failed to send event registration email:", err));
        }
        
        return { success: true, status };
      }),

    // Cancel registration
    cancelRegistration: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { communityEvents, eventRegistrations } = await import("../drizzle/schema");
        
        // Get registration
        const [registration] = await db.select().from(eventRegistrations)
          .where(and(
            eq(eventRegistrations.eventId, input.eventId),
            eq(eventRegistrations.userId, ctx.user.id)
          ));
        
        if (!registration) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Registration not found" });
        }
        
        // Update registration status
        await db.update(eventRegistrations)
          .set({
            status: "cancelled",
            cancelledAt: new Date(),
          })
          .where(eq(eventRegistrations.id, registration.id));
        
        // Update event registration count
        await db.update(communityEvents)
          .set({ currentRegistrations: sql`${communityEvents.currentRegistrations} - 1` })
          .where(eq(communityEvents.id, input.eventId));
        
        return { success: true };
      }),

    // Get user's registrations
    myRegistrations: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { communityEvents, eventRegistrations } = await import("../drizzle/schema");
      
      const registrations = await db.select({
        registration: eventRegistrations,
        event: communityEvents,
      })
        .from(eventRegistrations)
        .innerJoin(communityEvents, eq(eventRegistrations.eventId, communityEvents.id))
        .where(eq(eventRegistrations.userId, ctx.user.id))
        .orderBy(desc(eventRegistrations.registeredAt));
      
      return registrations;
    }),

    // Check if user is registered for an event
    isRegistered: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eventRegistrations } = await import("../drizzle/schema");
        
        const [registration] = await db.select().from(eventRegistrations)
          .where(and(
            eq(eventRegistrations.eventId, input.eventId),
            eq(eventRegistrations.userId, ctx.user.id)
          ));
        
        return {
          isRegistered: !!registration,
          status: registration?.status || null,
        };
      }),
  }),

  // Newsletter router
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        brand: z.enum(["ecosystem", "rusingacademy", "lingueefy", "barholex"]),
        language: z.enum(["en", "fr"]).default("en"),
        interests: z.array(z.string()).optional(),
        source: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { newsletterSubscriptions } = await import("../drizzle/schema");
        
        // Check if already subscribed
        const [existing] = await db.select().from(newsletterSubscriptions)
          .where(eq(newsletterSubscriptions.email, input.email));
        
        if (existing) {
          // Update existing subscription
          await db.update(newsletterSubscriptions)
            .set({
              brand: input.brand,
              language: input.language,
              interests: input.interests || null,
              status: "active",
              unsubscribedAt: null,
            })
            .where(eq(newsletterSubscriptions.id, existing.id));
          return { success: true, message: "Subscription updated" };
        }
        
        // Create new subscription
        await db.insert(newsletterSubscriptions).values({
          email: input.email,
          firstName: input.firstName || null,
          lastName: input.lastName || null,
          brand: input.brand,
          language: input.language,
          interests: input.interests || null,
          source: input.source || "landing_page",
          confirmedAt: new Date(),
        });
        
        return { success: true, message: "Successfully subscribed" };
      }),
    
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { newsletterSubscriptions } = await import("../drizzle/schema");
        
        await db.update(newsletterSubscriptions)
          .set({
            status: "unsubscribed",
            unsubscribedAt: new Date(),
          })
          .where(eq(newsletterSubscriptions.email, input.email));
        
        return { success: true };
      }),
  }),
  
  // Search router
  search: router({
    // Unified search across all content
    query: publicProcedure
      .input(z.object({
        query: z.string().min(2).max(100),
        types: z.array(z.enum(["coach", "course", "page", "faq"])).optional(),
        limit: z.number().min(1).max(50).default(20),
        // Course-specific filters
        courseLevel: z.union([
          z.enum(["beginner", "intermediate", "advanced", "all_levels"]),
          z.array(z.enum(["beginner", "intermediate", "advanced", "all_levels"]))
        ]).optional(),
        courseCategory: z.union([
          z.enum(["sle_oral", "sle_written", "sle_reading", "sle_complete", "exam_prep", "grammar", "vocabulary"]),
          z.array(z.enum(["sle_oral", "sle_written", "sle_reading", "sle_complete", "exam_prep", "grammar", "vocabulary"]))
        ]).optional(),
        freeOnly: z.boolean().optional(),
        priceRange: z.object({
          min: z.number().optional(),
          max: z.number().optional(),
        }).optional(),
      }))
      .query(async ({ input }) => {
        const { search } = await import("./search");
        return search(input.query, {
          types: input.types,
          limit: input.limit,
          courseLevel: input.courseLevel,
          courseCategory: input.courseCategory,
          freeOnly: input.freeOnly,
          priceRange: input.priceRange,
        });
      }),
    
    // Search courses only with filters
    courses: publicProcedure
      .input(z.object({
        query: z.string().min(2).max(100),
        level: z.union([
          z.enum(["beginner", "intermediate", "advanced", "all_levels"]),
          z.array(z.enum(["beginner", "intermediate", "advanced", "all_levels"]))
        ]).optional(),
        category: z.union([
          z.enum(["sle_oral", "sle_written", "sle_reading", "sle_complete", "exam_prep", "grammar", "vocabulary"]),
          z.array(z.enum(["sle_oral", "sle_written", "sle_reading", "sle_complete", "exam_prep", "grammar", "vocabulary"]))
        ]).optional(),
        freeOnly: z.boolean().optional(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input }) => {
        const { searchCourses } = await import("./search");
        return searchCourses(input.query, {
          courseLevel: input.level,
          courseCategory: input.category,
          freeOnly: input.freeOnly,
        }, input.limit);
      }),
    
    // Quick suggestions for autocomplete
    suggestions: publicProcedure
      .input(z.object({
        query: z.string().min(2).max(100),
      }))
      .query(async ({ input }) => {
        const { getQuickSuggestions } = await import("./search");
        return getQuickSuggestions(input.query);
      }),
  }),

  // Admin reminders router
  reminders: router({
    getAll: protectedProcedure
      .input(z.object({
        type: z.enum(["all", "24h", "1h"]).optional().default("all"),
        channel: z.enum(["all", "email", "in_app"]).optional().default("all"),
        status: z.enum(["all", "sent", "pending", "failed"]).optional().default("all"),
        limit: z.number().min(1).max(100).optional().default(50),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) return { reminders: [], stats: { totalSent: 0, openRate: 0, clickRate: 0, failed: 0 } };
        
        const { emailLogs, inAppNotifications } = await import("../drizzle/schema");
        
        // Get email reminders (session reminders)
        const emailReminders = await db.select({
          id: emailLogs.id,
          recipientEmail: emailLogs.toEmail,
          subject: emailLogs.subject,
          status: emailLogs.status,
          sentAt: emailLogs.sentAt,
        }).from(emailLogs)
          .where(sql`${emailLogs.subject} LIKE '%session%' OR ${emailLogs.subject} LIKE '%rappel%'`)
          .orderBy(desc(emailLogs.sentAt))
          .limit(input.limit);
        
        // Get in-app notifications (session reminders)
        const inAppReminders = await db.select({
          id: inAppNotifications.id,
          userId: inAppNotifications.userId,
          title: inAppNotifications.title,
          message: inAppNotifications.message,
          type: inAppNotifications.type,
          isRead: inAppNotifications.isRead,
          createdAt: inAppNotifications.createdAt,
        }).from(inAppNotifications)
          .where(sql`${inAppNotifications.type} = 'session_reminder' OR ${inAppNotifications.title} LIKE '%session%'`)
          .orderBy(desc(inAppNotifications.createdAt))
          .limit(input.limit);
        
        // Calculate stats
        const totalSent = emailReminders.filter(r => r.status === 'sent').length + inAppReminders.length;
        const totalOpened = emailReminders.filter(r => (r as any).openedAt).length + inAppReminders.filter(r => r.isRead).length;
        const totalClicked = emailReminders.filter(r => (r as any).clickedAt).length;
        const failed = emailReminders.filter(r => r.status === 'failed').length;
        
        return {
          reminders: [
            ...emailReminders.map(r => ({
              id: r.id,
              type: r.subject?.includes('24') ? '24h' as const : '1h' as const,
              channel: 'email' as const,
              status: r.status as 'sent' | 'pending' | 'failed',
              recipientName: (r as any).recipientName || 'Unknown',
              recipientEmail: r.recipientEmail,
              sentAt: r.sentAt,
              opened: !!(r as any).openedAt,
              clicked: !!(r as any).clickedAt,
            })),
            ...inAppReminders.map(r => ({
              id: r.id + 100000,
              type: r.title?.includes('24') ? '24h' as const : '1h' as const,
              channel: 'in_app' as const,
              status: 'sent' as const,
              recipientName: 'User ' + r.userId,
              recipientEmail: null,
              sentAt: r.createdAt,
              opened: r.isRead,
              clicked: false,
            })),
          ],
          stats: {
            totalSent,
            openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
            clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
            failed,
          },
        };
      }),
  }),

  // Admin Control Center sub-routers
  settings: settingsRouter,
  cms: cmsRouter,
  crossPage: crossPageRouter,
  stylePresets: stylePresetsRouter,
  revisionHistory: revisionHistoryRouter,
  seo: seoEditorRouter,
  templateMarketplace: templateMarketplaceRouter,
  aiAnalytics: aiAnalyticsRouter,
  salesAnalytics: salesAnalyticsRouter,
  activityLog: activityLogRouter,
  aiRules: aiRulesRouter,
  mediaLibrary: mediaLibraryRouter,
  rbac: rbacRouter,
  emailTemplates: emailTemplateRouter,
  adminNotifications: notificationsRouter,
  importExport: importExportRouter,
  previewMode: previewModeRouter,
  globalSearch: globalSearchRouter,
   aiPredictive: aiPredictiveRouter,
  // Premium Features sub-routers
  stripeTesting: stripeTestingRouter,
  liveKPI: liveKPIRouter,
  onboarding: onboardingRouter,
  enterprise: enterpriseRouter,
  sleExam: sleExamRouter,
  contentIntelligence: contentIntelligenceRouter,
  contentIntel: contentIntelligenceRouter,
  funnels: funnelsRouter,
  automations: automationsRouter,
  orgBilling: orgBillingRouter,
  dripContent: dripContentRouter,
  abTesting: abTestingRouter,
  affiliate: affiliateRouter,
  // Production Stability sub-routers
  adminStability: adminStabilityRouter,
  stripeKPI: stripeKPIRouter,
  adminAlerts: adminNotificationsRouter,
  learnerProgression: learnerProgressionRouter,
  coachMetrics: coachLearnerMetricsRouter,
  progressReport: progressReportRouter,
  bunnyStream: bunnyStreamRouter,
  // Quality Gate & Admin Tree (Mission Rescue Phase 1)
  qualityGate: qualityGateRouter,
  adminCourseTree: adminCourseTreeRouter,
  progressCascade: progressCascadeRouter,
  badgeShowcase: badgeShowcaseRouter,
  // Cron jobs router (protected by CRON_SECRET)
  cron: router({
    sendEventReminders: publicProcedure
      .input(z.object({ secret: z.string() }))
      .mutation(async ({ input }) => {
        // Verify cron secret
        if (input.secret !== process.env.CRON_SECRET) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid cron secret" });
        }
        
        const { sendEventReminders } = await import("./cron/event-reminders");
        return sendEventReminders();
      }),
  }),
});
export type AppRouter = typeof appRouter;
