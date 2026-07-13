import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { MUSCLE_GROUPS } from './workoutMeta'
import type { WorkoutFormValues } from './schema'

interface ExerciseFieldsProps {
  control: Control<WorkoutFormValues>
  register: UseFormRegister<WorkoutFormValues>
  exerciseIndex: number
  onRemoveExercise: () => void
}

export function ExerciseFields({ control, register, exerciseIndex, onRemoveExercise }: ExerciseFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: `exercises.${exerciseIndex}.sets` })

  return (
    <div className="rounded-xl border border-white/10 bg-void-800/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <input
          placeholder="Exercise name"
          className="flex-1 rounded-lg border border-white/10 bg-void-800/80 px-3 py-2 text-sm text-slate-100"
          {...register(`exercises.${exerciseIndex}.exerciseName`)}
        />
        <button type="button" onClick={onRemoveExercise} aria-label="Remove exercise" className="text-slate-500 hover:text-ember-500">
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Select id={`muscle-${exerciseIndex}`} label="Muscle group" {...register(`exercises.${exerciseIndex}.muscleGroup`)}>
          <option value="">Select</option>
          {MUSCLE_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </Select>
        <div>
          <label htmlFor={`rest-${exerciseIndex}`} className="mb-1.5 block text-sm font-medium text-slate-300">
            Rest (seconds)
          </label>
          <input
            id={`rest-${exerciseIndex}`}
            type="number"
            className="w-full rounded-lg border border-white/10 bg-void-800/80 px-3 py-2.5 text-sm text-slate-100"
            {...register(`exercises.${exerciseIndex}.restSeconds`, { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 text-xs text-slate-500">
          <span className="w-8">Set</span>
          <span>Reps</span>
          <span>Weight (kg)</span>
          <span className="w-6" />
        </div>
        {fields.map((field, setIndex) => (
          <div key={field.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
            <span className="w-8 text-center text-xs text-slate-500">{setIndex + 1}</span>
            <input
              type="number"
              placeholder="Reps"
              className="rounded-lg border border-white/10 bg-void-800/80 px-2 py-1.5 text-sm text-slate-100"
              {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, { valueAsNumber: true })}
            />
            <input
              type="number"
              step="0.5"
              placeholder="Weight"
              className="rounded-lg border border-white/10 bg-void-800/80 px-2 py-1.5 text-sm text-slate-100"
              {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weightKg`, { valueAsNumber: true })}
            />
            <button
              type="button"
              onClick={() => remove(setIndex)}
              aria-label="Remove set"
              className="w-6 text-slate-500 hover:text-ember-500"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="mt-2"
        onClick={() => append({ reps: undefined, weightKg: undefined })}
      >
        <Plus className="size-3.5" /> Add Set
      </Button>
    </div>
  )
}
