import { NextResponse } from 'next/server';
import { listProjects } from '@/lib/project-store';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return NextResponse.json({ projects: await listProjects() }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Projects are temporarily unavailable.' }, { status: 503 }); }
}
