import { Lock, Trophy } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Spinner } from '@/components/ui/Spinner'
import { useAchievementCatalog, useUserAchievements } from './useAchievements'
import { iconForAchievement } from './achievementMeta'
import { formatDisplayDate, localDateKeyFromISO } from '@/utils/date'

export function AchievementsPage() {
  const { data: catalog, isLoading } = useAchievementCatalog()
  const { data: unlocked } = useUserAchievements()

  const unlockedMap = new Map((unlocked ?? []).map((ua) => [ua.achievement_id, ua.unlocked_at]))

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">Hall of Achievements</h1>
        <p className="text-sm text-slate-400">
          {unlocked?.length ?? 0} of {catalog?.length ?? 0} achievements unlocked
        </p>
      </div>

      {isLoading ? (
        <Spinner label="Loading achievements..." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(catalog ?? []).map((achievement) => {
            const unlockedAt = unlockedMap.get(achievement.id)
            const isUnlocked = Boolean(unlockedAt)
            const Icon = iconForAchievement(achievement.icon)
            return (
              <Panel key={achievement.id} className={`flex flex-col items-center gap-2 text-center ${!isUnlocked ? 'opacity-50' : ''}`}>
                <div className={`rounded-full p-4 ${isUnlocked ? 'bg-gold-500/10 border border-gold-400/40' : 'bg-void-700 border border-white/10'}`}>
                  {isUnlocked ? (
                    <Icon className="size-8 text-gold-400" aria-hidden />
                  ) : (
                    <Lock className="size-8 text-slate-600" aria-hidden />
                  )}
                </div>
                <h3 className="font-display text-sm font-semibold text-slate-100">{achievement.name}</h3>
                <p className="text-xs text-slate-500">{achievement.description}</p>
                <p className="text-[11px] text-arcane-400">
                  +{achievement.xp_reward} XP · +{achievement.coin_reward} coins
                </p>
                {isUnlocked && unlockedAt && (
                  <p className="text-[11px] text-slate-600">Unlocked {formatDisplayDate(localDateKeyFromISO(unlockedAt))}</p>
                )}
              </Panel>
            )
          })}
        </div>
      )}

      {catalog && catalog.length === 0 && !isLoading && (
        <Panel className="flex flex-col items-center gap-2 py-10 text-center">
          <Trophy className="size-8 text-slate-600" />
          <p className="text-sm text-slate-500">No achievements configured yet.</p>
        </Panel>
      )}
    </div>
  )
}
