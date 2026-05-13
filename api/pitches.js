import supabase from './_supabase.js';
import { verifyUser, handleCors } from './_auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const user = await verifyUser(req);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('artist_pitches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { artist_name, email, release_title, genre, pitch_goal, story, links } = req.body;
      if (!email || !release_title || !story) {
        return res.status(400).json({ error: 'Email, release title, and story are required' });
      }

      const { data, error } = await supabase
        .from('artist_pitches')
        .insert({
          user_id: user.id,
          artist_name,
          email,
          release_title,
          genre,
          pitch_goal,
          story,
          links,
          status: 'Submitted'
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err.message);
    res.status(err.message.includes('Auth') ? 401 : 500).json({ error: err.message });
  }
}
