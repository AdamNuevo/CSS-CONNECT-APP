import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const connectionString = env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    console.log('Starting database migrations...');

    // Ensure migrations table exists to track executed migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS "__migrations" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL UNIQUE,
        "applied_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found.');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const { rows } = await client.query<{ name: string }>(
      'SELECT name FROM "__migrations"'
    );
    const appliedSet = new Set(rows.map((r) => r.name));

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`- Migration ${file} (already applied)`);
        continue;
      }

      console.log(`Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO "__migrations" (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`- Applied migration: ${file}`);
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        console.error(`Failed to apply migration ${file}:`, migrationErr);
        throw migrationErr;
      }
    }

    console.log('All migrations applied successfully.');
  } finally {
    await client.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
