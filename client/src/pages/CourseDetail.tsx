import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Helmet } from "react-helmet-async";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Award,
  CheckCircle2,
  Lock,
  FileText,
  Headphones,
  Video,
  ChevronRight,
  Globe,
  Target,
  Zap,
  Download,
  MessageCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import DownloadCourseButton from "@/components/DownloadCourseButton";

// Category configuration
const categoryConfig: Record<string, { icon: typeof BookOpen; labelEn: string; labelFr: string; color: string }> = {
  sle_oral: { icon: Headphones, labelEn: "SLE Oral", labelFr: "ELS Oral", color: "bg-blue-500" },
  sle_written: { icon: FileText, labelEn: "SLE Written", labelFr: "ELS Écrit", color: "bg-green-500" },
  sle_reading: { icon: BookOpen, labelEn: "SLE Reading", labelFr: "ELS Lecture", color: "bg-[#E7F2F2]" },
  sle_complete: { icon: Award, labelEn: "SLE Complete", labelFr: "ELS Complet", color: "bg-[#C65A1E]" },
  business_french: { icon: Globe, labelEn: "Business French", labelFr: "Français des affaires", color: "bg-teal-500" },
  business_english: { icon: Globe, labelEn: "Business English", labelFr: "Anglais des affaires", color: "bg-indigo-500" },
};

const levelConfig: Record<string, { labelEn: string; labelFr: string; color: string }> = {
  beginner: { labelEn: "Beginner", labelFr: "Débutant", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  intermediate: { labelEn: "Intermediate", labelFr: "Intermédiaire", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  advanced: { labelEn: "Advanced", labelFr: "Avancé", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  all_levels: { labelEn: "All Levels", labelFr: "Tous niveaux", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
};

const lessonTypeIcons: Record<string, { icon: typeof Video; color: string; label: string }> = {
  video: { icon: Video, color: "text-blue-500", label: "VIDEO" },
  article: { icon: FileText, color: "text-emerald-500", label: "TEXT" },
  text: { icon: FileText, color: "text-emerald-500", label: "TEXT" },
  quiz: { icon: CheckCircle2, color: "text-orange-500", label: "QUIZ" },
  interactive: { icon: Zap, color: "text-purple-500", label: "INTERACTIVE" },
  audio: { icon: Headphones, color: "text-pink-500", label: "AUDIO" },
  pdf: { icon: Download, color: "text-red-500", label: "PDF" },
  assignment: { icon: Target, color: "text-amber-500", label: "TASK" },
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const isEn = language === "en";
  
  // Fetch course data
  const { data: course, isLoading, error } = trpc.courses.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  
  // Fetch enrollment status (if logged in)
  const { data: user } = trpc.auth.me.useQuery();
  const { data: enrollment } = trpc.courses.getEnrollment.useQuery(
    { courseId: course?.id || 0 },
    { enabled: !!course?.id && !!user }
  );
  
  // Calculate progress
  const progressPercent = enrollment 
    ? Math.round(((enrollment.lessonsCompleted || 0) / (enrollment.totalLessons || 1)) * 100)
    : 0;
  
  // Format helpers
  const formatPrice = (cents: number | null) => {
    if (!cents || cents === 0) return isEn ? "Free" : "Gratuit";
    return `$${(cents / 100).toFixed(0)} CAD`;
  };
  
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };
  
  const getCategoryLabel = (category: string) => {
    const config = categoryConfig[category];
    return config ? (isEn ? config.labelEn : config.labelFr) : category;
  };
  
  const getLevelLabel = (level: string) => {
    const config = levelConfig[level];
    return config ? (isEn ? config.labelEn : config.labelFr) : level;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {isEn ? "Course Not Found" : "Cours non trouvé"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isEn 
              ? "The course you're looking for doesn't exist or has been removed."
              : "Le cours que vous recherchez n'existe pas ou a été supprimé."}
          </p>
          <Button asChild>
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isEn ? "Back to Courses" : "Retour aux cours"}
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  const CategoryIcon = categoryConfig[course.category || ""]?.icon || BookOpen;
  const categoryColor = categoryConfig[course.category || ""]?.color || "bg-primary";
  const levelStyle = levelConfig[course.level || ""]?.color || "bg-muted";
  
  // SEO metadata
  const pageTitle = `${course.title} | Lingueefy`;
  const pageDescription = course.shortDescription || course.description?.substring(0, 160) || "";
  
  // Student preview mode detection
  const isStudentPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'student';

  return (
    <div className="min-h-screen bg-background">
      {/* Student Preview Banner */}
      {isStudentPreview && (
        <div className="bg-amber-500 text-white py-3 px-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <span className="font-medium">
              {isEn ? "You are viewing this course as a student would see it" : "Vous visualisez ce cours tel qu'un étudiant le verrait"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-amber-600 hover:bg-amber-50 border-white"
            onClick={() => window.close()}
          >
            {isEn ? "Exit Preview" : "Quitter l'aperçu"}
          </Button>
        </div>
      )}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        {course.thumbnailUrl && <meta property="og:image" content={course.thumbnailUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>
      
      
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://rusingacademy-cdn.b-cdn.net/images/pattern-grid.svg')] opacity-5" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-20 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/courses" className="hover:text-white transition-colors">
              {isEn ? "Courses" : "Cours"}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-300">{getCategoryLabel(course.category || "")}</span>
          </nav>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={`${categoryColor} text-white`}>
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {getCategoryLabel(course.category || "")}
                  </Badge>
                  <Badge className={levelStyle}>
                    {getLevelLabel(course.level || "")}
                  </Badge>
                  {course.targetLanguage && (
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      <Globe className="h-3 w-3 mr-1" />
                      {course.targetLanguage === "french" ? "Français" : "English"}
                    </Badge>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight">
                  {course.title}
                </h1>
                
                {/* Short Description */}
                <p className="text-lg text-slate-300 mb-6 max-w-2xl">
                  {course.shortDescription}
                </p>
                
                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-6">
                  {course.totalDurationMinutes && course.totalDurationMinutes > 0 && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDuration(course.totalDurationMinutes)}
                    </span>
                  )}
                  {course.totalModules && course.totalModules > 0 && (
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {course.totalModules} {isEn ? "modules" : "modules"}
                    </span>
                  )}
                  {course.totalLessons && course.totalLessons > 0 && (
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {course.totalLessons} {isEn ? "lessons" : "leçons"}
                    </span>
                  )}
                  {course.totalEnrollments && course.totalEnrollments > 0 && (
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {course.totalEnrollments} {isEn ? "students" : "étudiants"}
                    </span>
                  )}
                </div>
                
                {/* Rating */}
                {course.averageRating && Number(course.averageRating) > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(Number(course.averageRating))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-semibold">
                      {Number(course.averageRating).toFixed(1)}
                    </span>
                    {course.totalReviews && course.totalReviews > 0 && (
                      <span className="text-slate-400">
                        ({course.totalReviews} {isEn ? "reviews" : "avis"})
                      </span>
                    )}
                  </div>
                )}
                
                {/* Instructor */}
                {course.instructorName && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                      {course.instructorName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">{isEn ? "Instructor" : "Instructeur"}</p>
                      <p className="font-medium text-white">{course.instructorName}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="sticky top-24 bg-white dark:bg-slate-800 shadow-2xl border-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden rounded-t-lg">
                    {course.thumbnailUrl ? (
                      <img
                        loading="lazy" src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <CategoryIcon className="h-16 w-16 text-primary/50" />
                      </div>
                    )}
                    {course.previewVideoUrl && (
                      <a
                        href={course.previewVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-8 w-8 text-slate-900 ml-1" />
                        </div>
                      </a>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-foreground">
                          {formatPrice(course.price)}
                        </span>
                        {course.originalPrice && course.originalPrice > (course.price || 0) && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">
                              ${(course.originalPrice / 100).toFixed(0)}
                            </span>
                            <Badge variant="destructive" className="ml-auto">
                              {Math.round((1 - (course.price || 0) / course.originalPrice) * 100)}% OFF
                            </Badge>
                          </>
                        )}
                      </div>
                      {course.accessType === "one_time" && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {isEn ? "One-time purchase • Lifetime access" : "Achat unique • Accès à vie"}
                        </p>
                      )}
                    </div>
                    
                    {/* Progress (if enrolled) */}
                    {enrollment && (
                      <div className="mb-6 p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {isEn ? "Your Progress" : "Votre progression"}
                          </span>
                          <span className="text-sm text-primary font-bold">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {enrollment.lessonsCompleted || 0} / {enrollment.totalLessons || 0} {isEn ? "lessons completed" : "leçons terminées"}
                        </p>
                      </div>
                    )}
                    
                    {/* CTA Button */}
                    {enrollment ? (
                      <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg h-14">
                        <Play className="h-5 w-5 mr-2" />
                        {isEn ? "Continue Learning" : "Continuer l'apprentissage"}
                      </Button>
                    ) : user ? (
                      <Button size="lg" className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white text-lg h-14">
                        {(course.price || 0) > 0 ? (
                          <>{isEn ? "Enroll Now" : "S'inscrire maintenant"}</>
                        ) : (
                          <>{isEn ? "Start Free Course" : "Commencer le cours gratuit"}</>
                        )}
                      </Button>
                    ) : (
                      <Button size="lg" className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white text-lg h-14" asChild>
                        <Link href="/signup">
                          {isEn ? "Sign Up to Enroll" : "Inscrivez-vous pour commencer"}
                        </Link>
                      </Button>
                    )}
                    
                    {/* Download for Offline */}
                    {enrollment && (
                      <div className="mt-4">
                        <DownloadCourseButton
                          courseId={course.id as any}
                          // @ts-expect-error - TS2322: auto-suppressed during TS cleanup
                          courseTitle={course.title}
                          courseThumbnail={course.thumbnailUrl || undefined}
                          estimatedSize={Math.round((course.totalDurationMinutes || 30) * 0.5)}
                        />
                      </div>
                    )}
                    
                    {/* Features */}
                    <div className="mt-6 space-y-3">
                      {course.hasCertificate && (
                        <div className="flex items-center gap-3 text-sm">
                          <Award className="h-5 w-5 text-primary" />
                          <span>{isEn ? "Certificate of completion" : "Certificat de réussite"}</span>
                        </div>
                      )}
                      {course.hasQuizzes && (
                        <div className="flex items-center gap-3 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <span>{isEn ? "Quizzes & assessments" : "Quiz et évaluations"}</span>
                        </div>
                      )}
                      {course.hasDownloads && (
                        <div className="flex items-center gap-3 text-sm">
                          <Download className="h-5 w-5 text-primary" />
                          <span>{isEn ? "Downloadable resources" : "Ressources téléchargeables"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-5 w-5 text-primary" />
                        <span>{isEn ? "Access on any device" : "Accès sur tous les appareils"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Course Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {isEn ? "About This Course" : "À propos de ce cours"}
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {course.description?.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* What You'll Learn */}
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {isEn ? "What You'll Learn" : "Ce que vous apprendrez"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    isEn ? "Master key concepts and techniques" : "Maîtriser les concepts et techniques clés",
                    isEn ? "Build practical skills through exercises" : "Développer des compétences pratiques",
                    isEn ? "Prepare for real-world scenarios" : "Se préparer aux scénarios réels",
                    isEn ? "Gain confidence in your abilities" : "Gagner en confiance",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Course Curriculum */}
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {isEn ? "Course Curriculum" : "Programme du cours"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {course.totalModules} {isEn ? "modules" : "modules"} • {course.totalLessons} {isEn ? "lessons" : "leçons"} • {formatDuration(course.totalDurationMinutes)}
                </p>
                
                {course.modules && course.modules.length > 0 ? (
                  <Accordion type="multiple" className="space-y-3">
                    {course.modules.map((module, index) => (
                      <AccordionItem
                        key={module.id}
                        value={`module-${module.id}`}
                        className="border rounded-lg px-4 bg-card"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {module.lessons?.length || 0} {isEn ? "lessons" : "leçons"}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          {module.description && (
                            <p className="text-sm text-muted-foreground mb-4 pl-12">
                              {module.description}
                            </p>
                          )}
                          <div className="space-y-2 pl-12">
                            {module.lessons?.map((lesson) => {
                              const typeConfig = lessonTypeIcons[lesson.contentType || "video"] || lessonTypeIcons.video;
                              const LessonIcon = typeConfig.icon;
                              const isPreview = lesson.isPreview;
                              const isLocked = !enrollment && !isPreview;
                              // Use estimatedMinutes from schema, fallback to videoDurationSeconds
                              const durationMin = lesson.estimatedMinutes || (lesson.videoDurationSeconds ? Math.round(lesson.videoDurationSeconds / 60) : null);
                              
                              return (
                                <div
                                  key={lesson.id}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    isLocked ? "bg-muted/50" : "bg-muted hover:bg-muted/80"
                                  } transition-colors`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-md bg-muted-foreground/10 ${typeConfig.color}`}>
                                      <LessonIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`${isLocked ? "text-muted-foreground" : ""} font-medium`}>
                                        {lesson.title}
                                      </span>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className={`uppercase font-semibold ${typeConfig.color}`}>{typeConfig.label}</span>
                                        {durationMin && (
                                          <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {durationMin} min
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {isPreview && (
                                      <Badge variant="secondary" className="text-xs ml-2">
                                        {isEn ? "Preview" : "Aperçu"}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Play className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <Card className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {isEn ? "Course content is being prepared..." : "Le contenu du cours est en préparation..."}
                    </p>
                  </Card>
                )}
              </div>
              
              {/* Reviews Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {isEn ? "Student Reviews" : "Avis des étudiants"}
                </h2>
                
                {course.reviews && course.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {course.reviews.map((review) => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(review as any).learnerName?.charAt(0) || "S"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {(review as any).learnerName || (isEn ? "Student" : "Étudiant")}
                              </span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-muted-foreground">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {isEn 
                        ? "Be the first to review this course!" 
                        : "Soyez le premier à évaluer ce cours !"}
                    </p>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Requirements */}
              <Card className="p-6 mb-6">
                <h3 className="font-bold mb-4">
                  {isEn ? "Requirements" : "Prérequis"}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {isEn 
                      ? "Basic understanding of French or English" 
                      : "Compréhension de base du français ou de l'anglais"}
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {isEn 
                      ? "Commitment to practice regularly" 
                      : "Engagement à pratiquer régulièrement"}
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {isEn 
                      ? "Computer or mobile device with internet" 
                      : "Ordinateur ou appareil mobile avec internet"}
                  </li>
                </ul>
              </Card>
              
              {/* Target Audience */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">
                  {isEn ? "Who This Course Is For" : "À qui s'adresse ce cours"}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {isEn 
                      ? "Canadian public servants preparing for SLE" 
                      : "Fonctionnaires canadiens préparant l'ELS"}
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {isEn 
                      ? "Professionals seeking bilingual certification" 
                      : "Professionnels visant la certification bilingue"}
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {isEn 
                      ? "Anyone wanting to improve their language skills" 
                      : "Toute personne souhaitant améliorer ses compétences"}
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-[#0d9488] to-[#14b8a6]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {isEn ? "Ready to Start Learning?" : "Prêt à commencer ?"}
          </h2>
          <p className="text-teal-100 mb-6">
            {isEn 
              ? "Join thousands of Canadian public servants who have improved their language skills with Lingueefy."
              : "Rejoignez des milliers de fonctionnaires canadiens qui ont amélioré leurs compétences linguistiques avec Lingueefy."}
          </p>
          {!enrollment && (
            <Button size="lg" className="bg-[#F97316] hover:bg-[#EA580C] text-white text-lg h-14 px-8">
              {(course.price || 0) > 0 
                ? (isEn ? `Enroll for ${formatPrice(course.price)}` : `S'inscrire pour ${formatPrice(course.price)}`)
                : (isEn ? "Start Free Course" : "Commencer le cours gratuit")}
            </Button>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
