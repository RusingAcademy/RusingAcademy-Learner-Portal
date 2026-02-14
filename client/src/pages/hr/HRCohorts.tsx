/**
 * HRCohorts — Training Cohorts for Client Portal
 * Connected to real tRPC queries via clientPortal router.
 * Shows training cohorts assigned to the client department.
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ACCENT = "#2563eb";

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
      <div className="h-12 bg-gray-100 rounded-xl w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

function CohortCard({ cohort, lang }: { cohort: any; lang: string }) {
  const status = cohort.status ?? "planned";
  const enrolled = cohort.currentParticipants ?? 0;
  const capacity = cohort.maxParticipants ?? 15;
  const startDate = cohort.startDate ? new Date(cohort.startDate).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric" }) : "—";
  const endDate = cohort.endDate ? new Date(cohort.endDate).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric" }) : "—";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{cohort.name}</p>
          <p className="text-[11px] text-gray-500">
            {cohort.program ?? "—"} · {cohort.cefrLevel ?? ""}
            {cohort.schedule ? ` · ${cohort.schedule}` : ""}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          status === "active" ? "bg-green-50 text-green-700 border-green-200" :
          status === "planned" ? "bg-amber-50 text-amber-700 border-amber-200" :
          "bg-blue-50 text-blue-600 border-blue-200"
        }`}>
          {status === "active" ? (lang === "fr" ? "Actif" : "Active") :
           status === "planned" ? (lang === "fr" ? "Planifié" : "Planned") :
           (lang === "fr" ? "Terminé" : "Completed")}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-gray-500">{lang === "fr" ? "Inscription" : "Enrollment"}</span>
          <span className="font-semibold" style={{ color: ACCENT }}>{enrolled}/{capacity}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${capacity > 0 ? (enrolled / capacity) * 100 : 0}%`, backgroundColor: ACCENT }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900">{enrolled}/{capacity}</p>
          <p className="text-[9px] text-gray-500">{lang === "fr" ? "Inscrits" : "Enrolled"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900">{startDate}</p>
          <p className="text-[9px] text-gray-500">{lang === "fr" ? "Début" : "Start"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900">{endDate}</p>
          <p className="text-[9px] text-gray-500">{lang === "fr" ? "Fin" : "End"}</p>
        </div>
      </div>

      {cohort.description && (
        <p className="mt-3 text-[11px] text-gray-400 line-clamp-2">{cohort.description}</p>
      )}

      <div className="mt-3 flex items-center justify-end">
        <span className="material-icons text-gray-300 group-hover:text-[#2563eb] text-lg transition-colors">arrow_forward</span>
      </div>
    </div>
  );
}

export default function HRCohorts() {
  const { lang } = useLanguage();

  const { data: cohorts, isLoading, error } = trpc.clientPortal.getCohorts.useQuery(undefined, {
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

  const allCohorts = cohorts ?? [];
  const active = allCohorts.filter(c => c.status === "active");
  const planned = allCohorts.filter(c => c.status === "planned");
  const completed = allCohorts.filter(c => c.status === "completed");

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Cohortes de formation" : "Training Cohorts"}
            </h1>
            <p className="text-sm text-gray-500">
              {allCohorts.length} {lang === "fr" ? "cohortes pour votre département" : "cohorts for your department"}
            </p>
          </div>
          <button
            onClick={() => toast.info(lang === "fr" ? "Bientôt disponible" : "Coming soon")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            <span className="material-icons text-lg">add</span>
            {lang === "fr" ? "Demander une cohorte" : "Request a Cohort"}
          </button>
        </div>

        {allCohorts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <span className="material-icons text-6xl text-gray-300 mb-4">school</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {lang === "fr" ? "Aucune cohorte pour le moment" : "No Cohorts Yet"}
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {lang === "fr"
                ? "Les cohortes de formation apparaîtront ici une fois créées par votre gestionnaire de compte RusingÂcademy."
                : "Training cohorts will appear here once created by your RusingÂcademy account manager."}
            </p>
          </div>
        )}

        {/* Active Cohorts */}
        {active.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {lang === "fr" ? "Cohortes actives" : "Active Cohorts"} ({active.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {active.map(c => <CohortCard key={c.id} cohort={c} lang={lang} />)}
            </div>
          </div>
        )}

        {/* Planned Cohorts */}
        {planned.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {lang === "fr" ? "Cohortes planifiées" : "Planned Cohorts"} ({planned.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {planned.map(c => <CohortCard key={c.id} cohort={c} lang={lang} />)}
            </div>
          </div>
        )}

        {/* Completed Cohorts */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {lang === "fr" ? "Cohortes terminées" : "Completed Cohorts"} ({completed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {completed.map(c => <CohortCard key={c.id} cohort={c} lang={lang} />)}
            </div>
          </div>
        )}
      </div>
    </HRLayout>
  );
}
