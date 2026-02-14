import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Snowflake, Trophy, Calendar, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionWeek: string | null;
  streakFreezeUsed: boolean;
  streakFreezeAvailable: boolean;
  nextMilestone: number;
  pointsToNextMilestone: number;
}

const STREAK_MILESTONES = [
  { weeks: 3, points: 50, label: { en: "3 Week Streak", fr: "3 semaines consécutives" } },
  { weeks: 7, points: 150, label: { en: "7 Week Streak", fr: "7 semaines consécutives" } },
  { weeks: 14, points: 400, label: { en: "14 Week Streak", fr: "14 semaines consécutives" } },
  { weeks: 30, points: 1000, label: { en: "30 Week Streak", fr: "30 semaines consécutives" } },
  { weeks: 52, points: 2500, label: { en: "52 Week Streak", fr: "52 semaines consécutives" } },
];

export default function StreakCard() {
  const { language } = useLanguage();
  const isEn = language === "en";
  
  const { data: streakData, isLoading } = trpc.learner.getStreak.useQuery();
  const useFreezeMutation = trpc.learner.useStreakFreeze.useMutation();
  const utils = trpc.useUtils();

  const handleUseFreeze = async () => {
    try {
      await useFreezeMutation.mutateAsync();
      utils.learner.getStreak.invalidate();
    } catch (error) {
      console.error("Failed to use streak freeze:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-16 bg-slate-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const streak = streakData || {
    currentStreak: 0,
    longestStreak: 0,
    lastSessionWeek: null,
    streakFreezeUsed: false,
    streakFreezeAvailable: true,
    nextMilestone: 3,
    pointsToNextMilestone: 50,
  };

  // Find next milestone
  const nextMilestone = STREAK_MILESTONES.find(m => m.weeks > streak.currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const progressToMilestone = nextMilestone ? (streak.currentStreak / nextMilestone.weeks) * 100 : 100;

  // Determine streak status
  const isAtRisk = !streak.lastSessionWeek || isStreakAtRisk(streak.lastSessionWeek);
  const canUseFreeze = isAtRisk && !streak.streakFreezeUsed && streak.currentStreak > 0;

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className={`h-5 w-5 ${streak.currentStreak > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
          {isEn ? "Learning Streak" : "Série d'apprentissage"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center py-4">
          <div className="relative inline-flex items-center justify-center">
            {/* Animated fire background for active streaks */}
            {streak.currentStreak > 0 && (
              <div className="absolute inset-0 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-[#C65A1E]/20 to-red-500/20 rounded-full blur-xl" />
              </div>
            )}
            <div className={`relative text-6xl font-black ${
              streak.currentStreak > 0 
                ? 'bg-gradient-to-br from-[#C65A1E] to-red-500 bg-clip-text text-transparent' 
                : 'text-slate-300'
            }`}>
              {streak.currentStreak}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isEn 
              ? `week${streak.currentStreak !== 1 ? 's' : ''} in a row` 
              : `semaine${streak.currentStreak !== 1 ? 's' : ''} consécutive${streak.currentStreak !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Streak Status Badge */}
        {isAtRisk && streak.currentStreak > 0 && (
          <div className="flex items-center justify-center">
            <Badge variant="destructive" className="animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              {isEn ? "Streak at risk!" : "Série en danger!"}
            </Badge>
          </div>
        )}

        {/* Progress to Next Milestone */}
        {nextMilestone && streak.currentStreak < nextMilestone.weeks && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isEn ? "Next milestone" : "Prochain jalon"}</span>
              <span>{nextMilestone.label[language]} (+{nextMilestone.points} pts)</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D97B3D] to-red-500 transition-all duration-500"
                style={{ width: `${Math.min(progressToMilestone, 100)}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {nextMilestone.weeks - streak.currentStreak} {isEn ? "weeks to go" : "semaines restantes"}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <Trophy className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-lg font-bold">{streak.longestStreak}</p>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Best streak" : "Meilleure série"}
            </p>
          </div>
          <div className="text-center">
            <Calendar className="h-4 w-4 mx-auto text-teal-500 mb-1" />
            <p className="text-lg font-bold">
              {streak.lastSessionWeek ? formatWeek(streak.lastSessionWeek, language) : "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Last session" : "Dernière session"}
            </p>
          </div>
        </div>

        {/* Streak Freeze Option */}
        {canUseFreeze && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">
                    {isEn ? "Streak Freeze" : "Gel de série"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "Use once to protect your streak" : "Utilisez une fois pour protéger votre série"}
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleUseFreeze}
                disabled={useFreezeMutation.isPending}
              >
                {isEn ? "Use" : "Utiliser"}
              </Button>
            </div>
          </div>
        )}

        {/* Milestone Badges */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            {isEn ? "Milestones" : "Jalons"}
          </p>
          <div className="flex flex-wrap gap-2">
            {STREAK_MILESTONES.map((milestone) => (
              <Badge 
                key={milestone.weeks}
                variant={streak.longestStreak >= milestone.weeks ? "default" : "outline"}
                className={`text-xs ${
                  streak.longestStreak >= milestone.weeks 
                    ? 'bg-gradient-to-r from-[#D97B3D] to-red-500 text-white border-0' 
                    : 'opacity-50'
                }`}
              >
                <Flame className="h-3 w-3 mr-1" />
                {milestone.weeks}w
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to check if streak is at risk (no session in current week)
function isStreakAtRisk(lastSessionWeek: string): boolean {
  const now = new Date();
  const currentWeek = getISOWeek(now);
  return lastSessionWeek !== currentWeek;
}

// Helper function to get ISO week string
function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

// Helper function to format week for display
function formatWeek(weekStr: string, language: string): string {
  const [year, week] = weekStr.split('-W');
  return language === 'en' ? `Week ${parseInt(week)}` : `Sem. ${parseInt(week)}`;
}
