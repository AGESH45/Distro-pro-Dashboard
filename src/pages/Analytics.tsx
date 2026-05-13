import type { AnalyticsRow, Release } from '../lib/api';
import { BarRow, Card, StatCard } from '../components/Components';

export function Analytics({ analytics, releases }: { analytics: AnalyticsRow[]; releases: Release[] }) {
  const streams = analytics.reduce((s, r) => s + r.streams, 0);
  const royalties = analytics.reduce((s, r) => s + Number(r.royalties), 0);
  const listeners = analytics.reduce((s, r) => s + r.listeners, 0);
  const saves = analytics.reduce((s, r) => s + r.saves, 0);
  const byCountry = Object.values(analytics.reduce<Record<string, { label: string; streams: number; royalties: number }>>((acc, row) => {
    acc[row.country] = acc[row.country] || { label: row.country, streams: 0, royalties: 0 };
    acc[row.country].streams += row.streams;
    acc[row.country].royalties += Number(row.royalties);
    return acc;
  }, {})).sort((a, b) => b.streams - a.streams);
  const max = Math.max(...byCountry.map((c) => c.streams), 1);
  const releaseMap = Object.fromEntries(releases.map((r) => [r.id, r.title]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Streams" value={streams} />
        <StatCard label="Royalties" value={royalties} prefix="$" accent="red" />
        <StatCard label="Listeners" value={listeners} />
        <StatCard label="Saves" value={saves} accent="red" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><h2 className="mb-5 text-xl font-black text-white">Top markets</h2><div className="space-y-5">{byCountry.map((c) => <BarRow key={c.label} label={c.label} value={c.streams} max={max} amount={`${c.streams.toLocaleString()} streams · $${c.royalties.toFixed(2)}`} />)}</div></Card>
        <Card><h2 className="mb-5 text-xl font-black text-white">Release performance</h2><div className="overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/[0.06] text-white/50"><tr><th className="p-3">Release</th><th>Platform</th><th>Streams</th><th>Royalty</th></tr></thead><tbody>{analytics.map((row) => <tr key={row.id} className="border-t border-white/10 text-white/78"><td className="p-3 font-semibold">{releaseMap[row.release_id]}</td><td>{row.platform}</td><td>{row.streams.toLocaleString()}</td><td>${Number(row.royalties).toFixed(2)}</td></tr>)}</tbody></table></div></Card>
      </div>
    </div>
  );
}
