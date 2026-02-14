/**
 * Microsoft Azure AD OAuth Routes
 * Handles Microsoft Sign-In flow with HTTP-only cookie sessions
 * Ideal for Canadian federal public servants using @gc.ca / @canada.ca accounts
 */

import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import * as schema from '../../drizzle/schema';
import { eq, or } from 'drizzle-orm';
import { createSessionJWT, setSessionCookie } from '../_core/session';
import crypto from 'crypto';
import { parse as parseCookieHeader } from 'cookie';

const router = Router();

// Microsoft OAuth configuration
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
// Use 'common' for multi-tenant (any Microsoft account)
// Use 'organizations' for work/school accounts only
// Use specific tenant ID for single-tenant apps
const MICROSOFT_TENANT = process.env.MICROSOFT_TENANT || 'common';

function getMicrosoftRedirectUri(req: Request): string {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'app.rusingacademy.ca';
  return `${protocol}://${host}/api/auth/microsoft/callback`;
}

// Microsoft OAuth URLs (v2.0 endpoint)
const getMicrosoftAuthUrl = () => 
  `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/authorize`;
const getMicrosoftTokenUrl = () => 
  `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/token`;
const MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com/v1.0/me';

// Helper to generate secure random tokens
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper to hash tokens for storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Helper to generate a unique openId for Microsoft users
function generateOpenId(): string {
  return `microsoft_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Helper to get cookie value from request
 * Uses the 'cookie' package to parse cookies from the header
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
 * GET /api/auth/microsoft
 * Initiates Microsoft OAuth flow by redirecting to Microsoft's consent screen
 */
router.get('/microsoft', (req: Request, res: Response) => {
  if (!MICROSOFT_CLIENT_ID) {
    console.error('[Microsoft OAuth] MICROSOFT_CLIENT_ID not configured');
    return res.redirect('/login?error=oauth_not_configured');
  }

  const state = crypto.randomBytes(32).toString('hex');
  const redirectUri = getMicrosoftRedirectUri(req);
  
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
  
  // Store state in a short-lived cookie for CSRF protection
  res.cookie('ms_oauth_state', state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: '/',
  });

  // Store redirect URI for callback
  res.cookie('ms_oauth_redirect_uri', redirectUri, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000,
    path: '/',
  });

  console.log('[Microsoft OAuth] State cookie set:', state.substring(0, 10) + '...');
  console.log('[Microsoft OAuth] Redirect URI:', redirectUri);
  console.log('[Microsoft OAuth] Tenant:', MICROSOFT_TENANT);

  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile User.Read',
    state: state,
    response_mode: 'query',
    prompt: 'select_account',
  });

  const authUrl = `${getMicrosoftAuthUrl()}?${params.toString()}`;
  console.log('[Microsoft OAuth] Redirecting to Microsoft consent screen');
  res.redirect(authUrl);
});

/**
 * GET /api/auth/microsoft/callback
 * Handles the callback from Microsoft after user consent
 */
router.get('/microsoft/callback', async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('[Microsoft OAuth] Error from Microsoft:', error, error_description);
    return res.redirect(`/login?error=${error}`);
  }

  // Get stored state from cookie
  const storedState = getCookieValue(req, 'ms_oauth_state');
  
  console.log('[Microsoft OAuth] Callback received');
  console.log('[Microsoft OAuth] State from URL:', state ? String(state).substring(0, 10) + '...' : 'undefined');
  console.log('[Microsoft OAuth] State from cookie:', storedState ? storedState.substring(0, 10) + '...' : 'undefined');
  
  // Validate state for CSRF protection
  if (!state || !storedState || state !== storedState) {
    console.error('[Microsoft OAuth] State mismatch - possible CSRF attack or cookie not received');
    return res.redirect('/login?error=invalid_state');
  }

  // Get stored redirect URI
  const redirectUri = getCookieValue(req, 'ms_oauth_redirect_uri') || getMicrosoftRedirectUri(req);

  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

  // Clear the OAuth cookies
  res.clearCookie('ms_oauth_state', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  res.clearCookie('ms_oauth_redirect_uri', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  if (!code || typeof code !== 'string') {
    console.error('[Microsoft OAuth] No authorization code received');
    return res.redirect('/login?error=no_code');
  }

  try {
    const db = await getDb();
    if (!db) {
      console.error('[Microsoft OAuth] Database not available');
      return res.redirect('/login?error=database_error');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(getMicrosoftTokenUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID!,
        client_secret: MICROSOFT_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        scope: 'openid email profile User.Read',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[Microsoft OAuth] Token exchange failed:', errorData);
      return res.redirect('/login?error=token_exchange_failed');
    }

    const tokens = await tokenResponse.json() as {
      access_token: string;
      id_token?: string;
      refresh_token?: string;
    };

    // Get user info from Microsoft Graph API
    const userInfoResponse = await fetch(MICROSOFT_GRAPH_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('[Microsoft OAuth] Failed to get user info from Graph API');
      return res.redirect('/login?error=userinfo_failed');
    }

    const microsoftUser = await userInfoResponse.json() as {
      id: string;
      displayName: string;
      mail?: string;
      userPrincipalName: string;
      givenName?: string;
      surname?: string;
    };

    // Microsoft may return email in 'mail' or 'userPrincipalName'
    const email = microsoftUser.mail || microsoftUser.userPrincipalName;
    const name = microsoftUser.displayName || `${microsoftUser.givenName || ''} ${microsoftUser.surname || ''}`.trim();

    console.log('[Microsoft OAuth] User info received:', {
      email: email,
      name: name,
      id: microsoftUser.id,
    });

    // Check if user exists by email or microsoftId
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(
        or(
          eq(schema.users.email, email.toLowerCase()),
          eq(schema.users.microsoftId, microsoftUser.id)
        )
      )
      .limit(1);

    let user = existingUsers.length > 0 ? existingUsers[0] : null;

    if (!user) {
      // Create new user
      console.log('[Microsoft OAuth] Creating new user for:', email);
      const openId = generateOpenId();
      
      const [insertResult] = await db
        .insert(schema.users)
        .values({
          openId,
          email: email.toLowerCase(),
          name: name,
          passwordHash: null, // No password for OAuth users
          emailVerified: true, // Microsoft accounts are verified
          microsoftId: microsoftUser.id,
          loginMethod: 'microsoft',
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
    } else if (!user.microsoftId) {
      // Link Microsoft account to existing user
      console.log('[Microsoft OAuth] Linking Microsoft account to existing user:', email);
      await db.update(schema.users)
        .set({
          microsoftId: microsoftUser.id,
          emailVerified: true,
          loginMethod: user.loginMethod || 'microsoft',
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
      authMethod: 'microsoft',
    });
    
    setSessionCookie(res, jwt);

    // Update last signed in
    await db.update(schema.users)
      .set({ lastSignedIn: new Date() })
      .where(eq(schema.users.id, user!.id));

    console.log('[Microsoft OAuth] Login successful for:', email);
    res.redirect('/dashboard');

  } catch (error) {
    console.error('[Microsoft OAuth] Callback error:', error);
    res.redirect('/login?error=oauth_failed');
  }
});

export default router;
