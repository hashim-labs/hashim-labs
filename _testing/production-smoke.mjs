const base='https://hashim-dev.vercel.app';
const catalog=await fetch(`${base}/api/projects`).then(r=>r.json());
if(!catalog.projects?.some(p=>p.slug==='scope-lens')||!catalog.projects.some(p=>p.slug==='fallback-atlas'))throw new Error('Missing projects');
for(const path of ['/labs/scope-lens','/labs/fallback-atlas','/projects/scope-lens','/projects/kha-mart']){const r=await fetch(base+path);if(!r.ok)throw new Error(`${path}: ${r.status}`);}
const admin=await fetch(`${base}/api/admin/projects`);if(admin.status!==401)throw new Error('Admin privacy');
const reply=await fetch(`${base}/api/profile-chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'What does Kha Mart do?',history:[]})}).then(r=>r.json());
if(reply.provider!=='groq'||!reply.answer)throw new Error(`Chat provider: ${reply.provider}`);
console.log(JSON.stringify({passed:true,publishedProjects:catalog.projects.length,toolAndDetailPages:4,adminProtected:true,chatProvider:reply.provider}));
