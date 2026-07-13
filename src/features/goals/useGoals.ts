import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import {
  archiveGoal,
  completeGoal,
  createGoal,
  deleteGoal,
  listGoals,
  listRecentCompletions,
  reactivateGoal,
  setGoalProgress,
  updateGoal,
  type CreateGoalInput,
} from '@/services/goalService'
import { localDateKey } from '@/utils/date'
import { periodKeyFor } from '@/utils/goalRecurrence'
import type { Goal } from '@/types/database'

const GOALS_KEY = ['goals']
const COMPLETIONS_KEY = ['goal_completions']

export function useGoals() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...GOALS_KEY, user?.id],
    queryFn: () => listGoals(user!.id),
    enabled: Boolean(user),
  })
}

export function useGoalCompletions() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...COMPLETIONS_KEY, user?.id],
    queryFn: () => listRecentCompletions(user!.id),
    enabled: Boolean(user),
  })
}

/** For each goal, whether it has already been claimed in the current recurrence period. */
export function useCompletionStatusMap(goals: Goal[] | undefined, completions: ReturnType<typeof useGoalCompletions>['data']) {
  const today = localDateKey()
  const map = new Map<string, boolean>()
  if (!goals) return map
  const latestPeriodByGoal = new Map<string, string>()
  for (const completion of completions ?? []) {
    if (!latestPeriodByGoal.has(completion.goal_id)) {
      latestPeriodByGoal.set(completion.goal_id, completion.period_key)
    }
  }
  for (const goal of goals) {
    const currentPeriod = periodKeyFor(goal.repetition, today)
    map.set(goal.id, latestPeriodByGoal.get(goal.id) === currentPeriod)
  }
  return map
}

export function useCreateGoal() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGoalInput) => createGoal(user!.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ goalId, patch }: { goalId: string; patch: Partial<CreateGoalInput> }) => updateGoal(goalId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  })
}

export function useAddGoalProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ goalId, value }: { goalId: string; value: number }) => setGoalProgress(goalId, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  })
}

export function useArchiveGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ goalId, archived }: { goalId: string; archived: boolean }) =>
      archived ? reactivateGoal(goalId) : archiveGoal(goalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  })
}

export function useCompleteGoal() {
  const queryClient = useQueryClient()
  const { refresh } = useProfile()
  return useMutation({
    mutationFn: (goal: Goal) => completeGoal(goal.id, localDateKey()),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
        queryClient.invalidateQueries({ queryKey: COMPLETIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: ['activity_history'] }),
        queryClient.invalidateQueries({ queryKey: ['user_achievements'] }),
        refresh(),
      ])
    },
  })
}
