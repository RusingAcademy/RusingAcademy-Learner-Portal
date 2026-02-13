import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/* ───────────────────────────── USERS ───────────────────────────── */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "fr"]).default("en").notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ───────────────────────── GAMIFICATION PROFILE ───────────────── */
export const gamificationProfiles = mysqlTable("gamification_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalXp: int("totalXp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActivityDate: varchar("lastActivityDate", { length: 10 }),
  lessonsCompleted: int("lessonsCompleted").default(0).notNull(),
  quizzesCompleted: int("quizzesCompleted").default(0).notNull(),
  perfectQuizzes: int("perfectQuizzes").default(0).notNull(),
  totalStudyTimeMinutes: int("totalStudyTimeMinutes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GamificationProfile = typeof gamificationProfiles.$inferSelect;

/* ───────────────────────── LESSON PROGRESS ────────────────────── */
export const lessonProgress = mysqlTable("lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  programId: varchar("programId", { length: 16 }).notNull(),
  pathId: varchar("pathId", { length: 64 }).notNull(),
  moduleIndex: int("moduleIndex").notNull(),
  lessonId: varchar("lessonId", { length: 16 }).notNull(),
  slotsCompleted: json("slotsCompleted").$type<number[]>(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  xpEarned: int("xpEarned").default(0).notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;

/* ───────────────────────── QUIZ ATTEMPTS ──────────────────────── */
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  programId: varchar("programId", { length: 16 }).notNull(),
  pathId: varchar("pathId", { length: 64 }).notNull(),
  lessonId: varchar("lessonId", { length: 16 }),
  quizType: mysqlEnum("quizType", ["formative", "summative", "final_exam"]).notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  score: int("score").notNull(),
  answers: json("answers").$type<Record<string, string>>(),
  xpEarned: int("xpEarned").default(0).notNull(),
  isPerfect: boolean("isPerfect").default(false).notNull(),
  attemptNumber: int("attemptNumber").default(1).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;

/* ───────────────────────── USER BADGES ────────────────────────── */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: varchar("badgeId", { length: 64 }).notNull(),
  badgeName: varchar("badgeName", { length: 128 }).notNull(),
  badgeDescription: text("badgeDescription"),
  badgeIcon: varchar("badgeIcon", { length: 32 }).notNull(),
  badgeColor: varchar("badgeColor", { length: 16 }).notNull(),
  xpReward: int("xpReward").default(0).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;

/* ───────────────────────── PATH ENROLLMENT ────────────────────── */
export const pathEnrollments = mysqlTable("path_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  programId: varchar("programId", { length: 16 }).notNull(),
  pathId: varchar("pathId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["enrolled", "in_progress", "completed"]).default("enrolled").notNull(),
  progressPercent: int("progressPercent").default(0).notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PathEnrollment = typeof pathEnrollments.$inferSelect;

/* ───────────────────────── ACTIVITY LOG ───────────────────────── */
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityType: mysqlEnum("activityType", [
    "lesson_started",
    "lesson_completed",
    "slot_completed",
    "quiz_completed",
    "badge_earned",
    "streak_milestone",
    "path_enrolled",
    "path_completed",
    "login",
  ]).notNull(),
  programId: varchar("programId", { length: 16 }),
  pathId: varchar("pathId", { length: 64 }),
  lessonId: varchar("lessonId", { length: 16 }),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  xpEarned: int("xpEarned").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLogEntry = typeof activityLog.$inferSelect;

/* ───────────────────────── NOTIFICATIONS ──────────────────────── */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "achievement", "reminder", "system"]).default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  link: varchar("link", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

/* ───────────────────────── WEEKLY CHALLENGES ─────────────────────── */
export const weeklyChallenges = mysqlTable("weekly_challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  titleFr: varchar("titleFr", { length: 256 }).notNull(),
  description: text("description").notNull(),
  descriptionFr: text("descriptionFr").notNull(),
  challengeType: mysqlEnum("challengeType", [
    "complete_lessons", "earn_xp", "perfect_quizzes", "maintain_streak",
    "complete_slots", "study_time"
  ]).notNull(),
  targetValue: int("targetValue").notNull(),
  xpReward: int("xpReward").default(200).notNull(),
  badgeReward: varchar("badgeReward", { length: 64 }),
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull(),
  weekEndDate: varchar("weekEndDate", { length: 10 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;

/* ───────────────────────── CHALLENGE PROGRESS ────────────────────── */
export const challengeProgress = mysqlTable("challenge_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  currentValue: int("currentValue").default(0).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChallengeProgress = typeof challengeProgress.$inferSelect;

/* ───────────────────────── CELEBRATION EVENTS ────────────────────── */
export const celebrationEvents = mysqlTable("celebration_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventType: mysqlEnum("eventType", [
    "level_up", "badge_earned", "challenge_completed", "streak_milestone",
    "path_completed", "perfect_quiz", "first_lesson"
  ]).notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  seen: boolean("seen").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CelebrationEvent = typeof celebrationEvents.$inferSelect;

/* ───────────────────────────── STUDY NOTES ──────────────────────────── */
export const studyNotes = mysqlTable("study_notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  tags: json("tags").$type<string[]>(),
  programId: varchar("programId", { length: 16 }),
  pathId: varchar("pathId", { length: 64 }),
  lessonId: varchar("lessonId", { length: 16 }),
  isPinned: boolean("isPinned").default(false).notNull(),
  color: varchar("color", { length: 16 }).default("default").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyNote = typeof studyNotes.$inferSelect;

/* ───────────────────────────── FLASHCARD DECKS ─────────────────────── */
export const flashcardDecks = mysqlTable("flashcard_decks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  programId: varchar("programId", { length: 16 }),
  pathId: varchar("pathId", { length: 64 }),
  cardCount: int("cardCount").default(0).notNull(),
  color: varchar("color", { length: 16 }).default("teal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FlashcardDeck = typeof flashcardDecks.$inferSelect;

/* ───────────────────────────── FLASHCARDS ───────────────────────────── */
export const flashcards = mysqlTable("flashcards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deckId: int("deckId").notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  hint: text("hint"),
  easeFactor: int("easeFactor").default(250).notNull(),
  interval: int("interval_days").default(0).notNull(),
  repetitions: int("repetitions").default(0).notNull(),
  nextReviewDate: varchar("nextReviewDate", { length: 10 }),
  lastReviewDate: varchar("lastReviewDate", { length: 10 }),
  status: mysqlEnum("status", ["new", "learning", "review", "mastered"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Flashcard = typeof flashcards.$inferSelect;

/* ───────────────────────────── STUDY SESSIONS ───────────────────────── */
export const studySessions = mysqlTable("study_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  sessionType: mysqlEnum("sessionType", ["lesson", "quiz", "sle_practice", "flashcard_review", "tutoring", "custom"]).default("custom").notNull(),
  scheduledDate: varchar("scheduledDate", { length: 10 }).notNull(),
  scheduledTime: varchar("scheduledTime", { length: 5 }),
  durationMinutes: int("durationMinutes").default(30).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  programId: varchar("programId", { length: 16 }),
  pathId: varchar("pathId", { length: 64 }),
  lessonId: varchar("lessonId", { length: 16 }),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudySession = typeof studySessions.$inferSelect;

/* ───────────────────────────── VOCABULARY ────────────────────────────── */
export const vocabularyItems = mysqlTable("vocabulary_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  word: varchar("word", { length: 256 }).notNull(),
  translation: varchar("translation", { length: 256 }).notNull(),
  definition: text("definition"),
  exampleSentence: text("exampleSentence"),
  pronunciation: varchar("pronunciation", { length: 256 }),
  partOfSpeech: varchar("partOfSpeech", { length: 32 }),
  programId: varchar("programId", { length: 16 }),
  pathId: varchar("pathId", { length: 64 }),
  lessonId: varchar("lessonId", { length: 16 }),
  mastery: mysqlEnum("mastery", ["new", "learning", "familiar", "mastered"]).default("new").notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  correctCount: int("correctCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VocabularyItem = typeof vocabularyItems.$inferSelect;

/* ───────────────────────────── DAILY STUDY GOALS ──────────────────────── */
export const dailyStudyGoals = mysqlTable("daily_study_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  xpTarget: int("xpTarget").default(50).notNull(),
  xpEarned: int("xpEarned").default(0).notNull(),
  lessonsTarget: int("lessonsTarget").default(1).notNull(),
  lessonsCompleted: int("lessonsCompleted").default(0).notNull(),
  studyMinutesTarget: int("studyMinutesTarget").default(30).notNull(),
  studyMinutesActual: int("studyMinutesActual").default(0).notNull(),
  isGoalMet: boolean("isGoalMet").default(false).notNull(),
  streakMultiplier: int("streakMultiplier").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyStudyGoal = typeof dailyStudyGoals.$inferSelect;

/* ───────────────────────── DISCUSSION THREADS ────────────────────────── */
export const discussionThreads = mysqlTable("discussion_threads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["grammar", "vocabulary", "sle_prep", "general", "study_tips", "resources"]).default("general").notNull(),
  isPinned: boolean("isPinned").default(false).notNull(),
  isLocked: boolean("isLocked").default(false).notNull(),
  replyCount: int("replyCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  lastReplyAt: timestamp("lastReplyAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiscussionThread = typeof discussionThreads.$inferSelect;

/* ───────────────────────── DISCUSSION REPLIES ────────────────────────── */
export const discussionReplies = mysqlTable("discussion_replies", {
  id: int("id").autoincrement().primaryKey(),
  threadId: int("threadId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  parentReplyId: int("parentReplyId"),
  likeCount: int("likeCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiscussionReply = typeof discussionReplies.$inferSelect;

/* ───────────────────────── WRITING SUBMISSIONS ──────────────────────── */
export const writingSubmissions = mysqlTable("writing_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(),
  promptText: text("promptText"),
  language: mysqlEnum("language", ["en", "fr"]).default("fr").notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]),
  status: mysqlEnum("status", ["draft", "submitted", "reviewed"]).default("draft").notNull(),
  wordCount: int("wordCount").default(0).notNull(),
  aiFeedback: text("aiFeedback"),
  aiScore: int("aiScore"),
  programId: varchar("programId", { length: 16 }),
  pathId: varchar("pathId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WritingSubmission = typeof writingSubmissions.$inferSelect;

/* ───────────────────────── CERTIFICATES ──────────────────────── */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["path_completion", "level_achievement", "challenge_winner"]).default("path_completion").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  titleFr: varchar("titleFr", { length: 512 }),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  pathId: varchar("pathId", { length: 64 }),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  certificateUrl: text("certificateUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;

/* ───────────────────────── READING EXERCISES ──────────────────── */
export const readingExercises = mysqlTable("reading_exercises", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  passageTitle: varchar("passageTitle", { length: 512 }).notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]).notNull(),
  wordsPerMinute: int("wordsPerMinute"),
  score: int("score"),
  totalQuestions: int("totalQuestions").default(5).notNull(),
  correctAnswers: int("correctAnswers").default(0).notNull(),
  timeSpentSeconds: int("timeSpentSeconds"),
  language: mysqlEnum("language", ["en", "fr"]).default("fr").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type ReadingExercise = typeof readingExercises.$inferSelect;

/* ───────────────────────── LISTENING EXERCISES ─────────────────── */
export const listeningExercises = mysqlTable("listening_exercises", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseTitle: varchar("exerciseTitle", { length: 512 }).notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]).notNull(),
  score: int("score"),
  totalQuestions: int("totalQuestions").default(5).notNull(),
  correctAnswers: int("correctAnswers").default(0).notNull(),
  timeSpentSeconds: int("timeSpentSeconds"),
  language: mysqlEnum("language", ["en", "fr"]).default("fr").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type ListeningExercise = typeof listeningExercises.$inferSelect;

/* ───────────────────────── GRAMMAR DRILLS ──────────────────────── */
export const grammarDrills = mysqlTable("grammar_drills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 256 }).notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]).notNull(),
  drillType: mysqlEnum("drillType", ["fill_blank", "conjugation", "reorder", "multiple_choice"]).default("fill_blank").notNull(),
  score: int("score"),
  totalQuestions: int("totalQuestions").default(10).notNull(),
  correctAnswers: int("correctAnswers").default(0).notNull(),
  timeSpentSeconds: int("timeSpentSeconds"),
  language: mysqlEnum("language", ["en", "fr"]).default("fr").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type GrammarDrill = typeof grammarDrills.$inferSelect;

/* ───────────────────────── PEER REVIEWS ──────────────────────── */
export const peerReviews = mysqlTable("peer_reviews", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  authorId: int("authorId").notNull(),
  grammarScore: int("grammarScore"),
  vocabularyScore: int("vocabularyScore"),
  coherenceScore: int("coherenceScore"),
  overallScore: int("overallScore"),
  feedback: text("feedback"),
  strengths: text("strengths"),
  improvements: text("improvements"),
  status: mysqlEnum("status", ["pending", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PeerReview = typeof peerReviews.$inferSelect;
