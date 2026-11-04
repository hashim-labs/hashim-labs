import test from 'node:test';
import assert from 'node:assert/strict';
import { comparePayloads, traceExample } from '../src/lib/trace-lab.js';
import { simulateFlow, initialSteps } from '../src/lib/flow-lab.js';

test('payload drift identifies nested type changes, removals, additions, and updates', () => {
  const changes = comparePayloads(...traceExample);
  assert.equal(changes.length, 4);
  assert.equal(changes.filter((change) => change.breaking).length, 2);
  assert.ok(changes.some((change) => change.path === '$.order.customer.phone' && change.kind === 'removed'));
  assert.ok(changes.some((change) => change.path === '$.order.total' && change.kind === 'type'));
});
test('payload comparison handles null, arrays, primitives, and absent values distinctly', () => {
  assert.deepEqual(comparePayloads(null, null), []);
  assert.equal(comparePayloads(null, {})[0].breaking, true);
  assert.equal(comparePayloads([1, 2], [1])[0].path, '$[1]');
  assert.equal(comparePayloads({}, { optional: null })[0].kind, 'added');
  assert.deepEqual(comparePayloads({ nested: [] }, { nested: [] }), []);
});
test('workflow applies transformations without changing the trigger', () => {
  const input = { score: 82 };
  const result = simulateFlow(initialSteps, input);
  assert.equal(result.stopped, false);
  assert.equal(result.data.owner, 'Sales team');
  assert.deepEqual(input, { score: 82 });
  assert.ok(result.events.every((event) => event.status === 'passed'));
});
test('failed and missing conditions stop downstream actions', () => {
  for (const input of [{ score: 20 }, {}, { score: null }, { score: 'invalid' }]) {
    const result = simulateFlow(initialSteps, input);
    assert.equal(result.stopped, true);
    assert.deepEqual(result.events.map((event) => event.status), ['stopped', 'skipped', 'skipped']);
    assert.equal(result.data.owner, undefined);
  }
});
test('text conditions, empty flows, and unsafe fields behave predictably', () => {
  assert.equal(simulateFlow([{ id: '1', type: 'condition', field: 'status', operator: 'eq', value: 'ready' }], { status: 'ready' }).stopped, false);
  assert.deepEqual(simulateFlow([], { score: 0 }).data, { score: 0 });
  assert.throws(() => simulateFlow([{ id: '1', type: 'set', field: '__proto__', value: 'x' }], {}), /safe/);
});
