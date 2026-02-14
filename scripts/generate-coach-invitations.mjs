/**
 * Script to generate invitation links for all existing coaches
 * Run with: node scripts/generate-coach-invitations.mjs
 */

import mysql from 'mysql2/promise';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const BASE_URL = 'https://www.rusingacademy.ca';

function generateToken() {
  return crypto.randomBytes(24).toString('hex'); // 48 characters
}

async function main() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get all approved coaches with their details
    const [coaches] = await connection.execute(`
      SELECT cp.id, cp.slug, cp.headline, u.name, u.email 
      FROM coach_profiles cp 
      LEFT JOIN users u ON cp.userId = u.id 
      WHERE cp.status = 'approved' AND cp.profileComplete = true 
      ORDER BY cp.id
    `);

    console.log(`Found ${coaches.length} coaches to generate invitations for:\n`);

    const invitations = [];

    for (const coach of coaches) {
      // Check if there's already a pending invitation
      const [existing] = await connection.execute(
        `SELECT id, token FROM coach_invitations WHERE coachProfileId = ? AND status = 'pending'`,
        [coach.id]
      );

      let token;
      if (existing.length > 0) {
        token = existing[0].token;
        console.log(`Coach ${coach.name || coach.slug}: Using existing invitation`);
      } else {
        // Generate new invitation
        token = generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

        await connection.execute(
          `INSERT INTO coach_invitations (coachProfileId, email, token, status, expiresAt, createdBy, createdAt, updatedAt)
           VALUES (?, ?, ?, 'pending', ?, 1, NOW(), NOW())`,
          [coach.id, coach.email || 'unknown@example.com', token, expiresAt]
        );
        console.log(`Coach ${coach.name || coach.slug}: Created new invitation`);
      }

      const inviteUrl = `${BASE_URL}/coach-invite/${token}`;
      
      invitations.push({
        id: coach.id,
        name: coach.name || 'Unknown',
        email: coach.email || 'No email',
        slug: coach.slug,
        headline: coach.headline,
        inviteUrl,
        token
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('COACH INVITATION LINKS');
    console.log('='.repeat(80) + '\n');

    for (const inv of invitations) {
      console.log(`📧 ${inv.name}`);
      console.log(`   Email: ${inv.email}`);
      console.log(`   Profile: ${inv.slug}`);
      console.log(`   Headline: ${inv.headline}`);
      console.log(`   🔗 Invitation Link: ${inv.inviteUrl}`);
      console.log('');
    }

    // Output as JSON for easy processing
    console.log('\n' + '='.repeat(80));
    console.log('JSON OUTPUT (for programmatic use):');
    console.log('='.repeat(80));
    console.log(JSON.stringify(invitations, null, 2));

  } finally {
    await connection.end();
  }
}

main().catch(console.error);
