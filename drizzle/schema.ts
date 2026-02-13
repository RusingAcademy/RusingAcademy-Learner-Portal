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