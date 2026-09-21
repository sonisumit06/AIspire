import { supabase, isSupabaseConfigured, supabaseUrl } from './supabase';
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
    // 1. Generate the OAuth authorize URL with skipBrowserRedirect to avoid browser-level DNS crash
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return { error };
    }

    if (!data?.url) {
      return { error: new Error('Unable to construct Google OAuth authorization URL.') };
    }

    // 2. Pre-flight probe to verify domain resolution before navigating the browser
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Probe health endpoint. If DNS resolution fails, fetch rejects immediately.
      await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors',
      });
      clearTimeout(timeoutId);
    } catch {
      let host = 'your Supabase project';
      try {
        host = new URL(supabaseUrl).hostname;
      } catch {
        // ignore
      }

      return {
        error: new Error(
          `Unable to connect to Supabase backend (${host}). The domain cannot be resolved (ERR_NAME_NOT_RESOLVED). Please verify VITE_SUPABASE_URL in your .env file, or click "Continue as Guest" to use the platform immediately.`
        ),
      };
    }

    // 3. Domain is active and reachable; navigate to Google OAuth
    if (typeof window !== 'undefined') {
      try {
        window.location.assign(data.url);
      } catch {
        window.location.href = data.url;
      }
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

