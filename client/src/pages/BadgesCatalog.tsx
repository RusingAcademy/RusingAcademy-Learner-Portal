/**
 * Badge Showcase — Premium Gamification Badge Display
 * Phase 4: Earned/locked states, progress bars, category tabs, tier indicators
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BadgeGridSkeleton, DashboardStatsSkeleton } from "@/components/DashboardSkeletons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy, Star, Target, Flame, BookOpen, Award, Lock, CheckCircle2,
  Sparkles, Zap, Crown, Medal, Footprints, Layers, Brain, Shield,
  PlayCircle, BookCheck, Gem, Users, MessageCircle, Sunrise, Moon,
  Swords, FlaskConical, ChevronRight, TrendingUp,
} from "lucide-react";
import { BadgeIcon } from "@/components/BadgeIcon";

// ─── Icon mapping from badge definitions ─────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  footprints: Footprints,
  layers: Layers,
  trophy: Trophy,
  crown: Crown,
  "book-check": BookCheck,
  "play-circle": PlayCircle,
  brain: Brain,
  star: Star,
  flame: Flame,
  zap: Zap,
  shield: Shield,
  medal: Medal,
  sparkles: Sparkles,
  gem: Gem,
  award: Award,
  users: Users,
  "message-star": MessageCircle,
  sunrise: Sunrise,
  moon: Moon,
  swords: Swords,
  flask: FlaskConical,
  target: Target,
};

// ─── Tier ring styles ────────────────────────────────────────────────────────
const TIER_RING: Record<string, { ring: string; glow: string; label: string }> = {
  bronze: { ring: "#CD7F32", glow: "0 0 16px rgba(205,127,50,0.3)", label: "Bronze" },
  silver: { ring: "#C0C0C0", glow: "0 0 16px rgba(192,192,192,0.3)", label: "Silver" },
  gold: { ring: "#FFD700", glow: "0 0 20px rgba(255,215,0,0.35)", label: "Gold" },
  platinum: { ring: "#E5E4E2", glow: "0 0 24px rgba(229,228,226,0.4)", label: "Platinum" },
};

// ─── Category icon mapping ───────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  content: BookOpen,
  streak: Flame,
  mastery: Brain,
  sle: Award,
  special: Sparkles,
};

// ─── Badge Card Component ────────────────────────────────────────────────────
function BadgeCard({
  badge,
  isEn,
  index,
}: {
  badge: {
    id: string;
    name: string;
    nameFr: string;
    description: string;
    descriptionFr: string;
    category: string;
    tier: string;
    xpReward: number;
    iconKey: string;
    gradientFrom: string;
    gradientTo: string;
    earned: boolean;
    earnedAt: string | null;
    currentValue: number;
    targetValue: number;
    progressPercent: number;
  };
  isEn: boolean;
  index: number;
}) {
  const IconComponent = ICON_MAP[badge.iconKey] || Award;
  const tierStyle = TIER_RING[badge.tier] || TIER_RING.bronze;
  const isEarned = badge.earned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                "group relative overflow-hidden transition-all duration-300 cursor-default border",
                isEarned
                  ? "border-transparent hover:scale-[1.03] hover:-translate-y-1"
                  : "border-border/40 opacity-70 hover:opacity-90 grayscale hover:grayscale-[50%]"
              )}
              style={isEarned ? {
                boxShadow: `0 4px 24px ${badge.gradientFrom}22, 0 0 0 1px ${badge.gradientFrom}33`,
              } : undefined}
            >
              {/* Gradient top accent bar */}
              <div
                className="h-1 w-full"
                style={{
                  background: isEarned
                    ? `linear-gradient(90deg, ${badge.gradientFrom}, ${badge.gradientTo})`
                    : "linear-gradient(90deg, #6b7280, #9ca3af)",
                }}
              />

              <CardContent className="pt-5 pb-4 px-4">
                <div className="flex items-start gap-3">
                  {/* Badge icon with premium SVG tier ring */}
                  <div className="flex-shrink-0">
                    <BadgeIcon
                      iconKey={badge.iconKey}
                      tier={badge.tier as "bronze" | "silver" | "gold" | "platinum"}
                      gradientFrom={badge.gradientFrom}
                      gradientTo={badge.gradientTo}
                      earned={isEarned}
                      size="md"
                    />
                  </div>

                  {/* Badge info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={cn(
                        "text-sm font-semibold truncate",
                        isEarned ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {isEn ? badge.name : badge.nameFr}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0"
                        style={isEarned ? {
                          borderColor: tierStyle.ring,
                          color: tierStyle.ring,
                        } : undefined}
                      >
                        {tierStyle.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {isEn ? badge.description : badge.descriptionFr}
                    </p>

                    {/* Progress bar for locked badges */}
                    {!isEarned && badge.targetValue > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{badge.currentValue} / {badge.targetValue}</span>
                          <span>{badge.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${badge.progressPercent}%`,
                              background: `linear-gradient(90deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Earned date */}
                    {isEarned && badge.earnedAt && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {isEn ? "Earned" : "Obtenu"} {new Date(badge.earnedAt).toLocaleDateString(isEn ? "en-CA" : "fr-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    )}

                    {/* XP reward */}
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className={cn("w-3 h-3", isEarned ? "text-yellow-500" : "text-muted-foreground/50")} />
                      <span className={cn("text-[10px] font-medium", isEarned ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground/50")}>
                        +{badge.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-semibold">{isEn ? badge.name : badge.nameFr}</p>
            <p className="text-xs text-muted-foreground mt-1">{isEn ? badge.description : badge.descriptionFr}</p>
            {!isEarned && badge.targetValue > 0 && (
              <p className="text-xs mt-1">{badge.currentValue}/{badge.targetValue} ({badge.progressPercent}%)</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

// ─── Next To Earn Card ───────────────────────────────────────────────────────
function NextToEarnCard({
  badge,
  isEn,
}: {
  badge: {
    id: string;
    name: string;
    nameFr: string;
    tier: string;
    iconKey: string;
    gradientFrom: string;
    gradientTo: string;
    currentValue: number;
    targetValue: number;
    progressPercent: number;
  };
  isEn: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:border-border/60 transition-all">
      <div className="flex-shrink-0">
        <BadgeIcon
          iconKey={badge.iconKey}
          tier={badge.tier as "bronze" | "silver" | "gold" | "platinum"}
          gradientFrom={badge.gradientFrom}
          gradientTo={badge.gradientTo}
          earned={false}
          size="sm"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{isEn ? badge.name : badge.nameFr}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${badge.progressPercent}%`,
                background: `linear-gradient(90deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">
            {badge.progressPercent}%
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

// ─── Main Badge Showcase Component ───────────────────────────────────────────
export default function BadgesCatalog() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch badge progress from the new badgeShowcase API
  const { data, isLoading } = trpc.badgeShowcase.getMyBadgeProgress.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  // Flatten all badges for the "all" tab
  const allBadges = useMemo(() => {
    if (!data?.categories) return [];
    return data.categories.flatMap((c) => c.badges);
  }, [data]);

  // Loading state
  if (isLoading || !data) {
    return (
      <div className="container py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEn ? "Badge Showcase" : "Vitrine des Badges"}
          </h1>
          <p className="text-muted-foreground">
            {isEn ? "Loading your badges..." : "Chargement de vos badges..."}
          </p>
        </div>
        <DashboardStatsSkeleton />
        <div className="mt-8">
          <BadgeGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  const { summary, recentBadges, nextToEarn, categories } = data;

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          {isEn ? "Badge Showcase" : "Vitrine des Badges"}
        </h1>
        <p className="text-muted-foreground">
          {isEn
            ? "Earn badges by completing activities, maintaining streaks, and reaching milestones."
            : "Gagnez des badges en complétant des activités, maintenant des séries et atteignant des jalons."}
        </p>
      </motion.div>

      {/* ─── Summary Stats ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {/* Total Progress */}
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#0F3D3E] to-[#145A5B]" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0F3D3E]/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#0F3D3E]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Badges Earned" : "Badges Gagnés"}
                </p>
                <p className="text-2xl font-bold">
                  {summary.totalEarned} <span className="text-sm font-normal text-muted-foreground">/ {summary.totalBadges}</span>
                </p>
              </div>
            </div>
            <Progress value={summary.progressPercent} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Next to Earn */}
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#D97B3D] to-[#C65A1E]" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D97B3D]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#D97B3D]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Next to Earn" : "Prochain à Gagner"}
                </p>
                {nextToEarn.length > 0 ? (
                  <p className="text-sm font-semibold truncate max-w-[160px]">
                    {isEn ? nextToEarn[0].name : nextToEarn[0].nameFr}
                    <span className="text-muted-foreground font-normal ml-1">
                      ({nextToEarn[0].progressPercent}%)
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{isEn ? "Complete activities!" : "Complétez des activités!"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Badge */}
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500]" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Latest Badge" : "Dernier Badge"}
                </p>
                {recentBadges.length > 0 ? (
                  <p className="text-sm font-semibold truncate max-w-[160px]">
                    {isEn ? recentBadges[0].name : recentBadges[0].nameFr}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{isEn ? "None yet" : "Aucun encore"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Next to Earn Section ───────────────────────────────────────── */}
      {nextToEarn.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#D97B3D]" />
            {isEn ? "Almost There" : "Presque Là"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nextToEarn.map((badge) => (
              <NextToEarnCard key={badge.id} badge={badge} isEn={isEn} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Category Tabs + Badge Grid ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-1.5 bg-muted/50 p-1.5">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              {isEn ? "All" : "Tous"} ({summary.totalBadges})
            </TabsTrigger>
            {categories.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat.category] || Award;
              return (
                <TabsTrigger key={cat.category} value={cat.category} className="text-xs sm:text-sm gap-1.5">
                  <CatIcon className="w-3.5 h-3.5 hidden sm:inline" />
                  {isEn ? cat.label : cat.labelFr}
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-0.5">
                    {cat.earned}/{cat.total}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* All badges tab */}
          <TabsContent value="all">
            <AnimatePresence mode="wait">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Show earned first, then by progress */}
                {[...allBadges]
                  .sort((a, b) => {
                    if (a.earned && !b.earned) return -1;
                    if (!a.earned && b.earned) return 1;
                    return b.progressPercent - a.progressPercent;
                  })
                  .map((badge, i) => (
                    <BadgeCard key={badge.id} badge={badge} isEn={isEn} index={i} />
                  ))}
              </div>
            </AnimatePresence>
          </TabsContent>

          {/* Category tabs */}
          {categories.map((cat) => (
            <TabsContent key={cat.category} value={cat.category}>
              {/* Category header */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-card/50 border border-border/40">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${cat.color}15` }}
                  >
                    {(() => {
                      const CatIcon = CATEGORY_ICONS[cat.category] || Award;
                      return <CatIcon className="w-5 h-5" style={{ color: cat.color }} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{isEn ? cat.label : cat.labelFr}</h3>
                    <p className="text-xs text-muted-foreground">
                      {cat.earned} / {cat.total} {isEn ? "earned" : "gagnés"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cat.progressPercent}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium" style={{ color: cat.color }}>
                    {cat.progressPercent}%
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...cat.badges]
                    .sort((a, b) => {
                      if (a.earned && !b.earned) return -1;
                      if (!a.earned && b.earned) return 1;
                      return b.progressPercent - a.progressPercent;
                    })
                    .map((badge, i) => (
                      <BadgeCard key={badge.id} badge={badge} isEn={isEn} index={i} />
                    ))}
                </div>
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* ─── Tier Legend ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
      >
        <span className="font-medium">{isEn ? "Tier Legend:" : "Légende des niveaux :"}</span>
        {Object.entries(TIER_RING).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: val.ring, boxShadow: `0 0 6px ${val.ring}40` }}
            />
            {val.label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
