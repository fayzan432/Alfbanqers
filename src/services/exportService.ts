import { supabase } from '@/lib/supabase'

async function selectAll(table: string, userId: string) {
  const { data, error } = await supabase.from(table).select('*').eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export async function buildUserDataExport(userId: string) {
  const [
    profile,
    goals,
    goalCompletions,
    workouts,
    workoutExercises,
    exerciseSets,
    workoutTemplates,
    foodEntries,
    savedFoods,
    waterEntries,
    weightEntries,
    reminders,
    userAchievements,
    rewards,
    rewardRedemptions,
    xpEvents,
    coinEvents,
    attributeEvents,
    userSettings,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle().then((r) => r.data),
    selectAll('goals', userId),
    selectAll('goal_completions', userId),
    selectAll('workouts', userId),
    selectAll('workout_exercises', userId),
    selectAll('exercise_sets', userId),
    selectAll('workout_templates', userId),
    selectAll('food_entries', userId),
    selectAll('saved_foods', userId),
    selectAll('water_entries', userId),
    selectAll('weight_entries', userId),
    selectAll('reminders', userId),
    selectAll('user_achievements', userId),
    selectAll('rewards', userId),
    selectAll('reward_redemptions', userId),
    selectAll('xp_events', userId),
    selectAll('coin_events', userId),
    selectAll('attribute_events', userId),
    supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle().then((r) => r.data),
  ])

  return {
    exportedAt: new Date().toISOString(),
    exportedAtReadable: new Date().toLocaleString(),
    app: 'LEVEL UP MULLICK',
    profile,
    goals,
    goalCompletions,
    workouts,
    workoutExercises,
    exerciseSets,
    workoutTemplates,
    foodEntries,
    savedFoods,
    waterEntries,
    weightEntries,
    reminders,
    userAchievements,
    rewards,
    rewardRedemptions,
    xpEvents,
    coinEvents,
    attributeEvents,
    userSettings,
  }
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
