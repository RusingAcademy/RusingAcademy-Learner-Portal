/*
 * RusingÂcademy Auth Page — "Institutional Elegance" v4
 * Single-viewport design: 100vh, no scrolling, 1440×900 / 1366×768 optimized.
 * Left: CSS MacBook mockup with REAL dashboard screenshot (pixel-perfect, readable).
 * Right: Glassmorphism auth card on deep teal gradient.
 * Color: Teal (#2A5C5A) + Cream (#F7F5F0) + Gold (#C9A96A)
 * Typography: DM Serif Display (headings) + Inter (UI)
 * Auth: Connected to Manus OAuth — primary "Sign In with Email" button.
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  LogIn,
  ChevronDown,
  Users,
  LayoutGrid,
  Shield,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

/* ─── CDN Assets ─── */
const DASHBOARD_SCREENSHOT =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/VszWDDWmVcPrzvxa.png";

const LOGO_ICON =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/vOOwfivmRZqlQBIL.png";

/* ─── CSS MacBook Mockup Component ─── */
function MacBookMockup({ screenshot, alt }: { screenshot: string; alt: string }) {
  return (
    <div className="relative w-full" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ opacity: 0, rotateY: -8, scale: 0.92 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto"
        style={{ maxWidth: "100%" }}
      >
        {/* Screen bezel */}
        <div
          className="relative rounded-t-xl overflow-hidden mx-auto"
          style={{
            background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)",
            padding: "10px 10px 6px 10px",
            boxShadow:
              "0 -2px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Camera dot */}
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#3a3a3a] border border-[#2a2a2a]" />

          {/* Screen content — the REAL dashboard screenshot */}
          <div
            className="relative rounded-[4px] overflow-hidden"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)",
            }}
          >
            <img
              src={screenshot}
              alt={alt}
              className="w-full h-auto block"
              style={{
                imageRendering: "auto",
                WebkitFontSmoothing: "antialiased",
              }}
            />
            {/* Subtle screen glare for realism */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)",
              }}
            />
          </div>
        </div>

        {/* Bottom hinge / base */}
        <div
          className="mx-auto relative"
          style={{
            width: "110%",
            maxWidth: "110%",
            marginLeft: "-5%",
            height: "12px",
            background:
              "linear-gradient(180deg, #c0c0c0 0%, #a8a8a8 30%, #b8b8b8 70%, #d0d0d0 100%)",
            borderRadius: "0 0 8px 8px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {/* Notch indent */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: "18%",
              height: "4px",
              background:
                "linear-gradient(180deg, #999 0%, #b0b0b0 100%)",
              borderRadius: "0 0 4px 4px",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Language Switcher ─── */
function LanguageSwitcher({
  lang,
  setLang,
}: {
  lang: "en" | "fr";
  setLang: (l: "en" | "fr") => void;
}) {
  const [open, setOpen] = useState(false);
  const display = lang === "en" ? "EN" : "FR";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
      >
        {display}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  lang === l
                    ? "bg-[#2A5C5A]/10 text-[#2A5C5A] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {l === "en" ? "English" : "Français"}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Google Icon SVG ─── */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─── Microsoft Icon SVG ─── */
function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Auth Page — Single Viewport (100vh, no scroll)
   ═══════════════════════════════════════════════════════ */
export default function Login() {
  const [, setLocation] = useLocation();
  const { loading, isAuthenticated } = useAuth();
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleOAuthLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = getLoginUrl();
  }, []);

  const handleSocialLogin = useCallback(
    (provider: string) => {
      toast.info(
        language === "en"
          ? `${provider} sign-in coming soon! Use "Sign In with Email" for now.`
          : `Connexion ${provider} bientôt disponible ! Utilisez "Se connecter par courriel" pour l'instant.`
      );
    },
    [language]
  );

  const t = useCallback(
    (en: string, fr: string) => (language === "en" ? en : fr),
    [language]
  );

  const portals = [
    { name: t("Coach", "Coach"), icon: Users, color: "#6C5CE7" },
    { name: t("Client", "Client"), icon: LayoutGrid, color: "#2A5C5A" },
    { name: t("Admin", "Admin"), icon: Shield, color: "#D63031" },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/people/Rusing%C3%82cademy/100063464145177/",
      label: "Facebook",
    },
    {
      icon: Instagram,
      href: "https://www.instagram.com/barholex/",
      label: "Instagram",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/company/rusing%C3%A2cademy/?viewAsMember=true",
      label: "LinkedIn",
    },
  ];

  /* Loading state */
  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(160deg, #0F2B2B 0%, #1A3F3F 40%, #1E4A4A 70%, #163636 100%)",
        }}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <img
              src={LOGO_ICON}
              alt="RusingÂcademy"
              className="w-9 h-9 rounded-lg"
            />
          </div>
          <p className="text-white/60 text-xs">
            {t("Loading...", "Chargement...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ═══════════════════════════════════════════════════════
          LEFT PANEL — Product Showcase (52%)
          CSS MacBook mockup with REAL dashboard screenshot
         ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-[52%] relative items-center justify-center"
        style={{
          background:
            "linear-gradient(160deg, #F7F5F0 0%, #EDE9E0 50%, #F0ECE3 100%)",
        }}
      >
        {/* Subtle decorative elements */}
        <div className="absolute top-16 right-12 w-56 h-56 rounded-full bg-[#2A5C5A]/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-8 w-40 h-40 rounded-full bg-[#C9A96A]/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#2A5C5A]/[0.02] blur-[100px] pointer-events-none" />

        {/* TOP: Logo + Brand — centered above the MacBook */}
        <div className="relative z-20 flex flex-col items-center pt-2 mb-1">
          <img
            src={LOGO_ICON}
            alt="RusingÂcademy"
            className="w-16 h-16 rounded-2xl shadow-lg object-contain mb-1.5"
          />
          <h1
            className="text-xl text-[#1a1a1a] leading-tight text-center"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            RusingÂcademy
          </h1>
          <p className="text-[#2A5C5A] font-semibold text-[9px] tracking-[0.18em] uppercase">
            {t("Learning Portal", "Portail d'apprentissage")}
          </p>
        </div>

        {/* CENTER: MacBook Mockup — fills the panel */}
        <div className="relative z-10 w-full px-4 flex-1 flex items-center" style={{ marginTop: "-2vh" }}>
          <div className="w-full">
            <MacBookMockup
              screenshot={DASHBOARD_SCREENSHOT}
              alt={t(
                "RusingÂcademy Learning Portal Dashboard — ESL & FSL Programs, Progress Tracking, Leaderboard",
                "Tableau de bord du portail d'apprentissage RusingÂcademy — Programmes ALS & FLS, Suivi des progrès, Classement"
              )}
            />
          </div>
        </div>

        {/* BOTTOM: Tagline + Stats — centered below the MacBook */}
        <div className="relative z-20 pb-3 px-5">
          <p className="text-[#555] text-[10px] leading-relaxed mb-2 text-center max-w-md mx-auto">
            {t(
              "Master your second official language with Canada's premier bilingual training platform.",
              "Maîtrisez votre langue seconde officielle avec la première plateforme bilingue de formation au Canada."
            )}
          </p>
          <div className="flex items-center justify-center gap-6">
            {[
              { n: "12", l: t("Paths", "Parcours") },
              { n: "192", l: t("Lessons", "Leçons") },
              { n: "1,344", l: t("Activities", "Activités") },
            ].map((s) => (
              <div key={s.l} className="flex items-baseline gap-1.5">
                <span
                  className="text-lg font-bold text-[#2A5C5A]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {s.n}
                </span>
                <span className="text-[9px] font-semibold text-[#999] tracking-[0.12em] uppercase">
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT PANEL — Auth Form (Deep Teal Gradient, 48%)
          Compact: everything fits in one viewport
         ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="lg:w-[48%] w-full h-screen relative flex flex-col items-center justify-between px-6 py-4 lg:px-10 lg:py-4 overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #0F2B2B 0%, #1A3F3F 40%, #1E4A4A 70%, #163636 100%)",
        }}
      >
        {/* Floating orbs */}
        <div className="absolute top-10 right-16 w-64 h-64 rounded-full bg-[#2A5C5A]/20 blur-[80px] animate-float-orb pointer-events-none" />
        <div
          className="absolute bottom-16 left-8 w-48 h-48 rounded-full bg-[#C9A96A]/10 blur-[60px] animate-float-orb pointer-events-none"
          style={{ animationDelay: "-7s" }}
        />

        {/* ─── TOP: Language Switcher + Mobile Logo ─── */}
        <div className="w-full flex items-center justify-between z-20">
          {/* Mobile-only logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <img
              src={LOGO_ICON}
              alt="RusingÂcademy"
              className="w-8 h-8 rounded-lg"
            />
            <span
              className="text-white text-base"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              RusingÂcademy
            </span>
          </div>
          <div className="hidden lg:block" />
          <LanguageSwitcher lang={language} setLang={setLanguage} />
        </div>

        {/* ─── CENTER: Auth Card ─── */}
        <div className="relative z-10 w-full max-w-sm flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-card-auth rounded-2xl px-6 py-5 animate-pulse-glow"
          >
            {/* Heading */}
            <div className="text-center mb-3">
              <h2
                className="text-xl text-white"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {t("Welcome Back", "Bon retour")}
              </h2>
              <p className="text-[#7FBFBF] text-xs mt-0.5">
                {t(
                  "Sign in to your RusingÂcademy account",
                  "Connectez-vous à votre compte RusingÂcademy"
                )}
              </p>
            </div>

            {/* Email/Password Form */}
            <form className="space-y-2.5 mb-3" onSubmit={handleOAuthLogin}>
              <div>
                <label className="block text-white/80 text-[11px] font-semibold mb-1 tracking-wide">
                  {t("Email Address", "Adresse courriel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Enter your email", "Entrez votre courriel")}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#3B8686] focus:bg-white/[0.08] focus:ring-1 focus:ring-[#3B8686]/50 transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/80 text-[11px] font-semibold tracking-wide">
                    {t("Password", "Mot de passe")}
                  </label>
                  <a
                    href="#"
                    className="text-[#7FBFBF] text-[10px] font-medium hover:text-[#A0D8D8] transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(
                        t(
                          "Password reset coming soon!",
                          "Réinitialisation du mot de passe bientôt disponible !"
                        )
                      );
                    }}
                  >
                    {t("Forgot?", "Oublié ?")}
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t(
                      "Enter your password",
                      "Entrez votre mot de passe"
                    )}
                    className="w-full px-3 py-2 pr-9 rounded-lg bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#3B8686] focus:bg-white/[0.08] focus:ring-1 focus:ring-[#3B8686]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold shadow-lg shadow-[#2A5C5A]/30 hover:shadow-xl hover:shadow-[#2A5C5A]/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #2A5C5A 0%, #3B8686 50%, #4A9E9E 100%)",
                }}
              >
                <LogIn className="w-3.5 h-3.5" />
                {t("Sign In with Email", "Se connecter par courriel")}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-[#7FBFBF] text-[10px] font-medium tracking-wider uppercase">
                {t("Or", "Ou")}
              </span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            {/* SSO Buttons — compact row */}
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <button
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white text-[#333] text-xs font-medium shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                onClick={() => handleSocialLogin("Microsoft")}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#2F2F2F] text-white text-xs font-medium shadow-sm hover:bg-[#3a3a3a] transition-all"
              >
                <MicrosoftIcon />
                Microsoft
              </button>
            </div>

            {/* Sign Up */}
            <p className="text-center text-white/50 text-[11px]">
              {t("Don't have an account?", "Pas encore de compte ?")}{" "}
              <a
                href="#"
                className="text-[#C9A96A] font-semibold hover:text-[#D4B87A] transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = getLoginUrl();
                }}
              >
                {t("Sign up", "S'inscrire")}
              </a>
            </p>
          </motion.div>
        </div>

        {/* ─── BOTTOM: Portals + Social + Copyright ─── */}
        <div className="relative z-10 w-full max-w-sm space-y-2">
          {/* Portal Access — compact row */}
          <div>
            <p className="text-center text-white/25 text-[9px] font-semibold tracking-[0.2em] uppercase mb-1.5">
              {t("Other Portals", "Autres portails")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {portals.map((portal, i) => (
                <motion.button
                  key={portal.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  onClick={() => {
                    toast.info(
                      t(
                        `${portal.name} portal coming soon!`,
                        `Portail ${portal.name} bientôt disponible !`
                      )
                    );
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] hover:border-white/20 transition-all group"
                >
                  <portal.icon
                    className="w-3.5 h-3.5"
                    style={{ color: portal.color }}
                  />
                  <span className="text-white/60 text-[10px] font-medium group-hover:text-white/80 transition-colors">
                    {portal.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Social Links + Copyright */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#C9A96A]/60 hover:text-[#C9A96A] hover:bg-[#C9A96A]/10 transition-all"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
            <p className="text-white/20 text-[9px] tracking-wide">
              © 2026 Rusinga International Consulting Ltd.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
