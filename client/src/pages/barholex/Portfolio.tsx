// Header removed - using EcosystemLayout sub-header instead
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Play,
  Filter,
  Video,
  Monitor,
  PenTool,
  GraduationCap,
  Award,
  Users,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function BarholexPortfolio() {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const FILTERS = [
    { id: "all", labelEn: "All Projects", labelFr: "Tous les projets", icon: Sparkles },
    { id: "video", labelEn: "Video", labelFr: "Vidéo", icon: Video },
    { id: "web", labelEn: "Web & Apps", labelFr: "Web & Apps", icon: Monitor },
    { id: "branding", labelEn: "Branding", labelFr: "Image de marque", icon: PenTool },
    { id: "edtech", labelEn: "EdTech", labelFr: "EdTech", icon: GraduationCap },
  ];

  const PROJECTS = [
    {
      id: 1,
      titleEn: "Lingueefy Learning Platform",
      titleFr: "Plateforme d'apprentissage Lingueefy",
      categoryEn: "EdTech Platform",
      categoryFr: "Plateforme EdTech",
      descEn: "A comprehensive bilingual learning platform with AI-powered coaching and SLE exam preparation.",
      descFr: "Une plateforme d'apprentissage bilingue complète avec coaching alimenté par l'IA et préparation aux examens ELS.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      filter: "edtech",
      featured: true,
      clientEn: "RusingAcademy",
      clientFr: "RusingAcademy",
      yearEn: "2024",
      yearFr: "2024",
      resultsEn: ["97% student satisfaction", "50% faster learning", "10,000+ active users"],
      resultsFr: ["97% satisfaction étudiante", "50% apprentissage plus rapide", "10 000+ utilisateurs actifs"],
    },
    {
      id: 2,
      titleEn: "Government Training Videos",
      titleFr: "Vidéos de formation gouvernementale",
      categoryEn: "Video Production",
      categoryFr: "Production vidéo",
      descEn: "Series of bilingual training videos for federal employee onboarding programs.",
      descFr: "Série de vidéos de formation bilingues pour les programmes d'intégration des employés fédéraux.",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
      filter: "video",
      featured: true,
      clientEn: "Government of Canada",
      clientFr: "Gouvernement du Canada",
      yearEn: "2024",
      yearFr: "2024",
      resultsEn: ["40% reduced training time", "Bilingual compliance", "5,000+ views"],
      resultsFr: ["40% réduction du temps de formation", "Conformité bilingue", "5 000+ vues"],
    },
    {
      id: 3,
      titleEn: "Language School Rebrand",
      titleFr: "Refonte de l'image d'une école de langues",
      categoryEn: "Brand Identity",
      categoryFr: "Identité de marque",
      descEn: "Complete brand refresh including logo, visual identity, and marketing materials.",
      descFr: "Refonte complète de la marque incluant logo, identité visuelle et matériel marketing.",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      filter: "branding",
      featured: false,
      clientEn: "Alliance Française",
      clientFr: "Alliance Française",
      yearEn: "2023",
      yearFr: "2023",
      resultsEn: ["Brand recognition +60%", "Modern visual identity", "Consistent messaging"],
      resultsFr: ["Reconnaissance +60%", "Identité visuelle moderne", "Message cohérent"],
    },
    {
      id: 4,
      titleEn: "Mobile Learning App",
      titleFr: "Application d'apprentissage mobile",
      categoryEn: "App Development",
      categoryFr: "Développement d'application",
      descEn: "Cross-platform mobile app for on-the-go language learning with offline capabilities.",
      descFr: "Application mobile multiplateforme pour l'apprentissage des langues en déplacement avec capacités hors ligne.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
      filter: "web",
      featured: true,
      clientEn: "LRDG",
      clientFr: "LRDG",
      yearEn: "2024",
      yearFr: "2024",
      resultsEn: ["4.8★ App Store rating", "25,000+ downloads", "Offline learning enabled"],
      resultsFr: ["4.8★ sur App Store", "25 000+ téléchargements", "Apprentissage hors ligne"],
    },
    {
      id: 5,
      titleEn: "Documentary: Bilingual Canada",
      titleFr: "Documentaire: Canada bilingue",
      categoryEn: "Documentary",
      categoryFr: "Documentaire",
      descEn: "Award-winning documentary exploring the history and future of bilingualism in Canada.",
      descFr: "Documentaire primé explorant l'histoire et l'avenir du bilinguisme au Canada.",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
      filter: "video",
      featured: false,
      clientEn: "Canadian Heritage",
      clientFr: "Patrimoine canadien",
      yearEn: "2023",
      yearFr: "2023",
      resultsEn: ["Festival selection", "National broadcast", "100,000+ viewers"],
      resultsFr: ["Sélection festival", "Diffusion nationale", "100 000+ spectateurs"],
    },
    {
      id: 6,
      titleEn: "Corporate Training Portal",
      titleFr: "Portail de formation corporative",
      categoryEn: "Web Platform",
      categoryFr: "Plateforme web",
      descEn: "Custom LMS for a Fortune 500 company with advanced analytics and reporting.",
      descFr: "LMS personnalisé pour une entreprise Fortune 500 avec analytique avancée et rapports.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
      filter: "web",
      featured: false,
      clientEn: "Enterprise Client",
      clientFr: "Client entreprise",
      yearEn: "2024",
      yearFr: "2024",
      resultsEn: ["80% completion rate", "Real-time analytics", "Multi-language support"],
      resultsFr: ["80% taux de complétion", "Analytique temps réel", "Support multilingue"],
    },
  ];

  const TESTIMONIALS = [
    {
      quoteEn: "Barholex Media transformed our training program. The quality of their video production exceeded our expectations, and the results speak for themselves.",
      quoteFr: "Barholex Media a transformé notre programme de formation. La qualité de leur production vidéo a dépassé nos attentes, et les résultats parlent d'eux-mêmes.",
      authorEn: "Marie-Claire Dubois",
      authorFr: "Marie-Claire Dubois",
      roleEn: "Director of Training, Government of Canada",
      roleFr: "Directrice de la formation, Gouvernement du Canada",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    },
    {
      quoteEn: "The Lingueefy platform they built for us has revolutionized how our students learn. The AI coaching feature is a game-changer.",
      quoteFr: "La plateforme Lingueefy qu'ils ont construite pour nous a révolutionné la façon dont nos étudiants apprennent. La fonction de coaching IA change la donne.",
      authorEn: "Steven Barholere",
      authorFr: "Steven Barholere",
      roleEn: "Founder, RusingAcademy",
      roleFr: "Fondateur, RusingAcademy",
      image: "https://rusingacademy-cdn.b-cdn.net/images/coaches/steven-barholere.webp",
    },
    {
      quoteEn: "Professional, creative, and always on time. Barholex Media is our go-to partner for all EdTech projects.",
      quoteFr: "Professionnel, créatif et toujours à temps. Barholex Media est notre partenaire de choix pour tous les projets EdTech.",
      authorEn: "Jean-Pierre Tremblay",
      authorFr: "Jean-Pierre Tremblay",
      roleEn: "CEO, Language Learning Inc.",
      roleFr: "PDG, Language Learning Inc.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    },
  ];

  const filteredProjects = activeFilter === "all" 
    ? PROJECTS 
    : PROJECTS.filter(p => p.filter === activeFilter);

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      
      <main id="main-content">
        {/* Hero Section - Premium Design */}
        <section className="relative pt-20 pb-16 px-4 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E7F2F2]/10 rounded-full blur-[120px]" />
          </div>
          
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-6"
              >
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-medium">
                  <Award className="w-4 h-4" />
                  {language === "en" ? "Award-Winning Work" : "Travaux primés"}
                </span>
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              >
                <span className="text-white">{language === "en" ? "Our " : "Notre "}</span>
                <span className="bg-gradient-to-r from-[#D4AF37] via-[#F7DC6F] to-[#D4AF37] bg-clip-text text-transparent">
                  {language === "en" ? "Portfolio" : "Portfolio"}
                </span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8"
              >
                {language === "en"
                  ? "Explore our work across video production, web development, branding, and EdTech solutions. Each project represents our commitment to excellence and innovation."
                  : "Explorez nos travaux en production vidéo, développement web, image de marque et solutions EdTech. Chaque projet représente notre engagement envers l'excellence et l'innovation."
                }
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-8"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#D4AF37]">150+</div>
                  <div className="text-sm text-gray-300">{language === "en" ? "Projects" : "Projets"}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#D4AF37]">50+</div>
                  <div className="text-sm text-gray-300">{language === "en" ? "Clients" : "Clients"}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#D4AF37]">15</div>
                  <div className="text-sm text-gray-300">{language === "en" ? "Awards" : "Prix"}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Filters - Premium Design */}
        <section className="py-8 px-4 sticky top-0 z-20 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  aria-pressed={activeFilter === filter.id}
                  aria-label={`Filter by ${language === "en" ? filter.labelEn : filter.labelFr}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeFilter === filter.id
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black shadow-lg shadow-[#D4AF37]/20"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <filter.icon className="w-4 h-4" aria-hidden="true" />
                  {language === "en" ? filter.labelEn : filter.labelFr}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid - Premium Cards */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
                      project.featured ? "md:col-span-2 md:row-span-2" : ""
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    {/* Image */}
                    <img 
                      loading="lazy" src={project.image} 
                      alt={language === "en" ? project.titleEn : project.titleFr}
                      className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                        project.featured ? "h-[400px] md:h-full" : "h-72"
                      }`}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-95 transition-all duration-300" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      {/* Category Badge */}
                      <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium mb-3">
                        {language === "en" ? project.categoryEn : project.categoryFr}
                      </span>
                      
                      {/* Title */}
                      <h3 className={`font-bold text-white mb-2 ${project.featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
                        {language === "en" ? project.titleEn : project.titleFr}
                      </h3>
                      
                      {/* Description */}
                      <p className={`text-gray-300 mb-4 ${project.featured ? "text-base" : "text-sm"} line-clamp-2`}>
                        {language === "en" ? project.descEn : project.descFr}
                      </p>
                      
                      {/* Client & Year */}
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                        <span>{language === "en" ? project.clientEn : project.clientFr}</span>
                        <span>•</span>
                        <span>{language === "en" ? project.yearEn : project.yearFr}</span>
                      </div>
                      
                      {/* CTA */}
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <Button size="sm" className="bg-[#D4AF37] hover:bg-[#B8962E] text-black rounded-full">
                          {language === "en" ? "View Details" : "Voir les détails"}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black text-xs font-bold flex items-center gap-1.5">
                        <Star className="w-3 h-3" />
                        {language === "en" ? "FEATURED" : "EN VEDETTE"}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-900/50 to-black relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium mb-4">
                {language === "en" ? "Client Testimonials" : "Témoignages clients"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                {language === "en" ? "What Our Clients Say" : "Ce que disent nos clients"}
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-sm"
                  >
                    <Quote className="w-12 h-12 text-[#D4AF37]/30 mb-6" />
                    
                    <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">
                      "{language === "en" ? TESTIMONIALS[testimonialIndex].quoteEn : TESTIMONIALS[testimonialIndex].quoteFr}"
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <img
                        loading="lazy" src={TESTIMONIALS[testimonialIndex].image}
                        alt={TESTIMONIALS[testimonialIndex].authorEn}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]"
                      />
                      <div>
                        <div className="font-bold text-white">
                          {language === "en" ? TESTIMONIALS[testimonialIndex].authorEn : TESTIMONIALS[testimonialIndex].authorFr}
                        </div>
                        <div className="text-sm text-gray-300">
                          {language === "en" ? TESTIMONIALS[testimonialIndex].roleEn : TESTIMONIALS[testimonialIndex].roleFr}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={prevTestimonial}
                    aria-label="Previous testimonial"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {TESTIMONIALS.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setTestimonialIndex(index)}
                        aria-label={`Go to testimonial ${index + 1}`}
                        aria-current={index === testimonialIndex ? "true" : undefined}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === testimonialIndex ? "w-8 bg-[#D4AF37]" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextTestimonial}
                    aria-label="Next testimonial"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#B8962E]" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%)] bg-[size:20px_20px]" />
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center text-black">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {language === "en" ? "Have a Project in Mind?" : "Vous avez un projet en tête?"}
              </h2>
              <p className="text-xl text-black/80 mb-10">
                {language === "en"
                  ? "Let's create something amazing together. Your vision, our expertise."
                  : "Créons quelque chose d'incroyable ensemble. Votre vision, notre expertise."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/barholex/contact">
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 h-14 text-lg font-semibold bg-black text-[#D4AF37] hover:bg-gray-900"
                  >
                    {language === "en" ? "Start a Project" : "Démarrer un projet"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/barholex/services">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="rounded-full px-8 h-14 text-lg font-semibold border-black/30 text-black hover:bg-black/10"
                  >
                    {language === "en" ? "View Services" : "Voir les services"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
