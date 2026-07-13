import { Dumbbell, PersonStanding, Bike, Waves, Zap, Flower2, StretchHorizontal, Trophy, Sparkles, type LucideIcon } from 'lucide-react'
import type { WorkoutType } from '@/types/database'

export const WORKOUT_TYPE_META: Record<WorkoutType, { label: string; icon: LucideIcon }> = {
  strength: { label: 'Strength Training', icon: Dumbbell },
  running: { label: 'Running', icon: PersonStanding },
  walking: { label: 'Walking', icon: PersonStanding },
  cycling: { label: 'Cycling', icon: Bike },
  swimming: { label: 'Swimming', icon: Waves },
  hiit: { label: 'HIIT', icon: Zap },
  yoga: { label: 'Yoga', icon: Flower2 },
  stretching: { label: 'Stretching', icon: StretchHorizontal },
  sports: { label: 'Sports', icon: Trophy },
  custom: { label: 'Custom', icon: Sparkles },
}

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Full Body', 'Other',
]
