'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const versions = [
  { label: 'ATS CV', href: '/Syed_Hashim_ATS_CV.pdf', description: 'A straightforward format for job applications.' },
  { label: 'Non-ATS CV', href: '/Hashim%20Resume.pdf', description: 'The designed version, for a more visual introduction.' },
];

export default function CVPreview() {
  const [selected, setSelected] = useState(0);
  const cv = versions[selected];
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/#hero" className="text-sm text-cyan-200 hover:underline">← Back to my portfolio</Link>
        <h1 className="mt-7 text-3xl font-bold sm:text-4xl">Take a look at my CV</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Choose the version that works for you. You can read it here or grab a copy.</p>
        <div className="my-6 flex flex-wrap items-center gap-3" role="group" aria-label="CV version">
          {versions.map((version, index) => <button key={version.label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`rounded-lg border px-4 py-3 text-sm font-medium ${selected === index ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}>{version.label}</button>)}
          <a href={cv.href} download className="rounded-lg border border-purple-300/40 px-4 py-3 text-sm text-purple-200 hover:bg-purple-300/10">Download {cv.label}</a>
          <a href={cv.href} target="_blank" rel="noopener noreferrer" className="px-2 py-3 text-sm text-cyan-200 hover:underline">Open PDF in a new tab ↗</a>
        </div>
        <p className="mb-4 text-sm text-slate-400">{cv.description} These are the pages from my original PDF; the download keeps its text selectable.</p>
        <div className="mx-auto max-w-4xl space-y-6" aria-label={`${cv.label} preview`}>
          {[1, 2].map(page => <figure key={`${selected}-${page}`}><Image src={`/cv/preview/${selected === 0 ? 'ats' : 'designed'}-${page}.webp`} alt={`${cv.label}, page ${page} of 2`} width={1061} height={1500} sizes="(max-width: 900px) 100vw, 896px" priority={page === 1} className="h-auto w-full rounded-lg border border-white/20 bg-white"/><figcaption className="mt-2 text-center text-xs text-slate-400">Page {page} of 2</figcaption></figure>)}
        </div>
      </div>
    </main>
  );
}
