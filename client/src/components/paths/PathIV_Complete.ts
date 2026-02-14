/**
 * PathIV_Complete.ts
 * Sprint 17 - Stream B: Path IV Advanced Mastery Complete
 * 
 * Target Level: B2 (Upper Intermediate)
 * Focus: Advanced professional communication, nuanced expression, and SLE Level B mastery
 * SLE Target: Level B Oral Interaction & Written Expression
 * 
 * 4 Modules × 4 Lessons = 16 Lessons Total
 */



export const PATH_IV_ADVANCED: any = {
  id: 'path-4-advanced',
  number: 4,
  title: 'Advanced Mastery',
  titleFr: 'Maîtrise Avancée',
  level: 'B2',
  description: 'Perfectionnez votre français professionnel avec des nuances avancées, des débats structurés et une expression écrite sophistiquée.',
  estimatedDuration: '25 heures',
  totalXP: 2500,
  thumbnail: '/thumbnails/path-4-advanced.webp',
  prerequisites: ['path-3-professional'],
  modules: [
    {
      id: 'path-4-module-1',
      pathId: 'path-4-advanced',
      number: 1,
      title: 'Expression Nuancée',
      titleEn: 'Nuanced Expression',
      description: 'Maîtrisez les subtilités de la langue française pour une communication plus riche et précise.',
      estimatedDuration: '6 heures',
      xpReward: 600,
      badgeReward: { id: 'badge-nuance-master', name: 'Maître des Nuances', icon: '🎭', description: 'Module Expression Nuancée complété' },
      lessons: [
        { id: 'lesson-4-1-1', number: 1, title: 'Expressions Idiomatiques Professionnelles', objective: 'Utiliser des expressions idiomatiques courantes en contexte professionnel.', xpReward: 120 },
        { id: 'lesson-4-1-2', number: 2, title: 'Nuances de Sens et Connotations', objective: 'Distinguer les nuances de sens entre mots similaires.', xpReward: 120 },
        { id: 'lesson-4-1-3', number: 3, title: 'Registres de Langue', objective: 'Adapter votre registre au contexte professionnel.', xpReward: 120 },
        { id: 'lesson-4-1-4', number: 4, title: 'Diplomatie Linguistique', objective: 'Exprimer des opinions délicates avec tact.', xpReward: 120 }
      ]
    },
    {
      id: 'path-4-module-2',
      pathId: 'path-4-advanced',
      number: 2,
      title: 'Débat et Argumentation Avancée',
      titleEn: 'Advanced Debate and Argumentation',
      description: 'Développez vos compétences en débat structuré et argumentation persuasive.',
      estimatedDuration: '6 heures',
      xpReward: 600,
      badgeReward: { id: 'badge-debater', name: 'Débatteur Expert', icon: '⚔️', description: 'Module Débat et Argumentation complété' },
      lessons: [
        { id: 'lesson-4-2-1', number: 1, title: 'Structure d\'un Débat Formel', objective: 'Organiser et participer à des débats structurés.', xpReward: 120 },
        { id: 'lesson-4-2-2', number: 2, title: 'Techniques de Contre-Argumentation', objective: 'Réfuter des arguments de manière constructive.', xpReward: 120 },
        { id: 'lesson-4-2-3', number: 3, title: 'Rhétorique et Persuasion', objective: 'Utiliser des techniques rhétoriques efficaces.', xpReward: 120 },
        { id: 'lesson-4-2-4', number: 4, title: 'Synthèse et Conclusion', objective: 'Conclure un débat de manière impactante.', xpReward: 120 }
      ]
    },
    {
      id: 'path-4-module-3',
      pathId: 'path-4-advanced',
      number: 3,
      title: 'Rédaction Avancée',
      titleEn: 'Advanced Writing',
      description: 'Maîtrisez la rédaction de documents complexes et stratégiques.',
      estimatedDuration: '6 heures',
      xpReward: 600,
      badgeReward: { id: 'badge-writer', name: 'Rédacteur Expert', icon: '✍️', description: 'Module Rédaction Avancée complété' },
      lessons: [
        { id: 'lesson-4-3-1', number: 1, title: 'Notes de Breffage Stratégiques', objective: 'Rédiger des notes de breffage pour la haute direction.', xpReward: 120 },
        { id: 'lesson-4-3-2', number: 2, title: 'Rapports d\'Analyse', objective: 'Structurer et rédiger des rapports analytiques.', xpReward: 120 },
        { id: 'lesson-4-3-3', number: 3, title: 'Communications Ministérielles', objective: 'Rédiger des communications officielles.', xpReward: 120 },
        { id: 'lesson-4-3-4', number: 4, title: 'Révision et Édition', objective: 'Réviser et améliorer des textes complexes.', xpReward: 120 }
      ]
    },
    {
      id: 'path-4-module-4',
      pathId: 'path-4-advanced',
      number: 4,
      title: 'Préparation SLE Niveau B',
      titleEn: 'SLE Level B Preparation',
      description: 'Préparez-vous spécifiquement pour l\'examen SLE niveau B.',
      estimatedDuration: '7 heures',
      xpReward: 700,
      badgeReward: { id: 'badge-sle-b-ready', name: 'Prêt pour SLE-B', icon: '🎯', description: 'Module Préparation SLE-B complété' },
      lessons: [
        { id: 'lesson-4-4-1', number: 1, title: 'Format et Critères SLE-B', objective: 'Comprendre le format et les critères d\'évaluation SLE niveau B.', xpReward: 150 },
        { id: 'lesson-4-4-2', number: 2, title: 'Simulation Expression Orale', objective: 'Pratiquer avec des simulations d\'examen oral.', xpReward: 150 },
        { id: 'lesson-4-4-3', number: 3, title: 'Simulation Expression Écrite', objective: 'Pratiquer avec des simulations d\'examen écrit.', xpReward: 150 },
        { id: 'lesson-4-4-4', number: 4, title: 'Stratégies de Réussite', objective: 'Maîtriser les stratégies pour réussir l\'examen SLE-B.', xpReward: 150 }
      ]
    }
  ]
};
