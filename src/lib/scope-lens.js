export const scopeExample={name:'Neighbourhood store website',capacity:24,items:[
  {id:'landing',name:'Homepage',baseline:1,requested:1,hours:5,priority:5,required:true,acceptance:'Responsive page with approved copy and contact links.'},
  {id:'catalog',name:'Product categories',baseline:3,requested:5,hours:2,priority:4,required:true,acceptance:'Each category has a product list and a working filter.'},
  {id:'revision',name:'Design revision rounds',baseline:1,requested:3,hours:1,priority:2,required:false,acceptance:'One consolidated feedback list per round.'},
  {id:'accounts',name:'Customer accounts',baseline:0,requested:1,hours:8,priority:3,required:false,acceptance:'Registration, sign-in, and password recovery.'},
  {id:'dashboard',name:'Customer order dashboard',baseline:0,requested:1,hours:10,priority:4,required:false,acceptance:'A signed-in customer can review their past orders.'},
]};
export function validateScope(input){
  if(!input||typeof input.name!=='string'||!input.name.trim()||input.name.length>150||!Number.isFinite(input.capacity)||input.capacity<0||input.capacity>10000||!Array.isArray(input.items)||!input.items.length||input.items.length>12)throw new Error('Name the project, set available hours, and add 1–12 deliverables.');
  const items=input.items.map(item=>{
    if(!item||typeof item.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>150||typeof item.acceptance!=='string'||item.acceptance.length>1500||typeof item.required!=='boolean'||![item.baseline,item.requested].every(value=>Number.isInteger(value)&&value>=0&&value<=100)||!Number.isFinite(item.hours)||item.hours<=0||item.hours>200||!Number.isInteger(item.priority)||item.priority<1||item.priority>5)throw new Error('Deliverables need a name, non-negative whole quantities, positive hours per unit, and priority 1–5.');
    return {...item,name:item.name.trim(),acceptance:item.acceptance.trim()};
  });
  if(new Set(items.map(item=>item.id)).size!==items.length)throw new Error('Each deliverable needs a unique ID.');
  return {name:input.name.trim(),capacity:input.capacity,items};
}
export function analyzeScope(input){
  const scope=validateScope(input);
  const rows=scope.items.map(item=>({...item,before:item.baseline*item.hours,after:item.requested*item.hours,delta:(item.requested-item.baseline)*item.hours,status:item.baseline===item.requested?'unchanged':item.baseline===0?'added':item.requested===0?'removed':item.requested>item.baseline?'expanded':'reduced'}));
  const baseline=rows.reduce((total,item)=>total+item.before,0),requested=rows.reduce((total,item)=>total+item.after,0);
  const required=rows.filter(item=>item.required&&item.requested>0),optional=rows.filter(item=>!item.required&&item.requested>0),minimum=required.reduce((total,item)=>total+item.after,0);
  let best=null;
  if(minimum<=scope.capacity+1e-9){
    for(let mask=0;mask<2**optional.length;mask++){
      const keep=optional.filter((_,index)=>mask&(1<<index)),hours=minimum+keep.reduce((total,item)=>total+item.after,0),value=keep.reduce((total,item)=>total+item.priority,0);
      if(hours<=scope.capacity+1e-9&&(!best||value>best.value||value===best.value&&hours>best.hours))best={hours,value,keep:[...required,...keep].map(item=>item.id)};
    }
  }
  return {...scope,rows,baseline,requested,delta:requested-baseline,overCapacity:Math.max(0,requested-scope.capacity),minimum,best,cuts:best?rows.filter(item=>item.requested>0&&!best.keep.includes(item.id)):[],missingAcceptance:rows.filter(item=>item.requested>0&&!item.acceptance)};
}
export function scopeBrief(input){
  const result=analyzeScope(input),kept=result.best?result.rows.filter(item=>result.best.keep.includes(item.id)):result.rows.filter(item=>item.requested>0);
  return [`# ScopeLens — ${result.name}`,'','## Before and after',`- Original estimate: ${result.baseline} hours`,`- Requested estimate: ${result.requested} hours`,`- Net effort change: ${result.delta>=0?'+':''}${result.delta} hours`,`- Available capacity: ${result.capacity} hours`,'','## Changes',...result.rows.filter(item=>item.status!=='unchanged').map(item=>`- ${item.name}: ${item.baseline} → ${item.requested}; ${item.delta>=0?'+':''}${item.delta} hours (${item.status}).`),'','## Capacity option',result.best?`Keep ${result.best.hours} estimated hours of deliverables within the ${result.capacity}-hour capacity.`:`Must-keep items need ${result.minimum} hours. Increase capacity or revisit must-keep decisions.`,...result.cuts.map(item=>`- Defer: ${item.name}`),'','## Acceptance checks',...kept.map(item=>`- ${item.name}: ${item.acceptance||'Agree an acceptance check before starting.'}`),'','## Discuss before starting','- Confirm the selected scope, assumptions, and acceptance checks.','- Agree any delivery-date or commercial changes separately.','','Estimates and priorities are entered by the user. This is a planning brief, not an approval or a contract.'].join('\n');
}
