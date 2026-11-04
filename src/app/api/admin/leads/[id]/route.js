import { NextResponse } from 'next/server';
import { adminAction } from '@/lib/admin-api';
import { ensureSchema,getDb } from '@/lib/db';
import { ProjectError } from '@/lib/project-validation';
export async function PATCH(request,{params}){return adminAction(request,async()=>{
  const {id}=await params,{status}=await request.json();
  if(!/^[1-9]\d{0,18}$/.test(id)||!['new','contacted','qualified','closed'].includes(status))throw new ProjectError('Choose a valid contact and status.');
  await ensureSchema();const result=await getDb().query('UPDATE lead_contacts SET status=$2 WHERE id=$1 RETURNING id,status',[id,status]);
  if(!result.rowCount)throw new ProjectError('Contact not found.',404);
  return NextResponse.json(result.rows[0]);
});}
