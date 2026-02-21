/**
 * PathList — RusingÂcademy Learning Portal
 * Shows all 6 Paths for a selected program with progress and gamification
 * Now reads from CMS database with fallback to static courseData.ts
 * Design: Premium glassmorphism, teal/gold, accessible
 */
import { Link, useParams } from "wouter";
import { getProgramById, type Program } from "@/data/courseData";
import { useGamification } from "@/contexts/GamificationContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useCmsProgram } from "@/hooks/useCmsData";

export default function PathList() {
  const params = useParams<{ programId: string }>();
  const programId = params.programId as Program;

  // CMS-first with fallback
  const { program: cmsProgram, isLoading, source } = useCmsProgram(programId);

  // Fallback to static if CMS returns nothing
  const staticProgram = getProgramById(programId);
  const program = cmsProgram || (staticProgram ? {
    id: staticProgram.id,
    title: staticProgram.title,
    titleFr: (staticProgram as any).titleFr || "",
    description: staticProgram.description,
    descriptionFr: (staticProgram as any).descriptionFr || "",
    icon: staticProgram.icon,
    color: "",
    paths: staticProgram.paths.map(p => ({
      ...p,
      titleFr: (p as any).titleFr || "",
      subtitleFr: (p as any).subtitleFr || p.subtitle,
      modules: p.modules.map(m => ({
        ...m,
        titleFr: (m as any).titleFr || m.title,
        descriptionFr: (m as any).descriptionFr || m.description,
        lessons: m.lessons.map(l => ({
          ...l,
          titleFr: (l as any).titleFr || l.title,
        })),
      })),
    })),
  } : null);

  const { completedLessons, totalXP } = useGamification();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
          <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (!program) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <span className="material-icons text-6xl text-gray-300">error_outline</span>
          <p className="text-gray-500 mt-4">Program not found.</p>
          <Link href="/programs" className="text-[#008090] text-sm mt-2 inline-block hover:underline">← Back to Programs</Link>
        </div>
      </DashboardLayout>
    );
  }

  const isESL = programId === "esl";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/programs" className="hover:text-[#008090] transition-colors">Programs</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{program.title}</span>
        </div>

        {/* Program Hero */}
        <div className="relative rounded-2xl overflow-hidden p-8" style={{
          background: isESL
            ? "linear-gradient(135deg, #1a365d 0%, #2563eb 100%)"
            : "linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)",
          minHeight: "160px",
        }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{
            background: "radial-gradient(circle, #f5a623, transparent)",
            transform: "translate(20%, -20%)",
          }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                {isESL ? "English as a Second Language" : "Français langue seconde"}
              </span>
              {source === "cms" && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                  CMS
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              {program.title}
            </h1>
            <p className="text-white/70 mt-1 text-sm max-w-lg">{program.description}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <span className="material-icons" style={{ fontSize: "14px" }}>route</span>
                {program.paths.length} Paths
              </span>
              <span className="flex items-center gap-1">
                <span className="material-icons" style={{ fontSize: "14px" }}>school</span>
                {program.paths.reduce((s: number, p: any) => s + (p.totalLessons || p.modules?.reduce((ms: number, m: any) => ms + (m.lessons?.length || 0), 0) || 0), 0)} Lessons
              </span>
              <span className="flex items-center gap-1">
                <span className="material-icons" style={{ fontSize: "14px" }}>stars</span>
                {totalXP.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>

        {/* Path Cards */}
        <div className="space-y-4">
          {program.paths.map((path: any, idx: number) => {
            const allLessonKeys = (path.modules || []).flatMap((m: any) =>
              (m.lessons || []).map((l: any) => `${programId}-${l.id}`)
            );
            const completedCount = allLessonKeys.filter((k: string) => completedLessons.has(k)).length;
            const progressPct = allLessonKeys.length > 0 ? Math.round((completedCount / allLessonKeys.length) * 100) : 0;
            const isComplete = progressPct === 100;
            const isLocked = false; // All paths are now open and accessible

            return (
              <Link key={path.id} href={`/programs/${programId}/${path.id}`}>
                <div className={`group rounded-2xl overflow-hidden transition-all duration-500 ${
                  "hover:shadow-lg cursor-pointer"
                }`} style={{
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(12px)",
                  border: isComplete ? "1px solid rgba(245,166,35,0.3)" : "1px solid rgba(0,128,144,0.08)",
                }}>
                  <div className="flex flex-col md:flex-row">
                    {/* Cover Image */}
                    <div className="relative w-full md:w-56 h-40 md:h-auto flex-shrink-0 overflow-hidden">
                      <img src={path.coverUrl} alt={path.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0" style={{
                        background: "linear-gradient(135deg, rgba(12,25,41,0.6), transparent)",
                      }} />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{
                          background: isComplete ? "rgba(245,166,35,0.9)" : "rgba(0,128,144,0.8)",
                          backdropFilter: "blur(4px)",
                        }}>
                          {path.cefrLevel}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="text-white/80 text-xs font-bold">PATH {path.number}</span>
                      </div>

                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#008090] transition-colors" style={{
                            fontFamily: "'Playfair Display', serif",
                          }}>
                            {path.title}
                          </h2>
                          <p className="text-xs text-gray-400">{path.titleFr}</p>
                        </div>
                        {isComplete && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{
                            background: "rgba(245,166,35,0.1)",
                          }}>
                            <span className="material-icons text-[#f5a623]" style={{ fontSize: "16px" }}>emoji_events</span>
                            <span className="text-xs font-bold text-[#f5a623]">Complete</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mb-3">{path.subtitle}</p>

                      {/* Module pills */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(path.modules || []).map((mod: any) => {
                          const modKeys = (mod.lessons || []).map((l: any) => `${programId}-${l.id}`);
                          const modComplete = modKeys.filter((k: string) => completedLessons.has(k)).length;
                          const modPct = modKeys.length > 0 ? Math.round((modComplete / modKeys.length) * 100) : 0;
                          return (
                            <span key={mod.id} className="text-[10px] px-2 py-1 rounded-full font-medium" style={{
                              background: modPct === 100 ? "rgba(245,166,35,0.1)" : "rgba(0,128,144,0.06)",
                              color: modPct === 100 ? "#f5a623" : "#008090",
                            }}>
                              M{mod.id}: {(mod.title || "").substring(0, 20)}{(mod.title || "").length > 20 ? "..." : ""} ({modPct}%)
                            </span>
                          );
                        })}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,128,144,0.06)" }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{
                            width: `${progressPct}%`,
                            background: isComplete ? "linear-gradient(90deg, #f5a623, #ffd700)" : "linear-gradient(90deg, #008090, #00a0b0)",
                          }} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: isComplete ? "#f5a623" : "#008090" }}>
                          {progressPct}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-400">
                          {completedCount}/{allLessonKeys.length} lessons completed
                        </span>
                        <span className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "#008090" }}>
                            {progressPct > 0 ? "Continue" : "Start"}
                            <span className="material-icons" style={{ fontSize: "16px" }}>arrow_forward</span>
                          </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
