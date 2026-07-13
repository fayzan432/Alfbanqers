import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextInput, Select, TextArea } from '@/components/ui/Input'
import { workoutFormSchema, type WorkoutFormValues } from './schema'
import { WORKOUT_TYPE_META } from './workoutMeta'
import { ExerciseFields } from './ExerciseFields'
import { localDateKey } from '@/utils/date'

interface WorkoutFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: WorkoutFormValues) => Promise<void>
  submitting?: boolean
  initialValues?: WorkoutFormValues | null
}

const DEFAULTS: WorkoutFormValues = {
  name: '',
  workoutType: 'strength',
  date: localDateKey(),
  startTime: '',
  durationMinutes: 30,
  caloriesBurned: undefined,
  distanceKm: undefined,
  notes: '',
  difficulty: 'medium',
  exercises: [],
}

export function WorkoutFormModal({ open, onClose, onSubmit, submitting, initialValues }: WorkoutFormModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<WorkoutFormValues>({ resolver: zodResolver(workoutFormSchema), defaultValues: DEFAULTS })

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' })
  const workoutType = watch('workoutType')

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULTS)
  }, [open, initialValues, reset])

  return (
    <Modal open={open} onClose={onClose} title={initialValues ? 'Edit Workout' : 'Log Workout'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <TextInput id="workout-name" label="Workout name" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Select id="workout-type" label="Type" error={errors.workoutType?.message} {...register('workoutType')}>
            {Object.entries(WORKOUT_TYPE_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </Select>
          <Select id="workout-difficulty" label="Difficulty" {...register('difficulty')}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="elite">Elite</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextInput id="workout-date" type="date" label="Date" error={errors.date?.message} {...register('date')} />
          <TextInput id="workout-start-time" type="time" label="Start time (optional)" {...register('startTime')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <TextInput
            id="workout-duration"
            type="number"
            label="Duration (min)"
            error={errors.durationMinutes?.message}
            {...register('durationMinutes', { valueAsNumber: true })}
          />
          <TextInput
            id="workout-calories"
            type="number"
            label="Calories burned (est.)"
            {...register('caloriesBurned', { valueAsNumber: true })}
          />
          <TextInput id="workout-distance" type="number" step="0.1" label="Distance (km)" {...register('distanceKm', { valueAsNumber: true })} />
        </div>
        <TextArea id="workout-notes" label="Notes (optional)" {...register('notes')} />

        {workoutType === 'strength' && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-300">Exercises</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => append({ exerciseName: '', muscleGroup: '', restSeconds: 60, sets: [{ reps: undefined, weightKg: undefined }] })}
              >
                <Plus className="size-3.5" /> Add Exercise
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <ExerciseFields key={field.id} control={control} register={register} exerciseIndex={index} onRemoveExercise={() => remove(index)} />
              ))}
              {fields.length === 0 && <p className="text-center text-xs text-slate-500">No exercises added yet.</p>}
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initialValues ? 'Save Changes' : 'Log Workout'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
