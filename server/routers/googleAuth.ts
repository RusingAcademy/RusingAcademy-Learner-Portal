/**
 * Google OAuth Routes
 * Handles Google Sign-In flow with HTTP-only cookie sessions
 */

import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import * as schema from '../../drizzle/schema';
import { eq, or } from 'drizzle-orm';
import { createSessionJWT, setSessionCookie } from '../_core/session';
import crypto from 'crypto';
import { parse as parseCookieHeader } from 'cookie';

const router = Router();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // Explicit override (recommended for production)

function getGoogleRedirectUri(req: Request): string {
  // Priority 1: Explicit env var (most reliable — avoids proxy header issues)
  if (GOOGLE_REDIRECT_URI) {
    console.log('[Google OAuth] Using explicit GOOGLE_REDIRECT_URI:', GOOGLE_REDIRECT_URI);
    return GOOGLE_REDIRECT_URI;
  }
  
  // Priority 2: Derive from request headers (works when proxy headers are correct)
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  // x-forwarded-host may contain multiple values; take the first
  const rawHost = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
  const host = rawHost.split(',')[0].trim();
  
  if (!host) {
    console.error('[Google OAuth] WARNING: Could not determine host from request headers');
    return `https://app.rusingacademy.ca/api/auth/google/callback`;
  }
  
  const uri = `${proto}://${host}/api/auth/google/callback`;
  console.log('[Google OAuth] Derived redirect URI from headers:', uri);
  return uri;
}

// Google OAuth URLs
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Helper to generate secure random tokens
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper to hash tokens for storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Helper to generate a unique openId for Google users
function generateOpenId(): string {
  return `google_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Helper to get cookie value from request
 * Uses the 'cookie' package to parse cookies from the header
 * since cookie-parser middleware is not installed
 */
function getCookieValue(req: Request, cookieName: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return undefined;
  }
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[cookieName];
}

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow by redirecting to Google's consent screen
 */
router.get('/google', (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('[Google OAuth] GOOGLE_CLIENT_ID not configured');
    return res.redirect('/login?error=oauth_not_configured');
  }

  const state = crypto.randomBytes(32).toString('hex');
  const redirectUri = getGoogleRedirectUri(req);
  
  // Determine if we're in production (Railway sets NODE_ENV=production)
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
  
  // Store state in a short-lived cookie for CSRF protection
  // Use 'none' sameSite with secure:true for cross-site OAuth flow in production
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: '/',
  });

  // Store redirect URI for callback
  res.cookie('oauth_redirect_uri', redirectUri, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: '/',
  });

  console.log('[Google OAuth] State cookie set:', state.substring(0, 10) + '...');
  console.log('[Google OAuth] Redirect URI:', redirectUri);
  console.log('[Google OAuth] Cookie settings - secure:', isProduction, 'sameSite:', isProduction ? 'none' : 'lax');

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  console.log('[Google OAuth] Redirecting to Google consent screen');
  res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Handles the callback from Google after user consent
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('[Google OAuth] Error from Google:', error);
    return res.redirect(`/login?error=${error}`);
  }

  // Get stored state from cookie using manual parsing
  const storedState = getCookieValue(req, 'oauth_state');
  
  console.log('[Google OAuth] Callback received');
  console.log('[Google OAuth] State from URL:', state ? String(state).substring(0, 10) + '...' : 'undefined');
  console.log('[Google OAuth] State from cookie:', storedState ? storedState.substring(0, 10) + '...' : 'undefined');
  console.log('[Google OAuth] Cookie header present:', !!req.headers.cookie);
  
  // Validate state for CSRF protection
  if (!state || !storedState || state !== storedState) {
    console.error('[Google OAuth] State mismatch - possible CSRF attack or cookie not received');
    console.error('[Google OAuth] URL state:', state);
    console.error('[Google OAuth] Cookie state:', storedState);
    console.error('[Google OAuth] All cookies:', req.headers.cookie);
    return res.redirect('/login?error=invalid_state');
  }

  // CRITICAL: The redirect_uri sent to Google's token endpoint MUST exactly match
  // the one used during the initial authorization request.
  // Priority: 1) stored cookie (from initiation), 2) explicit env var, 3) derive from request
  const storedRedirectUri = getCookieValue(req, 'oauth_redirect_uri');
  const redirectUri = storedRedirectUri || getGoogleRedirectUri(req);
  console.log('[Google OAuth] Token exchange redirect_uri:', redirectUri);
  console.log('[Google OAuth] Source:', storedRedirectUri ? 'cookie' : (GOOGLE_REDIRECT_URI ? 'env var' : 'request headers'));

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

  // Clear the OAuth cookies
  res.clearCookie('oauth_state', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  res.clearCookie('oauth_redirect_uri', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  if (!code || typeof code !== 'string') {
    console.error('[Google OAuth] No authorization code received');
    return res.redirect('/login?error=no_code');
  }

  try {
    const db = await getDb();
    if (!db) {
      console.error('[Google OAuth] Database not available');
      return res.redirect('/login?error=database_error');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[Google OAuth] Token exchange failed:', errorData);
      return res.redirect('/login?error=token_exchange_failed');
    }

    const tokens = await tokenResponse.json() as {
      access_token: string;
      id_token?: string;
      refresh_token?: string;
    };

    // Get user info from Google
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('[Google OAuth] Failed to get user info');
      return res.redirect('/login?error=userinfo_failed');
    }

    const googleUser = await userInfoResponse.json() as {
      id: string;
      email: string;
      name: string;
      picture?: string;
      verified_email?: boolean;
    };

    console.log('[Google OAuth] User info received:', {
      email: googleUser.email,
      name: googleUser.name,
    });

    // Check if user exists by email or googleId using db.select() instead of db.query
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(
        or(
          eq(schema.users.email, googleUser.email.toLowerCase()),
          eq(schema.users.googleId, googleUser.id)
        )
      )
      .limit(1);

    let user = existingUsers.length > 0 ? existingUsers[0] : null;

    if (!user) {
      // Create new user
      console.log('[Google OAuth] Creating new user for:', googleUser.email);
      const openId = generateOpenId();
      
      const [insertResult] = await db
        .insert(schema.users)
        .values({
          openId,
          email: googleUser.email.toLowerCase(),
          name: googleUser.name,
          passwordHash: null, // No password for OAuth users
          emailVerified: googleUser.verified_email ?? true,
          googleId: googleUser.id,
          avatarUrl: googleUser.picture,
          loginMethod: 'google',
          role: 'learner', // Default role for new users
        })
        .$returningId();

      // Get the full user record
      const [newUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, insertResult.id))
        .limit(1);
      
      user = newUser;
    } else if (!user.googleId) {
      // Link Google account to existing user
      console.log('[Google OAuth] Linking Google account to existing user:', googleUser.email);
      await db.update(schema.users)
        .set({
          googleId: googleUser.id,
          avatarUrl: user.avatarUrl || googleUser.picture,
          emailVerified: true,
          loginMethod: user.loginMethod || 'google',
        })
        .where(eq(schema.users.id, user.id));
      
      // Refresh user data
      const [updatedUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1);
      user = updatedUser;
    }

    // Create session in database
    const sessionToken = generateToken();
    const tokenHash = hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(schema.userSessions).values({
      userId: user!.id,
      tokenHash,
      expiresAt,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
    });

    // Create JWT and set HTTP-only session cookie
    const jwt = await createSessionJWT({
      userId: user!.id,
      openId: user!.openId,
      email: user!.email || '',
      name: user!.name || '',
      role: user!.role,
      authMethod: 'google',
    });
    
    setSessionCookie(res, jwt);

    // Update last signed in
    await db.update(schema.users)
      .set({ lastSignedIn: new Date() })
      .where(eq(schema.users.id, user!.id));

    console.log('[Google OAuth] Login successful for:', googleUser.email);
    res.redirect('/dashboard');

  } catch (error) {
    console.error('[Google OAuth] Callback error:', error);
    res.redirect('/login?error=oauth_failed');
  }
});

export default router;
