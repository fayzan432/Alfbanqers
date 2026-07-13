import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { useAuth } from '@/features/auth/AuthContext'
import { listAttributeEvents, listXpEventsSince } from '@/services/analyticsService'
import { listFoodEntriesRange } from '@/services/nutritionService'
import { listWaterEntriesRange } from '@/services/waterService'

export function useXpEvents(days = 30) {
  const { user } = useAuth()
  const since = subDays(new Date(), days).toISOString()
  return useQuery({
    queryKey: ['xp_events', user?.id, since],
    queryFn: () => listXpEventsSince(user!.id, since),
    enabled: Boolean(user),
  })
}

export function useAttributeEvents() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['attribute_events', user?.id],
    queryFn: () => listAttributeEvents(user!.id),
    enabled: Boolean(user),
  })
}

export function useFoodHistory(days = 14) {
  const { user } = useAuth()
  const from = format(subDays(new Date(), days), 'yyyy-MM-dd')
  const to = format(new Date(), 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['food_entries', 'range', user?.id, from, to],
    queryFn: () => listFoodEntriesRange(user!.id, from, to),
    enabled: Boolean(user),
  })
}

export function useWaterHistoryRange(days = 14) {
  const { user } = useAuth()
  const from = format(subDays(new Date(), days), 'yyyy-MM-dd')
  const to = format(new Date(), 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['water_entries', 'range', user?.id, from, to],
    queryFn: () => listWaterEntriesRange(user!.id, from, to),
    enabled: Boolean(user),
  })
}
