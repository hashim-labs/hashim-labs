import { NextResponse } from 'next/server';
import { adminAction } from '@/lib/admin-api';
import { reorderProjects } from '@/lib/project-store';
export async function PATCH(request) { return adminAction(request, async () => { await reorderProjects((await request.json()).ids); return NextResponse.json({ ok: true }); }); }
