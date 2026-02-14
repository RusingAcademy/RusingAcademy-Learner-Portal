import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Mail,
  MousePointer,
  Eye,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
  AlertTriangle,
} from "lucide-react";

// Types
interface SequenceMetrics {
  sequenceId: number;
  sequenceName: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  pausedEnrollments: number;
  totalEmailsSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  conversions: number;
  conversionRate: number;
  averageTimeToConversion: number | null;
}

interface StepMetrics {
  stepId: number;
  stepOrder: number;
  subjectEn: string;
  subjectFr: string;
  delayDays: number;
  delayHours: number;
  emailsSent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  dropOffRate: number;
}

interface OverallAnalytics {
  totalSequences: number;
  activeSequences: number;
  totalEnrollments: number;
  totalEmailsSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  averageConversionRate: number;
  topPerformingSequence: { id: number; name: string; conversionRate: number } | null;
  bottomPerformingSequence: { id: number; name: string; conversionRate: number } | null;
  recentActivity: Array<{
    date: string;
    emailsSent: number;
    opened: number;
    clicked: number;
  }>;
}

// Mock data for demonstration
const mockOverallAnalytics: OverallAnalytics = {
  totalSequences: 3,
  activeSequences: 2,
  totalEnrollments: 156,
  totalEmailsSent: 423,
  averageOpenRate: 42.5,
  averageClickRate: 12.3,
  averageConversionRate: 8.7,
  topPerformingSequence: { id: 1, name: "Welcome Sequence", conversionRate: 15.2 },
  bottomPerformingSequence: { id: 3, name: "Re-engagement", conversionRate: 3.1 },
  recentActivity: [
    { date: "2026-01-03", emailsSent: 45, opened: 19, clicked: 5 },
    { date: "2026-01-04", emailsSent: 52, opened: 22, clicked: 7 },
    { date: "2026-01-05", emailsSent: 38, opened: 16, clicked: 4 },
    { date: "2026-01-06", emailsSent: 61, opened: 26, clicked: 9 },
    { date: "2026-01-07", emailsSent: 55, opened: 23, clicked: 6 },
    { date: "2026-01-08", emailsSent: 48, opened: 20, clicked: 5 },
    { date: "2026-01-09", emailsSent: 67, opened: 28, clicked: 8 },
  ],
};

const mockSequences: SequenceMetrics[] = [
  {
    sequenceId: 1,
    sequenceName: "Welcome Sequence",
    totalEnrollments: 78,
    activeEnrollments: 23,
    completedEnrollments: 45,
    pausedEnrollments: 10,
    totalEmailsSent: 234,
    totalOpened: 112,
    totalClicked: 34,
    openRate: 47.9,
    clickRate: 14.5,
    clickToOpenRate: 30.4,
    conversions: 12,
    conversionRate: 15.4,
    averageTimeToConversion: 14,
  },
  {
    sequenceId: 2,
    sequenceName: "Nurture Campaign",
    totalEnrollments: 52,
    activeEnrollments: 18,
    completedEnrollments: 28,
    pausedEnrollments: 6,
    totalEmailsSent: 156,
    totalOpened: 62,
    totalClicked: 18,
    openRate: 39.7,
    clickRate: 11.5,
    clickToOpenRate: 29.0,
    conversions: 5,
    conversionRate: 9.6,
    averageTimeToConversion: 21,
  },
  {
    sequenceId: 3,
    sequenceName: "Re-engagement",
    totalEnrollments: 26,
    activeEnrollments: 8,
    completedEnrollments: 15,
    pausedEnrollments: 3,
    totalEmailsSent: 78,
    totalOpened: 28,
    totalClicked: 6,
    openRate: 35.9,
    clickRate: 7.7,
    clickToOpenRate: 21.4,
    conversions: 1,
    conversionRate: 3.8,
    averageTimeToConversion: null,
  },
];

const mockStepMetrics: StepMetrics[] = [
  {
    stepId: 1,
    stepOrder: 1,
    subjectEn: "Welcome to Rusinga International!",
    subjectFr: "Bienvenue chez Rusinga International!",
    delayDays: 0,
    delayHours: 0,
    emailsSent: 78,
    opened: 52,
    clicked: 18,
    openRate: 66.7,
    clickRate: 23.1,
    dropOffRate: 0,
  },
  {
    stepId: 2,
    stepOrder: 2,
    subjectEn: "Discover Our Services",
    subjectFr: "Découvrez nos services",
    delayDays: 2,
    delayHours: 0,
    emailsSent: 72,
    opened: 38,
    clicked: 12,
    openRate: 52.8,
    clickRate: 16.7,
    dropOffRate: 7.7,
  },
  {
    stepId: 3,
    stepOrder: 3,
    subjectEn: "Ready to Get Started?",
    subjectFr: "Prêt à commencer?",
    delayDays: 5,
    delayHours: 0,
    emailsSent: 65,
    opened: 28,
    clicked: 8,
    openRate: 43.1,
    clickRate: 12.3,
    dropOffRate: 9.7,
  },
];

// Translations
const translations = {
  en: {
    title: "Sequence Analytics",
    subtitle: "Track email performance and conversion metrics",
    overview: "Overview",
    sequences: "Sequences",
    stepAnalysis: "Step Analysis",
    totalSequences: "Total Sequences",
    activeSequences: "Active Sequences",
    totalEnrollments: "Total Enrollments",
    totalEmailsSent: "Emails Sent",
    avgOpenRate: "Avg. Open Rate",
    avgClickRate: "Avg. Click Rate",
    avgConversionRate: "Avg. Conversion",
    topPerformer: "Top Performer",
    needsAttention: "Needs Attention",
    recentActivity: "Recent Activity (7 Days)",
    sequenceName: "Sequence",
    enrollments: "Enrollments",
    active: "Active",
    completed: "Completed",
    paused: "Paused",
    emailsSent: "Sent",
    opened: "Opened",
    clicked: "Clicked",
    openRate: "Open Rate",
    clickRate: "Click Rate",
    clickToOpen: "Click-to-Open",
    conversions: "Conversions",
    conversionRate: "Conv. Rate",
    viewDetails: "View Details",
    stepNumber: "Step",
    subject: "Subject",
    delay: "Delay",
    dropOff: "Drop-off",
    days: "days",
    hours: "hours",
    noData: "No data available",
    refresh: "Refresh",
    conversionFunnel: "Conversion Funnel",
    enrolled: "Enrolled",
    receivedEmail: "Received Email",
    converted: "Converted",
    benchmark: "Industry Benchmark",
    belowAverage: "Below Average",
    average: "Average",
    aboveAverage: "Above Average",
    excellent: "Excellent",
  },
  fr: {
    title: "Analytique des séquences",
    subtitle: "Suivez les performances des e-mails et les métriques de conversion",
    overview: "Aperçu",
    sequences: "Séquences",
    stepAnalysis: "Analyse des étapes",
    totalSequences: "Total des séquences",
    activeSequences: "Séquences actives",
    totalEnrollments: "Total des inscriptions",
    totalEmailsSent: "E-mails envoyés",
    avgOpenRate: "Taux d'ouverture moy.",
    avgClickRate: "Taux de clic moy.",
    avgConversionRate: "Conversion moy.",
    topPerformer: "Meilleure performance",
    needsAttention: "Nécessite attention",
    recentActivity: "Activité récente (7 jours)",
    sequenceName: "Séquence",
    enrollments: "Inscriptions",
    active: "Actif",
    completed: "Terminé",
    paused: "En pause",
    emailsSent: "Envoyés",
    opened: "Ouverts",
    clicked: "Cliqués",
    openRate: "Taux d'ouverture",
    clickRate: "Taux de clic",
    clickToOpen: "Clic-sur-ouverture",
    conversions: "Conversions",
    conversionRate: "Taux de conv.",
    viewDetails: "Voir détails",
    stepNumber: "Étape",
    subject: "Sujet",
    delay: "Délai",
    dropOff: "Abandon",
    days: "jours",
    hours: "heures",
    noData: "Aucune donnée disponible",
    refresh: "Actualiser",
    conversionFunnel: "Entonnoir de conversion",
    enrolled: "Inscrits",
    receivedEmail: "E-mail reçu",
    converted: "Convertis",
    benchmark: "Référence industrie",
    belowAverage: "Sous la moyenne",
    average: "Moyenne",
    aboveAverage: "Au-dessus de la moyenne",
    excellent: "Excellent",
  },
};

// Helper function to get performance rating
function getPerformanceRating(rate: number, type: "open" | "click" | "conversion"): {
  label: string;
  color: string;
  bgColor: string;
} {
  const benchmarks = {
    open: { low: 20, avg: 30, high: 45 },
    click: { low: 5, avg: 10, high: 15 },
    conversion: { low: 3, avg: 8, high: 15 },
  };
  
  const b = benchmarks[type];
  
  if (rate < b.low) {
    return { label: "belowAverage", color: "text-red-400", bgColor: "bg-red-500/20" };
  } else if (rate < b.avg) {
    return { label: "average", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
  } else if (rate < b.high) {
    return { label: "aboveAverage", color: "text-green-400", bgColor: "bg-green-500/20" };
  } else {
    return { label: "excellent", color: "text-teal-400", bgColor: "bg-teal-500/20" };
  }
}

export default function SequenceAnalyticsDashboard() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [activeTab, setActiveTab] = useState<"overview" | "sequences" | "steps">("overview");
  const [selectedSequence, setSelectedSequence] = useState<number | null>(null);
  const [expandedSequence, setExpandedSequence] = useState<number | null>(null);
  
  const analytics = mockOverallAnalytics;
  const sequences = mockSequences;
  const steps = mockStepMetrics;
  
  // Calculate max values for chart scaling
  const maxEmailsSent = Math.max(...analytics.recentActivity.map(a => a.emailsSent));
  
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
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["overview", "sequences", "steps"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? "bg-teal-500 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            {tab === "overview" ? t.overview : tab === "sequences" ? t.sequences : t.stepAnalysis}
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
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-teal-400" />
                  </div>
                  <span className="text-slate-400 text-sm">{t.totalSequences}</span>
                </div>
                <div className="text-2xl font-bold">{analytics.totalSequences}</div>
                <div className="text-sm text-slate-400">{analytics.activeSequences} {t.active.toLowerCase()}</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-slate-400 text-sm">{t.totalEnrollments}</span>
                </div>
                <div className="text-2xl font-bold">{analytics.totalEnrollments}</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#E7F2F2]/20 rounded-lg">
                    <Mail className="w-5 h-5 text-[#0F3D3E]" />
                  </div>
                  <span className="text-slate-400 text-sm">{t.totalEmailsSent}</span>
                </div>
                <div className="text-2xl font-bold">{analytics.totalEmailsSent}</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#C65A1E]/20 rounded-lg">
                    <Target className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-slate-400 text-sm">{t.avgConversionRate}</span>
                </div>
                <div className="text-2xl font-bold">{analytics.averageConversionRate}%</div>
              </div>
            </div>
            
            {/* Rate Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-teal-400" />
                    <span className="font-medium">{t.avgOpenRate}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPerformanceRating(analytics.averageOpenRate, "open").bgColor} ${getPerformanceRating(analytics.averageOpenRate, "open").color}`}>
                    {t[getPerformanceRating(analytics.averageOpenRate, "open").label as keyof typeof t]}
                  </span>
                </div>
                <div className="text-4xl font-bold mb-2">{analytics.averageOpenRate}%</div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(analytics.averageOpenRate, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-2">{t.benchmark}: 30-45%</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">{t.avgClickRate}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPerformanceRating(analytics.averageClickRate, "click").bgColor} ${getPerformanceRating(analytics.averageClickRate, "click").color}`}>
                    {t[getPerformanceRating(analytics.averageClickRate, "click").label as keyof typeof t]}
                  </span>
                </div>
                <div className="text-4xl font-bold mb-2">{analytics.averageClickRate}%</div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(analytics.averageClickRate * 5, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-2">{t.benchmark}: 10-15%</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    <span className="font-medium">{t.avgConversionRate}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPerformanceRating(analytics.averageConversionRate, "conversion").bgColor} ${getPerformanceRating(analytics.averageConversionRate, "conversion").color}`}>
                    {t[getPerformanceRating(analytics.averageConversionRate, "conversion").label as keyof typeof t]}
                  </span>
                </div>
                <div className="text-4xl font-bold mb-2">{analytics.averageConversionRate}%</div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-[#C65A1E] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(analytics.averageConversionRate * 5, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-2">{t.benchmark}: 8-15%</div>
              </div>
            </div>
            
            {/* Top/Bottom Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.topPerformingSequence && (
                <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-green-400">{t.topPerformer}</span>
                  </div>
                  <div className="text-xl font-bold mb-1">{analytics.topPerformingSequence.name}</div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">{analytics.topPerformingSequence.conversionRate}% {t.conversionRate}</span>
                  </div>
                </div>
              )}
              
              {analytics.bottomPerformingSequence && (
                <div className="bg-gradient-to-br from-[#C65A1E]/20 to-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <span className="font-medium text-orange-400">{t.needsAttention}</span>
                  </div>
                  <div className="text-xl font-bold mb-1">{analytics.bottomPerformingSequence.name}</div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400">{analytics.bottomPerformingSequence.conversionRate}% {t.conversionRate}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Recent Activity Chart */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">{t.recentActivity}</h3>
              <div className="flex items-end gap-2 h-48">
                {analytics.recentActivity.map((day, index) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-1" style={{ height: "160px" }}>
                      <div
                        className="w-full bg-[#E7F2F2]/60 rounded-t transition-all"
                        style={{ height: `${(day.emailsSent / maxEmailsSent) * 100}%` }}
                        title={`${t.emailsSent}: ${day.emailsSent}`}
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(day.date).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { weekday: "short" })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#E7F2F2] rounded" />
                  <span className="text-slate-400">{t.emailsSent}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Sequences Tab */}
        {activeTab === "sequences" && (
          <motion.div
            key="sequences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {sequences.map((seq) => (
              <div
                key={seq.sequenceId}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedSequence(expandedSequence === seq.sequenceId ? null : seq.sequenceId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{seq.sequenceName}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span>{seq.totalEnrollments} {t.enrollments}</span>
                        <span className="text-green-400">{seq.activeEnrollments} {t.active}</span>
                        <span>{seq.completedEnrollments} {t.completed}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-400">{seq.conversionRate}%</div>
                        <div className="text-xs text-slate-400">{t.conversionRate}</div>
                      </div>
                      {expandedSequence === seq.sequenceId ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedSequence === seq.sequenceId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">{t.emailsSent}</div>
                          <div className="text-xl font-bold">{seq.totalEmailsSent}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">{t.openRate}</div>
                          <div className="text-xl font-bold text-teal-400">{seq.openRate}%</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">{t.clickRate}</div>
                          <div className="text-xl font-bold text-blue-400">{seq.clickRate}%</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-sm text-slate-400 mb-1">{t.conversions}</div>
                          <div className="text-xl font-bold text-orange-400">{seq.conversions}</div>
                        </div>
                      </div>
                      
                      {/* Conversion Funnel */}
                      <div className="px-6 pb-6">
                        <h4 className="text-sm font-medium text-slate-400 mb-3">{t.conversionFunnel}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="bg-teal-500/20 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold">{seq.totalEnrollments}</div>
                              <div className="text-xs text-slate-400">{t.enrolled}</div>
                            </div>
                          </div>
                          <div className="text-slate-500">→</div>
                          <div className="flex-1">
                            <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold">{seq.totalOpened}</div>
                              <div className="text-xs text-slate-400">{t.opened}</div>
                            </div>
                          </div>
                          <div className="text-slate-500">→</div>
                          <div className="flex-1">
                            <div className="bg-[#E7F2F2]/20 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold">{seq.totalClicked}</div>
                              <div className="text-xs text-slate-400">{t.clicked}</div>
                            </div>
                          </div>
                          <div className="text-slate-500">→</div>
                          <div className="flex-1">
                            <div className="bg-[#C65A1E]/20 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold">{seq.conversions}</div>
                              <div className="text-xs text-slate-400">{t.converted}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Steps Tab */}
        {activeTab === "steps" && (
          <motion.div
            key="steps"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.stepNumber}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.subject}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.delay}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.emailsSent}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.openRate}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.clickRate}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.dropOff}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {steps.map((step) => (
                      <tr key={step.stepId} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 font-bold">
                            {step.stepOrder}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{language === "fr" ? step.subjectFr : step.subjectEn}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {step.delayDays > 0 && `${step.delayDays} ${t.days}`}
                          {step.delayDays > 0 && step.delayHours > 0 && ", "}
                          {step.delayHours > 0 && `${step.delayHours} ${t.hours}`}
                          {step.delayDays === 0 && step.delayHours === 0 && "Immediate"}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{step.emailsSent}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${getPerformanceRating(step.openRate, "open").bgColor} ${getPerformanceRating(step.openRate, "open").color}`}>
                            {step.openRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${getPerformanceRating(step.clickRate, "click").bgColor} ${getPerformanceRating(step.clickRate, "click").color}`}>
                            {step.clickRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {step.dropOffRate > 0 ? (
                            <span className="text-red-400">-{step.dropOffRate}%</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
