import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, LogIn, LogOut, Search, Sun, Moon, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { SearchModal } from "./SearchModal";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import SLEAICompanionWidget from "./SLEAICompanionWidgetMultiCoach";

/**
 * EcosystemHeaderGold - Ultra-Premium Corporate Luxury Header v7.0
 * 
 * ULTRA-PREMIUM CORPORATE LUXURY EDITION
 * - Bar 1: Platinum background with golden separator line
 * - Title: Title Case with subtle golden shimmer
 * - Login button: Heavy Frosted Glass with 2px golden border + glow effect + luxury shadow
 * - Home icon & Language: Light Crystal Glass with golden halo hover
 * - Brand Cards: Golden border hover + lift effect + glow
 * - All transitions: Cubic-bezier for luxury fluidity
 * - Vibe: Swiss private bank / Prestige consulting firm
 * 
 * NEW in v7.0:
 * - Hide on scroll down / Show on scroll up behavior
 * - Smooth transform-based animation (no layout shift)
 * - Always visible when at top of page
 * 
 * Design inspiration: Canada.ca + Corporate Luxury standards
 * - WCAG 2.1 AA compliant
 */

interface BrandTile {
  id: string;
  name: string;
  subtitle: { en: string; fr: string; };
  path: string;
  iconSrc: string;
  accentColor: string;
}

const brandTiles: BrandTile[] = [
  { id: "rusingacademy", name: "RusingÂcademy", subtitle: { en: "Professional Courses & LMS", fr: "Cours professionnels & LMS" }, path: "/rusingacademy", iconSrc: "https://rusingacademy-cdn.b-cdn.net/images/logos/rusingacademy-logo.png", accentColor: "#F97316" },
  { id: "lingueefy", name: "Lingueefy", subtitle: { en: "Human & AI Coaching", fr: "Coaching humain & IA" }, path: "/lingueefy", iconSrc: "https://rusingacademy-cdn.b-cdn.net/images/logos/lingueefy-logo-icon.png", accentColor: "#14B8A6" },
  { id: "barholex", name: "Barholex Media", subtitle: { en: "EdTech Consulting & Studio", fr: "Consultation EdTech & Studio" }, path: "/barholex-media", iconSrc: "https://rusingacademy-cdn.b-cdn.net/images/logos/barholex-logo-icon.png", accentColor: "#8B7355" },
];

const getActiveBrand = (location: string) => {
  if (location.startsWith("/rusingacademy")) return "rusingacademy";
  if (location.startsWith("/lingueefy")) return "lingueefy";
  if (location.startsWith("/barholex")) return "barholex";
  return null;
};

export default function EcosystemHeaderGold() {
  const { language, setLanguage } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const [location] = useLocation();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [homeHovered, setHomeHovered] = useState(false);
  const [langHovered, setLangHovered] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);
  const [themeHovered, setThemeHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);
  const activeBrand = getActiveBrand(location);

  // Hide on scroll down / Show on scroll up state
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Combined scroll handler for both collapse effect and hide/show behavior
  const updateHeader = useCallback(() => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY.current;
    
    // Update collapsed state
    setIsScrolled(currentScrollY > 50);
    
    // Always show header when at top
    if (currentScrollY <= 100) {
      setIsHeaderVisible(true);
      lastScrollY.current = currentScrollY;
      ticking.current = false;
      return;
    }
    
    // Only trigger if scroll delta is significant (prevents jitter)
    if (Math.abs(delta) < 10) {
      ticking.current = false;
      return;
    }
    
    // Scrolling down - hide header
    if (delta > 0) {
      setIsHeaderVisible(false);
    }
    // Scrolling up - show header
    else if (delta < 0) {
      setIsHeaderVisible(true);
    }
    
    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateHeader);
        ticking.current = true;
      }
    };

    // Set initial state
    lastScrollY.current = window.scrollY;
    setIsScrolled(window.scrollY > 50);
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateHeader]);

  // Luxury cubic-bezier transition
  const luxuryTransition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <header
      className="relative z-50 w-full"
      style={{
        background: "linear-gradient(180deg, #FAFBFC 0%, #F5F7FA 50%, #EEF1F5 100%)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        
        {/* BAR 1: Platinum Institutional Bar with Golden Separator - Subtle Collapse */}
        <div 
          className="flex items-center justify-between"
          style={{
            height: isScrolled ? "3rem" : "4rem",
            background: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)",
            borderBottom: "2px solid",
            borderImage: "linear-gradient(90deg, #D4AF37 0%, #F4E4BC 25%, #D4AF37 50%, #F4E4BC 75%, #D4AF37 100%) 1",
            transition: "height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          
          {/* Left: Home Icon - Light Crystal Glass with Golden Halo */}
          <Link href="/" className="flex items-center" aria-label="Go to homepage" title="Return to homepage">
            <div 
              className="rounded-full flex items-center justify-center cursor-pointer"
              style={{
                width: isScrolled ? "2.5rem" : "3rem",
                height: isScrolled ? "2.5rem" : "3rem",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                background: homeHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)",
                backdropFilter: homeHovered ? "blur(16px)" : "blur(8px)",
                border: homeHovered ? "2px solid rgba(212, 175, 55, 0.6)" : "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: homeHovered 
                  ? "0 0 20px rgba(212, 175, 55, 0.3), 0 8px 24px rgba(0, 0, 0, 0.1)" 
                  : "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              onMouseEnter={() => setHomeHovered(true)}
              onMouseLeave={() => setHomeHovered(false)}
            >
              <Home 
                style={{ 
                  width: isScrolled ? "1rem" : "1.25rem",
                  height: isScrolled ? "1rem" : "1.25rem",
                  color: homeHovered ? "#B8860B" : "#64748b", 
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" 
                }} 
                aria-hidden="true"
              />
            </div>
          </Link>

          {/* Center: Title Case with Subtle Golden Shimmer */}
          <div className="hidden lg:flex flex-1 justify-center">
            <span 
              className="text-center"
              style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: isScrolled ? "0.9rem" : "1.05rem",
                transition: "font-size 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                background: "linear-gradient(135deg, #5A5A5A 0%, #8B7355 30%, #5A5A5A 50%, #8B7355 70%, #5A5A5A 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              Rusinga International Consulting Ltd. Learning Ecosystem
            </span>
          </div>

          {/* Right: Search + Language + Login - Premium Glass */}
          <div className="flex items-center gap-4 lg:gap-6">
            
            {/* Search Button - Light Crystal Glass with Golden Hover */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center rounded-full"
              aria-label={language === "en" ? "Search" : "Rechercher"}
              title={language === "en" ? "Search the ecosystem" : "Rechercher dans l'écosystème"}
              style={{
                width: isScrolled ? "2.25rem" : "2.5rem",
                height: isScrolled ? "2.25rem" : "2.5rem",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                background: searchHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)",
                backdropFilter: searchHovered ? "blur(16px)" : "blur(8px)",
                border: searchHovered ? "2px solid rgba(212, 175, 55, 0.5)" : "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: searchHovered 
                  ? "0 0 16px rgba(212, 175, 55, 0.25), 0 4px 16px rgba(0, 0, 0, 0.08)" 
                  : "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              onMouseEnter={() => setSearchHovered(true)}
              onMouseLeave={() => setSearchHovered(false)}
            >
              <Search 
                style={{ 
                  width: isScrolled ? "0.875rem" : "1rem",
                  height: isScrolled ? "0.875rem" : "1rem",
                  color: searchHovered ? "#B8860B" : "#64748b", 
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" 
                }} 
                aria-hidden="true"
              />
            </button>
            
            {/* Language - Light Crystal Glass with Golden Hover */}
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="hidden sm:flex items-center justify-center rounded-full font-medium"
              aria-label={language === "en" ? "Switch to French" : "Switch to English"}
              title={language === "en" ? "Changer la langue en français" : "Change language to English"}
              style={{
                padding: isScrolled ? "0 1rem" : "0 1.25rem",
                height: isScrolled ? "2rem" : "2.5rem",
                fontSize: isScrolled ? "0.8rem" : "0.875rem",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                background: langHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)",
                backdropFilter: langHovered ? "blur(16px)" : "blur(8px)",
                border: langHovered ? "2px solid rgba(212, 175, 55, 0.5)" : "1px solid rgba(255, 255, 255, 0.5)",
                color: langHovered ? "#B8860B" : "#1e40af",
                boxShadow: langHovered 
                  ? "0 0 16px rgba(212, 175, 55, 0.25), 0 4px 16px rgba(0, 0, 0, 0.08)" 
                  : "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              onMouseEnter={() => setLangHovered(true)}
              onMouseLeave={() => setLangHovered(false)}
            >
              {language === "en" ? "Français" : "English"}
            </button>
            
            {/* Theme Toggle - Light Crystal Glass with Golden Hover */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center rounded-full"
              aria-label={isDark 
                ? (language === "en" ? "Switch to light mode" : "Passer au mode clair") 
                : (language === "en" ? "Switch to dark mode" : "Passer au mode sombre")
              }
              title={isDark 
                ? (language === "en" ? "Light mode" : "Mode clair") 
                : (language === "en" ? "Dark mode" : "Mode sombre")
              }
              style={{
                width: isScrolled ? "2.25rem" : "2.5rem",
                height: isScrolled ? "2.25rem" : "2.5rem",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                background: themeHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)",
                backdropFilter: themeHovered ? "blur(16px)" : "blur(8px)",
                border: themeHovered ? "2px solid rgba(212, 175, 55, 0.5)" : "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: themeHovered 
                  ? "0 0 16px rgba(212, 175, 55, 0.25), 0 4px 16px rgba(0, 0, 0, 0.08)" 
                  : "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              onMouseEnter={() => setThemeHovered(true)}
              onMouseLeave={() => setThemeHovered(false)}
            >
              {isDark ? (
                <Sun 
                  style={{ 
                    width: isScrolled ? "0.875rem" : "1rem",
                    height: isScrolled ? "0.875rem" : "1rem",
                    color: themeHovered ? "#D4AF37" : "#F59E0B", 
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" 
                  }} 
                  aria-hidden="true"
                />
              ) : (
                <Moon 
                  style={{ 
                    width: isScrolled ? "0.875rem" : "1rem",
                    height: isScrolled ? "0.875rem" : "1rem",
                    color: themeHovered ? "#B8860B" : "#64748b", 
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" 
                  }} 
                  aria-hidden="true"
                />
              )}
            </button>
            
            {/* Login/User Button - Heavy Frosted Glass with Golden Rim */}
            {isAuthenticated && user ? (
              /* Authenticated: Show user menu */
              <Link href="/dashboard" aria-label="Go to dashboard" title="Go to your dashboard">
                <button
                  className="flex items-center gap-2 rounded-full font-semibold"
                  style={{
                    padding: isScrolled ? "0 1.25rem" : "0 1.5rem",
                    height: isScrolled ? "2.25rem" : "2.75rem",
                    fontSize: isScrolled ? "0.8rem" : "0.875rem",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: loginHovered 
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 246, 240, 0.98) 100%)"
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 246, 240, 0.92) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "2px solid",
                    borderColor: loginHovered ? "#14B8A6" : "rgba(20, 184, 166, 0.5)",
                    color: loginHovered ? "#0D9488" : "#1a365d",
                    boxShadow: loginHovered 
                      ? "0 0 24px rgba(20, 184, 166, 0.4), 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)" 
                      : "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                  }}
                  onMouseEnter={() => setLoginHovered(true)}
                  onMouseLeave={() => setLoginHovered(false)}
                >
                  <User style={{ width: isScrolled ? "0.875rem" : "1rem", height: isScrolled ? "0.875rem" : "1rem", transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} aria-hidden="true" />
                  {user.name?.split(' ')[0] || 'Dashboard'}
                </button>
              </Link>
            ) : (
              /* Not authenticated: Show login button */
              <Link href="/login" aria-label="Login to your account" title="Sign in to your account">
                <button
                  className="flex items-center gap-2 rounded-full font-semibold"
                  style={{
                    padding: isScrolled ? "0 1.5rem" : "0 2rem",
                    height: isScrolled ? "2.25rem" : "2.75rem",
                    fontSize: isScrolled ? "0.8rem" : "0.875rem",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: loginHovered 
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 246, 240, 0.98) 100%)"
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 246, 240, 0.92) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "2px solid",
                    borderColor: loginHovered ? "#D4AF37" : "rgba(212, 175, 55, 0.5)",
                    color: loginHovered ? "#8B6914" : "#1a365d",
                    boxShadow: loginHovered 
                      ? "0 0 24px rgba(212, 175, 55, 0.4), 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)" 
                      : "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                  }}
                  onMouseEnter={() => setLoginHovered(true)}
                  onMouseLeave={() => setLoginHovered(false)}
                >
                  <LogIn style={{ width: isScrolled ? "0.875rem" : "1rem", height: isScrolled ? "0.875rem" : "1rem", transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} aria-hidden="true" />
                  Login
                </button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu" title="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <nav className="flex flex-col gap-4 mt-8" aria-label="Mobile navigation">
                  {/* Theme Toggle for Mobile */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#FFE4D6]/50 bg-gradient-to-r from-[#FFF8F3]/50 to-transparent">
                    <div className="flex items-center gap-3">
                      {isDark ? (
                        <Moon className="h-5 w-5 text-amber-600" />
                      ) : (
                        <Sun className="h-5 w-5 text-amber-600" />
                      )}
                      <span className="font-medium text-slate-700">
                        {language === "en" ? "Theme" : "Thème"}
                      </span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300"
                      style={{
                        background: isDark 
                          ? "linear-gradient(135deg, #0F3D3E 0%, #145A5B 100%)" 
                          : "linear-gradient(135deg, #F7F6F3 0%, #EEE9DF 100%)",
                        border: "2px solid rgba(212, 175, 55, 0.4)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    >
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300"
                        style={{
                          transform: isDark ? "translateX(1.5rem)" : "translateX(0.25rem)",
                          background: isDark 
                            ? "linear-gradient(135deg, #17E2C6 0%, #14C9B0 100%)" 
                            : "linear-gradient(135deg, #D4A853 0%, #C49843 100%)",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {isDark ? (
                          <Moon className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Sun className="h-3.5 w-3.5 text-white" />
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200 my-2" />

                  {/* Brand Navigation */}
                  {brandTiles.map((brand) => (
                    <Link key={brand.id} href={brand.path} onClick={() => setMobileMenuOpen(false)}>
                      <div className="p-4 rounded-xl border hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className="font-semibold">{brand.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {language === "en" ? brand.subtitle.en : brand.subtitle.fr}
                        </div>
                      </div>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* BAR 2: Ecosystem Cards with Widget - Subtle Vertical Collapse on Scroll */}
        <div 
          className="hidden lg:flex items-center justify-between"
          style={{
            background: "transparent",
            paddingTop: isScrolled ? "0.5rem" : "1rem",
            paddingBottom: isScrolled ? "0.5rem" : "1rem",
            transition: "padding 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Brand Cards - Full Width Distribution */}
          <nav className="flex-1 flex items-center justify-between gap-6 pr-8" aria-label="Ecosystem navigation">
            {brandTiles.map((brand) => (
              <Link key={brand.id} href={brand.path} className="flex-1" aria-label={`Go to ${brand.name}`} title={`Explore ${brand.name}`}>
                <div
                  className="relative rounded-2xl cursor-pointer"
                  style={{
                    padding: isScrolled ? "0.75rem 1.25rem" : "1.25rem",
                    background: "rgba(255, 255, 255, 0.95)",
                    border: hoveredCard === brand.id 
                      ? "2px solid rgba(255, 255, 255, 0.6)" 
                      : "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: hoveredCard === brand.id 
                      ? "0 0 24px rgba(0, 0, 0, 0.15), 0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)"
                      : "0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)",
                    transform: hoveredCard === brand.id ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={() => setHoveredCard(brand.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="rounded-xl flex items-center justify-center overflow-hidden"
                      style={{
                        width: isScrolled ? "2.5rem" : "3rem",
                        height: isScrolled ? "2.5rem" : "3rem",
                        background: "rgba(0, 0, 0, 0.05)",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <img 
                        loading="lazy" src={brand.iconSrc} 
                        alt={brand.name}
                        className="object-contain"
                        style={{
                          width: isScrolled ? "1.5rem" : "2rem",
                          height: isScrolled ? "1.5rem" : "2rem",
                          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span 
                        className="hidden text-lg font-bold"
                        style={{ color: brand.accentColor }}
                        aria-hidden="true"
                      >
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div 
                        className="font-semibold text-base"
                        style={{ 
                          color: "#1F2937",
                          transition: luxuryTransition,
                        }}
                      >
                        {brand.name}
                      </div>
                      <div 
                        className="text-sm"
                        style={{
                          color: "#6B7280",
                        }}
                      >
                        {language === "en" ? brand.subtitle.en : brand.subtitle.fr}
                      </div>
                    </div>
                  </div>
                  {activeBrand === brand.id && (
                    <div 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, transparent, ${brand.accentColor}, transparent)`,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* Widget SLE AI Companion - In Bar 2 */}
          <div className="flex-shrink-0">
            <SLEAICompanionWidget />
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
