import {
  Swords,
  Dumbbell,
  Apple,
  Droplets,
  Scale,
  Sparkles,
  Trophy,
  Gift,
  TrendingUp,
  ShieldHalf,
  type LucideIcon,
} from 'lucide-react'
import type { ActivityHistoryType } from '@/types/database'

export const HISTORY_TYPE_META: Record<ActivityHistoryType, { label: string; icon: LucideIcon; color: string }> = {
  goal_completed: { label: 'Quest Completed', icon: Swords, color: '#a78bfa' },
  workout_logged: { label: 'Workout Logged', icon: Dumbbell, color: '#22d3ee' },
  food_logged: { label: 'Food Logged', icon: Apple, color: '#22c55e' },
  water_logged: { label: 'Water Logged', icon: Droplets, color: '#3b82f6' },
  weight_logged: { label: 'Weight Logged', icon: Scale, color: '#fbbf24' },
  level_up: { label: 'Level Up', icon: TrendingUp, color: '#f472b6' },
  rank_promotion: { label: 'Rank Promotion', icon: ShieldHalf, color: '#fbbf24' },
  achievement_unlocked: { label: 'Achievement Unlocked', icon: Trophy, color: '#fde68a' },
  reward_redeemed: { label: 'Reward Redeemed', icon: Gift, color: '#f87171' },
  xp_event: { label: 'XP Earned', icon: Sparkles, color: '#8b5cf6' },
}
