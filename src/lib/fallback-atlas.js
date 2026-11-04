export const atlasExample = {
  services: [
    { id:'database', name:'Product database', owner:'Data team', dependencies:[], fallback:'Use the last exported stock list.' },
    { id:'identity', name:'Sign-in service', owner:'Platform team', dependencies:[], fallback:'Provide a limited guest workflow.' },
    { id:'payments', name:'Payment provider', owner:'Operations', dependencies:[], fallback:'Accept pay-on-delivery orders for later reconciliation.' },
    { id:'orders', name:'Order API', owner:'Backend team', dependencies:['database','identity'], fallback:'Record new orders in the offline order sheet.' },
    { id:'checkout', name:'Web checkout', owner:'Store team', dependencies:['orders','payments'], fallback:'Take orders by phone and record them in the offline sheet.' },
    { id:'fulfillment', name:'Dispatch board', owner:'Fulfillment', dependencies:['orders'], fallback:'Use a printed dispatch list and confirm changes by phone.' },
  ], outages:['database'], activeFallbacks:[],
};
export function validateAtlas(input) {
  if (!input || !Array.isArray(input.services) || !input.services.length || input.services.length > 16) throw new Error('Add between 1 and 16 services.');
  const services = input.services.map(service => {
    if (!service || typeof service.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(service.id) || typeof service.name !== 'string' || !service.name.trim() || service.name.length > 100 || typeof service.owner !== 'string' || service.owner.length > 100 || typeof service.fallback !== 'string' || service.fallback.length > 1000 || !Array.isArray(service.dependencies)) throw new Error('Each service needs a name, owner field, and valid dependencies.');
    return { id:service.id,name:service.name.trim(),owner:service.owner.trim(),fallback:service.fallback.trim(),dependencies:[...new Set(service.dependencies)] };
  });
  const ids = new Set(services.map(service=>service.id));
  if (ids.size !== services.length || services.some(service=>service.dependencies.some(id=>!ids.has(id) || id===service.id))) throw new Error('Dependencies must reference other services in this map.');
  const visited = new Set(), visiting = new Set(), order = [];
  function visit(id) { if(visiting.has(id)) throw new Error('This creates a dependency cycle. Remove one dependency to continue.'); if(visited.has(id))return; visiting.add(id); const service=services.find(item=>item.id===id);service.dependencies.forEach(visit);visiting.delete(id);visited.add(id);order.push(id); }
  services.forEach(service=>visit(service.id));
  for(const key of ['outages','activeFallbacks']) if(!Array.isArray(input[key]) || input[key].some(id=>!ids.has(id))) throw new Error('Scenario selections must reference services in this map.');
  return {services,outages:[...new Set(input.outages)],activeFallbacks:[...new Set(input.activeFallbacks)],order};
}
export function analyzeAtlas(input) {
  const map=validateAtlas(input),states={};
  for(const id of map.order){
    const service=map.services.find(item=>item.id===id),parents=service.dependencies.map(parent=>states[parent]);
    const blocked=map.outages.includes(id)||parents.some(parent=>['down','blocked'].includes(parent.status));
    const manual=blocked && service.fallback && map.activeFallbacks.includes(id);
    const status=manual?'manual':map.outages.includes(id)?'down':blocked?'blocked':parents.some(parent=>['manual','degraded'].includes(parent.status))?'degraded':'healthy';
    states[id]={status,level:service.dependencies.length?1+Math.max(...service.dependencies.map(parent=>states[parent].level)):0,reason:manual?'A documented workaround is assumed active.':map.outages.includes(id)?'Selected as a direct outage.':blocked?`Blocked by ${service.dependencies.filter(parent=>['down','blocked'].includes(states[parent].status)).map(parent=>map.services.find(item=>item.id===parent).name).join(', ')}.`:status==='degraded'?'An upstream service is relying on a workaround.':'All modeled dependencies are available.'};
  }
  return {...map,states,affected:map.services.filter(service=>states[service.id].status!=='healthy'),blocked:map.services.filter(service=>['down','blocked'].includes(states[service.id].status)),unowned:map.services.filter(service=>!service.owner),withoutFallback:map.services.filter(service=>!service.fallback)};
}
export function atlasBrief(input) {
  const result=analyzeAtlas(input);
  return ['# Fallback Atlas — outage rehearsal','', 'Planning simulation only. Workaround effectiveness must be checked by the team.', '',...result.order.flatMap(id=>{const service=result.services.find(item=>item.id===id),state=result.states[id];return [`## ${service.name}`,`- State: ${state.status}`,`- Owner: ${service.owner||'Unassigned'}`,`- Depends on: ${service.dependencies.map(dep=>result.services.find(item=>item.id===dep).name).join(', ')||'None'}`,`- Impact: ${state.reason}`,`- Workaround: ${service.fallback||'Not documented'}`,''];})].join('\n');
}
