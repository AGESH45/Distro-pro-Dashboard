// scripts/set-admin.js
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const userId = process.argv[2]; // pass the Supabase user UUID as first argument
if (!userId) {
  console.error('❌ Usage: node set-admin.js <supabase-user-id>');
  process.exit(1);
}

(async () => {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'admin' },
  });
  if (error) {
    console.error('❌ Failed to update user metadata:', error.message);
    process.exit(1);
  }
  console.log('✅ User updated! New metadata →', data.user_metadata);
})();
