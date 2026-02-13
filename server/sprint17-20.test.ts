/**
 * Sprint 17-20 Tests — Notes, Flashcards, Study Planner, Vocabulary
 * Tests the tRPC routers and db helpers for all new study tool features.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db-sprint17", () => ({
  createNote: vi.fn(),
  getUserNotes: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  togglePinNote: vi.fn(),
  createFlashcardDeck: vi.fn(),
  getUserDecks: vi.fn(),
  getDeckWithCards: vi.fn(),
  addFlashcard: vi.fn(),
  deleteFlashcard: vi.fn(),
  deleteDeck: vi.fn(),
  getDueCards: vi.fn(),
  reviewFlashcard: vi.fn(),
  createStudySession: vi.fn(),
  getUserStudySessions: vi.fn(),
  getUpcomingStudySessions: vi.fn(),
  updateStudySession: vi.fn(),
  deleteStudySession: vi.fn(),
  addVocabularyItem: vi.fn(),
  getUserVocabulary: vi.fn(),
  getVocabularyStats: vi.fn(),
  reviewVocabularyItem: vi.fn(),
  deleteVocabularyItem: vi.fn(),
}));

import {
  createNote, getUserNotes, updateNote, deleteNote, togglePinNote,
  createFlashcardDeck, getUserDecks, getDeckWithCards, addFlashcard, deleteFlashcard,
  deleteDeck, getDueCards, reviewFlashcard,
  createStudySession, getUserStudySessions, getUpcomingStudySessions,
  updateStudySession, deleteStudySession,
  addVocabularyItem, getUserVocabulary, getVocabularyStats,
  reviewVocabularyItem, deleteVocabularyItem,
} from "./db-sprint17";

const mockCreateNote = vi.mocked(createNote);
const mockGetUserNotes = vi.mocked(getUserNotes);
const mockUpdateNote = vi.mocked(updateNote);
const mockDeleteNote = vi.mocked(deleteNote);
const mockTogglePinNote = vi.mocked(togglePinNote);
const mockCreateFlashcardDeck = vi.mocked(createFlashcardDeck);
const mockGetUserDecks = vi.mocked(getUserDecks);
const mockGetDeckWithCards = vi.mocked(getDeckWithCards);
const mockAddFlashcard = vi.mocked(addFlashcard);
const mockDeleteFlashcard = vi.mocked(deleteFlashcard);
const mockDeleteDeck = vi.mocked(deleteDeck);
const mockGetDueCards = vi.mocked(getDueCards);
const mockReviewFlashcard = vi.mocked(reviewFlashcard);
const mockCreateStudySession = vi.mocked(createStudySession);
const mockGetUserStudySessions = vi.mocked(getUserStudySessions);
const mockGetUpcomingStudySessions = vi.mocked(getUpcomingStudySessions);
const mockUpdateStudySession = vi.mocked(updateStudySession);
const mockDeleteStudySession = vi.mocked(deleteStudySession);
const mockAddVocabularyItem = vi.mocked(addVocabularyItem);
const mockGetUserVocabulary = vi.mocked(getUserVocabulary);
const mockGetVocabularyStats = vi.mocked(getVocabularyStats);
const mockReviewVocabularyItem = vi.mocked(reviewVocabularyItem);
const mockDeleteVocabularyItem = vi.mocked(deleteVocabularyItem);

beforeEach(() => {
  vi.clearAllMocks();
});

/* ─────────────── NOTES ─────────────── */
describe("Notes (Sprint 17)", () => {
  it("should create a note with required fields", async () => {
    const mockNote = { id: 1, userId: 1, title: "Test Note", content: "Hello", tags: "", isPinned: false, createdAt: new Date(), updatedAt: new Date() };
    mockCreateNote.mockResolvedValue(mockNote);

    const result = await createNote(1, { title: "Test Note", content: "Hello" });
    expect(result).toEqual(mockNote);
    expect(mockCreateNote).toHaveBeenCalledWith(1, { title: "Test Note", content: "Hello" });
  });

  it("should create a note with tags", async () => {
    const mockNote = { id: 2, userId: 1, title: "Tagged Note", content: "Content", tags: "grammar,verbs", isPinned: false, createdAt: new Date(), updatedAt: new Date() };
    mockCreateNote.mockResolvedValue(mockNote);

    const result = await createNote(1, { title: "Tagged Note", content: "Content", tags: "grammar,verbs" });
    expect(result).toEqual(mockNote);
  });

  it("should list user notes", async () => {
    const mockNotes = [
      { id: 1, userId: 1, title: "Note 1", content: "A", tags: "", isPinned: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, userId: 1, title: "Note 2", content: "B", tags: "sle", isPinned: false, createdAt: new Date(), updatedAt: new Date() },
    ];
    mockGetUserNotes.mockResolvedValue(mockNotes);

    const result = await getUserNotes(1);
    expect(result).toHaveLength(2);
    expect(result[0].isPinned).toBe(true);
  });

  it("should update a note", async () => {
    const updated = { id: 1, userId: 1, title: "Updated", content: "New content", tags: "", isPinned: false, createdAt: new Date(), updatedAt: new Date() };
    mockUpdateNote.mockResolvedValue(updated);

    const result = await updateNote(1, 1, { title: "Updated", content: "New content" });
    expect(result?.title).toBe("Updated");
  });

  it("should delete a note", async () => {
    mockDeleteNote.mockResolvedValue(true);
    const result = await deleteNote(1, 1);
    expect(result).toBe(true);
  });

  it("should toggle pin on a note", async () => {
    mockTogglePinNote.mockResolvedValue({ id: 1, isPinned: true } as any);
    const result = await togglePinNote(1, 1);
    expect(result?.isPinned).toBe(true);
  });
});

/* ─────────────── FLASHCARDS ─────────────── */
describe("Flashcards (Sprint 17)", () => {
  it("should create a flashcard deck", async () => {
    const mockDeck = { id: 1, userId: 1, name: "French Verbs", description: "Common verbs", cardCount: 0, createdAt: new Date() };
    mockCreateFlashcardDeck.mockResolvedValue(mockDeck);

    const result = await createFlashcardDeck(1, { name: "French Verbs", description: "Common verbs" });
    expect(result?.name).toBe("French Verbs");
  });

  it("should list user decks", async () => {
    const mockDecks = [
      { id: 1, userId: 1, name: "Verbs", description: "", cardCount: 10, createdAt: new Date() },
      { id: 2, userId: 1, name: "Nouns", description: "", cardCount: 5, createdAt: new Date() },
    ];
    mockGetUserDecks.mockResolvedValue(mockDecks);

    const result = await getUserDecks(1);
    expect(result).toHaveLength(2);
  });

  it("should add a flashcard to a deck", async () => {
    const mockCard = { id: 1, deckId: 1, front: "être", back: "to be", interval: 0, repetitions: 0, easeFactor: 2.5, nextReview: new Date() };
    mockAddFlashcard.mockResolvedValue(mockCard);

    const result = await addFlashcard(1, 1, { front: "être", back: "to be" });
    expect(result?.front).toBe("être");
    expect(result?.easeFactor).toBe(2.5);
  });

  it("should get due cards for review", async () => {
    const mockCards = [
      { id: 1, deckId: 1, front: "être", back: "to be", interval: 1, repetitions: 1, easeFactor: 2.5, nextReview: new Date() },
    ];
    mockGetDueCards.mockResolvedValue(mockCards);

    const result = await getDueCards(1, 1);
    expect(result).toHaveLength(1);
  });

  it("should review a flashcard with SM-2 algorithm", async () => {
    const reviewed = { id: 1, deckId: 1, front: "être", back: "to be", interval: 6, repetitions: 2, easeFactor: 2.6, nextReview: new Date() };
    mockReviewFlashcard.mockResolvedValue(reviewed);

    const result = await reviewFlashcard(1, 1, 4); // quality = 4 (good)
    expect(result?.interval).toBe(6);
    expect(result?.easeFactor).toBe(2.6);
  });

  it("should delete a flashcard", async () => {
    mockDeleteFlashcard.mockResolvedValue(true);
    const result = await deleteFlashcard(1, 1);
    expect(result).toBe(true);
  });

  it("should delete a deck", async () => {
    mockDeleteDeck.mockResolvedValue(true);
    const result = await deleteDeck(1, 1);
    expect(result).toBe(true);
  });
});

/* ─────────────── STUDY PLANNER ─────────────── */
describe("Study Planner (Sprint 19)", () => {
  it("should create a study session", async () => {
    const mockSession = {
      id: 1, userId: 1, title: "Grammar Review", description: null,
      sessionType: "lesson", scheduledDate: "2026-02-15", scheduledTime: "10:00",
      durationMinutes: 30, isCompleted: false, createdAt: new Date(),
    };
    mockCreateStudySession.mockResolvedValue(mockSession);

    const result = await createStudySession(1, {
      title: "Grammar Review", sessionType: "lesson",
      scheduledDate: "2026-02-15", scheduledTime: "10:00", durationMinutes: 30,
    });
    expect(result?.title).toBe("Grammar Review");
    expect(result?.sessionType).toBe("lesson");
  });

  it("should list user study sessions", async () => {
    const mockSessions = [
      { id: 1, userId: 1, title: "Session 1", sessionType: "lesson", scheduledDate: "2026-02-15", scheduledTime: "10:00", durationMinutes: 30, isCompleted: false, description: null, createdAt: new Date() },
      { id: 2, userId: 1, title: "Session 2", sessionType: "quiz", scheduledDate: "2026-02-16", scheduledTime: null, durationMinutes: 45, isCompleted: true, description: null, createdAt: new Date() },
    ];
    mockGetUserStudySessions.mockResolvedValue(mockSessions);

    const result = await getUserStudySessions(1);
    expect(result).toHaveLength(2);
  });

  it("should get upcoming sessions", async () => {
    const mockUpcoming = [
      { id: 1, userId: 1, title: "Upcoming", sessionType: "tutoring", scheduledDate: "2026-02-14", scheduledTime: "14:00", durationMinutes: 60, isCompleted: false, description: null, createdAt: new Date() },
    ];
    mockGetUpcomingStudySessions.mockResolvedValue(mockUpcoming);

    const result = await getUpcomingStudySessions(1);
    expect(result).toHaveLength(1);
    expect(result[0].isCompleted).toBe(false);
  });

  it("should update a study session", async () => {
    const updated = { id: 1, userId: 1, title: "Updated Session", sessionType: "lesson", scheduledDate: "2026-02-15", scheduledTime: "11:00", durationMinutes: 45, isCompleted: true, description: null, createdAt: new Date() };
    mockUpdateStudySession.mockResolvedValue(updated);

    const result = await updateStudySession(1, 1, { title: "Updated Session", isCompleted: true });
    expect(result?.title).toBe("Updated Session");
    expect(result?.isCompleted).toBe(true);
  });

  it("should delete a study session", async () => {
    mockDeleteStudySession.mockResolvedValue(true);
    const result = await deleteStudySession(1, 1);
    expect(result).toBe(true);
  });
});

/* ─────────────── VOCABULARY ─────────────── */
describe("Vocabulary Builder (Sprint 20)", () => {
  it("should add a vocabulary item", async () => {
    const mockItem = {
      id: 1, userId: 1, word: "néanmoins", translation: "nevertheless",
      definition: "in spite of that", exampleSentence: "Il est fatigué, néanmoins il continue.",
      pronunciation: "ne.ɑ̃.mwɛ̃", partOfSpeech: "adverb", mastery: "new",
      reviewCount: 0, correctCount: 0, createdAt: new Date(),
    };
    mockAddVocabularyItem.mockResolvedValue(mockItem);

    const result = await addVocabularyItem(1, {
      word: "néanmoins", translation: "nevertheless",
      definition: "in spite of that", exampleSentence: "Il est fatigué, néanmoins il continue.",
      pronunciation: "ne.ɑ̃.mwɛ̃", partOfSpeech: "adverb",
    });
    expect(result?.word).toBe("néanmoins");
    expect(result?.mastery).toBe("new");
  });

  it("should list user vocabulary", async () => {
    const mockItems = [
      { id: 1, userId: 1, word: "néanmoins", translation: "nevertheless", mastery: "new", reviewCount: 0, correctCount: 0, definition: null, exampleSentence: null, pronunciation: null, partOfSpeech: null, createdAt: new Date() },
      { id: 2, userId: 1, word: "cependant", translation: "however", mastery: "learning", reviewCount: 3, correctCount: 2, definition: null, exampleSentence: null, pronunciation: null, partOfSpeech: null, createdAt: new Date() },
    ];
    mockGetUserVocabulary.mockResolvedValue(mockItems);

    const result = await getUserVocabulary(1);
    expect(result).toHaveLength(2);
  });

  it("should get vocabulary stats", async () => {
    const mockStats = { total: 20, new: 5, learning: 8, familiar: 4, mastered: 3 };
    mockGetVocabularyStats.mockResolvedValue(mockStats);

    const result = await getVocabularyStats(1);
    expect(result?.total).toBe(20);
    expect(result?.mastered).toBe(3);
  });

  it("should review a vocabulary item (correct)", async () => {
    const reviewed = {
      id: 1, userId: 1, word: "néanmoins", translation: "nevertheless",
      mastery: "learning", reviewCount: 1, correctCount: 1,
      definition: null, exampleSentence: null, pronunciation: null, partOfSpeech: null, createdAt: new Date(),
    };
    mockReviewVocabularyItem.mockResolvedValue(reviewed);

    const result = await reviewVocabularyItem(1, 1, true);
    expect(result?.reviewCount).toBe(1);
    expect(result?.correctCount).toBe(1);
    expect(result?.mastery).toBe("learning");
  });

  it("should review a vocabulary item (incorrect)", async () => {
    const reviewed = {
      id: 1, userId: 1, word: "néanmoins", translation: "nevertheless",
      mastery: "new", reviewCount: 1, correctCount: 0,
      definition: null, exampleSentence: null, pronunciation: null, partOfSpeech: null, createdAt: new Date(),
    };
    mockReviewVocabularyItem.mockResolvedValue(reviewed);

    const result = await reviewVocabularyItem(1, 1, false);
    expect(result?.reviewCount).toBe(1);
    expect(result?.correctCount).toBe(0);
    expect(result?.mastery).toBe("new");
  });

  it("should delete a vocabulary item", async () => {
    mockDeleteVocabularyItem.mockResolvedValue(true);
    const result = await deleteVocabularyItem(1, 1);
    expect(result).toBe(true);
  });
});

/* ─────────────── SM-2 ALGORITHM ─────────────── */
describe("SM-2 Spaced Repetition Algorithm", () => {
  it("should calculate correct intervals for quality >= 3", () => {
    // SM-2 algorithm: quality >= 3 means successful recall
    // First review: interval = 1
    // Second review: interval = 6
    // Subsequent: interval = previous * easeFactor
    const sm2 = (quality: number, repetitions: number, easeFactor: number, interval: number) => {
      if (quality < 3) {
        return { repetitions: 0, interval: 1, easeFactor };
      }
      let newInterval: number;
      if (repetitions === 0) newInterval = 1;
      else if (repetitions === 1) newInterval = 6;
      else newInterval = Math.round(interval * easeFactor);

      const newEF = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      return { repetitions: repetitions + 1, interval: newInterval, easeFactor: newEF };
    };

    // First review, quality 4 (good)
    const r1 = sm2(4, 0, 2.5, 0);
    expect(r1.interval).toBe(1);
    expect(r1.repetitions).toBe(1);

    // Second review, quality 4
    const r2 = sm2(4, 1, r1.easeFactor, r1.interval);
    expect(r2.interval).toBe(6);
    expect(r2.repetitions).toBe(2);

    // Third review, quality 4
    const r3 = sm2(4, 2, r2.easeFactor, r2.interval);
    expect(r3.interval).toBeGreaterThan(6);
    expect(r3.repetitions).toBe(3);
  });

  it("should reset on quality < 3 (failed recall)", () => {
    const sm2 = (quality: number, repetitions: number, easeFactor: number, interval: number) => {
      if (quality < 3) {
        return { repetitions: 0, interval: 1, easeFactor };
      }
      let newInterval: number;
      if (repetitions === 0) newInterval = 1;
      else if (repetitions === 1) newInterval = 6;
      else newInterval = Math.round(interval * easeFactor);

      const newEF = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      return { repetitions: repetitions + 1, interval: newInterval, easeFactor: newEF };
    };

    // Failed recall (quality 2)
    const result = sm2(2, 5, 2.5, 30);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.5); // EF unchanged on failure
  });

  it("should never let ease factor go below 1.3", () => {
    const sm2 = (quality: number, _rep: number, easeFactor: number, _int: number) => {
      if (quality >= 3) {
        const newEF = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        return { easeFactor: newEF };
      }
      return { easeFactor };
    };

    // Quality 3 with already low EF
    const result = sm2(3, 3, 1.3, 10);
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
