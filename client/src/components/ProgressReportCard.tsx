import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Calendar,
  Bot,
  Users,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Target,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function ProgressReportCard() {
  const { language } = useLanguage();
  const [isSending, setIsSending] = useState(false);

  const { data: progressData, isLoading } = trpc.learner.getProgressReport.useQuery();
  const sendReportMutation = trpc.learner.sendProgressReport.useMutation({
    onSuccess: () => {
      toast.success(
        language === "fr"
          ? "Rapport envoyé à votre adresse email !"
          : "Report sent to your email!"
      );
      setIsSending(false);
    },
    onError: (error) => {
      toast.error(error.message || (language === "fr" ? "Erreur d'envoi" : "Failed to send"));
      setIsSending(false);
    },
  });

  const labels = language === "fr" ? {
    title: "Rapport de progression",
    description: "Votre activité des 7 derniers jours",
    coachSessions: "Sessions coach",
    aiSessions: "Sessions AI",
    practiceTime: "Temps de pratique",
    minutes: "min",
    scheduled: "Planifiées",
    sendReport: "Envoyer par email",
    sending: "Envoi...",
    currentLevel: "Niveau actuel",
    targetLevel: "Niveau cible",
    oral: "Oral",
    written: "Écrit",
    reading: "Lecture",
    noData: "Aucune donnée disponible",
    weeklyGoal: "Objectif hebdomadaire",
    progress: "Progression",
  } : {
    title: "Progress Report",
    description: "Your activity from the last 7 days",
    coachSessions: "Coach Sessions",
    aiSessions: "AI Sessions",
    practiceTime: "Practice Time",
    minutes: "min",
    scheduled: "Scheduled",
    sendReport: "Send via Email",
    sending: "Sending...",
    currentLevel: "Current Level",
    targetLevel: "Target Level",
    oral: "Oral",
    written: "Written",
    reading: "Reading",
    noData: "No data available",
    weeklyGoal: "Weekly Goal",
    progress: "Progress",
  };

  const handleSendReport = async () => {
    setIsSending(true);
    await sendReportMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!progressData) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {labels.noData}
        </CardContent>
      </Card>
    );
  }

  // Calculate weekly goal progress (target: 60 minutes per week)
  const weeklyGoalMinutes = 60;
  const goalProgress = Math.min(100, Math.round((progressData.totalPracticeMinutes / weeklyGoalMinutes) * 100));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {labels.title}
            </CardTitle>
            <CardDescription>{labels.description}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReport}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {labels.sending}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {labels.sendReport}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Users className="h-5 w-5" />
              {progressData.coachSessionsCompleted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{labels.coachSessions}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Bot className="h-5 w-5" />
              {progressData.aiSessionsCompleted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{labels.aiSessions}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Clock className="h-5 w-5" />
              {progressData.totalPracticeMinutes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{labels.practiceTime}</p>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              {labels.weeklyGoal}
            </span>
            <span className="text-muted-foreground">
              {progressData.totalPracticeMinutes}/{weeklyGoalMinutes} {labels.minutes}
            </span>
          </div>
          <Progress value={goalProgress} className="h-2" />
          {goalProgress >= 100 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {language === "fr" ? "Objectif atteint !" : "Goal achieved!"}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        {progressData.coachSessionsScheduled > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {progressData.coachSessionsScheduled} {labels.scheduled}
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              {language === "fr" ? "À venir" : "Upcoming"}
            </Badge>
          </div>
        )}

        {/* AI Session Breakdown */}
        {progressData.aiSessionBreakdown && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3">
              {language === "fr" ? "Détail des sessions AI" : "AI Session Breakdown"}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-muted/30 rounded">
                <p className="font-semibold">{progressData.aiSessionBreakdown.practice}</p>
                <p className="text-muted-foreground">
                  {language === "fr" ? "Pratique" : "Practice"}
                </p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <p className="font-semibold">{progressData.aiSessionBreakdown.placement}</p>
                <p className="text-muted-foreground">
                  {language === "fr" ? "Placement" : "Placement"}
                </p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <p className="font-semibold">{progressData.aiSessionBreakdown.simulation}</p>
                <p className="text-muted-foreground">
                  {language === "fr" ? "Simulation" : "Simulation"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLE Levels */}
        {(progressData.currentLevels.oral || progressData.currentLevels.written || progressData.currentLevels.reading) && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3">{labels.currentLevel} → {labels.targetLevel}</p>
            <div className="space-y-2">
              {progressData.currentLevels.oral && (
                <div className="flex items-center justify-between text-sm">
                  <span>{labels.oral}</span>
                  <span className="font-medium">
                    {progressData.currentLevels.oral} → {progressData.targetLevels.oral || "?"}
                  </span>
                </div>
              )}
              {progressData.currentLevels.written && (
                <div className="flex items-center justify-between text-sm">
                  <span>{labels.written}</span>
                  <span className="font-medium">
                    {progressData.currentLevels.written} → {progressData.targetLevels.written || "?"}
                  </span>
                </div>
              )}
              {progressData.currentLevels.reading && (
                <div className="flex items-center justify-between text-sm">
                  <span>{labels.reading}</span>
                  <span className="font-medium">
                    {progressData.currentLevels.reading} → {progressData.targetLevels.reading || "?"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
