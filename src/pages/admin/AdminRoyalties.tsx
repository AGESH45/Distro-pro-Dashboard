import { useState } from 'react';
import { Card, Field } from '../../components/Components';
import { Receipt, Upload, PlusCircle, Wallet } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminComponents';

export function AdminRoyalties({ notify }: { notify: (msg: string) => void }) {
  const [method, setMethod] = useState<'manual' | 'csv'>('manual');
  const [form, setForm] = useState({ artistId: '', releaseId: '', streams: '', revenue: '', platform: 'Spotify' });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.revenue || !form.streams) return notify('Please enter streams and revenue amounts');
    notify(`£${form.revenue} successfully allocated!`);
    setForm({ ...form, streams: '', revenue: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminHeader title="Royalty Allocation" icon={Receipt} />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-white/5 bg-white/[0.02]">
            <div className="mb-8 flex gap-6 border-b border-white/5">
              <button 
                onClick={() => setMethod('manual')} 
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${method === 'manual' ? 'text-red-500 border-b-2 border-red-500' : 'text-white/30 hover:text-white/60'}`}
              >
                Manual Allocation
              </button>
              <button 
                onClick={() => setMethod('csv')} 
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${method === 'csv' ? 'text-red-500 border-b-2 border-red-500' : 'text-white/30 hover:text-white/60'}`}
              >
                CSV Batch Upload
              </button>
            </div>

            {method === 'manual' ? (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Artist ID or Email" value={form.artistId} onChange={e => setForm({...form, artistId: e.target.value})} placeholder="e.g. nova@example.com" />
                  <Field label="Release ISRC (Optional)" value={form.releaseId} onChange={e => setForm({...form, releaseId: e.target.value})} placeholder="GB-XXX-XX-XXXXX" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Net Stream Count" type="number" value={form.streams} onChange={e => setForm({...form, streams: e.target.value})} placeholder="0" />
                  <Field label="Distributable Revenue (£)" type="number" step="0.01" value={form.revenue} onChange={e => setForm({...form, revenue: e.target.value})} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Reporting Platform</span>
                  <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none focus:border-red-500 transition-all">
                    <option>Spotify</option>
                    <option>Apple Music</option>
                    <option>YouTube Content ID</option>
                    <option>TikTok/Resso</option>
                    <option>Amazon Music</option>
                  </select>
                </div>
                <button className="w-full rounded-2xl bg-red-600 px-6 py-5 font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-red-950/40 hover:bg-red-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  <PlusCircle className="h-5 w-5" /> Confirm Allocation
                </button>
              </form>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] group hover:bg-white/[0.03] transition-all hover:border-red-500/20 cursor-pointer">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-red-500/10 mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-tight">Drop Store Report</h3>
                <p className="max-w-xs mx-auto text-sm text-white/30 mb-8 leading-relaxed">Automatic ISRC mapping for Spotify, Apple Music, and Amazon CSV reports.</p>
                <button className="rounded-xl bg-white/5 px-8 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all border border-white/10">Select Local File</button>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-red-500/10 bg-white/[0.02]">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="font-black text-white uppercase tracking-widest text-xs">Payout Queue</h3>
            </div>
            
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="group flex flex-col gap-4 rounded-2xl bg-white/[0.03] p-5 border border-white/5 hover:bg-white/[0.06] transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-white text-base">{i === 1 ? 'Nova Rae' : 'ProdByFlame'}</p>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5 font-bold">Via {i === 1 ? 'Paystack' : 'Bank Transfer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-red-400 leading-none">£{i === 1 ? '450.00' : '1,250.00'}</p>
                      <p className="text-[10px] uppercase tracking-widest text-white/20 mt-2">{i} day ago</p>
                    </div>
                  </div>
                  <button onClick={() => notify('Payout successfully dispatched')} className="w-full rounded-xl bg-emerald-500/10 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20">
                    Approve Payment
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white/[0.02] border-white/5">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Allocation Policy</h4>
            <ul className="space-y-3">
              {[
                'ISRC codes are verified before allocation.',
                'Revenue is net of store commissions.',
                'Manual entries are audited weekly.'
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-[11px] text-white/30 leading-relaxed">
                  <div className="h-1 w-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
