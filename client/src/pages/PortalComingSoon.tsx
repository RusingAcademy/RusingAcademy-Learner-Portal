/**
 * PortalComingSoon — Placeholder page for portals under construction
 * Used for Coach Portal, HR Portal, and Admin Control System
 */
import { useLocation } from "wouter";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

interface PortalConfig {
  title: string;
  titleFr: string;
  subtitle: string;
  subtitleFr: string;
  description: string;
  descriptionFr: string;
  icon: string;
  color: string;
  bgGradient: string;
  features: { en: string; fr: string }[];
}

const portalConfigs: Record<string, PortalConfig> = {
  coach: {
    title: "Coach Portal",
    titleFr: "Portail Coach",
    subtitle: "Manage your students, sessions & earnings",
    subtitleFr: "Gérez vos étudiants, sessions et revenus",
    description: "A dedicated workspace for RusingÂcademy language coaches to manage their teaching practice, track student progress, schedule sessions, and monitor earnings.",
    descriptionFr: "Un espace dédié aux coachs linguistiques de RusingÂcademy pour gérer leur pratique d'enseignement, suivre les progrès des étudiants, planifier des sessions et surveiller les revenus.",
    icon: "person",
    color: "#7c3aed",
    bgGradient: "linear-gradient(160deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 100%)",
    features: [
      { en: "Student Management", fr: "Gestion des étudiants" },
      { en: "Session Scheduling", fr: "Planification des sessions" },
      { en: "Earnings Dashboard", fr: "Tableau de bord des revenus" },
      { en: "Profile & Availability", fr: "Profil et disponibilité" },
      { en: "Teaching Resources", fr: "Ressources pédagogiques" },
      { en: "Performance Analytics", fr: "Analytique de performance" },
    ],
  },
  hr: {
    title: "HR Portal",
    titleFr: "Portail RH",
    subtitle: "Manage team training & compliance",
    subtitleFr: "Gérez la formation d'équipe et la conformité",
    description: "A comprehensive HR management portal for organizational administrators to oversee team language training, track budgets, monitor SLE compliance, and generate reports.",
    descriptionFr: "Un portail complet de gestion RH pour les administrateurs organisationnels afin de superviser la formation linguistique de l'équipe, suivre les budgets, surveiller la conformité ELS et générer des rapports.",
    icon: "business",
    color: "#2563eb",
    bgGradient: "linear-gradient(160deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%)",
    features: [
      { en: "Team Overview", fr: "Aperçu de l'équipe" },
      { en: "Cohort Management", fr: "Gestion des cohortes" },
      { en: "Budget Tracking", fr: "Suivi du budget" },
      { en: "SLE Compliance", fr: "Conformité ELS" },
      { en: "Training Reports", fr: "Rapports de formation" },
      { en: "Department Analytics", fr: "Analytique départementale" },
    ],
  },
  admin: {
    title: "Admin Control System",
    titleFr: "Système de Contrôle Admin",
    subtitle: "Full platform management & analytics",
    subtitleFr: "Gestion complète de la plateforme et analytique",
    description: "The central command center for RusingÂcademy platform administrators. Manage users, content, commerce, marketing, analytics, and all system configurations from a single unified interface.",
    descriptionFr: "Le centre de commande central pour les administrateurs de la plateforme RusingÂcademy. Gérez les utilisateurs, le contenu, le commerce, le marketing, l'analytique et toutes les configurations système depuis une interface unifiée.",
    icon: "admin_panel_settings",
    color: "#dc2626",
    bgGradient: "linear-gradient(160deg, #fef2f2 0%, #fee2e2 40%, #fecaca 100%)",
    features: [
      { en: "User & Role Management", fr: "Gestion des utilisateurs et rôles" },
      { en: "Course Builder", fr: "Constructeur de cours" },
      { en: "Commerce & Pricing", fr: "Commerce et tarification" },
      { en: "Marketing & CRM", fr: "Marketing et CRM" },
      { en: "Live KPI Dashboard", fr: "Tableau de bord KPI en direct" },
      { en: "System Configuration", fr: "Configuration système" },
    ],
  },
};

export default function PortalComingSoon({ portalKey }: { portalKey: string }) {
  const [, setLocation] = useLocation();
  const config = portalConfigs[portalKey] || portalConfigs.coach;

  // Simple language detection from localStorage or default to English
  const lang = typeof window !== "undefined" && localStorage.getItem("ra-language") === "fr" ? "fr" : "en";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side — Portal-themed hero */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: config.bgGradient }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${config.color}, transparent)` }}
        />
        <div
          className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${config.color}, transparent)` }}
        />

        <div className="relative z-10 text-center max-w-md">
          <div
            className="w-20 h-20 mx-auto mb-8 rounded-2xl shadow-lg flex items-center justify-center"
            style={{ backgroundColor: `${config.color}15`, border: `2px solid ${config.color}30` }}
          >
            <span className="material-icons text-[40px]" style={{ color: config.color }}>
              {config.icon}
            </span>
          </div>
          <h2
            className="text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {lang === "fr" ? config.titleFr : config.title}
          </h2>
          <p className="text-lg font-medium mb-2" style={{ color: config.color }}>
            {lang === "fr" ? config.subtitleFr : config.subtitle}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            {lang === "fr" ? config.descriptionFr : config.description}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {config.features.map((f) => (
              <span
                key={f.en}
                className="text-xs px-3 py-1.5 rounded-full text-gray-700 font-medium bg-white/80 border border-gray-200 shadow-sm"
              >
                {lang === "fr" ? f.fr : f.en}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side — Coming Soon */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <img src={LOGO_ICON} alt="RusingÂcademy" className="w-16 h-16 mx-auto mb-6 rounded-2xl shadow-md" />

          {/* Construction badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              backgroundColor: `${config.color}10`,
              color: config.color,
              border: `1.5px solid ${config.color}30`,
            }}
          >
            <span className="material-icons text-[18px]">construction</span>
            {lang === "fr" ? "En cours de développement" : "Under Development"}
          </div>

          <h1
            className="text-3xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {lang === "fr" ? "Bientôt disponible" : "Coming Soon"}
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            {lang === "fr"
              ? `Le ${config.titleFr} est actuellement en cours de construction. Nous travaillons à créer une expérience exceptionnelle pour vous.`
              : `The ${config.title} is currently being built. We're working on creating an exceptional experience for you.`}
          </p>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>{lang === "fr" ? "Progression" : "Progress"}</span>
              <span>Phase 0</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: "8%",
                  background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                }}
              />
            </div>
          </div>

          {/* Planned features preview */}
          <div className="text-left bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">
              {lang === "fr" ? "Fonctionnalités prévues" : "Planned Features"}
            </p>
            <div className="space-y-2">
              {config.features.map((f) => (
                <div key={f.en} className="flex items-center gap-2">
                  <span className="material-icons text-[14px] text-gray-300">radio_button_unchecked</span>
                  <span className="text-sm text-gray-600">{lang === "fr" ? f.fr : f.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#008090] hover:text-[#006d7a] transition-colors"
          >
            <span className="material-icons text-[18px]">arrow_back</span>
            {lang === "fr" ? "Retour au portail d'apprentissage" : "Back to Learning Portal"}
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-10">
            © 2026 RusingÂcademy — Barholex Media Inc.
          </p>
          <p className="text-center text-[10px] text-gray-300 mt-1">
            Rusinga International Consulting Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
