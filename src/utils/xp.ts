export interface RankDefinition {
  key: string
  label: string
  minLevel: number
  maxLevel: number
  colorFrom: string
  colorTo: string
}

export const RANKS: RankDefinition[] = [
  { key: 'E', label: 'E Rank', minLevel: 1, maxLevel: 5, colorFrom: '#6b7280', colorTo: '#374151' },
  { key: 'D', label: 'D Rank', minLevel: 6, maxLevel: 10, colorFrom: '#22c55e', colorTo: '#15803d' },
  { key: 'C', label: 'C Rank', minLevel: 11, maxLevel: 20, colorFrom: '#3b82f6', colorTo: '#1d4ed8' },
  { key: 'B', label: 'B Rank', minLevel: 21, maxLevel: 35, colorFrom: '#22d3ee', colorTo: '#0e7490' },
  { key: 'A', label: 'A Rank', minLevel: 36, maxLevel: 50, colorFrom: '#a78bfa', colorTo: '#6d28d9' },
  { key: 'S', label: 'S Rank', minLevel: 51, maxLevel: 75, colorFrom: '#fbbf24', colorTo: '#b45309' },
  { key: 'ASCENDANT', label: 'Ascendant Rank', minLevel: 76, maxLevel: Infinity, colorFrom: '#f472b6', colorTo: '#a21caf' },
]

export function getRankForLevel(level: number): RankDefinition {
  const rank = RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel)
  return rank ?? RANKS[RANKS.length - 1]
}

/** XP required to advance FROM `level` to `level + 1`. */
export function xpRequiredForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.35))
}

/** Total cumulative XP required to reach `level` from level 1. */
export function totalXpForLevel(level: number): number {
  let total = 0
  for (let l = 1; l < level; l++) {
    total += xpRequiredForLevel(l)
  }
  return total
}

export interface LevelProgress {
  level: number
  totalXp: number
  xpIntoLevel: number
  xpForNextLevel: number
  xpRemaining: number
  progressPercent: number
}

/** Derive level + progress purely from cumulative totalXp. */
export function getLevelProgress(totalXp: number): LevelProgress {
  let level = 1
  let remaining = Math.max(0, Math.floor(totalXp))

  while (true) {
    const needed = xpRequiredForLevel(level)
    if (remaining < needed) {
      return {
        level,
        totalXp,
        xpIntoLevel: remaining,
        xpForNextLevel: needed,
        xpRemaining: needed - remaining,
        progressPercent: Math.min(100, Math.round((remaining / needed) * 100)),
      }
    }
    remaining -= needed
    level += 1
    if (level > 9999) break
  }

  return {
    level,
    totalXp,
    xpIntoLevel: remaining,
    xpForNextLevel: xpRequiredForLevel(level),
    xpRemaining: 0,
    progressPercent: 100,
  }
}

export const DIFFICULTY_REWARDS: Record<'easy' | 'medium' | 'hard' | 'elite', { xp: number; coins: number }> = {
  easy: { xp: 10, coins: 5 },
  medium: { xp: 25, coins: 12 },
  hard: { xp: 50, coins: 25 },
  elite: { xp: 100, coins: 50 },
}
