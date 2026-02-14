import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
// Header removed - using EcosystemLayout sub-header instead
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Award,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import CourseImage from "@/components/CourseImage";
import { motion } from "framer-motion";

const categoryLabels: Record<string, { en: string; fr: string }> = {
  sle_oral: { en: "SLE Oral", fr: "ELS Oral" },
  sle_written: { en: "SLE Written", fr: "ELS Écrit" },
  sle_reading: { en: "SLE Reading", fr: "ELS Lecture" },
  sle_complete: { en: "Complete SLE Prep", fr: "Préparation ELS Complète" },
  business_french: { en: "Business French", fr: "Français des affaires" },
  business_english: { en: "Business English", fr: "Anglais des affaires" },
  exam_prep: { en: "Exam Preparation", fr: "Préparation aux examens" },
  conversation: { en: "Conversation", fr: "Conversation" },
  grammar: { en: "Grammar", fr: "Grammaire" },
  vocabulary: { en: "Vocabulary", fr: "Vocabulaire" },
};

const levelLabels: Record<string, { en: string; fr: string }> = {
  beginner: { en: "Beginner", fr: "Débutant" },
  intermediate: { en: "Intermediate", fr: "Intermédiaire" },
  advanced: { en: "Advanced", fr: "Avancé" },
  all_levels: { en: "All Levels", fr: "Tous niveaux" },
};

export default function Courses() {
  const { language } = useLanguage();
  const isEn = language === "en";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  
  // Fetch courses from API using getAll endpoint
  const { data: courses, isLoading } = trpc.courses.getAll.useQuery({
    category: categoryFilter !== "all" ? categoryFilter as any : undefined,
    difficulty: levelFilter !== "all" ? levelFilter as any : undefined,
    search: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  const displayCourses = courses || [];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return isEn ? `${hours}h` : `${hours}h`;
    return isEn ? `${hours}h ${mins}min` : `${hours}h ${mins}min`;
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="SLE Courses - Path Series™ Curriculum"
        description="Browse our comprehensive SLE course catalog. From beginner to advanced, find the perfect path to your bilingual goals with Path Series™ methodology."
        canonical="https://www.rusingacademy.ca/courses"
      />
      
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4" variant="outline">
              <BookOpen className="h-3 w-3 mr-1" />
              {isEn ? "Self-Paced Learning" : "Apprentissage autonome"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              {isEn ? "Online Courses" : "Cours en ligne"}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {isEn 
                ? "Master your SLE exams with our comprehensive self-paced courses. Learn at your own pace with video lessons, quizzes, and certificates."
                : "Maîtrisez vos examens ELS avec nos cours complets en autonomie. Apprenez à votre rythme avec des leçons vidéo, des quiz et des certificats."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isEn ? "Search courses..." : "Rechercher des cours..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={isEn ? "Category" : "Catégorie"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEn ? "All Categories" : "Toutes catégories"}</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {isEn ? label.en : label.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder={isEn ? "Level" : "Niveau"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEn ? "All Levels" : "Tous niveaux"}</SelectItem>
                  {Object.entries(levelLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {isEn ? label.en : label.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : displayCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isEn ? "No courses found" : "Aucun cours trouvé"}
              </h3>
              <p className="text-muted-foreground">
                {isEn 
                  ? "Try adjusting your filters or search query"
                  : "Essayez d'ajuster vos filtres ou votre recherche"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow group">
                    {/* Thumbnail with elegant fallback */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <CourseImage
                        src={course.thumbnailUrl}
                        alt={course.title}
                        category={course.category || "general_french"}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Play Preview Button */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="lg" variant="secondary" className="gap-2">
                          <Play className="h-5 w-5" />
                          {isEn ? "Preview" : "Aperçu"}
                        </Button>
                      </div>
                      
                      {/* Discount Badge */}
                      {course.originalPrice && course.originalPrice > (course.price || 0) && (
                        <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                          {Math.round((1 - (course.price || 0) / course.originalPrice) * 100)}% OFF
                        </Badge>
                      )}
                      
                      {/* Category Badge */}
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        {course.category ? (categoryLabels[course.category]?.[isEn ? "en" : "fr"] || course.category) : ""}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-xs">
                          {course.level ? (levelLabels[course.level]?.[isEn ? "en" : "fr"] || course.level) : ""}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(course.totalDurationMinutes || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course.totalLessons} {isEn ? "lessons" : "leçons"}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.shortDescription}
                      </p>
                      
                      {/* Instructor & Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {course.instructorName}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {course.averageRating}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {course.totalEnrollments}
                          </span>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="flex gap-3 mt-4">
                        {course.hasCertificate && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Award className="h-3 w-3 text-primary" />
                            {isEn ? "Certificate" : "Certificat"}
                          </span>
                        )}
                        {course.hasQuizzes && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {isEn ? "Quizzes" : "Quiz"}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t pt-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary">
                            {formatPrice(course.price || 0)}
                          </span>
                          {course.originalPrice && course.originalPrice > (course.price || 0) && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(course.originalPrice)}
                            </span>
                          )}
                        </div>
                        <Link href={`/courses/${course.slug}`}>
                          <Button className="gap-1">
                            {isEn ? "View Course" : "Voir le cours"}
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {isEn 
              ? "Prefer personalized coaching?"
              : "Préférez-vous un coaching personnalisé?"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isEn 
              ? "Our expert coaches provide 1-on-1 sessions tailored to your specific needs and learning style."
              : "Nos coachs experts offrent des séances individuelles adaptées à vos besoins spécifiques et à votre style d'apprentissage."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/coaches">
              <Button size="lg" className="gap-2">
                {isEn ? "Browse Coaches" : "Parcourir les coachs"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/ecosystem">
              <Button size="lg" variant="outline" className="gap-2">
                {isEn ? "Try SLE AI Companion AI" : "Essayer SLE AI Companion IA"}
                <Play className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
