import { useLocation } from "wouter";
import { useEffect } from "react";
import ScrollToTop from "./ScrollToTop";
import EcosystemHeaderGold from "./EcosystemHeaderGold";
import { HubSubHeader, LingueefySubHeader, RusingAcademySubHeader, BarholexSubHeader } from "./subheaders";

interface EcosystemLayoutProps {
  children: React.ReactNode;
}

// Brand types for the ecosystem
type Brand = "ecosystem" | "rusingacademy" | "lingueefy" | "barholex";

// Determine which brand is active based on current path
function getBrand(path: string): Brand {
  // RusingAcademy pages
  if (path.startsWith("/rusingacademy") || path === "/courses" || path.startsWith("/courses/")) {
    return "rusingacademy";
  }
  
  // Lingueefy pages
  if (
    path.startsWith("/lingueefy") || 
    path === "/coaches" || 
    path.startsWith("/coaches/") ||
    path === "/coach" ||
    path.startsWith("/coach/") ||
    path === "/prof-steven-ai" ||
    path === "/become-a-coach" ||
    path.startsWith("/become-a-coach/") ||
    path === "/pricing" ||
    path === "/faq"
  ) {
    return "lingueefy";
  }
  
  // Barholex Media pages
  if (path.startsWith("/barholex")) {
    return "barholex";
  }
  
  // Default: Hub/Ecosystem
  return "ecosystem";
}

// Determine which sub-header to show based on current path
function getSubHeader(path: string): React.ReactNode | null {
  // Hub pages
  if (path === "/" || path === "/ecosystem" || path === "/home") {
    return <HubSubHeader />;
  }
  
  // RusingAcademy pages
  if (
    path.startsWith("/rusingacademy") || 
    path === "/courses" || 
    path.startsWith("/courses/") ||
    path === "/curriculum" ||
    path.startsWith("/curriculum/")
  ) {
    return <RusingAcademySubHeader />;
  }
  
  // Lingueefy pages
  if (
    path.startsWith("/lingueefy") || 
    path === "/coaches" || 
    path.startsWith("/coaches/") ||
    path === "/coach" ||
    path.startsWith("/coach/") ||
    path === "/prof-steven-ai" ||
    path === "/become-a-coach" ||
    path.startsWith("/become-a-coach/") ||
    path === "/pricing" ||
    path === "/faq" ||
    path === "/booking" ||
    path.startsWith("/booking/") ||
    path === "/booking-success" ||
    path === "/booking-cancelled" ||
    path === "/booking-confirmation" ||
    path === "/sle-diagnostic" ||
    path === "/ai-coach" ||
    path === "/how-it-works" ||
    path === "/for-departments" ||
    path === "/organizations"
  ) {
    return <LingueefySubHeader />;
  }
  
  // Barholex Media pages
  if (path.startsWith("/barholex")) {
    return <BarholexSubHeader />;
  }
  
  // General public pages - show Hub sub-header
  const hubPages = [
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/cookie-policy",
    "/accessibility",
    "/careers",
    "/blog",
    "/community",
    "/coach-guide",
    "/certificate"
  ];
  
  if (hubPages.some(page => path === page || path.startsWith(page + "/"))) {
    return <HubSubHeader />;
  }
  
  // Default: no sub-header for other pages (dashboard, auth, etc.)
  return null;
}

// Pages that should NOT show the ecosystem header
const EXCLUDED_PATHS = [
  "/login",
  "/signup",
  "/set-password",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/dashboard",
  "/admin",
  "/app",
  "/learn",
  "/coach/dashboard",
  "/hr",
  "/learner",
  "/my-learning",
  "/my-sessions",
  "/settings",
  "/progress",
  "/payments",
  "/favorites",
  "/rewards",
  "/referrals",
  "/messages",
  "/session",
];

function shouldShowEcosystemHeader(path: string): boolean {
  return !EXCLUDED_PATHS.some(excluded => 
    path === excluded || path.startsWith(excluded + "/")
  );
}

export default function EcosystemLayout({ children }: EcosystemLayoutProps) {
  const [location] = useLocation();
  
  const showHeader = shouldShowEcosystemHeader(location);
  const subHeader = showHeader ? getSubHeader(location) : null;
  const brand = getBrand(location);

  // Set data-brand attribute on body for CSS token overrides
  useEffect(() => {
    document.body.setAttribute("data-brand", brand);
    return () => {
      document.body.removeAttribute("data-brand");
    };
  }, [brand]);

  if (!showHeader) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col" data-brand={brand}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-teal-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <EcosystemHeaderGold />
      {subHeader}
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
