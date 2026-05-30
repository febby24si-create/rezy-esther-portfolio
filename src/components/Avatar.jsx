/**
 * Avatar — initials fallback + image support + status indicator
 * Props: name, src, size, status, className
 */

const SIZES = {
  xs: { wrapper: 'w-6 h-6 text-xs rounded-md',    status: 'w-1.5 h-1.5 bottom-0 right-0'       },
  sm: { wrapper: 'w-8 h-8 text-sm rounded-lg',    status: 'w-2 h-2 bottom-0 right-0'           },
  md: { wrapper: 'w-10 h-10 text-sm rounded-xl',  status: 'w-2.5 h-2.5 bottom-0.5 right-0.5'  },
  lg: { wrapper: 'w-14 h-14 text-base rounded-xl',status: 'w-3 h-3 bottom-0.5 right-0.5'      },
  xl: { wrapper: 'w-20 h-20 text-xl rounded-2xl', status: 'w-4 h-4 bottom-1 right-1'          },
}

const STATUS_COLORS = {
  online:  'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.7)]',
  offline: 'bg-gray-500',
  busy:    'bg-red-400',
  away:    'bg-yellow-400',
}

const GRADIENTS = [
  'from-green-600 to-emerald-400',
  'from-blue-600 to-cyan-400',
  'from-purple-600 to-violet-400',
  'from-orange-600 to-amber-400',
  'from-rose-600 to-pink-400',
  'from-teal-600 to-green-400',
]

function nameToGradient(name) {
  const idx = name ? name.charCodeAt(0) % GRADIENTS.length : 0
  return GRADIENTS[idx]
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Avatar({
  name = '',
  src,
  size = 'md',
  status,
  className = '',
}) {
  const s = SIZES[size] ?? SIZES.md
  const gradient = nameToGradient(name)

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`
          ${s.wrapper}
          flex items-center justify-center
          font-bold text-white overflow-hidden
          border border-white/10
          ${!src ? `bg-gradient-to-br ${gradient}` : ''}
        `}
      >
        {src
          ? <img src={src} alt={name} className="w-full h-full object-cover" />
          : <span className="select-none">{getInitials(name)}</span>
        }
      </div>

      {status && (
        <span
          className={`
            absolute border-2 border-[#041C15] rounded-full
            ${s.status} ${STATUS_COLORS[status] ?? STATUS_COLORS.offline}
          `}
        />
      )}
    </div>
  )
}