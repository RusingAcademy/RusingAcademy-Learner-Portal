/**
 * SLE AI Companion — Production Database Schema
 * 
 * Tables for the pedagogical reference, content assets, simulation engine,
 * and analytics layers of the SLE AI Companion.
 * 
 * Aligned with: "Architecture et Spécifications Techniques — SLE AI Companion"
 * PSC evaluation criteria: grammar, vocabulary, fluency, pronunciation, comprehension
 * 
 * @module drizzle/sle-schema
 */
import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { users } from "./schema";

// ============================================================================
// A) RÉFÉRENTIEL PÉDAGOGIQUE
// ============================================================================

/**
 * Proficiency Standards — PSC-aligned level descriptors (A/B/C/E/X)
 * Each row defines one proficiency level with score thresholds and rubric JSON.
 */
export const sleProficiencyStandards = mysqlTable("sle_proficiency_standards", {
  id: int("id").autoincrement().primaryKey(),
  levelId: varchar("levelId", { length: 2 }).notNull().unique(), // A, B, C, E, X
  descriptionFr: text("descriptionFr").notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  minScoreReading: int("minScoreReading").notNull(),
  minScoreWriting: int("minScoreWriting").notNull(),
  minScoreOral: int("minScoreOral").notNull(),
  oralComplexityRubric: json("oralComplexityRubric").$type<{
    syntaxExpected: string;
    discourseMarkers: string[];
    registerLevel: string;
    cognitiveComplexity: string;
  }>(),
  passThreshold: int("passThreshold").notNull(), // 0-100 composite pass mark
  sustainedPerformanceWindow: int("sustainedPerformanceWindow").default(5), // N sessions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SleProficiencyStandard = typeof sleProficiencyStandards.$inferSelect;
export type InsertSleProficiencyStandard = typeof sleProficiencyStandards.$inferInsert;

/**
 * Evaluation Rubrics — per-criterion scoring descriptors and weights.
 * 5 canonical criteria: grammar, vocabulary, fluency, pronunciation, comprehension
 */
export const sleEvaluationRubrics = mysqlTable("sle_evaluation_rubrics", {
  id: int("id").autoincrement().primaryKey(),
  rubricId: varchar("rubricId", { length: 36 }).notNull().unique(), // UUID
  criterionName: mysqlEnum("criterionName", [
    "grammar",
    "vocabulary",
    "fluency",
    "pronunciation",
    "comprehension",
  ]).notNull(),
  level: mysqlEnum("level", ["A", "B", "C"]).notNull(),
  maxPoints: int("maxPoints").notNull().default(20), // 0-20 per criterion
  weightFactor: decimal("weightFactor", { precision: 3, scale: 2 }).notNull().default("1.00"),
  descriptorExcellent: text("descriptorExcellent").notNull(),
  descriptorGood: text("descriptorGood").notNull(),
  descriptorAdequate: text("descriptorAdequate").notNull(),
  descriptorDeveloping: text("descriptorDeveloping").notNull(),
  descriptorInsufficient: text("descriptorInsufficient").notNull(),
  feedbackTemplates: json("feedbackTemplates").$type<{
    instant_correction: string[];
    end_of_turn: string[];
    session_summary: string[];
    drill_suggestion: string[];
    encouragement: string[];
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SleEvaluationRubric = typeof sleEvaluationRubrics.$inferSelect;
export type InsertSleEvaluationRubric = typeof sleEvaluationRubrics.$inferInsert;

/**
 * Error Taxonomy — categorized language errors with severity and corrections.
 * Categories: anglicism, syntax, conjugation, register, pronunciation, vocabulary, spelling
 */
export const sleErrorTaxonomy = mysqlTable("sle_error_taxonomy", {
  id: int("id").autoincrement().primaryKey(),
  errorId: varchar("errorId", { length: 20 }).notNull().unique(), // e.g. ERR-FR-001
  language: mysqlEnum("language", ["fr", "en"]).notNull(),
  category: mysqlEnum("category", [
    "anglicism",
    "syntax",
    "conjugation",
    "register",
    "pronunciation",
    "vocabulary",
    "spelling",
    "gender",
    "preposition",
    "false_friend",
  ]).notNull(),
  severityLevel: int("severityLevel").notNull(), // 1-5
  pattern: text("pattern").notNull(), // The erroneous form
  correction: text("correction").notNull(), // The correct form
  correctionRule: text("correctionRule").notNull(), // Explanation of the rule
  feedbackTextFr: text("feedbackTextFr"),
  feedbackTextEn: text("feedbackTextEn"),
  levelImpact: mysqlEnum("levelImpact", ["A", "B", "C", "all"]).notNull(),
  criterionAffected: mysqlEnum("criterionAffected", [
    "grammar",
    "vocabulary",
    "fluency",
    "pronunciation",
    "comprehension",
  ]).notNull(),
  examples: json("examples").$type<{
    incorrect: string;
    correct: string;
    context?: string;
  }[]>(),
  resourceLink: varchar("resourceLink", { length: 500 }),
  tags: json("tags").$type<string[]>(),
  needsReview: boolean("needsReview").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SleErrorTaxonomy = typeof sleErrorTaxonomy.$inferSelect;
export type InsertSleErrorTaxonomy = typeof sleErrorTaxonomy.$inferInsert;

// ============================================================================
// B) ACTIFS DE CONTENU (ORAL PRIORITAIRE)
// ============================================================================

/**
 * Oral Scenarios — structured conversation scenarios for SLE practice.
 * Each scenario includes context, question sequences, expected functions, and scoring focus.
 */
export const sleOralScenarios = mysqlTable("sle_oral_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: varchar("scenarioId", { length: 36 }).notNull().unique(), // UUID
  language: mysqlEnum("language", ["fr", "en"]).notNull(),
  targetLevel: mysqlEnum("targetLevel", ["A", "B", "C"]).notNull(),
  topicDomain: mysqlEnum("topicDomain", [
    "HR",
    "Finance",
    "Operations",
    "Policy",
    "Service",
    "IT",
    "Leadership",
    "Environment",
    "Communications",
    "Diversity",
    "Workplace",
    "Project",
  ]).notNull(),
  durationTag: mysqlEnum("durationTag", ["quick_drill", "full_simulation"]).notNull(),
  contextPrompt: text("contextPrompt").notNull(),
  examinerRole: text("examinerRole"),
  aiSystemPrompt: text("aiSystemPrompt"), // Roleplay instructions for the AI
  questionSequence: json("questionSequence").$type<{
    q: string;
    probing: string[];
    conditions?: Record<string, unknown>;
  }[]>().notNull(),
  expectedFunctions: json("expectedFunctions").$type<string[]>().notNull(),
  expectedVocabulary: json("expectedVocabulary").$type<string[]>(),
  registerConstraints: json("registerConstraints").$type<{
    pronoun: string;
    tone: string;
  }>(),
  scoringFocus: json("scoringFocus").$type<string[]>().notNull(),
  tags: json("tags").$type<{
    grammatical: string[];
    functional: string[];
  }>(),
  needsReview: boolean("needsReview").default(false),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SleOralScenario = typeof sleOralScenarios.$inferSelect;
export type InsertSleOralScenario = typeof sleOralScenarios.$inferInsert;

/**
 * Model Answers — reference answers for scenarios, tagged by level and register.
 */
export const sleModelAnswers = mysqlTable("sle_model_answers", {
  id: int("id").autoincrement().primaryKey(),
  answerId: varchar("answerId", { length: 36 }).notNull().unique(), // UUID
  scenarioId: varchar("scenarioId", { length: 36 }), // FK to oral_scenarios.scenarioId
  language: mysqlEnum("language", ["fr", "en"]).notNull(),
  targetLevel: mysqlEnum("targetLevel", ["B", "C"]).notNull(),
  questionRef: text("questionRef"), // Which question this answers
  answerText: text("answerText").notNull(),
  registerVariant: mysqlEnum("registerVariant", ["formal", "semi_formal", "informal"]).default("formal"),
  keyStructures: json("keyStructures").$type<string[]>(), // Grammar structures demonstrated
  keyVocabulary: json("keyVocabulary").$type<string[]>(), // Vocabulary demonstrated
  scoringNotes: text("scoringNotes"), // Why this is a good answer
  needsReview: boolean("needsReview").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SleModelAnswer = typeof sleModelAnswers.$inferSelect;
export type InsertSleModelAnswer = typeof sleModelAnswers.$inferInsert;

// ============================================================================
// C) MOTEUR DE SIMULATION — Enhanced session & interaction tracking
// ============================================================================

/**
 * User Sessions — enhanced session tracking with debug fields.
 * Replaces/extends the existing sle_companion_sessions for production use.
 */
export const sleUserSessions = mysqlTable("sle_user_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 36 }).notNull().unique(), // UUID
  userId: int("userId").references(() => users.id),
  mode: mysqlEnum("mode", ["training", "exam_simulation", "micro_learning", "quick_drill"]).notNull(),
  language: mysqlEnum("language", ["fr", "en"]).notNull(),
  targetLevel: mysqlEnum("targetLevel", ["A", "B", "C"]).notNull(),
  coachKey: mysqlEnum("coachKey", ["STEVEN", "PRECIOSA"]).notNull(),
  scenarioId: varchar("scenarioId", { length: 36 }), // FK to oral_scenarios
  startTime: timestamp("startTime").defaultNow().notNull(),
  endTime: timestamp("endTime"),
  aggregateScore: int("aggregateScore"), // 0-100
  criterionScores: json("criterionScores").$type<{
    grammar: number;
    vocabulary: number;
    fluency: number;
    pronunciation: number;
    comprehension: number;
  }>(),
  passed: boolean("passed"),
  levelAchieved: mysqlEnum("levelAchieved", ["X", "A", "B", "C"]),
  totalTurns: int("totalTurns").default(0),
  totalDurationSeconds: int("totalDurationSeconds"),
  // Debug / reproducibility fields
  modelId: varchar("modelId", { length: 100 }), // e.g. "gpt-4.1-mini"
  promptVersion: varchar("promptVersion", { length: 50 }), // e.g. "v2.1"
  systemPromptHash: varchar("systemPromptHash", { length: 64 }), // SHA-256 of system prompt
  feedback: text("feedback"),
  recommendations: json("recommendations").$type<string[]>(),
  status: mysqlEnum("status", ["active", "completed", "abandoned", "error"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SleUserSession = typeof sleUserSessions.$inferSelect;
export type InsertSleUserSession = typeof sleUserSessions.$inferInsert;

/**
 * Interaction Logs — per-turn logging with full debug fields.
 * Stores raw scoring output, validator results, and RAG chunk references.
 */
export const sleInteractionLogs = mysqlTable("sle_interaction_logs", {
  id: int("id").autoincrement().primaryKey(),
  logId: varchar("logId", { length: 36 }).notNull().unique(), // UUID
  sessionId: varchar("sessionId", { length: 36 }).notNull(), // FK to user_sessions.sessionId
  turnSequence: int("turnSequence").notNull(),
  userInputTranscript: text("userInputTranscript"),
  aiResponse: text("aiResponse"),
  detectedErrors: json("detectedErrors").$type<{
    errorId: string;
    pattern: string;
    correction: string;
    category: string;
    feedback: string;
  }[]>(),
  criterionScores: json("criterionScores").$type<{
    grammar: number;
    vocabulary: number;
    fluency: number;
    pronunciation: number;
    comprehension: number;
  }>(),
  turnScore: int("turnScore"), // 0-100
  latencyMs: int("latencyMs"), // Total pipeline latency
  sttLatencyMs: int("sttLatencyMs"),
  llmLatencyMs: int("llmLatencyMs"),
  ttsLatencyMs: int("ttsLatencyMs"),
  // REQUIRED DEBUG FIELDS
  rawScoringJson: json("rawScoringJson"), // Raw LLM scoring output before validation
  validatorResult: json("validatorResult"), // Zod validation result (success/error)
  ragChunkIds: json("ragChunkIds").$type<string[]>(), // RAG chunks used for this turn
  systemPromptHash: varchar("systemPromptHash", { length: 64 }),
  temperature: decimal("temperature", { precision: 3, scale: 2 }),
  maxTokens: int("maxTokens"),
  audioUrl: text("audioUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SleInteractionLog = typeof sleInteractionLogs.$inferSelect;
export type InsertSleInteractionLog = typeof sleInteractionLogs.$inferInsert;

// ============================================================================
// D) ANALYTICS (V1)
// ============================================================================

/**
 * SLE User Profile — learner-specific SLE profile with weak areas and goals.
 * Extends the main learnerProfiles with SLE-specific analytics.
 */
export const sleUserProfiles = mysqlTable("sle_user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id).unique(),
  l1: mysqlEnum("l1", ["fr", "en"]).notNull(), // First language
  l2: mysqlEnum("l2", ["fr", "en"]).notNull(), // Target language
  currentEstimatedLevel: mysqlEnum("currentEstimatedLevel", ["X", "A", "B", "C"]),
  targetLevel: mysqlEnum("targetLevel", ["A", "B", "C"]),
  goals: json("goals").$type<string[]>(),
  weakThemes: json("weakThemes").$type<{
    criterion: string;
    score: number;
    trend: "improving" | "stable" | "declining";
  }[]>(),
  totalSessions: int("totalSessions").default(0),
  totalPracticeMinutes: int("totalPracticeMinutes").default(0),
  lastSessionDate: timestamp("lastSessionDate"),
  streakDays: int("streakDays").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SleUserProfile = typeof sleUserProfiles.$inferSelect;
export type InsertSleUserProfile = typeof sleUserProfiles.$inferInsert;

/**
 * Skill Trend — rolling criterion scores over time for progress tracking.
 */
export const sleSkillTrend = mysqlTable("sle_skill_trend", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  criterionName: mysqlEnum("criterionName", [
    "grammar",
    "vocabulary",
    "fluency",
    "pronunciation",
    "comprehension",
  ]).notNull(),
  dateBucket: varchar("dateBucket", { length: 10 }).notNull(), // YYYY-MM-DD
  avgScore: decimal("avgScore", { precision: 5, scale: 2 }).notNull(),
  sessionCount: int("sessionCount").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ([
  uniqueIndex("skill_trend_user_criterion_date_idx").on(
    table.userId,
    table.criterionName,
    table.dateBucket,
  ),
]));
export type SleSkillTrend = typeof sleSkillTrend.$inferSelect;
export type InsertSleSkillTrend = typeof sleSkillTrend.$inferInsert;

// ============================================================================
// E) RAG KNOWLEDGE BASE COLLECTIONS (metadata tracking)
// ============================================================================

/**
 * Knowledge Base Collections — tracks the 5 logical RAG collections.
 * Actual content lives in JSONL files; this table tracks metadata and versions.
 */
export const sleKnowledgeCollections = mysqlTable("sle_knowledge_collections", {
  id: int("id").autoincrement().primaryKey(),
  collectionKey: varchar("collectionKey", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  itemCount: int("itemCount").default(0),
  lastSyncedAt: timestamp("lastSyncedAt"),
  version: varchar("version", { length: 20 }).default("1.0.0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SleKnowledgeCollection = typeof sleKnowledgeCollections.$inferSelect;
export type InsertSleKnowledgeCollection = typeof sleKnowledgeCollections.$inferInsert;
