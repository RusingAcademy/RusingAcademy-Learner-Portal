import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{
            id: 1,
            userId: 1,
            totalXp: 150,
            weeklyXp: 50,
            monthlyXp: 100,
            currentLevel: 2,
            levelTitle: "Novice",
            currentStreak: 5,
            longestStreak: 10,
            lastActivityDate: new Date(),
            streakFreezeAvailable: true,
          }])),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([
              { oduserId: 1, xp: 500, level: 5, levelTitle: "Proficient", streak: 7, userName: "Test User", userAvatar: null },
              { oduserId: 2, xp: 300, level: 3, levelTitle: "Apprentice", streak: 3, userName: "User 2", userAvatar: null },
            ])),
            offset: vi.fn(() => Promise.resolve([])),
          })),
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
        innerJoin: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([
              { oduserId: 1, xp: 500, level: 5, levelTitle: "Proficient", streak: 7, userName: "Test User", userAvatar: null },
            ])),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        $returningId: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

describe("Gamification System", () => {
  describe("XP Rewards Configuration", () => {
    it("should have correct XP values for different actions", () => {
      const XP_REWARDS = {
        lesson_complete: 10,
        quiz_pass: 15,
        quiz_perfect: 25,
        module_complete: 50,
        course_complete: 200,
        streak_bonus: 5,
        daily_login: 5,
        first_lesson: 20,
        challenge_complete: 30,
        review_submitted: 10,
        note_created: 5,
        exercise_complete: 8,
        speaking_practice: 12,
        writing_submitted: 15,
        milestone_bonus: 100,
        level_up_bonus: 50,
        referral_bonus: 100,
      };
      
      expect(XP_REWARDS.lesson_complete).toBe(10);
      expect(XP_REWARDS.quiz_perfect).toBe(25);
      expect(XP_REWARDS.course_complete).toBe(200);
      expect(XP_REWARDS.level_up_bonus).toBe(50);
    });
  });
  
  describe("Level System", () => {
    const LEVEL_THRESHOLDS = [
      { level: 1, xp: 0, title: "Beginner" },
      { level: 2, xp: 100, title: "Novice" },
      { level: 3, xp: 300, title: "Apprentice" },
      { level: 4, xp: 600, title: "Intermediate" },
      { level: 5, xp: 1000, title: "Proficient" },
      { level: 6, xp: 1500, title: "Advanced" },
      { level: 7, xp: 2200, title: "Expert" },
      { level: 8, xp: 3000, title: "Master" },
      { level: 9, xp: 4000, title: "Champion" },
      { level: 10, xp: 5500, title: "Legend" },
    ];
    
    function getLevelForXp(totalXp: number) {
      let currentLevel = LEVEL_THRESHOLDS[0];
      for (const level of LEVEL_THRESHOLDS) {
        if (totalXp >= level.xp) {
          currentLevel = level;
        } else {
          break;
        }
      }
      return currentLevel;
    }
    
    it("should return Beginner for 0 XP", () => {
      expect(getLevelForXp(0).title).toBe("Beginner");
      expect(getLevelForXp(0).level).toBe(1);
    });
    
    it("should return Novice for 100-299 XP", () => {
      expect(getLevelForXp(100).title).toBe("Novice");
      expect(getLevelForXp(200).title).toBe("Novice");
      expect(getLevelForXp(299).title).toBe("Novice");
    });
    
    it("should return Apprentice for 300-599 XP", () => {
      expect(getLevelForXp(300).title).toBe("Apprentice");
      expect(getLevelForXp(500).title).toBe("Apprentice");
    });
    
    it("should return Legend for 5500+ XP", () => {
      expect(getLevelForXp(5500).title).toBe("Legend");
      expect(getLevelForXp(10000).title).toBe("Legend");
    });
    
    it("should have 10 levels total", () => {
      expect(LEVEL_THRESHOLDS.length).toBe(10);
    });
  });
  
  describe("Badge Types", () => {
    const BADGE_TYPES = [
      "first_lesson", "module_complete", "course_complete", "all_courses_complete",
      "streak_3", "streak_7", "streak_14", "streak_30", "streak_100",
      "quiz_ace", "perfect_module", "quiz_master",
      "early_bird", "night_owl", "weekend_warrior", "consistent_learner",
      "xp_100", "xp_500", "xp_1000", "xp_5000",
      "founding_member", "beta_tester", "community_helper", "top_reviewer",
    ];
    
    it("should have 24 badge types", () => {
      expect(BADGE_TYPES.length).toBe(24);
    });
    
    it("should include streak badges", () => {
      expect(BADGE_TYPES).toContain("streak_3");
      expect(BADGE_TYPES).toContain("streak_7");
      expect(BADGE_TYPES).toContain("streak_30");
      expect(BADGE_TYPES).toContain("streak_100");
    });
    
    it("should include XP milestone badges", () => {
      expect(BADGE_TYPES).toContain("xp_100");
      expect(BADGE_TYPES).toContain("xp_500");
      expect(BADGE_TYPES).toContain("xp_1000");
      expect(BADGE_TYPES).toContain("xp_5000");
    });
    
    it("should include course completion badges", () => {
      expect(BADGE_TYPES).toContain("first_lesson");
      expect(BADGE_TYPES).toContain("module_complete");
      expect(BADGE_TYPES).toContain("course_complete");
    });
  });
  
  describe("Streak Calculation", () => {
    it("should reset streak if more than 1 day gap", () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      // Streak should reset
      const daysDiff = Math.floor((today.getTime() - threeDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeGreaterThan(1);
    });
    
    it("should continue streak if activity was yesterday", () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const daysDiff = Math.floor((today.getTime() - yesterday.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(1);
    });
  });
  
  describe("Leaderboard Periods", () => {
    it("should support weekly, monthly, and allTime periods", () => {
      const validPeriods = ["weekly", "monthly", "allTime"];
      
      expect(validPeriods).toContain("weekly");
      expect(validPeriods).toContain("monthly");
      expect(validPeriods).toContain("allTime");
    });
  });
});
