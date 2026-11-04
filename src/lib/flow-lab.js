export const initialSteps = [
  { id: 'qualify', name: 'Qualify the lead', type: 'condition', field: 'score', operator: 'gte', value: '70' },
  { id: 'assign', name: 'Assign an owner', type: 'set', field: 'owner', value: 'Sales team' },
  { id: 'notify', name: 'Prepare a notification', type: 'notify', field: '', value: 'A qualified lead is ready for follow-up.' },
];

export function simulateFlow(steps, input) {
  const data = structuredClone(input);
  const events = [];
  let stopped = false;
  for (const step of steps) {
    if (stopped) { events.push({ id: step.id, status: 'skipped', message: 'An earlier condition stopped this run.' }); continue; }
    if (step.type === 'condition') {
      const actual = data[step.field];
      const operator = step.operator || 'gte';
      if (operator === 'gte' && (!String(step.value).trim() || !Number.isFinite(Number(step.value)))) throw new Error('Numeric conditions need a valid threshold.');
      const passed = operator === 'gte' ? (typeof actual === 'number' || typeof actual === 'string' && actual.trim() !== '') && Number.isFinite(Number(actual)) && Number(actual) >= Number(step.value) : Object.hasOwn(data, step.field) && String(actual) === step.value;
      events.push({ id: step.id, status: passed ? 'passed' : 'stopped', message: `${step.field}: ${JSON.stringify(actual) ?? 'missing'} ${operator === 'gte' ? '≥' : '='} ${step.value} → ${passed ? 'continue' : 'stop'}` });
      stopped = !passed;
    } else if (step.type === 'set') {
      if (!step.field.trim() || ['__proto__', 'constructor', 'prototype'].includes(step.field)) throw new Error('Choose a safe, non-empty field name.');
      Object.defineProperty(data, step.field, { value: step.value, enumerable: true, writable: true, configurable: true });
      events.push({ id: step.id, status: 'passed', message: `Set ${step.field} to ${JSON.stringify(step.value)}.` });
    } else if (step.type === 'notify') events.push({ id: step.id, status: 'passed', message: `Preview only: ${step.value}` });
    else throw new Error(`Unsupported step type: ${step.type}`);
  }
  return { data, events, stopped };
}
