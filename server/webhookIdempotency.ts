/**
 * Webhook Idempotency Layer
 * 
 * Prevents duplicate processing of Stripe webhook events.
 * Each event is logged by its Stripe event ID before processing.
 * If the same event arrives again, it is skipped.
 */
import { getDb } from "./db";
import { sql } from "drizzle-orm";

export type WebhookEventStatus = "processing" | "processed" | "failed";

export interface WebhookEventRecord {
  id: number;
  stripeEventId: string;
  eventType: string;
  status: WebhookEventStatus;
  attempts: number;
  lastError: string | null;
  processedAt: Date | null;
  createdAt: Date;
}

/**
 * Try to claim an event for processing.
 * Returns true if this is the first time we see this event (safe to process).
 * Returns false if the event was already processed or is currently being processed.
 */
export async function claimWebhookEvent(
  stripeEventId: string,
  eventType: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.error("[Idempotency] Database not available, allowing event through");
    return true; // Fail open — better to double-process than to drop
  }

  try {
    // Try to insert the event. If it already exists, the unique constraint will cause a conflict.
    // We use INSERT IGNORE to silently skip duplicates.
    const [result] = await db.execute(sql`
      INSERT IGNORE INTO webhook_events_log (stripeEventId, eventType, status, attempts)
      VALUES (${stripeEventId}, ${eventType}, 'processing', 1)
    `);

    const insertResult = result as any;
    // If affectedRows === 0, the event already existed (duplicate)
    if (insertResult.affectedRows === 0) {
      // Check if it was already successfully processed
      const [existing] = await db.execute(sql`
        SELECT status, attempts FROM webhook_events_log 
        WHERE stripeEventId = ${stripeEventId} LIMIT 1
      `);
      const row = Array.isArray(existing) && existing[0] ? existing[0] as any : null;

      if (row?.status === "processed") {
        console.log(`[Idempotency] Event ${stripeEventId} already processed, skipping`);
        return false;
      }

      if (row?.status === "processing") {
        console.log(`[Idempotency] Event ${stripeEventId} currently being processed, skipping`);
        return false;
      }

      // If it failed before, allow retry (up to 3 attempts)
      if (row?.status === "failed" && (row?.attempts || 0) < 3) {
        await db.execute(sql`
          UPDATE webhook_events_log 
          SET status = 'processing', attempts = attempts + 1 
          WHERE stripeEventId = ${stripeEventId}
        `);
        console.log(`[Idempotency] Retrying failed event ${stripeEventId} (attempt ${(row?.attempts || 0) + 1})`);
        return true;
      }

      console.log(`[Idempotency] Event ${stripeEventId} exhausted retries (${row?.attempts} attempts), skipping`);
      return false;
    }

    return true; // New event, safe to process
  } catch (error) {
    console.error("[Idempotency] Error claiming event:", error);
    return true; // Fail open
  }
}

/**
 * Mark an event as successfully processed.
 */
export async function markEventProcessed(stripeEventId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(sql`
      UPDATE webhook_events_log 
      SET status = 'processed', processedAt = NOW(), lastError = NULL 
      WHERE stripeEventId = ${stripeEventId}
    `);
  } catch (error) {
    console.error("[Idempotency] Error marking event processed:", error);
  }
}

/**
 * Mark an event as failed with error details.
 */
export async function markEventFailed(
  stripeEventId: string,
  errorMessage: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(sql`
      UPDATE webhook_events_log 
      SET status = 'failed', lastError = ${errorMessage.slice(0, 1000)} 
      WHERE stripeEventId = ${stripeEventId}
    `);
  } catch (error) {
    console.error("[Idempotency] Error marking event failed:", error);
  }
}

/**
 * Get webhook event stats for admin dashboard.
 */
export async function getWebhookEventStats(): Promise<{
  total: number;
  processed: number;
  failed: number;
  processing: number;
  recentEvents: any[];
}> {
  const db = await getDb();
  if (!db) return { total: 0, processed: 0, failed: 0, processing: 0, recentEvents: [] };

  try {
    const [totalRows] = await db.execute(sql`SELECT COUNT(*) as count FROM webhook_events_log`);
    const [processedRows] = await db.execute(sql`SELECT COUNT(*) as count FROM webhook_events_log WHERE status = 'processed'`);
    const [failedRows] = await db.execute(sql`SELECT COUNT(*) as count FROM webhook_events_log WHERE status = 'failed'`);
    const [processingRows] = await db.execute(sql`SELECT COUNT(*) as count FROM webhook_events_log WHERE status = 'processing'`);
    const [recentRows] = await db.execute(sql`
      SELECT stripeEventId, eventType, status, attempts, lastError, processedAt, createdAt 
      FROM webhook_events_log ORDER BY createdAt DESC LIMIT 20
    `);

    return {
      total: Number((Array.isArray(totalRows) && totalRows[0] as any)?.count || 0),
      processed: Number((Array.isArray(processedRows) && processedRows[0] as any)?.count || 0),
      failed: Number((Array.isArray(failedRows) && failedRows[0] as any)?.count || 0),
      processing: Number((Array.isArray(processingRows) && processingRows[0] as any)?.count || 0),
      recentEvents: Array.isArray(recentRows) ? recentRows : [],
    };
  } catch (error) {
    console.error("[Idempotency] Error getting stats:", error);
    return { total: 0, processed: 0, failed: 0, processing: 0, recentEvents: [] };
  }
}
