import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    'Supabase credentials not found. Running in offline mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable cloud sync.'
  );
}

export const supabase = supabaseClient;

export const isSupabaseConfigured = (): boolean => {
  return supabaseClient !== null;
};

/**
 * Get the supabase client.
 * Returns null if not configured.
 */
export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}
