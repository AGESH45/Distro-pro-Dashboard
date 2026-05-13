import supabase from './_supabase.js';
import { verifyUser, handleCors } from './_auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const user = await verifyUser(req);
    
    // STRICT ADMIN CHECK: Ensure the requester has the 'admin' role in metadata
    if (user.user_metadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const { action } = req.query;

    if (req.method === 'GET') {
      // SCALABILITY: Paginate user list to prevent timeouts with many users
      const page = parseInt(req.query.page) || 1;
      const perPage = 50;
      
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage
      });
      
      if (error) throw error;
      
      const mapped = data.users.map(u => ({
        id: u.id,
        email: u.email || '',
        artist_name: u.user_metadata?.artist_name || 'New Artist',
        role: u.user_metadata?.role || 'artist',
        created_at: u.created_at?.split('T')[0] || ''
      }));
      
      return res.status(200).json(mapped);
    }

    if (req.method === 'POST') {
      const { email, role, userId, action: bodyAction } = req.body;
      const finalAction = action || bodyAction;

      if (finalAction === 'promote') {
        // Find user by email (Note: listUsers still used here for finding, could be improved with a search)
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find(u => u.email === email);
        
        if (existing) {
          await supabase.auth.admin.updateUserById(existing.id, {
            user_metadata: { ...existing.user_metadata, role: 'admin' }
          });
          return res.status(200).json({ message: 'User promoted' });
        } else {
          return res.status(404).json({ error: 'User not found' });
        }
      }

      if (finalAction === 'change-role') {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { role }
        });
        if (error) throw error;
        return res.status(200).json({ message: 'Role updated' });
      }
    }

    if (req.method === 'DELETE') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'User ID is required' });
      
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return res.status(200).json({ message: 'User deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin API error:', error.message);
    res.status(error.message.includes('Auth') ? 401 : 500).json({ error: error.message });
  }
}
