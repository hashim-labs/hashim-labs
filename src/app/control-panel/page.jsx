'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Inbox, KeyRound, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { closeAlert, confirmAction, showError, showLoading, showSuccess } from '@/lib/alerts';

const emptyPassword = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ControlPanel() {
  const [session, setSession] = useState(null);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [password, setPassword] = useState(emptyPassword);
  const [leads, setLeads] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadLeads = async () => {
    const response = await fetch('/api/admin/leads', { cache: 'no-store' });
    if (response.status === 401) {
      setSession(null);
      return;
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load leads.');
    setLeads(result.leads);
  };

  useEffect(() => {
    fetch('/api/admin/me')
      .then(async (response) => response.ok ? response.json() : null)
      .then(async (result) => {
        if (result) {
          setSession(result);
          await loadLeads();
        }
      })
      .catch(() => setMessage({ type: 'error', text: 'Unable to connect to the control panel.' }))
      .finally(() => setLoading(false));
  }, []);

  const submitLogin = async (event) => {
    event.preventDefault();
    const confirmation = await confirmAction('Open admin workspace?', 'Your secure admin session will be started on this device.', 'Sign in');
    if (!confirmation.isConfirmed) return;
    setMessage({ type: '', text: '' });
    setIsLoggingIn(true);
    showLoading('Verifying your credentials...');
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Login failed.');
      setSession(result);
      setLogin({ username: '', password: '' });
      await loadLeads();
      closeAlert();
      showSuccess('Welcome back', 'Your admin session is now protected.');
    } catch (error) {
      closeAlert();
      showError('Sign in failed', error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      showError('Passwords do not match', 'Enter the same new password in both fields.');
      return;
    }
    const confirmation = await confirmAction('Change admin password?', 'Your current session will remain active, but the old password will stop working.', 'Change password');
    if (!confirmation.isConfirmed) return;
    setIsChangingPassword(true);
    showLoading('Updating your password...');
    try {
      const response = await fetch('/api/admin/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(password) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to update password.');
      setPassword(emptyPassword);
      closeAlert();
      showSuccess('Password changed', 'Your new password is active.');
    } catch (error) {
      closeAlert();
      showError('Password not changed', error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const logout = async () => {
    const confirmation = await confirmAction('Sign out of the control panel?', 'You will need to sign in again to view your leads.', 'Sign out');
    if (!confirmation.isConfirmed) return;
    setIsLoggingOut(true);
    showLoading('Signing you out...');
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setSession(null);
      setLeads([]);
    } finally {
      closeAlert();
      setIsLoggingOut(false);
    }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" role="status" aria-label="Loading control panel" /><p className="mt-5 text-sm font-medium text-slate-300">Securing your workspace...</p><p className="mt-2 text-xs text-slate-500">Checking your admin session</p></div></main>;

  if (!session) return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl sm:p-10">
        <div className="mb-8"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300"><ShieldCheck className="h-5 w-5" /></div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Private workspace</p><h1 className="mt-3 text-3xl font-bold">Admin control panel</h1><p className="mt-3 text-sm leading-6 text-slate-400">Sign in to review and manage portfolio inquiries.</p></div>
        <form onSubmit={submitLogin} className="space-y-5"><label className="block text-sm text-slate-300">Username<input required disabled={isLoggingIn} value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300 disabled:opacity-50" /></label><label className="block text-sm text-slate-300">Password<input required disabled={isLoggingIn} type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300 disabled:opacity-50" /></label><button disabled={isLoggingIn} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{isLoggingIn ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" /> : <ArrowRight className="h-4 w-4" />} {isLoggingIn ? 'Verifying...' : 'Sign in'}</button></form>
        {message.text && <p role="alert" className="mt-4 text-sm text-rose-300">{message.text}</p>}
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Private workspace</p><h1 className="mt-2 text-3xl font-bold">Admin control panel</h1><p className="mt-2 text-sm text-slate-400">Signed in as {session.username}</p></div><button disabled={isLoggingOut} onClick={logout} className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:border-rose-300/50 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50">{isLoggingOut ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400/30 border-t-slate-300" /> : <LogOut className="h-4 w-4" />} {isLoggingOut ? 'Signing out...' : 'Sign out'}</button></header>
        {message.text && <p role="status" className={`mt-5 text-sm ${message.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>{message.text}</p>}
        <section className="mt-8 grid gap-5 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><Inbox className="h-5 w-5 text-cyan-300" /><p className="mt-5 text-3xl font-bold">{leads.length}</p><p className="mt-1 text-sm text-slate-400">Total leads</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><Mail className="h-5 w-5 text-emerald-300" /><p className="mt-5 text-3xl font-bold">{leads.filter((lead) => lead.status === 'new').length}</p><p className="mt-1 text-sm text-slate-400">New inquiries</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><KeyRound className="h-5 w-5 text-amber-300" /><p className="mt-5 text-lg font-semibold">Protected</p><p className="mt-1 text-sm text-slate-400">Session and password security active</p></div></section>
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"><div className="border-b border-white/10 p-5"><h2 className="text-xl font-semibold">Portfolio leads</h2><p className="mt-1 text-sm text-slate-400">Inquiries submitted through the public contact form.</p></div>{leads.length === 0 ? <p className="p-8 text-sm text-slate-400">No leads yet.</p> : <div className="divide-y divide-white/10">{leads.map((lead) => <article key={lead.id} className="p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h3 className="font-semibold text-white">{lead.name}</h3><a href={`mailto:${lead.email}`} className="text-sm text-cyan-300 hover:text-cyan-200">{lead.email}</a></div><time className="text-xs text-slate-500">{new Date(lead.created_at).toLocaleString()}</time></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{lead.message}</p></article>)}</div>}</section>
        <section className="mt-8 max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"><h2 className="text-xl font-semibold">Change password</h2><p className="mt-1 text-sm text-slate-400">Use a unique password with at least 12 characters.</p><form onSubmit={submitPassword} className="mt-5 space-y-4"><input required disabled={isChangingPassword} type="password" placeholder="Current password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 disabled:opacity-50" /><input required disabled={isChangingPassword} minLength={12} type="password" placeholder="New password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 disabled:opacity-50" /><input required disabled={isChangingPassword} minLength={12} type="password" placeholder="Confirm new password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 disabled:opacity-50" /><button disabled={isChangingPassword} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60">{isChangingPassword ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" /> : <KeyRound className="h-4 w-4" />} {isChangingPassword ? 'Updating...' : 'Update password'}</button></form></section>
      </div>
    </main>
  );
}
