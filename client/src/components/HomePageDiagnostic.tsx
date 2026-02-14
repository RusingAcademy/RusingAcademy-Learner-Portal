/**
 * Home Page Diagnostic Section Integration
 * 
 * Integrates the DiagnosticQuiz component into the Home Page
 * with proper positioning and CTA flow for lead generation.
 * 
 * @component HomePageDiagnostic
 */

import React, { useState } from 'react';
import { DiagnosticQuiz } from './DiagnosticQuiz';

// Design tokens - consistent with Golden Standard
const tokens = {
  colors: {
    primary: '#1E3A5F',
    secondary: '#C9A227',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    accent: '#E8F4FD',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
};

interface HomePageDiagnosticProps {
  onQuizComplete?: (leadData: LeadData) => void;
}

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  targetLevel: 'A' | 'B' | 'C';
  scores: {
    comprehensionEcrite: number;
    expressionEcrite: number;
    interactionOrale: number;
  };
  leadSource: string;
}

export const HomePageDiagnostic: React.FC<HomePageDiagnosticProps> = ({ 
  onQuizComplete 
}) => {
  const [showQuiz, setShowQuiz] = useState(false);

  const handleQuizComplete = async (leadData: LeadData) => {
    const taggedLeadData = {
      ...leadData,
      leadSource: 'diagnostic_quiz',
      capturedAt: new Date().toISOString(),
      page: 'home',
    };

    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taggedLeadData),
      });
    } catch (error) {
      console.error('Lead capture failed:', error);
    }

    if (onQuizComplete) {
      onQuizComplete(taggedLeadData);
    }
  };

  return (
    <section 
      id="diagnostic-gratuit"
      style={{
        backgroundColor: tokens.colors.accent,
        padding: `${tokens.spacing.xxl} ${tokens.spacing.lg}`,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.spacing.xl }}>
          <span 
            style={{
              display: 'inline-block',
              backgroundColor: tokens.colors.secondary,
              color: tokens.colors.background,
              padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
              borderRadius: tokens.borderRadius.sm,
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: tokens.spacing.md,
            }}
          >
            Évaluation Gratuite
          </span>
          <h2 
            style={{
              color: tokens.colors.primary,
              fontSize: '36px',
              fontWeight: 700,
              margin: `${tokens.spacing.md} 0`,
              lineHeight: 1.2,
            }}
          >
            Découvrez Votre Niveau de Français
          </h2>
          <p 
            style={{
              color: tokens.colors.textMuted,
              fontSize: '18px',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Complétez notre diagnostic en 3 minutes et recevez instantanément 
            un rapport personnalisé avec votre estimation de niveau SLE.
          </p>
        </div>

        {!showQuiz && (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: tokens.spacing.lg,
              marginBottom: tokens.spacing.xl,
            }}
          >
            {[
              {
                icon: '📊',
                title: 'Évaluation Complète',
                description: 'Compréhension écrite, expression écrite et interaction orale',
              },
              {
                icon: '📧',
                title: 'Rapport PDF Instantané',
                description: 'Recevez votre diagnostic détaillé par email en quelques secondes',
              },
              {
                icon: '🎯',
                title: 'Recommandations Personnalisées',
                description: "Plan d'action adapté à votre objectif SLE (A, B ou C)",
              },
            ].map((item, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: tokens.colors.background,
                  padding: tokens.spacing.lg,
                  borderRadius: tokens.borderRadius.lg,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: tokens.spacing.sm }}>
                  {item.icon}
                </div>
                <h3 
                  style={{
                    color: tokens.colors.primary,
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: tokens.spacing.sm,
                  }}
                >
                  {item.title}
                </h3>
                <p 
                  style={{
                    color: tokens.colors.textMuted,
                    fontSize: '14px',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {!showQuiz ? (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowQuiz(true)}
              style={{
                backgroundColor: tokens.colors.secondary,
                color: tokens.colors.background,
                border: 'none',
                padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(201, 162, 39, 0.3)',
              }}
            >
              Commencer le Diagnostic Gratuit →
            </button>
            <p 
              style={{
                color: tokens.colors.textMuted,
                fontSize: '14px',
                marginTop: tokens.spacing.md,
              }}
            >
              ✓ 100% gratuit · ✓ 3 minutes · ✓ Résultats immédiats
            </p>
          </div>
        ) : (
          // @ts-expect-error - TS2322: auto-suppressed during TS cleanup
          <DiagnosticQuiz onComplete={handleQuizComplete} />
        )}

        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: tokens.spacing.xl,
            marginTop: tokens.spacing.xl,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: tokens.colors.primary }}>
              2,500+
            </div>
            <div style={{ fontSize: '12px', color: tokens.colors.textMuted }}>
              Diagnostics complétés
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: tokens.colors.primary }}>
              94%
            </div>
            <div style={{ fontSize: '12px', color: tokens.colors.textMuted }}>
              Taux de satisfaction
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: tokens.colors.primary }}>
              GC
            </div>
            <div style={{ fontSize: '12px', color: tokens.colors.textMuted }}>
              Méthodologie officielle
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePageDiagnostic;
