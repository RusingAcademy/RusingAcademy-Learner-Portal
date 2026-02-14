import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Gift, CheckCircle2, Flame, BookOpen, Timer, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WeeklyChallengesProps {
  language?: "en" | "fr";
  className?: string;
}

const challengeIcons: Record<string, React.ReactNode> = {
  complete_lessons: <BookOpen className="h-5 w-5" />,
  practice_minutes: <Timer className="h-5 w-5" />,
  streak_days: <Flame className="h-5 w-5" />,
  quiz_score: <Trophy className="h-5 w-5" />,
  sessions_attended: <Clock className="h-5 w-5" />,
  ai_practice: <Sparkles className="h-5 w-5" />,
};

export function WeeklyChallenges({ language = "en", className }: WeeklyChallengesProps) {
  const [claimingId, setClaimingId] = useState<number | null>(null);
  
  const { data: challenges, isLoading, refetch } = trpc.gamification.getCurrentChallenges.useQuery();
  const claimReward = trpc.gamification.claimChallengeReward.useMutation({
    onSuccess: (data) => {
      toast.success(
        language === "fr" 
          ? `Récompense réclamée! +${data.xpAwarded} XP` 
          : `Reward claimed! +${data.xpAwarded} XP`
      );
      refetch();
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur lors de la réclamation" : "Error claiming reward");
    },
    onSettled: () => setClaimingId(null),
  });

  const labels = {
    en: {
      title: "Weekly Challenges",
      subtitle: "Complete challenges to earn bonus XP",
      progress: "Progress",
      completed: "Completed",
      claim: "Claim Reward",
      claimed: "Claimed",
      endsIn: "Ends in",
      days: "days",
      noChallenge: "No active challenges this week",
    },
    fr: {
      title: "Défis Hebdomadaires",
      subtitle: "Complétez des défis pour gagner des XP bonus",
      progress: "Progression",
      completed: "Complété",
      claim: "Réclamer",
      claimed: "Réclamé",
      endsIn: "Se termine dans",
      days: "jours",
      noChallenge: "Aucun défi actif cette semaine",
    },
  };

  const l = labels[language];

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getDaysRemaining = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border-b border-amber-200/50 dark:border-amber-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 dark:bg-amber-500/30">
              <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-white">{l.title}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">{l.subtitle}</p>
            </div>
          </div>
          {challenges && challenges.length > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">
              <Clock className="h-3 w-3 mr-1" />
              {getDaysRemaining(challenges[0].weekEnd)} {l.days}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {!challenges || challenges.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{l.noChallenge}</p>
          </div>
        ) : (
          challenges.map((challenge) => {
            const progressPercent = Math.min(100, (challenge.currentProgress / challenge.targetValue) * 100);
            const isComplete = challenge.isCompleted;
            const isClaimed = challenge.rewardClaimed;
            
            return (
              <div
                key={challenge.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isComplete && !isClaimed
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                    : isClaimed
                    ? "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 opacity-75"
                    : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isComplete 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  )}>
                    {challengeIcons[challenge.type] || <Trophy className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                        {language === "fr" && challenge.nameFr ? challenge.nameFr : challenge.name}
                      </h4>
                      {isComplete && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-1">
                      {language === "fr" && challenge.descriptionFr ? challenge.descriptionFr : challenge.description}
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress 
                          value={progressPercent} 
                          className={cn(
                            "h-2",
                            isComplete ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500"
                          )}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {challenge.currentProgress}/{challenge.targetValue}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 hover:bg-amber-100">
                      <Gift className="h-3 w-3 mr-1" />
                      +{challenge.xpReward} XP
                    </Badge>
                    
                    {isComplete && !isClaimed && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setClaimingId(challenge.id);
                          claimReward.mutate({ challengeId: challenge.id });
                        }}
                        disabled={claimingId === challenge.id}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {claimingId === challenge.id ? "..." : l.claim}
                      </Button>
                    )}
                    
                    {isClaimed && (
                      <Badge variant="outline" className="text-slate-500 border-slate-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {l.claimed}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default WeeklyChallenges;
