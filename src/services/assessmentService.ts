import { supabase, isSupabaseConfigured } from './supabase';
import type { DbAssessment, DimensionScores } from '../types';

export async function saveAssessmentProgress(
  userId: string,
  answers: Record<number, string>,
  currentQuestion: number,
  completed = false
): Promise<{ id: string | null; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId) {
    return { id: null, error: null };
  }

  try {
    // Check if there is an existing incomplete or latest assessment
    const { data: existing } = await supabase
      .from('assessments')
      .select('id, completed')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = {
      user_id: userId,
      answers,
      current_question: currentQuestion,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (existing && !existing.completed) {
      // Update ongoing assessment
      const { data, error } = await supabase
        .from('assessments')
        .update(payload)
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) throw error;
      return { id: data.id, error: null };
    } else {
      // Create new assessment record
      const { data, error } = await supabase
        .from('assessments')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;
      return { id: data.id, error: null };
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to persist assessment progress');
    console.warn('Failed to persist assessment progress to Supabase:', error.message);
    return { id: null, error };
  }
}

export async function saveAssessmentScores(
  userId: string,
  assessmentId: string | null,
  scores: DimensionScores
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId) {
    return { success: true, error: null };
  }

  try {
    const payload = {
      user_id: userId,
      assessment_id: assessmentId || null,
      analytical: scores.analytical,
      creative: scores.creative,
      technical: scores.technical,
      social_healthcare: scores.socialHealthcare,
      management: scores.management,
      research: scores.research,
      communication: scores.communication,
      updated_at: new Date().toISOString(),
    };

    // Use upsert if assessment_id is provided, otherwise insert
    let queryError: any = null;
    if (assessmentId) {
      const { error } = await supabase
        .from('assessment_scores')
        .upsert(payload, { onConflict: 'user_id,assessment_id' });
      queryError = error;
    } else {
      const { error } = await supabase.from('assessment_scores').insert(payload);
      queryError = error;
    }

    if (queryError) {
      throw queryError;
    }

    return { success: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to persist assessment scores');
    console.warn('Failed to persist assessment scores to Supabase:', error.message);
    return { success: false, error };
  }
}

export async function fetchLatestAssessment(
  userId: string
): Promise<{
  assessment: DbAssessment | null;
  scores: DimensionScores | null;
  error: Error | null;
}> {
  if (!isSupabaseConfigured() || !userId) {
    return { assessment: null, scores: null, error: null };
  }

  try {
    // 1. Get latest assessment
    const { data: assessmentData, error: assessmentErr } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assessmentErr) {
      throw assessmentErr;
    }

    if (!assessmentData) {
      return { assessment: null, scores: null, error: null };
    }

    const assessment: DbAssessment = {
      id: assessmentData.id,
      user_id: assessmentData.user_id,
      answers: assessmentData.answers || {},
      current_question: assessmentData.current_question || 0,
      completed: assessmentData.completed || false,
      completed_at: assessmentData.completed_at,
    };

    // 2. If completed, get corresponding scores
    let scores: DimensionScores | null = null;
    if (assessment.completed) {
      const { data: scoreData, error: scoreErr } = await supabase
        .from('assessment_scores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (scoreErr) {
        throw scoreErr;
      }

      if (scoreData) {
        scores = {
          analytical: Number(scoreData.analytical) || 0,
          creative: Number(scoreData.creative) || 0,
          technical: Number(scoreData.technical) || 0,
          socialHealthcare: Number(scoreData.social_healthcare) || 0,
          management: Number(scoreData.management) || 0,
          research: Number(scoreData.research) || 0,
          communication: Number(scoreData.communication) || 0,
        };
      }
    }

    return { assessment, scores, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Error fetching latest assessment');
    console.warn('Error fetching latest assessment from Supabase:', error.message);
    return { assessment: null, scores: null, error };
  }
}

export async function deleteUserAssessmentData(
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId || userId.startsWith('guest-')) {
    return { success: true, error: null };
  }

  try {
    const [delAssessments, delScores] = await Promise.all([
      supabase.from('assessments').delete().eq('user_id', userId),
      supabase.from('assessment_scores').delete().eq('user_id', userId),
    ]);

    if (delAssessments.error) throw delAssessments.error;
    if (delScores.error) throw delScores.error;

    return { success: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to reset assessment data');
    console.warn('Error resetting assessment data in Supabase:', error.message);
    return { success: false, error };
  }
}
