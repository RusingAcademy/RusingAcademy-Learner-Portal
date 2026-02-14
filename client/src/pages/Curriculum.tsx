import Footer from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import {
  BookOpen,
  GraduationCap,
  Target,
  Award,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Star,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface Course {
  id: string;
  stripeProductId: string;
  level: string;
  levelCategory: "beginner" | "intermediate" | "advanced" | "exam";
  title: string;
  titleFr: string;
  subtitle: string;
  subtitleFr: string;
  description: string;
  descriptionFr: string;
  target: string;
  targetFr: string;
  duration: string;
  modules: number;
  lessons: number;
  priceCAD: number;
  originalPriceCAD: number;
  image: string;
  color: string;
  bgColor: string;
  borderColor: string;
  sleBadge?: string;
}

const courses: Course[] = [
  {
    id: "path-i-foundations",
    stripeProductId: "path-i-foundations",
    level: "A1",
    levelCategory: "beginner",
    title: "Path I: Foundations",
    titleFr: "Path I: Fondations",
    subtitle: "First Professional Steps",
    subtitleFr: "Premiers Pas Professionnels",
    description: "Build foundational workplace French from scratch. Learn essential greetings, introductions, and basic professional communication.",
    descriptionFr: "Construisez les bases du français professionnel. Apprenez les salutations essentielles, les présentations et la communication professionnelle de base.",
    target: "Complete beginners starting their bilingual journey",
    targetFr: "Débutants complets commençant leur parcours bilingue",
    duration: "4 weeks",
    modules: 6,
    lessons: 24,
    priceCAD: 899,
    originalPriceCAD: 999,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/curriculum/path_a1_foundations.jpg",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    id: "path-ii-everyday-fluency",
    stripeProductId: "path-ii-everyday-fluency",
    level: "A2",
    levelCategory: "beginner",
    title: "Path II: Everyday Fluency",
    titleFr: "Path II: Aisance Quotidienne",
    subtitle: "Daily Workplace Interactions",
    subtitleFr: "Interactions Quotidiennes au Travail",
    description: "Expand your vocabulary and handle everyday workplace situations. Master emails, phone calls, and simple meetings.",
    descriptionFr: "Élargissez votre vocabulaire et gérez les situations quotidiennes au travail. Maîtrisez les courriels, les appels téléphoniques et les réunions simples.",
    target: "Learners with basic knowledge seeking practical skills",
    targetFr: "Apprenants avec des connaissances de base cherchant des compétences pratiques",
    duration: "4 weeks",
    modules: 6,
    lessons: 24,
    priceCAD: 899,
    originalPriceCAD: 999,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/curriculum/path_a2_everyday.jpg",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "path-iii-operational-french",
    stripeProductId: "path-iii-operational-french",
    level: "B1",
    levelCategory: "intermediate",
    title: "Path III: Operational French",
    titleFr: "Path III: Français Opérationnel",
    subtitle: "Professional Discussions & Reports",
    subtitleFr: "Discussions Professionnelles et Rapports",
    description: "Achieve BBB level proficiency. Participate confidently in meetings, write professional reports, and handle complex workplace scenarios.",
    descriptionFr: "Atteignez le niveau BBB. Participez avec confiance aux réunions, rédigez des rapports professionnels et gérez des scénarios complexes.",
    target: "Intermediate learners aiming for BBB certification",
    targetFr: "Apprenants intermédiaires visant la certification BBB",
    duration: "4 weeks",
    modules: 6,
    lessons: 24,
    priceCAD: 999,
    originalPriceCAD: 1199,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/curriculum/path_b1_operational.jpg",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-[#FFE4D6]",
    sleBadge: "BBB",
  },
  {
    id: "path-iv-strategic-communication",
    stripeProductId: "path-iv-strategic-communication",
    level: "B2",
    levelCategory: "intermediate",
    title: "Path IV: Strategic Communication",
    titleFr: "Path IV: Communication Stratégique",
    subtitle: "Presentations & Nuanced Expression",
    subtitleFr: "Présentations et Expression Nuancée",
    description: "Reach CBC level for bilingual positions. Master presentations, negotiations, and nuanced professional communication.",
    descriptionFr: "Atteignez le niveau CBC pour les postes bilingues. Maîtrisez les présentations, les négociations et la communication professionnelle nuancée.",
    target: "Upper intermediate learners targeting CBC positions",
    targetFr: "Apprenants de niveau intermédiaire supérieur visant les postes CBC",
    duration: "4 weeks",
    modules: 6,
    lessons: 24,
    priceCAD: 1099,
    originalPriceCAD: 1299,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/curriculum/path_b2_strategic.jpg",
    color: "text-[#0F3D3E]",
    bgColor: "bg-[#E7F2F2]",
    borderColor: "border-[#0F3D3E]",
    sleBadge: "CBC",
  },
  {
    id: "path-v-executive-mastery",
    stripeProductId: "path-v-executive-mastery",
    level: "C1",
    levelCategory: "advanced",
    title: "Path V: Executive Mastery",
    titleFr: "Path V: Maîtrise Exécutive",
    subtitle: "Leadership & Policy Communication",
    subtitleFr: "Leadership et Communication Politique",
    description: "Achieve CCC level for executive roles. Lead strategic discussions, deliver policy briefings, and communicate with executive presence.",
    descriptionFr: "Atteignez le niveau CCC pour les rôles exécutifs. Dirigez des discussions stratégiques, présentez des notes d'information et communiquez avec une présence exécutive.",
    target: "Advanced learners pursuing executive positions",
    targetFr: "Apprenants avancés poursuivant des postes de direction",
    duration: "4 weeks",
    modules: 6,
    lessons: 24,
    priceCAD: 1199,
    originalPriceCAD: 1499,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/curriculum/path_c1_mastery.jpg",
    color: "text-[#C65A1E]",
    bgColor: "bg-[#FFF1E8]",
    borderColor: "border-[#C65A1E]",
    sleBadge: "CCC",
  },
  {
    id: "path-vi-sle-accelerator",
    stripeProductId: "path-vi-sle-accelerator",
    level: "Exam",
    levelCategory: "exam",
    title: "Path VI: SLE Accelerator",
    titleFr: "Path VI: Accélérateur ELS",
    subtitle: "Intensive SLE Preparation",
    subtitleFr: "Préparation Intensive à l'ELS",
    description: "Intensive exam preparation for any SLE level. Practice with real exam simulations, master test strategies, and build confidence.",
    descriptionFr: "Préparation intensive aux examens pour tout niveau ELS. Pratiquez avec des simulations d'examen réelles, maîtrisez les stratégies de test et développez votre confiance.",
    target: "Anyone preparing for upcoming SLE exams",
    targetFr: "Toute personne se préparant aux examens ELS à venir",
    duration: "4 weeks",
    modules: 10,
    lessons: 40,
    priceCAD: 1299,
    originalPriceCAD: 1599,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/curriculum/path_exam_accelerator.jpg",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    sleBadge: "BBB/CBC/CCC",
  },
];

const tabCategories = [
  { id: "all", labelEn: "All Paths", labelFr: "Tous les Parcours" },
  { id: "beginner", labelEn: "Beginner (A1-A2)", labelFr: "Débutant (A1-A2)" },
  { id: "intermediate", labelEn: "Intermediate (B1-B2)", labelFr: "Intermédiaire (B1-B2)" },
  { id: "advanced", labelEn: "Advanced (C1)", labelFr: "Avancé (C1)" },
  { id: "exam", labelEn: "Exam Prep", labelFr: "Préparation Examen" },
];

function CourseCard({ course, isEn, onEnroll, isLoading }: { 
  course: Course; 
  isEn: boolean; 
  onEnroll: (courseId: string) => void;
  isLoading: boolean;
}) {
  const discount = Math.round((1 - course.priceCAD / course.originalPriceCAD) * 100);
  
  return (
    <Card 
      className={`group overflow-hidden border-2 ${course.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          loading="lazy" 
          src={course.image} 
          alt={isEn ? course.title : course.titleFr}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className={`${course.bgColor} ${course.color} border-0 font-bold`}>
            {course.level}
          </Badge>
          {course.sleBadge && (
            <Badge variant="secondary" className="bg-white/90 text-gray-800 font-semibold">
              → {course.sleBadge}
            </Badge>
          )}
        </div>
        {discount > 0 && (
          <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0">
            -{discount}%
          </Badge>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white">
            {isEn ? course.title : course.titleFr}
          </h3>
          <p className="text-white/80 text-sm">
            {isEn ? course.subtitle : course.subtitleFr}
          </p>
        </div>
      </div>
      
      <CardContent className="p-5 space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {isEn ? course.description : course.descriptionFr}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.modules} {isEn ? "modules" : "modules"}
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {course.lessons} {isEn ? "lessons" : "leçons"}
          </div>
        </div>

        <div className={`p-3 rounded-lg ${course.bgColor}`}>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {isEn ? "Ideal for:" : "Idéal pour:"}
          </p>
          <p className={`text-sm font-medium ${course.color}`}>
            {isEn ? course.target : course.targetFr}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${course.priceCAD}</span>
            <span className="text-sm text-muted-foreground line-through">${course.originalPriceCAD}</span>
            <span className="text-xs text-muted-foreground">CAD</span>
          </div>
        </div>

        <Button 
          className="w-full group/btn" 
          onClick={() => onEnroll(course.stripeProductId)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEn ? "Processing..." : "Traitement..."}
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isEn ? "Enroll Now" : "S'inscrire Maintenant"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Curriculum() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState("all");
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  const createCheckout = (trpc as any).createCourseCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info(isEn ? "Redirecting to checkout..." : "Redirection vers le paiement...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || (isEn ? "Failed to create checkout" : "Échec de la création du paiement"));
    },
    onSettled: () => {
      setLoadingCourseId(null);
    },
  });

  const handleEnroll = (courseId: string) => {
    if (!isAuthenticated) {
      toast.info(isEn ? "Please sign in to enroll" : "Veuillez vous connecter pour vous inscrire");
      window.location.href = getLoginUrl();
      return;
    }
    
    setLoadingCourseId(courseId);
    createCheckout.mutate({ 
      courseId, 
      locale: language as "en" | "fr" 
    });
  };

  const filteredCourses = activeTab === "all" 
    ? courses 
    : courses.filter(c => c.levelCategory === activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main id="main-content" className="flex-1">
        <Breadcrumb 
          items={[
            { label: "Discover Our Courses", labelFr: "Découvrez nos cours" }
          ]} 
        />

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 mesh-gradient">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C65A1E]/10 rounded-full blur-3xl" aria-hidden="true" />
          
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="glass-badge px-4 py-1.5 text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                {isEn ? "Path Series™ by RusingÂcademy" : "Série Path™ par RusingÂcademy"}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {isEn ? "Master Your SLE Journey" : "Maîtrisez Votre Parcours ELS"}
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {isEn 
                  ? "Six structured learning paths designed exclusively for Canadian Federal Public Servants. Progress from A1 to C1+ with purpose and precision."
                  : "Six parcours d'apprentissage structurés conçus exclusivement pour les fonctionnaires fédéraux canadiens. Progressez de A1 à C1+ avec précision et détermination."
                }
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-teal-500" />
                  {isEn ? "BBB, CBC, CCC Aligned" : "Aligné BBB, CBC, CCC"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-teal-500" />
                  {isEn ? "Self-Paced Learning" : "Apprentissage à Votre Rythme"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-teal-500" />
                  {isEn ? "GC Workplace Context" : "Contexte de Travail GC"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Section with Tabs */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                {isEn ? "Choose Your Learning Path" : "Choisissez Votre Parcours"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isEn 
                  ? "Each path is designed to take you from your current level to your target SLE certification with structured modules and practical exercises."
                  : "Chaque parcours est conçu pour vous amener de votre niveau actuel à votre certification ELS cible avec des modules structurés et des exercices pratiques."
                }
              </p>
            </div>

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-2 mb-8 h-auto bg-transparent">
                {tabCategories.map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="data-[state=active]:bg-teal-600 data-[state=active]:text-white px-4 py-2 rounded-full border"
                  >
                    {isEn ? tab.labelEn : tab.labelFr}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard 
                      key={course.id}
                      course={course}
                      isEn={isEn}
                      onEnroll={handleEnroll}
                      isLoading={loadingCourseId === course.stripeProductId}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Why RusingAcademy Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  {isEn ? "Why Choose Path Series™?" : "Pourquoi Choisir la Série Path™?"}
                </h2>
                <p className="text-muted-foreground">
                  {isEn 
                    ? "Built by experts who understand the unique challenges of federal language requirements."
                    : "Conçu par des experts qui comprennent les défis uniques des exigences linguistiques fédérales."
                  }
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Target,
                    title: isEn ? "GC-Aligned Content" : "Contenu Aligné GC",
                    description: isEn 
                      ? "Every lesson is designed around real Government of Canada workplace scenarios and evaluation criteria."
                      : "Chaque leçon est conçue autour de scénarios réels du lieu de travail du gouvernement du Canada."
                  },
                  {
                    icon: TrendingUp,
                    title: isEn ? "Structured Progression" : "Progression Structurée",
                    description: isEn 
                      ? "Clear milestones and assessments ensure you're always moving toward your target SLE level."
                      : "Des jalons clairs et des évaluations garantissent que vous progressez toujours vers votre niveau ELS cible."
                  },
                  {
                    icon: Users,
                    title: isEn ? "Expert-Designed" : "Conçu par des Experts",
                    description: isEn 
                      ? "Created by Steven Barholere with 15+ years of experience helping public servants succeed."
                      : "Créé par Steven Barholere avec plus de 15 ans d'expérience à aider les fonctionnaires à réussir."
                  },
                  {
                    icon: Award,
                    title: isEn ? "Proven Results" : "Résultats Prouvés",
                    description: isEn 
                      ? "95% success rate with hundreds of public servants achieving their BBB, CBC, and CCC goals."
                      : "Taux de réussite de 95% avec des centaines de fonctionnaires atteignant leurs objectifs BBB, CBC et CCC."
                  },
                ].map((feature, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                          <feature.icon className="h-6 w-6 text-teal-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                    {isEn ? "Need Personalized Coaching?" : "Besoin d'un Coaching Personnalisé?"}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {isEn 
                      ? "Combine structured self-paced learning with personalized coaching for the fastest path to SLE success."
                      : "Combinez l'apprentissage autonome structuré avec un coaching personnalisé pour le chemin le plus rapide vers le succès ELS."
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/ecosystem">
                      <Button size="lg" className="w-full sm:w-auto">
                        {isEn ? "Explore Coaching Plans" : "Explorer les Plans de Coaching"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/coaches">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        {isEn ? "Meet Our Coaches" : "Rencontrez Nos Coachs"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <div className="text-5xl font-bold mb-2">95%</div>
                    <div className="text-lg opacity-90">
                      {isEn ? "Success Rate" : "Taux de Réussite"}
                    </div>
                    <div className="mt-4 flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="text-sm opacity-75 mt-1">345+ {isEn ? "reviews" : "avis"}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
