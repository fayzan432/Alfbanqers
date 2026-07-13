import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextInput, Select } from '@/components/ui/Input'
import { foodEntrySchema, type FoodEntryFormValues } from './schema'
import { useSavedFoods } from './useNutrition'
import type { MealType, SavedFood } from '@/types/database'

interface FoodEntryModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: FoodEntryFormValues) => Promise<void>
  defaultMealType: MealType
  submitting?: boolean
}

const DEFAULTS: FoodEntryFormValues = {
  foodName: '',
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  servingAmount: 1,
  servingUnit: 'serving',
  mealType: 'breakfast',
  saveToFavorites: false,
}

export function FoodEntryModal({ open, onClose, onSubmit, defaultMealType, submitting }: FoodEntryModalProps) {
  const { data: savedFoods } = useSavedFoods()
  const [tab, setTab] = useState<'custom' | 'saved'>('custom')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FoodEntryFormValues>({ resolver: zodResolver(foodEntrySchema), defaultValues: { ...DEFAULTS, mealType: defaultMealType } })

  useEffect(() => {
    if (open) {
      reset({ ...DEFAULTS, mealType: defaultMealType })
      setTab('custom')
    }
  }, [open, defaultMealType, reset])

  const applySavedFood = (food: SavedFood) => {
    setValue('foodName', food.food_name)
    setValue('calories', food.calories)
    setValue('proteinG', food.protein_g)
    setValue('carbsG', food.carbs_g)
    setValue('fatG', food.fat_g)
    setValue('servingAmount', food.serving_amount)
    setValue('servingUnit', food.serving_unit)
    setTab('custom')
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Food" size="lg">
      <div className="mb-4 flex gap-2 border-b border-white/5">
        <button
          onClick={() => setTab('custom')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'custom' ? 'border-arcane-500 text-arcane-300' : 'border-transparent text-slate-500'}`}
        >
          Entry details
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'saved' ? 'border-arcane-500 text-arcane-300' : 'border-transparent text-slate-500'}`}
        >
          Saved &amp; recent foods
        </button>
      </div>

      {tab === 'saved' ? (
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {!savedFoods || savedFoods.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No saved foods yet. Log a custom food and save it for later.</p>
          ) : (
            savedFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => applySavedFood(food)}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-void-800/60 px-3 py-2 text-left hover:border-arcane-500/30"
              >
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  {food.is_favorite && <Star className="size-3.5 fill-gold-400 text-gold-400" />}
                  {food.food_name}
                </span>
                <span className="text-xs text-slate-500">{food.calories} kcal</span>
              </button>
            ))
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <TextInput id="foodName" label="Food name" error={errors.foodName?.message} {...register('foodName')} />
          <div className="grid grid-cols-2 gap-3">
            <Select id="mealType" label="Meal" error={errors.mealType?.message} {...register('mealType')}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </Select>
            <TextInput id="calories" type="number" label="Calories (kcal)" error={errors.calories?.message} {...register('calories', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <TextInput id="proteinG" type="number" step="0.1" label="Protein (g)" error={errors.proteinG?.message} {...register('proteinG', { valueAsNumber: true })} />
            <TextInput id="carbsG" type="number" step="0.1" label="Carbs (g)" error={errors.carbsG?.message} {...register('carbsG', { valueAsNumber: true })} />
            <TextInput id="fatG" type="number" step="0.1" label="Fat (g)" error={errors.fatG?.message} {...register('fatG', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextInput id="servingAmount" type="number" step="0.1" label="Serving amount" error={errors.servingAmount?.message} {...register('servingAmount', { valueAsNumber: true })} />
            <TextInput id="servingUnit" label="Serving unit" placeholder="e.g. grams, cup, piece" error={errors.servingUnit?.message} {...register('servingUnit')} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" className="size-4 rounded border-white/20 bg-void-800" {...register('saveToFavorites')} />
            Save this food for quick reuse later
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Log Food
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
