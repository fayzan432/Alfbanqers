import { z } from 'zod'

export const foodEntrySchema = z.object({
  foodName: z.string().trim().min(1, 'Food name is required').max(100),
  calories: z.number().min(0, 'Cannot be negative').max(10000),
  proteinG: z.number().min(0, 'Cannot be negative').max(1000),
  carbsG: z.number().min(0, 'Cannot be negative').max(1000),
  fatG: z.number().min(0, 'Cannot be negative').max(1000),
  servingAmount: z.number().positive('Must be greater than 0').max(1000),
  servingUnit: z.string().trim().min(1, 'Required').max(30),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  saveToFavorites: z.boolean(),
})

export type FoodEntryFormValues = z.infer<typeof foodEntrySchema>
