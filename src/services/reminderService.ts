import { supabase } from '@/lib/supabase'
import type { Reminder } from '@/types/database'

export async function listReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
  if (error) throw error
  return (data ?? []) as Reminder[]
}

export interface ReminderInput {
  title: string
  message?: string | null
  reminder_type: Reminder['reminder_type']
  date: string
  time: string
  repeat_pattern: Reminder['repeat_pattern']
  goal_id?: string | null
  enabled: boolean
}

export async function createReminder(userId: string, input: ReminderInput): Promise<Reminder> {
  const { data, error } = await supabase.from('reminders').insert({ user_id: userId, ...input }).select('*').single()
  if (error) throw error
  return data as Reminder
}

export async function updateReminder(id: string, patch: Partial<ReminderInput>): Promise<Reminder> {
  const { data, error } = await supabase.from('reminders').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data as Reminder
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) throw error
}

export async function markReminderTriggered(id: string): Promise<void> {
  const { error } = await supabase.from('reminders').update({ last_triggered_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}
