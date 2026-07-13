import { supabase } from '@/lib/supabase'
import type { AttributeEvent, XpEvent } from '@/types/database'

export async function listXpEventsSince(userId: string, sinceIso: string): Promise<XpEvent[]> {
  const { data, error } = await supabase
    .from('xp_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as XpEvent[]
}

export async function listAttributeEvents(userId: string): Promise<AttributeEvent[]> {
  const { data, error } = await supabase
    .from('attribute_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as AttributeEvent[]
}
