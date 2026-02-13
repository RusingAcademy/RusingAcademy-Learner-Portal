/**
 * DashboardLayout — RusingÂcademy Learning Portal
 * Design: Dark sidebar (250px), warm cream main area, glassmorphism accents
 * Footer: Rusinga International Consulting Ltd. (institutional)
 */
import { useState } from "react";
import Sidebar from "./Sidebar";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen" style={{ background: "#fefef8" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center px-4 h-14 glass" style={{ borderBottom: "1px solid rgba(0,128,144,0.1)" }}>
        <button onClick={() => setSidebarCollapsed(false)} className="p-1">
          <span className="material-icons text-[#0c1929]">menu</span>
        </button>
        <img src={LOGO_ICON} alt="RusingÂcademy" className="h-8 ml-3 rounded-lg" />
        <span className="ml-2 text-sm font-semibold text-[#0c1929]" style={{ fontFamily: "'Playfair Display', serif" }}>
          RusingÂcademy
        </span>
      </div>

      {/* Main content */}
      <main className="lg:ml-[250px] min-h-screen pt-14 lg:pt-0 flex flex-col">
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t" style={{ borderColor: "rgba(0,128,144,0.08)", background: "rgba(255,255,255,0.6)" }}>
          <p className="text-[11px] text-gray-500">
            © 2026 RusingÂcademy — A Division of{" "}
            <span className="font-medium text-[#008090]">Rusinga International Consulting Ltd.</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Version 2.0.0 — Premium Learning Portal
          </p>
        </footer>
      </main>
    </div>
  );
}
