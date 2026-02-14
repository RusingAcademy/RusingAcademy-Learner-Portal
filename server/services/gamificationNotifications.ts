import { getDb } from "../db";
import { notifications, users, learnerXp } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Gamification Notification Service
 * Handles sending notifications for badges, streaks, and XP milestones
 */

interface BadgeNotification {
  userId: number;
  badgeTitle: string;
  badgeTitleFr: string;
  badgeDescription: string;
  badgeDescriptionFr: string;
  xpAwarded?: number;
}

interface StreakNotification {
  userId: number;
  streakDays: number;
  milestone?: number;
  isAtRisk?: boolean;
}

interface LevelUpNotification {
  userId: number;
  newLevel: number;
  totalXp: number;
}

/**
 * Send a badge unlock notification to a user
 */
export async function sendBadgeUnlockNotification(data: BadgeNotification): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get user's language preference (default to English)
    const userRecords = await db.select({ name: users.name })
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);
    
    const userName = userRecords[0]?.name || "Learner";
    
    // Create notification
    await db.insert(notifications).values({
      userId: data.userId,
      type: "system",
      title: `🏆 New Badge Unlocked: ${data.badgeTitle}`,
      message: `Congratulations ${userName}! You've earned the "${data.badgeTitle}" badge. ${data.badgeDescription}${data.xpAwarded ? ` (+${data.xpAwarded} XP)` : ""}`,
      link: "/badges",
      read: false,
    });

    console.log(`[GamificationNotification] Badge notification sent to user ${data.userId}: ${data.badgeTitle}`);
    return true;
  } catch (error) {
    console.error("[GamificationNotification] Failed to send badge notification:", error);
    return false;
  }
}

/**
 * Send a streak milestone or at-risk notification
 */
export async function sendStreakNotification(data: StreakNotification): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    let title: string;
    let message: string;

    if (data.isAtRisk) {
      title = "🔥 Streak at Risk!";
      message = `Your ${data.streakDays}-day learning streak is at risk! Complete a lesson today to keep it going.`;
    } else if (data.milestone) {
      title = `🎉 ${data.milestone}-Day Streak Milestone!`;
      message = `Amazing! You've reached a ${data.milestone}-day learning streak. Keep up the fantastic work!`;
    } else {
      title = `🔥 ${data.streakDays}-Day Streak!`;
      message = `You're on fire! You've maintained a ${data.streakDays}-day learning streak.`;
    }

    await db.insert(notifications).values({
      userId: data.userId,
      type: "system",
      title,
      message,
      link: "/learner",
      read: false,
    });

    console.log(`[GamificationNotification] Streak notification sent to user ${data.userId}: ${data.streakDays} days`);
    return true;
  } catch (error) {
    console.error("[GamificationNotification] Failed to send streak notification:", error);
    return false;
  }
}

/**
 * Send a level-up notification
 */
export async function sendLevelUpNotification(data: LevelUpNotification): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(notifications).values({
      userId: data.userId,
      type: "system",
      title: `🚀 Level Up! You're now Level ${data.newLevel}!`,
      message: `Congratulations! You've reached Level ${data.newLevel} with ${data.totalXp.toLocaleString()} XP. Keep learning to unlock more rewards!`,
      link: "/learner",
      read: false,
    });

    console.log(`[GamificationNotification] Level-up notification sent to user ${data.userId}: Level ${data.newLevel}`);
    return true;
  } catch (error) {
    console.error("[GamificationNotification] Failed to send level-up notification:", error);
    return false;
  }
}

/**
 * Send daily streak reminder to users who haven't practiced today
 * This should be called by a cron job
 */
export async function sendDailyStreakReminders(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find users with active streaks who haven't practiced today
    const usersAtRisk = await db.select({
      userId: learnerXp.userId,
      currentStreak: learnerXp.currentStreak,
      lastActivityDate: learnerXp.lastActivityDate,
    })
      .from(learnerXp)
      .where(eq(learnerXp.currentStreak, learnerXp.currentStreak)); // All users with streaks

    let remindersSent = 0;

    for (const user of usersAtRisk) {
      if (user.currentStreak > 0 && user.lastActivityDate) {
        const lastActivity = new Date(user.lastActivityDate);
        lastActivity.setHours(0, 0, 0, 0);
        
        // Check if last activity was yesterday (streak at risk)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity.getTime() === yesterday.getTime()) {
          await sendStreakNotification({
            userId: user.userId,
            streakDays: user.currentStreak,
            isAtRisk: true,
          });
          remindersSent++;
        }
      }
    }

    console.log(`[GamificationNotification] Sent ${remindersSent} streak reminders`);
    return remindersSent;
  } catch (error) {
    console.error("[GamificationNotification] Failed to send streak reminders:", error);
    return 0;
  }
}

/**
 * Check and send streak milestone notifications
 */
export async function checkAndSendStreakMilestone(userId: number, streakDays: number): Promise<boolean> {
  const milestones = [3, 7, 14, 30, 60, 90, 100, 365];
  
  if (milestones.includes(streakDays)) {
    return sendStreakNotification({
      userId,
      streakDays,
      milestone: streakDays,
    });
  }
  
  return false;
}

/**
 * Check and send level-up notification if user reached a new level
 */
export async function checkAndSendLevelUp(userId: number, previousXp: number, newXp: number): Promise<boolean> {
  const getLevel = (xp: number) => Math.floor(xp / 500) + 1;
  
  const previousLevel = getLevel(previousXp);
  const newLevel = getLevel(newXp);
  
  if (newLevel > previousLevel) {
    return sendLevelUpNotification({
      userId,
      newLevel,
      totalXp: newXp,
    });
  }
  
  return false;
}
