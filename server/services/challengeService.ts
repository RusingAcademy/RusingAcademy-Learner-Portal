/**
 * Sprint 35: Weekly Challenges Service
 * Handles automatic generation and management of weekly challenges
 */

import { getDb } from "../db";
import { weeklyChallenges, userWeeklyChallenges, learnerXp } from "../../drizzle/schema";
import { eq, and, sql, lte, gte } from "drizzle-orm";

// Challenge templates for automatic generation
const CHALLENGE_TEMPLATES = [
  {
    type: "lessons_complete",
    name: "Lesson Marathon",
    nameFr: "Marathon de leçons",
    description: "Complete {target} lessons this week",
    descriptionFr: "Complétez {target} leçons cette semaine",
    targetOptions: [3, 5, 7, 10],
    xpRewardBase: 30,
    badgeId: null,
  },
  {
    type: "quiz_perfect",
    name: "Quiz Master",
    nameFr: "Maître des quiz",
    description: "Get perfect scores on {target} quizzes",
    descriptionFr: "Obtenez des scores parfaits sur {target} quiz",
    targetOptions: [1, 2, 3],
    xpRewardBase: 50,
    badgeId: "quiz_master",
  },
  {
    type: "streak_maintain",
    name: "Streak Keeper",
    nameFr: "Gardien de série",
    description: "Maintain a {target}-day learning streak",
    descriptionFr: "Maintenez une série d'apprentissage de {target} jours",
    targetOptions: [3, 5, 7],
    xpRewardBase: 40,
    badgeId: null,
  },
  {
    type: "xp_earn",
    name: "XP Hunter",
    nameFr: "Chasseur d'XP",
    description: "Earn {target} XP this week",
    descriptionFr: "Gagnez {target} XP cette semaine",
    targetOptions: [100, 200, 300, 500],
    xpRewardBase: 25,
    badgeId: null,
  },
  {
    type: "speaking_practice",
    name: "Voice Champion",
    nameFr: "Champion vocal",
    description: "Complete {target} speaking exercises",
    descriptionFr: "Complétez {target} exercices de prononciation",
    targetOptions: [3, 5, 10],
    xpRewardBase: 35,
    badgeId: null,
  },
  {
    type: "daily_login",
    name: "Daily Dedication",
    nameFr: "Dévouement quotidien",
    description: "Log in {target} days this week",
    descriptionFr: "Connectez-vous {target} jours cette semaine",
    targetOptions: [5, 6, 7],
    xpRewardBase: 20,
    badgeId: "consistent_learner",
  },
];

/**
 * Get the start and end dates for the current week (Monday to Sunday)
 */
function getCurrentWeekBounds(): { weekStart: Date; weekEnd: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
}

/**
 * Generate weekly challenges for the current week
 * Should be called by a cron job at the start of each week
 */
export async function generateWeeklyChallenges(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.error("[Challenges] Database not available");
    return 0;
  }

  const { weekStart, weekEnd } = getCurrentWeekBounds();

  // Check if challenges already exist for this week
  const existingChallenges = await db.select()
    .from(weeklyChallenges)
    .where(and(
      gte(weeklyChallenges.weekStart, weekStart),
      lte(weeklyChallenges.weekEnd, weekEnd)
    ))
    .limit(1);

  if (existingChallenges.length > 0) {
    console.log("[Challenges] Challenges already exist for this week");
    return 0;
  }

  // Select 3-4 random challenge templates
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffled.slice(0, 4);

  const challengesToInsert = selectedTemplates.map((template) => {
    const targetIndex = Math.floor(Math.random() * template.targetOptions.length);
    const target = template.targetOptions[targetIndex];
    const xpReward = template.xpRewardBase + (targetIndex * 10);

    return {
      name: template.name,
      nameFr: template.nameFr,
      description: template.description.replace("{target}", String(target)),
      descriptionFr: template.descriptionFr.replace("{target}", String(target)),
      challengeType: template.type,
      targetValue: target,
      xpReward,
      badgeId: template.badgeId,
      weekStart,
      weekEnd,
      isActive: true,
    };
  });

    // @ts-ignore - overload resolution
  await db.insert(weeklyChallenges).values(challengesToInsert);
  console.log(`[Challenges] Generated ${challengesToInsert.length} challenges for week starting ${weekStart.toISOString()}`);

  return challengesToInsert.length;
}

/**
 * Deactivate expired challenges
 */
export async function deactivateExpiredChallenges(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  
  await db.update(weeklyChallenges)
    .set({ isActive: false })
    .where(and(
      eq(weeklyChallenges.isActive, true),
      lte(weeklyChallenges.weekEnd, now)
    ));

  return 0;
}

/**
 * Reset weekly XP for all users (called at start of new week)
 */
export async function resetWeeklyXp(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(learnerXp).set({ weeklyXp: 0 });
  console.log("[Challenges] Reset weekly XP for all users");
}

/**
 * Initialize the challenge scheduler
 * Should be called on server startup
 */
export function initializeChallengeScheduler(): void {
  // Generate challenges immediately if none exist for current week
  generateWeeklyChallenges().catch(console.error);

  // Check every hour for expired challenges
  setInterval(() => {
    deactivateExpiredChallenges().catch(console.error);
  }, 60 * 60 * 1000);

  console.log("[Challenges] Challenge scheduler initialized");
}
