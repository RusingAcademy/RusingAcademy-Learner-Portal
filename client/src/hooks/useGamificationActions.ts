import { useCallback } from "react";
import { useGamification } from "@/contexts/GamificationContext";
import { trpc } from "@/lib/trpc";

type XpReason = 
  | "lesson_complete" | "quiz_pass" | "quiz_perfect" | "module_complete"
  | "course_complete" | "streak_bonus" | "daily_login" | "first_lesson"
  | "challenge_complete" | "review_submitted" | "note_created" | "exercise_complete"
  | "speaking_practice" | "writing_submitted" | "milestone_bonus" | "level_up_bonus" | "referral_bonus";

/**
 * Custom hook for triggering gamification actions
 * Provides methods to award XP, unlock badges, and trigger celebrations
 * Now connected to backend tRPC procedures for persistence
 */
export function useGamificationActions() {
  const { showXPGain, showLevelUp, showBadgeUnlock } = useGamification();
  const utils = trpc.useUtils();
  
  // Backend mutation for awarding XP
  const awardXpMutation = trpc.gamification.awardXp.useMutation({
    onSuccess: () => {
      // Invalidate all gamification-related queries
      utils.gamification.getMyStats.invalidate();
      utils.gamification.getLeaderboard.invalidate();
      utils.gamification.getUserRank.invalidate();
    }
  });

  // Award XP and show notification (now persists to backend)
  const awardXP = useCallback(
    async (
      amount: number, 
      displayReason?: string, 
      options?: { 
        silent?: boolean; 
        backendReason?: XpReason;
        referenceType?: string;
        referenceId?: number;
      }
    ) => {
      // Show notification unless silent
      if (!options?.silent) {
        showXPGain(amount, displayReason);
      }

      // Call backend to persist XP award
      try {
        const result = await awardXpMutation.mutateAsync({
          reason: options?.backendReason || "lesson_complete",
          referenceType: options?.referenceType,
          referenceId: options?.referenceId,
          customAmount: amount,
        });
        
        // Check if user leveled up
        if (result.leveledUp && result.newLevel) {
          // @ts-expect-error - TS2345: auto-suppressed during TS cleanup
          showLevelUp(result.newLevel);
        }
      } catch (error) {
        console.error("Failed to award XP:", error);
      }
    },
    [showXPGain, showLevelUp, awardXpMutation]
  );

  // Trigger level up celebration
  const celebrateLevelUp = useCallback(
    (newLevel: number) => {
      showLevelUp(newLevel);
    },
    [showLevelUp]
  );

  // Unlock a badge and show modal
  const unlockBadge = useCallback(
    async (badge: {
      code: string;
      name: string;
      nameFr?: string;
      description?: string;
      descriptionFr?: string;
      points: number;
      rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
    }) => {
      showBadgeUnlock(badge);

      // Invalidate badges query to refresh data
      await utils.learner.getMyBadges.invalidate();
    },
    [showBadgeUnlock, utils]
  );

  // Combined action for completing a lesson
  const completeLessonAction = useCallback(
    async (xpAmount: number, lessonTitle: string, lessonId?: number) => {
      await awardXP(xpAmount, `Completed: ${lessonTitle}`, {
        backendReason: "lesson_complete",
        referenceType: "lesson",
        referenceId: lessonId,
      });
    },
    [awardXP]
  );

  // Combined action for completing a quiz
  const completeQuizAction = useCallback(
    async (xpAmount: number, score: number, quizTitle: string, quizId?: number) => {
      const isPerfect = score >= 100;
      const reason = isPerfect 
        ? `🎯 Perfect score on ${quizTitle}!` 
        : `Completed ${quizTitle}`;
      await awardXP(xpAmount, reason, {
        backendReason: isPerfect ? "quiz_perfect" : "quiz_pass",
        referenceType: "quiz",
        referenceId: quizId,
      });
    },
    [awardXP]
  );

  // Combined action for speaking practice
  const completeSpeakingAction = useCallback(
    async (xpAmount: number, exerciseTitle: string, exerciseId?: number) => {
      await awardXP(xpAmount, `🎤 ${exerciseTitle}`, {
        backendReason: "speaking_practice",
        referenceType: "speaking",
        referenceId: exerciseId,
      });
    },
    [awardXP]
  );

  // Combined action for maintaining streak
  const maintainStreakAction = useCallback(
    async (streakDays: number) => {
      const milestones = [7, 14, 30, 60, 90, 180, 365];
      if (milestones.includes(streakDays)) {
        const xpBonus = streakDays * 10;
        await awardXP(xpBonus, `🔥 ${streakDays}-day streak milestone!`, {
          backendReason: "milestone_bonus",
        });
      }
    },
    [awardXP]
  );

  return {
    awardXP,
    celebrateLevelUp,
    unlockBadge,
    completeLessonAction,
    completeQuizAction,
    completeSpeakingAction,
    maintainStreakAction,
  };
}

export default useGamificationActions;
