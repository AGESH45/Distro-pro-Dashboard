import supabase from './_supabase.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('artist_profiles').select('*').order('id', { ascending: true }).limit(1).single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      const { id = 1, artist_name, email, avatar_url, bio, location } = req.body;
      if (!artist_name || String(artist_name).trim().length < 2) return res.status(400).json({ error: 'Artist name must be at least 2 characters' });
      if (!emailRegex.test(String(email || ''))) return res.status(400).json({ error: 'Valid email is required' });
      if (bio && String(bio).length > 500) return res.status(400).json({ error: 'Bio must be 500 characters or fewer' });
      const { data, error } = await supabase.from('artist_profiles').update({ artist_name, email, avatar_url, bio, location }).eq('id', id).select().single();
      if (error) throw error;
      await supabase.from('artist_notifications').insert({ title: 'Profile updated', message: 'Your artist profile changes were saved successfully.', category: 'Account', is_read: false });
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
