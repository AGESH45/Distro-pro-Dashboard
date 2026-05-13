import { useEffect, useRef, useState } from 'react';
import { Camera, KeyRound, LogOut, Save } from 'lucide-react';
import { Card, Field } from '../components/Components';
import type { Profile as ProfileType } from '../lib/api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Profile({
  profile,
  onUpdate,
  onLogout,
  onChangePassword,
}: {
  profile: ProfileType | null;
  onUpdate: (payload: Partial<ProfileType>) => Promise<void>;
  onLogout: () => void;
  onChangePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ id: 1, artist_name: '', email: '', avatar_url: '', bio: '', location: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        id: profile.id || 1,
        artist_name: profile.artist_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        location: profile.location || '',
      });
    }
  }, [profile]);
  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose a valid image file.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setProfileError('Profile picture must be under 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatar_url: String(reader.result) }));
    reader.onerror = () => setProfileError('Could not read image. Try another file.');
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (form.artist_name.trim().length < 2) {
      setProfileError('Artist name must be at least 2 characters.');
      return;
    }
    if (!emailRegex.test(form.email)) {
      setProfileError('Enter a valid email address.');
      return;
    }
    setProfileError('');
    setSaving(true);
    try {
      await onUpdate(form);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.currentPassword.length < 6) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (password.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password.newPassword) || !/[0-9]/.test(password.newPassword)) {
      setPasswordError('New password must include an uppercase letter and a number.');
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      setPasswordError('New password and confirmation must match.');
      return;
    }
    setPasswordError('');
    setPasswordSaving(true);
    try {
      await onChangePassword(password);
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Password could not be changed.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-28 w-28 shrink-0">
            <img src={form.avatar_url} className="h-28 w-28 rounded-3xl object-cover ring-4 ring-white/10" alt="Profile preview" />
            <button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -right-2 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-red-600 text-white shadow-xl" aria-label="Upload profile picture"><Camera className="h-5 w-5" /></button>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} className="hidden" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Edit profile</h2>
            <p className="mt-1 text-white/55">Upload a profile picture, update artist details, and save changes.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Field label="Artist name" value={form.artist_name} onChange={(e) => update('artist_name', e.target.value)} />
          <Field label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          <Field label="Location" value={form.location} onChange={(e) => update('location', e.target.value)} />
          <Field label="Avatar URL or uploaded image" value={form.avatar_url} onChange={(e) => update('avatar_url', e.target.value)} />
        </div>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold text-white/75">Bio</span><textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} rows={5} maxLength={500} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-blue-400" /></label>
        <div className="mt-2 text-right text-xs text-white/40">{form.bio.length}/500</div>
        {profileError && <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm font-semibold text-red-100">{profileError}</p>}
        <div className="mt-6 flex flex-wrap gap-3"><button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save profile'}</button><button onClick={onLogout} className="flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white"><LogOut className="h-4 w-4" /> Logout</button></div>
      </Card>
      <Card>
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><KeyRound className="h-6 w-6 text-blue-200" /></div><div><h2 className="text-xl font-black text-white">Change password</h2><p className="text-sm text-white/50">Use 8+ characters with a number and uppercase letter.</p></div></div>
        <form onSubmit={changePassword} className="mt-6 space-y-4">
          <Field label="Current password" type="password" value={password.currentPassword} onChange={(e) => setPassword((p) => ({ ...p, currentPassword: e.target.value }))} />
          <Field label="New password" type="password" value={password.newPassword} onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))} />
          <Field label="Confirm new password" type="password" value={password.confirmPassword} onChange={(e) => setPassword((p) => ({ ...p, confirmPassword: e.target.value }))} />
          {passwordError && <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm font-semibold text-red-100">{passwordError}</p>}
          <button disabled={passwordSaving} className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-4 font-black text-white disabled:opacity-60">{passwordSaving ? 'Updating...' : 'Update password'}</button>
        </form>
      </Card>
    </div>
  );
}
