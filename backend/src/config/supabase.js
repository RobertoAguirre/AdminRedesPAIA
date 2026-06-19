import { createClient } from '@supabase/supabase-js';

let supabase = null;
let connected = false;

export function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!url || !key) {
      throw new Error(
        'Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en backend/.env (Supabase → Settings → API Keys)'
      );
    }

    supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return supabase;
}

export async function verifySupabase() {
  const client = getSupabase();
  const { error } = await client.from('users').select('id').limit(1);

  if (error) {
    const missingTable =
      error.code === '42P01' ||
      error.message.includes('does not exist') ||
      error.message.includes('schema cache');

    if (missingTable) {
      throw new Error(
        'Supabase responde, pero faltan las tablas. Ejecuta backend/supabase/schema.sql en SQL Editor.'
      );
    }
    throw new Error(`No se pudo conectar a Supabase: ${error.message}`);
  }

  connected = true;
  const host = new URL(process.env.SUPABASE_URL).hostname;
  console.log(`Supabase conectado → ${host}`);
  return { connected: true, host };
}

export function getDbStatus() {
  const url = process.env.SUPABASE_URL?.trim();
  return {
    connected,
    provider: 'supabase',
    host: url ? new URL(url).hostname : null,
  };
}
