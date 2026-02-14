import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import * as argon2 from "argon2";
import { randomBytes, createHash } from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "../email-auth-templates";
import { createSessionJWT, setSessionCookie, clearSessionCookie } from "../_core/session";

// Helper to generate secure random tokens
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Helper to hash tokens for storage
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Helper to generate a unique openId for email users
function generateOpenId(): string {
  return `email_${randomBytes(16).toString("hex")}`;
}

export const authRouter = router({
  // ============================================================================
  // SIGNUP - Create new account with email/password
  // ============================================================================
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(2, "Name must be at least 2 characters"),
        role: z.enum(["learner", "coach"]).default("learner"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if email already exists
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Hash password with Argon2id
      const passwordHash = await argon2.hash(input.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      // Create user
      const openId = generateOpenId();
      const [user] = await db
        .insert(schema.users)
        .values({
          openId,
          email: input.email.toLowerCase(),
          name: input.name,
          passwordHash,
          loginMethod: "email",
          role: input.role === "coach" ? "coach" : "learner",
          emailVerified: false,
        })
        .$returningId();

      // Get the full user record
      const [fullUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1);

      // Generate email verification token
      const verificationToken = generateToken();
      const tokenHash = hashToken(verificationToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(schema.emailVerificationTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      // Create session in database (for tracking)
      const sessionToken = generateToken();
      const sessionTokenHash = hashToken(sessionToken);
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(schema.userSessions).values({
        userId: user.id,
        tokenHash: sessionTokenHash,
        expiresAt: sessionExpiresAt,
      });

      // Create HTTP-only session cookie
      const jwt = await createSessionJWT({
        userId: user.id,
        openId: openId,
        email: input.email.toLowerCase(),
        name: input.name,
        role: input.role === "coach" ? "coach" : "learner",
        authMethod: "email",
      });
      setSessionCookie(ctx.res, jwt);

      // Send verification email
      const baseUrl = process.env.VITE_APP_URL || "https://www.rusingacademy.ca";
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
      try {
        await sendVerificationEmail({
          to: input.email.toLowerCase(),
          name: input.name,
          verificationUrl,
        });

        // Send welcome email
        await sendWelcomeEmail({
          to: input.email.toLowerCase(),
          name: input.name,
          role: input.role,
        });
      } catch (emailError) {
        console.error("[Auth] Failed to send verification/welcome email:", emailError);
        // Don't fail signup if email fails
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: input.email.toLowerCase(),
          name: input.name,
          role: input.role,
          emailVerified: false,
        },
        // Keep sessionToken for backward compatibility during migration
        sessionToken,
        verificationToken, // In production, this would be sent via email only
        message: "Account created successfully. Please verify your email.",
      };
    }),

  // ============================================================================
  // LOGIN - Authenticate with email/password
  // ============================================================================
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Find user by email
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email.toLowerCase()))
        .limit(1);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Verify password
      const validPassword = await argon2.verify(user.passwordHash, input.password);
      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Update last signed in
      await db
        .update(schema.users)
        .set({ lastSignedIn: new Date() })
        .where(eq(schema.users.id, user.id));

      // Create new session in database (for tracking)
      const sessionToken = generateToken();
      const sessionTokenHash = hashToken(sessionToken);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(schema.userSessions).values({
        userId: user.id,
        tokenHash: sessionTokenHash,
        expiresAt,
      });

      // Create HTTP-only session cookie
      const jwt = await createSessionJWT({
        userId: user.id,
        openId: user.openId,
        email: user.email || "",
        name: user.name || "",
        role: user.role || "learner",
        authMethod: "email",
      });
      setSessionCookie(ctx.res, jwt);

      console.log("[Auth] Login successful for:", user.email);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        // Keep sessionToken for backward compatibility during migration
        sessionToken,
      };
    }),

  // ============================================================================
  // LOGOUT - Invalidate session and clear cookie
  // ============================================================================
  logout: publicProcedure
    .input(
      z.object({
        sessionToken: z.string().optional(),
      }).optional()
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      
      // Clear database session if token provided
      if (input?.sessionToken && db) {
        const tokenHash = hashToken(input.sessionToken);
        await db
          .delete(schema.userSessions)
          .where(eq(schema.userSessions.tokenHash, tokenHash));
      }

      // Clear the HTTP-only session cookie
      clearSessionCookie(ctx.res);

      console.log("[Auth] Logout successful");

      return { success: true };
    }),

  // ============================================================================
  // ME - Get current user from session cookie
  // ============================================================================
  me: publicProcedure.query(async ({ ctx }) => {
    // User is already populated from context via session cookie
    if (ctx.user) {
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        role: ctx.user.role,
        emailVerified: ctx.user.emailVerified,
        avatarUrl: ctx.user.avatarUrl,
        openId: ctx.user.openId,
      };
    }
    return null;
  }),

  // ============================================================================
  // VALIDATE SESSION - Check if session is valid (backward compatibility)
  // ============================================================================
  validateSession: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // First check if user is already authenticated via cookie
      if (ctx.user) {
        return {
          valid: true,
          user: {
            id: ctx.user.id,
            email: ctx.user.email,
            name: ctx.user.name,
            role: ctx.user.role,
            emailVerified: ctx.user.emailVerified,
            avatarUrl: ctx.user.avatarUrl,
          },
        };
      }

      // Fallback to token-based validation for backward compatibility
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const tokenHash = hashToken(input.sessionToken);

      const [session] = await db
        .select()
        .from(schema.userSessions)
        .where(
          and(
            eq(schema.userSessions.tokenHash, tokenHash),
            gt(schema.userSessions.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!session) {
        return { valid: false, user: null };
      }

      // Get user
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, session.userId))
        .limit(1);

      if (!user) {
        return { valid: false, user: null };
      }

      // Update last activity
      await db
        .update(schema.userSessions)
        .set({ lastActivityAt: new Date() })
        .where(eq(schema.userSessions.id, session.id));

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          avatarUrl: user.avatarUrl,
        },
      };
    }),

  // ============================================================================
  // REQUEST PASSWORD RESET
  // ============================================================================
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Find user by email
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email.toLowerCase()))
        .limit(1);

      // Always return success to prevent email enumeration
      if (!user) {
        return {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link.",
        };
      }

      // Generate reset token
      const resetToken = generateToken();
      const tokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing reset tokens for this user
      await db
        .delete(schema.passwordResetTokens)
        .where(eq(schema.passwordResetTokens.userId, user.id));

      // Create new reset token
      await db.insert(schema.passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      // Send reset email
      const baseUrl = process.env.VITE_APP_URL || "https://www.rusingacademy.ca";
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      try {
        await sendPasswordResetEmail({
          to: input.email.toLowerCase(),
          name: user.name || "User",
          resetUrl,
        });
      } catch (emailError) {
        console.error("[Auth] Failed to send password reset email:", emailError);
      }

      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
        resetToken, // In production, this would be sent via email only
      };
    }),

  // ============================================================================
  // RESET PASSWORD
  // ============================================================================
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const tokenHash = hashToken(input.token);

      // Find valid reset token
      const [resetToken] = await db
        .select()
        .from(schema.passwordResetTokens)
        .where(
          and(
            eq(schema.passwordResetTokens.tokenHash, tokenHash),
            gt(schema.passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!resetToken || resetToken.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      // Hash new password
      const passwordHash = await argon2.hash(input.newPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      // Update user password
      await db
        .update(schema.users)
        .set({ passwordHash })
        .where(eq(schema.users.id, resetToken.userId));

      // Mark token as used
      await db
        .update(schema.passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(schema.passwordResetTokens.id, resetToken.id));

      // Invalidate all existing sessions for security
      await db
        .delete(schema.userSessions)
        .where(eq(schema.userSessions.userId, resetToken.userId));

      return {
        success: true,
        message: "Password reset successfully. Please log in with your new password.",
      };
    }),

  // ============================================================================
  // VERIFY EMAIL
  // ============================================================================
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const tokenHash = hashToken(input.token);

      // Find valid verification token
      const [verificationToken] = await db
        .select()
        .from(schema.emailVerificationTokens)
        .where(
          and(
            eq(schema.emailVerificationTokens.tokenHash, tokenHash),
            gt(schema.emailVerificationTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!verificationToken || verificationToken.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification token",
        });
      }

      // Update user email verified status
      await db
        .update(schema.users)
        .set({
          emailVerified: true,
          emailVerifiedAt: new Date(),
        })
        .where(eq(schema.users.id, verificationToken.userId));

      // Mark token as used
      await db
        .update(schema.emailVerificationTokens)
        .set({ usedAt: new Date() })
        .where(eq(schema.emailVerificationTokens.id, verificationToken.id));

      return {
        success: true,
        message: "Email verified successfully.",
      };
    }),

  // ============================================================================
  // RESEND VERIFICATION EMAIL
  // ============================================================================
  resendVerificationEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Find user
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email.toLowerCase()))
        .limit(1);

      if (!user) {
        return {
          success: true,
          message: "If an account exists with this email, a verification link will be sent.",
        };
      }

      if (user.emailVerified) {
        return {
          success: true,
          message: "Email is already verified.",
        };
      }

      // Delete existing verification tokens
      await db
        .delete(schema.emailVerificationTokens)
        .where(eq(schema.emailVerificationTokens.userId, user.id));

      // Generate new verification token
      const verificationToken = generateToken();
      const tokenHash = hashToken(verificationToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(schema.emailVerificationTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      // Send verification email
      const baseUrl = process.env.VITE_APP_URL || "https://www.rusingacademy.ca";
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
      try {
        await sendVerificationEmail({
          to: input.email.toLowerCase(),
          name: user.name || "User",
          verificationUrl,
        });
      } catch (emailError) {
        console.error("[Auth] Failed to send verification email:", emailError);
      }

      return {
        success: true,
        message: "If an account exists with this email, a verification link will be sent.",
        verificationToken, // In production, this would be sent via email only
      };
    }),
});

export type AuthRouter = typeof authRouter;
