import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, Music2, ShieldCheck, UserPlus } from 'lucide-react';
import supabase, { supabaseAnonKey, supabaseUrl } from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';

type Mode = 'login' | 'register';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function friendlyAuthError(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('failed to fetch') || lower.includes('unable to reach')) return 'Registration could not reach Supabase. Verify VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, allowed site URL/redirect URLs in Supabase Auth settings, and that no browser extension is blocking the request.';
  if (lower.includes('invalid login')) return 'Email or password is incorrect. Please check and try again.';
  if (lower.includes('already registered') || lower.includes('already exists')) return 'This email is already registered. Try signing in instead.';
  if (lower.includes('signup is disabled')) return 'Registration is disabled in Supabase. Enable Email signups in Authentication → Providers → Email.';
  if (lower.includes('email rate limit')) return 'Too many registration emails were requested. Please wait and try again.';
  return text;
}

function AuthInput({ label, icon, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white/75">{label}</span>
      <div className={`flex items-center gap-3 rounded-2xl border bg-black/25 px-4 py-3 transition ${error ? 'border-red-400/70' : 'border-white/10 focus-within:border-blue-400'}`}>
        <span className="text-white/42">{icon}</span>
        <input {...props} className="w-full bg-transparent text-white outline-none placeholder:text-white/35" />
      </div>
      {error && <span className="mt-2 block text-xs font-semibold text-red-200">{error}</span>}
    </label>
  );
}

export function Login({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const score = passwordScore(password);
  const strength = useMemo(() => {
    if (!password) return { label: 'Password strength', color: 'bg-white/10', text: 'text-white/45', width: '0%' };
    if (score <= 2) return { label: 'Weak password', color: 'bg-red-500', text: 'text-red-200', width: '35%' };
    if (score <= 4) return { label: 'Good password', color: 'bg-blue-500', text: 'text-blue-200', width: '70%' };
    return { label: 'Strong password', color: 'bg-emerald-500', text: 'text-emerald-200', width: '100%' };
  }, [password, score]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setGoogleLoading(false);
      setError(customEvent.detail || 'Google sign-in failed. Please try again.');
    };
    window.addEventListener('google-auth-error', handler);
    return () => window.removeEventListener('google-auth-error', handler);
  }, []);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (mode === 'register' && fullName.trim().length < 2) nextErrors.fullName = 'Enter your artist or account name.';
    if (!emailRegex.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 6) nextErrors.password = mode === 'login' ? 'Password is required.' : 'Password must be at least 6 characters.';
    if (mode === 'register') {
      if (password.length < 8) nextErrors.password = 'Use at least 8 characters for a standard account password.';
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) nextErrors.password = 'Include an uppercase letter and a number.';
      if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords must match.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
        onLogin();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), remember_me: remember },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) onLogin();
        else setMessage('Registration successful. Please check your email to confirm your account, then sign in.');
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(friendlyAuthError(text));
    } finally {
      setSubmitting(false);
    }
  };

  const googleSignIn = () => {
    setError('');
    setMessage('');
    setGoogleLoading(true);
    signInWithGoogle('ArtistDirect Dashboard');
    window.setTimeout(() => setGoogleLoading(false), 12000);
  };

  const switchMode = () => {
    setMode((current) => current === 'login' ? 'register' : 'login');
    setError('');
    setMessage('');
    setFieldErrors({});
    setConfirmPassword('');
  };
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(220,38,38,.35),transparent_30%),linear-gradient(135deg,#020617,#0f172a)]" />
      
      {submitting || googleLoading ? (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8">
          <div className="cube-loader">
            <div className="front"></div>
            <div className="back"></div>
            <div className="right"></div>
            <div className="left"></div>
            <div className="top"></div>
            <div className="bottom"></div>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-white/50 animate-pulse">{googleLoading ? 'Connecting to Google...' : 'Authenticating...'}</p>
        </div>
      ) : (
      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_.88fr] lg:px-8">
        <div className="hidden lg:block">
          <div className="mb-6 inline-grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-red-600 to-blue-600"><Music2 className="h-8 w-8" /></div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight md:text-7xl">Production artist portal.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/68">Standalone Supabase authentication, protected API routes, release distribution, Paystack royalty payouts and statement downloads.</p>
          <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
            {['Supabase Auth', 'Google OAuth', 'Paystack Payouts'].map((item) => <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"><ShieldCheck className="mb-3 h-6 w-6 text-blue-200" /><p className="font-black">{item}</p></div>)}
          </div>
        </div>

        <form onSubmit={submit} className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 lg:hidden"><Music2 className="h-6 w-6" /></div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-200">ArtistDirect</p>
              <h2 className="mt-2 text-3xl font-black">{mode === 'login' ? 'Welcome back' : 'Create artist account'}</h2>
              <p className="mt-2 text-sm text-white/55">{mode === 'login' ? 'Sign in to your production artist dashboard.' : 'Create a secure artist account with email/password.'}</p>
            </div>
            <button type="button" onClick={switchMode} className="shrink-0 rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/10">{mode === 'login' ? 'Register' : 'Sign in'}</button>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/20 p-1">
            <button type="button" onClick={() => setMode('login')} className={`rounded-xl px-4 py-3 text-sm font-black transition ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-white/50'}`}>Sign in</button>
            <button type="button" onClick={() => setMode('register')} className={`rounded-xl px-4 py-3 text-sm font-black transition ${mode === 'register' ? 'bg-red-600 text-white' : 'text-white/50'}`}>Register</button>
          </div>

          <div className="mt-6 space-y-4">
            {mode === 'register' && <AuthInput label="Artist / account name" icon={<UserPlus className="h-5 w-5" />} value={fullName} onChange={(e) => setFullName(e.target.value)} error={fieldErrors.fullName} placeholder="Nova Rae" autoComplete="name" />}
            <AuthInput label="Email address" icon={<Mail className="h-5 w-5" />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} placeholder="artist@example.com" autoComplete="email" />
            <div>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-white/75">Password</span>
                <div className={`flex items-center gap-3 rounded-2xl border bg-black/25 px-4 py-3 transition ${fieldErrors.password ? 'border-red-400/70' : 'border-white/10 focus-within:border-blue-400'}`}>
                  <LockKeyhole className="h-5 w-5 text-white/42" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent text-white outline-none placeholder:text-white/35" placeholder="Your password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-white/55">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
                {fieldErrors.password && <span className="mt-2 block text-xs font-semibold text-red-200">{fieldErrors.password}</span>}
              </label>
              {mode === 'register' && <div className="mt-3"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${strength.color}`} style={{ width: strength.width }} /></div><p className={`mt-1 text-xs font-bold ${strength.text}`}>{strength.label}</p></div>}
            </div>
            {mode === 'register' && <AuthInput label="Confirm password" icon={<LockKeyhole className="h-5 w-5" />} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={fieldErrors.confirmPassword} placeholder="Repeat password" autoComplete="new-password" />}

            <label className="flex items-center gap-2 text-sm text-white/60"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-blue-600" /> Remember me</label>

            {error && <div className="flex gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm font-semibold text-red-100"><AlertCircle className="h-5 w-5 shrink-0" /> <span>{error}<span className="mt-2 block text-xs text-red-100/70">Auth URL: {supabaseUrl || 'missing'} · Key loaded: {supabaseAnonKey ? 'yes' : 'no'}</span></span></div>}
            {message && <div className="flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-100"><CheckCircle2 className="h-5 w-5 shrink-0" /> {message}</div>}

            <button disabled={submitting || googleLoading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-950/40 disabled:opacity-60">{mode === 'login' ? 'Sign in securely' : 'Create account'}</button>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35"><span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" /></div>
            <button type="button" onClick={googleSignIn} disabled={submitting || googleLoading} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 font-black text-white hover:bg-white/10 disabled:opacity-60">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-black text-slate-950">G</span>
              Continue with Google
            </button>
            <p className="text-center text-xs leading-5 text-white/45 mt-4">No demo access. Production authentication is handled by Supabase Auth.</p>
          </div>
        </form>
      </section>
      )}
    </main>
  );
}
