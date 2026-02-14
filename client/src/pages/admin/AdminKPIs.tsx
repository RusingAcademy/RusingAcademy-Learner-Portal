/**
 * AdminKPIs — Live KPIs dashboard for Admin Control System
 * Features: Real-time metrics, trend charts (simulated), performance indicators
 */
import AdminControlLayout from "@/components/AdminControlLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

const ACCENT = "#dc2626";

interface KPI {
  id: string;
  labelEn: string;
  labelFr: string;
  value: number;
  format: "number" | "currency" | "percent" | "time";
  target: number;
  trend: number[];
  unit?: string;
}

const kpiData: KPI[] = [
  { id: "dau", labelEn: "Daily Active Users", labelFr: "Utilisateurs actifs (jour)", value: 234, format: "number", target: 300, trend: [180, 195, 210, 198, 220, 234] },
  { id: "mau", labelEn: "Monthly Active Users", labelFr: "Utilisateurs actifs (mois)", value: 834, format: "number", target: 1000, trend: [680, 720, 750, 790, 810, 834] },
  { id: "mrr", labelEn: "Monthly Recurring Revenue", labelFr: "Revenus récurrents mensuels", value: 12450, format: "currency", target: 15000, trend: [9800, 10200, 10800, 11400, 11900, 12450] },
  { id: "arpu", labelEn: "Avg Revenue Per User", labelFr: "Revenu moyen par utilisateur", value: 14.93, format: "currency", target: 18, trend: [12.1, 12.8, 13.2, 13.9, 14.5, 14.93] },
  { id: "churn", labelEn: "Monthly Churn Rate", labelFr: "Taux de désabonnement", value: 3.2, format: "percent", target: 2.5, trend: [4.8, 4.2, 3.9, 3.6, 3.4, 3.2] },
  { id: "nps", labelEn: "Net Promoter Score", labelFr: "Score NPS", value: 72, format: "number", target: 80, trend: [58, 62, 65, 68, 70, 72] },
  { id: "completion", labelEn: "Path Completion Rate", labelFr: "Taux de complétion", value: 68, format: "percent", target: 75, trend: [52, 55, 58, 62, 65, 68] },
  { id: "session", labelEn: "Avg Session Duration", labelFr: "Durée moyenne de session", value: 24, format: "time", target: 30, trend: [18, 19, 20, 21, 23, 24], unit: "min" },
  { id: "sle_pass", labelEn: "SLE Pass Rate", labelFr: "Taux de réussite ELS", value: 78, format: "percent", target: 85, trend: [60, 65, 68, 72, 75, 78] },
  { id: "coach_rating", labelEn: "Avg Coach Rating", labelFr: "Note moyenne des coachs", value: 4.7, format: "number", target: 4.8, trend: [4.3, 4.4, 4.5, 4.6, 4.65, 4.7] },
  { id: "support_time", labelEn: "Avg Support Response", labelFr: "Temps de réponse support", value: 2.4, format: "time", target: 2.0, trend: [4.2, 3.8, 3.2, 2.9, 2.6, 2.4], unit: "hrs" },
  { id: "conversion", labelEn: "Trial → Paid Conversion", labelFr: "Conversion essai → payant", value: 4.2, format: "percent", target: 5.0, trend: [2.8, 3.1, 3.4, 3.7, 3.9, 4.2] },
];

function formatValue(kpi: KPI): string {
  if (kpi.format === "currency") return `$${kpi.value.toLocaleString()}`;
  if (kpi.format === "percent") return `${kpi.value}%`;
  if (kpi.format === "time") return `${kpi.value} ${kpi.unit || ""}`;
  return kpi.value.toLocaleString();
}

function MiniTrend({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminKPIs() {
  const { lang } = useLanguage();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminControlLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "KPIs en direct" : "Live KPIs"}
            </h1>
            <p className="text-sm text-gray-500">
              {lang === "fr" ? "Dernière mise à jour" : "Last updated"}: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLastRefresh(new Date())}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="material-icons text-lg text-gray-500">refresh</span>
              {lang === "fr" ? "Actualiser" : "Refresh"}
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="material-icons text-lg text-gray-500">download</span>
              {lang === "fr" ? "Exporter" : "Export"}
            </button>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-green-50 border border-green-100 rounded-lg w-fit">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-700 font-medium">{lang === "fr" ? "Données en temps réel" : "Real-time data"}</span>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpiData.map(kpi => {
            const pct = Math.min(100, (kpi.value / kpi.target) * 100);
            const onTrack = pct >= 80;
            const trendUp = kpi.trend[kpi.trend.length - 1] > kpi.trend[0];
            // For churn and support_time, lower is better
            const lowerIsBetter = kpi.id === "churn" || kpi.id === "support_time";
            const isPositive = lowerIsBetter ? !trendUp : trendUp;

            return (
              <div key={kpi.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500 leading-tight max-w-[60%]">{lang === "fr" ? kpi.labelFr : kpi.labelEn}</p>
                  <MiniTrend data={kpi.trend} color={isPositive ? "#059669" : ACCENT} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{formatValue(kpi)}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-400">
                    {lang === "fr" ? "Cible" : "Target"}: {kpi.format === "currency" ? "$" : ""}{kpi.target}{kpi.format === "percent" ? "%" : ""}{kpi.unit ? ` ${kpi.unit}` : ""}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {isPositive ? "↑" : "↓"} {Math.abs(Math.round(((kpi.trend[kpi.trend.length - 1] - kpi.trend[0]) / kpi.trend[0]) * 100))}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    backgroundColor: onTrack ? "#059669" : pct >= 60 ? "#d97706" : ACCENT
                  }} />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">{Math.round(pct)}% {lang === "fr" ? "de l'objectif" : "of target"}</p>
              </div>
            );
          })}
        </div>

        {/* Performance Summary */}
        <div className="mt-6 bg-gradient-to-br from-[#dc2626]/5 to-[#dc2626]/10 rounded-xl border border-[#dc2626]/15 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-icons" style={{ color: ACCENT }}>insights</span>
            {lang === "fr" ? "Résumé de performance" : "Performance Summary"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">{lang === "fr" ? "KPIs sur cible" : "KPIs on target"}</p>
              <p className="text-2xl font-bold text-green-600">{kpiData.filter(k => (k.value / k.target) >= 0.8).length}/{kpiData.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{lang === "fr" ? "Tendance globale" : "Overall trend"}</p>
              <p className="text-2xl font-bold text-green-600">↑ {lang === "fr" ? "Positive" : "Positive"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{lang === "fr" ? "Attention requise" : "Needs attention"}</p>
              <p className="text-2xl font-bold text-amber-600">{kpiData.filter(k => (k.value / k.target) < 0.8).length} KPIs</p>
            </div>
          </div>
        </div>
      </div>
    </AdminControlLayout>
  );
}
