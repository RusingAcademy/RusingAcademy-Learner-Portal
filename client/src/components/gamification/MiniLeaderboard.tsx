import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Crown, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  trend?: "up" | "down" | "same";
  isCurrentUser?: boolean;
}

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  totalUsers?: number;
  language?: "en" | "fr";
  className?: string;
}

// Rank badge component
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <motion.div
        className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Crown className="h-4 w-4 text-white" />
      </motion.div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
        <Medal className="h-4 w-4 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
        <Medal className="h-4 w-4 text-white" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{rank}</span>
    </div>
  );
};

// Trend indicator
const TrendIndicator = ({ trend }: { trend?: "up" | "down" | "same" }) => {
  if (!trend || trend === "same") {
    return <Minus className="h-3 w-3 text-slate-400" />;
  }
  if (trend === "up") {
    return <TrendingUp className="h-3 w-3 text-emerald-500" />;
  }
  return <TrendingDown className="h-3 w-3 text-red-500" />;
};

export function MiniLeaderboard({
  entries,
  currentUserRank,
  totalUsers,
  language = "en",
  className,
}: MiniLeaderboardProps) {
  const labels = {
    en: {
      title: "Leaderboard",
      viewFull: "View Full Leaderboard",
      yourRank: "Your Rank",
      outOf: "out of",
      level: "Lvl",
      xp: "XP",
      noData: "No leaderboard data yet",
      beFirst: "Be the first to climb the ranks!",
    },
    fr: {
      title: "Classement",
      viewFull: "Voir le classement complet",
      yourRank: "Votre rang",
      outOf: "sur",
      level: "Niv",
      xp: "XP",
      noData: "Pas encore de données",
      beFirst: "Soyez le premier à grimper!",
    },
  };

  const l = labels[language];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {l.title}
          </CardTitle>
          {currentUserRank && totalUsers && (
            <Badge variant="outline" className="text-xs">
              #{currentUserRank} {l.outOf} {totalUsers}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {entries.length === 0 ? (
          <motion.div
            className="text-center py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{l.noData}</p>
            <p className="text-xs text-slate-500 mt-1">{l.beFirst}</p>
          </motion.div>
        ) : (
          <>
            {entries.slice(0, 5).map((entry, index) => (
              <Link key={entry.id} href={`/profile/${entry.id}`}>
                <motion.div
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                    entry.isCurrentUser
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Rank */}
                  <RankBadge rank={entry.rank} />

                  {/* Avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatarUrl} alt={entry.name} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                      {entry.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name and level */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      entry.isCurrentUser ? "text-primary" : "text-slate-900 dark:text-white"
                    )}>
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="text-xs text-slate-500 ml-1">
                          ({language === "fr" ? "vous" : "you"})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {l.level} {entry.level}
                    </p>
                  </div>

                  {/* XP and trend */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.xp.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{l.xp}</p>
                    </div>
                    <TrendIndicator trend={entry.trend} />
                  </div>
                </motion.div>
              </Link>
            ))}

            {/* View full leaderboard link */}
            <Link href="/app/badges">
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-slate-500 hover:text-slate-700"
              >
                {l.viewFull}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default MiniLeaderboard;
