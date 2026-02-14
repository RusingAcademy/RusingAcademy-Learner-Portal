/**
 * BadgeIcon — Premium SVG badge renderer with tier rings, gradient backgrounds, and glow effects.
 * Used by BadgesCatalog and LearnerDashboard RecentBadgesWidget.
 *
 * Renders a circular badge with:
 *  - Tier-specific ring (bronze/silver/gold/platinum) with subtle animation
 *  - Gradient background from badge definition colors
 *  - Lucide icon centered
 *  - Earned/locked visual states
 *  - Optional "new" pulse indicator
 */
import React from "react";
import {
  Award, Star, Trophy, Flame, Target, Zap, BookOpen, Mic, PenTool,
  Bot, GraduationCap, Sparkles, Medal, Crown, Heart, MessageSquare,
  Footprints, Layers, Brain, Shield, PlayCircle, BookCheck, Gem,
  Sunrise, Moon, Swords, FlaskConical, Users, Lock, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Icon Map ────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  footprints: Footprints,
  layers: Layers,
  trophy: Trophy,
  crown: Crown,
  "book-check": BookCheck,
  "play-circle": PlayCircle,
  brain: Brain,
  star: Star,
  flame: Flame,
  zap: Zap,
  shield: Shield,
  medal: Medal,
  sparkles: Sparkles,
  gem: Gem,
  award: Award,
  users: Users,
  "message-star": MessageSquare,
  sunrise: Sunrise,
  moon: Moon,
  swords: Swords,
  flask: FlaskConical,
  target: Target,
  mic: Mic,
  "pen-tool": PenTool,
  "book-open": BookOpen,
  bot: Bot,
  "graduation-cap": GraduationCap,
  heart: Heart,
};

// ─── Tier Ring Colors ────────────────────────────────────────────────────────
const TIER_RING: Record<string, { stroke: string; glow: string; bg: string }> = {
  bronze: {
    stroke: "#CD7F32",
    glow: "rgba(205,127,50,0.3)",
    bg: "rgba(205,127,50,0.08)",
  },
  silver: {
    stroke: "#C0C0C0",
    glow: "rgba(192,192,192,0.35)",
    bg: "rgba(192,192,192,0.08)",
  },
  gold: {
    stroke: "#FFD700",
    glow: "rgba(255,215,0,0.35)",
    bg: "rgba(255,215,0,0.08)",
  },
  platinum: {
    stroke: "#E5E4E2",
    glow: "rgba(229,228,226,0.4)",
    bg: "rgba(229,228,226,0.1)",
  },
};

// ─── Component Props ─────────────────────────────────────────────────────────
interface BadgeIconProps {
  iconKey: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  gradientFrom: string;
  gradientTo: string;
  earned: boolean;
  isNew?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: { outer: 48, icon: 18, ring: 2, gap: 3 },
  md: { outer: 64, icon: 24, ring: 2.5, gap: 4 },
  lg: { outer: 80, icon: 30, ring: 3, gap: 5 },
  xl: { outer: 96, icon: 36, ring: 3.5, gap: 6 },
};

export function BadgeIcon({
  iconKey,
  tier,
  gradientFrom,
  gradientTo,
  earned,
  isNew = false,
  size = "md",
  className,
}: BadgeIconProps) {
  const Icon = ICON_MAP[iconKey] || Award;
  const tierStyle = TIER_RING[tier] || TIER_RING.bronze;
  const s = SIZES[size];
  const r = s.outer / 2;
  const innerR = r - s.gap;
  const ringR = r - s.ring;
  const circumference = 2 * Math.PI * ringR;

  // Unique gradient ID per instance
  const gradId = `badge-grad-${iconKey}-${tier}`;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        !earned && "opacity-50 grayscale",
        className
      )}
      style={{ width: s.outer, height: s.outer }}
    >
      {/* SVG Ring + Background */}
      <svg
        width={s.outer}
        height={s.outer}
        viewBox={`0 0 ${s.outer} ${s.outer}`}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={earned ? gradientFrom : "#6B7280"} />
            <stop offset="100%" stopColor={earned ? gradientTo : "#9CA3AF"} />
          </linearGradient>
          {earned && (
            <filter id={`glow-${gradId}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Background circle */}
        <circle
          cx={r}
          cy={r}
          r={innerR}
          fill={earned ? `url(#${gradId})` : "#374151"}
          opacity={earned ? 0.15 : 0.1}
        />

        {/* Tier ring */}
        <circle
          cx={r}
          cy={r}
          r={ringR}
          fill="none"
          stroke={earned ? tierStyle.stroke : "#4B5563"}
          strokeWidth={s.ring}
          strokeLinecap="round"
          strokeDasharray={earned ? `${circumference}` : `${circumference * 0.3} ${circumference * 0.7}`}
          filter={earned ? `url(#glow-${gradId})` : undefined}
          className={earned ? "animate-[spin_20s_linear_infinite]" : ""}
          style={{ transformOrigin: "center" }}
        />

        {/* Earned: full ring glow overlay */}
        {earned && (
          <circle
            cx={r}
            cy={r}
            r={ringR}
            fill="none"
            stroke={tierStyle.stroke}
            strokeWidth={s.ring * 0.5}
            opacity={0.3}
          />
        )}
      </svg>

      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center">
        {earned ? (
          <Icon
            style={{ width: s.icon, height: s.icon, color: gradientFrom }}
          />
        ) : (
          <Lock
            style={{ width: s.icon * 0.8, height: s.icon * 0.8 }}
            className="text-gray-500"
          />
        )}
      </div>

      {/* Earned checkmark */}
      {earned && (
        <div
          className="absolute z-20 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-background"
          style={{
            width: s.outer * 0.22,
            height: s.outer * 0.22,
            bottom: -1,
            right: -1,
          }}
        >
          <CheckCircle2
            style={{
              width: s.outer * 0.15,
              height: s.outer * 0.15,
            }}
            className="text-white"
          />
        </div>
      )}

      {/* "New" pulse indicator */}
      {isNew && earned && (
        <div
          className="absolute z-20 -top-1 -right-1"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
        </div>
      )}
    </div>
  );
}

export default BadgeIcon;
