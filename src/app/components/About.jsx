'use client';
import Image from 'next/image';
import { BriefcaseBusiness, GraduationCap, MapPin, ArrowUpRight } from 'lucide-react';

const experience = [
 { year: 'Jan 2025 — Present', title: 'Software Engineer', company: 'Crop2X Pvt. Ltd.', description: 'Web and mobile applications, backend APIs, and Docker deployments on DigitalOcean.' },
 { year: 'Jan 2025 — Present', title: 'Research Assistant · Software Engineer', company: 'NCAI · NED University', description: 'AI and IoT systems, firmware integration, deployment pipelines, and student mentorship.' },
 { year: 'Jul 2024 — Jan 2025', title: 'Software Developer', company: 'NCAI · NED University', description: 'Software and firmware integration, data acquisition, and device control.' },
 { year: 'Sep 2023 — Jun 2024', title: 'Software Development Intern', company: 'RCAI · NED University', description: 'Practical application development, problem solving, and collaborative engineering.' },
];
const education = [
 { year: '2023 — Present', title: 'Bachelor of Business Administration', company: 'Allama Iqbal Open University' },
 { year: '2023 — 2025', title: 'Advanced Diploma in Software Engineering', company: 'Aptech Pakistan' },
];
export default function About() {
 return <section id="about" className="px-5 py-16 text-white sm:px-8 lg:py-20">
  <div className="mx-auto max-w-6xl">
   <div className="mb-9 border-b border-white/10 pb-6"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Behind the work</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">About Me</h2></div>
   <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
    <div className="space-y-7">
     <div className="flex flex-col gap-5 rounded-2xl border border-purple-400/20 bg-purple-950/25 p-5 min-[420px]:flex-row min-[420px]:items-center">
      <Image src="/images/hashim-professional.jpg" alt="Syed Hashim at a professional event" width={160} height={160} sizes="(max-width:420px) 112px, 144px" className="h-28 w-28 shrink-0 rounded-xl object-cover object-top sm:h-36 sm:w-36"/>
      <div><h3 className="text-2xl font-semibold">Syed Hashim</h3><p className="mt-2 text-sm leading-6 text-cyan-200">Software · DevOps · AI Engineer</p><p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><MapPin size={14}/>Karachi, Pakistan</p></div>
     </div>
     <div className="space-y-4 text-sm leading-7 text-slate-300"><h3 className="text-xl font-semibold text-white">A little about me.</h3><p>I work across web applications, mobile products, AI systems, and cloud infrastructure. At Crop2X and NCAI–NED, I build tools that connect interfaces and APIs with real-world data, sensors, and research workflows.</p><p>My toolkit includes React, Next.js, React Native, Node.js, Python, and Docker. I like taking a complicated problem and turning it into something people can actually use.</p></div>
     <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"><h3 className="mb-4 text-base font-semibold">Training & certifications</h3><ul className="space-y-3 text-sm leading-6 text-slate-300">{['Agentic AI & Robotics · PIAIC / Panaversity', 'Software development internship · RCAI NED', 'Docker Basics Unleashed'].map(item=><li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"/>{item}</li>)}</ul></div>
     <div className="flex flex-wrap gap-3"><a href="/cv" className="rounded-lg border border-white/20 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/10">Preview both CVs</a><a href="/Syed_Hashim_ATS_CV.pdf" download className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 px-4 py-2.5 text-xs font-medium text-cyan-200 hover:bg-cyan-300/10">ATS CV <ArrowUpRight size={14}/></a><a href="/Hashim%20Resume.pdf" download className="inline-flex items-center gap-2 rounded-lg border border-purple-300/25 px-4 py-2.5 text-xs font-medium text-purple-200 hover:bg-purple-300/10">Non-ATS CV <ArrowUpRight size={14}/></a></div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 sm:p-7">
     <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold"><BriefcaseBusiness size={20} className="text-cyan-300"/>Experience</h3>
     <div className="space-y-6">{experience.map(item=><article key={item.title} className="relative border-l border-purple-400/35 pl-5"><span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-purple-400"/><p className="text-xs text-purple-300">{item.year}</p><h4 className="mt-2 text-base font-semibold leading-6">{item.title}</h4><p className="mt-1 text-sm text-cyan-200/80">{item.company}</p><p className="mt-2 text-xs leading-6 text-slate-400">{item.description}</p></article>)}</div>
     <h3 className="mb-5 mt-8 flex items-center gap-3 border-t border-white/10 pt-6 text-xl font-semibold"><GraduationCap size={20} className="text-purple-300"/>Education</h3>
     <div className="space-y-5">{education.map(item=><article key={item.title}><p className="text-xs text-purple-300">{item.year}</p><h4 className="mt-1.5 text-sm font-semibold">{item.title}</h4><p className="mt-1 text-xs text-slate-400">{item.company}</p></article>)}</div>
    </div>
   </div>
  </div>
 </section>;
}
