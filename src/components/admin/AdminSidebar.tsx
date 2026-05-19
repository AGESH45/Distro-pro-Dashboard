import { LayoutDashboard, Users, Disc3, Receipt, ShoppingBag, Megaphone, LogOut } from 'lucide-react';

const adminNav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'releases', label: 'Releases', icon: Disc3 },
  { id: 'royalties', label: 'Royalties', icon: Receipt },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'pitches', label: 'Pitches', icon: Megaphone },
];

export function AdminSidebar({ page, setPage, onLogout, mobileMenuOpen, setMobileMenuOpen }: { page: string; setPage: (page: string) => void; onLogout: () => void; mobileMenuOpen?: boolean; setMobileMenuOpen?: (open: boolean) => void }) {
  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen?.(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-red-900/20 bg-slate-950/95 p-5 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setPage('overview')} className="mb-8 flex shrink-0 items-center gap-3 text-left">
          <img src="/logo.png" alt="TRM Distro" className="h-10 w-auto object-contain" />
          <div>
            <div className="text-lg font-black text-white">TRM Admin</div>
            <div className="text-xs text-sky-400">management portal</div>
          </div>
        </button>
        <nav className="flex-1 space-y-2 overflow-y-auto pb-4 pr-1 scrollbar-hide">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-950/40' : 'text-white/62 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-5 w-5" /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto shrink-0 pt-4">
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 hover:bg-red-500/10 hover:text-red-400 transition">
            <LogOut className="h-4 w-4" /> Exit Admin
          </button>
        </div>
      </aside>
    </>
  );
}
