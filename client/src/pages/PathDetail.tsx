/**
 * PathDetail — RusingÂcademy Learning Portal
 * Shows all modules within a Path with lessons, progress, and gamification
 * Design: Premium glassmorphism, teal/gold accents, accessible
 */
import { useState } from "react";
import { Link, useParams } from "wouter";
import { getProgramById, type Program, type Module } from "@/data/courseData";
import { useGamification } from "@/contexts/GamificationContext";
import DashboardLayout from "@/components/DashboardLayout";

function ModuleCard({ mod, pathId, programId, completedLessons, isExpanded, onToggle }: {
  mod: Module; pathId: string; programId: string; completedLessons: Set<string>;
  isExpanded: boolean; onToggle: () => void;
}) {
  const lessonKeys = mod.lessons.map((l) => `${programId}-${l.id}`);
  const completedCount = lessonKeys.filter((k) => completedLessons.has(k)).length;
  const progressPct = lessonKeys.length > 0 ? Math.round((completedCount / lessonKeys.length) * 100) : 0;
  const isComplete = progressPct === 100;

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300" style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(12px)",
      border: isComplete ? "1px solid rgba(245,166,35,0.4)" : "1px solid rgba(0,128,144,0.12)",
      boxShadow: isExpanded ? "0 8px 32px rgba(0,128,144,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      {/* Module Header */}
      <button onClick={onToggle} className="w-full text-left p-5 flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <img src={mod.badgeUrl} alt="" className="w-14 h-14 rounded-xl object-cover" style={{
            border: isComplete ? "2px solid #f5a623" : "2px solid rgba(0,128,144,0.2)",
            filter: isComplete ? "none" : "grayscale(30%)",
          }} />
          {isComplete && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#f5a623] flex items-center justify-center">
              <span className="material-icons text-white" style={{ fontSize: "12px" }}>check</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{
              background: isComplete ? "rgba(245,166,35,0.15)" : "rgba(0,128,144,0.1)",
              color: isComplete ? "#f5a623" : "#008090",
            }}>
              Module {mod.id}
            </span>
            {isComplete && (
              <span className="text-[10px] font-bold text-[#f5a623] flex items-center gap-0.5">
                <span className="material-icons" style={{ fontSize: "12px" }}>emoji_events</span>
                Completed
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {mod.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{mod.titleFr}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{mod.description}</p>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,128,144,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{
                width: `${progressPct}%`,
                background: isComplete ? "linear-gradient(90deg, #f5a623, #e8941a)" : "linear-gradient(90deg, #008090, #00a0b0)",
              }} />
            </div>
            <span className="text-xs font-bold" style={{ color: isComplete ? "#f5a623" : "#008090" }}>
              {completedCount}/{mod.lessons.length}
            </span>
          </div>
        </div>
        <span className="material-icons text-gray-400 mt-1 transition-transform duration-300" style={{
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          expand_more
        </span>
      </button>

      {/* Lessons List (Expandable) */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-2" style={{ borderTop: "1px solid rgba(0,128,144,0.06)" }}>
          <div className="pt-3">
            {mod.lessons.map((lesson, idx) => {
              const lessonKey = `${programId}-${lesson.id}`;
              const isLessonComplete = completedLessons.has(lessonKey);
              const isNext = !isLessonComplete && idx === 0 || (
                idx > 0 && completedLessons.has(`${programId}-${mod.lessons[idx - 1].id}`) && !isLessonComplete
              );

              return (
                <Link key={lesson.id} href={`/programs/${programId}/${pathId}/${lesson.id}`}>
                  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                    isNext ? "ring-2 ring-[#008090]/30" : ""
                  }`} style={{
                    background: isLessonComplete ? "rgba(245,166,35,0.06)" : isNext ? "rgba(0,128,144,0.04)" : "transparent",
                  }}>
                    {/* Status Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{
                      background: isLessonComplete ? "#f5a623" : isNext ? "#008090" : "rgba(0,128,144,0.1)",
                    }}>
                      {isLessonComplete ? (
                        <span className="material-icons text-white" style={{ fontSize: "16px" }}>check</span>
                      ) : isNext ? (
                        <span className="material-icons text-white" style={{ fontSize: "16px" }}>play_arrow</span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">{lesson.id}</span>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#008090] transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-gray-400">{lesson.titleFr}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className="material-icons" style={{ fontSize: "12px" }}>schedule</span>
                        {lesson.duration}
                      </span>
                      <span className="text-[10px] font-bold flex items-center gap-1" style={{
                        color: isLessonComplete ? "#f5a623" : "#008090",
                      }}>
                        <span className="material-icons" style={{ fontSize: "12px" }}>stars</span>
                        +{lesson.xpReward} XP
                      </span>
                      <span className="material-icons text-gray-300 group-hover:text-[#008090] transition-colors" style={{ fontSize: "18px" }}>
                        chevron_right
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Summative Quiz Button */}
          <div className="mt-3 pt-3" style={{ borderTop: "1px dashed rgba(0,128,144,0.15)" }}>
            <Link href={`/programs/${programId}/${pathId}/quiz/mod-${mod.id}`}>
              <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md" style={{
                background: "linear-gradient(135deg, rgba(0,128,144,0.08), rgba(245,166,35,0.08))",
                border: "1px dashed rgba(0,128,144,0.2)",
              }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #008090, #f5a623)" }}>
                  <span className="material-icons text-white" style={{ fontSize: "16px" }}>quiz</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Summative Quiz — Module {mod.id}</h4>
                  <p className="text-[11px] text-gray-400">Passing score: {mod.quizPassing}% — 10 questions</p>
                </div>
                <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>arrow_forward</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PathDetail() {
  const params = useParams<{ programId: string; pathId: string }>();
  const programId = params.programId as Program;
  const pathId = params.pathId || "";
  const program = getProgramById(programId);
  const path = program?.paths.find((p) => p.id === pathId);
  const { completedLessons, totalXP, level, levelTitle, streak } = useGamification();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  if (!program || !path) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <span className="material-icons text-6xl text-gray-300">error_outline</span>
          <p className="text-gray-500 mt-4">Path not found.</p>
          <Link href="/programs" className="text-[#008090] text-sm mt-2 inline-block hover:underline">← Back to Programs</Link>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate overall path progress
  const allLessonKeys = path.modules.flatMap((m) => m.lessons.map((l) => `${programId}-${l.id}`));
  const completedCount = allLessonKeys.filter((k) => completedLessons.has(k)).length;
  const overallProgress = allLessonKeys.length > 0 ? Math.round((completedCount / allLessonKeys.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/programs" className="hover:text-[#008090] transition-colors">Programs</Link>
          <span>/</span>
          <Link href={`/programs/${programId}`} className="hover:text-[#008090] transition-colors">{program.title}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Path {path.number}</span>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden" style={{ height: "220px" }}>
          <img src={path.coverUrl} alt={path.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(12,25,41,0.85), rgba(0,128,144,0.6))" }} />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: "rgba(245,166,35,0.9)" }}>
                {path.cefrLevel}
              </span>
              <span className="text-xs text-white/70">PATH {path.number}</span>
            </div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              {path.title}
            </h1>
            <p className="text-sm text-white/80 mt-1">{path.subtitleFr}</p>

            {/* Progress Overview */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${overallProgress}%`,
                    background: "linear-gradient(90deg, #f5a623, #ffd700)",
                  }} />
                </div>
              </div>
              <span className="text-sm font-bold text-white">{overallProgress}%</span>
              <span className="text-xs text-white/60">{completedCount}/{allLessonKeys.length} lessons</span>
            </div>
          </div>
        </div>

        {/* Gamification Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "stars", label: "Total XP", value: totalXP.toLocaleString(), color: "#f5a623" },
            { icon: "military_tech", label: "Level", value: `${level} — ${levelTitle}`, color: "#008090" },
            { icon: "local_fire_department", label: "Streak", value: `${streak} days`, color: "#e74c3c" },
            { icon: "emoji_events", label: "Modules", value: `${path.modules.length}`, color: "#8b5cf6" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl text-center" style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(0,128,144,0.08)",
            }}>
              <span className="material-icons" style={{ color: stat.color, fontSize: "20px" }}>{stat.icon}</span>
              <div className="text-sm font-bold text-gray-900 mt-1">{stat.value}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Modules List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Modules & Lessons
          </h2>
          {path.modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              pathId={pathId}
              programId={programId}
              completedLessons={completedLessons}
              isExpanded={expandedModule === mod.id}
              onToggle={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
            />
          ))}
        </div>

        {/* Final Exam Card */}
        <div className="rounded-2xl p-6 text-center" style={{
          background: "linear-gradient(135deg, rgba(0,128,144,0.05), rgba(245,166,35,0.08))",
          border: "2px dashed rgba(0,128,144,0.2)",
        }}>
          <span className="material-icons text-4xl" style={{ color: "#f5a623" }}>workspace_premium</span>
          <h3 className="text-lg font-bold text-gray-900 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Final Examination — Path {path.number}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Complete all 4 modules and their summative quizzes to unlock the final examination.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Passing score: 80% — Comprehensive assessment of all path competencies
          </p>
          <button
            disabled={overallProgress < 100}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: overallProgress >= 100 ? "linear-gradient(135deg, #008090, #f5a623)" : "rgba(0,128,144,0.3)",
            }}
          >
            {overallProgress >= 100 ? "Start Final Exam" : `Complete all modules first (${overallProgress}%)`}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
