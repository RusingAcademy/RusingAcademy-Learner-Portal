/**
 * SEO Schema.org JSON-LD Enhancements
 * RusingÂcademy Learning Ecosystem
 * 
 * Structured data markup for improved search engine visibility
 * and rich snippet display in Google Search results.
 * 
 * @copyright Rusinga International Consulting Ltd.
 */

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "RusingÂcademy",
  "alternateName": "Rusinga International Consulting Ltd.",
  "url": "https://www.rusingacademy.ca",
  "logo": "https://www.rusingacademy.ca/images/logo-rusingacademy.png",
  "description": "Canada's premier bilingual training academy for public servants. SLE exam preparation, language coaching, and professional development.",
  "foundingDate": "2020",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CA",
    "addressRegion": "ON"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "admin@rusingacademy.ca",
    "availableLanguage": ["English", "French"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/rusingacademy",
    "https://twitter.com/rusingacademy"
  ],
  "areaServed": { "@type": "Country", "name": "Canada" },
  "knowsAbout": [
    "Second Language Evaluation (SLE)",
    "French Language Training",
    "English Language Training",
    "Canadian Public Service Language Requirements"
  ]
};

export const SLE_COURSE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "SLE Exam Preparation - Path Series™",
  "description": "Comprehensive Second Language Evaluation (SLE) preparation program for Canadian public servants.",
  "provider": {
    "@type": "EducationalOrganization",
    "name": "RusingÂcademy",
    "url": "https://www.rusingacademy.ca"
  },
  "educationalLevel": "Professional",
  "inLanguage": ["en", "fr"],
  "teaches": [
    "French oral proficiency",
    "French written expression",
    "French reading comprehension",
    "SLE exam strategies"
  ]
};

export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the SLE exam?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Second Language Evaluation (SLE) is the official language test used by the Government of Canada to assess the second language proficiency of federal public servants."
      }
    },
    {
      "@type": "Question",
      "name": "How long does SLE preparation take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Preparation time varies based on your current level and target. Most learners achieve their goals within 3-6 months with our Path Series™ program."
      }
    }
  ]
};

export function generateBreadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function injectSchemaToHead(schema: object): string {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

export default {
  ORGANIZATION_SCHEMA,
  SLE_COURSE_SCHEMA,
  FAQ_SCHEMA,
  generateBreadcrumbSchema,
  injectSchemaToHead
};
