// Header removed - using EcosystemLayout sub-header instead
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  Video,
  PenTool,
  Monitor,
  Sparkles,
  MessageSquare,
  Calendar,
  ArrowRight,
  Shield,
  Star,
  Zap,
  Globe,
  Mic,
} from "lucide-react";

export default function BarholexContact() {
  const { language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    budget: "",
    timeline: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const projectTypes = [
    { value: "video", labelEn: "Video Production", labelFr: "Production vidéo", icon: Video },
    { value: "audio", labelEn: "Audio Production", labelFr: "Production audio", icon: Mic },
    { value: "design", labelEn: "Graphic Design", labelFr: "Design graphique", icon: PenTool },
    { value: "web", labelEn: "Web Development", labelFr: "Développement web", icon: Monitor },
    { value: "localization", labelEn: "Localization", labelFr: "Localisation", icon: Globe },
    { value: "ai", labelEn: "AI Solutions", labelFr: "Solutions IA", icon: Sparkles },
    { value: "multiple", labelEn: "Multiple Services", labelFr: "Services multiples", icon: Zap },
  ];

  const budgets = [
    { value: "5k-10k", labelEn: "$5,000 - $10,000", labelFr: "5 000 $ - 10 000 $" },
    { value: "10k-25k", labelEn: "$10,000 - $25,000", labelFr: "10 000 $ - 25 000 $" },
    { value: "25k-50k", labelEn: "$25,000 - $50,000", labelFr: "25 000 $ - 50 000 $" },
    { value: "50k-100k", labelEn: "$50,000 - $100,000", labelFr: "50 000 $ - 100 000 $" },
    { value: "100k+", labelEn: "$100,000+", labelFr: "100 000 $+" },
    { value: "discuss", labelEn: "Let's discuss", labelFr: "À discuter" },
  ];

  const timelines = [
    { value: "asap", labelEn: "ASAP", labelFr: "Dès que possible" },
    { value: "1month", labelEn: "Within 1 month", labelFr: "Dans 1 mois" },
    { value: "3months", labelEn: "Within 3 months", labelFr: "Dans 3 mois" },
    { value: "6months", labelEn: "Within 6 months", labelFr: "Dans 6 mois" },
    { value: "flexible", labelEn: "Flexible", labelFr: "Flexible" },
  ];

  const TRUST_SIGNALS = [
    { icon: Shield, labelEn: "Government Certified", labelFr: "Certifié gouvernemental" },
    { icon: Star, labelEn: "5-Star Reviews", labelFr: "Avis 5 étoiles" },
    { icon: Clock, labelEn: "24h Response Time", labelFr: "Réponse en 24h" },
  ];

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
        <main className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {language === "en" ? "Message Received!" : "Message reçu!"}
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {language === "en"
                  ? "Thank you for reaching out. Our team will review your project details and get back to you within 24 hours."
                  : "Merci de nous avoir contactés. Notre équipe examinera les détails de votre projet et vous répondra dans les 24 heures."
                }
              </p>
              
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 inline-flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-[#D4AF37] font-medium">
                  {language === "en" ? "Expected response: Within 24 hours" : "Réponse attendue: Dans les 24 heures"}
                </span>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative pt-20 pb-12 px-4 overflow-hidden">
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
                  <MessageSquare className="w-4 h-4" />
                  {language === "en" ? "Start a Conversation" : "Démarrer une conversation"}
                </span>
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              >
                <span className="text-white">{language === "en" ? "Let's " : "Créons "}</span>
                <span className="bg-gradient-to-r from-[#D4AF37] via-[#F7DC6F] to-[#D4AF37] bg-clip-text text-transparent">
                  {language === "en" ? "Create Together" : "ensemble"}
                </span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              >
                {language === "en"
                  ? "Tell us about your project and we'll bring your vision to life. Our team is ready to help you succeed."
                  : "Parlez-nous de votre projet et nous donnerons vie à votre vision. Notre équipe est prête à vous aider à réussir."
                }
              </motion.p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    {/* Contact Card */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-black"
                    >
                      <h3 className="text-xl font-bold mb-6">
                        {language === "en" ? "Contact Information" : "Coordonnées"}
                      </h3>
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1">Email</p>
                            <a href="mailto:hello@barholexmedia.com" className="text-black/80 hover:text-black transition-colors">
                              hello@barholexmedia.com
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1">{language === "en" ? "Phone" : "Téléphone"}</p>
                            <a href="tel:+16135551234" className="text-black/80 hover:text-black transition-colors">
                              +1 (613) 555-1234
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1">{language === "en" ? "Studio" : "Studio"}</p>
                            <p className="text-black/80">
                              Ottawa, Ontario, Canada
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1">{language === "en" ? "Hours" : "Heures"}</p>
                            <p className="text-black/80">
                              {language === "en" ? "Mon-Fri: 9AM - 6PM EST" : "Lun-Ven: 9h - 18h HNE"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Services Quick Links */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                    >
                      <h3 className="font-bold text-white mb-4">
                        {language === "en" ? "Our Services" : "Nos services"}
                      </h3>
                      <div className="space-y-3">
                        {projectTypes.slice(0, 5).map((type) => (
                          <div key={type.value} className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                            <type.icon className="w-4 h-4 text-[#D4AF37]" />
                            {language === "en" ? type.labelEn : type.labelFr}
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Trust Signals */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      {TRUST_SIGNALS.map((signal, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <signal.icon className="w-5 h-5 text-[#D4AF37]" />
                          <span className="text-sm text-gray-300">
                            {language === "en" ? signal.labelEn : signal.labelFr}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>

                {/* Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2"
                >
                  <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {language === "en" ? "Tell Us About Your Project" : "Parlez-nous de votre projet"}
                    </h2>
                    <p className="text-gray-300 mb-8">
                      {language === "en" 
                        ? "Fill out the form below and we'll get back to you within 24 hours."
                        : "Remplissez le formulaire ci-dessous et nous vous répondrons dans les 24 heures."
                      }
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {language === "en" ? "Your Name" : "Votre nom"} <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                          placeholder={language === "en" ? "John Doe" : "Jean Dupont"}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {language === "en" ? "Email Address" : "Adresse courriel"} <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                          placeholder="email@company.com"
                        />
                      </div>

                      {/* Company */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {language === "en" ? "Company/Organization" : "Entreprise/Organisation"}
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                          placeholder={language === "en" ? "Company name" : "Nom de l'entreprise"}
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {language === "en" ? "Phone Number" : "Numéro de téléphone"}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                          placeholder="+1 (613) 555-1234"
                        />
                      </div>

                      {/* Project Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {language === "en" ? "Project Type" : "Type de projet"} <span className="text-[#D4AF37]">*</span>
                        </label>
                        <select
                          name="projectType"
                          required
                          value={formData.projectType}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                        >
                          <option value="" className="bg-gray-900">{language === "en" ? "Select type" : "Sélectionnez le type"}</option>
                          {projectTypes.map((type) => (
                            <option key={type.value} value={type.value} className="bg-gray-900">
                              {language === "en" ? type.labelEn : type.labelFr}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Budget */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {language === "en" ? "Budget Range" : "Fourchette budgétaire"}
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                        >
                          <option value="" className="bg-gray-900">{language === "en" ? "Select budget" : "Sélectionnez le budget"}</option>
                          {budgets.map((budget) => (
                            <option key={budget.value} value={budget.value} className="bg-gray-900">
                              {language === "en" ? budget.labelEn : budget.labelFr}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Timeline */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {language === "en" ? "Timeline" : "Échéancier"}
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {timelines.map((timeline) => (
                            <button
                              key={timeline.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, timeline: timeline.value })}
                              aria-pressed={formData.timeline === timeline.value}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                formData.timeline === timeline.value
                                  ? "bg-[#D4AF37] text-black"
                                  : "bg-white/5 text-white hover:bg-white/10 border border-white/20"
                              }`}
                            >
                              {language === "en" ? timeline.labelEn : timeline.labelFr}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {language === "en" ? "Project Details" : "Détails du projet"} <span className="text-[#D4AF37]">*</span>
                        </label>
                        <textarea
                          name="message"
                          rows={5}
                          required
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all resize-none"
                          placeholder={language === "en" 
                            ? "Tell us about your project, goals, and any specific requirements..."
                            : "Parlez-nous de votre projet, vos objectifs et toute exigence spécifique..."
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button 
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#D4AF37] text-black rounded-full h-14 text-lg font-semibold shadow-lg shadow-[#D4AF37]/20"
                      >
                        {language === "en" ? "Send Message" : "Envoyer le message"}
                        <Send className="ml-2 h-5 w-5" />
                      </Button>
                      
                      <p className="text-center text-sm text-gray-500 mt-4">
                        {language === "en" 
                          ? "By submitting, you agree to our privacy policy."
                          : "En soumettant, vous acceptez notre politique de confidentialité."
                        }
                      </p>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold mb-4">
                  {language === "en" ? "Frequently Asked Questions" : "Questions fréquemment posées"}
                </h2>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    qEn: "What is your typical project timeline?",
                    qFr: "Quel est votre délai de projet typique?",
                    aEn: "Project timelines vary based on scope and complexity. A typical video production takes 2-4 weeks, while web development projects range from 4-12 weeks.",
                    aFr: "Les délais de projet varient selon la portée et la complexité. Une production vidéo typique prend 2-4 semaines, tandis que les projets de développement web varient de 4-12 semaines.",
                  },
                  {
                    qEn: "Do you work with government clients?",
                    qFr: "Travaillez-vous avec des clients gouvernementaux?",
                    aEn: "Yes, we have extensive experience working with federal and provincial government departments, ensuring compliance with all accessibility and bilingual requirements.",
                    aFr: "Oui, nous avons une vaste expérience de travail avec les ministères fédéraux et provinciaux, assurant la conformité avec toutes les exigences d'accessibilité et de bilinguisme.",
                  },
                  {
                    qEn: "What languages do you support?",
                    qFr: "Quelles langues supportez-vous?",
                    aEn: "We specialize in English and French content, with localization capabilities for additional languages through our network of professional translators.",
                    aFr: "Nous nous spécialisons dans le contenu anglais et français, avec des capacités de localisation pour des langues supplémentaires grâce à notre réseau de traducteurs professionnels.",
                  },
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <h3 className="font-bold text-white mb-2">
                      {language === "en" ? faq.qEn : faq.qFr}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {language === "en" ? faq.aEn : faq.aFr}
                    </p>
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
