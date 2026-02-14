// Header removed - using EcosystemHeaderGold from layout instead
import Footer from "@/components/Footer"; import B2BSection from "./B2BSection"; import B2GSection from "./B2GSection";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  GraduationCap,
  ArrowRight,
  Users,
  Sparkles,
  Building2,
  Award,
  CheckCircle2,
  BarChart3,
  Target,
  Shield,
  TrendingUp,
  Star,
  Quote,
  BookOpen,
  Zap,
  Clock,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return { count, ref };
}

export default function RusingAcademyHome() {
  const { language } = useLanguage();

  const successRate = useCounter(94, 2000);
  const coaches = useCounter(50, 1500);
  const organizations = useCounter(50, 1800);
  const learners = useCounter(5000, 2500);

  const FEATURES = [
    {
      icon: Shield,
      titleEn: "Government Compliant",
      titleFr: "Conforme au gouvernement",
      descEn: "All programs meet Treasury Board requirements for SLE certification",
      descFr: "Tous les programmes respectent les exigences du Conseil du Trésor pour la certification ELS",
    },
    {
      icon: TrendingUp,
      titleEn: "Proven Results",
      titleFr: "Résultats prouvés",
      descEn: "94% success rate for BBB/CBC/CCC certifications",
      descFr: "Taux de réussite de 94% pour les certifications BBB/CBC/CCC",
    },
    {
      icon: Users,
      titleEn: "Expert Coaches",
      titleFr: "Coachs experts",
      descEn: "50+ certified coaches with government experience",
      descFr: "Plus de 50 coachs certifiés avec expérience gouvernementale",
    },
    {
      icon: BarChart3,
      titleEn: "HR Analytics",
      titleFr: "Analytique RH",
      descEn: "Track team progress with detailed dashboards and reports",
      descFr: "Suivez les progrès de l'équipe avec des tableaux de bord détaillés",
    },
  ];

  const PACKAGES = [
    {
      nameEn: "Starter",
      nameFr: "Débutant",
      price: "$2,500",
      periodEn: "/month",
      periodFr: "/mois",
      featuresEn: [
        "Up to 10 learners",
        "SLE Level A preparation",
        "Basic progress reports",
        "Email support",
      ],
      featuresFr: [
        "Jusqu'à 10 apprenants",
        "Préparation niveau A ELS",
        "Rapports de base",
        "Support par courriel",
      ],
      popular: false,
    },
    {
      nameEn: "Professional",
      nameFr: "Professionnel",
      price: "$5,000",
      periodEn: "/month",
      periodFr: "/mois",
      featuresEn: [
        "Up to 50 learners",
        "SLE Levels A, B, C",
        "HR Dashboard access",
        "Dedicated account manager",
        "Prof Steven AI included",
      ],
      featuresFr: [
        "Jusqu'à 50 apprenants",
        "Niveaux A, B, C ELS",
        "Accès tableau de bord RH",
        "Gestionnaire de compte dédié",
        "Prof Steven IA inclus",
      ],
      popular: true,
    },
    {
      nameEn: "Enterprise",
      nameFr: "Entreprise",
      price: language === "en" ? "Custom" : "Sur mesure",
      periodEn: "",
      periodFr: "",
      featuresEn: [
        "Unlimited learners",
        "Custom curriculum",
        "On-site training options",
        "API integration",
        "24/7 priority support",
      ],
      featuresFr: [
        "Apprenants illimités",
        "Programme personnalisé",
        "Formation sur site",
        "Intégration API",
        "Support prioritaire 24/7",
      ],
      popular: false,
    },
  ];

  const TESTIMONIALS = [
    {
      quoteEn: "RusingAcademy transformed our approach to bilingual training. Our team achieved their SLE targets 40% faster than expected.",
      quoteFr: "RusingAcademy a transformé notre approche de la formation bilingue. Notre équipe a atteint ses objectifs ELS 40% plus rapidement que prévu.",
      authorEn: "Director of HR",
      authorFr: "Directeur des RH",
      orgEn: "Federal Department",
      orgFr: "Ministère fédéral",
    },
    {
      quoteEn: "The coaching marketplace gave our employees personalized support that made all the difference in their language journey.",
      quoteFr: "Le marché de coaching a offert à nos employés un soutien personnalisé qui a fait toute la différence dans leur parcours linguistique.",
      authorEn: "Training Manager",
      authorFr: "Gestionnaire de formation",
      orgEn: "Crown Corporation",
      orgFr: "Société d'État",
    },
    {
      quoteEn: "Finally, a solution that understands government compliance requirements while delivering modern, engaging learning experiences.",
      quoteFr: "Enfin, une solution qui comprend les exigences de conformité gouvernementale tout en offrant des expériences d'apprentissage modernes et engageantes.",
      authorEn: "Chief Learning Officer",
      authorFr: "Directeur de l'apprentissage",
      orgEn: "Provincial Agency",
      orgFr: "Agence provinciale",
    },
  ];

  const PATH_SERIES = [
    { path: "Path I", level: "A1→A2", duration: "4 weeks", color: "#E07B39" },
    { path: "Path II", level: "A2→B1", duration: "4 weeks", color: "#E07B39" },
    { path: "Path III", level: "B1→B1+", duration: "4 weeks", color: "#E07B39" },
    { path: "Path IV", level: "B1+→B2", duration: "4 weeks", color: "#D4AF37" },
    { path: "Path V", level: "B2→C1", duration: "4 weeks", color: "#D4AF37" },
    { path: "Path VI", level: "SLE Prep", duration: "4 weeks", color: "#2DD4BF" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F3] via-white to-[#FDFBF7]">
      {/* Header removed - using EcosystemHeaderGold from layout */}
      
      <main id="main-content">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-4 relative overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#E07B39]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-[#E07B39]/10 border border-[#E07B39]/20 text-gray-800">
                  <Sparkles className="w-4 h-4 text-[#E07B39]" />
                  {language === "en" ? "B2B/B2G Training Excellence" : "Excellence en formation B2B/B2G"}
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900"
              >
                {language === "en" ? "Build a Bilingual Workforce" : "Bâtissez une main-d'œuvre bilingue"}{" "}
                <span className="text-[#E07B39]">
                  {language === "en" ? "At Scale" : "À grande échelle"}
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                {language === "en"
                  ? "Structured bilingual training programs for government and enterprise. SLE preparation, corporate language solutions, and measurable results."
                  : "Programmes de formation bilingue structurés pour le gouvernement et les entreprises. Préparation ELS, solutions linguistiques corporatives et résultats mesurables."
                }
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
                <Link href="/rusingacademy/contact">
                  <Button size="lg" className="bg-[#E07B39] hover:bg-[#C45E1A] text-white gap-2 px-8 h-12 text-base shadow-lg shadow-[#E07B39]/20 rounded-full">
                    {language === "en" ? "Request a Proposal" : "Demander une proposition"}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/rusingacademy/programs">
                  <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base border-2 rounded-full">
                    {language === "en" ? "View Programs" : "Voir les programmes"}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 border-y border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div ref={successRate.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E07B39] mb-1">{successRate.count}%</div>
                <div className="text-sm text-gray-600">{language === "en" ? "Success Rate" : "Taux de réussite"}</div>
              </div>
              <div ref={coaches.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E07B39] mb-1">{coaches.count}+</div>
                <div className="text-sm text-gray-600">{language === "en" ? "Expert Coaches" : "Coachs experts"}</div>
              </div>
              <div ref={organizations.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E07B39] mb-1">{organizations.count}+</div>
                <div className="text-sm text-gray-600">{language === "en" ? "Organizations" : "Organisations"}</div>
              </div>
              <div ref={learners.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E07B39] mb-1">{learners.count}+</div>
                <div className="text-sm text-gray-600">{language === "en" ? "Learners Trained" : "Apprenants formés"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Path Series Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {language === "en" ? "GC Bilingual Mastery Series" : "Série Maîtrise Bilingue GC"}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {language === "en"
                  ? "Six structured paths from beginner to SLE mastery, each 4 weeks of intensive training"
                  : "Six parcours structurés du débutant à la maîtrise ELS, chacun de 4 semaines de formation intensive"
                }
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {PATH_SERIES.map((path, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg text-center group hover:shadow-xl transition-all"
                >
                  <div 
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: path.color }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{path.path}</h3>
                  <p className="text-sm text-[#E07B39] font-medium mb-1">{path.level}</p>
                  <p className="text-xs text-gray-500">{path.duration}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-gradient-to-r from-[#E07B39] to-[#2DD4BF] text-white">
                <span className="font-semibold">70% {language === "en" ? "Platform" : "Plateforme"}</span>
                <span className="w-px h-6 bg-white/30" />
                <span className="font-semibold">30% {language === "en" ? "Live Coaching" : "Coaching en direct"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-[#FDFBF7]">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Why Choose RusingAcademy?" : "Pourquoi choisir RusingAcademy?"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E07B39]/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-[#E07B39]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {language === "en" ? feature.titleEn : feature.titleFr}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === "en" ? feature.descEn : feature.descFr}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Flexible Packages" : "Forfaits flexibles"}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {language === "en"
                  ? "Choose the plan that fits your organization's needs"
                  : "Choisissez le plan qui correspond aux besoins de votre organisation"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PACKAGES.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border-2 ${
                    pkg.popular 
                      ? "border-[#E07B39] bg-gradient-to-br from-[#FFF8F3] to-white shadow-xl" 
                      : "border-gray-200 bg-white/80"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 text-xs font-bold rounded-full bg-[#E07B39] text-white">
                        {language === "en" ? "POPULAR" : "POPULAIRE"}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === "en" ? pkg.nameEn : pkg.nameFr}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                    <span className="text-gray-500">{language === "en" ? pkg.periodEn : pkg.periodFr}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {(language === "en" ? pkg.featuresEn : pkg.featuresFr).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#E07B39] flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/rusingacademy/contact">
                    <Button 
                      className={`w-full rounded-full ${
                        pkg.popular 
                          ? "bg-[#E07B39] hover:bg-[#C45E1A] text-white" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                    >
                      {language === "en" ? "Get Started" : "Commencer"}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {language === "en" ? "Trusted by Government Leaders" : "Approuvé par les leaders gouvernementaux"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <Quote className="w-8 h-8 text-[#E07B39] mb-4" />
                  <p className="text-white/90 mb-4 italic">
                    "{language === "en" ? testimonial.quoteEn : testimonial.quoteFr}"
                  </p>
                  <div>
                    <p className="font-semibold text-white">
                      {language === "en" ? testimonial.authorEn : testimonial.authorFr}
                    </p>
                    <p className="text-sm text-white/60">
                      {language === "en" ? testimonial.orgEn : testimonial.orgFr}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-[#E07B39] to-[#C45E1A]">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {language === "en" ? "Ready to Transform Your Team?" : "Prêt à transformer votre équipe?"}
              </h2>
              <p className="text-xl text-white/90 mb-10">
                {language === "en"
                  ? "Get a customized proposal for your organization's bilingual training needs"
                  : "Obtenez une proposition personnalisée pour les besoins de formation bilingue de votre organisation"
                }
              </p>
              <Link href="/rusingacademy/contact">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 h-14 text-lg font-semibold bg-white text-[#E07B39] hover:bg-orange-50"
                >
                  {language === "en" ? "Request a Proposal" : "Demander une proposition"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* B2B Section */}
        <B2BSection />

        {/* B2G Section */}
        <B2GSection />

      </main>

      <Footer />
    </div>
  );
}
