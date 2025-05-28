import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the DATABASE_URL from the environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'sql', '001_convert_qr_code_ids_to_uuid.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
