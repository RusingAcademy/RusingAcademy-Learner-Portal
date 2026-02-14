import { useState, useEffect, useRef } from "react";
import SEO from "@/components/SEO";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sun, Moon, Check, ArrowRight, ChevronLeft, ChevronRight, Users, MessageCircle, Menu, X } from "lucide-react";
import RusingAcademyLogo from "@/components/RusingAcademyLogo";
import HeroGoldStandard from "@/components/HeroGoldStandard";
import TrustedByPublicServants from "@/components/homepage/TrustedByPublicServants";
import TheyTrustedUs from "@/components/homepage/TheyTrustedUs";
import MeetOurExperts from "@/components/homepage/MeetOurExperts";
import LearningCapsules from "@/components/homepage/LearningCapsules";
import YouTubeVideos from "@/components/homepage/YouTubeVideos";
import TrilemmaSection from "@/components/homepage/TrilemmaSection";
import FooterInstitutional from "@/components/FooterInstitutional";
import ProofGallery from "@/components/ProofGallery";
import LingeefyLogo from "@/components/LingeefyLogo";
import BarholexLogo from "@/components/BarholexLogo";

// Hero carousel images - real photos from RusingAcademy training sessions
const heroCarouselImages = [
  {
    src: "https://rusingacademy-cdn.b-cdn.net/images/generated/hero-ecosystem.jpg",
    alt: { en: "Diverse Canadian public servants in modern office", fr: "Fonctionnaires canadiens diversifiés dans un bureau moderne" },
  },
  {
    src: "https://rusingacademy-cdn.b-cdn.net/images/generated/classroom-training.jpg",
    alt: { en: "Professional bilingual training session", fr: "Session de formation bilingue professionnelle" },
  },
  {
    src: "https://rusingacademy-cdn.b-cdn.net/images/generated/coaching-session.jpg",
    alt: { en: "One-on-one professional language coaching", fr: "Coaching linguistique individuel professionnel" },
  },
  {
    src: "https://rusingacademy-cdn.b-cdn.net/images/generated/success-celebration.jpg",
    alt: { en: "Public servant celebrating SLE success", fr: "Fonctionnaire célébrant sa réussite ELS" },
  },
  {
    src: "https://rusingacademy-cdn.b-cdn.net/images/generated/podcast-studio.jpg",
    alt: { en: "Barholex Media podcast recording session", fr: "Session d'enregistrement de balado Barholex Media" },
  },
];

type Theme = "glass" | "light";

interface BrandCard {
  id: string;
  name: string;
  color: string;
  image: string;
  pitch: { en: string; fr: string };
  bullets: { en: string[]; fr: string[] };
  cta: { en: string; fr: string };
  link: string;
}

const brands: BrandCard[] = [
  {
    id: "rusingacademy",
    name: "RusingAcademy",
    color: "#1E9B8A",
    image: "https://rusingacademy-cdn.b-cdn.net/images/generated/rusingacademy-hero.jpg",
    pitch: {
      en: "A structured curriculum built for public service realities—Path Series™ programs aligned with SLE outcomes.",
      fr: "Un curriculum structuré pensé pour la fonction publique — Path Series™ aligné sur les résultats ELS/SLE.",
    },
    bullets: {
      en: [
        "Path Series™ accelerated learning",
        "SLE-aligned (BBB / CBC / CCC goals)",
        "Crash Courses + Micro-learning (capsules, video, podcast)",
        "Built for workplace bilingual culture",
      ],
      fr: [
        "Apprentissage accéléré Path Series™",
        "Aligné ELS/SLE (objectifs BBB / CBC / CCC)",
        "Crash courses + micro-learning (capsules, vidéo, balado)",
        "Conçu pour une culture de travail bilingue",
      ],
    },
    cta: { en: "Explore RusingAcademy", fr: "Découvrir RusingAcademy" },
    link: "/rusingacademy",
  },
  {
    id: "lingueefy",
    name: "Lingueefy",
    color: "#17E2C6",
    image: "https://rusingacademy-cdn.b-cdn.net/images/generated/lingueefy-hero.jpg",
    pitch: {
      en: "Find the right coach fast—and practice smarter with SLE AI Companion AI tools.",
      fr: "Trouvez le bon coach rapidement — et pratiquez mieux avec les outils SLE AI Companion AI.",
    },
    bullets: {
      en: [
        "Expert SLE coach matching",
        "SLE AI Companion AI: Voice Practice Sessions",
        "SLE Placement Tests",
        "Oral Exam Simulations",
      ],
      fr: [
        "Jumelage avec coachs experts ELS/SLE",
        "SLE AI Companion AI : sessions de pratique orale",
        "Tests de classement ELS/SLE",
        "Simulations d'examen oral",
      ],
    },
    cta: { en: "Explore Lingueefy", fr: "Découvrir Lingueefy" },
    link: "/lingueefy",
  },
  {
    id: "barholex",
    name: "Barholex Media",
    color: "#D4A853",
  image: "https://rusingacademy-cdn.b-cdn.net/images/generated/video-production.jpg",   pitch: {
      en: "Premium audiovisual production and performance coaching for bilingual executive presence.",
      fr: "Production audiovisuelle premium et coaching de performance pour une présence exécutive bilingue.",
    },
    bullets: {
      en: [
        "Executive presence coaching",
        "Turnkey podcast & video production",
        "Strategic communications & storytelling",
        "AI-assisted content workflows",
      ],
      fr: [
        "Coaching de présence exécutive",
        "Production balado & vidéo clé en main",
        "Communication stratégique & storytelling",
        "Flux de production assistés par IA",
      ],
    },
    cta: { en: "Explore Barholex", fr: "Découvrir Barholex" },
    link: "/barholex-media",
  },
];

export default function EcosystemLanding() {
  const { language, setLanguage } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("ecosystem-theme") as Theme | null;
    if (savedTheme && (savedTheme === "glass" || savedTheme === "light")) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when changed
  const toggleTheme = () => {
    const newTheme = theme === "glass" ? "light" : "glass";
    setTheme(newTheme);
    localStorage.setItem("ecosystem-theme", newTheme);
  };

  // Animated words for hero title
  const animatedWords = {
    en: ["Excellence", "Success", "Confidence", "Mastery"],
    fr: ["Excellence", "Réussite", "Confiance", "Maîtrise"],
  };
  const [wordIndex, setWordIndex] = useState(0);
  
  // Hero carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.en.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % heroCarouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % heroCarouselImages.length);
  const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + heroCarouselImages.length) % heroCarouselImages.length);

  const labels = {
    heroTitle: {
      en: "Choose Your Path to Bilingual",
      fr: "Choisissez votre parcours vers le bilinguisme",
    },
    heroTitleAnimated: animatedWords[language][wordIndex],
    heroSub: {
      en: "Built for Canadian public servants: SLE-focused learning, expert coaching, and premium media—so teams perform confidently in both official languages.",
      fr: "Conçu pour la réalité des fonctionnaires canadiens : apprentissage axé ELS/SLE, coaching d'experts et soutien média premium — pour une équipe confiante dans les deux langues officielles.",
    },
    cta1: { en: "Explore Ecosystem", fr: "Explorer l'écosystème" },
    cta2: { en: "Book a Diagnostic (30 min)", fr: "Réserver un diagnostic (30 min)" },
    footerBrand: "Rusinga International Consulting Ltd.",
    footerCopyright: "© 2026 Rusinga International Consulting Ltd. All rights reserved.",
    footerCopyrightFr: "© 2026 Rusinga International Consulting Ltd. Tous droits réservés.",
    ecosystem: { en: "Ecosystem", fr: "Écosystème" },
    legal: { en: "Legal", fr: "Légal" },
    contact: { en: "Contact", fr: "Contact" },
    privacy: { en: "Privacy Policy", fr: "Politique de confidentialité" },
    terms: { en: "Terms of Service", fr: "Conditions d'utilisation" },
    accessibility: { en: "Accessibility", fr: "Accessibilité" },
  };

  // Theme-based styles
  const themeStyles = {
    glass: {
      bg: "bg-[#080a14]",
      text: "text-white",
      textSecondary: "text-white/85",
      surface: "bg-white/5 backdrop-blur-xl border border-white/10",
      surfaceHover: "hover:bg-white/10",
      heroOverlay: "bg-gradient-to-br from-[#080a14]/95 to-[#080a14]/70",
      glow: "opacity-50",
    },
    light: {
      bg: "bg-[#F4F6F9]",
      text: "text-[#1A1F2E]",
      textSecondary: "text-[#5E6A83]",
      surface: "bg-white border border-[#E2E8F0] shadow-lg",
      surfaceHover: "hover:bg-[#F8FAFC]",
      heroOverlay: "bg-gradient-to-br from-white/95 to-white/80",
      glow: "opacity-15",
    },
  };

  const t = themeStyles[theme];

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-300 overflow-x-hidden`}>
      <SEO
        title="RusingAcademy Learning Ecosystem"
        description="Choose your path to bilingual excellence. SLE-focused learning, expert coaching, and premium media for Canadian public servants. Powered by Rusinga International Consulting Ltd."
        canonical="https://www.rusingacademy.ca"
      />
      {/* Ambient Background Glows */}
      <div
        className={`fixed top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full pointer-events-none z-0 ${t.glow}`}
        style={{ background: "radial-gradient(circle, #17E2C6, transparent 60%)" }}
      />
      <div
        className={`fixed bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full pointer-events-none z-0 ${t.glow}`}
        style={{ background: "radial-gradient(circle, #8B5CFF, transparent 60%)" }}
      />

      {/* Global Header is now rendered by EcosystemLayout wrapper */}

      {/* Hero Section - Gold Standard Pixel-Match */}
      <HeroGoldStandard />

      {/* Section 2: The Bilingual Excellence Trilemma */}
      <TrilemmaSection />

      {/* Ecosystem Cards */}
      <section id="ecosystem" className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-12 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`group relative flex flex-col rounded-3xl overflow-hidden ${t.surface}`}
              style={{ boxShadow: theme === "glass" ? "0 20px 40px rgba(0,0,0,0.4)" : "0 10px 30px rgba(0,0,0,0.08)" }}
            >
              {/* Top Color Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: brand.color }}
              />

              {/* Card Header Image */}
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${brand.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 z-10">
                  <span
                    className="px-4 py-2 rounded-lg text-white font-black text-sm tracking-wide shadow-lg"
                    style={{
                      background: brand.color,
                      boxShadow: `0 10px 20px -5px ${brand.color}`,
                    }}
                  >
                    {brand.name}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-8 flex flex-col gap-6">
                {/* Brand Logo */}
                <div className="flex items-center gap-2">
                  {brand.id === "rusingacademy" && <RusingAcademyLogo size={50} showText={false} theme={theme} />}
                  {brand.id === "lingueefy" && <LingeefyLogo size={50} showText={false} theme={theme} />}
                  {brand.id === "barholex" && <BarholexLogo size={50} showText={false} theme={theme} />}
                  <h3 
                    className="text-2xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}dd 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {brand.name}
                  </h3>
                </div>
                <p className={`${t.textSecondary} text-sm leading-relaxed`}>
                  {brand.pitch[language]}
                </p>

                {/* Features List */}
                <ul className="flex flex-col gap-4">
                  {brand.bullets[language].map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                        style={{
                          background: theme === "glass" ? "rgba(255,255,255,0.1)" : "#F8FAFC",
                          color: brand.color,
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </span>
                      <span className="font-medium text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer CTA */}
              <div className="p-8 pt-0">
                {brand.link.startsWith("http") ? (
                  <a href={brand.link} target="_blank" rel="noopener noreferrer" className="block">
                    <Button
                      className="w-full py-4 rounded-xl font-extrabold transition-all"
                      style={{
                        background: theme === "glass" ? "rgba(255,255,255,0.1)" : "#F8FAFC",
                        color: brand.color,
                        border: `1px solid ${brand.color}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = brand.color;
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme === "glass" ? "rgba(255,255,255,0.1)" : "#F8FAFC";
                        e.currentTarget.style.color = brand.color;
                      }}
                    >
                      {brand.cta[language]}
                    </Button>
                  </a>
                ) : (
                  <Link href={brand.link}>
                    <Button
                      className="w-full py-4 rounded-xl font-extrabold transition-all"
                      style={{
                        background: theme === "glass" ? "rgba(255,255,255,0.1)" : "#F8FAFC",
                        color: brand.color,
                        border: `1px solid ${brand.color}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = brand.color;
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme === "glass" ? "rgba(255,255,255,0.1)" : "#F8FAFC";
                        e.currentTarget.style.color = brand.color;
                      }}
                    >
                      {brand.cta[language]}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Real Training in Action - Proof Section */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">
            {language === "en" ? "Real Training in Action" : "Formation réelle sur le terrain"}
          </h3>
          <p className={`${t.textSecondary} max-w-2xl mx-auto`}>
            {language === "en" 
              ? "Proven results with Canadian public servants across federal departments"
              : "Résultats prouvés avec les fonctionnaires canadiens dans les ministères fédéraux"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Stats Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-2xl ${t.surface}`} style={{ boxShadow: theme === "glass" ? "0 15px 30px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E9B8A 0%, #17E2C6 100%)" }}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-black" style={{ background: "linear-gradient(135deg, #1E9B8A 0%, #17E2C6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>2,500+</div>
                  <div className={t.textSecondary}>
                    {language === "en" ? "Public Servants Trained" : "Fonctionnaires formés"}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${t.surface}`} style={{ boxShadow: theme === "glass" ? "0 15px 30px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)" }}>
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-black" style={{ background: "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>95%</div>
                  <div className={t.textSecondary}>
                    {language === "en" ? "SLE Success Rate" : "Taux de réussite ELS"}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${t.surface}`} style={{ boxShadow: theme === "glass" ? "0 15px 30px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4A853 0%, #F5D89A 100%)" }}>
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-black" style={{ background: "linear-gradient(135deg, #D4A853 0%, #F5D89A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>3-4×</div>
                  <div className={t.textSecondary}>
                    {language === "en" ? "Faster Learning Results" : "Résultats d'apprentissage plus rapides"}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: theme === "glass" ? "0 25px 50px rgba(0,0,0,0.4)" : "0 15px 40px rgba(0,0,0,0.1)" }}>
              <img 
                loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/hero/steven-class.jpeg" 
                alt={language === "en" ? "Real training session with Canadian public servants" : "Session de formation réelle avec des fonctionnaires canadiens"}
                className="w-full h-auto object-cover"
              />
              {/* Overlay with quote */}
              <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
                <p className="text-white text-lg font-medium italic">
                  {language === "en" 
                    ? "\"Our methodology combines structured curriculum with personalized coaching for maximum impact.\"" 
                    : "\"Notre méthodologie combine un curriculum structuré avec un coaching personnalisé pour un impact maximal.\""}
                </p>
                <p className="text-white/70 mt-2">
                  — Prof. Steven Barholere, {language === "en" ? "Founder" : "Fondateur"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">
            {language === "en" ? "What Our Clients Say" : "Ce que disent nos clients"}
          </h3>
          <p className={`${t.textSecondary} max-w-2xl mx-auto`}>
            {language === "en" 
              ? "Trusted by Canadian public servants and organizations across the country"
              : "Reconnu par les fonctionnaires et organisations canadiennes à travers le pays"}
          </p>
        </motion.div>

        {/* Scrolling Testimonials Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-4 sm:gap-6"
            animate={{ x: ["-0%", "-50%"] }}
            transition={{ 
              x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" }
            }}
          >
            {/* Duplicate testimonials for seamless loop */}
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-4 sm:gap-6 flex-shrink-0">
                {[
                  {
                    quote: {
                      en: "RusingAcademy's Path Series™ helped our team achieve their SLE goals in record time. The structured approach made all the difference.",
                      fr: "Le Path Series™ de RusingAcademy a aidé notre équipe à atteindre ses objectifs ELS en un temps record. L'approche structurée a fait toute la différence."
                    },
                    author: "Michael Anderson",
                    role: { en: "Director, HR Services", fr: "Directeur, Services RH" },
                    org: "Treasury Board Secretariat",
                    color: "#1E9B8A",
                    image: "https://rusingacademy-cdn.b-cdn.net/images/testimonials/testimonial-4.jpg"
                  },
                  {
                    quote: {
                      en: "Lingueefy's AI-powered coaching sessions are incredibly effective. SLE AI Companion AI provides personalized feedback that accelerates learning.",
                      fr: "Les séances de coaching IA de Lingueefy sont incroyablement efficaces. SLE AI Companion AI fournit des commentaires personnalisés qui accélèrent l'apprentissage."
                    },
                    author: "Sarah Mitchell",
                    role: { en: "Senior Policy Analyst", fr: "Analyste principale des politiques" },
                    org: "Global Affairs Canada",
                    color: "#17E2C6",
                    image: "https://rusingacademy-cdn.b-cdn.net/images/testimonials/testimonial-2.jpg"
                  },
                  {
                    quote: {
                      en: "Barholex Media transformed our internal communications with professional podcast production. Our engagement metrics have never been higher.",
                      fr: "Barholex Media a transformé nos communications internes avec une production de balados professionnelle. Nos métriques d'engagement n'ont jamais été aussi élevées."
                    },
                    author: "David Thompson",
                    role: { en: "Communications Manager", fr: "Gestionnaire des communications" },
                    org: "Health Canada",
                    color: "#D4A853",
                    image: "https://rusingacademy-cdn.b-cdn.net/images/testimonials/testimonial-6.jpg"
                  },
                  {
                    quote: {
                      en: "The bilingual training program exceeded our expectations. Our team's confidence in both official languages has improved dramatically.",
                      fr: "Le programme de formation bilingue a dépassé nos attentes. La confiance de notre équipe dans les deux langues officielles s'est améliorée de façon spectaculaire."
                    },
                    author: "Jennifer Williams",
                    role: { en: "Deputy Director", fr: "Directrice adjointe" },
                    org: "Employment and Social Development Canada",
                    color: "#1E9B8A",
                    image: "https://rusingacademy-cdn.b-cdn.net/images/testimonials/testimonial-1.jpg"
                  },
                  {
                    quote: {
                      en: "SLE AI Companion AI helped me pass my CBC oral exam on the first try. The practice simulations were incredibly realistic and helpful.",
                      fr: "SLE AI Companion AI m'a aidé à réussir mon examen oral CBC du premier coup. Les simulations de pratique étaient incroyablement réalistes et utiles."
                    },
                    author: "Robert Chen",
                    role: { en: "Program Officer", fr: "Agent de programme" },
                    org: "Canada Revenue Agency",
                    color: "#17E2C6",
                    image: "https://rusingacademy-cdn.b-cdn.net/images/testimonials/testimonial-3.jpg"
                  },
                  {
                    quote: {
                      en: "The executive presence coaching from Barholex Media gave me the confidence to lead bilingual town halls. Highly recommended!",
                      fr: "Le coaching de présence exécutive de Barholex Media m'a donné la confiance pour diriger des assemblées bilingues. Fortement recommandé!"
                    },
                    author: "Amanda Foster",
                    role: { en: "Executive Director", fr: "Directrice exécutive" },
                    org: "Innovation, Science and Economic Development",
                    color: "#D4A853",
                    image: "https://rusingacademy-cdn.b-cdn.net/images/testimonials/testimonial-5.jpg"
                  }
                ].map((testimonial, index) => (
                  <div
                    key={`${setIndex}-${index}`}
                    className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl ${t.surface} w-[280px] sm:w-[350px] flex-shrink-0`}
                    style={{ boxShadow: theme === "glass" ? "0 15px 30px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.06)" }}
                  >
                    {/* Quote Mark */}
                    <div 
                      className="absolute top-3 right-3 text-5xl font-serif opacity-20"
                      style={{ color: testimonial.color }}
                    >
                      "
                    </div>
                    
                    {/* Quote */}
                    <p className={`${t.textSecondary} text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 relative z-10 line-clamp-4`}>
                      "{testimonial.quote[language]}"
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          loading="lazy" src={testimonial.image} 
                          alt={testimonial.author}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `<div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm" style="background: linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}dd)">${testimonial.author.split(' ').map(n => n[0]).join('')}</div>`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{testimonial.author}</p>
                        <p className={`${t.textSecondary} text-xs`}>
                          {testimonial.role[language]}
                        </p>
                        <p className={`${t.textSecondary} text-xs opacity-70`}>
                          {testimonial.org}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
          
          {/* Gradient overlays for fade effect */}
          <div className={`absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r ${theme === "glass" ? "from-[#080a14]" : "from-[#F4F6F9]"} to-transparent z-10 pointer-events-none`} />
          <div className={`absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l ${theme === "glass" ? "from-[#080a14]" : "from-[#F4F6F9]"} to-transparent z-10 pointer-events-none`} />
        </div>
      </section>

      {/* SLE AI Companion AI Section */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl ${t.surface}`}
          style={{ boxShadow: theme === "glass" ? "0 20px 40px rgba(0,0,0,0.4)" : "0 10px 30px rgba(0,0,0,0.08)" }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#17E2C6]/20 via-transparent to-[#8B5CFF]/20" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8 md:p-12">
            {/* Left - SLE AI Companion Info */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#17E2C6]/20 text-[#17E2C6]">
                  AI-Powered
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CFF]/20 text-[#8B5CFF]">
                  24/7 Available
                </span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">
                <span style={{ color: "#17E2C6" }}>SLE AI Companion</span>{" "}
                <span className={t.text}>AI</span>
              </h3>
              
              <p className={`${t.textSecondary} text-lg mb-6 leading-relaxed`}>
                {language === "en" 
                  ? "Your personal AI language coach, available anytime. Practice speaking, prepare for SLE exams, and build confidence with realistic simulations."
                  : "Votre coach linguistique IA personnel, disponible à tout moment. Pratiquez l'oral, préparez vos examens ELS et gagnez en confiance avec des simulations réalistes."}
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: "🎙️", label: { en: "Voice Practice Sessions", fr: "Sessions de pratique orale" } },
                  { icon: "📊", label: { en: "SLE Placement Tests", fr: "Tests de classement ELS" } },
                  { icon: "🎯", label: { en: "Oral Exam Simulations", fr: "Simulations d'examen oral" } },
                  { icon: "💬", label: { en: "Instant Feedback", fr: "Rétroaction instantanée" } },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="font-medium text-sm">{feature.label[language]}</span>
                  </div>
                ))}
              </div>
              
              <Link href="/ecosystem">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#17E2C6] to-[#0d9488] text-white border-0 px-8 py-6 text-base font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform"
                  style={{ boxShadow: "0 10px 25px -5px rgba(23, 226, 198, 0.5)" }}
                >
                  {language === "en" ? "Try SLE AI Companion AI" : "Essayer SLE AI Companion AI"}
                  <MessageCircle className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            
            {/* Right - SLE AI Companion Avatar/Visual */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="relative"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                {/* Glowing circle background */}
                <div 
                  className="absolute inset-0 rounded-full blur-3xl opacity-30"
                  style={{ background: "radial-gradient(circle, #17E2C6, #8B5CFF)" }}
                />
                
                {/* Avatar container */}
                <div 
                  className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full ${t.surface} flex items-center justify-center`}
                  style={{ 
                    boxShadow: theme === "glass" 
                      ? "0 0 60px rgba(23, 226, 198, 0.3), inset 0 0 30px rgba(23, 226, 198, 0.1)" 
                      : "0 20px 40px rgba(0,0,0,0.1)" 
                  }}
                >
                  {/* SLE AI Companion Image or Placeholder */}
                  <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden">
                    <img 
                      loading="lazy" src="/coaches/steven-profile.jpg" 
                      alt="SLE AI Companion AI"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full bg-gradient-to-br from-[#17E2C6] to-[#0d9488] flex items-center justify-center">
                      <span className="text-6xl md:text-7xl">🤖</span>
                    </div>
                  </div>
                  
                  {/* Animated ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#17E2C6]/30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  />
                </div>
                
                {/* Floating chat bubbles */}
                <motion.div
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl bg-[#17E2C6] text-white text-sm font-medium shadow-lg"
                  animate={{ y: [0, -5, 0], rotate: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                >
                  {language === "en" ? "Hello! Ready to practice?" : "Bonjour! Prêt à pratiquer?"}
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-2 -left-4 px-4 py-2 rounded-2xl bg-[#8B5CFF] text-white text-sm font-medium shadow-lg"
                  animate={{ y: [0, 5, 0], rotate: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
                >
                  {language === "en" ? "Let's ace your SLE!" : "Réussissons votre ELS!"}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted by Public Servants - Real Testimonials */}
      <TrustedByPublicServants />

      {/* They Trusted Us - Government Logos */}
      <TheyTrustedUs />

      {/* Meet Our Experts */}
      <MeetOurExperts />

      {/* Learning Capsules - Micro Lessons */}
      <LearningCapsules />

      {/* YouTube Videos & Podcasts */}
      <YouTubeVideos />

      {/* ProofGallery - Video Testimonials */}
      <ProofGallery />

      {/* Footer - Institutional */}
      <FooterInstitutional />
    </div>
  );
}
