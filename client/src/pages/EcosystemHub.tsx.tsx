import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  GraduationCap,
  MessageSquare,
  Clapperboard,
  Users,
  Building2,
  Sparkles,
  Globe,
  Award,
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Heart,
  Clock,
  Brain,
  AlertTriangle,
  Lightbulb,
  UserCheck,
  Briefcase,
  MapPin,
  Trophy,
  Play,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Search,
  ClipboardCheck,
  Dumbbell,
  BadgeCheck,
  BookOpen,
  Headphones,
  Bot,
  Star,
  Calendar,
  FileText,
  Filter,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// ============================================================================
// SECTION 0: HERO + CTA
// ============================================================================
function HeroSection({ language }: { language: string }) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-8">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
              <Globe className="w-4 h-4 text-amber-400" />
              {language === "en" ? "Canada's Premier Bilingual Training Ecosystem" : "L'écosystème de formation bilingue de référence au Canada"}
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white"
          >
            {language === "en" ? (
              <>
                Is your career stuck?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                  Bilingualism is one of the essential keys to moving forward.
                </span>
              </>
            ) : (
              <>
                Votre carrière est bloquée ?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                  Le bilinguisme est l'une des clés indispensables pour avancer.
                </span>
              </>
            )}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {language === "en"
              ? "A methodology designed for Canadian public servants to pass second language exams and perform effectively in the workplace."
              : "Une méthodologie conçue pour les fonctionnaires du Canada afin de réussir les examens de langue seconde et performer réellement en milieu de travail."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2 px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30"
              >
                {language === "en" ? "Get my strategic action plan" : "Obtenir mon plan d'action stratégique"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sle-diagnostic">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 gap-2 px-8 h-14 text-base font-semibold rounded-full backdrop-blur-sm"
              >
                {language === "en" ? "Take the free placement test" : "Passer le test de placement gratuit"}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 1: TRILEMME DE L'EXCELLENCE BILINGUE
// ============================================================================
function TrilemmeSection({ language }: { language: string }) {
  const obstacles = [
    {
      icon: AlertTriangle,
      titleEn: "The Fluency Wall",
      titleFr: "Le mur de la fluidité",
      descEn: "You understand everything, but you freeze when speaking.",
      descFr: "Vous comprenez tout, mais vous bloquez à l'oral.",
      color: "from-red-500 to-rose-600",
    },
    {
      icon: Brain,
      titleEn: "Impostor Syndrome",
      titleFr: "Le syndrome de l'imposteur",
      descEn: "The fear of being 'exposed', even after years of learning.",
      descFr: "La peur d'être « démasqué », même après des années d'apprentissage.",
      color: "from-purple-500 to-violet-600",
    },
    {
      icon: TrendingUp,
      titleEn: "The Stagnation Plateau",
      titleFr: "Le plateau de stagnation",
      descEn: "Stuck at level B without being able to reach level C.",
      descFr: "Être bloqué au niveau B sans réussir à franchir le niveau C.",
      color: "from-blue-500 to-indigo-600",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Understanding why most professionals struggle with second language exams is the first step toward breaking through. These three structural barriers affect thousands of public servants every year."
              : "Comprendre pourquoi la plupart des professionnels échouent aux examens de langue seconde est la première étape pour les surmonter. Ces trois obstacles structurels affectent des milliers de fonctionnaires chaque année."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "The Cost of Inaction" : "Le coût de l'inaction"}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {language === "en"
              ? "What you lose every day without your Level C"
              : "Ce que vous perdez chaque jour sans votre niveau C"}
          </p>
        </motion.div>

        {/* Trilemme Title */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800">
            {language === "en" ? "The Bilingual Excellence Trilemma" : "Le Trilemme de l'Excellence Bilingue"}
          </h3>
        </motion.div>

        {/* Obstacles Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {obstacles.map((obstacle, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${obstacle.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <obstacle.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                {language === "en" ? obstacle.titleEn : obstacle.titleFr}
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {language === "en" ? obstacle.descEn : obstacle.descFr}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Promise */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg text-slate-700 leading-relaxed">
                  {language === "en" ? (
                    <>
                      <strong className="text-slate-900">RusingÂcademy</strong> was created to break through these three walls, using a structured methodology that accelerates learning{" "}
                      <strong className="text-amber-600">3 to 4 times faster</strong> than traditional approaches.
                    </>
                  ) : (
                    <>
                      <strong className="text-slate-900">RusingÂcademy</strong> a été créée pour briser ces trois murs, grâce à une méthodologie structurée qui accélère l'apprentissage{" "}
                      <strong className="text-amber-600">3 à 4 fois plus vite</strong> que les approches traditionnelles.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 2: ÉCOSYSTÈME (3 PILIERS)
// ============================================================================
function EcosystemSection({ language }: { language: string }) {
  const pillars = [
    {
      id: "academy",
      nameEn: "Your Academy",
      nameFr: "Votre Académie",
      brandEn: "RusingÂcademy",
      brandFr: "RusingÂcademy",
      descEn: "Structured courses and professional pathways aligned with federal requirements (BBB, CBC, CCC).",
      descFr: "Parcours structurés et cours professionnels alignés sur les exigences fédérales (BBB, CBC, CCC).",
      icon: GraduationCap,
      color: "#E07B39",
      gradient: "from-orange-500 to-orange-600",
      image: "https://rusingacademy-cdn.b-cdn.net/images/ecosystem-rusingacademy.jpg",
      link: "/rusingacademy",
    },
    {
      id: "coaches",
      nameEn: "Your Coaches",
      nameFr: "Vos Coaches",
      brandEn: "Lingueefy",
      brandFr: "Lingueefy",
      descEn: "Hybrid coaching platform (human + AI) to practice speaking in real-time with immediate feedback.",
      descFr: "Plateforme de coaching hybride (humain + IA) pour pratiquer l'oral en temps réel avec feedback immédiat.",
      icon: MessageSquare,
      color: "#009688",
      gradient: "from-teal-500 to-teal-600",
      image: "https://rusingacademy-cdn.b-cdn.net/images/ecosystem-lingueefy.jpg",
      link: "/",
    },
    {
      id: "studio",
      nameEn: "Your EdTech Studio",
      nameFr: "Votre Studio EdTech",
      brandEn: "Barholex Media",
      brandFr: "Barholex Media",
      descEn: "Cutting-edge educational content production and custom solutions for ministries and organizations.",
      descFr: "Production de contenu pédagogique de pointe et solutions sur mesure pour les ministères et organisations.",
      icon: Clapperboard,
      color: "#D4AF37",
      gradient: "from-amber-500 to-amber-600",
      image: "https://rusingacademy-cdn.b-cdn.net/images/ecosystem-barholex.jpg",
      link: "/barholex",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Unlike fragmented solutions, our ecosystem provides a complete, integrated approach. Each pillar serves a specific purpose while working together to ensure your success."
              : "Contrairement aux solutions fragmentées, notre écosystème offre une approche complète et intégrée. Chaque pilier remplit un rôle spécifique tout en travaillant ensemble pour assurer votre réussite."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "A Complete Ecosystem for Your Success" : "Un écosystème complet pour votre réussite"}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {language === "en"
              ? "We combine human expertise, advanced pedagogy, and technology through three complementary pillars"
              : "Nous combinons expertise humaine, pédagogie avancée et technologie à travers trois piliers complémentaires"}
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.id}
              variants={scaleIn}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  loading="lazy" src={pillar.image}
                  alt={language === "en" ? pillar.nameEn : pillar.nameFr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${pillar.gradient} opacity-60`} />
                <div className="absolute bottom-4 left-4">
                  <pillar.icon className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {language === "en" ? pillar.nameEn : pillar.nameFr}
                </p>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {language === "en" ? pillar.brandEn : pillar.brandFr}
                </h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {language === "en" ? pillar.descEn : pillar.descFr}
                </p>
                <Link href={pillar.link}>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300"
                  >
                    {language === "en" ? "Learn more" : "En savoir plus"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 3: MÉTHODOLOGIE — Méthode en 3 étapes
// ============================================================================
function MethodologySection({ language }: { language: string }) {
  const steps = [
    {
      number: "01",
      icon: Search,
      titleEn: "Diagnose",
      titleFr: "Diagnostiquer",
      descEn: "A strategic assessment that goes far beyond a simple placement test.",
      descFr: "Une évaluation stratégique qui va bien au-delà d'un simple test de placement.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      number: "02",
      icon: Dumbbell,
      titleEn: "Train",
      titleFr: "S'entraîner",
      descEn: "A personalized plan based on your target level, deadlines, and professional constraints.",
      descFr: "Un plan personnalisé selon votre niveau cible, vos échéances et vos contraintes professionnelles.",
      color: "from-teal-500 to-emerald-600",
    },
    {
      number: "03",
      icon: BadgeCheck,
      titleEn: "Validate",
      titleFr: "Valider",
      descEn: "Approach your language proficiency exams with clarity, structure, and confidence.",
      descFr: "Abordez vos examens de compétence linguistique avec clarté, structure et confiance.",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Our proven three-step methodology has helped hundreds of public servants achieve their language goals. Each step builds on the previous one to create a clear path to success."
              : "Notre méthodologie éprouvée en trois étapes a aidé des centaines de fonctionnaires à atteindre leurs objectifs linguistiques. Chaque étape s'appuie sur la précédente pour créer un chemin clair vers le succès."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "Our 3-Step Method" : "Notre méthode en 3 étapes"}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {language === "en" ? "Simple. Targeted. Results-oriented." : "Simple. Ciblée. Orientée résultats."}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-slate-300 to-transparent" />
              )}

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 text-center">
                {/* Step Number */}
                <div className="text-5xl font-bold text-slate-100 mb-4">{step.number}</div>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {language === "en" ? step.titleEn : step.titleFr}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {language === "en" ? step.descEn : step.descFr}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 4: OFFRES — The RusingÂcademy Solution
// ============================================================================
function OffersSection({ language }: { language: string }) {
  const offers = [
    {
      id: "crash-courses",
      titleEn: "Crash Courses – Path Series",
      titleFr: "Crash Courses – Path Series",
      subtitleEn: "6 structured pathways",
      subtitleFr: "6 parcours structurés",
      descEn: "A curriculum designed for the reality of public servants: less wasted effort, more strategic efficiency. Achieve your goals 3 to 4 times faster, without sacrificing quality or excellence.",
      descFr: "Un curriculum conçu pour la réalité des fonctionnaires : moins d'effort inutile, plus d'efficience stratégique. Atteignez vos objectifs 3 à 4 fois plus vite, sans sacrifier la qualité ni l'excellence.",
      image: "https://rusingacademy-cdn.b-cdn.net/images/offers-class.jpg",
      ctaEn: "Discover Crash Courses",
      ctaFr: "Découvrir les Crash Courses",
      link: "/courses",
      icon: BookOpen,
    },
    {
      id: "coaching",
      titleEn: "Strategic Coaching",
      titleFr: "Coaching stratégique",
      subtitleEn: "Essential for Level C",
      subtitleFr: "Indispensable pour le niveau C",
      descEn: "The teacher transmits knowledge. The coach transforms performance. Coaching helps overcome psychological blocks, personalize the curriculum, and secure performance on exam day.",
      descFr: "L'enseignant transmet le savoir. Le coach transforme la performance. Le coaching permet de dépasser les blocages psychologiques, personnaliser le curriculum, et sécuriser la performance le jour de l'examen.",
      image: "https://rusingacademy-cdn.b-cdn.net/images/offers-coaching.jpg",
      ctaEn: "Contact our coaches",
      ctaFr: "Contacter nos coachs",
      link: "/coaches",
      icon: Headphones,
    },
    {
      id: "innovation",
      titleEn: "Mastered Innovation",
      titleFr: "Innovation maîtrisée",
      subtitleEn: "Human + AI",
      subtitleFr: "Humain + IA",
      descEn: "We adopt a hybrid approach: the best of human expertise, amplified by AI and cutting-edge tools, to make learning more effective, engaging, and lasting.",
      descFr: "Nous adoptons une approche hybride : le meilleur de l'humain, amplifié par l'IA et des outils de pointe, pour rendre l'apprentissage plus efficace, plus engageant et plus durable.",
      image: "https://rusingacademy-cdn.b-cdn.net/images/offers-innovation.jpg",
      ctaEn: "Learn more",
      ctaFr: "En savoir plus",
      link: "/about",
      icon: Bot,
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Our solutions are designed specifically for Canadian public servants. Whether you need structured courses, personalized coaching, or innovative learning tools, we have the right solution for you."
              : "Nos solutions sont conçues spécifiquement pour les fonctionnaires canadiens. Que vous ayez besoin de cours structurés, de coaching personnalisé ou d'outils d'apprentissage innovants, nous avons la solution adaptée pour vous."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "The RusingÂcademy Solution" : "La solution RusingÂcademy"}
          </h2>
        </motion.div>

        {/* Offers Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              variants={scaleIn}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  loading="lazy" src={offer.image}
                  alt={language === "en" ? offer.titleEn : offer.titleFr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                    <offer.icon className="w-4 h-4" />
                    {language === "en" ? offer.subtitleEn : offer.subtitleFr}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {language === "en" ? offer.titleEn : offer.titleFr}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                  {language === "en" ? offer.descEn : offer.descFr}
                </p>
                <Link href={offer.link}>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    {language === "en" ? offer.ctaEn : offer.ctaFr}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 5: CIBLES — Who benefits most
// ============================================================================
function TargetAudienceSection({ language }: { language: string }) {
  const profiles = [
    {
      icon: Clock,
      titleEn: "Deadline-driven professionals",
      titleFr: "Professionnels avec échéances",
      descEn: "Facing an upcoming SLE exam with limited time to prepare.",
      descFr: "Face à un examen ELS imminent avec peu de temps pour se préparer.",
    },
    {
      icon: TrendingUp,
      titleEn: "Career advancement seekers",
      titleFr: "Chercheurs d'avancement",
      descEn: "Ready to unlock bilingual positions and promotions.",
      descFr: "Prêts à débloquer des postes bilingues et des promotions.",
    },
    {
      icon: Target,
      titleEn: "Previous exam candidates",
      titleFr: "Anciens candidats aux examens",
      descEn: "SLE/ELP retakers looking for a proven approach.",
      descFr: "Repreneurs ELS/ELP cherchant une approche éprouvée.",
    },
    {
      icon: Briefcase,
      titleEn: "Mid-career professionals",
      titleFr: "Professionnels mi-carrière",
      descEn: "5-15 years of experience, ready for the next level.",
      descFr: "5-15 ans d'expérience, prêts pour le niveau suivant.",
    },
    {
      icon: MapPin,
      titleEn: "Remote & regional employees",
      titleFr: "Employés régionaux et à distance",
      descEn: "Needing flexible, online training solutions.",
      descFr: "Ayant besoin de solutions de formation flexibles et en ligne.",
    },
    {
      icon: Trophy,
      titleEn: "High achievers targeting Level C",
      titleFr: "Performants visant le niveau C",
      descEn: "Ambitious professionals aiming for executive positions.",
      descFr: "Professionnels ambitieux visant des postes de direction.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Our programs are specifically designed for Canadian public servants at various stages of their career. If you recognize yourself in one of these profiles, we can help you achieve your language goals."
              : "Nos programmes sont spécifiquement conçus pour les fonctionnaires canadiens à différentes étapes de leur carrière. Si vous vous reconnaissez dans l'un de ces profils, nous pouvons vous aider à atteindre vos objectifs linguistiques."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Who benefits most from this program?
          </h2>
        </motion.div>

        {/* Profiles Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {profiles.map((profile, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <profile.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {language === "en" ? profile.titleEn : profile.titleFr}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {language === "en" ? profile.descEn : profile.descFr}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center"
        >
          <Link href="/sle-diagnostic">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2 px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-amber-500/25"
            >
              Book your free assessment
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 6: TÉMOIGNAGES
// ============================================================================
function TestimonialsSection({ language }: { language: string }) {
  const testimonials = [
    {
      name: "Mithula Naik",
      role: "Director of Growth and Client Experience",
      org: "Canadian Digital Service",
      image: "https://rusingacademy-cdn.b-cdn.net/images/testimonial-mithula.jpg",
      linkedin: "https://www.linkedin.com/in/mithulanaik/",
      quoteEn: "If you're looking to learn from someone who can help you reach your full potential in French, Steven is that person. [...] Je parle beaucoup mieux le français grâce aux conseils de Steven, et n'importe qui aurait de la chance d'apprendre avec lui.",
      quoteFr: "Si vous cherchez quelqu'un qui peut vous aider à atteindre votre plein potentiel en français, Steven est cette personne. [...] Je parle beaucoup mieux le français grâce aux conseils de Steven, et n'importe qui aurait de la chance d'apprendre avec lui.",
    },
    {
      name: "Jena Cameron",
      role: "Manager, Canada Small Business Financing Program",
      org: "Innovation, Science and Economic Development Canada",
      image: "https://rusingacademy-cdn.b-cdn.net/images/testimonial-jena.jpg",
      linkedin: "https://www.linkedin.com/in/jena-cameron-b0626470/",
      quoteEn: "Among the dozens of language teachers I have had over the years, I would rank Steven among the best. He is personable and engaging, organized and encouraging. Critically, he helped me target gaps in my knowledge and provided a clear path and study resources to help me achieve my goals.",
      quoteFr: "Parmi les dizaines de professeurs de langue que j'ai eus au fil des ans, je classerais Steven parmi les meilleurs. Il est sympathique et engageant, organisé et encourageant. Il m'a aidé à cibler les lacunes dans mes connaissances et m'a fourni un chemin clair et des ressources d'étude pour atteindre mes objectifs.",
    },
    {
      name: "Edith Bramwell",
      role: "Chairperson",
      org: "Federal Public Sector Labour Relations and Employment Board",
      image: "https://rusingacademy-cdn.b-cdn.net/images/testimonial-edith.jpg",
      linkedin: "https://www.linkedin.com/in/edith-bramwell-980746147/",
      quoteEn: "Excellent French as a second language instruction. A patient, thoughtful and personalized approach that leads to lasting improvement and more confidence. Highly recommended.",
      quoteFr: "Excellente instruction du français langue seconde. Une approche patiente, réfléchie et personnalisée qui mène à une amélioration durable et plus de confiance. Hautement recommandé.",
    },
    {
      name: "Scott Cantin",
      role: "Executive Director, Public Service Pride Network",
      org: "Government of Canada",
      image: null, // Placeholder
      linkedin: "https://www.linkedin.com/in/2099hcj80j/",
      quoteEn: "I had a consultation with Steven in advance of a second language exam, required by my work. Steven is an excellent coach, advisor and gave me actionable feedback both in the session and in a follow up report. [...] I highly recommend him for your language learning needs.",
      quoteFr: "J'ai eu une consultation avec Steven avant un examen de langue seconde requis par mon travail. Steven est un excellent coach, conseiller et m'a donné des commentaires exploitables pendant la session et dans un rapport de suivi. [...] Je le recommande vivement pour vos besoins d'apprentissage linguistique.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Don't just take our word for it. Hear from public servants who have transformed their careers through our programs. These testimonials represent real results from real professionals."
              : "Ne nous croyez pas sur parole. Écoutez les fonctionnaires qui ont transformé leur carrière grâce à nos programmes. Ces témoignages représentent des résultats réels de vrais professionnels."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trusted by public servants
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-lg border border-slate-100"
            >
              {/* Quote */}
              <div className="mb-6">
                <div className="text-4xl text-amber-500 mb-4">"</div>
                <p className="text-slate-700 leading-relaxed italic">
                  {language === "en" ? testimonial.quoteEn : testimonial.quoteFr}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                {testimonial.image ? (
                  <img
                    loading="lazy" src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <p className="text-sm text-slate-500">{testimonial.org}</p>
                </div>
                <a
                  href={testimonial.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center hover:bg-[#006097] transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 7: LEADERSHIP — Who is Steven Barholere
// ============================================================================
function LeadershipSection({ language }: { language: string }) {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Behind every great institution is a visionary leader. Learn about the founder who created this ecosystem to address a real gap in professional language training."
              : "Derrière chaque grande institution se trouve un leader visionnaire. Découvrez le fondateur qui a créé cet écosystème pour combler un véritable manque dans la formation linguistique professionnelle."}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <motion.div variants={scaleIn} className="relative h-80 md:h-auto">
                <img
                  loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/leadership-steven.jpg"
                  alt="Steven Barholere"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent md:bg-gradient-to-r" />
              </motion.div>

              {/* Content */}
              <motion.div variants={fadeInUp} className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Who is Steven Barholere?
                </h2>

                {/* Quote */}
                <blockquote className="border-l-4 border-amber-500 pl-4 mb-8">
                  <p className="text-lg text-slate-700 italic">
                    "Language is not merely a technical skill; it is a strategic enabler of connection, leadership, and opportunity."
                  </p>
                </blockquote>

                {/* Bio */}
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>
                    {language === "en"
                      ? "Throughout his career in both the private sector and Canada's federal public service, Steven Barholere observed a recurring challenge: highly capable professionals often struggle to translate years of language study into real, confident, and functional bilingual performance in the workplace."
                      : "Tout au long de sa carrière dans le secteur privé et la fonction publique fédérale du Canada, Steven Barholere a observé un défi récurrent : des professionnels hautement compétents peinent souvent à traduire des années d'études linguistiques en une performance bilingue réelle, confiante et fonctionnelle au travail."}
                  </p>
                  <p>
                    {language === "en"
                      ? "Confronted with this gap between learning and performance, Steven set out to rethink how second-language skills are developed, supported, and assessed for adult professionals."
                      : "Confronté à cet écart entre l'apprentissage et la performance, Steven a entrepris de repenser la façon dont les compétences en langue seconde sont développées, soutenues et évaluées pour les professionnels adultes."}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 8: INSTITUTIONS + NOTE LÉGALE
// ============================================================================
function InstitutionsSection({ language }: { language: string }) {
  const institutions = [
    { name: "Canadian Digital Service", logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/cds.png" },
    { name: "National Defence", logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/dnd.png" },
    { name: "Correctional Service Canada", logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/csc.png" },
    { name: "ISED", logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/ised.png" },
    { name: "ESDC", logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/esdc.png" },
    { name: "Treasury Board", logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/tbs.png" },
  ];

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            {language === "en" ? "They trust us" : "Ils nous font confiance"}
          </h2>
        </motion.div>

        {/* Logos Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-8"
        >
          {institutions.map((inst, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <div className="h-12 md:h-16 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-slate-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Legal Note */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center"
        >
          <p className="text-sm text-slate-500 italic max-w-2xl mx-auto">
            {language === "en"
              ? "Official logos of Canadian federal institutions. RusingÂcademy is a private entrepreneurial initiative."
              : "Logos officiels des institutions fédérales canadiennes. RusingÂcademy est une initiative entrepreneuriale privée."}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 9: VALEUR — Why Choose RusingÂcademy
// ============================================================================
function ValueSection({ language }: { language: string }) {
  const values = [
    {
      icon: Target,
      titleEn: "Public Service Specialist",
      titleFr: "Spécialiste de la fonction publique",
      descEn: "100% tailored to the specific needs of federal employees.",
      descFr: "100% adapté aux besoins spécifiques des employés fédéraux.",
    },
    {
      icon: Trophy,
      titleEn: "95% Success Rate",
      titleFr: "Taux de réussite de 95%",
      descEn: "Proven method with guaranteed support until you succeed.",
      descFr: "Méthode éprouvée avec soutien garanti jusqu'à votre réussite.",
    },
    {
      icon: Zap,
      titleEn: "Accelerated Progress",
      titleFr: "Progrès accéléré",
      descEn: "Intensive programs delivering results in 4-24 weeks.",
      descFr: "Programmes intensifs offrant des résultats en 4-24 semaines.",
    },
    {
      icon: UserCheck,
      titleEn: "Personalized Coaching",
      titleFr: "Coaching personnalisé",
      descEn: "One-on-one guidance tailored to your role and career goals.",
      descFr: "Accompagnement individuel adapté à votre rôle et vos objectifs de carrière.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "What sets us apart from traditional language schools? Our exclusive focus on the Canadian public service, combined with a proven methodology and personalized approach."
              : "Qu'est-ce qui nous distingue des écoles de langues traditionnelles ? Notre concentration exclusive sur la fonction publique canadienne, combinée à une méthodologie éprouvée et une approche personnalisée."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why Choose RusingÂcademy?
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/offers-class.jpg"
              alt="Steven teaching"
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          </motion.div>

          {/* Values Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {language === "en" ? value.titleEn : value.titleFr}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {language === "en" ? value.descEn : value.descFr}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 10: ÉQUIPE — Meet our experts
// ============================================================================
function TeamSection({ language }: { language: string }) {
  const team = [
    {
      name: "Steven Barholere",
      role: "Visionary Founder & CEO",
      image: "https://rusingacademy-cdn.b-cdn.net/images/team-steven.jpg",
      bioEn: "With over 15 years in adult training, Steven is a Government of Canada–certified specialist in bilingual education. He creates innovative learning solutions that help public servants succeed in official language evaluations.",
      bioFr: "Avec plus de 15 ans dans la formation des adultes, Steven est un spécialiste certifié par le gouvernement du Canada en éducation bilingue. Il crée des solutions d'apprentissage innovantes qui aident les fonctionnaires à réussir les évaluations de langues officielles.",
    },
    {
      name: "Sue-Anne Richer",
      role: "Chief Learning Officer - RusingÂcademy",
      image: "https://rusingacademy-cdn.b-cdn.net/images/team-sueanne.jpg",
      bioEn: "Sue-Anne is an expert in designing educational programs tailored to government language evaluations. She guides professionals in mastering French through clear learning pathways and exam preparation.",
      bioFr: "Sue-Anne est experte dans la conception de programmes éducatifs adaptés aux évaluations linguistiques gouvernementales. Elle guide les professionnels dans la maîtrise du français à travers des parcours d'apprentissage clairs et la préparation aux examens.",
    },
    {
      name: "Preciosa Baganha",
      role: "Chief People Officer - Lingueefy",
      image: "https://rusingacademy-cdn.b-cdn.net/images/team-preciosa.jpg",
      bioEn: "Preciosa specializes in bilingual talent development and career growth within the public sector. She matches learners with the right coaches and ensures a high-quality learning journey.",
      bioFr: "Preciosa se spécialise dans le développement des talents bilingues et la croissance de carrière dans le secteur public. Elle jumelle les apprenants avec les bons coachs et assure un parcours d'apprentissage de haute qualité.",
    },
    {
      name: "Erika Seguin",
      role: "Chief Bilingualism Campaigner - Barholex Media",
      image: "https://rusingacademy-cdn.b-cdn.net/images/team-erika.jpg",
      bioEn: "Erika is a performance coach with a background in public service, education, psychology, and acting. She helps professionals overcome anxiety and perform with confidence in high-stakes settings.",
      bioFr: "Erika est coach de performance avec une expérience dans la fonction publique, l'éducation, la psychologie et le théâtre. Elle aide les professionnels à surmonter l'anxiété et à performer avec confiance dans des situations à enjeux élevés.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Our team brings together experts from education, public service, and technology. Each member contributes unique expertise to ensure your success."
              : "Notre équipe réunit des experts de l'éducation, de la fonction publique et de la technologie. Chaque membre apporte une expertise unique pour assurer votre réussite."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Meet our experts
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {language === "en"
              ? "A team of passionate experts dedicated to your success in the Canadian public service."
              : "Une équipe d'experts passionnés dédiés à votre réussite dans la fonction publique canadienne."}
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {team.map((member, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  loading="lazy" src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-sm text-amber-600 font-medium mb-3">{member.role}</p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {language === "en" ? member.bioEn : member.bioFr}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 11: CTA FINAL — Conversion
// ============================================================================
function FinalCTASection({ language }: { language: string }) {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {language === "en" ? "Ready to take the next step?" : "Prêt à franchir l'étape suivante ?"}
            </h2>
            <p className="text-xl text-slate-300 mb-12">
              {language === "en"
                ? "Stop guessing. Start passing your exams today."
                : "Ne devinez plus. Commencez à réussir vos examens dès aujourd'hui."}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2 px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-amber-500/25"
              >
                <Calendar className="w-5 h-5" />
                {language === "en" ? "Book a free discovery call (30 min)" : "Réserver un appel découverte gratuit (30 min)"}
              </Button>
            </Link>
            <Link href="/sle-diagnostic">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 gap-2 px-8 h-14 text-base font-semibold rounded-full"
              >
                <ClipboardCheck className="w-5 h-5" />
                {language === "en" ? "Take the free placement test" : "Passer le test de placement gratuit"}
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 gap-2 px-8 h-14 text-base font-semibold rounded-full"
              >
                <FileText className="w-5 h-5" />
                {language === "en" ? "Explore the product library" : "Explorer la bibliothèque de produits"}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 12: PROOF GALLERY
// ============================================================================
function ProofGallerySection({ language }: { language: string }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", labelEn: "All", labelFr: "Tous" },
    { id: "podcast", labelEn: "Podcast Shorts", labelFr: "Podcast Shorts" },
    { id: "coach", labelEn: "Coach Intros", labelFr: "Coach Intros" },
    { id: "capsules", labelEn: "Learning Capsules", labelFr: "Learning Capsules" },
  ];

  const content = [
    { id: 1, type: "podcast", title: "SLE Exam Prep Tips", duration: "0:58", level: "B", lang: "EN", thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/proof/podcast-1.jpg" },
    { id: 2, type: "podcast", title: "Oral Fluency Secrets", duration: "1:12", level: "C", lang: "FR", thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/proof/podcast-2.jpg" },
    { id: 3, type: "coach", title: "Meet Steven", duration: "2:30", level: "All", lang: "EN/FR", thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/proof/coach-steven.jpg" },
    { id: 4, type: "capsules", title: "Grammar Essentials", duration: "5:45", level: "B", lang: "FR", thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/proof/capsule-1.jpg" },
    { id: 5, type: "podcast", title: "Level C Strategies", duration: "1:05", level: "C", lang: "EN", thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/proof/podcast-3.jpg" },
    { id: 6, type: "coach", title: "Meet Sue-Anne", duration: "2:15", level: "All", lang: "FR", thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/proof/coach-sueanne.jpg" },
  ];

  const filteredContent = activeFilter === "all" ? content : content.filter(item => item.type === activeFilter);

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Explore our library of educational content. From quick tips to in-depth lessons, we provide resources to support your learning journey at every stage."
              : "Explorez notre bibliothèque de contenu éducatif. Des conseils rapides aux leçons approfondies, nous fournissons des ressources pour soutenir votre parcours d'apprentissage à chaque étape."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "Take learning beyond the session" : "Prolongez l'apprentissage au-delà de la session"}
          </h2>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {language === "en" ? filter.labelEn : filter.labelFr}
            </button>
          ))}
        </motion.div>

        {/* Content Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredContent.map((item) => (
            <motion.div
              key={item.id}
              variants={scaleIn}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-slate-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white/50 group-hover:text-white/80 group-hover:scale-110 transition-all duration-300" />
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {item.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 font-medium">
                    Level {item.level}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                    {item.lang}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 13: FAQ
// ============================================================================
function FAQSection({ language }: { language: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      questionEn: "What is the difference between RusingÂcademy and Lingueefy?",
      questionFr: "Quelle est la différence entre RusingÂcademy et Lingueefy ?",
      answerEn: "RusingÂcademy provides structured courses and curriculum for B2B/B2G clients, while Lingueefy is our B2C coaching platform connecting individuals with certified coaches and AI practice tools.",
      answerFr: "RusingÂcademy offre des cours et des programmes structurés pour les clients B2B/B2G, tandis que Lingueefy est notre plateforme de coaching B2C connectant les individus avec des coachs certifiés et des outils de pratique IA.",
    },
    {
      questionEn: "How long does it take to reach Level C?",
      questionFr: "Combien de temps faut-il pour atteindre le niveau C ?",
      answerEn: "With our accelerated methodology, most learners achieve their target level 3-4 times faster than traditional methods. Typical timelines range from 4-24 weeks depending on your starting level and availability.",
      answerFr: "Avec notre méthodologie accélérée, la plupart des apprenants atteignent leur niveau cible 3 à 4 fois plus vite qu'avec les méthodes traditionnelles. Les délais typiques varient de 4 à 24 semaines selon votre niveau de départ et votre disponibilité.",
    },
    {
      questionEn: "Do you offer training for government departments?",
      questionFr: "Offrez-vous des formations pour les ministères gouvernementaux ?",
      answerEn: "Yes, RusingÂcademy specializes in B2B/B2G training solutions. We offer custom programs, team dashboards, and on-site training options for government departments and organizations.",
      answerFr: "Oui, RusingÂcademy se spécialise dans les solutions de formation B2B/B2G. Nous offrons des programmes personnalisés, des tableaux de bord d'équipe et des options de formation sur site pour les ministères et organisations gouvernementales.",
    },
    {
      questionEn: "What is your success rate?",
      questionFr: "Quel est votre taux de réussite ?",
      answerEn: "We maintain a 95% success rate across all our programs. We provide guaranteed support until you achieve your language goals.",
      answerFr: "Nous maintenons un taux de réussite de 95% dans tous nos programmes. Nous offrons un soutien garanti jusqu'à ce que vous atteigniez vos objectifs linguistiques.",
    },
    {
      questionEn: "Can I get a free assessment?",
      questionFr: "Puis-je obtenir une évaluation gratuite ?",
      answerEn: "Absolutely! We offer a free strategic assessment that goes beyond a simple placement test. Book your 30-minute discovery call to get started.",
      answerFr: "Absolument ! Nous offrons une évaluation stratégique gratuite qui va au-delà d'un simple test de placement. Réservez votre appel découverte de 30 minutes pour commencer.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto">
        {/* Section Context */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center mb-6"
        >
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === "en"
              ? "Have questions? We've compiled answers to the most common questions from public servants considering our programs."
              : "Vous avez des questions ? Nous avons compilé les réponses aux questions les plus fréquentes des fonctionnaires qui envisagent nos programmes."}
          </p>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "Frequently Asked Questions" : "Questions fréquemment posées"}
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-3xl mx-auto space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900 pr-4">
                  {language === "en" ? faq.questionEn : faq.questionFr}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-slate-600 leading-relaxed">
                    {language === "en" ? faq.answerEn : faq.answerFr}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function EcosystemHub() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main id="main-content">
        {/* Section 0: Hero */}
        <HeroSection language={language} />

        {/* Section 1: Trilemme */}
        <TrilemmeSection language={language} />

        {/* Section 2: Écosystème */}
        <EcosystemSection language={language} />

        {/* Section 3: Méthodologie */}
        <MethodologySection language={language} />

        {/* Section 4: Offres */}
        <OffersSection language={language} />

        {/* Section 5: Cibles */}
        <TargetAudienceSection language={language} />

        {/* Section 6: Témoignages */}
        <TestimonialsSection language={language} />

        {/* Section 7: Leadership */}
        <LeadershipSection language={language} />

        {/* Section 8: Institutions */}
        <InstitutionsSection language={language} />

        {/* Section 9: Valeur */}
        <ValueSection language={language} />

        {/* Section 10: Équipe */}
        <TeamSection language={language} />

        {/* Section 11: CTA Final */}
        <FinalCTASection language={language} />

        {/* Section 12: Proof Gallery */}
        <ProofGallerySection language={language} />

        {/* Section 13: FAQ */}
        <FAQSection language={language} />
      </main>

      <Footer />
    </div>
  );
}
