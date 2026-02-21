import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * CMS Router Tests
 * Tests the admin-only CMS CRUD procedures for programs, paths, modules, lessons, slots, quizzes, questions.
 */

function createAdminContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@rusingacademy.ca",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("CMS Router — Access Control", () => {
  it("rejects non-admin users from listing programs", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.cms.programs.list()).rejects.toThrow(/admin|forbidden|permission/i);
  });

  it("rejects non-admin users from creating programs", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.cms.programs.create({
        slug: "test",
        title: "Test",
        titleFr: "Test",
      })
    ).rejects.toThrow(/admin|forbidden|permission/i);
  });

  it("rejects non-admin users from stats", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.cms.stats.overview()).rejects.toThrow(/admin|forbidden|permission/i);
  });
});

describe("CMS Router — Programs CRUD", () => {
  const { ctx } = createAdminContext();
  let caller: ReturnType<typeof appRouter.createCaller>;
  let createdProgramId: number;

  beforeAll(() => {
    caller = appRouter.createCaller(ctx);
  });

  it("lists programs (initially may be empty or have existing data)", async () => {
    const programs = await caller.cms.programs.list();
    expect(Array.isArray(programs)).toBe(true);
  });

  it("creates a program", async () => {
    const result = await caller.cms.programs.create({
      slug: "test-esl-" + Date.now(),
      title: "Test ESL Program",
      titleFr: "Programme ESL Test",
      description: "A test program",
      descriptionFr: "Un programme test",
      icon: "🇬🇧",
      color: "#2563eb",
      sortOrder: 99,
      isPublished: false,
    });
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    createdProgramId = result.id;
  });

  it("retrieves the created program", async () => {
    const program = await caller.cms.programs.get({ id: createdProgramId });
    expect(program).not.toBeNull();
    expect(program!.title).toBe("Test ESL Program");
    expect(program!.titleFr).toBe("Programme ESL Test");
    expect(program!.isPublished).toBe(false);
  });

  it("updates the program", async () => {
    const updated = await caller.cms.programs.update({
      id: createdProgramId,
      title: "Updated ESL Program",
      isPublished: true,
    });
    expect(updated).not.toBeNull();
    expect(updated!.title).toBe("Updated ESL Program");
    expect(updated!.isPublished).toBe(true);
  });

  it("deletes the program", async () => {
    const result = await caller.cms.programs.delete({ id: createdProgramId });
    expect(result).toEqual({ success: true });
    const deleted = await caller.cms.programs.get({ id: createdProgramId });
    expect(deleted).toBeNull();
  });
});

describe("CMS Router — Paths CRUD", () => {
  const { ctx } = createAdminContext();
  let caller: ReturnType<typeof appRouter.createCaller>;
  let programId: number;
  let pathId: number;

  beforeAll(async () => {
    caller = appRouter.createCaller(ctx);
    const prog = await caller.cms.programs.create({
      slug: "path-test-prog-" + Date.now(),
      title: "Path Test Program",
      titleFr: "Programme Test Parcours",
    });
    programId = prog.id;
  });

  it("creates a path", async () => {
    const result = await caller.cms.paths.create({
      programId,
      slug: "test-path-i-" + Date.now(),
      number: "I",
      title: "Foundations",
      titleFr: "Les Fondations",
      cefrLevel: "A1",
      color: "#10b981",
      sortOrder: 1,
    });
    expect(result).toHaveProperty("id");
    pathId = result.id;
  });

  it("lists paths for the program", async () => {
    const paths = await caller.cms.paths.list({ programId });
    expect(paths.length).toBeGreaterThanOrEqual(1);
    expect(paths.some((p: any) => p.id === pathId)).toBe(true);
  });

  it("retrieves the created path", async () => {
    const path = await caller.cms.paths.get({ id: pathId });
    expect(path).not.toBeNull();
    expect(path!.title).toBe("Foundations");
    expect(path!.cefrLevel).toBe("A1");
  });

  it("updates the path", async () => {
    const updated = await caller.cms.paths.update({
      id: pathId,
      title: "Updated Foundations",
      cefrLevel: "A2",
    });
    expect(updated!.title).toBe("Updated Foundations");
    expect(updated!.cefrLevel).toBe("A2");
  });

  it("deletes the path and cleans up", async () => {
    await caller.cms.paths.delete({ id: pathId });
    const deleted = await caller.cms.paths.get({ id: pathId });
    expect(deleted).toBeNull();
    // Cleanup program
    await caller.cms.programs.delete({ id: programId });
  });
});

describe("CMS Router — Modules CRUD", () => {
  const { ctx } = createAdminContext();
  let caller: ReturnType<typeof appRouter.createCaller>;
  let programId: number;
  let pathId: number;
  let moduleId: number;

  beforeAll(async () => {
    caller = appRouter.createCaller(ctx);
    const prog = await caller.cms.programs.create({
      slug: "mod-test-prog-" + Date.now(),
      title: "Module Test Program",
      titleFr: "Programme Test Module",
    });
    programId = prog.id;
    const path = await caller.cms.paths.create({
      programId,
      slug: "mod-test-path-" + Date.now(),
      number: "I",
      title: "Test Path",
      titleFr: "Parcours Test",
      cefrLevel: "B1",
    });
    pathId = path.id;
  });

  it("creates a module", async () => {
    const result = await caller.cms.modules.create({
      pathId,
      title: "First Steps",
      titleFr: "Premiers Pas",
      quizPassingScore: 80,
      sortOrder: 1,
    });
    expect(result).toHaveProperty("id");
    moduleId = result.id;
  });

  it("lists modules for the path", async () => {
    const modules = await caller.cms.modules.list({ pathId });
    expect(modules.length).toBeGreaterThanOrEqual(1);
  });

  it("updates the module", async () => {
    const updated = await caller.cms.modules.update({
      id: moduleId,
      title: "Updated First Steps",
      quizPassingScore: 90,
    });
    expect(updated!.title).toBe("Updated First Steps");
  });

  it("deletes the module and cleans up", async () => {
    await caller.cms.modules.delete({ id: moduleId });
    await caller.cms.paths.delete({ id: pathId });
    await caller.cms.programs.delete({ id: programId });
  });
});

describe("CMS Router — Lessons & Slots CRUD", () => {
  const { ctx } = createAdminContext();
  let caller: ReturnType<typeof appRouter.createCaller>;
  let programId: number;
  let pathId: number;
  let moduleId: number;
  let lessonId: number;
  let slotId: number;

  beforeAll(async () => {
    caller = appRouter.createCaller(ctx);
    const prog = await caller.cms.programs.create({
      slug: "lesson-test-" + Date.now(),
      title: "Lesson Test",
      titleFr: "Test Leçon",
    });
    programId = prog.id;
    const path = await caller.cms.paths.create({
      programId,
      slug: "lesson-path-" + Date.now(),
      number: "I",
      title: "Lesson Path",
      titleFr: "Parcours Leçon",
      cefrLevel: "A1",
    });
    pathId = path.id;
    const mod = await caller.cms.modules.create({
      pathId,
      title: "Lesson Module",
      titleFr: "Module Leçon",
    });
    moduleId = mod.id;
  });

  it("creates a lesson", async () => {
    const result = await caller.cms.lessons.create({
      moduleId,
      lessonNumber: "1.1",
      title: "Hello, My Name Is...",
      titleFr: "Bonjour, je m'appelle...",
      duration: "50 min",
      xpReward: 100,
      sortOrder: 1,
    });
    expect(result).toHaveProperty("id");
    lessonId = result.id;
  });

  it("creates a lesson slot (hook)", async () => {
    const result = await caller.cms.slots.create({
      lessonId,
      slotType: "hook",
      title: "Warm-Up Activity",
      content: "## Welcome!\n\nLet's start with a quick warm-up exercise.",
      sortOrder: 0,
    });
    expect(result).toHaveProperty("id");
    slotId = result.id;
  });

  it("retrieves full lesson with slots", async () => {
    const full = await caller.cms.lessons.getFull({ id: lessonId });
    expect(full).not.toBeNull();
    expect(full!.title).toBe("Hello, My Name Is...");
    expect(full!.slots.length).toBe(1);
    expect(full!.slots[0].slotType).toBe("hook");
  });

  it("updates a slot", async () => {
    const updated = await caller.cms.slots.update({
      id: slotId,
      title: "Updated Warm-Up",
      content: "## Updated!\n\nNew warm-up content.",
    });
    expect(updated!.title).toBe("Updated Warm-Up");
  });

  it("deletes the slot", async () => {
    await caller.cms.slots.delete({ id: slotId });
    const full = await caller.cms.lessons.getFull({ id: lessonId });
    expect(full!.slots.length).toBe(0);
  });

  it("cleans up all test data", async () => {
    await caller.cms.lessons.delete({ id: lessonId });
    await caller.cms.modules.delete({ id: moduleId });
    await caller.cms.paths.delete({ id: pathId });
    await caller.cms.programs.delete({ id: programId });
  });
});

describe("CMS Router — Quizzes & Questions CRUD", () => {
  const { ctx } = createAdminContext();
  let caller: ReturnType<typeof appRouter.createCaller>;
  let programId: number;
  let pathId: number;
  let moduleId: number;
  let lessonId: number;
  let quizId: number;
  let questionId: number;

  beforeAll(async () => {
    caller = appRouter.createCaller(ctx);
    const prog = await caller.cms.programs.create({
      slug: "quiz-test-" + Date.now(),
      title: "Quiz Test",
      titleFr: "Test Quiz",
    });
    programId = prog.id;
    const path = await caller.cms.paths.create({
      programId,
      slug: "quiz-path-" + Date.now(),
      number: "I",
      title: "Quiz Path",
      titleFr: "Parcours Quiz",
      cefrLevel: "B2",
    });
    pathId = path.id;
    const mod = await caller.cms.modules.create({
      pathId,
      title: "Quiz Module",
      titleFr: "Module Quiz",
    });
    moduleId = mod.id;
    const lesson = await caller.cms.lessons.create({
      moduleId,
      lessonNumber: "1.1",
      title: "Quiz Lesson",
      titleFr: "Leçon Quiz",
    });
    lessonId = lesson.id;
  });

  it("creates a quiz", async () => {
    const result = await caller.cms.quizzes.create({
      lessonId,
      title: "Formative Quiz 1",
      quizType: "formative",
      passingScore: 70,
    });
    expect(result).toHaveProperty("id");
    quizId = result.id;
  });

  it("creates a question", async () => {
    const result = await caller.cms.questions.create({
      quizId,
      questionType: "multiple_choice",
      question: "What is the French word for 'hello'?",
      options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"],
      correctAnswer: "Bonjour",
      feedback: "Bonjour means hello in French.",
      points: 10,
      sortOrder: 0,
    });
    expect(result).toHaveProperty("id");
    questionId = result.id;
  });

  it("retrieves the full lesson with quiz and questions", async () => {
    const full = await caller.cms.lessons.getFull({ id: lessonId });
    expect(full!.quizzes.length).toBe(1);
    expect(full!.quizzes[0].questions.length).toBe(1);
    expect(full!.quizzes[0].questions[0].question).toBe("What is the French word for 'hello'?");
    expect(full!.quizzes[0].questions[0].correctAnswer).toBe("Bonjour");
  });

  it("updates a question", async () => {
    const updated = await caller.cms.questions.update({
      id: questionId,
      feedback: "Updated feedback: Bonjour is the standard French greeting.",
    });
    expect(updated!.feedback).toContain("Updated feedback");
  });

  it("deletes the question", async () => {
    await caller.cms.questions.delete({ id: questionId });
    const questions = await caller.cms.questions.list({ quizId });
    expect(questions.length).toBe(0);
  });

  it("cleans up all test data", async () => {
    await caller.cms.quizzes.delete({ id: quizId });
    await caller.cms.lessons.delete({ id: lessonId });
    await caller.cms.modules.delete({ id: moduleId });
    await caller.cms.paths.delete({ id: pathId });
    await caller.cms.programs.delete({ id: programId });
  });
});

describe("CMS Router — Stats", () => {
  it("returns stats overview", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.cms.stats.overview();
    expect(stats).toHaveProperty("programs");
    expect(stats).toHaveProperty("paths");
    expect(stats).toHaveProperty("modules");
    expect(stats).toHaveProperty("lessons");
    expect(stats).toHaveProperty("slots");
    expect(stats).toHaveProperty("quizzes");
    expect(stats).toHaveProperty("questions");
    expect(stats).toHaveProperty("media");
    expect(typeof stats.programs).toBe("number");
  });
});
