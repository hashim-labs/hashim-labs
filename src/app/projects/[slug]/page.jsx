import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check, Layers3 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getProject, projects } from '@/lib/projects';

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"><ArrowLeft className="h-4 w-4" /> Back to selected work</Link>
        <section className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
          <div className="relative aspect-[16/8] min-h-[300px] overflow-hidden sm:min-h-[420px]"><Image src={project.img} alt={project.title} fill priority className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" /><div className="absolute bottom-0 left-0 max-w-3xl p-6 sm:p-10"><p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300"><Layers3 className="h-4 w-4" /> {project.category}</p><h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{project.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{project.desc}</p></div></div>
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.35fr_0.65fr]">
            <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Case study</p><h2 className="mt-3 text-2xl font-semibold">Building a useful product around the real workflow.</h2><p className="mt-5 text-base leading-8 text-slate-300">{project.overview}</p><div className="mt-10 grid gap-5 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">My role</p><p className="mt-3 text-sm leading-6 text-slate-200">{project.role}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Outcome</p><p className="mt-3 text-sm leading-6 text-slate-200">{project.outcome}</p></div></div><div className="mt-10 grid gap-6 md:grid-cols-2"><div><h3 className="text-lg font-semibold">Challenges and approach</h3><p className="mt-3 text-sm leading-7 text-slate-400">{project.challenges}</p></div><div><h3 className="text-lg font-semibold">Key capabilities</h3><ul className="mt-3 space-y-3">{project.features.map((feature) => <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-300" /> {feature}</li>)}</ul></div></div></div>
            <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Technology</p><div className="mt-4 flex flex-wrap gap-2">{project.stack.map((item) => <span key={item} className="rounded-md bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">{item}</span>)}</div><div className="mt-8 border-t border-white/10 pt-6"><Link href="/#contact" className="flex items-center justify-between rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">Discuss a similar project <ArrowUpRight className="h-4 w-4" /></Link></div></aside>
          </div>
        </section>
      </div>
    </main>
  );
}
