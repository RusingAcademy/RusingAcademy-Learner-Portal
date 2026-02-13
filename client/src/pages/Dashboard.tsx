/**
 * Dashboard — RusingÂcademy Learning Portal
 * Premium glassmorphism dashboard with gamification, teal/gold branding
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { useGamification } from "@/contexts/GamificationContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

const chartData = [
  { module: "1", score: 85 }, { module: "2", score: 72 }, { module: "3", score: 90 },
  { module: "4", score: 68 }, { module: "5", score: 45 }, { module: "6", score: 0 },
  { module: "7", score: 0 }, { module: "8", score: 0 }, { module: "9", score: 0 },
  { module: "10", score: 0 }, { module: "11", score: 0 }, { module: "12", score: 0 },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function CalendarWidget() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const prevMonth = () => { if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1); };
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#0c1929]">{MONTHS[month]} {year}</span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-0.5 hover:bg-[#008090]/10 rounded"><span className="material-icons text-[16px] text-gray-500">chevron_left</span></button>
          <button onClick={nextMonth} className="p-0.5 hover:bg-[#008090]/10 rounded"><span className="material-icons text-[16px] text-gray-500">chevron_right</span></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-[10px] text-gray-400 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d} className="py-0.5 font-medium">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-[11px]">
        {days.map((day, i) => (
          <div key={i} className={`py-1 rounded-full ${day === today && isCurrentMonth ? "text-white font-bold" : day ? "text-gray-700 hover:bg-[#008090]/5" : ""}`}
            style={day === today && isCurrentMonth ? { background: "linear-gradient(135deg, #008090, #006070)" } : {}}>
            {day || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressRing({ pct, size = 48, color = "#008090" }: { pct: number; size?: number; color?: string }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,128,144,0.1)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#0c1929]">{pct}%</span>
    </div>
  );
}

export default function Dashboard() {
  const { totalXP, level, levelTitle, streak, lessonsCompleted, quizzesPassed, badges, weeklyGoal, weeklyProgress, xpProgress } = useGamification();
  const { user, isAuthenticated } = useAuth();
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const leaderboardQuery = trpc.gamification.getLeaderboard.useQuery({ limit: 5 });
  const challengesQuery = trpc.challenges.getActive.useQuery(undefined, { enabled: isAuthenticated });

  const myRank = useMemo(() => {
    if (!user || !leaderboardQuery.data) return null;
    const idx = leaderboardQuery.data.findIndex((e) => e.userId === user.id);
    return idx >= 0 ? idx + 1 : null;
  }, [user, leaderboardQuery.data]);

  const activeChallenges = challengesQuery.data?.filter((c) => !c.isCompleted) ?? [];
  const completedCount = challengesQuery.data?.filter((c) => c.isCompleted).length ?? 0;

  const announcements = [
    { title: "Welcome to RusingÂcademy Learning Portal!", content: "Your bilingual training journey starts here. Explore our ESL and FSL programs, earn XP, unlock badges, and prepare for your SLE exams with confidence." },
    { title: "New: Gamification System Active", content: "Track your progress with XP points, daily streaks, and achievement badges. Complete lessons to level up and unlock new content." },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] space-y-5">
        {/* Welcome Hero */}
        <div className="relative rounded-2xl overflow-hidden p-6 md:p-8" style={{
          background: "linear-gradient(135deg, #0c1929 0%, #003040 50%, #004050 100%)",
        }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{
            background: "radial-gradient(circle, #f5a623, transparent)", transform: "translate(20%, -20%)",
          }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src={LOGO_ICON} alt="" className="w-8 h-8 rounded-lg" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#f5a623]">Learning Portal</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Hello, Steven
              </h1>
              <p className="text-white/60 text-sm mt-1">Welcome back! Continue your bilingual journey.</p>
            </div>
            {/* XP & Level Badge */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#f5a623]">{totalXP.toLocaleString()}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Total XP</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Lv.{level}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{levelTitle}</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <span className="material-icons text-[#e74c3c]" style={{ fontSize: "20px" }}>local_fire_department</span>
                  <span className="text-2xl font-bold text-white">{streak}</span>
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Day Streak</div>
              </div>
            </div>
          </div>
          {/* XP Progress Bar */}
          <div className="relative z-10 mt-4">
            <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
              <span>Level {level} Progress</span>
              <span>{Math.min(100, Math.round(xpProgress))}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{
                width: `${Math.min(100, xpProgress)}%`,
                background: "linear-gradient(90deg, #f5a623, #ffd700)",
              }} />
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: "school", label: "Lessons", value: lessonsCompleted, color: "#008090" },
            { icon: "quiz", label: "Quizzes", value: quizzesPassed, color: "#f5a623" },
            { icon: "emoji_events", label: "Badges", value: badges.length, color: "#8b5cf6" },
            { icon: "trending_up", label: "Weekly", value: `${weeklyProgress}/${weeklyGoal}`, color: "#059669" },
            { icon: "auto_awesome", label: "Programs", value: "2", color: "#e74c3c" },
          ].map((s) => (
            <div key={s.label} className="ra-glass p-3 rounded-xl text-center">
              <span className="material-icons" style={{ color: s.color, fontSize: "20px" }}>{s.icon}</span>
              <div className="text-lg font-bold text-[#0c1929] mt-1">{s.value}</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Access to Programs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/programs/esl">
            <div className="group ra-glass rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300" style={{ borderLeft: "4px solid #2563eb" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0c1929]">ESL Program</h3>
                  <p className="text-xs text-gray-400 mt-0.5">English as a Second Language</p>
                  <p className="text-[10px] text-gray-300 mt-1">6 Paths • 96 Lessons • A1→C1+</p>
                </div>
                <span className="material-icons text-[#2563eb] group-hover:translate-x-1 transition-transform" style={{ fontSize: "24px" }}>arrow_forward</span>
              </div>
            </div>
          </Link>
          <Link href="/programs/fsl">
            <div className="group ra-glass rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300" style={{ borderLeft: "4px solid #dc2626" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0c1929]">FSL Program</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Français langue seconde</p>
                  <p className="text-[10px] text-gray-300 mt-1">6 Paths • 96 Lessons • A1→C1+</p>
                </div>
                <span className="material-icons text-[#dc2626] group-hover:translate-x-1 transition-transform" style={{ fontSize: "24px" }}>arrow_forward</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Results Chart */}
            <div className="ra-glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#0c1929]">Results by Module</h2>
                <Link href="/results" className="text-gray-400 hover:text-[#008090]">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,128,144,0.08)" />
                    <XAxis dataKey="module" tick={{ fontSize: 9, fill: "#999" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#999" }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Score"]} />
                    <Bar dataKey="score" fill="#008090" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* My Notes */}
            <div className="ra-glass rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[#0c1929] mb-2">My Notes</h2>
              <textarea
                className="w-full min-h-[80px] text-sm text-gray-600 rounded-lg p-3 resize-none focus:outline-none transition-all"
                style={{ border: "1px solid rgba(0,128,144,0.1)", background: "rgba(0,128,144,0.02)" }}
                placeholder="Write your study notes here..."
              />
            </div>
          </div>

          {/* Center Column */}
          <div className="space-y-4">
            {/* Current Progress */}
            <div className="ra-glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#0c1929]">Current Progress</h2>
                <Link href="/progress" className="text-gray-400 hover:text-[#008090]">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              <div className="flex items-center gap-4 justify-center mb-3">
                {[
                  { label: "Path I", pct: 75, color: "#008090" },
                  { label: "Path II", pct: 30, color: "#f5a623" },
                  { label: "Path III", pct: 0, color: "#8b5cf6" },
                ].map((m) => (
                  <div key={m.label} className="flex flex-col items-center">
                    <ProgressRing pct={m.pct} size={50} color={m.color} />
                    <span className="text-[10px] text-gray-400 mt-1">{m.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/programs" className="text-xs font-semibold flex items-center gap-1 justify-center" style={{ color: "#008090" }}>
                View All Programs <span className="material-icons" style={{ fontSize: "14px" }}>arrow_forward</span>
              </Link>
            </div>

            {/* Announcements */}
            <div className="ra-glass rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[#0c1929] mb-2">Announcements</h2>
              <div className="min-h-[80px]">
                {announcements[announcementIdx] && (
                  <div>
                    <p className="text-xs font-bold text-[#0c1929] mb-1">{announcements[announcementIdx].title}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{announcements[announcementIdx].content}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <button onClick={() => setAnnouncementIdx(Math.max(0, announcementIdx - 1))} className="text-gray-400 hover:text-[#008090]">
                  <span className="material-icons text-[16px]">chevron_left</span>
                </button>
                <div className="flex gap-1">
                  {announcements.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all`} style={{
                      background: i === announcementIdx ? "#008090" : "rgba(0,128,144,0.15)",
                    }} />
                  ))}
                </div>
                <button onClick={() => setAnnouncementIdx(Math.min(announcements.length - 1, announcementIdx + 1))} className="text-gray-400 hover:text-[#008090]">
                  <span className="material-icons text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Gamification Badges */}
            <div className="ra-glass rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[#0c1929] mb-3">Recent Badges</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "first-lesson", icon: "play_lesson", label: "First Lesson", color: "#008090" },
                  { id: "first-quiz", icon: "quiz", label: "First Quiz", color: "#f5a623" },
                  { id: "week-streak", icon: "local_fire_department", label: "7-Day Streak", color: "#e74c3c" },
                  { id: "module-complete", icon: "workspace_premium", label: "Module Master", color: "#8b5cf6" },
                ].map((b) => {
                  const earned = badges.some((badge) => badge.badgeId === b.id);
                  return (
                    <div key={b.id} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium ${earned ? "" : "opacity-30"}`} style={{
                      background: earned ? `${b.color}15` : "rgba(0,0,0,0.03)",
                      color: earned ? b.color : "#999",
                    }}>
                      <span className="material-icons" style={{ fontSize: "14px" }}>{b.icon}</span>
                      {b.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Mini Leaderboard */}
            <div className="ra-glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#0c1929] flex items-center gap-1.5">
                  <span className="material-icons text-[#f5a623]" style={{ fontSize: "16px" }}>leaderboard</span>
                  Leaderboard
                </h2>
                <Link href="/leaderboard" className="text-gray-400 hover:text-[#008090]">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              {myRank && (
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ background: "rgba(0,128,144,0.06)" }}>
                  <span className="text-lg font-bold text-[#f5a623]">#{myRank}</span>
                  <span className="text-xs text-gray-500">Your Rank</span>
                </div>
              )}
              <div className="space-y-1.5">
                {leaderboardQuery.data?.slice(0, 5).map((entry, i) => (
                  <div key={entry.userId} className="flex items-center gap-2 py-1">
                    <span className={`text-[10px] font-bold w-5 text-center ${i === 0 ? "text-[#f5a623]" : i === 1 ? "text-gray-400" : i === 2 ? "text-[#cd7f32]" : "text-gray-300"}`}>
                      {i + 1}
                    </span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                      style={{ background: i === 0 ? "#f5a623" : i === 1 ? "#a0a0a0" : i === 2 ? "#cd7f32" : "#008090" }}>
                      {(entry.userName || "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] text-gray-600 truncate flex-1">{entry.userName || "Anonymous"}</span>
                    <span className="text-[10px] font-bold text-[#f5a623]">{entry.totalXp.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <div className="ra-glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#0c1929] flex items-center gap-1.5">
                    <span className="material-icons text-[#8b5cf6]" style={{ fontSize: "16px" }}>flag</span>
                    Challenges
                    <span className="text-[10px] bg-[#8b5cf6]/10 text-[#8b5cf6] px-1.5 py-0.5 rounded-full font-bold">{activeChallenges.length}</span>
                  </h2>
                  <Link href="/challenges" className="text-gray-400 hover:text-[#008090]">
                    <span className="material-icons text-[18px]">chevron_right</span>
                  </Link>
                </div>
                <div className="space-y-2">
                  {activeChallenges.slice(0, 3).map((c) => {
                    const progress = Math.min(100, (c.currentValue / c.targetValue) * 100);
                    return (
                      <div key={c.id} className="p-2 rounded-lg" style={{ background: "rgba(139,92,246,0.04)" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-gray-700 truncate">{c.title}</span>
                          <span className="text-[10px] font-bold text-[#f5a623]">+{c.xpReward}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }} />
                        </div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{c.currentValue}/{c.targetValue}</div>
                      </div>
                    );
                  })}
                </div>
                {completedCount > 0 && (
                  <div className="text-[10px] text-[#10b981] font-medium mt-2 flex items-center gap-1">
                    <span className="material-icons" style={{ fontSize: "12px" }}>check_circle</span>
                    {completedCount} completed this week
                  </div>
                )}
              </div>
            )}

            {/* Calendar */}
            <div className="ra-glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-[#0c1929]">Calendar</h2>
                <Link href="/calendar" className="text-gray-400 hover:text-[#008090]">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              <CalendarWidget />
            </div>

            {/* Quick Actions */}
            <div className="ra-glass rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[#0c1929] mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { icon: "play_circle", label: "Continue Learning", href: "/programs", color: "#008090" },
                  { icon: "headset_mic", label: "Book Tutoring Session", href: "/tutoring-sessions", color: "#f5a623" },
                  { icon: "assessment", label: "View Reports", href: "/reports", color: "#8b5cf6" },
                  { icon: "forum", label: "Community Forum", href: "/community-forum", color: "#059669" },
                ].map((qa) => (
                  <Link key={qa.label} href={qa.href}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-[#008090]/5 transition-all">
                      <span className="material-icons" style={{ color: qa.color, fontSize: "20px" }}>{qa.icon}</span>
                      <span className="text-xs text-gray-600 font-medium">{qa.label}</span>
                      <span className="material-icons text-gray-300 ml-auto" style={{ fontSize: "16px" }}>chevron_right</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="ra-glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#0c1929]">Messages</h2>
                <Link href="/notifications" className="text-gray-400 hover:text-[#008090]">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              <div className="space-y-2">
                {[
                  { title: "Welcome to RusingÂcademy Portal", date: "02/12/2026" },
                  { title: "Your FSL Path I is ready to begin", date: "02/10/2026" },
                  { title: "New: Gamification features enabled", date: "02/08/2026" },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-2 py-2 border-b last:border-0" style={{ borderColor: "rgba(0,128,144,0.06)" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,128,144,0.06)" }}>
                      <span className="material-icons text-[#008090]" style={{ fontSize: "14px" }}>mail</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-gray-700 truncate">{n.title}</p>
                      <p className="text-[10px] text-gray-400">{n.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
