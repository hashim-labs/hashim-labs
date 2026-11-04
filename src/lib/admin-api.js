import { NextResponse } from 'next/server';
import { requireAdmin } from './auth';

export async function adminAction(request, handler) {
  try {
    await requireAdmin();
    if (request.method !== 'GET') {
      const origin = request.headers.get('origin');
      if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 });
    }
    return await handler();
  } catch (error) {
    const status = error.status || (error.code === '23505' ? 409 : 500);
    const message = error.code === '23505' ? 'That project URL is already in use. Choose a different slug.' : status < 500 ? error.message : 'Unable to complete this action. Please try again.';
    if (status >= 500) console.warn('Admin content action failed.');
    return NextResponse.json({ error: message }, { status });
  }
}
