import { z } from 'zod'

export const rewardFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z.string().trim().max(300).optional(),
  coinCost: z.number().int().min(0, 'Cannot be negative').max(100000),
  requiredLevel: z.number().int().min(1).max(200),
  requiredStreak: z.number().int().min(0).max(3650),
  active: z.boolean(),
})

export type RewardFormValues = z.infer<typeof rewardFormSchema>
