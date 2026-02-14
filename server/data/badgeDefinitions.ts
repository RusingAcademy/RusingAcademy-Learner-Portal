/**
 * Badge Definitions — RusingÂcademy Gamification System
 * 
 * Each badge has:
 * - Unique ID matching the learnerBadges.badgeType enum
 * - Bilingual name/description (EN/FR)
 * - Category for grouping in the showcase
 * - XP reward on earn
 * - Trigger condition for auto-award engine
 * - Tier (bronze/silver/gold/platinum) for visual hierarchy
 * - SVG thumbnail path
 */

// ─── Badge Categories ─────────────────────────────────────────────────────────
export const BADGE_CATEGORIES = {
  CONTENT: "content",
  STREAK: "streak",
  MASTERY: "mastery",
  SLE: "sle",
  SPECIAL: "special",
} as const;

export type BadgeCategory = (typeof BADGE_CATEGORIES)[keyof typeof BADGE_CATEGORIES];

// ─── Trigger Types ────────────────────────────────────────────────────────────
export type BadgeTrigger =
  | { type: "slots_completed"; count: number }
  | { type: "lessons_completed"; count: number }
  | { type: "modules_completed"; count: number }
  | { type: "paths_completed"; count: number }
  | { type: "videos_watched"; count: number }
  | { type: "quiz_score_90"; count: number }
  | { type: "quiz_perfect"; count: number }
  | { type: "streak_days"; count: number }
  | { type: "xp_earned"; count: number }
  | { type: "sle_level"; level: string }
  | { type: "course_complete"; courseId?: number }
  | { type: "path_completed"; pathId: number }
  | { type: "all_paths_completed"; count: number }
  | { type: "path_completed_fast"; days: number }
  | { type: "first_activity" }
  | { type: "all_slots_lesson" }
  | { type: "founding_member" }
  | { type: "beta_tester" };

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

// ─── Badge Definition Interface ───────────────────────────────────────────────
export interface BadgeDefinition {
  id: string; // Matches learnerBadges.badgeType enum value
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  category: BadgeCategory;
  tier: BadgeTier;
  xpReward: number;
  trigger: BadgeTrigger;
  // SVG icon identifier for the premium badge thumbnail
  iconKey: string;
  // Gradient colors for the badge ring/glow
  gradientFrom: string;
  gradientTo: string;
}

// ─── Badge Definitions ────────────────────────────────────────────────────────
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT BADGES — Completion-based progression
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "first_lesson",
    name: "First Step",
    nameFr: "Premier Pas",
    description: "Complete your first activity slot",
    descriptionFr: "Complétez votre première activité",
    category: "content",
    tier: "bronze",
    xpReward: 50,
    trigger: { type: "first_activity" },
    iconKey: "footprints",
    gradientFrom: "#0F3D3E",
    gradientTo: "#145A5B",
  },
  {
    id: "module_complete",
    name: "Module Master",
    nameFr: "Maître du Module",
    description: "Complete all lessons in a module",
    descriptionFr: "Complétez toutes les leçons d'un module",
    category: "content",
    tier: "silver",
    xpReward: 150,
    trigger: { type: "modules_completed", count: 1 },
    iconKey: "layers",
    gradientFrom: "#C65A1E",
    gradientTo: "#D97B3D",
  },
  {
    id: "course_complete",
    name: "Path Pioneer",
    nameFr: "Pionnier du Parcours",
    description: "Complete an entire Path course",
    descriptionFr: "Complétez un parcours Path complet",
    category: "content",
    tier: "gold",
    xpReward: 500,
    trigger: { type: "paths_completed", count: 1 },
    iconKey: "trophy",
    gradientFrom: "#D97B3D",
    gradientTo: "#E8A04C",
  },
  {
    id: "all_courses_complete",
    name: "Bilingual Champion",
    nameFr: "Champion Bilingue",
    description: "Complete all available Path courses",
    descriptionFr: "Complétez tous les parcours Path disponibles",
    category: "content",
    tier: "platinum",
    xpReward: 2000,
    trigger: { type: "paths_completed", count: 6 },
    iconKey: "crown",
    gradientFrom: "#FFD700",
    gradientTo: "#FFA500",
  },
  {
    id: "consistent_learner",
    name: "Lesson Champion",
    nameFr: "Champion de Leçon",
    description: "Complete 10 lessons with all 7 slots",
    descriptionFr: "Complétez 10 leçons avec les 7 créneaux",
    category: "content",
    tier: "silver",
    xpReward: 250,
    trigger: { type: "lessons_completed", count: 10 },
    iconKey: "book-check",
    gradientFrom: "#0F3D3E",
    gradientTo: "#1A6B6D",
  },
  {
    id: "quiz_ace",
    name: "Video Virtuoso",
    nameFr: "Virtuose Vidéo",
    description: "Watch 25 video lessons",
    descriptionFr: "Regardez 25 leçons vidéo",
    category: "content",
    tier: "silver",
    xpReward: 200,
    trigger: { type: "videos_watched", count: 25 },
    iconKey: "play-circle",
    gradientFrom: "#4F46E5",
    gradientTo: "#7C3AED",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MASTERY BADGES — Skill & performance-based
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "quiz_master",
    name: "Quiz Master",
    nameFr: "Maître du Quiz",
    description: "Score 90%+ on 10 quizzes",
    descriptionFr: "Obtenez 90%+ à 10 quiz",
    category: "mastery",
    tier: "gold",
    xpReward: 300,
    trigger: { type: "quiz_score_90", count: 10 },
    iconKey: "brain",
    gradientFrom: "#DC2626",
    gradientTo: "#F59E0B",
  },
  {
    id: "perfect_module",
    name: "Perfect Score",
    nameFr: "Score Parfait",
    description: "Get 100% on 5 quizzes",
    descriptionFr: "Obtenez 100% à 5 quiz",
    category: "mastery",
    tier: "gold",
    xpReward: 400,
    trigger: { type: "quiz_perfect", count: 5 },
    iconKey: "star",
    gradientFrom: "#F59E0B",
    gradientTo: "#EF4444",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STREAK BADGES — Consistency & regularity
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "streak_3",
    name: "Getting Started",
    nameFr: "Bon Début",
    description: "Maintain a 3-day learning streak",
    descriptionFr: "Maintenez une série de 3 jours",
    category: "streak",
    tier: "bronze",
    xpReward: 50,
    trigger: { type: "streak_days", count: 3 },
    iconKey: "flame",
    gradientFrom: "#F97316",
    gradientTo: "#EF4444",
  },
  {
    id: "streak_7",
    name: "7-Day Streak",
    nameFr: "Série de 7 Jours",
    description: "Maintain a 7-day learning streak",
    descriptionFr: "Maintenez une série de 7 jours",
    category: "streak",
    tier: "bronze",
    xpReward: 100,
    trigger: { type: "streak_days", count: 7 },
    iconKey: "flame",
    gradientFrom: "#F97316",
    gradientTo: "#DC2626",
  },
  {
    id: "streak_14",
    name: "Two-Week Warrior",
    nameFr: "Guerrier de 2 Semaines",
    description: "Maintain a 14-day learning streak",
    descriptionFr: "Maintenez une série de 14 jours",
    category: "streak",
    tier: "silver",
    xpReward: 200,
    trigger: { type: "streak_days", count: 14 },
    iconKey: "zap",
    gradientFrom: "#EAB308",
    gradientTo: "#F97316",
  },
  {
    id: "streak_30",
    name: "Monthly Warrior",
    nameFr: "Guerrier Mensuel",
    description: "Maintain a 30-day learning streak",
    descriptionFr: "Maintenez une série de 30 jours",
    category: "streak",
    tier: "gold",
    xpReward: 500,
    trigger: { type: "streak_days", count: 30 },
    iconKey: "shield",
    gradientFrom: "#D97B3D",
    gradientTo: "#C65A1E",
  },
  {
    id: "streak_100",
    name: "Century Streak",
    nameFr: "Série Centenaire",
    description: "Maintain a 100-day learning streak",
    descriptionFr: "Maintenez une série de 100 jours",
    category: "streak",
    tier: "platinum",
    xpReward: 1500,
    trigger: { type: "streak_days", count: 100 },
    iconKey: "crown",
    gradientFrom: "#FFD700",
    gradientTo: "#FF6B00",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SLE BADGES — Government language proficiency levels
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "xp_100",
    name: "SLE A Ready",
    nameFr: "SLE A Prêt",
    description: "Demonstrate A-level proficiency through course completion",
    descriptionFr: "Démontrez une compétence de niveau A par la complétion de cours",
    category: "sle",
    tier: "bronze",
    xpReward: 200,
    trigger: { type: "sle_level", level: "A" },
    iconKey: "award",
    gradientFrom: "#059669",
    gradientTo: "#10B981",
  },
  {
    id: "xp_500",
    name: "SLE B Certified",
    nameFr: "SLE B Certifié",
    description: "Demonstrate B-level proficiency through course mastery",
    descriptionFr: "Démontrez une compétence de niveau B par la maîtrise des cours",
    category: "sle",
    tier: "silver",
    xpReward: 500,
    trigger: { type: "sle_level", level: "B" },
    iconKey: "award",
    gradientFrom: "#2563EB",
    gradientTo: "#3B82F6",
  },
  {
    id: "xp_1000",
    name: "SLE C Mastery",
    nameFr: "SLE C Maîtrise",
    description: "Demonstrate C-level proficiency — the highest SLE standard",
    descriptionFr: "Démontrez une compétence de niveau C — le plus haut standard SLE",
    category: "sle",
    tier: "gold",
    xpReward: 1000,
    trigger: { type: "sle_level", level: "C" },
    iconKey: "medal",
    gradientFrom: "#D97B3D",
    gradientTo: "#FFD700",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECIAL BADGES — Events & milestones
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "xp_5000",
    name: "XP Legend",
    nameFr: "Légende XP",
    description: "Earn 5000 total XP",
    descriptionFr: "Gagnez 5000 XP au total",
    category: "special",
    tier: "platinum",
    xpReward: 500,
    trigger: { type: "xp_earned", count: 5000 },
    iconKey: "gem",
    gradientFrom: "#8B5CF6",
    gradientTo: "#EC4899",
  },
  {
    id: "founding_member",
    name: "Founding Member",
    nameFr: "Membre Fondateur",
    description: "Joined RusingÂcademy during the founding period",
    descriptionFr: "A rejoint RusingÂcademy pendant la période de fondation",
    category: "special",
    tier: "platinum",
    xpReward: 500,
    trigger: { type: "founding_member" },
    iconKey: "sparkles",
    gradientFrom: "#FFD700",
    gradientTo: "#C65A1E",
  },
  {
    id: "beta_tester",
    name: "Beta Tester",
    nameFr: "Testeur Bêta",
    description: "Participated in the beta testing program",
    descriptionFr: "A participé au programme de test bêta",
    category: "special",
    tier: "gold",
    xpReward: 300,
    trigger: { type: "beta_tester" },
    iconKey: "flask",
    gradientFrom: "#6366F1",
    gradientTo: "#8B5CF6",
  },
  {
    id: "early_bird",
    name: "Early Bird",
    nameFr: "Lève-Tôt",
    description: "Complete 5 activities before 8 AM",
    descriptionFr: "Complétez 5 activités avant 8h du matin",
    category: "special",
    tier: "bronze",
    xpReward: 75,
    trigger: { type: "slots_completed", count: 5 },
    iconKey: "sunrise",
    gradientFrom: "#F59E0B",
    gradientTo: "#FB923C",
  },
  {
    id: "night_owl",
    name: "Night Owl",
    nameFr: "Oiseau de Nuit",
    description: "Complete 5 activities after 10 PM",
    descriptionFr: "Complétez 5 activités après 22h",
    category: "special",
    tier: "bronze",
    xpReward: 75,
    trigger: { type: "slots_completed", count: 5 },
    iconKey: "moon",
    gradientFrom: "#1E3A8A",
    gradientTo: "#3B82F6",
  },
  {
    id: "weekend_warrior",
    name: "Weekend Warrior",
    nameFr: "Guerrier du Weekend",
    description: "Complete 10 activities on weekends",
    descriptionFr: "Complétez 10 activités le weekend",
    category: "special",
    tier: "silver",
    xpReward: 150,
    trigger: { type: "slots_completed", count: 10 },
    iconKey: "swords",
    gradientFrom: "#7C3AED",
    gradientTo: "#A855F7",
  },
  {
    id: "community_helper",
    name: "Community Helper",
    nameFr: "Aide Communautaire",
    description: "Help 5 fellow learners in the community",
    descriptionFr: "Aidez 5 collègues apprenants dans la communauté",
    category: "special",
    tier: "silver",
    xpReward: 200,
    trigger: { type: "slots_completed", count: 5 },
    iconKey: "users",
    gradientFrom: "#0EA5E9",
    gradientTo: "#06B6D4",
  },
  {
    id: "top_reviewer",
    name: "Top Reviewer",
    nameFr: "Meilleur Évaluateur",
    description: "Leave 10 course reviews",
    descriptionFr: "Laissez 10 évaluations de cours",
    category: "special",
    tier: "silver",
    xpReward: 150,
    trigger: { type: "slots_completed", count: 10 },
    iconKey: "message-star",
    gradientFrom: "#14B8A6",
    gradientTo: "#0D9488",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PATH COMPLETION BADGES — Awarded when a learner completes an entire Path
// ═══════════════════════════════════════════════════════════════════════════
export const PATH_COMPLETION_BADGES: BadgeDefinition[] = [
  {
    id: "path_a1_complete",
    name: "A1 Achiever",
    nameFr: "Réussite A1",
    description: "Complete the entire A1 Foundations Path",
    descriptionFr: "Complétez l'intégralité du Parcours A1 Fondations",
    category: "content",
    tier: "gold",
    xpReward: 1000,
    trigger: { type: "path_completed", pathId: 90007 },
    iconKey: "trophy-a1",
    gradientFrom: "#059669",
    gradientTo: "#10B981",
  },
  {
    id: "path_a2_complete",
    name: "A2 Master",
    nameFr: "Maître A2",
    description: "Complete the entire A2 Everyday Communication Path",
    descriptionFr: "Complétez l'intégralité du Parcours A2 Communication Quotidienne",
    category: "content",
    tier: "gold",
    xpReward: 1500,
    trigger: { type: "path_completed", pathId: 120002 },
    iconKey: "trophy-a2",
    gradientFrom: "#2563EB",
    gradientTo: "#3B82F6",
  },
  {
    id: "path_b1_complete",
    name: "B1 Champion",
    nameFr: "Champion B1",
    description: "Complete the entire B1 Operational French Path",
    descriptionFr: "Complétez l'intégralité du Parcours B1 Français Opérationnel",
    category: "content",
    tier: "gold",
    xpReward: 2000,
    trigger: { type: "path_completed", pathId: 120003 },
    iconKey: "trophy-b1",
    gradientFrom: "#7C3AED",
    gradientTo: "#8B5CF6",
  },
  {
    id: "path_b2_complete",
    name: "B2 Expert",
    nameFr: "Expert B2",
    description: "Complete the entire B2 Professional Mastery Path",
    descriptionFr: "Complétez l'intégralité du Parcours B2 Maîtrise Professionnelle",
    category: "content",
    tier: "platinum",
    xpReward: 2500,
    trigger: { type: "path_completed", pathId: 120004 },
    iconKey: "trophy-b2",
    gradientFrom: "#DC2626",
    gradientTo: "#EF4444",
  },
  {
    id: "path_c1_complete",
    name: "C1 Elite",
    nameFr: "Élite C1",
    description: "Complete the entire C1 Advanced Proficiency Path",
    descriptionFr: "Complétez l'intégralité du Parcours C1 Maîtrise Avancée",
    category: "content",
    tier: "platinum",
    xpReward: 3000,
    trigger: { type: "path_completed", pathId: 120005 },
    iconKey: "trophy-c1",
    gradientFrom: "#B45309",
    gradientTo: "#F59E0B",
  },
  {
    id: "path_exam_complete",
    name: "Exam Ready",
    nameFr: "Prêt pour l'Examen",
    description: "Complete the entire SLE/TEF Exam Preparation Path",
    descriptionFr: "Complétez l'intégralité du Parcours Préparation SLE/TEF",
    category: "sle",
    tier: "platinum",
    xpReward: 3500,
    trigger: { type: "path_completed", pathId: 120006 },
    iconKey: "trophy-exam",
    gradientFrom: "#0F172A",
    gradientTo: "#1E3A8A",
  },
  {
    id: "all_paths_complete",
    name: "Ultimate Learner",
    nameFr: "Apprenant Ultime",
    description: "Complete all 6 Learning Paths — the ultimate achievement",
    descriptionFr: "Complétez les 6 Parcours d'apprentissage — l'accomplissement ultime",
    category: "mastery",
    tier: "platinum",
    xpReward: 10000,
    trigger: { type: "all_paths_completed", count: 6 },
    iconKey: "crown-ultimate",
    gradientFrom: "#FFD700",
    gradientTo: "#C65A1E",
  },
  {
    id: "speed_learner",
    name: "Speed Learner",
    nameFr: "Apprenant Rapide",
    description: "Complete any Path within 30 days of enrollment",
    descriptionFr: "Complétez n'importe quel Parcours dans les 30 jours suivant l'inscription",
    category: "special",
    tier: "gold",
    xpReward: 1500,
    trigger: { type: "path_completed_fast", days: 30 },
    iconKey: "zap-fast",
    gradientFrom: "#F97316",
    gradientTo: "#FB923C",
  },
];

/** All badges combined (original 16 + 8 path completion = 24 total) */
export const ALL_BADGES: BadgeDefinition[] = [...BADGE_DEFINITIONS, ...PATH_COMPLETION_BADGES];

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** Get a badge definition by its ID */
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return ALL_BADGES.find((b) => b.id === id);
}

/** Get all badges in a category */
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return ALL_BADGES.filter((b) => b.category === category);
}

/** Get all badges by tier */
export function getBadgesByTier(tier: BadgeTier): BadgeDefinition[] {
  return ALL_BADGES.filter((b) => b.tier === tier);
}

/** Category display metadata */
export const CATEGORY_META: Record<BadgeCategory, { label: string; labelFr: string; icon: string; color: string }> = {
  content: { label: "Content", labelFr: "Contenu", icon: "book-open", color: "#0F3D3E" },
  streak: { label: "Streaks", labelFr: "Séries", icon: "flame", color: "#F97316" },
  mastery: { label: "Mastery", labelFr: "Maîtrise", icon: "brain", color: "#DC2626" },
  sle: { label: "SLE Levels", labelFr: "Niveaux SLE", icon: "award", color: "#2563EB" },
  special: { label: "Special", labelFr: "Spéciaux", icon: "sparkles", color: "#8B5CF6" },
};

/** Tier display metadata */
export const TIER_META: Record<BadgeTier, { label: string; labelFr: string; ringColor: string; bgGlow: string }> = {
  bronze: { label: "Bronze", labelFr: "Bronze", ringColor: "#CD7F32", bgGlow: "rgba(205,127,50,0.15)" },
  silver: { label: "Silver", labelFr: "Argent", ringColor: "#C0C0C0", bgGlow: "rgba(192,192,192,0.15)" },
  gold: { label: "Gold", labelFr: "Or", ringColor: "#FFD700", bgGlow: "rgba(255,215,0,0.15)" },
  platinum: { label: "Platinum", labelFr: "Platine", ringColor: "#E5E4E2", bgGlow: "rgba(229,228,226,0.2)" },
};
