import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  Gift,
  Trophy,
  Zap,
  Crown,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Reward {
  id: number;
  name: string;
  nameEn: string;
  nameFr: string;
  description: string | null;
  descriptionEn: string | null;
  descriptionFr: string | null;
  pointsCost: number;
  rewardType: string;
  minTier: string;
}

interface PointTransaction {
  id: number;
  type: string;
  points: number;
  description: string | null;
  createdAt: Date;
}

const tierConfig = {
  bronze: { icon: Star, color: "text-amber-600", bg: "bg-amber-100", min: 0, max: 499 },
  silver: { icon: Zap, color: "text-gray-500", bg: "bg-gray-100", min: 500, max: 1999 },
  gold: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-100", min: 2000, max: 4999 },
  platinum: { icon: Sparkles, color: "text-[#0F3D3E]", bg: "bg-[#E7F2F2]", min: 5000, max: Infinity },
};

export default function LoyaltyDashboard() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch loyalty data
  const loyaltyQuery = trpc.learner.getLoyaltyPoints.useQuery();
  const rewardsQuery = trpc.learner.getAvailableRewards.useQuery();
  const historyQuery = trpc.learner.getPointsHistory.useQuery();

  // Redeem mutation
  const redeemMutation = trpc.learner.redeemReward.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Reward redeemed successfully!" : "Récompense échangée avec succès!");
      loyaltyQuery.refetch();
      setSelectedReward(null);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const loyalty = loyaltyQuery.data || {
    totalPoints: 0,
    availablePoints: 0,
    lifetimePoints: 0,
    tier: "bronze" as const,
  };

  const rewards = rewardsQuery.data || [];
  const history = historyQuery.data || [];

  const currentTier = tierConfig[loyalty.tier as keyof typeof tierConfig] || tierConfig.bronze;
  const nextTier = loyalty.tier === "bronze" ? "silver" : loyalty.tier === "silver" ? "gold" : loyalty.tier === "gold" ? "platinum" : null;
  const nextTierConfig = nextTier ? tierConfig[nextTier] : null;
  const progressToNextTier = nextTierConfig 
    ? ((loyalty.lifetimePoints - currentTier.min) / (nextTierConfig.min - currentTier.min)) * 100
    : 100;

  const TierIcon = currentTier.icon;

  const getRewardIcon = (type: string) => {
    if (type.includes("discount")) return "🏷️";
    if (type.includes("free")) return "🎁";
    if (type.includes("priority")) return "⚡";
    if (type.includes("exclusive")) return "👑";
    return "🎯";
  };

  const getTransactionIcon = (type: string) => {
    if (type.includes("earned")) return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (type.includes("redeemed")) return <Gift className="h-4 w-4 text-[#0F3D3E]" />;
    if (type.includes("expired")) return <Clock className="h-4 w-4 text-gray-400" />;
    return <Star className="h-4 w-4 text-amber-500" />;
  };

  const formatTransactionType = (type: string) => {
    const types: Record<string, { en: string; fr: string }> = {
      earned_booking: { en: "Session Booking", fr: "Réservation de session" },
      earned_review: { en: "Review Bonus", fr: "Bonus d'avis" },
      earned_referral: { en: "Referral Bonus", fr: "Bonus de parrainage" },
      earned_streak: { en: "Booking Streak", fr: "Série de réservations" },
      earned_milestone: { en: "Milestone Reached", fr: "Jalon atteint" },
      redeemed_discount: { en: "Discount Redeemed", fr: "Réduction échangée" },
      redeemed_session: { en: "Free Session", fr: "Session gratuite" },
      expired: { en: "Points Expired", fr: "Points expirés" },
      adjustment: { en: "Adjustment", fr: "Ajustement" },
    };
    return types[type]?.[isEn ? "en" : "fr"] || type;
  };

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="overflow-hidden">
        <div className={cn("p-6", currentTier.bg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("h-16 w-16 rounded-full bg-white/80 flex items-center justify-center", currentTier.color)}>
                <TierIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isEn ? "Your Tier" : "Votre niveau"}
                </p>
                <h2 className="text-2xl font-bold capitalize">{loyalty.tier}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {isEn ? "Available Points" : "Points disponibles"}
              </p>
              <p className="text-4xl font-bold">{loyalty.availablePoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{loyalty.lifetimePoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                {isEn ? "Lifetime Points" : "Points à vie"}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{rewards.length}</p>
              <p className="text-sm text-muted-foreground">
                {isEn ? "Available Rewards" : "Récompenses disponibles"}
              </p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTierConfig && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{loyalty.tier}</span>
                <span className="capitalize">{nextTier}</span>
              </div>
              <Progress value={progressToNextTier} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {isEn 
                  ? `${nextTierConfig.min - loyalty.lifetimePoints} points to ${nextTier}`
                  : `${nextTierConfig.min - loyalty.lifetimePoints} points pour ${nextTier}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {isEn ? "How to Earn Points" : "Comment gagner des points"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { action: isEn ? "Book a session" : "Réserver une session", points: 50, icon: "📅" },
              { action: isEn ? "Complete a session" : "Compléter une session", points: 100, icon: "✅" },
              { action: isEn ? "Leave a review" : "Laisser un avis", points: 25, icon: "⭐" },
              { action: isEn ? "Refer a friend" : "Parrainer un ami", points: 200, icon: "👥" },
              { action: isEn ? "5-session streak" : "Série de 5 sessions", points: 150, icon: "🔥" },
              { action: isEn ? "First session" : "Première session", points: 100, icon: "🎉" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.action}</span>
                </div>
                <Badge variant="secondary" className="font-bold">
                  +{item.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {isEn ? "Redeem Rewards" : "Échanger des récompenses"}
          </CardTitle>
          <CardDescription>
            {isEn 
              ? "Use your points to unlock exclusive rewards"
              : "Utilisez vos points pour débloquer des récompenses exclusives"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 1, nameEn: "5% Discount", nameFr: "Réduction de 5%", pointsCost: 200, rewardType: "discount_5", minTier: "bronze", descriptionEn: "5% off your next session", descriptionFr: "5% de réduction sur votre prochaine session" },
              { id: 2, nameEn: "10% Discount", nameFr: "Réduction de 10%", pointsCost: 400, rewardType: "discount_10", minTier: "bronze", descriptionEn: "10% off your next session", descriptionFr: "10% de réduction sur votre prochaine session" },
              { id: 3, nameEn: "15% Discount", nameFr: "Réduction de 15%", pointsCost: 600, rewardType: "discount_15", minTier: "silver", descriptionEn: "15% off your next session", descriptionFr: "15% de réduction sur votre prochaine session" },
              { id: 4, nameEn: "Free Trial Session", nameFr: "Session d'essai gratuite", pointsCost: 500, rewardType: "free_trial", minTier: "bronze", descriptionEn: "Free 30-minute trial with any coach", descriptionFr: "Essai gratuit de 30 minutes avec n'importe quel coach" },
              { id: 5, nameEn: "Free Full Session", nameFr: "Session complète gratuite", pointsCost: 1500, rewardType: "free_session", minTier: "gold", descriptionEn: "Free 60-minute session with any coach", descriptionFr: "Session gratuite de 60 minutes avec n'importe quel coach" },
              { id: 6, nameEn: "Priority Booking", nameFr: "Réservation prioritaire", pointsCost: 800, rewardType: "priority_booking", minTier: "silver", descriptionEn: "Priority booking access for 1 month", descriptionFr: "Accès prioritaire aux réservations pendant 1 mois" },
            ].map((reward) => {
              const canRedeem = loyalty.availablePoints >= reward.pointsCost;
              const tierOrder = ["bronze", "silver", "gold", "platinum"];
              const hasRequiredTier = tierOrder.indexOf(loyalty.tier) >= tierOrder.indexOf(reward.minTier);
              
              return (
                <div 
                  key={reward.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    canRedeem && hasRequiredTier 
                      ? "border-primary/50 hover:border-primary cursor-pointer" 
                      : "border-muted opacity-60"
                  )}
                  onClick={() => canRedeem && hasRequiredTier && setSelectedReward(reward as Reward)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{getRewardIcon(reward.rewardType)}</span>
                    {!hasRequiredTier && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {reward.minTier}+
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">
                    {isEn ? reward.nameEn : reward.nameFr}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isEn ? reward.descriptionEn : reward.descriptionFr}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-bold">
                      {reward.pointsCost} pts
                    </Badge>
                    {canRedeem && hasRequiredTier && (
                      <ArrowRight className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {isEn ? "Points History" : "Historique des points"}
            </CardTitle>
            <CardDescription>
              {isEn ? "Your recent point transactions" : "Vos transactions de points récentes"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
            {isEn ? "View All" : "Voir tout"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(history.slice(0, 5) as unknown as PointTransaction[]).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-sm">{formatTransactionType(transaction.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "font-bold",
                  transaction.points > 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {transaction.points > 0 ? "+" : ""}{transaction.points}
                </span>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{isEn ? "No transactions yet" : "Aucune transaction"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEn ? "Redeem Reward" : "Échanger la récompense"}
            </DialogTitle>
            <DialogDescription>
              {isEn 
                ? "Are you sure you want to redeem this reward?"
                : "Êtes-vous sûr de vouloir échanger cette récompense?"}
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <span className="text-4xl">{getRewardIcon(selectedReward.rewardType)}</span>
                <div>
                  <h3 className="font-semibold">
                    {isEn ? selectedReward.nameEn : selectedReward.nameFr}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isEn ? selectedReward.descriptionEn : selectedReward.descriptionFr}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span>{isEn ? "Points to spend:" : "Points à dépenser:"}</span>
                <span className="font-bold text-lg">{selectedReward.pointsCost} pts</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{isEn ? "Remaining balance:" : "Solde restant:"}</span>
                <span>{loyalty.availablePoints - selectedReward.pointsCost} pts</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>
              {isEn ? "Cancel" : "Annuler"}
            </Button>
            <Button 
              onClick={() => selectedReward && redeemMutation.mutate({ rewardId: selectedReward.id })}
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending 
                ? (isEn ? "Redeeming..." : "Échange en cours...")
                : (isEn ? "Confirm Redemption" : "Confirmer l'échange")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
