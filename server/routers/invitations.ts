import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "../../drizzle/schema";
import { sendEmail } from "../email";
import { generateEmailHeader, generateEmailFooter, EMAIL_BRANDING } from "../email-branding";
import { randomBytes } from "crypto";

// ============================================================================
// Helpers
// ============================================================================

function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

function isAdmin(ctx: { user: { role: string; openId: string } }): boolean {
  return (
    ctx.user.role === "admin" ||
    ctx.user.role === "owner" ||
    ctx.user.openId === process.env.OWNER_OPEN_ID
  );
}

function assertAdmin(ctx: { user: { role: string; openId: string } }): void {
  if (!isAdmin(ctx)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

function getBaseUrl(req?: any): string {
  if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL;
  if (req) {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "app.rusingacademy.ca";
    return `${proto}://${host}`;
  }
  return "https://app.rusingacademy.ca";
}

async function sendInvitationEmail(params: {
  email: string;
  token: string;
  role: string;
  inviterName: string;
  baseUrl: string;
}): Promise<boolean> {
  const { email, token, role, inviterName, baseUrl } = params;
  const inviteUrl = `${baseUrl}/invite/${token}`;
  const roleName = role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const html = `
    ${generateEmailHeader("You're Invited to RusingÂcademy", `Join as ${roleName}`)}
    <div style="padding: 32px; font-family: ${EMAIL_BRANDING.fontFamily}; color: #1a1a2e;">
      <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
      <p style="font-size: 16px; line-height: 1.6;">
        <strong>${inviterName}</strong> has invited you to join <strong>RusingÂcademy</strong> as a <strong>${roleName}</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        RusingÂcademy is a premium bilingual learning platform dedicated to helping Canadian public servants achieve their language proficiency goals.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${EMAIL_BRANDING.primaryColor}, ${EMAIL_BRANDING.accentColor || "#6366f1"}); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
      </div>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        This invitation expires in <strong>7 days</strong>. If you did not expect this invitation, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; word-break: break-all;">
        Or copy this link: ${inviteUrl}
      </p>
    </div>
    ${generateEmailFooter("en")}
  `;

  return sendEmail({
    to: email,
    subject: `You're invited to join RusingÂcademy as ${roleName}`,
    html,
    text: `${inviterName} has invited you to join RusingÂcademy as a ${roleName}. Accept your invitation here: ${inviteUrl} — This invitation expires in 7 days.`,
  });
}

// ============================================================================
// Router
// ============================================================================

export const invitationsRouter = router({
  // 1. CREATE — Send a new invitation
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.enum(["admin", "hr_admin", "coach", "learner", "user"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if user already exists with this email
      const [existingUser] = await db
        .select({ id: schema.users.id, email: schema.users.email, role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.email, input.email.toLowerCase()))
        .limit(1);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A user with email ${input.email} already exists (role: ${existingUser.role}).`,
        });
      }

      // Check if there's already a pending invitation for this email
      const [existingInvite] = await db
        .select()
        .from(schema.adminInvitations)
        .where(
          and(
            eq(schema.adminInvitations.email, input.email.toLowerCase()),
            eq(schema.adminInvitations.status, "pending")
          )
        )
        .limit(1);

      if (existingInvite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A pending invitation already exists for ${input.email}. Revoke it first or resend.`,
        });
      }

      // Generate token and expiry (7 days)
      const token = generateInviteToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Insert invitation
      const [inserted] = await db
        .insert(schema.adminInvitations)
        .values({
          email: input.email.toLowerCase(),
          role: input.role,
          token,
          invitedBy: ctx.user.id,
          status: "pending",
          expiresAt,
        })
        .$returningId();

      // Send invitation email
      const baseUrl = getBaseUrl(ctx.req);
      const inviterName = ctx.user.name || ctx.user.email || "RusingÂcademy Admin";
      
      try {
        await sendInvitationEmail({
          email: input.email.toLowerCase(),
          token,
          role: input.role,
          inviterName,
          baseUrl,
        });
        console.log(`[Invitations] Invitation email sent to ${input.email} (role: ${input.role})`);
      } catch (emailError) {
        console.error("[Invitations] Failed to send invitation email:", emailError);
        // Don't fail the invitation creation if email fails
      }

      return {
        id: inserted.id,
        email: input.email.toLowerCase(),
        role: input.role,
        expiresAt,
        token,
      };
    }),

  // 2. LIST — Get all invitations (admin only)
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "accepted", "revoked", "expired", "all"]).optional().default("all"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) return [];

      let invitations = await db
        .select({
          id: schema.adminInvitations.id,
          email: schema.adminInvitations.email,
          role: schema.adminInvitations.role,
          status: schema.adminInvitations.status,
          invitedBy: schema.adminInvitations.invitedBy,
          expiresAt: schema.adminInvitations.expiresAt,
          acceptedAt: schema.adminInvitations.acceptedAt,
          createdAt: schema.adminInvitations.createdAt,
        })
        .from(schema.adminInvitations)
        .orderBy(desc(schema.adminInvitations.createdAt));

      // Auto-expire pending invitations that have passed their expiry date
      const now = new Date();
      for (const inv of invitations) {
        if (inv.status === "pending" && inv.expiresAt && new Date(inv.expiresAt) < now) {
          await db
            .update(schema.adminInvitations)
            .set({ status: "expired" })
            .where(eq(schema.adminInvitations.id, inv.id));
          inv.status = "expired";
        }
      }

      // Filter by status
      const statusFilter = input?.status || "all";
      if (statusFilter !== "all") {
        invitations = invitations.filter((i) => i.status === statusFilter);
      }

      // Enrich with inviter name
      const inviterIds = [...new Set(invitations.map((i) => i.invitedBy))];
      const inviters: Record<number, string> = {};
      for (const id of inviterIds) {
        const [user] = await db
          .select({ name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, id))
          .limit(1);
        inviters[id] = user?.name || user?.email || "Unknown";
      }

      return invitations.map((inv) => ({
        ...inv,
        inviterName: inviters[inv.invitedBy] || "Unknown",
      }));
    }),

  // 3. RESEND — Resend invitation email (generates new token + extends expiry)
  resend: protectedProcedure
    .input(z.object({ invitationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [invitation] = await db
        .select()
        .from(schema.adminInvitations)
        .where(eq(schema.adminInvitations.id, input.invitationId))
        .limit(1);

      if (!invitation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
      }

      if (invitation.status === "accepted") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot resend an accepted invitation" });
      }

      // Generate new token and extend expiry
      const newToken = generateInviteToken();
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db
        .update(schema.adminInvitations)
        .set({
          token: newToken,
          expiresAt: newExpiresAt,
          status: "pending",
        })
        .where(eq(schema.adminInvitations.id, input.invitationId));

      // Send email
      const baseUrl = getBaseUrl(ctx.req);
      const inviterName = ctx.user.name || ctx.user.email || "RusingÂcademy Admin";

      try {
        await sendInvitationEmail({
          email: invitation.email,
          token: newToken,
          role: invitation.role,
          inviterName,
          baseUrl,
        });
        console.log(`[Invitations] Resent invitation to ${invitation.email}`);
      } catch (emailError) {
        console.error("[Invitations] Failed to resend invitation email:", emailError);
      }

      return { success: true, email: invitation.email, expiresAt: newExpiresAt };
    }),

  // 4. REVOKE — Cancel a pending invitation
  revoke: protectedProcedure
    .input(z.object({ invitationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [invitation] = await db
        .select()
        .from(schema.adminInvitations)
        .where(eq(schema.adminInvitations.id, input.invitationId))
        .limit(1);

      if (!invitation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
      }

      if (invitation.status === "accepted") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot revoke an accepted invitation" });
      }

      await db
        .update(schema.adminInvitations)
        .set({ status: "revoked" })
        .where(eq(schema.adminInvitations.id, input.invitationId));

      console.log(`[Invitations] Revoked invitation for ${invitation.email}`);
      return { success: true, email: invitation.email };
    }),

  // 5. VERIFY TOKEN — Public endpoint to validate an invitation token
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [invitation] = await db
        .select({
          id: schema.adminInvitations.id,
          email: schema.adminInvitations.email,
          role: schema.adminInvitations.role,
          status: schema.adminInvitations.status,
          expiresAt: schema.adminInvitations.expiresAt,
        })
        .from(schema.adminInvitations)
        .where(eq(schema.adminInvitations.token, input.token))
        .limit(1);

      if (!invitation) {
        return { valid: false, reason: "invalid_token" as const, invitation: null };
      }

      if (invitation.status === "accepted") {
        return { valid: false, reason: "already_accepted" as const, invitation: null };
      }

      if (invitation.status === "revoked") {
        return { valid: false, reason: "revoked" as const, invitation: null };
      }

      const now = new Date();
      if (invitation.expiresAt && new Date(invitation.expiresAt) < now) {
        // Auto-expire
        await db
          .update(schema.adminInvitations)
          .set({ status: "expired" })
          .where(eq(schema.adminInvitations.id, invitation.id));
        return { valid: false, reason: "expired" as const, invitation: null };
      }

      return {
        valid: true,
        reason: null,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
        },
      };
    }),

  // 6. ACCEPT — Accept an invitation and create user account
  accept: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string().min(2, "Name must be at least 2 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Validate token
      const [invitation] = await db
        .select()
        .from(schema.adminInvitations)
        .where(eq(schema.adminInvitations.token, input.token))
        .limit(1);

      if (!invitation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invitation token" });
      }

      if (invitation.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `This invitation has already been ${invitation.status}`,
        });
      }

      const now = new Date();
      if (invitation.expiresAt && new Date(invitation.expiresAt) < now) {
        await db
          .update(schema.adminInvitations)
          .set({ status: "expired" })
          .where(eq(schema.adminInvitations.id, invitation.id));
        throw new TRPCError({ code: "BAD_REQUEST", message: "This invitation has expired" });
      }

      // Check if email is already taken
      const [existingUser] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, invitation.email))
        .limit(1);

      if (existingUser) {
        // Mark invitation as accepted and return
        await db
          .update(schema.adminInvitations)
          .set({ status: "accepted", acceptedAt: now })
          .where(eq(schema.adminInvitations.id, invitation.id));
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists. Please log in instead.",
        });
      }

      // Hash password with Argon2id
      const argon2 = await import("argon2");
      const passwordHash = await argon2.hash(input.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      // Generate openId
      const openId = `inv_${Date.now()}_${randomBytes(6).toString("hex")}`;

      // Create user
      const [newUser] = await db
        .insert(schema.users)
        .values({
          openId,
          email: invitation.email,
          name: input.name,
          passwordHash,
          loginMethod: "email",
          role: invitation.role as any,
          emailVerified: true, // Invited users are pre-verified
        })
        .$returningId();

      // Mark invitation as accepted
      await db
        .update(schema.adminInvitations)
        .set({ status: "accepted", acceptedAt: now })
        .where(eq(schema.adminInvitations.id, invitation.id));

      // Create session
      const { createSessionJWT, setSessionCookie } = await import("../_core/session");
      const jwt = await createSessionJWT({
        userId: newUser.id,
        openId,
        email: invitation.email,
        name: input.name,
        role: invitation.role,
        authMethod: "email",
      });
      setSessionCookie(ctx.res, jwt);

      console.log(`[Invitations] Invitation accepted: ${invitation.email} → role: ${invitation.role}`);

      return {
        success: true,
        user: {
          id: newUser.id,
          email: invitation.email,
          name: input.name,
          role: invitation.role,
        },
      };
    }),
});
