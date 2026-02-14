/**
 * HRCohorts — Training Cohorts for Client Portal
 * Shows training cohorts assigned to the client department.
 * Features: Cohort cards, progress tracking, enrollment management
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#2563eb";

interface Cohort {
  id: number;
  name: string;
  program: string;
  startDate: string;
  endDate: string;
  enrolled: number;
  capacity: number;
  avgProgress: number;
  coach: string;
  status: "active" | "upcoming" | "completed";
}

const mockCohorts: Cohort[] = [
  { id: 1, name: "FSL Spring 2026 — Group A", program: "FSL B2", startDate: "Jan 15", endDate: "Jun 30", enrolled: 12, capacity: 15, avgProgress: 45, coach: "Dr. Claire Fontaine", status: "active" },
  { id: 2, name: "SLE Prep — Intensive", program: "SLE Prep", startDate: "Feb 1", endDate: "Apr 30", enrolled: 8, capacity: 10, avgProgress: 32, coach: "Prof. Marc Leblanc", status: "active" },
  { id: 3, name: "ESL Intermediate", program: "ESL B1", startDate: "Jan 20", endDate: "May 15", enrolled: 10, capacity: 12, avgProgress: 55, coach: "Sarah Williams", status: "active" },
  { id: 4, name: "FSL Spring 2026 — Group B", program: "FSL B1", startDate: "Mar 1", endDate: "Jul 31", enrolled: 5, capacity: 15, avgProgress: 0, coach: "Dr. Claire Fontaine", status: "upcoming" },
  { id: 5, name: "SLE Prep — Fall 2025", program: "SLE Prep", startDate: "Sep 1", endDate: "Dec 15", enrolled: 10, capacity: 10, avgProgress: 100, coach: "Prof. Marc Leblanc", status: "completed" },
  { id: 6, name: "ESL Advanced — Fall 2025", program: "ESL C1", startDate: "Sep 15", endDate: "Dec 20", enrolled: 8, capacity: 8, avgProgress: 100, coach: "Sarah Williams", status: "completed" },
];

export default function HRCohorts() {
  const { lang } = useLanguage();

  const active = mockCohorts.filter(c => c.status === "active");
  const upcoming = mockCohorts.filter(c => c.status === "upcoming");
  const completed = mockCohorts.filter(c => c.status === "completed");

  const CohortCard = ({ cohort }: { cohort: Cohort }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{cohort.name}</p>
          <p className="text-[11px] text-gray-500">{cohort.program} · {cohort.coach}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          cohort.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
          cohort.status === "upcoming" ? "bg-amber-50 text-amber-700 border-amber-200" :
          "bg-blue-50 text-blue-600 border-blue-200"
        }`}>
          {cohort.status === "active" ? (lang === "fr" ? "Actif" : "Active") :
           cohort.status === "upcoming" ? (lang === "fr" ? "À venir" : "Upcoming") :
           (lang === "fr" ? "Terminé" : "Completed")}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-gray-500">{lang === "fr" ? "Progression moyenne" : "Avg Progress"}</span>
          <span className="font-semibold" style={{ color: ACCENT }}>{cohort.avgProgress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${cohort.avgProgress}%`, backgroundColor: ACCENT }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900">{cohort.enrolled}/{cohort.capacity}</p>
          <p className="text-[9px] text-gray-500">{lang === "fr" ? "Inscrits" : "Enrolled"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900">{cohort.startDate}</p>
          <p className="text-[9px] text-gray-500">{lang === "fr" ? "Début" : "Start"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900">{cohort.endDate}</p>
          <p className="text-[9px] text-gray-500">{lang === "fr" ? "Fin" : "End"}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
        <span>{lang === "fr" ? "Coach" : "Coach"}: <strong className="text-gray-600">{cohort.coach}</strong></span>
        <span className="material-icons text-gray-300 group-hover:text-[#2563eb] text-lg transition-colors">arrow_forward</span>
      </div>
    </div>
  );

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Cohortes de formation" : "Training Cohorts"}
            </h1>
            <p className="text-sm text-gray-500">{mockCohorts.length} {lang === "fr" ? "cohortes pour votre département" : "cohorts for your department"}</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-sm">
            <span className="material-icons text-lg">add</span>
            {lang === "fr" ? "Demander une cohorte" : "Request a Cohort"}
          </button>
        </div>

        {/* Active Cohorts */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {lang === "fr" ? "Cohortes actives" : "Active Cohorts"} ({active.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map(c => <CohortCard key={c.id} cohort={c} />)}
          </div>
        </div>

        {/* Upcoming Cohorts */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {lang === "fr" ? "Cohortes à venir" : "Upcoming Cohorts"} ({upcoming.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcoming.map(c => <CohortCard key={c.id} cohort={c} />)}
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
              {completed.map(c => <CohortCard key={c.id} cohort={c} />)}
            </div>
          </div>
        )}
      </div>
    </HRLayout>
  );
}
