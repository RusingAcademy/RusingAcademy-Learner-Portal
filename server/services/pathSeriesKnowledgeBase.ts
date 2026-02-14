/**
 * Path Series RAG Knowledge Base
 * The Path Series - GC Bilingual Mastery Series™
 * 
 * This service provides the knowledge base for Steven AI to assist
 * learners through The Path Series courses using RAG.
 * 
 * @brand Lingueefy
 * @copyright Rusinga International Consulting Ltd.
 */

import OpenAI from 'openai';

// ============================================================================
// KNOWLEDGE BASE TYPES
// ============================================================================

interface KnowledgeChunk {
  id: string;
  pathId: string;
  moduleId: string;
  lessonId?: string;
  content: string;
  contentFr: string;
  type: 'concept' | 'grammar' | 'vocabulary' | 'exercise' | 'exam_tip' | 'methodology';
  metadata: {
    sleLevel: 'A' | 'B' | 'C';
    cecrLevel: string;
    keywords: string[];
    keywordsFr: string[];
  };
  embedding?: number[];
}

interface QueryResult {
  chunk: KnowledgeChunk;
  score: number;
}

// ============================================================================
// THE PATH SERIES KNOWLEDGE BASE
// ============================================================================

export const PATH_SERIES_KNOWLEDGE: KnowledgeChunk[] = [
  // PATH I - FOUNDATIONS
  {
    id: 'path1-intro-methodology',
    pathId: 'path-1',
    moduleId: 'module-1-1',
    content: 'The 30-Hour Confidence System (30HCS) is a revolutionary methodology designed specifically for Canadian public servants preparing for SLE exams. It focuses on building genuine confidence through structured practice rather than memorization.',
    contentFr: 'Le Système de Confiance en 30 Heures (30HCS) est une méthodologie révolutionnaire conçue spécifiquement pour les fonctionnaires canadiens se préparant aux examens ELS. Il se concentre sur le développement d\'une confiance authentique grâce à une pratique structurée plutôt qu\'à la mémorisation.',
    type: 'methodology',
    metadata: {
      sleLevel: 'A',
      cecrLevel: 'A1-A2',
      keywords: ['30HCS', 'confidence', 'methodology', 'SLE preparation'],
      keywordsFr: ['30HCS', 'confiance', 'méthodologie', 'préparation ELS']
    }
  },
  {
    id: 'path1-grammar-articles',
    pathId: 'path-1',
    moduleId: 'module-1-2',
    content: 'French articles (le, la, les, un, une, des) must agree with the noun in gender and number. Unlike English, French requires articles before most nouns. Key tip: Learn the article WITH the noun as a single unit.',
    contentFr: 'Les articles français (le, la, les, un, une, des) doivent s\'accorder avec le nom en genre et en nombre. Contrairement à l\'anglais, le français exige des articles devant la plupart des noms. Conseil clé : Apprenez l\'article AVEC le nom comme une seule unité.',
    type: 'grammar',
    metadata: {
      sleLevel: 'A',
      cecrLevel: 'A1',
      keywords: ['articles', 'gender', 'agreement', 'grammar basics'],
      keywordsFr: ['articles', 'genre', 'accord', 'grammaire de base']
    }
  },
  {
    id: 'path1-vocab-workplace',
    pathId: 'path-1',
    moduleId: 'module-1-3',
    content: 'Essential workplace vocabulary for Level A includes: réunion (meeting), bureau (office/desk), collègue (colleague), courriel (email), dossier (file/folder), rapport (report), échéance (deadline), tâche (task).',
    contentFr: 'Le vocabulaire essentiel du lieu de travail pour le niveau A comprend : réunion, bureau, collègue, courriel, dossier, rapport, échéance, tâche.',
    type: 'vocabulary',
    metadata: {
      sleLevel: 'A',
      cecrLevel: 'A1-A2',
      keywords: ['workplace', 'vocabulary', 'office', 'professional'],
      keywordsFr: ['lieu de travail', 'vocabulaire', 'bureau', 'professionnel']
    }
  },
  
  // PATH II - PROFESSIONAL COMMUNICATION
  {
    id: 'path2-email-structure',
    pathId: 'path-2',
    moduleId: 'module-2-1',
    content: 'Professional email structure in French: 1) Salutation (Madame/Monsieur), 2) Opening phrase (Je vous écris pour...), 3) Body with clear paragraphs, 4) Closing formula (Veuillez agréer...), 5) Signature. Always use "vous" in professional contexts.',
    contentFr: 'Structure d\'un courriel professionnel en français : 1) Salutation (Madame/Monsieur), 2) Phrase d\'ouverture (Je vous écris pour...), 3) Corps avec paragraphes clairs, 4) Formule de politesse (Veuillez agréer...), 5) Signature. Utilisez toujours "vous" dans les contextes professionnels.',
    type: 'concept',
    metadata: {
      sleLevel: 'B',
      cecrLevel: 'B1',
      keywords: ['email', 'professional writing', 'formal communication'],
      keywordsFr: ['courriel', 'rédaction professionnelle', 'communication formelle']
    }
  },
  {
    id: 'path2-meeting-vocab',
    pathId: 'path-2',
    moduleId: 'module-2-2',
    content: 'Meeting vocabulary for Level B: ordre du jour (agenda), procès-verbal (minutes), intervenant (speaker), motion (motion), adopter (to adopt), reporter (to postpone), lever la séance (to adjourn), point de discussion (discussion item).',
    contentFr: 'Vocabulaire des réunions pour le niveau B : ordre du jour, procès-verbal, intervenant, motion, adopter, reporter, lever la séance, point de discussion.',
    type: 'vocabulary',
    metadata: {
      sleLevel: 'B',
      cecrLevel: 'B1-B2',
      keywords: ['meetings', 'vocabulary', 'professional', 'government'],
      keywordsFr: ['réunions', 'vocabulaire', 'professionnel', 'gouvernement']
    }
  },

  // PATH III - ADVANCED GRAMMAR
  {
    id: 'path3-subjunctive',
    pathId: 'path-3',
    moduleId: 'module-3-1',
    content: 'The subjunctive mood is required after expressions of: 1) Doubt (douter que), 2) Emotion (être content que), 3) Necessity (il faut que), 4) Will/Desire (vouloir que). Key pattern: que + subject + subjunctive verb.',
    contentFr: 'Le subjonctif est requis après les expressions de : 1) Doute (douter que), 2) Émotion (être content que), 3) Nécessité (il faut que), 4) Volonté/Désir (vouloir que). Modèle clé : que + sujet + verbe au subjonctif.',
    type: 'grammar',
    metadata: {
      sleLevel: 'B',
      cecrLevel: 'B2',
      keywords: ['subjunctive', 'grammar', 'advanced', 'mood'],
      keywordsFr: ['subjonctif', 'grammaire', 'avancé', 'mode']
    }
  },

  // PATH IV - ORAL COMPREHENSION
  {
    id: 'path4-listening-strategies',
    pathId: 'path-4',
    moduleId: 'module-4-1',
    content: 'SLE Oral Comprehension strategies: 1) Listen for key words, not every word, 2) Pay attention to tone and context, 3) Note numbers, dates, and proper nouns, 4) Use elimination for multiple choice, 5) Trust your first instinct.',
    contentFr: 'Stratégies de compréhension orale ELS : 1) Écoutez les mots-clés, pas chaque mot, 2) Faites attention au ton et au contexte, 3) Notez les chiffres, dates et noms propres, 4) Utilisez l\'élimination pour les choix multiples, 5) Faites confiance à votre première intuition.',
    type: 'exam_tip',
    metadata: {
      sleLevel: 'B',
      cecrLevel: 'B1-B2',
      keywords: ['listening', 'comprehension', 'SLE exam', 'strategies'],
      keywordsFr: ['écoute', 'compréhension', 'examen ELS', 'stratégies']
    }
  },

  // PATH V - ORAL EXPRESSION
  {
    id: 'path5-oral-structure',
    pathId: 'path-5',
    moduleId: 'module-5-1',
    content: 'SLE Oral Expression structure: 1) Introduction (state your position clearly), 2) Development (2-3 main arguments with examples), 3) Conclusion (summarize and restate). Use transition words: premièrement, de plus, en conclusion.',
    contentFr: 'Structure de l\'expression orale ELS : 1) Introduction (énoncez clairement votre position), 2) Développement (2-3 arguments principaux avec exemples), 3) Conclusion (résumez et reformulez). Utilisez des mots de transition : premièrement, de plus, en conclusion.',
    type: 'exam_tip',
    metadata: {
      sleLevel: 'C',
      cecrLevel: 'B2-C1',
      keywords: ['oral expression', 'speaking', 'SLE exam', 'structure'],
      keywordsFr: ['expression orale', 'parler', 'examen ELS', 'structure']
    }
  },

  // PATH VI - EXAM MASTERY
  {
    id: 'path6-exam-day',
    pathId: 'path-6',
    moduleId: 'module-6-1',
    content: 'SLE Exam Day Tips: 1) Arrive 30 minutes early, 2) Bring valid government ID, 3) Get good sleep the night before, 4) Eat a balanced breakfast, 5) Use positive self-talk, 6) Read all instructions carefully, 7) Manage your time wisely.',
    contentFr: 'Conseils pour le jour de l\'examen ELS : 1) Arrivez 30 minutes à l\'avance, 2) Apportez une pièce d\'identité gouvernementale valide, 3) Dormez bien la veille, 4) Prenez un petit-déjeuner équilibré, 5) Utilisez un discours intérieur positif, 6) Lisez attentivement toutes les instructions, 7) Gérez votre temps judicieusement.',
    type: 'exam_tip',
    metadata: {
      sleLevel: 'C',
      cecrLevel: 'C1',
      keywords: ['exam day', 'SLE', 'preparation', 'tips'],
      keywordsFr: ['jour d\'examen', 'ELS', 'préparation', 'conseils']
    }
  }
];

// ============================================================================
// RAG SERVICE CLASS
// ============================================================================

export class PathSeriesRAGService {
  private openai: OpenAI;
  private knowledgeBase: KnowledgeChunk[];

  constructor() {
    this.openai = new OpenAI();
    this.knowledgeBase = PATH_SERIES_KNOWLEDGE;
  }

  async searchKnowledge(query: string, pathId?: string, sleLevel?: 'A' | 'B' | 'C'): Promise<QueryResult[]> {
    let filteredChunks = this.knowledgeBase;
    
    if (pathId) {
      filteredChunks = filteredChunks.filter(chunk => chunk.pathId === pathId);
    }
    
    if (sleLevel) {
      filteredChunks = filteredChunks.filter(chunk => chunk.metadata.sleLevel === sleLevel);
    }

    // Simple keyword matching (in production, use embeddings)
    const queryLower = query.toLowerCase();
    const results: QueryResult[] = filteredChunks
      .map(chunk => {
        const contentMatch = chunk.content.toLowerCase().includes(queryLower) ? 0.5 : 0;
        const keywordMatch = chunk.metadata.keywords.some(k => queryLower.includes(k.toLowerCase())) ? 0.3 : 0;
        const keywordFrMatch = chunk.metadata.keywordsFr.some(k => queryLower.includes(k.toLowerCase())) ? 0.2 : 0;
        return { chunk, score: contentMatch + keywordMatch + keywordFrMatch };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return results;
  }

  async generateResponse(query: string, context: QueryResult[], language: 'en' | 'fr' = 'fr'): Promise<string> {
    const contextText = context.map(r => language === 'fr' ? r.chunk.contentFr : r.chunk.content).join('\n\n');
    
    const systemPrompt = language === 'fr'
      ? `Tu es Steven, l'assistant IA de Lingueefy spécialisé dans la préparation aux examens ELS pour les fonctionnaires canadiens. Utilise UNIQUEMENT les informations suivantes pour répondre. Si tu ne trouves pas la réponse dans le contexte, dis-le poliment.

Contexte:
${contextText}`
      : `You are Steven, Lingueefy's AI assistant specialized in SLE exam preparation for Canadian public servants. Use ONLY the following information to answer. If you cannot find the answer in the context, say so politely.

Context:
${contextText}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'Je suis désolé, je n\'ai pas pu générer une réponse.';
  }
}

export default PathSeriesRAGService;
