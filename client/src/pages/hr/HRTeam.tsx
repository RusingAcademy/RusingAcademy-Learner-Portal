/**
 * HRTeam — Team Overview page for HR Portal
 * Features: Employee list, language proficiency, department breakdown
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  program: string;
  reading: string;
  writing: string;
  oral: string;
  targetLevel: string;
  status: "active" | "completed" | "not-started";
}

const mockEmployees: Employee[] = [
  { id: 1, name: "Jean-Pierre Lavoie", department: "Policy", position: "Senior Analyst", program: "FSL B2", reading: "B2", writing: "B1", oral: "B1+", targetLevel: "CBC", status: "active" },
  { id: 2, name: "Sarah Mitchell", department: "Communications", position: "Advisor", program: "SLE Prep", reading: "C1", writing: "B2", oral: "B2", targetLevel: "CBC", status: "active" },
  { id: 3, name: "Marc Bouchard", department: "Finance", position: "Manager", program: "FSL B1", reading: "B1", writing: "A2+", oral: "A2", targetLevel: "BBB", status: "active" },
  { id: 4, name: "Emily Roberts", department: "IT", position: "Team Lead", program: "ESL C1", reading: "B2+", writing: "B2", oral: "B2+", targetLevel: "CBC", status: "active" },
  { id: 5, name: "Pierre Gagné", department: "HR", position: "Coordinator", program: "SLE Prep", reading: "A2", writing: "A2", oral: "A2", targetLevel: "BBB", status: "active" },
  { id: 6, name: "Lisa Chen", department: "Policy", position: "Director", program: "FSL C1", reading: "C1", writing: "C1", oral: "B2+", targetLevel: "CCC", status: "completed" },
  { id: 7, name: "Robert Tremblay", department: "Communications", position: "Writer", program: "—", reading: "—", writing: "—", oral: "—", targetLevel: "BBB", status: "not-started" },
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
  const [deptFilter, setDeptFilter] = useState("all");

  const departments = Array.from(new Set(mockEmployees.map(e => e.department)));
  const filtered = mockEmployees.filter(e => {
    if (deptFilter !== "all" && e.department !== deptFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Aperçu de l'équipe" : "Team Overview"}
            </h1>
            <p className="text-sm text-gray-500">{filtered.length} {lang === "fr" ? "employés" : "employees"}</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === "fr" ? "Rechercher..." : "Search..."}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none w-48" />
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] outline-none">
              <option value="all">{lang === "fr" ? "Tous les départements" : "All Departments"}</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Department Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {departments.map(dept => {
            const count = mockEmployees.filter(e => e.department === dept).length;
            const active = mockEmployees.filter(e => e.department === dept && e.status === "active").length;
            return (
              <button key={dept} onClick={() => setDeptFilter(deptFilter === dept ? "all" : dept)}
                className={`p-3 rounded-xl border text-left transition-all ${deptFilter === dept ? "border-[#2563eb] bg-[#2563eb]/5 shadow-sm" : "border-gray-100 bg-white hover:shadow-sm"}`}>
                <p className="text-sm font-semibold text-gray-900">{dept}</p>
                <p className="text-xs text-gray-500">{count} {lang === "fr" ? "employés" : "employees"}</p>
                <p className="text-[10px] text-[#2563eb] font-medium mt-1">{active} {lang === "fr" ? "en formation" : "in training"}</p>
              </button>
            );
          })}
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Employé" : "Employee"}</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Département" : "Department"}</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Programme" : "Program"}</th>
                  <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Lecture" : "Reading"}</th>
                  <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Écriture" : "Writing"}</th>
                  <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Oral" : "Oral"}</th>
                  <th className="text-center py-3 px-2 text-xs text-gray-500 font-medium">{lang === "fr" ? "Cible" : "Target"}</th>
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
                    <td className="py-3 px-4 text-sm text-gray-600">{emp.department}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{emp.program}</td>
                    <td className="py-3 px-2 text-center"><LevelBadge level={emp.reading} /></td>
                    <td className="py-3 px-2 text-center"><LevelBadge level={emp.writing} /></td>
                    <td className="py-3 px-2 text-center"><LevelBadge level={emp.oral} /></td>
                    <td className="py-3 px-2 text-center"><span className="text-xs font-bold text-gray-700">{emp.targetLevel}</span></td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        emp.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                        emp.status === "completed" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        {emp.status === "active" ? (lang === "fr" ? "Actif" : "Active") :
                         emp.status === "completed" ? (lang === "fr" ? "Terminé" : "Completed") :
                         (lang === "fr" ? "Non commencé" : "Not Started")}
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
