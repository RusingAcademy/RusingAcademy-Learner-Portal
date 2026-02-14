/**
 * BadgesPanel — Premium gamification badges display
 * 
 * Shows earned and locked badges with glassmorphism accents,
 * micro-animations, and a Kajabi Premier-caliber visual experience.
 * 
 * Can be used in:
 * - LearnLayout sidebar (compact mode)
 * - Standalone page (full mode)
 * - Dashboard widget (mini mode)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Star, Flame, Zap, Target, Award, Crown, Shield,
  BookOpen, GraduationCap, Clock, Sparkles, Lock, ChevronDown,
  ChevronUp, Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

// Badge metadata with icons, colors, and descriptions
const BADGE_CATALOG: Record<string, {
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  category: string;
  description: string;
  descriptionFr: string;
}> = {
  first_lesson: {
    icon: BookOpen,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-emerald-600/10",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/20",
    category: "progress",
    description: "Completed your first lesson",
    descriptionFr: "Première leçon terminée",
  },
  module_complete: {
    icon: Target,
    color: "text-blue-400",
    bgGradient: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/20",
    category: "progress",
    description: "Completed a full module",
    descriptionFr: "Module complet terminé",
  },
  course_complete: {
    icon: GraduationCap,
    color: "text-purple-400",
    bgGradient: "from-purple-500/20 to-purple-600/10",
    borderColor: "border-purple-500/30",
    glowColor: "shadow-purple-500/20",
    category: "progress",
    description: "Completed an entire course",
    descriptionFr: "Cours entier terminé",
  },
  all_courses_complete: {
    icon: Crown,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-amber-600/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    category: "progress",
    description: "Completed all available courses",
    descriptionFr: "Tous les cours terminés",
  },
  streak_3: {
    icon: Flame,
    color: "text-orange-400",
    bgGradient: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/30",
    glowColor: "shadow-orange-500/20",
    category: "streak",
    description: "3-day learning streak",
    descriptionFr: "Série de 3 jours",
  },
  streak_7: {
    icon: Flame,
    color: "text-orange-500",
    bgGradient: "from-orange-500/20 to-red-500/10",
    borderColor: "border-orange-500/40",
    glowColor: "shadow-orange-500/30",
    category: "streak",
    description: "7-day learning streak",
    descriptionFr: "Série de 7 jours",
  },
  streak_14: {
    icon: Flame,
    color: "text-red-400",
    bgGradient: "from-red-500/20 to-orange-600/10",
    borderColor: "border-red-500/30",
    glowColor: "shadow-red-500/20",
    category: "streak",
    description: "14-day learning streak",
    descriptionFr: "Série de 14 jours",
  },
  streak_30: {
    icon: Flame,
    color: "text-red-500",
    bgGradient: "from-red-500/30 to-orange-500/20",
    borderColor: "border-red-500/40",
    glowColor: "shadow-red-500/30",
    category: "streak",
    description: "30-day learning streak — Legendary!",
    descriptionFr: "Série de 30 jours — Légendaire !",
  },
  streak_100: {
    icon: Crown,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/30 to-amber-500/20",
    borderColor: "border-yellow-500/40",
    glowColor: "shadow-yellow-500/30",
    category: "streak",
    description: "100-day streak — Unstoppable!",
    descriptionFr: "Série de 100 jours — Inarrêtable !",
  },
  quiz_ace: {
    icon: Star,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/20 to-amber-500/10",
    borderColor: "border-yellow-500/30",
    glowColor: "shadow-yellow-500/20",
    category: "quiz",
    description: "Aced a quiz with a perfect score",
    descriptionFr: "Quiz réussi avec un score parfait",
  },
  perfect_module: {
    icon: Shield,
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/20 to-purple-500/10",
    borderColor: "border-indigo-500/30",
    glowColor: "shadow-indigo-500/20",
    category: "quiz",
    description: "Perfect score on all module quizzes",
    descriptionFr: "Score parfait sur tous les quiz du module",
  },
  quiz_master: {
    icon: Award,
    color: "text-fuchsia-400",
    bgGradient: "from-fuchsia-500/20 to-purple-500/10",
    borderColor: "border-fuchsia-500/30",
    glowColor: "shadow-fuchsia-500/20",
    category: "quiz",
    description: "Mastered 10+ quizzes",
    descriptionFr: "10+ quiz maîtrisés",
  },
  perfect_score: {
    icon: Star,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/20 to-amber-500/10",
    borderColor: "border-yellow-500/30",
    glowColor: "shadow-yellow-500/20",
    category: "quiz",
    description: "Achieved a perfect score",
    descriptionFr: "Score parfait obtenu",
  },
  xp_100: {
    icon: Zap,
    color: "text-cyan-400",
    bgGradient: "from-cyan-500/20 to-blue-500/10",
    borderColor: "border-cyan-500/30",
    glowColor: "shadow-cyan-500/20",
    category: "milestone",
    description: "Earned 100 XP",
    descriptionFr: "100 XP gagnés",
  },
  xp_500: {
    icon: Zap,
    color: "text-cyan-500",
    bgGradient: "from-cyan-500/20 to-teal-500/10",
    borderColor: "border-cyan-500/40",
    glowColor: "shadow-cyan-500/30",
    category: "milestone",
    description: "Earned 500 XP",
    descriptionFr: "500 XP gagnés",
  },
  xp_1000: {
    icon: Zap,
    color: "text-teal-400",
    bgGradient: "from-teal-500/20 to-emerald-500/10",
    borderColor: "border-teal-500/30",
    glowColor: "shadow-teal-500/20",
    category: "milestone",
    description: "Earned 1,000 XP",
    descriptionFr: "1 000 XP gagnés",
  },
  xp_2500: {
    icon: Zap,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-green-500/10",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/20",
    category: "milestone",
    description: "Earned 2,500 XP",
    descriptionFr: "2 500 XP gagnés",
  },
  xp_5000: {
    icon: Crown,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-yellow-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    category: "milestone",
    description: "Earned 5,000 XP — Elite!",
    descriptionFr: "5 000 XP gagnés — Élite !",
  },
  early_bird: {
    icon: Clock,
    color: "text-sky-400",
    bgGradient: "from-sky-500/20 to-blue-500/10",
    borderColor: "border-sky-500/30",
    glowColor: "shadow-sky-500/20",
    category: "engagement",
    description: "Studied before 7 AM",
    descriptionFr: "Étudié avant 7h",
  },
  night_owl: {
    icon: Clock,
    color: "text-violet-400",
    bgGradient: "from-violet-500/20 to-purple-500/10",
    borderColor: "border-violet-500/30",
    glowColor: "shadow-violet-500/20",
    category: "engagement",
    description: "Studied after 11 PM",
    descriptionFr: "Étudié après 23h",
  },
  weekend_warrior: {
    icon: Shield,
    color: "text-rose-400",
    bgGradient: "from-rose-500/20 to-pink-500/10",
    borderColor: "border-rose-500/30",
    glowColor: "shadow-rose-500/20",
    category: "engagement",
    description: "Studied on weekends",
    descriptionFr: "Étudié le week-end",
  },
  consistent_learner: {
    icon: Target,
    color: "text-green-400",
    bgGradient: "from-green-500/20 to-emerald-500/10",
    borderColor: "border-green-500/30",
    glowColor: "shadow-green-500/20",
    category: "engagement",
    description: "Consistent daily learning",
    descriptionFr: "Apprentissage quotidien régulier",
  },
  level_5: {
    icon: Medal,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-yellow-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    category: "milestone",
    description: "Reached Level 5 — Proficient",
    descriptionFr: "Niveau 5 atteint — Compétent",
  },
  founding_member: {
    icon: Sparkles,
    color: "text-amber-400",
    bgGradient: "from-amber-500/30 to-yellow-500/20",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/30",
    category: "special",
    description: "Founding member of RusingAcademy",
    descriptionFr: "Membre fondateur de RusingAcademy",
  },
  beta_tester: {
    icon: Sparkles,
    color: "text-violet-400",
    bgGradient: "from-violet-500/20 to-purple-500/10",
    borderColor: "border-violet-500/30",
    glowColor: "shadow-violet-500/20",
    category: "special",
    description: "Beta tester",
    descriptionFr: "Testeur bêta",
  },
  community_helper: {
    icon: Trophy,
    color: "text-pink-400",
    bgGradient: "from-pink-500/20 to-rose-500/10",
    borderColor: "border-pink-500/30",
    glowColor: "shadow-pink-500/20",
    category: "special",
    description: "Helped the community",
    descriptionFr: "A aidé la communauté",
  },
  top_reviewer: {
    icon: Star,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-yellow-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    category: "special",
    description: "Top course reviewer",
    descriptionFr: "Meilleur évaluateur de cours",
  },
  // ─── Path Completion Badges ───
  path_a1_complete: {
    icon: GraduationCap,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-yellow-600/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    category: "path_completion",
    description: "Completed Path I — A1 Foundations",
    descriptionFr: "Path I terminé — Fondations A1",
  },
  path_a2_complete: {
    icon: GraduationCap,
    color: "text-amber-500",
    bgGradient: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    category: "path_completion",
    description: "Completed Path II — A2 Everyday Communication",
    descriptionFr: "Path II terminé — Communication Quotidienne A2",
  },
  path_b1_complete: {
    icon: Award,
    color: "text-blue-400",
    bgGradient: "from-blue-500/20 to-indigo-500/10",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/20",
    category: "path_completion",
    description: "Completed Path III — B1 Operational French",
    descriptionFr: "Path III terminé — Français Opérationnel B1",
  },
  path_b2_complete: {
    icon: Crown,
    color: "text-purple-400",
    bgGradient: "from-purple-500/20 to-violet-500/10",
    borderColor: "border-purple-500/30",
    glowColor: "shadow-purple-500/20",
    category: "path_completion",
    description: "Completed Path IV — B2 Professional Mastery",
    descriptionFr: "Path IV terminé — Maîtrise Professionnelle B2",
  },
  path_c1_complete: {
    icon: Crown,
    color: "text-rose-400",
    bgGradient: "from-rose-500/20 to-pink-500/10",
    borderColor: "border-rose-500/30",
    glowColor: "shadow-rose-500/20",
    category: "path_completion",
    description: "Completed Path V — C1 Elite Proficiency",
    descriptionFr: "Path V terminé — Maîtrise Élite C1",
  },
  path_exam_complete: {
    icon: Shield,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/20",
    category: "path_completion",
    description: "Completed Path VI — SLE Exam Preparation",
    descriptionFr: "Path VI terminé — Préparation Examen ELS",
  },
  all_paths_complete: {
    icon: Trophy,
    color: "text-yellow-400",
    bgGradient: "from-yellow-400/20 to-amber-500/10",
    borderColor: "border-yellow-400/30",
    glowColor: "shadow-yellow-400/30",
    category: "path_completion",
    description: "Completed all 6 Learning Paths",
    descriptionFr: "Les 6 Paths d'apprentissage terminés",
  },
  speed_learner: {
    icon: Zap,
    color: "text-cyan-400",
    bgGradient: "from-cyan-500/20 to-sky-500/10",
    borderColor: "border-cyan-500/30",
    glowColor: "shadow-cyan-500/20",
    category: "path_completion",
    description: "Completed a Path in under 30 days",
    descriptionFr: "Path terminé en moins de 30 jours",
  },
};

// All possible badge types for showing locked badges
const ALL_BADGE_TYPES = Object.keys(BADGE_CATALOG);

// Category labels
const CATEGORY_LABELS: Record<string, { en: string; fr: string; icon: React.ElementType }> = {
  progress: { en: "Course Progress", fr: "Progression", icon: GraduationCap },
  streak: { en: "Learning Streaks", fr: "Séries", icon: Flame },
  quiz: { en: "Quiz Performance", fr: "Performance Quiz", icon: Star },
  milestone: { en: "XP Milestones", fr: "Jalons XP", icon: Zap },
  engagement: { en: "Engagement", fr: "Engagement", icon: Target },
  special: { en: "Special", fr: "Spécial", icon: Sparkles },
  path_completion: { en: "Path Completion", fr: "Complétion de Path", icon: Trophy },
};

interface BadgesPanelProps {
  mode?: "compact" | "full" | "mini";
  language?: string;
  className?: string;
  courseId?: number;
}

function BadgeIcon({ 
  badgeType, 
  earned, 
  size = "md",
  showGlow = true,
}: { 
  badgeType: string; 
  earned: boolean;
  size?: "sm" | "md" | "lg";
  showGlow?: boolean;
}) {
  const meta = BADGE_CATALOG[badgeType] || {
    icon: Trophy,
    color: "text-gray-400",
    bgGradient: "from-gray-500/20 to-gray-600/10",
    borderColor: "border-gray-500/30",
    glowColor: "shadow-gray-500/20",
  };
  
  const Icon = meta.icon;
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };
  
  return (
    <div className={cn(
      "relative rounded-xl flex items-center justify-center border transition-all duration-300",
      sizeClasses[size],
      earned ? [
        `bg-gradient-to-br ${meta.bgGradient}`,
        meta.borderColor,
        showGlow && `shadow-lg ${meta.glowColor}`,
      ] : [
        "bg-muted/30 border-muted-foreground/10",
        "grayscale opacity-40",
      ],
    )}>
      <Icon className={cn(
        iconSizes[size],
        earned ? meta.color : "text-muted-foreground/50",
      )} />
      {earned && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      {!earned && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-muted rounded-full flex items-center justify-center border border-muted-foreground/10">
          <Lock className="w-1.5 h-1.5 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}

export default function BadgesPanel({ 
  mode = "compact", 
  language = "en",
  className,
}: BadgesPanelProps) {
  const isEn = language === "en";
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: badges, isLoading } = trpc.gamification.getMyBadges.useQuery(undefined, {
    retry: 1,
    staleTime: 60000,
  });
  
  const earnedTypes = new Set((badges || []).map((b: any) => b.badgeType));
  const totalPossible = ALL_BADGE_TYPES.length;
  const totalEarned = earnedTypes.size;
  const progressPercent = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  
  // Group badges by category
  const categorized = Object.entries(CATEGORY_LABELS).map(([key, label]) => {
    const typesInCategory = ALL_BADGE_TYPES.filter(t => BADGE_CATALOG[t]?.category === key);
    const earnedInCategory = typesInCategory.filter(t => earnedTypes.has(t));
    return {
      key,
      label,
      types: typesInCategory,
      earnedCount: earnedInCategory.length,
      totalCount: typesInCategory.length,
    };
  });
  
  if (isLoading) {
    return (
      <div className={cn("animate-pulse space-y-2 p-3", className)}>
        <div className="h-4 bg-muted/50 rounded w-24" />
        <div className="flex gap-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-10 h-10 bg-muted/30 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  
  // ─── MINI MODE ───
  if (mode === "mini") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Trophy className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium">{totalEarned}/{totalPossible}</span>
        <Progress value={progressPercent} className="h-1.5 flex-1 max-w-[60px]" />
      </div>
    );
  }
  
  // ─── COMPACT MODE (sidebar) ───
  if (mode === "compact") {
    const recentEarned = (badges || []).slice(0, 6);
    
    return (
      <div className={cn("border-t", className)}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="h-3 w-3 text-amber-500" />
            </div>
            <span className="text-xs font-semibold">
              {isEn ? "My Badges" : "Mes badges"}
            </span>
            <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
              {totalEarned}/{totalPossible}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-3">
                {/* Progress bar */}
                <div className="space-y-1">
                  <Progress value={progressPercent} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground text-center">
                    {progressPercent}% {isEn ? "collected" : "collectés"}
                  </p>
                </div>
                
                {/* Recent earned badges */}
                <TooltipProvider delayDuration={200}>
                  <div className="grid grid-cols-6 gap-1.5">
                    {recentEarned.map((badge: any, i: number) => (
                      <Tooltip key={badge.id || i}>
                        <TooltipTrigger asChild>
                          <div>
                            <BadgeIcon
                              badgeType={badge.badgeType}
                              earned={true}
                              size="sm"
                              showGlow={false}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{isEn ? badge.title : (badge.titleFr || badge.title)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {/* Show locked placeholders if fewer than 6 earned */}
                    {Array.from({ length: Math.max(0, 6 - recentEarned.length) }).map((_, i) => {
                      const lockedType = ALL_BADGE_TYPES.filter(t => !earnedTypes.has(t))[i];
                      return lockedType ? (
                        <Tooltip key={`locked-${i}`}>
                          <TooltipTrigger asChild>
                            <div>
                              <BadgeIcon
                                badgeType={lockedType}
                                earned={false}
                                size="sm"
                                showGlow={false}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="text-muted-foreground">
                              {isEn ? "Locked" : "Verrouillé"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : null;
                    })}
                  </div>
                </TooltipProvider>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // ─── FULL MODE (standalone page / large panel) ───
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with overall progress */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-foundation)]/90 to-[var(--brand-foundation)]/70 p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/5 blur-xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">
              {isEn ? "Badge Collection" : "Collection de badges"}
            </h3>
            <p className="text-sm text-white/70 mt-0.5">
              {totalEarned} / {totalPossible} {isEn ? "badges earned" : "badges obtenus"}
            </p>
            <div className="mt-2">
              <Progress value={progressPercent} className="h-2 bg-white/10" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400">
            {progressPercent}%
          </div>
        </div>
      </div>
      
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            !selectedCategory
              ? "bg-[var(--brand-foundation)] text-white shadow-md"
              : "bg-muted/50 text-muted-foreground hover:bg-muted",
          )}
        >
          {isEn ? "All" : "Tous"} ({totalEarned})
        </button>
        {categorized.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key === selectedCategory ? null : cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1",
              cat.key === selectedCategory
                ? "bg-[var(--brand-foundation)] text-white shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted",
            )}
          >
            <cat.label.icon className="h-3 w-3" />
            {isEn ? cat.label.en : cat.label.fr} ({cat.earnedCount}/{cat.totalCount})
          </button>
        ))}
      </div>
      
      {/* Badge grid by category */}
      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-6 pr-2">
          {categorized
            .filter(cat => !selectedCategory || cat.key === selectedCategory)
            .map(cat => (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-3">
                  <cat.label.icon className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">
                    {isEn ? cat.label.en : cat.label.fr}
                  </h4>
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                    {cat.earnedCount}/{cat.totalCount}
                  </span>
                </div>
                
                <TooltipProvider delayDuration={200}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {cat.types.map(type => {
                      const meta = BADGE_CATALOG[type];
                      const earned = earnedTypes.has(type);
                      const badge = (badges || []).find((b: any) => b.badgeType === type);
                      
                      return (
                        <Tooltip key={type}>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: earned ? 1.05 : 1.02 }}
                              className={cn(
                                "relative rounded-xl p-3 border transition-all cursor-default",
                                earned ? [
                                  `bg-gradient-to-br ${meta.bgGradient}`,
                                  meta.borderColor,
                                  `shadow-md ${meta.glowColor}`,
                                ] : [
                                  "bg-muted/20 border-muted-foreground/10",
                                ],
                              )}
                            >
                              <div className="flex flex-col items-center text-center gap-2">
                                <BadgeIcon
                                  badgeType={type}
                                  earned={earned}
                                  size="md"
                                  showGlow={earned}
                                />
                                <div>
                                  <p className={cn(
                                    "text-[11px] font-medium leading-tight",
                                    earned ? "text-foreground" : "text-muted-foreground/50",
                                  )}>
                                    {earned && badge
                                      ? (isEn ? badge.title : (badge.titleFr || badge.title))
                                      : (isEn ? meta.description : meta.descriptionFr)}
                                  </p>
                                  {earned && badge?.awardedAt && (
                                    <p className="text-[9px] text-muted-foreground mt-0.5">
                                      {new Date(badge.awardedAt).toLocaleDateString(isEn ? "en-CA" : "fr-CA", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </p>
                                  )}
                                  {!earned && (
                                    <p className="text-[9px] text-muted-foreground/40 mt-0.5 flex items-center justify-center gap-0.5">
                                      <Lock className="h-2 w-2" />
                                      {isEn ? "Locked" : "Verrouillé"}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* New badge indicator */}
                              {earned && badge?.isNew && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-[var(--brand-accent)] text-white text-[8px] font-bold rounded-full uppercase"
                                >
                                  New
                                </motion.div>
                              )}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="font-medium text-xs">
                              {isEn ? meta.description : meta.descriptionFr}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Export for use in other components
export { BadgeIcon, BADGE_CATALOG, ALL_BADGE_TYPES };
