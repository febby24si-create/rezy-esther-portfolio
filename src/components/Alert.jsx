/**
 * Alert — dismissible feedback alert
 * Props: variant, title, children, onClose
 */
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md'

const VARIANTS = {
  success: {
    wrapper: 'border-green-500/30 bg-green-500/8',
    icon: 'text-green-400', title: 'text-green-300', text: 'text-green-400/80',
    bar: 'bg-green-500', Icon: MdCheckCircle,
  },
  danger: {
    wrapper: 'border-red-500/30 bg-red-500/8',
    icon: 'text-red-400', title: 'text-red-300', text: 'text-red-400/80',
    bar: 'bg-red-500', Icon: MdError,
  },
  warning: {
    wrapper: 'border-yellow-500/30 bg-yellow-500/8',
    icon: 'text-yellow-400', title: 'text-yellow-300', text: 'text-yellow-400/80',
    bar: 'bg-yellow-500', Icon: MdWarning,
  },
  info: {
    wrapper: 'border-blue-500/30 bg-blue-500/8',
    icon: 'text-blue-400', title: 'text-blue-300', text: 'text-blue-400/80',
    bar: 'bg-blue-500', Icon: MdInfo,
  },
}

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) {
  const v = VARIANTS[variant] ?? VARIANTS.info
  const { Icon } = v

  return (
    <div className={`relative flex gap-3.5 p-4 rounded-xl border overflow-hidden ${v.wrapper} ${className}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${v.bar}`} />

      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${v.icon}`} />

      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-semibold text-sm mb-0.5 ${v.title}`}>{title}</p>
        )}
        {children && (
          <p className={`text-sm leading-relaxed ${v.text}`}>{children}</p>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
        >
          <MdClose size={16} />
        </button>
      )}
    </div>
  )
}