 'use client';

import { useState } from 'react';
import { ArrowUpRight, Github, Instagram, Linkedin, Mail, MapPin, Phone, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { closeAlert, confirmAction, showError, showLoading, showSuccess } from '@/lib/alerts';

const contactDetails = [
	{ label: 'Email', value: 'hashimhasan444@gmail.com', href: 'mailto:hashimhasan444@gmail.com', icon: Mail },
	{ label: 'Phone', value: '+92 324 0251086', href: 'tel:+923240251086', icon: Phone },
	{ label: 'LinkedIn', value: 'linkedin.com/in/syed-hashim-3324a3325', href: 'https://www.linkedin.com/in/syed-hashim-3324a3325', icon: Linkedin },
	{ label: 'GitHub', value: 'github.com/hashim-labs', href: 'https://github.com/hashim-labs', icon: Github },
];

const socialLinks = [
	{ label: 'GitHub', href: 'https://github.com/hashim-labs', icon: Github },
	{ label: 'Instagram', href: 'https://instagram.com/hashim.dev', icon: Instagram },
];

export default function Contact() {
	const [form, setForm] = useState({ name: '', email: '', message: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateField = (event) => {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const confirmation = await confirmAction('Send this inquiry?', 'Your contact details and message will be securely saved for follow-up.', 'Send inquiry');
		if (!confirmation.isConfirmed) return;
		setIsSubmitting(true);
		showLoading('Saving your inquiry...');
		try {
			const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || 'Unable to send your inquiry.');
			setForm({ name: '', email: '', message: '' });
			showSuccess('Inquiry received', 'Thanks for reaching out. Your message has been securely saved.');
		} catch (error) {
			closeAlert();
			showError('Message not sent', error.message || 'Unable to save your inquiry right now.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section id="contact" className="relative overflow-x-hidden px-5 py-20 sm:px-8 lg:px-12">
			<div className="mx-auto min-w-0 max-w-7xl">
				<div className="mb-10 border-b border-white/10 pb-8">
					<p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Start a conversation</p>
					<h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">Have a product idea? Let&apos;s make it useful.</h2>
					<p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Tell me what you are building, where you are stuck, or what you want to improve. I&apos;ll get back to you as soon as possible.</p>
				</div>

				<div className="grid min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 lg:grid-cols-[0.85fr_1.15fr]">
					<div className="flex min-w-0 flex-col justify-between bg-gradient-to-br from-cyan-400/15 via-slate-950/20 to-emerald-400/10 p-7 sm:p-10">
						<div>
							<p className="text-sm font-medium text-slate-300">Available for</p>
							<p className="mt-3 max-w-sm text-2xl font-semibold leading-tight text-white">Full-stack products, AI agents, and thoughtful technical collaboration.</p>
							<div className="mt-8 flex items-center gap-2 text-sm text-slate-400"><MapPin className="h-4 w-4 text-cyan-300" /> Karachi, Pakistan</div>
						</div>
						<div className="mt-12 space-y-4">
							{contactDetails.map(({ label, value, href, icon: Icon }) => (
								<a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-3 transition hover:border-cyan-300/40 hover:bg-white/[0.06]">
									<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200"><Icon className="h-4 w-4" /></span>
									<span className="min-w-0 flex-1"><span className="block text-xs uppercase tracking-[0.16em] text-slate-500">{label}</span><span className="block truncate text-sm text-slate-200">{value}</span></span>
									<ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
								</a>
							))}
						</div>
						<div className="mt-8 flex gap-3">{socialLinks.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="rounded-full border border-white/15 p-2.5 text-slate-400 transition hover:border-cyan-300 hover:text-cyan-300"><Icon className="h-4 w-4" /></a>)}</div>
					</div>

					<motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="min-w-0 p-7 sm:p-10">
						<div className="grid gap-5 sm:grid-cols-2">
							<label className="text-sm text-slate-300">Your name<input required name="name" value={form.name} onChange={updateField} placeholder="Jane Smith" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/10" /></label>
							<label className="text-sm text-slate-300">Email address<input required type="email" name="email" value={form.email} onChange={updateField} placeholder="jane@company.com" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/10" /></label>
						</div>
						<label className="mt-5 block text-sm text-slate-300">How can I help?<textarea required name="message" value={form.message} onChange={updateField} rows={7} placeholder="Tell me a little about your project..." className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/10" /></label>
						<input name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" className="hidden" />
						<div className="mt-6"><button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"><Send className="h-4 w-4" /> {isSubmitting ? 'Sending...' : 'Send inquiry'}</button></div>
					</motion.form>
				</div>
			</div>
		</section>
	);
}
