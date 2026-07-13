import { supabase } from '@/lib/supabase'

export type StreakType = 'goal' | 'workout' | 'nutrition' | 'water'

export async function logStreakActivity(streakType: StreakType, localDateKey: string): Promise<void> {
  const { error } = await supabase.rpc('log_streak_activity', { p_streak_type: streakType, p_local_date: localDateKey })
  if (error) throw error
}
