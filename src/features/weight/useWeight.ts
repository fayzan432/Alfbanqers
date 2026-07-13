import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { deleteWeightEntry, listWeightEntries, updateWeightEntry, upsertWeightEntry } from '@/services/weightService'
import { logActivity } from '@/services/historyService'
import { updateProfile } from '@/services/profileService'
import { localDateKey } from '@/utils/date'

const WEIGHT_KEY = 'weight_entries'

export function useWeightEntries() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [WEIGHT_KEY, user?.id],
    queryFn: () => listWeightEntries(user!.id),
    enabled: Boolean(user),
  })
}

export function useAddWeightEntry() {
  const { user } = useAuth()
  const { refresh } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ weightKg, date, notes }: { weightKg: number; date: string; notes?: string }) => {
      const entry = await upsertWeightEntry(user!.id, weightKg, date, notes)
      if (date === localDateKey()) {
        await updateProfile(user!.id, { current_weight_kg: weightKg })
      }
      await logActivity(user!.id, {
        activity_type: 'weight_logged',
        title: `Weighed in at ${weightKg} kg`,
        category: 'weight',
        metadata: { weight_entry_id: entry.id },
      })
      return entry
    },
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: [WEIGHT_KEY] }), queryClient.invalidateQueries({ queryKey: ['activity_history'] }), refresh()])
    },
  })
}

export function useUpdateWeightEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, weightKg, notes }: { id: string; weightKg: number; notes?: string }) =>
      updateWeightEntry(id, { weight_kg: weightKg, notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WEIGHT_KEY] }),
  })
}

export function useDeleteWeightEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWeightEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WEIGHT_KEY] }),
  })
}
