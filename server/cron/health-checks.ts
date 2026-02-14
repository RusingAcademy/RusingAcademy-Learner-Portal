/**
 * Automated Health Check Cron Job
 * Runs hourly to detect webhook failures, low AI scores, 
 * pipeline degradation, and new coach signups.
 * Triggers admin notifications via notifyOwner when issues are found.
 */

import { runAllHealthChecks } from "../services/adminNotifications";

let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Execute a single health check cycle
 */
export async function executeHealthChecks(): Promise<{
  ran: boolean;
  timestamp: string;
  results: Awaited<ReturnType<typeof runAllHealthChecks>> | null;
  error?: string;
}> {
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[HealthCheck] Running automated health checks at ${timestamp}`);
    const results = await runAllHealthChecks();
    
    console.log(`[HealthCheck] Completed: ${results.checked.length} checks ran, ${results.alerts} alerts triggered`);
    
    return {
      ran: true,
      timestamp,
      results,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[HealthCheck] Error during health checks:`, errorMsg);
    
    return {
      ran: false,
      timestamp,
      results: null,
      error: errorMsg,
    };
  }
}

/**
 * Start the hourly health check scheduler
 * @param intervalMs - Interval in milliseconds (default: 1 hour)
 */
export function startHealthCheckScheduler(intervalMs: number = 60 * 60 * 1000): void {
  if (healthCheckInterval) {
    console.log("[HealthCheck] Scheduler already running, skipping duplicate start");
    return;
  }

  console.log(`[HealthCheck] Starting scheduler (interval: ${intervalMs / 1000}s)`);

  // Run initial check after 2 minutes (let server fully warm up)
  setTimeout(async () => {
    console.log("[HealthCheck] Running initial health check...");
    await executeHealthChecks();
  }, 2 * 60 * 1000);

  // Then run on the configured interval
  healthCheckInterval = setInterval(async () => {
    await executeHealthChecks();
  }, intervalMs);

  // Ensure cleanup on process exit
  process.on("beforeExit", stopHealthCheckScheduler);
}

/**
 * Stop the health check scheduler
 */
export function stopHealthCheckScheduler(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log("[HealthCheck] Scheduler stopped");
  }
}

/**
 * Check if the scheduler is currently running
 */
export function isHealthCheckSchedulerRunning(): boolean {
  return healthCheckInterval !== null;
}
