/**
 * SLE Written Expression Service
 * 
 * Loads written MCQ questions from the JSONL dataset,
 * generates exam sessions, and calculates scores using
 * official PSC thresholds.
 */

import { readFileSync } from "fs";
import { join } from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WrittenQuestion {
  id: string;
  language: "fr" | "en";
  category: string;
  category_name: string;
  level: "A" | "B" | "C";
  type: "fill_blank" | "error_identification";
  stem: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  grammar_rule: string;
  common_error: string;
  difficulty: number;
}

export type ExamMode = "drill_b" | "drill_c" | "full_mock";

export interface ExamConfig {
  questionCount: number;
  timeMinutes: number;
  levels: ("A" | "B" | "C")[];
}

export interface ExamSession {
  sessionId: string;
  language: "fr" | "en";
  mode: ExamMode;
  questions: WrittenQuestion[];
  startedAt: string;
  config: ExamConfig;
}

export interface ExamSubmission {
  sessionId: string;
  answers: Record<string, number | null>; // questionId -> selectedOptionIndex
  timeSpent: number; // seconds
}

export interface ExamResult {
  sessionId: string;
  language: "fr" | "en";
  mode: ExamMode;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // 0-1
  level: "A" | "B" | "C" | "E" | "X";
  timeSpent: number;
  categoryBreakdown: Record<string, { correct: number; total: number; percentage: number }>;
  questionResults: Array<{
    questionId: string;
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
    grammarRule: string;
    commonError: string;
  }>;
  feedback: string;
}

// ─── Mode Configurations ─────────────────────────────────────────────────────

const MODE_CONFIGS: Record<ExamMode, ExamConfig> = {
  drill_b: { questionCount: 20, timeMinutes: 10, levels: ["B"] },
  drill_c: { questionCount: 20, timeMinutes: 10, levels: ["C"] },
  full_mock: { questionCount: 55, timeMinutes: 45, levels: ["B", "C"] },
};

// ─── PSC Scoring Thresholds ──────────────────────────────────────────────────
// Based on official Public Service Commission standards

const PSC_THRESHOLDS = {
  C: 0.80, // 80%+ = Level C (Superior)
  B: 0.65, // 65-79% = Level B (Intermediate)
  A: 0.50, // 50-64% = Level A (Basic)
  E: 0.30, // 30-49% = Level E (Below A)
  // Below 30% = Level X (Unclassified)
};

// ─── Question Bank ───────────────────────────────────────────────────────────

let questionBank: WrittenQuestion[] | null = null;

function loadQuestionBank(): WrittenQuestion[] {
  if (questionBank) return questionBank;

  try {
    const filePath = join(process.cwd(), "data", "sle", "seed", "written_questions.jsonl");
    const content = readFileSync(filePath, "utf-8");
    questionBank = content
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as WrittenQuestion);
    console.log(`[SLE Written] Loaded ${questionBank.length} questions from dataset`);
    return questionBank;
  } catch (error) {
    console.error("[SLE Written] Failed to load question bank:", error);
    return [];
  }
}

// ─── Shuffle Utility ─────────────────────────────────────────────────────────

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── Service Functions ───────────────────────────────────────────────────────

/**
 * Create a new exam session with randomly selected questions
 */
export function createExamSession(
  language: "fr" | "en",
  mode: ExamMode
): ExamSession {
  const config = MODE_CONFIGS[mode];
  const bank = loadQuestionBank();

  // Filter by language and level
  const eligible = bank.filter(
    (q) => q.language === language && config.levels.includes(q.level)
  );

  // Shuffle and select
  const selected = shuffle(eligible).slice(0, config.questionCount);

  // For full_mock, ensure balanced distribution between B and C
  if (mode === "full_mock" && selected.length >= config.questionCount) {
    const bQuestions = shuffle(eligible.filter((q) => q.level === "B"));
    const cQuestions = shuffle(eligible.filter((q) => q.level === "C"));
    const bCount = Math.ceil(config.questionCount * 0.55); // ~55% B, ~45% C (mirrors real exam)
    const cCount = config.questionCount - bCount;
    const balanced = [
      ...bQuestions.slice(0, bCount),
      ...cQuestions.slice(0, cCount),
    ];
    if (balanced.length >= config.questionCount) {
      selected.splice(0, selected.length, ...shuffle(balanced));
    }
  }

  const sessionId = `written_${language}_${mode}_${Date.now()}`;

  return {
    sessionId,
    language,
    mode,
    questions: selected,
    startedAt: new Date().toISOString(),
    config,
  };
}

/**
 * Calculate the SLE level from a raw score (0-1)
 */
export function calculateLevel(score: number): "A" | "B" | "C" | "E" | "X" {
  if (score >= PSC_THRESHOLDS.C) return "C";
  if (score >= PSC_THRESHOLDS.B) return "B";
  if (score >= PSC_THRESHOLDS.A) return "A";
  if (score >= PSC_THRESHOLDS.E) return "E";
  return "X";
}

/**
 * Generate personalized feedback based on results
 */
function generateFeedback(
  language: "fr" | "en",
  level: string,
  categoryBreakdown: Record<string, { correct: number; total: number; percentage: number }>
): string {
  // Find weakest categories
  const weakCategories = Object.entries(categoryBreakdown)
    .filter(([_, data]) => data.percentage < 60)
    .sort((a, b) => a[1].percentage - b[1].percentage)
    .slice(0, 3)
    .map(([name]) => name);

  const strongCategories = Object.entries(categoryBreakdown)
    .filter(([_, data]) => data.percentage >= 80)
    .map(([name]) => name);

  if (language === "fr") {
    let feedback = "";
    if (level === "C") {
      feedback = "Excellent travail ! Vous démontrez une maîtrise avancée de l'expression écrite. ";
    } else if (level === "B") {
      feedback = "Bon résultat ! Vous avez une compétence fonctionnelle solide. ";
    } else if (level === "A") {
      feedback = "Vous avez atteint le niveau de base. Avec de la pratique ciblée, vous pouvez progresser rapidement. ";
    } else {
      feedback = "Continuez à pratiquer. Chaque exercice vous rapproche de votre objectif. ";
    }

    if (strongCategories.length > 0) {
      feedback += `Vos points forts : ${strongCategories.join(", ")}. `;
    }
    if (weakCategories.length > 0) {
      feedback += `À améliorer : ${weakCategories.join(", ")}. Concentrez vos prochaines sessions sur ces catégories.`;
    }
    return feedback;
  } else {
    let feedback = "";
    if (level === "C") {
      feedback = "Excellent work! You demonstrate advanced written expression proficiency. ";
    } else if (level === "B") {
      feedback = "Good result! You have solid functional competence. ";
    } else if (level === "A") {
      feedback = "You've reached the basic level. With targeted practice, you can progress quickly. ";
    } else {
      feedback = "Keep practicing. Every exercise brings you closer to your goal. ";
    }

    if (strongCategories.length > 0) {
      feedback += `Your strengths: ${strongCategories.join(", ")}. `;
    }
    if (weakCategories.length > 0) {
      feedback += `Areas to improve: ${weakCategories.join(", ")}. Focus your next sessions on these categories.`;
    }
    return feedback;
  }
}

/**
 * Grade an exam submission and return detailed results
 */
export function gradeExam(
  session: ExamSession,
  submission: ExamSubmission
): ExamResult {
  const categoryBreakdown: Record<string, { correct: number; total: number; percentage: number }> = {};
  const questionResults: ExamResult["questionResults"] = [];

  let correctCount = 0;

  for (const question of session.questions) {
    const selectedAnswer = submission.answers[question.id] ?? null;
    const isCorrect = selectedAnswer === question.correct_answer;
    if (isCorrect) correctCount++;

    // Category breakdown
    if (!categoryBreakdown[question.category_name]) {
      categoryBreakdown[question.category_name] = { correct: 0, total: 0, percentage: 0 };
    }
    categoryBreakdown[question.category_name].total++;
    if (isCorrect) categoryBreakdown[question.category_name].correct++;

    questionResults.push({
      questionId: question.id,
      selectedAnswer,
      correctAnswer: question.correct_answer,
      isCorrect,
      explanation: question.explanation,
      grammarRule: question.grammar_rule,
      commonError: question.common_error,
    });
  }

  // Calculate percentages
  for (const key of Object.keys(categoryBreakdown)) {
    const data = categoryBreakdown[key];
    data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
  }

  const score = session.questions.length > 0 ? correctCount / session.questions.length : 0;
  const level = calculateLevel(score);
  const feedback = generateFeedback(session.language, level, categoryBreakdown);

  return {
    sessionId: session.sessionId,
    language: session.language,
    mode: session.mode,
    totalQuestions: session.questions.length,
    correctAnswers: correctCount,
    score,
    level,
    timeSpent: submission.timeSpent,
    categoryBreakdown,
    questionResults,
    feedback,
  };
}

/**
 * Get available question counts by language and level
 */
export function getQuestionStats(): Record<string, { total: number; byLevel: Record<string, number>; byCategory: Record<string, number> }> {
  const bank = loadQuestionBank();
  const stats: Record<string, { total: number; byLevel: Record<string, number>; byCategory: Record<string, number> }> = {};

  for (const q of bank) {
    if (!stats[q.language]) {
      stats[q.language] = { total: 0, byLevel: {}, byCategory: {} };
    }
    stats[q.language].total++;
    stats[q.language].byLevel[q.level] = (stats[q.language].byLevel[q.level] || 0) + 1;
    stats[q.language].byCategory[q.category_name] = (stats[q.language].byCategory[q.category_name] || 0) + 1;
  }

  return stats;
}
