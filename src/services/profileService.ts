import { supabase, isSupabaseConfigured } from './supabase';
import type { DbProfile } from '../types';

export async function fetchProfile(userId: string): Promise<DbProfile | null> {
  if (!isSupabaseConfigured() || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile from Supabase:', error.message);
      return null;
    }

    return data as DbProfile;
  } catch (err) {
    console.warn('Error querying profile:', err);
    return null;
  }
}

export async function upsertProfile(
  profile: DbProfile
): Promise<{ data: DbProfile | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: profile, error: null };
  }

  try {
    const record = {
      ...profile,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(record, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as DbProfile, error: null };
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to save profile'),
    };
  }
}

