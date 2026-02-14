/**
 * Analytics Event Logger
 * 
 * Centralized event tracking for conversion funnel, revenue analytics,
 * and admin notifications. Used by Stripe webhooks and other system events.
 */
import { getDb } from "./db";
import { sql } from "drizzle-orm";

export type AnalyticsEventType = 
  | "page_view" | "opt_in" | "checkout_started" | "checkout_completed"
  | "payment_succeeded" | "payment_failed" | "refund_processed"
  | "subscription_created" | "subscription_renewed" | "subscription_canceled"
  | "course_enrolled" | "course_completed" | "coaching_purchased"
  | "invoice_paid" | "invoice_failed" | "churn";

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  source?: string;
  userId?: number | null;
  sessionId?: string | null;
  productId?: string | null;
  productName?: string | null;
  productType?: string | null;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any> | null;
  stripeEventId?: string | null;
}

/**
 * Log an analytics event to the database
 */
export async function logAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const db = await getDb();
    await db.execute(sql`
      INSERT INTO analytics_events (eventType, source, userId, sessionId, productId, productName, productType, amount, currency, metadata, stripeEventId)
      VALUES (${event.eventType}, ${event.source || "stripe"}, ${event.userId || null}, ${event.sessionId || null}, ${event.productId || null}, ${event.productName || null}, ${event.productType || null}, ${event.amount || 0}, ${event.currency || "cad"}, ${event.metadata ? JSON.stringify(event.metadata) : null}, ${event.stripeEventId || null})
    `);
    console.log(`[Analytics] Event logged: ${event.eventType} | user=${event.userId} | product=${event.productName || "N/A"} | amount=${event.amount || 0}`);
  } catch (error) {
    console.error(`[Analytics] Failed to log event ${event.eventType}:`, error);
  }
}

/**
 * Create an admin notification
 */
export async function createAdminNotification(params: {
  userId?: number | null;
  targetRole?: string;
  title: string;
  message: string;
  type?: string;
  link?: string | null;
}): Promise<void> {
  try {
    const db = await getDb();
    await db.execute(sql`
      INSERT INTO admin_notifications (userId, targetRole, title, message, type, link)
      VALUES (${params.userId || null}, ${params.targetRole || "admin"}, ${params.title}, ${params.message}, ${params.type || "info"}, ${params.link || null})
    `);
    console.log(`[Notification] Created: ${params.title} → ${params.targetRole || "admin"}`);
  } catch (error) {
    console.error(`[Notification] Failed to create:`, error);
  }
}

/**
 * Get analytics events with filters
 */
export async function getAnalyticsEvents(filters: {
  eventType?: string;
  source?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const db = await getDb();
  const conditions: string[] = ["1=1"];
  if (filters.eventType) conditions.push(`eventType = '${filters.eventType}'`);
  if (filters.source) conditions.push(`source = '${filters.source}'`);
  if (filters.userId) conditions.push(`userId = ${filters.userId}`);
  if (filters.startDate) conditions.push(`createdAt >= '${filters.startDate}'`);
  if (filters.endDate) conditions.push(`createdAt <= '${filters.endDate}'`);
  
  const whereClause = conditions.join(" AND ");
  const limit = filters.limit || 100;
  
  const [rows] = await db.execute(sql.raw(`
    SELECT * FROM analytics_events WHERE ${whereClause} ORDER BY createdAt DESC LIMIT ${limit}
  `));
  return rows;
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(startDate?: string, endDate?: string) {
  const db = await getDb();
  const dateFilter = startDate && endDate 
    ? `AND createdAt BETWEEN '${startDate}' AND '${endDate}'` 
    : "";
  
  const [rows] = await db.execute(sql.raw(`
    SELECT eventType, COUNT(*) as count, SUM(amount) as totalAmount
    FROM analytics_events
    WHERE 1=1 ${dateFilter}
    GROUP BY eventType
    ORDER BY count DESC
  `));
  return rows;
}

/**
 * Get revenue by product
 */
export async function getRevenueByProduct(startDate?: string, endDate?: string) {
  const db = await getDb();
  const dateFilter = startDate && endDate 
    ? `AND createdAt BETWEEN '${startDate}' AND '${endDate}'` 
    : "";
  
  const [rows] = await db.execute(sql.raw(`
    SELECT productName, productType, COUNT(*) as purchases, SUM(amount) as revenue
    FROM analytics_events
    WHERE eventType IN ('checkout_completed', 'payment_succeeded', 'invoice_paid') ${dateFilter}
    GROUP BY productName, productType
    ORDER BY revenue DESC
  `));
  return rows;
}

/**
 * Get admin notifications
 */
export async function getAdminNotifications(params: {
  userId?: number;
  targetRole?: string;
  unreadOnly?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  const conditions: string[] = ["1=1"];
  if (params.userId) conditions.push(`userId = ${params.userId}`);
  if (params.targetRole) conditions.push(`targetRole = '${params.targetRole}'`);
  if (params.unreadOnly) conditions.push(`isRead = FALSE`);
  
  const whereClause = conditions.join(" AND ");
  const limit = params.limit || 50;
  
  const [rows] = await db.execute(sql.raw(`
    SELECT * FROM admin_notifications WHERE ${whereClause} ORDER BY createdAt DESC LIMIT ${limit}
  `));
  return rows;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: number): Promise<void> {
  const db = await getDb();
  await db.execute(sql`
    UPDATE admin_notifications SET isRead = TRUE, readAt = NOW() WHERE id = ${notificationId}
  `);
}

/**
 * Mark all notifications as read for a user/role
 */
export async function markAllNotificationsRead(params: { userId?: number; targetRole?: string }): Promise<void> {
  const db = await getDb();
  if (params.userId) {
    await db.execute(sql`UPDATE admin_notifications SET isRead = TRUE, readAt = NOW() WHERE userId = ${params.userId} AND isRead = FALSE`);
  } else if (params.targetRole) {
    await db.execute(sql`UPDATE admin_notifications SET isRead = TRUE, readAt = NOW() WHERE targetRole = ${params.targetRole} AND isRead = FALSE`);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(params: { userId?: number; targetRole?: string }): Promise<number> {
  const db = await getDb();
  const conditions: string[] = ["isRead = FALSE"];
  if (params.userId) conditions.push(`userId = ${params.userId}`);
  if (params.targetRole) conditions.push(`targetRole = '${params.targetRole}'`);
  
  const [rows] = await db.execute(sql.raw(`
    SELECT COUNT(*) as count FROM admin_notifications WHERE ${conditions.join(" AND ")}
  `));
  return (rows as any)[0]?.count || 0;
}
