import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  BookOpen,
  Dumbbell,
  Trophy,
  Users,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Compass,
} from "lucide-react";

interface RecommendedNextStepsProps {
  language: string;
  className?: string;
}

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  course: BookOpen,
  practice: Dumbbell,
  challenge: Trophy,
  coaching: Users,
  review: RotateCcw,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function RecommendedNextSteps({ language, className }: RecommendedNextStepsProps) {
  const { data, isLoading } = trpc.learnerProgression.getRecommendations.useQuery();

  const l = {
    title: language === "fr" ? "Prochaines étapes recommandées" : "Recommended Next Steps",
    focusArea: language === "fr" ? "Domaine de focus" : "Focus Area",
    xp: "XP",
    go: language === "fr" ? "Commencer" : "Start",
    empty: language === "fr" ? "Aucune recommandation pour le moment" : "No recommendations right now",
    emptyDesc: language === "fr"
      ? "Inscrivez-vous à un cours pour commencer votre parcours"
      : "Enroll in a course to start your journey",
    high: language === "fr" ? "Urgent" : "Urgent",
    medium: language === "fr" ? "Recommandé" : "Recommended",
    low: language === "fr" ? "Optionnel" : "Optional",
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.nextSteps.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Compass className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{l.empty}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{l.emptyDesc}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            {l.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {l.focusArea}: {language === "fr" ? data.focusAreaFr : data.focusArea}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.nextSteps.map((step, idx) => {
          const Icon = TYPE_ICONS[step.type] || BookOpen;
          const priorityLabel = step.priority === "high" ? l.high : step.priority === "medium" ? l.medium : l.low;

          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="mt-0.5 p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
                <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {language === "fr" ? step.titleFr : step.title}
                  </p>
                  <Badge className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[step.priority]}`}>
                    {priorityLabel}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {language === "fr" ? step.descriptionFr : step.description}
                </p>
                {step.xpReward > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                    +{step.xpReward} {l.xp}
                  </span>
                )}
              </div>
              {step.link && (
                <Link href={step.link}>
                  <Button size="sm" variant="ghost" className="shrink-0 mt-1">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
