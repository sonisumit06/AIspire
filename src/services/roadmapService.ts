import { supabase, isSupabaseConfigured } from './supabase';

export async function fetchRoadmapProgress(
  userId: string
): Promise<{ progress: Record<string, number[]>; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId) {
    return { progress: {}, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('roadmap_progress')
      .select('career_id, step_id, completed')
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      throw error;
    }

    const progress: Record<string, number[]> = {};
    for (const row of data || []) {
      if (!progress[row.career_id]) {
        progress[row.career_id] = [];
      }
      progress[row.career_id].push(row.step_id);
      progress[row.career_id].sort((a, b) => a - b);
    }

    return { progress, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to fetch roadmap progress');
    console.warn('Error fetching roadmap progress:', error.message);
    return { progress: {}, error };
  }
}

export async function saveStepProgress(
  userId: string,
  careerId: string,
  stepId: number,
  completed: boolean
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId) {
    return { success: true, error: null };
  }

  try {
    const payload = {
      user_id: userId,
      career_id: careerId,
      step_id: stepId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('roadmap_progress')
      .upsert(payload, { onConflict: 'user_id,career_id,step_id' });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to save step progress');
    console.warn('Error saving roadmap step progress:', error.message);
    return { success: false, error };
  }
}
