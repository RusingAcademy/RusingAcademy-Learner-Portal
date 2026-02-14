import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Flame, TrendingUp, Zap } from "lucide-react";

interface XpMultiplierCardProps {
  language: string;
  className?: string;
}

export function XpMultiplierCard({ language, className }: XpMultiplierCardProps) {
  const { data, isLoading } = trpc.learnerProgression.getMultiplier.useQuery();

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-4">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalMultiplier <= 1) return null;

  const l = {
    title: language === "fr" ? "Multiplicateur XP Actif" : "Active XP Multiplier",
    streak: language === "fr" ? "Série" : "Streak",
    level: language === "fr" ? "Niveau" : "Level",
    bonus: language === "fr" ? "Bonus total" : "Total bonus",
  };

  return (
    <Card className={`bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-800/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{l.title}</span>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-lg font-bold px-3">
            {data.totalMultiplier}x
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {l.streak} ({data.currentStreak}j)
            </span>
            <span className="font-medium text-orange-600 dark:text-orange-400">{data.streakMultiplier}x</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              {l.level} {data.currentLevel}
            </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{data.levelMultiplier}x</span>
          </div>
        </div>
        <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-2 text-center font-medium">
          {data.streakLabel}
        </p>
      </CardContent>
    </Card>
  );
}
