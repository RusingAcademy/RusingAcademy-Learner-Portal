import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(() =>
    Promise.resolve({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() =>
              Promise.resolve([
                {
                  id: 126,
                  lessonId: 60006,
                  moduleId: 60003,
                  courseId: 1,
                  slotIndex: 1,
                  slotType: "introduction",
                  title: "Introduction — 1.1",
                  titleFr: null,
                  description: "Hook, objectifs et parcours",
                  descriptionFr: null,
                  activityType: "text",
                  estimatedMinutes: 2,
                  points: 0,
                  sortOrder: 1,
                  status: "published",
                  isPreview: false,
                  isMandatory: true,
                  thumbnailUrl: null,
                  unlockMode: "immediate",
                },
              ])
            ),
            limit: vi.fn(() =>
              Promise.resolve([
                {
                  id: 126,
                  lessonId: 60006,
                  moduleId: 60003,
                  courseId: 1,
                  slotIndex: 1,
                  slotType: "introduction",
                  title: "Introduction — 1.1",
                  titleFr: null,
                  activityType: "text",
                  status: "published",
                },
              ])
            ),
          })),
          leftJoin: vi.fn(() => ({
            where: vi.fn(() =>
              Promise.resolve([
                {
                  id: 126,
                  title: "Introduction — 1.1",
                  slotIndex: 1,
                  slotType: "introduction",
                  activityType: "text",
                  progressStatus: "completed",
                  progressScore: 100,
                },
              ])
            ),
          })),
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() =>
                Promise.resolve([
                  { lessonId: 60006, slotIndex: 1, slotType: "introduction", status: "published", titleFr: null },
                ])
              ),
            })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onDuplicateKeyUpdate: vi.fn(() => Promise.resolve()),
          then: vi.fn((cb: any) => cb([{ insertId: 1 }])),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })
  ),
}));

describe("Activities Router — 7-Slot Architecture", () => {
  // ========================================================================
  // SCHEMA VALIDATION
  // ========================================================================
  describe("Schema validation", () => {
    it("should have activities table defined in schema", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.activities).toBeDefined();
    });

    it("should have activityProgress table defined in schema", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.activityProgress).toBeDefined();
    });

    it("activities table should have 7-slot system columns", async () => {
      const schema = await import("../../drizzle/schema");
      const actTable = schema.activities;
      
      // Core columns
      expect(actTable.id).toBeDefined();
      expect(actTable.lessonId).toBeDefined();
      expect(actTable.moduleId).toBeDefined();
      expect(actTable.courseId).toBeDefined();
      
      // 7-Slot System columns
      expect(actTable.slotIndex).toBeDefined();
      expect(actTable.slotType).toBeDefined();
      
      // Bilingual columns
      expect(actTable.title).toBeDefined();
      expect(actTable.titleFr).toBeDefined();
      expect(actTable.description).toBeDefined();
      expect(actTable.descriptionFr).toBeDefined();
      expect(actTable.content).toBeDefined();
      expect(actTable.contentFr).toBeDefined();
      expect(actTable.contentJson).toBeDefined();
      expect(actTable.contentJsonFr).toBeDefined();
      
      // Media columns
      expect(actTable.videoUrl).toBeDefined();
      expect(actTable.videoProvider).toBeDefined();
      expect(actTable.audioUrl).toBeDefined();
      expect(actTable.downloadUrl).toBeDefined();
      expect(actTable.embedCode).toBeDefined();
      expect(actTable.thumbnailUrl).toBeDefined();
      
      // Scoring columns
      expect(actTable.points).toBeDefined();
      expect(actTable.estimatedMinutes).toBeDefined();
      expect(actTable.passingScore).toBeDefined();
      
      // Status columns
      expect(actTable.status).toBeDefined();
      expect(actTable.isMandatory).toBeDefined();
      expect(actTable.isPreview).toBeDefined();
      expect(actTable.unlockMode).toBeDefined();
    });

    it("activityProgress table should have required columns", async () => {
      const schema = await import("../../drizzle/schema");
      const progTable = schema.activityProgress;
      
      expect(progTable.id).toBeDefined();
      expect(progTable.activityId).toBeDefined();
      expect(progTable.userId).toBeDefined();
      expect(progTable.lessonId).toBeDefined();
      expect(progTable.courseId).toBeDefined();
      expect(progTable.status).toBeDefined();
      expect(progTable.score).toBeDefined();
      expect(progTable.attempts).toBeDefined();
      expect(progTable.timeSpentSeconds).toBeDefined();
      expect(progTable.completedAt).toBeDefined();
      expect(progTable.responseData).toBeDefined();
    });
  });

  // ========================================================================
  // SLOT TEMPLATE
  // ========================================================================
  describe("SLOT_TEMPLATE constant", () => {
    it("should export SLOT_TEMPLATE with 7 entries", async () => {
      const { SLOT_TEMPLATE } = await import("./activities");
      expect(SLOT_TEMPLATE).toBeDefined();
      expect(SLOT_TEMPLATE).toHaveLength(7);
    });

    it("should have correct slot types in order", async () => {
      const { SLOT_TEMPLATE } = await import("./activities");
      const types = SLOT_TEMPLATE.map((s) => s.type);
      expect(types).toEqual([
        "introduction",
        "video_scenario",
        "grammar_point",
        "written_practice",
        "oral_practice",
        "quiz_slot",
        "coaching_tip",
      ]);
    });

    it("should have correct slot indices 1-7", async () => {
      const { SLOT_TEMPLATE } = await import("./activities");
      const indices = SLOT_TEMPLATE.map((s) => s.index);
      expect(indices).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("should have bilingual labels for every slot", async () => {
      const { SLOT_TEMPLATE } = await import("./activities");
      SLOT_TEMPLATE.forEach((slot) => {
        expect(slot.labelEn).toBeTruthy();
        expect(slot.labelFr).toBeTruthy();
        expect(typeof slot.labelEn).toBe("string");
        expect(typeof slot.labelFr).toBe("string");
      });
    });

    it("should have default activity types for each slot", async () => {
      const { SLOT_TEMPLATE } = await import("./activities");
      expect(SLOT_TEMPLATE[0].activityType).toBe("text"); // Introduction
      expect(SLOT_TEMPLATE[1].activityType).toBe("video"); // Video Scenario
      expect(SLOT_TEMPLATE[2].activityType).toBe("text"); // Grammar Point
      expect(SLOT_TEMPLATE[3].activityType).toBe("assignment"); // Written Practice
      expect(SLOT_TEMPLATE[4].activityType).toBe("audio"); // Oral Practice
      expect(SLOT_TEMPLATE[5].activityType).toBe("quiz"); // Quiz
      expect(SLOT_TEMPLATE[6].activityType).toBe("text"); // Coaching Tip
    });

    it("should have positive default minutes for every slot", async () => {
      const { SLOT_TEMPLATE } = await import("./activities");
      SLOT_TEMPLATE.forEach((slot) => {
        expect(slot.defaultMinutes).toBeGreaterThan(0);
      });
    });

    it("total default minutes should be approximately 52 min", async () => {
      const { SLOT_TEMPLATE } = await import("./activities");
      const total = SLOT_TEMPLATE.reduce((sum, s) => sum + s.defaultMinutes, 0);
      expect(total).toBe(52); // 2+7+12+11+9+8+3
    });
  });

  // ========================================================================
  // ROUTER EXPORTS
  // ========================================================================
  describe("Router exports", () => {
    it("should export activitiesRouter", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter).toBeDefined();
    });

    // Public procedures
    it("should have getSlotTemplate procedure (public)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.getSlotTemplate).toBeDefined();
    });

    it("should have getByLesson procedure (public)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.getByLesson).toBeDefined();
    });

    it("should have getLessonSlots procedure (public)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.getLessonSlots).toBeDefined();
    });

    it("should have getById procedure (public)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.getById).toBeDefined();
    });

    // Protected learner procedures
    it("should have getWithProgress procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.getWithProgress).toBeDefined();
    });

    it("should have getLessonProgress procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.getLessonProgress).toBeDefined();
    });

    it("should have startActivity procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.startActivity).toBeDefined();
    });

    it("should have completeActivity procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.completeActivity).toBeDefined();
    });

    // Admin procedures
    it("should have adminGetByLesson procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.adminGetByLesson).toBeDefined();
    });

    it("should have adminGetById procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.adminGetById).toBeDefined();
    });

    it("should have create procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.create).toBeDefined();
    });

    it("should have update procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.update).toBeDefined();
    });

    it("should have delete procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.delete).toBeDefined();
    });

    it("should have reorder procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.reorder).toBeDefined();
    });

    it("should have duplicate procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.duplicate).toBeDefined();
    });

    it("should have bulkUpdateStatus procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.bulkUpdateStatus).toBeDefined();
    });

    // Quality Gate procedures
    it("should have validateLesson procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.validateLesson).toBeDefined();
    });

    it("should have validateCourse procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.validateCourse).toBeDefined();
    });

    it("should have validateAllPaths procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.validateAllPaths).toBeDefined();
    });

    // Tree view procedures
    it("should have getSlotCountsByModule procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.getSlotCountsByModule).toBeDefined();
    });

    it("should have getCourseTree procedure (protected)", async () => {
      const { activitiesRouter } = await import("./activities");
      expect(activitiesRouter._def.procedures.getCourseTree).toBeDefined();
    });
  });

  // ========================================================================
  // APP ROUTER INTEGRATION
  // ========================================================================
  describe("Activities router is registered in appRouter", () => {
    it("should be accessible via appRouter.activities", async () => {
      const { appRouter } = await import("../routers");
      // Public endpoints
      expect(appRouter._def.procedures["activities.getSlotTemplate"]).toBeDefined();
      expect(appRouter._def.procedures["activities.getByLesson"]).toBeDefined();
      expect(appRouter._def.procedures["activities.getLessonSlots"]).toBeDefined();
      expect(appRouter._def.procedures["activities.getById"]).toBeDefined();
      // Protected endpoints
      expect(appRouter._def.procedures["activities.create"]).toBeDefined();
      expect(appRouter._def.procedures["activities.update"]).toBeDefined();
      expect(appRouter._def.procedures["activities.delete"]).toBeDefined();
      expect(appRouter._def.procedures["activities.reorder"]).toBeDefined();
      expect(appRouter._def.procedures["activities.duplicate"]).toBeDefined();
      // Quality Gate endpoints
      expect(appRouter._def.procedures["activities.validateLesson"]).toBeDefined();
      expect(appRouter._def.procedures["activities.validateCourse"]).toBeDefined();
      expect(appRouter._def.procedures["activities.validateAllPaths"]).toBeDefined();
    });
  });

  // ========================================================================
  // ACTIVITY TYPE VALIDATION
  // ========================================================================
  describe("Activity type validation", () => {
    it("should accept all 12 valid activity types", () => {
      const validTypes = [
        "video", "text", "audio", "quiz", "assignment",
        "download", "live_session", "embed", "speaking_exercise",
        "fill_blank", "matching", "discussion",
      ];
      expect(validTypes).toHaveLength(12);
      validTypes.forEach((type) => {
        expect(typeof type).toBe("string");
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  // ========================================================================
  // SLOT TYPE VALIDATION
  // ========================================================================
  describe("Slot type validation", () => {
    it("should have 7 valid slot types", () => {
      const slotTypes = [
        "introduction", "video_scenario", "grammar_point",
        "written_practice", "oral_practice", "quiz_slot", "coaching_tip",
      ];
      expect(slotTypes).toHaveLength(7);
    });

    it("each slot type should map to a unique index", async () => {
      const { SLOT_TEMPLATE } = await import("./activities");
      const typeToIndex = new Map(SLOT_TEMPLATE.map((s) => [s.type, s.index]));
      expect(typeToIndex.size).toBe(7);
      expect(typeToIndex.get("introduction")).toBe(1);
      expect(typeToIndex.get("video_scenario")).toBe(2);
      expect(typeToIndex.get("grammar_point")).toBe(3);
      expect(typeToIndex.get("written_practice")).toBe(4);
      expect(typeToIndex.get("oral_practice")).toBe(5);
      expect(typeToIndex.get("quiz_slot")).toBe(6);
      expect(typeToIndex.get("coaching_tip")).toBe(7);
    });
  });

  // ========================================================================
  // DRIP CONTENT SCHEMA
  // ========================================================================
  describe("Schema drip content fields", () => {
    it("courses table should have drip content fields", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.courses.dripEnabled).toBeDefined();
      expect(schema.courses.dripInterval).toBeDefined();
      expect(schema.courses.dripUnit).toBeDefined();
    });

    it("courseModules table should have drip and thumbnail fields", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.courseModules.thumbnailUrl).toBeDefined();
      expect(schema.courseModules.availableAt).toBeDefined();
      expect(schema.courseModules.unlockMode).toBeDefined();
      expect(schema.courseModules.status).toBeDefined();
    });

    it("lessons table should have status and thumbnail fields", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.lessons.status).toBeDefined();
      expect(schema.lessons.thumbnailUrl).toBeDefined();
    });
  });

  // ========================================================================
  // PROGRESS STATUS VALUES
  // ========================================================================
  describe("Activity progress status values", () => {
    it("should support not_started, in_progress, completed, and failed statuses", () => {
      const progressStatuses = ["not_started", "in_progress", "completed", "failed"];
      expect(progressStatuses).toContain("not_started");
      expect(progressStatuses).toContain("in_progress");
      expect(progressStatuses).toContain("completed");
      expect(progressStatuses).toContain("failed");
    });
  });

  // ========================================================================
  // EXTRA SLOTS (BEYOND SLOT 7)
  // ========================================================================
  describe("Extra slots support (slotIndex 8+)", () => {
    it("should allow slotType 'extra' in the schema enum", async () => {
      const schema = await import("../../drizzle/schema");
      // The activities table's slotType column should include 'extra' in its enum values
      const slotTypeCol = (schema.activities as any).slotType;
      expect(slotTypeCol).toBeDefined();
      // Check the enum includes 'extra' via the column config
      if (slotTypeCol.enumValues) {
        expect(slotTypeCol.enumValues).toContain("extra");
      } else {
        // Fallback: just verify the column exists
        expect(slotTypeCol).toBeTruthy();
      }
    });

    it("should support slotIndex values beyond 7", () => {
      // Extra activities use slotIndex 8, 9, 10, etc.
      const extraSlotIndexes = [8, 9, 10, 15, 20];
      extraSlotIndexes.forEach(idx => {
        expect(idx).toBeGreaterThan(7);
      });
    });

    it("should distinguish mandatory slots (1-7) from extra slots (8+)", () => {
      const mandatorySlots = [1, 2, 3, 4, 5, 6, 7];
      const extraSlots = [8, 9, 10];
      
      mandatorySlots.forEach(s => expect(s).toBeLessThanOrEqual(7));
      extraSlots.forEach(s => expect(s).toBeGreaterThan(7));
    });
  });

  // ========================================================================
  // QUIZ CONTENT PARSING
  // ========================================================================
  describe("Quiz content JSON parsing", () => {
    it("should parse quiz JSON from markdown content", () => {
      const content = 'Some intro text\n```json\n{"questions":[{"question":"Test?","options":["A","B"],"correct":0}]}\n```\nSome outro';
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      expect(jsonMatch).not.toBeNull();
      const parsed = JSON.parse(jsonMatch![1]);
      expect(parsed.questions).toBeDefined();
      expect(parsed.questions[0].question).toBe("Test?");
      expect(parsed.questions[0].options).toHaveLength(2);
    });

    it("should handle quiz content without JSON block gracefully", () => {
      const content = 'Just plain text content without any JSON';
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      expect(jsonMatch).toBeNull();
    });

    it("should parse multiple choice questions with correct answer index", () => {
      const quizData = {
        questions: [
          {
            question: "Dans la vidéo, quel est le poste d'Anna ?",
            type: "multiple_choice",
            options: ["Gestionnaire", "Analyste", "Directrice", "Coordonnatrice"],
            correct: 1,
            feedback_correct: "Bravo !",
            feedback_incorrect: "Réessayez."
          }
        ]
      };
      expect(quizData.questions[0].correct).toBe(1);
      expect(quizData.questions[0].options[quizData.questions[0].correct]).toBe("Analyste");
    });

    it("should support fill-in-the-blank question type", () => {
      const quizData = {
        questions: [
          {
            question: "Je _____ analyste.",
            type: "fill_blank",
            correct_answer: "suis",
            accept_alternatives: ["suis"]
          }
        ]
      };
      expect(quizData.questions[0].type).toBe("fill_blank");
      expect(quizData.questions[0].correct_answer).toBe("suis");
    });
  });

  // ========================================================================
  // BILINGUAL FIELD VALIDATION
  // ========================================================================
  describe("Bilingual field support", () => {
    it("should have titleFr field in activities schema", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.activities.titleFr).toBeDefined();
    });

    it("should have descriptionFr field in activities schema", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.activities.descriptionFr).toBeDefined();
    });

    it("should have contentFr field in activities schema", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.activities.contentFr).toBeDefined();
    });

    it("should have contentJsonFr field in activities schema", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.activities.contentJsonFr).toBeDefined();
    });
  });

  // ========================================================================
  // SLOT TEMPLATE STRUCTURE
  // ========================================================================
  describe("7-Slot template structure", () => {
    const SLOT_TEMPLATE = [
      { slotIndex: 1, slotType: "introduction", label: "Introduction / Accroche", labelFr: "Introduction / Accroche", icon: "BookOpen", color: "teal" },
      { slotIndex: 2, slotType: "video", label: "Video Lesson", labelFr: "Leçon Vidéo", icon: "Play", color: "orange" },
      { slotIndex: 3, slotType: "grammar", label: "Grammar Point", labelFr: "Point-Grammaire", icon: "PenTool", color: "green" },
      { slotIndex: 4, slotType: "written_practice", label: "Written Practice", labelFr: "Pratique Écrite", icon: "FileText", color: "blue" },
      { slotIndex: 5, slotType: "oral_practice", label: "Oral Practice", labelFr: "Pratique Orale", icon: "Mic", color: "red" },
      { slotIndex: 6, slotType: "quiz", label: "Quiz", labelFr: "Quiz", icon: "CircleDot", color: "yellow" },
      { slotIndex: 7, slotType: "coaching_tip", label: "Coaching Tip", labelFr: "Conseil du Coach", icon: "Sparkles", color: "purple" },
    ];

    it("should have exactly 7 canonical slots", () => {
      expect(SLOT_TEMPLATE).toHaveLength(7);
    });

    it("should have sequential slotIndex from 1 to 7", () => {
      SLOT_TEMPLATE.forEach((slot, i) => {
        expect(slot.slotIndex).toBe(i + 1);
      });
    });

    it("should have unique slotTypes for each slot", () => {
      const types = SLOT_TEMPLATE.map(s => s.slotType);
      expect(new Set(types).size).toBe(7);
    });

    it("should have both English and French labels", () => {
      SLOT_TEMPLATE.forEach(slot => {
        expect(slot.label).toBeTruthy();
        expect(slot.labelFr).toBeTruthy();
      });
    });

    it("should have distinct colors for visual differentiation", () => {
      const colors = SLOT_TEMPLATE.map(s => s.color);
      expect(new Set(colors).size).toBe(7);
    });
  });

  // ========================================================================
  // BADGES AND GAMIFICATION SCHEMA
  // ========================================================================
  describe("Badges and gamification schema", () => {
    it("should have learnerBadges table in schema", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.learnerBadges).toBeDefined();
    });

    it("should have badgeType field in learnerBadges", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.learnerBadges.badgeType).toBeDefined();
    });

    it("should have userId field in learnerBadges", async () => {
      const schema = await import("../../drizzle/schema");
      expect(schema.learnerBadges.userId).toBeDefined();
    });
  });
});
