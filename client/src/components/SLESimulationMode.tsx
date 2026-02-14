import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Play, Pause, RotateCcw, Clock, Target, AlertTriangle, 
  CheckCircle, Volume2, VolumeX, Maximize2, Minimize2,
  BookOpen, Headphones, Mic, PenTool
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ExamType = "reading" | "writing" | "oral";
type ExamLevel = "A" | "B" | "C";

interface Question {
  id: string;
  type: ExamType;
  level: ExamLevel;
  question: string;
  options?: string[];
  correctAnswer?: string;
  audioUrl?: string;
  timeLimit: number; // seconds
}

interface SLESimulationModeProps {
  examType: ExamType;
  examLevel: ExamLevel;
  questions: Question[];
  onComplete?: (results: SimulationResults) => void;
  language?: "en" | "fr";
  className?: string;
}

interface SimulationResults {
  examType: ExamType;
  examLevel: ExamLevel;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  score: number;
  passed: boolean;
}

export function SLESimulationMode({
  examType,
  examLevel,
  questions,
  onComplete,
  language = "en",
  className,
}: SLESimulationModeProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const labels = {
    en: {
      title: "SLE Simulation Mode",
      subtitle: "Practice under real exam conditions",
      startExam: "Start Exam",
      pauseExam: "Pause",
      resumeExam: "Resume",
      restartExam: "Restart",
      submitExam: "Submit Exam",
      nextQuestion: "Next",
      previousQuestion: "Previous",
      timeRemaining: "Time Remaining",
      question: "Question",
      of: "of",
      reading: "Reading Comprehension",
      writing: "Written Expression",
      oral: "Oral Interaction",
      levelA: "Level A",
      levelB: "Level B",
      levelC: "Level C",
      instructions: "Instructions",
      readingInstructions: "Read the passage carefully and answer the questions. You have limited time per question.",
      writingInstructions: "Write your response in the text area. Focus on grammar, vocabulary, and coherence.",
      oralInstructions: "Listen to the audio prompt and record your response. Speak clearly and naturally.",
      results: "Exam Results",
      score: "Score",
      passed: "Passed",
      failed: "Needs Improvement",
      correctAnswers: "Correct Answers",
      timeSpent: "Total Time Spent",
      avgTime: "Avg. Time per Question",
      tryAgain: "Try Again",
      exitSimulation: "Exit Simulation",
      warning: "Warning",
      timeWarning: "Less than 1 minute remaining!",
      fullscreen: "Fullscreen",
      exitFullscreen: "Exit Fullscreen",
      mute: "Mute",
      unmute: "Unmute",
    },
    fr: {
      title: "Mode Simulation ELS",
      subtitle: "Pratiquez dans les conditions réelles d'examen",
      startExam: "Commencer l'Examen",
      pauseExam: "Pause",
      resumeExam: "Reprendre",
      restartExam: "Recommencer",
      submitExam: "Soumettre l'Examen",
      nextQuestion: "Suivant",
      previousQuestion: "Précédent",
      timeRemaining: "Temps Restant",
      question: "Question",
      of: "sur",
      reading: "Compréhension de l'Écrit",
      writing: "Expression Écrite",
      oral: "Interaction Orale",
      levelA: "Niveau A",
      levelB: "Niveau B",
      levelC: "Niveau C",
      instructions: "Instructions",
      readingInstructions: "Lisez le passage attentivement et répondez aux questions. Vous avez un temps limité par question.",
      writingInstructions: "Rédigez votre réponse dans la zone de texte. Concentrez-vous sur la grammaire, le vocabulaire et la cohérence.",
      oralInstructions: "Écoutez l'invite audio et enregistrez votre réponse. Parlez clairement et naturellement.",
      results: "Résultats de l'Examen",
      score: "Score",
      passed: "Réussi",
      failed: "À Améliorer",
      correctAnswers: "Réponses Correctes",
      timeSpent: "Temps Total",
      avgTime: "Temps Moyen par Question",
      tryAgain: "Réessayer",
      exitSimulation: "Quitter la Simulation",
      warning: "Attention",
      timeWarning: "Moins d'une minute restante!",
      fullscreen: "Plein Écran",
      exitFullscreen: "Quitter Plein Écran",
      mute: "Couper le Son",
      unmute: "Activer le Son",
    },
  };

  const l = labels[language];

  const examTypeLabels = {
    reading: l.reading,
    writing: l.writing,
    oral: l.oral,
  };

  const examTypeIcons = {
    reading: BookOpen,
    writing: PenTool,
    oral: Mic,
  };

  const levelLabels = {
    A: l.levelA,
    B: l.levelB,
    C: l.levelC,
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalTime = questions.reduce((acc, q) => acc + q.timeLimit, 0);
  const passingScore = examLevel === "C" ? 70 : examLevel === "B" ? 60 : 50;

  // Timer effect
  useEffect(() => {
    if (isStarted && !isPaused && !showResults && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-advance to next question or end exam
            if (currentQuestionIndex < questions.length - 1) {
              setCurrentQuestionIndex((i) => i + 1);
              return questions[currentQuestionIndex + 1]?.timeLimit || 0;
            } else {
              handleSubmit();
              return 0;
            }
          }
          return prev - 1;
        });
        setTotalTimeSpent((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, isPaused, showResults, timeRemaining, currentQuestionIndex, questions]);

  const handleStart = useCallback(() => {
    setIsStarted(true);
    setIsPaused(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(questions[0]?.timeLimit || 60);
    setTotalTimeSpent(0);
    setShowResults(false);
  }, [questions]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setTimeRemaining(questions[currentQuestionIndex + 1]?.timeLimit || 60);
    }
  }, [currentQuestionIndex, questions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
      setTimeRemaining(questions[currentQuestionIndex - 1]?.timeLimit || 60);
    }
  }, [currentQuestionIndex, questions]);

  const handleSubmit = useCallback(() => {
    const correctAnswers = questions.filter(
      (q) => q.correctAnswer && answers[q.id] === q.correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    const results: SimulationResults = {
      examType,
      examLevel,
      totalQuestions: questions.length,
      answeredQuestions: Object.keys(answers).length,
      correctAnswers,
      timeSpent: totalTimeSpent,
      averageTimePerQuestion: Math.round(totalTimeSpent / questions.length),
      score,
      passed: score >= passingScore,
    };

    setShowResults(true);
    onComplete?.(results);
  }, [questions, answers, examType, examLevel, totalTimeSpent, passingScore, onComplete]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const ExamIcon = examTypeIcons[examType];

  // Pre-exam screen
  if (!isStarted) {
    return (
      <div ref={containerRef} className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8", className)}>
        <div className="text-center max-w-2xl mx-auto">
          {/* Header */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
            <ExamIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{l.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{l.subtitle}</p>

          {/* Exam Info */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Type</p>
              <p className="font-semibold text-slate-900 dark:text-white">{examTypeLabels[examType]}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Level</p>
              <p className="font-semibold text-slate-900 dark:text-white">{levelLabels[examLevel]}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Questions</p>
              <p className="font-semibold text-slate-900 dark:text-white">{questions.length}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-left p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-8">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">{l.instructions}</h3>
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              {examType === "reading" ? l.readingInstructions : 
               examType === "writing" ? l.writingInstructions : 
               l.oralInstructions}
            </p>
          </div>

          {/* Start Button */}
          <Button
            size="lg"
            onClick={handleStart}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8"
          >
            <Play className="h-5 w-5 mr-2" />
            {l.startExam}
          </Button>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const correctAnswers = questions.filter(
      (q) => q.correctAnswer && answers[q.id] === q.correctAnswer
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= passingScore;

    return (
      <div ref={containerRef} className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8", className)}>
        <div className="text-center max-w-2xl mx-auto">
          {/* Result Icon */}
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
            passed ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"
          )}>
            {passed ? (
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{l.results}</h2>
          <p className={cn(
            "text-lg font-medium mb-8",
            passed ? "text-emerald-600" : "text-amber-600"
          )}>
            {passed ? l.passed : l.failed}
          </p>

          {/* Score Display */}
          <div className="text-6xl font-bold text-slate-900 dark:text-white mb-8">
            {score}%
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{l.correctAnswers}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {correctAnswers}/{questions.length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{l.timeSpent}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatTime(totalTimeSpent)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              {l.exitSimulation}
            </Button>
            <Button onClick={handleStart}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {l.tryAgain}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Exam screen
  return (
    <div 
      ref={containerRef} 
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ExamIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white">
              {examTypeLabels[examType]} - {levelLabels[examLevel]}
            </span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {l.question} {currentQuestionIndex + 1} {l.of} {questions.length}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full font-mono",
            timeRemaining <= 60 
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
              : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="h-8 w-8"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={isPaused ? handleResume : handlePause}
            >
              {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
              {isPaused ? l.resumeExam : l.pauseExam}
            </Button>
          </div>
        </div>
      </div>

      {/* Time Warning */}
      {timeRemaining <= 60 && timeRemaining > 0 && (
        <div className="px-6 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{l.timeWarning}</span>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Pause className="h-16 w-16 text-white mx-auto mb-4" />
            <p className="text-white text-xl font-semibold mb-4">{l.pauseExam}</p>
            <Button onClick={handleResume} size="lg">
              <Play className="h-5 w-5 mr-2" />
              {l.resumeExam}
            </Button>
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="p-6 min-h-[400px]">
        {currentQuestion && (
          <div>
            <p className="text-lg text-slate-900 dark:text-white mb-6">
              {currentQuestion.question}
            </p>

            {/* Multiple Choice Options */}
            {currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      answers[currentQuestion.id] === option
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <span className="text-slate-900 dark:text-white">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Writing Response */}
            {examType === "writing" && !currentQuestion.options && (
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="Type your response here..."
                className="w-full h-48 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          {l.previousQuestion}
        </Button>

        {/* Progress Dots */}
        <div className="flex gap-1">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentQuestionIndex(index);
                setTimeRemaining(questions[index]?.timeLimit || 60);
              }}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                index === currentQuestionIndex
                  ? "bg-blue-500 w-6"
                  : answers[questions[index]?.id]
                  ? "bg-emerald-500"
                  : "bg-slate-300 dark:bg-slate-600"
              )}
            />
          ))}
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
            {l.submitExam}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {l.nextQuestion}
          </Button>
        )}
      </div>
    </div>
  );
}

export default SLESimulationMode;
