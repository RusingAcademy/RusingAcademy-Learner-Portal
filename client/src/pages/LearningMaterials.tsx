/**
 * LearningMaterials — RusingÂcademy Learning Portal
 * Design: Premium glassmorphism, teal/gold accents
 * Now integrates with real course data from programs
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { programs as staticPrograms, type Path } from "@/data/courseData";
import { useGamification } from "@/contexts/GamificationContext";
import { trpc } from "@/lib/trpc";

const tabs = ["My Courses", "Tests & Quizzes", "References"];

function ProgressCircle({ value, size = 40 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const color = value === 100 ? "#f5a623" : "#008090";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,128,144,0.1)" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

function PathRow({ path, programId }: { path: Path; programId: string }) {
  const completedModules = path.modules.filter(m => m.completed).length;
  const totalModules = path.modules.length;
  const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const status = progress === 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started";

  return (
    <tr className="border-t border-[rgba(0,128,144,0.06)] hover:bg-[rgba(0,128,144,0.03)] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <ProgressCircle value={progress} />
          <div>
            <Link href={`/programs/${programId}/${path.id}`}>
              <span className="text-sm font-medium text-gray-900 hover:text-[#008090] transition-colors cursor-pointer">
                {path.title}
              </span>
            </Link>
            <p className="text-[10px] text-gray-400">{path.cefrLevel} — {path.totalLessons} lessons</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="w-24 h-1.5 bg-[rgba(0,128,144,0.08)] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${progress}%`,
            background: progress === 100 ? "linear-gradient(90deg, #f5a623, #e8951a)" : "linear-gradient(90deg, #008090, #00a0b0)",
          }} />
        </div>
        <span className="text-[10px] text-gray-500 mt-0.5">{progress}%</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
          status === "Completed" ? "bg-[rgba(245,166,35,0.12)] text-[#d4943c]" :
          status === "In Progress" ? "bg-[rgba(0,128,144,0.1)] text-[#008090]" :
          "bg-gray-100 text-gray-500"
        }`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">{completedModules}/{totalModules} modules</td>
      <td className="px-4 py-3 text-center">
        <Link href={`/programs/${programId}/${path.id}`}>
          <span className="material-icons text-[#008090] hover:text-[#f5a623] transition-colors cursor-pointer text-lg">
            arrow_forward
          </span>
        </Link>
      </td>
    </tr>
  );
}

export default function LearningMaterials() {
  const [activeTab, setActiveTab] = useState(0);
  const { totalXP, lessonsCompleted } = useGamification();

  // Try CMS first
  const cmsPrograms = trpc.cms.public.listPrograms.useQuery(undefined, { staleTime: 5 * 60 * 1000, retry: 1 });
  const programs = cmsPrograms.data && cmsPrograms.data.length > 0
    ? cmsPrograms.data.map((p: any) => ({ ...p, id: p.slug, paths: [] }))
    : staticPrograms;
  const allPaths = staticPrograms.flatMap(p => p.paths.map(path => ({ ...path, programId: p.id })));

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
              <span className="material-icons text-[20px]">navigate_before</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Learning Materials
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Your courses, tests, and reference materials</p>
            </div>
          </div>
          <Link href="/programs">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #008090, #006d7a)" }}>
              <span className="material-icons text-base">school</span>
              Browse All Programs
            </button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: "auto_stories", label: "Lessons Done", value: lessonsCompleted, color: "#008090" },
            { icon: "star", label: "Total XP", value: totalXP.toLocaleString(), color: "#f5a623" },
            { icon: "school", label: "Active Paths", value: allPaths.filter(p => p.progress > 0 && p.progress < 100).length || 1, color: "#008090" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <span className="material-icons" style={{ color: stat.color, fontSize: "20px" }}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-5" style={{ borderColor: "rgba(0,128,144,0.1)" }}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === i
                  ? "text-[#008090]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
              {activeTab === i && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #008090, #f5a623)" }} />
              )}
            </button>
          ))}
        </div>

        {/* My Courses Tab */}
        {activeTab === 0 && (
          <div>
            {programs.map((program) => (
              <div key={program.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons text-[#008090]">{program.icon}</span>
                  <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {program.title}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(0,128,144,0.08)] text-[#008090] font-medium">
                    {program.paths.length} Paths
                  </span>
                </div>
                <div className="glass-card rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: "linear-gradient(135deg, rgba(0,128,144,0.08), rgba(245,166,35,0.04))" }}>
                        <th className="text-left text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Path</th>
                        <th className="text-left text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Progress</th>
                        <th className="text-left text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Status</th>
                        <th className="text-left text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Modules</th>
                        <th className="text-center text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Go</th>
                      </tr>
                    </thead>
                    <tbody>
                      {program.paths.map((path: any) => (
                        <PathRow key={path.id} path={path} programId={program.id} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tests & Quizzes Tab */}
        {activeTab === 1 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ background: "linear-gradient(135deg, rgba(0,128,144,0.08), rgba(245,166,35,0.04))" }}>
                  <th className="text-left text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Assessment</th>
                  <th className="text-left text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Type</th>
                  <th className="text-left text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Status</th>
                  <th className="text-left text-[11px] font-semibold text-gray-900 px-4 py-3 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Placement Test (ESL)", type: "Diagnostic", status: "Available", score: "-" },
                  { name: "Placement Test (FSL)", type: "Diagnostic", status: "Available", score: "-" },
                  { name: "Path I — Module 1 Quiz", type: "Summative", status: "Passed", score: "92%" },
                  { name: "Path I — Module 2 Quiz", type: "Summative", status: "Passed", score: "88%" },
                  { name: "Path I — Module 3 Quiz", type: "Summative", status: "Passed", score: "95%" },
                  { name: "Path I — Module 4 Quiz", type: "Summative", status: "Passed", score: "85%" },
                  { name: "Path I — Final Exam", type: "Final", status: "Not Available", score: "-" },
                  { name: "Path II — Module 1 Quiz", type: "Summative", status: "In Progress", score: "-" },
                ].map((test, i) => (
                  <tr key={i} className="border-t border-[rgba(0,128,144,0.06)] hover:bg-[rgba(0,128,144,0.03)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        test.type === "Diagnostic" ? "bg-purple-50 text-purple-600" :
                        test.type === "Summative" ? "bg-[rgba(0,128,144,0.1)] text-[#008090]" :
                        "bg-[rgba(245,166,35,0.1)] text-[#d4943c]"
                      }`}>{test.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        test.status === "Passed" ? "bg-green-50 text-green-600" :
                        test.status === "Available" ? "bg-[rgba(0,128,144,0.1)] text-[#008090]" :
                        test.status === "In Progress" ? "bg-blue-50 text-blue-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>{test.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: test.score !== "-" ? "#008090" : "#9ca3af" }}>
                      {test.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* References Tab */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Grammar Reference Guide", type: "PDF", icon: "description", category: "Grammar", color: "#008090" },
              { name: "Vocabulary Master Lists", type: "PDF", icon: "list_alt", category: "Vocabulary", color: "#f5a623" },
              { name: "Pronunciation Guide", type: "Audio", icon: "headphones", category: "Pronunciation", color: "#8b5cf6" },
              { name: "Cultural Context Notes", type: "PDF", icon: "public", category: "Culture", color: "#059669" },
              { name: "SLE Exam Preparation", type: "PDF", icon: "school", category: "Exam Prep", color: "#e74c3c" },
              { name: "Professional Writing Templates", type: "DOCX", icon: "edit_document", category: "Writing", color: "#3498db" },
            ].map((ref, i) => (
              <div key={i} className="glass-card rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${ref.color}15` }}>
                    <span className="material-icons" style={{ color: ref.color, fontSize: "20px" }}>{ref.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#008090] transition-colors">{ref.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{ref.type}</span>
                      <span className="text-[10px] text-gray-400">{ref.category}</span>
                    </div>
                  </div>
                  <span className="material-icons text-gray-300 group-hover:text-[#008090] transition-colors text-lg">download</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
