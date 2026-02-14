import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { NavDropdown, MobileNavDropdown } from "./NavDropdown";

/**
 * BarholexSubHeader — CMS-driven navigation with dropdown sub-menus
 * 
 * Visual design is IMMUTABLE (Golden reference). Only the navigation DATA
 * is sourced from CMS when available, falling back to hardcoded defaults.
 * Now supports multi-level dropdown menus via NavDropdown component.
 * 
 * Admin can manage these items from: Admin → Pages & CMS → Navigation
 * Create a menu named "barholex" with location "header" to override.
 */
export default function BarholexSubHeader() {
  const { language } = useLanguage();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { items: navItems } = useNavigation("barholex");

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
        backgroundColor: isScrolled ? "rgba(255, 252, 240, 0.97)" : "var(--surface)",
        borderBottom: isScrolled ? "1px solid rgba(212, 175, 55, 0.15)" : "1px solid var(--sand)",
        backdropFilter: isScrolled ? "blur(12px)" : "blur(8px)",
        boxShadow: isScrolled ? "0 4px 20px rgba(212, 175, 55, 0.12)" : "none",
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
          <Link href="/barholex-media" className="flex items-center gap-2 transition-all duration-300 ml-3">
            <img 
              loading="lazy" src="/barholex-logo.png" 
              alt="Barholex Media Logo"
              className="transition-all duration-300 object-contain"
              style={{ 
                height: isScrolled ? "32px" : "36px",
                width: "auto",
              }}
            />
          </Link>

          {/* Desktop Navigation — CMS-driven with dropdown support */}
          <nav 
            className="hidden lg:flex items-center gap-1"
            role="navigation"
            aria-label={language === "fr" ? "Navigation Barholex Media" : "Barholex Media Navigation"}
          >
            {navItems.map((link) => (
              <NavDropdown
                key={link.id}
                item={link}
                language={language}
                isActive={isActive}
                isScrolled={isScrolled}
                activeColor="var(--barholex-gold)"
                activeBg="var(--barholex-gold-soft)"
              />
            ))}
          </nav>

          {/* CTA - Desktop (Gold local action) */}
          <div className="hidden lg:block">
            <Link href="/barholex/contact">
              <Button 
                size="sm"
                className="rounded-full font-semibold flex items-center gap-2 transition-all duration-300"
                style={{
                  backgroundColor: "var(--barholex-gold)",
                  color: "var(--brand-obsidian)",
                  boxShadow: isScrolled ? "0 2px 8px rgba(0, 0, 0, 0.15)" : "var(--shadow-md)",
                  padding: isScrolled ? "6px 14px" : "8px 16px",
                  fontSize: isScrolled ? "13px" : "14px",
                }}
              >
                {language === "fr" ? "Nous contacter" : "Get in Touch"}
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
                      activeColor="var(--barholex-gold)"
                      activeBg="var(--barholex-gold-soft)"
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                  <div 
                    className="mt-4 px-4"
                    style={{ borderTop: "1px solid var(--sand)", paddingTop: "1rem" }}
                  >
                    <Link href="/barholex/contact" onClick={() => setMobileOpen(false)}>
                      <Button 
                        className="w-full rounded-full font-semibold"
                        style={{
                          backgroundColor: "var(--barholex-gold)",
                          color: "var(--brand-obsidian)",
                        }}
                      >
                        {language === "fr" ? "Nous contacter" : "Get in Touch"}
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
