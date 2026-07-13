import { daysBetweenKeys, localDateKey } from './date'

export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
}

/**
 * Recompute a streak given the last recorded active day and a new activity day.
 * A day only counts once; consecutive local-calendar days increment the streak,
 * a gap of more than one day resets it. Logging "today" again is a no-op.
 */
export function applyActivityForStreak(state: StreakState, activityDateKey: string = localDateKey()): StreakState {
  if (state.lastActiveDate === activityDateKey) {
    return state
  }

  if (!state.lastActiveDate) {
    return { currentStreak: 1, longestStreak: Math.max(1, state.longestStreak), lastActiveDate: activityDateKey }
  }

  const gap = daysBetweenKeys(state.lastActiveDate, activityDateKey)

  if (gap === 1) {
    const currentStreak = state.currentStreak + 1
    return { currentStreak, longestStreak: Math.max(currentStreak, state.longestStreak), lastActiveDate: activityDateKey }
  }

  if (gap <= 0) {
    return state
  }

  return { currentStreak: 1, longestStreak: Math.max(1, state.longestStreak), lastActiveDate: activityDateKey }
}

/** Whether a streak is still "alive" as of today (hasn't silently lapsed). */
export function isStreakActive(state: StreakState): boolean {
  if (!state.lastActiveDate) return false
  const gap = daysBetweenKeys(state.lastActiveDate, localDateKey())
  return gap <= 1
}
