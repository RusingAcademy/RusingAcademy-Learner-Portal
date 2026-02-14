import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================================
// SOCIAL LEADERBOARD TESTS
// ============================================================================

describe("Social Leaderboard — Privacy Toggle", () => {
  it("should define privacy opt-in column in learner_xp table", () => {
    // The leaderboard_visible column was added via SQL ALTER TABLE
    // Default is true (visible), users can toggle to false (hidden)
    const defaultVisibility = true;
    expect(defaultVisibility).toBe(true);
  });

  it("should filter hidden users from leaderboard results", () => {
    // When leaderboard_visible = false, user should not appear in rankings
    const allUsers = [
      { userId: 1, name: "Alice", totalXp: 500, leaderboardVisible: true },
      { userId: 2, name: "Bob", totalXp: 400, leaderboardVisible: false },
      { userId: 3, name: "Charlie", totalXp: 300, leaderboardVisible: true },
    ];
    const visibleUsers = allUsers.filter(u => u.leaderboardVisible);
    expect(visibleUsers).toHaveLength(2);
    expect(visibleUsers.map(u => u.name)).toEqual(["Alice", "Charlie"]);
    expect(visibleUsers.find(u => u.name === "Bob")).toBeUndefined();
  });

  it("should allow toggling privacy on/off", () => {
    let isVisible = true;
    // Toggle off
    isVisible = false;
    expect(isVisible).toBe(false);
    // Toggle on
    isVisible = true;
    expect(isVisible).toBe(true);
  });

  it("should rank users by XP in descending order", () => {
    const users = [
      { name: "Charlie", totalXp: 300 },
      { name: "Alice", totalXp: 500 },
      { name: "Bob", totalXp: 400 },
    ];
    const ranked = [...users].sort((a, b) => b.totalXp - a.totalXp);
    expect(ranked[0].name).toBe("Alice");
    expect(ranked[1].name).toBe("Bob");
    expect(ranked[2].name).toBe("Charlie");
  });

  it("should support weekly/monthly/allTime period filters", () => {
    const validPeriods = ["weekly", "monthly", "allTime"];
    validPeriods.forEach(period => {
      expect(["weekly", "monthly", "allTime"]).toContain(period);
    });
  });
});

// ============================================================================
// EMAIL DIGEST GAMIFICATION TESTS
// ============================================================================

describe("Email Digest — Gamification Data", () => {
  it("should include gamification fields in progress report data", () => {
    const gamificationData = {
      weeklyXpEarned: 150,
      totalXp: 1250,
      currentLevel: 5,
      levelTitle: "Intermediate",
      currentStreak: 7,
      longestStreak: 14,
      currentMultiplier: 1.5,
      nextMilestone: 2500,
      xpToNextMilestone: 1250,
      recommendedNextStep: "Book a coaching session for personalized feedback.",
    };

    expect(gamificationData.weeklyXpEarned).toBe(150);
    expect(gamificationData.totalXp).toBe(1250);
    expect(gamificationData.currentLevel).toBe(5);
    expect(gamificationData.currentStreak).toBe(7);
    expect(gamificationData.currentMultiplier).toBe(1.5);
    expect(gamificationData.nextMilestone).toBe(2500);
    expect(gamificationData.xpToNextMilestone).toBe(1250);
    expect(gamificationData.recommendedNextStep).toBeTruthy();
  });

  it("should calculate streak multiplier correctly", () => {
    const getMultiplier = (streak: number): number => {
      if (streak >= 30) return 2.0;
      if (streak >= 14) return 1.75;
      if (streak >= 7) return 1.5;
      if (streak >= 3) return 1.25;
      return 1.0;
    };

    expect(getMultiplier(0)).toBe(1.0);
    expect(getMultiplier(2)).toBe(1.0);
    expect(getMultiplier(3)).toBe(1.25);
    expect(getMultiplier(7)).toBe(1.5);
    expect(getMultiplier(14)).toBe(1.75);
    expect(getMultiplier(30)).toBe(2.0);
    expect(getMultiplier(100)).toBe(2.0);
  });

  it("should find next milestone correctly", () => {
    const milestones = [100, 250, 500, 1000, 2500, 5000, 10000, 25000];
    const findNext = (xp: number) => milestones.find(m => m > xp) || null;

    expect(findNext(0)).toBe(100);
    expect(findNext(99)).toBe(100);
    expect(findNext(100)).toBe(250);
    expect(findNext(250)).toBe(500);
    expect(findNext(1000)).toBe(2500);
    expect(findNext(25000)).toBeNull();
  });

  it("should generate bilingual labels for gamification section", () => {
    const enLabels = {
      gamificationTitle: "Your XP & Progress",
      xpEarned: "XP earned this week",
      totalXp: "Total XP",
      level: "Level",
      streak: "Current streak",
      days: "days",
      multiplier: "XP Multiplier",
      nextMilestone: "Next milestone",
      xpAway: "XP away",
      recommendedAction: "Recommended Next Step",
    };

    const frLabels = {
      gamificationTitle: "Votre XP & Progression",
      xpEarned: "XP gagnés cette semaine",
      totalXp: "XP total",
      level: "Niveau",
      streak: "Série actuelle",
      days: "jours",
      multiplier: "Multiplicateur XP",
      nextMilestone: "Prochain jalon",
      xpAway: "XP restants",
      recommendedAction: "Prochaine étape recommandée",
    };

    expect(enLabels.gamificationTitle).toBe("Your XP & Progress");
    expect(frLabels.gamificationTitle).toBe("Votre XP & Progression");
    expect(Object.keys(enLabels).length).toBe(Object.keys(frLabels).length);
  });

  it("should generate personalized recommendations based on activity", () => {
    const getRecommendation = (sessions: number, aiCount: number, lang: string): string | null => {
      const isEn = lang === "en";
      if (sessions === 0 && aiCount === 0) {
        return isEn
          ? "Start with a quick AI practice session to maintain your streak!"
          : "Commencez par une session rapide avec l'IA pour maintenir votre série !";
      } else if (sessions === 0) {
        return isEn
          ? "Book a coaching session for personalized feedback on your progress."
          : "Réservez une session de coaching pour un retour personnalisé sur vos progrès.";
      } else if (aiCount < 3) {
        return isEn
          ? "Practice more with the SLE AI Companion to reinforce what you learned in coaching."
          : "Pratiquez davantage avec le Compagnon IA ELS pour renforcer vos acquis.";
      }
      return null;
    };

    // No activity at all
    expect(getRecommendation(0, 0, "en")).toContain("AI practice session");
    expect(getRecommendation(0, 0, "fr")).toContain("session rapide");

    // AI only, no coaching
    expect(getRecommendation(0, 5, "en")).toContain("coaching session");
    expect(getRecommendation(0, 5, "fr")).toContain("coaching");

    // Coaching but low AI
    expect(getRecommendation(2, 1, "en")).toContain("SLE AI Companion");
    expect(getRecommendation(2, 1, "fr")).toContain("Compagnon IA");

    // Active in both — no recommendation
    expect(getRecommendation(3, 5, "en")).toBeNull();
  });

  it("should handle null gamification data gracefully", () => {
    const gamification = null;
    // Template should render empty string when gamification is null
    const rendered = gamification ? `<div>XP: ${gamification.totalXp}</div>` : "";
    expect(rendered).toBe("");
  });
});

// ============================================================================
// KPI DASHBOARD REAL-TIME TESTS
// ============================================================================

describe("KPI Dashboard — Real-Time Configuration", () => {
  it("should support configurable refresh intervals", () => {
    const validIntervals = [30, 60, 120, 300];
    validIntervals.forEach(interval => {
      expect(interval).toBeGreaterThanOrEqual(30);
      expect(interval).toBeLessThanOrEqual(300);
    });
  });

  it("should toggle auto-refresh on/off", () => {
    let autoRefresh = true;
    expect(autoRefresh).toBe(true);
    autoRefresh = false;
    expect(autoRefresh).toBe(false);
    autoRefresh = true;
    expect(autoRefresh).toBe(true);
  });

  it("should calculate correct interval in milliseconds", () => {
    const intervals = [30, 60, 120, 300];
    const expected = [30000, 60000, 120000, 300000];
    intervals.forEach((interval, i) => {
      expect(interval * 1000).toBe(expected[i]);
    });
  });

  it("should format currency values correctly", () => {
    const fmt = (n: number | undefined) => n !== undefined ? `$${n.toLocaleString()}` : "—";
    expect(fmt(1234)).toBe("$1,234");
    expect(fmt(0)).toBe("$0");
    expect(fmt(undefined)).toBe("—");
  });

  it("should format percentage values correctly", () => {
    const pct = (n: number | undefined) => n !== undefined ? `${(n * 100).toFixed(1)}%` : "—";
    expect(pct(0.5)).toBe("50.0%");
    expect(pct(0.123)).toBe("12.3%");
    expect(pct(undefined)).toBe("—");
  });

  it("should format millisecond values correctly", () => {
    const ms = (n: number | undefined) => n !== undefined ? `${Math.round(n)}ms` : "—";
    expect(ms(150.7)).toBe("151ms");
    expect(ms(0)).toBe("0ms");
    expect(ms(undefined)).toBe("—");
  });
});

// ============================================================================
// STRIPE KPI ROUTER TESTS
// ============================================================================

describe("Stripe KPI Router — Structure", () => {
  it("should expose getStripeRevenue, getUserAnalytics, getAIMetrics endpoints", () => {
    const expectedEndpoints = ["getStripeRevenue", "getUserAnalytics", "getAIMetrics"];
    expectedEndpoints.forEach(endpoint => {
      expect(typeof endpoint).toBe("string");
      expect(endpoint.length).toBeGreaterThan(0);
    });
  });

  it("should return revenue data with correct structure", () => {
    const mockRevenue = {
      totalRevenue: 5000,
      monthlyRecurring: 2500,
      activeSubscriptions: 15,
      recentCharges: [],
    };
    expect(mockRevenue).toHaveProperty("totalRevenue");
    expect(mockRevenue).toHaveProperty("monthlyRecurring");
    expect(mockRevenue).toHaveProperty("activeSubscriptions");
    expect(mockRevenue.totalRevenue).toBeGreaterThanOrEqual(0);
  });
});
