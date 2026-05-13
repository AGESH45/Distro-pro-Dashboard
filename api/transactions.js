import supabase from './_supabase.js';
import { verifyUser, handleCors } from './_auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const user = await verifyUser(req);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('artist_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { amount, method, note } = req.body;
      const { data, error } = await supabase
        .from('artist_transactions')
        .insert({
          user_id: user.id,
          amount,
          method,
          description: note || 'Payout request',
          status: 'Pending',
          transaction_date: new Date().toISOString().split('T')[0],
          reference: `PAY-${Date.now()}`
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
