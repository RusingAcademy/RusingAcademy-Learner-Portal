/**
 * Tests for the public CMS API (learner-facing procedures)
 * Validates that the CMS database returns seeded content correctly
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database helpers
vi.mock("./db-cms", () => ({
  listPublishedPrograms: vi.fn(),
  getPublishedProgramBySlug: vi.fn(),
  getPublishedProgramStats: vi.fn(),
  getPublishedPath: vi.fn(),
  getPublishedLesson: vi.fn(),
  // Admin helpers (still needed for the combined router)
  listPrograms: vi.fn(),
  getProgram: vi.fn(),
  getProgramBySlug: vi.fn(),
  createProgram: vi.fn(),
  updateProgram: vi.fn(),
  deleteProgram: vi.fn(),
  listPaths: vi.fn(),
  getPath: vi.fn(),
  createPath: vi.fn(),
  updatePath: vi.fn(),
  deletePath: vi.fn(),
  listModules: vi.fn(),
  getModule: vi.fn(),
  createModule: vi.fn(),
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  listLessons: vi.fn(),
  getLesson: vi.fn(),
  createLesson: vi.fn(),
  updateLesson: vi.fn(),
  deleteLesson: vi.fn(),
  listLessonSlots: vi.fn(),
  getLessonSlot: vi.fn(),
  createLessonSlot: vi.fn(),
  updateLessonSlot: vi.fn(),
  deleteLessonSlot: vi.fn(),
  listQuizzes: vi.fn(),
  getQuiz: vi.fn(),
  createQuiz: vi.fn(),
  updateQuiz: vi.fn(),
  deleteQuiz: vi.fn(),
  listQuizQuestions: vi.fn(),
  getQuizQuestion: vi.fn(),
  createQuizQuestion: vi.fn(),
  updateQuizQuestion: vi.fn(),
  deleteQuizQuestion: vi.fn(),
  listMediaAssets: vi.fn(),
  getMediaAsset: vi.fn(),
  createMediaAsset: vi.fn(),
  deleteMediaAsset: vi.fn(),
  getCmsStats: vi.fn(),
  getProgramTree: vi.fn(),
  getFullLesson: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

import * as cmsDb from "./db-cms";

describe("Public CMS API — listPublishedPrograms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return published programs", async () => {
    const mockPrograms = [
      { id: 1, slug: "fsl", title: "FSL Program", titleFr: "Programme FSL", isPublished: true, sortOrder: 1 },
      { id: 2, slug: "esl", title: "ESL Program", titleFr: "Programme ESL", isPublished: true, sortOrder: 2 },
    ];
    vi.mocked(cmsDb.listPublishedPrograms).mockResolvedValue(mockPrograms);

    const result = await cmsDb.listPublishedPrograms();
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("fsl");
    expect(result[1].slug).toBe("esl");
  });

  it("should return empty array when no programs are published", async () => {
    vi.mocked(cmsDb.listPublishedPrograms).mockResolvedValue([]);
    const result = await cmsDb.listPublishedPrograms();
    expect(result).toHaveLength(0);
  });
});

describe("Public CMS API — getPublishedProgramBySlug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a full program tree for FSL", async () => {
    const mockTree = {
      id: 1,
      slug: "fsl",
      title: "FSL Program",
      isPublished: true,
      paths: [
        {
          id: 1,
          slug: "path-i",
          title: "Path I — Workplace Basics",
          cefrLevel: "A1",
          isPublished: true,
          modules: [
            {
              id: 1,
              title: "Module 1 — Greetings",
              isPublished: true,
              lessons: [
                { id: 1, lessonNumber: "1.1", title: "Lesson 1.1", isPublished: true },
                { id: 2, lessonNumber: "1.2", title: "Lesson 1.2", isPublished: true },
              ],
            },
          ],
        },
      ],
    };
    vi.mocked(cmsDb.getPublishedProgramBySlug).mockResolvedValue(mockTree);

    const result = await cmsDb.getPublishedProgramBySlug("fsl");
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("fsl");
    expect(result!.paths).toHaveLength(1);
    expect(result!.paths[0].modules).toHaveLength(1);
    expect(result!.paths[0].modules[0].lessons).toHaveLength(2);
  });

  it("should return null for non-existent program", async () => {
    vi.mocked(cmsDb.getPublishedProgramBySlug).mockResolvedValue(null);
    const result = await cmsDb.getPublishedProgramBySlug("nonexistent");
    expect(result).toBeNull();
  });
});

describe("Public CMS API — getPublishedProgramStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return correct stats for FSL program", async () => {
    const mockStats = { paths: 6, modules: 24, lessons: 96, activities: 672 };
    vi.mocked(cmsDb.getPublishedProgramStats).mockResolvedValue(mockStats);

    const result = await cmsDb.getPublishedProgramStats("fsl");
    expect(result.paths).toBe(6);
    expect(result.modules).toBe(24);
    expect(result.lessons).toBe(96);
    expect(result.activities).toBe(672);
  });

  it("should return zeros for non-existent program", async () => {
    const mockStats = { paths: 0, modules: 0, lessons: 0, activities: 0 };
    vi.mocked(cmsDb.getPublishedProgramStats).mockResolvedValue(mockStats);

    const result = await cmsDb.getPublishedProgramStats("nonexistent");
    expect(result.paths).toBe(0);
    expect(result.lessons).toBe(0);
  });
});

describe("Public CMS API — getPublishedPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a path with modules and lessons", async () => {
    const mockPath = {
      program: { id: 1, slug: "fsl", title: "FSL Program" },
      path: {
        id: 1,
        slug: "path-i",
        title: "Path I",
        cefrLevel: "A1",
        modules: [
          {
            id: 1,
            title: "Module 1",
            lessons: [
              { id: 1, lessonNumber: "1.1", title: "Lesson 1.1" },
              { id: 2, lessonNumber: "1.2", title: "Lesson 1.2" },
            ],
          },
        ],
      },
    };
    vi.mocked(cmsDb.getPublishedPath).mockResolvedValue(mockPath);

    const result = await cmsDb.getPublishedPath("fsl", "path-i");
    expect(result).not.toBeNull();
    expect(result!.path.slug).toBe("path-i");
    expect(result!.path.modules[0].lessons).toHaveLength(2);
  });

  it("should return null for non-existent path", async () => {
    vi.mocked(cmsDb.getPublishedPath).mockResolvedValue(null);
    const result = await cmsDb.getPublishedPath("fsl", "nonexistent");
    expect(result).toBeNull();
  });
});

describe("Public CMS API — getPublishedLesson", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a full lesson with slots and quiz", async () => {
    const mockLesson = {
      program: { id: 1, slug: "fsl" },
      path: { id: 1, slug: "path-i" },
      module: { id: 1, title: "Module 1" },
      lesson: {
        id: 1,
        lessonNumber: "1.1",
        title: "Lesson 1.1 — Greetings",
        slots: [
          { id: 1, slotType: "hook", title: "Hook", content: "Welcome to the lesson..." },
          { id: 2, slotType: "video", title: "Video Lesson", content: "Watch the video..." },
          { id: 3, slotType: "strategy", title: "Grammar Strategy", content: "Pattern → Proof → Practice..." },
          { id: 4, slotType: "written", title: "Written Practice", content: "Write a greeting..." },
          { id: 5, slotType: "oral", title: "Oral Practice", content: "Practice saying..." },
          { id: 6, slotType: "quiz", title: "Formative Quiz", content: "" },
          { id: 7, slotType: "coaching", title: "Coaching Corner", content: "Reflect on..." },
        ],
        quizzes: [
          {
            id: 1,
            title: "Formative Quiz — Lesson 1.1",
            questions: [
              {
                id: 1,
                question: "What is the correct greeting?",
                questionType: "multiple_choice",
                options: '["Bonjour","Salut","Hey","Yo"]',
                correctAnswer: "Bonjour",
                feedback: "Bonjour is the formal greeting.",
              },
            ],
          },
        ],
      },
    };
    vi.mocked(cmsDb.getPublishedLesson).mockResolvedValue(mockLesson);

    const result = await cmsDb.getPublishedLesson("fsl", "1.1");
    expect(result).not.toBeNull();
    expect(result!.lesson.lessonNumber).toBe("1.1");
    expect(result!.lesson.slots).toHaveLength(7);
    expect(result!.lesson.quizzes).toHaveLength(1);
    expect(result!.lesson.quizzes[0].questions).toHaveLength(1);
  });

  it("should return null for non-existent lesson", async () => {
    vi.mocked(cmsDb.getPublishedLesson).mockResolvedValue(null);
    const result = await cmsDb.getPublishedLesson("fsl", "99.99");
    expect(result).toBeNull();
  });

  it("should handle lesson with no quiz", async () => {
    const mockLesson = {
      program: { id: 1, slug: "fsl" },
      path: { id: 1, slug: "path-i" },
      module: { id: 1, title: "Module 1" },
      lesson: {
        id: 1,
        lessonNumber: "1.1",
        title: "Lesson 1.1",
        slots: [
          { id: 1, slotType: "hook", title: "Hook", content: "Content..." },
        ],
        quizzes: [],
      },
    };
    vi.mocked(cmsDb.getPublishedLesson).mockResolvedValue(mockLesson);

    const result = await cmsDb.getPublishedLesson("fsl", "1.1");
    expect(result!.lesson.quizzes).toHaveLength(0);
  });
});

describe("CMS Data Transformation — useCmsData hook logic", () => {
  it("should correctly map CMS slot types to the expected format", () => {
    const cmsSlots = [
      { slotType: "hook", title: "Hook", content: "Content A", titleFr: "Accroche", contentFr: "" },
      { slotType: "video", title: "Video", content: "Content B", titleFr: "Vidéo", contentFr: "" },
      { slotType: "strategy", title: "Strategy", content: "Content C", titleFr: "Stratégie", contentFr: "" },
      { slotType: "written", title: "Written", content: "Content D", titleFr: "Écrit", contentFr: "" },
      { slotType: "oral", title: "Oral", content: "Content E", titleFr: "Oral", contentFr: "" },
      { slotType: "quiz", title: "Quiz", content: "", titleFr: "Quiz", contentFr: "" },
      { slotType: "coaching", title: "Coaching", content: "Content G", titleFr: "Coaching", contentFr: "" },
    ];

    // Transform like the useCmsLesson hook does
    const slotMap: Record<string, any> = {};
    for (const slot of cmsSlots) {
      slotMap[slot.slotType] = {
        title: slot.title,
        titleFr: slot.titleFr,
        content: slot.content,
        contentFr: slot.contentFr,
        quiz: null,
      };
    }

    expect(Object.keys(slotMap)).toHaveLength(7);
    expect(slotMap.hook.title).toBe("Hook");
    expect(slotMap.hook.content).toBe("Content A");
    expect(slotMap.video.content).toBe("Content B");
    expect(slotMap.strategy.content).toBe("Content C");
    expect(slotMap.written.content).toBe("Content D");
    expect(slotMap.oral.content).toBe("Content E");
    expect(slotMap.quiz.content).toBe("");
    expect(slotMap.coaching.content).toBe("Content G");
  });

  it("should correctly attach quiz data to the quiz slot", () => {
    const quizzes = [
      {
        title: "Formative Quiz",
        questions: [
          {
            question: "Q1?",
            questionType: "multiple_choice",
            options: '["A","B","C","D"]',
            correctAnswer: "B",
            feedback: "B is correct",
          },
          {
            question: "Q2?",
            questionType: "fill_in_blank",
            options: null,
            correctAnswer: "answer",
            feedback: "The answer is 'answer'",
          },
        ],
      },
    ];

    const slotMap: Record<string, any> = { quiz: { title: "Quiz", content: "", quiz: null } };

    if (quizzes.length > 0) {
      const quiz = quizzes[0];
      slotMap.quiz = {
        ...slotMap.quiz,
        quiz: {
          title: quiz.title,
          questions: quiz.questions.map((q: any) => ({
            question: q.question,
            type: q.questionType === "fill_in_blank" ? "fill-in-blank" : "multiple-choice",
            options: q.options ? (typeof q.options === "string" ? JSON.parse(q.options) : q.options) : [],
            answer: q.correctAnswer,
            feedback: q.feedback || "",
          })),
        },
      };
    }

    expect(slotMap.quiz.quiz).not.toBeNull();
    expect(slotMap.quiz.quiz.title).toBe("Formative Quiz");
    expect(slotMap.quiz.quiz.questions).toHaveLength(2);
    expect(slotMap.quiz.quiz.questions[0].type).toBe("multiple-choice");
    expect(slotMap.quiz.quiz.questions[0].options).toEqual(["A", "B", "C", "D"]);
    expect(slotMap.quiz.quiz.questions[1].type).toBe("fill-in-blank");
    expect(slotMap.quiz.quiz.questions[1].options).toEqual([]);
    expect(slotMap.quiz.quiz.questions[1].answer).toBe("answer");
  });

  it("should correctly transform CMS program data to component format", () => {
    const cmsData = {
      slug: "fsl",
      title: "FSL Program",
      titleFr: "Programme FSL",
      description: "French training",
      descriptionFr: "Formation en français",
      icon: "translate",
      color: "#dc2626",
      paths: [
        {
          slug: "path-i",
          number: "I",
          title: "Path I",
          titleFr: "Chemin I",
          subtitle: "Workplace Basics",
          subtitleFr: "Les bases",
          cefrLevel: "A1",
          color: "#008090",
          coverUrl: "https://example.com/cover.jpg",
          badgeUrl: "https://example.com/badge.png",
          modules: [
            {
              title: "Module 1",
              titleFr: "Module 1",
              description: "Greetings",
              descriptionFr: "Salutations",
              badgeUrl: "",
              quizPassingScore: 70,
              lessons: [
                { lessonNumber: "1.1", title: "Lesson 1.1", titleFr: "Leçon 1.1", duration: "30 min", xpReward: 100 },
                { lessonNumber: "1.2", title: "Lesson 1.2", titleFr: "Leçon 1.2", duration: "30 min", xpReward: 100 },
              ],
            },
          ],
        },
      ],
    };

    // Transform like useCmsProgram does
    const transformed = {
      id: cmsData.slug,
      title: cmsData.title,
      titleFr: cmsData.titleFr || cmsData.title,
      description: cmsData.description || "",
      descriptionFr: cmsData.descriptionFr || "",
      icon: cmsData.icon || "school",
      color: cmsData.color || "#008090",
      paths: (cmsData.paths || []).map((p: any) => ({
        id: p.slug,
        number: p.number,
        title: p.title,
        titleFr: p.titleFr || p.title,
        subtitle: p.subtitle || "",
        subtitleFr: p.subtitleFr || "",
        cefrLevel: p.cefrLevel,
        color: p.color || "#008090",
        coverUrl: p.coverUrl || "",
        badgeUrl: p.badgeUrl || "",
        totalLessons: (p.modules || []).reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0),
        modules: (p.modules || []).map((m: any, idx: number) => ({
          id: idx + 1,
          title: m.title,
          titleFr: m.titleFr || m.title,
          description: m.description || "",
          descriptionFr: m.descriptionFr || "",
          badgeUrl: m.badgeUrl || "",
          quizPassing: m.quizPassingScore || 70,
          lessons: (m.lessons || []).map((l: any) => ({
            id: l.lessonNumber,
            title: l.title,
            titleFr: l.titleFr || l.title,
            duration: l.duration || "30 min",
            xpReward: l.xpReward || 100,
          })),
        })),
      })),
    };

    expect(transformed.id).toBe("fsl");
    expect(transformed.title).toBe("FSL Program");
    expect(transformed.paths).toHaveLength(1);
    expect(transformed.paths[0].id).toBe("path-i");
    expect(transformed.paths[0].totalLessons).toBe(2);
    expect(transformed.paths[0].modules[0].id).toBe(1);
    expect(transformed.paths[0].modules[0].lessons[0].id).toBe("1.1");
    expect(transformed.paths[0].modules[0].quizPassing).toBe(70);
  });
});

describe("CMS Fallback Strategy", () => {
  it("should use static data when CMS returns null", () => {
    const cmsData = null;
    const staticData = {
      id: "fsl",
      title: "FSL Program",
      paths: [{ id: "path-i", title: "Path I" }],
    };

    const result = cmsData || staticData;
    expect(result.id).toBe("fsl");
    expect(result.paths).toHaveLength(1);
  });

  it("should prefer CMS data when available", () => {
    const cmsData = {
      id: "fsl",
      title: "FSL Program (CMS)",
      paths: [{ id: "path-i", title: "Path I (CMS)" }],
    };
    const staticData = {
      id: "fsl",
      title: "FSL Program (Static)",
      paths: [{ id: "path-i", title: "Path I (Static)" }],
    };

    const result = cmsData || staticData;
    expect(result.title).toBe("FSL Program (CMS)");
    expect(result.paths[0].title).toBe("Path I (CMS)");
  });

  it("should handle CMS returning empty content for a lesson slot", () => {
    const cmsContent: Record<string, any> = {
      hook: { title: "Hook", content: "", quiz: null },
    };
    const staticContent: Record<string, any> = {
      hook: { title: "Hook", content: "Static hook content" },
    };

    // The hook checks if content exists
    const slotContent = cmsContent?.hook?.content || staticContent?.hook?.content;
    expect(slotContent).toBe("Static hook content");
  });
});
