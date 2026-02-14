import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface PremiumHeroSectionProps {
  badge?: {
    en: string;
    fr: string;
  };
  title: {
    en: string | ReactNode;
    fr: string | ReactNode;
  };
  subtitle?: {
    en: string;
    fr: string;
  };
  backgroundImage?: string;
  variant?: "default" | "teal" | "dark" | "gradient";
  children?: ReactNode;
}

/**
 * PremiumHeroSection - Reusable premium hero component
 * 
 * Features:
 * - Glassmorphism badge
 * - Gradient text support
 * - Decorative orbs
 * - Responsive design
 * - WCAG AA accessible
 */
export default function PremiumHeroSection({
  badge,
  title,
  subtitle,
  backgroundImage,
  variant = "default",
  children,
}: PremiumHeroSectionProps) {
  const { language } = useLanguage();

  const getVariantClasses = () => {
    switch (variant) {
      case "teal":
        return "bg-gradient-to-b from-teal-50/50 via-white to-white";
      case "dark":
        return "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white";
      case "gradient":
        return "bg-gradient-to-br from-teal-50/30 via-white to-[#FFFFFF]/30";
      default:
        return "bg-gradient-to-b from-slate-50 via-white to-white";
    }
  };

  const getOrbColors = () => {
    switch (variant) {
      case "dark":
        return {
          primary: "bg-teal-500/20",
          secondary: "bg-[#E7F2F2]/10",
          tertiary: "bg-[#C65A1E]/10",
        };
      default:
        return {
          primary: "bg-teal-400/20",
          secondary: "bg-[#E7F2F2]/10",
          tertiary: "bg-orange-400/10",
        };
    }
  };

  const orbColors = getOrbColors();

  return (
    <section 
      className={`relative py-20 lg:py-28 overflow-hidden ${getVariantClasses()}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : undefined}
    >
      {/* Decorative orbs */}
      <div 
        className={`absolute w-[500px] h-[500px] -top-64 -right-64 rounded-full blur-3xl ${orbColors.primary} animate-pulse`}
        style={{ animationDuration: "8s" }}
        aria-hidden="true"
      />
      <div 
        className={`absolute w-72 h-72 top-20 -left-36 rounded-full blur-3xl ${orbColors.secondary}`}
        style={{ animationDuration: "6s" }}
        aria-hidden="true"
      />
      <div 
        className={`absolute w-48 h-48 bottom-10 right-1/4 rounded-full blur-3xl ${orbColors.tertiary}`}
        style={{ animationDuration: "4s" }}
        aria-hidden="true"
      />

      <div className="container relative z-10 text-center">
        {/* Glass badge */}
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 glass-badge">
            <Sparkles className="h-4 w-4 text-teal-600" aria-hidden="true" />
            <span className="text-sm font-medium text-teal-700">
              {language === "fr" ? badge.fr : badge.en}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${variant === "dark" ? "text-white" : ""}`}>
          {language === "fr" ? title.fr : title.en}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className={`text-xl max-w-2xl mx-auto ${variant === "dark" ? "text-slate-300" : "text-muted-foreground"}`}>
            {language === "fr" ? subtitle.fr : subtitle.en}
          </p>
        )}

        {/* Additional content (buttons, etc.) */}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
