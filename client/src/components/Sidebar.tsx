/**
 * Sidebar — RusingÂcademy Learning Portal
 * Design: Clean white sidebar with teal accents, LRDG-inspired light theme
 */
import { Link, useLocation } from "wouter";
import { useGamification } from "@/contexts/GamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

interface NavItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", path: "/dashboard" },
  { icon: "school", label: "My Programs", path: "/programs" },
  { icon: "menu_book", label: "Learning Materials", path: "/learning-materials" },
  { icon: "event", label: "Tutoring Sessions", path: "/tutoring-sessions" },
  { icon: "verified", label: "Authorizations", path: "/authorizations" },
  { icon: "trending_up", label: "Progress", path: "/progress" },
  { icon: "leaderboard", label: "Leaderboard", path: "/leaderboard" },
  { icon: "flag", label: "Challenges", path: "/challenges" },
  { icon: "quiz", label: "SLE Practice", path: "/sle-practice" },
  { icon: "smart_toy", label: "AI Assistant", path: "/ai-assistant" },
  { icon: "bar_chart", label: "Results", path: "/results" },
  { icon: "description", label: "Reports", path: "/reports" },
  { icon: "calendar_today", label: "Calendar", path: "/calendar" },
];

const studyToolsNav: NavItem[] = [
  { icon: "note_alt", label: "Study Notes", path: "/notes" },
  { icon: "style", label: "Flashcards", path: "/flashcards" },
  { icon: "replay", label: "Daily Review", path: "/daily-review" },
  { icon: "event_note", label: "Study Planner", path: "/study-planner" },
  { icon: "translate", label: "Vocabulary", path: "/vocabulary" },
  { icon: "edit_note", label: "Writing Portfolio", path: "/writing-portfolio" },
  { icon: "record_voice_over", label: "Pronunciation Lab", path: "/pronunciation-lab" },
  { icon: "auto_stories", label: "Reading Lab", path: "/reading-lab" },
  { icon: "headphones", label: "Listening Lab", path: "/listening-lab" },
  { icon: "spellcheck", label: "Grammar Drills", path: "/grammar-drills" },
  { icon: "hearing", label: "Dictation", path: "/dictation" },
];

const secondaryNav: NavItem[] = [
  { icon: "assignment", label: "Mock SLE Exam", path: "/mock-sle" },
  { icon: "insights", label: "Analytics", path: "/analytics" },
  { icon: "rate_review", label: "Peer Review", path: "/peer-review" },
  { icon: "groups", label: "Study Groups", path: "/study-groups" },
  { icon: "public", label: "Cultural Immersion", path: "/cultural-immersion" },
  { icon: "notifications", label: "Notifications", path: "/notifications", badge: 3 },
  { icon: "forum", label: "Discussions", path: "/discussions" },
  { icon: "bookmark", label: "Bookmarks", path: "/bookmarks" },
  { icon: "search", label: "Search", path: "/search" },
  { icon: "emoji_events", label: "Achievements", path: "/achievements" },
  { icon: "help_outline", label: "Help Center", path: "/help" },
];

const adminNav: NavItem[] = [
  { icon: "admin_panel_settings", label: "Admin Panel", path: "/admin" },
  { icon: "people", label: "Coach Hub", path: "/admin/coaches" },
  { icon: "bar_chart", label: "Executive Summary", path: "/admin/analytics" },
  { icon: "edit_note", label: "Content Pipeline", path: "/admin/content-pipeline" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { totalXP, level, levelTitle, streak } = useGamification();
  const { lang, toggleLang, t } = useLanguage();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/programs") return location.startsWith("/programs");
    if (path === "/dashboard") return location === "/dashboard";
    return location === path;
  };

  const handleLogout = () => setLocation("/");

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onToggle} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-200 w-[240px] bg-white border-r border-gray-200 ${collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}`}
        role="navigation" aria-label="Main navigation">

        {/* Logo Section */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <img src={LOGO_ICON} alt="RusingÂcademy" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="text-gray-900 font-semibold text-sm tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                RusingÂcademy
              </span>
              <span className="block text-[10px] text-[#008090] tracking-wider uppercase font-medium">Learning Portal</span>
            </div>
          </Link>
        </div>

        {/* Book a Session CTA */}
        <div className="px-4 py-3">
          <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-md hover:brightness-105"
            style={{ background: "#008090" }}>
            <span className="material-icons text-base">event</span>
            Book a Session
          </button>
        </div>

        {/* Gamification Mini-Bar */}
        <div className="mx-4 mb-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[#008090] text-xs font-bold">Lv.{level}</span>
              <span className="text-gray-500 text-[10px]">{levelTitle}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-orange-500 text-xs streak-fire">🔥</span>
              <span className="text-gray-600 text-[10px] font-medium">{streak}d</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full xp-bar rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (totalXP % 500) / 5)}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">{totalXP.toLocaleString()} XP</span>
            <span className="text-[10px] text-[#008090] font-medium">{500 - (totalXP % 500)} to next</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5" aria-label="Primary navigation">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider px-3 mb-1 font-semibold">Main</div>
          {mainNav.map((item) => (
            <Link key={item.path} href={item.path} onClick={onToggle}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-[#008090]/8 text-[#008090] font-semibold border-l-[3px] border-[#008090]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-[3px] border-transparent"
              }`}>
                <span className={`material-icons text-lg ${isActive(item.path) ? "text-[#008090]" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-[#008090] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}

          <div className="mx-3 my-2 border-t border-gray-100" />

          <div className="text-[10px] text-gray-400 uppercase tracking-wider px-3 mb-1 font-semibold">Study Tools</div>
          {studyToolsNav.map((item) => (
            <Link key={item.path} href={item.path} onClick={onToggle}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-[#008090]/8 text-[#008090] font-semibold border-l-[3px] border-[#008090]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-[3px] border-transparent"
              }`}>
                <span className={`material-icons text-lg ${isActive(item.path) ? "text-[#008090]" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}

          <div className="mx-3 my-2 border-t border-gray-100" />

          <div className="text-[10px] text-gray-400 uppercase tracking-wider px-3 mb-1 font-semibold">Community</div>
          {secondaryNav.map((item) => (
            <Link key={item.path} href={item.path} onClick={onToggle}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-[#008090]/8 text-[#008090] font-semibold border-l-[3px] border-[#008090]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-[3px] border-transparent"
              }`}>
                <span className={`material-icons text-lg ${isActive(item.path) ? "text-[#008090]" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-[#e74c3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}

          {/* Admin Section - only visible for admins */}
          {user?.role === "admin" && (
            <>
              <div className="mx-3 my-2 border-t border-gray-100" />
              <div className="text-[10px] text-purple-500 uppercase tracking-wider px-3 mb-1 font-semibold">Admin</div>
              {adminNav.map((item) => (
                <Link key={item.path} href={item.path} onClick={onToggle}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                    isActive(item.path)
                      ? "bg-purple-50 text-purple-600 font-semibold border-l-[3px] border-purple-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-[3px] border-transparent"
                  }`}>
                    <span className={`material-icons text-lg ${isActive(item.path) ? "text-purple-500" : "text-gray-400 group-hover:text-gray-600"}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-100">
          <Link href="/profile">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#008090] to-[#00a0b0] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                SB
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm font-medium truncate">Steven B.</p>
                <p className="text-gray-400 text-[10px] truncate">Public Servant</p>
              </div>
              <span className="material-icons text-gray-300 text-sm group-hover:text-[#008090]">settings</span>
            </div>
          </Link>

          {/* Language Toggle */}
          <button onClick={toggleLang}
            className="w-full mt-2 py-2 rounded-lg text-[11px] font-medium text-gray-500 hover:text-[#008090] hover:bg-[#008090]/5 transition-all flex items-center justify-center gap-2 border border-gray-100">
            <span className="material-icons text-sm">translate</span>
            {lang === "en" ? "Français" : "English"}
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#008090]/10 text-[#008090] font-bold uppercase">{lang}</span>
          </button>

          <button onClick={handleLogout} className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5">
            <span className="material-icons text-sm">logout</span>
            {t("common.signOut")}
          </button>

          <div className="text-center mt-2">
            <span className="text-[9px] text-gray-400">v2.0.0 — RusingÂcademy</span>
          </div>
        </div>
      </aside>
    </>
  );
}
