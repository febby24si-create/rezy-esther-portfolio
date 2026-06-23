// ============================================================
// pages/CheckIn.jsx — Admin Check-In Management
//
// Halaman untuk admin melakukan check-in kendaraan pada hari H.
// Menampilkan semua booking yang siap check-in hari ini,
// besok, dan yang sudah dikonfirmasi.
//
// FLOW:
//   Admin pilih booking → klik Check In → konfirmasi modal
//   → bookingService.checkIn() dipanggil
//   → BOOKING_CHECK_IN event di-emit
//   → bookingSubscribers: buat Order otomatis di garage_orders
//   → redirect admin ke /orders untuk assign mekanik
//
// TIDAK ADA pembuatan Order di komponen ini.
// Semua logika bisnis ada di bookingService + bookingSubscribers.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogIn, Calendar, Clock, Car, User, Wrench,
  CheckCircle2, AlertCircle, Search, X, ChevronRight,
  ArrowRight, Inbox, RefreshCw, FileText,
} from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import PageHeader from '../components/PageHeader'
import {
  getAllBookings,
  checkIn,
  BOOKING_STATUS,
  BOOKING_STATUS_CONFIG,
} from '../lib/bookingEngine'

// ─── HELPERS ──────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short',
    })
  } catch { return dateStr }
}

function today() { return new Date().toISOString().slice(0, 10) }
function tomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

// ─── STATUS BADGE ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = BOOKING_STATUS_CONFIG[status]
    || BOOKING_STATUS_CONFIG[BOOKING_STATUS.WAITING_CONFIRMATION]
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.pulse ? 'animate-pulse' : ''}`}
        style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

// ─── CONFIRM MODAL ────────────────────────────────────────────
function CheckInConfirmModal({ booking, onConfirm, onCancel, loading }) {
  if (!booking) return null
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: 'linear-gradient(160deg,#06140e,#0a1f16)', border: '1px solid rgba(34,197,94,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <LogIn size={28} className="text-green-400" />
          </div>
        </div>

        <h3 className="text-white font-bold text-lg text-center mb-1">Konfirmasi Check In</h3>
        <p className="text-gray-500 text-sm text-center mb-6">
          Tindakan ini akan membuat Order baru secara otomatis.
        </p>

        {/* Booking Summary */}
        <div className="rounded-xl p-4 space-y-2 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { icon: User,     label: 'Customer',  value: booking.customerName },
            { icon: Car,      label: 'Kendaraan', value: booking.vehicleDisplay?.split(' - ')[0] || '—' },
            { icon: Wrench,   label: 'Layanan',   value: booking.serviceName },
            { icon: Calendar, label: 'Jadwal',    value: `${formatDateShort(booking.date)} · ${booking.time}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Icon size={13} />
                <span className="text-xs">{label}</span>
              </div>
              <span className="text-white text-xs font-medium text-right max-w-[180px] truncate">{value}</span>
            </div>
          ))}
        </div>

        {/* What will happen info */}
        <div className="rounded-xl p-3 mb-5 flex items-start gap-2.5"
          style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <AlertCircle size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300 text-xs leading-relaxed">
            Order baru akan dibuat otomatis dengan status <strong>Menunggu</strong>. 
            Anda bisa assign mekanik dari halaman Orders setelah check-in.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff' }}>
            {loading
              ? <><RefreshCw size={14} className="animate-spin" /> Proses...</>
              : <><LogIn size={14} /> Check In</>
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── BOOKING CARD ─────────────────────────────────────────────
function BookingCard({ booking, onCheckIn, isToday }) {
  const canCheckIn = [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.WAITING_CHECK_IN,
  ].includes(booking.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200"
      style={{
        background: isToday ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isToday ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-xs text-gray-600">{booking.id}</span>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-white font-bold text-sm">{booking.customerName}</p>
          <p className="text-gray-500 text-xs">{booking.customerPhone}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-blue-400 font-mono font-bold text-sm">{booking.time}</p>
          <p className="text-gray-600 text-xs">{formatDateShort(booking.date)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Car size={11} className="text-purple-400" />
            <span className="text-gray-600 text-[10px]">Kendaraan</span>
          </div>
          <p className="text-gray-300 text-xs font-medium leading-tight truncate">
            {booking.vehicleDisplay?.split(' - ')[0] || '—'}
          </p>
          {booking.vehiclePlate && (
            <span className="font-mono text-[10px] mt-0.5 inline-block"
              style={{ color: '#A78BFA' }}>{booking.vehiclePlate}</span>
          )}
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Wrench size={11} className="text-green-400" />
            <span className="text-gray-600 text-[10px]">Layanan</span>
          </div>
          <p className="text-gray-300 text-xs font-medium leading-tight truncate">{booking.serviceName}</p>
          {booking.estimatedDuration && (
            <p className="text-gray-600 text-[10px] mt-0.5">{booking.estimatedDuration}</p>
          )}
        </div>
      </div>

      {booking.notes && (
        <p className="text-gray-600 text-xs px-1 truncate">💬 {booking.notes}</p>
      )}

      {/* Action */}
      {canCheckIn ? (
        <button onClick={() => onCheckIn(booking)}
          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff' }}>
          <LogIn size={14} /> Check In Sekarang
        </button>
      ) : booking.status === BOOKING_STATUS.CHECKED_IN ? (
        <div className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle2 size={14} /> Sudah Check In
          {booking.orderId && (
            <span className="font-mono text-xs opacity-70">· {booking.orderId}</span>
          )}
        </div>
      ) : null}
    </motion.div>
  )
}

// ─── SECTION ──────────────────────────────────────────────────
function Section({ title, count, color, children, empty }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-1.5 h-5 rounded-full" style={{ background: color }} />
        <h2 className="text-white font-bold text-sm">{title}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-1"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
          {count}
        </span>
      </div>
      {count === 0 ? (
        <div className="py-8 text-center rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
          <p className="text-gray-600 text-sm">{empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function CheckInPage() {
  const navigate = useNavigate()
  const [bookings, setBookings]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState(null)
  const [search, setSearch]       = useState('')

  const load = useCallback(() => {
    try { setBookings(getAllBookings()) } catch {}
  }, [])

  useEffect(() => {
    load()
    const iv = setInterval(load, 3000)
    window.addEventListener('storage', load)
    return () => { clearInterval(iv); window.removeEventListener('storage', load) }
  }, [load])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCheckIn = useCallback((booking) => {
    setSelected(booking)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!selected) return
    setLoading(true)

    setTimeout(() => {
      const result = checkIn(selected.id, { checkedInBy: 'Admin' })
      setLoading(false)

      if (result.success) {
        showToast(`Check in berhasil! Order otomatis dibuat.`, 'success')
        setSelected(null)
        load()
        // Redirect ke Orders setelah 2 detik agar admin bisa assign mekanik
        setTimeout(() => navigate('/orders'), 2000)
      } else {
        showToast(result.error || 'Check in gagal.', 'error')
        setSelected(null)
      }
    }, 800)
  }, [selected, load, navigate])

  const todayStr    = today()
  const tomorrowStr = tomorrow()

  const checkInEligibleStatuses = [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.WAITING_CHECK_IN,
    BOOKING_STATUS.CHECKED_IN,
  ]

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return bookings.filter(b => {
      if (!checkInEligibleStatuses.includes(b.status) && b.status !== BOOKING_STATUS.CHECKED_IN) {
        // Tampilkan semua kecuali yang pending confirmation, rejected, expired, cancelled
        if (![
          BOOKING_STATUS.CONFIRMED,
          BOOKING_STATUS.WAITING_CHECK_IN,
          BOOKING_STATUS.CHECKED_IN,
        ].includes(b.status)) return false
      }
      if (!s) return true
      return (
        b.customerName?.toLowerCase().includes(s) ||
        b.vehiclePlate?.toLowerCase().includes(s) ||
        b.id?.toLowerCase().includes(s) ||
        b.serviceName?.toLowerCase().includes(s)
      )
    })
  }, [bookings, search])

  const todayBookings    = filtered.filter(b => b.date === todayStr)
  const tomorrowBookings = filtered.filter(b => b.date === tomorrowStr)
  const upcomingBookings = filtered.filter(b => b.date > tomorrowStr)
  const checkedInToday   = todayBookings.filter(b => b.status === BOOKING_STATUS.CHECKED_IN)
  const pendingToday     = todayBookings.filter(b => b.status !== BOOKING_STATUS.CHECKED_IN)

  return (
    <AnimatedPage>
      <PageHeader title="Check In Kendaraan" breadcrumb={['Operations', 'Check In']} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl flex items-center gap-2.5"
            style={{
              background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              color: toast.type === 'error' ? '#EF4444' : '#22C55E',
              backdropFilter: 'blur(12px)',
            }}
          >
            {toast.type === 'error'
              ? <AlertCircle size={16} />
              : <CheckCircle2 size={16} />
            }
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Hari Ini',        value: todayBookings.length,    color: '#22C55E', sub: 'total booking' },
          { label: 'Perlu Check In',  value: pendingToday.length,     color: '#60A5FA', sub: 'belum check in' },
          { label: 'Sudah Check In',  value: checkedInToday.length,   color: '#34D399', sub: 'selesai hari ini' },
          { label: 'Besok',           value: tomorrowBookings.length,  color: '#A78BFA', sub: 'jadwal besok' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
            <p className="text-gray-600 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Search size={14} className="text-gray-500 flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari customer, plat, layanan..."
          className="bg-transparent text-sm text-white outline-none w-full placeholder-gray-600" />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-600 hover:text-white transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Hari Ini — Pending Check In */}
      <Section
        title="Hari Ini — Perlu Check In"
        count={pendingToday.length}
        color="#22C55E"
        empty="Tidak ada booking yang menunggu check in hari ini."
      >
        {pendingToday.map(b => (
          <BookingCard key={b.id} booking={b} onCheckIn={handleCheckIn} isToday />
        ))}
      </Section>

      {/* Hari Ini — Sudah Check In */}
      {checkedInToday.length > 0 && (
        <Section
          title="Hari Ini — Sudah Check In"
          count={checkedInToday.length}
          color="#34D399"
          empty=""
        >
          {checkedInToday.map(b => (
            <BookingCard key={b.id} booking={b} onCheckIn={handleCheckIn} isToday={false} />
          ))}
        </Section>
      )}

      {/* Besok */}
      <Section
        title="Besok"
        count={tomorrowBookings.length}
        color="#A78BFA"
        empty="Tidak ada booking untuk besok."
      >
        {tomorrowBookings.map(b => (
          <BookingCard key={b.id} booking={b} onCheckIn={handleCheckIn} isToday={false} />
        ))}
      </Section>

      {/* Upcoming */}
      {upcomingBookings.length > 0 && (
        <Section
          title="Mendatang"
          count={upcomingBookings.length}
          color="#60A5FA"
          empty=""
        >
          {upcomingBookings.slice(0, 6).map(b => (
            <BookingCard key={b.id} booking={b} onCheckIn={handleCheckIn} isToday={false} />
          ))}
        </Section>
      )}

      {/* Empty state total */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Inbox size={36} className="text-gray-700" />
          <p className="text-gray-500 text-sm">
            {search ? 'Tidak ada booking yang cocok.' : 'Belum ada booking yang dikonfirmasi.'}
          </p>
          <button onClick={() => navigate('/bookings')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold mt-2 transition-all hover:opacity-90"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
            Ke Booking Management <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      <AnimatePresence>
        {selected && (
          <CheckInConfirmModal
            booking={selected}
            onConfirm={handleConfirm}
            onCancel={() => setSelected(null)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  )
}
