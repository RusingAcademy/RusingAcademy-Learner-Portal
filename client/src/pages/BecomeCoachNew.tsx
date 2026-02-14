import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoachApplicationWizard } from "@/components/CoachApplicationWizard";
import { ApplicationStatusTracker } from "@/components/ApplicationStatusTracker";
import {
  Users,
  DollarSign,
  Clock,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Shield,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Heart,
  Zap,
  Sparkles,
  Calendar,
  Video,
  Camera,
  FileText,
  Lock,
  Eye,
  UserCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Play,
  HelpCircle,
} from "lucide-react";
import { getLoginUrl, getSignupUrl } from "@/const";
// EcosystemHeaderGold is provided by EcosystemLayout
import { cn } from "@/lib/utils";

export default function BecomeCoachNew() {
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [showApplication, setShowApplication] = useState(false);
  const [applicationComplete, setApplicationComplete] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Form state for coach registration
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEn = language === "en";

  const labels = {
    en: {
      // Hero
      heroTitle: "Transform Your Expertise",
      heroTitleHighlight: "Into a Thriving Career",
      heroLead: "Join Canada's leading SLE preparation platform where thousands of public servants find their perfect language coach daily.",
      heroBenefits: [
        { icon: Calendar, text: "Organize your schedule" },
        { icon: Video, text: "Give lessons online or in person" },
        { icon: DollarSign, text: "Set your rates ($25-$100+ per hour)" },
      ],
      heroAudience: "Teachers, tutors, language professionals, government employees with SLE experience...",
      heroCta: "Register with Lingueefy and start coaching today!",
      
      // Form
      formTitle: "Create your coach profile",
      formFirstName: "First Name",
      formLastName: "Last Name",
      formEmail: "Email",
      formPassword: "Password",
      formSubmit: "Sign up by email",
      formTerms: "By clicking Continue or Sign up, you agree to Lingueefy",
      formTermsLink: "Terms of Use",
      formTermsExtra: ", including Subscription Terms and Privacy Policy",
      formOr: "or",
      formGoogle: "Sign up with Google",
      
      // How it works
      howItWorksTitle: "How it works",
      howItWorksSubtitle: "Getting started is simple. Follow these three steps to begin your coaching journey.",
      steps: [
        {
          number: "01",
          title: "Create your profile",
          description: "Fill out your professional information, upload a photo, and record a short introduction video. Highlight your SLE expertise and teaching experience.",
          duration: "15 minutes",
        },
        {
          number: "02",
          title: "Add availability & services",
          description: "Set your schedule, define your hourly rate, and specify which SLE levels you teach (Oral A/B/C, Written, Reading). Connect your Stripe account for payments.",
          duration: "10 minutes",
        },
        {
          number: "03",
          title: "Get approved & start coaching",
          description: "Our team reviews your application within 2-3 business days. Once approved, your profile goes live and learners can book sessions with you.",
          duration: "2-3 days",
        },
      ],
      
      // Requirements
      requirementsTitle: "Requirements",
      requirementsSubtitle: "Who can become a Lingueefy coach?",
      qualifications: {
        title: "Qualifications",
        items: [
          "Native or near-native fluency in French and/or English",
          "Experience teaching or tutoring languages to adults",
          "Understanding of Canadian federal SLE requirements (preferred)",
          "Strong communication and interpersonal skills",
        ],
      },
      contentNeeded: {
        title: "What you'll need",
        items: [
          "Professional headshot photo",
          "Short introduction video (1-2 minutes)",
          "Bio highlighting your teaching experience",
          "Credentials or certifications (if applicable)",
        ],
      },
      timeline: {
        title: "Review process",
        items: [
          "Application review: 2-3 business days",
          "Profile approval: Same day after review",
          "First booking: Within 1 week of going live",
        ],
      },
      
      // Safety & Trust
      safetyTitle: "Safety & Trust",
      safetySubtitle: "Your security and privacy are our top priorities.",
      safetyItems: [
        {
          icon: Lock,
          title: "Data Privacy",
          description: "Your personal information is encrypted and never shared with third parties. We comply with Canadian privacy laws.",
        },
        {
          icon: UserCheck,
          title: "Profile Verification",
          description: "All coach profiles are manually reviewed by our team to ensure quality and authenticity.",
        },
        {
          icon: Shield,
          title: "Secure Payments",
          description: "Payments are processed securely through Stripe. You receive weekly payouts directly to your bank account.",
        },
        {
          icon: Eye,
          title: "Content Moderation",
          description: "We maintain high standards for all content on the platform. Inappropriate behavior results in immediate removal.",
        },
      ],
      
      // FAQ
      faqTitle: "Frequently Asked Questions",
      faqs: [
        {
          q: "How long does the application process take?",
          a: "The initial application takes about 15-20 minutes to complete. Our team reviews applications within 2-3 business days. Once approved, you can start accepting bookings immediately.",
        },
        {
          q: "Can I edit my profile after it's published?",
          a: "Yes! You can update your bio, photo, video, availability, and rates at any time from your coach dashboard. Major changes may require re-approval.",
        },
        {
          q: "What are the video requirements?",
          a: "We recommend a 1-2 minute introduction video where you speak in your teaching language(s). Good lighting, clear audio, and a professional background are important. You can upload a video file or link to YouTube.",
        },
        {
          q: "What is the approval process?",
          a: "Our team reviews your qualifications, teaching experience, and profile content. We verify your language proficiency and ensure your profile meets our quality standards. You'll receive an email with the decision.",
        },
        {
          q: "Who will see my profile?",
          a: "Your public profile is visible to all Lingueefy users searching for coaches. Personal contact information (email, phone) is kept private until a learner books a session with you.",
        },
        {
          q: "What is the commission structure?",
          a: "Lingueefy charges 15-26% commission based on your monthly volume. The more you teach, the lower your commission rate. You keep 74-85% of your earnings.",
        },
        {
          q: "Do I need SLE certification?",
          a: "While not required, having achieved SLE levels yourself is highly valued by learners. Many successful coaches are current or former public servants who passed their own SLE exams.",
        },
      ],
      
      // Why Coaches Love Lingueefy
      whyJoinTitle: "Why Coaches Love Lingueefy",
      whyJoinSubtitle: "Join a platform designed with coaches in mind. We handle the business side so you can focus on what you do best.",
      benefits: [
        {
          icon: Clock,
          title: "Flexible Schedule",
          description: "Set your own hours and work from anywhere. Accept bookings that fit your lifestyle.",
        },
        {
          icon: DollarSign,
          title: "Competitive Earnings",
          description: "Earn $40-$100+ per hour with our transparent commission structure. Weekly payouts via Stripe.",
        },
        {
          icon: Users,
          title: "Targeted Audience",
          description: "Connect with motivated federal public servants who need your expertise for career advancement.",
        },
        {
          icon: Award,
          title: "Professional Growth",
          description: "Access SLE-specific training materials, community support, and professional development resources.",
        },
        {
          icon: Shield,
          title: "Secure Platform",
          description: "Automated scheduling, secure payments, and built-in video conferencing. Focus on teaching.",
        },
        {
          icon: TrendingUp,
          title: "Build Your Brand",
          description: "Create a professional profile, collect reviews, and grow your coaching business with us.",
        },
      ],
      
      // Earning Potential
      earningTitle: "Earn What You Deserve",
      earningSubtitle: "Our transparent commission structure rewards your hard work. The more you teach, the more you keep.",
      earningFeatures: [
        { title: "Weekly Payouts", subtitle: "Via Stripe Connect" },
        { title: "15-26% Commission", subtitle: "Volume-based tiers" },
        { title: "You Set Your Rates", subtitle: "$25-$100+/hour" },
      ],
      earningExamples: [
        { sessions: "20 sessions/month", amount: "$1,000+" },
        { sessions: "40 sessions/month", amount: "$2,000+" },
        { sessions: "60+ sessions/month", amount: "$3,000+" },
      ],
      earningNote: "* Based on $50/hour rate with volume discounts",
      
      // Testimonials
      testimonialsTitle: "What Our Coaches Say",
      coachTestimonials: [
        {
          name: "Sue-Anne R.",
          role: "SLE Confidence Coach",
          image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/sue-anne-richer.jpg",
          quote: "Lingueefy has transformed my coaching career. The platform handles all the admin work so I can focus on what I love - teaching!",
          rating: 5,
        },
        {
          name: "Steven B.",
          role: "SLE Specialist",
          image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/steven-barholere.jpg",
          quote: "The quality of students on Lingueefy is exceptional. They're motivated professionals who value my expertise.",
          rating: 5,
        },
        {
          name: "Erika S.",
          role: "Bilingual Coach",
          image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/erika-seguin.jpg",
          quote: "I've doubled my income since joining Lingueefy. The commission structure rewards hard work.",
          rating: 5,
        },
      ],
      
      // CTA
      ctaTitle: "Ready to start your coaching journey?",
      ctaSubtitle: "Join hundreds of coaches who are building successful careers on Lingueefy.",
      ctaButton: "Start Your Application",
      ctaLoginButton: "Sign in to apply",
      ctaTrust: [
        "Free to join",
        "Weekly payouts",
        "No minimum hours",
      ],
    },
    fr: {
      // Hero
      heroTitle: "Transformez votre expertise",
      heroTitleHighlight: "en carrière florissante",
      heroLead: "Rejoignez la principale plateforme de préparation ELS du Canada où des milliers de fonctionnaires trouvent leur coach linguistique idéal chaque jour.",
      heroBenefits: [
        { icon: Calendar, text: "Organisez votre emploi du temps" },
        { icon: Video, text: "Donnez des cours en ligne ou en personne" },
        { icon: DollarSign, text: "Fixez vos tarifs (25-100$+ par heure)" },
      ],
      heroAudience: "Enseignants, tuteurs, professionnels des langues, employés du gouvernement avec expérience ELS...",
      heroCta: "Inscrivez-vous sur Lingueefy et commencez à coacher aujourd'hui!",
      
      // Form
      formTitle: "Créez votre profil de coach",
      formFirstName: "Prénom",
      formLastName: "Nom",
      formEmail: "Courriel",
      formPassword: "Mot de passe",
      formSubmit: "S'inscrire par courriel",
      formTerms: "En cliquant sur Continuer ou S'inscrire, vous acceptez les",
      formTermsLink: "Conditions d'utilisation",
      formTermsExtra: " de Lingueefy, y compris les Conditions d'abonnement et la Politique de confidentialité",
      formOr: "ou",
      formGoogle: "S'inscrire avec Google",
      
      // How it works
      howItWorksTitle: "Comment ça marche",
      howItWorksSubtitle: "Commencer est simple. Suivez ces trois étapes pour débuter votre parcours de coach.",
      steps: [
        {
          number: "01",
          title: "Créez votre profil",
          description: "Remplissez vos informations professionnelles, téléchargez une photo et enregistrez une courte vidéo d'introduction. Mettez en valeur votre expertise ELS et votre expérience d'enseignement.",
          duration: "15 minutes",
        },
        {
          number: "02",
          title: "Ajoutez disponibilité et services",
          description: "Définissez votre emploi du temps, votre tarif horaire et les niveaux ELS que vous enseignez (Oral A/B/C, Écrit, Lecture). Connectez votre compte Stripe pour les paiements.",
          duration: "10 minutes",
        },
        {
          number: "03",
          title: "Approbation et début du coaching",
          description: "Notre équipe examine votre candidature dans les 2-3 jours ouvrables. Une fois approuvé, votre profil est publié et les apprenants peuvent réserver des sessions.",
          duration: "2-3 jours",
        },
      ],
      
      // Requirements
      requirementsTitle: "Exigences",
      requirementsSubtitle: "Qui peut devenir coach Lingueefy?",
      qualifications: {
        title: "Qualifications",
        items: [
          "Maîtrise native ou quasi-native du français et/ou de l'anglais",
          "Expérience d'enseignement ou de tutorat de langues aux adultes",
          "Compréhension des exigences ELS du gouvernement fédéral canadien (préféré)",
          "Excellentes compétences en communication et relations interpersonnelles",
        ],
      },
      contentNeeded: {
        title: "Ce dont vous aurez besoin",
        items: [
          "Photo professionnelle",
          "Courte vidéo d'introduction (1-2 minutes)",
          "Bio mettant en valeur votre expérience d'enseignement",
          "Diplômes ou certifications (si applicable)",
        ],
      },
      timeline: {
        title: "Processus de révision",
        items: [
          "Examen de la candidature: 2-3 jours ouvrables",
          "Approbation du profil: Le jour même après examen",
          "Première réservation: Dans la semaine suivant la publication",
        ],
      },
      
      // Safety & Trust
      safetyTitle: "Sécurité et confiance",
      safetySubtitle: "Votre sécurité et votre vie privée sont nos priorités.",
      safetyItems: [
        {
          icon: Lock,
          title: "Protection des données",
          description: "Vos informations personnelles sont cryptées et jamais partagées avec des tiers. Nous respectons les lois canadiennes sur la vie privée.",
        },
        {
          icon: UserCheck,
          title: "Vérification des profils",
          description: "Tous les profils de coach sont examinés manuellement par notre équipe pour garantir qualité et authenticité.",
        },
        {
          icon: Shield,
          title: "Paiements sécurisés",
          description: "Les paiements sont traités de manière sécurisée via Stripe. Vous recevez des versements hebdomadaires directement sur votre compte bancaire.",
        },
        {
          icon: Eye,
          title: "Modération du contenu",
          description: "Nous maintenons des standards élevés pour tout le contenu sur la plateforme. Les comportements inappropriés entraînent un retrait immédiat.",
        },
      ],
      
      // FAQ
      faqTitle: "Questions fréquemment posées",
      faqs: [
        {
          q: "Combien de temps prend le processus de candidature?",
          a: "La candidature initiale prend environ 15-20 minutes. Notre équipe examine les candidatures dans les 2-3 jours ouvrables. Une fois approuvé, vous pouvez commencer à accepter des réservations immédiatement.",
        },
        {
          q: "Puis-je modifier mon profil après sa publication?",
          a: "Oui! Vous pouvez mettre à jour votre bio, photo, vidéo, disponibilité et tarifs à tout moment depuis votre tableau de bord. Les modifications majeures peuvent nécessiter une nouvelle approbation.",
        },
        {
          q: "Quelles sont les exigences pour la vidéo?",
          a: "Nous recommandons une vidéo d'introduction de 1-2 minutes où vous parlez dans votre(vos) langue(s) d'enseignement. Un bon éclairage, un son clair et un arrière-plan professionnel sont importants.",
        },
        {
          q: "Quel est le processus d'approbation?",
          a: "Notre équipe examine vos qualifications, votre expérience d'enseignement et le contenu de votre profil. Nous vérifions votre maîtrise linguistique et nous assurons que votre profil répond à nos standards de qualité.",
        },
        {
          q: "Qui verra mon profil?",
          a: "Votre profil public est visible par tous les utilisateurs Lingueefy recherchant des coachs. Vos coordonnées personnelles (courriel, téléphone) restent privées jusqu'à ce qu'un apprenant réserve une session.",
        },
        {
          q: "Quelle est la structure de commission?",
          a: "Lingueefy facture 15-26% de commission selon votre volume mensuel. Plus vous enseignez, plus votre taux de commission est bas. Vous gardez 74-85% de vos gains.",
        },
        {
          q: "Ai-je besoin d'une certification ELS?",
          a: "Bien que non requis, avoir atteint des niveaux ELS vous-même est très apprécié par les apprenants. Beaucoup de coachs à succès sont des fonctionnaires actuels ou anciens qui ont passé leurs propres examens ELS.",
        },
      ],
      
      // Why Coaches Love Lingueefy
      whyJoinTitle: "Pourquoi les coachs adorent Lingueefy",
      whyJoinSubtitle: "Rejoignez une plateforme conçue pour les coachs. Nous gérons le côté affaires pour que vous puissiez vous concentrer sur ce que vous faites de mieux.",
      benefits: [
        {
          icon: Clock,
          title: "Horaire flexible",
          description: "Définissez vos propres heures et travaillez de n'importe où. Acceptez les réservations qui conviennent à votre style de vie.",
        },
        {
          icon: DollarSign,
          title: "Revenus compétitifs",
          description: "Gagnez 40-100$+ par heure avec notre structure de commission transparente. Paiements hebdomadaires via Stripe.",
        },
        {
          icon: Users,
          title: "Public ciblé",
          description: "Connectez-vous avec des fonctionnaires fédéraux motivés qui ont besoin de votre expertise pour leur avancement professionnel.",
        },
        {
          icon: Award,
          title: "Croissance professionnelle",
          description: "Accédez à des matériaux de formation ELS, au soutien communautaire et aux ressources de développement professionnel.",
        },
        {
          icon: Shield,
          title: "Plateforme sécurisée",
          description: "Planification automatisée, paiements sécurisés et vidéoconférence intégrée. Concentrez-vous sur l'enseignement.",
        },
        {
          icon: TrendingUp,
          title: "Construisez votre marque",
          description: "Créez un profil professionnel, collectez des avis et développez votre activité de coaching avec nous.",
        },
      ],
      
      // Earning Potential
      earningTitle: "Gagnez ce que vous méritez",
      earningSubtitle: "Notre structure de commission transparente récompense votre travail acharné. Plus vous enseignez, plus vous gardez.",
      earningFeatures: [
        { title: "Paiements hebdomadaires", subtitle: "Via Stripe Connect" },
        { title: "15-26% de commission", subtitle: "Paliers basés sur le volume" },
        { title: "Vous fixez vos tarifs", subtitle: "25-100$+/heure" },
      ],
      earningExamples: [
        { sessions: "20 sessions/mois", amount: "1 000$+" },
        { sessions: "40 sessions/mois", amount: "2 000$+" },
        { sessions: "60+ sessions/mois", amount: "3 000$+" },
      ],
      earningNote: "* Basé sur un tarif de 50$/heure avec remises de volume",
      
      // Testimonials
      testimonialsTitle: "Ce que disent nos coachs",
      coachTestimonials: [
        {
          name: "Sue-Anne R.",
          role: "Coach confiance ELS",
          image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/sue-anne-richer.jpg",
          quote: "Lingueefy a transformé ma carrière de coach. La plateforme gère tout le travail administratif pour que je puisse me concentrer sur ce que j'aime - enseigner!",
          rating: 5,
        },
        {
          name: "Steven B.",
          role: "Spécialiste ELS",
          image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/steven-barholere.jpg",
          quote: "La qualité des étudiants sur Lingueefy est exceptionnelle. Ce sont des professionnels motivés qui valorisent mon expertise.",
          rating: 5,
        },
        {
          name: "Erika S.",
          role: "Coach bilingue",
          image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/erika-seguin.jpg",
          quote: "J'ai doublé mes revenus depuis que j'ai rejoint Lingueefy. La structure de commission récompense le travail acharné.",
          rating: 5,
        },
      ],
      
      // CTA
      ctaTitle: "Prêt à commencer votre parcours de coach?",
      ctaSubtitle: "Rejoignez des centaines de coachs qui construisent des carrières réussies sur Lingueefy.",
      ctaButton: "Commencer ma candidature",
      ctaLoginButton: "Se connecter pour postuler",
      ctaTrust: [
        "Inscription gratuite",
        "Paiements hebdomadaires",
        "Pas d'heures minimum",
      ],
    },
  };

  const l = labels[language] || labels.en;

  // Application success view
  if (applicationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{isEn ? "Application Submitted!" : "Candidature soumise!"}</h1>
            <p className="text-slate-900 dark:text-slate-100 mb-6">
              {isEn 
                ? "Thank you for applying to become a Lingueefy coach. We'll review your application and get back to you within 2-3 business days."
                : "Merci d'avoir postulé pour devenir coach Lingueefy. Nous examinerons votre candidature et vous répondrons dans les 2-3 jours ouvrables."}
            </p>
            <a href="/">
              <Button variant="outline" className="gap-2">
                {isEn ? "Back to Home" : "Retour à l'accueil"}
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application wizard view
  if (showApplication && isAuthenticated) {
    return (
      <>
        <div className="container py-8 bg-white min-h-screen">
          <ApplicationStatusTracker />
          <CoachApplicationWizard
            onComplete={() => setApplicationComplete(true)}
            onCancel={() => setShowApplication(false)}
          />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="bg-white">
        {/* Hero Section - Premium Design with Light Green Background */}
        <section className="relative overflow-hidden" style={{background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #d1fae5 50%, #ecfdf5 75%, #f0fdf4 100%)'}}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating orbs with subtle animation */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}} />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-100/40 rounded-full blur-2xl" />
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)', backgroundSize: '40px 40px'}} />
          </div>
          
          <div className="container relative py-16 md:py-24 px-6 md:px-8 lg:px-12 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left Column - Content */}
              <div className="max-w-xl">
                {/* Premium Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-sm mb-6">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">{isEn ? "Canada's #1 SLE Coaching Platform" : "Plateforme #1 de coaching ELS au Canada"}</span>
                </div>

                {/* Title with premium typography */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight">
                  {l.heroTitle}
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">{l.heroTitleHighlight}</span>
                </h1>

                {/* Lead text with better styling */}
                <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
                  {l.heroLead}
                </p>

                {/* Benefits list with glassmorphism cards */}
                <div className="space-y-3 mb-10">
                  {l.heroBenefits.map((benefit, i) => {
                    const Icon = benefit.icon;
                    return (
                      <div 
                        key={i} 
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300"
                      >
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-slate-700 font-medium">{benefit.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Audience with subtle styling */}
                <p className="text-sm text-slate-700 mb-4 italic">
                  {l.heroAudience}
                </p>

                {/* CTA text with emphasis */}
                <p className="text-slate-800 font-semibold flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-emerald-600" />
                  {l.heroCta}
                </p>
              </div>

              {/* Right Column - Registration Form */}
              <div className="lg:sticky lg:top-24">
                {/* Coach CTA Card with Image */}
                <div className="relative">
                  {/* Glow effect behind card */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl blur-lg opacity-20" />
                  <Card className="relative bg-white/90 backdrop-blur-xl shadow-2xl shadow-emerald-900/10 border border-white/50 rounded-2xl overflow-hidden">
                    {/* Coach Image */}
                    <div className="relative h-80 overflow-hidden">
                      <img 
                        loading="lazy" src="/images/coach-hero.jpg" 
                        alt={isEn ? "Become a Lingueefy Coach" : "Devenez coach Lingueefy"}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <CardContent className="p-8 text-center">
                      {/* CTA Content */}
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 mb-4 -mt-12 relative z-10 border-4 border-white">
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {isEn ? "Ready to Share Your Expertise?" : "Prêt à partager votre expertise?"}
                      </h2>
                      <p className="text-slate-600 mb-6">
                        {isEn 
                          ? "Join 50+ expert coaches and help Canadian public servants achieve bilingual excellence."
                          : "Rejoignez 50+ coaches experts et aidez les fonctionnaires canadiens à atteindre l'excellence bilingue."}
                      </p>
                      <Button 
                        className="w-full h-12 bg-[#C65A1E] hover:bg-amber-600 text-white font-semibold text-lg"
                        onClick={() => {
                          if (!isAuthenticated) {
                            window.location.href = getSignupUrl();
                          } else {
                            setShowApplication(true);
                          }
                        }}
                      >
                        {isEn ? "Start Your Application" : "Commencer votre candidature"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-xs text-slate-700 mt-4">
                        {isEn ? "Free to join • Weekly payouts • Flexible schedule" : "Inscription gratuite • Paiements hebdomadaires • Horaire flexible"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Premium Editorial Layout */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="container">
            <div className="text-center mb-20">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                {isEn ? "Simple Process" : "Processus Simple"}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{l.howItWorksTitle}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{l.howItWorksSubtitle}</p>
            </div>

            <div className="max-w-5xl mx-auto">
              {l.steps.map((step, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "grid md:grid-cols-[140px_1fr] gap-8 md:gap-12 pb-16 mb-16 relative",
                    i < l.steps.length - 1 && "border-b border-slate-200"
                  )}
                >
                  {/* Large number with gradient */}
                  <div className="relative">
                    <div className="text-8xl md:text-9xl font-black leading-none bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                      {step.number}
                    </div>
                    {/* Decorative dot */}
                    <div className="absolute -bottom-2 left-1/2 w-3 h-3 rounded-full bg-emerald-500 hidden md:block" />
                  </div>
                  
                  {/* Content with card styling */}
                  <div className="p-6 md:p-8 rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed text-lg">{step.description}</p>
                    <Badge className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 px-4 py-2">
                      <Clock className="h-4 w-4 mr-2" />
                      {step.duration}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section - Premium Design */}
        <section className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'}}>
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-100 rounded-full blur-3xl" />
          </div>
          
          <div className="container relative">
            <div className="text-center mb-16">
              <Badge className="bg-white text-emerald-700 border-emerald-200 shadow-sm mb-4">
                <Award className="h-3 w-3 mr-1" />
                {isEn ? "Join Our Team" : "Rejoignez Notre Équipe"}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{l.requirementsTitle}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{l.requirementsSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Qualifications */}
              <Card className="group border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-5">{l.qualifications.title}</h3>
                  <ul className="space-y-4">
                    {l.qualifications.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-teal-600" />
                        </div>
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Content Needed */}
              <Card className="group border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#C65A1E] to-[#A84A15] flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-5">{l.contentNeeded.title}</h3>
                  <ul className="space-y-4">
                    {l.contentNeeded.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-[#C65A1E]600" />
                        </div>
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="group border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-5">{l.timeline.title}</h3>
                  <ul className="space-y-4">
                    {l.timeline.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Safety & Trust Section - Premium Design */}
        <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container relative">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-white/10 text-emerald-300 border-emerald-500/30 backdrop-blur-sm">
                <Shield className="h-4 w-4 mr-2" />
                {isEn ? "Your Security Matters" : "Votre sécurité compte"}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{l.safetyTitle}</h2>
              <p className="text-lg max-w-2xl mx-auto" style={{color: '#ffffff'}}>{l.safetySubtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {l.safetyItems.map((item, i) => {
                const Icon = item.icon;
                const gradients = [
                  "from-emerald-400 to-teal-500",
                  "from-blue-400 to-indigo-500",
                  "from-[#D97B3D] to-[#C65A1E]",
                  "from-[#C65A1E] to-[#E06B2D]",
                ];
                return (
                  <div key={i} className="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-3">{item.title}</h3>
                    <p className="leading-relaxed" style={{color: '#fcfcfd'}}>{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Coaches Love Lingueefy - Premium Design */}
        <section className="py-24 bg-white relative">
          <div className="container">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
                <Star className="h-3 w-3 mr-1 fill-emerald-500" />
                {isEn ? "Benefits" : "Avantages"}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">{l.whyJoinTitle}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{l.whyJoinSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {l.benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                const gradients = [
                  "from-blue-500 to-indigo-600",
                  "from-emerald-500 to-teal-600",
                  "from-[#0F3D3E] to-[#145A5B]",
                  "from-[#C65A1E] to-[#A84A15]",
                  "from-teal-500 to-cyan-600",
                  "from-[#C65A1E] to-[#E06B2D]",
                ];
                const bgColors = [
                  "bg-blue-50",
                  "bg-emerald-50",
                  "bg-[#E7F2F2]",
                  "bg-amber-50",
                  "bg-teal-50",
                  "bg-[#FFF1E8]",
                ];
                return (
                  <Card key={i} className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg rounded-2xl overflow-hidden ${bgColors[i]}`}>
                    <CardContent className="p-8">
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-slate-900">{benefit.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Earning Potential - Premium Design */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-100 rounded-full blur-3xl" />
          </div>
          
          <div className="container relative">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <Badge className="mb-4 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {isEn ? "Earning Potential" : "Potentiel de revenus"}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900">{l.earningTitle}</h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">{l.earningSubtitle}</p>

                  <div className="space-y-5">
                    {l.earningFeatures.map((feature, i) => {
                      const icons = [Briefcase, TrendingUp, DollarSign];
                      const gradients = ["from-teal-500 to-emerald-600", "from-emerald-500 to-green-600", "from-[#C65A1E] to-[#A84A15]"];
                      const Icon = icons[i];
                      return (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{feature.title}</div>
                            <div className="text-sm text-slate-700">{feature.subtitle}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Premium Earnings Card */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl blur-lg opacity-30" />
                  <div className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 rounded-3xl p-10 text-white shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-emerald-300" />
                      </div>
                      <h3 className="text-xl font-bold">{isEn ? "Example Monthly Earnings" : "Exemple de revenus mensuels"}</h3>
                    </div>
                    <div className="space-y-5">
                      {l.earningExamples.map((example, i) => (
                        <div key={i} className={`flex justify-between items-center py-4 ${i < l.earningExamples.length - 1 ? "border-b border-white/10" : ""}`}>
                          <span className="text-emerald-200 text-lg">{example.sessions}</span>
                          <span className="text-3xl font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">{example.amount}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm mt-6" style={{color: '#d1fae5'}}>{l.earningNote}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials - Premium Design */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative">
          <div className="container">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-[#FFF0E6] to-[#FFF0E6] text-[#C65A1E]700 border-[#FFE4D6]">
                <MessageSquare className="h-3 w-3 mr-1" />
                {isEn ? "Success Stories" : "Témoignages"}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">{l.testimonialsTitle}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {l.coachTestimonials.map((testimonial, i) => (
                <Card key={i} className="group border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-8">
                    {/* Quote icon */}
                    <div className="mb-6">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D97B3D] to-[#C65A1E] flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-5">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-5 w-5 fill-amber-400 text-[#C65A1E]400" />
                      ))}
                    </div>
                    
                    {/* Quote */}
                    <p className="text-slate-600 mb-8 text-lg leading-relaxed">"{testimonial.quote}"</p>
                    
                    {/* Author */}
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                      <div className="relative">
                        <img
                          loading="lazy" src={testimonial.image}
                          alt={testimonial.name}
                          className="h-14 w-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                        <div className="text-sm text-emerald-600 font-medium">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - Premium Design */}
        <section className="py-24 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-white text-emerald-700 border-emerald-200 shadow-sm">
                <HelpCircle className="h-3 w-3 mr-1" />
                {isEn ? "FAQ" : "FAQ"}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{l.faqTitle}</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {l.faqs.map((faq, i) => (
                <Card 
                  key={i} 
                  className={cn(
                    "border-0 shadow-lg shadow-slate-200/50 transition-all duration-300 cursor-pointer rounded-xl overflow-hidden",
                    expandedFaq === i ? "shadow-xl bg-white ring-2 ring-emerald-500/20" : "bg-white hover:shadow-xl"
                  )}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-slate-900 text-lg">{faq.q}</h3>
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                        expandedFaq === i ? "bg-emerald-500 text-white rotate-180" : "bg-slate-100 text-slate-700"
                      )}>
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    </div>
                    {expandedFaq === i && (
                      <p className="text-slate-600 mt-4 leading-relaxed text-lg border-t border-slate-100 pt-4">{faq.a}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-20 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>

          <div className="container relative text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              {isEn ? "Start Today" : "Commencez aujourd'hui"}
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {l.ctaTitle}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{color: '#f9fafa'}}>
              {l.ctaSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {!isAuthenticated ? (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 shadow-xl gap-2 w-full sm:w-auto">
                    {l.ctaLoginButton}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Button
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-teal-50 shadow-xl gap-2"
                  onClick={() => setShowApplication(true)}
                >
                  {l.ctaButton}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-teal-200">
              {l.ctaTrust.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
