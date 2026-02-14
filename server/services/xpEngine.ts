/**
 * XP Engine v2 — Enhanced XP calculation with multipliers, milestones, and recommendations
 * Builds on top of the existing gamification router without replacing it.
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";

async function getDbOrThrow() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// ============================================================================
// STREAK MULTIPLIERS
// ============================================================================
const STREAK_MULTIPLIERS: { minStreak: number; multiplier: number; label: string }[] = [
  { minStreak: 30, multiplier: 2.5, label: "Legendary Streak" },
  { minStreak: 21, multiplier: 2.0, label: "Master Streak" },
  { minStreak: 14, multiplier: 1.75, label: "Champion Streak" },
  { minStreak: 7, multiplier: 1.5, label: "Hot Streak" },
  { minStreak: 3, multiplier: 1.25, label: "Warming Up" },
  { minStreak: 0, multiplier: 1.0, label: "No Bonus" },
];

// ============================================================================
// LEVEL MULTIPLIERS
// ============================================================================
const LEVEL_MULTIPLIERS: { minLevel: number; multiplier: number }[] = [
  { minLevel: 8, multiplier: 1.3 },
  { minLevel: 5, multiplier: 1.2 },
  { minLevel: 3, multiplier: 1.1 },
  { minLevel: 1, multiplier: 1.0 },
];

// ============================================================================
// ACHIEVEMENT MILESTONES
// ============================================================================
export const MILESTONES = [
  { id: 1, xpThreshold: 100, title: "First Steps", titleFr: "Premiers pas", icon: "🌱", xpBonus: 25 },
  { id: 2, xpThreshold: 250, title: "Getting Started", titleFr: "En route", icon: "🚶", xpBonus: 50 },
  { id: 3, xpThreshold: 500, title: "Halfway There", titleFr: "À mi-chemin", icon: "⭐", xpBonus: 75 },
  { id: 4, xpThreshold: 1000, title: "Committed Learner", titleFr: "Apprenant engagé", icon: "🔥", xpBonus: 100 },
  { id: 5, xpThreshold: 2000, title: "Rising Star", titleFr: "Étoile montante", icon: "🌟", xpBonus: 150 },
  { id: 6, xpThreshold: 3500, title: "Knowledge Seeker", titleFr: "Chercheur de savoir", icon: "📚", xpBonus: 200 },
  { id: 7, xpThreshold: 5000, title: "Language Warrior", titleFr: "Guerrier linguistique", icon: "⚔️", xpBonus: 250 },
  { id: 8, xpThreshold: 7500, title: "Expert Communicator", titleFr: "Communicateur expert", icon: "🎯", xpBonus: 300 },
  { id: 9, xpThreshold: 10000, title: "Bilingual Champion", titleFr: "Champion bilingue", icon: "🏆", xpBonus: 500 },
  { id: 10, xpThreshold: 15000, title: "Legendary Scholar", titleFr: "Érudit légendaire", icon: "👑", xpBonus: 750 },
];

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Calculate the effective XP multiplier for a user based on streak and level
 */
export function calculateXpMultiplier(currentStreak: number, currentLevel: number): {
  totalMultiplier: number;
  streakMultiplier: number;
  levelMultiplier: number;
  streakLabel: string;
} {
  const streakEntry = STREAK_MULTIPLIERS.find(s => currentStreak >= s.minStreak) || STREAK_MULTIPLIERS[STREAK_MULTIPLIERS.length - 1];
  const levelEntry = LEVEL_MULTIPLIERS.find(l => currentLevel >= l.minLevel) || LEVEL_MULTIPLIERS[LEVEL_MULTIPLIERS.length - 1];

  return {
    totalMultiplier: parseFloat((streakEntry.multiplier * levelEntry.multiplier).toFixed(2)),
    streakMultiplier: streakEntry.multiplier,
    levelMultiplier: levelEntry.multiplier,
    streakLabel: streakEntry.label,
  };
}

/**
 * Calculate XP with multipliers applied
 */
export function calculateEnhancedXp(
  baseXp: number,
  currentStreak: number,
  currentLevel: number
): {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  multiplier: ReturnType<typeof calculateXpMultiplier>;
} {
  const multiplier = calculateXpMultiplier(currentStreak, currentLevel);
  const totalXp = Math.round(baseXp * multiplier.totalMultiplier);
  const bonusXp = totalXp - baseXp;

  return {
    baseXp,
    bonusXp,
    totalXp,
    multiplier,
  };
}

/**
 * Check if a user has reached new milestones after XP gain
 */
export function checkNewMilestones(
  previousXp: number,
  currentXp: number,
  alreadyReached: number[] = []
): typeof MILESTONES {
  return MILESTONES.filter(
    m => currentXp >= m.xpThreshold && previousXp < m.xpThreshold && !alreadyReached.includes(m.id)
  );
}

/**
 * Get the next milestone for a user
 */
export function getNextMilestone(currentXp: number): (typeof MILESTONES)[0] | null {
  return MILESTONES.find(m => currentXp < m.xpThreshold) || null;
}

/**
 * Get progress towards the next milestone
 */
export function getMilestoneProgress(currentXp: number): {
  current: (typeof MILESTONES)[0] | null;
  next: (typeof MILESTONES)[0] | null;
  progressPercent: number;
  xpRemaining: number;
} {
  const reached = MILESTONES.filter(m => currentXp >= m.xpThreshold);
  const current = reached.length > 0 ? reached[reached.length - 1] : null;
  const next = getNextMilestone(currentXp);

  if (!next) {
    return { current, next: null, progressPercent: 100, xpRemaining: 0 };
  }

  const startXp = current ? current.xpThreshold : 0;
  const range = next.xpThreshold - startXp;
  const progress = currentXp - startXp;
  const progressPercent = Math.min(100, Math.round((progress / range) * 100));

  return {
    current,
    next,
    progressPercent,
    xpRemaining: next.xpThreshold - currentXp,
  };
}

/**
 * Generate personalized recommendations based on learner activity
 */
export async function getPersonalizedRecommendations(userId: number): Promise<{
  nextSteps: Array<{
    type: "course" | "practice" | "challenge" | "coaching" | "review";
    title: string;
    titleFr: string;
    description: string;
    descriptionFr: string;
    priority: "high" | "medium" | "low";
    xpReward: number;
    link?: string;
  }>;
  focusArea: string;
  focusAreaFr: string;
}> {
  const recommendations: Array<{
    type: "course" | "practice" | "challenge" | "coaching" | "review";
    title: string;
    titleFr: string;
    description: string;
    descriptionFr: string;
    priority: "high" | "medium" | "low";
    xpReward: number;
    link?: string;
  }> = [];

  try {
    const db = await getDbOrThrow();
    // Check incomplete courses
    const [incompleteCourses] = await db.execute(sql`
      SELECT c.id, c.title, c.titleFr, 
        COUNT(DISTINCT l.id) as totalLessons,
        COUNT(DISTINCT CASE WHEN lp.status = 'completed' THEN lp.lessonId END) as completedLessons
      FROM course_enrollments e
      JOIN courses c ON e.courseId = c.id
      LEFT JOIN modules m ON m.courseId = c.id
      LEFT JOIN lessons l ON l.moduleId = m.id
      LEFT JOIN lesson_progress lp ON lp.lessonId = l.id AND lp.userId = ${userId}
      WHERE e.userId = ${userId} AND e.status = 'active'
      GROUP BY c.id
      HAVING completedLessons < totalLessons
      ORDER BY (completedLessons / totalLessons) DESC
      LIMIT 3
    `);

    const courses = incompleteCourses as unknown as any[];
    for (const course of courses) {
      const progress = Math.round((course.completedLessons / course.totalLessons) * 100);
      recommendations.push({
        type: "course",
        title: `Continue: ${course.title}`,
        titleFr: `Continuer : ${course.titleFr || course.title}`,
        description: `You're ${progress}% through this course. ${course.totalLessons - course.completedLessons} lessons remaining.`,
        descriptionFr: `Vous avez complété ${progress}% de ce cours. ${course.totalLessons - course.completedLessons} leçons restantes.`,
        priority: progress > 50 ? "high" : "medium",
        xpReward: (course.totalLessons - course.completedLessons) * 10,
        link: `/courses/${course.id}`,
      });
    }

    // Check streak status
    const [streakData] = await db.execute(sql`
      SELECT currentStreak, lastActivityDate FROM learner_xp WHERE userId = ${userId} LIMIT 1
    `);
    const streak = (streakData as unknown as any[])[0];
    if (streak) {
      const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
      const now = new Date();
      const hoursSinceActivity = lastActivity
        ? (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
        : 999;

      if (hoursSinceActivity > 20 && streak.currentStreak > 0) {
        recommendations.push({
          type: "practice",
          title: "Protect Your Streak!",
          titleFr: "Protégez votre série !",
          description: `Your ${streak.currentStreak}-day streak is at risk. Complete any activity to keep it alive.`,
          descriptionFr: `Votre série de ${streak.currentStreak} jours est en danger. Complétez une activité pour la maintenir.`,
          priority: "high",
          xpReward: 5,
          link: "/practice",
        });
      }
    }

    // Check active weekly challenges
    const [activeChallenges] = await db.execute(sql`
      SELECT wc.title, wc.titleFr, wc.xpReward, wc.targetCount, 
        COALESCE(uwc.currentProgress, 0) as progress
      FROM weekly_challenges wc
      LEFT JOIN user_weekly_challenges uwc ON uwc.challengeId = wc.id AND uwc.userId = ${userId}
      WHERE wc.isActive = TRUE AND wc.weekEnd > NOW()
      AND (uwc.status IS NULL OR uwc.status = 'active')
      LIMIT 2
    `);

    const challenges = activeChallenges as unknown as any[];
    for (const challenge of challenges) {
      recommendations.push({
        type: "challenge",
        title: challenge.title,
        titleFr: challenge.titleFr || challenge.title,
        description: `Progress: ${challenge.progress}/${challenge.targetCount}. Earn ${challenge.xpReward} XP!`,
        descriptionFr: `Progression : ${challenge.progress}/${challenge.targetCount}. Gagnez ${challenge.xpReward} XP !`,
        priority: "medium",
        xpReward: challenge.xpReward,
        link: "/dashboard",
      });
    }

    // Suggest coaching if no recent sessions
    const [recentSessions] = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM sessions 
      WHERE learnerId = ${userId} AND scheduledAt > DATE_SUB(NOW(), INTERVAL 14 DAY)
    `);
    const sessionCount = (recentSessions as unknown as any[])[0]?.cnt || 0;
    if (sessionCount === 0) {
      recommendations.push({
        type: "coaching",
        title: "Book a Coaching Session",
        titleFr: "Réservez une séance de coaching",
        description: "It's been a while since your last session. A coach can accelerate your progress.",
        descriptionFr: "Cela fait un moment depuis votre dernière séance. Un coach peut accélérer vos progrès.",
        priority: "low",
        xpReward: 0,
        link: "/coaches",
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Determine focus area based on recent activity
    const [recentPractice] = await db.execute(sql`
      SELECT practiceType, COUNT(*) as cnt 
      FROM practice_logs 
      WHERE userId = ${userId} AND createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY practiceType
      ORDER BY cnt DESC
      LIMIT 1
    `);
    const topPractice = (recentPractice as unknown as any[])[0];

    const focusAreas: Record<string, { en: string; fr: string }> = {
      oral_practice: { en: "Oral Communication", fr: "Communication orale" },
      writing_practice: { en: "Written Expression", fr: "Expression écrite" },
      reading_practice: { en: "Reading Comprehension", fr: "Compréhension écrite" },
      listening_practice: { en: "Listening Comprehension", fr: "Compréhension orale" },
      vocabulary_drill: { en: "Vocabulary Building", fr: "Enrichissement du vocabulaire" },
      grammar_exercise: { en: "Grammar Mastery", fr: "Maîtrise de la grammaire" },
      speaking_prompt: { en: "Speaking Fluency", fr: "Fluidité orale" },
      role_play: { en: "Conversational Skills", fr: "Compétences conversationnelles" },
    };

    const focus = topPractice
      ? focusAreas[topPractice.practiceType] || { en: "General Language Skills", fr: "Compétences linguistiques générales" }
      : { en: "Getting Started", fr: "Commencer" };

    return {
      nextSteps: recommendations.slice(0, 5),
      focusArea: focus.en,
      focusAreaFr: focus.fr,
    };
  } catch (error) {
    console.error("[XPEngine] Error generating recommendations:", error);
    return {
      nextSteps: [],
      focusArea: "General Language Skills",
      focusAreaFr: "Compétences linguistiques générales",
    };
  }
}

/**
 * Get recent activity feed for a user
 */
export async function getActivityFeed(userId: number, limit: number = 20): Promise<Array<{
  id: number;
  type: string;
  description: string;
  descriptionFr: string;
  xpEarned: number;
  timestamp: Date;
  icon: string;
}>> {
  try {
    const db = await getDbOrThrow();
    const [transactions] = await db.execute(sql`
      SELECT id, amount, reason, description, createdAt
      FROM xp_transactions
      WHERE userId = ${userId}
      ORDER BY createdAt DESC
      LIMIT ${limit}
    `);

    const ACTIVITY_ICONS: Record<string, string> = {
      lesson_complete: "📖",
      quiz_pass: "✅",
      quiz_perfect: "💯",
      module_complete: "📦",
      course_complete: "🎓",
      streak_bonus: "🔥",
      daily_login: "👋",
      first_lesson: "🌟",
      challenge_complete: "🏅",
      review_submitted: "📝",
      note_created: "📒",
      exercise_complete: "💪",
      speaking_practice: "🗣️",
      writing_submitted: "✍️",
      milestone_bonus: "🏆",
      level_up_bonus: "⬆️",
      referral_bonus: "🤝",
    };

    const ACTIVITY_LABELS: Record<string, { en: string; fr: string }> = {
      lesson_complete: { en: "Completed a lesson", fr: "Leçon complétée" },
      quiz_pass: { en: "Passed a quiz", fr: "Quiz réussi" },
      quiz_perfect: { en: "Perfect quiz score!", fr: "Score parfait au quiz !" },
      module_complete: { en: "Completed a module", fr: "Module complété" },
      course_complete: { en: "Completed a course!", fr: "Cours complété !" },
      streak_bonus: { en: "Streak bonus", fr: "Bonus de série" },
      daily_login: { en: "Daily login", fr: "Connexion quotidienne" },
      first_lesson: { en: "First lesson completed!", fr: "Première leçon complétée !" },
      challenge_complete: { en: "Challenge completed!", fr: "Défi complété !" },
      review_submitted: { en: "Review submitted", fr: "Avis soumis" },
      note_created: { en: "Note created", fr: "Note créée" },
      exercise_complete: { en: "Exercise completed", fr: "Exercice complété" },
      speaking_practice: { en: "Speaking practice", fr: "Pratique orale" },
      writing_submitted: { en: "Writing submitted", fr: "Rédaction soumise" },
      milestone_bonus: { en: "Milestone reached!", fr: "Jalon atteint !" },
      level_up_bonus: { en: "Level up!", fr: "Niveau supérieur !" },
      referral_bonus: { en: "Referral bonus", fr: "Bonus de parrainage" },
    };

    return (transactions as unknown as any[]).map(t => {
      const labels = ACTIVITY_LABELS[t.reason] || { en: t.description || t.reason, fr: t.description || t.reason };
      return {
        id: t.id,
        type: t.reason,
        description: t.description || labels.en,
        descriptionFr: labels.fr,
        xpEarned: t.amount,
        timestamp: t.createdAt,
        icon: ACTIVITY_ICONS[t.reason] || "⚡",
      };
    });
  } catch (error) {
    console.error("[XPEngine] Error fetching activity feed:", error);
    return [];
  }
}
