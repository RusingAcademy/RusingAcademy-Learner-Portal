/**
 * Login — RusingÂcademy Learning Portal
 * Design: Clean white light theme, accessible, LRDG-inspired
 */
import { useState } from "react";
import { useLocation } from "wouter";

const LOGO_FULL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/zDHqHOSjzqRLzEVj.png";
const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [language, setLanguage] = useState("English");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side — Light teal hero */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden" style={{
        background: "linear-gradient(160deg, #f0fafb 0%, #e0f4f5 40%, #d0eef0 100%)",
      }}>
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20" style={{
          background: "radial-gradient(circle, #008090, transparent)",
        }} />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-10" style={{
          background: "radial-gradient(circle, #f5a623, transparent)",
        }} />

        <div className="relative z-10 text-center max-w-md">
          <img src={LOGO_ICON} alt="RusingÂcademy" className="w-20 h-20 mx-auto mb-8 rounded-2xl shadow-lg" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            RusingÂcademy
          </h2>
          <p className="text-lg text-[#008090] font-medium mb-2">Learning Portal</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Master your second official language with Canada's premier bilingual training platform. 
            Expert coaching meets innovative technology.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {["ESL Program", "FSL Program", "CEFR A1→C1+", "Gamification", "SLE Prep"].map((f) => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full text-gray-700 font-medium bg-white/80 border border-gray-200 shadow-sm">
                {f}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: "12", label: "Paths" },
              { value: "192", label: "Lessons" },
              { value: "1,344", label: "Activities" },
            ].map((s) => (
              <div key={s.label} className="text-center bg-white/60 rounded-xl py-3 border border-gray-100">
                <div className="text-2xl font-bold text-[#008090]">{s.value}</div>
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

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">
                {language === "English" ? "Username" : "Nom d'utilisateur"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 border border-gray-200 bg-white text-gray-900 focus:border-[#008090] focus:ring-2 focus:ring-[#008090]/10"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">
                {language === "English" ? "Password" : "Mot de passe"} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm pr-10 outline-none transition-all duration-300 border border-gray-200 bg-white text-gray-900 focus:border-[#008090] focus:ring-2 focus:ring-[#008090]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <span className="material-icons text-gray-400 text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg bg-[#008090] hover:bg-[#006d7a]"
            >
              {language === "English" ? "Log In" : "Se connecter"}
            </button>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: "#008090" }}
                />
                <span className="text-sm text-gray-600">
                  {language === "English" ? "Stay Logged In" : "Rester connecté"}
                </span>
              </label>
              <button type="button" className="text-sm text-[#008090] hover:underline">
                {language === "English" ? "Reset Password" : "Réinitialiser"}
              </button>
            </div>

            <div className="text-center">
              <button type="button" className="text-sm text-[#008090] hover:underline">
                {language === "English" ? "Frequently Asked Questions" : "Questions fréquentes"}
              </button>
            </div>
          </form>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {[
              { icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", color: "#008090" },
              { icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", color: "#f5a623" },
              { icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", color: "#008090" },
            ].map((s, i) => (
              <a key={i} href="#" className="hover:opacity-70 transition-opacity">
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
