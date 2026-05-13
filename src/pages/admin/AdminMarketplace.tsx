import { useState } from 'react';
import { Card } from '../../components/Components';
import { ShoppingBag, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminComponents';

export function AdminMarketplace({ notify }: { notify: (msg: string) => void }) {
  // Mock applications
  const [applications, setApplications] = useState([
    { id: 1, name: 'ProdByFlame', email: 'flame@example.com', category: 'Beats', portfolio: 'https://flame.com', status: 'Pending' },
    { id: 2, name: 'MixMaster Jay', email: 'jay@example.com', category: 'Mixing', portfolio: 'https://jaymix.com', status: 'Pending' }
  ]);

  const handleAction = (id: number, action: 'Approved' | 'Rejected') => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
    notify(`Application ${action.toLowerCase()}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminHeader title="Marketplace Sellers" icon={ShoppingBag} />

      <Card className="border-white/5 bg-white/[0.02]">
        <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Onboarding Queue</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">Review seller account applications</p>
          </div>
        </div>

        <div className="grid gap-6">
          {applications.map((app) => (
            <div key={app.id} className="group flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl bg-white/[0.03] p-6 border border-white/5 hover:bg-white/[0.06] transition-all hover:border-red-500/20">
              <div className="flex items-start gap-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/5 text-white/20 font-black text-lg group-hover:bg-red-500/10 group-hover:text-red-400 transition-colors">
                  {app.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-white text-lg">{app.name}</h4>
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-black px-2.5 py-1 rounded-lg border ${
                      app.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/40 font-medium">
                    {app.email} · <span className="text-red-400/60 font-black uppercase text-[10px] tracking-widest ml-1">{app.category}</span>
                  </p>
                  <a href={app.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors mt-3">
                    View Portfolio <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {app.status === 'Pending' && (
                <div className="flex items-center gap-3">
                  <button onClick={() => handleAction(app.id, 'Approved')} className="flex items-center gap-2 rounded-2xl bg-emerald-600/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-emerald-950/20">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button onClick={() => handleAction(app.id, 'Rejected')} className="flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-white/10">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {applications.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-white/20 font-black uppercase tracking-[0.3em]">No pending applications</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
