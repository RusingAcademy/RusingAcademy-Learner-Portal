import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Zap,
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap,
  Shield
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type TimeFilter = "weekly" | "monthly" | "allTime";

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("allTime");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading: leaderboardLoading } = trpc.gamification.getLeaderboard.useQuery({
    timeRange: timeFilter,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize
  } as any);

  // Fetch current user's rank
  const { data: userRank } = trpc.gamification.getUserRank.useQuery(
    // @ts-expect-error - TS2769: auto-suppressed during TS cleanup
    { timeRange: timeFilter },
    { enabled: isAuthenticated }
  );

  // Privacy toggle
  const { data: privacy } = trpc.gamification.getLeaderboardPrivacy.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const togglePrivacy = trpc.gamification.toggleLeaderboardPrivacy.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.showOnLeaderboard ? "Visible on leaderboard" : "Hidden from leaderboard",
        {
          description: data.showOnLeaderboard
            ? "Other learners can now see your ranking."
            : "Your profile is now hidden from the public leaderboard.",
        }
      );
    },
  });

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-7 h-7 text-yellow-500 drop-shadow-md" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-7 h-7 flex items-center justify-center font-bold text-muted-foreground text-lg">#{rank}</span>;
    }
  };

  // Get rank background based on position
  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-300 dark:border-yellow-700 shadow-sm shadow-yellow-200/50 dark:shadow-yellow-900/30";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 border-gray-300 dark:border-gray-600 shadow-sm";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-300 dark:border-amber-700 shadow-sm";
      default:
        return "bg-card border-border hover:border-primary/30";
    }
  };

  // Get level color
  const getLevelColor = (level: number) => {
    if (level >= 8) return "bg-purple-500";
    if (level >= 6) return "bg-blue-500";
    if (level >= 4) return "bg-green-500";
    if (level >= 2) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const totalPages = leaderboardData?.total ? Math.ceil(leaderboardData.total / pageSize) : 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Community Rankings</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Leaderboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how you rank among fellow learners. Earn XP by completing lessons, 
            quizzes, and maintaining your learning streak.
          </p>
          {/* Privacy Toggle */}
          {isAuthenticated && (
            <div className="inline-flex items-center gap-3 mt-4 px-4 py-2 rounded-full bg-muted/50 border">
              {privacy?.showOnLeaderboard ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {privacy?.showOnLeaderboard ? "Visible on leaderboard" : "Hidden from leaderboard"}
              </span>
              <Switch
                checked={privacy?.showOnLeaderboard ?? true}
                onCheckedChange={(checked) => togglePrivacy.mutate({ showOnLeaderboard: checked })}
                disabled={togglePrivacy.isPending}
              />
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{leaderboardData?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total Learners</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-300" />
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{leaderboardData?.entries?.[0]?.xp?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Top XP</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{leaderboardData?.entries?.[0]?.streak || 0}</p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-300" />
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{userRank?.rank || "-"}</p>
              <p className="text-sm text-muted-foreground">Your Rank</p>
            </CardContent>
          </Card>
        </div>

        {/* Your Position Card (if logged in) */}
        {isAuthenticated && userRank && (
          <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/50" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                    <Star className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Current Position</p>
                    <p className="text-2xl font-bold">Rank #{userRank.rank}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold">{userRank.xp?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">Level {(userRank as any).level || 1}</p>
                    <p className="text-sm text-muted-foreground">{(userRank as any).levelTitle || "Beginner"}</p>
                  </div>
                  {(userRank as any).streak > 0 && (
                    <div className="text-center flex items-center gap-1">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <p className="text-xl font-bold">{(userRank as any).streak}</p>
                      <p className="text-sm text-muted-foreground">day streak</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Filter Tabs */}
        <div className="flex justify-center mb-6">
          <Tabs value={timeFilter} onValueChange={(v) => { setTimeFilter(v as TimeFilter); setCurrentPage(1); }}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="allTime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Leaderboard List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Top Learners
              <Badge variant="secondary" className="ml-2">
                {timeFilter === "weekly" ? "Weekly" : timeFilter === "monthly" ? "Monthly" : "All Time"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : leaderboardData?.entries?.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to climb the leaderboard by completing lessons and earning XP!
                </p>
                <Link href="/courses">
                  <Button>Start Learning</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboardData?.entries?.map((entry: any, index: number) => {
                  const rank = (currentPage - 1) * pageSize + index + 1;
                  const isCurrentUser = user?.id === entry.userId;
                  
                  return (
                    <Link key={entry.userId} href={`/profile/${entry.userId}`}>
                      <div
                        className={`flex items-center gap-3 md:gap-4 p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${getRankBg(rank)} ${isCurrentUser ? "ring-2 ring-primary" : ""}`}
                      >
                        {/* Rank */}
                        <div className="w-10 flex justify-center shrink-0">
                          {getRankIcon(rank)}
                        </div>

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <img
                            loading="lazy" 
                            src={entry.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}`}
                            alt={entry.name || "User"}
                            className="w-12 h-12 rounded-full border-2 border-background object-cover"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getLevelColor(entry.level)} flex items-center justify-center text-white text-xs font-bold ring-2 ring-background`}>
                            {entry.level}
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold truncate">{entry.name || "Anonymous Learner"}</p>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs shrink-0">You</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            <span className="text-xs font-medium">{entry.levelTitle}</span>
                            {entry.streak > 0 && (
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                {entry.streak}d
                              </span>
                            )}
                            {/* Social stats: badges, courses, paths */}
                            {entry.badgeCount > 0 && (
                              <span className="flex items-center gap-1" title={`${entry.badgeCount} badge${entry.badgeCount > 1 ? "s" : ""} earned`}>
                                <Shield className="w-3 h-3 text-purple-500" />
                                {entry.badgeCount}
                              </span>
                            )}
                            {entry.completedCourses > 0 && (
                              <span className="flex items-center gap-1" title={`${entry.completedCourses} course${entry.completedCourses > 1 ? "s" : ""} completed`}>
                                <BookOpen className="w-3 h-3 text-blue-500" />
                                {entry.completedCourses}
                              </span>
                            )}
                            {entry.completedPaths > 0 && (
                              <span className="flex items-center gap-1" title={`${entry.completedPaths} certificate${entry.completedPaths > 1 ? "s" : ""} earned`}>
                                <GraduationCap className="w-3 h-3 text-teal-500" />
                                {entry.completedPaths}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* XP */}
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-primary">{entry.xp?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">XP</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend for social stats */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> Streak</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-purple-500" /> Badges</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-blue-500" /> Courses</span>
          <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-teal-500" /> Certificates</span>
        </div>

        {/* How to Earn XP Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              How to Earn XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
                <p className="font-semibold mb-1">Complete Lessons</p>
                <p className="text-sm text-muted-foreground">+25 XP per lesson</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-green-500" />
                </div>
                <p className="font-semibold mb-1">Pass Quizzes</p>
                <p className="text-sm text-muted-foreground">+50 XP (perfect score)</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <p className="font-semibold mb-1">Maintain Streak</p>
                <p className="text-sm text-muted-foreground">+10 XP daily bonus</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-purple-500" />
                </div>
                <p className="font-semibold mb-1">Earn Badges</p>
                <p className="text-sm text-muted-foreground">+100 XP per badge</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
