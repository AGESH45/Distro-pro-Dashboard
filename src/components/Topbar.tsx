import { useMemo, useState } from 'react';
import { Bell, CheckCircle2, Disc3, Megaphone, Receipt, Search, X, Menu } from 'lucide-react';
import type { Notification, Pitch, Profile, Release, Transaction } from '../lib/api';

const titles: Record<string, string> = {
  home: 'Dashboard',
  catalog: 'Catalog',
  analytics: 'Streams & royalty analytics',
  transactions: 'Royalty transactions',
  create: 'Create a release',
  pitch: 'Pitch your release',
  profile: 'Artist profile',
};

type SearchResult = {
  id: string;
  type: 'Release' | 'Pitch' | 'Transaction';
  title: string;
  subtitle: string;
  page: string;
};

export function Topbar({
  page,
  profile,
  setPage,
  notifications,
  onReadNotification,
  searchQuery,
  onSearchChange,
  releases,
  pitches,
  transactions,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  page: string;
  profile?: Profile | null;
  setPage: (page: string) => void;
  notifications: Notification[];
  onReadNotification: (id: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  releases: Release[];
  pitches: Pitch[];
  transactions: Transaction[];
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unread = safeNotifications.filter((item) => !item.is_read).length;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const results = useMemo<SearchResult[]>(() => {
    if (!normalizedQuery) return [];
    const releaseResults = releases
      .filter((release) => [release.title, release.artist_name, release.genre, release.status, release.upc].some((value) => String(value || '').toLowerCase().includes(normalizedQuery)))
      .map((release) => ({ id: `release-${release.id}`, type: 'Release' as const, title: release.title, subtitle: `${release.artist_name} · ${release.status} · ${release.genre}`, page: 'catalog' }));
    const pitchResults = pitches
      .filter((pitch) => [pitch.release_title, pitch.artist_name, pitch.genre, pitch.pitch_goal, pitch.status].some((value) => String(value || '').toLowerCase().includes(normalizedQuery)))
      .map((pitch) => ({ id: `pitch-${pitch.id}`, type: 'Pitch' as const, title: pitch.release_title, subtitle: `${pitch.status} · ${pitch.pitch_goal}`, page: 'pitch' }));
    const transactionResults = transactions
      .filter((transaction) => [transaction.description, transaction.method, transaction.reference, transaction.status].some((value) => String(value || '').toLowerCase().includes(normalizedQuery)))
      .map((transaction) => ({ id: `transaction-${transaction.id}`, type: 'Transaction' as const, title: transaction.description, subtitle: `${transaction.status} · $${Number(transaction.amount).toFixed(2)} · ${transaction.reference}`, page: 'transactions' }));
    return [...releaseResults, ...pitchResults, ...transactionResults].slice(0, 8);
  }, [normalizedQuery, pitches, releases, transactions]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!normalizedQuery) return;
    if (results[0]) setPage(results[0].page);
    else setPage('catalog');
    setSearchOpen(false);
  };

  const resultIcon = (type: SearchResult['type']) => {
    if (type === 'Release') return <Disc3 className="h-5 w-5 text-blue-200" />;
    if (type === 'Pitch') return <Megaphone className="h-5 w-5 text-red-200" />;
    return <Receipt className="h-5 w-5 text-emerald-200" />;
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 px-3 py-3 backdrop-blur-xl sm:px-4 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 pr-24 sm:pr-40 md:pr-0 flex items-center gap-3">
          <button className="p-2 -ml-2 rounded-xl text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-300 sm:text-xs">Artist Portal</p>
            <h1 className="truncate text-xl font-black text-white sm:text-2xl md:text-3xl">{titles[page] || 'Dashboard'}</h1>
          </div>
        </div>
        <form onSubmit={submitSearch} className="relative order-3 w-full md:order-none md:flex md:flex-1 md:justify-center">
          <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/70 focus-within:border-blue-400">
            <button type="submit" aria-label="Search"><Search className="h-4 w-4 shrink-0 text-blue-200" /></button>
            <input
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => { onSearchChange(event.target.value); setSearchOpen(true); }}
              placeholder="Search releases, royalties, pitches"
              className="w-full bg-transparent text-white outline-none placeholder:text-white/40"
            />
            {searchQuery && <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search"><X className="h-4 w-4 text-white/45" /></button>}
          </div>
          {searchOpen && normalizedQuery && (
            <div className="absolute left-0 right-0 top-full z-40 mt-3 max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50 md:left-auto md:right-auto md:w-full">
              <div className="border-b border-white/10 p-3 text-xs font-bold uppercase tracking-[0.2em] text-white/45">Search results</div>
              <div className="max-h-80 overflow-y-auto p-2">
                {results.length === 0 && <p className="p-4 text-sm text-white/55">No results found. Try a release title, UPC, royalty reference, or pitch goal.</p>}
                {results.map((result) => (
                  <button key={result.id} type="button" onClick={() => { setPage(result.page); setSearchOpen(false); }} className="mb-2 flex w-full items-start gap-3 rounded-2xl bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10">{resultIcon(result.type)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-white">{result.title}</span>
                      <span className="mt-1 block text-sm text-white/58">{result.type} · {result.subtitle}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
        <div className="absolute right-3 top-3 flex items-center gap-2 sm:gap-3 md:static">
          <div className="relative">
            <button onClick={() => setNotificationsOpen((value) => !value)} className="relative grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/70 sm:h-11 sm:w-11" aria-label="Open notifications">
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">{unread}</span>}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50 sm:w-96">
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                  <div>
                    <p className="font-black text-white">Notifications</p>
                    <p className="text-xs text-white/45">{unread} unread updates</p>
                  </div>
                  <button onClick={() => safeNotifications.filter((n) => !n.is_read).forEach((n) => onReadNotification(n.id))} className="text-xs font-bold text-blue-200">Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {safeNotifications.length === 0 && <p className="p-4 text-sm text-white/50">No notifications yet.</p>}
                  {safeNotifications.map((item) => (
                    <button key={item.id} onClick={() => onReadNotification(item.id)} className="mb-2 flex w-full gap-3 rounded-2xl bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08]">
                      <CheckCircle2 className={`mt-1 h-5 w-5 shrink-0 ${item.is_read ? 'text-white/25' : 'text-blue-300'}`} />
                      <span className="min-w-0">
                        <span className="block font-bold text-white">{item.title}</span>
                        <span className="mt-1 block text-sm text-white/58">{item.message}</span>
                        <span className="mt-2 block text-xs text-red-200">{item.category} · {new Date(item.created_at).toLocaleDateString()}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setPage('profile')} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-1.5 sm:p-2 sm:pr-4">
            <img src={profile?.avatar_url} className="h-8 w-8 rounded-xl object-cover sm:h-9 sm:w-9" alt="Artist avatar" />
            <span className="hidden max-w-[120px] truncate text-sm font-bold text-white sm:block">{profile?.artist_name || 'Artist'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
