import { supabase, isSupabaseConfigured } from './supabase';

export async function saveCareerResults(
  userId: string,
  careers: { career_id: string; match_score: number }[]
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId || careers.length === 0) {
    return { success: true, error: null };
  }

  try {
    // Clear previous results for clean state
    const { error: deleteError } = await supabase
      .from('career_results')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    const rows = careers.slice(0, 10).map((c) => ({
      user_id: userId,
      career_id: c.career_id,
      match_score: c.match_score,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from('career_results').insert(rows);

    if (insertError) {
      throw insertError;
    }

    return { success: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to persist career results');
    console.warn('Failed to persist career results:', error.message);
    return { success: false, error };
  }
}
