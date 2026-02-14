import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  UserX,
  Calendar,
  DollarSign,
  Target,
  FileText,
  Send,
  X,
} from "lucide-react";

// Types
interface MeetingOutcomeFormProps {
  meeting: {
    id: number;
    title: string;
    leadName: string;
    leadEmail: string;
    meetingDate: Date;
    durationMinutes: number;
  };
  onSubmit: (outcome: MeetingOutcome) => Promise<void>;
  onClose: () => void;
}

interface MeetingOutcome {
  meetingId: number;
  outcome: "qualified" | "not_qualified" | "needs_follow_up" | "converted" | "no_show";
  qualificationScore?: number;
  nextSteps?: string;
  dealValue?: number;
  dealProbability?: number;
  notes?: string;
  followUpDate?: Date;
  followUpType?: "call" | "email" | "meeting";
}

// Translations
const translations = {
  en: {
    title: "Record Meeting Outcome",
    subtitle: "Update lead status based on meeting results",
    meetingWith: "Meeting with",
    selectOutcome: "Select Outcome",
    qualified: "Qualified",
    qualifiedDesc: "Lead meets criteria and is ready for next steps",
    notQualified: "Not Qualified",
    notQualifiedDesc: "Lead does not meet criteria at this time",
    needsFollowUp: "Needs Follow-up",
    needsFollowUpDesc: "Requires additional nurturing or information",
    converted: "Converted",
    convertedDesc: "Lead has become a customer",
    noShow: "No Show",
    noShowDesc: "Lead did not attend the meeting",
    qualificationScore: "Qualification Score",
    qualificationScoreDesc: "Rate the lead's qualification level (1-10)",
    dealValue: "Estimated Deal Value",
    dealValueDesc: "Potential revenue from this lead",
    dealProbability: "Deal Probability",
    dealProbabilityDesc: "Likelihood of closing (0-100%)",
    nextSteps: "Next Steps",
    nextStepsDesc: "What actions need to be taken?",
    notes: "Meeting Notes",
    notesDesc: "Additional observations or details",
    scheduleFollowUp: "Schedule Follow-up",
    followUpDate: "Follow-up Date",
    followUpType: "Follow-up Type",
    call: "Phone Call",
    email: "Email",
    meeting: "Meeting",
    submit: "Submit Outcome",
    cancel: "Cancel",
    submitting: "Submitting...",
    scoreImpact: "This will adjust the lead score by",
    points: "points",
  },
  fr: {
    title: "Enregistrer le résultat de la réunion",
    subtitle: "Mettre à jour le statut du lead selon les résultats",
    meetingWith: "Réunion avec",
    selectOutcome: "Sélectionner le résultat",
    qualified: "Qualifié",
    qualifiedDesc: "Le lead répond aux critères et est prêt pour la suite",
    notQualified: "Non qualifié",
    notQualifiedDesc: "Le lead ne répond pas aux critères actuellement",
    needsFollowUp: "Suivi nécessaire",
    needsFollowUpDesc: "Nécessite un accompagnement ou des informations supplémentaires",
    converted: "Converti",
    convertedDesc: "Le lead est devenu client",
    noShow: "Absent",
    noShowDesc: "Le lead n'a pas assisté à la réunion",
    qualificationScore: "Score de qualification",
    qualificationScoreDesc: "Évaluez le niveau de qualification du lead (1-10)",
    dealValue: "Valeur estimée de l'affaire",
    dealValueDesc: "Revenus potentiels de ce lead",
    dealProbability: "Probabilité de conclusion",
    dealProbabilityDesc: "Probabilité de conclure (0-100%)",
    nextSteps: "Prochaines étapes",
    nextStepsDesc: "Quelles actions doivent être prises?",
    notes: "Notes de réunion",
    notesDesc: "Observations ou détails supplémentaires",
    scheduleFollowUp: "Planifier un suivi",
    followUpDate: "Date de suivi",
    followUpType: "Type de suivi",
    call: "Appel téléphonique",
    email: "E-mail",
    meeting: "Réunion",
    submit: "Soumettre le résultat",
    cancel: "Annuler",
    submitting: "Soumission...",
    scoreImpact: "Cela ajustera le score du lead de",
    points: "points",
  },
};

// Score adjustments for display
const SCORE_ADJUSTMENTS: Record<string, number> = {
  qualified: 20,
  not_qualified: -15,
  needs_follow_up: 5,
  converted: 30,
  no_show: -25,
};

// Outcome options with icons and colors
const outcomeOptions = [
  { value: "qualified", icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/50" },
  { value: "not_qualified", icon: XCircle, color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500/50" },
  { value: "needs_follow_up", icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-500/20", borderColor: "border-yellow-500/50" },
  { value: "converted", icon: Trophy, color: "text-teal-400", bgColor: "bg-teal-500/20", borderColor: "border-teal-500/50" },
  { value: "no_show", icon: UserX, color: "text-slate-400", bgColor: "bg-white0/20", borderColor: "border-slate-500/50" },
] as const;

export default function MeetingOutcomeForm({ meeting, onSubmit, onClose }: MeetingOutcomeFormProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [outcome, setOutcome] = useState<MeetingOutcome["outcome"] | null>(null);
  const [qualificationScore, setQualificationScore] = useState<number>(5);
  const [dealValue, setDealValue] = useState<string>("");
  const [dealProbability, setDealProbability] = useState<number>(50);
  const [nextSteps, setNextSteps] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showFollowUp, setShowFollowUp] = useState<boolean>(false);
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [followUpType, setFollowUpType] = useState<"call" | "email" | "meeting">("email");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSubmit = async () => {
    if (!outcome) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        meetingId: meeting.id,
        outcome,
        qualificationScore: outcome !== "no_show" ? qualificationScore : undefined,
        dealValue: dealValue ? parseFloat(dealValue) : undefined,
        dealProbability: outcome === "qualified" || outcome === "converted" ? dealProbability : undefined,
        nextSteps: nextSteps || undefined,
        notes: notes || undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        followUpType: showFollowUp ? followUpType : undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to submit outcome:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const meetingDate = new Date(meeting.meetingDate);
  const formattedDate = meetingDate.toLocaleDateString(
    language === "fr" ? "fr-CA" : "en-CA",
    { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  );
  
  return (
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
        className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{t.title}</h2>
            <p className="text-slate-400 mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Meeting Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            <span className="font-medium">{meeting.title}</span>
          </div>
          <div className="text-sm text-slate-400">
            {t.meetingWith}: <span className="text-white">{meeting.leadName}</span> ({meeting.leadEmail})
          </div>
          <div className="text-sm text-slate-400 mt-1">{formattedDate}</div>
        </div>
        
        {/* Outcome Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">{t.selectOutcome}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {outcomeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = outcome === option.value;
              const label = t[option.value as keyof typeof t] as string;
              const desc = t[`${option.value}Desc` as keyof typeof t] as string;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setOutcome(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${option.bgColor} ${option.borderColor}`
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${option.color}`} />
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-slate-400 mt-1">{desc}</div>
                </button>
              );
            })}
          </div>
          
          {outcome && (
            <div className={`mt-3 text-sm ${SCORE_ADJUSTMENTS[outcome] >= 0 ? "text-green-400" : "text-red-400"}`}>
              {t.scoreImpact} {SCORE_ADJUSTMENTS[outcome] >= 0 ? "+" : ""}{SCORE_ADJUSTMENTS[outcome]} {t.points}
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {outcome && outcome !== "no_show" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Qualification Score */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  {t.qualificationScore}
                </label>
                <p className="text-xs text-slate-400 mb-3">{t.qualificationScoreDesc}</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={qualificationScore}
                    onChange={(e) => setQualificationScore(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-xl font-bold text-teal-400">
                    {qualificationScore}
                  </div>
                </div>
              </div>
              
              {/* Deal Value & Probability (only for qualified/converted) */}
              {(outcome === "qualified" || outcome === "converted") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      {t.dealValue}
                    </label>
                    <p className="text-xs text-slate-400 mb-2">{t.dealValueDesc}</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={dealValue}
                        onChange={(e) => setDealValue(e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {t.dealProbability}
                    </label>
                    <p className="text-xs text-slate-400 mb-2">{t.dealProbabilityDesc}</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={dealProbability}
                        onChange={(e) => setDealProbability(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <span className="w-12 text-right font-medium">{dealProbability}%</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Next Steps */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  {t.nextSteps}
                </label>
                <p className="text-xs text-slate-400 mb-2">{t.nextStepsDesc}</p>
                <input
                  type="text"
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder={language === "fr" ? "Ex: Envoyer une proposition" : "Ex: Send proposal"}
                />
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t.notes}
                </label>
                <p className="text-xs text-slate-400 mb-2">{t.notesDesc}</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-teal-500 transition-colors resize-none"
                />
              </div>
              
              {/* Follow-up Scheduling */}
              {outcome === "needs_follow_up" && (
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-slate-300">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      {t.scheduleFollowUp}
                    </label>
                    <button
                      onClick={() => setShowFollowUp(!showFollowUp)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        showFollowUp ? "bg-teal-500 text-white" : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {showFollowUp ? "On" : "Off"}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showFollowUp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <label className="block text-xs text-slate-400 mb-2">{t.followUpDate}</label>
                          <input
                            type="datetime-local"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-slate-400 mb-2">{t.followUpType}</label>
                          <select
                            value={followUpType}
                            onChange={(e) => setFollowUpType(e.target.value as "call" | "email" | "meeting")}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                          >
                            <option value="call">{t.call}</option>
                            <option value="email">{t.email}</option>
                            <option value="meeting">{t.meeting}</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!outcome || isSubmitting}
            className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.submitting}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t.submit}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
