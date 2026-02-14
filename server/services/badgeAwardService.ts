/**
 * Badge Award Service — Auto-trigger engine
 * 
 * Called after every completeActivity cascade to check if the user
 * has earned any new badges. Uses the BADGE_DEFINITIONS trigger
 * conditions to determine eligibility.
 */

import { getDb } from "../db";
import {
  learnerBadges,
  learnerXp,
  xpTransactions,
  activityProgress,
  lessonProgress,
  courseEnrollments,
  activities,
  inAppNotifications,
} from "../../drizzle/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { BADGE_DEFINITIONS, ALL_BADGES, type BadgeDefinition, type BadgeTrigger } from "../data/badgeDefinitions";
import { sendBadgeUnlockNotification } from "./gamificationNotifications";

// ─── Context passed to the trigger engine after each action ───────────────────
export interface BadgeCheckContext {
  userId: number;
  userName?: string;
  // What just happened
  action: "slot_completed" | "lesson_completed" | "module_completed" | "course_completed" | "quiz_completed" | "streak_updated" | "xp_earned";
  // Optional details
  courseId?: number;
  moduleId?: number;
  lessonId?: number;
  activityId?: number;
  quizScore?: number;
  streakDays?: number;
  totalXp?: number;
}

// ─── Result of a badge check ──────────────────────────────────────────────────
export interface BadgeAwardResult {
  awarded: BadgeDefinition[];
  alreadyOwned: string[];
  errors: string[];
}

/**
 * Main entry point: check all badge triggers for a user after an action.
 * Returns list of newly awarded badges.
 */
export async function checkAndAwardBadges(ctx: BadgeCheckContext): Promise<BadgeAwardResult> {
  const result: BadgeAwardResult = { awarded: [], alreadyOwned: [], errors: [] };
  
  const db = await getDb();
  if (!db) return result;

  try {
    // Get user's existing badges
    const existingBadges = await db
      .select({ badgeType: learnerBadges.badgeType })
      .from(learnerBadges)
      .where(eq(learnerBadges.userId, ctx.userId));
    
    const ownedSet = new Set<string>(existingBadges.map((b) => b.badgeType));

    // Get user stats for trigger evaluation
    const stats = await getUserStats(ctx.userId);

    // Check each badge definition (use ALL_BADGES to include path completion badges)
    for (const badge of ALL_BADGES) {
      if (ownedSet.has(badge.id)) {
        result.alreadyOwned.push(badge.id);
        continue;
      }

      const earned = await evaluateTrigger(badge.trigger, stats, ctx);
      if (earned) {
        try {
          await awardBadge(ctx.userId, badge, ctx.courseId, ctx.moduleId);
          result.awarded.push(badge);
        } catch (err) {
          result.errors.push(`Failed to award ${badge.id}: ${err}`);
        }
      }
    }
  } catch (err) {
    result.errors.push(`Badge check failed: ${err}`);
  }

  return result;
}

// ─── User Stats Aggregation ───────────────────────────────────────────────────

interface UserStats {
  slotsCompleted: number;
  lessonsCompleted: number;
  modulesCompleted: number;
  coursesCompleted: number;
  videosWatched: number;
  quizzesPassed90: number;
  quizzesPerfect: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
}

async function getUserStats(userId: number): Promise<UserStats> {
  const db = await getDb();
  if (!db) {
    return {
      slotsCompleted: 0, lessonsCompleted: 0, modulesCompleted: 0,
      coursesCompleted: 0, videosWatched: 0, quizzesPassed90: 0,
      quizzesPerfect: 0, currentStreak: 0, longestStreak: 0, totalXp: 0,
    };
  }

  // Slots completed
  const [slotsResult] = await db
    .select({ count: count() })
    .from(activityProgress)
    .where(and(eq(activityProgress.userId, userId), eq(activityProgress.status, "completed")));

  // Lessons completed
  const [lessonsResult] = await db
    .select({ count: count() })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed")));

  // Courses completed (modules are tracked via enrollment progress)
  const [coursesResult] = await db
    .select({ count: count() })
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.status, "completed")));

  // Videos watched (activities with slotType 'video' that are completed)
  const [videosResult] = await db
    .select({ count: count() })
    .from(activityProgress)
    .innerJoin(activities, eq(activities.id, activityProgress.activityId))
    .where(
      and(
        eq(activityProgress.userId, userId),
        eq(activityProgress.status, "completed"),
        eq(activities.slotType, "video_scenario")
      )
    );

  // Quizzes with 90%+ score
  const [quizzes90Result] = await db
    .select({ count: count() })
    .from(activityProgress)
    .innerJoin(activities, eq(activities.id, activityProgress.activityId))
    .where(
      and(
        eq(activityProgress.userId, userId),
        eq(activityProgress.status, "completed"),
        eq(activities.slotType, "quiz_slot"),
        sql`${activityProgress.score} >= 90`
      )
    );

  // Perfect quizzes (100%)
  const [quizzesPerfectResult] = await db
    .select({ count: count() })
    .from(activityProgress)
    .innerJoin(activities, eq(activities.id, activityProgress.activityId))
    .where(
      and(
        eq(activityProgress.userId, userId),
        eq(activityProgress.status, "completed"),
        eq(activities.slotType, "quiz_slot"),
        sql`${activityProgress.score} = 100`
      )
    );

  // XP and streak
  const [xpResult] = await db
    .select({
      totalXp: learnerXp.totalXp,
      currentStreak: learnerXp.currentStreak,
      longestStreak: learnerXp.longestStreak,
    })
    .from(learnerXp)
    .where(eq(learnerXp.userId, userId))
    .limit(1);

  // Modules completed — count distinct moduleIds where all lessons in that module are completed
  // We approximate by counting enrollments that are 100% (each enrollment = 1 course, but modules are sub-units)
  // For now, use lessons completed / 4 (4 lessons per module in Path I) as a rough proxy
  const modulesCompleted = Math.floor((lessonsResult?.count || 0) / 4);

  return {
    slotsCompleted: slotsResult?.count || 0,
    lessonsCompleted: lessonsResult?.count || 0,
    modulesCompleted,
    coursesCompleted: coursesResult?.count || 0,
    videosWatched: videosResult?.count || 0,
    quizzesPassed90: quizzes90Result?.count || 0,
    quizzesPerfect: quizzesPerfectResult?.count || 0,
    currentStreak: xpResult?.currentStreak || 0,
    longestStreak: xpResult?.longestStreak || 0,
    totalXp: xpResult?.totalXp || 0,
  };
}

// ─── Fast Completion Check ───────────────────────────────────────────────────

async function checkFastCompletion(userId: number, courseId: number | undefined, days: number): Promise<boolean> {
  if (!courseId) return false;
  const db = await getDb();
  if (!db) return false;

  try {
    const [enrollment] = await db
      .select({ enrolledAt: courseEnrollments.enrolledAt })
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
      .limit(1);

    if (!enrollment?.enrolledAt) return false;

    const enrollDate = new Date(enrollment.enrolledAt);
    const now = new Date();
    const diffMs = now.getTime() - enrollDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  } catch {
    return false;
  }
}

// ─── Trigger Evaluation ───────────────────────────────────────────────────────

async function evaluateTrigger(
  trigger: BadgeTrigger,
  stats: UserStats,
  ctx: BadgeCheckContext
): Promise<boolean> {
  switch (trigger.type) {
    case "first_activity":
      return stats.slotsCompleted >= 1;

    case "slots_completed":
      return stats.slotsCompleted >= trigger.count;

    case "lessons_completed":
      return stats.lessonsCompleted >= trigger.count;

    case "modules_completed":
      return stats.modulesCompleted >= trigger.count;

    case "paths_completed":
      return stats.coursesCompleted >= trigger.count;

    case "videos_watched":
      return stats.videosWatched >= trigger.count;

    case "quiz_score_90":
      return stats.quizzesPassed90 >= trigger.count;

    case "quiz_perfect":
      return stats.quizzesPerfect >= trigger.count;

    case "streak_days":
      return stats.currentStreak >= trigger.count || stats.longestStreak >= trigger.count;

    case "xp_earned":
      return stats.totalXp >= trigger.count;

    case "course_complete":
      return ctx.action === "course_completed";

    case "sle_level":
      // SLE badges are awarded based on course completion milestones:
      // A = 1 course, B = 3 courses, C = 5 courses
      if (trigger.level === "A") return stats.coursesCompleted >= 1;
      if (trigger.level === "B") return stats.coursesCompleted >= 3;
      if (trigger.level === "C") return stats.coursesCompleted >= 5;
      return false;

    case "all_slots_lesson":
      // Awarded when a lesson has all 7 slots completed
      return ctx.action === "lesson_completed";

    case "path_completed":
      // Awarded when a specific path/course is completed
      if (ctx.action !== "course_completed") return false;
      return ctx.courseId === trigger.pathId;

    case "all_paths_completed":
      // Awarded when all 6 paths are completed
      return stats.coursesCompleted >= trigger.count;

    case "path_completed_fast":
      // Awarded when any path is completed within N days — requires enrollment date check
      // For now, trigger on course_completed; the enrollment date check happens in awardBadge
      if (ctx.action !== "course_completed") return false;
      return await checkFastCompletion(ctx.userId, ctx.courseId, trigger.days);

    case "founding_member":
    case "beta_tester":
      // These are manually awarded, not auto-triggered
      return false;

    default:
      return false;
  }
}

// ─── Badge Award Logic ────────────────────────────────────────────────────────

async function awardBadge(
  userId: number,
  badge: BadgeDefinition,
  courseId?: number,
  moduleId?: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Insert the badge
  await db.insert(learnerBadges).values({
    userId,
    badgeType: badge.id as any,
    title: badge.name,
    titleFr: badge.nameFr,
    description: badge.description,
    descriptionFr: badge.descriptionFr,
    iconUrl: `/badges/${badge.iconKey}.svg`,
    courseId: courseId || null,
    moduleId: moduleId || null,
    metadata: {
      category: badge.category,
      tier: badge.tier,
      xpReward: badge.xpReward,
      gradientFrom: badge.gradientFrom,
      gradientTo: badge.gradientTo,
    },
    isNew: true,
  });

  // Award XP for the badge
  await awardBadgeXp(userId, badge);

  // Create in-app notification
  await db.insert(inAppNotifications).values({
    userId,
    type: "challenge",
    title: `🏆 Badge Earned: ${badge.name}!`,
    titleFr: `🏆 Badge obtenu: ${badge.nameFr}!`,
    message: badge.description,
    messageFr: badge.descriptionFr,
    linkType: "challenge",
    isRead: false,
  });

  // Send push notification
  sendBadgeUnlockNotification({
    userId,
    badgeTitle: badge.name,
    badgeTitleFr: badge.nameFr,
    badgeDescription: badge.description,
    badgeDescriptionFr: badge.descriptionFr,
    xpAwarded: badge.xpReward,
  }).catch(() => {
    // Non-critical, don't fail badge award
  });
}

async function awardBadgeXp(userId: number, badge: BadgeDefinition): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Record XP transaction
  await db.insert(xpTransactions).values({
    userId,
    amount: badge.xpReward,
    reason: "milestone_bonus" as any,
    description: `Badge earned: ${badge.name} (+${badge.xpReward} XP)`,
    referenceType: "badge",
  });

  // Update total XP
  const [existing] = await db
    .select()
    .from(learnerXp)
    .where(eq(learnerXp.userId, userId))
    .limit(1);

  if (existing) {
    const newTotal = (existing.totalXp || 0) + badge.xpReward;
    await db
      .update(learnerXp)
      .set({
        totalXp: newTotal,
        weeklyXp: (existing.weeklyXp || 0) + badge.xpReward,
        monthlyXp: (existing.monthlyXp || 0) + badge.xpReward,
      })
      .where(eq(learnerXp.userId, userId));
  } else {
    await db.insert(learnerXp).values({
      userId,
      totalXp: badge.xpReward,
      weeklyXp: badge.xpReward,
      monthlyXp: badge.xpReward,
      currentLevel: 1,
      levelTitle: "Beginner",
      currentStreak: 0,
      longestStreak: 0,
    });
  }
}

// ─── Public Helper: Get badge progress for showcase ───────────────────────────

export interface BadgeProgress {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: Date;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
}

export async function getBadgeProgressForUser(userId: number): Promise<BadgeProgress[]> {
  const db = await getDb();
  if (!db) return [];

  const stats = await getUserStats(userId);
  const existingBadges = await db
    .select()
    .from(learnerBadges)
    .where(eq(learnerBadges.userId, userId));

  const earnedMap = new Map<string, Date | null>(existingBadges.map((b) => [b.badgeType, b.awardedAt]));

  return ALL_BADGES.map((badge) => {
    const earned = earnedMap.has(badge.id);
    const earnedAt = earnedMap.get(badge.id) || undefined;
    const { current, target } = getTriggerProgress(badge.trigger, stats);
    const progressPercent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : (earned ? 100 : 0);

    return {
      badge,
      earned,
      earnedAt: earnedAt ? new Date(earnedAt) : undefined,
      currentValue: current,
      targetValue: target,
      progressPercent: earned ? 100 : progressPercent,
    };
  });
}

function getTriggerProgress(trigger: BadgeTrigger, stats: UserStats): { current: number; target: number } {
  switch (trigger.type) {
    case "first_activity":
      return { current: Math.min(stats.slotsCompleted, 1), target: 1 };
    case "slots_completed":
      return { current: stats.slotsCompleted, target: trigger.count };
    case "lessons_completed":
      return { current: stats.lessonsCompleted, target: trigger.count };
    case "modules_completed":
      return { current: stats.modulesCompleted, target: trigger.count };
    case "paths_completed":
      return { current: stats.coursesCompleted, target: trigger.count };
    case "videos_watched":
      return { current: stats.videosWatched, target: trigger.count };
    case "quiz_score_90":
      return { current: stats.quizzesPassed90, target: trigger.count };
    case "quiz_perfect":
      return { current: stats.quizzesPerfect, target: trigger.count };
    case "streak_days":
      return { current: Math.max(stats.currentStreak, stats.longestStreak), target: trigger.count };
    case "xp_earned":
      return { current: stats.totalXp, target: trigger.count };
    case "sle_level":
      if (trigger.level === "A") return { current: stats.coursesCompleted, target: 1 };
      if (trigger.level === "B") return { current: stats.coursesCompleted, target: 3 };
      if (trigger.level === "C") return { current: stats.coursesCompleted, target: 5 };
      return { current: 0, target: 1 };
    case "course_complete":
    case "all_slots_lesson":
      return { current: stats.coursesCompleted, target: 1 };
    case "path_completed":
      // For progress, check if this specific course is completed
      return { current: stats.coursesCompleted > 0 ? 1 : 0, target: 1 };
    case "all_paths_completed":
      return { current: stats.coursesCompleted, target: trigger.count };
    case "path_completed_fast":
      return { current: 0, target: 1 }; // Binary: either fast or not
    case "founding_member":
    case "beta_tester":
      return { current: 0, target: 1 };
    default:
      return { current: 0, target: 1 };
  }
}
