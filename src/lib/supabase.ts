import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const _client = createClient(supabaseUrl!, supabaseAnonKey!);

/**
 * Primary client carrying the auth session.
 */
export const supabase = _client;

/**
 * Re-export of the same singleton — avoids multiple GoTrueClient warnings.
 */
export const supabaseNoAuth = _client;

export async function checkConnection() {
  try {
    const { error } = await supabase.from('events').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
