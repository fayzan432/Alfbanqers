import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import {
  createReminder,
  deleteReminder,
  listReminders,
  markReminderTriggered,
  updateReminder,
  type ReminderInput,
} from '@/services/reminderService'

const REMINDERS_KEY = 'reminders'

export function useReminders() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [REMINDERS_KEY, user?.id],
    queryFn: () => listReminders(user!.id),
    enabled: Boolean(user),
    refetchInterval: 60_000,
  })
}

export function useCreateReminder() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ReminderInput) => createReminder(user!.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [REMINDERS_KEY] }),
  })
}

export function useUpdateReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ReminderInput> }) => updateReminder(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [REMINDERS_KEY] }),
  })
}

export function useDeleteReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [REMINDERS_KEY] }),
  })
}

export function useMarkReminderTriggered() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markReminderTriggered(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [REMINDERS_KEY] }),
  })
}
