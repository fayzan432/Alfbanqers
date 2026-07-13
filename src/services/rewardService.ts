import { supabase } from '@/lib/supabase'
import type { Reward, RewardRedemption } from '@/types/database'

export async function listRewards(userId: string): Promise<Reward[]> {
  const { data, error } = await supabase.from('rewards').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Reward[]
}

export interface RewardInput {
  name: string
  description?: string | null
  coin_cost: number
  required_level: number
  required_streak: number
  active: boolean
}

export async function createReward(userId: string, input: RewardInput): Promise<Reward> {
  const { data, error } = await supabase.from('rewards').insert({ user_id: userId, ...input }).select('*').single()
  if (error) throw error
  return data as Reward
}

export async function updateReward(id: string, patch: Partial<RewardInput>): Promise<Reward> {
  const { data, error } = await supabase.from('rewards').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data as Reward
}

export async function deleteReward(id: string): Promise<void> {
  const { error } = await supabase.from('rewards').delete().eq('id', id)
  if (error) throw error
}

export async function listRedemptions(userId: string): Promise<RewardRedemption[]> {
  const { data, error } = await supabase
    .from('reward_redemptions')
    .select('*')
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as RewardRedemption[]
}

export async function redeemReward(rewardId: string): Promise<{ newCoins: number }> {
  const { data, error } = await supabase.rpc('redeem_reward', { p_reward_id: rewardId })
  if (error) throw error
  return data as { newCoins: number }
}
