/**
 * DB Helpers — Sprints 41-50
 * Mock SLE Exams, Coach Assignments, Study Groups, Bookmarks, Dictation, Onboarding
 */
import { eq, and, desc, sql, asc } from "drizzle-orm";
import { getDb } from "./db";
import {
  mockSleExams, coachAssignments, studyGroups, studyGroupMembers,
  bookmarks, dictationExercises, onboardingProfiles, users,
  gamificationProfiles, flashcards, flashcardDecks,
  studyNotes, vocabularyItems, discussionThreads,
} from "../drizzle/schema";

/* ─────────────── MOCK SLE EXAMS ─────────────── */
export async function createMockExam(data: {
  userId: number; examType: "reading" | "writing" | "oral";
  cefrLevel: string; totalQuestions: number; timeLimitSeconds: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(mockSleExams).values({
    userId: data.userId,
    examType: data.examType,
    cefrLevel: data.cefrLevel as any,
    totalQuestions: data.totalQuestions,
    timeLimitSeconds: data.timeLimitSeconds,
  }).$returningId();
  return result[0];
}

export async function completeMockExam(examId: number, data: {
  correctAnswers: number; score: number; timeUsedSeconds: number; answers: any;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(mockSleExams).set({
    correctAnswers: data.correctAnswers,
    score: data.score,
    timeUsedSeconds: data.timeUsedSeconds,
    answers: data.answers,
    status: "completed",
    completedAt: new Date(),
  }).where(eq(mockSleExams.id, examId));
}

export async function getUserMockExams(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mockSleExams)
    .where(eq(mockSleExams.userId, userId))
    .orderBy(desc(mockSleExams.createdAt));
}

export async function getMockExamById(examId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(mockSleExams)
    .where(eq(mockSleExams.id, examId));
  return rows[0] || null;
}

/* ─────────────── COACH ASSIGNMENTS ─────────────── */
export async function createCoachAssignment(data: {
  coachId: number; studentId: number; notes?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(coachAssignments).values(data).$returningId();
  return result[0];
}

export async function getCoachStudents(coachId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachAssignments)
    .where(and(eq(coachAssignments.coachId, coachId), eq(coachAssignments.status, "active")))
    .orderBy(desc(coachAssignments.createdAt));
}

export async function getStudentCoach(studentId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(coachAssignments)
    .where(and(eq(coachAssignments.studentId, studentId), eq(coachAssignments.status, "active")));
  return rows[0] || null;
}

export async function updateCoachAssignment(id: number, data: { status?: string; notes?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(coachAssignments).set({ ...data, updatedAt: new Date() } as any).where(eq(coachAssignments.id, id));
}

/* ─────────────── STUDY GROUPS ─────────────── */
export async function createStudyGroup(data: {
  name: string; description?: string; creatorId: number;
  maxMembers?: number; cefrLevel?: string; isPublic?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(studyGroups).values({
    name: data.name,
    description: data.description,
    creatorId: data.creatorId,
    maxMembers: data.maxMembers || 10,
    cefrLevel: (data.cefrLevel || "B1") as any,
    isPublic: data.isPublic !== false,
  }).$returningId();
  const groupId = result[0].id;
  // Creator auto-joins as admin
  await db.insert(studyGroupMembers).values({
    groupId, userId: data.creatorId, role: "admin",
  });
  return { id: groupId };
}

export async function getPublicStudyGroups() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studyGroups)
    .where(eq(studyGroups.isPublic, true))
    .orderBy(desc(studyGroups.createdAt));
}

export async function getUserStudyGroups(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const memberships = await db.select().from(studyGroupMembers)
    .where(eq(studyGroupMembers.userId, userId));
  if (memberships.length === 0) return [];
  const groupIds = memberships.map(m => m.groupId);
  const groups = await db.select().from(studyGroups);
  return groups.filter(g => groupIds.includes(g.id));
}

export async function joinStudyGroup(groupId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(studyGroupMembers).values({ groupId, userId, role: "member" });
}

export async function leaveStudyGroup(groupId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(studyGroupMembers)
    .where(and(eq(studyGroupMembers.groupId, groupId), eq(studyGroupMembers.userId, userId)));
}

export async function getGroupMembers(groupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studyGroupMembers)
    .where(eq(studyGroupMembers.groupId, groupId))
    .orderBy(asc(studyGroupMembers.joinedAt));
}

/* ─────────────── BOOKMARKS ─────────────── */
export async function createBookmark(data: {
  userId: number; itemType: string; itemId: number; itemTitle?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(bookmarks).values(data as any).$returningId();
  return result[0];
}

export async function removeBookmark(userId: number, itemType: string, itemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(bookmarks).where(
    and(eq(bookmarks.userId, userId), eq(bookmarks.itemType, itemType as any), eq(bookmarks.itemId, itemId))
  );
}

export async function getUserBookmarks(userId: number, itemType?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(bookmarks.userId, userId)];
  if (itemType) conditions.push(eq(bookmarks.itemType, itemType as any));
  return db.select().from(bookmarks)
    .where(and(...conditions))
    .orderBy(desc(bookmarks.createdAt));
}

export async function isBookmarked(userId: number, itemType: string, itemId: number) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select().from(bookmarks).where(
    and(eq(bookmarks.userId, userId), eq(bookmarks.itemType, itemType as any), eq(bookmarks.itemId, itemId))
  );
  return rows.length > 0;
}

/* ─────────────── DICTATION EXERCISES ─────────────── */
export async function saveDictationResult(data: {
  userId: number; cefrLevel: string; totalSentences: number;
  correctSentences: number; accuracy: number; timeSpentSeconds: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(dictationExercises).values(data as any).$returningId();
  return result[0];
}

export async function getUserDictationHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dictationExercises)
    .where(eq(dictationExercises.userId, userId))
    .orderBy(desc(dictationExercises.createdAt));
}

/* ─────────────── ONBOARDING ─────────────── */
export async function getOnboardingProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(onboardingProfiles)
    .where(eq(onboardingProfiles.userId, userId));
  return rows[0] || null;
}

export async function saveOnboardingProfile(data: {
  userId: number; currentLevel: string; targetLevel: string;
  learningGoal: string; weeklyHours: number; preferredTime: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getOnboardingProfile(data.userId);
  if (existing) {
    await db.update(onboardingProfiles).set({
      ...data as any,
      completedOnboarding: true,
      updatedAt: new Date(),
    }).where(eq(onboardingProfiles.userId, data.userId));
    return existing;
  }
  const result = await db.insert(onboardingProfiles).values({
    ...data as any,
    completedOnboarding: true,
  }).$returningId();
  return result[0];
}

/* ─────────────── SPACED REPETITION QUEUE ─────────────── */
export async function getDueFlashcards(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  // Get user's decks
  const decks = await db.select().from(flashcardDecks)
    .where(eq(flashcardDecks.userId, userId));
  if (decks.length === 0) return [];
  const deckIds = decks.map(d => d.id);
  // Get all cards from user's decks
  const allCards = await db.select().from(flashcards);
  return allCards.filter(c =>
    deckIds.includes(c.deckId) &&
    (!c.nextReviewDate || new Date(c.nextReviewDate) <= now)
  ).sort((a, b) => {
    const aDate = a.nextReviewDate ? new Date(a.nextReviewDate).getTime() : 0;
    const bDate = b.nextReviewDate ? new Date(b.nextReviewDate).getTime() : 0;
    return aDate - bDate;
  });
}

/* ─────────────── GLOBAL SEARCH ─────────────── */
export async function globalSearch(userId: number, query: string) {
  const db = await getDb();
  if (!db) return { notes: [], vocabulary: [], discussions: [] };
  const term = `%${query}%`;
  // Search across multiple tables in parallel
  const [notesResults, vocabResults, discussionResults] = await Promise.all([
    db.select().from(studyNotes)
      .where(and(
        eq(studyNotes.userId, userId),
        sql`(title LIKE ${term} OR content LIKE ${term})`
      )).limit(10),
    db.select().from(vocabularyItems)
      .where(and(
        eq(vocabularyItems.userId, userId),
        sql`(word LIKE ${term} OR translation LIKE ${term} OR definition LIKE ${term})`
      )).limit(10),
    db.select().from(discussionThreads)
      .where(sql`(title LIKE ${term} OR content LIKE ${term})`)
      .limit(10),
  ]);
  return {
    notes: notesResults.map((n: any) => ({ ...n, type: "note" as const })),
    vocabulary: vocabResults.map((v: any) => ({ ...v, type: "vocabulary" as const })),
    discussions: discussionResults.map((d: any) => ({ ...d, type: "discussion" as const })),
  };
}
