#!/usr/bin/env node
/**
 * REBUILD SEED SCRIPT
 * Cleans the database and rebuilds all 6 Paths with:
 * - Real curriculum content from parsed lesson files
 * - Premium CDN images for covers, thumbnails, badges
 * - Proper bilingual titles from the Master Plan
 * - Quiz questions extracted from lesson files
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '/home/ubuntu/ecosystemhub-preview/.env' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

// Parse DATABASE_URL
const url = new URL(DATABASE_URL);
const dbConfig = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
};

// Load parsed lesson data
const allLessons = JSON.parse(readFileSync('/home/ubuntu/all-lessons-master.json', 'utf-8'));

// Load CDN mapping
const cdnMapping = JSON.parse(readFileSync('/home/ubuntu/cdn-mapping.json', 'utf-8'));

// ============================================================================
// PATH DEFINITIONS (from Master Plan)
// ============================================================================
const PATHS = [
  {
    pathNum: 1,
    roman: 'I',
    slug: 'path-i-foundations',
    title: 'Path I: FSL - Foundations',
    titleFr: 'Path I: FLS - Fondations',
    subtitle: 'Crash Course in Essential Communication Foundations',
    subtitleFr: 'Cours intensif sur les bases essentielles de la communication',
    description: 'Build the fundamental communication skills required for basic professional interactions. Learn to introduce yourself, ask simple questions, understand basic messages, and complete essential forms in a workplace context.',
    descriptionFr: 'Développez les compétences de communication fondamentales requises pour les interactions professionnelles de base. Apprenez à vous présenter, poser des questions simples, comprendre des messages de base et remplir des formulaires essentiels dans un contexte de travail.',
    level: 'beginner',
    cefrLevel: 'A1',
    pflLevel: 'OF 1-6',
    category: 'sle_oral',
    targetLanguage: 'french',
    price: 89900,
    originalPrice: 99900,
    lpLevel: 'A1',
    lpPrice: '899.00',
    lpOriginalPrice: '999.00',
    modules: [
      { num: 1, title: 'First Professional Steps', titleFr: 'Premiers Pas Professionnels', desc: 'Learn to introduce yourself, describe your team and workspace, talk about your daily routine, and ask essential questions.', descFr: 'Apprenez à vous présenter, décrire votre équipe et espace de travail, parler de votre routine quotidienne et poser des questions essentielles.' },
      { num: 2, title: 'Daily Communication', titleFr: 'Communication Quotidienne', desc: 'Master phone calls, essential emails, understanding instructions, and giving simple directions.', descFr: 'Maîtrisez les appels téléphoniques, les courriels essentiels, la compréhension d\'instructions et les directives simples.' },
      { num: 3, title: 'Essential Interactions', titleFr: 'Interactions Essentielles', desc: 'Practice polite requests, expressing needs and preferences, informal conversations, and responding appropriately.', descFr: 'Pratiquez les demandes polies, l\'expression de besoins et préférences, les conversations informelles et les réponses appropriées.' },
      { num: 4, title: 'Towards Autonomy', titleFr: 'Vers l\'Autonomie', desc: 'Describe problems, confirm and verify information, talk about past experiences, and deliver your first presentation.', descFr: 'Décrivez des problèmes, confirmez et vérifiez des informations, parlez de vos expériences passées et faites votre première présentation.' },
    ],
  },
  {
    pathNum: 2,
    roman: 'II',
    slug: 'path-ii-everyday-fluency',
    title: 'Path II: FSL - Everyday Fluency',
    titleFr: 'Path II: FLS - Aisance Quotidienne',
    subtitle: 'Crash Course in Everyday Workplace Interactions',
    subtitleFr: 'Cours intensif sur les interactions quotidiennes au travail',
    description: 'Develop confidence in daily professional interactions. Learn to discuss past events, future plans, and personal opinions. Engage in routine workplace conversations with increasing spontaneity and accuracy.',
    descriptionFr: 'Développez votre confiance dans les interactions professionnelles quotidiennes. Apprenez à discuter d\'événements passés, de projets futurs et d\'opinions personnelles. Participez à des conversations de routine au travail avec une spontanéité et une précision croissantes.',
    level: 'beginner',
    cefrLevel: 'A2',
    pflLevel: 'OF 7-12',
    category: 'sle_oral',
    targetLanguage: 'french',
    price: 89900,
    originalPrice: 99900,
    lpLevel: 'A2',
    lpPrice: '899.00',
    lpOriginalPrice: '999.00',
    modules: [
      { num: 5, title: 'Electronic Communication', titleFr: 'Communication Électronique', desc: 'Master absence emails, email chains, voicemail messages, and team chat communication.', descFr: 'Maîtrisez les courriels d\'absence, les chaînes de courriels, les messages vocaux et la communication par clavardage d\'équipe.' },
      { num: 6, title: 'Social Interactions', titleFr: 'Interactions Sociales', desc: 'Practice invitations, talking about weekends, personal questions, and offering help to colleagues.', descFr: 'Pratiquez les invitations, parler du week-end, les questions personnelles et offrir de l\'aide aux collègues.' },
      { num: 7, title: 'Administrative Tasks', titleFr: 'Tâches Administratives', desc: 'Book meeting rooms, write memos, order office supplies, and complete timesheets.', descFr: 'Réservez des salles de réunion, rédigez des notes de service, commandez des fournitures et remplissez des feuilles de temps.' },
      { num: 8, title: 'Navigating the Workplace', titleFr: 'Se Repérer au Travail', desc: 'Give directions in the building, understand evacuation plans, set up your workstation, and use public transit.', descFr: 'Donnez des directions dans l\'immeuble, comprenez les plans d\'évacuation, aménagez votre poste de travail et utilisez le transport en commun.' },
    ],
  },
  {
    pathNum: 3,
    roman: 'III',
    slug: 'path-iii-professional-interactions',
    title: 'Path III: FSL - Professional Interactions',
    titleFr: 'Path III: FLS - Interactions Professionnelles',
    subtitle: 'From Observer to Active Participant',
    subtitleFr: 'De l\'observateur au participant actif',
    description: 'Transition from passive understanding to active participation in professional settings. Engage in meetings, write reports, deliver presentations, and negotiate with colleagues using structured, confident French.',
    descriptionFr: 'Passez de la compréhension passive à la participation active en milieu professionnel. Participez aux réunions, rédigez des rapports, faites des présentations et négociez avec vos collègues en utilisant un français structuré et confiant.',
    level: 'intermediate',
    cefrLevel: 'B1',
    pflLevel: 'OF 13-18',
    category: 'sle_oral',
    targetLanguage: 'french',
    price: 89900,
    originalPrice: 99900,
    lpLevel: 'B1',
    lpPrice: '899.00',
    lpOriginalPrice: '999.00',
    modules: [
      { num: 9, title: 'Meetings & Discussions', titleFr: 'Réunions et Discussions', desc: 'Understand agendas, give opinions, ask clarification questions, and summarize action points.', descFr: 'Comprenez les ordres du jour, donnez votre opinion, posez des questions de clarification et résumez les points d\'action.' },
      { num: 10, title: 'Professional Writing', titleFr: 'Rédaction Professionnelle', desc: 'Write meeting minutes, request revisions, compose simple reports, and draft professional biographies.', descFr: 'Rédigez des comptes rendus, demandez des révisions, composez des rapports simples et rédigez des biographies professionnelles.' },
      { num: 11, title: 'Presentations', titleFr: 'Présentations', desc: 'Present data, describe processes step by step, handle audience questions, and conclude with thanks.', descFr: 'Présentez des données, décrivez des processus étape par étape, gérez les questions de l\'auditoire et concluez avec des remerciements.' },
      { num: 12, title: 'Negotiation & Persuasion', titleFr: 'Négociation et Persuasion', desc: 'Express needs and constraints, negotiate deadlines, present proposal advantages, and manage disagreements diplomatically.', descFr: 'Exprimez des besoins et contraintes, négociez des échéances, présentez les avantages d\'une proposition et gérez les désaccords avec diplomatie.' },
    ],
  },
  {
    pathNum: 4,
    roman: 'IV',
    slug: 'path-iv-strategic-communication',
    title: 'Path IV: FSL - Strategic Communication',
    titleFr: 'Path IV: FLS - Communication Stratégique',
    subtitle: 'From Participant to Strategic Communicator',
    subtitleFr: 'Du participant au communicateur stratégique',
    description: 'Elevate your communication to strategic levels. Lead meetings, present complex arguments, write briefing notes, conduct interviews, manage projects, give constructive feedback, and negotiate compromises.',
    descriptionFr: 'Élevez votre communication à un niveau stratégique. Animez des réunions, présentez des arguments complexes, rédigez des notes d\'information, menez des entretiens, gérez des projets, donnez de la rétroaction constructive et négociez des compromis.',
    level: 'intermediate',
    cefrLevel: 'B2',
    pflLevel: 'OF 19-24',
    category: 'sle_oral',
    targetLanguage: 'french',
    price: 89900,
    originalPrice: 99900,
    lpLevel: 'B2',
    lpPrice: '899.00',
    lpOriginalPrice: '999.00',
    modules: [
      { num: 13, title: 'Communication & Influence', titleFr: 'Communication et Influence', desc: 'Lead team meetings, present complex arguments, write briefing notes, and conduct job interviews.', descFr: 'Animez des réunions d\'équipe, présentez des arguments complexes, rédigez des notes d\'information et menez des entretiens d\'embauche.' },
      { num: 14, title: 'Project Management', titleFr: 'Gestion de Projet', desc: 'Present project plans, write progress reports, facilitate brainstorming sessions, and communicate with stakeholders.', descFr: 'Présentez des plans de projet, rédigez des rapports d\'étape, animez des séances de remue-méninges et communiquez avec les parties prenantes.' },
      { num: 15, title: 'Conflict Resolution', titleFr: 'Résolution de Conflits', desc: 'Give constructive feedback, handle client complaints, communicate organizational changes, and negotiate compromises.', descFr: 'Donnez de la rétroaction constructive, gérez les plaintes de clients, communiquez les changements organisationnels et négociez des compromis.' },
      { num: 16, title: 'Leadership Communication', titleFr: 'Communication de Leadership', desc: 'Delegate tasks, present strategic visions, facilitate debates, and conclude meetings and projects.', descFr: 'Déléguez des tâches, présentez des visions stratégiques, animez des débats et concluez des réunions et projets.' },
    ],
  },
  {
    pathNum: 5,
    roman: 'V',
    slug: 'path-v-advanced-proficiency',
    title: 'Path V: FSL - Advanced Proficiency',
    titleFr: 'Path V: FLS - Maîtrise Avancée',
    subtitle: 'From Communicator to Bilingual Leader',
    subtitleFr: 'Du communicateur au leader bilingue',
    description: 'Achieve near-native proficiency in professional French. Master executive communication, policy analysis, crisis management, and diplomatic negotiations at the highest levels of government.',
    descriptionFr: 'Atteignez une maîtrise quasi-native du français professionnel. Maîtrisez la communication exécutive, l\'analyse de politiques, la gestion de crise et les négociations diplomatiques aux plus hauts niveaux du gouvernement.',
    level: 'advanced',
    cefrLevel: 'C1',
    pflLevel: 'OF 25-30',
    category: 'sle_oral',
    targetLanguage: 'french',
    price: 89900,
    originalPrice: 99900,
    lpLevel: 'C1',
    lpPrice: '899.00',
    lpOriginalPrice: '999.00',
    modules: [
      { num: 17, title: 'Leadership & Strategic Vision', titleFr: 'Leadership et Vision Stratégique', desc: 'Present strategic visions to senior management, write Cabinet memos, lead interministerial committees, and conduct public consultations.', descFr: 'Présentez des visions stratégiques à la haute direction, rédigez des mémoires au Cabinet, animez des comités interministériels et menez des consultations publiques.' },
      { num: 18, title: 'Complex Analysis & Synthesis', titleFr: 'Analyse et Synthèse Complexes', desc: 'Analyze policy documents, write comparative analyses, critique research reports, and present complex analysis results.', descFr: 'Analysez des documents de politique, rédigez des analyses comparatives, critiquez des rapports de recherche et présentez des résultats d\'analyse complexes.' },
      { num: 19, title: 'Crisis Communication', titleFr: 'Communication de Crise', desc: 'Write emergency press releases, conduct press conferences, handle difficult media interviews, and communicate with internal stakeholders.', descFr: 'Rédigez des communiqués d\'urgence, menez des points de presse, gérez des entrevues difficiles et communiquez avec les parties prenantes internes.' },
      { num: 20, title: 'Diplomacy & International Relations', titleFr: 'Diplomatie et Relations Internationales', desc: 'Express reservations and objections, propose compromises, participate in multilateral meetings, and write official minutes.', descFr: 'Exprimez des réserves et objections, proposez des compromis, participez à des rencontres multilatérales et rédigez des comptes rendus officiels.' },
    ],
  },
  {
    pathNum: 6,
    roman: 'VI',
    slug: 'path-vi-sle-mastery',
    title: 'Path VI: SLE Mastery',
    titleFr: 'Path VI: Maîtrise ELS',
    subtitle: 'From Preparation to SLE Test Success',
    subtitleFr: 'De la préparation à la réussite aux tests ELS',
    description: 'Master all three SLE test components: Reading Comprehension, Written Expression, and Oral Proficiency. Apply proven test-taking strategies, complete practice exams under timed conditions, and develop performance techniques.',
    descriptionFr: 'Maîtrisez les trois composantes des tests ELS : compréhension de l\'écrit, expression écrite et compétence orale. Appliquez des stratégies de test éprouvées, complétez des examens pratiques en conditions chronométrées et développez des techniques de performance.',
    level: 'all_levels',
    cefrLevel: 'A1-C1',
    pflLevel: 'All Levels',
    category: 'exam_prep',
    targetLanguage: 'french',
    price: 89900,
    originalPrice: 99900,
    lpLevel: 'exam_prep',
    lpPrice: '899.00',
    lpOriginalPrice: '999.00',
    modules: [
      { num: 21, title: 'Reading Comprehension', titleFr: 'Compréhension de l\'Écrit', desc: 'Master rapid reading strategies, decode question types, understand administrative texts, and succeed in practice tests.', descFr: 'Maîtrisez les stratégies de lecture rapide, décodez les types de questions, comprenez les textes administratifs et réussissez les tests blancs.' },
      { num: 22, title: 'Written Expression', titleFr: 'Expression Écrite', desc: 'Write emails under time pressure, produce service memos, compose argumentative texts, and optimize written performance.', descFr: 'Rédigez des courriels sous pression, produisez des notes de service, composez des textes argumentatifs et optimisez votre performance écrite.' },
      { num: 23, title: 'Listening Comprehension', titleFr: 'Compréhension Orale', desc: 'Practice active listening, strategic note-taking, inference and implicit understanding, and mental synthesis.', descFr: 'Pratiquez l\'écoute active, la prise de notes stratégique, l\'inférence et la compréhension implicite, et la synthèse mentale.' },
      { num: 24, title: 'Oral Proficiency', titleFr: 'Expression Orale', desc: 'Develop fluency and rhythm, lexical precision, discourse structure, and interaction repair strategies.', descFr: 'Développez la fluidité et le rythme, la précision lexicale, la structure du discours et les stratégies de réparation en interaction.' },
    ],
  },
];

// ============================================================================
// SLOT DEFINITIONS
// ============================================================================
const SLOT_DEFS = [
  { index: 1, key: 'slot_1_introduction', type: 'introduction', actType: 'text', titleEn: 'Introduction', titleFr: 'Introduction', minutes: 2 },
  { index: 2, key: 'slot_2_video', type: 'video_scenario', actType: 'video', titleEn: 'Video Scenario', titleFr: 'Scénario Vidéo', minutes: 9 },
  { index: 3, key: 'slot_3_grammar', type: 'grammar_point', actType: 'text', titleEn: 'Grammar Point', titleFr: 'Point de Grammaire', minutes: 15 },
  { index: 4, key: 'slot_4_written', type: 'written_practice', actType: 'text', titleEn: 'Written Practice', titleFr: 'Pratique Écrite', minutes: 12 },
  { index: 5, key: 'slot_5_oral', type: 'oral_practice', actType: 'speaking_exercise', titleEn: 'Oral Practice', titleFr: 'Pratique Orale', minutes: 10 },
  { index: 6, key: 'slot_6_quiz_json', type: 'quiz_slot', actType: 'quiz', titleEn: 'Quiz', titleFr: 'Quiz', minutes: 10 },
  { index: 7, key: 'slot_7_coaching', type: 'coaching_tip', actType: 'text', titleEn: 'Coaching Tip', titleFr: 'Conseil du Coach', minutes: 3 },
];

// ============================================================================
// HELPER: Get CDN URL
// ============================================================================
function getCdnUrl(pathRoman, category, filename) {
  const key = `Path_${pathRoman}/${category}/${filename}`;
  return cdnMapping[key] || null;
}

// ============================================================================
// HELPER: Escape SQL string
// ============================================================================
function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log('Connecting to database...');
  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected.');

  try {
    // STEP 1: Clean existing data (order matters due to foreign keys)
    console.log('\n=== STEP 1: Cleaning existing data ===');
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    const tablesToClean = [
      'activity_progress',
      'activities',
      'quiz_questions',
      'quizzes',
      'lesson_progress',
      'lessons',
      'course_modules',
      'course_enrollments',
      'path_courses',
      'path_enrollments',
      'learning_paths',
      'courses',
    ];
    
    for (const table of tablesToClean) {
      try {
        await conn.execute(`DELETE FROM ${table}`);
        await conn.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`  Cleaned: ${table}`);
      } catch (e) {
        console.log(`  Skip: ${table} (${e.message.slice(0, 50)})`);
      }
    }
    
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('  All tables cleaned.');

    // STEP 2: Insert courses
    console.log('\n=== STEP 2: Inserting 6 courses ===');
    const courseIds = {};
    
    for (const path of PATHS) {
      const coverUrl = getCdnUrl(path.roman, 'Covers', 'course_cover.jpg');
      const badgeUrl = getCdnUrl(path.roman, 'Badges', 'path_completion_badge.png');
      
      const [result] = await conn.execute(
        `INSERT INTO courses (title, titleFr, slug, description, descriptionFr, shortDescription, shortDescriptionFr,
          thumbnailUrl, pathCompletionBadgeUrl, category, level, targetLanguage,
          price, originalPrice, currency, accessType, totalModules, totalLessons, totalDurationMinutes,
          instructorName, status, publishedAt, hasCertificate, hasQuizzes, hasDownloads, totalActivities)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
        [
          path.title, path.titleFr, path.slug,
          path.description, path.descriptionFr,
          path.subtitle, path.subtitleFr,
          coverUrl, badgeUrl,
          path.category, path.level, path.targetLanguage,
          path.price, path.originalPrice, 'CAD', 'one_time',
          4, 16, 960, // 4 modules, 16 lessons, 16×60min
          'RusingÂcademy', 'published',
          true, true, true,
          112, // 16 lessons × 7 activities
        ]
      );
      
      courseIds[path.pathNum] = result.insertId;
      console.log(`  Course ${path.pathNum}: ${path.title} -> ID ${result.insertId}`);
    }

    // STEP 3: Insert modules
    console.log('\n=== STEP 3: Inserting 24 modules ===');
    const moduleIds = {};
    
    for (const path of PATHS) {
      const courseId = courseIds[path.pathNum];
      
      for (let i = 0; i < path.modules.length; i++) {
        const mod = path.modules[i];
        const modLocalIndex = i + 1; // 1-4 within the path
        const thumbnailUrl = getCdnUrl(path.roman, 'Covers', `module_${modLocalIndex}_cover.jpg`);
        const badgeUrl = getCdnUrl(path.roman, 'Badges', `module_${modLocalIndex}_badge.png`);
        
        const [result] = await conn.execute(
          `INSERT INTO course_modules (courseId, title, titleFr, description, descriptionFr,
            badgeImageUrl, sortOrder, totalLessons, totalDurationMinutes, isPreview, thumbnailUrl, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            courseId,
            `Module ${mod.num}: ${mod.title}`,
            `Module ${mod.num}: ${mod.titleFr}`,
            mod.desc, mod.descFr,
            badgeUrl,
            i, // sortOrder 0-3
            4, 240, // 4 lessons, 4×60min
            i === 0, // First module is preview
            thumbnailUrl,
            'published',
          ]
        );
        
        moduleIds[mod.num] = result.insertId;
        console.log(`  Module ${mod.num}: ${mod.titleFr} -> ID ${result.insertId}`);
      }
    }

    // STEP 4: Insert lessons with real content
    console.log('\n=== STEP 4: Inserting 96 lessons ===');
    const lessonIds = {};
    
    for (const path of PATHS) {
      const courseId = courseIds[path.pathNum];
      
      for (let i = 0; i < path.modules.length; i++) {
        const mod = path.modules[i];
        const moduleId = moduleIds[mod.num];
        
        for (let l = 1; l <= 4; l++) {
          const lessonNum = `${mod.num}.${l}`;
          const lessonData = allLessons[lessonNum];
          
          if (!lessonData) {
            console.error(`  MISSING: Lesson ${lessonNum}`);
            continue;
          }
          
          const titleFr = lessonData.lesson_title_fr || `Leçon ${lessonNum}`;
          // Generate English title from FR (simplified)
          const titleEn = `Lesson ${lessonNum}: ${titleFr}`;
          
          const lessonLocalIndex = (i * 4) + l; // 1-16 within the path
          const coverUrl = getCdnUrl(path.roman, 'Covers', `lesson_${mod.num}_${l}_cover.jpg`);
          const videoThumbUrl = getCdnUrl(path.roman, 'Videos', `video_${mod.num}_${l}.jpg`);
          
          const [result] = await conn.execute(
            `INSERT INTO lessons (moduleId, courseId, title, titleFr, description, descriptionFr,
              contentType, videoThumbnailUrl, sortOrder, estimatedMinutes, isPreview, isMandatory,
              thumbnailUrl, status, totalActivities)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              moduleId, courseId,
              titleEn, titleFr,
              `Complete lesson covering introduction, video scenario, grammar, written practice, oral practice, quiz, and coaching tip.`,
              `Leçon complète couvrant l'introduction, le scénario vidéo, la grammaire, la pratique écrite, la pratique orale, le quiz et le conseil du coach.`,
              'video',
              videoThumbUrl,
              l - 1, // sortOrder 0-3
              60, // 60 minutes per lesson
              l === 1 && i === 0, // First lesson of first module is preview
              true,
              coverUrl,
              'published',
              7, // 7 activities per lesson
            ]
          );
          
          lessonIds[lessonNum] = result.insertId;
          console.log(`  Lesson ${lessonNum}: ${titleFr.slice(0, 50)} -> ID ${result.insertId}`);
        }
      }
    }

    // STEP 5: Insert activities (7 slots per lesson)
    console.log('\n=== STEP 5: Inserting 672 activities ===');
    let activityCount = 0;
    
    for (const path of PATHS) {
      const courseId = courseIds[path.pathNum];
      
      for (let i = 0; i < path.modules.length; i++) {
        const mod = path.modules[i];
        const moduleId = moduleIds[mod.num];
        
        for (let l = 1; l <= 4; l++) {
          const lessonNum = `${mod.num}.${l}`;
          const lessonId = lessonIds[lessonNum];
          const lessonData = allLessons[lessonNum];
          
          if (!lessonId || !lessonData) continue;
          
          const slots = lessonData.slots || {};
          const videoThumbUrl = getCdnUrl(path.roman, 'Videos', `video_${mod.num}_${l}.jpg`);
          
          for (const slotDef of SLOT_DEFS) {
            const slotContent = slots[slotDef.key] || '';
            
            // Determine thumbnail for video slot
            const thumbUrl = slotDef.index === 2 ? videoThumbUrl : null;
            
            await conn.execute(
              `INSERT INTO activities (lessonId, moduleId, courseId, slotIndex, slotType,
                title, titleFr, description, descriptionFr,
                activityType, content, contentFr,
                videoUrl, audioUrl, thumbnailUrl,
                estimatedMinutes, points, sortOrder, status, isMandatory)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                lessonId, moduleId, courseId,
                slotDef.index, slotDef.type,
                `${slotDef.titleEn} - Lesson ${lessonNum}`,
                `${slotDef.titleFr} - Leçon ${lessonNum}`,
                `${slotDef.titleEn} activity for lesson ${lessonNum}`,
                `Activité ${slotDef.titleFr} pour la leçon ${lessonNum}`,
                slotDef.actType,
                slotContent || null, // content (the real parsed content)
                slotContent || null, // contentFr (same - content is already bilingual in the markdown)
                null, // videoUrl (to be added later)
                null, // audioUrl (to be added later for TTS)
                thumbUrl,
                slotDef.minutes,
                slotDef.index === 6 ? 100 : 10, // Quiz worth more points
                slotDef.index - 1, // sortOrder
                'published',
                true,
              ]
            );
            
            activityCount++;
          }
        }
      }
    }
    console.log(`  Total activities inserted: ${activityCount}`);

    // STEP 6: Insert quiz questions
    console.log('\n=== STEP 6: Inserting quiz questions ===');
    let quizCount = 0;
    
    for (const lessonNum of Object.keys(allLessons)) {
      const lessonData = allLessons[lessonNum];
      const lessonId = lessonIds[lessonNum];
      if (!lessonId) continue;
      
      const quizJson = lessonData.slots?.slot_6_quiz_json;
      if (!quizJson) continue;
      
      // Parse the quiz JSON
      let questions = [];
      try {
        const parsed = JSON.parse(quizJson);
        if (parsed.questions) {
          questions = parsed.questions;
        } else if (Array.isArray(parsed)) {
          questions = parsed;
        }
      } catch {
        // Try to extract questions from the text
        try {
          // Look for JSON array within the text
          const match = quizJson.match(/\[[\s\S]*\]/);
          if (match) {
            questions = JSON.parse(match[0]);
          }
        } catch {
          // Skip this lesson's quiz
        }
      }
      
      if (questions.length === 0) continue;
      
      // Find moduleId and courseId for this lesson
      const modNum = parseInt(lessonNum.split('.')[0]);
      const moduleId = moduleIds[modNum];
      const pathNum = Math.ceil(modNum / 4);
      const courseId = courseIds[pathNum];
      
      for (let qi = 0; qi < questions.length; qi++) {
        const q = questions[qi];
        
        // Normalize question format
        const questionText = q.question || q.questionText || q.text || '';
        const questionTextFr = q.questionFr || q.question_fr || questionText;
        const options = q.options || q.choices || [];
        const correctAnswer = q.correctAnswer || q.correct_answer || q.answer || '';
        const explanation = q.explanation || q.feedback || '';
        const explanationFr = q.explanationFr || q.explanation_fr || explanation;
        const questionType = q.type || 'multiple_choice';
        const difficulty = q.difficulty || 'medium';
        
        if (!questionText) continue;
        
        await conn.execute(
          `INSERT INTO quiz_questions (lessonId, moduleId, courseId,
            questionText, questionTextFr, questionType, options, correctAnswer,
            explanation, explanationFr, points, difficulty, orderIndex, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            lessonId, moduleId || null, courseId || null,
            questionText, questionTextFr,
            questionType === 'true_false' ? 'true_false' : 'multiple_choice',
            JSON.stringify(options),
            String(correctAnswer),
            explanation, explanationFr,
            10, difficulty,
            qi, true,
          ]
        );
        
        quizCount++;
      }
    }
    console.log(`  Total quiz questions inserted: ${quizCount}`);

    // STEP 7: Insert learning_paths and path_courses
    console.log('\n=== STEP 7: Inserting learning paths ===');
    
    for (const path of PATHS) {
      const courseId = courseIds[path.pathNum];
      const coverUrl = getCdnUrl(path.roman, 'Covers', 'course_cover.jpg');
      
      const [result] = await conn.execute(
        `INSERT INTO learning_paths (title, titleFr, slug, subtitle, subtitleFr,
          description, descriptionFr, level, cefrLevel, pflLevel,
          price, originalPrice, discountPercentage,
          durationWeeks, structuredHours, practiceHoursMin, practiceHoursMax,
          totalModules, totalLessons,
          thumbnailUrl, bannerUrl, status, isFeatured, displayOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          path.title, path.titleFr, path.slug,
          path.subtitle, path.subtitleFr,
          path.description, path.descriptionFr,
          path.lpLevel, path.cefrLevel, path.pflLevel,
          path.lpPrice, path.lpOriginalPrice, 10,
          4, 30, 80, 130,
          4, 16,
          coverUrl, coverUrl,
          'published', true, path.pathNum - 1,
        ]
      );
      
      const pathId = result.insertId;
      
      // Link path to course
      await conn.execute(
        `INSERT INTO path_courses (pathId, courseId, orderIndex, isRequired)
        VALUES (?, ?, ?, ?)`,
        [pathId, courseId, 0, true]
      );
      
      console.log(`  Learning Path ${path.roman}: ${path.titleFr} -> ID ${pathId}`);
    }

    // FINAL: Summary
    console.log('\n=== REBUILD COMPLETE ===');
    const [courseCount] = await conn.execute('SELECT COUNT(*) as c FROM courses');
    const [moduleCount] = await conn.execute('SELECT COUNT(*) as c FROM course_modules');
    const [lessonCount] = await conn.execute('SELECT COUNT(*) as c FROM lessons');
    const [actCount] = await conn.execute('SELECT COUNT(*) as c FROM activities');
    const [quizQCount] = await conn.execute('SELECT COUNT(*) as c FROM quiz_questions');
    const [lpCount] = await conn.execute('SELECT COUNT(*) as c FROM learning_paths');
    const [pcCount] = await conn.execute('SELECT COUNT(*) as c FROM path_courses');
    
    console.log(`  Courses: ${courseCount[0].c}`);
    console.log(`  Modules: ${moduleCount[0].c}`);
    console.log(`  Lessons: ${lessonCount[0].c}`);
    console.log(`  Activities: ${actCount[0].c}`);
    console.log(`  Quiz Questions: ${quizQCount[0].c}`);
    console.log(`  Learning Paths: ${lpCount[0].c}`);
    console.log(`  Path Courses: ${pcCount[0].c}`);

  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
