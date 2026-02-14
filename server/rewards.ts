// Automatic Rewards System for Lingueefy
// Awards points and badges automatically when milestones are achieved

import { getDb } from "./db";
import { eq, and, sql } from "drizzle-orm";

// Point values for different actions
export const POINT_VALUES = {
  SESSION_COMPLETED: 100,
  REVIEW_SUBMITTED: 50,
  FIRST_SESSION: 200,
  REFERRAL_SIGNUP: 300,
  REFERRAL_FIRST_SESSION: 500,
  AI_PRACTICE_SESSION: 25,
  STREAK_7_DAYS: 150,
  STREAK_30_DAYS: 500,
  PROFILE_COMPLETED: 100,
};

// Badge definitions
export const BADGES = {
  FIRST_SESSION: {
    id: "first_session",
    name: "First Steps",
    nameFr: "Premiers pas",
    description: "Completed your first coaching session",
    descriptionFr: "Vous avez complété votre première séance de coaching",
    icon: "🎯",
  },
  FIVE_SESSIONS: {
    id: "five_sessions",
    name: "Getting Started",
    nameFr: "Bien parti",
    description: "Completed 5 coaching sessions",
    descriptionFr: "Vous avez complété 5 séances de coaching",
    icon: "⭐",
  },
  TEN_SESSIONS: {
    id: "ten_sessions",
    name: "Dedicated Learner",
    nameFr: "Apprenant dévoué",
    description: "Completed 10 coaching sessions",
    descriptionFr: "Vous avez complété 10 séances de coaching",
    icon: "🌟",
  },
  TWENTY_FIVE_SESSIONS: {
    id: "twenty_five_sessions",
    name: "Language Enthusiast",
    nameFr: "Passionné des langues",
    description: "Completed 25 coaching sessions",
    descriptionFr: "Vous avez complété 25 séances de coaching",
    icon: "🏆",
  },
  FIFTY_SESSIONS: {
    id: "fifty_sessions",
    name: "Language Master",
    nameFr: "Maître des langues",
    description: "Completed 50 coaching sessions",
    descriptionFr: "Vous avez complété 50 séances de coaching",
    icon: "👑",
  },
  FIRST_REVIEW: {
    id: "first_review",
    name: "Voice Heard",
    nameFr: "Voix entendue",
    description: "Submitted your first review",
    descriptionFr: "Vous avez soumis votre premier avis",
    icon: "💬",
  },
  FIVE_REVIEWS: {
    id: "five_reviews",
    name: "Helpful Reviewer",
    nameFr: "Évaluateur utile",
    description: "Submitted 5 reviews",
    descriptionFr: "Vous avez soumis 5 avis",
    icon: "📝",
  },
  REFERRAL_CHAMPION: {
    id: "referral_champion",
    name: "Referral Champion",
    nameFr: "Champion du parrainage",
    description: "Referred 5 friends who signed up",
    descriptionFr: "Vous avez parrainé 5 amis qui se sont inscrits",
    icon: "🤝",
  },
  WEEK_STREAK: {
    id: "week_streak",
    name: "Week Warrior",
    nameFr: "Guerrier de la semaine",
    description: "Maintained a 7-day learning streak",
    descriptionFr: "Vous avez maintenu une série de 7 jours d'apprentissage",
    icon: "🔥",
  },
  MONTH_STREAK: {
    id: "month_streak",
    name: "Month Master",
    nameFr: "Maître du mois",
    description: "Maintained a 30-day learning streak",
    descriptionFr: "Vous avez maintenu une série de 30 jours d'apprentissage",
    icon: "💪",
  },
  AI_EXPLORER: {
    id: "ai_explorer",
    name: "AI Explorer",
    nameFr: "Explorateur IA",
    description: "Completed 10 AI practice sessions",
    descriptionFr: "Vous avez complété 10 séances de pratique avec l'IA",
    icon: "🤖",
  },
  SLE_ACHIEVER: {
    id: "sle_achiever",
    name: "SLE Achiever",
    nameFr: "Réussite SLE",
    description: "Improved your SLE level",
    descriptionFr: "Vous avez amélioré votre niveau SLE",
    icon: "📈",
  },
};

// Award points to a learner
export async function awardPoints(
  learnerId: number,
  points: number,
  type: string,
  description: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const { loyaltyPoints, pointTransactions, inAppNotifications, learnerProfiles } = await import("../drizzle/schema");

    // Get learner's user ID for notification
    const [learner] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.id, learnerId));
    if (!learner) return false;

    // Get or create loyalty points record
    const [existingPoints] = await db.select().from(loyaltyPoints)
      .where(eq(loyaltyPoints.learnerId, learnerId));

    let newTotal = points;
    let newAvailable = points;
    let newTier = "bronze";

    if (existingPoints) {
      newTotal = existingPoints.totalPoints + points;
      newAvailable = existingPoints.availablePoints + points;
      newTier = calculateTier(newTotal);

      await db.update(loyaltyPoints)
        .set({
          totalPoints: newTotal,
          availablePoints: newAvailable,
          tier: newTier as "bronze" | "silver" | "gold" | "platinum",
          updatedAt: new Date(),
        })
        .where(eq(loyaltyPoints.learnerId, learnerId));
    } else {
      newTier = calculateTier(points);
      await db.insert(loyaltyPoints).values({
        learnerId,
        totalPoints: points,
        availablePoints: points,
        tier: newTier as "bronze" | "silver" | "gold" | "platinum",
      });
    }

    // Record transaction - map type to valid enum value
    const typeMap: Record<string, "earned_booking" | "earned_review" | "earned_referral" | "earned_streak" | "earned_milestone" | "redeemed_discount" | "redeemed_session" | "expired" | "adjustment"> = {
      "earned_session": "earned_booking",
      "earned_practice": "earned_milestone",
      "earned_milestone": "earned_milestone",
      "earned_review": "earned_review",
      "earned_referral": "earned_referral",
    };
    const mappedType = typeMap[type] || "earned_milestone";
    
    await db.insert(pointTransactions).values({
      learnerId,
      points,
      type: mappedType,
      description,
    });

    // Create in-app notification
    await db.insert(inAppNotifications).values({
      userId: learner.userId,
      type: "points",
      title: `+${points} Points Earned!`,
      titleFr: `+${points} Points gagnés!`,
      message: description,
      messageFr: description,
      linkType: "learner",
      linkId: learnerId,
    });

    // Check for tier upgrade
    if (existingPoints && newTier !== existingPoints.tier) {
      await db.insert(inAppNotifications).values({
        userId: learner.userId,
        type: "system",
        title: `Congratulations! You've reached ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} tier!`,
        titleFr: `Félicitations! Vous avez atteint le niveau ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}!`,
        message: `You now have access to ${newTier} tier benefits.`,
        messageFr: `Vous avez maintenant accès aux avantages du niveau ${newTier}.`,
        linkType: "learner",
        linkId: learnerId,
      });
    }

    return true;
  } catch (error) {
    console.error("Error awarding points:", error);
    return false;
  }
}

// Award a badge to a learner (creates notification only - badges stored separately)
export async function awardBadge(
  learnerId: number,
  badgeId: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const { learnerProfiles, inAppNotifications } = await import("../drizzle/schema");
    
    // Get learner's user ID
    const [learner] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.id, learnerId));
    if (!learner) return false;

    const badge = Object.values(BADGES).find(b => b.id === badgeId);
    if (!badge) return false;

    // Create notification for badge earned
    await db.insert(inAppNotifications).values({
      userId: learner.userId,
      type: "challenge",
      title: `${badge.icon} New Badge Earned: ${badge.name}!`,
      titleFr: `${badge.icon} Nouveau badge obtenu: ${badge.nameFr}!`,
      message: badge.description,
      messageFr: badge.descriptionFr,
      linkType: "none",
    });

    return true;
  } catch (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
}

// Check and award badges based on session count
export async function checkSessionMilestones(learnerId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const { sessions } = await import("../drizzle/schema");

    // Count completed sessions
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(sessions)
      .where(and(
        eq(sessions.learnerId, learnerId),
        eq(sessions.status, "completed")
      ));

    const sessionCount = Number(result?.count || 0);

    // Check milestones
    if (sessionCount >= 1) await awardBadge(learnerId, "first_session");
    if (sessionCount >= 5) await awardBadge(learnerId, "five_sessions");
    if (sessionCount >= 10) await awardBadge(learnerId, "ten_sessions");
    if (sessionCount >= 25) await awardBadge(learnerId, "twenty_five_sessions");
    if (sessionCount >= 50) await awardBadge(learnerId, "fifty_sessions");
  } catch (error) {
    console.error("Error checking session milestones:", error);
  }
}

// Check and award badges based on review count
export async function checkReviewMilestones(learnerId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const { reviews } = await import("../drizzle/schema");

    // Count reviews by this user
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.learnerId, learnerId));

    const reviewCount = Number(result?.count || 0);

    // Check milestones
    if (reviewCount >= 1) await awardBadge(learnerId, "first_review");
    if (reviewCount >= 5) await awardBadge(learnerId, "five_reviews");
  } catch (error) {
    console.error("Error checking review milestones:", error);
  }
}

// Check and award badges based on AI practice sessions
export async function checkAIPracticeMilestones(learnerId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const { aiSessions } = await import("../drizzle/schema");

    // Count AI sessions
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(aiSessions)
      .where(eq(aiSessions.learnerId, learnerId));

    const aiSessionCount = Number(result?.count || 0);

    // Check milestones
    if (aiSessionCount >= 10) await awardBadge(learnerId, "ai_explorer");
  } catch (error) {
    console.error("Error checking AI practice milestones:", error);
  }
}

// Update challenge progress
export async function updateChallengeProgress(
  userId: number,
  challengeType: string,
  increment: number = 1
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const { userChallenges, challenges } = await import("../drizzle/schema");

    // Get active challenges of this type
    const activeChallenges = await db.select()
      .from(userChallenges)
      .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
      .where(eq(userChallenges.userId, userId));
    
    // Filter by challenge type in JavaScript
    const filteredChallenges = activeChallenges.filter(
      item => item.challenges.type === challengeType
    );

    for (const { user_challenges: uc, challenges: c } of filteredChallenges) {
      const newProgress = Math.min(uc.currentProgress + increment, c.targetCount);
      
      await db.update(userChallenges)
        .set({ currentProgress: newProgress })
        .where(eq(userChallenges.id, uc.id));
    }
  } catch (error) {
    console.error("Error updating challenge progress:", error);
  }
}

// Calculate tier based on total points
function calculateTier(totalPoints: number): string {
  if (totalPoints >= 10000) return "platinum";
  if (totalPoints >= 5000) return "gold";
  if (totalPoints >= 1000) return "silver";
  return "bronze";
}

// Process rewards after session completion
export async function processSessionCompletionRewards(
  learnerId: number,
  userId: number,
  isFirstSession: boolean = false
): Promise<void> {
  // Award points
  await awardPoints(
    learnerId,
    POINT_VALUES.SESSION_COMPLETED,
    "earned_session",
    "Completed a coaching session"
  );

  // Bonus for first session
  if (isFirstSession) {
    await awardPoints(
      learnerId,
      POINT_VALUES.FIRST_SESSION,
      "earned_milestone",
      "Completed your first session!"
    );
  }

  // Check for badge milestones
  await checkSessionMilestones(learnerId);

  // Update challenge progress
  await updateChallengeProgress(userId, "sessions", 1);
}

// Process rewards after review submission
export async function processReviewRewards(
  learnerId: number,
  userId: number
): Promise<void> {
  // Award points
  await awardPoints(
    learnerId,
    POINT_VALUES.REVIEW_SUBMITTED,
    "earned_review",
    "Submitted a coach review"
  );

  // Check for badge milestones
  await checkReviewMilestones(learnerId, userId);

  // Update challenge progress
  await updateChallengeProgress(userId, "reviews", 1);
}

// Process rewards after referral signup
export async function processReferralRewards(
  referrerLearnerId: number,
  isFirstSession: boolean = false
): Promise<void> {
  // Award points for signup
  await awardPoints(
    referrerLearnerId,
    POINT_VALUES.REFERRAL_SIGNUP,
    "earned_referral",
    "Friend signed up using your referral link"
  );

  // Bonus if referred user completed first session
  if (isFirstSession) {
    await awardPoints(
      referrerLearnerId,
      POINT_VALUES.REFERRAL_FIRST_SESSION,
      "earned_referral",
      "Referred friend completed their first session"
    );
  }
}

// Process rewards after AI practice session
export async function processAIPracticeRewards(
  learnerId: number,
  userId: number
): Promise<void> {
  // Award points
  await awardPoints(
    learnerId,
    POINT_VALUES.AI_PRACTICE_SESSION,
    "earned_practice",
    "Completed an AI practice session"
  );

  // Check for badge milestones
  await checkAIPracticeMilestones(learnerId);
}
