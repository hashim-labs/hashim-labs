import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/auth';
import { ensureSchema, getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await requireAdmin();
    const { currentPassword, newPassword } = await request.json();
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 12) {
      return NextResponse.json({ error: 'New password must be at least 12 characters.' }, { status: 400 });
    }
    await ensureSchema();
    const result = await getDb().query('SELECT password_hash FROM admin_users WHERE id = $1 LIMIT 1', [session.id]);
    const valid = result.rows[0] && await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    const hash = await bcrypt.hash(newPassword, 12);
    await getDb().query('UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, session.id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    console.error('Password update failed:', error);
    return NextResponse.json({ error: 'Unable to update password.' }, { status: 500 });
  }
}
