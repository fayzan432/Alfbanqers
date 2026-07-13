// Domain types mirroring the Supabase schema (see supabase/migrations).

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type ActivityLevelDb = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type MainGoal = 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'improve_fitness' | 'build_discipline'
export type UnitSystemDb = 'metric' | 'imperial'
export type ThemeName = 'dark_fantasy' | 'dark_calm' | 'light'

export interface Profile {
  id: string
  user_id: string
  display_name: string
  age: number | null
  gender: Gender | null
  height_cm: number | null
  current_weight_kg: number | null
  target_weight_kg: number | null
  activity_level: ActivityLevelDb | null
  main_goal: MainGoal | null
  unit_system: UnitSystemDb
  daily_calorie_goal: number
  daily_protein_goal: number
  daily_carb_goal: number
  daily_fat_goal: number
  daily_water_goal_ml: number
  total_xp: number
  coins: number
  onboarding_completed: boolean
  attr_strength: number
  attr_endurance: number
  attr_discipline: number
  attr_agility: number
  attr_consistency: number
  goal_streak_current: number
  goal_streak_longest: number
  goal_streak_last_date: string | null
  workout_streak_current: number
  workout_streak_longest: number
  workout_streak_last_date: string | null
  nutrition_streak_current: number
  nutrition_streak_longest: number
  nutrition_streak_last_date: string | null
  water_streak_current: number
  water_streak_longest: number
  water_streak_last_date: string | null
  overall_streak_current: number
  overall_streak_longest: number
  overall_streak_last_date: string | null
  created_at: string
  updated_at: string
}

export type GoalCategory = 'workout' | 'nutrition' | 'water' | 'sleep' | 'study' | 'discipline' | 'personal' | 'custom'
export type GoalDifficulty = 'easy' | 'medium' | 'hard' | 'elite'
export type GoalRepetition = 'one_time' | 'daily' | 'weekly' | 'weekdays' | 'custom_interval'
export type GoalProgressType = 'checkbox' | 'numeric' | 'duration' | 'quantity'
export type GoalStatus = 'active' | 'completed' | 'archived'

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: GoalCategory
  difficulty: GoalDifficulty
  xp_reward: number
  coin_reward: number
  deadline: string | null
  repetition: GoalRepetition
  repetition_weekdays: number[] | null
  repetition_interval_days: number | null
  reminder_enabled: boolean
  progress_type: GoalProgressType
  target_value: number
  current_progress: number
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface GoalCompletion {
  id: string
  user_id: string
  goal_id: string
  period_key: string
  xp_awarded: number
  coins_awarded: number
  completed_at: string
}

export type WorkoutType =
  | 'strength'
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'hiit'
  | 'yoga'
  | 'stretching'
  | 'sports'
  | 'custom'

export interface Workout {
  id: string
  user_id: string
  name: string
  workout_type: WorkoutType
  date: string
  start_time: string | null
  duration_minutes: number
  calories_burned: number | null
  distance_km: number | null
  notes: string | null
  difficulty: GoalDifficulty | null
  completed: boolean
  template_id: string | null
  created_at: string
  updated_at: string
}

export interface WorkoutExercise {
  id: string
  user_id: string
  workout_id: string
  exercise_name: string
  muscle_group: string | null
  order_index: number
  rest_seconds: number | null
  notes: string | null
  created_at: string
}

export interface ExerciseSet {
  id: string
  user_id: string
  workout_exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  completed: boolean
  created_at: string
}

export interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  workout_type: WorkoutType
  data: unknown
  created_at: string
  updated_at: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodEntry {
  id: string
  user_id: string
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_amount: number
  serving_unit: string
  meal_type: MealType
  date: string
  time: string | null
  saved_food_id: string | null
  created_at: string
}

export interface SavedFood {
  id: string
  user_id: string
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_amount: number
  serving_unit: string
  is_favorite: boolean
  created_at: string
}

export interface WaterEntry {
  id: string
  user_id: string
  amount_ml: number
  date: string
  logged_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  weight_kg: number
  date: string
  notes: string | null
  created_at: string
}

export type ReminderType = 'workout' | 'meal' | 'water' | 'goal' | 'sleep' | 'weight' | 'custom'
export type RepeatPattern = 'none' | 'daily' | 'weekly' | 'weekdays'

export interface Reminder {
  id: string
  user_id: string
  title: string
  message: string | null
  reminder_type: ReminderType
  date: string
  time: string
  repeat_pattern: RepeatPattern
  goal_id: string | null
  enabled: boolean
  last_triggered_at: string | null
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  xp_reward: number
  coin_reward: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface Reward {
  id: string
  user_id: string
  name: string
  description: string | null
  coin_cost: number
  required_level: number
  required_streak: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface RewardRedemption {
  id: string
  user_id: string
  reward_id: string
  coin_cost: number
  redeemed_at: string
}

export interface XpEvent {
  id: string
  user_id: string
  amount: number
  source: string
  reference_id: string | null
  created_at: string
}

export interface CoinEvent {
  id: string
  user_id: string
  amount: number
  source: string
  reference_id: string | null
  created_at: string
}

export interface AttributeEvent {
  id: string
  user_id: string
  attribute: string
  amount: number
  source: string
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: ThemeName
  reduced_motion: boolean
  animations_enabled: boolean
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export type ActivityHistoryType =
  | 'goal_completed'
  | 'workout_logged'
  | 'food_logged'
  | 'water_logged'
  | 'weight_logged'
  | 'level_up'
  | 'rank_promotion'
  | 'achievement_unlocked'
  | 'reward_redeemed'
  | 'xp_event'

export interface ActivityHistoryEntry {
  id: string
  user_id: string
  activity_type: ActivityHistoryType
  title: string
  description: string | null
  category: string | null
  metadata: Record<string, unknown> | null
  occurred_at: string
}
