import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('artist_transactions').select('*').order('transaction_date', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { amount, method, note } = req.body;
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount < 25) return res.status(400).json({ error: 'Minimum payout is $25' });
      if (!method || String(method).trim().length < 3) return res.status(400).json({ error: 'Payment method is required' });
      const reference = `PAY-${Date.now().toString().slice(-8)}`;
      const { data, error } = await supabase
        .from('artist_transactions')
        .insert({
          description: note ? `Royalty payout request - ${note}` : 'Royalty payout request',
          amount: numericAmount,
          status: 'Processing',
          transaction_date: new Date().toISOString(),
          method,
          reference,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from('artist_notifications').insert({ title: 'Payout request received', message: `Your ${method} payout request for $${numericAmount.toFixed(2)} is now processing.`, category: 'Payments', is_read: false });
      return res.status(201).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
