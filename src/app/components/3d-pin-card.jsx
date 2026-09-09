'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight, Layers3 } from 'lucide-react';
import { useEffect, useState } from 'react';

const projects = [
  { title: 'Leadmate AI Sales Assistant', category: 'AI Sales Platform', desc: 'An AI-powered sales assistant that helps teams organize, qualify, and act on leads through automated workflows.', img: '/images/ecommerce.png', stack: ['Next.js', 'FastAPI', 'LLM APIs'] },
  { title: 'Health Insurance System', category: 'Enterprise Software', desc: 'Role-based dashboards for managing employees, patients, administrators, and policy assignments.', img: '/images/pharma.png', stack: ['ASP.NET Core', 'MVC', 'SQL Server'] },
  { title: 'Hotel Management System', category: 'Full-stack Web App', desc: 'A complete operations platform for room bookings, employees, salaries, and role management.', img: '/images/management.png', stack: ['Next.js', 'Node.js', 'Express'] },
  { title: 'E-Commerce Platform', category: 'Commerce Experience', desc: 'A polished shopping experience with authentication, product discovery, and Stripe payments.', img: '/images/ecommerce.png', stack: ['React', 'Tailwind', 'Stripe'] },
  { title: 'AgentOS', category: 'Agentic AI Platform', desc: 'A multi-tenant platform for configuring, managing, and running AI agents with flexible model and voice integrations.', img: '/images/agentos.png', stack: ['Next.js', 'FastAPI', 'AI Agents'] },
];

export default function ProjectsShowcase() {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => setVisibleCount(window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3);
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const move = (direction) => setIndex((current) => (current + direction + projects.length) % projects.length);
  const visibleProjects = Array.from({ length: visibleCount }, (_, offset) => projects[(index + offset) % projects.length]);

  return (
    <section id="projects" className="relative px-5 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300"><Layers3 className="h-4 w-4" /> Selected work</p>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-5xl">Products built to make complex work feel simple.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-400 md:text-right">A selection of data platforms, business tools, and intelligent products built from idea to production.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleProjects.map((project, offset) => (
              <motion.article key={`${project.title}-${index}-${offset}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35, delay: offset * 0.06 }} className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/20">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <Image src={project.img} alt={project.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-[11px] font-medium text-cyan-100 backdrop-blur">{project.category}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4"><h3 className="text-xl font-semibold text-white">{project.title}</h3><ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-cyan-300 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-400">{project.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">{project.stack.map((item) => <span key={item} className="rounded-md bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300">{item}</span>)}</div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2" aria-label="Project carousel position">{projects.map((project, projectIndex) => <button key={project.title} onClick={() => setIndex(projectIndex)} aria-label={`Show ${project.title}`} className={`h-1.5 rounded-full transition-all ${projectIndex === index ? 'w-8 bg-cyan-300' : 'w-2 bg-white/20'}`} />)}</div>
          <div className="flex gap-2"><button onClick={() => move(-1)} aria-label="Previous projects" className="rounded-full border border-white/15 p-2.5 text-slate-300 transition hover:border-cyan-300 hover:text-cyan-300"><ChevronLeft className="h-5 w-5" /></button><button onClick={() => move(1)} aria-label="Next projects" className="rounded-full border border-white/15 p-2.5 text-slate-300 transition hover:border-cyan-300 hover:text-cyan-300"><ChevronRight className="h-5 w-5" /></button></div>
        </div>
      </div>
    </section>
  );
}
