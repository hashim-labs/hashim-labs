'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const reviews = [
  { name: 'Komal Hasan', role: 'Madtech', project: 'Portfolio Development', initials: 'K', quote: 'Working with Hashim on portfolio development was a great experience. He has strong creativity, attention to detail, and a clear understanding of modern UI/UX principles. The way he structured and refined the work made the final output look highly professional and visually consistent.' },
  { name: 'Taha Hasan', role: 'Ecommerce & Lead Generation, USA', project: 'Ecommerce Strategy', initials: 'T', quote: 'Hashim played a key role in helping me understand and improve ecommerce and lead generation strategies. His knowledge of scalable online business models and conversion-focused thinking added real value to my projects and business approach.' },
  { name: 'Vijay', role: 'Docoder Software Company Owner', project: 'Leadmate Co-Creation', initials: 'V', quote: 'Hashim contributed significantly during the development of Leadmate. His technical clarity and product thinking helped shape the platform in a more structured and scalable direction. He understands both the engineering and business side very well.' },
  { name: 'Dropwaer', role: 'Ecommerce Project Collaboration', project: 'Ecommerce Website', initials: 'D', quote: 'Hashim delivered an excellent ecommerce website with a strong focus on performance, clean UI, and user experience. The system was well-structured, scalable, and production-ready, showing strong full-stack development skills.' },
  { name: 'Mohsin', role: 'NCAI', project: 'Professional Collaboration', initials: 'M', quote: 'Working with Hashim was smooth and professional. He is highly adaptable in team environments and communicates effectively across technical tasks. His contribution helped ensure consistent progress and timely delivery of project milestones.' },
  { name: 'Aleema', role: 'Hackathon & Project Experience', project: 'Collaborative Prototyping', initials: 'A', quote: 'Hashim performed exceptionally well in fast-paced hackathon environments. His problem-solving ability and quick execution under pressure stood out, and he consistently contributed valuable technical solutions during collaborative projects.' },
  { name: 'Fatima Saud', role: 'Industry & Project Experience', project: 'Professional Engineering', initials: 'F', quote: 'Hashim demonstrates strong consistency and responsibility in all collaborative projects. His structured approach to development and clear technical understanding make him reliable in both company and team-based environments.' },
  { name: 'Syed Musab', role: 'Ecommerce Business Owner', project: 'Ecommerce Operations', initials: 'S', quote: 'I worked with Hashim on ecommerce projects in an educational and execution capacity, contributing to real business tasks and implementations. This gave me practical exposure to how an ecommerce business operates, including product structuring, workflow execution, and real-world scaling requirements.' },
  { name: 'Shaan', role: 'Solo Entrepreneur & Freelancer', project: 'End-to-End Delivery', initials: 'S', quote: 'Hashim is highly independent and execution-focused. His ability to manage projects end-to-end, communicate with clients, and deliver on time reflects strong ownership and professional discipline.' },
];

export function ExpandableCardDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentIndex((current) => (current + 1) % reviews.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const move = (direction) => setCurrentIndex((current) => (current + direction + reviews.length) % reviews.length);
  const review = reviews[currentIndex];

  return (
    <section id="reviews" className="relative px-5 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Client perspective · {reviews.length} endorsements</p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Good work should leave a signal.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-400 md:text-right">A few words from people who trusted me with meaningful product and engineering challenges.</p>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative flex min-h-[250px] flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-400/15 via-cyan-400/5 to-transparent p-7 sm:p-10">
            <Quote className="h-12 w-12 text-emerald-300/70" strokeWidth={1.2} />
            <div><p className="text-sm uppercase tracking-[0.18em] text-slate-400">Project outcome</p><p className="mt-3 max-w-sm text-2xl font-semibold leading-tight text-white">{review.project}</p></div>
          </div>
          <div className="flex min-h-[250px] flex-col justify-between p-7 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div key={review.name} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
                <div className="mb-6 flex gap-1 text-amber-300" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div>
                <blockquote className="max-w-2xl text-xl leading-8 text-slate-100 sm:text-2xl">&ldquo;{review.quote}&rdquo;</blockquote>
                <div className="mt-8 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-300/15 text-sm font-semibold text-emerald-200">{review.initials}</div><div><p className="font-semibold text-white">{review.name}</p><p className="text-sm text-slate-400">{review.role}</p></div></div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5"><div className="flex items-center gap-3"><span className="text-xs font-medium tracking-[0.2em] text-slate-500">{String(currentIndex + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}</span><div className="flex gap-1.5" aria-label="Choose a review">{reviews.map((item, reviewIndex) => <button key={item.name} onClick={() => setCurrentIndex(reviewIndex)} aria-label={`Show review from ${item.name}`} className={`h-1.5 rounded-full transition-all ${reviewIndex === currentIndex ? 'w-7 bg-emerald-300' : 'w-1.5 bg-white/20 hover:bg-white/50'}`} />)}</div></div><div className="flex gap-2"><button onClick={() => move(-1)} aria-label="Previous review" className="rounded-full border border-white/15 p-2.5 text-slate-300 transition hover:border-emerald-300 hover:text-emerald-300"><ArrowLeft className="h-4 w-4" /></button><button onClick={() => move(1)} aria-label="Next review" className="rounded-full border border-white/15 p-2.5 text-slate-300 transition hover:border-emerald-300 hover:text-emerald-300"><ArrowRight className="h-4 w-4" /></button></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
