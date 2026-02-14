import React from "react";
import { cn } from "@/lib/utils";

/**
 * Bento Grid Layout Component
 * A modern, modular grid system inspired by Apple's Bento design
 * Features: responsive, accessible, clean aesthetics
 */

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}

export function BentoGrid({ children, className, cols = 4 }: BentoGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4",
        colClasses[cols],
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  span?: "1" | "2" | "3" | "4" | "full";
  rowSpan?: "1" | "2";
  variant?: "default" | "highlight" | "subtle" | "glass";
  hover?: boolean;
  onClick?: () => void;
}

export function BentoCard({
  children,
  className,
  span = "1",
  rowSpan = "1",
  variant = "default",
  hover = true,
  onClick,
}: BentoCardProps) {
  const spanClasses = {
    "1": "col-span-1",
    "2": "col-span-1 md:col-span-2",
    "3": "col-span-1 md:col-span-2 lg:col-span-3",
    "4": "col-span-1 md:col-span-2 lg:col-span-4",
    "full": "col-span-full",
  };

  const rowSpanClasses = {
    "1": "row-span-1",
    "2": "row-span-1 md:row-span-2",
  };

  const variantClasses = {
    default: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
    highlight: "bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black border-slate-700 text-white",
    subtle: "bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50",
    glass: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 shadow-sm",
        spanClasses[span],
        rowSpanClasses[rowSpan],
        variantClasses[variant],
        hover && "transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600",
        onClick && "cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        className
      )}
    >
      {children}
    </Component>
  );
}

interface BentoHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function BentoHeader({ icon, title, subtitle, action, className }: BentoHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface BentoStatProps {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function BentoStat({
  value,
  label,
  sublabel,
  icon,
  trend,
  trendValue,
  color = "default",
  className,
}: BentoStatProps) {
  const colorClasses = {
    default: "text-slate-900 dark:text-white",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  const trendColors = {
    up: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
    down: "text-red-600 bg-red-50 dark:bg-red-900/30",
    neutral: "text-slate-600 bg-slate-50 dark:bg-slate-800",
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <div className="flex items-baseline gap-2">
        <span className={cn("text-3xl font-bold", colorClasses[color])}>{value}</span>
        {trend && trendValue && (
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", trendColors[trend])}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">{label}</span>
      {sublabel && (
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sublabel}</span>
      )}
    </div>
  );
}

interface BentoProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function BentoProgress({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  color = "default",
  className,
}: BentoProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const colorClasses = {
    default: "bg-slate-600 dark:bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {showValue && <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorClasses[color])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

// Semantic color utilities for LMS context
export const SemanticColors = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: "text-emerald-600",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    icon: "text-amber-600",
  },
  danger: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    icon: "text-red-600",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    icon: "text-blue-600",
  },
  neutral: {
    bg: "bg-slate-50 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-700 dark:text-slate-300",
    icon: "text-slate-600",
  },
};

export default BentoGrid;
