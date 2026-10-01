'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Send, X } from 'lucide-react';
const greeting = { role: 'assistant', text: 'Hey! I’m Hashim’s AI version. Ask me about my projects, skills, or something you want to build. Typos are fine — English or Roman Urdu, whatever feels natural.' };
const starters = ['What have you built?', 'What are your skills?', 'Can you build my app?', 'Show me your CV'];
const storageKey = 'hashim-ai-chat-v2';
export default function ProfileBot({ onClose }) {
  const [messages, setMessages] = useState([greeting]);
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [visitor, setVisitor] = useState({ name: '', email: '', goal: '' });
  const [isQualified, setIsQualified] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const panelRef = useRef(null), inputRef = useRef(null), endRef = useRef(null), requestRef = useRef(null), conversationRef = useRef('');
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    setIsMounted(true);
    conversationRef.current = `portfolio-${crypto.randomUUID()}`;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (saved?.messages?.length) setMessages(saved.messages.filter(x => ['user', 'assistant'].includes(x.role) && typeof x.text === 'string').slice(-50));
      if (typeof saved?.conversationId === 'string') conversationRef.current = saved.conversationId;
    } catch { /* Storage may be disabled; chat still works. */ }
    const previousBody = document.body.style.overflow, previousHtml = document.documentElement.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden';
    const handleKey = event => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const controls = [...(panelRef.current?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), textarea') || [])].filter(x => x.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { requestRef.current?.abort(); document.body.style.overflow = previousBody; document.documentElement.style.overflow = previousHtml; document.removeEventListener('keydown', handleKey); previousFocus?.focus?.(); };
  }, []);
  useEffect(() => { if (isMounted) inputRef.current?.focus(); }, [isMounted, showContact]);
  useEffect(() => {
    if (!isMounted) return;
    endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    try { sessionStorage.setItem(storageKey, JSON.stringify({ messages: messages.slice(-50), conversationId: conversationRef.current })); } catch { /* Optional session memory. */ }
  }, [messages, isSending, isMounted]);
  async function send(value) {
    const text = value.trim().slice(0, 1000); if (!text || isSending) return;
    const history = messages.slice(-10).map(({ role, text }) => ({ role, text }));
    setQuestion(''); setMessages(current => [...current, { role: 'user', text }]); setIsSending(true);
    const controller = new AbortController(); requestRef.current = controller;
    try {
      const response = await fetch('/api/profile-chat', { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text, history, visitor: isQualified ? visitor : {}, conversationId: conversationRef.current, channel: 'portfolio-demo' }) });
      const result = await response.json();
      setMessages(current => [...current, { role: 'assistant', text: response.ok ? result.answer : result.error || 'Something went wrong. Please try again.', links: response.ok ? result.links : [] }]);
      if (result.saved) setSaveStatus('Your inquiry was saved for Hashim to review.');
      else if (isQualified) setSaveStatus('This reply wasn’t saved as a follow-up. You can reach Hashim through the contact form.');
    } catch (error) {
      if (error.name !== 'AbortError') setMessages(current => [...current, { role: 'assistant', text: 'I couldn’t connect just now. Try again, or message Hashim through the contact form.', links: [{ label: 'Contact Hashim', href: '/#contact' }] }]);
    } finally { if (!controller.signal.aborted) { setIsSending(false); inputRef.current?.focus(); } }
  }
  function clearChat() {
    requestRef.current?.abort(); setIsSending(false); setMessages([greeting]); setQuestion(''); setVisitor({ name: '', email: '', goal: '' }); setIsQualified(false); setSaveStatus(''); setShowContact(false); conversationRef.current = `portfolio-${crypto.randomUUID()}`;
    try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
  }
  if (!isMounted) return null;
  return createPortal(<div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/70 backdrop-blur-sm">
    <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="profile-bot-title" className="flex h-[100dvh] w-full max-w-xl flex-col overflow-hidden border-l border-cyan-300/20 bg-slate-950 shadow-2xl sm:w-[min(100%,560px)]">
      <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] p-4 sm:p-5"><div className="flex items-center gap-3"><Bot className="h-6 w-6 text-cyan-300"/><div><h2 id="profile-bot-title" className="font-semibold text-white">Hashim AI</h2><p className="text-xs text-cyan-200">My AI portfolio twin · not the live Hashim</p></div></div><button onClick={onClose} aria-label="Close profile assistant" className="rounded-full p-2 text-slate-400 hover:bg-white/10"><X className="h-5 w-5"/></button></header>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3 text-xs"><button onClick={() => setShowContact(!showContact)} className="text-cyan-200 hover:underline">{showContact ? 'Back to chat' : 'Want Hashim to follow up?'}</button><button onClick={clearChat} disabled={isSending} className="text-slate-400 hover:text-white disabled:opacity-40">New chat</button></div>
      {showContact ? <form onSubmit={event => { event.preventDefault(); setIsQualified(true); setShowContact(false); setSaveStatus('Details added. Ask your project question to save a relevant inquiry for follow-up.'); }} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <h3 className="text-xl font-semibold text-white">Let’s connect</h3><p className="text-sm leading-6 text-slate-400">Optional — you can chat without this. Add your details if you want a relevant project or hiring inquiry saved for Hashim. Your contact details aren’t sent to the AI model.</p>
        {[['name','Your name'],['email','Your email']].map(([name,label]) => <label key={name} className="block text-sm text-slate-300">{label}<input required type={name === 'email' ? 'email' : 'text'} name={name} value={visitor[name]} maxLength={name === 'email' ? 320 : 120} onChange={event => setVisitor(v => ({...v,[name]:event.target.value}))} className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 p-3 text-white"/></label>)}
        <label className="block text-sm text-slate-300">What do you have in mind?<textarea required minLength={10} maxLength={2000} value={visitor.goal} onChange={event => setVisitor(v => ({...v,goal:event.target.value}))} rows={4} className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 p-3 text-white"/></label><button className="rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950">Add follow-up details</button>
      </form> : <>
        <div role="log" aria-live="polite" aria-label="Conversation" aria-busy={isSending} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
          {messages.map((message,index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className="max-w-[92%]"><p className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-cyan-300 text-slate-950' : 'rounded-bl-md bg-white/[0.07] text-slate-200'}`}>{message.text}</p>{message.links?.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{message.links.map(link => <a key={link.href} href={link.href} onClick={onClose} className="rounded-lg border border-cyan-300/30 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-300/10">{link.label}</a>)}</div>}</div></div>)}
          {isSending && <p role="status" className="text-sm text-slate-400">Thinking…</p>}
          <div ref={endRef}/>
        </div>
        <div className="flex flex-wrap gap-2 px-4 pb-3">{starters.map(text => <button key={text} disabled={isSending} onClick={() => send(text)} className="rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300 hover:border-cyan-300/50 disabled:opacity-40">{text}</button>)}</div>
        <form onSubmit={event => {event.preventDefault();send(question);}} className="border-t border-white/10 p-4"><div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 p-2 focus-within:border-cyan-300"><input ref={inputRef} value={question} maxLength={1000} onChange={event => setQuestion(event.target.value)} aria-label="Ask Hashim AI a question" placeholder="Ask anything about my work…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none"/><button type="submit" disabled={!question.trim() || isSending} aria-label="Send question" className="rounded-lg bg-cyan-300 p-2.5 text-slate-950 disabled:opacity-40"><Send className="h-4 w-4"/></button></div><p className="mt-2 text-center text-[11px] leading-5 text-slate-500">AI replies can be imperfect. Chat stays in this browser tab; use New chat to clear it. Messages are processed by the AI service.</p>{saveStatus && <p role="status" className="mt-2 text-xs leading-5 text-cyan-200">{saveStatus}</p>}</form>
      </>}
    </section>
  </div>, document.body);
}
