/**
 * AdminCourses — Course Builder for Admin Control System
 * Features: Path/lesson management, content structure, publish workflow
 */
import AdminControlLayout from "@/components/AdminControlLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const ACCENT = "#dc2626";

interface Path {
  id: number;
  name: string;
  program: string;
  level: string;
  lessons: number;
  activities: number;
  status: "published" | "draft" | "review";
  lastUpdated: string;
  enrollments: number;
}

const mockPaths: Path[] = [
  { id: 1, name: "Path I — Foundations", program: "FSL", level: "A1-A2", lessons: 16, activities: 112, status: "published", lastUpdated: "Feb 10", enrollments: 234 },
  { id: 2, name: "Path II — Intermediate", program: "FSL", level: "B1", lessons: 16, activities: 112, status: "published", lastUpdated: "Feb 8", enrollments: 189 },
  { id: 3, name: "Path III — Advanced", program: "FSL", level: "B2", lessons: 16, activities: 112, status: "published", lastUpdated: "Feb 5", enrollments: 145 },
  { id: 4, name: "Path IV — Proficiency", program: "FSL", level: "C1", lessons: 16, activities: 112, status: "draft", lastUpdated: "Feb 12", enrollments: 0 },
  { id: 5, name: "Path I — Foundations", program: "ESL", level: "A1-A2", lessons: 16, activities: 112, status: "published", lastUpdated: "Jan 28", enrollments: 198 },
  { id: 6, name: "Path II — Intermediate", program: "ESL", level: "B1", lessons: 16, activities: 112, status: "published", lastUpdated: "Jan 25", enrollments: 167 },
  { id: 7, name: "Path III — Advanced", program: "ESL", level: "B2", lessons: 16, activities: 112, status: "published", lastUpdated: "Jan 20", enrollments: 112 },
  { id: 8, name: "SLE Prep — Reading", program: "SLE", level: "B-C", lessons: 16, activities: 112, status: "published", lastUpdated: "Feb 1", enrollments: 89 },
  { id: 9, name: "SLE Prep — Writing", program: "SLE", level: "B-C", lessons: 16, activities: 112, status: "review", lastUpdated: "Feb 11", enrollments: 0 },
  { id: 10, name: "SLE Prep — Oral", program: "SLE", level: "B-C", lessons: 16, activities: 112, status: "published", lastUpdated: "Feb 3", enrollments: 76 },
];

const statusStyles: Record<string, string> = {
  published: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AdminCourses() {
  const { lang } = useLanguage();
  const [programFilter, setProgramFilter] = useState("all");

  const filtered = programFilter === "all" ? mockPaths : mockPaths.filter(p => p.program === programFilter);
  const totalLessons = mockPaths.reduce((s, p) => s + p.lessons, 0);
  const totalActivities = mockPaths.reduce((s, p) => s + p.activities, 0);
  const totalEnrollments = mockPaths.reduce((s, p) => s + p.enrollments, 0);

  return (
    <AdminControlLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Constructeur de cours" : "Course Builder"}
            </h1>
            <p className="text-sm text-gray-500">{mockPaths.length} {lang === "fr" ? "parcours" : "paths"} · {totalLessons} {lang === "fr" ? "leçons" : "lessons"} · {totalActivities} {lang === "fr" ? "activités" : "activities"}</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg shadow-sm transition-colors" style={{ backgroundColor: ACCENT }}>
            <span className="material-icons text-lg">add</span>
            {lang === "fr" ? "Nouveau parcours" : "New Path"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "route", label: lang === "fr" ? "Parcours" : "Paths", value: mockPaths.length },
            { icon: "menu_book", label: lang === "fr" ? "Leçons" : "Lessons", value: totalLessons },
            { icon: "extension", label: lang === "fr" ? "Activités" : "Activities", value: totalActivities },
            { icon: "group", label: lang === "fr" ? "Inscriptions" : "Enrollments", value: totalEnrollments.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${ACCENT}10` }}>
                <span className="material-icons text-lg" style={{ color: ACCENT }}>{s.icon}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Program Tabs */}
        <div className="flex gap-2 mb-4">
          {["all", "FSL", "ESL", "SLE"].map(prog => (
            <button key={prog} onClick={() => setProgramFilter(prog)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                programFilter === prog ? "text-white shadow-sm" : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
              style={programFilter === prog ? { backgroundColor: ACCENT } : {}}>
              {prog === "all" ? (lang === "fr" ? "Tous" : "All") : prog}
            </button>
          ))}
        </div>

        {/* Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(path => (
            <div key={path.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{path.program}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-1">{path.level}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[path.status]}`}>
                  {path.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{path.name}</h3>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-900">{path.lessons}</p>
                  <p className="text-[9px] text-gray-500">{lang === "fr" ? "Leçons" : "Lessons"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-900">{path.activities}</p>
                  <p className="text-[9px] text-gray-500">{lang === "fr" ? "Activités" : "Activities"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-900">{path.enrollments}</p>
                  <p className="text-[9px] text-gray-500">{lang === "fr" ? "Inscrits" : "Enrolled"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>{lang === "fr" ? "Mis à jour" : "Updated"}: {path.lastUpdated}</span>
                <span className="material-icons text-gray-300 group-hover:text-[#dc2626] text-lg transition-colors">edit</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminControlLayout>
  );
}
