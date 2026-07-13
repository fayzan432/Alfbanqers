import { clsx } from 'clsx'

const SIZES = {
  sm: { svg: 28, title: 'text-lg', sub: 'hidden' },
  md: { svg: 36, title: 'text-xl', sub: 'text-[10px]' },
  lg: { svg: 56, title: 'text-3xl', sub: 'text-xs' },
} as const

export function Logo({ size = 'md', showSubtitle = true }: { size?: keyof typeof SIZES; showSubtitle?: boolean }) {
  const cfg = SIZES[size]
  return (
    <div className="flex items-center gap-3">
      <svg width={cfg.svg} height={cfg.svg} viewBox="0 0 64 64" fill="none" aria-hidden>
        <defs>
          <linearGradient id="lu-ring" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="29" stroke="url(#lu-ring)" strokeWidth="3" fill="#0a0a14" />
        <circle cx="32" cy="32" r="23" stroke="url(#lu-ring)" strokeWidth="1" opacity="0.35" fill="none" />
        <path
          d="M22 20 L22 40 L34 40"
          stroke="url(#lu-ring)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M34 44 L44 24 M44 24 L38 24 M44 24 L44 30"
          stroke="url(#lu-ring)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div className="flex flex-col leading-tight text-left">
        <span className={clsx('font-display font-bold tracking-wide text-slate-100 text-glow', cfg.title)}>LEVEL UP</span>
        {showSubtitle && <span className={clsx('font-semibold uppercase tracking-[0.2em] text-arcane-400', cfg.sub)}>Mullick</span>}
      </div>
    </div>
  )
}
