import { supabase, isSupabaseConfigured } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file, or continue with Instant Guest Access.'
      ),
    };
  }

  try {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      return { error };
    }

    if (data?.url && typeof window !== 'undefined') {
      window.location.assign(data.url);
    }

    return { error: null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err : new Error('Authentication failed') };
  }
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error: error || null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err : new Error('Sign out failed') };
  }
}

export async function getAuthSession(): Promise<{ session: Session | null; user: User | null }> {
  if (!isSupabaseConfigured()) {
    return { session: null, user: null };
  }

  try {
    const { data } = await supabase.auth.getSession();
    return {
      session: data.session,
      user: data.session?.user || null,
    };
  } catch {
    return { session: null, user: null };
  }
}

export function subscribeToAuthChanges(
  callback: (session: Session | null, user: User | null) => void
): { unsubscribe: () => void } {
  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session, session?.user || null);
  });

  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
}

