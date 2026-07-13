import { Swords, Dumbbell, Apple, Droplets, Scale, CheckCircle2 } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useProfile } from '@/features/auth/ProfileContext'
import { getLevelProgress, getRankForLevel } from '@/utils/xp'
import { RankBadge } from '@/features/player/RankBadge'
import { MOTIVATIONAL_MESSAGES } from './motivation'

export function DashboardPage() {
  const { profile } = useProfile()
  const progress = getLevelProgress(profile?.total_xp ?? 0)
  const rank = getRankForLevel(progress.level)
  const message = MOTIVATIONAL_MESSAGES[progress.level % MOTIVATIONAL_MESSAGES.length]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">
          Welcome back, <span className="text-glow text-arcane-300">{profile?.display_name ?? 'Adventurer'}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">{message}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="xl:col-span-2">
          <div className="flex items-center gap-4">
            <RankBadge rank={rank} size={64} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Level {progress.level} · {rank.label}</p>
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
          </PanelHeader>
          <EmptyState
            icon={Swords}
            title="No quests yet"
            description="Create your first goal to start earning XP and coins."
          />
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
          </PanelHeader>
          <EmptyState icon={Apple} title="No meals logged" description="Track your calories and macros to see progress here." />
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Water Intake</PanelTitle>
          </PanelHeader>
          <EmptyState icon={Droplets} title="No water logged" description="Log water to build your hydration streak." />
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Latest Weight</PanelTitle>
          </PanelHeader>
          <EmptyState icon={Scale} title="No weight entries" description="Add a weight entry to start your progress chart." />
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Recent Achievements</PanelTitle>
          </PanelHeader>
          <EmptyState icon={CheckCircle2} title="No achievements yet" description="Complete quests and workouts to unlock achievements." />
        </Panel>
      </div>
    </div>
  )
}
