/**
 * Email Tracking Service
 * 
 * Provides tracking pixels and link tracking for sequence emails
 * to capture open and click events
 */

import { getDb } from "./db";
import { sequenceEmailLogs } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Types
export interface TrackingData {
  logId: number;
  type: "open" | "click";
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  linkUrl?: string;
}

/**
 * Generate a unique tracking token for an email
 */
export function generateTrackingToken(logId: number): string {
  const data = `${logId}-${Date.now()}-${Math.random()}`;
  return crypto.createHash("sha256").update(data).digest("hex").substring(0, 32);
}

/**
 * Create a tracking pixel URL for email opens
 */
export function createTrackingPixelUrl(logId: number, baseUrl: string): string {
  const token = Buffer.from(JSON.stringify({ logId, type: "open" })).toString("base64url");
  return `${baseUrl}/api/track/open/${token}`;
}

/**
 * Create a tracked link URL for click tracking
 */
export function createTrackedLinkUrl(
  logId: number,
  originalUrl: string,
  baseUrl: string
): string {
  const token = Buffer.from(
    JSON.stringify({ logId, type: "click", url: originalUrl })
  ).toString("base64url");
  return `${baseUrl}/api/track/click/${token}`;
}

/**
 * Generate tracking pixel HTML to embed in emails
 */
export function generateTrackingPixelHtml(logId: number, baseUrl: string): string {
  const pixelUrl = createTrackingPixelUrl(logId, baseUrl);
  return `<img src="${pixelUrl}" width="1" height="1" style="display:none;visibility:hidden;" alt="" />`;
}

/**
 * Process all links in email HTML to add tracking
 */
export function addLinkTracking(
  html: string,
  logId: number,
  baseUrl: string
): string {
  // Match all href attributes in anchor tags
  const linkRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi;
  
  return html.replace(linkRegex, (match, before, url, after) => {
    // Skip tracking for mailto: and tel: links
    if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("#")) {
      return match;
    }
    
    // Skip if already a tracking URL
    if (url.includes("/api/track/")) {
      return match;
    }
    
    const trackedUrl = createTrackedLinkUrl(logId, url, baseUrl);
    return `<a ${before}href="${trackedUrl}"${after}>`;
  });
}

/**
 * Add tracking to email HTML (both pixel and links)
 * Optionally adds unsubscribe link if lead info is provided
 */
export function addEmailTracking(
  html: string,
  logId: number,
  baseUrl: string,
  options?: {
    leadId?: number;
    leadEmail?: string;
    language?: "en" | "fr";
  }
): string {
  // Add link tracking
  let trackedHtml = addLinkTracking(html, logId, baseUrl);
  
  // Add tracking pixel before closing body tag
  const trackingPixel = generateTrackingPixelHtml(logId, baseUrl);
  
  // Add unsubscribe link if lead info is provided
  let unsubscribeHtml = "";
  if (options?.leadId && options?.leadEmail) {
    const { generateUnsubscribeLinkHtml } = require("./email-unsubscribe");
    unsubscribeHtml = generateUnsubscribeLinkHtml(
      options.leadId,
      options.leadEmail,
      baseUrl,
      options.language || "en"
    );
  }
  
  if (trackedHtml.includes("</body>")) {
    trackedHtml = trackedHtml.replace("</body>", `${unsubscribeHtml}${trackingPixel}</body>`);
  } else {
    // If no body tag, append at the end
    trackedHtml += unsubscribeHtml + trackingPixel;
  }
  
  return trackedHtml;
}

/**
 * Decode tracking token and extract data
 */
export function decodeTrackingToken(token: string): {
  logId: number;
  type: "open" | "click";
  url?: string;
} | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString());
    return decoded;
  } catch (error) {
    console.error("Failed to decode tracking token:", error);
    return null;
  }
}

/**
 * Record an email open event
 */
export async function recordEmailOpen(
  logId: number,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    // Check if already opened (only record first open)
    const [existing] = await db
      .select({ opened: sequenceEmailLogs.opened })
      .from(sequenceEmailLogs)
      .where(eq(sequenceEmailLogs.id, logId))
      .limit(1);
    
    if (existing?.opened) {
      // Already opened, just return success
      return true;
    }
    
    await db
      .update(sequenceEmailLogs)
      .set({
        opened: true,
        openedAt: new Date(),
      })
      .where(eq(sequenceEmailLogs.id, logId));
    
    console.log(`[Email Tracking] Recorded open for log ${logId}`);
    return true;
  } catch (error) {
    console.error(`[Email Tracking] Failed to record open for log ${logId}:`, error);
    return false;
  }
}

/**
 * Record an email click event
 */
export async function recordEmailClick(
  logId: number,
  linkUrl: string,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    // Check if already clicked (only record first click)
    const [existing] = await db
      .select({ clicked: sequenceEmailLogs.clicked })
      .from(sequenceEmailLogs)
      .where(eq(sequenceEmailLogs.id, logId))
      .limit(1);
    
    if (existing?.clicked) {
      // Already clicked, just return success
      return true;
    }
    
    // Also mark as opened if not already (clicking implies opening)
    await db
      .update(sequenceEmailLogs)
      .set({
        opened: true,
        openedAt: new Date(),
        clicked: true,
        clickedAt: new Date(),
      })
      .where(eq(sequenceEmailLogs.id, logId));
    
    console.log(`[Email Tracking] Recorded click for log ${logId}, URL: ${linkUrl}`);
    return true;
  } catch (error) {
    console.error(`[Email Tracking] Failed to record click for log ${logId}:`, error);
    return false;
  }
}

/**
 * Get tracking statistics for a specific email log
 */
export async function getEmailTrackingStats(logId: number): Promise<{
  sent: boolean;
  sentAt: Date | null;
  opened: boolean;
  openedAt: Date | null;
  clicked: boolean;
  clickedAt: Date | null;
} | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [log] = await db
    .select({
      sentAt: sequenceEmailLogs.sentAt,
      opened: sequenceEmailLogs.opened,
      openedAt: sequenceEmailLogs.openedAt,
      clicked: sequenceEmailLogs.clicked,
      clickedAt: sequenceEmailLogs.clickedAt,
    })
    .from(sequenceEmailLogs)
    .where(eq(sequenceEmailLogs.id, logId))
    .limit(1);
  
  if (!log) return null;
  
  return {
    sent: true,
    sentAt: log.sentAt,
    opened: log.opened || false,
    openedAt: log.openedAt,
    clicked: log.clicked || false,
    clickedAt: log.clickedAt,
  };
}

/**
 * Generate a 1x1 transparent GIF for tracking pixel response
 */
export function getTrackingPixelBuffer(): Buffer {
  // 1x1 transparent GIF
  const gif = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  return gif;
}
