import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import supabase, { hasSupabaseConfig, supabaseConfigError } from './lib/supabase';
import { handleGoogleRedirect } from './lib/googleAuth';
import { Card, Spinner } from './components/Components';
import { Login } from './pages/Login';
import { ArtistApp } from './ArtistApp';
import { AdminApp } from './AdminApp';

handleGoogleRedirect();



function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!hasSupabaseConfig) {
      setAuthLoading(false);
      return () => { mounted = false; };
    }

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;
      if (error) console.error('Auth session error:', error);
      const sessionUser = data.session?.user ?? null;
      // If metadata may be missing, fetch fresh user object to ensure user_metadata is populated
      const { data: freshUser, error: freshErr } = await supabase.auth.getUser();
      if (freshErr) console.error('Failed to fetch fresh user metadata', freshErr);
      const finalUser = freshUser?.user ?? sessionUser;
      console.log('🔎 Current user object:', finalUser);
      setUser(finalUser);
      setAuthLoading(false);
    }).catch((error) => {
      console.error('Auth session error:', error);
      if (mounted) setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Clear any lingering auth tokens from the URL to prevent accidental auto-login on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 text-white"><Spinner /></div>;
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-3xl pt-16">
          <Card>
            <h1 className="text-3xl font-black text-white">Production backend configuration required</h1>
            <p className="mt-3 text-white/60">This standalone production build uses Supabase Auth, Vercel API routes, Supabase Postgres and server-side Paystack. Demo access and WordPress mode are disabled.</p>
            <div className="mt-5 rounded-2xl bg-black/25 p-4 text-sm text-white/65">
              Add these frontend variables and rebuild:<br />
              <code>VITE_SUPABASE_URL=https://your-project.supabase.co</code><br />
              <code>VITE_SUPABASE_ANON_KEY=your-public-anon-key</code><br />
              <br />Server-only variables:<br />
              <code>SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</code><br />
              <code>PAYSTACK_SECRET_KEY=sk_live_xxxxx</code>
            </div>
            {supabaseConfigError && <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm font-semibold text-red-100">{supabaseConfigError}</p>}
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  const isAdmin = user.user_metadata?.role === 'admin';

  if (isAdmin) {
    return <AdminApp user={user} onLogout={signOut} />;
  }

  return <ArtistApp user={user} onLogout={signOut} />;
}

export default App;
