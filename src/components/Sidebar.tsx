import { BarChart3, Disc3, Home, LogOut, Megaphone, PlusCircle, Receipt, User, DollarSign, ShoppingBag, Activity } from 'lucide-react';

const nav = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'catalog', label: 'Catalog', icon: Disc3 },
  { id: 'engagement', label: 'Consumption', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'transactions', label: 'Royalties', icon: Receipt },
  { id: 'create', label: 'Distribute', icon: PlusCircle },
  { id: 'pitch', label: 'Pitch Release', icon: Megaphone },
  { id: 'profile', label: 'Profile', icon: User },
];

export function Sidebar({ page, setPage, onLogout, mobileMenuOpen, setMobileMenuOpen }: { page: string; setPage: (page: string) => void; onLogout: () => void; mobileMenuOpen?: boolean; setMobileMenuOpen?: (open: boolean) => void }) {
  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen?.(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950/95 p-5 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <button onClick={() => setPage('home')} className="mb-8 flex shrink-0 items-center gap-3 text-left">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 font-black text-white">AD</div>
        <div>
          <div className="text-lg font-black text-white">ArtistDirect</div>
          <div className="text-xs text-white/50">production dashboard</div>
        </div>
      </button>
      <nav className="flex-1 space-y-2 overflow-y-auto pb-4 pr-1 scrollbar-hide">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-lg shadow-blue-950/40' : 'text-white/62 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="h-5 w-5" /> {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto shrink-0 pt-4">
        <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
    </>
  );
}


