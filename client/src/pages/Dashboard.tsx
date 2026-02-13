/**
 * LRDG Portal - Dashboard / Home Page
 * Design: Grid of widgets matching the original portal layout
 * - Welcome greeting: "HELLO, STEVEN"
 * - My results by modules (bar chart)
 * - Learning Materials (recent modules)
 * - Calendar widget
 * - LRDG Blog card
 * - My Notes
 * - LRDG Announcements
 * - My messages / Notifications
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const BLOG_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/wJjaNsgPzktTxqOe.png";
const LEARNING_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/WYdPVcbRWqWrpqYH.png";

const chartData = [
  { module: "1", score: 3 },
  { module: "2", score: 0 },
  { module: "3", score: 0 },
  { module: "4", score: 0 },
  { module: "5", score: 0 },
  { module: "6", score: 0 },
  { module: "7", score: 0 },
  { module: "8", score: 0 },
  { module: "9", score: 0 },
  { module: "10", score: 0 },
  { module: "11", score: 0 },
  { module: "12", score: 0 },
  { module: "13", score: 0 },
  { module: "14", score: 0 },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function CalendarWidget() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">
          {MONTHS[month]} {year}
        </span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-0.5 hover:bg-gray-100 rounded">
            <span className="material-icons text-[16px] text-gray-500">chevron_left</span>
          </button>
          <button onClick={nextMonth} className="p-0.5 hover:bg-gray-100 rounded">
            <span className="material-icons text-[16px] text-gray-500">chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-[10px] text-gray-500 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="py-0.5 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-[11px]">
        {days.map((day, i) => (
          <div
            key={i}
            className={`py-1 rounded-full ${
              day === today && isCurrentMonth
                ? "bg-[#086FDD] text-white font-bold"
                : day ? "text-gray-700 hover:bg-gray-100" : ""
            }`}
          >
            {day || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

const announcements = [
  {
    title: "IMPORTANT – ACTION REQUIRED / ACTION REQUISE",
    content: `As of March 10, 2025, we have fully transitioned to the LRDG support form for support. Email inquiries are no longer monitored. To ensure your request is properly tracked and addressed, please submit it via our official support form.`
  }
];

const notifications = [
  { title: "LRDG Language Training: How to access your learning materials...", from: "system", date: "03/12/2024", time: "02:55 PM" },
  { title: "LRDG Language Training: How to access your learning materials...", from: "system", date: "03/01/2024", time: "08:54 AM" },
  { title: "LRDG Language Training: Preliminary oral evaluation results...", from: "system", date: "03/01/2024", time: "08:54 AM" },
];

// Top row progress circles for modules
const moduleProgress = [
  { id: 12, label: "Module 12", pct: 78 },
  { id: 13, label: "Module 13", pct: 0 },
  { id: 14, label: "Module 14", pct: 0 },
];

function ProgressRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#086FDD" strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">{pct}%</span>
    </div>
  );
}

// Quick action cards
const quickActions = [
  { icon: "play_circle", label: "Complete your online evaluation", color: "#086FDD" },
  { icon: "headset_mic", label: "Complete your oral evaluation", color: "#086FDD" },
  { icon: "group", label: "Complete your online group activity", color: "#086FDD" },
];

export default function Dashboard() {
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        {/* Welcome Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 tracking-wide">HELLO, STEVEN</h1>
          <p className="text-sm text-gray-500">Welcome back!</p>
        </div>

        {/* Top Row: Module Progress + Quick Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-5">
          {/* Module Progress Circles */}
          <div className="flex items-center gap-4">
            {moduleProgress.map(m => (
              <div key={m.id} className="flex flex-col items-center">
                <ProgressRing pct={m.pct} size={50} />
                <span className="text-[10px] text-gray-500 mt-1">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Quick Action Cards */}
          <div className="flex gap-3 ml-auto">
            {quickActions.map((qa, i) => (
              <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 cursor-pointer hover:border-[#086FDD]/30 hover:shadow-sm transition-all">
                <span className="material-icons text-[#086FDD] text-[18px]">{qa.icon}</span>
                <span className="text-[11px] text-gray-600 max-w-[140px] leading-tight">{qa.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid - 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Results + My Notes */}
          <div className="lg:col-span-1 space-y-4">
            {/* My results by modules */}
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-900">My results by modules</h2>
                <Link href="/results" className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="module" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Score"]} />
                    <Bar dataKey="score" fill="#086FDD" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-1">
                <span className="text-[10px] text-gray-500">Module</span>
              </div>
              <Link href="/results" className="text-xs text-[#086FDD] hover:underline mt-2 block">
                Final Quiz results per module
              </Link>
            </div>

            {/* My Notes Widget */}
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-900">My notes</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons text-[18px]">open_in_full</span>
                </button>
              </div>
              <textarea
                className="w-full min-h-[80px] text-sm text-gray-600 border border-gray-100 rounded p-2 resize-none focus:outline-none focus:border-[#086FDD]/30"
                placeholder="Write your notes here..."
              />
            </div>
          </div>

          {/* Center Column - Learning Materials + Announcements */}
          <div className="lg:col-span-1 space-y-4">
            {/* My learning materials */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="text-sm font-medium text-gray-900">My learning materials</h2>
                <Link href="/learning-materials" className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              {/* Learning illustration */}
              <div className="px-4 pb-3">
                <div className="relative rounded-md overflow-hidden h-[100px] bg-[#e8f4fd]">
                  <img
                    src={LEARNING_IMG}
                    alt="Learning Materials"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Module card */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-3 bg-[#f0f9ff] rounded-md p-3 border border-[#d0e8f7]">
                  <ProgressRing pct={3} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">Module 1 (WCAG 2.1)</p>
                    <p className="text-[10px] text-gray-400">02/09/2026 07:52 PM</p>
                  </div>
                  <Link href="/learning-materials" className="text-[#086FDD]">
                    <span className="material-icons text-[18px]">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Announcements Widget */}
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-900">Announcements</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons text-[18px]">open_in_full</span>
                </button>
              </div>
              <div className="min-h-[100px]">
                {announcements[announcementIdx] && (
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-2">
                      {announcements[announcementIdx].title}
                    </p>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {announcements[announcementIdx].content}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => setAnnouncementIdx(Math.max(0, announcementIdx - 1))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons text-[16px]">chevron_left</span>
                </button>
                <div className="flex gap-1">
                  {announcements.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === announcementIdx ? "bg-[#086FDD]" : "bg-gray-300"}`} />
                  ))}
                </div>
                <button
                  onClick={() => setAnnouncementIdx(Math.min(announcements.length - 1, announcementIdx + 1))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar + Blog + My messages */}
          <div className="lg:col-span-1 space-y-4">
            {/* Calendar Widget */}
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-900">Calendar</h2>
                <Link href="/calendar" className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              <CalendarWidget />
            </div>

            {/* LRDG Blog Card */}
            <Link href="/help" className="block">
              <div className="relative rounded-md overflow-hidden h-[110px] group">
                <img
                  src={BLOG_IMG}
                  alt="LRDG Blog"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                  <div className="px-4 flex items-center justify-between w-full">
                    <div>
                      <span className="text-white font-medium text-sm">Blogs interactifs</span>
                      <p className="text-white/70 text-[10px] mt-0.5">LRDG / HALF</p>
                    </div>
                    <span className="material-icons text-white text-[20px] group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* My messages Widget */}
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-900">My messages</h2>
                <Link href="/notifications" className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons text-[18px]">chevron_right</span>
                </Link>
              </div>
              <div className="space-y-2">
                {notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-gray-400 text-[14px]">mail</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-gray-700 truncate">{n.title}</p>
                      <p className="text-[10px] text-gray-400">{n.from} · {n.date} · {n.time}</p>
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
