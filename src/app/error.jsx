'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({ reset }) {
  useEffect(() => {
    console.error('Portfolio application error');
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-300/10 text-rose-300"><AlertTriangle className="h-8 w-8" /></div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-rose-300">Something went wrong</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">The page needs a quick reset.</h1>
        <p className="mt-5 text-base leading-7 text-slate-400">An unexpected error interrupted this view. Your data is safe. Try loading the page again.</p>
        <button onClick={() => reset()} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"><RotateCcw className="h-4 w-4" /> Try again</button>
      </div>
    </main>
  );
}
