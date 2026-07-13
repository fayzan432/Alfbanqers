export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Lightly active (1-3 days/week)',
  moderate: 'Moderately active (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  very_active: 'Very active (physical job or 2x/day training)',
}

export type CalorieGoalType = 'lose' | 'maintain' | 'gain'

/** Mifflin-St Jeor BMR estimate. Weight in kg, height in cm, age in years. */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  if (gender === 'male') return Math.round(base + 5)
  if (gender === 'female') return Math.round(base - 161)
  return Math.round(base - 78) // neutral average offset for other/unspecified
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

/** Suggested daily calorie target adjusted for the user's goal. */
export function suggestCalorieTarget(tdee: number, goal: CalorieGoalType): number {
  if (goal === 'lose') return Math.round(tdee - 500)
  if (goal === 'gain') return Math.round(tdee + 300)
  return tdee
}

export function suggestMacros(calorieTarget: number, weightKg: number) {
  const proteinG = Math.round(weightKg * 1.8)
  const proteinCal = proteinG * 4
  const fatCal = calorieTarget * 0.28
  const fatG = Math.round(fatCal / 9)
  const carbCal = Math.max(0, calorieTarget - proteinCal - fatCal)
  const carbG = Math.round(carbCal / 4)
  return { proteinG, fatG, carbG }
}
