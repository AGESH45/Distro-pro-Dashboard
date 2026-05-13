import { useState, useEffect } from 'react';
import { Card, StatCard, Spinner } from '../../components/Components';
import { Users, Disc3, Receipt, TrendingUp, LayoutDashboard } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminComponents';

export function AdminOverview({ notify }: { notify: (msg: string) => void }) {
  const [stats, setStats] = useState({ artists: 0, releases: 0, pending: 0, revenue: 45200 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const users = await fetch('/api/admin-users').then(res => res.json());
        const releases = await fetch('/api/releases').then(res => res.json());
        
        setStats({
          artists: Array.isArray(users) ? users.length : 0,
          releases: Array.isArray(releases) ? releases.length : 0,
          pending: 1420, // Still hardcoded until payouts API is ready
          revenue: 45200
        });
      } catch (e) {
        console.error('Failed to load dashboard stats', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminHeader title="Dashboard Overview" icon={LayoutDashboard} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Artists" value={stats.artists} accent="red" />
        <StatCard label="Active Releases" value={stats.releases} accent="red" />
        <StatCard label="Pending Payouts" value={stats.pending} prefix="£" accent="red" />
        <StatCard label="Total Royalties" value={stats.revenue} prefix="£" accent="red" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <Card className="relative overflow-hidden border-red-500/10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/5 blur-[100px]" />
          
          <div className="mb-8 flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white">System Activity</h2>
              <p className="text-sm text-white/50">Live updates from the distribution network</p>
            </div>
            <div className="rounded-xl bg-red-500/10 p-2 border border-red-500/20">
              <TrendingUp className="h-5 w-5 text-red-400" />
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="group flex items-center gap-5 rounded-2xl bg-white/[0.03] p-5 border border-white/5 hover:bg-white/[0.06] transition-all hover:border-red-500/20">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 group-hover:bg-red-500/10 transition-colors">
                  {i % 2 === 0 ? <Disc3 className="h-6 w-6 text-red-400/70" /> : <Users className="h-6 w-6 text-red-400/70" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white group-hover:text-red-100 transition-colors">{i % 2 === 0 ? 'New album submission' : 'Verified artist joined'}</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-black mt-1">
                    {i === 1 ? 'just now' : `${i * 2} minutes ago`}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-red-500/10">
            <h2 className="text-xl font-black text-white mb-2">Priority Tasks</h2>
            <p className="text-sm text-white/50 mb-8">Pending administrative actions</p>
            
            <div className="space-y-4">
              <button onClick={() => notify('Payout processor not connected')} className="group w-full text-left flex items-center justify-between rounded-2xl bg-white/5 p-5 hover:bg-red-600 transition-all border border-white/10 hover:border-red-400 shadow-xl active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <Receipt className="h-5 w-5 text-red-400 group-hover:text-white" />
                  <span className="font-black text-white group-hover:text-white">Process Payouts</span>
                </div>
                <span className="rounded-lg bg-red-500/20 px-2 py-1 text-[10px] font-black text-red-400 group-hover:bg-white/20 group-hover:text-white">3 REQS</span>
              </button>

              <button onClick={() => notify('Release portal not connected')} className="group w-full text-left flex items-center justify-between rounded-2xl bg-white/5 p-5 hover:bg-red-600 transition-all border border-white/10 hover:border-red-400 shadow-xl active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <Disc3 className="h-5 w-5 text-red-400 group-hover:text-white" />
                  <span className="font-black text-white group-hover:text-white">Review Releases</span>
                </div>
                <span className="rounded-lg bg-red-500/20 px-2 py-1 text-[10px] font-black text-red-400 group-hover:bg-white/20 group-hover:text-white">8 NEW</span>
              </button>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-orange-700 border-none shadow-red-900/20">
            <h3 className="font-black text-white text-lg">System Health</h3>
            <p className="text-red-100/70 text-xs mt-1 uppercase tracking-widest">Global Status: Operational</p>
            <div className="mt-6 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <div key={i} className="h-6 flex-1 rounded-sm bg-white/20" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
