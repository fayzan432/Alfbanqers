import {
  Swords,
  Dumbbell,
  TrendingUp,
  Flame,
  Droplets,
  Apple,
  ShieldHalf,
  Repeat2,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  swords: Swords,
  dumbbell: Dumbbell,
  'trending-up': TrendingUp,
  flame: Flame,
  droplets: Droplets,
  apple: Apple,
  'shield-half': ShieldHalf,
  'repeat-2': Repeat2,
}

export function iconForAchievement(icon: string): LucideIcon {
  return ACHIEVEMENT_ICONS[icon] ?? Trophy
}
