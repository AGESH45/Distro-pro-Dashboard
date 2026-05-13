import { useMemo, useRef, useState } from 'react';
import { Calendar, Camera, Link2, Save, Trash2, X } from 'lucide-react';
import type { Release } from '../lib/api';
import { Card, Chip, Field } from '../components/Components';

function EditableCover({ release, onUpdate }: { release: Release; onUpdate: (payload: Partial<Release> & { id: number }) => Promise<void> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [coverUrl, setCoverUrl] = useState(release.cover_url || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const saveCover = async (nextUrl = coverUrl) => {
    if (!nextUrl || nextUrl.trim().length < 10) {
      setError('Add a valid artwork URL or upload an image.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onUpdate({ id: release.id, cover_url: nextUrl.trim() });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Artwork could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const onImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Artwork upload must be under 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setCoverUrl(dataUrl);
      saveCover(dataUrl);
    };
    reader.onerror = () => setError('Could not read image. Try another file.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      <img src={release.cover_url} className="h-56 w-full object-cover transition group-hover:scale-105" alt={`${release.title} cover`} />
      <div className="absolute inset-x-3 top-3 flex justify-end gap-2">
        <button onClick={() => fileRef.current?.click()} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950/80 text-white backdrop-blur hover:bg-blue-600" title="Upload cover image"><Camera className="h-5 w-5" /></button>
        <button onClick={() => setEditing(true)} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950/80 text-white backdrop-blur hover:bg-red-600" title="Edit cover URL"><Link2 className="h-5 w-5" /></button>
        <input ref={fileRef} type="file" accept="image/*" onChange={(event) => onImage(event.target.files?.[0])} className="hidden" />
      </div>
      {editing && (
        <div className="absolute inset-0 flex items-end bg-slate-950/80 p-3 backdrop-blur-sm">
          <div className="w-full rounded-3xl border border-white/10 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between"><p className="font-black text-white">Edit artwork</p><button onClick={() => { setEditing(false); setCoverUrl(release.cover_url); setError(''); }}><X className="h-4 w-4 text-white/60" /></button></div>
            <Field label="Cover image URL" value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} />
            {error && <p className="mt-2 text-xs font-semibold text-red-200">{error}</p>}
            <button onClick={() => saveCover()} disabled={saving} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save artwork'}</button>
          </div>
        </div>
      )}
      {!editing && error && <p className="absolute bottom-3 left-3 right-3 rounded-2xl bg-red-950/90 p-3 text-xs font-semibold text-red-100">{error}</p>}
    </div>
  );
}

export function Catalog({
  releases,
  searchQuery,
  onDelete,
  onUpdate,
  setPage,
}: {
  releases: Release[];
  searchQuery: string;
  onDelete: (id: number) => void;
  onUpdate: (payload: Partial<Release> & { id: number }) => Promise<void>;
  setPage: (page: string) => void;
}) {
  const query = searchQuery.trim().toLowerCase();
  const filteredReleases = useMemo(() => {
    if (!query) return releases;
    return releases.filter((release) => [release.title, release.artist_name, release.genre, release.status, release.upc, release.release_type].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [query, releases]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-white">Structured catalog management</p>
          <p className="text-sm text-white/60">Edit any release artwork by uploading a picture or adding an image URL. Search filters this catalog instantly.</p>
          {query && <p className="mt-2 text-xs font-bold text-blue-200">Showing {filteredReleases.length} result{filteredReleases.length === 1 ? '' : 's'} for “{searchQuery}”</p>}
        </div>
        <button onClick={() => setPage('create')} className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white">New release</button>
      </div>
      {filteredReleases.length === 0 ? (
        <Card><p className="text-white/65">No releases match your search. Try artist name, genre, status, UPC, or title.</p></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredReleases.map((release) => (
            <Card key={release.id} className="group overflow-hidden p-0">
              <EditableCover release={release} onUpdate={onUpdate} />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="text-xl font-black text-white">{release.title}</h3><p className="text-sm text-white/55">{release.artist_name} · {release.genre}</p></div><Chip tone={release.status === 'Live' ? 'green' : release.status === 'In Review' ? 'blue' : 'red'}>{release.status}</Chip></div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/55"><Calendar className="h-4 w-4" /> {new Date(release.release_date).toLocaleDateString()} · {release.tracks} tracks · {release.release_type}</div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3"><span className="truncate text-xs text-white/45">UPC {release.upc}</span><button onClick={() => onDelete(release.id)} className="shrink-0 text-red-200 hover:text-red-100" title="Delete release"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
