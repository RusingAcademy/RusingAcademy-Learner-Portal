/**
 * PathIII_Complete.ts
 * Sprint 16 - Stream B: Path III Professional Contexts Complete
 * 
 * Target Level: B1 (Intermediate)
 * Focus: Professional contexts, negotiations, and complex workplace scenarios
 * SLE Target: Level B Oral Interaction
 * 
 * 4 Modules × 4 Lessons = 16 Lessons Total
 */



export const PATH_III_PROFESSIONAL: any = {
  id: 'path-3-professional',
  number: 3,
  title: 'Professional Contexts',
  titleFr: 'Contextes Professionnels',
  level: 'B1',
  description: 'Maîtrisez les situations professionnelles complexes: négociations, présentations avancées, et communication stratégique.',
  estimatedDuration: '20 heures',
  totalXP: 2000,
  thumbnail: '/thumbnails/path-3-professional.webp',
  prerequisites: ['path-2-communication'],
  modules: [
    {
      id: 'path-3-module-1',
      pathId: 'path-3-professional',
      number: 1,
      title: 'Négociation et Persuasion',
      titleEn: 'Negotiation and Persuasion',
      description: 'Développez vos compétences de négociation et apprenez à persuader efficacement.',
      estimatedDuration: '5 heures',
      xpReward: 500,
      badgeReward: { id: 'badge-negotiator', name: 'Négociateur', icon: '🤝', description: 'Module Négociation complété' },
      lessons: [
        { id: 'lesson-3-1-1', number: 1, title: 'Préparer une Négociation', objective: 'Préparer méthodiquement vos négociations professionnelles.', xpReward: 100 },
        { id: 'lesson-3-1-2', number: 2, title: 'Techniques de Persuasion', objective: 'Utiliser des techniques de persuasion éthiques et efficaces.', xpReward: 100 },
        { id: 'lesson-3-1-3', number: 3, title: 'Gérer les Objections', objective: 'Répondre aux objections de manière constructive.', xpReward: 100 },
        { id: 'lesson-3-1-4', number: 4, title: 'Conclure un Accord', objective: 'Finaliser des accords gagnant-gagnant.', xpReward: 100 }
      ]
    },
    {
      id: 'path-3-module-2',
      pathId: 'path-3-professional',
      number: 2,
      title: 'Présentations Avancées',
      titleEn: 'Advanced Presentations',
      description: 'Maîtrisez l\'art des présentations à haut enjeu.',
      estimatedDuration: '5 heures',
      xpReward: 500,
      badgeReward: { id: 'badge-presenter', name: 'Présentateur Expert', icon: '🎤', description: 'Module Présentations Avancées complété' },
      lessons: [
        { id: 'lesson-3-2-1', number: 1, title: 'Structurer une Présentation Stratégique', objective: 'Créer des présentations à fort impact.', xpReward: 100 },
        { id: 'lesson-3-2-2', number: 2, title: 'Techniques de Storytelling', objective: 'Captiver votre audience avec des histoires.', xpReward: 100 },
        { id: 'lesson-3-2-3', number: 3, title: 'Gérer les Questions Difficiles', objective: 'Répondre avec assurance aux questions complexes.', xpReward: 100 },
        { id: 'lesson-3-2-4', number: 4, title: 'Présenter à la Haute Direction', objective: 'Adapter votre discours aux cadres supérieurs.', xpReward: 100 }
      ]
    },
    {
      id: 'path-3-module-3',
      pathId: 'path-3-professional',
      number: 3,
      title: 'Gestion de Conflits',
      titleEn: 'Conflict Management',
      description: 'Transformez les conflits en opportunités de collaboration.',
      estimatedDuration: '5 heures',
      xpReward: 500,
      badgeReward: { id: 'badge-mediator', name: 'Médiateur', icon: '⚖️', description: 'Module Gestion de Conflits complété' },
      lessons: [
        { id: 'lesson-3-3-1', number: 1, title: 'Identifier les Sources de Conflit', objective: 'Analyser les causes profondes des désaccords.', xpReward: 100 },
        { id: 'lesson-3-3-2', number: 2, title: 'Communication Non-Violente', objective: 'Exprimer vos besoins sans agressivité.', xpReward: 100 },
        { id: 'lesson-3-3-3', number: 3, title: 'Médiation et Facilitation', objective: 'Aider les parties à trouver un terrain d\'entente.', xpReward: 100 },
        { id: 'lesson-3-3-4', number: 4, title: 'Rétablir la Confiance', objective: 'Reconstruire des relations professionnelles saines.', xpReward: 100 }
      ]
    },
    {
      id: 'path-3-module-4',
      pathId: 'path-3-professional',
      number: 4,
      title: 'Leadership Bilingue',
      titleEn: 'Bilingual Leadership',
      description: 'Dirigez efficacement dans les deux langues officielles.',
      estimatedDuration: '5 heures',
      xpReward: 500,
      badgeReward: { id: 'badge-leader', name: 'Leader Bilingue', icon: '👔', description: 'Module Leadership Bilingue complété' },
      lessons: [
        { id: 'lesson-3-4-1', number: 1, title: 'Diriger des Réunions Bilingues', objective: 'Animer des réunions inclusives dans les deux langues.', xpReward: 100 },
        { id: 'lesson-3-4-2', number: 2, title: 'Coaching en Français', objective: 'Accompagner et développer votre équipe en français.', xpReward: 100 },
        { id: 'lesson-3-4-3', number: 3, title: 'Feedback Constructif', objective: 'Donner et recevoir du feedback efficacement.', xpReward: 100 },
        { id: 'lesson-3-4-4', number: 4, title: 'Vision et Mobilisation', objective: 'Inspirer et mobiliser votre équipe vers un objectif commun.', xpReward: 100 }
      ]
    }
  ]
};
