import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { listAchievements, listUserAchievements } from '@/services/achievementService'

export const USER_ACHIEVEMENTS_KEY = 'user_achievements'

export function useAchievementCatalog() {
  return useQuery({ queryKey: ['achievements'], queryFn: listAchievements, staleTime: Infinity })
}

export function useUserAchievements() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [USER_ACHIEVEMENTS_KEY, user?.id],
    queryFn: () => listUserAchievements(user!.id),
    enabled: Boolean(user),
  })
}
