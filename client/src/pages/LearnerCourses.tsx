/**
 * Learner Courses Page
 * 
 * Displays all enrolled courses with progress tracking, completion status,
 * and quick access to continue learning.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  Play,
  ArrowRight,
  GraduationCap,
  Trophy,
  Target,
  Sparkles,
  ChevronRight,
  Filter,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Input } from "@/components/ui/input";

// Glass card component for consistent styling
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

export default function LearnerCourses() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch learner's enrolled courses
  const { data: myCourses, isLoading: coursesLoading } = trpc.learner.getMyCourses.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch coaching plans
  const { data: coachingPlans, isLoading: plansLoading } = trpc.learner.getMyCoachingPlans.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const courses = myCourses || [];
  const plans = coachingPlans || [];

  // Filter courses based on search and tab
  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "in-progress") return matchesSearch && course.progressPercent > 0 && course.progressPercent < 100;
    if (activeTab === "completed") return matchesSearch && course.progressPercent === 100;
    if (activeTab === "not-started") return matchesSearch && course.progressPercent === 0;
    return matchesSearch;
  });

  const labels = {
    en: {
      title: "My Courses",
      subtitle: "Track your progress and continue learning",
      allCourses: "All Courses",
      inProgress: "In Progress",
      completed: "Completed",
      notStarted: "Not Started",
      searchPlaceholder: "Search courses...",
      noCourses: "No courses yet",
      noCoursesDesc: "Start your learning journey by enrolling in a course",
      exploreCourses: "Explore Courses",
      progress: "Progress",
      lessons: "lessons",
      completedOn: "Completed on",
      enrolledOn: "Enrolled on",
      lastAccessed: "Last accessed",
      continueLearning: "Continue Learning",
      startCourse: "Start Course",
      viewCertificate: "View Certificate",
      coachingPlans: "Coaching Plans",
      sessionsRemaining: "sessions remaining",
      validUntil: "Valid until",
      bookSession: "Book Session",
      noPlans: "No coaching plans",
      noPlansDesc: "Upgrade your learning with personalized coaching",
      viewPlans: "View Plans",
      expired: "Expired",
      active: "Active",
    },
    fr: {
      title: "Mes Cours",
      subtitle: "Suivez votre progression et continuez à apprendre",
      allCourses: "Tous les cours",
      inProgress: "En cours",
      completed: "Terminés",
      notStarted: "Non commencés",
      searchPlaceholder: "Rechercher des cours...",
      noCourses: "Aucun cours",
      noCoursesDesc: "Commencez votre parcours d'apprentissage en vous inscrivant à un cours",
      exploreCourses: "Explorer les cours",
      progress: "Progression",
      lessons: "leçons",
      completedOn: "Terminé le",
      enrolledOn: "Inscrit le",
      lastAccessed: "Dernier accès",
      continueLearning: "Continuer",
      startCourse: "Commencer",
      viewCertificate: "Voir le certificat",
      coachingPlans: "Plans de coaching",
      sessionsRemaining: "séances restantes",
      validUntil: "Valide jusqu'au",
      bookSession: "Réserver",
      noPlans: "Aucun plan de coaching",
      noPlansDesc: "Améliorez votre apprentissage avec un coaching personnalisé",
      viewPlans: "Voir les plans",
      expired: "Expiré",
      active: "Actif",
    },
  };

  const l = labels[language];

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {language === "fr" ? "Chargement..." : "Loading..."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <GlassCard className="max-w-md w-full p-8 text-center" hover={false}>
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {language === "fr" ? "Connexion requise" : "Login Required"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {language === "fr"
                ? "Connectez-vous pour accéder à vos cours"
                : "Sign in to access your courses"}
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
              <a href={getLoginUrl()}>
                {language === "fr" ? "Se connecter" : "Sign In"}
              </a>
            </Button>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 relative">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8 max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  {l.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{l.subtitle}</p>
              </div>
              <Link href="/curriculum">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {l.exploreCourses}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{courses.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === "fr" ? "Cours inscrits" : "Enrolled Courses"}
                  </p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {courses.filter((c: any) => c.progressPercent > 0 && c.progressPercent < 100).length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{l.inProgress}</p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {courses.filter((c: any) => c.progressPercent === 100).length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{l.completed}</p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {plans.filter((p: any) => p.status === "active").length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === "fr" ? "Plans actifs" : "Active Plans"}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Courses Section */}
          <GlassCard className="p-6 mb-8" hover={false}>
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={l.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-10 w-10"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-10 w-10"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-4 max-w-lg">
                <TabsTrigger value="all">{l.allCourses}</TabsTrigger>
                <TabsTrigger value="in-progress">{l.inProgress}</TabsTrigger>
                <TabsTrigger value="completed">{l.completed}</TabsTrigger>
                <TabsTrigger value="not-started">{l.notStarted}</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Courses Grid/List */}
            {coursesLoading ? (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredCourses.map((course: any) => (
                  viewMode === "grid" ? (
                    <CourseCardGrid key={course.id} course={course} language={language} labels={l} />
                  ) : (
                    <CourseCardList key={course.id} course={course} language={language} labels={l} />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{l.noCourses}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{l.noCoursesDesc}</p>
                <Link href="/curriculum">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    {l.exploreCourses}
                  </Button>
                </Link>
              </div>
            )}
          </GlassCard>

          {/* Coaching Plans Section */}
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                {l.coachingPlans}
              </h2>
              <Link href="/ecosystem">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  {l.viewPlans}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {plansLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : plans.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan: any) => (
                  <CoachingPlanCard key={plan.id} plan={plan} language={language} labels={l} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{l.noPlans}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{l.noPlansDesc}</p>
                <Link href="/ecosystem">
                  <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                    {l.viewPlans}
                  </Button>
                </Link>
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Course Card - Grid View
function CourseCardGrid({ course, language, labels }: { course: any; language: string; labels: any }) {
  const isCompleted = course.progressPercent === 100;
  const isStarted = course.progressPercent > 0;

  return (
    <Link href={`/curriculum/${course.courseId || course.id}`}>
      <div className="group relative h-full p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isCompleted ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {language === "fr" ? "Terminé" : "Completed"}
            </Badge>
          ) : isStarted ? (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <Play className="h-3 w-3 mr-1" />
              {labels.inProgress}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500">
              {labels.notStarted}
            </Badge>
          )}
        </div>

        {/* Course Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
          <BookOpen className="h-7 w-7 text-white" />
        </div>

        {/* Course Info */}
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
          {course.description || (language === "fr" ? "Cours de langue professionnelle" : "Professional language course")}
        </p>

        {/* Progress */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">
              {course.completedLessons || 0}/{course.totalLessons || 0} {labels.lessons}
            </span>
            <span className="font-semibold text-blue-600">{course.progressPercent || 0}%</span>
          </div>
          <Progress value={course.progressPercent || 0} className="h-2" />
        </div>

        {/* Enrolled Date */}
        <p className="text-xs text-slate-400 mt-3">
          {labels.enrolledOn} {new Date(course.enrolledAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA")}
        </p>
      </div>
    </Link>
  );
}

// Course Card - List View
function CourseCardList({ course, language, labels }: { course: any; language: string; labels: any }) {
  const isCompleted = course.progressPercent === 100;
  const isStarted = course.progressPercent > 0;

  return (
    <Link href={`/curriculum/${course.courseId || course.id}`}>
      <div className="group flex items-center gap-6 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
        {/* Course Icon */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-8 w-8 text-white" />
        </div>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {course.description || (language === "fr" ? "Cours de langue professionnelle" : "Professional language course")}
              </p>
            </div>
            
            {/* Status Badge */}
            {isCompleted ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex-shrink-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {language === "fr" ? "Terminé" : "Completed"}
              </Badge>
            ) : isStarted ? (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 flex-shrink-0">
                <Play className="h-3 w-3 mr-1" />
                {labels.inProgress}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500 flex-shrink-0">
                {labels.notStarted}
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1">
              <Progress value={course.progressPercent || 0} className="h-2" />
            </div>
            <span className="text-sm font-semibold text-blue-600 w-12 text-right">
              {course.progressPercent || 0}%
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span>{course.completedLessons || 0}/{course.totalLessons || 0} {labels.lessons}</span>
            <span>•</span>
            <span>{labels.enrolledOn} {new Date(course.enrolledAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA")}</span>
          </div>
        </div>

        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

// Coaching Plan Card
function CoachingPlanCard({ plan, language, labels }: { plan: any; language: string; labels: any }) {
  const isExpired = new Date(plan.expiresAt) < new Date();
  const isActive = plan.status === "active" && !isExpired;

  // Determine plan tier for styling
  const planTier = plan.planId?.includes("immersion") ? "premium" : plan.planId?.includes("accelerator") ? "standard" : "starter";
  const tierColors = {
    premium: "from-amber-500 to-orange-600",
    standard: "from-teal-500 to-emerald-600",
    starter: "from-indigo-500 to-purple-600",
  };

  return (
    <div className={`relative p-5 rounded-xl border ${isActive ? 'border-purple-200 dark:border-purple-800' : 'border-slate-200 dark:border-slate-700 opacity-75'} bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <Badge className={isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
          {isActive ? labels.active : labels.expired}
        </Badge>
      </div>

      {/* Plan Icon */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierColors[planTier]} flex items-center justify-center mb-4`}>
        <Trophy className="h-6 w-6 text-white" />
      </div>

      {/* Plan Info */}
      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{plan.planName}</h3>
      
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
        <span className="font-bold text-purple-600">{plan.remainingSessions}</span>
        <span>{labels.sessionsRemaining}</span>
      </div>

      {/* Expiry */}
      <p className="text-xs text-slate-400 mb-4">
        {labels.validUntil} {new Date(plan.expiresAt).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA")}
      </p>

      {/* CTA */}
      {isActive && plan.remainingSessions > 0 && (
        <Link href="/coaches">
          <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
            {labels.bookSession}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      )}
    </div>
  );
}
