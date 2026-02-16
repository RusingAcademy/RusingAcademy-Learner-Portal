/**
 * Login — RusingÂcademy Ecosystem Auth Page
 * Design: Merged from two reference designs:
 *   - Left panel: branding hero with student photo, feature pills, stats
 *   - Right panel: glassmorphism auth card with Google/Microsoft, email/password, portal access
 * Auth: Connected to Manus OAuth — primary "Log In with RusingÂcademy" button.
 *       Google/Microsoft buttons show "coming soon" toast.
 *       Already-authenticated users are redirected to /dashboard automatically.
 */
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const LOGO_FULL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/zDHqHOSjzqRLzEVj.png";
const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";
const HERO_STUDENT = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/HgwxBoyVaSLVHBYE.jpg";

/* ─── Typewriter hook ─── */
function useTypewriter(texts: string[], speed = 60, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    if (!deleting && charIdx <= current.length) {
      const t = setTimeout(() => {
        setDisplay(current.slice(0, charIdx));
        setCharIdx((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else if (!deleting && charIdx > current.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    } else if (deleting && charIdx > 0) {
      const t = setTimeout(() => {
        setCharIdx((c) => c - 1);
        setDisplay(current.slice(0, charIdx - 1));
      }, speed / 2);
      return () => clearTimeout(t);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % texts.length);
    }
  }, [charIdx, deleting, idx, texts, speed, pause]);

  return display;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { loading, isAuthenticated } = useAuth();
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const typewriterTexts = language === "en"
    ? ["Master your second official language.", "Prepare for your SLE exams.", "Learn at your own pace."]
    : ["Maîtrisez votre langue seconde officielle.", "Préparez vos examens ELS.", "Apprenez à votre rythme."];
  const typed = useTypewriter(typewriterTexts, 50, 2500);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleOAuthLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = getLoginUrl();
  }, []);

  const handleEmailLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Email/password login redirects to OAuth as well
    window.location.href = getLoginUrl();
  }, []);

  const handleSocialLogin = useCallback((provider: string) => {
    toast.info(
      language === "en"
        ? `${provider} sign-in coming soon! Use "Log In with RusingÂcademy" for now.`
        : `Connexion ${provider} bientôt disponible ! Utilisez "Se connecter avec RusingÂcademy" pour l'instant.`
    );
  }, [language]);

  const t = useCallback((en: string, fr: string) => language === "en" ? en : fr, [language]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(135deg, #0a3d3f 0%, #0D7377 40%, #0a4a4d 100%)",
      }}>
        <div className="text-center">
          <img src={LOGO_ICON} alt="RusingÂcademy" className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg animate-pulse" />
          <p className="text-sm text-white/70">
            {t("Checking session...", "Vérification de la session...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{
      background: "linear-gradient(135deg, #0a3d3f 0%, #0D7377 40%, #0a4a4d 100%)",
    }}>
      {/* ═══ LEFT PANEL — Branding Hero ═══ */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-16 right-12 w-72 h-72 rounded-full opacity-20 pointer-events-none animate-pulse" style={{
          background: "radial-gradient(circle, #4dd0e1, transparent 70%)",
        }} />
        <div className="absolute bottom-24 left-8 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{
          background: "radial-gradient(circle, #f5a623, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite alternate",
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5 pointer-events-none" style={{
          background: "radial-gradient(circle, #ffffff, transparent 60%)",
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* Logo + Title */}
          <div className="text-center mb-6">
            <img src={LOGO_ICON} alt="RusingÂcademy" className="w-14 h-14 mx-auto mb-3 rounded-xl shadow-lg" />
            <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              RusingÂcademy
            </h2>
            <p className="text-sm font-medium text-emerald-300 tracking-wide">Learning Portal</p>
          </div>

          {/* Typewriter tagline in glassmorphism frame */}
          <div className="mx-auto max-w-sm mb-6 rounded-2xl px-6 py-4 text-center" style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}>
            <p className="text-white/90 text-sm leading-relaxed min-h-[1.5rem]">
              {typed}<span className="animate-pulse text-emerald-300">|</span>
            </p>
          </div>

          {/* Student photo */}
          <div className="flex-1 flex items-center justify-center px-4 mb-4">
            <div className="relative w-full max-w-sm">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{
                border: "3px solid rgba(255, 255, 255, 0.2)",
              }}>
                <img
                  src={HERO_STUDENT}
                  alt={t("Happy student learning online with RusingÂcademy", "Étudiante heureuse apprenant en ligne avec RusingÂcademy")}
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 shadow-lg flex items-center gap-2" style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white">
                  {t("Live Learning Sessions", "Sessions en direct")}
                </span>
              </div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {["ESL Program", "FSL Program", "CEFR A1→C1+", "Gamification", "SLE Prep"].map((f) => (
              <span key={f} className="text-[11px] px-3 py-1 rounded-full font-medium text-white/80" style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}>
                {f}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "12", label: t("Paths", "Parcours") },
              { value: "192", label: t("Lessons", "Leçons") },
              { value: "1,344", label: t("Activities", "Activités") },
            ].map((s) => (
              <div key={s.label} className="text-center rounded-xl py-2.5" style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}>
                <div className="text-xl font-bold text-emerald-300">{s.value}</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Auth Card ═══ */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Glassmorphism card */}
          <div className="rounded-3xl px-8 py-8 sm:px-10 sm:py-10" style={{
            background: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}>
            {/* Language Selector */}
            <div className="flex justify-end mb-5">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
                className="rounded-lg px-3 py-1.5 text-sm text-white/90 outline-none cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <option value="en" className="bg-gray-800 text-white">English</option>
                <option value="fr" className="bg-gray-800 text-white">Français</option>
              </select>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={LOGO_ICON} alt="RusingÂcademy" className="w-16 h-16 rounded-2xl shadow-lg" />
            </div>

            {/* Title */}
            <h1 className="text-center text-2xl font-bold text-white mb-1">
              {t("Welcome Back", "Bienvenue")}
            </h1>
            <p className="text-center text-sm text-white/60 mb-6">
              {t("Sign in to your RusingÂcademy account", "Connectez-vous à votre compte RusingÂcademy")}
            </p>

            {/* Social login buttons */}
            <div className="space-y-3 mb-5">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#333",
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("Continue with Google", "Continuer avec Google")}
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("Microsoft")}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md"
                style={{
                  background: "rgba(51, 51, 51, 0.9)",
                  color: "#fff",
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <rect fill="#F25022" x="1" y="1" width="10" height="10"/>
                  <rect fill="#7FBA00" x="13" y="1" width="10" height="10"/>
                  <rect fill="#00A4EF" x="1" y="13" width="10" height="10"/>
                  <rect fill="#FFB900" x="13" y="13" width="10" height="10"/>
                </svg>
                {t("Continue with Microsoft", "Continuer avec Microsoft")}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />
              <span className="text-xs text-emerald-300/80 uppercase tracking-wider font-medium">
                {t("or continue with email", "ou continuer par courriel")}
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleEmailLogin} className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  {t("Email Address", "Adresse courriel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Enter your email", "Entrez votre courriel")}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/40 outline-none transition-all focus:ring-2 focus:ring-emerald-400/50"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-white/80">
                    {t("Password", "Mot de passe")}
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info(t("Password reset coming soon!", "Réinitialisation bientôt disponible !"))}
                    className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
                  >
                    {t("Forgot password?", "Mot de passe oublié ?")}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Enter your password", "Entrez votre mot de passe")}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-white/40 outline-none transition-all focus:ring-2 focus:ring-emerald-400/50"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    <span className="material-icons text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Sign In button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                style={{
                  background: "linear-gradient(135deg, #0D7377 0%, #14919B 100%)",
                }}
              >
                {t("Sign In with Email", "Se connecter par courriel")}
              </button>
            </form>

            {/* OAuth primary button */}
            <button
              type="button"
              onClick={handleOAuthLogin}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
              }}
            >
              <span className="material-icons text-[18px]">login</span>
              {t("Log In with RusingÂcademy", "Se connecter avec RusingÂcademy")}
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-white/50">
              {t("Don't have an account?", "Pas encore de compte ?")}{" "}
              <button
                type="button"
                onClick={() => toast.info(t("Registration coming soon!", "Inscription bientôt disponible !"))}
                className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
              >
                {t("Sign up", "S'inscrire")}
              </button>
            </p>
          </div>

          {/* Portal Selector — below the card */}
          <div className="mt-6 px-2">
            <p className="text-center text-xs text-white/40 uppercase tracking-wider mb-3 font-medium">
              {t("Access Other Portals", "Accéder aux autres portails")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: t("Coach Portal", "Portail Coach"),
                  icon: "person",
                  gradient: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.05))",
                  border: "rgba(124,58,237,0.3)",
                  iconColor: "#a78bfa",
                  href: "/coach/portal",
                },
                {
                  label: t("Client Portal", "Portail Client"),
                  icon: "business",
                  gradient: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(37,99,235,0.05))",
                  border: "rgba(37,99,235,0.3)",
                  iconColor: "#60a5fa",
                  href: "/hr/portal",
                },
                {
                  label: t("Admin Control", "Contrôle Admin"),
                  icon: "admin_panel_settings",
                  gradient: "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(220,38,38,0.05))",
                  border: "rgba(220,38,38,0.3)",
                  iconColor: "#f87171",
                  href: "/admin/control",
                },
              ].map((portal) => (
                <button
                  key={portal.href}
                  type="button"
                  onClick={() => setLocation(portal.href)}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 hover:scale-105 group"
                  style={{
                    background: portal.gradient,
                    border: `1px solid ${portal.border}`,
                  }}
                >
                  <span className="material-icons text-[22px] transition-transform group-hover:scale-110" style={{ color: portal.iconColor }}>
                    {portal.icon}
                  </span>
                  <span className="text-[10px] font-semibold text-white/70 leading-tight text-center">
                    {portal.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-5 mt-6">
            {[
              { icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", href: "https://www.facebook.com/people/Rusing%C3%82cademy/100063464145177/", label: "Facebook" },
              { icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", href: "https://www.instagram.com/barholex/", label: "Instagram" },
              { icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", href: "https://www.linkedin.com/company/rusing%C3%A2cademy/?viewAsMember=true", label: "LinkedIn" },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-white/40 hover:text-white/80 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d={s.icon} /></svg>
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-white/30 mt-4">
            © 2026 Rusinga International Consulting Ltd.
          </p>
        </div>
      </div>

      {/* ═══ MOBILE: Branding below auth on small screens ═══ */}
      <style>{`
        @media (max-width: 1023px) {
          .min-h-screen.flex {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
