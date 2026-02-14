/**
 * HRDashboardHome — Client Portal: Department Training Overview
 * Connected to real tRPC queries via clientPortal router.
 * Falls back gracefully to empty/loading states when no data is available.
 */
import HRLayout from "@/components/HRLayout";
import CalendlyWidget from "@/components/CalendlyWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

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
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
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

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
      <div className="h-24 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function HRDashboardHome() {
  const { lang } = useLanguage();
  const [showCalendly, setShowCalendly] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Fetch real dashboard data from tRPC
  const { data: dashboard, isLoading, error } = trpc.clientPortal.dashboard.useQuery(undefined, {
    retry: 1,
    staleTime: 60_000,
  });

  // If user doesn't have hr_manager role, show a friendly message
  if (error && (error.message.includes("FORBIDDEN") || error.message.includes("hr_manager"))) {
    return (
      <HRLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <span className="material-icons text-6xl text-gray-300 mb-4">lock</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {lang === "fr" ? "Accès restreint" : "Restricted Access"}
          </h2>
          <p className="text-sm text-gray-500">
            {lang === "fr"
              ? "Ce portail est réservé aux gestionnaires de formation des organisations clientes. Contactez votre administrateur RusingÂcademy pour obtenir l'accès."
              : "This portal is reserved for training managers of client organizations. Contact your RusingÂcademy administrator for access."}
          </p>
        </div>
      </HRLayout>
    );
  }

  if (isLoading) {
    return <HRLayout><LoadingSkeleton /></HRLayout>;
  }

  // Extract data with safe defaults
  const org = dashboard?.organization;
  const participantTotal = dashboard?.participants?.total ?? 0;
  const maxParticipants = org?.maxParticipants ?? 50;
  const cohorts = dashboard?.cohorts ?? { total: 0, active: 0, planned: 0, completed: 0 };
  const billing = dashboard?.billing ?? { totalInvoiced: 0, totalPaid: 0, totalOverdue: 0, pendingCount: 0 };
  const compliance = dashboard?.compliance ?? { total: 0, achieved: 0, inProgress: 0, pending: 0, expired: 0 };
  const sessions = dashboard?.sessions ?? { total: 0, completed: 0, scheduled: 0, cancelled: 0 };

  const budgetTotal = billing.totalInvoiced > 0 ? billing.totalInvoiced : 0;
  const budgetPaid = billing.totalPaid;
  const budgetPct = budgetTotal > 0 ? ((budgetPaid / budgetTotal) * 100).toFixed(1) : "0";
  const compliancePct = compliance.total > 0 ? Math.round((compliance.achieved / compliance.total) * 100) : 0;

  const orgName = org?.name ?? (lang === "fr" ? "Votre organisation" : "Your Organization");
  const contractStatus = org?.status ?? "pending";

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
                {orgName} — {lang === "fr" ? "Contrat de formation linguistique RusingÂcademy" : "RusingÂcademy Language Training Contract"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                contractStatus === "active"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : contractStatus === "pending"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
                <span className={`w-2 h-2 rounded-full ${contractStatus === "active" ? "bg-green-500 animate-pulse" : contractStatus === "pending" ? "bg-amber-500" : "bg-gray-400"}`} />
                {contractStatus === "active"
                  ? (lang === "fr" ? "Contrat actif" : "Active Contract")
                  : contractStatus === "pending"
                  ? (lang === "fr" ? "En attente" : "Pending")
                  : (lang === "fr" ? "Expiré" : "Expired")}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            icon="groups"
            label={lang === "fr" ? "Participants inscrits" : "Enrolled Participants"}
            value={String(participantTotal)}
            sub={lang === "fr" ? `sur ${maxParticipants} postes autorisés` : `of ${maxParticipants} authorized seats`}
          />
          <KPICard
            icon="verified"
            label={lang === "fr" ? "Conformité ELS" : "SLE Compliance"}
            value={`${compliancePct}%`}
            sub={lang === "fr" ? "Objectif ministériel: 85%" : "Departmental target: 85%"}
          />
          <KPICard
            icon="receipt_long"
            label={lang === "fr" ? "Facturé / Payé" : "Invoiced / Paid"}
            value={`$${(budgetPaid / 100).toLocaleString()}`}
            sub={lang === "fr" ? `de $${(budgetTotal / 100).toLocaleString()} facturé` : `of $${(budgetTotal / 100).toLocaleString()} invoiced`}
          />
          <KPICard
            icon="school"
            label={lang === "fr" ? "Cohortes actives" : "Active Cohorts"}
            value={String(cohorts.active)}
            sub={lang === "fr" ? `${cohorts.total} total, ${cohorts.planned} planifiées` : `${cohorts.total} total, ${cohorts.planned} planned`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SLE Compliance Overview */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                {lang === "fr" ? "Conformité ELS par statut" : "SLE Compliance by Status"}
              </h2>
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                {lang === "fr" ? "Données en temps réel" : "Real-time data"}
              </span>
            </div>
            <ComplianceBar
              label={lang === "fr" ? "Objectif atteint" : "Target Achieved"}
              current={compliance.achieved}
              target={compliance.total || 1}
              color="#059669"
            />
            <ComplianceBar
              label={lang === "fr" ? "En cours de formation" : "In Progress"}
              current={compliance.inProgress}
              target={compliance.total || 1}
              color="#2563eb"
            />
            <ComplianceBar
              label={lang === "fr" ? "En attente d'évaluation" : "Pending Assessment"}
              current={compliance.pending}
              target={compliance.total || 1}
              color="#d97706"
            />
            <ComplianceBar
              label={lang === "fr" ? "Expiré / Non atteint" : "Expired / Not Achieved"}
              current={compliance.expired}
              target={compliance.total || 1}
              color="#dc2626"
            />
            {compliance.total === 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <span className="material-icons text-blue-500 text-lg mt-0.5">info</span>
                  <p className="text-xs text-blue-700">
                    {lang === "fr"
                      ? "Aucun enregistrement de conformité pour le moment. Les données apparaîtront lorsque des évaluations seront ajoutées."
                      : "No compliance records yet. Data will appear when assessments are added."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contract & Billing Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {lang === "fr" ? "Résumé financier" : "Financial Summary"}
            </h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg viewBox="0 0 120 120" className="transform -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={ACCENT} strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - (budgetTotal > 0 ? budgetPaid / budgetTotal : 0))}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{budgetPct}%</span>
                <span className="text-[10px] text-gray-500">{lang === "fr" ? "payé" : "paid"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
                <span className="text-gray-600">{lang === "fr" ? "Total facturé" : "Total Invoiced"}</span>
                <span className="font-semibold text-gray-900">${(budgetTotal / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
                <span className="text-gray-600">{lang === "fr" ? "Total payé" : "Total Paid"}</span>
                <span className="font-semibold text-green-600">${(budgetPaid / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
                <span className="text-gray-600">{lang === "fr" ? "En souffrance" : "Overdue"}</span>
                <span className="font-semibold text-red-500">${(billing.totalOverdue / 100).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
              <span className="text-gray-500">{lang === "fr" ? "Factures en attente" : "Pending Invoices"}</span>
              <span className="font-bold text-amber-600">{billing.pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {lang === "fr" ? "Sessions de coaching" : "Coaching Sessions"}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{sessions.total}</p>
              <p className="text-xs text-gray-500">{lang === "fr" ? "Total" : "Total"}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{sessions.scheduled}</p>
              <p className="text-xs text-blue-500">{lang === "fr" ? "Planifiées" : "Scheduled"}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{sessions.completed}</p>
              <p className="text-xs text-green-500">{lang === "fr" ? "Complétées" : "Completed"}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{sessions.cancelled}</p>
              <p className="text-xs text-red-400">{lang === "fr" ? "Annulées" : "Cancelled"}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions for Client */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => toast.info(lang === "fr" ? "Bientôt disponible" : "Coming soon")}
            className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-[#2563eb]/30 transition-all text-left group"
          >
            <span className="material-icons text-[#2563eb] text-2xl mb-2 group-hover:scale-110 transition-transform">person_add</span>
            <p className="text-sm font-semibold text-gray-900">{lang === "fr" ? "Inscrire un participant" : "Enroll a Participant"}</p>
            <p className="text-[11px] text-gray-500 mt-1">{lang === "fr" ? "Ajouter un nouveau participant à une cohorte" : "Add a new participant to a training cohort"}</p>
          </button>
          <button
            onClick={() => toast.info(lang === "fr" ? "Bientôt disponible" : "Coming soon")}
            className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-[#2563eb]/30 transition-all text-left group"
          >
            <span className="material-icons text-[#2563eb] text-2xl mb-2 group-hover:scale-110 transition-transform">download</span>
            <p className="text-sm font-semibold text-gray-900">{lang === "fr" ? "Télécharger un rapport" : "Download Report"}</p>
            <p className="text-[11px] text-gray-500 mt-1">{lang === "fr" ? "Rapport de conformité ELS pour votre direction" : "SLE compliance report for your directorate"}</p>
          </button>
          <button
            onClick={() => setShowCalendly(true)}
            className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-[#2563eb]/30 transition-all text-left group"
          >
            <span className="material-icons text-[#2563eb] text-2xl mb-2 group-hover:scale-110 transition-transform">calendar_month</span>
            <p className="text-sm font-semibold text-gray-900">{lang === "fr" ? "Réserver une consultation" : "Book a Consultation"}</p>
            <p className="text-[11px] text-gray-500 mt-1">{lang === "fr" ? "Planifier un appel avec votre gestionnaire de compte" : "Schedule a call with your account manager"}</p>
          </button>
        </div>

        {/* Calendly Widget */}
        {showCalendly && (
          <CalendlyWidget
            url="https://calendly.com/steven-barholere/30min"
            onClose={() => setShowCalendly(false)}
            title={lang === "fr" ? "Réserver une consultation" : "Book a Consultation"}
          />
        )}
      </div>
    </HRLayout>
  );
}
