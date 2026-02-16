/*
 * RusingÂcademy Auth Page — "Institutional Elegance" Design
 * Swiss Modernist asymmetric split: Left brand showcase + Right glassmorphism auth
 * Color: Teal (#2A5C5A) + Cream (#F7F5F0) + Gold (#C9A96A)
 * Typography: DM Serif Display (headings) + Inter (UI)
 * Auth: Connected to Manus OAuth — primary "Sign In with Email" button.
 *       Google/Microsoft buttons show "coming soon" toast.
 *       Already-authenticated users are redirected to /dashboard automatically.
 */

import { useState, useEffect, useRef, useCallback } from "react";
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
  Info,
  Facebook,
  Instagram,
  Linkedin,
  GraduationCap,
  BookOpen,
  Zap,
} from "lucide-react";

const HERO_IMAGE =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/fhdSEAAjPWRDflyl.png";

/* ─── Animated Counter ─── */
function AnimatedCounter({
  target,
  duration = 2000,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
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
  const display = lang === "en" ? "English" : "Français";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
      >
        {display}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
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
    <svg width="18" height="18" viewBox="0 0 24 24">
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
    <svg width="18" height="18" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

/* ─── Main Auth Page ─── */
export default function Login() {
  const [, setLocation] = useLocation();
  const { loading, isAuthenticated } = useAuth();
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleOAuthLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      window.location.href = getLoginUrl();
    },
    []
  );

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

  const tags = [
    "ESL Program",
    "FSL Program",
    "CEFR A1→C1+",
    "Gamification",
    "SLE Prep",
  ];

  const stats = [
    { value: 12, label: "PATHS", icon: GraduationCap },
    { value: 192, label: "LESSONS", icon: BookOpen },
    { value: 1344, label: "ACTIVITIES", icon: Zap },
  ];

  const portals = [
    {
      name: t("Coach Portal", "Portail Coach"),
      icon: Users,
      color: "#6C5CE7",
      bgColor: "rgba(108, 92, 231, 0.08)",
      href: "/coach",
    },
    {
      name: t("Client Portal", "Portail Client"),
      icon: LayoutGrid,
      color: "#2A5C5A",
      bgColor: "rgba(42, 92, 90, 0.08)",
      href: "/hr",
    },
    {
      name: t("Admin Control", "Contrôle Admin"),
      icon: Shield,
      color: "#D63031",
      bgColor: "rgba(214, 48, 49, 0.08)",
      href: "/admin",
    },
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

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(160deg, #0F2B2B 0%, #1A3F3F 40%, #1E4A4A 70%, #163636 100%)",
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span
              className="text-white text-2xl font-bold"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              R
            </span>
          </div>
          <p className="text-white/60 text-sm">
            {t("Loading...", "Chargement...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ═══════════════════════════════════════════════════════
          LEFT PANEL — Brand Showcase (Warm Cream)
         ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="lg:w-[45%] w-full bg-[#F7F5F0] relative flex flex-col items-center justify-center px-8 py-12 lg:py-8 lg:px-12"
      >
        {/* Subtle decorative circles */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#2A5C5A]/[0.03] blur-2xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[#C9A96A]/[0.05] blur-2xl" />

        <div className="relative z-10 max-w-md w-full mx-auto space-y-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#2A5C5A] flex items-center justify-center shadow-lg shadow-[#2A5C5A]/20 mb-4">
              <span
                className="text-white text-2xl font-bold"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                R
              </span>
            </div>
            <h1
              className="text-3xl lg:text-4xl text-[#1a1a1a] tracking-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              RusingÂcademy
            </h1>
            <p className="text-[#2A5C5A] font-semibold text-sm mt-1 tracking-wide uppercase">
              {t("Learning Portal", "Portail d'apprentissage")}
            </p>
            <p className="text-[#555] text-sm mt-3 leading-relaxed max-w-xs">
              {t(
                "Master your second official language with Canada's premier bilingual training platform.",
                "Maîtrisez votre langue seconde officielle avec la première plateforme bilingue de formation au Canada."
              )}
            </p>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden shadow-xl shadow-black/10"
          >
            <img
              src={HERO_IMAGE}
              alt={t(
                "Professional learning session",
                "Session d'apprentissage professionnelle"
              )}
              className="w-full h-48 lg:h-56 object-cover"
            />
            {/* Live badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-[#333]">
                  {t("Live Learning Sessions", "Sessions en direct")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Program Tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {tags.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white text-[#2A5C5A] border border-[#2A5C5A]/15 shadow-sm hover:shadow-md hover:border-[#2A5C5A]/30 transition-all duration-200"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="grid grid-cols-3 gap-3"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-4 px-2 rounded-xl bg-white/70 border border-[#2A5C5A]/[0.08]"
              >
                <stat.icon className="w-4 h-4 text-[#2A5C5A]/50 mb-1.5" />
                <span
                  className="text-2xl font-bold text-[#2A5C5A]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  <AnimatedCounter target={stat.value} />
                </span>
                <span className="text-[10px] font-semibold text-[#888] tracking-widest mt-0.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT PANEL — Auth Form (Deep Teal Gradient)
         ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="lg:w-[55%] w-full relative flex flex-col items-center justify-center px-6 py-12 lg:py-8 lg:px-12 overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #0F2B2B 0%, #1A3F3F 40%, #1E4A4A 70%, #163636 100%)",
        }}
      >
        {/* Floating orbs */}
        <div className="absolute top-16 right-20 w-80 h-80 rounded-full bg-[#2A5C5A]/20 blur-[100px] animate-float-orb" />
        <div
          className="absolute bottom-20 left-10 w-60 h-60 rounded-full bg-[#C9A96A]/10 blur-[80px] animate-float-orb"
          style={{ animationDelay: "-7s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-[#3B8686]/15 blur-[60px] animate-float-orb"
          style={{ animationDelay: "-13s" }}
        />

        {/* Language Switcher */}
        <div className="absolute top-5 right-6 z-20">
          <LanguageSwitcher lang={language} setLang={setLanguage} />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-6">
          {/* Auth Card — Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="glass-card-auth rounded-2xl p-8 animate-pulse-glow"
          >
            {/* Logo + Heading */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-4">
                <span
                  className="text-white text-xl font-bold"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  R
                </span>
              </div>
              <h2
                className="text-2xl text-white"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {t("Welcome Back", "Bon retour")}
              </h2>
              <p className="text-[#7FBFBF] text-sm mt-1">
                {t(
                  "Sign in to your RusingÂcademy account",
                  "Connectez-vous à votre compte RusingÂcademy"
                )}
              </p>
            </div>

            {/* SSO Buttons */}
            <div className="space-y-3 mb-5">
              <button
                onClick={() => handleSocialLogin("Google")}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white text-[#333] text-sm font-medium shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
              >
                <GoogleIcon />
                {t("Continue with Google", "Continuer avec Google")}
              </button>
              <button
                onClick={() => handleSocialLogin("Microsoft")}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#2F2F2F] text-white text-sm font-medium shadow-sm hover:bg-[#3a3a3a] transition-all duration-200"
              >
                <MicrosoftIcon />
                {t("Continue with Microsoft", "Continuer avec Microsoft")}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-[#7FBFBF] text-xs font-medium tracking-wider uppercase">
                {t("Or continue with email", "Ou continuer par courriel")}
              </span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            {/* Email/Password Form */}
            <form className="space-y-4" onSubmit={handleOAuthLogin}>
              <div>
                <label className="block text-white/80 text-xs font-semibold mb-1.5 tracking-wide">
                  {t("Email Address", "Adresse courriel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Enter your email", "Entrez votre courriel")}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#3B8686] focus:bg-white/[0.08] focus:ring-1 focus:ring-[#3B8686]/50 transition-all duration-200"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white/80 text-xs font-semibold tracking-wide">
                    {t("Password", "Mot de passe")}
                  </label>
                  <a
                    href="#"
                    className="text-[#7FBFBF] text-xs font-medium hover:text-[#A0D8D8] transition-colors"
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
                    {t("Forgot password?", "Mot de passe oublié ?")}
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
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#3B8686] focus:bg-white/[0.08] focus:ring-1 focus:ring-[#3B8686]/50 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold shadow-lg shadow-[#2A5C5A]/30 hover:shadow-xl hover:shadow-[#2A5C5A]/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, #2A5C5A 0%, #3B8686 50%, #4A9E9E 100%)",
                }}
              >
                <LogIn className="w-4 h-4" />
                {t("Sign In with Email", "Se connecter par courriel")}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-white/50 text-xs mt-4">
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

          {/* Secure Redirect Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-white/40 text-xs"
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t(
                "You will be redirected to our secure authentication portal to sign in.",
                "Vous serez redirigé vers notre portail d'authentification sécurisé."
              )}
            </span>
          </motion.div>

          {/* FAQ Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-center"
          >
            <a
              href="#"
              className="text-[#7FBFBF] text-sm font-medium hover:text-[#A0D8D8] transition-colors underline underline-offset-4 decoration-[#7FBFBF]/30"
              onClick={(e) => {
                e.preventDefault();
                toast.info(
                  t(
                    "FAQ page coming soon!",
                    "Page FAQ bientôt disponible !"
                  )
                );
              }}
            >
              {t("Frequently Asked Questions", "Foire aux questions")}
            </a>
          </motion.div>

          {/* Portal Access Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p className="text-center text-white/30 text-[10px] font-semibold tracking-[0.2em] uppercase mb-3">
              {t("Access Other Portals", "Accéder aux autres portails")}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {portals.map((portal, i) => (
                <motion.button
                  key={portal.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  onClick={() => setLocation(portal.href)}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] hover:border-white/20 hover:scale-[1.03] transition-all duration-200 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: portal.bgColor }}
                  >
                    <portal.icon
                      className="w-5 h-5"
                      style={{ color: portal.color }}
                    />
                  </div>
                  <span className="text-white/70 text-[11px] font-medium group-hover:text-white/90 transition-colors">
                    {portal.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Social Links + Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col items-center gap-4 pt-2"
          >
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#C9A96A]/70 hover:text-[#C9A96A] hover:bg-[#C9A96A]/10 transition-all duration-200"
                >
                  <social.icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
            <p className="text-white/25 text-[10px] tracking-wide">
              © 2026 Rusinga International Consulting Ltd.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
