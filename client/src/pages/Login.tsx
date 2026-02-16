/*
 * RusingÂcademy Auth Page — "Institutional Elegance" v5
 * ─────────────────────────────────────────────────────
 * Full beautification rewrite.
 * Layout: 100vh, no scroll, asymmetric split (55% left / 45% right).
 * Left: Cream gradient with CSS MacBook mockup (dominant), real logo above, stats below.
 * Right: Deep teal gradient with glassmorphism auth card, floating orbs, micro-animations.
 * Brand: Teal (#2A5C5A) · Gold (#C9A96A) · Cream (#F7F5F0)
 * Typography: DM Serif Display (headings) + Inter (UI)
 * Auth: Manus OAuth — "Sign In with Email" primary CTA.
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
  Lock,
  Mail,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Trophy,
} from "lucide-react";

/* ─── CDN Assets ─── */
const DASHBOARD_SCREENSHOT =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/VszWDDWmVcPrzvxa.png";

const LOGO_ICON =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/vOOwfivmRZqlQBIL.png";

/* ─── Floating Orb ─── */
function FloatingOrb({
  size,
  color,
  top,
  left,
  delay,
}: {
  size: number;
  color: string;
  top: string;
  left: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={{
        y: [0, -15, 0, 12, 0],
        x: [0, 8, 0, -8, 0],
        scale: [1, 1.08, 1, 0.95, 1],
      }}
      transition={{
        duration: 12 + delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/* ─── CSS MacBook Mockup ─── */
function MacBookMockup({
  screenshot,
  alt,
}: {
  screenshot: string;
  alt: string;
}) {
  return (
    <div className="relative w-full" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ opacity: 0, rotateY: -6, scale: 0.94 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto"
      >
        {/* Screen bezel */}
        <div
          className="relative rounded-t-xl overflow-hidden mx-auto"
          style={{
            background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)",
            padding: "8px 8px 5px 8px",
            boxShadow:
              "0 -2px 30px rgba(0,0,0,0.2), 0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Camera dot */}
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#3a3a3a] border border-[#2a2a2a]" />

          {/* Screen — REAL dashboard screenshot */}
          <div
            className="relative rounded-[3px] overflow-hidden"
            style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)" }}
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
            {/* Screen glare */}
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
            width: "108%",
            maxWidth: "108%",
            marginLeft: "-4%",
            height: "10px",
            background:
              "linear-gradient(180deg, #c0c0c0 0%, #a8a8a8 30%, #b8b8b8 70%, #d0d0d0 100%)",
            borderRadius: "0 0 6px 6px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: "16%",
              height: "3px",
              background: "linear-gradient(180deg, #999 0%, #b0b0b0 100%)",
              borderRadius: "0 0 3px 3px",
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
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
      >
        {lang === "en" ? "EN" : "FR"}
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
            className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-xs transition-colors ${
                  lang === l
                    ? "bg-[#2A5C5A]/10 text-[#2A5C5A] font-semibold"
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

/* ─── Google Icon ─── */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ─── Microsoft Icon ─── */
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <img
              src={LOGO_ICON}
              alt="RusingÂcademy"
              className="w-10 h-10 rounded-lg"
            />
          </div>
          <p className="text-white/60 text-sm">
            {t("Loading...", "Chargement...")}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ═══════════════════════════════════════════════════════
          LEFT PANEL — Product Showcase (55%)
          Logo → MacBook Mockup → Stats
         ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:flex-col lg:w-[55%] h-full relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #F9F7F3 0%, #F0ECE3 40%, #EDE9E0 70%, #F5F2EC 100%)",
        }}
      >
        {/* Decorative blurs */}
        <div className="absolute top-12 right-8 w-64 h-64 rounded-full bg-[#2A5C5A]/[0.04] blur-[80px] pointer-events-none" />
        <div className="absolute bottom-16 left-4 w-48 h-48 rounded-full bg-[#C9A96A]/[0.06] blur-[60px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-[#2A5C5A]/[0.02] blur-[120px] pointer-events-none" />

        {/* ─── TOP: Logo + Brand ─── */}
        <div className="relative z-20 shrink-0 flex flex-col items-center justify-center gap-1 px-8 pt-3 pb-1">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            src={LOGO_ICON}
            alt="RusingÂcademy"
            className="w-12 h-12 rounded-xl shadow-md object-contain"
          />
          <div className="text-center">
            <h1
              className="text-2xl text-[#1a1a1a] leading-none"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              RusingÂcademy
            </h1>
            <p className="text-[#2A5C5A] font-bold text-[10px] tracking-[0.2em] uppercase mt-0.5">
              {t("Learning Portal", "Portail d'apprentissage")}
            </p>
          </div>
        </div>

        {/* ─── CENTER: MacBook Mockup (dominant, fills available space) ─── */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 min-h-0 overflow-hidden">
          <div className="w-full max-w-[520px]">
            <MacBookMockup
              screenshot={DASHBOARD_SCREENSHOT}
              alt={t(
                "RusingÂcademy Learning Portal Dashboard — ESL & FSL Programs, Progress Tracking, Leaderboard",
                "Tableau de bord du portail d'apprentissage RusingÂcademy — Programmes ALS & FLS, Suivi des progrès, Classement"
              )}
            />
          </div>
        </div>

        {/* ─── BOTTOM: Tagline + Stats ─── */}
        <div className="relative z-20 shrink-0 px-8 pb-4 pt-2 flex flex-col items-center text-center">
          <p className="text-[#666] text-[11px] leading-snug mb-2 max-w-md">
            {t(
              "Master your second official language with Canada's premier bilingual training platform.",
              "Maîtrisez votre langue seconde officielle avec la première plateforme bilingue de formation au Canada."
            )}
          </p>
          <div className="flex items-center justify-center gap-6">
            {[
              { n: "12", l: t("Paths", "Parcours"), icon: GraduationCap },
              { n: "192", l: t("Lessons", "Leçons"), icon: BookOpen },
              { n: "1,344", l: t("Activities", "Activités"), icon: Trophy },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2A5C5A]/[0.08] flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-[#2A5C5A]" />
                </div>
                <div>
                  <span
                    className="text-lg font-bold text-[#2A5C5A] leading-none block"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    {s.n}
                  </span>
                  <span className="text-[8px] font-semibold text-[#999] tracking-[0.1em] uppercase">
                    {s.l}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT PANEL — Auth Form (45%)
          Deep teal gradient + glassmorphism card
         ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 lg:w-[45%] h-full flex flex-col items-center justify-center relative overflow-hidden px-6"
        style={{
          background:
            "linear-gradient(160deg, #0F2B2B 0%, #1A3F3F 35%, #1E4A4A 65%, #163636 100%)",
        }}
      >
        {/* Floating orbs */}
        <FloatingOrb size={200} color="rgba(42,92,90,0.25)" top="-5%" left="60%" delay={0} />
        <FloatingOrb size={160} color="rgba(201,169,106,0.12)" top="70%" left="-10%" delay={2} />
        <FloatingOrb size={120} color="rgba(42,92,90,0.15)" top="40%" left="80%" delay={4} />

        {/* Language Switcher — top right */}
        <div className="absolute top-4 right-4 z-30">
          <LanguageSwitcher lang={language} setLang={setLanguage} />
        </div>

        {/* ─── Glassmorphism Auth Card ─── */}
        <div className="relative z-10 w-full max-w-[380px] flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-6 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05) inset",
            }}
          >
            {/* Card Header */}
            <div className="text-center mb-5">
              <h2
                className="text-2xl text-white leading-tight mb-1"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {t("Welcome Back", "Bon retour")}
              </h2>
              <p className="text-white/50 text-xs">
                {t(
                  "Sign in to continue your learning journey",
                  "Connectez-vous pour continuer votre parcours"
                )}
              </p>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleOAuthLogin} className="space-y-3 mb-4">
              {/* Email */}
              <div>
                <label className="block text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-1.5">
                  {t("Email", "Courriel")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("your@email.com", "votre@courriel.com")}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C9A96A]/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-white/40 text-[10px] font-semibold tracking-wider uppercase">
                    {t("Password", "Mot de passe")}
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(
                        t(
                          "Password reset coming soon!",
                          "Réinitialisation bientôt disponible !"
                        )
                      );
                    }}
                    className="text-[#C9A96A]/60 text-[10px] hover:text-[#C9A96A] transition-colors"
                  >
                    {t("Forgot?", "Oublié ?")}
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C9A96A]/50 focus:bg-white/[0.08] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-[#2A5C5A]/30 hover:shadow-xl hover:shadow-[#2A5C5A]/40 hover:scale-[1.01] active:scale-[0.99] transition-all mt-1"
                style={{
                  background:
                    "linear-gradient(135deg, #2A5C5A 0%, #3B8686 50%, #4A9E9E 100%)",
                }}
              >
                <LogIn className="w-4 h-4" />
                {t("Sign In with Email", "Se connecter par courriel")}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-[10px] font-semibold tracking-wider uppercase">
                {t("Or continue with", "Ou continuer avec")}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white text-[#333] text-xs font-semibold shadow-sm hover:shadow-lg hover:bg-gray-50 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                onClick={() => handleSocialLogin("Microsoft")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#2F2F2F] text-white text-xs font-semibold shadow-sm hover:bg-[#3a3a3a] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <MicrosoftIcon />
                Microsoft
              </button>
            </div>

            {/* Sign Up */}
            <p className="text-center text-white/40 text-xs">
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

          {/* ─── Portal Access + Social + Copyright ─── */}
          <div className="mt-5 space-y-3">
            {/* Portal Access */}
            <div>
              <p className="text-center text-white/20 text-[9px] font-semibold tracking-[0.2em] uppercase mb-2">
                {t("Other Portals", "Autres portails")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: t("Coach", "Coach"), icon: Users, color: "#6C5CE7" },
                  {
                    name: t("Client", "Client"),
                    icon: LayoutGrid,
                    color: "#2A5C5A",
                  },
                  { name: t("Admin", "Admin"), icon: Shield, color: "#D63031" },
                ].map((portal, i) => (
                  <motion.button
                    key={portal.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    onClick={() => {
                      toast.info(
                        t(
                          `${portal.name} portal coming soon!`,
                          `Portail ${portal.name} bientôt disponible !`
                        )
                      );
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/15 transition-all group"
                  >
                    <portal.icon
                      className="w-3.5 h-3.5"
                      style={{ color: portal.color }}
                    />
                    <span className="text-white/50 text-[10px] font-medium group-hover:text-white/70 transition-colors">
                      {portal.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Social + Copyright */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {[
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
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#C9A96A]/50 hover:text-[#C9A96A] hover:bg-[#C9A96A]/10 transition-all"
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
              <p className="text-white/15 text-[9px] tracking-wide">
                © 2026 Rusinga International Consulting Ltd.
              </p>
            </div>
          </div>
        </div>

        {/* Secure redirect notice */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
          <p className="text-white/15 text-[8px] tracking-wide flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            {t(
              "Secured by Manus OAuth · 256-bit encryption",
              "Sécurisé par Manus OAuth · Chiffrement 256 bits"
            )}
          </p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE FALLBACK — shown on small screens
         ═══════════════════════════════════════════════════════ */}
      <div
        className="lg:hidden h-full flex flex-col items-center justify-center px-6 py-8"
        style={{
          background:
            "linear-gradient(160deg, #0F2B2B 0%, #1A3F3F 40%, #1E4A4A 70%, #163636 100%)",
        }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="text-center mb-6">
            <img
              src={LOGO_ICON}
              alt="RusingÂcademy"
              className="w-14 h-14 rounded-2xl shadow-lg mx-auto mb-3"
            />
            <h1
              className="text-2xl text-white"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              RusingÂcademy
            </h1>
            <p className="text-[#C9A96A] font-bold text-[10px] tracking-[0.2em] uppercase mt-1">
              {t("Learning Portal", "Portail d'apprentissage")}
            </p>
          </div>

          {/* Mobile Auth Form */}
          <form onSubmit={handleOAuthLogin} className="space-y-3 mb-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("your@email.com", "votre@courriel.com")}
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C9A96A]/50 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C9A96A]/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #2A5C5A 0%, #3B8686 50%, #4A9E9E 100%)",
              }}
            >
              <LogIn className="w-4 h-4" />
              {t("Sign In with Email", "Se connecter par courriel")}
            </button>
          </form>

          {/* Mobile SSO */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-[#333] text-xs font-semibold"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              onClick={() => handleSocialLogin("Microsoft")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2F2F2F] text-white text-xs font-semibold"
            >
              <MicrosoftIcon />
              Microsoft
            </button>
          </div>

          {/* Mobile Sign Up */}
          <p className="text-center text-white/40 text-xs">
            {t("Don't have an account?", "Pas encore de compte ?")}{" "}
            <a
              href="#"
              className="text-[#C9A96A] font-semibold"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = getLoginUrl();
              }}
            >
              {t("Sign up", "S'inscrire")}
            </a>
          </p>

          {/* Mobile Copyright */}
          <p className="text-center text-white/15 text-[9px] mt-6">
            © 2026 Rusinga International Consulting Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
