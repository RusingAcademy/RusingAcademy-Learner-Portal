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
import Footer from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  Calendar,
  FileText,
  Shield,
  Clock,
  Target,
  BarChart3,
  Headphones,
  ArrowRight,
  Star,
  Sparkles,
  ChevronDown,
  Quote,
  Check,
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  GraduationCap,
  BookOpen,
  Zap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ENTERPRISE_PRICES } from "@shared/pricing";

export default function ForDepartments() {
  const { language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
      badge: "Enterprise Solutions",
      title: "Language Training for",
      titleHighlight: "Government Teams",
      subtitle: "Empower your department with scalable, results-driven SLE preparation. Lingueefy helps federal teams achieve their bilingual requirements efficiently and cost-effectively.",
      ctaPrimary: "Request a Demo",
      ctaSecondary: "Download Brochure",
      
      stat1Value: "94%",
      stat1Label: "SLE Pass Rate",
      stat2Value: "2,500+",
      stat2Label: "Public Servants Trained",
      stat3Value: "50+",
      stat3Label: "Departments Served",
      stat4Value: "4.8/5",
      stat4Label: "Client Satisfaction",
      
      benefitsTitle: "Why Departments Choose Lingueefy",
      benefitsSubtitle: "Purpose-built for the unique needs of Canadian federal government language training",
      
      benefits: [
        { icon: Target, title: "SLE-Focused Curriculum", desc: "Our coaches specialize exclusively in SLE preparation, with proven methodologies for Oral A, B, and C levels.", color: "teal" },
        { icon: Clock, title: "Flexible Scheduling", desc: "Sessions available early morning to late evening, accommodating diverse work schedules across time zones.", color: "blue" },
        { icon: BarChart3, title: "Progress Tracking", desc: "Real-time dashboards showing team progress, session completion rates, and predicted SLE readiness.", color: "emerald" },
        { icon: Headphones, title: "Dedicated Account Manager", desc: "A single point of contact to coordinate training schedules, handle billing, and ensure team success.", color: "orange" },
        { icon: Shield, title: "Secure & Compliant", desc: "Canadian-hosted platform meeting federal security requirements. No data leaves Canada.", color: "copper" },
        { icon: TrendingUp, title: "Cost-Effective", desc: "Volume discounts and flexible payment terms. No upfront costs for unused sessions.", color: "amber" },
      ],
      
      packagesTitle: "Team Training Packages",
      packagesSubtitle: "Scalable solutions for teams of any size",
      
      packages: [
        { name: "Starter Team", size: "5-10 Employees", price: ENTERPRISE_PRICES.TEAM_STARTER.priceDisplay, period: "per quarter", features: ["20 sessions per employee", "Group progress dashboard", "Email support", "Quarterly progress report"], popular: false },
        { name: "Growth Team", size: "11-25 Employees", price: ENTERPRISE_PRICES.TEAM_GROWTH.priceDisplay, period: "per quarter", features: ["25 sessions per employee", "Dedicated account manager", "Priority scheduling", "Monthly progress reports", "Custom curriculum options"], popular: true, popularLabel: "Most Popular" },
        { name: "Enterprise", size: "25+ Employees", price: "Custom", period: "contact us", features: ["Unlimited sessions", "On-site training options", "API integration", "Custom reporting", "SLA guarantees", "Invoice billing"], popular: false },
      ],
      
      testimonialsTitle: "Trusted by Federal Departments",
      testimonials: [
        { quote: "Lingueefy helped our team of 15 analysts achieve their bilingual requirements in just 6 months. The progress tracking made it easy to report to senior management.", author: "Director, Policy Branch", dept: "Treasury Board Secretariat", rating: 5 },
        { quote: "The flexibility of scheduling around our operational demands was crucial. Our officers could train without impacting service delivery.", author: "Regional Manager", dept: "Immigration, Refugees and Citizenship Canada", rating: 5 },
        { quote: "We've tried several language training providers. Lingueefy's SLE-specific approach and coach quality are unmatched.", author: "HR Director", dept: "Health Canada", rating: 5 },
      ],
      
      processTitle: "How It Works",
      processSubtitle: "Getting started is simple",
      process: [
        { title: "Initial Consultation", desc: "We assess your team's current levels and training goals" },
        { title: "Custom Training Plan", desc: "Receive a tailored curriculum and schedule for your team" },
        { title: "Coach Matching", desc: "We match each employee with the ideal coach for their level" },
        { title: "Training & Tracking", desc: "Sessions begin with real-time progress monitoring" },
      ],
      
      contactTitle: "Request a Consultation",
      contactSubtitle: "Tell us about your team's language training needs",
      formName: "Your Name",
      formEmail: "Work Email",
      formDepartment: "Department",
      formTeamSize: "Team Size",
      formTeamSizePlaceholder: "Select team size",
      formTeamSizes: ["1-5 employees", "6-10 employees", "11-25 employees", "26-50 employees", "50+ employees"],
      formMessage: "Tell us about your training needs",
      formSubmit: "Request Consultation",
      formSuccess: "Thank you! We'll be in touch within 24 hours.",
      
      faqTitle: "Frequently Asked Questions",
      faqs: [
        { q: "Can we use our departmental training budget?", a: "Yes, Lingueefy is an approved vendor for most federal departments. We can provide quotes and invoices compatible with your procurement process." },
        { q: "What if an employee leaves mid-training?", a: "Unused sessions can be transferred to another team member or credited to your account for future use." },
        { q: "Do you offer group sessions?", a: "Yes, we offer both 1-on-1 coaching and small group sessions (up to 4 participants) for team-building and peer learning." },
        { q: "How do you measure progress?", a: "Each session includes assessment notes. We provide monthly reports with predicted SLE readiness scores based on our proprietary evaluation framework." },
      ],
      
      trustedBy: "TRUSTED BY PUBLIC SERVANTS FROM",
      finalCtaBadge: "Get Started",
      finalCtaTitle: "Ready to Transform Your Team's Bilingual Capacity?",
      finalCtaSubtitle: "Join 50+ federal departments that have achieved their language training goals with Lingueefy.",
      finalCtaPrimary: "Request a Demo",
      finalCtaSecondary: "Contact Sales",
      trustSignals: ["Approved vendor", "Canadian-hosted", "Dedicated support"],
    },
    fr: {
      badge: "Solutions Entreprise",
      title: "Formation linguistique pour les",
      titleHighlight: "équipes gouvernementales",
      subtitle: "Donnez à votre ministère une préparation aux ELS évolutive et axée sur les résultats. Lingueefy aide les équipes fédérales à atteindre leurs exigences bilingues de manière efficace et rentable.",
      ctaPrimary: "Demander une démo",
      ctaSecondary: "Télécharger la brochure",
      
      stat1Value: "94%",
      stat1Label: "Taux de réussite ELS",
      stat2Value: "2,500+",
      stat2Label: "Fonctionnaires formés",
      stat3Value: "50+",
      stat3Label: "Ministères servis",
      stat4Value: "4.8/5",
      stat4Label: "Satisfaction client",
      
      benefitsTitle: "Pourquoi les ministères choisissent Lingueefy",
      benefitsSubtitle: "Conçu spécifiquement pour les besoins uniques de la formation linguistique du gouvernement fédéral canadien",
      
      benefits: [
        { icon: Target, title: "Programme axé sur les ELS", desc: "Nos coachs se spécialisent exclusivement dans la préparation aux ELS, avec des méthodologies éprouvées pour les niveaux oraux A, B et C.", color: "teal" },
        { icon: Clock, title: "Horaires flexibles", desc: "Sessions disponibles tôt le matin jusqu'en soirée, accommodant divers horaires de travail à travers les fuseaux horaires.", color: "blue" },
        { icon: BarChart3, title: "Suivi des progrès", desc: "Tableaux de bord en temps réel montrant les progrès de l'équipe, les taux de complétion et la préparation prévue aux ELS.", color: "emerald" },
        { icon: Headphones, title: "Gestionnaire de compte dédié", desc: "Un point de contact unique pour coordonner les horaires de formation, gérer la facturation et assurer le succès de l'équipe.", color: "orange" },
        { icon: Shield, title: "Sécurisé et conforme", desc: "Plateforme hébergée au Canada répondant aux exigences de sécurité fédérales. Aucune donnée ne quitte le Canada.", color: "copper" },
        { icon: TrendingUp, title: "Rentable", desc: "Remises sur volume et conditions de paiement flexibles. Pas de frais initiaux pour les sessions non utilisées.", color: "amber" },
      ],
      
      packagesTitle: "Forfaits de formation d'équipe",
      packagesSubtitle: "Solutions évolutives pour les équipes de toutes tailles",
      
      packages: [
        { name: "Équipe Débutante", size: "5-10 Employés", price: "4 500 $", period: "par trimestre", features: ["20 sessions par employé", "Tableau de bord de groupe", "Support par courriel", "Rapport trimestriel"], popular: false },
        { name: "Équipe Croissance", size: "11-25 Employés", price: "8 000 $", period: "par trimestre", features: ["25 sessions par employé", "Gestionnaire de compte dédié", "Planification prioritaire", "Rapports mensuels", "Options de programme personnalisé"], popular: true, popularLabel: "Le plus populaire" },
        { name: "Entreprise", size: "25+ Employés", price: "Sur mesure", period: "contactez-nous", features: ["Sessions illimitées", "Options de formation sur place", "Intégration API", "Rapports personnalisés", "Garanties SLA", "Facturation"], popular: false },
      ],
      
      testimonialsTitle: "Approuvé par les ministères fédéraux",
      testimonials: [
        { quote: "Lingueefy a aidé notre équipe de 15 analystes à atteindre leurs exigences bilingues en seulement 6 mois. Le suivi des progrès a facilité les rapports à la haute direction.", author: "Directeur, Direction des politiques", dept: "Secrétariat du Conseil du Trésor", rating: 5 },
        { quote: "La flexibilité de planification autour de nos demandes opérationnelles était cruciale. Nos agents pouvaient se former sans impacter la prestation de services.", author: "Gestionnaire régional", dept: "Immigration, Réfugiés et Citoyenneté Canada", rating: 5 },
        { quote: "Nous avons essayé plusieurs fournisseurs de formation linguistique. L'approche spécifique aux ELS de Lingueefy et la qualité des coachs sont inégalées.", author: "Directeur RH", dept: "Santé Canada", rating: 5 },
      ],
      
      processTitle: "Comment ça fonctionne",
      processSubtitle: "Commencer est simple",
      process: [
        { title: "Consultation initiale", desc: "Nous évaluons les niveaux actuels et les objectifs de formation de votre équipe" },
        { title: "Plan de formation personnalisé", desc: "Recevez un programme et un calendrier adaptés à votre équipe" },
        { title: "Jumelage avec un coach", desc: "Nous jumelons chaque employé avec le coach idéal pour son niveau" },
        { title: "Formation et suivi", desc: "Les sessions commencent avec un suivi des progrès en temps réel" },
      ],
      
      contactTitle: "Demander une consultation",
      contactSubtitle: "Parlez-nous des besoins de formation linguistique de votre équipe",
      formName: "Votre nom",
      formEmail: "Courriel professionnel",
      formDepartment: "Ministère",
      formTeamSize: "Taille de l'équipe",
      formTeamSizePlaceholder: "Sélectionner la taille",
      formTeamSizes: ["1-5 employés", "6-10 employés", "11-25 employés", "26-50 employés", "50+ employés"],
      formMessage: "Parlez-nous de vos besoins de formation",
      formSubmit: "Demander une consultation",
      formSuccess: "Merci! Nous vous contacterons dans les 24 heures.",
      
      faqTitle: "Questions fréquemment posées",
      faqs: [
        { q: "Pouvons-nous utiliser notre budget de formation ministériel?", a: "Oui, Lingueefy est un fournisseur approuvé pour la plupart des ministères fédéraux. Nous pouvons fournir des devis et factures compatibles avec votre processus d'approvisionnement." },
        { q: "Que se passe-t-il si un employé part en cours de formation?", a: "Les sessions non utilisées peuvent être transférées à un autre membre de l'équipe ou créditées à votre compte pour une utilisation future." },
        { q: "Offrez-vous des sessions de groupe?", a: "Oui, nous offrons à la fois du coaching 1-à-1 et des sessions en petit groupe (jusqu'à 4 participants) pour le renforcement d'équipe et l'apprentissage entre pairs." },
        { q: "Comment mesurez-vous les progrès?", a: "Chaque session inclut des notes d'évaluation. Nous fournissons des rapports mensuels avec des scores de préparation aux ELS prédits basés sur notre cadre d'évaluation propriétaire." },
      ],
      
      trustedBy: "APPROUVÉ PAR LES FONCTIONNAIRES DE",
      finalCtaBadge: "Commencer",
      finalCtaTitle: "Prêt à transformer la capacité bilingue de votre équipe?",
      finalCtaSubtitle: "Rejoignez plus de 50 ministères fédéraux qui ont atteint leurs objectifs de formation linguistique avec Lingueefy.",
      finalCtaPrimary: "Demander une démo",
      finalCtaSecondary: "Contacter les ventes",
      trustSignals: ["Fournisseur approuvé", "Hébergé au Canada", "Support dédié"],
    },
  };

  const t = labels[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const federalOrgs = [
    "Treasury Board",
    "Health Canada",
    "ESDC",
    "CRA",
    "IRCC",
    "DND",
  ];

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section - Premium Dark Gradient */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-3xl" />
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
          
          <div className="container relative z-10 py-20">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8">
                <Building2 className="h-4 w-4 text-teal-400" />
                <span>{t.badge}</span>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t.title}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                  {t.titleHighlight}
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                {t.subtitle}
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/25 border-0 px-8"
                >
                  {t.ctaPrimary}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t.ctaSecondary}
                </Button>
              </div>
              
              {/* Stats - Glassmorphism Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: t.stat1Value, label: t.stat1Label },
                  { value: t.stat2Value, label: t.stat2Label },
                  { value: t.stat3Value, label: t.stat3Label },
                  { value: t.stat4Value, label: t.stat4Label },
                ].map((stat, i) => (
                  <div 
                    key={i}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section 
          className="py-20 bg-gradient-to-b from-white to-slate-50"
          ref={(el) => { if (el) sectionRefs.current.set('benefits', el); }}
          data-section="benefits"
        >
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.benefitsTitle}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t.benefitsSubtitle}</p>
            </div>

            <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${
              visibleSections.has('benefits') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {t.benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                const colorClasses: Record<string, string> = {
                  teal: "bg-teal-100 text-teal-600",
                  blue: "bg-blue-100 text-blue-600",
                  emerald: "bg-emerald-100 text-emerald-600",
                  orange: "bg-orange-100 text-orange-600",
                  copper: "bg-[#FFF1E8] text-[#C65A1E]",
                  amber: "bg-amber-100 text-amber-600",
                };
                return (
                  <div 
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className={`h-12 w-12 rounded-xl ${colorClasses[benefit.color]} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="container">
            <p className="text-center text-sm text-muted-foreground tracking-wider mb-8">{t.trustedBy}</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {federalOrgs.map((org, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">{org}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          className="py-20 bg-white"
          ref={(el) => { if (el) sectionRefs.current.set('process', el); }}
          data-section="process"
        >
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.processTitle}</h2>
              <p className="text-muted-foreground">{t.processSubtitle}</p>
            </div>

            <div className={`grid md:grid-cols-4 gap-6 transition-all duration-700 ${
              visibleSections.has('process') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {t.process.map((step, i) => (
                <div key={i} className="relative">
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 h-full border border-teal-100">
                    <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {i + 1}
                    </div>
                    <div className="pt-4">
                      <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.desc}</p>
                    </div>
                  </div>
                  {i < t.process.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-teal-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section 
          className="py-20 bg-gradient-to-b from-slate-50 to-white"
          ref={(el) => { if (el) sectionRefs.current.set('packages', el); }}
          data-section="packages"
        >
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.packagesTitle}</h2>
              <p className="text-muted-foreground">{t.packagesSubtitle}</p>
            </div>

            <div className={`grid md:grid-cols-3 gap-8 max-w-5xl mx-auto transition-all duration-700 ${
              visibleSections.has('packages') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {t.packages.map((pkg, i) => (
                <div 
                  key={i}
                  className={`relative rounded-2xl p-8 ${
                    pkg.popular 
                      ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-500/25 scale-105' 
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {pkg.popular && pkg.popularLabel && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#C65A1E] text-white border-0 shadow-lg">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {pkg.popularLabel}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold mb-1 ${pkg.popular ? 'text-white' : ''}`}>{pkg.name}</h3>
                    <p className={`text-sm ${pkg.popular ? 'text-white/70' : 'text-muted-foreground'}`}>{pkg.size}</p>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className={`text-4xl font-bold ${pkg.popular ? 'text-white' : ''}`}>{pkg.price}</div>
                    <div className={`text-sm ${pkg.popular ? 'text-white/70' : 'text-muted-foreground'}`}>{pkg.period}</div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 shrink-0 ${pkg.popular ? 'text-white' : 'text-teal-500'}`} />
                        <span className={`text-sm ${pkg.popular ? 'text-white/90' : 'text-muted-foreground'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      pkg.popular 
                        ? 'bg-white text-teal-600 hover:bg-white/90' 
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                    size="lg"
                  >
                    {t.ctaPrimary}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          className="py-20 bg-white"
          ref={(el) => { if (el) sectionRefs.current.set('testimonials', el); }}
          data-section="testimonials"
        >
          <div className="container">
            <div className="text-center mb-16">
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 mb-4">
                Success Stories
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">{t.testimonialsTitle}</h2>
            </div>

            <div className={`grid md:grid-cols-3 gap-8 transition-all duration-700 ${
              visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {t.testimonials.map((testimonial, i) => (
                <div 
                  key={i}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-teal-200 mb-4" />
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.dept}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section 
          className="py-20 bg-gradient-to-b from-slate-50 to-white"
          ref={(el) => { if (el) sectionRefs.current.set('contact', el); }}
          data-section="contact"
        >
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.contactTitle}</h2>
                <p className="text-muted-foreground">{t.contactSubtitle}</p>
              </div>

              {formSubmitted ? (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 text-center border border-teal-100">
                  <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-teal-600" />
                  </div>
                  <p className="text-lg font-medium">{t.formSuccess}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.formName}</Label>
                        <Input id="name" required className="border-slate-200 focus:border-teal-500" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.formEmail}</Label>
                        <Input id="email" type="email" required className="border-slate-200 focus:border-teal-500" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="department">{t.formDepartment}</Label>
                        <Input id="department" required className="border-slate-200 focus:border-teal-500" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teamSize">{t.formTeamSize}</Label>
                        <Select required>
                          <SelectTrigger className="border-slate-200">
                            <SelectValue placeholder={t.formTeamSizePlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {t.formTeamSizes.map((size, i) => (
                              <SelectItem key={i} value={String(i + 1)}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t.formMessage}</Label>
                      <Textarea id="message" rows={4} className="border-slate-200 focus:border-teal-500" />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600" size="lg">
                      {t.formSubmit}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section 
          className="py-20 bg-white"
          ref={(el) => { if (el) sectionRefs.current.set('faq', el); }}
          data-section="faq"
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.faqTitle}</h2>
            </div>

            <div className={`max-w-3xl mx-auto space-y-4 transition-all duration-700 ${
              visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {t.faqs.map((faq, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer"
                  style={{ transitionDelay: `${i * 100}ms` }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold pr-4">{faq.q}</h3>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`} />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? 'max-h-40 mt-3' : 'max-h-0'
                    }`}>
                      <p className="text-muted-foreground text-sm">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span>{t.finalCtaBadge}</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {t.finalCtaTitle}
              </h2>
              
              <p className="text-lg text-white/70 mb-10">
                {t.finalCtaSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/25 border-0 px-8"
                >
                  {t.finalCtaPrimary}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {t.finalCtaSecondary}
                </Button>
              </div>
              
              {/* Trust signals */}
              <div className="flex flex-wrap justify-center gap-6 text-white/60 text-sm">
                {t.trustSignals.map((signal, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400" />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
