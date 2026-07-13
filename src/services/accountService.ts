import { supabase } from '@/lib/supabase'

export async function resetMyProgress(): Promise<void> {
  const { error } = await supabase.rpc('reset_my_progress')
  if (error) throw error
}

export async function deleteMyData(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_data')
  if (error) throw error
}
