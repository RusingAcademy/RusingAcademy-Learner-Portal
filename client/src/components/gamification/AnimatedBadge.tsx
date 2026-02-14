import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Award,
  Star,
  Trophy,
  Flame,
  Target,
  Zap,
  BookOpen,
  Mic,
  PenTool,
  Bot,
  GraduationCap,
  Sparkles,
  Medal,
  Crown,
  Heart,
  MessageSquare,
  Lock,
} from "lucide-react";

// Badge icon mapping
const BADGE_ICONS: Record<string, React.ElementType> = {
  first_session: Star,
  "5_sessions": Award,
  "10_sessions": Trophy,
  "25_sessions": Crown,
  first_ai_session: Bot,
  "10_ai_sessions": Sparkles,
  level_up_oral: Mic,
  level_up_written: PenTool,
  level_up_reading: BookOpen,
  first_review: MessageSquare,
  course_completed: GraduationCap,
  streak_7: Flame,
  streak_30: Zap,
  perfect_score: Target,
  helpful_member: Heart,
  default: Medal,
};

// Badge rarity colors
const RARITY_COLORS = {
  common: {
    bg: "from-slate-400 to-slate-500",
    border: "border-slate-400",
    glow: "shadow-slate-400/50",
    text: "text-slate-600",
  },
  uncommon: {
    bg: "from-emerald-400 to-emerald-600",
    border: "border-emerald-400",
    glow: "shadow-emerald-400/50",
    text: "text-emerald-600",
  },
  rare: {
    bg: "from-blue-400 to-blue-600",
    border: "border-blue-400",
    glow: "shadow-blue-400/50",
    text: "text-blue-600",
  },
  epic: {
    bg: "from-purple-400 to-purple-600",
    border: "border-purple-400",
    glow: "shadow-purple-400/50",
    text: "text-purple-600",
  },
  legendary: {
    bg: "from-amber-400 to-orange-500",
    border: "border-amber-400",
    glow: "shadow-amber-400/50",
    text: "text-amber-600",
  },
};

interface AnimatedBadgeProps {
  code: string;
  name: string;
  description?: string;
  points?: number;
  rarity?: keyof typeof RARITY_COLORS;
  isUnlocked?: boolean;
  isNew?: boolean;
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
  onClick?: () => void;
  className?: string;
}

// Confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className={`absolute w-2 h-2 rounded-full ${color}`}
    initial={{ 
      opacity: 1, 
      scale: 0,
      x: 0,
      y: 0,
    }}
    animate={{ 
      opacity: [1, 1, 0],
      scale: [0, 1, 0.5],
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
    }}
    transition={{ 
      duration: 1,
      delay,
      ease: "easeOut",
    }}
  />
);

// Sparkle effect component
const SparkleEffect = ({ isActive }: { isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              x: Math.cos((i * Math.PI) / 4) * 40,
              y: Math.sin((i * Math.PI) / 4) * 40,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: i * 0.05,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        ))}
      </>
    )}
  </AnimatePresence>
);

export function AnimatedBadge({
  code,
  name,
  description,
  points = 0,
  rarity = "common",
  isUnlocked = true,
  isNew = false,
  size = "md",
  showAnimation = false,
  onClick,
  className,
}: AnimatedBadgeProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = BADGE_ICONS[code] || BADGE_ICONS.default;
  const colors = RARITY_COLORS[rarity];
  
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };
  
  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  // Trigger confetti on new badge unlock
  useEffect(() => {
    if (isNew && showAnimation) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isNew, showAnimation]);

  const confettiColors = [
    "bg-yellow-400",
    "bg-pink-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-purple-400",
    "bg-orange-400",
  ];

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center cursor-pointer group",
        className
      )}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Confetti explosion on unlock */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {[...Array(20)].map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.02}
                color={confettiColors[i % confettiColors.length]}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Badge container */}
      <motion.div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          sizeClasses[size],
          isUnlocked
            ? `bg-gradient-to-br ${colors.bg} shadow-lg ${isHovered ? colors.glow : ""}`
            : "bg-slate-200 dark:bg-slate-700",
          "transition-shadow duration-300"
        )}
        initial={showAnimation && isNew ? { scale: 0, rotate: -180 } : {}}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        {/* Glow ring effect for legendary/epic */}
        {isUnlocked && (rarity === "legendary" || rarity === "epic") && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full border-2",
              colors.border,
              "opacity-50"
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Sparkle effects */}
        <SparkleEffect isActive={isHovered && isUnlocked && rarity !== "common"} />

        {/* Icon */}
        {isUnlocked ? (
          <Icon className={cn(iconSizes[size], "text-white drop-shadow-md")} />
        ) : (
          <Lock className={cn(iconSizes[size], "text-slate-400 dark:text-slate-500")} />
        )}

        {/* New badge indicator */}
        {isNew && isUnlocked && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <span className="text-[8px] text-white font-bold">!</span>
          </motion.div>
        )}
      </motion.div>

      {/* Badge name */}
      <motion.span
        className={cn(
          "text-xs font-medium mt-2 text-center line-clamp-2 max-w-[80px]",
          isUnlocked ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
        )}
        initial={showAnimation && isNew ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {name}
      </motion.span>

      {/* Points */}
      {points > 0 && isUnlocked && (
        <motion.span
          className={cn("text-[10px] font-semibold", colors.text)}
          initial={showAnimation && isNew ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          +{points} XP
        </motion.span>
      )}

      {/* Hover tooltip */}
      <AnimatePresence>
        {isHovered && description && (
          <motion.div
            className="absolute bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg shadow-xl z-30 max-w-[150px] text-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            {description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AnimatedBadge;
