/**
 * Ecosystem Configuration - UNIFIED SITE
 * All platforms are internal routes within the same codebase
 */

export interface EcosystemPlatform {
  slug: string;
  name: string;
  taglineEn: string;
  taglineFr: string;
  icon: "graduation-cap" | "message-circle" | "clapperboard";
  color: string;
  bgGradient: string;
  url: string;
  isCurrent?: boolean;
  isInternal?: boolean;
}

export const ECOSYSTEM_PLATFORMS: EcosystemPlatform[] = [
  {
    slug: "rusingacademy",
    name: "RusingAcademy",
    taglineEn: "B2B/B2G Training",
    taglineFr: "Formation B2B/B2G",
    icon: "graduation-cap",
    color: "#E07B39",
    bgGradient: "linear-gradient(135deg, #E07B39 0%, #C45E1A 100%)",
    url: "/rusingacademy",
    isInternal: true,
  },
  {
    slug: "lingueefy",
    name: "Lingueefy",
    taglineEn: "Coaching Marketplace",
    taglineFr: "Marketplace Coaching",
    icon: "message-circle",
    color: "#2DD4BF",
    bgGradient: "linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)",
    url: "/",
    isCurrent: true,
    isInternal: true,
  },
  {
    slug: "barholex",
    name: "Barholex Media",
    taglineEn: "Creative Production",
    taglineFr: "Production Créative",
    icon: "clapperboard",
    color: "#1A1A1A",
    bgGradient: "linear-gradient(135deg, #333333 0%, #1A1A1A 100%)",
    url: "/barholex",
    isInternal: true,
  },
];

export const ECOSYSTEM_LINKS = {
  mainSite: "https://rusinga.com",
  rusingacademy: {
    home: "/rusingacademy",
    programs: "/rusingacademy/programs",
    forOrganizations: "/rusingacademy/for-organizations",
    contact: "/rusingacademy/contact",
  },
  lingueefy: {
    home: "/",
    coaches: "/coaches",
    curriculum: "/curriculum",
    pricing: "/pricing",
  },
  barholex: {
    home: "/barholex",
    services: "/barholex/services",
    portfolio: "/barholex/portfolio",
    contact: "/barholex/contact",
  },
};

export const getCurrentPlatform = (): EcosystemPlatform => {
  return ECOSYSTEM_PLATFORMS.find((p) => p.isCurrent) || ECOSYSTEM_PLATFORMS[1];
};

export const getOtherPlatforms = (): EcosystemPlatform[] => {
  return ECOSYSTEM_PLATFORMS.filter((p) => !p.isCurrent);
};

export const shouldUseInternalNav = (platform: EcosystemPlatform): boolean => {
  return platform.isInternal === true;
};
