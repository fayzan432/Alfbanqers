import { format, parseISO } from 'date-fns'
import type { Goal, GoalRepetition } from '@/types/database'

/** Mirrors the period_key computation in the complete_goal Postgres function. */
export function periodKeyFor(repetition: GoalRepetition, localDateKey: string): string {
  if (repetition === 'one_time') return 'once'
  if (repetition === 'weekly') return format(parseISO(localDateKey), "RRRR-'W'II")
  return localDateKey
}

export function isEligibleToday(goal: Goal, localDateKey: string): boolean {
  if (goal.status === 'archived') return false
  if (goal.repetition === 'one_time') return goal.status !== 'completed'

  if (goal.repetition === 'weekdays' && goal.repetition_weekdays?.length) {
    const dayOfWeek = parseISO(localDateKey).getDay()
    if (!goal.repetition_weekdays.includes(dayOfWeek)) return false
  }

  if (goal.repetition === 'custom_interval' && goal.repetition_interval_days) {
    // Eligibility is refined further using the goal's last completion date, computed by the caller.
    return true
  }

  return true
}
