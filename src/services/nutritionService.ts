import { supabase } from '@/lib/supabase'
import type { FoodEntry, SavedFood, MealType } from '@/types/database'

export async function listFoodEntriesForDate(userId: string, date: string): Promise<FoodEntry[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as FoodEntry[]
}

export async function listFoodEntriesRange(userId: string, from: string, to: string): Promise<FoodEntry[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
  if (error) throw error
  return (data ?? []) as FoodEntry[]
}

export interface FoodEntryInput {
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_amount: number
  serving_unit: string
  meal_type: MealType
  date: string
  time?: string | null
  saved_food_id?: string | null
}

export async function createFoodEntry(userId: string, input: FoodEntryInput): Promise<FoodEntry> {
  const { data, error } = await supabase
    .from('food_entries')
    .insert({ user_id: userId, ...input })
    .select('*')
    .single()
  if (error) throw error
  return data as FoodEntry
}

export async function updateFoodEntry(id: string, patch: Partial<FoodEntryInput>): Promise<FoodEntry> {
  const { data, error } = await supabase.from('food_entries').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data as FoodEntry
}

export async function deleteFoodEntry(id: string): Promise<void> {
  const { error } = await supabase.from('food_entries').delete().eq('id', id)
  if (error) throw error
}

export async function copyFoodEntriesToDate(entries: FoodEntry[], userId: string, targetDate: string): Promise<void> {
  if (entries.length === 0) return
  const rows = entries.map((entry) => ({
    user_id: userId,
    food_name: entry.food_name,
    calories: entry.calories,
    protein_g: entry.protein_g,
    carbs_g: entry.carbs_g,
    fat_g: entry.fat_g,
    serving_amount: entry.serving_amount,
    serving_unit: entry.serving_unit,
    meal_type: entry.meal_type,
    date: targetDate,
  }))
  const { error } = await supabase.from('food_entries').insert(rows)
  if (error) throw error
}

export async function listSavedFoods(userId: string): Promise<SavedFood[]> {
  const { data, error } = await supabase
    .from('saved_foods')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as SavedFood[]
}

export interface SavedFoodInput {
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_amount: number
  serving_unit: string
  is_favorite?: boolean
}

export async function createSavedFood(userId: string, input: SavedFoodInput): Promise<SavedFood> {
  const { data, error } = await supabase
    .from('saved_foods')
    .insert({ user_id: userId, ...input })
    .select('*')
    .single()
  if (error) throw error
  return data as SavedFood
}

export async function toggleSavedFoodFavorite(id: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase.from('saved_foods').update({ is_favorite: isFavorite }).eq('id', id)
  if (error) throw error
}

export async function deleteSavedFood(id: string): Promise<void> {
  const { error } = await supabase.from('saved_foods').delete().eq('id', id)
  if (error) throw error
}
