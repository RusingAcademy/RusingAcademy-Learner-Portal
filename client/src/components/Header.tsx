import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Globe, Menu, ChevronDown, Moon, Sun, GraduationCap, MessageCircle, Clapperboard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { LingueefyLogo } from "@/components/LingueefyLogo";
import { NotificationBell } from "@/components/NotificationBell";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ECOSYSTEM_PLATFORMS, shouldUseInternalNav, type EcosystemPlatform } from "@/config/ecosystem";

// Official Lingueefy logo from S3 (glassmorphism bubble with maple leaf)
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/logos/lingueefy-official-logo.png";

// Use official PNG logo for consistency
const USE_SVG_LOGO = false;

export default function Header() {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);

  // Get icon component for ecosystem platform
  const getEcosystemIcon = (icon: EcosystemPlatform["icon"]) => {
    switch (icon) {
      case "graduation-cap":
        return <GraduationCap className="h-4 w-4" />;
      case "message-circle":
        return <MessageCircle className="h-4 w-4" />;
      case "clapperboard":
        return <Clapperboard className="h-4 w-4" />;
    }
  };

  // Handle ecosystem platform navigation
  const handleEcosystemNav = (platform: EcosystemPlatform) => {
    if (!platform.isCurrent) {
      if (shouldUseInternalNav(platform)) {
        window.location.href = platform.url;
      } else {
        window.open(platform.url, "_blank");
      }
    }
    setEcosystemOpen(false);
  };

  // Add scroll effect for glassmorphism enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/coaches", label: t("nav.findCoach") },
    { href: "/curriculum", label: language === "fr" ? "Découvrez nos cours" : "Discover Our Courses" },
    { href: "/for-departments", label: language === "fr" ? "Pour les ministères" : "For Departments" },
    { href: "/rusingacademy/for-business", label: language === "fr" ? "Pour les entreprises" : "For Business" },
    { href: "/become-a-coach", label: t("nav.becomeCoach") },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled 
          ? "glass-header shadow-lg" 
          : "bg-white/60 backdrop-blur-sm"
      }`}
      role="banner"
    >
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-xl"
      >
        {language === "fr" ? "Passer au contenu principal" : "Skip to main content"}
      </a>
      
      <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - SVG for crisp rendering at all resolutions */}
          <Link 
            href="/" 
            className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-2xl transition-all duration-300 hover:scale-[1.03] group"
            aria-label="Lingueefy - Home"
          >
            <div className="relative">
              {USE_SVG_LOGO ? (
                <LingueefyLogo 
                  height={65}
                  className="sm:h-[72px] lg:h-[80px] w-auto transition-all duration-300"
                  glassEffect={true}
                />
              ) : (
                <img 
                  loading="lazy" src={LOGO_URL}
                  alt="Lingueefy" 
                  className="h-12 sm:h-14 lg:h-16 w-auto object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
                  style={{ maxWidth: "200px" }}
                />
              )}
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-teal-500/0 group-hover:bg-teal-500/5 transition-all duration-300" />
            </div>
          </Link>

          {/* Desktop Navigation - Glassmorphism Pills */}
          <nav 
            className="hidden lg:flex items-center justify-center flex-1 px-8"
            role="navigation"
            aria-label={language === "fr" ? "Navigation principale" : "Main navigation"}
          >
            <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/30 shadow-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                    isActive(link.href)
                      ? "text-white bg-gradient-to-r from-teal-600 to-teal-500 shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:text-teal-700 hover:bg-white/60"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Ecosystem Switcher - Glass Style */}
            <DropdownMenu open={ecosystemOpen} onOpenChange={setEcosystemOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1.5 text-gray-600 hover:text-teal-700 rounded-full px-3 h-10 font-medium bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 hover:border-teal-200/50 transition-all duration-300"
                  aria-label={language === "fr" ? "Changer de plateforme" : "Switch platform"}
                >
                  <MessageCircle className="h-4 w-4 text-teal-600" aria-hidden="true" />
                  <span className="hidden sm:inline text-xs tracking-wide font-semibold">Ecosystem</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-white/50 bg-white/95 backdrop-blur-xl p-2">
                {ECOSYSTEM_PLATFORMS.map((platform) => (
                  <DropdownMenuItem
                    key={platform.slug}
                    onClick={() => handleEcosystemNav(platform)}
                    className={`cursor-pointer rounded-xl px-3 py-3 transition-all duration-200 ${platform.isCurrent ? "bg-teal-50 text-teal-700" : "hover:bg-white"}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ background: platform.bgGradient }}
                      >
                        {getEcosystemIcon(platform.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{platform.name}</p>
                        <p className="text-xs text-gray-500">
                          {language === "fr" ? platform.taglineFr : platform.taglineEn}
                        </p>
                      </div>
                      {platform.isCurrent && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                          {language === "fr" ? "Actuel" : "Current"}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Switcher - Glass Style */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1.5 text-gray-600 hover:text-teal-700 rounded-full px-3 h-10 font-medium bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 hover:border-teal-200/50 transition-all duration-300"
                  aria-label={language === "fr" ? "Changer de langue" : "Change language"}
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  <span className="uppercase text-xs tracking-wide font-semibold">{language}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-2xl shadow-xl border-white/50 bg-white/90 backdrop-blur-xl p-2">
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  className={`cursor-pointer rounded-xl px-3 py-2.5 transition-all duration-200 ${language === "en" ? "bg-teal-50 text-teal-700" : "hover:bg-white"}`}
                >
                  <span className="mr-3 text-lg" aria-hidden="true">🇨🇦</span> 
                  <span className="font-medium">English (Canada)</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("fr")}
                  className={`cursor-pointer rounded-xl px-3 py-2.5 transition-all duration-200 ${language === "fr" ? "bg-teal-50 text-teal-700" : "hover:bg-white"}`}
                >
                  <span className="mr-3 text-lg" aria-hidden="true">⚜️</span> 
                  <span className="font-medium">Français (Québec)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Toggle - Glass Style */}
            {toggleTheme && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="relative w-10 h-10 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/20 hover:border-teal-200/50 transition-all duration-300 overflow-hidden"
                aria-label={isDark ? (language === "fr" ? "Passer au mode clair" : "Switch to light mode") : (language === "fr" ? "Passer au mode sombre" : "Switch to dark mode")}
              >
                <Sun className={`h-4 w-4 absolute transition-all duration-500 ${isDark ? 'rotate-0 scale-100 text-amber-400' : 'rotate-90 scale-0 text-amber-500'}`} />
                <Moon className={`h-4 w-4 absolute transition-all duration-500 ${isDark ? '-rotate-90 scale-0 text-teal-600' : 'rotate-0 scale-100 text-teal-600'}`} />
              </Button>
            )}

            {/* Auth Buttons - Desktop - Glassmorphism */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <NotificationCenter />
                  <NotificationBell />
                  <Link href="/dashboard">
                    <Button className="glass-btn text-white rounded-full px-6 h-11 font-semibold">
                      {t("nav.dashboard")}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button 
                      variant="ghost" 
                      className="glass-btn-outline text-gray-700 rounded-full px-5 h-11 font-medium"
                    >
                      {t("nav.signIn")}
                    </Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button className="glass-btn text-white rounded-full px-6 h-11 font-semibold">
                      {t("nav.getStarted")}
                    </Button>
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full h-11 w-11 text-gray-600 hover:text-teal-700 bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300"
                  aria-label={language === "fr" ? "Ouvrir le menu" : "Open menu"}
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 bg-white/95 backdrop-blur-xl">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b border-gray-100/50">
                    <img 
                      loading="lazy" src={LOGO_URL}
                      alt="Lingueefy" 
                      className="h-12 w-auto"
                    />
                  </div>
                  
                  {/* Mobile Navigation */}
                  <nav 
                    className="flex-1 overflow-y-auto py-4"
                    role="navigation"
                    aria-label={language === "fr" ? "Menu mobile" : "Mobile menu"}
                  >
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center text-base font-medium py-4 px-6 transition-all duration-300 ${
                          isActive(link.href)
                            ? "bg-gradient-to-r from-teal-50 to-transparent text-teal-700 border-l-4 border-teal-500"
                            : "text-gray-700 hover:bg-white/80 border-l-4 border-transparent hover:border-teal-200"
                        }`}
                        aria-current={isActive(link.href) ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  
                  {/* Mobile Auth Buttons */}
                  <div className="p-6 border-t border-gray-100/50 bg-gradient-to-t from-gray-50/80 to-transparent">
                    {isAuthenticated ? (
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full glass-btn text-white rounded-full h-12 font-semibold">
                          {t("nav.dashboard")}
                        </Button>
                      </Link>
                    ) : (
                      <div className="space-y-3">
                        <a href={getLoginUrl()} className="block">
                          <Button 
                            variant="outline" 
                            className="w-full glass-btn-outline rounded-full h-12 font-medium"
                          >
                            {t("nav.signIn")}
                          </Button>
                        </a>
                        <a href={getLoginUrl()} className="block">
                          <Button className="w-full glass-btn text-white rounded-full h-12 font-semibold">
                            {t("nav.getStarted")}
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
