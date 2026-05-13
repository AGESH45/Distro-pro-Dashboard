import { Search, LucideIcon } from 'lucide-react';

export function AdminHeader({ title, icon: Icon, children }: { title: string; icon?: LucideIcon; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/20 shadow-lg shadow-red-950/20">
            <Icon className="h-6 w-6 text-red-400" />
          </div>
        )}
        <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}

export function AdminSearch({ value, onChange, onSearch, placeholder = 'Search...' }: { value: string; onChange: (val: string) => void; onSearch?: () => void; placeholder?: string }) {
  return (
    <div className="group relative flex items-center">
      <div className="absolute left-4 text-white/30 group-focus-within:text-red-400 transition-colors">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-red-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-red-500/10 sm:w-72"
      />
      {onSearch && (
        <button 
          onClick={onSearch}
          className="ml-2 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 px-4 text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-95"
        >
          Search
        </button>
      )}
    </div>
  );
}
