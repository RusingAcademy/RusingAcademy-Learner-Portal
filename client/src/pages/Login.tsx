/**
 * Login — RusingÂcademy Learning Portal
 * Design: Clean white light theme, accessible, LRDG-inspired
 * Auth: Connected to Manus OAuth — the "Log In" button redirects to OAuth portal.
 *       Already-authenticated users are redirected to /dashboard automatically.
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const LOGO_FULL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/zDHqHOSjzqRLzEVj.png";
const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";
const HERO_STUDENT = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/HgwxBoyVaSLVHBYE.jpg";

export default function Login() {
  const [, setLocation] = useLocation();
  const { loading, isAuthenticated } = useAuth();
  const [language, setLanguage] = useState("English");

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Manus OAuth portal
    window.location.href = getLoginUrl();
  };

  // Show a loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <img src={LOGO_ICON} alt="RusingÂcademy" className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg animate-pulse" />
          <p className="text-sm text-gray-500">
            {language === "English" ? "Checking session..." : "Vérification de la session..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side — Hero with student photo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden" style={{
        background: "linear-gradient(160deg, #f0fafb 0%, #e0f4f5 40%, #d0eef0 100%)",
      }}>
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none" style={{
          background: "radial-gradient(circle, #008090, transparent)",
        }} />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{
          background: "radial-gradient(circle, #f5a623, transparent)",
        }} />

        {/* Top content: Logo + text */}
        <div className="relative z-10 text-center px-12 pt-12 pb-6 flex-shrink-0">
          <img src={LOGO_ICON} alt="RusingÂcademy" className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            RusingÂcademy
          </h2>
          <p className="text-base text-[#008090] font-medium mb-1">Learning Portal</p>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
            Master your second official language with Canada's premier bilingual training platform.
          </p>
        </div>

        {/* Student photo — centered and prominent */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-10 pb-4">
          <div className="relative w-full max-w-md">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white/80">
              <img
                src={HERO_STUDENT}
                alt="Happy student learning online with RusingÂcademy"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-1.5 shadow-lg border border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-700">
                {language === "English" ? "Live Learning Sessions" : "Sessions en direct"}
              </span>
            </div>
          </div>
        </div>

        {/* Feature pills + Stats */}
        <div className="relative z-10 px-12 pb-10 flex-shrink-0">
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {["ESL Program", "FSL Program", "CEFR A1→C1+", "Gamification", "SLE Prep"].map((f) => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full text-gray-700 font-medium bg-white/80 border border-gray-200 shadow-sm">
                {f}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "12", label: "Paths" },
              { value: "192", label: "Lessons" },
              { value: "1,344", label: "Activities" },
            ].map((s) => (
              <div key={s.label} className="text-center bg-white/60 rounded-xl py-2.5 border border-gray-100">
                <div className="text-xl font-bold text-[#008090]">{s.value}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Language Selector */}
          <div className="flex justify-end mb-8">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090] outline-none"
            >
              <option>English</option>
              <option>Français</option>
            </select>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img src={LOGO_FULL} alt="RusingÂcademy" className="h-20" />
          </div>

          {/* Title */}
          <h1 className="text-center text-lg font-medium text-gray-800 mb-8">
            {language === "English" ? "Log in to your Learning Portal." : "Connectez-vous à votre portail d'apprentissage."}
          </h1>

          {/* Login Form — redirects to Manus OAuth */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Info notice about OAuth */}
            <div className="bg-[#f0fafb] border border-[#008090]/15 rounded-xl px-4 py-3 mb-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="material-icons text-[#008090] align-middle mr-1" style={{ fontSize: "14px" }}>info</span>
                {language === "English"
                  ? "You will be redirected to our secure authentication portal to sign in."
                  : "Vous serez redirigé vers notre portail d'authentification sécurisé pour vous connecter."}
              </p>
            </div>

            <button
              type="submit"
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg bg-[#008090] hover:bg-[#006d7a] flex items-center justify-center gap-2"
            >
              <span className="material-icons" style={{ fontSize: "20px" }}>login</span>
              {language === "English" ? "Log In with RusingÂcademy" : "Se connecter avec RusingÂcademy"}
            </button>

            <div className="text-center">
              <button type="button" className="text-sm text-[#008090] hover:underline">
                {language === "English" ? "Frequently Asked Questions" : "Questions fréquentes"}
              </button>
            </div>
          </form>

          {/* Portal Selector */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400 uppercase tracking-wider mb-4 font-medium">
              {language === "English" ? "Access Other Portals" : "Accéder aux autres portails"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: language === "English" ? "Coach Portal" : "Portail Coach",
                  icon: "person",
                  color: "#7c3aed",
                  bg: "bg-violet-50 hover:bg-violet-100",
                  border: "border-violet-200",
                  href: "/coach/portal",
                },
                {
                  label: language === "English" ? "HR Portal" : "Portail RH",
                  icon: "business",
                  color: "#2563eb",
                  bg: "bg-blue-50 hover:bg-blue-100",
                  border: "border-blue-200",
                  href: "/hr/portal",
                },
                {
                  label: language === "English" ? "Admin Control" : "Contrôle Admin",
                  icon: "admin_panel_settings",
                  color: "#dc2626",
                  bg: "bg-red-50 hover:bg-red-100",
                  border: "border-red-200",
                  href: "/admin/control",
                },
              ].map((portal) => (
                <button
                  key={portal.href}
                  type="button"
                  onClick={() => setLocation(portal.href)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border ${portal.border} ${portal.bg} transition-all duration-200 hover:shadow-md group`}
                >
                  <span className="material-icons text-[22px] transition-transform group-hover:scale-110" style={{ color: portal.color }}>
                    {portal.icon}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-700 leading-tight text-center">
                    {portal.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {[
              { icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", color: "#008090", href: "https://www.facebook.com/people/Rusing%C3%82cademy/100063464145177/", label: "Facebook" },
              { icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", color: "#f5a623", href: "https://www.instagram.com/barholex/", label: "Instagram" },
              { icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", color: "#008090", href: "https://www.linkedin.com/company/rusing%C3%A2cademy/?viewAsMember=true", label: "LinkedIn" },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="hover:opacity-70 transition-opacity">
                <svg className="w-7 h-7" fill={s.color} viewBox="0 0 24 24"><path d={s.icon} /></svg>
              </a>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 RusingÂcademy — Barholex Media Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
