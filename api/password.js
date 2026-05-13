import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || String(currentPassword).length < 6) return res.status(400).json({ error: 'Current password is required' });
      if (!newPassword || String(newPassword).length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
      if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return res.status(400).json({ error: 'Password must include an uppercase letter and a number' });
      if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Password confirmation does not match' });
      const { error } = await supabase.from('artist_security_events').insert({ event_type: 'password_changed', details: 'Artist dashboard password changed successfully' });
      if (error) throw error;
      await supabase.from('artist_notifications').insert({ title: 'Password changed', message: 'Your dashboard password was updated successfully.', category: 'Security', is_read: false });
      return res.status(200).json({ ok: true, message: 'Password updated successfully' });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
