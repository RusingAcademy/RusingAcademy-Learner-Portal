import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  Clock,
  Award,
  Target,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamStats {
  totalLearners: number;
  activeLearners: number;
  avgProgress: number;
  avgProgressChange: number; // positive or negative percentage
  totalHoursLearned: number;
  avgStreak: number;
  certificationsEarned: number;
  targetCompletionRate: number;
}

interface TeamOverviewWidgetProps {
  stats: TeamStats;
  language?: "en" | "fr";
  className?: string;
}

export function TeamOverviewWidget({ 
  stats, 
  language = "en", 
  className 
}: TeamOverviewWidgetProps) {
  const labels = {
    en: {
      title: "Team Overview",
      subtitle: "Organization-wide learning metrics",
      totalLearners: "Total Learners",
      activeLearners: "Active This Week",
      avgProgress: "Avg. Progress",
      hoursLearned: "Hours Learned",
      avgStreak: "Avg. Streak",
      certifications: "Certifications",
      targetRate: "Target Completion",
      vsLastMonth: "vs last month",
      days: "days",
    },
    fr: {
      title: "Vue d'Ensemble Équipe",
      subtitle: "Métriques d'apprentissage organisationnelles",
      totalLearners: "Total Apprenants",
      activeLearners: "Actifs Cette Semaine",
      avgProgress: "Progression Moy.",
      hoursLearned: "Heures Apprises",
      avgStreak: "Série Moy.",
      certifications: "Certifications",
      targetRate: "Taux d'Objectif",
      vsLastMonth: "vs mois dernier",
      days: "jours",
    },
  };

  const l = labels[language];

  const StatBox = ({ 
    icon: Icon, 
    label, 
    value, 
    suffix,
    trend,
    color = "blue"
  }: { 
    icon: React.ElementType;
    label: string;
    value: number | string;
    suffix?: string;
    trend?: number;
    color?: "blue" | "emerald" | "amber" | "violet" | "rose";
  }) => {
    const colorClasses = {
      blue: "from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20",
      emerald: "from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20",
      amber: "from-amber-500/10 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-600/20",
      violet: "from-violet-500/10 to-violet-600/10 dark:from-violet-500/20 dark:to-violet-600/20",
      rose: "from-rose-500/10 to-rose-600/10 dark:from-rose-500/20 dark:to-rose-600/20",
    };
    
    const iconColors = {
      blue: "text-blue-600 dark:text-blue-400",
      emerald: "text-emerald-600 dark:text-emerald-400",
      amber: "text-amber-600 dark:text-amber-400",
      violet: "text-violet-600 dark:text-violet-400",
      rose: "text-rose-600 dark:text-rose-400",
    };

    return (
      <div className={cn(
        "p-4 rounded-xl bg-gradient-to-br",
        colorClasses[color]
      )}>
        <div className="flex items-start justify-between mb-2">
          <Icon className={cn("h-5 w-5", iconColors[color])} />
          {trend !== undefined && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                trend >= 0 
                  ? "text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700"
                  : "text-red-600 border-red-300 dark:text-red-400 dark:border-red-700"
              )}
            >
              {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}{suffix}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      </div>
    );
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-slate-500/10 to-slate-600/10 dark:from-slate-500/20 dark:to-slate-600/20 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-500/20 dark:bg-slate-500/30">
            <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white">{l.title}</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">{l.subtitle}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            icon={Users}
            label={l.totalLearners}
            value={stats.totalLearners}
            color="blue"
          />
          <StatBox
            icon={TrendingUp}
            label={l.activeLearners}
            value={stats.activeLearners}
            color="emerald"
          />
          <StatBox
            icon={Target}
            label={l.avgProgress}
            value={stats.avgProgress}
            suffix="%"
            trend={stats.avgProgressChange}
            color="violet"
          />
          <StatBox
            icon={Clock}
            label={l.hoursLearned}
            value={stats.totalHoursLearned}
            color="amber"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <StatBox
            icon={Flame}
            label={l.avgStreak}
            value={`${stats.avgStreak} ${l.days}`}
            color="rose"
          />
          <StatBox
            icon={Award}
            label={l.certifications}
            value={stats.certificationsEarned}
            color="amber"
          />
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.targetCompletionRate}%
            </p>
            <Progress 
              value={stats.targetCompletionRate} 
              className="h-2 [&>div]:bg-emerald-500"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{l.targetRate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TeamOverviewWidget;
