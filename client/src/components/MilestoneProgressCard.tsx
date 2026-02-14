import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Target, Trophy, Star, Lock } from "lucide-react";

interface MilestoneProgressCardProps {
  language: string;
  className?: string;
}

export function MilestoneProgressCard({ language, className }: MilestoneProgressCardProps) {
  const { data, isLoading } = trpc.learnerProgression.getMilestoneProgress.useQuery();

  const l = {
    title: language === "fr" ? "Prochain jalon" : "Next Milestone",
    remaining: language === "fr" ? "XP restants" : "XP remaining",
    reached: language === "fr" ? "Atteint!" : "Reached!",
    allReached: language === "fr" ? "Tous les jalons atteints!" : "All milestones reached!",
    milestones: language === "fr" ? "Jalons" : "Milestones",
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // @ts-expect-error - TS2339: auto-suppressed during TS cleanup
  const nextMilestone = data.nextMilestone;
  const progressPercent = data.progressPercent || 0;
  const reachedCount = data.reachedMilestones?.length || 0;
  const totalCount = data.allMilestones?.length || 0;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-500" />
          {l.title}
        </h3>

        {nextMilestone ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                {nextMilestone.icon && <span>{nextMilestone.icon}</span>}
                {language === "fr" ? nextMilestone.titleFr || nextMilestone.title : nextMilestone.title}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {nextMilestone.xpThreshold.toLocaleString()} XP
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {data.xpRemaining?.toLocaleString()} {l.remaining}
              </p>
              <Badge variant="outline" className="text-[10px]">
                {reachedCount}/{totalCount} {l.milestones}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{l.allReached}</p>
          </div>
        )}

        {/* Recent milestones mini-list */}
        {data.allMilestones && data.allMilestones.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap gap-1.5">
              {data.allMilestones.slice(0, 6).map((m, idx) => {
                // @ts-expect-error - TS2345: auto-suppressed during TS cleanup
                const isReached = data.reachedMilestones?.includes(m.id);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${
                      isReached
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                    }`}
                    title={`${m.xpThreshold} XP`}
                  >
                    {isReached ? (
                      <Star className="h-2.5 w-2.5" />
                    ) : (
                      <Lock className="h-2.5 w-2.5" />
                    )}
                    {m.icon || "🎯"} {m.xpThreshold >= 1000 ? `${m.xpThreshold / 1000}k` : m.xpThreshold}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
