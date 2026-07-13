import { z } from 'zod'
import { DIFFICULTY_REWARDS } from '@/utils/xp'

export const goalFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(100),
    description: z.string().trim().max(500).optional(),
    category: z.enum(['workout', 'nutrition', 'water', 'sleep', 'study', 'discipline', 'personal', 'custom']),
    difficulty: z.enum(['easy', 'medium', 'hard', 'elite']),
    deadline: z.string().optional(),
    repetition: z.enum(['one_time', 'daily', 'weekly', 'weekdays', 'custom_interval']),
    repetitionWeekdays: z.array(z.number().int().min(0).max(6)).optional(),
    repetitionIntervalDays: z.number().int().min(1).max(365).optional(),
    reminderEnabled: z.boolean(),
    progressType: z.enum(['checkbox', 'numeric', 'duration', 'quantity']),
    targetValue: z.number().positive('Must be greater than 0').max(100000),
  })
  .superRefine((data, ctx) => {
    if (data.repetition === 'weekdays' && (!data.repetitionWeekdays || data.repetitionWeekdays.length === 0)) {
      ctx.addIssue({ code: 'custom', message: 'Select at least one weekday', path: ['repetitionWeekdays'] })
    }
    if (data.repetition === 'custom_interval' && !data.repetitionIntervalDays) {
      ctx.addIssue({ code: 'custom', message: 'Enter an interval in days', path: ['repetitionIntervalDays'] })
    }
  })

export type GoalFormValues = z.infer<typeof goalFormSchema>

export function rewardsForDifficulty(difficulty: GoalFormValues['difficulty']) {
  return DIFFICULTY_REWARDS[difficulty]
}
