/**
 * CoachSidebar — RusingÂcademy Coach Portal
 * Design: White sidebar with violet (#7c3aed) accents, matching Learner Portal pattern
 */
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

interface NavItem {
  icon: string;
  label: string;
  labelFr: string;
  path: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", labelFr: "Tableau de bord", path: "/coach/portal/dashboard" },
  { icon: "people", label: "My Students", labelFr: "Mes étudiants", path: "/coach/portal/students" },
  { icon: "event", label: "Sessions", labelFr: "Sessions", path: "/coach/portal/sessions" },
  { icon: "attach_money", label: "Revenue", labelFr: "Revenus", path: "/coach/portal/revenue" },
  { icon: "trending_up", label: "Performance", labelFr: "Performance", path: "/coach/portal/performance" },
];

const toolsNav: NavItem[] = [
  { icon: "menu_book", label: "Resources", labelFr: "Ressources", path: "/coach/portal/resources" },
  { icon: "rate_review", label: "Feedback", labelFr: "Commentaires", path: "/coach/portal/feedback" },
  { icon: "chat", label: "Messages", labelFr: "Messages", path: "/coach/portal/messages" },
  { icon: "calendar_today", label: "Calendar", labelFr: "Calendrier", path: "/coach/portal/calendar" },
];

const settingsNav: NavItem[] = [
  { icon: "person", label: "My Profile", labelFr: "Mon profil", path: "/coach/portal/profile" },
  { icon: "settings", label: "Settings", labelFr: "Paramètres", path: "/coach/portal/settings" },
  { icon: "help_outline", label: "Help", labelFr: "Aide", path: "/coach/portal/help" },
];

interface CoachSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function CoachSidebar({ collapsed, onToggle }: CoachSidebarProps) {
  const [location, setLocation] = useLocation();
  const { lang, toggleLang, t } = useLanguage();
  const { user } = useAuth();

  const isActive = (path: string) => location === path;

  const handleLogout = () => setLocation("/");

  const renderNavItem = (item: NavItem) => (
    <Link key={item.path} href={item.path} onClick={onToggle}>
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
        isActive(item.path)
          ? "bg-[#7c3aed]/8 text-[#7c3aed] font-semibold border-l-[3px] border-[#7c3aed]"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-[3px] border-transparent"
      }`}>
        <span className={`material-icons text-lg ${isActive(item.path) ? "text-[#7c3aed]" : "text-gray-400 group-hover:text-gray-600"}`}>
          {item.icon}
        </span>
        <span className="font-medium">{lang === "fr" ? item.labelFr : item.label}</span>
        {item.badge && item.badge > 0 && (
          <span className="ml-auto bg-[#7c3aed] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onToggle} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-200 w-[240px] bg-white border-r border-gray-200 ${collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}`}
        role="navigation" aria-label="Coach portal navigation">

        {/* Logo Section */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <Link href="/coach/portal/dashboard" className="flex items-center gap-3 group">
            <img src={LOGO_ICON} alt="RusingÂcademy" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="text-gray-900 font-semibold text-sm tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                RusingÂcademy
              </span>
              <span className="block text-[10px] text-[#7c3aed] tracking-wider uppercase font-medium">
                {lang === "fr" ? "Portail Coach" : "Coach Portal"}
              </span>
            </div>
          </Link>
        </div>

        {/* Coach Status Card */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-gradient-to-br from-[#7c3aed]/5 to-[#7c3aed]/10 border border-[#7c3aed]/15">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[#7c3aed] text-xs font-bold">{lang === "fr" ? "En ligne" : "Online"}</span>
            </div>
            <span className="text-gray-500 text-[10px] font-medium">⭐ 4.8</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">{lang === "fr" ? "Sessions ce mois" : "Sessions this month"}</span>
            <span className="text-[10px] text-[#7c3aed] font-bold">12</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5" aria-label="Coach navigation">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider px-3 mb-1 font-semibold">
            {lang === "fr" ? "Principal" : "Main"}
          </div>
          {mainNav.map(renderNavItem)}

          <div className="mx-3 my-2 border-t border-gray-100" />

          <div className="text-[10px] text-gray-400 uppercase tracking-wider px-3 mb-1 font-semibold">
            {lang === "fr" ? "Outils" : "Tools"}
          </div>
          {toolsNav.map(renderNavItem)}

          <div className="mx-3 my-2 border-t border-gray-100" />

          <div className="text-[10px] text-gray-400 uppercase tracking-wider px-3 mb-1 font-semibold">
            {lang === "fr" ? "Paramètres" : "Settings"}
          </div>
          {settingsNav.map(renderNavItem)}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#9333ea] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name?.charAt(0) || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm font-medium truncate">{user?.name || "Coach"}</p>
              <p className="text-gray-400 text-[10px] truncate">{lang === "fr" ? "Coach certifié" : "Certified Coach"}</p>
            </div>
          </div>

          {/* Language Toggle */}
          <button onClick={toggleLang}
            className="w-full mt-2 py-2 rounded-lg text-[11px] font-medium text-gray-500 hover:text-[#7c3aed] hover:bg-[#7c3aed]/5 transition-all flex items-center justify-center gap-2 border border-gray-100">
            <span className="material-icons text-sm">translate</span>
            {lang === "en" ? "Français" : "English"}
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-bold uppercase">{lang}</span>
          </button>

          {/* Switch to Learner Portal */}
          <button onClick={() => setLocation("/dashboard")}
            className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-medium text-[#008090] hover:bg-[#008090]/5 transition-all flex items-center justify-center gap-1.5 border border-[#008090]/20">
            <span className="material-icons text-sm">swap_horiz</span>
            {lang === "fr" ? "Portail Apprenant" : "Learner Portal"}
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
