import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Flame,
} from "lucide-react";

type TimeFilter = "weekly" | "monthly" | "allTime";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  avatarUrl?: string | null;
  points: number;
  tier: string;
  sessionsCompleted: number;
  streak: number;
  rankChange: number; // positive = moved up, negative = moved down, 0 = same
}

export function Leaderboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isEn = language === "en";
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("weekly");

  const { data: leaderboard, isLoading } = trpc.learner.getLeaderboard.useQuery(
    { period: timeFilter },
    { refetchInterval: 60000 } // Refresh every minute
  );

  const content = {
    en: {
      title: "Leaderboard",
      description: "Top learners by points earned",
      weekly: "This Week",
      monthly: "This Month",
      allTime: "All Time",
      points: "pts",
      sessions: "sessions",
      streak: "day streak",
      you: "You",
      noData: "No leaderboard data yet. Start learning to earn points!",
      tiers: {
        bronze: "Bronze",
        silver: "Silver",
        gold: "Gold",
        platinum: "Platinum",
      },
    },
    fr: {
      title: "Classement",
      description: "Meilleurs apprenants par points gagnés",
      weekly: "Cette semaine",
      monthly: "Ce mois",
      allTime: "Tout le temps",
      points: "pts",
      sessions: "séances",
      streak: "jours consécutifs",
      you: "Vous",
      noData: "Pas encore de données. Commencez à apprendre pour gagner des points!",
      tiers: {
        bronze: "Bronze",
        silver: "Argent",
        gold: "Or",
        platinum: "Platine",
      },
    },
  };

  const t = isEn ? content.en : content.fr;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-emerald-500 text-xs">
          <TrendingUp className="h-3 w-3 mr-0.5" />
          <span>+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500 text-xs">
          <TrendingDown className="h-3 w-3 mr-0.5" />
          <span>{change}</span>
        </div>
      );
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "platinum":
        return "bg-gradient-to-r from-[#0F3D3E] to-[#E06B2D] text-white";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-[#C65A1E] text-white";
      case "silver":
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case "bronze":
      default:
        return "bg-gradient-to-r from-[#A84A15] to-[#A84A15] text-white";
    }
  };

  const getTierLabel = (tier: string) => {
    const tierKey = tier.toLowerCase() as keyof typeof t.tiers;
    return t.tiers[tierKey] || tier;
  };

  const getRowStyle = (rank: number, isCurrentUser: boolean) => {
    let baseStyle = "flex items-center gap-4 p-3 rounded-lg transition-all ";
    
    if (isCurrentUser) {
      baseStyle += "bg-primary/10 border-2 border-primary ";
    } else if (rank === 1) {
      baseStyle += "bg-gradient-to-r from-[#FFFBEB] to-[#FFF8F3] dark:from-yellow-900/20 dark:to-[#7C2D12]/20 ";
    } else if (rank === 2) {
      baseStyle += "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 ";
    } else if (rank === 3) {
      baseStyle += "bg-gradient-to-r from-[#FFF8F3] to-[#FFF8F3] dark:from-[#7C2D12]/20 dark:to-[#7C2D12]/20 ";
    } else {
      baseStyle += "hover:bg-muted/50 ";
    }
    
    return baseStyle;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
        </div>
        
        {/* Time Filter Buttons */}
        <div className="flex gap-2 mt-4">
          {(["weekly", "monthly", "allTime"] as TimeFilter[]).map((filter) => (
            <Button
              key={filter}
              variant={timeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter(filter)}
              className="text-xs"
            >
              {t[filter]}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>{t.noData}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry: LeaderboardEntry) => {
              const isCurrentUser = user?.id === entry.userId;
              
              return (
                <div
                  key={entry.userId}
                  className={getRowStyle(entry.rank, isCurrentUser)}
                >
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={entry.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {entry.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Name and Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">
                        {entry.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-primary">({t.you})</span>
                        )}
                      </span>
                      <Badge className={`text-xs ${getTierColor(entry.tier)}`}>
                        {getTierLabel(entry.tier)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {entry.sessionsCompleted} {t.sessions}
                      </span>
                      {entry.streak > 0 && (
                        <span className="flex items-center gap-1 text-orange-500">
                          <Flame className="h-3 w-3" />
                          {entry.streak} {t.streak}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Points and Rank Change */}
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-lg">{entry.points.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{t.points}</span>
                    </div>
                    <div className="mt-1">
                      {getRankChangeIcon(entry.rankChange)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Leaderboard;
