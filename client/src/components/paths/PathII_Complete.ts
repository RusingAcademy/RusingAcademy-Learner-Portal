/**
 * PathII_Complete.ts
 * Sprint 15 - Stream B: Path II Communication Essentials Complete
 * 
 * Target Level: A2 (Elementary)
 * Focus: Workplace communication, meetings, and professional writing
 * 
 * 4 Modules × 4 Lessons = 16 Lessons Total
 */

import { Module } from './courseTypes';

export const PATH_II_COMMUNICATION: any = {
  id: 'path-2-communication',
  number: 2,
  title: 'Communication Essentials',
  titleFr: 'Communication Essentielle',
  level: 'A2',
  description: 'Développez vos compétences de communication professionnelle pour les réunions, présentations et échanges quotidiens.',
  descriptionEn: 'Develop professional communication skills for meetings, presentations, and daily exchanges.',
  estimatedDuration: '15 heures',
  totalXP: 1500,
  thumbnail: '/thumbnails/path-2-communication.webp',
  prerequisites: ['path-1-foundations'],
  targetAudience: [
    'Fonctionnaires visant le niveau A en expression orale',
    'Professionnels souhaitant améliorer leur communication quotidienne',
    'Apprenants ayant complété Path I'
  ],
  learningOutcomes: [
    'Participer activement aux réunions en français',
    'Rédiger des courriels professionnels structurés',
    'Faire des présentations simples',
    'Gérer les conversations téléphoniques complexes',
    'Exprimer des opinions et des suggestions'
  ],
  modules: [
    // MODULE 1: Réunions et Discussions
    {
      id: 'path-2-module-1',
      pathId: 'path-2-communication',
      number: 1,
      title: 'Réunions et Discussions',
      titleEn: 'Meetings and Discussions',
      description: 'Maîtrisez le vocabulaire et les expressions pour participer efficacement aux réunions.',
      estimatedDuration: '3.5 heures',
      xpReward: 350,
      badgeReward: {
        id: 'badge-meetings',
        name: 'Participant Actif',
        icon: '🗣️',
        description: 'Module Réunions complété'
      },
      prerequisites: [],
      learningObjectives: [
        'Comprendre et utiliser le vocabulaire des réunions',
        'Prendre la parole et intervenir poliment',
        'Exprimer son accord et son désaccord',
        'Proposer des idées et des solutions'
      ],
      lessons: [
        // Lesson 2.1.1 - Vocabulaire des Réunions
        {
          id: 'lesson-2-1-1',
          moduleId: 'path-2-module-1',
          number: 1,
          title: 'Vocabulaire des Réunions',
          titleEn: 'Meeting Vocabulary',
          objective: 'À la fin de cette leçon, vous maîtriserez le vocabulaire essentiel des réunions professionnelles.',
          estimatedDuration: '25 minutes',
          xpReward: 70,
          tags: ['vocabulaire', 'réunions', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['vocabulary', 'listening', 'speaking']
        },
        // Lesson 2.1.2 - Prendre la Parole
        {
          id: 'lesson-2-1-2',
          moduleId: 'path-2-module-1',
          number: 2,
          title: 'Prendre la Parole',
          titleEn: 'Taking the Floor',
          objective: 'À la fin de cette leçon, vous saurez intervenir poliment et efficacement en réunion.',
          estimatedDuration: '30 minutes',
          xpReward: 80,
          tags: ['expression', 'réunions', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking', 'pragmatics']
        },
        // Lesson 2.1.3 - Exprimer son Opinion
        {
          id: 'lesson-2-1-3',
          moduleId: 'path-2-module-1',
          number: 3,
          title: 'Exprimer son Opinion',
          titleEn: 'Expressing Opinions',
          objective: 'À la fin de cette leçon, vous saurez exprimer votre accord, désaccord et nuancer vos opinions.',
          estimatedDuration: '30 minutes',
          xpReward: 80,
          tags: ['opinion', 'réunions', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking', 'pragmatics']
        },
        // Lesson 2.1.4 - Proposer des Solutions
        {
          id: 'lesson-2-1-4',
          moduleId: 'path-2-module-1',
          number: 4,
          title: 'Proposer des Solutions',
          titleEn: 'Proposing Solutions',
          objective: 'À la fin de cette leçon, vous saurez proposer des idées et des solutions de manière constructive.',
          estimatedDuration: '30 minutes',
          xpReward: 85,
          tags: ['propositions', 'réunions', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking', 'pragmatics']
        }
      ]
    },
    // MODULE 2: Communication Écrite
    {
      id: 'path-2-module-2',
      pathId: 'path-2-communication',
      number: 2,
      title: 'Communication Écrite',
      titleEn: 'Written Communication',
      description: 'Maîtrisez la rédaction de courriels et de documents professionnels.',
      estimatedDuration: '4 heures',
      xpReward: 400,
      badgeReward: {
        id: 'badge-writing',
        name: 'Rédacteur Pro',
        icon: '✍️',
        description: 'Module Communication Écrite complété'
      },
      prerequisites: ['path-2-module-1'],
      learningObjectives: [
        'Rédiger des courriels professionnels',
        'Structurer un message clair',
        'Utiliser les formules de politesse appropriées',
        'Répondre aux demandes par écrit'
      ],
      lessons: [
        {
          id: 'lesson-2-2-1',
          moduleId: 'path-2-module-2',
          number: 1,
          title: 'Structure du Courriel',
          titleEn: 'Email Structure',
          objective: 'Maîtriser la structure standard d\'un courriel professionnel.',
          estimatedDuration: '25 minutes',
          xpReward: 75,
          tags: ['courriel', 'structure', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['writing']
        },
        {
          id: 'lesson-2-2-2',
          moduleId: 'path-2-module-2',
          number: 2,
          title: 'Formules de Politesse',
          titleEn: 'Polite Formulas',
          objective: 'Utiliser les formules d\'appel et de salutation appropriées.',
          estimatedDuration: '25 minutes',
          xpReward: 75,
          tags: ['politesse', 'courriel', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['writing', 'pragmatics']
        },
        {
          id: 'lesson-2-2-3',
          moduleId: 'path-2-module-2',
          number: 3,
          title: 'Demandes et Réponses',
          titleEn: 'Requests and Responses',
          objective: 'Formuler des demandes et répondre professionnellement.',
          estimatedDuration: '30 minutes',
          xpReward: 80,
          tags: ['demandes', 'courriel', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['writing']
        },
        {
          id: 'lesson-2-2-4',
          moduleId: 'path-2-module-2',
          number: 4,
          title: 'Ton et Registre',
          titleEn: 'Tone and Register',
          objective: 'Adapter le ton selon le destinataire et le contexte.',
          estimatedDuration: '30 minutes',
          xpReward: 85,
          tags: ['registre', 'courriel', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['writing', 'pragmatics']
        }
      ]
    },
    // MODULE 3: Présentations
    {
      id: 'path-2-module-3',
      pathId: 'path-2-communication',
      number: 3,
      title: 'Présentations',
      titleEn: 'Presentations',
      description: 'Apprenez à faire des présentations claires et structurées.',
      estimatedDuration: '3.5 heures',
      xpReward: 350,
      badgeReward: {
        id: 'badge-presenter',
        name: 'Présentateur',
        icon: '📊',
        description: 'Module Présentations complété'
      },
      prerequisites: ['path-2-module-2'],
      learningObjectives: [
        'Structurer une présentation',
        'Introduire et conclure efficacement',
        'Utiliser des supports visuels',
        'Gérer les questions'
      ],
      lessons: [
        {
          id: 'lesson-2-3-1',
          moduleId: 'path-2-module-3',
          number: 1,
          title: 'Structure d\'une Présentation',
          titleEn: 'Presentation Structure',
          objective: 'Organiser une présentation avec introduction, développement et conclusion.',
          estimatedDuration: '25 minutes',
          xpReward: 70,
          tags: ['présentation', 'structure', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking', 'organization']
        },
        {
          id: 'lesson-2-3-2',
          moduleId: 'path-2-module-3',
          number: 2,
          title: 'Introduction et Conclusion',
          titleEn: 'Opening and Closing',
          objective: 'Maîtriser les phrases d\'accroche et de conclusion.',
          estimatedDuration: '25 minutes',
          xpReward: 75,
          tags: ['présentation', 'introduction', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking']
        },
        {
          id: 'lesson-2-3-3',
          moduleId: 'path-2-module-3',
          number: 3,
          title: 'Supports Visuels',
          titleEn: 'Visual Aids',
          objective: 'Décrire et commenter des graphiques et diagrammes.',
          estimatedDuration: '30 minutes',
          xpReward: 80,
          tags: ['présentation', 'visuels', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking', 'vocabulary']
        },
        {
          id: 'lesson-2-3-4',
          moduleId: 'path-2-module-3',
          number: 4,
          title: 'Questions-Réponses',
          titleEn: 'Q&A Session',
          objective: 'Gérer les questions et y répondre avec assurance.',
          estimatedDuration: '30 minutes',
          xpReward: 85,
          tags: ['présentation', 'questions', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking', 'listening']
        }
      ]
    },
    // MODULE 4: Communication Téléphonique
    {
      id: 'path-2-module-4',
      pathId: 'path-2-communication',
      number: 4,
      title: 'Communication Téléphonique',
      titleEn: 'Phone Communication',
      description: 'Maîtrisez les appels téléphoniques professionnels.',
      estimatedDuration: '4 heures',
      xpReward: 400,
      badgeReward: {
        id: 'badge-phone',
        name: 'Expert Téléphone',
        icon: '📞',
        description: 'Module Communication Téléphonique complété'
      },
      prerequisites: ['path-2-module-3'],
      learningObjectives: [
        'Répondre professionnellement au téléphone',
        'Prendre et laisser des messages',
        'Transférer des appels',
        'Gérer les situations difficiles'
      ],
      lessons: [
        {
          id: 'lesson-2-4-1',
          moduleId: 'path-2-module-4',
          number: 1,
          title: 'Répondre au Téléphone',
          titleEn: 'Answering the Phone',
          objective: 'Maîtriser les formules standard pour répondre au téléphone.',
          estimatedDuration: '25 minutes',
          xpReward: 75,
          tags: ['téléphone', 'formules', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking', 'listening']
        },
        {
          id: 'lesson-2-4-2',
          moduleId: 'path-2-module-4',
          number: 2,
          title: 'Prendre un Message',
          titleEn: 'Taking a Message',
          objective: 'Noter et transmettre les messages téléphoniques.',
          estimatedDuration: '25 minutes',
          xpReward: 75,
          tags: ['téléphone', 'messages', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['listening', 'writing']
        },
        {
          id: 'lesson-2-4-3',
          moduleId: 'path-2-module-4',
          number: 3,
          title: 'Transférer et Mettre en Attente',
          titleEn: 'Transferring and Holding',
          objective: 'Gérer les transferts d\'appels et les mises en attente.',
          estimatedDuration: '25 minutes',
          xpReward: 80,
          tags: ['téléphone', 'transfert', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking']
        },
        {
          id: 'lesson-2-4-4',
          moduleId: 'path-2-module-4',
          number: 4,
          title: 'Situations Difficiles',
          titleEn: 'Difficult Situations',
          objective: 'Gérer les plaintes et les interlocuteurs difficiles.',
          estimatedDuration: '30 minutes',
          xpReward: 85,
          tags: ['téléphone', 'difficile', 'A2'],
          difficulty: 'elementary',
          skillsFocus: ['speaking', 'pragmatics']
        }
      ]
    }
  ]
};

export default PATH_II_COMMUNICATION;
