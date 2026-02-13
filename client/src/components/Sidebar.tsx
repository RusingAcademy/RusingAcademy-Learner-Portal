/**
 * LRDG Portal Sidebar Navigation
 * Design: White background, fixed left sidebar ~210px
 * - LRDG logo at top
 * - "Book a Session" button (blue)
 * - Navigation links with Material Icons
 * - User profile at bottom with avatar, name, My Profile, My Settings, LOG OUT
 * - Version number at very bottom
 * Colors: White bg, #086FDD blue accent, gray text, teal active highlight
 */
import { useLocation, Link } from "wouter";

const LRDG_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/cRbvDBAcgSnSSHTz.png";

interface NavItem {
  label: string;
  icon: string;
  path: string;
  badge?: number;
  dividerAfter?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", icon: "home", path: "/dashboard" },
  { label: "Learning Materials", icon: "local_library", path: "/learning-materials" },
  { label: "Tutoring Sessions", icon: "supervisor_account", path: "/tutoring-sessions" },
  { label: "Authorizations", icon: "event_note", path: "/authorizations" },
  { label: "Progress", icon: "analytics", path: "/progress" },
  { label: "Results", icon: "assignment_turned_in", path: "/results" },
  { label: "Reports", icon: "file_copy", path: "/reports", dividerAfter: true },
  { label: "Calendar", icon: "event", path: "/calendar" },
  { label: "Notifications", icon: "notifications", path: "/notifications", badge: 0 },
  { label: "Community Forum", icon: "forum", path: "/community-forum", dividerAfter: true },
  { label: "Help", icon: "help", path: "/help" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white z-50 flex flex-col border-r border-gray-200 transition-transform duration-200
          ${collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
          w-[210px]`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <Link href="/dashboard">
            <img src={LRDG_LOGO} alt="LRDG" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Book a Session button */}
        <div className="px-3 py-2">
          <button className="w-full bg-[#086FDD] text-white text-[13px] font-medium py-2 px-4 rounded hover:bg-[#0760c0] transition-colors flex items-center justify-center gap-1.5">
            <span className="material-icons text-[16px]">event</span>
            Book a Session
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-1">
          <ul className="space-y-0">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
              const isHome = item.path === "/dashboard" && location === "/dashboard";
              const active = isHome || isActive;

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors relative
                      ${active
                        ? "bg-[#086FDD]/8 text-[#086FDD] font-medium border-l-[3px] border-[#086FDD]"
                        : "text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent"
                      }`}
                    onClick={onToggle}
                  >
                    <span className={`material-icons text-[20px] ${active ? "text-[#086FDD]" : "text-gray-500"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  {item.dividerAfter && (
                    <div className="mx-4 my-1 border-t border-gray-100" />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="material-icons text-gray-400 text-2xl">person</span>
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-gray-800 truncate">Steven Barholere</div>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/profile"
              className="block w-full text-center text-[11px] font-medium py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              My Profile
            </Link>
            <Link
              href="/settings"
              className="block w-full text-center text-[11px] font-medium py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              My Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-center text-[11px] font-medium py-1.5 bg-gray-100 rounded text-gray-600 hover:bg-gray-200 transition-colors"
            >
              LOG OUT
            </button>
          </div>
        </div>

        {/* Version */}
        <div className="text-center text-[10px] text-gray-400 pb-2">
          Version 4.6 - 3.0.6
        </div>
      </aside>
    </>
  );
}
