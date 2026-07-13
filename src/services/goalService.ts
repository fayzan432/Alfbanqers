import { supabase } from '@/lib/supabase'
import type { Goal, GoalCompletion } from '@/types/database'

export async function listGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Goal[]
}

export async function listRecentCompletions(userId: string, limit = 200): Promise<GoalCompletion[]> {
  const { data, error } = await supabase
    .from('goal_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as GoalCompletion[]
}

export interface CreateGoalInput {
  title: string
  description?: string | null
  category: Goal['category']
  difficulty: Goal['difficulty']
  xp_reward: number
  coin_reward: number
  deadline?: string | null
  repetition: Goal['repetition']
  repetition_weekdays?: number[] | null
  repetition_interval_days?: number | null
  reminder_enabled: boolean
  progress_type: Goal['progress_type']
  target_value: number
}

export async function createGoal(userId: string, input: CreateGoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: userId, ...input })
    .select('*')
    .single()
  if (error) throw error
  return data as Goal
}

export async function updateGoal(goalId: string, patch: Partial<CreateGoalInput> & { status?: Goal['status'] }): Promise<Goal> {
  const { data, error } = await supabase.from('goals').update(patch).eq('id', goalId).select('*').single()
  if (error) throw error
  return data as Goal
}

export async function setGoalProgress(goalId: string, currentProgress: number): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update({ current_progress: Math.max(0, currentProgress) })
    .eq('id', goalId)
    .select('*')
    .single()
  if (error) throw error
  return data as Goal
}

export async function archiveGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('goals').update({ status: 'archived' }).eq('id', goalId)
  if (error) throw error
}

export async function reactivateGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('goals').update({ status: 'active' }).eq('id', goalId)
  if (error) throw error
}

export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', goalId)
  if (error) throw error
}

export interface CompleteGoalResult {
  xpAwarded: number
  coinsAwarded: number
  oldLevel: number
  newLevel: number
  leveledUp: boolean
  oldRank: string
  newRank: string
  rankChanged: boolean
  newTotalXp: number
  newCoins: number
}

export async function completeGoal(goalId: string, localDateKey: string): Promise<CompleteGoalResult> {
  const { data, error } = await supabase.rpc('complete_goal', { p_goal_id: goalId, p_local_date: localDateKey })
  if (error) throw error
  return data as CompleteGoalResult
}
