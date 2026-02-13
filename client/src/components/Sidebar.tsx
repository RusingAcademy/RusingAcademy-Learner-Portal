/**
 * Sidebar — RusingÂcademy Learning Portal
 * Design: Dark navy sidebar with teal/gold accents, glassmorphism hover states
 * Branding: RusingÂcademy logo, premium golden standard
 */
import { Link, useLocation } from "wouter";
import { useGamification } from "@/contexts/GamificationContext";

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
  { icon: "bar_chart", label: "Results", path: "/results" },
  { icon: "description", label: "Reports", path: "/reports" },
  { icon: "calendar_today", label: "Calendar", path: "/calendar" },
];

const secondaryNav: NavItem[] = [
  { icon: "notifications", label: "Notifications", path: "/notifications", badge: 3 },
  { icon: "forum", label: "Community", path: "/community-forum" },
  { icon: "help_outline", label: "Help Center", path: "/help" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { totalXP, level, levelTitle, streak } = useGamification();

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
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggle} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-200 w-[250px] ${collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}`}
        style={{ background: "linear-gradient(180deg, #0c1929 0%, #0f2035 100%)" }}>

        {/* Logo Section */}
        <div className="px-5 pt-5 pb-3">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <img src={LOGO_ICON} alt="RusingÂcademy" className="w-9 h-9 rounded-lg" />
            <div>
              <span className="text-white font-semibold text-sm tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                RusingÂcademy
              </span>
              <span className="block text-[10px] text-[#f5a623]/70 tracking-wider uppercase">Learning Portal</span>
            </div>
          </Link>
        </div>

        {/* Book a Session CTA */}
        <div className="px-4 mb-3">
          <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#0c1929] flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #f5a623, #e8951a)" }}>
            <span className="material-icons text-base">event</span>
            Book a Session
          </button>
        </div>

        {/* Gamification Mini-Bar */}
        <div className="mx-4 mb-3 p-3 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(0,128,144,0.15), rgba(245,166,35,0.1))", border: "1px solid rgba(245,166,35,0.15)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[#f5a623] text-xs font-bold">Lv.{level}</span>
              <span className="text-gray-400 text-[10px]">{levelTitle}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-orange-400 text-xs streak-fire">🔥</span>
              <span className="text-gray-300 text-[10px] font-medium">{streak}d</span>
            </div>
          </div>
          <div className="h-1.5 bg-[#1a2d44] rounded-full overflow-hidden">
            <div className="h-full xp-bar rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (totalXP % 500) / 5)}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">{totalXP.toLocaleString()} XP</span>
            <span className="text-[10px] text-[#008090]">{500 - (totalXP % 500)} to next</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider px-3 mb-1 font-medium">Main</div>
          {mainNav.map((item) => (
            <Link key={item.path} href={item.path} onClick={onToggle}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-[#008090]/20 to-[#008090]/5 text-[#00b4c8] border-l-2 border-[#008090]"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}>
                <span className={`material-icons text-lg ${isActive(item.path) ? "text-[#008090]" : "text-gray-500 group-hover:text-[#008090]"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-[#f5a623] text-[#0c1929] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}

          <div className="mx-3 my-2 border-t border-white/5" />

          <div className="text-[10px] text-gray-500 uppercase tracking-wider px-3 mb-1 font-medium">Community</div>
          {secondaryNav.map((item) => (
            <Link key={item.path} href={item.path} onClick={onToggle}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-[#008090]/20 to-[#008090]/5 text-[#00b4c8] border-l-2 border-[#008090]"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}>
                <span className={`material-icons text-lg ${isActive(item.path) ? "text-[#008090]" : "text-gray-500 group-hover:text-[#008090]"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-[#f5a623] text-[#0c1929] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/5">
          <Link href="/profile">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#008090] to-[#f5a623] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                SB
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Steven B.</p>
                <p className="text-gray-500 text-[10px] truncate">Public Servant</p>
              </div>
              <span className="material-icons text-gray-600 text-sm group-hover:text-[#008090]">settings</span>
            </div>
          </Link>

          <button onClick={handleLogout} className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5">
            <span className="material-icons text-sm">logout</span>
            Log Out
          </button>

          <div className="text-center mt-2">
            <span className="text-[9px] text-gray-600">v2.0.0 — RusingÂcademy</span>
          </div>
        </div>
      </aside>
    </>
  );
}
