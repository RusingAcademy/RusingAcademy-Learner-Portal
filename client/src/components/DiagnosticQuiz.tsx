/**
 * Diagnostic Quiz Component - Free Assessment Tunnel
 * 
 * Multi-step quiz that generates a personalized PDF report
 * and sends it via email automatically.
 * 
 * @component DiagnosticQuiz
 */

import React, { useState } from 'react';

// Design tokens
const tokens = {
  colors: {
    primary: '#1E3A5F',
    secondary: '#C9A227',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
};

interface QuizQuestion {
  id: string;
  category: 'comprehension' | 'expression' | 'oral';
  question: string;
  options: Array<{ text: string; score: number }>;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'ce1',
    category: 'comprehension',
    question: 'Quand vous lisez un document gouvernemental en français, vous...',
    options: [
      { text: 'Comprenez les idées principales avec difficulté', score: 25 },
      { text: 'Comprenez le sens général mais pas les détails', score: 50 },
      { text: 'Comprenez bien le contenu avec quelques mots inconnus', score: 75 },
      { text: 'Comprenez parfaitement, y compris les nuances', score: 100 },
    ],
  },
  {
    id: 'ce2',
    category: 'comprehension',
    question: 'Face à un courriel professionnel complexe, vous...',
    options: [
      { text: 'Avez besoin d\'aide pour comprendre', score: 25 },
      { text: 'Comprenez après plusieurs lectures', score: 50 },
      { text: 'Comprenez rapidement l\'essentiel', score: 75 },
      { text: 'Saisissez immédiatement tous les détails', score: 100 },
    ],
  },
  {
    id: 'ee1',
    category: 'expression',
    question: 'Quand vous rédigez un courriel professionnel en français, vous...',
    options: [
      { text: 'Faites de nombreuses erreurs de grammaire', score: 25 },
      { text: 'Écrivez correctement mais avec un vocabulaire limité', score: 50 },
      { text: 'Rédigez clairement avec quelques erreurs mineures', score: 75 },
      { text: 'Produisez des textes impeccables et nuancés', score: 100 },
    ],
  },
  {
    id: 'ee2',
    category: 'expression',
    question: 'Pour rédiger un rapport de 2 pages en français, vous...',
    options: [
      { text: 'Avez besoin d\'assistance significative', score: 25 },
      { text: 'Pouvez le faire mais avec beaucoup de temps', score: 50 },
      { text: 'Le rédigez avec confiance en temps raisonnable', score: 75 },
      { text: 'Le produisez facilement avec style professionnel', score: 100 },
    ],
  },
  {
    id: 'io1',
    category: 'oral',
    question: 'Lors d\'une réunion en français, vous...',
    options: [
      { text: 'Comprenez peu et participez rarement', score: 25 },
      { text: 'Suivez la discussion mais intervenez peu', score: 50 },
      { text: 'Participez activement avec quelques hésitations', score: 75 },
      { text: 'Contribuez avec aisance et précision', score: 100 },
    ],
  },
  {
    id: 'io2',
    category: 'oral',
    question: 'Si on vous pose une question complexe en français, vous...',
    options: [
      { text: 'Avez du mal à formuler une réponse', score: 25 },
      { text: 'Répondez simplement après réflexion', score: 50 },
      { text: 'Donnez une réponse claire et structurée', score: 75 },
      { text: 'Répondez avec éloquence et détails', score: 100 },
    ],
  },
];

type Step = 'intro' | 'questions' | 'contact' | 'processing' | 'complete';

export const DiagnosticQuiz: React.FC = () => {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    targetLevel: 'B' as 'A' | 'B' | 'C',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep('contact');
    }
  };

  const calculateScores = () => {
    const categories = {
      comprehension: [] as number[],
      expression: [] as number[],
      oral: [] as number[],
    };
    QUIZ_QUESTIONS.forEach(q => {
      if (answers[q.id] !== undefined) {
        categories[q.category].push(answers[q.id]);
      }
    });
    return {
      comprehensionEcrite: Math.round(categories.comprehension.reduce((a, b) => a + b, 0) / categories.comprehension.length),
      expressionEcrite: Math.round(categories.expression.reduce((a, b) => a + b, 0) / categories.expression.length),
      interactionOrale: Math.round(categories.oral.reduce((a, b) => a + b, 0) / categories.oral.length),
    };
  };

  const handleSubmit = async () => {
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setStep('processing');
    const scores = calculateScores();
    try {
      const response = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactInfo, scores, completedAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'envoi du diagnostic');
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      setStep('contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentQuestion / QUIZ_QUESTIONS.length) * 100;

  return (
    <div style={{ backgroundColor: tokens.colors.background, borderRadius: tokens.borderRadius.lg, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', maxWidth: '600px', margin: '0 auto', overflow: 'hidden' }}>
      <div style={{ background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, #2D4A6F 100%)`, padding: tokens.spacing.lg, color: tokens.colors.background }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Diagnostic Linguistique Gratuit</h2>
        <p style={{ margin: `${tokens.spacing.sm} 0 0`, opacity: 0.9, fontSize: '14px' }}>Évaluez votre niveau et recevez un rapport personnalisé</p>
      </div>
      {step === 'questions' && (
        <div style={{ backgroundColor: tokens.colors.surface, height: '4px' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: tokens.colors.secondary, transition: 'width 0.3s ease' }} />
        </div>
      )}
      <div style={{ padding: tokens.spacing.xl }}>
        {step === 'intro' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: tokens.spacing.md }}>📊</div>
            <h3 style={{ color: tokens.colors.primary, marginBottom: tokens.spacing.md }}>Découvrez votre niveau SLE</h3>
            <p style={{ color: tokens.colors.textMuted, marginBottom: tokens.spacing.lg }}>Ce diagnostic rapide (2 minutes) évalue vos compétences en:</p>
            <ul style={{ textAlign: 'left', color: tokens.colors.text, marginBottom: tokens.spacing.xl, paddingLeft: tokens.spacing.lg }}>
              <li>Compréhension écrite</li>
              <li>Expression écrite</li>
              <li>Interaction orale</li>
            </ul>
            <button onClick={() => setStep('questions')} style={{ backgroundColor: tokens.colors.secondary, color: tokens.colors.primary, border: 'none', padding: `${tokens.spacing.md} ${tokens.spacing.xl}`, borderRadius: tokens.borderRadius.full, fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
              Commencer le diagnostic →
            </button>
          </div>
        )}
        {step === 'questions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing.md, color: tokens.colors.textMuted, fontSize: '14px' }}>
              <span>Question {currentQuestion + 1} sur {QUIZ_QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <h3 style={{ color: tokens.colors.primary, marginBottom: tokens.spacing.lg }}>{QUIZ_QUESTIONS[currentQuestion].question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
              {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => (
                <button key={idx} onClick={() => handleAnswer(QUIZ_QUESTIONS[currentQuestion].id, option.score)} style={{ padding: tokens.spacing.md, border: `1px solid ${tokens.colors.surface}`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.background, cursor: 'pointer', textAlign: 'left' }}>
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 'contact' && (
          <div>
            <h3 style={{ color: tokens.colors.primary, marginBottom: tokens.spacing.lg }}>Recevez votre rapport personnalisé</h3>
            {error && <div style={{ color: tokens.colors.error, marginBottom: tokens.spacing.md }}>{error}</div>}
            <input type="text" placeholder="Prénom *" value={contactInfo.firstName} onChange={e => setContactInfo(prev => ({ ...prev, firstName: e.target.value }))} style={{ width: '100%', padding: tokens.spacing.md, marginBottom: tokens.spacing.md, border: `1px solid ${tokens.colors.surface}`, borderRadius: tokens.borderRadius.md }} />
            <input type="text" placeholder="Nom *" value={contactInfo.lastName} onChange={e => setContactInfo(prev => ({ ...prev, lastName: e.target.value }))} style={{ width: '100%', padding: tokens.spacing.md, marginBottom: tokens.spacing.md, border: `1px solid ${tokens.colors.surface}`, borderRadius: tokens.borderRadius.md }} />
            <input type="email" placeholder="Courriel *" value={contactInfo.email} onChange={e => setContactInfo(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: tokens.spacing.md, marginBottom: tokens.spacing.md, border: `1px solid ${tokens.colors.surface}`, borderRadius: tokens.borderRadius.md }} />
            <select value={contactInfo.targetLevel} onChange={e => setContactInfo(prev => ({ ...prev, targetLevel: e.target.value as 'A' | 'B' | 'C' }))} style={{ width: '100%', padding: tokens.spacing.md, marginBottom: tokens.spacing.lg, border: `1px solid ${tokens.colors.surface}`, borderRadius: tokens.borderRadius.md }}>
              <option value="A">Niveau A (Débutant)</option>
              <option value="B">Niveau B (Intermédiaire)</option>
              <option value="C">Niveau C (Avancé)</option>
            </select>
            <button onClick={handleSubmit} disabled={isSubmitting} style={{ width: '100%', backgroundColor: tokens.colors.secondary, color: tokens.colors.primary, border: 'none', padding: tokens.spacing.md, borderRadius: tokens.borderRadius.full, fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
              {isSubmitting ? 'Envoi en cours...' : 'Recevoir mon rapport gratuit'}
            </button>
          </div>
        )}
        {step === 'processing' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: tokens.spacing.md }}>⏳</div>
            <h3 style={{ color: tokens.colors.primary }}>Génération de votre rapport...</h3>
            <p style={{ color: tokens.colors.textMuted }}>Veuillez patienter quelques secondes.</p>
          </div>
        )}
        {step === 'complete' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: tokens.spacing.md }}>✅</div>
            <h3 style={{ color: tokens.colors.success }}>Rapport envoyé!</h3>
            <p style={{ color: tokens.colors.textMuted }}>Consultez votre boîte courriel pour accéder à votre diagnostic personnalisé.</p>
            <p style={{ color: tokens.colors.primary, fontWeight: 600, marginTop: tokens.spacing.lg }}>Prêt à atteindre vos objectifs?</p>
            <a href="/curriculum" style={{ display: 'inline-block', marginTop: tokens.spacing.md, backgroundColor: tokens.colors.secondary, color: tokens.colors.primary, padding: `${tokens.spacing.md} ${tokens.spacing.xl}`, borderRadius: tokens.borderRadius.full, textDecoration: 'none', fontWeight: 600 }}>
              Découvrir nos programmes
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticQuiz;
