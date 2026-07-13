import { useState } from 'react'
import { CheckCircle2, Trash2, Copy, ChevronDown, ChevronUp, BookmarkPlus } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { WORKOUT_TYPE_META } from './workoutMeta'
import { useWorkoutDetail } from './useWorkouts'
import { formatDisplayDate } from '@/utils/date'
import type { Workout } from '@/types/database'

interface WorkoutCardProps {
  workout: Workout
  onComplete: (workout: Workout) => void
  onDelete: (workout: Workout) => void
  onDuplicate: (workout: Workout) => void
  onSaveAsTemplate: (workout: Workout) => void
  completing?: boolean
}

export function WorkoutCard({ workout, onComplete, onDelete, onDuplicate, onSaveAsTemplate, completing }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false)
  const meta = WORKOUT_TYPE_META[workout.workout_type]
  const Icon = meta.icon
  const { data: detail } = useWorkoutDetail(expanded && workout.workout_type === 'strength' ? workout.id : null)

  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-lg bg-arcane-500/10 p-2">
            <Icon className="size-4 text-arcane-400" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-slate-100">{workout.name}</h3>
            <p className="text-xs text-slate-500">
              {meta.label} · {formatDisplayDate(workout.date)} · {workout.duration_minutes} min
            </p>
          </div>
        </div>
        {workout.completed && (
          <span className="shrink-0 rounded-full border border-verdant-500/40 bg-verdant-500/10 px-2 py-0.5 text-[11px] font-medium text-verdant-500">
            Completed
          </span>
        )}
      </div>

      {(workout.calories_burned || workout.distance_km) && (
        <div className="flex gap-4 text-xs text-slate-500">
          {workout.calories_burned && <span>{workout.calories_burned} kcal (est.)</span>}
          {workout.distance_km && <span>{workout.distance_km} km</span>}
        </div>
      )}

      {workout.notes && <p className="text-xs text-slate-400">{workout.notes}</p>}

      {workout.workout_type === 'strength' && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 self-start text-xs font-medium text-arcane-400 hover:text-arcane-300"
        >
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          {expanded ? 'Hide exercises' : 'Show exercises'}
        </button>
      )}

      {expanded && detail && (
        <div className="flex flex-col gap-2 border-t border-white/5 pt-2">
          {detail.exercises.map((exercise) => {
            const sets = detail.sets.filter((s) => s.workout_exercise_id === exercise.id)
            return (
              <div key={exercise.id} className="text-xs">
                <p className="font-medium text-slate-300">
                  {exercise.exercise_name} {exercise.muscle_group && <span className="text-slate-500">· {exercise.muscle_group}</span>}
                </p>
                <p className="text-slate-500">
                  {sets.map((s) => `${s.reps ?? '-'}×${s.weight_kg ?? '-'}kg`).join(', ') || 'No sets recorded'}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onComplete(workout)} disabled={workout.completed} loading={completing}>
          <CheckCircle2 className="size-4" /> {workout.completed ? 'Completed' : 'Complete'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDuplicate(workout)}>
          <Copy className="size-3.5" /> Duplicate
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onSaveAsTemplate(workout)}>
          <BookmarkPlus className="size-3.5" /> Save Template
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(workout)}>
          <Trash2 className="size-3.5 text-ember-500" />
        </Button>
      </div>
    </Panel>
  )
}
