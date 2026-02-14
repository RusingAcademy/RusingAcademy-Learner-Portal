import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppLayout } from "@/contexts/AppLayoutContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MessageSquare,
  Bot,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  ChevronRight,
  Video,
  Star,
  Users,
  CalendarClock,
  X,
  Heart,
  Settings,
  CreditCard,
  BarChart3,
  Share2,
  Gift,
  Play,
  Sparkles,
  Trophy,
  Flame,
  GraduationCap,
  ArrowRight,
  Lock,
} from "lucide-react";
import RescheduleModal from "@/components/RescheduleModal";
import { CancellationModal } from "@/components/CancellationModal";
import { ProgressReportCard } from "@/components/ProgressReportCard";
import { ReportPreferencesCard } from "@/components/ReportPreferencesCard";
import { ChallengesCard } from "@/components/ChallengesCard";
import { Leaderboard } from "@/components/Leaderboard";
import StreakCard from "@/components/StreakCard";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { Link } from "wouter";
import { RoleSwitcherCompact } from "@/components/RoleSwitcher";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { StatCard, ProgressRing } from "@/components/dashboard";
import { Zap, Timer, Gamepad2 } from "lucide-react";
import { SLEVelocityWidget } from "@/components/SLEVelocityWidget";
import { CertificationExpiryWidget } from "@/components/CertificationExpiryWidget";
import { CompactStreak } from "@/components/StreakTracker";
import { LearnerBadges } from "@/components/LearnerBadges";
import { SkillGapHeatmap, CompactSkillGapHeatmap } from "@/components/SkillGapHeatmap";
import useWelcomeToast from "@/hooks/useWelcomeToast";
import { MiniLeaderboard, StreakRecovery } from "@/components/gamification";
import { XpMultiplierCard } from "@/components/XpMultiplierCard";
import { RecommendedNextSteps } from "@/components/RecommendedNextSteps";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MilestoneProgressCard } from "@/components/MilestoneProgressCard";

// ─── Badge Icon Map (shared with BadgesCatalog) ────────────────────────────
import { BadgeIcon } from "@/components/BadgeIcon";

// ─── Recent Badges Widget (pulls from badgeShowcase API) ───────────────────
function RecentBadgesWidget({ language }: { language: "en" | "fr" }) {
  const isEn = language === "en";
  const { data, isLoading } = trpc.badgeShowcase.getMyBadgeProgress.useQuery(undefined, {
    staleTime: 60_000,
  });

  const recentEarned = data?.recentBadges?.slice(0, 5) || [];
  const summary = data?.summary;

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {isEn ? "Achievements" : "Accomplissements"}
        </h3>
        <Link href="/app/badges">
          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 text-xs">
            {isEn ? "View All" : "Tout voir"}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-14 h-14 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
      ) : recentEarned.length === 0 ? (
        <div className="text-center py-3">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            {isEn ? "Complete activities to earn badges!" : "Complétez des activités pour gagner des badges!"}
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center gap-3">
            {recentEarned.map((badge) => (
              <div
                key={badge.id}
                className="group hover:scale-110 transition-transform cursor-pointer"
                title={isEn ? badge.name : badge.nameFr}
              >
                <BadgeIcon
                  iconKey={badge.iconKey}
                  tier={(badge.tier || "bronze") as "bronze" | "silver" | "gold" | "platinum"}
                  gradientFrom={badge.gradientFrom}
                  gradientTo={badge.gradientTo}
                  earned={true}
                  isNew={badge.isNew}
                  size="md"
                />
              </div>
            ))}
          </div>
          {summary && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{summary.totalEarned}/{summary.totalBadges}</span>
              <span>{isEn ? "badges earned" : "badges gagnés"}</span>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}

// Clean, accessible card component - professional styling
const GlassCard = ({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <div className={`
    relative overflow-hidden rounded-xl
    bg-white dark:bg-slate-900
    border border-slate-200 dark:border-slate-700
    shadow-sm
    ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// Animated stat card with glassmorphism
const GlassStatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  sublabel,
  color = "emerald",
  delay = 0 
}: { 
  icon: React.ElementType; 
  value: string | number; 
  label: string; 
  sublabel?: string;
  color?: "emerald" | "blue" | "purple" | "amber" | "rose";
  delay?: number;
}) => {
  // Accessible color scheme with high contrast
  const colorClasses = {
    emerald: "from-slate-600 to-slate-700 text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200",
    blue: "from-slate-600 to-slate-700 text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200",
    purple: "from-slate-600 to-slate-700 text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200",
    amber: "from-slate-600 to-slate-700 text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200",
    rose: "from-slate-600 to-slate-700 text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200",
  };

  return (
    <GlassCard className="p-5">
      <div 
        className="animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color].split(' ').slice(2).join(' ')} flex items-center justify-center mb-3`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[2]}`} />
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
        {sublabel && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sublabel}</p>}
      </div>
    </GlassCard>
  );
};

// Helper to format SLE level object to string (e.g., { reading: 'B', writing: 'B', oral: 'C' } => "BBC")
function formatSLELevel(level: { reading?: string; writing?: string; oral?: string } | null | undefined): string {
  if (!level) return "XXX";
  return `${level.reading || "X"}${level.writing || "X"}${level.oral || "X"}`;
}

export default function LearnerDashboard() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  
  // Show welcome toast on first visit
  useWelcomeToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const Wrap = ({ children, className = "bg-background" }: { children: React.ReactNode; className?: string }) => {
    if (isInsideAppLayout) return <>{children}</>;
    return (
      <div className={`min-h-screen flex flex-col ${className}`}>
        <Header />
        {children}
        <Footer />
      </div>
    );
  };
  const [activeTab, setActiveTab] = useState("overview");
  const [rescheduleSession, setRescheduleSession] = useState<{
    id: number;
    coachId: number;
    coachName: string;
    date: Date;
  } | null>(null);
  const [cancelSession, setCancelSession] = useState<{
    id: number;
    coachName: string;
    date: string;
    time: string;
    price: number;
  } | null>(null);

  // Fetch learner's enrolled courses (Path Series)
  const { data: myCourses, isLoading: coursesLoading } = trpc.learner.getMyCourses.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch upcoming coaching sessions
  const { data: upcomingSessionsData, isLoading: sessionsLoading } = trpc.learner.getUpcomingSessions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch learner profile for SLE levels
  const { data: learnerProfile } = trpc.learner.getProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch velocity data for SLEVelocityWidget
  const { data: velocityData } = trpc.learner.getVelocityData.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch certification status for CertificationExpiryWidget
  const { data: certificationData } = trpc.learner.getCertificationStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch gamification data
  const { data: gamificationStats } = trpc.gamification.getMyStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch leaderboard data
  const { data: leaderboardResponse } = trpc.gamification.getLeaderboard.useQuery(
    { timeRange: "weekly", limit: 5 },
    { enabled: isAuthenticated }
  );
  const leaderboardData = leaderboardResponse?.entries;

  // Fetch user's rank
  const { data: userRank } = trpc.gamification.getUserRank.useQuery(
    { period: "weekly" },
    { enabled: isAuthenticated }
  );

  // Fetch streak details
  const { data: streakDetails } = trpc.gamification.getStreakDetails.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutation for using streak freeze
  const useStreakFreeze = trpc.gamification.useStreakFreeze.useMutation({
    onSuccess: () => {
      // Invalidate streak data to refresh
      trpc.useUtils().gamification.getStreakDetails.invalidate();
      trpc.useUtils().gamification.getMyStats.invalidate();
    },
  });

  // Use real data or fallback to empty arrays
  const upcomingSessions = upcomingSessionsData || [];
  const courses = myCourses || [];

  const recentAiSessions = [
    { id: 1, type: "Practice", language: "French", date: "2026-01-05", duration: 25 },
    { id: 2, type: "Placement", language: "French", date: "2026-01-03", duration: 15 },
  ];

  const labels = {
    en: {
      dashboard: "Learning Portal",
      welcome: "Welcome back",
      subtitle: "Continue your journey to bilingual excellence",
      upcomingSessions: "Upcoming Sessions",
      bookSession: "Book Session",
      noSessions: "No upcoming sessions",
      viewCoaches: "Find a Coach",
      currentLevel: "Current Level",
      targetLevel: "Target Level",
      daysUntilExam: "Days Until Exam",
      hoursLearned: "Hours Learned",
      continueWhere: "Continue Where You Left Off",
      viewAllCourses: "View All Courses",
      noCourses: "No courses in progress",
      exploreCourses: "Explore Courses",
      aiPractice: "AI Practice",
      startPractice: "Start Practice",
      recentSessions: "Recent AI Sessions",
      progress: "Progress",
      achievements: "Achievements",
      leaderboard: "Leaderboard",
      challenges: "Challenges",
      streak: "Learning Streak",
      xpPoints: "XP Points",
      level: "Level",
      badges: "Badges",
      nextMilestone: "Next Milestone",
      quickActions: "Quick Actions",
      practiceSimulation: "Practice Simulation",
      velocity: "Learning Velocity",
      certifications: "Certifications",
    },
    fr: {
      dashboard: "Portail d'apprentissage",
      welcome: "Bon retour",
      subtitle: "Continuez votre parcours vers l'excellence bilingue",
      upcomingSessions: "Sessions à venir",
      bookSession: "Réserver",
      noSessions: "Aucune session à venir",
      viewCoaches: "Trouver un coach",
      currentLevel: "Niveau actuel",
      targetLevel: "Niveau cible",
      daysUntilExam: "Jours avant l'examen",
      hoursLearned: "Heures d'apprentissage",
      continueWhere: "Reprendre où vous étiez",
      viewAllCourses: "Voir tous les cours",
      noCourses: "Aucun cours en cours",
      exploreCourses: "Explorer les cours",
      aiPractice: "Pratique IA",
      startPractice: "Commencer",
      recentSessions: "Sessions IA récentes",
      progress: "Progression",
      achievements: "Accomplissements",
      leaderboard: "Classement",
      challenges: "Défis",
      streak: "Série d'apprentissage",
      xpPoints: "Points XP",
      level: "Niveau",
      badges: "Badges",
      nextMilestone: "Prochain objectif",
      quickActions: "Actions rapides",
      practiceSimulation: "Simulation de Pratique",
      velocity: "Vélocité d'Apprentissage",
      certifications: "Certifications",
    },
  };

  const l = labels[language];

  // Loading state
  if (authLoading) {
    return (
      <Wrap className="bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {language === "fr" ? "Chargement de votre portail..." : "Loading your portal..."}
            </p>
          </div>
        </main>
      </Wrap>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Wrap className="bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
        <main className="flex-1 flex items-center justify-center px-4">
          <GlassCard className="max-w-md w-full p-8 text-center" hover={false}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {language === "fr" ? "Connexion requise" : "Login Required"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {language === "fr"
                ? "Connectez-vous pour accéder à votre portail d'apprentissage"
                : "Sign in to access your learning portal"}
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              <a href={getLoginUrl()}>
                {language === "fr" ? "Se connecter" : "Sign In"}
              </a>
            </Button>
          </GlassCard>
        </main>
      </Wrap>
    );
  }

  return (
    <Wrap className="bg-slate-50 dark:bg-slate-950">

      {/* Subtle decorative background - accessibility compliant */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-200/30 dark:bg-slate-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-80 h-80 bg-slate-200/20 dark:bg-slate-800/10 rounded-full blur-3xl" />
      </div>

      <main id="main-content" className="flex-1 relative">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8 max-w-[1600px] mx-auto">
          
          {/* Hero Section - Welcome Banner - Professional & Accessible */}
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-slate-800 dark:bg-slate-900 p-8 md:p-10 border border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/50" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-slate-300 text-sm font-medium">
                    {new Date().toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                    <Flame className="h-3 w-3 mr-1" />
                    7 {language === "fr" ? "jours" : "days"}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {l.welcome}, {user?.name?.split(" ")[0] || "Learner"}! 👋
                </h1>
                <p className="text-slate-300 text-lg max-w-xl">
                  {l.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <RoleSwitcherCompact />
                <Link href="/ai-practice">
                  <Button size="lg" className="bg-white text-slate-800 hover:bg-slate-100 shadow-lg">
                    <Bot className="h-5 w-5 mr-2" />
                    {l.startPractice}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <GlassStatCard
              icon={Zap}
              value="1,250"
              label={l.xpPoints}
              sublabel={language === "fr" ? "Niveau 5" : "Level 5"}
              color="amber"
              delay={0}
            />
            <GlassStatCard
              icon={Clock}
              value="12.5h"
              label={l.hoursLearned}
              sublabel={language === "fr" ? "Ce mois" : "This month"}
              color="blue"
              delay={100}
            />
            <GlassStatCard
              icon={Trophy}
              value="8"
              label={l.badges}
              sublabel={language === "fr" ? "Gagnés" : "Earned"}
              color="purple"
              delay={200}
            />
            <GlassStatCard
              icon={Target}
              value="65%"
              label={l.progress}
              sublabel="BBB → CBC"
              color="emerald"
              delay={300}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* SLE Progress Card */}
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-600" />
                    {language === "fr" ? "Progression SLE" : "SLE Progress"}
                  </h2>
                  <Link href="/app/badges">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      {language === "fr" ? "Voir les badges" : "View Badges"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <ProgressRing
                      progress={65}
                      size={160}
                      strokeWidth={14}
                      color="stroke-emerald-500"
                      label={language === "fr" ? "Progression" : "Progress"}
                      sublabel="BBB → CBC"
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4 w-full">
                    <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-white bg-clip-text text-transparent">BBB</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{l.currentLevel}</p>
                    </div>
                    <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-950/30 border border-emerald-200/50 dark:border-emerald-700/50">
                      <p className="text-3xl font-bold text-emerald-600">CBC</p>
                      <p className="text-sm text-emerald-600/70 mt-1">{l.targetLevel}</p>
                    </div>
                    <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-950/30 border border-amber-200/50 dark:border-amber-700/50">
                      <p className="text-3xl font-bold text-amber-600">45</p>
                      <p className="text-sm text-amber-600/70 mt-1">{l.daysUntilExam}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* SLE Velocity Widget - Exam Readiness Prediction */}
              <SLEVelocityWidget
                currentLevel={formatSLELevel(velocityData?.currentLevel) || "BBB"}
                targetLevel={formatSLELevel(velocityData?.targetLevel) || "CBC"}
                examDate={velocityData?.examDate ? new Date(velocityData.examDate) : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)}
                weeklyHours={velocityData?.weeklyStudyHours || 0}
                averageProgress={velocityData?.lessonsCompleted ? Math.min(velocityData.lessonsCompleted / 3, 5) : 2}
                language={language}
                className="shadow-sm"
              />

              {/* Skill Gap Heatmap */}
              <SkillGapHeatmap
                skills={[
                  { level: "A", comprehension: 85, expression: 72, interaction: 68 },
                  { level: "B", comprehension: 65, expression: 55, interaction: 48 },
                  { level: "C", comprehension: 35, expression: 28, interaction: 22 },
                ]}
                targetLevel="B"
                language={language}
                className="shadow-sm"
              />

              {/* Continue Learning Section */}
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Play className="h-5 w-5 text-blue-600" />
                    {l.continueWhere}
                  </h2>
                  <Link href="/courses">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      {l.viewAllCourses}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                {coursesLoading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {courses.slice(0, 2).map((course: any) => (
                      <Link key={course.id} href={`/courses/${course.id}`}>
                        <div className="group relative p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {course.completedLessons || 0}/{course.totalLessons || 10} {language === "fr" ? "leçons" : "lessons"}
                              </p>
                              <div className="mt-3">
                                <Progress value={(course.completedLessons || 0) / (course.totalLessons || 10) * 100} className="h-2" />
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="absolute top-5 right-5 h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{l.noCourses}</p>
                    <Link href="/courses">
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                        {l.exploreCourses}
                      </Button>
                    </Link>
                  </div>
                )}
              </GlassCard>

              {/* Upcoming Sessions */}
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    {l.upcomingSessions}
                  </h2>
                  <Link href="/coaches">
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      {l.bookSession}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                {sessionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                  </div>
                ) : upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.slice(0, 3).map((session: any) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-purple-200 dark:ring-purple-800">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-semibold">
                              {(session.coachName || "??")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{session.coachName || "Coach"}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(session.scheduledAt).toLocaleDateString(
                                language === "fr" ? "fr-CA" : "en-CA",
                                { weekday: "short", month: "short", day: "numeric" }
                              )}{" "}
                              • {new Date(session.scheduledAt).toLocaleTimeString(language === "fr" ? "fr-CA" : "en-CA", { hour: "numeric", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${session.status === "confirmed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"}`}>
                            {session.status === "confirmed" ? (language === "fr" ? "Confirmé" : "Confirmed") : (language === "fr" ? "En attente" : "Pending")}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRescheduleSession({
                              id: session.id,
                              coachId: 1,
                              coachName: session.coachName || "Coach",
                              date: new Date(session.scheduledAt),
                            })}
                            className="text-slate-500 hover:text-purple-600"
                          >
                            <CalendarClock className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{l.noSessions}</p>
                    <Link href="/coaches">
                      <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
                        {l.viewCoaches}
                      </Button>
                    </Link>
                  </div>
                )}
              </GlassCard>

              {/* Recommended Next Steps - Personalized */}
              <RecommendedNextSteps language={language} />

              {/* Activity Feed - Recent XP Activity */}
              <ActivityFeed language={language} />
            </div>

            {/* Right Column - Sidebar - Mobile responsive */}
            <div className="space-y-4 md:space-y-6">
              
              {/* Quick Actions */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  {l.quickActions}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/ai-practice">
                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/30 transition-all">
                      <Bot className="h-6 w-6 text-purple-600" />
                      <span className="text-xs font-medium">{l.aiPractice}</span>
                    </Button>
                  </Link>
                  <Link href="/coaches">
                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 transition-all">
                      <Users className="h-6 w-6 text-emerald-600" />
                      <span className="text-xs font-medium">{language === "fr" ? "Coachs" : "Coaches"}</span>
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 transition-all">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      <span className="text-xs font-medium">{language === "fr" ? "Cours" : "Courses"}</span>
                    </Button>
                  </Link>
                  <Link href="/app/badges">
                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30 transition-all">
                      <Award className="h-6 w-6 text-amber-600" />
                      <span className="text-xs font-medium">{l.badges}</span>
                    </Button>
                  </Link>
                  <Link href="/practice">
                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/30 transition-all">
                      <Gamepad2 className="h-6 w-6 text-rose-600" />
                      <span className="text-xs font-medium">{l.practiceSimulation}</span>
                    </Button>
                  </Link>
                  <Link href="/app/practice-history">
                    <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-teal-50 hover:border-teal-300 dark:hover:bg-teal-950/30 transition-all">
                      <MessageSquare className="h-6 w-6 text-teal-600" />
                      <span className="text-xs font-medium">{language === "fr" ? "Mes sessions" : "My Sessions"}</span>
                    </Button>
                  </Link>
                </div>
              </GlassCard>

              {/* Streak Protection Card */}
              <StreakRecovery
                currentStreak={streakDetails?.currentStreak ?? gamificationStats?.streak?.current ?? 0}
                longestStreak={streakDetails?.longestStreak ?? gamificationStats?.streak?.longest ?? 0}
                streakFreezes={streakDetails?.freezeCount ?? 2}
                maxFreezes={3}
                lastActivityDate={streakDetails?.lastActivityDate ? new Date(streakDetails.lastActivityDate) : undefined}
                isStreakAtRisk={streakDetails?.streakAtRisk ?? false}
                language={language}
                onUseFreeze={() => useStreakFreeze.mutate()}
              />

              {/* Recent Badges — Live from badgeShowcase API */}
              <RecentBadgesWidget language={language} />

              {/* XP Multiplier Card */}
              <XpMultiplierCard language={language} />

              {/* Next Milestone - Real Data */}
              <MilestoneProgressCard language={language} />

              {/* Certification Expiry Widget */}
              <CertificationExpiryWidget
                certifications={certificationData?.hasCertification && certificationData.certifiedLevel ? [
                  {
                    id: "cert-reading",
                    name: language === "fr" ? "ELS Lecture" : "SLE Reading",
                    level: (certificationData.certifiedLevel as any)?.reading || "X",
                    type: "reading" as const,
                    obtainedDate: certificationData.certificationDate ? new Date(certificationData.certificationDate) : new Date(),
                    expiryDate: certificationData.certificationExpiry ? new Date(certificationData.certificationExpiry) : new Date(),
                  },
                  {
                    id: "cert-writing",
                    name: language === "fr" ? "ELS Écriture" : "SLE Writing",
                    level: (certificationData.certifiedLevel as any)?.writing || "X",
                    type: "writing" as const,
                    obtainedDate: certificationData.certificationDate ? new Date(certificationData.certificationDate) : new Date(),
                    expiryDate: certificationData.certificationExpiry ? new Date(certificationData.certificationExpiry) : new Date(),
                  },
                  {
                    id: "cert-oral",
                    name: language === "fr" ? "ELS Oral" : "SLE Oral",
                    level: (certificationData.certifiedLevel as any)?.oral || "X",
                    type: "oral" as const,
                    obtainedDate: certificationData.certificationDate ? new Date(certificationData.certificationDate) : new Date(),
                    expiryDate: certificationData.certificationExpiry ? new Date(certificationData.certificationExpiry) : new Date(),
                  },
                ] : []}
                language={language}
                onRenewClick={(certId) => console.log("Renew:", certId)}
              />

              {/* Weekly Challenges */}
              <WeeklyChallenges language={language} className="col-span-1" />

              {/* Mini Leaderboard */}
              <MiniLeaderboard
                entries={leaderboardData?.map((entry) => ({
                  id: String(entry.userId),
                  rank: entry.rank,
                  name: entry.name || "Anonymous",
                  avatarUrl: entry.avatarUrl || undefined,
                  xp: entry.xp,
                  level: entry.level,
                  isCurrentUser: entry.userId === user?.id,
                })) || []}
                currentUserRank={userRank?.rank || undefined}
                totalUsers={userRank?.totalUsers || undefined}
                language={language}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {rescheduleSession && (
        <RescheduleModal
          isOpen={!!rescheduleSession}
          onClose={() => setRescheduleSession(null)}
          sessionId={rescheduleSession.id}
          coachId={rescheduleSession.coachId}
          coachName={rescheduleSession.coachName}
          currentDate={rescheduleSession.date}
        />
      )}

      {cancelSession && (
        <CancellationModal
          isOpen={!!cancelSession}
          onClose={() => setCancelSession(null)}
          // @ts-expect-error - TS2322: auto-suppressed during TS cleanup
          sessionId={cancelSession.id}
          coachName={cancelSession.coachName}
          sessionDate={cancelSession.date}
          sessionTime={cancelSession.time}
          sessionPrice={cancelSession.price}
        />
      )}
    </Wrap>
  );
}
