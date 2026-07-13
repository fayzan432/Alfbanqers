import { supabase } from '@/lib/supabase'
import type { WeightEntry } from '@/types/database'

export async function listWeightEntries(userId: string, limit = 365): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as WeightEntry[]
}

export async function upsertWeightEntry(userId: string, weightKg: number, date: string, notes?: string | null): Promise<WeightEntry> {
  const { data, error } = await supabase
    .from('weight_entries')
    .upsert({ user_id: userId, weight_kg: weightKg, date, notes: notes ?? null }, { onConflict: 'user_id,date' })
    .select('*')
    .single()
  if (error) throw error
  return data as WeightEntry
}

export async function updateWeightEntry(id: string, patch: { weight_kg?: number; notes?: string | null }): Promise<WeightEntry> {
  const { data, error } = await supabase.from('weight_entries').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data as WeightEntry
}

export async function deleteWeightEntry(id: string): Promise<void> {
  const { error } = await supabase.from('weight_entries').delete().eq('id', id)
  if (error) throw error
}
