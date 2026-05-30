/**
 * Spinner — SVG loading indicator
 * Props: size, variant, label, fullPage
 */

const SIZES = {
  xs: { outer: 'w-4 h-4',   stroke: 2   },
  sm: { outer: 'w-6 h-6',   stroke: 2   },
  md: { outer: 'w-9 h-9',   stroke: 2.5 },
  lg: { outer: 'w-14 h-14', stroke: 3   },
  xl: { outer: 'w-20 h-20', stroke: 3   },
}

const VARIANTS = {
  green: { track: 'rgba(34,197,94,0.15)',  spin: '#22C55E' },
  white: { track: 'rgba(255,255,255,0.1)', spin: '#ffffff' },
  gray:  { track: 'rgba(100,116,139,0.2)', spin: '#94a3b8' },
}

export default function Spinner({
  size = 'md',
  variant = 'green',
  label,
  fullPage = false,
}) {
  const s = SIZES[size]  ?? SIZES.md
  const v = VARIANTS[variant] ?? VARIANTS.green
  const r = 45

  const spinnerEl = (
    <div className="inline-flex flex-col items-center gap-3">
      <svg className={`${s.outer} animate-spin`} viewBox="0 0 100 100" fill="none">
        <circle
          cx="50" cy="50" r={r}
          stroke={v.track}
          strokeWidth={s.stroke * 3}
        />
        <circle
          cx="50" cy="50" r={r}
          stroke={v.spin}
          strokeWidth={s.stroke * 3}
          strokeLinecap="round"
          strokeDasharray={`${r * 0.75} ${r * 1.57}`}
          transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 4px ${v.spin})` }}
        />
      </svg>
      {label && <p className="text-sm text-gray-500 animate-pulse">{label}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: 'rgba(4,28,21,0.85)', backdropFilter: 'blur(8px)' }}
      >
        {spinnerEl}
      </div>
    )
  }

  return spinnerEl
}