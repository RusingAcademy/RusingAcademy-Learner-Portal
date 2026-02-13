/**
 * LRDG Portal - Learning Materials Page
 * Design: Tabs for Modules / Tests / References
 * Table with teal header, sortable columns
 * Module cards with progress circles
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Link } from "wouter";

const tabs = ["Modules", "Tests", "References"];

const modules = [
  { id: 1, name: "Module 1 (WCAG 2.1)", progress: 3, status: "In Progress", lastAccessed: "02/09/2026 07:52 PM" },
  { id: 2, name: "Module 2", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 3, name: "Module 3", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 4, name: "Module 4", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 5, name: "Module 5", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 6, name: "Module 6", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 7, name: "Module 7", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 8, name: "Module 8", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 9, name: "Module 9", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 10, name: "Module 10", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 11, name: "Module 11", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 12, name: "Module 12", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 13, name: "Module 13", progress: 0, status: "Not Started", lastAccessed: "-" },
  { id: 14, name: "Module 14", progress: 0, status: "Not Started", lastAccessed: "-" },
];

const tests = [
  { id: 1, name: "Placement Test", type: "Placement", status: "Available", date: "-" },
  { id: 2, name: "Module 1 Final Quiz", type: "Final Quiz", status: "Not Available", date: "-" },
];

const references = [
  { id: 1, name: "Grammar Reference Guide", type: "PDF", category: "Grammar" },
  { id: 2, name: "Vocabulary Lists", type: "PDF", category: "Vocabulary" },
  { id: 3, name: "Pronunciation Guide", type: "Audio", category: "Pronunciation" },
];

function ProgressCircle({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 15.9;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative w-10 h-10">
      <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#086FDD" strokeWidth="3"
          strokeDasharray={`${(value / 100) * 100} ${100 - (value / 100) * 100}`}
          strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700">{value}%</span>
    </div>
  );
}

export default function LearningMaterials() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        {/* Back + Title */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-medium text-gray-900">Learning Materials</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative
                ${activeTab === i
                  ? "text-[#086FDD] border-b-2 border-[#086FDD]"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Modules Tab */}
        {activeTab === 0 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D4FBF7]">
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Module</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Progress</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Last Accessed</th>
                  <th className="text-center text-xs font-medium text-gray-700 px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod, i) => (
                  <tr key={mod.id} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#eef9f7] transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProgressCircle value={mod.progress} />
                        <span className="text-sm text-gray-800">{mod.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{mod.progress}%</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        mod.status === "In Progress"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {mod.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{mod.lastAccessed}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-[#086FDD] hover:text-[#0760c0]">
                        <span className="material-icons text-[18px]">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 1 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D4FBF7]">
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Test</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, i) => (
                  <tr key={test.id} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-sm text-gray-800">{test.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{test.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        test.status === "Available"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{test.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* References Tab */}
        {activeTab === 2 && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D4FBF7]">
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Category</th>
                </tr>
              </thead>
              <tbody>
                {references.map((ref, i) => (
                  <tr key={ref.id} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-sm text-[#086FDD] hover:underline cursor-pointer">{ref.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ref.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ref.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
