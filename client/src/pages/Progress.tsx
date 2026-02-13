/**
 * LRDG Portal - Progress Page
 * Design: Summary of modules accessed with progress table
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

const progressData = [
  { module: "Module 1 (WCAG 2.1)", totalActivities: 32, completed: 1, percentage: 3, lastAccessed: "02/09/2026 07:52 PM" },
  { module: "Module 2", totalActivities: 28, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 3", totalActivities: 30, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 4", totalActivities: 26, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 5", totalActivities: 24, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 6", totalActivities: 22, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 7", totalActivities: 20, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 8", totalActivities: 25, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 9", totalActivities: 28, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 10", totalActivities: 30, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 11", totalActivities: 26, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 12", totalActivities: 24, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 13", totalActivities: 22, completed: 0, percentage: 0, lastAccessed: "-" },
  { module: "Module 14", totalActivities: 20, completed: 0, percentage: 0, lastAccessed: "-" },
];

export default function Progress() {
  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-medium text-gray-900">Progress</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-md border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-[#086FDD]">1</p>
            <p className="text-xs text-gray-500 mt-1">Modules Accessed</p>
          </div>
          <div className="bg-white rounded-md border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-[#086FDD]">1</p>
            <p className="text-xs text-gray-500 mt-1">Activities Completed</p>
          </div>
          <div className="bg-white rounded-md border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-[#086FDD]">3%</p>
            <p className="text-xs text-gray-500 mt-1">Overall Progress</p>
          </div>
        </div>

        {/* Progress Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#D4FBF7]">
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Module</th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Total Activities</th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Completed</th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Progress</th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Last Accessed</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((item, i) => (
                <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#eef9f7]`}>
                  <td className="px-4 py-3 text-sm text-gray-800">{item.module}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.totalActivities}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.completed}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#086FDD] rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{item.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{item.lastAccessed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
