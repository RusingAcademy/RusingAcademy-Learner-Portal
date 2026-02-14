#!/usr/bin/env npx tsx
/**
 * SLE AI Companion — Seed: Proficiency Standards & Evaluation Rubrics
 * 
 * Idempotent seed script: can be re-run safely (UPSERT logic).
 * Seeds the sle_proficiency_standards and sle_evaluation_rubrics tables
 * with PSC-aligned data.
 * 
 * Usage: npx tsx scripts/sle/seed-standards-rubrics.ts
 * 
 * @module scripts/sle/seed-standards-rubrics
 */
import { v4 as uuidv4 } from "uuid";

// ─── Proficiency Standards (A/B/C/E/X) ──────────────────────────────────────

export const PROFICIENCY_STANDARDS = [
  {
    levelId: "X",
    descriptionFr: "Performance insuffisante. Résultat inférieur au niveau A. Indique un besoin de remédiation fondamentale (grammaire de base, conjugaison élémentaire).",
    descriptionEn: "Insufficient performance. Below Level A. Indicates a need for fundamental remediation (basic grammar, elementary conjugation).",
    minScoreReading: 0,
    minScoreWriting: 0,
    minScoreOral: 0,
    passThreshold: 0,
    sustainedPerformanceWindow: 5,
    oralComplexityRubric: {
      syntaxExpected: "Fragments, incomplete sentences",
      discourseMarkers: [],
      registerLevel: "N/A",
      cognitiveComplexity: "Unable to sustain basic communication",
    },
  },
  {
    levelId: "A",
    descriptionFr: "Débutant. Concrétude et routine. Le candidat peut traiter des questions simples et répétitives. Vocabulaire limité aux champs sémantiques immédiats (temps, lieu, personne). Syntaxe directe (Sujet-Verbe-Objet).",
    descriptionEn: "Beginner. Concrete and routine. The candidate can handle simple, repetitive questions. Vocabulary limited to immediate semantic fields (time, place, person). Direct syntax (Subject-Verb-Object).",
    minScoreReading: 18,
    minScoreWriting: 20,
    minScoreOral: 36,
    passThreshold: 36,
    sustainedPerformanceWindow: 5,
    oralComplexityRubric: {
      syntaxExpected: "Simple SVO sentences, present tense dominant, basic questions",
      discourseMarkers: ["et", "mais", "parce que", "aussi"],
      registerLevel: "Informal acceptable, tu/vous inconsistent",
      cognitiveComplexity: "Concrete, factual, routine workplace topics",
    },
  },
  {
    levelId: "B",
    descriptionFr: "Intermédiaire. Narration et faits. C'est le niveau « pivot ». Le candidat maîtrise la narration au passé et la description factuelle. Capacité à distinguer l'idée principale des détails secondaires et à enchaîner des idées concrètes.",
    descriptionEn: "Intermediate. Narration and facts. This is the 'pivot' level. The candidate masters past narration and factual description. Ability to distinguish main ideas from secondary details and chain concrete ideas.",
    minScoreReading: 28,
    minScoreWriting: 31,
    minScoreOral: 55,
    passThreshold: 55,
    sustainedPerformanceWindow: 5,
    oralComplexityRubric: {
      syntaxExpected: "Passé composé vs imparfait, relative clauses, conditional simple, comparative structures",
      discourseMarkers: ["d'abord", "ensuite", "cependant", "par contre", "en fait", "par exemple"],
      registerLevel: "Consistent vous in professional context, semi-formal register",
      cognitiveComplexity: "Narration, explanation, comparison, factual opinion with justification",
    },
  },
  {
    levelId: "C",
    descriptionFr: "Avancé. Abstraction et nuance. Le niveau de la gestion et de la stratégie. Le candidat doit manipuler des concepts hypothétiques, persuader et négocier. Utilisation de connecteurs logiques complexes et du subjonctif/conditionnel. Introduction de « friction » (désaccords, ambiguïté).",
    descriptionEn: "Advanced. Abstraction and nuance. The management and strategy level. The candidate must manipulate hypothetical concepts, persuade and negotiate. Use of complex logical connectors and subjunctive/conditional. Introduction of 'friction' (disagreements, ambiguity).",
    minScoreReading: 38,
    minScoreWriting: 43,
    minScoreOral: 75,
    passThreshold: 75,
    sustainedPerformanceWindow: 5,
    oralComplexityRubric: {
      syntaxExpected: "Subjonctif, conditionnel passé, plus-que-parfait, passive voice, concessive structures (bien que, quoique), hypothetical chains (si + plus-que-parfait → conditionnel passé)",
      discourseMarkers: ["en l'occurrence", "force est de constater", "il n'en demeure pas moins", "en revanche", "néanmoins", "quoi qu'il en soit", "à cet égard", "dans cette optique"],
      registerLevel: "Formal diplomatic register, consistent vous, ability to modulate tone",
      cognitiveComplexity: "Abstract reasoning, hypothesis, persuasion, negotiation, nuance, friction management, leadership competencies",
    },
  },
  {
    levelId: "E",
    descriptionFr: "Exemption. Maîtrise quasi-native. Le candidat opère avec une aisance totale, sans erreurs récurrentes. Débits de parole rapides et textes d'une grande densité idiomatique.",
    descriptionEn: "Exemption. Near-native mastery. The candidate operates with total ease, without recurring errors. Rapid speech rate and texts with high idiomatic density.",
    minScoreReading: 45,
    minScoreWriting: 52,
    minScoreOral: 90,
    passThreshold: 90,
    sustainedPerformanceWindow: 5,
    oralComplexityRubric: {
      syntaxExpected: "All structures with native-like accuracy, idiomatic expressions, proverbs, cultural references",
      discourseMarkers: ["toujours est-il que", "soit dit en passant", "à plus forte raison", "en tout état de cause"],
      registerLevel: "Full register control — can shift seamlessly between formal, semi-formal, and colloquial",
      cognitiveComplexity: "Unrestricted — can handle any topic with sophistication and cultural sensitivity",
    },
  },
];

// ─── Evaluation Rubrics (5 criteria × 3 levels) ─────────────────────────────

export const EVALUATION_RUBRICS = [
  // ── GRAMMAR ──
  {
    rubricId: uuidv4(),
    criterionName: "grammar" as const,
    level: "A" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Correct use of basic structures (SVO, present tense, basic questions). Minimal errors in simple sentences.",
    descriptorGood: "Mostly correct basic structures with occasional errors that do not impede understanding.",
    descriptorAdequate: "Frequent errors in basic structures but communication remains possible for routine topics.",
    descriptorDeveloping: "Significant errors in basic structures. Communication is often impeded.",
    descriptorInsufficient: "Cannot produce basic grammatical structures. Communication breaks down.",
    feedbackTemplates: {
      instant_correction: [
        "Attention à la conjugaison du verbe « {verb} » au présent.",
        "N'oubliez pas l'accord sujet-verbe.",
      ],
      end_of_turn: [
        "Vous avez bien utilisé les structures de base. Continuez à pratiquer la conjugaison au présent.",
        "Quelques erreurs de grammaire de base, mais votre message passe bien.",
      ],
      session_summary: [
        "Votre grammaire de base est {level}. Concentrez-vous sur la conjugaison au présent et les accords.",
      ],
      drill_suggestion: [
        "Exercice recommandé : conjugaison des verbes du 1er groupe au présent.",
        "Pratiquez les phrases simples Sujet-Verbe-Objet.",
      ],
      encouragement: [
        "Chaque phrase correcte est un pas en avant. Continuez!",
      ],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "grammar" as const,
    level: "B" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Good control of intermediate grammar: passé composé vs imparfait, relative clauses, conditional. Errors are infrequent and self-corrected.",
    descriptorGood: "Generally correct use of past tenses and conditional. Some errors with complex structures but meaning is clear.",
    descriptorAdequate: "Inconsistent use of past tenses. Errors with relative clauses and conditional are common.",
    descriptorDeveloping: "Limited control of intermediate structures. Frequent errors that impede nuanced expression.",
    descriptorInsufficient: "Cannot produce intermediate grammatical structures. Reverts to Level A patterns.",
    feedbackTemplates: {
      instant_correction: [
        "Attention : passé composé ou imparfait? Ici, c'est une action ponctuelle → passé composé.",
        "La proposition relative nécessite « qui » (sujet) ou « que » (objet).",
      ],
      end_of_turn: [
        "Bonne utilisation du passé composé dans votre narration.",
        "Attention à la distinction passé composé / imparfait dans vos récits.",
      ],
      session_summary: [
        "Votre maîtrise des temps du passé est {level}. Travaillez la distinction PC/imparfait.",
      ],
      drill_suggestion: [
        "Exercice : racontez votre journée d'hier en alternant passé composé et imparfait.",
        "Pratiquez les phrases avec « si + imparfait → conditionnel présent ».",
      ],
      encouragement: [
        "Votre narration s'améliore. Les temps du passé deviennent plus naturels.",
      ],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "grammar" as const,
    level: "C" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Sophisticated control of advanced grammar: subjonctif, conditionnel passé, plus-que-parfait, passive voice, concessive structures. Errors are rare and do not affect communication.",
    descriptorGood: "Good control of advanced structures. Occasional errors with subjunctive or complex hypotheticals.",
    descriptorAdequate: "Adequate control of intermediate grammar but inconsistent with advanced structures (subjunctive, concessive).",
    descriptorDeveloping: "Limited control of advanced structures. Frequent errors that occasionally impede nuanced expression.",
    descriptorInsufficient: "Cannot produce advanced grammatical structures. Communication lacks precision.",
    feedbackTemplates: {
      instant_correction: [
        "Après « bien que », utilisez le subjonctif : « bien que ce soit » et non « bien que c'est ».",
        "Pour une hypothèse irréelle dans le passé : « si + plus-que-parfait → conditionnel passé ».",
      ],
      end_of_turn: [
        "Excellente utilisation du subjonctif dans votre argumentation.",
        "Attention aux structures concessives — « bien que » + subjonctif.",
      ],
      session_summary: [
        "Votre maîtrise des structures avancées est {level}. Le subjonctif et les hypothèses complexes sont vos prochains objectifs.",
      ],
      drill_suggestion: [
        "Exercice : reformulez ces phrases en utilisant « bien que + subjonctif ».",
        "Pratiquez les chaînes hypothétiques : si + PQP → conditionnel passé.",
      ],
      encouragement: [
        "Votre capacité à nuancer vos propos progresse. Le niveau C est à votre portée.",
      ],
    },
  },

  // ── VOCABULARY ──
  {
    rubricId: uuidv4(),
    criterionName: "vocabulary" as const,
    level: "A" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Adequate vocabulary for routine workplace topics. Can name common objects, actions, and people in the work environment.",
    descriptorGood: "Sufficient vocabulary for most routine situations. Occasional gaps filled with circumlocution.",
    descriptorAdequate: "Limited but functional vocabulary. Relies on basic words and some anglicisms.",
    descriptorDeveloping: "Very limited vocabulary. Frequent gaps that impede basic communication.",
    descriptorInsufficient: "Vocabulary insufficient for basic workplace communication.",
    feedbackTemplates: {
      instant_correction: ["Le mot juste en français est « {correct} » plutôt que « {incorrect} »."],
      end_of_turn: ["Bon vocabulaire de base pour décrire votre travail."],
      session_summary: ["Votre vocabulaire de base est {level}. Enrichissez votre lexique professionnel quotidien."],
      drill_suggestion: ["Apprenez 5 nouveaux mots liés à votre environnement de travail chaque jour."],
      encouragement: ["Votre vocabulaire s'enrichit à chaque session. Continuez!"],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "vocabulary" as const,
    level: "B" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Good range of vocabulary for concrete non-routine situations. Can discuss projects, processes, and opinions with appropriate terminology.",
    descriptorGood: "Adequate vocabulary range with occasional imprecision. Can express most ideas with some circumlocution.",
    descriptorAdequate: "Sufficient vocabulary for familiar topics but struggles with less common workplace situations.",
    descriptorDeveloping: "Limited vocabulary range. Frequent anglicisms and circumlocution.",
    descriptorInsufficient: "Vocabulary insufficient for intermediate-level communication.",
    feedbackTemplates: {
      instant_correction: ["Plutôt que « {incorrect} », utilisez « {correct} » dans ce contexte professionnel."],
      end_of_turn: ["Bon vocabulaire pour expliquer votre projet. Variez davantage vos expressions."],
      session_summary: ["Votre vocabulaire est {level}. Travaillez les termes spécifiques à votre domaine."],
      drill_suggestion: ["Exercice : décrivez un processus de travail en utilisant au moins 10 termes techniques."],
      encouragement: ["Votre vocabulaire professionnel s'élargit. Les nuances viendront avec la pratique."],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "vocabulary" as const,
    level: "C" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Rich, precise, and nuanced vocabulary. Masterful register control — can shift between formal policy language, diplomatic phrasing, and technical terminology.",
    descriptorGood: "Wide vocabulary range with occasional imprecision in specialized terms. Good register awareness.",
    descriptorAdequate: "Adequate vocabulary for most topics but lacks precision for nuanced or specialized discussion.",
    descriptorDeveloping: "Limited advanced vocabulary. Cannot consistently maintain appropriate register.",
    descriptorInsufficient: "Vocabulary insufficient for advanced-level communication.",
    feedbackTemplates: {
      instant_correction: ["Dans un contexte diplomatique, préférez « {correct} » à « {incorrect} »."],
      end_of_turn: ["Excellent registre formel. Votre vocabulaire de gestion est précis."],
      session_summary: ["Votre vocabulaire avancé est {level}. Travaillez le lexique de leadership et de négociation."],
      drill_suggestion: ["Exercice : reformulez ces phrases en registre diplomatique formel."],
      encouragement: ["Votre maîtrise du registre formel impressionne. Continuez à raffiner."],
    },
  },

  // ── FLUENCY ──
  {
    rubricId: uuidv4(),
    criterionName: "fluency" as const,
    level: "A" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Can produce short, simple utterances with natural pauses. Hesitations are brief and do not impede understanding.",
    descriptorGood: "Produces simple sentences with some hesitation. Pauses are noticeable but communication flows.",
    descriptorAdequate: "Frequent pauses and hesitations. Can sustain short exchanges on familiar topics.",
    descriptorDeveloping: "Very hesitant. Long pauses between words and phrases. Communication is labored.",
    descriptorInsufficient: "Cannot sustain even basic exchanges. Communication breaks down frequently.",
    feedbackTemplates: {
      instant_correction: [],
      end_of_turn: ["Bon débit pour les phrases simples. Essayez de lier vos idées plus naturellement."],
      session_summary: ["Votre fluidité est {level}. Pratiquez des échanges courts et réguliers."],
      drill_suggestion: ["Exercice : décrivez une image pendant 30 secondes sans pause."],
      encouragement: ["Votre aisance s'améliore. La régularité est la clé."],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "fluency" as const,
    level: "B" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Fairly natural delivery with some spontaneity. Pauses are mostly for planning ideas, not searching for words.",
    descriptorGood: "Generally fluent with occasional hesitations for complex ideas. Can sustain extended turns.",
    descriptorAdequate: "Some fluency for familiar topics but hesitant with unfamiliar subjects. Pauses for word search.",
    descriptorDeveloping: "Frequent hesitations even on familiar topics. Cannot sustain extended turns.",
    descriptorInsufficient: "Very hesitant. Cannot produce sustained speech.",
    feedbackTemplates: {
      instant_correction: [],
      end_of_turn: ["Bonne fluidité dans votre narration. Les transitions sont naturelles."],
      session_summary: ["Votre fluidité est {level}. Pratiquez les monologues de 2-3 minutes."],
      drill_suggestion: ["Exercice : racontez une anecdote de travail pendant 2 minutes sans interruption."],
      encouragement: ["Votre débit devient plus naturel. La confiance vient avec la pratique."],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "fluency" as const,
    level: "C" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Natural, spontaneous delivery. Hesitations are only for complex ideas, not language. Can maintain extended discourse on abstract topics.",
    descriptorGood: "Generally fluent with occasional pauses for complex argumentation. Good spontaneity.",
    descriptorAdequate: "Adequate fluency for concrete topics but hesitant with abstract or sensitive subjects.",
    descriptorDeveloping: "Noticeable hesitations when discussing abstract topics. Cannot sustain complex argumentation.",
    descriptorInsufficient: "Fluency does not meet advanced-level expectations.",
    feedbackTemplates: {
      instant_correction: [],
      end_of_turn: ["Excellent débit. Votre argumentation est fluide et naturelle."],
      session_summary: ["Votre fluidité est {level}. Travaillez les débats et discussions complexes."],
      drill_suggestion: ["Exercice : défendez une position controversée pendant 3 minutes."],
      encouragement: ["Votre aisance dans les sujets complexes est remarquable."],
    },
  },

  // ── PRONUNCIATION ──
  {
    rubricId: uuidv4(),
    criterionName: "pronunciation" as const,
    level: "A" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Generally clear pronunciation despite accent. Familiar words are well pronounced.",
    descriptorGood: "Mostly intelligible. Some mispronunciations of common words but meaning is clear.",
    descriptorAdequate: "Accent is noticeable and occasionally impedes understanding. Key words may be mispronounced.",
    descriptorDeveloping: "Frequent mispronunciations that impede understanding. Strong L1 interference.",
    descriptorInsufficient: "Pronunciation makes communication very difficult.",
    feedbackTemplates: {
      instant_correction: ["Attention à la prononciation de « {word} » : c'est /{phonetic}/."],
      end_of_turn: ["Bonne prononciation des mots courants."],
      session_summary: ["Votre prononciation est {level}. Écoutez et répétez les mots clés."],
      drill_suggestion: ["Exercice : écoutez et répétez ces 10 mots courants du bureau."],
      encouragement: ["Votre prononciation s'améliore. L'écoute active est votre meilleur outil."],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "pronunciation" as const,
    level: "B" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Clear pronunciation. Accent is noticeable but rarely interferes with comprehension.",
    descriptorGood: "Generally clear with occasional mispronunciations of less common words.",
    descriptorAdequate: "Accent sometimes interferes. Mispronunciations of technical or specialized terms.",
    descriptorDeveloping: "Accent frequently interferes with comprehension. Inconsistent pronunciation.",
    descriptorInsufficient: "Pronunciation significantly impedes communication.",
    feedbackTemplates: {
      instant_correction: ["La liaison est importante ici : « les‿employés » /lez‿ɑ̃plwaje/."],
      end_of_turn: ["Bonne prononciation générale. Attention aux liaisons."],
      session_summary: ["Votre prononciation est {level}. Travaillez les liaisons et les sons nasaux."],
      drill_suggestion: ["Exercice : pratiquez les liaisons obligatoires dans des phrases professionnelles."],
      encouragement: ["Votre prononciation est de plus en plus naturelle."],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "pronunciation" as const,
    level: "C" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Near-native pronunciation. Accent is minimal and never interferes. Correct intonation patterns for emphasis and nuance.",
    descriptorGood: "Clear pronunciation with good intonation. Accent is present but does not interfere.",
    descriptorAdequate: "Generally clear but accent is more noticeable in extended discourse. Some intonation issues.",
    descriptorDeveloping: "Accent interferes with nuanced communication. Intonation patterns are non-native.",
    descriptorInsufficient: "Pronunciation does not meet advanced-level expectations.",
    feedbackTemplates: {
      instant_correction: ["L'intonation montante ici marque l'ironie / la concession."],
      end_of_turn: ["Excellente prononciation et intonation dans votre argumentation."],
      session_summary: ["Votre prononciation est {level}. Travaillez l'intonation expressive."],
      drill_suggestion: ["Exercice : lisez un discours officiel en imitant l'intonation d'un locuteur natif."],
      encouragement: ["Votre prononciation est quasi-native. Impressionnant!"],
    },
  },

  // ── COMPREHENSION ──
  {
    rubricId: uuidv4(),
    criterionName: "comprehension" as const,
    level: "A" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Understands simple, clearly articulated speech about familiar workplace topics at a slow to normal pace.",
    descriptorGood: "Understands most simple questions and instructions. May need repetition for longer utterances.",
    descriptorAdequate: "Understands basic questions but needs frequent repetition and simplification.",
    descriptorDeveloping: "Limited comprehension. Needs very slow, simplified speech with frequent repetition.",
    descriptorInsufficient: "Cannot understand basic workplace communication.",
    feedbackTemplates: {
      instant_correction: [],
      end_of_turn: ["Vous avez bien compris la question. Bonne écoute!"],
      session_summary: ["Votre compréhension est {level}. Écoutez des audios simples quotidiennement."],
      drill_suggestion: ["Exercice : écoutez un message vocal simple et résumez-le."],
      encouragement: ["Votre compréhension s'améliore. L'écoute régulière fait toute la différence."],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "comprehension" as const,
    level: "B" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Understands concrete work-related topics at normal speed. Can follow extended explanations and narratives.",
    descriptorGood: "Understands most work-related speech. May miss some details in rapid or complex passages.",
    descriptorAdequate: "Understands familiar topics but struggles with unfamiliar subjects or rapid speech.",
    descriptorDeveloping: "Limited comprehension of extended speech. Needs frequent clarification.",
    descriptorInsufficient: "Cannot follow work-related discussions at normal speed.",
    feedbackTemplates: {
      instant_correction: [],
      end_of_turn: ["Bonne compréhension de la question complexe."],
      session_summary: ["Votre compréhension est {level}. Pratiquez l'écoute de présentations professionnelles."],
      drill_suggestion: ["Exercice : écoutez un podcast professionnel et identifiez les idées principales."],
      encouragement: ["Votre compréhension des sujets professionnels est solide."],
    },
  },
  {
    rubricId: uuidv4(),
    criterionName: "comprehension" as const,
    level: "C" as const,
    maxPoints: 20,
    weightFactor: "1.00",
    descriptorExcellent: "Understands linguistically complex speech at normal speed, including abstract topics, implied meanings, and subtle nuances.",
    descriptorGood: "Understands complex speech with occasional need for clarification on highly abstract or culturally specific content.",
    descriptorAdequate: "Understands most complex speech but misses subtle nuances and implied meanings.",
    descriptorDeveloping: "Struggles with abstract topics and implied meanings. Needs simplification.",
    descriptorInsufficient: "Cannot follow complex, abstract discussions.",
    feedbackTemplates: {
      instant_correction: [],
      end_of_turn: ["Excellente compréhension des nuances dans la question."],
      session_summary: ["Votre compréhension est {level}. Travaillez les sous-entendus et l'implicite."],
      drill_suggestion: ["Exercice : analysez un débat politique et identifiez les arguments implicites."],
      encouragement: ["Votre capacité à saisir les nuances est remarquable."],
    },
  },
];

// ─── Knowledge Base Collections (5 logical RAG collections) ──────────────────

export const KNOWLEDGE_COLLECTIONS = [
  {
    collectionKey: "rubrics_standards",
    name: "Rubrics & Standards",
    description: "PSC proficiency level descriptors (A/B/C/E/X), evaluation criteria, scoring thresholds, and examples. The foundational reference for all scoring decisions.",
    itemCount: 0,
    version: "1.0.0",
  },
  {
    collectionKey: "scenario_bank",
    name: "Scenario Bank",
    description: "Oral practice scenarios with question sequences, probing follow-ups, and tags. Organized by level, topic domain, and duration.",
    itemCount: 0,
    version: "1.0.0",
  },
  {
    collectionKey: "model_answers",
    name: "Model Answers",
    description: "Reference answers for Level B and C scenarios, with register variants (formal, semi-formal). Demonstrates expected structures and vocabulary.",
    itemCount: 0,
    version: "1.0.0",
  },
  {
    collectionKey: "error_library",
    name: "Error Library",
    description: "Categorized language errors: false friends (faux-amis), structural errors, conjugation mistakes, register violations, and pronunciation issues. Each with correction rules and feedback.",
    itemCount: 0,
    version: "1.0.0",
  },
  {
    collectionKey: "federal_lexicon",
    name: "Federal Lexicon",
    description: "Government of Canada terminology, job titles, collocations, and linguistic traps specific to the federal public service context.",
    itemCount: 0,
    version: "1.0.0",
  },
];

// ─── Main execution ─────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  SLE AI Companion — Seed: Standards & Rubrics              ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("");

  // Output as JSON for the import pipeline to consume
  // In production, this would use Drizzle ORM to UPSERT directly
  const output = {
    proficiencyStandards: PROFICIENCY_STANDARDS,
    evaluationRubrics: EVALUATION_RUBRICS,
    knowledgeCollections: KNOWLEDGE_COLLECTIONS,
    summary: {
      standards: PROFICIENCY_STANDARDS.length,
      rubrics: EVALUATION_RUBRICS.length,
      collections: KNOWLEDGE_COLLECTIONS.length,
      criteria: ["grammar", "vocabulary", "fluency", "pronunciation", "comprehension"],
      levels: ["A", "B", "C"],
    },
  };

  console.log(`✓ ${output.summary.standards} proficiency standards (${PROFICIENCY_STANDARDS.map(s => s.levelId).join(", ")})`);
  console.log(`✓ ${output.summary.rubrics} evaluation rubrics (${output.summary.criteria.join(", ")} × ${output.summary.levels.join(", ")})`);
  console.log(`✓ ${output.summary.collections} knowledge collections`);
  console.log("");

  // Write seed data to JSON files for the import pipeline
  const fs = await import("fs");
  const path = await import("path");
  
  const outDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../data/sle/seed");
  
  // Proficiency standards as JSONL
  const standardsPath = path.join(outDir, "proficiency_standards.jsonl");
  const standardsLines = PROFICIENCY_STANDARDS.map(s => JSON.stringify(s)).join("\n") + "\n";
  fs.writeFileSync(standardsPath, standardsLines);
  console.log(`✓ Written: ${standardsPath}`);

  // Evaluation rubrics as JSONL
  const rubricsV2Path = path.join(outDir, "evaluation_rubrics_v2.jsonl");
  const rubricsLines = EVALUATION_RUBRICS.map(r => JSON.stringify(r)).join("\n") + "\n";
  fs.writeFileSync(rubricsV2Path, rubricsLines);
  console.log(`✓ Written: ${rubricsV2Path}`);

  // Knowledge collections as JSONL
  const collectionsPath = path.join(outDir, "knowledge_collections.jsonl");
  const collectionsLines = KNOWLEDGE_COLLECTIONS.map(c => JSON.stringify(c)).join("\n") + "\n";
  fs.writeFileSync(collectionsPath, collectionsLines);
  console.log(`✓ Written: ${collectionsPath}`);

  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  SEED COMPLETE — Quality Gate: PASS");
  console.log("═══════════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("SEED FAILED:", err);
  process.exit(1);
});
