/**
 * CoachRevenue — Revenue tracking and earnings for Coach Portal
 * Features: Earnings overview, payout history, commission tiers, revenue chart
 */
import CoachLayout from "@/components/CoachLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const ACCENT = "#7c3aed";

interface Payout {
  id: number;
  period: string;
  amount: number;
  sessions: number;
  status: "paid" | "pending" | "processing";
  date: string;
}

const mockPayouts: Payout[] = [
  { id: 1, period: "Feb 1-15, 2026", amount: 1170, sessions: 9, status: "pending", date: "Feb 20" },
  { id: 2, period: "Jan 16-31, 2026", amount: 1040, sessions: 8, status: "paid", date: "Feb 5" },
  { id: 3, period: "Jan 1-15, 2026", amount: 910, sessions: 7, status: "paid", date: "Jan 20" },
  { id: 4, period: "Dec 16-31, 2025", amount: 1300, sessions: 10, status: "paid", date: "Jan 5" },
  { id: 5, period: "Dec 1-15, 2025", amount: 780, sessions: 6, status: "paid", date: "Dec 20" },
];

const monthlyRevenue = [
  { month: "Sep", amount: 1800 }, { month: "Oct", amount: 2100 }, { month: "Nov", amount: 1950 },
  { month: "Dec", amount: 2080 }, { month: "Jan", amount: 1950 }, { month: "Feb", amount: 2340 },
];

function PayoutStatusBadge({ status }: { status: Payout["status"] }) {
  const styles = {
    paid: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SimpleBarChart({ data }: { data: typeof monthlyRevenue }) {
  const max = Math.max(...data.map(d => d.amount));
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] font-semibold text-gray-700">${(d.amount / 1000).toFixed(1)}k</span>
          <div className="w-full rounded-t-md transition-all hover:opacity-80" style={{
            height: `${(d.amount / max) * 100}%`,
            background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT}80)`,
            minHeight: "8px",
          }} />
          <span className="text-[10px] text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function CoachRevenue() {
  const { lang } = useLanguage();
  const [tab] = useState<"overview" | "payouts">("overview");

  return (
    <CoachLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lang === "fr" ? "Revenus" : "Revenue"}
          </h1>
          <p className="text-sm text-gray-500">{lang === "fr" ? "Suivez vos revenus et paiements" : "Track your earnings and payouts"}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: "account_balance_wallet", label: lang === "fr" ? "Solde disponible" : "Available Balance", value: "$1,170", sub: lang === "fr" ? "Prochain paiement: 20 fév" : "Next payout: Feb 20" },
            { icon: "trending_up", label: lang === "fr" ? "Ce mois" : "This Month", value: "$2,340", sub: "↑ 15% vs last month" },
            { icon: "payments", label: lang === "fr" ? "Total payé" : "Total Paid", value: "$12,480", sub: lang === "fr" ? "Depuis le début" : "All time" },
            { icon: "percent", label: lang === "fr" ? "Taux de commission" : "Commission Rate", value: "65%", sub: lang === "fr" ? "Niveau Or" : "Gold Tier" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${ACCENT}10` }}>
                <span className="material-icons text-xl" style={{ color: ACCENT }}>{kpi.icon}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-[10px] text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                {lang === "fr" ? "Tendance des revenus" : "Revenue Trend"}
              </h2>
              <SimpleBarChart data={monthlyRevenue} />
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                {lang === "fr" ? "Historique des paiements" : "Payout History"}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Période" : "Period"}</th>
                      <th className="text-right py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Sessions" : "Sessions"}</th>
                      <th className="text-right py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Montant" : "Amount"}</th>
                      <th className="text-right py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Statut" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayouts.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-3">
                          <p className="text-sm text-gray-900">{p.period}</p>
                          <p className="text-[10px] text-gray-400">{lang === "fr" ? "Payé le" : "Paid"}: {p.date}</p>
                        </td>
                        <td className="text-right text-sm text-gray-700">{p.sessions}</td>
                        <td className="text-right text-sm font-semibold text-gray-900">${p.amount.toLocaleString()}</td>
                        <td className="text-right"><PayoutStatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Commission Tier */}
            <div className="bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-icons text-amber-300">emoji_events</span>
                <h3 className="text-sm font-semibold">{lang === "fr" ? "Niveau de commission" : "Commission Tier"}</h3>
              </div>
              <p className="text-3xl font-bold mb-1">Gold</p>
              <p className="text-sm opacity-80 mb-4">65% {lang === "fr" ? "commission" : "commission rate"}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">{lang === "fr" ? "Étudiants requis" : "Students Required"}</span>
                  <span className="font-semibold">15+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">{lang === "fr" ? "Vos étudiants" : "Your Students"}</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">{lang === "fr" ? "Prochain niveau" : "Next Tier"}</span>
                  <span className="font-semibold">Platinum (30+)</span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 rounded-full" style={{ width: "80%" }} />
              </div>
              <p className="text-[10px] opacity-60 mt-1">24/30 {lang === "fr" ? "étudiants pour Platinum" : "students to Platinum"}</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {lang === "fr" ? "Statistiques rapides" : "Quick Stats"}
              </h3>
              <div className="space-y-3">
                {[
                  { label: lang === "fr" ? "Revenu moyen/session" : "Avg Revenue/Session", value: "$130" },
                  { label: lang === "fr" ? "Sessions ce mois" : "Sessions This Month", value: "18" },
                  { label: lang === "fr" ? "Taux de rétention" : "Retention Rate", value: "92%" },
                  { label: lang === "fr" ? "Heures enseignées" : "Hours Taught", value: "36h" },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{stat.label}</span>
                    <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CoachLayout>
  );
}
