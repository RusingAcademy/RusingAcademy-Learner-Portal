// Header removed - using EcosystemLayout sub-header instead
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Clapperboard,
  ArrowRight,
  Play,
  Sparkles,
  Palette,
  Video,
  Mic,
  Globe,
  Award,
  CheckCircle2,
  Users,
  Zap,
  Camera,
  Film,
  Headphones,
  PenTool,
  Monitor,
  Smartphone,
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

export default function BarholexHome() {
  const { language } = useLanguage();

  const projects = useCounter(200, 2000);
  const clients = useCounter(75, 1500);
  const awards = useCounter(12, 1800);
  const years = useCounter(8, 1500);

  const SERVICES = [
    {
      icon: Video,
      titleEn: "Video Production",
      titleFr: "Production vidéo",
      descEn: "Corporate videos, documentaries, promotional content, and training materials",
      descFr: "Vidéos corporatives, documentaires, contenu promotionnel et matériel de formation",
    },
    {
      icon: Mic,
      titleEn: "Audio Production",
      titleFr: "Production audio",
      descEn: "Podcasts, voiceovers, sound design, and multilingual dubbing",
      descFr: "Podcasts, voix hors champ, conception sonore et doublage multilingue",
    },
    {
      icon: PenTool,
      titleEn: "Graphic Design",
      titleFr: "Design graphique",
      descEn: "Brand identity, marketing materials, UI/UX design, and illustrations",
      descFr: "Identité de marque, matériel marketing, design UI/UX et illustrations",
    },
    {
      icon: Monitor,
      titleEn: "Web Development",
      titleFr: "Développement web",
      descEn: "Custom websites, web applications, e-learning platforms, and mobile apps",
      descFr: "Sites web personnalisés, applications web, plateformes e-learning et applications mobiles",
    },
    {
      icon: Globe,
      titleEn: "Localization",
      titleFr: "Localisation",
      descEn: "Translation, cultural adaptation, and multilingual content creation",
      descFr: "Traduction, adaptation culturelle et création de contenu multilingue",
    },
    {
      icon: Sparkles,
      titleEn: "AI Solutions",
      titleFr: "Solutions IA",
      descEn: "AI-powered content generation, automation, and intelligent learning systems",
      descFr: "Génération de contenu par IA, automatisation et systèmes d'apprentissage intelligents",
    },
  ];

  const PORTFOLIO = [
    {
      titleEn: "Government Training Platform",
      titleFr: "Plateforme de formation gouvernementale",
      categoryEn: "EdTech",
      categoryFr: "EdTech",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
    },
    {
      titleEn: "Corporate Brand Identity",
      titleFr: "Identité de marque corporative",
      categoryEn: "Branding",
      categoryFr: "Image de marque",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    },
    {
      titleEn: "Documentary Series",
      titleFr: "Série documentaire",
      categoryEn: "Video",
      categoryFr: "Vidéo",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
    },
    {
      titleEn: "Mobile Learning App",
      titleFr: "Application d'apprentissage mobile",
      categoryEn: "Development",
      categoryFr: "Développement",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    },
  ];

  const CLIENTS = [
    { nameEn: "Federal Government", nameFr: "Gouvernement fédéral" },
    { nameEn: "Provincial Agencies", nameFr: "Agences provinciales" },
    { nameEn: "Language Schools", nameFr: "Écoles de langues" },
    { nameEn: "EdTech Startups", nameFr: "Startups EdTech" },
    { nameEn: "Non-Profits", nameFr: "OSBL" },
    { nameEn: "Corporate Training", nameFr: "Formation corporative" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <main id="main-content">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-4 relative overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#E7F2F2]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white">
                  <Clapperboard className="w-4 h-4 text-[#D4AF37]" />
                  {language === "en" ? "Creative Production & EdTech" : "Production créative & EdTech"}
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                {language === "en" ? "Where Creativity Meets" : "Là où la créativité rencontre"}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#145A5B]">
                  {language === "en" ? "Innovation" : "l'innovation"}
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                {language === "en"
                  ? "Full-service creative agency specializing in EdTech solutions, multimedia production, and digital innovation for language learning organizations."
                  : "Agence créative à service complet spécialisée dans les solutions EdTech, la production multimédia et l'innovation numérique pour les organisations d'apprentissage des langues."
                }
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
                <Link href="/barholex/contact">
                  <Button size="lg" className="bg-[#D4AF37] hover:bg-[#B8962E] text-black gap-2 px-8 h-12 text-base shadow-lg shadow-[#D4AF37]/20 rounded-full font-semibold">
                    {language === "en" ? "Start a Project" : "Démarrer un projet"}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/barholex/portfolio">
                  <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base border-2 border-white/30 text-white hover:bg-white/10 rounded-full">
                    <Play className="w-5 h-5" />
                    {language === "en" ? "View Portfolio" : "Voir le portfolio"}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 border-y border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div ref={projects.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-1">{projects.count}+</div>
                <div className="text-sm text-gray-400">{language === "en" ? "Projects Delivered" : "Projets livrés"}</div>
              </div>
              <div ref={clients.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-1">{clients.count}+</div>
                <div className="text-sm text-gray-400">{language === "en" ? "Happy Clients" : "Clients satisfaits"}</div>
              </div>
              <div ref={awards.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-1">{awards.count}</div>
                <div className="text-sm text-gray-400">{language === "en" ? "Industry Awards" : "Prix de l'industrie"}</div>
              </div>
              <div ref={years.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-1">{years.count}+</div>
                <div className="text-sm text-gray-400">{language === "en" ? "Years Experience" : "Années d'expérience"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === "en" ? "Our Services" : "Nos services"}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {language === "en"
                  ? "Comprehensive creative solutions tailored for the education and language learning industry"
                  : "Solutions créatives complètes adaptées à l'industrie de l'éducation et de l'apprentissage des langues"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {SERVICES.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                    <service.icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-bold text-white mb-2">
                    {language === "en" ? service.titleEn : service.titleFr}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {language === "en" ? service.descEn : service.descFr}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Preview */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-black">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === "en" ? "Featured Work" : "Travaux en vedette"}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {language === "en"
                  ? "A selection of our recent projects across various industries"
                  : "Une sélection de nos projets récents dans diverses industries"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {PORTFOLIO.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group rounded-2xl overflow-hidden"
                >
                  <img 
                    loading="lazy" src={item.image} 
                    alt={language === "en" ? item.titleEn : item.titleFr}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <span className="text-xs text-[#D4AF37] font-medium mb-1">
                      {language === "en" ? item.categoryEn : item.categoryFr}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {language === "en" ? item.titleEn : item.titleFr}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/barholex/portfolio">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
                  {language === "en" ? "View All Projects" : "Voir tous les projets"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Clients Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === "en" ? "Trusted By" : "Ils nous font confiance"}
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {CLIENTS.map((client, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm"
                >
                  {language === "en" ? client.nameEn : client.nameFr}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-[#D4AF37] to-[#B8962E]">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center text-black">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {language === "en" ? "Ready to Create Something Amazing?" : "Prêt à créer quelque chose d'incroyable?"}
              </h2>
              <p className="text-xl text-black/80 mb-10">
                {language === "en"
                  ? "Let's discuss your next project and bring your vision to life"
                  : "Discutons de votre prochain projet et donnons vie à votre vision"
                }
              </p>
              <Link href="/barholex/contact">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 h-14 text-lg font-semibold bg-black text-[#D4AF37] hover:bg-gray-900"
                >
                  {language === "en" ? "Get in Touch" : "Nous contacter"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
