/**
 * LRDG Portal Dashboard Layout
 * Design: Fixed sidebar (210px) on left, main content area on right
 * Responsive: sidebar collapses on mobile with hamburger menu
 * Footer: "© 2026 Language Research Development Group" with version
 */
import { useState } from "react";
import Sidebar from "./Sidebar";

const LRDG_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/cRbvDBAcgSnSSHTz.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 flex items-center px-4 h-14">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="p-1"
        >
          <span className="material-icons text-gray-600">menu</span>
        </button>
        <img
          src={LRDG_LOGO}
          alt="LRDG"
          className="h-8 ml-3"
        />
      </div>

      {/* Main content */}
      <main className="lg:ml-[210px] min-h-screen pt-14 lg:pt-0 flex flex-col">
        <div className="flex-1 p-4 lg:p-5">
          {children}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-gray-200 bg-white">
          <p className="text-[11px] text-gray-400">
            © 2026 Language Research Development Group
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5">
            Version 4.6 - 3.0.6
          </p>
        </footer>
      </main>
    </div>
  );
}
