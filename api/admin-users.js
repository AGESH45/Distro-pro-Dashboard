import supabase from './_supabase.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verify authorization (Check if requester is an admin)
  // In a real app, you'd verify the JWT from the Authorization header
  // For now, we'll proceed but ideally we'd use supabase.auth.getUser(req.headers.authorization)
  
  try {
    const { action } = req.query;

    if (req.method === 'GET') {
      const { data, error } = await supabase.auth.admin.listUsers();
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
        // Find user by email
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find(u => u.email === email);
        
        if (existing) {
          await supabase.auth.admin.updateUserById(existing.id, {
            user_metadata: { role: 'admin' }
          });
          return res.status(200).json({ message: 'User promoted' });
        } else {
          // Create new user
          const { data: newUser, error } = await supabase.auth.admin.createUser({
            email,
            password: Math.random().toString(36).slice(-10),
            email_confirm: true,
            user_metadata: { role: 'admin' }
          });
          if (error) throw error;
          return res.status(200).json({ message: 'User created and promoted' });
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
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return res.status(200).json({ message: 'User deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ error: error.message });
  }
}
