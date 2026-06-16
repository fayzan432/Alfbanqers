export default function MuseumOfFutureSVG({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-label="Museum of the Future silhouette"
      role="img"
    >
      <defs>
        <linearGradient id="mofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3D1F0A" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#7A4A2A" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#D4A574" stopOpacity="1" />
          <stop offset="100%" stopColor="#F0C878" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="mofInner" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0D0600" stopOpacity="1" />
          <stop offset="50%" stopColor="#1A0C03" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0D0600" stopOpacity="1" />
        </linearGradient>
        <filter id="mofGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="torusClip">
          <ellipse cx="100" cy="85" rx="78" ry="58" />
        </clipPath>
      </defs>

      {/* Outer torus ring */}
      <ellipse cx="100" cy="85" rx="78" ry="58" fill="url(#mofGrad)" />

      {/* Inner hole (creating torus effect) */}
      <ellipse cx="100" cy="85" rx="44" ry="30" fill="url(#mofInner)" />

      {/* Ring border/edge highlights */}
      <ellipse cx="100" cy="85" rx="78" ry="58" fill="none" stroke="#F0C878" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="100" cy="85" rx="44" ry="30" fill="none" stroke="#D4A574" strokeWidth="0.6" opacity="0.4" />

      {/* Calligraphy-like cutout patterns — arc shapes in the ring */}
      {/* Top arc cutout */}
      <path d="M75,42 Q100,30 125,42 Q115,55 100,52 Q85,55 75,42 Z" fill="#1A0C03" opacity="0.8" />
      {/* Bottom arc cutout */}
      <path d="M72,120 Q100,135 128,120 Q118,108 100,112 Q82,108 72,120 Z" fill="#1A0C03" opacity="0.8" />
      {/* Left side cutout */}
      <path d="M32,68 Q22,85 32,102 Q44,95 46,85 Q44,75 32,68 Z" fill="#1A0C03" opacity="0.8" />
      {/* Right side cutout */}
      <path d="M168,68 Q178,85 168,102 Q156,95 154,85 Q156,75 168,68 Z" fill="#1A0C03" opacity="0.8" />
      {/* Diagonal flourish cutouts */}
      <path d="M58,52 Q68,48 74,58 Q66,64 58,58 Z" fill="#1A0C03" opacity="0.7" />
      <path d="M126,52 Q132,48 142,52 Q138,60 130,60 Z" fill="#1A0C03" opacity="0.7" />
      <path d="M58,112 Q68,120 74,112 Q68,106 58,112 Z" fill="#1A0C03" opacity="0.7" />
      <path d="M126,112 Q132,120 142,112 Q136,106 126,112 Z" fill="#1A0C03" opacity="0.7" />

      {/* Reflective glass effect — bright strip across facade */}
      <path d="M60,58 Q100,48 140,58 Q138,72 100,68 Q62,72 60,58 Z" fill="#F0C878" opacity="0.12" />
      <path d="M56,88 Q100,80 144,88 Q142,100 100,96 Q58,100 56,88 Z" fill="#F0C878" opacity="0.08" />

      {/* Mid-ring detail lines */}
      <ellipse cx="100" cy="85" rx="61" ry="44" fill="none" stroke="#D4A574" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.3" />

      {/* Base / podium */}
      <rect x="60" y="140" width="80" height="10" rx="2" fill="url(#mofGrad)" opacity="0.9" />
      <rect x="50" y="150" width="100" height="7" rx="1" fill="url(#mofGrad)" opacity="0.7" />
      <rect x="40" y="157" width="120" height="5" rx="1" fill="url(#mofGrad)" opacity="0.5" />

      {/* Ground line */}
      <rect x="20" y="162" width="160" height="1.5" fill="#D4A574" opacity="0.3" />

      {/* Glow effect behind building */}
      <ellipse cx="100" cy="100" rx="82" ry="65" fill="none" stroke="#D4A574" strokeWidth="6" opacity="0.06" filter="url(#mofGlow)" />
    </svg>
  );
}
