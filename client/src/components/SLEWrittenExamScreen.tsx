import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft,
  BookOpen, AlertTriangle, RotateCcw, Trophy, Target,
  ChevronDown, ChevronUp, PenTool, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WrittenQuestion {
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

interface SLEWrittenExamScreenProps {
  language: "fr" | "en";
  mode: ExamMode;
  onBack: () => void;
  onComplete?: (results: WrittenExamResults) => void;
  className?: string;
}

export interface WrittenExamResults {
  language: "fr" | "en";
  mode: ExamMode;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  level: "A" | "B" | "C" | "E" | "X";
  timeSpent: number;
  categoryBreakdown: Record<string, { correct: number; total: number }>;
  questionResults: Array<{
    questionId: string;
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

const labels = {
  fr: {
    title: "Expression écrite — Test 654",
    drillB: "Exercice grammatical — Niveau B",
    drillC: "Identification d'erreurs — Niveau C",
    fullMock: "Simulation complète — Test 654",
    question: "Question",
    of: "de",
    timeRemaining: "Temps restant",
    selectAnswer: "Sélectionnez votre réponse",
    next: "Suivante",
    previous: "Précédente",
    submit: "Soumettre le test",
    confirmSubmit: "Êtes-vous sûr(e) ? Il reste des questions sans réponse.",
    startExam: "Commencer le test",
    instructions: "Instructions",
    instructionText: "Choisissez la meilleure réponse parmi les quatre options proposées. Chaque question porte sur un contexte professionnel de la fonction publique canadienne.",
    timeLimit: "Temps alloué",
    minutes: "minutes",
    questionsCount: "questions",
    results: "Résultats",
    yourScore: "Votre score",
    levelObtained: "Niveau obtenu",
    correct: "Correcte",
    incorrect: "Incorrecte",
    unanswered: "Sans réponse",
    explanation: "Explication",
    grammarRule: "Règle grammaticale",
    commonError: "Erreur courante",
    reviewAnswers: "Revoir les réponses",
    tryAgain: "Réessayer",
    backToMenu: "Retour au menu",
    categoryBreakdown: "Résultats par catégorie",
    showExplanation: "Voir l'explication",
    hideExplanation: "Masquer l'explication",
    answered: "répondues",
    skipped: "ignorées",
  },
  en: {
    title: "Written Expression — Test 654",
    drillB: "Grammar Drill — Level B",
    drillC: "Error Identification — Level C",
    fullMock: "Full Mock Exam — Test 654",
    question: "Question",
    of: "of",
    timeRemaining: "Time Remaining",
    selectAnswer: "Select your answer",
    next: "Next",
    previous: "Previous",
    submit: "Submit Test",
    confirmSubmit: "Are you sure? There are unanswered questions remaining.",
    startExam: "Start Test",
    instructions: "Instructions",
    instructionText: "Choose the best answer from the four options provided. Each question is set in a Canadian public service workplace context.",
    timeLimit: "Time Limit",
    minutes: "minutes",
    questionsCount: "questions",
    results: "Results",
    yourScore: "Your Score",
    levelObtained: "Level Obtained",
    correct: "Correct",
    incorrect: "Incorrect",
    unanswered: "Unanswered",
    explanation: "Explanation",
    grammarRule: "Grammar Rule",
    commonError: "Common Error",
    reviewAnswers: "Review Answers",
    tryAgain: "Try Again",
    backToMenu: "Back to Menu",
    categoryBreakdown: "Results by Category",
    showExplanation: "Show Explanation",
    hideExplanation: "Hide Explanation",
    answered: "answered",
    skipped: "skipped",
  },
};

// ─── Mode Config ─────────────────────────────────────────────────────────────

const modeConfig: Record<ExamMode, { questionCount: number; timeMinutes: number; levels: string[] }> = {
  drill_b: { questionCount: 20, timeMinutes: 10, levels: ["B"] },
  drill_c: { questionCount: 20, timeMinutes: 10, levels: ["C"] },
  full_mock: { questionCount: 55, timeMinutes: 45, levels: ["B", "C"] },
};

// ─── PSC Scoring Thresholds ──────────────────────────────────────────────────

function calculateSLELevel(score: number): "A" | "B" | "C" | "E" | "X" {
  if (score >= 0.80) return "C";
  if (score >= 0.65) return "B";
  if (score >= 0.50) return "A";
  if (score >= 0.30) return "E";
  return "X";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SLEWrittenExamScreen({
  language,
  mode,
  onBack,
  onComplete,
  className,
}: SLEWrittenExamScreenProps) {
  const l = labels[language];
  const config = modeConfig[mode];

  // ─── State ───────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<"intro" | "exam" | "results">("intro");
  const [questions, setQuestions] = useState<WrittenQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(config.timeMinutes * 60);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [results, setResults] = useState<WrittenExamResults | null>(null);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Load Questions ──────────────────────────────────────────────────────

  useEffect(() => {
    loadQuestions();
  }, [language, mode]);

  // tRPC utils for imperative data fetching
  const utils = trpc.useUtils();

  const loadQuestions = useCallback(async () => {
    try {
      // Use tRPC endpoint to load questions securely from the server
      const data = await utils.sleServices.getWrittenQuestions.fetch({
        language,
        levels: config.levels as ("A" | "B" | "C")[],
        count: config.questionCount,
      });

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions as WrittenQuestion[]);
      } else {
        // Fallback: try direct fetch for development
        await loadQuestionsFromFile();
      }
    } catch (error) {
      console.error("Failed to load written questions via tRPC:", error);
      // Fallback: try direct fetch for development
      await loadQuestionsFromFile();
    }
  }, [language, mode, config]);

  const loadQuestionsFromFile = useCallback(async () => {
    try {
      const response = await fetch("/data/sle/seed/written_questions.jsonl");
      if (response.ok) {
        const text = await response.text();
        const allQuestions: WrittenQuestion[] = text
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));
        const filtered = allQuestions.filter(
          (q) => q.language === language && config.levels.includes(q.level)
        );
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, config.questionCount));
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    }
  }, [language, config]);

  // ─── Timer ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase === "exam" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timeRemaining]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleStart = () => {
    setPhase("exam");
    setQuestionStartTime(Date.now());
    setTimeRemaining(config.timeMinutes * 60);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (isReviewMode) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    // Record time spent on current question
    const elapsed = (Date.now() - questionStartTime) / 1000;
    setQuestionTimes((prev) => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || 0) + elapsed,
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    const elapsed = (Date.now() - questionStartTime) / 1000;
    setQuestionTimes((prev) => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || 0) + elapsed,
    }));

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const totalTime = config.timeMinutes * 60 - timeRemaining;
    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};
    const questionResults: WrittenExamResults["questionResults"] = [];

    let correctCount = 0;

    questions.forEach((q, i) => {
      const selected = answers[i] ?? null;
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correctCount++;

      // Category breakdown
      if (!categoryBreakdown[q.category_name]) {
        categoryBreakdown[q.category_name] = { correct: 0, total: 0 };
      }
      categoryBreakdown[q.category_name].total++;
      if (isCorrect) categoryBreakdown[q.category_name].correct++;

      questionResults.push({
        questionId: q.id,
        selectedAnswer: selected,
        correctAnswer: q.correct_answer,
        isCorrect,
        timeSpent: questionTimes[i] || 0,
      });
    });

    const score = questions.length > 0 ? correctCount / questions.length : 0;
    const level = calculateSLELevel(score);

    const examResults: WrittenExamResults = {
      language,
      mode,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      level,
      timeSpent: totalTime,
      categoryBreakdown,
      questionResults,
    };

    setResults(examResults);
    setPhase("results");
    onComplete?.(examResults);
  }, [answers, questions, timeRemaining, questionTimes, language, mode, config, onComplete]);

  const handleReview = () => {
    setIsReviewMode(true);
    setCurrentIndex(0);
    setPhase("exam");
  };

  const handleRetry = () => {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers({});
    setQuestionTimes({});
    setResults(null);
    setIsReviewMode(false);
    setExpandedExplanations(new Set());
    loadQuestions();
  };

  const toggleExplanation = (index: number) => {
    setExpandedExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // ─── Computed ────────────────────────────────────────────────────────────

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const modeTitle = mode === "drill_b" ? l.drillB : mode === "drill_c" ? l.drillC : l.fullMock;

  // ─── Render: Intro Screen ───────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="text-gray-300 hover:text-white transition-colors text-sm"
          >
            ← {l.backToMenu}
          </button>
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-semibold text-sm">{l.title}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          {/* Mode Badge */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              {mode === "full_mock" ? (
                <BookOpen className="w-8 h-8 text-white" />
              ) : mode === "drill_c" ? (
                <AlertTriangle className="w-8 h-8 text-white" />
              ) : (
                <Zap className="w-8 h-8 text-white" />
              )}
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{modeTitle}</h2>

            <div className="flex justify-center gap-6 mb-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">
                  {config.questionCount}
                </div>
                <div className="text-gray-300">{l.questionsCount}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {config.timeMinutes}
                </div>
                <div className="text-gray-300">{l.minutes}</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-black/30 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                {l.instructions}
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                {l.instructionText}
              </p>
            </div>

            <Button
              onClick={handleStart}
              disabled={questions.length === 0}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {l.startExam}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Results Screen ────────────────────────────────────────────

  if (phase === "results" && results) {
    const levelColors: Record<string, string> = {
      C: "from-emerald-500 to-green-600",
      B: "from-blue-500 to-cyan-600",
      A: "from-amber-500 to-yellow-600",
      E: "from-orange-500 to-red-500",
      X: "from-red-600 to-red-800",
    };

    const levelDescriptions: Record<string, Record<string, string>> = {
      fr: {
        C: "Niveau supérieur — Maîtrise professionnelle avancée",
        B: "Niveau intermédiaire — Compétence fonctionnelle",
        A: "Niveau de base — Compétence minimale",
        E: "En dessous du niveau A — Préparation nécessaire",
        X: "Non classifié — Formation intensive recommandée",
      },
      en: {
        C: "Superior Level — Advanced professional proficiency",
        B: "Intermediate Level — Functional competence",
        A: "Basic Level — Minimum competence",
        E: "Below Level A — Further preparation needed",
        X: "Unclassified — Intensive training recommended",
      },
    };

    return (
      <div className={cn("flex flex-col h-full overflow-y-auto", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="text-gray-300 hover:text-white transition-colors text-sm"
          >
            ← {l.backToMenu}
          </button>
          <span className="text-white font-semibold text-sm">{l.results}</span>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-amber-400" />
            <div className="text-4xl font-bold text-white mb-1">
              {Math.round(results.score * 100)}%
            </div>
            <div className="text-gray-300 text-sm mb-4">
              {results.correctAnswers} / {results.totalQuestions} {l.correct.toLowerCase()}
            </div>

            {/* Level Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r text-white font-bold text-lg",
                levelColors[results.level]
              )}
            >
              <Target className="w-5 h-5" />
              {l.levelObtained}: {results.level}
            </div>
            <p className="text-gray-300 text-sm mt-2">
              {levelDescriptions[language][results.level]}
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
              <div className="text-lg font-bold text-emerald-300">{results.correctAnswers}</div>
              <div className="text-xs text-gray-300">{l.correct}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <XCircle className="w-5 h-5 mx-auto mb-1 text-red-400" />
              <div className="text-lg font-bold text-red-300">
                {results.totalQuestions - results.correctAnswers - (results.totalQuestions - answeredCount)}
              </div>
              <div className="text-xs text-gray-300">{l.incorrect}</div>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
              <div className="text-lg font-bold text-gray-300">
                {formatTime(results.timeSpent)}
              </div>
              <div className="text-xs text-gray-300">{l.timeRemaining}</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">{l.categoryBreakdown}</h3>
            <div className="space-y-2">
              {Object.entries(results.categoryBreakdown).map(([cat, data]) => {
                const pct = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-200">{cat}</span>
                      <span className="text-gray-300">
                        {data.correct}/{data.total} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pct >= 80
                            ? "bg-emerald-500"
                            : pct >= 65
                            ? "bg-blue-500"
                            : pct >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReview}
              variant="outline"
              className="flex-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {l.reviewAnswers}
            </Button>
            <Button
              onClick={handleRetry}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {l.tryAgain}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Exam Screen ───────────────────────────────────────────────

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading questions...
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Timer and Progress */}
      <div className="p-3 border-b border-white/10 space-y-2">
        {/* Top row: back, title, timer */}
        <div className="flex items-center justify-between">
          <button
            onClick={isReviewMode ? () => { setIsReviewMode(false); setPhase("results"); } : onBack}
            className="text-gray-300 hover:text-white transition-colors text-sm"
          >
            ← {isReviewMode ? l.results : l.backToMenu}
          </button>

          {!isReviewMode && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-mono font-bold",
                timeRemaining < 60
                  ? "bg-red-500/20 text-red-300 animate-pulse"
                  : timeRemaining < 300
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-gray-700/50 text-gray-200"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-300 whitespace-nowrap">
            {l.question} {currentIndex + 1} {l.of} {questions.length}
          </span>
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {answeredCount} {l.answered}
          </span>
        </div>

        {/* Question navigator dots */}
        <div className="flex gap-1 flex-wrap">
          {questions.map((_, i) => {
            const isAnswered = answers[i] !== undefined;
            const isCurrent = i === currentIndex;
            let dotColor = "bg-gray-600";
            
            if (isReviewMode && results) {
              const qr = results.questionResults[i];
              if (qr) {
                dotColor = qr.isCorrect
                  ? "bg-emerald-500"
                  : qr.selectedAnswer !== null
                  ? "bg-red-500"
                  : "bg-gray-500";
              }
            } else if (isAnswered) {
              dotColor = "bg-cyan-500";
            }

            return (
              <button
                key={i}
                onClick={() => {
                  const elapsed = (Date.now() - questionStartTime) / 1000;
                  setQuestionTimes((prev) => ({
                    ...prev,
                    [currentIndex]: (prev[currentIndex] || 0) + elapsed,
                  }));
                  setCurrentIndex(i);
                  setQuestionStartTime(Date.now());
                }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  dotColor,
                  isCurrent && "ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-125"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Category & Level Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-xs font-semibold",
              currentQuestion.level === "C"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            )}
          >
            {language === "fr" ? "Niveau" : "Level"} {currentQuestion.level}
          </span>
          <span className="text-xs text-gray-400">{currentQuestion.category_name}</span>
          {currentQuestion.type === "error_identification" && (
            <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {language === "fr" ? "Identification d'erreur" : "Error Identification"}
            </span>
          )}
        </div>

        {/* Question Stem */}
        <div className="bg-gray-800/60 border border-white/10 rounded-xl p-4">
          <p className="text-white text-base leading-relaxed font-medium">
            {currentQuestion.stem}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, i) => {
            const isSelected = selectedAnswer === i;
            const optionLabel = String.fromCharCode(65 + i); // A, B, C, D

            let optionStyle = "border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5";
            let labelStyle = "bg-gray-700 text-gray-300";

            if (isReviewMode && results) {
              const isCorrect = i === currentQuestion.correct_answer;
              const wasSelected = selectedAnswer === i;
              if (isCorrect) {
                optionStyle = "border-emerald-500/50 bg-emerald-500/10";
                labelStyle = "bg-emerald-500 text-white";
              } else if (wasSelected) {
                optionStyle = "border-red-500/50 bg-red-500/10";
                labelStyle = "bg-red-500 text-white";
              }
            } else if (isSelected) {
              optionStyle = "border-cyan-500/50 bg-cyan-500/10";
              labelStyle = "bg-cyan-500 text-white";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelectAnswer(i)}
                disabled={isReviewMode}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  optionStyle,
                  !isReviewMode && "cursor-pointer"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all",
                    labelStyle
                  )}
                >
                  {optionLabel}
                </span>
                <span className="text-gray-100 text-sm leading-relaxed">{option}</span>
                {isReviewMode && i === currentQuestion.correct_answer && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto shrink-0" />
                )}
                {isReviewMode && selectedAnswer === i && i !== currentQuestion.correct_answer && (
                  <XCircle className="w-5 h-5 text-red-400 ml-auto shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation (Review Mode) */}
        {isReviewMode && (
          <div className="space-y-2">
            <button
              onClick={() => toggleExplanation(currentIndex)}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              {expandedExplanations.has(currentIndex) ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {expandedExplanations.has(currentIndex) ? l.hideExplanation : l.showExplanation}
            </button>

            {expandedExplanations.has(currentIndex) && (
              <div className="bg-gray-800/80 border border-cyan-500/20 rounded-xl p-4 space-y-3 text-sm">
                <div>
                  <span className="text-cyan-400 font-semibold">{l.explanation}:</span>
                  <p className="text-gray-200 mt-1">{currentQuestion.explanation}</p>
                </div>
                <div>
                  <span className="text-purple-400 font-semibold">{l.grammarRule}:</span>
                  <p className="text-gray-200 mt-1">{currentQuestion.grammar_rule}</p>
                </div>
                <div>
                  <span className="text-amber-400 font-semibold">{l.commonError}:</span>
                  <p className="text-gray-200 mt-1">{currentQuestion.common_error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between gap-3">
        <Button
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          variant="outline"
          size="sm"
          className="border-white/10 text-gray-300 hover:text-white disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {l.previous}
        </Button>

        {isLastQuestion && !isReviewMode ? (
          <Button
            onClick={() => {
              const unanswered = questions.length - answeredCount;
              if (unanswered > 0) {
                if (window.confirm(l.confirmSubmit)) {
                  handleSubmit();
                }
              } else {
                handleSubmit();
              }
            }}
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            {l.submit}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isLastQuestion}
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
          >
            {l.next}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default SLEWrittenExamScreen;
