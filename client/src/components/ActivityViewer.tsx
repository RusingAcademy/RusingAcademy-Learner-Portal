/**
 * ActivityViewer — Premium 7-Slot Navigation + Activity Renderer
 * 
 * Phase 3 Enhanced with:
 * - Horizontal slot navigation bar with color-coded icons
 * - Slot completion checkmarks (green check on completed slots)
 * - Auto-advance to next slot after marking complete
 * - Keyboard navigation (left/right arrows)
 * - Touch swipe support for mobile
 * - Completion progress bar showing X/7 slots done
 * - One-activity-at-a-time rendering (Kajabi-style)
 * - Premium glassmorphism and micro-animations
 * - Bilingual EN/FR support
 */
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RichTextRenderer } from "@/components/RichTextEditor";
import {
  Video, FileText, Headphones, HelpCircle, ClipboardList, FileDown,
  Radio, Code2, Play, Puzzle, MessageSquare, CheckCircle2, Circle,
  ChevronRight, ChevronLeft, Clock, Award, Lock, Download, ExternalLink, Trophy,
  Loader2, Lightbulb, PenTool, Mic, BookOpen, Sparkles, Plus,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { BunnyStreamPlayer } from "@/components/BunnyStreamPlayer";
import { marked } from "marked";
import QuizRenderer, { parseQuizFromContent } from "@/components/QuizRenderer";

// Configure marked for safe rendering
marked.setOptions({ breaks: true, gfm: true });

// Helper to render markdown content to HTML
function renderMarkdown(content: string): string {
  try {
    if (/<[a-z][\s\S]*>/i.test(content) && !content.startsWith('#') && !content.startsWith('**')) {
      return content;
    }
    let processed = content;
    if (!content.includes('\n') || content.split('\n').length < 3) {
      processed = processed.replace(/\s(#{1,6})\s/g, '\n\n$1 ');
      processed = processed.replace(/\s(\d+\.)\s/g, '\n$1 ');
      processed = processed.replace(/\s(\*\*[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇŒÆ])/g, '\n\n$1');
      processed = processed.replace(/\s(>\s)/g, '\n\n$1');
      processed = processed.replace(/\s(---)\s/g, '\n\n$1\n\n');
      processed = processed.replace(/\s(\|\s)/g, '\n$1');
      processed = processed.replace(/\s(\*\*Corrigé)/g, '\n\n$1');
      processed = processed.replace(/\s(\*\*Exercice)/g, '\n\n$1');
    }
    return marked.parse(processed) as string;
  } catch {
    return content;
  }
}

// ─── Slot Configuration ───
const SLOT_CONFIG = [
  { index: 1, type: "introduction", label: "Introduction", labelFr: "Introduction", icon: BookOpen, color: "#0F3D3E", bg: "rgba(15,61,62,0.12)" },
  { index: 2, type: "video", label: "Video", labelFr: "Vidéo", icon: Video, color: "#C65A1E", bg: "rgba(198,90,30,0.12)" },
  { index: 3, type: "grammar", label: "Grammar", labelFr: "Grammaire", icon: PenTool, color: "#1E6B4F", bg: "rgba(30,107,79,0.12)" },
  { index: 4, type: "written_practice", label: "Written", labelFr: "Écrit", icon: FileText, color: "#2563EB", bg: "rgba(37,99,235,0.12)" },
  { index: 5, type: "oral_practice", label: "Oral", labelFr: "Oral", icon: Mic, color: "#DC2626", bg: "rgba(220,38,38,0.12)" },
  { index: 6, type: "quiz", label: "Quiz", labelFr: "Quiz", icon: HelpCircle, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  { index: 7, type: "coaching_tip", label: "Coach Tip", labelFr: "Conseil", icon: Sparkles, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
];

// Activity type icon mapping
const activityTypeIcon: Record<string, any> = {
  video: Video, text: FileText, audio: Headphones, quiz: HelpCircle,
  assignment: ClipboardList, download: FileDown, live_session: Radio,
  embed: Code2, speaking_exercise: Play, fill_blank: Puzzle,
  matching: Puzzle, discussion: MessageSquare,
};

// Helper to extract YouTube ID
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || url;
}

// Helper to extract Vimeo ID
function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] || url;
}

interface ActivityViewerProps {
  lessonId: number;
  isEnrolled: boolean;
  language?: string;
}

export default function ActivityViewer({ lessonId, isEnrolled, language = "en" }: ActivityViewerProps) {
  const isEn = language === "en";
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(1);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Fetch activities for this lesson
  const { data: activitiesList, isLoading, refetch } = trpc.activities.getByLesson.useQuery(
    { lessonId },
    { enabled: !!lessonId }
  );

  // Fetch full activity content for the active slot
  const activeActivity = useMemo(() => {
    if (!activitiesList) return null;
    return activitiesList.find((a: any) => a.slotIndex === activeSlotIndex) || null;
  }, [activitiesList, activeSlotIndex]);

  // Fetch full content for active activity
  const { data: fullActivity, isLoading: activityLoading } = trpc.activities.getById.useQuery(
    { activityId: activeActivity?.id || 0 },
    { enabled: !!activeActivity?.id }
  );

  // Build slot map: which slots are filled
  const slotMap = useMemo(() => {
    const map: Record<number, any> = {};
    if (activitiesList) {
      activitiesList.forEach((a: any) => {
        if (a.slotIndex) map[a.slotIndex] = a;
      });
    }
    return map;
  }, [activitiesList]);

  // Extra activities (slotIndex > 7)
  const extraActivities = useMemo(() => {
    if (!activitiesList) return [];
    return activitiesList.filter((a: any) => a.slotIndex && a.slotIndex > 7)
      .sort((a: any, b: any) => a.slotIndex - b.slotIndex);
  }, [activitiesList]);

  // Completed slots tracking (from progressStatus field returned by getByLesson)
  const completedSlotIds = useMemo(() => {
    const set = new Set<number>();
    if (activitiesList) {
      activitiesList.forEach((a: any) => {
        if (a.progressStatus === "completed") set.add(a.slotIndex);
      });
    }
    return set;
  }, [activitiesList]);

  // Progress calculation
  const filledSlots = useMemo(() => {
    return SLOT_CONFIG.filter(s => slotMap[s.index]).length;
  }, [slotMap]);

  const completedSlots = useMemo(() => {
    return SLOT_CONFIG.filter(s => completedSlotIds.has(s.index)).length;
  }, [completedSlotIds]);

  const progressPercent = filledSlots > 0 ? Math.round((completedSlots / filledSlots) * 100) : 0;

  // All filled slot indices (for navigation)
  const allSlotIndices = useMemo(() => {
    return Object.keys(slotMap).map(Number).sort((a, b) => a - b);
  }, [slotMap]);
  const currentPos = allSlotIndices.indexOf(activeSlotIndex);
  const hasPrev = currentPos > 0;
  const hasNext = currentPos < allSlotIndices.length - 1;

  // Mutations
  const startActivity = trpc.activities.startActivity.useMutation({
    onError: (e: any) => console.error("Start activity error:", e.message),
  });
  const utils = trpc.useUtils();
  const [showCelebration, setShowCelebration] = useState(false);

  const completeActivity = trpc.activities.completeActivity.useMutation({
    onSuccess: () => {
      toast.success(isEn ? "Activity completed! ✓" : "Activité terminée ! ✓");
      refetch();
      utils.lessons.getCourseProgress.invalidate();
      utils.activities.getUserActivityProgress.invalidate();
      // Also invalidate the progress cascade for real-time updates
      utils.progressCascade.getCourseCascade.invalidate();
      utils.progressCascade.getMyCoursesSummary.invalidate();

      // Check if this was the last slot — trigger celebration
      const newCompletedCount = completedSlots + 1;
      if (newCompletedCount >= filledSlots && filledSlots > 0) {
        // All slots completed — lesson complete celebration!
        setShowCelebration(true);
        // Fire confetti burst
        const duration = 2500;
        const end = Date.now() + duration;
        const colors = ['#0F3D3E', '#C65A1E', '#17E2C6', '#F59E0B', '#10B981'];
        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors,
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors,
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
        // Auto-dismiss celebration after 4s
        setTimeout(() => setShowCelebration(false), 4000);
      } else {
        // Auto-advance to next slot after a brief delay
        setTimeout(() => {
          if (hasNext) {
            const nextIdx = allSlotIndices[currentPos + 1];
            setSlideDirection("right");
            setActiveSlotIndex(nextIdx);
          }
        }, 800);
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Auto-start activity when navigating to a slot
  useEffect(() => {
    if (activeActivity?.id && isEnrolled) {
      startActivity.mutate({ activityId: activeActivity.id });
    }
  }, [activeActivity?.id]);

  // Auto-select first filled slot on mount
  useEffect(() => {
    if (allSlotIndices.length > 0 && !slotMap[activeSlotIndex]) {
      // Find first non-completed slot, or first slot
      const firstIncomplete = allSlotIndices.find(idx => !completedSlotIds.has(idx));
      setActiveSlotIndex(firstIncomplete || allSlotIndices[0]);
    }
  }, [allSlotIndices.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, allSlotIndices, currentPos]);

  // Touch swipe support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && hasNext) {
        goNext();
      } else if (diff < 0 && hasPrev) {
        goPrev();
      }
    }
  }, [hasNext, hasPrev]);

  // Navigation handlers
  const goToSlot = useCallback((index: number) => {
    setSlideDirection(index > activeSlotIndex ? "right" : "left");
    setActiveSlotIndex(index);
  }, [activeSlotIndex]);

  const goNext = useCallback(() => {
    const nextPos = allSlotIndices.indexOf(activeSlotIndex);
    if (nextPos < allSlotIndices.length - 1) {
      setSlideDirection("right");
      setActiveSlotIndex(allSlotIndices[nextPos + 1]);
    }
  }, [slotMap, activeSlotIndex, allSlotIndices]);

  const goPrev = useCallback(() => {
    const prevPos = allSlotIndices.indexOf(activeSlotIndex);
    if (prevPos > 0) {
      setSlideDirection("left");
      setActiveSlotIndex(allSlotIndices[prevPos - 1]);
    }
  }, [slotMap, activeSlotIndex, allSlotIndices]);

  const handleComplete = useCallback((score?: number) => {
    if (activeActivity?.id) {
      completeActivity.mutate({ 
        activityId: activeActivity.id,
        score: score !== undefined ? score : undefined,
      });
    }
  }, [activeActivity?.id]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">{isEn ? "Loading lesson activities..." : "Chargement des activités..."}</span>
      </div>
    );
  }

  if (!activitiesList || activitiesList.length === 0) {
    return null;
  }

  const currentSlotConfig = SLOT_CONFIG.find(s => s.index === activeSlotIndex);
  const isCurrentCompleted = completedSlotIds.has(activeSlotIndex);

  return (
    <div
      ref={containerRef}
      className="mt-2"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ─── Completion Progress Bar ─── */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #0F3D3E, #1E6B4F, #C65A1E)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {completedSlots}/{filledSlots} {isEn ? "done" : "fait"}
        </span>
      </div>

      {/* ─── Premium 7-Slot Navigation Bar ─── */}
      <TooltipProvider delayDuration={200}>
        <div className="relative mb-6">
          <div className="rounded-2xl bg-gradient-to-r from-background/80 via-muted/30 to-background/80 backdrop-blur-sm border border-border/50 p-3 shadow-sm">
            {/* Slot Pills */}
            <div className="relative z-10 flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {SLOT_CONFIG.map((slot) => {
                const isFilled = !!slotMap[slot.index];
                const isActive = activeSlotIndex === slot.index;
                const isCompleted = completedSlotIds.has(slot.index);
                const Icon = slot.icon;

                return (
                  <Tooltip key={slot.index}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => isFilled && goToSlot(slot.index)}
                        disabled={!isFilled}
                        className={`
                          group relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-300
                          ${isActive 
                            ? 'scale-105' 
                            : isFilled 
                              ? 'hover:scale-102 cursor-pointer' 
                              : 'opacity-35 cursor-not-allowed'
                          }
                        `}
                      >
                        {/* Slot Circle */}
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 relative
                            ${isActive
                              ? 'shadow-lg ring-2 ring-offset-1 ring-offset-background'
                              : isFilled
                              ? 'hover:shadow-md'
                              : ''
                            }
                          `}
                          style={{
                            backgroundColor: isCompleted && !isActive
                              ? '#10B981'
                              : isActive 
                              ? slot.color 
                              : isFilled 
                              ? slot.bg 
                              : 'transparent',
                            borderColor: isCompleted && !isActive
                              ? '#10B981'
                              : isActive 
                              ? slot.color 
                              : isFilled 
                              ? slot.color 
                              : 'var(--border)',
                            color: (isActive || isCompleted) 
                              ? 'white' 
                              : isFilled 
                              ? slot.color 
                              : 'var(--muted-foreground)',
                            boxShadow: isActive ? `0 4px 14px ${slot.color}40` : undefined,
                            ['--tw-ring-color' as any]: isActive ? `${slot.color}30` : undefined,
                          }}
                        >
                          {isCompleted && !isActive ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : isFilled ? (
                            <Icon className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">{slot.index}</span>
                          )}
                        </div>

                        {/* Slot Label */}
                        <span className={`
                          text-[10px] font-medium leading-tight text-center max-w-[60px] truncate
                          ${isActive ? 'text-foreground font-semibold' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}
                        `}>
                          {isEn ? slot.label : slot.labelFr}
                        </span>

                        {/* Active Indicator Dot */}
                        {isActive && (
                          <motion.div
                            layoutId="activeSlotIndicator"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: slot.color }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <span className="font-medium">
                        {slot.index}. {isEn ? slot.label : slot.labelFr}
                      </span>
                      {isCompleted && <span className="ml-1 text-emerald-400">✓ {isEn ? "Completed" : "Terminé"}</span>}
                      {!isFilled && <span className="ml-1 text-muted-foreground">({isEn ? "empty" : "vide"})</span>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Extra Activities Indicator */}
              {extraActivities.length > 0 && (
                <button
                  onClick={() => goToSlot(extraActivities[0].slotIndex)}
                  className={`
                    group relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-300
                    ${activeSlotIndex > 7 ? 'scale-105' : 'hover:scale-102 cursor-pointer'}
                  `}
                  title={isEn ? `${extraActivities.length} Extra` : `${extraActivities.length} Supplémentaires`}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                    ${activeSlotIndex > 7 
                      ? 'bg-[#0F3D3E] border-[#0F3D3E] text-white shadow-lg' 
                      : 'bg-[#0F3D3E]/10 border-[#0F3D3E] text-[#0F3D3E]'
                    }
                  `}>
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] font-medium ${activeSlotIndex > 7 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    +{extraActivities.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* ─── Active Activity Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlotIndex}
          initial={{ opacity: 0, x: slideDirection === "right" ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: slideDirection === "right" ? -30 : 30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {activeActivity ? (
            <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 ring-1 ring-border/50">
              {/* Activity Header with Slot Color */}
              <div 
                className="px-5 py-4 flex items-center gap-3"
                style={{ 
                  background: currentSlotConfig 
                    ? `linear-gradient(135deg, ${currentSlotConfig.bg}, transparent)` 
                    : undefined 
                }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative"
                  style={{ 
                    backgroundColor: isCurrentCompleted ? '#10B981' : (currentSlotConfig?.color || '#0F3D3E'),
                    color: 'white'
                  }}
                >
                  {isCurrentCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : currentSlotConfig ? (
                    <currentSlotConfig.icon className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge 
                      variant="outline" 
                      className="text-[10px] px-1.5 py-0 border-current"
                      style={{ color: isCurrentCompleted ? '#10B981' : (currentSlotConfig?.color || '#0F3D3E') }}
                    >
                      {currentSlotConfig 
                        ? `Slot ${currentSlotConfig.index}` 
                        : `Extra ${activeSlotIndex - 7}`
                      }
                    </Badge>
                    {isCurrentCompleted && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        ✓ {isEn ? "Completed" : "Terminé"}
                      </Badge>
                    )}
                    {activeActivity.estimatedMinutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {activeActivity.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base truncate">
                    {isEn ? activeActivity.title : (activeActivity.titleFr || activeActivity.title)}
                  </h3>
                </div>
              </div>

              <Separator />

              {/* Activity Content */}
              <CardContent className="p-0">
                {activityLoading ? (
                  <div className="flex items-center gap-2 py-12 justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">{isEn ? "Loading content..." : "Chargement du contenu..."}</span>
                  </div>
                ) : fullActivity ? (
                  <div className="p-5">
                    <ActivityContent
                      activity={fullActivity}
                      language={language}
                      onComplete={handleComplete}
                      isCompleting={completeActivity.isPending}
                      isCompleted={isCurrentCompleted}
                      hasNext={hasNext}
                      onNext={goNext}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{isEn ? "Content not available yet." : "Contenu pas encore disponible."}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <div className="text-muted-foreground">
                {currentSlotConfig ? (
                  <>
                    <currentSlotConfig.icon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium mb-1">
                      {isEn ? `${currentSlotConfig.label} — Coming Soon` : `${currentSlotConfig.labelFr} — Bientôt disponible`}
                    </p>
                    <p className="text-sm opacity-70">
                      {isEn ? "This activity is being prepared." : "Cette activité est en préparation."}
                    </p>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{isEn ? "No activity found for this slot." : "Aucune activité trouvée pour ce créneau."}</p>
                  </>
                )}
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Bottom Navigation ─── */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={!hasPrev}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{isEn ? "Previous" : "Précédent"}</span>
        </Button>

        {/* Dot navigation */}
        <div className="flex items-center gap-1.5">
          {allSlotIndices.map((idx) => {
            const slotConf = SLOT_CONFIG.find(s => s.index === idx);
            const isComp = completedSlotIds.has(idx);
            return (
              <button
                key={idx}
                onClick={() => goToSlot(idx)}
                className={`
                  rounded-full transition-all duration-300 ease-out
                  ${idx === activeSlotIndex 
                    ? 'w-7 h-2.5 shadow-sm' 
                    : isComp
                    ? 'w-2.5 h-2.5 bg-emerald-500 hover:scale-125'
                    : 'w-2.5 h-2.5 hover:scale-125 bg-border hover:bg-muted-foreground'
                  }
                `}
                style={idx === activeSlotIndex ? { backgroundColor: slotConf?.color || '#0F3D3E' } : undefined}
                aria-label={`Go to slot ${idx}`}
              />
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={!hasNext}
          className="gap-1"
        >
          <span className="hidden sm:inline">{isEn ? "Next" : "Suivant"}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-[10px] text-muted-foreground/50 mt-2 hidden md:block">
        {isEn ? "Use ← → arrow keys to navigate" : "Utilisez les touches ← → pour naviguer"}
      </p>

      {/* ─── Lesson Completion Celebration Overlay ─── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-card rounded-3xl p-8 shadow-2xl border border-border/50 max-w-sm mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30"
              >
                <Trophy className="h-10 w-10 text-white" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold mb-2"
              >
                {isEn ? "Lesson Complete!" : "Leçon terminée !"}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground mb-5"
              >
                {isEn
                  ? "You've completed all activities in this lesson. Great work!"
                  : "Vous avez terminé toutes les activités de cette leçon. Excellent travail !"}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => setShowCelebration(false)}
                  className="bg-gradient-to-r from-[#0F3D3E] to-[#1E6B4F] hover:from-[#145A5B] hover:to-[#1E6B4F] text-white shadow-lg"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {isEn ? "Continue" : "Continuer"}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Activity Content Renderer ───
function ActivityContent({
  activity,
  language,
  onComplete,
  isCompleting,
  isCompleted,
  hasNext,
  onNext,
}: {
  activity: any;
  language: string;
  onComplete: (score?: number) => void;
  isCompleting: boolean;
  isCompleted: boolean;
  hasNext: boolean;
  onNext: () => void;
}) {
  const isEn = language === "en";

  return (
    <div className="space-y-4">
      {/* Description */}
      {activity.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isEn ? activity.description : (activity.descriptionFr || activity.description)}
        </p>
      )}

      {/* Video Content */}
      {activity.activityType === "video" && (
        <div>
          {activity.videoUrl ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
              {activity.videoProvider === "bunny" ? (
                <BunnyStreamPlayer
                  videoId={activity.videoUrl}
                  title={activity.title}
                />
              ) : activity.videoProvider === "youtube" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(activity.videoUrl)}?rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activity.title}
                />
              ) : activity.videoProvider === "vimeo" ? (
                <iframe
                  src={`https://player.vimeo.com/video/${extractVimeoId(activity.videoUrl)}`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={activity.title}
                />
              ) : (
                <video
                  src={activity.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={activity.thumbnailUrl || undefined}
                >
                  <track kind="captions" />
                </video>
              )}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-[#C65A1E]/20">
              <div className="bg-gradient-to-r from-[#C65A1E]/10 to-[#C65A1E]/5 px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C65A1E]/15 flex items-center justify-center">
                  <Video className="h-5 w-5 text-[#C65A1E]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#C65A1E]">
                    {isEn ? "Video Scenario — Script" : "Scénario Vidéo — Script"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "Read the scenario below. Video production coming soon." : "Lisez le scénario ci-dessous. Production vidéo à venir."}
                  </p>
                </div>
              </div>
            </div>
          )}
          {activity.content && (
            <div className="mt-4">
              {activity.contentJson ? (
                <RichTextRenderer contentJson={isEn ? activity.contentJson : (activity.contentJsonFr || activity.contentJson)} />
              ) : (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-table:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(isEn ? activity.content : (activity.contentFr || activity.content)) }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Quiz Renderer */}
      {activity.activityType === "quiz" && activity.content && parseQuizFromContent(activity.content) ? (
        <QuizRenderer
          content={isEn ? activity.content : (activity.contentFr || activity.content)}
          language={language}
          onComplete={onComplete}
        />
      ) : null}

      {/* Text / Rich Text Content (non-quiz, non-video, non-audio) */}
      {(activity.activityType === "text" || 
        (activity.activityType === "quiz" && !(activity.content && parseQuizFromContent(activity.content))) ||
        activity.activityType === "assignment" || activity.activityType === "speaking_exercise" ||
        activity.activityType === "fill_blank" || activity.activityType === "matching" ||
        activity.activityType === "discussion") && (
        <div>
          {activity.contentJson ? (
            <RichTextRenderer contentJson={isEn ? activity.contentJson : (activity.contentJsonFr || activity.contentJson)} />
          ) : activity.content ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-table:text-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(isEn ? activity.content : (activity.contentFr || activity.content)) }}
            />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {isEn ? "No content available yet." : "Aucun contenu disponible pour le moment."}
            </p>
          )}
        </div>
      )}

      {/* Audio Content — Oral Practice */}
      {activity.activityType === "audio" && (
        <div className="space-y-4">
          {activity.audioUrl && (
            <div className="bg-gradient-to-r from-[#DC2626]/5 to-transparent rounded-xl p-5 border border-[#DC2626]/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#DC2626]/10 flex items-center justify-center shadow-sm">
                  <Headphones className="h-6 w-6 text-[#DC2626]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{isEn ? "Pronunciation Audio" : "Audio de prononciation"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "Listen carefully, then practice along" : "Écoutez attentivement, puis pratiquez"}
                  </p>
                </div>
              </div>
              <audio controls className="w-full rounded-lg" src={activity.audioUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {activity.content && (
            <div>
              {!activity.audioUrl && (
                <div className="bg-gradient-to-r from-[#DC2626]/5 to-transparent rounded-xl px-5 py-3 mb-4 border border-[#DC2626]/15">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#DC2626]/10 flex items-center justify-center">
                      <Mic className="h-5 w-5 text-[#DC2626]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#DC2626]">
                        {isEn ? "Oral Practice" : "Pratique Orale"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isEn ? "Follow the pronunciation guide below" : "Suivez le guide de prononciation ci-dessous"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activity.contentJson ? (
                <RichTextRenderer contentJson={isEn ? activity.contentJson : (activity.contentJsonFr || activity.contentJson)} />
              ) : (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-table:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(isEn ? activity.content : (activity.contentFr || activity.content)) }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Download Content */}
      {activity.activityType === "download" && activity.downloadUrl && (
        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
          <FileDown className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.downloadFileName || "Download File"}</p>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Click to download" : "Cliquez pour télécharger"}
            </p>
          </div>
          <Button size="sm" asChild>
            <a href={activity.downloadUrl} download={activity.downloadFileName} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-1" />
              {isEn ? "Download" : "Télécharger"}
            </a>
          </Button>
        </div>
      )}

      {/* Embed Content */}
      {activity.activityType === "embed" && activity.embedCode && (
        <div
          className="rounded-xl overflow-hidden"
          dangerouslySetInnerHTML={{ __html: activity.embedCode }}
        />
      )}

      {/* Live Session */}
      {activity.activityType === "live_session" && (
        <div className="text-center p-6 bg-muted/30 rounded-xl">
          <Radio className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium mb-1">
            {isEn ? "Live Session" : "Session en direct"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {isEn ? "Join the live session when it starts" : "Rejoignez la session en direct lorsqu'elle commence"}
          </p>
          {activity.videoUrl && (
            <Button size="sm" asChild>
              <a href={activity.videoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                {isEn ? "Join Session" : "Rejoindre la session"}
              </a>
            </Button>
          )}
        </div>
      )}

      {/* ─── Action Buttons ─── */}
      <div className="flex items-center justify-between pt-3 gap-3">
        {/* Mark Complete / Already Completed */}
        {isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              {isEn ? "Completed" : "Terminé"}
            </span>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => onComplete()}
            disabled={isCompleting}
            className="bg-[#0F3D3E] hover:bg-[#0F3D3E]/90 text-white gap-1.5"
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isCompleting
              ? (isEn ? "Saving..." : "Enregistrement...")
              : (isEn ? "Mark Complete" : "Marquer comme terminé")}
          </Button>
        )}

        {/* Next Slot shortcut */}
        {hasNext && isCompleted && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={onNext}
              className="gap-1.5 border-[#C65A1E]/30 text-[#C65A1E] hover:bg-[#C65A1E]/5"
            >
              {isEn ? "Next Activity" : "Activité suivante"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
