import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json(session ? { authenticated: true, username: session.username } : { authenticated: false }, { status: session ? 200 : 401 });
}
