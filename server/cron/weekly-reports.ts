/**
 * Cron Job: Weekly Progress Reports
 * 
 * This endpoint is designed to be called by an external cron service
 * (e.g., Vercel Cron, Railway Cron, or a dedicated cron service)
 * 
 * Schedule:
 * - Sunday 9am ET: Send reports to learners who prefer Sunday delivery
 * - Monday 9am ET: Send reports to learners who prefer Monday delivery
 * 
 * Cron expressions (ET timezone):
 * - Sunday: 0 9 * * 0 (America/Toronto)
 * - Monday: 0 9 * * 1 (America/Toronto)
 * 
 * API Endpoint: POST /api/cron/weekly-reports
 * Authorization: Bearer token (CRON_SECRET env variable)
 */

import { sendSundayProgressReports, sendMondayProgressReports } from "../progress-reports";

export interface CronResult {
  success: boolean;
  day: string;
  sent: number;
  skipped: number;
  errors: number;
  timestamp: string;
}

/**
 * Execute the weekly progress report cron job
 * Automatically determines which day's reports to send based on current day
 */
export async function executeWeeklyReportsCron(): Promise<CronResult> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
  
  let result: { sent: number; skipped: number; errors: number };
  let dayName: string;
  
  if (dayOfWeek === 0) {
    // Sunday
    dayName = "Sunday";
    result = await sendSundayProgressReports();
  } else if (dayOfWeek === 1) {
    // Monday
    dayName = "Monday";
    result = await sendMondayProgressReports();
  } else {
    // Not a report day - this shouldn't happen if cron is configured correctly
    console.log(`[Cron] Weekly reports cron called on ${now.toLocaleDateString('en-US', { weekday: 'long' })} - no reports to send`);
    return {
      success: true,
      day: now.toLocaleDateString('en-US', { weekday: 'long' }),
      sent: 0,
      skipped: 0,
      errors: 0,
      timestamp: now.toISOString(),
    };
  }
  
  return {
    success: result.errors === 0,
    day: dayName,
    sent: result.sent,
    skipped: result.skipped,
    errors: result.errors,
    timestamp: now.toISOString(),
  };
}

/**
 * Force send all reports (for testing or manual trigger)
 * This ignores the day preference and sends to all opted-in learners
 */
export async function forceExecuteAllReports(): Promise<CronResult> {
  const { sendAllWeeklyProgressReports } = await import("../progress-reports");
  const now = new Date();
  
  // Send without day filter - all opted-in learners
  const result = await sendAllWeeklyProgressReports();
  
  return {
    success: result.errors === 0,
    day: "all",
    sent: result.sent,
    skipped: result.skipped,
    errors: result.errors,
    timestamp: now.toISOString(),
  };
}
