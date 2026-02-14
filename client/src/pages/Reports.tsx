/**
 * RusingÂcademy Learning Portal - Reports & Analytics Page
 * Features: XP over time, quiz trends, path progress, SLE readiness, activity heatmap
 * Uses inline SVG charts for zero-dependency visualization
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useGamification } from "@/contexts/GamificationContext";
import { Link } from "wouter";
import { useState, useMemo } from "react";

/* ─── Chart Components ─── */

/** Simple SVG Line Chart */
function LineChart({ data, color = "#008090", height = 160, label }: {
  data: number[]; color?: string; height?: number; label?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 100;
  const h = height;
  const padding = 20;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;
  const points = data.map((v, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding + chartH - (v / max) * chartH,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding + chartH} L ${points[0].x} ${padding + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={padding} y1={padding + chartH * (1 - f)} x2={w - padding} y2={padding + chartH * (1 - f)}
          stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="2,2" />
      ))}
      {/* Area fill */}
      <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="white" stroke={color} strokeWidth="1" />
      ))}
      {/* Y-axis labels */}
      <text x={padding - 2} y={padding + 3} fontSize="4" fill="#9ca3af" textAnchor="end">{max}</text>
      <text x={padding - 2} y={padding + chartH + 3} fontSize="4" fill="#9ca3af" textAnchor="end">0</text>
      {label && <text x={w / 2} y={h - 2} fontSize="4" fill="#9ca3af" textAnchor="middle">{label}</text>}
    </svg>
  );
}

/** Simple SVG Bar Chart */
function BarChart({ data, labels, color = "#008090", height = 160 }: {
  data: number[]; labels?: string[]; color?: string; height?: number;
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 100;
  const h = height;
  const padding = 20;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;
  const barW = chartW / data.length * 0.6;
  const gap = chartW / data.length * 0.4;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={padding} y1={padding + chartH * (1 - f)} x2={w - padding} y2={padding + chartH * (1 - f)}
          stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="2,2" />
      ))}
      {data.map((v, i) => {
        const barH = (v / max) * chartH;
        const x = padding + i * (barW + gap) + gap / 2;
        const y = padding + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="1.5" fill={color} opacity="0.8" />
            <text x={x + barW / 2} y={y - 2} fontSize="3.5" fill="#6b7280" textAnchor="middle">{v}</text>
            {labels?.[i] && (
              <text x={x + barW / 2} y={padding + chartH + 8} fontSize="3" fill="#9ca3af" textAnchor="middle">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
      <text x={padding - 2} y={padding + 3} fontSize="4" fill="#9ca3af" textAnchor="end">{max}</text>
    </svg>
  );
}

/** Radar Chart for SLE Readiness */
function RadarChart({ skills, height = 200 }: {
  skills: { name: string; value: number; max: number }[]; height?: number;
}) {
  const cx = 50, cy = 50, r = 35;
  const n = skills.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (i: number, val: number, max: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const ratio = val / max;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = skills.map((s, i) => getPoint(i, s.value, s.max));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }}>
      {/* Grid */}
      {gridLevels.map((level) => {
        const pts = skills.map((_, i) => getPoint(i, level * 100, 100));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="#e5e7eb" strokeWidth="0.3" />;
      })}
      {/* Axes */}
      {skills.map((_, i) => {
        const p = getPoint(i, 100, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="0.3" />;
      })}
      {/* Data area */}
      <path d={dataPath} fill="rgba(0,128,144,0.15)" stroke="#008090" strokeWidth="1" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#008090" />
      ))}
      {/* Labels */}
      {skills.map((s, i) => {
        const p = getPoint(i, 120, 100);
        return (
          <text key={i} x={p.x} y={p.y} fontSize="3.5" fill="#374151" textAnchor="middle" dominantBaseline="middle">
            {s.name}
          </text>
        );
      })}
    </svg>
  );
}

/** Activity Heatmap (GitHub-style) */
function ActivityHeatmap({ data, weeks = 12 }: { data: Record<string, number>; weeks?: number }) {
  const days = ["Mon", "", "Wed", "", "Fri", "", ""];
  const cellSize = 6;
  const gap = 1.5;
  const maxVal = Math.max(...Object.values(data), 1);

  const getColor = (val: number) => {
    if (val === 0) return "#f3f4f6";
    const ratio = val / maxVal;
    if (ratio < 0.25) return "rgba(0,128,144,0.2)";
    if (ratio < 0.5) return "rgba(0,128,144,0.4)";
    if (ratio < 0.75) return "rgba(0,128,144,0.6)";
    return "rgba(0,128,144,0.9)";
  };

  const today = new Date();
  const cells: { x: number; y: number; color: string; date: string }[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().split("T")[0];
      const val = data[key] || 0;
      cells.push({
        x: (weeks - 1 - w) * (cellSize + gap),
        y: d * (cellSize + gap),
        color: getColor(val),
        date: key,
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <svg width={weeks * (cellSize + gap)} height={7 * (cellSize + gap) + 15} className="block">
        {days.map((label, i) => (
          label && <text key={i} x={-2} y={i * (cellSize + gap) + cellSize - 1} fontSize="3" fill="#9ca3af" textAnchor="end">{label}</text>
        ))}
        {cells.map((c, i) => (
          <rect key={i} x={c.x + 10} y={c.y} width={cellSize} height={cellSize} rx="1" fill={c.color}>
            <title>{c.date}: {data[c.date] || 0} activities</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}

/* ─── Main Reports Page ─── */
export default function Reports() {
  const { user } = useAuth();
  const gamification = useGamification();
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "sle" | "activity">("overview");

  // Generate sample data based on actual user stats
  const xpData = useMemo(() => {
    const base = gamification.totalXP || 0;
    return Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(base * (i + 1) / 12 + (Math.random() - 0.5) * 50)));
  }, [gamification.totalXP]);

  const quizScores = useMemo(() => {
    return Array.from({ length: 8 }, () => Math.round(50 + Math.random() * 50));
  }, []);

  const pathProgress = useMemo(() => {
    return [
      { name: "Path I", completed: Math.round(Math.random() * 16), total: 16 },
      { name: "Path II", completed: Math.round(Math.random() * 16), total: 16 },
      { name: "Path III", completed: Math.round(Math.random() * 16), total: 16 },
      { name: "Path IV", completed: Math.round(Math.random() * 8), total: 16 },
      { name: "Path V", completed: Math.round(Math.random() * 4), total: 16 },
      { name: "Path VI", completed: Math.round(Math.random() * 2), total: 16 },
    ];
  }, []);

  const sleSkills = useMemo(() => [
    { name: "Reading", value: 45 + Math.round(Math.random() * 40), max: 100 },
    { name: "Writing", value: 35 + Math.round(Math.random() * 40), max: 100 },
    { name: "Oral", value: 30 + Math.round(Math.random() * 40), max: 100 },
    { name: "Grammar", value: 40 + Math.round(Math.random() * 40), max: 100 },
    { name: "Vocabulary", value: 50 + Math.round(Math.random() * 40), max: 100 },
  ], []);

  const activityData = useMemo(() => {
    const d: Record<string, number> = {};
    const today = new Date();
    for (let i = 0; i < 84; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      d[key] = Math.random() > 0.4 ? Math.round(Math.random() * 8) : 0;
    }
    return d;
  }, []);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "dashboard" },
    { id: "progress" as const, label: "Progress", icon: "trending_up" },
    { id: "sle" as const, label: "SLE Readiness", icon: "assessment" },
    { id: "activity" as const, label: "Activity", icon: "calendar_today" },
  ];

  const overallScore = Math.round(sleSkills.reduce((a, s) => a + s.value, 0) / sleSkills.length);
  const sleLevel = overallScore >= 80 ? "C" : overallScore >= 60 ? "B" : "A";
  const sleLevelColor = overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reports & Analytics
          </h1>
        </div>
        <p className="text-gray-500 text-sm mb-6 ml-8">
          Track your learning journey with detailed analytics and progress reports.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative
                ${activeTab === tab.id
                  ? "text-[#008090] border-b-2 border-[#008090]"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <span className="material-icons text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total XP", value: gamification.totalXP.toLocaleString(), icon: "star", color: "#f59e0b" },
                { label: "Lessons Done", value: gamification.lessonsCompleted.toString(), icon: "school", color: "#008090" },
                { label: "Quizzes Passed", value: gamification.quizzesPassed.toString(), icon: "quiz", color: "#6366f1" },
                { label: "Day Streak", value: `${gamification.streak}d`, icon: "local_fire_department", color: "#ef4444" },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                  <span className="material-icons text-[28px] mb-2" style={{ color: s.color }}>{s.icon}</span>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* XP Over Time */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-icons text-[#008090] text-[18px]">show_chart</span>
                XP Earned Over Time
              </h3>
              <LineChart data={xpData} color="#008090" label="Last 12 weeks" />
            </div>

            {/* Quiz Scores */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-icons text-[#6366f1] text-[18px]">quiz</span>
                Recent Quiz Scores
              </h3>
              <BarChart data={quizScores} labels={["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]} color="#6366f1" />
              <div className="flex items-center gap-2 mt-2">
                <div className="h-[1px] flex-1 bg-red-200" />
                <span className="text-[10px] text-red-400">Pass threshold: 60%</span>
                <div className="h-[1px] flex-1 bg-red-200" />
              </div>
            </div>
          </div>
        )}

        {/* ─── PROGRESS TAB ─── */}
        {activeTab === "progress" && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-icons text-[#008090] text-[18px]">route</span>
                Path Completion Progress
              </h3>
              <div className="space-y-4">
                {pathProgress.map((path) => {
                  const pct = Math.round((path.completed / path.total) * 100);
                  return (
                    <div key={path.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{path.name}</span>
                        <span className="text-xs text-gray-500">{path.completed}/{path.total} lessons ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: pct === 100 ? "#10b981" : pct > 50 ? "#008090" : "#f59e0b",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lessons per Path Bar Chart */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-icons text-[#f59e0b] text-[18px]">bar_chart</span>
                Lessons Completed per Path
              </h3>
              <BarChart
                data={pathProgress.map((p) => p.completed)}
                labels={pathProgress.map((p) => p.name.replace("Path ", "P"))}
                color="#f59e0b"
              />
            </div>

            {/* Milestones */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-icons text-[#10b981] text-[18px]">emoji_events</span>
                Milestones
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "First Lesson", icon: "play_circle", done: gamification.lessonsCompleted > 0 },
                  { name: "10 Lessons", icon: "school", done: gamification.lessonsCompleted >= 10 },
                  { name: "First Quiz", icon: "quiz", done: gamification.quizzesPassed > 0 },
                  { name: "7-Day Streak", icon: "local_fire_department", done: gamification.streak >= 7 },
                  { name: "500 XP", icon: "star", done: gamification.totalXP >= 500 },
                  { name: "Path Complete", icon: "flag", done: pathProgress.some((p) => p.completed === p.total) },
                  { name: "Perfect Quiz", icon: "verified", done: gamification.perfectQuizzes > 0 },
                  { name: "30-Day Streak", icon: "whatshot", done: gamification.streak >= 30 },
                ].map((m) => (
                  <div
                    key={m.name}
                    className={`rounded-xl p-3 text-center transition-all ${
                      m.done ? "bg-[rgba(0,128,144,0.08)] border border-[rgba(0,128,144,0.2)]" : "bg-gray-50 border border-gray-100 opacity-50"
                    }`}
                  >
                    <span className={`material-icons text-[24px] mb-1 ${m.done ? "text-[#008090]" : "text-gray-300"}`}>
                      {m.icon}
                    </span>
                    <p className={`text-[10px] font-medium ${m.done ? "text-gray-700" : "text-gray-400"}`}>{m.name}</p>
                    {m.done && <span className="material-icons text-[12px] text-[#10b981]">check_circle</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── SLE READINESS TAB ─── */}
        {activeTab === "sle" && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="glass-card rounded-xl p-6 text-center">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SLE Readiness Score</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke={sleLevelColor} strokeWidth="8"
                    strokeDasharray={`${overallScore * 2.64} 264`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{overallScore}%</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white mt-1" style={{ backgroundColor: sleLevelColor }}>
                    Level {sleLevel}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {overallScore >= 80
                  ? "Excellent! You're well-prepared for the SLE exam at Level C."
                  : overallScore >= 60
                  ? "Good progress! Keep practicing to reach Level C readiness."
                  : "Keep learning! Focus on your weaker areas to improve your score."}
              </p>
            </div>

            {/* Radar Chart */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-icons text-[#008090] text-[18px]">radar</span>
                Skills Breakdown
              </h3>
              <RadarChart skills={sleSkills} />
            </div>

            {/* Skill Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sleSkills.map((skill) => {
                const level = skill.value >= 80 ? "C" : skill.value >= 60 ? "B" : "A";
                const levelColor = skill.value >= 80 ? "#10b981" : skill.value >= 60 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={skill.name} className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: levelColor }}>
                        Level {level} — {skill.value}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${skill.value}%`, backgroundColor: levelColor }} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                      {skill.value >= 80
                        ? "Strong performance. Maintain with regular practice."
                        : skill.value >= 60
                        ? "Solid foundation. Focus on advanced patterns."
                        : "Needs improvement. Prioritize this skill area."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── ACTIVITY TAB ─── */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            {/* Activity Heatmap */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-icons text-[#008090] text-[18px]">calendar_today</span>
                Activity Heatmap (Last 12 Weeks)
              </h3>
              <ActivityHeatmap data={activityData} weeks={12} />
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-gray-400">Less</span>
                {["#f3f4f6", "rgba(0,128,144,0.2)", "rgba(0,128,144,0.4)", "rgba(0,128,144,0.6)", "rgba(0,128,144,0.9)"].map((c) => (
                  <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
                <span className="text-[10px] text-gray-400">More</span>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-icons text-[#f59e0b] text-[18px]">insights</span>
                Weekly Activity Summary
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const val = Math.round(Math.random() * 5);
                  return (
                    <div key={day} className="text-center">
                      <p className="text-[10px] text-gray-500 mb-1">{day}</p>
                      <div className="w-full h-16 bg-gray-50 rounded-lg flex items-end justify-center pb-1">
                        <div
                          className="w-4 rounded-t-md transition-all"
                          style={{
                            height: `${Math.max(val * 20, 4)}%`,
                            backgroundColor: val > 3 ? "#008090" : val > 1 ? "rgba(0,128,144,0.5)" : "#e5e7eb",
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-medium text-gray-700 mt-1">{val}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-icons text-[#6366f1] text-[18px]">history</span>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  { action: "Completed Lesson 1.3", type: "lesson", time: "2 hours ago", xp: "+25 XP" },
                  { action: "Passed Quiz Module 1", type: "quiz", time: "3 hours ago", xp: "+50 XP" },
                  { action: "Started Path II", type: "path", time: "Yesterday", xp: "+10 XP" },
                  { action: "7-Day Streak Achieved!", type: "streak", time: "Yesterday", xp: "+100 XP" },
                  { action: "Completed Oral Practice", type: "oral", time: "2 days ago", xp: "+15 XP" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className={`material-icons text-[18px] ${
                      activity.type === "streak" ? "text-[#ef4444]" :
                      activity.type === "quiz" ? "text-[#6366f1]" :
                      "text-[#008090]"
                    }`}>
                      {activity.type === "lesson" ? "school" :
                       activity.type === "quiz" ? "quiz" :
                       activity.type === "path" ? "route" :
                       activity.type === "streak" ? "local_fire_department" : "mic"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.action}</p>
                      <p className="text-[10px] text-gray-400">{activity.time}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#008090]">{activity.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
