import { Pool } from 'pg';

const globalForDb = globalThis;

const pool = globalForDb.__portfolioPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

if (process.env.NODE_ENV !== 'production') globalForDb.__portfolioPool = pool;

let schemaPromise;

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  return pool;
}

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = getDb().query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(80) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS leads (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(320) NOT NULL,
        message TEXT NOT NULL,
        source VARCHAR(40) NOT NULL DEFAULT 'contact-form',
        conversation_id VARCHAR(100),
        status VARCHAR(30) NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(100);
      CREATE TABLE IF NOT EXISTS bot_messages (
        id BIGSERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        needs_review BOOLEAN NOT NULL DEFAULT FALSE,
        conversation_id VARCHAR(100),
        channel VARCHAR(30) NOT NULL DEFAULT 'portfolio-demo',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE bot_messages ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS bot_messages_created_at_idx ON bot_messages (created_at DESC);
    `).catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
}
