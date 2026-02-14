import { useState, useRef, useEffect } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView } from "framer-motion";
import { 
  Building, Users, TrendingUp, CheckCircle2, Target, BarChart3, 
  ArrowRight, Star, Shield, Clock, Send, Sparkles,
  Award, FileCheck, Landmark, Quote, BookOpen, GraduationCap
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

export default function ForGovernment() {
  const { language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const isEn = language === "en";

  // Animated counters
  const departments = useCounter(50, 2000);
  const passRate = useCounter(94, 1800);
  const servants = useCounter(2500, 2500);
  const satisfaction = useCounter(48, 1500); // 4.8 displayed as 48/10

  const content = {
    en: {
      badge: "B2G Government Solutions",
      title: "Language Training for",
      highlight: "Government & Public Sector",
      subtitle: "Treasury Board compliant SLE preparation programs for federal, provincial, and municipal organizations. Achieve bilingual excellence with Canada's leading language training platform.",
      cta: "Request a Demo",
      viewPrograms: "View Programs",
      stats: [
        { label: "Government Departments" },
        { label: "SLE Pass Rate" },
        { label: "Public Servants Trained" },
        { label: "Satisfaction Rate" }
      ],
      complianceTitle: "Treasury Board Compliant",
      complianceItems: [
        "Official Languages Act requirements",
        "Directive on Official Languages for People Management",
        "SLE testing standards (BBB, CBC, CCC)",
        "Accessibility requirements (WCAG 2.1 AA)"
      ],
      benefitsTitle: "Why Government Organizations Choose Us",
      benefits: [
        { icon: Shield, title: "Government Compliant", desc: "All programs meet Treasury Board requirements for SLE certification and official languages." },
        { icon: FileCheck, title: "SLE Preparation", desc: "Structured paths for Reading, Writing, and Oral Interaction at all levels (A, B, C)." },
        { icon: BarChart3, title: "HR Analytics Dashboard", desc: "Track team progress with detailed reports for managers and HR departments." },
        { icon: Users, title: "50+ Expert Coaches", desc: "Certified coaches with extensive government and public sector experience." },
        { icon: BookOpen, title: "GC Bilingual Series", desc: "Six structured paths from beginner to SLE mastery, each 4 weeks intensive." },
        { icon: Award, title: "Proven Results", desc: "94% success rate for BBB/CBC/CCC certifications across all departments." }
      ],
      pathsTitle: "GC Bilingual Mastery Series",
      pathsSubtitle: "Six structured paths from beginner to SLE mastery",
      paths: [
        { path: "Path I", level: "A1→A2", duration: "4 weeks", color: "#E07B39" },
        { path: "Path II", level: "A2→B1", duration: "4 weeks", color: "#E07B39" },
        { path: "Path III", level: "B1→B1+", duration: "4 weeks", color: "#E07B39" },
        { path: "Path IV", level: "B1+→B2", duration: "4 weeks", color: "#D4AF37" },
        { path: "Path V", level: "B2→C1", duration: "4 weeks", color: "#D4AF37" },
        { path: "Path VI", level: "SLE Prep", duration: "4 weeks", color: "#2DD4BF" }
      ],
      packagesTitle: "Government Training Packages",
      packagesSubtitle: "Flexible options for departments of all sizes",
      packages: [
        { name: "Department Starter", size: "Up to 25 learners", price: "$4,500", period: "/quarter", features: ["25 user licenses", "SLE Level A-B preparation", "Basic progress reports", "Email support"], popular: false },
        { name: "Department Growth", size: "Up to 100 learners", price: "$12,000", period: "/quarter", features: ["100 user licenses", "All SLE levels (A, B, C)", "HR Dashboard access", "Dedicated account manager", "Prof Steven AI included"], popular: true },
        { name: "Enterprise Gov", size: "Unlimited learners", price: "Custom", period: "", features: ["Unlimited licenses", "Custom curriculum", "On-site training options", "LMS integration (GCcampus)", "24/7 priority support"], popular: false }
      ],
      testimonialsTitle: "Trusted by Government Organizations",
      testimonials: [
        { quote: "RusingAcademy transformed our approach to bilingual training. Our team achieved their SLE targets 40% faster than expected.", author: "Director of HR", company: "Federal Department" },
        { quote: "The coaching marketplace gave our employees personalized support that made all the difference in their language journey.", author: "Training Manager", company: "Crown Corporation" },
        { quote: "Finally, a solution that understands government compliance requirements while delivering modern, engaging learning experiences.", author: "Chief Learning Officer", company: "Provincial Agency" }
      ],
      ctaTitle: "Ready to Achieve Bilingual Excellence?",
      ctaSubtitle: "Join 50+ government departments that trust RusingAcademy for their official languages training.",
      formTitle: "Request a Demo",
      formSubtitle: "Fill out the form below and our government solutions team will contact you within 24 hours.",
      formFields: {
        name: "Full Name",
        email: "Government Email",
        department: "Department/Agency",
        learners: "Number of Learners",
        message: "Tell us about your training needs",
        submit: "Request Demo"
      },
      formSuccess: "Thank you! Our government solutions team will contact you within 24 hours.",
      partnersTitle: "Trusted by Leading Government Organizations",
      blend: "70% Platform + 30% Live Coaching"
    },
    fr: {
      badge: "Solutions gouvernementales B2G",
      title: "Formation linguistique pour",
      highlight: "Gouvernement et secteur public",
      subtitle: "Programmes de préparation ELS conformes au Conseil du Trésor pour les organisations fédérales, provinciales et municipales. Atteignez l'excellence bilingue avec la principale plateforme de formation linguistique au Canada.",
      cta: "Demander une démo",
      viewPrograms: "Voir les programmes",
      stats: [
        { label: "Ministères gouvernementaux" },
        { label: "Taux de réussite ELS" },
        { label: "Fonctionnaires formés" },
        { label: "Taux de satisfaction" }
      ],
      complianceTitle: "Conforme au Conseil du Trésor",
      complianceItems: [
        "Exigences de la Loi sur les langues officielles",
        "Directive sur les langues officielles pour la gestion des personnes",
        "Normes d'évaluation ELS (BBB, CBC, CCC)",
        "Exigences d'accessibilité (WCAG 2.1 AA)"
      ],
      benefitsTitle: "Pourquoi les organisations gouvernementales nous choisissent",
      benefits: [
        { icon: Shield, title: "Conforme au gouvernement", desc: "Tous les programmes respectent les exigences du Conseil du Trésor pour la certification ELS." },
        { icon: FileCheck, title: "Préparation ELS", desc: "Parcours structurés pour la lecture, l'écriture et l'interaction orale à tous les niveaux." },
        { icon: BarChart3, title: "Tableau de bord RH", desc: "Suivez les progrès de l'équipe avec des rapports détaillés pour les gestionnaires." },
        { icon: Users, title: "50+ coachs experts", desc: "Coachs certifiés avec une vaste expérience gouvernementale et du secteur public." },
        { icon: BookOpen, title: "Série bilingue GC", desc: "Six parcours structurés du débutant à la maîtrise ELS, chacun de 4 semaines." },
        { icon: Award, title: "Résultats prouvés", desc: "Taux de réussite de 94% pour les certifications BBB/CBC/CCC." }
      ],
      pathsTitle: "Série Maîtrise Bilingue GC",
      pathsSubtitle: "Six parcours structurés du débutant à la maîtrise ELS",
      paths: [
        { path: "Parcours I", level: "A1→A2", duration: "4 semaines", color: "#E07B39" },
        { path: "Parcours II", level: "A2→B1", duration: "4 semaines", color: "#E07B39" },
        { path: "Parcours III", level: "B1→B1+", duration: "4 semaines", color: "#E07B39" },
        { path: "Parcours IV", level: "B1+→B2", duration: "4 semaines", color: "#D4AF37" },
        { path: "Parcours V", level: "B2→C1", duration: "4 semaines", color: "#D4AF37" },
        { path: "Parcours VI", level: "Prép. ELS", duration: "4 semaines", color: "#2DD4BF" }
      ],
      packagesTitle: "Forfaits de formation gouvernementale",
      packagesSubtitle: "Options flexibles pour les ministères de toutes tailles",
      packages: [
        { name: "Ministère Débutant", size: "Jusqu'à 25 apprenants", price: "4 500$", period: "/trimestre", features: ["25 licences", "Préparation ELS niveau A-B", "Rapports de base", "Support courriel"], popular: false },
        { name: "Ministère Croissance", size: "Jusqu'à 100 apprenants", price: "12 000$", period: "/trimestre", features: ["100 licences", "Tous les niveaux ELS (A, B, C)", "Accès tableau de bord RH", "Gestionnaire de compte dédié", "Prof Steven IA inclus"], popular: true },
        { name: "Entreprise Gov", size: "Apprenants illimités", price: "Sur mesure", period: "", features: ["Licences illimitées", "Programme personnalisé", "Formation sur site", "Intégration LMS (GCcampus)", "Support prioritaire 24/7"], popular: false }
      ],
      testimonialsTitle: "La confiance des organisations gouvernementales",
      testimonials: [
        { quote: "RusingAcademy a transformé notre approche de la formation bilingue. Notre équipe a atteint ses objectifs ELS 40% plus rapidement que prévu.", author: "Directeur des RH", company: "Ministère fédéral" },
        { quote: "Le marché de coaching a offert à nos employés un soutien personnalisé qui a fait toute la différence.", author: "Gestionnaire de formation", company: "Société d'État" },
        { quote: "Enfin, une solution qui comprend les exigences de conformité gouvernementale tout en offrant des expériences modernes.", author: "Directeur de l'apprentissage", company: "Agence provinciale" }
      ],
      ctaTitle: "Prêt à atteindre l'excellence bilingue?",
      ctaSubtitle: "Rejoignez plus de 50 ministères gouvernementaux qui font confiance à RusingAcademy.",
      formTitle: "Demander une démo",
      formSubtitle: "Remplissez le formulaire ci-dessous et notre équipe solutions gouvernementales vous contactera dans les 24 heures.",
      formFields: {
        name: "Nom complet",
        email: "Courriel gouvernemental",
        department: "Ministère/Agence",
        learners: "Nombre d'apprenants",
        message: "Décrivez vos besoins de formation",
        submit: "Demander une démo"
      },
      formSuccess: "Merci! Notre équipe solutions gouvernementales vous contactera dans les 24 heures.",
      partnersTitle: "La confiance des principales organisations gouvernementales",
      blend: "70% Plateforme + 30% Coaching en direct"
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F3] via-white to-[#FDFBF7]">
      <main id="main-content">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-4 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#2DD4BF]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E07B39]/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-2xl" />
          
          <div className="container mx-auto relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-gray-800">
                  <Landmark className="w-4 h-4 text-[#2DD4BF]" />
                  {t.badge}
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900"
              >
                {t.title}{" "}
                <span className="text-[#2DD4BF]">{t.highlight}</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                {t.subtitle}
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#2DD4BF] hover:bg-[#14b8a6] text-white gap-2 px-8 h-12 text-base shadow-lg shadow-[#2DD4BF]/20 rounded-full"
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t.cta}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 px-8 h-12 text-base border-2 rounded-full"
                >
                  {t.viewPrograms}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 border-y border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div ref={departments.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#2DD4BF] mb-1">{departments.count}+</div>
                <div className="text-sm text-gray-600">{t.stats[0].label}</div>
              </div>
              <div ref={passRate.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#2DD4BF] mb-1">{passRate.count}%</div>
                <div className="text-sm text-gray-600">{t.stats[1].label}</div>
              </div>
              <div ref={servants.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#2DD4BF] mb-1">{servants.count.toLocaleString()}+</div>
                <div className="text-sm text-gray-600">{t.stats[2].label}</div>
              </div>
              <div ref={satisfaction.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#2DD4BF] mb-1">{(satisfaction.count / 10).toFixed(1)}/5</div>
                <div className="text-sm text-gray-600">{t.stats[3].label}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-[#2DD4BF]/5 to-[#E07B39]/5 border border-[#2DD4BF]/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#2DD4BF]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t.complianceTitle}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.complianceItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-[#FDFBF7]">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.benefitsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {t.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-[#2DD4BF]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Path Series Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.pathsTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t.pathsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {t.paths.map((path, index) => (
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
                <span className="font-semibold">{t.blend}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-[#FDFBF7]">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.packagesTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t.packagesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {t.packages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border-2 ${
                    pkg.popular 
                      ? "border-[#2DD4BF] bg-gradient-to-br from-[#F0FDFA] to-white shadow-xl scale-105" 
                      : "border-gray-200 bg-white/80"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 text-xs font-bold rounded-full bg-[#2DD4BF] text-white flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {isEn ? "RECOMMENDED" : "RECOMMANDÉ"}
                      </span>
                    </div>
                  )}
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{pkg.size}</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                      <span className="text-gray-500">{pkg.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full rounded-full ${
                        pkg.popular 
                          ? "bg-[#2DD4BF] hover:bg-[#14b8a6] text-white" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                      onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      {t.cta}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.testimonialsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {t.testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg"
                >
                  <Quote className="w-8 h-8 text-[#2DD4BF]/30 mb-4" />
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-[#2DD4BF]">{testimonial.company}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA & Contact Form Section */}
        <section id="contact-form" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-[#FDFBF7]">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <span className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-[#E07B39]/10 border border-[#E07B39]/20 text-gray-800">
                    <Sparkles className="w-4 h-4 text-[#E07B39]" />
                    {isEn ? "Get Started Today" : "Commencez aujourd'hui"}
                  </span>
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {t.ctaTitle}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t.ctaSubtitle}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.formTitle}</h3>
                <p className="text-gray-600 mb-6">{t.formSubtitle}</p>

                {formSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#2DD4BF]" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{t.formSuccess}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        placeholder={t.formFields.name} 
                        className="h-12 rounded-xl border-gray-200 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]"
                        required 
                      />
                      <Input 
                        type="email" 
                        placeholder={t.formFields.email} 
                        className="h-12 rounded-xl border-gray-200 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]"
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        placeholder={t.formFields.department} 
                        className="h-12 rounded-xl border-gray-200 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]"
                        required 
                      />
                      <Input 
                        placeholder={t.formFields.learners} 
                        className="h-12 rounded-xl border-gray-200 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]"
                      />
                    </div>
                    <Textarea 
                      placeholder={t.formFields.message} 
                      className="min-h-[120px] rounded-xl border-gray-200 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]"
                      rows={4}
                    />
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-[#2DD4BF] hover:bg-[#14b8a6] text-white h-12 rounded-full shadow-lg shadow-[#2DD4BF]/20"
                    >
                      {t.formFields.submit}
                      <Send className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
