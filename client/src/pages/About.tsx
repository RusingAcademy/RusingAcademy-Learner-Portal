import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import {
  Target,
  Heart,
  Users,
  Award,
  Globe,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Quote,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function About() {
  const { language } = useLanguage();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
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
      title: "About Lingueefy",
      subtitle: "Empowering Canadian public servants to achieve bilingual excellence",
      missionTitle: "Our Mission",
      missionText: "Lingueefy exists to democratize access to high-quality second language training for Canadian federal public servants. We believe that language proficiency should not be a barrier to career advancement in the public service.",
      storyTitle: "Our Story",
      storyP1: "Lingueefy was born from a simple observation: too many talented public servants struggle to find effective, affordable language training that fits their busy schedules and specifically addresses the SLE exam requirements.",
      storyP2: "Founded by Steven Barholere, a language coach with over a decade of experience helping federal employees achieve their SLE goals, Lingueefy combines the best of human expertise with cutting-edge AI technology.",
      storyP3: "As part of the RusingAcademy ecosystem, Lingueefy represents our commitment to making bilingual excellence achievable for every public servant in Canada.",
      valuesTitle: "Our Values",
      values: [
        {
          icon: Target,
          title: "Results-Focused",
          description: "Everything we do is measured by one metric: helping you pass your SLE exam and advance your career.",
          color: "teal",
        },
        {
          icon: Heart,
          title: "Learner-Centered",
          description: "We design every feature around the real needs of busy public servants juggling work, life, and language learning.",
          color: "copper",
        },
        {
          icon: Users,
          title: "Community-Driven",
          description: "Our coaches are former public servants and language experts who understand your journey firsthand.",
          color: "blue",
        },
        {
          icon: Award,
          title: "Excellence",
          description: "We maintain the highest standards for our coaches, content, and technology to ensure quality outcomes.",
          color: "amber",
        },
        {
          icon: Globe,
          title: "Bilingual by Design",
          description: "Our platform is fully bilingual because we practice what we preach about language accessibility.",
          color: "emerald",
        },
        {
          icon: Lightbulb,
          title: "Innovation",
          description: "We leverage AI and modern technology to make language learning more effective and accessible than ever.",
          color: "orange",
        },
      ],
      teamTitle: "Leadership",
      teamSubtitle: "Meet the people behind Lingueefy",
      founder: {
        name: "Steven Barholere",
        role: "Founder & CEO",
        bio: "Steven founded RusingAcademy and Lingueefy after spending over 10 years as a language coach specializing in SLE preparation. He has personally helped hundreds of public servants achieve their language goals and advance their careers in the federal government.",
      },
      ctaTitle: "Ready to Start Your Language Journey?",
      ctaDescription: "Join thousands of public servants who have achieved their SLE goals with Lingueefy.",
      ctaButton: "Get Started",
    },
    fr: {
      title: "À propos de Lingueefy",
      subtitle: "Permettre aux fonctionnaires canadiens d'atteindre l'excellence bilingue",
      missionTitle: "Notre mission",
      missionText: "Lingueefy existe pour démocratiser l'accès à une formation linguistique de haute qualité pour les fonctionnaires fédéraux canadiens. Nous croyons que la maîtrise des langues ne devrait pas être un obstacle à l'avancement de carrière dans la fonction publique.",
      storyTitle: "Notre histoire",
      storyP1: "Lingueefy est né d'une simple observation : trop de fonctionnaires talentueux peinent à trouver une formation linguistique efficace et abordable qui s'adapte à leur emploi du temps chargé et répond spécifiquement aux exigences de l'examen ELS.",
      storyP2: "Fondé par Steven Barholere, un coach linguistique avec plus d'une décennie d'expérience à aider les employés fédéraux à atteindre leurs objectifs ELS, Lingueefy combine le meilleur de l'expertise humaine avec une technologie d'IA de pointe.",
      storyP3: "En tant que partie de l'écosystème RusingAcademy, Lingueefy représente notre engagement à rendre l'excellence bilingue accessible à chaque fonctionnaire au Canada.",
      valuesTitle: "Nos valeurs",
      values: [
        {
          icon: Target,
          title: "Axé sur les résultats",
          description: "Tout ce que nous faisons est mesuré par un seul critère : vous aider à réussir votre examen ELS et à faire avancer votre carrière.",
          color: "teal",
        },
        {
          icon: Heart,
          title: "Centré sur l'apprenant",
          description: "Nous concevons chaque fonctionnalité autour des besoins réels des fonctionnaires occupés qui jonglent avec le travail, la vie et l'apprentissage des langues.",
          color: "copper",
        },
        {
          icon: Users,
          title: "Axé sur la communauté",
          description: "Nos coachs sont d'anciens fonctionnaires et des experts linguistiques qui comprennent votre parcours de première main.",
          color: "blue",
        },
        {
          icon: Award,
          title: "Excellence",
          description: "Nous maintenons les normes les plus élevées pour nos coachs, notre contenu et notre technologie pour assurer des résultats de qualité.",
          color: "amber",
        },
        {
          icon: Globe,
          title: "Bilingue par conception",
          description: "Notre plateforme est entièrement bilingue parce que nous pratiquons ce que nous prêchons sur l'accessibilité linguistique.",
          color: "emerald",
        },
        {
          icon: Lightbulb,
          title: "Innovation",
          description: "Nous exploitons l'IA et la technologie moderne pour rendre l'apprentissage des langues plus efficace et accessible que jamais.",
          color: "orange",
        },
      ],
      teamTitle: "Direction",
      teamSubtitle: "Rencontrez les personnes derrière Lingueefy",
      founder: {
        name: "Steven Barholere",
        role: "Fondateur et PDG",
        bio: "Steven a fondé RusingAcademy et Lingueefy après avoir passé plus de 10 ans comme coach linguistique spécialisé dans la préparation ELS. Il a personnellement aidé des centaines de fonctionnaires à atteindre leurs objectifs linguistiques et à faire avancer leur carrière au gouvernement fédéral.",
      },
      ctaTitle: "Prêt à commencer votre parcours linguistique?",
      ctaDescription: "Rejoignez des milliers de fonctionnaires qui ont atteint leurs objectifs ELS avec Lingueefy.",
      ctaButton: "Commencer",
    },
  };

  const l = labels[language];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; iconBg: string }> = {
      teal: { bg: "from-teal-50 to-teal-100/50", icon: "text-teal-600", iconBg: "bg-teal-500" },
      copper: { bg: "from-[#C65A1E]-50 to-[#E06B2D]/50", icon: "text-[#C65A1E]", iconBg: "bg-[#FFF1E8]" },
      blue: { bg: "from-blue-50 to-blue-100/50", icon: "text-blue-600", iconBg: "bg-blue-500" },
      amber: { bg: "from-[#FFF8F3] to-[#FFF0E6]/50", icon: "text-[#C65A1E]600", iconBg: "bg-[#C65A1E]" },
      emerald: { bg: "from-emerald-50 to-emerald-100/50", icon: "text-emerald-600", iconBg: "bg-emerald-500" },
      orange: { bg: "from-[#FFF8F3] to-[#FFF0E6]/50", icon: "text-[#C65A1E]600", iconBg: "bg-[#C65A1E]" },
    };
    return colors[color] || colors.teal;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50/30 via-white to-teal-50/20">
      

      <main id="main-content" className="flex-1">
        <Breadcrumb 
          items={[
            { label: "About", labelFr: "À propos" }
          ]} 
        />

        {/* Hero Section with Glassmorphism */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          {/* Decorative orbs */}
          <div className="orb orb-teal w-[500px] h-[500px] -top-64 -right-64 animate-float-slow" />
          <div className="orb orb-orange w-72 h-72 top-20 -left-36 animate-float-medium opacity-40" />
          <div className="orb orb-teal w-48 h-48 bottom-10 left-1/4 animate-float-fast opacity-30" />
          
          <div className="container relative z-10 text-center">
            {/* Glass badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-badge mb-6">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">
                {language === "fr" ? "Notre histoire" : "Our Story"}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {language === "fr" ? (
                <>À propos de <span className="gradient-text">Lingueefy</span></>
              ) : (
                <>About <span className="gradient-text">Lingueefy</span></>
              )}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {l.subtitle}
            </p>
          </div>
        </section>

        {/* Mission Section - Glassmorphism */}
        <section 
          className="py-16"
          ref={(el) => { if (el) sectionRefs.current.set('mission', el); }}
          data-section="mission"
        >
          <div className="container">
            <div className={`max-w-3xl mx-auto transition-all duration-700 ${
              visibleSections.has('mission') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="glass-card p-8 md:p-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/25">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{l.missionTitle}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{l.missionText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section - Glassmorphism */}
        <section 
          className="py-16 relative overflow-hidden"
          ref={(el) => { if (el) sectionRefs.current.set('story', el); }}
          data-section="story"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 to-white" />
          <div className="orb orb-teal w-64 h-64 -bottom-32 -right-32 opacity-30" />
          
          <div className="container relative z-10">
            <div className={`max-w-3xl mx-auto transition-all duration-700 ${
              visibleSections.has('story') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{l.storyTitle}</h2>
              
              <div className="space-y-6">
                <div className="glass-card p-6 hover-lift">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                      <Quote className="h-5 w-5 text-teal-600" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{l.storyP1}</p>
                  </div>
                </div>
                
                <div className="glass-card p-6 hover-lift" style={{ transitionDelay: '100ms' }}>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Lightbulb className="h-5 w-5 text-[#C65A1E]600" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{l.storyP2}</p>
                  </div>
                </div>
                
                <div className="glass-card p-6 hover-lift" style={{ transitionDelay: '200ms' }}>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{l.storyP3}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section - Glassmorphism Grid */}
        <section 
          className="py-16"
          ref={(el) => { if (el) sectionRefs.current.set('values', el); }}
          data-section="values"
        >
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">{l.valuesTitle}</h2>
            
            <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto transition-all duration-700 ${
              visibleSections.has('values') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {l.values.map((value, i) => {
                const colors = getColorClasses(value.color);
                return (
                  <div 
                    key={i} 
                    className="glass-card p-6 hover-lift group"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className={`h-14 w-14 rounded-2xl ${colors.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section - Glassmorphism */}
        <section 
          className="py-16 relative overflow-hidden"
          ref={(el) => { if (el) sectionRefs.current.set('team', el); }}
          data-section="team"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white to-teal-50/50" />
          <div className="orb orb-orange w-48 h-48 top-20 -left-24 opacity-30" />
          
          <div className="container relative z-10">
            <div className={`text-center mb-12 transition-all duration-700 ${
              visibleSections.has('team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{l.teamTitle}</h2>
              <p className="text-muted-foreground">{l.teamSubtitle}</p>
            </div>
            
            <div className={`max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              visibleSections.has('team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="glass-card p-8 md:p-10 hover-lift">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  {/* Avatar with glow */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-xl group-hover:bg-teal-400/40 transition-all duration-300" />
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shrink-0 relative shadow-xl">
                      <span className="text-4xl font-bold text-white">SB</span>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold">{l.founder.name}</h3>
                    <p className="text-teal-600 font-medium mb-3">{l.founder.role}</p>
                    <p className="text-muted-foreground leading-relaxed">{l.founder.bio}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Glassmorphism */}
        <section 
          className="py-16"
          ref={(el) => { if (el) sectionRefs.current.set('cta', el); }}
          data-section="cta"
        >
          <div className="container">
            <div className={`relative overflow-hidden rounded-3xl transition-all duration-700 ${
              visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700" />
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C65A1E]/20 rounded-full blur-3xl" />
              
              <div className="relative p-12 md:p-16 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{l.ctaTitle}</h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">
                  {l.ctaDescription}
                </p>
                <Link href="/coaches">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    {l.ctaButton}
                    <ArrowRight className="h-4 w-4 ml-2" />
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
