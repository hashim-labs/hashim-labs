import { NextResponse } from 'next/server';
import { adminAction } from '@/lib/admin-api';
import { createProject, listProjects } from '@/lib/project-store';
export async function GET(request) { return adminAction(request, async () => NextResponse.json({ projects: await listProjects(true) }, { headers: { 'Cache-Control': 'no-store' } })); }
export async function POST(request) { return adminAction(request, async () => NextResponse.json({ project: await createProject(await request.json()) }, { status: 201 })); }
