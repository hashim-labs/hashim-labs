'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Globe2, LayoutGrid, Pause, Play } from 'lucide-react';
import SphereGallery3D from './ui/sphere-gallery-3d';
import './projects-gallery.css';

export default function ProjectsShowcase({ projects = [] }) {
  const router = useRouter();
  const [list, setList] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const featured = projects.filter((project) => project.featured !== false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(preference.matches); if (preference.matches) setList(true); };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return (
    <section id="projects" className="project-universe">
      <div className="project-universe-heading">
        <div><p className="project-eyebrow"><Globe2 size={15} /> Selected work / {String(featured.length).padStart(2, '0')} projects</p><h2>A world of<br /><span>things I’ve built.</span></h2></div>
        <div className="project-heading-right"><p>From intelligent agents to fields seen from space. Explore the ideas, the craft, and the code behind each project.</p><div className="project-view-switch" aria-label="Project view"><button type="button" aria-pressed={!list} onClick={() => setList(false)}><Globe2 size={15} /> Sphere</button><button type="button" aria-pressed={list} onClick={() => setList(true)}><LayoutGrid size={15} /> List</button></div></div>
      </div>
      {featured.length === 0 ? <p className="rounded-2xl border border-white/10 p-8 text-slate-400">New work is on the way. Check back soon.</p> : list ? <div className="project-list">{featured.map((project) => <Link key={project.slug} href={`/projects/${project.slug}`} className="project-list-card"><div className="project-list-image"><Image src={project.img} alt={`${project.title}${project.artwork ? ' concept artwork' : ' preview'}`} fill unoptimized sizes="(max-width: 640px) 90vw, 30vw" /></div><div><p className="project-eyebrow">{project.category}</p><h3>{project.title} <ArrowUpRight size={20} /></h3><p>{project.desc}</p><div className="project-stack">{project.stack.map((skill) => <span key={skill}>{skill}</span>)}</div></div></Link>)}</div> :
        <div className="project-sphere-panel">
          <div className="project-sphere-stage" role="region" aria-label="Interactive project sphere. Drag to rotate, select an image to open its case study. All projects are also linked below.">
            <SphereGallery3D images={featured.map((project) => ({ image: project.img, link: `/projects/${project.slug}` }))} branches={24} background="#0c0917" scale={85} size={32} speed={paused || reduced ? 0 : 12} hover={65} rounded={16} core={{ coreSize: 16, coreColor: '#c4b5fd70', lineColor: '#67e8f930' }} style={{ minWidth: 0, minHeight: 0 }} onNavigate={(url) => router.push(url)} onUnavailable={() => setList(true)} />
          </div>
          <div className="project-sphere-caption"><span className="project-eyebrow">Ideas in orbit</span><h3>Different worlds.<br />One curious mind.</h3><p>Platforms, agents, and experiences — connected by a love of building useful things.</p><div className="project-stack"><span>AI & automation</span><span>Web platforms</span><span>Mobile</span></div><p className="project-caption-hint">Every image is a doorway.<br />Choose one to see the full story.</p></div>
          <div className="project-sphere-footer"><span>Drag to explore · Click to discover</span><button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume sphere rotation' : 'Pause sphere rotation'}>{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? 'Resume' : 'Pause'}</button></div>
        </div>}
      <nav className="project-quick-links" aria-label="All project case studies">{featured.map((project, index) => <Link key={project.slug} href={`/projects/${project.slug}`}><span>{String(index + 1).padStart(2, '0')}</span>{project.title}<ArrowUpRight size={13} /></Link>)}</nav>
    </section>
  );
}
