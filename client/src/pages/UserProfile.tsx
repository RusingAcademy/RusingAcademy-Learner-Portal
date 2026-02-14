import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Flame, 
  Star,
  Award,
  Calendar,
  BookOpen,
  Target,
  TrendingUp,
  ArrowLeft
} from "lucide-react";
import { Link, useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const numericUserId = parseInt(userId || "0", 10);
  const isOwnProfile = currentUser?.id === numericUserId;

  const { data: profile, isLoading: profileLoading } = trpc.gamification.getUserProfile.useQuery(
    { userId: numericUserId },
    { enabled: !!numericUserId }
  );

  const { data: badges, isLoading: badgesLoading } = trpc.gamification.getUserBadges.useQuery(
    { userId: numericUserId },
    { enabled: !!numericUserId }
  );

  const { data: history, isLoading: historyLoading } = trpc.gamification.getLearningHistory.useQuery(
    { userId: numericUserId, limit: 30 },
    { enabled: !!numericUserId }
  );

  const getLevelColor = (level: number) => {
    if (level >= 8) return "bg-purple-500";
    if (level >= 6) return "bg-blue-500";
    if (level >= 4) return "bg-green-500";
    if (level >= 2) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const generateActivityHeatmap = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const activity = history?.find(h => h.date === dateStr);
      days.push({
        date: dateStr,
        count: activity?.lessonsCompleted || 0,
        day: date.getDate()
      });
    }
    return days;
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-green-200 dark:bg-green-900";
    if (count <= 3) return "bg-green-400 dark:bg-green-700";
    return "bg-green-600 dark:bg-green-500";
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-6">This profile does not exist or has been removed.</p>
          <Link href="/app/badges">
            <Button>Back to Leaderboard</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const activityDays = generateActivityHeatmap();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Link href="/app/badges">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Button>
        </Link>

        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <img
                  loading="lazy" src={profile.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile.name}
                  alt={profile.name || "User"}
                  className="w-32 h-32 rounded-full border-4 border-background shadow-lg"
                />
                <div className={"absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold " + getLevelColor(profile.level)}>
                  {profile.level}
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name || "Anonymous Learner"}</h1>
                  {isOwnProfile && <Badge>You</Badge>}
                </div>
                <p className="text-xl text-muted-foreground mb-4">{profile.levelTitle}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">{profile.totalXp?.toLocaleString()} XP</span>
                  </div>
                  {profile.streak > 0 && (
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold">{profile.streak} day streak</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Rank #{profile.rank}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{profile.lessonsCompleted || 0}</p>
              <p className="text-sm text-muted-foreground">Lessons Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{profile.quizzesPassed || 0}</p>
              <p className="text-sm text-muted-foreground">Quizzes Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{badges?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{profile.coursesEnrolled || 0}</p>
              <p className="text-sm text-muted-foreground">Courses Enrolled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Activity (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-1">
                {activityDays.map((day, i) => (
                  <div
                    key={i}
                    className={"w-6 h-6 rounded-sm " + getHeatmapColor(day.count)}
                    title={day.date + ": " + day.count + " lessons"}
                  />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                <span>More</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badges ({badges?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badgesLoading ? (
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="w-16 h-16 rounded-full" />
                  ))}
                </div>
              ) : badges?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No badges earned yet</p>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {badges?.slice(0, 8).map((badge, i) => (
                    <div key={i} className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl mb-2">
                        {badge.icon || "🏆"}
                      </div>
                      <p className="text-xs font-medium truncate">{badge.name}</p>
                    </div>
                  ))}
                </div>
              )}
              {badges && badges.length > 8 && (
                <Link href="/app/badges">
                  <Button variant="outline" className="w-full mt-4">
                    View All Badges
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
