export default function DubaiFrameSVG({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 200 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size ? size * 320 / 200 : undefined}
      aria-label="Dubai Frame silhouette"
      role="img"
    >
      <defs>
        <linearGradient id="dfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3D1F0A" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#7A4A2A" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#D4A574" stopOpacity="1" />
          <stop offset="100%" stopColor="#3D1F0A" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="dfVert" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0C878" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#D4A574" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3D1F0A" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="dfBridge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4A574" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7A4A2A" stopOpacity="0.8" />
        </linearGradient>
        <filter id="dfGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Left tower */}
      <rect x="28" y="28" width="52" height="240" fill="url(#dfVert)" />
      {/* Left tower side depth */}
      <rect x="20" y="32" width="8" height="236" fill="#3D1F0A" opacity="0.7" />
      {/* Left tower grid lines - vertical */}
      {[38, 48, 58, 68].map((x, i) => (
        <line key={i} x1={x} y1="30" x2={x} y2="266" stroke="#3D1F0A" strokeWidth="0.6" opacity="0.5" />
      ))}
      {/* Left tower grid lines - horizontal */}
      {Array.from({length: 22}, (_, i) => (
        <line key={i} x1="28" y1={38 + i * 10} x2="80" y2={38 + i * 10} stroke="#3D1F0A" strokeWidth="0.5" opacity="0.4" />
      ))}
      {/* Left tower window glow */}
      {Array.from({length: 8}, (_, i) => (
        <rect key={i} x="32" y={40 + i * 28} width="8" height="6" rx="1" fill="#F0C878" opacity="0.15" />
      ))}

      {/* Right tower */}
      <rect x="120" y="28" width="52" height="240" fill="url(#dfVert)" />
      {/* Right tower side depth */}
      <rect x="172" y="32" width="8" height="236" fill="#3D1F0A" opacity="0.7" />
      {/* Right tower grid lines - vertical */}
      {[130, 140, 150, 162].map((x, i) => (
        <line key={i} x1={x} y1="30" x2={x} y2="266" stroke="#3D1F0A" strokeWidth="0.6" opacity="0.5" />
      ))}
      {/* Right tower grid lines - horizontal */}
      {Array.from({length: 22}, (_, i) => (
        <line key={i} x1="120" y1={38 + i * 10} x2="172" y2={38 + i * 10} stroke="#3D1F0A" strokeWidth="0.5" opacity="0.4" />
      ))}
      {/* Right tower window glow */}
      {Array.from({length: 8}, (_, i) => (
        <rect key={i} x="160" y={40 + i * 28} width="8" height="6" rx="1" fill="#F0C878" opacity="0.15" />
      ))}

      {/* Bridge connecting tops */}
      <rect x="28" y="28" width="144" height="30" fill="url(#dfBridge)" />
      {/* Bridge depth */}
      <rect x="28" y="20" width="144" height="8" fill="#7A4A2A" opacity="0.8" />
      {/* Bridge grid lines */}
      {[50, 72, 94, 116, 138, 160].map((x, i) => (
        <line key={i} x1={x} y1="28" x2={x} y2="58" stroke="#3D1F0A" strokeWidth="0.6" opacity="0.4" />
      ))}
      {[38, 48].map((y, i) => (
        <line key={i} x1="28" y1={y} x2="172" y2={y} stroke="#3D1F0A" strokeWidth="0.5" opacity="0.4" />
      ))}
      {/* Bridge highlight */}
      <rect x="28" y="28" width="144" height="3" fill="#F0C878" opacity="0.3" />

      {/* Frame corners highlights */}
      <rect x="28" y="28" width="52" height="3" fill="#F0C878" opacity="0.4" />
      <rect x="120" y="28" width="52" height="3" fill="#F0C878" opacity="0.4" />

      {/* Base of both towers */}
      <rect x="18" y="268" width="62" height="12" fill="url(#dfGrad)" opacity="0.9" />
      <rect x="120" y="268" width="62" height="12" fill="url(#dfGrad)" opacity="0.9" />
      <rect x="12" y="280" width="74" height="8" fill="url(#dfGrad)" opacity="0.7" />
      <rect x="114" y="280" width="74" height="8" fill="url(#dfGrad)" opacity="0.7" />

      {/* Ground plaza */}
      <rect x="10" y="288" width="180" height="6" fill="url(#dfGrad)" opacity="0.5" />
      <rect x="0" y="294" width="200" height="2" fill="#D4A574" opacity="0.2" />

      {/* Glow at top of frame */}
      <rect x="28" y="20" width="144" height="40" fill="none" stroke="#F0C878" strokeWidth="0.6" opacity="0.3" filter="url(#dfGlow)" />
    </svg>
  );
}
