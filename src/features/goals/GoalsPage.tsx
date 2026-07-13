import { useMemo, useState } from 'react'
import { Plus, Swords } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastContext'
import { GoalCard } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import {
  useAddGoalProgress,
  useArchiveGoal,
  useCompleteGoal,
  useCompletionStatusMap,
  useCreateGoal,
  useDeleteGoal,
  useGoalCompletions,
  useGoals,
  useUpdateGoal,
} from './useGoals'
import type { GoalFormValues } from './schema'
import type { CreateGoalInput } from '@/services/goalService'
import type { Goal } from '@/types/database'
import { LevelUpModal, type LevelUpEvent } from '@/features/player/LevelUpModal'

type Tab = 'active' | 'completed' | 'archived'

function toCreateInput(values: GoalFormValues): CreateGoalInput {
  const rewardMap = { easy: [10, 5], medium: [25, 12], hard: [50, 25], elite: [100, 50] } as const
  const [xp, coins] = rewardMap[values.difficulty]
  return {
    title: values.title,
    description: values.description || null,
    category: values.category,
    difficulty: values.difficulty,
    xp_reward: xp,
    coin_reward: coins,
    deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
    repetition: values.repetition,
    repetition_weekdays: values.repetition === 'weekdays' ? values.repetitionWeekdays ?? [] : null,
    repetition_interval_days: values.repetition === 'custom_interval' ? values.repetitionIntervalDays ?? null : null,
    reminder_enabled: values.reminderEnabled,
    progress_type: values.progressType,
    target_value: values.progressType === 'checkbox' ? 1 : values.targetValue,
  }
}

export function GoalsPage() {
  const { data: goals, isLoading } = useGoals()
  const { data: completions } = useGoalCompletions()
  const completionMap = useCompletionStatusMap(goals, completions)
  const { showToast } = useToast()

  const [tab, setTab] = useState<Tab>('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null)
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null)

  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const archiveGoal = useArchiveGoal()
  const addProgress = useAddGoalProgress()
  const completeGoal = useCompleteGoal()

  const filteredGoals = useMemo(() => {
    if (!goals) return []
    return goals.filter((g) => g.status === tab || (tab === 'active' && g.status === 'active'))
  }, [goals, tab])

  const handleSubmit = async (values: GoalFormValues) => {
    const input = toCreateInput(values)
    try {
      if (editingGoal) {
        await updateGoal.mutateAsync({ goalId: editingGoal.id, patch: input })
        showToast('Quest updated.', 'success')
      } else {
        await createGoal.mutateAsync(input)
        showToast('New quest added to your log.', 'success')
      }
      setFormOpen(false)
      setEditingGoal(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save quest.', 'error')
    }
  }

  const handleComplete = async (goal: Goal) => {
    try {
      const result = await completeGoal.mutateAsync(goal)
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
      showToast(err instanceof Error ? err.message : 'Could not complete quest.', 'error')
    }
  }

  const handleAddProgress = async (goal: Goal, amount: number) => {
    try {
      await addProgress.mutateAsync({ goalId: goal.id, value: goal.current_progress + amount })
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update progress.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deletingGoal) return
    try {
      await deleteGoal.mutateAsync(deletingGoal.id)
      showToast('Quest deleted.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete quest.', 'error')
    } finally {
      setDeletingGoal(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Quest Log</h1>
          <p className="text-sm text-slate-400">Complete quests to earn XP, coins, and grow your attributes.</p>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" /> New Quest
        </Button>
      </div>

      <div className="flex gap-2 border-b border-white/5">
        {(['active', 'completed', 'archived'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'border-arcane-500 text-arcane-300' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner label="Loading quests..." />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Swords}
          title={`No ${tab} quests`}
          description={tab === 'active' ? 'Create your first quest to begin earning rewards.' : undefined}
          action={
            tab === 'active' && (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="size-4" /> New Quest
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              completedThisPeriod={completionMap.get(goal.id) ?? false}
              completing={completeGoal.isPending}
              onComplete={handleComplete}
              onAddProgress={handleAddProgress}
              onEdit={(g) => {
                setEditingGoal(g)
                setFormOpen(true)
              }}
              onDelete={setDeletingGoal}
              onArchiveToggle={(g) => archiveGoal.mutate({ goalId: g.id, archived: g.status === 'archived' })}
            />
          ))}
        </div>
      )}

      <GoalFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingGoal(null)
        }}
        onSubmit={handleSubmit}
        initialGoal={editingGoal}
        submitting={createGoal.isPending || updateGoal.isPending}
      />

      <ConfirmDialog
        open={Boolean(deletingGoal)}
        title="Delete Quest"
        message={`Are you sure you want to delete "${deletingGoal?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteGoal.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingGoal(null)}
      />

      <LevelUpModal event={levelUpEvent} onClose={() => setLevelUpEvent(null)} />
    </div>
  )
}
