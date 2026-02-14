/**
 * DashboardLayout — RusingÂcademy Learning Portal
 * Design: Clean white sidebar (240px), white main area, LRDG-inspired light theme
 * Accessibility: ARIA landmarks, skip-to-content, focus management
 */
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Close sidebar on Escape key
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
      {/* Skip to content link — WCAG 2.1 */}
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#008090] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
        aria-label="Skip to main content">
        Skip to main content
      </a>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center px-4 h-14 bg-white border-b border-gray-200"
        role="banner" aria-label="Mobile navigation header">
        <button onClick={() => setSidebarCollapsed(false)}
          className="p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008090] focus:ring-offset-2"
          aria-label="Open navigation menu"
          aria-expanded={!sidebarCollapsed}>
          <span className="material-icons text-gray-700" aria-hidden="true">menu</span>
        </button>
        <img src={LOGO_ICON} alt="" className="h-8 ml-3 rounded-lg" aria-hidden="true" />
        <span className="ml-2 text-sm font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          RusingÂcademy
        </span>
      </header>

      {/* Main content */}
      <main id="main-content" className="lg:ml-[240px] min-h-screen pt-14 lg:pt-0 flex flex-col"
        role="main" aria-label="Main content area" tabIndex={-1}>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-gray-100 bg-white" role="contentinfo">
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
