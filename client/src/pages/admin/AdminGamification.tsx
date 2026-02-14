import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Star, Zap, Target, Users, TrendingUp, RefreshCw, Award } from "lucide-react";
import { toast } from "sonner";

// Badge tier colors
const TIER_COLORS: Record<string, string> = {
  bronze: "bg-amber-700 text-white",
  silver: "bg-gray-400 text-white",
  gold: "bg-yellow-500 text-white",
  platinum: "bg-purple-600 text-white",
  diamond: "bg-cyan-400 text-white",
};

// Badge category icons
const CATEGORY_ICONS: Record<string, any> = {
  course_progress: Trophy,
  streaks: Zap,
  quiz_performance: Target,
  engagement: Star,
  milestones: Medal,
  special: Award,
  path_completion: TrendingUp,
};

export default function AdminGamification() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch gamification stats
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = trpc.admin.getGamificationStats.useQuery(undefined, {
    retry: 1,
  });

  const stats = statsData ?? {
    totalBadgesEarned: 0,
    totalXpAwarded: 0,
    activeLearners: 0,
    avgLevel: 0,
    topBadges: [],
    recentAwards: [],
    leaderboard: [],
  };

  if (statsError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold">Gamification</h1>
            <p className="text-muted-foreground">Manage badges, XP, and learner achievements</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Unable to load gamification data. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetchStats()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold">Gamification</h1>
            <p className="text-muted-foreground">Manage badges, XP, and learner achievements</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetchStats()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Medal className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="text-2xl font-bold">{stats.totalBadgesEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total XP Awarded</p>
                <p className="text-2xl font-bold">{stats.totalXpAwarded.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Learners</p>
                <p className="text-2xl font-bold">{stats.activeLearners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Level</p>
                <p className="text-2xl font-bold">{stats.avgLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="recent">Recent Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Earned Badges</CardTitle>
              <CardDescription>Top badges earned by learners across all paths</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : stats.topBadges.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No badges have been earned yet. Badges are awarded automatically as learners progress through courses.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.topBadges.map((badge: any) => (
                    <div key={badge.type} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${TIER_COLORS[badge.tier] || "bg-gray-200"}`}>
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.count} earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>XP Leaderboard</CardTitle>
              <CardDescription>Top learners by total experience points</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : stats.leaderboard.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No learners have earned XP yet. XP is awarded for completing lessons, quizzes, and courses.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Learner</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Badges</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.leaderboard.map((learner: any, idx: number) => (
                      <TableRow key={learner.userId}>
                        <TableCell className="font-bold text-lg">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{learner.name}</p>
                            <p className="text-sm text-muted-foreground">{learner.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Lv. {learner.level}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{learner.totalXp.toLocaleString()}</TableCell>
                        <TableCell>{learner.badgeCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Badge Awards</CardTitle>
              <CardDescription>Latest badges earned by learners</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : stats.recentAwards.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No recent badge awards. Badges are earned automatically through course progression.
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentAwards.map((award: any) => (
                    <div key={award.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${TIER_COLORS[award.tier] || "bg-gray-200"}`}>
                        <Medal className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{award.userName} earned <span className="text-amber-600">{award.badgeName}</span></p>
                        <p className="text-xs text-muted-foreground">
                          {award.earnedAt ? new Date(award.earnedAt).toLocaleDateString() : "Recently"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
