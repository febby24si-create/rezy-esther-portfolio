/**
 * Button — reusable multi-variant button
 * Props: variant, size, icon, iconPosition, loading, disabled, onClick, children
 */

const VARIANTS = {
  primary:   'bg-gradient-to-r from-green-600 to-green-500 text-white border border-green-500/30 hover:from-green-500 hover:to-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.35)]',
  secondary: 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20',
  danger:    'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:shadow-[0_0_15px_rgba(239,68,68,0.25)]',
  warning:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25',
  ghost:     'text-gray-400 border border-transparent hover:text-green-400 hover:bg-green-500/8',
  outline:   'bg-transparent text-green-400 border border-green-500/40 hover:bg-green-500/10 hover:border-green-400/60',
}

const SIZES = {
  xs: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  sm: 'px-4 py-2 text-sm rounded-xl gap-2',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none'
  const disabledCls = (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${disabledCls} ${className}`}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left'  && <Icon size={16} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  )
}