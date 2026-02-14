/**
 * The Path Series - All 6 Paths Complete Data
 * GC Bilingual Mastery Series™
 * 
 * This file contains the complete structure for all 6 learning paths
 * targeting Canadian Public Servants for SLE preparation.
 * 
 * @brand Lingueefy
 * @copyright Rusinga International Consulting Ltd.
 */

import { PathData, Module, Lesson, Activity } from './courseTypes';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const createActivity = (
  id: string,
  type: Activity['type'],
  title: string,
  titleFr: string,
  duration: number,
  xpReward: number,
  mediaPlaceholder: boolean = true
): Activity => ({
  id,
  type,
  title,
  titleFr,
  duration,
  xpReward,
  completed: false,
  locked: true,
  mediaPlaceholder
});

// ============================================================================
// PATH I: FOUNDATIONS (A1)
// ============================================================================

export const PathI_Data: PathData = {
  id: 'path-i-foundations',
  pathNumber: 1,
  title: 'Path I: Foundations',
  titleFr: 'Parcours I : Fondations',
  subtitle: 'From Zero to Professional Confidence',
  subtitleFr: 'De zéro à la confiance professionnelle',
  level: {
    cecr: 'A1',
    sle: 'A',
    sleDescription: 'Level A - Basic Proficiency',
    sleDescriptionFr: 'Niveau A - Compétence de base'
  },
  duration: {
    weeks: 8,
    structuredHours: 40,
    autonomousHoursMin: 20,
    autonomousHoursMax: 30
  },
  transformationPromise: {
    en: 'At the end of this Path, you will go from "I do not speak French" to "I can handle basic professional interactions with confidence."',
    fr: 'À la fin de ce Parcours, vous passerez de « je ne parle pas français » à « je peux gérer des interactions professionnelles de base avec confiance ».'
  },
  targetAudience: 'Complete beginners or those with minimal French exposure',
  targetAudienceFr: 'Débutants complets ou ceux avec une exposition minimale au français',
  learningOutcomes: [
    'Introduce yourself professionally',
    'Handle basic phone calls and emails',
    'Navigate workplace conversations',
    'Understand and respond to simple instructions'
  ],
  learningOutcomesFr: [
    'Se présenter professionnellement',
    'Gérer les appels téléphoniques et courriels de base',
    'Naviguer les conversations au travail',
    'Comprendre et répondre aux instructions simples'
  ],
  modules: [],
  finalProject: {
    id: 'path1-final',
    title: 'Professional Introduction Video',
    titleFr: 'Vidéo de présentation professionnelle',
    description: 'Record a 3-minute video introducing yourself and your role',
    descriptionFr: 'Enregistrer une vidéo de 3 minutes vous présentant et décrivant votre rôle',
    duration: 60,
    xpReward: 200
  },
  certificate: {
    id: 'cert-path-1',
    name: 'Path I Certificate - Foundations',
    nameFr: 'Certificat Parcours I - Fondations',
    passingThreshold: 70
  }
};

// ============================================================================
// PATH II: BUILDING CONFIDENCE (A2)
// ============================================================================

export const PathII_Data: PathData = {
  id: 'path-ii-building-confidence',
  pathNumber: 2,
  title: 'Path II: Building Confidence',
  titleFr: 'Parcours II : Bâtir la Confiance',
  subtitle: 'From Simple Communication to Active Participation',
  subtitleFr: 'De la communication simple à la participation active',
  level: {
    cecr: 'A2',
    sle: 'A',
    sleDescription: 'Level A - Basic Proficiency',
    sleDescriptionFr: 'Niveau A - Compétence de base'
  },
  duration: {
    weeks: 8,
    structuredHours: 40,
    autonomousHoursMin: 25,
    autonomousHoursMax: 35
  },
  transformationPromise: {
    en: 'At the end of this Path, you will go from "I can communicate in simple situations" to "I can actively participate in meetings and write basic professional documents."',
    fr: 'À la fin de ce Parcours, vous passerez de « je peux communiquer dans des situations simples » à « je peux participer activement aux réunions et rédiger des documents professionnels de base ».'
  },
  targetAudience: 'Public servants who have completed Path I or have A1 level French',
  targetAudienceFr: 'Fonctionnaires ayant complété le Parcours I ou ayant un niveau A1 en français',
  learningOutcomes: [
    'Participate actively in professional meetings',
    'Write professional documents (memos, reports)',
    'Handle professional disagreements',
    'Present projects and respond to questions'
  ],
  learningOutcomesFr: [
    'Participer activement aux réunions professionnelles',
    'Rédiger des documents professionnels',
    'Gérer les désaccords professionnels',
    'Présenter des projets et répondre aux questions'
  ],
  prerequisites: ['path-i-foundations'],
  modules: [],
  finalProject: {
    id: 'path2-final',
    title: 'Meeting Facilitation Simulation',
    titleFr: 'Simulation d\'animation de réunion',
    description: 'Facilitate a 15-minute team meeting on a work topic',
    descriptionFr: 'Animer une réunion d\'équipe de 15 minutes sur un sujet de travail',
    duration: 90,
    xpReward: 200
  },
  certificate: {
    id: 'cert-path-2',
    name: 'Path II Certificate - Building Confidence',
    nameFr: 'Certificat Parcours II - Bâtir la Confiance',
    passingThreshold: 70
  }
};

// ============================================================================
// PATH III: PROFESSIONAL FLUENCY (B1)
// ============================================================================

export const PathIII_Data: PathData = {
  id: 'path-iii-professional-fluency',
  pathNumber: 3,
  title: 'Path III: Professional Fluency',
  titleFr: 'Parcours III : Aisance Professionnelle',
  subtitle: 'From Active Participation to Autonomous Proficiency',
  subtitleFr: 'De la participation active à la compétence autonome',
  level: {
    cecr: 'B1',
    sle: 'B',
    sleDescription: 'Level B - Intermediate Proficiency',
    sleDescriptionFr: 'Niveau B - Compétence intermédiaire'
  },
  duration: {
    weeks: 10,
    structuredHours: 50,
    autonomousHoursMin: 30,
    autonomousHoursMax: 45
  },
  transformationPromise: {
    en: 'At the end of this Path, you will go from "I can participate in meetings" to "I can lead discussions, draft complex documents, and handle any professional situation autonomously."',
    fr: 'À la fin de ce Parcours, vous passerez de « je peux participer aux réunions » à « je peux diriger des discussions, rédiger des documents complexes et gérer toute situation professionnelle de façon autonome ».'
  },
  targetAudience: 'Public servants aiming for SLE Level B certification',
  targetAudienceFr: 'Fonctionnaires visant la certification ELS niveau B',
  learningOutcomes: [
    'Lead professional discussions and meetings',
    'Draft complex professional documents',
    'Handle negotiations and conflict resolution',
    'Present complex ideas clearly'
  ],
  learningOutcomesFr: [
    'Diriger des discussions et réunions professionnelles',
    'Rédiger des documents professionnels complexes',
    'Gérer les négociations et la résolution de conflits',
    'Présenter des idées complexes clairement'
  ],
  prerequisites: ['path-ii-building-confidence'],
  modules: [],
  finalProject: {
    id: 'path3-final',
    title: 'Policy Brief Presentation',
    titleFr: 'Présentation d\'une note de politique',
    description: 'Write and present a policy brief on a current government issue',
    descriptionFr: 'Rédiger et présenter une note de politique sur un enjeu gouvernemental actuel',
    duration: 120,
    xpReward: 250
  },
  certificate: {
    id: 'cert-path-3',
    name: 'Path III Certificate - Professional Fluency',
    nameFr: 'Certificat Parcours III - Aisance Professionnelle',
    passingThreshold: 75
  }
};

// ============================================================================
// PATH IV: ADVANCED PROFESSIONAL (B2)
// ============================================================================

export const PathIV_Data: PathData = {
  id: 'path-iv-advanced-professional',
  pathNumber: 4,
  title: 'Path IV: Advanced Professional',
  titleFr: 'Parcours IV : Professionnel Avancé',
  subtitle: 'From Autonomy to Expertise',
  subtitleFr: 'De l\'autonomie à l\'expertise',
  level: {
    cecr: 'B2',
    sle: 'B',
    sleDescription: 'Level B - Intermediate Proficiency (High)',
    sleDescriptionFr: 'Niveau B - Compétence intermédiaire (élevée)'
  },
  duration: {
    weeks: 10,
    structuredHours: 50,
    autonomousHoursMin: 35,
    autonomousHoursMax: 50
  },
  transformationPromise: {
    en: 'At the end of this Path, you will go from "I can handle professional situations" to "I can navigate complex, nuanced professional contexts with expertise and finesse."',
    fr: 'À la fin de ce Parcours, vous passerez de « je peux gérer des situations professionnelles » à « je peux naviguer des contextes professionnels complexes et nuancés avec expertise et finesse ».'
  },
  targetAudience: 'Public servants preparing for senior roles requiring strong bilingual skills',
  targetAudienceFr: 'Fonctionnaires se préparant à des rôles supérieurs nécessitant de fortes compétences bilingues',
  learningOutcomes: [
    'Navigate complex professional contexts',
    'Draft executive-level documents',
    'Handle sensitive communications',
    'Mentor others in French'
  ],
  learningOutcomesFr: [
    'Naviguer des contextes professionnels complexes',
    'Rédiger des documents de niveau exécutif',
    'Gérer des communications sensibles',
    'Encadrer d\'autres personnes en français'
  ],
  prerequisites: ['path-iii-professional-fluency'],
  modules: [],
  finalProject: {
    id: 'path4-final',
    title: 'Executive Briefing',
    titleFr: 'Briefing exécutif',
    description: 'Prepare and deliver an executive briefing to senior leadership',
    descriptionFr: 'Préparer et livrer un briefing exécutif à la haute direction',
    duration: 120,
    xpReward: 300
  },
  certificate: {
    id: 'cert-path-4',
    name: 'Path IV Certificate - Advanced Professional',
    nameFr: 'Certificat Parcours IV - Professionnel Avancé',
    passingThreshold: 75
  }
};

// ============================================================================
// PATH V: EXECUTIVE COMMUNICATION (C1)
// ============================================================================

export const PathV_Data: PathData = {
  id: 'path-v-executive-communication',
  pathNumber: 5,
  title: 'Path V: Executive Communication',
  titleFr: 'Parcours V : Communication Exécutive',
  subtitle: 'From Expertise to Leadership',
  subtitleFr: 'De l\'expertise au leadership',
  level: {
    cecr: 'C1',
    sle: 'C',
    sleDescription: 'Level C - Advanced Proficiency',
    sleDescriptionFr: 'Niveau C - Compétence avancée'
  },
  duration: {
    weeks: 12,
    structuredHours: 60,
    autonomousHoursMin: 40,
    autonomousHoursMax: 60
  },
  transformationPromise: {
    en: 'At the end of this Path, you will go from "I can handle complex situations" to "I can lead, inspire, and communicate at the highest executive level in French."',
    fr: 'À la fin de ce Parcours, vous passerez de « je peux gérer des situations complexes » à « je peux diriger, inspirer et communiquer au plus haut niveau exécutif en français ».'
  },
  targetAudience: 'Senior public servants and executives aiming for SLE Level C',
  targetAudienceFr: 'Hauts fonctionnaires et cadres visant le niveau C de l\'ELS',
  learningOutcomes: [
    'Lead at the executive level in French',
    'Deliver compelling speeches and presentations',
    'Handle media and public communications',
    'Navigate political and sensitive contexts'
  ],
  learningOutcomesFr: [
    'Diriger au niveau exécutif en français',
    'Livrer des discours et présentations convaincants',
    'Gérer les médias et communications publiques',
    'Naviguer les contextes politiques et sensibles'
  ],
  prerequisites: ['path-iv-advanced-professional'],
  modules: [],
  finalProject: {
    id: 'path5-final',
    title: 'Public Address',
    titleFr: 'Allocution publique',
    description: 'Write and deliver a 10-minute public address on a policy issue',
    descriptionFr: 'Rédiger et livrer une allocution publique de 10 minutes sur un enjeu de politique',
    duration: 180,
    xpReward: 350
  },
  certificate: {
    id: 'cert-path-5',
    name: 'Path V Certificate - Executive Communication',
    nameFr: 'Certificat Parcours V - Communication Exécutive',
    passingThreshold: 80
  }
};

// ============================================================================
// PATH VI: SLE MASTERY (C1+)
// ============================================================================

export const PathVI_Data: PathData = {
  id: 'path-vi-sle-mastery',
  pathNumber: 6,
  title: 'Path VI: SLE Mastery',
  titleFr: 'Parcours VI : Maîtrise ELS',
  subtitle: 'SLE Exam Excellence',
  subtitleFr: 'Excellence aux examens ELS',
  level: {
    cecr: 'C1+',
    sle: 'C',
    sleDescription: 'Level C - Advanced Proficiency (Exam Ready)',
    sleDescriptionFr: 'Niveau C - Compétence avancée (Prêt pour l\'examen)'
  },
  duration: {
    weeks: 6,
    structuredHours: 30,
    autonomousHoursMin: 20,
    autonomousHoursMax: 30
  },
  transformationPromise: {
    en: 'At the end of this Path, you will be fully prepared to pass the SLE with confidence and achieve your target level.',
    fr: 'À la fin de ce Parcours, vous serez pleinement préparé pour réussir l\'ELS avec confiance et atteindre votre niveau cible.'
  },
  targetAudience: 'Public servants preparing specifically for SLE examinations',
  targetAudienceFr: 'Fonctionnaires se préparant spécifiquement aux examens ELS',
  learningOutcomes: [
    'Master SLE oral exam strategies',
    'Excel in SLE written comprehension',
    'Perfect SLE written expression',
    'Manage exam stress and time'
  ],
  learningOutcomesFr: [
    'Maîtriser les stratégies de l\'examen oral ELS',
    'Exceller en compréhension écrite ELS',
    'Perfectionner l\'expression écrite ELS',
    'Gérer le stress et le temps d\'examen'
  ],
  prerequisites: ['path-v-executive-communication'],
  modules: [],
  finalProject: {
    id: 'path6-final',
    title: 'Full SLE Mock Exam',
    titleFr: 'Examen blanc ELS complet',
    description: 'Complete a full simulation of all three SLE components',
    descriptionFr: 'Compléter une simulation complète des trois composantes de l\'ELS',
    duration: 180,
    xpReward: 400
  },
  certificate: {
    id: 'cert-path-6',
    name: 'Path VI Certificate - SLE Mastery',
    nameFr: 'Certificat Parcours VI - Maîtrise ELS',
    passingThreshold: 85
  }
};

// ============================================================================
// EXPORT ALL PATHS
// ============================================================================

export const AllPaths: PathData[] = [
  PathI_Data,
  PathII_Data,
  PathIII_Data,
  PathIV_Data,
  PathV_Data,
  PathVI_Data
];

export const getPathById = (id: string): PathData | undefined => 
  AllPaths.find(path => path.id === id);

export const getPathByNumber = (num: number): PathData | undefined => 
  AllPaths.find(path => path.pathNumber === num);
