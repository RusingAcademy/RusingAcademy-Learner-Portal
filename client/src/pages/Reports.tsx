/**
 * RusingÂcademy Learning Portal - Reports Page
 * Design: Grid of report cards, each with icon and description
 * 9 report types matching the original
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

const reports = [
  { name: "Learner Progress Report", icon: "trending_up", description: "Overview of your learning progress across all modules." },
  { name: "Session Attendance Report", icon: "event_available", description: "Summary of your tutoring session attendance." },
  { name: "Quiz Results Report", icon: "quiz", description: "Detailed results from all quizzes and assessments." },
  { name: "Time Spent Report", icon: "schedule", description: "Analysis of time spent on learning activities." },
  { name: "Module Completion Report", icon: "check_circle", description: "Status of module completion and milestones." },
  { name: "Authorization Usage Report", icon: "receipt_long", description: "Summary of authorized hours and usage." },
  { name: "Activity Log Report", icon: "history", description: "Chronological log of all learning activities." },
  { name: "Proficiency Assessment Report", icon: "assessment", description: "Results from proficiency level assessments." },
  { name: "Custom Report", icon: "tune", description: "Generate a custom report with selected parameters." },
];

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Reports</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-5 hover:border-[#008090]/30 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(0,128,144,0.08)] flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-[#008090] text-[20px]">{report.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800 group-hover:text-[#008090] transition-colors">
                    {report.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
