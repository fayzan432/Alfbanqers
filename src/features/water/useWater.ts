import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { addWaterEntry, deleteWaterEntry, listWaterEntriesForDate, listWaterEntriesRange } from '@/services/waterService'
import { logStreakActivity } from '@/services/streakService'
import { logActivity } from '@/services/historyService'
import { localDateKey } from '@/utils/date'

const WATER_KEY = 'water_entries'

export function useWaterEntries(date: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [WATER_KEY, user?.id, date],
    queryFn: () => listWaterEntriesForDate(user!.id, date),
    enabled: Boolean(user),
  })
}

export function useWaterHistory(from: string, to: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [WATER_KEY, 'range', user?.id, from, to],
    queryFn: () => listWaterEntriesRange(user!.id, from, to),
    enabled: Boolean(user),
  })
}

export function useAddWater() {
  const { user } = useAuth()
  const { refresh } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ amountMl, date }: { amountMl: number; date: string }) => {
      const entry = await addWaterEntry(user!.id, amountMl, date)
      if (date === localDateKey()) {
        await logStreakActivity('water', date)
      }
      await logActivity(user!.id, {
        activity_type: 'water_logged',
        title: `Logged ${amountMl} ml of water`,
        category: 'water',
        metadata: { water_entry_id: entry.id },
      })
      return entry
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [WATER_KEY] }),
        queryClient.invalidateQueries({ queryKey: ['activity_history'] }),
        refresh(),
      ])
    },
  })
}

export function useDeleteWater() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWaterEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WATER_KEY] }),
  })
}
