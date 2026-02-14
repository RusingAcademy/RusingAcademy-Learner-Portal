import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Clock,
  Zap,
  Target,
  CheckCircle2,
  Gift,
  ChevronRight,
  Flame,
  BookOpen,
  Mic,
  PenTool,
  Bot,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  type: "daily" | "weekly" | "special";
  category: "lessons" | "practice" | "streak" | "quiz" | "ai" | "coaching";
  currentProgress: number;
  targetProgress: number;
  xpReward: number;
  isCompleted: boolean;
  expiresAt?: Date;
}

interface WeeklyChallengesCardProps {
  challenges: Challenge[];
  language?: "en" | "fr";
  onChallengeClick?: (challengeId: string) => void;
  className?: string;
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  lessons: BookOpen,
  practice: Target,
  streak: Flame,
  quiz: CheckCircle2,
  ai: Bot,
  coaching: Mic,
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  lessons: "text-blue-500 bg-blue-500/10",
  practice: "text-emerald-500 bg-emerald-500/10",
  streak: "text-orange-500 bg-orange-500/10",
  quiz: "text-purple-500 bg-purple-500/10",
  ai: "text-pink-500 bg-pink-500/10",
  coaching: "text-amber-500 bg-amber-500/10",
};

// Time remaining formatter
const formatTimeRemaining = (expiresAt: Date, language: "en" | "fr") => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) return language === "fr" ? "Expiré" : "Expired";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return language === "fr" ? `${days}j restants` : `${days}d left`;
  }
  return language === "fr" ? `${hours}h restantes` : `${hours}h left`;
};

// Single challenge item
function ChallengeItem({
  challenge,
  language,
  onClick,
}: {
  challenge: Challenge;
  language: "en" | "fr";
  onClick?: () => void;
}) {
  const Icon = CATEGORY_ICONS[challenge.category] || Target;
  const colorClass = CATEGORY_COLORS[challenge.category] || CATEGORY_COLORS.practice;
  const progressPercent = Math.min((challenge.currentProgress / challenge.targetProgress) * 100, 100);
  
  const title = language === "fr" && challenge.titleFr ? challenge.titleFr : challenge.title;
  const description = language === "fr" && challenge.descriptionFr ? challenge.descriptionFr : challenge.description;

  return (
    <motion.div
      className={cn(
        "relative p-4 rounded-xl border transition-all cursor-pointer",
        challenge.isCompleted
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Completed overlay */}
      {challenge.isCompleted && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              "font-semibold text-sm",
              challenge.isCompleted ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white"
            )}>
              {title}
            </h4>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                challenge.type === "daily" && "border-blue-300 text-blue-600",
                challenge.type === "weekly" && "border-purple-300 text-purple-600",
                challenge.type === "special" && "border-amber-300 text-amber-600"
              )}
            >
              {challenge.type === "daily" && (language === "fr" ? "Quotidien" : "Daily")}
              {challenge.type === "weekly" && (language === "fr" ? "Hebdo" : "Weekly")}
              {challenge.type === "special" && (language === "fr" ? "Spécial" : "Special")}
            </Badge>
          </div>

          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
              {description}
            </p>
          )}

          {/* Progress bar */}
          {!challenge.isCompleted && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {challenge.currentProgress}/{challenge.targetProgress}
                </span>
                {challenge.expiresAt && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeRemaining(challenge.expiresAt, language)}
                  </span>
                )}
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          {/* Reward */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-amber-600">
              <Zap className="h-3 w-3" />
              <span className="text-xs font-semibold">+{challenge.xpReward} XP</span>
            </div>
            {!challenge.isCompleted && (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function WeeklyChallengesCard({
  challenges,
  language = "en",
  onChallengeClick,
  className,
}: WeeklyChallengesCardProps) {
  const [showAll, setShowAll] = useState(false);
  
  const completedCount = challenges.filter(c => c.isCompleted).length;
  const totalXP = challenges.reduce((sum, c) => sum + (c.isCompleted ? c.xpReward : 0), 0);
  const displayedChallenges = showAll ? challenges : challenges.slice(0, 3);

  const labels = {
    en: {
      title: "Weekly Challenges",
      subtitle: "Complete challenges to earn bonus XP",
      completed: "completed",
      earned: "XP earned",
      viewAll: "View All",
      showLess: "Show Less",
      noChallenges: "No active challenges this week",
      checkBack: "Check back soon for new challenges!",
    },
    fr: {
      title: "Défis Hebdomadaires",
      subtitle: "Complétez des défis pour gagner des XP bonus",
      completed: "complétés",
      earned: "XP gagnés",
      viewAll: "Voir tout",
      showLess: "Voir moins",
      noChallenges: "Aucun défi actif cette semaine",
      checkBack: "Revenez bientôt pour de nouveaux défis!",
    },
  };

  const l = labels[language];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {l.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{l.subtitle}</p>
          </div>
          
          {/* Stats badges */}
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {completedCount}/{challenges.length}
            </Badge>
            {totalXP > 0 && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1">
                <Zap className="h-3 w-3" />
                {totalXP} XP
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {challenges.length === 0 ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">{l.noChallenges}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">{l.checkBack}</p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {displayedChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ChallengeItem
                    challenge={challenge}
                    language={language}
                    onClick={() => onChallengeClick?.(challenge.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* View all button */}
            {challenges.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500 hover:text-slate-700"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? l.showLess : `${l.viewAll} (${challenges.length - 3} more)`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default WeeklyChallengesCard;
