import { Swords, HeartPulse, ShieldHalf, Wind, Repeat2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ATTRIBUTE_LABELS, type AttributeKey } from '@/utils/attributes'

const ICONS: Record<AttributeKey, LucideIcon> = {
  strength: Swords,
  endurance: HeartPulse,
  discipline: ShieldHalf,
  agility: Wind,
  consistency: Repeat2,
}

const COLORS: Record<AttributeKey, [string, string]> = {
  strength: ['#ef4444', '#f87171'],
  endurance: ['#22d3ee', '#3b82f6'],
  discipline: ['#8b5cf6', '#a78bfa'],
  agility: ['#22c55e', '#4ade80'],
  consistency: ['#fbbf24', '#f59e0b'],
}

/** Attribute display is uncapped; we visualize progress against a soft ceiling that rises with the max value present. */
export function AttributeBars({ attributes }: { attributes: Record<AttributeKey, number> }) {
  const ceiling = Math.max(50, ...Object.values(attributes).map((v) => Math.ceil((v + 1) / 25) * 25))

  return (
    <div className="flex flex-col gap-4">
      {(Object.keys(ATTRIBUTE_LABELS) as AttributeKey[]).map((key) => {
        const Icon = ICONS[key]
        const [from, to] = COLORS[key]
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Icon className="size-4" style={{ color: from }} aria-hidden />
                {ATTRIBUTE_LABELS[key]}
              </span>
              <span className="text-slate-400">{attributes[key]}</span>
            </div>
            <ProgressBar value={attributes[key]} max={ceiling} colorFrom={from} colorTo={to} glow={false} />
          </div>
        )
      })}
    </div>
  )
}
