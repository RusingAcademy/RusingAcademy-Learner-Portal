import { createContext, useContext, ReactNode, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

// Platform types in the ecosystem
export type EcosystemPlatform = "lingueefy" | "rusingacademy" | "barholex";

// Platform access levels
export type PlatformAccess = {
  lingueefy: boolean;
  rusingacademy: boolean;
  barholex: boolean;
};

// User's ecosystem profile
export interface EcosystemProfile {
  userId: number;
  email: string;
  name: string;
  avatar?: string;
  platformAccess: PlatformAccess;
  primaryPlatform: EcosystemPlatform;
  isOrganizationAdmin: boolean;
  organizationId?: string;
  organizationName?: string;
}

interface EcosystemAuthContextType {
  // Current user's ecosystem profile
  ecosystemProfile: EcosystemProfile | null;
  
  // Check if user has access to a specific platform
  hasAccessTo: (platform: EcosystemPlatform) => boolean;
  
  // Check if user is authenticated across ecosystem
  isEcosystemAuthenticated: boolean;
  
  // Get platforms user has access to
  accessiblePlatforms: EcosystemPlatform[];
  
  // Current active platform
  currentPlatform: EcosystemPlatform;
  
  // Check if user can access B2B features (RusingAcademy)
  canAccessB2B: boolean;
  
  // Check if user can submit projects (Barholex)
  canSubmitProjects: boolean;
}

const EcosystemAuthContext = createContext<EcosystemAuthContextType | undefined>(undefined);

interface EcosystemAuthProviderProps {
  children: ReactNode;
  currentPlatform?: EcosystemPlatform;
}

export function EcosystemAuthProvider({ 
  children, 
  currentPlatform = "lingueefy" 
}: EcosystemAuthProviderProps) {
  const { user, isAuthenticated } = useAuth();

  const ecosystemProfile = useMemo<EcosystemProfile | null>(() => {
    if (!user || !isAuthenticated) return null;

    // Determine platform access based on user role
    // All authenticated users get access to all platforms (SSO)
    const platformAccess: PlatformAccess = {
      lingueefy: true,
      rusingacademy: true, // B2B access for all authenticated users
      barholex: true, // Project submission for all authenticated users
    };

    // Check if user is part of an organization (for B2B features)
    const isOrganizationAdmin = user.role === "admin";

    return {
      userId: user.id,
      email: user.email || "",
      name: user.name || user.email?.split("@")[0] || "User",
      avatar: user.avatarUrl || undefined,
      platformAccess,
      primaryPlatform: "lingueefy",
      isOrganizationAdmin,
      organizationId: undefined, // Can be extended for B2B
      organizationName: undefined,
    };
  }, [user, isAuthenticated]);

  const hasAccessTo = (platform: EcosystemPlatform): boolean => {
    if (!ecosystemProfile) return false;
    return ecosystemProfile.platformAccess[platform];
  };

  const accessiblePlatforms = useMemo<EcosystemPlatform[]>(() => {
    if (!ecosystemProfile) return [];
    return (Object.keys(ecosystemProfile.platformAccess) as EcosystemPlatform[])
      .filter(platform => ecosystemProfile.platformAccess[platform]);
  }, [ecosystemProfile]);

  const canAccessB2B = useMemo(() => {
    return hasAccessTo("rusingacademy");
  }, [ecosystemProfile]);

  const canSubmitProjects = useMemo(() => {
    return hasAccessTo("barholex");
  }, [ecosystemProfile]);

  const value: EcosystemAuthContextType = {
    ecosystemProfile,
    hasAccessTo,
    isEcosystemAuthenticated: isAuthenticated,
    accessiblePlatforms,
    currentPlatform,
    canAccessB2B,
    canSubmitProjects,
  };

  return (
    <EcosystemAuthContext.Provider value={value}>
      {children}
    </EcosystemAuthContext.Provider>
  );
}

export function useEcosystemAuth() {
  const context = useContext(EcosystemAuthContext);
  if (context === undefined) {
    throw new Error("useEcosystemAuth must be used within an EcosystemAuthProvider");
  }
  return context;
}

// Hook to check platform access with automatic redirect
export function usePlatformAccess(requiredPlatform: EcosystemPlatform) {
  const { hasAccessTo, isEcosystemAuthenticated } = useEcosystemAuth();
  
  const hasAccess = isEcosystemAuthenticated && hasAccessTo(requiredPlatform);
  
  return {
    hasAccess,
    isAuthenticated: isEcosystemAuthenticated,
    needsAuthentication: !isEcosystemAuthenticated,
    needsUpgrade: isEcosystemAuthenticated && !hasAccess,
  };
}

// Platform configuration for UI
export const PLATFORM_CONFIG: Record<EcosystemPlatform, {
  name: string;
  nameFr: string;
  color: string;
  icon: string;
  description: string;
  descriptionFr: string;
}> = {
  lingueefy: {
    name: "Lingueefy",
    nameFr: "Lingueefy",
    color: "#009688",
    icon: "💬",
    description: "B2C Language Coaching",
    descriptionFr: "Coaching linguistique B2C",
  },
  rusingacademy: {
    name: "RusingAcademy",
    nameFr: "RusingAcademy",
    color: "#E07B39",
    icon: "🎓",
    description: "B2B/B2G Training Solutions",
    descriptionFr: "Solutions de formation B2B/B2G",
  },
  barholex: {
    name: "Barholex Media",
    nameFr: "Barholex Media",
    color: "#D4AF37",
    icon: "🎬",
    description: "Creative Production & EdTech",
    descriptionFr: "Production créative & EdTech",
  },
};
