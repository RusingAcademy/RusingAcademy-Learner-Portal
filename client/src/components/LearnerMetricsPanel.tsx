/**
 * LearnerMetricsPanel — Coach Dashboard component
 * Shows real learner performance data: XP, streaks, SLE scores, at-risk detection
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users, TrendingUp, AlertTriangle, Zap, Flame, Target,
  ChevronDown, ChevronUp, BarChart3, Activity, Shield,
} from "lucide-react";

interface LearnerMetricsPanelProps {
  language: "fr" | "en";
  className?: string;
}

const labels = {
  fr: {
    title: "Performance des apprenants",
    subtitle: "Métriques en temps réel de votre cohorte",
    cohortOverview: "Vue d'ensemble de la cohorte",
    totalLearners: "Apprenants",
    activeLearners: "Actifs (7j)",
    atRisk: "À risque",
    avgXp: "XP moyen",
    avgStreak: "Streak moyen",
    sessionsCompleted: "Sessions complétées",
    engagementRate: "Taux d'engagement",
    learnerDetails: "Détails par apprenant",
    xp: "XP",
    streak: "Streak",
    level: "Niveau",
    sessions: "Sessions",
    rating: "Note",
    lastActivity: "Dernière activité",
    daysAgo: "il y a {n} jours",
    today: "Aujourd'hui",
    noLearners: "Aucun apprenant assigné",
    noLearnersDesc: "Les apprenants apparaîtront ici après leur première session avec vous.",
    atRiskLearners: "Apprenants à risque",
    atRiskDesc: "Ces apprenants nécessitent votre attention",
    highRisk: "Risque élevé",
    mediumRisk: "Risque moyen",
    lowRisk: "Risque faible",
    noAtRisk: "Aucun apprenant à risque",
    noAtRiskDesc: "Tous vos apprenants sont actifs. Excellent travail !",
    viewDetails: "Voir détails",
    hideDetails: "Masquer",
  },
  en: {
    title: "Learner Performance",
    subtitle: "Real-time metrics for your cohort",
    cohortOverview: "Cohort Overview",
    totalLearners: "Learners",
    activeLearners: "Active (7d)",
    atRisk: "At Risk",
    avgXp: "Avg XP",
    avgStreak: "Avg Streak",
    sessionsCompleted: "Sessions Completed",
    engagementRate: "Engagement Rate",
    learnerDetails: "Learner Details",
    xp: "XP",
    streak: "Streak",
    level: "Level",
    sessions: "Sessions",
    rating: "Rating",
    lastActivity: "Last Activity",
    daysAgo: "{n} days ago",
    today: "Today",
    noLearners: "No learners assigned",
    noLearnersDesc: "Learners will appear here after their first session with you.",
    atRiskLearners: "At-Risk Learners",
    atRiskDesc: "These learners need your attention",
    highRisk: "High Risk",
    mediumRisk: "Medium Risk",
    lowRisk: "Low Risk",
    noAtRisk: "No at-risk learners",
    noAtRiskDesc: "All your learners are active. Great work!",
    viewDetails: "View Details",
    hideDetails: "Hide",
  },
};

function formatDaysAgo(dateStr: string | null, l: typeof labels.en): string {
  if (!dateStr) return l.daysAgo.replace("{n}", "?");
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return l.today;
  return l.daysAgo.replace("{n}", String(days));
}

function getRiskBadge(level: string, l: typeof labels.en) {
  switch (level) {
    case "high":
      return <Badge variant="destructive" className="text-xs">{l.highRisk}</Badge>;
    case "medium":
      return <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">{l.mediumRisk}</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">{l.lowRisk}</Badge>;
  }
}

export function LearnerMetricsPanel({ language, className }: LearnerMetricsPanelProps) {
  const l = labels[language];
  const [showDetails, setShowDetails] = useState(false);

  const { data: cohort, isLoading: cohortLoading } = trpc.coachMetrics.getCohortSummary.useQuery();
  const { data: learners, isLoading: learnersLoading } = trpc.coachMetrics.getLearnersWithMetrics.useQuery();
  const { data: atRiskLearners } = trpc.coachMetrics.getAtRiskLearners.useQuery();

  return (
    <div className={className}>
      {/* Cohort Overview Stats */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {l.cohortOverview}
              </CardTitle>
              <CardDescription>{l.subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {cohortLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
                <Users className="h-4 w-4 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{cohort?.totalLearners || 0}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">{l.totalLearners}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                <Activity className="h-4 w-4 mx-auto text-green-600 dark:text-green-400 mb-1" />
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{cohort?.activeLearners || 0}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">{l.activeLearners}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 text-center">
                <AlertTriangle className="h-4 w-4 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{cohort?.atRiskLearners || 0}</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">{l.atRisk}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{cohort?.avgCompletionRate || 0}%</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">{l.engagementRate}</p>
              </div>
            </div>
          )}

          {/* Secondary stats row */}
          {cohort && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Zap className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-semibold">{cohort.avgXp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{l.avgXp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Flame className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold">{cohort.avgStreak}d</p>
                  <p className="text-xs text-muted-foreground">{l.avgStreak}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Target className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold">{cohort.totalSessionsCompleted}</p>
                  <p className="text-xs text-muted-foreground">{l.sessionsCompleted}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* At-Risk Learners Alert */}
      {atRiskLearners && atRiskLearners.length > 0 && (
        <Card className="mb-4 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              {l.atRiskLearners}
            </CardTitle>
            <CardDescription>{l.atRiskDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskLearners.slice(0, 5).map((learner) => (
                <div key={learner.learnerId} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {(learner.name || "??").split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{learner.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDaysAgo(null, l).replace("?", String(learner.daysSinceActivity))} • {learner.completedSessions} {l.sessions.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRiskBadge(learner.riskLevel, l)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learner Details (expandable) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {l.learnerDetails}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <><ChevronUp className="h-4 w-4 mr-1" />{l.hideDetails}</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-1" />{l.viewDetails}</>
              )}
            </Button>
          </div>
        </CardHeader>
        {showDetails && (
          <CardContent>
            {learnersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : !learners || learners.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{l.noLearners}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{l.noLearnersDesc}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {learners.map((learner) => (
                  <div key={learner.learnerId} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {(learner.name || "??").split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{learner.name}</p>
                        {learner.isAtRisk && (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        )}
                        <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">
                          <Shield className="h-3 w-3 mr-1" />
                          {l.level} {learner.currentLevel || "—"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          {learner.totalXp.toLocaleString()} {l.xp}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {learner.currentStreak}d {l.streak}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="h-3 w-3 text-blue-500" />
                          {learner.completedSessions}/{learner.totalSessions} {l.sessions}
                        </span>
                        {learner.avgSessionRating && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            ★ {learner.avgSessionRating}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <Progress
                          value={learner.totalSessions > 0 ? (learner.completedSessions / learner.totalSessions) * 100 : 0}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
