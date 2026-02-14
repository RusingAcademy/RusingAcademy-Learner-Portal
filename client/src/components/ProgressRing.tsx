import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
  strokeWidth?: number;
  color?: "default" | "success" | "warning" | "danger" | "info" | "gradient";
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  animated?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = "md",
  strokeWidth,
  color = "default",
  showValue = true,
  showLabel = false,
  label,
  sublabel,
  animated = true,
  className,
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Animate on mount
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(percentage);
    }
  }, [percentage, animated]);

  const sizeConfig = {
    sm: { dimension: 64, defaultStroke: 6, fontSize: "text-sm", labelSize: "text-xs" },
    md: { dimension: 96, defaultStroke: 8, fontSize: "text-xl", labelSize: "text-xs" },
    lg: { dimension: 128, defaultStroke: 10, fontSize: "text-2xl", labelSize: "text-sm" },
    xl: { dimension: 160, defaultStroke: 12, fontSize: "text-3xl", labelSize: "text-sm" },
  };

  const config = sizeConfig[size];
  const actualStrokeWidth = strokeWidth || config.defaultStroke;
  const radius = (config.dimension - actualStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  const colorClasses = {
    default: {
      track: "stroke-slate-200 dark:stroke-slate-700",
      progress: "stroke-slate-600 dark:stroke-slate-400",
      text: "text-slate-900 dark:text-white",
    },
    success: {
      track: "stroke-emerald-100 dark:stroke-emerald-900/30",
      progress: "stroke-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      track: "stroke-amber-100 dark:stroke-amber-900/30",
      progress: "stroke-amber-500",
      text: "text-amber-600 dark:text-amber-400",
    },
    danger: {
      track: "stroke-red-100 dark:stroke-red-900/30",
      progress: "stroke-red-500",
      text: "text-red-600 dark:text-red-400",
    },
    info: {
      track: "stroke-blue-100 dark:stroke-blue-900/30",
      progress: "stroke-blue-500",
      text: "text-blue-600 dark:text-blue-400",
    },
    gradient: {
      track: "stroke-slate-200 dark:stroke-slate-700",
      progress: "", // Will use gradient
      text: "text-slate-900 dark:text-white",
    },
  };

  const colors = colorClasses[color];
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg
        width={config.dimension}
        height={config.dimension}
        viewBox={`0 0 ${config.dimension} ${config.dimension}`}
        className="transform -rotate-90"
      >
        {/* Gradient Definition */}
        {color === "gradient" && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        )}

        {/* Background Track */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStrokeWidth}
          className={colors.track}
        />

        {/* Progress Arc */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStrokeWidth}
          strokeLinecap="round"
          className={color !== "gradient" ? colors.progress : ""}
          stroke={color === "gradient" ? `url(#${gradientId})` : undefined}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: animated ? "stroke-dashoffset 1s ease-out" : "none",
          }}
        />
      </svg>

      {/* Center Content */}
      {(showValue || showLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className={cn("font-bold", config.fontSize, colors.text)}>
              {Math.round(animatedValue)}%
            </span>
          )}
          {showLabel && label && (
            <span className={cn("font-medium text-slate-600 dark:text-slate-400", config.labelSize)}>
              {label}
            </span>
          )}
        </div>
      )}

      {/* Sublabel below ring */}
      {sublabel && (
        <span className={cn("mt-2 text-slate-500 dark:text-slate-400", config.labelSize)}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

interface SLELevelRingProps {
  currentLevel: string;
  targetLevel: string;
  language?: "en" | "fr";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function SLELevelRing({
  currentLevel,
  targetLevel,
  language = "en",
  size = "lg",
  className,
}: SLELevelRingProps) {
  const currentProgress = getLevelProgress(currentLevel);
  const targetProgress = getLevelProgress(targetLevel);
  const percentage = Math.round((currentProgress / targetProgress) * 100);

  const labels = {
    en: {
      current: "Current",
      target: "Target",
      progress: "Progress to",
    },
    fr: {
      current: "Actuel",
      target: "Cible",
      progress: "Progression vers",
    },
  };

  const l = labels[language];

  // Determine color based on progress
  const getColor = () => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "info";
    if (percentage >= 30) return "warning";
    return "danger";
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <ProgressRing
          value={percentage}
          size={size}
          color={getColor()}
          showValue={false}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">{l.current}</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{currentLevel}</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {l.progress} <span className="font-semibold text-slate-900 dark:text-white">{targetLevel}</span>
        </p>
        <p className="text-lg font-bold text-slate-900 dark:text-white">{percentage}%</p>
      </div>
    </div>
  );
}

// Multi-ring component for showing all three SLE skills
interface SLETripleRingProps {
  reading: { current: string; target: string };
  writing: { current: string; target: string };
  oral: { current: string; target: string };
  language?: "en" | "fr";
  className?: string;
}

export function SLETripleRing({
  reading,
  writing,
  oral,
  language = "en",
  className,
}: SLETripleRingProps) {
  const labels = {
    en: {
      reading: "Reading",
      writing: "Writing",
      oral: "Oral",
      current: "Current",
      target: "Target",
    },
    fr: {
      reading: "Lecture",
      writing: "Écriture",
      oral: "Oral",
      current: "Actuel",
      target: "Cible",
    },
  };

  const l = labels[language];

  const skills = [
    { key: "reading", label: l.reading, data: reading, color: "info" as const },
    { key: "writing", label: l.writing, data: writing, color: "success" as const },
    { key: "oral", label: l.oral, data: oral, color: "warning" as const },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-6", className)}>
      {skills.map((skill) => {
        const currentProgress = getLevelProgress(skill.data.current);
        const targetProgress = getLevelProgress(skill.data.target);
        const percentage = Math.round((currentProgress / targetProgress) * 100);

        return (
          <div key={skill.key} className="flex flex-col items-center">
            <div className="relative">
              <ProgressRing
                value={percentage}
                size="md"
                color={skill.color}
                showValue={false}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {skill.data.current}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{skill.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {l.target}: {skill.data.target}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to convert SLE level to progress percentage
function getLevelProgress(level: string): number {
  const levelMap: Record<string, number> = {
    "X": 0,
    "A": 33,
    "B": 66,
    "C": 100,
    "E": 100,
  };
  
  // Handle compound levels like BBB, CBC, etc.
  if (level.length === 3) {
    const [r, w, o] = level.split("");
    const rProgress = levelMap[r] || 50;
    const wProgress = levelMap[w] || 50;
    const oProgress = levelMap[o] || 50;
    return Math.round((rProgress + wProgress + oProgress) / 3);
  }
  
  return levelMap[level.toUpperCase()] || 50;
}

export default ProgressRing;
