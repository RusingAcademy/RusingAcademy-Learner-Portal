/**
 * QuizRenderer — Premium Interactive Quiz Experience
 * 
 * Parses quiz JSON from activity content and renders an interactive
 * one-question-at-a-time quiz with:
 * - Multiple choice with selectable option cards
 * - Fill-in-the-blank with text input
 * - Immediate feedback with correct/incorrect indicators
 * - Progress bar and score tracking
 * - Glassmorphism accents and micro-animations
 * - Bilingual EN/FR support
 * 
 * Handles 6+ quiz JSON format variations:
 *   Format A: { questions: [{ id, type, question, options, answer, feedback }] }
 *   Format B: { questions: [{ question_text, question_type, options, correct_answer, feedback }] }
 *   Format C: { questions: [{ question_number, question_type, question_text, options, correct_answer, feedback }] }
 *   Format D: { questions: [{ question, options, answer, feedback }] }  (no id/type)
 *   Format E: { quiz: [{ question, options, answer, feedback }] }
 *   Format F: { "0": {...}, "1": {...}, ... }  (numbered keys)
 *   Also handles bad JSON escape sequences via sanitization.
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, ChevronRight, ChevronLeft,
  Trophy, RotateCcw, HelpCircle, Target,
  ArrowRight, Lightbulb, Star,
} from "lucide-react";

// ─── Normalized Types ───
interface NormalizedQuestion {
  id: number;
  type: "multiple-choice" | "fill-in-the-blank";
  question: string;
  options: string[];
  answer: string;           // always the text of the correct answer
  correctIndex: number;     // 0-based index into options
  feedback: string;
}

interface QuizData {
  questions: NormalizedQuestion[];
  introText?: string;
}

// ─── Sanitize JSON string to fix common escape issues ───
function sanitizeJsonString(raw: string): string {
  // Fix invalid escape sequences like \' which are common in French text
  // Replace \' with ' (single quote doesn't need escaping in JSON)
  let sanitized = raw.replace(/\\'/g, "'");
  // Fix \a, \e, etc. (invalid JSON escapes) - replace with the letter
  sanitized = sanitized.replace(/\\([^"\\\/bfnrtu])/g, "$1");
  // Fix control characters (tabs, etc. that aren't properly escaped)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, (ch) => {
    if (ch === '\n' || ch === '\r' || ch === '\t') return ch;
    return '';
  });
  return sanitized;
}

// ─── Normalize a single raw question object into our standard format ───
function normalizeQuestion(raw: Record<string, unknown>, index: number): NormalizedQuestion | null {
  try {
    // Extract question text (multiple possible field names)
    const questionText = String(
      raw.question ?? raw.question_text ?? raw.text ?? ""
    ).trim();
    if (!questionText) return null;

    // Extract options array
    let options: string[] = [];
    if (Array.isArray(raw.options)) {
      options = raw.options.map((o: unknown) => String(o).trim());
    }

    // Extract question type
    const rawType = String(raw.type ?? raw.question_type ?? "multiple-choice").toLowerCase();
    const type: "multiple-choice" | "fill-in-the-blank" = 
      rawType.includes("fill") || rawType.includes("blank") || rawType.includes("complet")
        ? "fill-in-the-blank"
        : "multiple-choice";

    // Extract the correct answer - handle both string answers and numeric indices
    let answer = "";
    let correctIndex = -1;

    if (raw.answer !== undefined && raw.answer !== null) {
      const ansVal = raw.answer;
      if (typeof ansVal === "number") {
        // Numeric index (0-based or 1-based - check if within range)
        correctIndex = ansVal;
        // If index is 1-based (> options.length - 1), adjust
        if (correctIndex >= options.length && correctIndex > 0) {
          correctIndex = correctIndex - 1;
        }
        answer = options[correctIndex] ?? String(ansVal);
      } else {
        // String answer - find matching option
        answer = String(ansVal).trim();
        correctIndex = options.findIndex(
          (o) => o.toLowerCase().trim() === answer.toLowerCase().trim()
        );
        if (correctIndex === -1 && options.length > 0) {
          // Try partial match
          correctIndex = options.findIndex(
            (o) => o.toLowerCase().includes(answer.toLowerCase()) || 
                   answer.toLowerCase().includes(o.toLowerCase())
          );
        }
      }
    } else if (raw.correct_answer !== undefined && raw.correct_answer !== null) {
      const caVal = raw.correct_answer;
      if (typeof caVal === "number") {
        // Could be 0-based or 1-based index
        // Heuristic: if value is between 0 and options.length-1, treat as 0-based
        // If value is between 1 and options.length, treat as 1-based
        if (caVal >= 0 && caVal < options.length) {
          correctIndex = caVal;
        } else if (caVal >= 1 && caVal <= options.length) {
          correctIndex = caVal - 1;
        } else {
          correctIndex = 0;
        }
        answer = options[correctIndex] ?? String(caVal);
      } else {
        answer = String(caVal).trim();
        correctIndex = options.findIndex(
          (o) => o.toLowerCase().trim() === answer.toLowerCase().trim()
        );
      }
    }

    // If we still don't have a correctIndex, default to 0
    if (correctIndex < 0 && options.length > 0) {
      correctIndex = 0;
      answer = options[0];
    }

    // Extract feedback
    const feedback = String(raw.feedback ?? raw.explanation ?? "").trim();

    // Extract ID
    const id = Number(raw.id ?? raw.question_number ?? index + 1);

    return {
      id: isNaN(id) ? index + 1 : id,
      type,
      question: questionText,
      options,
      answer,
      correctIndex,
      feedback,
    };
  } catch {
    return null;
  }
}

// ─── Extract questions array from various top-level structures ───
function extractRawQuestions(parsed: Record<string, unknown>): Record<string, unknown>[] {
  // Format: { questions: [...] }
  if (Array.isArray(parsed.questions)) {
    return parsed.questions as Record<string, unknown>[];
  }

  // Format: { quiz: [...] }
  if (Array.isArray(parsed.quiz)) {
    return parsed.quiz as Record<string, unknown>[];
  }

  // Format: { "0": {...}, "1": {...}, ... } (numbered keys)
  const numericKeys = Object.keys(parsed).filter((k) => /^\d+$/.test(k));
  if (numericKeys.length > 0) {
    return numericKeys
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => parsed[k] as Record<string, unknown>)
      .filter((v) => v && typeof v === "object");
  }

  return [];
}

// ─── Parse quiz JSON from content ───
export function parseQuizFromContent(content: string): QuizData | null {
  if (!content) return null;

  try {
    // Try to find JSON block in ```json ... ``` markers first
    const codeBlockMatch = content.match(/```json\s*([\s\S]*?)```/);
    let jsonStr = "";
    let introText = "";

    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
      introText = content.substring(0, codeBlockMatch.index ?? 0).trim();
    } else {
      // Fallback: find first { and match to closing }
      const idx = content.indexOf("{");
      if (idx === -1) return null;

      let depth = 0;
      let endIdx = -1;
      for (let i = idx; i < content.length; i++) {
        if (content[i] === "{") depth++;
        if (content[i] === "}") depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
      if (endIdx === -1) return null;

      jsonStr = content.substring(idx, endIdx + 1);
      introText = content.substring(0, idx).trim();
    }

    // Try parsing directly first
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // If direct parse fails, try sanitizing
      const sanitized = sanitizeJsonString(jsonStr);
      try {
        parsed = JSON.parse(sanitized);
      } catch {
        // Last resort: try to extract individual question objects with regex
        return tryRegexExtraction(content);
      }
    }

    const rawQuestions = extractRawQuestions(parsed);
    if (rawQuestions.length === 0) return null;

    const questions = rawQuestions
      .map((q, i) => normalizeQuestion(q, i))
      .filter((q): q is NormalizedQuestion => q !== null);

    if (questions.length === 0) return null;

    // Ensure unique IDs
    const seenIds = new Set<number>();
    questions.forEach((q, i) => {
      if (seenIds.has(q.id)) {
        q.id = 1000 + i;
      }
      seenIds.add(q.id);
    });

    return {
      questions,
      introText: introText || undefined,
    };
  } catch {
    return null;
  }
}

// ─── Regex fallback for severely malformed JSON ───
function tryRegexExtraction(content: string): QuizData | null {
  try {
    // Try to extract question/answer pairs from markdown-like content
    const questionBlocks = content.split(/(?=\d+[\.\)]\s)/);
    const questions: NormalizedQuestion[] = [];

    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i];
      const qMatch = block.match(/\d+[\.\)]\s*(.+?)(?:\n|$)/);
      if (!qMatch) continue;

      const optionMatches = [...block.matchAll(/[A-D][\.\)]\s*(.+?)(?:\n|$)/g)];
      if (optionMatches.length < 2) continue;

      const options = optionMatches.map((m) => m[1].trim());
      const answerMatch = block.match(/(?:correct|answer|réponse)[:\s]*([A-D])/i);
      const correctIdx = answerMatch ? answerMatch[1].charCodeAt(0) - 65 : 0;

      questions.push({
        id: questions.length + 1,
        type: "multiple-choice",
        question: qMatch[1].trim(),
        options,
        answer: options[correctIdx] ?? options[0],
        correctIndex: correctIdx,
        feedback: "",
      });
    }

    return questions.length > 0 ? { questions } : null;
  } catch {
    return null;
  }
}

// ─── Utility: check if user answer is correct ───
function isAnswerCorrect(userAnswer: string, question: NormalizedQuestion): boolean {
  if (!userAnswer) return false;
  // Primary check: exact match with the answer string
  if (userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()) return true;
  // Secondary check: match by index (if user selected an option, it should match)
  const selectedIdx = question.options.findIndex(
    (o) => o.toLowerCase().trim() === userAnswer.toLowerCase().trim()
  );
  return selectedIdx >= 0 && selectedIdx === question.correctIndex;
}

// ─── Component Props ───
interface QuizRendererProps {
  content: string;
  language?: string;
  onComplete?: (score?: number) => void;
}

// ─── Main Component ───
export default function QuizRenderer({ content, language = "en", onComplete }: QuizRendererProps) {
  const isEn = language === "en";
  const quizData = useMemo(() => parseQuizFromContent(content), [content]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [fillInput, setFillInput] = useState("");
  const [showResults, setShowResults] = useState(false);

  if (!quizData || quizData.questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{isEn ? "Quiz data could not be loaded." : "Les données du quiz n'ont pas pu être chargées."}</p>
      </div>
    );
  }

  const questions = quizData.questions;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{isEn ? "Quiz question not found." : "Question du quiz introuvable."}</p>
      </div>
    );
  }

  const isAnswered = !!revealed[currentQuestion.id];
  const selectedAnswer = answers[currentQuestion.id] ?? "";
  const isCorrect = isAnswerCorrect(selectedAnswer, currentQuestion);
  const answeredCount = Object.keys(revealed).length;
  const correctCount = Object.entries(answers).filter(([idStr]) => {
    const qId = Number(idStr);
    const q = questions.find((q) => q.id === qId);
    if (!q || !revealed[qId]) return false;
    return isAnswerCorrect(answers[qId], q);
  }).length;

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
    setRevealed((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleFillSubmit = () => {
    if (!fillInput.trim() || isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: fillInput.trim() }));
    setRevealed((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFillInput(answers[questions[currentIndex + 1]?.id] || "");
    } else {
      setShowResults(true);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setFillInput(answers[questions[currentIndex - 1]?.id] || "");
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setRevealed({});
    setFillInput("");
    setShowResults(false);
  };

  // ─── Results Screen ───
  if (showResults) {
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Score Card */}
        <div
          className={`
          relative overflow-hidden rounded-2xl p-8 text-center
          ${
            passed
              ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/20"
              : "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20"
          }
        `}
        >
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-xl" />

          <div className="relative z-10">
            <div
              className={`
              w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center
              ${passed ? "bg-emerald-500/20" : "bg-amber-500/20"}
            `}
            >
              {passed ? (
                <Trophy className="h-10 w-10 text-emerald-500" />
              ) : (
                <Target className="h-10 w-10 text-amber-500" />
              )}
            </div>

            <h3 className="text-2xl font-bold mb-1">
              {passed
                ? isEn
                  ? "Excellent Work!"
                  : "Excellent travail !"
                : isEn
                  ? "Keep Practicing!"
                  : "Continuez à pratiquer !"}
            </h3>

            <div
              className="text-4xl font-black my-3"
              style={{ color: passed ? "#10b981" : "#f59e0b" }}
            >
              {score}%
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {isEn
                ? `You answered ${correctCount} out of ${totalQuestions} questions correctly.`
                : `Vous avez répondu correctement à ${correctCount} questions sur ${totalQuestions}.`}
            </p>

            <div className="flex items-center justify-center gap-1.5 mb-6">
              {questions.map((q) => {
                const ans = answers[q.id];
                const correct = ans ? isAnswerCorrect(ans, q) : false;
                return (
                  <div
                    key={q.id}
                    className={`w-3 h-3 rounded-full transition-all ${
                      revealed[q.id]
                        ? correct
                          ? "bg-emerald-500"
                          : "bg-red-400"
                        : "bg-muted"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={resetQuiz}
                className="gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                {isEn ? "Try Again" : "Réessayer"}
              </Button>
              {passed && onComplete && (
                <Button
                  size="sm"
                  onClick={() => onComplete?.(score)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isEn ? "Complete & Continue" : "Terminer et continuer"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {isEn ? "Review Answers" : "Révision des réponses"}
          </h4>
          {questions.map((q, i) => {
            const ans = answers[q.id];
            const correct = ans ? isAnswerCorrect(ans, q) : false;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setShowResults(false);
                  setCurrentIndex(i);
                }}
                className={`
                  w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm
                  ${
                    correct
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-red-400/30 bg-red-400/5"
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  {correct ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Q{i + 1}: {q.question}
                    </p>
                    {!correct && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isEn ? "Correct answer" : "Bonne réponse"}:{" "}
                        <span className="font-medium text-emerald-600">
                          {q.answer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ─── Question Screen ───
  return (
    <div className="space-y-5">
      {/* Progress Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Question {currentIndex + 1}/{totalQuestions}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {answeredCount}/{totalQuestions}{" "}
              {isEn ? "answered" : "répondu"}
            </span>
          </div>
          <Progress
            value={(answeredCount / totalQuestions) * 100}
            className="h-2"
          />
        </div>
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 shrink-0"
        >
          <Star className="h-3 w-3 mr-1 text-amber-500" />
          {correctCount}/{answeredCount || 0}
        </Badge>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Question Type Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-wider"
            >
              {currentQuestion.type === "multiple-choice"
                ? isEn
                  ? "Multiple Choice"
                  : "Choix multiple"
                : isEn
                  ? "Fill in the Blank"
                  : "Compléter la phrase"}
            </Badge>
          </div>

          {/* Question Text */}
          <h4 className="text-base font-semibold leading-relaxed mb-4">
            {currentQuestion.question}
          </h4>

          {/* Multiple Choice Options */}
          {currentQuestion.type === "multiple-choice" &&
            currentQuestion.options &&
            currentQuestion.options.length > 0 && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = optIdx === currentQuestion.correctIndex;
                  const showCorrect = isAnswered && isCorrectOption;
                  const showWrong = isAnswered && isSelected && !isCorrectOption;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(option)}
                      disabled={isAnswered}
                      className={`
                        w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200
                        flex items-center gap-3 group
                        ${
                          !isAnswered
                            ? "border-border hover:border-[#0F3D3E]/50 hover:bg-[#0F3D3E]/5 hover:shadow-sm cursor-pointer"
                            : showCorrect
                              ? "border-emerald-500 bg-emerald-500/10"
                              : showWrong
                                ? "border-red-400 bg-red-400/10"
                                : "border-border/50 opacity-60"
                        }
                      `}
                    >
                      {/* Option Letter */}
                      <div
                        className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all
                        ${
                          !isAnswered
                            ? "bg-muted text-muted-foreground group-hover:bg-[#0F3D3E] group-hover:text-white"
                            : showCorrect
                              ? "bg-emerald-500 text-white"
                              : showWrong
                                ? "bg-red-400 text-white"
                                : "bg-muted text-muted-foreground"
                        }
                      `}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>

                      {/* Option Text */}
                      <span className="flex-1 text-sm font-medium">
                        {option}
                      </span>

                      {/* Result Icon */}
                      {isAnswered && (
                        <div className="shrink-0">
                          {showCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          )}
                          {showWrong && (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

          {/* Fill in the Blank */}
          {currentQuestion.type === "fill-in-the-blank" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={isAnswered ? selectedAnswer : fillInput}
                  onChange={(e) => setFillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFillSubmit()}
                  placeholder={
                    isEn
                      ? "Type your answer..."
                      : "Tapez votre réponse..."
                  }
                  disabled={isAnswered}
                  className={`
                    text-base font-medium
                    ${
                      isAnswered
                        ? isCorrect
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                          : "border-red-400 bg-red-400/10 text-red-600"
                        : "border-border"
                    }
                  `}
                />
                {!isAnswered && (
                  <Button
                    onClick={handleFillSubmit}
                    disabled={!fillInput.trim()}
                    className="bg-[#0F3D3E] hover:bg-[#0F3D3E]/90 text-white shrink-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isAnswered && !isCorrect && (
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    {isEn ? "Correct answer: " : "Bonne réponse : "}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {currentQuestion.answer}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Feedback */}
          {isAnswered && currentQuestion.feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                mt-4 p-4 rounded-xl flex items-start gap-3
                ${
                  isCorrect
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-amber-500/10 border border-amber-500/20"
                }
              `}
            >
              <Lightbulb
                className={`h-5 w-5 shrink-0 mt-0.5 ${
                  isCorrect ? "text-emerald-500" : "text-amber-500"
                }`}
              />
              <p className="text-sm leading-relaxed">
                {currentQuestion.feedback}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {isEn ? "Previous" : "Précédent"}
        </Button>

        {/* Question Dots */}
        <div className="flex items-center gap-1">
          {questions.map((q, i) => {
            const ans = answers[q.id];
            const correct =
              revealed[q.id] && ans ? isAnswerCorrect(ans, q) : false;
            const wrong = revealed[q.id] && !correct;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIndex(i);
                  setFillInput(answers[q.id] || "");
                }}
                className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-200
                  ${i === currentIndex ? "w-5 bg-[#0F3D3E]" : ""}
                  ${correct ? "bg-emerald-500" : ""}
                  ${wrong ? "bg-red-400" : ""}
                  ${
                    !revealed[q.id] && i !== currentIndex
                      ? "bg-border hover:bg-muted-foreground"
                      : ""
                  }
                `}
                aria-label={`Question ${i + 1}`}
              />
            );
          })}
        </div>

        <Button
          size="sm"
          onClick={goNext}
          disabled={!isAnswered}
          className="gap-1 bg-[#0F3D3E] hover:bg-[#0F3D3E]/90 text-white"
        >
          {currentIndex === totalQuestions - 1
            ? isEn
              ? "See Results"
              : "Voir les résultats"
            : isEn
              ? "Next"
              : "Suivant"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
