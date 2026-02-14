import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  MessageCircle,
  Clapperboard,
  Grid3X3,
  X,
  Bell,
  User,
  Settings,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";

// Platform configuration with internal routes
const PLATFORMS = [
  {
    slug: "rusingacademy",
    name: "RusingAcademy",
    taglineFr: "Formation B2B/B2G",
    taglineEn: "B2B/B2G Training",
    icon: GraduationCap,
    color: "#E07B39",
    bgGradient: "linear-gradient(135deg, #E07B39 0%, #C45E1A 100%)",
    url: "/rusingacademy",
  },
  {
    slug: "lingueefy",
    name: "Lingueefy",
    taglineFr: "Marketplace Coaching",
    taglineEn: "Coaching Marketplace",
    icon: MessageCircle,
    color: "#2DD4BF",
    bgGradient: "linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)",
    url: "/lingueefy",
  },
  {
    slug: "barholex",
    name: "Barholex Media",
    taglineFr: "Production Créative",
    taglineEn: "Creative Production",
    icon: Clapperboard,
    color: "#1A1A1A",
    bgGradient: "linear-gradient(135deg, #333333 0%, #1A1A1A 100%)",
    url: "/barholex",
  },
] as const;

type Platform = (typeof PLATFORMS)[number];

interface EcosystemSwitcherProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function EcosystemSwitcher({
  position = "bottom-right",
}: EcosystemSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [location] = useLocation();

  // Determine current platform based on URL
  const getCurrentPlatform = () => {
    if (location.startsWith("/rusingacademy")) return "rusingacademy";
    if (location.startsWith("/barholex")) return "barholex";
    if (location.startsWith("/lingueefy")) return "lingueefy";
    // Default to lingueefy for coach-related pages
    if (location.startsWith("/coaches") || location.startsWith("/coach")) return "lingueefy";
    return "lingueefy";
  };

  const currentPlatform = getCurrentPlatform();

  // Position styles
  const positionStyles = {
    "bottom-right": { bottom: "1.5rem", right: "1.5rem" },
    "bottom-left": { bottom: "1.5rem", left: "1.5rem" },
    "top-right": { top: "1.5rem", right: "1.5rem" },
    "top-left": { top: "1.5rem", left: "1.5rem" },
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div
      className="fixed z-50"
      style={positionStyles[position]}
      role="navigation"
      aria-label="Ecosystem Navigation"
    >
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Switcher Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "absolute p-6 w-80 mb-4",
                "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl",
                "border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl",
                position.includes("bottom") ? "bottom-full" : "top-full mt-4",
                position.includes("right") ? "right-0" : "left-0"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    Rusinga Ecosystem
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {language === "fr" ? "Naviguer entre les plateformes" : "Navigate between platforms"}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={language === "fr" ? "Fermer" : "Close"}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Platforms Grid */}
              <div className="space-y-3 mb-6">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isActive = platform.slug === currentPlatform;

                  return (
                    <Link key={platform.slug} href={platform.url}>
                      <motion.button
                        onClick={() => setIsOpen(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                          "border border-transparent hover:border-gray-200 dark:hover:border-zinc-700",
                          isActive
                            ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800"
                            : "hover:bg-white dark:hover:bg-zinc-800/50"
                        )}
                      >
                        {/* Platform Icon */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ background: platform.bgGradient }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Platform Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {platform.name}
                            </span>
                            {isActive && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                                {language === "fr" ? "Actif" : "Active"}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            {language === "fr" ? platform.taglineFr : platform.taglineEn}
                          </span>
                        </div>

                        {/* Arrow */}
                        <ChevronRight
                          className={cn(
                            "w-5 h-5 transition-transform",
                            isActive
                              ? "text-teal-600"
                              : "text-gray-400 group-hover:translate-x-1"
                          )}
                        />
                      </motion.button>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 dark:bg-zinc-700 mb-4" />

              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        <User className="w-5 h-5 text-gray-500" />
                      </button>
                    </Link>
                    <Link href="/app/settings">
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                        <Settings className="w-5 h-5 text-gray-500" />
                      </button>
                    </Link>
                  </>
                ) : (
                  <Link href="/login">
                    <button className="flex items-center gap-2 text-sm text-teal-600 hover:underline">
                      <User className="w-4 h-4" />
                      {language === "fr" ? "Se connecter" : "Sign in"}
                    </button>
                  </Link>
                )}

                <a
                  href="https://rusinga.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  rusinga.com
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center",
          "backdrop-blur-xl border border-white/30 transition-all duration-300"
        )}
        style={{
          background: isOpen
            ? "rgba(255, 255, 255, 0.9)"
            : "linear-gradient(135deg, #E07B39 0%, #D4AF37 50%, #2DD4BF 100%)",
        }}
        aria-expanded={isOpen}
        aria-label={language === "fr" ? "Ouvrir le menu de l'écosystème" : "Open ecosystem menu"}
      >
        <Grid3X3
          className={cn(
            "w-6 h-6 transition-all duration-300",
            isOpen ? "text-gray-700 rotate-45" : "text-white"
          )}
        />
      </motion.button>
    </div>
  );
}

export default EcosystemSwitcher;
