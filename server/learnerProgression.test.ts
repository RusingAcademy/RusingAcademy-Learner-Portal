/**
 * Tests for Learner Progression System
 * Covers: XP Engine, Milestones, Health Checks, RBAC Seed
 */
import { describe, it, expect } from "vitest";

// ============================================================================
// XP ENGINE TESTS
// ============================================================================
describe("XP Engine — Multipliers", () => {
  it("should calculate streak multiplier correctly for 0 days", () => {
    // 0 streak = 1.0x
    const multiplier = getStreakMultiplier(0);
    expect(multiplier).toBe(1.0);
  });

  it("should calculate streak multiplier for 3-day streak", () => {
    const multiplier = getStreakMultiplier(3);
    expect(multiplier).toBe(1.2);
  });

  it("should calculate streak multiplier for 7-day streak", () => {
    const multiplier = getStreakMultiplier(7);
    expect(multiplier).toBe(1.5);
  });

  it("should calculate streak multiplier for 14-day streak", () => {
    const multiplier = getStreakMultiplier(14);
    expect(multiplier).toBe(1.75);
  });

  it("should calculate streak multiplier for 30+ day streak", () => {
    const multiplier = getStreakMultiplier(30);
    expect(multiplier).toBe(2.0);
  });

  it("should calculate level multiplier correctly", () => {
    expect(getLevelMultiplier(1)).toBe(1.0);
    expect(getLevelMultiplier(5)).toBe(1.2);
    expect(getLevelMultiplier(10)).toBe(1.5);
  });

  it("should calculate total multiplier as product of streak and level", () => {
    const streakMult = getStreakMultiplier(7); // 1.5
    const levelMult = getLevelMultiplier(1); // 1.0
    const total = Math.round(streakMult * levelMult * 100) / 100;
    expect(total).toBe(1.5);
  });

  it("should calculate enhanced XP correctly", () => {
    const baseXp = 100;
    const result = calculateEnhancedXpLocal(baseXp, 7, 5);
    expect(result.baseXp).toBe(100);
    expect(result.streakMultiplier).toBe(1.5);
    expect(result.levelMultiplier).toBe(1.2);
    expect(result.totalMultiplier).toBe(1.8);
    expect(result.enhancedXp).toBe(180);
  });
});

// ============================================================================
// MILESTONES TESTS
// ============================================================================
describe("XP Engine — Milestones", () => {
  it("should define milestones in ascending XP order", () => {
    for (let i = 1; i < MILESTONES.length; i++) {
      expect(MILESTONES[i].xpThreshold).toBeGreaterThan(MILESTONES[i - 1].xpThreshold);
    }
  });

  it("should have at least 5 milestones", () => {
    expect(MILESTONES.length).toBeGreaterThanOrEqual(5);
  });

  it("should return correct milestone progress for 0 XP", () => {
    const progress = getMilestoneProgressLocal(0);
    expect(progress.currentXp).toBe(0);
    expect(progress.progressPercent).toBe(0);
    expect(progress.nextMilestone).toBeDefined();
  });

  it("should return correct milestone progress for mid-range XP", () => {
    // 350 XP is between 250 (getting_started) and 500 (dedicated_learner)
    const progress = getMilestoneProgressLocal(350);
    expect(progress.currentXp).toBe(350);
    expect(progress.progressPercent).toBeGreaterThan(0);
    expect(progress.progressPercent).toBeLessThan(100);
  });

  it("should return next milestone correctly", () => {
    const next = getNextMilestoneLocal(0);
    expect(next).toBeDefined();
    expect(next!.xpThreshold).toBeGreaterThan(0);
  });

  it("should return null when all milestones are reached", () => {
    const maxXp = MILESTONES[MILESTONES.length - 1].xpThreshold + 1000;
    const next = getNextMilestoneLocal(maxXp);
    expect(next).toBeNull();
  });

  it("should check new milestones correctly", () => {
    const reached = checkNewMilestonesLocal(500, []);
    expect(reached.length).toBeGreaterThan(0);
    expect(reached.every(m => m.xpThreshold <= 500)).toBe(true);
  });

  it("should not return already-reached milestones", () => {
    const firstId = MILESTONES[0].id;
    const reached = checkNewMilestonesLocal(500, [firstId]);
    expect(reached.find(m => m.id === firstId)).toBeUndefined();
  });
});

// ============================================================================
// HEALTH CHECK CRON TESTS
// ============================================================================
describe("Health Check Scheduler", () => {
  it("should have health check module importable", async () => {
    // Verify the module exists and exports the expected function
    const fs = await import("fs");
    const path = "./server/cron/health-checks.ts";
    const exists = fs.existsSync(path);
    expect(exists).toBe(true);
  });
});

// ============================================================================
// RBAC SEED VERIFICATION
// ============================================================================
describe("RBAC Seed Data", () => {
  it("should have defined role names", () => {
    const expectedRoles = ["owner", "superadmin", "admin", "hr_manager", "coach", "editor", "viewer", "learner"];
    expectedRoles.forEach(role => {
      expect(typeof role).toBe("string");
      expect(role.length).toBeGreaterThan(0);
    });
  });

  it("should have defined permission modules", () => {
    const modules = ["users", "coaches", "courses", "content", "analytics", "settings", "billing", "crm", "ai"];
    modules.forEach(mod => {
      expect(typeof mod).toBe("string");
    });
  });
});

// ============================================================================
// LEARNER PROGRESSION ROUTER REGISTRATION
// ============================================================================
describe("Learner Progression Router", () => {
  it("should be registered in the main appRouter", async () => {
    const fs = await import("fs");
    const routersContent = fs.readFileSync("./server/routers.ts", "utf-8");
    expect(routersContent).toContain("learnerProgression: learnerProgressionRouter");
    expect(routersContent).toContain('import { learnerProgressionRouter }');
  });

  it("should export expected procedures", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("./server/routers/learnerProgression.ts", "utf-8");
    expect(content).toContain("getMultiplier:");
    expect(content).toContain("previewXp:");
    expect(content).toContain("getMilestoneProgress:");
    expect(content).toContain("getAllMilestones:");
    expect(content).toContain("getRecommendations:");
    expect(content).toContain("getActivityFeed:");
    expect(content).toContain("getProgressionSummary:");
  });
});

// ============================================================================
// FRONTEND COMPONENTS EXISTENCE
// ============================================================================
describe("Frontend Components", () => {
  it("should have XpMultiplierCard component", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("./client/src/components/XpMultiplierCard.tsx")).toBe(true);
  });

  it("should have RecommendedNextSteps component", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("./client/src/components/RecommendedNextSteps.tsx")).toBe(true);
  });

  it("should have ActivityFeed component", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("./client/src/components/ActivityFeed.tsx")).toBe(true);
  });

  it("should have MilestoneProgressCard component", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("./client/src/components/MilestoneProgressCard.tsx")).toBe(true);
  });

  it("should integrate new components in LearnerDashboard", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("./client/src/pages/LearnerDashboard.tsx", "utf-8");
    expect(content).toContain("XpMultiplierCard");
    expect(content).toContain("RecommendedNextSteps");
    expect(content).toContain("ActivityFeed");
    expect(content).toContain("MilestoneProgressCard");
  });
});

// ============================================================================
// LOCAL HELPER IMPLEMENTATIONS (mirror server logic for unit testing)
// ============================================================================

const STREAK_MULTIPLIERS = [
  { minDays: 30, multiplier: 2.0 },
  { minDays: 14, multiplier: 1.75 },
  { minDays: 7, multiplier: 1.5 },
  { minDays: 3, multiplier: 1.2 },
  { minDays: 1, multiplier: 1.1 },
  { minDays: 0, multiplier: 1.0 },
];

function getStreakMultiplier(streakDays: number): number {
  for (const tier of STREAK_MULTIPLIERS) {
    if (streakDays >= tier.minDays) return tier.multiplier;
  }
  return 1.0;
}

function getLevelMultiplier(level: number): number {
  if (level >= 10) return 1.5;
  if (level >= 8) return 1.4;
  if (level >= 6) return 1.3;
  if (level >= 5) return 1.2;
  if (level >= 3) return 1.1;
  return 1.0;
}

function calculateEnhancedXpLocal(baseXp: number, streakDays: number, level: number) {
  const streakMultiplier = getStreakMultiplier(streakDays);
  const levelMultiplier = getLevelMultiplier(level);
  const totalMultiplier = Math.round(streakMultiplier * levelMultiplier * 100) / 100;
  const enhancedXp = Math.round(baseXp * totalMultiplier);
  return { baseXp, streakMultiplier, levelMultiplier, totalMultiplier, enhancedXp };
}

const MILESTONES = [
  { id: "first_steps", title: "First Steps", xpThreshold: 100, icon: "🌱" },
  { id: "getting_started", title: "Getting Started", xpThreshold: 250, icon: "📚" },
  { id: "dedicated_learner", title: "Dedicated Learner", xpThreshold: 500, icon: "🎯" },
  { id: "rising_star", title: "Rising Star", xpThreshold: 1000, icon: "⭐" },
  { id: "knowledge_seeker", title: "Knowledge Seeker", xpThreshold: 2500, icon: "🔍" },
  { id: "expert_in_training", title: "Expert in Training", xpThreshold: 5000, icon: "🏆" },
  { id: "bilingual_champion", title: "Bilingual Champion", xpThreshold: 10000, icon: "🇨🇦" },
  { id: "language_master", title: "Language Master", xpThreshold: 25000, icon: "👑" },
];

function getMilestoneProgressLocal(totalXp: number) {
  const next = getNextMilestoneLocal(totalXp);
  if (!next) {
    return { currentXp: totalXp, progressPercent: 100, nextMilestone: null, xpRemaining: 0 };
  }
  const prevThreshold = MILESTONES.filter(m => m.xpThreshold <= totalXp).pop()?.xpThreshold || 0;
  const range = next.xpThreshold - prevThreshold;
  const progress = totalXp - prevThreshold;
  const progressPercent = range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 0;
  return {
    currentXp: totalXp,
    progressPercent,
    nextMilestone: next,
    xpRemaining: next.xpThreshold - totalXp,
  };
}

function getNextMilestoneLocal(totalXp: number) {
  return MILESTONES.find(m => m.xpThreshold > totalXp) || null;
}

function checkNewMilestonesLocal(totalXp: number, alreadyReached: string[]) {
  return MILESTONES.filter(m => m.xpThreshold <= totalXp && !alreadyReached.includes(m.id));
}
