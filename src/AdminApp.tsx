import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Card, Toast } from './components/Components';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminTopbar } from './components/admin/AdminTopbar';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminReleases } from './pages/admin/AdminReleases';
import { AdminRoyalties } from './pages/admin/AdminRoyalties';
import { AdminMarketplace } from './pages/admin/AdminMarketplace';
import { AdminUsers } from './pages/admin/AdminUsers';

export function AdminApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [page, setPage] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const renderPage = () => {
    if (page === 'releases') return <AdminReleases notify={notify} />;
    if (page === 'royalties') return <AdminRoyalties notify={notify} />;
    if (page === 'marketplace') return <AdminMarketplace notify={notify} />;
    if (page === 'users') return <AdminUsers notify={notify} />;
    return <AdminOverview notify={notify} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(180,83,9,.25),transparent_28%),radial-gradient(circle_at_90%_5%,rgba(220,38,38,.22),transparent_30%),linear-gradient(135deg,#020617,#1f1111_55%,#111827)]" />
      <AdminSidebar page={page} setPage={(p) => { setPage(p); setMobileMenuOpen(false); }} onLogout={onLogout} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="relative lg:pl-72">
        <AdminTopbar
          page={page}
          setPage={setPage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          user={user}
        />
        <main className="px-4 py-6 pb-28 lg:px-8 lg:pb-10">{renderPage()}</main>
      </div>
      <Toast message={toast} />
    </div>
  );
}
