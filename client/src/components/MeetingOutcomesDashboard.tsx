import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import MeetingOutcomeForm from "./MeetingOutcomeForm";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  UserX,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  Phone,
  Mail,
  Video,
  Bell,
  RefreshCw,
} from "lucide-react";

// Types
interface PendingMeeting {
  id: number;
  title: string;
  leadName: string;
  leadEmail: string;
  meetingDate: Date;
  durationMinutes: number;
}

interface OutcomeStats {
  totalMeetings: number;
  completedMeetings: number;
  qualifiedLeads: number;
  notQualifiedLeads: number;
  needsFollowUp: number;
  converted: number;
  noShows: number;
  averageQualificationScore: number;
  totalDealValue: number;
  averageDealProbability: number;
  conversionRate: number;
}

interface FollowUpTask {
  meetingId: number;
  leadId: number;
  leadName: string;
  leadEmail: string;
  followUpDate: Date;
  followUpType: string;
  nextSteps: string;
}

// Mock data
const mockStats: OutcomeStats = {
  totalMeetings: 45,
  completedMeetings: 38,
  qualifiedLeads: 18,
  notQualifiedLeads: 8,
  needsFollowUp: 7,
  converted: 4,
  noShows: 1,
  averageQualificationScore: 6.8,
  totalDealValue: 125000,
  averageDealProbability: 62,
  conversionRate: 10.5,
};

const mockPendingMeetings: PendingMeeting[] = [
  {
    id: 1,
    title: "Discovery Call - Treasury Board",
    leadName: "Marie Dubois",
    leadEmail: "marie.dubois@canada.ca",
    meetingDate: new Date("2026-01-08T14:00:00"),
    durationMinutes: 30,
  },
  {
    id: 2,
    title: "Follow-up - CRA Training",
    leadName: "Jean-Pierre Martin",
    leadEmail: "jp.martin@cra-arc.gc.ca",
    meetingDate: new Date("2026-01-08T10:30:00"),
    durationMinutes: 45,
  },
  {
    id: 3,
    title: "Demo - Video Production",
    leadName: "Sarah Thompson",
    leadEmail: "sarah@techstartup.io",
    meetingDate: new Date("2026-01-07T15:00:00"),
    durationMinutes: 60,
  },
];

const mockFollowUpTasks: FollowUpTask[] = [
  {
    meetingId: 10,
    leadId: 5,
    leadName: "Robert Chen",
    leadEmail: "robert.chen@esdc.gc.ca",
    followUpDate: new Date("2026-01-10T09:00:00"),
    followUpType: "email",
    nextSteps: "Send detailed proposal with pricing options",
  },
  {
    meetingId: 11,
    leadId: 8,
    leadName: "Lisa Anderson",
    leadEmail: "lisa.anderson@dnd.gc.ca",
    followUpDate: new Date("2026-01-11T14:00:00"),
    followUpType: "call",
    nextSteps: "Discuss budget approval timeline",
  },
  {
    meetingId: 12,
    leadId: 12,
    leadName: "Marc Tremblay",
    leadEmail: "marc.tremblay@ircc.gc.ca",
    followUpDate: new Date("2026-01-12T10:30:00"),
    followUpType: "meeting",
    nextSteps: "Present to department leadership",
  },
];

// Translations
const translations = {
  en: {
    title: "Meeting Outcomes",
    subtitle: "Track meeting results and follow-up tasks",
    overview: "Overview",
    pendingOutcomes: "Pending Outcomes",
    followUpTasks: "Follow-up Tasks",
    totalMeetings: "Total Meetings",
    completedMeetings: "Completed",
    qualifiedLeads: "Qualified",
    notQualified: "Not Qualified",
    needsFollowUp: "Needs Follow-up",
    converted: "Converted",
    noShows: "No Shows",
    avgQualScore: "Avg. Qualification",
    totalDealValue: "Total Deal Value",
    avgDealProb: "Avg. Deal Probability",
    conversionRate: "Conversion Rate",
    recordOutcome: "Record Outcome",
    sendReminder: "Send Reminder",
    sendAllReminders: "Send All Reminders",
    meetingsPendingOutcome: "meetings pending outcome",
    upcomingFollowUps: "upcoming follow-ups",
    dueToday: "Due Today",
    dueTomorrow: "Due Tomorrow",
    dueThisWeek: "Due This Week",
    overdue: "Overdue",
    noData: "No data available",
    refresh: "Refresh",
    call: "Call",
    email: "Email",
    meeting: "Meeting",
    viewLead: "View Lead",
  },
  fr: {
    title: "Résultats des réunions",
    subtitle: "Suivez les résultats des réunions et les tâches de suivi",
    overview: "Aperçu",
    pendingOutcomes: "Résultats en attente",
    followUpTasks: "Tâches de suivi",
    totalMeetings: "Total des réunions",
    completedMeetings: "Terminées",
    qualifiedLeads: "Qualifiés",
    notQualified: "Non qualifiés",
    needsFollowUp: "Suivi nécessaire",
    converted: "Convertis",
    noShows: "Absents",
    avgQualScore: "Score moy. de qualification",
    totalDealValue: "Valeur totale des affaires",
    avgDealProb: "Probabilité moy. d'affaire",
    conversionRate: "Taux de conversion",
    recordOutcome: "Enregistrer le résultat",
    sendReminder: "Envoyer un rappel",
    sendAllReminders: "Envoyer tous les rappels",
    meetingsPendingOutcome: "réunions en attente de résultat",
    upcomingFollowUps: "suivis à venir",
    dueToday: "Aujourd'hui",
    dueTomorrow: "Demain",
    dueThisWeek: "Cette semaine",
    overdue: "En retard",
    noData: "Aucune donnée disponible",
    refresh: "Actualiser",
    call: "Appel",
    email: "E-mail",
    meeting: "Réunion",
    viewLead: "Voir le lead",
  },
};

// Helper to get follow-up type icon
function getFollowUpIcon(type: string) {
  switch (type) {
    case "call":
      return Phone;
    case "email":
      return Mail;
    case "meeting":
      return Video;
    default:
      return Mail;
  }
}

// Helper to get due status
function getDueStatus(date: Date): { label: string; color: string; bgColor: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (dueDate < today) {
    return { label: "overdue", color: "text-red-400", bgColor: "bg-red-500/20" };
  } else if (dueDate.getTime() === today.getTime()) {
    return { label: "dueToday", color: "text-orange-400", bgColor: "bg-[#C65A1E]/20" };
  } else if (dueDate.getTime() === tomorrow.getTime()) {
    return { label: "dueTomorrow", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
  } else if (dueDate < weekEnd) {
    return { label: "dueThisWeek", color: "text-blue-400", bgColor: "bg-blue-500/20" };
  }
  return { label: "dueThisWeek", color: "text-slate-400", bgColor: "bg-white0/20" };
}

export default function MeetingOutcomesDashboard() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [activeTab, setActiveTab] = useState<"overview" | "pending" | "followups">("overview");
  const [selectedMeeting, setSelectedMeeting] = useState<PendingMeeting | null>(null);
  
  const stats = mockStats;
  const pendingMeetings = mockPendingMeetings;
  const followUpTasks = mockFollowUpTasks;
  
  const handleSubmitOutcome = async (outcome: any) => {
    console.log("Submitting outcome:", outcome);
    // In real implementation, this would call the API
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-[#D97B3D] bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-slate-400 mt-1">{t.subtitle}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          {t.refresh}
        </button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#C65A1E]/20 to-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-orange-400">{t.pendingOutcomes}</span>
          </div>
          <div className="text-2xl font-bold">{pendingMeetings.length}</div>
          <div className="text-xs text-slate-400">{t.meetingsPendingOutcome}</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-[#145A5B]/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-400">{t.followUpTasks}</span>
          </div>
          <div className="text-2xl font-bold">{followUpTasks.length}</div>
          <div className="text-xs text-slate-400">{t.upcomingFollowUps}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">{t.converted}</span>
          </div>
          <div className="text-2xl font-bold">{stats.converted}</div>
          <div className="text-xs text-slate-400">{stats.conversionRate}% {t.conversionRate.toLowerCase()}</div>
        </div>
        
        <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-teal-500/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-teal-400" />
            <span className="text-sm text-teal-400">{t.totalDealValue}</span>
          </div>
          <div className="text-2xl font-bold">${(stats.totalDealValue / 1000).toFixed(0)}K</div>
          <div className="text-xs text-slate-400">{stats.averageDealProbability}% {t.avgDealProb.toLowerCase()}</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["overview", "pending", "followups"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? "bg-teal-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            {tab === "overview" ? t.overview : tab === "pending" ? t.pendingOutcomes : t.followUpTasks}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Outcome Distribution */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Outcome Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
                  <div className="text-xs text-slate-400">{t.qualifiedLeads}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold">{stats.notQualifiedLeads}</div>
                  <div className="text-xs text-slate-400">{t.notQualified}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold">{stats.needsFollowUp}</div>
                  <div className="text-xs text-slate-400">{t.needsFollowUp}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-teal-500/20 rounded-full flex items-center justify-center mb-2">
                    <Trophy className="w-8 h-8 text-teal-400" />
                  </div>
                  <div className="text-2xl font-bold">{stats.converted}</div>
                  <div className="text-xs text-slate-400">{t.converted}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-white0/20 rounded-full flex items-center justify-center mb-2">
                    <UserX className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold">{stats.noShows}</div>
                  <div className="text-xs text-slate-400">{t.noShows}</div>
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#E7F2F2]/20 rounded-lg">
                    <Target className="w-5 h-5 text-[#0F3D3E]" />
                  </div>
                  <span className="font-medium">{t.avgQualScore}</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.averageQualificationScore}/10</div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-[#E7F2F2] h-2 rounded-full transition-all"
                    style={{ width: `${stats.averageQualificationScore * 10}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="font-medium">{t.conversionRate}</span>
                </div>
                <div className="text-4xl font-bold mb-2">{stats.conversionRate}%</div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(stats.conversionRate * 5, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-teal-400" />
                  </div>
                  <span className="font-medium">{t.totalDealValue}</span>
                </div>
                <div className="text-4xl font-bold mb-2">${stats.totalDealValue.toLocaleString()}</div>
                <div className="text-sm text-slate-400">
                  Avg. Probability: {stats.averageDealProbability}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Pending Outcomes Tab */}
        {activeTab === "pending" && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-end mb-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#C65A1E]/20 text-orange-400 rounded-lg hover:bg-[#C65A1E]/30 transition-colors">
                <Bell className="w-4 h-4" />
                {t.sendAllReminders}
              </button>
            </div>
            
            {pendingMeetings.map((meeting) => {
              const meetingDate = new Date(meeting.meetingDate);
              const formattedDate = meetingDate.toLocaleDateString(
                language === "fr" ? "fr-CA" : "en-CA",
                { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
              );
              
              return (
                <div
                  key={meeting.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{meeting.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span>{meeting.leadName}</span>
                        <span>{meeting.leadEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4" />
                        {formattedDate} ({meeting.durationMinutes} min)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {/* Send reminder */}}
                        className="px-3 py-2 bg-white/10 text-slate-300 rounded-lg hover:bg-white/20 transition-colors text-sm"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedMeeting(meeting)}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                      >
                        {t.recordOutcome}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {pendingMeetings.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                {t.noData}
              </div>
            )}
          </motion.div>
        )}
        
        {/* Follow-up Tasks Tab */}
        {activeTab === "followups" && (
          <motion.div
            key="followups"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {followUpTasks.map((task) => {
              const Icon = getFollowUpIcon(task.followUpType);
              const dueStatus = getDueStatus(task.followUpDate);
              const formattedDate = task.followUpDate.toLocaleDateString(
                language === "fr" ? "fr-CA" : "en-CA",
                { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
              );
              
              return (
                <div
                  key={task.meetingId}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${dueStatus.bgColor}`}>
                        <Icon className={`w-5 h-5 ${dueStatus.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{task.leadName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${dueStatus.bgColor} ${dueStatus.color}`}>
                            {t[dueStatus.label as keyof typeof t]}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">{task.leadEmail}</div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formattedDate}
                          <span className="text-slate-500">•</span>
                          {t[task.followUpType as keyof typeof t]}
                        </div>
                        {task.nextSteps && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg text-sm">
                            <span className="text-slate-400">Next steps: </span>
                            {task.nextSteps}
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/10 text-slate-300 rounded-lg hover:bg-white/20 transition-colors text-sm">
                      {t.viewLead}
                    </button>
                  </div>
                </div>
              );
            })}
            
            {followUpTasks.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                {t.noData}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Meeting Outcome Form Modal */}
      <AnimatePresence>
        {selectedMeeting && (
          <MeetingOutcomeForm
            meeting={selectedMeeting}
            onSubmit={handleSubmitOutcome}
            onClose={() => setSelectedMeeting(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
