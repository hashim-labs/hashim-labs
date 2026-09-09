import { NextResponse } from 'next/server';
import { answerProfileQuestion } from '@/lib/profile-bot';

export async function GET(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) return new Response(challenge, { status: 200 });
  return NextResponse.json({ error: 'Webhook verification failed.' }, { status: 403 });
}

async function sendWhatsAppMessage(to, text) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  });
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const messages = payload.entry?.flatMap((entry) => entry.changes || []).flatMap((change) => change.value?.messages || []) || [];
    for (const message of messages) {
      const question = message.type === 'text' ? message.text?.body?.trim().slice(0, 1000) : '';
      if (!question) continue;
      const knownAnswer = await answerProfileQuestion(question);
      const answer = knownAnswer || 'I do not have a verified answer for that yet. Please visit the portfolio contact form and share your name, email, and what you need so Hashim can personally follow up.';
      await sendWhatsAppMessage(message.from, answer);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('WhatsApp webhook failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
