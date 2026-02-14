import { Router } from "express";
import { getDb } from "../db";
import { sql, eq, and, gt, isNull } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { createHash } from "crypto";
import * as schema from "../../drizzle/schema";

const router = Router();

// Helper to hash tokens (same as in auth.ts)
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Validate password reset/setup token
router.get("/validate-token", async (req, res) => {
  try {
    const { token } = req.query;
    const db = await getDb();

    if (!db) {
      return res.status(503).json({ valid: false, message: "Database not available" });
    }

    if (!token || typeof token !== "string") {
      return res.status(400).json({ valid: false, message: "Token is required" });
    }

    // Hash the token before comparing (tokens are stored hashed)
    const tokenHash = hashToken(token);

    // Find valid reset token using Drizzle ORM
    const [resetToken] = await db
      .select({
        id: schema.passwordResetTokens.id,
        userId: schema.passwordResetTokens.userId,
        expiresAt: schema.passwordResetTokens.expiresAt,
        usedAt: schema.passwordResetTokens.usedAt,
      })
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.tokenHash, tokenHash),
          gt(schema.passwordResetTokens.expiresAt, new Date()),
          isNull(schema.passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!resetToken) {
      return res.json({ 
        valid: false, 
        message: "This link has expired or has already been used. Please request a new one." 
      });
    }

    // Get user info
    const [user] = await db
      .select({
        email: schema.users.email,
        name: schema.users.name,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, resetToken.userId))
      .limit(1);

    if (!user) {
      return res.json({ 
        valid: false, 
        message: "User not found." 
      });
    }

    return res.json({
      valid: true,
      email: user.email,
      name: user.name,
      type: "reset",
      role: user.role,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({ valid: false, message: "Server error" });
  }
});

// Set password using token
router.post("/set-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const db = await getDb();

    if (!db) {
      return res.status(503).json({ success: false, message: "Database not available" });
    }

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Hash the token before comparing
    const tokenHash = hashToken(token);

    // Get and validate token using Drizzle ORM
    const [resetToken] = await db
      .select({
        id: schema.passwordResetTokens.id,
        userId: schema.passwordResetTokens.userId,
      })
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.tokenHash, tokenHash),
          gt(schema.passwordResetTokens.expiresAt, new Date()),
          isNull(schema.passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!resetToken) {
      return res.status(400).json({ 
        success: false, 
        message: "This link has expired or has already been used." 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await db
      .update(schema.users)
      .set({ 
        passwordHash, 
        emailVerified: true 
      })
      .where(eq(schema.users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(schema.passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(schema.passwordResetTokens.id, resetToken.id));

    return res.json({ success: true, message: "Password set successfully" });
  } catch (error) {
    console.error("Set password error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Request password reset (Express endpoint for compatibility)
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;
    const db = await getDb();

    if (!db) {
      return res.status(503).json({ success: false, message: "Database not available" });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Find user
    const [user] = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: "If an account exists, a reset link will be sent." });
    }

    // Note: Use the tRPC forgotPassword mutation for actual token generation and email sending
    // This endpoint is just for compatibility
    return res.json({ success: true, message: "If an account exists, a reset link will be sent." });
  } catch (error) {
    console.error("Request reset error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get current user permissions
router.get("/permissions", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const db = await getDb();

    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user's role and permissions
    const [user] = await db
      .select({
        id: schema.users.id,
        role: schema.users.role,
        roleId: schema.users.roleId,
        isOwner: schema.users.isOwner,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If owner, return all permissions
    if (user.isOwner || user.role === "owner") {
      return res.json({
        role: "owner",
        isOwner: true,
        permissions: ["*"], // All permissions
      });
    }

    // For other roles, return role-based permissions
    return res.json({
      role: user.role,
      isOwner: user.isOwner,
      permissions: [], // Would need to query role_permissions table
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Check if user has specific permission
router.get("/check-permission", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { permission } = req.query;
    const db = await getDb();

    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }

    if (!userId) {
      return res.status(401).json({ hasPermission: false });
    }

    if (!permission || typeof permission !== "string") {
      return res.status(400).json({ error: "Permission is required" });
    }

    // Check if owner
    const [user] = await db
      .select({ isOwner: schema.users.isOwner, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (user?.isOwner || user?.role === "owner") {
      return res.json({ hasPermission: true });
    }

    // For non-owners, would need to check role_permissions table
    return res.json({ hasPermission: false });
  } catch (error) {
    console.error("Check permission error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
