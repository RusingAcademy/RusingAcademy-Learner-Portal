/**
 * Sprint 35: Streak Email Notification Service
 * Sends daily email reminders to users at risk of losing their streak
 */

import { getDb } from "../db";
import { learnerXp, users } from "../../drizzle/schema";
import { eq, and, sql, lt, gt, isNotNull } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

interface StreakAtRiskUser {
  userId: number;
  email: string;
  name: string;
  currentStreak: number;
  lastActivityDate: Date;
  streakFreezeAvailable: boolean;
}

/**
 * Find users whose streaks are at risk (no activity yesterday)
 */
export async function findStreaksAtRisk(): Promise<StreakAtRiskUser[]> {
  const db = await getDb();
  if (!db) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Find users with:
  // - Active streak (> 0)
  // - Last activity was yesterday (at risk) or two days ago (critical)
  const atRiskUsers = await db
    .select({
      userId: learnerXp.userId,
      email: users.email,
      name: users.name,
      currentStreak: learnerXp.currentStreak,
      lastActivityDate: learnerXp.lastActivityDate,
      streakFreezeAvailable: learnerXp.streakFreezeAvailable,
    })
    .from(learnerXp)
    .innerJoin(users, eq(learnerXp.userId, users.id))
    .where(
      and(
        gt(learnerXp.currentStreak, 0),
        isNotNull(learnerXp.lastActivityDate),
        sql`DATE(${learnerXp.lastActivityDate}) <= ${yesterday.toISOString().split("T")[0]}`,
        sql`DATE(${learnerXp.lastActivityDate}) >= ${twoDaysAgo.toISOString().split("T")[0]}`
      )
    );

  return atRiskUsers.map((u) => ({
    userId: u.userId,
    email: u.email || "",
    name: u.name || "Learner",
    currentStreak: u.currentStreak,
    lastActivityDate: u.lastActivityDate!,
    streakFreezeAvailable: u.streakFreezeAvailable || false,
  }));
}

/**
 * Generate email content for streak reminder
 */
function generateStreakReminderEmail(user: StreakAtRiskUser): { subject: string; html: string } {
  const isYesterday = new Date(user.lastActivityDate).toDateString() === 
    new Date(Date.now() - 86400000).toDateString();
  
  const urgency = isYesterday ? "at risk" : "about to be lost";
  const emoji = isYesterday ? "⚠️" : "🚨";

  const subject = `${emoji} Your ${user.currentStreak}-day streak is ${urgency}!`;

  const freezeSection = user.streakFreezeAvailable
    ? `
      <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; color: #92400E;">
          <strong>❄️ Good news!</strong> You have a streak freeze available. 
          Use it to protect your streak without completing a lesson today.
        </p>
      </div>
    `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0F3D3E; margin: 0;">RusingAcademy</h1>
      </div>
      
      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 8px;">🔥</div>
        <h2 style="margin: 0 0 8px; color: #92400E;">${user.currentStreak}-Day Streak</h2>
        <p style="margin: 0; color: #B45309; font-weight: 500;">Don't let it slip away!</p>
      </div>
      
      <p>Hi ${user.name},</p>
      
      <p>
        Your impressive <strong>${user.currentStreak}-day learning streak</strong> is ${urgency}! 
        ${isYesterday 
          ? "You haven't completed any lessons today yet." 
          : "You missed yesterday's practice."}
      </p>
      
      ${freezeSection}
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://rusingacademy.com/learner" 
           style="display: inline-block; background: #0F3D3E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Continue Learning →
        </a>
      </div>
      
      <p style="color: #6B7280; font-size: 14px;">
        Just 5 minutes of practice is enough to keep your streak alive. 
        Every day counts towards your language learning goals!
      </p>
      
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
      
      <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
        You're receiving this because you have an active streak on RusingAcademy.<br>
        <a href="https://rusingacademy.com/settings" style="color: #6B7280;">Manage notification preferences</a>
      </p>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Send streak reminder emails to all at-risk users
 * Should be called daily (e.g., at 6 PM local time)
 */
export async function sendStreakReminders(): Promise<{ sent: number; errors: number }> {
  const atRiskUsers = await findStreaksAtRisk();
  
  if (atRiskUsers.length === 0) {
    console.log("[StreakEmail] No users with at-risk streaks");
    return { sent: 0, errors: 0 };
  }

  console.log(`[StreakEmail] Found ${atRiskUsers.length} users with at-risk streaks`);

  let sent = 0;
  let errors = 0;

  for (const user of atRiskUsers) {
    if (!user.email) {
      console.log(`[StreakEmail] Skipping user ${user.userId} - no email`);
      continue;
    }

    try {
      const { subject, html } = generateStreakReminderEmail(user);
      
      // For now, log the email (in production, integrate with email service)
      console.log(`[StreakEmail] Would send to ${user.email}: ${subject}`);
      
      // TODO: Integrate with actual email service
      // await sendEmail({ to: user.email, subject, html });
      
      sent++;
    } catch (error) {
      console.error(`[StreakEmail] Error sending to ${user.email}:`, error);
      errors++;
    }
  }

  // Notify owner about streak reminders sent
  if (sent > 0) {
    await notifyOwner({
      title: "Daily Streak Reminders Sent",
      content: `Sent ${sent} streak reminder emails. ${errors} errors.`,
    });
  }

  return { sent, errors };
}

/**
 * Initialize the streak email scheduler
 * Runs daily at 6 PM EST
 */
export function initializeStreakEmailScheduler(): void {
  // Run every hour, but only send at 6 PM
  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Send reminders at 6 PM (18:00)
    if (hour === 18) {
      await sendStreakReminders();
    }
  }, 60 * 60 * 1000);

  console.log("[StreakEmail] Streak email scheduler initialized");
}
