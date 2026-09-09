import bcrypt from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { ensureSchema, getDb } from './db';

const COOKIE_NAME = 'portfolio_admin_session';
const SESSION_TTL = '8h';

function getSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters.');
  return new TextEncoder().encode(value);
}

export async function ensureAdminUser() {
  await ensureSchema();
  const username = process.env.ADMIN_USERNAME || 'admin';
  const result = await getDb().query('SELECT id FROM admin_users WHERE username = $1 LIMIT 1', [username]);
  if (result.rowCount) return;

  const initialPassword = process.env.ADMIN_PASSWORD;
  const initialHash = process.env.ADMIN_PASSWORD_HASH;
  if (!initialPassword && !initialHash) throw new Error('Set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH before first admin login.');

  const passwordHash = initialHash || await bcrypt.hash(initialPassword, 12);
  await getDb().query('INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING', [username, passwordHash]);
}

export async function createSession(user) {
  const token = await new SignJWT({ sub: String(user.id), username: user.username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== 'admin' || !payload.sub) return null;
    return { id: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  return session;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
}
