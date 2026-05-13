import { BarChart3, Disc3, DollarSign, Megaphone } from 'lucide-react';
import type { AnalyticsRow, Pitch, Release, Transaction } from '../lib/api';
import { BarRow, Card, Chip, StatCard } from '../components/Components';

export function Home({ releases, analytics, transactions, pitches, setPage }: { releases: Release[]; analytics: AnalyticsRow[]; transactions: Transaction[]; pitches: Pitch[]; setPage: (page: string) => void }) {
  const streams = analytics.reduce((sum, row) => sum + (row.streams || 0), 0);
  const royalties = analytics.reduce((sum, row) => sum + Number(row.royalties || 0), 0);
  const paid = transactions.filter((t) => t.status === 'Paid').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const topPlatforms = Object.values(analytics.reduce<Record<string, { label: string; streams: number }>>((acc, row) => {
    acc[row.platform] = acc[row.platform] || { label: row.platform, streams: 0 };
    acc[row.platform].streams += (row.streams || 0);
    return acc;
  }, {})).sort((a, b) => b.streams - a.streams);
  const max = Math.max(...topPlatforms.map((p) => p.streams), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total streams" value={streams} />
        <StatCard label="Estimated royalties" value={royalties} prefix="$" accent="red" />
        <StatCard label="Paid out" value={paid} prefix="$" />
        <StatCard label="Live releases" value={releases.length} accent="red" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="min-h-[360px]">
          <div className="flex items-center justify-between">
            <div><h2 className="text-xl font-black text-white">Distribution command center</h2><p className="text-sm text-white/50">Start releases, review pitches, and monitor revenue.</p></div>
            <Chip tone="red">Live data</Chip>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <button onClick={() => setPage('create')} className="rounded-3xl bg-blue-600/20 p-5 text-left hover:bg-blue-600/30"><Disc3 className="mb-5 h-8 w-8 text-blue-200" /><b className="text-white">Distribute a song</b><p className="mt-2 text-sm text-white/55">Upload metadata, stores, and release date.</p></button>
            <button onClick={() => setPage('analytics')} className="rounded-3xl bg-red-600/20 p-5 text-left hover:bg-red-600/30"><BarChart3 className="mb-5 h-8 w-8 text-red-200" /><b className="text-white">Analyze royalties</b><p className="mt-2 text-sm text-white/55">Streams, saves, markets, and earnings.</p></button>
            <button onClick={() => setPage('pitch')} className="rounded-3xl bg-white/10 p-5 text-left hover:bg-white/15"><Megaphone className="mb-5 h-8 w-8 text-white" /><b className="text-white">Pitch to our team</b><p className="mt-2 text-sm text-white/55">Send context for editorial or campaign support.</p></button>
          </div>
          <div className="mt-8 space-y-4">
            {topPlatforms.map((p) => <BarRow key={p.label} label={p.label} value={p.streams} max={max} />)}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black text-white">Recent activity</h2>
          <div className="mt-5 space-y-4">
            {transactions.slice(0, 3).map((t) => <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-red-600"><DollarSign className="h-5 w-5 text-white" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{t.description}</p><p className="text-xs text-white/45">{t.status} · {t.method}</p></div><span className="font-black text-white">${Number(t.amount).toFixed(2)}</span></div>)}
            {pitches.slice(0, 2).map((p) => <div key={p.id} className="rounded-2xl border border-white/10 p-3"><p className="text-sm font-bold text-white">Pitch: {p.release_title}</p><p className="text-xs text-white/45">{p.status} · {p.pitch_goal}</p></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
