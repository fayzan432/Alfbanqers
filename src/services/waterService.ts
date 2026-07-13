import { supabase } from '@/lib/supabase'
import type { WaterEntry } from '@/types/database'

export async function listWaterEntriesForDate(userId: string, date: string): Promise<WaterEntry[]> {
  const { data, error } = await supabase
    .from('water_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('logged_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as WaterEntry[]
}

export async function listWaterEntriesRange(userId: string, from: string, to: string): Promise<WaterEntry[]> {
  const { data, error } = await supabase
    .from('water_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
  if (error) throw error
  return (data ?? []) as WaterEntry[]
}

export async function addWaterEntry(userId: string, amountMl: number, date: string): Promise<WaterEntry> {
  const { data, error } = await supabase
    .from('water_entries')
    .insert({ user_id: userId, amount_ml: amountMl, date })
    .select('*')
    .single()
  if (error) throw error
  return data as WaterEntry
}

export async function deleteWaterEntry(id: string): Promise<void> {
  const { error } = await supabase.from('water_entries').delete().eq('id', id)
  if (error) throw error
}
