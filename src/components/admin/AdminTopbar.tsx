import { Menu, Search, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const titles: Record<string, string> = {
  overview: 'Platform Overview',
  releases: 'Manage Releases',
  royalties: 'Royalty Administration',
  marketplace: 'Marketplace Sellers',
  users: 'User Management',
  pitches: 'Playlist Pitches',
};

export function AdminTopbar({
  page,
  setPage,
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
}: {
  page: string;
  setPage: (page: string) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  user: User;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-red-900/20 bg-slate-950/80 px-3 py-3 backdrop-blur-xl sm:px-4 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 pr-24 sm:pr-40 md:pr-0 flex items-center gap-3">
          <button className="p-2 -ml-2 rounded-xl text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-500 sm:text-xs">System Admin</p>
            <h1 className="truncate text-xl font-black text-white sm:text-2xl md:text-3xl">{titles[page] || 'Dashboard'}</h1>
          </div>
        </div>
        <div className="hidden md:flex flex-1 justify-center relative">
          <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/70 focus-within:border-red-500/50">
            <Search className="h-4 w-4 shrink-0 text-red-400" />
            <input
              placeholder="Search users by email or ID..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/40"
            />
          </div>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2 sm:gap-3 md:static">
          <div className="flex items-center gap-2 rounded-2xl border border-red-900/30 bg-red-950/20 px-3 py-1.5 sm:px-4 sm:py-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="hidden max-w-[120px] truncate text-sm font-bold text-red-200 sm:block">Admin Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
}
