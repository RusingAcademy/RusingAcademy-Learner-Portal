/**
 * Pipeline Notifications Cron Job
 * 
 * Runs daily to check for:
 * - Stale leads needing attention
 * - Follow-up reminders
 * 
 * Endpoint: POST /api/cron/pipeline-notifications
 * Schedule: Daily at 8:00 AM
 */

import { runAllNotificationChecks, getNotificationSummary } from "../pipeline-notifications";

export interface PipelineNotificationsCronResult {
  success: boolean;
  staleLeads: number;
  followUpReminders: number;
  totalCreated: number;
  unreadCount: number;
  duration: number;
  timestamp: string;
}

/**
 * Execute pipeline notifications check
 */
export async function runPipelineNotificationsCron(): Promise<PipelineNotificationsCronResult> {
  const startTime = Date.now();
  
  console.log("[Pipeline Notifications] Starting daily check...");
  
  try {
    const result = await runAllNotificationChecks();
    const summary = await getNotificationSummary();
    
    const duration = Date.now() - startTime;
    
    console.log(`[Pipeline Notifications] Completed in ${duration}ms: ${result.total} notifications created`);
    
    return {
      success: true,
      staleLeads: result.staleLeads,
      followUpReminders: result.followUpReminders,
      totalCreated: result.total,
      unreadCount: summary.unreadCount,
      duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Pipeline Notifications] Failed:", error);
    
    return {
      success: false,
      staleLeads: 0,
      followUpReminders: 0,
      totalCreated: 0,
      unreadCount: 0,
      duration,
      timestamp: new Date().toISOString(),
    };
  }
}
