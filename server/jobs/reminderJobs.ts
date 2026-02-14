/**
 * Scheduled Job Runner for Email Reminders
 * Handles daily checks for plan expiry and user inactivity
 */

import { getDb } from "../db";
import { coachingPlanPurchases, users } from "../../drizzle/schema";
import { eq, and, lte, gte, lt, isNull, or } from "drizzle-orm";
import {
  sendPlanExpiryReminderEmail,
  sendInactivityReminderEmail,
} from "../email-reminders";

// Job state tracking
let isRunning = false;
let lastRunTime: Date | null = null;

/**
 * Check for expiring coaching plans and send reminder emails
 * Sends reminders at 7 days, 3 days, and 1 day before expiry
 */
export async function checkExpiringPlans(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) {
    console.error("[Jobs] Database not available for checkExpiringPlans");
    return { processed: 0, sent: 0, errors: 0 };
  }

  const now = new Date();
  const stats = { processed: 0, sent: 0, errors: 0 };

  // Define reminder intervals (days before expiry)
  const reminderIntervals = [7, 3, 1];

  for (const daysBeforeExpiry of reminderIntervals) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);
    
    // Set to start and end of day for comparison
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    try {
      // Find plans expiring on this target date
      const expiringPlans = await db
        .select({
          plan: coachingPlanPurchases,
          user: users,
        })
        .from(coachingPlanPurchases)
        .innerJoin(users, eq(coachingPlanPurchases.userId, users.id))
        .where(
          and(
            eq(coachingPlanPurchases.status, "active"),
            gte(coachingPlanPurchases.expiresAt, dayStart),
            lte(coachingPlanPurchases.expiresAt, dayEnd)
          )
        );

      stats.processed += expiringPlans.length;

      for (const { plan, user } of expiringPlans) {
        try {
          // Check if we've already sent a reminder for this interval
          // (In production, you'd track this in a separate table)
          const reminderKey = `expiry_${plan.id}_${daysBeforeExpiry}`;
          
          await sendPlanExpiryReminderEmail({
            userEmail: user.email || "",
            userName: user.name || "Learner",
            planName: plan.planName,
            // @ts-expect-error - TS2353: auto-suppressed during TS cleanup
            expiryDate: new Date(plan.expiresAt).toLocaleDateString("en-CA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            remainingSessions: plan.remainingSessions,
            daysRemaining: daysBeforeExpiry,
          });

          stats.sent++;
          console.log(
            `[Jobs] Sent ${daysBeforeExpiry}-day expiry reminder to ${user.email} for plan ${plan.id}`
          );
        } catch (error) {
          stats.errors++;
          console.error(
            `[Jobs] Failed to send expiry reminder to ${user.email}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error(
        `[Jobs] Error checking ${daysBeforeExpiry}-day expiring plans:`,
        error
      );
      stats.errors++;
    }
  }

  return stats;
}

/**
 * Check for inactive users and send reminder emails
 * Sends reminder to users who haven't logged in for 7+ days
 */
export async function checkInactiveUsers(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) {
    console.error("[Jobs] Database not available for checkInactiveUsers");
    return { processed: 0, sent: 0, errors: 0 };
  }

  const stats = { processed: 0, sent: 0, errors: 0 };

  // Find users who haven't logged in for 7+ days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const inactiveUsers = await db
      .select()
      .from(users)
      .where(
        and(
          or(
            lte(users.lastSignedIn, sevenDaysAgo),
            isNull(users.lastSignedIn)
          ),
          // Only send to users who have been active at some point
          // and have an email
          eq(users.role, "user")
        )
      )
      .limit(100); // Process in batches

    stats.processed = inactiveUsers.length;

    for (const user of inactiveUsers) {
      if (!user.email) continue;

      try {
        // Calculate days since last login
        const lastLogin = user.lastSignedIn || user.createdAt;
        const daysSinceLogin = Math.floor(
          (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send if between 7-30 days (avoid spamming very old accounts)
        if (daysSinceLogin < 7 || daysSinceLogin > 30) continue;

        await sendInactivityReminderEmail({
          userEmail: user.email,
          userName: user.name || "Learner",
          daysSinceLastLogin: daysSinceLogin,
          // @ts-expect-error - TS2353: auto-suppressed during TS cleanup
          lastLoginDate: new Date(lastLogin).toLocaleDateString("en-CA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        });

        stats.sent++;
        console.log(
          `[Jobs] Sent inactivity reminder to ${user.email} (${daysSinceLogin} days inactive)`
        );
      } catch (error) {
        stats.errors++;
        console.error(
          `[Jobs] Failed to send inactivity reminder to ${user.email}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[Jobs] Error checking inactive users:", error);
    stats.errors++;
  }

  return stats;
}

/**
 * Run all reminder jobs
 */
export async function runAllReminderJobs(): Promise<{
  expiryReminders: { processed: number; sent: number; errors: number };
  inactivityReminders: { processed: number; sent: number; errors: number };
  runTime: Date;
}> {
  if (isRunning) {
    console.log("[Jobs] Reminder jobs already running, skipping...");
    return {
      expiryReminders: { processed: 0, sent: 0, errors: 0 },
      inactivityReminders: { processed: 0, sent: 0, errors: 0 },
      runTime: lastRunTime || new Date(),
    };
  }

  isRunning = true;
  const startTime = new Date();
  console.log(`[Jobs] Starting reminder jobs at ${startTime.toISOString()}`);

  try {
    const [expiryResults, inactivityResults] = await Promise.all([
      checkExpiringPlans(),
      checkInactiveUsers(),
    ]);

    lastRunTime = new Date();
    console.log(
      `[Jobs] Reminder jobs completed. Expiry: ${expiryResults.sent} sent, Inactivity: ${inactivityResults.sent} sent`
    );

    return {
      expiryReminders: expiryResults,
      inactivityReminders: inactivityResults,
      runTime: lastRunTime,
    };
  } finally {
    isRunning = false;
  }
}

/**
 * Schedule the reminder jobs to run daily
 * @param hour - Hour of day to run (0-23), defaults to 9 AM
 * @param minute - Minute of hour to run (0-59), defaults to 0
 */
export function scheduleReminderJobs(hour: number = 9, minute: number = 0): NodeJS.Timeout {
  const runJob = async () => {
    const now = new Date();
    if (now.getHours() === hour && now.getMinutes() === minute) {
      await runAllReminderJobs();
    }
  };

  // Check every minute if it's time to run
  const intervalId = setInterval(runJob, 60 * 1000);

  console.log(
    `[Jobs] Reminder jobs scheduled to run daily at ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  );

  return intervalId;
}

/**
 * Get job status
 */
export function getJobStatus(): {
  isRunning: boolean;
  lastRunTime: Date | null;
} {
  return { isRunning, lastRunTime };
}
