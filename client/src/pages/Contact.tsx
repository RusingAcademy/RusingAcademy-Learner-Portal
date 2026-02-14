import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  HelpCircle,
  Users,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Link } from "wouter";

export default function Contact() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    brand: "ecosystem",
  });

  const labels = {
    en: {
      title: "Get in Touch",
      subtitle: "We're here to help you succeed in your bilingual journey. Reach out to us anytime.",
      formTitle: "Send us a message",
      formDescription: "Fill out the form below and our team will respond within 24 hours.",
      name: "Full Name",
      namePlaceholder: "Enter your full name",
      email: "Email Address",
      emailPlaceholder: "your.email@example.com",
      phone: "Phone Number (Optional)",
      phonePlaceholder: "+1 (613) 600-6533",
      subject: "How can we help?",
      subjectPlaceholder: "Select a topic",
      subjects: {
        general: "General Inquiry",
        learner: "Learner Support",
        coach: "Become a Coach",
        technical: "Technical Support",
        billing: "Billing & Payments",
        partnership: "Partnership Opportunity",
        enterprise: "Enterprise Solutions",
      },
      brand: "Which brand are you contacting?",
      brands: {
        ecosystem: "Ecosystem Hub (General)",
        rusingacademy: "RusingÂcademy",
        lingueefy: "Lingueefy",
        barholex: "Barholex Media",
      },
      message: "Your Message",
      messagePlaceholder: "Tell us how we can help you...",
      send: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully! We'll get back to you within 24 hours.",
      error: "Failed to send message. Please try again.",
      contactInfo: "Contact Information",
      emailUs: "Email",
      emailAddress: "admin@rusingacademy.ca",
      phoneUs: "Phone",
      phoneNumber: "+1 (613) 600-6533",
      responseTime: "Response Time",
      responseTimeValue: "Within 24 hours",
      location: "Location",
      locationValue: "Ottawa, Ontario, Canada",
      officeHours: "Office Hours",
      officeHoursValue: "Mon-Fri: 9AM - 9PM EST",
      quickLinks: "Quick Links",
      faqTitle: "Frequently Asked Questions",
      faqDescription: "Find quick answers to common questions",
      faqLink: "Visit FAQ",
      coachSupport: "Become a Coach",
      coachSupportDesc: "Join our team of expert language coaches",
      coachSupportLink: "Apply Now",
      b2b: "Enterprise Solutions",
      b2bDesc: "Training solutions for organizations",
      b2bLink: "Learn More",
      trustedBy: "Trusted by 2,500+ Canadian public servants",
      features: [
        "24-hour response guarantee",
        "Bilingual support team",
        "Dedicated account managers for enterprise",
      ],
    },
    fr: {
      title: "Contactez-nous",
      subtitle: "Nous sommes là pour vous aider à réussir votre parcours bilingue. Contactez-nous à tout moment.",
      formTitle: "Envoyez-nous un message",
      formDescription: "Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les 24 heures.",
      name: "Nom complet",
      namePlaceholder: "Entrez votre nom complet",
      email: "Adresse courriel",
      emailPlaceholder: "votre.courriel@exemple.com",
      phone: "Numéro de téléphone (Optionnel)",
      phonePlaceholder: "+1 (613) 600-6533",
      subject: "Comment pouvons-nous vous aider?",
      subjectPlaceholder: "Sélectionnez un sujet",
      subjects: {
        general: "Demande générale",
        learner: "Support apprenant",
        coach: "Devenir coach",
        technical: "Support technique",
        billing: "Facturation et paiements",
        partnership: "Opportunité de partenariat",
        enterprise: "Solutions entreprise",
      },
      brand: "Quelle marque contactez-vous?",
      brands: {
        ecosystem: "Ecosystem Hub (Général)",
        rusingacademy: "RusingÂcademy",
        lingueefy: "Lingueefy",
        barholex: "Barholex Media",
      },
      message: "Votre message",
      messagePlaceholder: "Dites-nous comment nous pouvons vous aider...",
      send: "Envoyer le message",
      sending: "Envoi en cours...",
      success: "Message envoyé avec succès! Nous vous répondrons dans les 24 heures.",
      error: "Échec de l'envoi du message. Veuillez réessayer.",
      contactInfo: "Informations de contact",
      emailUs: "Courriel",
      emailAddress: "admin@rusingacademy.ca",
      phoneUs: "Téléphone",
      phoneNumber: "+1 (613) 600-6533",
      responseTime: "Temps de réponse",
      responseTimeValue: "Dans les 24 heures",
      location: "Emplacement",
      locationValue: "Ottawa, Ontario, Canada",
      officeHours: "Heures d'ouverture",
      officeHoursValue: "Lun-Ven: 9h - 21h HNE",
      quickLinks: "Liens rapides",
      faqTitle: "Questions fréquentes",
      faqDescription: "Trouvez des réponses rapides aux questions courantes",
      faqLink: "Voir la FAQ",
      coachSupport: "Devenir coach",
      coachSupportDesc: "Rejoignez notre équipe de coachs experts",
      coachSupportLink: "Postuler",
      b2b: "Solutions entreprise",
      b2bDesc: "Solutions de formation pour les organisations",
      b2bLink: "En savoir plus",
      trustedBy: "Approuvé par 2 500+ fonctionnaires canadiens",
      features: [
        "Garantie de réponse en 24 heures",
        "Équipe de support bilingue",
        "Gestionnaires de compte dédiés pour les entreprises",
      ],
    },
  };

  const l = labels[language];

  const contactMutation = trpc.contact.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // @ts-expect-error - TS2345: auto-suppressed during TS cleanup
      await contactMutation.mutateAsync(formData);
      
      toast.success(l.success);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        brand: "ecosystem",
      });
    } catch (error) {
      toast.error(l.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main id="main-content" className="flex-1">
        <Breadcrumb 
          items={[
            { label: "Contact", labelFr: "Contact" }
          ]} 
        />

        {/* Hero Section - White Background with Elegant Design */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          {/* Background with subtle gradient and decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white" />
          
          {/* Decorative orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
          
          {/* Dot pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle, #0f766e 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 mb-6">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">
                  {l.trustedBy}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-slate-800">{l.title}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                {l.subtitle}
              </p>

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                {l.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 lg:py-24 bg-slate-50/50">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="bg-white border-slate-200 shadow-lg shadow-slate-200/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-slate-800">{l.formTitle}</CardTitle>
                    <CardDescription className="text-slate-600">{l.formDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-700">{l.name}</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={l.namePlaceholder}
                            className="bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700">{l.email}</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={l.emailPlaceholder}
                            className="bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-slate-700">{l.phone}</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={l.phonePlaceholder}
                            className="bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brand" className="text-slate-700">{l.brand}</Label>
                          <Select 
                            name="brand" 
                            value={formData.brand}
                            onValueChange={(value) => setFormData({ ...formData, brand: value })}
                          >
                            <SelectTrigger id="brand" className="bg-white border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ecosystem">{l.brands.ecosystem}</SelectItem>
                              <SelectItem value="rusingacademy">{l.brands.rusingacademy}</SelectItem>
                              <SelectItem value="lingueefy">{l.brands.lingueefy}</SelectItem>
                              <SelectItem value="barholex">{l.brands.barholex}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-slate-700">{l.subject}</Label>
                        <Select 
                          name="subject" 
                          value={formData.subject}
                          onValueChange={(value) => setFormData({ ...formData, subject: value })}
                          required
                        >
                          <SelectTrigger id="subject" className="bg-white border-slate-200">
                            <SelectValue placeholder={l.subjectPlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">{l.subjects.general}</SelectItem>
                            <SelectItem value="learner">{l.subjects.learner}</SelectItem>
                            <SelectItem value="coach">{l.subjects.coach}</SelectItem>
                            <SelectItem value="technical">{l.subjects.technical}</SelectItem>
                            <SelectItem value="billing">{l.subjects.billing}</SelectItem>
                            <SelectItem value="partnership">{l.subjects.partnership}</SelectItem>
                            <SelectItem value="enterprise">{l.subjects.enterprise}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-700">{l.message}</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={l.messagePlaceholder}
                          rows={6}
                          className="bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500 resize-none"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/25 transition-all duration-300" 
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? l.sending : l.send}
                        <Send className="h-4 w-4 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info Sidebar */}
              <div className="space-y-6">
                {/* Contact Information Card */}
                <Card className="bg-white border-slate-200 shadow-lg shadow-slate-200/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-slate-800">{l.contactInfo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-teal-50">
                        <Mail className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{l.emailUs}</p>
                        <a
                          href="mailto:admin@rusingacademy.ca"
                          className="text-teal-600 hover:text-teal-700 hover:underline text-sm transition-colors"
                        >
                          {l.emailAddress}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-violet-50">
                        <Phone className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{l.phoneUs}</p>
                        <a
                          href="tel:+16136006533"
                          className="text-violet-600 hover:text-violet-700 hover:underline text-sm transition-colors"
                        >
                          {l.phoneNumber}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-amber-50">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{l.officeHours}</p>
                        <p className="text-slate-600 text-sm">{l.officeHoursValue}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-rose-50">
                        <MapPin className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{l.location}</p>
                        <p className="text-slate-600 text-sm">{l.locationValue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">{l.quickLinks}</h3>
                  
                  <Link href="/faq">
                    <Card className="bg-white border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-teal-50 group-hover:bg-teal-100 transition-colors">
                            <HelpCircle className="h-6 w-6 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{l.faqTitle}</h4>
                            <p className="text-sm text-slate-600">{l.faqDescription}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/become-a-coach">
                    <Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                            <Users className="h-6 w-6 text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{l.coachSupport}</h4>
                            <p className="text-sm text-slate-600">{l.coachSupportDesc}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/for-business">
                    <Card className="bg-white border-slate-200 hover:border-amber-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                            <Briefcase className="h-6 w-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">{l.b2b}</h4>
                            <p className="text-sm text-slate-600">{l.b2bDesc}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calendly Booking Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[#0F3D3E] to-[#145A5B]">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <Calendar className="h-12 w-12 text-[#C65A1E] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-3" style={{ color: '#f8f7f7' }}>
                {language === 'en' ? 'Book a Free Consultation' : 'Réservez une Consultation Gratuite'}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8" style={{ color: '#ffffff' }}>
                {language === 'en'
                  ? 'Schedule a 30-minute discovery call with our team to discuss your bilingual training needs and find the right program for you.'
                  : 'Planifiez un appel découverte de 30 minutes avec notre équipe pour discuter de vos besoins en formation bilingue et trouver le bon programme pour vous.'}
              </p>
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-[#C65A1E]/10 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-[#C65A1E]" />
                    </div>
                    <h3 className="font-semibold text-[#0F3D3E] mb-1">{language === 'en' ? '30 Minutes' : '30 Minutes'}</h3>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Quick discovery call' : 'Appel découverte rapide'}</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-[#C65A1E]/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-[#C65A1E]" />
                    </div>
                    <h3 className="font-semibold text-[#0F3D3E] mb-1">{language === 'en' ? 'Expert Team' : 'Équipe Experte'}</h3>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Certified language coaches' : 'Coachs linguistiques certifiés'}</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-[#C65A1E]/10 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-[#C65A1E]" />
                    </div>
                    <h3 className="font-semibold text-[#0F3D3E] mb-1">{language === 'en' ? 'Free & No Obligation' : 'Gratuit & Sans Engagement'}</h3>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'No commitment required' : 'Aucun engagement requis'}</p>
                  </div>
                </div>
                <Link href="/booking">
                  <Button className="bg-[#C65A1E] hover:bg-[#A84A15] text-white px-8 py-3 text-lg" size="lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    {language === 'en' ? 'Schedule Your Free Call' : 'Planifiez Votre Appel Gratuit'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section (Optional - can be added later) */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-8 lg:p-12 text-center">
                <MapPin className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {language === 'en' ? 'Based in Ottawa, Serving Canada' : 'Basé à Ottawa, au service du Canada'}
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  {language === 'en' 
                    ? 'Our team is proudly based in the National Capital Region, serving Canadian public servants and professionals across the country with bilingual excellence.'
                    : 'Notre équipe est fièrement basée dans la région de la capitale nationale, au service des fonctionnaires et professionnels canadiens à travers le pays avec excellence bilingue.'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
