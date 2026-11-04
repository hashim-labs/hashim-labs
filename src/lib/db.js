import { Pool } from 'pg';

const globalForDb = globalThis;

const pool = globalForDb.__portfolioPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 8000,
  statement_timeout: 15000,
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
      CREATE TABLE IF NOT EXISTS lead_contacts (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(320) UNIQUE NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_id BIGINT REFERENCES lead_contacts(id);
      ALTER TABLE bot_messages ADD COLUMN IF NOT EXISTS contact_id BIGINT REFERENCES lead_contacts(id);
      CREATE INDEX IF NOT EXISTS leads_contact_id_idx ON leads(contact_id);
      CREATE INDEX IF NOT EXISTS bot_messages_contact_id_idx ON bot_messages(contact_id);
      WITH normalized AS (
        SELECT name,LOWER(BTRIM(email)) AS email,status,created_at,id,
          MIN(created_at) OVER(PARTITION BY LOWER(BTRIM(email))) AS first_seen
        FROM leads WHERE BTRIM(email) <> ''
      ) INSERT INTO lead_contacts(name,email,status,created_at,updated_at)
        SELECT DISTINCT ON(email) name,email,status,first_seen,created_at FROM normalized
        ORDER BY email,created_at DESC,id DESC ON CONFLICT(email) DO NOTHING;
      UPDATE leads SET contact_id=lead_contacts.id FROM lead_contacts
        WHERE leads.contact_id IS NULL AND LOWER(BTRIM(leads.email))=lead_contacts.email;
      UPDATE bot_messages SET contact_id=latest.contact_id FROM (
        SELECT DISTINCT ON(conversation_id) conversation_id,contact_id FROM leads
        WHERE conversation_id IS NOT NULL AND contact_id IS NOT NULL
        ORDER BY conversation_id,created_at DESC,id DESC
      ) AS latest WHERE bot_messages.contact_id IS NULL AND bot_messages.conversation_id=latest.conversation_id;
    `).catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
}
