import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Calculator, Copy, Apple } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/ToastContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { useAuth } from '@/features/auth/AuthContext'
import { localDateKey, formatDisplayDate } from '@/utils/date'
import {
  useAddFoodEntry,
  useCreateSavedFood,
  useDeleteFoodEntry,
  useFoodEntries,
} from './useNutrition'
import { FoodEntryModal } from './FoodEntryModal'
import { CalorieCalculatorModal } from './CalorieCalculatorModal'
import { copyFoodEntriesToDate } from '@/services/nutritionService'
import type { FoodEntryFormValues } from './schema'
import type { MealType } from '@/types/database'

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS: Record<MealType, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }

function shiftDate(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00`)
  d.setDate(d.getDate() + days)
  return localDateKey(d)
}

export function NutritionPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { showToast } = useToast()
  const [date, setDate] = useState(localDateKey())
  const [modalMeal, setModalMeal] = useState<MealType | null>(null)
  const [calculatorOpen, setCalculatorOpen] = useState(false)

  const { data: entries, isLoading } = useFoodEntries(date)
  const addFoodEntry = useAddFoodEntry()
  const deleteFoodEntry = useDeleteFoodEntry()
  const createSavedFood = useCreateSavedFood()

  const totals = useMemo(() => {
    const acc = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    for (const e of entries ?? []) {
      acc.calories += Number(e.calories)
      acc.protein += Number(e.protein_g)
      acc.carbs += Number(e.carbs_g)
      acc.fat += Number(e.fat_g)
    }
    return acc
  }, [entries])

  const calorieGoal = profile?.daily_calorie_goal ?? 2000
  const remaining = calorieGoal - totals.calories

  const handleAddFood = async (values: FoodEntryFormValues) => {
    if (!user || !modalMeal) return
    try {
      await addFoodEntry.mutateAsync({
        food_name: values.foodName,
        calories: values.calories,
        protein_g: values.proteinG,
        carbs_g: values.carbsG,
        fat_g: values.fatG,
        serving_amount: values.servingAmount,
        serving_unit: values.servingUnit,
        meal_type: values.mealType,
        date,
      })
      if (values.saveToFavorites) {
        await createSavedFood.mutateAsync({
          food_name: values.foodName,
          calories: values.calories,
          protein_g: values.proteinG,
          carbs_g: values.carbsG,
          fat_g: values.fatG,
          serving_amount: values.servingAmount,
          serving_unit: values.servingUnit,
          is_favorite: true,
        })
      }
      showToast('Food logged.', 'success')
      setModalMeal(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to log food.', 'error')
    }
  }

  const handleCopyToTomorrow = async () => {
    if (!user || !entries || entries.length === 0) return
    try {
      await copyFoodEntriesToDate(entries, user.id, shiftDate(date, 1))
      showToast('Meals copied to tomorrow.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to copy meals.', 'error')
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Nourishment Log</h1>
          <p className="text-sm text-slate-400">Track calories and macros to fuel your ascension.</p>
        </div>
        <Button variant="secondary" onClick={() => setCalculatorOpen(true)}>
          <Calculator className="size-4" /> Calorie Calculator
        </Button>
      </div>

      <Panel className="flex items-center justify-between gap-3">
        <Button size="sm" variant="ghost" onClick={() => setDate((d) => shiftDate(d, -1))} aria-label="Previous day">
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-center">
          <p className="font-display text-base font-semibold text-slate-100">{formatDisplayDate(date)}</p>
          {date !== localDateKey() && (
            <button onClick={() => setDate(localDateKey())} className="text-xs text-arcane-400 hover:text-arcane-300">
              Back to today
            </button>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setDate((d) => shiftDate(d, 1))} aria-label="Next day">
          <ChevronRight className="size-4" />
        </Button>
      </Panel>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Panel className="text-center">
          <p className="text-xs text-slate-500">Consumed</p>
          <p className="font-display text-xl font-bold text-slate-100">{Math.round(totals.calories)}</p>
          <p className="text-[11px] text-slate-500">of {calorieGoal} kcal</p>
        </Panel>
        <Panel className="text-center">
          <p className="text-xs text-slate-500">Remaining</p>
          <p className={`font-display text-xl font-bold ${remaining < 0 ? 'text-ember-500' : 'text-verdant-500'}`}>
            {Math.round(remaining)}
          </p>
          <p className="text-[11px] text-slate-500">kcal</p>
        </Panel>
        <Panel className="col-span-2 sm:col-span-2">
          <div className="flex flex-col gap-2">
            <ProgressBar
              label={`Protein ${Math.round(totals.protein)}g / ${profile?.daily_protein_goal ?? 0}g`}
              value={totals.protein}
              max={profile?.daily_protein_goal ?? 1}
              size="sm"
              colorFrom="#ef4444"
              colorTo="#f87171"
            />
            <ProgressBar
              label={`Carbs ${Math.round(totals.carbs)}g / ${profile?.daily_carb_goal ?? 0}g`}
              value={totals.carbs}
              max={profile?.daily_carb_goal ?? 1}
              size="sm"
              colorFrom="#fbbf24"
              colorTo="#f59e0b"
            />
            <ProgressBar
              label={`Fat ${Math.round(totals.fat)}g / ${profile?.daily_fat_goal ?? 0}g`}
              value={totals.fat}
              max={profile?.daily_fat_goal ?? 1}
              size="sm"
              colorFrom="#22d3ee"
              colorTo="#3b82f6"
            />
          </div>
        </Panel>
      </div>

      {isLoading ? (
        <Spinner label="Loading meals..." />
      ) : (
        <div className="flex flex-col gap-4">
          {MEAL_ORDER.map((meal) => {
            const mealEntries = (entries ?? []).filter((e) => e.meal_type === meal)
            return (
              <Panel key={meal}>
                <PanelHeader>
                  <PanelTitle>{MEAL_LABELS[meal]}</PanelTitle>
                  <Button size="sm" variant="secondary" onClick={() => setModalMeal(meal)}>
                    <Plus className="size-3.5" /> Add
                  </Button>
                </PanelHeader>
                {mealEntries.length === 0 ? (
                  <p className="py-3 text-center text-xs text-slate-500">No items logged</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {mealEntries.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-void-800/50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-slate-200">{entry.food_name}</p>
                          <p className="text-[11px] text-slate-500">
                            {entry.calories} kcal · P{entry.protein_g}g C{entry.carbs_g}g F{entry.fat_g}g
                          </p>
                        </div>
                        <button
                          onClick={() => deleteFoodEntry.mutate(entry.id)}
                          aria-label={`Delete ${entry.food_name}`}
                          className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:text-ember-500"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )
          })}
        </div>
      )}

      {entries && entries.length > 0 && (
        <Button variant="ghost" onClick={handleCopyToTomorrow} className="self-start">
          <Copy className="size-4" /> Copy today's meals to tomorrow
        </Button>
      )}

      {(!entries || entries.length === 0) && !isLoading && (
        <EmptyState icon={Apple} title="No meals logged for this day" description="Add your first meal to start tracking." />
      )}

      <FoodEntryModal
        open={Boolean(modalMeal)}
        onClose={() => setModalMeal(null)}
        onSubmit={handleAddFood}
        defaultMealType={modalMeal ?? 'breakfast'}
        submitting={addFoodEntry.isPending}
      />
      <CalorieCalculatorModal open={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
    </div>
  )
}
