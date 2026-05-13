import { useState, useEffect } from 'react';
import { Card, Spinner } from '../../components/Components';
import { Disc3, CheckCircle2, XCircle } from 'lucide-react';
import { api, type Release } from '../../lib/api';
import { AdminHeader, AdminSearch } from '../../components/admin/AdminComponents';

export function AdminReleases({ notify }: { notify: (msg: string) => void }) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetches all releases for admin review
    api.releases().then(data => {
      setReleases(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    setReleases(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      // In a real scenario: await api.adminUpdateRelease({ id, status })
      notify(`Release marked as ${status}`);
    } catch (err) {
      notify('Failed to update status');
    }
  };

  const filtered = releases.filter(r => 
    (r.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.artist_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminHeader title="Release Management" icon={Disc3}>
        <AdminSearch value={search} onChange={setSearch} onSearch={() => setSearch(search)} />
      </AdminHeader>

      <Card className="p-0 overflow-hidden border-white/5 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">
              <tr>
                <th className="px-6 py-5">Release Info</th>
                <th className="px-6 py-5">Artist Name</th>
                <th className="px-6 py-5">Format / Date</th>
                <th className="px-6 py-5 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(release => (
                <tr key={release.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {release.cover_url ? (
                        <img src={release.cover_url} alt="" className="h-12 w-12 rounded-xl object-cover shadow-lg shadow-black/40 border border-white/10" />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 group-hover:bg-red-500/10 transition-colors">
                          <Disc3 className="h-6 w-6 text-white/20 group-hover:text-red-400/50" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-white">{release.title}</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">ID: RE-{release.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-white/60">{release.artist_name}</td>
                  <td className="px-6 py-5">
                    <p className="font-medium text-white/50">{release.release_date}</p>
                    <p className="text-[10px] uppercase tracking-widest text-red-400/60 mt-0.5 font-black">{release.release_type}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`mr-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                        release.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        release.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {release.status}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleStatusChange(release.id, 'Approved')} className="p-2 text-emerald-400 hover:bg-emerald-400/20 rounded-xl transition" title="Approve">
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleStatusChange(release.id, 'Rejected')} className="p-2 text-red-400 hover:bg-red-400/20 rounded-xl transition" title="Reject">
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-white/20 font-black uppercase tracking-[0.3em]">No releases pending review</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
