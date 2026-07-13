import { z } from 'zod'

export const reminderFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  message: z.string().trim().max(300).optional(),
  reminderType: z.enum(['workout', 'meal', 'water', 'goal', 'sleep', 'weight', 'custom']),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  repeatPattern: z.enum(['none', 'daily', 'weekly', 'weekdays']),
  enabled: z.boolean(),
})

export type ReminderFormValues = z.infer<typeof reminderFormSchema>
