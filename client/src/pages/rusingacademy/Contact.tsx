import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
} from "lucide-react";

export default function RusingAcademyContact() {
  const { language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    contactName: "",
    email: "",
    phone: "",
    organizationType: "",
    teamSize: "",
    currentLevel: "",
    targetLevel: "",
    timeline: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to backend
    setFormSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const organizationTypes = [
    { valueEn: "federal", valueFr: "federal", labelEn: "Federal Government", labelFr: "Gouvernement fédéral" },
    { valueEn: "provincial", valueFr: "provincial", labelEn: "Provincial Government", labelFr: "Gouvernement provincial" },
    { valueEn: "municipal", valueFr: "municipal", labelEn: "Municipal Government", labelFr: "Gouvernement municipal" },
    { valueEn: "crown", valueFr: "crown", labelEn: "Crown Corporation", labelFr: "Société d'État" },
    { valueEn: "private", valueFr: "private", labelEn: "Private Enterprise", labelFr: "Entreprise privée" },
    { valueEn: "npo", valueFr: "npo", labelEn: "Non-Profit Organization", labelFr: "Organisation à but non lucratif" },
  ];

  const teamSizes = [
    { value: "1-10", labelEn: "1-10 learners", labelFr: "1-10 apprenants" },
    { value: "11-25", labelEn: "11-25 learners", labelFr: "11-25 apprenants" },
    { value: "26-50", labelEn: "26-50 learners", labelFr: "26-50 apprenants" },
    { value: "51-100", labelEn: "51-100 learners", labelFr: "51-100 apprenants" },
    { value: "100+", labelEn: "100+ learners", labelFr: "100+ apprenants" },
  ];

  const levels = [
    { value: "A1", label: "A1 - Beginner / Débutant" },
    { value: "A2", label: "A2 - Elementary / Élémentaire" },
    { value: "B1", label: "B1 - Intermediate / Intermédiaire" },
    { value: "B2", label: "B2 - Upper Intermediate / Intermédiaire supérieur" },
    { value: "C1", label: "C1 - Advanced / Avancé" },
    { value: "BBB", label: "BBB - SLE Certification" },
    { value: "CBC", label: "CBC - SLE Certification" },
    { value: "CCC", label: "CCC - SLE Certification" },
  ];

  const timelines = [
    { value: "immediate", labelEn: "Immediate (within 2 weeks)", labelFr: "Immédiat (dans 2 semaines)" },
    { value: "1month", labelEn: "Within 1 month", labelFr: "Dans 1 mois" },
    { value: "3months", labelEn: "Within 3 months", labelFr: "Dans 3 mois" },
    { value: "6months", labelEn: "Within 6 months", labelFr: "Dans 6 mois" },
    { value: "planning", labelEn: "Just planning / exploring", labelFr: "En planification / exploration" },
  ];

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F3] via-white to-[#FDFBF7]">
        
        <main className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Thank You!" : "Merci!"}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {language === "en"
                  ? "Your proposal request has been received. Our team will contact you within 24-48 business hours."
                  : "Votre demande de proposition a été reçue. Notre équipe vous contactera dans les 24-48 heures ouvrables."
                }
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {language === "en" ? "Expected response: 24-48 hours" : "Réponse attendue: 24-48 heures"}
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F3] via-white to-[#FDFBF7]">
      
      
      <main id="main-content" className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#E07B39]/10 border border-[#E07B39]/20 text-gray-800 text-sm">
                <Building2 className="w-4 h-4 text-[#E07B39]" />
                {language === "en" ? "B2B/B2G Solutions" : "Solutions B2B/B2G"}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Request a Proposal" : "Demander une proposition"}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {language === "en"
                  ? "Tell us about your organization's bilingual training needs and we'll create a customized solution"
                  : "Parlez-nous des besoins de formation bilingue de votre organisation et nous créerons une solution personnalisée"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E07B39] to-[#C45E1A] text-white">
                    <h3 className="text-xl font-bold mb-4">
                      {language === "en" ? "Contact Information" : "Coordonnées"}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 mt-0.5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <a href="mailto:b2b@rusingacademy.com" className="text-white/80 hover:text-white">
                            b2b@rusingacademy.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 mt-0.5" />
                        <div>
                          <p className="font-medium">{language === "en" ? "Phone" : "Téléphone"}</p>
                          <a href="tel:+16135551234" className="text-white/80 hover:text-white">
                            +1 (613) 555-1234
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 mt-0.5" />
                        <div>
                          <p className="font-medium">{language === "en" ? "Address" : "Adresse"}</p>
                          <p className="text-white/80">
                            Ottawa, Ontario, Canada
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50">
                    <h3 className="font-bold text-gray-900 mb-4">
                      {language === "en" ? "What to Expect" : "À quoi s'attendre"}
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#E07B39] flex-shrink-0 mt-0.5" />
                        {language === "en" ? "Response within 24-48 hours" : "Réponse dans 24-48 heures"}
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#E07B39] flex-shrink-0 mt-0.5" />
                        {language === "en" ? "Free needs assessment call" : "Appel d'évaluation des besoins gratuit"}
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#E07B39] flex-shrink-0 mt-0.5" />
                        {language === "en" ? "Customized proposal within 5 days" : "Proposition personnalisée dans 5 jours"}
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#E07B39] flex-shrink-0 mt-0.5" />
                        {language === "en" ? "No obligation to proceed" : "Aucune obligation de poursuivre"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organization Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Organization Name" : "Nom de l'organisation"} *
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        required
                        value={formData.organizationName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                        placeholder={language === "en" ? "Enter organization name" : "Entrez le nom de l'organisation"}
                      />
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Contact Name" : "Nom du contact"} *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        required
                        value={formData.contactName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                        placeholder={language === "en" ? "Your full name" : "Votre nom complet"}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Email Address" : "Adresse courriel"} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                        placeholder="email@organization.gc.ca"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Phone Number" : "Numéro de téléphone"}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                        placeholder="+1 (613) 555-1234"
                      />
                    </div>

                    {/* Organization Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Organization Type" : "Type d'organisation"} *
                      </label>
                      <select
                        name="organizationType"
                        required
                        value={formData.organizationType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                      >
                        <option value="">{language === "en" ? "Select type" : "Sélectionnez le type"}</option>
                        {organizationTypes.map((type) => (
                          <option key={type.valueEn} value={type.valueEn}>
                            {language === "en" ? type.labelEn : type.labelFr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Team Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Team Size" : "Taille de l'équipe"} *
                      </label>
                      <select
                        name="teamSize"
                        required
                        value={formData.teamSize}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                      >
                        <option value="">{language === "en" ? "Select size" : "Sélectionnez la taille"}</option>
                        {teamSizes.map((size) => (
                          <option key={size.value} value={size.value}>
                            {language === "en" ? size.labelEn : size.labelFr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Current Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Current Level (Average)" : "Niveau actuel (moyenne)"}
                      </label>
                      <select
                        name="currentLevel"
                        value={formData.currentLevel}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                      >
                        <option value="">{language === "en" ? "Select level" : "Sélectionnez le niveau"}</option>
                        {levels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Target Level" : "Niveau cible"} *
                      </label>
                      <select
                        name="targetLevel"
                        required
                        value={formData.targetLevel}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                      >
                        <option value="">{language === "en" ? "Select target" : "Sélectionnez la cible"}</option>
                        {levels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Timeline */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Desired Timeline" : "Échéancier souhaité"} *
                      </label>
                      <select
                        name="timeline"
                        required
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all"
                      >
                        <option value="">{language === "en" ? "Select timeline" : "Sélectionnez l'échéancier"}</option>
                        {timelines.map((timeline) => (
                          <option key={timeline.value} value={timeline.value}>
                            {language === "en" ? timeline.labelEn : timeline.labelFr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Additional Information" : "Informations supplémentaires"}
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E07B39] focus:ring-2 focus:ring-[#E07B39]/20 outline-none transition-all resize-none"
                        placeholder={language === "en" 
                          ? "Tell us more about your training needs, specific requirements, or any questions..."
                          : "Parlez-nous de vos besoins de formation, exigences spécifiques ou questions..."
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button 
                      type="submit"
                      size="lg"
                      className="w-full bg-[#E07B39] hover:bg-[#C45E1A] text-white rounded-full h-14 text-lg font-semibold"
                    >
                      {language === "en" ? "Submit Proposal Request" : "Soumettre la demande de proposition"}
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
