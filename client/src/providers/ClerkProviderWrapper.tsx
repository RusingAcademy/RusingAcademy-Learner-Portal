import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

// Clerk publishable key from environment
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY - Clerk authentication disabled');
}

// Custom theme matching RusingAcademy design tokens
const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    // Primary colors from design-tokens.json
    colorPrimary: '#0A2540', // Navy Blue
    colorTextOnPrimaryBackground: '#FFFFFF',
    colorBackground: '#FDFBF7', // Ivory/Cream
    colorInputBackground: '#FFFFFF',
    colorInputText: '#1A1A1A',
    colorTextSecondary: '#4A5568',
    
    // Accent colors
    colorSuccess: '#10B981', // Teal
    colorDanger: '#EF4444',
    colorWarning: '#F59E0B',
    
    // Typography
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontFamilyButtons: '"Inter", "Helvetica Neue", Arial, sans-serif',
    
    // Border radius matching design system
    borderRadius: '0.5rem',
    
    // Shadows for depth
    shadowShimmer: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  elements: {
    // Card styling
    card: {
      boxShadow: '0 10px 40px -10px rgba(10, 37, 64, 0.15)',
      borderRadius: '1rem',
      border: '1px solid rgba(10, 37, 64, 0.1)',
    },
    // Button styling with gradient
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
      boxShadow: '0 4px 14px 0 rgba(10, 37, 64, 0.39)',
      '&:hover': {
        background: 'linear-gradient(135deg, #1E3A5F 0%, #0A2540 100%)',
      },
    },
    // Input styling
    formFieldInput: {
      borderColor: 'rgba(10, 37, 64, 0.2)',
      '&:focus': {
        borderColor: '#0A2540',
        boxShadow: '0 0 0 3px rgba(10, 37, 64, 0.1)',
      },
    },
    // Header styling
    headerTitle: {
      fontWeight: '700',
      color: '#0A2540',
    },
    headerSubtitle: {
      color: '#4A5568',
    },
    // Social buttons
    socialButtonsBlockButton: {
      border: '1px solid rgba(10, 37, 64, 0.2)',
      '&:hover': {
        backgroundColor: 'rgba(10, 37, 64, 0.05)',
      },
    },
    // Footer links
    footerActionLink: {
      color: '#0A2540',
      fontWeight: '600',
      '&:hover': {
        color: '#1E3A5F',
      },
    },
    // User button
    userButtonAvatarBox: {
      width: '2.5rem',
      height: '2.5rem',
    },
  },
};

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // If no publishable key, render children without Clerk
  if (!PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}

export default ClerkProviderWrapper;
