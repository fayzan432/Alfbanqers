import { Dumbbell, Apple, Droplets, Swords, Moon, Scale, Sparkles, type LucideIcon } from 'lucide-react'
import type { ReminderType } from '@/types/database'

export const REMINDER_TYPE_META: Record<ReminderType, { label: string; icon: LucideIcon }> = {
  workout: { label: 'Workout', icon: Dumbbell },
  meal: { label: 'Meal', icon: Apple },
  water: { label: 'Water', icon: Droplets },
  goal: { label: 'Goal', icon: Swords },
  sleep: { label: 'Sleep', icon: Moon },
  weight: { label: 'Weight Check-in', icon: Scale },
  custom: { label: 'Custom', icon: Sparkles },
}

export const REPEAT_PATTERN_LABELS = {
  none: 'Does not repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  weekdays: 'Weekdays (Mon-Fri)',
} as const
