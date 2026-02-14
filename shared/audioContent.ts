/**
 * Audio Content Mapping for Lessons
 * Maps lesson content to pre-generated pronunciation audio files
 */

export interface AudioPhrase {
  id: string;
  text: string;
  textFr?: string;
  audioUrl: string;
  level: "A" | "B" | "C";
  category: "introduction" | "presentation" | "meeting" | "negotiation" | "technical" | "general";
  duration?: number; // in seconds
  voice?: string; // Voice used for generation
}

// French system voices for lesson audio (NOT coach cloned voices)
export const FRENCH_LESSON_VOICES = {
  MALE_SPEECH: "French_Male_Speech_New",
  FEMALE_NEWS_ANCHOR: "French_Female_News Anchor",
  FEMALE_ANCHOR: "French_FemaleAnchor",
  FEMALE_SPEECH: "French_Female_Speech_New",
} as const;

// Coach cloned voices - RESERVED FOR SLE AI COMPANION ONLY
// Active coaches: Steven (FR) and Preciosa (EN)
// Legacy coaches redirect to Steven for backward compatibility
export const COACH_VOICES = {
  STEVEN: "moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84",
  SUE_ANNE: "moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84", // Legacy: redirected to Steven
  ERIKA: "moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84",   // Legacy: redirected to Steven
  PRECIOSA: "moss_audio_a784f0fe-f448-11f0-9e6a-0a02ecbdcfa7",
} as const;

export interface LessonAudioContent {
  lessonId?: number;
  moduleSlug?: string;
  phrases: AudioPhrase[];
}

// Pre-generated audio files mapping
export const PRONUNCIATION_AUDIO: AudioPhrase[] = [
  // Level A - Basic Introduction (French_Male_Speech_New)
  {
    id: "intro_federal_employee",
    text: "Hello, I am a federal employee. I have been working for the Government of Canada for five years.",
    textFr: "Bonjour, je suis fonctionnaire fédéral. Je travaille au gouvernement du Canada depuis cinq ans.",
    audioUrl: "/audio/pronunciation/intro_federal_employee.mp3",
    level: "A",
    category: "introduction",
    duration: 8,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level A - Project Presentation (French_Female_News Anchor)
  {
    id: "project_presentation",
    text: "I would like to present our new project. It is an initiative aimed at improving services to citizens.",
    textFr: "Je voudrais vous présenter notre nouveau projet. Il s'agit d'une initiative visant à améliorer les services aux citoyens.",
    audioUrl: "/audio/pronunciation/project_presentation.mp3",
    level: "A",
    category: "presentation",
    duration: 10,
    voice: FRENCH_LESSON_VOICES.FEMALE_NEWS_ANCHOR,
  },
  
  // Level A - Asking for Details (French_FemaleAnchor)
  {
    id: "asking_details",
    text: "Could you give me more details on this matter? I would like to better understand the issues.",
    textFr: "Pourriez-vous me donner plus de détails sur cette question? Je souhaiterais mieux comprendre les enjeux.",
    audioUrl: "/audio/pronunciation/asking_details.mp3",
    level: "A",
    category: "meeting",
    duration: 7,
    voice: FRENCH_LESSON_VOICES.FEMALE_ANCHOR,
  },
  
  // Level B - Meeting Proposal (French_Male_Speech_New)
  {
    id: "meeting_proposal",
    text: "I propose that we organize a meeting next week to discuss this file in detail.",
    textFr: "Je propose que nous organisions une réunion la semaine prochaine pour discuter de ce dossier en détail.",
    audioUrl: "/audio/pronunciation/meeting_proposal.mp3",
    level: "B",
    category: "meeting",
    duration: 7,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level B - Collaboration Thanks (French_Female_Speech_New)
  {
    id: "collaboration_thanks",
    text: "Thank you for your collaboration. We have made significant progress on this project.",
    textFr: "Je tiens à vous remercier pour votre collaboration. Votre contribution a été essentielle à la réussite de ce projet.",
    audioUrl: "/audio/pronunciation/collaboration_thanks.mp3",
    level: "B",
    category: "general",
    duration: 6,
    voice: FRENCH_LESSON_VOICES.FEMALE_SPEECH,
  },
  
  // Level B - Budget Constraints (French_Female_News Anchor)
  {
    id: "budget_constraints",
    text: "Given the current budget constraints, we must prioritize initiatives that offer the best cost-effectiveness.",
    textFr: "Compte tenu des contraintes budgétaires actuelles, nous devons prioriser les initiatives qui offrent le meilleur rapport coût-efficacité.",
    audioUrl: "/audio/pronunciation/budget_constraints.mp3",
    level: "B",
    category: "meeting",
    duration: 8,
    voice: FRENCH_LESSON_VOICES.FEMALE_NEWS_ANCHOR,
  },
  
  // Level B - Recommendation Approach (French_Male_Speech_New)
  {
    id: "recommendation_approach",
    text: "I recommend a progressive approach that will allow us to evaluate the results at each stage before proceeding.",
    textFr: "Je recommande une approche progressive qui nous permettra d'évaluer les résultats à chaque étape avant de poursuivre.",
    audioUrl: "/audio/pronunciation/recommendation_approach.mp3",
    level: "B",
    category: "presentation",
    duration: 9,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level C - Strategic Implications (French_FemaleAnchor)
  {
    id: "strategic_implications",
    text: "It is essential to consider the strategic implications of this decision on our long-term objectives.",
    textFr: "Il est essentiel de considérer les implications stratégiques de cette décision sur nos objectifs à long terme.",
    audioUrl: "/audio/pronunciation/strategic_implications.mp3",
    level: "C",
    category: "negotiation",
    duration: 7,
    voice: FRENCH_LESSON_VOICES.FEMALE_ANCHOR,
  },
  
  // Level C - Policy Coordination (French_Female_Speech_New)
  {
    id: "policy_coordination",
    text: "Interministerial coordination is crucial to ensure the coherence of public policies.",
    textFr: "La coordination interministérielle est cruciale pour assurer la cohérence des politiques publiques.",
    audioUrl: "/audio/pronunciation/policy_coordination.mp3",
    level: "C",
    category: "technical",
    duration: 9,
    voice: FRENCH_LESSON_VOICES.FEMALE_SPEECH,
  },
  
  // PATH II - Level C Advanced Phrases
  
  // Level C - Study Results (French_Male_Speech_New)
  {
    id: "study_results",
    text: "The results of our study clearly demonstrate the effectiveness of this approach in the Canadian context.",
    textFr: "Les résultats de notre étude démontrent clairement l'efficacité de cette approche dans le contexte canadien.",
    audioUrl: "/audio/pronunciation/study_results.mp3",
    level: "C",
    category: "presentation",
    duration: 9,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level C - Postpone Decision (French_Female_News Anchor)
  {
    id: "postpone_decision",
    text: "I suggest postponing this decision until we have obtained all the necessary information.",
    textFr: "Je suggère de reporter cette décision jusqu'à ce que nous ayons obtenu toutes les informations nécessaires.",
    audioUrl: "/audio/pronunciation/postpone_decision.mp3",
    level: "C",
    category: "negotiation",
    duration: 10,
    voice: FRENCH_LESSON_VOICES.FEMALE_NEWS_ANCHOR,
  },
  
  // Level C - Alternative Solutions (French_FemaleAnchor)
  {
    id: "alternative_solutions",
    text: "Have you considered alternative solutions that could better meet the needs of all stakeholders?",
    textFr: "Avez-vous envisagé des solutions alternatives qui pourraient mieux répondre aux besoins de toutes les parties prenantes?",
    audioUrl: "/audio/pronunciation/alternative_solutions.mp3",
    level: "C",
    category: "negotiation",
    duration: 9,
    voice: FRENCH_LESSON_VOICES.FEMALE_ANCHOR,
  },
  
  // Level C - Performance Indicators (French_Male_Speech_New)
  {
    id: "performance_indicators",
    text: "We must establish clear performance indicators to measure the impact of our interventions.",
    textFr: "Nous devons établir des indicateurs de performance clairs pour mesurer l'impact de nos interventions.",
    audioUrl: "/audio/pronunciation/performance_indicators.mp3",
    level: "C",
    category: "technical",
    duration: 10,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level C - Regulatory Framework (French_Female_Speech_New)
  {
    id: "regulatory_framework",
    text: "The current regulatory framework imposes certain constraints that we must respect in our planning.",
    textFr: "Le cadre réglementaire actuel nous impose certaines contraintes que nous devons respecter dans notre planification.",
    audioUrl: "/audio/pronunciation/regulatory_framework.mp3",
    level: "C",
    category: "technical",
    duration: 9,
    voice: FRENCH_LESSON_VOICES.FEMALE_SPEECH,
  },
  
  // Level C - Transmit Information (French_Female_News Anchor)
  {
    id: "transmit_info",
    text: "I take the liberty of transmitting this information to you so that you can review it before our next meeting.",
    textFr: "Je me permets de vous transmettre ces informations afin que vous puissiez les examiner avant notre prochaine rencontre.",
    audioUrl: "/audio/pronunciation/transmit_info.mp3",
    level: "C",
    category: "general",
    duration: 8,
    voice: FRENCH_LESSON_VOICES.FEMALE_NEWS_ANCHOR,
  },
  
  // Level C - Continuous Improvement (French_FemaleAnchor)
  {
    id: "continuous_improvement",
    text: "Our commitment to continuous improvement allows us to maintain high quality standards.",
    textFr: "Notre engagement envers l'amélioration continue nous permet de maintenir des standards élevés de qualité.",
    audioUrl: "/audio/pronunciation/continuous_improvement.mp3",
    level: "C",
    category: "presentation",
    duration: 8,
    voice: FRENCH_LESSON_VOICES.FEMALE_ANCHOR,
  },
  
  // ============================================================================
  // SPRINT 22 - ADDITIONAL PHRASES (15 new phrases)
  // ============================================================================
  
  // Level A - Formal Greeting (French_Male_Speech_New)
  {
    id: "greeting_formal",
    text: "Hello, how are you? I am delighted to meet you.",
    textFr: "Bonjour, comment allez-vous? Je suis ravi de vous rencontrer.",
    audioUrl: "/audio/pronunciation/greeting_formal.mp3",
    level: "A",
    category: "introduction",
    duration: 5,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level A - Request Help (French_Female_News Anchor)
  {
    id: "request_help",
    text: "Excuse me, could you help me please?",
    textFr: "Excusez-moi, pourriez-vous m'aider s'il vous plaît?",
    audioUrl: "/audio/pronunciation/request_help.mp3",
    level: "A",
    category: "general",
    duration: 4,
    voice: FRENCH_LESSON_VOICES.FEMALE_NEWS_ANCHOR,
  },
  
  // Level A - HR Introduction (French_FemaleAnchor)
  {
    id: "hr_intro",
    text: "I have been working in the human resources department for three years.",
    textFr: "Je travaille dans le département des ressources humaines depuis trois ans.",
    audioUrl: "/audio/pronunciation/hr_intro.mp3",
    level: "A",
    category: "introduction",
    duration: 5,
    voice: FRENCH_LESSON_VOICES.FEMALE_ANCHOR,
  },
  
  // Level A - Meeting Schedule (French_Female_Speech_New)
  {
    id: "meeting_schedule",
    text: "The meeting is scheduled for tomorrow morning at nine o'clock.",
    textFr: "La réunion est prévue pour demain matin à neuf heures.",
    audioUrl: "/audio/pronunciation/meeting_schedule.mp3",
    level: "A",
    category: "meeting",
    duration: 4,
    voice: FRENCH_LESSON_VOICES.FEMALE_SPEECH,
  },
  
  // Level A - Phone Request (French_Male_Speech_New)
  {
    id: "phone_request",
    text: "Could you remind me of your phone number, please?",
    textFr: "Pouvez-vous me rappeler votre numéro de téléphone, s'il vous plaît?",
    audioUrl: "/audio/pronunciation/phone_request.mp3",
    level: "A",
    category: "general",
    duration: 4,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level B - Opinion Advantages (French_Female_News Anchor)
  {
    id: "opinion_advantages",
    text: "In my opinion, this approach presents several significant advantages for our organization.",
    textFr: "À mon avis, cette approche présente plusieurs avantages significatifs pour notre organisation.",
    audioUrl: "/audio/pronunciation/opinion_advantages.mp3",
    level: "B",
    category: "presentation",
    duration: 7,
    voice: FRENCH_LESSON_VOICES.FEMALE_NEWS_ANCHOR,
  },
  
  // Level B - Examine Options (French_FemaleAnchor)
  {
    id: "examine_options",
    text: "We must carefully examine the different options before making a final decision.",
    textFr: "Nous devons examiner attentivement les différentes options avant de prendre une décision finale.",
    audioUrl: "/audio/pronunciation/examine_options.mp3",
    level: "B",
    category: "meeting",
    duration: 7,
    voice: FRENCH_LESSON_VOICES.FEMALE_ANCHOR,
  },
  
  // Level B - Report Deadline (French_Male_Speech_New)
  {
    id: "report_deadline",
    text: "The report will be ready by the end of the week, as agreed at our last meeting.",
    textFr: "Le rapport sera prêt d'ici la fin de la semaine, comme convenu lors de notre dernière réunion.",
    audioUrl: "/audio/pronunciation/report_deadline.mp3",
    level: "B",
    category: "meeting",
    duration: 7,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level B - Agree Modifications (French_Female_Speech_New)
  {
    id: "agree_modifications",
    text: "I agree with your proposal, but I would like to suggest some minor modifications.",
    textFr: "Je suis d'accord avec votre proposition, mais j'aimerais suggérer quelques modifications mineures.",
    audioUrl: "/audio/pronunciation/agree_modifications.mp3",
    level: "B",
    category: "negotiation",
    duration: 7,
    voice: FRENCH_LESSON_VOICES.FEMALE_SPEECH,
  },
  
  // Level B - Clarify Expectations (French_Female_News Anchor)
  {
    id: "clarify_expectations",
    text: "Could you clarify this point? I want to make sure I understand your expectations.",
    textFr: "Pourriez-vous clarifier ce point? Je veux m'assurer de bien comprendre vos attentes.",
    audioUrl: "/audio/pronunciation/clarify_expectations.mp3",
    level: "B",
    category: "meeting",
    duration: 6,
    voice: FRENCH_LESSON_VOICES.FEMALE_NEWS_ANCHOR,
  },
  
  // Level C - Digital Transformation (French_Male_Speech_New)
  {
    id: "digital_transformation",
    text: "In the current context of digital transformation, it is imperative to adapt our organizational processes.",
    textFr: "Dans le contexte actuel de transformation numérique, il est impératif d'adapter nos processus organisationnels.",
    audioUrl: "/audio/pronunciation/digital_transformation.mp3",
    level: "C",
    category: "technical",
    duration: 9,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
  
  // Level C - Risk Analysis (French_FemaleAnchor)
  {
    id: "risk_analysis",
    text: "The risk analysis demonstrates that this initiative presents a favorable cost-benefit ratio.",
    textFr: "L'analyse des risques démontre que cette initiative présente un rapport coût-bénéfice favorable.",
    audioUrl: "/audio/pronunciation/risk_analysis.mp3",
    level: "C",
    category: "technical",
    duration: 8,
    voice: FRENCH_LESSON_VOICES.FEMALE_ANCHOR,
  },
  
  // Level C - Phased Approach (French_Female_Speech_New)
  {
    id: "phased_approach",
    text: "We propose a phased approach that will mitigate risks while maximizing positive outcomes.",
    textFr: "Nous proposons une approche par étapes qui permettra d'atténuer les risques tout en maximisant les retombées positives.",
    audioUrl: "/audio/pronunciation/phased_approach.mp3",
    level: "C",
    category: "presentation",
    duration: 9,
    voice: FRENCH_LESSON_VOICES.FEMALE_SPEECH,
  },
  
  // Level C - Stakeholder Consensus (French_Female_News Anchor)
  {
    id: "stakeholder_consensus",
    text: "Preliminary consultations with stakeholders have revealed a favorable consensus for this direction.",
    textFr: "Les consultations préliminaires avec les parties prenantes ont révélé un consensus favorable à cette orientation.",
    audioUrl: "/audio/pronunciation/stakeholder_consensus.mp3",
    level: "C",
    category: "negotiation",
    duration: 9,
    voice: FRENCH_LESSON_VOICES.FEMALE_NEWS_ANCHOR,
  },
  
  // Level C - Strategy Recommendation (French_Male_Speech_New)
  {
    id: "strategy_recommendation",
    text: "In conclusion, I strongly recommend the adoption of this strategy which aligns perfectly with our ministerial objectives.",
    textFr: "En conclusion, je recommande vivement l'adoption de cette stratégie qui s'aligne parfaitement avec nos objectifs ministériels.",
    audioUrl: "/audio/pronunciation/strategy_recommendation.mp3",
    level: "C",
    category: "presentation",
    duration: 10,
    voice: FRENCH_LESSON_VOICES.MALE_SPEECH,
  },
];

// Get audio phrases by level
export function getAudioByLevel(level: "A" | "B" | "C"): AudioPhrase[] {
  return PRONUNCIATION_AUDIO.filter((phrase) => phrase.level === level);
}

// Get audio phrases by category
export function getAudioByCategory(category: AudioPhrase["category"]): AudioPhrase[] {
  return PRONUNCIATION_AUDIO.filter((phrase) => phrase.category === category);
}

// Get audio phrase by ID
export function getAudioById(id: string): AudioPhrase | undefined {
  return PRONUNCIATION_AUDIO.find((phrase) => phrase.id === id);
}

// Get all audio for a specific SLE level practice
export function getSLEPracticeAudio(level: "A" | "B" | "C"): AudioPhrase[] {
  const levelMap: Record<string, ("A" | "B" | "C")[]> = {
    A: ["A"],
    B: ["A", "B"],
    C: ["A", "B", "C"],
  };
  
  const includedLevels = levelMap[level] || ["A"];
  return PRONUNCIATION_AUDIO.filter((phrase) => includedLevels.includes(phrase.level));
}

// Lesson to audio mapping
export const LESSON_AUDIO_MAP: Record<string, string[]> = {
  // Path I - Module 1 lessons (Level A)
  "path1_m1_l1": ["intro_federal_employee", "asking_details"],
  "path1_m1_l2": ["project_presentation", "collaboration_thanks"],
  "path1_m1_l3": ["meeting_proposal", "budget_constraints"],
  
  // Path I - Module 2 lessons (Level B)
  "path1_m2_l1": ["recommendation_approach"],
  "path1_m2_l2": ["strategic_implications"],
  "path1_m2_l3": ["policy_coordination"],
  
  // Path II - Module 1 lessons (Level C Advanced)
  "path2_m1_l1": ["study_results", "postpone_decision"],
  "path2_m1_l2": ["alternative_solutions", "performance_indicators"],
  "path2_m1_l3": ["regulatory_framework", "transmit_info"],
  
  // Path II - Module 2 lessons (Level C Expert)
  "path2_m2_l1": ["continuous_improvement", "strategic_implications"],
  "path2_m2_l2": ["policy_coordination", "performance_indicators"],
  
  // SLE Practice sessions - Updated with Sprint 22 phrases
  "sle_level_a": ["intro_federal_employee", "project_presentation", "asking_details", "greeting_formal", "request_help", "hr_intro", "meeting_schedule", "phone_request"],
  "sle_level_b": ["meeting_proposal", "collaboration_thanks", "budget_constraints", "recommendation_approach", "opinion_advantages", "examine_options", "report_deadline", "agree_modifications", "clarify_expectations"],
  "sle_level_c": ["strategic_implications", "policy_coordination", "study_results", "postpone_decision", "alternative_solutions", "performance_indicators", "regulatory_framework", "transmit_info", "continuous_improvement", "digital_transformation", "risk_analysis", "phased_approach", "stakeholder_consensus", "strategy_recommendation"],
};

// Get audio for a specific lesson
export function getLessonAudio(lessonKey: string): AudioPhrase[] {
  const audioIds = LESSON_AUDIO_MAP[lessonKey] || [];
  return audioIds
    .map((id) => getAudioById(id))
    .filter((phrase): phrase is AudioPhrase => phrase !== undefined);
}
