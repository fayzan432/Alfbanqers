import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { listActivityHistory, type HistoryFilters } from '@/services/historyService'

export function useActivityHistory(filters: HistoryFilters = {}) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['activity_history', user?.id, filters],
    queryFn: () => listActivityHistory(user!.id, filters),
    enabled: Boolean(user),
  })
}
