/**
 * Client Portal tRPC Router
 * 
 * Provides CRUD operations for government departments/organizations.
 * Access is restricted to users with role "hr_manager" or "admin".
 * HR managers can only see data for their assigned organization.
 */

import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as cpDb from "./db-client-portal";
import crypto from "crypto";
import { sendInvitationNotification } from "./notifications";

/* ─────────────── Middleware: resolve org for HR manager ─────────────── */

const hrManagerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.user.role;
  if (role !== "hr_manager" && role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Client Portal access requires hr_manager or admin role" });
  }

  let organizationId: number | null = null;

  if (role === "hr_manager") {
    const managerOrg = await cpDb.getManagerOrg(ctx.user.id);
    if (!managerOrg) {
      throw new TRPCError({ code: "FORBIDDEN", message: "No organization assigned to this manager" });
    }
    organizationId = managerOrg.organizationId;
  }

  return next({
    ctx: {
      ...ctx,
      organizationId, // null for admin (can access all), number for hr_manager
      isAdmin: role === "admin",
    },
  });
});

/** Resolve the effective org ID: for hr_manager it's their assigned org, for admin it's from input */
function resolveOrgId(ctx: { organizationId: number | null; isAdmin: boolean }, inputOrgId?: number): number {
  if (ctx.isAdmin) {
    if (!inputOrgId) throw new TRPCError({ code: "BAD_REQUEST", message: "Admin must specify organizationId" });
    return inputOrgId;
  }
  return ctx.organizationId!;
}

/* ═══════════════════════════════════════════════════════════
   CLIENT PORTAL ROUTER
   ═══════════════════════════════════════════════════════════ */

export const clientPortalRouter = router({
  /* ─────────────── Dashboard Overview ─────────────── */
  dashboard: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getDashboardOverview(orgId);
    }),

  /* ─────────────── Organization ─────────────── */
  getOrganization: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getOrganization(orgId);
    }),

  listOrganizations: hrManagerProcedure.query(async ({ ctx }) => {
    if (!ctx.isAdmin) {
      // HR managers see only their org
      const org = await cpDb.getOrganization(ctx.organizationId!);
      return org ? [org] : [];
    }
    return cpDb.listOrganizations();
  }),

  createOrganization: hrManagerProcedure
    .input(z.object({
      name: z.string().min(1),
      nameFr: z.string().optional(),
      orgType: z.enum(["federal_department", "provincial_ministry", "crown_corporation", "agency", "other"]).optional(),
      sector: z.string().optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      postalCode: z.string().optional(),
      contractStartDate: z.string().optional(),
      contractEndDate: z.string().optional(),
      maxParticipants: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.isAdmin) throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create organizations" });
      return cpDb.createOrganization(input);
    }),

  /* ─────────────── Participants ─────────────── */
  getParticipants: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getParticipants(orgId);
    }),

  getParticipant: hrManagerProcedure
    .input(z.object({ id: z.number(), organizationId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input.organizationId);
      return cpDb.getParticipant(input.id, orgId);
    }),

  createParticipant: hrManagerProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      employeeId: z.string().optional(),
      department: z.string().optional(),
      position: z.string().optional(),
      currentLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
      targetLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
      program: z.enum(["FSL", "ESL"]).optional(),
      organizationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input.organizationId);
      return cpDb.createParticipant({ ...input, organizationId: orgId });
    }),

  updateParticipant: hrManagerProcedure
    .input(z.object({
      id: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      employeeId: z.string().optional(),
      department: z.string().optional(),
      position: z.string().optional(),
      currentLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
      targetLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
      program: z.enum(["FSL", "ESL"]).optional(),
      status: z.enum(["active", "on_hold", "completed", "withdrawn"]).optional(),
      organizationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input.organizationId);
      const { id, organizationId: _, ...data } = input;
      return cpDb.updateParticipant(id, orgId, data);
    }),

  /* ─────────────── Training Cohorts ─────────────── */
  getCohorts: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getCohorts(orgId);
    }),

  createCohort: hrManagerProcedure
    .input(z.object({
      name: z.string().min(1),
      nameFr: z.string().optional(),
      program: z.enum(["FSL", "ESL"]).optional(),
      cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      schedule: z.string().optional(),
      maxParticipants: z.number().optional(),
      description: z.string().optional(),
      organizationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input.organizationId);
      return cpDb.createCohort({ ...input, organizationId: orgId });
    }),

  addParticipantToCohort: hrManagerProcedure
    .input(z.object({ cohortId: z.number(), participantId: z.number() }))
    .mutation(async ({ input }) => {
      return cpDb.addParticipantToCohort(input.cohortId, input.participantId);
    }),

  getCohortParticipants: hrManagerProcedure
    .input(z.object({ cohortId: z.number() }))
    .query(async ({ input }) => {
      return cpDb.getCohortParticipants(input.cohortId);
    }),

  /* ─────────────── Billing & Budget ─────────────── */
  getBillingRecords: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getBillingRecords(orgId);
    }),

  getBillingStats: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getBillingStats(orgId);
    }),

  getBudgetAllocations: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional(), fiscalYear: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getBudgetAllocations(orgId, input?.fiscalYear);
    }),

  /* ─────────────── Compliance ─────────────── */
  getComplianceRecords: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getComplianceRecords(orgId);
    }),

  getComplianceStats: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getComplianceStats(orgId);
    }),

  createComplianceRecord: hrManagerProcedure
    .input(z.object({
      participantId: z.number(),
      assessmentType: z.enum(["sle_reading", "sle_writing", "sle_oral", "internal_assessment", "placement_test"]),
      currentResult: z.string().optional(),
      targetResult: z.string().optional(),
      assessmentDate: z.string().optional(),
      nextAssessmentDate: z.string().optional(),
      organizationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input.organizationId);
      return cpDb.createComplianceRecord({ ...input, organizationId: orgId });
    }),

  /* ─────────────── Coaching Sessions ─────────────── */
  getCoachingSessions: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getCoachingSessions({ orgId });
    }),

  createCoachingSession: hrManagerProcedure
    .input(z.object({
      title: z.string().min(1),
      sessionType: z.enum(["individual", "group", "assessment", "consultation"]).optional(),
      durationMinutes: z.number().optional(),
      participantId: z.number().optional(),
      coachId: z.number().optional(),
      cohortId: z.number().optional(),
      scheduledAt: z.string().optional(),
      meetingUrl: z.string().optional(),
      description: z.string().optional(),
      organizationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input.organizationId);
      return cpDb.createCoachingSession({
        ...input,
        organizationId: orgId,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      });
    }),

  updateCoachingSession: hrManagerProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).optional(),
      coachNotes: z.string().optional(),
      participantFeedback: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
      cancelReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return cpDb.updateCoachingSession(input.id, input);
    }),

  getSessionStats: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getSessionStats(orgId);
    }),

  /* ─────────────── Invitations ─────────────── */
  sendInvitation: hrManagerProcedure
    .input(z.object({
      email: z.string().email(),
      invitedName: z.string().optional(),
      role: z.enum(["primary_contact", "training_manager", "observer"]).optional(),
      message: z.string().optional(),
      organizationId: z.number().optional(),
      origin: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input.organizationId);
      const token = crypto.randomBytes(48).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const result = await cpDb.createInvitation({
        organizationId: orgId,
        email: input.email,
        invitedName: input.invitedName,
        role: input.role,
        token,
        invitedBy: ctx.user.id,
        expiresAt,
        message: input.message,
      });

      // Send invitation notification
      const org = await cpDb.getOrganization(orgId);
      try {
        await sendInvitationNotification({
          email: input.email,
          invitedName: input.invitedName,
          organizationName: org?.name ?? "Organization",
          inviterName: ctx.user.name ?? "Team Member",
          inviteUrl: `${input.origin ?? ""}/invite/${token}`,
          role: input.role ?? "training_manager",
          message: input.message,
        });
      } catch (e) {
        console.warn("[Invitation] Notification failed:", e);
      }

      return result;
    }),

  getInvitations: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getInvitationsByOrg(orgId);
    }),

  revokeInvitation: hrManagerProcedure
    .input(z.object({ invitationId: z.number(), organizationId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input.organizationId);
      return cpDb.revokeInvitation(input.invitationId, orgId);
    }),

  getOrgManagers: hrManagerProcedure
    .input(z.object({ organizationId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = resolveOrgId(ctx, input?.organizationId);
      return cpDb.getOrgManagers(orgId);
    }),

  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const result = await cpDb.acceptInvitation(input.token, ctx.user.id);
      if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to process invitation" });
      if ("error" in result) throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      return result;
    }),

  validateInvitation: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const invitation = await cpDb.getInvitationByToken(input.token);
      if (!invitation) return { valid: false, reason: "Invitation not found" };
      if (invitation.status !== "pending") return { valid: false, reason: `Invitation already ${invitation.status}` };
      if (new Date(invitation.expiresAt) < new Date()) return { valid: false, reason: "Invitation has expired" };
      const org = await cpDb.getOrganization(invitation.organizationId);
      return {
        valid: true,
        email: invitation.email,
        invitedName: invitation.invitedName,
        role: invitation.role,
        organizationName: org?.name ?? "Unknown",
        organizationNameFr: org?.nameFr,
      };
    }),
});
