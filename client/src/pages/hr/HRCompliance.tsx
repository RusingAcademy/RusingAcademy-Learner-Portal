/**
 * HRCompliance — SLE Compliance Reports for HR Portal
 * Features: Compliance dashboard, risk assessment, deadline tracking, reporting
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#2563eb";

interface ComplianceRecord {
  id: number;
  name: string;
  position: string;
  department: string;
  requiredProfile: string;
  currentProfile: string;
  deadline: string;
  risk: "low" | "medium" | "high";
  gap: string;
}

const mockRecords: ComplianceRecord[] = [
  { id: 1, name: "Jean-Pierre Lavoie", position: "Senior Analyst", department: "Policy", requiredProfile: "CBC", currentProfile: "B2/B1/B1+", deadline: "Jun 2026", risk: "medium", gap: "Writing B1→B2, Oral B1+→C" },
  { id: 2, name: "Sarah Mitchell", position: "Advisor", department: "Communications", requiredProfile: "CBC", currentProfile: "C1/B2/B2", deadline: "Apr 2026", risk: "low", gap: "Oral B2→C" },
  { id: 3, name: "Marc Bouchard", position: "Manager", department: "Finance", requiredProfile: "BBB", currentProfile: "B1/A2+/A2", deadline: "Sep 2026", risk: "high", gap: "Writing A2+→B, Oral A2→B" },
  { id: 4, name: "Pierre Gagné", position: "Coordinator", department: "HR", requiredProfile: "BBB", currentProfile: "A2/A2/A2", deadline: "Dec 2026", risk: "high", gap: "All skills need B level" },
  { id: 5, name: "Emily Roberts", position: "Team Lead", department: "IT", requiredProfile: "CBC", currentProfile: "B2+/B2/B2+", deadline: "Jun 2026", risk: "low", gap: "Minor gap to C" },
];

function RiskBadge({ risk }: { risk: ComplianceRecord["risk"] }) {
  const styles = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-red-50 text-red-600 border-red-200",
  };
  const labels = { low: "Low", medium: "Medium", high: "High" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[risk]}`}>{labels[risk]}</span>;
}

export default function HRCompliance() {
  const { lang } = useLanguage();

  const highRisk = mockRecords.filter(r => r.risk === "high").length;
  const medRisk = mockRecords.filter(r => r.risk === "medium").length;
  const lowRisk = mockRecords.filter(r => r.risk === "low").length;

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Conformité ELS" : "SLE Compliance"}
            </h1>
            <p className="text-sm text-gray-500">{lang === "fr" ? "Suivi des profils linguistiques officiels" : "Official Language Profile Tracking"}</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-sm">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Employé" : "Employee"}</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Département" : "Department"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Profil requis" : "Required Profile"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Profil actuel" : "Current Profile"}</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Écart" : "Gap"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Échéance" : "Deadline"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Risque" : "Risk"}</th>
                </tr>
              </thead>
              <tbody>
                {mockRecords.map(rec => (
                  <tr key={rec.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rec.name}</p>
                        <p className="text-[10px] text-gray-400">{rec.position}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{rec.department}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#2563eb]/10 text-[#2563eb]">{rec.requiredProfile}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700 font-mono">{rec.currentProfile}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{rec.gap}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700">{rec.deadline}</td>
                    <td className="py-3 px-4 text-center"><RiskBadge risk={rec.risk} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 bg-gradient-to-br from-[#2563eb]/5 to-[#2563eb]/10 rounded-xl border border-[#2563eb]/15 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-icons text-[#2563eb]">lightbulb</span>
            {lang === "fr" ? "Recommandations" : "Recommendations"}
          </h2>
          <div className="space-y-2">
            {[
              lang === "fr" ? "Inscrire Marc Bouchard et Pierre Gagné au programme intensif SLE Prep immédiatement." : "Enroll Marc Bouchard and Pierre Gagné in the intensive SLE Prep program immediately.",
              lang === "fr" ? "Planifier des sessions supplémentaires d'expression orale pour les employés à risque moyen." : "Schedule additional oral proficiency sessions for medium-risk employees.",
              lang === "fr" ? "Considérer l'ajout d'une cohorte SLE Prep supplémentaire pour le trimestre prochain." : "Consider adding an additional SLE Prep cohort for next quarter.",
            ].map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-[#2563eb] font-bold mt-0.5">{i + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
