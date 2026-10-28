import { supabase, isSupabaseConfigured } from './supabase';

export async function fetchBookmarks(
  userId: string
): Promise<{ bookmarks: string[]; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId) {
    return { bookmarks: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('resource_id')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return {
      bookmarks: (data || []).map((row) => row.resource_id),
      error: null,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to fetch bookmarks');
    console.warn('Error fetching bookmarks:', error.message);
    return { bookmarks: [], error };
  }
}

export async function saveBookmark(
  userId: string,
  resourceId: string,
  isBookmarked: boolean
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId) {
    return { success: true, error: null };
  }

  try {
    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .upsert(
          { user_id: userId, resource_id: resourceId },
          { onConflict: 'user_id,resource_id' }
        );
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId);
      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to save bookmark');
    console.warn('Error saving bookmark to Supabase:', error.message);
    return { success: false, error };
  }
}

export async function deleteUserBookmarks(
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId || userId.startsWith('guest-')) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to reset bookmarks');
    console.warn('Error resetting bookmarks in Supabase:', error.message);
    return { success: false, error };
  }
}
