import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ensureSchema, getDb } from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();
    await ensureSchema();
    const result = await getDb().query('SELECT id, name, email, message, status, created_at FROM leads ORDER BY created_at DESC');
    return NextResponse.json({ leads: result.rows });
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    console.error('Lead retrieval failed:', error);
    return NextResponse.json({ error: 'Unable to load leads.' }, { status: 500 });
  }
}
