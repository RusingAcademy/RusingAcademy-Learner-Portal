import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Play,
  Award,
  Calendar,
  Clock,
  Video,
  ChevronRight,
  Trophy,
  Star,
  GraduationCap,
  Settings,
  Download,
  Zap,
  Headphones,
  FileText,
  HelpCircle,
  PenTool,
  Mic,
  ArrowRight,
  Sparkles,
  Target,
  Compass,
  CheckCircle2,
  Users,
  MessageSquare,
} from "lucide-react";

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

interface LearnerDashboardProps {
  user: User;
}

// ===== LESSON TYPE ICONS MAPPING =====
const LESSON_TYPE_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; labelFr: string; color: string; bgColor: string }> = {
  video: { icon: Video, label: "Video", labelFr: "Vidéo", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  audio: { icon: Headphones, label: "Audio", labelFr: "Audio", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  quiz: { icon: HelpCircle, label: "Quiz", labelFr: "Quiz", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  text: { icon: FileText, label: "Reading", labelFr: "Lecture", color: "text-slate-600", bgColor: "bg-slate-100 dark:bg-slate-900/30" },
  pdf: { icon: Download, label: "PDF", labelFr: "PDF", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
  assignment: { icon: PenTool, label: "Assignment", labelFr: "Devoir", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  download: { icon: Download, label: "Download", labelFr: "Téléchargement", color: "text-indigo-600", bgColor: "bg-indigo-100 dark:bg-indigo-900/30" },
  live_session: { icon: Users, label: "Live Session", labelFr: "Session en direct", color: "text-rose-600", bgColor: "bg-rose-100 dark:bg-rose-900/30" },
  default: { icon: BookOpen, label: "Lesson", labelFr: "Leçon", color: "text-teal-600", bgColor: "bg-teal-100 dark:bg-teal-900/30" },
};

function getLessonTypeInfo(type: string | undefined | null) {
  const key = type?.toLowerCase() || "default";
  return LESSON_TYPE_ICONS[key] || LESSON_TYPE_ICONS.default;
}

function formatDuration(minutes: number | undefined | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Course enrollment type from API
interface CourseEnrollment {
  id: number;
  courseId: number;
  title: string;
  titleFr?: string;
  description?: string | null;
  descriptionFr?: string | null;
  thumbnailUrl?: string | null;
  level?: string | null;
  category?: string | null;
  enrolledAt: Date;
  status: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: Date | null;
}

// Next lesson type from API
interface NextLesson {
  lessonId: number;
  lessonTitle: string;
  lessonTitleFr?: string | null;
  moduleTitle: string;
  moduleTitleFr?: string | null;
  duration?: number | null;
  contentType?: string | null;
}

export default function LearnerDashboardContent({ user }: LearnerDashboardProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [coursesTab, setCoursesTab] = useState("in-progress");

  // Fetch learner data
  const { data: learnerProfile, isLoading: profileLoading } = trpc.learner.getProfile.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = trpc.learner.getMyCourses.useQuery(
    undefined,
    { enabled: !!user }
  );
  const enrollments = (enrollmentsData || []) as unknown as CourseEnrollment[];
  const { data: upcomingSessions, isLoading: sessionsLoading } = trpc.learner.getUpcomingSessions.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: gamification, isLoading: gamificationLoading } = trpc.gamification.getMyStats.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: certificates, isLoading: certificatesLoading } = trpc.certificates.getMyCertificates.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Find last accessed course with progress
  const lastCourse = enrollments?.find((e: CourseEnrollment) => e.progressPercent > 0 && e.progressPercent < 100);
  const hasAnyCourse = enrollments && enrollments.length > 0;

  // Fetch next lesson for the last course
  const { data: nextLessonData, isLoading: nextLessonLoading } = trpc.learner.getNextLesson.useQuery(
    { courseId: lastCourse?.courseId || 0 },
    { enabled: !!lastCourse?.courseId }
  );
  const nextLesson = nextLessonData as NextLesson | undefined;

  const firstName = user.name?.split(" ")[0] || (isEn ? "Learner" : "Apprenant");

  // Labels
  const labels = {
    heroTitle: isEn ? "Continue Your Journey" : "Continuez Votre Parcours",
    heroSubtitle: isEn ? "Pick up right where you left off" : "Reprenez exactement là où vous en étiez",
    greeting: isEn ? `Welcome back, ${firstName}!` : `Bon retour, ${firstName}!`,
    myCourses: isEn ? "My Courses" : "Mes cours",
    inProgress: isEn ? "In Progress" : "En cours",
    completed: isEn ? "Completed" : "Terminés",
    myCoaching: isEn ? "My Coaching" : "Mon coaching",
    bookSession: isEn ? "Book a Session" : "Réserver une session",
    viewHistory: isEn ? "View History" : "Voir l'historique",
    certificates: isEn ? "Certificates" : "Certificats",
    downloadPdf: isEn ? "Download PDF" : "Télécharger PDF",
    gamification: isEn ? "Your Progress" : "Votre progression",
    xp: isEn ? "XP Points" : "Points XP",
    level: isEn ? "Level" : "Niveau",
    resume: isEn ? "Resume Now" : "Reprendre",
    browse: isEn ? "Browse Courses" : "Parcourir les cours",
    findCoach: isEn ? "Find a Coach" : "Trouver un coach",
    join: isEn ? "Join" : "Rejoindre",
    continueLearning: isEn ? "Continue Learning" : "Continuer l'apprentissage",
    nextLesson: isEn ? "Next up" : "À suivre",
    // Empty state messages
    emptyCoursesTitle: isEn ? "Your Learning Adventure Awaits" : "Votre Aventure d'Apprentissage Vous Attend",
    emptyCoursesDesc: isEn 
      ? "Start with Path I to build your foundation for SLE success. Our structured curriculum will guide you step by step."
      : "Commencez avec le Parcours I pour bâtir vos fondations pour réussir l'ELS. Notre curriculum structuré vous guidera étape par étape.",
    emptyCoursesAction: isEn ? "Explore Path Series" : "Explorer les Parcours",
    emptySessionsTitle: isEn ? "Accelerate with Expert Coaching" : "Accélérez avec un Coaching Expert",
    emptySessionsDesc: isEn
      ? "Book a 1-on-1 session with a certified SLE coach. Get personalized feedback and strategies tailored to your goals."
      : "Réservez une session 1-à-1 avec un coach ELS certifié. Obtenez des retours personnalisés et des stratégies adaptées à vos objectifs.",
    emptySessionsAction: isEn ? "Find Your Coach" : "Trouver Votre Coach",
    emptyCertsTitle: isEn ? "Earn Your First Certificate" : "Obtenez Votre Premier Certificat",
    emptyCertsDesc: isEn
      ? "Complete a module to earn a verifiable certificate. Show employers your commitment to bilingual excellence."
      : "Terminez un module pour obtenir un certificat vérifiable. Montrez aux employeurs votre engagement envers l'excellence bilingue.",
    emptyCertsAction: isEn ? "View My Courses" : "Voir Mes Cours",
    lessonsRemaining: isEn ? "lessons remaining" : "leçons restantes",
    lessonsCompleted: isEn ? "lessons completed" : "leçons terminées",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header />

      <main id="main-content" className="flex-1" role="main" aria-label={isEn ? "Learner Dashboard" : "Tableau de bord apprenant"}>
        
        {/* ===== HERO SECTION: Continue Your Journey ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="container relative py-10 md:py-14 max-w-7xl mx-auto px-4">
            {enrollmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="h-8 w-64 bg-white/20 rounded-lg" />
                  <div className="h-4 w-48 bg-white/10 rounded" />
                </div>
              </div>
            ) : lastCourse ? (
              /* User has a course in progress - Show Continue Your Journey */
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>{labels.greeting}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                    {labels.heroTitle}
                  </h1>
                  <p className="text-lg text-white/80 mb-6 max-w-xl">
                    {labels.heroSubtitle}
                  </p>
                  
                  {/* Current Course Card with Next Lesson */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 max-w-xl mx-auto lg:mx-0">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold truncate mb-1">
                          {isEn ? lastCourse.title : (lastCourse.titleFr || lastCourse.title)}
                        </h2>
                        <div className="flex items-center gap-3 mb-3">
                          <Progress value={lastCourse.progressPercent} className="flex-1 h-2 bg-white/20" />
                          <span className="text-sm font-medium">{Math.round(lastCourse.progressPercent)}%</span>
                        </div>
                        
                        {/* Next Lesson Info with Type Icon and Duration */}
                        {nextLesson && !nextLessonLoading && (
                          <div className="bg-white/10 rounded-lg p-3 mt-2">
                            <div className="text-xs text-white/60 uppercase tracking-wide mb-1">{labels.nextLesson}</div>
                            <div className="flex items-center gap-3">
                              {/* Lesson Type Icon */}
                              {(() => {
                                const typeInfo = getLessonTypeInfo(nextLesson.contentType);
                                const IconComponent = typeInfo.icon;
                                return (
                                  <div className={`h-10 w-10 rounded-lg ${typeInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                                    <IconComponent className={`h-5 w-5 ${typeInfo.color}`} />
                                  </div>
                                );
                              })()}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate text-sm">
                                  {nextLesson.lessonTitle}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                  {/* Lesson Type Label */}
                                  <span className="flex items-center gap-1">
                                    {isEn 
                                      ? getLessonTypeInfo(nextLesson.contentType).label 
                                      : getLessonTypeInfo(nextLesson.contentType).labelFr}
                                  </span>
                                  {/* Duration */}
                                  {nextLesson.duration && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(nextLesson.duration)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Primary CTA - Single Action */}
                <div className="flex-shrink-0">
                  <Link href={`/courses/${lastCourse.courseId}${nextLesson ? `?lesson=${nextLesson.lessonId}` : ''}`}>
                    <Button 
                      size="lg" 
                      className="bg-white text-teal-700 hover:bg-white/90 shadow-xl shadow-black/20 text-lg px-8 py-6 h-auto gap-3 font-semibold"
                    >
                      <Play className="h-6 w-6" />
                      {labels.resume}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* New user - no courses started - Intelligent Empty State */
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>{labels.greeting}</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {labels.emptyCoursesTitle}
                </h1>
                <p className="text-lg text-white/80 mb-8">
                  {labels.emptyCoursesDesc}
                </p>
                <Link href="/courses">
                  <Button 
                    size="lg" 
                    className="bg-white text-teal-700 hover:bg-white/90 shadow-xl shadow-black/20 text-lg px-8 py-6 h-auto gap-3 font-semibold"
                  >
                    <Compass className="h-6 w-6" />
                    {labels.emptyCoursesAction}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ===== MAIN CONTENT ===== */}
        <div className="container py-8 max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* My Courses */}
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-teal-600" />
                      {labels.myCourses}
                    </CardTitle>
                    <Link href="/courses">
                      <Button variant="ghost" size="sm" className="gap-1 text-teal-600 hover:text-teal-700">
                        {labels.browse}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={coursesTab} onValueChange={setCoursesTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="in-progress">{labels.inProgress}</TabsTrigger>
                      <TabsTrigger value="completed">{labels.completed}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="in-progress">
                      {enrollmentsLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : enrollments?.filter((e: CourseEnrollment) => e.progressPercent > 0 && e.progressPercent < 100).length ? (
                        <div className="space-y-3">
                          {enrollments.filter((e: CourseEnrollment) => e.progressPercent > 0 && e.progressPercent < 100).map((enrollment: CourseEnrollment) => (
                            <CourseCard key={enrollment.courseId} enrollment={enrollment} isEn={isEn} labels={labels} />
                          ))}
                        </div>
                      ) : hasAnyCourse ? (
                        <EmptyState
                          icon={Target}
                          title={isEn ? "All caught up!" : "Tout est à jour!"}
                          description={isEn ? "You've completed all your current courses. Ready for a new challenge?" : "Vous avez terminé tous vos cours actuels. Prêt pour un nouveau défi?"}
                          actionLabel={labels.browse}
                          actionHref="/courses"
                        />
                      ) : (
                        <EmptyState
                          icon={Compass}
                          title={labels.emptyCoursesTitle}
                          description={labels.emptyCoursesDesc}
                          actionLabel={labels.emptyCoursesAction}
                          actionHref="/courses"
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="completed">
                      {enrollments?.filter((e: CourseEnrollment) => e.progressPercent >= 100).length ? (
                        <div className="space-y-3">
                          {enrollments.filter((e: CourseEnrollment) => e.progressPercent >= 100).map((enrollment: CourseEnrollment) => (
                            <div key={enrollment.courseId} className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <Award className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{isEn ? enrollment.title : (enrollment.titleFr || enrollment.title)}</h4>
                                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  {isEn ? "Completed" : "Terminé"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          icon={Trophy}
                          title={isEn ? "Your achievements await" : "Vos accomplissements vous attendent"}
                          description={isEn ? "Complete your first course to see it here" : "Terminez votre premier cours pour le voir ici"}
                          actionLabel={labels.browse}
                          actionHref="/courses"
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Upcoming Coaching Sessions */}
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      {labels.myCoaching}
                    </CardTitle>
                    <Link href="/coaches">
                      <Button variant="ghost" size="sm" className="gap-1 text-purple-600 hover:text-purple-700">
                        {labels.findCoach}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : upcomingSessions && upcomingSessions.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingSessions.slice(0, 3).map((session: any) => (
                        <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={session.coachPhotoUrl} />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {session.coachName?.charAt(0) || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{session.coachName}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(session.scheduledAt).toLocaleDateString(isEn ? "en-CA" : "fr-CA", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {session.meetingUrl && (
                            <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700">
                                <Video className="h-4 w-4" />
                                {labels.join}
                              </Button>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={MessageSquare}
                      title={labels.emptySessionsTitle}
                      description={labels.emptySessionsDesc}
                      actionLabel={labels.emptySessionsAction}
                      actionHref="/coaches"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    {labels.certificates}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificatesLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : certificates && certificates.length > 0 ? (
                    <div className="space-y-3">
                      {certificates.slice(0, 3).map((cert: any) => (
                        <div key={cert.id} className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                          <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <Trophy className="h-6 w-6 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{cert.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(cert.issuedAt).toLocaleDateString(isEn ? "en-CA" : "fr-CA")}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            {labels.downloadPdf}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Award}
                      title={labels.emptyCertsTitle}
                      description={labels.emptyCertsDesc}
                      actionLabel={labels.emptyCertsAction}
                      actionHref="/my-learning"
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Progress Stats */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    {labels.gamification}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gamificationLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : gamification ? (
                    <>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Star className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-amber-600">{gamification.totalXp || 0}</div>
                          <div className="text-sm text-muted-foreground">{labels.xp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{gamification.level || 1}</div>
                          <div className="text-sm text-muted-foreground">{labels.level}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {isEn ? "Start learning to earn XP!" : "Commencez à apprendre pour gagner des XP!"}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{isEn ? "Quick Actions" : "Actions rapides"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/app/my-courses" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <BookOpen className="h-4 w-4 text-teal-600" />
                      {labels.continueLearning}
                    </Button>
                  </Link>
                  <Link href="/coaches" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Video className="h-4 w-4 text-purple-600" />
                      {labels.findCoach}
                    </Button>
                  </Link>
                  <Link href="/app/settings" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Settings className="h-4 w-4 text-slate-600" />
                      {isEn ? "Settings" : "Paramètres"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ===== COURSE CARD COMPONENT =====
interface CourseCardProps {
  enrollment: CourseEnrollment;
  isEn: boolean;
  labels: Record<string, string>;
}

function CourseCard({ enrollment, isEn, labels }: CourseCardProps) {
  const remainingLessons = enrollment.totalLessons - enrollment.completedLessons;

  // Fetch next lesson for this course
  const { data: nextLesson } = trpc.learner.getNextLesson.useQuery(
    { courseId: enrollment.courseId },
    { enabled: !!enrollment.courseId }
  );

  return (
    <div className="flex flex-col p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="h-7 w-7 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{isEn ? enrollment.title : (enrollment.titleFr || enrollment.title)}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {remainingLessons} {isEn ? "remaining" : "restantes"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={enrollment.progressPercent} className="flex-1 h-2" />
            <span className="text-sm font-medium text-teal-600">{Math.round(enrollment.progressPercent)}%</span>
          </div>
        </div>
        <Link href={`/courses/${enrollment.courseId}`}>
          <Button variant="outline" size="sm" className="gap-1 border-teal-200 text-teal-700 hover:bg-teal-50">
            {labels.resume}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      {/* Next Lesson Preview with Type Icon and Duration */}
      {nextLesson && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-3">
            {/* Lesson Type Icon */}
            {(() => {
              const typeInfo = getLessonTypeInfo(nextLesson.contentType);
              const IconComponent = typeInfo.icon;
              return (
                <div className={`h-9 w-9 rounded-lg ${typeInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`h-4 w-4 ${typeInfo.color}`} />
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {isEn ? "Next up" : "À suivre"}
              </div>
              <div className="font-medium truncate text-sm">
                {nextLesson.lessonTitle}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {/* Lesson Type Badge */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLessonTypeInfo(nextLesson.contentType).bgColor} ${getLessonTypeInfo(nextLesson.contentType).color}`}>
                {isEn 
                  ? getLessonTypeInfo(nextLesson.contentType).label 
                  : getLessonTypeInfo(nextLesson.contentType).labelFr}
              </span>
              {/* Duration */}
              {nextLesson.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(nextLesson.duration)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== EMPTY STATE COMPONENT =====
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="text-center py-8 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 mb-4">
        <Icon className="h-8 w-8 text-teal-600" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">{description}</p>
      <Link href={actionHref}>
        <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
