export default function BurjAlArabSVG({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 160 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size ? size * 300 / 160 : undefined}
      aria-label="Burj Al Arab silhouette"
      role="img"
    >
      <defs>
        <linearGradient id="baaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2A1205" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#7A4A2A" stopOpacity="0.95" />
          <stop offset="75%" stopColor="#D4A574" stopOpacity="1" />
          <stop offset="100%" stopColor="#3D1F0A" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="baaVert" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0C878" stopOpacity="1" />
          <stop offset="50%" stopColor="#D4A574" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3D1F0A" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="baaFill" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3D1F0A" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#7A4A2A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#D4A574" stopOpacity="0.7" />
        </linearGradient>
        <filter id="baaGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Helipad arm extending right at top */}
      <line x1="80" y1="18" x2="138" y2="12" stroke="#D4A574" strokeWidth="1.5" opacity="0.8" />
      {/* Helipad circle */}
      <circle cx="140" cy="11" r="10" fill="none" stroke="#D4A574" strokeWidth="1.5" opacity="0.8" />
      <circle cx="140" cy="11" r="7" fill="#3D1F0A" stroke="#F0C878" strokeWidth="0.8" opacity="0.7" />
      <line x1="136" y1="11" x2="144" y2="11" stroke="#F0C878" strokeWidth="0.6" opacity="0.6" />
      <line x1="140" y1="7" x2="140" y2="15" stroke="#F0C878" strokeWidth="0.6" opacity="0.6" />

      {/* Main sail body — iconic curved chevron shape */}
      {/* Left angled face of sail */}
      <polygon
        points="80,18 28,240 80,240"
        fill="url(#baaFill)"
        opacity="0.9"
      />
      {/* Right curved face of sail */}
      <path
        d="M80,18 C95,80 110,140 115,200 C118,220 115,235 80,240 Z"
        fill="url(#baaGrad)"
      />
      {/* Sail outline */}
      <path
        d="M80,18 L28,240 L80,240 C115,235 118,220 115,200 C110,140 95,80 80,18 Z"
        fill="none"
        stroke="#D4A574"
        strokeWidth="0.8"
        opacity="0.5"
      />

      {/* Interior atrium triangle */}
      <polygon
        points="80,60 52,220 80,220"
        fill="#1A0C03"
        opacity="0.7"
      />
      <line x1="80" y1="60" x2="52" y2="220" stroke="#F0C878" strokeWidth="0.5" opacity="0.4" />
      <line x1="80" y1="60" x2="80" y2="220" stroke="#F0C878" strokeWidth="0.5" opacity="0.3" />

      {/* Horizontal floor lines across sail */}
      {Array.from({length: 18}, (_, i) => {
        const y = 30 + i * 12;
        const leftX = 80 - (80 - 28) * (y - 18) / (240 - 18);
        const rightX = 80 + (115 - 80) * Math.sin((y - 18) / (240 - 18) * Math.PI * 0.7);
        return (
          <line key={i} x1={leftX} y1={y} x2={Math.min(rightX + 80, 115)} y2={y}
            stroke="#D4A574" strokeWidth="0.5" opacity="0.3" />
        );
      })}

      {/* Base podium/platform */}
      <rect x="20" y="240" width="100" height="12" fill="url(#baaGrad)" opacity="0.9" />
      <rect x="14" y="252" width="112" height="8" fill="url(#baaGrad)" opacity="0.8" />
      <rect x="8" y="260" width="124" height="6" fill="url(#baaGrad)" opacity="0.7" />

      {/* Water/ground */}
      <rect x="0" y="266" width="160" height="2" fill="#D4A574" opacity="0.3" />
      {[272, 276, 280].map((y, i) => (
        <line key={i} x1={10} y1={y} x2={150} y2={y} stroke="#7A4A2A" strokeWidth="0.5" opacity={0.15 - i * 0.03} />
      ))}
    </svg>
  );
}
