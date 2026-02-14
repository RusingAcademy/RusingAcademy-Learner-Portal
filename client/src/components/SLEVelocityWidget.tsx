import React from "react";
import { TrendingUp, Calendar, Target, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLEVelocityWidgetProps {
  currentLevel: string; // e.g., "BBB"
  targetLevel: string; // e.g., "CBC"
  examDate?: Date;
  weeklyHours: number;
  averageProgress: number; // percentage per week
  language?: "en" | "fr";
  className?: string;
}

export function SLEVelocityWidget({
  currentLevel,
  targetLevel,
  examDate,
  weeklyHours,
  averageProgress,
  language = "en",
  className,
}: SLEVelocityWidgetProps) {
  // Calculate estimated weeks to reach target
  const currentProgress = getLevelProgress(currentLevel);
  const targetProgress = getLevelProgress(targetLevel);
  const remainingProgress = targetProgress - currentProgress;
  const weeksToTarget = averageProgress > 0 ? Math.ceil(remainingProgress / averageProgress) : Infinity;
  
  // Calculate if on track for exam
  const today = new Date();
  const daysUntilExam = examDate ? Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const weeksUntilExam = daysUntilExam ? Math.ceil(daysUntilExam / 7) : null;
  
  const isOnTrack = weeksUntilExam ? weeksToTarget <= weeksUntilExam : true;
  const predictedReadyDate = new Date(today.getTime() + weeksToTarget * 7 * 24 * 60 * 60 * 1000);

  const labels = {
    en: {
      title: "Learning Velocity",
      subtitle: "SLE Exam Readiness Prediction",
      currentLevel: "Current Level",
      targetLevel: "Target Level",
      weeklyHours: "Weekly Study Hours",
      avgProgress: "Avg. Weekly Progress",
      estimatedReady: "Estimated Ready Date",
      daysUntilExam: "Days Until Exam",
      onTrack: "On Track",
      needsAttention: "Needs Attention",
      recommendation: "Recommendation",
      increaseHours: "Increase weekly study hours to stay on track",
      maintainPace: "Maintain your current pace for success",
      weeksToGo: "weeks to target",
    },
    fr: {
      title: "Vélocité d'Apprentissage",
      subtitle: "Prédiction de Préparation à l'ELS",
      currentLevel: "Niveau Actuel",
      targetLevel: "Niveau Cible",
      weeklyHours: "Heures d'Étude/Semaine",
      avgProgress: "Progrès Hebdo. Moyen",
      estimatedReady: "Date Prête Estimée",
      daysUntilExam: "Jours Avant l'Examen",
      onTrack: "En Bonne Voie",
      needsAttention: "Attention Requise",
      recommendation: "Recommandation",
      increaseHours: "Augmentez vos heures d'étude pour rester sur la bonne voie",
      maintainPace: "Maintenez votre rythme actuel pour réussir",
      weeksToGo: "semaines vers l'objectif",
    },
  };

  const l = labels[language];

  return (
    <div className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{l.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{l.subtitle}</p>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
          isOnTrack 
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        )}>
          {isOnTrack ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {isOnTrack ? l.onTrack : l.needsAttention}
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{currentLevel}</span>
          <div className="flex-1 mx-4 relative">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${(currentProgress / targetProgress) * 100}%` }}
              />
            </div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md"
              style={{ left: `calc(${(currentProgress / targetProgress) * 100}% - 8px)` }}
            />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{targetLevel}</span>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {weeksToTarget} {l.weeksToGo}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{l.weeklyHours}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{weeklyHours}h</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{l.avgProgress}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">+{averageProgress}%</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{l.estimatedReady}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {predictedReadyDate.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric" })}
          </p>
        </div>
        {daysUntilExam && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">{l.daysUntilExam}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{daysUntilExam}</p>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className={cn(
        "p-4 rounded-lg border",
        isOnTrack 
          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
          : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
      )}>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{l.recommendation}</p>
        <p className={cn(
          "text-sm",
          isOnTrack ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
        )}>
          {isOnTrack ? l.maintainPace : l.increaseHours}
        </p>
      </div>
    </div>
  );
}

// Helper function to convert SLE level to progress percentage
function getLevelProgress(level: string): number {
  const levelMap: Record<string, number> = {
    "X": 0,
    "A": 20,
    "B": 40,
    "C": 60,
    "AA": 15,
    "AB": 25,
    "AC": 35,
    "BA": 35,
    "BB": 45,
    "BC": 55,
    "CA": 55,
    "CB": 65,
    "CC": 75,
    "AAA": 10,
    "AAB": 15,
    "AAC": 20,
    "ABA": 20,
    "ABB": 25,
    "ABC": 30,
    "ACA": 30,
    "ACB": 35,
    "ACC": 40,
    "BAA": 30,
    "BAB": 35,
    "BAC": 40,
    "BBA": 40,
    "BBB": 50,
    "BBC": 55,
    "BCA": 55,
    "BCB": 60,
    "BCC": 65,
    "CAA": 55,
    "CAB": 60,
    "CAC": 65,
    "CBA": 65,
    "CBB": 70,
    "CBC": 75,
    "CCA": 75,
    "CCB": 80,
    "CCC": 85,
    "EEE": 95,
    "EXE": 100,
  };
  return levelMap[level.toUpperCase()] || 50;
}

export default SLEVelocityWidget;
