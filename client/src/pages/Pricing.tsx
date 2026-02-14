import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Check,
  Bot,
  Users,
  Star,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  HelpCircle,
  Sparkles,
  ChevronDown,
  Target,
  Award,
  TrendingUp,
  Building2,
  Quote,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { COACH_RATES } from "@shared/pricing";

export default function Pricing() {
  const { language } = useLanguage();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section');
          if (id && entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const labels = {
    en: {
      title: "Simple, Transparent Pricing",
      subtitle: "Pay only for what you need. No subscriptions, no hidden fees. Start free with AI practice, upgrade to human coaching when ready.",
      forLearners: "For Learners",
      forCoaches: "For Coaches",
      aiPractice: "SLE AI Companion",
      aiFree: "Free Forever",
      aiDescription: "Unlimited AI practice to supplement your coaching sessions",
      aiFeatures: [
        "Unlimited voice practice sessions",
        "SLE placement tests",
        "Oral exam simulations (A, B, C levels)",
        "Instant feedback and corrections",
        "24/7 availability",
      ],
      startPracticing: "Start Practicing Free",
      coachSessions: "Human Coach Sessions",
      sessionPricing: "Set by each coach",
      sessionRange: COACH_RATES.RANGE_DISPLAY,
      perHour: "per hour",
      sessionDescription: "Book directly with specialized SLE coaches",
      sessionFeatures: [
        "Trial sessions available",
        "Personalized feedback",
        "Real exam preparation",
        "Flexible scheduling",
        "Secure payments via Stripe",
      ],
      findCoach: "Find a Coach",
      coachTitle: "Become a Coach",
      coachSubtitle: "Join our network and help public servants succeed",
      coachDescription: "Set your own rates, manage your schedule, and earn while making a difference",
      commissionTitle: "Commission Structure",
      trialSessions: "Trial Sessions",
      trialCommission: "0% commission",
      trialDesc: "You keep 100% of trial session revenue",
      paidSessions: "Paid Sessions",
      verifiedSLE: "Verified SLE Coaches",
      verifiedCommission: "15% commission",
      verifiedDesc: "Preferred rate for coaches with SLE certification",
      standardCoaches: "Standard Coaches",
      standardCommission: "26% → 15%",
      standardDesc: "Commission decreases as you complete more hours",
      referralBonus: "Referral Bonus",
      referralCommission: "0-5% commission",
      referralDesc: "Bring your own learners and keep more",
      applyNow: "Apply to Become a Coach",
      faqTitle: "Frequently Asked Questions",
      faq: [
        {
          q: "How do I pay for coaching sessions?",
          a: "All payments are processed securely through Stripe. You can pay with any major credit card. Your payment information is never stored on our servers.",
        },
        {
          q: "Can I get a refund?",
          a: "Yes, you can cancel a session up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours may be subject to the coach's cancellation policy.",
        },
        {
          q: "Is SLE AI Companion really free?",
          a: "Yes! SLE AI Companion is completely free for all users. We believe everyone should have access to practice tools to prepare for their SLE exams.",
        },
        {
          q: "How do coaches set their prices?",
          a: `Coaches set their own hourly rates based on their experience, specialization, and availability. Prices typically range from ${COACH_RATES.RANGE_DISPLAY} per hour.`,
        },
        {
          q: "What payment methods do coaches receive?",
          a: "Coaches receive payments directly to their bank account via Stripe Connect. Payouts are processed weekly.",
        },
      ],
      whyChooseUs: "Why Choose Lingueefy",
      whySubtitle: "Built specifically for Canadian federal public servants preparing for SLE exams",
      valueProps: [
        {
          icon: "target",
          title: "SLE-Focused",
          description: "Every feature is designed specifically for the federal SLE exam requirements."
        },
        {
          icon: "award",
          title: "Proven Results",
          description: "94% of our learners achieve their target SLE level within 6 months."
        },
        {
          icon: "users",
          title: "Expert Coaches",
          description: "Learn from certified SLE coaches with 10+ years of federal experience."
        },
        {
          icon: "trending",
          title: "Flexible Learning",
          description: "Study at your own pace with lifetime access to all course materials."
        }
      ],
      trustedBy: "Trusted by public servants from",
      testimonials: [
        {
          quote: "The AI practice tool helped me build confidence before my real SLE exam. I went from B to C level in just 3 months!",
          author: "Marie-Claire D.",
          role: "Policy Analyst, Treasury Board",
          rating: 5
        },
        {
          quote: "My coach understood exactly what I needed for the oral exam. The personalized feedback was invaluable.",
          author: "James T.",
          role: "Program Officer, ESDC",
          rating: 5
        },
        {
          quote: "Finally, a platform that understands the federal SLE requirements. The combination of AI and human coaching is perfect.",
          author: "Sarah L.",
          role: "Senior Advisor, Health Canada",
          rating: 5
        }
      ],
      testimonialsTitle: "What Our Users Say",
      testimonialsSubtitle: "Join thousands of federal public servants who have achieved their bilingual goals",
      ctaTitle: "Ready to Achieve Your Bilingual Goals?",
      ctaSubtitle: "Start with free AI practice or book a session with an expert coach today.",
      guarantee: "30-day money-back guarantee",
      securePayments: "Secure payments",
      support: "Expert support",
    },
    fr: {
      title: "Tarification simple et transparente",
      subtitle: "Payez uniquement ce dont vous avez besoin. Pas d'abonnement, pas de frais cachés. Commencez gratuitement avec l'IA, passez au coaching humain quand vous êtes prêt.",
      forLearners: "Pour les apprenants",
      forCoaches: "Pour les coachs",
      aiPractice: "SLE AI Companion",
      aiFree: "Gratuit à vie",
      aiDescription: "Pratique IA illimitée pour compléter vos séances de coaching",
      aiFeatures: [
        "Sessions de pratique vocale illimitées",
        "Tests de placement ELS",
        "Simulations d'examens oraux (niveaux A, B, C)",
        "Rétroaction et corrections instantanées",
        "Disponibilité 24/7",
      ],
      startPracticing: "Commencer gratuitement",
      coachSessions: "Sessions avec coach humain",
      sessionPricing: "Fixé par chaque coach",
      sessionRange: "35$ - 80$",
      perHour: "par heure",
      sessionDescription: "Réservez directement avec des coachs spécialisés ELS",
      sessionFeatures: [
        "Sessions d'essai disponibles",
        "Rétroaction personnalisée",
        "Préparation aux vrais examens",
        "Horaires flexibles",
        "Paiements sécurisés via Stripe",
      ],
      findCoach: "Trouver un coach",
      coachTitle: "Devenir coach",
      coachSubtitle: "Rejoignez notre réseau et aidez les fonctionnaires à réussir",
      coachDescription: "Fixez vos propres tarifs, gérez votre emploi du temps et gagnez de l'argent tout en faisant une différence",
      commissionTitle: "Structure des commissions",
      trialSessions: "Sessions d'essai",
      trialCommission: "0% commission",
      trialDesc: "Vous gardez 100% des revenus des sessions d'essai",
      paidSessions: "Sessions payantes",
      verifiedSLE: "Coachs ELS vérifiés",
      verifiedCommission: "15% commission",
      verifiedDesc: "Tarif préférentiel pour les coachs certifiés ELS",
      standardCoaches: "Coachs standards",
      standardCommission: "26% → 15%",
      standardDesc: "La commission diminue à mesure que vous complétez plus d'heures",
      referralBonus: "Bonus de parrainage",
      referralCommission: "0-5% commission",
      referralDesc: "Amenez vos propres apprenants et gardez plus",
      applyNow: "Postuler pour devenir coach",
      faqTitle: "Questions fréquemment posées",
      faq: [
        {
          q: "Comment puis-je payer les sessions de coaching?",
          a: "Tous les paiements sont traités de manière sécurisée via Stripe. Vous pouvez payer avec n'importe quelle carte de crédit majeure. Vos informations de paiement ne sont jamais stockées sur nos serveurs.",
        },
        {
          q: "Puis-je obtenir un remboursement?",
          a: "Oui, vous pouvez annuler une session jusqu'à 24 heures avant l'heure prévue pour un remboursement complet. Les annulations dans les 24 heures peuvent être soumises à la politique d'annulation du coach.",
        },
        {
          q: "SLE AI Companion est-il vraiment gratuit?",
          a: "Oui! SLE AI Companion est entièrement gratuit pour tous les utilisateurs. Nous croyons que tout le monde devrait avoir accès à des outils de pratique pour se préparer aux examens ELS.",
        },
        {
          q: "Comment les coachs fixent-ils leurs prix?",
          a: "Les coachs fixent leurs propres tarifs horaires en fonction de leur expérience, spécialisation et disponibilité. Les prix varient généralement de 35$ à 80$ par heure.",
        },
        {
          q: "Quels modes de paiement les coachs reçoivent-ils?",
          a: "Les coachs reçoivent les paiements directement sur leur compte bancaire via Stripe Connect. Les versements sont traités chaque semaine.",
        },
      ],
      whyChooseUs: "Pourquoi choisir Lingueefy",
      whySubtitle: "Conçu spécifiquement pour les fonctionnaires fédéraux canadiens préparant les examens ELS",
      valueProps: [
        {
          icon: "target",
          title: "Axé sur l'ELS",
          description: "Chaque fonctionnalité est conçue spécifiquement pour les exigences de l'examen ELS fédéral."
        },
        {
          icon: "award",
          title: "Résultats prouvés",
          description: "94% de nos apprenants atteignent leur niveau ELS cible en 6 mois."
        },
        {
          icon: "users",
          title: "Coachs experts",
          description: "Apprenez avec des coachs ELS certifiés ayant 10+ ans d'expérience fédérale."
        },
        {
          icon: "trending",
          title: "Apprentissage flexible",
          description: "Étudiez à votre rythme avec un accès à vie à tous les matériels de cours."
        }
      ],
      trustedBy: "Approuvé par les fonctionnaires de",
      testimonials: [
        {
          quote: "L'outil de pratique IA m'a aidé à gagner confiance avant mon vrai examen ELS. Je suis passé du niveau B au niveau C en seulement 3 mois!",
          author: "Marie-Claire D.",
          role: "Analyste de politiques, Conseil du Trésor",
          rating: 5
        },
        {
          quote: "Mon coach a compris exactement ce dont j'avais besoin pour l'examen oral. La rétroaction personnalisée était inestimable.",
          author: "James T.",
          role: "Agent de programme, EDSC",
          rating: 5
        },
        {
          quote: "Enfin, une plateforme qui comprend les exigences ELS fédérales. La combinaison de l'IA et du coaching humain est parfaite.",
          author: "Sarah L.",
          role: "Conseillère principale, Santé Canada",
          rating: 5
        }
      ],
      testimonialsTitle: "Ce que disent nos utilisateurs",
      testimonialsSubtitle: "Rejoignez des milliers de fonctionnaires fédéraux qui ont atteint leurs objectifs bilingues",
      ctaTitle: "Prêt à atteindre vos objectifs bilingues?",
      ctaSubtitle: "Commencez avec la pratique IA gratuite ou réservez une session avec un coach expert aujourd'hui.",
      guarantee: "Garantie de remboursement 30 jours",
      securePayments: "Paiements sécurisés",
      support: "Support expert",
    },
  };

  const l = labels[language];

  const organizations = [
    { name: "Treasury Board", icon: Building2 },
    { name: "Health Canada", icon: Building2 },
    { name: "ESDC", icon: Building2 },
    { name: "CRA", icon: Building2 },
    { name: "IRCC", icon: Building2 },
    { name: "DND", icon: Building2 },
  ];

  const getValuePropIcon = (iconName: string) => {
    switch (iconName) {
      case "target": return Target;
      case "award": return Award;
      case "users": return Users;
      case "trending": return TrendingUp;
      default: return Sparkles;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main id="main-content" className="flex-1">
        <Breadcrumb 
          items={[
            { label: "Pricing", labelFr: "Tarifs" }
          ]} 
        />

        {/* Hero Section - Premium Dark Gradient */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C65A1E]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
          
          <div className="container relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Glass badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-white/90">
                  {language === "fr" ? "Tarification transparente" : "Transparent Pricing"}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                <span className="italic font-serif">{language === "fr" ? "Tarification" : "Simple,"}</span>{" "}
                <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {language === "fr" ? "Simple" : "Transparent"}
                </span>
                {language === "en" && <span className="text-white"> Pricing</span>}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10">
                {l.subtitle}
              </p>

              {/* Stats with glassmorphism */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                {[
                  { value: "$0", label: language === "fr" ? "Pratique IA" : "AI Practice" },
                  { value: COACH_RATES.RANGE_DISPLAY, label: language === "fr" ? "Par heure" : "Per Hour" },
                  { value: "94%", label: language === "fr" ? "Taux de réussite" : "Success Rate" },
                  { value: "24/7", label: language === "fr" ? "Disponibilité" : "Availability" },
                ].map((stat, i) => (
                  <div 
                    key={i}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-teal-400 mb-1">{stat.value}</div>
                    <div className="text-sm text-white/90 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/prof-steven-ai">
                  <Button size="lg" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/25 px-8">
                    {l.startPracticing}
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/coaches">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                    {l.findCoach}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us - Value Props */}
        <section 
          className="py-20 bg-gradient-to-b from-slate-50 to-white"
          ref={(el) => { if (el) sectionRefs.current.set('why', el); }}
          data-section="why"
        >
          <div className="container">
            <div className={`text-center mb-12 transition-all duration-700 ${
              visibleSections.has('why') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.whyChooseUs}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{l.whySubtitle}</p>
            </div>

            <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-200 ${
              visibleSections.has('why') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {l.valueProps.map((prop, i) => {
                const Icon = getValuePropIcon(prop.icon);
                return (
                  <div 
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 group"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-teal-500/25">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{prop.title}</h3>
                    <p className="text-sm text-slate-600">{prop.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Trusted By */}
            <div className={`mt-16 text-center transition-all duration-700 delay-400 ${
              visibleSections.has('why') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">{l.trustedBy}</p>
              <div className="flex flex-wrap justify-center gap-8 items-center">
                {organizations.map((org, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400 hover:text-teal-600 transition-colors">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">{org.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* For Learners - Pricing Cards */}
        <section 
          className="py-20 relative"
          aria-labelledby="learners-title"
          ref={(el) => { if (el) sectionRefs.current.set('learners', el); }}
          data-section="learners"
        >
          <div className="container">
            <h2 id="learners-title" className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {l.forLearners}
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {language === "fr" 
                ? "Choisissez l'option qui vous convient le mieux"
                : "Choose the option that works best for you"
              }
            </p>

            <div className={`grid md:grid-cols-2 gap-8 max-w-4xl mx-auto transition-all duration-700 ${
              visibleSections.has('learners') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {/* AI Practice Card */}
              <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-8 border-2 border-teal-200 hover:border-teal-400 transition-all duration-300 hover:shadow-xl group overflow-hidden">
                {/* Popular badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg px-4 py-1">
                    {l.aiFree}
                  </Badge>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/25">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{l.aiPractice}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-teal-600">$0</span>
                    <span className="text-muted-foreground ml-2">{language === "fr" ? "pour toujours" : "forever"}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{l.aiDescription}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {l.aiFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/prof-steven-ai">
                    <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg">
                      {l.startPracticing}
                      <Sparkles className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Coach Sessions Card */}
              <div className="relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl group overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D97B3D]/5 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#C65A1E] to-[#A84A15] flex items-center justify-center mb-6 shadow-lg shadow-[#C65A1E]/25">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{l.coachSessions}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-[#C65A1E] to-teal-500 bg-clip-text text-transparent">{l.sessionRange}</span>
                    <span className="text-muted-foreground ml-2">{l.perHour}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{l.sessionDescription}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {l.sessionFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-teal-600" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/coaches">
                    <Button variant="outline" className="w-full border-2 border-orange-300 text-[#C65A1E]600 hover:bg-orange-50">
                      {l.findCoach}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          className="py-20 bg-gradient-to-b from-white to-slate-50"
          ref={(el) => { if (el) sectionRefs.current.set('testimonials', el); }}
          data-section="testimonials"
        >
          <div className="container">
            <div className={`text-center mb-12 transition-all duration-700 ${
              visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 mb-4">
                <Quote className="h-4 w-4 text-[#C65A1E]600" />
                <span className="text-sm font-medium text-[#C65A1E]700">
                  {language === "fr" ? "Témoignages" : "Success Stories"}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.testimonialsTitle}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{l.testimonialsSubtitle}</p>
            </div>

            <div className={`grid md:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${
              visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {l.testimonials.map((testimonial, i) => (
                <div 
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-orange-400 text-[#C65A1E]400" />
                    ))}
                  </div>
                  
                  {/* Quote icon */}
                  <div className="text-4xl text-[#C65A1E]200 font-serif mb-2">"</div>
                  
                  <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                  
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Coaches Section */}
        <section 
          className="py-20 relative overflow-hidden"
          aria-labelledby="coaches-title"
          ref={(el) => { if (el) sectionRefs.current.set('coaches', el); }}
          data-section="coaches"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
          
          <div className="container relative z-10">
            <div className={`text-center mb-12 transition-all duration-700 ${
              visibleSections.has('coaches') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h2 id="coaches-title" className="text-3xl md:text-4xl font-bold mb-4">
                {l.coachTitle}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{l.coachSubtitle}</p>
            </div>

            <div className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${
              visibleSections.has('coaches') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-10">
                  <h3 className="text-2xl font-bold mb-2">{l.commissionTitle}</h3>
                  <p className="text-muted-foreground mb-8">{l.coachDescription}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Trial Sessions */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-lg">{l.trialSessions}</h4>
                      </div>
                      <p className="text-3xl font-bold text-emerald-600 mb-2">
                        {l.trialCommission}
                      </p>
                      <p className="text-sm text-muted-foreground">{l.trialDesc}</p>
                    </div>

                    {/* Verified SLE */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-lg">{l.verifiedSLE}</h4>
                      </div>
                      <p className="text-3xl font-bold text-teal-600 mb-2">
                        {l.verifiedCommission}
                      </p>
                      <p className="text-sm text-muted-foreground">{l.verifiedDesc}</p>
                    </div>

                    {/* Standard Coaches */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-white0 flex items-center justify-center shadow-lg shadow-gray-500/25">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-lg">{l.standardCoaches}</h4>
                      </div>
                      <p className="text-3xl font-bold mb-2">{l.standardCommission}</p>
                      <p className="text-sm text-muted-foreground">{l.standardDesc}</p>
                    </div>

                    {/* Referral Bonus */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FFF8F3] to-[#FFF0E6]/50 border border-[#FFE4D6]/50 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-[#C65A1E] flex items-center justify-center shadow-lg shadow-[#C65A1E]/25">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-lg">{l.referralBonus}</h4>
                      </div>
                      <p className="text-3xl font-bold text-[#C65A1E]600 mb-2">
                        {l.referralCommission}
                      </p>
                      <p className="text-sm text-muted-foreground">{l.referralDesc}</p>
                    </div>
                  </div>

                  <div className="mt-10 text-center">
                    <Link href="/become-a-coach">
                      <Button size="lg" className="bg-gradient-to-r from-[#C65A1E] to-[#A84A15] hover:from-[#A84A15] hover:to-[#9A3412] text-white shadow-lg shadow-[#C65A1E]/25 px-8">
                        {l.applyNow}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section 
          className="py-20"
          aria-labelledby="faq-title"
          ref={(el) => { if (el) sectionRefs.current.set('faq', el); }}
          data-section="faq"
        >
          <div className="container">
            <div className={`text-center mb-12 transition-all duration-700 ${
              visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 mb-4">
                <HelpCircle className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">FAQ</span>
              </div>
              <h2 id="faq-title" className="text-3xl md:text-4xl font-bold">
                {l.faqTitle}
              </h2>
            </div>

            <div className={`max-w-3xl mx-auto space-y-4 transition-all duration-700 ${
              visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {l.faq.map((item, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-teal-300 transition-all duration-300 cursor-pointer"
                  style={{ transitionDelay: `${i * 100}ms` }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                        <HelpCircle className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{item.q}</h3>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                            openFaq === i ? 'rotate-180' : ''
                          }`} />
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${
                          openFaq === i ? 'max-h-40 mt-4' : 'max-h-0'
                        }`}>
                          <p className="text-muted-foreground">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C65A1E]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              {/* Glass badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-white/90">
                  {language === "fr" ? "Commencez aujourd'hui" : "Start Today"}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                <span className="italic font-serif">{l.ctaTitle.split(' ')[0]}</span>{" "}
                <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {l.ctaTitle.split(' ').slice(1, -1).join(' ')}
                </span>
              </h2>
              
              <p className="text-lg text-white/70 mb-10">
                {l.ctaSubtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Link href="/prof-steven-ai">
                  <Button size="lg" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/25 px-8">
                    {l.startPracticing}
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/coaches">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                    {l.findCoach}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap justify-center gap-6 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>{l.guarantee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>{l.securePayments}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{l.support}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
