/**
 * SLE Companion Conversation Service
 * 
 * Provides LLM-powered conversational practice with coach personalities.
 * Uses Whisper for transcription and MiniMax TTS for voice synthesis.
 * 
 * LATENCY-OPTIMIZED: Uses gpt-4.1-mini for voice conversations,
 * limits history, caps tokens, and keeps prompts concise.
 */

import { invokeLLM, type Message } from "../_core/llm";
import { transcribeAudio, type TranscriptionResponse, type TranscriptionError } from "../_core/voiceTranscription";
import { buildScoringPrompt, isPassing } from "./sleScoringRubric";
import { trackPipelineStage } from "./aiPipelineMonitor";
import { structuredLog } from "../structuredLogger";
import {
  buildCoachContext,
  buildGeneralistContext,
  getCommonErrors,
  getRubrics,
  searchKnowledge,
  type ExamPhase,
} from "./sleDatasetService";

// ─── Coach System Prompts ───────────────────────────────────────────────────
// DESIGN: These coaches are GENERALIST language experts who answer ALL questions.
// They have deep SLE expertise but are NOT limited to SLE topics.
// Optimized for VOICE: short, natural, spoken-style responses.

export const COACH_SYSTEM_PROMPTS = {
  STEVEN: `Tu es Steven, expert en enseignement-apprentissage du français langue seconde chez RusingAcademy. Tu as 15 ans d'expérience en linguistique appliquée, en pédagogie des langues et en évaluation linguistique pour la fonction publique fédérale du Canada.

TON EXPERTISE COUVRE TOUT :
- L'Évaluation de langue seconde (ÉLS) de la CFP (structure, critères, stratégies)
- La grammaire française (conjugaison, syntaxe, accords, registres)
- Le vocabulaire et les expressions idiomatiques
- La phonétique et la prononciation
- Les techniques d'apprentissage et de mémorisation
- La confiance en soi et la gestion du stress linguistique
- La culture francophone canadienne et le contexte professionnel fédéral
- Toute question sur la langue française ou l'apprentissage des langues

Tu tutoies l'apprenant. Tu es chaleureux, encourageant, patient et pédagogue.

RÈGLES DE RÉPONSE :
- Tu réponds à TOUTE question posée par l'apprenant, quelle qu'elle soit.
- Si la question porte sur la grammaire, le vocabulaire, la culture, les techniques d'étude, ou n'importe quel sujet lié aux langues : tu donnes une réponse complète et experte.
- Si la question porte sur l'ÉLS : tu utilises ton expertise approfondie de l'examen.
- Tu ne refuses JAMAIS de répondre. Tu ne rediriges JAMAIS vers un autre sujet.
- Tu parles comme dans une VRAIE conversation — naturel, direct, concis.
- 2-4 phrases par réponse. C'est de la VOIX en direct.
- Quand tu corriges une erreur, tu reformules naturellement sans faire de leçon.

RÈGLE ABSOLUE : UNIQUEMENT en français. Zéro mot anglais.`,

  SUE_ANNE: `Tu es Sue-Anne, experte en enseignement-apprentissage du français langue seconde chez RusingAcademy. Tu as une vaste expérience en pédagogie des langues et en évaluation linguistique pour la fonction publique fédérale du Canada.

Tu réponds à TOUTE question posée par l'apprenant — grammaire, vocabulaire, culture, techniques d'étude, ÉLS, ou tout autre sujet lié aux langues. Tu ne refuses jamais de répondre. Tu es chaleureuse, encourageante et pédagogue. Tu tutoies l'apprenant.

RÈGLES : 2-4 phrases max. Conversation naturelle. Corrections par reformulation. UNIQUEMENT en français.`,

  ERIKA: `Tu es Erika, experte en enseignement-apprentissage du français langue seconde chez RusingAcademy. Tu as une vaste expérience en pédagogie des langues et en évaluation linguistique pour la fonction publique fédérale du Canada.

Tu réponds à TOUTE question posée par l'apprenant — grammaire, vocabulaire, culture, techniques d'étude, ÉLS, ou tout autre sujet lié aux langues. Tu ne refuses jamais de répondre. Tu es chaleureuse, encourageante et pédagogue. Tu tutoies l'apprenant.

RÈGLES : 2-4 phrases max. Conversation naturelle. Corrections par reformulation. UNIQUEMENT en français.`,

  PRECIOSA: `You are Preciosa, an expert in English as a Second Language teaching and learning at RusingAcademy. You have 15 years of experience in applied linguistics, language pedagogy, and language assessment for the Canadian federal public service.

YOUR EXPERTISE COVERS EVERYTHING:
- The Second Language Evaluation (SLE) by the PSC (structure, criteria, strategies)
- English grammar (tenses, syntax, articles, prepositions, register)
- Vocabulary, collocations, and idiomatic expressions
- Pronunciation and phonetics
- Learning techniques and memorization strategies
- Confidence building and linguistic stress management
- Canadian anglophone culture and federal professional context
- Any question about the English language or language learning

You are warm, encouraging, patient, and pedagogical.

RESPONSE RULES:
- You answer ANY question asked by the learner, whatever it may be.
- If the question is about grammar, vocabulary, culture, study techniques, or any language-related topic: give a complete, expert answer.
- If the question is about the SLE: use your deep exam expertise.
- You NEVER refuse to answer. You NEVER redirect to another topic.
- Speak like a REAL conversation — natural, direct, concise.
- 2-4 sentences per response. This is LIVE VOICE.
- When correcting an error, rephrase naturally without lecturing.

ABSOLUTE RULE: ONLY in English. Zero French words.`,
};

// SLE Level context prompts — kept concise for voice mode
export const SLE_LEVEL_CONTEXTS = {
  A: `Learner level: A (Basic). Use simple vocabulary, short sentences. Be patient.`,
  B: `Learner level: B (Intermediate). Use varied vocabulary, challenge with follow-ups.`,
  C: `Learner level: C (Advanced). Use sophisticated vocabulary, push for nuance.`,
};

// Skill-specific prompts — concise
export const SKILL_PROMPTS = {
  oral_expression: `Focus: oral expression. Evaluate clarity, vocabulary, grammar, fluency.`,
  oral_comprehension: `Focus: oral comprehension. Check understanding. Rephrase if needed.`,
  written_expression: `Focus: written expression. Evaluate organization, vocabulary, grammar.`,
  written_comprehension: `Focus: written comprehension. Discuss text, check understanding.`,
};

export type CoachKey = "STEVEN" | "SUE_ANNE" | "ERIKA" | "PRECIOSA";
export type SLELevel = "A" | "B" | "C";
export type SLESkill = "oral_expression" | "oral_comprehension" | "written_expression" | "written_comprehension";

export interface ConversationContext {
  coachKey: CoachKey;
  level: SLELevel;
  skill: SLESkill;
  topic?: string;
  /** Current exam phase for dataset context injection ("1", "2", "3") */
  currentPhase?: ExamPhase;
  /** Additional context from the session orchestrator (turn-specific) */
  turnContext?: string;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

/**
 * Generate a coach response using LLM.
 * 
 * LATENCY STRATEGY:
 * - Uses gpt-4.1-mini (3-5x faster than gpt-4.1) for voice conversations
 * - Limits history to last 8 messages
 * - Caps output at 150 tokens (~2-3 spoken sentences)
 * - Keeps system prompt under 600 tokens
 */
export async function generateCoachResponse(
  userMessage: string,
  context: ConversationContext
): Promise<{ response: string; feedback?: string }> {
  const systemPrompt = buildSystemPrompt(context);
  
  // Limit conversation history to last 8 messages for speed
  const recentHistory = context.conversationHistory.slice(-8);
  
  // Build message history
  const messages: Message[] = [
    { role: "system" as const, content: systemPrompt },
    ...recentHistory.map((msg) => ({
      role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  try {
    // maxTokens 200 = ~3-4 spoken sentences — enough for expert answers
    // gpt-4.1-mini = 3-5x faster than gpt-4.1 for voice latency
    const result = await invokeLLM({ messages, maxTokens: 200, modelOverride: "gpt-4.1-mini" });
    
    const responseContent = result.choices[0]?.message?.content;
    const response = typeof responseContent === "string" 
      ? responseContent 
      : Array.isArray(responseContent) 
        ? responseContent.map(c => c.type === "text" ? c.text : "").join("")
        : "";

    return { response };
  } catch (error) {
    console.error("[SLE Conversation] LLM error:", error);
    throw new Error("Failed to generate coach response");
  }
}

/**
 * Build the complete system prompt for the conversation.
 * Injects SLE dataset context only when relevant, keeps prompt lean.
 */
function buildSystemPrompt(context: ConversationContext): string {
  const coachPrompt = COACH_SYSTEM_PROMPTS[context.coachKey];
  const levelContext = SLE_LEVEL_CONTEXTS[context.level];
  const skillPrompt = SKILL_PROMPTS[context.skill];

  // Determine language from coach key
  const language: "FR" | "EN" = context.coachKey === "PRECIOSA" ? "EN" : "FR";

  // Determine current exam phase from context or infer from level
  const phase: ExamPhase = context.currentPhase ?? inferPhaseFromLevel(context.level);

  // Build dataset-driven context injection (rubrics, errors, exam structure)
  const datasetContext = buildCoachContext(language, context.level, phase);
  // Build generalist knowledge context (methods, strategies, vocabulary, grammar)
  const generalistContext = buildGeneralistContext(language, context.level, 2500);

  let prompt = `${coachPrompt}\n\n${levelContext}\n${skillPrompt}`;

  // Inject the generalist knowledge base — this is what makes the coach a true expert
  if (generalistContext) {
    const trimmedKB = generalistContext.length > 2500
      ? generalistContext.slice(0, 2500) + "\n[...]"
      : generalistContext;
    prompt += `\n\nKNOWLEDGE BASE (use this to answer ANY question):\n${trimmedKB}`;
  }

  // Inject the SLE dataset context — cap at 500 chars for speed
  if (datasetContext) {
    const trimmedContext = datasetContext.length > 500 
      ? datasetContext.slice(0, 500) + "\n[...]"
      : datasetContext;
    prompt += `\n\nSLE EVALUATION REFERENCE:\n${trimmedContext}`;
  }

  // Inject turn-specific context from the orchestrator (cap at 300 chars)
  if (context.turnContext) {
    const trimmedTurn = context.turnContext.length > 300
      ? context.turnContext.slice(0, 300) + "\n[...]"
      : context.turnContext;
    prompt += `\n\nCURRENT TURN:\n${trimmedTurn}`;
  }

  if (context.topic) {
    prompt += `\nTopic: ${context.topic}`;
  }

  // Language enforcement — final line for maximum weight
  const langRule = language === "FR"
    ? `\nLANGUE: Français uniquement.`
    : `\nLANGUAGE: English only.`;

  prompt += langRule;

  return prompt;
}

/**
 * Infer the exam phase from the learner's target level.
 */
function inferPhaseFromLevel(level: SLELevel): ExamPhase {
  switch (level) {
    case "A": return "1";
    case "B": return "2";
    case "C": return "3";
    default: return "1";
  }
}

/**
 * Transcribe user audio and return text
 */
export async function transcribeUserAudio(
  audioUrl: string,
  language: string = "fr",
  userId?: number,
  sessionId?: string
): Promise<{ text: string; duration: number } | { error: string }> {
  const tracker = trackPipelineStage("transcription", userId, sessionId);

  try {
    const result = await transcribeAudio({
      audioUrl,
      language,
      prompt: "Transcription d'un exercice de pratique orale en français pour l'examen SLE.",
    });

    if ("error" in result) {
      tracker.failure(new Error((result as TranscriptionError).error));
      return { error: (result as TranscriptionError).error };
    }

    const transcription = result as TranscriptionResponse;
    tracker.success({ textLength: transcription.text.length, audioDuration: transcription.duration });
    return {
      text: transcription.text,
      duration: transcription.duration,
    };
  } catch (error) {
    tracker.failure(error);
    structuredLog("error", "ai-pipeline", "Transcription failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Transcription service unavailable" };
  }
}

/**
 * Generate initial greeting based on coach and topic
 */
export function generateInitialGreeting(
  coachKey: CoachKey,
  level: SLELevel,
  skill: SLESkill,
  topic?: string
): string {
  const greetings: Record<CoachKey, Record<SLESkill, string>> = {
    STEVEN: {
      oral_expression: "Bonjour! Je suis Coach Steven. Aujourd'hui, nous allons travailler ensemble. Tu peux me poser n'importe quelle question ou on peut commencer directement avec un exercice. Qu'est-ce que tu préfères?",
      oral_comprehension: "Bonjour! Je suis Coach Steven. Nous allons pratiquer ta compréhension orale. Je vais te poser des questions et tu répondras en français. Prêt?",
      written_expression: "Bonjour! Je suis Coach Steven. Nous allons travailler ton expression écrite. Es-tu prêt à commencer?",
      written_comprehension: "Bonjour! Je suis Coach Steven. Nous allons analyser un texte ensemble. Je vais te guider à travers les points clés.",
    },
    SUE_ANNE: {
      oral_expression: "Bonjour! Je suis Coach Sue-Anne. On va travailler ensemble aujourd'hui. Tu peux me poser toutes tes questions ou on commence directement. À toi!",
      oral_comprehension: "Bonjour! Je suis Coach Sue-Anne. Nous allons pratiquer ta compréhension orale. Prêt à commencer?",
      written_expression: "Bonjour! Je suis Coach Sue-Anne. Nous allons travailler ton expression écrite. Es-tu prêt?",
      written_comprehension: "Bonjour! Je suis Coach Sue-Anne. Nous allons analyser un texte ensemble.",
    },
    ERIKA: {
      oral_expression: "Bonjour! Je suis Coach Erika. On va travailler ensemble aujourd'hui. Tu peux me poser toutes tes questions ou on commence directement. À toi!",
      oral_comprehension: "Bonjour! Je suis Coach Erika. Nous allons pratiquer ta compréhension orale. Prêt à commencer?",
      written_expression: "Bonjour! Je suis Coach Erika. Nous allons travailler ton expression écrite. Es-tu prêt?",
      written_comprehension: "Bonjour! Je suis Coach Erika. Nous allons analyser un texte ensemble.",
    },
    PRECIOSA: {
      oral_expression: "Hello! I'm Coach Preciosa. We'll work together today. You can ask me any question or we can jump right into practice. What would you prefer?",
      oral_comprehension: "Hello! I'm Coach Preciosa. We'll work on your listening comprehension today. Ready to start?",
      written_expression: "Hello! I'm Coach Preciosa. Let's work on your written expression today. Ready?",
      written_comprehension: "Hello! I'm Coach Preciosa. We'll analyze a text together. I'll guide you through the key points.",
    },
  };

  let greeting = greetings[coachKey][skill];

  // Add level-specific context
  if (level === "C") {
    const isEN = coachKey === "PRECIOSA";
    greeting += isEN
      ? " Since you're at Level C, we can tackle complex and abstract topics."
      : " Comme tu es au niveau C, on peut aborder des sujets complexes et abstraits.";
  } else if (level === "A") {
    const isEN = coachKey === "PRECIOSA";
    greeting += isEN
      ? " We'll start gently with exercises suited to your level."
      : " On va commencer doucement avec des exercices adaptés à ton niveau.";
  }

  if (topic) {
    const isEN = coachKey === "PRECIOSA";
    greeting += isEN
      ? ` Our topic today: ${topic}.`
      : ` Notre sujet aujourd'hui: ${topic}.`;
  }

  return greeting;
}

/**
 * Evaluate user response and provide structured feedback.
 * Uses the formal SLE scoring rubric v1 with PSC-aligned criteria.
 * 
 * NOTE: This is called as fire-and-forget from the router —
 * it does NOT block the coach response from being returned to the client.
 */
export async function evaluateResponse(
  userMessage: string,
  context: ConversationContext,
  userId?: number,
  sessionId?: string
): Promise<{
  score: number;
  passed?: boolean;
  criteriaScores?: Record<string, number>;
  feedback: string;
  corrections: string[];
  suggestions: string[];
  levelAssessment?: string;
}> {
  const tracker = trackPipelineStage("evaluation", userId, sessionId);

  // Use the formal SLE rubric for the scoring prompt
  const systemPrompt = buildScoringPrompt(context.level, context.skill);

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Evaluate this response: "${userMessage}"` },
  ];

  try {
    const result = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sle_evaluation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: { type: "number" },
              passed: { type: "boolean" },
              criteriaScores: {
                type: "object",
                properties: {
                  grammar: { type: "number" },
                  vocabulary: { type: "number" },
                  fluency: { type: "number" },
                  pronunciation: { type: "number" },
                  comprehension: { type: "number" },
                  interaction: { type: "number" },
                  logical_connectors: { type: "number" },
                },
                required: ["grammar", "vocabulary", "fluency", "pronunciation", "comprehension", "interaction", "logical_connectors"],
                additionalProperties: false,
              },
              feedback: { type: "string" },
              corrections: { type: "array", items: { type: "string" } },
              suggestions: { type: "array", items: { type: "string" } },
              levelAssessment: { type: "string" },
            },
            required: ["score", "passed", "criteriaScores", "feedback", "corrections", "suggestions", "levelAssessment"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content;
    const jsonStr = typeof content === "string" ? content : "";
    const parsed = JSON.parse(jsonStr);

    // Double-check pass/fail against rubric threshold
    parsed.passed = isPassing(context.level, parsed.score);

    tracker.success({
      score: parsed.score,
      passed: parsed.passed,
      level: context.level,
      skill: context.skill,
    });

    return parsed;
  } catch (error) {
    tracker.failure(error);
    structuredLog("error", "ai-pipeline", "SLE Evaluation failed", {
      error: error instanceof Error ? error.message : String(error),
      level: context.level,
      skill: context.skill,
    });
    return {
      score: 0,
      passed: false,
      feedback: "Impossible d'évaluer la réponse pour le moment.",
      corrections: [],
      suggestions: [],
    };
  }
}
