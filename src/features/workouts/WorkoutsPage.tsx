import { useMemo, useState } from 'react'
import { Dumbbell, Plus, Trophy, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastContext'
import { WorkoutCard } from './WorkoutCard'
import { WorkoutFormModal } from './WorkoutFormModal'
import { WORKOUT_TYPE_META } from './workoutMeta'
import {
  useCompleteWorkout,
  useCreateWorkout,
  useCreateWorkoutTemplate,
  useDeleteWorkout,
  useDeleteWorkoutTemplate,
  useDuplicateWorkout,
  usePersonalRecords,
  useWorkoutTemplates,
  useWorkouts,
} from './useWorkouts'
import { listExercisesForWorkout, listSetsForExercises } from '@/services/workoutService'
import type { WorkoutFormValues } from './schema'
import type { WorkoutInput, WorkoutExerciseInput } from '@/services/workoutService'
import type { Workout } from '@/types/database'
import { LevelUpModal, type LevelUpEvent } from '@/features/player/LevelUpModal'
import { localDateKey } from '@/utils/date'

type Tab = 'log' | 'templates' | 'records'

function toWorkoutInput(values: WorkoutFormValues): { workout: WorkoutInput; exercises: WorkoutExerciseInput[] } {
  const workout: WorkoutInput = {
    name: values.name,
    workout_type: values.workoutType,
    date: values.date,
    start_time: values.startTime || null,
    duration_minutes: values.durationMinutes,
    calories_burned: values.caloriesBurned ?? null,
    distance_km: values.distanceKm ?? null,
    notes: values.notes || null,
    difficulty: values.difficulty ?? null,
  }
  const exercises: WorkoutExerciseInput[] = (values.exercises ?? []).map((ex, index) => ({
    exercise_name: ex.exerciseName,
    muscle_group: ex.muscleGroup || null,
    order_index: index,
    rest_seconds: ex.restSeconds ?? null,
    notes: null,
    sets: ex.sets.map((s, i) => ({ set_number: i + 1, reps: s.reps ?? null, weight_kg: s.weightKg ?? null, completed: false })),
  }))
  return { workout, exercises }
}

export function WorkoutsPage() {
  const { data: workouts, isLoading } = useWorkouts()
  const { data: templates } = useWorkoutTemplates()
  const { data: records } = usePersonalRecords()
  const { showToast } = useToast()

  const [tab, setTab] = useState<Tab>('log')
  const [formOpen, setFormOpen] = useState(false)
  const [templatePrefill, setTemplatePrefill] = useState<WorkoutFormValues | null>(null)
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null)
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null)

  const createWorkout = useCreateWorkout()
  const deleteWorkout = useDeleteWorkout()
  const duplicateWorkout = useDuplicateWorkout()
  const completeWorkout = useCompleteWorkout()
  const createTemplate = useCreateWorkoutTemplate()
  const deleteTemplate = useDeleteWorkoutTemplate()

  const sortedWorkouts = useMemo(() => workouts ?? [], [workouts])

  const handleCreate = async (values: WorkoutFormValues) => {
    const { workout, exercises } = toWorkoutInput(values)
    try {
      await createWorkout.mutateAsync({ workout, exercises })
      showToast('Workout logged.', 'success')
      setFormOpen(false)
      setTemplatePrefill(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save workout.', 'error')
    }
  }

  const handleComplete = async (workout: Workout) => {
    try {
      const result = await completeWorkout.mutateAsync(workout.id)
      showToast(`+${result.xpAwarded} XP · +${result.coinsAwarded} coins`, 'success')
      if (result.leveledUp) {
        setLevelUpEvent({
          oldLevel: result.oldLevel,
          newLevel: result.newLevel,
          rankChanged: result.rankChanged,
          oldRank: result.oldRank,
          newRank: result.newRank,
        })
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not complete workout.', 'error')
    }
  }

  const handleDuplicate = async (workout: Workout) => {
    try {
      await duplicateWorkout.mutateAsync(workout)
      showToast('Workout duplicated for today.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to duplicate workout.', 'error')
    }
  }

  const handleSaveAsTemplate = async (workout: Workout) => {
    try {
      const exercises = await listExercisesForWorkout(workout.id)
      const sets = await listSetsForExercises(exercises.map((e) => e.id))
      const data = {
        exercises: exercises.map((ex) => ({
          exerciseName: ex.exercise_name,
          muscleGroup: ex.muscle_group,
          restSeconds: ex.rest_seconds,
          sets: sets.filter((s) => s.workout_exercise_id === ex.id).map((s) => ({ reps: s.reps, weightKg: s.weight_kg })),
        })),
      }
      await createTemplate.mutateAsync({ name: workout.name, workoutType: workout.workout_type, data })
      showToast('Saved as template.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save template.', 'error')
    }
  }

  const handleUseTemplate = (template: NonNullable<typeof templates>[number]) => {
    const data = template.data as { exercises?: WorkoutFormValues['exercises'] }
    setTemplatePrefill({
      name: template.name,
      workoutType: template.workout_type,
      date: localDateKey(),
      startTime: '',
      durationMinutes: 30,
      notes: '',
      difficulty: 'medium',
      exercises: data.exercises ?? [],
    })
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingWorkout) return
    try {
      await deleteWorkout.mutateAsync(deletingWorkout.id)
      showToast('Workout deleted.', 'success')
    } finally {
      setDeletingWorkout(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Training Grounds</h1>
          <p className="text-sm text-slate-400">Log workouts to build Strength, Endurance, and Agility.</p>
        </div>
        <Button
          onClick={() => {
            setTemplatePrefill(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" /> Log Workout
        </Button>
      </div>

      <div className="flex gap-2 border-b border-white/5">
        {(
          [
            { key: 'log', label: 'History', icon: Dumbbell },
            { key: 'templates', label: 'Templates', icon: LayoutTemplate },
            { key: 'records', label: 'Personal Records', icon: Trophy },
          ] as { key: Tab; label: string; icon: typeof Dumbbell }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-arcane-500 text-arcane-300' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'log' &&
        (isLoading ? (
          <Spinner label="Loading workouts..." />
        ) : sortedWorkouts.length === 0 ? (
          <EmptyState icon={Dumbbell} title="No workouts logged" description="Log your first workout to start building strength." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sortedWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onComplete={handleComplete}
                onDelete={setDeletingWorkout}
                onDuplicate={handleDuplicate}
                onSaveAsTemplate={handleSaveAsTemplate}
                completing={completeWorkout.isPending}
              />
            ))}
          </div>
        ))}

      {tab === 'templates' &&
        (!templates || templates.length === 0 ? (
          <EmptyState
            icon={LayoutTemplate}
            title="No templates yet"
            description="Save any logged workout as a template from its card menu to reuse it later."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {templates.map((template) => (
              <Panel key={template.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-slate-100">{template.name}</h3>
                  <span className="text-xs text-slate-500">{WORKOUT_TYPE_META[template.workout_type].label}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUseTemplate(template)}>
                    Use Template
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteTemplate.mutate(template.id)}>
                    Delete
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
        ))}

      {tab === 'records' &&
        (!records || records.length === 0 ? (
          <EmptyState icon={Trophy} title="No personal records yet" description="Log strength workouts with sets to track your best lifts." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {records.map((record) => (
              <Panel key={record.exerciseName} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">{record.exerciseName}</span>
                <span className="text-xs text-gold-400">
                  {record.maxWeightKg}kg × best · {record.maxReps} reps best
                </span>
              </Panel>
            ))}
          </div>
        ))}

      <WorkoutFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setTemplatePrefill(null)
        }}
        onSubmit={handleCreate}
        submitting={createWorkout.isPending}
        initialValues={templatePrefill}
      />

      <ConfirmDialog
        open={Boolean(deletingWorkout)}
        title="Delete Workout"
        message={`Are you sure you want to delete "${deletingWorkout?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleteWorkout.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingWorkout(null)}
      />

      <LevelUpModal event={levelUpEvent} onClose={() => setLevelUpEvent(null)} />
    </div>
  )
}
