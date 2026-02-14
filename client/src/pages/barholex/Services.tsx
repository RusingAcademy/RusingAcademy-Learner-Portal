// Header removed - using EcosystemLayout sub-header instead
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Video,
  Mic,
  PenTool,
  Monitor,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  Clock,
  Award,
  Play,
  Building2,
  GraduationCap,
  TrendingUp,
  Shield,
  Star,
} from "lucide-react";

export default function BarholexServices() {
  const { language } = useLanguage();
  const [activeService, setActiveService] = useState(0);

  const SERVICES = [
    {
      icon: Video,
      titleEn: "Video Production",
      titleFr: "Production vidéo",
      descEn: "From concept to final cut, we create compelling video content that engages and educates.",
      descFr: "Du concept au montage final, nous créons du contenu vidéo captivant qui engage et éduque.",
      featuresEn: [
        "Corporate videos & documentaries",
        "Training & educational content",
        "Promotional & marketing videos",
        "Animation & motion graphics",
        "Live streaming & webinars",
      ],
      featuresFr: [
        "Vidéos corporatives et documentaires",
        "Contenu de formation et éducatif",
        "Vidéos promotionnelles et marketing",
        "Animation et motion graphics",
        "Diffusion en direct et webinaires",
      ],
      color: "#E07B39",
      forEn: "Government departments, language schools, corporate training teams",
      forFr: "Ministères, écoles de langues, équipes de formation corporative",
      outcomeEn: "Engaging video content that improves learning retention by up to 65%",
      outcomeFr: "Contenu vidéo engageant qui améliore la rétention d'apprentissage jusqu'à 65%",
    },
    {
      icon: Mic,
      titleEn: "Audio Production",
      titleFr: "Production audio",
      descEn: "Professional audio services for podcasts, voiceovers, and multilingual content.",
      descFr: "Services audio professionnels pour podcasts, voix hors champ et contenu multilingue.",
      featuresEn: [
        "Podcast production & editing",
        "Professional voiceovers",
        "Sound design & mixing",
        "Multilingual dubbing",
        "Music composition",
      ],
      featuresFr: [
        "Production et montage de podcasts",
        "Voix hors champ professionnelles",
        "Conception sonore et mixage",
        "Doublage multilingue",
        "Composition musicale",
      ],
      color: "#2DD4BF",
      forEn: "Podcast creators, e-learning platforms, multilingual organizations",
      forFr: "Créateurs de podcasts, plateformes e-learning, organisations multilingues",
      outcomeEn: "Crystal-clear audio that enhances comprehension and engagement",
      outcomeFr: "Audio cristallin qui améliore la compréhension et l'engagement",
    },
    {
      icon: PenTool,
      titleEn: "Graphic Design",
      titleFr: "Design graphique",
      descEn: "Visual identity and design solutions that communicate your brand's message.",
      descFr: "Solutions d'identité visuelle et de design qui communiquent le message de votre marque.",
      featuresEn: [
        "Brand identity & logos",
        "Marketing collateral",
        "UI/UX design",
        "Infographics & illustrations",
        "Print & digital materials",
      ],
      featuresFr: [
        "Identité de marque et logos",
        "Matériel marketing",
        "Design UI/UX",
        "Infographies et illustrations",
        "Matériel imprimé et numérique",
      ],
      color: "#D4AF37",
      forEn: "Startups, educational institutions, government agencies",
      forFr: "Startups, institutions éducatives, agences gouvernementales",
      outcomeEn: "Memorable visual identity that builds trust and recognition",
      outcomeFr: "Identité visuelle mémorable qui inspire confiance et reconnaissance",
    },
    {
      icon: Monitor,
      titleEn: "Web Development",
      titleFr: "Développement web",
      descEn: "Custom digital solutions from websites to complex learning platforms.",
      descFr: "Solutions numériques personnalisées, des sites web aux plateformes d'apprentissage complexes.",
      featuresEn: [
        "Custom websites & web apps",
        "E-learning platforms",
        "Mobile applications",
        "CMS & content management",
        "API integrations",
      ],
      featuresFr: [
        "Sites web et applications personnalisés",
        "Plateformes e-learning",
        "Applications mobiles",
        "CMS et gestion de contenu",
        "Intégrations API",
      ],
      color: "#8B5CF6",
      forEn: "Language schools, training organizations, EdTech startups",
      forFr: "Écoles de langues, organisations de formation, startups EdTech",
      outcomeEn: "Scalable digital platforms that grow with your organization",
      outcomeFr: "Plateformes numériques évolutives qui grandissent avec votre organisation",
    },
    {
      icon: Globe,
      titleEn: "Localization",
      titleFr: "Localisation",
      descEn: "Expert translation and cultural adaptation for global audiences.",
      descFr: "Traduction experte et adaptation culturelle pour des audiences mondiales.",
      featuresEn: [
        "Professional translation",
        "Cultural adaptation",
        "Multilingual content creation",
        "Subtitling & captioning",
        "Transcreation services",
      ],
      featuresFr: [
        "Traduction professionnelle",
        "Adaptation culturelle",
        "Création de contenu multilingue",
        "Sous-titrage et légendes",
        "Services de transcréation",
      ],
      color: "#EC4899",
      forEn: "Federal departments, international organizations, global brands",
      forFr: "Ministères fédéraux, organisations internationales, marques mondiales",
      outcomeEn: "Culturally authentic content that resonates with diverse audiences",
      outcomeFr: "Contenu culturellement authentique qui résonne avec des audiences diverses",
    },
    {
      icon: Sparkles,
      titleEn: "AI Solutions",
      titleFr: "Solutions IA",
      descEn: "Cutting-edge AI-powered tools for content creation and learning.",
      descFr: "Outils de pointe alimentés par l'IA pour la création de contenu et l'apprentissage.",
      featuresEn: [
        "AI content generation",
        "Intelligent tutoring systems",
        "Automated assessments",
        "Speech recognition",
        "Personalized learning paths",
      ],
      featuresFr: [
        "Génération de contenu par IA",
        "Systèmes de tutorat intelligents",
        "Évaluations automatisées",
        "Reconnaissance vocale",
        "Parcours d'apprentissage personnalisés",
      ],
      color: "#06B6D4",
      forEn: "Forward-thinking organizations ready to embrace AI innovation",
      forFr: "Organisations visionnaires prêtes à adopter l'innovation IA",
      outcomeEn: "Intelligent systems that personalize and scale learning experiences",
      outcomeFr: "Systèmes intelligents qui personnalisent et mettent à l'échelle les expériences d'apprentissage",
    },
  ];

  const PROCESS = [
    {
      stepEn: "Discovery",
      stepFr: "Découverte",
      descEn: "We learn about your goals, audience, and requirements",
      descFr: "Nous découvrons vos objectifs, votre audience et vos besoins",
      icon: Users,
    },
    {
      stepEn: "Strategy",
      stepFr: "Stratégie",
      descEn: "We develop a tailored approach and project plan",
      descFr: "Nous développons une approche sur mesure et un plan de projet",
      icon: TrendingUp,
    },
    {
      stepEn: "Creation",
      stepFr: "Création",
      descEn: "Our team brings your vision to life with expert execution",
      descFr: "Notre équipe donne vie à votre vision avec une exécution experte",
      icon: Sparkles,
    },
    {
      stepEn: "Delivery",
      stepFr: "Livraison",
      descEn: "We deliver polished results and provide ongoing support",
      descFr: "Nous livrons des résultats soignés et offrons un support continu",
      icon: Award,
    },
  ];

  const STATS = [
    { value: "150+", labelEn: "Projects Delivered", labelFr: "Projets livrés" },
    { value: "50+", labelEn: "Happy Clients", labelFr: "Clients satisfaits" },
    { value: "15+", labelEn: "Years Experience", labelFr: "Années d'expérience" },
    { value: "98%", labelEn: "Client Satisfaction", labelFr: "Satisfaction client" },
  ];

  const CLIENTS = [
    { nameEn: "Government of Canada", nameFr: "Gouvernement du Canada", icon: Building2 },
    { nameEn: "Language Schools", nameFr: "Écoles de langues", icon: GraduationCap },
    { nameEn: "EdTech Startups", nameFr: "Startups EdTech", icon: TrendingUp },
    { nameEn: "Corporate Training", nameFr: "Formation corporative", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      
      <main id="main-content">
        {/* Hero Section - Premium Design */}
        <section className="relative pt-20 pb-24 px-4 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E7F2F2]/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#D4AF37]/5 to-transparent rounded-full" />
          </div>
          
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-8"
              >
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-medium">
                  <Zap className="w-4 h-4" />
                  {language === "en" ? "Full-Service Creative Agency" : "Agence créative à service complet"}
                </span>
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold text-center mb-6 leading-tight"
              >
                <span className="text-white">{language === "en" ? "Creative Solutions for " : "Solutions créatives pour "}</span>
                <span className="bg-gradient-to-r from-[#D4AF37] via-[#F7DC6F] to-[#D4AF37] bg-clip-text text-transparent">
                  {language === "en" ? "Modern Learning" : "l'apprentissage moderne"}
                </span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-200 text-center max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                {language === "en"
                  ? "We specialize in EdTech solutions for Canadian language schools and government departments. From video production to AI-powered learning platforms, we bring your educational vision to life."
                  : "Nous nous spécialisons dans les solutions EdTech pour les écoles de langues canadiennes et les ministères gouvernementaux. De la production vidéo aux plateformes d'apprentissage alimentées par l'IA, nous donnons vie à votre vision éducative."
                }
              </motion.p>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
              >
                {STATS.map((stat, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-300">{language === "en" ? stat.labelEn : stat.labelFr}</div>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/barholex/contact">
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 h-14 text-lg font-semibold bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black hover:from-[#B8962E] hover:to-[#D4AF37] shadow-lg shadow-[#D4AF37]/20"
                  >
                    {language === "en" ? "Start Your Project" : "Démarrer votre projet"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/barholex/portfolio">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="rounded-full px-8 h-14 text-lg font-semibold border-white/20 text-white hover:bg-white/10"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {language === "en" ? "View Our Work" : "Voir nos réalisations"}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section - Interactive Cards */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium mb-4">
                {language === "en" ? "Our Expertise" : "Notre expertise"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === "en" ? "Services That Drive Results" : "Services qui génèrent des résultats"}
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {language === "en"
                  ? "Comprehensive solutions tailored for educational excellence"
                  : "Solutions complètes adaptées à l'excellence éducative"
                }
              </p>
            </div>

            {/* Service Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {SERVICES.map((service, index) => (
                <button
                  key={index}
                  onClick={() => setActiveService(index)}
                  aria-pressed={activeService === index}
                  aria-label={`View ${language === "en" ? service.titleEn : service.titleFr} service`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeService === index
                      ? "text-black shadow-lg"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  }`}
                  style={{
                    backgroundColor: activeService === index ? service.color : undefined,
                  }}
                >
                  <service.icon className="w-4 h-4" aria-hidden="true" />
                  {language === "en" ? service.titleEn : service.titleFr}
                </button>
              ))}
            </div>

            {/* Active Service Detail */}
            <motion.div
              key={activeService}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left: Service Info */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-sm">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${SERVICES[activeService].color}20` }}
                  >
                    {(() => {
                      const IconComponent = SERVICES[activeService].icon;
                      return <IconComponent className="w-8 h-8" style={{ color: SERVICES[activeService].color }} />;
                    })()}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">
                    {language === "en" ? SERVICES[activeService].titleEn : SERVICES[activeService].titleFr}
                  </h3>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {language === "en" ? SERVICES[activeService].descEn : SERVICES[activeService].descFr}
                  </p>

                  {/* For Who */}
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#D4AF37] mb-2">
                      <Users className="w-4 h-4" />
                      {language === "en" ? "Ideal For" : "Idéal pour"}
                    </div>
                    <p className="text-sm text-gray-300">
                      {language === "en" ? SERVICES[activeService].forEn : SERVICES[activeService].forFr}
                    </p>
                  </div>

                  {/* Outcome */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#D4AF37] mb-2">
                      <TrendingUp className="w-4 h-4" />
                      {language === "en" ? "Expected Outcome" : "Résultat attendu"}
                    </div>
                    <p className="text-sm text-gray-300">
                      {language === "en" ? SERVICES[activeService].outcomeEn : SERVICES[activeService].outcomeFr}
                    </p>
                  </div>
                </div>

                {/* Right: Features */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{ color: SERVICES[activeService].color }} />
                    {language === "en" ? "What's Included" : "Ce qui est inclus"}
                  </h4>
                  
                  {(language === "en" ? SERVICES[activeService].featuresEn : SERVICES[activeService].featuresFr).map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${SERVICES[activeService].color}20` }}
                      >
                        <CheckCircle2 className="w-4 h-4" style={{ color: SERVICES[activeService].color }} />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}

                  <Link href="/barholex/contact">
                    <Button 
                      className="w-full mt-6 rounded-xl h-12 font-semibold text-black"
                      style={{ backgroundColor: SERVICES[activeService].color }}
                    >
                      {language === "en" ? "Get a Quote" : "Obtenir un devis"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Process Section - Timeline */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-900/50 to-black relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium mb-4">
                {language === "en" ? "How We Work" : "Comment nous travaillons"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === "en" ? "Our Proven Process" : "Notre processus éprouvé"}
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {language === "en"
                  ? "A structured approach that delivers exceptional results every time"
                  : "Une approche structurée qui livre des résultats exceptionnels à chaque fois"
                }
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {/* Connection Line */}
                <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/50 to-[#D4AF37]" />
                
                {PROCESS.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative text-center"
                  >
                    {/* Step Number */}
                    <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-black font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4AF37]/20">
                      <step.icon className="w-10 h-10" />
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="text-sm text-[#D4AF37] font-medium mb-2">
                        {language === "en" ? `Step ${index + 1}` : `Étape ${index + 1}`}
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">
                        {language === "en" ? step.stepEn : step.stepFr}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {language === "en" ? step.descEn : step.descFr}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold mb-4">
                  {language === "en" ? "Trusted By" : "Ils nous font confiance"}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CLIENTS.map((client, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:border-[#D4AF37]/30 transition-colors"
                  >
                    <client.icon className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                    <p className="text-sm text-gray-300">
                      {language === "en" ? client.nameEn : client.nameFr}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">
                    {language === "en" ? "Government Certified" : "Certifié gouvernemental"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">
                    {language === "en" ? "5-Star Reviews" : "Avis 5 étoiles"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">
                    {language === "en" ? "On-Time Delivery" : "Livraison à temps"}
                  </span>
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
                {language === "en" ? "Ready to Transform Your Learning Experience?" : "Prêt à transformer votre expérience d'apprentissage?"}
              </h2>
              <p className="text-xl text-black/80 mb-10">
                {language === "en"
                  ? "Let's discuss how we can help bring your educational vision to life"
                  : "Discutons de comment nous pouvons aider à donner vie à votre vision éducative"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/barholex/contact">
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 h-14 text-lg font-semibold bg-black text-[#D4AF37] hover:bg-gray-900"
                  >
                    {language === "en" ? "Start Your Project" : "Démarrer votre projet"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/barholex/portfolio">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="rounded-full px-8 h-14 text-lg font-semibold border-black/30 text-black hover:bg-black/10"
                  >
                    {language === "en" ? "View Portfolio" : "Voir le portfolio"}
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
