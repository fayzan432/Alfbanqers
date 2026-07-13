import { useState } from 'react'
import { clsx } from 'clsx'
import { CheckCircle2, Pencil, Trash2, Archive, ArchiveRestore, Plus } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CATEGORY_META, DIFFICULTY_META, REPETITION_LABELS } from './goalMeta'
import type { Goal } from '@/types/database'
import { formatDisplayDate } from '@/utils/date'

interface GoalCardProps {
  goal: Goal
  completedThisPeriod: boolean
  onComplete: (goal: Goal) => void
  onEdit: (goal: Goal) => void
  onDelete: (goal: Goal) => void
  onArchiveToggle: (goal: Goal) => void
  onAddProgress: (goal: Goal, amount: number) => void
  completing?: boolean
}

export function GoalCard({
  goal,
  completedThisPeriod,
  onComplete,
  onEdit,
  onDelete,
  onArchiveToggle,
  onAddProgress,
  completing,
}: GoalCardProps) {
  const [progressInput, setProgressInput] = useState('')
  const category = CATEGORY_META[goal.category]
  const difficulty = DIFFICULTY_META[goal.difficulty]
  const CategoryIcon = category.icon
  const isCheckbox = goal.progress_type === 'checkbox'
  const canClaim = isCheckbox ? !completedThisPeriod : goal.current_progress >= goal.target_value && !completedThisPeriod
  const isArchived = goal.status === 'archived'
  const isOneTimeDone = goal.repetition === 'one_time' && goal.status === 'completed'

  return (
    <Panel className={clsx('flex flex-col gap-3', isArchived && 'opacity-60')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-lg bg-arcane-500/10 p-2">
            <CategoryIcon className="size-4 text-arcane-400" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-slate-100">{goal.title}</h3>
            {goal.description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{goal.description}</p>}
          </div>
        </div>
        <span className={clsx('shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium', difficulty.className)}>
          {difficulty.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <span>{REPETITION_LABELS[goal.repetition]}</span>
        {goal.deadline && <span>· Due {formatDisplayDate(goal.deadline.slice(0, 10))}</span>}
        <span>· {goal.xp_reward} XP</span>
        <span>· {goal.coin_reward} coins</span>
      </div>

      {!isCheckbox && (
        <div>
          <ProgressBar value={goal.current_progress} max={goal.target_value} showPercent size="sm" />
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              min={0}
              step="0.1"
              value={progressInput}
              onChange={(e) => setProgressInput(e.target.value)}
              placeholder="Add progress"
              aria-label="Add progress amount"
              className="w-24 rounded-lg border border-white/10 bg-void-800/80 px-2 py-1.5 text-xs text-slate-100"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!progressInput || Number(progressInput) <= 0 || isArchived}
              onClick={() => {
                onAddProgress(goal, Number(progressInput))
                setProgressInput('')
              }}
            >
              <Plus className="size-3.5" /> Add
            </Button>
          </div>
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onComplete(goal)} disabled={!canClaim || isArchived} loading={completing}>
          <CheckCircle2 className="size-4" />
          {completedThisPeriod || isOneTimeDone ? 'Completed' : 'Claim Reward'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(goal)}>
          <Pencil className="size-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onArchiveToggle(goal)}>
          {isArchived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(goal)}>
          <Trash2 className="size-3.5 text-ember-500" />
        </Button>
      </div>
    </Panel>
  )
}
