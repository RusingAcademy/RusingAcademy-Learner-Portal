import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLearnLayout } from "@/contexts/LearnLayoutContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  Circle,
  Lock,
  BookOpen,
  Clock,
  ArrowLeft,
  Menu,
  X,
  Volume2,
  Maximize,
  SkipBack,
  SkipForward,
  MessageSquare,
  StickyNote,
  Mic,
  Award,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";

// Import interactive components
import Quiz from "@/components/Quiz";
import SpeakingExercise from "@/components/SpeakingExercise";
import LearnerNotes from "@/components/LearnerNotes";
import { BunnyStreamPlayer } from "@/components/BunnyStreamPlayer";
import ConfidenceCheck from "@/components/ConfidenceCheck";
import { ProgressCelebration, CELEBRATIONS } from "@/components/ProgressCelebration";
import XpToast from "@/components/XpToast";
import AudioLibrary from "@/components/AudioLibrary";
import ActivityViewer from "@/components/ActivityViewer";
import { Library } from "lucide-react";
import { useGamificationActions } from "@/hooks/useGamificationActions";

// Lesson type icons
const lessonTypeIcons: Record<string, typeof Video> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  audio: Volume2,
  pdf: FileText,
  assignment: FileText,
  download: FileText,
  live_session: Video,
  speaking: Mic,
};

// Sample quiz questions (in production, these would come from the database)
const getSampleQuizQuestions = (lessonTitle: string) => [
  {
    id: 1,
    type: "multiple_choice" as const,
    question: `Based on the lesson "${lessonTitle}", which statement is correct?`,
    questionFr: `Selon la leçon "${lessonTitle}", quelle affirmation est correcte ?`,
    options: [
      "Option A - First choice",
      "Option B - Second choice",
      "Option C - Third choice",
      "Option D - Fourth choice",
    ],
    optionsFr: [
      "Option A - Premier choix",
      "Option B - Deuxième choix",
      "Option C - Troisième choix",
      "Option D - Quatrième choix",
    ],
    correctAnswer: 0,
    explanation: "This is the correct answer because it aligns with the lesson content.",
    explanationFr: "C'est la bonne réponse car elle correspond au contenu de la leçon.",
    points: 10,
  },
  {
    id: 2,
    type: "true_false" as const,
    question: "The concepts covered in this lesson are fundamental to SLE preparation.",
    questionFr: "Les concepts abordés dans cette leçon sont fondamentaux pour la préparation à l'ELS.",
    correctAnswer: "true",
    explanation: "Yes, these concepts form the foundation of SLE preparation.",
    explanationFr: "Oui, ces concepts constituent la base de la préparation à l'ELS.",
    points: 5,
  },
  {
    id: 3,
    type: "multiple_choice" as const,
    question: "What is the primary goal of this lesson?",
    questionFr: "Quel est l'objectif principal de cette leçon ?",
    options: [
      "To introduce basic vocabulary",
      "To practice oral expression",
      "To improve reading comprehension",
      "To master written communication",
    ],
    optionsFr: [
      "Introduire le vocabulaire de base",
      "Pratiquer l'expression orale",
      "Améliorer la compréhension écrite",
      "Maîtriser la communication écrite",
    ],
    correctAnswer: 1,
    explanation: "The primary focus is on oral expression skills.",
    explanationFr: "L'accent principal est mis sur les compétences d'expression orale.",
    points: 10,
  },
];

export default function LessonViewer() {
  const { slug: routeSlug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const { language } = useLanguage();
  const isEn = language === "en";
  const [, setLocation] = useLocation();

  // Detect if we're inside the immersive LearnLayout shell
  const { isInsideLearnLayout, courseSlug: learnSlug, navigateToLesson: learnNavigate } = useLearnLayout();
  // Use the slug from LearnLayout context if inside it, otherwise from route params
  const slug = isInsideLearnLayout ? learnSlug : routeSlug;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSpeaking, setShowSpeaking] = useState(false);
  const [showConfidenceCheck, setShowConfidenceCheck] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  const [xpToast, setXpToast] = useState<{ amount: number; reason: string } | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Gamification actions
  const { awardXP, unlockBadge, maintainStreakAction } = useGamificationActions();

  // Fetch course data
  const { data: course, isLoading: courseLoading } = trpc.courses.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Fetch lesson data
  const { data: lessonData, isLoading: lessonLoading, refetch: refetchLesson } = trpc.courses.getLesson.useQuery(
    { lessonId: parseInt(lessonId || "0") },
    { enabled: !!lessonId }
  );

  // Fetch quiz questions if this is a quiz lesson
  const { data: quizQuestionsData } = trpc.lessons.getQuizQuestions.useQuery(
    { lessonId: parseInt(lessonId || "0") },
    { enabled: !!lessonId && lessonData?.lesson?.contentType === "quiz" }
  );

  // Mark lesson complete mutation
  const markCompleteMutation = trpc.courses.updateProgress.useMutation();

  // Get enrollment status
  const { data: enrollment, refetch: refetchEnrollment } = trpc.courses.getEnrollment.useQuery(
    { courseId: course?.id || 0 },
    { enabled: !!course?.id }
  );

  const lesson = lessonData?.lesson;
  const progress = lessonData?.progress;

  // Find current lesson index and navigation
  const allLessons = course?.modules?.flatMap(m => m.lessons) || [];
  const currentIndex = allLessons.findIndex(l => l.id === parseInt(lessonId || "0"));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Calculate overall progress
  const completedLessons = enrollment?.lessonsCompleted || 0;
  const totalLessons = enrollment?.totalLessons || allLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Check if lesson is already completed
  useEffect(() => {
    if (progress?.status === "completed") {
      setLessonCompleted(true);
    }
  }, [progress]);

  const handleMarkComplete = useCallback(async (showCelebrationAfter = true) => {
    if (!lesson || lessonCompleted) return;
    
    try {
      await markCompleteMutation.mutateAsync({ 
        lessonId: lesson.id, 
        progressPercent: 100, 
        completed: true 
      });
      
      setLessonCompleted(true);
      
      // Show XP toast (local + gamification system)
      setXpToast({ amount: 25, reason: isEn ? "Lesson completed!" : "Leçon terminée !" });
      awardXP(25, isEn ? "Lesson completed!" : "Leçon terminée !");
      
      // Update streak
      maintainStreakAction(1);
      
      // Check if this completes a module or course
      const currentModule = course?.modules?.find(m => 
        m.lessons?.some(l => l.id === lesson.id)
      );
      
      if (showCelebrationAfter) {
        // Show confidence check first
        setShowConfidenceCheck(true);
      }
      
      // Refetch data
      refetchLesson();
      refetchEnrollment();
      
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
    }
  }, [lesson, lessonCompleted, course, isEn, markCompleteMutation, refetchLesson, refetchEnrollment]);

  const handleQuizComplete = useCallback((result: any) => {
    setShowQuiz(false);
    
    if (result.passed) {
      // Award XP based on score
      const xpEarned = Math.round(result.percentage / 2);
      setXpToast({ amount: xpEarned, reason: isEn ? "Quiz passed!" : "Quiz réussi !" });
      awardXP(xpEarned, isEn ? "Quiz passed!" : "Quiz réussi !");
      
      // Check for quiz master badge (perfect score)
      if (result.percentage === 100) {
        unlockBadge({
          code: "quiz-master",
          name: isEn ? "Quiz Master" : "Maître du Quiz",
          description: isEn ? "Achieved a perfect score on a quiz" : "Score parfait sur un quiz",
          points: 50,
          rarity: "rare",
        });
      }
      
      // Mark lesson complete
      handleMarkComplete(true);
    } else {
      // Encourage retry
      setXpToast({ amount: 5, reason: isEn ? "Good effort! Try again." : "Bon effort ! Réessayez." });
    }
  }, [isEn, handleMarkComplete, awardXP, unlockBadge]);

  const handleSpeakingComplete = useCallback((data: any) => {
    setShowSpeaking(false);
    
    // Award XP for completing speaking exercise
    setXpToast({ amount: 30, reason: isEn ? "Speaking exercise completed!" : "Exercice oral terminé !" });
    awardXP(30, isEn ? "Speaking exercise completed!" : "Exercice oral terminé !");
    
    // Mark lesson complete
    handleMarkComplete(true);
  }, [isEn, handleMarkComplete, awardXP]);

  const handleConfidenceCheckComplete = useCallback((data: any) => {
    setShowConfidenceCheck(false);
    
    // Show celebration
    if (lesson) {
      setCelebrationData(CELEBRATIONS.lessonComplete(lesson.title, 25));
      setShowCelebration(true);
    }
  }, [lesson]);

  // Build the correct lesson URL based on whether we're inside LearnLayout or standalone
  const buildLessonUrl = useCallback((targetLessonId: number) => {
    return isInsideLearnLayout
      ? `/learn/${slug}/lessons/${targetLessonId}`
      : `/courses/${slug}/lessons/${targetLessonId}`;
  }, [isInsideLearnLayout, slug]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setCelebrationData(null);
    
    // Navigate to next lesson if available
    if (nextLesson) {
      setTimeout(() => {
        if (isInsideLearnLayout) {
          learnNavigate(nextLesson.id);
        } else {
          setLocation(buildLessonUrl(nextLesson.id));
        }
      }, 300);
    }
  }, [nextLesson, isInsideLearnLayout, learnNavigate, setLocation, buildLessonUrl]);

  const navigateToLesson = (targetLessonId: number) => {
    if (isInsideLearnLayout) {
      learnNavigate(targetLessonId);
    } else {
      setLocation(buildLessonUrl(targetLessonId));
    }
    // Reset states
    setShowQuiz(false);
    setShowSpeaking(false);
    setShowConfidenceCheck(false);
    setLessonCompleted(false);
    setActiveTab("content");
  };

  // Loading state
  if (courseLoading || lessonLoading) {
    return (
      <div className={`${isInsideLearnLayout ? 'h-full' : 'min-h-screen'} bg-background flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{isEn ? "Loading lesson..." : "Chargement de la leçon..."}</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!course || !lesson) {
    const backUrl = isInsideLearnLayout ? `/learn/${slug}` : `/courses/${slug}`;
    return (
      <div className={`${isInsideLearnLayout ? 'h-full' : 'min-h-screen'} bg-background`}>
        {!isInsideLearnLayout && <Header />}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{isEn ? "Lesson not found" : "Leçon introuvable"}</h1>
          <p className="text-muted-foreground mb-6">
            {isEn ? "This lesson doesn't exist or you don't have access." : "Cette leçon n'existe pas ou vous n'y avez pas accès."}
          </p>
          <Button asChild>
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isEn ? "Back to Course" : "Retour au cours"}
            </Link>
          </Button>
        </div>
        {!isInsideLearnLayout && <Footer />}
      </div>
    );
  }

  const LessonIcon = lessonTypeIcons[lesson.contentType || "video"] || Video;
  const isQuizLesson = lesson.contentType === "quiz";
  const isSpeakingLesson = lesson.contentType === "audio";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* XP Toast */}
      <AnimatePresence>
        {xpToast && (
          <XpToast
            amount={xpToast.amount}
            reason={xpToast.reason}
            onClose={() => setXpToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <ProgressCelebration
            celebration={celebrationData}
            language={language}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      {/* Confidence Check Modal */}
      <AnimatePresence>
        {showConfidenceCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <ConfidenceCheck
                lessonId={lesson.id}
                courseId={course?.id || 0}
                lessonTitle={lesson.title}
                onComplete={handleConfidenceCheckComplete}
                onSkip={() => {
                  setShowConfidenceCheck(false);
                  handleCelebrationComplete();
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar — hidden when inside LearnLayout (LearnLayout provides its own) */}
      {!isInsideLearnLayout && (
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link 
              href={`/courses/${slug}`} 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline truncate max-w-[200px]">{course.title}</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-2">
              <Progress value={progressPercent} className="w-32 h-2" aria-label="Course progress" />
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevLesson}
                onClick={() => prevLesson && navigateToLesson(prevLesson.id)}
                aria-label={isEn ? "Previous lesson" : "Leçon précédente"}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">{isEn ? "Previous" : "Précédent"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!nextLesson}
                onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
                aria-label={isEn ? "Next lesson" : "Leçon suivante"}
              >
                <span className="hidden sm:inline mr-1">{isEn ? "Next" : "Suivant"}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
          </div>
        </div>
      </div>
      </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Course Outline — hidden when inside LearnLayout */}
        <AnimatePresence>
          {!isInsideLearnLayout && sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r bg-muted/30 overflow-hidden flex-shrink-0"
              role="navigation"
              aria-label="Course navigation"
            >
              <ScrollArea className="h-[calc(100vh-57px)]">
                <div className="p-4">
                  <h2 className="font-semibold mb-4">{isEn ? "Course Content" : "Contenu du cours"}</h2>
                  
                  {course.modules?.map((module, moduleIndex) => (
                    <div key={module.id} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {isEn ? `Module ${moduleIndex + 1}` : `Module ${moduleIndex + 1}`}
                        </Badge>
                        <span className="text-sm font-medium truncate">{module.title}</span>
                      </div>
                      
                      <div className="space-y-1 pl-2">
                        {module.lessons?.map((l) => {
                          const isActive = l.id === lesson.id;
                          const isCompleted = false; // TODO: Check from progress
                          const isLocked = !enrollment && !l.isPreview;
                          const Icon = lessonTypeIcons[l.contentType || "video"] || Video;
                          
                          return (
                            <button
                              key={l.id}
                              onClick={() => !isLocked && navigateToLesson(l.id)}
                              disabled={isLocked}
                              aria-current={isActive ? "page" : undefined}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : isLocked
                                  ? "text-muted-foreground cursor-not-allowed"
                                  : "hover:bg-muted"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                              ) : isLocked ? (
                                <Lock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                              ) : (
                                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                              )}
                              <span className="truncate flex-1">{l.title}</span>
                              {l.videoDurationSeconds && (
                                <span className="text-xs opacity-70">
                                  {Math.round(l.videoDurationSeconds / 60)}m
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
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto" role="main">
          <div className="max-w-4xl mx-auto p-6">
            {/* Lesson Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline">
                  <LessonIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                  {lesson.contentType === "video" ? (isEn ? "Video" : "Vidéo") :
                   lesson.contentType === "text" ? (isEn ? "Article" : "Article") :
                   lesson.contentType === "quiz" ? (isEn ? "Quiz" : "Quiz") :
                   
                   lesson.contentType}
                </Badge>
                {lesson.videoDurationSeconds && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {Math.round(lesson.videoDurationSeconds / 60)} min
                  </span>
                )}
                {lessonCompleted && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                    {isEn ? "Completed" : "Terminé"}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-muted-foreground mt-2">{lesson.description}</p>
              )}
            </div>

            {/* Tabs for Content, Notes, Discussion */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{isEn ? "Content" : "Contenu"}</span>
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{isEn ? "Audio" : "Audio"}</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{isEn ? "Notes" : "Notes"}</span>
                </TabsTrigger>
                <TabsTrigger value="discussion" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{isEn ? "Discussion" : "Discussion"}</span>
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="mt-4">
                {/* 7-Slot Activity Viewer — PRIMARY content renderer */}
                <div className="mb-4">
                  <ActivityViewer
                    lessonId={lesson.id}
                    isEnrolled={!!enrollment}
                    language={language}
                  />
                </div>

                {/* Legacy lesson content — only shown for quiz/speaking/video lessons without activities */}
                {(isQuizLesson || isSpeakingLesson || (lesson.contentType === "video" && lesson.videoUrl)) && (
                <Card>
                  <CardContent className="p-0">
                    {/* Quiz Content */}
                    {isQuizLesson && !showQuiz && (
                      <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <HelpCircle className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {isEn ? "Ready for the Quiz?" : "Prêt pour le quiz ?"}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {isEn 
                            ? "Test your knowledge with this interactive quiz. You need 70% to pass." 
                            : "Testez vos connaissances avec ce quiz interactif. Vous avez besoin de 70% pour réussir."}
                        </p>
                        <Button size="lg" onClick={() => setShowQuiz(true)}>
                          <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                          {isEn ? "Start Quiz" : "Commencer le quiz"}
                        </Button>
                      </div>
                    )}

                    {isQuizLesson && showQuiz && (
                      <div className="p-4">
                        <Quiz
                          title={lesson.title}
                          titleFr={lesson.title}
                          questions={quizQuestionsData && quizQuestionsData.length > 0 
                            ? quizQuestionsData.map((q: any) => ({
                                id: q.id,
                                type: q.questionType === 'true_false' ? 'true_false' : 'multiple_choice',
                                question: q.questionText,
                                questionFr: q.questionTextFr || q.questionText,
                                options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
                                optionsFr: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
                                correctAnswer: q.correctAnswer,
                                explanation: q.explanation || '',
                                explanationFr: q.explanationFr || q.explanation || '',
                                points: q.points || 10,
                              }))
                            : getSampleQuizQuestions(lesson.title)
                          }
                          passingScore={70}
                          language={language}
                          onComplete={handleQuizComplete}
                          onExit={() => setShowQuiz(false)}
                        />
                      </div>
                    )}

                    {/* Speaking Exercise Content */}
                    {isSpeakingLesson && !showSpeaking && (
                      <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#E7F2F2] dark:bg-[#E7F2F2]/30 flex items-center justify-center mx-auto mb-4">
                          <Mic className="h-10 w-10 text-[#0F3D3E] dark:text-[#0F3D3E]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {isEn ? "Speaking Exercise" : "Exercice d'expression orale"}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {isEn 
                            ? "Practice your French speaking skills. Record yourself and listen back." 
                            : "Pratiquez vos compétences orales en français. Enregistrez-vous et réécoutez."}
                        </p>
                        <Button size="lg" onClick={() => setShowSpeaking(true)} className="bg-[#E7F2F2] hover:bg-[#E7F2F2]">
                          <Mic className="h-4 w-4 mr-2" aria-hidden="true" />
                          {isEn ? "Start Speaking" : "Commencer l'exercice"}
                        </Button>
                      </div>
                    )}

                    {isSpeakingLesson && showSpeaking && (
                      <div className="p-4">
                        <SpeakingExercise
                          prompt={isEn 
                            ? "Practice the key phrases from this lesson. Speak clearly and at a natural pace."
                            : "Pratiquez les phrases clés de cette leçon. Parlez clairement et à un rythme naturel."}
                          promptFr="Pratiquez les phrases clés de cette leçon. Parlez clairement et à un rythme naturel."
                          targetPhrase="Je voudrais vous présenter notre nouveau projet."
                          tips={[
                            "Speak at a natural pace",
                            "Focus on clear pronunciation",
                            "Don't worry about mistakes",
                          ]}
                          tipsFr={[
                            "Parlez à un rythme naturel",
                            "Concentrez-vous sur une prononciation claire",
                            "Ne vous inquiétez pas des erreurs",
                          ]}
                          language={language}
                          onComplete={handleSpeakingComplete}
                          onSkip={() => setShowSpeaking(false)}
                        />
                      </div>
                    )}

                    {/* Video Content */}
                    {lesson.contentType === "video" && lesson.videoUrl && (
                      <div className="aspect-video bg-black relative">
                        {lesson.videoProvider === "bunny" ? (
                          <BunnyStreamPlayer
                            videoId={lesson.videoUrl}
                            title={lesson.title}
                          />
                        ) : lesson.videoProvider === "youtube" ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeId(lesson.videoUrl)}?rel=0`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={lesson.title}
                          />
                        ) : lesson.videoProvider === "vimeo" ? (
                          <iframe
                            src={`https://player.vimeo.com/video/${extractVimeoId(lesson.videoUrl)}`}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={lesson.title}
                          />
                        ) : (
                          <video
                            src={lesson.videoUrl}
                            controls
                            className="w-full h-full"
                            poster={lesson.videoThumbnailUrl || undefined}
                          >
                            <track kind="captions" />
                          </video>
                        )}
                      </div>
                    )}

                    {/* Text Content */}
                    {lesson.contentType === "text" && lesson.textContent && (
                      <div className="p-6 prose prose-lg dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: lesson.textContent }} />
                      </div>
                    )}

                    {/* Placeholder for other content types */}
                    {!["video", "text", "quiz", "audio"].includes(lesson.contentType || "") && (
                      <div className="p-8 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {isEn ? "Content coming soon..." : "Contenu à venir..."}
                        </p>
                      </div>
                    )}

                    {/* Legacy activities section removed — ActivityViewer is now the primary content renderer above */}
                  </CardContent>
                </Card>
                )}

                {/* Action Buttons — hidden when inside LearnLayout (LearnLayout has its own bottom bar) */}
                {!isInsideLearnLayout && (
                <div className="flex items-center justify-between mt-6">
                  <Button variant="outline" asChild>
                    <Link href={`/courses/${slug}`}>
                      <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                      {isEn ? "Back to Course" : "Retour au cours"}
                    </Link>
                  </Button>

                  <div className="flex items-center gap-3">
                    {!lessonCompleted && !isQuizLesson && !isSpeakingLesson && (
                      <Button
                        onClick={() => handleMarkComplete(true)}
                        disabled={markCompleteMutation.isPending}
                      >
                        {markCompleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        )}
                        {markCompleteMutation.isPending
                          ? (isEn ? "Saving..." : "Enregistrement...")
                          : (isEn ? "Mark Complete" : "Marquer comme terminé")}
                      </Button>
                    )}

                    {lessonCompleted && nextLesson && (
                      <Button onClick={() => navigateToLesson(nextLesson.id)}>
                        {isEn ? "Next Lesson" : "Leçon suivante"}
                        <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-4">
                <LearnerNotes
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                  language={language}
                />
              </TabsContent>

              {/* Audio Library Tab */}
              <TabsContent value="audio" className="mt-4">
                <AudioLibrary language={isEn ? "en" : "fr"} />
              </TabsContent>

              {/* Discussion Tab */}
              <TabsContent value="discussion" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" aria-hidden="true" />
                      {isEn ? "Discussion" : "Discussion"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">
                        {isEn ? "Join the Conversation" : "Rejoignez la conversation"}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                        {isEn 
                          ? "Share your thoughts, ask questions, and connect with other learners."
                          : "Partagez vos réflexions, posez des questions et connectez-vous avec d'autres apprenants."}
                      </p>
                      <Button variant="outline">
                        {isEn ? "Coming Soon" : "Bientôt disponible"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper functions to extract video IDs
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : url;
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  return match ? match[1] : url;
}
