import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  Lock,
  Shield,
  Zap,
  TrendingUp,
  Building2,
  Quote,
  BadgeCheck,
  Calendar,
  BookMarked,
  Brain,
  Lightbulb,
  Video,
  MessageSquare,
  Layers,
  Compass,
  BarChart3,
  UserCheck,
  Headphones,
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import { PATH_SERIES_PRICES } from "@shared/pricing";

// Path Series data aligned with rusing.academy - CORRECT DATA
const pathSeriesData = [
  {
    id: "path-i",
    slug: "path-i-foundations",
    level: "CEFR A1",
    levelBadge: "Beginner",
    title: "Path I: FSL - Foundations",
    titleFr: "Path I: FLS - Fondations",
    subtitle: "Crash Course in Essential Communication Foundations",
    subtitleFr: "Cours Intensif sur les Bases Essentielles de la Communication",
    description: "Build the fundamental communication skills required for basic professional interactions. Learn to introduce yourself, ask simple questions, understand basic messages, and complete essential forms in a workplace context.",
    descriptionFr: "Développez les compétences de communication fondamentales requises pour les interactions professionnelles de base. Apprenez à vous présenter, poser des questions simples, comprendre les messages de base et remplir les formulaires essentiels dans un contexte de travail.",
    target: "Complete beginners starting their bilingual journey",
    targetFr: "Débutants complets commençant leur parcours bilingue",
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 1-6",
    price: PATH_SERIES_PRICES.PATH_I.priceInCents / 100,
    originalPrice: PATH_SERIES_PRICES.PATH_I.originalPriceInCents / 100,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: "🌱",
    learningOutcomes: [
      { en: "Present yourself and others professionally", fr: "Vous présenter et présenter les autres de manière professionnelle" },
      { en: "Ask and answer simple questions about familiar topics", fr: "Poser et répondre à des questions simples sur des sujets familiers" },
      { en: "Understand and use everyday workplace expressions", fr: "Comprendre et utiliser les expressions quotidiennes du lieu de travail" },
      { en: "Describe your workspace and daily routine", fr: "Décrire votre espace de travail et votre routine quotidienne" },
      { en: "Complete administrative forms accurately", fr: "Remplir les formulaires administratifs avec précision" },
      { en: "Write simple professional messages", fr: "Rédiger des messages professionnels simples" },
    ],
  },
  {
    id: "path-ii",
    slug: "path-ii-everyday-fluency",
    level: "CEFR A2",
    levelBadge: "Elementary",
    title: "Path II: FSL - Everyday Fluency",
    titleFr: "Path II: FLS - Aisance Quotidienne",
    subtitle: "Crash Course in Everyday Workplace Interactions",
    subtitleFr: "Cours Intensif sur les Interactions Quotidiennes au Travail",
    description: "Develop confidence in daily professional interactions. Learn to discuss past events, future plans, and personal opinions. Engage in routine workplace conversations with increasing spontaneity and accuracy.",
    descriptionFr: "Développez votre confiance dans les interactions professionnelles quotidiennes. Apprenez à discuter des événements passés, des plans futurs et des opinions personnelles. Participez à des conversations de routine au travail avec une spontanéité et une précision croissantes.",
    target: "Learners with basic knowledge seeking practical skills",
    targetFr: "Apprenants avec des connaissances de base cherchant des compétences pratiques",
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 7-12",
    price: PATH_SERIES_PRICES.PATH_II.priceInCents / 100,
    originalPrice: PATH_SERIES_PRICES.PATH_II.originalPriceInCents / 100,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "💬",
    learningOutcomes: [
      { en: "Narrate past events using appropriate tenses", fr: "Raconter des événements passés en utilisant les temps appropriés" },
      { en: "Discuss future projects and plans confidently", fr: "Discuter des projets et plans futurs avec confiance" },
      { en: "Express simple opinions and preferences", fr: "Exprimer des opinions et préférences simples" },
      { en: "Understand short texts on familiar topics", fr: "Comprendre des textes courts sur des sujets familiers" },
      { en: "Write basic professional emails and messages", fr: "Rédiger des courriels et messages professionnels de base" },
      { en: "Participate in routine workplace exchanges", fr: "Participer aux échanges de routine au travail" },
    ],
  },
  {
    id: "path-iii",
    slug: "path-iii-operational-french",
    level: "CEFR B1",
    levelBadge: "Intermediate",
    title: "Path III: FSL - Operational French",
    titleFr: "Path III: FLS - Français Opérationnel",
    subtitle: "Crash Course in Professional Communication for Public Servants",
    subtitleFr: "Cours Intensif en Communication Professionnelle pour Fonctionnaires",
    description: "Achieve functional professional autonomy. Develop the ability to present arguments, participate in debates, write structured reports, and handle most workplace communication situations independently and effectively.",
    descriptionFr: "Atteignez l'autonomie professionnelle fonctionnelle. Développez la capacité de présenter des arguments, participer à des débats, rédiger des rapports structurés et gérer la plupart des situations de communication au travail de manière indépendante et efficace.",
    target: "Intermediate learners aiming for BBB certification",
    targetFr: "Apprenants intermédiaires visant la certification BBB",
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 13-22",
    price: PATH_SERIES_PRICES.PATH_III.priceInCents / 100,
    originalPrice: PATH_SERIES_PRICES.PATH_III.originalPriceInCents / 100,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    borderColor: "border-[#FFE4D6]",
    icon: "📊",
    sleBadge: "BBB",
    learningOutcomes: [
      { en: "Present and defend viewpoints with structured arguments", fr: "Présenter et défendre des points de vue avec des arguments structurés" },
      { en: "Narrate complex events using multiple tenses", fr: "Raconter des événements complexes en utilisant plusieurs temps" },
      { en: "Understand main points of presentations and speeches", fr: "Comprendre les points principaux des présentations et discours" },
      { en: "Write structured reports and meeting minutes", fr: "Rédiger des rapports structurés et des procès-verbaux de réunion" },
      { en: "Participate in conversations with spontaneity", fr: "Participer à des conversations avec spontanéité" },
      { en: "Handle unpredictable workplace situations", fr: "Gérer des situations de travail imprévisibles" },
    ],
  },
  {
    id: "path-iv",
    slug: "path-iv-strategic-expression",
    level: "CEFR B2",
    levelBadge: "Upper Intermediate",
    title: "Path IV: FSL - Strategic Expression",
    titleFr: "Path IV: FLS - Expression Stratégique",
    subtitle: "Crash Course in Strategic Workplace Communication",
    subtitleFr: "Cours Intensif en Communication Stratégique au Travail",
    description: "Master precision, nuance, and leadership communication. Develop advanced grammatical structures (subjunctive, conditional), persuasive argumentation skills, and the ability to communicate effectively in complex professional contexts.",
    descriptionFr: "Maîtrisez la précision, la nuance et la communication de leadership. Développez des structures grammaticales avancées (subjonctif, conditionnel), des compétences d'argumentation persuasive et la capacité de communiquer efficacement dans des contextes professionnels complexes.",
    target: "Upper intermediate learners targeting CBC positions",
    targetFr: "Apprenants de niveau intermédiaire supérieur visant les postes CBC",
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 23-32",
    price: PATH_SERIES_PRICES.PATH_IV.priceInCents / 100,
    originalPrice: PATH_SERIES_PRICES.PATH_IV.originalPriceInCents / 100,
    color: "from-[#0F3D3E] to-[#145A5B]",
    bgColor: "bg-[#E7F2F2]",
    borderColor: "border-[#0F3D3E]",
    icon: "🎯",
    sleBadge: "CBC",
    learningOutcomes: [
      { en: "Express hypotheses, conditions, and nuanced opinions", fr: "Exprimer des hypothèses, des conditions et des opinions nuancées" },
      { en: "Analyze complex texts and extract key information", fr: "Analyser des textes complexes et extraire les informations clés" },
      { en: "Develop persuasive, well-structured arguments", fr: "Développer des arguments persuasifs et bien structurés" },
      { en: "Communicate with fluency and spontaneity", fr: "Communiquer avec fluidité et spontanéité" },
      { en: "Write detailed, coherent professional documents", fr: "Rédiger des documents professionnels détaillés et cohérents" },
      { en: "Engage confidently in debates and negotiations", fr: "Participer avec confiance aux débats et négociations" },
    ],
  },
  {
    id: "path-v",
    slug: "path-v-professional-mastery",
    level: "CEFR C1",
    levelBadge: "Advanced",
    title: "Path V: FSL - Professional Mastery",
    titleFr: "Path V: FLS - Maîtrise Professionnelle",
    subtitle: "Crash Course in Advanced Professional Excellence",
    subtitleFr: "Cours Intensif en Excellence Professionnelle Avancée",
    description: "Achieve expert-level communication with idiomatic mastery and cultural sophistication. Develop the advanced competencies required for executive roles: facilitating meetings, negotiating complex issues, and producing high-quality professional documents.",
    descriptionFr: "Atteignez une communication de niveau expert avec une maîtrise idiomatique et une sophistication culturelle. Développez les compétences avancées requises pour les rôles exécutifs: animer des réunions, négocier des questions complexes et produire des documents professionnels de haute qualité.",
    target: "Advanced learners pursuing executive positions",
    targetFr: "Apprenants avancés poursuivant des postes exécutifs",
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 33-42",
    price: PATH_SERIES_PRICES.PATH_V.priceInCents / 100,
    originalPrice: PATH_SERIES_PRICES.PATH_V.originalPriceInCents / 100,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: "👑",
    sleBadge: "CCC",
    learningOutcomes: [
      { en: "Facilitate complex discussions and negotiations", fr: "Animer des discussions et négociations complexes" },
      { en: "Produce high-quality professional documents", fr: "Produire des documents professionnels de haute qualité" },
      { en: "Express nuanced viewpoints with cultural sophistication", fr: "Exprimer des points de vue nuancés avec sophistication culturelle" },
      { en: "Understand implicit meanings and cultural references", fr: "Comprendre les significations implicites et références culturelles" },
      { en: "Adapt communication style to any professional context", fr: "Adapter le style de communication à tout contexte professionnel" },
      { en: "Lead bilingual teams effectively", fr: "Diriger efficacement des équipes bilingues" },
    ],
  },
  {
    id: "path-vi",
    slug: "path-vi-sle-accelerator",
    level: "Exam Prep",
    levelBadge: "SLE Ready",
    title: "Path VI: FSL - SLE Accelerator",
    titleFr: "Path VI: FLS - Accélérateur ELS",
    subtitle: "Intensive SLE Exam Preparation Program",
    subtitleFr: "Programme Intensif de Préparation à l'Examen ELS",
    description: "Intensive exam preparation designed specifically for the PSC Second Language Evaluation. Master exam strategies, practice with authentic test materials, and build the confidence needed to achieve your target SLE level (BBB, CBC, or CCC).",
    descriptionFr: "Préparation intensive aux examens conçue spécifiquement pour l'Évaluation de langue seconde de la CFP. Maîtrisez les stratégies d'examen, pratiquez avec des matériaux de test authentiques et développez la confiance nécessaire pour atteindre votre niveau ELS cible (BBB, CBC ou CCC).",
    target: "Candidates preparing for SLE certification exams",
    targetFr: "Candidats se préparant aux examens de certification ELS",
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    practiceExams: "5 Complete Exams",
    coachingSessions: "5-Hour Quick Prep",
    price: PATH_SERIES_PRICES.PATH_VI.priceInCents / 100,
    originalPrice: PATH_SERIES_PRICES.PATH_VI.originalPriceInCents / 100,
    color: "from-rose-500 to-red-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    icon: "🏆",
    sleBadge: "BBB/CBC/CCC",
    learningOutcomes: [
      { en: "Master SLE exam format and question types", fr: "Maîtriser le format de l'examen ELS et les types de questions" },
      { en: "Develop effective time management strategies", fr: "Développer des stratégies efficaces de gestion du temps" },
      { en: "Practice with authentic exam simulations", fr: "Pratiquer avec des simulations d'examen authentiques" },
      { en: "Build confidence through targeted feedback", fr: "Développer la confiance grâce à des commentaires ciblés" },
      { en: "Identify and address personal weak points", fr: "Identifier et corriger les points faibles personnels" },
      { en: "Achieve target SLE level on first attempt", fr: "Atteindre le niveau ELS cible dès la première tentative" },
    ],
  },
];

// Testimonials
const testimonials = [
  {
    name: "Sarah M.",
    role: "Policy Analyst",
    org: "Treasury Board",
    rating: 5,
    quote: "Path Series helped me go from Level A to BBB in just 6 months. The structured approach made all the difference.",
    quoteFr: "Path Series m'a aidée à passer du niveau A au BBB en seulement 6 mois. L'approche structurée a fait toute la différence.",
  },
  {
    name: "Marc D.",
    role: "Program Officer",
    org: "ESDC",
    rating: 5,
    quote: "The SLE Accelerator was exactly what I needed. I passed my CBC exam on the first try!",
    quoteFr: "L'Accélérateur ELS était exactement ce dont j'avais besoin. J'ai réussi mon examen CBC du premier coup!",
  },
  {
    name: "Jennifer L.",
    role: "Senior Advisor",
    org: "Health Canada",
    rating: 5,
    quote: "Finally, a program that understands the needs of federal public servants. Highly recommended!",
    quoteFr: "Enfin, un programme qui comprend les besoins des fonctionnaires fédéraux. Hautement recommandé!",
  },
];

// Value propositions
const valueProps = [
  {
    icon: Target,
    title: "SLE-Focused",
    titleFr: "Axé sur l'ELS",
    desc: "Curriculum designed specifically for PSC Second Language Evaluation success.",
    descFr: "Programme conçu spécifiquement pour réussir l'Évaluation de langue seconde de la CFP.",
  },
  {
    icon: Award,
    title: "Proven Results",
    titleFr: "Résultats Prouvés",
    desc: "94% of our students achieve their target SLE level within 6 months.",
    descFr: "94% de nos étudiants atteignent leur niveau ELS cible en 6 mois.",
  },
  {
    icon: Users,
    title: "Expert Instructors",
    titleFr: "Instructeurs Experts",
    desc: "Learn from certified SLE coaches with 10+ years of federal experience.",
    descFr: "Apprenez de coachs ELS certifiés avec plus de 10 ans d'expérience fédérale.",
  },
  {
    icon: Zap,
    title: "Flexible Learning",
    titleFr: "Apprentissage Flexible",
    desc: "Study at your own pace with lifetime access to all course materials.",
    descFr: "Étudiez à votre rythme avec un accès à vie à tous les supports de cours.",
  },
];

// Trusted organizations
const trustedOrgs = [
  "Treasury Board",
  "Health Canada",
  "ESDC",
  "CRA",
  "IRCC",
  "DND",
];

// Curriculum Design Philosophy principles
const designPrinciples = [
  {
    number: 1,
    title: "Authentic",
    titleFr: "Authentique",
    desc: "Grounded in real-world public service communication scenarios",
    descFr: "Ancré dans des scénarios de communication réels du service public",
  },
  {
    number: 2,
    title: "Task-Based",
    titleFr: "Basé sur les Tâches",
    desc: "Focused on practical competencies you'll use immediately in your role",
    descFr: "Axé sur les compétences pratiques que vous utiliserez immédiatement dans votre rôle",
  },
  {
    number: 3,
    title: "Measurable",
    titleFr: "Mesurable",
    desc: "Aligned with official PSC evaluation criteria for SLE/ELP exams",
    descFr: "Aligné sur les critères d'évaluation officiels de la CFP pour les examens ELS/ELP",
  },
  {
    number: 4,
    title: "Adaptive",
    titleFr: "Adaptatif",
    desc: "Personalized based on diagnostic assessment and ongoing performance tracking",
    descFr: "Personnalisé selon l'évaluation diagnostique et le suivi continu des performances",
  },
  {
    number: 5,
    title: "Engaging",
    titleFr: "Engageant",
    desc: "Enhanced with interactive elements and multimedia resources",
    descFr: "Enrichi d'éléments interactifs et de ressources multimédias",
  },
];

// Path Series differentiators
const pathDifferentiators = [
  {
    title: "Structured Progression",
    titleFr: "Progression Structurée",
    desc: "Clear milestones from A1 to C1 with defined learning outcomes at each level",
    descFr: "Jalons clairs de A1 à C1 avec des résultats d'apprentissage définis à chaque niveau",
  },
  {
    title: "Accelerated Performance",
    titleFr: "Performance Accélérée",
    desc: "Intensive 4-week modules with measurable outcomes and rapid skill acquisition",
    descFr: "Modules intensifs de 4 semaines avec des résultats mesurables et une acquisition rapide des compétences",
  },
  {
    title: "Deep Consolidation",
    titleFr: "Consolidation Profonde",
    desc: "Spaced repetition, booster sessions, and community practice to ensure long-term retention",
    descFr: "Répétition espacée, séances de rappel et pratique communautaire pour assurer la rétention à long terme",
  },
];

// Module preview component that fetches from DB
function CurriculumModulePreview({ slug, isEn }: { slug: string; isEn: boolean }) {
  const { data: course, isLoading } = trpc.courses.getBySlug.useQuery(
    { slug },
    { enabled: !!slug, staleTime: 5 * 60 * 1000 }
  );
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!course?.modules || course.modules.length === 0) {
    // Show placeholder modules when no DB data
    const placeholderModules = [
      { en: "Module 1: Core Foundations", fr: "Module 1: Fondations Essentielles" },
      { en: "Module 2: Practical Application", fr: "Module 2: Application Pratique" },
      { en: "Module 3: Communication Skills", fr: "Module 3: Compétences en Communication" },
      { en: "Module 4: Professional Context", fr: "Module 4: Contexte Professionnel" },
      { en: "Module 5: Assessment & Review", fr: "Module 5: Évaluation et Révision" },
      { en: "Module 6: Final Certification", fr: "Module 6: Certification Finale" },
    ];
    return (
      <div className="space-y-2">
        {placeholderModules.map((mod, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#C65A1E]/10 text-[#C65A1E] flex items-center justify-center font-bold text-sm">
              {i + 1}
            </div>
            <span className="text-sm font-medium text-[#0F3D3E]">{isEn ? mod.en : mod.fr}</span>
            <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {course.modules.map((mod: any, index: number) => (
        <div key={mod.id}>
          <button
            onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            {mod.thumbnailUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border">
                <img src={mod.thumbnailUrl} alt={mod.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#C65A1E]/10 text-[#C65A1E] flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
            )}
            <div className="flex-1">
              <span className="text-sm font-medium text-[#0F3D3E]">{mod.title}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {mod.lessons?.length || mod.totalLessons || 0} {isEn ? "lessons" : "leçons"}
              </span>
            </div>
            {expandedModule === mod.id ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedModule === mod.id && mod.lessons && mod.lessons.length > 0 && (
            <div className="ml-11 mt-1 space-y-1 pb-2">
              {mod.lessons.map((lesson: any) => (
                <div key={lesson.id} className="flex items-center gap-2 py-1.5 px-3 rounded text-xs">
                  {lesson.contentType === "video" ? (
                    <Play className="h-3 w-3 text-[#C65A1E]" />
                  ) : lesson.contentType === "quiz" ? (
                    <Target className="h-3 w-3 text-purple-500" />
                  ) : (
                    <FileText className="h-3 w-3 text-blue-500" />
                  )}
                  <span className="text-muted-foreground">{lesson.title}</span>
                  {lesson.isPreview && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-auto">
                      {isEn ? "Preview" : "Aperçu"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CurriculumPathSeries() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const isEn = language === "en";
  const [selectedPath, setSelectedPath] = useState("path-i");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchaseMutation = trpc.stripe.createCourseCheckout.useMutation({
    onSuccess: (data) => {
      toast.success(isEn ? "Redirecting to checkout..." : "Redirection vers le paiement...");
      window.open(data.url, "_blank");
      setIsPurchasing(false);
    },
    onError: (error) => {
      toast.error(error.message || (isEn ? "Failed to start checkout" : "Échec du démarrage du paiement"));
      setIsPurchasing(false);
    },
  });

  const handlePurchase = (courseSlug: string) => {
    if (!isAuthenticated) {
      toast.info(isEn ? "Please log in to purchase" : "Veuillez vous connecter pour acheter");
      window.location.href = getLoginUrl();
      return;
    }
    
    setIsPurchasing(true);
    purchaseMutation.mutate({
      courseId: courseSlug,
      locale: language as 'en' | 'fr',
    });
  };

  const currentPath = pathSeriesData.find(p => p.id === selectedPath) || pathSeriesData[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-br from-[#0F3D3E] via-[#145A5B] to-[#0F3D3E]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge className="bg-[#C65A1E] text-white px-4 py-1.5 text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                {isEn ? "GC Bilingual Mastery Series" : "Série Maîtrise Bilingue GC"}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                <span className="italic font-serif">{isEn ? "The Six Paths to" : "Les Six Parcours vers"}</span>
                <br />
                <span className="text-[#C65A1E]">{isEn ? "Bilingual Mastery" : "la Maîtrise Bilingue"}</span>
              </h1>
              
              <p className="text-xl text-white/80 max-w-3xl mx-auto" style={{color: '#f7f9fd'}}>
                {isEn 
                  ? "A comprehensive, evidence-based curriculum designed exclusively for Canadian Public Service professionals seeking bilingual excellence and career advancement."
                  : "Un curriculum complet et fondé sur des preuves, conçu exclusivement pour les professionnels de la fonction publique canadienne recherchant l'excellence bilingue et l'avancement de carrière."
                }
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#C65A1E]">6</div>
                  <div className="text-sm text-white/70">{isEn ? "Complete Paths" : "Parcours Complets"}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#C65A1E]">180</div>
                  <div className="text-sm text-white/70">{isEn ? "Structured Hours" : "Heures Structurées"}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#C65A1E]">3-4x</div>
                  <div className="text-sm text-white/70">{isEn ? "Faster Results" : "Résultats Plus Rapides"}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#C65A1E]">94%</div>
                  <div className="text-sm text-white/70">{isEn ? "Success Rate" : "Taux de Réussite"}</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-[#C65A1E] hover:bg-[#A84A15] text-white"
                  onClick={() => document.getElementById('paths-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {isEn ? "Explore Paths" : "Explorer les Parcours"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/ecosystem">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    {isEn ? "Talk to a Coach" : "Parler à un Coach"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About the Program Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-[#C65A1E] uppercase tracking-wider mb-2">
                  {isEn ? "About the Program" : "À Propos du Programme"}
                </p>
                <h2 className="text-3xl font-bold text-[#0F3D3E] mb-6">
                  {isEn ? "The GC Bilingual Mastery Series" : "La Série Maîtrise Bilingue GC"}
                </h2>
              </div>

              <div className="bg-[#FDF8F3] rounded-2xl p-8 md:p-10 shadow-sm">
                <p className="text-lg text-[#0F3D3E] leading-relaxed mb-6">
                  {isEn 
                    ? "The GC Bilingual Mastery Series represents a paradigm shift in professional language training for Canada's federal public service. Developed by RusingÂcademy in collaboration with leading language acquisition specialists, this program combines cutting-edge pedagogical research with the practical realities of public service communication requirements."
                    : "La Série Maîtrise Bilingue GC représente un changement de paradigme dans la formation linguistique professionnelle pour la fonction publique fédérale du Canada. Développé par RusingÂcademy en collaboration avec des spécialistes de premier plan en acquisition des langues, ce programme combine la recherche pédagogique de pointe avec les réalités pratiques des exigences de communication du service public."
                  }
                </p>
                <p className="text-lg text-[#0F3D3E] leading-relaxed">
                  {isEn 
                    ? "Unlike traditional language programs that follow a one-size-fits-all approach, the GC Bilingual Mastery Series is built on the proprietary Path Series™ methodology — a structured, progressive learning framework that recognizes the unique challenges faced by working professionals who must balance career responsibilities with intensive language acquisition."
                    : "Contrairement aux programmes linguistiques traditionnels qui suivent une approche universelle, la Série Maîtrise Bilingue GC est construite sur la méthodologie propriétaire Path Series™ — un cadre d'apprentissage structuré et progressif qui reconnaît les défis uniques auxquels font face les professionnels en activité qui doivent équilibrer leurs responsabilités professionnelles avec l'acquisition intensive d'une langue."
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Path Series Methodology Section */}
        <section className="py-16 bg-[#FDF8F3]">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-[#C65A1E] uppercase tracking-wider mb-2">
                  {isEn ? "Our Approach" : "Notre Approche"}
                </p>
                <h2 className="text-3xl font-bold text-[#0F3D3E] mb-6">
                  {isEn ? "The Path Series™ Methodology" : "La Méthodologie Path Series™"}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {isEn 
                    ? "At the heart of our program lies the Path Series™, an innovative pedagogical framework that transforms language learning from a passive, classroom-based experience into an active, task-oriented journey."
                    : "Au cœur de notre programme se trouve Path Series™, un cadre pédagogique innovant qui transforme l'apprentissage des langues d'une expérience passive en classe en un parcours actif et orienté vers les tâches."
                  }
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg mb-12">
                <p className="text-lg text-[#0F3D3E] leading-relaxed">
                  {isEn 
                    ? "Each Path (I through VI) corresponds to a specific CEFR level and is designed as a self-contained, intensive learning experience that builds systematically on previous competencies. This ensures that every learner progresses at the optimal pace while maintaining the depth of understanding required for true bilingual proficiency."
                    : "Chaque Path (I à VI) correspond à un niveau CEFR spécifique et est conçu comme une expérience d'apprentissage intensive et autonome qui s'appuie systématiquement sur les compétences précédentes. Cela garantit que chaque apprenant progresse au rythme optimal tout en maintenant la profondeur de compréhension requise pour une véritable maîtrise bilingue."
                  }
                </p>
              </div>

              {/* What Makes Path Series Different */}
              <div className="bg-[#0F3D3E] rounded-2xl p-8 md:p-10 text-white">
                <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#fdfcfc'}}>
                  {isEn ? "What Makes Path Series™ Different?" : "Qu'est-ce qui Rend Path Series™ Différent?"}
                </h3>
                <p className="text-white/80 text-center mb-8 max-w-2xl mx-auto" style={{color: '#f9fafa'}}>
                  {isEn 
                    ? "The Path Series™ methodology integrates three critical dimensions:"
                    : "La méthodologie Path Series™ intègre trois dimensions critiques:"
                  }
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {pathDifferentiators.map((diff, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#C65A1E] flex items-center justify-center text-white font-bold text-xl">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-lg mb-3 text-[#C65A1E]">
                        {isEn ? diff.title : diff.titleFr}
                      </h4>
                      <p className="text-sm text-white/70" style={{color: '#ffffff'}}>
                        {isEn ? diff.desc : diff.descFr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum Design Philosophy Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-[#C65A1E] uppercase tracking-wider mb-2">
                  {isEn ? "Design Philosophy" : "Philosophie de Conception"}
                </p>
                <h2 className="text-3xl font-bold text-[#0F3D3E] mb-6">
                  {isEn ? "Curriculum Design Philosophy" : "Philosophie de Conception du Curriculum"}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {isEn 
                    ? "Our curriculum is built on the RusingÂcademy Structured Action Model™, which ensures every learning activity is:"
                    : "Notre curriculum est construit sur le Modèle d'Action Structuré RusingÂcademy™, qui garantit que chaque activité d'apprentissage est:"
                  }
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designPrinciples.map((principle, index) => (
                  <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-[#FDF8F3]">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#C65A1E] flex items-center justify-center text-white font-bold flex-shrink-0">
                          {principle.number}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2 text-[#0F3D3E]">
                            {isEn ? principle.title : principle.titleFr}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {isEn ? principle.desc : principle.descFr}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Double-Modality Learning Architecture Section */}
        <section className="py-16 bg-[#FDF8F3]">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-[#C65A1E] uppercase tracking-wider mb-2">
                  {isEn ? "Learning Architecture" : "Architecture d'Apprentissage"}
                </p>
                <h2 className="text-3xl font-bold text-[#0F3D3E] mb-6">
                  {isEn ? "Double-Modality Learning Architecture" : "Architecture d'Apprentissage à Double Modalité"}
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {isEn 
                    ? "The GC Bilingual Mastery Series delivers content through a carefully calibrated blend of two complementary modalities:"
                    : "La Série Maîtrise Bilingue GC délivre le contenu à travers un mélange soigneusement calibré de deux modalités complémentaires:"
                  }
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Platform Learning */}
                <Card className="border-none shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Video className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{color: '#fafafa'}}>70%</h3>
                        <p className="text-white/80" style={{color: '#f7f7f7'}}>{isEn ? "Platform Learning" : "Apprentissage Plateforme"}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-lg mb-3 text-[#0F3D3E]">
                      {isEn ? "RusingÂcademy Learning Platform" : "Plateforme d'Apprentissage RusingÂcademy"}
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      {isEn 
                        ? "Self-paced digital modules featuring video instruction, interactive exercises, quizzes, and multimedia resources accessible 24/7."
                        : "Modules numériques à votre rythme comprenant des instructions vidéo, des exercices interactifs, des quiz et des ressources multimédias accessibles 24h/24."
                      }
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {isEn ? "HD video lessons" : "Leçons vidéo HD"}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {isEn ? "Interactive exercises" : "Exercices interactifs"}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {isEn ? "Progress tracking" : "Suivi de progression"}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {isEn ? "Mobile-friendly access" : "Accès mobile"}
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Live Coaching */}
                <Card className="border-none shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#C65A1E] to-[#A84A15] p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Headphones className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{color: '#fcfcfc'}}>30%</h3>
                        <p className="text-white/80" style={{color: '#fafafa'}}>{isEn ? "Live Coaching" : "Coaching en Direct"}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-lg mb-3 text-[#0F3D3E]">
                      {isEn ? "Live Coaching Sessions" : "Séances de Coaching en Direct"}
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      {isEn 
                        ? "Individual and group sessions with certified language instructors who provide personalized feedback, conduct simulations, and prepare you for exam scenarios."
                        : "Séances individuelles et en groupe avec des instructeurs de langue certifiés qui fournissent des commentaires personnalisés, conduisent des simulations et vous préparent aux scénarios d'examen."
                      }
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {isEn ? "1-on-1 coaching" : "Coaching individuel"}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {isEn ? "Group practice sessions" : "Séances de pratique en groupe"}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {isEn ? "Exam simulations" : "Simulations d'examen"}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {isEn ? "Personalized feedback" : "Commentaires personnalisés"}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Why Path Series Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-[#C65A1E] uppercase tracking-wider mb-2">
                {isEn ? "Why Path Series™" : "Pourquoi Path Series™"}
              </p>
              <h2 className="text-3xl font-bold text-[#0F3D3E]">
                {isEn ? "Built for Federal Success" : "Conçu pour la Réussite Fédérale"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
                {isEn 
                  ? "Our curriculum is specifically designed to help Canadian public servants achieve their bilingual requirements efficiently."
                  : "Notre curriculum est spécifiquement conçu pour aider les fonctionnaires canadiens à atteindre leurs exigences bilingues efficacement."
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {valueProps.map((prop, index) => (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#C65A1E]/10 flex items-center justify-center">
                      <prop.icon className="h-7 w-7 text-[#C65A1E]" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-[#0F3D3E]">
                      {isEn ? prop.title : prop.titleFr}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isEn ? prop.desc : prop.descFr}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trusted By */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                {isEn ? "Trusted by public servants from" : "Approuvé par les fonctionnaires de"}
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {trustedOrgs.map((org, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm font-medium">{org}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Crash Courses Section Header */}
        <section className="py-8 bg-[#FDF8F3]">
          <div className="container">
            <div className="text-center">
              <p className="text-sm font-medium text-[#C65A1E] uppercase tracking-wider mb-2">
                {isEn ? "Our Crash Courses" : "Nos Cours Intensifs"}
              </p>
              <h2 className="text-3xl font-bold text-[#0F3D3E] mb-4">
                {isEn ? "The Six Paths to Bilingual Mastery" : "Les Six Parcours vers la Maîtrise Bilingue"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {isEn 
                  ? "Each Path is a comprehensive, intensive 4-week learning experience designed to advance your competency by one full CEFR level. Progress sequentially from foundational communication (Path I) to advanced professional mastery (Path V), culminating in intensive exam preparation (Path VI)."
                  : "Chaque Path est une expérience d'apprentissage intensive et complète de 4 semaines conçue pour faire progresser votre compétence d'un niveau CEFR complet. Progressez séquentiellement de la communication fondamentale (Path I) à la maîtrise professionnelle avancée (Path V), culminant avec la préparation intensive aux examens (Path VI)."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Path Selection Section */}
        <section id="paths-section" className="py-8 pb-16 bg-[#FDF8F3]">
          <div className="container">
            {/* Path Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {pathSeriesData.map((path) => (
                <button
                  key={path.id}
                  onClick={() => setSelectedPath(path.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPath === path.id
                      ? "bg-[#C65A1E] text-white shadow-lg"
                      : "bg-white text-[#0F3D3E] hover:bg-[#C65A1E]/10 border border-gray-200"
                  }`}
                >
                  <span className="mr-2">{path.icon}</span>
                  Path {path.id.split('-')[1].toUpperCase()}
                </button>
              ))}
            </div>

            {/* Selected Path Details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPath.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Path Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-4xl">{currentPath.icon}</span>
                    <Badge className={`bg-gradient-to-r ${currentPath.color} text-white`}>
                      {currentPath.level}
                    </Badge>
                    {currentPath.sleBadge && (
                      <Badge variant="outline" className="border-[#C65A1E] text-[#C65A1E]">
                        SLE {currentPath.sleBadge}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-[#0F3D3E] mb-2">
                      {isEn ? currentPath.title : currentPath.titleFr}
                    </h2>
                    <p className="text-lg text-[#C65A1E] font-medium">
                      {isEn ? currentPath.subtitle : currentPath.subtitleFr}
                    </p>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {isEn ? currentPath.description : currentPath.descriptionFr}
                  </p>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <Calendar className="h-5 w-5 text-[#C65A1E] mb-2" />
                      <div className="text-sm text-muted-foreground">{isEn ? "Duration" : "Durée"}</div>
                      <div className="font-semibold text-[#0F3D3E]">{currentPath.duration}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <Clock className="h-5 w-5 text-[#C65A1E] mb-2" />
                      <div className="text-sm text-muted-foreground">{isEn ? "Structured Hours" : "Heures Structurées"}</div>
                      <div className="font-semibold text-[#0F3D3E]">{currentPath.structuredHours}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <Brain className="h-5 w-5 text-[#C65A1E] mb-2" />
                      <div className="text-sm text-muted-foreground">{isEn ? "Practice" : "Pratique"}</div>
                      <div className="font-semibold text-[#0F3D3E]">{currentPath.autonomousPractice || currentPath.practiceExams}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <BookMarked className="h-5 w-5 text-[#C65A1E] mb-2" />
                      <div className="text-sm text-muted-foreground">{isEn ? "PFL2 Level" : "Niveau PFL2"}</div>
                      <div className="font-semibold text-[#0F3D3E]">{currentPath.pfl2Level || currentPath.coachingSessions}</div>
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-[#0F3D3E] mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#C65A1E]" />
                      {isEn ? "Key Learning Outcomes" : "Résultats d'Apprentissage Clés"}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {currentPath.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {isEn ? outcome.en : outcome.fr}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="bg-[#0F3D3E]/5 rounded-xl p-4 flex items-center gap-3">
                    <Users className="h-5 w-5 text-[#0F3D3E]" />
                    <div>
                      <span className="text-sm font-medium text-[#0F3D3E]">
                        {isEn ? "Target Audience: " : "Public Cible: "}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {isEn ? currentPath.target : currentPath.targetFr}
                      </span>
                    </div>
                  </div>

                  {/* Course Modules Preview */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-[#0F3D3E] mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-[#C65A1E]" />
                      {isEn ? "Course Modules" : "Modules du Cours"}
                    </h3>
                    <CurriculumModulePreview slug={currentPath.slug} isEn={isEn} />
                    <div className="mt-4 text-center">
                      <Link href={`/courses/${currentPath.slug}`}>
                        <Button variant="outline" className="border-[#0F3D3E] text-[#0F3D3E] hover:bg-[#0F3D3E]/5">
                          {isEn ? "View Full Course Details" : "Voir les Détails Complets du Cours"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Pricing Card */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-24 shadow-xl border-none overflow-hidden">
                    <div className={`bg-gradient-to-r ${currentPath.color} p-6 text-white text-center`}>
                      <h3 className="text-xl font-semibold mb-2">
                        {isEn ? "Enroll Now" : "Inscrivez-vous"}
                      </h3>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl font-bold">${currentPath.price}</span>
                        <span className="text-lg line-through opacity-70">${currentPath.originalPrice}</span>
                      </div>
                      <Badge className="mt-2 bg-white/20 text-white">
                        {Math.round((1 - currentPath.price / currentPath.originalPrice) * 100)}% OFF
                      </Badge>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {isEn ? "Lifetime access" : "Accès à vie"}
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {isEn ? "Certificate of completion" : "Certificat d'achèvement"}
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {isEn ? "Downloadable resources" : "Ressources téléchargeables"}
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {isEn ? "Practice quizzes" : "Quiz de pratique"}
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {isEn ? "Community access" : "Accès à la communauté"}
                        </li>
                      </ul>

                      <Button 
                        className="w-full bg-[#C65A1E] hover:bg-[#A84A15] text-white"
                        size="lg"
                        onClick={() => handlePurchase(currentPath.slug)}
                        disabled={isPurchasing}
                      >
                        {isPurchasing 
                          ? (isEn ? "Processing..." : "Traitement...")
                          : (isEn ? "Get Started" : "Commencer")
                        }
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        {isEn ? "30-day money-back guarantee" : "Garantie de remboursement de 30 jours"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-[#C65A1E] uppercase tracking-wider mb-2">
                {isEn ? "Success Stories" : "Témoignages de Réussite"}
              </p>
              <h2 className="text-3xl font-bold text-[#0F3D3E]">
                {isEn ? "What Our Students Say" : "Ce Que Disent Nos Étudiants"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
                {isEn 
                  ? "Join thousands of federal public servants who have achieved their bilingual goals."
                  : "Rejoignez des milliers de fonctionnaires fédéraux qui ont atteint leurs objectifs bilingues."
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-[#C65A1E] text-[#C65A1E]" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-[#C65A1E]/20 mb-2" />
                    <p className="text-muted-foreground mb-4 italic">
                      "{isEn ? testimonial.quote : testimonial.quoteFr}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F3D3E] to-[#C65A1E] flex items-center justify-center text-white font-semibold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#0F3D3E]">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.org}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#0F3D3E] to-[#145A5B]">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-white mb-4" style={{color: '#f8f7f7'}}>
              {isEn ? "Ready to Start Your Journey?" : "Prêt à Commencer Votre Parcours?"}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8" style={{color: '#ffffff'}}>
              {isEn 
                ? "Join thousands of federal public servants who have transformed their careers with Path Series™."
                : "Rejoignez des milliers de fonctionnaires fédéraux qui ont transformé leur carrière avec Path Series™."
              }
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/courses">
                <Button size="lg" className="bg-[#C65A1E] hover:bg-[#A84A15] text-white">
                  {isEn ? "Browse All Courses" : "Parcourir Tous les Cours"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/ecosystem">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {isEn ? "Find a Coach" : "Trouver un Coach"}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <EcosystemFooter lang={isEn ? 'en' : 'fr'} theme="light" activeBrand="rusingacademy" />
    </div>
  );
}
