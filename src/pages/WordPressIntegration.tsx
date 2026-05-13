import { CheckCircle2, Code2, Database, Globe2, KeyRound, PlugZap, ShieldCheck, UploadCloud } from 'lucide-react';
import { Card, Chip } from '../components/Components';
import { wordpressConfig } from '../lib/wordpress';

const endpoints = [
  ['GET/POST/PUT/DELETE', '/wp-json/artistdirect/v1/releases', 'Release catalog, artwork, status and UPC metadata'],
  ['GET', '/wp-json/artistdirect/v1/analytics', 'Streams, royalties, platforms and market analytics'],
  ['GET/POST', '/wp-json/artistdirect/v1/transactions', 'Royalty history and payout requests'],
  ['GET/POST', '/wp-json/artistdirect/v1/pitches', 'Campaign and release pitch submissions'],
  ['GET/PUT', '/wp-json/artistdirect/v1/profile', 'WordPress user profile and artist metadata'],
  ['POST', '/wp-json/artistdirect/v1/password', 'WordPress password update with validation'],
  ['GET/PUT', '/wp-json/artistdirect/v1/notifications', 'Dashboard alerts and read status'],
];

const checklist = [
  'Create a WordPress plugin named artistdirect-dashboard-api.',
  'Register custom REST routes under artistdirect/v1.',
  'Use WordPress users for login/registration and Google login via a WP OAuth plugin.',
  'Store releases and pitches as custom post types or custom database tables.',
  'Store profile data in user_meta and images in the WordPress Media Library.',
  'Expose wpApiSettings nonce or ArtistDirectWP config to this React dashboard.',
  'Host the built React files inside WordPress plugin/theme or keep Vercel and point it to WP REST API.',
];

export function WordPressIntegration() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative bg-slate-900 p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.32),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(220,38,38,.28),transparent_30%)]" />
            <div className="relative">
              <Chip tone="blue">WordPress backend ready</Chip>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Integrate this dashboard with your WordPress site.</h2>
              <p className="mt-4 text-white/62">The dashboard now supports a WordPress REST API backend mode. Your WordPress site can own users, media uploads, releases, pitches, payouts, analytics and notifications.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"><Globe2 className="mb-3 h-6 w-6 text-blue-200" /><p className="font-black text-white">Host in WordPress</p><p className="mt-1 text-sm text-white/50">Build files can be enqueued by a plugin or theme page.</p></div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"><Database className="mb-3 h-6 w-6 text-red-200" /><p className="font-black text-white">WP data source</p><p className="mt-1 text-sm text-white/50">REST endpoints replace the Vercel API layer.</p></div>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="text-2xl font-black text-white">Current connection mode</h3>
            <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-5">
              <div className="flex items-center gap-3"><PlugZap className="h-6 w-6 text-blue-200" /><div><p className="font-black text-white">{wordpressConfig.enabled ? 'WordPress REST API mode enabled' : 'WordPress mode not configured yet'}</p><p className="break-all text-sm text-white/50">API base: {wordpressConfig.apiBase || 'Set VITE_WORDPRESS_API_BASE or window.ArtistDirectWP.apiBase'}</p></div></div>
            </div>
            <div className="mt-6 space-y-3">
              {checklist.map((item) => <div key={item} className="flex gap-3 rounded-2xl bg-white/[0.05] p-3 text-sm text-white/70"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /> {item}</div>)}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3"><Code2 className="h-6 w-6 text-blue-200" /><h3 className="text-xl font-black text-white">Required REST API contract</h3></div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-white/[0.06] text-white/50"><tr><th className="p-3">Method</th><th>Endpoint</th><th>Purpose</th></tr></thead><tbody>{endpoints.map((row) => <tr key={row[1]} className="border-t border-white/10 text-white/70"><td className="p-3 font-black text-blue-100">{row[0]}</td><td className="font-mono text-xs text-white">{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></table>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-red-200" /><h3 className="text-xl font-black text-white">How auth should work</h3></div>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/65">
            <p><b className="text-white">Inside WordPress:</b> use WordPress login/registration, then enqueue this dashboard only for logged-in artists. Pass a REST nonce using <code className="rounded bg-white/10 px-1">wp_localize_script</code>.</p>
            <p><b className="text-white">Google login:</b> install/configure a WordPress Google OAuth plugin, or keep Supabase Google auth if you prefer separate dashboard accounts.</p>
            <p><b className="text-white">Media upload:</b> release artwork and profile pictures should upload to the WordPress Media Library, then REST endpoints return attachment URLs.</p>
            <p><b className="text-white">Security:</b> verify <code className="rounded bg-white/10 px-1">current_user_can()</code>, nonces, roles, and ownership for every artist record.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/[0.05] p-4"><KeyRound className="mb-2 h-5 w-5 text-blue-200" /><p className="font-bold text-white">WP users</p><p className="text-xs text-white/45">One login across the main site and dashboard.</p></div><div className="rounded-2xl bg-white/[0.05] p-4"><UploadCloud className="mb-2 h-5 w-5 text-red-200" /><p className="font-bold text-white">WP media</p><p className="text-xs text-white/45">Artwork and avatars managed centrally.</p></div></div>
        </Card>
      </div>
    </div>
  );
}
