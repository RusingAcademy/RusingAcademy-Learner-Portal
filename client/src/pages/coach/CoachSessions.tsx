/**
 * CoachSessions — Session scheduling and management for Coach Portal
 * Features: Calendar view, session list, booking management
 */
import CoachLayout from "@/components/CoachLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const ACCENT = "#7c3aed";
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

interface Session {
  id: number;
  student: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
}

const mockSessions: Session[] = [
  { id: 1, student: "Marie Dupont", date: "Feb 14", time: "10:00 AM", duration: "60 min", type: "FSL Conversation", status: "confirmed" },
  { id: 2, student: "James Wilson", date: "Feb 14", time: "11:30 AM", duration: "45 min", type: "SLE Prep", status: "confirmed" },
  { id: 3, student: "Sophie Tremblay", date: "Feb 15", time: "2:00 PM", duration: "60 min", type: "Grammar Review", status: "pending" },
  { id: 4, student: "David Chen", date: "Feb 14", time: "3:30 PM", duration: "30 min", type: "Writing Workshop", status: "confirmed" },
  { id: 5, student: "Luc Bergeron", date: "Feb 12", time: "9:00 AM", duration: "60 min", type: "SLE Mock Exam", status: "completed" },
  { id: 6, student: "Aisha Patel", date: "Feb 10", time: "4:00 PM", duration: "45 min", type: "ESL Basics", status: "cancelled" },
];

function SessionStatusBadge({ status }: { status: Session["status"] }) {
  const styles = {
    confirmed: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-red-50 text-red-500 border-red-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

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
  const sessionDays = [14, 15, 17, 19, 21];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">{MONTHS[month]} {year}</span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded"><span className="material-icons text-[18px] text-gray-500">chevron_left</span></button>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded"><span className="material-icons text-[18px] text-gray-500">chevron_right</span></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-[10px] text-gray-400 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d} className="py-1 font-medium">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0 text-center text-[12px]">
        {days.map((day, i) => (
          <div key={i} className={`py-1.5 rounded-full relative cursor-pointer ${
            day === today && isCurrentMonth ? "bg-[#7c3aed] text-white font-bold" :
            day ? "text-gray-700 hover:bg-gray-100" : ""
          }`}>
            {day || ""}
            {day && sessionDays.includes(day) && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7c3aed]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CoachSessions() {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "completed" | "cancelled">("all");

  const filtered = mockSessions.filter(s => filter === "all" || s.status === filter);

  return (
    <CoachLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Sessions" : "Sessions"}
            </h1>
            <p className="text-sm text-gray-500">{lang === "fr" ? "Gérez vos sessions de coaching" : "Manage your coaching sessions"}</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white text-sm font-medium rounded-lg hover:bg-[#6d28d9] transition-colors shadow-sm">
            <span className="material-icons text-lg">add</span>
            {lang === "fr" ? "Nouvelle session" : "New Session"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session List */}
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-4">
              {(["all", "confirmed", "pending", "completed", "cancelled"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filter === f ? "bg-[#7c3aed] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f === "all" ? (lang === "fr" ? "Tous" : "All") : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map(session => (
                <div key={session.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center bg-[#7c3aed]/5 border border-[#7c3aed]/10">
                    <span className="text-[10px] font-bold text-[#7c3aed] uppercase">{session.date.split(" ")[0]}</span>
                    <span className="text-lg font-bold text-gray-900">{session.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{session.student}</p>
                      <SessionStatusBadge status={session.status} />
                    </div>
                    <p className="text-xs text-gray-500">{session.type} · {session.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#7c3aed]">{session.time}</p>
                    {session.status === "confirmed" && (
                      <button className="text-[11px] text-gray-400 hover:text-[#7c3aed] mt-0.5 flex items-center gap-0.5">
                        <span className="material-icons text-[14px]">videocam</span> Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CalendarWidget />

            {/* Availability Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {lang === "fr" ? "Disponibilité cette semaine" : "This Week's Availability"}
              </h3>
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                <div key={day} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-600 w-8">{day}</span>
                  <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#7c3aed]/60" style={{ width: `${[60, 40, 80, 20, 50][i]}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-12 text-right">{[3, 2, 4, 1, 2][i]} slots</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CoachLayout>
  );
}
