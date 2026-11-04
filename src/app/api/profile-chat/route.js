import { NextResponse } from 'next/server';
import { saveContactInquiry } from '@/lib/lead-store';
import { answerChatStarter, answerProfileAssistant, getProfileLinks, sanitizeHistory, suggestedQuestions } from '@/lib/profile-bot';
export const runtime = 'nodejs';
export const maxDuration = 30;

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
    if (!request.headers.get('content-type')?.includes('application/json')) return NextResponse.json({ error: 'Send a JSON message.' }, { status: 415 });
    const raw = await request.text();
    if (raw.length > 32000) return NextResponse.json({ error: 'This conversation is too long. Start a new chat.' }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'This message could not be read.' }, { status: 400 }); }
    if (!body || Array.isArray(body) || typeof body !== 'object') return NextResponse.json({ error: 'Please provide a message.' }, { status: 400 });
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
    if (starterAnswer && !qualified) return NextResponse.json({ answer: starterAnswer, links: [], suggestions: ['What have you built?', 'What are your skills?', 'Can you build my app?'], needsReview: false, saved: false, provider: 'local', degraded: false });

    const botResult = starterAnswer ? {answer:starterAnswer,relatedProjects:[],needsReview:false,provider:'local',degraded:false} : await answerProfileAssistant(question, history, request.signal);
    const candidateLinks = [...await getProfileLinks(question, history), ...botResult.relatedProjects];
    const links = candidateLinks.filter((link, index) => candidateLinks.findIndex(item => item.href === link.href) === index).slice(0, 4);
    const reply = { answer: botResult.answer, links, suggestions: await suggestedQuestions(question, history), needsReview: botResult.needsReview, saved: false, provider: botResult.provider, degraded: botResult.degraded };
    if (!qualified) return NextResponse.json(reply, { headers: { 'Cache-Control': 'no-store' } });

    let saved = false;
    try {
    await saveContactInquiry({name,email,message:goal,source:'profile-bot',conversationId,chat:{question,answer:botResult.answer,needsReview:botResult.needsReview,channel}});
    saved = true;
    } catch {
      console.warn('Profile reply delivered, but follow-up storage is unavailable.');
    }

    return NextResponse.json({ ...reply, saved }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error.name === 'AbortError') return new Response(null, { status: 499 });
    console.warn('Profile bot request could not be completed.');
    return NextResponse.json({ error: 'The profile assistant is temporarily unavailable.' }, { status: 500 });
  }
}
