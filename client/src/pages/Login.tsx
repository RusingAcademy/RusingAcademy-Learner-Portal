/*
 * RusingÂcademy Auth Page — "Institutional Elegance" v6
 * ─────────────────────────────────────────────────────
 * Native email/password authentication — no Manus OAuth.
 * Layout: 100vh, no scroll, asymmetric split (55% left / 45% right).
 * Left: Cream gradient with CSS MacBook mockup (dominant), real logo above, stats below.
 * Right: Deep teal gradient with glassmorphism auth card, floating orbs, micro-animations.
 * Brand: Teal (#2A5C5A) · Gold (#C9A96A) · Cream (#F7F5F0)
 * Typography: DM Serif Display (headings) + Inter (UI)
 * Auth modes: Sign In | Sign Up | Forgot Password | Reset Password
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
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
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Trophy,
  UserPlus,
  KeyRound,
  User,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* ─── CDN Assets ─── */
const DASHBOARD_SCREENSHOT =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/VszWDDWmVcPrzvxa.png";

const LOGO_ICON =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/vOOwfivmRZqlQBIL.png";

/* ─── Auth mode type ─── */
type AuthMode = "signin" | "signup" | "forgot" | "reset-success";

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

/* ─── Realistic MacBook Keyboard ─── */
const KEY_STYLE: React.CSSProperties = {
  background: "linear-gradient(180deg, #333 0%, #252525 40%, #1e1e1e 100%)",
  borderRadius: "2px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#b0b0b0",
  fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
  fontWeight: 400,
  lineHeight: 1,
  userSelect: "none" as const,
  boxShadow: "0 0.5px 1px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.06), inset 0 -0.5px 0 rgba(0,0,0,0.2)",
  position: "relative" as const,
  overflow: "hidden" as const,
};

function Key({ label, w, h = 9, fontSize = 3.5 }: { label: string; w?: string; h?: number; fontSize?: number }) {
  return (
    <div
      className="flex-1"
      style={{
        ...KEY_STYLE,
        height: `${h}px`,
        fontSize: `${fontSize}px`,
        letterSpacing: "0.2px",
        ...(w ? { flex: "none", width: w } : {}),
      }}
    >
      {label}
    </div>
  );
}

function FnKey({ label }: { label: string }) {
  return (
    <div
      className="flex-1"
      style={{
        ...KEY_STYLE,
        height: "6px",
        fontSize: "2.5px",
        letterSpacing: "0.1px",
      }}
    >
      {label}
    </div>
  );
}

function RealisticKeyboard() {
  return (
    <div className="flex flex-col gap-[1.5px]">
      {/* Row 0 — Touch Bar / Function keys */}
      <div className="flex gap-[1.5px]">
        <FnKey label="esc" />
        <FnKey label="F1" />
        <FnKey label="F2" />
        <FnKey label="F3" />
        <FnKey label="F4" />
        <FnKey label="F5" />
        <FnKey label="F6" />
        <FnKey label="F7" />
        <FnKey label="F8" />
        <FnKey label="F9" />
        <FnKey label="F10" />
        <FnKey label="F11" />
        <FnKey label="F12" />
        <div className="flex-1" style={{ ...KEY_STYLE, height: "6px", fontSize: "2.5px" }}>
          <svg width="5" height="3" viewBox="0 0 10 6" fill="none"><circle cx="5" cy="3" r="2.5" stroke="#888" strokeWidth="0.8" fill="none" /></svg>
        </div>
      </div>

      {/* Row 1 — Number row */}
      <div className="flex gap-[1.5px]">
        <Key label="`" />
        <Key label="1" />
        <Key label="2" />
        <Key label="3" />
        <Key label="4" />
        <Key label="5" />
        <Key label="6" />
        <Key label="7" />
        <Key label="8" />
        <Key label="9" />
        <Key label="0" />
        <Key label="-" />
        <Key label="=" />
        <Key label="delete" w="9.5%" fontSize={2.8} />
      </div>

      {/* Row 2 — QWERTY */}
      <div className="flex gap-[1.5px]">
        <Key label="tab" w="9%" fontSize={2.8} />
        <Key label="Q" />
        <Key label="W" />
        <Key label="E" />
        <Key label="R" />
        <Key label="T" />
        <Key label="Y" />
        <Key label="U" />
        <Key label="I" />
        <Key label="O" />
        <Key label="P" />
        <Key label="[" />
        <Key label="]" />
        <Key label="\\" />
      </div>

      {/* Row 3 — ASDF */}
      <div className="flex gap-[1.5px]">
        <Key label="caps" w="11%" fontSize={2.8} />
        <Key label="A" />
        <Key label="S" />
        <Key label="D" />
        <Key label="F" />
        <Key label="G" />
        <Key label="H" />
        <Key label="J" />
        <Key label="K" />
        <Key label="L" />
        <Key label=";" />
        <Key label="'" />
        <Key label="return" w="11%" fontSize={2.8} />
      </div>

      {/* Row 4 — ZXCV */}
      <div className="flex gap-[1.5px]">
        <Key label="shift" w="14%" fontSize={2.8} />
        <Key label="Z" />
        <Key label="X" />
        <Key label="C" />
        <Key label="V" />
        <Key label="B" />
        <Key label="N" />
        <Key label="M" />
        <Key label="," />
        <Key label="." />
        <Key label="/" />
        <Key label="shift" w="14%" fontSize={2.8} />
      </div>

      {/* Row 5 — Space bar row */}
      <div className="flex gap-[1.5px] items-end">
        <Key label="fn" w="5%" fontSize={2.5} />
        <Key label="ctrl" w="5%" fontSize={2.5} />
        <Key label="opt" w="5%" fontSize={2.5} />
        <Key label="cmd" w="7%" fontSize={2.5} />
        {/* Space bar */}
        <div
          className="flex-1"
          style={{
            ...KEY_STYLE,
            height: "9px",
          }}
        />
        <Key label="cmd" w="7%" fontSize={2.5} />
        <Key label="opt" w="5%" fontSize={2.5} />
        {/* Arrow keys — inverted T */}
        <div className="flex flex-col gap-[0.5px]" style={{ width: "10%", flexShrink: 0 }}>
          <div className="flex justify-center">
            <div style={{ ...KEY_STYLE, height: "4px", width: "33%", fontSize: "3px" }}>▲</div>
          </div>
          <div className="flex gap-[0.5px]">
            <div style={{ ...KEY_STYLE, height: "4px", flex: 1, fontSize: "3px" }}>◀</div>
            <div style={{ ...KEY_STYLE, height: "4px", flex: 1, fontSize: "3px" }}>▼</div>
            <div style={{ ...KEY_STYLE, height: "4px", flex: 1, fontSize: "3px" }}>▶</div>
          </div>
        </div>
      </div>
    </div>
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

        {/* Bottom hinge / lip */}
        <div
          className="mx-auto relative"
          style={{
            width: "101%",
            maxWidth: "101%",
            marginLeft: "-0.5%",
            height: "6px",
            background:
              "linear-gradient(180deg, #c0c0c0 0%, #a8a8a8 30%, #b8b8b8 70%, #d0d0d0 100%)",
            borderRadius: "0 0 2px 2px",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: "16%",
              height: "2px",
              background: "linear-gradient(180deg, #999 0%, #b0b0b0 100%)",
              borderRadius: "0 0 4px 4px",
            }}
          />
        </div>

        {/* Keyboard body */}
        <div
          className="mx-auto relative"
          style={{
            width: "102%",
            maxWidth: "102%",
            marginLeft: "-1%",
            background: "linear-gradient(180deg, #c8c8c8 0%, #b0b0b0 50%, #a0a0a0 100%)",
            borderRadius: "0 0 8px 8px",
            padding: "4px 6px 6px 6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%)",
              borderRadius: "3px",
              padding: "4px 3px",
            }}
          >
            <RealisticKeyboard />
          </div>

          {/* Trackpad */}
          <div
            className="mx-auto mt-[3px]"
            style={{
              width: "42%",
              height: "28px",
              background: "linear-gradient(180deg, #b8b8b8 0%, #a8a8a8 100%)",
              borderRadius: "3px",
              boxShadow: "inset 0 0.5px 1px rgba(0,0,0,0.1), 0 0.5px 0 rgba(255,255,255,0.3)",
              border: "0.5px solid rgba(0,0,0,0.1)",
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
  const [name, setName] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* tRPC mutations */
  const signinMutation = trpc.nativeAuth.signin.useMutation();
  const signupMutation = trpc.nativeAuth.signup.useMutation();
  const resetMutation = trpc.nativeAuth.requestReset.useMutation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  const t = useCallback(
    (en: string, fr: string) => (language === "en" ? en : fr),
    [language]
  );

  /* ─── Handle Sign In ─── */
  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        toast.error(t("Please fill in all fields.", "Veuillez remplir tous les champs."));
        return;
      }
      setIsSubmitting(true);
      try {
        await signinMutation.mutateAsync({ email, password });
        toast.success(t("Welcome back!", "Bon retour !"));
        // Force reload to pick up the new session cookie
        window.location.href = "/dashboard";
      } catch (err: any) {
        const msg = err?.message || t("Sign in failed.", "Échec de la connexion.");
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, signinMutation, t]
  );

  /* ─── Handle Sign Up ─── */
  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !email || !password) {
        toast.error(t("Please fill in all fields.", "Veuillez remplir tous les champs."));
        return;
      }
      if (password.length < 8) {
        toast.error(
          t(
            "Password must be at least 8 characters.",
            "Le mot de passe doit contenir au moins 8 caractères."
          )
        );
        return;
      }
      setIsSubmitting(true);
      try {
        await signupMutation.mutateAsync({ name, email, password });
        toast.success(t("Account created! Signing you in...", "Compte créé ! Connexion en cours..."));
        window.location.href = "/dashboard";
      } catch (err: any) {
        const msg = err?.message || t("Sign up failed.", "Échec de l'inscription.");
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, email, password, signupMutation, t]
  );

  /* ─── Handle Forgot Password ─── */
  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
        toast.error(t("Please enter your email.", "Veuillez entrer votre courriel."));
        return;
      }
      setIsSubmitting(true);
      try {
        await resetMutation.mutateAsync({ email });
        setAuthMode("reset-success");
      } catch (err: any) {
        toast.error(t("Something went wrong.", "Une erreur est survenue."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, resetMutation, t]
  );

  /* ─── Switch mode helper ─── */
  const switchMode = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setPassword("");
    setName("");
    setShowPassword(false);
  }, []);

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

  /* ─── Auth Card Content (shared between desktop and mobile) ─── */
  const renderAuthCard = (isMobile: boolean) => {
    const inputClass = `w-full pl-10 pr-3 py-${isMobile ? "3" : "2.5"} rounded-${isMobile ? "xl" : "lg"} bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C9A96A]/50 focus:bg-white/[0.08] transition-all`;
    const passwordInputClass = `w-full pl-10 pr-10 py-${isMobile ? "3" : "2.5"} rounded-${isMobile ? "xl" : "lg"} bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C9A96A]/50 focus:bg-white/[0.08] transition-all`;

    /* ─── Reset Success ─── */
    if (authMode === "reset-success") {
      return (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <h2
            className="text-2xl text-white leading-tight mb-2"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {t("Check Your Email", "Vérifiez votre courriel")}
          </h2>
          <p className="text-white/50 text-xs mb-6 leading-relaxed">
            {t(
              "If an account exists with this email, you will receive a password reset link shortly.",
              "Si un compte existe avec ce courriel, vous recevrez un lien de réinitialisation sous peu."
            )}
          </p>
          <button
            onClick={() => switchMode("signin")}
            className="flex items-center justify-center gap-2 mx-auto text-[#C9A96A] text-sm font-semibold hover:text-[#D4B87A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Back to Sign In", "Retour à la connexion")}
          </button>
        </div>
      );
    }

    /* ─── Forgot Password ─── */
    if (authMode === "forgot") {
      return (
        <>
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-[#C9A96A]/20 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6 text-[#C9A96A]" />
            </div>
            <h2
              className="text-2xl text-white leading-tight mb-1"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {t("Reset Password", "Réinitialiser le mot de passe")}
            </h2>
            <p className="text-white/50 text-xs">
              {t(
                "Enter your email and we'll send you a reset link.",
                "Entrez votre courriel et nous vous enverrons un lien de réinitialisation."
              )}
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-3 mb-4">
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
                  className={inputClass}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-[#C9A96A]/20 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, #C9A96A 0%, #B8944F 50%, #A8843F 100%)",
              }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {t("Send Reset Link", "Envoyer le lien")}
            </button>
          </form>

          <button
            onClick={() => switchMode("signin")}
            className="flex items-center justify-center gap-2 mx-auto text-white/40 text-xs hover:text-white/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("Back to Sign In", "Retour à la connexion")}
          </button>
        </>
      );
    }

    /* ─── Sign In / Sign Up ─── */
    const isSignUp = authMode === "signup";
    const handleSubmit = isSignUp ? handleSignUp : handleSignIn;

    return (
      <>
        {/* Card Header */}
        <div className="text-center mb-5">
          <h2
            className="text-2xl text-white leading-tight mb-1"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {isSignUp
              ? t("Create Account", "Créer un compte")
              : t("Welcome Back", "Bon retour")}
          </h2>
          <p className="text-white/50 text-xs">
            {isSignUp
              ? t(
                  "Start your bilingual learning journey today",
                  "Commencez votre parcours bilingue dès aujourd'hui"
                )
              : t(
                  "Sign in to continue your learning journey",
                  "Connectez-vous pour continuer votre parcours"
                )}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          {/* Name (signup only) */}
          <AnimatePresence mode="popLayout">
            {isSignUp && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-1.5">
                  {t("Full Name", "Nom complet")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("John Doe", "Jean Dupont")}
                    className={inputClass}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                className={inputClass}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-white/40 text-[10px] font-semibold tracking-wider uppercase">
                {t("Password", "Mot de passe")}
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-[#C9A96A]/60 text-[10px] hover:text-[#C9A96A] transition-colors"
                >
                  {t("Forgot?", "Oublié ?")}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? t("Min. 8 characters", "Min. 8 caractères") : "••••••••"}
                className={passwordInputClass}
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
            {isSignUp && (
              <p className="text-white/25 text-[9px] mt-1">
                {t("Minimum 8 characters required", "Minimum 8 caractères requis")}
              </p>
            )}
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-[#2A5C5A]/30 hover:shadow-xl hover:shadow-[#2A5C5A]/40 hover:scale-[1.01] active:scale-[0.99] transition-all mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, #2A5C5A 0%, #3B8686 50%, #4A9E9E 100%)",
            }}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isSignUp
              ? t("Create Account", "Créer un compte")
              : t("Sign In", "Se connecter")}
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <p className="text-center text-white/40 text-xs">
          {isSignUp
            ? t("Already have an account?", "Déjà un compte ?")
            : t("Don't have an account?", "Pas encore de compte ?")}{" "}
          <button
            onClick={() => switchMode(isSignUp ? "signin" : "signup")}
            className="text-[#C9A96A] font-semibold hover:text-[#D4B87A] transition-colors"
          >
            {isSignUp
              ? t("Sign in", "Se connecter")
              : t("Sign up", "S'inscrire")}
          </button>
        </p>
      </>
    );
  };

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
          <div className="w-full max-w-[600px]">
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
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderAuthCard(false)}
              </motion.div>
            </AnimatePresence>
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

        {/* Secure notice — NO Manus reference */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
          <p className="text-white/15 text-[8px] tracking-wide flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            {t(
              "Secured connection · 256-bit encryption",
              "Connexion sécurisée · Chiffrement 256 bits"
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

          {/* Mobile Auth Card */}
          <div
            className="rounded-2xl p-5 backdrop-blur-xl mb-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderAuthCard(true)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Copyright */}
          <p className="text-center text-white/15 text-[9px] mt-6">
            © 2026 Rusinga International Consulting Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
