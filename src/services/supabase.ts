import { createClient, SupabaseClient } from '@supabase/supabase-js';

const cleanEnvVar = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
};

const metaEnv = (import.meta as any)?.env || (globalThis as any).process?.env || {};
const rawUrl = cleanEnvVar(metaEnv?.VITE_SUPABASE_URL);
const supabaseUrl = rawUrl.replace(/\/+$/, '');
const supabaseAnonKey = cleanEnvVar(metaEnv?.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://')) &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('placeholder') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('your-anon-key') &&
    !supabaseAnonKey.includes('placeholder')
  );
};

// Use real credentials if provided; otherwise fallback to placeholder to prevent runtime crash
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export { supabaseUrl, supabaseAnonKey };

