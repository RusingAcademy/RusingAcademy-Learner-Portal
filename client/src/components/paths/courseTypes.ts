/**
 * The Path Series - Shared Type Definitions
 * GC Bilingual Mastery Series™
 * 
 * @brand Lingueefy
 * @copyright Rusinga International Consulting Ltd.
 */

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export type ActivityType = 
  | 'video' 
  | 'audio' 
  | 'exercise' 
  | 'quiz' 
  | 'discussion' 
  | 'roleplay'
  | 'reading'
  | 'writing'
  | 'simulation';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  titleFr: string;
  description?: string;
  descriptionFr?: string;
  duration: number; // minutes
  xpReward: number;
  completed: boolean;
  locked: boolean;
  mediaPlaceholder: boolean;
  mediaUrl?: string;
  thumbnailUrl?: string;
  instructions?: string;
  instructionsFr?: string;
}

// ============================================================================
// LESSON TYPES
// ============================================================================

export interface TransformationPromise {
  from: string;
  fromFr: string;
  to: string;
  toFr: string;
}

export interface LessonContent {
  keySkills: string[];
  keySkillsFr: string[];
  grammar: string[];
  grammarFr: string[];
  vocabulary: string[];
  vocabularyFr: string[];
}

export interface Lesson {
  id: string;
  number: string;
  title: string;
  titleFr: string;
  transformation: TransformationPromise;
  content: LessonContent;
  activities: Activity[];
  xpTotal: number;
  completed: boolean;
  locked: boolean;
  estimatedDuration: number; // minutes
  duration?: number; // alias for estimatedDuration
  xpReward?: number; // alias for xpTotal
}

// ============================================================================
// MODULE TYPES
// ============================================================================

export interface ModuleQuiz {
  id: string;
  questions: number;
  passingScore: number;
  xpReward: number;
  timeLimit?: number; // minutes
  attempts?: number;
}

export interface ModuleBadge {
  id: string;
  name: string;
  nameFr: string;
  icon: string;
  description: string;
  descriptionFr: string;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  titleFr: string;
  objective: string;
  objectiveFr: string;
  description?: string;
  descriptionFr?: string;
  lessons: Lesson[];
  quiz: ModuleQuiz;
  badge: ModuleBadge;
  completed: boolean;
  locked: boolean;
  estimatedDuration: number; // hours
  duration?: number; // alias for estimatedDuration
  weekRange?: string; // e.g., "Week 1-2"
  xpReward?: number; // total XP for module
}

// ============================================================================
// PATH TYPES
// ============================================================================

export type CECRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C1+';
export type SLELevel = 'A' | 'B' | 'C';

export interface PathLevel {
  cecr: CECRLevel;
  sle: SLELevel;
  sleDescription: string;
  sleDescriptionFr: string;
}

export interface PathDuration {
  weeks: number;
  structuredHours: number;
  autonomousHoursMin: number;
  autonomousHoursMax: number;
}

export interface PathTransformation {
  en: string;
  fr: string;
}

export interface FinalProject {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  duration: number; // minutes
  xpReward: number;
  rubric?: string[];
}

export interface PathCertificate {
  id: string;
  name: string;
  nameFr: string;
  passingThreshold: number;
  badgeUrl?: string;
}

export interface PathData {
  id: string;
  pathNumber: number;
  title: string;
  titleFr: string;
  subtitle: string;
  subtitleFr: string;
  level: PathLevel;
  duration: PathDuration;
  transformationPromise: PathTransformation;
  modules: Module[];
  finalProject: FinalProject;
  certificate: PathCertificate;
  prerequisites?: string[];
  learningOutcomes: string[];
  learningOutcomesFr: string[];
  targetAudience: string;
  targetAudienceFr: string;
  totalXP?: number; // total XP for entire path
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export interface XPRewards {
  lessonCompletion: number;
  moduleQuiz: number;
  productiveTask: number;
  forumParticipation: number;
  finalProject: number;
}

export interface Badge {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  icon: string;
  category: 'module' | 'path' | 'achievement' | 'special';
  xpRequired?: number;
  criteria: string;
}

export interface UserProgress {
  userId: string;
  pathId: string;
  currentModuleId: string;
  currentLessonId: string;
  totalXP: number;
  completedLessons: string[];
  completedModules: string[];
  completedQuizzes: string[];
  earnedBadges: string[];
  startedAt: Date;
  lastActivityAt: Date;
  estimatedCompletionDate?: Date;
}

// ============================================================================
// 30-HOUR CONFIDENCE SYSTEM TYPES
// ============================================================================

export type ConfidencePillar = 'mindset' | 'practice' | 'performance';

export interface ConfidenceActivity {
  id: string;
  pillar: ConfidencePillar;
  hour: number; // 1-30
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  activityType: ActivityType;
  duration: number;
}

export interface ThirtyHourConfidenceSystem {
  pillar1_Mindset: {
    hours: [1, 10];
    objective: string;
    objectiveFr: string;
    activities: ConfidenceActivity[];
  };
  pillar2_Practice: {
    hours: [11, 20];
    objective: string;
    objectiveFr: string;
    activities: ConfidenceActivity[];
  };
  pillar3_Performance: {
    hours: [21, 30];
    objective: string;
    objectiveFr: string;
    activities: ConfidenceActivity[];
  };
}

// ============================================================================
// MEDIA PLACEHOLDER TYPES
// ============================================================================

export interface MediaPlaceholder {
  id: string;
  type: 'video' | 'audio' | 'image';
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  suggestedDuration?: number;
  suggestedContent?: string;
  thumbnailPlaceholder?: string;
  lessonId: string;
  activityId: string;
  status: 'pending' | 'in_production' | 'ready';
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const XP_REWARDS: XPRewards = {
  lessonCompletion: 50,
  moduleQuiz: 100,
  productiveTask: 75,
  forumParticipation: 25,
  finalProject: 200
};

export const PATH_COLORS: Record<number, string> = {
  1: '#4F46E5', // Indigo - Foundations
  2: '#7C3AED', // Violet - Building Confidence
  3: '#2563EB', // Blue - Professional Fluency
  4: '#0891B2', // Cyan - Advanced Professional
  5: '#059669', // Emerald - Executive Communication
  6: '#DC2626'  // Red - SLE Mastery
};

export const CECR_DESCRIPTIONS: Record<CECRLevel, { en: string; fr: string }> = {
  'A1': {
    en: 'Beginner - Can understand and use familiar everyday expressions',
    fr: 'Débutant - Peut comprendre et utiliser des expressions familières quotidiennes'
  },
  'A2': {
    en: 'Elementary - Can communicate in simple and routine tasks',
    fr: 'Élémentaire - Peut communiquer lors de tâches simples et habituelles'
  },
  'B1': {
    en: 'Intermediate - Can deal with most situations likely to arise',
    fr: 'Intermédiaire - Peut faire face à la plupart des situations'
  },
  'B2': {
    en: 'Upper Intermediate - Can interact with fluency and spontaneity',
    fr: 'Intermédiaire supérieur - Peut communiquer avec aisance et spontanéité'
  },
  'C1': {
    en: 'Advanced - Can express ideas fluently and spontaneously',
    fr: 'Avancé - Peut s\'exprimer spontanément et couramment'
  },
  'C1+': {
    en: 'Proficient - Near-native command of the language',
    fr: 'Maîtrise - Commande quasi-native de la langue'
  }
};

export const SLE_DESCRIPTIONS: Record<SLELevel, { en: string; fr: string }> = {
  'A': {
    en: 'Basic proficiency - Can handle simple, routine tasks',
    fr: 'Compétence de base - Peut gérer des tâches simples et routinières'
  },
  'B': {
    en: 'Intermediate proficiency - Can handle most work situations',
    fr: 'Compétence intermédiaire - Peut gérer la plupart des situations de travail'
  },
  'C': {
    en: 'Advanced proficiency - Can handle complex professional situations',
    fr: 'Compétence avancée - Peut gérer des situations professionnelles complexes'
  }
};
