import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Calendar, Zap, Shield, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedStreakProps {
  currentStreak: number;
  longestStreak?: number;
  lastActivityDate?: Date;
  streakFreezes?: number;
  isActive?: boolean;
  language?: "en" | "fr";
  size?: "sm" | "md" | "lg";
  showMilestones?: boolean;
  className?: string;
}

// Animated flame particles
const FlameParticle = ({ delay, size }: { delay: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-t from-orange-500 to-yellow-300"
    style={{
      width: size,
      height: size * 1.5,
      bottom: 0,
      left: `${30 + Math.random() * 40}%`,
    }}
    initial={{ opacity: 0, y: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      y: [-5, -30 - Math.random() * 20],
      scale: [0, 1, 0.3],
      x: (Math.random() - 0.5) * 20,
    }}
    transition={{
      duration: 1 + Math.random() * 0.5,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 0.5,
    }}
  />
);

// Streak milestone badges
const MILESTONES = [7, 14, 30, 60, 90, 180, 365];

const getMilestoneInfo = (days: number, language: "en" | "fr") => {
  const milestones: Record<number, { emoji: string; titleEn: string; titleFr: string }> = {
    7: { emoji: "🔥", titleEn: "Week Warrior", titleFr: "Guerrier de la semaine" },
    14: { emoji: "⚡", titleEn: "Two Week Titan", titleFr: "Titan de deux semaines" },
    30: { emoji: "🌟", titleEn: "Monthly Master", titleFr: "Maître mensuel" },
    60: { emoji: "💎", titleEn: "Diamond Dedication", titleFr: "Dévouement diamant" },
    90: { emoji: "👑", titleEn: "Quarter Champion", titleFr: "Champion trimestriel" },
    180: { emoji: "🏆", titleEn: "Half Year Hero", titleFr: "Héros semestriel" },
    365: { emoji: "🎯", titleEn: "Year Legend", titleFr: "Légende annuelle" },
  };
  
  const milestone = MILESTONES.filter(m => days >= m).pop();
  if (!milestone) return null;
  
  const info = milestones[milestone];
  return {
    ...info,
    title: language === "fr" ? info.titleFr : info.titleEn,
    days: milestone,
  };
};

// Get streak color based on length
const getStreakColor = (days: number) => {
  if (days >= 90) return { from: "from-purple-500", to: "to-pink-500", glow: "shadow-purple-500/50" };
  if (days >= 30) return { from: "from-amber-400", to: "to-orange-500", glow: "shadow-amber-500/50" };
  if (days >= 7) return { from: "from-orange-400", to: "to-red-500", glow: "shadow-orange-500/50" };
  return { from: "from-orange-300", to: "to-orange-500", glow: "shadow-orange-400/30" };
};

export function AnimatedStreak({
  currentStreak,
  longestStreak = 0,
  lastActivityDate,
  streakFreezes = 0,
  isActive = true,
  language = "en",
  size = "md",
  showMilestones = true,
  className,
}: AnimatedStreakProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const colors = getStreakColor(currentStreak);
  const milestone = getMilestoneInfo(currentStreak, language);
  
  const sizeConfig = {
    sm: { container: "w-16 h-16", icon: "h-8 w-8", text: "text-xl", particles: 4 },
    md: { container: "w-20 h-20", icon: "h-10 w-10", text: "text-3xl", particles: 6 },
    lg: { container: "w-28 h-28", icon: "h-14 w-14", text: "text-4xl", particles: 8 },
  };
  
  const config = sizeConfig[size];

  const labels = {
    en: {
      streak: "Day Streak",
      days: "days",
      longest: "Longest",
      freezes: "Streak Freezes",
      keepGoing: "Keep it up!",
      streakLost: "Streak lost",
      comeBack: "Come back tomorrow!",
      milestone: "Milestone reached!",
    },
    fr: {
      streak: "Jours consécutifs",
      days: "jours",
      longest: "Record",
      freezes: "Protections",
      keepGoing: "Continuez!",
      streakLost: "Série perdue",
      comeBack: "Revenez demain!",
      milestone: "Objectif atteint!",
    },
  };

  const l = labels[language];

  // Check if streak is at a milestone
  useEffect(() => {
    if (MILESTONES.includes(currentStreak) && currentStreak > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Main streak display */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Glow effect */}
        {isActive && currentStreak > 0 && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-50",
              `bg-gradient-to-br ${colors.from} ${colors.to}`
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Main circle */}
        <motion.div
          className={cn(
            "relative rounded-full flex items-center justify-center overflow-hidden",
            config.container,
            isActive && currentStreak > 0
              ? `bg-gradient-to-br ${colors.from} ${colors.to} shadow-lg ${colors.glow}`
              : "bg-slate-200 dark:bg-slate-700"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {/* Flame particles */}
          {isActive && currentStreak > 0 && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(config.particles)].map((_, i) => (
                <FlameParticle key={i} delay={i * 0.2} size={4 + Math.random() * 4} />
              ))}
            </div>
          )}

          {/* Icon */}
          <motion.div
            animate={
              isActive && currentStreak > 0
                ? {
                    y: [0, -2, 0],
                    scale: [1, 1.05, 1],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame
              className={cn(
                config.icon,
                isActive && currentStreak > 0 ? "text-white" : "text-slate-400"
              )}
            />
          </motion.div>
        </motion.div>

        {/* Milestone badge */}
        {milestone && showMilestones && (
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            {milestone.emoji}
          </motion.div>
        )}

        {/* Streak freeze indicator */}
        {streakFreezes > 0 && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 shadow-lg flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Snowflake className="h-3 w-3 text-white" />
          </motion.div>
        )}
      </motion.div>

      {/* Streak count */}
      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className={cn(config.text, "font-bold text-slate-900 dark:text-white")}>
          {currentStreak}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {l.streak}
        </p>
      </motion.div>

      {/* Motivational message */}
      {isActive && currentStreak > 0 && (
        <motion.p
          className="mt-2 text-sm text-amber-600 dark:text-amber-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          🔥 {l.keepGoing}
        </motion.p>
      )}

      {/* Milestone celebration */}
      <AnimatePresence>
        {showCelebration && milestone && (
          <motion.div
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
          >
            <span className="text-white font-semibold text-sm flex items-center gap-2">
              {milestone.emoji} {milestone.title}!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      {(longestStreak > 0 || streakFreezes > 0) && (
        <motion.div
          className="mt-4 flex gap-4 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {longestStreak > 0 && (
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Zap className="h-3 w-3" />
              <span>{l.longest}: {longestStreak} {l.days}</span>
            </div>
          )}
          {streakFreezes > 0 && (
            <div className="flex items-center gap-1 text-blue-500">
              <Shield className="h-3 w-3" />
              <span>{streakFreezes} {l.freezes}</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Compact streak display for sidebar/header
export function CompactAnimatedStreak({
  currentStreak,
  isActive = true,
  language = "en",
  className,
}: {
  currentStreak: number;
  isActive?: boolean;
  language?: "en" | "fr";
  className?: string;
}) {
  const colors = getStreakColor(currentStreak);

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        isActive && currentStreak > 0
          ? `bg-gradient-to-r ${colors.from} ${colors.to} text-white`
          : "bg-slate-100 dark:bg-slate-800 text-slate-500",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={
          isActive && currentStreak > 0
            ? { scale: [1, 1.2, 1] }
            : {}
        }
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Flame className="h-4 w-4" />
      </motion.div>
      <span className="font-bold text-sm">{currentStreak}</span>
      <span className="text-xs opacity-80">
        {language === "fr" ? "jours" : "days"}
      </span>
    </motion.div>
  );
}

export default AnimatedStreak;
