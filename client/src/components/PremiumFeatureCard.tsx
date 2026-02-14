import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PremiumFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: "teal" | "orange" | "purple" | "gold" | "blue" | "rose" | "emerald" | "amber";
  variant?: "default" | "glass" | "bordered" | "elevated";
  badge?: string;
  children?: ReactNode;
}

/**
 * PremiumFeatureCard - Reusable premium feature card component
 * 
 * Features:
 * - Multiple color variants
 * - Glassmorphism option
 * - Hover animations
 * - Icon with gradient background
 * - WCAG AA accessible
 */
export default function PremiumFeatureCard({
  icon: Icon,
  title,
  description,
  color = "teal",
  variant = "default",
  badge,
  children,
}: PremiumFeatureCardProps) {
  const colorClasses = {
    teal: {
      iconBg: "from-teal-500 to-teal-600",
      iconShadow: "shadow-teal-500/25",
      border: "border-teal-500/20",
      badge: "bg-teal-100 text-teal-700",
    },
    orange: {
      iconBg: "from-[#C65A1E] to-[#A84A15]",
      iconShadow: "shadow-[#C65A1E]/25",
      border: "border-orange-500/20",
      badge: "bg-orange-100 text-orange-700",
    },
    purple: {
      iconBg: "from-[#0F3D3E] to-[#145A5B]",
      iconShadow: "shadow-purple-500/25",
      border: "border-[#0F3D3E]/20",
      badge: "bg-[#E7F2F2] text-[#0F3D3E]",
    },
    gold: {
      iconBg: "from-[#C65A1E] to-yellow-600",
      iconShadow: "shadow-amber-500/25",
      border: "border-amber-500/20",
      badge: "bg-amber-100 text-amber-700",
    },
    blue: {
      iconBg: "from-blue-500 to-blue-600",
      iconShadow: "shadow-blue-500/25",
      border: "border-blue-500/20",
      badge: "bg-blue-100 text-blue-700",
    },
    copper: {
      iconBg: "from-[#C65A1E] to-[#E06B2D]",
      iconShadow: "shadow-rose-500/25",
      border: "border-[#C65A1E]/20",
      badge: "bg-[#FFF1E8] text-[#C65A1E]",
    },
    emerald: {
      iconBg: "from-emerald-500 to-emerald-600",
      iconShadow: "shadow-emerald-500/25",
      border: "border-emerald-500/20",
      badge: "bg-emerald-100 text-emerald-700",
    },
    amber: {
      iconBg: "from-[#C65A1E] to-[#A84A15]",
      iconShadow: "shadow-amber-500/25",
      border: "border-amber-500/20",
      badge: "bg-amber-100 text-amber-700",
    },
  };

  const colors = colorClasses[color];

  const getVariantClasses = () => {
    switch (variant) {
      case "glass":
        return "glass-card";
      case "bordered":
        return `bg-white border-2 ${colors.border} rounded-2xl`;
      case "elevated":
        return "bg-white rounded-2xl shadow-xl hover:shadow-2xl";
      default:
        return "bg-white rounded-2xl shadow-md hover:shadow-lg border border-slate-100";
    }
  };

  return (
    <div 
      className={`p-6 transition-all duration-300 hover:-translate-y-1 ${getVariantClasses()}`}
    >
      {/* Badge */}
      {badge && (
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${colors.badge}`}>
          {badge}
        </span>
      )}

      {/* Icon */}
      <div 
        className={`h-14 w-14 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center mb-4 shadow-lg ${colors.iconShadow}`}
      >
        <Icon className="h-7 w-7 text-white" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-600 text-sm leading-relaxed">
        {description}
      </p>

      {/* Additional content */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}
