/**
 * Email Branding Configuration
 * 
 * Contains all branding assets and legal text for email templates.
 * Uses RusingAcademy branding for official communications.
 */

export const EMAIL_BRANDING = {
  // Logo URLs (hosted on S3/CloudFront)
  logos: {
    banner: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/logos/rusing_academy_banner.png",
    icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/logos/rusing_academy_icon.png",
    square: "https://d2xsxph8kpxj0f.cloudfront.net/310519663049070748/gvnmYNphKZgt9jM9K8Vi9K/logos/rusing_academy_square.png",
  },
  
  // Brand colors
  colors: {
    primary: "#0d9488",      // Teal
    primaryLight: "#14b8a6", // Light teal
    secondary: "#f97316",    // Orange
    dark: "#1a202c",         // Dark navy
    light: "#f9fafb",        // Light gray background
    white: "#ffffff",
    text: "#333333",
    muted: "#6b7280",
  },
  
  // Company legal information
  company: {
    legalName: "Rusinga International Consulting Ltd.",
    tradeName: "RusingAcademy",
    productName: "Lingueefy",
    tagline: "Master Your Second Language for the Public Service",
    taglineFr: "Maîtrisez votre langue seconde pour la fonction publique",
    
    // Contact
    supportEmail: "support@rusingacademy.ca",
    website: "https://www.rusingacademy.ca",
    websiteAlt: "https://www.rusingacademy.ca",
    
    // Tax information
    taxInfo: {
      rate: 0.13,
      name: "HST",
      region: "Ontario, Canada",
    },
  },
  
  // Legal footer text
  footer: {
    en: `© ${new Date().getFullYear()} Rusinga International Consulting Ltd., commercially known as RusingAcademy. All rights reserved.`,
    fr: `© ${new Date().getFullYear()} Rusinga International Consulting Ltd., commercialement connue sous le nom de RusingAcademy. Tous droits réservés.`,
  },
  
  // Social links
  social: {
    youtube: "https://www.youtube.com/@BarholexGCExamCoach",
    linkedin: "https://www.linkedin.com/company/rusingacademy",
  },
};

/**
 * Generate email header HTML with RusingAcademy branding
 */
export function generateEmailHeader(title: string, subtitle?: string): string {
  return `
    <div style="background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.primary} 0%, ${EMAIL_BRANDING.colors.primaryLight} 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <img src="${EMAIL_BRANDING.logos.banner}" alt="RusingAcademy" style="max-width: 200px; height: auto; margin-bottom: 15px;" />
      <h1 style="margin: 0; font-size: 24px;">${title}</h1>
      ${subtitle ? `<p style="margin: 10px 0 0; opacity: 0.9;">${subtitle}</p>` : ""}
    </div>
  `;
}

/**
 * Generate email footer HTML with legal text
 */
export function generateEmailFooter(language: "en" | "fr" = "en"): string {
  const labels = language === "fr" ? {
    questions: "Des questions?",
    contactUs: "Contactez-nous",
    visitWebsite: "Visitez notre site",
    unsubscribe: "Se désabonner",
  } : {
    questions: "Questions?",
    contactUs: "Contact us",
    visitWebsite: "Visit our website",
    unsubscribe: "Unsubscribe",
  };
  
  return `
    <div style="text-align: center; color: ${EMAIL_BRANDING.colors.muted}; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px;">
        ${labels.questions} <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${labels.contactUs}</a> | 
        <a href="${EMAIL_BRANDING.company.website}" style="color: ${EMAIL_BRANDING.colors.primary};">${labels.visitWebsite}</a>
      </p>
      <p style="margin: 0; color: #9ca3af;">
        ${EMAIL_BRANDING.footer[language]}
      </p>
      <p style="margin: 10px 0 0; font-size: 11px;">
        <strong>Lingueefy</strong> - ${language === "fr" ? EMAIL_BRANDING.company.taglineFr : EMAIL_BRANDING.company.tagline}
      </p>
    </div>
  `;
}

/**
 * Generate tax breakdown HTML for payment emails
 */
export function generateTaxBreakdown(
  subtotalCents: number,
  taxCents: number,
  totalCents: number,
  language: "en" | "fr" = "en"
): string {
  const formatPrice = (cents: number) => (cents / 100).toFixed(2);
  
  const labels = language === "fr" ? {
    subtotal: "Sous-total",
    hst: "TVH (13%)",
    total: "Total payé",
  } : {
    subtotal: "Subtotal",
    hst: "HST (13%)",
    total: "Total Paid",
  };
  
  return `
    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="color: ${EMAIL_BRANDING.colors.muted};">${labels.subtotal}</span>
        <span style="font-weight: 500;">$${formatPrice(subtotalCents)} CAD</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="color: ${EMAIL_BRANDING.colors.muted};">${labels.hst}</span>
        <span style="font-weight: 500;">$${formatPrice(taxCents)} CAD</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid ${EMAIL_BRANDING.colors.primary}; margin-top: 8px;">
        <span style="font-weight: 600; color: ${EMAIL_BRANDING.colors.dark};">${labels.total}</span>
        <span style="font-weight: 700; color: ${EMAIL_BRANDING.colors.primary}; font-size: 1.1em;">$${formatPrice(totalCents)} CAD</span>
      </div>
    </div>
  `;
}

/**
 * Generate complete email wrapper with branding
 */
export function wrapEmailContent(
  headerTitle: string,
  headerSubtitle: string | undefined,
  bodyContent: string,
  language: "en" | "fr" = "en"
): string {
  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: ${EMAIL_BRANDING.colors.text}; 
      margin: 0; 
      padding: 0; 
      background: #f5f5f5; 
    }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: ${EMAIL_BRANDING.colors.light}; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { 
      display: inline-block; 
      background: ${EMAIL_BRANDING.colors.primary}; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 5px; 
      font-weight: 500;
    }
    .button:hover { background: ${EMAIL_BRANDING.colors.primaryLight}; }
    .button-secondary { background: ${EMAIL_BRANDING.colors.secondary}; }
    a { color: ${EMAIL_BRANDING.colors.primary}; }
  </style>
</head>
<body>
  <div class="container">
    ${generateEmailHeader(headerTitle, headerSubtitle)}
    <div class="content">
      ${bodyContent}
    </div>
    ${generateEmailFooter(language)}
  </div>
</body>
</html>
  `;
}
