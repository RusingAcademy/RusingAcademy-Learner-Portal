/**
 * Stripe Products Configuration
 * 
 * This file defines the products and pricing structure for the ecosystem.
 * Products are created dynamically in Stripe when needed.
 * 
 * OFFICIAL PRICING FROM: https://www.rusing.academy/
 */

export const LINGUEEFY_PRODUCTS = {
  // Session types
  TRIAL_SESSION: {
    name: "Trial Session",
    description: "30-minute trial session with a Lingueefy coach",
    type: "session" as const,
    durationMinutes: 30,
  },
  SINGLE_SESSION: {
    name: "Single Session",
    description: "60-minute coaching session with a Lingueefy coach",
    type: "session" as const,
    durationMinutes: 60,
  },
  PACKAGE_5: {
    name: "5-Session Package",
    description: "Package of 5 coaching sessions (save 10%)",
    type: "package" as const,
    sessionCount: 5,
    discountPercent: 10,
  },
  PACKAGE_10: {
    name: "10-Session Package",
    description: "Package of 10 coaching sessions (save 15%)",
    type: "package" as const,
    sessionCount: 10,
    discountPercent: 15,
  },
} as const;

// Commission calculation helpers
export function calculatePlatformFee(
  grossAmountCents: number,
  commissionBps: number
): { platformFeeCents: number; coachNetCents: number } {
  // Commission is in basis points (100 bps = 1%)
  const platformFeeCents = Math.round((grossAmountCents * commissionBps) / 10000);
  const coachNetCents = grossAmountCents - platformFeeCents;
  
  return { platformFeeCents, coachNetCents };
}

// Format currency for display
export function formatCAD(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
}

// Calculate package price with discount
export function calculatePackagePrice(
  hourlyRateCents: number,
  sessionCount: number,
  discountPercent: number
): { totalCents: number; perSessionCents: number; savingsCents: number } {
  const fullPrice = hourlyRateCents * sessionCount;
  const discount = Math.round(fullPrice * (discountPercent / 100));
  const totalCents = fullPrice - discount;
  const perSessionCents = Math.round(totalCents / sessionCount);
  
  return {
    totalCents,
    perSessionCents,
    savingsCents: discount,
  };
}

// ============================================================================
// PATH SERIES™ COURSE PRODUCTS (RusingÂcademy)
// Official pricing from https://www.rusing.academy/
// ============================================================================

export interface CourseProduct {
  id: string;
  slug: string;
  name: string;
  nameFr: string;
  subtitle: string;
  subtitleFr: string;
  description: string;
  descriptionFr: string;
  priceInCents: number;
  originalPriceInCents: number;
  currency: string;
  cefrLevel: string;
  pfl2Equivalent: string;
  duration: string;
  structuredHours: number;
  autonomousPractice: string;
  features: string[];
  featuresFr: string[];
  learningOutcomes: string[];
  learningOutcomesFr: string[];
  metadata: {
    courseId: number;
    level: string;
    modules: number;
    lessons: number;
    durationHours: number;
  };
}

export const PATH_SERIES_COURSES: CourseProduct[] = [
  {
    id: "path-i-foundations",
    slug: "path-i-foundations",
    name: "Path I: FSL - Foundations",
    nameFr: "Path I: FLS - Fondations",
    subtitle: "Crash Course in Essential Communication Foundations",
    subtitleFr: "Cours intensif sur les bases essentielles de la communication",
    description: "Build the fundamental communication skills required for basic professional interactions. Learn to introduce yourself, ask simple questions, understand basic messages, and complete essential forms in a workplace context.",
    descriptionFr: "Développez les compétences de communication fondamentales requises pour les interactions professionnelles de base. Apprenez à vous présenter, poser des questions simples, comprendre des messages de base et remplir des formulaires essentiels dans un contexte de travail.",
    priceInCents: 89900, // $899 CAD
    originalPriceInCents: 99900,
    currency: "CAD",
    cefrLevel: "A1",
    pfl2Equivalent: "OF 1-6",
    duration: "4 Weeks",
    structuredHours: 30,
    autonomousPractice: "80-130 Hours",
    features: [
      "Lifetime access",
      "Certificate of completion",
      "Downloadable resources",
      "Practice quizzes",
      "30 hours structured learning",
      "80-130 hours autonomous practice"
    ],
    featuresFr: [
      "Accès à vie",
      "Certificat de réussite",
      "Ressources téléchargeables",
      "Quiz de pratique",
      "30 heures d'apprentissage structuré",
      "80-130 heures de pratique autonome"
    ],
    learningOutcomes: [
      "Present yourself and others professionally",
      "Ask and answer simple questions about familiar topics",
      "Understand and use everyday workplace expressions",
      "Describe your workspace and daily routine",
      "Complete administrative forms accurately",
      "Write simple professional messages"
    ],
    learningOutcomesFr: [
      "Vous présenter et présenter les autres professionnellement",
      "Poser et répondre à des questions simples sur des sujets familiers",
      "Comprendre et utiliser des expressions quotidiennes au travail",
      "Décrire votre espace de travail et votre routine quotidienne",
      "Remplir des formulaires administratifs avec précision",
      "Rédiger des messages professionnels simples"
    ],
    metadata: {
      courseId: 1,
      level: "A1",
      modules: 6,
      lessons: 24,
      durationHours: 30
    }
  },
  {
    id: "path-ii-everyday-fluency",
    slug: "path-ii-everyday-fluency",
    name: "Path II: FSL - Everyday Fluency",
    nameFr: "Path II: FLS - Aisance Quotidienne",
    subtitle: "Crash Course in Everyday Workplace Interactions",
    subtitleFr: "Cours intensif sur les interactions quotidiennes au travail",
    description: "Develop confidence in daily professional interactions. Learn to discuss past events, future plans, and personal opinions. Engage in routine workplace conversations with increasing spontaneity and accuracy.",
    descriptionFr: "Développez votre confiance dans les interactions professionnelles quotidiennes. Apprenez à discuter d'événements passés, de projets futurs et d'opinions personnelles. Participez à des conversations de routine au travail avec une spontanéité et une précision croissantes.",
    priceInCents: 89900, // $899 CAD
    originalPriceInCents: 99900,
    currency: "CAD",
    cefrLevel: "A2",
    pfl2Equivalent: "OF 7-12",
    duration: "4 Weeks",
    structuredHours: 30,
    autonomousPractice: "80-130 Hours",
    features: [
      "Lifetime access",
      "Certificate of completion",
      "Downloadable resources",
      "Practice quizzes",
      "30 hours structured learning",
      "80-130 hours autonomous practice"
    ],
    featuresFr: [
      "Accès à vie",
      "Certificat de réussite",
      "Ressources téléchargeables",
      "Quiz de pratique",
      "30 heures d'apprentissage structuré",
      "80-130 heures de pratique autonome"
    ],
    learningOutcomes: [
      "Narrate past events using appropriate tenses",
      "Discuss future projects and plans confidently",
      "Express simple opinions and preferences",
      "Understand short texts on familiar topics",
      "Write basic professional emails and messages",
      "Participate in routine workplace exchanges"
    ],
    learningOutcomesFr: [
      "Raconter des événements passés en utilisant les temps appropriés",
      "Discuter de projets et de plans futurs avec confiance",
      "Exprimer des opinions et des préférences simples",
      "Comprendre des textes courts sur des sujets familiers",
      "Rédiger des courriels et messages professionnels de base",
      "Participer aux échanges de routine au travail"
    ],
    metadata: {
      courseId: 2,
      level: "A2",
      modules: 6,
      lessons: 24,
      durationHours: 30
    }
  },
  {
    id: "path-iii-operational-french",
    slug: "path-iii-operational-french",
    name: "Path III: FSL - Operational French",
    nameFr: "Path III: FLS - Français Opérationnel",
    subtitle: "Crash Course in Professional Communication for Public Servants",
    subtitleFr: "Cours intensif en communication professionnelle pour les fonctionnaires",
    description: "Achieve functional professional autonomy. Develop the ability to present arguments, participate in debates, write structured reports, and handle most workplace communication situations independently and effectively.",
    descriptionFr: "Atteignez une autonomie professionnelle fonctionnelle. Développez la capacité de présenter des arguments, participer à des débats, rédiger des rapports structurés et gérer la plupart des situations de communication au travail de manière indépendante et efficace.",
    priceInCents: 99900, // $999 CAD
    originalPriceInCents: 119900,
    currency: "CAD",
    cefrLevel: "B1",
    pfl2Equivalent: "OF 13-22",
    duration: "4 Weeks",
    structuredHours: 30,
    autonomousPractice: "80-130 Hours",
    features: [
      "Lifetime access",
      "Certificate of completion",
      "Downloadable resources",
      "Practice quizzes",
      "30 hours structured learning",
      "80-130 hours autonomous practice"
    ],
    featuresFr: [
      "Accès à vie",
      "Certificat de réussite",
      "Ressources téléchargeables",
      "Quiz de pratique",
      "30 heures d'apprentissage structuré",
      "80-130 heures de pratique autonome"
    ],
    learningOutcomes: [
      "Present and defend viewpoints with structured arguments",
      "Narrate complex events using multiple tenses",
      "Understand main points of presentations and speeches",
      "Write structured reports and meeting minutes",
      "Participate in conversations with spontaneity",
      "Handle unpredictable workplace situations"
    ],
    learningOutcomesFr: [
      "Présenter et défendre des points de vue avec des arguments structurés",
      "Raconter des événements complexes en utilisant plusieurs temps",
      "Comprendre les points principaux des présentations et discours",
      "Rédiger des rapports structurés et des comptes rendus de réunion",
      "Participer à des conversations avec spontanéité",
      "Gérer des situations imprévues au travail"
    ],
    metadata: {
      courseId: 3,
      level: "B1",
      modules: 8,
      lessons: 32,
      durationHours: 30
    }
  },
  {
    id: "path-iv-strategic-expression",
    slug: "path-iv-strategic-expression",
    name: "Path IV: FSL - Strategic Expression",
    nameFr: "Path IV: FLS - Expression Stratégique",
    subtitle: "Crash Course in Strategic Workplace Communication",
    subtitleFr: "Cours intensif en communication stratégique au travail",
    description: "Master precision, nuance, and leadership communication. Develop advanced grammatical structures (subjunctive, conditional), persuasive argumentation skills, and the ability to communicate effectively in complex professional contexts.",
    descriptionFr: "Maîtrisez la précision, la nuance et la communication de leadership. Développez des structures grammaticales avancées (subjonctif, conditionnel), des compétences en argumentation persuasive et la capacité de communiquer efficacement dans des contextes professionnels complexes.",
    priceInCents: 109900, // $1,099 CAD
    originalPriceInCents: 129900,
    currency: "CAD",
    cefrLevel: "B2",
    pfl2Equivalent: "OF 23-32",
    duration: "4 Weeks",
    structuredHours: 30,
    autonomousPractice: "80-130 Hours",
    features: [
      "Lifetime access",
      "Certificate of completion",
      "Downloadable resources",
      "Practice quizzes",
      "30 hours structured learning",
      "80-130 hours autonomous practice"
    ],
    featuresFr: [
      "Accès à vie",
      "Certificat de réussite",
      "Ressources téléchargeables",
      "Quiz de pratique",
      "30 heures d'apprentissage structuré",
      "80-130 heures de pratique autonome"
    ],
    learningOutcomes: [
      "Express hypotheses, conditions, and nuanced opinions",
      "Analyze complex texts and extract key information",
      "Develop persuasive, well-structured arguments",
      "Communicate with fluency and spontaneity",
      "Write detailed, coherent professional documents",
      "Engage confidently in debates and negotiations"
    ],
    learningOutcomesFr: [
      "Exprimer des hypothèses, des conditions et des opinions nuancées",
      "Analyser des textes complexes et extraire les informations clés",
      "Développer des arguments persuasifs et bien structurés",
      "Communiquer avec aisance et spontanéité",
      "Rédiger des documents professionnels détaillés et cohérents",
      "Participer avec confiance aux débats et négociations"
    ],
    metadata: {
      courseId: 4,
      level: "B2",
      modules: 8,
      lessons: 32,
      durationHours: 30
    }
  },
  {
    id: "path-v-professional-mastery",
    slug: "path-v-professional-mastery",
    name: "Path V: FSL - Professional Mastery",
    nameFr: "Path V: FLS - Maîtrise Professionnelle",
    subtitle: "Crash Course in Advanced Professional Excellence",
    subtitleFr: "Cours intensif en excellence professionnelle avancée",
    description: "Achieve expert-level communication with idiomatic mastery and cultural sophistication. Develop the advanced competencies required for executive roles: facilitating meetings, negotiating complex issues, and producing high-quality professional documents.",
    descriptionFr: "Atteignez une communication de niveau expert avec une maîtrise idiomatique et une sophistication culturelle. Développez les compétences avancées requises pour les rôles exécutifs : animer des réunions, négocier des questions complexes et produire des documents professionnels de haute qualité.",
    priceInCents: 119900, // $1,199 CAD
    originalPriceInCents: 149900,
    currency: "CAD",
    cefrLevel: "C1",
    pfl2Equivalent: "OF 33-40",
    duration: "4 Weeks",
    structuredHours: 30,
    autonomousPractice: "80-130 Hours",
    features: [
      "Lifetime access",
      "Certificate of completion",
      "Downloadable resources",
      "Practice quizzes",
      "30 hours structured learning",
      "80-130 hours autonomous practice"
    ],
    featuresFr: [
      "Accès à vie",
      "Certificat de réussite",
      "Ressources téléchargeables",
      "Quiz de pratique",
      "30 heures d'apprentissage structuré",
      "80-130 heures de pratique autonome"
    ],
    learningOutcomes: [
      "Use idiomatic expressions and cultural references naturally",
      "Express yourself precisely on complex topics",
      "Facilitate meetings and lead negotiations with authority",
      "Produce sophisticated, well-structured documents",
      "Understand implicit meanings and subtle nuances",
      "Communicate at executive and leadership levels"
    ],
    learningOutcomesFr: [
      "Utiliser des expressions idiomatiques et des références culturelles naturellement",
      "S'exprimer avec précision sur des sujets complexes",
      "Animer des réunions et mener des négociations avec autorité",
      "Produire des documents sophistiqués et bien structurés",
      "Comprendre les significations implicites et les nuances subtiles",
      "Communiquer au niveau exécutif et de leadership"
    ],
    metadata: {
      courseId: 5,
      level: "C1",
      modules: 10,
      lessons: 40,
      durationHours: 30
    }
  },
  {
    id: "path-vi-sle-accelerator",
    slug: "path-vi-sle-accelerator",
    name: "Path VI: FSL - SLE Accelerator",
    nameFr: "Path VI: FLS - Accélérateur ELS",
    subtitle: "Crash Course in SLE Success Strategies",
    subtitleFr: "Cours intensif sur les stratégies de réussite à l'ELS",
    description: "Intensive preparation specifically designed for Second Language Evaluation (SLE) success. Master exam strategies, complete five full practice exams with detailed feedback, and develop the confidence and techniques needed for maximum performance.",
    descriptionFr: "Préparation intensive spécialement conçue pour réussir l'Évaluation de langue seconde (ELS). Maîtrisez les stratégies d'examen, complétez cinq examens pratiques complets avec rétroaction détaillée et développez la confiance et les techniques nécessaires pour une performance maximale.",
    priceInCents: 129900, // $1,299 CAD
    originalPriceInCents: 159900,
    currency: "CAD",
    cefrLevel: "Exam Prep",
    pfl2Equivalent: "SLE Ready",
    duration: "4 Weeks",
    structuredHours: 30,
    autonomousPractice: "5 Complete Practice Exams",
    features: [
      "Lifetime access",
      "Certificate of completion",
      "5 full practice exams",
      "5-hour Quick Prep coaching sessions",
      "Detailed feedback on all attempts",
      "Stress management techniques"
    ],
    featuresFr: [
      "Accès à vie",
      "Certificat de réussite",
      "5 examens pratiques complets",
      "5 heures de séances de coaching Quick Prep",
      "Rétroaction détaillée sur toutes les tentatives",
      "Techniques de gestion du stress"
    ],
    learningOutcomes: [
      "Master SLE exam structure and evaluation criteria",
      "Apply proven test-taking strategies for each component",
      "Complete 5 full practice exams under timed conditions",
      "Receive detailed feedback on all practice attempts",
      "Develop stress management and performance techniques",
      "Target and remediate specific weaknesses"
    ],
    learningOutcomesFr: [
      "Maîtriser la structure de l'examen ELS et les critères d'évaluation",
      "Appliquer des stratégies de test éprouvées pour chaque composante",
      "Compléter 5 examens pratiques complets en conditions chronométrées",
      "Recevoir une rétroaction détaillée sur toutes les tentatives",
      "Développer des techniques de gestion du stress et de performance",
      "Cibler et remédier aux faiblesses spécifiques"
    ],
    metadata: {
      courseId: 6,
      level: "SLE Prep",
      modules: 10,
      lessons: 40,
      durationHours: 30
    }
  }
];

// ============================================================================
// COACHING PLANS (Lingueefy "Plans Maison")
// ============================================================================

export interface CoachingPlan {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  priceInCents: number;
  currency: string;
  sessions: number;
  validityDays: number;
  features: string[];
  featuresFr: string[];
}

export const COACHING_PLANS: CoachingPlan[] = [
  {
    id: "starter-plan",
    name: "Starter Plan",
    nameFr: "Plan Démarrage",
    description: "Ideal for those beginning their SLE journey or needing a confidence boost before their exam. 10 focused hours to build your foundation.",
    descriptionFr: "Idéal pour ceux qui commencent leur parcours ELS ou qui ont besoin d'un coup de pouce avant leur examen. 10 heures ciblées pour bâtir vos bases.",
    priceInCents: 59700, // $597 CAD
    currency: "CAD",
    sessions: 10,
    validityDays: 90,
    features: [
      "10 hours of coaching",
      "1 certified coach",
      "Personalized learning plan",
      "AI practice access (30 days)",
      "Progress assessments",
      "Email support"
    ],
    featuresFr: [
      "10 heures de coaching",
      "1 coach certifié",
      "Plan d'apprentissage personnalisé",
      "Accès pratique IA (30 jours)",
      "Évaluations de progrès",
      "Support par courriel"
    ]
  },
  {
    id: "accelerator-plan",
    name: "Accelerator Plan",
    nameFr: "Plan Accélérateur",
    description: "Our most popular choice for serious learners targeting a specific level. 20 intensive hours with dedicated support to fast-track your success.",
    descriptionFr: "Notre choix le plus populaire pour les apprenants sérieux visant un niveau spécifique. 20 heures intensives avec un support dédié pour accélérer votre réussite.",
    priceInCents: 109700, // $1,097 CAD
    currency: "CAD",
    sessions: 20,
    validityDays: 120,
    features: [
      "20 hours of coaching",
      "Dedicated coach assignment",
      "AI practice access (90 days)",
      "Weekly progress reports",
      "Mock SLE exams",
      "Priority scheduling"
    ],
    featuresFr: [
      "20 heures de coaching",
      "Coach dédié assigné",
      "Accès pratique IA (90 jours)",
      "Rapports de progrès hebdomadaires",
      "Examens ELS simulés",
      "Planification prioritaire"
    ]
  },
  {
    id: "immersion-plan",
    name: "Immersion Plan",
    nameFr: "Plan Immersion",
    description: "The ultimate preparation for guaranteed results. 40 comprehensive hours with two specialized coaches, unlimited AI practice, and VIP support.",
    descriptionFr: "La préparation ultime pour des résultats garantis. 40 heures complètes avec deux coachs spécialisés, pratique IA illimitée et support VIP.",
    priceInCents: 199700, // $1,997 CAD
    currency: "CAD",
    sessions: 40,
    validityDays: 180,
    features: [
      "40 hours of coaching",
      "VIP coach selection",
      "Unlimited AI practice",
      "Daily progress tracking",
      "Unlimited mock exams",
      "1-on-1 exam strategy sessions",
      "Success guarantee"
    ],
    featuresFr: [
      "40 heures de coaching",
      "Sélection de coach VIP",
      "Pratique IA illimitée",
      "Suivi quotidien des progrès",
      "Examens simulés illimités",
      "Sessions de stratégie d'examen 1-à-1",
      "Garantie de succès"
    ]
  }
];

// Helper functions
export function getCourseBySlug(slug: string): CourseProduct | undefined {
  return PATH_SERIES_COURSES.find(p => p.slug === slug);
}

export function getCourseById(id: string): CourseProduct | undefined {
  return PATH_SERIES_COURSES.find(p => p.id === id);
}

export function getCoachingPlanById(id: string): CoachingPlan | undefined {
  return COACHING_PLANS.find(p => p.id === id);
}
