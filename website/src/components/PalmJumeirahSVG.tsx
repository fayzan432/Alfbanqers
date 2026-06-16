export default function PalmJumeirahSVG({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 200 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size ? size * 260 / 200 : undefined}
      aria-label="Palm Jumeirah aerial silhouette"
      role="img"
    >
      <defs>
        <linearGradient id="palmGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3D1F0A" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#7A4A2A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D4A574" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#050200" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0D0600" stopOpacity="0.8" />
        </linearGradient>
        <filter id="palmGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Water background */}
      <rect x="0" y="0" width="200" height="260" fill="url(#waterGrad)" />
      {/* Water texture lines */}
      {Array.from({length: 12}, (_, i) => (
        <line key={i} x1="5" y1={20 + i * 20} x2="195" y2={20 + i * 20} stroke="#1A0C03" strokeWidth="0.8" opacity="0.5" />
      ))}

      {/* Outer crescent arc */}
      <path
        d="M 40,60 A 80,80 0 0,1 160,60"
        fill="none"
        stroke="url(#palmGrad)"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Crescent inner edge */}
      <path
        d="M 48,65 A 68,68 0 0,1 152,65"
        fill="none"
        stroke="#1A0C03"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Central trunk/spine */}
      <rect x="96" y="55" width="8" height="150" rx="3" fill="url(#palmGrad)" />

      {/* Fronds - 8 per side = 16 total, branching at angles */}
      {[
        // [startY, endX offset, endY offset, curveMidX, curveMidY]
        // Right fronds
        [70, 55, -15, 30, -25],
        [85, 58, -10, 32, -18],
        [100, 55, -5, 30, -10],
        [115, 52, 2, 28, -5],
        [130, 48, 8, 26, 0],
        [145, 44, 14, 24, 5],
        [160, 38, 20, 20, 10],
        [175, 30, 26, 16, 15],
      ].map(([sy, exOff, eyOff, cmx, cmy], i) => {
        const startX = 100;
        const endX = startX + (exOff as number);
        const endY = (sy as number) + (eyOff as number);
        const midX = startX + (cmx as number);
        const midY = (sy as number) + (cmy as number);
        return (
          <path
            key={`r${i}`}
            d={`M${startX},${sy} Q${midX},${midY} ${endX},${endY}`}
            fill="none"
            stroke="url(#palmGrad)"
            strokeWidth={4 - i * 0.3}
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}
      {[
        [70, -55, -15, -30, -25],
        [85, -58, -10, -32, -18],
        [100, -55, -5, -30, -10],
        [115, -52, 2, -28, -5],
        [130, -48, 8, -26, 0],
        [145, -44, 14, -24, 5],
        [160, -38, 20, -20, 10],
        [175, -30, 26, -16, 15],
      ].map(([sy, exOff, eyOff, cmx, cmy], i) => {
        const startX = 100;
        const endX = startX + (exOff as number);
        const endY = (sy as number) + (eyOff as number);
        const midX = startX + (cmx as number);
        const midY = (sy as number) + (cmy as number);
        return (
          <path
            key={`l${i}`}
            d={`M${startX},${sy} Q${midX},${midY} ${endX},${endY}`}
            fill="none"
            stroke="url(#palmGrad)"
            strokeWidth={4 - i * 0.3}
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}

      {/* Palm tip */}
      <circle cx="100" cy="55" r="5" fill="#F0C878" opacity="0.8" />

      {/* Glow overlay on palm */}
      <rect x="94" y="55" width="12" height="150" rx="3" fill="#D4A574" opacity="0.1" filter="url(#palmGlow)" />
    </svg>
  );
}
