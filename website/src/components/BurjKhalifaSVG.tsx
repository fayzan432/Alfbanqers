export default function BurjKhalifaSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 700"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Burj Khalifa silhouette"
      role="img"
    >
      <defs>
        <linearGradient id="burjGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3D1F0A" stopOpacity="0.8" />
          <stop offset="35%" stopColor="#7A4A2A" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#D4A574" stopOpacity="1" />
          <stop offset="100%" stopColor="#3D1F0A" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="burjVertGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0C878" stopOpacity="1" />
          <stop offset="30%" stopColor="#D4A574" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#7A4A2A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3D1F0A" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="burjFaceL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3D1F0A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7A4A2A" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="burjFaceR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4A574" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3D1F0A" stopOpacity="0.9" />
        </linearGradient>
        <filter id="burjGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="warmGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Spire tip - very thin needle */}
      <line x1="100" y1="2" x2="100" y2="60" stroke="#F0C878" strokeWidth="0.8" opacity="0.9" filter="url(#warmGlow)" />
      <line x1="99.5" y1="20" x2="99.5" y2="80" stroke="#D4A574" strokeWidth="0.5" opacity="0.6" />
      <line x1="100.5" y1="15" x2="100.5" y2="75" stroke="#D4A574" strokeWidth="0.5" opacity="0.6" />

      {/* Spire taper */}
      <polygon points="100,2 98,60 102,60" fill="url(#burjVertGrad)" filter="url(#burjGlow)" />
      <polygon points="100,2 97,80 103,80" fill="url(#burjVertGrad)" opacity="0.7" />

      {/* Upper spire section */}
      <polygon points="97,80 103,80 105,130 95,130" fill="url(#burjVertGrad)" />
      {/* Depth left face */}
      <polygon points="95,130 97,80 94,82 92,133" fill="url(#burjFaceL)" opacity="0.6" />

      {/* Spire floor lines */}
      {[90, 100, 110, 120].map((y, i) => (
        <line key={i} x1={97 + i*0.2} y1={y} x2={103 - i*0.2} y2={y} stroke="#F0C878" strokeWidth="0.4" opacity="0.5" />
      ))}

      {/* Tier 1 narrow */}
      <polygon points="95,130 105,130 107,170 93,170" fill="url(#burjVertGrad)" />
      <polygon points="93,170 95,130 92,133 90,173" fill="url(#burjFaceL)" opacity="0.5" />
      {[140, 150, 160].map((y, i) => (
        <line key={i} x1={95} y1={y} x2={105} y2={y} stroke="#D4A574" strokeWidth="0.4" opacity="0.4" />
      ))}

      {/* Setback 1 */}
      <rect x="90" y="170" width="20" height="5" fill="url(#burjGrad)" />
      <rect x="90" y="170" width="20" height="2" fill="#F0C878" opacity="0.3" />

      {/* Tier 2 */}
      <polygon points="90,175 110,175 113,220 87,220" fill="url(#burjVertGrad)" />
      <polygon points="87,220 90,175 87,178 84,223" fill="url(#burjFaceL)" opacity="0.5" />
      {[185, 195, 205, 215].map((y, i) => (
        <line key={i} x1={90} y1={y} x2={110} y2={y} stroke="#D4A574" strokeWidth="0.4" opacity="0.4" />
      ))}

      {/* Setback 2 */}
      <rect x="84" y="220" width="32" height="6" fill="url(#burjGrad)" />
      <rect x="84" y="220" width="32" height="2" fill="#F0C878" opacity="0.3" />

      {/* Tier 3 */}
      <polygon points="84,226 116,226 119,278 81,278" fill="url(#burjVertGrad)" />
      <polygon points="81,278 84,226 81,229 78,281" fill="url(#burjFaceL)" opacity="0.5" />
      {[238, 250, 262, 274].map((y, i) => (
        <line key={i} x1={84} y1={y} x2={116} y2={y} stroke="#D4A574" strokeWidth="0.4" opacity="0.4" />
      ))}

      {/* Setback 3 */}
      <rect x="78" y="278" width="44" height="7" fill="url(#burjGrad)" />
      <rect x="78" y="278" width="44" height="2" fill="#F0C878" opacity="0.3" />

      {/* Tier 4 - observation deck region */}
      <polygon points="78,285 122,285 126,345 74,345" fill="url(#burjVertGrad)" />
      <polygon points="74,345 78,285 75,288 71,348" fill="url(#burjFaceL)" opacity="0.5" />
      {[295, 305, 315, 325, 335].map((y, i) => (
        <line key={i} x1={78} y1={y} x2={122} y2={y} stroke="#D4A574" strokeWidth="0.4" opacity="0.4" />
      ))}

      {/* Observation deck highlight */}
      <rect x="74" y="340" width="52" height="3" fill="#F0C878" opacity="0.7" filter="url(#warmGlow)" />

      {/* Setback 4 */}
      <rect x="71" y="345" width="58" height="8" fill="url(#burjGrad)" />
      <rect x="71" y="345" width="58" height="2" fill="#F0C878" opacity="0.3" />

      {/* Tier 5 */}
      <polygon points="71,353 129,353 134,415 66,415" fill="url(#burjVertGrad)" />
      <polygon points="66,415 71,353 68,356 63,418" fill="url(#burjFaceL)" opacity="0.5" />
      {[363, 375, 387, 399, 411].map((y, i) => (
        <line key={i} x1={71} y1={y} x2={129} y2={y} stroke="#D4A574" strokeWidth="0.4" opacity="0.35" />
      ))}

      {/* Setback 5 */}
      <rect x="63" y="415" width="74" height="9" fill="url(#burjGrad)" />
      <rect x="63" y="415" width="74" height="2" fill="#F0C878" opacity="0.3" />

      {/* Tier 6 lower body */}
      <polygon points="63,424 137,424 143,490 57,490" fill="url(#burjVertGrad)" />
      <polygon points="57,490 63,424 60,427 54,493" fill="url(#burjFaceL)" opacity="0.5" />
      {[434, 446, 458, 470, 482].map((y, i) => (
        <line key={i} x1={63} y1={y} x2={137} y2={y} stroke="#D4A574" strokeWidth="0.4" opacity="0.35" />
      ))}

      {/* Setback 6 */}
      <rect x="54" y="490" width="92" height="10" fill="url(#burjGrad)" />
      <rect x="54" y="490" width="92" height="2" fill="#F0C878" opacity="0.3" />

      {/* Base podium */}
      <polygon points="54,500 146,500 152,555 48,555" fill="url(#burjVertGrad)" />
      <polygon points="48,555 54,500 51,503 45,558" fill="url(#burjFaceL)" opacity="0.5" />
      {[510, 522, 534, 546].map((y, i) => (
        <line key={i} x1={54} y1={y} x2={146} y2={y} stroke="#D4A574" strokeWidth="0.4" opacity="0.3" />
      ))}

      {/* Wide base */}
      <rect x="36" y="555" width="128" height="16" fill="url(#burjVertGrad)" />
      <rect x="36" y="555" width="128" height="3" fill="#F0C878" opacity="0.25" />

      {/* Ground plinth */}
      <rect x="18" y="571" width="164" height="10" fill="url(#burjGrad)" opacity="0.7" />

      {/* Ground line */}
      <rect x="0" y="581" width="200" height="2" fill="url(#burjGrad)" opacity="0.4" />

      {/* Window light dots - warm amber */}
      {[
        [99,95],[100,115],[100,155],[99,195],[101,235],[100,270],
        [99,305],[101,355],[100,395],[99,440],[101,480],[100,520],
        [94,148],[106,148],[92,195],[108,195],[89,248],[111,248],
        [86,305],[114,305],[83,365],[117,365],[79,425],[121,425],
        [75,480],[125,480],[71,530],[129,530],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="1"
          fill="#F0C878"
          opacity="0.45"
        />
      ))}

      {/* Extra warm window clusters */}
      {[
        [96,320],[104,320],[95,360],[105,360],
        [93,420],[107,420],[90,465],[110,465],
      ].map(([cx, cy], i) => (
        <circle key={`w2-${i}`} cx={cx} cy={cy} r="0.7" fill="#D4A574" opacity="0.35" />
      ))}
    </svg>
  );
}
