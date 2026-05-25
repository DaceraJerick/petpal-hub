import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Reads VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE from .env or environment
const envText = (() => {
  try { return readFileSync('.env', 'utf8'); } catch(e) { return ''; }
})();
const env = {};
envText.split(/\r?\n/).forEach((line) => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[key] = value;
  }
});

const URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || env.SUPABASE_SERVICE_ROLE || env.VITE_SUPABASE_SERVICE_ROLE;

if (!URL || !SERVICE_ROLE) {
  console.error('Error: set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE in your environment or .env');
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_ROLE, { auth: { persistSession: false } });

(async () => {
  const email = 'ladaga@gmail.com';
  const password = 'ladaga@gmail.com';

  try {
    // create user (idempotent: if exists, return user)
    // Supabase Admin API throws if user exists, so check first
    const { data: existing, error: getErr } = await supabase.auth.admin.listUsers?.({ filter: `email=eq.${email}` }) || { data: null };
    if (getErr) throw getErr;

    if (existing && existing.length > 0) {
      console.log('User already exists:', existing[0].id);
      console.log('Skipping creation. You may still need to assign admin role via SQL.');
      process.exit(0);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Admin' }
    });

    if (error) {
      console.error('Create user error:', error);
      process.exit(1);
    }

    console.log('Created user:', data);
    console.log('Now run the SQL provided in the README or run this SQL in Supabase SQL editor:');
    console.log(`INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = '${email}' AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.users.id AND ur.role = 'admin');`);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();
