import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare const process: { env?: Record<string, string | undefined> } | undefined;

const env = import.meta.env as Record<string, string | undefined>;
const runtimeEnv = typeof process !== 'undefined' ? process.env : undefined;

function cleanEnv(value?: string) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

function validSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.includes('supabase');
  } catch {
    return false;
  }
}

export const supabaseUrl = cleanEnv(
  env.VITE_SUPABASE_URL ||
  env.VITE_NEXT_PUBLIC_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  runtimeEnv?.VITE_SUPABASE_URL ||
  runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL
);

export const supabaseAnonKey = cleanEnv(
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  runtimeEnv?.VITE_SUPABASE_ANON_KEY ||
  runtimeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabaseConfigError = !supabaseUrl
  ? 'Missing VITE_SUPABASE_URL in .env'
  : !validSupabaseUrl(supabaseUrl)
    ? 'VITE_SUPABASE_URL must be a valid Supabase https URL'
    : !supabaseAnonKey
      ? 'Missing VITE_SUPABASE_ANON_KEY in .env'
      : '';

export const hasSupabaseConfig = !supabaseConfigError;

const fallbackClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error(`${supabaseConfigError}. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart npm run dev.`) }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error(`${supabaseConfigError}. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart npm run dev.`) }),
    signOut: async () => ({ error: null }),
    updateUser: async () => ({ data: { user: null }, error: new Error('Supabase is not configured.') }),
    setSession: async () => ({ data: { session: null, user: null }, error: new Error('Supabase is not configured.') }),
    signInWithIdToken: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured.') }),
  },
} as unknown as SupabaseClient;

let supabase: SupabaseClient = fallbackClient;

if (hasSupabaseConfig) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'artistdirect-auth',
      },
      global: {
        fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
          try {
            return await fetch(input, init);
          } catch (error) {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
            console.error('[supabase] network request failed:', url, error);
            throw new Error('Unable to reach the authentication server. Check your internet connection, Supabase URL/anon key, and browser CORS/ad-blocker settings.');
          }
        },
      },
    });
  } catch (error) {
    console.error('[supabase] client initialization failed:', error);
    supabase = fallbackClient;
  }
} else {
  console.warn('[supabase] using fallback auth client:', supabaseConfigError);
}

export default supabase;
