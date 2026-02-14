/**
 * Session management utilities for HTTP-only cookie-based authentication
 * 
 * This module provides a unified session mechanism for:
 * - Email/password authentication
 * - Social SSO (Google, Microsoft)
 * - Manus OAuth
 * 
 * Sessions are stored as signed JWTs in HTTP-only cookies.
 * 
 * IMPORTANT: This module handles TWO different JWT formats:
 * 1. Custom format: { userId, openId, email, name, role, authMethod }
 * 2. Manus OAuth format: { openId, appId, name }
 */

import { SignJWT, jwtVerify } from "jose";
import type { Response, Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";

// Custom session payload type (email/password + Google/Microsoft SSO)
export type SessionPayload = {
  userId: number;
  openId: string;
  email: string;
  name: string;
  role: string;
  authMethod: "email" | "google" | "microsoft" | "manus";
};

// Manus OAuth session payload type
export type ManusSessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

// Unified session result that can represent either format
export type UnifiedSessionResult = {
  type: "custom" | "manus";
  customPayload?: SessionPayload;
  manusPayload?: ManusSessionPayload;
  openId: string;
  name: string;
};

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.isProduction, // Only secure in production
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
};

/**
 * Get the secret key for signing JWTs
 */
function getSecretKey(): Uint8Array {
  const secret = ENV.cookieSecret;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create a signed session JWT (custom format)
 */
export async function createSessionJWT(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
  const expiresInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
  const expirationTime = Math.floor((Date.now() + expiresInMs) / 1000);

  return new SignJWT({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationTime)
    .sign(secretKey);
}

/**
 * Verify and decode a session JWT - handles BOTH custom and Manus formats
 */
export async function verifySessionJWT(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    // Check if it's a custom format (has userId)
    if (typeof payload.userId === "number") {
      // Validate all required custom fields
      if (
        typeof payload.openId !== "string" ||
        typeof payload.email !== "string" ||
        typeof payload.name !== "string" ||
        typeof payload.role !== "string" ||
        typeof payload.authMethod !== "string"
      ) {
        console.warn("[Session] Custom session payload - missing some fields, but has userId");
        // Return partial data with defaults
        return {
          userId: payload.userId,
          openId: typeof payload.openId === "string" ? payload.openId : "",
          email: typeof payload.email === "string" ? payload.email : "",
          name: typeof payload.name === "string" ? payload.name : "",
          role: typeof payload.role === "string" ? payload.role : "learner",
          authMethod: typeof payload.authMethod === "string" 
            ? payload.authMethod as SessionPayload["authMethod"] 
            : "email",
        };
      }

      return {
        userId: payload.userId,
        openId: payload.openId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        authMethod: payload.authMethod as SessionPayload["authMethod"],
      };
    }

    // Not a custom format - return null (Manus format will be handled by SDK)
    return null;
  } catch (error) {
    // Don't log as warning - this is expected when the token is Manus format
    return null;
  }
}

/**
 * Verify session JWT and return unified result that works with both formats
 */
export async function verifyUnifiedSession(token: string): Promise<UnifiedSessionResult | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    // Check if it's a custom format (has userId)
    if (typeof payload.userId === "number") {
      const customPayload: SessionPayload = {
        userId: payload.userId as number,
        openId: typeof payload.openId === "string" ? payload.openId : "",
        email: typeof payload.email === "string" ? payload.email : "",
        name: typeof payload.name === "string" ? payload.name : "",
        role: typeof payload.role === "string" ? payload.role : "learner",
        authMethod: typeof payload.authMethod === "string" 
          ? payload.authMethod as SessionPayload["authMethod"] 
          : "email",
      };

      return {
        type: "custom",
        customPayload,
        openId: customPayload.openId,
        name: customPayload.name,
      };
    }

    // Check if it's Manus format (has appId)
    if (typeof payload.openId === "string" && typeof payload.appId === "string") {
      const manusPayload: ManusSessionPayload = {
        openId: payload.openId,
        appId: payload.appId,
        name: typeof payload.name === "string" ? payload.name : "",
      };

      return {
        type: "manus",
        manusPayload,
        openId: manusPayload.openId,
        name: manusPayload.name,
      };
    }

    console.warn("[Session] Unknown session format");
    return null;
  } catch (error) {
    console.warn("[Session] JWT verification failed:", String(error));
    return null;
  }
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  console.log("[Session] Cookie set successfully");
}

/**
 * Clear session cookie on response
 */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: ENV.isProduction,
    sameSite: "lax",
    path: "/",
  });
  console.log("[Session] Cookie cleared");
}

/**
 * Get session cookie from request
 */
export function getSessionCookie(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookieHeader(cookieHeader);
  return cookies[COOKIE_NAME] || null;
}

/**
 * Get and verify session from request (custom format only)
 */
export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const token = getSessionCookie(req);
  if (!token) {
    return null;
  }

  return verifySessionJWT(token);
}

/**
 * Get and verify unified session from request (both formats)
 */
export async function getUnifiedSessionFromRequest(req: Request): Promise<UnifiedSessionResult | null> {
  const token = getSessionCookie(req);
  if (!token) {
    return null;
  }

  return verifyUnifiedSession(token);
}
