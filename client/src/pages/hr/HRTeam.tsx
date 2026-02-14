/**
 * HRTeam → Participants — Client Portal
 * Shows the department's enrolled participants in RusingÂcademy training programs.
 * This is a client-facing view: the department sees their employees' training progress.
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface Participant {
  id: number;
  name: string;
  division: string;
  position: string;
  program: string;
  reading: string;
  writing: string;
  oral: string;
  targetProfile: string;
  status: "active" | "completed" | "not-started";
  enrolledDate: string;
}

const mockParticipants: Participant[] = [
  { id: 1, name: "Jean-Pierre Lavoie", division: "Policy Branch", position: "Senior Analyst", program: "FSL B2", reading: "B2", writing: "B1", oral: "B1+", targetProfile: "CBC", status: "active", enrolledDate: "2025-09-15" },
  { id: 2, name: "Sarah Mitchell", division: "Communications", position: "Advisor", program: "SLE Prep", reading: "C1", writing: "B2", oral: "B2", targetProfile: "CBC", status: "active", enrolledDate: "2025-08-01" },
  { id: 3, name: "Marc Bouchard", division: "Corporate Services", position: "Manager", program: "FSL B1", reading: "B1", writing: "A2+", oral: "A2", targetProfile: "BBB", status: "active", enrolledDate: "2025-10-01" },
  { id: 4, name: "Emily Roberts", division: "IT Services", position: "Team Lead", program: "ESL C1", reading: "B2+", writing: "B2", oral: "B2+", targetProfile: "CBC", status: "active", enrolledDate: "2025-09-01" },
  { id: 5, name: "Pierre Gagné", division: "Human Resources", position: "Coordinator", program: "SLE Prep", reading: "A2", writing: "A2", oral: "A2", targetProfile: "BBB", status: "active", enrolledDate: "2025-11-01" },
  { id: 6, name: "Lisa Chen", division: "Policy Branch", position: "Director", program: "FSL C1", reading: "C1", writing: "C1", oral: "B2+", targetProfile: "CCC", status: "completed", enrolledDate: "2025-06-01" },
  { id: 7, name: "Robert Tremblay", division: "Communications", position: "Writer", program: "—", reading: "—", writing: "—", oral: "—", targetProfile: "BBB", status: "not-started", enrolledDate: "—" },
];

function LevelBadge({ level }: { level: string }) {
  if (level === "—") return <span className="text-xs text-gray-300">—</span>;
  const colors: Record<string, string> = {
    "A1": "bg-red-50 text-red-600", "A2": "bg-orange-50 text-orange-600", "A2+": "bg-orange-50 text-orange-600",
    "B1": "bg-amber-50 text-amber-600", "B1+": "bg-amber-50 text-amber-700",
    "B2": "bg-green-50 text-green-600", "B2+": "bg-green-50 text-green-700",
    "C1": "bg-blue-50 text-blue-600", "C2": "bg-purple-50 text-purple-600",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[level] || "bg-gray-50 text-gray-600"}`}>{level}</span>;
}

export default function HRTeam() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");

  const divisions = Array.from(new Set(mockParticipants.map(e => e.division)));
  const filtered = mockParticipants.filter(e => {
    if (divisionFilter !== "all" && e.division !== divisionFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Participants inscrits" : "Enrolled Participants"}
            </h1>
            <p className="text-sm text-gray-500">
              {filtered.length} {lang === "fr" ? "participants" : "participants"} — {lang === "fr" ? "Secrétariat du Conseil du Trésor" : "Treasury Board Secretariat"}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === "fr" ? "Rechercher..." : "Search..."}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none w-48" />
            </div>
            <select value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none">
              <option value="all">{lang === "fr" ? "Toutes les directions" : "All Divisions"}</option>
              {divisions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Division Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {divisions.map(div => {
            const count = mockParticipants.filter(e => e.division === div).length;
            const active = mockParticipants.filter(e => e.division === div && e.status === "active").length;
            return (
              <button key={div} onClick={() => setDivisionFilter(divisionFilter === div ? "all" : div)}
                className={`p-3 rounded-xl border text-left transition-all ${divisionFilter === div ? "border-[#2563eb] bg-[#2563eb]/5 shadow-sm" : "border-gray-100 bg-white hover:shadow-sm"}`}>
                <p className="text-sm font-semibold text-gray-900">{div}</p>
                <p className="text-xs text-gray-500">{count} {lang === "fr" ? "participants" : "participants"}</p>
                <p className="text-[10px] text-[#2563eb] font-medium mt-1">{active} {lang === "fr" ? "en formation" : "in training"}</p>
              </button>
            );
          })}
        </div>

        {/* Participant Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Participant" : "Participant"}</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Direction" : "Division"}</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Programme" : "Program"}</th>
                  <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Lecture" : "Reading"}</th>
                  <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Écriture" : "Writing"}</th>
                  <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Oral" : "Oral"}</th>
                  <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Profil cible" : "Target Profile"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Statut" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] flex items-center justify-center text-white text-xs font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                          <p className="text-[10px] text-gray-400">{emp.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{emp.division}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{emp.program}</td>
                    <td className="py-3 px-2 text-center"><LevelBadge level={emp.reading} /></td>
                    <td className="py-3 px-2 text-center"><LevelBadge level={emp.writing} /></td>
                    <td className="py-3 px-2 text-center"><LevelBadge level={emp.oral} /></td>
                    <td className="py-3 px-2 text-center"><span className="text-xs font-bold text-gray-700">{emp.targetProfile}</span></td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        emp.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                        emp.status === "completed" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        {emp.status === "active" ? (lang === "fr" ? "En formation" : "In Training") :
                         emp.status === "completed" ? (lang === "fr" ? "Terminé" : "Completed") :
                         (lang === "fr" ? "Non inscrit" : "Not Enrolled")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
