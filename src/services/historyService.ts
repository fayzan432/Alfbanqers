import { supabase } from '@/lib/supabase'
import type { ActivityHistoryEntry, ActivityHistoryType } from '@/types/database'

export interface HistoryFilters {
  type?: ActivityHistoryType
  category?: string
  from?: string
  to?: string
}

export async function listActivityHistory(userId: string, filters: HistoryFilters = {}, limit = 100): Promise<ActivityHistoryEntry[]> {
  let query = supabase
    .from('activity_history')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (filters.type) query = query.eq('activity_type', filters.type)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.from) query = query.gte('occurred_at', filters.from)
  if (filters.to) query = query.lte('occurred_at', filters.to)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ActivityHistoryEntry[]
}
