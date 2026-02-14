import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Trophy,
  Flame,
  Award,
  ChevronRight,
  Loader2,
  GraduationCap,
  Target,
  Medal,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import GamificationDashboard from "@/components/GamificationDashboard";

// Level definitions
const LEVELS = [
  { level: 1, title: "Beginner", titleFr: "Débutant", minXp: 0, icon: "🌱" },
  { level: 2, title: "Novice", titleFr: "Novice", minXp: 100, icon: "🌿" },
  { level: 3, title: "Apprentice", titleFr: "Apprenti", minXp: 300, icon: "📚" },
  { level: 4, title: "Student", titleFr: "Étudiant", minXp: 600, icon: "✏️" },
  { level: 5, title: "Scholar", titleFr: "Érudit", minXp: 1000, icon: "🎓" },
  { level: 6, title: "Expert", titleFr: "Expert", minXp: 1500, icon: "💡" },
  { level: 7, title: "Master", titleFr: "Maître", minXp: 2200, icon: "⭐" },
  { level: 8, title: "Champion", titleFr: "Champion", minXp: 3000, icon: "🏆" },
  { level: 9, title: "Virtuoso", titleFr: "Virtuose", minXp: 4000, icon: "👑" },
  { level: 10, title: "Legend", titleFr: "Légende", minXp: 5500, icon: "🌟" },
];

function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];
  
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }
  
  const xpInLevel = xp - currentLevel.minXp;
  const xpForNextLevel = nextLevel.minXp - currentLevel.minXp;
  const progress = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 100;
  
  return { currentLevel, nextLevel, xpInLevel, xpForNextLevel, progress };
}

// Enrollment type from API
interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  status: string | null;
  progressPercent: number | null;
  lessonsCompleted: number | null;
  totalLessons: number | null;
  lastAccessedAt: Date | null;
  completedAt: Date | null;
  course: {
    id: number;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    shortDescription: string | null;
    totalLessons: number | null;
  } | undefined;
}

export default function MyLearning() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch enrolled courses using myEnrollments endpoint
  const { data: enrollmentsData, isLoading: coursesLoading } = trpc.courses.myEnrollments.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const enrollments = (enrollmentsData || []) as unknown as Enrollment[];

  // Fetch gamification stats
  const { data: gamificationStats } = trpc.gamification.getMyStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch recent badges
  const { data: badges } = trpc.gamification.getMyBadges.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login?redirect=/my-learning");
    }
  }, [isAuthenticated, setLocation]);

  // Process enrollments into categories
  const { inProgressCourses, completedCourses, notStartedCourses, continueFrom } = useMemo(() => {
    if (!enrollments) {
      return { inProgressCourses: [], completedCourses: [], notStartedCourses: [], continueFrom: null };
    }

    const inProgress = enrollments.filter((e: Enrollment) => 
      (e.progressPercent || 0) > 0 && (e.progressPercent || 0) < 100
    );
    const completed = enrollments.filter((e: Enrollment) => (e.progressPercent || 0) >= 100);
    const notStarted = enrollments.filter((e: Enrollment) => (e.progressPercent || 0) === 0);

    // Find the course to continue
    const continueFromCourse = inProgress.length > 0 
      ? inProgress.sort((a: Enrollment, b: Enrollment) => 
          new Date(b.lastAccessedAt || 0).getTime() - new Date(a.lastAccessedAt || 0).getTime()
        )[0]
      : notStarted[0] || null;

    return {
      inProgressCourses: inProgress,
      completedCourses: completed,
      notStartedCourses: notStarted,
      continueFrom: continueFromCourse,
    };
  }, [enrollments]);

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalXp = gamificationStats?.xp?.total || 0;
  const currentStreak = gamificationStats?.streak?.current || 0;
  const levelInfo = getLevelInfo(totalXp);

  const recentBadges = badges?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEn ? `Welcome back, ${user?.name?.split(' ')[0] || 'Learner'}!` : `Bon retour, ${user?.name?.split(' ')[0] || 'Apprenant'} !`}
          </h1>
          <p className="text-muted-foreground">
            {isEn 
              ? "Track your progress and continue your journey to bilingual excellence."
              : "Suivez votre progression et continuez votre parcours vers l'excellence bilingue."}
          </p>
        </div>

        {/* Continue Learning Card */}
        {continueFrom && continueFrom.course && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Badge className="bg-white/20 text-white mb-2">
                      {isEn ? "Continue Learning" : "Continuer l'apprentissage"}
                    </Badge>
                    <h2 className="text-xl font-bold mb-2">{continueFrom.course.title}</h2>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Progress value={continueFrom.progressPercent || 0} className="w-32 h-2 bg-white/30" />
                        <span className="text-sm">{continueFrom.progressPercent || 0}%</span>
                      </div>
                      <span className="text-sm text-white/80">
                        {continueFrom.lessonsCompleted || 0}/{continueFrom.totalLessons || 0} {isEn ? "lessons" : "leçons"}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-white text-teal-600 hover:bg-white/90"
                    onClick={() => setLocation(`/courses/${continueFrom.course?.slug}`)}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {isEn ? "Resume" : "Reprendre"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* XP & Level */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl">
                  {levelInfo.currentLevel.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEn ? "Level" : "Niveau"} {levelInfo.currentLevel.level}
                  </p>
                  <p className="font-bold">
                    {isEn ? levelInfo.currentLevel.title : levelInfo.currentLevel.titleFr}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{totalXp} XP</span>
                  <span>{levelInfo.nextLevel.minXp} XP</span>
                </div>
                <Progress value={levelInfo.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEn ? "Current Streak" : "Série actuelle"}
                  </p>
                  <p className="font-bold text-xl">{currentStreak} {isEn ? "days" : "jours"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses Completed */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEn ? "Completed" : "Terminés"}
                  </p>
                  <p className="font-bold text-xl">{completedCourses.length} {isEn ? "courses" : "cours"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E7F2F2] dark:bg-[#E7F2F2]/30 flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#0F3D3E]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEn ? "Badges Earned" : "Badges gagnés"}
                  </p>
                  <p className="font-bold text-xl">{badges?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{isEn ? "My Courses" : "Mes cours"}</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">{isEn ? "Achievements" : "Réalisations"}</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Medal className="h-4 w-4" />
              <span className="hidden sm:inline">{isEn ? "Leaderboard" : "Classement"}</span>
            </TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="overview">
            {/* In Progress */}
            {inProgressCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-teal-500" />
                  {isEn ? "In Progress" : "En cours"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressCourses.map((enrollment: Enrollment) => (
                    <CourseCard 
                      key={enrollment.id} 
                      enrollment={enrollment} 
                      isEn={isEn}
                      onContinue={() => setLocation(`/courses/${enrollment.course?.slug}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Not Started */}
            {notStartedCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  {isEn ? "Ready to Start" : "Prêt à commencer"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notStartedCourses.map((enrollment: Enrollment) => (
                    <CourseCard 
                      key={enrollment.id} 
                      enrollment={enrollment} 
                      isEn={isEn}
                      onContinue={() => setLocation(`/courses/${enrollment.course?.slug}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {isEn ? "Completed" : "Terminés"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedCourses.map((enrollment: Enrollment) => (
                    <CourseCard 
                      key={enrollment.id} 
                      enrollment={enrollment} 
                      isEn={isEn}
                      completed
                      onContinue={() => setLocation(`/courses/${enrollment.course?.slug}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!enrollments || enrollments.length === 0) && (
              <Card className="text-center py-12">
                <CardContent>
                  <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {isEn ? "No courses yet" : "Pas encore de cours"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isEn 
                      ? "Start your journey to bilingual excellence today!"
                      : "Commencez votre parcours vers l'excellence bilingue dès aujourd'hui !"}
                  </p>
                  <Button asChild>
                    <Link href="/courses">
                      {isEn ? "Browse Courses" : "Parcourir les cours"}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <GamificationDashboard />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <LeaderboardSection isEn={isEn} />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

// Course Card Component
function CourseCard({ 
  enrollment, 
  isEn, 
  completed = false,
  onContinue 
}: { 
  enrollment: Enrollment; 
  isEn: boolean; 
  completed?: boolean;
  onContinue: () => void;
}) {
  const course = enrollment.course;
  if (!course) return null;

  const progress = enrollment.progressPercent || 0;
  const lessonsCompleted = enrollment.lessonsCompleted || 0;
  const totalLessons = enrollment.totalLessons || course.totalLessons || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        {course.thumbnailUrl ? (
          <img 
            loading="lazy" src={course.thumbnailUrl} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600">
            <BookOpen className="h-12 w-12 text-white/80" />
          </div>
        )}
        {completed && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isEn ? "Completed" : "Terminé"}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{lessonsCompleted}/{totalLessons} {isEn ? "lessons" : "leçons"}</span>
          </div>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        <Button 
          className="w-full" 
          variant={completed ? "outline" : "default"}
          onClick={onContinue}
        >
          {completed ? (
            <>
              {isEn ? "Review" : "Revoir"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          ) : progress > 0 ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              {isEn ? "Continue" : "Continuer"}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              {isEn ? "Start" : "Commencer"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Leaderboard Section
function LeaderboardSection({ isEn }: { isEn: boolean }) {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly");
  
  const { data: leaderboard, isLoading } = trpc.gamification.getLeaderboard.useQuery({
    timeRange: period,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {isEn ? "Leaderboard" : "Classement"}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={period === "weekly" ? "default" : "outline"}
              onClick={() => setPeriod("weekly")}
            >
              {isEn ? "Week" : "Semaine"}
            </Button>
            <Button
              size="sm"
              variant={period === "monthly" ? "default" : "outline"}
              onClick={() => setPeriod("monthly")}
            >
              {isEn ? "Month" : "Mois"}
            </Button>
            <Button
              size="sm"
              variant={period === "allTime" ? "default" : "outline"}
              onClick={() => setPeriod("allTime")}
            >
              {isEn ? "All Time" : "Tout temps"}
            </Button>
          </div>
        </div>
        <CardDescription>
          {isEn 
            ? "Top learners in the RusingAcademy community"
            : "Meilleurs apprenants de la communauté RusingAcademy"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard?.entries?.map((entry, index) => (
            <div 
              key={entry.userId}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                index < 3 ? "bg-muted/50" : ""
              }`}
            >
              <div className="w-8 text-center font-bold">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">
                {entry.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1">
                <p className="font-medium">{entry.name || "Anonymous"}</p>
                <p className="text-sm text-muted-foreground">
                  {isEn ? "Level" : "Niveau"} {entry.level}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-teal-600">{entry.xp.toLocaleString()} XP</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
