import { Loader2 } from 'lucide-react'

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400" role="status" aria-live="polite">
      <Loader2 className="size-8 animate-spin text-arcane-400" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  )
}
