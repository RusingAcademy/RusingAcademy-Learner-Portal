/**
 * Phase 5 — Content Import Script
 * Imports real curriculum content from extracted zip files into the database.
 * 
 * Strategy:
 * - Path I: UPDATE existing records (course 90007, modules 120025-120028, lessons 120097-120112, activities 60673+)
 * - Paths II-VI: INSERT new courses, modules, lessons, activities
 * - Quiz questions: INSERT into quiz_questions table from embedded JSON in Slot 6
 * - Video/Audio URLs: LEFT AS NULL (to be done later)
 * - Thumbnails: NOT uploaded here (handled separately)
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = '/home/ubuntu/course_content';

// ============================================================================
// PATH DEFINITIONS — Maps file structure to DB structure
// ============================================================================
const PATH_DEFINITIONS = [
  {
    pathNumber: 1,
    titleEn: 'Path I: Foundations of Professional French (A1)',
    titleFr: 'Parcours I : Fondations du Français Professionnel (A1)',
    descEn: 'Build your foundation in professional French. From first greetings to daily workplace communication, this path takes you from zero to confident beginner in government contexts.',
    descFr: 'Construisez vos fondations en français professionnel. Des premières salutations à la communication quotidienne au travail, ce parcours vous amène de zéro à débutant confiant dans les contextes gouvernementaux.',
    shortDescEn: 'From zero to confident beginner in professional French (A1)',
    shortDescFr: 'De zéro à débutant confiant en français professionnel (A1)',
    level: 'beginner',
    cefrLevel: 'A1',
    slug: 'path-i-foundations',
    estimatedHours: 30,
    price: 499,
    contentDir: 'Path_I_COMPLET',
    modules: [
      {
        dirName: 'Module_1_Premiers_Pas_Professionnels',
        moduleNumber: 1,
        titleEn: 'Module 1: First Professional Steps',
        titleFr: 'Module 1 : Premiers Pas Professionnels',
        descEn: 'Learn to introduce yourself, describe your workplace, and navigate daily routines in French.',
        descFr: 'Apprenez à vous présenter, décrire votre lieu de travail et naviguer les routines quotidiennes en français.',
        lessons: [
          { file: 'Lecon_1.1_Bonjour_Je_Mappelle.md', num: '1.1', titleEn: 'Hello, My Name Is...', titleFr: 'Bonjour, je m\'appelle...' },
          { file: 'Lecon_1.2_Mon_Bureau_Mon_Equipe.md', num: '1.2', titleEn: 'My Office, My Team', titleFr: 'Mon Bureau, Mon Équipe' },
          { file: 'Lecon_1.3_La_Routine_Quotidienne.md', num: '1.3', titleEn: 'The Daily Routine', titleFr: 'La Routine Quotidienne' },
          { file: 'Lecon_1.4_Poser_des_Questions_Cles.md', num: '1.4', titleEn: 'Asking Key Questions', titleFr: 'Poser des Questions Clés' },
        ]
      },
      {
        dirName: 'Module_2_Communication_Quotidienne',
        moduleNumber: 2,
        titleEn: 'Module 2: Daily Communication',
        titleFr: 'Module 2 : Communication Quotidienne',
        descEn: 'Master essential daily communication: phone calls, emails, understanding and giving instructions.',
        descFr: 'Maîtrisez la communication quotidienne essentielle : appels téléphoniques, courriels, comprendre et donner des instructions.',
        lessons: [
          { file: 'Lecon_2.1_Au_Telephone.md', num: '2.1', titleEn: 'On the Phone', titleFr: 'Au Téléphone' },
          { file: 'Lecon_2.2_Les_Courriels_Essentiels.md', num: '2.2', titleEn: 'Essential Emails', titleFr: 'Les Courriels Essentiels' },
          { file: 'Lecon_2.3_Comprendre_des_Instructions.md', num: '2.3', titleEn: 'Understanding Instructions', titleFr: 'Comprendre des Instructions' },
          { file: 'Lecon_2.4_Donner_des_Directives_Simples.md', num: '2.4', titleEn: 'Giving Simple Directives', titleFr: 'Donner des Directives Simples' },
        ]
      },
      {
        dirName: 'Module_3_Interactions_Essentielles',
        moduleNumber: 3,
        titleEn: 'Module 3: Essential Interactions',
        titleFr: 'Module 3 : Interactions Essentielles',
        descEn: 'Navigate social and professional interactions: polite requests, expressing needs, and responding appropriately.',
        descFr: 'Naviguez les interactions sociales et professionnelles : demandes polies, expression des besoins et réponses appropriées.',
        lessons: [
          { file: 'Lecon_3.1_Faire_une_Demande_Polie.md', num: '3.1', titleEn: 'Making a Polite Request', titleFr: 'Faire une Demande Polie' },
          { file: 'Lecon_3.2_Exprimer_Besoins_et_Preferences.md', num: '3.2', titleEn: 'Expressing Needs & Preferences', titleFr: 'Exprimer Besoins et Préférences' },
          { file: 'Lecon_3.3_La_Pause_Cafe.md', num: '3.3', titleEn: 'The Coffee Break', titleFr: 'La Pause Café' },
          { file: 'Lecon_3.4_Reagir_et_Repondre.md', num: '3.4', titleEn: 'Reacting & Responding', titleFr: 'Réagir et Répondre' },
        ]
      },
      {
        dirName: 'Module_4_Vers_Autonomie',
        moduleNumber: 4,
        titleEn: 'Module 4: Toward Autonomy',
        titleFr: 'Module 4 : Vers l\'Autonomie',
        descEn: 'Develop autonomy: describe problems, confirm information, discuss past experiences, and complete your final project.',
        descFr: 'Développez votre autonomie : décrire des problèmes, confirmer des informations, discuter d\'expériences passées et compléter votre projet final.',
        lessons: [
          { file: 'Lecon_4.1_Decrire_un_Probleme_Simple.md', num: '4.1', titleEn: 'Describing a Simple Problem', titleFr: 'Décrire un Problème Simple' },
          { file: 'Lecon_4.2_Confirmer_et_Verifier.md', num: '4.2', titleEn: 'Confirming & Verifying', titleFr: 'Confirmer et Vérifier' },
          { file: 'Lecon_4.3_Parler_de_son_Experience_Passee.md', num: '4.3', titleEn: 'Talking About Past Experience', titleFr: 'Parler de son Expérience Passée' },
          { file: 'Lecon_4.4_Projet_Final.md', num: '4.4', titleEn: 'Final Project', titleFr: 'Projet Final' },
        ]
      }
    ]
  },
  {
    pathNumber: 2,
    titleEn: 'Path II: Everyday Communication (A2)',
    titleFr: 'Parcours II : Communication Quotidienne (A2)',
    descEn: 'Expand your professional French with electronic communication, social interactions, administrative tasks, and navigating your workplace environment.',
    descFr: 'Élargissez votre français professionnel avec la communication électronique, les interactions sociales, les tâches administratives et la navigation dans votre environnement de travail.',
    shortDescEn: 'Master everyday workplace French communication (A2)',
    shortDescFr: 'Maîtrisez la communication quotidienne au travail en français (A2)',
    level: 'beginner',
    cefrLevel: 'A2',
    slug: 'path-ii-everyday-communication',
    estimatedHours: 35,
    price: 499,
    contentDir: 'Path_II_COMPLET',
    modules: [
      {
        dirName: 'Module_5_Communication_Electronique',
        moduleNumber: 5,
        titleEn: 'Module 5: Electronic Communication',
        titleFr: 'Module 5 : Communication Électronique',
        descEn: 'Master professional digital communication: out-of-office emails, email chains, voicemail, and team chat.',
        descFr: 'Maîtrisez la communication numérique professionnelle : courriels d\'absence, chaînes de courriels, messagerie vocale et clavardage d\'équipe.',
        lessons: [
          { file: 'Lecon_5.1_Courriel_Absence.md', num: '5.1', titleEn: 'Out-of-Office Email', titleFr: 'Courriel d\'Absence' },
          { file: 'Lecon_5.2_Chaine_Courriels.md', num: '5.2', titleEn: 'Email Chains', titleFr: 'Chaîne de Courriels' },
          { file: 'Lecon_5.3_Message_Vocal.md', num: '5.3', titleEn: 'Voicemail Messages', titleFr: 'Message Vocal' },
          { file: 'Lecon_5.4_Clavardage_Equipe.md', num: '5.4', titleEn: 'Team Chat', titleFr: 'Clavardage d\'Équipe' },
        ]
      },
      {
        dirName: 'Module_6_Interactions_Sociales',
        moduleNumber: 6,
        titleEn: 'Module 6: Social Interactions',
        titleFr: 'Module 6 : Interactions Sociales',
        descEn: 'Navigate workplace social situations: invitations, casual conversations, personal questions, and offering help.',
        descFr: 'Naviguez les situations sociales au travail : invitations, conversations informelles, questions personnelles et offrir de l\'aide.',
        lessons: [
          { file: 'Lecon_6.1_Invitations.md', num: '6.1', titleEn: 'Invitations', titleFr: 'Invitations' },
          { file: 'Lecon_6.2_Parler_du_Weekend.md', num: '6.2', titleEn: 'Talking About the Weekend', titleFr: 'Parler du Weekend' },
          { file: 'Lecon_6.3_Questions_Personnelles.md', num: '6.3', titleEn: 'Personal Questions', titleFr: 'Questions Personnelles' },
          { file: 'Lecon_6.4_Offrir_Aide.md', num: '6.4', titleEn: 'Offering Help', titleFr: 'Offrir de l\'Aide' },
        ]
      },
      {
        dirName: 'Module_7_Taches_Administratives',
        moduleNumber: 7,
        titleEn: 'Module 7: Administrative Tasks',
        titleFr: 'Module 7 : Tâches Administratives',
        descEn: 'Handle administrative tasks in French: booking rooms, service notes, office supplies, and timesheets.',
        descFr: 'Gérez les tâches administratives en français : réservation de salles, notes de service, fournitures de bureau et feuilles de temps.',
        lessons: [
          { file: 'Lecon_7.1_Reserver_Salle.md', num: '7.1', titleEn: 'Booking a Room', titleFr: 'Réserver une Salle' },
          { file: 'Lecon_7.2_Notes_Service.md', num: '7.2', titleEn: 'Service Notes', titleFr: 'Notes de Service' },
          { file: 'Lecon_7.3_Fournitures_Bureau.md', num: '7.3', titleEn: 'Office Supplies', titleFr: 'Fournitures de Bureau' },
          { file: 'Lecon_7.4_Feuille_Temps.md', num: '7.4', titleEn: 'Timesheets', titleFr: 'Feuille de Temps' },
        ]
      },
      {
        dirName: 'Module_8_Sorienter',
        moduleNumber: 8,
        titleEn: 'Module 8: Finding Your Way',
        titleFr: 'Module 8 : S\'orienter',
        descEn: 'Navigate physical and virtual spaces: building directions, evacuation plans, workstation setup, and public transit.',
        descFr: 'Naviguez les espaces physiques et virtuels : directions dans l\'immeuble, plans d\'évacuation, poste de travail et transport en commun.',
        lessons: [
          { file: 'Lecon_8.1_Directions_Immeuble.md', num: '8.1', titleEn: 'Building Directions', titleFr: 'Directions dans l\'Immeuble' },
          { file: 'Lecon_8.2_Plan_Evacuation.md', num: '8.2', titleEn: 'Evacuation Plan', titleFr: 'Plan d\'Évacuation' },
          { file: 'Lecon_8.3_Poste_Travail.md', num: '8.3', titleEn: 'Workstation Setup', titleFr: 'Poste de Travail' },
          { file: 'Lecon_8.4_Transport_Commun.md', num: '8.4', titleEn: 'Public Transit', titleFr: 'Transport en Commun' },
        ]
      }
    ]
  },
  {
    pathNumber: 3,
    titleEn: 'Path III: Operational French (B1)',
    titleFr: 'Parcours III : Français Opérationnel (B1)',
    descEn: 'Develop operational fluency for meetings, written communication, presentations, and negotiation in government contexts.',
    descFr: 'Développez votre aisance opérationnelle pour les réunions, la communication écrite, les présentations et la négociation dans les contextes gouvernementaux.',
    shortDescEn: 'Operational fluency for professional government contexts (B1)',
    shortDescFr: 'Aisance opérationnelle pour les contextes gouvernementaux professionnels (B1)',
    level: 'intermediate',
    cefrLevel: 'B1',
    slug: 'path-iii-operational-french',
    estimatedHours: 40,
    price: 599,
    contentDir: 'Path_III_COMPLET',
    modules: [
      {
        dirName: 'Module_9_Participer_Reunion',
        moduleNumber: 9,
        titleEn: 'Module 9: Participating in Meetings',
        titleFr: 'Module 9 : Participer aux Réunions',
        descEn: 'Master meeting participation: understanding agendas, giving opinions, asking clarification questions, and summarizing action items.',
        descFr: 'Maîtrisez la participation aux réunions : comprendre les ordres du jour, donner son opinion, poser des questions de clarification et résumer les points d\'action.',
        lessons: [
          { file: 'Lecon_9.1_Comprendre_Ordre_du_Jour.md', num: '9.1', titleEn: 'Understanding the Agenda', titleFr: 'Comprendre l\'Ordre du Jour' },
          { file: 'Lecon_9.2_Donner_Opinion.md', num: '9.2', titleEn: 'Giving Your Opinion', titleFr: 'Donner son Opinion' },
          { file: 'Lecon_9.3_Questions_Clarification.md', num: '9.3', titleEn: 'Clarification Questions', titleFr: 'Questions de Clarification' },
          { file: 'Lecon_9.4_Resumer_Points_Action.md', num: '9.4', titleEn: 'Summarizing Action Items', titleFr: 'Résumer les Points d\'Action' },
        ]
      },
      {
        dirName: 'Module_10_Communication_Ecrite',
        moduleNumber: 10,
        titleEn: 'Module 10: Written Communication',
        titleFr: 'Module 10 : Communication Écrite',
        descEn: 'Develop professional writing skills: formal emails, meeting minutes, briefing notes, and project reports.',
        descFr: 'Développez vos compétences rédactionnelles professionnelles : courriels formels, procès-verbaux, notes d\'information et rapports de projet.',
        lessons: [
          { file: 'Lecon_10.1_Rediger_Compte_Rendu.md', num: '10.1', titleEn: 'Writing Meeting Minutes', titleFr: 'Rédiger un Compte Rendu' },
          { file: 'Lecon_10.2_Demander_Revision.md', num: '10.2', titleEn: 'Requesting a Revision', titleFr: 'Demander une Révision' },
          { file: 'Lecon_10.3_Ecrire_Rapport_Simple.md', num: '10.3', titleEn: 'Writing a Simple Report', titleFr: 'Écrire un Rapport Simple' },
          { file: 'Lecon_10.4_Biographie_Professionnelle.md', num: '10.4', titleEn: 'Professional Biography', titleFr: 'Biographie Professionnelle' },
        ]
      },
      {
        dirName: 'Module_11_Presentations_Simples',
        moduleNumber: 11,
        titleEn: 'Module 11: Simple Presentations',
        titleFr: 'Module 11 : Présentations Simples',
        descEn: 'Build presentation skills: structuring content, using visual aids, handling Q&A, and closing professionally.',
        descFr: 'Développez vos compétences de présentation : structurer le contenu, utiliser des supports visuels, gérer les questions-réponses et conclure professionnellement.',
        lessons: [
          { file: 'Lecon_11.1_Donnees_Chiffrees.md', num: '11.1', titleEn: 'Numerical Data', titleFr: 'Données Chiffrées' },
          { file: 'Lecon_11.2_Processus_Etapes.md', num: '11.2', titleEn: 'Processes & Steps', titleFr: 'Processus et Étapes' },
          { file: 'Lecon_11.3_Questions_Auditoire.md', num: '11.3', titleEn: 'Audience Questions', titleFr: 'Questions de l\'Auditoire' },
          { file: 'Lecon_11.4_Conclure_Remercier.md', num: '11.4', titleEn: 'Concluding & Thanking', titleFr: 'Conclure et Remercier' },
        ]
      },
      {
        dirName: 'Module_12_Negociation_Persuasion',
        moduleNumber: 12,
        titleEn: 'Module 12: Negotiation & Persuasion',
        titleFr: 'Module 12 : Négociation et Persuasion',
        descEn: 'Develop negotiation and persuasion skills: expressing needs, negotiating deadlines, presenting advantages, and managing disagreements.',
        descFr: 'Développez vos compétences en négociation et persuasion : exprimer des besoins, négocier des échéances, présenter des avantages et gérer les désaccords.',
        lessons: [
          { file: 'Lecon_12.1_Exprimer_Besoin.md', num: '12.1', titleEn: 'Expressing a Need', titleFr: 'Exprimer un Besoin' },
          { file: 'Lecon_12.2_Negocier_Echeance.md', num: '12.2', titleEn: 'Negotiating Deadlines', titleFr: 'Négocier une Échéance' },
          { file: 'Lecon_12.3_Avantages_Proposition.md', num: '12.3', titleEn: 'Presenting Advantages', titleFr: 'Avantages d\'une Proposition' },
          { file: 'Lecon_12.4_Gerer_Desaccord.md', num: '12.4', titleEn: 'Managing Disagreements', titleFr: 'Gérer un Désaccord' },
        ]
      }
    ]
  },
  {
    pathNumber: 4,
    titleEn: 'Path IV: Professional Mastery (B2)',
    titleFr: 'Parcours IV : Maîtrise Professionnelle (B2)',
    descEn: 'Achieve professional mastery in French: lead meetings, manage projects, handle sensitive communications, and demonstrate leadership.',
    descFr: 'Atteignez la maîtrise professionnelle en français : animer des réunions, gérer des projets, traiter des communications sensibles et démontrer du leadership.',
    shortDescEn: 'Professional mastery for leadership contexts (B2)',
    shortDescFr: 'Maîtrise professionnelle pour les contextes de leadership (B2)',
    level: 'intermediate',
    cefrLevel: 'B2',
    slug: 'path-iv-professional-mastery',
    estimatedHours: 45,
    price: 699,
    contentDir: 'Path_IV_COMPLET',
    modules: [
      {
        dirName: 'Module_13_Communication_Influence',
        moduleNumber: 13,
        titleEn: 'Module 13: Communication & Influence',
        titleFr: 'Module 13 : Communication et Influence',
        descEn: 'Lead meetings, present complex arguments, write information notes, and conduct job interviews in French.',
        descFr: 'Animez des réunions, présentez des argumentaires complexes, rédigez des notes d\'information et menez des entretiens d\'embauche en français.',
        lessons: [
          { file: 'Lecon_13.1_Animer_Reunion.md', num: '13.1', titleEn: 'Leading a Meeting', titleFr: 'Animer une Réunion' },
          { file: 'Lecon_13.2_Presenter_Argumentaire_Complexe.md', num: '13.2', titleEn: 'Presenting Complex Arguments', titleFr: 'Présenter un Argumentaire Complexe' },
          { file: 'Lecon_13.3_Rediger_Note_Information.md', num: '13.3', titleEn: 'Writing an Information Note', titleFr: 'Rédiger une Note d\'Information' },
          { file: 'Lecon_13.4_Mener_Entretien_Embauche.md', num: '13.4', titleEn: 'Conducting a Job Interview', titleFr: 'Mener un Entretien d\'Embauche' },
        ]
      },
      {
        dirName: 'Module_14_Gestion_Projets',
        moduleNumber: 14,
        titleEn: 'Module 14: Project Management',
        titleFr: 'Module 14 : Gestion de Projets',
        descEn: 'Master project communication: present project plans, write progress reports, facilitate brainstorming, and communicate with stakeholders.',
        descFr: 'Maîtrisez la communication de projet : présenter des plans de projet, rédiger des rapports d\'étape, animer des séances de remue-méninges et communiquer avec les parties prenantes.',
        lessons: [
          { file: 'Lecon_14.1_Presenter_Plan_Projet.md', num: '14.1', titleEn: 'Presenting a Project Plan', titleFr: 'Présenter un Plan de Projet' },
          { file: 'Lecon_14.2_Rediger_Rapport_Etape.md', num: '14.2', titleEn: 'Writing a Progress Report', titleFr: 'Rédiger un Rapport d\'Étape' },
          { file: 'Lecon_14.3_Animer_Seance_Remue_Meninges.md', num: '14.3', titleEn: 'Facilitating Brainstorming', titleFr: 'Animer une Séance de Remue-Méninges' },
          { file: 'Lecon_14.4_Communiquer_Parties_Prenantes.md', num: '14.4', titleEn: 'Communicating with Stakeholders', titleFr: 'Communiquer avec les Parties Prenantes' },
        ]
      },
      {
        dirName: 'Module_15_Communication_Sensible',
        moduleNumber: 15,
        titleEn: 'Module 15: Sensitive Communication',
        titleFr: 'Module 15 : Communication Sensible',
        descEn: 'Handle sensitive situations: constructive feedback, client complaints, organizational change communication, and negotiating compromises.',
        descFr: 'Gérez les situations sensibles : rétroaction constructive, plaintes de clients, communication de changement organisationnel et négociation de compromis.',
        lessons: [
          { file: 'Lecon_15.1_Donner_Retroaction_Constructive.md', num: '15.1', titleEn: 'Giving Constructive Feedback', titleFr: 'Donner une Rétroaction Constructive' },
          { file: 'Lecon_15.2_Gerer_Plainte_Client.md', num: '15.2', titleEn: 'Handling a Client Complaint', titleFr: 'Gérer une Plainte Client' },
          { file: 'Lecon_15.3_Communiquer_Changement_Organisationnel.md', num: '15.3', titleEn: 'Communicating Organizational Change', titleFr: 'Communiquer un Changement Organisationnel' },
          { file: 'Lecon_15.4_Negocier_Compromis.md', num: '15.4', titleEn: 'Negotiating a Compromise', titleFr: 'Négocier un Compromis' },
        ]
      },
      {
        dirName: 'Module_16_Leadership_Influence',
        moduleNumber: 16,
        titleEn: 'Module 16: Leadership & Influence',
        titleFr: 'Module 16 : Leadership et Influence',
        descEn: 'Demonstrate leadership through French: delegate tasks, present strategic vision, facilitate debates, and close meetings effectively.',
        descFr: 'Démontrez votre leadership en français : déléguer des tâches, présenter une vision stratégique, animer des débats et conclure des réunions efficacement.',
        lessons: [
          { file: 'Lecon_16.1_Deleguer_Tache.md', num: '16.1', titleEn: 'Delegating a Task', titleFr: 'Déléguer une Tâche' },
          { file: 'Lecon_16.2_Presenter_Vision_Strategique.md', num: '16.2', titleEn: 'Presenting a Strategic Vision', titleFr: 'Présenter une Vision Stratégique' },
          { file: 'Lecon_16.3_Animer_Debat.md', num: '16.3', titleEn: 'Facilitating a Debate', titleFr: 'Animer un Débat' },
          { file: 'Lecon_16.4_Conclure_Reunion.md', num: '16.4', titleEn: 'Closing a Meeting', titleFr: 'Conclure une Réunion' },
        ]
      }
    ]
  },
  {
    pathNumber: 5,
    titleEn: 'Path V: Executive French (C1)',
    titleFr: 'Parcours V : Français Exécutif (C1)',
    descEn: 'Master executive-level French for senior leadership: strategic vision, policy analysis, crisis communication, and diplomatic negotiation.',
    descFr: 'Maîtrisez le français de niveau exécutif pour la haute direction : vision stratégique, analyse de politiques, communication de crise et négociation diplomatique.',
    shortDescEn: 'Executive-level French for senior leadership (C1)',
    shortDescFr: 'Français de niveau exécutif pour la haute direction (C1)',
    level: 'advanced',
    cefrLevel: 'C1',
    slug: 'path-v-executive-french',
    estimatedHours: 50,
    price: 799,
    contentDir: 'Path_V_COMPLET',
    modules: [
      {
        dirName: 'Module_17_Leadership_Vision',
        moduleNumber: 17,
        titleEn: 'Module 17: Leadership & Vision',
        titleFr: 'Module 17 : Leadership et Vision',
        descEn: 'Communicate at the executive level: present to senior management, draft cabinet memos, lead interministerial committees, and conduct public consultations.',
        descFr: 'Communiquez au niveau exécutif : présenter à la haute direction, rédiger des mémoires au Cabinet, diriger des comités interministériels et mener des consultations publiques.',
        lessons: [
          { file: 'Lecon_17.1_Vision_Haute_Direction.md', num: '17.1', titleEn: 'Vision for Senior Management', titleFr: 'Vision pour la Haute Direction' },
          { file: 'Lecon_17.2_Memoire_Cabinet.md', num: '17.2', titleEn: 'Cabinet Memo', titleFr: 'Mémoire au Cabinet' },
          { file: 'Lecon_17.3_Comite_Interministeriel.md', num: '17.3', titleEn: 'Interministerial Committee', titleFr: 'Comité Interministériel' },
          { file: 'Lecon_17.4_Consultation_Publique.md', num: '17.4', titleEn: 'Public Consultation', titleFr: 'Consultation Publique' },
        ]
      },
      {
        dirName: 'Module_18_Analyse_Synthese',
        moduleNumber: 18,
        titleEn: 'Module 18: Analysis & Synthesis',
        titleFr: 'Module 18 : Analyse et Synthèse',
        descEn: 'Master analytical communication: policy documents, comparative analysis, research reports, and presenting analysis results.',
        descFr: 'Maîtrisez la communication analytique : documents de politique, analyse comparative, rapports de recherche et présentation de résultats d\'analyse.',
        lessons: [
          { file: 'Lecon_18.1_Documents_Politique.md', num: '18.1', titleEn: 'Policy Documents', titleFr: 'Documents de Politique' },
          { file: 'Lecon_18.2_Analyse_Comparative.md', num: '18.2', titleEn: 'Comparative Analysis', titleFr: 'Analyse Comparative' },
          { file: 'Lecon_18.3_Rapport_Recherche.md', num: '18.3', titleEn: 'Research Report', titleFr: 'Rapport de Recherche' },
          { file: 'Lecon_18.4_Resultats_Analyse.md', num: '18.4', titleEn: 'Analysis Results', titleFr: 'Résultats d\'Analyse' },
        ]
      },
      {
        dirName: 'Module_19_Communication_Crise',
        moduleNumber: 19,
        titleEn: 'Module 19: Crisis Communication',
        titleFr: 'Module 19 : Communication de Crise',
        descEn: 'Handle crisis situations: emergency communiqués, press briefings, difficult interviews, and internal stakeholder communication.',
        descFr: 'Gérez les situations de crise : communiqués d\'urgence, points de presse, entrevues difficiles et communication avec les parties prenantes internes.',
        lessons: [
          { file: 'Lecon_19.1_Communique_Urgence.md', num: '19.1', titleEn: 'Emergency Communiqué', titleFr: 'Communiqué d\'Urgence' },
          { file: 'Lecon_19.2_Point_Presse.md', num: '19.2', titleEn: 'Press Briefing', titleFr: 'Point de Presse' },
          { file: 'Lecon_19.3_Entrevue_Difficile.md', num: '19.3', titleEn: 'Difficult Interview', titleFr: 'Entrevue Difficile' },
          { file: 'Lecon_19.4_Parties_Prenantes_Internes.md', num: '19.4', titleEn: 'Internal Stakeholders', titleFr: 'Parties Prenantes Internes' },
        ]
      },
      {
        dirName: 'Module_20_Negociation_Diplomatie',
        moduleNumber: 20,
        titleEn: 'Module 20: Negotiation & Diplomacy',
        titleFr: 'Module 20 : Négociation et Diplomatie',
        descEn: 'Master diplomatic negotiation: handling objections, finding common ground, multilateral meetings, and writing meeting reports.',
        descFr: 'Maîtrisez la négociation diplomatique : gérer les objections, trouver un terrain d\'entente, réunions multilatérales et rédaction de comptes rendus.',
        lessons: [
          { file: 'Lecon_20.1_Reserves_Objections.md', num: '20.1', titleEn: 'Reservations & Objections', titleFr: 'Réserves et Objections' },
          { file: 'Lecon_20.2_Compromis_Terrain_Entente.md', num: '20.2', titleEn: 'Compromise & Common Ground', titleFr: 'Compromis et Terrain d\'Entente' },
          { file: 'Lecon_20.3_Rencontre_Multilaterale.md', num: '20.3', titleEn: 'Multilateral Meeting', titleFr: 'Rencontre Multilatérale' },
          { file: 'Lecon_20.4_Compte_Rendu.md', num: '20.4', titleEn: 'Meeting Report', titleFr: 'Compte Rendu' },
        ]
      }
    ]
  },
  {
    pathNumber: 6,
    titleEn: 'Path VI: SLE Exam Preparation (B2-C1)',
    titleFr: 'Parcours VI : Préparation aux ELS (B2-C1)',
    descEn: 'Comprehensive preparation for the Second Language Evaluation (SLE) exams: reading comprehension, written expression, oral comprehension, and oral expression strategies.',
    descFr: 'Préparation complète aux examens d\'Évaluation de Langue Seconde (ELS) : compréhension de l\'écrit, expression écrite, compréhension de l\'oral et stratégies d\'expression orale.',
    shortDescEn: 'Complete SLE exam preparation for Canadian public servants (B2-C1)',
    shortDescFr: 'Préparation complète aux examens ELS pour les fonctionnaires canadiens (B2-C1)',
    level: 'advanced',
    cefrLevel: 'exam_prep',
    slug: 'path-vi-sle-preparation',
    estimatedHours: 50,
    price: 899,
    contentDir: 'Path_VI_COMPLET',
    modules: [
      {
        dirName: 'Module_21_Comprehension_Ecrite',
        moduleNumber: 21,
        titleEn: 'Module 21: Reading Comprehension',
        titleFr: 'Module 21 : Compréhension de l\'Écrit',
        descEn: 'Master SLE reading comprehension: speed reading strategies, decoding question types, understanding administrative texts, and practice tests.',
        descFr: 'Maîtrisez la compréhension de l\'écrit des ELS : stratégies de lecture rapide, décoder les types de questions, comprendre les textes administratifs et tests blancs.',
        lessons: [
          { file: 'Lecon_21.1_Strategies_Lecture_Rapide.md', num: '21.1', titleEn: 'Speed Reading Strategies', titleFr: 'Stratégies de Lecture Rapide' },
          { file: 'Lecon_21.2_Decoder_Types_Questions.md', num: '21.2', titleEn: 'Decoding Question Types', titleFr: 'Décoder les Types de Questions' },
          { file: 'Lecon_21.3_Comprendre_Textes_Administratifs.md', num: '21.3', titleEn: 'Understanding Administrative Texts', titleFr: 'Comprendre les Textes Administratifs' },
          { file: 'Lecon_21.4_Reussir_Test_Blanc.md', num: '21.4', titleEn: 'Passing the Practice Test', titleFr: 'Réussir le Test Blanc' },
        ]
      },
      {
        dirName: 'Module_22_Expression_Ecrite',
        moduleNumber: 22,
        titleEn: 'Module 22: Written Expression',
        titleFr: 'Module 22 : Expression Écrite',
        descEn: 'Excel in SLE written expression: constrained emails, service notes, argumentative texts, and timed performance.',
        descFr: 'Excellez en expression écrite des ELS : courriels sous contrainte, notes de service, textes argumentatifs et performance chronométrée.',
        lessons: [
          { file: 'Lecon_22.1_Rediger_Courriel_Contrainte.md', num: '22.1', titleEn: 'Writing Constrained Emails', titleFr: 'Rédiger un Courriel sous Contrainte' },
          { file: 'Lecon_22.2_Produire_Note_Service.md', num: '22.2', titleEn: 'Producing a Service Note', titleFr: 'Produire une Note de Service' },
          { file: 'Lecon_22.3_Rediger_Texte_Argumentatif.md', num: '22.3', titleEn: 'Writing an Argumentative Text', titleFr: 'Rédiger un Texte Argumentatif' },
          { file: 'Lecon_22.4_Performance_Expression_Ecrite.md', num: '22.4', titleEn: 'Written Expression Performance', titleFr: 'Performance en Expression Écrite' },
        ]
      },
      {
        dirName: 'Module_23_Comprehension_Oral',
        moduleNumber: 23,
        titleEn: 'Module 23: Oral Comprehension',
        titleFr: 'Module 23 : Compréhension de l\'Oral',
        descEn: 'Master SLE oral comprehension: active listening, strategic note-taking, implicit inference, and mental synthesis.',
        descFr: 'Maîtrisez la compréhension de l\'oral des ELS : écoute active, prise de notes stratégique, inférence implicite et synthèse mentale.',
        lessons: [
          { file: 'Lecon_23.1_Ecoute_Active_Predictive.md', num: '23.1', titleEn: 'Active & Predictive Listening', titleFr: 'Écoute Active et Prédictive' },
          { file: 'Lecon_23.2_Prise_de_Notes_Strategique.md', num: '23.2', titleEn: 'Strategic Note-Taking', titleFr: 'Prise de Notes Stratégique' },
          { file: 'Lecon_23.3_Inference_Implicite.md', num: '23.3', titleEn: 'Implicit Inference', titleFr: 'Inférence Implicite' },
          { file: 'Lecon_23.4_Synthese_Mentale.md', num: '23.4', titleEn: 'Mental Synthesis', titleFr: 'Synthèse Mentale' },
        ]
      },
      {
        dirName: 'Module_24_Expression_Orale',
        moduleNumber: 24,
        titleEn: 'Module 24: Oral Expression',
        titleFr: 'Module 24 : Expression Orale',
        descEn: 'Excel in SLE oral expression: fluency and rhythm, lexical precision, discourse structure, and interaction repair.',
        descFr: 'Excellez en expression orale des ELS : fluidité et rythme, précision lexicale, structure du discours et réparation d\'interaction.',
        lessons: [
          { file: 'Lecon_24.1_Fluidite_Rythme.md', num: '24.1', titleEn: 'Fluency & Rhythm', titleFr: 'Fluidité et Rythme' },
          { file: 'Lecon_24.2_Precision_Lexicale.md', num: '24.2', titleEn: 'Lexical Precision', titleFr: 'Précision Lexicale' },
          { file: 'Lecon_24.3_Structure_Discours.md', num: '24.3', titleEn: 'Discourse Structure', titleFr: 'Structure du Discours' },
          { file: 'Lecon_24.4_Interaction_Reparation.md', num: '24.4', titleEn: 'Interaction & Repair', titleFr: 'Interaction et Réparation' },
        ]
      }
    ]
  }
];

// ============================================================================
// SLOT TYPE MAPPING
// ============================================================================
const SLOT_TYPES = [
  'introduction',      // Slot 1
  'video_scenario',    // Slot 2
  'grammar_point',     // Slot 3
  'written_practice',  // Slot 4
  'oral_practice',     // Slot 5
  'quiz_slot',         // Slot 6
  'coaching_tip'       // Slot 7
];

const SLOT_ACTIVITY_TYPES = [
  'text',              // Slot 1: Introduction
  'video',             // Slot 2: Video Scenario
  'text',              // Slot 3: Grammar Point
  'assignment',        // Slot 4: Written Practice
  'speaking_exercise', // Slot 5: Oral Practice
  'quiz',              // Slot 6: Quiz
  'text'               // Slot 7: Coaching Tip
];

const SLOT_LABELS_EN = [
  'Introduction',
  'Video Scenario',
  'Grammar Point',
  'Written Practice',
  'Oral Practice',
  'Quiz',
  'Coaching Tip'
];

const SLOT_LABELS_FR = [
  'Introduction',
  'Scénario Vidéo',
  'Point de Grammaire',
  'Pratique Écrite',
  'Pratique Orale',
  'Quiz',
  'Conseil du Coach'
];

// ============================================================================
// CONTENT PARSER — Extracts 7 slots from a lesson markdown file
// ============================================================================
function parseSlots(fileContent) {
  const slots = [];
  
  // Normalize: handle the weird first-line-is-all-one-line format in Path I
  // Some files have triple-quote wrappers
  let content = fileContent.replace(/'''/g, '');
  
  // Path I has SLOT 1 embedded in a massive single first line
  // Pre-process: if first line contains ## SLOT 1, split it out
  const lines = content.split('\n');
  if (lines[0] && lines[0].includes('## SLOT 1') && lines[0].length > 500) {
    // This is the compressed Path I format - extract SLOT 1 content from first line
    const slot1Match = lines[0].match(/## SLOT 1\s*[:\s—–-]\s*(.*?)$/);
    if (slot1Match) {
      const beforeSlot1 = lines[0].substring(0, lines[0].indexOf('## SLOT 1'));
      const slot1Content = slot1Match[1];
      // Replace first line with just the slot 1 header on its own line
      lines[0] = beforeSlot1;
      lines.splice(1, 0, '## SLOT 1 : Introduction');
      lines.splice(2, 0, slot1Content);
      content = lines.join('\n');
    }
  }
  
  // Split by SLOT headers (## SLOT or ### SLOT or ### **SLOT)
  // Match patterns like: ## SLOT 1, ### SLOT 1, ### **SLOT 1
  const slotRegex = /^(?:#{2,3})\s*\**\s*SLOT\s+(\d+)\s*[—–:\s-]\s*(.*?)\**\s*$/gm;
  
  const slotPositions = [];
  let match;
  while ((match = slotRegex.exec(content)) !== null) {
    slotPositions.push({
      slotNum: parseInt(match[1]),
      headerText: match[2].replace(/\*+$/, '').trim(),
      startIndex: match.index,
      headerEnd: match.index + match[0].length
    });
  }
  
  // Fallback: try inline format
  if (slotPositions.length === 0) {
    const inlineSlotRegex = /## SLOT (\d+)\s*[:\s]/g;
    while ((match = inlineSlotRegex.exec(content)) !== null) {
      slotPositions.push({
        slotNum: parseInt(match[1]),
        headerText: '',
        startIndex: match.index,
        headerEnd: match.index + match[0].length
      });
    }
  }
  
  // Extract content between slots
  for (let i = 0; i < slotPositions.length; i++) {
    const startPos = slotPositions[i].headerEnd;
    const endPos = i + 1 < slotPositions.length ? slotPositions[i + 1].startIndex : content.length;
    const slotContent = content.substring(startPos, endPos).trim();
    
    // Remove trailing ANNEXES section if present
    const annexeIdx = slotContent.indexOf('## ANNEXES');
    const cleanContent = annexeIdx > -1 ? slotContent.substring(0, annexeIdx).trim() : slotContent;
    
    slots.push({
      slotNum: slotPositions[i].slotNum,
      header: slotPositions[i].headerText,
      content: cleanContent
    });
  }
  
  return slots;
}

// ============================================================================
// QUIZ PARSER — Extracts quiz JSON from slot 6 content
// ============================================================================
function extractQuizJson(slotContent) {
  // Find JSON block in the content
  const jsonMatch = slotContent.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) {
    // Try to find raw JSON object
    const rawJsonMatch = slotContent.match(/\{\s*"questions"\s*:\s*\[[\s\S]*?\]\s*\}/);
    if (rawJsonMatch) {
      try {
        return JSON.parse(rawJsonMatch[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  
  try {
    return JSON.parse(jsonMatch[1].trim());
  } catch (e) {
    // Try to fix common JSON issues
    let fixed = jsonMatch[1].trim();
    // Remove trailing commas before closing brackets
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.warn('  ⚠ Could not parse quiz JSON');
      return null;
    }
  }
}

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================
async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const stats = {
    coursesCreated: 0,
    coursesUpdated: 0,
    modulesCreated: 0,
    modulesUpdated: 0,
    lessonsCreated: 0,
    lessonsUpdated: 0,
    activitiesCreated: 0,
    activitiesUpdated: 0,
    quizQuestionsCreated: 0,
    quizzesCreated: 0,
    learningPathsCreated: 0,
    pathCoursesCreated: 0,
    errors: []
  };
  
  try {
    for (const pathDef of PATH_DEFINITIONS) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 Processing Path ${pathDef.pathNumber}: ${pathDef.titleEn}`);
      console.log(`${'='.repeat(60)}`);
      
      let courseId;
      
      if (pathDef.pathNumber === 1) {
        // UPDATE existing Path I
        courseId = 90007;
        await conn.query(`UPDATE courses SET 
          title = ?, titleFr = ?, description = ?, descriptionFr = ?,
          shortDescription = ?, shortDescriptionFr = ?,
          slug = ?, pathNumber = ?, estimatedHours = ?, level = ?
          WHERE id = ?`, [
          pathDef.titleEn, pathDef.titleFr, pathDef.descEn, pathDef.descFr,
          pathDef.shortDescEn, pathDef.shortDescFr,
          pathDef.slug, pathDef.pathNumber, pathDef.estimatedHours, pathDef.level,
          courseId
        ]);
        
        // Update learning path
        await conn.query(`UPDATE learning_paths SET
          title = ?, titleFr = ?, slug = ?,
          subtitle = ?, subtitleFr = ?,
          description = ?, descriptionFr = ?,
          level = ?, price = ?
          WHERE id = 60007`, [
          pathDef.titleEn, pathDef.titleFr, pathDef.slug,
          pathDef.shortDescEn, pathDef.shortDescFr,
          pathDef.descEn, pathDef.descFr,
          pathDef.cefrLevel, pathDef.price
        ]);
        
        stats.coursesUpdated++;
        console.log(`  ✅ Updated course ${courseId}`);
      } else {
        // INSERT new course
        const [result] = await conn.query(`INSERT INTO courses 
          (title, titleFr, slug, description, descriptionFr, shortDescription, shortDescriptionFr,
           category, level, targetLanguage, price, currency, accessType,
           totalModules, totalLessons, totalActivities, instructorName,
           status, hasCertificate, hasQuizzes, hasDownloads, pathNumber, estimatedHours)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'sle_oral', ?, 'french', ?, 'CAD', 'one_time',
                  4, 16, 112, 'Prof. Steven Rusinga', 'draft', 1, 1, 1, ?, ?)`, [
          pathDef.titleEn, pathDef.titleFr, pathDef.slug,
          pathDef.descEn, pathDef.descFr, pathDef.shortDescEn, pathDef.shortDescFr,
          pathDef.level, pathDef.price, pathDef.pathNumber, pathDef.estimatedHours
        ]);
        courseId = result.insertId;
        stats.coursesCreated++;
        console.log(`  ✅ Created course ${courseId}`);
        
        // Create learning path
        const [lpResult] = await conn.query(`INSERT INTO learning_paths
          (title, titleFr, slug, subtitle, subtitleFr, description, descriptionFr,
           level, price, durationWeeks, structuredHours, totalModules, totalLessons,
           status, displayOrder)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 12, ?, 4, 16, 'draft', ?)`, [
          pathDef.titleEn, pathDef.titleFr, pathDef.slug,
          pathDef.shortDescEn, pathDef.shortDescFr,
          pathDef.descEn, pathDef.descFr,
          pathDef.cefrLevel, pathDef.price, pathDef.estimatedHours,
          pathDef.pathNumber - 1
        ]);
        const lpId = lpResult.insertId;
        stats.learningPathsCreated++;
        
        // Create path_courses link
        await conn.query(`INSERT INTO path_courses (pathId, courseId, orderIndex, isRequired)
          VALUES (?, ?, 0, 1)`, [lpId, courseId]);
        stats.pathCoursesCreated++;
      }
      
      // Process modules
      for (let mi = 0; mi < pathDef.modules.length; mi++) {
        const modDef = pathDef.modules[mi];
        let moduleId;
        
        if (pathDef.pathNumber === 1) {
          // Update existing module
          const existingModuleIds = [120025, 120026, 120027, 120028];
          moduleId = existingModuleIds[mi];
          await conn.query(`UPDATE course_modules SET
            title = ?, titleFr = ?, description = ?, descriptionFr = ?,
            moduleNumber = ?, totalLessons = 4
            WHERE id = ?`, [
            modDef.titleEn, modDef.titleFr, modDef.descEn, modDef.descFr,
            modDef.moduleNumber, moduleId
          ]);
          stats.modulesUpdated++;
        } else {
          // Insert new module
          const [modResult] = await conn.query(`INSERT INTO course_modules
            (courseId, title, titleFr, description, descriptionFr,
             sortOrder, totalLessons, moduleNumber, status)
            VALUES (?, ?, ?, ?, ?, ?, 4, ?, 'draft')`, [
            courseId, modDef.titleEn, modDef.titleFr, modDef.descEn, modDef.descFr,
            mi, modDef.moduleNumber
          ]);
          moduleId = modResult.insertId;
          stats.modulesCreated++;
        }
        
        console.log(`  📦 Module ${modDef.moduleNumber}: ${modDef.titleEn} (ID: ${moduleId})`);
        
        // Process lessons
        for (let li = 0; li < modDef.lessons.length; li++) {
          const lessonDef = modDef.lessons[li];
          const filePath = path.join(CONTENT_DIR, pathDef.contentDir, modDef.dirName, lessonDef.file);
          
          let fileContent;
          try {
            fileContent = fs.readFileSync(filePath, 'utf-8');
          } catch (e) {
            const errMsg = `  ❌ File not found: ${filePath}`;
            console.error(errMsg);
            stats.errors.push(errMsg);
            continue;
          }
          
          // Parse slots from the file
          const slots = parseSlots(fileContent);
          
          let lessonId;
          const lessonTitleEn = `Lesson ${lessonDef.num}: ${lessonDef.titleEn}`;
          const lessonTitleFr = `Leçon ${lessonDef.num} : ${lessonDef.titleFr}`;
          
          if (pathDef.pathNumber === 1) {
            // Update existing lesson
            const existingLessonIds = [
              120097, 120098, 120099, 120100,  // Module 1
              120101, 120102, 120103, 120104,  // Module 2
              120105, 120106, 120107, 120108,  // Module 3
              120109, 120110, 120111, 120112   // Module 4
            ];
            lessonId = existingLessonIds[mi * 4 + li];
            await conn.query(`UPDATE lessons SET
              title = ?, titleFr = ?, lessonNumber = ?, totalSlots = 7, totalActivities = 7
              WHERE id = ?`, [
              lessonTitleEn, lessonTitleFr, li + 1, lessonId
            ]);
            stats.lessonsUpdated++;
          } else {
            // Insert new lesson
            const globalSortOrder = mi * 4 + li;
            const [lessonResult] = await conn.query(`INSERT INTO lessons
              (moduleId, courseId, title, titleFr, sortOrder, lessonNumber,
               totalSlots, totalActivities, status)
              VALUES (?, ?, ?, ?, ?, ?, 7, 7, 'draft')`, [
              moduleId, courseId, lessonTitleEn, lessonTitleFr,
              globalSortOrder, li + 1
            ]);
            lessonId = lessonResult.insertId;
            stats.lessonsCreated++;
          }
          
          console.log(`    📝 Lesson ${lessonDef.num}: ${lessonDef.titleEn} (ID: ${lessonId}, ${slots.length} slots parsed)`);
          
          // Process each slot (1-7)
          for (let si = 0; si < 7; si++) {
            const slotNum = si + 1;
            const slotType = SLOT_TYPES[si];
            const activityType = SLOT_ACTIVITY_TYPES[si];
            const slotLabelEn = SLOT_LABELS_EN[si];
            const slotLabelFr = SLOT_LABELS_FR[si];
            
            // Find the matching slot from parsed content
            const parsedSlot = slots.find(s => s.slotNum === slotNum);
            const slotContent = parsedSlot ? parsedSlot.content : null;
            
            const actTitleEn = `Lesson ${lessonDef.num}: ${lessonDef.titleEn} — ${slotLabelEn}`;
            const actTitleFr = `Leçon ${lessonDef.num} : ${lessonDef.titleFr} — ${slotLabelFr}`;
            
            // For quiz slot, extract JSON and store separately
            let quizJson = null;
            if (slotNum === 6 && slotContent) {
              quizJson = extractQuizJson(slotContent);
            }
            
            if (pathDef.pathNumber === 1) {
              // Update existing activities
              const [existing] = await conn.query(
                'SELECT id FROM activities WHERE lessonId = ? AND slotNumber = ?',
                [lessonId, slotNum]
              );
              
              if (existing.length > 0) {
                await conn.query(`UPDATE activities SET
                  title = ?, titleFr = ?,
                  content = ?, contentFr = ?,
                  slotType = ?, activityType = ?,
                  contentJson = ?, contentJsonFr = ?
                  WHERE id = ?`, [
                  actTitleEn, actTitleFr,
                  slotContent, slotContent, // Content is in French (primary), same for both for now
                  slotType, activityType,
                  quizJson ? JSON.stringify(quizJson) : null,
                  quizJson ? JSON.stringify(quizJson) : null,
                  existing[0].id
                ]);
                stats.activitiesUpdated++;
              }
            } else {
              // Insert new activity
              await conn.query(`INSERT INTO activities
                (lessonId, moduleId, courseId, title, titleFr,
                 content, contentFr, slotIndex, slotNumber, slotType,
                 activityType, isRequired, sortOrder, status, isMandatory,
                 contentJson, contentJsonFr, estimatedMinutes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'draft', 1, ?, ?, ?)`, [
                lessonId, moduleId, courseId, actTitleEn, actTitleFr,
                slotContent, slotContent, slotNum, slotNum, slotType,
                activityType, si,
                quizJson ? JSON.stringify(quizJson) : null,
                quizJson ? JSON.stringify(quizJson) : null,
                [2, 7, 12, 10, 8, 7, 3][si] // estimated minutes per slot type
              ]);
              stats.activitiesCreated++;
            }
            
            // Insert quiz questions if this is slot 6 and we have quiz data
            if (slotNum === 6 && quizJson && quizJson.questions) {
              // First, create a quiz record
              const [quizResult] = await conn.query(`INSERT INTO quizzes
                (lessonId, courseId, title, description, passingScore, 
                 timeLimit, attemptsAllowed, shuffleQuestions, showCorrectAnswers, totalQuestions)
                VALUES (?, ?, ?, ?, 70, 600, 3, 1, 1, ?)`, [
                lessonId, courseId,
                `Quiz — Lesson ${lessonDef.num}`,
                `Quiz for ${lessonDef.titleEn}`,
                quizJson.questions.length
              ]);
              const quizId = quizResult.insertId;
              stats.quizzesCreated++;
              
              for (let qi = 0; qi < quizJson.questions.length; qi++) {
                const q = quizJson.questions[qi];
                // Handle both naming conventions: question/question_text, type/question_type, answer/correct_answer
                const questionText = q.question || q.question_text || q.questionText;
                const qType = q.type || q.question_type || q.questionType || 'multiple-choice';
                const options = q.options ? JSON.stringify(q.options) : null;
                const answer = q.answer !== undefined ? String(q.answer) : (q.correct_answer !== undefined ? String(q.correct_answer) : null);
                const feedback = q.feedback || q.explanation || null;
                
                if (!questionText) {
                  console.warn(`    ⚠ Skipping quiz question ${qi} - no question text found`);
                  continue;
                }
                
                const normalizedType = (qType.includes('fill') || qType.includes('blank')) ? 'fill_blank' : 'multiple_choice';
                
                await conn.query(`INSERT INTO quiz_questions
                  (lessonId, moduleId, courseId, quizId,
                   questionText, questionTextFr, questionType,
                   options, correctAnswer, explanation, explanationFr,
                   points, difficulty, orderIndex, isActive)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10, 'medium', ?, 1)`, [
                  lessonId, moduleId, courseId, quizId,
                  questionText, questionText, // Same text (FR is the primary content)
                  normalizedType,
                  options, answer,
                  feedback, feedback,
                  qi
                ]);
                stats.quizQuestionsCreated++;
              }
            }
          }
        }
      }
    }
    
    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 IMPORT SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`  Courses created:        ${stats.coursesCreated}`);
    console.log(`  Courses updated:        ${stats.coursesUpdated}`);
    console.log(`  Modules created:        ${stats.modulesCreated}`);
    console.log(`  Modules updated:        ${stats.modulesUpdated}`);
    console.log(`  Lessons created:        ${stats.lessonsCreated}`);
    console.log(`  Lessons updated:        ${stats.lessonsUpdated}`);
    console.log(`  Activities created:     ${stats.activitiesCreated}`);
    console.log(`  Activities updated:     ${stats.activitiesUpdated}`);
    console.log(`  Quizzes created:        ${stats.quizzesCreated}`);
    console.log(`  Quiz questions created: ${stats.quizQuestionsCreated}`);
    console.log(`  Learning paths created: ${stats.learningPathsCreated}`);
    console.log(`  Path courses created:   ${stats.pathCoursesCreated}`);
    console.log(`  Errors:                 ${stats.errors.length}`);
    if (stats.errors.length > 0) {
      console.log('\n  Errors:');
      stats.errors.forEach(e => console.log(`    ${e}`));
    }
    
    // Write stats to file
    fs.writeFileSync('/home/ubuntu/import_stats.json', JSON.stringify(stats, null, 2));
    console.log('\n✅ Import complete! Stats saved to /home/ubuntu/import_stats.json');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
