import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, MapPin, Globe, Phone } from "lucide-react";

/**
 * FooterInstitutional - Institutional Footer Component
 * 
 * Per Guide Maître v3.0 specifications:
 * - 3 columns: Explorer l'Écosystème | Obtenir de l'Aide | À Propos & Légal
 * - Copyright: © 2026 Rusinga International Consulting Ltd.
 * - Commercially known as RusingÂcademy
 * - Follows design-tokens.json v3.0 specifications
 */

// Design tokens from design-tokens.json v3.0
const TOKENS = {
  colors: {
    bg: { canvas: "#FEFEF8", surface: "#FFFFFF" },
    text: { primary: "#0B1220", secondary: "#3A4456", muted: "#6B7280", onDark: "#FFFFFF" },
    accent: { navy: "#0F2A44", teal: "#0E7490", purple: "#6D28D9" },
    border: { subtle: "#E7E7DF", strong: "#D3D3C9" },
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  radius: { sm: "10px", md: "16px", lg: "24px" },
  shadow: { "2": "0 6px 18px rgba(15, 23, 42, 0.10)" },
};

export default function FooterInstitutional() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Social links
  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/rusingacademy", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/rusingacademy", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/rusingacademy", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com/rusingacademy", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com/@rusingacademy", label: "YouTube" },
  ];

  // Column 1: Explorer l'Écosystème
  const ecosystemLinks = language === "fr" ? [
    { href: "/rusingacademy", label: "RusingÂcademy" },
    { href: "/lingueefy", label: "Lingueefy" },
    { href: "/barholex", label: "Barholex Media" },
    { href: "/courses", label: "Nos cours" },
    { href: "/coaches", label: "Nos coachs" },
    { href: "/pricing", label: "Tarification" },
  ] : [
    { href: "/rusingacademy", label: "RusingÂcademy" },
    { href: "/lingueefy", label: "Lingueefy" },
    { href: "/barholex", label: "Barholex Media" },
    { href: "/courses", label: "Our Courses" },
    { href: "/coaches", label: "Our Coaches" },
    { href: "/pricing", label: "Pricing" },
  ];

  // Column 2: Obtenir de l'Aide
  const helpLinks = language === "fr" ? [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Nous contacter" },
    { href: "/support", label: "Centre d'aide" },
    { href: "/for-departments", label: "Pour les ministères" },
    { href: "/become-a-coach", label: "Devenir coach" },
  ] : [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
    { href: "/support", label: "Help Center" },
    { href: "/for-departments", label: "For Departments" },
    { href: "/become-a-coach", label: "Become a Coach" },
  ];

  // Column 3: À Propos & Légal
  const legalLinks = language === "fr" ? [
    { href: "/about", label: "À propos" },
    { href: "/privacy", label: "Politique de confidentialité" },
    { href: "/terms", label: "Conditions d'utilisation" },
    { href: "/cookies", label: "Politique de cookies" },
    { href: "/accessibility", label: "Accessibilité" },
  ] : [
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/accessibility", label: "Accessibility" },
  ];

  return (
    <footer 
      className="relative bg-slate-900 text-white overflow-hidden"
      role="contentinfo"
      aria-label={language === "fr" ? "Pied de page institutionnel" : "Institutional Footer"}
      style={{ fontFamily: TOKENS.typography.fontFamily }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-transparent to-slate-900" aria-hidden="true" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" aria-hidden="true" />
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8 relative z-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl">
              <img 
                loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/logos/rusingacademy-logo.png" 
                alt="RusingAcademy Logo" 
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-300 max-w-xs leading-relaxed text-sm">
              {language === "fr" 
                ? "L'écosystème de formation bilingue de référence au Canada pour les fonctionnaires et professionnels."
                : "Canada's premier bilingual training ecosystem for public servants and professionals."}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 pt-2">
              <a 
                href="mailto:admin@rusingacademy.ca" 
                className="flex items-center gap-3 text-slate-300 hover:text-teal-400 transition-colors group text-sm"
              >
                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>admin@rusingacademy.ca</span>
              </a>
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>Ottawa, Ontario, Canada</span>
              </div>
              <a 
                href="https://www.rusingacademy.ca" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-300 hover:text-teal-400 transition-colors group text-sm"
              >
                <Globe className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>www.rusingacademy.ca</span>
              </a>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-2 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-teal-600 hover:border-teal-500 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 1: Explorer l'Écosystème */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider border-b border-teal-500/30 pb-3">
              {language === "fr" ? "Explorer l'Écosystème" : "Explore the Ecosystem"}
            </h4>
            <nav aria-label={language === "fr" ? "Liens de l'écosystème" : "Ecosystem links"}>
              <ul className="space-y-3" role="list">
                {ecosystemLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-slate-300 hover:text-teal-400 transition-colors text-sm font-medium hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 2: Obtenir de l'Aide */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider border-b border-teal-500/30 pb-3">
              {language === "fr" ? "Obtenir de l'Aide" : "Get Help"}
            </h4>
            <nav aria-label={language === "fr" ? "Liens d'aide" : "Help links"}>
              <ul className="space-y-3" role="list">
                {helpLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-slate-300 hover:text-teal-400 transition-colors text-sm font-medium hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3: À Propos & Légal */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider border-b border-teal-500/30 pb-3">
              {language === "fr" ? "À Propos & Légal" : "About & Legal"}
            </h4>
            <nav aria-label={language === "fr" ? "Liens légaux" : "Legal links"}>
              <ul className="space-y-3" role="list">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-slate-300 hover:text-teal-400 transition-colors text-sm font-medium hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Copyright */}
      <div className="border-t border-slate-700/50 bg-slate-950/50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Parent Company */}
            <div className="flex items-center gap-2 text-center md:text-left">
              <span className="text-sm text-slate-300">
                {language === "fr" ? "Une entreprise de" : "A company of"}
              </span>
              <a 
                href="https://www.rusingacademy.ca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors"
              >
                Rusinga International Consulting Ltd.
              </a>
            </div>
            
            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-300">
                © {currentYear} <span className="font-semibold text-white">Rusinga International Consulting Ltd.</span>
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {language === "fr" 
                  ? "Commercialement connue sous le nom de RusingÂcademy. Tous droits réservés."
                  : "Commercially known as RusingÂcademy. All rights reserved."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
