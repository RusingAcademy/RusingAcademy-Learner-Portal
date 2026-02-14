import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';

dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Check what migrations are recorded
const [rows] = await conn.query('SELECT * FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 5');
console.log('Last 5 migrations:');
rows.forEach(r => console.log(' ', r.hash?.substring(0, 16), r.created_at));

// Check if 0054 hash is already recorded
const sql0054 = fs.readFileSync('drizzle/0054_high_mongu.sql', 'utf8');
const hash0054 = crypto.createHash('sha256').update(sql0054).digest('hex');
const has0054 = rows.some(r => r.hash === hash0054);
console.log('Has 0054 migration:', has0054);

if (!has0054) {
  await conn.query('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)', [hash0054, Date.now()]);
  console.log('Inserted 0054 migration record with hash:', hash0054.substring(0, 16) + '...');
} else {
  console.log('Migration 0054 already recorded, skipping.');
}

await conn.end();
console.log('Done.');
