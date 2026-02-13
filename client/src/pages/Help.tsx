/**
 * LRDG Portal - Help Page
 * Design: Zendesk-style help center with categories and search
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";
import { useState } from "react";

const categories = [
  { name: "Tutors", icon: "person", articles: 8 },
  { name: "Coordinators", icon: "supervisor_account", articles: 12 },
  { name: "Learners", icon: "school", articles: 15 },
  { name: "General", icon: "help_outline", articles: 10 },
];

const promotedArticles = [
  "How to Use the LRDG Support Form Efficiently",
  "LRDG Portal Introduction",
  "How to navigate the LRDG portal?",
  "Is there a guide available for using the learning materials/modules?",
];

const recentActivity = [
  { category: "Chat and Support Form", question: "How can I contact a live agent for support?", time: "2 months ago" },
  { category: "Tutoring sessions", question: "May I continue my training at my own expense...", time: "4 months ago" },
  { category: "Tutoring sessions", question: "Is it possible to extend my current contract with LRDG?", time: "4 months ago" },
  { category: "LRDG Portal", question: "How do I correct a registration form I just submitted?", time: "4 months ago" },
  { category: "Tutoring sessions", question: "What is the passing grade for the End-of-Module (EOM) exam?", time: "4 months ago" },
];

export default function Help() {
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-medium text-gray-900">Help Center</h1>
        </div>

        {/* Search Bar */}
        <div className="bg-[#086FDD] rounded-md p-8 mb-6">
          <h2 className="text-white text-lg font-medium text-center mb-4">How can we help?</h2>
          <div className="max-w-md mx-auto relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for articles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm border-0 focus:ring-2 focus:ring-white/50 outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="bg-white rounded-md border border-gray-200 p-5 text-center hover:border-[#086FDD]/30 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#D4FBF7] flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-[#086FDD] text-[24px]">{cat.icon}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-800">{cat.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{cat.articles} articles</p>
            </div>
          ))}
        </div>

        {/* Promoted Articles */}
        <div className="mb-8">
          <h3 className="text-base font-medium text-gray-800 mb-3">Promoted Articles</h3>
          <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
            {promotedArticles.map((article, i) => (
              <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                <span className="material-icons text-[#086FDD] text-[16px]">article</span>
                <span className="text-sm text-gray-700">{article}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-base font-medium text-gray-800 mb-3">Recent Activity</h3>
          <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
            {recentActivity.map((item, i) => (
              <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{item.category}</span>
                  <span className="text-[10px] text-gray-400">{item.time}</span>
                </div>
                <p className="text-sm text-gray-700">{item.question}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
