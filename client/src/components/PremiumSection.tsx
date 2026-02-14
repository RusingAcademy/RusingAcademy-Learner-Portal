import { useLanguage } from "@/contexts/LanguageContext";
import { ReactNode, useEffect, useRef, useState } from "react";

interface PremiumSectionProps {
  id?: string;
  badge?: {
    en: string;
    fr: string;
  };
  title?: {
    en: string | ReactNode;
    fr: string | ReactNode;
  };
  subtitle?: {
    en: string;
    fr: string;
  };
  variant?: "default" | "light" | "dark" | "gradient" | "teal-gradient";
  padding?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  children: ReactNode;
}

/**
 * PremiumSection - Reusable premium section wrapper
 * 
 * Features:
 * - Multiple background variants
 * - Scroll-triggered animations
 * - Optional badge, title, subtitle
 * - Responsive padding
 * - WCAG AA accessible
 */
export default function PremiumSection({
  id,
  badge,
  title,
  subtitle,
  variant = "default",
  padding = "lg",
  animate = true,
  children,
}: PremiumSectionProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(!animate);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!animate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [animate]);

  const getVariantClasses = () => {
    switch (variant) {
      case "light":
        return "bg-white";
      case "dark":
        return "bg-slate-900 text-white";
      case "gradient":
        return "bg-gradient-to-br from-slate-50 via-white to-teal-50/30";
      case "teal-gradient":
        return "bg-gradient-to-br from-teal-50/50 via-white to-[#FFFFFF]/30";
      default:
        return "bg-white";
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case "sm":
        return "py-12";
      case "md":
        return "py-16";
      case "lg":
        return "py-20 lg:py-24";
      case "xl":
        return "py-24 lg:py-32";
      default:
        return "py-20 lg:py-24";
    }
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative overflow-hidden ${getVariantClasses()} ${getPaddingClasses()}`}
    >
      <div className="container">
        {/* Section header */}
        {(badge || title || subtitle) && (
          <div 
            className={`text-center mb-12 lg:mb-16 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-teal-100/80 border border-teal-200">
                <span className="text-sm font-medium text-teal-700">
                  {language === "fr" ? badge.fr : badge.en}
                </span>
              </div>
            )}

            {/* Title */}
            {title && (
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${variant === "dark" ? "text-white" : "text-slate-900"}`}>
                {language === "fr" ? title.fr : title.en}
              </h2>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className={`text-lg max-w-2xl mx-auto ${variant === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                {language === "fr" ? subtitle.fr : subtitle.en}
              </p>
            )}
          </div>
        )}

        {/* Section content */}
        <div 
          className={`transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
