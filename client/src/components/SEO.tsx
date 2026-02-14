import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: "website" | "article" | "product" | "service";
  image?: string;
  schema?: object;
  noindex?: boolean;
}

const defaultMeta = {
  title: "RusingAcademy - French Language Training for Public Servants",
  description: "Master your French for the Public Service with expert SLE preparation, AI-powered practice, and certified coaches. Join 500+ successful learners.",
  image: "https://www.rusingacademy.ca/og-image.png",
  siteName: "RusingAcademy",
  twitterHandle: "@rusingacademy",
};

export default function SEO({
  title,
  description,
  canonical,
  type = "website",
  image,
  schema,
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${defaultMeta.siteName}` : defaultMeta.title;
  const metaDescription = description || defaultMeta.description;
  const metaImage = image || defaultMeta.image;
  const canonicalUrl = canonical || (typeof window !== "undefined" ? window.location.href : "");

  // Organization Schema (always included)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Rusinga International Consulting Ltd.",
    alternateName: "RusingAcademy",
    url: "https://www.rusingacademy.ca",
    logo: "https://www.rusingacademy.ca/logo.png",
    sameAs: [
      "https://www.linkedin.com/company/rusingacademy",
      "https://www.youtube.com/@rusingacademy",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-613-555-0123",
      contactType: "customer service",
      availableLanguage: ["English", "French"],
    },
  };

  // Service Schema for Lingueefy
  const lingueefyServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Lingueefy - SLE Preparation",
    provider: {
      "@type": "Organization",
      name: "Rusinga International Consulting Ltd.",
    },
    serviceType: "Language Training",
    description: "Comprehensive preparation for the Second Language Evaluation (SLE) with expert coaches and AI-powered practice.",
    areaServed: {
      "@type": "Country",
      name: "Canada",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "SLE Preparation Courses",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Course",
            name: "SLE Oral Mastery",
            description: "Intensive preparation for the oral component of the SLE",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Course",
            name: "SLE Written Excellence",
            description: "Master grammar and writing for the SLE written test",
          },
        },
      ],
    },
  };

  // Service Schema for Barholex Media
  const barholexServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Barholex Media - Executive Communications",
    provider: {
      "@type": "Organization",
      name: "Rusinga International Consulting Ltd.",
    },
    serviceType: "Media Production & Executive Coaching",
    description: "Premium audiovisual production and bilingual leadership communication coaching for executives.",
    areaServed: {
      "@type": "Country",
      name: "Canada",
    },
  };

  // Determine which schema to use
  let pageSchema = schema || organizationSchema;
  if (canonical?.includes("/lingueefy")) {
    pageSchema = lingueefyServiceSchema;
  } else if (canonical?.includes("/barholex-media")) {
    pageSchema = barholexServiceSchema;
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:locale" content="en_CA" />
      <meta property="og:locale:alternate" content="fr_CA" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={defaultMeta.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(pageSchema)}
      </script>
    </Helmet>
  );
}

// FAQ Schema Generator
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Person/Coach Schema Generator
export function generateCoachSchema(coach: {
  name: string;
  title: string;
  description: string;
  image?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.name,
    jobTitle: coach.title,
    description: coach.description,
    image: coach.image,
    url: coach.url,
    worksFor: {
      "@type": "Organization",
      name: "Rusinga International Consulting Ltd.",
    },
  };
}

// Course Schema Generator
export function generateCourseSchema(course: {
  name: string;
  description: string;
  provider?: string;
  price?: number;
  currency?: string;
  duration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: course.provider || "Rusinga International Consulting Ltd.",
    },
    offers: course.price
      ? {
          "@type": "Offer",
          price: course.price,
          priceCurrency: course.currency || "CAD",
        }
      : undefined,
    timeRequired: course.duration,
  };
}
