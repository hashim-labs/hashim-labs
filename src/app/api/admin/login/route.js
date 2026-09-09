import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ensureAdminUser } from '@/lib/auth';
import { ensureSchema, getDb } from '@/lib/db';
import { createSession } from '@/lib/auth';

const attempts = new Map();

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const recent = attempts.get(ip) || [];
    const validAttempts = recent.filter((time) => now - time < 15 * 60 * 1000);
    if (validAttempts.length >= 10) return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });

    const { username, password } = await request.json();
    if (typeof username !== 'string' || typeof password !== 'string') return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    await ensureAdminUser();
    const result = await getDb().query('SELECT id, username, password_hash FROM admin_users WHERE username = $1 LIMIT 1', [username.trim()]);
    const user = result.rows[0];
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) {
      attempts.set(ip, [...validAttempts, now]);
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    attempts.delete(ip);
    await createSession(user);
    return NextResponse.json({ ok: true, username: user.username });
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json({ error: 'Admin authentication is not configured.' }, { status: 503 });
  }
}
