import { supabase, isSupabaseConfigured } from './supabase';
import type { ChatMessage } from '../types';

export async function fetchChatHistory(
  userId: string
): Promise<{ messages: ChatMessage[]; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId || userId.startsWith('guest-')) {
    return { messages: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('id, role, message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(60);

    if (error) {
      throw error;
    }

    const messages: ChatMessage[] = (data || []).map((row) => ({
      id: row.id,
      sender: row.role === 'user' ? 'user' : 'ai',
      text: row.message,
      timestamp: row.created_at
        ? new Date(row.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Just now',
    }));

    return { messages, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to fetch chat history');
    console.warn('Error fetching chat history from Supabase:', error.message);
    return { messages: [], error };
  }
}

export async function saveChatMessage(
  userId: string,
  role: 'user' | 'ai',
  message: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId || userId.startsWith('guest-') || !message.trim()) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase.from('ai_chat_history').insert({
      user_id: userId,
      role,
      message: message.trim(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to persist chat message');
    console.warn('Error saving chat message to Supabase:', error.message);
    return { success: false, error };
  }
}

export async function clearChatHistory(
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured() || !userId || userId.startsWith('guest-')) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('ai_chat_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to clear chat history');
    console.warn('Error clearing chat history in Supabase:', error.message);
    return { success: false, error };
  }
}

