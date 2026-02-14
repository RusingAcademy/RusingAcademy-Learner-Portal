/**
 * RAG Service - Retrieval-Augmented Generation for Steven AI
 * 
 * Connects Steven AI to RusingÂcademy's proprietary methodology
 * and pedagogical documents for context-aware responses.
 * 
 * @module server/services/ragService
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

// Document categories for RAG retrieval
export const DOCUMENT_CATEGORIES = {
  SLE_PREPARATION: 'sle_preparation',
  GRAMMAR_FRENCH: 'grammar_french',
  GRAMMAR_ENGLISH: 'grammar_english',
  ORAL_COMMUNICATION: 'oral_communication',
  WRITTEN_EXPRESSION: 'written_expression',
  VOCABULARY_GOV: 'vocabulary_gov',
  METHODOLOGY: 'methodology',
} as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[keyof typeof DOCUMENT_CATEGORIES];

// Document metadata interface
interface DocumentChunk {
  id: string;
  content: string;
  category: DocumentCategory;
  source: string;
  pageNumber?: number;
  embedding?: number[];
}

// In-memory document store (would be replaced with vector DB in production)
let documentStore: DocumentChunk[] = [];

/**
 * Steven AI System Prompt - RusingÂcademy Methodology
 */
const STEVEN_AI_SYSTEM_PROMPT = `Tu es Steven, l'assistant IA pédagogique de RusingÂcademy, spécialisé dans la préparation aux examens linguistiques du gouvernement canadien (SLE - Second Language Evaluation).

## Ta Mission
Aider les fonctionnaires canadiens à atteindre leurs objectifs linguistiques (niveaux A, B, ou C) en utilisant EXCLUSIVEMENT la méthodologie propriétaire de RusingÂcademy.

## Tes Compétences
1. **Préparation SLE** - Compréhension écrite, Expression écrite, Interaction orale
2. **Grammaire française et anglaise** - Règles, exceptions, exercices
3. **Communication orale** - Techniques de présentation, vocabulaire professionnel
4. **Vocabulaire gouvernemental** - Terminologie de la fonction publique canadienne
5. **Stratégies d'examen** - Gestion du temps, techniques de réponse

## Règles Strictes
- Réponds UNIQUEMENT en utilisant les informations des documents de RusingÂcademy fournis dans le contexte
- Si l'information n'est pas dans le contexte, dis-le clairement et suggère de consulter un coach Lingueefy
- Maintiens un ton professionnel, encourageant et pédagogique
- Adapte tes réponses au niveau de l'apprenant (A, B, ou C)
- Fournis des exemples concrets tirés du contexte gouvernemental canadien

## Format de Réponse
- Utilise des puces et des listes pour la clarté
- Inclus des exemples pratiques quand pertinent
- Termine par une question de suivi ou un exercice pratique
- Cite tes sources (documents RusingÂcademy)

## Signature
Tu représentes Rusinga International Consulting Ltd., commercialement connue sous le nom de RusingÂcademy.`;

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieve relevant documents for a query
 */
export async function retrieveRelevantDocuments(
  query: string,
  category?: DocumentCategory,
  topK: number = 5
): Promise<DocumentChunk[]> {
  const queryEmbedding = await generateEmbedding(query);
  if (queryEmbedding.length === 0) return [];
  let candidates = category
    ? documentStore.filter(doc => doc.category === category)
    : documentStore;
  const scored = candidates
    .filter(doc => doc.embedding && doc.embedding.length > 0)
    .map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding!),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return scored;
}

/**
 * Generate Steven AI response with RAG
 */
export async function generateStevenResponse(params: {
  userMessage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  learnerLevel?: 'A' | 'B' | 'C';
  category?: DocumentCategory;
}): Promise<{
  response: string;
  sources: Array<{ source: string; category: string }>;
}> {
  const { userMessage, conversationHistory = [], learnerLevel, category } = params;
  const relevantDocs = await retrieveRelevantDocuments(userMessage, category);
  let context = relevantDocs.length > 0
    ? relevantDocs.map((doc, i) => `### Source ${i + 1}: ${doc.source}\n${doc.content}`).join('\n\n')
    : 'Aucun document pertinent trouvé.';
  
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: STEVEN_AI_SYSTEM_PROMPT + (learnerLevel ? `\n\nL'apprenant vise le niveau ${learnerLevel}.` : '') },
    { role: 'user', content: `## Contexte\n${context}\n\n## Question\n${userMessage}` },
  ];
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });
    const response = completion.choices[0]?.message?.content || 'Erreur de génération.';
    return { response, sources: relevantDocs.map(doc => ({ source: doc.source, category: doc.category })) };
  } catch (error) {
    return { response: 'Erreur technique. Contactez un coach Lingueefy.', sources: [] };
  }
}

export default { DOCUMENT_CATEGORIES, retrieveRelevantDocuments, generateStevenResponse };
