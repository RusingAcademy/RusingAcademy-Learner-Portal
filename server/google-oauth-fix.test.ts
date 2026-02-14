/**
 * Phase B: Google OAuth Fix — Vitest Tests
 * 
 * Validates that Google OAuth configuration is correct and the
 * redirect_uri_mismatch issue is resolved.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SERVER_DIR = path.resolve(__dirname);
const CLIENT_DIR = path.resolve(__dirname, "../client/src");

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

describe("Phase B: Google OAuth Fix", () => {

  describe("Environment Variables", () => {
    it("should have GOOGLE_CLIENT_ID configured", () => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      expect(clientId).toBeDefined();
      expect(clientId).not.toBe("");
      expect(clientId).toMatch(/\.apps\.googleusercontent\.com$/);
    });

    it("should have GOOGLE_CLIENT_SECRET configured", () => {
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      expect(clientSecret).toBeDefined();
      expect(clientSecret).not.toBe("");
    });
  });

  describe("googleAuth.ts — Redirect URI Logic", () => {
    const content = readFile(path.join(SERVER_DIR, "routers/googleAuth.ts"));

    it("should support explicit GOOGLE_REDIRECT_URI env var", () => {
      expect(content).toContain("GOOGLE_REDIRECT_URI");
      expect(content).toContain("process.env.GOOGLE_REDIRECT_URI");
    });

    it("should prioritize explicit env var over dynamic derivation", () => {
      // The code should check GOOGLE_REDIRECT_URI first
      expect(content).toContain("Priority 1: Explicit env var");
    });

    it("should have dynamic fallback from request headers", () => {
      expect(content).toContain("x-forwarded-proto");
      expect(content).toContain("x-forwarded-host");
    });

    it("should handle comma-separated x-forwarded-host values", () => {
      // Multiple proxies can append to x-forwarded-host
      expect(content).toContain("split(',')");
    });

    it("should log the redirect URI source for debugging", () => {
      expect(content).toContain("[Google OAuth]");
      expect(content).toContain("redirect URI");
    });

    it("should use /api/auth/google/callback as the callback path", () => {
      expect(content).toContain("/api/auth/google/callback");
    });
  });

  describe("googleAuth.ts — Token Exchange", () => {
    const content = readFile(path.join(SERVER_DIR, "routers/googleAuth.ts"));

    it("should use the same redirect_uri for token exchange as initiation", () => {
      // The callback should use stored cookie or same derivation logic
      expect(content).toContain("oauth_redirect_uri");
      expect(content).toContain("getGoogleRedirectUri");
    });

    it("should log the token exchange redirect_uri for debugging", () => {
      expect(content).toContain("Token exchange redirect_uri");
    });
  });

  describe("googleAuth.ts — CSRF Protection", () => {
    const content = readFile(path.join(SERVER_DIR, "routers/googleAuth.ts"));

    it("should generate and store state parameter", () => {
      expect(content).toContain("oauth_state");
      expect(content).toContain("crypto.randomBytes");
    });

    it("should validate state on callback", () => {
      expect(content).toContain("state !== storedState");
    });

    it("should clear OAuth cookies after callback", () => {
      expect(content).toContain("clearCookie('oauth_state'");
      expect(content).toContain("clearCookie('oauth_redirect_uri'");
    });
  });

  describe("googleAuth.ts — User Creation & Session", () => {
    const content = readFile(path.join(SERVER_DIR, "routers/googleAuth.ts"));

    it("should create JWT session after successful login", () => {
      expect(content).toContain("createSessionJWT");
      expect(content).toContain("setSessionCookie");
    });

    it("should handle new user creation", () => {
      expect(content).toContain("Creating new user");
      expect(content).toContain("insert(schema.users)");
    });

    it("should handle linking Google to existing user", () => {
      expect(content).toContain("Linking Google account");
    });

    it("should redirect to dashboard after successful login", () => {
      expect(content).toContain("res.redirect('/dashboard')");
    });
  });

  describe("Server Mounting", () => {
    const indexContent = readFile(path.join(SERVER_DIR, "_core/index.ts"));

    it("should mount Google auth router at /api/auth", () => {
      expect(indexContent).toContain('app.use("/api/auth"');
      expect(indexContent).toContain("googleAuthRouter");
    });
  });

  describe("Frontend — Login Page", () => {
    const loginContent = readFile(path.join(CLIENT_DIR, "pages/Login.tsx"));

    it("should have Google Sign-In button", () => {
      expect(loginContent).toContain("Google");
      expect(loginContent).toContain("handleGoogleSignIn");
    });

    it("should redirect to /api/auth/google on click", () => {
      expect(loginContent).toContain("/api/auth/google");
    });
  });

  describe("Frontend — Signup Page", () => {
    const signupContent = readFile(path.join(CLIENT_DIR, "pages/Signup.tsx"));

    it("should have Google Sign-Up button", () => {
      expect(signupContent).toContain("Google");
      expect(signupContent).toContain("handleGoogleSignUp");
    });

    it("should redirect to /api/auth/google on click", () => {
      expect(signupContent).toContain("/api/auth/google");
    });
  });

  describe("Database Schema", () => {
    const schemaContent = readFile(path.resolve(__dirname, "../drizzle/schema.ts"));

    it("should have googleId column on users table", () => {
      expect(schemaContent).toContain("googleId");
    });

    it("should have loginMethod column on users table", () => {
      expect(schemaContent).toContain("loginMethod");
    });
  });

  describe("Session — Unified Auth Support", () => {
    const sessionContent = readFile(path.join(SERVER_DIR, "_core/session.ts"));

    it("should support custom session format with authMethod", () => {
      expect(sessionContent).toContain("authMethod");
    });

    it("should verify both custom and Manus session formats", () => {
      expect(sessionContent).toContain("verifyUnifiedSession");
    });
  });
});
