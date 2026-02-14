import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  Calendar,
  FileText,
  Globe,
  Clock,
  Target,
  BarChart3,
  Briefcase,
  ArrowRight,
  Star,
  Sparkles,
  Quote,
  DollarSign,
  Zap,
  Shield,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import { ENTERPRISE_PRICES } from "@shared/pricing";

export default function ForBusiness() {
  const { language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const setSectionRef = (key: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(key, el);
  };

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
      badge: "Corporate Solutions",
      title: "Transform Your Workforce's",
      titleHighlight: "Language Capabilities",
      subtitle: "Empower your teams with professional bilingual training. Lingueefy helps businesses build competitive advantage through effective French-English communication skills.",
      ctaPrimary: "Request a Demo",
      ctaSecondary: "Download Brochure",
      
      stat1Value: "87%",
      stat1Label: "Completion Rate",
      stat2Value: "1,200+",
      stat2Label: "Corporate Learners",
      stat3Value: "35+",
      stat3Label: "Companies Served",
      stat4Value: "4.9/5",
      stat4Label: "Client Satisfaction",
      
      benefitsTitle: "Why Businesses Choose Lingueefy",
      benefitsSubtitle: "Purpose-built for the unique needs of Canadian businesses seeking bilingual excellence",
      
      benefits: [
        { icon: Target, title: "Business-Focused Curriculum", desc: "Our programs are tailored to professional contexts—meetings, presentations, negotiations, and client communications.", color: "teal" },
        { icon: Clock, title: "Flexible Learning", desc: "On-demand sessions that fit around busy schedules. Learn during lunch, after work, or on weekends.", color: "blue" },
        { icon: BarChart3, title: "ROI Tracking", desc: "Measure the impact of language training with detailed progress reports and competency assessments.", color: "emerald" },
        { icon: Briefcase, title: "Industry Expertise", desc: "Coaches with experience in finance, healthcare, legal, tech, and other specialized sectors.", color: "orange" },
        { icon: Globe, title: "Bilingual Workforce", desc: "Serve clients in both official languages and expand your market reach across Canada.", color: "copper" },
        { icon: DollarSign, title: "Cost-Effective", desc: "Group rates and volume discounts. Pay only for sessions used with flexible billing options.", color: "amber" },
      ],
      
      packagesTitle: "Corporate Training Packages",
      packagesSubtitle: "Scalable solutions for teams of any size",
      
      packages: [
        {
          name: "Starter",
          price: ENTERPRISE_PRICES.BUSINESS_STARTER.priceDisplay,
          period: "per quarter",
          description: "Perfect for small teams starting their bilingual journey",
          features: ["Up to 5 team members", "20 coaching sessions", "Basic progress tracking", "Email support", "Group session option"],
          popular: false,
        },
        {
          name: "Professional",
          price: ENTERPRISE_PRICES.BUSINESS_PROFESSIONAL.priceDisplay,
          period: "per quarter",
          description: "Ideal for growing teams with diverse language needs",
          features: ["Up to 15 team members", "60 coaching sessions", "Advanced analytics dashboard", "Dedicated account manager", "Custom curriculum design", "Priority scheduling"],
          popular: true,
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "contact us",
          description: "Tailored solutions for large organizations",
          features: ["Unlimited team members", "Unlimited sessions", "White-label platform option", "API integration", "On-site training available", "Executive coaching", "24/7 support"],
          popular: false,
        },
      ],
      
      industriesTitle: "Industry-Specific Programs",
      industriesSubtitle: "Specialized training for your sector",
      
      industries: [
        { name: "Financial Services", desc: "Client communications, regulatory compliance, bilingual documentation", icon: DollarSign },
        { name: "Healthcare", desc: "Patient care, medical terminology, healthcare administration", icon: Shield },
        { name: "Technology", desc: "Technical documentation, client support, product localization", icon: Zap },
        { name: "Professional Services", desc: "Legal, consulting, accounting—client-facing excellence", icon: Briefcase },
      ],
      
      testimonialsTitle: "What Our Clients Say",
      
      testimonials: [
        { quote: "Lingueefy transformed our customer service team. We can now serve all our clients in their preferred language.", author: "Marie-Claire Dubois", role: "VP Customer Experience", company: "FinanceFirst Inc." },
        { quote: "The ROI was clear within 6 months. Our bilingual capabilities opened doors to major contracts in Quebec.", author: "James Chen", role: "CEO", company: "TechVentures Corp" },
        { quote: "The flexibility and quality of coaching exceeded our expectations. Highly recommend for any business.", author: "Sophie Tremblay", role: "HR Director", company: "HealthCare Partners" },
      ],
      
      ctaTitle: "Ready to Elevate Your Team?",
      ctaSubtitle: "Schedule a free consultation to discuss your organization's language training needs.",
      ctaButton: "Book a Consultation",
      
      formTitle: "Request Information",
      formSubtitle: "Tell us about your organization and we'll create a custom proposal.",
      formCompany: "Company Name",
      formName: "Your Name",
      formEmail: "Work Email",
      formPhone: "Phone Number",
      formTeamSize: "Team Size",
      formMessage: "Tell us about your needs",
      formSubmit: "Submit Request",
      formSuccess: "Thank you! We'll be in touch within 24 hours.",
    },
    fr: {
      badge: "Solutions Corporatives",
      title: "Transformez les Capacités",
      titleHighlight: "Linguistiques de Votre Équipe",
      subtitle: "Donnez à vos équipes une formation bilingue professionnelle. Lingueefy aide les entreprises à développer un avantage compétitif grâce à des compétences efficaces en communication français-anglais.",
      ctaPrimary: "Demander une Démo",
      ctaSecondary: "Télécharger la Brochure",
      
      stat1Value: "87%",
      stat1Label: "Taux de Complétion",
      stat2Value: "1 200+",
      stat2Label: "Apprenants Corporatifs",
      stat3Value: "35+",
      stat3Label: "Entreprises Servies",
      stat4Value: "4,9/5",
      stat4Label: "Satisfaction Client",
      
      benefitsTitle: "Pourquoi les Entreprises Choisissent Lingueefy",
      benefitsSubtitle: "Conçu pour les besoins uniques des entreprises canadiennes visant l'excellence bilingue",
      
      benefits: [
        { icon: Target, title: "Curriculum Axé Affaires", desc: "Nos programmes sont adaptés aux contextes professionnels—réunions, présentations, négociations et communications clients.", color: "teal" },
        { icon: Clock, title: "Apprentissage Flexible", desc: "Sessions à la demande qui s'adaptent aux horaires chargés. Apprenez pendant le lunch, après le travail ou les weekends.", color: "blue" },
        { icon: BarChart3, title: "Suivi du ROI", desc: "Mesurez l'impact de la formation linguistique avec des rapports de progrès détaillés et des évaluations de compétences.", color: "emerald" },
        { icon: Briefcase, title: "Expertise Sectorielle", desc: "Coachs avec expérience en finance, santé, juridique, tech et autres secteurs spécialisés.", color: "orange" },
        { icon: Globe, title: "Main-d'œuvre Bilingue", desc: "Servez vos clients dans les deux langues officielles et élargissez votre portée à travers le Canada.", color: "copper" },
        { icon: DollarSign, title: "Rentable", desc: "Tarifs de groupe et remises sur volume. Payez uniquement pour les sessions utilisées avec facturation flexible.", color: "amber" },
      ],
      
      packagesTitle: "Forfaits de Formation Corporative",
      packagesSubtitle: "Solutions évolutives pour équipes de toute taille",
      
      packages: [
        { name: "Démarrage", price: "2 997 $", period: "par trimestre", description: "Parfait pour les petites équipes débutant leur parcours bilingue", features: ["Jusqu'à 5 membres d'équipe", "20 sessions de coaching", "Suivi de base des progrès", "Support par courriel", "Option session de groupe"], popular: false },
        { name: "Professionnel", price: "7 997 $", period: "par trimestre", description: "Idéal pour les équipes en croissance avec des besoins linguistiques divers", features: ["Jusqu'à 15 membres d'équipe", "60 sessions de coaching", "Tableau de bord analytique avancé", "Gestionnaire de compte dédié", "Conception de curriculum personnalisé", "Planification prioritaire"], popular: true },
        { name: "Entreprise", price: "Sur mesure", period: "contactez-nous", description: "Solutions sur mesure pour les grandes organisations", features: ["Membres d'équipe illimités", "Sessions illimitées", "Option plateforme marque blanche", "Intégration API", "Formation sur site disponible", "Coaching exécutif", "Support 24/7"], popular: false },
      ],
      
      industriesTitle: "Programmes Spécifiques par Industrie",
      industriesSubtitle: "Formation spécialisée pour votre secteur",
      
      industries: [
        { name: "Services Financiers", desc: "Communications clients, conformité réglementaire, documentation bilingue", icon: DollarSign },
        { name: "Santé", desc: "Soins aux patients, terminologie médicale, administration de la santé", icon: Shield },
        { name: "Technologie", desc: "Documentation technique, support client, localisation de produits", icon: Zap },
        { name: "Services Professionnels", desc: "Juridique, conseil, comptabilité—excellence face aux clients", icon: Briefcase },
      ],
      
      testimonialsTitle: "Ce que Disent Nos Clients",
      
      testimonials: [
        { quote: "Lingueefy a transformé notre équipe de service client. Nous pouvons maintenant servir tous nos clients dans leur langue préférée.", author: "Marie-Claire Dubois", role: "VP Expérience Client", company: "FinanceFirst Inc." },
        { quote: "Le ROI était clair en 6 mois. Nos capacités bilingues ont ouvert des portes vers des contrats majeurs au Québec.", author: "James Chen", role: "PDG", company: "TechVentures Corp" },
        { quote: "La flexibilité et la qualité du coaching ont dépassé nos attentes. Hautement recommandé pour toute entreprise.", author: "Sophie Tremblay", role: "Directrice RH", company: "HealthCare Partners" },
      ],
      
      ctaTitle: "Prêt à Élever Votre Équipe?",
      ctaSubtitle: "Planifiez une consultation gratuite pour discuter des besoins de formation linguistique de votre organisation.",
      ctaButton: "Réserver une Consultation",
      
      formTitle: "Demander des Informations",
      formSubtitle: "Parlez-nous de votre organisation et nous créerons une proposition personnalisée.",
      formCompany: "Nom de l'Entreprise",
      formName: "Votre Nom",
      formEmail: "Courriel Professionnel",
      formPhone: "Numéro de Téléphone",
      formTeamSize: "Taille de l'Équipe",
      formMessage: "Parlez-nous de vos besoins",
      formSubmit: "Soumettre la Demande",
      formSuccess: "Merci! Nous vous contacterons dans les 24 heures.",
    },
  };

  const t = labels[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const colorMap: Record<string, string> = {
    teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-[#C65A1E]700 dark:text-[#C65A1E]300",
    copper: "bg-[#FFF1E8] dark:bg-[#FFF1E8]/30 text-[#C65A1E] dark:text-[#C65A1E]",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-[#C65A1E]700 dark:text-[#C65A1E]300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-[#FFF8F3]/30 dark:from-teal-950/30 dark:to-[#431407]/20" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-100/20 to-transparent dark:from-teal-900/10" />
        
        <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 px-4 py-1.5 text-sm font-medium">
              <Building2 className="w-4 h-4 mr-2" />
              {t.badge}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              {t.title}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                {t.titleHighlight}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 px-8">
                {t.ctaPrimary}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-800">
                <FileText className="w-5 h-5 mr-2" />
                {t.ctaSecondary}
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: t.stat1Value, label: t.stat1Label },
                { value: t.stat2Value, label: t.stat2Label },
                { value: t.stat3Value, label: t.stat3Label },
                { value: t.stat4Value, label: t.stat4Label },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={setSectionRef('benefits')} data-section="benefits" className="py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.benefitsTitle}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.benefitsSubtitle}</p>
          </div>
          
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${visibleSections.has('benefits') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t.benefits.map((benefit, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${colorMap[benefit.color]} flex items-center justify-center mb-4`}>
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section ref={setSectionRef('packages')} data-section="packages" className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.packagesTitle}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.packagesSubtitle}</p>
          </div>
          
          <div className={`grid md:grid-cols-3 gap-8 max-w-5xl mx-auto transition-all duration-700 ${visibleSections.has('packages') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t.packages.map((pkg, i) => (
              <Card key={i} className={`relative border-2 ${pkg.popular ? 'border-teal-500 dark:border-teal-400 shadow-xl shadow-teal-500/10' : 'border-slate-200 dark:border-slate-700'} hover:shadow-lg transition-all duration-300`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-teal-600 dark:text-teal-400">{pkg.price}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">{pkg.period}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{pkg.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${pkg.popular ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white' : ''}`} variant={pkg.popular ? "default" : "outline"}>
                    {t.ctaPrimary}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section ref={setSectionRef('industries')} data-section="industries" className="py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.industriesTitle}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.industriesSubtitle}</p>
          </div>
          
          <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ${visibleSections.has('industries') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t.industries.map((industry, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-900/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <industry.icon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{industry.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{industry.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={setSectionRef('testimonials')} data-section="testimonials" className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.testimonialsTitle}</h2>
          </div>
          
          <div className={`grid md:grid-cols-3 gap-8 transition-all duration-700 ${visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t.testimonials.map((testimonial, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  <Quote className="w-10 h-10 text-teal-200 dark:text-teal-800 mb-4" />
                  <p className="text-slate-700 dark:text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section ref={setSectionRef('contact')} data-section="contact" className="py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.formTitle}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">{t.formSubtitle}</p>
            </div>
            
            {formSubmitted ? (
              <Card className="border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                  <p className="text-lg text-teal-700 dark:text-teal-300 font-medium">{t.formSuccess}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company">{t.formCompany}</Label>
                        <Input id="company" required className="border-slate-300 dark:border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.formName}</Label>
                        <Input id="name" required className="border-slate-300 dark:border-slate-600" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.formEmail}</Label>
                        <Input id="email" type="email" required className="border-slate-300 dark:border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t.formPhone}</Label>
                        <Input id="phone" type="tel" className="border-slate-300 dark:border-slate-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">{t.formTeamSize}</Label>
                      <Select>
                        <SelectTrigger className="border-slate-300 dark:border-slate-600">
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5 employees</SelectItem>
                          <SelectItem value="6-15">6-15 employees</SelectItem>
                          <SelectItem value="16-50">16-50 employees</SelectItem>
                          <SelectItem value="51-100">51-100 employees</SelectItem>
                          <SelectItem value="100+">100+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t.formMessage}</Label>
                      <Textarea id="message" rows={4} className="border-slate-300 dark:border-slate-600" />
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                      {t.formSubmit}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.ctaTitle}</h2>
          <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">{t.ctaSubtitle}</p>
          <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg hover:shadow-xl transition-all duration-300 px-8">
            <Calendar className="w-5 h-5 mr-2" />
            {t.ctaButton}
          </Button>
        </div>
      </section>

      <EcosystemFooter lang="en" theme="light" activeBrand="lingueefy" />
    </div>
  );
}
