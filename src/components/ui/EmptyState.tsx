import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 px-6 py-10 text-center">
      <div className="rounded-full bg-arcane-500/10 p-3">
        <Icon className="size-6 text-arcane-400" aria-hidden />
      </div>
      <h3 className="font-display text-base font-semibold text-slate-100">{title}</h3>
      {description && <p className="max-w-xs text-sm text-slate-400">{description}</p>}
      {action}
    </div>
  )
}
