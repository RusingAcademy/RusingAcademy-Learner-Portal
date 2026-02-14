import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Dumbbell,
  Trophy,
  Users,
  Star,
  Flame,
  Award,
  Zap,
  Activity,
} from "lucide-react";

interface ActivityFeedProps {
  language: string;
  className?: string;
}

const ACTIVITY_ICONS: Record<string, typeof BookOpen> = {
  lesson_completed: BookOpen,
  practice_session: Dumbbell,
  challenge_completed: Trophy,
  coaching_session: Users,
  badge_earned: Award,
  streak_milestone: Flame,
  level_up: Star,
  xp_earned: Zap,
};

function timeAgo(date: Date, lang: string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (lang === "fr") {
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin}m`;
    if (diffHrs < 24) return `il y a ${diffHrs}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-CA", { month: "short", day: "numeric" });
  }
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export function ActivityFeed({ language, className }: ActivityFeedProps) {
  const { data, isLoading } = trpc.learnerProgression.getActivityFeed.useQuery({ limit: 8 });

  const l = {
    title: language === "fr" ? "Activité récente" : "Recent Activity",
    empty: language === "fr" ? "Aucune activité récente" : "No recent activity",
    emptyDesc: language === "fr"
      ? "Commencez un cours ou une session de pratique"
      : "Start a course or practice session",
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Activity className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{l.empty}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{l.emptyDesc}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          {l.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.map((item, idx) => {
          const Icon = ACTIVITY_ICONS[item.type] || Zap;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800">
                <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.xpEarned > 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    +{item.xpEarned}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {timeAgo(new Date(item.timestamp), language)}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
