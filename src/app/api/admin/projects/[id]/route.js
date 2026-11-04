import { NextResponse } from 'next/server';
import { adminAction } from '@/lib/admin-api';
import { updateProject, deleteProject } from '@/lib/project-store';
export async function PUT(request, { params }) { return adminAction(request, async () => { const { id } = await params; const body = await request.json(); return NextResponse.json({ project: await updateProject(id, body, body.revision) }); }); }
export async function DELETE(request, { params }) { return adminAction(request, async () => { const { id } = await params; const { revision } = await request.json(); await deleteProject(id, revision); return NextResponse.json({ ok: true }); }); }
