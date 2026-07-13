import type { RankDefinition } from '@/utils/xp'

interface RankBadgeProps {
  rank: RankDefinition
  size?: number
}

export function RankBadge({ rank, size = 56 }: RankBadgeProps) {
  const gradientId = `rank-grad-${rank.key}`
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={rank.colorFrom} />
            <stop offset="100%" stopColor={rank.colorTo} />
          </linearGradient>
        </defs>
        <polygon
          points="50,3 91,25 91,75 50,97 9,75 9,25"
          fill="#0d0d18"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
        />
        <polygon
          points="50,15 81,32 81,68 50,85 19,68 19,32"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          opacity="0.5"
        />
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="34"
          fontWeight="700"
          fontFamily="Cinzel, serif"
          fill={`url(#${gradientId})`}
        >
          {rank.key === 'ASCENDANT' ? '∞' : rank.key}
        </text>
      </svg>
      <span className="sr-only">{rank.label}</span>
    </div>
  )
}
