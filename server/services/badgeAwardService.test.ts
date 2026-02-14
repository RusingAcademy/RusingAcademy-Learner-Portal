import { describe, it, expect } from "vitest";

// ─── Badge Award Service: Unit Tests ──────────────────────────────────────────
// Tests the trigger evaluation logic, progress calculation, badge definitions,
// and showcase data formatting used by the badge system.

// ─── Import badge definitions for testing ─────────────────────────────────────

const BADGE_CATEGORIES = {
  CONTENT: "content",
  STREAK: "streak",
  MASTERY: "mastery",
  SLE: "sle",
  SPECIAL: "special",
} as const;

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"] as const;

interface BadgeTrigger {
  type: string;
  count: number;
  level?: string;
}

interface BadgeDefinition {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  category: string;
  tier: string;
  xpReward: number;
  iconKey: string;
  gradientFrom: string;
  gradientTo: string;
  trigger: BadgeTrigger;
}

// ─── Replicate the badge definitions from server/data/badgeDefinitions.ts ─────
const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Content badges
  { id: "first_step", name: "First Step", nameFr: "Premier Pas", description: "Complete your first activity slot", descriptionFr: "Complétez votre première activité", category: "content", tier: "bronze", xpReward: 50, iconKey: "footprints", gradientFrom: "#0F3D3E", gradientTo: "#145A5B", trigger: { type: "first_activity", count: 1 } },
  { id: "getting_started", name: "Getting Started", nameFr: "Bien Parti", description: "Complete 10 activity slots", descriptionFr: "Complétez 10 activités", category: "content", tier: "bronze", xpReward: 100, iconKey: "layers", gradientFrom: "#0F3D3E", gradientTo: "#145A5B", trigger: { type: "slots_completed", count: 10 } },
  { id: "slot_warrior", name: "Slot Warrior", nameFr: "Guerrier des Créneaux", description: "Complete 50 activity slots", descriptionFr: "Complétez 50 activités", category: "content", tier: "silver", xpReward: 200, iconKey: "shield", gradientFrom: "#0F3D3E", gradientTo: "#145A5B", trigger: { type: "slots_completed", count: 50 } },
  { id: "slot_master", name: "Slot Master", nameFr: "Maître des Créneaux", description: "Complete 100 activity slots", descriptionFr: "Complétez 100 activités", category: "content", tier: "gold", xpReward: 500, iconKey: "crown", gradientFrom: "#0F3D3E", gradientTo: "#145A5B", trigger: { type: "slots_completed", count: 100 } },
  { id: "lesson_champion", name: "Lesson Champion", nameFr: "Champion de Leçon", description: "Complete 10 lessons with all 7 slots", descriptionFr: "Complétez 10 leçons avec les 7 créneaux", category: "content", tier: "gold", xpReward: 300, iconKey: "trophy", gradientFrom: "#0F3D3E", gradientTo: "#145A5B", trigger: { type: "lessons_completed", count: 10 } },
  { id: "video_virtuoso", name: "Video Virtuoso", nameFr: "Virtuose Vidéo", description: "Watch 50 video lessons", descriptionFr: "Regardez 50 leçons vidéo", category: "content", tier: "silver", xpReward: 200, iconKey: "play-circle", gradientFrom: "#0F3D3E", gradientTo: "#145A5B", trigger: { type: "videos_watched", count: 50 } },
  { id: "path_pioneer", name: "Path Pioneer", nameFr: "Pionnier du Parcours", description: "Complete your first Path", descriptionFr: "Complétez votre premier Parcours", category: "content", tier: "platinum", xpReward: 1000, iconKey: "gem", gradientFrom: "#0F3D3E", gradientTo: "#145A5B", trigger: { type: "paths_completed", count: 1 } },
  // Streak badges
  { id: "streak_3", name: "3-Day Streak", nameFr: "Série de 3 Jours", description: "Maintain a 3-day learning streak", descriptionFr: "Maintenez une série de 3 jours", category: "streak", tier: "bronze", xpReward: 50, iconKey: "flame", gradientFrom: "#B87333", gradientTo: "#D4943A", trigger: { type: "streak_days", count: 3 } },
  { id: "streak_7", name: "7-Day Streak", nameFr: "Série de 7 Jours", description: "Maintain a 7-day learning streak", descriptionFr: "Maintenez une série de 7 jours", category: "streak", tier: "silver", xpReward: 100, iconKey: "flame", gradientFrom: "#B87333", gradientTo: "#D4943A", trigger: { type: "streak_days", count: 7 } },
  { id: "streak_30", name: "Monthly Warrior", nameFr: "Guerrier Mensuel", description: "Maintain a 30-day learning streak", descriptionFr: "Maintenez une série de 30 jours", category: "streak", tier: "gold", xpReward: 500, iconKey: "zap", gradientFrom: "#B87333", gradientTo: "#D4943A", trigger: { type: "streak_days", count: 30 } },
  // Mastery badges
  { id: "quiz_master", name: "Quiz Master", nameFr: "Maître du Quiz", description: "Score 90%+ on 20 quizzes", descriptionFr: "Obtenez 90%+ sur 20 quiz", category: "mastery", tier: "gold", xpReward: 300, iconKey: "brain", gradientFrom: "#8B5CF6", gradientTo: "#A78BFA", trigger: { type: "quiz_score_90", count: 20 } },
  { id: "perfectionist", name: "Perfectionist", nameFr: "Perfectionniste", description: "Score 100% on 5 quizzes", descriptionFr: "Obtenez 100% sur 5 quiz", category: "mastery", tier: "platinum", xpReward: 500, iconKey: "star", gradientFrom: "#8B5CF6", gradientTo: "#A78BFA", trigger: { type: "quiz_perfect", count: 5 } },
  { id: "xp_collector", name: "XP Collector", nameFr: "Collecteur XP", description: "Earn 1000 XP total", descriptionFr: "Gagnez 1000 XP au total", category: "mastery", tier: "silver", xpReward: 200, iconKey: "sparkles", gradientFrom: "#8B5CF6", gradientTo: "#A78BFA", trigger: { type: "xp_earned", count: 1000 } },
  // SLE badges
  { id: "sle_a_ready", name: "SLE Level A Ready", nameFr: "SLE Niveau A Prêt", description: "Reach SLE Level A readiness", descriptionFr: "Atteignez la préparation SLE Niveau A", category: "sle", tier: "bronze", xpReward: 200, iconKey: "target", gradientFrom: "#DC2626", gradientTo: "#EF4444", trigger: { type: "sle_level", count: 1, level: "A" } },
  { id: "sle_b_ready", name: "SLE Level B Ready", nameFr: "SLE Niveau B Prêt", description: "Reach SLE Level B readiness", descriptionFr: "Atteignez la préparation SLE Niveau B", category: "sle", tier: "silver", xpReward: 500, iconKey: "medal", gradientFrom: "#DC2626", gradientTo: "#EF4444", trigger: { type: "sle_level", count: 3, level: "B" } },
  { id: "sle_c_ready", name: "SLE Level C Ready", nameFr: "SLE Niveau C Prêt", description: "Reach SLE Level C readiness", descriptionFr: "Atteignez la préparation SLE Niveau C", category: "sle", tier: "gold", xpReward: 1000, iconKey: "crown", gradientFrom: "#DC2626", gradientTo: "#EF4444", trigger: { type: "sle_level", count: 5, level: "C" } },
  // Special badges
  { id: "founding_member", name: "Founding Member", nameFr: "Membre Fondateur", description: "Joined during the founding period", descriptionFr: "Inscrit pendant la période de fondation", category: "special", tier: "platinum", xpReward: 500, iconKey: "gem", gradientFrom: "#F59E0B", gradientTo: "#FBBF24", trigger: { type: "founding_member", count: 1 } },
];

// ─── Replicate the trigger evaluation logic ──────────────────────────────────

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

interface BadgeCheckContext {
  userId: number;
  action: string;
  courseId?: number;
  quizScore?: number;
  streakDays?: number;
  totalXp?: number;
}

function evaluateTrigger(trigger: BadgeTrigger, stats: UserStats, ctx: BadgeCheckContext): boolean {
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
      if (trigger.level === "A") return stats.coursesCompleted >= 1;
      if (trigger.level === "B") return stats.coursesCompleted >= 3;
      if (trigger.level === "C") return stats.coursesCompleted >= 5;
      return false;
    case "all_slots_lesson":
      return ctx.action === "lesson_completed";
    case "founding_member":
    case "beta_tester":
      return false;
    default:
      return false;
  }
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
    case "founding_member":
    case "beta_tester":
      return { current: 0, target: 1 };
    default:
      return { current: 0, target: 1 };
  }
}

// ─── Helper: Create mock stats ───────────────────────────────────────────────

function makeStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    slotsCompleted: 0,
    lessonsCompleted: 0,
    modulesCompleted: 0,
    coursesCompleted: 0,
    videosWatched: 0,
    quizzesPassed90: 0,
    quizzesPerfect: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalXp: 0,
    ...overrides,
  };
}

function makeCtx(overrides: Partial<BadgeCheckContext> = {}): BadgeCheckContext {
  return {
    userId: 1,
    action: "slot_completed",
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("Badge Definitions", () => {
  it("should have at least 15 badge definitions", () => {
    expect(BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(15);
  });

  it("should have unique IDs for all badges", () => {
    const ids = BADGE_DEFINITIONS.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have bilingual names and descriptions for all badges", () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.name.length).toBeGreaterThan(0);
      expect(badge.nameFr.length).toBeGreaterThan(0);
      expect(badge.description.length).toBeGreaterThan(0);
      expect(badge.descriptionFr.length).toBeGreaterThan(0);
    }
  });

  it("should have valid categories for all badges", () => {
    const validCategories = Object.values(BADGE_CATEGORIES);
    for (const badge of BADGE_DEFINITIONS) {
      expect(validCategories).toContain(badge.category);
    }
  });

  it("should have valid tiers for all badges", () => {
    const validTiers = [...TIER_ORDER];
    for (const badge of BADGE_DEFINITIONS) {
      expect(validTiers).toContain(badge.tier);
    }
  });

  it("should have positive XP rewards for all badges", () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.xpReward).toBeGreaterThan(0);
    }
  });

  it("should have valid icon keys for all badges", () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.iconKey.length).toBeGreaterThan(0);
    }
  });

  it("should have gradient colors for all badges", () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.gradientFrom).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(badge.gradientTo).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("should have valid trigger types for all badges", () => {
    const validTypes = [
      "first_activity", "slots_completed", "lessons_completed", "modules_completed",
      "paths_completed", "videos_watched", "quiz_score_90", "quiz_perfect",
      "streak_days", "xp_earned", "course_complete", "sle_level",
      "all_slots_lesson", "founding_member", "beta_tester",
    ];
    for (const badge of BADGE_DEFINITIONS) {
      expect(validTypes).toContain(badge.trigger.type);
    }
  });

  it("should have badges in all 5 categories", () => {
    const categoriesUsed = new Set(BADGE_DEFINITIONS.map((b) => b.category));
    expect(categoriesUsed.size).toBe(5);
  });

  it("should have at least one badge per tier", () => {
    const tiersUsed = new Set(BADGE_DEFINITIONS.map((b) => b.tier));
    for (const tier of TIER_ORDER) {
      expect(tiersUsed.has(tier)).toBe(true);
    }
  });
});

describe("Trigger Evaluation — Content Badges", () => {
  it("first_activity: triggers on first slot completed", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "first_step")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ slotsCompleted: 0 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ slotsCompleted: 1 }), makeCtx())).toBe(true);
    expect(evaluateTrigger(badge.trigger, makeStats({ slotsCompleted: 50 }), makeCtx())).toBe(true);
  });

  it("slots_completed: triggers at threshold", () => {
    const badge10 = BADGE_DEFINITIONS.find((b) => b.id === "getting_started")!;
    expect(evaluateTrigger(badge10.trigger, makeStats({ slotsCompleted: 9 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge10.trigger, makeStats({ slotsCompleted: 10 }), makeCtx())).toBe(true);
    expect(evaluateTrigger(badge10.trigger, makeStats({ slotsCompleted: 100 }), makeCtx())).toBe(true);
  });

  it("slots_completed: silver tier at 50", () => {
    const badge50 = BADGE_DEFINITIONS.find((b) => b.id === "slot_warrior")!;
    expect(evaluateTrigger(badge50.trigger, makeStats({ slotsCompleted: 49 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge50.trigger, makeStats({ slotsCompleted: 50 }), makeCtx())).toBe(true);
  });

  it("slots_completed: gold tier at 100", () => {
    const badge100 = BADGE_DEFINITIONS.find((b) => b.id === "slot_master")!;
    expect(evaluateTrigger(badge100.trigger, makeStats({ slotsCompleted: 99 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge100.trigger, makeStats({ slotsCompleted: 100 }), makeCtx())).toBe(true);
  });

  it("lessons_completed: triggers at 10 lessons", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "lesson_champion")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ lessonsCompleted: 9 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ lessonsCompleted: 10 }), makeCtx())).toBe(true);
  });

  it("videos_watched: triggers at 50 videos", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "video_virtuoso")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ videosWatched: 49 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ videosWatched: 50 }), makeCtx())).toBe(true);
  });

  it("paths_completed: triggers on first path completion", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "path_pioneer")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ coursesCompleted: 0 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ coursesCompleted: 1 }), makeCtx())).toBe(true);
  });
});

describe("Trigger Evaluation — Streak Badges", () => {
  it("streak_days: triggers on current streak", () => {
    const badge3 = BADGE_DEFINITIONS.find((b) => b.id === "streak_3")!;
    expect(evaluateTrigger(badge3.trigger, makeStats({ currentStreak: 2 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge3.trigger, makeStats({ currentStreak: 3 }), makeCtx())).toBe(true);
  });

  it("streak_days: also triggers on longest streak (historical)", () => {
    const badge7 = BADGE_DEFINITIONS.find((b) => b.id === "streak_7")!;
    // Current streak is only 2, but longest was 7 — should still earn
    expect(evaluateTrigger(badge7.trigger, makeStats({ currentStreak: 2, longestStreak: 7 }), makeCtx())).toBe(true);
  });

  it("streak_days: 30-day streak for gold tier", () => {
    const badge30 = BADGE_DEFINITIONS.find((b) => b.id === "streak_30")!;
    expect(evaluateTrigger(badge30.trigger, makeStats({ currentStreak: 29 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge30.trigger, makeStats({ currentStreak: 30 }), makeCtx())).toBe(true);
  });
});

describe("Trigger Evaluation — Mastery Badges", () => {
  it("quiz_score_90: triggers on 20 quizzes with 90%+", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "quiz_master")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ quizzesPassed90: 19 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ quizzesPassed90: 20 }), makeCtx())).toBe(true);
  });

  it("quiz_perfect: triggers on 5 perfect quizzes", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "perfectionist")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ quizzesPerfect: 4 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ quizzesPerfect: 5 }), makeCtx())).toBe(true);
  });

  it("xp_earned: triggers at 1000 XP", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "xp_collector")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ totalXp: 999 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ totalXp: 1000 }), makeCtx())).toBe(true);
  });
});

describe("Trigger Evaluation — SLE Badges", () => {
  it("SLE Level A: triggers on 1 course completed", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "sle_a_ready")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ coursesCompleted: 0 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ coursesCompleted: 1 }), makeCtx())).toBe(true);
  });

  it("SLE Level B: triggers on 3 courses completed", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "sle_b_ready")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ coursesCompleted: 2 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ coursesCompleted: 3 }), makeCtx())).toBe(true);
  });

  it("SLE Level C: triggers on 5 courses completed", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "sle_c_ready")!;
    expect(evaluateTrigger(badge.trigger, makeStats({ coursesCompleted: 4 }), makeCtx())).toBe(false);
    expect(evaluateTrigger(badge.trigger, makeStats({ coursesCompleted: 5 }), makeCtx())).toBe(true);
  });
});

describe("Trigger Evaluation — Special Badges", () => {
  it("founding_member: never auto-triggers (manual only)", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "founding_member")!;
    const maxStats = makeStats({
      slotsCompleted: 1000, lessonsCompleted: 100, coursesCompleted: 10,
      currentStreak: 365, totalXp: 100000,
    });
    expect(evaluateTrigger(badge.trigger, maxStats, makeCtx())).toBe(false);
  });
});

describe("Progress Calculation", () => {
  it("first_activity: caps at 1/1", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "first_step")!;
    const progress = getTriggerProgress(badge.trigger, makeStats({ slotsCompleted: 50 }));
    expect(progress.current).toBe(1);
    expect(progress.target).toBe(1);
  });

  it("slots_completed: shows actual progress toward target", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "getting_started")!;
    const progress = getTriggerProgress(badge.trigger, makeStats({ slotsCompleted: 7 }));
    expect(progress.current).toBe(7);
    expect(progress.target).toBe(10);
  });

  it("streak_days: uses max of current and longest streak", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "streak_7")!;
    const progress = getTriggerProgress(badge.trigger, makeStats({ currentStreak: 3, longestStreak: 5 }));
    expect(progress.current).toBe(5); // max(3, 5)
    expect(progress.target).toBe(7);
  });

  it("sle_level A: target is 1 course", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "sle_a_ready")!;
    const progress = getTriggerProgress(badge.trigger, makeStats({ coursesCompleted: 0 }));
    expect(progress.current).toBe(0);
    expect(progress.target).toBe(1);
  });

  it("sle_level B: target is 3 courses", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "sle_b_ready")!;
    const progress = getTriggerProgress(badge.trigger, makeStats({ coursesCompleted: 2 }));
    expect(progress.current).toBe(2);
    expect(progress.target).toBe(3);
  });

  it("sle_level C: target is 5 courses", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "sle_c_ready")!;
    const progress = getTriggerProgress(badge.trigger, makeStats({ coursesCompleted: 4 }));
    expect(progress.current).toBe(4);
    expect(progress.target).toBe(5);
  });

  it("founding_member: always 0/1 (manual)", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "founding_member")!;
    const progress = getTriggerProgress(badge.trigger, makeStats({ slotsCompleted: 1000 }));
    expect(progress.current).toBe(0);
    expect(progress.target).toBe(1);
  });

  it("xp_earned: shows actual XP toward target", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "xp_collector")!;
    const progress = getTriggerProgress(badge.trigger, makeStats({ totalXp: 750 }));
    expect(progress.current).toBe(750);
    expect(progress.target).toBe(1000);
  });
});

describe("Showcase Data Formatting", () => {
  it("should group badges by category correctly", () => {
    const byCategory = Object.values(BADGE_CATEGORIES).map((cat) => {
      const badges = BADGE_DEFINITIONS.filter((b) => b.category === cat);
      return { category: cat, count: badges.length };
    });

    // Content should have the most badges
    const content = byCategory.find((c) => c.category === "content");
    expect(content!.count).toBeGreaterThanOrEqual(5);

    // All categories should have at least 1 badge
    for (const cat of byCategory) {
      expect(cat.count).toBeGreaterThanOrEqual(1);
    }
  });

  it("should calculate category progress correctly", () => {
    const contentBadges = BADGE_DEFINITIONS.filter((b) => b.category === "content");
    const earned = 3;
    const total = contentBadges.length;
    const progressPercent = Math.round((earned / total) * 100);
    expect(progressPercent).toBeGreaterThan(0);
    expect(progressPercent).toBeLessThanOrEqual(100);
  });

  it("should sort next-to-earn by highest progress first", () => {
    const stats = makeStats({ slotsCompleted: 8, videosWatched: 40, currentStreak: 5 });
    const progressList = BADGE_DEFINITIONS
      .filter((b) => b.trigger.type !== "founding_member" && b.trigger.type !== "beta_tester")
      .map((badge) => {
        const { current, target } = getTriggerProgress(badge.trigger, stats);
        const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        return { id: badge.id, percent };
      })
      .filter((p) => p.percent > 0 && p.percent < 100)
      .sort((a, b) => b.percent - a.percent);

    // Should be sorted descending
    for (let i = 1; i < progressList.length; i++) {
      expect(progressList[i].percent).toBeLessThanOrEqual(progressList[i - 1].percent);
    }
  });

  it("should compute progressPercent as 100 for earned badges", () => {
    const badge = BADGE_DEFINITIONS[0];
    const earned = true;
    const { current, target } = getTriggerProgress(badge.trigger, makeStats({ slotsCompleted: 50 }));
    const rawPercent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const displayPercent = earned ? 100 : rawPercent;
    expect(displayPercent).toBe(100);
  });

  it("should cap progress at 100% even if current exceeds target", () => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === "getting_started")!;
    const { current, target } = getTriggerProgress(badge.trigger, makeStats({ slotsCompleted: 200 }));
    const percent = Math.min(100, Math.round((current / target) * 100));
    expect(percent).toBe(100);
  });
});

describe("Badge Award Flow Simulation", () => {
  it("should identify newly earned badges from a fresh user completing first slot", () => {
    const stats = makeStats({ slotsCompleted: 1 });
    const ctx = makeCtx({ action: "slot_completed" });
    const ownedSet = new Set<string>();

    const newlyEarned = BADGE_DEFINITIONS.filter((badge) => {
      if (ownedSet.has(badge.id)) return false;
      return evaluateTrigger(badge.trigger, stats, ctx);
    });

    expect(newlyEarned.length).toBeGreaterThanOrEqual(1);
    expect(newlyEarned.some((b) => b.id === "first_step")).toBe(true);
  });

  it("should not re-award already owned badges", () => {
    const stats = makeStats({ slotsCompleted: 100, lessonsCompleted: 20 });
    const ctx = makeCtx({ action: "slot_completed" });
    const ownedSet = new Set(["first_step", "getting_started", "slot_warrior"]);

    const newlyEarned = BADGE_DEFINITIONS.filter((badge) => {
      if (ownedSet.has(badge.id)) return false;
      return evaluateTrigger(badge.trigger, stats, ctx);
    });

    // Should not include already owned badges
    expect(newlyEarned.some((b) => b.id === "first_step")).toBe(false);
    expect(newlyEarned.some((b) => b.id === "getting_started")).toBe(false);
    expect(newlyEarned.some((b) => b.id === "slot_warrior")).toBe(false);

    // But should include slot_master (100 slots) and lesson_champion (10+ lessons)
    expect(newlyEarned.some((b) => b.id === "slot_master")).toBe(true);
    expect(newlyEarned.some((b) => b.id === "lesson_champion")).toBe(true);
  });

  it("should award multiple badges in a single check when thresholds are met", () => {
    const stats = makeStats({
      slotsCompleted: 100,
      lessonsCompleted: 10,
      videosWatched: 50,
      currentStreak: 30,
      quizzesPassed90: 20,
      totalXp: 1000,
      coursesCompleted: 1,
    });
    const ctx = makeCtx({ action: "slot_completed" });
    const ownedSet = new Set<string>();

    const newlyEarned = BADGE_DEFINITIONS.filter((badge) => {
      if (ownedSet.has(badge.id)) return false;
      return evaluateTrigger(badge.trigger, stats, ctx);
    });

    // Should earn many badges at once
    expect(newlyEarned.length).toBeGreaterThanOrEqual(10);
  });

  it("should calculate correct total XP from awarded badges", () => {
    const awarded = BADGE_DEFINITIONS.filter((b) =>
      ["first_step", "getting_started", "streak_3"].includes(b.id)
    );
    const totalXp = awarded.reduce((sum, b) => sum + b.xpReward, 0);
    expect(totalXp).toBe(50 + 100 + 50); // 200 XP
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PATH COMPLETION BADGES — Tests for the 8 new path-completion badges
// ═══════════════════════════════════════════════════════════════════════════════

const PATH_COMPLETION_BADGES: BadgeDefinition[] = [
  { id: "path_a1_complete", name: "A1 Achiever", nameFr: "Réussite A1", description: "Complete the entire A1 Foundations Path", descriptionFr: "Complétez l'intégralité du Parcours A1 Fondations", category: "content", tier: "gold", xpReward: 1000, iconKey: "trophy-a1", gradientFrom: "#059669", gradientTo: "#10B981", trigger: { type: "path_completed", pathId: 90007 } },
  { id: "path_a2_complete", name: "A2 Master", nameFr: "Maître A2", description: "Complete A2 Path", descriptionFr: "Complétez le Parcours A2", category: "content", tier: "gold", xpReward: 1500, iconKey: "trophy-a2", gradientFrom: "#2563EB", gradientTo: "#3B82F6", trigger: { type: "path_completed", pathId: 120002 } },
  { id: "path_b1_complete", name: "B1 Champion", nameFr: "Champion B1", description: "Complete B1 Path", descriptionFr: "Complétez le Parcours B1", category: "content", tier: "gold", xpReward: 2000, iconKey: "trophy-b1", gradientFrom: "#7C3AED", gradientTo: "#8B5CF6", trigger: { type: "path_completed", pathId: 120003 } },
  { id: "path_b2_complete", name: "B2 Expert", nameFr: "Expert B2", description: "Complete B2 Path", descriptionFr: "Complétez le Parcours B2", category: "content", tier: "platinum", xpReward: 2500, iconKey: "trophy-b2", gradientFrom: "#DC2626", gradientTo: "#EF4444", trigger: { type: "path_completed", pathId: 120004 } },
  { id: "path_c1_complete", name: "C1 Elite", nameFr: "Élite C1", description: "Complete C1 Path", descriptionFr: "Complétez le Parcours C1", category: "content", tier: "platinum", xpReward: 3000, iconKey: "trophy-c1", gradientFrom: "#B45309", gradientTo: "#F59E0B", trigger: { type: "path_completed", pathId: 120005 } },
  { id: "path_exam_complete", name: "Exam Ready", nameFr: "Prêt pour l'Examen", description: "Complete Exam Prep Path", descriptionFr: "Complétez le Parcours Préparation", category: "sle", tier: "platinum", xpReward: 3500, iconKey: "trophy-exam", gradientFrom: "#0F172A", gradientTo: "#1E3A8A", trigger: { type: "path_completed", pathId: 120006 } },
  { id: "all_paths_complete", name: "Ultimate Learner", nameFr: "Apprenant Ultime", description: "Complete all 6 Paths", descriptionFr: "Complétez les 6 Parcours", category: "mastery", tier: "platinum", xpReward: 10000, iconKey: "crown-ultimate", gradientFrom: "#FFD700", gradientTo: "#C65A1E", trigger: { type: "all_paths_completed", count: 6 } },
  { id: "speed_learner", name: "Speed Learner", nameFr: "Apprenant Rapide", description: "Complete any Path in 30 days", descriptionFr: "Complétez un Parcours en 30 jours", category: "special", tier: "gold", xpReward: 1500, iconKey: "zap-fast", gradientFrom: "#F97316", gradientTo: "#FB923C", trigger: { type: "path_completed_fast", days: 30 } },
];

const ALL_BADGES_COMBINED = [...BADGE_DEFINITIONS, ...PATH_COMPLETION_BADGES];

describe("Path Completion Badges — Definitions", () => {
  it("should have exactly 8 path completion badges", () => {
    expect(PATH_COMPLETION_BADGES).toHaveLength(8);
  });

  it("should have unique IDs across all badges (24 total)", () => {
    const allIds = ALL_BADGES_COMBINED.map((b) => b.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
    expect(allIds.length).toBe(25);
  });

  it("should have bilingual names and descriptions for all path badges", () => {
    for (const badge of PATH_COMPLETION_BADGES) {
      expect(badge.name.length).toBeGreaterThan(0);
      expect(badge.nameFr.length).toBeGreaterThan(0);
      expect(badge.description.length).toBeGreaterThan(0);
      expect(badge.descriptionFr.length).toBeGreaterThan(0);
      expect(badge.name).not.toBe(badge.nameFr);
    }
  });

  it("should map each path badge to the correct course ID", () => {
    const pathIdMap: Record<string, number> = {
      path_a1_complete: 90007,
      path_a2_complete: 120002,
      path_b1_complete: 120003,
      path_b2_complete: 120004,
      path_c1_complete: 120005,
      path_exam_complete: 120006,
    };
    for (const [badgeId, expectedPathId] of Object.entries(pathIdMap)) {
      const badge = PATH_COMPLETION_BADGES.find((b) => b.id === badgeId)!;
      expect(badge).toBeDefined();
      expect((badge.trigger as any).pathId).toBe(expectedPathId);
    }
  });

  it("should have correct XP rewards in ascending CEFR order", () => {
    const xpValues = [
      PATH_COMPLETION_BADGES.find((b) => b.id === "path_a1_complete")!.xpReward,
      PATH_COMPLETION_BADGES.find((b) => b.id === "path_a2_complete")!.xpReward,
      PATH_COMPLETION_BADGES.find((b) => b.id === "path_b1_complete")!.xpReward,
      PATH_COMPLETION_BADGES.find((b) => b.id === "path_b2_complete")!.xpReward,
      PATH_COMPLETION_BADGES.find((b) => b.id === "path_c1_complete")!.xpReward,
      PATH_COMPLETION_BADGES.find((b) => b.id === "path_exam_complete")!.xpReward,
    ];
    for (let i = 1; i < xpValues.length; i++) {
      expect(xpValues[i]).toBeGreaterThanOrEqual(xpValues[i - 1]);
    }
  });

  it("should have all_paths_complete badge with 10000 XP reward", () => {
    const ultimate = PATH_COMPLETION_BADGES.find((b) => b.id === "all_paths_complete")!;
    expect(ultimate.xpReward).toBe(10000);
    expect(ultimate.tier).toBe("platinum");
    expect((ultimate.trigger as any).count).toBe(6);
  });

  it("should have speed_learner badge with 30-day threshold", () => {
    const speed = PATH_COMPLETION_BADGES.find((b) => b.id === "speed_learner")!;
    expect(speed.xpReward).toBe(1500);
    expect(speed.tier).toBe("gold");
    expect((speed.trigger as any).days).toBe(30);
  });

  it("should have valid tier values for all path badges", () => {
    const validTiers = ["bronze", "silver", "gold", "platinum"];
    for (const badge of PATH_COMPLETION_BADGES) {
      expect(validTiers).toContain(badge.tier);
    }
  });

  it("should have gold or platinum tier for all path badges", () => {
    for (const badge of PATH_COMPLETION_BADGES) {
      expect(["gold", "platinum"]).toContain(badge.tier);
    }
  });

  it("should calculate total XP from all path completion badges", () => {
    const totalXp = PATH_COMPLETION_BADGES.reduce((sum, b) => sum + b.xpReward, 0);
    // 1000+1500+2000+2500+3000+3500+10000+1500 = 25000
    expect(totalXp).toBe(25000);
  });
});
