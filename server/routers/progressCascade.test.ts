import { describe, it, expect } from "vitest";

// ─── Progress Cascade: Unit Tests ──────────────────────────────────────────
// Tests the cascade logic: Course → Modules → Lessons → Slots
// with progress calculation, status derivation, and edge cases.

// ─── 7-Slot Template Labels ───
const SLOT_LABELS: Record<number, { type: string; label: string; labelFr: string }> = {
  1: { type: "introduction", label: "Introduction", labelFr: "Introduction" },
  2: { type: "video", label: "Video", labelFr: "Vidéo" },
  3: { type: "grammar", label: "Grammar", labelFr: "Grammaire" },
  4: { type: "written_practice", label: "Written Practice", labelFr: "Pratique écrite" },
  5: { type: "oral_practice", label: "Oral Practice", labelFr: "Pratique orale" },
  6: { type: "quiz", label: "Quiz", labelFr: "Quiz" },
  7: { type: "coaching_tip", label: "Coaching Tip", labelFr: "Conseil coaching" },
};

// ─── Types matching the router ───
interface SlotCascade {
  slotIndex: number;
  activityId: number | null;
  type: string;
  title: string;
  titleFr: string | null;
  status: "empty" | "not_started" | "in_progress" | "completed";
  estimatedMinutes: number | null;
}

interface LessonCascade {
  lessonId: number;
  title: string;
  titleFr: string | null;
  sortOrder: number;
  totalSlots: number;
  completedSlots: number;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed";
  slots: SlotCascade[];
}

interface ModuleCascade {
  moduleId: number;
  title: string;
  titleFr: string | null;
  sortOrder: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed";
  lessons: LessonCascade[];
}

interface CourseCascade {
  courseId: number;
  title: string;
  titleFr: string | null;
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalSlots: number;
  completedSlots: number;
  progressPercent: number;
  status: "not_started" | "in_progress" | "completed";
  modules: ModuleCascade[];
}

// ─── Simulated cascade builder (mirrors router logic) ───
interface MockActivity {
  id: number;
  lessonId: number;
  slotIndex: number;
  slotType: string;
  title: string;
  titleFr: string | null;
  estimatedMinutes: number | null;
  status: string;
}

interface MockProgress {
  activityId: number;
  status: string;
}

interface MockLesson {
  id: number;
  title: string;
  titleFr: string | null;
  moduleId: number;
  sortOrder: number;
}

interface MockModule {
  id: number;
  title: string;
  titleFr: string | null;
  sortOrder: number;
}

function buildCascade(
  courseId: number,
  courseTitle: string,
  modules: MockModule[],
  lessons: MockLesson[],
  activities: MockActivity[],
  progress: MockProgress[]
): CourseCascade {
  const progressByActivity = new Map<number, string>();
  progress.forEach(p => progressByActivity.set(p.activityId, p.status));

  const activitiesByLesson = new Map<number, MockActivity[]>();
  activities.forEach(a => {
    const list = activitiesByLesson.get(a.lessonId) || [];
    list.push(a);
    activitiesByLesson.set(a.lessonId, list);
  });

  const lessonsByModule = new Map<number, MockLesson[]>();
  lessons.forEach(l => {
    const list = lessonsByModule.get(l.moduleId) || [];
    list.push(l);
    lessonsByModule.set(l.moduleId, list);
  });

  let totalSlotsAll = 0;
  let completedSlotsAll = 0;
  let totalLessonsAll = 0;
  let completedLessonsAll = 0;

  const moduleCascades: ModuleCascade[] = modules.map(mod => {
    const modLessons = lessonsByModule.get(mod.id) || [];
    let modCompletedLessons = 0;

    const lessonCascades: LessonCascade[] = modLessons.map(les => {
      const lesActivities = activitiesByLesson.get(les.id) || [];

      const slots: SlotCascade[] = [];
      for (let i = 1; i <= 7; i++) {
        const act = lesActivities.find(a => a.slotIndex === i);
        const slotLabel = SLOT_LABELS[i];
        if (act) {
          const actStatus = progressByActivity.get(act.id);
          slots.push({
            slotIndex: i,
            activityId: act.id,
            type: act.slotType || slotLabel?.type || "unknown",
            title: act.title,
            titleFr: act.titleFr,
            status: actStatus === "completed" ? "completed" : actStatus === "in_progress" ? "in_progress" : "not_started",
            estimatedMinutes: act.estimatedMinutes,
          });
        } else {
          slots.push({
            slotIndex: i,
            activityId: null,
            type: slotLabel?.type || "unknown",
            title: slotLabel?.label || `Slot ${i}`,
            titleFr: slotLabel?.labelFr || null,
            status: "empty",
            estimatedMinutes: null,
          });
        }
      }

      // Add extras (slotIndex > 7)
      lesActivities
        .filter(a => a.slotIndex > 7)
        .forEach(act => {
          const actStatus = progressByActivity.get(act.id);
          slots.push({
            slotIndex: act.slotIndex,
            activityId: act.id,
            type: act.slotType || "extra",
            title: act.title,
            titleFr: act.titleFr,
            status: actStatus === "completed" ? "completed" : actStatus === "in_progress" ? "in_progress" : "not_started",
            estimatedMinutes: act.estimatedMinutes,
          });
        });

      const filledSlots = slots.filter(s => s.status !== "empty");
      const completedSlots = filledSlots.filter(s => s.status === "completed");
      const lessonPercent = filledSlots.length > 0
        ? Math.round((completedSlots.length / filledSlots.length) * 100)
        : 0;
      const lessonStatus: "not_started" | "in_progress" | "completed" =
        completedSlots.length === 0 ? "not_started" :
        completedSlots.length >= filledSlots.length ? "completed" : "in_progress";

      totalSlotsAll += filledSlots.length;
      completedSlotsAll += completedSlots.length;

      if (lessonStatus === "completed") modCompletedLessons++;

      return {
        lessonId: les.id,
        title: les.title,
        titleFr: les.titleFr,
        sortOrder: les.sortOrder,
        totalSlots: filledSlots.length,
        completedSlots: completedSlots.length,
        progressPercent: lessonPercent,
        status: lessonStatus,
        slots,
      };
    });

    totalLessonsAll += modLessons.length;
    completedLessonsAll += modCompletedLessons;

    const modPercent = modLessons.length > 0
      ? Math.round((modCompletedLessons / modLessons.length) * 100)
      : 0;
    const modStatus: "not_started" | "in_progress" | "completed" =
      modCompletedLessons === 0 ? "not_started" :
      modCompletedLessons >= modLessons.length ? "completed" : "in_progress";

    return {
      moduleId: mod.id,
      title: mod.title,
      titleFr: mod.titleFr,
      sortOrder: mod.sortOrder,
      totalLessons: modLessons.length,
      completedLessons: modCompletedLessons,
      progressPercent: modPercent,
      status: modStatus,
      lessons: lessonCascades,
    };
  });

  const completedModules = moduleCascades.filter(m => m.status === "completed").length;
  const coursePercent = totalLessonsAll > 0
    ? Math.round((completedLessonsAll / totalLessonsAll) * 100)
    : 0;
  const courseStatus: "not_started" | "in_progress" | "completed" =
    completedLessonsAll === 0 ? "not_started" :
    completedLessonsAll >= totalLessonsAll ? "completed" : "in_progress";

  return {
    courseId,
    title: courseTitle,
    titleFr: null,
    totalModules: modules.length,
    completedModules,
    totalLessons: totalLessonsAll,
    completedLessons: completedLessonsAll,
    totalSlots: totalSlotsAll,
    completedSlots: completedSlotsAll,
    progressPercent: coursePercent,
    status: courseStatus,
    modules: moduleCascades,
  };
}

// ─── Helper: Create a full lesson with 7 activities ───
function createFullLesson(
  lessonId: number,
  moduleId: number,
  sortOrder: number,
  title: string
): { lesson: MockLesson; activities: MockActivity[] } {
  const acts: MockActivity[] = [];
  for (let i = 1; i <= 7; i++) {
    const slotLabel = SLOT_LABELS[i];
    acts.push({
      id: lessonId * 100 + i,
      lessonId,
      slotIndex: i,
      slotType: slotLabel.type,
      title: `${title} - ${slotLabel.label}`,
      titleFr: `${title} - ${slotLabel.labelFr}`,
      estimatedMinutes: 5 + i,
      status: "published",
    });
  }
  return {
    lesson: { id: lessonId, title, titleFr: `${title} (FR)`, moduleId, sortOrder },
    activities: acts,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════

describe("Progress Cascade — Slot Level", () => {
  it("should return 7 slots per lesson (filled + empty)", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "Lesson 1");
    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      activities,
      []
    );

    expect(cascade.modules[0].lessons[0].slots).toHaveLength(7);
    cascade.modules[0].lessons[0].slots.forEach(slot => {
      expect(slot.status).not.toBe("empty");
      expect(slot.activityId).not.toBeNull();
    });
  });

  it("should mark empty slots when activities are missing", () => {
    const lesson: MockLesson = { id: 1, title: "Lesson 1", titleFr: null, moduleId: 1, sortOrder: 1 };
    // Only slots 1, 2, 3 filled
    const acts: MockActivity[] = [1, 2, 3].map(i => ({
      id: 100 + i, lessonId: 1, slotIndex: i, slotType: SLOT_LABELS[i].type,
      title: `Act ${i}`, titleFr: null, estimatedMinutes: 5, status: "published",
    }));

    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      acts,
      []
    );

    const slots = cascade.modules[0].lessons[0].slots;
    expect(slots).toHaveLength(7);
    expect(slots[0].status).toBe("not_started"); // filled, no progress
    expect(slots[1].status).toBe("not_started");
    expect(slots[2].status).toBe("not_started");
    expect(slots[3].status).toBe("empty"); // slot 4 empty
    expect(slots[4].status).toBe("empty"); // slot 5 empty
    expect(slots[5].status).toBe("empty"); // slot 6 empty
    expect(slots[6].status).toBe("empty"); // slot 7 empty
  });

  it("should mark slots as completed when progress exists", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "Lesson 1");
    const progress: MockProgress[] = [
      { activityId: 101, status: "completed" },
      { activityId: 102, status: "completed" },
      { activityId: 103, status: "in_progress" },
    ];

    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      activities,
      progress
    );

    const slots = cascade.modules[0].lessons[0].slots;
    expect(slots[0].status).toBe("completed");
    expect(slots[1].status).toBe("completed");
    expect(slots[2].status).toBe("in_progress");
    expect(slots[3].status).toBe("not_started");
  });

  it("should include extra slots (slotIndex > 7)", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "Lesson 1");
    activities.push({
      id: 108, lessonId: 1, slotIndex: 8, slotType: "extra",
      title: "Bonus Activity", titleFr: "Activité bonus",
      estimatedMinutes: 10, status: "published",
    });

    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      activities,
      []
    );

    const slots = cascade.modules[0].lessons[0].slots;
    expect(slots).toHaveLength(8);
    expect(slots[7].slotIndex).toBe(8);
    expect(slots[7].type).toBe("extra");
    expect(slots[7].title).toBe("Bonus Activity");
  });

  it("should use SLOT_LABELS for empty slot titles", () => {
    const lesson: MockLesson = { id: 1, title: "Lesson 1", titleFr: null, moduleId: 1, sortOrder: 1 };
    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      [], // no activities
      []
    );

    const slots = cascade.modules[0].lessons[0].slots;
    expect(slots[0].title).toBe("Introduction");
    expect(slots[1].title).toBe("Video");
    expect(slots[5].title).toBe("Quiz");
    expect(slots[6].title).toBe("Coaching Tip");
    expect(slots[0].titleFr).toBe("Introduction");
    expect(slots[1].titleFr).toBe("Vidéo");
  });
});

describe("Progress Cascade — Lesson Level", () => {
  it("should calculate lesson progress from completed slots", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "Lesson 1");
    // Complete 3 out of 7 slots
    const progress: MockProgress[] = [
      { activityId: 101, status: "completed" },
      { activityId: 102, status: "completed" },
      { activityId: 103, status: "completed" },
    ];

    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      activities,
      progress
    );

    const les = cascade.modules[0].lessons[0];
    expect(les.totalSlots).toBe(7);
    expect(les.completedSlots).toBe(3);
    expect(les.progressPercent).toBe(43); // Math.round(3/7*100)
    expect(les.status).toBe("in_progress");
  });

  it("should mark lesson as completed when all slots are done", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "Lesson 1");
    const progress: MockProgress[] = activities.map(a => ({
      activityId: a.id, status: "completed",
    }));

    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      activities,
      progress
    );

    const les = cascade.modules[0].lessons[0];
    expect(les.completedSlots).toBe(7);
    expect(les.progressPercent).toBe(100);
    expect(les.status).toBe("completed");
  });

  it("should mark lesson as not_started when no progress exists", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "Lesson 1");
    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      activities,
      []
    );

    const les = cascade.modules[0].lessons[0];
    expect(les.completedSlots).toBe(0);
    expect(les.progressPercent).toBe(0);
    expect(les.status).toBe("not_started");
  });

  it("should handle lesson with no activities (0% progress)", () => {
    const lesson: MockLesson = { id: 1, title: "Empty Lesson", titleFr: null, moduleId: 1, sortOrder: 1 };
    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      [],
      []
    );

    const les = cascade.modules[0].lessons[0];
    expect(les.totalSlots).toBe(0);
    expect(les.completedSlots).toBe(0);
    expect(les.progressPercent).toBe(0);
    expect(les.status).toBe("not_started");
  });

  it("should only count filled slots (not empty) for progress", () => {
    const lesson: MockLesson = { id: 1, title: "Lesson 1", titleFr: null, moduleId: 1, sortOrder: 1 };
    // Only 3 slots filled
    const acts: MockActivity[] = [1, 2, 3].map(i => ({
      id: 100 + i, lessonId: 1, slotIndex: i, slotType: SLOT_LABELS[i].type,
      title: `Act ${i}`, titleFr: null, estimatedMinutes: 5, status: "published",
    }));
    // Complete 2 out of 3 filled slots
    const progress: MockProgress[] = [
      { activityId: 101, status: "completed" },
      { activityId: 102, status: "completed" },
    ];

    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      acts,
      progress
    );

    const les = cascade.modules[0].lessons[0];
    expect(les.totalSlots).toBe(3); // Only filled slots count
    expect(les.completedSlots).toBe(2);
    expect(les.progressPercent).toBe(67); // Math.round(2/3*100)
    expect(les.status).toBe("in_progress");
  });
});

describe("Progress Cascade — Module Level", () => {
  it("should calculate module progress from completed lessons", () => {
    const mod: MockModule = { id: 1, title: "Module 1", titleFr: null, sortOrder: 1 };
    const l1 = createFullLesson(1, 1, 1, "Lesson 1.1");
    const l2 = createFullLesson(2, 1, 2, "Lesson 1.2");
    const l3 = createFullLesson(3, 1, 3, "Lesson 1.3");
    const l4 = createFullLesson(4, 1, 4, "Lesson 1.4");

    // Complete all slots in lessons 1 and 2
    const progress: MockProgress[] = [
      ...l1.activities.map(a => ({ activityId: a.id, status: "completed" })),
      ...l2.activities.map(a => ({ activityId: a.id, status: "completed" })),
    ];

    const cascade = buildCascade(
      1, "Course 1",
      [mod],
      [l1.lesson, l2.lesson, l3.lesson, l4.lesson],
      [...l1.activities, ...l2.activities, ...l3.activities, ...l4.activities],
      progress
    );

    const m = cascade.modules[0];
    expect(m.totalLessons).toBe(4);
    expect(m.completedLessons).toBe(2);
    expect(m.progressPercent).toBe(50);
    expect(m.status).toBe("in_progress");
  });

  it("should mark module as completed when all lessons are done", () => {
    const mod: MockModule = { id: 1, title: "Module 1", titleFr: null, sortOrder: 1 };
    const l1 = createFullLesson(1, 1, 1, "Lesson 1.1");
    const l2 = createFullLesson(2, 1, 2, "Lesson 1.2");

    const progress: MockProgress[] = [
      ...l1.activities.map(a => ({ activityId: a.id, status: "completed" })),
      ...l2.activities.map(a => ({ activityId: a.id, status: "completed" })),
    ];

    const cascade = buildCascade(
      1, "Course 1",
      [mod],
      [l1.lesson, l2.lesson],
      [...l1.activities, ...l2.activities],
      progress
    );

    const m = cascade.modules[0];
    expect(m.completedLessons).toBe(2);
    expect(m.progressPercent).toBe(100);
    expect(m.status).toBe("completed");
  });

  it("should mark module as not_started when no lessons are completed", () => {
    const mod: MockModule = { id: 1, title: "Module 1", titleFr: null, sortOrder: 1 };
    const l1 = createFullLesson(1, 1, 1, "Lesson 1.1");
    const l2 = createFullLesson(2, 1, 2, "Lesson 1.2");

    const cascade = buildCascade(
      1, "Course 1",
      [mod],
      [l1.lesson, l2.lesson],
      [...l1.activities, ...l2.activities],
      []
    );

    const m = cascade.modules[0];
    expect(m.completedLessons).toBe(0);
    expect(m.progressPercent).toBe(0);
    expect(m.status).toBe("not_started");
  });
});

describe("Progress Cascade — Course Level", () => {
  it("should aggregate all modules into course-level progress", () => {
    const mod1: MockModule = { id: 1, title: "Module 1", titleFr: null, sortOrder: 1 };
    const mod2: MockModule = { id: 2, title: "Module 2", titleFr: null, sortOrder: 2 };

    const l1 = createFullLesson(1, 1, 1, "L1.1");
    const l2 = createFullLesson(2, 1, 2, "L1.2");
    const l3 = createFullLesson(3, 2, 1, "L2.1");
    const l4 = createFullLesson(4, 2, 2, "L2.2");

    // Complete module 1 fully, module 2 partially
    const progress: MockProgress[] = [
      ...l1.activities.map(a => ({ activityId: a.id, status: "completed" })),
      ...l2.activities.map(a => ({ activityId: a.id, status: "completed" })),
      ...l3.activities.map(a => ({ activityId: a.id, status: "completed" })),
    ];

    const cascade = buildCascade(
      1, "Course 1",
      [mod1, mod2],
      [l1.lesson, l2.lesson, l3.lesson, l4.lesson],
      [...l1.activities, ...l2.activities, ...l3.activities, ...l4.activities],
      progress
    );

    expect(cascade.totalModules).toBe(2);
    expect(cascade.completedModules).toBe(1); // Only module 1 fully completed
    expect(cascade.totalLessons).toBe(4);
    expect(cascade.completedLessons).toBe(3);
    expect(cascade.totalSlots).toBe(28); // 4 lessons × 7 slots
    expect(cascade.completedSlots).toBe(21); // 3 lessons × 7 slots
    expect(cascade.progressPercent).toBe(75); // 3/4 lessons
    expect(cascade.status).toBe("in_progress");
  });

  it("should mark course as completed when all lessons are done", () => {
    const mod1: MockModule = { id: 1, title: "Module 1", titleFr: null, sortOrder: 1 };
    const l1 = createFullLesson(1, 1, 1, "L1.1");
    const l2 = createFullLesson(2, 1, 2, "L1.2");

    const progress: MockProgress[] = [
      ...l1.activities.map(a => ({ activityId: a.id, status: "completed" })),
      ...l2.activities.map(a => ({ activityId: a.id, status: "completed" })),
    ];

    const cascade = buildCascade(
      1, "Course 1",
      [mod1],
      [l1.lesson, l2.lesson],
      [...l1.activities, ...l2.activities],
      progress
    );

    expect(cascade.completedLessons).toBe(2);
    expect(cascade.totalLessons).toBe(2);
    expect(cascade.progressPercent).toBe(100);
    expect(cascade.status).toBe("completed");
  });

  it("should mark course as not_started when no progress exists", () => {
    const mod1: MockModule = { id: 1, title: "Module 1", titleFr: null, sortOrder: 1 };
    const l1 = createFullLesson(1, 1, 1, "L1.1");

    const cascade = buildCascade(
      1, "Course 1",
      [mod1],
      [l1.lesson],
      l1.activities,
      []
    );

    expect(cascade.progressPercent).toBe(0);
    expect(cascade.status).toBe("not_started");
  });

  it("should handle empty course (no modules)", () => {
    const cascade = buildCascade(1, "Empty Course", [], [], [], []);

    expect(cascade.totalModules).toBe(0);
    expect(cascade.totalLessons).toBe(0);
    expect(cascade.totalSlots).toBe(0);
    expect(cascade.progressPercent).toBe(0);
    expect(cascade.status).toBe("not_started");
    expect(cascade.modules).toHaveLength(0);
  });
});

describe("Progress Cascade — Full Path I Simulation (4 modules × 4 lessons × 7 slots)", () => {
  function createPathI() {
    const modules: MockModule[] = [];
    const allLessons: MockLesson[] = [];
    const allActivities: MockActivity[] = [];

    for (let m = 1; m <= 4; m++) {
      modules.push({ id: m, title: `Module ${m}`, titleFr: `Module ${m} (FR)`, sortOrder: m });
      for (let l = 1; l <= 4; l++) {
        const lessonId = (m - 1) * 4 + l;
        const { lesson, activities } = createFullLesson(lessonId, m, l, `M${m} L${l}`);
        allLessons.push(lesson);
        allActivities.push(...activities);
      }
    }

    return { modules, allLessons, allActivities };
  }

  it("should produce correct totals for Path I structure", () => {
    const { modules, allLessons, allActivities } = createPathI();
    const cascade = buildCascade(1, "Path I", modules, allLessons, allActivities, []);

    expect(cascade.totalModules).toBe(4);
    expect(cascade.totalLessons).toBe(16);
    expect(cascade.totalSlots).toBe(112); // 16 × 7
    expect(cascade.modules).toHaveLength(4);
    cascade.modules.forEach(m => {
      expect(m.totalLessons).toBe(4);
      m.lessons.forEach(l => {
        expect(l.totalSlots).toBe(7);
        expect(l.slots).toHaveLength(7);
      });
    });
  });

  it("should calculate 50% when half of lessons are completed", () => {
    const { modules, allLessons, allActivities } = createPathI();
    // Complete first 8 lessons (modules 1 and 2)
    const progress: MockProgress[] = [];
    for (let lessonId = 1; lessonId <= 8; lessonId++) {
      for (let slot = 1; slot <= 7; slot++) {
        progress.push({ activityId: lessonId * 100 + slot, status: "completed" });
      }
    }

    const cascade = buildCascade(1, "Path I", modules, allLessons, allActivities, progress);

    expect(cascade.completedLessons).toBe(8);
    expect(cascade.completedSlots).toBe(56);
    expect(cascade.progressPercent).toBe(50);
    expect(cascade.status).toBe("in_progress");
    expect(cascade.modules[0].status).toBe("completed");
    expect(cascade.modules[1].status).toBe("completed");
    expect(cascade.modules[2].status).toBe("not_started");
    expect(cascade.modules[3].status).toBe("not_started");
  });

  it("should calculate 100% when all lessons are completed", () => {
    const { modules, allLessons, allActivities } = createPathI();
    const progress: MockProgress[] = allActivities.map(a => ({
      activityId: a.id, status: "completed",
    }));

    const cascade = buildCascade(1, "Path I", modules, allLessons, allActivities, progress);

    expect(cascade.completedLessons).toBe(16);
    expect(cascade.completedSlots).toBe(112);
    expect(cascade.progressPercent).toBe(100);
    expect(cascade.status).toBe("completed");
    expect(cascade.completedModules).toBe(4);
  });

  it("should handle partial progress within a lesson correctly", () => {
    const { modules, allLessons, allActivities } = createPathI();
    // Complete 3 out of 7 slots in lesson 1 only
    const progress: MockProgress[] = [
      { activityId: 101, status: "completed" },
      { activityId: 102, status: "completed" },
      { activityId: 103, status: "completed" },
    ];

    const cascade = buildCascade(1, "Path I", modules, allLessons, allActivities, progress);

    expect(cascade.completedLessons).toBe(0); // No lesson fully completed
    expect(cascade.completedSlots).toBe(3);
    expect(cascade.progressPercent).toBe(0); // 0 lessons completed out of 16
    expect(cascade.status).toBe("not_started"); // No lessons completed = not_started at course level
    expect(cascade.modules[0].lessons[0].completedSlots).toBe(3);
    expect(cascade.modules[0].lessons[0].progressPercent).toBe(43);
    expect(cascade.modules[0].lessons[0].status).toBe("in_progress");
  });
});

describe("Progress Cascade — Edge Cases", () => {
  it("should handle in_progress activity status correctly", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "Lesson 1");
    const progress: MockProgress[] = [
      { activityId: 101, status: "in_progress" },
      { activityId: 102, status: "in_progress" },
    ];

    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      activities,
      progress
    );

    const slots = cascade.modules[0].lessons[0].slots;
    expect(slots[0].status).toBe("in_progress");
    expect(slots[1].status).toBe("in_progress");
    expect(slots[2].status).toBe("not_started");
    // Lesson should be not_started since 0 completed
    expect(cascade.modules[0].lessons[0].status).toBe("not_started");
  });

  it("should handle module with no lessons", () => {
    const mod: MockModule = { id: 1, title: "Empty Module", titleFr: null, sortOrder: 1 };
    const cascade = buildCascade(1, "Course 1", [mod], [], [], []);

    expect(cascade.modules[0].totalLessons).toBe(0);
    expect(cascade.modules[0].completedLessons).toBe(0);
    expect(cascade.modules[0].progressPercent).toBe(0);
    expect(cascade.modules[0].status).toBe("not_started");
  });

  it("should preserve bilingual titles through cascade", () => {
    const mod: MockModule = { id: 1, title: "Module EN", titleFr: "Module FR", sortOrder: 1 };
    const lesson: MockLesson = { id: 1, title: "Lesson EN", titleFr: "Leçon FR", moduleId: 1, sortOrder: 1 };
    const acts: MockActivity[] = [{
      id: 101, lessonId: 1, slotIndex: 1, slotType: "introduction",
      title: "Activity EN", titleFr: "Activité FR", estimatedMinutes: 5, status: "published",
    }];

    const cascade = buildCascade(1, "Course EN", [mod], [lesson], acts, []);

    expect(cascade.modules[0].title).toBe("Module EN");
    expect(cascade.modules[0].titleFr).toBe("Module FR");
    expect(cascade.modules[0].lessons[0].title).toBe("Lesson EN");
    expect(cascade.modules[0].lessons[0].titleFr).toBe("Leçon FR");
    expect(cascade.modules[0].lessons[0].slots[0].title).toBe("Activity EN");
    expect(cascade.modules[0].lessons[0].slots[0].titleFr).toBe("Activité FR");
  });

  it("should correctly count filled vs empty slots for totalSlots", () => {
    const mod: MockModule = { id: 1, title: "Module 1", titleFr: null, sortOrder: 1 };
    const lesson: MockLesson = { id: 1, title: "Lesson 1", titleFr: null, moduleId: 1, sortOrder: 1 };
    // Only 4 out of 7 slots filled
    const acts: MockActivity[] = [1, 2, 5, 6].map(i => ({
      id: 100 + i, lessonId: 1, slotIndex: i, slotType: SLOT_LABELS[i].type,
      title: `Act ${i}`, titleFr: null, estimatedMinutes: 5, status: "published",
    }));

    const cascade = buildCascade(1, "Course 1", [mod], [lesson], acts, []);

    expect(cascade.totalSlots).toBe(4); // Only filled slots
    expect(cascade.modules[0].lessons[0].totalSlots).toBe(4);
    expect(cascade.modules[0].lessons[0].slots).toHaveLength(7); // Always 7 in array
    expect(cascade.modules[0].lessons[0].slots.filter(s => s.status === "empty")).toHaveLength(3);
  });

  it("should handle multiple extra activities beyond slot 7", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "Lesson 1");
    activities.push(
      { id: 108, lessonId: 1, slotIndex: 8, slotType: "extra", title: "Extra 1", titleFr: null, estimatedMinutes: 5, status: "published" },
      { id: 109, lessonId: 1, slotIndex: 9, slotType: "extra", title: "Extra 2", titleFr: null, estimatedMinutes: 5, status: "published" }
    );

    const cascade = buildCascade(
      1, "Course 1",
      [{ id: 1, title: "Module 1", titleFr: null, sortOrder: 1 }],
      [lesson],
      activities,
      []
    );

    const les = cascade.modules[0].lessons[0];
    expect(les.slots).toHaveLength(9); // 7 + 2 extras
    expect(les.totalSlots).toBe(9); // All 9 are filled
    expect(les.slots[7].slotIndex).toBe(8);
    expect(les.slots[8].slotIndex).toBe(9);
  });
});

describe("Progress Cascade — Status Derivation Rules", () => {
  it("not_started: 0 completed slots → lesson not_started", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "L1");
    const cascade = buildCascade(1, "C1", [{ id: 1, title: "M1", titleFr: null, sortOrder: 1 }], [lesson], activities, []);
    expect(cascade.modules[0].lessons[0].status).toBe("not_started");
  });

  it("in_progress: some completed slots → lesson in_progress", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "L1");
    const progress = [{ activityId: 101, status: "completed" }];
    const cascade = buildCascade(1, "C1", [{ id: 1, title: "M1", titleFr: null, sortOrder: 1 }], [lesson], activities, progress);
    expect(cascade.modules[0].lessons[0].status).toBe("in_progress");
  });

  it("completed: all filled slots completed → lesson completed", () => {
    const { lesson, activities } = createFullLesson(1, 1, 1, "L1");
    const progress = activities.map(a => ({ activityId: a.id, status: "completed" }));
    const cascade = buildCascade(1, "C1", [{ id: 1, title: "M1", titleFr: null, sortOrder: 1 }], [lesson], activities, progress);
    expect(cascade.modules[0].lessons[0].status).toBe("completed");
  });

  it("module not_started when 0 lessons completed", () => {
    const mod: MockModule = { id: 1, title: "M1", titleFr: null, sortOrder: 1 };
    const l1 = createFullLesson(1, 1, 1, "L1");
    const l2 = createFullLesson(2, 1, 2, "L2");
    const cascade = buildCascade(1, "C1", [mod], [l1.lesson, l2.lesson], [...l1.activities, ...l2.activities], []);
    expect(cascade.modules[0].status).toBe("not_started");
  });

  it("module in_progress when some lessons completed", () => {
    const mod: MockModule = { id: 1, title: "M1", titleFr: null, sortOrder: 1 };
    const l1 = createFullLesson(1, 1, 1, "L1");
    const l2 = createFullLesson(2, 1, 2, "L2");
    const progress = l1.activities.map(a => ({ activityId: a.id, status: "completed" }));
    const cascade = buildCascade(1, "C1", [mod], [l1.lesson, l2.lesson], [...l1.activities, ...l2.activities], progress);
    expect(cascade.modules[0].status).toBe("in_progress");
  });

  it("module completed when all lessons completed", () => {
    const mod: MockModule = { id: 1, title: "M1", titleFr: null, sortOrder: 1 };
    const l1 = createFullLesson(1, 1, 1, "L1");
    const l2 = createFullLesson(2, 1, 2, "L2");
    const progress = [...l1.activities, ...l2.activities].map(a => ({ activityId: a.id, status: "completed" }));
    const cascade = buildCascade(1, "C1", [mod], [l1.lesson, l2.lesson], [...l1.activities, ...l2.activities], progress);
    expect(cascade.modules[0].status).toBe("completed");
  });
});
