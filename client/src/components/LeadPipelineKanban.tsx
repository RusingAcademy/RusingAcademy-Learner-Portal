import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Types
interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  source: string;
  leadScore: number;
  status: string;
  createdAt: string;
}

interface Column {
  id: string;
  title: { en: string; fr: string };
  color: string;
  bgColor: string;
}

const translations = {
  en: {
    pipeline: "Lead Pipeline",
    subtitle: "Drag and drop leads between stages",
    leads: "leads",
    score: "Score",
    noLeads: "No leads in this stage",
    dropHere: "Drop lead here",
    viewDetails: "View Details",
    schedule: "Schedule Meeting",
  },
  fr: {
    pipeline: "Pipeline des prospects",
    subtitle: "Glissez-déposez les prospects entre les étapes",
    leads: "prospects",
    score: "Score",
    noLeads: "Aucun prospect à cette étape",
    dropHere: "Déposer le prospect ici",
    viewDetails: "Voir les détails",
    schedule: "Planifier une réunion",
  },
};

const columns: Column[] = [
  { id: "new", title: { en: "New", fr: "Nouveau" }, color: "#3B82F6", bgColor: "#3B82F620" },
  { id: "contacted", title: { en: "Contacted", fr: "Contacté" }, color: "#06B6D4", bgColor: "#06B6D420" },
  { id: "qualified", title: { en: "Qualified", fr: "Qualifié" }, color: "#10B981", bgColor: "#10B98120" },
  { id: "proposal_sent", title: { en: "Proposal Sent", fr: "Proposition envoyée" }, color: "#F59E0B", bgColor: "#F59E0B20" },
  { id: "negotiating", title: { en: "Negotiating", fr: "En négociation" }, color: "#8B5CF6", bgColor: "#8B5CF620" },
  { id: "won", title: { en: "Won", fr: "Gagné" }, color: "#22C55E", bgColor: "#22C55E20" },
];

const sourceColors: Record<string, string> = {
  lingueefy: "#009688",
  rusingacademy: "#F97316",
  barholex: "#EAB308",
  ecosystem_hub: "#8B5CF6",
};

// Mock data
const mockLeads: Lead[] = [
  { id: 1, firstName: "Marie", lastName: "Dubois", email: "marie@canada.ca", company: "Treasury Board", source: "rusingacademy", leadScore: 85, status: "qualified", createdAt: "2026-01-08" },
  { id: 2, firstName: "Jean-Pierre", lastName: "Martin", email: "jp@example.com", company: "", source: "lingueefy", leadScore: 65, status: "new", createdAt: "2026-01-09" },
  { id: 3, firstName: "Sarah", lastName: "Thompson", email: "sarah@tech.io", company: "TechStartup", source: "barholex", leadScore: 78, status: "proposal_sent", createdAt: "2026-01-07" },
  { id: 4, firstName: "Michel", lastName: "Tremblay", email: "michel@gov.ca", company: "IRCC", source: "rusingacademy", leadScore: 92, status: "negotiating", createdAt: "2026-01-05" },
  { id: 5, firstName: "Emily", lastName: "Chen", email: "emily@startup.com", company: "InnovateCo", source: "ecosystem_hub", leadScore: 71, status: "contacted", createdAt: "2026-01-06" },
  { id: 6, firstName: "David", lastName: "Wilson", email: "david@corp.com", company: "BigCorp", source: "lingueefy", leadScore: 58, status: "new", createdAt: "2026-01-09" },
  { id: 7, firstName: "Sophie", lastName: "Bernard", email: "sophie@agency.ca", company: "CRA", source: "rusingacademy", leadScore: 88, status: "won", createdAt: "2026-01-02" },
];

interface LeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
  onSchedule: (lead: Lead) => void;
  language: "en" | "fr";
}

function LeadCard({ lead, onDragStart, onViewDetails, onSchedule, language }: LeadCardProps) {
  const t = translations[language];
  const scoreColor = lead.leadScore >= 70 ? "#10B981" : lead.leadScore >= 40 ? "#F59E0B" : "#EF4444";
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, lead)}
      className="bg-slate-700/50 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:bg-slate-700 transition-colors border border-white/5 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{lead.firstName} {lead.lastName}</h4>
          {lead.company && (
            <p className="text-sm text-slate-400">{lead.company}</p>
          )}
        </div>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: sourceColors[lead.source] || "#64748B" }}
          title={lead.source}
        />
      </div>
      
      {/* Score */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-white/10 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all"
            style={{ width: `${lead.leadScore}%`, backgroundColor: scoreColor }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color: scoreColor }}>
          {lead.leadScore}
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onViewDetails(lead)}
          className="flex-1 px-3 py-1.5 bg-white/10 rounded-lg text-xs text-slate-300 hover:bg-white/20 transition-colors"
        >
          {t.viewDetails}
        </button>
        <button
          onClick={() => onSchedule(lead)}
          className="flex-1 px-3 py-1.5 bg-teal-500/20 rounded-lg text-xs text-teal-400 hover:bg-teal-500/30 transition-colors"
        >
          {t.schedule}
        </button>
      </div>
    </motion.div>
  );
}

interface KanbanColumnProps {
  column: Column;
  leads: Lead[];
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  isDragOver: boolean;
  onViewDetails: (lead: Lead) => void;
  onSchedule: (lead: Lead) => void;
  language: "en" | "fr";
}

function KanbanColumn({ 
  column, 
  leads, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  isDragOver,
  onViewDetails,
  onSchedule,
  language 
}: KanbanColumnProps) {
  const t = translations[language];
  
  return (
    <div 
      className={`flex-1 min-w-[280px] max-w-[320px] bg-slate-800/50 rounded-2xl p-4 transition-all ${
        isDragOver ? "ring-2 ring-teal-500 bg-slate-800/70" : ""
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-white">{column.title[language]}</h3>
        </div>
        <span 
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: column.bgColor, color: column.color }}
        >
          {leads.length}
        </span>
      </div>
      
      {/* Cards */}
      <div className="space-y-3 min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDragStart={onDragStart}
              onViewDetails={onViewDetails}
              onSchedule={onSchedule}
              language={language}
            />
          ))}
        </AnimatePresence>
        
        {leads.length === 0 && (
          <div className={`text-center py-8 text-slate-500 text-sm border-2 border-dashed rounded-xl transition-colors ${
            isDragOver ? "border-teal-500 text-teal-400" : "border-slate-700"
          }`}>
            {isDragOver ? t.dropHere : t.noLeads}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadPipelineKanban() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((columnId: string) => {
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (draggedLead && draggedLead.status !== newStatus) {
      setLeads(prev => prev.map(lead => 
        lead.id === draggedLead.id 
          ? { ...lead, status: newStatus }
          : lead
      ));
      
      // In production, this would call the API
      console.log(`Moving lead ${draggedLead.id} from ${draggedLead.status} to ${newStatus}`);
    }
    
    setDraggedLead(null);
    setDragOverColumn(null);
  }, [draggedLead]);

  const handleViewDetails = useCallback((lead: Lead) => {
    setSelectedLead(lead);
  }, []);

  const handleSchedule = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowScheduleModal(true);
  }, []);

  // Group leads by status
  const leadsByStatus = columns.reduce((acc, column) => {
    acc[column.id] = leads.filter(lead => lead.status === column.id);
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          {t.pipeline}
        </h1>
        <p className="text-slate-400 mt-2">{t.subtitle}</p>
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4 overflow-x-auto pb-4"
        onDragLeave={handleDragLeave}
      >
        {columns.map(column => (
          <div
            key={column.id}
            onDragEnter={() => handleDragEnter(column.id)}
          >
            <KanbanColumn
              column={column}
              leads={leadsByStatus[column.id] || []}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragOver={dragOverColumn === column.id}
              onViewDetails={handleViewDetails}
              onSchedule={handleSchedule}
              language={language}
            />
          </div>
        ))}
      </motion.div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && !showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedLead.firstName} {selectedLead.lastName}</h2>
                  <p className="text-slate-400">{selectedLead.email}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {selectedLead.company && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company</span>
                    <span>{selectedLead.company}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Source</span>
                  <span className="capitalize">{selectedLead.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Score</span>
                  <span className="font-bold" style={{ 
                    color: selectedLead.leadScore >= 70 ? "#10B981" : selectedLead.leadScore >= 40 ? "#F59E0B" : "#EF4444" 
                  }}>
                    {selectedLead.leadScore}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span>{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowScheduleModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {t.schedule}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Meeting Modal */}
      <AnimatePresence>
        {showScheduleModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowScheduleModal(false);
              setSelectedLead(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                {language === "en" ? "Schedule Meeting" : "Planifier une réunion"}
              </h2>
              <p className="text-slate-400 mb-6">
                {language === "en" 
                  ? `Schedule a meeting with ${selectedLead.firstName} ${selectedLead.lastName}`
                  : `Planifier une réunion avec ${selectedLead.firstName} ${selectedLead.lastName}`
                }
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    {language === "en" ? "Date" : "Date"}
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/10 text-white focus:border-teal-500 focus:outline-none"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    {language === "en" ? "Time" : "Heure"}
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/10 text-white focus:border-teal-500 focus:outline-none"
                    defaultValue="10:00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    {language === "en" ? "Duration" : "Durée"}
                  </label>
                  <select className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/10 text-white focus:border-teal-500 focus:outline-none">
                    <option value="15">15 {language === "en" ? "minutes" : "minutes"}</option>
                    <option value="30" selected>30 {language === "en" ? "minutes" : "minutes"}</option>
                    <option value="45">45 {language === "en" ? "minutes" : "minutes"}</option>
                    <option value="60">1 {language === "en" ? "hour" : "heure"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    {language === "en" ? "Notes" : "Notes"}
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/10 text-white focus:border-teal-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder={language === "en" ? "Meeting agenda..." : "Ordre du jour..."}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedLead(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  {language === "en" ? "Cancel" : "Annuler"}
                </button>
                <button
                  onClick={() => {
                    // In production, this would call the API
                    alert(language === "en" ? "Meeting scheduled!" : "Réunion planifiée!");
                    setShowScheduleModal(false);
                    setSelectedLead(null);
                  }}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {language === "en" ? "Schedule" : "Planifier"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
