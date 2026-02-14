/**
 * LearnCourse Page
 * 
 * Hub page for navigating through a course's modules and lessons with progress tracking
 */

import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  HelpCircle,
  Download,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  GraduationCap,
  Trophy
} from "lucide-react";

// Content type icons
const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <PlayCircle className="h-4 w-4" />,
  text: <FileText className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
  assignment: <BookOpen className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
};

export default function LearnCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = language === "fr";
  
  // Fetch course data - use getBySlug with course ID as slug workaround
  const { data: course, isLoading: courseLoading } = trpc.courses.getBySlug.useQuery(
    { slug: courseId || "" },
    { enabled: !!courseId }
  );
  
  // Fetch course progress (only for authenticated users)
  const { data: progress, isLoading: progressLoading } = trpc.lessons.getCourseProgress.useQuery(
    { courseId: course?.id || 0 },
    { enabled: !!course?.id && isAuthenticated }
  );
  
  // Modules come from the course query
  const modules = course?.modules;
  const modulesLoading = courseLoading;
  
  // Loading state
  if (courseLoading || modulesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container max-w-5xl py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {t ? "Cours non trouvé" : "Course Not Found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t 
                ? "Le cours que vous recherchez n'existe pas ou a été supprimé."
                : "The course you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => setLocation("/paths")}>
              {t ? "Retour aux parcours" : "Back to Paths"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const totalLessons = progress?.totalLessons || 0;
  const completedLessons = progress?.completedLessons || 0;
  const progressPercent = progress?.progressPercent || 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/paths")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t ? "Retour" : "Back"}
              </Button>
            </div>
            
            {isAuthenticated && progress?.nextLesson && (
              <Button
                onClick={() => setLocation(`/courses/${courseId}/lessons/${progress.nextLesson.id}`)}
              >
                {t ? "Continuer" : "Continue Learning"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Course Header */}
      <div className="container max-w-5xl py-8">
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">
            <GraduationCap className="h-3 w-3 mr-1" />
            {course.level || "All Levels"}
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
          <p className="text-lg text-muted-foreground">{course.description}</p>
          
          {/* Progress Section */}
          {isAuthenticated && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t ? "Votre progression" : "Your Progress"}
                    </p>
                    <p className="text-2xl font-bold">{progressPercent}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {t ? "Leçons complétées" : "Lessons Completed"}
                    </p>
                    <p className="text-2xl font-bold">{completedLessons} / {totalLessons}</p>
                  </div>
                </div>
                <Progress value={progressPercent} className="h-3" />
                
                {progress?.lastAccessedLesson && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t ? "Dernière leçon consultée" : "Last Accessed"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/courses/${courseId}/lessons/${progress.lastAccessedLesson.id}`)}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {progress.lastAccessedLesson.title}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {t ? "Contenu du cours" : "Course Content"}
          </h2>
          
          <Accordion type="multiple" defaultValue={modules?.map(m => `module-${m.id}`) || []}>
            {modules?.map((module, moduleIndex) => {
              const moduleProgress = progress?.modules?.find(m => m.id === module.id);
              const modulePercent = moduleProgress?.progressPercent || 0;
              
              return (
                <AccordionItem key={module.id} value={`module-${module.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {moduleIndex + 1}
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{module.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {(module as any).lessons?.length || 0} {t ? "leçons" : "lessons"}
                            {module.totalDurationMinutes && ` • ${module.totalDurationMinutes} min`}
                          </p>
                        </div>
                      </div>
                      
                      {isAuthenticated && (
                        <div className="flex items-center gap-2">
                          {modulePercent === 100 ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t ? "Terminé" : "Complete"}
                            </Badge>
                          ) : modulePercent > 0 ? (
                            <Badge variant="outline">
                              {modulePercent}%
                            </Badge>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent>
                    <div className="space-y-2 pl-11">
                      {(module as any).lessons?.map((lesson, lessonIndex) => {
                        // @ts-expect-error - TS2339: auto-suppressed during TS cleanup
                        const lessonProgress = moduleProgress?.lessons?.find(l => l.id === lesson.id);
                        const isCompleted = lessonProgress?.status === "completed";
                        const isInProgress = lessonProgress?.status === "in_progress";
                        
                        return (
                          <Link
                            key={lesson.id}
                            href={`/courses/${courseId}/lessons/${lesson.id}`}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : isInProgress ? (
                                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-300" />
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {contentTypeIcons[lesson.contentType || "text"]}
                                <span className={`${isCompleted ? "text-muted-foreground" : ""}`}>
                                  {lesson.title}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="text-sm">{lesson.totalDurationMinutes || 5} min</span>
                              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
        
        {/* Completion Card */}
        {isAuthenticated && progressPercent === 100 && (
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                {t ? "Félicitations!" : "Congratulations!"}
              </h3>
              <p className="text-green-700 mb-4">
                {t 
                  ? "Vous avez terminé ce cours avec succès."
                  : "You have successfully completed this course."}
              </p>
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                {t ? "Obtenir le certificat" : "Get Certificate"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
