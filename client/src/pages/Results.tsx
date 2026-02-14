/**
 * RusingÂcademy Learning Portal - Results Page
 * Design: Tabs for Final Quiz Results / Summary of Results (Chart) / Proficiency Levels (Table)
 * Bar chart + data table
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const tabs = ["Final Quiz Results", "Summary of Results (Chart)", "Proficiency Levels (Table)"];

const quizResults = [
  { module: "Module 1", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 2", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 3", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 4", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 5", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 6", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 7", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 8", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 9", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 10", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 11", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 12", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 13", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
  { module: "Module 14", quiz: "Final Quiz", score: "-", passingGrade: "60%", status: "Not Attempted", date: "-" },
];

const chartData = quizResults.map((r, i) => ({
  module: `${i + 1}`,
  score: 0,
}));

const proficiencyLevels = [
  { skill: "Reading Comprehension", level: "-", date: "-" },
  { skill: "Written Expression", level: "-", date: "-" },
  { skill: "Oral Proficiency", level: "-", date: "-" },
];

export default function Results() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Results</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(0,128,144,0.1)] mb-4 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap
                ${activeTab === i
                  ? "text-[#008090] border-b-2 border-[#008090]"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Final Quiz Results Tab */}
        {activeTab === 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[rgba(0,128,144,0.08)]">
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Module</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Quiz</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Score</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Passing Grade</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map((result, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#eef9f7]`}>
                    <td className="px-4 py-3 text-sm text-gray-800">{result.module}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.quiz}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.score}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.passingGrade}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                        {result.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{result.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Chart Tab */}
        {activeTab === 1 && (
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Final Quiz Results per Module</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="module" tick={{ fontSize: 11 }} label={{ value: "Module", position: "insideBottom", offset: -5, fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} label={{ value: "Score (%)", angle: -90, position: "insideLeft", fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Score"]} />
                  <Bar dataKey="score" fill="#008090" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Proficiency Levels Tab */}
        {activeTab === 2 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[rgba(0,128,144,0.08)]">
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Skill</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Level</th>
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {proficiencyLevels.map((level, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-sm text-gray-800">{level.skill}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{level.level}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{level.date}</td>
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
