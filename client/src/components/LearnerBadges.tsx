import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LearnerBadgesProps {
  language?: "en" | "fr";
  compact?: boolean;
}

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

const BADGE_COLORS: Record<string, string> = {
  milestone: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  achievement: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  skill: "bg-green-500/10 text-green-500 border-green-500/20",
  special: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

const l = {
  en: {
    title: "My Badges",
    viewAll: "View All",
    points: "points",
    earnedOn: "Earned on",
    progress: "Progress",
    noBadges: "Complete sessions to earn badges!",
    totalPoints: "Total Points",
    level: "Level",
    nextLevel: "Next Level",
    recentBadges: "Recent Badges",
  },
  fr: {
    title: "Mes Badges",
    viewAll: "Voir Tout",
    points: "points",
    earnedOn: "Obtenu le",
    progress: "Progression",
    noBadges: "Complétez des sessions pour gagner des badges!",
    totalPoints: "Points Totaux",
    level: "Niveau",
    nextLevel: "Niveau Suivant",
    recentBadges: "Badges Récents",
  },
};

export function LearnerBadges({ language = "en", compact = false }: LearnerBadgesProps) {
  const t = l[language];
  
  const { data: badgesData, isLoading } = trpc.learner.getMyBadges.useQuery();
  const { data: xpData } = trpc.learner.getMyXp.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const badges = badgesData?.badges || [];
  const totalPoints = xpData?.totalXp || 0;
  const currentLevel = xpData?.level || 1;
  const xpForNextLevel = xpData?.xpForNextLevel || 100;
  const currentLevelXp = xpData?.currentLevelXp || 0;
  const progressPercent = Math.min((currentLevelXp / xpForNextLevel) * 100, 100);

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t.title}</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />
              {badges.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noBadges}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 5).map((badge) => {
                const Icon = BADGE_ICONS[badge.badgeType || "default"] || BADGE_ICONS.default;
                const colorClass = BADGE_COLORS["milestone"];
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2",
                      colorClass
                    )}
                    title={language === "fr" && badge.titleFr ? badge.titleFr : badge.title}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                );
              })}
              {badges.length > 5 && (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium">
                  +{badges.length - 5}
                </div>
              )}
            </div>
          )}
          
          {/* XP Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t.level} {currentLevel}</span>
              <span className="text-muted-foreground">{totalPoints} XP</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {currentLevelXp}/{xpForNextLevel} XP {t.nextLevel}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              {totalPoints} XP
            </Badge>
            <Badge variant="secondary">
              {t.level} {currentLevel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t.level} {currentLevel}</span>
            <span className="text-muted-foreground">
              {currentLevelXp}/{xpForNextLevel} XP
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Badges Grid */}
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">{t.noBadges}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.badgeType || "default"] || BADGE_ICONS.default;
              const colorClass = BADGE_COLORS["milestone"];
              const displayName = language === "fr" && badge.titleFr ? badge.titleFr : badge.title;
              const displayDesc = language === "fr" && badge.descriptionFr ? badge.descriptionFr : badge.description;
              
              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center text-center group cursor-pointer"
                  title={displayDesc || ""}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110",
                      colorClass
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium mt-2 line-clamp-2">{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {badge.badgeType}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LearnerBadges;
