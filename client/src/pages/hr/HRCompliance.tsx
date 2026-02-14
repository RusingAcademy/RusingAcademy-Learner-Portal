/**
 * HRCompliance — SLE Compliance Reports for Client Portal
 * Connected to real tRPC queries via clientPortal router.
 * Shows the client department's SLE compliance status for their participants.
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
      <div className="h-12 bg-gray-100 rounded-xl w-1/3" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}

function RiskBadge({ risk, lang }: { risk: string; lang: string }) {
  const styles: Record<string, string> = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-red-50 text-red-600 border-red-200",
  };
  const labels: Record<string, { en: string; fr: string }> = {
    low: { en: "Low", fr: "Faible" },
    medium: { en: "Medium", fr: "Moyen" },
    high: { en: "High", fr: "Élevé" },
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[risk] ?? styles.medium}`}>
      {lang === "fr" ? (labels[risk]?.fr ?? risk) : (labels[risk]?.en ?? risk)}
    </span>
  );
}

export default function HRCompliance() {
  const { lang } = useLanguage();

  const { data: records, isLoading, error } = trpc.clientPortal.getComplianceRecords.useQuery(undefined, {
    retry: 1,
    staleTime: 60_000,
  });

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
              ? "Contactez votre administrateur RusingÂcademy pour obtenir l'accès."
              : "Contact your RusingÂcademy administrator for access."}
          </p>
        </div>
      </HRLayout>
    );
  }

  if (isLoading) return <HRLayout><LoadingSkeleton /></HRLayout>;

  const allRecords = records ?? [];
  // Derive risk from status: not_achieved/expired = high, in_progress/pending = medium, achieved = low
  const getRisk = (r: any) => {
    if (r.status === "not_achieved" || r.status === "expired") return "high";
    if (r.status === "achieved") return "low";
    return "medium";
  };
  const highRisk = allRecords.filter(r => getRisk(r) === "high").length;
  const medRisk = allRecords.filter(r => getRisk(r) === "medium").length;
  const lowRisk = allRecords.filter(r => getRisk(r) === "low").length;

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Conformité ELS" : "SLE Compliance"}
            </h1>
            <p className="text-sm text-gray-500">
              {lang === "fr" ? "Suivi des profils linguistiques officiels" : "Official Language Profile Tracking"}
            </p>
          </div>
          <button
            onClick={() => toast.info(lang === "fr" ? "Bientôt disponible" : "Coming soon")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            <span className="material-icons text-lg">download</span>
            {lang === "fr" ? "Exporter le rapport" : "Export Report"}
          </button>
        </div>

        {/* Risk Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-red-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <span className="material-icons text-red-500 text-xl">error</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">{lang === "fr" ? "Risque élevé" : "High Risk"}</p>
                <p className="text-2xl font-bold text-red-600">{highRisk}</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400">{lang === "fr" ? "Écart significatif, intervention urgente" : "Significant gap, urgent intervention needed"}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <span className="material-icons text-amber-500 text-xl">warning</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">{lang === "fr" ? "Risque moyen" : "Medium Risk"}</p>
                <p className="text-2xl font-bold text-amber-600">{medRisk}</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400">{lang === "fr" ? "En progression, suivi nécessaire" : "Progressing, monitoring needed"}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <span className="material-icons text-green-500 text-xl">check_circle</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">{lang === "fr" ? "Risque faible" : "Low Risk"}</p>
                <p className="text-2xl font-bold text-green-600">{lowRisk}</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400">{lang === "fr" ? "Proche de l'objectif ou conforme" : "Near target or compliant"}</p>
          </div>
        </div>

        {/* Compliance Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {allRecords.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-5xl text-gray-300 mb-3">verified</span>
              <p className="text-sm text-gray-500">
                {lang === "fr" ? "Aucun dossier de conformité pour le moment." : "No compliance records yet."}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {lang === "fr"
                  ? "Les dossiers apparaîtront ici une fois les participants inscrits et évalués."
                  : "Records will appear here once participants are enrolled and assessed."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Participant" : "Participant"}</th>
                    <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Profil requis" : "Required Profile"}</th>
                    <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Profil actuel" : "Current Profile"}</th>
                    <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Écart" : "Gap"}</th>
                    <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Échéance" : "Deadline"}</th>
                    <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Risque" : "Risk"}</th>
                  </tr>
                </thead>
                <tbody>
                  {allRecords.map((rec: any) => (
                    <tr key={rec.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{(rec as any).participantName ?? `Participant #${rec.participantId}`}</p>
                          <p className="text-[10px] text-gray-400">{rec.assessmentType?.replace(/_/g, " ")}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#2563eb]/10 text-[#2563eb]">{rec.targetResult ?? "—"}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-700 font-mono">{rec.currentResult ?? "—"}</td>
                      <td className="py-3 px-4 text-xs text-gray-600">{rec.notes ?? "—"}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-700">
                        {rec.nextAssessmentDate ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-center"><RiskBadge risk={getRisk(rec)} lang={lang} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {allRecords.length > 0 && (highRisk > 0 || medRisk > 0) && (
          <div className="mt-6 bg-gradient-to-br from-[#2563eb]/5 to-[#2563eb]/10 rounded-xl border border-[#2563eb]/15 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="material-icons text-[#2563eb]">lightbulb</span>
              {lang === "fr" ? "Recommandations" : "Recommendations"}
            </h2>
            <div className="space-y-2">
              {highRisk > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-[#2563eb] font-bold mt-0.5">1.</span>
                  <span>
                    {lang === "fr"
                      ? `Inscrire les ${highRisk} participant(s) à risque élevé au programme intensif SLE Prep immédiatement.`
                      : `Enroll the ${highRisk} high-risk participant(s) in the intensive SLE Prep program immediately.`}
                  </span>
                </div>
              )}
              {medRisk > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-[#2563eb] font-bold mt-0.5">{highRisk > 0 ? "2" : "1"}.</span>
                  <span>
                    {lang === "fr"
                      ? `Planifier des sessions supplémentaires pour les ${medRisk} participant(s) à risque moyen.`
                      : `Schedule additional sessions for the ${medRisk} medium-risk participant(s).`}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-[#2563eb] font-bold mt-0.5">{(highRisk > 0 ? 1 : 0) + (medRisk > 0 ? 1 : 0) + 1}.</span>
                <span>
                  {lang === "fr"
                    ? "Considérer l'ajout d'une cohorte SLE Prep supplémentaire pour le trimestre prochain."
                    : "Consider adding an additional SLE Prep cohort for next quarter."}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </HRLayout>
  );
}
