/**
 * HRDashboardHome — Client Portal: Department Training Overview
 * This is the main dashboard for client organizations (government departments,
 * ministries, agencies) that have contracted RusingÂcademy for language training.
 * Features: Training KPIs, SLE compliance overview, contract/billing summary, participant activity
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#2563eb";

function KPICard({ icon, label, value, sub, trend }: { icon: string; label: string; value: string; sub: string; trend?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ACCENT}10` }}>
          <span className="material-icons text-xl" style={{ color: ACCENT }}>{icon}</span>
        </div>
        {trend && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${trend.startsWith("+") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{trend}</span>}
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function ComplianceBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold" style={{ color }}>{current}/{target}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function HRDashboardHome() {
  const { lang } = useLanguage();
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-[#2563eb]/5 to-[#2563eb]/10 border border-[#2563eb]/15">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize" style={{ fontFamily: "'Playfair Display', serif" }}>
                {lang === "fr" ? "Tableau de bord — Formation linguistique" : "Training Overview Dashboard"}
              </h1>
              <p className="text-sm text-gray-500 capitalize mt-1">{dateStr}</p>
              <p className="text-xs text-gray-400 mt-1">
                {lang === "fr"
                  ? "Secrétariat du Conseil du Trésor — Contrat de formation linguistique RusingÂcademy"
                  : "Treasury Board Secretariat — RusingÂcademy Language Training Contract"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {lang === "fr" ? "Contrat actif" : "Active Contract"}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            icon="groups"
            label={lang === "fr" ? "Participants inscrits" : "Enrolled Participants"}
            value="45"
            sub={lang === "fr" ? "sur 60 postes autorisés" : "of 60 authorized seats"}
            trend="+3"
          />
          <KPICard
            icon="verified"
            label={lang === "fr" ? "Conformité ELS" : "SLE Compliance"}
            value="78%"
            sub={lang === "fr" ? "Objectif ministériel: 85%" : "Departmental target: 85%"}
            trend="+5%"
          />
          <KPICard
            icon="receipt_long"
            label={lang === "fr" ? "Budget consommé" : "Budget Consumed"}
            value="$34,200"
            sub={lang === "fr" ? "de $50,000 au contrat" : "of $50,000 contracted"}
          />
          <KPICard
            icon="school"
            label={lang === "fr" ? "Cohortes actives" : "Active Cohorts"}
            value="6"
            sub={lang === "fr" ? "3 FLS, 2 ALS, 1 Prépa ELS" : "3 FSL, 2 ESL, 1 SLE Prep"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SLE Compliance Overview */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                {lang === "fr" ? "Conformité ELS par compétence" : "SLE Compliance by Skill"}
              </h2>
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                {lang === "fr" ? "Mis à jour aujourd'hui" : "Updated today"}
              </span>
            </div>
            <ComplianceBar label={lang === "fr" ? "Compréhension de l'écrit" : "Reading Comprehension"} current={38} target={45} color="#059669" />
            <ComplianceBar label={lang === "fr" ? "Expression écrite" : "Written Expression"} current={32} target={45} color="#2563eb" />
            <ComplianceBar label={lang === "fr" ? "Compétence orale" : "Oral Proficiency"} current={28} target={45} color="#d97706" />
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-start gap-2">
                <span className="material-icons text-amber-500 text-lg mt-0.5">warning</span>
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    {lang === "fr" ? "Action recommandée" : "Recommended Action"}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    {lang === "fr"
                      ? "17 participants n'ont pas encore atteint le niveau B requis en compétence orale. Nous recommandons d'intensifier les sessions de conversation."
                      : "17 participants have not yet reached the required B level in oral proficiency. We recommend intensifying conversation sessions."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract & Billing Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {lang === "fr" ? "Résumé du contrat" : "Contract Summary"}
            </h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg viewBox="0 0 120 120" className="transform -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={ACCENT} strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 50} strokeDashoffset={2 * Math.PI * 50 * (1 - 0.684)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900">68.4%</span>
                <span className="text-[10px] text-gray-500">{lang === "fr" ? "consommé" : "consumed"}</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: lang === "fr" ? "Sessions de coaching" : "Coaching Sessions", amount: "$18,400", pct: "54%" },
                { label: lang === "fr" ? "Licences plateforme" : "Platform Licenses", amount: "$9,800", pct: "29%" },
                { label: lang === "fr" ? "Matériel pédagogique" : "Learning Materials", amount: "$6,000", pct: "17%" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{item.label}</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{item.amount}</span>
                    <span className="text-gray-400 ml-1">({item.pct})</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
              <span className="text-gray-500">{lang === "fr" ? "Solde restant" : "Remaining Balance"}</span>
              <span className="font-bold text-green-600">$15,800</span>
            </div>
          </div>
        </div>

        {/* Participant Training Activity */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {lang === "fr" ? "Activité récente des participants" : "Recent Participant Activity"}
            </h2>
            <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500 font-medium">
              {lang === "fr" ? "5 dernières mises à jour" : "Last 5 updates"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Participant" : "Participant"}</th>
                  <th className="text-left py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Programme" : "Program"}</th>
                  <th className="text-center py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Progression" : "Progress"}</th>
                  <th className="text-center py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Niveau actuel" : "Current Level"}</th>
                  <th className="text-center py-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Statut" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Jean-Pierre Lavoie", program: "FSL B2", progress: 78, level: "B1+", status: "on-track" },
                  { name: "Sarah Mitchell", program: "SLE Prep", progress: 92, level: "B2", status: "ahead" },
                  { name: "Marc Bouchard", program: "FSL B1", progress: 45, level: "A2+", status: "on-track" },
                  { name: "Emily Roberts", program: "ESL C1", progress: 60, level: "B2+", status: "on-track" },
                  { name: "Pierre Gagné", program: "SLE Prep", progress: 25, level: "A2", status: "behind" },
                ].map((emp, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] flex items-center justify-center text-white text-xs font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{emp.program}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${emp.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-600 w-8">{emp.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm font-medium text-gray-900">{emp.level}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        emp.status === "ahead" ? "bg-green-50 text-green-700 border-green-200" :
                        emp.status === "behind" ? "bg-red-50 text-red-500 border-red-200" :
                        "bg-blue-50 text-blue-600 border-blue-200"
                      }`}>
                        {emp.status === "ahead" ? (lang === "fr" ? "En avance" : "Ahead") :
                         emp.status === "behind" ? (lang === "fr" ? "En retard" : "Behind") :
                         (lang === "fr" ? "En bonne voie" : "On Track")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions for Client */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-[#2563eb]/30 transition-all text-left group">
            <span className="material-icons text-[#2563eb] text-2xl mb-2 group-hover:scale-110 transition-transform">person_add</span>
            <p className="text-sm font-semibold text-gray-900">{lang === "fr" ? "Inscrire un participant" : "Enroll a Participant"}</p>
            <p className="text-[11px] text-gray-500 mt-1">{lang === "fr" ? "Ajouter un nouveau participant à une cohorte" : "Add a new participant to a training cohort"}</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-[#2563eb]/30 transition-all text-left group">
            <span className="material-icons text-[#2563eb] text-2xl mb-2 group-hover:scale-110 transition-transform">download</span>
            <p className="text-sm font-semibold text-gray-900">{lang === "fr" ? "Télécharger un rapport" : "Download Report"}</p>
            <p className="text-[11px] text-gray-500 mt-1">{lang === "fr" ? "Rapport de conformité ELS pour votre direction" : "SLE compliance report for your directorate"}</p>
          </button>
          <button className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-[#2563eb]/30 transition-all text-left group">
            <span className="material-icons text-[#2563eb] text-2xl mb-2 group-hover:scale-110 transition-transform">support_agent</span>
            <p className="text-sm font-semibold text-gray-900">{lang === "fr" ? "Contacter votre gestionnaire" : "Contact Your Account Manager"}</p>
            <p className="text-[11px] text-gray-500 mt-1">{lang === "fr" ? "Discuter de votre contrat ou demander un ajustement" : "Discuss your contract or request an adjustment"}</p>
          </button>
        </div>
      </div>
    </HRLayout>
  );
}
