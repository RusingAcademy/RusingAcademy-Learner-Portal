import { describe, expect, it } from "vitest";
import { eslLessonContent } from "../client/src/data/eslLessonContent";
import { fslLessonContent, getLessonContent } from "../client/src/data/lessonContent";

describe("ESL Content Integration", () => {
  it("contains exactly 96 ESL lessons", () => {
    const lessonIds = Object.keys(eslLessonContent);
    expect(lessonIds.length).toBe(96);
  });

  it("each ESL lesson has all 7 slots", () => {
    const expectedSlots = ["hook", "video", "strategy", "written", "oral", "quiz", "coaching"];
    for (const [lessonId, lesson] of Object.entries(eslLessonContent)) {
      const keys = Object.keys(lesson);
      for (const slot of expectedSlots) {
        expect(keys).toContain(slot);
      }
    }
  });

  it("ESL lesson 1.1 has distinct content from FSL lesson 1.1", () => {
    const eslLesson = eslLessonContent["1.1"];
    const fslLesson = fslLessonContent["1.1"];
    expect(eslLesson).toBeDefined();
    expect(fslLesson).toBeDefined();
    // ESL hook should mention English-specific content
    expect(eslLesson.hook.content).toContain("English");
    // FSL video should contain French-specific content (the FSL video is in French)
    expect(fslLesson.video.content).toContain("Bonjour");
    // They should NOT be identical
    expect(eslLesson.hook.content).not.toBe(fslLesson.hook?.content);
  });

  it("ESL lessons span all 6 paths (modules 1-24)", () => {
    // Path I: 1.1-4.4, Path II: 5.1-8.4, Path III: 9.1-12.4
    // Path IV: 13.1-16.4, Path V: 17.1-20.4, Path VI: 21.1-24.4
    for (let module = 1; module <= 24; module++) {
      for (let lesson = 1; lesson <= 4; lesson++) {
        const id = `${module}.${lesson}`;
        expect(eslLessonContent[id]).toBeDefined();
      }
    }
  });

  it("getLessonContent routes correctly by programId", () => {
    const eslContent = getLessonContent("1.1", "esl");
    const fslContent = getLessonContent("1.1", "fsl");
    const defaultContent = getLessonContent("1.1");

    expect(eslContent).toBeDefined();
    expect(fslContent).toBeDefined();
    expect(defaultContent).toBeDefined();

    // ESL should return ESL content
    expect(eslContent!.hook.content).toContain("English");
    // FSL and default should return FSL content
    expect(fslContent).toBe(defaultContent);
  });

  it("ESL quizzes have valid quiz data where JSON was available", () => {
    let quizCount = 0;
    for (const [lessonId, lesson] of Object.entries(eslLessonContent)) {
      const quizSlot = lesson.quiz;
      if (quizSlot && quizSlot.quiz) {
        quizCount++;
        expect(quizSlot.quiz.title).toBeTruthy();
        expect(quizSlot.quiz.questions.length).toBeGreaterThan(0);
        for (const q of quizSlot.quiz.questions) {
          expect(q.question).toBeTruthy();
          expect(q.answer).toBeTruthy();
        }
      }
    }
    // We know at least 46 quizzes have JSON data
    expect(quizCount).toBeGreaterThanOrEqual(40);
  });

  it("each ESL slot has non-empty title and content", () => {
    for (const [lessonId, lesson] of Object.entries(eslLessonContent)) {
      for (const [slotKey, slot] of Object.entries(lesson)) {
        expect(slot.title, `Lesson ${lessonId} slot ${slotKey} title`).toBeTruthy();
        expect(slot.content, `Lesson ${lessonId} slot ${slotKey} content`).toBeTruthy();
      }
    }
  });
});
