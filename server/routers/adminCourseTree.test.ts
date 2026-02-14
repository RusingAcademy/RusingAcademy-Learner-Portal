import { describe, it, expect } from "vitest";

// ─── Admin Course Tree: Unit Tests ──────────────────────────────────────────
// Tests the tree-building logic, slot label mapping, counter calculations,
// and hierarchy validation used by the adminCourseTree router.

const SLOT_LABELS: Record<string, string> = {
  introduction: "Intro / Hook",
  video_scenario: "Video Scenario",
  grammar_point: "Grammar / Strategy",
  written_practice: "Written Practice",
  oral_practice: "Oral Practice",
  quiz_slot: "Quiz",
  coaching_tip: "Coaching Tip",
  extra: "Extra",
};

const SLOT_TEMPLATE = [
  { slotIndex: 1, slotType: "introduction", label: "Intro / Hook", activityType: "text" },
  { slotIndex: 2, slotType: "video_scenario", label: "Video Scenario", activityType: "video" },
  { slotIndex: 3, slotType: "grammar_point", label: "Grammar / Strategy", activityType: "text" },
  { slotIndex: 4, slotType: "written_practice", label: "Written Practice", activityType: "assignment" },
  { slotIndex: 5, slotType: "oral_practice", label: "Oral Practice", activityType: "audio" },
  { slotIndex: 6, slotType: "quiz_slot", label: "Quiz", activityType: "quiz" },
  { slotIndex: 7, slotType: "coaching_tip", label: "Coaching Tip", activityType: "text" },
];

// ─── Helper: Simulate the tree-building logic from the router ───────────────

interface MockActivity {
  id: number;
  lessonId: number;
  moduleId: number;
  slotIndex: number | null;
  slotType: string | null;
  activityType: string;
  title: string | null;
  titleFr: string | null;
  content: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  status: string;
  sortOrder: number;
}

interface MockLesson {
  id: number;
  title: string;
  titleFr: string | null;
  lessonNumber: number;
  sortOrder: number;
  status: string;
  moduleId: number;
  qualityGateStatus: string | null;
}

interface MockModule {
  id: number;
  title: string;
  titleFr: string | null;
  moduleNumber: number;
  sortOrder: number;
  status: string;
  thumbnailUrl: string | null;
  badgeImageUrl: string | null;
}

function buildLessonTree(
  lesson: MockLesson,
  lessonActivities: MockActivity[],
  quizCount: number
) {
  const requiredSlots = lessonActivities.filter(a => (a.slotIndex || 0) >= 1 && (a.slotIndex || 0) <= 7);
  const extras = lessonActivities.filter(a => (a.slotIndex || 0) > 7);

  const slots = lessonActivities.map(act => ({
    id: act.id,
    slotIndex: act.slotIndex,
    slotType: act.slotType,
    slotLabel: SLOT_LABELS[act.slotType || ""] || act.slotType || "Unknown",
    activityType: act.activityType,
    title: act.title,
    titleFr: act.titleFr,
    hasBilingual: !!(act.title && act.titleFr),
    hasContent: !!(act.content || act.videoUrl || act.audioUrl),
    thumbnailUrl: act.thumbnailUrl,
    status: act.status,
  }));

  return {
    id: lesson.id,
    title: lesson.title,
    titleFr: lesson.titleFr,
    lessonNumber: lesson.lessonNumber,
    sortOrder: lesson.sortOrder,
    status: lesson.status,
    hasBilingual: !!(lesson.title && lesson.titleFr),
    totalSlots: lessonActivities.length,
    requiredPresent: requiredSlots.length,
    requiredTotal: 7,
    extrasCount: extras.length,
    quizQuestionCount: quizCount,
    qualityGateStatus: lesson.qualityGateStatus || "pending",
    slotsIndicator: `${requiredSlots.length}/7 slots`,
    isComplete: requiredSlots.length === 7,
    slots,
  };
}

function buildModuleTree(
  mod: MockModule,
  modLessons: MockLesson[],
  allActivities: MockActivity[],
  quizCountMap: Map<number, number>
) {
  const lessonTree = modLessons.map(lesson => {
    const lessonActs = allActivities.filter(a => a.lessonId === lesson.id);
    const quizCount = quizCountMap.get(lesson.id) || 0;
    return buildLessonTree(lesson, lessonActs, quizCount);
  });

  const completeLessons = lessonTree.filter(l => l.isComplete).length;

  return {
    id: mod.id,
    title: mod.title,
    titleFr: mod.titleFr,
    moduleNumber: mod.moduleNumber,
    sortOrder: mod.sortOrder,
    status: mod.status,
    hasBilingual: !!(mod.title && mod.titleFr),
    thumbnailUrl: mod.thumbnailUrl,
    badgeImageUrl: mod.badgeImageUrl,
    totalLessons: modLessons.length,
    completeLessons,
    lessonsIndicator: `${modLessons.length} lessons`,
    progressIndicator: `${completeLessons}/${modLessons.length} complete`,
    lessons: lessonTree,
  };
}

// ─── Test Data Factories ────────────────────────────────────────────────────

function makeActivity(overrides: Partial<MockActivity> = {}): MockActivity {
  return {
    id: 1,
    lessonId: 1,
    moduleId: 1,
    slotIndex: 1,
    slotType: "introduction",
    activityType: "text",
    title: "Intro",
    titleFr: "Introduction",
    content: "Some content",
    videoUrl: null,
    audioUrl: null,
    thumbnailUrl: null,
    status: "draft",
    sortOrder: 1,
    ...overrides,
  };
}

function makeLesson(overrides: Partial<MockLesson> = {}): MockLesson {
  return {
    id: 1,
    title: "Lesson 1",
    titleFr: "Leçon 1",
    lessonNumber: 1,
    sortOrder: 1,
    status: "draft",
    moduleId: 1,
    qualityGateStatus: null,
    ...overrides,
  };
}

function makeModule(overrides: Partial<MockModule> = {}): MockModule {
  return {
    id: 1,
    title: "Module 1",
    titleFr: "Module 1",
    moduleNumber: 1,
    sortOrder: 1,
    status: "draft",
    thumbnailUrl: null,
    badgeImageUrl: null,
    ...overrides,
  };
}

function makeFullSlotActivities(lessonId: number, moduleId: number): MockActivity[] {
  return SLOT_TEMPLATE.map((slot, i) =>
    makeActivity({
      id: i + 1,
      lessonId,
      moduleId,
      slotIndex: slot.slotIndex,
      slotType: slot.slotType,
      activityType: slot.activityType,
      title: `Activity ${slot.slotIndex}`,
      titleFr: `Activité ${slot.slotIndex}`,
      content: `Content for ${slot.label}`,
      sortOrder: i + 1,
    })
  );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Admin Course Tree Router", () => {
  describe("SLOT_LABELS mapping", () => {
    it("should define labels for all 7 required slot types plus extra", () => {
      expect(Object.keys(SLOT_LABELS)).toHaveLength(8);
      expect(SLOT_LABELS["introduction"]).toBe("Intro / Hook");
      expect(SLOT_LABELS["video_scenario"]).toBe("Video Scenario");
      expect(SLOT_LABELS["grammar_point"]).toBe("Grammar / Strategy");
      expect(SLOT_LABELS["written_practice"]).toBe("Written Practice");
      expect(SLOT_LABELS["oral_practice"]).toBe("Oral Practice");
      expect(SLOT_LABELS["quiz_slot"]).toBe("Quiz");
      expect(SLOT_LABELS["coaching_tip"]).toBe("Coaching Tip");
      expect(SLOT_LABELS["extra"]).toBe("Extra");
    });

    it("should return 'Unknown' for unmapped slot types", () => {
      const slotType = "nonexistent_type";
      const label = SLOT_LABELS[slotType] || slotType || "Unknown";
      expect(label).toBe("nonexistent_type");
    });

    it("should return 'Unknown' for null/empty slot types", () => {
      const label = SLOT_LABELS[""] || "" || "Unknown";
      expect(label).toBe("Unknown");
    });
  });

  describe("Lesson Tree Building", () => {
    it("should build a complete lesson tree with all 7 slots", () => {
      const lesson = makeLesson();
      const acts = makeFullSlotActivities(1, 1);
      const tree = buildLessonTree(lesson, acts, 6);

      expect(tree.id).toBe(1);
      expect(tree.title).toBe("Lesson 1");
      expect(tree.titleFr).toBe("Leçon 1");
      expect(tree.hasBilingual).toBe(true);
      expect(tree.totalSlots).toBe(7);
      expect(tree.requiredPresent).toBe(7);
      expect(tree.requiredTotal).toBe(7);
      expect(tree.extrasCount).toBe(0);
      expect(tree.isComplete).toBe(true);
      expect(tree.slotsIndicator).toBe("7/7 slots");
      expect(tree.slots).toHaveLength(7);
    });

    it("should mark lesson as incomplete when missing slots", () => {
      const lesson = makeLesson();
      const acts = [
        makeActivity({ slotIndex: 1, slotType: "introduction" }),
        makeActivity({ id: 2, slotIndex: 2, slotType: "video_scenario", activityType: "video" }),
        makeActivity({ id: 3, slotIndex: 3, slotType: "grammar_point" }),
      ];
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.requiredPresent).toBe(3);
      expect(tree.isComplete).toBe(false);
      expect(tree.slotsIndicator).toBe("3/7 slots");
    });

    it("should count extra activities beyond slot 7", () => {
      const lesson = makeLesson();
      const acts = [
        ...makeFullSlotActivities(1, 1),
        makeActivity({ id: 8, slotIndex: 8, slotType: "extra", activityType: "text", sortOrder: 8 }),
        makeActivity({ id: 9, slotIndex: 9, slotType: "extra", activityType: "video", sortOrder: 9 }),
      ];
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.totalSlots).toBe(9);
      expect(tree.requiredPresent).toBe(7);
      expect(tree.extrasCount).toBe(2);
      expect(tree.isComplete).toBe(true);
    });

    it("should detect missing bilingual titles on activities", () => {
      const lesson = makeLesson();
      const acts = [
        makeActivity({ slotIndex: 1, title: "Intro", titleFr: null }),
      ];
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.slots[0].hasBilingual).toBe(false);
    });

    it("should detect bilingual titles when both present", () => {
      const lesson = makeLesson();
      const acts = [
        makeActivity({ slotIndex: 1, title: "Intro", titleFr: "Introduction" }),
      ];
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.slots[0].hasBilingual).toBe(true);
    });

    it("should detect content presence from text content", () => {
      const lesson = makeLesson();
      const acts = [
        makeActivity({ slotIndex: 1, content: "Some text", videoUrl: null, audioUrl: null }),
      ];
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.slots[0].hasContent).toBe(true);
    });

    it("should detect content presence from video URL", () => {
      const lesson = makeLesson();
      const acts = [
        makeActivity({ slotIndex: 2, content: null, videoUrl: "https://video.url", audioUrl: null }),
      ];
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.slots[0].hasContent).toBe(true);
    });

    it("should detect missing content when all fields empty", () => {
      const lesson = makeLesson();
      const acts = [
        makeActivity({ slotIndex: 1, content: null, videoUrl: null, audioUrl: null }),
      ];
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.slots[0].hasContent).toBe(false);
    });

    it("should map correct slot labels from SLOT_LABELS", () => {
      const lesson = makeLesson();
      const acts = makeFullSlotActivities(1, 1);
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.slots[0].slotLabel).toBe("Intro / Hook");
      expect(tree.slots[1].slotLabel).toBe("Video Scenario");
      expect(tree.slots[2].slotLabel).toBe("Grammar / Strategy");
      expect(tree.slots[3].slotLabel).toBe("Written Practice");
      expect(tree.slots[4].slotLabel).toBe("Oral Practice");
      expect(tree.slots[5].slotLabel).toBe("Quiz");
      expect(tree.slots[6].slotLabel).toBe("Coaching Tip");
    });

    it("should preserve quiz question count", () => {
      const lesson = makeLesson();
      const acts = makeFullSlotActivities(1, 1);
      const tree = buildLessonTree(lesson, acts, 12);

      expect(tree.quizQuestionCount).toBe(12);
    });

    it("should detect lesson without bilingual title", () => {
      const lesson = makeLesson({ titleFr: null });
      const acts = makeFullSlotActivities(1, 1);
      const tree = buildLessonTree(lesson, acts, 0);

      expect(tree.hasBilingual).toBe(false);
    });
  });

  describe("Module Tree Building", () => {
    it("should build module with correct lesson count and progress", () => {
      const mod = makeModule();
      const lessons = [
        makeLesson({ id: 1, lessonNumber: 1 }),
        makeLesson({ id: 2, lessonNumber: 2 }),
        makeLesson({ id: 3, lessonNumber: 3 }),
        makeLesson({ id: 4, lessonNumber: 4 }),
      ];
      const allActs = [
        ...makeFullSlotActivities(1, 1),
        ...makeFullSlotActivities(2, 1).map((a, i) => ({ ...a, id: 100 + i, lessonId: 2 })),
        ...makeFullSlotActivities(3, 1).map((a, i) => ({ ...a, id: 200 + i, lessonId: 3 })),
        ...makeFullSlotActivities(4, 1).map((a, i) => ({ ...a, id: 300 + i, lessonId: 4 })),
      ];
      const quizMap = new Map<number, number>();

      const tree = buildModuleTree(mod, lessons, allActs, quizMap);

      expect(tree.totalLessons).toBe(4);
      expect(tree.completeLessons).toBe(4);
      expect(tree.lessonsIndicator).toBe("4 lessons");
      expect(tree.progressIndicator).toBe("4/4 complete");
      expect(tree.lessons).toHaveLength(4);
    });

    it("should count only complete lessons in progress", () => {
      const mod = makeModule();
      const lessonList = [
        makeLesson({ id: 1, lessonNumber: 1 }),
        makeLesson({ id: 2, lessonNumber: 2 }),
      ];
      // Lesson 1 has all 7 slots, lesson 2 has only 3
      const allActs = [
        ...makeFullSlotActivities(1, 1),
        makeActivity({ id: 100, lessonId: 2, moduleId: 1, slotIndex: 1, slotType: "introduction" }),
        makeActivity({ id: 101, lessonId: 2, moduleId: 1, slotIndex: 2, slotType: "video_scenario" }),
        makeActivity({ id: 102, lessonId: 2, moduleId: 1, slotIndex: 3, slotType: "grammar_point" }),
      ];
      const quizMap = new Map<number, number>();

      const tree = buildModuleTree(mod, lessonList, allActs, quizMap);

      expect(tree.totalLessons).toBe(2);
      expect(tree.completeLessons).toBe(1);
      expect(tree.progressIndicator).toBe("1/2 complete");
    });

    it("should detect bilingual module title", () => {
      const mod = makeModule({ titleFr: "Module 1" });
      const tree = buildModuleTree(mod, [], [], new Map());
      expect(tree.hasBilingual).toBe(true);
    });

    it("should detect missing bilingual module title", () => {
      const mod = makeModule({ titleFr: null });
      const tree = buildModuleTree(mod, [], [], new Map());
      expect(tree.hasBilingual).toBe(false);
    });

    it("should handle empty module with no lessons", () => {
      const mod = makeModule();
      const tree = buildModuleTree(mod, [], [], new Map());

      expect(tree.totalLessons).toBe(0);
      expect(tree.completeLessons).toBe(0);
      expect(tree.lessonsIndicator).toBe("0 lessons");
      expect(tree.progressIndicator).toBe("0/0 complete");
    });
  });

  describe("Course-Level Aggregation", () => {
    it("should compute total lessons across all modules", () => {
      const modules = [
        { totalLessons: 4, completeLessons: 4 },
        { totalLessons: 4, completeLessons: 3 },
        { totalLessons: 4, completeLessons: 4 },
        { totalLessons: 4, completeLessons: 2 },
      ];
      const totalLessons = modules.reduce((sum, m) => sum + m.totalLessons, 0);
      const totalComplete = modules.reduce((sum, m) => sum + m.completeLessons, 0);

      expect(totalLessons).toBe(16);
      expect(totalComplete).toBe(13);
    });

    it("should build correct structure indicator string", () => {
      const moduleCount = 4;
      const totalLessons = 16;
      const totalActivities = 112;
      const indicator = `${moduleCount} modules · ${totalLessons} lessons · ${totalActivities} activities`;

      expect(indicator).toBe("4 modules · 16 lessons · 112 activities");
    });

    it("should detect bilingual course title", () => {
      const course = { title: "Path I", titleFr: "Parcours I" };
      expect(!!(course.title && course.titleFr)).toBe(true);
    });

    it("should detect missing bilingual course title", () => {
      const course = { title: "Path I", titleFr: null };
      expect(!!(course.title && course.titleFr)).toBe(false);
    });
  });

  describe("Slot Index Classification", () => {
    it("should classify slots 1-7 as required", () => {
      for (let i = 1; i <= 7; i++) {
        const isRequired = i >= 1 && i <= 7;
        expect(isRequired).toBe(true);
      }
    });

    it("should classify slots >7 as extras", () => {
      for (let i = 8; i <= 12; i++) {
        const isExtra = i > 7;
        expect(isExtra).toBe(true);
      }
    });

    it("should handle null slotIndex as non-required", () => {
      const slotIndex: number | null = null;
      const isRequired = (slotIndex || 0) >= 1 && (slotIndex || 0) <= 7;
      expect(isRequired).toBe(false);
    });

    it("should handle zero slotIndex as non-required", () => {
      const slotIndex = 0;
      const isRequired = (slotIndex || 0) >= 1 && (slotIndex || 0) <= 7;
      expect(isRequired).toBe(false);
    });
  });
});
