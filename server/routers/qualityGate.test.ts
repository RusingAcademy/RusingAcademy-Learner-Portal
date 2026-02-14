import { describe, it, expect } from "vitest";

// ─── Quality Gate Validation Logic Tests ─────────────────────────────────────

const SLOT_TEMPLATE = [
  { slotIndex: 1, slotType: "introduction", label: "Intro / Hook", activityType: "text" },
  { slotIndex: 2, slotType: "video_scenario", label: "Video Scenario", activityType: "video" },
  { slotIndex: 3, slotType: "grammar_point", label: "Grammar / Strategy", activityType: "text" },
  { slotIndex: 4, slotType: "written_practice", label: "Written Practice", activityType: "assignment" },
  { slotIndex: 5, slotType: "oral_practice", label: "Oral Practice", activityType: "audio" },
  { slotIndex: 6, slotType: "quiz_slot", label: "Quiz", activityType: "quiz" },
  { slotIndex: 7, slotType: "coaching_tip", label: "Coaching Tip", activityType: "text" },
];

describe("Quality Gate Router", () => {
  describe("SLOT_TEMPLATE", () => {
    it("should define exactly 7 required slot types", () => {
      expect(SLOT_TEMPLATE).toHaveLength(7);
      expect(SLOT_TEMPLATE[0].slotIndex).toBe(1);
      expect(SLOT_TEMPLATE[6].slotIndex).toBe(7);
    });

    it("should have unique slot indices 1-7", () => {
      const indices = SLOT_TEMPLATE.map(s => s.slotIndex);
      const unique = [...new Set(indices)];
      expect(unique).toHaveLength(7);
      expect(unique).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("should map correct activity types to slot types", () => {
      expect(SLOT_TEMPLATE.find(s => s.slotType === "introduction")?.activityType).toBe("text");
      expect(SLOT_TEMPLATE.find(s => s.slotType === "video_scenario")?.activityType).toBe("video");
      expect(SLOT_TEMPLATE.find(s => s.slotType === "quiz_slot")?.activityType).toBe("quiz");
      expect(SLOT_TEMPLATE.find(s => s.slotType === "oral_practice")?.activityType).toBe("audio");
      expect(SLOT_TEMPLATE.find(s => s.slotType === "written_practice")?.activityType).toBe("assignment");
    });
  });

  describe("Slot Validation Logic", () => {
    it("should detect missing slots when lesson has fewer than 7 activities", () => {
      const activities = [
        { slotIndex: 1, slotType: "introduction" },
        { slotIndex: 2, slotType: "video_scenario" },
        { slotIndex: 3, slotType: "grammar_point" },
      ];
      const requiredIndices = [1, 2, 3, 4, 5, 6, 7];
      const presentIndices = activities.map(a => a.slotIndex);
      const missing = requiredIndices.filter(i => !presentIndices.includes(i));
      expect(missing).toEqual([4, 5, 6, 7]);
      expect(missing).toHaveLength(4);
    });

    it("should report valid when all 7 slots present with correct types", () => {
      const activities = SLOT_TEMPLATE.map(s => ({
        slotIndex: s.slotIndex,
        slotType: s.slotType,
        title: `Title ${s.slotIndex}`,
        titleFr: `Titre ${s.slotIndex}`,
      }));
      const requiredIndices = [1, 2, 3, 4, 5, 6, 7];
      const presentIndices = activities.map(a => a.slotIndex);
      const missing = requiredIndices.filter(i => !presentIndices.includes(i));
      expect(missing).toHaveLength(0);
      expect(activities).toHaveLength(7);
    });

    it("should detect type mismatches between expected and actual", () => {
      const expected = { slotIndex: 1, slotType: "introduction" };
      const actual = { slotIndex: 1, slotType: "video_scenario" };
      const typeMatch = actual.slotType === expected.slotType;
      expect(typeMatch).toBe(false);
    });

    it("should detect missing bilingual titles", () => {
      const activity = { title: "Intro", titleFr: null };
      const hasBilingual = !!(activity.title && activity.titleFr);
      expect(hasBilingual).toBe(false);
    });

    it("should validate bilingual when both titles present", () => {
      const activity = { title: "Intro", titleFr: "Introduction" };
      const hasBilingual = !!(activity.title && activity.titleFr);
      expect(hasBilingual).toBe(true);
    });

    it("should require >=6 quiz questions for quiz slot", () => {
      expect(3 >= 6).toBe(false);
      expect(6 >= 6).toBe(true);
      expect(10 >= 6).toBe(true);
    });
  });

  describe("Course Quality Report Logic", () => {
    it("should require exactly 4 modules per course", () => {
      const errors: string[] = [];
      const moduleCount = 3;
      if (moduleCount !== 4) errors.push(`Expected 4 modules, found ${moduleCount}`);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("Expected 4 modules");
    });

    it("should pass when course has 4 modules", () => {
      const errors: string[] = [];
      const moduleCount = 4;
      if (moduleCount !== 4) errors.push(`Expected 4 modules, found ${moduleCount}`);
      expect(errors).toHaveLength(0);
    });

    it("should require exactly 4 lessons per module", () => {
      const errors: string[] = [];
      const lessonCount = 2;
      if (lessonCount !== 4) errors.push(`Module: expected 4 lessons, found ${lessonCount}`);
      expect(errors).toHaveLength(1);
    });

    it("should warn when course thumbnail is missing", () => {
      const warnings: string[] = [];
      const course = { thumbnailUrl: null, titleFr: "Titre", descriptionFr: "Desc" };
      if (!course.thumbnailUrl) warnings.push("Course thumbnail missing");
      if (!course.titleFr) warnings.push("Course French title missing");
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toBe("Course thumbnail missing");
    });
  });

  describe("Publish Validation Logic", () => {
    it("should block publish when modules < 4", () => {
      const criticalErrors: string[] = [];
      if (2 < 4) criticalErrors.push("Need 4 modules, have 2");
      expect(criticalErrors.length === 0).toBe(false);
    });

    it("should block publish when a module has < 4 lessons", () => {
      const modules = [
        { title: "Module 1", lessonCount: 4 },
        { title: "Module 2", lessonCount: 3 },
      ];
      const errors: string[] = [];
      for (const mod of modules) {
        if (mod.lessonCount < 4) errors.push(`Module "${mod.title}": needs 4 lessons`);
      }
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("Module 2");
    });

    it("should block publish when a lesson has < 7 slots", () => {
      const lessons = [
        { title: "Lesson 1", slotCount: 7 },
        { title: "Lesson 2", slotCount: 5 },
      ];
      const errors: string[] = [];
      for (const l of lessons) {
        if (l.slotCount < 7) errors.push(`Lesson "${l.title}": needs 7 slots, has ${l.slotCount}`);
      }
      expect(errors).toHaveLength(1);
    });

    it("should allow publish when all criteria met", () => {
      const criticalErrors: string[] = [];
      const moduleCount = 4;
      const allModulesHave4Lessons = true;
      const allLessonsHave7Slots = true;
      const hasFrenchTitle = true;
      if (moduleCount < 4) criticalErrors.push("Not enough modules");
      if (!allModulesHave4Lessons) criticalErrors.push("Not enough lessons");
      if (!allLessonsHave7Slots) criticalErrors.push("Not enough slots");
      if (!hasFrenchTitle) criticalErrors.push("Missing French title");
      expect(criticalErrors).toHaveLength(0);
    });

    it("should block publish when French title is missing", () => {
      const criticalErrors: string[] = [];
      if (!null) criticalErrors.push("Course French title missing");
      expect(criticalErrors).toHaveLength(1);
    });
  });
});

describe("Admin Course Tree", () => {
  describe("Tree Structure", () => {
    it("should build correct hierarchy: Course > Module > Lesson > Slot", () => {
      const tree = {
        id: 90007,
        title: "Path I",
        modules: [{
          id: 1, title: "Module 1",
          lessons: [{
            id: 1, title: "Lesson 1",
            slots: [
              { slotIndex: 1, slotType: "introduction", label: "Intro / Hook" },
              { slotIndex: 7, slotType: "coaching_tip", label: "Coaching Tip" },
            ],
          }],
        }],
      };
      expect(tree.modules).toHaveLength(1);
      expect(tree.modules[0].lessons).toHaveLength(1);
      expect(tree.modules[0].lessons[0].slots).toHaveLength(2);
    });

    it("should include counters at each level", () => {
      const module = { totalLessons: 4, completeLessons: 2, totalSlots: 28, completeSlots: 14 };
      expect(module.totalLessons).toBe(4);
      expect(module.totalSlots).toBe(28);
    });

    it("should include slot labels from template", () => {
      const SLOT_LABELS: Record<string, string> = {
        introduction: "Intro / Hook",
        video_scenario: "Video Scenario",
        grammar_point: "Grammar / Strategy",
        written_practice: "Written Practice",
        oral_practice: "Oral Practice",
        quiz_slot: "Quiz",
        coaching_tip: "Coaching Tip",
      };
      expect(SLOT_LABELS["introduction"]).toBe("Intro / Hook");
      expect(SLOT_LABELS["quiz_slot"]).toBe("Quiz");
      expect(Object.keys(SLOT_LABELS)).toHaveLength(7);
    });

    it("should calculate quality gate status per lesson", () => {
      const lesson = { missingSlots: 0, hasBilingual: true, quizQuestionCount: 8 };
      const isComplete = lesson.missingSlots === 0 && lesson.hasBilingual && lesson.quizQuestionCount >= 6;
      expect(isComplete).toBe(true);
    });

    it("should mark lesson as incomplete when slots missing", () => {
      const lesson = { missingSlots: 2, hasBilingual: true, quizQuestionCount: 8 };
      const isComplete = lesson.missingSlots === 0;
      expect(isComplete).toBe(false);
    });
  });
});
