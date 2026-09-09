import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ensureSchema, getDb } from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();
    await ensureSchema();
    const result = await getDb().query('SELECT id, question, answer, needs_review, conversation_id, channel, created_at FROM bot_messages ORDER BY created_at ASC');
    const grouped = new Map();
    for (const message of result.rows) {
      const key = message.conversation_id || `message-${message.id}`;
      const conversation = grouped.get(key) || { conversationId: key, channel: message.channel, createdAt: message.created_at, messages: [], needsReview: false };
      conversation.messages.push({ id: message.id, question: message.question, answer: message.answer, createdAt: message.created_at });
      conversation.needsReview ||= message.needs_review;
      conversation.lastActivity = message.created_at;
      grouped.set(key, conversation);
    }
    const conversations = Array.from(grouped.values()).reverse().map((conversation) => ({
      ...conversation,
      messageCount: conversation.messages.length,
      summary: conversation.messages[0]?.question || 'Profile conversation',
    }));
    return NextResponse.json({ conversations, questions: conversations.filter((conversation) => conversation.needsReview) });
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    console.error('Bot question retrieval failed:', error);
    return NextResponse.json({ error: 'Unable to load bot questions.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    await ensureSchema();
    const result = await getDb().query('DELETE FROM bot_messages RETURNING id');
    return NextResponse.json({ deleted: result.rowCount });
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    console.error('Bot chat deletion failed:', error);
    return NextResponse.json({ error: 'Unable to delete bot chats.' }, { status: 500 });
  }
}
