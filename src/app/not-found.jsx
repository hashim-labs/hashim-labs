import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300"><Compass className="h-8 w-8" /></div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">404 · Page not found</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">This page took a wrong turn.</h1>
        <p className="mt-5 text-base leading-7 text-slate-400">The page may have moved, or the address may be incomplete. Let&apos;s get you back to the portfolio.</p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
      </div>
    </main>
  );
}
