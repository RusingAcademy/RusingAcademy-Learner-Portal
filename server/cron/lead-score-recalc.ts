/**
 * Lead Score Recalculation Cron Job
 * 
 * Runs daily to recalculate all lead scores based on:
 * - Profile completeness
 * - Email engagement (opens, clicks)
 * - Meeting activity
 * - Recency of last contact
 * 
 * Endpoint: POST /api/cron/lead-score-recalc
 * Schedule: Daily at 2:00 AM
 */

import { recalculateAllLeadScores } from "../lead-scoring";

export interface LeadScoreRecalcResult {
  success: boolean;
  updated: number;
  errors: number;
  duration: number;
  timestamp: string;
}

/**
 * Execute lead score recalculation
 */
export async function runLeadScoreRecalculation(): Promise<LeadScoreRecalcResult> {
  const startTime = Date.now();
  
  console.log("[Lead Score Recalc] Starting daily recalculation...");
  
  try {
    const { updated, errors } = await recalculateAllLeadScores();
    
    const duration = Date.now() - startTime;
    
    console.log(`[Lead Score Recalc] Completed in ${duration}ms: ${updated} updated, ${errors} errors`);
    
    return {
      success: true,
      updated,
      errors,
      duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Lead Score Recalc] Failed:", error);
    
    return {
      success: false,
      updated: 0,
      errors: 1,
      duration,
      timestamp: new Date().toISOString(),
    };
  }
}
