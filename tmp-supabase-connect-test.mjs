import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach((line) => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.slice(0, idx);
    let value = line.slice(idx + 1);
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

const authResult = await supabase.auth.signInWithPassword({
  email: 'admin@gmail.com',
  password: 'admin@gmail.com',
});

const queryResult = await supabase.from('services').select('*').limit(1);
console.log('AUTH_RESULT:', JSON.stringify(authResult, null, 2));
console.log('QUERY_RESULT:', JSON.stringify(queryResult, null, 2));
