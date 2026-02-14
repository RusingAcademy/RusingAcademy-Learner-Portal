import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  BookOpen,
  Building2,
  Landmark,
  Users,
  GraduationCap,
  Search,
  UserPlus,
  Bot,
  Briefcase,
  FolderOpen,
  Cpu,
  Mic,
  Mail,
} from "lucide-react";
import React from "react";

// ============================================================================
// Navigation Hook — CMS-driven with hardcoded fallbacks
// ============================================================================
// This hook fetches navigation menus from the CMS (Admin → Pages & CMS → Navigation)
// and falls back to hardcoded defaults when no CMS data exists.
// Visual rendering in sub-headers remains 100% unchanged (Golden reference immutability).
// ============================================================================

export interface NavItem {
  id: number | string;
  href: string;
  labelEn: string;
  labelFr: string;
  icon: string; // Lucide icon name
  target: string;
  children?: NavItem[];
}

export interface NavMenu {
  id: number;
  name: string;
  location: string;
  items: NavItem[];
}

// Icon name → React element mapping for rendering
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  GraduationCap,
  Building2,
  Landmark,
  Users,
  Search,
  UserPlus,
  Bot,
  Briefcase,
  FolderOpen,
  Cpu,
  Mic,
  Mail,
};

export function getIconComponent(iconName: string | null | undefined): React.ComponentType<{ className?: string }> | null {
  if (!iconName) return null;
  return ICON_MAP[iconName] || null;
}

// ============================================================================
// Hardcoded fallback navigation — matches current sub-header navLinks exactly
// ============================================================================

const FALLBACK_RUSINGACADEMY: NavItem[] = [
  { id: "ra-1", href: "/courses", labelEn: "Courses", labelFr: "Formations", icon: "BookOpen", target: "_self" },
  { id: "ra-2", href: "/curriculum", labelEn: "Our Curriculum", labelFr: "Notre programme", icon: "GraduationCap", target: "_self" },
  { id: "ra-3", href: "/rusingacademy/for-business", labelEn: "For Business", labelFr: "Entreprises", icon: "Building2", target: "_self" },
  { id: "ra-4", href: "/rusingacademy/for-government", labelEn: "For Government", labelFr: "Gouvernement", icon: "Landmark", target: "_self" },
  { id: "ra-5", href: "/coaches", labelEn: "Our Team", labelFr: "Notre équipe", icon: "Users", target: "_self" },
];

const FALLBACK_LINGUEEFY: NavItem[] = [
  { id: "lg-1", href: "/coaches", labelEn: "Find a Coach", labelFr: "Trouver un coach", icon: "Search", target: "_self" },
  { id: "lg-2", href: "/curriculum", labelEn: "Discover Our Courses", labelFr: "Découvrez nos cours", icon: "BookOpen", target: "_self" },
  { id: "lg-3", href: "/for-departments", labelEn: "For Departments", labelFr: "Pour les ministères", icon: "Building2", target: "_self" },
  { id: "lg-4", href: "/become-a-coach", labelEn: "Become a Coach", labelFr: "Devenir coach", icon: "UserPlus", target: "_self" },
  { id: "lg-5", href: "/prof-steven-ai", labelEn: "SLE AI Companion", labelFr: "SLE AI Companion", icon: "Bot", target: "_self" },
];

const FALLBACK_BARHOLEX: NavItem[] = [
  { id: "bx-1", href: "/barholex/services", labelEn: "Services", labelFr: "Services", icon: "Briefcase", target: "_self" },
  { id: "bx-2", href: "/barholex/portfolio", labelEn: "Portfolio", labelFr: "Portfolio", icon: "FolderOpen", target: "_self" },
  { id: "bx-3", href: "/barholex-media#edtech", labelEn: "EdTech & AI", labelFr: "EdTech & IA", icon: "Cpu", target: "_self" },
  { id: "bx-4", href: "/barholex-media#podcast", labelEn: "Podcast Studio", labelFr: "Studio Balado", icon: "Mic", target: "_self" },
  { id: "bx-5", href: "/barholex/contact", labelEn: "Contact", labelFr: "Contact", icon: "Mail", target: "_self" },
];

const FALLBACK_MAP: Record<string, NavItem[]> = {
  rusingacademy: FALLBACK_RUSINGACADEMY,
  lingueefy: FALLBACK_LINGUEEFY,
  barholex: FALLBACK_BARHOLEX,
};

/**
 * useNavigation — Fetch CMS navigation for a specific brand/location.
 * 
 * @param brand - The brand identifier ("rusingacademy" | "lingueefy" | "barholex")
 * @returns { items, isLoading, isFromCMS } — Navigation items, loading state, and source indicator
 * 
 * When CMS menus exist and are active for the given location, they are used.
 * Otherwise, the hardcoded fallback is returned seamlessly.
 * 
 * The CMS menu location maps to the brand:
 * - "header" location with menu name containing the brand → brand-specific nav
 * - If multiple menus match, the first active one is used
 */
export function useNavigation(brand: "rusingacademy" | "lingueefy" | "barholex") {
  const { data, isLoading } = trpc.cms.getPublicNavigation.useQuery(
    { location: "header" },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  const result = useMemo(() => {
    const fallback = FALLBACK_MAP[brand] || [];

    if (!data?.menus || data.menus.length === 0) {
      return { items: fallback, isFromCMS: false };
    }

    // Find a menu that matches this brand (by name containing the brand identifier)
    const brandMenu = data.menus.find((m: any) => {
      const name = (m.name || "").toLowerCase();
      return name.includes(brand);
    });

    if (!brandMenu || !brandMenu.items || brandMenu.items.length === 0) {
      return { items: fallback, isFromCMS: false };
    }

    // Transform CMS items to NavItem format
    // Labels support "EN | FR" format (pipe-separated) for bilingual display
    const parseLabel = (label: string) => {
      if (!label) return { en: "", fr: "" };
      const parts = label.split("|").map(s => s.trim());
      if (parts.length >= 2) return { en: parts[0], fr: parts[1] };
      return { en: label, fr: label }; // Same label for both languages
    };

    const cmsItems: NavItem[] = brandMenu.items.map((item: any) => {
      const { en, fr } = parseLabel(item.label || "");
      return {
        id: item.id,
        href: item.url || "#",
        labelEn: en,
        labelFr: fr,
        icon: item.icon || "",
        target: item.target || "_self",
        children: item.children?.map((child: any) => {
          const childLabels = parseLabel(child.label || "");
          return {
            id: child.id,
            href: child.url || "#",
            labelEn: childLabels.en,
            labelFr: childLabels.fr,
            icon: child.icon || "",
            target: child.target || "_self",
          };
        }) || [],
      };
    });

    return { items: cmsItems, isFromCMS: true };
  }, [data, brand]);

  return { ...result, isLoading };
}

/**
 * useFooterNavigation — Fetch CMS footer navigation
 */
export function useFooterNavigation() {
  const { data, isLoading } = trpc.cms.getPublicNavigation.useQuery(
    { location: "footer" },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  return {
    menus: data?.menus || [],
    isLoading,
  };
}
