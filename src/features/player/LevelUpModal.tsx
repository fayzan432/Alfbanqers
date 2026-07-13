import { Sparkles } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { RankBadge } from './RankBadge'
import { getRankForLevel } from '@/utils/xp'

export interface LevelUpEvent {
  oldLevel: number
  newLevel: number
  rankChanged: boolean
  oldRank: string
  newRank: string
}

export function LevelUpModal({ event, onClose }: { event: LevelUpEvent | null; onClose: () => void }) {
  if (!event) return null
  const rank = getRankForLevel(event.newLevel)

  return (
    <Modal open={Boolean(event)} onClose={onClose} title={event.rankChanged ? 'Rank Ascension!' : 'Level Up!'} size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="animate-level-burst">
          <RankBadge rank={rank} size={96} />
        </div>
        <div>
          <p className="flex items-center justify-center gap-1.5 font-display text-2xl font-bold text-glow text-arcane-300">
            <Sparkles className="size-5 text-gold-400" /> Level {event.newLevel}
          </p>
          {event.rankChanged && (
            <p className="mt-1 text-sm text-gold-400">
              Promoted from {event.oldRank} Rank to {event.newRank} Rank!
            </p>
          )}
        </div>
        <Button onClick={onClose} className="w-full">
          Continue Your Ascension
        </Button>
      </div>
    </Modal>
  )
}
