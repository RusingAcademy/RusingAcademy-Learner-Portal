import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Sun, Moon, Menu, X, Mic, ClipboardCheck, GraduationCap, Search } from "lucide-react";
import { SearchModal } from "./SearchModal";
import { useState, useEffect } from "react";

// Steven Barholere avatar for Human+AI signature
const STEVEN_AVATAR = "https://rusingacademy-cdn.b-cdn.net/images/coaches/steven-barholere.jpg";

// Brand tiles configuration with premium glass styling
interface BrandTile {
  id: string;
  name: string;
  subtitle: {
    en: string;
    fr: string;
  };
  path: string;
  logo: React.ReactNode;
  style: "dark-glass" | "light-glass" | "obsidian-glass";
}

const brandTiles: BrandTile[] = [
  {
    id: "rusingacademy",
    name: "RusingAcademy",
    subtitle: {
      en: "Professional Courses & LMS",
      fr: "Cours professionnels & LMS",
    },
    path: "/rusingacademy",
    logo: (
      <img 
        loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/logos/rusingacademy-logo.png" 
        alt="RusingAcademy" 
        className="w-10 h-10 rounded-lg object-cover"
      />
    ),
    style: "dark-glass",
  },
  {
    id: "lingueefy",
    name: "Lingueefy",
    subtitle: {
      en: "Human & AI Coaching Marketplace",
      fr: "Marketplace de coaching humain & IA",
    },
    path: "/lingueefy",
    logo: (
      <img 
        loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/logos/lingueefy-logo-icon.png" 
        alt="Lingueefy" 
        className="w-10 h-10 object-contain"
      />
    ),
    style: "light-glass",
  },
  {
    id: "barholex",
    name: "Barholex Media",
    subtitle: {
      en: "EdTech Consulting & Studio",
      fr: "Consultation EdTech & Studio",
    },
    path: "/barholex-media",
    logo: (
      <img 
        loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/logos/barholex-logo-icon.png" 
        alt="Barholex Media" 
        className="w-10 h-10 rounded-lg object-cover"
      />
    ),
    style: "obsidian-glass",
  },
];

// Determine active brand based on current path
function getActiveBrand(path: string): string | null {
  if (path === "/" || path === "/ecosystem") return "hub";
  if (path.startsWith("/rusingacademy") || path === "/courses") return "rusingacademy";
  if (path.startsWith("/lingueefy") || path === "/coaches" || path === "/prof-steven-ai") return "lingueefy";
  if (path.startsWith("/barholex")) return "barholex";
  return null;
}

export default function EcosystemHeader() {
  const { language, setLanguage } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stevenAIOpen, setStevenAIOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const activeBrand = getActiveBrand(location);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close Steven AI popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const popup = document.getElementById('steven-ai-popup');
      const trigger = document.getElementById('steven-ai-trigger');
      
      if (stevenAIOpen && popup && !popup.contains(e.target as Node) && 
          trigger && !trigger.contains(e.target as Node)) {
        setStevenAIOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [stevenAIOpen]);

  // Handle escape key for Steven AI popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stevenAIOpen) {
        setStevenAIOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [stevenAIOpen]);

  // Steven AI content
  const stevenAIContent = {
    en: {
      welcome: "Welcome to Lingueefy!",
      welcomeDesc: "I'm here to help you pass your GC Second Language Exams.",
      voicePractice: "Voice Practice Sessions",
      voicePracticeDesc: "Practice speaking with AI-powered conversation",
      placementTest: "SLE Placement Tests",
      placementTestDesc: "Assess your current level (A, B, or C)",
      examSimulation: "Oral Exam Simulations",
      examSimulationDesc: "Realistic mock exams with feedback",
      poweredBy: "Powered by Lingueefy",
    },
    fr: {
      welcome: "Bienvenue sur Lingueefy!",
      welcomeDesc: "Je suis là pour vous aider à réussir vos examens de langue seconde du GC.",
      voicePractice: "Sessions de pratique vocale",
      voicePracticeDesc: "Pratiquez l'oral avec une conversation IA",
      placementTest: "Tests de placement ELS",
      placementTestDesc: "Évaluez votre niveau actuel (A, B ou C)",
      examSimulation: "Simulations d'examen oral",
      examSimulationDesc: "Examens simulés réalistes avec rétroaction",
      poweredBy: "Propulsé par Lingueefy",
    }
  };

  const t = stevenAIContent[language];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-shadow duration-300 ${
        scrolled ? "shadow-lg" : ""
      }`}
      role="banner"
    >
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
        style={{ 
          backgroundColor: "var(--brand-cta)",
          color: "white",
        }}
      >
        {language === "fr" ? "Passer au contenu principal" : "Skip to main content"}
      </a>

      {/* ===== TOP BAR - Foundation Teal Glass ===== */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: "linear-gradient(135deg, rgba(15, 61, 62, 0.95) 0%, rgba(20, 90, 91, 0.9) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Company Identity - Left */}
            <Link 
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              {/* RusingAcademy Logo */}
              <img 
                loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/logos/rusingacademy-logo.png" 
                alt="RusingAcademy" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <span 
                  className="font-serif text-lg font-bold tracking-wide"
                  style={{ color: "var(--text-inverse)" }}
                >
                  RusingAcademy
                </span>
                <span 
                  className="hidden sm:inline text-xs font-medium"
                  style={{ color: "var(--muted-on-dark)" }}
                >
                  Learning Ecosystem
                </span>
              </div>
            </Link>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="rounded-full h-10 w-10 transition-all hover:bg-white/10"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                aria-label={language === "fr" ? "Rechercher" : "Search"}
              >
                <Search className="h-4 w-4 text-white" />
              </Button>

              {/* Language Switcher - Canadian Flag */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 rounded-full px-3 h-10 font-medium transition-all hover:bg-white/10"
                    style={{ 
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                    aria-label={language === "fr" ? "Changer de langue" : "Change language"}
                  >
                    <span className="text-lg" aria-hidden="true">{language === "en" ? "🇨🇦" : "⚜️"}</span>
                    <ChevronDown className="h-3 w-3 text-white/70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-40 rounded-xl p-1"
                  style={{ 
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--sand)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <DropdownMenuItem 
                    onClick={() => setLanguage("en")}
                    className="cursor-pointer rounded-lg px-3 py-2.5 transition-all"
                    style={{ 
                      backgroundColor: language === "en" ? "var(--brand-foundation-soft)" : "transparent",
                      color: "var(--text)",
                    }}
                  >
                    <span className="mr-2 text-lg" aria-hidden="true">🇨🇦</span> 
                    <span className="font-medium">English (Canada)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("fr")}
                    className="cursor-pointer rounded-lg px-3 py-2.5 transition-all"
                    style={{ 
                      backgroundColor: language === "fr" ? "var(--brand-foundation-soft)" : "transparent",
                      color: "var(--text)",
                    }}
                  >
                    <span className="mr-2 text-lg" aria-hidden="true">⚜️</span> 
                    <span className="font-medium">Français (Québec)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full h-10 w-10 transition-all hover:bg-white/10 hover:scale-105"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                aria-label={language === "fr" 
                  ? (isDark ? "Passer au mode clair" : "Passer au mode sombre") 
                  : (isDark ? "Switch to light mode" : "Switch to dark mode")
                }
                title={language === "fr" 
                  ? (isDark ? "Mode clair" : "Mode sombre") 
                  : (isDark ? "Light mode" : "Dark mode")
                }
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-300 transition-transform duration-300" />
                ) : (
                  <Moon className="h-4 w-4 text-white transition-transform duration-300" />
                )}
              </Button>

              {/* CTA - Join Our Community (Electric Copper / Rose Gold) */}
              <Link href="/community">
                <Button 
                  className="rounded-full px-5 sm:px-8 h-10 font-semibold text-sm transition-all hover:scale-105"
                  style={{ 
                    background: "linear-gradient(135deg, var(--brand-cta) 0%, #D4A853 100%)",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(198, 90, 30, 0.4)",
                  }}
                  aria-label={language === "fr" ? "Rejoindre notre communauté" : "Join Our Community"}
                >
                  <span className="hidden sm:inline">
                    {language === "fr" ? "Rejoindre la communauté" : "Join Our Community"}
                  </span>
                  <span className="sm:hidden">
                    {language === "fr" ? "Rejoindre" : "Join"}
                  </span>
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full h-10 w-10 transition-all hover:bg-white/10"
                    aria-label={language === "fr" ? "Ouvrir le menu" : "Open menu"}
                  >
                    <Menu className="h-5 w-5 text-white" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-80 p-0"
                  style={{ backgroundColor: "var(--surface)" }}
                >
                  <MobileMenu 
                    activeBrand={activeBrand} 
                    onClose={() => setMobileMenuOpen(false)} 
                    language={language}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER - Brand Navigation with Premium Glass Cards ===== */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(15, 61, 62, 0.98) 0%, rgba(11, 18, 32, 0.95) 100%)",
        }}
      >
        {/* Decorative elements */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(198, 90, 30, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(212, 168, 83, 0.2) 0%, transparent 50%)",
          }}
        />
        
        <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8 relative z-10">
          <div className="flex h-28 sm:h-32 items-center justify-between py-4">
            {/* Brand Tiles - Center */}
            <nav 
              className="hidden lg:flex items-center justify-center flex-1 gap-6"
              role="navigation"
              aria-label={language === "fr" ? "Navigation des marques" : "Brand navigation"}
            >
              {brandTiles.map((tile) => {
                const isActive = activeBrand === tile.id;
                
                // Brand-specific glass styles
                let glassStyle: React.CSSProperties = {};
                let textColor = "white";
                let subtitleColor = "rgba(255,255,255,0.7)";
                
                // RusingAcademy - Orange/Coral brand color
                if (tile.style === "dark-glass") {
                  glassStyle = {
                    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  };
                  textColor = "white";
                  subtitleColor = "rgba(255,255,255,0.85)";
                // Lingueefy - Teal/Turquoise brand color
                } else if (tile.style === "light-glass") {
                  glassStyle = {
                    background: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  };
                  textColor = "white";
                  subtitleColor = "rgba(255,255,255,0.85)";
                // Barholex Media - Beige/Cream brand color
                } else if (tile.style === "obsidian-glass") {
                  glassStyle = {
                    background: "linear-gradient(135deg, #F5F0E6 0%, #E8E0D0 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(139, 119, 101, 0.3)",
                  };
                  textColor = "#1F2937";
                  subtitleColor = "#4B5563";
                }
                
                return (
                  <Link
                    key={tile.id}
                    href={tile.path}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div
                      className={`
                        flex flex-col items-center justify-center px-8 py-4 rounded-2xl cursor-pointer
                        transition-all duration-300 min-w-[200px]
                        ${isActive ? "scale-105 ring-2 ring-white/30" : "hover:scale-[1.03] hover:shadow-2xl"}
                      `}
                      style={{
                        ...glassStyle,
                        boxShadow: isActive 
                          ? "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
                          : "0 10px 30px rgba(0,0,0,0.3)",
                      }}
                    >
                      {/* Logo */}
                      <div className="mb-2">
                        {tile.logo}
                      </div>
                      {/* Title */}
                      <span 
                        className="font-semibold text-lg whitespace-nowrap"
                        style={{ color: textColor }}
                      >
                        {tile.name}
                      </span>
                      {/* Subtitle */}
                      <span 
                        className="text-xs mt-1 whitespace-nowrap"
                        style={{ color: subtitleColor }}
                      >
                        {tile.subtitle[language]}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Steven AI Assistant - Right */}
            <div className="hidden lg:block relative">
              <button
                id="steven-ai-trigger"
                onClick={() => setStevenAIOpen(!stevenAIOpen)}
                className="flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-105"
                aria-label={language === "fr" ? "Ouvrir SLE AI Coach" : "Open SLE AI Coach"}
                aria-expanded={stevenAIOpen}
                aria-haspopup="dialog"
              >
                <div className="relative">
                  {/* Outer ring with pulse animation */}
                  <div 
                    className="absolute -inset-1 rounded-full animate-pulse"
                    style={{ 
                      border: "2px solid var(--lingueefy-accent)",
                      opacity: 0.6,
                    }}
                  />
                  {/* Avatar */}
                  <div 
                    className="w-16 h-16 rounded-full overflow-hidden border-3 transition-all"
                    style={{ 
                      borderColor: "var(--lingueefy-accent)",
                      boxShadow: "0 0 20px rgba(23, 226, 198, 0.4)",
                    }}
                  >
                    <img 
                      loading="lazy" src={STEVEN_AVATAR}
                      alt="Steven Barholere"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";
                      }}
                    />
                  </div>
                  {/* AI Badge */}
                  <div 
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: "var(--lingueefy-accent)",
                      boxShadow: "0 2px 8px rgba(23, 226, 198, 0.5)",
                    }}
                  >
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  {/* Online status dot */}
                  <div 
                    className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: "var(--lingueefy-accent)" }}
                  />
                </div>
                <span className="text-white/80 text-xs font-medium mt-1">
                  SLE AI Coach
                </span>
              </button>

              {/* Steven AI Popup */}
              {stevenAIOpen && (
                <div 
                  id="steven-ai-popup"
                  role="dialog"
                  aria-modal="true"
                  aria-label={language === "fr" ? "SLE AI Coach" : "SLE AI Coach"}
                  className="absolute top-full right-0 mt-4 w-[380px] bg-white rounded-2xl shadow-2xl z-[100] overflow-hidden"
                  style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
                >
                  {/* Header */}
                  <div 
                    className="p-5 flex items-center gap-3 relative"
                    style={{ background: "linear-gradient(135deg, var(--lingueefy-accent) 0%, #0F9D8E 100%)" }}
                  >
                    <img 
                      loading="lazy" src={STEVEN_AVATAR} 
                      alt="Prof. Steven Barholere"
                      className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                    />
                    <div>
                      <h3 className="text-white text-lg font-extrabold flex items-center gap-2">
                        SLE AI Coach
                        <span className="bg-white/25 text-[11px] px-2 py-0.5 rounded-md font-extrabold">
                          Powered by Lingueefy
                        </span>
                      </h3>
                      <p className="text-white/90 text-sm">Your Personal SLE Language Coach</p>
                    </div>
                    <button 
                      onClick={() => setStevenAIOpen(false)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/35 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:rotate-90"
                      aria-label={language === "fr" ? "Fermer" : "Close"}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    {/* Welcome */}
                    <div className="text-center mb-4">
                      <h4 className="text-base font-extrabold text-gray-900 mb-2">👋 {t.welcome}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{t.welcomeDesc}</p>
                    </div>

                    {/* 3 Main Options */}
                    <div className="flex flex-col gap-2.5">
                      {/* Voice Practice Sessions */}
                      <Link href="/ai-coach?mode=voice" onClick={() => setStevenAIOpen(false)}>
                        <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-teal-500 hover:translate-x-1 cursor-pointer">
                          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                            <Mic className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h5 className="text-sm font-extrabold text-gray-900">{t.voicePractice}</h5>
                            <p className="text-xs text-gray-500">{t.voicePracticeDesc}</p>
                          </div>
                        </div>
                      </Link>

                      {/* SLE Placement Tests */}
                      <Link href="/ai-coach?mode=placement" onClick={() => setStevenAIOpen(false)}>
                        <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 hover:translate-x-1 cursor-pointer">
                          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ClipboardCheck className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h5 className="text-sm font-extrabold text-gray-900">{t.placementTest}</h5>
                            <p className="text-xs text-gray-500">{t.placementTestDesc}</p>
                          </div>
                        </div>
                      </Link>

                      {/* Oral Exam Simulations */}
                      <Link href="/ai-coach?mode=simulation" onClick={() => setStevenAIOpen(false)}>
                        <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-[#E7F2F2] to-[#FFFFFF] hover:from-[#0F3D3E] hover:to-[#E06B2D] rounded-xl transition-all duration-300 border-2 border-transparent hover:border-[#0F3D3E] hover:translate-x-1 cursor-pointer">
                          <div className="w-11 h-11 bg-gradient-to-br from-[#0F3D3E] to-[#145A5B] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h5 className="text-sm font-extrabold text-gray-900">{t.examSimulation}</h5>
                            <p className="text-xs text-gray-500">{t.examSimulationDesc}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 bg-white text-center border-t border-gray-100">
                    <span className="text-xs text-gray-500">⚡ {t.poweredBy}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Brand Indicator */}
            <div className="lg:hidden flex items-center gap-3">
              {activeBrand && activeBrand !== "hub" && (
                <div 
                  className="flex items-center px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <span className="text-white text-sm font-medium">
                    {brandTiles.find(t => t.id === activeBrand)?.name || "Ecosystem"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

// Mobile Menu Component
function MobileMenu({ 
  activeBrand, 
  onClose, 
  language 
}: { 
  activeBrand: string | null; 
  onClose: () => void;
  language: string;
}) {
  const { toggleTheme, isDark } = useTheme();
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: "var(--sand)" }}
      >
        <span 
          className="font-display font-semibold"
          style={{ color: "var(--text)" }}
        >
          {language === "fr" ? "Menu" : "Menu"}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="rounded-full"
        >
          <X className="h-5 w-5" style={{ color: "var(--muted)" }} />
        </Button>
      </div>

      {/* Brand Navigation */}
      <div className="flex-1 p-4 space-y-3">
        <p 
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: "var(--muted)" }}
        >
          {language === "fr" ? "Nos marques" : "Our Brands"}
        </p>
        
        {brandTiles.map((tile) => {
          const isActive = activeBrand === tile.id;
          
          return (
            <Link
              key={tile.id}
              href={tile.path}
              onClick={onClose}
            >
              <div
                className={`
                  flex items-center gap-3 p-4 rounded-xl transition-all
                  ${isActive ? "ring-2" : "hover:bg-sand/30"}
                `}
                style={{
                  backgroundColor: isActive ? "var(--brand-foundation-soft)" : "transparent",
                  // ringColor handled via Tailwind ring-2 class
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: tile.style === "light-glass" 
                      ? "var(--lingueefy-accent)" 
                      : tile.style === "obsidian-glass"
                        ? "var(--brand-obsidian)"
                        : "var(--brand-cta)",
                  }}
                >
                  {tile.id === "rusingacademy" && (
                    <span className="text-white font-bold text-lg">R</span>
                  )}
                  {tile.id === "lingueefy" && (
                    <span className="text-white font-bold text-lg">L</span>
                  )}
                  {tile.id === "barholex" && (
                    <span style={{ color: "var(--barholex-gold)" }} className="font-bold text-lg">B</span>
                  )}
                </div>
                <div>
                  <span 
                    className="font-semibold block"
                    style={{ color: "var(--text)" }}
                  >
                    {tile.name}
                  </span>
                  <span 
                    className="text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {tile.subtitle[language as "en" | "fr"]}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Steven AI in Mobile */}
        <Link href="/prof-steven-ai" onClick={onClose}>
          <div className="flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-sand/30 mt-4 border-t pt-6" style={{ borderColor: "var(--sand)" }}>
            <div 
              className="w-10 h-10 rounded-full overflow-hidden border-2"
              style={{ borderColor: "var(--lingueefy-accent)" }}
            >
              <img 
                loading="lazy" src={STEVEN_AVATAR}
                alt="Prof Steven AI"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-semibold block" style={{ color: "var(--text)" }}>
                SLE AI Coach
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {language === "fr" ? "Coach IA ELS" : "SLE AI Coach"}
              </span>
            </div>
            <div 
              className="ml-auto px-2 py-1 rounded-md text-xs font-bold"
              style={{ 
                backgroundColor: "var(--lingueefy-accent)",
                color: "white",
              }}
            >
              AI
            </div>
          </div>
        </Link>
      </div>

      {/* Theme Toggle in Mobile */}
      <div 
        className="px-4 pb-2"
      >
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:bg-sand/30"
          style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "transparent" }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: isDark ? "var(--barholex-gold)" : "var(--brand-obsidian)",
              }}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-white" />
              ) : (
                <Moon className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <span className="font-semibold block" style={{ color: "var(--text)" }}>
                {language === "fr" ? "Thème" : "Theme"}
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {isDark 
                  ? (language === "fr" ? "Mode sombre actif" : "Dark mode active")
                  : (language === "fr" ? "Mode clair actif" : "Light mode active")
                }
              </span>
            </div>
          </div>
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ 
              backgroundColor: isDark ? "var(--barholex-gold-soft)" : "var(--brand-foundation-soft)",
              color: isDark ? "var(--barholex-gold)" : "var(--brand-foundation)",
            }}
          >
            {isDark ? (language === "fr" ? "Sombre" : "Dark") : (language === "fr" ? "Clair" : "Light")}
          </div>
        </button>
      </div>

      {/* Footer */}
      <div 
        className="p-4 border-t"
        style={{ borderColor: "var(--sand)" }}
      >
        <Link href="/" onClick={onClose}>
          <div 
            className="text-center py-3 rounded-xl transition-all hover:bg-sand/30"
            style={{ color: "var(--muted)" }}
          >
            <span className="text-sm">
              {language === "fr" ? "← Retour à l'écosystème" : "← Back to Ecosystem"}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
