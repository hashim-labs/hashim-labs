'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Send, X } from 'lucide-react';

const emptyVisitor = { name: '', email: '', goal: '' };

export default function ProfileBot({ onClose }) {
  const [visitor, setVisitor] = useState(emptyVisitor);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi, I am Hashim AI. I can answer questions about Hashim\'s profile, skills, projects, and experience.' },
  ]);
  const [messageLinks, setMessageLinks] = useState({});
  const [isQualified, setIsQualified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [starterReply, setStarterReply] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [conversationId, setConversationId] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const stored = window.localStorage.getItem('hashim-profile-chat');
    if (stored) {
      try {
        const saved = JSON.parse(stored);
        if (saved.conversationId) setConversationId(saved.conversationId);
        if (saved.visitor) setVisitor(saved.visitor);
        if (saved.messages?.length) setMessages(saved.messages);
        if (saved.messageLinks) setMessageLinks(saved.messageLinks);
        if (saved.isQualified) setIsQualified(true);
      } catch {
        window.localStorage.removeItem('hashim-profile-chat');
      }
    } else {
      setConversationId(`portfolio-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    }
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const blockBackgroundScroll = (event) => {
      if (!event.target.closest?.('[data-profile-bot-scroll]')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('wheel', blockBackgroundScroll, { capture: true, passive: false });
    document.addEventListener('touchmove', blockBackgroundScroll, { capture: true, passive: false });
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener('wheel', blockBackgroundScroll, true);
      document.removeEventListener('touchmove', blockBackgroundScroll, true);
    };
  }, []);

  useEffect(() => {
    if (!isMounted || !conversationId || !isQualified) return;
    window.localStorage.setItem('hashim-profile-chat', JSON.stringify({ conversationId, visitor, messages, messageLinks, isQualified: true }));
  }, [conversationId, isMounted, isQualified, messageLinks, messages, visitor]);

  const updateVisitor = (event) => {
    setVisitor((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const useStarter = (reply) => setStarterReply(reply);

  const startConversation = (event) => {
    event.preventDefault();
    if (!visitor.name.trim() || !/^\S+@\S+\.\S+$/.test(visitor.email.trim()) || visitor.goal.trim().length < 10) return;
    setIsQualified(true);
    setMessages((current) => [...current, { role: 'assistant', text: `Thanks, ${visitor.name.trim()}. I have noted what you are looking for. You can now ask me anything about Hashim.` }]);
  };

  const sendQuestion = async (event) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || isSending || !isQualified) return;
    setQuestion('');
    setMessages((current) => [...current, { role: 'user', text: value }]);
    setIsSending(true);
    try {
      const response = await fetch('/api/profile-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: value, visitor, conversationId, channel: 'portfolio-demo' }),
      });
      const result = await response.json();
      setMessages((current) => [...current, { role: 'assistant', text: response.ok ? result.answer : result.error }]);
      if (response.ok && result.links?.length) setMessageLinks((current) => ({ ...current, [messages.length + 1]: result.links }));
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'I could not reach the profile service. Please use the contact form to reach Hashim directly.' }]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="profile-bot-title" className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-cyan-300/20 bg-slate-950 shadow-2xl shadow-cyan-950/40 sm:w-[min(100%,560px)]">
        <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300"><Bot className="h-5 w-5" /></span><div><h2 id="profile-bot-title" className="font-semibold text-white">Hashim AI</h2><p className="text-xs text-emerald-300">Profile assistant · verified knowledge</p></div></div>
          <button onClick={onClose} aria-label="Close profile assistant" className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        </header>

        {!isQualified ? (
          <form onSubmit={startConversation} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} data-profile-bot-scroll className="flex min-h-0 flex-1 flex-col justify-center gap-5 overflow-y-auto p-6 scrollbar-hide sm:p-8">
            <div><h3 className="text-2xl font-semibold text-white">Before we talk</h3><p className="mt-2 text-sm leading-6 text-slate-400">Say hello first, or share a few details so Hashim can follow up when your question needs a personal answer. Nothing is saved until you submit this form.</p></div>
            {starterReply && <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-sm leading-6 text-cyan-100">{starterReply}</div>}
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => useStarter('Hi! I am Hashim AI. Ask me about Hashim\'s experience, skills, projects, or how to work with him.')} className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-200">Hi</button><button type="button" onClick={() => useStarter('I can explain Hashim\'s profile, skills, projects, experience, and contact options.')} className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-200">What can you tell me?</button><button type="button" onClick={() => useStarter('You are welcome. Share your details when you are ready to have a serious project conversation.')} className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-200">Thanks</button></div>
            <label className="text-sm text-slate-300">Your name<input required name="name" value={visitor.name} onChange={updateVisitor} placeholder="Your name" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300" /></label>
            <label className="text-sm text-slate-300">Your email<input required type="email" name="email" value={visitor.email} onChange={updateVisitor} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300" /></label>
            <label className="text-sm text-slate-300">What would you like help with?<textarea required minLength={10} name="goal" value={visitor.goal} onChange={updateVisitor} rows={4} placeholder="Tell Hashim about your project or question..." className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300" /></label>
            <button type="submit" className="rounded-xl bg-cyan-300 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-200">Start conversation</button>
            <p className="text-center text-[11px] text-slate-500">Your details are used only to qualify a serious conversation.</p>
          </form>
        ) : (
          <>
            <div data-profile-bot-scroll onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5 scrollbar-hide">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className="max-w-[92%]"><p className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-cyan-300 text-slate-950' : 'rounded-bl-md bg-white/[0.07] text-slate-200'}`}>{message.text}</p>{message.role === 'assistant' && messageLinks[index] && <div className="mt-2 flex flex-wrap gap-2">{messageLinks[index].map((link) => <a key={link.href} href={link.href} onClick={onClose} className="rounded-lg border border-cyan-300/30 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-300/10">{link.label}</a>)}</div>}</div></div>)}{isSending && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white/[0.07] px-4 py-3 text-sm text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:150ms]" /><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:300ms]" /> Thinking</div></div>}</div>
            <form onSubmit={sendQuestion} className="border-t border-white/10 p-4"><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 focus-within:border-cyan-300/60"><input value={question} onChange={(event) => setQuestion(event.target.value)} disabled={isSending} aria-label="Ask Hashim AI a question" placeholder="Ask about skills, projects, or contact..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600" /><button type="submit" disabled={!question.trim() || isSending} aria-label="Send question" className="rounded-lg bg-cyan-300 p-2.5 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button></div><p className="mt-2 text-center text-[11px] text-slate-500">Qualified questions and answers are saved for Hashim&apos;s follow-up.</p></form>
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}
