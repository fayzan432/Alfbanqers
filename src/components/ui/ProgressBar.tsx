import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  colorFrom?: string
  colorTo?: string
  glow?: boolean
  showPercent?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({
  value,
  max,
  label,
  colorFrom = '#8b5cf6',
  colorTo = '#22d3ee',
  glow = true,
  showPercent = false,
  size = 'md',
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5'

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        className={clsx('w-full overflow-hidden rounded-full bg-void-800/80 ring-1 ring-white/5', heightClass)}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', glow && 'animate-glow-pulse')}
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
          }}
        />
      </div>
    </div>
  )
}
