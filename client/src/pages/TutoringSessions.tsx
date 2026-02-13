/**
 * RusingÂcademy Learning Portal - Tutoring Sessions Page
 * Design: Table with teal header, session data
 * Tabs: Upcoming / Past / Cancelled
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Link } from "wouter";

const tabs = ["Upcoming", "Past", "Cancelled"];

export default function TutoringSessions() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0c1929]" style={{ fontFamily: "'Playfair Display', serif" }}>Tutoring Sessions</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(0,128,144,0.1)] mb-4">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative
                ${activeTab === i
                  ? "text-[#008090] border-b-2 border-[#008090]"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[rgba(0,128,144,0.08)]">
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">
                  <div className="flex items-center gap-1">
                    Date
                    <span className="material-icons text-[14px] text-gray-400">unfold_more</span>
                  </div>
                </th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">
                  <div className="flex items-center gap-1">
                    Time
                    <span className="material-icons text-[14px] text-gray-400">unfold_more</span>
                  </div>
                </th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Duration</th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Tutor</th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    No upcoming sessions scheduled.
                  </td>
                </tr>
              )}
              {activeTab === 1 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    No past sessions found.
                  </td>
                </tr>
              )}
              {activeTab === 2 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    No cancelled sessions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
