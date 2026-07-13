import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextInput, Select, TextArea } from '@/components/ui/Input'
import { goalFormSchema, rewardsForDifficulty, type GoalFormValues } from './schema'
import { CATEGORY_META, DIFFICULTY_META, REPETITION_LABELS, PROGRESS_TYPE_LABELS, WEEKDAY_LABELS } from './goalMeta'
import type { Goal } from '@/types/database'

interface GoalFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: GoalFormValues) => Promise<void>
  initialGoal?: Goal | null
  submitting?: boolean
}

const DEFAULTS: GoalFormValues = {
  title: '',
  description: '',
  category: 'personal',
  difficulty: 'easy',
  deadline: '',
  repetition: 'one_time',
  repetitionWeekdays: [],
  repetitionIntervalDays: undefined,
  reminderEnabled: false,
  progressType: 'checkbox',
  targetValue: 1,
}

export function GoalFormModal({ open, onClose, onSubmit, initialGoal, submitting }: GoalFormModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({ resolver: zodResolver(goalFormSchema), defaultValues: DEFAULTS })

  useEffect(() => {
    if (!open) return
    if (initialGoal) {
      reset({
        title: initialGoal.title,
        description: initialGoal.description ?? '',
        category: initialGoal.category,
        difficulty: initialGoal.difficulty,
        deadline: initialGoal.deadline ? initialGoal.deadline.slice(0, 10) : '',
        repetition: initialGoal.repetition,
        repetitionWeekdays: initialGoal.repetition_weekdays ?? [],
        repetitionIntervalDays: initialGoal.repetition_interval_days ?? undefined,
        reminderEnabled: initialGoal.reminder_enabled,
        progressType: initialGoal.progress_type,
        targetValue: initialGoal.target_value,
      })
    } else {
      reset(DEFAULTS)
    }
  }, [open, initialGoal, reset])

  const values = watch()
  const reward = rewardsForDifficulty(values.difficulty)

  const submit = async (data: GoalFormValues) => {
    await onSubmit(data)
  }

  return (
    <Modal open={open} onClose={onClose} title={initialGoal ? 'Edit Quest' : 'New Quest'} size="lg">
      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        <TextInput id="title" label="Title" error={errors.title?.message} {...register('title')} />
        <TextArea id="description" label="Description (optional)" error={errors.description?.message} {...register('description')} />

        <div className="grid grid-cols-2 gap-3">
          <Select id="category" label="Category" error={errors.category?.message} {...register('category')}>
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </Select>
          <Select id="difficulty" label="Difficulty" error={errors.difficulty?.message} {...register('difficulty')}>
            {Object.entries(DIFFICULTY_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-xs text-slate-500">
          Reward: <span className="text-arcane-300">{reward.xp} XP</span> · <span className="text-gold-400">{reward.coins} coins</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Select id="repetition" label="Repetition" error={errors.repetition?.message} {...register('repetition')}>
            {Object.entries(REPETITION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <TextInput id="deadline" type="date" label="Deadline (optional)" error={errors.deadline?.message} {...register('deadline')} />
        </div>

        {values.repetition === 'weekdays' && (
          <Controller
            control={control}
            name="repetitionWeekdays"
            render={({ field }) => (
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-300">Active weekdays</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((label, index) => {
                    const active = field.value?.includes(index)
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const current = field.value ?? []
                          field.onChange(active ? current.filter((d) => d !== index) : [...current, index])
                        }}
                        className={clsx(
                          'rounded-lg border px-3 py-1.5 text-xs font-medium',
                          active ? 'border-arcane-500 bg-arcane-500/20 text-arcane-300' : 'border-white/10 text-slate-400',
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                {errors.repetitionWeekdays && <p className="mt-1 text-xs text-ember-500">{errors.repetitionWeekdays.message}</p>}
              </div>
            )}
          />
        )}

        {values.repetition === 'custom_interval' && (
          <TextInput
            id="repetitionIntervalDays"
            type="number"
            label="Repeat every N days"
            error={errors.repetitionIntervalDays?.message}
            {...register('repetitionIntervalDays', { valueAsNumber: true })}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Select id="progressType" label="Progress type" error={errors.progressType?.message} {...register('progressType')}>
            {Object.entries(PROGRESS_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          {values.progressType !== 'checkbox' && (
            <TextInput
              id="targetValue"
              type="number"
              step="0.1"
              label="Target value"
              error={errors.targetValue?.message}
              {...register('targetValue', { valueAsNumber: true })}
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" className="size-4 rounded border-white/20 bg-void-800" {...register('reminderEnabled')} />
          Enable a reminder for this quest
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initialGoal ? 'Save Changes' : 'Create Quest'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
