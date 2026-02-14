/**
 * AdminControlSidebar — Sidebar navigation for Admin Control System
 * Red accent theme (#dc2626) with glassmorphism
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";

const ACCENT = "#dc2626";

interface NavItem {
  icon: string;
  labelEn: string;
  labelFr: string;
  path: string;
}

const mainNav: NavItem[] = [
  { icon: "dashboard", labelEn: "Dashboard", labelFr: "Tableau de bord", path: "/admin/control" },
  { icon: "people", labelEn: "Users & Roles", labelFr: "Utilisateurs & Rôles", path: "/admin/control/users" },
  { icon: "school", labelEn: "Course Builder", labelFr: "Constructeur de cours", path: "/admin/control/courses" },
  { icon: "storefront", labelEn: "Commerce", labelFr: "Commerce", path: "/admin/control/commerce" },
  { icon: "campaign", labelEn: "Marketing CRM", labelFr: "Marketing CRM", path: "/admin/control/marketing" },
  { icon: "analytics", labelEn: "Live KPIs", labelFr: "KPIs en direct", path: "/admin/control/kpis" },
];

export default function AdminControlSidebar() {
  const { lang, setLang } = useLanguage();
  const [location] = useLocation();

  return (
    <aside className="w-[240px] h-screen flex flex-col bg-white border-r border-gray-100 fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/admin/control" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: ACCENT }}>
            A
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              RusingÂcademy
            </p>
            <p className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: ACCENT }}>
              ADMIN CONTROL
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
          {lang === "fr" ? "SYSTÈME" : "SYSTEM"}
        </p>
        <div className="space-y-0.5">
          {mainNav.map(item => {
            const isActive = location === item.path || (item.path !== "/admin/control" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm no-underline transition-all ${
                  isActive
                    ? "text-white font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                style={isActive ? { backgroundColor: ACCENT } : {}}>
                <span className="material-icons text-lg">{item.icon}</span>
                {lang === "fr" ? item.labelFr : item.labelEn}
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2 mt-6">
          {lang === "fr" ? "ACCÈS RAPIDE" : "QUICK ACCESS"}
        </p>
        <div className="space-y-0.5">
          <Link href="/admin/control/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 no-underline transition-all">
            <span className="material-icons text-lg">settings</span>
            {lang === "fr" ? "Paramètres" : "Settings"}
          </Link>
          <Link href="/admin/control/audit"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 no-underline transition-all">
            <span className="material-icons text-lg">history</span>
            {lang === "fr" ? "Journal d'audit" : "Audit Log"}
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <span className="material-icons text-sm">translate</span>
            {lang === "fr" ? "Français" : "English"}
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {lang === "fr" ? "FR" : "EN"}
            </span>
          </button>
        </div>
        <Link href="/"
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 no-underline transition-colors">
          <span className="material-icons text-sm">arrow_back</span>
          {lang === "fr" ? "Retour au portail" : "Back to Portal"}
        </Link>
        <p className="text-[9px] text-gray-300 mt-2">v2.0.0 — RusingÂcademy</p>
      </div>
    </aside>
  );
}
