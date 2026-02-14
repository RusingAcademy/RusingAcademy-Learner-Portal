/**
 * Seed Script for Path Series™ Learning Paths
 * 
 * This script populates the learning_paths table with the 6 official
 * RusingAcademy Path Series programs, aligned with CEFR levels and
 * Canadian government SLE requirements.
 * 
 * PRICES ALIGNED WITH SOURCE OF TRUTH: https://www.rusingacademy.ca/curriculum
 * 
 * Run with: node scripts/seed-paths.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
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
};

// Path Series data based on RusingAcademy curriculum
// OFFICIAL PRICES FROM: https://www.rusingacademy.ca/curriculum
// 
// | Path | Title                    | Level     | Price  | Original | Discount |
// |------|--------------------------|-----------|--------|----------|----------|
// | I    | FSL - Foundations        | A1        | $899   | $999     | 10%      |
// | II   | FSL - Everyday Fluency   | A2        | $899   | $999     | 10%      |
// | III  | FSL - Operational French | B1/BBB    | $999   | $1199    | 17%      |
// | IV   | FSL - Strategic Expression| B2/CBC   | $1099  | $1299    | 15%      |
// | V    | FSL - Professional Mastery| C1/CCC   | $1199  | $1499    | 20%      |
// | VI   | FSL - SLE Accelerator    | Exam Prep | $1299  | $1599    | 19%      |

const pathSeriesData = [
  {
    slug: 'path-i-fsl-foundations',
    title: 'Path I: FSL - Foundations',
    subtitle: 'Build Your Bilingual Foundation',
    description: 'Build the fundamental communication skills required for basic professional interactions. Learn to introduce yourself, ask simple questions, understand basic messages, and complete essential forms in a workplace context. This path establishes the critical groundwork for your bilingual journey in the Canadian public service.',
    level: 'A1',
    cefrLevel: 'A1',
    pflLevel: 'OF 1-6',
    price: 89900, // $899 CAD (official price)
    originalPrice: 99900, // $999 CAD
    discountPercentage: 10,
    durationWeeks: 4,
    structuredHours: 30,
    practiceHoursMin: 80,
    practiceHoursMax: 130,
    totalModules: 6,
    totalLessons: 24,
    objectives: JSON.stringify([
      'Build foundational vocabulary for workplace contexts',
      'Master basic grammar structures',
      'Develop listening comprehension for simple instructions',
      'Practice reading short professional texts',
      'Write simple professional messages',
    ]),
    outcomes: JSON.stringify([
      { en: 'Present yourself and others professionally', fr: 'Vous présenter et présenter les autres de manière professionnelle' },
      { en: 'Ask and answer simple questions about familiar topics', fr: 'Poser et répondre à des questions simples sur des sujets familiers' },
      { en: 'Understand and use everyday workplace expressions', fr: 'Comprendre et utiliser les expressions quotidiennes du lieu de travail' },
      { en: 'Describe your workspace and daily routine', fr: 'Décrire votre espace de travail et votre routine quotidienne' },
      { en: 'Complete administrative forms accurately', fr: 'Remplir les formulaires administratifs avec précision' },
      { en: 'Write simple professional messages', fr: 'Rédiger des messages professionnels simples' },
    ]),
    whoIsThisFor: JSON.stringify('Complete beginners starting their bilingual journey. Ideal for public servants who have had minimal exposure to French and need to build a solid foundation from the ground up.'),
    whatYouWillLearn: JSON.stringify([
      'Basic greetings and introductions',
      'Numbers, dates, and time expressions',
      'Present tense verbs and basic sentence structures',
      'Workplace vocabulary and common expressions',
      'Simple email and message writing',
      'Listening to basic instructions',
    ]),
    modules: JSON.stringify([
      { title: 'Getting Started', lessons: 4 },
      { title: 'Workplace Basics', lessons: 4 },
      { title: 'Daily Routines', lessons: 4 },
      { title: 'Simple Communication', lessons: 4 },
      { title: 'Reading & Writing Basics', lessons: 4 },
      { title: 'Review & Assessment', lessons: 4 },
    ]),
    thumbnailUrl: null,
    bannerUrl: null,
    status: 'published',
    isFeatured: true,
    displayOrder: 1,
    enrollmentCount: 0,
    completionRate: 0,
    averageRating: null,
    reviewCount: 0,
  },
  {
    slug: 'path-ii-fsl-everyday-fluency',
    title: 'Path II: FSL - Everyday Fluency',
    subtitle: 'Develop Practical Communication Skills',
    description: 'Develop confidence in daily professional interactions. Learn to discuss past events, future plans, and personal opinions. Engage in routine workplace conversations with increasing spontaneity and accuracy. This path bridges the gap between basic and intermediate proficiency.',
    level: 'A2',
    cefrLevel: 'A2',
    pflLevel: 'OF 7-12',
    price: 89900, // $899 CAD (official price)
    originalPrice: 99900, // $999 CAD
    discountPercentage: 10,
    durationWeeks: 4,
    structuredHours: 30,
    practiceHoursMin: 80,
    practiceHoursMax: 130,
    totalModules: 6,
    totalLessons: 24,
    objectives: JSON.stringify([
      'Expand vocabulary for professional contexts',
      'Master past and future tenses',
      'Improve listening comprehension',
      'Read and understand professional documents',
      'Write effective professional emails',
    ]),
    outcomes: JSON.stringify([
      { en: 'Narrate past events using appropriate tenses', fr: 'Raconter des événements passés en utilisant les temps appropriés' },
      { en: 'Discuss future projects and plans confidently', fr: 'Discuter des projets et plans futurs avec confiance' },
      { en: 'Express simple opinions and preferences', fr: 'Exprimer des opinions et préférences simples' },
      { en: 'Understand short texts on familiar topics', fr: 'Comprendre des textes courts sur des sujets familiers' },
      { en: 'Write basic professional emails and messages', fr: 'Rédiger des courriels et messages professionnels de base' },
      { en: 'Participate in routine workplace exchanges', fr: 'Participer aux échanges de routine au travail' },
    ]),
    whoIsThisFor: JSON.stringify('Learners with basic knowledge seeking practical skills. Perfect for those who can handle simple interactions but need to develop more confidence and range in their communication.'),
    whatYouWillLearn: JSON.stringify([
      'Past tense (passé composé) and future tense',
      'Expressing opinions and preferences',
      'Workplace conversation patterns',
      'Professional email writing',
      'Understanding announcements and notices',
      'Participating in meetings',
    ]),
    modules: JSON.stringify([
      { title: 'Talking About the Past', lessons: 4 },
      { title: 'Planning the Future', lessons: 4 },
      { title: 'Expressing Opinions', lessons: 4 },
      { title: 'Professional Writing', lessons: 4 },
      { title: 'Workplace Conversations', lessons: 4 },
      { title: 'Review & Assessment', lessons: 4 },
    ]),
    thumbnailUrl: null,
    bannerUrl: null,
    status: 'published',
    isFeatured: true,
    displayOrder: 2,
    enrollmentCount: 0,
    completionRate: 0,
    averageRating: null,
    reviewCount: 0,
  },
  {
    slug: 'path-iii-fsl-operational-french',
    title: 'Path III: FSL - Operational French',
    subtitle: 'Achieve Professional Autonomy (BBB)',
    description: 'Achieve functional professional autonomy. Develop the ability to present arguments, participate in debates, write structured reports, and handle most workplace communication situations independently and effectively. This is the gateway to BBB certification.',
    level: 'B1',
    cefrLevel: 'B1',
    pflLevel: 'BBB',
    price: 99900, // $999 CAD (official price)
    originalPrice: 119900, // $1199 CAD
    discountPercentage: 17,
    durationWeeks: 4,
    structuredHours: 30,
    practiceHoursMin: 80,
    practiceHoursMax: 130,
    totalModules: 6,
    totalLessons: 24,
    objectives: JSON.stringify([
      'Master intermediate grammar structures',
      'Develop argumentation skills',
      'Improve spontaneous conversation ability',
      'Write structured professional documents',
      'Understand complex spoken French',
    ]),
    outcomes: JSON.stringify([
      { en: 'Present and defend viewpoints with structured arguments', fr: 'Présenter et défendre des points de vue avec des arguments structurés' },
      { en: 'Narrate complex events using multiple tenses', fr: 'Raconter des événements complexes en utilisant plusieurs temps' },
      { en: 'Understand main points of presentations and speeches', fr: 'Comprendre les points principaux des présentations et discours' },
      { en: 'Write structured reports and meeting minutes', fr: 'Rédiger des rapports structurés et des procès-verbaux de réunion' },
      { en: 'Participate in conversations with spontaneity', fr: 'Participer à des conversations avec spontanéité' },
      { en: 'Handle unpredictable workplace situations', fr: 'Gérer des situations de travail imprévisibles' },
    ]),
    whoIsThisFor: JSON.stringify('Intermediate learners aiming for BBB certification. Designed for public servants who need to achieve the minimum bilingual requirement for most designated bilingual positions.'),
    whatYouWillLearn: JSON.stringify([
      'Complex sentence structures',
      'Argumentation and debate techniques',
      'Report and memo writing',
      'Meeting participation skills',
      'Handling unexpected situations',
      'SLE BBB exam strategies',
    ]),
    modules: JSON.stringify([
      { title: 'Building Arguments', lessons: 4 },
      { title: 'Complex Narratives', lessons: 4 },
      { title: 'Professional Documents', lessons: 4 },
      { title: 'Meeting Skills', lessons: 4 },
      { title: 'Spontaneous Communication', lessons: 4 },
      { title: 'BBB Exam Preparation', lessons: 4 },
    ]),
    thumbnailUrl: null,
    bannerUrl: null,
    status: 'published',
    isFeatured: true,
    displayOrder: 3,
    enrollmentCount: 0,
    completionRate: 0,
    averageRating: null,
    reviewCount: 0,
  },
  {
    slug: 'path-iv-fsl-strategic-expression',
    title: 'Path IV: FSL - Strategic Expression',
    subtitle: 'Master Precision and Nuance (CBC)',
    description: 'Master precision, nuance, and leadership communication. Develop advanced grammatical structures (subjunctive, conditional), persuasive argumentation skills, and the ability to communicate effectively in complex professional contexts. This path prepares you for CBC-level positions.',
    level: 'B2',
    cefrLevel: 'B2',
    pflLevel: 'CBC',
    price: 109900, // $1099 CAD (official price)
    originalPrice: 129900, // $1299 CAD
    discountPercentage: 15,
    durationWeeks: 4,
    structuredHours: 30,
    practiceHoursMin: 80,
    practiceHoursMax: 130,
    totalModules: 6,
    totalLessons: 24,
    objectives: JSON.stringify([
      'Master subjunctive and conditional moods',
      'Develop persuasive communication skills',
      'Lead meetings and discussions effectively',
      'Write complex professional documents',
      'Handle sensitive communications with diplomacy',
    ]),
    outcomes: JSON.stringify([
      { en: 'Use subjunctive and conditional with precision', fr: 'Utiliser le subjonctif et le conditionnel avec précision' },
      { en: 'Present persuasive arguments in professional settings', fr: 'Présenter des arguments persuasifs en contexte professionnel' },
      { en: 'Lead meetings and facilitate discussions', fr: 'Diriger des réunions et faciliter les discussions' },
      { en: 'Write complex reports and policy documents', fr: 'Rédiger des rapports complexes et des documents de politique' },
      { en: 'Handle sensitive communications diplomatically', fr: 'Gérer les communications sensibles avec diplomatie' },
      { en: 'Adapt communication style to different audiences', fr: 'Adapter le style de communication à différents publics' },
    ]),
    whoIsThisFor: JSON.stringify('Advanced learners targeting CBC certification. Ideal for public servants in leadership roles or those aspiring to positions requiring advanced bilingual proficiency.'),
    whatYouWillLearn: JSON.stringify([
      'Subjunctive mood mastery',
      'Conditional structures and nuances',
      'Persuasive writing and speaking',
      'Meeting leadership skills',
      'Diplomatic communication',
      'SLE CBC exam strategies',
    ]),
    modules: JSON.stringify([
      { title: 'Advanced Grammar Mastery', lessons: 4 },
      { title: 'Persuasive Communication', lessons: 4 },
      { title: 'Leadership Language', lessons: 4 },
      { title: 'Complex Document Writing', lessons: 4 },
      { title: 'Diplomatic Skills', lessons: 4 },
      { title: 'CBC Exam Preparation', lessons: 4 },
    ]),
    thumbnailUrl: null,
    bannerUrl: null,
    status: 'published',
    isFeatured: true,
    displayOrder: 4,
    enrollmentCount: 0,
    completionRate: 0,
    averageRating: null,
    reviewCount: 0,
  },
  {
    slug: 'path-v-fsl-professional-mastery',
    title: 'Path V: FSL - Professional Mastery',
    subtitle: 'Achieve Executive-Level Fluency (CCC)',
    description: 'Achieve near-native fluency and executive-level communication. Develop sophisticated argumentation, nuanced expression, and the ability to handle any professional communication situation with confidence and elegance. This path targets CCC certification.',
    level: 'C1',
    cefrLevel: 'C1',
    pflLevel: 'CCC',
    price: 119900, // $1199 CAD (official price)
    originalPrice: 149900, // $1499 CAD
    discountPercentage: 20,
    durationWeeks: 4,
    structuredHours: 30,
    practiceHoursMin: 80,
    practiceHoursMax: 130,
    totalModules: 6,
    totalLessons: 24,
    objectives: JSON.stringify([
      'Achieve near-native fluency',
      'Master sophisticated argumentation',
      'Develop executive communication skills',
      'Handle any professional situation with confidence',
      'Write with elegance and precision',
    ]),
    outcomes: JSON.stringify([
      { en: 'Communicate with near-native fluency and accuracy', fr: 'Communiquer avec une fluidité et une précision quasi natives' },
      { en: 'Present sophisticated arguments on complex topics', fr: 'Présenter des arguments sophistiqués sur des sujets complexes' },
      { en: 'Handle executive-level communications', fr: 'Gérer les communications de niveau exécutif' },
      { en: 'Write with elegance, precision, and style', fr: 'Rédiger avec élégance, précision et style' },
      { en: 'Navigate cultural nuances with sensitivity', fr: 'Naviguer les nuances culturelles avec sensibilité' },
      { en: 'Mentor others in their bilingual development', fr: 'Encadrer les autres dans leur développement bilingue' },
    ]),
    whoIsThisFor: JSON.stringify('High-level professionals targeting CCC certification. Perfect for executives, senior managers, and those in positions requiring the highest level of bilingual proficiency in the Canadian public service.'),
    whatYouWillLearn: JSON.stringify([
      'Sophisticated argumentation techniques',
      'Executive communication styles',
      'Advanced writing with style and elegance',
      'Cultural nuance navigation',
      'Mentoring and coaching in French',
      'SLE CCC exam strategies',
    ]),
    modules: JSON.stringify([
      { title: 'Sophisticated Expression', lessons: 4 },
      { title: 'Executive Communication', lessons: 4 },
      { title: 'Advanced Writing Mastery', lessons: 4 },
      { title: 'Cultural Intelligence', lessons: 4 },
      { title: 'Leadership in French', lessons: 4 },
      { title: 'CCC Exam Preparation', lessons: 4 },
    ]),
    thumbnailUrl: null,
    bannerUrl: null,
    status: 'published',
    isFeatured: true,
    displayOrder: 5,
    enrollmentCount: 0,
    completionRate: 0,
    averageRating: null,
    reviewCount: 0,
  },
  {
    slug: 'path-vi-fsl-sle-accelerator',
    title: 'Path VI: FSL - SLE Accelerator',
    subtitle: 'Master the SLE Exam',
    description: 'Intensive preparation for the Second Language Evaluation (SLE) exam. Master exam-specific strategies, practice with authentic materials, and develop the confidence to achieve your target level. This specialized path focuses exclusively on SLE success.',
    level: 'exam_prep',
    cefrLevel: 'B1-C1',
    pflLevel: 'SLE',
    price: 129900, // $1299 CAD (official price)
    originalPrice: 159900, // $1599 CAD
    discountPercentage: 19,
    durationWeeks: 4,
    structuredHours: 30,
    practiceHoursMin: 80,
    practiceHoursMax: 130,
    totalModules: 6,
    totalLessons: 24,
    objectives: JSON.stringify([
      'Master SLE exam format and strategies',
      'Practice with authentic exam materials',
      'Develop time management skills',
      'Build confidence for exam day',
      'Target specific skill areas for improvement',
    ]),
    outcomes: JSON.stringify([
      { en: 'Understand SLE exam format and scoring', fr: 'Comprendre le format et la notation de l\'ELS' },
      { en: 'Apply proven strategies for each section', fr: 'Appliquer des stratégies éprouvées pour chaque section' },
      { en: 'Manage time effectively during the exam', fr: 'Gérer le temps efficacement pendant l\'examen' },
      { en: 'Approach exam day with confidence', fr: 'Aborder le jour de l\'examen avec confiance' },
      { en: 'Identify and address personal weak areas', fr: 'Identifier et corriger les points faibles personnels' },
      { en: 'Achieve your target SLE level', fr: 'Atteindre votre niveau ELS cible' },
    ]),
    whoIsThisFor: JSON.stringify('Public servants preparing for the SLE exam. Ideal for those who need to achieve or maintain their bilingual designation and want focused, strategic preparation.'),
    whatYouWillLearn: JSON.stringify([
      'SLE exam structure and format',
      'Reading comprehension strategies',
      'Written expression techniques',
      'Oral interaction preparation',
      'Time management for exams',
      'Stress management and confidence building',
    ]),
    modules: JSON.stringify([
      { title: 'Understanding the SLE', lessons: 4 },
      { title: 'Reading Comprehension Mastery', lessons: 4 },
      { title: 'Written Expression Excellence', lessons: 4 },
      { title: 'Oral Interaction Success', lessons: 4 },
      { title: 'Practice Tests & Review', lessons: 4 },
      { title: 'Final Preparation & Strategies', lessons: 4 },
    ]),
    thumbnailUrl: null,
    bannerUrl: null,
    status: 'published',
    isFeatured: true,
    displayOrder: 6,
    enrollmentCount: 0,
    completionRate: 0,
    averageRating: null,
    reviewCount: 0,
  },
];

async function seedPaths() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');
    
    // Clear existing paths
    console.log('Clearing existing paths...');
    await connection.query('DELETE FROM learning_paths');
    console.log('Existing paths cleared.');
    
    // Insert new paths
    console.log('Inserting Path Series data...');
    
    for (const path of pathSeriesData) {
      const sql = `
        INSERT INTO learning_paths (
          slug, title, subtitle, description, level, cefrLevel, pflLevel,
          price, originalPrice, discountPercentage, durationWeeks, structuredHours,
          practiceHoursMin, practiceHoursMax, totalModules, totalLessons,
          objectives, outcomes, whoIsThisFor, whatYouWillLearn, modules,
          thumbnailUrl, bannerUrl, status, isFeatured, displayOrder,
          enrollmentCount, completionRate, averageRating, reviewCount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
          CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON),
          ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        path.slug,
        path.title,
        path.subtitle,
        path.description,
        path.level,
        path.cefrLevel,
        path.pflLevel,
        path.price,
        path.originalPrice,
        path.discountPercentage,
        path.durationWeeks,
        path.structuredHours,
        path.practiceHoursMin,
        path.practiceHoursMax,
        path.totalModules,
        path.totalLessons,
        path.objectives,
        path.outcomes,
        path.whoIsThisFor,
        path.whatYouWillLearn,
        path.modules,
        path.thumbnailUrl,
        path.bannerUrl,
        path.status,
        path.isFeatured,
        path.displayOrder,
        path.enrollmentCount,
        path.completionRate,
        path.averageRating,
        path.reviewCount,
      ];
      
      await connection.query(sql, values);
      console.log(`✓ Inserted: ${path.title} - $${(path.price / 100).toFixed(0)} (was $${(path.originalPrice / 100).toFixed(0)})`);
    }
    
    console.log('\n✅ All 6 Path Series inserted successfully!');
    console.log('\nPrices aligned with source of truth (rusingacademy.ca/curriculum):');
    console.log('- Path I (A1): $899');
    console.log('- Path II (A2): $899');
    console.log('- Path III (B1/BBB): $999');
    console.log('- Path IV (B2/CBC): $1099');
    console.log('- Path V (C1/CCC): $1199');
    console.log('- Path VI (SLE Prep): $1299');
    
  } catch (error) {
    console.error('Error seeding paths:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

seedPaths();
