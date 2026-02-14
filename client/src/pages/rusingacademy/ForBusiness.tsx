import { useState, useRef, useEffect } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView } from "framer-motion";
import { 
  Building2, Users, TrendingUp, CheckCircle2, Target, BarChart3, 
  ArrowRight, Star, Shield, Clock, Send, Sparkles,
  Briefcase, Award, Globe, Zap, Quote
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

export default function ForBusiness() {
  const { language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const isEn = language === "en";

  // Animated counters
  const clients = useCounter(200, 2000);
  const employees = useCounter(15000, 2500);
  const completion = useCounter(92, 1800);
  const satisfaction = useCounter(49, 1500); // 4.9 displayed as 49/10

  const content = {
    en: {
      badge: "B2B Corporate Solutions",
      title: "Build a Bilingual Workforce",
      highlight: "For Your Business",
      subtitle: "Empower your team with professional language training. RusingAcademy helps Canadian businesses develop bilingual talent and expand into new markets.",
      cta: "Request a Consultation",
      viewPrograms: "View Programs",
      stats: [
        { label: "Corporate Clients" },
        { label: "Employees Trained" },
        { label: "Completion Rate" },
        { label: "Client Satisfaction" }
      ],
      benefitsTitle: "Why Businesses Choose RusingAcademy",
      benefits: [
        { icon: Target, title: "Industry-Specific Training", desc: "Customized curricula for finance, healthcare, legal, and tech sectors." },
        { icon: Clock, title: "Flexible Learning", desc: "On-site, virtual, or hybrid. Self-paced and live coaching sessions." },
        { icon: BarChart3, title: "ROI Tracking", desc: "Analytics dashboards showing progress, engagement, and business impact." },
        { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with SSO integration and Canadian data residency." },
        { icon: Globe, title: "Bilingual Workforce", desc: "Expand into French-speaking markets with confidence and fluency." },
        { icon: Award, title: "Certified Results", desc: "Prepare employees for official language certifications and SLE." }
      ],
      packagesTitle: "Flexible Corporate Packages",
      packagesSubtitle: "Choose the plan that fits your organization's needs",
      packages: [
        { name: "Startup", size: "10-50 Employees", price: "$5,000", period: "/year", features: ["50 user licenses", "Self-paced modules", "Quarterly reports", "Email support"], popular: false },
        { name: "Business", size: "51-200 Employees", price: "$15,000", period: "/year", features: ["200 user licenses", "Live coaching sessions", "Dedicated account manager", "SSO integration", "Prof Steven AI included"], popular: true },
        { name: "Enterprise", size: "200+ Employees", price: "Custom", period: "", features: ["Unlimited licenses", "On-site training options", "LMS integration", "Dedicated success team", "24/7 priority support"], popular: false }
      ],
      testimonialsTitle: "Trusted by Leading Canadian Businesses",
      testimonials: [
        { quote: "RusingAcademy transformed our customer service team. French client satisfaction increased by 40%.", author: "VP Customer Experience", company: "National Insurance Co." },
        { quote: "The industry-specific curriculum opened new market opportunities for our consultants.", author: "Managing Partner", company: "Top-10 Consulting Firm" },
        { quote: "Our employees love the flexible learning options. We've seen a 60% increase in bilingual staff.", author: "HR Director", company: "Tech Startup Inc." }
      ],
      ctaTitle: "Ready to Transform Your Workforce?",
      ctaSubtitle: "Join 200+ Canadian businesses that have achieved bilingual excellence with RusingAcademy.",
      formTitle: "Request a Consultation",
      formSubtitle: "Fill out the form below and our team will contact you within 24 hours.",
      formFields: {
        name: "Full Name",
        email: "Work Email",
        company: "Company Name",
        employees: "Number of Employees",
        message: "Tell us about your training needs",
        submit: "Send Request"
      },
      formSuccess: "Thank you! We'll be in touch within 24 hours.",
      industriesTitle: "Industries We Serve",
      industries: ["Financial Services", "Healthcare", "Technology", "Legal", "Consulting", "Manufacturing", "Retail", "Government Contractors"]
    },
    fr: {
      badge: "Solutions corporatives B2B",
      title: "Bâtissez une main-d'œuvre bilingue",
      highlight: "Pour votre entreprise",
      subtitle: "Donnez à votre équipe les moyens de réussir avec une formation linguistique professionnelle. RusingAcademy aide les entreprises canadiennes à développer des talents bilingues.",
      cta: "Demander une consultation",
      viewPrograms: "Voir les programmes",
      stats: [
        { label: "Clients corporatifs" },
        { label: "Employés formés" },
        { label: "Taux de complétion" },
        { label: "Satisfaction client" }
      ],
      benefitsTitle: "Pourquoi les entreprises choisissent RusingAcademy",
      benefits: [
        { icon: Target, title: "Formation par industrie", desc: "Programmes personnalisés pour finance, santé, juridique et tech." },
        { icon: Clock, title: "Apprentissage flexible", desc: "Sur site, virtuel ou hybride. Auto-formation et coaching en direct." },
        { icon: BarChart3, title: "Suivi du ROI", desc: "Tableaux de bord analytiques montrant progrès et impact business." },
        { icon: Shield, title: "Sécurité entreprise", desc: "Conforme SOC 2 avec SSO et résidence des données au Canada." },
        { icon: Globe, title: "Main-d'œuvre bilingue", desc: "Développez-vous sur les marchés francophones en toute confiance." },
        { icon: Award, title: "Résultats certifiés", desc: "Préparez vos employés aux certifications linguistiques et ELS." }
      ],
      packagesTitle: "Forfaits corporatifs flexibles",
      packagesSubtitle: "Choisissez le plan qui correspond aux besoins de votre organisation",
      packages: [
        { name: "Startup", size: "10-50 employés", price: "5 000$", period: "/an", features: ["50 licences", "Modules auto-formation", "Rapports trimestriels", "Support courriel"], popular: false },
        { name: "Business", size: "51-200 employés", price: "15 000$", period: "/an", features: ["200 licences", "Sessions de coaching en direct", "Gestionnaire de compte dédié", "Intégration SSO", "Prof Steven IA inclus"], popular: true },
        { name: "Entreprise", size: "200+ employés", price: "Sur mesure", period: "", features: ["Licences illimitées", "Formation sur site", "Intégration LMS", "Équipe de succès dédiée", "Support prioritaire 24/7"], popular: false }
      ],
      testimonialsTitle: "La confiance des grandes entreprises canadiennes",
      testimonials: [
        { quote: "RusingAcademy a transformé notre équipe de service client. La satisfaction des clients francophones a augmenté de 40%.", author: "VP Expérience client", company: "Compagnie d'assurance nationale" },
        { quote: "Le curriculum spécifique à notre industrie a ouvert de nouvelles opportunités de marché.", author: "Associé directeur", company: "Cabinet de conseil Top-10" },
        { quote: "Nos employés adorent les options d'apprentissage flexibles. Nous avons vu une augmentation de 60% du personnel bilingue.", author: "Directrice RH", company: "Tech Startup Inc." }
      ],
      ctaTitle: "Prêt à transformer votre équipe?",
      ctaSubtitle: "Rejoignez plus de 200 entreprises canadiennes qui ont atteint l'excellence bilingue avec RusingAcademy.",
      formTitle: "Demander une consultation",
      formSubtitle: "Remplissez le formulaire ci-dessous et notre équipe vous contactera dans les 24 heures.",
      formFields: {
        name: "Nom complet",
        email: "Courriel professionnel",
        company: "Nom de l'entreprise",
        employees: "Nombre d'employés",
        message: "Décrivez vos besoins de formation",
        submit: "Envoyer la demande"
      },
      formSuccess: "Merci! Nous vous contacterons dans les 24 heures.",
      industriesTitle: "Industries que nous servons",
      industries: ["Services financiers", "Santé", "Technologie", "Juridique", "Conseil", "Fabrication", "Commerce de détail", "Sous-traitants gouvernementaux"]
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
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#E07B39]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-64 h-64 bg-[#E07B39]/5 rounded-full blur-2xl" />
          
          <div className="container mx-auto relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-[#E07B39]/10 border border-[#E07B39]/20 text-gray-800">
                  <Building2 className="w-4 h-4 text-[#E07B39]" />
                  {t.badge}
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900"
              >
                {t.title}{" "}
                <span className="text-[#E07B39]">{t.highlight}</span>
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
                  className="bg-[#E07B39] hover:bg-[#C45E1A] text-white gap-2 px-8 h-12 text-base shadow-lg shadow-[#E07B39]/20 rounded-full"
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
              <div ref={clients.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E07B39] mb-1">{clients.count}+</div>
                <div className="text-sm text-gray-600">{t.stats[0].label}</div>
              </div>
              <div ref={employees.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E07B39] mb-1">{employees.count.toLocaleString()}+</div>
                <div className="text-sm text-gray-600">{t.stats[1].label}</div>
              </div>
              <div ref={completion.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E07B39] mb-1">{completion.count}%</div>
                <div className="text-sm text-gray-600">{t.stats[2].label}</div>
              </div>
              <div ref={satisfaction.ref} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E07B39] mb-1">{(satisfaction.count / 10).toFixed(1)}/5</div>
                <div className="text-sm text-gray-600">{t.stats[3].label}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">{t.industriesTitle}</h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {t.industries.map((industry, i) => (
                <motion.span 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-2 rounded-full bg-white/80 border border-gray-200/50 text-gray-600 text-sm shadow-sm"
                >
                  {industry}
                </motion.span>
              ))}
            </div>
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
                  <div className="w-12 h-12 rounded-xl bg-[#E07B39]/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-[#E07B39]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
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
                      ? "border-[#E07B39] bg-gradient-to-br from-[#FFF8F3] to-white shadow-xl scale-105" 
                      : "border-gray-200 bg-white/80"
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 text-xs font-bold rounded-full bg-[#E07B39] text-white flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {isEn ? "POPULAR" : "POPULAIRE"}
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
                          ? "bg-[#E07B39] hover:bg-[#C45E1A] text-white" 
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
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-[#FDFBF7]">
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
                  <Quote className="w-8 h-8 text-[#E07B39]/30 mb-4" />
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-[#E07B39]">{testimonial.company}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA & Contact Form Section */}
        <section id="contact-form" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <span className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-gray-800">
                    <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
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
                        className="h-12 rounded-xl border-gray-200 focus:border-[#E07B39] focus:ring-[#E07B39]"
                        required 
                      />
                      <Input 
                        type="email" 
                        placeholder={t.formFields.email} 
                        className="h-12 rounded-xl border-gray-200 focus:border-[#E07B39] focus:ring-[#E07B39]"
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        placeholder={t.formFields.company} 
                        className="h-12 rounded-xl border-gray-200 focus:border-[#E07B39] focus:ring-[#E07B39]"
                        required 
                      />
                      <Input 
                        placeholder={t.formFields.employees} 
                        className="h-12 rounded-xl border-gray-200 focus:border-[#E07B39] focus:ring-[#E07B39]"
                      />
                    </div>
                    <Textarea 
                      placeholder={t.formFields.message} 
                      className="min-h-[120px] rounded-xl border-gray-200 focus:border-[#E07B39] focus:ring-[#E07B39]"
                      rows={4}
                    />
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-[#E07B39] hover:bg-[#C45E1A] text-white h-12 rounded-full shadow-lg shadow-[#E07B39]/20"
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
