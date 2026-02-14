import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  GraduationCap,
  Target,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Star,
  Play,
  FileText,
  Shield,
  Zap,
  Calendar,
  BookMarked,
  Video,
  MessageSquare,
  Layers,
  BarChart3,
  Headphones,
  ChevronRight,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import EcosystemHeaderGold from "@/components/EcosystemHeaderGold";
import { PATH_SERIES_PRICES } from "@shared/pricing";

// Courses Included Section Component
function CoursesIncludedSection({ pathId, language }: { pathId: number; language: string }) {
  const t = language === "fr";
  const { data: courses, isLoading } = trpc.paths.getCourses.useQuery(
    { pathId },
    { enabled: !!pathId }
  );

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="container px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
          {t ? "Cours Inclus" : "Courses Included"}
        </h2>
        <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
          {t
            ? "Ce parcours comprend les cours suivants pour vous guider vers la maîtrise."
            : "This path includes the following courses to guide you toward mastery."}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                {course.thumbnailUrl && (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {t ? `Module ${index + 1}` : `Module ${index + 1}`}
                    </Badge>
                    {course.isRequired && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">
                        {t ? "Requis" : "Required"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {course.description || (t ? "Contenu du cours" : "Course content")}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
                    {course.durationHours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
                        <span>{course.durationHours}h</span>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{course.level}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Fallback path data from pricing constants
const getFallbackPath = (slug: string) => {
  const priceData = Object.values(PATH_SERIES_PRICES).find(p => p.id === slug);
  if (!priceData) return null;
  
  const index = Object.values(PATH_SERIES_PRICES).findIndex(p => p.id === slug);
  
  const descriptions = [
    {
      en: "Build the fundamental communication skills required for basic professional interactions. Learn to introduce yourself, ask simple questions, understand basic messages, and complete essential forms in a workplace context.",
      fr: "Développez les compétences de communication fondamentales requises pour les interactions professionnelles de base. Apprenez à vous présenter, poser des questions simples, comprendre les messages de base et remplir les formulaires essentiels dans un contexte de travail.",
    },
    {
      en: "Develop confidence in daily professional interactions. Learn to discuss past events, future plans, and personal opinions. Engage in routine workplace conversations with increasing spontaneity and accuracy.",
      fr: "Développez votre confiance dans les interactions professionnelles quotidiennes. Apprenez à discuter des événements passés, des plans futurs et des opinions personnelles. Participez à des conversations de routine au travail avec une spontanéité et une précision croissantes.",
    },
    {
      en: "Achieve functional professional autonomy. Develop the ability to present arguments, participate in debates, write structured reports, and handle most workplace communication situations independently and effectively.",
      fr: "Atteignez l'autonomie professionnelle fonctionnelle. Développez la capacité de présenter des arguments, participer à des débats, rédiger des rapports structurés et gérer la plupart des situations de communication au travail de manière indépendante et efficace.",
    },
    {
      en: "Master precision, nuance, and leadership communication. Develop advanced grammatical structures (subjunctive, conditional), persuasive argumentation skills, and the ability to communicate effectively in complex professional contexts.",
      fr: "Maîtrisez la précision, la nuance et la communication de leadership. Développez des structures grammaticales avancées (subjonctif, conditionnel), des compétences d'argumentation persuasive et la capacité de communiquer efficacement dans des contextes professionnels complexes.",
    },
    {
      en: "Achieve expert-level communication with idiomatic mastery and cultural sophistication. Develop the advanced competencies required for executive roles: facilitating meetings, negotiating complex issues, and producing high-quality professional documents.",
      fr: "Atteignez une communication de niveau expert avec une maîtrise idiomatique et une sophistication culturelle. Développez les compétences avancées requises pour les rôles exécutifs: animer des réunions, négocier des questions complexes et produire des documents professionnels de haute qualité.",
    },
    {
      en: "Intensive exam preparation designed specifically for the PSC Second Language Evaluation. Master exam strategies, practice with authentic test materials, and build the confidence needed to achieve your target SLE level (BBB, CBC, or CCC).",
      fr: "Préparation intensive aux examens conçue spécifiquement pour l'Évaluation de langue seconde de la CFP. Maîtrisez les stratégies d'examen, pratiquez avec des matériaux de test authentiques et développez la confiance nécessaire pour atteindre votre niveau ELS cible (BBB, CBC ou CCC).",
    },
  ];

  const learningOutcomes = [
    [
      { en: "Present yourself and others professionally", fr: "Vous présenter et présenter les autres de manière professionnelle" },
      { en: "Ask and answer simple questions about familiar topics", fr: "Poser et répondre à des questions simples sur des sujets familiers" },
      { en: "Understand and use everyday workplace expressions", fr: "Comprendre et utiliser les expressions quotidiennes du lieu de travail" },
      { en: "Describe your workspace and daily routine", fr: "Décrire votre espace de travail et votre routine quotidienne" },
      { en: "Complete administrative forms accurately", fr: "Remplir les formulaires administratifs avec précision" },
      { en: "Write simple professional messages", fr: "Rédiger des messages professionnels simples" },
    ],
    [
      { en: "Narrate past events using appropriate tenses", fr: "Raconter des événements passés en utilisant les temps appropriés" },
      { en: "Discuss future projects and plans confidently", fr: "Discuter des projets et plans futurs avec confiance" },
      { en: "Express simple opinions and preferences", fr: "Exprimer des opinions et préférences simples" },
      { en: "Understand short texts on familiar topics", fr: "Comprendre des textes courts sur des sujets familiers" },
      { en: "Write basic professional emails and messages", fr: "Rédiger des courriels et messages professionnels de base" },
      { en: "Participate in routine workplace exchanges", fr: "Participer aux échanges de routine au travail" },
    ],
    [
      { en: "Present and defend viewpoints with structured arguments", fr: "Présenter et défendre des points de vue avec des arguments structurés" },
      { en: "Narrate complex events using multiple tenses", fr: "Raconter des événements complexes en utilisant plusieurs temps" },
      { en: "Understand main points of presentations and speeches", fr: "Comprendre les points principaux des présentations et discours" },
      { en: "Write structured reports and meeting minutes", fr: "Rédiger des rapports structurés et des procès-verbaux de réunion" },
      { en: "Participate in conversations with spontaneity", fr: "Participer à des conversations avec spontanéité" },
      { en: "Handle unpredictable workplace situations", fr: "Gérer des situations de travail imprévisibles" },
    ],
    [
      { en: "Express hypotheses, conditions, and nuanced opinions", fr: "Exprimer des hypothèses, des conditions et des opinions nuancées" },
      { en: "Analyze complex texts and extract key information", fr: "Analyser des textes complexes et extraire les informations clés" },
      { en: "Develop persuasive, well-structured arguments", fr: "Développer des arguments persuasifs et bien structurés" },
      { en: "Communicate with fluency and spontaneity", fr: "Communiquer avec fluidité et spontanéité" },
      { en: "Write detailed, coherent professional documents", fr: "Rédiger des documents professionnels détaillés et cohérents" },
      { en: "Engage confidently in debates and negotiations", fr: "Participer avec confiance aux débats et négociations" },
    ],
    [
      { en: "Facilitate complex discussions and negotiations", fr: "Animer des discussions et négociations complexes" },
      { en: "Produce high-quality professional documents", fr: "Produire des documents professionnels de haute qualité" },
      { en: "Express nuanced viewpoints with cultural sophistication", fr: "Exprimer des points de vue nuancés avec sophistication culturelle" },
      { en: "Understand implicit meanings and cultural references", fr: "Comprendre les significations implicites et références culturelles" },
      { en: "Adapt communication style to any professional context", fr: "Adapter le style de communication à tout contexte professionnel" },
      { en: "Lead bilingual teams effectively", fr: "Diriger efficacement des équipes bilingues" },
    ],
    [
      { en: "Master SLE exam format and question types", fr: "Maîtriser le format de l'examen ELS et les types de questions" },
      { en: "Develop effective time management strategies", fr: "Développer des stratégies efficaces de gestion du temps" },
      { en: "Practice with authentic exam simulations", fr: "Pratiquer avec des simulations d'examen authentiques" },
      { en: "Build confidence through targeted feedback", fr: "Développer la confiance grâce à des commentaires ciblés" },
      { en: "Identify and address personal weak points", fr: "Identifier et corriger les points faibles personnels" },
      { en: "Achieve target SLE level on first attempt", fr: "Atteindre le niveau ELS cible dès la première tentative" },
    ],
  ];

  return {
    id: index + 1,
    slug: priceData.id,
    title: priceData.name,
    titleFr: priceData.nameFr,
    subtitle: "",
    subtitleFr: "",
    description: descriptions[index]?.en || "",
    descriptionFr: descriptions[index]?.fr || "",
    cefrLevel: priceData.level === "SLE Prep" ? "exam_prep" : priceData.level,
    price: priceData.priceInCents,
    originalPrice: priceData.originalPriceInCents,
    status: "published" as const,
    totalEnrollments: 0,
    averageRating: null,
    totalReviews: 0,
    icon: ["🌱", "💬", "📊", "🎯", "👑", "🏆"][index],
    colorGradient: [
      "from-emerald-500 to-teal-600",
      "from-blue-500 to-indigo-600",
      "from-amber-500 to-orange-600",
      "from-[#0F3D3E] to-[#145A5B]",
      "from-purple-500 to-violet-600",
      "from-rose-500 to-red-600",
    ][index],
    bgColor: [
      "bg-emerald-50",
      "bg-blue-50",
      "bg-amber-50",
      "bg-[#E7F2F2]",
      "bg-purple-50",
      "bg-rose-50",
    ][index],
    levelBadge: ["Beginner", "Elementary", "Intermediate", "Upper Intermediate", "Advanced", "SLE Ready"][index],
    sleBadge: [null, null, "BBB", "CBC", "CCC", "BBB/CBC/CCC"][index],
    durationWeeks: 4,
    structuredHours: 30,
    autonomousPracticeMin: 80,
    autonomousPracticeMax: 130,
    pfl2Level: ["OF 1-6", "OF 7-12", "OF 13-22", "OF 23-32", "OF 33-42", "Exam Prep"][index],
    targetAudience: [
      "Complete beginners starting their bilingual journey",
      "Learners with basic knowledge seeking practical skills",
      "Intermediate learners aiming for BBB certification",
      "Upper intermediate learners targeting CBC positions",
      "Advanced learners pursuing executive positions",
      "Candidates preparing for SLE certification exams",
    ][index],
    targetAudienceFr: [
      "Débutants complets commençant leur parcours bilingue",
      "Apprenants avec des connaissances de base cherchant des compétences pratiques",
      "Apprenants intermédiaires visant la certification BBB",
      "Apprenants de niveau intermédiaire supérieur visant les postes CBC",
      "Apprenants avancés poursuivant des postes exécutifs",
      "Candidats se préparant aux examens de certification ELS",
    ][index],
    learningOutcomes: learningOutcomes[index] || [],
    hasCertificate: true,
    hasQuizzes: true,
    hasCoachingSupport: false,
  };
};

export default function PathDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const t = language === "fr";
  
  // Fetch path from API
  const { data: path, isLoading, error } = trpc.paths.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  
  // Check enrollment status
  const { data: enrollmentStatus } = trpc.paths.checkEnrollment.useQuery(
    { pathId: path?.id || 0 },
    { enabled: !!path?.id && isAuthenticated }
  );
  
  // Enroll mutation (for free paths or after payment)
  const enrollMutation = trpc.paths.enroll.useMutation({
    onSuccess: () => {
      toast.success(t ? "Inscription réussie!" : "Successfully enrolled!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Stripe checkout mutation
  const checkoutMutation = trpc.paths.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info(t ? "Redirection vers le paiement..." : "Redirecting to checkout...");
        window.open(data.checkoutUrl, '_blank');
      }
    },
    onError: (error) => {
      if (error.message.includes("Already enrolled")) {
        toast.info(t ? "Vous êtes déjà inscrit à ce parcours" : "You are already enrolled in this path");
      } else {
        toast.error(error.message);
      }
    },
  });
  
  // Use fallback data if API returns nothing, merge with defaults for missing fields
  const fallbackData = slug ? getFallbackPath(slug) : null;
  const displayPath = path ? {
    ...fallbackData,
    ...path,
    // Ensure these fields have defaults if not in API response
    // @ts-ignore - TS2339: auto-suppressed during TS cleanup
    totalEnrollments: path?.totalEnrollments ?? fallbackData?.totalEnrollments ?? 0,
    targetAudience: (path as any).targetAudience ?? fallbackData?.targetAudience ?? "",
    targetAudienceFr: (path as any).targetAudienceFr ?? fallbackData?.targetAudienceFr ?? "",
    colorGradient: (path as any).colorGradient ?? fallbackData?.colorGradient ?? "from-amber-500 to-orange-600",
    autonomousPracticeMin: (path as any).autonomousPracticeMin ?? fallbackData?.autonomousPracticeMin ?? 80,
    autonomousPracticeMax: (path as any).autonomousPracticeMax ?? fallbackData?.autonomousPracticeMax ?? 130,
    hasCertificate: (path as any).hasCertificate ?? fallbackData?.hasCertificate ?? true,
    hasQuizzes: (path as any).hasQuizzes ?? fallbackData?.hasQuizzes ?? true,
    learningOutcomes: (path as any).learningOutcomes ?? fallbackData?.learningOutcomes ?? [],
    price: typeof path.price === 'string' ? parseInt(path.price) : (path.price ?? fallbackData?.price ?? 0),
    originalPrice: typeof path.originalPrice === 'string' ? parseInt(path.originalPrice as string) : (path.originalPrice ?? fallbackData?.originalPrice),
  } : fallbackData;
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };
  
  const handleEnroll = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    
    if (displayPath?.id && displayPath?.slug) {
      // Use Stripe checkout for paid paths
      checkoutMutation.mutate({ 
        pathId: displayPath.id, 
        pathSlug: displayPath.slug 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <EcosystemHeaderGold />
        <div className="container py-16 px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!displayPath) {
    return (
      <div className="min-h-screen bg-slate-50">
        <EcosystemHeaderGold />
        <div className="container py-16 px-4 text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-700 mb-2">
            {t ? "Parcours non trouvé" : "Path Not Found"}
          </h1>
          <p className="text-slate-500 mb-6">
            {t ? "Ce parcours d'apprentissage n'existe pas." : "This learning path does not exist."}
          </p>
          <Link href="/paths">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t ? "Retour aux Parcours" : "Back to Paths"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <EcosystemHeaderGold />
      
      {/* Hero Section */}
      <section className={`relative py-16 md:py-24 overflow-hidden ${displayPath.bgColor || "bg-amber-50"}`}>
        {/* Banner Image Background */}
        {(displayPath.bannerUrl || displayPath.thumbnailUrl) && (
          <div className="absolute inset-0">
            <img
              src={displayPath.bannerUrl || displayPath.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60" />
          </div>
        )}
        {!(displayPath.bannerUrl || displayPath.thumbnailUrl) && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
        )}
        
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
            <Link href="/" className="hover:text-amber-600">
              {t ? "Accueil" : "Home"}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/paths" className="hover:text-amber-600">
              {t ? "Parcours" : "Paths"}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{displayPath.title}</span>
          </nav>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{displayPath.icon || "📚"}</span>
                <div>
                  <Badge variant="outline" className="mb-1">
                    {displayPath.cefrLevel === "exam_prep" 
                      ? (t ? "Préparation ELS" : "SLE Prep")
                      : `CEFR ${displayPath.cefrLevel}`}
                  </Badge>
                  {displayPath.sleBadge && (
                    <Badge className="ml-2 bg-amber-600 text-white">
                      {displayPath.sleBadge}
                    </Badge>
                  )}
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                {t && displayPath.titleFr ? displayPath.titleFr : displayPath.title}
              </h1>
              
              <p className="text-lg text-slate-600 mb-6">
                {t && displayPath.descriptionFr ? displayPath.descriptionFr : displayPath.description}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{displayPath.durationWeeks || 4}</div>
                  <div className="text-sm text-slate-600">{t ? "Semaines" : "Weeks"}</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                  <BookOpen className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{displayPath.structuredHours || 30}</div>
                  <div className="text-sm text-slate-600">{t ? "Heures" : "Hours"}</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                  <Target className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{displayPath.pfl2Level || "—"}</div>
                  <div className="text-sm text-slate-600">PFL2</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{displayPath?.totalEnrollments || 0}</div>
                  <div className="text-sm text-slate-600">{t ? "Inscrits" : "Enrolled"}</div>
                </div>
              </div>
              
              {/* Target Audience */}
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  {t ? "Public Cible" : "Target Audience"}
                </h3>
                <p className="text-slate-600">
                  {t && displayPath.targetAudienceFr ? displayPath.targetAudienceFr : displayPath.targetAudience}
                </p>
              </div>
            </motion.div>
            
            {/* Right Column - Enrollment Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="sticky top-24 shadow-xl border-slate-200 overflow-hidden">
                {displayPath.thumbnailUrl ? (
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={displayPath.thumbnailUrl}
                      alt={displayPath.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className={`h-2 bg-gradient-to-r ${displayPath.colorGradient || "from-amber-500 to-orange-600"}`} />
                )}
                <CardContent className="p-6 space-y-6">
                  {/* Price */}
                  <div className="text-center pb-6 border-b border-slate-100">
                    {displayPath.originalPrice && displayPath.originalPrice > displayPath.price && (
                      <span className="text-lg text-slate-400 line-through mr-2">
                        {formatPrice(displayPath.originalPrice)}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-slate-900">
                      {formatPrice(displayPath.price)}
                    </span>
                    <span className="text-slate-500 ml-2">CAD</span>
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-slate-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{displayPath.structuredHours || 30} {t ? "heures de contenu structuré" : "hours of structured content"}</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{displayPath.autonomousPracticeMin || 80}-{displayPath.autonomousPracticeMax || 130} {t ? "heures de pratique autonome" : "hours autonomous practice"}</span>
                    </li>
                    {displayPath.hasCertificate && (
                      <li className="flex items-center gap-3 text-slate-700">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{t ? "Certificat de complétion" : "Certificate of completion"}</span>
                      </li>
                    )}
                    {displayPath.hasQuizzes && (
                      <li className="flex items-center gap-3 text-slate-700">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{t ? "Quiz et évaluations" : "Quizzes and assessments"}</span>
                      </li>
                    )}
                    <li className="flex items-center gap-3 text-slate-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{t ? "Accès à vie" : "Lifetime access"}</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{t ? "Support par courriel" : "Email support"}</span>
                    </li>
                  </ul>
                  
                  {/* CTA Button */}
                  {enrollmentStatus?.isEnrolled ? (
                    <div className="space-y-3">
                      <Badge className="w-full justify-center py-2 bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t ? "Déjà inscrit" : "Already Enrolled"}
                      </Badge>
                      <Link href="/app">
                        <Button className="w-full" variant="outline">
                          {t ? "Accéder au Contenu" : "Access Content"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button
                      className={`w-full py-6 text-lg bg-gradient-to-r ${displayPath.colorGradient || "from-amber-500 to-orange-600"} hover:opacity-90 text-white`}
                      onClick={handleEnroll}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t ? "Préparation du paiement..." : "Preparing checkout..."}
                        </span>
                      ) : (
                        <>
                          {t ? "S'inscrire Maintenant" : "Enroll Now"}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Guarantee */}
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-100">
                    <Shield className="w-4 h-4" />
                    <span>{t ? "Garantie satisfait ou remboursé 30 jours" : "30-day money-back guarantee"}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning Outcomes Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
            {t ? "Ce Que Vous Apprendrez" : "What You'll Learn"}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {(displayPath.learningOutcomes as Array<{ en: string; fr: string }> || []).map((outcome, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  {t ? outcome.fr : outcome.en}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Included Section */}
      <CoursesIncludedSection pathId={displayPath.id} language={language} />

      {/* CTA Section */}
      <section className={`py-16 bg-gradient-to-r ${displayPath.colorGradient || "from-amber-600 to-orange-600"}`}>
        <div className="container px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t ? "Prêt à Commencer?" : "Ready to Begin?"}
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            {t
              ? "Rejoignez des milliers de fonctionnaires canadiens qui ont transformé leurs compétences linguistiques avec Path Series."
              : "Join thousands of Canadian public servants who have transformed their language skills with Path Series."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-slate-900 hover:bg-slate-100"
              onClick={handleEnroll}
              disabled={enrollMutation.isPending || enrollmentStatus?.isEnrolled}
            >
              {enrollmentStatus?.isEnrolled ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {t ? "Déjà Inscrit" : "Already Enrolled"}
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  {t ? "S'inscrire pour" : "Enroll for"} {formatPrice(displayPath.price)}
                </>
              )}
            </Button>
            <Link href="/paths">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t ? "Voir Tous les Parcours" : "View All Paths"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EcosystemFooter lang={language === "fr" ? "fr" : "en"} theme="light" activeBrand="rusingacademy" />
    </div>
  );
}
