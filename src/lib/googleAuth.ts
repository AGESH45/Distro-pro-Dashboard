import supabase, { hasSupabaseConfig } from './supabase';

declare const process: { env?: Record<string, string | undefined> } | undefined;

const env = import.meta.env as Record<string, string | undefined>;
const runtimeEnv = typeof process !== 'undefined' ? process.env : undefined;
const clean = (input?: string) => String(input || '').trim().replace(/^['"]|['"]$/g, '').trim();
const value = (key: string) => clean(env[key] || runtimeEnv?.[key]);
const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function buildGoogleUrl(appName: string) {
  const clientId = value('VITE_GOOGLE_CLIENT_ID');
  const redirectUri = value('VITE_GOOGLE_AUTH_PROXY');
  const supabaseUrl = value('VITE_SUPABASE_URL') || value('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = value('VITE_SUPABASE_ANON_KEY') || value('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!hasSupabaseConfig) return null;
  if (!clientId || !redirectUri) return null;
  const state = btoa(JSON.stringify({ origin: window.location.origin, appName, supabaseUrl, supabaseAnonKey }));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(state)}`;
}

export function signInWithGoogle(appName = 'ArtistDirect Dashboard') {
  const url = buildGoogleUrl(appName);
  if (!url) {
    console.warn('[google-auth] Missing Google/Supabase environment configuration');
    window.dispatchEvent(new CustomEvent('google-auth-error', { detail: 'Google sign-in is not configured locally. Add VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_AUTH_PROXY, VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.' }));
    return;
  }

  window.open(url, 'google-auth', isMobile() ? '' : 'width=500,height=600');

  const handler = async (event: MessageEvent) => {
    if (event.data?.type === 'google-auth-denied') {
      window.removeEventListener('message', handler);
      window.dispatchEvent(new CustomEvent('google-auth-error', { detail: 'Google sign-in was cancelled.' }));
      return;
    }
    if (event.data?.type !== 'google-auth-success') return;
    window.removeEventListener('message', handler);
    if (event.data.access_token && event.data.refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token: event.data.access_token, refresh_token: event.data.refresh_token });
      if (error) window.dispatchEvent(new CustomEvent('google-auth-error', { detail: error.message }));
    } else if (event.data.id_token) {
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: event.data.id_token });
      if (error) window.dispatchEvent(new CustomEvent('google-auth-error', { detail: error.message }));
    }
  };
  window.addEventListener('message', handler);
}

export async function handleGoogleRedirect() {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('google_id_token');
    if (!token || !hasSupabaseConfig) return;
    window.history.replaceState({}, '', window.location.pathname);
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
    if (error) {
      console.error('[google-auth] signInWithIdToken failed:', error.message);
      return;
    }
    try { window.close(); } catch {}
  } catch (error) {
    console.error('[google-auth] redirect handler failed:', error);
  }
}
