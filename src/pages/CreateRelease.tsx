import { useMemo, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, Disc3, ImagePlus, Music2, ShieldCheck, Store, UploadCloud, X } from 'lucide-react';
import { Field, Card, Chip } from '../components/Components';
import type { Release } from '../lib/api';

type ReleaseForm = {
  title: string;
  artist_name: string;
  release_type: string;
  genre: string;
  release_date: string;
  tracks: number;
  cover_url: string;
  label: string;
  copyright: string;
  language: string;
  explicit: string;
  stores: string[];
  notes: string;
};

const defaultCover = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80';
const storeOptions = ['Spotify', 'Apple Music', 'YouTube Music', 'TikTok Music', 'Audiomack', 'Deezer', 'Amazon Music', 'Tidal'];
const steps = [
  { id: 1, title: 'Release details', icon: Disc3 },
  { id: 2, title: 'Artwork upload', icon: ImagePlus },
  { id: 3, title: 'Stores & rights', icon: Store },
  { id: 4, title: 'Review', icon: ShieldCheck },
];

const initialForm: ReleaseForm = {
  title: '',
  artist_name: 'Nova Rae',
  release_type: 'Single',
  genre: 'Afrobeats',
  release_date: '',
  tracks: 1,
  cover_url: defaultCover,
  label: 'Independent',
  copyright: '',
  language: 'English',
  explicit: 'No',
  stores: ['Spotify', 'Apple Music', 'YouTube Music', 'TikTok Music'],
  notes: '',
};

function validateImageFile(file: File) {
  if (!file.type.startsWith('image/')) return 'Please upload a valid image file.';
  if (file.size > 1024 * 1024) return 'Artwork must be under 1MB for this dashboard preview.';
  return '';
}

export function CreateRelease({ onCreate }: { onCreate: (payload: Partial<Release>) => Promise<void> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ReleaseForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  const update = (key: keyof ReleaseForm, value: string | number | string[]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const requirements = useMemo(() => [
    { label: '3000 x 3000 recommended', done: Boolean(form.cover_url) },
    { label: 'JPG, PNG or WebP artwork', done: Boolean(form.cover_url) },
    { label: 'No blurred or stretched cover', done: Boolean(form.cover_url) },
    { label: 'No unauthorized logos', done: true },
  ], [form.cover_url]);

  const handleImage = (file?: File) => {
    if (!file) return;
    const message = validateImageFile(file);
    if (message) {
      setErrors((current) => ({ ...current, cover_url: message }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('cover_url', String(reader.result));
    reader.onerror = () => setErrors((current) => ({ ...current, cover_url: 'Could not read this image. Please try another file.' }));
    reader.readAsDataURL(file);
  };

  const validateStep = (targetStep = step) => {
    const nextErrors: Record<string, string> = {};
    if (targetStep === 1) {
      if (form.title.trim().length < 2) nextErrors.title = 'Release title is required.';
      if (form.artist_name.trim().length < 2) nextErrors.artist_name = 'Artist name is required.';
      if (!form.genre.trim()) nextErrors.genre = 'Genre is required.';
      if (!form.release_date) nextErrors.release_date = 'Release date is required.';
      if (!Number.isFinite(Number(form.tracks)) || Number(form.tracks) < 1) nextErrors.tracks = 'Track count must be at least 1.';
    }
    if (targetStep === 2) {
      if (!form.cover_url || form.cover_url.trim().length < 10) nextErrors.cover_url = 'Please upload artwork or paste an image URL.';
    }
    if (targetStep === 3) {
      if (form.stores.length === 0) nextErrors.stores = 'Select at least one store.';
      if (!form.label.trim()) nextErrors.label = 'Label name is required. Use Independent if unsigned.';
      if (!form.copyright.trim()) nextErrors.copyright = 'Copyright owner is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(4, current + 1));
  };

  const submit = async () => {
    const allValid = [1, 2, 3].every((item) => validateStep(item));
    if (!allValid) {
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      await onCreate({
        title: form.title.trim(),
        artist_name: form.artist_name.trim(),
        release_type: form.release_type,
        genre: form.genre.trim(),
        release_date: form.release_date,
        tracks: Number(form.tracks),
        cover_url: form.cover_url,
      });
      setStep(1);
      setForm({ ...initialForm, artist_name: form.artist_name, genre: form.genre, label: form.label });
    } finally {
      setSaving(false);
    }
  };

  const toggleStore = (store: string) => {
    const exists = form.stores.includes(store);
    update('stores', exists ? form.stores.filter((item) => item !== store) : [...form.stores, store]);
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-[320px] bg-slate-900 p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.35),transparent_28%),radial-gradient(circle_at_80%_60%,rgba(220,38,38,.28),transparent_30%)]" />
            <div className="relative">
              <Chip tone="red">Professional release delivery</Chip>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Create a new release</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/62 sm:text-base">A structured release wizard with required metadata, uploadable cover art, store selection, rights confirmation, validation, and review before submission.</p>
              <div className="mt-8 space-y-3">
                {steps.map((item) => {
                  const Icon = item.icon;
                  const active = step === item.id;
                  const complete = step > item.id;
                  return (
                    <button key={item.id} onClick={() => item.id < step && setStep(item.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-blue-400 bg-blue-500/15' : complete ? 'border-emerald-400/25 bg-emerald-500/10' : 'border-white/10 bg-white/[0.04]'}`}>
                      <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-blue-600' : complete ? 'bg-emerald-600' : 'bg-white/10'}`}>{complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}</span>
                      <span><span className="block font-black text-white">Step {item.id}</span><span className="text-sm text-white/55">{item.title}</span></span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-200">Step {step} of 4</p>
                <h3 className="mt-1 text-2xl font-black text-white">{steps[step - 1].title}</h3>
              </div>
              <div className="flex gap-2">{steps.map((item) => <span key={item.id} className={`h-2 w-10 rounded-full ${step >= item.id ? 'bg-gradient-to-r from-blue-500 to-red-500' : 'bg-white/10'}`} />)}</div>
            </div>

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Release title" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Song, EP, or album title" />
                  <Field label="Primary artist" value={form.artist_name} onChange={(e) => update('artist_name', e.target.value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block"><span className="mb-2 block text-sm font-semibold text-white/75">Release type</span><select value={form.release_type} onChange={(e) => update('release_type', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-blue-400"><option>Single</option><option>EP</option><option>Album</option></select></label>
                  <Field label="Genre" value={form.genre} onChange={(e) => update('genre', e.target.value)} placeholder="Afrobeats, Pop, Hip-Hop" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Release date" type="date" value={form.release_date} onChange={(e) => update('release_date', e.target.value)} />
                  <Field label="Track count" type="number" min={1} value={form.tracks} onChange={(e) => update('tracks', Number(e.target.value))} />
                </div>
                <div className="grid gap-2 text-sm text-red-100">{Object.entries(errors).map(([key, value]) => value && <p key={key} className="rounded-2xl bg-red-500/10 p-3">{value}</p>)}</div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-6 lg:grid-cols-[.85fr_1fr]">
                <div>
                  <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/25">
                    <img src={form.cover_url} className="aspect-square w-full object-cover" alt="Release artwork preview" />
                  </div>
                  <p className="mt-3 text-xs text-white/45">This picture will be used in catalog, stores, and dashboard analytics.</p>
                </div>
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); handleImage(e.dataTransfer.files?.[0]); }}
                    className={`rounded-[2rem] border border-dashed p-6 text-center transition ${dragActive ? 'border-blue-300 bg-blue-500/15' : 'border-white/15 bg-white/[0.04]'}`}
                  >
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 to-red-600"><UploadCloud className="h-8 w-8 text-white" /></div>
                    <h4 className="mt-4 font-black text-white">Upload release picture</h4>
                    <p className="mt-2 text-sm text-white/55">Drag and drop artwork here, or choose an image from your device.</p>
                    <button type="button" onClick={() => fileRef.current?.click()} className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white">Choose picture</button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0])} className="hidden" />
                  </div>
                  <Field label="Or paste artwork image URL" value={form.cover_url} onChange={(e) => update('cover_url', e.target.value)} />
                  <div className="grid gap-2">
                    {requirements.map((item) => <div key={item.label} className="flex items-center gap-2 text-sm text-white/65"><CheckCircle2 className={`h-4 w-4 ${item.done ? 'text-emerald-300' : 'text-white/25'}`} /> {item.label}</div>)}
                  </div>
                  {errors.cover_url && <p className="rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-100">{errors.cover_url}</p>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Label" value={form.label} onChange={(e) => update('label', e.target.value)} />
                  <Field label="Copyright owner" value={form.copyright} onChange={(e) => update('copyright', e.target.value)} placeholder="℗ 2026 Your Name / Company" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Language" value={form.language} onChange={(e) => update('language', e.target.value)} />
                  <label className="block"><span className="mb-2 block text-sm font-semibold text-white/75">Explicit lyrics?</span><select value={form.explicit} onChange={(e) => update('explicit', e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-blue-400"><option>No</option><option>Yes</option><option>Clean version</option></select></label>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold text-white/75">Select stores</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{storeOptions.map((store) => <button key={store} type="button" onClick={() => toggleStore(store)} className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${form.stores.includes(store) ? 'border-blue-400 bg-blue-500/20 text-white' : 'border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/10'}`}>{store}</button>)}</div>
                </div>
                <label className="block"><span className="mb-2 block text-sm font-semibold text-white/75">Delivery notes</span><textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-blue-400" placeholder="Optional instructions for the distribution team" /></label>
                <div className="grid gap-2 text-sm text-red-100">{Object.entries(errors).map(([key, value]) => value && <p key={key} className="rounded-2xl bg-red-500/10 p-3">{value}</p>)}</div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-6 lg:grid-cols-[.75fr_1fr]">
                <img src={form.cover_url} className="aspect-square w-full rounded-[2rem] object-cover" alt="Release artwork final preview" />
                <div className="space-y-4">
                  <div className="rounded-3xl bg-white/[0.05] p-5"><p className="text-sm text-white/45">Release</p><h4 className="mt-1 text-2xl font-black text-white">{form.title || 'Untitled release'}</h4><p className="mt-1 text-white/60">{form.artist_name} · {form.release_type} · {form.genre}</p></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/[0.05] p-4"><CalendarDays className="mb-2 h-5 w-5 text-blue-200" /><p className="text-xs text-white/45">Release date</p><p className="font-bold text-white">{form.release_date || 'Not set'}</p></div>
                    <div className="rounded-2xl bg-white/[0.05] p-4"><Music2 className="mb-2 h-5 w-5 text-red-200" /><p className="text-xs text-white/45">Tracks</p><p className="font-bold text-white">{form.tracks}</p></div>
                  </div>
                  <div className="rounded-2xl bg-white/[0.05] p-4"><p className="text-xs text-white/45">Stores</p><p className="mt-1 text-sm font-semibold text-white">{form.stores.join(', ')}</p></div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mb-2 h-5 w-5" />By submitting, you confirm you own or control the audio, artwork, and release rights.</div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} className="rounded-2xl border border-white/10 px-5 py-3 font-bold text-white/70 hover:bg-white/10">Back</button>
              <div className="flex flex-col gap-3 sm:flex-row">
                {step > 1 && <button type="button" onClick={() => { setStep(1); setForm(initialForm); setErrors({}); }} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 font-bold text-white/70 hover:bg-white/10"><X className="h-4 w-4" /> Reset</button>}
                {step < 4 ? <button type="button" onClick={next} className="rounded-2xl bg-blue-600 px-6 py-3 font-black text-white shadow-lg shadow-blue-950/40">Continue</button> : <button disabled={saving} onClick={submit} className="rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 px-6 py-3 font-black text-white shadow-lg shadow-blue-950/40 disabled:opacity-50">{saving ? 'Submitting release...' : 'Submit release'}</button>}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
