import { z } from 'zod'

export const profileFormSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required').max(40),
  age: z.number().int().min(13).max(120).optional(),
  heightCm: z.number().positive().max(300).optional(),
  currentWeightKg: z.number().positive().max(500).optional(),
  targetWeightKg: z.number().positive().max(500).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  mainGoal: z.enum(['lose_weight', 'gain_muscle', 'maintain_weight', 'improve_fitness', 'build_discipline']),
  unitSystem: z.enum(['metric', 'imperial']),
})
export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const goalsFormSchema = z.object({
  dailyCalorieGoal: z.number().int().min(800).max(6000),
  dailyProteinGoal: z.number().int().min(0).max(500),
  dailyCarbGoal: z.number().int().min(0).max(900),
  dailyFatGoal: z.number().int().min(0).max(400),
  dailyWaterGoalMl: z.number().int().min(250).max(10000),
})
export type GoalsFormValues = z.infer<typeof goalsFormSchema>
