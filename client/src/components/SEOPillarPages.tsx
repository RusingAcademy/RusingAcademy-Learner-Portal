/**
 * SEO Pillar Pages with Schema.org JSON-LD
 * 
 * Optimized pillar pages for RusingÂcademy, Lingueefy, and Barholex Media
 * targeting Canadian government language training keywords.
 * 
 * @component SEOPillarPages
 */

import React from 'react';
// Using React Helmet for SEO in non-Next.js app
import { Helmet } from 'react-helmet-async';
const Head = Helmet;

// Design tokens
const tokens = {
  colors: {
    primary: '#1E3A5F',
    secondary: '#C9A227',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1A1A1A',
    textMuted: '#6B7280',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
};

// Schema.org JSON-LD generators
export const generateOrganizationSchema = (brand: 'rusingacademy' | 'lingueefy' | 'barholex') => {
  const schemas = {
    rusingacademy: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      '@id': 'https://rusingacademy.com/#organization',
      name: 'RusingÂcademy',
      alternateName: 'Rusinga Academy',
      url: 'https://rusingacademy.com',
      logo: 'https://rusingacademy.com/logo.png',
      description: "Canada's premier platform for SLE preparation and bilingual excellence training for Canadian public servants.",
      foundingDate: '2024',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Rusinga International Consulting Ltd.',
        url: 'https://rusingainternational.com',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Canada',
      },
    },
    lingueefy: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://lingueefy.com/#organization',
      name: 'Lingueefy',
      url: 'https://lingueefy.com',
      logo: 'https://lingueefy.com/logo.png',
      description: 'Human and AI-powered language coaching platform offering personalized practice and feedback.',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Rusinga International Consulting Ltd.',
      },
      serviceType: 'Language Coaching',
    },
    barholex: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://barholexmedia.com/#organization',
      name: 'Barholex Media',
      url: 'https://barholexmedia.com',
      logo: 'https://barholexmedia.com/logo.png',
      description: 'EdTech consulting and innovation arm specializing in content strategy and pedagogical design.',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Rusinga International Consulting Ltd.',
      },
      serviceType: ['EdTech Consulting', 'Content Strategy', 'Digital Infrastructure'],
    },
  };
  return schemas[brand];
};

export const generateCourseSchema = (courseData: {
  name: string;
  description: string;
  provider: string;
  duration: string;
  level: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: courseData.name,
  description: courseData.description,
  provider: {
    '@type': 'Organization',
    name: courseData.provider,
    sameAs: 'https://rusingacademy.com',
  },
  timeRequired: courseData.duration,
  educationalLevel: courseData.level,
  inLanguage: ['en', 'fr'],
  audience: {
    '@type': 'Audience',
    audienceType: 'Canadian Public Servants',
  },
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Pillar Page Component
interface PillarPageProps {
  brand: 'rusingacademy' | 'lingueefy' | 'barholex';
  title: string;
  description: string;
  keywords: string[];
  children: React.ReactNode;
}

export const PillarPage: React.FC<PillarPageProps> = ({
  brand,
  title,
  description,
  keywords,
  children,
}) => {
  const organizationSchema = generateOrganizationSchema(brand);
  
  const brandConfig = {
    rusingacademy: {
      name: 'RusingÂcademy',
      tagline: 'Excellence Bilingue pour Fonctionnaires',
      color: '#1E3A5F',
    },
    lingueefy: {
      name: 'Lingueefy',
      tagline: 'Coaching Linguistique Personnalisé',
      color: '#2D5A3D',
    },
    barholex: {
      name: 'Barholex Media',
      tagline: 'Innovation EdTech & Consulting',
      color: '#4A3B6B',
    },
  };

  const config = brandConfig[brand];

  return (
    <>
      <Head>
        <title>{title} | {config.name}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(', ')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={config.name} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>

      <main>
        <header
          style={{
            backgroundColor: config.color,
            color: tokens.colors.background,
            padding: `${tokens.spacing.xxl} ${tokens.spacing.lg}`,
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: tokens.spacing.md }}>
            {config.name}
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9 }}>
            {config.tagline}
          </p>
        </header>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: tokens.spacing.xl }}>
          {children}
        </div>

        <footer
          style={{
            backgroundColor: tokens.colors.surface,
            padding: `${tokens.spacing.xl} ${tokens.spacing.lg}`,
            textAlign: 'center',
            borderTop: `1px solid ${tokens.colors.textMuted}20`,
          }}
        >
          <p style={{ color: tokens.colors.textMuted, fontSize: '14px' }}>
            © 2026 Rusinga International Consulting Ltd. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
};

// Pre-configured Pillar Pages
export const SLEPreparationPillarPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PillarPage
    brand="rusingacademy"
    title="Préparation ELS - Formation Linguistique pour Fonctionnaires"
    description="Préparez-vous efficacement à l'Évaluation de Langue Seconde (ELS) avec RusingÂcademy."
    keywords={[
      'Préparation SLE',
      'Préparation ELS',
      'Évaluation Langue Seconde',
      'Formation linguistique gouvernement Canada',
      'Niveaux de langue CBC',
      'Formation linguistique ministérielle',
      'Test SLE niveau B',
      'Test SLE niveau C',
      'Fonctionnaire bilingue',
      'Second Language Evaluation',
    ]}
  >
    {children}
  </PillarPage>
);

export const LanguageCoachingPillarPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PillarPage
    brand="lingueefy"
    title="Coaching Linguistique Personnalisé - Lingueefy"
    description="Améliorez votre français avec un coaching personnalisé combinant expertise humaine et IA."
    keywords={[
      'Coaching linguistique',
      'Cours de français professionnel',
      'Tuteur français en ligne',
      'Améliorer son français',
      'Coach langue seconde',
      'Formation français entreprise',
    ]}
  >
    {children}
  </PillarPage>
);

export const EdTechConsultingPillarPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PillarPage
    brand="barholex"
    title="Consulting EdTech & Innovation Pédagogique - Barholex Media"
    description="Solutions EdTech innovantes pour écoles de langues et organisations."
    keywords={[
      'EdTech consulting',
      'Innovation pédagogique',
      'Technologie éducative',
      'Formation en ligne entreprise',
      'LMS personnalisé',
      'Stratégie contenu éducatif',
    ]}
  >
    {children}
  </PillarPage>
);

export default PillarPage;
