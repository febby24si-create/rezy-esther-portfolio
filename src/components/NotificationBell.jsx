// ============================================================
// NotificationBell.jsx
// Komponen bell notifikasi untuk member area (GuestNavbar & MemberLayout)
// ============================================================
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdNotifications, MdClose, MdDoneAll } from 'react-icons/md'
import { useCustomerNotifications } from '../hooks/useNotifications'

export default function NotificationBell({ customerId }) {
  const navigate                                      = useNavigate()
  const [open, setOpen]                               = useState(false)
  const ref                                           = useRef(null)
  const { notifs, unreadCount, notifLoading, markRead, markAllRead, dismiss } =
    useCustomerNotifications(customerId)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl transition-all hover:bg-white/10"
        aria-label="Notifikasi"
      >
        <MdNotifications size={22} className="text-gray-300 hover:text-emerald-400 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
          style={{ background: 'rgba(4,28,21,0.97)', backdropFilter: 'blur(16px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white text-sm font-bold flex items-center gap-2">
              <MdNotifications className="text-emerald-400" />
              Notifikasi
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <MdDoneAll size={13} /> Baca semua
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                <span className="text-4xl mb-2">🔔</span>
                <p className="text-xs">Belum ada notifikasi</p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markRead(n.id)
                    if (n.link) { navigate(n.link); setOpen(false) }
                  }}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group ${n.read ? 'opacity-50' : ''}`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{n.icon || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        <button
                          onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                        >
                          <MdClose size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-gray-700 text-[10px] mt-1">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
                        : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}