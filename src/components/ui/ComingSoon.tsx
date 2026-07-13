import type { LucideIcon } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { Panel } from './Panel'

export function ComingSoon({ title, icon: Icon = Sparkles }: { title: string; icon?: LucideIcon }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Panel className="flex flex-col items-center gap-3 py-14 text-center">
        <Icon className="size-10 text-arcane-400" aria-hidden />
        <h1 className="font-display text-xl font-semibold text-slate-100">{title}</h1>
        <p className="max-w-sm text-sm text-slate-400">This chapter of your journey is being forged. Check back soon.</p>
      </Panel>
    </div>
  )
}
