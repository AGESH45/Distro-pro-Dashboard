export type WordPressConfig = {
  enabled: boolean;
  apiBase: string;
  siteUrl: string;
  nonce: string;
  jwt: string;
  production: boolean;
};

declare global {
  interface Window {
    ArtistDirectWP?: Partial<WordPressConfig> & {
      currentUser?: {
        id: number;
        email: string;
        name: string;
        avatar: string;
      } | null;
      logoutUrl?: string;
      loginUrl?: string;
      registerUrl?: string;
      googleLoginUrl?: string;
    };
  }
}

declare const process: { env?: Record<string, string | undefined> } | undefined;

const env = import.meta.env as Record<string, string | undefined>;
const runtimeEnv = typeof process !== 'undefined' ? process.env : undefined;
const cleanEnv = (input?: string) => String(input || '').trim().replace(/^['"]|['"]$/g, '').trim();
const value = (key: string) => cleanEnv(env[key] || runtimeEnv?.[key]);

const wpGlobal = typeof window !== 'undefined' ? window.ArtistDirectWP : undefined;
const rawApiBase = cleanEnv(wpGlobal?.apiBase || value('VITE_WORDPRESS_API_BASE'));
const rawSiteUrl = cleanEnv(wpGlobal?.siteUrl || value('VITE_WORDPRESS_SITE_URL'));
const forcedWordPress = value('VITE_USE_WORDPRESS_BACKEND') === 'true';

export const wordpressConfig: WordPressConfig = {
  enabled: Boolean(wpGlobal?.enabled || forcedWordPress || rawApiBase),
  apiBase: rawApiBase ? rawApiBase.replace(/\/$/, '') : '',
  siteUrl: rawSiteUrl ? rawSiteUrl.replace(/\/$/, '') : '',
  nonce: cleanEnv(wpGlobal?.nonce || value('VITE_WORDPRESS_NONCE')),
  jwt: cleanEnv(wpGlobal?.jwt || value('VITE_WORDPRESS_JWT')),
  production: value('VITE_WORDPRESS_PRODUCTION') !== 'false',
};

export const wordpressUser = wpGlobal?.currentUser || null;
export const wordpressLogoutUrl = cleanEnv(wpGlobal?.logoutUrl || value('VITE_WORDPRESS_LOGOUT_URL'));
export const wordpressLoginUrl = cleanEnv(wpGlobal?.loginUrl || value('VITE_WORDPRESS_LOGIN_URL'));
export const wordpressRegisterUrl = cleanEnv(wpGlobal?.registerUrl || value('VITE_WORDPRESS_REGISTER_URL'));
export const wordpressGoogleLoginUrl = cleanEnv(wpGlobal?.googleLoginUrl || value('VITE_WORDPRESS_GOOGLE_LOGIN_URL'));

export const isWordPressReady = Boolean(wordpressConfig.enabled && wordpressConfig.apiBase);

export function toWordPressPath(resource: string) {
  const clean = resource.replace(/^\//, '');
  if (!wordpressConfig.enabled || !wordpressConfig.apiBase) return '';
  return `${wordpressConfig.apiBase}/artistdirect/v1/${clean}`;
}

export function wordpressHeaders(extra?: HeadersInit) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (wordpressConfig.nonce) headers['X-WP-Nonce'] = wordpressConfig.nonce;
  if (wordpressConfig.jwt) headers.Authorization = `Bearer ${wordpressConfig.jwt}`;
  return { ...headers, ...(extra || {}) };
}
