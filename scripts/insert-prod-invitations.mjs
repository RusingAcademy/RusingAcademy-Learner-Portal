// Script to insert coach invitations into production database
// Run with: node scripts/insert-prod-invitations.mjs

import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Production DATABASE_URL from Railway
const PROD_DATABASE_URL = 'mysql://cYPAHDVF1MZtM6S.root:15gsxES4a8gKCi3QLQI3@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/gvnmYNphKZgt9jM9K8Vi9K?ssl={"rejectUnauthorized":true}';

// Parse the connection string
function parseConnectionString(url) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
  const match = url.match(regex);
  if (!match) throw new Error('Invalid connection string');
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    ssl: { rejectUnauthorized: true }
  };
}

async function main() {
  const config = parseConnectionString(PROD_DATABASE_URL);
  console.log('Connecting to production database...');
  console.log('Host:', config.host);
  console.log('Database:', config.database);
  
  const connection = await mysql.createConnection(config);
  console.log('Connected!');
  
  // First, get all coaches from production
  const [coaches] = await connection.execute(`
    SELECT id, firstName, lastName, email 
    FROM coach_profiles 
    WHERE profileComplete = 1 AND status = 'approved'
  `);
  
  console.log(`Found ${coaches.length} approved coaches in production`);
  
  // Check if coach_invitations table exists
  try {
    await connection.execute('SELECT 1 FROM coach_invitations LIMIT 1');
    console.log('coach_invitations table exists');
  } catch (err) {
    console.log('Creating coach_invitations table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coach_invitations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(255) NOT NULL UNIQUE,
        coachProfileId INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        status ENUM('pending', 'claimed', 'expired', 'revoked') DEFAULT 'pending',
        expiresAt DATETIME NOT NULL,
        claimedAt DATETIME,
        claimedByUserId INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table created');
  }
  
  // Generate invitations for each coach
  const invitations = [];
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  for (const coach of coaches) {
    const token = crypto.randomBytes(32).toString('hex');
    
    // Check if invitation already exists for this coach
    const [existing] = await connection.execute(
      'SELECT id FROM coach_invitations WHERE coachProfileId = ? AND status = "pending"',
      [coach.id]
    );
    
    if (existing.length > 0) {
      console.log(`Skipping ${coach.firstName} ${coach.lastName} - invitation already exists`);
      continue;
    }
    
    await connection.execute(
      `INSERT INTO coach_invitations (token, coachProfileId, email, status, expiresAt) 
       VALUES (?, ?, ?, 'pending', ?)`,
      [token, coach.id, coach.email, expiresAt]
    );
    
    invitations.push({
      name: `${coach.firstName} ${coach.lastName}`,
      email: coach.email,
      token,
      link: `https://www.rusingacademy.ca/coach-invite/${token}`
    });
    
    console.log(`Created invitation for ${coach.firstName} ${coach.lastName}`);
  }
  
  await connection.end();
  
  console.log('\n=== INVITATION LINKS ===\n');
  for (const inv of invitations) {
    console.log(`${inv.name} (${inv.email}):`);
    console.log(`  ${inv.link}\n`);
  }
  
  console.log('\nDone! Created', invitations.length, 'invitations');
}

main().catch(console.error);
