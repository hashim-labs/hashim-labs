import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ensureSchema, getDb } from '@/lib/db';
import { groupContactHistory } from '@/lib/lead-grouping';

export async function GET() {
  try {
    await requireAdmin();
    await ensureSchema();
    const [contacts,inquiries,chats]=await Promise.all([
      getDb().query('SELECT id,name,email,status,created_at,updated_at FROM lead_contacts ORDER BY updated_at DESC'),
      getDb().query('SELECT id,contact_id,message,source,created_at FROM leads WHERE contact_id IS NOT NULL'),
      getDb().query('SELECT id,contact_id,question,answer,needs_review,created_at FROM bot_messages WHERE contact_id IS NOT NULL'),
    ]);
    return NextResponse.json({ leads: groupContactHistory(contacts.rows,inquiries.rows,chats.rows) },{headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    console.error('Lead retrieval failed:', error);
    return NextResponse.json({ error: 'Unable to load leads.' }, { status: 500 });
  }
}
