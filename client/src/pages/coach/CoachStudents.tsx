/**
 * CoachStudents — Student management page for Coach Portal
 * Features: Student list, progress tracking, filters, search
 */
import CoachLayout from "@/components/CoachLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const ACCENT = "#7c3aed";

interface Student {
  id: number;
  name: string;
  program: string;
  level: string;
  progress: number;
  lastSession: string;
  nextSession: string;
  status: "active" | "paused" | "completed";
  sessionsCompleted: number;
  avgScore: number;
}

const mockStudents: Student[] = [
  { id: 1, name: "Marie Dupont", program: "FSL", level: "B1", progress: 68, lastSession: "Feb 12", nextSession: "Feb 14, 10:00", status: "active", sessionsCompleted: 14, avgScore: 82 },
  { id: 2, name: "James Wilson", program: "SLE Prep", level: "B2", progress: 45, lastSession: "Feb 11", nextSession: "Feb 14, 11:30", status: "active", sessionsCompleted: 8, avgScore: 74 },
  { id: 3, name: "Sophie Tremblay", program: "ESL", level: "A2", progress: 32, lastSession: "Feb 10", nextSession: "Feb 15, 2:00", status: "active", sessionsCompleted: 6, avgScore: 88 },
  { id: 4, name: "David Chen", program: "FSL", level: "B1", progress: 85, lastSession: "Feb 12", nextSession: "Feb 14, 3:30", status: "active", sessionsCompleted: 22, avgScore: 91 },
  { id: 5, name: "Luc Bergeron", program: "SLE Prep", level: "C1", progress: 92, lastSession: "Feb 9", nextSession: "—", status: "completed", sessionsCompleted: 30, avgScore: 89 },
  { id: 6, name: "Aisha Patel", program: "ESL", level: "A1", progress: 15, lastSession: "Feb 8", nextSession: "—", status: "paused", sessionsCompleted: 3, avgScore: 65 },
];

function StatusBadge({ status }: { status: Student["status"] }) {
  const colors = {
    active: "bg-green-50 text-green-700 border-green-200",
    paused: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}80)` }} />
    </div>
  );
}

export default function CoachStudents() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "completed">("all");

  const filtered = mockStudents.filter(s => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <CoachLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Mes étudiants" : "My Students"}
            </h1>
            <p className="text-sm text-gray-500">{filtered.length} {lang === "fr" ? "étudiants" : "students"}</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === "fr" ? "Rechercher..." : "Search..."}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] outline-none w-48" />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "active", "paused", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filter === f ? "bg-[#7c3aed] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f === "all" ? (lang === "fr" ? "Tous" : "All") : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Student Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(student => (
            <div key={student.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#9333ea] flex items-center justify-center text-white font-bold text-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                    <p className="text-[11px] text-gray-500">{student.program} · {student.level}</p>
                  </div>
                </div>
                <StatusBadge status={student.status} />
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-500">{lang === "fr" ? "Progression" : "Progress"}</span>
                  <span className="font-semibold text-[#7c3aed]">{student.progress}%</span>
                </div>
                <ProgressBar value={student.progress} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-900">{student.sessionsCompleted}</p>
                  <p className="text-[9px] text-gray-500">{lang === "fr" ? "Sessions" : "Sessions"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-900">{student.avgScore}%</p>
                  <p className="text-[9px] text-gray-500">{lang === "fr" ? "Moy." : "Avg."}</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-900">{student.level}</p>
                  <p className="text-[9px] text-gray-500">{lang === "fr" ? "Niveau" : "Level"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>{lang === "fr" ? "Prochaine session" : "Next session"}: <strong className="text-gray-700">{student.nextSession}</strong></span>
                <span className="material-icons text-gray-300 group-hover:text-[#7c3aed] text-lg transition-colors">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CoachLayout>
  );
}
