import { useState } from 'react';
import { Calendar, DollarSign, Download, Play, BarChart3 } from 'lucide-react';
import { Card, StatCard } from '../components/Components';
import type { AnalyticsRow, Release } from '../lib/api';
import { useCountUpDecimal } from '../lib/useCountUp';

export function Revenue({ analytics, releases }: { analytics: AnalyticsRow[]; releases: Release[] }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 3 months');
  const [showAllTracks, setShowAllTracks] = useState(false);

  const releaseMap = Object.fromEntries(releases.map((r) => [r.id, { title: r.title, artist: r.artist_name }]));
  const animMock1 = useCountUpDecimal(0.09);
  const animMock2 = useCountUpDecimal(0.06);
  const totalRoyalties = analytics.reduce((s, r) => s + Number(r.royalties || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Revenue</h1>
          <p className="mt-1 text-sm text-white/55">Track your earnings and percentage shares.</p>
        </div>
        
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">
            {timeRange} <Calendar className="h-4 w-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-[320px] rounded-3xl bg-[#1a1a1a] p-4 shadow-2xl border border-white/5 z-20">
              <div className="space-y-4">
                <button onClick={() => { setTimeRange('Last 3 months'); setDropdownOpen(false); }} className={`flex w-full justify-between text-sm ${timeRange === 'Last 3 months' ? 'font-bold text-white' : 'font-medium text-white/70'}`}>
                  <span>Last 3 months</span> <span className="text-white/40">Dec 2025 — Feb 2026</span>
                </button>
                <button onClick={() => { setTimeRange('Last 6 months'); setDropdownOpen(false); }} className={`flex w-full justify-between text-sm ${timeRange === 'Last 6 months' ? 'font-bold text-white' : 'font-medium text-white/70'}`}>
                  <span>Last 6 months</span> <span className="text-white/40">Sep 2025 — Feb 2026</span>
                </button>
                <button onClick={() => { setTimeRange('Last 12 months'); setDropdownOpen(false); }} className={`flex w-full justify-between text-sm ${timeRange === 'Last 12 months' ? 'font-bold text-white' : 'font-medium text-white/70'}`}>
                  <span>Last 12 months</span> <span className="text-white/40">Mar 2025 — Feb 2026</span>
                </button>
                <button onClick={() => { setTimeRange('Last 24 months'); setDropdownOpen(false); }} className={`flex w-full justify-between text-sm ${timeRange === 'Last 24 months' ? 'font-bold text-white' : 'font-medium text-white/70'}`}>
                  <span>Last 24 months</span> <span className="text-white/40">Mar 2024 — Feb 2026</span>
                </button>
                <button onClick={() => { setTimeRange('Year to Date'); setDropdownOpen(false); }} className={`flex w-full justify-between text-sm ${timeRange === 'Year to Date' ? 'font-bold text-white' : 'font-medium text-white/70'}`}>
                  <span>Year to Date</span> <span className="text-white/40">Jan 2026 — Feb 2026</span>
                </button>
              </div>
              <button onClick={() => setDropdownOpen(false)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 py-3 text-sm font-bold text-white">
                <Calendar className="h-4 w-4" /> Custom Range
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Revenue" value={totalRoyalties} prefix="£" accent="red" />
        <StatCard label="Downloads" value={0} />
        <StatCard label="Top Track Revenue" value={animMock1} prefix="£" accent="blue" />
      </div>

      <Card className="min-h-[250px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Revenue over time</h2>
        </div>
        <div className="relative flex h-[200px] flex-col justify-between">
          <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-medium text-white/30 z-10 w-8">
            <span>£08</span>
            <span>£06</span>
            <span>£04</span>
            <span>£02</span>
            <span>£00</span>
          </div>
          <div className="absolute inset-0 pl-10 pr-4 pt-4 pb-8 overflow-hidden pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0 100 L 40 20 L 100 20" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="absolute bottom-0 inset-x-0 flex justify-center text-[10px] font-medium text-white/40">
            <div className="flex flex-col items-center">
              <div className="mb-1 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              1 Jan
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">Top Tracks</h2>
            <p className="text-sm text-white/50">Revenue · Year to Date</p>
          </div>
          <button onClick={() => setShowAllTracks(!showAllTracks)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition">{showAllTracks ? 'Show Less' : 'View More'}</button>
        </div>

          <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-xs font-bold text-white/40 mb-4 px-2">
            <div>Track</div>
            <div className="text-right w-16">Revenue</div>
            <div className="text-right w-16">% Share</div>
          </div>

          <div className="space-y-4">
            {/* Mock Data based on Screenshot 5 */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-bold text-white text-sm truncate">Tonight</span>
                <span className="font-medium text-white/50 text-xs truncate">HotboiAkb</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">£{animMock1.toFixed(2)}</div>
              <div className="text-right w-16 font-bold text-white/60">23.69%</div>
            </div>
            
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-bold text-white text-sm truncate">Heaven On E...</span>
                <span className="font-medium text-white/50 text-xs truncate">Hotboi...</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">£{animMock2.toFixed(2)}</div>
              <div className="text-right w-16 font-bold text-white/60">15.28%</div>
            </div>

            {/* Actual dynamic data as fallback */}
            {analytics.filter(a => Number(a.royalties) > 0).slice(0, showAllTracks ? undefined : 3).map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-bold text-white text-sm truncate">{releaseMap[row.release_id]?.title || 'Unknown'}</span>
                  <span className="font-medium text-white/50 text-xs truncate">{releaseMap[row.release_id]?.artist || 'Unknown'}</span>
                </div>
                <div className="text-right w-16 font-bold text-white">£{Number(row.royalties || 0).toFixed(2)}</div>
                <div className="text-right w-16 font-bold text-white/60">{((Number(row.royalties || 0) / (analytics.reduce((s, r) => s + Number(r.royalties || 0), 0) || 1)) * 100).toFixed(2)}%</div>
              </div>
            ))}
          </div>
      </Card>
    </div>
  );
}
