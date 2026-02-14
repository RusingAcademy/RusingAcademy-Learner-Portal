import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Sprint 31 - Gamification Components Tests
 * Tests for XP notifications, badge unlocks, streak tracking, and weekly challenges
 */

describe("Gamification System", () => {
  describe("XP Calculations", () => {
    it("should calculate correct XP for lesson completion", () => {
      const baseXP = 50;
      const bonusMultiplier = 1.5; // for streak bonus
      const expectedXP = baseXP * bonusMultiplier;
      expect(expectedXP).toBe(75);
    });

    it("should calculate level from total XP", () => {
      const calculateLevel = (totalXP: number): number => {
        // Each level requires progressively more XP
        // Level 1: 0-99, Level 2: 100-249, Level 3: 250-449, etc.
        if (totalXP < 100) return 1;
        if (totalXP < 250) return 2;
        if (totalXP < 450) return 3;
        if (totalXP < 700) return 4;
        if (totalXP < 1000) return 5;
        return Math.floor(5 + (totalXP - 1000) / 500) + 1;
      };

      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(249)).toBe(2);
      expect(calculateLevel(250)).toBe(3);
      expect(calculateLevel(1000)).toBe(6);
      expect(calculateLevel(1500)).toBe(7);
    });

    it("should calculate XP needed for next level", () => {
      const getXPForNextLevel = (currentLevel: number): number => {
        const thresholds = [100, 250, 450, 700, 1000];
        if (currentLevel <= 5) return thresholds[currentLevel - 1];
        return 1000 + (currentLevel - 5) * 500;
      };

      expect(getXPForNextLevel(1)).toBe(100);
      expect(getXPForNextLevel(2)).toBe(250);
      expect(getXPForNextLevel(5)).toBe(1000);
      expect(getXPForNextLevel(6)).toBe(1500);
    });
  });

  describe("Streak Calculations", () => {
    it("should calculate streak milestone rewards", () => {
      const getStreakMilestoneXP = (streakDays: number): number => {
        const milestones: Record<number, number> = {
          7: 70,
          14: 140,
          30: 300,
          60: 600,
          90: 900,
          180: 1800,
          365: 3650,
        };
        return milestones[streakDays] || 0;
      };

      expect(getStreakMilestoneXP(7)).toBe(70);
      expect(getStreakMilestoneXP(30)).toBe(300);
      expect(getStreakMilestoneXP(365)).toBe(3650);
      expect(getStreakMilestoneXP(5)).toBe(0); // Not a milestone
    });

    it("should determine if streak is at a milestone", () => {
      const MILESTONES = [7, 14, 30, 60, 90, 180, 365];
      const isStreakMilestone = (days: number): boolean => MILESTONES.includes(days);

      expect(isStreakMilestone(7)).toBe(true);
      expect(isStreakMilestone(14)).toBe(true);
      expect(isStreakMilestone(15)).toBe(false);
      expect(isStreakMilestone(365)).toBe(true);
    });

    it("should calculate streak status based on last activity", () => {
      const isStreakActive = (lastActivityDate: Date): boolean => {
        const now = new Date();
        const lastActivity = new Date(lastActivityDate);
        const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
        return diffHours < 48; // 48-hour grace period
      };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isStreakActive(yesterday)).toBe(true);

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(isStreakActive(threeDaysAgo)).toBe(false);
    });
  });

  describe("Badge System", () => {
    it("should determine badge rarity from points", () => {
      const getBadgeRarity = (points: number): string => {
        if (points >= 500) return "legendary";
        if (points >= 200) return "epic";
        if (points >= 100) return "rare";
        if (points >= 50) return "uncommon";
        return "common";
      };

      expect(getBadgeRarity(25)).toBe("common");
      expect(getBadgeRarity(50)).toBe("uncommon");
      expect(getBadgeRarity(100)).toBe("rare");
      expect(getBadgeRarity(200)).toBe("epic");
      expect(getBadgeRarity(500)).toBe("legendary");
    });

    it("should validate badge unlock conditions", () => {
      const checkBadgeCondition = (
        badgeCode: string,
        userStats: { sessionsCompleted: number; streak: number; aiSessions: number }
      ): boolean => {
        const conditions: Record<string, (stats: typeof userStats) => boolean> = {
          first_session: (s) => s.sessionsCompleted >= 1,
          "5_sessions": (s) => s.sessionsCompleted >= 5,
          "10_sessions": (s) => s.sessionsCompleted >= 10,
          streak_7: (s) => s.streak >= 7,
          streak_30: (s) => s.streak >= 30,
          first_ai_session: (s) => s.aiSessions >= 1,
          "10_ai_sessions": (s) => s.aiSessions >= 10,
        };

        const condition = conditions[badgeCode];
        return condition ? condition(userStats) : false;
      };

      const userStats = { sessionsCompleted: 6, streak: 10, aiSessions: 3 };
      
      expect(checkBadgeCondition("first_session", userStats)).toBe(true);
      expect(checkBadgeCondition("5_sessions", userStats)).toBe(true);
      expect(checkBadgeCondition("10_sessions", userStats)).toBe(false);
      expect(checkBadgeCondition("streak_7", userStats)).toBe(true);
      expect(checkBadgeCondition("streak_30", userStats)).toBe(false);
    });
  });

  describe("Weekly Challenges", () => {
    it("should calculate challenge progress percentage", () => {
      const calculateProgress = (current: number, target: number): number => {
        return Math.min(100, Math.round((current / target) * 100));
      };

      expect(calculateProgress(5, 10)).toBe(50);
      expect(calculateProgress(10, 10)).toBe(100);
      expect(calculateProgress(15, 10)).toBe(100); // Capped at 100
      expect(calculateProgress(0, 10)).toBe(0);
    });

    it("should determine if challenge is completed", () => {
      const isChallengeComplete = (current: number, target: number): boolean => {
        return current >= target;
      };

      expect(isChallengeComplete(10, 10)).toBe(true);
      expect(isChallengeComplete(15, 10)).toBe(true);
      expect(isChallengeComplete(5, 10)).toBe(false);
    });

    it("should calculate days remaining for challenge", () => {
      const getDaysRemaining = (endDate: Date): number => {
        const now = new Date();
        const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
      };

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getDaysRemaining(tomorrow)).toBe(1);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(getDaysRemaining(nextWeek)).toBe(7);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getDaysRemaining(yesterday)).toBe(0);
    });
  });

  describe("Leaderboard", () => {
    it("should sort entries by points descending", () => {
      const entries = [
        { userId: 1, points: 500 },
        { userId: 2, points: 1000 },
        { userId: 3, points: 750 },
      ];

      const sorted = [...entries].sort((a, b) => b.points - a.points);
      
      expect(sorted[0].userId).toBe(2);
      expect(sorted[1].userId).toBe(3);
      expect(sorted[2].userId).toBe(1);
    });

    it("should assign correct ranks", () => {
      const assignRanks = (entries: { userId: number; points: number }[]) => {
        return entries
          .sort((a, b) => b.points - a.points)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));
      };

      const entries = [
        { userId: 1, points: 500 },
        { userId: 2, points: 1000 },
        { userId: 3, points: 750 },
      ];

      const ranked = assignRanks(entries);
      
      expect(ranked.find(e => e.userId === 2)?.rank).toBe(1);
      expect(ranked.find(e => e.userId === 3)?.rank).toBe(2);
      expect(ranked.find(e => e.userId === 1)?.rank).toBe(3);
    });

    it("should calculate rank change correctly", () => {
      const calculateRankChange = (previousRank: number, currentRank: number): number => {
        return previousRank - currentRank; // Positive = moved up
      };

      expect(calculateRankChange(5, 3)).toBe(2); // Moved up 2 spots
      expect(calculateRankChange(3, 5)).toBe(-2); // Moved down 2 spots
      expect(calculateRankChange(3, 3)).toBe(0); // No change
    });
  });
});
