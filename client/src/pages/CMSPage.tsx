import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { useRef, useEffect, useState } from "react";

/**
 * Public CMS Page Renderer — renders published CMS pages at /p/:slug
 * Supports all 16 section types with proper styling and responsive layout
 */

/**
 * AnimatedSection — Intersection Observer wrapper for section animations.
 * Respects prefers-reduced-motion for accessibility.
 * Uses CSS transforms for GPU-accelerated performance.
 */
function AnimatedSection({ section, children }: { section: any; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animation = section.animation || "none";
  const delay = section.animationDelay || 0;
  const duration = section.animationDuration || 600;

  useEffect(() => {
    if (animation === "none" || !ref.current) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animation, delay]);

  if (animation === "none") return <>{children}</>;

  const getInitialStyle = (): React.CSSProperties => {
    switch (animation) {
      case "fade-in":
        return { opacity: 0 };
      case "slide-up":
        return { opacity: 0, transform: "translateY(30px)" };
      case "slide-left":
        return { opacity: 0, transform: "translateX(-30px)" };
      case "slide-right":
        return { opacity: 0, transform: "translateX(30px)" };
      case "scale-in":
        return { opacity: 0, transform: "scale(0.95)" };
      case "blur-in":
        return { opacity: 0, filter: "blur(4px)" };
      default:
        return {};
    }
  };

  const style: React.CSSProperties = isVisible
    ? {
        opacity: 1,
        transform: "none",
        filter: "none",
        transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }
    : {
        ...getInitialStyle(),
        transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      };

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

function SectionRenderer({ section }: { section: any }) {
  const content = typeof section.content === "string"
    ? (() => { try { return JSON.parse(section.content); } catch { return {}; } })()
    : (section.content || {});

  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.backgroundColor || undefined,
    color: section.textColor || undefined,
    paddingTop: `${section.paddingTop ?? 48}px`,
    paddingBottom: `${section.paddingBottom ?? 48}px`,
  };

  switch (section.sectionType) {
    case "hero":
      return (
        <section style={sectionStyle} className="relative overflow-hidden">
          <div className="container max-w-6xl mx-auto px-6 text-center">
            {content.backgroundImage && (
              <div className="absolute inset-0 z-0">
                <img src={content.backgroundImage} alt="" className="w-full h-full object-cover opacity-30" />
              </div>
            )}
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {section.title || "Hero Title"}
              </h1>
              {section.subtitle && (
                <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto mb-8">
                  {section.subtitle}
                </p>
              )}
              {content.ctaText && (
                <Button size="lg" className="text-lg px-8 py-3" asChild>
                  <a href={content.ctaUrl || "#"}>{content.ctaText}</a>
                </Button>
              )}
            </div>
          </div>
        </section>
      );

    case "text_block":
    case "text":
      return (
        <section style={sectionStyle}>
          <div className="container max-w-4xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold mb-4">{section.title}</h2>}
            {section.subtitle && <p className="text-lg opacity-70 mb-6">{section.subtitle}</p>}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content.html || content.text || "" }}
            />
          </div>
        </section>
      );

    case "features":
      const features = content.items || content.features || [];
      return (
        <section style={sectionStyle}>
          <div className="container max-w-6xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-4">{section.title}</h2>}
            {section.subtitle && <p className="text-lg opacity-70 text-center mb-12 max-w-2xl mx-auto">{section.subtitle}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f: any, i: number) => (
                <div key={i} className="p-6 rounded-xl border bg-white/5 backdrop-blur-sm">
                  {f.icon && <div className="text-3xl mb-3">{f.icon}</div>}
                  <h3 className="text-xl font-semibold mb-2">{f.title || `Feature ${i + 1}`}</h3>
                  <p className="opacity-70">{f.description || ""}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "testimonials":
      const testimonials = content.items || content.testimonials || [];
      return (
        <section style={sectionStyle}>
          <div className="container max-w-6xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-12">{section.title}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t: any, i: number) => (
                <div key={i} className="p-6 rounded-xl border bg-white/5">
                  <p className="italic mb-4 opacity-80">"{t.quote || t.text || ""}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar && <img src={t.avatar} alt="" className="w-10 h-10 rounded-full" />}
                    <div>
                      <p className="font-semibold">{t.name || "Anonymous"}</p>
                      {t.role && <p className="text-sm opacity-60">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "cta":
      return (
        <section style={sectionStyle}>
          <div className="container max-w-4xl mx-auto px-6 text-center">
            {section.title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.title}</h2>}
            {section.subtitle && <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">{section.subtitle}</p>}
            <div className="flex flex-wrap gap-4 justify-center">
              {content.primaryText && (
                <Button size="lg" asChild>
                  <a href={content.primaryUrl || "#"}>{content.primaryText}</a>
                </Button>
              )}
              {content.secondaryText && (
                <Button size="lg" variant="outline" asChild>
                  <a href={content.secondaryUrl || "#"}>{content.secondaryText}</a>
                </Button>
              )}
            </div>
          </div>
        </section>
      );

    case "image_gallery":
      const images = content.images || content.items || [];
      return (
        <section style={sectionStyle}>
          <div className="container max-w-6xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-8">{section.title}</h2>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img: any, i: number) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img src={typeof img === "string" ? img : img.url} alt={img.alt || ""} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "video":
      return (
        <section style={sectionStyle}>
          <div className="container max-w-4xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-8">{section.title}</h2>}
            <div className="aspect-video rounded-xl overflow-hidden border shadow-lg">
              {content.embedUrl ? (
                <iframe src={content.embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
              ) : content.url ? (
                <video src={content.url} controls className="w-full h-full" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  No video configured
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case "faq":
      const faqs = content.items || content.faqs || [];
      return (
        <section style={sectionStyle}>
          <div className="container max-w-3xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-8">{section.title}</h2>}
            <div className="space-y-4">
              {faqs.map((faq: any, i: number) => (
                <details key={i} className="group border rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold flex items-center justify-between">
                    {faq.question || faq.title || `Question ${i + 1}`}
                    <span className="text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-4 pb-4 opacity-80">{faq.answer || faq.content || ""}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      );

    case "pricing_table":
    case "pricing":
      const plans = content.plans || content.items || [];
      return (
        <section style={sectionStyle}>
          <div className="container max-w-6xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-4">{section.title}</h2>}
            {section.subtitle && <p className="text-lg opacity-70 text-center mb-12">{section.subtitle}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan: any, i: number) => (
                <div key={i} className={`p-8 rounded-xl border ${plan.featured ? "border-primary ring-2 ring-primary/20 scale-105" : ""}`}>
                  <h3 className="text-xl font-bold mb-2">{plan.name || `Plan ${i + 1}`}</h3>
                  <p className="text-3xl font-bold mb-4">{plan.price || "$0"}<span className="text-sm font-normal opacity-60">/{plan.interval || "mo"}</span></p>
                  <ul className="space-y-2 mb-6">
                    {(plan.features || []).map((f: string, j: number) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.featured ? "default" : "outline"} asChild>
                    <a href={plan.url || "#"}>{plan.ctaText || "Get Started"}</a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "stats":
      const stats = content.items || content.stats || [];
      return (
        <section style={sectionStyle}>
          <div className="container max-w-6xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-8">{section.title}</h2>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat: any, i: number) => (
                <div key={i}>
                  <p className="text-4xl font-bold">{stat.value || "0"}</p>
                  <p className="text-sm opacity-70 mt-1">{stat.label || `Stat ${i + 1}`}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "team":
      const members = content.members || content.items || [];
      return (
        <section style={sectionStyle}>
          <div className="container max-w-6xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-8">{section.title}</h2>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.map((m: any, i: number) => (
                <div key={i} className="text-center">
                  {m.photo && <img src={m.photo} alt={m.name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover" />}
                  <h3 className="font-semibold">{m.name || `Member ${i + 1}`}</h3>
                  {m.role && <p className="text-sm opacity-60">{m.role}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "contact_form":
      return (
        <section style={sectionStyle}>
          <div className="container max-w-2xl mx-auto px-6">
            {section.title && <h2 className="text-3xl font-bold text-center mb-8">{section.title}</h2>}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Name" className="p-3 border rounded-lg w-full" />
                <input type="email" placeholder="Email" className="p-3 border rounded-lg w-full" />
              </div>
              <textarea placeholder="Message" rows={4} className="p-3 border rounded-lg w-full" />
              <Button type="submit" className="w-full">{content.buttonText || "Send Message"}</Button>
            </form>
          </div>
        </section>
      );

    case "newsletter":
      return (
        <section style={sectionStyle}>
          <div className="container max-w-xl mx-auto px-6 text-center">
            {section.title && <h2 className="text-3xl font-bold mb-4">{section.title}</h2>}
            {section.subtitle && <p className="opacity-70 mb-6">{section.subtitle}</p>}
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" className="flex-1 p-3 border rounded-lg" />
              <Button type="submit">{content.buttonText || "Subscribe"}</Button>
            </form>
          </div>
        </section>
      );

    case "custom_html":
      return (
        <section style={sectionStyle}>
          <div className="container max-w-6xl mx-auto px-6" dangerouslySetInnerHTML={{ __html: content.html || "" }} />
        </section>
      );

    case "divider":
      return (
        <section style={sectionStyle}>
          <div className="container max-w-6xl mx-auto px-6">
            <hr className="border-current opacity-20" />
          </div>
        </section>
      );

    case "spacer":
      return <div style={{ height: content.height || "60px" }} />;

    default:
      return (
        <section style={sectionStyle}>
          <div className="container max-w-4xl mx-auto px-6">
            {section.title && <h2 className="text-2xl font-bold mb-2">{section.title}</h2>}
            {section.subtitle && <p className="opacity-70">{section.subtitle}</p>}
          </div>
        </section>
      );
  }
}

export default function CMSPage() {
  const [, params] = useRoute("/p/:slug");
  const slug = params?.slug || "";

  const { data: page, isLoading, error } = trpc.cms.getPublicPage.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist or hasn't been published yet.</p>
        <Button asChild><a href="/">Go Home</a></Button>
      </div>
    );
  }

  // Fetch SEO data for this page
  const { data: seoData } = trpc.seo.getPublicSeo.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.rusingacademy.ca";
  const pageUrl = seoData?.canonicalUrl || `${baseUrl}/p/${slug}`;

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags via Helmet */}
      {seoData && (
        <Helmet>
          {/* Basic Meta */}
          <title>{seoData.metaTitle || page.title}</title>
          <meta name="description" content={seoData.metaDescription || ""} />
          {seoData.canonicalUrl && <link rel="canonical" href={seoData.canonicalUrl} />}
          {seoData.noIndex && <meta name="robots" content="noindex, nofollow" />}

          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={seoData.ogTitle || seoData.metaTitle || page.title} />
          <meta property="og:description" content={seoData.ogDescription || seoData.metaDescription || ""} />
          <meta property="og:url" content={pageUrl} />
          {seoData.ogImage && <meta property="og:image" content={seoData.ogImage} />}
          <meta property="og:site_name" content="RusingÂcademy" />
          <meta property="og:locale" content="en_CA" />
          <meta property="og:locale:alternate" content="fr_CA" />

          {/* Twitter Card */}
          <meta name="twitter:card" content={seoData.twitterCard || "summary_large_image"} />
          <meta name="twitter:title" content={seoData.ogTitle || seoData.metaTitle || page.title} />
          <meta name="twitter:description" content={seoData.ogDescription || seoData.metaDescription || ""} />
          {seoData.ogImage && <meta name="twitter:image" content={seoData.ogImage} />}

          {/* Schema.org JSON-LD */}
          {seoData.structuredData && (
            <script type="application/ld+json">
              {JSON.stringify(seoData.structuredData)}
            </script>
          )}
        </Helmet>
      )}
      {page.sections?.map((section: any) => (
        <AnimatedSection key={section.id} section={section}>
          <SectionRenderer section={section} />
        </AnimatedSection>
      ))}
    </div>
  );
}
