// Ecosystem Design System - Shared tokens and utilities
// Rusinga International Consulting Ltd.

// Brand Colors
export const brandColors = {
  rusingacademy: {
    primary: '#F97316', // Orange energy
    secondary: '#FB923C',
    accent: '#FDBA74',
    glow: 'rgba(249, 115, 22, 0.3)',
    gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)',
  },
  lingueefy: {
    primary: '#14B8A6', // Cyan/teal tech
    secondary: '#2DD4BF',
    accent: '#5EEAD4',
    glow: 'rgba(20, 184, 166, 0.3)',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #2DD4BF 50%, #5EEAD4 100%)',
  },
  barholexMedia: {
    primary: '#8B5CF6', // Violet premium/executive
    secondary: '#A78BFA',
    accent: '#C4B5FD',
    glow: 'rgba(139, 92, 246, 0.3)',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%)',
  },
  ecosystem: {
    primary: '#06B6D4', // Ecosystem cyan
    secondary: '#22D3EE',
    accent: '#67E8F9',
    glow: 'rgba(6, 182, 212, 0.3)',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 50%, #67E8F9 100%)',
  },
};

// Design Tokens
export const tokens = {
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  
  // Border Radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    glow: (color: string) => `0 0 40px ${color}`,
  },
  
  // Blur
  blur: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      display: 'Cal Sans, Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

// Glass morphism styles
export const glassStyles = {
  dark: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
  },
  light: {
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(16px)',
  },
  card: {
    dark: {
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(12px)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(12px)',
    },
  },
};

// Bilingual content helper
export type BilingualContent = {
  en: string;
  fr: string;
};

export const getBilingualText = (content: BilingualContent, lang: 'en' | 'fr'): string => {
  return content[lang];
};

// Brand context type
export type BrandContext = 'rusingacademy' | 'lingueefy' | 'barholexMedia' | 'ecosystem';

// Get brand styles
export const getBrandStyles = (brand: BrandContext) => {
  return brandColors[brand];
};

// Animation variants for Framer Motion
export const animationVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Transition presets
export const transitions = {
  fast: { duration: 0.2, ease: 'easeOut' as const },
  normal: { duration: 0.3, ease: 'easeOut' as const },
  slow: { duration: 0.5, ease: 'easeOut' as const },
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
};
