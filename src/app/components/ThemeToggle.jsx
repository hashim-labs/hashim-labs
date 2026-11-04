'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import './workspace-themes.css';
const key='portfolio-workspace-theme';
export default function ThemeToggle({compact=false,className=''}){
  const [mode,setMode]=useState('dark');
  useEffect(()=>{
    const apply=value=>{const next=['light','dark'].includes(value)?value:window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.workspaceTheme=next;setMode(next);};
    try{apply(localStorage.getItem(key));}catch{apply('dark');}
    const local=event=>apply(event.detail),storage=event=>{if(event.key===key)apply(event.newValue);};
    window.addEventListener('workspace-theme',local);window.addEventListener('storage',storage);
    return()=>{window.removeEventListener('workspace-theme',local);window.removeEventListener('storage',storage);};
  },[]);
  const toggle=()=>{const next=mode==='dark'?'light':'dark';try{localStorage.setItem(key,next);}catch{/* Preference is optional. */}document.documentElement.dataset.workspaceTheme=next;setMode(next);window.dispatchEvent(new CustomEvent('workspace-theme',{detail:next}));};
  return <button type="button" className={`workspace-theme-toggle ${className}`} onClick={toggle} aria-label={`Switch to ${mode==='dark'?'light':'dark'} theme`} title={`Switch to ${mode==='dark'?'light':'dark'} theme`}>{mode==='dark'?<Sun size={14}/>:<Moon size={14}/>} {!compact&&<span>{mode==='dark'?'Light':'Dark'}</span>}</button>;
}
