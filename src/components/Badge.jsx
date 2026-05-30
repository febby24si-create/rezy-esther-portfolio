/**
 * Badge — status label, variant-based
 * Props: variant, size, dot, children
 */

const VARIANTS = {
  success:  'bg-green-500/15 text-green-400 border-green-500/25',
  danger:   'bg-red-500/15 text-red-400 border-red-500/25',
  warning:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  info:     'bg-blue-500/15 text-blue-400 border-blue-500/25',
  default:  'bg-slate-500/15 text-slate-400 border-slate-500/20',
  purple:   'bg-purple-500/15 text-purple-400 border-purple-500/25',
  orange:   'bg-orange-500/15 text-orange-400 border-orange-500/25',
}

const DOT_COLORS = {
  success: 'bg-green-400',
  danger:  'bg-red-400',
  warning: 'bg-yellow-400',
  info:    'bg-blue-400',
  default: 'bg-slate-400',
  purple:  'bg-purple-400',
  orange:  'bg-orange-400',
}

const SIZES = {
  sm: 'text-xs px-2 py-0.5 rounded-md',
  md: 'text-xs px-3 py-1 rounded-full',
  lg: 'text-sm px-4 py-1.5 rounded-full',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const base = 'inline-flex items-center gap-1.5 font-semibold border'
  const v = VARIANTS[variant] ?? VARIANTS.default
  const s = SIZES[size] ?? SIZES.md

  return (
    <span className={`${base} ${v} ${s} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLORS[variant] ?? 'bg-slate-400'}`} />
      )}
      {children}
    </span>
  )
}