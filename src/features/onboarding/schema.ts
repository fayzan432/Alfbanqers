import { z } from 'zod'

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required').max(40, 'Keep it under 40 characters'),
  age: z.number({ message: 'Age is required' }).int().min(13, 'Must be at least 13').max(120, 'Enter a valid age'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  unitSystem: z.enum(['metric', 'imperial']),
  heightCm: z.number({ message: 'Height is required' }).positive('Enter a valid height').max(300),
  currentWeightKg: z.number({ message: 'Weight is required' }).positive('Enter a valid weight').max(500),
  targetWeightKg: z.number({ message: 'Target weight is required' }).positive('Enter a valid target weight').max(500),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  mainGoal: z.enum(['lose_weight', 'gain_muscle', 'maintain_weight', 'improve_fitness', 'build_discipline']),
  dailyCalorieGoal: z.number().int().min(800, 'Too low for a safe estimate').max(6000),
  dailyProteinGoal: z.number().int().min(0).max(500),
  dailyCarbGoal: z.number().int().min(0).max(900),
  dailyFatGoal: z.number().int().min(0).max(400),
  dailyWaterGoalMl: z.number().int().min(250, 'Too low').max(10000),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
