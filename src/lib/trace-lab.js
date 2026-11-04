export function comparePayloads(before, after, path = '$') {
  const changes = [];
  const type = (value) => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const walk = (left, right, location) => {
    if (type(left) !== type(right)) { changes.push({ path: location, kind: 'type', before: left, after: right, breaking: true }); return; }
    if (left && typeof left === 'object') {
      for (const key of Object.keys(left)) {
        const child = Array.isArray(left) ? `${location}[${key}]` : `${location}.${key}`;
        if (!Object.hasOwn(right, key)) changes.push({ path: child, kind: 'removed', before: left[key], breaking: true });
        else walk(left[key], right[key], child);
      }
      for (const key of Object.keys(right)) if (!Object.hasOwn(left, key)) changes.push({ path: Array.isArray(right) ? `${location}[${key}]` : `${location}.${key}`, kind: 'added', after: right[key], breaking: false });
    } else if (!Object.is(left, right)) changes.push({ path: location, kind: 'changed', before: left, after: right, breaking: false });
  };
  walk(before, after, path);
  return changes;
}

export const traceExample = [
  { event: 'order.created', order: { id: 'KH-2048', total: 2450, currency: 'PKR', customer: { name: 'Ayesha', phone: '+92••••••••••' }, items: 3 } },
  { event: 'order.created', order: { id: 'KH-2048', total: '2450.00', currency: 'PKR', customer: { name: 'Ayesha' }, items: 4, delivery: { status: 'pending' } } },
];
