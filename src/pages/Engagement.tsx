import { useState } from 'react';
import type { AnalyticsRow, Release } from '../lib/api';
import { useCountUpDecimal } from '../lib/useCountUp';
import { Card } from '../components/Components';
import { Calendar } from 'lucide-react';

export function Engagement({ analytics, releases }: { analytics: AnalyticsRow[]; releases: Release[] }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [showAllReleases, setShowAllReleases] = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);

  // Animated skip rates — Top Releases
  const animR1 = useCountUpDecimal(3.33);
  const animR2 = useCountUpDecimal(5);
  const animR3 = useCountUpDecimal(20);
  const animR4 = useCountUpDecimal(25);
  const animR5 = useCountUpDecimal(25.8);
  // Top Artists
  const animA1 = useCountUpDecimal(3.33);
  const animA2 = useCountUpDecimal(5);
  const animA3 = useCountUpDecimal(25.8);
  const animA4 = useCountUpDecimal(30);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Consumption & Engagement</h1>
          <p className="mt-1 text-sm text-white/55">Track track skip rates and artist engagement.</p>
        </div>
        
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">
            Last 30 days <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Card className="min-h-[160px] p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Timeline</h2>
        </div>
        <div className="flex justify-between text-[10px] text-white/40 font-medium mt-16">
          <span>10 Mar</span>
          <span>16 Mar</span>
          <span>22 Mar</span>
          <span>28 Mar</span>
          <span>3 Apr</span>
          <span>8 Apr</span>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Top Tracks</h2>
              <p className="text-sm text-white/50">Skip Rate · Last 30 days</p>
            </div>
          </div>

          <div className="flex justify-center py-6">
            <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90">
              {/* Pie segments (Mocked to look like the image) */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4ade80" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fb7185" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="12" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fde047" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="100" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fb923c" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="160" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#818cf8" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="220" />
            </svg>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-white mb-2 mt-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#818cf8]"></span>I...</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4ade80]"></span>Wish ...</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#fb7185]"></span>Ghet...</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#fde047]"></span>Hold ...</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#fb923c]"></span>Mon...</span>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Top Releases</h2>
              <p className="text-sm text-white/50">Skip Rate · Last 30 days</p>
            </div>
            <button onClick={() => setShowAllReleases(!showAllReleases)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition">{showAllReleases ? 'Less' : 'More'}</button>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 text-xs font-bold text-white/40 mb-4 px-2">
            <div>Release</div>
            <div className="text-right w-16">Skip Rate</div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#222] overflow-hidden"><img src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=150&q=80" alt="cover" className="w-full h-full object-cover" /></div>
                <span className="font-bold text-white text-sm truncate">Wish Me Well</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animR1.toFixed(2)}%</div>
            </div>
            
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#222] overflow-hidden"><img src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=150&q=80" alt="cover" className="w-full h-full object-cover" /></div>
                <span className="font-bold text-white text-sm truncate">NHV (No Harsh Vibe)</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animR2.toFixed(0)}%</div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#222] overflow-hidden"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80" alt="cover" className="w-full h-full object-cover" /></div>
                <span className="font-bold text-white text-sm truncate">Hold Me Down</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animR3.toFixed(0)}%</div>
            </div>
            {showAllReleases && (
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#222] overflow-hidden"><img src="https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=150&q=80" alt="cover" className="w-full h-full object-cover" /></div>
                <span className="font-bold text-white text-sm truncate">Tonight</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animR4.toFixed(0)}%</div>
            </div>
            )}
            
            {showAllReleases && (
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#222] overflow-hidden"><img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&q=80" alt="cover" className="w-full h-full object-cover" /></div>
                <span className="font-bold text-white text-sm truncate">Hotboi Intuition (Trap Boy...</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animR5.toFixed(1)}...</div>
            </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Top Artists</h2>
              <p className="text-sm text-white/50">Skip Rate · Last 30 days</p>
            </div>
            <button onClick={() => setShowAllArtists(!showAllArtists)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition">{showAllArtists ? 'Less' : 'More'}</button>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 text-xs font-bold text-white/40 mb-4 px-2">
            <div>Artist</div>
            <div className="text-right w-16">Skip Rate</div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"></div>
                <span className="font-bold text-white text-sm truncate">Henson Fire</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animA1.toFixed(2)}%</div>
            </div>
            
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-red-500"></div>
                <span className="font-bold text-white text-sm truncate">Drakerz</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animA2.toFixed(0)}%</div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600"></div>
                <span className="font-bold text-white text-sm truncate">HotboiAkb</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animA3.toFixed(1)}...</div>
            </div>

            {showAllArtists && (
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-green-400 to-yellow-500"></div>
                <span className="font-bold text-white text-sm truncate">Yungfellafire</span>
              </div>
              <div className="text-right w-16 font-bold text-white tabular-nums">{animA4.toFixed(0)}%</div>
            </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
