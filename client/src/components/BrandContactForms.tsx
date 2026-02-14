import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Language = "en" | "fr";
type Theme = "glass" | "light";

interface ContactFormProps {
  language: Language;
  theme: Theme;
  brand: "rusingacademy" | "lingueefy" | "barholex";
}

const labels = {
  rusingacademy: {
    title: { en: "Request Training Information", fr: "Demander des informations sur la formation" },
    subtitle: { en: "Tell us about your team's learning needs", fr: "Parlez-nous des besoins de formation de votre équipe" },
    name: { en: "Full Name", fr: "Nom complet" },
    email: { en: "Work Email", fr: "Courriel professionnel" },
    organization: { en: "Organization / Department", fr: "Organisation / Ministère" },
    teamSize: { en: "Team Size", fr: "Taille de l'équipe" },
    currentLevel: { en: "Current SLE Level (majority)", fr: "Niveau ELS actuel (majorité)" },
    targetLevel: { en: "Target SLE Level", fr: "Niveau ELS visé" },
    timeline: { en: "Training Timeline", fr: "Échéancier de formation" },
    budget: { en: "Estimated Budget Range", fr: "Fourchette budgétaire estimée" },
    message: { en: "Additional Details", fr: "Détails supplémentaires" },
    submit: { en: "Request Information", fr: "Demander des informations" },
    success: { en: "Thank you! We'll contact you within 24 hours.", fr: "Merci! Nous vous contacterons dans les 24 heures." },
  },
  lingueefy: {
    title: { en: "Find Your Perfect Coach", fr: "Trouvez votre coach idéal" },
    subtitle: { en: "Tell us about your language goals", fr: "Parlez-nous de vos objectifs linguistiques" },
    name: { en: "Full Name", fr: "Nom complet" },
    email: { en: "Email Address", fr: "Adresse courriel" },
    phone: { en: "Phone (optional)", fr: "Téléphone (optionnel)" },
    currentLevel: { en: "Current SLE Level", fr: "Niveau ELS actuel" },
    targetLevel: { en: "Target SLE Level", fr: "Niveau ELS visé" },
    targetSkill: { en: "Focus Area", fr: "Domaine de concentration" },
    preferredLanguage: { en: "Preferred Coaching Language", fr: "Langue de coaching préférée" },
    availability: { en: "Preferred Schedule", fr: "Horaire préféré" },
    message: { en: "Tell us about your goals", fr: "Parlez-nous de vos objectifs" },
    submit: { en: "Find My Coach", fr: "Trouver mon coach" },
    success: { en: "We'll match you with the perfect coach!", fr: "Nous vous jumelerons avec le coach parfait!" },
  },
  barholex: {
    title: { en: "Start Your Project", fr: "Démarrez votre projet" },
    subtitle: { en: "Tell us about your media or coaching needs", fr: "Parlez-nous de vos besoins média ou coaching" },
    name: { en: "Full Name", fr: "Nom complet" },
    email: { en: "Email Address", fr: "Adresse courriel" },
    organization: { en: "Organization", fr: "Organisation" },
    role: { en: "Your Role", fr: "Votre rôle" },
    serviceType: { en: "Service Type", fr: "Type de service" },
    projectDescription: { en: "Project Description", fr: "Description du projet" },
    budget: { en: "Budget Range", fr: "Fourchette budgétaire" },
    timeline: { en: "Project Timeline", fr: "Échéancier du projet" },
    message: { en: "Additional Requirements", fr: "Exigences supplémentaires" },
    submit: { en: "Request Quote", fr: "Demander un devis" },
    success: { en: "We'll send you a custom quote within 48 hours.", fr: "Nous vous enverrons un devis personnalisé dans les 48 heures." },
  },
};

const sleOptions = [
  { value: "none", label: { en: "No SLE", fr: "Aucun ELS" } },
  { value: "a", label: { en: "Level A", fr: "Niveau A" } },
  { value: "b", label: { en: "Level B", fr: "Niveau B" } },
  { value: "c", label: { en: "Level C", fr: "Niveau C" } },
  { value: "exempt", label: { en: "Exempt", fr: "Exempté" } },
];

const teamSizeOptions = [
  { value: "1-5", label: { en: "1-5 employees", fr: "1-5 employés" } },
  { value: "6-15", label: { en: "6-15 employees", fr: "6-15 employés" } },
  { value: "16-50", label: { en: "16-50 employees", fr: "16-50 employés" } },
  { value: "50+", label: { en: "50+ employees", fr: "50+ employés" } },
];

const budgetOptions = {
  rusingacademy: [
    { value: "5k-15k", label: { en: "$5,000 - $15,000", fr: "5 000 $ - 15 000 $" } },
    { value: "15k-50k", label: { en: "$15,000 - $50,000", fr: "15 000 $ - 50 000 $" } },
    { value: "50k-100k", label: { en: "$50,000 - $100,000", fr: "50 000 $ - 100 000 $" } },
    { value: "100k+", label: { en: "$100,000+", fr: "100 000 $+" } },
  ],
  barholex: [
    { value: "2k-10k", label: { en: "$2,000 - $10,000", fr: "2 000 $ - 10 000 $" } },
    { value: "10k-25k", label: { en: "$10,000 - $25,000", fr: "10 000 $ - 25 000 $" } },
    { value: "25k-75k", label: { en: "$25,000 - $75,000", fr: "25 000 $ - 75 000 $" } },
    { value: "75k+", label: { en: "$75,000+", fr: "75 000 $+" } },
  ],
};

const serviceTypes = [
  { value: "executive-presence", label: { en: "Executive Presence Coaching", fr: "Coaching présence exécutive" } },
  { value: "video-production", label: { en: "Video Production", fr: "Production vidéo" } },
  { value: "podcast", label: { en: "Podcast Production", fr: "Production de podcast" } },
  { value: "strategic-comms", label: { en: "Strategic Communications", fr: "Communications stratégiques" } },
  { value: "media-training", label: { en: "Media Training", fr: "Formation média" } },
  { value: "other", label: { en: "Other", fr: "Autre" } },
];

const focusAreas = [
  { value: "oral-comprehension", label: { en: "Oral Comprehension", fr: "Compréhension orale" } },
  { value: "oral-expression", label: { en: "Oral Expression", fr: "Expression orale" } },
  { value: "written-comprehension", label: { en: "Written Comprehension", fr: "Compréhension écrite" } },
  { value: "written-expression", label: { en: "Written Expression", fr: "Expression écrite" } },
  { value: "all", label: { en: "All Skills", fr: "Toutes les compétences" } },
];

const brandColors = {
  rusingacademy: "#FF6A2B",
  lingueefy: "#17E2C6",
  barholex: "#8B5CFF",
};

export function RusingAcademyContactForm({ language, theme }: Omit<ContactFormProps, "brand">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    teamSize: "",
    currentLevel: "",
    targetLevel: "",
    timeline: "",
    budget: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const importLeads = trpc.crm.importLeads.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await importLeads.mutateAsync({
        leads: [{
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          company: formData.organization,
          source: "rusingacademy_contact",
          notes: `Team Size: ${formData.teamSize}\nCurrent Level: ${formData.currentLevel}\nTarget Level: ${formData.targetLevel}\nTimeline: ${formData.timeline}\nBudget: ${formData.budget}\n\n${formData.message}`,
        }],
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const l = labels.rusingacademy;
  const color = brandColors.rusingacademy;
  const t = theme === "glass" 
    ? { bg: "bg-white/5 backdrop-blur-xl border border-white/10", text: "text-white", textSecondary: "text-white/70", input: "bg-white/10 border-white/20 text-white placeholder:text-white/80" }
    : { bg: "bg-white border border-gray-200 shadow-lg", text: "text-gray-900", textSecondary: "text-gray-600", input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${t.bg} rounded-2xl p-8 text-center`}
      >
        <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color }} />
        <h3 className={`text-2xl font-bold ${t.text} mb-2`}>{l.success[language]}</h3>
      </motion.div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${t.bg} rounded-2xl p-8`}
    >
      <h3 className={`text-2xl font-bold ${t.text} mb-2`}>{l.title[language]}</h3>
      <p className={`${t.textSecondary} mb-6`}>{l.subtitle[language]}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.name[language]} *</label>
          <Input 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={t.input}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.email[language]} *</label>
          <Input 
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={t.input}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.organization[language]} *</label>
        <Input 
          required
          value={formData.organization}
          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
          className={t.input}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.teamSize[language]}</label>
          <Select value={formData.teamSize} onValueChange={(v) => setFormData({ ...formData, teamSize: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {teamSizeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.budget[language]}</label>
          <Select value={formData.budget} onValueChange={(v) => setFormData({ ...formData, budget: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {budgetOptions.rusingacademy.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.currentLevel[language]}</label>
          <Select value={formData.currentLevel} onValueChange={(v) => setFormData({ ...formData, currentLevel: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {sleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.targetLevel[language]}</label>
          <Select value={formData.targetLevel} onValueChange={(v) => setFormData({ ...formData, targetLevel: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {sleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.message[language]}</label>
        <Textarea 
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={t.input}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-6 text-white font-bold"
        style={{ background: color }}
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
        {l.submit[language]}
      </Button>
    </motion.form>
  );
}

export function LingueefyContactForm({ language, theme }: Omit<ContactFormProps, "brand">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentLevel: "",
    targetLevel: "",
    targetSkill: "",
    preferredLanguage: "",
    availability: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const importLeads = trpc.crm.importLeads.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await importLeads.mutateAsync({
        leads: [{
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: formData.phone,
          source: "lingueefy_contact",
          notes: `Current Level: ${formData.currentLevel}\nTarget Level: ${formData.targetLevel}\nFocus: ${formData.targetSkill}\nPreferred Language: ${formData.preferredLanguage}\nAvailability: ${formData.availability}\n\n${formData.message}`,
        }],
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const l = labels.lingueefy;
  const color = brandColors.lingueefy;
  const t = theme === "glass" 
    ? { bg: "bg-white/5 backdrop-blur-xl border border-white/10", text: "text-white", textSecondary: "text-white/70", input: "bg-white/10 border-white/20 text-white placeholder:text-white/80" }
    : { bg: "bg-white border border-gray-200 shadow-lg", text: "text-gray-900", textSecondary: "text-gray-600", input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${t.bg} rounded-2xl p-8 text-center`}
      >
        <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color }} />
        <h3 className={`text-2xl font-bold ${t.text} mb-2`}>{l.success[language]}</h3>
      </motion.div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${t.bg} rounded-2xl p-8`}
    >
      <h3 className={`text-2xl font-bold ${t.text} mb-2`}>{l.title[language]}</h3>
      <p className={`${t.textSecondary} mb-6`}>{l.subtitle[language]}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.name[language]} *</label>
          <Input 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={t.input}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.email[language]} *</label>
          <Input 
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={t.input}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.currentLevel[language]}</label>
          <Select value={formData.currentLevel} onValueChange={(v) => setFormData({ ...formData, currentLevel: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {sleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.targetLevel[language]}</label>
          <Select value={formData.targetLevel} onValueChange={(v) => setFormData({ ...formData, targetLevel: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {sleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.targetSkill[language]}</label>
          <Select value={formData.targetSkill} onValueChange={(v) => setFormData({ ...formData, targetSkill: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {focusAreas.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.preferredLanguage[language]}</label>
          <Select value={formData.preferredLanguage} onValueChange={(v) => setFormData({ ...formData, preferredLanguage: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="english">{language === "en" ? "English" : "Anglais"}</SelectItem>
              <SelectItem value="french">{language === "en" ? "French" : "Français"}</SelectItem>
              <SelectItem value="bilingual">{language === "en" ? "Bilingual" : "Bilingue"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.message[language]}</label>
        <Textarea 
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={t.input}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-6 text-white font-bold"
        style={{ background: color }}
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
        {l.submit[language]}
      </Button>
    </motion.form>
  );
}

export function BarholexContactForm({ language, theme }: Omit<ContactFormProps, "brand">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    serviceType: "",
    projectDescription: "",
    budget: "",
    timeline: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const importLeads = trpc.crm.importLeads.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await importLeads.mutateAsync({
        leads: [{
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          company: formData.organization,
          source: "barholex_contact",
          notes: `Role: ${formData.role}\nService: ${formData.serviceType}\nProject: ${formData.projectDescription}\nBudget: ${formData.budget}\nTimeline: ${formData.timeline}\n\n${formData.message}`,
        }],
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const l = labels.barholex;
  const color = brandColors.barholex;
  const t = theme === "glass" 
    ? { bg: "bg-white/5 backdrop-blur-xl border border-white/10", text: "text-white", textSecondary: "text-white/70", input: "bg-white/10 border-white/20 text-white placeholder:text-white/80" }
    : { bg: "bg-white border border-gray-200 shadow-lg", text: "text-gray-900", textSecondary: "text-gray-600", input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${t.bg} rounded-2xl p-8 text-center`}
      >
        <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color }} />
        <h3 className={`text-2xl font-bold ${t.text} mb-2`}>{l.success[language]}</h3>
      </motion.div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${t.bg} rounded-2xl p-8`}
    >
      <h3 className={`text-2xl font-bold ${t.text} mb-2`}>{l.title[language]}</h3>
      <p className={`${t.textSecondary} mb-6`}>{l.subtitle[language]}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.name[language]} *</label>
          <Input 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={t.input}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.email[language]} *</label>
          <Input 
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={t.input}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.organization[language]}</label>
          <Input 
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            className={t.input}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.role[language]}</label>
          <Input 
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={t.input}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.serviceType[language]} *</label>
          <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {serviceTypes.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.budget[language]}</label>
          <Select value={formData.budget} onValueChange={(v) => setFormData({ ...formData, budget: v })}>
            <SelectTrigger className={t.input}><SelectValue /></SelectTrigger>
            <SelectContent>
              {budgetOptions.barholex.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label[language]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.projectDescription[language]} *</label>
        <Textarea 
          required
          rows={3}
          value={formData.projectDescription}
          onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
          className={t.input}
        />
      </div>

      <div className="mb-4">
        <label className={`block text-sm font-medium ${t.text} mb-1`}>{l.message[language]}</label>
        <Textarea 
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={t.input}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-6 text-white font-bold"
        style={{ background: color }}
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
        {l.submit[language]}
      </Button>
    </motion.form>
  );
}
