import React from "react";
import { Flame, Calendar, Trophy, Zap, Target, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: boolean[]; // 7 days, true = completed
  nextMilestone?: number;
  language?: "en" | "fr";
  className?: string;
}

export function StreakTracker({
  currentStreak,
  longestStreak,
  weeklyProgress,
  nextMilestone,
  language = "en",
  className,
}: StreakTrackerProps) {
  const labels = {
    en: {
      title: "Practice Streak",
      currentStreak: "Current Streak",
      longestStreak: "Longest Streak",
      days: "days",
      day: "day",
      thisWeek: "This Week",
      nextMilestone: "Next Milestone",
      keepGoing: "Keep going!",
      amazing: "Amazing streak!",
      onFire: "You're on fire!",
      weekDays: ["M", "T", "W", "T", "F", "S", "S"],
    },
    fr: {
      title: "Série de Pratique",
      currentStreak: "Série Actuelle",
      longestStreak: "Plus Longue Série",
      days: "jours",
      day: "jour",
      thisWeek: "Cette Semaine",
      nextMilestone: "Prochain Jalon",
      keepGoing: "Continuez!",
      amazing: "Série incroyable!",
      onFire: "Vous êtes en feu!",
      weekDays: ["L", "M", "M", "J", "V", "S", "D"],
    },
  };

  const l = labels[language];

  const getStreakMessage = () => {
    if (currentStreak >= 30) return l.onFire;
    if (currentStreak >= 7) return l.amazing;
    return l.keepGoing;
  };

  const getFlameColor = () => {
    if (currentStreak >= 30) return "text-red-500";
    if (currentStreak >= 14) return "text-orange-500";
    if (currentStreak >= 7) return "text-amber-500";
    return "text-amber-400";
  };

  const getFlameSize = () => {
    if (currentStreak >= 30) return "h-10 w-10";
    if (currentStreak >= 14) return "h-8 w-8";
    return "h-6 w-6";
  };

  return (
    <div className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            currentStreak >= 7 
              ? "bg-gradient-to-br from-orange-400 to-red-500" 
              : "bg-amber-100 dark:bg-amber-900/30"
          )}>
            <Flame className={cn(
              getFlameSize(),
              currentStreak >= 7 ? "text-white" : getFlameColor()
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{l.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{getStreakMessage()}</p>
          </div>
        </div>
      </div>

      {/* Current Streak Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className={cn("h-8 w-8", getFlameColor())} />
          <span className="text-5xl font-bold text-slate-900 dark:text-white">{currentStreak}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          {currentStreak === 1 ? l.day : l.days}
        </p>
      </div>

      {/* Weekly Progress */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">{l.thisWeek}</p>
        <div className="flex justify-between gap-2">
          {weeklyProgress.map((completed, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  completed
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800"
                )}
              >
                {completed ? (
                  <Flame className="h-5 w-5 text-white" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                completed ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
              )}>
                {l.weekDays[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{l.longestStreak}</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {longestStreak} <span className="text-sm font-normal text-slate-500">{l.days}</span>
          </p>
        </div>
        
        {nextMilestone && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">{l.nextMilestone}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {nextMilestone} <span className="text-sm font-normal text-slate-500">{l.days}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact streak display for dashboard headers
interface CompactStreakProps {
  streak: number;
  className?: string;
}

export function CompactStreak({ streak, className }: CompactStreakProps) {
  const getColor = () => {
    if (streak >= 30) return "from-red-500 to-orange-500";
    if (streak >= 14) return "from-orange-500 to-amber-500";
    if (streak >= 7) return "from-amber-500 to-yellow-500";
    return "from-amber-400 to-yellow-400";
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r text-white font-medium",
      getColor(),
      className
    )}>
      <Flame className="h-4 w-4" />
      <span>{streak}</span>
    </div>
  );
}

// Streak milestone celebration
interface StreakMilestoneProps {
  milestone: number;
  reward?: string;
  language?: "en" | "fr";
  onClaim?: () => void;
  className?: string;
}

export function StreakMilestone({
  milestone,
  reward,
  language = "en",
  onClaim,
  className,
}: StreakMilestoneProps) {
  const labels = {
    en: {
      congratulations: "Congratulations!",
      reached: "You've reached a",
      dayStreak: "day streak!",
      reward: "Your reward",
      claim: "Claim Reward",
    },
    fr: {
      congratulations: "Félicitations!",
      reached: "Vous avez atteint une série de",
      dayStreak: "jours!",
      reward: "Votre récompense",
      claim: "Réclamer",
    },
  };

  const l = labels[language];

  return (
    <div className={cn(
      "p-6 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-center",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
        <Flame className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold mb-2">{l.congratulations}</h3>
      <p className="mb-4">
        {l.reached} <span className="font-bold text-2xl">{milestone}</span> {l.dayStreak}
      </p>
      {reward && (
        <div className="p-3 rounded-lg bg-white/20 mb-4">
          <p className="text-sm opacity-90 mb-1">{l.reward}</p>
          <p className="font-semibold flex items-center justify-center gap-2">
            <Gift className="h-4 w-4" />
            {reward}
          </p>
        </div>
      )}
      {onClaim && (
        <button
          onClick={onClaim}
          className="px-6 py-2 rounded-full bg-white text-orange-600 font-semibold hover:bg-white/90 transition-colors"
        >
          {l.claim}
        </button>
      )}
    </div>
  );
}

export default StreakTracker;
