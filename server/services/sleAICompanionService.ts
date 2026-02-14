/**
 * SLE AI Companion Service
 * Provides conversational practice with coach cloned voices
 * Uses MiniMax API for text-to-speech with authentic coach voices
 */

// Coach cloned voices - RESERVED FOR SLE AI COMPANION ONLY
// Only Steven (FR) and Preciosa (EN) are active coaches.
// SUE_ANNE and ERIKA are kept for DB backward compatibility but redirect to Steven's voice.
export const COACH_VOICES = {
  STEVEN: {
    id: "moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84",
    name: "Coach Steven",
    description: "French SLE Coach. Prepares anglophone public servants for the oral French exam.",
    language: "fr",
    avatar: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
  },
  // Legacy: redirects to Steven's voice for backward compatibility
  SUE_ANNE: {
    id: "moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84", // Redirected to Steven
    name: "Coach Steven",
    description: "(Legacy) Redirected to Coach Steven.",
    language: "fr",
    avatar: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
  },
  // Legacy: redirects to Steven's voice for backward compatibility
  ERIKA: {
    id: "moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84", // Redirected to Steven
    name: "Coach Steven",
    description: "(Legacy) Redirected to Coach Steven.",
    language: "fr",
    avatar: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
  },
  PRECIOSA: {
    id: "moss_audio_a784f0fe-f448-11f0-9e6a-0a02ecbdcfa7",
    name: "Coach Preciosa",
    description: "English SLE Coach. Prepares francophone public servants for the oral English exam.",
    language: "en",
    avatar: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Preciosa2.webp",
  },
} as const;

export type CoachKey = keyof typeof COACH_VOICES;

export interface Coach {
  id: string;
  name: string;
  description: string;
  language: string;
  avatar: string;
}

export interface ConversationMessage {
  role: "user" | "coach";
  content: string;
  audioUrl?: string;
  timestamp: Date;
}

export interface SLEPracticeSession {
  id: string;
  coachKey: CoachKey;
  level: "A" | "B" | "C";
  skill: "oral_expression" | "oral_comprehension" | "written_expression" | "written_comprehension";
  messages: ConversationMessage[];
  startedAt: Date;
  score?: number;
}

// SLE Level-specific conversation prompts
export const SLE_CONVERSATION_PROMPTS = {
  A: {
    oral_expression: [
      "Présentez-vous brièvement. Dites votre nom et votre poste.",
      "Décrivez une journée typique au travail.",
      "Expliquez ce que vous aimez dans votre travail.",
      "Parlez de vos responsabilités principales.",
      "Décrivez votre équipe de travail.",
    ],
    oral_comprehension: [
      "Écoutez attentivement et répondez aux questions.",
      "Identifiez les informations clés dans le message.",
      "Résumez ce que vous avez entendu.",
    ],
    written_expression: [
      "Rédigez un courriel simple pour demander une réunion.",
      "Écrivez une note de service courte.",
      "Répondez à une demande d'information.",
    ],
    written_comprehension: [
      "Lisez le document et identifiez les points principaux.",
      "Répondez aux questions sur le texte.",
    ],
  },
  B: {
    oral_expression: [
      "Présentez un projet sur lequel vous travaillez actuellement.",
      "Expliquez une procédure ou un processus de votre travail.",
      "Donnez votre opinion sur une politique gouvernementale.",
      "Décrivez un défi que vous avez surmonté au travail.",
      "Proposez une solution à un problème organisationnel.",
    ],
    oral_comprehension: [
      "Analysez les arguments présentés dans le discours.",
      "Identifiez les nuances et les sous-entendus.",
      "Comparez différents points de vue.",
    ],
    written_expression: [
      "Rédigez un rapport de situation.",
      "Préparez une note d'information pour la direction.",
      "Écrivez une proposition de projet.",
    ],
    written_comprehension: [
      "Analysez un document de politique.",
      "Identifiez les implications d'une directive.",
    ],
  },
  C: {
    oral_expression: [
      "Présentez une analyse stratégique complexe.",
      "Défendez une position controversée avec des arguments solides.",
      "Négociez un accord entre plusieurs parties prenantes.",
      "Expliquez les implications à long terme d'une décision politique.",
      "Animez une discussion sur un sujet sensible.",
    ],
    oral_comprehension: [
      "Analysez un discours politique complexe.",
      "Identifiez les stratégies rhétoriques utilisées.",
      "Évaluez la cohérence des arguments présentés.",
    ],
    written_expression: [
      "Rédigez un mémoire au Cabinet.",
      "Préparez une analyse de politique approfondie.",
      "Écrivez un document de consultation publique.",
    ],
    written_comprehension: [
      "Analysez un document juridique complexe.",
      "Évaluez les implications d'une nouvelle réglementation.",
    ],
  },
};

// Coach feedback templates based on performance
export const COACH_FEEDBACK = {
  excellent: [
    "Excellent travail! Votre expression est claire et professionnelle.",
    "Bravo! Vous maîtrisez très bien ce niveau de complexité.",
    "Impressionnant! Votre vocabulaire est riche et approprié.",
  ],
  good: [
    "Très bien! Continuez comme ça.",
    "Bon travail! Quelques petits ajustements et ce sera parfait.",
    "Vous progressez bien. Gardez cette motivation!",
  ],
  needsWork: [
    "C'est un bon début. Travaillons ensemble sur quelques points.",
    "Je vois votre effort. Essayons une approche différente.",
    "Ne vous découragez pas. La pratique mène à la perfection.",
  ],
};

/**
 * Get all available coaches
 */
export function getAvailableCoaches(): Coach[] {
  return Object.values(COACH_VOICES);
}

/**
 * Get a specific coach by key
 */
export function getCoach(coachKey: CoachKey): Coach {
  return COACH_VOICES[coachKey];
}

/**
 * Get conversation prompts for a specific level and skill
 */
export function getConversationPrompts(
  level: "A" | "B" | "C",
  skill: keyof typeof SLE_CONVERSATION_PROMPTS.A
): string[] {
  return SLE_CONVERSATION_PROMPTS[level][skill];
}

/**
 * Get random prompt for practice session
 */
export function getRandomPrompt(
  level: "A" | "B" | "C",
  skill: keyof typeof SLE_CONVERSATION_PROMPTS.A
): string {
  const prompts = getConversationPrompts(level, skill);
  return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * Get feedback based on score
 */
export function getFeedback(score: number): string {
  let category: keyof typeof COACH_FEEDBACK;
  if (score >= 80) {
    category = "excellent";
  } else if (score >= 60) {
    category = "good";
  } else {
    category = "needsWork";
  }
  const feedbacks = COACH_FEEDBACK[category];
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}

/**
 * Generate audio for coach response using MiniMax TTS
 * This function is called from the router to generate voice output
 */
export async function generateCoachAudio(
  text: string,
  coachKey: CoachKey
): Promise<{ audioUrl: string; voiceId: string }> {
  const coach = COACH_VOICES[coachKey];
  
  // Use MiniMax MCP to generate audio with coach's cloned voice
  // The actual MCP call is made from the router using shell command
  return {
    audioUrl: "", // Will be populated by the router after MCP call
    voiceId: coach.id,
  };
}

/**
 * Generate coach response text based on user input and context
 */
export function generateCoachResponseText(
  userMessage: string,
  level: "A" | "B" | "C",
  skill: string,
  coachName: string
): string {
  // This would typically call an LLM, but for now we provide structured responses
  const responses: Record<string, string[]> = {
    A: [
      `Merci pour votre réponse. C'est un bon début! Essayez d'ajouter plus de détails.`,
      `Très bien! Maintenant, pouvez-vous reformuler en utilisant un vocabulaire plus formel?`,
      `Excellent effort! Continuons avec un autre exercice.`,
    ],
    B: [
      `Bonne analyse! Vous avez bien identifié les points clés. Approfondissons maintenant.`,
      `Votre argumentation est solide. Considérez également les perspectives alternatives.`,
      `Très professionnel! Passons à un scénario plus complexe.`,
    ],
    C: [
      `Analyse remarquable! Votre maîtrise du vocabulaire technique est évidente.`,
      `Excellent! Vous avez su naviguer les nuances avec diplomatie.`,
      `Impressionnant! Votre capacité à synthétiser des informations complexes est exemplaire.`,
    ],
  };

  const levelResponses = responses[level] || responses.A;
  return levelResponses[Math.floor(Math.random() * levelResponses.length)];
}
