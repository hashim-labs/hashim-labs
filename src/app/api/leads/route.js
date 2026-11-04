import { NextResponse } from 'next/server';
import { saveContactInquiry } from '@/lib/lead-store';

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (clean(body.website, 100)) return NextResponse.json({ ok: true });

    const name = clean(body.name, 120);
    const email = clean(body.email, 320).toLowerCase();
    const message = clean(body.message, 5000);
    const source = body.source === 'profile-bot' ? 'profile-bot' : 'contact-form';
    const conversationId = source === 'profile-bot' && /^[a-zA-Z0-9-]{1,100}$/.test(body.conversationId || '') ? body.conversationId : null;
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
      return NextResponse.json({ error: 'Please provide a valid name, email, and message.' }, { status: 400 });
    }

    await saveContactInquiry({name,email,message,source,conversationId});
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Lead submission failed:', error);
    return NextResponse.json({ error: 'Unable to save your inquiry right now.' }, { status: 500 });
  }
}
