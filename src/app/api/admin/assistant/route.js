import { NextResponse } from 'next/server';
import { adminAction } from '@/lib/admin-api';
import { answerProfileAssistant } from '@/lib/profile-bot';
import { listProjects } from '@/lib/project-store';
export const maxDuration = 30;
export async function GET(request) { return adminAction(request, async () => NextResponse.json({
  provider: process.env.GROQ_API_KEY ? 'Groq' : process.env.GEMINI_API_KEY ? 'Gemini' : 'Published profile',
  model: process.env.GROQ_API_KEY ? process.env.GROQ_MODEL || 'openai/gpt-oss-20b' : process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  groqConfigured: !!process.env.GROQ_API_KEY,
  publishedProjects: (await listProjects()).length,
  storage: 'Chat is stored in the visitor’s tab. Chat is saved only after the visitor provides follow-up details and opts in.',
}, { headers: { 'Cache-Control': 'no-store' } })); }
export async function POST(request) { return adminAction(request, async () => {
  const started = Date.now();
  const result = await answerProfileAssistant('Briefly describe two of your projects and your main skills.', [], request.signal);
  return NextResponse.json({ answer: result.answer, provider: result.provider, degraded: result.degraded, durationMs: Date.now() - started });
}); }
