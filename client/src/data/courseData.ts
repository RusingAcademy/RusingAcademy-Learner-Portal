// ============================================================
// RusingÂcademy Learning Portal — Complete Course Data
// ESL (English as a Second Language) + FSL (French as a Second Language)
// RusingAcademy — Barholex Media Inc.
// ============================================================

export type Program = "esl" | "fsl";

export interface LessonSlot {
  type: "hook" | "video" | "strategy" | "written" | "oral" | "quiz" | "coaching";
  title: string;
  duration: string;
  content: string;
}

export interface QuizQuestion {
  id: number;
  type: "multiple-choice" | "fill-in-the-blank";
  question: string;
  options?: string[];
  answer: number | string;
  feedback: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleFr: string;
  duration: string;
  xpReward: number;
  slots: LessonSlot[];
  quiz: QuizQuestion[];
  completed: boolean;
  progress: number;
}

export interface Module {
  id: number;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  lessons: Lesson[];
  badgeUrl: string;
  completed: boolean;
  progress: number;
  quizPassing: number;
}

export interface Path {
  id: string;
  number: string;
  title: string;
  titleFr: string;
  subtitle: string;
  subtitleFr: string;
  cefrLevel: string;
  coverUrl: string;
  badgeUrl: string;
  color: string;
  modules: Module[];
  totalLessons: number;
  totalActivities: number;
  completed: boolean;
  progress: number;
}

export interface ProgramData {
  id: Program;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  icon: string;
  color: string;
  paths: Path[];
}

// ============================================================
// CDN URLs for assets
// ============================================================
const CDN = {
  covers: {
    esl: {
      pathI: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/LfNIvRRvsqXNrFBz.jpg",
      pathII: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/BjSgiAyTvASWUHZv.jpg",
      pathIII: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/gvPZitcVZclugHVV.jpg",
      pathIV: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/hhKWnIpkycCnUWQV.jpg",
      pathV: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/DMPFqRvInardMbxT.jpg",
      pathVI: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/FdeOBYtEsqEakkAq.jpg",
    },
    fsl: {
      pathI: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/LfNIvRRvsqXNrFBz.jpg",
      pathII: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/BjSgiAyTvASWUHZv.jpg",
      pathIII: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/gvPZitcVZclugHVV.jpg",
      pathIV: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/TSVkENcoGpNhAalH.png",
      pathV: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/DMPFqRvInardMbxT.jpg",
      pathVI: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/BbHhILMXOCbnFiis.png",
    },
  },
  badges: {
    pathCompletion: [
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/TJsOpBaRhXPTDSXt.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/eAMHkSHFnafxsLaC.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/HmNNBAbpsUUrdDVS.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mkRAHOuXvrsjVqEt.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mhfGkDcRYipVFErb.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/EJjfkNPMUtaJSXao.png",
    ],
    modules: [
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/aHoYNMzoNtkFPUuE.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/bAfPZUwOHNmvaMRw.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/VQSCxdCequorZNlU.png",
      "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/AuMDFivVPZHUzukQ.png",
    ],
  },
};

// Helper to create quiz questions for a lesson
function createFormativeQuiz(lessonId: string, program: Program): QuizQuestion[] {
  // Each lesson has a 5-question formative quiz in SLOT 6
  // These are representative samples; real data would come from the markdown files
  return [];
}

// ============================================================
// FSL PROGRAM DATA — French as a Second Language
// ============================================================
const fslPaths: Path[] = [
  {
    id: "fsl-path-i",
    number: "I",
    title: "Foundations",
    titleFr: "Les Fondations",
    subtitle: "From Hesitation to Essential Communication",
    subtitleFr: "De l'hésitation à la communication essentielle",
    cefrLevel: "A1",
    coverUrl: CDN.covers.fsl.pathI,
    badgeUrl: CDN.badges.pathCompletion[0],
    color: "#2563eb",
    totalLessons: 16,
    totalActivities: 112,
    completed: false,
    progress: 0,
    modules: [
      {
        id: 1,
        title: "First Professional Steps",
        titleFr: "Premiers Pas Professionnels",
        description: "Build confidence in professional introductions and first encounters in French.",
        descriptionFr: "Développer la confiance dans les présentations professionnelles et les premières rencontres en français.",
        badgeUrl: CDN.badges.modules[0],
        completed: false,
        progress: 0,
        quizPassing: 80,
        lessons: [
          { id: "1.1", title: "Hello, My Name Is...", titleFr: "Bonjour, je m'appelle...", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "1.2", title: "My Office, My Team", titleFr: "Mon bureau, mon équipe", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "1.3", title: "Daily Routine", titleFr: "La routine quotidienne", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "1.4", title: "Asking Key Questions", titleFr: "Poser des questions clés", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 2,
        title: "Daily Communication",
        titleFr: "Communication Quotidienne",
        description: "Master everyday workplace communication in French.",
        descriptionFr: "Maîtriser la communication quotidienne au travail en français.",
        badgeUrl: CDN.badges.modules[1],
        completed: false,
        progress: 0,
        quizPassing: 80,
        lessons: [
          { id: "2.1", title: "On the Phone", titleFr: "Au téléphone", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "2.2", title: "Essential Emails", titleFr: "Les courriels essentiels", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "2.3", title: "Understanding Instructions", titleFr: "Comprendre des instructions", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "2.4", title: "Giving Simple Directions", titleFr: "Donner des directives simples", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 3,
        title: "Essential Interactions",
        titleFr: "Interactions Essentielles",
        description: "Navigate essential workplace interactions with confidence.",
        descriptionFr: "Naviguer les interactions essentielles au travail avec confiance.",
        badgeUrl: CDN.badges.modules[2],
        completed: false,
        progress: 0,
        quizPassing: 80,
        lessons: [
          { id: "3.1", title: "Making a Polite Request", titleFr: "Faire une demande polie", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "3.2", title: "Expressing Needs & Preferences", titleFr: "Exprimer besoins et préférences", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "3.3", title: "Coffee Break Chat", titleFr: "La pause café", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "3.4", title: "React & Respond", titleFr: "Réagir et répondre", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 4,
        title: "Towards Autonomy",
        titleFr: "Vers l'Autonomie",
        description: "Develop independence in French workplace communication.",
        descriptionFr: "Développer l'autonomie dans la communication professionnelle en français.",
        badgeUrl: CDN.badges.modules[3],
        completed: false,
        progress: 0,
        quizPassing: 80,
        lessons: [
          { id: "4.1", title: "Describing a Simple Problem", titleFr: "Décrire un problème simple", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "4.2", title: "Confirming & Verifying", titleFr: "Confirmer et vérifier", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "4.3", title: "Talking About Past Experience", titleFr: "Parler de son expérience passée", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "4.4", title: "Final Project", titleFr: "Projet final", duration: "50 min", xpReward: 150, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
    ],
  },
  {
    id: "fsl-path-ii",
    number: "II",
    title: "Everyday Fluency",
    titleFr: "Aisance Quotidienne",
    subtitle: "Building Confidence in Daily Professional French",
    subtitleFr: "Développer la confiance dans le français professionnel quotidien",
    cefrLevel: "A2",
    coverUrl: CDN.covers.fsl.pathII,
    badgeUrl: CDN.badges.pathCompletion[1],
    color: "#059669",
    totalLessons: 16,
    totalActivities: 112,
    completed: false,
    progress: 0,
    modules: [
      {
        id: 5, title: "Electronic Communication", titleFr: "Communication Électronique",
        description: "Master digital communication tools in French.", descriptionFr: "Maîtriser les outils de communication numérique en français.",
        badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "5.1", title: "Out-of-Office Email", titleFr: "Courriel d'absence", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "5.2", title: "Email Chains", titleFr: "Chaîne de courriels", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "5.3", title: "Voicemail", titleFr: "Message vocal", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "5.4", title: "Team Chat", titleFr: "Clavardage d'équipe", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 6, title: "Social Interactions", titleFr: "Interactions Sociales",
        description: "Navigate social situations in the workplace.", descriptionFr: "Naviguer les situations sociales au travail.",
        badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "6.1", title: "Invitations", titleFr: "Invitations", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "6.2", title: "Talking About the Weekend", titleFr: "Parler du weekend", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "6.3", title: "Personal Questions", titleFr: "Questions personnelles", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "6.4", title: "Offering Help", titleFr: "Offrir de l'aide", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 7, title: "Administrative Tasks", titleFr: "Tâches Administratives",
        description: "Handle administrative tasks in French.", descriptionFr: "Gérer les tâches administratives en français.",
        badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "7.1", title: "Booking a Room", titleFr: "Réserver une salle", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "7.2", title: "Service Notes", titleFr: "Notes de service", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "7.3", title: "Office Supplies", titleFr: "Fournitures de bureau", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "7.4", title: "Timesheet", titleFr: "Feuille de temps", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 8, title: "Finding Your Way", titleFr: "S'orienter",
        description: "Navigate physical and organizational spaces.", descriptionFr: "Se repérer dans les espaces physiques et organisationnels.",
        badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "8.1", title: "Building Directions", titleFr: "Directions dans l'immeuble", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "8.2", title: "Evacuation Plan", titleFr: "Plan d'évacuation", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "8.3", title: "Workstation", titleFr: "Poste de travail", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "8.4", title: "Public Transit", titleFr: "Transport en commun", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
    ],
  },
  {
    id: "fsl-path-iii",
    number: "III",
    title: "Operational French",
    titleFr: "Français Opérationnel",
    subtitle: "Professional Communication for the Workplace",
    subtitleFr: "Communication professionnelle pour le milieu de travail",
    cefrLevel: "B1",
    coverUrl: CDN.covers.fsl.pathIII,
    badgeUrl: CDN.badges.pathCompletion[2],
    color: "#d97706",
    totalLessons: 16,
    totalActivities: 112,
    completed: false,
    progress: 0,
    modules: [
      {
        id: 9, title: "Participating in Meetings", titleFr: "Participer aux Réunions",
        description: "Actively participate in French-language meetings.", descriptionFr: "Participer activement aux réunions en français.",
        badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "9.1", title: "Understanding the Agenda", titleFr: "Comprendre l'ordre du jour", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "9.2", title: "Giving Your Opinion", titleFr: "Donner son opinion", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "9.3", title: "Clarification Questions", titleFr: "Questions de clarification", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "9.4", title: "Summarizing Action Items", titleFr: "Résumer les points d'action", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 10, title: "Written Communication", titleFr: "Communication Écrite",
        description: "Produce professional written documents in French.", descriptionFr: "Produire des documents écrits professionnels en français.",
        badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "10.1", title: "Writing Meeting Minutes", titleFr: "Rédiger un compte rendu", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "10.2", title: "Requesting a Revision", titleFr: "Demander une révision", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "10.3", title: "Writing a Simple Report", titleFr: "Écrire un rapport simple", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "10.4", title: "Professional Biography", titleFr: "Biographie professionnelle", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 11, title: "Simple Presentations", titleFr: "Présentations Simples",
        description: "Deliver clear presentations in French.", descriptionFr: "Livrer des présentations claires en français.",
        badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "11.1", title: "Presenting Data & Figures", titleFr: "Données chiffrées", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "11.2", title: "Process & Steps", titleFr: "Processus et étapes", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "11.3", title: "Audience Questions", titleFr: "Questions de l'auditoire", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "11.4", title: "Concluding & Thanking", titleFr: "Conclure et remercier", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 12, title: "Negotiation & Persuasion", titleFr: "Négociation et Persuasion",
        description: "Negotiate and persuade effectively in French.", descriptionFr: "Négocier et persuader efficacement en français.",
        badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "12.1", title: "Expressing a Need", titleFr: "Exprimer un besoin", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "12.2", title: "Negotiating a Deadline", titleFr: "Négocier une échéance", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "12.3", title: "Proposal Advantages", titleFr: "Avantages d'une proposition", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "12.4", title: "Managing Disagreement", titleFr: "Gérer un désaccord", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
    ],
  },
  {
    id: "fsl-path-iv",
    number: "IV",
    title: "Strategic Expression",
    titleFr: "Expression Stratégique",
    subtitle: "Advanced Professional Communication",
    subtitleFr: "Communication professionnelle avancée",
    cefrLevel: "B2",
    coverUrl: CDN.covers.fsl.pathIV,
    badgeUrl: CDN.badges.pathCompletion[3],
    color: "#7c3aed",
    totalLessons: 16,
    totalActivities: 112,
    completed: false,
    progress: 0,
    modules: [
      {
        id: 13, title: "Communication & Influence", titleFr: "Communication et Influence",
        description: "Lead through effective communication.", descriptionFr: "Diriger par une communication efficace.",
        badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "13.1", title: "Leading a Meeting", titleFr: "Animer une réunion", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "13.2", title: "Complex Arguments", titleFr: "Présenter un argumentaire complexe", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "13.3", title: "Information Notes", titleFr: "Rédiger une note d'information", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "13.4", title: "Conducting an Interview", titleFr: "Mener un entretien d'embauche", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 14, title: "Project Management", titleFr: "Gestion de Projets",
        description: "Manage projects in French.", descriptionFr: "Gérer des projets en français.",
        badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "14.1", title: "Presenting a Project Plan", titleFr: "Présenter un plan de projet", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "14.2", title: "Writing a Progress Report", titleFr: "Rédiger un rapport d'étape", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "14.3", title: "Brainstorming Session", titleFr: "Animer une séance de remue-méninges", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "14.4", title: "Stakeholder Communication", titleFr: "Communiquer avec les parties prenantes", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 15, title: "Sensitive Communication", titleFr: "Communication Sensible",
        description: "Handle sensitive workplace situations.", descriptionFr: "Gérer les situations sensibles au travail.",
        badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "15.1", title: "Constructive Feedback", titleFr: "Donner une rétroaction constructive", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "15.2", title: "Handling a Complaint", titleFr: "Gérer une plainte", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "15.3", title: "Organizational Change", titleFr: "Communiquer un changement organisationnel", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "15.4", title: "Negotiating a Compromise", titleFr: "Négocier un compromis", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 16, title: "Leadership & Influence", titleFr: "Leadership et Influence",
        description: "Lead and influence through language.", descriptionFr: "Diriger et influencer par la langue.",
        badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "16.1", title: "Delegating a Task", titleFr: "Déléguer une tâche", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "16.2", title: "Strategic Vision", titleFr: "Présenter une vision stratégique", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "16.3", title: "Leading a Debate", titleFr: "Animer un débat", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "16.4", title: "Closing a Meeting", titleFr: "Conclure une réunion", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
    ],
  },
  {
    id: "fsl-path-v",
    number: "V",
    title: "Professional Mastery",
    titleFr: "Maîtrise Professionnelle",
    subtitle: "Executive-Level French Communication",
    subtitleFr: "Communication en français de niveau exécutif",
    cefrLevel: "C1",
    coverUrl: CDN.covers.fsl.pathV,
    badgeUrl: CDN.badges.pathCompletion[4],
    color: "#dc2626",
    totalLessons: 16,
    totalActivities: 112,
    completed: false,
    progress: 0,
    modules: [
      {
        id: 17, title: "Leadership & Vision", titleFr: "Leadership et Vision",
        description: "Communicate vision at the executive level.", descriptionFr: "Communiquer une vision au niveau exécutif.",
        badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "17.1", title: "Senior Management Vision", titleFr: "Vision de la haute direction", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "17.2", title: "Cabinet Memorandum", titleFr: "Mémoire au Cabinet", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "17.3", title: "Interdepartmental Committee", titleFr: "Comité interministériel", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "17.4", title: "Public Consultation", titleFr: "Consultation publique", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 18, title: "Analysis & Synthesis", titleFr: "Analyse et Synthèse",
        description: "Analyze and synthesize complex information.", descriptionFr: "Analyser et synthétiser des informations complexes.",
        badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "18.1", title: "Policy Documents", titleFr: "Documents de politique", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "18.2", title: "Comparative Analysis", titleFr: "Analyse comparative", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "18.3", title: "Research Report", titleFr: "Rapport de recherche", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "18.4", title: "Analysis Results", titleFr: "Résultats d'analyse", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 19, title: "Crisis Communication", titleFr: "Communication de Crise",
        description: "Manage crisis communication effectively.", descriptionFr: "Gérer efficacement la communication de crise.",
        badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "19.1", title: "Emergency Communiqué", titleFr: "Communiqué d'urgence", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "19.2", title: "Press Briefing", titleFr: "Point de presse", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "19.3", title: "Difficult Interview", titleFr: "Entrevue difficile", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "19.4", title: "Internal Stakeholders", titleFr: "Parties prenantes internes", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 20, title: "Negotiation & Diplomacy", titleFr: "Négociation et Diplomatie",
        description: "Master diplomatic negotiation in French.", descriptionFr: "Maîtriser la négociation diplomatique en français.",
        badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "20.1", title: "Reservations & Objections", titleFr: "Réserves et objections", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "20.2", title: "Finding Common Ground", titleFr: "Compromis et terrain d'entente", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "20.3", title: "Multilateral Meeting", titleFr: "Rencontre multilatérale", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "20.4", title: "Meeting Minutes", titleFr: "Compte rendu", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
    ],
  },
  {
    id: "fsl-path-vi",
    number: "VI",
    title: "SLE Mastery",
    titleFr: "Maîtrise ÉLS",
    subtitle: "SLE Exam Preparation & Mastery",
    subtitleFr: "Préparation et maîtrise de l'ÉLS",
    cefrLevel: "C1+",
    coverUrl: CDN.covers.fsl.pathVI,
    badgeUrl: CDN.badges.pathCompletion[5],
    color: "#0f172a",
    totalLessons: 16,
    totalActivities: 112,
    completed: false,
    progress: 0,
    modules: [
      {
        id: 21, title: "Reading Comprehension", titleFr: "Compréhension Écrite",
        description: "Master reading comprehension for the SLE.", descriptionFr: "Maîtriser la compréhension écrite pour l'ÉLS.",
        badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "21.1", title: "Speed Reading Strategies", titleFr: "Stratégies de lecture rapide", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "21.2", title: "Decoding Question Types", titleFr: "Décoder les types de questions", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "21.3", title: "Administrative Texts", titleFr: "Comprendre les textes administratifs", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "21.4", title: "Practice Test", titleFr: "Réussir le test blanc", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 22, title: "Written Expression", titleFr: "Expression Écrite",
        description: "Excel in written expression for the SLE.", descriptionFr: "Exceller en expression écrite pour l'ÉLS.",
        badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "22.1", title: "Timed Email Writing", titleFr: "Rédiger un courriel sous contrainte", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "22.2", title: "Service Memo", titleFr: "Produire une note de service", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "22.3", title: "Argumentative Text", titleFr: "Rédiger un texte argumentatif", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "22.4", title: "Written Expression Performance", titleFr: "Performance en expression écrite", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 23, title: "Oral Comprehension", titleFr: "Compréhension Orale",
        description: "Master oral comprehension for the SLE.", descriptionFr: "Maîtriser la compréhension orale pour l'ÉLS.",
        badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "23.1", title: "Active & Predictive Listening", titleFr: "Écoute active et prédictive", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "23.2", title: "Strategic Note-Taking", titleFr: "Prise de notes stratégique", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "23.3", title: "Implicit Inference", titleFr: "Inférence implicite", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "23.4", title: "Mental Synthesis", titleFr: "Synthèse mentale", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 24, title: "Oral Expression", titleFr: "Expression Orale",
        description: "Master oral expression for the SLE.", descriptionFr: "Maîtriser l'expression orale pour l'ÉLS.",
        badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "24.1", title: "Fluency & Rhythm", titleFr: "Fluidité et rythme", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "24.2", title: "Lexical Precision", titleFr: "Précision lexicale", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "24.3", title: "Speech Structure", titleFr: "Structure du discours", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "24.4", title: "Interaction & Repair", titleFr: "Interaction et réparation", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
    ],
  },
];

// ============================================================
// ESL PROGRAM DATA — English as a Second Language
// ============================================================
const eslPaths: Path[] = [
  {
    id: "esl-path-i",
    number: "I",
    title: "Foundations",
    titleFr: "Les Fondations",
    subtitle: "From Hesitation to Essential Communication",
    subtitleFr: "De l'hésitation à la communication essentielle",
    cefrLevel: "A1",
    coverUrl: CDN.covers.esl.pathI,
    badgeUrl: CDN.badges.pathCompletion[0],
    color: "#2563eb",
    totalLessons: 16,
    totalActivities: 112,
    completed: false,
    progress: 0,
    modules: [
      {
        id: 1, title: "First Impressions", titleFr: "Premières Impressions",
        description: "Build confidence in professional introductions.", descriptionFr: "Développer la confiance dans les présentations professionnelles.",
        badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "1.1", title: "Hello, My Name Is...", titleFr: "Bonjour, je m'appelle...", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "1.2", title: "My Office, My Team", titleFr: "Mon bureau, mon équipe", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "1.3", title: "Numbers, Dates & Time", titleFr: "Chiffres, dates et heure", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "1.4", title: "Can You Help Me?", titleFr: "Pouvez-vous m'aider?", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 2, title: "Your Work Environment", titleFr: "Votre Environnement de Travail",
        description: "Describe your professional environment.", descriptionFr: "Décrire votre environnement professionnel.",
        badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "2.1", title: "What Do You Do?", titleFr: "Que faites-vous?", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "2.2", title: "Our Department", titleFr: "Notre ministère", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "2.3", title: "Office Supplies & Technology", titleFr: "Fournitures et technologie", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "2.4", title: "Health & Safety at Work", titleFr: "Santé et sécurité au travail", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 3, title: "Daily Routines", titleFr: "Routines Quotidiennes",
        description: "Manage time and daily interactions.", descriptionFr: "Gérer le temps et les interactions quotidiennes.",
        badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "3.1", title: "My Typical Day", titleFr: "Ma journée typique", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "3.2", title: "Making Appointments", titleFr: "Prendre rendez-vous", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "3.3", title: "Breaks & Small Talk", titleFr: "Pauses et conversations informelles", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "3.4", title: "End of the Day", titleFr: "Fin de journée", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
      {
        id: 4, title: "Getting Help", titleFr: "Obtenir de l'Aide",
        description: "Ask for information and clarification.", descriptionFr: "Demander des informations et des clarifications.",
        badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80,
        lessons: [
          { id: "4.1", title: "I Don't Understand", titleFr: "Je ne comprends pas", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "4.2", title: "Where Is the...?", titleFr: "Où se trouve le...?", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "4.3", title: "I Need Help With...", titleFr: "J'ai besoin d'aide avec...", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
          { id: "4.4", title: "Thank You & Follow Up", titleFr: "Merci et suivi", duration: "50 min", xpReward: 100, slots: [], quiz: [], completed: false, progress: 0 },
        ],
      },
    ],
  },
  {
    id: "esl-path-ii", number: "II", title: "Everyday Fluency", titleFr: "Aisance Quotidienne",
    subtitle: "Building Confidence in Daily Professional English", subtitleFr: "Développer la confiance dans l'anglais professionnel quotidien",
    cefrLevel: "A2", coverUrl: CDN.covers.esl.pathII, badgeUrl: CDN.badges.pathCompletion[1], color: "#059669",
    totalLessons: 16, totalActivities: 112, completed: false, progress: 0,
    modules: [
      { id: 5, title: "Digital Workspace", titleFr: "Espace Numérique", description: "Navigate digital tools in English.", descriptionFr: "Naviguer les outils numériques en anglais.", badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "5.1", title: "Email Etiquette", titleFr: "Étiquette courriel", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "5.2", title: "Virtual Meetings", titleFr: "Réunions virtuelles", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "5.3", title: "Instant Messaging", titleFr: "Messagerie instantanée", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "5.4", title: "Shared Documents", titleFr: "Documents partagés", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 6, title: "On the Phone", titleFr: "Au Téléphone", description: "Handle phone calls professionally.", descriptionFr: "Gérer les appels téléphoniques professionnellement.", badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "6.1", title: "Answering Calls", titleFr: "Répondre aux appels", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "6.2", title: "Transferring & Messages", titleFr: "Transferts et messages", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "6.3", title: "Conference Calls", titleFr: "Conférences téléphoniques", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "6.4", title: "Voicemail", titleFr: "Messagerie vocale", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 7, title: "Team Meetings", titleFr: "Réunions d'Équipe", description: "Participate in team meetings.", descriptionFr: "Participer aux réunions d'équipe.", badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "7.1", title: "Meeting Agenda", titleFr: "Ordre du jour", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "7.2", title: "Sharing Ideas", titleFr: "Partager des idées", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "7.3", title: "Taking Notes", titleFr: "Prendre des notes", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "7.4", title: "Action Items", titleFr: "Points d'action", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 8, title: "Your Contributions", titleFr: "Vos Contributions", description: "Make meaningful contributions.", descriptionFr: "Apporter des contributions significatives.", badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "8.1", title: "Presenting Updates", titleFr: "Présenter des mises à jour", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "8.2", title: "Asking Questions", titleFr: "Poser des questions", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "8.3", title: "Giving Feedback", titleFr: "Donner de la rétroaction", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "8.4", title: "Summarizing Decisions", titleFr: "Résumer les décisions", duration: "50 min", xpReward: 120, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
    ],
  },
  {
    id: "esl-path-iii", number: "III", title: "Operational English", titleFr: "Anglais Opérationnel",
    subtitle: "Professional Communication for the Workplace", subtitleFr: "Communication professionnelle pour le milieu de travail",
    cefrLevel: "B1", coverUrl: CDN.covers.esl.pathIII, badgeUrl: CDN.badges.pathCompletion[2], color: "#d97706",
    totalLessons: 16, totalActivities: 112, completed: false, progress: 0,
    modules: [
      { id: 9, title: "Planning & Organizing", titleFr: "Planification et Organisation", description: "Plan and organize in English.", descriptionFr: "Planifier et organiser en anglais.", badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "9.1", title: "Project Planning", titleFr: "Planification de projet", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "9.2", title: "Setting Priorities", titleFr: "Établir les priorités", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "9.3", title: "Scheduling", titleFr: "Planification", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "9.4", title: "Resource Management", titleFr: "Gestion des ressources", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 10, title: "Feedback", titleFr: "Rétroaction", description: "Give and receive feedback.", descriptionFr: "Donner et recevoir de la rétroaction.", badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "10.1", title: "Positive Feedback", titleFr: "Rétroaction positive", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "10.2", title: "Constructive Criticism", titleFr: "Critique constructive", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "10.3", title: "Performance Reviews", titleFr: "Évaluations de rendement", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "10.4", title: "Self-Assessment", titleFr: "Auto-évaluation", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 11, title: "Public Service Culture", titleFr: "Culture de la Fonction Publique", description: "Navigate public service culture.", descriptionFr: "Naviguer la culture de la fonction publique.", badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "11.1", title: "Values & Ethics", titleFr: "Valeurs et éthique", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "11.2", title: "Diversity & Inclusion", titleFr: "Diversité et inclusion", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "11.3", title: "Official Languages", titleFr: "Langues officielles", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "11.4", title: "Workplace Wellness", titleFr: "Bien-être au travail", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 12, title: "Career Path", titleFr: "Parcours de Carrière", description: "Advance your career in English.", descriptionFr: "Avancer votre carrière en anglais.", badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "12.1", title: "Job Applications", titleFr: "Candidatures", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "12.2", title: "Interview Skills", titleFr: "Compétences d'entrevue", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "12.3", title: "Networking", titleFr: "Réseautage", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "12.4", title: "SLE Preparation Level B", titleFr: "Préparation ÉLS Niveau B", duration: "50 min", xpReward: 140, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
    ],
  },
  {
    id: "esl-path-iv", number: "IV", title: "Strategic Expression", titleFr: "Expression Stratégique",
    subtitle: "Advanced Professional Communication", subtitleFr: "Communication professionnelle avancée",
    cefrLevel: "B2", coverUrl: CDN.covers.esl.pathIV, badgeUrl: CDN.badges.pathCompletion[3], color: "#7c3aed",
    totalLessons: 16, totalActivities: 112, completed: false, progress: 0,
    modules: [
      { id: 13, title: "Leading Meetings", titleFr: "Diriger des Réunions", description: "Lead meetings effectively.", descriptionFr: "Diriger des réunions efficacement.", badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "13.1", title: "Opening & Agenda", titleFr: "Ouverture et ordre du jour", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "13.2", title: "Facilitating Discussion", titleFr: "Faciliter la discussion", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "13.3", title: "Managing Conflict", titleFr: "Gérer les conflits", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "13.4", title: "Closing & Follow-Up", titleFr: "Clôture et suivi", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 14, title: "Writing for Impact", titleFr: "Rédaction Percutante", description: "Write impactful documents.", descriptionFr: "Rédiger des documents percutants.", badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "14.1", title: "Briefing Notes", titleFr: "Notes d'information", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "14.2", title: "Policy Proposals", titleFr: "Propositions de politique", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "14.3", title: "Executive Summaries", titleFr: "Résumés exécutifs", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "14.4", title: "Persuasive Writing", titleFr: "Rédaction persuasive", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 15, title: "Presenting with Confidence", titleFr: "Présenter avec Confiance", description: "Deliver confident presentations.", descriptionFr: "Livrer des présentations avec confiance.", badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "15.1", title: "Structuring a Presentation", titleFr: "Structurer une présentation", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "15.2", title: "Visual Aids", titleFr: "Supports visuels", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "15.3", title: "Handling Q&A", titleFr: "Gérer les questions", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "15.4", title: "Storytelling", titleFr: "L'art du récit", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 16, title: "Negotiation & Persuasion", titleFr: "Négociation et Persuasion", description: "Negotiate and persuade effectively.", descriptionFr: "Négocier et persuader efficacement.", badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "16.1", title: "Building Rapport", titleFr: "Établir un rapport", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "16.2", title: "Win-Win Solutions", titleFr: "Solutions gagnant-gagnant", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "16.3", title: "Handling Objections", titleFr: "Gérer les objections", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "16.4", title: "Closing Deals", titleFr: "Conclure des ententes", duration: "50 min", xpReward: 160, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
    ],
  },
  {
    id: "esl-path-v", number: "V", title: "Professional Mastery", titleFr: "Maîtrise Professionnelle",
    subtitle: "Executive-Level English Communication", subtitleFr: "Communication en anglais de niveau exécutif",
    cefrLevel: "C1", coverUrl: CDN.covers.esl.pathV, badgeUrl: CDN.badges.pathCompletion[4], color: "#dc2626",
    totalLessons: 16, totalActivities: 112, completed: false, progress: 0,
    modules: [
      { id: 17, title: "Managing People & Performance", titleFr: "Gestion des Personnes et du Rendement", description: "Manage teams effectively.", descriptionFr: "Gérer les équipes efficacement.", badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "17.1", title: "Performance Conversations", titleFr: "Conversations de rendement", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "17.2", title: "Talent Development", titleFr: "Développement des talents", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "17.3", title: "Difficult Conversations", titleFr: "Conversations difficiles", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "17.4", title: "Team Building", titleFr: "Consolidation d'équipe", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 18, title: "Interdepartmental Collaboration", titleFr: "Collaboration Interministérielle", description: "Collaborate across departments.", descriptionFr: "Collaborer entre ministères.", badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "18.1", title: "Cross-Functional Teams", titleFr: "Équipes interfonctionnelles", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "18.2", title: "Stakeholder Management", titleFr: "Gestion des parties prenantes", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "18.3", title: "Joint Initiatives", titleFr: "Initiatives conjointes", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "18.4", title: "Reporting Up", titleFr: "Rapporter à la direction", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 19, title: "Policy & Legislation", titleFr: "Politique et Législation", description: "Navigate policy and legislation.", descriptionFr: "Naviguer la politique et la législation.", badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "19.1", title: "Policy Analysis", titleFr: "Analyse de politique", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "19.2", title: "Legislative Language", titleFr: "Langage législatif", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "19.3", title: "Regulatory Framework", titleFr: "Cadre réglementaire", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "19.4", title: "Consultation Processes", titleFr: "Processus de consultation", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 20, title: "Crisis Communication", titleFr: "Communication de Crise", description: "Manage crisis communication.", descriptionFr: "Gérer la communication de crise.", badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "20.1", title: "Emergency Response", titleFr: "Réponse d'urgence", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "20.2", title: "Media Relations", titleFr: "Relations médiatiques", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "20.3", title: "Internal Communication", titleFr: "Communication interne", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "20.4", title: "Recovery & Lessons Learned", titleFr: "Rétablissement et leçons apprises", duration: "50 min", xpReward: 180, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
    ],
  },
  {
    id: "esl-path-vi", number: "VI", title: "Executive Leadership", titleFr: "Leadership Exécutif",
    subtitle: "C-Suite Communication Excellence", subtitleFr: "Excellence en communication de la haute direction",
    cefrLevel: "C1+", coverUrl: CDN.covers.esl.pathVI, badgeUrl: CDN.badges.pathCompletion[5], color: "#0f172a",
    totalLessons: 16, totalActivities: 112, completed: false, progress: 0,
    modules: [
      { id: 21, title: "Strategic Leadership", titleFr: "Leadership Stratégique", description: "Lead strategically in English.", descriptionFr: "Diriger stratégiquement en anglais.", badgeUrl: CDN.badges.modules[0], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "21.1", title: "Executive Decision-Making", titleFr: "Prise de décision exécutive", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "21.2", title: "Vision Communication", titleFr: "Communication de la vision", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "21.3", title: "Strategic Communication", titleFr: "Communication stratégique", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "21.4", title: "Leading Organizational Change", titleFr: "Diriger le changement organisationnel", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 22, title: "Executive Presence", titleFr: "Présence Exécutive", description: "Develop executive presence.", descriptionFr: "Développer la présence exécutive.", badgeUrl: CDN.badges.modules[1], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "22.1", title: "Gravitas & Authority", titleFr: "Gravitas et autorité", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "22.2", title: "Board Presentations", titleFr: "Présentations au conseil", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "22.3", title: "Media Appearances", titleFr: "Apparitions médiatiques", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "22.4", title: "Thought Leadership", titleFr: "Leadership intellectuel", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 23, title: "Thought Leadership", titleFr: "Leadership Intellectuel", description: "Establish thought leadership.", descriptionFr: "Établir un leadership intellectuel.", badgeUrl: CDN.badges.modules[2], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "23.1", title: "Publishing & Speaking", titleFr: "Publication et prise de parole", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "23.2", title: "Industry Influence", titleFr: "Influence dans l'industrie", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "23.3", title: "Mentoring & Coaching", titleFr: "Mentorat et coaching", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "23.4", title: "Building Legacy", titleFr: "Bâtir un héritage", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
      { id: 24, title: "Legacy & Influence", titleFr: "Héritage et Influence", description: "Create lasting impact.", descriptionFr: "Créer un impact durable.", badgeUrl: CDN.badges.modules[3], completed: false, progress: 0, quizPassing: 80, lessons: [
        { id: "24.1", title: "Succession Planning", titleFr: "Planification de la relève", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "24.2", title: "Knowledge Transfer", titleFr: "Transfert de connaissances", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "24.3", title: "Institutional Memory", titleFr: "Mémoire institutionnelle", duration: "50 min", xpReward: 200, slots: [], quiz: [], completed: false, progress: 0 },
        { id: "24.4", title: "Final Capstone", titleFr: "Projet final intégrateur", duration: "50 min", xpReward: 250, slots: [], quiz: [], completed: false, progress: 0 },
      ]},
    ],
  },
];

// ============================================================
// PROGRAM DEFINITIONS
// ============================================================
export const programs: ProgramData[] = [
  {
    id: "fsl",
    title: "French as a Second Language",
    titleFr: "Français langue seconde",
    description: "Master French for the Canadian public service. Prepare for the SLE with 6 comprehensive Paths from A1 to C1+.",
    descriptionFr: "Maîtrisez le français pour la fonction publique canadienne. Préparez-vous à l'ÉLS avec 6 parcours complets de A1 à C1+.",
    icon: "🇫🇷",
    color: "#2563eb",
    paths: fslPaths,
  },
  {
    id: "esl",
    title: "English as a Second Language",
    titleFr: "Anglais langue seconde",
    description: "Master English for the Canadian public service. Build professional communication skills from A1 to C1+.",
    descriptionFr: "Maîtrisez l'anglais pour la fonction publique canadienne. Développez vos compétences en communication professionnelle de A1 à C1+.",
    icon: "🇬🇧",
    color: "#059669",
    paths: eslPaths,
  },
];

// ============================================================
// GAMIFICATION DATA
// ============================================================
export interface GamificationProfile {
  totalXP: number;
  level: number;
  levelTitle: string;
  streak: number;
  longestStreak: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  badges: string[];
  weeklyGoal: number;
  weeklyProgress: number;
}

export const gamificationProfile: GamificationProfile = {
  totalXP: 2450,
  level: 5,
  levelTitle: "Dedicated Learner",
  streak: 7,
  longestStreak: 14,
  lessonsCompleted: 18,
  quizzesPassed: 12,
  badges: ["first-lesson", "first-quiz", "week-streak", "module-complete"],
  weeklyGoal: 5,
  weeklyProgress: 3,
};

export const levelTitles: Record<number, string> = {
  1: "Newcomer",
  2: "Explorer",
  3: "Apprentice",
  4: "Practitioner",
  5: "Dedicated Learner",
  6: "Skilled Communicator",
  7: "Advanced Speaker",
  8: "Expert",
  9: "Master",
  10: "Champion",
};

export function getXPForLevel(level: number): number {
  return level * 500;
}

export function getLevelFromXP(xp: number): number {
  return Math.min(10, Math.floor(xp / 500) + 1);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getProgramById(id: Program): ProgramData | undefined {
  return programs.find((p) => p.id === id);
}

export function getPathById(programId: Program, pathId: string): Path | undefined {
  const program = getProgramById(programId);
  return program?.paths.find((p) => p.id === pathId);
}

export function getModuleById(programId: Program, pathId: string, moduleId: number): Module | undefined {
  const path = getPathById(programId, pathId);
  return path?.modules.find((m) => m.id === moduleId);
}

export function getLessonById(programId: Program, pathId: string, moduleId: number, lessonId: string): Lesson | undefined {
  const mod = getModuleById(programId, pathId, moduleId);
  return mod?.lessons.find((l) => l.id === lessonId);
}

export function getTotalStats(programId: Program) {
  const program = getProgramById(programId);
  if (!program) return { paths: 0, modules: 0, lessons: 0, activities: 0 };
  const paths = program.paths.length;
  const modules = program.paths.reduce((sum, p) => sum + p.modules.length, 0);
  const lessons = program.paths.reduce((sum, p) => sum + p.totalLessons, 0);
  const activities = program.paths.reduce((sum, p) => sum + p.totalActivities, 0);
  return { paths, modules, lessons, activities };
}
