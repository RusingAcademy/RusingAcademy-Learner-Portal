/**
 * LearnLayout — Immersive Course Portal Shell
 * 
 * Inspired by the UX Blueprint: "Netflix player" mode for learning.
 * 
 * Structure:
 * - Top bar: Back to dashboard, course title, progress, settings
 * - Left sidebar: Module/lesson tree with progress indicators
 * - Main content: Rendered by child route (LessonViewer, QuizViewer, etc.)
 * - Right panel (collapsible): AI Companion for practice, vocabulary, pronunciation
 * - Bottom bar: ← Previous | Mark Complete | Next →
 * 
 * Design principles:
 * - Ultra focus: no analytics, no marketing, no distractions
 * - 18px body text, WCAG AA contrast, keyboard nav
 * - Auto-save progression, resume automatique
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LearnLayoutProvider } from "@/contexts/LearnLayoutContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import BadgesPanel from "@/components/BadgesPanel";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Keyboard,
  Lock,
  Menu,
  MessageSquare,
  Mic,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Settings,
  Sparkles,
  StickyNote,
  Video,
  Volume2,
  X,
} from "lucide-react";

// Lesson type icons for sidebar
const lessonIcons: Record<string, typeof Video> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  audio: Volume2,
  assignment: BookOpen,
  speaking: Mic,
};

// AI Companion quick actions
const aiQuickActions = [
  { id: "practice", icon: Mic, labelEn: "Practice Speaking", labelFr: "Pratique orale", color: "text-blue-500" },
  { id: "vocabulary", icon: BookOpen, labelEn: "Vocabulary Review", labelFr: "Révision vocabulaire", color: "text-emerald-500" },
  { id: "pronunciation", icon: Volume2, labelEn: "Pronunciation", labelFr: "Prononciation", color: "text-purple-500" },
  { id: "exam", icon: GraduationCap, labelEn: "Exam Simulation", labelFr: "Simulation d'examen", color: "text-amber-500" },
];

interface LearnLayoutProps {
  children: React.ReactNode;
}

export default function LearnLayout({ children }: LearnLayoutProps) {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Fetch course data
  const { data: course, isLoading: courseLoading } = trpc.courses.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Fetch progress
  const { data: progressData } = trpc.lessons.getCourseProgress.useQuery(
    { courseId: course?.id || 0 },
    { enabled: !!course?.id && isAuthenticated }
  );

  // Current lesson ID from URL
  const currentLessonId = lessonId ? parseInt(lessonId) : null;

  // Build flat lesson list for navigation
  const flatLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap((m: any) => m.lessons || []);
  }, [course]);

  const currentIndex = flatLessons.findIndex((l: any) => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
  const currentLesson = currentIndex >= 0 ? flatLessons[currentIndex] : null;

  // Progress calculation
  const progressPercent = progressData?.progressPercent || 0;
  const completedLessons = progressData?.completedLessons || 0;
  const totalLessons = progressData?.totalLessons || flatLessons.length;

  // Accurate per-lesson completion tracking from backend
  const completedLessonIds = useMemo(() => {
    return new Set<number>(progressData?.completedLessonIds || []);
  }, [progressData?.completedLessonIds]);

  const inProgressLessonIds = useMemo(() => {
    return new Set<number>(progressData?.inProgressLessonIds || []);
  }, [progressData?.inProgressLessonIds]);

  // Is current lesson completed?
  const isCurrentLessonCompleted = currentLessonId ? completedLessonIds.has(currentLessonId) : false;

  // Mark Complete mutation with optimistic update
  const utils = trpc.useUtils();
  const markCompleteMutation = trpc.lessons.markComplete.useMutation({
    onMutate: async (input: any) => {
      const lessonId = input?.lessonId;
      // Cancel outgoing refetches
      await utils.lessons.getCourseProgress.cancel({ courseId: course?.id || 0 });
      // Snapshot previous data
      const prev = utils.lessons.getCourseProgress.getData({ courseId: course?.id || 0 });
      // Optimistically update the completed lesson IDs
      if (prev) {
        utils.lessons.getCourseProgress.setData(
          { courseId: course?.id || 0 },
          {
            ...prev,
            completedLessonIds: [...prev.completedLessonIds, lessonId],
            completedLessons: prev.completedLessons + 1,
            progressPercent: prev.totalLessons > 0
              ? Math.round(((prev.completedLessons + 1) / prev.totalLessons) * 100)
              : 0,
          }
        );
      }
      return { prev };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.prev) {
        utils.lessons.getCourseProgress.setData(
          { courseId: course?.id || 0 },
          context.prev
        );
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      utils.lessons.getCourseProgress.invalidate({ courseId: course?.id || 0 });
    },
  });

  const handleMarkComplete = useCallback(() => {
    if (!currentLessonId || isCurrentLessonCompleted) return;
    markCompleteMutation.mutate({ lessonId: currentLessonId });
  }, [currentLessonId, isCurrentLessonCompleted, markCompleteMutation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.altKey && e.key === "ArrowLeft" && prevLesson) {
        e.preventDefault();
        setLocation(`/learn/${slug}/lessons/${prevLesson.id}`);
      }
      if (e.altKey && e.key === "ArrowRight" && nextLesson) {
        e.preventDefault();
        setLocation(`/learn/${slug}/lessons/${nextLesson.id}`);
      }
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        setAiPanelOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevLesson, nextLesson, slug, setLocation]);

  // Navigate to lesson
  const navigateToLesson = useCallback((id: number) => {
    setLocation(`/learn/${slug}/lessons/${id}`);
    setSidebarMobileOpen(false);
  }, [slug, setLocation]);

  // Loading state
  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{isEn ? "Loading course..." : "Chargement du cours..."}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">{isEn ? "Course not found" : "Cours introuvable"}</h2>
          <Button onClick={() => setLocation("/paths")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEn ? "Back to Paths" : "Retour aux parcours"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ═══════════════════════════════════════════════════════
          TOP BAR — Course title, progress, navigation, AI toggle
          ═══════════════════════════════════════════════════════ */}
      <header className="h-14 border-b bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3 flex-shrink-0 z-40">
        {/* Left: Back + Sidebar toggle */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setLocation("/my-learning")}
                  aria-label={isEn ? "Back to dashboard" : "Retour au tableau de bord"}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isEn ? "Back to Dashboard" : "Retour au tableau de bord"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6" />

          {/* Sidebar toggle (desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Sidebar toggle (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setSidebarMobileOpen(true)}
            aria-label="Open course menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Center: Course title + progress */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-sm font-medium truncate hidden sm:block max-w-[300px]">
            {course.title}
          </span>
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-2 ml-auto mr-4">
              <Progress value={progressPercent} className="w-28 h-2" aria-label="Course progress" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {completedLessons}/{totalLessons} {isEn ? "lessons" : "leçons"}
              </span>
            </div>
          )}
        </div>

        {/* Right: AI Companion toggle + Keyboard shortcuts */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={aiPanelOpen ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAiPanelOpen(!aiPanelOpen)}
                  aria-label={isEn ? "AI Learning Assistant" : "Assistant IA d'apprentissage"}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isEn ? "AI Learning Assistant (Alt+A)" : "Assistant IA (Alt+A)"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden lg:flex"
                  aria-label="Keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1 text-xs">
                  <p><kbd className="px-1 bg-muted rounded">Alt+←</kbd> {isEn ? "Previous lesson" : "Leçon précédente"}</p>
                  <p><kbd className="px-1 bg-muted rounded">Alt+→</kbd> {isEn ? "Next lesson" : "Leçon suivante"}</p>
                  <p><kbd className="px-1 bg-muted rounded">Alt+S</kbd> {isEn ? "Toggle sidebar" : "Barre latérale"}</p>
                  <p><kbd className="px-1 bg-muted rounded">Alt+A</kbd> {isEn ? "AI Assistant" : "Assistant IA"}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MAIN AREA — Sidebar + Content + AI Panel
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT SIDEBAR: Module/Lesson Tree (desktop) ─── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden md:flex flex-col border-r bg-muted/20 overflow-hidden flex-shrink-0"
              role="navigation"
              aria-label={isEn ? "Course navigation" : "Navigation du cours"}
            >
              {/* Sidebar header */}
              <div className="p-4 border-b bg-gradient-to-b from-muted/40 to-transparent">
                <h2 className="font-semibold text-sm truncate flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#0F3D3E]" />
                  {isEn ? "Course Content" : "Contenu du cours"}
                </h2>
                {isAuthenticated && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground">{isEn ? "Your Progress" : "Votre progression"}</span>
                      <span className="text-[10px] font-bold text-[#0F3D3E]">{progressPercent}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-border/50 overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${progressPercent}%`,
                          background: 'linear-gradient(90deg, #0F3D3E, #1E6B4F)'
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {completedLessons}/{totalLessons} {isEn ? "lessons completed" : "le\u00e7ons termin\u00e9es"}
                    </p>
                  </div>
                )}
              </div>

              {/* Module/Lesson tree */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                  {course.modules?.map((module: any, moduleIndex: number) => (
                    <div key={module.id}>
                      {/* Module header */}
                      <div className="flex items-start gap-2 mb-2 px-2 py-1.5 rounded-lg bg-muted/30 border border-border/30">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#0F3D3E] to-[#145A5B] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-white">{moduleIndex + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
                            {module.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {module.lessons?.length || 0} {isEn ? "lessons" : "le\u00e7ons"}
                          </span>
                        </div>
                      </div>

                      {/* Lessons */}
                      <div className="space-y-0.5">
                        {module.lessons?.map((lesson: any) => {
                          const isActive = lesson.id === currentLessonId;
                          const isCompleted = completedLessonIds.has(lesson.id);
                          const isInProgress = inProgressLessonIds.has(lesson.id);
                          const isLocked = false; // TODO: check enrollment + drip
                          const Icon = lessonIcons[lesson.contentType || "video"] || Video;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => !isLocked && navigateToLesson(lesson.id)}
                              disabled={isLocked}
                              aria-current={isActive ? "page" : undefined}
                              className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : isLocked
                                  ? "text-muted-foreground/50 cursor-not-allowed"
                                  : isCompleted
                                  ? "text-muted-foreground hover:bg-muted"
                                  : "hover:bg-muted"
                              }`}
                            >
                              {/* Status icon */}
                              <span className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" aria-label={isEn ? "Completed" : "Terminé"} />
                                ) : isLocked ? (
                                  <Lock className="h-3.5 w-3.5" aria-label={isEn ? "Locked" : "Verrouillé"} />
                                ) : isActive ? (
                                  <Play className="h-3.5 w-3.5 fill-current" aria-label={isEn ? "Current" : "En cours"} />
                                ) : isInProgress ? (
                                  <Circle className="h-3.5 w-3.5 text-blue-500 fill-blue-500/20" aria-label={isEn ? "In Progress" : "En cours"} />
                                ) : (
                                  <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                              </span>

                              {/* Title */}
                              <span className={`flex-1 truncate text-[13px] leading-tight ${isCompleted && !isActive ? "line-through opacity-60" : ""}`}>
                                {lesson.title}
                              </span>

                              {/* Duration */}
                              {lesson.videoDurationSeconds && (
                                <span className="text-[10px] opacity-50 flex-shrink-0">
                                  {Math.round(lesson.videoDurationSeconds / 60)}m
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Badges Panel */}
              <BadgesPanel mode="compact" language={isEn ? "en" : "fr"} />

              {/* Sidebar footer: Quick links */}
              <div className="p-3 border-t space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => setLocation(`/learn/${slug}`)}
                >
                  <BookOpen className="h-3.5 w-3.5 mr-2" />
                  {isEn ? "Course Overview" : "Aperçu du cours"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => setLocation("/app/my-courses")}
                >
                  <StickyNote className="h-3.5 w-3.5 mr-2" />
                  {isEn ? "My Notes" : "Mes notes"}
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ─── MOBILE SIDEBAR (Sheet overlay) ─── */}
        <Sheet open={sidebarMobileOpen} onOpenChange={setSidebarMobileOpen}>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="p-4 border-b bg-gradient-to-b from-muted/40 to-transparent">
              <SheetTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#0F3D3E]" />
                {isEn ? "Course Content" : "Contenu du cours"}
              </SheetTitle>
              {isAuthenticated && (
                <div className="mt-2 space-y-1">
                  <div className="relative h-1.5 rounded-full bg-border/50 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #0F3D3E, #1E6B4F)' }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{completedLessons}/{totalLessons} {isEn ? "completed" : "termin\u00e9es"}</p>
                </div>
              )}
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-3 space-y-4">
                {course.modules?.map((module: any, moduleIndex: number) => (
                  <div key={module.id}>
                    <div className="flex items-start gap-2 mb-2 px-2 py-1.5 rounded-lg bg-muted/30 border border-border/30">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#0F3D3E] to-[#145A5B] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-white">{moduleIndex + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{module.title}</span>
                        <span className="text-[10px] text-muted-foreground">{module.lessons?.length || 0} {isEn ? "lessons" : "le\u00e7ons"}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {module.lessons?.map((lesson: any) => {
                        const isActive = lesson.id === currentLessonId;
                        const isCompleted = completedLessonIds.has(lesson.id);
                        const Icon = lessonIcons[lesson.contentType || "video"] || Video;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => navigateToLesson(lesson.id)}
                            aria-current={isActive ? "page" : undefined}
                            className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left text-sm transition-all ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : isCompleted
                                ? "text-muted-foreground hover:bg-muted"
                                : "hover:bg-muted"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : isActive ? (
                              <Play className="h-3.5 w-3.5 fill-current flex-shrink-0" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 flex-shrink-0" />
                            )}
                            <span className="flex-1 truncate text-[13px]">{lesson.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* ─── MAIN CONTENT AREA ─── */}
        <main className="flex-1 overflow-y-auto" role="main" style={{ fontSize: "18px" }}>
          <LearnLayoutProvider
            courseSlug={slug || ""}
            navigateToLesson={navigateToLesson}
            onLessonComplete={() => {
              // Trigger progress refetch when a lesson is completed
              // The tRPC cache will be invalidated by the mutation
            }}
          >
            {children}
          </LearnLayoutProvider>
        </main>

        {/* ─── RIGHT PANEL: AI Learning Companion (desktop) ─── */}
        <AnimatePresence>
          {aiPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden lg:flex flex-col border-l bg-background overflow-hidden flex-shrink-0"
              role="complementary"
              aria-label={isEn ? "AI Learning Assistant" : "Assistant IA d'apprentissage"}
            >
              {/* AI Panel Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{isEn ? "AI Learning Assistant" : "Assistant IA"}</h3>
                    <p className="text-[10px] text-muted-foreground">{isEn ? "Your personal study companion" : "Votre compagnon d'étude"}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setAiPanelOpen(false)}
                  aria-label="Close AI panel"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions Grid */}
              <div className="p-4 border-b">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  {isEn ? "Quick Actions" : "Actions rapides"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {aiQuickActions.map((action) => (
                    <button
                      key={action.id}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-muted transition-colors text-center"
                      onClick={() => {
                        // Navigate to the appropriate practice page
                        if (action.id === "practice") setLocation("/conversation-practice");
                        else if (action.id === "exam") setLocation("/sle-diagnostic");
                        else if (action.id === "vocabulary") setLocation("/sle-diagnostic");
                        else if (action.id === "pronunciation") setLocation("/sle-diagnostic");
                      }}
                    >
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                      <span className="text-[11px] font-medium leading-tight">
                        {isEn ? action.labelEn : action.labelFr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contextual AI Chat */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Welcome message */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="text-sm leading-relaxed">
                          <p className="font-medium mb-1">
                            {isEn ? "Hi! I'm your AI study companion." : "Bonjour ! Je suis votre compagnon d'étude IA."}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {isEn
                              ? "I can help you practice speaking, review vocabulary, check pronunciation, or simulate an SLE exam. Choose a quick action above or ask me anything about this lesson."
                              : "Je peux vous aider à pratiquer l'oral, réviser le vocabulaire, vérifier la prononciation ou simuler un examen ELS. Choisissez une action rapide ci-dessus ou posez-moi une question sur cette leçon."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current lesson context */}
                    {currentLesson && (
                      <div className="border rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                          {isEn ? "Current Lesson" : "Leçon en cours"}
                        </p>
                        <p className="text-sm font-medium">{currentLesson.title}</p>
                        {currentLesson.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{currentLesson.description}</p>
                        )}
                      </div>
                    )}

                    {/* Suggested prompts */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {isEn ? "Try asking:" : "Essayez de demander :"}
                      </p>
                      {[
                        isEn ? "Explain this lesson in simpler terms" : "Explique cette leçon plus simplement",
                        isEn ? "Give me practice exercises" : "Donne-moi des exercices de pratique",
                        isEn ? "What are the key takeaways?" : "Quels sont les points clés ?",
                        isEn ? "Test me on this topic" : "Teste-moi sur ce sujet",
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          className="w-full text-left text-xs px-3 py-2 rounded-md border hover:bg-muted transition-colors"
                          onClick={() => {
                            // TODO: Send to AI chat
                          }}
                        >
                          <MessageSquare className="h-3 w-3 inline mr-2 text-muted-foreground" />
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chat input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isEn ? "Ask your AI assistant..." : "Posez une question à l'IA..."}
                      className="flex-1 text-sm px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          // TODO: Send message to AI
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button size="icon" className="h-9 w-9 flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

          {/* ═══════════════════════════════════════════════════
          BOTTOM CONTROL BAR — Previous | Mark Complete | Next
          ═══════════════════════════════════════════════════ */}
      {currentLessonId && (
        <footer className="h-14 border-t bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0 z-30 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
          {/* Previous */}
          <Button
            variant="ghost"
            size="sm"
            disabled={!prevLesson}
            onClick={() => prevLesson && navigateToLesson(prevLesson.id)}
            className="gap-1 min-w-[100px] justify-start"
            aria-label={isEn ? "Previous lesson" : "Leçon précédente"}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline truncate">{prevLesson ? (isEn ? "Previous" : "Précédent") : ""}</span>
          </Button>

          {/* Center: Mark Complete + progress */}
          <div className="flex items-center gap-3">
            {isAuthenticated && currentLessonId && (
              <Button
                variant={isCurrentLessonCompleted ? "outline" : "default"}
                size="sm"
                disabled={markCompleteMutation.isPending}
                onClick={handleMarkComplete}
                className={`gap-2 transition-all duration-300 ${
                  isCurrentLessonCompleted
                    ? "border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 shadow-sm"
                    : "bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] hover:opacity-90 text-white shadow-md shadow-[#0F3D3E]/20"
                }`}
              >
                {markCompleteMutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isCurrentLessonCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isCurrentLessonCompleted
                    ? (isEn ? "Completed" : "Terminé")
                    : (isEn ? "Mark Complete" : "Marquer terminé")
                  }
                </span>
              </Button>
            )}
            <div className="md:hidden flex items-center gap-2">
              <Progress value={progressPercent} className="w-16 h-1.5" />
              <span className="text-[10px] text-muted-foreground">{progressPercent}%</span>
            </div>
          </div>

          {/* Next */}
          <Button
            variant={isCurrentLessonCompleted && nextLesson ? "default" : "ghost"}
            size="sm"
            disabled={!nextLesson}
            onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
            className={`gap-1 min-w-[100px] justify-end transition-all duration-300 ${
              isCurrentLessonCompleted && nextLesson 
                ? "bg-gradient-to-r from-[#C65A1E] to-[#E06B2D] hover:opacity-90 text-white shadow-md shadow-[#C65A1E]/20" 
                : ""
            }`}
            aria-label={isEn ? "Next lesson" : "Leçon suivante"}
          >
            <span className="hidden sm:inline truncate">
              {nextLesson
                ? (isEn ? "Next" : "Suivant")
                : (isEn ? "Course Complete!" : "Cours terminé !")}
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </footer>
      )}
    </div>
  );
}
