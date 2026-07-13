import {
  LayoutDashboard,
  Swords,
  Dumbbell,
  Apple,
  Droplets,
  Scale,
  Trophy,
  Gift,
  BarChart3,
  CalendarDays,
  Bell,
  History,
  Settings,
  ShieldHalf,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  primary?: boolean
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, primary: true },
  { to: '/goals', label: 'Quests', icon: Swords, primary: true },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell, primary: true },
  { to: '/nutrition', label: 'Nutrition', icon: Apple, primary: true },
]

export const SECONDARY_NAV: NavItem[] = [
  { to: '/status', label: 'Player Status', icon: ShieldHalf },
  { to: '/water', label: 'Water', icon: Droplets },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export const ALL_NAV: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV]
