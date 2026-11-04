import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeAtlas, atlasExample, validateAtlas, atlasBrief } from '../src/lib/fallback-atlas.js';
import { analyzeScope, scopeExample, validateScope, scopeBrief } from '../src/lib/scope-lens.js';

test('a root outage cascades only into its dependents',()=>{
  const result=analyzeAtlas(atlasExample);
  assert.equal(result.states.database.status,'down');assert.equal(result.states.orders.status,'blocked');assert.equal(result.states.checkout.status,'blocked');assert.equal(result.states.fulfillment.status,'blocked');assert.equal(result.states.payments.status,'healthy');
});
test('documenting a fallback does not activate it; explicit activation degrades downstream service',()=>{
  const result=analyzeAtlas({...atlasExample,activeFallbacks:['database']});
  assert.equal(result.states.database.status,'manual');assert.equal(result.states.orders.status,'degraded');assert.equal(result.states.checkout.status,'degraded');assert.equal(result.blocked.length,0);
  const restored=analyzeAtlas({...atlasExample,outages:[],activeFallbacks:[]});assert.equal(restored.affected.length,0);
});
test('cycles, unknown references, and duplicate services are rejected',()=>{
  const cyclic=structuredClone(atlasExample);cyclic.services[0].dependencies=['checkout'];assert.throws(()=>validateAtlas(cyclic),/cycle/);
  const unknown=structuredClone(atlasExample);unknown.services[0].dependencies=['missing'];assert.throws(()=>validateAtlas(unknown),/reference/);
  assert.throws(()=>validateAtlas({...atlasExample,services:[atlasExample.services[0],atlasExample.services[0]]}),/reference/);
  assert.match(atlasBrief(atlasExample),/Owner: Backend team/);assert.match(atlasBrief(atlasExample),/Planning simulation only/);
});
test('scope changes preserve before/after totals and protect must-keep deliverables',()=>{
  const result=analyzeScope(scopeExample);
  assert.equal(result.baseline,12);assert.equal(result.requested,36);assert.equal(result.delta,24);assert.equal(result.overCapacity,12);
  assert.ok(result.best.hours<=scopeExample.capacity);assert.ok(result.best.keep.includes('landing'));assert.ok(result.best.keep.includes('catalog'));assert.ok(!result.cuts.some(item=>item.required));
});
test('capacity optimization selects the highest priority combination rather than the biggest item',()=>{
  const item=(id,hours,priority)=>({id,name:id,baseline:0,requested:1,hours,priority,required:false,acceptance:'Check it works.'});
  const result=analyzeScope({name:'Fit',capacity:6,items:[item('large',6,5),item('first',3,3),item('second',3,3)]});
  assert.deepEqual(result.best.keep,['first','second']);assert.equal(result.best.hours,6);
});
test('impossible must-keeps and decimal capacity are handled honestly',()=>{
  const result=analyzeScope({...scopeExample,capacity:2});assert.equal(result.best,null);assert.ok(result.minimum>2);
  const decimal=analyzeScope({name:'Decimal',capacity:0.3,items:[{id:'a',name:'a',baseline:0,requested:3,hours:0.1,priority:5,required:true,acceptance:''}]});assert.ok(decimal.best);
  assert.throws(()=>validateScope({...scopeExample,capacity:-1}));
  assert.throws(()=>validateScope({...scopeExample,items:[{...scopeExample.items[0],hours:0}]}));
  assert.match(scopeBrief(scopeExample),/Acceptance checks/);assert.match(scopeBrief(scopeExample),/not an approval or a contract/);
});
