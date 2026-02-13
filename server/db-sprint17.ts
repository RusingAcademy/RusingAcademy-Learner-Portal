/**
 * Sprint 17-20 DB Helpers — Notes, Flashcards, Study Sessions, Vocabulary
 */
import { eq, and, desc, sql, lte, asc } from "drizzle-orm";
import { getDb } from "./db";
import {
  studyNotes,
  flashcardDecks,
  flashcards,
  studySessions,
  vocabularyItems,
} from "../drizzle/schema";

/* ═══════════════════════════ STUDY NOTES ═══════════════════════════ */

export async function getUserNotes(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studyNotes)
    .where(eq(studyNotes.userId, userId))
    .orderBy(desc(studyNotes.isPinned), desc(studyNotes.updatedAt))
    .limit(limit);
}

export async function createNote(data: {
  userId: number; title: string; content: string;
  tags?: string[]; programId?: string; pathId?: string; lessonId?: string;
  color?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(studyNotes).values(data);
  const [created] = await db.select().from(studyNotes)
    .where(and(eq(studyNotes.userId, data.userId), eq(studyNotes.title, data.title)))
    .orderBy(desc(studyNotes.createdAt)).limit(1);
  return created ?? null;
}

export async function updateNote(noteId: number, userId: number, data: {
  title?: string; content?: string; tags?: string[];
  isPinned?: boolean; color?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.update(studyNotes).set(data)
    .where(and(eq(studyNotes.id, noteId), eq(studyNotes.userId, userId)));
  const [updated] = await db.select().from(studyNotes)
    .where(and(eq(studyNotes.id, noteId), eq(studyNotes.userId, userId))).limit(1);
  return updated ?? null;
}

export async function deleteNote(noteId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(studyNotes)
    .where(and(eq(studyNotes.id, noteId), eq(studyNotes.userId, userId)));
  return true;
}

/* ═══════════════════════════ FLASHCARD DECKS ═══════════════════════ */

export async function getUserDecks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(flashcardDecks)
    .where(eq(flashcardDecks.userId, userId))
    .orderBy(desc(flashcardDecks.updatedAt));
}

export async function createDeck(data: {
  userId: number; name: string; description?: string;
  programId?: string; pathId?: string; color?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(flashcardDecks).values(data);
  const [created] = await db.select().from(flashcardDecks)
    .where(and(eq(flashcardDecks.userId, data.userId), eq(flashcardDecks.name, data.name)))
    .orderBy(desc(flashcardDecks.createdAt)).limit(1);
  return created ?? null;
}

export async function updateDeck(deckId: number, userId: number, data: {
  name?: string; description?: string; color?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.update(flashcardDecks).set(data)
    .where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)));
  return { deckId, ...data };
}

export async function deleteDeck(deckId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  // Delete all cards in the deck first
  await db.delete(flashcards)
    .where(and(eq(flashcards.deckId, deckId), eq(flashcards.userId, userId)));
  await db.delete(flashcardDecks)
    .where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)));
  return true;
}

/* ═══════════════════════════ FLASHCARDS ════════════════════════════ */

export async function getDeckCards(deckId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(flashcards)
    .where(and(eq(flashcards.deckId, deckId), eq(flashcards.userId, userId)))
    .orderBy(asc(flashcards.createdAt));
}

export async function createCard(data: {
  userId: number; deckId: number; front: string; back: string; hint?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const today = new Date().toISOString().slice(0, 10);
  await db.insert(flashcards).values({ ...data, nextReviewDate: today });
  // Update deck card count
  await db.update(flashcardDecks)
    .set({ cardCount: sql`cardCount + 1` })
    .where(eq(flashcardDecks.id, data.deckId));
  const [created] = await db.select().from(flashcards)
    .where(and(eq(flashcards.deckId, data.deckId), eq(flashcards.userId, data.userId)))
    .orderBy(desc(flashcards.createdAt)).limit(1);
  return created ?? null;
}

export async function updateCard(cardId: number, userId: number, data: {
  front?: string; back?: string; hint?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.update(flashcards).set(data)
    .where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId)));
  return { cardId, ...data };
}

export async function deleteCard(cardId: number, userId: number, deckId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(flashcards)
    .where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId)));
  await db.update(flashcardDecks)
    .set({ cardCount: sql`GREATEST(cardCount - 1, 0)` })
    .where(eq(flashcardDecks.id, deckId));
  return true;
}

/**
 * SM-2 Spaced Repetition Review
 * quality: 0-5 (0=blackout, 5=perfect)
 */
export async function reviewCard(cardId: number, userId: number, quality: number) {
  const db = await getDb();
  if (!db) return null;
  const [card] = await db.select().from(flashcards)
    .where(and(eq(flashcards.id, cardId), eq(flashcards.userId, userId))).limit(1);
  if (!card) return null;

  let ef = card.easeFactor; // stored as x100
  let interval = card.interval;
  let reps = card.repetitions;

  if (quality < 3) {
    // Failed — reset
    reps = 0;
    interval = 0;
  } else {
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * (ef / 100));
    }
    reps += 1;
  }

  // Update ease factor (EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02)))
  ef = ef + Math.round((0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)) * 100);
  if (ef < 130) ef = 130; // minimum 1.3

  const today = new Date();
  const nextDate = new Date(today.getTime() + interval * 86400000);
  const nextReviewDate = nextDate.toISOString().slice(0, 10);
  const lastReviewDate = today.toISOString().slice(0, 10);

  // Determine status
  let status: "new" | "learning" | "review" | "mastered" = "learning";
  if (reps === 0) status = "learning";
  else if (interval >= 21 && ef >= 250) status = "mastered";
  else if (interval >= 1) status = "review";

  await db.update(flashcards).set({
    easeFactor: ef,
    interval,
    repetitions: reps,
    nextReviewDate,
    lastReviewDate,
    status,
  }).where(eq(flashcards.id, cardId));

  return { cardId, easeFactor: ef, interval, repetitions: reps, nextReviewDate, status };
}

export async function getDueCards(userId: number, deckId?: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().slice(0, 10);
  const conditions = [
    eq(flashcards.userId, userId),
    lte(flashcards.nextReviewDate, today),
  ];
  if (deckId) conditions.push(eq(flashcards.deckId, deckId));
  return db.select().from(flashcards)
    .where(and(...conditions))
    .orderBy(asc(flashcards.nextReviewDate))
    .limit(limit);
}

export async function getFlashcardStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, new: 0, learning: 0, review: 0, mastered: 0, dueToday: 0 };
  const today = new Date().toISOString().slice(0, 10);
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(flashcards).where(eq(flashcards.userId, userId));
  const [newCards] = await db.select({ count: sql<number>`count(*)` }).from(flashcards).where(and(eq(flashcards.userId, userId), eq(flashcards.status, "new")));
  const [learning] = await db.select({ count: sql<number>`count(*)` }).from(flashcards).where(and(eq(flashcards.userId, userId), eq(flashcards.status, "learning")));
  const [review] = await db.select({ count: sql<number>`count(*)` }).from(flashcards).where(and(eq(flashcards.userId, userId), eq(flashcards.status, "review")));
  const [mastered] = await db.select({ count: sql<number>`count(*)` }).from(flashcards).where(and(eq(flashcards.userId, userId), eq(flashcards.status, "mastered")));
  const [due] = await db.select({ count: sql<number>`count(*)` }).from(flashcards).where(and(eq(flashcards.userId, userId), lte(flashcards.nextReviewDate, today)));
  return {
    total: total?.count ?? 0,
    new: newCards?.count ?? 0,
    learning: learning?.count ?? 0,
    review: review?.count ?? 0,
    mastered: mastered?.count ?? 0,
    dueToday: due?.count ?? 0,
  };
}

/* ═══════════════════════════ STUDY SESSIONS ════════════════════════ */

export async function getUserStudySessions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(asc(studySessions.scheduledDate), asc(studySessions.scheduledTime))
    .limit(limit);
}

export async function createStudySession(data: {
  userId: number; title: string; description?: string;
  sessionType?: "lesson" | "quiz" | "sle_practice" | "flashcard_review" | "tutoring" | "custom";
  scheduledDate: string; scheduledTime?: string; durationMinutes?: number;
  programId?: string; pathId?: string; lessonId?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(studySessions).values(data);
  const [created] = await db.select().from(studySessions)
    .where(and(eq(studySessions.userId, data.userId), eq(studySessions.scheduledDate, data.scheduledDate)))
    .orderBy(desc(studySessions.createdAt)).limit(1);
  return created ?? null;
}

export async function updateStudySession(sessionId: number, userId: number, data: {
  title?: string; description?: string; scheduledDate?: string;
  scheduledTime?: string; durationMinutes?: number; isCompleted?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const updates: Record<string, unknown> = { ...data };
  if (data.isCompleted) updates.completedAt = new Date();
  await db.update(studySessions).set(updates)
    .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId)));
  return { sessionId, ...data };
}

export async function deleteStudySession(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(studySessions)
    .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId)));
  return true;
}

export async function getUpcomingSessions(userId: number, days = 7) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().slice(0, 10);
  const futureDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  return db.select().from(studySessions)
    .where(and(
      eq(studySessions.userId, userId),
      sql`${studySessions.scheduledDate} >= ${today}`,
      sql`${studySessions.scheduledDate} <= ${futureDate}`,
      eq(studySessions.isCompleted, false)
    ))
    .orderBy(asc(studySessions.scheduledDate), asc(studySessions.scheduledTime))
    .limit(10);
}

/* ═══════════════════════════ VOCABULARY ════════════════════════════ */

export async function getUserVocabulary(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vocabularyItems)
    .where(eq(vocabularyItems.userId, userId))
    .orderBy(desc(vocabularyItems.updatedAt))
    .limit(limit);
}

export async function addVocabularyItem(data: {
  userId: number; word: string; translation: string;
  definition?: string; exampleSentence?: string; pronunciation?: string;
  partOfSpeech?: string; programId?: string; pathId?: string; lessonId?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  // Check if word already exists for user
  const [existing] = await db.select().from(vocabularyItems)
    .where(and(eq(vocabularyItems.userId, data.userId), eq(vocabularyItems.word, data.word)))
    .limit(1);
  if (existing) return existing;
  await db.insert(vocabularyItems).values(data);
  const [created] = await db.select().from(vocabularyItems)
    .where(and(eq(vocabularyItems.userId, data.userId), eq(vocabularyItems.word, data.word)))
    .limit(1);
  return created ?? null;
}

export async function updateVocabularyMastery(itemId: number, userId: number, correct: boolean) {
  const db = await getDb();
  if (!db) return null;
  const [item] = await db.select().from(vocabularyItems)
    .where(and(eq(vocabularyItems.id, itemId), eq(vocabularyItems.userId, userId))).limit(1);
  if (!item) return null;
  const newReviewCount = item.reviewCount + 1;
  const newCorrectCount = item.correctCount + (correct ? 1 : 0);
  const ratio = newCorrectCount / newReviewCount;
  let mastery: "new" | "learning" | "familiar" | "mastered" = "new";
  if (newReviewCount >= 10 && ratio >= 0.9) mastery = "mastered";
  else if (newReviewCount >= 5 && ratio >= 0.7) mastery = "familiar";
  else if (newReviewCount >= 1) mastery = "learning";
  await db.update(vocabularyItems).set({
    reviewCount: newReviewCount,
    correctCount: newCorrectCount,
    mastery,
  }).where(eq(vocabularyItems.id, itemId));
  return { itemId, mastery, reviewCount: newReviewCount, correctCount: newCorrectCount };
}

export async function deleteVocabularyItem(itemId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(vocabularyItems)
    .where(and(eq(vocabularyItems.id, itemId), eq(vocabularyItems.userId, userId)));
  return true;
}

export async function getVocabularyStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, new: 0, learning: 0, familiar: 0, mastered: 0 };
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(vocabularyItems).where(eq(vocabularyItems.userId, userId));
  const [newW] = await db.select({ count: sql<number>`count(*)` }).from(vocabularyItems).where(and(eq(vocabularyItems.userId, userId), eq(vocabularyItems.mastery, "new")));
  const [learning] = await db.select({ count: sql<number>`count(*)` }).from(vocabularyItems).where(and(eq(vocabularyItems.userId, userId), eq(vocabularyItems.mastery, "learning")));
  const [familiar] = await db.select({ count: sql<number>`count(*)` }).from(vocabularyItems).where(and(eq(vocabularyItems.userId, userId), eq(vocabularyItems.mastery, "familiar")));
  const [mastered] = await db.select({ count: sql<number>`count(*)` }).from(vocabularyItems).where(and(eq(vocabularyItems.userId, userId), eq(vocabularyItems.mastery, "mastered")));
  return {
    total: total?.count ?? 0,
    new: newW?.count ?? 0,
    learning: learning?.count ?? 0,
    familiar: familiar?.count ?? 0,
    mastered: mastered?.count ?? 0,
  };
}
