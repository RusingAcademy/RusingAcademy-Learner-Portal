/**
 * LearnPortal — Premium Course Hub inside the Immersive Learn Shell
 *
 * Phase 3 Kajabi Premier-caliber design with:
 * - 16:9 hero banner with glassmorphism overlay
 * - Animated progress ring + earned badges
 * - Module accordion with per-lesson 7-slot indicators
 * - Slot-level progress tracking (filled dots for completed slots)
 * - Bilingual EN/FR support
 * - Auto-resume to last accessed lesson
 * - Start Course / Continue Learning CTA
 * - Course stats footer with glassmorphism
 *
 * Route: /learn/:slug (wrapped by LearnLayout)
 */
import { useState, useEffect, useMemo } from "react";
import LearnLayout from "@/components/LearnLayout";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  HelpCircle,
  Lock,
  Mic,
  PlayCircle,
  Trophy,
  Video,
  Sparkles,
  Lightbulb,
  PenLine,
  ChevronRight,
  Award,
  Layers,
  Target,
  Zap,
  Star,
  Play,
  Shield,
} from "lucide-react";

// ─── 7-Slot Template Definition ─────────────────────────────────
const SLOT_TEMPLATE = [
  { index: 1, type: "introduction", label: "Introduction", labelFr: "Accroche", icon: Lightbulb, color: "#F59E0B", bg: "bg-amber-500/10", textColor: "text-amber-500" },
  { index: 2, type: "video_scenario", label: "Video", labelFr: "Vidéo", icon: Video, color: "#3B82F6", bg: "bg-blue-500/10", textColor: "text-blue-500" },
  { index: 3, type: "grammar_strategy", label: "Grammar", labelFr: "Grammaire", icon: BookOpen, color: "#10B981", bg: "bg-emerald-500/10", textColor: "text-emerald-500" },
  { index: 4, type: "written_practice", label: "Written", labelFr: "Écrit", icon: PenLine, color: "#8B5CF6", bg: "bg-purple-500/10", textColor: "text-purple-500" },
  { index: 5, type: "oral_practice", label: "Oral", labelFr: "Oral", icon: Mic, color: "#F43F5E", bg: "bg-rose-500/10", textColor: "text-rose-500" },
  { index: 6, type: "quiz", label: "Quiz", labelFr: "Quiz", icon: HelpCircle, color: "#F97316", bg: "bg-orange-500/10", textColor: "text-orange-500" },
  { index: 7, type: "coaching_tip", label: "Coach Tip", labelFr: "Conseil", icon: Sparkles, color: "#14B8A6", bg: "bg-teal-500/10", textColor: "text-teal-500" },
];

// ─── Animated Progress Ring ─────────────────────────────────────
function ProgressRing({
  percent,
  size = 96,
  strokeWidth = 7,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/15"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#17E2C6" />
            <stop offset="100%" stopColor="#C65A1E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          {percent}%
        </motion.span>
        <span className="text-[10px] text-white/50 uppercase tracking-wider">
          complete
        </span>
      </div>
    </div>
  );
}

// ─── Slot Indicator Row (per-lesson, with completion status) ────
function SlotIndicators({
  lessonActivities,
  completedActivityIds,
  language,
}: {
  lessonActivities: any[];
  completedActivityIds: Set<number>;
  language: string;
}) {
  const isEn = language === "en";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0.5 mt-1.5">
        {SLOT_TEMPLATE.map((slot) => {
          const activity = lessonActivities.find(
            (a: any) => a.slotIndex === slot.index
          );
          const filled = !!activity;
          const completed = activity && completedActivityIds.has(activity.id);
          const Icon = slot.icon;

          return (
            <Tooltip key={slot.index}>
              <TooltipTrigger asChild>
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all relative ${
                    completed
                      ? "bg-emerald-500/15 ring-1 ring-emerald-500/30"
                      : filled
                      ? `${slot.bg} ring-1 ring-border/30`
                      : "bg-muted/30"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Icon
                      className={`h-3 w-3 ${
                        filled ? slot.textColor : "text-muted-foreground/30"
                      }`}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <span className="font-medium">
                  {slot.index}. {isEn ? slot.label : slot.labelFr}
                </span>
                {completed && (
                  <span className="ml-1 text-emerald-400">✓</span>
                )}
                {!filled && (
                  <span className="ml-1 text-muted-foreground">
                    ({isEn ? "empty" : "vide"})
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {/* Extra activities indicator */}
        {lessonActivities.filter((a: any) => a.slotIndex > 7).length > 0 && (
          <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
            +{lessonActivities.filter((a: any) => a.slotIndex > 7).length}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────
function PortalSkeleton() {
  return (
    <div className="min-h-full animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-[#0F3D3E] via-[#145A5B] to-[#0F3D3E] px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="w-full h-48 rounded-2xl bg-white/10 mb-6" />
          <Skeleton className="h-8 w-2/3 bg-white/10 mb-3" />
          <Skeleton className="h-4 w-1/2 bg-white/10 mb-6" />
          <Skeleton className="h-10 w-40 bg-white/10 rounded-lg" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function LearnPortal() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";

  // Fetch course data
  const { data: course, isLoading: courseLoading } =
    trpc.courses.getBySlug.useQuery(
      { slug: slug || "" },
      { enabled: !!slug }
    );

  // Check enrollment
  const utils = trpc.useUtils();
  const { data: enrollment, isLoading: enrollmentLoading } =
    trpc.courses.getEnrollment.useQuery(
      { courseId: course?.id || 0 },
      { enabled: !!course?.id && isAuthenticated }
    );

  // Auto-enroll for free courses
  const enrollFreeMutation = trpc.courses.enrollFree.useMutation({
    onSuccess: () => {
      utils.courses.getEnrollment.invalidate({ courseId: course?.id || 0 });
    },
  });

  const [autoEnrollAttempted, setAutoEnrollAttempted] = useState(false);
  useEffect(() => {
    if (
      autoEnrollAttempted ||
      enrollmentLoading ||
      !course?.id ||
      !isAuthenticated
    )
      return;
    if (enrollment) return;
    if ((course.price || 0) === 0) {
      setAutoEnrollAttempted(true);
      enrollFreeMutation.mutate({ courseId: course.id });
    }
  }, [course, enrollment, enrollmentLoading, isAuthenticated, autoEnrollAttempted]);

  // Fetch progress (only when enrolled)
  const { data: progress } = trpc.lessons.getCourseProgress.useQuery(
    { courseId: course?.id || 0 },
    { enabled: !!course?.id && isAuthenticated && !!enrollment }
  );

  // Fetch published activities for the course (public endpoint for slot indicators)
  const { data: courseActivities } =
    trpc.activities.getActivitiesByCourse.useQuery(
      { courseId: course?.id || 0 },
      { enabled: !!course?.id }
    );

  // Fetch activity-level progress for completed slot indicators
  const { data: activityProgressData } =
    trpc.activities.getUserActivityProgress.useQuery(
      { courseId: course?.id || 0 },
      { enabled: !!course?.id && isAuthenticated && !!enrollment }
    );

  // Build activities-by-lesson map
  const activitiesByLesson = useMemo(() => {
    const map: Record<number, any[]> = {};
    if (courseActivities && Array.isArray(courseActivities)) {
      courseActivities.forEach((a: any) => {
        if (!map[a.lessonId]) map[a.lessonId] = [];
        map[a.lessonId].push(a);
      });
    }
    return map;
  }, [courseActivities]);

  // Build completed activity IDs set
  const completedActivityIds = useMemo(() => {
    const set = new Set<number>();
    if (activityProgressData && Array.isArray(activityProgressData)) {
      activityProgressData.forEach((ap: any) => {
        if (ap.status === "completed") set.add(ap.activityId);
      });
    }
    return set;
  }, [activityProgressData]);

  const progressPercent = progress?.progressPercent || 0;
  const completedLessons = progress?.completedLessons || 0;
  const totalLessons = progress?.totalLessons || 0;

  // Auto-resume: redirect to last accessed or next incomplete lesson
  const [hasAutoResumed, setHasAutoResumed] = useState(false);
  useEffect(() => {
    if (hasAutoResumed || !progress || !slug || !isAuthenticated) return;
    if (progress.completedLessons === 0 && !progress.lastAccessedLesson) return;
    // Don't auto-resume — let user see the overview first
    // They can click "Continue Learning" to resume
  }, [progress, slug, isAuthenticated, hasAutoResumed, setLocation]);

  // Completed lesson IDs for per-lesson status
  const completedLessonIdSet = useMemo(
    () => new Set(progress?.completedLessonIds || []),
    [progress?.completedLessonIds]
  );
  const inProgressLessonIdSet = useMemo(
    () => new Set(progress?.inProgressLessonIds || []),
    [progress?.inProgressLessonIds]
  );

  // Total course duration
  const totalDurationMinutes = useMemo(() => {
    if (!course?.modules) return 0;
    return (
      course.modules.reduce(
        (acc: number, m: any) =>
          acc +
          (m.lessons?.reduce(
            (a: number, l: any) => a + (l.videoDurationSeconds || 0),
            0
          ) || 0),
        0
      ) / 60
    );
  }, [course]);

  // Total activities count
  const totalActivities = useMemo(() => {
    return Object.values(activitiesByLesson).reduce(
      (acc, arr) => acc + arr.length,
      0
    );
  }, [activitiesByLesson]);

  // Determine CTA state
  const hasStarted = completedLessons > 0 || !!progress?.lastAccessedLesson;
  const isComplete = progressPercent === 100;

  if (courseLoading) {
    return (
      <LearnLayout>
        <PortalSkeleton />
      </LearnLayout>
    );
  }

  if (!course) {
    return (
      <LearnLayout>
        <div className="min-h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {isEn ? "Course not found" : "Cours introuvable"}
            </p>
          </div>
        </div>
      </LearnLayout>
    );
  }

  // Find first incomplete lesson for "Start Course" CTA
  const firstLesson = course.modules?.[0]?.lessons?.[0];
  const resumeTarget = progress?.nextLesson || progress?.lastAccessedLesson || firstLesson;

  return (
    <LearnLayout>
      <div className="min-h-full">
        {/* ═══════════════════════════════════════════════════════
            HERO SECTION — 16:9 Banner + Glassmorphism Overlay
            ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Background: 16:9 banner or gradient */}
          {course.thumbnailUrl || (course as any).heroImageUrl ? (
            <div className="relative">
              <div className="aspect-[21/9] md:aspect-[3/1] w-full overflow-hidden">
                <img
                  src={(course as any).heroImageUrl || course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D3E] via-[#0F3D3E]/70 to-transparent" />
              </div>
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <div className="max-w-4xl mx-auto px-6 pb-8 pt-16">
                  <HeroContent
                    course={course}
                    isEn={isEn}
                    isAuthenticated={isAuthenticated}
                    progressPercent={progressPercent}
                    completedLessons={completedLessons}
                    totalLessons={totalLessons}
                    totalDurationMinutes={totalDurationMinutes}
                    hasStarted={hasStarted}
                    isComplete={isComplete}
                    resumeTarget={resumeTarget}
                    slug={slug || ""}
                    setLocation={setLocation}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#0F3D3E] via-[#145A5B] to-[#0F3D3E] relative">
              {/* Decorative orbs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#C65A1E]/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#17E2C6]/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-16">
                <HeroContent
                  course={course}
                  isEn={isEn}
                  isAuthenticated={isAuthenticated}
                  progressPercent={progressPercent}
                  completedLessons={completedLessons}
                  totalLessons={totalLessons}
                  totalDurationMinutes={totalDurationMinutes}
                  hasStarted={hasStarted}
                  isComplete={isComplete}
                  resumeTarget={resumeTarget}
                  slug={slug || ""}
                  setLocation={setLocation}
                />
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            7-SLOT LEGEND
            ═══════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-[#C65A1E]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isEn
                ? "7-Slot Learning Structure"
                : "Structure d'apprentissage en 7 étapes"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SLOT_TEMPLATE.map((slot) => {
              const Icon = slot.icon;
              return (
                <div
                  key={slot.index}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs ${slot.bg} border border-transparent hover:border-border/30 transition-colors`}
                >
                  <Icon className={`h-3.5 w-3.5 ${slot.textColor}`} />
                  <span className={`font-medium ${slot.textColor}`}>
                    {slot.index}. {isEn ? slot.label : slot.labelFr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            COURSE CONTENT — Module Accordion
            ═══════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#0F3D3E]" />
            {isEn ? "Course Content" : "Contenu du cours"}
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              {course.modules?.length || 0} {isEn ? "modules" : "modules"} ·{" "}
              {totalLessons} {isEn ? "lessons" : "leçons"}
            </span>
          </h2>

          <Accordion
            type="multiple"
            defaultValue={
              course.modules?.map((_: any, i: number) => `module-${i}`) || []
            }
          >
            {course.modules?.map((module: any, moduleIndex: number) => {
              const moduleLessons = module.lessons || [];
              const progressModule = progress?.modules?.find(
                (pm: any) => pm.id === module.id
              );
              const moduleCompleted =
                progressModule?.completedLessons || 0;
              const moduleTotal = moduleLessons.length;
              const modulePercent =
                moduleTotal > 0
                  ? Math.round((moduleCompleted / moduleTotal) * 100)
                  : 0;
              const isModuleComplete =
                moduleCompleted === moduleTotal && moduleTotal > 0;

              return (
                <AccordionItem
                  key={module.id}
                  value={`module-${moduleIndex}`}
                  className="border rounded-xl mb-3 overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="hover:no-underline px-5 py-4">
                    <div className="flex items-center gap-4 text-left w-full">
                      {/* Module number badge */}
                      <div className="flex-shrink-0 relative">
                        {module.thumbnailUrl ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-border/50 shadow-sm">
                            <img
                              src={module.thumbnailUrl}
                              alt={module.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md ${
                              isModuleComplete
                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                : "bg-gradient-to-br from-[#0F3D3E] to-[#145A5B]"
                            }`}
                          >
                            {isModuleComplete ? (
                              <CheckCircle2 className="h-7 w-7" />
                            ) : (
                              moduleIndex + 1
                            )}
                          </div>
                        )}
                        {/* Mini progress ring on thumbnail */}
                        {isAuthenticated && moduleTotal > 0 && !isModuleComplete && modulePercent > 0 && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-[#C65A1E] flex items-center justify-center">
                            <span className="text-[8px] font-bold text-[#C65A1E]">
                              {modulePercent}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Module info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">
                          {isEn
                            ? module.title
                            : module.titleFr || module.title}
                        </p>
                        {module.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {isEn
                              ? module.description
                              : module.descriptionFr || module.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {moduleTotal} {isEn ? "lessons" : "leçons"}
                          </span>
                          {isAuthenticated && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              {moduleCompleted}/{moduleTotal}
                            </span>
                          )}
                        </div>
                        {/* Module progress bar */}
                        {isAuthenticated && moduleTotal > 0 && (
                          <div className="mt-2 relative">
                            <Progress
                              value={modulePercent}
                              className="h-1.5"
                            />
                          </div>
                        )}
                      </div>

                      {/* Module completion badge */}
                      {isModuleComplete && isAuthenticated && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center ring-2 ring-emerald-500/20">
                            <Trophy className="h-5 w-5 text-emerald-500" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="px-5 pb-4 space-y-0.5">
                      {moduleLessons.map(
                        (lesson: any, lessonIndex: number) => {
                          const isCompleted = completedLessonIdSet.has(
                            lesson.id
                          );
                          const isInProgress = inProgressLessonIdSet.has(
                            lesson.id
                          );
                          const isLocked = false; // TODO: drip content check
                          const lessonActivities =
                            activitiesByLesson[lesson.id] || [];
                          const lessonSlotsFilled = lessonActivities.filter(
                            (a: any) => a.slotIndex >= 1 && a.slotIndex <= 7
                          ).length;
                          const lessonSlotsCompleted = lessonActivities.filter(
                            (a: any) => completedActivityIds.has(a.id)
                          ).length;

                          return (
                            <motion.button
                              key={lesson.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: lessonIndex * 0.03,
                                duration: 0.2,
                              }}
                              onClick={() =>
                                !isLocked &&
                                setLocation(
                                  `/learn/${slug}/lessons/${lesson.id}`
                                )
                              }
                              disabled={isLocked}
                              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                                isLocked
                                  ? "text-muted-foreground/50 cursor-not-allowed opacity-60"
                                  : isCompleted
                                  ? "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                                  : isInProgress
                                  ? "bg-[#C65A1E]/5 hover:bg-[#C65A1E]/10 ring-1 ring-[#C65A1E]/10"
                                  : "hover:bg-muted/60 hover:shadow-sm"
                              }`}
                            >
                              {/* Status indicator */}
                              <span className="flex-shrink-0 mt-0.5">
                                {isCompleted ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  </div>
                                ) : isInProgress ? (
                                  <div className="w-6 h-6 rounded-full border-2 border-[#C65A1E] flex items-center justify-center animate-pulse">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#C65A1E]" />
                                  </div>
                                ) : isLocked ? (
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-muted-foreground/40">
                                      {lessonIndex + 1}
                                    </span>
                                  </div>
                                )}
                              </span>

                              {/* Lesson info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`text-sm font-medium ${
                                      isCompleted
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : isInProgress
                                        ? "text-[#C65A1E]"
                                        : ""
                                    } group-hover:text-foreground transition-colors`}
                                  >
                                    {isEn
                                      ? lesson.title
                                      : lesson.titleFr || lesson.title}
                                  </p>
                                  {lesson.isPreview && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {isEn ? "Preview" : "Aperçu"}
                                    </Badge>
                                  )}
                                  {isInProgress && (
                                    <Badge className="text-[10px] px-1.5 py-0 bg-[#C65A1E]/10 text-[#C65A1E] border-[#C65A1E]/20">
                                      {isEn ? "In Progress" : "En cours"}
                                    </Badge>
                                  )}
                                </div>

                                {/* Slot-level progress text */}
                                {isAuthenticated && lessonSlotsCompleted > 0 && !isCompleted && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {lessonSlotsCompleted}/{lessonSlotsFilled}{" "}
                                    {isEn ? "slots completed" : "étapes terminées"}
                                  </p>
                                )}

                                {/* 7-Slot indicators */}
                                {lessonActivities.length > 0 && (
                                  <SlotIndicators
                                    lessonActivities={lessonActivities}
                                    completedActivityIds={completedActivityIds}
                                    language={language}
                                  />
                                )}
                              </div>

                              {/* Duration + arrow */}
                              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                                {lesson.videoDurationSeconds > 0 && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {Math.round(
                                      lesson.videoDurationSeconds / 60
                                    )}
                                    m
                                  </span>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </motion.button>
                          );
                        }
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* ═══════════════════════════════════════════════════════
              COURSE STATS FOOTER
              ═══════════════════════════════════════════════════════ */}
          {course.modules && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-8 rounded-2xl p-6 bg-gradient-to-br from-card to-muted/30 border border-border/50 shadow-sm"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <StatCard
                  icon={Layers}
                  value={course.modules.length}
                  label={isEn ? "Modules" : "Modules"}
                  color="#0F3D3E"
                />
                <StatCard
                  icon={BookOpen}
                  value={totalLessons}
                  label={isEn ? "Lessons" : "Leçons"}
                  color="#C65A1E"
                />
                <StatCard
                  icon={Award}
                  value={totalActivities}
                  label={isEn ? "Activities" : "Activités"}
                  color="#8B5CF6"
                />
                <StatCard
                  icon={Clock}
                  value={
                    totalDurationMinutes > 0
                      ? `${Math.round(totalDurationMinutes / 60)}h`
                      : "—"
                  }
                  label={isEn ? "Total Duration" : "Durée totale"}
                  color="#10B981"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </LearnLayout>
  );
}

// ─── Hero Content (shared between banner and gradient variants) ──
function HeroContent({
  course,
  isEn,
  isAuthenticated,
  progressPercent,
  completedLessons,
  totalLessons,
  totalDurationMinutes,
  hasStarted,
  isComplete,
  resumeTarget,
  slug,
  setLocation,
}: {
  course: any;
  isEn: boolean;
  isAuthenticated: boolean;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  totalDurationMinutes: number;
  hasStarted: boolean;
  isComplete: boolean;
  resumeTarget: any;
  slug: string;
  setLocation: (url: string) => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center gap-6"
      >
        {/* Course icon (only when no banner) */}
        {!course.thumbnailUrl && !(course as any).heroImageUrl && (
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm ring-2 ring-white/20 flex items-center justify-center shadow-xl">
              <GraduationCap className="h-10 w-10 text-white/80" />
            </div>
          </div>
        )}

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs">
              <GraduationCap className="h-3 w-3 mr-1" />
              {course.level || "All Levels"}
            </Badge>
            {course.modules && (
              <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs">
                <Layers className="h-3 w-3 mr-1" />
                {course.modules.length} {isEn ? "Modules" : "Modules"}
              </Badge>
            )}
            {isComplete && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-sm text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                {isEn ? "Completed!" : "Terminé !"}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {isEn ? course.title : course.titleFr || course.title}
          </h1>
          <p className="text-white/70 text-sm md:text-base line-clamp-2 max-w-2xl">
            {isEn
              ? course.description
              : course.descriptionFr || course.description}
          </p>
        </div>

        {/* Progress Ring */}
        {isAuthenticated && hasStarted && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex-shrink-0 hidden md:block"
          >
            <ProgressRing percent={progressPercent} size={96} strokeWidth={7} />
          </motion.div>
        )}
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-5 flex flex-wrap items-center gap-4 text-white/70 text-sm"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          {totalLessons} {isEn ? "Lessons" : "Leçons"}
        </span>
        {totalDurationMinutes > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {Math.round(totalDurationMinutes / 60) > 0
              ? `${Math.round(totalDurationMinutes / 60)}h ${Math.round(totalDurationMinutes % 60)}m`
              : `${Math.round(totalDurationMinutes)}m`}
          </span>
        )}
        {isAuthenticated && hasStarted && (
          <>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {completedLessons}/{totalLessons}{" "}
              {isEn ? "completed" : "terminées"}
            </span>
          </>
        )}
        {/* Mobile progress ring */}
        {isAuthenticated && hasStarted && (
          <div className="md:hidden flex items-center gap-2">
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-6 flex items-center gap-3 flex-wrap"
      >
        {isAuthenticated && resumeTarget ? (
          <>
            <Button
              size="lg"
              className={`shadow-lg transition-all hover:shadow-xl ${
                isComplete
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-emerald-600/30"
                  : hasStarted
                  ? "bg-[#C65A1E] hover:bg-[#E06B2D] text-white shadow-[#C65A1E]/25 hover:shadow-[#C65A1E]/30"
                  : "bg-white text-[#0F3D3E] hover:bg-white/90 shadow-white/25 hover:shadow-white/30"
              }`}
              onClick={() =>
                setLocation(`/learn/${slug}/lessons/${resumeTarget.id}`)
              }
            >
              {isComplete ? (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  {isEn ? "Review Course" : "Revoir le cours"}
                </>
              ) : hasStarted ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {isEn ? "Continue Learning" : "Continuer l'apprentissage"}
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {isEn ? "Start Course" : "Commencer le cours"}
                </>
              )}
            </Button>
            {hasStarted && !isComplete && resumeTarget?.title && (
              <span className="text-white/50 text-sm hidden sm:inline">
                {resumeTarget.title}
              </span>
            )}
          </>
        ) : !isAuthenticated ? (
          <Button
            size="lg"
            className="bg-white text-[#0F3D3E] hover:bg-white/90 shadow-lg shadow-white/25"
            onClick={() => setLocation("/login")}
          >
            <Shield className="h-4 w-4 mr-2" />
            {isEn ? "Sign in to Start" : "Se connecter pour commencer"}
          </Button>
        ) : null}
      </motion.div>
    </>
  );
}

// ─── Stat Card Component ────────────────────────────────────────
function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
