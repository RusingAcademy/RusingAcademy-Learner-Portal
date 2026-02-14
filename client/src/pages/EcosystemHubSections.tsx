// Sections exportées individuellement pour intégration dans Home.tsx
// Header et Footer sont gérés par le layout existant
import { Button } from "@/components/ui/button";
import HeroGoldStandard from "@/components/HeroGoldStandard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import DisqusComments from "@/components/DisqusComments";
import PinchZoomImage from "@/components/PinchZoomImage";
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
  ChevronRight,
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
  ZoomIn,
  Maximize2,
  X,
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
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#C65A1E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C65A1E]/5 rounded-full blur-3xl" />
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
              <Globe className="w-4 h-4 text-[#C65A1E]400" />
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97B3D] via-orange-400 to-[#C65A1E]">
                  Bilingualism is one of the essential keys to moving forward.
                </span>
              </>
            ) : (
              <>
                Votre carrière est bloquée ?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97B3D] via-orange-400 to-[#C65A1E]">
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
                className="bg-gradient-to-r from-[#C65A1E] to-[#C65A1E] hover:from-[#A84A15] hover:to-[#A84A15] text-white gap-2 px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30"
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
      descEn: "You understand everything. The answer is clear in your mind. But when you speak, the words won't come. Comprehension without expression—the gap that traditional training never addresses.",
      descFr: "Vous comprenez tout. La réponse est claire dans votre esprit. Mais quand vous parlez, les mots ne viennent pas. Compréhension sans expression—l'écart que la formation traditionnelle n'aborde jamais.",
      color: "from-red-500 to-[#E06B2D]",
    },
    {
      icon: Brain,
      titleEn: "Impostor Syndrome",
      titleFr: "Le syndrome de l'imposteur",
      descEn: "On paper, you're bilingual. In practice, you avoid French calls, triple-check every email, and fear being 'exposed.' Traditional learning taught you to fear mistakes—not leverage them.",
      descFr: "Sur papier, vous êtes bilingue. En pratique, vous évitez les appels en français, vérifiez trois fois chaque courriel, et craignez d'être « démasqué ». L'apprentissage traditionnel vous a appris à craindre les erreurs—pas à les exploiter.",
      color: "from-[#0F3D3E] to-[#145A5B]",
    },
    {
      icon: TrendingUp,
      titleEn: "The Stagnation Plateau",
      titleFr: "Le plateau de stagnation",
      descEn: "Level B for years. Apps, classes, immersion weekends—same ceiling every time. Traditional methods get you to B. Breaking through to C requires a fundamentally different approach.",
      descFr: "Niveau B depuis des années. Applications, cours, immersions—même plafond à chaque fois. Les méthodes traditionnelles vous amènent au B. Percer vers le C exige une approche fondamentalement différente.",
      color: "from-blue-500 to-indigo-600",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
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
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {language === "en"
              ? "Every day without your Level C is a day of missed opportunities. Thousands of talented public servants face this challenge, trapped by three barriers that traditional training cannot break."
              : "Chaque jour sans votre niveau C est un jour d'opportunités manquées. Des milliers de fonctionnaires talentueux font face à ce défi, piégés par trois barrières que la formation traditionnelle ne peut briser."}
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
          <div className="bg-gradient-to-r from-[#FFF8F3] to-[#FFF8F3] rounded-2xl p-8 border border-[#FFE4D6]/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C65A1E] to-[#C65A1E] flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg text-slate-700 leading-relaxed">
                  {language === "en" ? (
                    <>
                      <strong className="text-slate-900">RusingÂcademy</strong> was created to break through these three walls, using a structured methodology that accelerates learning{" "}
                      <strong className="text-[#C65A1E]600">3 to 4 times faster</strong> than traditional approaches.
                    </>
                  ) : (
                    <>
                      <strong className="text-slate-900">RusingÂcademy</strong> a été créée pour briser ces trois murs, grâce à une méthodologie structurée qui accélère l'apprentissage{" "}
                      <strong className="text-[#C65A1E]600">3 à 4 fois plus vite</strong> que les approches traditionnelles.
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
      id: "courses",
      nameEn: "Your Courses",
      nameFr: "Vos Cours",
      brandEn: "RusingÂcademy",
      brandFr: "RusingÂcademy",
      descEn: "Structured crash courses designed for the federal public service. 6 progressive paths from A to C, with guaranteed results.",
      descFr: "Cours intensifs structurés conçus pour la fonction publique fédérale. 6 parcours progressifs de A à C, avec résultats garantis.",
      icon: GraduationCap,
      color: "#F97316",
      gradient: "from-[#C65A1E] to-[#A84A15]",
      image: "https://rusingacademy-cdn.b-cdn.net/images/ecosystem-rusingacademy.jpg",
      logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/rusingacademy-logo-r-only.png",
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
      logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/lingueefy-logo-icon.png",
      link: "/lingueefy",
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
      gradient: "from-[#C65A1E] to-[#A84A15]",
      image: "https://rusingacademy-cdn.b-cdn.net/images/ecosystem-barholex.jpg",
      logo: "https://rusingacademy-cdn.b-cdn.net/images/logos/barholex-logo-light.png",
      link: "/barholex-media",
    },
  ];

  return (
    <section id="ecosystem" className="py-24 px-4 bg-white scroll-mt-20">
      <div className="container mx-auto">
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
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {language === "en"
              ? "This is why we built something different. After years of watching talented professionals struggle with outdated methods, we created an integrated ecosystem that attacks the problem from every angle. Not just courses. Not just coaching. Not just technology. But all three, working together in perfect harmony. Each pillar was designed to solve a specific part of the puzzle: structured learning to build your foundation, expert coaching to break through your personal barriers, and cutting-edge media to accelerate your progress. This is the solution you've been waiting for."
              : "C'est pourquoi nous avons construit quelque chose de différent. Après des années à voir des professionnels talentueux lutter avec des méthodes dépassées, nous avons créé un écosystème intégré qui attaque le problème sous tous les angles. Pas seulement des cours. Pas seulement du coaching. Pas seulement de la technologie. Mais les trois, travaillant ensemble en parfaite harmonie. Chaque pilier a été conçu pour résoudre une partie spécifique du puzzle : un apprentissage structuré pour construire vos fondations, un coaching expert pour briser vos barrières personnelles, et des médias de pointe pour accélérer vos progrès. C'est la solution que vous attendiez."}
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
                  {pillar.logo ? (
                    <img loading="lazy" src={pillar.logo} alt={pillar.brandEn} className="h-10 w-auto" />
                  ) : (
                    <pillar.icon className="w-10 h-10 text-white" />
                  )}
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
      color: "from-[#C65A1E] to-[#A84A15]",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
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
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {language === "en"
              ? "Simple. Targeted. Results-oriented. Our proven methodology has helped hundreds of public servants achieve their language goals—each step builds on the previous one to create a clear path to success."
              : "Simple. Ciblée. Orientée résultats. Notre méthodologie éprouvée a aidé des centaines de fonctionnaires à atteindre leurs objectifs linguistiques—chaque étape s'appuie sur la précédente pour créer un chemin clair vers le succès."}
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
                <div className="text-5xl font-bold mb-4" style={{color: '#0a0a0a'}}>{step.number}</div>

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
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {language === "en"
              ? "Our solutions are designed specifically for Canadian public servants. Whether you need structured courses, personalized coaching, or innovative learning tools, we have the right solution for you."
              : "Nos solutions sont conçues spécifiquement pour les fonctionnaires canadiens. Que vous ayez besoin de cours structurés, de coaching personnalisé ou d'outils d'apprentissage innovants, nous avons la solution adaptée pour vous."}
          </p>
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
                  <h3 className="text-xl font-bold" style={{color: '#ffffff'}}>
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
      descEn: "Your SLE exam is in weeks, not months. You need intensive, focused preparation that delivers results fast. Our accelerated programs are designed for exactly this situation—no wasted time, just targeted training.",
      descFr: "Votre examen ELS est dans quelques semaines, pas des mois. Vous avez besoin d'une préparation intensive et ciblée qui donne des résultats rapidement. Nos programmes accélérés sont conçus exactement pour cette situation—pas de temps perdu, juste une formation ciblée.",
    },
    {
      icon: TrendingUp,
      titleEn: "Career advancement seekers",
      titleFr: "Chercheurs d'avancement",
      descEn: "You've hit the ceiling. The perfect position is there, but it requires bilingual proficiency. You're ready to invest in yourself and unlock the doors that have been closed until now.",
      descFr: "Vous avez atteint le plafond. Le poste parfait est là, mais il exige une maîtrise bilingue. Vous êtes prêt à investir en vous-même et à ouvrir les portes qui étaient fermées jusqu'à maintenant.",
    },
    {
      icon: Target,
      titleEn: "Previous exam candidates",
      titleFr: "Anciens candidats aux examens",
      descEn: "You've been there before. The frustration of falling short is real. But this time will be different—our proven methodology addresses exactly why traditional approaches failed you.",
      descFr: "Vous y avez déjà été. La frustration d'échouer est réelle. Mais cette fois sera différente—notre méthodologie éprouvée répond exactement aux raisons pour lesquelles les approches traditionnelles vous ont échoué.",
    },
    {
      icon: Briefcase,
      titleEn: "Mid-career professionals",
      titleFr: "Professionnels mi-carrière",
      descEn: "With 5-15 years of experience, you've earned your stripes. Now it's time to break through to leadership. Your expertise deserves recognition—don't let language be the barrier.",
      descFr: "Avec 5-15 ans d'expérience, vous avez fait vos preuves. Il est maintenant temps de percer vers le leadership. Votre expertise mérite d'être reconnue—ne laissez pas la langue être la barrière.",
    },
    {
      icon: MapPin,
      titleEn: "Remote & regional employees",
      titleFr: "Employés régionaux et à distance",
      descEn: "Location shouldn't limit your career. Our fully online programs bring world-class training to you, wherever you are in Canada. Flexible scheduling that fits your life.",
      descFr: "L'emplacement ne devrait pas limiter votre carrière. Nos programmes entièrement en ligne vous apportent une formation de classe mondiale, où que vous soyez au Canada. Horaires flexibles qui s'adaptent à votre vie.",
    },
    {
      icon: Trophy,
      titleEn: "High achievers targeting Level C",
      titleFr: "Performants visant le niveau C",
      descEn: "You don't settle for average. Level C is your target because you're aiming for executive positions. Our advanced programs are built for ambitious professionals like you.",
      descFr: "Vous ne vous contentez pas de la moyenne. Le niveau C est votre objectif parce que vous visez des postes de direction. Nos programmes avancés sont conçus pour des professionnels ambitieux comme vous.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#082038'}}>
            {language === "en" ? "Who benefits most from this program?" : "Qui bénéficie le plus de ce programme ?"}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {language === "en"
              ? "Our programs are specifically designed for Canadian public servants at various stages of their career. If you recognize yourself in one of these profiles, we can help you achieve your language goals."
              : "Nos programmes sont spécifiquement conçus pour les fonctionnaires canadiens à différentes étapes de leur carrière. Si vous vous reconnaissez dans l'un de ces profils, nous pouvons vous aider à atteindre vos objectifs linguistiques."}
          </p>
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
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C65A1E] to-[#C65A1E] flex items-center justify-center flex-shrink-0">
                  <profile.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{color: '#082038'}}>
                    {language === "en" ? profile.titleEn : profile.titleFr}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
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
              className="bg-gradient-to-r from-[#C65A1E] to-[#C65A1E] hover:from-[#A84A15] hover:to-[#A84A15] text-white gap-2 px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-amber-500/25"
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
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "Trusted by public servants" : "La confiance des fonctionnaires"}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {language === "en"
              ? "Don't just take our word for it. Hear from public servants who have transformed their careers through our programs—real results from real professionals."
              : "Ne nous croyez pas sur parole. Écoutez les fonctionnaires qui ont transformé leur carrière grâce à nos programmes—des résultats réels de vrais professionnels."}
          </p>
        </motion.div>

        {/* Testimonials Grid - Premium layout with larger photos */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Author Header with Photo */}
              <div className="flex items-center gap-5 p-8 bg-gradient-to-r from-[#FFF8F3]/50 to-white border-b border-amber-100/50">
                {testimonial.image ? (
                  <img
                    loading="lazy" src={testimonial.image}
                    alt={testimonial.name}
                    className="w-28 h-28 rounded-full object-cover object-top border-4 border-[#D97B3D] shadow-lg ring-4 ring-amber-100"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center border-4 border-slate-300 ring-4 ring-slate-100">
                    <Users className="w-8 h-8 text-slate-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-teal-700 font-medium">{testimonial.role}</p>
                  <p className="text-sm text-slate-500">{testimonial.org}</p>
                </div>
                <a
                  href={testimonial.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center hover:bg-[#006097] transition-colors shadow-sm"
                  aria-label={`${testimonial.name}'s LinkedIn profile`}
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>

              {/* Quote */}
              <div className="p-6">
                <div className="text-5xl text-[#C65A1E]400 leading-none mb-3">“</div>
                <p className="text-slate-700 leading-relaxed text-lg italic">
                  {language === "en" ? testimonial.quoteEn : testimonial.quoteFr}
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
// SECTION 7: LEADERSHIP — Who is Steven Barholere
// ============================================================================
function LeadershipSection({ language }: { language: string }) {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Header - Title removed per user request, lead paragraph kept */}
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
                  loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/leadership-steven.png"
                  alt="Steven Barholere"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent md:bg-gradient-to-r" />
              </motion.div>

              {/* Content */}
              <motion.div variants={fadeInUp} className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Meet Steven Barholere.
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

                {/* CTA Button */}
                <motion.div 
                  variants={fadeInUp}
                  className="mt-8"
                >
                  <a 
                    href="https://calendly.com/rusingacademy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 50%, #8B6914 100%)",
                      boxShadow: "0 4px 20px rgba(212, 175, 55, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Calendar className="w-5 h-5" />
                    {language === "en" ? "Book An Appointment" : "Prendre Rendez-vous"}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 7b: KUDOBOARD TESTIMONIALS — Former colleagues testimonials (Premium)
// ============================================================================
function KudoboardTestimonialsSection({ language }: { language: string }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const kudoboards = [
    {
      id: 1,
      src: "https://rusingacademy-cdn.b-cdn.net/images/kudoboard_Steven_hq.png",
      alt: language === "en" 
        ? "Kudoboard testimonials from Steven's former colleagues - Merci Beaucoup Steven" 
        : "Témoignages Kudoboard des anciens collègues de Steven - Merci Beaucoup Steven",
      title: "Merci Beaucoup Steven!",
      organization: "Correctional Service of Canada",
      date: "May 2021",
    },
    {
      id: 2,
      src: "https://rusingacademy-cdn.b-cdn.net/images/kudoboard_Steven2_hq.png",
      alt: language === "en" 
        ? "Kudoboard testimonials from Steven's former colleagues - Merci Beacoup" 
        : "Témoignages Kudoboard des anciens collègues de Steven - Merci Beacoup",
      title: "Merci Beacoup!",
      organization: "Innovation, Science and Economic Development Canada",
      date: "June 2025",
    },
  ];

  return (
    <>
      <section className="py-24 px-4 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C65A1E]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-slate-100/50 to-transparent rounded-full" />
        </div>

        <div className="container mx-auto relative z-10">
          {/* Premium Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div 
              variants={scaleIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-[#C65A1E]/10 border border-teal-500/20 mb-6"
            >
              <Heart className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">
                {language === "en" ? "Authentic Testimonials" : "Témoignages Authentiques"}
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                {language === "en" ? "What His Colleagues Say" : "Ce que disent ses collègues"}
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {language === "en"
                ? "These heartfelt Kudoboard messages from former public servant colleagues capture the real, transformative impact of Steven's French instruction. Click to view in full resolution."
                : "Ces messages Kudoboard sincères d'anciens collègues fonctionnaires capturent l'impact réel et transformateur de l'enseignement du français de Steven. Cliquez pour voir en pleine résolution."}
            </p>
          </motion.div>

          {/* Premium Kudoboard Gallery */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto"
          >
            {kudoboards.map((board) => (
              <motion.div
                key={board.id}
                variants={scaleIn}
                className="group relative cursor-pointer"
                onClick={() => setSelectedImage(board.src)}
              >
                {/* Glassmorphism Card */}
                <div className="relative rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-slate-900/10 transition-all duration-500 group-hover:shadow-3xl group-hover:shadow-teal-500/20 group-hover:-translate-y-2">
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/20 via-transparent to-[#C65A1E]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Organization & Date Caption */}
                  <div className="px-6 pt-4 pb-2">
                    <p className="text-sm font-medium text-slate-700">{board.organization}</p>
                    <p className="text-xs text-slate-500">{board.date}</p>
                  </div>

                  {/* Image Container */}
                  <div className="relative px-4 pb-4">
                    <div className="relative rounded-2xl overflow-hidden">
                      <img
                        src={board.src}
                        alt={board.alt}
                        className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                        loading="lazy"                       />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/90 backdrop-blur-sm shadow-xl">
                          <ZoomIn className="w-5 h-5 text-teal-600" />
                          <span className="font-medium text-slate-800">
                            {language === "en" ? "Click to enlarge" : "Cliquez pour agrandir"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{board.title}</h3>
                        <p className="text-sm text-slate-500">
                          {language === "en" ? "High resolution • Click to zoom" : "Haute résolution • Cliquez pour zoomer"}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Premium Caption */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-100/80 backdrop-blur-sm border border-slate-200">
              <Users className="w-5 h-5 text-teal-600" />
              <p className="text-sm text-slate-600">
                {language === "en"
                  ? "Real messages from federal public servants who benefited from Steven's French instruction"
                  : "Messages réels de fonctionnaires fédéraux qui ont bénéficié de l'enseignement du français de Steven"}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal with Pinch-to-Zoom */}
      <AnimatePresence>
        {selectedImage && (
          <PinchZoomImage
            src={selectedImage}
            alt="Kudoboard testimonials - Full resolution"
            onClose={() => setSelectedImage(null)}
            language={language}
          />
        )}
      </AnimatePresence>
    </>
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
    <section className="py-16 px-4 bg-white">
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

        {/* Partner Logos Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-8"
        >
          {/* Government of Canada */}
          <motion.div variants={scaleIn} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer" title={language === "en" ? "Government of Canada" : "Gouvernement du Canada"}>
            <img loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/partners/gouvernement-canada.jpg" alt="Government of Canada" className="h-14 md:h-18 w-auto object-contain" />
          </motion.div>
          {/* CDS/SNC - Canadian Digital Service */}
          <motion.div variants={scaleIn} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer" title={language === "en" ? "Canadian Digital Service (CDS)" : "Service numérique canadien (SNC)"}>
            <img loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/partners/cds-snc.png" alt="Canadian Digital Service" className="h-14 md:h-18 w-auto object-contain" />
          </motion.div>
          {/* IRCC */}
          <motion.div variants={scaleIn} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer" title={language === "en" ? "Immigration, Refugees and Citizenship Canada (IRCC)" : "Immigration, Réfugiés et Citoyenneté Canada (IRCC)"}>
            <img loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/partners/ircc.jpg" alt="IRCC" className="h-12 md:h-14 w-auto object-contain" />
          </motion.div>
          {/* Ontario */}
          <motion.div variants={scaleIn} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer" title={language === "en" ? "Government of Ontario" : "Gouvernement de l'Ontario"}>
            <img loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/partners/ontario.jpg" alt="Government of Ontario" className="h-12 md:h-14 w-auto object-contain" />
          </motion.div>
          {/* Department of National Defence */}
          <motion.div variants={scaleIn} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer" title={language === "en" ? "Department of National Defence (DND)" : "Ministère de la Défense nationale (MDN)"}>
            <img loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/partners/defense-nationale.jpg" alt="Department of National Defence" className="h-14 md:h-18 w-auto object-contain" />
          </motion.div>
          {/* Canadian Armed Forces */}
          <motion.div variants={scaleIn} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer" title={language === "en" ? "Canadian Armed Forces (CAF)" : "Forces armées canadiennes (FAC)"}>
            <img loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/partners/forces-armees-canada.jpg" alt="Canadian Armed Forces" className="h-14 md:h-18 w-auto object-contain" />
          </motion.div>
          {/* Correctional Service Canada */}
          <motion.div variants={scaleIn} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer" title={language === "en" ? "Correctional Service Canada (CSC)" : "Service correctionnel du Canada (SCC)"}>
            <img loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/partners/service-correctionnel.jpg" alt="Correctional Service Canada" className="h-14 md:h-18 w-auto object-contain" />
          </motion.div>
          {/* Canadian Forces */}
          <motion.div variants={scaleIn} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer" title={language === "en" ? "Canadian Forces" : "Forces canadiennes"}>
            <img loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/partners/forces-canadiennes.png" alt="Canadian Forces" className="h-14 md:h-18 w-auto object-contain" />
          </motion.div>
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
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "Why Choose RusingÂcademy?" : "Pourquoi choisir RusingÂcademy ?"}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {language === "en"
              ? "What sets us apart from traditional language schools? Our exclusive focus on the Canadian public service, combined with a proven methodology and personalized approach."
              : "Qu'est-ce qui nous distingue des écoles de langues traditionnelles ? Notre concentration exclusive sur la fonction publique canadienne, combinée à une méthodologie éprouvée et une approche personnalisée."}
          </p>
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
              loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/podcast-studio.jpg"
              alt="Steven Barholere in podcast studio"
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C65A1E] to-[#C65A1E] flex items-center justify-center mb-4">
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
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/qCjqKzgFoAphEKLF.jpg",
      linkedin: "https://www.linkedin.com/in/steven-barholere-1a17b8a6/",
      bioEn: "With over 15 years in adult training, Steven is a Government of Canada–certified specialist in bilingual education. He creates innovative learning solutions that help public servants succeed in official language evaluations. As a visionary leader, he transforms language training into practical tools for career growth.",
      bioFr: "Avec plus de 15 ans dans la formation des adultes, Steven est un spécialiste certifié par le gouvernement du Canada en éducation bilingue. Il crée des solutions d'apprentissage innovantes qui aident les fonctionnaires à réussir les évaluations de langues officielles. En tant que leader visionnaire, il transforme la formation linguistique en outils pratiques pour la croissance de carrière.",
    },
    {
      name: "Sue-Anne Richer",
      role: "Chief Learning Officer - RusingÂcademy",
      image: "https://rusingacademy-cdn.b-cdn.net/images/team-sueanne.jpg",
      linkedin: "https://www.linkedin.com/in/sue-anne-richer-46ab2a383/",
      bioEn: "Sue-Anne is an expert in designing educational programs tailored to government language evaluations. She guides professionals in mastering French through clear learning pathways and exam preparation. Her strength lies in making complex learning feel structured and achievable.",
      bioFr: "Sue-Anne est experte dans la conception de programmes éducatifs adaptés aux évaluations linguistiques gouvernementales. Elle guide les professionnels dans la maîtrise du français à travers des parcours d'apprentissage clairs et la préparation aux examens. Sa force réside dans sa capacité à rendre l'apprentissage complexe structuré et réalisable.",
    },
    {
      name: "Preciosa Baganha",
      role: "Chief People Officer - Lingueefy",
      image: "https://rusingacademy-cdn.b-cdn.net/images/team-preciosa.jpg",
      linkedin: "https://www.linkedin.com/in/managerok/",
      bioEn: "Preciosa specializes in bilingual talent development and career growth within the public sector. She matches learners with the right coaches and ensures a high-quality learning journey. Her work helps organizations and individuals build strong, bilingual teams.",
      bioFr: "Preciosa se spécialise dans le développement des talents bilingues et la croissance de carrière dans le secteur public. Elle jumelle les apprenants avec les bons coachs et assure un parcours d'apprentissage de haute qualité. Son travail aide les organisations et les individus à bâtir des équipes bilingues solides.",
    },
    {
      name: "Erika Seguin",
      role: "Chief Bilingualism Campaigner - Barholex Media",
      image: "https://rusingacademy-cdn.b-cdn.net/images/team-erika.jpg",
      linkedin: "https://www.linkedin.com/in/erika-seguin-9aaa40383/",
      bioEn: "Erika is a performance coach with a background in public service, education, psychology, and acting. She helps professionals overcome anxiety and perform with confidence in high-stakes settings like language tests, using science-based and stage-informed strategies.",
      bioFr: "Erika est coach de performance avec une expérience dans la fonction publique, l'éducation, la psychologie et le théâtre. Elle aide les professionnels à surmonter l'anxiété et à performer avec confiance dans des situations à enjeux élevés comme les tests de langue, en utilisant des stratégies basées sur la science et informées par la scène.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {language === "en" ? "Meet our experts" : "Rencontrez nos experts"}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {language === "en"
              ? "A team of passionate experts dedicated to your success in the Canadian public service. Our team brings together experts from education, public service, and technology—each member contributes unique expertise to ensure your success."
              : "Une équipe d'experts passionnés dédiés à votre réussite dans la fonction publique canadienne. Notre équipe réunit des experts de l'éducation, de la fonction publique et de la technologie—chaque membre apporte une expertise unique pour assurer votre réussite."}
          </p>
        </motion.div>

        {/* Team Grid - 2x2 unified card layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {team.map((member, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200"
            >
              {/* Unified Card - Image fills top to bottom on left, content on right */}
              <div className="flex flex-col md:flex-row h-full">
                {/* Image Container - Full height, fixed width */}
                <div className="relative w-full md:w-[200px] h-[280px] md:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    loading="lazy" src={member.image}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ objectPosition: member.name === 'Preciosa Baganha' ? '50% 25%' : 'center top' }}
                  />
                  {/* Subtle gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content Container - Fills remaining space */}
                <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 font-serif italic">{member.name}</h3>
                    <p className="text-teal-700 font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {language === "en" ? member.bioEn : member.bioFr}
                    </p>
                  </div>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 mt-4 px-5 py-2 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-medium transition-colors w-fit"
                    aria-label={`${member.name}'s LinkedIn profile`}
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
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
// SECTION 11: CTA FINAL — Conversion
// ============================================================================
function FinalCTASection({ language }: { language: string }) {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{backgroundColor: '#a09c9c'}}>
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{color: '#f1f2f3'}}>
              {language === "en" ? "Ready to take the next step?" : "Prêt à franchir l'étape suivante ?"}
            </h2>
            <p className="text-xl mb-12" style={{color: '#ffffff'}}>
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
                className="bg-gradient-to-r from-[#C65A1E] to-[#C65A1E] hover:from-[#A84A15] hover:to-[#A84A15] text-white gap-2 px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-amber-500/25"
              >
                <Calendar className="w-5 h-5" />
                {language === "en" ? "Book a free discovery call (30 min)" : "Réserver un appel découverte gratuit (30 min)"}
              </Button>
            </Link>
            <Link href="/sle-diagnostic">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 hover:bg-white/10 gap-2 px-8 h-14 text-base font-semibold rounded-full" style={{color: '#decece'}}
              >
                <ClipboardCheck className="w-5 h-5" />
                {language === "en" ? "Take the free placement test" : "Passer le test de placement gratuit"}
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 hover:bg-white/10 gap-2 px-8 h-14 text-base font-semibold rounded-full" style={{color: '#decece'}}
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
// SECTION 12: VIDEO GALLERY - Shorts & Learning Capsules
// ============================================================================
function ProofGallerySection({ language }: { language: string }) {
  const [activeFilter, setActiveFilter] = useState("shorts");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [showDisqus, setShowDisqus] = useState<string | null>(null);

  const filters = [
    { id: "shorts", labelEn: "YouTube Shorts", labelFr: "YouTube Shorts" },
    { id: "capsules", labelEn: "Learning Capsules", labelFr: "Capsules d'apprentissage" },
  ];

  // Real YouTube Shorts (9:16 format) - Embedded from YouTube
  const shorts = [
    { 
      id: "short-01", 
      youtubeId: "7rFq3YBm-E0",
      titleEn: "The 4 Stages of Learning", 
      titleFr: "Les 4 étapes de l'apprentissage",
      descriptionEn: "Discover how to transition from conscious competence to unconscious competence.",
      descriptionFr: "Découvrez comment passer de la compétence consciente à l'inconsciente.",
      category: "learning"
    },
    { 
      id: "short-02", 
      youtubeId: "NdpnZafDl-E",
      titleEn: "Mastering the Past in French", 
      titleFr: "Maîtriser le passé en français",
      descriptionEn: "Essential guidelines and examples of past tenses for exam preparation.",
      descriptionFr: "Lignes directrices essentielles pour les temps passés.",
      category: "grammar"
    },
    { 
      id: "short-03", 
      youtubeId: "B3dq1K9NgIk",
      titleEn: "Building Your Network", 
      titleFr: "Construire son réseau",
      descriptionEn: "Step out of your comfort zone to create lasting connections.",
      descriptionFr: "Sortez de votre zone de confort pour créer des liens durables.",
      category: "career"
    },
    { 
      id: "short-04", 
      youtubeId: "bhKIH5ds6C8",
      titleEn: "Knowledge Democratization", 
      titleFr: "Démocratisation du savoir",
      descriptionEn: "How AI confronts conventional perceptions of body, mind, and identity.",
      descriptionFr: "Comment l'IA confronte les perceptions conventionnelles.",
      category: "innovation"
    },
    { 
      id: "short-05", 
      youtubeId: "gWaRvaM09lo",
      titleEn: "Bilingual = More Money?", 
      titleFr: "Bilingue = Plus d'argent?",
      descriptionEn: "Discover how bilingualism can boost your career and create opportunities.",
      descriptionFr: "Découvrez comment le bilinguisme peut booster votre carrière.",
      category: "career"
    },
    { 
      id: "short-06", 
      youtubeId: "BiyAaX0EXG0",
      titleEn: "Unconscious Competence", 
      titleFr: "Compétence inconsciente",
      descriptionEn: "When driving becomes body memory. You just know how to do it.",
      descriptionFr: "Quand la conduite devient mémoire corporelle.",
      category: "learning"
    },
    { 
      id: "short-07", 
      youtubeId: "j-AXNvGqu8I",
      titleEn: "AI Danger? Expert Skepticism", 
      titleFr: "Danger de l'IA? Scepticisme expert",
      descriptionEn: "Is AI as smart as it seems? One expert warns about limitations.",
      descriptionFr: "L'IA est-elle aussi intelligente qu'elle le semble?",
      category: "innovation"
    },
    { 
      id: "short-08", 
      youtubeId: "6xyVm2wta2E",
      titleEn: "Cédric's Network Secret", 
      titleFr: "Le secret du réseau de Cédric",
      descriptionEn: "An inspiring story about building professional networks.",
      descriptionFr: "Une histoire inspirante sur la construction de réseaux.",
      category: "career"
    },
  ];

  // Learning Capsules (16:9 format) - 7 Bunny Stream videos with custom thumbnails
  const BUNNY_LIBRARY_ID = "585866";
  const capsules = [
    { 
      id: "capsule-01", 
      bunnyId: "9ff70347-63fb-4632-bbed-41085d21002f",
      thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/capsules/capsule_01.jpg",
      titleEn: "Behaviorism", 
      titleFr: "Le béhaviorisme",
      descEn: "Understanding learning through observable behaviors and conditioning",
      descFr: "Comprendre l'apprentissage par les comportements observables",
      category: "theory"
    },
    { 
      id: "capsule-02", 
      bunnyId: "2bea9c8c-1376-41ae-8421-ea8271347aff",
      thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/capsules/capsule_02.jpg",
      titleEn: "Cognitivism", 
      titleFr: "Le cognitivisme",
      descEn: "How mental processes shape knowledge acquisition",
      descFr: "Comment les processus mentaux façonnent l'acquisition des connaissances",
      category: "theory"
    },
    { 
      id: "capsule-03", 
      bunnyId: "fd2eb202-ae4e-482e-a0b8-f2b2f0e07446",
      thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/capsules/capsule_03.jpg",
      titleEn: "Socio-constructivism", 
      titleFr: "Le socio-constructivisme",
      descEn: "Learning through social interaction and collaboration",
      descFr: "Apprendre par l'interaction sociale et la collaboration",
      category: "theory"
    },
    { 
      id: "capsule-04", 
      bunnyId: "37f4bd93-81c3-4e1f-9734-0b5000e93209",
      thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/capsules/capsule_04.jpg",
      titleEn: "Constructivism", 
      titleFr: "Le constructivisme",
      descEn: "Building knowledge through active experience",
      descFr: "Construire les connaissances par l'expérience active",
      category: "theory"
    },
    { 
      id: "capsule-05", 
      bunnyId: "0688ba54-7a20-4f68-98ad-5acccb414e11",
      thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/capsules/capsule_05.jpg",
      titleEn: "Humanism", 
      titleFr: "L'humanisme",
      descEn: "Learner-centered approach focusing on personal growth",
      descFr: "Approche centrée sur l'apprenant axée sur la croissance personnelle",
      category: "theory"
    },
    { 
      id: "capsule-06", 
      bunnyId: "b45608b7-c10f-44f5-8f68-6d6e37ba8171",
      thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/capsules/capsule_06.jpg",
      titleEn: "Connectivism", 
      titleFr: "Le connectivisme",
      descEn: "Learning in the digital age through networks",
      descFr: "Apprendre à l'ère numérique à travers les réseaux",
      category: "theory"
    },
    { 
      id: "capsule-07", 
      bunnyId: "04c2af4b-584e-40c6-926a-25fed27ea1d7",
      thumbnail: "https://rusingacademy-cdn.b-cdn.net/images/capsules/capsule_07.jpg",
      titleEn: "Experiential Learning", 
      titleFr: "L'apprentissage expérientiel",
      descEn: "Learning through reflection on doing",
      descFr: "Apprendre par la réflexion sur l'action",
      category: "theory"
    },
  ];

  const currentContent = activeFilter === "shorts" ? shorts : capsules;
  const isShorts = activeFilter === "shorts";

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{color: '#fcfcfc'}}>
            {language === "en" ? "Take learning beyond the session" : "Prolongez l'apprentissage au-delà de la session"}
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto" style={{color: '#f9fafa'}}>
            {language === "en"
              ? "Explore our library of educational content. From quick tips to in-depth lessons, we provide resources to support your learning journey at every stage."
              : "Explorez notre bibliothèque de contenu éducatif. Des conseils rapides aux leçons approfondies, nous fournissons des ressources pour soutenir votre parcours d'apprentissage à chaque étape."}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setPlayingVideo(null);
              }}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === filter.id
                  ? "bg-gradient-to-r from-[#C65A1E] to-[#C65A1E] text-white shadow-lg shadow-amber-500/30"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
            >
              {language === "en" ? filter.labelEn : filter.labelFr}
            </button>
          ))}
        </motion.div>

        {/* Shorts Carousel (9:16 format) */}
        {isShorts && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="relative"
          >
            {/* Horizontal Scroll Container */}
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {shorts.map((short, index) => (
                <motion.div
                  key={short.id}
                  variants={scaleIn}
                  className="flex-shrink-0 snap-center first:ml-4 last:mr-4"
                  onMouseEnter={() => setHoveredVideo(short.id)}
                  onMouseLeave={() => setHoveredVideo(null)}
                >
                  <div 
                    className={`relative w-[280px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer ${
                      hoveredVideo === short.id ? 'scale-105 shadow-amber-500/30' : ''
                    }`}
                    style={{ aspectRatio: '9/16' }}
                    onClick={() => setPlayingVideo(playingVideo === short.id ? null : short.id)}
                  >
                    {/* YouTube Embed or Thumbnail */}
                    {playingVideo === short.id ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${short.youtubeId}?autoplay=1&loop=1&playlist=${short.youtubeId}&controls=1&modestbranding=1`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={language === "en" ? short.titleEn : short.titleFr}
                      />
                    ) : (
                      <>
                        {/* YouTube Thumbnail */}
                        <img
                          loading="lazy" src={`https://img.youtube.com/vi/${short.youtubeId}/maxresdefault.jpg`}
                          alt={language === "en" ? short.titleEn : short.titleFr}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to hqdefault if maxresdefault doesn't exist
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${short.youtubeId}/hqdefault.jpg`;
                          }}
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center transition-transform hover:scale-110 shadow-lg shadow-red-600/50">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Video Number Badge */}
                    {playingVideo !== short.id && (
                      <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gradient-to-br from-[#C65A1E] to-[#C65A1E] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                    )}
                    
                    {/* YouTube Badge */}
                    {playingVideo !== short.id && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Shorts
                      </div>
                    )}
                    
                    {/* Content */}
                    {playingVideo !== short.id && (
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                          {language === "en" ? short.titleEn : short.titleFr}
                        </h3>
                        <p className="text-slate-300 text-sm line-clamp-2 mb-3" style={{color: '#fafafa'}}>
                          {language === "en" ? short.descriptionEn : short.descriptionFr}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-[#C65A1E]/20 text-[#C65A1E]300 font-medium backdrop-blur-sm">
                            {short.category === "learning" ? (language === "en" ? "Learning" : "Apprentissage") :
                             short.category === "grammar" ? (language === "en" ? "Grammar" : "Grammaire") :
                             short.category === "career" ? (language === "en" ? "Career" : "Carrière") :
                             short.category === "innovation" ? (language === "en" ? "Innovation" : "Innovation") :
                             "SLE Tips"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Scroll Hint */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <ChevronRight className="w-4 h-4 animate-pulse" />
                <span>{language === "en" ? "Scroll to explore more" : "Faites défiler pour explorer"}</span>
                <ChevronRight className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Learning Capsules Grid (16:9 format) - Bunny Stream Videos */}
        {!isShorts && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {capsules.map((capsule) => (
              <motion.div
                key={capsule.id}
                variants={scaleIn}
                className="group relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-amber-500/20"
              >
                {/* Video Container (16:9) */}
                <div className="relative" style={{ aspectRatio: '16/9' }}>
                  {playingVideo === capsule.id ? (
                    /* Bunny Stream Embed */
                    <iframe
                      src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${capsule.bunnyId}?autoplay=true&loop=false&muted=false&preload=true`}
                      className="absolute inset-0 w-full h-full"
                      loading="lazy"                       allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      title={language === "en" ? capsule.titleEn : capsule.titleFr}
                    />
                  ) : (
                    /* Custom Thumbnail with Play Button */
                    <div 
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => setPlayingVideo(capsule.id)}
                    >
                      <img
                        loading="lazy" src={capsule.thumbnail}
                        alt={language === "en" ? capsule.titleEn : capsule.titleFr}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-[#C65A1E] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-orange-500/50">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4 bg-white/5 backdrop-blur-sm">
                  <h3 className="font-bold text-white text-base mb-1">
                    {language === "en" ? capsule.titleEn : capsule.titleFr}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                    {language === "en" ? capsule.descEn : capsule.descFr}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPlayingVideo(capsule.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C65A1E] hover:bg-orange-600 text-white text-xs font-medium rounded-full transition-colors"
                    >
                      <Play className="w-3 h-3" fill="white" />
                      {language === "en" ? "Watch" : "Regarder"}
                    </button>
                    <button
                      onClick={() => setShowDisqus(showDisqus === capsule.id ? null : capsule.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        showDisqus === capsule.id
                          ? "bg-teal-500 text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      {language === "en" ? "Discuss" : "Discuter"}
                    </button>
                  </div>
                </div>
                
                {/* Disqus Comments Section */}
                {showDisqus === capsule.id && (
                  <div className="p-4 bg-white rounded-b-2xl">
                    <DisqusComments
                      identifier={`homepage-capsule-${capsule.id}`}
                      title={language === "en" ? capsule.titleEn : capsule.titleFr}
                      language={language}
                      className="min-h-[200px]"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-16"
        >
          <a
            href="https://www.youtube.com/channel/UC5aSvb7pDEdq8DadPD94qxw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            {language === "en" ? "Subscribe to our YouTube Channel" : "Abonnez-vous à notre chaîne YouTube"}
          </a>
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
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
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
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {language === "en"
              ? "Have questions? We've compiled answers to the most common questions from public servants considering our programs."
              : "Vous avez des questions ? Nous avons compilé les réponses aux questions les plus fréquentes des fonctionnaires qui envisagent nos programmes."}
          </p>
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
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white transition-colors"
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
// EXPORTS - Sections individuelles pour intégration flexible
// ============================================================================
export {
  HeroSection,
  TrilemmeSection,
  EcosystemSection,
  MethodologySection,
  OffersSection,
  TargetAudienceSection,
  TestimonialsSection,
  LeadershipSection,
  InstitutionsSection,
  ValueSection,
  TeamSection,
  FinalCTASection,
  ProofGallerySection,
  FAQSection,
};

// ============================================================================
// MAIN COMPONENT - Contenu sans Header/Footer (pour intégration dans layout existant)
// ============================================================================
export default function EcosystemHubContent() {
  const { language } = useLanguage();
  return (
    <main id="main-content">
      {/* Section 0: Hero - Golden Standard (immutable) */}
      <HeroGoldStandard />

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

      {/* Section 7b: Kudoboard Testimonials */}
      <KudoboardTestimonialsSection language={language} />

      {/* Section 8: Institutions */}
      <InstitutionsSection language={language} />

      {/* Section 9: Valeur */}
      <ValueSection language={language} />

      {/* Section 10: Équipe */}
      <TeamSection language={language} />

      {/* Section 11: Proof Gallery (YouTube Shorts & Learning Capsules) */}
      <ProofGallerySection language={language} />

      {/* Section 12: FAQ */}
      <FAQSection language={language} />

      {/* Section 13: CTA Final (dernière section avant footer) */}
      <FinalCTASection language={language} />
    </main>
  );
}
