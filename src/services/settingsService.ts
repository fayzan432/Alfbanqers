import { supabase } from '@/lib/supabase'
import type { UserSettings } from '@/types/database'

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data as UserSettings | null
}

export interface UserSettingsInput {
  theme: UserSettings['theme']
  reduced_motion: boolean
  animations_enabled: boolean
  notifications_enabled: boolean
}

export async function upsertUserSettings(userId: string, input: UserSettingsInput): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...input }, { onConflict: 'user_id' })
    .select('*')
    .single()
  if (error) throw error
  return data as UserSettings
}
