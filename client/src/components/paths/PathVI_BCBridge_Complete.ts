/**
 * PathVI_BCBridge_Complete.ts
 * Sprint 18 - Stream B: Path VI Complete + B→C Bridge Module
 * 
 * Path VI: Excellence (C2) - Near-Native Proficiency
 * B→C Bridge: Intensive transition module for Level B holders targeting C
 * 
 * Target: Ultimate mastery for senior executive roles
 * Duration: 8-10 weeks intensive
 */

import { Module, Lesson, Activity } from './courseTypes';

// Extended types for this file
interface ExtendedModule {
  id: string;
  pathId: string;
  title: string;
  titleEn?: string;
  description: string;
  order: number;
  xpReward: number;
  badgeId: string;
  prerequisites: string[];
  duration: string;
  lessons: ExtendedLesson[];
}

interface ExtendedLesson {
  id: string;
  moduleId: string;
  title: string;
  titleEn?: string;
  order: number;
  duration: number;
  xpReward: number;
  objectives: string[];
}

// ============================================
// B→C BRIDGE MODULE (Critical Transition)
// ============================================

export const BC_BRIDGE_MODULE: ExtendedModule = {
  id: 'bc-bridge-module',
  pathId: 'bridge',
  title: 'Pont B→C : Transition Intensive',
  titleEn: 'B→C Bridge: Intensive Transition',
  description: 'Module intensif de 4 semaines pour passer du niveau B au niveau C',
  order: 0,
  xpReward: 3000,
  badgeId: 'badge-bc-bridge-complete',
  prerequisites: ['path-iv-advancement'],
  duration: '4 weeks intensive',
  lessons: [
    {
      id: 'bc-bridge-l1',
      moduleId: 'bc-bridge-module',
      title: 'Semaine 1 : Diagnostic et fondations',
      titleEn: 'Week 1: Diagnostic and Foundations',
      order: 1,
      duration: 120,
      xpReward: 750,
      objectives: [
        'Identifier précisément les écarts entre B et C',
        'Renforcer les fondations grammaticales avancées',
        'Établir un plan de progression personnalisé'
      ]
    },
    {
      id: 'bc-bridge-l2',
      moduleId: 'bc-bridge-module',
      title: 'Semaine 2 : Expression orale intensive',
      titleEn: 'Week 2: Intensive Oral Expression',
      order: 2,
      duration: 120,
      xpReward: 750,
      objectives: [
        'Développer la fluidité et spontanéité',
        'Maîtriser les registres de langue',
        'Perfectionner la prononciation et intonation'
      ]
    },
    {
      id: 'bc-bridge-l3',
      moduleId: 'bc-bridge-module',
      title: 'Semaine 3 : Expression écrite sophistiquée',
      titleEn: 'Week 3: Sophisticated Written Expression',
      order: 3,
      duration: 120,
      xpReward: 750,
      objectives: [
        'Rédiger des textes argumentatifs nuancés',
        'Maîtriser la synthèse de documents complexes',
        'Développer un style professionnel raffiné'
      ]
    },
    {
      id: 'bc-bridge-l4',
      moduleId: 'bc-bridge-module',
      title: 'Semaine 4 : Simulation et certification',
      titleEn: 'Week 4: Simulation and Certification',
      order: 4,
      duration: 120,
      xpReward: 750,
      objectives: [
        'Réussir une simulation complète niveau C',
        'Recevoir un feedback détaillé',
        'Obtenir la certification B→C Bridge'
      ]
    }
  ]
};

// ============================================
// PATH VI: EXCELLENCE (C2)
// ============================================

export const PATH_VI_EXCELLENCE: any = {
  id: 'path-vi-excellence',
  title: 'Path VI : Excellence',
  titleEn: 'Path VI: Excellence',
  level: 'C2',
  description: 'Maîtrise quasi-native pour les rôles de haute direction',
  targetAudience: 'Cadres supérieurs, diplomates, experts',
  duration: '8-10 weeks',
  totalXP: 15000,
  modules: [
    {
      id: 'path-vi-m1',
      pathId: 'path-vi-excellence',
      title: 'Module 1 : Leadership linguistique',
      titleEn: 'Module 1: Linguistic Leadership',
      description: 'Communiquer avec autorité et influence',
      order: 1,
      xpReward: 3750,
      lessons: [
        {
          id: 'path-vi-m1-l1',
          title: "L'art de la persuasion en français",
          objectives: ['Maîtriser les techniques rhétoriques', 'Adapter le discours à l\'audience', 'Créer un impact mémorable']
        },
        {
          id: 'path-vi-m1-l2',
          title: 'Négociations de haut niveau',
          objectives: ['Gérer les tensions diplomatiques', 'Trouver des compromis élégants', 'Maintenir des relations positives']
        },
        {
          id: 'path-vi-m1-l3',
          title: 'Discours publics et médias',
          objectives: ['Structurer un discours impactant', 'Gérer les questions difficiles', 'Maîtriser la communication de crise']
        },
        {
          id: 'path-vi-m1-l4',
          title: 'Mentorat et coaching linguistique',
          objectives: ['Guider les autres vers le bilinguisme', 'Donner un feedback constructif', 'Inspirer l\'excellence linguistique']
        }
      ]
    },
    {
      id: 'path-vi-m2',
      pathId: 'path-vi-excellence',
      title: 'Module 2 : Nuances culturelles profondes',
      titleEn: 'Module 2: Deep Cultural Nuances',
      description: 'Comprendre et naviguer les subtilités culturelles',
      order: 2,
      xpReward: 3750,
      lessons: [
        {
          id: 'path-vi-m2-l1',
          title: 'Humour et ironie en contexte professionnel',
          objectives: ['Utiliser l\'humour appropriément', 'Comprendre les références culturelles', 'Éviter les faux pas']
        },
        {
          id: 'path-vi-m2-l2',
          title: 'Variations régionales et registres',
          objectives: ['Reconnaître les accents régionaux', 'Adapter son langage au contexte', 'Naviguer entre formel et informel']
        },
        {
          id: 'path-vi-m2-l3',
          title: 'Protocole et étiquette bilingue',
          objectives: ['Maîtriser les codes diplomatiques', 'Gérer les événements officiels', 'Représenter avec distinction']
        },
        {
          id: 'path-vi-m2-l4',
          title: 'Intelligence interculturelle avancée',
          objectives: ['Anticiper les malentendus culturels', 'Créer des ponts entre communautés', 'Promouvoir l\'inclusion linguistique']
        }
      ]
    },
    {
      id: 'path-vi-m3',
      pathId: 'path-vi-excellence',
      title: 'Module 3 : Expertise sectorielle',
      titleEn: 'Module 3: Sector Expertise',
      description: 'Maîtrise du vocabulaire spécialisé de votre domaine',
      order: 3,
      xpReward: 3750,
      lessons: [
        {
          id: 'path-vi-m3-l1',
          title: 'Terminologie juridique et réglementaire',
          objectives: ['Maîtriser le vocabulaire juridique', 'Rédiger des textes réglementaires', 'Interpréter des documents légaux']
        },
        {
          id: 'path-vi-m3-l2',
          title: 'Langage financier et économique',
          objectives: ['Analyser des rapports financiers', 'Présenter des données économiques', 'Débattre de politiques fiscales']
        },
        {
          id: 'path-vi-m3-l3',
          title: 'Communication scientifique et technique',
          objectives: ['Vulgariser des concepts complexes', 'Rédiger des rapports techniques', 'Présenter des recherches']
        },
        {
          id: 'path-vi-m3-l4',
          title: 'Vocabulaire des relations internationales',
          objectives: ['Maîtriser le langage diplomatique', 'Comprendre les enjeux géopolitiques', 'Communiquer sur la scène mondiale']
        }
      ]
    },
    {
      id: 'path-vi-m4',
      pathId: 'path-vi-excellence',
      title: 'Module 4 : Certification Excellence',
      titleEn: 'Module 4: Excellence Certification',
      description: 'Validation finale du niveau C2',
      order: 4,
      xpReward: 3750,
      lessons: [
        {
          id: 'path-vi-m4-l1',
          title: 'Simulation SLE niveau C complète',
          objectives: ['Réussir une simulation réaliste', 'Démontrer une maîtrise quasi-native', 'Recevoir un feedback expert']
        },
        {
          id: 'path-vi-m4-l2',
          title: 'Portfolio de compétences',
          objectives: ['Compiler vos meilleures productions', 'Documenter votre progression', 'Créer une vitrine professionnelle']
        },
        {
          id: 'path-vi-m4-l3',
          title: 'Mentorat inversé',
          objectives: ['Enseigner à un apprenant débutant', 'Consolider vos acquis par l\'enseignement', 'Développer votre leadership']
        },
        {
          id: 'path-vi-m4-l4',
          title: 'Certification et célébration',
          objectives: ['Obtenir votre certification Excellence', 'Rejoindre la communauté des Alumni', 'Planifier votre maintien du niveau']
        }
      ]
    }
  ]
};

// ============================================
// CRASH COURSES (Intensive 3-4 Week Programs)
// ============================================

export const CRASH_COURSES = {
  sle_oral_intensive: {
    id: 'crash-sle-oral',
    title: 'SLE Oral Intensif',
    titleEn: 'SLE Oral Intensive',
    duration: '3 weeks',
    targetLevel: 'B/C',
    description: 'Préparation intensive à la composante orale du SLE',
    dailyCommitment: '2 hours',
    modules: ['Compréhension orale', 'Expression orale', 'Simulations']
  },
  sle_written_intensive: {
    id: 'crash-sle-written',
    title: 'SLE Écrit Intensif',
    titleEn: 'SLE Written Intensive',
    duration: '3 weeks',
    targetLevel: 'B/C',
    description: 'Préparation intensive à la composante écrite du SLE',
    dailyCommitment: '2 hours',
    modules: ['Compréhension écrite', 'Expression écrite', 'Simulations']
  },
  executive_bilingual: {
    id: 'crash-executive',
    title: 'Cadre Bilingue Express',
    titleEn: 'Executive Bilingual Express',
    duration: '4 weeks',
    targetLevel: 'B+',
    description: 'Programme accéléré pour cadres avec bases solides',
    dailyCommitment: '90 minutes',
    modules: ['Réunions', 'Présentations', 'Négociations', 'Correspondance']
  }
};

export default { BC_BRIDGE_MODULE, PATH_VI_EXCELLENCE, CRASH_COURSES };
