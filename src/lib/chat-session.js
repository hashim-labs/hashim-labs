export const chatStorageKey = 'hashim-ai-chat-v3';
export function safeChatLink(value) {
  if (typeof value !== 'string' || value.length > 2000 || /[\\\s\u0000-\u001f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return !value.startsWith('/api/') && !value.startsWith('/control-panel');
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
export function restoreChat(value) {
  if (!value || !Array.isArray(value.messages)) return null;
  const messages = value.messages.filter(item => item && ['user','assistant'].includes(item.role) && typeof item.text === 'string').slice(-50).map(item => ({ role: item.role, text: item.text.slice(0,4000), links: Array.isArray(item.links) ? item.links.filter(link => link && typeof link.label === 'string' && safeChatLink(link.href)).slice(0,4).map(link => ({ label: link.label.slice(0,100), href: link.href })) : [], error: item.error === true, provider: ['groq','gemini','local'].includes(item.provider) ? item.provider : 'local', at: Number.isFinite(item.at) ? item.at : undefined }));
  return messages.length ? { messages, conversationId: typeof value.conversationId === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(value.conversationId) ? value.conversationId : undefined } : null;
}
