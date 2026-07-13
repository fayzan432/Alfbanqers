import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-void-950 px-6 text-center">
      <Compass className="size-12 text-arcane-400" aria-hidden />
      <h1 className="font-display text-2xl font-semibold text-slate-100">Uncharted Territory</h1>
      <p className="max-w-sm text-sm text-slate-400">This path does not exist in the realm. Return to familiar ground.</p>
      <Link to="/dashboard">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  )
}
