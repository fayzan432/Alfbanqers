import { useEffect, useRef, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAchievementCatalog, useUserAchievements } from './useAchievements'
import { iconForAchievement } from './achievementMeta'
import type { Achievement } from '@/types/database'

export function AchievementUnlockWatcher() {
  const { data: catalog } = useAchievementCatalog()
  const { data: userAchievements } = useUserAchievements()
  const knownIds = useRef<Set<string> | null>(null)
  const [unlocked, setUnlocked] = useState<Achievement | null>(null)

  useEffect(() => {
    if (!userAchievements || !catalog) return
    const currentIds = new Set(userAchievements.map((ua) => ua.achievement_id))

    if (knownIds.current === null) {
      knownIds.current = currentIds
      return
    }

    for (const id of currentIds) {
      if (!knownIds.current.has(id)) {
        const achievement = catalog.find((a) => a.id === id)
        if (achievement) setUnlocked(achievement)
        break
      }
    }
    knownIds.current = currentIds
  }, [userAchievements, catalog])

  if (!unlocked) return null
  const Icon = iconForAchievement(unlocked.icon)

  return (
    <Modal open={Boolean(unlocked)} onClose={() => setUnlocked(null)} title="Achievement Unlocked!" size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="animate-level-burst rounded-full border-2 border-gold-400/50 bg-gold-500/10 p-5">
          <Icon className="size-10 text-gold-400" aria-hidden />
        </div>
        <div>
          <p className="font-display text-xl font-bold text-glow text-gold-400">{unlocked.name}</p>
          <p className="mt-1 text-sm text-slate-400">{unlocked.description}</p>
          <p className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Trophy className="size-3.5" /> +{unlocked.xp_reward} XP · +{unlocked.coin_reward} coins
          </p>
        </div>
        <Button onClick={() => setUnlocked(null)} className="w-full">
          Continue
        </Button>
      </div>
    </Modal>
  )
}
