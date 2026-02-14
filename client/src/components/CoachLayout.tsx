/**
 * CoachLayout — RusingÂcademy Coach Portal Layout
 * Design: White sidebar (240px), white main area with violet accents
 */
import { useState, useEffect } from "react";
import CoachSidebar from "./CoachSidebar";
import SocialLinks from "./SocialLinks";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

interface CoachLayoutProps {
  children: React.ReactNode;
}

export default function CoachLayout({ children }: CoachLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#7c3aed] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
        aria-label="Skip to main content">
        Skip to main content
      </a>

      <CoachSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center px-4 h-14 bg-white border-b border-gray-200"
        role="banner">
        <button onClick={() => setSidebarCollapsed(false)}
          className="p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2"
          aria-label="Open navigation menu">
          <span className="material-icons text-gray-700">menu</span>
        </button>
        <img src={LOGO_ICON} alt="" className="h-8 ml-3 rounded-lg" />
        <span className="ml-2 text-sm font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Coach Portal
        </span>
      </header>

      {/* Main content */}
      <main id="main-content" className="lg:ml-[240px] min-h-screen pt-14 lg:pt-0 flex flex-col"
        role="main" tabIndex={-1}>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>

        <footer className="text-center py-4 border-t border-gray-100 bg-white" role="contentinfo">
          <SocialLinks size={14} color="#9ca3af" className="flex items-center justify-center gap-4 mb-2" />
          <p className="text-[11px] text-gray-500">
            © 2026 RusingÂcademy — A Division of{" "}
            <span className="font-medium text-[#7c3aed]">Rusinga International Consulting Ltd.</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Version 2.0.0 — Coach Portal
          </p>
        </footer>
      </main>
    </div>
  );
}
