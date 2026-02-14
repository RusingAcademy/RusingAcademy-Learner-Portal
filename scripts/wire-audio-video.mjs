/**
 * Wire audio/video playback for activities.
 * 
 * 1. Map pronunciation audio files to oral practice activities (slot 5)
 * 2. Set activityType to 'audio' for oral practice activities with audio
 * 3. For video scenario activities (slot 2), set activityType to 'video'
 *    and add placeholder video URLs (the actual videos are storyboard scripts)
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

// Map audio files to lessons based on topic relevance
const audioMappings = {
  // Course 1 (Path I) - Lessons 1.1-4.4
  60006: 'greeting_formal.mp3',        // 1.1 Bonjour Je Mappelle
  60007: 'hr_intro.mp3',               // 1.2 Mon Bureau Mon Equipe
  60008: 'meeting_schedule.mp3',        // 1.3 La Routine Quotidienne
  60009: 'asking_details.mp3',          // 1.4 Poser Questions
  60010: 'phone_request.mp3',          // 2.1 Ecrire Courriel Simple
  60011: 'clarify_expectations.mp3',   // 2.2 Repondre Courriel
  60012: 'meeting_proposal.mp3',       // 2.3 Fixer Rendez-Vous
  60013: 'request_help.mp3',           // 2.4 Demander Aide
  60014: 'intro_federal_employee.mp3', // 3.1 Parler de Son Travail
  60015: 'collaboration_thanks.mp3',   // 3.2 Decrire Processus
  60016: 'project_presentation.mp3',   // 3.3 Presenter Projet
  60017: 'opinion_advantages.mp3',     // 3.4 Donner Son Avis
  60018: 'report_deadline.mp3',        // 4.1 Comprendre Consignes
  60019: 'agree_modifications.mp3',    // 4.2 Confirmer Comprendre
  60020: 'examine_options.mp3',        // 4.3 Reformuler Message
  60021: 'transmit_info.mp3',          // 4.4 Transmettre Information

  // Course 2 (Path II) - Lessons 5.1-8.4
  60022: 'digital_transformation.mp3', // 5.1 Presenter Equipe
  60023: 'performance_indicators.mp3', // 5.2 Decrire Responsabilites
  60024: 'strategy_recommendation.mp3',// 5.3 Expliquer Organigramme
  60025: 'stakeholder_consensus.mp3',  // 5.4 Accueillir Nouveau
  60026: 'meeting_schedule.mp3',       // 6.1 Planifier Reunion
  60027: 'phased_approach.mp3',        // 6.2 Proposer Ordre Jour
  60028: 'recommendation_approach.mp3',// 6.3 Prendre Notes
  60029: 'postpone_decision.mp3',      // 6.4 Faire Suivi
  60030: 'budget_constraints.mp3',     // 7.1 Rediger Courriel Formel
  60031: 'regulatory_framework.mp3',   // 7.2 Repondre Plainte
  60032: 'policy_coordination.mp3',    // 7.3 Rediger Note Service
  60033: 'continuous_improvement.mp3', // 7.4 Rapport Activites
  60034: 'study_results.mp3',         // 8.1 Presenter Donnees
  60035: 'risk_analysis.mp3',         // 8.2 Comparer Options
  60036: 'strategic_implications.mp3', // 8.3 Argumenter Position
  60037: 'alternative_solutions.mp3',  // 8.4 Convaincre Auditoire
};

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== Wiring Audio/Video Playback ===\n');
  
  // Step 1: Wire audio files to oral practice activities
  let audioCount = 0;
  for (const [lessonId, audioFile] of Object.entries(audioMappings)) {
    const audioUrl = `/audio/pronunciation/${audioFile}`;
    const [result] = await conn.query(`
      UPDATE activities 
      SET audioUrl = ?, activityType = 'audio'
      WHERE lessonId = ? AND slotType = 'oral_practice'
    `, [audioUrl, lessonId]);
    if (result.affectedRows > 0) audioCount++;
  }
  console.log(`✓ Audio URLs wired: ${audioCount} oral practice activities updated`);
  
  // Step 2: For remaining oral practice activities without audio, keep as 'audio' type
  // but with no audioUrl (they'll show the text content with a "record yourself" prompt)
  const [oralResult] = await conn.query(`
    UPDATE activities 
    SET activityType = 'audio'
    WHERE slotType = 'oral_practice' AND activityType != 'audio'
  `);
  console.log(`✓ Remaining oral practice activities set to audio type: ${oralResult.affectedRows}`);
  
  // Step 3: Set video scenario activities to 'video' type
  const [videoResult] = await conn.query(`
    UPDATE activities 
    SET activityType = 'video'
    WHERE slotType = 'video_scenario' AND activityType != 'video'
  `);
  console.log(`✓ Video scenario activities set to video type: ${videoResult.affectedRows}`);
  
  // Verification
  console.log('\n=== Verification ===');
  const [verify] = await conn.query(`
    SELECT 
      slotType,
      activityType,
      COUNT(*) as count,
      SUM(CASE WHEN audioUrl IS NOT NULL THEN 1 ELSE 0 END) as has_audio,
      SUM(CASE WHEN videoUrl IS NOT NULL THEN 1 ELSE 0 END) as has_video
    FROM activities
    WHERE slotType IN ('oral_practice', 'video_scenario')
    GROUP BY slotType, activityType
    ORDER BY slotType, activityType
  `);
  verify.forEach(r => console.log(`${r.slotType} (${r.activityType}): ${r.count} activities, ${r.has_audio} with audio, ${r.has_video} with video`));
  
  console.log('\n✅ Audio/Video wiring complete!');
  
  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
