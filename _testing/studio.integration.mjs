// Exercises only disposable verification records, then removes those records.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getDb } from '../src/lib/db.js';
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:3000';
let cookie = '', project, assetId, contactId;
const contactEmail=`studio-verification-${Date.now()}@example.com`;
const conversationId=`verify-${Date.now()}`;
const slug = `studio-verification-${Date.now()}`;
async function request(path, method = 'GET', body, extraHeaders = {}) {
  const response = await fetch(origin + path, { method, signal: AbortSignal.timeout(30000), headers: { ...(cookie ? { Cookie:cookie } : {}), ...(body instanceof FormData ? {} : { 'Content-Type':'application/json' }), ...extraHeaders }, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) });
  let data; try { data = await response.clone().json(); } catch { data = null; }
  return { response, data, status:response.status };
}
try {
  assert.equal((await request('/api/admin/projects')).status,401);
  const login = await request('/api/admin/login','POST',{username:process.env.ADMIN_USERNAME || 'admin',password:process.env.ADMIN_PASSWORD});
  assert.equal(login.status,200,'Admin credentials must authenticate');
  cookie = login.response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const inquiry={name:'Verification contact',email:contactEmail,message:'First verification inquiry about a web project.',source:'profile-bot',conversationId};
  assert.equal((await request('/api/leads','POST',inquiry)).status,201);
  assert.equal((await request('/api/leads','POST',{...inquiry,email:` ${contactEmail.toUpperCase()} `,message:'Second verification inquiry about the timeline.'})).status,201);
  assert.equal((await request('/api/leads','POST',{...inquiry,message:'Second verification inquiry about the timeline.'})).status,201);
  const contactGroups=(await request('/api/admin/leads')).data.leads.filter(item=>item.email===contactEmail);
  assert.equal(contactGroups.length,1);contactId=contactGroups[0].id;assert.equal(contactGroups[0].inquiryCount,2,'Different questions are retained; immediate retries are deduplicated');
  const consented={name:inquiry.name,email:contactEmail,goal:inquiry.message};
  assert.equal((await request('/api/profile-chat','POST',{question:'hi',visitor:consented,conversationId})).data.saved,true);
  assert.equal((await request('/api/profile-chat','POST',{question:'thanks',visitor:consented,conversationId})).data.saved,true);
  const grouped=(await request('/api/admin/leads')).data.leads.find(item=>item.id===contactId);assert.equal(grouped.inquiryCount,2);assert.equal(grouped.chatQuestionCount,2);assert.equal(grouped.messageCount,4);
  assert.equal((await request(`/api/admin/leads/${contactId}`,'PATCH',{status:'contacted'})).status,200);
  const original = (await request('/api/admin/projects')).data.projects;
  assert.ok(original.length >= 9);
  const create = await request('/api/admin/projects','POST',{title:'Studio verification project',slug,status:'draft',category:'Verification',group:'Developer tools',kind:'Disposable verification',desc:'A disposable record used to verify publishing and privacy.',img:'/images/trace-lab-showcase.webp',stack:['Next.js'],overview:'Only this disposable project is edited during the workflow test.',role:'Verification',features:['Draft privacy'],challenges:'Verifying persisted edits.',outcome:'Verified workflow.',featured:false,artwork:false});
  assert.equal(create.status,201); project = create.data.project;
  assert.equal((await request('/api/projects')).data.projects.some(item => item.id === project.id),false,'Draft must stay private');
  assert.equal((await request(`/projects/${slug}`)).status,404);
  assert.equal((await request(`/api/admin/projects/${project.id}`,'PUT',{...project,status:'published'},{Origin:'https://untrusted.example'})).status,403);
  const published = await request(`/api/admin/projects/${project.id}`,'PUT',{...project,status:'published'});
  assert.equal(published.status,200); const oldRevision = project.revision; project = published.data.project;
  assert.equal((await request('/api/projects')).data.projects.some(item => item.id === project.id),true);
  assert.equal((await request(`/projects/${slug}`)).status,200);
  assert.equal((await request(`/api/admin/projects/${project.id}`,'PUT',{...project,revision:oldRevision})).status,409,'Stale edits must be rejected');
  assert.equal((await request(`/api/admin/projects/${project.id}`,'DELETE',{revision:project.revision})).status,409,'Published content must be archived before deletion');
  const edited = await request(`/api/admin/projects/${project.id}`,'PUT',{...project,desc:'Updated verification summary.'});assert.equal(edited.status,200);project=edited.data.project;
  assert.equal((await request('/api/projects')).data.projects.find(item => item.id === project.id).desc,'Updated verification summary.');
  const beforeOrder = (await request('/api/admin/projects')).data.projects.map(item=>item.id);
  const nextOrder = [...beforeOrder];[nextOrder[nextOrder.length-1],nextOrder[nextOrder.length-2]]=[nextOrder[nextOrder.length-2],nextOrder[nextOrder.length-1]];
  assert.equal((await request('/api/admin/projects/reorder','PATCH',{ids:nextOrder})).status,200);
  assert.deepEqual((await request('/api/admin/projects')).data.projects.map(item=>item.id),nextOrder);
  assert.equal((await request('/api/admin/projects/reorder','PATCH',{ids:beforeOrder})).status,200);
  project=(await request('/api/admin/projects')).data.projects.find(item=>item.id===project.id);
  const form=new FormData();form.set('image',new File([await readFile('public/images/watchhub-cover.webp')],'cover.webp',{type:'image/webp'}));
  const uploaded=await request('/api/admin/uploads','POST',form);assert.equal(uploaded.status,201);assetId=uploaded.data.url.split('/').at(-1);
  const image=await request(uploaded.data.url);assert.equal(image.status,200);assert.equal(image.response.headers.get('content-type'),'image/webp');
  assert.equal(image.response.headers.get('cache-control'),'private, no-store');
  const adminCookie=cookie;cookie='';assert.equal((await request(uploaded.data.url)).status,404,'Unpublished media must remain private');cookie=adminCookie;
  const invalidForm=new FormData();invalidForm.set('image',new File(['<svg/>'],'unsafe.svg',{type:'image/svg+xml'}));assert.equal((await request('/api/admin/uploads','POST',invalidForm)).status,400);
  const assistant=(await request('/api/admin/assistant')).data;assert.equal(assistant.groqConfigured,true);assert.doesNotMatch(JSON.stringify(assistant),/gsk_/);
  const chat=await request('/api/profile-chat','POST',{question:'How could Kha Mart and FlowLab help a small grocery business?',history:[]});assert.equal(chat.status,200);assert.equal(chat.data.provider,'groq');assert.ok(chat.data.links.some(link=>link.href==='/projects/kha-mart'));assert.doesNotMatch(JSON.stringify(chat.data),/gsk_/);
  const unknown=await request('/api/profile-chat','POST',{question:'How old is Hashim? Give his exact age.',history:[]});assert.equal(unknown.status,200);assert.equal(unknown.data.needsReview,true);
  assert.equal((await request('/api/profile-chat','POST',null)).status,400);
  const archive=await request(`/api/admin/projects/${project.id}`,'PUT',{...project,status:'archived'});assert.equal(archive.status,200);project=archive.data.project;
  assert.equal((await request('/api/projects')).data.projects.some(item=>item.id===project.id),false);
  assert.equal((await request(`/projects/${slug}`)).status,404);
  console.log(JSON.stringify({passed:true,checks:['authentication','CSRF origin protection','draft privacy','publish','public case study','edit persistence','stale edit conflict','reorder and restore','cover upload and read','unsafe upload rejected','server-only Groq settings','real Groq reply and project links','undocumented fact handling','malformed request','archive privacy','same-email contact grouping','multiple inquiry and question history','duplicate retry protection','contact status update'],groqProvider:chat.data.provider,projectCount:original.length},null,2));
} finally {
  if(project) {
    const current=(await request('/api/admin/projects')).data?.projects.find(item=>item.id===project.id);
    if(current){const archived=current.status==='archived'?current:(await request(`/api/admin/projects/${current.id}`,'PUT',{...current,status:'archived'})).data.project;assert.equal((await request(`/api/admin/projects/${archived.id}`,'DELETE',{revision:archived.revision})).status,200);}
  }
  if(assetId) await getDb().query('DELETE FROM portfolio_assets WHERE id=$1',[assetId]);
  if(contactId){await getDb().query('DELETE FROM bot_messages WHERE contact_id=$1',[contactId]);await getDb().query('DELETE FROM leads WHERE contact_id=$1',[contactId]);await getDb().query('DELETE FROM lead_contacts WHERE id=$1 AND email=$2',[contactId,contactEmail]);}
  await getDb().end();
}
