export default function AlfBanqMark({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ALF BANQ logo mark"
      role="img"
    >
      <defs>
        <linearGradient id="alfGoldSweep" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A07C35" />
          <stop offset="50%" stopColor="#E8C97A" />
          <stop offset="100%" stopColor="#C9A257" />
        </linearGradient>
      </defs>
      {/* Left leg of A */}
      <path
        d="M 78 20 L 30 168 C 28 174 32 180 40 180 L 58 180 C 64 180 69 176 71 170 L 100 80 Z"
        fill="#0D1B3E"
      />
      {/* Right leg of A */}
      <path
        d="M 100 80 L 129 170 C 131 176 136 180 142 180 L 160 180 C 168 180 172 174 170 168 L 122 20 C 119 13 81 13 78 20 Z"
        fill="none"
      />
      <path
        d="M 122 20 L 170 168 C 172 174 168 180 160 180 L 142 180 C 136 180 131 176 129 170 L 100 80 Z"
        fill="#0D1B3E"
      />
      {/* House window */}
      <rect x="92" y="92" width="8" height="8" fill="#C9A257" />
      <rect x="102" y="92" width="8" height="8" fill="#C9A257" />
      <rect x="92" y="102" width="8" height="8" fill="#C9A257" />
      <rect x="102" y="102" width="8" height="8" fill="#C9A257" />
      {/* House body with keyhole */}
      <path d="M 85 122 L 100 110 L 115 122 L 115 156 L 85 156 Z" fill="#C9A257" />
      <circle cx="100" cy="134" r="5" fill="#0D1B3E" />
      <rect x="97" y="138" width="6" height="10" fill="#0D1B3E" />
      {/* Gold sweep */}
      <path
        d="M 175 88 C 160 110 130 140 95 156 L 95 148 C 126 134 152 108 166 88 Z"
        fill="url(#alfGoldSweep)"
      />
    </svg>
  );
}
