import { Dumbbell, Apple, Droplets, Moon, BookOpen, ShieldHalf, User, Sparkles, type LucideIcon } from 'lucide-react'
import type { GoalCategory, GoalDifficulty, GoalProgressType, GoalRepetition } from '@/types/database'

export const CATEGORY_META: Record<GoalCategory, { label: string; icon: LucideIcon }> = {
  workout: { label: 'Workout', icon: Dumbbell },
  nutrition: { label: 'Nutrition', icon: Apple },
  water: { label: 'Water', icon: Droplets },
  sleep: { label: 'Sleep', icon: Moon },
  study: { label: 'Study', icon: BookOpen },
  discipline: { label: 'Discipline', icon: ShieldHalf },
  personal: { label: 'Personal', icon: User },
  custom: { label: 'Custom', icon: Sparkles },
}

export const DIFFICULTY_META: Record<GoalDifficulty, { label: string; className: string; xp: number; coins: number }> = {
  easy: { label: 'Easy', className: 'text-verdant-500 border-verdant-500/40 bg-verdant-500/10', xp: 10, coins: 5 },
  medium: { label: 'Medium', className: 'text-blue-glow border-blue-glow/40 bg-blue-glow/10', xp: 25, coins: 12 },
  hard: { label: 'Hard', className: 'text-arcane-400 border-arcane-500/40 bg-arcane-500/10', xp: 50, coins: 25 },
  elite: { label: 'Elite', className: 'text-gold-400 border-gold-500/40 bg-gold-500/10', xp: 100, coins: 50 },
}

export const REPETITION_LABELS: Record<GoalRepetition, string> = {
  one_time: 'One time',
  daily: 'Daily',
  weekly: 'Weekly',
  weekdays: 'Selected weekdays',
  custom_interval: 'Custom interval',
}

export const PROGRESS_TYPE_LABELS: Record<GoalProgressType, string> = {
  checkbox: 'Completion checkbox',
  numeric: 'Numeric target',
  duration: 'Duration target (minutes)',
  quantity: 'Quantity target',
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
