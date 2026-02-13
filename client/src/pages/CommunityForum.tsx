/**
 * RusingÂcademy Learning Portal - Community Forum Page
 * Design: Forum with categories, hero illustration
 * Categories: Pedagogical Discussions, Technical Support, General Discussion
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

const FORUM_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/LzjUWTpKyElhbGdI.png";

const forumCategories = [
  {
    name: "Pedagogical Discussions",
    icon: "school",
    description: "Discuss learning strategies, module content, and language tips.",
    topics: 12,
    posts: 47,
    lastPost: "02/05/2026",
  },
  {
    name: "Technical Support",
    icon: "build",
    description: "Get help with portal features, technical issues, and troubleshooting.",
    topics: 8,
    posts: 23,
    lastPost: "01/28/2026",
  },
  {
    name: "General Discussion",
    icon: "chat",
    description: "Connect with other learners, share experiences, and ask questions.",
    topics: 15,
    posts: 62,
    lastPost: "02/10/2026",
  },
  {
    name: "Study Groups",
    icon: "groups",
    description: "Find or create study groups for collaborative learning.",
    topics: 5,
    posts: 18,
    lastPost: "01/15/2026",
  },
  {
    name: "Resources & Tips",
    icon: "lightbulb",
    description: "Share useful resources, study tips, and learning materials.",
    topics: 10,
    posts: 35,
    lastPost: "02/08/2026",
  },
];

export default function CommunityForum() {
  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0c1929]" style={{ fontFamily: "'Playfair Display', serif" }}>Community Forum</h1>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-md overflow-hidden mb-6 h-[160px]">
          <img
            src={FORUM_IMG}
            alt="Community Forum"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#008090]/80 to-[#008090]/40 flex items-center">
            <div className="px-6">
              <h2 className="text-white text-xl font-medium mb-1">Welcome to the Learning Community</h2>
              <p className="text-white/80 text-sm">Connect, share, and learn together with fellow RusingÂcademy learners.</p>
            </div>
          </div>
        </div>

        {/* Forum Categories */}
        <div className="space-y-3">
          {forumCategories.map((cat, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-4 hover:border-[#008090]/30 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(0,128,144,0.08)] flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-[#008090] text-[20px]">{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                </div>
                <div className="flex gap-6 text-center flex-shrink-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{cat.topics}</p>
                    <p className="text-[10px] text-gray-400">Topics</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{cat.posts}</p>
                    <p className="text-[10px] text-gray-400">Posts</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{cat.lastPost}</p>
                    <p className="text-[10px] text-gray-400">Last Post</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
