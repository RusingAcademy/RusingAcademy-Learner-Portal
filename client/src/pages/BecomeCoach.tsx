import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Building2,
  Target,
  Wallet,
  Calendar,
  Video,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import EcosystemHeaderGold from "@/components/EcosystemHeaderGold";
import { COACH_EARNINGS } from "@shared/pricing";

export default function BecomeCoach() {
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [showApplication, setShowApplication] = useState(false);
  const [applicationComplete, setApplicationComplete] = useState(false);
  const isEn = language === "en";

  const labels = {
    en: {
      title: "Become a Lingueefy Coach",
      subtitle: "Join our network of expert language coaches helping Canadian public servants achieve their SLE goals",
      heroStats: [
        { value: "500+", label: "Active Coaches" },
        { value: "$75", label: "Avg. Hourly Rate" },
        { value: "15K+", label: "Sessions Completed" },
        { value: "4.9", label: "Coach Rating" },
      ],
      whyJoin: "Why Coaches Love Lingueefy",
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
      requirements: "What We're Looking For",
      requirementsList: [
        { icon: Globe, text: "Fluent in French and/or English (native or near-native level)" },
        { icon: GraduationCap, text: "Experience teaching or tutoring languages to adults" },
        { icon: Briefcase, text: "Understanding of Canadian federal SLE requirements (preferred)" },
        { icon: Zap, text: "Reliable internet connection and quiet workspace" },
        { icon: Heart, text: "Passion for helping others achieve their language goals" },
      ],
      howItWorks: "How It Works",
      steps: [
        { step: "1", title: "Apply", description: "Complete our comprehensive application form with your qualifications and experience." },
        { step: "2", title: "Review", description: "Our team reviews your application within 2-3 business days." },
        { step: "3", title: "Onboard", description: "Complete your profile, set your availability, and connect your Stripe account." },
        { step: "4", title: "Start Coaching", description: "Accept bookings and start helping learners achieve their SLE goals!" },
      ],
      testimonials: "What Our Coaches Say",
      coachTestimonials: [
        {
          name: "Marie-Claire D.",
          role: "French Coach",
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
      faq: "Frequently Asked Questions",
      faqs: [
        {
          q: "What is the commission structure?",
          a: "Lingueefy charges 15-26% commission based on your monthly volume. The more you teach, the lower your commission rate.",
        },
        {
          q: "How do I get paid?",
          a: "Payments are processed weekly via Stripe Connect. You'll receive your earnings directly to your bank account.",
        },
        {
          q: "Can I set my own rates?",
          a: "Yes! You have full control over your hourly rate and trial session pricing. We recommend $50-$100/hour based on experience.",
        },
        {
          q: "What equipment do I need?",
          a: "A computer with a webcam, microphone, and stable internet connection. Our platform handles video conferencing.",
        },
        {
          q: "Do I need SLE certification?",
          a: "While not required, having achieved SLE levels yourself is highly valued by learners and can help you attract more students.",
        },
      ],
      applyNow: "Start Your Application",
      loginToApply: "Sign in to apply",
      alreadyCoach: "Already a coach?",
      goToDashboard: "Go to Dashboard",
      successTitle: "Application Submitted!",
      successMessage: "Thank you for applying to become a Lingueefy coach. We'll review your application and get back to you within 2-3 business days.",
      successNext: "What's Next?",
      successSteps: [
        "Check your email for a confirmation message",
        "Our team will review your qualifications",
        "You'll receive an email with next steps",
        "Complete onboarding and start coaching!",
      ],
      backToHome: "Back to Home",
    },
    fr: {
      title: "Devenez coach Lingueefy",
      subtitle: "Rejoignez notre réseau de coachs linguistiques experts aidant les fonctionnaires canadiens à atteindre leurs objectifs ELS",
      heroStats: [
        { value: "500+", label: "Coachs actifs" },
        { value: "75$", label: "Tarif horaire moy." },
        { value: "15K+", label: "Sessions complétées" },
        { value: "4.9", label: "Note des coachs" },
      ],
      whyJoin: "Pourquoi les coachs adorent Lingueefy",
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
      requirements: "Ce que nous recherchons",
      requirementsList: [
        { icon: Globe, text: "Maîtrise du français et/ou de l'anglais (niveau natif ou quasi-natif)" },
        { icon: GraduationCap, text: "Expérience d'enseignement ou de tutorat de langues aux adultes" },
        { icon: Briefcase, text: "Compréhension des exigences ELS du gouvernement fédéral canadien (préféré)" },
        { icon: Zap, text: "Connexion Internet fiable et espace de travail calme" },
        { icon: Heart, text: "Passion pour aider les autres à atteindre leurs objectifs linguistiques" },
      ],
      howItWorks: "Comment ça marche",
      steps: [
        { step: "1", title: "Postulez", description: "Remplissez notre formulaire de candidature complet avec vos qualifications et votre expérience." },
        { step: "2", title: "Révision", description: "Notre équipe examine votre candidature dans les 2-3 jours ouvrables." },
        { step: "3", title: "Intégration", description: "Complétez votre profil, définissez vos disponibilités et connectez votre compte Stripe." },
        { step: "4", title: "Commencez", description: "Acceptez les réservations et aidez les apprenants à atteindre leurs objectifs ELS!" },
      ],
      testimonials: "Ce que disent nos coachs",
      coachTestimonials: [
        {
          name: "Marie-Claire D.",
          role: "Coach de français",
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
      faq: "Questions fréquemment posées",
      faqs: [
        {
          q: "Quelle est la structure de commission?",
          a: "Lingueefy facture 15-26% de commission selon votre volume mensuel. Plus vous enseignez, plus votre taux de commission est bas.",
        },
        {
          q: "Comment suis-je payé?",
          a: "Les paiements sont traités chaque semaine via Stripe Connect. Vous recevrez vos gains directement sur votre compte bancaire.",
        },
        {
          q: "Puis-je fixer mes propres tarifs?",
          a: "Oui! Vous avez le contrôle total sur votre tarif horaire et le prix des sessions d'essai. Nous recommandons 50-100$/heure selon l'expérience.",
        },
        {
          q: "De quel équipement ai-je besoin?",
          a: "Un ordinateur avec webcam, microphone et connexion Internet stable. Notre plateforme gère la vidéoconférence.",
        },
        {
          q: "Ai-je besoin d'une certification ELS?",
          a: "Bien que non requis, avoir atteint des niveaux ELS vous-même est très apprécié par les apprenants et peut vous aider à attirer plus d'étudiants.",
        },
      ],
      applyNow: "Commencer ma candidature",
      loginToApply: "Se connecter pour postuler",
      alreadyCoach: "Déjà coach?",
      goToDashboard: "Aller au tableau de bord",
      successTitle: "Candidature soumise!",
      successMessage: "Merci d'avoir postulé pour devenir coach Lingueefy. Nous examinerons votre candidature et vous répondrons dans les 2-3 jours ouvrables.",
      successNext: "Prochaines étapes?",
      successSteps: [
        "Vérifiez votre email pour un message de confirmation",
        "Notre équipe examinera vos qualifications",
        "Vous recevrez un email avec les prochaines étapes",
        "Complétez l'intégration et commencez à coacher!",
      ],
      backToHome: "Retour à l'accueil",
    },
  };

  const l = labels[language] || labels.en;

  // Federal organizations for trust section
  const federalOrgs = [
    { name: "Treasury Board", abbr: "TBS" },
    { name: "Health Canada", abbr: "HC" },
    { name: "ESDC", abbr: "ESDC" },
    { name: "CRA", abbr: "CRA" },
    { name: "IRCC", abbr: "IRCC" },
    { name: "DND", abbr: "DND" },
  ];

  // Application success view
  if (applicationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{l.successTitle}</h1>
            <p className="text-slate-900 dark:text-slate-100 mb-6">{l.successMessage}</p>
            <div className="text-left bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">{l.successNext}</h3>
              <ul className="space-y-2">
                {l.successSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                    <span className="text-sm text-slate-900 dark:text-slate-100">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a href="/">
              <Button variant="outline" className="gap-2">
                {l.backToHome}
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
      <div className="min-h-screen bg-white">
        <EcosystemHeaderGold />
        <div className="container py-8">
          <ApplicationStatusTracker />
          <CoachApplicationWizard
            onComplete={() => setApplicationComplete(true)}
            onCancel={() => setShowApplication(false)}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <EcosystemHeaderGold />

      <main>
        {/* Hero Section - Premium Dark Gradient */}
        <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl" />
          </div>

          <div className="container relative py-20 md:py-28">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                {isEn ? "Join Our Coach Network" : "Rejoignez notre réseau de coachs"}
              </Badge>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {isEn ? (
                  <>
                    <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">Transform</span> Your Expertise Into a Thriving Career
                  </>
                ) : (
                  <>
                    <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">Transformez</span> votre expertise en carrière florissante
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-teal-100 mb-10 max-w-3xl mx-auto">
                {l.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                {!isAuthenticated ? (
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 shadow-xl shadow-teal-900/20 gap-2 w-full sm:w-auto">
                      {l.loginToApply}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                ) : (
                  <Button
                    size="lg"
                    className="bg-white text-teal-700 hover:bg-teal-50 shadow-xl shadow-teal-900/20 gap-2"
                    onClick={() => setShowApplication(true)}
                  >
                    {l.applyNow}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                  <Video className="h-4 w-4" />
                  {isEn ? "Watch Video" : "Voir la vidéo"}
                </Button>
              </div>

              {/* Stats - Glassmorphism */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {l.heroStats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-teal-200">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Already a coach link */}
              {isAuthenticated && user?.role === "coach" && (
                <div className="mt-8 text-teal-200">
                  {l.alreadyCoach}{" "}
                  <a href="/coach/dashboard" className="text-white underline hover:no-underline">
                    {l.goToDashboard}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why Coaches Love Lingueefy */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-teal-100 text-teal-700 border-teal-200">
                {isEn ? "Benefits" : "Avantages"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.whyJoin}</h2>
              <p className="text-slate-900 dark:text-slate-100 max-w-2xl mx-auto">
                {isEn 
                  ? "Join a platform designed with coaches in mind. We handle the business side so you can focus on what you do best."
                  : "Rejoignez une plateforme conçue pour les coachs. Nous gérons le côté affaires pour que vous puissiez vous concentrer sur ce que vous faites de mieux."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {l.benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                const colors = [
                  "bg-blue-100 text-blue-600",
                  "bg-emerald-100 text-emerald-600",
                  "bg-[#E7F2F2] text-[#0F3D3E]",
                  "bg-amber-100 text-amber-600",
                  "bg-teal-100 text-teal-600",
                  "bg-[#FFF1E8] text-[#C65A1E]",
                ];
                return (
                  <Card key={i} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                    <CardContent className="pt-6">
                      <div className={`h-12 w-12 rounded-xl ${colors[i]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-slate-900 dark:text-slate-100">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 bg-white border-y">
          <div className="container">
            <p className="text-center text-sm text-slate-900 dark:text-slate-100 mb-6 uppercase tracking-wider">
              {isEn ? "Our coaches help public servants from" : "Nos coachs aident les fonctionnaires de"}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {federalOrgs.map((org, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors">
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">{org.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
                {isEn ? "Simple Process" : "Processus simple"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.howItWorks}</h2>
              <p className="text-slate-900 dark:text-slate-100 max-w-2xl mx-auto">
                {isEn 
                  ? "Getting started is easy. Follow these four simple steps to begin your coaching journey."
                  : "Commencer est facile. Suivez ces quatre étapes simples pour débuter votre parcours de coach."}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {l.steps.map((step, i) => (
                <div key={i} className="text-center relative">
                  {i < l.steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-teal-300 to-teal-200" />
                  )}
                  <div className="relative z-10 h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-teal-500/30">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-900 dark:text-slate-100 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-amber-100 text-amber-700 border-[#FFE4D6]">
                  {isEn ? "Requirements" : "Exigences"}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.requirements}</h2>
              </div>

              <div className="space-y-4">
                {l.requirementsList.map((req, i) => {
                  const Icon = req.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-lg">{req.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Calculator Preview */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
                    {isEn ? "Earning Potential" : "Potentiel de revenus"}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {isEn ? "Earn What You Deserve" : "Gagnez ce que vous méritez"}
                  </h2>
                  <p className="text-slate-900 dark:text-slate-100 mb-6">
                    {isEn 
                      ? "Our transparent commission structure rewards your hard work. The more you teach, the more you keep."
                      : "Notre structure de commission transparente récompense votre travail acharné. Plus vous enseignez, plus vous gardez."}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{isEn ? "Weekly Payouts" : "Paiements hebdomadaires"}</div>
                        <div className="text-sm text-slate-900 dark:text-slate-100">{isEn ? "Via Stripe Connect" : "Via Stripe Connect"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Target className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{isEn ? "15-26% Commission" : "15-26% de commission"}</div>
                        <div className="text-sm text-slate-900 dark:text-slate-100">{isEn ? "Volume-based tiers" : "Paliers basés sur le volume"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{isEn ? "You Set Your Rates" : "Vous fixez vos tarifs"}</div>
                        <div className="text-sm text-slate-900 dark:text-slate-100">{isEn ? "$40-$100+/hour" : "40-100$+/heure"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-8 text-white">
                  <h3 className="text-xl font-semibold mb-6">{isEn ? "Example Monthly Earnings" : "Exemple de revenus mensuels"}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-teal-200">{isEn ? "20 sessions/month" : "20 sessions/mois"}</span>
                      <span className="text-2xl font-bold">$1,200+</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-teal-200">{isEn ? "40 sessions/month" : "40 sessions/mois"}</span>
                      <span className="text-2xl font-bold">$2,600+</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-teal-200">{isEn ? "60+ sessions/month" : "60+ sessions/mois"}</span>
                      <span className="text-2xl font-bold">$4,200+</span>
                    </div>
                  </div>
                  <p className="text-xs text-teal-300 mt-4">
                    {isEn ? COACH_EARNINGS.NOTE_EN : COACH_EARNINGS.NOTE_FR}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
                {isEn ? "Success Stories" : "Témoignages"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.testimonials}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {l.coachTestimonials.map((testimonial, i) => (
                <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <img
                        loading="lazy" src={testimonial.image}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-teal-100"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-slate-900 dark:text-slate-100">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#E7F2F2] text-[#0F3D3E] border-[#0F3D3E]">
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.faq}</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {l.faqs.map((faq, i) => (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                    <p className="text-slate-900 dark:text-slate-100">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
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
              {isEn ? "Ready to Start Your Coaching Journey?" : "Prêt à commencer votre parcours de coach?"}
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              {isEn 
                ? "Join hundreds of coaches who are building successful careers on Lingueefy."
                : "Rejoignez des centaines de coachs qui construisent des carrières réussies sur Lingueefy."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {!isAuthenticated ? (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 shadow-xl gap-2 w-full sm:w-auto">
                    {l.loginToApply}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Button
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-teal-50 shadow-xl gap-2"
                  onClick={() => setShowApplication(true)}
                >
                  {l.applyNow}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-teal-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>{isEn ? "Free to join" : "Inscription gratuite"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>{isEn ? "Weekly payouts" : "Paiements hebdomadaires"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>{isEn ? "No minimum hours" : "Pas d'heures minimum"}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
