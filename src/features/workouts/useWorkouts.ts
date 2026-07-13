import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import {
  completeWorkout,
  createWorkoutTemplate,
  createWorkoutWithExercises,
  deleteWorkout,
  deleteWorkoutTemplate,
  duplicateWorkout,
  getPersonalRecords,
  listExercisesForWorkout,
  listSetsForExercises,
  listWorkoutTemplates,
  listWorkouts,
  updateWorkout,
  type WorkoutExerciseInput,
  type WorkoutInput,
} from '@/services/workoutService'
import { localDateKey } from '@/utils/date'
import type { Workout, WorkoutType } from '@/types/database'

const WORKOUTS_KEY = 'workouts'
const TEMPLATES_KEY = 'workout_templates'
const RECORDS_KEY = 'personal_records'

export function useWorkouts() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [WORKOUTS_KEY, user?.id],
    queryFn: () => listWorkouts(user!.id),
    enabled: Boolean(user),
  })
}

export function useWorkoutDetail(workoutId: string | null) {
  return useQuery({
    queryKey: [WORKOUTS_KEY, 'detail', workoutId],
    queryFn: async () => {
      const exercises = await listExercisesForWorkout(workoutId!)
      const sets = await listSetsForExercises(exercises.map((e) => e.id))
      return { exercises, sets }
    },
    enabled: Boolean(workoutId),
  })
}

export function useCreateWorkout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workout, exercises }: { workout: WorkoutInput; exercises: WorkoutExerciseInput[] }) =>
      createWorkoutWithExercises(user!.id, workout, exercises),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WORKOUTS_KEY] }),
  })
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<WorkoutInput> }) => updateWorkout(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WORKOUTS_KEY] }),
  })
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WORKOUTS_KEY] }),
  })
}

export function useDuplicateWorkout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (workout: Workout) => {
      const exercises = await listExercisesForWorkout(workout.id)
      const sets = await listSetsForExercises(exercises.map((e) => e.id))
      const setsByExercise = new Map<string, typeof sets>()
      for (const s of sets) {
        const list = setsByExercise.get(s.workout_exercise_id) ?? []
        list.push(s)
        setsByExercise.set(s.workout_exercise_id, list)
      }
      return duplicateWorkout(user!.id, workout, exercises, setsByExercise)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WORKOUTS_KEY] }),
  })
}

export function useCompleteWorkout() {
  const queryClient = useQueryClient()
  const { refresh } = useProfile()
  return useMutation({
    mutationFn: (workoutId: string) => completeWorkout(workoutId, localDateKey()),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [WORKOUTS_KEY] }),
        queryClient.invalidateQueries({ queryKey: ['activity_history'] }),
        refresh(),
      ])
    },
  })
}

export function useWorkoutTemplates() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [TEMPLATES_KEY, user?.id],
    queryFn: () => listWorkoutTemplates(user!.id),
    enabled: Boolean(user),
  })
}

export function useCreateWorkoutTemplate() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, workoutType, data }: { name: string; workoutType: WorkoutType; data: unknown }) =>
      createWorkoutTemplate(user!.id, name, workoutType, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY] }),
  })
}

export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWorkoutTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEMPLATES_KEY] }),
  })
}

export function usePersonalRecords() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [RECORDS_KEY, user?.id],
    queryFn: () => getPersonalRecords(user!.id),
    enabled: Boolean(user),
  })
}
