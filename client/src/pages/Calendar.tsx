/**
 * LRDG Portal - Calendar Page
 * Design: Full month calendar view with category filters
 * Categories: Tutoring Sessions, Events, Deadlines, Holidays
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Link } from "wouter";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const categories = [
  { name: "Tutoring Sessions", color: "#086FDD" },
  { name: "Events", color: "#10b981" },
  { name: "Deadlines", color: "#ef4444" },
  { name: "Holidays", color: "#f59e0b" },
];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [activeCategories, setActiveCategories] = useState(categories.map(c => c.name));

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
  // Fill remaining cells
  while (days.length % 7 !== 0) days.push(null);

  const toggleCategory = (name: string) => {
    setActiveCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-medium text-gray-900">Calendar</h1>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => toggleCategory(cat.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeCategories.includes(cat.name)
                  ? "border-transparent text-white"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
              style={activeCategories.includes(cat.name) ? { backgroundColor: cat.color } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
              <span className="material-icons text-gray-500">chevron_left</span>
            </button>
            <h2 className="text-lg font-medium text-gray-800">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
              <span className="material-icons text-gray-500">chevron_right</span>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS_SHORT.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-3">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => (
              <div
                key={i}
                className={`min-h-[80px] border-b border-r border-gray-50 p-2 ${
                  day === today && isCurrentMonth ? "bg-blue-50/50" : ""
                } ${!day ? "bg-gray-50/30" : "hover:bg-gray-50"}`}
              >
                {day && (
                  <span className={`text-sm ${
                    day === today && isCurrentMonth
                      ? "bg-[#086FDD] text-white w-6 h-6 rounded-full flex items-center justify-center font-medium"
                      : "text-gray-700"
                  }`}>
                    {day}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
