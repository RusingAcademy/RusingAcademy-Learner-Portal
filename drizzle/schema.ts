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
  role: mysqlEnum("role", ["user", "admin", "hr_manager", "coach"]).default("user").notNull(),
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


/* ───────────────────── MOCK SLE EXAMS ───────────────────── */
export const mockSleExams = mysqlTable("mock_sle_exams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  examType: mysqlEnum("examType", ["reading", "writing", "oral"]).notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]).default("B1").notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers"),
  score: int("score"),
  timeLimitSeconds: int("timeLimitSeconds").notNull(),
  timeUsedSeconds: int("timeUsedSeconds"),
  status: mysqlEnum("status", ["in_progress", "completed", "expired"]).default("in_progress").notNull(),
  answers: json("answers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});
export type MockSleExam = typeof mockSleExams.$inferSelect;

/* ───────────────────── COACH ASSIGNMENTS ───────────────────── */
export const coachAssignments = mysqlTable("coach_assignments", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull(),
  studentId: int("studentId").notNull(),
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type CoachAssignment = typeof coachAssignments.$inferSelect;

/* ───────────────────── STUDY GROUPS ───────────────────── */
export const studyGroups = mysqlTable("study_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  creatorId: int("creatorId").notNull(),
  maxMembers: int("maxMembers").default(10).notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]).default("B1").notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type StudyGroup = typeof studyGroups.$inferSelect;

export const studyGroupMembers = mysqlTable("study_group_members", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["member", "admin"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});
export type StudyGroupMember = typeof studyGroupMembers.$inferSelect;

/* ───────────────────── BOOKMARKS ───────────────────── */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["lesson", "note", "vocabulary", "discussion", "flashcard_deck"]).notNull(),
  itemId: int("itemId").notNull(),
  itemTitle: varchar("itemTitle", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Bookmark = typeof bookmarks.$inferSelect;

/* ───────────────────── DICTATION EXERCISES ───────────────────── */
export const dictationExercises = mysqlTable("dictation_exercises", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]).default("B1").notNull(),
  totalSentences: int("totalSentences").notNull(),
  correctSentences: int("correctSentences"),
  accuracy: int("accuracy"),
  timeSpentSeconds: int("timeSpentSeconds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DictationExercise = typeof dictationExercises.$inferSelect;

/* ───────────────────── ONBOARDING ───────────────────── */
export const onboardingProfiles = mysqlTable("onboarding_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentLevel: mysqlEnum("currentLevel", ["A1", "A2", "B1", "B2", "C1"]).default("A1").notNull(),
  targetLevel: mysqlEnum("targetLevel", ["A1", "A2", "B1", "B2", "C1"]).default("B2").notNull(),
  learningGoal: mysqlEnum("learningGoal", ["sle_prep", "conversation", "professional", "academic", "travel"]).default("sle_prep").notNull(),
  weeklyHours: int("weeklyHours").default(5).notNull(),
  preferredTime: mysqlEnum("preferredTime", ["morning", "afternoon", "evening"]).default("morning").notNull(),
  completedOnboarding: boolean("completedOnboarding").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type OnboardingProfile = typeof onboardingProfiles.$inferSelect;


/* ═══════════════════════════════════════════════════════════
   SPRINT 2-5: LRDG-GRADE ADMIN FEATURES
   ═══════════════════════════════════════════════════════════ */

/* ───────────────────── COACH PROFILES ───────────────────── */
export const coachProfiles = mysqlTable("coach_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  displayName: varchar("displayName", { length: 200 }).notNull(),
  bio: text("bio"),
  specializations: json("specializations"),
  languages: json("languages"),
  cefrLevels: json("cefrLevels"),
  hourlyRate: int("hourlyRate"),
  status: mysqlEnum("status", ["pending", "active", "suspended", "inactive"]).default("pending").notNull(),
  avatarUrl: text("avatarUrl"),
  linkedinUrl: varchar("linkedinUrl", { length: 512 }),
  totalStudents: int("totalStudents").default(0).notNull(),
  totalSessions: int("totalSessions").default(0).notNull(),
  averageRating: int("averageRating").default(0).notNull(),
  suspendedAt: timestamp("suspendedAt"),
  suspendedReason: text("suspendedReason"),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CoachProfile = typeof coachProfiles.$inferSelect;

/* ───────────────────── COACH APPLICATIONS ───────────────────── */
export const coachApplications = mysqlTable("coach_applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fullName: varchar("fullName", { length: 200 }).notNull(),
  email: varchar("email", { length: 300 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  experience: text("experience"),
  qualifications: text("qualifications"),
  motivation: text("motivation"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "withdrawn"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type CoachApplication = typeof coachApplications.$inferSelect;

/* ───────────────────── COMMISSION TIERS ───────────────────── */
export const commissionTiers = mysqlTable("commission_tiers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  commissionRate: int("commissionRate").notNull(),
  minStudents: int("minStudents").default(0).notNull(),
  maxStudents: int("maxStudents"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CommissionTier = typeof commissionTiers.$inferSelect;

/* ───────────────────── COACH PAYOUTS ───────────────────── */
export const coachPayouts = mysqlTable("coach_payouts", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull(),
  amount: int("amount").notNull(), // cents
  currency: varchar("currency", { length: 3 }).default("CAD").notNull(),
  periodStart: varchar("periodStart", { length: 10 }).notNull(),
  periodEnd: varchar("periodEnd", { length: 10 }).notNull(),
  sessionsCount: int("sessionsCount").default(0).notNull(),
  commissionRate: int("commissionRate").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "paid", "failed"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CoachPayout = typeof coachPayouts.$inferSelect;

/* ───────────────────── CONTENT ITEMS (CMS Pipeline) ───────────────────── */
export const contentItems = mysqlTable("content_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  titleFr: varchar("titleFr", { length: 500 }),
  contentType: mysqlEnum("contentType", ["lesson", "quiz", "article", "video", "podcast", "exercise"]).default("lesson").notNull(),
  status: mysqlEnum("status", ["draft", "review", "approved", "published", "archived"]).default("draft").notNull(),
  authorId: int("authorId"),
  reviewerId: int("reviewerId"),
  qualityScore: int("qualityScore"), // 0-100
  scheduledPublishAt: timestamp("scheduledPublishAt"),
  publishedAt: timestamp("publishedAt"),
  body: text("body"),
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type ContentItem = typeof contentItems.$inferSelect;

/* ───────────────────── CONTENT TEMPLATES ───────────────────── */
export const contentTemplates = mysqlTable("content_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  nameFr: varchar("nameFr", { length: 256 }),
  description: text("description"),
  templateType: mysqlEnum("templateType", ["lesson", "quiz", "evaluation", "article", "podcast_script"]).default("lesson").notNull(),
  structure: json("structure"),
  isDefault: boolean("isDefault").default(false).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ContentTemplate = typeof contentTemplates.$inferSelect;

/* ───────────────────── CONTENT CALENDAR ───────────────────── */
export const contentCalendar = mysqlTable("content_calendar", {
  id: int("id").autoincrement().primaryKey(),
  contentItemId: int("contentItemId"),
  title: varchar("title", { length: 500 }).notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  contentType: mysqlEnum("contentType", ["lesson", "quiz", "article", "video", "podcast", "exercise"]).default("lesson").notNull(),
  status: mysqlEnum("status", ["scheduled", "published", "cancelled"]).default("scheduled").notNull(),
  assignedTo: int("assignedTo"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ContentCalendarEntry = typeof contentCalendar.$inferSelect;


/* ═══════════════════════════════════════════════════════════
   CLIENT PORTAL (formerly HR Portal)
   Tables for government departments & organizations
   ═══════════════════════════════════════════════════════════ */

/* ───────────────────── CLIENT ORGANIZATIONS ───────────────────── */
export const clientOrganizations = mysqlTable("client_organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  nameFr: varchar("nameFr", { length: 300 }),
  orgType: mysqlEnum("orgType", ["federal_department", "provincial_ministry", "crown_corporation", "agency", "other"]).default("federal_department").notNull(),
  sector: varchar("sector", { length: 200 }),
  contactName: varchar("contactName", { length: 200 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postalCode", { length: 10 }),
  contractStartDate: varchar("contractStartDate", { length: 10 }),
  contractEndDate: varchar("contractEndDate", { length: 10 }),
  status: mysqlEnum("status", ["active", "pending", "suspended", "expired"]).default("pending").notNull(),
  maxParticipants: int("maxParticipants").default(50).notNull(),
  logoUrl: text("logoUrl"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ClientOrganization = typeof clientOrganizations.$inferSelect;

/* ───────────────────── ORGANIZATION MANAGERS (HR Managers) ───────────────────── */
export const organizationManagers = mysqlTable("organization_managers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  organizationId: int("organizationId").notNull(),
  role: mysqlEnum("role", ["primary_contact", "training_manager", "observer"]).default("training_manager").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrganizationManager = typeof organizationManagers.$inferSelect;

/* ───────────────────── PARTICIPANTS ───────────────────── */
export const participants = mysqlTable("participants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  organizationId: int("organizationId").notNull(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  employeeId: varchar("employeeId", { length: 64 }),
  department: varchar("department", { length: 200 }),
  position: varchar("position", { length: 200 }),
  currentLevel: mysqlEnum("currentLevel", ["A1", "A2", "B1", "B2", "C1"]).default("A1").notNull(),
  targetLevel: mysqlEnum("targetLevel", ["A1", "A2", "B1", "B2", "C1"]).default("B2").notNull(),
  program: mysqlEnum("program", ["FSL", "ESL"]).default("FSL").notNull(),
  status: mysqlEnum("status", ["active", "on_hold", "completed", "withdrawn"]).default("active").notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Participant = typeof participants.$inferSelect;

/* ───────────────────── TRAINING COHORTS ───────────────────── */
export const trainingCohorts = mysqlTable("training_cohorts", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  nameFr: varchar("nameFr", { length: 256 }),
  program: mysqlEnum("program", ["FSL", "ESL"]).default("FSL").notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]).default("B1").notNull(),
  coachId: int("coachId"),
  startDate: varchar("startDate", { length: 10 }).notNull(),
  endDate: varchar("endDate", { length: 10 }),
  schedule: varchar("schedule", { length: 256 }),
  maxParticipants: int("maxParticipants").default(15).notNull(),
  currentParticipants: int("currentParticipants").default(0).notNull(),
  status: mysqlEnum("status", ["planned", "active", "completed", "cancelled"]).default("planned").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TrainingCohort = typeof trainingCohorts.$inferSelect;

/* ───────────────────── COHORT PARTICIPANTS ───────────────────── */
export const cohortParticipants = mysqlTable("cohort_participants", {
  id: int("id").autoincrement().primaryKey(),
  cohortId: int("cohortId").notNull(),
  participantId: int("participantId").notNull(),
  status: mysqlEnum("status", ["enrolled", "active", "completed", "withdrawn"]).default("enrolled").notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});
export type CohortParticipant = typeof cohortParticipants.$inferSelect;

/* ───────────────────── BILLING & BUDGET ───────────────────── */
export const billingRecords = mysqlTable("billing_records", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 64 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  descriptionFr: varchar("descriptionFr", { length: 500 }),
  amount: int("amount").notNull(), // cents CAD
  currency: varchar("currency", { length: 3 }).default("CAD").notNull(),
  billingType: mysqlEnum("billingType", ["training_package", "coaching_session", "assessment", "material", "custom"]).default("training_package").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  issuedDate: varchar("issuedDate", { length: 10 }).notNull(),
  dueDate: varchar("dueDate", { length: 10 }),
  paidDate: varchar("paidDate", { length: 10 }),
  cohortId: int("cohortId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BillingRecord = typeof billingRecords.$inferSelect;

/* ───────────────────── BUDGET ALLOCATIONS ───────────────────── */
export const budgetAllocations = mysqlTable("budget_allocations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  fiscalYear: varchar("fiscalYear", { length: 9 }).notNull(), // e.g., "2025-2026"
  totalBudget: int("totalBudget").notNull(), // cents CAD
  allocatedAmount: int("allocatedAmount").default(0).notNull(),
  spentAmount: int("spentAmount").default(0).notNull(),
  category: mysqlEnum("category", ["training", "coaching", "assessment", "materials", "other"]).default("training").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;

/* ───────────────────── COMPLIANCE RECORDS ───────────────────── */
export const complianceRecords = mysqlTable("compliance_records", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  participantId: int("participantId").notNull(),
  assessmentType: mysqlEnum("assessmentType", ["sle_reading", "sle_writing", "sle_oral", "internal_assessment", "placement_test"]).notNull(),
  currentResult: varchar("currentResult", { length: 10 }),
  targetResult: varchar("targetResult", { length: 10 }),
  assessmentDate: varchar("assessmentDate", { length: 10 }),
  nextAssessmentDate: varchar("nextAssessmentDate", { length: 10 }),
  status: mysqlEnum("status", ["pending", "in_progress", "achieved", "not_achieved", "expired"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ComplianceRecord = typeof complianceRecords.$inferSelect;

/* ───────────────────── COACHING SESSIONS (Calendly-integrated) ───────────────────── */
export const coachingSessions = mysqlTable("coaching_sessions", {
  id: int("id").autoincrement().primaryKey(),
  participantId: int("participantId"),
  userId: int("userId"),
  coachId: int("coachId"),
  organizationId: int("organizationId"),
  cohortId: int("cohortId"),
  calendlyEventUri: varchar("calendlyEventUri", { length: 512 }),
  calendlyInviteeUri: varchar("calendlyInviteeUri", { length: 512 }),
  sessionType: mysqlEnum("sessionType", ["individual", "group", "assessment", "consultation"]).default("individual").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduledAt"),
  durationMinutes: int("durationMinutes").default(60).notNull(),
  status: mysqlEnum("status", ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  meetingUrl: text("meetingUrl"),
  coachNotes: text("coachNotes"),
  participantFeedback: text("participantFeedback"),
  rating: int("rating"),
  cancelledAt: timestamp("cancelledAt"),
  cancelReason: text("cancelReason"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CoachingSession = typeof coachingSessions.$inferSelect;


/* ───────────────────── HR MANAGER INVITATIONS ───────────────────── */
export const hrInvitations = mysqlTable("hr_invitations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  invitedName: varchar("invitedName", { length: 200 }),
  role: mysqlEnum("role", ["primary_contact", "training_manager", "observer"]).default("training_manager").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "accepted", "expired", "revoked"]).default("pending").notNull(),
  invitedBy: int("invitedBy").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  acceptedByUserId: int("acceptedByUserId"),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HrInvitation = typeof hrInvitations.$inferSelect;
