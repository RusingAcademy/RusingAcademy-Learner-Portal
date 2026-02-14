import { createConnection } from 'mysql2/promise';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function backupDatabase() {
  const conn = await createConnection(DATABASE_URL);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = join('/home/ubuntu', `backup_pre_rescue_${timestamp}.sql`);
  
  let sql = `-- Database Backup: Pre-Mission Rescue\n-- Timestamp: ${new Date().toISOString()}\n-- Source: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}\n\nSET FOREIGN_KEY_CHECKS=0;\n\n`;
  
  // Get all tables
  const [tables] = await conn.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  
  console.log(`Found ${tableNames.length} tables to backup`);
  
  for (const tableName of tableNames) {
    console.log(`  Backing up: ${tableName}`);
    
    // Get CREATE TABLE statement
    const [createResult] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
    sql += `-- Table: ${tableName}\n`;
    sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    sql += createResult[0]['Create Table'] + ';\n\n';
    
    // Get all rows
    const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
    if (rows.length > 0) {
      const columns = Object.keys(rows[0]);
      const colList = columns.map(c => `\`${c}\``).join(', ');
      
      // Batch inserts in groups of 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const values = batch.map(row => {
          const vals = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "\\'")}'`;
            return `'${String(val).replace(/'/g, "\\'").replace(/\\/g, '\\\\')}'`;
          });
          return `(${vals.join(', ')})`;
        }).join(',\n  ');
        
        sql += `INSERT INTO \`${tableName}\` (${colList}) VALUES\n  ${values};\n`;
      }
      console.log(`    → ${rows.length} rows`);
    } else {
      console.log(`    → 0 rows (empty)`);
    }
    sql += '\n';
  }
  
  sql += 'SET FOREIGN_KEY_CHECKS=1;\n';
  
  writeFileSync(backupFile, sql, 'utf8');
  console.log(`\nBackup saved to: ${backupFile}`);
  console.log(`File size: ${(readFileSync(backupFile).length / 1024 / 1024).toFixed(2)} MB`);
  
  // Integrity check: count rows per table
  console.log('\n--- INTEGRITY CHECK ---');
  let totalRows = 0;
  for (const tableName of tableNames) {
    const [countResult] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
    const count = countResult[0].cnt;
    totalRows += count;
    console.log(`  ${tableName}: ${count} rows`);
  }
  console.log(`  TOTAL: ${totalRows} rows across ${tableNames.length} tables`);
  
  await conn.end();
  return backupFile;
}

backupDatabase().catch(err => {
  console.error('Backup failed:', err.message);
  process.exit(1);
});
