/**
 * Meeting Scheduler Component
 * 
 * Schedule meetings with leads directly from CRM
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

interface MeetingSchedulerProps {
  lead: Lead;
  onSchedule: (meeting: MeetingData) => void;
  onClose: () => void;
}

interface MeetingData {
  leadId: number;
  title: string;
  description: string;
  meetingDate: string;
  meetingTime: string;
  durationMinutes: number;
  meetingType: "video" | "phone" | "in_person";
  meetingLink?: string;
  notes?: string;
}

const translations = {
  en: {
    title: "Schedule Meeting",
    subtitle: "with",
    meetingTitle: "Meeting Title",
    meetingTitlePlaceholder: "e.g., Discovery Call",
    description: "Description",
    descriptionPlaceholder: "Brief agenda or talking points...",
    date: "Date",
    time: "Time",
    duration: "Duration",
    type: "Meeting Type",
    video: "Video Call",
    phone: "Phone Call",
    inPerson: "In-Person",
    meetingLink: "Meeting Link",
    meetingLinkPlaceholder: "https://zoom.us/j/...",
    notes: "Internal Notes",
    notesPlaceholder: "Notes for your reference (not shared with lead)...",
    cancel: "Cancel",
    schedule: "Schedule Meeting",
    durationOptions: {
      15: "15 minutes",
      30: "30 minutes",
      45: "45 minutes",
      60: "1 hour",
      90: "1.5 hours",
      120: "2 hours",
    },
    quickTemplates: "Quick Templates",
    templates: {
      discovery: "Discovery Call",
      demo: "Product Demo",
      followUp: "Follow-up Call",
      proposal: "Proposal Review",
    },
  },
  fr: {
    title: "Planifier une réunion",
    subtitle: "avec",
    meetingTitle: "Titre de la réunion",
    meetingTitlePlaceholder: "ex., Appel de découverte",
    description: "Description",
    descriptionPlaceholder: "Ordre du jour ou points de discussion...",
    date: "Date",
    time: "Heure",
    duration: "Durée",
    type: "Type de réunion",
    video: "Appel vidéo",
    phone: "Appel téléphonique",
    inPerson: "En personne",
    meetingLink: "Lien de réunion",
    meetingLinkPlaceholder: "https://zoom.us/j/...",
    notes: "Notes internes",
    notesPlaceholder: "Notes pour votre référence (non partagées)...",
    cancel: "Annuler",
    schedule: "Planifier la réunion",
    durationOptions: {
      15: "15 minutes",
      30: "30 minutes",
      45: "45 minutes",
      60: "1 heure",
      90: "1h30",
      120: "2 heures",
    },
    quickTemplates: "Modèles rapides",
    templates: {
      discovery: "Appel de découverte",
      demo: "Démo produit",
      followUp: "Appel de suivi",
      proposal: "Révision de proposition",
    },
  },
};

const meetingTemplates = {
  discovery: {
    title: { en: "Discovery Call", fr: "Appel de découverte" },
    description: {
      en: "Initial conversation to understand needs and goals",
      fr: "Conversation initiale pour comprendre les besoins et objectifs",
    },
    duration: 30,
  },
  demo: {
    title: { en: "Product Demo", fr: "Démo produit" },
    description: {
      en: "Demonstration of our services and platform",
      fr: "Démonstration de nos services et plateforme",
    },
    duration: 45,
  },
  followUp: {
    title: { en: "Follow-up Call", fr: "Appel de suivi" },
    description: {
      en: "Follow-up discussion on previous conversation",
      fr: "Discussion de suivi sur la conversation précédente",
    },
    duration: 15,
  },
  proposal: {
    title: { en: "Proposal Review", fr: "Révision de proposition" },
    description: {
      en: "Review and discuss the proposal details",
      fr: "Examiner et discuter des détails de la proposition",
    },
    duration: 60,
  },
};

export function MeetingScheduler({ lead, onSchedule, onClose }: MeetingSchedulerProps) {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [formData, setFormData] = useState<MeetingData>({
    leadId: lead.id,
    title: "",
    description: "",
    meetingDate: "",
    meetingTime: "",
    durationMinutes: 30,
    meetingType: "video",
    meetingLink: "",
    notes: "",
  });
  
  const handleTemplateSelect = (templateKey: keyof typeof meetingTemplates) => {
    const template = meetingTemplates[templateKey];
    setFormData(prev => ({
      ...prev,
      title: template.title[language],
      description: template.description[language],
      durationMinutes: template.duration,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule(formData);
  };
  
  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">{t.title}</h2>
            <p className="text-slate-600">
              {t.subtitle} <span className="font-semibold">{lead.firstName} {lead.lastName}</span>
              {lead.company && <span className="text-slate-500"> ({lead.company})</span>}
            </p>
          </div>
          
          {/* Quick Templates */}
          <div className="p-6 border-b border-slate-200 bg-white">
            <p className="text-sm font-medium text-slate-600 mb-3">{t.quickTemplates}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(meetingTemplates) as Array<keyof typeof meetingTemplates>).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTemplateSelect(key)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
                >
                  {t.templates[key]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.meetingTitle} *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t.meetingTitlePlaceholder}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.description}
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t.descriptionPlaceholder}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              />
            </div>
            
            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.date} *
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={formData.meetingDate}
                  onChange={e => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.time} *
                </label>
                <input
                  type="time"
                  required
                  value={formData.meetingTime}
                  onChange={e => setFormData(prev => ({ ...prev, meetingTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            {/* Duration & Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.duration}
                </label>
                <select
                  value={formData.durationMinutes}
                  onChange={e => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  {Object.entries(t.durationOptions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.type}
                </label>
                <select
                  value={formData.meetingType}
                  onChange={e => setFormData(prev => ({ ...prev, meetingType: e.target.value as MeetingData["meetingType"] }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="video">{t.video}</option>
                  <option value="phone">{t.phone}</option>
                  <option value="in_person">{t.inPerson}</option>
                </select>
              </div>
            </div>
            
            {/* Meeting Link (for video calls) */}
            {formData.meetingType === "video" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.meetingLink}
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={e => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder={t.meetingLinkPlaceholder}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </motion.div>
            )}
            
            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.notes}
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t.notesPlaceholder}
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                {t.schedule}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MeetingScheduler;
