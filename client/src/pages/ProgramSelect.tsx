/**
 * ProgramSelect — RusingÂcademy Learning Portal
 * Now reads from CMS database with fallback to static courseData.ts
 * Design: Clean white light theme, accessible, LRDG-inspired
 */
import { Link } from "wouter";
import { programs as staticPrograms, getTotalStats, type Program } from "@/data/courseData";
import { useGamification } from "@/contexts/GamificationContext";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

export default function ProgramSelect() {
  const { totalXP, level, levelTitle, streak, lessonsCompleted } = useGamification();

  // Try CMS first
  const cmsQuery = trpc.cms.public.listPrograms.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const eslStats = trpc.cms.public.getProgramStats.useQuery({ slug: "esl" }, { staleTime: 5 * 60 * 1000, retry: 1 });
  const fslStats = trpc.cms.public.getProgramStats.useQuery({ slug: "fsl" }, { staleTime: 5 * 60 * 1000, retry: 1 });

  // Determine data source
  const programList = useMemo(() => {
    if (cmsQuery.data && cmsQuery.data.length > 0) {
      return cmsQuery.data.map((p: any) => ({
        id: p.slug,
        title: p.title,
        titleFr: p.titleFr || p.title,
        description: p.description || "",
        descriptionFr: p.descriptionFr || "",
        icon: p.icon || "school",
        source: "cms" as const,
      }));
    }
    return staticPrograms.map((p) => ({
      id: p.id,
      title: p.title,
      titleFr: p.titleFr || "",
      description: p.description,
      descriptionFr: p.descriptionFr || "",
      icon: p.icon,
      source: "static" as const,
    }));
  }, [cmsQuery.data]);

  const getStats = (progId: string) => {
    if (programList[0]?.source === "cms") {
      const stats = progId === "esl" ? eslStats.data : fslStats.data;
      return stats || { paths: 6, modules: 24, lessons: 96, activities: 672 };
    }
    return getTotalStats(progId as Program);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section — Light */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 md:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <img src={LOGO_URL} alt="RusingÂcademy" className="w-10 h-10 rounded-lg" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#008090]">Learning Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Choose Your Program
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl text-sm">
            Master your second official language with RusingÂcademy's comprehensive bilingual training programs. 
            Each program features 6 progressive Paths aligned with the CEFR framework (A1 to C1+).
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "stars", label: "Total XP", value: totalXP.toLocaleString(), color: "#f5a623" },
            { icon: "military_tech", label: "Level", value: `${level} — ${levelTitle}`, color: "#008090" },
            { icon: "local_fire_department", label: "Streak", value: `${streak} days`, color: "#e74c3c" },
            { icon: "school", label: "Lessons Done", value: lessonsCompleted.toString(), color: "#8b5cf6" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
              <span className="material-icons" style={{ color: stat.color, fontSize: "22px" }}>{stat.icon}</span>
              <div className="text-sm font-bold text-gray-900 mt-1">{stat.value}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programList.map((prog) => {
            const stats = getStats(prog.id);
            const isESL = prog.id === "esl";

            return (
              <Link key={prog.id} href={`/programs/${prog.id}`}>
                <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-lg cursor-pointer">
                  {/* Card Header with gradient */}
                  <div className="relative h-40 overflow-hidden" style={{
                    background: isESL
                      ? "linear-gradient(135deg, #1a365d, #2563eb, #3b82f6)"
                      : "linear-gradient(135deg, #7c2d12, #dc2626, #ef4444)",
                  }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-icons text-white/20" style={{ fontSize: "80px" }}>{prog.icon}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                          {isESL ? "English" : "Français"}
                        </span>
                        <span className="text-xs text-white/70">A1 → C1+</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {prog.title}
                      </h2>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <p className="text-sm text-gray-600 mb-4">{prog.description}</p>
                    <p className="text-xs text-gray-400 mb-4 italic">{prog.descriptionFr}</p>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { label: "Paths", value: stats.paths },
                        { label: "Modules", value: stats.modules },
                        { label: "Lessons", value: stats.lessons },
                        { label: "Activities", value: stats.activities },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-2 rounded-lg bg-gray-50">
                          <div className="text-lg font-bold text-[#008090]">{s.value}</div>
                          <div className="text-[9px] text-gray-400 uppercase">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {["A1", "A2", "B1", "B2", "C1", "C1+"].map((lvl) => (
                          <span key={lvl} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white" style={{ background: "#008090" }}>
                            {lvl}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all duration-300 text-[#008090]">
                        Explore
                        <span className="material-icons" style={{ fontSize: "18px" }}>arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#008090]/5">
            <span className="material-icons text-[#008090]">info</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">About Our Programs</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Both programs are designed for Canadian public servants preparing for SLE exams. 
              Each lesson uses our 7-Slot methodology: Hook → Video → Strategy → Written → Oral → Quiz → Coaching. 
              Earn XP, unlock badges, and track progress with our gamification system.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
