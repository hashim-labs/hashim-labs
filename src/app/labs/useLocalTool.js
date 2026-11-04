'use client';
import { useEffect, useState } from 'react';
import { showToast } from '@/lib/alerts';
export function useLocalTool(key,example,validate){
  const [value,setValue]=useState(example),[ready,setReady]=useState(false),[stored,setStored]=useState(false);
  useEffect(()=>{try{const saved=localStorage.getItem(key);if(saved){const parsed=JSON.parse(saved);validate(parsed);setValue(parsed);}}catch{/* An invalid saved draft does not prevent the tool opening. */}setReady(true);},[key,validate]);
  useEffect(()=>{if(!ready)return;try{validate(value);localStorage.setItem(key,JSON.stringify(value));setStored(true);}catch{setStored(false);}},[key,value,ready,validate]);
  return [value,setValue,stored];
}
export function downloadTool(name,content,type='text/markdown'){
  const url=URL.createObjectURL(new Blob([content],{type})),anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();showToast('Your export is ready');setTimeout(()=>URL.revokeObjectURL(url),1000);
}
