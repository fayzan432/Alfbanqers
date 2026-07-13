import { supabase } from '@/lib/supabase'
import type { Achievement, UserAchievement } from '@/types/database'

export async function listAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase.from('achievements').select('*').order('xp_reward', { ascending: true })
  if (error) throw error
  return (data ?? []) as Achievement[]
}

export async function listUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase.from('user_achievements').select('*').eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as UserAchievement[]
}
