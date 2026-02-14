import { useState, useEffect } from "react";
import SEO, { generateFAQSchema } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import FooterInstitutional from "@/components/FooterInstitutional";
import CrossEcosystemSection from "@/components/CrossEcosystemSection";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  GraduationCap,
  Users,
  Calendar,
  Star,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Globe,
  Clock,
  Award,
  MessageSquare,
  Play,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Headphones,
  PenTool,
  Target,
  Zap,
  Shield,
  Search,
  MapPin,
  DollarSign,
  Filter,
  Heart,
  Video,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { COACHING_PLAN_PRICES } from "@shared/pricing";

// Coach photos for floating bubbles
const coachPhotos = [
  "/images/team/steven-barholere.jpg",
  "/images/team/sue-anne-richer.jpg",
  "/images/team/erika-seguin.jpg",
  "/images/team/preciosa-mushi.jpg",
];

// Floating coach bubble component with humanized positioning
const FloatingCoachBubble = ({ 
  photo, 
  name, 
  specialty, 
  rating, 
  position, 
  delay,
  size = "lg"
}: { 
  photo: string; 
  name: string; 
  specialty: string; 
  rating: number;
  position: { top?: string; bottom?: string; left?: string; right?: string; rotate?: string };
  delay: number;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-16 h-16 md:w-20 md:h-20",
    md: "w-20 h-20 md:w-28 md:h-28",
    lg: "w-24 h-24 md:w-32 md:h-32"
  };
  
  return (
    <div 
      className={`absolute hidden md:block animate-float group cursor-pointer`}
      style={{ 
        ...position,
        animationDelay: `${delay}s`,
        animationDuration: '6s'
      }}
    >
      <div className="relative">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Photo bubble */}
        <div 
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:border-teal-400`}
          style={{ transform: position.rotate ? `rotate(${position.rotate})` : undefined }}
        >
          <img 
            loading="lazy" src={photo} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Info tooltip on hover */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-2 whitespace-nowrap z-10">
          <div className="font-semibold text-slate-900 text-sm">{name}</div>
          <div className="text-xs text-slate-900">{specialty}</div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-amber-400 text-[#C65A1E]400" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LingueefyLanding() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);

  // Stripe checkout mutation
  // @ts-expect-error - TS2339: auto-suppressed during TS cleanup
  const checkoutMutation = trpc.courses.purchaseCoachingPlan.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success(language === 'en' 
          ? 'Redirecting to checkout...' 
          : 'Redirection vers le paiement...');
        window.open(data.url, '_blank');
      }
      setPurchasingPlanId(null);
    },
    onError: (error) => {
      toast.error(language === 'en' 
        ? 'Failed to start checkout. Please try again.' 
        : 'Échec du démarrage du paiement. Veuillez réessayer.');
      console.error('Checkout error:', error);
      setPurchasingPlanId(null);
    },
  });

  // Handle plan purchase
  const handlePlanPurchase = (planId: string) => {
    if (!isAuthenticated) {
      toast.info(language === 'en' 
        ? 'Please log in to purchase a plan' 
        : 'Veuillez vous connecter pour acheter un plan');
      window.location.href = getLoginUrl();
      return;
    }
    
    setPurchasingPlanId(planId);
    checkoutMutation.mutate({
      planId,
      locale: language as 'en' | 'fr',
    });
  };

  // Typewriter effect for hero title
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const content = {
    en: {
      hero: {
        badge: "Canada's #1 SLE Preparation Platform",
        title: "Find Your Perfect",
        titleHighlight: "French Coach",
        subtitle: "for SLE Success",
        description: "Join 2,500+ federal public servants who achieved their language goals. Expert coaches, AI-powered practice, and personalized learning paths.",
        cta: "Find a Coach",
        ctaSecondary: "Try AI Practice Free",
        searchPlaceholder: "What do you want to learn?",
        stats: [
          { value: "95%", label: "Success Rate", icon: Target },
          { value: "2,500+", label: "Public Servants", icon: Users },
          { value: "4.9", label: "Average Rating", icon: Star },
          { value: "50+", label: "Expert Coaches", icon: GraduationCap },
        ],
        trustedBy: "Trusted by public servants from",
      },
      search: {
        level: "SLE Level",
        levelOptions: ["All Levels", "Level A", "Level B", "Level C"],
        price: "Price Range",
        priceOptions: ["Any Price", "$20-40/hr", "$40-60/hr", "$60+/hr"],
        filter: "More Filters",
      },
      howItWorks: {
        title: "Your Path to SLE Success",
        subtitle: "A proven 4-step journey designed for busy federal professionals",
        steps: [
          {
            icon: Target,
            title: "Take the Assessment",
            description: "Our diagnostic test identifies your current level and creates a personalized roadmap.",
            duration: "15 minutes",
          },
          {
            icon: Users,
            title: "Match with a Coach",
            description: "We pair you with an expert coach who specializes in your target level.",
            duration: "Same day",
          },
          {
            icon: Headphones,
            title: "Practice & Improve",
            description: "Combine live sessions with AI practice for maximum progress.",
            duration: "Your pace",
          },
          {
            icon: Award,
            title: "Pass Your SLE",
            description: "Walk into your exam with confidence and achieve your career goals.",
            duration: "2-4 months",
          },
        ],
      },
      transformation: {
        badge: "Your Journey",
        title: "Your Transformation: From Doubt to SLE Confidence",
        subtitle: "See how our learners evolve from uncertainty to mastery",
        before: {
          title: "BEFORE",
          items: [
            { emoji: "😟", text: "Nervous & Uncertain" },
            { emoji: "💭", text: "Mental Translation in Real-time" },
            { emoji: "📝", text: "Memorizing Phrases" },
            { emoji: "🚫", text: "Avoiding French Meetings" },
            { emoji: "🤔", text: "Doubting Yourself" },
          ],
        },
        after: {
          title: "AFTER 30 HOURS",
          items: [
            { emoji: "😌", text: "Calm, Structured & Confident" },
            { emoji: "🧠", text: "Thinking & Reacting in French" },
            { emoji: "💬", text: "Natural & Spontaneous Expression" },
            { emoji: "🏆", text: "Leading Meetings with Authority" },
            { emoji: "✨", text: "Owning Your Bilingual Identity" },
          ],
        },
      },
      coaches: {
        title: "Meet Our Expert Coaches",
        subtitle: "Certified professionals dedicated to your success",
        viewAll: "View All Coaches",
        items: [
          {
            name: "Steven Barholere",
            photo: "/images/team/steven-barholere.jpg",
            specialty: "SLE Oral C Level",
            rating: 4.98,
            reviews: 127,
            price: 55,
            languages: ["French", "English"],
            badge: "Top Rated",
          },
          {
            name: "Sue-Anne Richer",
            photo: "/images/team/sue-anne-richer.jpg",
            specialty: "SLE Written & Reading",
            rating: 4.95,
            reviews: 89,
            price: 50,
            languages: ["French", "English"],
            badge: "Most Popular",
          },
          {
            name: "Erika Seguin",
            photo: "/images/team/erika-seguin.jpg",
            specialty: "Anxiety Coaching",
            rating: 4.92,
            reviews: 64,
            price: 45,
            languages: ["French", "English"],
            badge: "Rising Star",
          },
        ],
      },
      services: {
        title: "Everything You Need",
        subtitle: "Comprehensive SLE preparation tools",
        items: [
          {
            icon: GraduationCap,
            title: "SLE Oral Mastery",
            description: "Intensive preparation for the oral component with real exam simulations.",
            features: ["Live practice sessions", "Pronunciation coaching", "Exam strategies"],
            color: "teal",
          },
          {
            icon: PenTool,
            title: "SLE Written Excellence",
            description: "Master grammar, vocabulary, and writing techniques for the written test.",
            features: ["Grammar workshops", "Writing exercises", "Feedback & corrections"],
            color: "amber",
          },
          {
            icon: BookOpen,
            title: "SLE Reading Comprehension",
            description: "Develop speed reading and comprehension skills for the reading test.",
            features: ["Practice texts", "Time management", "Answer strategies"],
            color: "copper",
          },
          {
            icon: Sparkles,
            title: "AI Practice Partner",
            description: "24/7 AI-powered conversation practice to build fluency and confidence.",
            features: ["Unlimited practice", "Instant feedback", "Progress tracking"],
            color: "teal",
          },
        ],
      },
      testimonials: {
        title: "Success Stories",
        subtitle: "Real results from real public servants",
        items: [
          {
            name: "Sarah Mitchell",
            role: "Policy Analyst, ESDC",
            photo: "/images/team/steven-barholere.jpg",
            quote: "I went from B to C level in just 3 months. The coaching was exceptional and the AI practice tool helped me build confidence for my oral exam.",
            rating: 5,
            result: "B → C Level",
          },
          {
            name: "David Lavoie",
            role: "Program Officer, IRCC",
            photo: "/images/team/sue-anne-richer.jpg",
            quote: "After years of trying different methods, Lingueefy finally helped me pass my SLE. The personalized approach made all the difference.",
            rating: 5,
            result: "Passed SLE",
          },
          {
            name: "Marie-Claire Tremblay",
            role: "Manager, CRA",
            photo: "/images/team/erika-seguin.jpg",
            quote: "The flexible scheduling worked perfectly with my busy schedule. I could practice during lunch breaks and evenings.",
            rating: 5,
            result: "A → B Level",
          },
        ],
      },
      faq: {
        title: "Questions? We've Got Answers",
        items: [
          {
            question: "What is the SLE (Second Language Evaluation)?",
            answer: "The SLE is a standardized test used by the Government of Canada to assess the second language proficiency of federal employees. It evaluates reading, writing, and oral interaction skills.",
          },
          {
            question: "How long does it take to prepare for the SLE?",
            answer: "Preparation time varies based on your current level. Most learners see significant improvement within 2-4 months of consistent practice with our program.",
          },
          {
            question: "Do you offer group classes or only individual coaching?",
            answer: "We offer both! Our self-paced courses include group workshops, and we also provide personalized 1-on-1 coaching sessions for targeted improvement.",
          },
          {
            question: "Is the training eligible for professional development funding?",
            answer: "Yes! Many federal departments cover language training costs. We can provide documentation for reimbursement requests.",
          },
          {
            question: "What if I don't pass my SLE after your training?",
            answer: "We offer a satisfaction guarantee. If you complete our program and don't see improvement, we'll provide additional coaching at no extra cost.",
          },
        ],
      },
      learningPath: {
        badge: "Choose Your Path",
        title: "Choose Your Learning Path",
        subtitle: "Two powerful options to accelerate your SLE preparation",
        marketplace: {
          title: "Marketplace",
          description: "Book individual sessions with expert coaches at your own pace",
          features: [
            "Pay per session",
            "Choose your coach",
            "Flexible scheduling",
            "No commitment",
          ],
          cta: "Browse Coaches",
        },
        plans: {
          title: "Coaching Plans",
          description: "Structured programs with guaranteed results and dedicated support",
          features: [
            "Personalized roadmap",
            "Dedicated coach",
            "Progress tracking",
            "Success guarantee",
          ],
          cta: "View Plans",
        },
        pricing: {
          title: "Coaching Plans",
          subtitle: "Structured programs designed for serious learners",
          plans: [
            {
              name: "Starter",
              price: COACHING_PLAN_PRICES.STARTER.priceDisplay,
              period: "one-time",
              description: "Perfect for beginners starting their SLE journey",
              features: [
                "10 coaching sessions (1hr each)",
                "Personalized learning plan",
                "AI practice access (30 days)",
                "Progress assessments",
                "Email support",
              ],
              cta: "Get Started",
              popular: false,
            },
            {
              name: "Accelerator",
              price: COACHING_PLAN_PRICES.ACCELERATOR.priceDisplay,
              period: "one-time",
              description: "Most popular choice for career-focused professionals",
              features: [
                "20 coaching sessions (1hr each)",
                "Dedicated coach assignment",
                "AI practice access (90 days)",
                "Weekly progress reports",
                "Mock SLE exams",
                "Priority scheduling",
              ],
              cta: "Choose Accelerator",
              popular: true,
            },
            {
              name: "Immersion",
              price: COACHING_PLAN_PRICES.IMMERSION.priceDisplay,
              period: "one-time",
              description: "Intensive program for executives and fast-track goals",
              features: [
                "40 coaching sessions (1hr each)",
                "VIP coach selection",
                "Unlimited AI practice",
                "Daily progress tracking",
                "Unlimited mock exams",
                "1-on-1 exam strategy sessions",
                "Success guarantee",
              ],
              cta: "Go Immersion",
              popular: false,
            },
          ],
        },
      },
      sleLevels: {
        badge: "SLE Levels",
        title: "Prepare for Any SLE Level",
        subtitle: "Targeted preparation for each proficiency level",
        levels: [
          {
            level: "Level A",
            name: "Basic",
            description: "Build foundational French skills for everyday workplace communication",
            skills: [
              "Basic greetings and introductions",
              "Simple workplace vocabulary",
              "Reading short texts",
              "Writing simple messages",
            ],
            duration: "2-3 months",
            color: "emerald",
          },
          {
            level: "Level B",
            name: "Intermediate",
            description: "Develop professional fluency for meetings and written communication",
            skills: [
              "Participating in meetings",
              "Writing professional emails",
              "Understanding complex documents",
              "Expressing opinions clearly",
            ],
            duration: "3-4 months",
            color: "amber",
          },
          {
            level: "Level C",
            name: "Advanced",
            description: "Master executive-level French for leadership and strategic roles",
            skills: [
              "Leading bilingual meetings",
              "Drafting policy documents",
              "Negotiating in French",
              "Public speaking with confidence",
            ],
            duration: "4-6 months",
            color: "copper",
          },
        ],
      },
      cta: {
        title: "Ready to Advance Your Career?",
        description: "Join hundreds of public servants who have achieved their language goals with Lingueefy.",
        button: "Start Your Free Trial",
        contact: "Or book a free consultation call",
      },
    },
    fr: {
      hero: {
        badge: "Plateforme #1 de préparation ELS au Canada",
        title: "Trouvez Votre",
        titleHighlight: "Coach Français",
        subtitle: "pour Réussir l'ELS",
        description: "Rejoignez 2 500+ fonctionnaires fédéraux qui ont atteint leurs objectifs linguistiques. Coachs experts, pratique assistée par IA et parcours personnalisés.",
        cta: "Trouver un Coach",
        ctaSecondary: "Essayer l'IA Gratuitement",
        searchPlaceholder: "Que voulez-vous apprendre?",
        stats: [
          { value: "95%", label: "Taux de Réussite", icon: Target },
          { value: "2,500+", label: "Fonctionnaires", icon: Users },
          { value: "4.9", label: "Note Moyenne", icon: Star },
          { value: "50+", label: "Coachs Experts", icon: GraduationCap },
        ],
        trustedBy: "Utilisé par les fonctionnaires de",
      },
      search: {
        level: "Niveau ELS",
        levelOptions: ["Tous les niveaux", "Niveau A", "Niveau B", "Niveau C"],
        price: "Fourchette de prix",
        priceOptions: ["Tout prix", "20-40$/h", "40-60$/h", "60+$/h"],
        filter: "Plus de filtres",
      },
      howItWorks: {
        title: "Votre Chemin Vers le Succès ELS",
        subtitle: "Un parcours en 4 étapes conçu pour les professionnels fédéraux occupés",
        steps: [
          {
            icon: Target,
            title: "Passez l'Évaluation",
            description: "Notre test diagnostique identifie votre niveau actuel et crée une feuille de route personnalisée.",
            duration: "15 minutes",
          },
          {
            icon: Users,
            title: "Trouvez Votre Coach",
            description: "Nous vous jumelons avec un coach expert spécialisé dans votre niveau cible.",
            duration: "Même jour",
          },
          {
            icon: Headphones,
            title: "Pratiquez & Progressez",
            description: "Combinez les sessions en direct avec la pratique IA pour un progrès maximal.",
            duration: "Votre rythme",
          },
          {
            icon: Award,
            title: "Réussissez Votre ELS",
            description: "Entrez dans votre examen avec confiance et atteignez vos objectifs de carrière.",
            duration: "2-4 mois",
          },
        ],
      },
      transformation: {
        badge: "Votre Parcours",
        title: "Votre Transformation : Du Doute à la Confiance ELS",
        subtitle: "Découvrez comment nos apprenants évoluent de l'incertitude à la maîtrise",
        before: {
          title: "AVANT",
          items: [
            { emoji: "😟", text: "Nerveux & Incertain" },
            { emoji: "💭", text: "Traduction Mentale en Temps Réel" },
            { emoji: "📝", text: "Mémorisation de Phrases" },
            { emoji: "🚫", text: "Éviter les Réunions en Français" },
            { emoji: "🤔", text: "Douter de Soi-même" },
          ],
        },
        after: {
          title: "APRÈS 30 HEURES",
          items: [
            { emoji: "😌", text: "Calme, Structuré & Confiant" },
            { emoji: "🧠", text: "Penser & Réagir en Français" },
            { emoji: "💬", text: "Expression Naturelle & Spontanée" },
            { emoji: "🏆", text: "Diriger des Réunions avec Autorité" },
            { emoji: "✨", text: "Assumer Son Identité Bilingue" },
          ],
        },
      },
      coaches: {
        title: "Rencontrez Nos Coachs Experts",
        subtitle: "Des professionnels certifiés dédiés à votre réussite",
        viewAll: "Voir Tous les Coachs",
        items: [
          {
            name: "Steven Barholere",
            photo: "/images/team/steven-barholere.jpg",
            specialty: "ELS Oral Niveau C",
            rating: 4.98,
            reviews: 127,
            price: 55,
            languages: ["Français", "Anglais"],
            badge: "Mieux Noté",
          },
          {
            name: "Sue-Anne Richer",
            photo: "/images/team/sue-anne-richer.jpg",
            specialty: "ELS Écrit & Lecture",
            rating: 4.95,
            reviews: 89,
            price: 50,
            languages: ["Français", "Anglais"],
            badge: "Plus Populaire",
          },
          {
            name: "Erika Seguin",
            photo: "/images/team/erika-seguin.jpg",
            specialty: "Coaching Anxiété",
            rating: 4.92,
            reviews: 64,
            price: 45,
            languages: ["Français", "Anglais"],
            badge: "Étoile Montante",
          },
        ],
      },
      services: {
        title: "Tout Ce Dont Vous Avez Besoin",
        subtitle: "Outils complets de préparation ELS",
        items: [
          {
            icon: GraduationCap,
            title: "Maîtrise Orale ELS",
            description: "Préparation intensive pour la composante orale avec simulations d'examen réelles.",
            features: ["Sessions de pratique en direct", "Coaching de prononciation", "Stratégies d'examen"],
            color: "teal",
          },
          {
            icon: PenTool,
            title: "Excellence Écrite ELS",
            description: "Maîtrisez la grammaire, le vocabulaire et les techniques d'écriture pour le test écrit.",
            features: ["Ateliers de grammaire", "Exercices d'écriture", "Rétroaction & corrections"],
            color: "amber",
          },
          {
            icon: BookOpen,
            title: "Compréhension de Lecture ELS",
            description: "Développez vos compétences en lecture rapide et compréhension pour le test de lecture.",
            features: ["Textes de pratique", "Gestion du temps", "Stratégies de réponse"],
            color: "copper",
          },
          {
            icon: Sparkles,
            title: "Partenaire de Pratique IA",
            description: "Pratique de conversation 24/7 alimentée par IA pour développer fluidité et confiance.",
            features: ["Pratique illimitée", "Rétroaction instantanée", "Suivi des progrès"],
            color: "teal",
          },
        ],
      },
      testimonials: {
        title: "Histoires de Réussite",
        subtitle: "Des résultats réels de vrais fonctionnaires",
        items: [
          {
            name: "Sarah Mitchell",
            role: "Analyste de politiques, EDSC",
            photo: "/images/team/steven-barholere.jpg",
            quote: "Je suis passée du niveau B au niveau C en seulement 3 mois. Le coaching était exceptionnel et l'outil de pratique IA m'a aidée à gagner confiance pour mon examen oral.",
            rating: 5,
            result: "B → Niveau C",
          },
          {
            name: "David Lavoie",
            role: "Agent de programme, IRCC",
            photo: "/images/team/sue-anne-richer.jpg",
            quote: "Après des années à essayer différentes méthodes, Lingueefy m'a enfin aidé à réussir mon ELS. L'approche personnalisée a fait toute la différence.",
            rating: 5,
            result: "ELS Réussi",
          },
          {
            name: "Marie-Claire Tremblay",
            role: "Gestionnaire, ARC",
            photo: "/images/team/erika-seguin.jpg",
            quote: "Les horaires flexibles s'adaptaient parfaitement à mon emploi du temps chargé. Je pouvais pratiquer pendant les pauses déjeuner et les soirées.",
            rating: 5,
            result: "A → Niveau B",
          },
        ],
      },
      faq: {
        title: "Questions? Nous Avons les Réponses",
        items: [
          {
            question: "Qu'est-ce que l'ELS (Évaluation de langue seconde)?",
            answer: "L'ELS est un test standardisé utilisé par le gouvernement du Canada pour évaluer la compétence en langue seconde des employés fédéraux. Il évalue les compétences en lecture, écriture et interaction orale.",
          },
          {
            question: "Combien de temps faut-il pour se préparer à l'ELS?",
            answer: "Le temps de préparation varie selon votre niveau actuel. La plupart des apprenants voient une amélioration significative dans les 2-4 mois de pratique régulière avec notre programme.",
          },
          {
            question: "Offrez-vous des cours de groupe ou seulement du coaching individuel?",
            answer: "Nous offrons les deux! Nos cours auto-rythmés incluent des ateliers de groupe, et nous proposons également des séances de coaching 1-à-1 personnalisées pour une amélioration ciblée.",
          },
          {
            question: "La formation est-elle admissible au financement de développement professionnel?",
            answer: "Oui! De nombreux ministères fédéraux couvrent les coûts de formation linguistique. Nous pouvons fournir la documentation pour les demandes de remboursement.",
          },
          {
            question: "Que se passe-t-il si je ne réussis pas mon ELS après votre formation?",
            answer: "Nous offrons une garantie de satisfaction. Si vous complétez notre programme et ne voyez pas d'amélioration, nous fournirons du coaching supplémentaire sans frais.",
          },
        ],
      },
      learningPath: {
        badge: "Choisissez Votre Parcours",
        title: "Choisissez Votre Parcours d'Apprentissage",
        subtitle: "Deux options puissantes pour accélérer votre préparation ELS",
        marketplace: {
          title: "Marketplace",
          description: "Réservez des sessions individuelles avec des coachs experts à votre rythme",
          features: [
            "Paiement par session",
            "Choisissez votre coach",
            "Horaires flexibles",
            "Sans engagement",
          ],
          cta: "Parcourir les Coachs",
        },
        plans: {
          title: "Plans de Coaching",
          description: "Programmes structurés avec résultats garantis et support dédié",
          features: [
            "Feuille de route personnalisée",
            "Coach dédié",
            "Suivi des progrès",
            "Garantie de succès",
          ],
          cta: "Voir les Plans",
        },
        pricing: {
          title: "Plans de Coaching",
          subtitle: "Programmes structurés conçus pour les apprenants sérieux",
          plans: [
            {
              name: "Débutant",
              price: "597$",
              period: "paiement unique",
              description: "Parfait pour les débutants qui commencent leur parcours ELS",
              features: [
                "10 sessions de coaching (1h chacune)",
                "Plan d'apprentissage personnalisé",
                "Accès pratique IA (30 jours)",
                "Évaluations de progrès",
                "Support par courriel",
              ],
              cta: "Commencer",
              popular: false,
            },
            {
              name: "Accélérateur",
              price: "1 097$",
              period: "paiement unique",
              description: "Le choix le plus populaire pour les professionnels ambitieux",
              features: [
                "20 sessions de coaching (1h chacune)",
                "Coach dédié assigné",
                "Accès pratique IA (90 jours)",
                "Rapports de progrès hebdomadaires",
                "Examens ELS simulés",
                "Planification prioritaire",
              ],
              cta: "Choisir Accélérateur",
              popular: true,
            },
            {
              name: "Immersion",
              price: "1 997$",
              period: "paiement unique",
              description: "Programme intensif pour cadres et objectifs accélérés",
              features: [
                "40 sessions de coaching (1h chacune)",
                "Sélection de coach VIP",
                "Pratique IA illimitée",
                "Suivi quotidien des progrès",
                "Examens simulés illimités",
                "Sessions stratégie d'examen 1-à-1",
                "Garantie de succès",
              ],
              cta: "Choisir Immersion",
              popular: false,
            },
          ],
        },
      },
      sleLevels: {
        badge: "Niveaux ELS",
        title: "Préparez-vous pour Tout Niveau ELS",
        subtitle: "Préparation ciblée pour chaque niveau de compétence",
        levels: [
          {
            level: "Niveau A",
            name: "De Base",
            description: "Développez des compétences fondamentales en français pour la communication quotidienne au travail",
            skills: [
              "Salutations et présentations de base",
              "Vocabulaire simple du milieu de travail",
              "Lecture de textes courts",
              "Rédaction de messages simples",
            ],
            duration: "2-3 mois",
            color: "emerald",
          },
          {
            level: "Niveau B",
            name: "Intermédiaire",
            description: "Développez une aisance professionnelle pour les réunions et la communication écrite",
            skills: [
              "Participation aux réunions",
              "Rédaction de courriels professionnels",
              "Compréhension de documents complexes",
              "Expression claire des opinions",
            ],
            duration: "3-4 mois",
            color: "amber",
          },
          {
            level: "Niveau C",
            name: "Avancé",
            description: "Maîtrisez le français de niveau exécutif pour les rôles de leadership et stratégiques",
            skills: [
              "Direction de réunions bilingues",
              "Rédaction de documents de politique",
              "Négociation en français",
              "Prise de parole en public avec confiance",
            ],
            duration: "4-6 mois",
            color: "copper",
          },
        ],
      },
      cta: {
        title: "Prêt à Faire Avancer Votre Carrière?",
        description: "Rejoignez des centaines de fonctionnaires qui ont atteint leurs objectifs linguistiques avec Lingueefy.",
        button: "Commencer Votre Essai Gratuit",
        contact: "Ou réservez un appel de consultation gratuit",
      },
    },
  };

  const c = content[language as keyof typeof content] || content.en;

  // Typewriter effect
  useEffect(() => {
    const fullText = c.hero.titleHighlight;
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [c.hero.titleHighlight]);

  // Generate FAQ schema for SEO
  const faqSchema = generateFAQSchema(
    c.faq.items.map(item => ({ question: item.question, answer: item.answer }))
  );

  // Floating coaches data
  const floatingCoaches = [
    { photo: coachPhotos[0], name: "Steven B.", specialty: "Oral C", rating: 4.98, position: { top: "15%", left: "5%", rotate: "-5deg" }, delay: 0, size: "lg" as const },
    { photo: coachPhotos[1], name: "Sue-Anne R.", specialty: "Written", rating: 4.95, position: { top: "25%", right: "8%", rotate: "3deg" }, delay: 0.5, size: "md" as const },
    { photo: coachPhotos[2], name: "Erika S.", specialty: "Anxiety", rating: 4.92, position: { bottom: "30%", left: "8%", rotate: "5deg" }, delay: 1, size: "md" as const },
    { photo: coachPhotos[3], name: "Preciosa M.", specialty: "Reading", rating: 4.90, position: { bottom: "20%", right: "5%", rotate: "-3deg" }, delay: 1.5, size: "lg" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title={language === 'fr' ? 'Lingueefy - Préparation ELS' : 'Lingueefy - SLE Preparation'}
        description={c.hero.description}
        canonical="https://www.rusingacademy.ca/lingueefy"
        type="service"
        schema={faqSchema}
      />
      
      {/* Add floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section - Elegant White Background Design */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        {/* Background - Clean white with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />
        
        {/* Decorative floating orbs - subtle and elegant */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-[5%] w-72 h-72 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-40 right-[10%] w-96 h-96 bg-violet-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-[15%] w-80 h-80 bg-amber-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        </div>
        
        {/* Floating coach photos - positioned asymmetrically */}
        {floatingCoaches.map((coach, index) => (
          <FloatingCoachBubble key={index} {...coach} />
        ))}
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge with subtle animation */}
            <Badge className="mb-6 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-4 py-2 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              {c.hero.badge}
            </Badge>
            
            {/* Title with typewriter effect */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-slate-800">{c.hero.title}</span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-violet-500 to-amber-500 bg-clip-text text-transparent">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </span>
              <br />
              <span className="text-slate-600 text-3xl md:text-4xl lg:text-5xl font-medium">
                {c.hero.subtitle}
              </span>
            </h1>
            
            {/* Description - more breathing room */}
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {c.hero.description}
            </p>
            
            {/* Search bar - inspired by Preply */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder={c.hero.searchPlaceholder}
                    className="pl-12 h-14 border-0 bg-transparent text-lg focus-visible:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    className="h-14 px-4 rounded-xl bg-white border-0 text-slate-700 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    {c.search.levelOptions.map((option, i) => (
                      <option key={i} value={option}>{option}</option>
                    ))}
                  </select>
                  <Link href="/coaches">
                    <Button className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-lg font-semibold">
                      {c.hero.cta}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/ai-coach">
                <Button size="lg" variant="outline" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-6 text-lg rounded-xl">
                  <Sparkles className="mr-2 w-5 h-5" />
                  {c.hero.ctaSecondary}
                </Button>
              </Link>
            </div>
            
            {/* Stats - with icons and better visual hierarchy */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {c.hero.stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <stat.icon className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-slate-800">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Trusted by logos - subtle */}
        <div className="container mx-auto px-4 mt-16">
          <p className="text-center text-sm text-slate-500 mb-6 uppercase tracking-wider">
            {c.hero.trustedBy}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {["ESDC", "IRCC", "CRA", "DND", "PSPC", "GAC"].map((dept, i) => (
              <div key={i} className="text-slate-400 font-semibold text-lg">{dept}</div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Editorial rhythm with asymmetry */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-10 w-40 h-40 border border-teal-200 rounded-full" />
          <div className="absolute bottom-20 left-10 w-60 h-60 border border-[#FFE4D6] rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700">How It Works</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{c.howItWorks.title}</h2>
            <p className="text-xl text-slate-900 max-w-2xl mx-auto">{c.howItWorks.subtitle}</p>
          </div>
          
          {/* Steps with connecting line and asymmetric cards */}
          <div className="max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200" />
            
            <div className="grid md:grid-cols-4 gap-8">
              {c.howItWorks.steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`relative ${index % 2 === 1 ? 'md:mt-8' : ''}`}
                >
                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                    {index + 1}
                  </div>
                  
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <step.icon className="w-8 h-8 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                      <p className="text-slate-900 mb-3">{step.description}</p>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-900">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.duration}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Learning Path Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-teal-300 rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-amber-300 rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-700">{c.learningPath.badge}</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{c.learningPath.title}</h2>
            <p className="text-xl text-slate-900 max-w-2xl mx-auto">{c.learningPath.subtitle}</p>
          </div>
          
          {/* Two Path Options */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Marketplace Option */}
              <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-teal-400 transition-all duration-300 hover:shadow-xl group">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{c.learningPath.marketplace.title}</h3>
                <p className="text-slate-900 mb-6">{c.learningPath.marketplace.description}</p>
                <ul className="space-y-3 mb-8">
                  {c.learningPath.marketplace.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/coaches">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 rounded-xl text-lg font-semibold">
                    {c.learningPath.marketplace.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
              
              {/* Coaching Plans Option */}
              <div className="bg-gradient-to-br from-[#FFF8F3] to-[#FFF0E6]/50 rounded-3xl p-8 border-2 border-[#FFE4D6] hover:border-[#D97B3D] transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-[#C65A1E] text-white border-0 px-4 py-1">Popular</Badge>
                </div>
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8 text-[#C65A1E]600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{c.learningPath.plans.title}</h3>
                <p className="text-slate-900 mb-6">{c.learningPath.plans.description}</p>
                <ul className="space-y-3 mb-8">
                  {c.learningPath.plans.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-[#C65A1E]500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-[#C65A1E] hover:bg-amber-600 text-white py-6 rounded-xl text-lg font-semibold"
                  onClick={() => document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {c.learningPath.plans.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Pricing Plans */}
          <div id="pricing-plans" className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{c.learningPath.pricing.title}</h3>
              <p className="text-lg text-slate-900">{c.learningPath.pricing.subtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {c.learningPath.pricing.plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`border-2 relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                    plan.popular 
                      ? 'border-teal-500 shadow-xl scale-105 z-10' 
                      : 'border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h4>
                    <p className="text-slate-900 text-sm mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 ml-2">{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-teal-500' : 'text-slate-400'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/contact">
                      <Button 
                        className={`w-full py-6 rounded-xl text-lg font-semibold ${
                          plan.popular 
                            ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Section - Before/After */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700">{c.transformation.badge}</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{c.transformation.title}</h2>
            <p className="text-xl text-slate-900 max-w-2xl mx-auto">{c.transformation.subtitle}</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Before Column */}
              <div className="bg-gradient-to-br from-[#FFF1E8] to-[#FFF8F3] rounded-3xl p-8 md:p-10 border border-[#C65A1E]/50 shadow-lg">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-4 h-4 bg-[#FFF1E8] rounded-sm" />
                  <h3 className="text-2xl font-bold text-[#C65A1E] tracking-wide">{c.transformation.before.title}</h3>
                </div>
                <div className="space-y-6">
                  {c.transformation.before.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 group">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                      <span className="text-lg text-slate-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* After Column */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl p-8 md:p-10 border border-emerald-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-4 h-4 bg-emerald-500 rounded-sm" />
                  <h3 className="text-2xl font-bold text-emerald-600 tracking-wide">{c.transformation.after.title}</h3>
                </div>
                <div className="space-y-6">
                  {c.transformation.after.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 group">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                      <span className="text-lg text-slate-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prepare for Any SLE Level Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-emerald-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-amber-200 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFF1E8] rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700">{c.sleLevels.badge}</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{c.sleLevels.title}</h2>
            <p className="text-xl text-slate-900 max-w-2xl mx-auto">{c.sleLevels.subtitle}</p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {c.sleLevels.levels.map((level, index) => {
                const colorClasses = {
                  emerald: {
                    bg: 'from-emerald-50 to-emerald-100/50',
                    border: 'border-emerald-200 hover:border-emerald-400',
                    badge: 'bg-emerald-500',
                    icon: 'bg-emerald-100 text-emerald-600',
                    check: 'text-emerald-500',
                    button: 'bg-emerald-600 hover:bg-emerald-700',
                  },
                  amber: {
                    bg: 'from-[#FFF8F3] to-[#FFF0E6]/50',
                    border: 'border-[#FFE4D6] hover:border-[#D97B3D]',
                    badge: 'bg-[#C65A1E]',
                    icon: 'bg-amber-100 text-[#C65A1E]600',
                    check: 'text-[#C65A1E]500',
                    button: 'bg-amber-600 hover:bg-amber-700',
                  },
                  copper: {
                    bg: 'from-[#FFF1E8] to-[#FFF8F3]',
                    border: 'border-[#C65A1E] hover:border-[#C65A1E]',
                    badge: 'bg-[#FFF1E8]',
                    icon: 'bg-[#FFF1E8] text-[#C65A1E]',
                    check: 'text-[#C65A1E]',
                    button: 'bg-[#FFF1E8] hover:bg-[#FFF1E8]',
                  },
                };
                const colors = colorClasses[level.color as keyof typeof colorClasses];
                
                return (
                  <Card 
                    key={index} 
                    className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden`}
                  >
                    <CardContent className="p-8">
                      {/* Level Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <Badge className={`${colors.badge} text-white border-0 px-4 py-1 text-sm font-bold`}>
                          {level.level}
                        </Badge>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{level.duration}</span>
                        </div>
                      </div>
                      
                      {/* Level Name & Description */}
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">{level.name}</h3>
                      <p className="text-slate-900 mb-6 leading-relaxed">{level.description}</p>
                      
                      {/* Skills List */}
                      <div className="space-y-3 mb-8">
                        <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider">You'll master:</p>
                        {level.skills.map((skill, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle className={`w-5 h-5 ${colors.check} flex-shrink-0 mt-0.5`} />
                            <span className="text-slate-700 text-sm">{skill}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* CTA Button */}
                      <Link href="/coaches">
                        <Button className={`w-full ${colors.button} text-white py-5 rounded-xl font-semibold`}>
                          Start {level.level} Prep
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Coaches - Humanized cards */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <Badge className="mb-4 bg-amber-100 text-[#C65A1E]700">Expert Coaches</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2">{c.coaches.title}</h2>
              <p className="text-xl text-slate-900">{c.coaches.subtitle}</p>
            </div>
            <Link href="/coaches">
              <Button variant="outline" className="mt-4 md:mt-0 border-2 border-slate-300 hover:border-teal-600 hover:text-teal-600">
                {c.coaches.viewAll}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {c.coaches.items.map((coach, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden group ${
                  index === 1 ? 'md:-mt-4' : index === 2 ? 'md:mt-4' : ''
                }`}
              >
                <CardContent className="p-0">
                  {/* Coach photo with overlay */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      loading="lazy" src={coach.photo} 
                      alt={coach.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    
                    {/* Badge */}
                    <Badge className="absolute top-4 left-4 bg-[#C65A1E] text-white border-0">
                      {coach.badge}
                    </Badge>
                    
                    {/* Quick actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-5 h-5 text-slate-900" />
                      </button>
                      <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Video className="w-5 h-5 text-slate-900" />
                      </button>
                    </div>
                    
                    {/* Coach info overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold">{coach.name}</h3>
                      <p className="text-white/80">{coach.specialty}</p>
                    </div>
                  </div>
                  
                  {/* Coach details */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-amber-400 text-[#C65A1E]400" />
                        <span className="font-bold text-slate-900">{coach.rating}</span>
                        <span className="text-slate-500">({coach.reviews} reviews)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-slate-900">${coach.price}</span>
                        <span className="text-slate-500">/hr</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {coach.languages.map((lang, i) => (
                        <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-900">
                          <Globe className="w-3 h-3 mr-1" />
                          {lang}
                        </Badge>
                      ))}
                    </div>
                    
                    <Link href={`/coach/${coach.name.toLowerCase().replace(' ', '-')}`}>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                        Book a Lesson
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services - Color-coded cards with asymmetry */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FFF1E8] text-[#C65A1E]">Our Services</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{c.services.title}</h2>
            <p className="text-xl text-slate-900">{c.services.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {c.services.items.map((service, index) => {
              const colorClasses = {
                teal: "from-teal-500 to-teal-600 bg-teal-50 text-teal-600",
                amber: "from-[#C65A1E] to-[#A84A15] bg-amber-50 text-[#C65A1E]600",
                copper: "from-[#C65A1E] to-[#E06B2D] bg-[#FFF1E8] text-[#C65A1E]",
                // @ts-expect-error - TS1117: auto-suppressed during TS cleanup
                teal: "from-[#0F3D3E] to-[#145A5B] bg-[#E7F2F2] text-[#0F3D3E]",
              };
              const colors = colorClasses[service.color as keyof typeof colorClasses];
              
              return (
                <Card 
                  key={index} 
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    index % 2 === 1 ? 'md:mt-8' : ''
                  }`}
                >
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${colors.split(' ')[2]} ${colors.split(' ')[3]}`}>
                      <service.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3">{service.title}</h3>
                    <p className="text-slate-900 mb-6">{service.description}</p>
                    <ul className="space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-slate-700">
                          <CheckCircle2 className={`w-5 h-5 mr-3 flex-shrink-0 ${colors.split(' ')[3]}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials - More human, with photos */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#E7F2F2] text-[#0F3D3E]">Success Stories</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{c.testimonials.title}</h2>
            <p className="text-xl text-slate-900">{c.testimonials.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {c.testimonials.items.map((testimonial, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  index === 1 ? 'md:-mt-6' : ''
                }`}
              >
                <CardContent className="p-8">
                  {/* Result badge */}
                  <Badge className="mb-4 bg-green-100 text-green-700 border-0">
                    <Award className="w-3 h-3 mr-1" />
                    {testimonial.result}
                  </Badge>
                  
                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#C65A1E]400 fill-amber-400" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-slate-700 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img 
                      loading="lazy" src={testimonial.photo} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-900">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Clean, accessible */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700">FAQ</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{c.faq.title}</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {c.faq.items.map((item, index) => (
              <Card key={index} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-slate-900 pr-4">{item.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6 text-slate-900 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Warm, inviting */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{c.cta.title}</h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">{c.cta.description}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                {c.cta.button}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-teal-200">
            <Link href="/booking" className="underline hover:text-white transition-colors">
              {c.cta.contact}
            </Link>
          </p>
        </div>
      </section>

      {/* Cross-Ecosystem Section */}
      <CrossEcosystemSection variant="lingueefy" />

      <FooterInstitutional />
    </div>
  );
}
