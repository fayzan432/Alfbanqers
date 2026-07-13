import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import {
  createFoodEntry,
  createSavedFood,
  deleteFoodEntry,
  deleteSavedFood,
  listFoodEntriesForDate,
  listSavedFoods,
  toggleSavedFoodFavorite,
  updateFoodEntry,
  type FoodEntryInput,
  type SavedFoodInput,
} from '@/services/nutritionService'
import { logStreakActivity } from '@/services/streakService'
import { logActivity } from '@/services/historyService'
import { localDateKey } from '@/utils/date'

const FOOD_KEY = 'food_entries'
const SAVED_FOOD_KEY = 'saved_foods'

export function useFoodEntries(date: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [FOOD_KEY, user?.id, date],
    queryFn: () => listFoodEntriesForDate(user!.id, date),
    enabled: Boolean(user),
  })
}

export function useSavedFoods() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [SAVED_FOOD_KEY, user?.id],
    queryFn: () => listSavedFoods(user!.id),
    enabled: Boolean(user),
  })
}

export function useAddFoodEntry() {
  const { user } = useAuth()
  const { refresh } = useProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: FoodEntryInput) => {
      const entry = await createFoodEntry(user!.id, input)
      const isToday = input.date === localDateKey()
      if (isToday) {
        await logStreakActivity('nutrition', input.date)
      }
      await logActivity(user!.id, {
        activity_type: 'food_logged',
        title: input.food_name,
        description: `${input.calories} kcal · ${input.meal_type}`,
        category: 'nutrition',
        metadata: { food_entry_id: entry.id },
      })
      return entry
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [FOOD_KEY] }),
        queryClient.invalidateQueries({ queryKey: ['activity_history'] }),
        queryClient.invalidateQueries({ queryKey: ['user_achievements'] }),
        refresh(),
      ])
    },
  })
}

export function useUpdateFoodEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<FoodEntryInput> }) => updateFoodEntry(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FOOD_KEY] }),
  })
}

export function useDeleteFoodEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFoodEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FOOD_KEY] }),
  })
}

export function useCreateSavedFood() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SavedFoodInput) => createSavedFood(user!.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SAVED_FOOD_KEY] }),
  })
}

export function useToggleSavedFoodFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => toggleSavedFoodFavorite(id, isFavorite),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SAVED_FOOD_KEY] }),
  })
}

export function useDeleteSavedFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSavedFood(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SAVED_FOOD_KEY] }),
  })
}
