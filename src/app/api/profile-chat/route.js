import { NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { answerChatStarter, answerWithGemini, getProfileLinks, sanitizeHistory } from '@/lib/profile-bot';

// Bound public model requests per server instance without retaining message text.
const requestWindows = new Map();
function allowedRequest(request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  for (const [id, window] of requestWindows) if (window.until <= now) requestWindows.delete(id);
  const current = requestWindows.get(key) || { count: 0, until: now + 60000 };
  if (current.count >= 20 || (!requestWindows.has(key) && requestWindows.size >= 5000)) return false;
  current.count += 1;
  requestWindows.set(key, current);
  return true;
}

export async function POST(request) {
  try {
    if (!allowedRequest(request)) return NextResponse.json({ error: 'A few too many messages at once. Give me a minute, then try again.' }, { status: 429, headers: { 'Retry-After': '60' } });
    const body = await request.json();
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 1000) : '';
    const channel = typeof body.channel === 'string' ? body.channel.slice(0, 30) : 'portfolio-demo';
    const visitor = body.visitor && typeof body.visitor === 'object' ? body.visitor : {};
    const name = typeof visitor.name === 'string' ? visitor.name.trim().slice(0, 120) : '';
    const email = typeof visitor.email === 'string' ? visitor.email.trim().toLowerCase().slice(0, 320) : '';
    const goal = typeof visitor.goal === 'string' ? visitor.goal.trim().slice(0, 2000) : '';
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId.slice(0, 100) : '';
    const qualified = Boolean(name && /^\S+@\S+\.\S+$/.test(email) && goal.length >= 10 && conversationId);
    const history = sanitizeHistory(body.history);
    if (!question) return NextResponse.json({ error: 'Please enter a question.' }, { status: 400 });

    const starterAnswer = answerChatStarter(question);
    if (starterAnswer) return NextResponse.json({ answer: starterAnswer, links: [], needsReview: false, saved: false, usedGemini: false });

    const botResult = await answerWithGemini(question, {}, history);
    const links = await getProfileLinks(question, history);
    if (!qualified || !botResult.isGenuineLead) return NextResponse.json({ answer: botResult.answer, links, needsReview: botResult.needsReview, saved: false, usedGemini: botResult.usedGemini });

    let saved = false;
    try {
    await ensureSchema();
    const existing = await getDb().query('SELECT 1 FROM bot_messages WHERE conversation_id = $1 LIMIT 1', [conversationId]);
    if (!existing.rowCount) await getDb().query('INSERT INTO leads (name, email, message, source, conversation_id) VALUES ($1, $2, $3, $4, $5)', [name, email, goal, 'profile-bot', conversationId]);
    await getDb().query('INSERT INTO bot_messages (question, answer, needs_review, conversation_id, channel) VALUES ($1, $2, $3, $4, $5)', [question, botResult.answer, botResult.needsReview, conversationId, channel]);
    saved = true;
    } catch {
      console.warn('Profile reply delivered, but follow-up storage is unavailable.');
    }

    return NextResponse.json({ answer: botResult.answer, links, needsReview: botResult.needsReview, saved, usedGemini: botResult.usedGemini });
  } catch (error) {
    console.error('Profile bot failed:', error);
    return NextResponse.json({ error: 'The profile assistant is temporarily unavailable.' }, { status: 500 });
  }
}
