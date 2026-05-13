import supabase from './_supabase.js';
import { verifyUser, handleCors } from './_auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const user = await verifyUser(req);

    if (req.method === 'GET') {
      // Filter by user_id for security and scalability
      const { data, error } = await supabase
        .from('artist_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('streams', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err.message);
    res.status(err.message.includes('Auth') ? 401 : 500).json({ error: err.message });
  }
}
