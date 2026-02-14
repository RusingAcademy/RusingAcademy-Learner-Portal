/**
 * SLEProgressDashboard — Comprehensive Progress Tracking UI
 *
 * Displays:
 *   - Overall Level badge (A/B/C) based on last 5 sessions
 *   - Criterion Scores radar chart (grammar, vocabulary, fluency, pronunciation, comprehension)
 *   - Session Streak counter
 *   - Score trend line chart (Recharts)
 *   - Detailed session history with expandable rows
 *   - Predicted SLE Result with confidence
 *
 * Uses the sleProgress tRPC router for aggregated data.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Trophy, Target, Flame, Clock, TrendingUp, TrendingDown,
  Minus, Calendar, ChevronDown, ChevronUp, BarChart3,
  BookOpen, Mic, PenTool, Headphones, ArrowRight,
  CheckCircle, AlertTriangle, Star, Zap, Activity
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Area, AreaChart
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Types ───────────────────────────────────────────────────────────
type Language = "fr" | "en";

// ─── Labels ──────────────────────────────────────────────────────────
const labels = {
  fr: {
    title: "Tableau de bord — Progression ÉLS",
    subtitle: "Suivez votre progression vers la réussite de l'examen",
    overallLevel: "Niveau global",
    basedOnLast5: "Basé sur les 5 dernières sessions",
    totalSessions: "Sessions totales",
    totalMinutes: "Minutes de pratique",
    averageScore: "Score moyen",
    streak: "Jours consécutifs",
    days: "jours",
    criteriaTitle: "Compétences par critère",
    criteriaSubtitle: "Performance moyenne sur les 5 dernières sessions",
    fluency: "Aisance",
    comprehension: "Compréhension",
    vocabulary: "Vocabulaire",
    grammar: "Grammaire",
    pronunciation: "Prononciation",
    trendTitle: "Évolution du score",
    trendSubtitle: "Score moyen par session",
    historyTitle: "Historique des sessions",
    historySubtitle: "Vos sessions récentes avec détails",
    noSessions: "Aucune session enregistrée",
    noSessionsDesc: "Commencez une session avec votre coach IA pour voir votre progression ici.",
    startPractice: "Commencer la pratique",
    prediction: "Prédiction ÉLS",
    predictionDesc: "Estimation basée sur votre performance récente",
    confidence: "Confiance",
    improving: "En progression",
    stable: "Stable",
    declining: "En baisse",
    coach: "Coach",
    level: "Niveau",
    score: "Score",
    duration: "Durée",
    date: "Date",
    messages: "Messages",
    status: "Statut",
    completed: "Terminée",
    active: "En cours",
    abandoned: "Abandonnée",
    viewAll: "Voir tout",
    loadMore: "Charger plus",
    min: "min",
    oral: "Expression orale",
    written: "Expression écrite",
    oralComp: "Compréhension orale",
    writtenComp: "Compréhension écrite",
    strongestSkill: "Compétence la plus forte",
    weakestSkill: "Compétence à améliorer",
    recommendation: "Recommandation",
    recommendationText: "Concentrez-vous sur {skill} pour maximiser votre score global.",
  },
  en: {
    title: "SLE Progress Dashboard",
    subtitle: "Track your progress towards exam success",
    overallLevel: "Overall Level",
    basedOnLast5: "Based on last 5 sessions",
    totalSessions: "Total Sessions",
    totalMinutes: "Practice Minutes",
    averageScore: "Average Score",
    streak: "Day Streak",
    days: "days",
    criteriaTitle: "Skill Breakdown",
    criteriaSubtitle: "Average performance over last 5 sessions",
    fluency: "Fluency",
    comprehension: "Comprehension",
    vocabulary: "Vocabulary",
    grammar: "Grammar",
    pronunciation: "Pronunciation",
    trendTitle: "Score Trend",
    trendSubtitle: "Average score per session",
    historyTitle: "Session History",
    historySubtitle: "Your recent sessions with details",
    noSessions: "No sessions recorded",
    noSessionsDesc: "Start a session with your AI coach to see your progress here.",
    startPractice: "Start Practicing",
    prediction: "SLE Prediction",
    predictionDesc: "Estimate based on your recent performance",
    confidence: "Confidence",
    improving: "Improving",
    stable: "Stable",
    declining: "Declining",
    coach: "Coach",
    level: "Level",
    score: "Score",
    duration: "Duration",
    date: "Date",
    messages: "Messages",
    status: "Status",
    completed: "Completed",
    active: "Active",
    abandoned: "Abandoned",
    viewAll: "View All",
    loadMore: "Load More",
    min: "min",
    oral: "Oral Expression",
    written: "Written Expression",
    oralComp: "Oral Comprehension",
    writtenComp: "Written Comprehension",
    strongestSkill: "Strongest Skill",
    weakestSkill: "Skill to Improve",
    recommendation: "Recommendation",
    recommendationText: "Focus on {skill} to maximize your overall score.",
  },
};

// ─── Coach Data ──────────────────────────────────────────────────────
const coachImages: Record<string, string> = {
  STEVEN: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
  SUE_ANNE: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
  ERIKA: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
  PRECIOSA: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Preciosa2.webp",
};
const coachNames: Record<string, string> = {
  STEVEN: "Coach Steven",
  SUE_ANNE: "Coach Steven",
  ERIKA: "Coach Steven",
  PRECIOSA: "Coach Preciosa",
};

// ─── Level Colors ────────────────────────────────────────────────────
const levelConfig = {
  X: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", label: "Not Assessed" },
  A: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", label: "Level A" },
  B: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", label: "Level B" },
  C: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30", label: "Level C" },
};

// ─── Skill Icons ─────────────────────────────────────────────────────
const skillIcons: Record<string, typeof Mic> = {
  oral_expression: Mic,
  oral_comprehension: Headphones,
  written_expression: PenTool,
  written_comprehension: BookOpen,
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function SLEProgressDashboard() {
  const { user } = useAuth();
  const [language] = useState<Language>("fr"); // Could be derived from user preference
  const [historyPage, setHistoryPage] = useState(0);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  const l = labels[language];

  // tRPC queries
  const summaryQuery = trpc.sleProgress.getSummary.useQuery(undefined, {
    enabled: !!user,
  });
  const trendQuery = trpc.sleProgress.getScoreTrend.useQuery(
    { limit: 20 },
    { enabled: !!user }
  );
  const historyQuery = trpc.sleProgress.getDetailedHistory.useQuery(
    { limit: 10, offset: historyPage * 10 },
    { enabled: !!user }
  );

  const summary = summaryQuery.data;
  const trendData = trendQuery.data;
  const history = historyQuery.data;

  // Derived data
  const radarData = useMemo(() => {
    if (!summary) return [];
    return [
      { criterion: l.fluency, value: summary.criteriaAverages.fluency, fullMark: 100 },
      { criterion: l.comprehension, value: summary.criteriaAverages.comprehension, fullMark: 100 },
      { criterion: l.vocabulary, value: summary.criteriaAverages.vocabulary, fullMark: 100 },
      { criterion: l.grammar, value: summary.criteriaAverages.grammar, fullMark: 100 },
      { criterion: l.pronunciation, value: summary.criteriaAverages.pronunciation, fullMark: 100 },
    ];
  }, [summary, l]);

  const strongestSkill = useMemo(() => {
    if (!summary) return null;
    const entries = Object.entries(summary.criteriaAverages);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0];
  }, [summary]);

  const weakestSkill = useMemo(() => {
    if (!summary) return null;
    const entries = Object.entries(summary.criteriaAverages);
    entries.sort((a, b) => a[1] - b[1]);
    return entries[0];
  }, [summary]);

  const criterionLabels: Record<string, string> = {
    fluency: l.fluency,
    comprehension: l.comprehension,
    vocabulary: l.vocabulary,
    grammar: l.grammar,
    pronunciation: l.pronunciation,
  };

  // Predicted SLE level with confidence
  const prediction = useMemo(() => {
    if (!summary || summary.totalSessions < 3) return null;
    const score = summary.averageScore;
    const level = score >= 75 ? "C" : score >= 55 ? "B" : score >= 35 ? "A" : "X";
    // Confidence based on session count and consistency
    const sessionFactor = Math.min(summary.totalSessions / 10, 1);
    const trendFactor = summary.recentTrend === "improving" ? 0.1 : summary.recentTrend === "declining" ? -0.1 : 0;
    const confidence = Math.round(Math.min(95, (sessionFactor * 70) + (score > 50 ? 15 : 5) + trendFactor * 100));
    return { level, confidence };
  }, [summary]);

  // ─── Loading State ─────────────────────────────────────────────────
  if (summaryQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64 bg-slate-800" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // ─── Empty State ───────────────────────────────────────────────────
  if (!summary || summary.totalSessions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">{l.noSessions}</h2>
          <p className="text-slate-400 mb-8">{l.noSessionsDesc}</p>
          <Link href="/sle-practice">
            <Button className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700">
              <Mic className="h-4 w-4 mr-2" />
              {l.startPractice}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Level Config ──────────────────────────────────────────────────
  const lvl = levelConfig[summary.overallLevel as keyof typeof levelConfig] || levelConfig.X;
  const TrendIcon = summary.recentTrend === "improving" ? TrendingUp : summary.recentTrend === "declining" ? TrendingDown : Minus;
  const trendColor = summary.recentTrend === "improving" ? "text-emerald-400" : summary.recentTrend === "declining" ? "text-red-400" : "text-slate-400";
  const trendLabel = summary.recentTrend === "improving" ? l.improving : summary.recentTrend === "declining" ? l.declining : l.stable;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold mb-1">{l.title}</h1>
          <p className="text-slate-400">{l.subtitle}</p>
        </motion.div>

        {/* ─── Top Stats Row ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {/* Overall Level — Large */}
          <div className={cn(
            "col-span-2 md:col-span-1 p-6 rounded-xl border text-center",
            lvl.bg, lvl.border
          )}>
            <p className="text-xs text-slate-400 mb-2">{l.overallLevel}</p>
            <p className={cn("text-6xl font-black", lvl.text)}>{summary.overallLevel}</p>
            <p className="text-[10px] text-slate-500 mt-1">{l.basedOnLast5}</p>
          </div>

          {/* Total Sessions */}
          <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">{l.totalSessions}</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.totalSessions}</p>
          </div>

          {/* Total Minutes */}
          <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">{l.totalMinutes}</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.totalMinutes}</p>
          </div>

          {/* Average Score */}
          <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">{l.averageScore}</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.averageScore}%</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendIcon className={cn("h-3 w-3", trendColor)} />
              <span className={cn("text-[10px]", trendColor)}>{trendLabel}</span>
            </div>
          </div>

          {/* Streak */}
          <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-slate-400">{l.streak}</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.streakDays}</p>
            <p className="text-[10px] text-slate-500">{l.days}</p>
          </div>
        </motion.div>

        {/* ─── Middle Row: Radar + Trend ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Criteria Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-slate-800/50 border border-slate-700"
          >
            <h3 className="font-semibold text-white mb-1">{l.criteriaTitle}</h3>
            <p className="text-xs text-slate-400 mb-4">{l.criteriaSubtitle}</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis
                    dataKey="criterion"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Strongest / Weakest */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {strongestSkill && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 mb-1">{l.strongestSkill}</p>
                  <p className="text-sm font-semibold text-emerald-300">
                    {criterionLabels[strongestSkill[0]]} — {strongestSkill[1]}%
                  </p>
                </div>
              )}
              {weakestSkill && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] text-amber-400 mb-1">{l.weakestSkill}</p>
                  <p className="text-sm font-semibold text-amber-300">
                    {criterionLabels[weakestSkill[0]]} — {weakestSkill[1]}%
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Score Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-slate-800/50 border border-slate-700"
          >
            <h3 className="font-semibold text-white mb-1">{l.trendTitle}</h3>
            <p className="text-xs text-slate-400 mb-4">{l.trendSubtitle}</p>
            <div className="h-64">
              {trendData && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickFormatter={(val) => {
                        try {
                          return format(new Date(val), "dd/MM", { locale: language === "fr" ? fr : undefined });
                        } catch {
                          return "";
                        }
                      }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                        fontSize: 12,
                      }}
                      labelFormatter={(val) => {
                        try {
                          return format(new Date(val), "PPP", { locale: language === "fr" ? fr : undefined });
                        } catch {
                          return String(val);
                        }
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="url(#scoreGradient)"
                      strokeWidth={2}
                      dot={{ fill: "#6366f1", r: 3 }}
                      activeDot={{ r: 5, fill: "#818cf8" }}
                    />
                    {/* Level threshold lines */}
                    <Line type="monotone" dataKey={() => 55} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Level B" />
                    <Line type="monotone" dataKey={() => 75} stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Level C" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <Activity className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* SLE Prediction */}
            {prediction && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-violet-400 mb-1">{l.prediction}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-2xl font-black",
                        levelConfig[prediction.level as keyof typeof levelConfig]?.text || "text-slate-400"
                      )}>
                        {prediction.level}
                      </span>
                      <span className="text-sm text-slate-400">
                        {l.confidence}: {prediction.confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="w-16 h-16">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                        strokeDasharray={`${prediction.confidence}, 100`}
                        className="stroke-violet-500"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">{l.predictionDesc}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── Recommendation Banner ──────────────────────────────── */}
        {weakestSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20"
          >
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-300 mb-1">{l.recommendation}</h3>
                <p className="text-sm text-blue-200/80">
                  {l.recommendationText.replace("{skill}", criterionLabels[weakestSkill[0]] || weakestSkill[0])}
                </p>
              </div>
              <Link href="/sle-practice" className="ml-auto flex-shrink-0">
                <Button size="sm" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30">
                  {l.startPractice}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ─── Session History ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">{l.historyTitle}</h3>
            <p className="text-xs text-slate-400">{l.historySubtitle}</p>
          </div>

          {history && history.sessions.length > 0 ? (
            <div className="divide-y divide-slate-700/50">
              {history.sessions.map((session) => {
                const isExpanded = expandedSession === session.id;
                const statusLabel = session.status === "completed" ? l.completed : session.status === "active" ? l.active : l.abandoned;
                const statusColor = session.status === "completed" ? "text-emerald-400" : session.status === "active" ? "text-blue-400" : "text-slate-500";

                return (
                  <div key={session.id}>
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-800/50 transition text-left"
                    >
                      {/* Coach Avatar */}
                      <img
                        src={coachImages[session.coachKey] || coachImages.STEVEN}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {coachNames[session.coachKey] || "Coach"}
                          </span>
                          <Badge variant="outline" className={cn(
                            "text-[10px] px-1.5 py-0",
                            levelConfig[session.level as keyof typeof levelConfig]?.border || "",
                            levelConfig[session.level as keyof typeof levelConfig]?.text || ""
                          )}>
                            {session.level}
                          </Badge>
                          {session.sessionMode && session.sessionMode !== "training" && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/30 text-violet-400">
                              {session.sessionMode}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {(() => {
                            try {
                              return format(new Date(session.createdAt), "PPp", { locale: language === "fr" ? fr : undefined });
                            } catch {
                              return String(session.createdAt);
                            }
                          })()}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        {session.averageScore != null ? (
                          <span className={cn(
                            "text-lg font-bold",
                            session.averageScore >= 70 ? "text-emerald-400" :
                            session.averageScore >= 50 ? "text-blue-400" :
                            "text-amber-400"
                          )}>
                            {session.averageScore}%
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="text-right flex-shrink-0 w-16">
                        <span className="text-sm text-slate-400">
                          {Math.round(session.duration / 60)} {l.min}
                        </span>
                      </div>

                      {/* Expand */}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      )}
                    </button>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 py-4 bg-slate-900/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">{l.status}</p>
                              <p className={cn("text-sm font-medium", statusColor)}>{statusLabel}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">{l.messages}</p>
                              <p className="text-sm font-medium text-white">{session.totalMessages || 0}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">{l.level}</p>
                              <p className="text-sm font-medium text-white">{session.level}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">{l.coach}</p>
                              <p className="text-sm font-medium text-white">{coachNames[session.coachKey]}</p>
                            </div>
                            {session.feedback && (
                              <div className="col-span-2 md:col-span-4">
                                <p className="text-[10px] text-slate-500 mb-1">Feedback</p>
                                <p className="text-sm text-slate-300">{session.feedback}</p>
                              </div>
                            )}
                            {session.topic && (
                              <div className="col-span-2 md:col-span-4">
                                <p className="text-[10px] text-slate-500 mb-1">Topic</p>
                                <p className="text-sm text-slate-300">{session.topic}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-slate-500">
              <p>{l.noSessions}</p>
            </div>
          )}

          {/* Load More */}
          {history && history.total > (historyPage + 1) * 10 && (
            <div className="px-6 py-4 border-t border-slate-700 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryPage((p) => p + 1)}
                className="text-slate-400 hover:text-white"
              >
                {l.loadMore}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
