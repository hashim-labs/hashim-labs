import { ensureSchema, getDb } from './db.js';
export const normalizeEmail = value => String(value || '').trim().toLowerCase();

// One canonical contact per normalized email. Original inquiries remain append-only.
export async function saveContactInquiry({name,email,message,source='contact-form',conversationId=null,chat}) {
  await ensureSchema(); const client=await getDb().connect();
  try {
    await client.query('BEGIN');
    const contact=(await client.query(`INSERT INTO lead_contacts(name,email) VALUES($1,$2)
      ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,updated_at=NOW(),status=CASE WHEN lead_contacts.status='closed' THEN 'new' ELSE lead_contacts.status END RETURNING id`,[name,normalizeEmail(email)])).rows[0];
    const existing=chat && conversationId ? await client.query('SELECT id FROM leads WHERE contact_id=$1 AND conversation_id=$2 LIMIT 1',[contact.id,conversationId]) : await client.query("SELECT id FROM leads WHERE contact_id=$1 AND conversation_id IS NOT DISTINCT FROM $2 AND message=$3 AND source=$4 AND created_at>NOW()-INTERVAL '5 minutes' LIMIT 1",[contact.id,conversationId,message,source]);
    if(!existing.rowCount) await client.query('INSERT INTO leads(name,email,message,source,conversation_id,contact_id) VALUES($1,$2,$3,$4,$5,$6)',[name,normalizeEmail(email),message,source,conversationId,contact.id]);
    if(chat) await client.query('INSERT INTO bot_messages(question,answer,needs_review,conversation_id,channel,contact_id) VALUES($1,$2,$3,$4,$5,$6)',[chat.question,chat.answer,chat.needsReview,conversationId,chat.channel,contact.id]);
    await client.query('COMMIT');return {contactId:contact.id};
  } catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
