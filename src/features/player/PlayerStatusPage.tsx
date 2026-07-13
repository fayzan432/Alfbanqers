import { Coins, Flame, Scale, Target, Trophy } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useProfile } from '@/features/auth/ProfileContext'
import { getLevelProgress, getRankForLevel } from '@/utils/xp'
import { RankBadge } from './RankBadge'
import { AttributeBars } from './AttributeBars'
import { useGoalCompletions } from '@/features/goals/useGoals'
import { displayWeight } from '@/utils/units'

export function PlayerStatusPage() {
  const { profile } = useProfile()
  const { data: completions } = useGoalCompletions()
  const progress = getLevelProgress(profile?.total_xp ?? 0)
  const rank = getRankForLevel(progress.level)
  const units = profile?.unit_system ?? 'metric'

  if (!profile) return null

  const stats = [
    { label: 'Goals Completed', value: completions?.length ?? 0, icon: Target },
    { label: 'Current Streak', value: `${profile.overall_streak_current}d`, icon: Flame },
    { label: 'Longest Streak', value: `${profile.overall_streak_longest}d`, icon: Trophy },
    { label: 'Coins Earned', value: profile.coins, icon: Coins },
  ]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">Player Status</h1>
        <p className="text-sm text-slate-400">Your character sheet — grown by every action you take.</p>
      </div>

      <Panel>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <RankBadge rank={rank} size={88} />
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-slate-100">{profile.display_name}</h2>
            <p className="text-sm text-arcane-300">
              Level {progress.level} · {rank.label}
            </p>
            <div className="mt-3">
              <ProgressBar value={progress.xpIntoLevel} max={progress.xpForNextLevel} showPercent size="lg" />
              <p className="mt-1 text-xs text-slate-500">
                {progress.xpIntoLevel} / {progress.xpForNextLevel} XP to level {progress.level + 1}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Panel key={stat.label} className="text-center">
            <stat.icon className="mx-auto mb-1 size-5 text-arcane-400" aria-hidden />
            <p className="font-display text-xl font-bold text-slate-100">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader>
            <PanelTitle>Attributes</PanelTitle>
          </PanelHeader>
          <AttributeBars
            attributes={{
              strength: profile.attr_strength,
              endurance: profile.attr_endurance,
              discipline: profile.attr_discipline,
              agility: profile.attr_agility,
              consistency: profile.attr_consistency,
            }}
          />
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Body</PanelTitle>
          </PanelHeader>
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="flex items-center gap-2 text-slate-400">
              <Scale className="size-4" /> Current weight
            </span>
            <span className="font-medium text-slate-100">
              {profile.current_weight_kg ? displayWeight(profile.current_weight_kg, units) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 py-2 text-sm">
            <span className="flex items-center gap-2 text-slate-400">
              <Target className="size-4" /> Target weight
            </span>
            <span className="font-medium text-slate-100">
              {profile.target_weight_kg ? displayWeight(profile.target_weight_kg, units) : '—'}
            </span>
          </div>
        </Panel>
      </div>
    </div>
  )
}
