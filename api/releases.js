import supabase from './_supabase.js';
import { verifyUser, handleCors } from './_auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const user = await verifyUser(req);

    if (req.method === 'GET') {
      // Filter by user_id to ensure privacy and scalability
      const { data, error } = await supabase
        .from('artist_releases')
        .select('*')
        .eq('user_id', user.id)
        .order('release_date', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { title, artist_name, release_type, genre, release_date, tracks, cover_url } = req.body;
      if (!title || !artist_name || !release_date) {
        return res.status(400).json({ error: 'Title, artist name, and release date are required' });
      }

      const { data, error } = await supabase
        .from('artist_releases')
        .insert({
          user_id: user.id, // Securely associate with the logged-in user
          title,
          artist_name,
          release_type: release_type || 'Single',
          status: 'In Review',
          cover_url,
          release_date,
          genre,
          upc: `AD${Date.now()}`,
          tracks: tracks || 1
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      // Ensure the user owns the record they are updating
      const { data, error } = await supabase
        .from('artist_releases')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      // Ensure the user owns the record they are deleting
      const { error } = await supabase
        .from('artist_releases')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err.message);
    res.status(err.message.includes('Auth') ? 401 : 500).json({ error: err.message });
  }
}
