import { useState, useEffect } from 'react';
import { Card, Spinner } from '../../components/Components';
import { Users, Shield, ShieldAlert, MoreVertical, UserPlus } from 'lucide-react';
import { AdminHeader, AdminSearch } from '../../components/admin/AdminComponents';

// Local type for users since it's not strictly an API resource yet
type UserWithRole = {
  id: string;
  email: string;
  artist_name: string;
  role: 'admin' | 'artist';
  created_at: string;
};

export function AdminUsers({ notify }: { notify: (msg: string) => void }) {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/admin-users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (e) {
        console.error('Failed to load users', e);
        notify('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const changeRole = async (userId: string, newRole: 'admin' | 'artist') => {
    setProcessing(userId);
    try {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-role', userId, role: newRole })
      });
      if (!res.ok) throw new Error('Failed to update role');
      notify(`User successfully updated to ${newRole.toUpperCase()}`);
    } catch (err) {
      notify('Failed to update user role');
    } finally {
      setProcessing(null);
    }
  };

  const promoteToAdmin = async () => {
    if (!newAdminEmail) return;
    setProcessing('promote');
    try {
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'promote', email: newAdminEmail.trim() })
      });
      if (!res.ok) throw new Error('Failed to promote user');
      notify('User promoted to admin');
      const freshRes = await fetch('/api/admin-users');
      const freshData = await freshRes.json();
      setUsers(freshData);
    } catch (e) {
      console.error(e);
      notify('Failed to promote user');
    } finally {
      setProcessing(null);
      setNewAdminEmail('');
    }
  };

  const deleteUserHandler = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin-users?userId=${userId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(prev => prev.filter(u => u.id !== userId));
      notify('User deleted successfully');
    } catch (err) {
      notify('Failed to delete user');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.artist_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminHeader title="User Management" icon={Users}>
        <AdminSearch value={search} onChange={setSearch} onSearch={() => setSearch(search)} />
      </AdminHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden border-white/5 bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">
                  <tr>
                    <th className="px-6 py-5">Artist Identity</th>
                    <th className="px-6 py-5">Email Address</th>
                    <th className="px-6 py-5 text-right">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(u => (
                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all ${
                            u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/30 group-hover:bg-white/10'
                          }`}>
                            {u.role === 'admin' ? <ShieldAlert className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-black text-white">{u.artist_name || 'Unnamed Artist'}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">Joined {u.created_at}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-white/50 font-medium">{u.email}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => changeRole(u.id, u.role === 'admin' ? 'artist' : 'admin')}
                            disabled={processing === u.id}
                            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                              u.role === 'admin' 
                                ? 'bg-white/5 text-white/50 hover:bg-white/10' 
                                : 'bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white'
                            }`}
                          >
                            {u.role === 'admin' ? 'Revoke' : 'Make Admin'}
                          </button>
                          <button 
                            onClick={() => deleteUserHandler(u.id)}
                            disabled={processing === u.id}
                            className="rounded-xl p-2 text-white/20 hover:bg-red-600/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center">
                        <p className="text-white/20 font-black uppercase tracking-[0.3em]">No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-red-500/20 bg-red-600/[0.02] relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-600/10 blur-3xl" />
            <div className="mb-6 flex items-center gap-3 relative z-10">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/20 text-red-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-white">Elevate Permissions</h3>
                <p className="text-[10px] uppercase tracking-widest text-white/30">Grant administrative access</p>
              </div>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Account Email</label>
                <input 
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@therealmusicdistro.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none focus:border-red-500/50 transition-all"
                />
              </div>
              <button 
                onClick={promoteToAdmin}
                disabled={processing === 'promote' || !newAdminEmail}
                className="w-full rounded-2xl bg-red-600 px-6 py-4 font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-red-950/40 hover:bg-red-500 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Promote to Admin
              </button>
            </div>
          </Card>

          <Card className="bg-white/[0.02] border-white/5">
            <div className="flex gap-4">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Security Warning</h4>
                <p className="mt-2 text-xs leading-relaxed text-white/40">
                  Administrative users have full read/write access to royalties, releases, and user data. Only promote trusted accounts.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
