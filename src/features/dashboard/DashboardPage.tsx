import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Swords, Dumbbell, Apple, Droplets, Scale, CheckCircle2, Plus, CheckCircle } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { getLevelProgress, getRankForLevel } from '@/utils/xp'
import { RankBadge } from '@/features/player/RankBadge'
import { LevelUpModal, type LevelUpEvent } from '@/features/player/LevelUpModal'
import { MOTIVATIONAL_MESSAGES } from './motivation'
import { useCompleteGoal, useCompletionStatusMap, useGoalCompletions, useGoals } from '@/features/goals/useGoals'
import { CATEGORY_META, DIFFICULTY_META } from '@/features/goals/goalMeta'
import { useFoodEntries } from '@/features/nutrition/useNutrition'
import { useWaterEntries } from '@/features/water/useWater'
import { useWeightEntries } from '@/features/weight/useWeight'
import { localDateKey, formatDisplayDate } from '@/utils/date'
import { displayVolume, displayWeight } from '@/utils/units'

export function DashboardPage() {
  const { profile } = useProfile()
  const progress = getLevelProgress(profile?.total_xp ?? 0)
  const rank = getRankForLevel(progress.level)
  const message = MOTIVATIONAL_MESSAGES[progress.level % MOTIVATIONAL_MESSAGES.length]
  const { showToast } = useToast()
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null)

  const { data: goals } = useGoals()
  const { data: completions } = useGoalCompletions()
  const completionMap = useCompletionStatusMap(goals, completions)
  const completeGoal = useCompleteGoal()

  const activeGoals = (goals ?? []).filter((g) => g.status === 'active')
  const pendingToday = activeGoals.filter((g) => !completionMap.get(g.id))
  const completedToday = activeGoals.filter((g) => completionMap.get(g.id))

  const today = localDateKey()
  const units = profile?.unit_system ?? 'metric'
  const { data: foodEntries } = useFoodEntries(today)
  const { data: waterEntries } = useWaterEntries(today)
  const { data: weightEntries } = useWeightEntries()

  const caloriesConsumed = (foodEntries ?? []).reduce((sum, e) => sum + Number(e.calories), 0)
  const waterConsumed = (waterEntries ?? []).reduce((sum, e) => sum + e.amount_ml, 0)
  const latestWeight = weightEntries?.[0]

  const handleComplete = async (goalId: string) => {
    const goal = activeGoals.find((g) => g.id === goalId)
    if (!goal) return
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

  const quickActions = [
    { to: '/goals', label: 'Add Goal', icon: Swords },
    { to: '/workouts', label: 'Add Workout', icon: Dumbbell },
    { to: '/nutrition', label: 'Add Food', icon: Apple },
    { to: '/water', label: 'Add Water', icon: Droplets },
    { to: '/weight', label: 'Add Weight', icon: Scale },
  ]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">
          Welcome back, <span className="text-glow text-arcane-300">{profile?.display_name ?? 'Adventurer'}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">{message}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to}>
            <Button size="sm" variant="secondary">
              <action.icon className="size-4" /> {action.label}
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="xl:col-span-2">
          <div className="flex items-center gap-4">
            <RankBadge rank={rank} size={64} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Level {progress.level} · {rank.label}
              </p>
              <ProgressBar value={progress.xpIntoLevel} max={progress.xpForNextLevel} showPercent size="lg" />
              <p className="mt-1 text-xs text-slate-500">
                {progress.xpIntoLevel} / {progress.xpForNextLevel} XP to next level
              </p>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Streak</PanelTitle>
          </PanelHeader>
          <p className="font-display text-3xl font-bold text-gold-400">{profile?.overall_streak_current ?? 0}</p>
          <p className="text-xs text-slate-500">days active · longest {profile?.overall_streak_longest ?? 0}</p>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Ascension Coins</PanelTitle>
          </PanelHeader>
          <p className="font-display text-3xl font-bold text-gold-400">{profile?.coins ?? 0}</p>
          <p className="text-xs text-slate-500">spend them in Rewards</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader>
            <PanelTitle>Today's Quests</PanelTitle>
            <Link to="/goals" className="text-xs font-medium text-arcane-400 hover:text-arcane-300">
              View all
            </Link>
          </PanelHeader>
          {pendingToday.length === 0 ? (
            <EmptyState
              icon={Swords}
              title={activeGoals.length === 0 ? 'No quests yet' : 'All quests complete!'}
              description={activeGoals.length === 0 ? 'Create your first goal to start earning XP and coins.' : 'Great work today, adventurer.'}
              action={
                activeGoals.length === 0 && (
                  <Link to="/goals">
                    <Button size="sm">
                      <Plus className="size-4" /> New Quest
                    </Button>
                  </Link>
                )
              }
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {pendingToday.slice(0, 5).map((goal) => {
                const Icon = CATEGORY_META[goal.category].icon
                return (
                  <li key={goal.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-void-800/50 px-3 py-2">
                    <Icon className="size-4 shrink-0 text-arcane-400" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{goal.title}</span>
                    <span className={`shrink-0 text-[11px] ${DIFFICULTY_META[goal.difficulty].className} rounded-full border px-2 py-0.5`}>
                      {DIFFICULTY_META[goal.difficulty].label}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleComplete(goal.id)} aria-label={`Complete ${goal.title}`}>
                      <CheckCircle className="size-4 text-verdant-500" />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Completed Today</PanelTitle>
          </PanelHeader>
          {completedToday.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nothing completed yet" description="Claimed quests will appear here." />
          ) : (
            <ul className="flex flex-col gap-2">
              {completedToday.slice(0, 5).map((goal) => (
                <li key={goal.id} className="flex items-center gap-3 rounded-lg border border-verdant-500/20 bg-verdant-500/5 px-3 py-2">
                  <CheckCircle2 className="size-4 shrink-0 text-verdant-500" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300 line-through decoration-slate-600">{goal.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Today's Workout</PanelTitle>
          </PanelHeader>
          <EmptyState icon={Dumbbell} title="No workout logged" description="Log a workout to build your Strength and Endurance." />
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Nutrition</PanelTitle>
            <Link to="/nutrition" className="text-xs font-medium text-arcane-400 hover:text-arcane-300">
              Log food
            </Link>
          </PanelHeader>
          {!foodEntries || foodEntries.length === 0 ? (
            <EmptyState icon={Apple} title="No meals logged" description="Track your calories and macros to see progress here." />
          ) : (
            <ProgressBar
              label={`${Math.round(caloriesConsumed)} / ${profile?.daily_calorie_goal ?? 0} kcal`}
              value={caloriesConsumed}
              max={profile?.daily_calorie_goal ?? 1}
              colorFrom="#22c55e"
              colorTo="#4ade80"
              showPercent
            />
          )}
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Water Intake</PanelTitle>
            <Link to="/water" className="text-xs font-medium text-arcane-400 hover:text-arcane-300">
              Log water
            </Link>
          </PanelHeader>
          {!waterEntries || waterEntries.length === 0 ? (
            <EmptyState icon={Droplets} title="No water logged" description="Log water to build your hydration streak." />
          ) : (
            <ProgressBar
              label={`${displayVolume(waterConsumed, units)} / ${displayVolume(profile?.daily_water_goal_ml ?? 0, units)}`}
              value={waterConsumed}
              max={profile?.daily_water_goal_ml ?? 1}
              colorFrom="#3b82f6"
              colorTo="#22d3ee"
              showPercent
            />
          )}
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Latest Weight</PanelTitle>
            <Link to="/weight" className="text-xs font-medium text-arcane-400 hover:text-arcane-300">
              Update
            </Link>
          </PanelHeader>
          {!latestWeight ? (
            <EmptyState icon={Scale} title="No weight entries" description="Add a weight entry to start your progress chart." />
          ) : (
            <div>
              <p className="font-display text-2xl font-bold text-slate-100">{displayWeight(latestWeight.weight_kg, units)}</p>
              <p className="text-xs text-slate-500">on {formatDisplayDate(latestWeight.date)}</p>
            </div>
          )}
        </Panel>
      </div>

      <LevelUpModal event={levelUpEvent} onClose={() => setLevelUpEvent(null)} />
    </div>
  )
}
