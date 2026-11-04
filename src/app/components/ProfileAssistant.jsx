'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ArrowUp, ArrowUpRight, Bot, BriefcaseBusiness, Code2, FileText, Loader2, Mail, RotateCcw, Sparkles, Square, X } from 'lucide-react';
import { chatStorageKey, restoreChat } from '@/lib/chat-session';
import ChatMessage from './ChatMessage';
import ThemeToggle from './ThemeToggle';
import { confirmAction, showError, showSuccess } from '@/lib/alerts';
import './profile-assistant.css';

const greeting = { role: 'assistant', text: 'Hi, I’m Hashim’s AI portfolio assistant. I can walk you through his projects, explain his experience, or help you shape an idea. Where would you like to start?' };
const starters = [{ icon: BriefcaseBusiness, title: 'Explore the work', text: 'What have you built?' }, { icon: Code2, title: 'Find the right skills', text: 'What are your strongest technical skills?' }, { icon: Sparkles, title: 'Talk through an idea', text: 'Can you help me plan an app for my business?' }, { icon: FileText, title: 'Get the background', text: 'Show me your CV and experience' }];
export default function ProfileAssistant({ onClose }) {
  const [messages,setMessages] = useState([greeting]), [question,setQuestion] = useState(''), [sending,setSending] = useState(false), [mounted,setMounted] = useState(false);
  const [contact,setContact] = useState(false), [visitor,setVisitor] = useState({name:'',email:'',goal:''}), [shareChat,setShareChat] = useState(false), [qualified,setQualified] = useState(false), [saving,setSaving] = useState(false);
  const [status,setStatus] = useState(''), [suggestions,setSuggestions] = useState([]), [degraded,setDegraded] = useState(false);
  const panel = useRef(null), input = useRef(null), end = useRef(null), request = useRef(null), conversation = useRef(''), close = useRef(onClose), alive = useRef(false);
  useEffect(() => { close.current = onClose; },[onClose]);
  useEffect(() => {
    alive.current = true; setMounted(true); conversation.current = `portfolio-${crypto.randomUUID()}`;
    try { const restored = restoreChat(JSON.parse(sessionStorage.getItem(chatStorageKey) || 'null')); if (restored) { setMessages(restored.messages); if (restored.conversationId) conversation.current = restored.conversationId; } } catch { /* Optional memory. */ }
    const previous = document.activeElement, bodyOverflow = document.body.style.overflow, htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden';
    const handleKey = event => {
      if(document.querySelector('.swal2-container')) return;
      if (event.key === 'Escape') close.current();
      if (event.key === 'Tab') {
        const controls = [...(panel.current?.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled)') || [])].filter(node => node.getClientRects().length);
        if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
        if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
      }
    };
    document.addEventListener('keydown',handleKey);
    return () => { alive.current = false; request.current?.abort(); request.current = null; document.body.style.overflow = bodyOverflow; document.documentElement.style.overflow = htmlOverflow; document.removeEventListener('keydown',handleKey); previous?.focus?.(); };
  },[]);
  useEffect(() => { if (mounted && !contact) input.current?.focus(); },[mounted,contact]);
  useEffect(() => {
    if (!mounted) return;
    end.current?.scrollIntoView({behavior:'auto',block:'end'});
    try { sessionStorage.setItem(chatStorageKey,JSON.stringify({messages:messages.slice(-50),conversationId:conversation.current})); } catch { /* Optional. */ }
  },[messages,sending,mounted]);
  async function send(value, retry = false) {
    const text = value.trim().slice(0,1000); if (!text || request.current) return;
    const clean = messages.filter(message => !message.error);
    const history = (retry && clean.at(-1)?.role === 'user' ? clean.slice(0,-1) : clean).slice(-10).map(({role,text}) => ({role,text}));
    setQuestion(''); setStatus(''); setSuggestions([]); setMessages(current => retry ? current.filter(message => !message.error) : [...current,{role:'user',text,at:Date.now()}]); setSending(true);
    const controller = new AbortController(); request.current = controller;
    try {
      const response = await fetch('/api/profile-chat',{method:'POST',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(25000)]),headers:{'Content-Type':'application/json'},body:JSON.stringify({question:text,history,visitor:qualified && shareChat ? visitor : {},conversationId:conversation.current,channel:'portfolio-demo'})});
      const result = await response.json(); if (request.current !== controller || !alive.current) return;
      if (!response.ok) throw new Error(result.error || 'That reply could not be completed. Please try again.');
      if (typeof result.answer !== 'string') throw new Error('That reply could not be read. Please try again.');
      setMessages(current => [...current,{role:'assistant',text:result.answer,links:result.links || [],provider:result.provider,at:Date.now()}]); setSuggestions(Array.isArray(result.suggestions) ? result.suggestions.filter(item => typeof item === 'string').slice(0,3) : []); setDegraded(result.degraded === true);
      if (result.saved) setStatus('Your message and reply were saved in your contact history.');
    } catch (error) {
      if (request.current !== controller || !alive.current) return;
      setMessages(current => [...current,{role:'assistant',text:error.name === 'TimeoutError' ? 'The reply took longer than expected. Please retry your question.' : error.message === 'Failed to fetch' ? 'I couldn’t connect just now. Retry your question, or reach Hashim through the contact page.' : error.message,error:true,at:Date.now()}]);
    } finally { if (request.current === controller) { request.current = null; setSending(false); input.current?.focus(); } }
  }
  const stop = () => { const current = request.current; request.current = null; current?.abort(); setSending(false); setMessages(items => [...items,{role:'assistant',text:'Reply stopped. You can retry this question or ask something else.',error:true,at:Date.now()}]); };
  const clear = async () => { if(messages.length>1 && !(await confirmAction('Start a new chat?', 'This clears this tab’s conversation. It does not delete inquiries already saved for follow-up.', 'Start new chat')).isConfirmed)return; request.current?.abort(); request.current = null; setSending(false); setMessages([greeting]); setQuestion(''); setStatus(''); setSuggestions([]); setDegraded(false); setVisitor({name:'',email:'',goal:''}); setQualified(false); setShareChat(false); setContact(false); conversation.current = `portfolio-${crypto.randomUUID()}`; try { sessionStorage.removeItem(chatStorageKey); } catch { /* Optional. */ } };
  const followUp = async event => {
    event.preventDefault(); if(!(await confirmAction('Send this inquiry to Hashim?', 'Your name, email, and message will be saved for follow-up.', 'Send inquiry')).isConfirmed)return; setSaving(true); setStatus('');
    try {
      const response = await fetch('/api/leads',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify({name:visitor.name,email:visitor.email,message:visitor.goal,source:'profile-bot',conversationId:conversation.current})});
      const result = await response.json(); if (!response.ok) throw new Error(); if (!alive.current) return;
      showSuccess('Inquiry received', 'Your contact history has been updated.'); setQualified(true); setContact(false); setStatus('Your inquiry was saved for Hashim. He can follow up using the email you provided.');
    } catch { if (alive.current) { showError('Inquiry not saved', 'Please try again or use the contact page.'); setStatus('Your inquiry wasn’t saved. Try again or use the contact page.'); } } finally { if (alive.current) setSaving(false); }
  };
  if (!mounted) return null;
  const latestQuestion = [...messages].reverse().find(message => message.role === 'user')?.text;
  return createPortal(<div className="profile-assistant-overlay"><section className="profile-assistant" ref={panel} role="dialog" aria-modal="true" aria-labelledby="assistant-title"><header className="bot-header"><div className="bot-avatar"><Bot size={23} /></div><div><h2 id="assistant-title">Hashim AI <span>PORTFOLIO ASSISTANT</span></h2><p><span className="bot-status-dot" />Projects, experience, and your next idea.</p></div><ThemeToggle compact /><button className="bot-icon-button" onClick={onClose} aria-label="Close profile assistant"><X size={20} /></button></header><div className="bot-utility"><button onClick={() => {setContact(!contact);setStatus('');}} disabled={sending || saving}><Mail size={13} />{contact ? 'Back to conversation' : 'Ask Hashim to follow up'}</button><button onClick={clear} disabled={saving} aria-label="Start a new chat"><RotateCcw size={13} />New chat</button></div>
    {contact ? <form className="bot-contact" onSubmit={followUp}><span className="bot-eyebrow">A HUMAN NEXT STEP</span><h3>Let’s make the connection.</h3><p>Send Hashim a project or hiring inquiry. Your name, email, and form message are saved for follow-up and aren’t passed to the AI model.</p>{[['name','Your name'],['email','Email address']].map(([key,label]) => <label key={key}>{label}<input required disabled={saving} autoComplete={key} type={key === 'email' ? 'email' : 'text'} maxLength={key === 'email' ? 320 : 120} value={visitor[key]} onChange={event => setVisitor(current => ({...current,[key]:event.target.value}))} /></label>)}<label>What would you like to discuss?<textarea required disabled={saving} minLength={10} maxLength={2000} rows={5} value={visitor.goal} onChange={event => setVisitor(current => ({...current,goal:event.target.value}))} /></label><label className="bot-checkbox"><input type="checkbox" checked={shareChat} onChange={event => setShareChat(event.target.checked)} /><span>Also save future questions and replies in this chat for Hashim to review.</span></label><button className="bot-submit-inquiry" disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}{saving ? 'Saving inquiry…' : 'Send inquiry to Hashim'}</button>{status && <p role="status" className="bot-small-status">{status}</p>}<Link href="/#contact" onClick={onClose}>Or use the contact page <ArrowUpRight size={13} /></Link></form> : <>
    <div className="bot-conversation" role="log" aria-live="polite" aria-label="Conversation" aria-busy={sending}>{messages.map((message,index) => <ChatMessage key={index} message={message} onClose={onClose} canRetry={!sending && index === messages.length - 1} onRetry={() => send(latestQuestion || '',true)} />)}{messages.length === 1 && <div className="bot-welcome"><p className="bot-eyebrow">A FEW GOOD PLACES TO START</p><div>{starters.map(({icon:Icon,title,text}) => <button key={title} onClick={() => send(text)}><Icon size={18} /><span>{title}</span><ArrowUpRight size={14} /></button>)}</div><p>No forms to fill. Just ask.</p></div>}{sending && <div className="bot-thinking" role="status"><span /><span /><span /><p>Putting the details together…</p></div>}<div ref={end} /></div>
    {degraded && <p className="bot-service-note" role="status">Live AI is taking a break. These replies use verified profile information.</p>}{suggestions.length > 0 && !sending && <div className="bot-suggestions" aria-label="Suggested follow-up questions">{suggestions.map(item => <button key={item} onClick={() => send(item)}>{item}<ArrowUpRight size={12} /></button>)}</div>}
    <form className="bot-composer" onSubmit={event => {event.preventDefault();send(question);}}><div><textarea ref={input} rows={2} maxLength={1000} value={question} onChange={event => setQuestion(event.target.value)} onKeyDown={event => {if(event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing){event.preventDefault();send(question);}}} placeholder="Ask about a project, or tell me your idea…" aria-label="Ask Hashim AI a question" />{sending ? <button type="button" onClick={stop} aria-label="Stop reply"><Square size={15} /></button> : <button type="submit" disabled={!question.trim()} aria-label="Send question"><ArrowUp size={20} /></button>}</div><div className="bot-composer-meta"><span>English · اردو · Roman Urdu</span><span>{question.length ? `${question.length}/1000` : 'Enter to send · Shift + Enter for a new line'}</span></div>{status && <p role="status" className="bot-small-status">{status}</p>}<p className="bot-privacy">AI assistant, not the live Hashim. Messages are processed by our AI provider. Chat stays in this tab unless you choose follow-up.</p></form>
    </>}
  </section></div>,document.body);
}
