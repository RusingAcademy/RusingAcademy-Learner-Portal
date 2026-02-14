/**
 * HRTeam → Participants — Client Portal
 * Connected to real tRPC queries via clientPortal router.
 * Falls back to mock data when no DB records exist or user lacks hr_manager role.
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-red-50 text-red-600", A2: "bg-orange-50 text-orange-600",
  B1: "bg-amber-50 text-amber-600", B2: "bg-green-50 text-green-600",
  C1: "bg-blue-50 text-blue-600",
};

const STATUS_STYLES: Record<string, { cls: string; en: string; fr: string }> = {
  active: { cls: "bg-green-50 text-green-700 border-green-200", en: "Active", fr: "Actif" },
  on_hold: { cls: "bg-amber-50 text-amber-700 border-amber-200", en: "On Hold", fr: "En pause" },
  completed: { cls: "bg-blue-50 text-blue-700 border-blue-200", en: "Completed", fr: "Complété" },
  withdrawn: { cls: "bg-red-50 text-red-600 border-red-200", en: "Withdrawn", fr: "Retiré" },
};

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
      <div className="h-12 bg-gray-100 rounded-xl w-1/3" />
      <div className="h-10 bg-gray-100 rounded-lg" />
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
    </div>
  );
}

export default function HRTeam() {
  const { lang } = useLanguage();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: participants, isLoading, error } = trpc.clientPortal.getParticipants.useQuery(undefined, {
    retry: 1,
    staleTime: 60_000,
  });

  // Access denied — show friendly message
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
              ? "Contactez votre administrateur RusingÂcademy pour obtenir l'accès au portail client."
              : "Contact your RusingÂcademy administrator for client portal access."}
          </p>
        </div>
      </HRLayout>
    );
  }

  if (isLoading) return <HRLayout><LoadingSkeleton /></HRLayout>;

  const allParticipants = participants ?? [];

  const filtered = allParticipants.filter(p => {
    const name = `${p.firstName ?? ""} ${p.lastName ?? ""}`.toLowerCase();
    const matchSearch = search === "" ||
      name.includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      (p.employeeId && p.employeeId.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = allParticipants.reduce((acc, p) => {
    const s = p.status ?? "active";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Participants inscrits" : "Enrolled Participants"}
            </h1>
            <p className="text-sm text-gray-500">
              {allParticipants.length} {lang === "fr" ? "participants dans vos programmes de formation" : "participants in your training programs"}
            </p>
          </div>
          <button
            onClick={() => toast.info(lang === "fr" ? "Bientôt disponible" : "Coming soon")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors"
          >
            <span className="material-icons text-lg">person_add</span>
            {lang === "fr" ? "Inscrire un participant" : "Enroll Participant"}
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "all", label: lang === "fr" ? "Tous" : "All", count: allParticipants.length },
            { key: "active", label: lang === "fr" ? "Actifs" : "Active", count: statusCounts.active || 0 },
            { key: "on_hold", label: lang === "fr" ? "En pause" : "On Hold", count: statusCounts.on_hold || 0 },
            { key: "completed", label: lang === "fr" ? "Complétés" : "Completed", count: statusCounts.completed || 0 },
            { key: "withdrawn", label: lang === "fr" ? "Retirés" : "Withdrawn", count: statusCounts.withdrawn || 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === tab.key
                  ? "bg-[#2563eb] text-white border-[#2563eb]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#2563eb]/40"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === "fr" ? "Rechercher par nom, courriel ou ID employé..." : "Search by name, email or employee ID..."}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-5xl text-gray-300 mb-3">group_off</span>
              <p className="text-sm text-gray-500">
                {allParticipants.length === 0
                  ? (lang === "fr" ? "Aucun participant inscrit pour le moment." : "No participants enrolled yet.")
                  : (lang === "fr" ? "Aucun résultat pour cette recherche." : "No results for this search.")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Participant" : "Participant"}</th>
                    <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Département" : "Department"}</th>
                    <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Programme" : "Program"}</th>
                    <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Niveau actuel" : "Current Level"}</th>
                    <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Niveau cible" : "Target Level"}</th>
                    <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Statut" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const st = STATUS_STYLES[p.status ?? "active"] ?? STATUS_STYLES.active;
                    return (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(p.firstName?.[0] ?? "")}{(p.lastName?.[0] ?? "")}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                              <p className="text-[10px] text-gray-400">{p.email ?? ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{p.department ?? "—"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">{p.program ?? "—"}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[p.currentLevel ?? ""] ?? "bg-gray-50 text-gray-600"}`}>
                            {p.currentLevel ?? "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[p.targetLevel ?? ""] ?? "bg-gray-50 text-gray-600"}`}>
                            {p.targetLevel ?? "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>
                            {lang === "fr" ? st.fr : st.en}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </HRLayout>
  );
}
