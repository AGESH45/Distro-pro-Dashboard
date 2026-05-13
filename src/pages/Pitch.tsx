import { useState } from 'react';
import { Card, Field } from '../components/Components';
import type { Pitch as PitchType } from '../lib/api';

export function Pitch({ onCreate, pitches }: { onCreate: (payload: Omit<PitchType, 'id' | 'status' | 'created_at'>) => Promise<void>; pitches: PitchType[] }) {
  const [form, setForm] = useState({ artist_name: 'Nova Rae', email: 'nova@example.com', release_title: '', genre: '', pitch_goal: 'Playlist support', story: '', links: '' });
  const [error, setError] = useState('');
  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!form.release_title || !form.story || !form.email.includes('@')) { setError('Please add a valid email, release title, and story.'); return; } setError(''); await onCreate(form); setForm({ ...form, release_title: '', genre: '', story: '', links: '' }); };
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_.75fr]">
      <Card>
        <h2 className="text-2xl font-black text-white">Pitch your release to us</h2>
        <p className="mt-2 text-white/55">Tell our team why this campaign needs editorial, playlist, creator, or marketing support.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2"><Field label="Artist name" value={form.artist_name} onChange={(e) => update('artist_name', e.target.value)} /><Field label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
          <div className="grid gap-4 md:grid-cols-2"><Field label="Release title" value={form.release_title} onChange={(e) => update('release_title', e.target.value)} /><Field label="Genre" value={form.genre} onChange={(e) => update('genre', e.target.value)} /></div>
          <Field label="Pitch goal" value={form.pitch_goal} onChange={(e) => update('pitch_goal', e.target.value)} />
          <label className="block"><span className="mb-2 block text-sm font-semibold text-white/75">Story / campaign angle</span><textarea value={form.story} onChange={(e) => update('story', e.target.value)} rows={6} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-blue-400" /></label>
          <Field label="Links (private stream, EPK, socials)" value={form.links} onChange={(e) => update('links', e.target.value)} />
          {error && <p className="text-sm font-semibold text-red-200">{error}</p>}
          <button className="rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 px-6 py-4 font-black text-white">Submit pitch</button>
        </form>
      </Card>
      <Card><h3 className="text-xl font-black text-white">Pitch queue</h3><div className="mt-5 space-y-3">{pitches.map((p) => <div key={p.id} className="rounded-2xl bg-white/[0.05] p-4"><p className="font-black text-white">{p.release_title}</p><p className="text-sm text-white/50">{p.status} · {p.pitch_goal}</p><p className="mt-2 line-clamp-2 text-sm text-white/65">{p.story}</p></div>)}</div></Card>
    </div>
  );
}
