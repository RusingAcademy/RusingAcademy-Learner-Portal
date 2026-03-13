import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { users, credentials } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "../shared/const";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

/* ─── Validation schemas ─── */
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(320),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const resetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const confirmResetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
});

/* ─── Helper: create session and set cookie ─── */
async function createSessionAndSetCookie(
  userId: number,
  openId: string,
  name: string,
  req: any,
  res: any
) {
  const sessionToken = await sdk.createSessionToken(openId, { name });
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });
  return sessionToken;
}

/* ─── Helper: generate unique openId for native users ─── */
function generateNativeOpenId(): string {
  return `native_${crypto.randomUUID()}`;
}

/* ─── Helper: generate reset token ─── */
function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const nativeAuthRouter = router({
  /* ─── SIGNUP ─── */
  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const normalizedEmail = input.email.toLowerCase().trim();

      // Check if email already exists in credentials
      const existingCred = await db
        .select()
        .from(credentials)
        .where(eq(credentials.email, normalizedEmail))
        .limit(1);

      if (existingCred.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists. Please sign in instead.",
        });
      }

      // Check if email exists in users table (from old OAuth)
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      let userId: number;
      let openId: string;

      if (existingUser.length > 0) {
        // Link native credentials to existing OAuth user
        userId = existingUser[0].id;
        openId = existingUser[0].openId;
        // Update user name if not set
        if (!existingUser[0].name) {
          await db.update(users).set({ name: input.name }).where(eq(users.id, userId));
        }
      } else {
        // Create new user
        openId = generateNativeOpenId();
        const result = await db.insert(users).values({
          openId,
          name: input.name,
          email: normalizedEmail,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });
        userId = result[0].insertId;
      }

      // Hash password and create credentials
      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
      await db.insert(credentials).values({
        userId,
        email: normalizedEmail,
        passwordHash,
        verified: true, // Auto-verify for now
      });

      // Create session
      await createSessionAndSetCookie(userId, openId, input.name, ctx.req, ctx.res);

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));

      return { success: true, message: "Account created successfully" };
    }),

  /* ─── SIGNIN ─── */
  signin: publicProcedure
    .input(signinSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const normalizedEmail = input.email.toLowerCase().trim();

      // Find credentials
      const cred = await db
        .select()
        .from(credentials)
        .where(eq(credentials.email, normalizedEmail))
        .limit(1);

      if (cred.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(input.password, cred[0].passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      // Get user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, cred[0].userId))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User account not found.",
        });
      }

      // Create session
      await createSessionAndSetCookie(
        user[0].id,
        user[0].openId,
        user[0].name || "",
        ctx.req,
        ctx.res
      );

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user[0].id));

      return { success: true, message: "Signed in successfully" };
    }),

  /* ─── REQUEST PASSWORD RESET ─── */
  requestReset: publicProcedure
    .input(resetRequestSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const normalizedEmail = input.email.toLowerCase().trim();

      // Find credentials — always return success to prevent email enumeration
      const cred = await db
        .select()
        .from(credentials)
        .where(eq(credentials.email, normalizedEmail))
        .limit(1);

      if (cred.length > 0) {
        const resetToken = generateResetToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db
          .update(credentials)
          .set({ resetToken, resetTokenExpiresAt: expiresAt })
          .where(eq(credentials.id, cred[0].id));

        // In production, send email with reset link
        // For now, log the token (admin can see it in DB)
        console.log(`[Auth] Password reset token for ${normalizedEmail}: ${resetToken}`);
      }

      // Always return success to prevent email enumeration
      return {
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      };
    }),

  /* ─── CONFIRM PASSWORD RESET ─── */
  confirmReset: publicProcedure
    .input(confirmResetSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Find credential with this reset token
      const cred = await db
        .select()
        .from(credentials)
        .where(eq(credentials.resetToken, input.token))
        .limit(1);

      if (cred.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token.",
        });
      }

      // Check expiration
      if (cred[0].resetTokenExpiresAt && cred[0].resetTokenExpiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired. Please request a new one.",
        });
      }

      // Update password and clear token
      const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
      await db
        .update(credentials)
        .set({
          passwordHash,
          resetToken: null,
          resetTokenExpiresAt: null,
        })
        .where(eq(credentials.id, cred[0].id));

      return { success: true, message: "Password has been reset successfully. You can now sign in." };
    }),

  /* ─── CHANGE PASSWORD (authenticated) ─── */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Find credentials for current user
      const cred = await db
        .select()
        .from(credentials)
        .where(eq(credentials.userId, ctx.user.id))
        .limit(1);

      if (cred.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No password credentials found for this account.",
        });
      }

      // Verify current password
      const isValid = await bcrypt.compare(input.currentPassword, cred[0].passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect.",
        });
      }

      // Update password
      const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
      await db
        .update(credentials)
        .set({ passwordHash })
        .where(eq(credentials.id, cred[0].id));

      return { success: true, message: "Password changed successfully." };
    }),

  /* ─── CHECK IF USER HAS NATIVE CREDENTIALS ─── */
  hasCredentials: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { hasCredentials: false };

    const cred = await db
      .select({ id: credentials.id })
      .from(credentials)
      .where(eq(credentials.userId, ctx.user.id))
      .limit(1);

    return { hasCredentials: cred.length > 0 };
  }),
});
