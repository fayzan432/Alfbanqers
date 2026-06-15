export default function BurjKhalifaSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Burj Khalifa silhouette"
      role="img"
    >
      <defs>
        <linearGradient id="burjGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A257" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#E8C97A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#C9A257" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="burjVertGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8C97A" stopOpacity="1" />
          <stop offset="60%" stopColor="#C9A257" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A07C35" stopOpacity="0.7" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Spire tip */}
      <polygon points="100,2 97,80 103,80" fill="url(#burjVertGrad)" filter="url(#glow)" />

      {/* Upper spire */}
      <polygon points="97,80 103,80 105,140 95,140" fill="url(#burjVertGrad)" />

      {/* Antenna/detail */}
      <rect x="99" y="2" width="2" height="78" fill="#E8C97A" opacity="0.5" />

      {/* Tier 1 - very narrow top */}
      <polygon points="95,140 105,140 108,175 92,175" fill="url(#burjVertGrad)" />

      {/* Setback 1 */}
      <rect x="89" y="175" width="22" height="6" fill="url(#burjGrad)" />

      {/* Tier 2 */}
      <polygon points="89,181 111,181 114,230 86,230" fill="url(#burjVertGrad)" />

      {/* Setback 2 */}
      <rect x="83" y="230" width="34" height="7" fill="url(#burjGrad)" />

      {/* Tier 3 */}
      <polygon points="83,237 117,237 120,290 80,290" fill="url(#burjVertGrad)" />

      {/* Setback 3 */}
      <rect x="76" y="290" width="48" height="8" fill="url(#burjGrad)" />

      {/* Tier 4 */}
      <polygon points="76,298 124,298 128,355 72,355" fill="url(#burjVertGrad)" />

      {/* Setback 4 */}
      <rect x="68" y="355" width="64" height="9" fill="url(#burjGrad)" />

      {/* Tier 5 */}
      <polygon points="68,364 132,364 137,420 63,420" fill="url(#burjVertGrad)" />

      {/* Setback 5 */}
      <rect x="58" y="420" width="84" height="10" fill="url(#burjGrad)" />

      {/* Tier 6 - lower body getting wider */}
      <polygon points="58,430 142,430 148,490 52,490" fill="url(#burjVertGrad)" />

      {/* Setback 6 */}
      <rect x="46" y="490" width="108" height="11" fill="url(#burjGrad)" />

      {/* Base / podium */}
      <polygon points="46,501 154,501 160,555 40,555" fill="url(#burjVertGrad)" />

      {/* Wide base */}
      <rect x="30" y="555" width="140" height="18" fill="url(#burjVertGrad)" />

      {/* Ground plinth */}
      <rect x="15" y="573" width="170" height="12" fill="url(#burjGrad)" opacity="0.6" />

      {/* Ground line */}
      <rect x="0" y="585" width="200" height="3" fill="url(#burjGrad)" opacity="0.4" />

      {/* Window lights - scattered dots for detail */}
      {[
        [98,100],[99,120],[101,160],[100,200],[99,240],[101,280],
        [98,320],[100,360],[99,400],[101,440],[100,480],[99,520],
        [95,150],[105,150],[93,200],[107,200],[90,260],[110,260],
        [87,320],[113,320],[83,380],[117,380],[78,440],[122,440],
        [73,500],[127,500],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="0.8"
          fill="#E8C97A"
          opacity="0.4"
        />
      ))}

      {/* Observation deck highlight */}
      <rect x="78" y="286" width="44" height="2" fill="#E8C97A" opacity="0.7" filter="url(#glow)" />
    </svg>
  );
}
