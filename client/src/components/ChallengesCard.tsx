import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { 
  Trophy, 
  Target, 
  Star, 
  Users, 
  MessageSquare, 
  Flame,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

const challengeIcons: Record<string, React.ReactNode> = {
  sessions: <Target className="h-5 w-5" />,
  reviews: <Star className="h-5 w-5" />,
  referrals: <Users className="h-5 w-5" />,
  streak: <Flame className="h-5 w-5" />,
  first_session: <Sparkles className="h-5 w-5" />,
};

const periodLabels: Record<string, { en: string; fr: string }> = {
  daily: { en: "Daily", fr: "Quotidien" },
  weekly: { en: "Weekly", fr: "Hebdomadaire" },
  monthly: { en: "Monthly", fr: "Mensuel" },
  one_time: { en: "One-time", fr: "Unique" },
};

interface Challenge {
  id: number;
  name: string;
  nameFr: string | null;
  description: string | null;
  descriptionFr: string | null;
  type: string;
  targetCount: number;
  pointsReward: number;
  period: string;
  currentProgress: number;
  status: string;
  periodEnd: Date;
}

export function ChallengesCard() {
  const { language } = useLanguage();
  const isEn = language === "en";
  
  const { data: challenges, isLoading } = trpc.learner.getChallenges.useQuery();
  const claimMutation = trpc.learner.claimChallengeReward.useMutation();
  
  const [claimingId, setClaimingId] = useState<number | null>(null);
  
  const handleClaim = async (challengeId: number) => {
    setClaimingId(challengeId);
    try {
      await claimMutation.mutateAsync({ userChallengeId: challengeId });
    } finally {
      setClaimingId(null);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {isEn ? "Weekly Challenges" : "Défis hebdomadaires"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const activeChallenges = (challenges as unknown as Challenge[] || []).filter((c) => c.status === "active");
  const completedChallenges = (challenges as unknown as Challenge[] || []).filter((c) => c.status === "completed");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {isEn ? "Weekly Challenges" : "Défis hebdomadaires"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeChallenges.length === 0 && completedChallenges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{isEn ? "No active challenges" : "Aucun défi actif"}</p>
            <p className="text-sm mt-1">
              {isEn ? "Check back soon for new challenges!" : "Revenez bientôt pour de nouveaux défis!"}
            </p>
          </div>
        ) : (
          <>
            {/* Active Challenges */}
            {activeChallenges.map((challenge: Challenge) => {
              const progress = Math.min(100, (challenge.currentProgress / challenge.targetCount) * 100);
              const isComplete = challenge.currentProgress >= challenge.targetCount;
              const timeLeft = new Date(challenge.periodEnd).getTime() - Date.now();
              const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
              
              return (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg border ${
                    isComplete ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${isComplete ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary"}`}>
                        {challengeIcons[challenge.type] || <Target className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {isEn ? challenge.name : (challenge.nameFr || challenge.name)}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {isEn ? challenge.description : (challenge.descriptionFr || challenge.description)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isComplete ? "default" : "secondary"} className="shrink-0">
                      <Gift className="h-3 w-3 mr-1" />
                      {challenge.pointsReward} pts
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {challenge.currentProgress} / {challenge.targetCount}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {daysLeft} {isEn ? "days left" : "jours restants"}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  {isComplete && (
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleClaim(challenge.id)}
                      disabled={claimingId === challenge.id}
                    >
                      {claimingId === challenge.id ? (
                        <>{isEn ? "Claiming..." : "Réclamation..."}</>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {isEn ? "Claim Reward" : "Réclamer la récompense"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
            
            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  {isEn ? "Completed This Week" : "Complétés cette semaine"}
                </h4>
                <div className="space-y-2">
                  {completedChallenges.slice(0, 3).map((challenge: Challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">
                          {isEn ? challenge.name : (challenge.nameFr || challenge.name)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-emerald-600">
                        +{challenge.pointsReward} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ChallengesCard;
