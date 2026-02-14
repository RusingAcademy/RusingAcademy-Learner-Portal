import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { NavDropdown, MobileNavDropdown } from "./NavDropdown";

/**
 * RusingAcademySubHeader — CMS-driven navigation with dropdown sub-menus
 * 
 * Visual design is IMMUTABLE (Golden reference). Only the navigation DATA
 * is sourced from CMS when available, falling back to hardcoded defaults.
 * Now supports multi-level dropdown menus via NavDropdown component.
 * 
 * Admin can manage these items from: Admin → Pages & CMS → Navigation
 * Create a menu named "rusingacademy" with location "header" to override.
 */
export default function RusingAcademySubHeader() {
  const { language } = useLanguage();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { items: navItems } = useNavigation("rusingacademy");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 220);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div 
      className="sticky top-0 z-40 transition-all duration-300 ease-in-out"
      style={{ 
        backgroundColor: isScrolled ? "rgba(255, 248, 240, 0.97)" : "var(--surface)",
        borderBottom: isScrolled ? "1px solid rgba(200, 120, 60, 0.15)" : "1px solid var(--sand)",
        backdropFilter: isScrolled ? "blur(12px)" : "blur(8px)",
        boxShadow: isScrolled ? "0 4px 20px rgba(200, 120, 60, 0.12)" : "none",
      }}
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
        <div 
          className="flex items-center justify-between transition-all duration-300 ease-in-out"
          style={{ height: isScrolled ? "44px" : "44px" }}
        >
          {/* Home Button - Left */}
          <Link href="/" className="flex items-center justify-center transition-all duration-300 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700" style={{ width: isScrolled ? "36px" : "40px", height: isScrolled ? "36px" : "40px" }}>
            <Home className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </Link>

          {/* Logo/Brand */}
          <Link href="/rusingacademy" className="flex items-center transition-all duration-300 ml-3">
            <img 
              loading="lazy" src="/images/logos/rusingacademy-icon.png" 
              alt="RusingAcademy Logo"
              className="transition-all duration-300 rounded-lg"
              style={{ 
                width: isScrolled ? "36px" : "40px",
                height: isScrolled ? "36px" : "40px",
                objectFit: "contain",
              }}
            />
          </Link>

          {/* Desktop Navigation — CMS-driven with dropdown support */}
          <nav 
            className="hidden lg:flex items-center gap-1"
            role="navigation"
            aria-label={language === "fr" ? "Navigation RusingAcademy" : "RusingAcademy Navigation"}
          >
            {navItems.map((link) => (
              <NavDropdown
                key={link.id}
                item={link}
                language={language}
                isActive={isActive}
                isScrolled={isScrolled}
                activeColor="var(--brand-cta)"
                activeBg="var(--brand-cta-soft)"
              />
            ))}
          </nav>

          {/* CTA - Desktop (Copper local action) */}
          <div className="hidden lg:block">
            <Link href="/courses">
              <Button 
                size="sm"
                className="btn-cta rounded-full font-semibold flex items-center gap-2 transition-all duration-300"
                style={{
                  backgroundColor: "var(--brand-cta)",
                  color: "white",
                  boxShadow: isScrolled ? "0 2px 8px rgba(0, 0, 0, 0.15)" : "var(--shadow-md)",
                  padding: isScrolled ? "6px 14px" : "8px 16px",
                  fontSize: isScrolled ? "13px" : "14px",
                }}
              >
                {language === "fr" ? "S'inscrire" : "Enroll Now"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation — CMS-driven with accordion sub-menus */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-full h-8 w-8 min-h-[44px] min-w-[44px]"
                  style={{ color: "var(--muted)" }}
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="top" 
                className="h-auto"
                style={{ 
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--sand)",
                }}
              >
                <nav className="flex flex-col gap-1 py-4">
                  {navItems.map((link) => (
                    <MobileNavDropdown
                      key={link.id}
                      item={link}
                      language={language}
                      isActive={isActive}
                      activeColor="var(--brand-cta)"
                      activeBg="var(--brand-cta-soft)"
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                  <div 
                    className="mt-4 px-4"
                    style={{ borderTop: "1px solid var(--sand)", paddingTop: "1rem" }}
                  >
                    <Link href="/courses" onClick={() => setMobileOpen(false)}>
                      <Button 
                        className="w-full rounded-full font-semibold btn-cta"
                        style={{
                          backgroundColor: "var(--brand-cta)",
                          color: "white",
                        }}
                      >
                        {language === "fr" ? "S'inscrire" : "Enroll Now"}
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
