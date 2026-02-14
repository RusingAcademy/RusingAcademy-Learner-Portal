import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Globe, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useFooterNavigation, type NavItem } from "@/hooks/useNavigation";

// Official RusingAcademy logo
const LOGO_URL = "https://rusingacademy-cdn.b-cdn.net/images/logos/rusingacademy-logo.png";

// ============================================================================
// Hardcoded fallback footer columns — exact match of the original Footer.tsx
// These are used when no CMS footer menus exist (seamless fallback).
// ============================================================================

interface FooterColumn {
  titleKey: string; // translation key or raw label
  titleEn: string;
  titleFr: string;
  ariaEn: string;
  ariaFr: string;
  links: { href: string; labelEn: string; labelFr: string }[];
}

const FALLBACK_COLUMNS: FooterColumn[] = [
  {
    titleKey: "footer.forLearners",
    titleEn: "For Learners",
    titleFr: "Pour les apprenants",
    ariaEn: "Learner links",
    ariaFr: "Liens pour apprenants",
    links: [
      { href: "/coaches", labelEn: "Find a Coach", labelFr: "Trouver un coach" },
      { href: "/pricing", labelEn: "Pricing", labelFr: "Tarification" },
      { href: "/curriculum", labelEn: "Our Curriculum", labelFr: "Notre Curriculum" },
      { href: "/faq", labelEn: "FAQ", labelFr: "FAQ" },
    ],
  },
  {
    titleKey: "footer.forCoaches",
    titleEn: "For Coaches",
    titleFr: "Pour les coachs",
    ariaEn: "Coach links",
    ariaFr: "Liens pour coachs",
    links: [
      { href: "/become-a-coach", labelEn: "Become a Coach", labelFr: "Devenir coach" },
      { href: "/for-departments", labelEn: "For Departments", labelFr: "Pour les ministères" },
      { href: "/rusingacademy/for-business", labelEn: "For Business", labelFr: "Pour les entreprises" },
      { href: "/rusingacademy/for-government", labelEn: "For Government", labelFr: "Pour le gouvernement" },
      { href: "/blog", labelEn: "Blog", labelFr: "Blog" },
    ],
  },
  {
    titleKey: "footer.company",
    titleEn: "Company",
    titleFr: "Entreprise",
    ariaEn: "Company links",
    ariaFr: "Liens entreprise",
    links: [
      { href: "/about", labelEn: "About", labelFr: "À propos" },
      { href: "/contact", labelEn: "Contact", labelFr: "Contact" },
      { href: "/privacy", labelEn: "Privacy", labelFr: "Confidentialité" },
      { href: "/terms", labelEn: "Terms", labelFr: "Conditions" },
      { href: "/cookies", labelEn: "Cookies", labelFr: "Cookies" },
      { href: "/accessibility", labelEn: "Accessibility", labelFr: "Accessibilité" },
    ],
  },
];

// Column title mapping from CMS menu names to display labels
const MENU_TITLE_MAP: Record<string, { en: string; fr: string; ariaEn: string; ariaFr: string }> = {
  "footer-learners": { en: "For Learners", fr: "Pour les apprenants", ariaEn: "Learner links", ariaFr: "Liens pour apprenants" },
  "footer-coaches": { en: "For Coaches", fr: "Pour les coachs", ariaEn: "Coach links", ariaFr: "Liens pour coachs" },
  "footer-company": { en: "Company", fr: "Entreprise", ariaEn: "Company links", ariaFr: "Liens entreprise" },
};

/**
 * Parse a bilingual CMS label ("EN | FR" pipe format) into separate strings.
 */
function parseLabel(label: string): { en: string; fr: string } {
  if (!label) return { en: "", fr: "" };
  const parts = label.split("|").map(s => s.trim());
  if (parts.length >= 2) return { en: parts[0], fr: parts[1] };
  return { en: label, fr: label };
}

export default function Footer() {
  const { language, t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch CMS footer navigation
  const { menus, isLoading: navLoading } = useFooterNavigation();

  // Build footer columns from CMS data or fallback
  const columns = useMemo(() => {
    if (!menus || menus.length === 0) {
      // No CMS menus — use hardcoded fallback
      return FALLBACK_COLUMNS.map(col => ({
        title: language === "fr" ? col.titleFr : col.titleEn,
        ariaLabel: language === "fr" ? col.ariaFr : col.ariaEn,
        links: col.links.map(link => ({
          href: link.href,
          label: language === "fr" ? link.labelFr : link.labelEn,
        })),
      }));
    }

    // CMS menus exist — transform them into footer columns
    return menus.map((menu: any) => {
      const titleInfo = MENU_TITLE_MAP[menu.name] || { en: menu.name, fr: menu.name, ariaEn: menu.name, ariaFr: menu.name };
      const items = (menu.items || [])
        .filter((item: any) => item.isVisible !== 0)
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

      return {
        title: language === "fr" ? titleInfo.fr : titleInfo.en,
        ariaLabel: language === "fr" ? titleInfo.ariaFr : titleInfo.ariaEn,
        links: items.map((item: any) => {
          const { en, fr } = parseLabel(item.label || "");
          return {
            href: item.url || "#",
            label: language === "fr" ? fr : en,
            target: item.target || "_self",
          };
        }),
      };
    });
  }, [menus, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
    setEmail("");
    setName("");
    
    // Reset after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/rusingacademy", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/rusingacademy", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/rusingacademy", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com/rusingacademy", label: "Instagram" },
  ];

  return (
    <footer 
      className="relative bg-slate-900 text-white overflow-visible"
      role="contentinfo"
      aria-label={language === "fr" ? "Pied de page" : "Footer"}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-transparent to-slate-900" aria-hidden="true" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" aria-hidden="true" />
      
      {/* Contact Form Section */}
      <div className="border-b border-slate-700/50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8 relative z-10 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-8 md:p-10 shadow-2xl shadow-teal-500/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {language === "fr" ? "Prêt à commencer ?" : "Ready to Get Started?"}
                  </h3>
                  <p className="text-teal-100 text-base">
                    {language === "fr" 
                      ? "Inscrivez-vous pour recevoir des conseils gratuits sur les examens SLE et des offres exclusives."
                      : "Sign up to receive free SLE exam tips and exclusive offers."}
                  </p>
                </div>
                
                {isSubmitted ? (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-white mx-auto mb-3" />
                    <p className="text-white font-semibold text-lg">
                      {language === "fr" ? "Merci !" : "Thank you!"}
                    </p>
                    <p className="text-teal-100 text-sm mt-1">
                      {language === "fr" 
                        ? "Nous vous contacterons bientôt."
                        : "We'll be in touch soon."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder={language === "fr" ? "Votre nom" : "Your name"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                    />
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder={language === "fr" ? "Votre courriel" : "Your email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      />
                      <Button 
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 h-auto bg-white text-teal-600 hover:bg-teal-50 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                      >
                        {isLoading ? (
                          <div className="h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-teal-100/80">
                      {language === "fr" 
                        ? "En vous inscrivant, vous acceptez notre politique de confidentialité."
                        : "By signing up, you agree to our privacy policy."}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8 relative z-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand Column — always static, not CMS-driven */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl">
              <img 
                loading="lazy" src={LOGO_URL}
                alt="RusingAcademy" 
                className="h-14 w-auto brightness-110"
              />
            </Link>
            <p className="text-slate-300 max-w-sm leading-relaxed text-base">
              {t("footer.tagline")}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4 pt-2">
              <a 
                href="mailto:admin@rusingacademy.ca" 
                className="flex items-center gap-3 text-slate-300 hover:text-teal-400 transition-colors group"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center group-hover:border-teal-500/50 group-hover:bg-teal-900/30 transition-all">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">admin@rusingacademy.ca</span>
              </a>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Ottawa, Ontario, Canada</span>
              </div>
              <a 
                href="https://www.rusingacademy.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-300 hover:text-teal-400 transition-colors group"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center group-hover:border-teal-500/50 group-hover:bg-teal-900/30 transition-all">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">www.rusingacademy.com</span>
              </a>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 w-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-teal-600 hover:border-teal-500 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* CMS-driven footer columns (or hardcoded fallback) */}
          {columns.map((col, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider border-b border-teal-500/30 pb-3">
                {col.title}
              </h4>
              <nav aria-label={col.ariaLabel}>
                <ul className="space-y-3" role="list">
                  {col.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      {(link as any).target === "_blank" ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-teal-400 transition-colors text-sm font-medium hover:translate-x-1 inline-block"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link 
                          href={link.href} 
                          className="text-slate-300 hover:text-teal-400 transition-colors text-sm font-medium hover:translate-x-1 inline-block"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar — always static (copyright is non-negotiable) */}
      <div className="border-t border-slate-700/50 bg-slate-950/50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Parent Company Link */}
            <div className="flex items-center gap-2 text-center md:text-left">
              <span className="text-sm text-slate-300">
                {language === "fr" ? "Une entreprise de" : "A company of"}
              </span>
              <a 
                href="https://www.rusingacademy.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors"
              >
                RusingAcademy
              </a>
            </div>
            
            {/* Copyright — non-negotiable, always displayed */}
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-300">
                © 2026 <span className="font-semibold text-white">Rusinga International Consulting Ltd.</span>
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {language === "fr" 
                  ? "Commercialement connue sous le nom de RusingAcademy. Tous droits réservés."
                  : "Commercially known as RusingAcademy. All rights reserved."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
