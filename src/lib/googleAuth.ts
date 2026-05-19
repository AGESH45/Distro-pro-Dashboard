import supabase, { hasSupabaseConfig } from './supabase';

declare const process: { env?: Record<string, string | undefined> } | undefined;

const env = import.meta.env as Record<string, string | undefined>;
const runtimeEnv = typeof process !== 'undefined' ? process.env : undefined;
const clean = (input?: string) => String(input || '').trim().replace(/^['"]|['"]$/g, '').trim();
const value = (key: string) => clean(env[key] || runtimeEnv?.[key]);
const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export async function signInWithGoogle() {
  if (!hasSupabaseConfig) {
    console.warn('[google-auth] Missing Supabase configuration');
    window.dispatchEvent(new CustomEvent('google-auth-error', { detail: 'Google sign-in is not configured. Missing Supabase credentials.' }));
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    window.dispatchEvent(new CustomEvent('google-auth-error', { detail: error.message }));
  }
}

export async function handleGoogleRedirect() {
  // Supabase automatically handles the redirect from OAuth in the background.
  // We just need to check if there's an error in the URL hash or search params.
  const params = new URLSearchParams(window.location.hash.replace('#', '?') || window.location.search);
  const errorDescription = params.get('error_description');
  if (errorDescription) {
    console.error('[google-auth] OAuth Error:', errorDescription);
    window.dispatchEvent(new CustomEvent('google-auth-error', { detail: errorDescription.replace(/\+/g, ' ') }));
  }
}
