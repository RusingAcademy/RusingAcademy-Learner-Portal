import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface BreadcrumbItem {
  label: string;
  labelFr?: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const { language } = useLanguage();
  const isEn = language === "en";

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isEn ? "Home" : "Accueil",
        "item": typeof window !== "undefined" ? window.location.origin : ""
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": isEn ? item.label : (item.labelFr || item.label),
        "item": item.href 
          ? (typeof window !== "undefined" ? `${window.location.origin}${item.href}` : item.href)
          : undefined
      }))
    ]
  };

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual Breadcrumb Navigation */}
      <nav className={`container py-4 ${className}`} aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm flex-wrap">
          {/* Home Link */}
          <li>
            <Link 
              href="/" 
              className="flex items-center gap-1 text-muted-foreground hover:text-teal-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>{isEn ? "Home" : "Accueil"}</span>
            </Link>
          </li>

          {/* Dynamic Breadcrumb Items */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const displayLabel = isEn ? item.label : (item.labelFr || item.label);

            return (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {isLast || !item.href ? (
                  <span className="font-medium text-teal-700" aria-current="page">
                    {displayLabel}
                  </span>
                ) : (
                  <Link 
                    href={item.href} 
                    className="text-muted-foreground hover:text-teal-600 transition-colors"
                  >
                    {displayLabel}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumb;
