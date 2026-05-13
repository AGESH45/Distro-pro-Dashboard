import supabase from './_supabase.js';

export async function verifyUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Missing Authorization header');

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error('Auth error:', error);
    throw new Error('Invalid or expired session');
  }

  return user;
}

export function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
