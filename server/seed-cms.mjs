/**
 * seed-cms.mjs — Migrate all hardcoded course content into the CMS database
 * 
 * Reads courseData.ts (programs, paths, modules, lessons) and
 * lessonContent.ts / eslLessonContent.ts (7-slot content + quizzes)
 * then inserts everything into the cms_* tables.
 * 
 * Usage: node server/seed-cms.mjs
 */
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

// Parse DATABASE_URL
function parseDbUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || "4000"),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    ssl: { rejectUnauthorized: true },
  };
}

// ═══════════════════════════════════════════════════════════
// HARDCODED DATA — extracted from courseData.ts
// We replicate the data here to avoid TypeScript compilation
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// PROGRAMS
// ═══════════════════════════════════════════════════════════
const PROGRAMS = [
  {
    slug: "fsl",
    title: "French as a Second Language",
    titleFr: "Français langue seconde",
    description: "Master French for the Canadian public service. Prepare for the SLE with 6 comprehensive Paths from A1 to C1+.",
    descriptionFr: "Maîtrisez le français pour la fonction publique canadienne. Préparez-vous à l'ÉLS avec 6 parcours complets de A1 à C1+.",
    icon: "🇫🇷",
    color: "#2563eb",
  },
  {
    slug: "esl",
    title: "English as a Second Language",
    titleFr: "Anglais langue seconde",
    description: "Master English for the Canadian public service. Build professional communication skills from A1 to C1+.",
    descriptionFr: "Maîtrisez l'anglais pour la fonction publique canadienne. Développez vos compétences en communication professionnelle de A1 à C1+.",
    icon: "🇬🇧",
    color: "#059669",
  },
];

// ═══════════════════════════════════════════════════════════
// FSL PATHS (6 paths, 24 modules, 96 lessons)
// ═══════════════════════════════════════════════════════════
const FSL_PATHS = [
  {
    slug: "fsl-path-i", number: "I", title: "Foundations", titleFr: "Les Fondations",
    subtitle: "From Hesitation to Essential Communication", subtitleFr: "De l'hésitation à la communication essentielle",
    cefrLevel: "A1", color: "#2563eb", coverUrl: CDN.covers.fsl.pathI, badgeUrl: CDN.badges.pathCompletion[0],
    modules: [
      { title: "First Impressions", titleFr: "Premières Impressions", description: "Build confidence in professional introductions.", descriptionFr: "Développer la confiance dans les présentations professionnelles.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "1.1", title: "Bonjour, je m'appelle...", titleFr: "Bonjour, je m'appelle...", xp: 100 },
          { num: "1.2", title: "Mon bureau, mon équipe", titleFr: "Mon bureau, mon équipe", xp: 100 },
          { num: "1.3", title: "Chiffres, dates et heure", titleFr: "Chiffres, dates et heure", xp: 100 },
          { num: "1.4", title: "Pouvez-vous m'aider?", titleFr: "Pouvez-vous m'aider?", xp: 100 },
        ]
      },
      { title: "Your Work Environment", titleFr: "Votre Environnement de Travail", description: "Describe your professional environment.", descriptionFr: "Décrire votre environnement professionnel.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "2.1", title: "Que faites-vous?", titleFr: "Que faites-vous?", xp: 100 },
          { num: "2.2", title: "Notre ministère", titleFr: "Notre ministère", xp: 100 },
          { num: "2.3", title: "Fournitures et technologie", titleFr: "Fournitures et technologie", xp: 100 },
          { num: "2.4", title: "Santé et sécurité au travail", titleFr: "Santé et sécurité au travail", xp: 100 },
        ]
      },
      { title: "Daily Routines", titleFr: "Routines Quotidiennes", description: "Manage time and daily interactions.", descriptionFr: "Gérer le temps et les interactions quotidiennes.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "3.1", title: "Ma journée typique", titleFr: "Ma journée typique", xp: 100 },
          { num: "3.2", title: "Prendre rendez-vous", titleFr: "Prendre rendez-vous", xp: 100 },
          { num: "3.3", title: "Pauses et conversations informelles", titleFr: "Pauses et conversations informelles", xp: 100 },
          { num: "3.4", title: "Fin de journée", titleFr: "Fin de journée", xp: 100 },
        ]
      },
      { title: "Getting Help", titleFr: "Obtenir de l'Aide", description: "Develop independence in French workplace communication.", descriptionFr: "Développer l'autonomie dans la communication professionnelle en français.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "4.1", title: "Describing a Simple Problem", titleFr: "Décrire un problème simple", xp: 100 },
          { num: "4.2", title: "Confirming & Verifying", titleFr: "Confirmer et vérifier", xp: 100 },
          { num: "4.3", title: "Talking About Past Experience", titleFr: "Parler de son expérience passée", xp: 100 },
          { num: "4.4", title: "Final Project", titleFr: "Projet final", xp: 150 },
        ]
      },
    ]
  },
  {
    slug: "fsl-path-ii", number: "II", title: "Everyday Fluency", titleFr: "Aisance Quotidienne",
    subtitle: "Building Confidence in Daily Professional French", subtitleFr: "Développer la confiance dans le français professionnel quotidien",
    cefrLevel: "A2", color: "#059669", coverUrl: CDN.covers.fsl.pathII, badgeUrl: CDN.badges.pathCompletion[1],
    modules: [
      { title: "Electronic Communication", titleFr: "Communication Électronique", description: "Master digital communication tools in French.", descriptionFr: "Maîtriser les outils de communication numérique en français.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "5.1", title: "Out-of-Office Email", titleFr: "Courriel d'absence", xp: 120 },
          { num: "5.2", title: "Email Chains", titleFr: "Chaîne de courriels", xp: 120 },
          { num: "5.3", title: "Voicemail", titleFr: "Message vocal", xp: 120 },
          { num: "5.4", title: "Team Chat", titleFr: "Clavardage d'équipe", xp: 120 },
        ]
      },
      { title: "Social Interactions", titleFr: "Interactions Sociales", description: "Navigate social situations in the workplace.", descriptionFr: "Naviguer les situations sociales au travail.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "6.1", title: "Invitations", titleFr: "Invitations", xp: 120 },
          { num: "6.2", title: "Talking About the Weekend", titleFr: "Parler du weekend", xp: 120 },
          { num: "6.3", title: "Personal Questions", titleFr: "Questions personnelles", xp: 120 },
          { num: "6.4", title: "Offering Help", titleFr: "Offrir de l'aide", xp: 120 },
        ]
      },
      { title: "Administrative Tasks", titleFr: "Tâches Administratives", description: "Handle administrative tasks in French.", descriptionFr: "Gérer les tâches administratives en français.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "7.1", title: "Booking a Room", titleFr: "Réserver une salle", xp: 120 },
          { num: "7.2", title: "Service Notes", titleFr: "Notes de service", xp: 120 },
          { num: "7.3", title: "Office Supplies", titleFr: "Fournitures de bureau", xp: 120 },
          { num: "7.4", title: "Timesheet", titleFr: "Feuille de temps", xp: 120 },
        ]
      },
      { title: "Finding Your Way", titleFr: "S'orienter", description: "Navigate physical and organizational spaces.", descriptionFr: "Se repérer dans les espaces physiques et organisationnels.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "8.1", title: "Building Directions", titleFr: "Directions dans l'immeuble", xp: 120 },
          { num: "8.2", title: "Evacuation Plan", titleFr: "Plan d'évacuation", xp: 120 },
          { num: "8.3", title: "Workstation", titleFr: "Poste de travail", xp: 120 },
          { num: "8.4", title: "Public Transit", titleFr: "Transport en commun", xp: 120 },
        ]
      },
    ]
  },
  {
    slug: "fsl-path-iii", number: "III", title: "Operational French", titleFr: "Français Opérationnel",
    subtitle: "Professional Communication for the Workplace", subtitleFr: "Communication professionnelle pour le milieu de travail",
    cefrLevel: "B1", color: "#d97706", coverUrl: CDN.covers.fsl.pathIII, badgeUrl: CDN.badges.pathCompletion[2],
    modules: [
      { title: "Participating in Meetings", titleFr: "Participer aux Réunions", description: "Actively participate in French-language meetings.", descriptionFr: "Participer activement aux réunions en français.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "9.1", title: "Understanding the Agenda", titleFr: "Comprendre l'ordre du jour", xp: 140 },
          { num: "9.2", title: "Giving Your Opinion", titleFr: "Donner son opinion", xp: 140 },
          { num: "9.3", title: "Clarification Questions", titleFr: "Questions de clarification", xp: 140 },
          { num: "9.4", title: "Summarizing Action Items", titleFr: "Résumer les points d'action", xp: 140 },
        ]
      },
      { title: "Written Communication", titleFr: "Communication Écrite", description: "Produce professional written documents in French.", descriptionFr: "Produire des documents écrits professionnels en français.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "10.1", title: "Writing Meeting Minutes", titleFr: "Rédiger un compte rendu", xp: 140 },
          { num: "10.2", title: "Requesting a Revision", titleFr: "Demander une révision", xp: 140 },
          { num: "10.3", title: "Writing a Simple Report", titleFr: "Écrire un rapport simple", xp: 140 },
          { num: "10.4", title: "Professional Biography", titleFr: "Biographie professionnelle", xp: 140 },
        ]
      },
      { title: "Simple Presentations", titleFr: "Présentations Simples", description: "Deliver clear presentations in French.", descriptionFr: "Livrer des présentations claires en français.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "11.1", title: "Presenting Data & Figures", titleFr: "Données chiffrées", xp: 140 },
          { num: "11.2", title: "Process & Steps", titleFr: "Processus et étapes", xp: 140 },
          { num: "11.3", title: "Audience Questions", titleFr: "Questions de l'auditoire", xp: 140 },
          { num: "11.4", title: "Concluding & Thanking", titleFr: "Conclure et remercier", xp: 140 },
        ]
      },
      { title: "Negotiation & Persuasion", titleFr: "Négociation et Persuasion", description: "Negotiate and persuade effectively in French.", descriptionFr: "Négocier et persuader efficacement en français.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "12.1", title: "Expressing a Need", titleFr: "Exprimer un besoin", xp: 140 },
          { num: "12.2", title: "Negotiating a Deadline", titleFr: "Négocier une échéance", xp: 140 },
          { num: "12.3", title: "Proposal Advantages", titleFr: "Avantages d'une proposition", xp: 140 },
          { num: "12.4", title: "Managing Disagreement", titleFr: "Gérer un désaccord", xp: 140 },
        ]
      },
    ]
  },
  {
    slug: "fsl-path-iv", number: "IV", title: "Strategic Expression", titleFr: "Expression Stratégique",
    subtitle: "Advanced Professional Communication", subtitleFr: "Communication professionnelle avancée",
    cefrLevel: "B2", color: "#7c3aed", coverUrl: CDN.covers.fsl.pathIV, badgeUrl: CDN.badges.pathCompletion[3],
    modules: [
      { title: "Communication & Influence", titleFr: "Communication et Influence", description: "Lead through effective communication.", descriptionFr: "Diriger par une communication efficace.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "13.1", title: "Leading a Meeting", titleFr: "Animer une réunion", xp: 160 },
          { num: "13.2", title: "Complex Arguments", titleFr: "Présenter un argumentaire complexe", xp: 160 },
          { num: "13.3", title: "Information Notes", titleFr: "Rédiger une note d'information", xp: 160 },
          { num: "13.4", title: "Conducting an Interview", titleFr: "Mener un entretien d'embauche", xp: 160 },
        ]
      },
      { title: "Project Management", titleFr: "Gestion de Projets", description: "Manage projects in French.", descriptionFr: "Gérer des projets en français.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "14.1", title: "Project Kickoff", titleFr: "Lancement de projet", xp: 160 },
          { num: "14.2", title: "Writing a Progress Report", titleFr: "Rédiger un rapport d'étape", xp: 160 },
          { num: "14.3", title: "Brainstorming Session", titleFr: "Animer une séance de remue-méninges", xp: 160 },
          { num: "14.4", title: "Stakeholder Communication", titleFr: "Communiquer avec les parties prenantes", xp: 160 },
        ]
      },
      { title: "Sensitive Communication", titleFr: "Communication Sensible", description: "Handle sensitive workplace situations.", descriptionFr: "Gérer les situations sensibles au travail.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "15.1", title: "Constructive Feedback", titleFr: "Donner une rétroaction constructive", xp: 160 },
          { num: "15.2", title: "Handling a Complaint", titleFr: "Gérer une plainte", xp: 160 },
          { num: "15.3", title: "Organizational Change", titleFr: "Communiquer un changement organisationnel", xp: 160 },
          { num: "15.4", title: "Negotiating a Compromise", titleFr: "Négocier un compromis", xp: 160 },
        ]
      },
      { title: "Leadership & Influence", titleFr: "Leadership et Influence", description: "Lead and influence through language.", descriptionFr: "Diriger et influencer par la langue.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "16.1", title: "Delegating a Task", titleFr: "Déléguer une tâche", xp: 160 },
          { num: "16.2", title: "Strategic Vision", titleFr: "Présenter une vision stratégique", xp: 160 },
          { num: "16.3", title: "Leading a Debate", titleFr: "Animer un débat", xp: 160 },
          { num: "16.4", title: "Closing a Meeting", titleFr: "Conclure une réunion", xp: 160 },
        ]
      },
    ]
  },
  {
    slug: "fsl-path-v", number: "V", title: "Professional Mastery", titleFr: "Maîtrise Professionnelle",
    subtitle: "Executive-Level French Communication", subtitleFr: "Communication en français de niveau exécutif",
    cefrLevel: "C1", color: "#dc2626", coverUrl: CDN.covers.fsl.pathV, badgeUrl: CDN.badges.pathCompletion[4],
    modules: [
      { title: "Leadership & Vision", titleFr: "Leadership et Vision", description: "Communicate vision at the executive level.", descriptionFr: "Communiquer une vision au niveau exécutif.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "17.1", title: "Senior Management Vision", titleFr: "Vision de la haute direction", xp: 180 },
          { num: "17.2", title: "Cabinet Memorandum", titleFr: "Mémoire au Cabinet", xp: 180 },
          { num: "17.3", title: "Interdepartmental Committee", titleFr: "Comité interministériel", xp: 180 },
          { num: "17.4", title: "Public Consultation", titleFr: "Consultation publique", xp: 180 },
        ]
      },
      { title: "Analysis & Synthesis", titleFr: "Analyse et Synthèse", description: "Analyze and synthesize complex information.", descriptionFr: "Analyser et synthétiser des informations complexes.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "18.1", title: "Policy Documents", titleFr: "Documents de politique", xp: 180 },
          { num: "18.2", title: "Comparative Analysis", titleFr: "Analyse comparative", xp: 180 },
          { num: "18.3", title: "Research Report", titleFr: "Rapport de recherche", xp: 180 },
          { num: "18.4", title: "Analysis Results", titleFr: "Résultats d'analyse", xp: 180 },
        ]
      },
      { title: "Crisis Communication", titleFr: "Communication de Crise", description: "Manage crisis communication effectively.", descriptionFr: "Gérer efficacement la communication de crise.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "19.1", title: "Emergency Communiqué", titleFr: "Communiqué d'urgence", xp: 180 },
          { num: "19.2", title: "Press Briefing", titleFr: "Point de presse", xp: 180 },
          { num: "19.3", title: "Difficult Interview", titleFr: "Entrevue difficile", xp: 180 },
          { num: "19.4", title: "Internal Stakeholders", titleFr: "Parties prenantes internes", xp: 180 },
        ]
      },
      { title: "Negotiation & Diplomacy", titleFr: "Négociation et Diplomatie", description: "Master diplomatic negotiation in French.", descriptionFr: "Maîtriser la négociation diplomatique en français.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "20.1", title: "Reservations & Objections", titleFr: "Réserves et objections", xp: 180 },
          { num: "20.2", title: "Finding Common Ground", titleFr: "Compromis et terrain d'entente", xp: 180 },
          { num: "20.3", title: "Multilateral Meeting", titleFr: "Rencontre multilatérale", xp: 180 },
          { num: "20.4", title: "Meeting Minutes", titleFr: "Compte rendu", xp: 180 },
        ]
      },
    ]
  },
  {
    slug: "fsl-path-vi", number: "VI", title: "SLE Mastery", titleFr: "Maîtrise ÉLS",
    subtitle: "SLE Exam Preparation & Mastery", subtitleFr: "Préparation et maîtrise de l'ÉLS",
    cefrLevel: "C1+", color: "#0f172a", coverUrl: CDN.covers.fsl.pathVI, badgeUrl: CDN.badges.pathCompletion[5],
    modules: [
      { title: "Reading Comprehension", titleFr: "Compréhension Écrite", description: "Master reading comprehension for the SLE.", descriptionFr: "Maîtriser la compréhension écrite pour l'ÉLS.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "21.1", title: "Speed Reading Strategies", titleFr: "Stratégies de lecture rapide", xp: 200 },
          { num: "21.2", title: "Decoding Question Types", titleFr: "Décoder les types de questions", xp: 200 },
          { num: "21.3", title: "Administrative Texts", titleFr: "Comprendre les textes administratifs", xp: 200 },
          { num: "21.4", title: "Practice Test", titleFr: "Réussir le test blanc", xp: 200 },
        ]
      },
      { title: "Written Expression", titleFr: "Expression Écrite", description: "Excel in written expression for the SLE.", descriptionFr: "Exceller en expression écrite pour l'ÉLS.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "22.1", title: "Timed Email Writing", titleFr: "Rédiger un courriel sous contrainte", xp: 200 },
          { num: "22.2", title: "Service Memo", titleFr: "Produire une note de service", xp: 200 },
          { num: "22.3", title: "Argumentative Text", titleFr: "Rédiger un texte argumentatif", xp: 200 },
          { num: "22.4", title: "Written Expression Performance", titleFr: "Performance en expression écrite", xp: 200 },
        ]
      },
      { title: "Oral Comprehension", titleFr: "Compréhension Orale", description: "Master oral comprehension for the SLE.", descriptionFr: "Maîtriser la compréhension orale pour l'ÉLS.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "23.1", title: "Active & Predictive Listening", titleFr: "Écoute active et prédictive", xp: 200 },
          { num: "23.2", title: "Strategic Note-Taking", titleFr: "Prise de notes stratégique", xp: 200 },
          { num: "23.3", title: "Implicit Inference", titleFr: "Inférence implicite", xp: 200 },
          { num: "23.4", title: "Mental Synthesis", titleFr: "Synthèse mentale", xp: 200 },
        ]
      },
      { title: "Oral Expression", titleFr: "Expression Orale", description: "Master oral expression for the SLE.", descriptionFr: "Maîtriser l'expression orale pour l'ÉLS.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "24.1", title: "Fluency & Rhythm", titleFr: "Fluidité et rythme", xp: 200 },
          { num: "24.2", title: "Lexical Precision", titleFr: "Précision lexicale", xp: 200 },
          { num: "24.3", title: "Speech Structure", titleFr: "Structure du discours", xp: 200 },
          { num: "24.4", title: "Interaction & Repair", titleFr: "Interaction et réparation", xp: 200 },
        ]
      },
    ]
  },
];

// ═══════════════════════════════════════════════════════════
// ESL PATHS (6 paths, 24 modules, 96 lessons)
// ═══════════════════════════════════════════════════════════
const ESL_PATHS = [
  {
    slug: "esl-path-i", number: "I", title: "Foundations", titleFr: "Les Fondations",
    subtitle: "From Hesitation to Essential Communication", subtitleFr: "De l'hésitation à la communication essentielle",
    cefrLevel: "A1", color: "#2563eb", coverUrl: CDN.covers.esl.pathI, badgeUrl: CDN.badges.pathCompletion[0],
    modules: [
      { title: "First Impressions", titleFr: "Premières Impressions", description: "Build confidence in professional introductions.", descriptionFr: "Développer la confiance dans les présentations professionnelles.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "1.1", title: "Hello, My Name Is...", titleFr: "Bonjour, je m'appelle...", xp: 100 },
          { num: "1.2", title: "My Office, My Team", titleFr: "Mon bureau, mon équipe", xp: 100 },
          { num: "1.3", title: "Numbers, Dates & Time", titleFr: "Chiffres, dates et heure", xp: 100 },
          { num: "1.4", title: "Can You Help Me?", titleFr: "Pouvez-vous m'aider?", xp: 100 },
        ]
      },
      { title: "Your Work Environment", titleFr: "Votre Environnement de Travail", description: "Describe your professional environment.", descriptionFr: "Décrire votre environnement professionnel.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "2.1", title: "What Do You Do?", titleFr: "Que faites-vous?", xp: 100 },
          { num: "2.2", title: "Our Department", titleFr: "Notre ministère", xp: 100 },
          { num: "2.3", title: "Office Supplies & Technology", titleFr: "Fournitures et technologie", xp: 100 },
          { num: "2.4", title: "Health & Safety at Work", titleFr: "Santé et sécurité au travail", xp: 100 },
        ]
      },
      { title: "Daily Routines", titleFr: "Routines Quotidiennes", description: "Manage time and daily interactions.", descriptionFr: "Gérer le temps et les interactions quotidiennes.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "3.1", title: "My Typical Day", titleFr: "Ma journée typique", xp: 100 },
          { num: "3.2", title: "Making Appointments", titleFr: "Prendre rendez-vous", xp: 100 },
          { num: "3.3", title: "Breaks & Small Talk", titleFr: "Pauses et conversations informelles", xp: 100 },
          { num: "3.4", title: "End of the Day", titleFr: "Fin de journée", xp: 100 },
        ]
      },
      { title: "Getting Help", titleFr: "Obtenir de l'Aide", description: "Ask for information and clarification.", descriptionFr: "Demander des informations et des clarifications.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "4.1", title: "I Don't Understand", titleFr: "Je ne comprends pas", xp: 100 },
          { num: "4.2", title: "Where Is the...?", titleFr: "Où se trouve le...?", xp: 100 },
          { num: "4.3", title: "I Need Help With...", titleFr: "J'ai besoin d'aide avec...", xp: 100 },
          { num: "4.4", title: "Thank You & Follow Up", titleFr: "Merci et suivi", xp: 100 },
        ]
      },
    ]
  },
  {
    slug: "esl-path-ii", number: "II", title: "Everyday Fluency", titleFr: "Aisance Quotidienne",
    subtitle: "Building Confidence in Daily Professional English", subtitleFr: "Développer la confiance dans l'anglais professionnel quotidien",
    cefrLevel: "A2", color: "#059669", coverUrl: CDN.covers.esl.pathII, badgeUrl: CDN.badges.pathCompletion[1],
    modules: [
      { title: "Digital Workspace", titleFr: "Espace Numérique", description: "Navigate digital tools in English.", descriptionFr: "Naviguer les outils numériques en anglais.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "5.1", title: "Email Etiquette", titleFr: "Étiquette courriel", xp: 120 },
          { num: "5.2", title: "Virtual Meetings", titleFr: "Réunions virtuelles", xp: 120 },
          { num: "5.3", title: "Instant Messaging", titleFr: "Messagerie instantanée", xp: 120 },
          { num: "5.4", title: "Shared Documents", titleFr: "Documents partagés", xp: 120 },
        ]
      },
      { title: "On the Phone", titleFr: "Au Téléphone", description: "Handle phone calls professionally.", descriptionFr: "Gérer les appels téléphoniques professionnellement.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "6.1", title: "Answering Calls", titleFr: "Répondre aux appels", xp: 120 },
          { num: "6.2", title: "Transferring & Messages", titleFr: "Transferts et messages", xp: 120 },
          { num: "6.3", title: "Conference Calls", titleFr: "Conférences téléphoniques", xp: 120 },
          { num: "6.4", title: "Voicemail", titleFr: "Messagerie vocale", xp: 120 },
        ]
      },
      { title: "Team Meetings", titleFr: "Réunions d'Équipe", description: "Participate in team meetings.", descriptionFr: "Participer aux réunions d'équipe.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "7.1", title: "Meeting Agenda", titleFr: "Ordre du jour", xp: 120 },
          { num: "7.2", title: "Sharing Ideas", titleFr: "Partager des idées", xp: 120 },
          { num: "7.3", title: "Taking Notes", titleFr: "Prendre des notes", xp: 120 },
          { num: "7.4", title: "Action Items", titleFr: "Points d'action", xp: 120 },
        ]
      },
      { title: "Your Contributions", titleFr: "Vos Contributions", description: "Make meaningful contributions.", descriptionFr: "Apporter des contributions significatives.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "8.1", title: "Presenting Updates", titleFr: "Présenter des mises à jour", xp: 120 },
          { num: "8.2", title: "Asking Questions", titleFr: "Poser des questions", xp: 120 },
          { num: "8.3", title: "Giving Feedback", titleFr: "Donner de la rétroaction", xp: 120 },
          { num: "8.4", title: "Summarizing Decisions", titleFr: "Résumer les décisions", xp: 120 },
        ]
      },
    ]
  },
  {
    slug: "esl-path-iii", number: "III", title: "Operational English", titleFr: "Anglais Opérationnel",
    subtitle: "Professional Communication for the Workplace", subtitleFr: "Communication professionnelle pour le milieu de travail",
    cefrLevel: "B1", color: "#d97706", coverUrl: CDN.covers.esl.pathIII, badgeUrl: CDN.badges.pathCompletion[2],
    modules: [
      { title: "Planning & Organizing", titleFr: "Planification et Organisation", description: "Plan and organize in English.", descriptionFr: "Planifier et organiser en anglais.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "9.1", title: "Project Planning", titleFr: "Planification de projet", xp: 140 },
          { num: "9.2", title: "Setting Priorities", titleFr: "Établir les priorités", xp: 140 },
          { num: "9.3", title: "Scheduling", titleFr: "Planification", xp: 140 },
          { num: "9.4", title: "Resource Management", titleFr: "Gestion des ressources", xp: 140 },
        ]
      },
      { title: "Feedback", titleFr: "Rétroaction", description: "Give and receive feedback.", descriptionFr: "Donner et recevoir de la rétroaction.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "10.1", title: "Positive Feedback", titleFr: "Rétroaction positive", xp: 140 },
          { num: "10.2", title: "Constructive Criticism", titleFr: "Critique constructive", xp: 140 },
          { num: "10.3", title: "Performance Reviews", titleFr: "Évaluations de rendement", xp: 140 },
          { num: "10.4", title: "Self-Assessment", titleFr: "Auto-évaluation", xp: 140 },
        ]
      },
      { title: "Public Service Culture", titleFr: "Culture de la Fonction Publique", description: "Navigate public service culture.", descriptionFr: "Naviguer la culture de la fonction publique.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "11.1", title: "Values & Ethics", titleFr: "Valeurs et éthique", xp: 140 },
          { num: "11.2", title: "Diversity & Inclusion", titleFr: "Diversité et inclusion", xp: 140 },
          { num: "11.3", title: "Official Languages", titleFr: "Langues officielles", xp: 140 },
          { num: "11.4", title: "Workplace Wellness", titleFr: "Bien-être au travail", xp: 140 },
        ]
      },
      { title: "Career Path", titleFr: "Parcours de Carrière", description: "Advance your career in English.", descriptionFr: "Avancer votre carrière en anglais.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "12.1", title: "Job Applications", titleFr: "Candidatures", xp: 140 },
          { num: "12.2", title: "Interview Skills", titleFr: "Compétences d'entrevue", xp: 140 },
          { num: "12.3", title: "Networking", titleFr: "Réseautage", xp: 140 },
          { num: "12.4", title: "SLE Preparation Level B", titleFr: "Préparation ÉLS Niveau B", xp: 140 },
        ]
      },
    ]
  },
  {
    slug: "esl-path-iv", number: "IV", title: "Strategic Expression", titleFr: "Expression Stratégique",
    subtitle: "Advanced Professional Communication", subtitleFr: "Communication professionnelle avancée",
    cefrLevel: "B2", color: "#7c3aed", coverUrl: CDN.covers.esl.pathIV, badgeUrl: CDN.badges.pathCompletion[3],
    modules: [
      { title: "Leading Meetings", titleFr: "Diriger des Réunions", description: "Lead meetings effectively.", descriptionFr: "Diriger des réunions efficacement.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "13.1", title: "Opening & Agenda", titleFr: "Ouverture et ordre du jour", xp: 160 },
          { num: "13.2", title: "Facilitating Discussion", titleFr: "Faciliter la discussion", xp: 160 },
          { num: "13.3", title: "Managing Conflict", titleFr: "Gérer les conflits", xp: 160 },
          { num: "13.4", title: "Closing & Follow-Up", titleFr: "Clôture et suivi", xp: 160 },
        ]
      },
      { title: "Writing for Impact", titleFr: "Rédaction Percutante", description: "Write impactful documents.", descriptionFr: "Rédiger des documents percutants.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "14.1", title: "Briefing Notes", titleFr: "Notes d'information", xp: 160 },
          { num: "14.2", title: "Policy Proposals", titleFr: "Propositions de politique", xp: 160 },
          { num: "14.3", title: "Executive Summaries", titleFr: "Résumés exécutifs", xp: 160 },
          { num: "14.4", title: "Persuasive Writing", titleFr: "Rédaction persuasive", xp: 160 },
        ]
      },
      { title: "Presenting with Confidence", titleFr: "Présenter avec Confiance", description: "Deliver confident presentations.", descriptionFr: "Livrer des présentations avec confiance.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "15.1", title: "Structuring a Presentation", titleFr: "Structurer une présentation", xp: 160 },
          { num: "15.2", title: "Visual Aids", titleFr: "Supports visuels", xp: 160 },
          { num: "15.3", title: "Handling Q&A", titleFr: "Gérer les questions", xp: 160 },
          { num: "15.4", title: "Storytelling", titleFr: "L'art du récit", xp: 160 },
        ]
      },
      { title: "Negotiation & Persuasion", titleFr: "Négociation et Persuasion", description: "Negotiate and persuade effectively.", descriptionFr: "Négocier et persuader efficacement.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "16.1", title: "Building Rapport", titleFr: "Établir un rapport", xp: 160 },
          { num: "16.2", title: "Win-Win Solutions", titleFr: "Solutions gagnant-gagnant", xp: 160 },
          { num: "16.3", title: "Handling Objections", titleFr: "Gérer les objections", xp: 160 },
          { num: "16.4", title: "Closing Deals", titleFr: "Conclure des ententes", xp: 160 },
        ]
      },
    ]
  },
  {
    slug: "esl-path-v", number: "V", title: "Professional Mastery", titleFr: "Maîtrise Professionnelle",
    subtitle: "Executive-Level English Communication", subtitleFr: "Communication en anglais de niveau exécutif",
    cefrLevel: "C1", color: "#dc2626", coverUrl: CDN.covers.esl.pathV, badgeUrl: CDN.badges.pathCompletion[4],
    modules: [
      { title: "Managing People & Performance", titleFr: "Gestion des Personnes et du Rendement", description: "Manage teams effectively.", descriptionFr: "Gérer les équipes efficacement.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "17.1", title: "Performance Conversations", titleFr: "Conversations de rendement", xp: 180 },
          { num: "17.2", title: "Talent Development", titleFr: "Développement des talents", xp: 180 },
          { num: "17.3", title: "Difficult Conversations", titleFr: "Conversations difficiles", xp: 180 },
          { num: "17.4", title: "Team Building", titleFr: "Renforcement d'équipe", xp: 180 },
        ]
      },
      { title: "Interdepartmental Collaboration", titleFr: "Collaboration Interministérielle", description: "Collaborate across departments.", descriptionFr: "Collaborer entre ministères.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "18.1", title: "Cross-Functional Teams", titleFr: "Équipes interfonctionnelles", xp: 180 },
          { num: "18.2", title: "Stakeholder Management", titleFr: "Gestion des parties prenantes", xp: 180 },
          { num: "18.3", title: "Joint Initiatives", titleFr: "Initiatives conjointes", xp: 180 },
          { num: "18.4", title: "Reporting Up", titleFr: "Rapporter à la direction", xp: 180 },
        ]
      },
      { title: "Policy & Legislation", titleFr: "Politique et Législation", description: "Navigate policy and legislation.", descriptionFr: "Naviguer la politique et la législation.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "19.1", title: "Policy Analysis", titleFr: "Analyse de politique", xp: 180 },
          { num: "19.2", title: "Legislative Language", titleFr: "Langage législatif", xp: 180 },
          { num: "19.3", title: "Regulatory Framework", titleFr: "Cadre réglementaire", xp: 180 },
          { num: "19.4", title: "Consultation Processes", titleFr: "Processus de consultation", xp: 180 },
        ]
      },
      { title: "Crisis Communication", titleFr: "Communication de Crise", description: "Manage crisis communication.", descriptionFr: "Gérer la communication de crise.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "20.1", title: "Emergency Response", titleFr: "Réponse d'urgence", xp: 180 },
          { num: "20.2", title: "Media Relations", titleFr: "Relations médiatiques", xp: 180 },
          { num: "20.3", title: "Internal Communication", titleFr: "Communication interne", xp: 180 },
          { num: "20.4", title: "Recovery & Lessons Learned", titleFr: "Rétablissement et leçons apprises", xp: 180 },
        ]
      },
    ]
  },
  {
    slug: "esl-path-vi", number: "VI", title: "Executive Leadership", titleFr: "Leadership Exécutif",
    subtitle: "C-Suite Communication Excellence", subtitleFr: "Excellence en communication de la haute direction",
    cefrLevel: "C1+", color: "#0f172a", coverUrl: CDN.covers.esl.pathVI, badgeUrl: CDN.badges.pathCompletion[5],
    modules: [
      { title: "Strategic Leadership", titleFr: "Leadership Stratégique", description: "Lead strategically in English.", descriptionFr: "Diriger stratégiquement en anglais.", badgeUrl: CDN.badges.modules[0],
        lessons: [
          { num: "21.1", title: "Executive Decision-Making", titleFr: "Prise de décision exécutive", xp: 200 },
          { num: "21.2", title: "Vision Communication", titleFr: "Communication de la vision", xp: 200 },
          { num: "21.3", title: "Strategic Communication", titleFr: "Communication stratégique", xp: 200 },
          { num: "21.4", title: "Leading Organizational Change", titleFr: "Diriger le changement organisationnel", xp: 200 },
        ]
      },
      { title: "Executive Presence", titleFr: "Présence Exécutive", description: "Develop executive presence.", descriptionFr: "Développer la présence exécutive.", badgeUrl: CDN.badges.modules[1],
        lessons: [
          { num: "22.1", title: "Gravitas & Authority", titleFr: "Gravitas et autorité", xp: 200 },
          { num: "22.2", title: "Board Presentations", titleFr: "Présentations au conseil", xp: 200 },
          { num: "22.3", title: "Media Appearances", titleFr: "Apparitions médiatiques", xp: 200 },
          { num: "22.4", title: "Thought Leadership", titleFr: "Leadership intellectuel", xp: 200 },
        ]
      },
      { title: "Thought Leadership", titleFr: "Leadership Intellectuel", description: "Establish thought leadership.", descriptionFr: "Établir un leadership intellectuel.", badgeUrl: CDN.badges.modules[2],
        lessons: [
          { num: "23.1", title: "Publishing & Speaking", titleFr: "Publication et prise de parole", xp: 200 },
          { num: "23.2", title: "Industry Influence", titleFr: "Influence dans l'industrie", xp: 200 },
          { num: "23.3", title: "Mentoring & Coaching", titleFr: "Mentorat et coaching", xp: 200 },
          { num: "23.4", title: "Building Legacy", titleFr: "Bâtir un héritage", xp: 200 },
        ]
      },
      { title: "Legacy & Influence", titleFr: "Héritage et Influence", description: "Create lasting impact.", descriptionFr: "Créer un impact durable.", badgeUrl: CDN.badges.modules[3],
        lessons: [
          { num: "24.1", title: "Succession Planning", titleFr: "Planification de la relève", xp: 200 },
          { num: "24.2", title: "Knowledge Transfer", titleFr: "Transfert de connaissances", xp: 200 },
          { num: "24.3", title: "Institutional Memory", titleFr: "Mémoire institutionnelle", xp: 200 },
          { num: "24.4", title: "Final Capstone", titleFr: "Projet final intégrateur", xp: 250 },
        ]
      },
    ]
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN SEEDER
// ═══════════════════════════════════════════════════════════
async function main() {
  const conn = await mysql.createConnection(parseDbUrl(DATABASE_URL));
  console.log("✅ Connected to database");

  // Track counts
  let programCount = 0, pathCount = 0, moduleCount = 0, lessonCount = 0, slotCount = 0, quizCount = 0, questionCount = 0;

  // Check if CMS already has data
  const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM cms_programs");
  if (existing[0].cnt > 0) {
    console.log(`⚠️  CMS already has ${existing[0].cnt} programs. Clearing existing data...`);
    // Delete in reverse order of dependencies
    await conn.execute("DELETE FROM cms_quiz_questions");
    await conn.execute("DELETE FROM cms_quizzes");
    await conn.execute("DELETE FROM cms_lesson_slots");
    await conn.execute("DELETE FROM cms_lessons");
    await conn.execute("DELETE FROM cms_modules");
    await conn.execute("DELETE FROM cms_paths");
    await conn.execute("DELETE FROM cms_programs");
    console.log("🗑️  Cleared existing CMS data");
  }

  // Seed programs
  for (let pi = 0; pi < PROGRAMS.length; pi++) {
    const prog = PROGRAMS[pi];
    const paths = prog.slug === "fsl" ? FSL_PATHS : ESL_PATHS;
    const contentFile = prog.slug === "fsl" ? "lessonContent" : "eslLessonContent";

    const [progResult] = await conn.execute(
      `INSERT INTO cms_programs (slug, title, titleFr, description, descriptionFr, icon, color, sortOrder, isPublished) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [prog.slug, prog.title, prog.titleFr, prog.description, prog.descriptionFr, prog.icon, prog.color, pi, true]
    );
    const programId = progResult.insertId;
    programCount++;
    console.log(`📚 Program: ${prog.title} (ID: ${programId})`);

    // Seed paths
    for (let pai = 0; pai < paths.length; pai++) {
      const path = paths[pai];
      const [pathResult] = await conn.execute(
        `INSERT INTO cms_paths (programId, slug, number, title, titleFr, subtitle, subtitleFr, cefrLevel, color, coverUrl, badgeUrl, sortOrder, isPublished)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [programId, path.slug, path.number, path.title, path.titleFr, path.subtitle, path.subtitleFr, path.cefrLevel, path.color, path.coverUrl, path.badgeUrl, pai, true]
      );
      const pathId = pathResult.insertId;
      pathCount++;
      console.log(`  📖 Path ${path.number}: ${path.title} (ID: ${pathId})`);

      // Seed modules
      for (let mi = 0; mi < path.modules.length; mi++) {
        const mod = path.modules[mi];
        const [modResult] = await conn.execute(
          `INSERT INTO cms_modules (pathId, title, titleFr, description, descriptionFr, badgeUrl, quizPassingScore, sortOrder, isPublished)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pathId, mod.title, mod.titleFr, mod.description, mod.descriptionFr, mod.badgeUrl, 80, mi, true]
        );
        const moduleId = modResult.insertId;
        moduleCount++;

        // Seed lessons
        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          const [lessonResult] = await conn.execute(
            `INSERT INTO cms_lessons (moduleId, lessonNumber, title, titleFr, duration, xpReward, sortOrder, isPublished)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [moduleId, lesson.num, lesson.title, lesson.titleFr, "50 min", lesson.xp, li, true]
          );
          const lessonId = lessonResult.insertId;
          lessonCount++;

          // Note: Slot content will be seeded from the content files in a separate pass
          // For now, create placeholder slots with the 7-slot structure
          const slotTypes = ["hook", "video", "strategy", "written", "oral", "quiz", "coaching"];
          const slotTitles = ["Hook", "Video Lesson", "Strategy & Grammar", "Written Practice", "Oral Practice", "Quiz", "Coaching Corner"];
          for (let si = 0; si < slotTypes.length; si++) {
            await conn.execute(
              `INSERT INTO cms_lesson_slots (lessonId, slotType, title, content, sortOrder)
               VALUES (?, ?, ?, ?, ?)`,
              [lessonId, slotTypes[si], slotTitles[si], `[Content for ${lesson.num} - ${slotTypes[si]}]`, si]
            );
            slotCount++;
          }
        }
      }
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("✅ CMS Seeding Complete — Structure Only");
  console.log(`   Programs: ${programCount}`);
  console.log(`   Paths:    ${pathCount}`);
  console.log(`   Modules:  ${moduleCount}`);
  console.log(`   Lessons:  ${lessonCount}`);
  console.log(`   Slots:    ${slotCount}`);
  console.log("═══════════════════════════════════════");
  console.log("\n🔄 Now seeding lesson content from content files...\n");

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: Seed actual content from lessonContent.ts / eslLessonContent.ts
  // We read the TS files and extract content using regex
  // ═══════════════════════════════════════════════════════════
  
  const dataDir = join(__dirname, "..", "client", "src", "data");
  
  for (const program of ["fsl", "esl"]) {
    const contentFileName = program === "fsl" ? "lessonContent.ts" : "eslLessonContent.ts";
    const contentFilePath = join(dataDir, contentFileName);
    
    let contentRaw;
    try {
      contentRaw = readFileSync(contentFilePath, "utf-8");
    } catch (e) {
      console.log(`⚠️  Could not read ${contentFileName}, skipping content seeding for ${program}`);
      continue;
    }

    // Get the program ID
    const [progRows] = await conn.execute("SELECT id FROM cms_programs WHERE slug = ?", [program]);
    if (!progRows.length) continue;
    const programId = progRows[0].id;

    // Get all lessons for this program with their lesson numbers
    const [lessonRows] = await conn.execute(`
      SELECT l.id, l.lessonNumber, l.moduleId
      FROM cms_lessons l
      JOIN cms_modules m ON l.moduleId = m.id
      JOIN cms_paths p ON m.pathId = p.id
      WHERE p.programId = ?
      ORDER BY l.lessonNumber
    `, [programId]);

    console.log(`📝 Seeding content for ${program.toUpperCase()} (${lessonRows.length} lessons)...`);

    // Parse the content file to extract slot data for each lesson
    // The structure is: "1.1": { "hook": { title: "...", content: "..." }, "video": { ... }, ... }
    const slotTypes = ["hook", "video", "strategy", "written", "oral", "quiz", "coaching"];
    
    for (const lesson of lessonRows) {
      const lessonNum = lesson.lessonNumber;
      
      // Find the lesson block in the content file
      // Pattern: "1.1": {
      const lessonPattern = new RegExp(`"${lessonNum.replace(".", "\\.")}":\\s*\\{`, "g");
      const match = lessonPattern.exec(contentRaw);
      if (!match) continue;

      // Find the start of this lesson's content
      const startIdx = match.index + match[0].length;
      
      // For each slot type, extract title and content
      for (const slotType of slotTypes) {
        // Find the slot block: "hook": { title: "...", content: "..." }
        const slotPattern = new RegExp(`"${slotType}":\\s*\\{`, "g");
        slotPattern.lastIndex = startIdx;
        const slotMatch = slotPattern.exec(contentRaw);
        
        if (!slotMatch || slotMatch.index > startIdx + 50000) continue; // Don't go too far
        
        // Extract title
        const titleMatch = contentRaw.substring(slotMatch.index, slotMatch.index + 500).match(/title:\s*"([^"]*?)"/);
        const title = titleMatch ? titleMatch[1] : slotType;
        
        // Extract content - it's between content: " and the closing "
        // Content can contain escaped quotes and newlines
        const contentStart = contentRaw.indexOf('content:', slotMatch.index);
        if (contentStart === -1 || contentStart > slotMatch.index + 500) continue;
        
        // Find the opening quote of content value
        const contentQuoteStart = contentRaw.indexOf('"', contentStart + 8);
        if (contentQuoteStart === -1) continue;
        
        // Find the closing quote (handle escaped quotes)
        let contentEnd = contentQuoteStart + 1;
        while (contentEnd < contentRaw.length) {
          if (contentRaw[contentEnd] === '"' && contentRaw[contentEnd - 1] !== '\\') break;
          contentEnd++;
        }
        
        let content = contentRaw.substring(contentQuoteStart + 1, contentEnd);
        // Unescape
        content = content.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        
        if (content.length > 5) { // Only update if we got meaningful content
          // Update the slot
          await conn.execute(
            `UPDATE cms_lesson_slots SET title = ?, content = ? 
             WHERE lessonId = ? AND slotType = ?`,
            [title, content, lesson.id, slotType]
          );
        }

        // Check for quiz data in the quiz slot
        if (slotType === "quiz") {
          // Look for quiz: { title: "...", questions: [ ... ] }
          const quizDataStart = contentRaw.indexOf("quiz:", slotMatch.index + 10);
          if (quizDataStart !== -1 && quizDataStart < slotMatch.index + 10000) {
            // Check if there's a quiz block (not just the slot named "quiz")
            const quizTitleMatch = contentRaw.substring(quizDataStart, quizDataStart + 500).match(/title:\s*"([^"]*?)"/);
            if (quizTitleMatch) {
              const quizTitle = quizTitleMatch[1];
              
              // Create the quiz
              const [quizResult] = await conn.execute(
                `INSERT INTO cms_quizzes (lessonId, title, quizType, passingScore, isPublished, sortOrder)
                 VALUES (?, ?, 'formative', 80, 1, 0)`,
                [lesson.id, quizTitle]
              );
              const quizId = quizResult.insertId;
              quizCount++;

              // Extract questions using regex
              // Pattern: { id: N, type: "multiple-choice", question: "...", options: [...], answer: "...", feedback: "..." }
              const questionsRegex = /\{\s*id:\s*(\d+),\s*type:\s*"([^"]+)"\s*(?:as\s*const)?,\s*question:\s*"([^"]*?)",\s*options:\s*\[([^\]]*)\],\s*answer:\s*"([^"]*?)",\s*feedback:\s*"([^"]*?)"\s*\}/g;
              
              // Search in a window after the quiz title
              const questionSearchStart = quizDataStart;
              const questionSearchEnd = Math.min(quizDataStart + 5000, contentRaw.length);
              const questionSearchText = contentRaw.substring(questionSearchStart, questionSearchEnd);
              
              let qMatch;
              let qOrder = 0;
              while ((qMatch = questionsRegex.exec(questionSearchText)) !== null) {
                const qType = qMatch[2] === "multiple-choice" ? "multiple_choice" : "fill_in_blank";
                const qQuestion = qMatch[3].replace(/\\"/g, '"').replace(/\\n/g, "\n");
                const qOptionsRaw = qMatch[4];
                const qAnswer = qMatch[5].replace(/\\"/g, '"');
                const qFeedback = qMatch[6].replace(/\\"/g, '"').replace(/\\n/g, "\n");
                
                // Parse options
                const options = [];
                const optRegex = /"([^"]*?)"/g;
                let optMatch;
                while ((optMatch = optRegex.exec(qOptionsRaw)) !== null) {
                  options.push(optMatch[1].replace(/\\"/g, '"'));
                }

                await conn.execute(
                  `INSERT INTO cms_quiz_questions (quizId, questionType, question, options, correctAnswer, feedback, points, sortOrder)
                   VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
                  [quizId, qType, qQuestion, JSON.stringify(options), qAnswer, qFeedback, qOrder]
                );
                questionCount++;
                qOrder++;
              }
            }
          }
        }
      }
    }
    console.log(`   ✅ ${program.toUpperCase()} content seeded`);
  }

  console.log("\n═══════════════════════════════════════");
  console.log("✅ FULL CMS SEEDING COMPLETE");
  console.log(`   Programs:  ${programCount}`);
  console.log(`   Paths:     ${pathCount}`);
  console.log(`   Modules:   ${moduleCount}`);
  console.log(`   Lessons:   ${lessonCount}`);
  console.log(`   Slots:     ${slotCount}`);
  console.log(`   Quizzes:   ${quizCount}`);
  console.log(`   Questions: ${questionCount}`);
  console.log("═══════════════════════════════════════");

  await conn.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeder failed:", err);
  process.exit(1);
});
