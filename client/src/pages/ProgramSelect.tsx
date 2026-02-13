/**
 * ProgramSelect — RusingÂcademy Learning Portal
 * Gateway page for choosing ESL or FSL program
 * Design: Premium glassmorphism, teal/gold, accessible
 */
import { Link } from "wouter";
import { programs, getTotalStats, type Program } from "@/data/courseData";
import { useGamification } from "@/contexts/GamificationContext";
import DashboardLayout from "@/components/DashboardLayout";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

export default function ProgramSelect() {
  const { totalXP, level, levelTitle, streak, lessonsCompleted } = useGamification();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden p-8 md:p-10" style={{
          background: "linear-gradient(135deg, #0c1929 0%, #003040 50%, #004050 100%)",
          minHeight: "200px",
        }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{
            background: "radial-gradient(circle, #f5a623, transparent)",
            transform: "translate(30%, -30%)",
          }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <img src={LOGO_URL} alt="RusingÂcademy" className="w-10 h-10 rounded-lg" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#f5a623]">Learning Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Choose Your Program
            </h1>
            <p className="text-white/70 mt-2 max-w-xl text-sm">
              Master your second official language with RusingÂcademy's comprehensive bilingual training programs. 
              Each program features 6 progressive Paths aligned with the CEFR framework (A1 to C1+).
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "stars", label: "Total XP", value: totalXP.toLocaleString(), color: "#f5a623" },
            { icon: "military_tech", label: "Level", value: `${level} — ${levelTitle}`, color: "#008090" },
            { icon: "local_fire_department", label: "Streak", value: `${streak} days`, color: "#e74c3c" },
            { icon: "school", label: "Lessons Done", value: lessonsCompleted.toString(), color: "#8b5cf6" },
          ].map((stat) => (
            <div key={stat.label} className="ra-glass p-4 rounded-xl text-center">
              <span className="material-icons" style={{ color: stat.color, fontSize: "22px" }}>{stat.icon}</span>
              <div className="text-sm font-bold text-[#0c1929] mt-1">{stat.value}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((prog) => {
            const stats = getTotalStats(prog.id as Program);
            const isESL = prog.id === "esl";

            return (
              <Link key={prog.id} href={`/programs/${prog.id}`}>
                <div className="group rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl cursor-pointer" style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(0,128,144,0.1)",
                }}>
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
                        <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: "rgba(0,128,144,0.04)" }}>
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
                      <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all duration-300" style={{ color: "#008090" }}>
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
        <div className="ra-glass rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: "linear-gradient(135deg, rgba(0,128,144,0.1), rgba(245,166,35,0.1))",
          }}>
            <span className="material-icons" style={{ color: "#008090" }}>info</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0c1929]">About Our Programs</h3>
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
