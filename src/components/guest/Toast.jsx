import { useEffect, useState, useCallback } from 'react'
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md'

const typeStyles = {
  success: { bg: 'bg-green-500/15 border-green-500/30',  icon: MdCheckCircle, color: 'text-green-400' },
  error:   { bg: 'bg-red-500/15   border-red-500/30',    icon: MdError,       color: 'text-red-400'   },
  info:    { bg: 'bg-blue-500/15  border-brand',   icon: MdInfo,        color: 'text-blue-400'  },
  warning: { bg: 'bg-yellow-500/15 border-yellow-500/30',icon: MdWarning,     color: 'text-yellow-400'},
}

export function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  const [visible, setVisible] = useState(true)
  const style = typeStyles[type] || typeStyles.info
  const Icon = style.icon

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300) }, duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl max-w-sm transition-all duration-300 ${style.bg} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      style={{ backdropFilter: 'blur(12px)' }}>
      <Icon className={`${style.color} text-xl flex-shrink-0 mt-0.5`} />
      <p className="text-white text-sm flex-1 leading-snug">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
        <MdClose className="text-base" />
      </button>
    </div>
  )
}

// Toast container — render this once in GuestLayout
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

// Hook to manage toast state — import this in layout components
export function useToast() {
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])
  return { toasts, addToast, removeToast }
}