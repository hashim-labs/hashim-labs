'use client';
import { useState } from 'react';
import { ArrowUpRight, Check, Copy, RotateCcw } from 'lucide-react';
import { safeChatLink } from '@/lib/chat-session';
function inline(text) { return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part,index) => part.startsWith('**') ? <strong key={index}>{part.slice(2,-2)}</strong> : part.startsWith('`') ? <code key={index}>{part.slice(1,-1)}</code> : part); }
function replyBlocks(text) {
  const blocks = [];
  for (const [chunkIndex,chunk] of text.split(/```([\s\S]*?)```/g).entries()) {
    if (chunkIndex % 2) { blocks.push(<pre key={`code-${chunkIndex}`}><code>{chunk.replace(/^\w+\n/,'').trim()}</code></pre>); continue; }
    let paragraph = [], list = [];
    const flushParagraph = () => { if (paragraph.length) { blocks.push(<p key={`p-${blocks.length}`}>{inline(paragraph.join('\n'))}</p>); paragraph = []; } };
    const flushList = () => { if (list.length) { blocks.push(<ul key={`list-${blocks.length}`}>{list.map((line,index) => <li key={index}>{inline(line)}</li>)}</ul>); list = []; } };
    for (const line of chunk.split('\n')) {
      if (!line.trim()) { flushParagraph(); flushList(); continue; }
      const bullet = line.match(/^\s*(?:[-•*]|\d+\.)\s+(.*)$/);
      if (bullet) { flushParagraph(); list.push(bullet[1]); }
      else { flushList(); paragraph.push(line.replace(/^#{1,3}\s+(.+)$/,'**$1**')); }
    }
    flushParagraph(); flushList();
  }
  return blocks;
}
export default function ChatMessage({ message, onClose, onRetry, canRetry }) {
  const [copied, setCopied] = useState(false), [copyError, setCopyError] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(message.text); setCopied(true); setCopyError(false); setTimeout(() => setCopied(false),2000); } catch { setCopyError(true); } };
  return <article className={`bot-message ${message.role} ${message.error ? 'failed' : ''}`}><div className="bot-message-label"><span>{message.role === 'user' ? 'You' : 'Hashim AI'}</span>{message.at && <time dateTime={new Date(message.at).toISOString()}>{new Date(message.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time>}</div><div className="bot-bubble" dir="auto">{replyBlocks(message.text)}</div>{message.role === 'assistant' && <><div className="bot-message-actions">{!message.error && <button type="button" onClick={copy} aria-label="Copy reply">{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copied' : 'Copy'}</button>}{message.error && canRetry && <button onClick={onRetry}><RotateCcw size={12} />Retry question</button>}{message.provider === 'local' && !message.error && <span>From the published profile</span>}</div>{copyError && <p role="status" className="bot-small-status">Select the text to copy this reply.</p>}{message.links?.length > 0 && <div className="bot-source-links">{message.links.filter(link => safeChatLink(link.href)).map(link => <a key={link.href} href={link.href} onClick={onClose}>{link.label}<ArrowUpRight size={13} /></a>)}</div>}</>}</article>;
}
