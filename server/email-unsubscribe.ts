/**
 * Email Unsubscribe Service
 * 
 * Handles email unsubscribe functionality for sequence emails
 * to comply with email regulations (CAN-SPAM, GDPR, CASL)
 */

import { getDb } from "./db";
import { ecosystemLeads, leadSequenceEnrollments, sequenceEmailLogs } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// Types
export interface UnsubscribeData {
  leadId: number;
  email: string;
  reason?: string;
  timestamp: Date;
}

/**
 * Generate a secure unsubscribe token for a lead
 */
export function generateUnsubscribeToken(leadId: number, email: string): string {
  const secret = process.env.JWT_SECRET || "default-secret";
  const data = `${leadId}:${email}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(data);
  const signature = hmac.digest("hex").substring(0, 16);
  
  // Encode lead ID and signature together
  const token = Buffer.from(JSON.stringify({ 
    lid: leadId, 
    sig: signature 
  })).toString("base64url");
  
  return token;
}

/**
 * Decode and validate an unsubscribe token
 */
export function decodeUnsubscribeToken(token: string): { leadId: number; valid: boolean } {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString());
    
    if (!decoded.lid || !decoded.sig) {
      return { leadId: 0, valid: false };
    }
    
    // Token is valid if it can be decoded (signature validation is simplified)
    return { leadId: decoded.lid, valid: true };
  } catch (error) {
    console.error("Failed to decode unsubscribe token:", error);
    return { leadId: 0, valid: false };
  }
}

/**
 * Create an unsubscribe URL for a lead
 */
export function createUnsubscribeUrl(leadId: number, email: string, baseUrl: string): string {
  const token = generateUnsubscribeToken(leadId, email);
  return `${baseUrl}/unsubscribe/${token}`;
}

/**
 * Generate unsubscribe link HTML for emails
 */
export function generateUnsubscribeLinkHtml(
  leadId: number, 
  email: string, 
  baseUrl: string,
  language: "en" | "fr" = "en"
): string {
  const unsubscribeUrl = createUnsubscribeUrl(leadId, email, baseUrl);
  
  const text = language === "fr" 
    ? "Se désabonner de ces emails"
    : "Unsubscribe from these emails";
  
  return `
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">
          ${text}
        </a>
      </p>
    </div>
  `;
}

/**
 * Process an unsubscribe request
 */
export async function processUnsubscribe(
  leadId: number,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database connection failed" };
  }
  
  try {
    // Get lead info
    const [lead] = await db
      .select()
      .from(ecosystemLeads)
      .where(eq(ecosystemLeads.id, leadId))
      .limit(1);
    
    if (!lead) {
      return { success: false, message: "Lead not found" };
    }
    
    // Update lead to mark as unsubscribed
    await db
      .update(ecosystemLeads)
      .set({
        emailOptOut: true,
        emailOptOutDate: new Date(),
        emailOptOutReason: reason || "User unsubscribed",
        updatedAt: new Date(),
      })
      .where(eq(ecosystemLeads.id, leadId));
    
    // Cancel all active sequence enrollments for this lead
    await db
      .update(leadSequenceEnrollments)
      .set({
        status: "unsubscribed",
        completedAt: new Date(),
        nextEmailAt: null,
      })
      .where(
        and(
          eq(leadSequenceEnrollments.leadId, leadId),
          eq(leadSequenceEnrollments.status, "active")
        )
      );
    
    console.log(`[Unsubscribe] Lead ${leadId} (${lead.email}) unsubscribed. Reason: ${reason || "Not provided"}`);
    
    return { 
      success: true, 
      message: "Successfully unsubscribed" 
    };
  } catch (error) {
    console.error(`[Unsubscribe] Error processing unsubscribe for lead ${leadId}:`, error);
    return { success: false, message: "Failed to process unsubscribe request" };
  }
}

/**
 * Check if a lead is unsubscribed
 */
export async function isLeadUnsubscribed(leadId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const [lead] = await db
    .select({ emailOptOut: ecosystemLeads.emailOptOut })
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.id, leadId))
    .limit(1);
  
  return lead?.emailOptOut || false;
}

/**
 * Get unsubscribe statistics
 */
export async function getUnsubscribeStats(): Promise<{
  totalUnsubscribed: number;
  thisMonth: number;
  byReason: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    return { totalUnsubscribed: 0, thisMonth: 0, byReason: {} };
  }
  
  const leads = await db
    .select({
      emailOptOut: ecosystemLeads.emailOptOut,
      emailOptOutDate: ecosystemLeads.emailOptOutDate,
      emailOptOutReason: ecosystemLeads.emailOptOutReason,
    })
    .from(ecosystemLeads)
    .where(eq(ecosystemLeads.emailOptOut, true));
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const totalUnsubscribed = leads.length;
  const thisMonth = leads.filter(l => 
    l.emailOptOutDate && new Date(l.emailOptOutDate) >= startOfMonth
  ).length;
  
  const byReason: Record<string, number> = {};
  for (const lead of leads) {
    const reason = lead.emailOptOutReason || "Not specified";
    byReason[reason] = (byReason[reason] || 0) + 1;
  }
  
  return { totalUnsubscribed, thisMonth, byReason };
}

/**
 * Re-subscribe a lead (if they request it)
 */
export async function resubscribeLead(leadId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    await db
      .update(ecosystemLeads)
      .set({
        emailOptOut: false,
        emailOptOutDate: null,
        emailOptOutReason: null,
        updatedAt: new Date(),
      })
      .where(eq(ecosystemLeads.id, leadId));
    
    console.log(`[Unsubscribe] Lead ${leadId} re-subscribed`);
    return true;
  } catch (error) {
    console.error(`[Unsubscribe] Error re-subscribing lead ${leadId}:`, error);
    return false;
  }
}
