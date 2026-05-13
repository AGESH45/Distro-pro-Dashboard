import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { api, type AnalyticsRow, type Notification, type Pitch, type Profile, type Release, type Transaction } from './lib/api';
import supabase from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Card, Spinner, Toast } from './components/Components';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { Analytics } from './pages/Analytics';
import { Engagement } from './pages/Engagement';
import { Revenue } from './pages/Revenue';
import { Marketplace } from './pages/Marketplace';
import { Transactions } from './pages/Transactions';
import { CreateRelease } from './pages/CreateRelease';
import { Pitch as PitchPage } from './pages/Pitch';
import { Profile as ProfilePage } from './pages/Profile';

export function ArtistApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [page, setPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [releases, setReleases] = useState<Release[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch each resource individually with fallback to empty data
      const releaseData = await api.releases().catch((e) => { console.error('releases fetch error', e); return []; });
      const analyticsData = await api.analytics().catch((e) => { console.error('analytics fetch error', e); return []; });
      const transactionData = await api.transactions().catch((e) => { console.error('transactions fetch error', e); return []; });
      const pitchData = await api.pitches().catch((e) => { console.error('pitches fetch error', e); return []; });
      const profileData = user ? {
        id: 1,
        artist_name: user.user_metadata?.artist_name || 'Unknown Artist',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        bio: user.user_metadata?.bio || '',
        location: user.user_metadata?.location || ''
      } : null;
      const notificationData = await api.notifications().catch((e) => { console.error('notifications fetch error', e); return []; });

      console.log('Fetched counts:', {
        releases: releaseData.length,
        analytics: analyticsData.length,
        transactions: transactionData.length,
        pitches: pitchData.length,
        profile: profileData ? 1 : 0,
        notifications: notificationData.length,
      });

      setReleases(Array.isArray(releaseData) ? releaseData : []);
      setAnalytics(Array.isArray(analyticsData) ? analyticsData : []);
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
      setPitches(Array.isArray(pitchData) ? pitchData : []);
      setProfile(profileData && typeof profileData === 'object' && !Array.isArray(profileData) ? profileData : {
        id: 1,
        artist_name: 'Unknown Artist',
        email: user?.email || '',
        avatar_url: '',
        bio: '',
        location: ''
      });
      setNotifications(Array.isArray(notificationData) ? notificationData : []);
    } catch (err) {
      console.error('Fetch error:', err);
      notify(err instanceof Error ? err.message : 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const createRelease = async (payload: Partial<Release>) => {
    try {
      await api.createRelease(payload);
      await fetchAll();
      setPage('catalog');
      notify('Release submitted for review');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Release could not be submitted');
    }
  };

  const updateRelease = async (payload: Partial<Release> & { id: number }) => {
    try {
      await api.updateRelease(payload);
      await fetchAll();
      notify('Release artwork updated');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Release could not be updated');
      throw err;
    }
  };

  const deleteRelease = async (id: number) => {
    try {
      await api.deleteRelease(id);
      await fetchAll();
      notify('Release removed');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Release could not be removed');
    }
  };

  const createPitch = async (payload: Omit<Pitch, 'id' | 'status' | 'created_at'>) => {
    try {
      await api.createPitch(payload);
      await fetchAll();
      notify('Pitch sent to the team');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Pitch could not be sent');
    }
  };

  const updateProfile = async (payload: Partial<Profile>) => {
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.auth.updateUser({
      data: {
        artist_name: payload.artist_name,
        avatar_url: payload.avatar_url,
        bio: payload.bio,
        location: payload.location,
      }
    });
    if (error) throw error;
    setProfile(prev => prev ? { ...prev, ...payload } : null);
    notify('Profile updated');
  };

  const requestPayout = async (payload: { amount: number; method: string; note?: string }) => {
    await api.requestPayout(payload);
    await fetchAll();
    notify('Payment request recorded');
  };

  const changePassword = async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const { error } = await supabase.auth.updateUser({ password: payload.newPassword });
    if (error) throw error;
    notify('Password changed successfully');
  };

  const markNotificationRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item));
    } catch (err) {
      console.error('Notification error:', err);
      notify('Could not update notification');
    }
  };





  const renderPage = () => {
    if (loading) return <Spinner />;
    if (page === 'catalog') return <Catalog releases={releases} searchQuery={searchQuery} onDelete={deleteRelease} onUpdate={updateRelease} setPage={setPage} />;
    if (page === 'engagement') return <Engagement analytics={analytics} releases={releases} />;
    if (page === 'analytics') return <Analytics analytics={analytics} releases={releases} />;
    if (page === 'revenue') return <Revenue analytics={analytics} releases={releases} />;
    if (page === 'marketplace') return <Marketplace />;
    if (page === 'transactions') return <Transactions transactions={transactions} onRequestPayout={requestPayout} />;
    if (page === 'create') return <CreateRelease onCreate={createRelease} />;
    if (page === 'pitch') return <PitchPage onCreate={createPitch} pitches={pitches} />;
    if (page === 'profile') return <ProfilePage profile={profile} onUpdate={updateProfile} onChangePassword={async () => notify('Handled by App')} onLogout={onLogout} />;
    return <Home releases={releases} analytics={analytics} transactions={transactions} pitches={pitches} setPage={setPage} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,.25),transparent_28%),radial-gradient(circle_at_90%_5%,rgba(220,38,38,.22),transparent_30%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)]" />
      <Sidebar page={page} setPage={(p) => { setPage(p); setMobileMenuOpen(false); }} onLogout={onLogout} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="relative lg:pl-72">
        <Topbar
          page={page}
          profile={profile}
          setPage={setPage}
          notifications={notifications}
          onReadNotification={markNotificationRead}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          releases={releases}
          pitches={pitches}
          transactions={transactions}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="px-4 py-6 pb-28 lg:px-8 lg:pb-10">{renderPage()}</main>
      </div>
      <Toast message={toast} />
    </div>
  );
}
