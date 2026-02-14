/**
 * PathV_Complete.ts
 * Sprint 18 - Stream B: Path V Complete Data Structure
 * 
 * Path V: Mastery (C1) - Professional Excellence
 * Target: SLE Level C preparation - Advanced professional communication
 * Duration: 6-8 weeks intensive
 */



export const PATH_V_MASTERY: any = {
  id: 'path-5-mastery',
  number: 5,
  title: 'Mastery',
  titleFr: 'Maîtrise',
  level: 'C1',
  description: 'Atteignez l\'excellence professionnelle avec des compétences de niveau supérieur pour les postes de direction.',
  estimatedDuration: '30 heures',
  totalXP: 3000,
  thumbnail: '/thumbnails/path-5-mastery.webp',
  prerequisites: ['path-4-advanced'],
  modules: [
    {
      id: 'path-5-module-1',
      pathId: 'path-5-mastery',
      number: 1,
      title: 'Communication Stratégique',
      titleEn: 'Strategic Communication',
      description: 'Maîtrisez la communication de haut niveau pour les contextes exécutifs.',
      estimatedDuration: '7 heures',
      xpReward: 700,
      badgeReward: { id: 'badge-strategist', name: 'Stratège', icon: '🎯', description: 'Module Communication Stratégique complété' },
      lessons: [
        { id: 'lesson-5-1-1', number: 1, title: 'L\'Art de la Persuasion', objective: 'Maîtriser les techniques de persuasion éthique en contexte gouvernemental.', xpReward: 150 },
        { id: 'lesson-5-1-2', number: 2, title: 'Négociation Avancée', objective: 'Gérer des négociations complexes avec diplomatie.', xpReward: 150 },
        { id: 'lesson-5-1-3', number: 3, title: 'Influence et Leadership', objective: 'Exercer une influence positive sans autorité directe.', xpReward: 150 },
        { id: 'lesson-5-1-4', number: 4, title: 'Gestion de Crise Communicationnelle', objective: 'Communiquer efficacement en situation de crise.', xpReward: 150 }
      ]
    },
    {
      id: 'path-5-module-2',
      pathId: 'path-5-mastery',
      number: 2,
      title: 'Excellence Rédactionnelle',
      titleEn: 'Writing Excellence',
      description: 'Produisez des documents de niveau exécutif impeccables.',
      estimatedDuration: '8 heures',
      xpReward: 800,
      badgeReward: { id: 'badge-executive-writer', name: 'Rédacteur Exécutif', icon: '📝', description: 'Module Excellence Rédactionnelle complété' },
      lessons: [
        { id: 'lesson-5-2-1', number: 1, title: 'Mémoires au Cabinet', objective: 'Rédiger des mémoires au Cabinet conformes aux normes du BCP.', xpReward: 175 },
        { id: 'lesson-5-2-2', number: 2, title: 'Présentations au Comité', objective: 'Préparer des présentations pour les comités parlementaires.', xpReward: 175 },
        { id: 'lesson-5-2-3', number: 3, title: 'Communications Ministérielles', objective: 'Rédiger des communications au nom du ministre.', xpReward: 175 },
        { id: 'lesson-5-2-4', number: 4, title: 'Révision et Édition Avancée', objective: 'Réviser des documents complexes pour la haute direction.', xpReward: 175 }
      ]
    },
    {
      id: 'path-5-module-3',
      pathId: 'path-5-mastery',
      number: 3,
      title: 'Leadership Bilingue',
      titleEn: 'Bilingual Leadership',
      description: 'Dirigez efficacement dans les deux langues officielles.',
      estimatedDuration: '7 heures',
      xpReward: 700,
      badgeReward: { id: 'badge-bilingual-leader', name: 'Leader Bilingue', icon: '👔', description: 'Module Leadership Bilingue complété' },
      lessons: [
        { id: 'lesson-5-3-1', number: 1, title: 'Présider des Réunions Bilingues', objective: 'Animer des réunions efficaces dans les deux langues.', xpReward: 150 },
        { id: 'lesson-5-3-2', number: 2, title: 'Coaching et Mentorat en Français', objective: 'Accompagner et développer les talents en français.', xpReward: 150 },
        { id: 'lesson-5-3-3', number: 3, title: 'Gestion d\'Équipes Bilingues', objective: 'Créer un environnement de travail bilingue inclusif.', xpReward: 150 },
        { id: 'lesson-5-3-4', number: 4, title: 'Représentation Officielle', objective: 'Représenter votre organisation dans des contextes officiels bilingues.', xpReward: 150 }
      ]
    },
    {
      id: 'path-5-module-4',
      pathId: 'path-5-mastery',
      number: 4,
      title: 'Préparation SLE Niveau C',
      titleEn: 'SLE Level C Preparation',
      description: 'Préparez-vous spécifiquement pour l\'examen SLE niveau C.',
      estimatedDuration: '8 heures',
      xpReward: 800,
      badgeReward: { id: 'badge-sle-c-ready', name: 'Prêt pour SLE-C', icon: '🏆', description: 'Module Préparation SLE-C complété' },
      lessons: [
        { id: 'lesson-5-4-1', number: 1, title: 'Format et Critères SLE-C', objective: 'Comprendre les exigences spécifiques du niveau C.', xpReward: 175 },
        { id: 'lesson-5-4-2', number: 2, title: 'Simulation Expression Orale C', objective: 'Pratiquer avec des simulations d\'examen oral niveau C.', xpReward: 175 },
        { id: 'lesson-5-4-3', number: 3, title: 'Simulation Expression Écrite C', objective: 'Pratiquer avec des simulations d\'examen écrit niveau C.', xpReward: 175 },
        { id: 'lesson-5-4-4', number: 4, title: 'Stratégies de Réussite Niveau C', objective: 'Maîtriser les stratégies pour réussir l\'examen SLE-C.', xpReward: 175 }
      ]
    }
  ]
};
