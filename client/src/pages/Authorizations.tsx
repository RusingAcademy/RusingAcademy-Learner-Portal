/**
 * RusingÂcademy Learning Portal - Authorizations Page
 * Design: 3 tabs - Modules / Pre-Authorized Hours / Extra Information
 * Table with teal header
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Link } from "wouter";

const tabs = ["Modules", "Pre-Authorized Hours", "Extra Information"];

const moduleAuths = [
  { module: "Module 1 (WCAG 2.1)", startDate: "02/09/2026", endDate: "08/09/2026", status: "Active", hours: "50" },
  { module: "Module 2", startDate: "-", endDate: "-", status: "Pending", hours: "50" },
  { module: "Module 3", startDate: "-", endDate: "-", status: "Pending", hours: "50" },
  { module: "Module 4", startDate: "-", endDate: "-", status: "Pending", hours: "50" },
  { module: "Module 5", startDate: "-", endDate: "-", status: "Pending", hours: "50" },
  { module: "Module 6", startDate: "-", endDate: "-", status: "Pending", hours: "50" },
  { module: "Module 7", startDate: "-", endDate: "-", status: "Pending", hours: "50" },
];

export default function Authorizations() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Authorizations</h1>
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

        {/* Modules Tab */}
        {activeTab === 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[rgba(0,128,144,0.08)]">
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Module</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Start Date</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">End Date</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Hours</th>
                </tr>
              </thead>
              <tbody>
                {moduleAuths.map((auth, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#eef9f7]`}>
                    <td className="px-4 py-3 text-sm text-gray-800">{auth.module}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{auth.startDate}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{auth.endDate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        auth.status === "Active"
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}>
                        {auth.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{auth.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pre-Authorized Hours Tab */}
        {activeTab === 1 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[rgba(0,128,144,0.08)]">
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Authorization</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Hours Authorized</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Hours Used</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Hours Remaining</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                    No pre-authorized hours found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Extra Information Tab */}
        {activeTab === 2 && (
          <div className="glass-card rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Contract Type</label>
                <p className="text-sm text-gray-800">Individual - Part Time</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Language</label>
                <p className="text-sm text-gray-800">English</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Methodology</label>
                <p className="text-sm text-gray-800">Individual - Part Time</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-600">On Hold</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
